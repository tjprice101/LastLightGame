// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { getSummonBanner } from '../content/summon-banners';
import { summonHub, bindSummonRates } from './roster';

describe('Uncluttered banner layout', () => {
  it.each(['standard', 'roses'] as const)('keeps %s rates and all outcome details inside one dialog', id => {
    const host = document.createElement('div');
    host.innerHTML = summonHub(emptyAccount(), id);
    bindSummonRates(host);
    const dialog = host.querySelector<HTMLDialogElement>('#summon-information')!;
    expect(dialog.open).toBe(false);
    expect(host.querySelectorAll('[data-information="summon-information"]')).toHaveLength(1);
    expect(host.querySelectorAll('#summon-character')).toHaveLength(1);
    expect(host.querySelectorAll('[data-banner-character], .star-badge, .banner-showcase-control, .ref-summon-rates')).toHaveLength(0);
    expect(dialog.querySelectorAll('[data-banner-entry]')).toHaveLength(getSummonBanner(id).pool().length);
    expect(host.querySelectorAll('.summon-rates')).toHaveLength(1);
    expect(host.querySelector('.ref-summon-hero')?.textContent?.trim()).toBe(getSummonBanner(id).name);
    const characters = getSummonBanner(id).pool().filter(entry => entry.kind === 'character');
    const featured = host.querySelector('.summon-featured')!;
    expect(featured.querySelectorAll('[data-featured-character]')).toHaveLength(characters.length);
    expect(Array.from(featured.querySelectorAll<HTMLElement>('[data-featured-tier]')).map(tier => tier.dataset.featuredTier))
      .toEqual([...new Set(characters.map(entry => String(entry.stars)))].sort().reverse());
    expect(featured.textContent).not.toMatch(/%|per draw/);
    dialog.querySelector<HTMLButtonElement>('[data-rate-stars="6"]')!.click();
    expect(Array.from(dialog.querySelectorAll<HTMLElement>('[data-rate-tier]'))
      .filter(tier => !tier.hidden).map(tier => tier.dataset.rateTier)).toEqual(['6']);
    expect(Array.from(dialog.querySelectorAll<HTMLElement>('[data-entry-stars]'))
      .filter(row => !row.hidden).every(row => row.dataset.entryStars === '6')).toBe(true);
    dialog.querySelector<HTMLButtonElement>('[data-rate-stars="all"]')!.click();
    expect(Array.from(dialog.querySelectorAll<HTMLElement>('[data-rate-tier]')).every(tier => !tier.hidden)).toBe(true);
    dialog.remove();
    expect(host.querySelectorAll('table, [data-banner-entry], .summon-rules')).toHaveLength(0);
  });
});
