// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindRadiantPortraitGestures, radiantHoldMilliseconds } from './radiant-portrait-gesture';
import { gestureThreshold } from './battle-gesture';

const bindings: ReturnType<typeof bindRadiantPortraitGestures>[] = [];
function pointer(button: HTMLElement, type: string, x = 50, y = 100, id = 1) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { button: 0, isPrimary: true, pointerId: id, clientX: x, clientY: y });
  button.dispatchEvent(event);
}
function fixture() {
  vi.useFakeTimers();
  const host = document.createElement('div');
  host.innerHTML = '<button data-radiant-actor="tide">Tizu</button>';
  document.body.append(host);
  const button = host.querySelector('button')!;
  const options = { select: vi.fn(), cast: vi.fn(), ready: vi.fn((): string | null => 'Lustrous Flare'), notice: vi.fn() };
  const binding = bindRadiantPortraitGestures(host, options); bindings.push(binding);
  return { host, button, binding, options };
}
afterEach(() => { bindings.splice(0).forEach(binding => binding.dispose()); vi.useRealTimers(); document.body.replaceChildren(); });
describe('Radiant charged portrait gestures', () => {
  it('leaves a tap to the native button and selects its exact member without spending a Flare', () => {
    const { button, binding, options } = fixture();
    pointer(button, 'pointerdown'); pointer(button, 'pointerup');
    expect(options.select).toHaveBeenCalledWith('tide');
    expect(options.cast).not.toHaveBeenCalled(); expect(binding.consumeClick(button)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([['early', 349, -32, false], ['short', 350, -31, false], ['exact', 350, -32, true],
    ['downward', 350, 32, false], ['diagonal', 350, -32, false]] as const)(
    '%s: casts only at the exact held/upward threshold, never from a cancelled gesture', (_, hold, dy, casts) => {
      const { button, binding, options } = fixture();
      pointer(button, 'pointerdown'); vi.advanceTimersByTime(hold);
      const x = _ === 'diagonal' ? 50 + Math.abs(dy) : 50;
      pointer(button, 'pointermove', x, 100 + dy); pointer(button, 'pointerup', x, 100 + dy);
      expect(options.cast).toHaveBeenCalledTimes(casts ? 1 : 0);
      if (casts) expect(options.cast).toHaveBeenCalledWith('tide');
      expect(binding.consumeClick(button)).toBe(true);
      expect(binding.consumeClick(button)).toBe(false);
      expect(button.classList.contains('is-held')).toBe(false); expect(vi.getTimerCount()).toBe(0);
    });
  it('never silently converts an unavailable charged attack into a Normal Attack', () => {
    const { button, binding, options } = fixture(); options.ready.mockReturnValue(null);
    pointer(button, 'pointerdown'); vi.advanceTimersByTime(radiantHoldMilliseconds);
    pointer(button, 'pointerup', 50, 100 - gestureThreshold);
    expect(options.cast).not.toHaveBeenCalled(); expect(options.notice).toHaveBeenLastCalledWith('Flare is not ready; no action spent.');
    expect(binding.consumeClick(button)).toBe(true);
  });
  it.each(['pointercancel', 'lostpointercapture', 'escape', 'blur', 'dispose', 'disabled'] as const)(
    '%s cancels pending held input without an action or leftover timer', reason => {
      const { button, binding, options } = fixture();
      pointer(button, 'pointerdown'); vi.advanceTimersByTime(350);
      if (reason === 'escape') button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      else if (reason === 'blur') window.dispatchEvent(new Event('blur'));
      else if (reason === 'dispose') binding.dispose();
      else if (reason === 'disabled') button.disabled = true;
      else pointer(button, reason);
      pointer(button, 'pointerup', 50, 40);
      expect(options.cast).not.toHaveBeenCalled(); expect(binding.consumeClick(button)).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
    });
  it('ignores a second pointer and disabled portraits; a new deliberate interaction clears old click suppression', () => {
    const { button, binding, options } = fixture();
    button.disabled = true; pointer(button, 'pointerdown'); expect(options.select).not.toHaveBeenCalled();
    button.disabled = false; pointer(button, 'pointerdown');
    pointer(button, 'pointerup', 50, 40, 2); expect(options.cast).not.toHaveBeenCalled();
    binding.cancel();
    pointer(button, 'pointerdown'); pointer(button, 'pointerup');
    expect(binding.consumeClick(button)).toBe(false);
  });
  it('keeps keyboard activation usable immediately after an Escape-cancelled hold', () => {
    const { button, binding } = fixture();
    pointer(button, 'pointerdown'); vi.advanceTimersByTime(350);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(binding.consumeClick(button)).toBe(false);
  });
});
