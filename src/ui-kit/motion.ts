/**
 * The one answer to "may this move?" for the menus (D-497): motion is reduced when either the in-game
 * setting or the device asks for it. `reducedMotion()` stays the explicit in-game read; this sits above it.
 */
import { reducedMotion } from '../presentation/settings';

const deviceQuery = '(prefers-reduced-motion: reduce)';

export function deviceReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia(deviceQuery).matches;
}

export function motionAllowed(): boolean {
  return !reducedMotion() && !deviceReducedMotion();
}

/**
 * Mirrors the answer onto `html[data-motion-effective]` ("full" or "reduced") so kit CSS keys on one
 * attribute, and keeps it current when either setting changes. Returns a disposer.
 */
export function installMotion(): () => void {
  const sync = (): void => { document.documentElement.dataset.motionEffective = motionAllowed() ? 'full' : 'reduced'; };
  const device = typeof matchMedia === 'function' ? matchMedia(deviceQuery) : null;
  sync();
  window.addEventListener('last-light-motion-change', sync);
  device?.addEventListener('change', sync);
  return () => {
    window.removeEventListener('last-light-motion-change', sync);
    device?.removeEventListener('change', sync);
  };
}
