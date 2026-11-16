import { reducedMotion } from './settings';
import './luster.css';

/*
 * Jewel & Gold luster motion (D-461). Presentation only: every effect is finite,
 * pointer-transparent, disposable and returns a cleanup. Under Reduce motion nothing
 * animates and the static gilded state (CSS) remains. Call reward effects only after
 * the underlying save succeeded; never for failed or cancelled actions. No randomness.
 */

const MOTION_EVENT = 'last-light-motion-change';
const noop = (): void => {};

function watch(target: Element, cleanup: () => void): () => void {
  const observer = new MutationObserver(() => { if (!target.isConnected) cleanup(); });
  observer.observe(document.body, { childList: true, subtree: true });
  const onMotion = (): void => { if (reducedMotion()) cleanup(); };
  window.addEventListener(MOTION_EVENT, onMotion);
  return () => { observer.disconnect(); window.removeEventListener(MOTION_EVENT, onMotion); };
}

const sheens = new Map<HTMLElement, () => void>();

/** A single gold sheen sweep across `target` (panel entry, primary-button hover, saved reward). */
export function lusterSheen(target: HTMLElement, durationMs = 900): () => void {
  sheens.get(target)?.();
  if (!target.isConnected || reducedMotion()) return noop;
  const sheen = document.createElement('span');
  sheen.className = 'luster-sheen';
  sheen.setAttribute('aria-hidden', 'true');
  sheen.style.setProperty('--luster-duration', `${durationMs}ms`);
  target.classList.add('luster-host');
  target.append(sheen);
  let cleaned = false;
  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    clearTimeout(timer);
    unwatch();
    sheen.remove();
    target.classList.remove('luster-host');
    sheens.delete(target);
  };
  const timer = setTimeout(cleanup, durationMs + 50);
  const unwatch = watch(target, cleanup);
  sheens.set(target, cleanup);
  return cleanup;
}

export interface StaggerOptions {
  /** Delay between consecutive items. */
  stepMs?: number;
  /** Items beyond this index share the last delay so long lists never wait. */
  maxSteps?: number;
  /** Duration of each item's entrance. */
  durationMs?: number;
}

/** Cascade the direct children (or `selector` matches) of `container` into view once. */
export function staggerIn(container: HTMLElement, selector?: string, options: StaggerOptions = {}): () => void {
  const { stepMs = 40, maxSteps = 12, durationMs = 320 } = options;
  const items = selector
    ? Array.from(container.querySelectorAll<HTMLElement>(selector))
    : Array.from(container.children).filter((node): node is HTMLElement => node instanceof HTMLElement);
  if (!container.isConnected || !items.length || reducedMotion()) return noop;
  items.forEach((item, index) => {
    item.classList.add('luster-stagger-item');
    item.style.setProperty('--luster-index', String(Math.min(index, maxSteps)));
  });
  container.classList.add('luster-stagger');
  container.style.setProperty('--luster-step', `${stepMs}ms`);
  container.style.setProperty('--luster-duration', `${durationMs}ms`);
  let cleaned = false;
  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    clearTimeout(timer);
    unwatch();
    container.classList.remove('luster-stagger');
    container.style.removeProperty('--luster-step');
    container.style.removeProperty('--luster-duration');
    for (const item of items) {
      item.classList.remove('luster-stagger-item');
      item.style.removeProperty('--luster-index');
    }
  };
  const timer = setTimeout(cleanup, durationMs + stepMs * Math.min(items.length - 1, maxSteps) + 50);
  const unwatch = watch(container, cleanup);
  return cleanup;
}

export interface CountUpOptions {
  delayMs?: number;
  durationMs?: number;
}

/**
 * Count the integer already shown in `element` up from zero, landing on the exact
 * original text (prefix, separators and suffix preserved; never abbreviated). Text
 * that is not a single positive safe integer is left untouched.
 */
export function countUp(element: HTMLElement, options: CountUpOptions = {}): () => void {
  const { delayMs = 0, durationMs = 600 } = options;
  const final = element.textContent ?? '';
  const match = /^(\D*?)(\d{1,3}(?:,\d{3})+|\d+)(\D*)$/.exec(final);
  if (!match || !element.isConnected || reducedMotion()) return noop;
  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ''));
  if (!Number.isSafeInteger(target) || target <= 0) return noop;
  element.setAttribute('aria-label', final.trim());
  element.textContent = `${prefix}0${suffix}`;
  let frame = 0;
  let cleaned = false;
  const start = performance.now() + delayMs;
  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    cancelAnimationFrame(frame);
    clearTimeout(fallback);
    unwatch();
    element.textContent = final;
    element.removeAttribute('aria-label');
  };
  const tick = (now: number): void => {
    const progress = Math.min(1, Math.max(0, (now - start) / durationMs));
    if (progress >= 1) { cleanup(); return; }
    element.textContent = `${prefix}${Math.round(target * (1 - (1 - progress) ** 3)).toLocaleString('en-US')}${suffix}`;
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  // Hidden documents may never paint; the exact value must always land.
  const fallback = setTimeout(cleanup, delayMs + durationMs + 200);
  const unwatch = watch(element, cleanup);
  return cleanup;
}
