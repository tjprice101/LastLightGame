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

export interface GameChoice<T extends string> { value: T; label: string; primary?: boolean }
/** Styled dialog with arbitrary choices; Escape/backdrop cancel resolves to `cancelValue`. */
export async function gameChoose<T extends string>(message: string, choices: readonly GameChoice<T>[], cancelValue: T,
  options: { title?: string; messageHtml?: string } = {}): Promise<T> {
  if (active) return cancelValue;
  const title = options.title ?? 'Choose an action';
  const { dialog, dispose } = createGameDialog(title);
  dialog.innerHTML = `<h2>${escapeDialogText(title)}</h2>${options.messageHtml ?? `<p class="game-confirm-message">${escapeDialogText(message)}</p>`}
    <form method="dialog" class="game-dialog-actions">${choices.map(choice => `<button class="${choice.primary ? 'primary-button' : 'text-button'}" value="${escapeDialogText(choice.value)}"${choice.value === cancelValue ? ' autofocus' : ''}>${escapeDialogText(choice.label)}</button>`).join('')}</form>`;
  try {
    return await new Promise<T>((resolve, reject) => {
      const finish = (value: T): void => { resolve(value); dialog.close(); };
      dialog.addEventListener('close', () => resolve(cancelValue), { once: true });
      dialog.addEventListener('submit', (event) => {
        event.preventDefault();
        const choice = event.submitter instanceof HTMLButtonElement ? choices.find(entry => entry.value === (event.submitter as HTMLButtonElement).value) : undefined;
        if (!choice) { reject(new Error('Dialog choice is invalid.')); return; }
        finish(choice.value);
      });
      dialog.addEventListener('cancel', (event) => { event.preventDefault(); finish(cancelValue); });
      dialog.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        finish(cancelValue);
      });
      try { dialog.showModal(); } catch (error) { reject(error); }
    });
  } finally { dispose(); }
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
      const finish = (confirmed: boolean): void => {
        dialog.returnValue = confirmed ? 'confirm' : 'cancel';
        dialog.close();
        resolve(confirmed);
      };
      dialog.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!(event.submitter instanceof HTMLButtonElement) || !['confirm', 'cancel'].includes(event.submitter.value)) {
          reject(new Error('Confirmation action is invalid.'));
          return;
        }
        finish(event.submitter.value === 'confirm');
      });
      const cancel = (): void => { finish(false); };
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
