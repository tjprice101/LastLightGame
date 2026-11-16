// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./settings', () => ({ reducedMotion: () => motion.reduced }));
import { animateUnitWorkshop, resetUnitWorkshopEntrance } from './unit-luster';

function roster(): HTMLElement {
  document.body.innerHTML = '<section class="ref-bearer-collection"><div class="ref-bearer-grid"><button></button><button></button><button></button></div></section>';
  return document.body;
}
function store(selected: string): HTMLElement {
  document.body.innerHTML = `<section class="ref-conduit-store" data-store-mode="ordinary"><div class="info-catalog-grid">
    <button class="info-catalog-choice" data-store-conduit="vigil-core" aria-pressed="${selected === 'vigil-core'}"></button>
    <button class="info-catalog-choice" data-store-conduit="siegebound-drive" aria-pressed="${selected === 'siegebound-drive'}"></button></div>
    <aside class="ref-store-detail"><div class="ref-store-hero"></div></aside></section>`;
  return document.body;
}
function loadout(owner: string): HTMLElement {
  document.body.innerHTML = `<section class="conduit-loadout"><section class="loadout-master"></section><article class="loadout-slot"></article><article class="loadout-slot"></article>
    <div class="loadout-owned-list"><article class="loadout-owned-row"><button data-loadout-owner="${owner}"></button></article><article class="loadout-owned-row" hidden></article></div></section>`;
  return document.body;
}
const cascading = () => document.querySelectorAll('.luster-stagger-item').length;
const glinting = () => document.querySelectorAll('.luster-sheen').length;

beforeEach(() => { vi.useFakeTimers(); motion.reduced = false; resetUnitWorkshopEntrance(); });
afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ''; });

describe('Element-Bearer and Conduit workshop entrance (D-466)', () => {
  it('cascades roster cards once per arrival and never on a re-render', () => {
    animateUnitWorkshop(roster());
    expect(cascading()).toBe(3);
    vi.advanceTimersByTime(2000);
    expect(cascading()).toBe(0);
    animateUnitWorkshop(roster());
    expect(cascading()).toBe(0);
  });

  it('skips hidden owned Conduits and treats each Bearer loadout as its own arrival', () => {
    animateUnitWorkshop(loadout('ember'));
    expect(cascading()).toBe(4);
    expect(document.querySelector('.loadout-owned-row[hidden]')?.classList.contains('luster-stagger-item')).toBe(false);
    vi.advanceTimersByTime(2000);
    animateUnitWorkshop(loadout('ember'));
    expect(cascading()).toBe(0);
    animateUnitWorkshop(loadout('tide'));
    expect(cascading()).toBe(4);
  });

  it('glints the selected Conduit only when the player picks a different one', () => {
    animateUnitWorkshop(store('vigil-core'));
    expect(glinting()).toBe(0);
    vi.advanceTimersByTime(2000);
    animateUnitWorkshop(store('vigil-core'));
    expect(glinting()).toBe(0);
    animateUnitWorkshop(store('siegebound-drive'));
    expect(cascading()).toBe(0);
    expect(document.querySelector('.ref-store-hero .luster-sheen')).not.toBeNull();
    vi.advanceTimersByTime(2000);
    expect(glinting()).toBe(0);
  });

  it('replays after leaving the workshop and stays static under Reduce motion', () => {
    animateUnitWorkshop(roster());
    vi.advanceTimersByTime(2000);
    document.body.innerHTML = '<div class="home"></div>';
    animateUnitWorkshop(document.body);
    animateUnitWorkshop(roster());
    expect(cascading()).toBe(3);
    vi.advanceTimersByTime(2000);
    resetUnitWorkshopEntrance();
    motion.reduced = true;
    animateUnitWorkshop(store('vigil-core'));
    animateUnitWorkshop(store('siegebound-drive'));
    expect(cascading() + glinting()).toBe(0);
  });
});

describe('Workshop Jewel & Gold skin (D-466)', () => {
  const css = (name: string) => readFileSync(resolve(__dirname, name), 'utf8');
  it('replaces mono-gray surfaces, borders and text with tokens', () => {
    for (const name of ['upgrade-result.css', 'calamitic-ascension.css', 'calamity.css', 'shop-host.css', 'roster.css', 'squad-formation.css',
      'saved-loadouts.css', 'conduit-loadout.css', 'conduit-store.css', 'conduit-upgrade.css', '../character-screen.css']) {
      expect(css(name), name).not.toMatch(/#(1a1a1c|18181b|131314|0b0b0c|09090c|2d2d31|3a3a3f|a9a9ae|f4f4f5|211b1b|a94646)\b/i);
    }
  });
  it('fills growth progress with gold and keeps mint off Level and Evolution bars', () => {
    const workshop = css('unit-workshop.css');
    expect(workshop).toMatch(/\.workspace-evolution-steps \.is-filled i[^{]*\{\s*background: var\(--gild-fill\)/);
    expect(workshop).toContain('@layer menu-reference');
  });
  it('keeps Squad formation controls at the 44px target', () => {
    expect(css('unit-workshop.css')).toMatch(/\.squad-change, \.squad-remove\)[^{]*\{ min-height: 44px/);
  });
});
