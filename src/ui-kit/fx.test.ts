// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { actionFx, sceneKick, setSceneKick } from './fx';

describe('action feedback for saved successes', () => {
  const kick = vi.fn();
  let origin: HTMLButtonElement;

  beforeEach(() => {
    vi.useFakeTimers();
    kick.mockClear();
    setSceneKick(kick);
    document.documentElement.dataset.motion = 'system';
    document.body.innerHTML = '<button>Upgrade</button>';
    origin = document.querySelector('button')!;
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
    delete document.documentElement.dataset.motion;
  });

  it('answers with a ring, sparks, the exact number and a pulse through the scene, then removes itself', () => {
    actionFx(origin, { amount: '+1,250', tone: 'gain', accent: '#fa8d63', kick: .8 });
    const fx = document.querySelector<HTMLElement>('.lk-fx')!;
    expect(fx.getAttribute('aria-hidden')).toBe('true');
    expect(fx.dataset.tone).toBe('gain');
    expect(fx.style.getPropertyValue('--accent')).toBe('#fa8d63');
    expect(fx.querySelectorAll('.lk-fx-ring')).toHaveLength(1);
    expect(fx.querySelectorAll('.lk-fx-spark')).toHaveLength(10);
    expect(fx.querySelector('.lk-fx-number')!.textContent).toBe('+1,250');
    expect(kick).toHaveBeenCalledExactlyOnceWith(.8);
    vi.advanceTimersByTime(950);
    expect(document.querySelector('.lk-fx')).toBeNull();
  });
  it('omits the number when there is none and can be removed at once', () => {
    const remove = actionFx(origin);
    expect(document.querySelector('.lk-fx-number')).toBeNull();
    expect(kick).toHaveBeenCalledWith(.5);
    remove();
    expect(document.querySelector('.lk-fx')).toBeNull();
    vi.advanceTimersByTime(2000);
  });
  it('plays inside an open dialog so it is not hidden under the top layer', () => {
    document.body.innerHTML = '<dialog open><button>Confirm</button></dialog>';
    actionFx(document.querySelector('button')!);
    expect(document.querySelector('dialog > .lk-fx')).not.toBeNull();
  });
  it.each([
    ['the in-game setting', () => { document.documentElement.dataset.motion = 'reduced'; }],
    ['the device setting', () => { vi.stubGlobal('matchMedia', () => ({ matches: true })); }],
  ])('shows a still highlight and leaves the scene alone when motion is reduced by %s', (_, reduce) => {
    reduce();
    actionFx(origin, { amount: '+1' });
    sceneKick();
    expect(document.querySelector('.lk-fx')).toBeNull();
    expect(kick).not.toHaveBeenCalled();
    expect(origin.hasAttribute('data-lk-confirmed')).toBe(true);
    vi.advanceTimersByTime(1400);
    expect(origin.hasAttribute('data-lk-confirmed')).toBe(false);
  });
  it('does nothing for a control that has left the page', () => {
    origin.remove();
    actionFx(origin);
    expect(document.querySelector('.lk-fx')).toBeNull();
    expect(kick).not.toHaveBeenCalled();
  });
  it('pulses the scene alone for successes that already have a celebration', () => {
    sceneKick(.7);
    expect(kick).toHaveBeenCalledExactlyOnceWith(.7);
  });
});
