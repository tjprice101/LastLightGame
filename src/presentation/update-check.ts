import { createGameDialog, gameDialogPending } from './game-dialog';

/** Build identifier embedded at build time; the deployed version.json carries the same value (D-339). */
export const currentBuild: string = typeof __BUILD_ID__ === 'string' ? __BUILD_ID__ : 'development';

const minimumInterval = 30_000;
let lastCheck = 0;
let checking: Promise<boolean> | null = null;
let prompted = false;
let pending = false;
let disposeDialog: (() => void) | null = null;

export interface UpdateCheckOptions {
  fetcher?: typeof fetch;
  now?: () => number;
  reload?: () => void;
  /** Battles and other blocking screens defer the prompt until the next safe screen change. */
  blocked?: () => boolean;
  force?: boolean;
}

export async function fetchDeployedBuild(fetcher: typeof fetch = fetch): Promise<string | null> {
  try {
    const response = await fetcher(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    return body && typeof body === 'object' && typeof (body as { build?: unknown }).build === 'string' ? (body as { build: string }).build : null;
  } catch {
    return null;
  }
}

/** Shows a blocking in-game prompt that only offers Refresh; nothing else can be used until the page reloads. */
export function showUpdatePrompt(reload: () => void = () => location.reload()): boolean {
  if (prompted) return true;
  if (gameDialogPending()) return false;
  prompted = true;
  const { dialog, dispose } = createGameDialog('Update available');
  disposeDialog = dispose;
  dialog.classList.add('update-dialog');
  dialog.innerHTML = `<h2>Update available</h2><p class="game-confirm-message">A new version of Last Light is ready. Refresh to load it before continuing. Your saved progress is kept.</p>
    <form method="dialog" class="game-dialog-actions"><button class="primary-button" value="refresh" autofocus data-update-refresh>Refresh now</button></form>`;
  dialog.addEventListener('cancel', (event) => event.preventDefault());
  dialog.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); } });
  dialog.addEventListener('submit', (event) => { event.preventDefault(); reload(); });
  dialog.showModal();
  return true;
}

/** Compares the deployed build with this page's build; when they differ, prompts the player to refresh. */
export async function checkForUpdate(options: UpdateCheckOptions = {}): Promise<boolean> {
  if (import.meta.env.DEV && !options.fetcher) return false;
  if (prompted) return true;
  if (pending && !options.blocked?.()) return showUpdatePrompt(options.reload);
  const now = (options.now ?? Date.now)();
  if (checking) return checking;
  if (!options.force && now - lastCheck < minimumInterval) return false;
  lastCheck = now;
  checking = (async () => {
    const deployed = await fetchDeployedBuild(options.fetcher);
    if (!deployed || deployed === currentBuild) return false;
    pending = true;
    if (options.blocked?.()) return false;
    return showUpdatePrompt(options.reload);
  })().finally(() => { checking = null; });
  return checking;
}

export function resetUpdateCheckForTests(): void {
  lastCheck = 0;
  checking = null;
  prompted = false;
  pending = false;
  disposeDialog?.();
  disposeDialog = null;
}
