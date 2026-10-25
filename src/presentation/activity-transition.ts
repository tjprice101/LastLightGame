let active: Promise<void> | null = null;
export const activityLoadingDelay = 300;

export function activityTransitionPending(): boolean {
  return active !== null;
}

export function waitForActivityTransition(): Promise<void> {
  return active ?? Promise.resolve();
}

export function transitionActivity(enter: () => void | Promise<void>): Promise<void> {
  if (active) return active;
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const completion = new Promise<void>((done, failed) => { resolve = done; reject = failed; });
  active = completion.finally(() => { active = null; });
  void enterActivity(enter).then(resolve, reject);
  return active;
}

async function enterActivity(enter: () => void | Promise<void>): Promise<void> {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('Activity root is missing.');
  const previousInert = root.inert;
  let status: HTMLElement | undefined;
  const timer = setTimeout(() => {
    status = document.createElement('div');
    status.className = 'activity-transition';
    status.setAttribute('role', 'status');
    status.textContent = 'Loading\u2026';
    document.body.append(status);
  }, activityLoadingDelay);
  root.inert = true;
  try {
    await enter();
  } finally {
    clearTimeout(timer);
    root.inert = previousInert;
    status?.remove();
  }
  root.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
}
