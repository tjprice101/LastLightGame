import { describe, expect, it } from 'vitest';
import { ACCOUNT_KEY, creatureSaleOffer, loadAccount, saveAccount, sellCurrencyCreature, setCharacterLock } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createCreatureCopy } from './character-instances';
import { choiceSaleQuantities, creatureSaleOptions } from '../content/infusions';

function storage(): ProfileStorage {
  const map = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => { map.set(key, value); }, removeItem: (key) => { map.delete(key); } };
}
function withCopy(creatureId: string) {
  const saved = storage();
  const account = loadAccount(saved);
  const copy = createCreatureCopy(creatureId);
  account.capturedCharacters = [copy];
  saveAccount(saved, account);
  return { saved, copy, before: loadAccount(saved) };
}

describe('Heaven/Abyss slime sales (D-233)', () => {
  it('offers Null-Prismatica or one of the three mode items, growing linearly by form', () => {
    expect(choiceSaleQuantities).toEqual([1, 2, 3, 4, 5, 6]);
    for (const mode of ['heavens', 'abyss'] as const) {
      for (let tier = 0; tier < 6; tier += 1) {
        const options = creatureSaleOptions(mode, tier);
        expect(options.map((option) => option.id)).toEqual(['lycalis', `${mode}-evolution`, `${mode}-level`, `${mode}-weapon`]);
        expect(options[0]).toMatchObject({ fractalis: 0, lycalis: tier + 1, materials: {} });
        for (const option of options.slice(1)) expect(option).toMatchObject({ fractalis: 0, lycalis: 0, materials: { [option.id]: tier + 1 } });
      }
    }
  });

  it('sells for exactly one chosen payout in one write and removes the copy', () => {
    for (const [option, check] of [
      ['lycalis', (after: ReturnType<typeof loadAccount>, before: ReturnType<typeof loadAccount>) => expect(after.lycalis).toBe(before.lycalis + 4)],
      ['abyss-evolution', (after: ReturnType<typeof loadAccount>, before: ReturnType<typeof loadAccount>) => {
        expect(after.lycalis).toBe(before.lycalis);
        expect(after.materials['abyss-evolution']).toBe((before.materials['abyss-evolution'] ?? 0) + 4);
      }],
    ] as const) {
      const { saved, copy, before } = withCopy('infusion:abyss:3');
      const sold = sellCurrencyCreature(saved, copy.instanceId, option);
      check(sold, before);
      expect(sold.fractalis).toBe(before.fractalis);
      expect(sold.capturedCharacters).toEqual([]);
      expect(loadAccount(saved)).toEqual(sold);
    }
  });

  it('defaults to Null-Prismatica, rejects unknown/other-mode payouts and honors protections without writing', () => {
    const { saved, copy } = withCopy('infusion:heavens:0');
    const snapshot = saved.getItem(ACCOUNT_KEY);
    expect(() => sellCurrencyCreature(saved, copy.instanceId, 'abyss-level')).toThrow('Choose one of the listed sale payouts');
    expect(() => sellCurrencyCreature(saved, copy.instanceId, 'fractalis')).toThrow('Choose one of the listed sale payouts');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(snapshot);
    setCharacterLock(saved, copy.instanceId, true);
    const locked = saved.getItem(ACCOUNT_KEY);
    expect(() => sellCurrencyCreature(saved, copy.instanceId, 'heavens-level')).toThrow('Locked');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(locked);
    setCharacterLock(saved, copy.instanceId, false);
    expect(creatureSaleOffer(loadAccount(saved), copy.instanceId)).toMatchObject({ option: 'lycalis', lycalis: 1 });
    expect(sellCurrencyCreature(saved, copy.instanceId).capturedCharacters).toEqual([]);
  });

  it('keeps single-payout modes unchanged', () => {
    const { saved, copy, before } = withCopy('infusion:treasury:2');
    expect(creatureSaleOffer(before, copy.instanceId).options).toHaveLength(1);
    expect(() => sellCurrencyCreature(saved, copy.instanceId, 'lycalis')).toThrow('Choose one of the listed sale payouts');
    expect(sellCurrencyCreature(saved, copy.instanceId).fractalis).toBe(before.fractalis + 10000);
  });
});
