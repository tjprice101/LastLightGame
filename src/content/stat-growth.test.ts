import { describe, expect, it } from 'vitest';
import { enemyGrowth, enemyStat } from './stat-growth';
import { dungeonEncounter, playableDungeons } from './dungeons';
import { infusionEncounter } from './infusions';
import { act, actionUnavailable, createBattle, createDungeonBattle, createInfusionBattle, endTurn, nextWave } from '../game/battle';
import { starters } from './starters';

describe('accelerating enemy stat curves', () => {
  it('keeps opening values, doubles initial health/attack growth and reaches exact endgame thresholds', () => {
    expect(enemyStat(110, 200_000, 1, 1, .24)).toBe(110);
    expect(enemyStat(110, 200_000, 2, 1, .24)).toBe(136);
    let last = 0;
    for (let level = 10; level <= 120; level++) {
      const health = enemyStat(55, 200_000, level, 10, .024);
      expect(health).toBeGreaterThanOrEqual(last);
      expect(health).toBeGreaterThanOrEqual(Math.round(55 * (1 + (level - 10) * .024)));
      last = health;
    }
    expect(last).toBe(200_000);
    expect(enemyStat(55, 200_000, 500, 10, .024)).toBe(200_000);
    for (const level of [0, 1.5, NaN, Infinity]) expect(() => enemyStat(55, 200_000, level, 10, .024)).toThrow();
  });

  it('applies the same endpoints to shortened dungeons, both infusion modes and Adventure', () => {
    for (const element of playableDungeons) {
      expect(dungeonEncounter(element, 34).stats.health).toBeLessThan(200_000);
      expect(dungeonEncounter(element, 35).stats).toMatchObject({ health: 400_000, damage: 6_000, defense: 2_250 });
    }
    for (const mode of ['heavens', 'abyss'] as const) expect(infusionEncounter(mode, 35).stats.health).toBe(400_000);
    let state = createBattle();
    for (let wave = 1; wave < 120; wave++) {
      state.phase = 'cleared';
      state.enemies.forEach((enemy) => { enemy.hp = 0; });
      state = nextWave(state).state;
    }
    expect(state.enemies.every((enemy) => enemy.level === 120 && enemy.stats.health === enemyGrowth.health)).toBe(true);
  });

  it.each(starters)('$name can clear max-level dungeon and infusion bosses before equipment across three seeds', (starter) => {
    const progress = { level: 105, evolution: 6 };
    for (const seed of [1, 1729, 12345]) {
      for (const initial of [createDungeonBattle(starter.elementId, 35, seed, starter.id, progress),
        createInfusionBattle('heavens', 35, seed, starter.id, progress), createInfusionBattle('abyss', 35, seed, starter.id, progress)]) {
        let state = initial;
        for (let turn = 0; state.phase === 'player' && turn < 100; turn++) {
          const actor = state.allies[0];
          const action = (['ultimate', 'skill1', 'light'] as const).find((id) => !actionUnavailable(state, actor, id));
          if (action) state = act(state, actor.id, action, state.enemies.find((enemy) => enemy.hp > 0)!.id).state;
          if (state.phase === 'player') state = endTurn(state).state;
        }
        expect(state.phase, `${starter.name}, seed ${seed}, ${initial.infusion?.mode ?? 'dungeon'}`).toBe('cleared');
      }
    }
  });
});
