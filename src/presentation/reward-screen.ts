import { createGameDialog, escapeDialogText } from './game-dialog';
import { reducedMotion } from './settings';

export interface RewardPresentation {
  title: string;
  name: string;
  art: string;
  details: string;
  accent: string;
  animationLabel: string;
}

export function rewardScreenMarkup(reward: RewardPresentation): string {
  return `<div class="reward-content"><h2>${escapeDialogText(reward.title)}</h2>
    <div class="reward-stage"><span class="reward-halo" aria-hidden="true"></span><span class="reward-portal" aria-hidden="true"></span>
      <div class="reward-art" hidden>${reward.art}</div></div>
    <p class="reward-animation-label" role="status">${escapeDialogText(reward.animationLabel)}</p>
    <section class="reward-details" hidden><h3>${escapeDialogText(reward.name)}</h3>${reward.details}</section>
    <p class="reward-art-error" role="alert" hidden></p></div>
    <div class="game-dialog-actions"><button class="text-button" data-skip-reward>Skip animation</button>
      <button class="primary-button" data-close-reward hidden>Continue</button></div>`;
}

export async function presentReward(reward: RewardPresentation): Promise<void> {
  const { dialog, dispose } = createGameDialog(reward.title);
  dialog.classList.add('reward-screen');
  dialog.style.setProperty('--reward-accent', reward.accent);
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
  let revealed = false;
  const reveal = (animateArt = false): void => {
    if (revealed) return;
    revealed = true;
    animation?.cancel();
    portal.hidden = true;
    art.hidden = false;
    details.hidden = false;
    label.textContent = 'Reward saved';
    skip.hidden = true;
    close.hidden = false;
    dialog.setAttribute('aria-busy', 'false');
    close.focus({ preventScroll: true });
    if (animateArt && !reducedMotion()) {
      artAnimation = art.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 360, easing: 'ease-out' });
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
      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        if (!revealed) reveal();
        else dialog.close();
      });
      dialog.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        if (!revealed) reveal();
        else dialog.close();
      });
      close.addEventListener('click', () => dialog.close());
      skip.addEventListener('click', () => reveal());
      try {
        dialog.showModal();
        dialog.setAttribute('aria-busy', 'true');
        if (reducedMotion()) reveal();
        else {
          animation = portal.animate([
            { transform: 'rotate(45deg) scale(.3)', opacity: 0 },
            { transform: 'rotate(135deg) scale(1)', opacity: 1, offset: .3 },
            { transform: 'rotate(225deg) scale(1.2)', opacity: 1, offset: .8 },
            { transform: 'rotate(315deg) scale(2)', opacity: 0 },
          ], { duration: 2400, easing: 'ease-in-out', fill: 'forwards' });
          animation.onfinish = () => reveal(true);
        }
      } catch (error) { reject(error); }
    });
  } finally {
    motionQuery?.removeEventListener('change', motionChanged);
    window.removeEventListener('last-light-motion-change', motionChanged);
    animation?.cancel();
    artAnimation?.cancel();
    dispose();
  }
}
