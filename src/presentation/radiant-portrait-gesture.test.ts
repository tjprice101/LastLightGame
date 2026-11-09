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
  const options = { cast: vi.fn(), ready: vi.fn((): string | null => 'Lustrous Flare'), notice: vi.fn() };
  const binding = bindRadiantPortraitGestures(host, options); bindings.push(binding);
  return { host, button, binding, options };
}
afterEach(() => { bindings.splice(0).forEach(binding => binding.dispose()); vi.useRealTimers(); document.body.replaceChildren(); });
describe('Radiant charged portrait gestures', () => {
  it('leaves a tap to the native button as an immediate attack, with no selection step or Flare', () => {
    const { button, binding, options } = fixture();
    pointer(button, 'pointerdown'); expect(button.classList.contains('is-arming')).toBe(true);
    pointer(button, 'pointerup'); expect(button.classList.contains('is-arming')).toBe(false);
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
    button.disabled = true; pointer(button, 'pointerdown'); expect(button.classList.contains('is-arming')).toBe(false);
    button.disabled = false; pointer(button, 'pointerdown');
    pointer(button, 'pointerup', 50, 40, 2); expect(options.cast).not.toHaveBeenCalled();
    binding.cancel();
    pointer(button, 'pointerdown'); pointer(button, 'pointerup');
    expect(binding.consumeClick(button)).toBe(false);
  });
  it('accepts a held upward drag anywhere on the member card, but never from its other controls', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    host.innerHTML = `<article data-radiant-card><button data-radiant-actor="tide">Tizu</button>
      <dl data-stats><dt>Attack</dt><dd>10</dd></dl><button data-radiant-menu="tide">Actions</button></article>`;
    document.body.append(host);
    const card = host.querySelector<HTMLElement>('[data-radiant-card]')!;
    const actor = host.querySelector<HTMLButtonElement>('[data-radiant-actor]')!;
    const options = { cast: vi.fn(), ready: vi.fn((): string | null => 'Glowing Flare'), notice: vi.fn() };
    const binding = bindRadiantPortraitGestures(host, options); bindings.push(binding);
    const stats = host.querySelector<HTMLElement>('[data-stats] dd')!;
    pointer(stats, 'pointerdown');
    expect(card.classList.contains('is-arming')).toBe(true);
    vi.advanceTimersByTime(radiantHoldMilliseconds);
    expect(card.classList.contains('is-held')).toBe(true);
    pointer(stats, 'pointermove', 50, 100 - gestureThreshold);
    expect(card.classList.contains('is-primed')).toBe(true);
    pointer(stats, 'pointerup', 50, 100 - gestureThreshold);
    expect(options.cast).toHaveBeenCalledWith('tide');
    expect(binding.consumeClick(actor)).toBe(true);
    expect(card.classList.contains('is-held') || card.classList.contains('is-primed')).toBe(false);
    expect(card.style.getPropertyValue('--radiant-drag')).toBe('');
    pointer(host.querySelector<HTMLElement>('[data-radiant-menu]')!, 'pointerdown');
    expect(card.classList.contains('is-arming')).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
  it('recovers from a release that never reached the host', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    host.innerHTML = '<article data-radiant-card><button data-radiant-actor="tide">Tizu</button><p>Body</p></article>';
    document.body.append(host);
    const options = { cast: vi.fn(), ready: vi.fn((): string | null => 'Glowing Flare'), notice: vi.fn() };
    bindings.push(bindRadiantPortraitGestures(host, options));
    const body = host.querySelector<HTMLElement>('p')!, card = host.querySelector<HTMLElement>('article')!;
    pointer(body, 'pointerdown'); vi.advanceTimersByTime(radiantHoldMilliseconds);
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, isPrimary: true }));
    expect(card.classList.contains('is-held')).toBe(false);
    pointer(body, 'pointerdown'); vi.advanceTimersByTime(radiantHoldMilliseconds);
    pointer(body, 'pointerdown'); expect(card.classList.contains('is-arming')).toBe(true);
    vi.advanceTimersByTime(radiantHoldMilliseconds);
    pointer(body, 'pointermove', 50, 100 - gestureThreshold); pointer(body, 'pointerup', 50, 100 - gestureThreshold);
    expect(options.cast).toHaveBeenCalledTimes(1); expect(vi.getTimerCount()).toBe(0);
  });
  it('marks a held card unready without priming when no Flare is available', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    host.innerHTML = '<article data-radiant-card><button data-radiant-actor="tide">Tizu</button><p>Body</p></article>';
    document.body.append(host);
    const options = { cast: vi.fn(), ready: vi.fn((): string | null => null), notice: vi.fn() };
    bindings.push(bindRadiantPortraitGestures(host, options));
    const body = host.querySelector<HTMLElement>('p')!, card = host.querySelector<HTMLElement>('article')!;
    pointer(body, 'pointerdown'); vi.advanceTimersByTime(radiantHoldMilliseconds);
    pointer(body, 'pointermove', 50, 40);
    expect(card.classList.contains('is-unready')).toBe(true); expect(card.classList.contains('is-primed')).toBe(false);
    pointer(body, 'pointerup', 50, 40); expect(options.cast).not.toHaveBeenCalled();
  });
  it('keeps keyboard activation usable immediately after an Escape-cancelled hold', () => {
    const { button, binding } = fixture();
    pointer(button, 'pointerdown'); vi.advanceTimersByTime(350);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(binding.consumeClick(button)).toBe(false);
  });
});
