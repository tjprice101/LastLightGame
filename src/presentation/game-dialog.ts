import './game-dialog.css';

let active = false;

export function escapeDialogText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function createGameDialog(title: string): { dialog: HTMLDialogElement; dispose: () => void } {
  if (active) throw new Error('Another game dialog is already open.');
  const previousFocus = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.className = 'game-dialog';
  dialog.setAttribute('aria-label', title);
  document.body.append(dialog);
  active = true;
  const dispose = (): void => {
    if (dialog.open) dialog.close();
    dialog.remove();
    active = false;
    if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
  };
  return { dialog, dispose };
}

export function gameDialogPending(): boolean {
  return active;
}

export async function gameConfirm(message: string, options: { title?: string; confirmLabel?: string; danger?: boolean } = {}): Promise<boolean> {
  if (active) return false;
  const title = options.title ?? 'Confirm action';
  const { dialog, dispose } = createGameDialog(title);
  dialog.innerHTML = `<h2>${escapeDialogText(title)}</h2><p class="game-confirm-message">${escapeDialogText(message)}</p>
    <form method="dialog" class="game-dialog-actions"><button class="text-button" value="cancel" autofocus>Cancel</button>
    <button class="primary-button${options.danger ? ' game-destructive' : ''}" value="confirm">${escapeDialogText(options.confirmLabel ?? 'Confirm')}</button></form>`;
  try {
    return await new Promise<boolean>((resolve, reject) => {
      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true });
      const cancel = (): void => { dialog.returnValue = 'cancel'; dialog.close(); };
      dialog.addEventListener('cancel', (event) => { event.preventDefault(); cancel(); });
      dialog.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        cancel();
      });
      try { dialog.showModal(); } catch (error) { reject(error); }
    });
  } finally { dispose(); }
}
