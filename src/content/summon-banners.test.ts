import { describe, expect, it, vi } from 'vitest';
import { getSummonBanner, isSummonBannerId, summonBanners } from './summon-banners';
import { standardBannerPool } from './standard-banner';
import { bannerNavigation, summonHub } from '../presentation/roster';
import { ACCOUNT_KEY, emptyAccount, saveAccount, summonCharacter } from '../game/account';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';

describe('summon banner selection', () => {
  it('registers Standard and the approved rose event banner', () => {
    expect(summonBanners.map((banner) => banner.id)).toEqual(['standard', 'roses']);
    expect(getSummonBanner('standard').pool()).toEqual(standardBannerPool());
    expect(isSummonBannerId('standard')).toBe(true);
    for (const id of ['event', '', null, undefined]) expect(isSummonBannerId(id)).toBe(false);
    expect(() => getSummonBanner('event')).toThrow('Unknown summon banner');
  });
  it('renders a visible selector and derives the panel from the selected banner without mutation', () => {
    const account = emptyAccount();
    account.lycalis = 10;
    account.bannerPity = { standard: { highestStar: 14, unownedHighestStar: 25 } };
    const before = structuredClone(account);
    const html = summonHub(account, 'standard');
    expect(html).toContain('aria-label="Summon banners"');
    expect(html).toContain('data-summon-banner="standard" aria-current="page"');
    expect(html).toContain('data-banner="standard"');
    expect(html).toContain('14 / 200');
    expect(html).toContain('25 / 500');
    expect(html.match(/data-banner-entry=/g)).toHaveLength(22);
    expect(html).not.toContain('Event Banner');
    expect(account).toEqual(before);
  });
  it('supports multiple authored selector entries with exactly one current banner', () => {
    const fixtures = [{ id: 'standard', name: 'Standard Banner' }, { id: 'test-event', name: 'Test Event Banner' }];
    for (const id of ['standard', 'test-event']) {
      const html = bannerNavigation(fixtures, id);
      expect(html.match(/data-summon-banner=/g)).toHaveLength(2);
      expect(html.match(/aria-current="page"/g)).toHaveLength(1);
      expect(html).toContain(`data-summon-banner="${id}" aria-current="page"`);
    }
    expect(() => bannerNavigation(fixtures, 'unknown')).toThrow('missing');
  });
  it('rejects an unregistered banner before RNG, spending or save writes', () => {
    const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
    const saved: ProfileStorage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: vi.fn((key, value) => { values.set(key, value); }),
      removeItem: (key) => { values.delete(key); },
    };
    const account = emptyAccount();
    account.lycalis = 20;
    saveAccount(saved, account);
    const raw = saved.getItem(ACCOUNT_KEY);
    vi.mocked(saved.setItem).mockClear();
    const random = vi.fn(() => .5);
    expect(() => summonCharacter(saved, random, 'event')).toThrow('Unknown summon banner');
    expect(random).not.toHaveBeenCalled();
    expect(saved.setItem).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const result = summonCharacter(saved, random, 'standard');
    expect(result.account.lycalis).toBe(10);
    expect(result.account.bannerPity?.standard).toEqual({ highestStar: 1, unownedHighestStar: 1 });
    expect(saved.setItem).toHaveBeenCalledTimes(1);
  });
});
