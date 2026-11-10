// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { measureRadiantCadence, summarizeRadiantCadence, type RadiantCadenceOutcome } from './radiant-preview-cadence';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
});

function frameHarness() {
  let next: FrameRequestCallback | undefined;
  const cancelled: number[] = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { next = callback; return 7; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => cancelled.push(id));
  const deliver = (timestamp: number) => {
    const callback = next;
    if (!callback) throw new Error('No frame was requested.');
    next = undefined;
    callback(timestamp);
  };
  return { deliver, cancelled };
}

describe('visible desktop cadence sampling', () => {
  it('reports the frame-time distribution without claiming GPU timing', () => {
    const result = summarizeRadiantCadence([10, 20, 30, 40], 100, null);
    expect(result).toMatchObject({
      intervals: 4, durationMs: 100, framesPerSecond: 40, medianMs: 20,
      p95Ms: 40, p99Ms: 40, maximumMs: 40, overTarget: 3, heapBefore: 100, heapAfter: null,
    });
    expect(() => summarizeRadiantCadence([], null, null)).toThrow();
    expect(() => summarizeRadiantCadence([0], null, null)).toThrow();
  });

  it('samples a full 15 seconds and stops scheduling frames after reporting', () => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    const frames = frameHarness(), outcomes: RadiantCadenceOutcome[] = [];
    measureRadiantCadence(outcome => outcomes.push(outcome));
    for (let frame = 0; frame <= 900; frame++) frames.deliver(frame * 1000 / 60);
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0].kind).toBe('measured');
    if (outcomes[0].kind !== 'measured') throw new Error('Expected a completed sample.');
    expect(outcomes[0].summary.intervals).toBe(900);
    expect(outcomes[0].summary.durationMs).toBeCloseTo(15_000);
    expect(outcomes[0].summary.framesPerSecond).toBeCloseTo(60);
    expect(frames.cancelled).toEqual([7]);
    vi.advanceTimersByTime(20_000);
    expect(outcomes).toHaveLength(1);
  });

  it('rejects hidden tabs and cancels an active sample when the tab becomes hidden', () => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    expect(() => measureRadiantCadence(() => {})).toThrow('visible foreground tab');
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    const focused = vi.spyOn(document, 'hasFocus').mockReturnValue(false);
    expect(() => measureRadiantCadence(() => {})).toThrow('visible foreground tab');
    focused.mockReturnValue(true);
    const frames = frameHarness(), outcomes: RadiantCadenceOutcome[] = [];
    measureRadiantCadence(outcome => outcomes.push(outcome));
    frames.deliver(100);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(outcomes).toEqual([{ kind: 'stopped', reason: 'The tab became hidden. Keep it visible and start a new sample.' }]);
    expect(frames.cancelled).toEqual([7]);
    vi.advanceTimersByTime(20_000);
    expect(outcomes).toHaveLength(1);
  });

  it('reports a frame-delivery timeout and explicit cancellation once', () => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    frameHarness();
    const outcomes: RadiantCadenceOutcome[] = [];
    const cancel = measureRadiantCadence(outcome => outcomes.push(outcome));
    vi.advanceTimersByTime(20_000);
    cancel('Cancelled.');
    expect(outcomes).toEqual([{ kind: 'stopped', reason: 'The browser stopped delivering frames. Start a new sample in a visible tab.' }]);
  });

  it('cancels when the browser loses focus', () => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    frameHarness();
    const outcomes: RadiantCadenceOutcome[] = [];
    measureRadiantCadence(outcome => outcomes.push(outcome));
    window.dispatchEvent(new Event('blur'));
    expect(outcomes).toEqual([{ kind: 'stopped', reason: 'The browser lost focus. Keep it in the foreground and start a new sample.' }]);
  });
});
