import { describe, expect, it, vi } from 'vitest';
import { bannerCharacterTierRates, resolveBannerPull, standardBannerPool, validateBannerPity, type BannerOutcome } from '../content/standard-banner';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, summonCharacter, validateAccount } from './account';
import { summonHub } from '../presentation/roster';
import { SAVE_KEY, type ProfileStorage } from './profile';

const pool = standardBannerPool();
const zero = { highestStar: 0, unownedHighestStar: 0 };
const due = { highestStar: 79, unownedHighestStar: 0 };
const sample: BannerOutcome[] = [
  { kind: 'character', id: 'five-a', stars: 5, chance: .005 },
  { kind: 'character', id: 'five-b', stars: 5, chance: .005 },
  { kind: 'character', id: 'six-a', stars: 6, chance: .0005 },
  { kind: 'character', id: 'six-b', stars: 6, chance: .0005 },
  { kind: 'creature', id: 'low', stars: 1, chance: .989 },
];

describe('single per-banner 80-pull pity', () => {
  it('preserves base rates and increments only the active counter without mutating inputs', () => {
    expect(bannerCharacterTierRates).toEqual({ 5: .01, 6: .001 });
    const counters = { highestStar: 10, unownedHighestStar: 20 };
    const result = resolveBannerPull(pool, [], counters, () => .5);
    expect(result.entry.kind).toBe('material');
    expect(result.guarantee).toBe('none');
    expect(result.pity).toEqual({ highestStar: 11, unownedHighestStar: 0 });
    expect(counters).toEqual({ highestStar: 10, unownedHighestStar: 20 });
  });

  it('guarantees exactly pull80, splitting tiers50/50 and entries equally within each tier', () => {
    expect(resolveBannerPull(sample, [], { highestStar: 78, unownedHighestStar: 499 }, () => .5).entry.kind).toBe('creature');
    for (const [roll, id] of [[0, 'five-a'], [.25 - 1e-10, 'five-a'], [.25, 'five-b'],
      [.5 - 1e-10, 'five-b'], [.5, 'six-a'], [.75, 'six-b'], [.999999, 'six-b']] as const) {
      const result = resolveBannerPull(sample, [], due, () => roll);
      expect(result.entry.id).toBe(id);
      expect(result.guarantee).toBe('unowned-character');
      expect(result.pity).toEqual(zero);
    }
  });

  it('excludes owned entries and falls back only when a tier has no unowned characters', () => {
    for (const roll of [0, .499999, .5, .999999]) {
      const result = resolveBannerPull(sample, ['five-a', 'five-b', 'six-a'], due, () => roll);
      expect(result.entry.id).toBe('six-b');
      expect(result.pity).toEqual(zero);
    }
    expect(resolveBannerPull(sample, ['six-a', 'six-b'], due, () => .99).entry.id).toBe('five-b');
    expect(resolveBannerPull(sample, ['five-a', 'six-a'], due, () => 0).entry.id).toBe('five-b');
    expect(resolveBannerPull(sample, ['five-a', 'six-a'], due, () => .5).entry.id).toBe('six-b');
  });

  it('uses only the available tier for single-tier banners and usual duplicates when all are owned', () => {
    const oneTier: BannerOutcome[] = [
      { kind: 'character', id: 'six', stars: 6, chance: .001 },
      { kind: 'creature', id: 'low', stars: 1, chance: .999 },
    ];
    expect(resolveBannerPull(oneTier, [], due, () => .99).entry.id).toBe('six');
    const owned = sample.filter(entry => entry.kind === 'character').map(entry => entry.id);
    expect(resolveBannerPull(sample, owned, due, () => 0)).toMatchObject({ entry: { id: 'five-a' }, guarantee: 'all-owned-character', pity: zero });
    expect(resolveBannerPull(sample, owned, due, () => .5)).toMatchObject({ entry: { id: 'six-a' }, guarantee: 'all-owned-character', pity: zero });
  });

  it('resets on every natural five/six-star result, new or duplicate', () => {
    for (const roll of [0, .005, .01, .0105]) for (const owned of [[], ['five-a', 'five-b', 'six-a', 'six-b']]) {
      const result = resolveBannerPull(sample, owned, { highestStar: 40, unownedHighestStar: 100 }, () => roll);
      expect(result.entry.kind).toBe('character');
      expect(result.guarantee).toBe('none');
      expect(result.pity).toEqual(zero);
    }
  });

  it('preserves legacy progress on read, honors overdue active counters, and retires the second guarantee', () => {
    const legacy = { highestStar: 199, unownedHighestStar: 499 };
    expect(validateBannerPity(legacy)).toEqual(legacy);
    expect(resolveBannerPull(sample, [], legacy, () => 0)).toMatchObject({ guarantee: 'unowned-character', pity: zero });
    expect(legacy).toEqual({ highestStar: 199, unownedHighestStar: 499 });
    expect(resolveBannerPull(sample, [], { highestStar: 0, unownedHighestStar: 499 }, () => .5))
      .toMatchObject({ guarantee: 'none', entry: { id: 'low' }, pity: { highestStar: 1, unownedHighestStar: 0 } });
  });

  it('preserves every base-probability boundary and consumes exactly one random draw', () => {
    let boundary = 0;
    for (let index = 0; index < pool.length - 1; index++) {
      boundary += pool[index].chance;
      expect(resolveBannerPull(pool, [], zero, () => boundary - 1e-12).entry.id).toBe(pool[index].id);
      expect(resolveBannerPull(pool, [], zero, () => boundary).entry.id).toBe(pool[index + 1].id);
    }
    for (const counters of [zero, due]) {
      const random = vi.fn(() => .5);
      resolveBannerPull(pool, [], counters, random);
      expect(random).toHaveBeenCalledTimes(1);
      for (const roll of [-1, 1, NaN, Infinity]) expect(() => resolveBannerPull(pool, [], counters, () => roll)).toThrow('[0, 1)');
    }
  });

  it('rejects invalid counters/pools before randomness', () => {
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

  it('shows one counter and preserves saved progress on load or a rejected/failed draw', () => {
    const map = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
    const storage: ProfileStorage = { getItem: key => map.get(key) ?? null,
      setItem: (key, value) => { map.set(key, value); }, removeItem: key => { map.delete(key); } };
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
    const html = summonHub(loaded);
    expect(html).toContain('199 / 80');
    expect(html).not.toContain('499 /');
    expect(html).toContain('50 / 50 tier chance');
    for (const bannerPity of [null, [], { unknown: zero }, { standard: { highestStar: 200, unownedHighestStar: 0 } }]) {
      expect(() => validateAccount({ ...account, bannerPity })).toThrow();
    }
    storage.setItem = () => { throw new Error('Write denied'); };
    expect(() => summonCharacter(storage, () => .5)).toThrow('Write denied');
    expect(storage.getItem(ACCOUNT_KEY)).toBe(before);
  });
});
