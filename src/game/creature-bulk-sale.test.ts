import { describe, expect, it, vi } from 'vitest';
import { ACCOUNT_KEY, creatureBatchSaleOffer, loadAccount, saveAccount, sellCurrencyCreatures } from './account';
import { createCreatureCopy } from './character-instances';
import { SAVE_KEY, type ProfileStorage } from './profile';

function fixture() {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const storage: ProfileStorage = { getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
  const account = loadAccount(storage);
  const copies = ['treasury:5', 'sanctuary:4', 'roses:2', 'heavens:3', 'abyss:1', 'treasury:0']
    .map(id => createCreatureCopy(`infusion:${id}`));
  account.capturedCharacters = copies;
  saveAccount(storage, account);
  const selections = copies.slice(0, 5).map((copy, index) => ({ id: copy.instanceId,
    saleOption: index === 3 ? 'heavens-level' : index === 4 ? 'lycalis' : 'default' }));
  return { storage, account, copies, selections };
}

describe('atomic multi-select Elemental-Devourer sale', () => {
  it('totals individually chosen mixed payouts and removes only selected UUIDs in one write', () => {
    const { storage, account, copies, selections } = fixture();
    const before = structuredClone(account);
    const offer = creatureBatchSaleOffer(account, selections);
    expect(offer).toMatchObject({ fractalis: 310000, lycalis: 27,
      materials: { 'rosethorn-rare': 3, 'heavens-level': 4 } });
    expect(account).toEqual(before);
    const write = vi.spyOn(storage, 'setItem');
    const sold = sellCurrencyCreatures(storage, selections);
    expect(write).toHaveBeenCalledTimes(1);
    expect(sold.capturedCharacters).toEqual([copies[5]]);
    expect(sold.fractalis).toBe(account.fractalis + offer.fractalis);
    expect(sold.lycalis).toBe(account.lycalis + offer.lycalis);
    expect(sold.materials['heavens-level']).toBe(4);
    expect(sold.materials['heavens-evolution']).toBeUndefined();
    expect(sold.materials['rosethorn-rare']).toBe(3);
    expect(loadAccount(storage)).toEqual(sold);
    expect(() => sellCurrencyCreatures(storage, selections)).toThrow('owned');
    expect(write).toHaveBeenCalledTimes(1);
  });

  it.each(['locked', 'squad', 'gear', 'currency-overflow', 'material-overflow'] as const)(
    'rejects the whole batch for %s with zero writes/removals', mode => {
      const { storage, copies, selections } = fixture();
      const account = loadAccount(storage);
      if (mode === 'locked') account.capturedCharacters![1].locked = true;
      if (mode === 'squad') account.squad = ['ember', copies[1].instanceId];
      if (mode === 'gear') {
        account.conduits = { 'vigil-core': 1 };
        account.conduitEquipment = { [copies[1].instanceId]: ['vigil-core', null, null, null, null, null, null, null] };
      }
      if (mode === 'currency-overflow') account.fractalis = Number.MAX_SAFE_INTEGER;
      if (mode === 'material-overflow') account.materials['heavens-level'] = Number.MAX_SAFE_INTEGER;
      saveAccount(storage, account);
      const raw = storage.getItem(ACCOUNT_KEY);
      const write = vi.spyOn(storage, 'setItem');
      expect(() => sellCurrencyCreatures(storage, selections)).toThrow();
      expect(write).not.toHaveBeenCalled();
      expect(storage.getItem(ACCOUNT_KEY)).toBe(raw);
    });

  it('rejects empty, duplicate, missing-copy and wrong-mode payouts without writing', () => {
    const { storage, selections } = fixture();
    const raw = storage.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(storage, 'setItem');
    for (const invalid of [[], [selections[0], selections[0]], [{ id: 'missing', saleOption: 'default' }],
      [selections[0], { ...selections[3], saleOption: 'abyss-level' }]]) {
      expect(() => sellCurrencyCreatures(storage, invalid)).toThrow();
    }
    expect(write).not.toHaveBeenCalled();
    expect(storage.getItem(ACCOUNT_KEY)).toBe(raw);
  });

  it('rereads protections and preserves raw storage when persistence fails', () => {
    const { storage, selections } = fixture();
    creatureBatchSaleOffer(loadAccount(storage), selections);
    const account = loadAccount(storage);
    account.capturedCharacters![0].locked = true;
    saveAccount(storage, account);
    expect(() => sellCurrencyCreatures(storage, selections)).toThrow('Locked');
    account.capturedCharacters![0].locked = false;
    saveAccount(storage, account);
    const raw = storage.getItem(ACCOUNT_KEY);
    storage.setItem = () => { throw new Error('Write denied'); };
    expect(() => sellCurrencyCreatures(storage, selections)).toThrow('Write denied');
    expect(storage.getItem(ACCOUNT_KEY)).toBe(raw);
  });
});
