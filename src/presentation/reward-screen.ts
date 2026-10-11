import { createGameDialog, escapeDialogText } from './game-dialog';
import { reducedMotion } from './settings';

export interface RewardPresentation {
  title: string;
  name: string;
  art: string;
  details: string;
  accent: string;
  animationLabel: string;
  savedLabel?: string;
  /** Highest summon star tier, used only for the pull screen's colour and animation. */
  tier?: SummonRevealTier;
}

export type SummonRevealTier = 'five-star' | 'six-star';

export function summonRevealTier(stars: number): SummonRevealTier | undefined {
  return stars >= 6 ? 'six-star' : stars === 5 ? 'five-star' : undefined;
}

const tierLabels: Record<SummonRevealTier, string> = {
  'five-star': 'A golden light answers the call\u2026',
  'six-star': 'Prismatic radiance erupts!',
};
const portalDurations = { none: 2400, 'five-star': 3200, 'six-star': 4300 } as const;

function tierEffects(tier: SummonRevealTier | undefined): string {
  if (!tier) return '';
  const sparks = tier === 'six-star' ? 18 : 10;
  return `<span class="reward-rays" aria-hidden="true"></span><span class="reward-ring" aria-hidden="true"></span>
      <span class="reward-sparks" aria-hidden="true">${Array.from({ length: sparks }, (_, index) =>
    `<i style="--spark-index:${index};--spark-count:${sparks}"></i>`).join('')}</span><span class="reward-flash" aria-hidden="true"></span>`;
}

export function rewardScreenMarkup(reward: RewardPresentation): string {
  const label = reward.tier ? tierLabels[reward.tier] : reward.animationLabel;
  return `<div class="reward-content"><h2>${escapeDialogText(reward.title)}</h2>
    <div class="reward-stage">${tierEffects(reward.tier)}<span class="reward-halo" aria-hidden="true"></span><span class="reward-portal" aria-hidden="true"></span>
      <div class="reward-art" hidden>${reward.art}</div></div>
    <p class="reward-animation-label" role="status">${escapeDialogText(label)}</p>
    <section class="reward-details" hidden><h3>${escapeDialogText(reward.name)}</h3>${reward.details}</section>
    <p class="reward-art-error" role="alert" hidden></p></div>
    <div class="game-dialog-actions"><button class="text-button" data-skip-reward>Skip animation</button>
      <button class="primary-button" data-close-reward hidden>Continue</button></div>`;
}

export async function presentReward(reward: RewardPresentation): Promise<void> {
  const { dialog, dispose } = createGameDialog(reward.title);
  dialog.classList.add('reward-screen');
  dialog.style.setProperty('--reward-accent', reward.accent);
  if (reward.tier) dialog.setAttribute('data-reward-tier', reward.tier);
  dialog.innerHTML = rewardScreenMarkup(reward);
  const portal = dialog.querySelector<HTMLElement>('.reward-portal');
  const art = dialog.querySelector<HTMLElement>('.reward-art');
  const details = dialog.querySelector<HTMLElement>('.reward-details');
  const label = dialog.querySelector<HTMLElement>('.reward-animation-label');
  const skip = dialog.querySelector<HTMLButtonElement>('[data-skip-reward]');
  const close = dialog.querySelector<HTMLButtonElement>('[data-close-reward]');
  const artError = dialog.querySelector<HTMLElement>('.reward-art-error');
  if (!portal || !art || !details || !label || !skip || !close || !artError) {
    dispose();
    throw new Error('Reward screen controls are missing.');
  }
  let animation: Animation | undefined;
  let artAnimation: Animation | undefined;
  let flashAnimation: Animation | undefined;
  let revealed = false;
  const reveal = (animateArt = false): void => {
    if (revealed) return;
    revealed = true;
    animation?.cancel();
    portal.hidden = true;
    art.hidden = false;
    details.hidden = false;
    label.textContent = reward.savedLabel ?? 'Reward saved';
    skip.hidden = true;
    close.hidden = false;
    dialog.setAttribute('aria-busy', 'false');
    close.focus({ preventScroll: true });
    dialog.setAttribute('data-reward-revealed', 'true');
    if (animateArt && !reducedMotion()) {
      artAnimation = reward.tier
        ? art.animate([{ opacity: 0, transform: 'scale(.6)', filter: 'brightness(3)' },
          { opacity: 1, transform: 'scale(1.08)', filter: 'brightness(1.6)', offset: .55 },
          { opacity: 1, transform: 'scale(1)', filter: 'brightness(1)' }], { duration: reward.tier === 'six-star' ? 900 : 650, easing: 'ease-out' })
        : art.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 360, easing: 'ease-out' });
      const flash = dialog.querySelector<HTMLElement>('.reward-flash');
      flashAnimation = flash?.animate([{ opacity: .95, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(2.4)' }],
        { duration: reward.tier === 'six-star' ? 1100 : 750, easing: 'ease-out' });
    }
  };
  dialog.addEventListener('error', (event) => {
    if (!(event.target instanceof HTMLImageElement)) return;
    console.error('Reward artwork failed to load', event.target.src);
    artError.hidden = false;
    artError.textContent = 'Reward artwork could not load. Your reward is saved; reload to retry the artwork.';
  }, true);
  let motionQuery: MediaQueryList | undefined;
  const motionChanged = (): void => { if (reducedMotion()) reveal(); };
  try {
    motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', motionChanged);
    window.addEventListener('last-light-motion-change', motionChanged);
    await new Promise<void>((resolve, reject) => {
      dialog.addEventListener('close', () => resolve(), { once: true });
      const finish = (): void => {
        dialog.close();
        resolve();
      };
      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        if (!revealed) reveal();
        else finish();
      });
      dialog.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        if (!revealed) reveal();
        else finish();
      });
      close.addEventListener('click', finish);
      skip.addEventListener('click', () => reveal());
      try {
        dialog.showModal();
        dialog.setAttribute('aria-busy', 'true');
        if (reducedMotion()) reveal();
        else {
          animation = portal.animate(reward.tier === 'six-star' ? [
            { transform: 'rotate(45deg) scale(.3)', opacity: 0 },
            { transform: 'rotate(225deg) scale(1)', opacity: 1, offset: .25 },
            { transform: 'rotate(405deg) scale(.85)', opacity: 1, offset: .5 },
            { transform: 'rotate(585deg) scale(1.35)', opacity: 1, offset: .75 },
            { transform: 'rotate(720deg) scale(.7)', opacity: 1, offset: .9 },
            { transform: 'rotate(765deg) scale(3)', opacity: 0 },
          ] : [
            { transform: 'rotate(45deg) scale(.3)', opacity: 0 },
            { transform: 'rotate(135deg) scale(1)', opacity: 1, offset: .3 },
            { transform: 'rotate(225deg) scale(1.2)', opacity: 1, offset: .8 },
            { transform: `rotate(315deg) scale(${reward.tier ? 2.6 : 2})`, opacity: 0 },
          ], { duration: portalDurations[reward.tier ?? 'none'], easing: 'ease-in-out', fill: 'forwards' });
          animation.onfinish = () => reveal(true);
        }
      } catch (error) { reject(error); }
    });
  } finally {
    motionQuery?.removeEventListener('change', motionChanged);
    window.removeEventListener('last-light-motion-change', motionChanged);
    animation?.cancel();
    artAnimation?.cancel();
    flashAnimation?.cancel();
    dispose();
  }
}
