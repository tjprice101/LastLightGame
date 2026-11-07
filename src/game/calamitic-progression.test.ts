import { describe, expect, it } from 'vitest';
import { calamityChest, calamityChestId, rollCalamityChest } from '../content/calamity';
import { calamiticCharacterByTier } from '../content/calamitic-characters';
import { calamiticMaterials } from '../content/calamitic-materials';
import { materialArt, materialName, materialRarity } from '../content/dungeon-art';
import { characterEvolutionCost, characterLevelCap, characterLevelCost, characterRarity, evolutionRarity } from '../content/progression';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards } from './account';
import { createCalamityBattle, type BattleEvent, type BattleResult } from './battle';
import { lootArt, lootItems } from '../presentation/battle-loot';
import { characterArt } from '../content/character-art';
import { battleResults } from '../presentation/battle-results';
import { SAVE_KEY, type ProfileStorage } from './profile';

function makeStorage() {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  let writes = 0;
  let denied = false;
  const storage: ProfileStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => {
      if (denied) throw new Error('Storage denied.');
      values.set(key, value);
      writes++;
    },
    removeItem: key => { values.delete(key); },
  };
  return { storage, writes: () => writes, deny: () => { denied = true; }, allow: () => { denied = false; } };
}

function savedVictory(tier: 1 | 2 | 3 = 1): BattleResult {
  const activity = 'infernic';
  const state = createCalamityBattle(activity, tier, 19, 'ember', { level: 105, evolution: 6 });
  const boss = state.enemies[0];
  boss.hp = 0;
  state.phase = 'cleared';
  const reward: BattleEvent = { kind: 'reward', source: boss.id, target: boss.id, amount: 0, critical: false,
    message: 'Calamity chest.', calamityChest: calamityChestId(activity, tier) };
  return { state, events: [reward] };
}

function prepareCalamityAccount(storage: ProfileStorage, tier: 1 | 2 | 3 = 1) {
  const account = emptyAccount();
  account.normalFinalClears = { infernic: true };
  account.calamityClears = { infernic: tier - 1 };
  return saveAccount(storage, account);
}

function seededRoll(seed: number) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed / 0x100000000;
  };
}

describe('Calamitic progression and saved rewards', () => {
  it('uses the six-form Calamitic rarity ladder and level caps, including the saved Lv.110 endpoint', () => {
    expect([1, 2, 3, 4, 5, 6].map(evolution => characterRarity('ozriel', evolution)))
      .toEqual(['Uncommon', 'Rare', 'Epic', 'Legendary', 'Omnic', 'Calamitic']);
    expect([1, 2, 3, 4, 5, 6].map(evolution => evolutionRarity(evolution)))
      .toEqual(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Omnic']);
    expect([1, 2, 3, 4, 5, 6].map(evolution => characterLevelCap(evolution, 'kaelith')))
      .toEqual([30, 45, 60, 75, 90, 110]);
    expect(characterLevelCap(6, 'ozriel', true)).toBe(115);
    expect(() => characterLevelCap(7, 'ozriel')).toThrow('evolution');
    const { storage } = makeStorage();
    const account = emptyAccount();
    account.characters.ozriel = { level: 110, evolution: 6 };
    saveAccount(storage, account);
    expect(loadAccount(storage).characters.ozriel).toEqual({ level: 110, evolution: 6 });
  });

  it('registers every Calamitic material with its name, rarity and delivered art', () => {
    expect(calamiticMaterials.map(material => material.id)).toEqual([
      'calamity-common', 'calamity-uncommon', 'calamity-rare', 'calamity-epic',
      'calamity-legendary', 'calamity-omnic', 'fragment-of-rise', 'feather-severed-dawn',
      'splinter-unmade-night', 'shard-of-calamity',
    ]);
    for (const material of calamiticMaterials) {
      expect(materialName(material.id)).toBe(material.name);
      expect(materialRarity(material.id)).toBe(material.rarity);
      expect(materialArt(material.id)).toBe(material.id);
    }
  });

  it('replaces Calamitic leveling materials above Lv.90 and adds the doubled late destination-91 Fragment', () => {
    const cost = characterLevelCost('ozriel', { level: 90, evolution: 6 });
    expect(cost.fractalis).toBe(192);
    expect(cost.materials).toEqual({
      'calamity-common': 12, 'calamity-uncommon': 3, 'calamity-rare': 3,
      'calamity-epic': 3, 'calamity-legendary': 3, 'calamity-omnic': 3, 'fragment-of-rise': 3,
    });
    expect(characterLevelCost('ozriel', { level: 109, evolution: 6 }).materials['fragment-of-rise']).toBe(3);
    expect(characterLevelCost('ember', { level: 104, evolution: 6 }).materials['infernic-common']).toBe(12);
  });

  it('adds proposed chest and Calamity-chain costs to the unchanged elemental recipes with late doubling', () => {
    const first = characterEvolutionCost('ozriel', { level: 30, evolution: 1 });
    expect(first.materials).toMatchObject({ 'tranquilitic-common': 23, 'calamity-rare': 8,
      'feather-severed-dawn': 2, 'splinter-unmade-night': 2 });
    const late = characterEvolutionCost('ozriel', { level: 75, evolution: 4 });
    expect(late.materials).toMatchObject({ 'calamity-omnic': 15,
      'feather-severed-dawn': 15, 'splinter-unmade-night': 15 });
    const final = characterEvolutionCost('ozriel', { level: 90, evolution: 5 });
    expect(final.materials).toMatchObject({ 'fragment-of-rise': 15,
      'feather-severed-dawn': 24, 'splinter-unmade-night': 24 });
  });

  it.each([1, 2, 3] as const)('awards the tier-mapped Calamitic character on the independent seeded 10% roll at EX+%i', tier => {
    const { storage, writes } = makeStorage();
    prepareCalamityAccount(storage, tier);
    const account = loadAccount(storage);
    account.calamityRecruitmentSeed = 1;
    saveAccount(storage, account);
    const before = writes();
    const result = savedVictory(tier);
    const character = calamiticCharacterByTier[tier];
    const saved = saveAccountRewards(storage, result, 'calamity-run-1');
    expect(writes()).toBe(before + 1);
    expect(saved.characters[character]).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
    expect(saved.calamityChests?.[calamityChestId('infernic', tier)]).toBe(1);
    expect(saved.calamityRecruitmentSeed).toBe(270369);
    expect(result.events[0]).toMatchObject({ calamiticRecruitment: character });
    expect(lootItems(result.events[0])).toContainEqual(expect.objectContaining({
      id: `calamitic-recruitment:${character}`, name: expect.stringContaining('Calamitic Element-Bearer'),
      amount: 1, rarity: 'Uncommon', color: expect.any(String),
    }));
    const recruitItem = lootItems(result.events[0]).find(item => item.id === `calamitic-recruitment:${character}`)!;
    expect(recruitItem.art).toBe(characterArt(character, 1).art);
    expect(lootArt(recruitItem)).toContain(`characters/${characterArt(character, 1).art}.png`);
    const resultsHtml = battleResults(result.state, result.events);
    expect(resultsHtml).toContain(`characters/${characterArt(character, 1).art}.png`);
    expect(resultsHtml).toContain('data-rarity="Uncommon"');
    expect(resultsHtml).toContain('class="result-recruitment-reward"');
    expect(resultsHtml).toContain('Calamitic Element-Bearer');
    const retried = saveAccountRewards(storage, result, 'calamity-run-1');
    expect(writes()).toBe(before + 1);
    expect(retried.characters[character]).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
  });

  it('does not roll for an already-owned character and denied writes grant nothing', () => {
    const owned = makeStorage();
    const account = prepareCalamityAccount(owned.storage);
    account.characters.ozriel = { level: 0, evolution: 1 };
    account.calamityRecruitmentSeed = 1;
    saveAccount(owned.storage, account);
    const noRoll = savedVictory(1);
    const saved = saveAccountRewards(owned.storage, noRoll, 'owned-run');
    expect(saved.calamityRecruitmentSeed).toBe(1);
    expect(noRoll.events[0]).not.toHaveProperty('calamiticRecruitment');

    const denied = makeStorage();
    const unowned = prepareCalamityAccount(denied.storage);
    unowned.calamityRecruitmentSeed = 1;
    saveAccount(denied.storage, unowned);
    const raw = denied.storage.getItem(ACCOUNT_KEY);
    const result = savedVictory(1);
    denied.deny();
    expect(() => saveAccountRewards(denied.storage, result, 'denied-run')).toThrow('Storage denied');
    expect(denied.storage.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(result.events[0]).not.toHaveProperty('calamiticRecruitment');
    denied.allow();
    expect(loadAccount(denied.storage).characters.ozriel).toBeUndefined();
  });

  it('adds fixed Heaven/Abyss chest materials without changing existing random draw counts', () => {
    for (const activity of ['heavens', 'abyss'] as const) for (const tier of [1, 2, 3] as const) {
      const chest = calamityChest(activity, tier);
      const material = activity === 'heavens' ? 'feather-severed-dawn' : 'splinter-unmade-night';
      expect(chest.guaranteedMaterials).toEqual({ [material]: tier });
      let calls = 0;
      const reward = rollCalamityChest(activity, tier, () => { calls++; return .999999; });
      expect(calls).toBe(chest.bundles * 2);
      expect(reward.materials[material]).toBe(tier);
      expect(reward.calamiticMaterialVersion).toBe(1);
      const control = rollCalamityChest(activity, tier, seededRoll(1729));
      const expectedRandom = rollCalamityChest(activity, tier, seededRoll(1729));
      expect(control.materials).toEqual(expectedRandom.materials);
      expect(control.fractalis).toBe(expectedRandom.fractalis);
    }
  });
});
