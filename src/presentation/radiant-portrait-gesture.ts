import { gestureThreshold } from './battle-gesture';

export const radiantHoldMilliseconds = 350;
interface Drag {
  button: HTMLButtonElement;
  id: string;
  pointer: number;
  x: number;
  y: number;
  started: number;
  held: boolean;
}

/** Pointer capture keeps a charged release on its original portrait. A tap
 * remains a native button click; all deliberate/cancelled drags suppress it. */
export function bindRadiantPortraitGestures(host: HTMLElement, options: {
  select(id: string): void;
  cast(id: string): void;
  ready(id: string): string | null;
  notice(text: string): void;
}): { cancel(): void; dispose(): void; consumeClick(button: HTMLButtonElement): boolean } {
  let drag: Drag | null = null, timer: ReturnType<typeof setTimeout> | null = null;
  let suppressed: HTMLButtonElement | null = null;
  const reset = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    const prior = drag; drag = null;
    if (prior) {
      prior.button.classList.remove('is-held', 'is-dragging');
      prior.button.style.removeProperty('--radiant-drag');
      if (prior.button.hasPointerCapture?.(prior.pointer)) prior.button.releasePointerCapture(prior.pointer);
    }
  };
  const cancel = () => {
    if (drag) suppressed = drag.button;
    reset();
  };
  const down = (event: PointerEvent) => {
    if (event.button !== 0 || event.isPrimary === false || drag || !(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('[data-radiant-actor]');
    if (!button || !host.contains(button) || button.disabled) return;
    suppressed = null;
    options.select(button.dataset.radiantActor!);
    drag = { button, id: button.dataset.radiantActor!, pointer: event.pointerId,
      x: event.clientX, y: event.clientY, started: performance.now(), held: false };
    button.setPointerCapture?.(event.pointerId);
    timer = setTimeout(() => {
      if (!drag) return;
      drag.held = true; suppressed = drag.button;
      drag.button.classList.add('is-held');
      const tier = options.ready(drag.id);
      options.notice(tier ? `${tier} ready. Drag upward and release to cast; Escape cancels.` :
        'Flare is not ready. Release to cancel; no action will be spent.');
    }, radiantHoldMilliseconds);
  };
  const move = (event: PointerEvent) => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) >= gestureThreshold) {
      suppressed = drag.button;
      drag.button.classList.add('is-dragging');
    }
    if (drag.held) {
      event.preventDefault();
      drag.button.style.setProperty('--radiant-drag', `${Math.max(-56, Math.min(16, dy))}px`);
    }
  };
  const up = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const prior = drag, dx = event.clientX - prior.x, dy = event.clientY - prior.y;
    const moved = Math.hypot(dx, dy) >= gestureThreshold;
    const held = prior.held || performance.now() - prior.started >= radiantHoldMilliseconds;
    const deliberate = moved || held;
    if (deliberate) { suppressed = prior.button; event.preventDefault(); }
    reset();
    if (!deliberate) return;
    const tier = options.ready(prior.id);
    if (held && dy <= -gestureThreshold && Math.abs(dy) > Math.abs(dx) && tier && !prior.button.disabled)
      options.cast(prior.id);
    else options.notice(!tier ? 'Flare is not ready; no action spent.' :
      'Charged gesture cancelled. Hold the portrait, then drag upward and release.');
  };
  const lost = (event: PointerEvent) => { if (drag?.pointer === event.pointerId) cancel(); };
  const key = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && drag) { event.preventDefault(); cancel(); options.notice('Charged gesture cancelled.'); }
    else if (!drag && (event.key === 'Enter' || event.key === ' ')) suppressed = null;
  };
  host.addEventListener('pointerdown', down);
  host.addEventListener('pointermove', move, { passive: false });
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', lost);
  host.addEventListener('lostpointercapture', lost);
  host.addEventListener('keydown', key);
  window.addEventListener('blur', cancel);
  return {
    cancel,
    consumeClick(button) {
      if (suppressed !== button) return false;
      suppressed = null; return true;
    },
    dispose() {
      cancel();
      host.removeEventListener('pointerdown', down);
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerup', up);
      host.removeEventListener('pointercancel', lost);
      host.removeEventListener('lostpointercapture', lost);
      host.removeEventListener('keydown', key);
      window.removeEventListener('blur', cancel);
    },
  };
}
