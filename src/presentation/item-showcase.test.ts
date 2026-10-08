import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import * as dungeonArtwork from '../content/dungeon-art';
import { emptyAccount } from '../game/account';
import { gameplayHub } from './gameplay';
import { itemShowcase } from './item-showcase';

describe('activity item artwork', () => {
  it('uses dedicated currency PNGs and exact readable quantities', () => {
    const html = itemShowcase([{ id: 'fractalis', amount: Number.MAX_SAFE_INTEGER }, { id: 'lycalis', amount: 10 }], 'Sale value');
    expect(html).toContain('currencies/fractalis.png');
    expect(html).toContain('currencies/lycalis.png');
    expect(html).toContain('9,007,199,254,740,991');
    expect(html).toContain('aria-label="Sale value"');
    expect(html).not.toContain('materials/fractalis');
  });
  it('uses registered elemental/specialty PNGs', () => {
    const html = itemShowcase([{ id: 'infernic-common' }, { id: 'heavens-evolution' }, { id: 'abyss-level' }, { id: 'ominous-omnic' }], 'Rewards');
    expect(html).toContain('materials/infernic-seed.png');
    expect(html).toContain('materials/heavens-crown-scarlet-oath.png');
    expect(html).toContain('materials/abyss-hourglass-endless-wrath.png');
    expect(html).toContain('Soul of Ominous');
    expect(html).not.toContain('Artwork pending');
    expect(html).toContain('materials/ominous-soul.png');
    expect(() => itemShowcase([{ id: 'unknown' }], 'Rewards')).toThrow('Unknown material');
  });
  it('keeps a named neutral tile when future material artwork is unavailable', () => {
    const art = vi.spyOn(dungeonArtwork, 'materialArt').mockReturnValue(undefined);
    try {
      const html = itemShowcase([{ id: 'ominous-omnic' }], 'Rewards');
      expect(html).toContain('Soul of Ominous');
      expect(html).toContain('Artwork pending');
      expect(html).not.toContain('<img');
    } finally { art.mockRestore(); }
  });
  it('shows only the currencies and materials associated with each activity', () => {
    const html = gameplayHub(emptyAccount());
    const group = (id: string, next: string) => html.slice(html.indexOf(`id="gameplay-${id}"`), html.indexOf(`id="gameplay-${next}"`));
    expect(group('adventure', 'dungeons')).toContain('currencies/fractalis.png');
    expect(group('adventure', 'dungeons')).not.toContain('currencies/lycalis.png');
    const dungeons = group('dungeons', 'infusion');
    expect(dungeons).toContain('infernic-seed.png');
    expect(dungeons).toContain('aquatic-soul.png');
    expect(dungeons).not.toContain('currencies/lycalis.png');
    const infusion = group('infusion', 'currency');
    expect(infusion).toContain('heavens-dawnsteel-of-judgment.png');
    expect(infusion).toContain('abyss-voidfang-of-ruin.png');
    const farms = group('currency', 'story');
    const treasury = farms.slice(0, farms.indexOf('assets/banners/sanctuary-banner.png'));
    expect(treasury).toContain('currencies/fractalis.png');
    expect(treasury).not.toContain('currencies/lycalis.png');
    expect(farms).toContain('currencies/lycalis.png');
  });
  it('references only existing exported PNGs on activity reward displays', () => {
    const html = gameplayHub(emptyAccount());
    const sections = html.match(/<section class="item-showcase"[\s\S]*?<\/section>/g) ?? [];
    expect(sections).toHaveLength(17);
    expect(sections.some((section) => section.includes('Broken Mechanical Components') && section.includes('currencies/mechanical-components.png'))).toBe(true);
    for (const section of sections) {
      for (const match of section.matchAll(/src="[^"]*assets\/([^"]+)"/g)) {
        expect(existsSync(resolve('public', 'assets', ...match[1].split('?')[0].split('/'))), match[1]).toBe(true);
      }
    }
  });
});
