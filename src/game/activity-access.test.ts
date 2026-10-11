import { describe, expect, it } from 'vitest';
import { emptyAccount } from './account';
import { activityAccess, assertActivityAccess, highestBearerLevel } from './activity-access';
import { createCreatureCopy } from './character-instances';
import { freshGame, resolveOperation } from '../../supabase/functions/game-operation/engine';
import type { Activity } from '../online/server-game';
import { infusionEncounter, infusionLoot } from '../content/infusions';
import { createInfusionBattle } from './battle';

const gates: readonly [Activity, number, number][] = [
  [{ kind: 'training' }, 0, 1], [{ kind: 'story', stage: 1 }, 0, 1],
  [{ kind: 'infusion', mode: 'machines', stage: 1 }, 10, 1],
  [{ kind: 'dungeon', element: 'infernic', stage: 1 }, 30, 1],
  [{ kind: 'infusion', mode: 'heavens', stage: 1 }, 50, 3],
  [{ kind: 'infusion', mode: 'abyss', stage: 1 }, 50, 3],
  [{ kind: 'infusion', mode: 'treasury', stage: 1 }, 60, 3],
  [{ kind: 'infusion', mode: 'sanctuary', stage: 1 }, 60, 3],
  [{ kind: 'infusion', mode: 'roses', stage: 1 }, 75, 4],
  [{ kind: 'war', character: 'nerithe', stage: 1 }, 85, 5],
];
const entropy = { seed: () => 1729, random: () => .5, uuid: () => '00000000-0000-4000-8000-000000000001' };

describe('highest-owned Element-Bearer activity access', () => {
  it.each(gates)('enforces %j at Lv.%i in presentation and server', (activity, level, evolution) => {
    const account = emptyAccount();
    account.characters.ember = { level, evolution };
    account.storyCompleted = 25;
    expect(activityAccess(account, activity).unlocked).toBe(true);
    const game = resolveOperation(freshGame('gate-test'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    game.account = structuredClone(account);
    expect(resolveOperation(game, { kind: 'enter', activity }, entropy).game.run).not.toBeNull();
    if (level === 0) return;
    account.characters.ember.level = level - 1;
    game.account = structuredClone(account);
    const before = JSON.stringify(game);
    expect(activityAccess(account, activity).unlocked).toBe(false);
    expect(() => assertActivityAccess(account, activity)).toThrow('Activity locked');
    expect(() => resolveOperation(game, { kind: 'enter', activity }, entropy)).toThrow('Activity locked');
    expect(JSON.stringify(game)).toBe(before);
  });

  it('counts unequipped bearers outside the squad, never captured levels', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    account.characters.tide = { level: 50, evolution: 3 };
    account.squad = ['ember'];
    expect(highestBearerLevel(account)).toBe(50);
    delete account.characters.tide;
    account.capturedCharacters = [createCreatureCopy('infusion:abyss:5', 31, 120)];
    account.squad = [account.capturedCharacters[0].instanceId];
    expect(highestBearerLevel(account)).toBe(0);
    expect(activityAccess(account, { kind: 'infusion', mode: 'abyss', stage: 1 }).unlocked).toBe(false);
  });

  it('requires the first Story region for Machines even above the level gate', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 30, evolution: 1 };
    const activity = { kind: 'infusion', mode: 'machines', stage: 1 } as const;
    account.storyCompleted = 24;
    expect(activityAccess(account, activity).unlocked).toBe(false);
    account.storyCompleted = 25;
    expect(activityAccess(account, activity).unlocked).toBe(true);
  });

  it('makes evolution fodder and specialties available before each progression cap', () => {
    for (const mode of ['heavens', 'abyss'] as const) {
      for (const [stage, tier, level] of [[13, 2, 65], [19, 3, 75], [25, 4, 85]]) {
        expect(infusionEncounter(mode, stage)).toMatchObject({ tier, level, boss: stage % 5 === 0 });
      }
      expect(infusionEncounter(mode, 1).level).toBe(50);
      expect(infusionEncounter(mode, 35).level).toBe(120);
      expect(infusionLoot(mode, 19).specialties.map(drop => drop.id))
        .toEqual([`${mode}-weapon`, `${mode}-evolution`, `${mode}-level`]);
    }
  });

  it('preserves old active infusion levels/rewards through Continue and Retry without applying new entry locks', () => {
    let game = resolveOperation(freshGame('legacy-run'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    const progress = { level: 50, evolution: 3 };
    game.account.characters.ember = progress;
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'infusion', mode: 'heavens', stage: 1 } }, entropy).game;
    expect(game.run!.session.state.enemies[0].level).toBe(50);
    const legacy = createInfusionBattle('heavens', 1, 1, 'ember', progress, ['ember'], { ember: progress }, {}, [], {}, 'legacy');
    delete legacy.infusion!.schedule;
    legacy.enemies.forEach(enemy => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
    game.run!.session.state = legacy;
    const before = JSON.stringify(game);
    expect(resolveOperation(game, { kind: 'read' }, entropy).game).toEqual(game);
    expect(JSON.stringify(game)).toBe(before);
    const runId = game.run!.session.runId;
    game = resolveOperation(game, { kind: 'endTurn', runId }, entropy).game;
    expect(game.run!.session.state.phase).toBe('cleared');
    expect(game.account.capturedCharacters?.every(copy => copy.level === 80)).toBe(true);
    game.account.characters.ember = { level: 0, evolution: 1 };
    game = resolveOperation(game, { kind: 'continue', runId }, entropy).game;
    expect(game.run!.session.state.infusion?.schedule).toBe('legacy');
    expect(game.run!.session.state.enemies[0].level).toBe(81);
    expect(game.run!.session.state.allies[0].level).toBe(50);
    game.run!.session.state.phase = 'defeat';
    game = resolveOperation(game, { kind: 'retry', runId }, entropy).game;
    expect(game.run!.session.state.enemies[0].level).toBe(81);
    expect(game.run!.session.state.allies[0].level).toBe(50);
  });
});
