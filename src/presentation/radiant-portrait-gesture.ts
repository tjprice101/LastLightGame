import { gestureThreshold } from './battle-gesture';

export const radiantHoldMilliseconds = 350;
const otherControl = 'button, a, input, select, textarea, summary, details, [data-radiant-gesture-ignore]';
interface Drag {
  button: HTMLButtonElement;
  surface: HTMLElement;
  tier: string | null;
  id: string;
  pointer: number;
  x: number;
  y: number;
  started: number;
  held: boolean;
}

/** Resolves the whole member card (or a bare actor button) for a pointer
 * target, ignoring the card's other controls such as Actions. */
export function radiantGestureActor(target: Element, host: HTMLElement): HTMLButtonElement | null {
  const surface = target.closest<HTMLElement>('[data-radiant-card], [data-radiant-actor]');
  if (!surface || !host.contains(surface)) return null;
  const button = surface.matches('[data-radiant-actor]') ? surface as HTMLButtonElement :
    surface.querySelector<HTMLButtonElement>('[data-radiant-actor]');
  const control = target.closest(otherControl);
  if (!button || control && control !== button && surface.contains(control)) return null;
  return button;
}

/** Pointer capture keeps a charged release on its original card. A tap
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
      for (const element of new Set([prior.button, prior.surface])) {
        element.classList.remove('is-arming', 'is-held', 'is-dragging', 'is-primed', 'is-unready');
        element.style.removeProperty('--radiant-drag');
        element.style.removeProperty('--radiant-lift');
      }
      try { if (prior.surface.hasPointerCapture?.(prior.pointer)) prior.surface.releasePointerCapture(prior.pointer); } catch { /* Already released. */ }
    }
  };
  const cancel = () => {
    if (drag) suppressed = drag.button;
    reset();
  };
  const down = (event: PointerEvent) => {
    if (event.button !== 0 || event.isPrimary === false || !(event.target instanceof Element)) return;
    // A fresh primary press means any earlier release was missed (detached surface, outside window).
    if (drag) reset();
    const button = radiantGestureActor(event.target, host);
    if (!button || button.disabled) return;
    const surface = button.closest<HTMLElement>('[data-radiant-card]') ?? button;
    suppressed = null;
    options.select(button.dataset.radiantActor!);
    drag = { button, surface, tier: null, id: button.dataset.radiantActor!, pointer: event.pointerId,
      x: event.clientX, y: event.clientY, started: performance.now(), held: false };
    try { surface.setPointerCapture?.(event.pointerId); } catch { /* Inactive pointer: host listeners still track it. */ }
    surface.classList.add('is-arming');
    timer = setTimeout(() => {
      if (!drag) return;
      drag.held = true; suppressed = drag.button;
      const tier = drag.tier = options.ready(drag.id);
      drag.surface.classList.remove('is-arming');
      drag.surface.classList.add('is-held');
      drag.surface.classList.toggle('is-unready', !tier);
      if (drag.surface !== drag.button) drag.button.classList.add('is-held');
      options.notice(tier ? `${tier} ready. Drag upward and release to cast; Escape cancels.` :
        'Flare is not ready. Release to cancel; no action will be spent.');
    }, radiantHoldMilliseconds);
  };
  const move = (event: PointerEvent) => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) >= gestureThreshold) {
      suppressed = drag.button;
      drag.surface.classList.add('is-dragging');
    }
    if (drag.held) {
      event.preventDefault();
      drag.surface.style.setProperty('--radiant-drag', `${Math.max(-56, Math.min(16, dy))}px`);
      drag.surface.style.setProperty('--radiant-lift', String(Math.max(0, Math.min(1, -dy / gestureThreshold))));
      drag.surface.classList.toggle('is-primed',
        Boolean(drag.tier) && dy <= -gestureThreshold && Math.abs(dy) > Math.abs(dx));
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
  window.addEventListener('pointerup', lost);
  window.addEventListener('pointercancel', lost);
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
      window.removeEventListener('pointerup', lost);
      window.removeEventListener('pointercancel', lost);
    },
  };
}
