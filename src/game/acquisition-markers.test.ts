import { describe, expect, it, vi } from 'vitest';
import { acquisitionView, acquisitionKeys, advanceAcquisitions, acknowledgeAcquisitions } from './acquisition-markers';
import { emptyAccount, saveAccount, loadAccount, ACCOUNT_KEY, purchaseExchangeMaterial, validateAccount } from './account';
import { SAVE_KEY } from './profile';

describe('first-ever acquisition lifetime history', () => {
  it('seeds legacy holdings seen without mutation or persistence', () => {
    const old = {
      characters: { ember: {} }, capturedCharacters: [{ creatureId: 'infusion:heavens:2' }, { creatureId: 'infusion:heavens:2' }],
      materials: { 'infernic-common': 4 }, conduits: { 'vigil-core': 1 }, masterConduits: { 'master:ember:one': 1 },
    };
    const before = structuredClone(old);
    expect(acquisitionKeys(old)).toHaveLength(5);
    expect(Object.values(acquisitionView(old))).toEqual(Array(5).fill(true));
    expect(old).toEqual(before);
  });
  it('marks each new type once, captured FORMS not duplicate instances, with no sale/spend/reacquisition reset', () => {
    const initial = { characters: { ember: {} }, materials: { 'infernic-common': 1 } };
    const next = {
      ...initial, characters: { ember: {}, tide: {} },
      capturedCharacters: [{ creatureId: 'infusion:heavens:2' }, { creatureId: 'infusion:heavens:2' }, { creatureId: 'infusion:heavens:3' }],
      materials: { 'infernic-common': 10, 'oceanic-common': 10 }, conduits: { 'vigil-core': 1 }, masterConduits: { 'master:one': 1 },
    };
    const markers = advanceAcquisitions(initial, next);
    expect(markers['character:ember']).toBe(true);
    expect(markers['material:infernic-common']).toBe(true);
    for (const key of ['character:tide', 'form:infusion:heavens:2', 'form:infusion:heavens:3', 'material:oceanic-common', 'conduit:vigil-core', 'master:master:one']) expect(markers[key]).toBe(false);
    expect(advanceAcquisitions({ ...next, acquisitionMarkers: markers }, next)).toEqual(markers);
    const seen = acknowledgeAcquisitions({ ...next, acquisitionMarkers: markers }, ['form:infusion:heavens:2', 'material:oceanic-common']);
    const spent = { characters: initial.characters, materials: {}, acquisitionMarkers: seen };
    const lifetime = advanceAcquisitions({ ...next, acquisitionMarkers: seen }, spent);
    expect(advanceAcquisitions({ ...spent, acquisitionMarkers: lifetime }, next)['material:oceanic-common']).toBe(true);
    expect(advanceAcquisitions({ ...spent, acquisitionMarkers: lifetime }, next)['form:infusion:heavens:2']).toBe(true);
    expect(lifetime['form:infusion:heavens:3']).toBe(false);
  });
  it('persists metadata in the same single successful local account write, never on load or failure', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 }; account.fractalis = 10000;
    const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}'], [ACCOUNT_KEY, JSON.stringify(account)]]);
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
      removeItem: (key: string) => { values.delete(key); } };
    const original = values.get(ACCOUNT_KEY);
    loadAccount(storage);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(values.get(ACCOUNT_KEY)).toBe(original);
    const saved = purchaseExchangeMaterial(storage, 'oceanic', 1);
    expect(storage.setItem).toHaveBeenCalledOnce();
    expect(saved.acquisitionMarkers).toMatchObject({ 'character:ember': true, 'material:oceanic-common': false });
    const unread = loadAccount(storage);
    unread.acquisitionMarkers = acknowledgeAcquisitions(unread, ['material:oceanic-common']);
    saveAccount(storage, unread);
    expect(loadAccount(storage).acquisitionMarkers!['material:oceanic-common']).toBe(true);
    storage.setItem.mockClear();
    expect(() => purchaseExchangeMaterial(storage, 'infernic-omnic', 1)).toThrow();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(() => validateAccount({ ...saved, acquisitionMarkers: { 'bad:key': false } })).toThrow('acquisition');
  });
});
