import { rarityColors, type Rarity } from '../content/rarity';
import { reducedMotion } from './settings';
import './rarity-feedback.css';

const active = new Map<HTMLElement, () => void>();

export function rarityMotionReduced(): boolean {
  return reducedMotion();
}

/** Presentation only: call after a successful save, or an accepted transient selection. */
export function rarityFeedback(target: HTMLElement, rarity: Rarity, label?: string): () => void {
  active.get(target)?.();
  if (!target.isConnected) return () => {};
  const effect = document.createElement('span');
  effect.className = 'rarity-feedback';
  effect.dataset.rarity = rarity;
  effect.setAttribute('aria-hidden', 'true');
  const bounds = target.getBoundingClientRect();
  const extent = Math.max(24, Math.min(bounds.width, bounds.height, 240));
  effect.style.setProperty('--impact-size', `${extent * .72}px`);
  effect.style.setProperty('--spark-distance', `${extent * .4}px`);
  effect.innerHTML = `<span class="rarity-feedback-sweep"></span><span class="rarity-feedback-ring"></span>${
    Array.from({ length: 12 }, (_, index) =>
      `<i class="rarity-feedback-spark" style="--spark-angle:${index * 30}deg;--spark-delay:${index % 4 * 35}ms;--spark-scale:${.65 + index % 3 * .2}"></i>`).join('')}${
    Array.from({ length: 16 }, (_, index) =>
      `<i class="rarity-feedback-mote" style="--mote-x:${12 + index * 37 % 76}%;--mote-y:${10 + index * 29 % 80}%;--spark-delay:${100 + index % 5 * 65}ms;--mote-size:${index % 3 === 0 ? 5 : 3}px"></i>`).join('')}`;
  const notice = label ? document.createElement('span') : null;
  if (notice) {
    notice.className = 'rarity-feedback-label';
    notice.setAttribute('role', 'status');
    notice.textContent = label ?? '';
    notice.style.setProperty('--rarity-color', rarityColors[rarity]);
    effect.append(notice);
    effect.removeAttribute('aria-hidden');
    effect.querySelectorAll('.rarity-feedback-sweep, .rarity-feedback-ring, .rarity-feedback-spark, .rarity-feedback-mote')
      .forEach(node => node.setAttribute('aria-hidden', 'true'));
  }
  target.classList.add('rarity-feedback-host');
  target.append(effect);
  const updateMotion = (): void => { effect.classList.toggle('rarity-feedback-reduced', rarityMotionReduced()); };
  updateMotion();
  let cleaned = false;
  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    clearTimeout(timer);
    observer.disconnect();
    window.removeEventListener('last-light-motion-change', updateMotion);
    effect.remove();
    target.classList.remove('rarity-feedback-host');
    active.delete(target);
  };
  const observer = new MutationObserver(() => { if (!target.isConnected || !effect.isConnected) cleanup(); });
  observer.observe(document.body, { childList: true, subtree: true });
  const timer = setTimeout(cleanup, label ? 1800 : 1150);
  window.addEventListener('last-light-motion-change', updateMotion);
  active.set(target, cleanup);
  return cleanup;
}

export function clearRarityFeedback(host: HTMLElement): void {
  for (const [target, cleanup] of active) if (target === host || host.contains(target)) cleanup();
}
