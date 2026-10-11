import { describe, expect, it, vi } from 'vitest';
import {
  eventMaterialWarning, eventMaterialWarningHidden, eventMaterialWarningKey, exchangeProduct, exchangeProducts,
  hideEventMaterialWarning, roseExchangePrices,
} from '../content/material-exchange';
import { emptyAccount, loadAccount, purchaseExchangeMaterial, saveAccount, summonCharacters } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';

function fixture(edit: (account: ReturnType<typeof emptyAccount>) => void = () => undefined) {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const storage: ProfileStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: vi.fn((key, value) => { values.set(key, value); }),
    removeItem: key => { values.delete(key); },
  };
  const account = emptyAccount();
  account.characters.ember = { level: 1, evolution: 1 };
  account.squad = ['ember'];
  edit(account);
  saveAccount(storage, account);
  vi.mocked(storage.setItem).mockClear();
  return { storage, values };
}

describe('Material Exchange categories and Rose event materials', () => {
  it('catalogs six normal Common materials and six priced Rose-only event materials', () => {
    expect(exchangeProducts.filter(product => product.category === 'normal').map(product => product.price)).toEqual(Array(6).fill(80));
    const event = exchangeProducts.filter(product => product.category === 'event');
    expect(event.map(product => product.materialId)).toEqual(['common', 'uncommon', 'rare', 'epic', 'legendary', 'omnic'].map(r => `rosethorn-${r}`));
    expect(event.map(product => product.price)).toEqual([2500, 7500, 25000, 75000, 250000, 750000]);
    expect(Object.values(roseExchangePrices)).toEqual([2500, 7500, 25000, 75000, 250000, 750000]);
    expect(() => exchangeProduct('rosethorn-mythic')).toThrow('Unknown');
    const warning = eventMaterialWarning(exchangeProduct('rosethorn-rare'), 5);
    for (const text of ['ONLY', 'Rosetta', 'Thornia', 'Crinso', 'NOT', '125,000']) expect(warning).toContain(text);
  });

  it('stores the do-not-show-again preference separately from the save', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    expect(eventMaterialWarningHidden(storage)).toBe(false);
    hideEventMaterialWarning(storage);
    expect(values.get(eventMaterialWarningKey)).toBe('hidden');
    expect(eventMaterialWarningHidden(storage)).toBe(true);
  });

  it('purchases 1/5/10 offline in one atomic write and rejects invalid purchases without writing', () => {
    const { storage } = fixture(account => { account.fractalis = 40000; });
    const after = purchaseExchangeMaterial(storage, 'rosethorn-common', 10);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(after.fractalis).toBe(15000);
    expect(after.materials['rosethorn-common']).toBe(10);
    expect(purchaseExchangeMaterial(storage, 'infernic', 5).materials['infernic-common']).toBe(5);
    vi.mocked(storage.setItem).mockClear();
    const before = loadAccount(storage);
    expect(() => purchaseExchangeMaterial(storage, 'rosethorn-uncommon', 5)).toThrow('Not enough Prismatica');
    expect(() => purchaseExchangeMaterial(storage, 'infernic', 2)).toThrow('Invalid');
    expect(() => purchaseExchangeMaterial(storage, 'rosethorn-mythic', 1)).toThrow('Unknown');
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(loadAccount(storage)).toEqual(before);
  });

  it('rejects material overflow without spending', () => {
    const { storage } = fixture(account => { account.fractalis = 10000; account.materials['rosethorn-common'] = Number.MAX_SAFE_INTEGER; });
    expect(() => purchaseExchangeMaterial(storage, 'rosethorn-common', 1)).toThrow('capacity');
    expect(loadAccount(storage).fractalis).toBe(10000);
  });
});

describe('Summon 10-Pull', () => {
  it('spends 100 Null-Prismatica for ten sequential draws saved in one write', () => {
    const { storage } = fixture(account => { account.lycalis = 120; account.bannerPity = { standard: { highestStar: 75, unownedHighestStar: 0 } }; });
    const { account, draws } = summonCharacters(storage, () => .9, 'standard', 10);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(draws).toHaveLength(10);
    expect(account.lycalis).toBe(20);
    expect(draws.filter(draw => draw.guarantee !== 'none')).toHaveLength(1);
    expect(draws[4].guarantee).not.toBe('none');
    expect(draws[4].entry.kind).toBe('character');
    expect(account.characters[draws[4].entry.id as keyof typeof account.characters]).toBeDefined();
    expect(loadAccount(storage)).toEqual(account);
  });

  it('leaves the save untouched when 100 Null-Prismatica is unavailable or the count is invalid', () => {
    const { storage } = fixture(account => { account.lycalis = 99; });
    const before = loadAccount(storage);
    const random = vi.fn(() => .5);
    expect(() => summonCharacters(storage, random, 'standard', 10)).toThrow('A 10-pull requires 100 Null-Prismatica');
    expect(() => summonCharacters(storage, random, 'standard', 3)).toThrow('single or 10-pull');
    expect(random).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(loadAccount(storage)).toEqual(before);
  });

  it('writes nothing if the single save fails mid 10-pull', () => {
    const { storage } = fixture(account => { account.lycalis = 100; });
    const before = loadAccount(storage);
    vi.mocked(storage.setItem).mockImplementation(() => { throw new Error('Write denied'); });
    expect(() => summonCharacters(storage, () => .5, 'roses', 10)).toThrow('Write denied');
    expect(loadAccount(storage)).toEqual(before);
  });
});
