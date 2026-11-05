import { describe, expect, it } from 'vitest';
import { moonCharacters } from '../content/moon-sunshade-characters';
import { moonSunshadeEvents, type ScheduledEventWindow } from '../content/moon-sunshade-events';
import { summonBanners } from '../content/summon-banners';
import { activityAccess } from './activity-access';
import { ACCOUNT_KEY, emptyAccount, saveAccount, summonCharacter } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { summonHub } from '../presentation/roster';

function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: key => { values.delete(key); },
  };
}

function withOpenMoonWindow<T>(run: () => T): T {
  const event = moonSunshadeEvents.find(entry => entry.id === 'moon')!;
  const schedule = event as unknown as { windows: ScheduledEventWindow[] };
  const original = schedule.windows;
  schedule.windows = [{ opensAt: 0, closesAt: 10_000 }];
  try {
    return run();
  } finally {
    schedule.windows = original;
  }
}

describe('Moon and Sunshade art-neutral authority', () => {
  it('keeps new events closed, prevents local entry and shows disabled art-neutral banner controls', () => {
    const saved = storage();
    const account = emptyAccount();
    account.fractalis = 100;
    account.lycalis = 100;
    account.characters.ember = { level: 30, evolution: 1 };
    saveAccount(saved, account);
    const before = saved.getItem(ACCOUNT_KEY);
    expect(activityAccess(account, { kind: 'infusion', mode: 'moon', stage: 1 }, 100).unlocked).toBe(false);
    expect(activityAccess(account, { kind: 'infusion', mode: 'sunshade', stage: 1 }, 100).unlocked).toBe(false);
    expect(() => summonCharacter(saved, () => 0, 'moon', 100)).toThrow('not active');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    const screen = summonHub(account, 'moon', { online: true, now: 100 });
    expect(screen).toContain('Artwork pending');
    expect(screen).toContain('Not launched or not active');
    expect(screen).toMatch(/id="summon-character"[^>]*disabled/);
    expect(screen).toContain('Moonwake');
    expect(screen).not.toMatch(/<th[^>]*>\s*moonwake-common\s*<\/th>/);
    expect(summonBanners.find(banner => banner.id === 'moon')?.pool().reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(1);
  });

  it('uses independent single 80-pull pity, one draw roll and a matching 15-Bloom duplicate conversion', () => {
    withOpenMoonWindow(() => {
      const saved = storage();
      const account = emptyAccount();
      account.lycalis = 100;
      account.eventBannerPity = { moon: 79 };
      saveAccount(saved, account);
      let rolls = 0;
      const pity = summonCharacter(saved, () => { rolls++; return .7; }, 'moon', 100);
      expect(pity.entry.kind).toBe('character');
      expect(pity.guarantee).toBe('event pity');
      expect(pity.account.eventBannerPity?.moon).toBe(0);
      expect(pity.account.lycalis).toBe(90);
      expect(pity.bonusConduit).toBeUndefined();
      expect(rolls).toBe(1);

      const duplicates = storage();
      const owned = emptyAccount();
      owned.lycalis = 100;
      for (const character of moonCharacters) owned.characters[character.id] = { level: 0, evolution: 1 };
      saveAccount(duplicates, owned);
      rolls = 0;
      const duplicate = summonCharacter(duplicates, () => { rolls++; return 0; }, 'moon', 100);
      expect(duplicate.duplicate).toBe(true);
      expect(duplicate.materials).toEqual({ id: 'moonwake-rare', amount: 15 });
      expect(duplicate.account.materials['moonwake-rare']).toBe(15);
      expect(duplicate.account.eventBannerPity?.moon).toBe(0);
      expect(rolls).toBe(1);
    });
  });

  it('rejects invalid event pity save values without normalizing or writing them', () => {
    const invalid = emptyAccount();
    invalid.eventBannerPity = { moon: 80 };
    expect(() => saveAccount(storage(), invalid)).toThrow('Invalid saved event banner pity.');
  });
});
