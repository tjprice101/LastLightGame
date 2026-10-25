import { describe, expect, it, vi } from 'vitest';
import { elements } from '../content/activities';
import { bannerMaterialTiers } from '../content/banner-materials';
import { resolveBannerPull } from '../content/standard-banner';
import { getSummonBanner } from '../content/summon-banners';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, summonCharacter } from './account';
import { createCreatureCopy } from './character-instances';
import { SAVE_KEY, type ProfileStorage } from './profile';

function fixture() {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const storage: ProfileStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: vi.fn((key, value) => { values.set(key, value); }),
    removeItem: key => { values.delete(key); },
  };
  const account = emptyAccount();
  account.lycalis = 100;
  account.characters.ember = { level: 30, evolution: 2, weaponRank: 3 };
  account.squad = ['ember'];
  account.capturedCharacters = [createCreatureCopy('infusion:treasury:5', undefined, 50, 'banner-duplicate')];
  saveAccount(storage, account);
  vi.mocked(storage.setItem).mockClear();
  return { storage, account };
}

describe('material-only non-character banner rewards', () => {
  it('rejects forged material rarity, quantity and identity before RNG', () => {
    const pool = getSummonBanner('standard').pool();
    const base = pool.find(entry => entry.kind === 'material');
    if (!base) throw new Error('Material outcome missing.');
    for (const patch of [{ id: 'infernic-omnic', stars: 6 }, { amount: 1000 }, { id: 'invalid-common' }, { stars: 3 }]) {
      const forged = pool.map(entry => entry.id === base.id ? { ...entry, ...patch } : entry);
      const random = vi.fn(() => .5);
      expect(() => resolveBannerPull(forged, [], { highestStar: 0, unownedHighestStar: 0 }, random)).toThrow();
      expect(random).not.toHaveBeenCalled();
    }
  });
  it.each(['standard', 'roses'] as const)('%s covers every material outcome and exact probability boundary', bannerId => {
    const pool = getSummonBanner(bannerId).pool();
    const materials = pool.filter(entry => entry.kind === 'material');
    expect(pool.some(entry => entry.kind === 'creature')).toBe(false);
    expect(materials).toHaveLength(bannerId === 'standard' ? 18 : 3);
    expect(materials.every(entry => entry.stars <= 3)).toBe(true);
    const total = materials.reduce((sum, entry) => sum + entry.chance, 0);
    expect(total).toBeCloseTo(.989, 14);
    for (const [index, tier] of bannerMaterialTiers.entries()) {
      const entries = materials.filter(entry => entry.stars === index + 1);
      expect(entries.reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(total * tier.weight / 97, 14);
      expect(entries.every(entry => entry.amount === tier.amount)).toBe(true);
      if (bannerId === 'standard') expect(entries.map(entry => entry.id)).toEqual(elements.map(element => `${element.id}-${tier.rarity.toLowerCase()}`));
      else expect(entries[0].id).toBe(`rosethorn-${tier.rarity.toLowerCase()}`);
    }
    let boundary = 0;
    for (const entry of pool) {
      if (entry.kind === 'material') {
        for (const roll of [boundary + 1e-14, boundary + entry.chance - 1e-14]) {
          const { storage, account } = fixture();
          const random = vi.fn().mockReturnValueOnce(roll).mockReturnValue(.9);
          const result = summonCharacter(storage, random, bannerId);
          expect(result.materials).toEqual({ id: entry.id, amount: entry.amount });
          expect(result.account.materials).toEqual({ [entry.id]: entry.amount });
          expect(result.copy).toBeUndefined();
          expect(result.account.capturedCharacters).toEqual(account.capturedCharacters);
          expect(result.account.characters).toEqual(account.characters);
          expect(result.account.lycalis).toBe(90);
          expect(result.account.bannerPity?.[bannerId]).toEqual({ highestStar: 1, unownedHighestStar: 0 });
          expect(storage.setItem).toHaveBeenCalledTimes(1);
          expect(random).toHaveBeenCalledTimes(2);
          expect(loadAccount(storage)).toEqual(result.account);
        }
      }
      boundary += entry.chance;
    }
  });

  it.each(['standard', 'roses'] as const)('%s saves larger Rare duplicate bundles with pity and bonus in one write', bannerId => {
    const { storage, account } = fixture();
    const pool = getSummonBanner(bannerId).pool();
    for (const entry of pool) if (entry.kind === 'character') account.characters[entry.id] = { level: 0, evolution: 1 };
    account.bannerPity = { [bannerId]: { highestStar: 79, unownedHighestStar: 149 } };
    saveAccount(storage, account);
    vi.mocked(storage.setItem).mockClear();
    const rolls = bannerId === 'standard' ? [.5, .999, 0, 0] : [.5, 0, 0];
    const result = summonCharacter(storage, () => rolls.shift()!, bannerId);
    const id = bannerId === 'standard' ? 'chaotic-rare' : 'rosethorn-rare';
    expect(result.materials).toEqual({ id, amount: 15 });
    expect(result.account.materials[id]).toBe(15);
    expect(result.duplicate).toBe(true);
    expect(result.guarantee).toBe('all-owned-character');
    expect(result.account.bannerPity?.[bannerId]).toEqual({ highestStar: 0, unownedHighestStar: 0 });
    expect(result.bonusConduit).toBeDefined();
    expect(result.account.capturedCharacters).toEqual(account.capturedCharacters);
    expect(result.account.characters).toEqual(account.characters);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it.each(['overflow', 'write'] as const)('preserves raw wallet, currency and pity on %s failure', failure => {
    const { storage, account } = fixture();
    account.materials['infernic-rare'] = failure === 'overflow' ? Number.MAX_SAFE_INTEGER : 0;
    saveAccount(storage, account);
    vi.mocked(storage.setItem).mockClear();
    const raw = storage.getItem(ACCOUNT_KEY);
    if (failure === 'write') vi.mocked(storage.setItem).mockImplementation(() => { throw new Error('Write denied'); });
    expect(() => summonCharacter(storage, () => 0)).toThrow();
    expect(storage.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(storage.setItem).toHaveBeenCalledTimes(failure === 'write' ? 1 : 0);
  });
});
