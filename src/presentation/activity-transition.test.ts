import { afterEach, describe, expect, it, vi } from 'vitest';
import { activityFadeDuration, artworkWaitDuration, activityTransitionPending, transitionActivity } from './activity-transition';
import { reducedMotion } from './settings';

vi.mock('./settings', () => ({ reducedMotion: vi.fn(() => false) }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.mocked(reducedMotion).mockReturnValue(false);
  vi.restoreAllMocks();
});

function fixture(images: { decode: () => Promise<void>; alt?: string; hidden?: boolean; offscreen?: boolean }[] = []) {
  vi.useFakeTimers();
  const bar = { style: { width: '' } };
  const fades: { frames: Keyframe[]; options: KeyframeAnimationOptions; finish: () => void }[] = [];
  const overlay = {
    className: '', innerHTML: '', style: { opacity: '' }, remove: vi.fn(),
    querySelector: () => bar,
    animate: (frames: Keyframe[], options: KeyframeAnimationOptions) => {
      let finish = () => {};
      const finished = new Promise<void>((resolve) => { finish = resolve; });
      fades.push({ frames, options, finish });
      return { finished, cancel: vi.fn() };
    },
  };
  const prepared = images.map(image => ({
    ...image, src: 'test.png', loading: 'lazy',
    closest: () => image.hidden ? {} : null,
    getBoundingClientRect: () => ({ width: 100, height: 100, top: image.offscreen ? 1000 : 0, left: 0, bottom: image.offscreen ? 1100 : 100, right: 100 }),
  }));
  const root = { inert: false, querySelectorAll: () => prepared, querySelector: () => ({ focus: vi.fn() }) };
  const append = vi.fn();
  vi.stubGlobal('document', { querySelector: () => root, createElement: () => overlay, body: { append } });
  vi.stubGlobal('window', { innerWidth: 1280, innerHeight: 720 });
  return { root, overlay, fades, bar, append, images: prepared };
}

describe('activity black loading transition', () => {
  it('covers the old scene, waits for artwork, then fades away and restores input', async () => {
    let decode = () => {};
    const image = { alt: 'Test scenery', decode: () => new Promise<void>((resolve) => { decode = resolve; }) };
    const f = fixture([image]);
    const enter = vi.fn();
    const transition = transitionActivity(enter);
    expect(f.root.inert).toBe(true);
    expect(f.overlay.innerHTML).toContain('Loading!');
    expect(f.overlay.innerHTML).toContain('role="status"');
    expect(enter).not.toHaveBeenCalled();
    expect(activityFadeDuration).toBe(800);
    expect(f.fades[0].options).toEqual({ duration: 800, fill: 'forwards', easing: 'ease-in-out' });
    expect(f.fades[0].frames).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    f.fades[0].finish();
    await vi.advanceTimersByTimeAsync(0);
    expect(enter).toHaveBeenCalledOnce();
    expect(f.bar.style.width).toBe('35%');
    expect(f.fades).toHaveLength(1);
    decode();
    await vi.advanceTimersByTimeAsync(180);
    expect(f.bar.style.width).toBe('100%');
    expect(f.fades).toHaveLength(2);
    expect(f.fades[1].options.duration).toBe(800);
    expect(f.fades[1].frames).toEqual([{ opacity: 1 }, { opacity: 0 }]);
    expect(f.root.inert).toBe(true);
    f.fades[1].finish();
    await transition;
    expect(f.root.inert).toBe(false);
    expect(f.overlay.remove).toHaveBeenCalledOnce();
    expect(activityTransitionPending()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not navigate twice when entry is triggered repeatedly', async () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    const f = fixture();
    const first = vi.fn();
    const second = vi.fn();
    const transition = transitionActivity(first);
    expect(transitionActivity(second)).toBe(transition);
    await vi.runAllTimersAsync();
    await transition;
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
    expect(f.fades).toHaveLength(0);
  });

  it('cleans up and explicitly rejects a failed render instead of leaving a black screen', async () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    const f = fixture();
    await expect(transitionActivity(() => { throw new Error('Entry rejected'); })).rejects.toThrow('Entry rejected');
    expect(f.root.inert).toBe(false);
    expect(f.overlay.remove).toHaveBeenCalledOnce();
    expect(activityTransitionPending()).toBe(false);
  });

  it('logs failed artwork without rejecting a successful navigation and preserves the previous inert state', async () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    const f = fixture([{ alt: 'Missing ally', decode: () => Promise.reject(new Error('Decode failure')) }]);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    f.root.inert = true;
    const transition = transitionActivity(() => {});
    await vi.runAllTimersAsync();
    await transition;
    expect(report).toHaveBeenCalledWith('Activity artwork could not load', 'test.png', expect.any(Error));
    expect(f.root.inert).toBe(true);
    expect(f.overlay.remove).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('propagates asynchronous scene setup errors and removes the curtain', async () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    const f = fixture();
    await expect(transitionActivity(async () => { throw new Error('Encounter setup failed'); })).rejects.toThrow('Encounter setup failed');
    expect(f.root.inert).toBe(false);
    expect(f.overlay.remove).toHaveBeenCalledOnce();
  });

  it('reveals a successful screen after the bounded artwork wait while slow images keep loading', async () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    const f = fixture([{ decode: () => new Promise<void>(() => {}) }]);
    const transition = transitionActivity(() => {});
    await vi.advanceTimersByTimeAsync(artworkWaitDuration + 120);
    await transition;
    expect(f.root.inert).toBe(false);
    expect(f.overlay.remove).toHaveBeenCalledOnce();
  });

  it('does not mutate a removed loading bar when artwork completes after the wait budget', async () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    let finish = () => {};
    const f = fixture([{ decode: () => new Promise<void>(resolve => { finish = resolve; }) }]);
    const transition = transitionActivity(() => {});
    await vi.advanceTimersByTimeAsync(artworkWaitDuration + 120);
    await transition;
    expect(f.bar.style.width).toBe('100%');
    finish();
    await Promise.resolve();
    expect(f.bar.style.width).toBe('100%');
    expect(activityTransitionPending()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('never decodes hidden panels, closed dialogs or below-viewport artwork during navigation', async () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    const hidden = vi.fn(() => new Promise<void>(() => {}));
    const offscreen = vi.fn(() => new Promise<void>(() => {}));
    const visible = vi.fn(() => Promise.resolve());
    const f = fixture([{ decode: hidden, hidden: true }, { decode: offscreen, offscreen: true }, { decode: visible }]);
    const transition = transitionActivity(() => {});
    await vi.advanceTimersByTimeAsync(120);
    await transition;
    expect(hidden).not.toHaveBeenCalled();
    expect(offscreen).not.toHaveBeenCalled();
    expect(visible).toHaveBeenCalledOnce();
    expect(f.images.map(image => image.loading)).toEqual(['lazy', 'lazy', 'eager']);
    expect(vi.getTimerCount()).toBe(0);
  });
});
