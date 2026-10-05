import { type Starter } from '../content/starters';
import { type CharacterProgress } from '../content/progression';
import { reducedMotion } from './settings';

export type UpgradeKind = 'level' | 'evolve';
const active = new WeakMap<HTMLElement, () => void>();

export function upgradeCelebration(starter: Starter, kind: UpgradeKind, progress: CharacterProgress): string {
  return `<span class="upgrade-aura" aria-hidden="true"><span class="upgrade-aura-ring"></span>
    ${Array.from({ length: kind === 'evolve' ? 12 : 6 }, (_, index) =>
      `<span class="upgrade-spark" style="--angle:${index * (kind === 'evolve' ? 30 : 60)}deg;--delay:${index % 3 * 80}ms"></span>`).join('')}</span>
    <span class="upgrade-celebration-label" role="status">${starter.name}<strong>${kind === 'evolve' ? 'Evolution complete' : 'Level up'}</strong><span>${kind === 'evolve' ? `Evolution ${progress.evolution}` : `Level ${progress.level}`}</span></span>`;
}

export function celebrateUpgrade(host: HTMLElement, starter: Starter, kind: UpgradeKind, progress: CharacterProgress): void {
  const portrait = host.querySelector<HTMLElement>('.character-hub .hub-portrait');
  if (!portrait) throw new Error('Character portrait is missing for upgrade celebration.');
  active.get(portrait)?.();
  const celebration = document.createElement('span');
  celebration.className = `upgrade-celebration celebration-${kind}${reducedMotion() ? ' celebration-reduced' : ''}`;
  celebration.style.setProperty('--element', starter.color);
  celebration.innerHTML = upgradeCelebration(starter, kind, progress);
  portrait.append(celebration);
  portrait.classList.add(`celebrating-${kind}`);
  const cleanup = (): void => {
    clearTimeout(timer);
    celebration.remove();
    portrait.classList.remove('celebrating-level', 'celebrating-evolve');
    active.delete(portrait);
  };
  const timer = setTimeout(cleanup, kind === 'evolve' ? 2400 : 1800);
  active.set(portrait, cleanup);
}
