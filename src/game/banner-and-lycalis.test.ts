import { describe, expect, it } from 'vitest';
import { standardBanner, standardBannerPool, bannerPercent } from '../content/standard-banner';
import { infusionLycalisOdds, rollInfusionLycalis } from '../content/loot-random';
import { creatureLoot, getCreature } from '../content/creatures';
import { act, createBattle, createDungeonBattle, createInfusionBattle, endTurn } from './battle';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards, summonCharacter } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { lootArt, lootItems } from '../presentation/battle-loot';
import { battleResults, encounterRewards } from '../presentation/battle-results';
import { creatureGlossary } from '../presentation/creature-glossary';
import { summonHub } from '../presentation/roster';

function storage(): ProfileStorage {
  const map = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => { map.set(key, value); },
    removeItem: (key) => { map.delete(key); } };
}
function kills(mode: 'heavens' | 'abyss', boss = false, burn = true) {
  const state = createInfusionBattle(mode, boss ? 35 : 1, 1, 'ember', { level: 105, evolution: 6 });
  // First xorshift(15872) is above .99, guaranteeing the three-Lycalis outcome.
  state.lycalisSeed = 15872;
  state.enemies.forEach((enemy) => {
    enemy.hp = 1;
    if (burn) enemy.burn = { damage: 1, turns: 1 };
  });
  state.allies[0].shatter = 100;
  return { state, result: burn ? endTurn(state) : act(state, 'ember', 'skill2', state.enemies[0].id) };
}

describe('Phase8 Lycalis rewards and gated Standard Banner', () => {
  it('publishes exact endpoints and linearly scaled normalized probabilities at every enemy level', () => {
    expect(infusionLycalisOdds(80).map((entry) => entry.chance)).toEqual([.9, .08, .015, .005]);
    for (let level = 80; level <= 120; level++) {
      const odds = infusionLycalisOdds(level);
      expect(odds.reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(1, 14);
      const growth = (level - 80) / 40;
      for (const [index, start, end] of [[0, .9, .75], [1, .08, .1], [2, .015, .1], [3, .005, .05]]) {
        expect(odds[index].chance).toBeCloseTo(start + (end - start) * growth, 14);
      }
      let boundary = 0;
      for (let index = 0; index < 3; index++) {
        boundary += odds[index].chance;
        expect(rollInfusionLycalis(level, () => boundary - 1e-10)).toBe(index);
        expect(rollInfusionLycalis(level, () => boundary)).toBe(index + 1);
      }
    }
    expect(rollInfusionLycalis(80, () => 0)).toBe(0);
    expect(rollInfusionLycalis(120, () => .9999999)).toBe(3);
    for (const level of [79, 121, NaN, 80.5]) expect(() => infusionLycalisOdds(level)).toThrow();
    for (const roll of [-1, 1, NaN, Infinity]) expect(() => rollInfusionLycalis(100, () => roll)).toThrow('[0, 1)');
  });
  it.each(['heavens', 'abyss'] as const)('%s persists burn/AOE and boss premium rewards atomically, deduplicates and preserves existing reward RNG', (mode) => {
    for (const boss of [false, true]) for (const burn of [false, true]) {
      const { state, result } = kills(mode, boss, burn);
      const premium = result.events.filter((entry) => entry.kind === 'reward').reduce((sum, entry) => sum + (entry.lycalis ?? 0), 0);
      expect(premium).toBeGreaterThanOrEqual(3);
      const noPremium = structuredClone(state);
      noPremium.lycalisSeed = 1;
      const alternate = burn ? endTurn(noPremium) : act(noPremium, 'ember', 'skill2', noPremium.enemies[0].id);
      const drops = (events: typeof result.events) => events.filter((entry) => entry.kind === 'reward').map((entry) => [entry.amount, entry.materials, entry.capture]);
      expect(drops(alternate.events)).toEqual(drops(result.events));
      expect(alternate.state.seed).toBe(result.state.seed);
      expect(alternate.state.rewardSeed).toBe(result.state.rewardSeed);
      expect(alternate.state.captureSeed).toBe(result.state.captureSeed);
      expect(alternate.events.some((entry) => entry.lycalis)).toBe(false);
      const saved = storage();
      const initial = emptyAccount();
      initial.lycalis = 10;
      saveAccount(saved, initial);
      const before = saved.getItem(ACCOUNT_KEY);
      const write = saved.setItem;
      saved.setItem = () => { throw new Error('Write denied'); };
      expect(() => saveAccountRewards(saved, result, 'run')).toThrow('Write denied');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      saved.setItem = write;
      const account = saveAccountRewards(saved, result, 'run');
      expect(account.lycalis).toBe(10 + premium);
      expect(loadAccount(saved)).toEqual(account);
      expect(saveAccountRewards(saved, result, 'run')).toEqual(account);
      expect(encounterRewards([...result.events, ...result.events]).find((item) => item.id === 'lycalis')?.amount).toBe(premium);
      const reward = result.events.find((entry) => entry.lycalis)!;
      const item = lootItems(reward).find((entry) => entry.id === 'lycalis')!;
      expect(lootArt(item)).toContain('currencies/lycalis.png');
      expect(battleResults(result.state, result.events)).toContain('Lycalis');
    }
  });
  it('rejects forged premium rewards, alive sources and overflowing balances without touching saves', () => {
    const { result } = kills('heavens');
    for (const amount of [0, 4, -1, 1.5, NaN]) {
      const forged = structuredClone(result);
      forged.events.find((entry) => entry.kind === 'reward')!.lycalis = amount;
      const saved = storage();
      expect(() => saveAccountRewards(saved, forged, 'bad')).toThrow('Invalid enemy Lycalis');
      expect(saved.getItem(ACCOUNT_KEY)).toBeNull();
    }
    const living = structuredClone(result);
    living.state.enemies[0].hp = 1;
    expect(() => saveAccountRewards(storage(), living, 'alive')).toThrow('Lycalis');
    const saved = storage();
    const account = emptyAccount();
    account.lycalis = Number.MAX_SAFE_INTEGER;
    saveAccount(saved, account);
    const before = saved.getItem(ACCOUNT_KEY);
    expect(() => saveAccountRewards(saved, result, 'overflow')).toThrow();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
  });
  it('advances the premium stream once per new kill and never rerolls an already-dead enemy', () => {
    const { state } = kills('heavens');
    state.enemies[1].hp = state.enemies[1].stats.health;
    state.enemies[1].burn = { damage: 0, turns: 0 };
    const result = endTurn(state);
    let expected = 15872;
    expected ^= expected << 13;
    expected ^= expected >>> 17;
    expected ^= expected << 5;
    expect(result.state.lycalisSeed).toBe(expected >>> 0);
    expect(result.events.filter((entry) => entry.kind === 'reward')).toHaveLength(1);
    expect(result.events.find((entry) => entry.kind === 'reward')?.lycalis).toBe(3);
    expect(endTurn(structuredClone(state))).toEqual(result);
    const later = endTurn(result.state);
    expect(later.events.filter((entry) => entry.kind === 'reward')).toHaveLength(0);
    expect(later.state.lycalisSeed).toBe(result.state.lycalisSeed);
  });
  it('never awards Lycalis in Adventure or elemental dungeons and rejects forged mode rewards', () => {
    for (const state of [createBattle(1), createDungeonBattle('infernic', 35, 1, 'ember', { level: 105, evolution: 6 })]) {
      state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
      const result = endTurn(state);
      expect(result.events.every((entry) => entry.lycalis === undefined)).toBe(true);
      result.events.find((entry) => entry.kind === 'reward')!.lycalis = 1;
      expect(() => saveAccountRewards(storage(), result, 'forged')).toThrow('Lycalis');
    }
  });
  it('publishes mutually exclusive exact Lycalis amounts in each stage glossary', () => {
    for (const mode of ['heavens', 'abyss'] as const) for (let tier = 0; tier < 6; tier++) {
      const creature = getCreature(`infusion:${mode}:${tier}`);
      for (const stage of creature.stages) {
        const loot = creatureLoot(creature, stage).filter((entry) => entry.id === 'lycalis');
        expect(loot.map((entry) => [entry.minimum, entry.maximum])).toEqual([[1, 1], [2, 2], [3, 3]]);
        expect(loot.every((entry) => entry.note?.includes('mutually exclusive'))).toBe(true);
      }
    }
    const account = emptyAccount();
    account.creatures['infusion:heavens:0'] = { defeated: true };
    expect(creatureGlossary(account)).toContain('Lycalis');
    expect(creatureGlossary(account)).toContain('mutually exclusive');
  });
  it('defines fifteen real entries with a 1% total5-star tier and normalized 50:30:17 creature weights', () => {
    const pool = standardBannerPool();
    expect(pool).toHaveLength(15);
    expect(new Set(pool.map((entry) => entry.id)).size).toBe(15);
    expect(pool.reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(1, 14);
    const characters = pool.filter((entry) => entry.kind === 'character');
    expect(characters.map((entry) => entry.id)).toEqual(['ember', 'tide', 'sprout']);
    expect(characters.reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(.01, 14);
    expect(characters.every((entry) => entry.chance === .01 / 3)).toBe(true);
    for (const [index, stars] of [1, 2, 3].entries()) {
      const tier = pool.filter((entry) => entry.stars === stars);
      expect(tier).toHaveLength(4);
      expect(tier[0].chance).toBe(tier[1].chance);
      expect(tier.reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(.99 * [50, 30, 17][index] / 97, 14);
    }
    expect(pool.some((entry) => Number(entry.stars) === 4 || Number(entry.stars) === 6)).toBe(false);
    expect(bannerPercent(1)).toBe('100%');
    expect(bannerPercent(.01 / 3)).toBe('0.333333%');
  });
  it('keeps base odds unchanged by ownership, with active draws and defined duplicate reward', () => {
    const saved = storage();
    const account = emptyAccount();
    account.lycalis = 100;
    for (const owned of [false, true]) {
      if (owned) account.characters = { ember: { level: 30, evolution: 2 }, tide: { level: 75, evolution: 4 }, sprout: { level: 105, evolution: 6 } };
      saveAccount(saved, account);
      const before = saved.getItem(ACCOUNT_KEY);
      expect(() => summonCharacter(saved, () => NaN)).toThrow('[0, 1)');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      const html = summonHub(account);
      expect(html.match(/data-banner-entry=/g)).toHaveLength(15);
      expect(html).toContain('0.333333% per draw');
      expect(html).not.toContain('disabled');
      expect(html).toContain('highest-rarity crowned slime');
      expect(html).not.toContain('All Element-Bearers owned');
    }
    expect(standardBanner.available).toBe(true);
    expect(standardBanner.duplicateReward.creatureId).toBe('infusion:treasury:5');
    expect(standardBanner.duplicateReward.level).toBe(50);
    expect(standardBanner.cost).toBe(10);
  });
});
