import { describe, expect, it, vi } from 'vitest';
import { bossLootMultiplier, bossLootRange } from '../content/final-boss-loot';
import { infusionStageCount, type InfusionModeId } from '../content/activities';
import { playableDungeons } from '../content/dungeons';
import { elementalWars, warLoot, warStageCount } from '../content/elemental-war';
import { fractalisDrop, storyFractalisDrop, treasuryFractalisDrop, rollDrop, rollStagedLycalis, stagedLycalisOdds } from '../content/loot-random';
import { storyBossBonus, storyRegions } from '../content/story';
import { creatureLoot, getCreature } from '../content/creatures';
import { act, createBattle, createDungeonBattle, createInfusionBattle, createStoryBattle, createWarBattle, type BattleState } from './battle';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';

const progress = { level: 105, evolution: 6 };
const modes: InfusionModeId[] = ['heavens', 'abyss', 'treasury', 'sanctuary', 'roses', 'machines'];
const cases = [
  ...storyRegions.map((_, i) => ({ name: `Story region ${i + 1}`, create: () => createStoryBattle((i + 1) * 25, 1729, 'ember', progress) })),
  ...playableDungeons.map(element => ({ name: `${element} dungeon`, create: () => createDungeonBattle(element, 35, 1729, 'ember', progress) })),
  ...modes.map(mode => ({ name: mode, create: () => createInfusionBattle(mode, infusionStageCount(mode), 1729, 'ember', progress) })),
  ...elementalWars.map(war => ({ name: war.character, create: () => createWarBattle(war.character, warStageCount, 1729, 'ember', progress) })),
];

function clear(state: BattleState) {
  state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
  state.rewardSeed = 0;
  state.conduitSeed = 0;
  state.componentSeed = 0;
  state.lycalisSeed = state.war ? 1 : 15500;
  state.captureSeed = 0x80000000;
  state.recruitmentSeed = 0x80000000;
  state.masterChestSeed = 0;
  return act(state, 'ember', 'light', state.enemies[0].id);
}

function storage(storyCompleted = 150, fractalis = 0) {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const saved: ProfileStorage = { getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
  saveAccount(saved, { ...emptyAccount(), storyCompleted, fractalis,
    infusionStages: { machines: 100 }, warStages: { nerithe: 10, orvella: 10, vaelor: 10 } });
  return saved;
}

describe('repeatable final-boss 5x quantity contract', () => {
  it.each(cases)('awards exact boosted quantities, saves once and matches live loot for $name', ({ create }) => {
    const state = create();
    expect(state.enemies).toHaveLength(1);
    expect(state.enemies[0].boss).toBe(true);
    expect(bossLootMultiplier(state)).toBe(5);
    const result = clear(state);
    expect(result.state.phase).toBe('cleared');
    const rewards = result.events.filter(event => event.kind === 'reward');
    expect(rewards).toHaveLength(1);
    const reward = rewards[0];
    const level = state.enemies[0].level!;
    const expectedCurrency = state.war ? warLoot(state.war.stage).fractalis.minimum
      : 5 * (state.story ? storyFractalisDrop(level) : state.infusion?.mode === 'treasury'
        ? treasuryFractalisDrop(level) : fractalisDrop(level, state.infusion?.mode === 'roses' ? 140 : 120)).minimum;
    expect(reward.amount).toBe(expectedCurrency);
    for (const quantity of Object.values(reward.materials ?? {})) {
      expect(quantity % 5).toBe(0);
      expect(quantity).toBeGreaterThanOrEqual(5);
    }
    if (state.dungeon || state.infusion?.mode === 'heavens' || state.infusion?.mode === 'abyss' || state.infusion?.mode === 'roses') {
      expect(Object.values(reward.materials!)).toEqual(Array(Object.keys(reward.materials!).length).fill(15));
    }
    if (state.infusion?.mode === 'machines') {
      expect(reward.mechanicalComponents).toBe(625);
      expect(Object.values(reward.conduits!)).toEqual([1, 1, 1]);
      expect(reward.masterChests).toBe(1);
    }
    expect(reward.capture).toBeUndefined();
    expect(reward.recruitment).toBeUndefined();
    if (state.war || state.infusion?.mode === 'sanctuary') expect(reward.lycalis).toBe(25);
    if (state.infusion?.mode === 'heavens' || state.infusion?.mode === 'abyss') expect(reward.lycalis).toBe(15);
    if (!state.war) {
      const stage = state.story?.storyStage ?? state.dungeon?.stage ?? state.infusion!.stage;
      const loot = creatureLoot(getCreature(state.enemies[0].creatureId!), stage);
      expect(loot.find(drop => drop.id === 'fractalis')?.minimum).toBe(reward.amount);
      for (const [id, amount] of Object.entries(reward.materials ?? {})) {
        expect(loot.find(drop => drop.id === id)?.minimum).toBe(amount);
      }
    }
    const saved = storage();
    const write = vi.spyOn(saved, 'setItem');
    const account = saveAccountRewards(saved, result, 'final');
    expect(write).toHaveBeenCalledOnce();
    expect(account.fractalis).toBe(expectedCurrency);
    expect(saveAccountRewards(saved, result, 'final')).toEqual(account);
    expect(write).toHaveBeenCalledOnce();
    expect(saveAccountRewards(saved, clear(create()), 'replay').fractalis).toBe(expectedCurrency * 2);
    expect(write).toHaveBeenCalledTimes(2);
  });

  it('excludes Training, earlier bosses and nonboss encounters at endpoints', () => {
    expect(bossLootMultiplier(createBattle())).toBe(1);
    for (const stage of [1, 24, 26, 49, 149]) expect(bossLootMultiplier({ story: { storyStage: stage } })).toBe(1);
    expect(bossLootMultiplier({ dungeon: { stage: 30 } })).toBe(1);
    for (const mode of modes) expect(bossLootMultiplier({ infusion: { mode, stage: infusionStageCount(mode) - 5 } })).toBe(1);
    expect(bossLootMultiplier({ war: { stage: warStageCount - 1 } })).toBe(1);
    for (const { create } of cases) expect(bossLootMultiplier(create(), false)).toBe(1);
  });

  it('multiplies the exact sampled quantity, preserving chances and RNG draw count', () => {
    for (const chance of [1, .98, .35, .01]) for (const roll of [0, .25, .5, .999999999]) {
      const base = { minimum: 3, maximum: 6, chance };
      const originalRoll = vi.fn(() => roll);
      const boostedRoll = vi.fn(() => roll);
      const original = rollDrop(base, originalRoll);
      expect(rollDrop(bossLootRange(base, 5), boostedRoll)).toBe(original === undefined ? undefined : original * 5);
      expect(boostedRoll).toHaveBeenCalledTimes(originalRoll.mock.calls.length);
    }
    expect(bossLootRange({ minimum: 3, maximum: 6 }, 1)).toEqual({ minimum: 3, maximum: 6 });
    expect(() => bossLootRange({ minimum: Number.MAX_SAFE_INTEGER, maximum: Number.MAX_SAFE_INTEGER }, 5)).toThrow();
    expect(() => rollDrop({ minimum: 16, maximum: 30, chance: 1, quantityMultiplier: 5 }, () => 0)).toThrow();
  });

  it('preserves all premium outcome chances and scales only terminal amounts', () => {
    for (const mode of ['heavens', 'abyss', 'sanctuary'] as const) {
      const stage = infusionStageCount(mode);
      const original = stagedLycalisOdds(mode, 120);
      expect(stagedLycalisOdds(mode, 120, stage)).toEqual(original.map(drop => ({ ...drop, amount: drop.amount * 5 })));
      expect(stagedLycalisOdds(mode, 120, stage - 5)).toEqual(original);
      for (const roll of [0, .74999999, .75, .85, .94999999, .95, .99999999]) {
        const baseRoll = vi.fn(() => roll);
        const finalRoll = vi.fn(() => roll);
        expect(rollStagedLycalis(mode, 120, finalRoll, stage)).toBe(5 * rollStagedLycalis(mode, 120, baseRoll));
        expect(finalRoll).toHaveBeenCalledOnce();
        expect(baseRoll).toHaveBeenCalledOnce();
      }
    }
  });

  it.each([25, 50, 75, 100, 125, 150])('keeps regional first-clear bonuses separate from boosted replay loot at stage %s', stage => {
    const saved = storage(stage - 1);
    const result = clear(createStoryBattle(stage, 1729, 'ember', progress));
    const ordinary = result.events.find(event => event.kind === 'reward')!.amount;
    const bonus = storyBossBonus(stage);
    const first = saveAccountRewards(saved, result, 'first');
    expect(first.fractalis).toBe(ordinary + bonus.fractalis);
    expect(first.lycalis).toBe(bonus.lycalis);
    const second = saveAccountRewards(saved, clear(createStoryBattle(stage, 1729, 'ember', progress)), 'again');
    expect(second.fractalis).toBe(ordinary * 2 + bonus.fractalis);
    expect(second.lycalis).toBe(bonus.lycalis);
  });

  it('rejects forged currency, material and premium quantities atomically', () => {
    const saved = storage();
    const raw = saved.getItem(ACCOUNT_KEY);
    const dungeon = clear(createDungeonBattle('infernic', 35, 1729, 'ember', progress));
    const reward = dungeon.events.find(event => event.kind === 'reward')!;
    const currency = structuredClone(dungeon);
    currency.events.find(event => event.kind === 'reward')!.amount++;
    expect(() => saveAccountRewards(saved, currency, 'bad-currency')).toThrow('Prismatica');
    const materials = structuredClone(dungeon);
    materials.events.find(event => event.kind === 'reward')!.materials!['infernic-common']++;
    expect(() => saveAccountRewards(saved, materials, 'bad-material')).toThrow('material');
    const premium = clear(createInfusionBattle('sanctuary', 25, 1729, 'ember', progress));
    premium.events.find(event => event.kind === 'reward')!.lycalis = 5;
    expect(() => saveAccountRewards(saved, premium, 'bad-premium')).toThrow('Null-Prismatica');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(loadAccount(saved).receipts).toHaveLength(0);
    expect(reward.amount).toBe(75);
  });

  it('preserves the complete wallet on boosted reward overflow or denied persistence', () => {
    const result = clear(createInfusionBattle('machines', 100, 1729, 'ember', progress));
    const overflow = storage(150, Number.MAX_SAFE_INTEGER);
    const raw = overflow.getItem(ACCOUNT_KEY);
    expect(() => saveAccountRewards(overflow, result, 'overflow')).toThrow();
    expect(overflow.getItem(ACCOUNT_KEY)).toBe(raw);
    const denied = storage();
    const before = denied.getItem(ACCOUNT_KEY);
    vi.spyOn(denied, 'setItem').mockImplementation(() => { throw new Error('Write denied'); });
    expect(() => saveAccountRewards(denied, result, 'denied')).toThrow('Write denied');
    expect(denied.getItem(ACCOUNT_KEY)).toBe(before);
  });
});
