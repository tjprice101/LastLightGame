// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { countUp, lusterSheen, staggerIn } from './luster';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('./settings', () => ({ reducedMotion: () => motion.reduced }));

const css = (path: string): string => readFileSync(join(process.cwd(), 'src', path), 'utf8');

function host(children = 0): HTMLElement {
  const element = document.createElement('div');
  for (let index = 0; index < children; index += 1) element.append(document.createElement('div'));
  document.body.append(element);
  return element;
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => {
  document.body.replaceChildren();
  motion.reduced = false;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('luster sheen', () => {
  it('adds one pointer-transparent, aria-hidden overlay that removes itself', () => {
    const target = host();
    lusterSheen(target, 900);
    lusterSheen(target, 900);
    const sheens = target.querySelectorAll('.luster-sheen');
    expect(sheens).toHaveLength(1);
    expect(sheens[0].getAttribute('aria-hidden')).toBe('true');
    expect(target.classList.contains('luster-host')).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(target.querySelector('.luster-sheen')).toBeNull();
    expect(target.classList.contains('luster-host')).toBe(false);
  });

  it('does nothing under Reduce motion and cleans up when motion becomes reduced', () => {
    motion.reduced = true;
    const still = host();
    lusterSheen(still);
    expect(still.querySelector('.luster-sheen')).toBeNull();
    motion.reduced = false;
    const moving = host();
    lusterSheen(moving);
    motion.reduced = true;
    window.dispatchEvent(new Event('last-light-motion-change'));
    expect(moving.querySelector('.luster-sheen')).toBeNull();
  });

  it('never consumes gameplay randomness', () => {
    const random = vi.spyOn(Math, 'random');
    lusterSheen(host());
    staggerIn(host(3));
    expect(random).not.toHaveBeenCalled();
  });
});

describe('stagger-in', () => {
  it('indexes items, caps the delay and removes every trace when finished', () => {
    const list = host(5);
    staggerIn(list, undefined, { stepMs: 40, maxSteps: 2, durationMs: 300 });
    const indexes = Array.from(list.children).map(child => (child as HTMLElement).style.getPropertyValue('--luster-index'));
    expect(indexes).toEqual(['0', '1', '2', '2', '2']);
    expect(list.classList.contains('luster-stagger')).toBe(true);
    vi.advanceTimersByTime(300 + 80 + 50);
    expect(list.classList.contains('luster-stagger')).toBe(false);
    expect(list.querySelector('.luster-stagger-item')).toBeNull();
    expect((list.children[0] as HTMLElement).style.getPropertyValue('--luster-index')).toBe('');
  });

  it('leaves items untouched under Reduce motion', () => {
    motion.reduced = true;
    const list = host(3);
    staggerIn(list);
    expect(list.querySelector('.luster-stagger-item')).toBeNull();
  });
});

describe('count-up', () => {
  it('lands on the exact original text with prefix, separators and suffix', () => {
    const amount = host();
    amount.textContent = '+12,345 Prismatica';
    countUp(amount, { durationMs: 600 });
    expect(amount.textContent).toBe('+0 Prismatica');
    expect(amount.getAttribute('aria-label')).toBe('+12,345 Prismatica');
    vi.advanceTimersByTime(900);
    expect(amount.textContent).toBe('+12,345 Prismatica');
    expect(amount.hasAttribute('aria-label')).toBe(false);
  });

  it('cleanup restores the exact value immediately', () => {
    const amount = host();
    amount.textContent = '4800';
    const cleanup = countUp(amount);
    cleanup();
    expect(amount.textContent).toBe('4800');
  });

  it.each(['1.5k', 'Owned', '0', '3 / 6'])('leaves %s unchanged', text => {
    const amount = host();
    amount.textContent = text;
    countUp(amount);
    expect(amount.textContent).toBe(text);
  });

  it('shows the final value immediately under Reduce motion', () => {
    motion.reduced = true;
    const amount = host();
    amount.textContent = '250';
    countUp(amount);
    expect(amount.textContent).toBe('250');
  });
});

describe('Jewel & Gold tokens', () => {
  it('defines the shared token families in interface.css', () => {
    const tokens = css('interface.css');
    for (const name of ['--gild-frame', '--gild-fill', '--radius-sm', '--radius-md', '--radius-lg', '--radius-pill',
      '--shadow-panel', '--glow-gild', '--glow-rarity-legendary', '--motion-press', '--motion-nav', '--motion-reveal',
      '--ease-out', '--ease-out-back', '--surface-backdrop']) expect(tokens).toContain(`${name}:`);
    expect(tokens).toContain('--accent-warm: var(--gild-light)');
    expect(tokens).toContain('--gold: var(--gild-light)');
  });

  it('keeps one owner for the reference aliases and drops the neutral gold override', () => {
    const owner = css('presentation/menu-reference.css');
    expect(owner).toContain('--reference-gild: var(--gild-mid)');
    expect(owner).toContain('--reference-line: var(--gild-line)');
    expect(css('presentation/menu-reference-rollout.css')).not.toMatch(/--reference-[a-z-]+:/);
    expect(css('neutral-theme.css')).not.toContain('--gold:');
    for (const file of ['presentation/menu-reference.css', 'presentation/menu-reference-rollout.css', 'presentation/social-calendar.css'])
      expect(css(file)).not.toMatch(/peach|#ffa15d/i);
  });

  it('disables luster motion under the single Reduce motion hook', () => {
    const luster = css('presentation/luster.css');
    expect(luster).toContain('html[data-motion="reduced"] .luster-sheen { display: none; }');
    expect(luster).toContain('pointer-events: none');
    expect(css('presentation/button-style.css')).toContain('html[data-motion="reduced"] body [data-button-surface]:not(#battle-root *):active { scale: none; }');
  });
});
