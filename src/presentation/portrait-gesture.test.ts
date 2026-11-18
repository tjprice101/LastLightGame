// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindRadiantPortraitGestures, radiantHoldMilliseconds } from './portrait-gesture';
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
  const options = { cast: vi.fn(), ready: vi.fn((): string | null => 'Lustrous Convergent Light'), open: vi.fn(), close: vi.fn(), notice: vi.fn() };
  const binding = bindRadiantPortraitGestures(host, options); bindings.push(binding);
  return { host, button, binding, options };
}
afterEach(() => { bindings.splice(0).forEach(binding => binding.dispose()); vi.useRealTimers(); document.body.replaceChildren(); });
describe('Radiant charged portrait gestures', () => {
  it('leaves a tap to the native button as an immediate attack, with no selection step or Convergent Light', () => {
    const { button, binding, options } = fixture();
    pointer(button, 'pointerdown'); expect(button.classList.contains('is-arming')).toBe(true);
    pointer(button, 'pointerup'); expect(button.classList.contains('is-arming')).toBe(false);
    expect(options.cast).not.toHaveBeenCalled(); expect(binding.consumeClick(button)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([['below upward threshold', 0, -31, false], ['immediate upward drag', 0, -32, true],
    ['held upward drag', radiantHoldMilliseconds, -32, true], ['downward', radiantHoldMilliseconds, 32, false],
    ['diagonal', radiantHoldMilliseconds, -32, false]] as const)(
    '%s: casts only for an upward, vertically dominant gesture', (_, hold, dy, casts) => {
      const { button, binding, options } = fixture();
      pointer(button, 'pointerdown'); vi.advanceTimersByTime(hold);
      const x = _ === 'diagonal' ? 50 + Math.abs(dy) : 50;
      pointer(button, 'pointermove', x, 100 + dy); pointer(button, 'pointerup', x, 100 + dy);
      expect(options.cast).toHaveBeenCalledTimes(casts ? 1 : 0);
      if (casts) expect(options.cast).toHaveBeenCalledWith('tide', 'flare');
      expect(binding.consumeClick(button)).toBe(_ !== 'below upward threshold');
      expect(binding.consumeClick(button)).toBe(false);
      expect(button.classList.contains('is-held')).toBe(false); expect(vi.getTimerCount()).toBe(0);
    });
  it('arms on a deliberate upward drag without waiting for the hold timer', () => {
    const { button, options } = fixture();
    pointer(button, 'pointerdown');
    pointer(button, 'pointermove', 50, 100 - gestureThreshold);
    expect(options.ready).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    pointer(button, 'pointerup', 50, 100 - gestureThreshold);
    expect(options.cast).toHaveBeenCalledWith('tide', 'flare');
  });
  it('never silently converts an unavailable charged attack into a Normal Attack', () => {
    const { button, binding, options } = fixture(); options.ready.mockReturnValue(null);
    pointer(button, 'pointerdown'); vi.advanceTimersByTime(radiantHoldMilliseconds);
    pointer(button, 'pointerup', 50, 100 - gestureThreshold);
    expect(options.cast).not.toHaveBeenCalled(); expect(options.notice).toHaveBeenLastCalledWith('Convergent Light is not ready; no action spent.');
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
      <dl data-stats><dt>Attack</dt><dd>10</dd></dl><button data-other-control>Other</button></article>`;
    document.body.append(host);
    const card = host.querySelector<HTMLElement>('[data-radiant-card]')!;
    const actor = host.querySelector<HTMLButtonElement>('[data-radiant-actor]')!;
    const options = { cast: vi.fn(), ready: vi.fn((): string | null => 'Glowing Convergent Light'), open: vi.fn(), close: vi.fn(), notice: vi.fn() };
    const binding = bindRadiantPortraitGestures(host, options); bindings.push(binding);
    const stats = host.querySelector<HTMLElement>('[data-stats] dd')!;
    pointer(stats, 'pointerdown');
    expect(card.classList.contains('is-arming')).toBe(true);
    vi.advanceTimersByTime(radiantHoldMilliseconds);
    expect(card.classList.contains('is-held')).toBe(true);
    pointer(stats, 'pointermove', 50, 100 - gestureThreshold);
    expect(card.classList.contains('is-primed')).toBe(true);
    pointer(stats, 'pointerup', 50, 100 - gestureThreshold);
    expect(options.cast).toHaveBeenCalledWith('tide', 'flare');
    expect(binding.consumeClick(actor)).toBe(true);
    expect(card.classList.contains('is-held') || card.classList.contains('is-primed')).toBe(false);
    expect(card.style.getPropertyValue('--radiant-drag')).toBe('');
    pointer(host.querySelector<HTMLElement>('[data-other-control]')!, 'pointerdown');
    expect(card.classList.contains('is-arming')).toBe(false); expect(vi.getTimerCount()).toBe(0);
  });
  it('recovers from a release that never reached the host', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    host.innerHTML = '<article data-radiant-card><button data-radiant-actor="tide">Tizu</button><p>Body</p></article>';
    document.body.append(host);
    const options = { cast: vi.fn(), ready: vi.fn((): string | null => 'Glowing Convergent Light'), open: vi.fn(), close: vi.fn(), notice: vi.fn() };
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
  it('marks a held card unready without priming when no Convergent Light is available', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    host.innerHTML = '<article data-radiant-card><button data-radiant-actor="tide">Tizu</button><p>Body</p></article>';
    document.body.append(host);
    const options = { cast: vi.fn(), ready: vi.fn((): string | null => null), open: vi.fn(), close: vi.fn(), notice: vi.fn() };
    bindings.push(bindRadiantPortraitGestures(host, options));
    const body = host.querySelector<HTMLElement>('p')!, card = host.querySelector<HTMLElement>('article')!;
    pointer(body, 'pointerdown'); vi.advanceTimersByTime(radiantHoldMilliseconds);
    pointer(body, 'pointermove', 50, 40);
    expect(card.classList.contains('is-unready')).toBe(true); expect(card.classList.contains('is-primed')).toBe(false);
    pointer(body, 'pointerup', 50, 40); expect(options.cast).not.toHaveBeenCalled();
  });
  describe('skill fan (D-479)', () => {
    function fanFixture() {
      vi.useFakeTimers();
      const host = document.createElement('div');
      host.innerHTML = `<article data-radiant-card><div data-radiant-fan><button data-radiant-skill="1">One</button>
        <button data-radiant-skill="2">Two</button><button data-radiant-skill="flare">Convergent Light</button></div>
        <button data-radiant-actor="tide">Tizu</button><p>Body</p></article>`;
      document.body.append(host);
      const options = { cast: vi.fn(), ready: vi.fn((): string | null => 'Glowing Convergent Light'), open: vi.fn(), close: vi.fn(), notice: vi.fn() };
      const binding = bindRadiantPortraitGestures(host, options); bindings.push(binding);
      const at = vi.fn((): Element | null => null);
      Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: at });
      return { host, options, binding, at, body: host.querySelector<HTMLElement>('p')!,
        actor: host.querySelector<HTMLButtonElement>('[data-radiant-actor]')!,
        choice: (slot: string) => host.querySelector<HTMLElement>(`[data-radiant-skill="${slot}"]`)! };
    }
    afterEach(() => { Reflect.deleteProperty(document, 'elementFromPoint'); });
    it('opens on hold and stays open for a tap after a release in place', () => {
      const { body, options, binding, actor } = fanFixture();
      pointer(body, 'pointerdown'); vi.advanceTimersByTime(radiantHoldMilliseconds);
      expect(options.open).toHaveBeenCalledWith('tide');
      pointer(body, 'pointerup');
      expect(options.cast).not.toHaveBeenCalled(); expect(options.close).not.toHaveBeenCalled();
      expect(binding.consumeClick(actor)).toBe(true);
    });
    it.each([['1', 1], ['2', 2], ['flare', 'flare']] as const)('releasing on choice %s casts that slot', (slot, expected) => {
      const { body, options, at, choice, host } = fanFixture();
      pointer(body, 'pointerdown'); vi.advanceTimersByTime(radiantHoldMilliseconds);
      at.mockReturnValue(choice(slot));
      pointer(body, 'pointermove', 50, 60);
      expect(choice(slot).classList.contains('is-selected')).toBe(true);
      expect(host.querySelector('[data-radiant-card]')!.classList.contains('is-primed')).toBe(false);
      pointer(body, 'pointerup', 50, 60);
      expect(options.cast).toHaveBeenCalledWith('tide', expected);
      expect(choice(slot).classList.contains('is-selected')).toBe(false);
    });
    it('a held drag released away from every choice closes the fan without an action', () => {
      const { body, options } = fanFixture();
      pointer(body, 'pointerdown'); vi.advanceTimersByTime(radiantHoldMilliseconds);
      pointer(body, 'pointermove', 120, 100); pointer(body, 'pointerup', 120, 100);
      expect(options.cast).not.toHaveBeenCalled(); expect(options.close).toHaveBeenCalled();
      expect(options.notice).toHaveBeenLastCalledWith('Skills closed; no action spent.');
    });
    it('Escape during a hold closes the fan', () => {
      const { body, options } = fanFixture();
      pointer(body, 'pointerdown'); vi.advanceTimersByTime(radiantHoldMilliseconds);
      body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(options.close).toHaveBeenCalled(); expect(options.cast).not.toHaveBeenCalled();
    });
    it('a press on a fan choice never starts a portrait gesture', () => {
      const { options, choice, host } = fanFixture();
      pointer(choice('2'), 'pointerdown');
      expect(host.querySelector('[data-radiant-card]')!.classList.contains('is-arming')).toBe(false);
      expect(options.open).not.toHaveBeenCalled();
    });
  });
  it('keeps keyboard activation usable immediately after an Escape-cancelled hold', () => {
    const { button, binding } = fixture();
    pointer(button, 'pointerdown'); vi.advanceTimersByTime(350);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(binding.consumeClick(button)).toBe(false);
  });
});
