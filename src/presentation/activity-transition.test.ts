import { afterEach, describe, expect, it, vi } from 'vitest';
import { activityTransitionPending, transitionActivity } from './activity-transition';
import { reducedMotion } from './settings';

vi.mock('./settings', () => ({ reducedMotion: vi.fn(() => false) }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.mocked(reducedMotion).mockReturnValue(false);
});

function fixture(images: { decode: () => Promise<void>; alt?: string }[] = []) {
  vi.useFakeTimers();
  const bar = { style: { width: '' } };
  const fades: { frames: Keyframe[]; finish: () => void }[] = [];
  const overlay = {
    className: '', innerHTML: '', style: { opacity: '' }, remove: vi.fn(),
    querySelector: () => bar,
    animate: (frames: Keyframe[]) => {
      let finish = () => {};
      const finished = new Promise<void>((resolve) => { finish = resolve; });
      fades.push({ frames, finish });
      return { finished, cancel: vi.fn() };
    },
  };
  const root = { inert: false, querySelectorAll: () => images, querySelector: () => ({ focus: vi.fn() }) };
  const append = vi.fn();
  vi.stubGlobal('document', { querySelector: () => root, createElement: () => overlay, body: { append } });
  return { root, overlay, fades, bar, append };
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
    f.fades[0].finish();
    await vi.advanceTimersByTimeAsync(0);
    expect(enter).toHaveBeenCalledOnce();
    expect(f.bar.style.width).toBe('35%');
    expect(f.fades).toHaveLength(1);
    decode();
    await vi.advanceTimersByTimeAsync(180);
    expect(f.bar.style.width).toBe('100%');
    expect(f.fades).toHaveLength(2);
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

  it('reports failed artwork loading and preserves the previous inert state', async () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    const f = fixture([{ alt: 'Missing ally', decode: () => Promise.reject(new Error('Decode failure')) }]);
    f.root.inert = true;
    await expect(transitionActivity(() => {})).rejects.toThrow('Activity artwork could not load: Missing ally');
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

  it('times out unresponsive artwork and restores controls', async () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    const f = fixture([{ decode: () => new Promise<void>(() => {}) }]);
    const assertion = expect(transitionActivity(() => {})).rejects.toThrow('loading timed out');
    await vi.advanceTimersByTimeAsync(12000);
    await assertion;
    expect(f.root.inert).toBe(false);
    expect(f.overlay.remove).toHaveBeenCalledOnce();
  });
});
