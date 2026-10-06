import { describe, expect, it, vi } from 'vitest';
import { bannerCharacterTierRates, resolveBannerPull, standardBannerPool, validateBannerPity, type BannerOutcome } from '../content/standard-banner';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, summonCharacter, validateAccount } from './account';
import { summonHub } from '../presentation/roster';
import { SAVE_KEY, type ProfileStorage } from './profile';

const pool = standardBannerPool();
const zero = { highestStar: 0, unownedHighestStar: 0 };
const owned = ['ember', 'tide', 'sprout'];

describe('independent per-banner pity', () => {
  it('uses 1% total five-star and 0.1% total future six-star rates', () => {
    expect(bannerCharacterTierRates).toEqual({ 5: .01, 6: .001 });
  });
  it('increments both counters on a lower-star outcome and never mutates inputs', () => {
    const counters = { highestStar: 10, unownedHighestStar: 20 };
    const result = resolveBannerPull(pool, owned, counters, () => .5);
    expect(result.entry.kind).toBe('creature');
    expect(result.guarantee).toBe('none');
    expect(result.pity).toEqual({ highestStar: 11, unownedHighestStar: 21 });
    expect(counters).toEqual({ highestStar: 10, unownedHighestStar: 20 });
  });
  it('guarantees the highest tier on exactly pull200, including every equal-split boundary', () => {
    expect(resolveBannerPull(pool, owned, { highestStar: 198, unownedHighestStar: 250 }, () => .5).entry.kind).toBe('creature');
    for (const [roll, id] of [[0, 'ember'], [1 / 3 - 1e-10, 'ember'], [1 / 3, 'tide'], [2 / 3, 'sprout'], [.999999, 'sprout']] as const) {
      const result = resolveBannerPull(pool, owned, { highestStar: 199, unownedHighestStar: 250 }, () => roll);
      expect(result.entry.id).toBe(id);
      expect(result.guarantee).toBe('highest-star');
      expect(result.pity).toEqual({ highestStar: 0, unownedHighestStar: 251 });
    }
  });
  it('resets only the200 counter for a natural duplicate and both for a natural new highest-star character', () => {
    const counters = { highestStar: 100, unownedHighestStar: 300 };
    expect(resolveBannerPull(pool, ['ember'], counters, () => 0).pity).toEqual({ highestStar: 0, unownedHighestStar: 301 });
    const newResult = resolveBannerPull(pool, ['ember'], counters, () => .004);
    expect(newResult.entry.id).toBe('tide');
    expect(newResult.pity).toEqual(zero);
  });
  it('guarantees an unowned highest-tier character on exactly pull500, with priority over200', () => {
    expect(resolveBannerPull(pool, ['ember'], { highestStar: 50, unownedHighestStar: 498 }, () => .5).pity)
      .toEqual({ highestStar: 51, unownedHighestStar: 499 });
    for (const highestStar of [0, 199]) for (const [roll, id] of [[0, 'tide'], [.5 - 1e-10, 'tide'], [.5, 'sprout'], [.999999, 'sprout']] as const) {
      const result = resolveBannerPull(pool, ['ember'], { highestStar, unownedHighestStar: 499 }, () => roll);
      expect(result.entry.id).toBe(id);
      expect(result.guarantee).toBe('unowned-highest-star');
      expect(result.pity).toEqual(zero);
    }
    expect(resolveBannerPull(pool, ['ember', 'sprout'], { highestStar: 0, unownedHighestStar: 499 }, () => .99).entry.id).toBe('tide');
  });
  it('falls back to an ordinary highest-star duplicate result when all are owned, resetting both', () => {
    for (const roll of [0, .5, .999999]) {
      const result = resolveBannerPull(pool, owned, { highestStar: 25, unownedHighestStar: 499 }, () => roll);
      expect(result.entry.stars).toBe(5);
      expect(owned).toContain(result.entry.id);
      expect(result.guarantee).toBe('all-owned-highest-star');
      expect(result.pity).toEqual(zero);
    }
  });
  it('targets six-star characters only when that tier actually exists, not lower unowned characters', () => {
    // Test-only six-star fixtures; these are not registered game content.
    const future: BannerOutcome[] = [
      { kind: 'creature', id: 'low', stars: 1, chance: .989 },
      { kind: 'character', id: 'five', stars: 5, chance: .01 },
      { kind: 'character', id: 'six-a', stars: 6, chance: .0005 },
      { kind: 'character', id: 'six-b', stars: 6, chance: .0005 },
    ];
    const lower = resolveBannerPull(future, [], { highestStar: 25, unownedHighestStar: 35 }, () => .995);
    expect(lower.entry.id).toBe('five');
    expect(lower.pity).toEqual({ highestStar: 26, unownedHighestStar: 36 });
    expect(resolveBannerPull(future, [], { highestStar: 199, unownedHighestStar: 25 }, () => .9).entry.id).toBe('six-b');
    expect(resolveBannerPull(future, ['six-a'], { highestStar: 0, unownedHighestStar: 499 }, () => 0).entry.id).toBe('six-b');
    const all = resolveBannerPull(future, ['six-a', 'six-b'], { highestStar: 0, unownedHighestStar: 499 }, () => 0);
    expect(all.entry.id).toBe('six-a');
    expect(all.guarantee).toBe('all-owned-highest-star');
  });
  it('has exact base-probability boundaries and consumes one roll per resolution, even for guarantees', () => {
    let boundary = 0;
    for (let index = 0; index < pool.length - 1; index++) {
      boundary += pool[index].chance;
      expect(resolveBannerPull(pool, [], zero, () => boundary - 1e-12).entry.id).toBe(pool[index].id);
      expect(resolveBannerPull(pool, [], zero, () => boundary).entry.id).toBe(pool[index + 1].id);
    }
    for (const counters of [zero, { highestStar: 199, unownedHighestStar: 0 }, { highestStar: 0, unownedHighestStar: 499 }]) {
      const random = vi.fn(() => .5);
      resolveBannerPull(pool, [], counters, random);
      expect(random).toHaveBeenCalledTimes(1);
      for (const roll of [-1, 1, NaN, Infinity]) expect(() => resolveBannerPull(pool, [], counters, () => roll)).toThrow('[0, 1)');
    }
  });
  it('rejects invalid counters/pools before using randomness', () => {
    for (const value of [null, [], {}, { ...zero, highestStar: 200 }, { ...zero, highestStar: -1 },
      { ...zero, highestStar: 1.5 }, { ...zero, unownedHighestStar: 500 }, { ...zero, unownedHighestStar: NaN }]) {
      expect(() => validateBannerPity(value)).toThrow('pity');
    }
    const random = vi.fn(() => 0);
    for (const invalid of [[], [...pool, pool[0]], [{ ...pool[0], chance: NaN }], [{ ...pool[0], chance: .5 }],
      [{ kind: 'creature', id: 'only', stars: 1, chance: 1 }] as BannerOutcome[]]) {
      expect(() => resolveBannerPull(invalid, [], zero, random)).toThrow();
    }
    expect(random).not.toHaveBeenCalled();
  });
  it('preserves optional saved pity, shows progress, and neither loads nor failed draws advance it', () => {
    const map = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
    const storage: ProfileStorage = { getItem: (key) => map.get(key) ?? null,
      setItem: (key, value) => { map.set(key, value); }, removeItem: (key) => { map.delete(key); } };
    expect(loadAccount(storage).bannerPity).toBeUndefined();
    expect(storage.getItem(ACCOUNT_KEY)).toBeNull();
    const account = emptyAccount();
    account.lycalis = 100;
    account.bannerPity = { standard: { highestStar: 199, unownedHighestStar: 499 } };
    saveAccount(storage, account);
    const before = storage.getItem(ACCOUNT_KEY);
    const loaded = loadAccount(storage);
    expect(loaded.bannerPity).toEqual(account.bannerPity);
    expect(() => summonCharacter(storage, () => -1)).toThrow('[0, 1)');
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
    expect(summonHub(loaded)).toContain('199 / 200');
    expect(summonHub(loaded)).toContain('499 / 500');
    expect(summonHub(loaded)).toContain('500 guarantee takes priority');
    for (const bannerPity of [null, [], { unknown: zero }, { standard: { highestStar: 200, unownedHighestStar: 0 } }]) {
      expect(() => validateAccount({ ...account, bannerPity })).toThrow();
    }
    const write = storage.setItem;
    storage.setItem = () => { throw new Error('Write denied'); };
    expect(() => saveAccount(storage, { ...loaded, bannerPity: { standard: zero } })).toThrow('Write denied');
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
    storage.setItem = write;
    expect(loadAccount(storage).bannerPity).toEqual(account.bannerPity);
  });
});
