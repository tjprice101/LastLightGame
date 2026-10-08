import { describe, expect, it, vi } from 'vitest';
import { commonConduits, type ConduitId } from '../content/conduits';
import { ACCOUNT_KEY, emptyAccount, loadAccount, purchaseConduit, saveAccount, validateAccount } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';

function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); } };
}
describe('Conduit purchase persistence', () => {
  it.each(commonConduits)('purchases $name at its exact price with one write and no unrelated mutations', (conduit) => {
    const saved = storage();
    const before = loadAccount(saved);
    before.fractalis = 20000;
    before.lycalis = 12;
    before.materials = { 'infernic-common': 7 };
    before.characters.ember = { level: 30, evolution: 2, weaponRank: 4 };
    saveAccount(saved, before);
    const write = vi.spyOn(saved, 'setItem');
    const purchased = purchaseConduit(saved, conduit.id);
    expect(write).toHaveBeenCalledTimes(1);
    expect(purchased).toEqual({ ...before, fractalis: 20000 - conduit.price, conduits: { [conduit.id]: 1 } });
    expect(loadAccount(saved)).toEqual(purchased);
    const again = purchaseConduit(saved, conduit.id);
    expect(again.conduits?.[conduit.id]).toBe(2);
    expect(again.fractalis).toBe(20000 - conduit.price * 2);
  });
  it('accepts exact funds and rejects insufficient funds without a write', () => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), fractalis: 1000 });
    expect(purchaseConduit(saved, 'vigil-core').fractalis).toBe(0);
    const before = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    expect(() => purchaseConduit(saved, 'vigil-core')).toThrow('Not enough Prismatica');
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
  });
  it('rejects failed storage, invalid IDs and missing profiles without granting copies', () => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), fractalis: 10000 });
    const before = saved.getItem(ACCOUNT_KEY);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable'); });
    expect(() => purchaseConduit(saved, 'bastion-lock')).toThrow('Storage unavailable');
    expect(() => purchaseConduit(saved, 'missing' as ConduitId)).toThrow('Unknown');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    saved.removeItem(SAVE_KEY);
    expect(() => purchaseConduit(saved, 'bastion-lock')).toThrow('first Element-Bearer');
  });
  it('loads legacy inventories without writes and retains Conduits through v2 migration', () => {
    const saved = storage();
    for (const version of [1, 2, 3]) {
      const raw = JSON.stringify(version === 1 ? { version, fractalis: 4000 } : { ...emptyAccount(), version, fractalis: 4000 });
      saved.setItem(ACCOUNT_KEY, raw);
      expect(loadAccount(saved).conduits).toBeUndefined();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
      expect(purchaseConduit(saved, 'vigil-core').conduits).toEqual({ 'vigil-core': 1 });
    }
    expect(validateAccount({ ...emptyAccount(), version: 2, conduits: { 'vigil-core': 3 } }).conduits).toEqual({ 'vigil-core': 3 });
  });
  it.each([null, [], 4, { missing: 1 }, { 'vigil-core': -1 }, { 'vigil-core': 1.5 }, { 'vigil-core': '2' },
    { 'vigil-core': Number.MAX_SAFE_INTEGER + 1 }])('rejects malformed inventory %j', (conduits) => {
    expect(() => validateAccount({ ...emptyAccount(), conduits })).toThrow('Invalid saved Conduit');
  });
  it('prevents quantity overflow before spending', () => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), fractalis: 10000, conduits: { 'vigil-core': Number.MAX_SAFE_INTEGER } });
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => purchaseConduit(saved, 'vigil-core')).toThrow('capacity');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
});
