import { describe, expect, it } from 'vitest';
import { ACCOUNT_KEY, emptyAccount, loadAccount, ownedProgress, saveAccount, saveAccountRewards, unlockedStage, upgradeCharacter, validateAccount } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { act, createDungeonBattle, endTurn } from './battle';
import { characterLevelCap, evolutionCost, levelCost } from '../content/progression';
import { playableDungeons } from '../content/dungeons';

function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}
function funded(saved: ProfileStorage) {
  const account = emptyAccount();
  account.fractalis = 100000;
  account.materials = { 'infernic-common': 1000, 'infernic-uncommon': 1000, 'infernic-rare': 1000, 'infernic-epic': 1000, 'infernic-legendary': 1000, 'heavens-evolution': 1000, 'heavens-level': 1000 };
  account.capturedCharacters = Array.from({ length: 6 }, (_, index) => ({
    instanceId: `capture:00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, creatureId: 'infusion:heavens:5', locked: false,
  }));
  return saveAccount(saved, account);
}

describe('persistent progression transactions', () => {
  it.each([1, 2, 3, 4, 5])('requires the exact current level cap before evolution %i advances', (evolution) => {
    const saved = storage();
    const account = funded(saved);
    const cap = characterLevelCap(evolution);
    account.characters.ember = { level: cap - 1, evolution };
    saveAccount(saved, account);
    const before = saved.getItem(ACCOUNT_KEY);
    const fodder = evolution >= 3 ? account.capturedCharacters!.slice(0, evolution - 2).map((copy) => copy.instanceId) : [];
    expect(() => upgradeCharacter(saved, 'ember', 'evolve', account.characters.ember!, fodder)).toThrow('cap');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    account.characters.ember.level = cap;
    saveAccount(saved, account);
    const evolved = upgradeCharacter(saved, 'ember', 'evolve', account.characters.ember, fodder);
    expect(evolved.characters.ember).toMatchObject({ level: cap, evolution: evolution + 1 });
  });
  it('migrates v2 stage progress once without losing any account data or writing during load', () => {
    const saved = storage();
    const legacy = {
      ...emptyAccount(), version: 2, fractalis: 123456, lycalis: 300, firstFracture: true,
      materials: { 'atmospheric-common': 456, 'abyss-level': 12 },
      characters: { ember: { level: 90, evolution: 5, weaponRank: 3 } },
      dungeonStages: { infernic: 1, aquatic: 23, voltaic: 45, tranquilitic: 50 },
      infusionStages: { heavens: 13, abyss: 25 },
      creatures: { 'dungeon:voltaic:7': { defeated: true } }, receipts: ['old-run:reward'],
    };
    const raw = JSON.stringify(legacy);
    saved.setItem(ACCOUNT_KEY, raw);
    const migrated = loadAccount(saved);
    expect(migrated.version).toBe(4);
    expect(migrated.dungeonStages).toEqual({ infernic: 1, oceanic: 12, atmospheric: 35, tranquilitic: 35 });
    expect(migrated.infusionStages).toEqual({ heavens: 18, abyss: 35 });
    for (const field of ['fractalis', 'lycalis', 'firstFracture', 'materials', 'characters', 'creatures', 'receipts'] as const) {
      expect(migrated[field]).toEqual(legacy[field]);
    }
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    saveAccount(saved, migrated);
    expect(loadAccount(saved)).toEqual(migrated);
    expect(JSON.parse(saved.getItem(ACCOUNT_KEY)!).version).toBe(4);
    expect(validateAccount({ ...legacy, infusionStages: { heavens: 1 } }).infusionStages).toEqual({ heavens: 1 });
  });
  it('rejects invalid legacy and current floors without overwriting the save', () => {
    const saved = storage();
    for (const [version, field, id, stage] of [
      [2, 'dungeonStages', 'infernic', 51], [2, 'infusionStages', 'abyss', 26],
      [3, 'dungeonStages', 'infernic', 36], [3, 'infusionStages', 'abyss', 36],
      [3, 'dungeonStages', 'infernic', 1.5], [2, 'infusionStages', 'abyss', 0],
    ] as const) {
      const raw = JSON.stringify({ ...emptyAccount(), version, [field]: { [id]: stage } });
      saved.setItem(ACCOUNT_KEY, raw);
      expect(() => loadAccount(saved)).toThrow('Invalid saved');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    }
  });
  it.each(playableDungeons)('%s saves matching rewards and independent stage unlocks with receipt deduplication', (element) => {
    const saved = storage();
    const state = createDungeonBattle(element, 35, 1729, 'ember', { level: 105, evolution: 6 });
    state.enemies[0].hp = 1;
    state.rewardSeed = 0;
    state.allies[0].stats.crit = 0;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    expect(result.state.phase).toBe('cleared');
    const account = saveAccountRewards(saved, result, `run-${element}`);
    expect(account.materials).toEqual({
      [`${element}-common`]: 3, [`${element}-uncommon`]: 3, [`${element}-rare`]: 3,
      [`${element}-epic`]: 3, [`${element}-legendary`]: 3, [`${element}-omnic`]: 3,
    });
    expect(account.fractalis).toBe(15);
    expect(unlockedStage(loadAccount(saved), element)).toBe(35);
    expect(saveAccountRewards(saved, result, `run-${element}`)).toEqual(account);
    for (const other of playableDungeons.filter((id) => id !== element)) expect(unlockedStage(account, other)).toBe(1);
    const opening = createDungeonBattle(element, 1, 1729, 'ember', { level: 105, evolution: 6 });
    opening.enemies.forEach((enemy) => { enemy.hp = 0; });
    opening.phase = 'cleared';
    const fresh = storage();
    saveAccountRewards(fresh, { state: opening, events: [] }, 'opening');
    expect(unlockedStage(loadAccount(fresh), element)).toBe(2);
  });
  it('migrates the legacy wallet without overwriting it on read, preserving base stats at level zero', () => {
    const saved = storage();
    const raw = '{"version":1,"fractalis":57}';
    saved.setItem(ACCOUNT_KEY, raw);
    const account = loadAccount(saved);
    expect(account.fractalis).toBe(57);
    expect(ownedProgress(account, 'ember')).toEqual({ level: 0, evolution: 1 });
    expect(account.materials).toEqual({});
    expect(account.lycalis).toBe(0);
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('spends exactly the displayed level cost and saves the level in the same write', () => {
    const saved = storage();
    funded(saved);
    const result = upgradeCharacter(saved, 'ember', 'level', { level: 0, evolution: 1 });
    expect(result.fractalis).toBe(99988);
    expect(result.materials['infernic-common']).toBe(999);
    expect(ownedProgress(loadAccount(saved), 'ember')).toEqual({ level: 1, evolution: 1 });
    expect(() => upgradeCharacter(saved, 'ember', 'level', { level: 0, evolution: 1 })).toThrow('changed');
    expect(() => upgradeCharacter(saved, 'tide', 'level', { level: 0, evolution: 1 })).toThrow('Owned Element-Bearer');
  });
  it('handles all six forms, retained levels, exact materials and a one-time first Fracture reward', () => {
    const saved = storage();
    let account = funded(saved);
    let totalCost = 0;
    const spent: Record<string, number> = {};
    for (let level = 1; level <= 105; level++) {
      const current = ownedProgress(account, 'ember');
      const cost = levelCost('infernic', current);
      totalCost += cost.fractalis;
      for (const [id, amount] of Object.entries(cost.materials)) spent[id] = (spent[id] ?? 0) + amount;
      account = upgradeCharacter(saved, 'ember', 'level', current);
      if ([30, 45, 60, 75, 90].includes(level)) {
        const before = ownedProgress(account, 'ember');
        expect(() => upgradeCharacter(saved, 'ember', 'level', before)).toThrow('cap');
        const recipe = evolutionCost('infernic', before);
        totalCost += recipe.fractalis;
        for (const [id, amount] of Object.entries(recipe.materials)) spent[id] = (spent[id] ?? 0) + amount;
        const fodder = before.evolution >= 3 ? account.capturedCharacters!.slice(0, before.evolution - 2).map((copy) => copy.instanceId) : [];
        account = upgradeCharacter(saved, 'ember', 'evolve', before, fodder);
        expect(ownedProgress(account, 'ember').level).toBe(level);
        expect(account.lycalis).toBe(10);
      }
    }
    expect(totalCost).toBe(21480);
    expect(spent).toEqual({ 'infernic-common': 280, 'infernic-uncommon': 35, 'infernic-rare': 35, 'infernic-epic': 35, 'infernic-legendary': 10, 'heavens-evolution': 15, 'heavens-level': 30 });
    expect(account.fractalis).toBe(100000 - totalCost);
    expect(account.characters.ember).toEqual({ level: 105, evolution: 6 });
    expect(account.capturedCharacters).toHaveLength(0);
    for (const [id, amount] of Object.entries(spent)) expect(account.materials[id]).toBe(1000 - amount);
    expect(() => upgradeCharacter(saved, 'ember', 'evolve', { level: 105, evolution: 6 })).toThrow('final');
    expect(() => upgradeCharacter(saved, 'ember', 'level', { level: 105, evolution: 6 })).toThrow('cap');
  });
  it('rejects missing resources and early evolution without touching the save', () => {
    const saved = storage();
    const before = saved.getItem(ACCOUNT_KEY);
    expect(() => upgradeCharacter(saved, 'ember', 'level', { level: 0, evolution: 1 })).toThrow('Prismatica');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    const account = funded(saved);
    expect(() => upgradeCharacter(saved, 'ember', 'evolve', { level: 0, evolution: 1 })).toThrow('cap');
    account.materials['infernic-common'] = 0;
    saveAccount(saved, account);
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => upgradeCharacter(saved, 'ember', 'level', { level: 0, evolution: 1 })).toThrow('Seed of Infernic');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('preserves progression, balances and inventory if a write fails', () => {
    const saved = storage();
    funded(saved);
    const raw = saved.getItem(ACCOUNT_KEY);
    saved.setItem = () => { throw new Error('Storage denied'); };
    expect(() => upgradeCharacter(saved, 'ember', 'level', { level: 0, evolution: 1 })).toThrow('Storage denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it.each(['{', '{}', '{"version":3}', '{"version":1,"fractalis":-1}'])('does not replace corrupt save %s', (raw) => {
    const saved = storage();
    saved.setItem(ACCOUNT_KEY, raw);
    expect(() => loadAccount(saved)).toThrow();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('validates material IDs, integers, progression bounds, stage bounds and overflow', () => {
    const saved = storage();
    for (const account of [
      { ...emptyAccount(), materials: { 'unknown-common': 1 } },
      { ...emptyAccount(), materials: { 'infernic-common': -1 } },
      { ...emptyAccount(), characters: { ember: { level: 31, evolution: 1 } } },
      { ...emptyAccount(), dungeonStages: { infernic: 51 } },
      { ...emptyAccount(), fractalis: Number.MAX_SAFE_INTEGER + 1 },
    ]) expect(() => saveAccount(saved, account)).toThrow();
  });
});

describe('dungeon reward commits', () => {
  it('grants materials, Prismatica and stage unlocks together, deduplicates retries and allows fresh runs', () => {
    const saved = storage();
    const state = createDungeonBattle('infernic', 1, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; });
    state.allies[0].shatter = 100;
    const result = act(state, 'ember', 'ultimate', state.enemies[0].id);
    const first = saveAccountRewards(saved, result, 'run-1');
    const common = result.events.filter((event) => event.kind === 'reward')
      .reduce((total, event) => total + (event.materials?.['infernic-common'] ?? 0), 0);
    expect(first.materials['infernic-common']).toBe(common);
    expect(first.fractalis).toBeGreaterThanOrEqual(10);
    expect(unlockedStage(first, 'infernic')).toBe(2);
    expect(saveAccountRewards(saved, result, 'run-1')).toEqual(first);
    expect(saveAccountRewards(saved, result, 'run-2').materials['infernic-common']).toBe(common * 2);
    expect(saveAccountRewards(saved, endTurn(createDungeonBattle('infernic', 1, 2, 'ember', { level: 0, evolution: 1 })), 'run-3').materials['infernic-common']).toBe(common * 2);
  });
  it('leaves the battle uncommitted when storage fails, and permits the same reward to retry once', () => {
    const saved = storage();
    const state = createDungeonBattle('oceanic', 35, 2, 'tide', { level: 90, evolution: 5 });
    state.enemies[0].hp = 1;
    const result = act(state, 'tide', 'light', state.enemies[0].id);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Full'); };
    expect(() => saveAccountRewards(saved, result, 'run')).toThrow('Full');
    expect(saved.getItem(ACCOUNT_KEY)).toBeNull();
    saved.setItem = write;
    const account = saveAccountRewards(saved, result, 'run');
    expect(account.materials['oceanic-common']).toBe(result.events.filter((event) => event.kind === 'reward')
      .reduce((total, event) => total + (event.materials?.['oceanic-common'] ?? 0), 0));
    expect(account.dungeonStages.oceanic).toBe(35);
    expect(saveAccountRewards(saved, result, 'run')).toEqual(account);
  });
});
