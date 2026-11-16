// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const motion = vi.hoisted(() => ({ reduced: false }));
const burst = vi.hoisted(() => ({ rarityFeedback: vi.fn((_card: HTMLElement, _rarity: string) => () => {}) }));
vi.mock('./settings', () => ({ reducedMotion: () => motion.reduced }));
vi.mock('./rarity-feedback', () => ({ rarityFeedback: burst.rarityFeedback, clearRarityFeedback: vi.fn(), rarityMotionReduced: () => motion.reduced }));
import { presentReward, summonWaveStepMs, type RewardPresentation } from './reward-screen';

const highlighted = { 2: 'is-character is-six-star', 5: 'has-bonus', 7: 'is-character is-five-star' } as Record<number, string>;
const tenPull = (): RewardPresentation => ({
  kind: 'summon', tier: 'six-star', rarity: 'Rare', title: '10-Pull summoned', name: '10 results', accent: '#fff',
  animationLabel: 'Revealing', savedLabel: 'All ten rewards saved', details: '<p>Saved</p>',
  art: `<ol class="summon-ten-grid">${Array.from({ length: 10 }, (_, index) =>
    `<li data-rarity="${index === 5 ? 'Rare' : 'Uncommon'}" class="summon-ten-result ${highlighted[index] ?? ''}" data-index="${index}"><b>Card ${index}</b></li>`).join('')}</ol>`,
});

let portal: { onfinish: (() => void) | null; cancel: () => void } | undefined;
beforeEach(() => {
  vi.useFakeTimers();
  motion.reduced = false;
  burst.rarityFeedback.mockClear();
  portal = undefined;
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
  Element.prototype.animate = vi.fn(function () {
    const animation = { onfinish: null as (() => void) | null, cancel: vi.fn() };
    portal ??= animation;
    return animation as unknown as Animation;
  });
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => {
  document.querySelectorAll('dialog').forEach(dialog => dialog.remove());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const dialog = () => document.querySelector<HTMLDialogElement>('dialog.reward-screen')!;
const burstIndexes = () => burst.rarityFeedback.mock.calls.map(([card]) => Number(card.dataset.index));

describe('summon 10-pull reveal wave (D-464)', () => {
  it('lands cards in order and bursts only star-tier hits and bonus Conduits as each lands', async () => {
    const done = presentReward(tenPull());
    await vi.advanceTimersByTimeAsync(0);
    expect(dialog().dataset.rewardKind).toBe('summon');
    portal!.onfinish!();
    const grid = dialog().querySelector<HTMLElement>('.summon-ten-grid')!;
    expect(grid.classList.contains('luster-stagger')).toBe(true);
    expect(grid.querySelectorAll('.luster-stagger-item')).toHaveLength(10);
    expect(burst.rarityFeedback).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2 * summonWaveStepMs + 320);
    expect(burstIndexes()).toEqual([2]);
    await vi.advanceTimersByTimeAsync(10 * summonWaveStepMs);
    expect(burstIndexes()).toEqual([2, 5, 7]);
    await vi.advanceTimersByTimeAsync(2000);
    expect(dialog().querySelectorAll('.luster-stagger-item, .luster-sheen')).toHaveLength(0);
    dialog().querySelector<HTMLButtonElement>('[data-close-reward]')!.click();
    await done;
  });

  it('shows the final grid without a wave after Skip', async () => {
    const done = presentReward(tenPull());
    await vi.advanceTimersByTimeAsync(0);
    dialog().querySelector<HTMLButtonElement>('[data-skip-reward]')!.click();
    expect(dialog().dataset.rewardRevealed).toBe('true');
    expect(dialog().querySelectorAll('.summon-ten-result')).toHaveLength(10);
    expect(dialog().querySelector('.luster-stagger')).toBeNull();
    await vi.advanceTimersByTimeAsync(3000);
    expect(burst.rarityFeedback).not.toHaveBeenCalled();
    dialog().querySelector<HTMLButtonElement>('[data-close-reward]')!.click();
    await done;
  });

  it('reveals statically under Reduce motion', async () => {
    motion.reduced = true;
    const done = presentReward(tenPull());
    await vi.advanceTimersByTimeAsync(0);
    expect(dialog().dataset.rewardRevealed).toBe('true');
    expect(Element.prototype.animate).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(3000);
    expect(burst.rarityFeedback).not.toHaveBeenCalled();
    dialog().querySelector<HTMLButtonElement>('[data-close-reward]')!.click();
    await done;
  });

  it('cancels pending bursts when Continue closes the receipt mid-wave', async () => {
    const done = presentReward(tenPull());
    await vi.advanceTimersByTimeAsync(0);
    portal!.onfinish!();
    dialog().querySelector<HTMLButtonElement>('[data-close-reward]')!.click();
    await done;
    await vi.advanceTimersByTimeAsync(3000);
    expect(burst.rarityFeedback).not.toHaveBeenCalled();
    expect(document.querySelector('dialog.reward-screen')).toBeNull();
  });
});
