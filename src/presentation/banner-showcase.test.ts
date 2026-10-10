import { describe, expect, it } from 'vitest';
import { summonBanners } from '../content/summon-banners';
import { getStarter, isStarterId, openingStarters } from '../content/starters';
import { characterName } from '../content/character-art';
import { portraitAttributes } from './portrait';
import { bannerShowcase } from './banner-showcase';
import { homeHub } from './hub';
import { summonHub } from './roster';
import { emptyAccount } from '../game/account';

describe('banner showcases', () => {
  it.each(summonBanners)('$name lists exactly its real high-star base forms with artwork and elements', (banner) => {
    const html = bannerShowcase(banner.id);
    const expected = banner.pool().filter((entry) => entry.kind === 'character' && entry.stars >= 5);
    expect(html.match(/data-showcase-character=/g)).toHaveLength(expected.length);
    expect(html).toContain(`id="banner-showcase-${banner.id}"`);
    expect(html).toContain(`${banner.name} · Showcase`);
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-label="Close Showcase"');
    for (const entry of expected) {
      if (!isStarterId(entry.id)) throw new Error('Invalid test character.');
      const character = getStarter(entry.id);
      expect(html).toContain(`data-showcase-character="${character.id}"`);
      expect(html).toContain(portraitAttributes(character, 1).src);
      expect(html).toContain(`<h3>${characterName(character.id, 1)}</h3>`);
      expect(html).toContain(`data-element="${character.elementId}"`);
      expect(html).toContain(`${entry.stars}-star Element-Bearer`);
    }
    expect(html).not.toMatch(/infusion:|data-banner-entry|summon-character|silhouette/);
  });
  it('adds independent controls to both Home banners and the selected Summon banner without mutating the account', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 105, evolution: 6 };
    const before = structuredClone(account);
    const home = homeHub(openingStarters[0], false, account);
    for (const banner of summonBanners) {
      expect(home).toContain(`data-information="banner-showcase-${banner.id}"`);
      expect(summonHub(account, banner.id)).toContain(`data-information="banner-showcase-${banner.id}"`);
    }
    expect(account).toEqual(before);
  });
});
