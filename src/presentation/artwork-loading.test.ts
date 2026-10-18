// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindArtworkLoading } from './artwork-loading';

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

describe('shared artwork loading', () => {
  it('defers hidden and below-fold menu images without changing canonical paths or battle loading', async () => {
    const dispose = bindArtworkLoading(document.body);
    document.body.innerHTML = '<main><img src="portrait.png"><dialog><img src="hidden.png"></dialog><div class="battle-screen"><img src="enemy.png"></div><img loading="eager" src="hero.png"></main>';
    await Promise.resolve();
    const images = Array.from(document.images);
    expect(images.slice(0, 3).map(image => image.loading)).toEqual(['lazy', 'lazy', undefined]);
    expect(images[3].getAttribute('loading')).toBe('eager');
    expect(images.map(image => image.getAttribute('src'))).toEqual(['portrait.png', 'hidden.png', 'enemy.png', 'hero.png']);
    expect(images.every(image => image.decoding === 'async')).toBe(true);
    dispose();
  });

  it('reports real failures after one quiet automatic retry, offers one retry outside navigation controls and clears it on success', () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<button id="open"><img src="/assets/enemy.png?v=abc" alt="Boss"></button>';
    const dispose = bindArtworkLoading(document.body);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const navigate = vi.fn();
    document.querySelector('#open')!.addEventListener('click', navigate);
    const image = document.querySelector('img')!;
    image.dispatchEvent(new Event('error'));
    expect(report).not.toHaveBeenCalled();
    expect(document.querySelector('.artwork-retry')).toBeNull();
    vi.advanceTimersByTime(1000);
    expect(new URL(image.src).searchParams.has('retry')).toBe(true);
    vi.useRealTimers();
    image.dispatchEvent(new Event('error'));
    image.dispatchEvent(new Event('error'));
    expect(report).toHaveBeenCalled();
    expect(document.querySelectorAll('.artwork-retry')).toHaveLength(1);
    const button = document.querySelector<HTMLButtonElement>('.artwork-retry')!;
    expect(button.closest('#open')).toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Retry image: Boss');
    button.click();
    expect(navigate).not.toHaveBeenCalled();
    const url = new URL(image.src);
    expect(url.pathname).toBe('/assets/enemy.png');
    expect(url.searchParams.get('v')).toBe('abc');
    expect(url.searchParams.has('retry')).toBe(true);
    expect(image.loading).toBe('eager');
    image.dispatchEvent(new Event('load'));
    expect(document.querySelector('.artwork-retry')).toBeNull();
    dispose();
  });

  it('does not duplicate the Calamity boss error control and removes listeners on disposal', () => {
    document.body.innerHTML = '<img class="calamity-tier-boss" src="boss.png"><img src="currency.png">';
    const dispose = bindArtworkLoading(document.body);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    document.images[0].dispatchEvent(new Event('error'));
    expect(document.querySelector('.artwork-retry')).toBeNull();
    expect(report).not.toHaveBeenCalled();
    dispose();
    document.images[1].dispatchEvent(new Event('error'));
    expect(document.querySelector('.artwork-retry')).toBeNull();
  });

  it('falls back from AVIF to the canonical PNG silently, without reaching screen error listeners', () => {
    document.body.innerHTML = '<dialog open><img src="/assets/characters/ember-1.avif?v=r1" srcset="x 384w" sizes="auto" alt="Ember"></dialog>';
    const dispose = bindArtworkLoading(document.body);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const screen = vi.fn();
    document.querySelector('dialog')!.addEventListener('error', screen, true);
    const image = document.images[0];
    image.dispatchEvent(new Event('error'));
    expect(image.getAttribute('src')).toBe('/assets/characters/ember-1.png?v=r1');
    expect(image.hasAttribute('srcset')).toBe(false);
    expect(screen).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
    expect(document.querySelector('.artwork-retry')).toBeNull();
    dispose();
  });

  it('offers thumbnails to lazy portrait tiles and keeps them in step with in-place source swaps', async () => {
    const dispose = bindArtworkLoading(document.body);
    document.body.innerHTML = '<img src="/assets/characters/ember-1.avif?v=a"><div class="battle-screen"><img src="/assets/enemies/goblin.avif"></div><img src="/assets/abilities/x.avif">';
    await Promise.resolve();
    const [tile, battle, icon] = Array.from(document.images);
    expect(tile.getAttribute('srcset')).toBe('/assets/characters/ember-1.thumb.avif?v=a 384w, /assets/characters/ember-1.avif?v=a 960w');
    expect(tile.getAttribute('sizes')).toBe('auto');
    expect(battle.hasAttribute('srcset')).toBe(false);
    expect(icon.hasAttribute('srcset')).toBe(false);
    tile.src = '/assets/characters/ember-2.avif?v=b';
    await Promise.resolve();
    expect(tile.getAttribute('srcset')).toContain('ember-2.thumb.avif?v=b 384w');
    tile.setAttribute('src', 'data:image/svg+xml,pending');
    await Promise.resolve();
    expect(tile.hasAttribute('srcset')).toBe(false);
    dispose();
  });
});
