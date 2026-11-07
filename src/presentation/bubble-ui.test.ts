// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bubbleMotionAllowed, cinematic, glyphBurst, installBubbleUi } from './bubble-ui';
import { applyMotion } from './settings';

describe('shared interaction feedback lifecycle', () => {
  let dispose: (() => void) | undefined;
  let hidden = false;
  const originalAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate');
  const cancelled = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    hidden = false;
    document.body.innerHTML = '<main id="app"><button>Cancel</button><button aria-disabled="true">Retry</button></main>';
    document.documentElement.dataset.motion = 'system';
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    cancelled.mockClear();
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: vi.fn(() => {
      const animation = new EventTarget();
      Object.assign(animation, { cancel: () => { cancelled(); animation.dispatchEvent(new Event('cancel')); } });
      return animation as Animation;
    }) });
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (originalAnimate) Object.defineProperty(HTMLElement.prototype, 'animate', originalAnimate);
    else Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    document.body.innerHTML = '';
    delete document.documentElement.dataset.motion;
  });

  const install = (): HTMLElement => {
    const app = document.querySelector<HTMLElement>('#app')!;
    dispose = installBubbleUi(app);
    return app;
  };

  it('gives an ordinary click one neutral finite ring, without success sparkles or gameplay changes', () => {
    install();
    document.querySelector<HTMLButtonElement>('button')!.click();
    expect(document.querySelectorAll('.click-ring')).toHaveLength(1);
    expect(document.querySelectorAll('.fx-glyph, .fx-particle, .fx-banner')).toHaveLength(0);
    expect(document.querySelector('.click-burst')?.getAttribute('aria-hidden')).toBe('true');
    vi.advanceTimersByTime(550);
    expect(document.querySelector('.click-burst')).toBeNull();
    expect(cancelled).not.toHaveBeenCalled();
  });

  it('ignores native-disabled, aria-disabled and inert controls', () => {
    const app = install();
    app.querySelector<HTMLButtonElement>('button')!.disabled = true;
    app.querySelectorAll<HTMLButtonElement>('button').forEach(button => button.click());
    app.innerHTML = '<section inert><button>Hidden draft</button></section>';
    app.querySelector<HTMLButtonElement>('button')!.click();
    expect(document.querySelector('.click-burst')).toBeNull();
  });

  it('clears existing feedback on Reduce motion and keeps future interactions immediate and static', () => {
    install();
    document.querySelector<HTMLButtonElement>('button')!.click();
    applyMotion('reduced');
    expect(document.querySelector('.click-burst')).toBeNull();
    document.querySelector<HTMLButtonElement>('button')!.click();
    expect(bubbleMotionAllowed()).toBe(false);
    expect(document.querySelector('.click-burst')).toBeNull();
  });

  it('pauses hidden ambient motion and resumes when the document returns', () => {
    install();
    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(document.querySelector<HTMLElement>('.bubble-backdrop')!.dataset.motionPaused).toBe('true');
    expect(bubbleMotionAllowed()).toBe(false);
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(document.querySelector<HTMLElement>('.bubble-backdrop')!.dataset.motionPaused).toBe('false');
    expect(bubbleMotionAllowed()).toBe(true);
  });

  it('cancels tracked saved-success particles when motion is reduced', () => {
    install();
    glyphBurst(100, 100, 3, 40);
    expect(document.querySelectorAll('.fx-glyph')).toHaveLength(3);
    applyMotion('reduced');
    expect(cancelled).toHaveBeenCalledTimes(3);
    expect(document.querySelector('.fx-glyph')).toBeNull();
  });

  it('settles a saved cinematic immediately on Reduce motion and releases inert controls', async () => {
    const app = install();
    const done = cinematic({ kind: 'level', eyebrow: 'Saved', title: 'Level increased' });
    expect(app.inert).toBe(true);
    applyMotion('reduced');
    await done;
    expect(app.inert).toBe(false);
    expect(document.querySelector('.cine')).toBeNull();
    vi.advanceTimersByTime(10_000);
    expect(document.querySelector('.fx-glyph')).toBeNull();
  });

  it('preserves immediate Escape skip and restores an already-inert caller', async () => {
    const app = install();
    app.inert = true;
    const done = cinematic({ kind: 'level', eyebrow: 'Saved', title: 'Level increased' });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    await done;
    expect(app.inert).toBe(true);
    vi.advanceTimersByTime(380);
    expect(document.querySelector('.cine')).toBeNull();
  });

  it('disposes handlers, animations and layers without duplicating a reinstall', async () => {
    const app = install();
    expect(installBubbleUi(app)).toBe(dispose);
    const done = cinematic({ kind: 'level', eyebrow: 'Saved', title: 'Level increased' });
    dispose!();
    await done;
    expect(document.querySelector('.bubble-backdrop, .bubble-effects, .cine')).toBeNull();
    dispose = undefined;
    install();
    app.querySelector<HTMLButtonElement>('button')!.click();
    expect(document.querySelectorAll('.click-ring')).toHaveLength(1);
    expect(document.querySelectorAll('.bubble-backdrop')).toHaveLength(1);
  });
});
