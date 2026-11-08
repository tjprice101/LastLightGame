import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { characterArt, characterName } from '../content/character-art';
import { getStarter, openingStarters, starters } from '../content/starters';
import { compactPortraitRevisions } from '../content/compact-portrait-revisions';
import { characterFacing } from './portrait';
import { compactPortrait, compactPortraitAttributes } from './compact-portrait';
import { pngFallback, setAvifPreferred, thumbnailSrcset } from './image-format';

afterEach(() => setAvifPreferred(false));

describe('reviewed compact faces', () => {
  it.each(openingStarters)('$name shares the exact reviewed derived face for every saved form', starter => {
    for (let formIndex = 1; formIndex <= 6; formIndex++) {
      const form = characterArt(starter.id, formIndex);
      const revision = createHash('sha256').update(readFileSync(`public/assets/character-faces/${form.art}.png`))
        .digest('hex').slice(0, 16);
      expect(compactPortraitRevisions[form.art]).toBe(revision);
      const attributes = compactPortraitAttributes(starter, formIndex, true);
      expect(attributes).toEqual({
        src: `${import.meta.env.BASE_URL}assets/character-faces/${form.art}.png?v=${revision}`,
        alt: `${characterName(starter.id, formIndex, true)}, face portrait`,
        width: 512, height: 512, available: true,
      });
      const html = compactPortrait(starter, formIndex);
      const facing = characterFacing(starter.id, formIndex);
      expect(html).toContain(`data-facing="${facing.facing}" data-mirrored="${facing.mirrored}"`);
      expect(html).toContain(`src="${attributes.src}"`);
      expect(html).not.toContain('style=');
    }
  });

  it('keeps unknown derived crops and undelivered Sunshade forms explicitly pending', () => {
    for (const starter of starters.filter(value => !openingStarters.some(pilot => pilot.id === value.id))) {
      for (let form = 1; form <= 6; form++) {
        const attributes = compactPortraitAttributes(starter, form);
        expect(attributes.available).toBe(false);
        expect(attributes.src).toMatch(/^data:image\/svg\+xml,/);
        expect(attributes.alt).toContain('face portrait pending');
        expect(attributes.src).not.toContain('/assets/');
        expect(compactPortrait(starter, form)).toContain('data-mirrored="false"');
      }
    }
    expect(() => compactPortraitAttributes(getStarter('ember'), 7)).toThrow();
  });

  it('preserves an explicit unreached silhouette without a second facing transform', () => {
    const html = compactPortrait(getStarter('tide'), 4, { revealed: false });
    expect(html).toContain('compact-portrait unreached-character-art');
    expect(html).toContain('alt="Unreached form;');
    expect(html.match(/data-mirrored=/g)).toHaveLength(1);
    expect(html).not.toContain('transform');
  });

  it('uses deployment-base versioned AVIF with the existing PNG fallback, never guessed thumbnails', () => {
    setAvifPreferred(true);
    const url = compactPortraitAttributes(getStarter('sprout'), 6).src;
    expect(url).toBe(`${import.meta.env.BASE_URL}assets/character-faces/flora-evo-6.avif?v=${compactPortraitRevisions['flora-evo-6']}`);
    expect(pngFallback(url)).toBe(url.replace('.avif', '.png'));
    expect(thumbnailSrcset(url)).toBeNull();
  });
});
