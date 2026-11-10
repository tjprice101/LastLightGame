export interface RadiantCadenceSummary {
  intervals: number;
  durationMs: number;
  framesPerSecond: number;
  medianMs: number;
  p95Ms: number;
  p99Ms: number;
  maximumMs: number;
  overTarget: number;
  heapBefore: number | null;
  heapAfter: number | null;
}

export type RadiantCadenceOutcome =
  | { kind: 'measured'; summary: RadiantCadenceSummary }
  | { kind: 'stopped'; reason: string };

function usedHeapBytes(): number | null {
  const memory = Reflect.get(performance, 'memory');
  if (!memory || typeof memory !== 'object') return null;
  const used = Reflect.get(memory, 'usedJSHeapSize');
  return typeof used === 'number' && Number.isFinite(used) && used >= 0 ? used : null;
}

export function summarizeRadiantCadence(intervals: readonly number[], heapBefore: number | null, heapAfter: number | null): RadiantCadenceSummary {
  if (!intervals.length || intervals.some(value => !Number.isFinite(value) || value <= 0))
    throw new Error('A cadence sample requires positive finite frame intervals.');
  const sorted = [...intervals].sort((a, b) => a - b);
  const durationMs = intervals.reduce((sum, value) => sum + value, 0);
  const percentile = (fraction: number) => sorted[Math.ceil(sorted.length * fraction) - 1];
  return {
    intervals: intervals.length, durationMs, framesPerSecond: intervals.length * 1000 / durationMs,
    medianMs: percentile(.5), p95Ms: percentile(.95), p99Ms: percentile(.99),
    maximumMs: sorted[sorted.length - 1], overTarget: intervals.filter(value => value > 1000 / 60).length,
    heapBefore, heapAfter,
  };
}

export function measureRadiantCadence(report: (outcome: RadiantCadenceOutcome) => void): (reason: string) => void {
  if (document.visibilityState !== 'visible' || !document.hasFocus())
    throw new Error('A visible foreground tab is required for a cadence sample.');
  const durationMs = 15_000;
  const intervals: number[] = [];
  const heapBefore = usedHeapBytes();
  let first: number | undefined, previous: number | undefined, frame = 0, finished = false;
  const stop = (outcome: RadiantCadenceOutcome) => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(frame);
    clearTimeout(watchdog);
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('blur', blur);
    report(outcome);
  };
  const visibility = () => {
    if (document.visibilityState !== 'visible')
      stop({ kind: 'stopped', reason: 'The tab became hidden. Keep it visible and start a new sample.' });
  };
  const blur = () => stop({ kind: 'stopped', reason: 'The browser lost focus. Keep it in the foreground and start a new sample.' });
  const tick = (time: number) => {
    if (!document.hasFocus()) { blur(); return; }
    if (!Number.isFinite(time) || (previous !== undefined && time <= previous)) {
      stop({ kind: 'stopped', reason: 'The browser returned invalid frame timestamps. Start a new sample.' });
      return;
    }
    if (first === undefined) first = time;
    if (previous !== undefined) intervals.push(time - previous);
    previous = time;
    if (time - first >= durationMs) {
      stop({ kind: 'measured', summary: summarizeRadiantCadence(intervals, heapBefore, usedHeapBytes()) });
      return;
    }
    frame = requestAnimationFrame(tick);
  };
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('blur', blur);
  const watchdog = setTimeout(() => stop({ kind: 'stopped', reason: 'The browser stopped delivering frames. Start a new sample in a visible tab.' }), durationMs + 5000);
  frame = requestAnimationFrame(tick);
  return reason => stop({ kind: 'stopped', reason });
}
