import { describe, expect, it } from 'vitest';
import { emptyAccount, loadAccount, saveAccount, saveAccountRewards, validateAccount, ACCOUNT_KEY } from './account';
import type { ProfileStorage } from './profile';
import { createOblivionBattle, rollOblivionFragment, withMasterLoadouts } from './battle';
import { enemyCombatStats } from '../content/stat-growth';
import { loadout, measureBattle, progressAt } from '../../tools/battle-survey';
import { activityAccess } from './activity-access';
import { creatures, creatureLore, creatureLoot, getCreature } from '../content/creatures';
import { activityPrismaticaDrop } from '../content/prismatica';
import {
  gatesOfOblivionRules, oblivionConstructAtStage, oblivionConstructs, oblivionEncounter,
  oblivionEnemyLevel, oblivionFragmentDrop, oblivionLoot, oblivionMaterialDrops,
  oblivionMaterialIds, oblivionMaterialLoot,
} from '../content/gates-of-oblivion';
import { rollDrop } from '../content/loot-random';
import { freshGame, resolveOperation } from '../../supabase/functions/game-operation/engine';

function memoryStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(ACCOUNT_KEY, initial);
  let writes = 0;
  const storage: ProfileStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { writes++; values.set(key, value); },
    removeItem: key => { values.delete(key); },
  };
  return { storage, values, writes: () => writes, resetWrites: () => { writes = 0; } };
}

const entropy = { seed: () => 1729, random: () => .5,
  uuid: () => '00000000-0000-4000-8000-000000000001' };
function createRewardResult(stage: number) {
  const state = createOblivionBattle(stage, 1729, 'ember', { level: 0, evolution: 1 });
  state.phase = 'cleared';
  state.enemies.forEach(enemy => { enemy.hp = 0; });
  const events = state.enemies.map(enemy => ({
    kind: 'reward' as const, source: enemy.id, target: '', amount: activityPrismaticaDrop({ oblivion: { stage } }, enemy.level!).minimum,
    critical: false, materials: oblivionMaterialDrops(stage, () => 0), message: 'Saved Gates of Oblivion reward.',
  }));
  return { state, events };
}

describe('Gates of Oblivion', () => {
  it('uses the 25-floor Lv.140-180 curve, fixed construct tiers, and fifth-floor bosses', () => {
    expect(gatesOfOblivionRules).toMatchObject({ stages: 25, startingLevel: 140, maximumLevel: 180 });
    expect(oblivionEnemyLevel(1)).toBe(140);
    expect(oblivionEnemyLevel(25)).toBe(180);
    expect(Array.from({ length: 25 }, (_, index) => oblivionEnemyLevel(index + 1)))
      .toEqual([...Array(25)].map((_, index) => Math.round(140 + index * 40 / 24)));
    for (let stage = 1; stage <= 25; stage++) {
      expect(oblivionEncounter(stage).boss).toBe(stage % 5 === 0);
      expect(oblivionEncounter(stage).stats).toMatchObject({
        health: expect.any(Number), damage: expect.any(Number), defense: expect.any(Number),
      });
      const state = createOblivionBattle(stage, 21, 'ember', { level: 0, evolution: 1 });
      expect(state.enemies).toHaveLength(stage % 5 === 0 ? 1 : 2);
      for (const enemy of state.enemies) {
        expect(enemy.level).toBe(oblivionEnemyLevel(stage));
        expect(enemy.stats).toEqual(enemyCombatStats(oblivionEnemyLevel(stage), stage % 5 === 0));
      }
    }
    expect(new Set(Array.from({ length: 25 }, (_, index) => oblivionConstructAtStage(index + 1).id)).size).toBe(10);
    expect(oblivionConstructAtStage(24).id).toBe('oblivion:fatebreaker-warden');
    expect(oblivionConstructAtStage(25).id).toBe('oblivion:gatekeeper-of-oblivion');
    expect(oblivionEncounter(25).boss).toBe(true);
  });

  it('resolves pressured endpoint encounters with conditional non-Calamitic endgame squads', () => {
    const report = [];
    for (const roster of [['ember', 'tide', 'sprout'], ['elise', 'bruno', 'sprout']] as const) {
      const gear = loadout(roster, 'master5'), progress = progressAt(105);
      const team = Object.fromEntries(roster.map(id => [id, progress]));
      for (const floor of [1, 25]) for (const seed of [1, 1729, 104729]) {
        const encounter = createOblivionBattle(floor, seed, roster[0], progress, roster, team, gear.equipment, [], gear.upgrades);
        const { result } = measureBattle(withMasterLoadouts(encounter, gear.masters), 'native', { rounds: 100, decisions: 1800 });
        expect(result.outcome).not.toBe('timeout');
        report.push({ squad: roster.join('/'), floor, seed, level: encounter.enemies[0].level,
          stats: encounter.enemies[0].stats, outcome: result.outcome, rounds: result.rounds });
      }
    }
    if (process.env.OBLIVION_DIFFICULTY_REPORT === '1') process.stdout.write(`${JSON.stringify(report)}\n`);
  });

  it('registers ten original mixed-element Elemental-Devourers with distinct lore and delivered art', () => {
    expect(oblivionConstructs).toHaveLength(10);
    expect(new Set(oblivionConstructs.map(entry => entry.element)).size).toBe(6);
    const glossary = creatures.filter(creature => creature.oblivion);
    expect(glossary).toHaveLength(10);
    for (const construct of oblivionConstructs) {
      const creature = getCreature(construct.id);
      expect(creature).toMatchObject({ name: construct.name, element: construct.element, area: 'Gates of Oblivion' });
      expect(creature.art).toBe(`oblivion-${construct.id.slice('oblivion:'.length)}`);
      expect(creatureLore(creature)).toContain(construct.lore);
      expect(creatureLore(creature)).toContain("Rise's creation, seeking her soul");
      expect(creatureLoot(creature, creature.stages[0]).some(drop => drop.id.startsWith('capture:'))).toBe(false);
    }
    expect(oblivionConstructAtStage(1).skill).toContain('Calamity');
    expect(createOblivionBattle(1, 21, 'ember', { level: 0, evolution: 1 }).enemies[0].enemySkills).toHaveLength(1);
    expect(createOblivionBattle(20, 21, 'ember', { level: 0, evolution: 1 }).enemies[0].enemySkills).toHaveLength(2);
    expect(createOblivionBattle(25, 21, 'ember', { level: 0, evolution: 1 }).enemies[0].enemySkills?.[1].name)
      .toBe(oblivionConstructAtStage(25).secondSkill);
  });

  it('unlocks Calamity-chain materials at the approved floors and scales their shared ranges', () => {
    for (const [stage, ids] of [[1, ['calamity-common', 'calamity-uncommon']],
      [4, [...oblivionMaterialIds.slice(0, 3)]], [9, [...oblivionMaterialIds.slice(0, 4)]],
      [14, [...oblivionMaterialIds.slice(0, 5)]], [19, [...oblivionMaterialIds]] ] as const) {
      expect(oblivionMaterialLoot(stage).map(drop => drop.id)).toEqual(ids);
    }
    expect(oblivionMaterialLoot(1).map(({ minimum, maximum }) => [minimum, maximum])).toEqual([[1, 1], [1, 1]]);
    expect(oblivionMaterialLoot(25).map(({ minimum, maximum }) => [minimum, maximum]))
      .toEqual([[5, 6], [4, 4], [3, 4], [2, 3], [2, 2], [1, 2]]);
    expect(oblivionMaterialDrops(25, () => 0)).toEqual({
      'calamity-common': 5, 'calamity-uncommon': 4, 'calamity-rare': 3,
      'calamity-epic': 2, 'calamity-legendary': 2, 'calamity-omnic': 1,
    });
  });

  it('uses dungeon-style Prismatica and a separate 10% late fragment roll with boss guarantee', () => {
    expect(oblivionLoot(1).find(drop => drop.id === 'fractalis')).toMatchObject({ minimum: 5, maximum: 10, chance: 1 });
    expect(oblivionLoot(25).find(drop => drop.id === 'fractalis')).toMatchObject({ minimum: 300, maximum: 600, chance: 1 });
    expect(oblivionFragmentDrop(19)).toBeUndefined();
    const ordinary = oblivionFragmentDrop(20, false)!;
    expect(ordinary).toMatchObject({ minimum: 1, maximum: 1, chance: .1 });
    expect(rollDrop(ordinary, () => .099)).toBe(1);
    expect(rollDrop(ordinary, () => .1)).toBeUndefined();
    expect(rollDrop(oblivionFragmentDrop(20, true)!, () => .99)).toBe(1);
    for (const drop of oblivionLoot(20)) expect(drop.id).not.toBe('lycalis');
    expect(oblivionLoot(20).some(drop => drop.id.startsWith('capture:'))).toBe(false);
    const state = createOblivionBattle(20, 123, 'ember', { level: 0, evolution: 1 });
    const combatSeed = state.seed, rewardSeed = state.rewardSeed, fragmentSeed = state.oblivionSeed;
    expect([undefined, 1]).toContain(rollOblivionFragment(state, false));
    expect(state.seed).toBe(combatSeed);
    expect(state.rewardSeed).toBe(rewardSeed);
    expect(state.oblivionSeed).not.toBe(fragmentSeed);
  });

  it('keeps new-wallet progress optional and read-only until a real floor clear', () => {
    const raw = JSON.stringify({ ...emptyAccount(), version: 10 });
    const store = memoryStorage(raw);
    expect(loadAccount(store.storage).oblivionStage).toBeUndefined();
    expect(store.values.get(ACCOUNT_KEY)).toBe(raw);
    expect(store.writes()).toBe(0);
    expect(() => validateAccount({ ...emptyAccount(), oblivionStage: 26 })).toThrow('Gates of Oblivion');
  });

  it('gates access in UI and server entry until Calamitic ownership, and rejects locked floors', () => {
    let game = resolveOperation(freshGame('oblivion-access'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    const activity = { kind: 'oblivion' as const, stage: 1 };
    expect(activityAccess(game.account, activity)).toMatchObject({ unlocked: false, requirement: 'Own any Calamitic Element-Bearer' });
    expect(() => resolveOperation(game, { kind: 'enter', activity }, entropy)).toThrow('Activity locked');
    game.account.characters.ozriel = { level: 0, evolution: 1 };
    expect(resolveOperation(game, { kind: 'enter', activity }, entropy).game.run?.session.state.oblivion).toEqual({ stage: 1 });
    expect(() => resolveOperation(game, { kind: 'enter', activity: { kind: 'oblivion', stage: 2 } }, entropy)).toThrow('Activity locked');
    expect(() => resolveOperation(game, { kind: 'enter', activity: { kind: 'oblivion', stage: 26 } }, entropy)).toThrow('Gates of Oblivion floor');
  });

  it('saves per-kill currency, materials, discovery, receipts and the next floor in one write', () => {
    const store = memoryStorage();
    const account = emptyAccount();
    account.characters.ozriel = { level: 0, evolution: 1 };
    saveAccount(store.storage, account);
    store.resetWrites();
    const result = createRewardResult(1);
    const saved = saveAccountRewards(store.storage, result, 'oblivion-run');
    expect(store.writes()).toBe(1);
    expect(saved.oblivionStage).toBe(2);
    expect(saved.fractalis).toBe(10);
    expect(saved.materials['calamity-common']).toBe(2);
    expect(saved.materials['calamity-uncommon']).toBe(2);
    expect(saved.creatures['oblivion:shardling-acolyte']).toEqual({ defeated: true });
    expect(saved.receipts).toEqual(['oblivion-run:oblivion-1-0', 'oblivion-run:oblivion-1-1']);
    expect(saved.capturedCharacters).toBeUndefined();
    expect(saved.lycalis).toBe(0);
  });

  it('rejects forged sources, malformed loot and unauthorized rewards without a partial save', () => {
    const account = emptyAccount();
    account.characters.ozriel = { level: 0, evolution: 1 };
    const store = memoryStorage();
    saveAccount(store.storage, account);
    const original = store.values.get(ACCOUNT_KEY);
    const forgedSource = createRewardResult(1);
    forgedSource.state.enemies[0].creatureId = 'oblivion:gatekeeper-of-oblivion';
    expect(() => saveAccountRewards(store.storage, forgedSource, 'forged-source')).toThrow('enemy source');
    const forgedLoot = createRewardResult(1);
    forgedLoot.events[0].materials!['fragment-of-rise'] = 1;
    expect(() => saveAccountRewards(store.storage, forgedLoot, 'forged-loot')).toThrow('Fragment of Rise');
    const locked = createRewardResult(2);
    expect(() => saveAccountRewards(store.storage, locked, 'locked')).toThrow('locked Gates of Oblivion');
    expect(store.values.get(ACCOUNT_KEY)).toBe(original);
    const denied = memoryStorage(original);
    denied.storage.setItem = () => { throw new Error('Storage denied'); };
    expect(() => saveAccountRewards(denied.storage, createRewardResult(1), 'denied')).toThrow('Storage denied');
    expect(denied.values.get(ACCOUNT_KEY)).toBe(original);
  });
});
