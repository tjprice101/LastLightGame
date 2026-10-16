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

  it('reports real failures, offers one retry outside navigation controls and clears it on success', () => {
    document.body.innerHTML = '<button id="open"><img src="/assets/enemy.png?v=abc" alt="Boss"></button>';
    const dispose = bindArtworkLoading(document.body);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const navigate = vi.fn();
    document.querySelector('#open')!.addEventListener('click', navigate);
    const image = document.querySelector('img')!;
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
});
