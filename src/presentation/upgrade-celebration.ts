import { type Starter } from '../content/starters';
import { type CharacterProgress } from '../content/progression';
import { characterName } from '../content/character-art';
import { characterRarity } from '../content/progression';
import { rarityColors } from '../content/rarity';
import { rarityFeedback, rarityMotionReduced } from './rarity-feedback';

export type UpgradeKind = 'level' | 'evolve';
export type AscensionCelebrationStep = 'stats' | 'skill1' | 'skill2' | 'lastFlare';
const active = new WeakMap<HTMLElement, () => void>();

export function upgradeCelebration(starter: Starter, kind: UpgradeKind, progress: CharacterProgress): string {
  return `<span class="upgrade-aura" aria-hidden="true"><span class="upgrade-aura-ring"></span>
    ${Array.from({ length: kind === 'evolve' ? 12 : 6 }, (_, index) =>
      `<span class="upgrade-spark" style="--angle:${index * (kind === 'evolve' ? 30 : 60)}deg;--delay:${index % 3 * 80}ms"></span>`).join('')}</span>
    <span class="upgrade-celebration-label" role="status">${characterName(starter.id, progress.evolution)}<strong>${kind === 'evolve' ? 'Evolution complete' : 'Level up'}</strong><span>${kind === 'evolve' ? `Evolution ${progress.evolution}` : `Level ${progress.level}`}</span></span>`;
}

export function celebrateUpgrade(host: HTMLElement, starter: Starter, kind: UpgradeKind, progress: CharacterProgress): void {
  const portrait = host.querySelector<HTMLElement>('.hub-showcase .hub-portrait');
  if (!portrait) throw new Error('Character portrait is missing for upgrade celebration.');
  active.get(portrait)?.();
  const celebration = document.createElement('span');
  celebration.className = `upgrade-celebration celebration-${kind}${rarityMotionReduced() ? ' celebration-reduced' : ''}`;
  const rarity = characterRarity(starter.id, progress.evolution);
  celebration.style.setProperty('--element', rarityColors[rarity]);
  celebration.innerHTML = upgradeCelebration(starter, kind, progress);
  portrait.append(celebration);
  const clearShimmer = rarityFeedback(celebration, rarity);
  portrait.classList.add(`celebrating-${kind}`);
  const updateMotion = (): void => { celebration.classList.toggle('celebration-reduced', rarityMotionReduced()); };
  window.addEventListener('last-light-motion-change', updateMotion);
  const cleanup = (): void => {
    clearTimeout(timer);
    window.removeEventListener('last-light-motion-change', updateMotion);
    clearShimmer();
    celebration.remove();
    portrait.classList.remove('celebrating-level', 'celebrating-evolve');
    active.delete(portrait);
  };
  const timer = setTimeout(cleanup, kind === 'evolve' ? 2400 : 1800);
  active.set(portrait, cleanup);
}

export function celebrateAscension(host: HTMLElement, starter: Starter, step: AscensionCelebrationStep, progress: CharacterProgress): void {
  const portrait = host.querySelector<HTMLElement>('.hub-showcase .hub-portrait');
  if (!portrait) throw new Error('Character portrait is missing for Calamitic Ascension feedback.');
  active.get(portrait)?.();
  const celebration = document.createElement('span');
  celebration.className = `upgrade-celebration celebration-ascension${rarityMotionReduced() ? ' celebration-reduced' : ''}`;
  celebration.style.setProperty('--element', '#a80f2d');
  const label = step === 'stats' ? 'Calamitic Ascension complete' : 'Calamitic Imbue complete';
  celebration.innerHTML = `<span class="upgrade-aura" aria-hidden="true"><span class="upgrade-aura-ring"></span>${Array.from({ length: 16 }, (_, index) =>
    `<span class="upgrade-spark" style="--angle:${index * 22.5}deg;--delay:${index % 4 * 55}ms"></span>`).join('')}</span>
    <span class="upgrade-celebration-label" role="status">${characterName(starter.id, progress.evolution, true)}<strong>${label}</strong><span>${step === 'stats' ? 'Rise-blessed' : step === 'lastFlare' ? 'Last Flare' : step === 'skill1' ? 'Skill 1' : 'Skill 2'}</span></span>`;
  portrait.append(celebration);
  const clearFeedback = rarityFeedback(celebration, 'Calamitic', label);
  portrait.classList.add('celebrating-ascension');
  const updateMotion = (): void => { celebration.classList.toggle('celebration-reduced', rarityMotionReduced()); };
  window.addEventListener('last-light-motion-change', updateMotion);
  let cleaned = false;
  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    clearTimeout(timer);
    window.removeEventListener('last-light-motion-change', updateMotion);
    clearFeedback();
    celebration.remove();
    portrait.classList.remove('celebrating-ascension');
    active.delete(portrait);
  };
  const timer = setTimeout(cleanup, 2200);
  active.set(portrait, cleanup);
}
