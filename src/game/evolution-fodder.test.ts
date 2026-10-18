import { describe, expect, it } from 'vitest';
import { elements, evolutionRequirement } from '../content/activities';
import { characterLevelCap, evolutionCost } from '../content/progression';
import { getStarter } from '../content/starters';
import { ACCOUNT_KEY, emptyAccount, evolutionFodderOptions, fodderSelectionStatus, loadAccount, saveAccount, setCharacterLock, upgradeCharacter } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { type CapturedCharacter } from './character-instances';
import { characterDetail } from '../presentation/hub';

function copy(index: number, mode = 'heavens', tier = 5): CapturedCharacter {
  return { instanceId: `capture:00000000-0000-4000-8000-${String(index).padStart(12, '0')}`, creatureId: `infusion:${mode}:${tier}`, locked: false };
}
function setup(evolution = 3) {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const storage: ProfileStorage = { getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); } };
  const account = emptyAccount();
  account.characters.ember = { level: characterLevelCap(evolution), evolution, weaponRank: 3 };
  account.fractalis = 10000;
  account.lycalis = 17;
  account.firstFracture = true;
  account.squad = ['ember'];
  account.materials = { 'infernic-uncommon': 100, 'infernic-rare': 100, 'infernic-epic': 100, 'infernic-legendary': 100, 'heavens-evolution': 100 };
  account.capturedCharacters = [copy(1), copy(2), copy(3), copy(4)];
  account.conduitEquipment = { [copy(1).instanceId]: [null, null, null, null, null, null, null, null] };
  saveAccount(storage, account);
  return { storage, account };
}

describe('protected-safe evolution Elemental-Devourer infusion', () => {
  it.each([3, 4, 5])('consumes exactly the selected %i-form recipe copies atomically with existing costs', (evolution) => {
    const { storage, account } = setup(evolution);
    const current = account.characters.ember!;
    const cost = evolutionCost('infernic', current);
    const ids = account.capturedCharacters!.slice(0, evolution - 2).map((entry) => entry.instanceId);
    let writes = 0;
    const write = storage.setItem;
    storage.setItem = (key, value) => { writes++; write(key, value); };
    const result = upgradeCharacter(storage, 'ember', 'evolve', current, ids);
    expect(writes).toBe(1);
    expect(result.characters.ember).toEqual({ ...current, evolution: evolution + 1 });
    expect(result.fractalis).toBe(account.fractalis - cost.fractalis);
    expect(result.lycalis).toBe(17);
    for (const [id, amount] of Object.entries(cost.materials)) expect(result.materials[id]).toBe(account.materials[id] - amount);
    expect(result.capturedCharacters?.map((entry) => entry.instanceId)).toEqual(account.capturedCharacters!.slice(ids.length).map((entry) => entry.instanceId));
    expect(result.conduitEquipment?.[ids[0]]).toBeUndefined();
    expect(result.squad).toEqual(['ember']);
    expect(loadAccount(storage)).toEqual(result);
    const before = storage.getItem(ACCOUNT_KEY);
    expect(() => upgradeCharacter(storage, 'ember', 'evolve', current, ids)).toThrow('changed');
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
  });
  it('uses mode affinity rather than enemy combat element and additive form values for all six elements', () => {
    const { account } = setup();
    account.capturedCharacters = [0, 1, 2, 3, 4, 5].flatMap((tier) => ['heavens', 'abyss'].map((mode, index) => copy(tier * 2 + index + 1, mode, tier)));
    for (const element of elements) for (const from of [3, 4, 5]) {
      const options = evolutionFodderOptions(account, element.id, from);
      expect(options.filter((entry) => entry.eligible).map((entry) => [entry.creature.mode, entry.form]))
        .toEqual(Array.from({ length: 6 }, (_, index) => [element.infusion, index + 1]));
      expect(options.filter(entry => entry.eligible).map(entry => entry.value)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(evolutionRequirement(element.id, from).fodderValue).toBe((from - 2) * from);
    }
  });
  it('rejects insufficient value, surplus copies, repeated IDs, unknown IDs, starters and wrong modes without writes', () => {
    const { storage, account } = setup(4);
    account.capturedCharacters!.push(copy(5, 'abyss'), copy(6, 'heavens', 2));
    saveAccount(storage, account);
    const good = copy(1).instanceId;
    for (const ids of [[], [good], [good, copy(2).instanceId, copy(3).instanceId], [good, good],
      [good, copy(99).instanceId], [good, 'ember'], [good, copy(5).instanceId], [copy(6).instanceId]]) {
      const before = storage.getItem(ACCOUNT_KEY);
      expect(() => upgradeCharacter(storage, 'ember', 'evolve', account.characters.ember!, ids)).toThrow();
      expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
    }
  });
  it.each(['locked', 'squad', 'equipment'])('rereads %s protection at confirmation, rejecting all consumed copies', (protection) => {
    const { storage, account } = setup(4);
    const staleProgress = account.characters.ember!;
    const id = copy(2).instanceId;
    if (protection === 'locked') setCharacterLock(storage, id, true);
    else {
      const current = loadAccount(storage);
      if (protection === 'squad') current.squad = ['ember', id];
      else {
        current.conduits = { 'vigil-core': 1 };
        current.conduitEquipment = { [id]: ['vigil-core', null, null, null, null, null, null, null] };
      }
      saveAccount(storage, current);
    }
    const before = storage.getItem(ACCOUNT_KEY);
    expect(() => upgradeCharacter(storage, 'ember', 'evolve', staleProgress, [copy(1).instanceId, id])).toThrow('Cannot consume');
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
  });
  it('preserves progression, Elemental-Devourers and costs when writes fail; retry commits only once', () => {
    const { storage, account } = setup();
    const write = storage.setItem;
    const before = storage.getItem(ACCOUNT_KEY);
    storage.setItem = () => { throw new Error('Write denied'); };
    const ids = [copy(1).instanceId];
    expect(() => upgradeCharacter(storage, 'ember', 'evolve', account.characters.ember!, ids)).toThrow('Write denied');
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
    storage.setItem = write;
    const saved = upgradeCharacter(storage, 'ember', 'evolve', account.characters.ember!, ids);
    expect(saved.capturedCharacters).toHaveLength(3);
    expect(() => upgradeCharacter(storage, 'ember', 'evolve', account.characters.ember!, ids)).toThrow('changed');
    expect(loadAccount(storage)).toEqual(saved);
  });
  it('does not accept fodder for early evolutions/levels and never retroactively consumes saved late forms', () => {
    for (const evolution of [1, 2]) {
      const { storage, account } = setup(evolution);
      account.materials['infernic-common'] = 100;
      saveAccount(storage, account);
      expect(() => upgradeCharacter(storage, 'ember', 'evolve', account.characters.ember!, [copy(1).instanceId])).toThrow('This upgrade does not consume Elemental-Devourers.');
      expect(upgradeCharacter(storage, 'ember', 'evolve', account.characters.ember!).capturedCharacters).toHaveLength(4);
    }
    const { storage, account } = setup(6);
    const before = storage.getItem(ACCOUNT_KEY);
    expect(loadAccount(storage).characters.ember?.evolution).toBe(6);
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
    account.characters.ember!.level = 100;
    saveAccount(storage, account);
    expect(() => upgradeCharacter(storage, 'ember', 'level', account.characters.ember!, [copy(1).instanceId])).toThrow('This upgrade does not consume Elemental-Devourers.');
  });
  it.each([
    { forms: [2, 1], evolution: 3 },
    { forms: [1, 1, 1], evolution: 3 },
    { forms: [4, 4], evolution: 4 },
  ])('accepts Form $forms Evolution Value for Evo$evolution', ({ forms, evolution }) => {
    const { storage, account } = setup(evolution);
    account.capturedCharacters = forms.map((form, index) => copy(index + 1, 'heavens', form - 1));
    saveAccount(storage, account);
    const ids = account.capturedCharacters.map(entry => entry.instanceId);
    const required = evolutionRequirement('infernic', evolution).fodderValue;
    expect(fodderSelectionStatus(forms, required)).toMatchObject({ total: required, surplus: false, ready: true });
    let writes = 0;
    const write = storage.setItem;
    storage.setItem = (key, value) => { writes++; write(key, value); };
    const result = upgradeCharacter(storage, 'ember', 'evolve', account.characters.ember!, ids);
    expect(writes).toBe(1);
    expect(result.characters.ember!.evolution).toBe(evolution + 1);
    expect(result.capturedCharacters).toEqual([]);
    expect(loadAccount(storage)).toEqual(result);
  });
  it.each([
    { forms: [3, 1], total: 4, surplus: true, error: 'Remove extra Elemental-Devourers; the evolution is already covered without one of them.' },
    { forms: [1, 1], total: 2, surplus: false, error: 'Choose Elemental-Devourers worth 3 Evolution Value (currently 2).' },
  ])('rejects Form $forms Evolution Value without writes', ({ forms, total, surplus, error }) => {
    const { storage, account } = setup();
    account.capturedCharacters = forms.map((form, index) => copy(index + 1, 'heavens', form - 1));
    saveAccount(storage, account);
    const before = storage.getItem(ACCOUNT_KEY);
    expect(fodderSelectionStatus(forms, 3)).toEqual({ total, required: 3, surplus, ready: false });
    expect(() => upgradeCharacter(storage, 'ember', 'evolve', account.characters.ember!,
      account.capturedCharacters!.map(entry => entry.instanceId))).toThrow(error);
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
  });
  it('renders explicit per-copy selection, protections, stars and no automatic selection', () => {
    const { account } = setup();
    account.capturedCharacters![0].locked = true;
    account.squad = ['ember', copy(2).instanceId];
    account.conduits = { 'vigil-core': 1 };
    account.conduitEquipment = { [copy(3).instanceId]: ['vigil-core', null, null, null, null, null, null, null] };
    const html = characterDetail(getStarter('ember'), 'upgrade-0', account);
    expect(html.match(/data-evolution-fodder=/g)).toHaveLength(4);
    expect(html).toContain('Locked');
    expect(html).toContain('In squad');
    expect(html).toContain('Conduits equipped');
    expect(html).toContain('0 / 3 value chosen · 1 available');
    expect(html).toContain('data-fodder-value-required="3"');
    expect(html).toContain('data-fodder-value="6"');
    expect(html).toContain('disabled>Evolve');
    expect(html).not.toContain(' checked');
    expect(html).toContain('6-star Elemental-Devourer');
  });
});
