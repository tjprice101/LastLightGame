// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rarityColors, rarities } from '../content/rarity';
import { materialRarity } from '../content/dungeon-art';
import { conduitColor, getConduit } from '../content/conduits';
import { capturedRarity } from './owned-companion';
import { rarityFeedback, clearRarityFeedback } from './rarity-feedback';
import { celebrateBattleResults } from './battle-results';
import { createBattle } from '../game/battle';
import { presentReward } from './reward-screen';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./settings', () => ({ reducedMotion: () => motion.reduced }));

let media: EventTarget & { matches: boolean };
beforeEach(() => {
  vi.useFakeTimers();
  media = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal('matchMedia', () => media);
});
afterEach(() => {
  clearRarityFeedback(document.body);
  document.body.replaceChildren();
  motion.reduced = false;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function target() {
  const element = document.createElement('div');
  document.body.append(element);
  return element;
}

describe('shared rarity feedback', () => {
  it.each(rarities)('matches the %s CSS palette and never consumes randomness', rarity => {
    const css = readFileSync(join(process.cwd(), 'src', 'presentation', 'rarity-feedback.css'), 'utf8');
    expect(css).toContain(`--rarity-${rarity.toLowerCase()}: ${rarityColors[rarity]}`);
    const random = vi.spyOn(Math, 'random');
    const host = target();
    rarityFeedback(host, rarity);
    expect(host.querySelector('.rarity-feedback')?.getAttribute('data-rarity')).toBe(rarity);
    expect(host.querySelectorAll('.rarity-feedback-spark')).toHaveLength(12);
    expect(host.querySelectorAll('.rarity-feedback-mote')).toHaveLength(16);
    expect(host.querySelector('.rarity-feedback')?.getAttribute('aria-hidden')).toBe('true');
    expect(random).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1150);
    expect(host.childElementCount).toBe(0);
    expect(host.classList.contains('rarity-feedback-host')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('fits a circular expanding impact and radial sparks to the shorter card dimension', () => {
    const host = target();
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 360, 80));
    rarityFeedback(host, 'Calamitic', 'Conduit equipped');
    const effect = host.querySelector<HTMLElement>('.rarity-feedback')!;
    expect(parseFloat(effect.style.getPropertyValue('--impact-size'))).toBeCloseTo(57.6);
    expect(effect.style.getPropertyValue('--spark-distance')).toBe('32px');
    expect(effect.querySelectorAll('[aria-hidden="true"]')).toHaveLength(30);
    const css = readFileSync(join(process.cwd(), 'src', 'presentation', 'rarity-feedback.css'), 'utf8');
    expect(css).toContain('width: var(--impact-size); height: var(--impact-size);');
    expect(css).toContain('border-radius: 50%');
    expect(css).toContain('scale(.15)');
    expect(css).toContain('scale(1.25)');
    expect(css).toContain('animation: rarity-ring 850ms cubic-bezier(.2,.7,.3,1) both, rarity-calamitic-pulse');
  });

  it('keeps actual material, Conduit and captured-form rarities, without inventing specialty rarity', () => {
    expect(materialRarity('infernic-rare')).toBe('Rare');
    expect(materialRarity('rosethorn-omnic')).toBe('Omnic');
    expect(materialRarity('unknown-specialty')).toBeUndefined();
    expect(conduitColor(getConduit('vigil-core'))).toBe(rarityColors.Common);
    expect(capturedRarity('infusion:roses:5')).toBe('Omnic');
    expect(capturedRarity('infusion:heavens:0')).toBe('Common');
    expect(() => capturedRarity('adventure:goblin')).toThrow('Invalid captured');
  });

  it('escapes pop-up text and old cleanup cannot cancel a replacement', () => {
    const host = target();
    const stale = rarityFeedback(host, 'Rare', '<img src=x>');
    expect(host.querySelector('[role="status"]')?.textContent).toBe('<img src=x>');
    expect(host.querySelector('img')).toBeNull();
    rarityFeedback(host, 'Calamitic', 'Conduit equipped');
    stale();
    expect(host.querySelectorAll('.rarity-feedback')).toHaveLength(1);
    expect(host.classList.contains('rarity-feedback-host')).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(1800);
    expect(host.childElementCount).toBe(0);
  });

  it('uses static feedback for explicit reduced motion and responds live', () => {
    motion.reduced = true;
    const host = target();
    rarityFeedback(host, 'Omnic', 'Master equipped');
    const effect = host.querySelector('.rarity-feedback')!;
    expect(effect.classList.contains('rarity-feedback-reduced')).toBe(true);
    motion.reduced = false;
    media.matches = false;
    window.dispatchEvent(new Event('last-light-motion-change'));
    expect(effect.classList.contains('rarity-feedback-reduced')).toBe(false);
    const css = readFileSync(join(process.cwd(), 'src', 'presentation', 'rarity-feedback.css'), 'utf8');
    expect(css).toContain('.rarity-feedback.rarity-feedback-reduced > .rarity-feedback-ring { display: block; animation: none;');
  });

  it('preserves the explicit game motion setting despite device reduction (D-187)', () => {
    media.matches = true;
    const host = target();
    rarityFeedback(host, 'Omnic');
    expect(host.querySelector('.rarity-feedback')?.classList.contains('rarity-feedback-reduced')).toBe(false);
  });

  it('cleans detached effects, disconnected targets and explicit host disposal', async () => {
    rarityFeedback(document.createElement('div'), 'Epic');
    expect(vi.getTimerCount()).toBe(0);
    const parent = target();
    const child = document.createElement('div');
    parent.append(child);
    rarityFeedback(child, 'Epic');
    child.remove();
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
    parent.append(child);
    rarityFeedback(child, 'Rare');
    clearRarityFeedback(parent);
    expect(vi.getTimerCount()).toBe(0);
    expect(child.childElementCount).toBe(0);
  });

  it('celebrates victory once per result state, never defeat', () => {
    const host = target();
    const state = createBattle(1);
    host.innerHTML = '<section class="result-defeat"><div class="battle-result-title"></div></section>';
    celebrateBattleResults(host, state);
    expect(host.querySelector('.rarity-feedback')).toBeNull();
    host.innerHTML = '<section class="result-victory"><div class="battle-result-title"></div><ul class="battle-result-rewards"><li data-rarity="Calamitic">Chest</li></ul></section>';
    celebrateBattleResults(host, state);
    expect(host.querySelectorAll('.rarity-feedback')).toHaveLength(2);
    clearRarityFeedback(host);
    celebrateBattleResults(host, state);
    expect(host.querySelector('.rarity-feedback')).toBeNull();
  });
});

describe('saved reward rarity reveals', () => {
  function dialogSupport() {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    } });
    let finish: (() => void) | undefined;
    const cancel = vi.fn();
    vi.stubGlobal('Animation', class {});
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: vi.fn(() => ({
      cancel, set onfinish(callback: () => void) { finish = callback; },
    })) });
    return { finish: () => finish!(), cancel };
  }
  const reward = { title: 'Summoned', name: 'Saved', art: '<span>Portrait</span>', details: '',
    accent: '#abcdef', rarity: 'Common' as const, tier: 'six-star' as const, animationLabel: 'Calling' };

  it('preserves star-tier anticipation while revealing each mixed item in its own rarity', async () => {
    const animation = dialogSupport();
    const pending = presentReward({ ...reward, art: '<ol><li class="summon-ten-result" data-rarity="Common">Character</li><li class="summon-ten-result" data-rarity="Rare">Materials</li></ol>' });
    const dialog = document.querySelector('dialog')!;
    expect(dialog.style.getPropertyValue('--reward-accent')).toBe('#abcdef');
    expect(dialog.dataset.rewardTier).toBe('six-star');
    animation.finish();
    expect(Array.from(dialog.querySelectorAll('.rarity-feedback'), node => node.getAttribute('data-rarity'))).toEqual(['Common', 'Rare']);
    dialog.querySelector<HTMLButtonElement>('[data-close-reward]')!.click();
    await pending;
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(document.querySelector('dialog')).toBeNull();
  });

  it.each(['skip', 'reduced'])('does not add a burst or delay for %s', async mode => {
    dialogSupport();
    motion.reduced = mode === 'reduced';
    const pending = presentReward(reward);
    const dialog = document.querySelector('dialog')!;
    if (mode === 'skip') dialog.querySelector<HTMLButtonElement>('[data-skip-reward]')!.click();
    expect(dialog.querySelector('.rarity-feedback')).toBeNull();
    expect(dialog.querySelector<HTMLButtonElement>('[data-close-reward]')!.hidden).toBe(false);
    dialog.querySelector<HTMLButtonElement>('[data-close-reward]')!.click();
    await pending;
    await vi.advanceTimersByTimeAsync(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
