import { reducedMotion } from './settings';

let active: Promise<void> | null = null;

export function activityTransitionPending(): boolean {
  return active !== null;
}

export function waitForActivityTransition(): Promise<void> {
  return active ?? Promise.resolve();
}

async function fade(overlay: HTMLElement, from: number, to: number): Promise<void> {
  if (reducedMotion()) {
    overlay.style.opacity = String(to);
    return;
  }
  const animation = overlay.animate([{ opacity: from }, { opacity: to }], { duration: 220, fill: 'forwards', easing: 'ease-in-out' });
  try {
    await animation.finished;
    overlay.style.opacity = String(to);
  } finally {
    animation.cancel();
  }
}

export function transitionActivity(enter: () => void | Promise<void>): Promise<void> {
  if (active) return active;
  active = runTransition(enter).finally(() => { active = null; });
  return active;
}

async function runTransition(enter: () => void | Promise<void>): Promise<void> {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('Activity root is missing.');
  const previousInert = root.inert;
  const overlay = document.createElement('div');
  overlay.className = 'activity-transition';
  overlay.innerHTML = '<div class="activity-loading" role="status"><strong>Loading!</strong><span class="activity-loading-track" aria-hidden="true"><span></span></span></div>';
  const bar = overlay.querySelector<HTMLElement>('.activity-loading-track > span');
  if (!bar) throw new Error('Activity loading bar is missing.');
  document.body.append(overlay);
  root.inert = true;
  try {
    await fade(overlay, 0, 1);
    bar.style.width = '35%';
    await enter();
    const images = Array.from(root.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])'));
    let loaded = 0;
    const loading = Promise.all(images.map(async (image) => {
      try { await image.decode(); }
      catch (error) { throw new Error(`Activity artwork could not load: ${image.alt || image.src}`, { cause: error }); }
      loaded++;
      bar.style.width = `${35 + loaded / images.length * 65}%`;
    }));
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([loading, new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Activity artwork loading timed out. Please retry or reload.')), 12000);
      })]);
    } finally {
      clearTimeout(timeout);
    }
    bar.style.width = '100%';
    await new Promise<void>((resolve) => setTimeout(resolve, reducedMotion() ? 120 : 180));
    await fade(overlay, 1, 0);
  } finally {
    root.inert = previousInert;
    overlay.remove();
  }
  root.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
}
