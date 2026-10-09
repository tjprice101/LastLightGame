import { describe, expect, it, vi } from 'vitest';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, purchaseConduit, migrateLegacyDungeonStage, evolutionFodderOptions } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createCreatureCopy } from './character-instances';
import { createDungeonBattle, act, nextStage } from './battle';
import { elements, elementalEnemyLevel, materialRarities } from '../content/activities';
import { canonicalElement, elementSources, legacyElementIds } from '../content/element-migration';
import { dungeonVariants, materialLoot } from '../content/dungeons';
import { getCreature } from '../content/creatures';
import { getConduit } from '../content/conduits';

function fixture(raw: unknown) {
  const data = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}'], [ACCOUNT_KEY, JSON.stringify(raw)]]);
  const storage: ProfileStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: vi.fn((key, value) => { data.set(key, value); }),
    removeItem: (key) => { data.delete(key); },
  };
  return storage;
}

describe('six-element save and encounter migration', () => {
  it.each([2, 3] as const)('merges every old material rarity and dungeon unlock in v%i read-only, once', (version) => {
    const materials = Object.fromEntries(legacyElementIds.flatMap((id, index) =>
      materialRarities.map((rarity) => [`${id}-${rarity.toLowerCase()}`, index + 1])));
    const dungeonStages = Object.fromEntries(legacyElementIds.map((id, index) => [id, index * 3 + 1]));
    const raw = { ...emptyAccount(), version, materials, dungeonStages };
    const storage = fixture(raw);
    const before = storage.getItem(ACCOUNT_KEY);
    const migrated = loadAccount(storage);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
    expect(migrated.version).toBe(4);
    for (const element of elements) {
      const sum = elementSources[element.id].reduce((total, source) => total + legacyElementIds.indexOf(source) + 1, 0);
      for (const rarity of materialRarities) expect(migrated.materials[`${element.id}-${rarity.toLowerCase()}`]).toBe(sum);
      expect(migrated.dungeonStages[element.id]).toBe(Math.max(...elementSources[element.id]
        .map((source) => migrateLegacyDungeonStage(dungeonStages[source], version))));
    }
    expect(Object.keys(migrated.materials)).toHaveLength(36);
    saveAccount(storage, migrated);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(loadAccount(storage)).toEqual(migrated);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it('preserves copies, gear, upgrades, progress, pity, discovery and receipts in the first atomic transaction', () => {
    const copy = createCreatureCopy('infusion:treasury:5', 22, 50, 'banner-duplicate');
    const raw = { ...emptyAccount(), version: 3, fractalis: 2000, lycalis: 32,
      materials: { 'tectonic-common': 4, 'efflorescent-common': 7, 'heavens-level': 8 },
      characters: { ember: { level: 30, evolution: 2, weaponRank: 3 }, bruno: { level: 0, evolution: 1 } },
      capturedCharacters: [copy], squad: [copy.instanceId, 'ember'],
      conduits: { 'tectonic-atlas-bastion': 1 }, conduitEquipment: { bruno: ['tectonic-atlas-bastion', null, null, null, null, null, null, null] },
      mechanicalComponents: 33, characterLocks: { bruno: true }, bannerPity: { standard: { highestStar: 7, unownedHighestStar: 19 } },
      creatures: { 'dungeon:tectonic:7': { defeated: true }, 'dungeon:efflorescent:0': { defeated: false } },
      receipts: ['old:enemy:3'] };
    const storage = fixture(raw);
    const loaded = loadAccount(storage);
    for (const key of ['characters', 'capturedCharacters', 'squad', 'conduits', 'conduitEquipment',
      'mechanicalComponents', 'characterLocks', 'bannerPity', 'creatures', 'receipts'] as const) {
      expect(loaded[key]).toEqual(raw[key]);
    }
    expect(loaded.materials).toEqual({ 'botanic-common': 11, 'heavens-level': 8 });
    const saved = purchaseConduit(storage, 'vigil-core');
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(saved.fractalis).toBe(1000);
    expect(saved.materials).toEqual(loaded.materials);
    expect(loadAccount(storage)).toEqual(saved);
  });

  it.each([
    { 'tectonic-common': Number.MAX_SAFE_INTEGER, 'efflorescent-common': 1 },
    { 'aquatic-common-bogus': 1 }, { 'luminous-common': -1 }, { 'ominous-unknown': 1 },
  ])('rejects corrupt or overflowing merged balances without writes', (materials) => {
    const storage = fixture({ ...emptyAccount(), version: 3, materials });
    const before = storage.getItem(ACCOUNT_KEY);
    expect(() => loadAccount(storage)).toThrow();
    expect(() => purchaseConduit(storage, 'vigil-core')).toThrow();
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('leaves the complete legacy wallet intact on storage failure and retries migration exactly once', () => {
    const storage = fixture({ ...emptyAccount(), version: 3, fractalis: 3000,
      materials: { 'luminous-common': 8, 'tranquilitic-common': 7 } });
    const before = storage.getItem(ACCOUNT_KEY);
    const write = storage.setItem;
    storage.setItem = () => { throw new Error('Storage unavailable'); };
    expect(() => purchaseConduit(storage, 'vigil-core')).toThrow('Storage unavailable');
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
    storage.setItem = write;
    expect(purchaseConduit(storage, 'vigil-core').materials).toEqual({ 'tranquilitic-common': 15 });
    expect(write).toHaveBeenCalledTimes(1);
    expect(loadAccount(storage).materials).toEqual({ 'tranquilitic-common': 15 });
  });

  it('does not remigrate v4 stages and rejects retired material/dungeon keys in v4', () => {
    const current = { ...emptyAccount(), dungeonStages: { atmospheric: 13 }, materials: { 'oceanic-common': 7 } };
    const storage = fixture(current);
    expect(loadAccount(storage).dungeonStages).toEqual({ atmospheric: 13 });
    expect(loadAccount(storage).materials).toEqual(current.materials);
    for (const altered of [
      { ...current, materials: { 'aquatic-common': 7 } },
      { ...current, dungeonStages: { voltaic: 13 } },
    ]) expect(() => loadAccount(fixture(altered))).toThrow();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('keeps exact zero and maximum-safe merged balances', () => {
    const storage = fixture({ ...emptyAccount(), version: 3,
      materials: { 'tectonic-common': Number.MAX_SAFE_INTEGER - 7, 'efflorescent-common': 7,
        'luminous-omnic': 0, 'tranquilitic-omnic': 0 } });
    const loaded = loadAccount(storage);
    expect(loaded.materials).toEqual({ 'botanic-common': Number.MAX_SAFE_INTEGER, 'tranquilitic-omnic': 0 });
    saveAccount(storage, loaded);
    expect(loadAccount(storage).materials).toEqual(loaded.materials);
  });

  it('preserves highest completed enemy level rather than granting extra cleared floors', () => {
    for (let stage = 1; stage <= 35; stage++) {
      const migrated = migrateLegacyDungeonStage(stage, 3);
      expect(migrated).toBeGreaterThanOrEqual(1);
      expect(migrated).toBeLessThanOrEqual(35);
      if (stage === 1) { expect(migrated).toBe(1); continue; }
      if (stage === 35) { expect(migrated).toBe(35); continue; }
      const completedLevel = Math.round(10 + (stage - 2) * 110 / 34);
      if (migrated > 1) expect(elementalEnemyLevel(migrated - 1)).toBeLessThanOrEqual(completedLevel);
      if (migrated < 35) expect(elementalEnemyLevel(migrated)).toBeGreaterThan(completedLevel);
    }
    expect(migrateLegacyDungeonStage(35, 3)).toBe(35);
    for (const stage of [0, 36, NaN, 2.5]) expect(() => migrateLegacyDungeonStage(stage, 3)).toThrow();
  });

  it('retains every old dungeon discovery ID with canonical element, stages and loot routing', () => {
    for (const element of elements) for (let stage = 1; stage <= 35; stage++) {
      for (const variant of dungeonVariants(element.id, stage)) {
        const creature = getCreature(variant.creatureId);
        expect(creature.element).toBe(element.id);
        expect(creature.dungeonElement).toBe(element.id);
        expect(creature.stages).toContain(stage);
        expect(creature.name).toBe(variant.enemy.name);
        expect(creature.art).toBe(variant.enemy.art);
      }
      expect(materialLoot(element.id, stage).every((drop) => drop.id.startsWith(`${element.id}-`))).toBe(true);
    }
  });

  it('samples each merged family per enemy from an independent deterministic stream', () => {
    for (const element of elements) {
      const families = new Set<string>();
      for (let seed = 1; seed <= 40; seed++) {
        const battle = createDungeonBattle(element.id, 1, seed, 'ember', { level: 38, evolution: 2 });
        expect(battle.seed).toBe(seed);
        expect(battle.rewardSeed).toBe(seed);
        expect(battle.captureSeed).toBe(seed);
        expect(createDungeonBattle(element.id, 1, seed, 'ember', { level: 38, evolution: 2 })).toEqual(battle);
        battle.enemies.forEach((enemy) => families.add(enemy.creatureId!.split(':')[1]));
      }
      expect([...families].sort()).toEqual([...elementSources[element.id]].sort());
    }
    const state = createDungeonBattle('botanic', 35, 1729, 'ember', { level: 105, evolution: 6 });
    state.enemies[0].hp = 1;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    expect(result.events.filter((event) => event.kind === 'reward').every((event) =>
      Object.keys(event.materials ?? {}).every((id) => id.startsWith('botanic-')))).toBe(true);
    expect(result.state.encounterSeed).toBe(state.encounterSeed);
  });

  it('continues the family stream independently of combat rolls and preserves the complete next-stage squad', () => {
    const state = createDungeonBattle('botanic', 1, 1729, 'ember', { level: 45, evolution: 2 });
    state.phase = 'cleared';
    state.allies[0].shatter = 37;
    const differentCombatSeed = structuredClone(state);
    differentCombatSeed.seed = 23;
    const continued = nextStage(state, { ember: { level: 45, evolution: 2 } }).state;
    const other = nextStage(differentCombatSeed, { ember: { level: 45, evolution: 2 } }).state;
    expect(other.enemies).toEqual(continued.enemies);
    expect(other.encounterSeed).toBe(continued.encounterSeed);
    expect(continued.encounterSeed).not.toBe(state.encounterSeed);
    expect(continued.allies[0].shatter).toBe(37);
    expect(continued.allies[0].stats).toEqual(state.allies[0].stats);
    expect(continued.seed).toBe(state.seed);
  });

  it('routes former Voltaic fodder requirements to Heaven without changing captured IDs', () => {
    const account = emptyAccount();
    account.characters.elise = { level: 45, evolution: 3 };
    account.squad = ['elise'];
    account.capturedCharacters = [createCreatureCopy('infusion:heavens:3'), createCreatureCopy('infusion:abyss:3')];
    const options = evolutionFodderOptions(account, 'atmospheric', 3, 'elise');
    expect(options.map((entry) => entry.eligible)).toEqual([true, false]);
    expect(getConduit('voltaic-thunderbird-coil').element).toBe('atmospheric');
    expect(getConduit('efflorescent-worldtree-heart').element).toBe(canonicalElement('tectonic'));
  });
});
