import { gestureThreshold } from './battle-gesture';

export const radiantHoldMilliseconds = 120;
/** A skill fan choice (Phase 3 Step 3, D-479). */
export type RadiantFanSlot = 1 | 2 | 'flare';
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

/** The fan choice under a viewport point, if it belongs to this card. */
function fanSlotAt(surface: HTMLElement, x: number, y: number): RadiantFanSlot | null {
  const hit = typeof document.elementFromPoint === 'function' ? document.elementFromPoint(x, y) : null;
  const choice = hit?.closest<HTMLElement>('[data-radiant-skill]');
  if (!choice || !surface.contains(choice)) return null;
  const slot = choice.dataset.radiantSkill;
  return slot === '1' ? 1 : slot === '2' ? 2 : slot === 'flare' ? 'flare' : null;
}

/** Pointer capture keeps a charged release on its original card. A tap
 * remains a native button click; all deliberate/cancelled drags suppress it.
 * Holding opens the card's Skill 1 / Skill 2 / Flare fan (D-479): releasing on a
 * choice casts it, a held release in place leaves the fan open for a tap, a quick
 * upward swipe still casts a ready Flare, and any other release cancels. */
export function bindRadiantPortraitGestures(host: HTMLElement, options: {
  cast(id: string, slot: RadiantFanSlot): void;
  ready(id: string): string | null;
  open(id: string): void;
  close(): void;
  notice(text: string): void;
}): { cancel(): void; dispose(): void; consumeClick(button: HTMLButtonElement): boolean } {
  let drag: Drag | null = null, timer: ReturnType<typeof setTimeout> | null = null;
  let suppressed: HTMLButtonElement | null = null;
  const reset = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    const prior = drag; drag = null;
    if (prior) {
      for (const choice of Array.from(prior.surface.querySelectorAll('[data-radiant-skill].is-selected')))
        choice.classList.remove('is-selected');
      for (const element of new Set([prior.button, prior.surface])) {
        element.classList.remove('is-arming', 'is-held', 'is-dragging', 'is-primed', 'is-unready');
        element.style.removeProperty('--radiant-drag');
        element.style.removeProperty('--radiant-lift');
      }
      try { if (prior.surface.hasPointerCapture?.(prior.pointer)) prior.surface.releasePointerCapture(prior.pointer); } catch { /* Already released. */ }
    }
  };
  const cancel = () => {
    if (drag) { suppressed = drag.button; options.close(); }
    reset();
  };
  const activateHold = (notify: boolean) => {
    if (!drag || drag.held) return;
    drag.held = true; suppressed = drag.button;
    if (timer !== null) clearTimeout(timer);
    timer = null;
    const tier = drag.tier = options.ready(drag.id);
    drag.surface.classList.remove('is-arming');
    drag.surface.classList.add('is-held');
    drag.surface.classList.toggle('is-unready', !tier);
    if (drag.surface !== drag.button) drag.button.classList.add('is-held');
    options.open(drag.id);
    if (notify) options.notice(`Skills open. Release on Skill 1, Skill 2 or Flare to cast${tier ? `; swipe up for ${tier}` : ''}. Escape cancels.`);
  };
  const down = (event: PointerEvent) => {
    if (event.button !== 0 || event.isPrimary === false || !(event.target instanceof Element)) return;
    // A fresh primary press means any earlier release was missed (detached surface, outside window).
    if (drag) reset();
    const button = radiantGestureActor(event.target, host);
    if (!button || button.disabled) return;
    const surface = button.closest<HTMLElement>('[data-radiant-card]') ?? button;
    suppressed = null;
    drag = { button, surface, tier: null, id: button.dataset.radiantActor!, pointer: event.pointerId,
      x: event.clientX, y: event.clientY, started: performance.now(), held: false };
    try { surface.setPointerCapture?.(event.pointerId); } catch { /* Inactive pointer: host listeners still track it. */ }
    surface.classList.add('is-arming');
    timer = setTimeout(() => activateHold(true), radiantHoldMilliseconds);
  };
  const move = (event: PointerEvent) => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) >= gestureThreshold) {
      suppressed = drag.button;
      drag.surface.classList.add('is-dragging');
    }
    if (!drag.held && dy <= -gestureThreshold && Math.abs(dy) > Math.abs(dx)) activateHold(false);
    if (drag.held) {
      event.preventDefault();
      const slot = fanSlotAt(drag.surface, event.clientX, event.clientY);
      for (const choice of Array.from(drag.surface.querySelectorAll<HTMLElement>('[data-radiant-skill]')))
        choice.classList.toggle('is-selected', choice.dataset.radiantSkill === String(slot));
      drag.surface.style.setProperty('--radiant-drag', `${Math.max(-56, Math.min(16, slot ? 0 : dy))}px`);
      drag.surface.style.setProperty('--radiant-lift', String(slot ? 0 : Math.max(0, Math.min(1, -dy / gestureThreshold))));
      drag.surface.classList.toggle('is-primed',
        !slot && Boolean(drag.tier) && dy <= -gestureThreshold && Math.abs(dy) > Math.abs(dx));
    }
  };
  const up = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const prior = drag, dx = event.clientX - prior.x, dy = event.clientY - prior.y;
    const moved = Math.hypot(dx, dy) >= gestureThreshold;
    const held = prior.held || performance.now() - prior.started >= radiantHoldMilliseconds ||
      dy <= -gestureThreshold && Math.abs(dy) > Math.abs(dx);
    const deliberate = moved || held;
    if (deliberate) { suppressed = prior.button; event.preventDefault(); }
    const slot = held ? fanSlotAt(prior.surface, event.clientX, event.clientY) : null;
    reset();
    if (!deliberate) return;
    const tier = options.ready(prior.id);
    const swipe = held && dy <= -gestureThreshold && Math.abs(dy) > Math.abs(dx);
    if (prior.button.disabled) { options.close(); return; }
    if (slot) options.cast(prior.id, slot);
    else if (swipe && tier) options.cast(prior.id, 'flare');
    else if (held && !moved) return; // The fan stays open for a tap.
    else {
      options.close();
      options.notice(swipe && !tier ? 'Flare is not ready; no action spent.' : 'Skills closed; no action spent.');
    }
  };
  const lost = (event: PointerEvent) => { if (drag?.pointer === event.pointerId) cancel(); };
  const key = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && drag) { event.preventDefault(); cancel(); options.notice('Skills closed; no action spent.'); }
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
