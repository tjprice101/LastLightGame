import './status-toast.css';

export type ToastTone = 'error' | 'success' | 'info';

const successPattern = /(purchased and saved|leveled up\.|evolved\.|equipped|confirmed and saved|^Offline save (loaded|deleted)|^Offline save data deleted|^Debug profile active|warnings hidden|^Creature sold)/i;
const failurePattern = /\b(not|cannot|could not|unable|unavailable|failed|missing|unknown|requires?|choose|only|protected|not enough)\b/i;

export function toastTone(message: string): ToastTone {
  if (/coming later/i.test(message)) return 'info';
  if (successPattern.test(message) && !/presentation could not complete|was not/i.test(message)) return 'success';
  if (failurePattern.test(message)) return 'error';
  return 'info';
}

const titles: Record<ToastTone, string> = { error: 'Action not completed', success: 'Done', info: 'Notice' };
const icons: Record<ToastTone, string> = { error: '!', success: '✓', info: 'i' };
const lifetimes: Record<ToastTone, number> = { error: 9000, success: 4500, info: 6500 };
const timers = new WeakMap<HTMLElement, number>();

/** Renders a styled, dismissible toast into the shared status live region. */
export function showStatusToast(status: HTMLElement, message: string, options: { persistent?: boolean } = {}): HTMLElement {
  const tone = toastTone(message);
  const previous = timers.get(status);
  if (previous !== undefined) clearTimeout(previous);
  const doc = status.ownerDocument;
  status.textContent = '';
  status.dataset.toastTone = tone;
  const icon = doc.createElement('span');
  icon.className = 'status-toast-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = icons[tone];
  const body = doc.createElement('span');
  body.className = 'status-toast-body';
  const title = doc.createElement('strong');
  title.textContent = titles[tone];
  const text = doc.createElement('span');
  text.className = 'status-toast-message';
  text.textContent = message;
  body.append(title, text);
  const close = doc.createElement('button');
  close.type = 'button';
  close.className = 'status-toast-close';
  close.setAttribute('aria-label', 'Dismiss message');
  close.textContent = '×';
  const clear = (): void => {
    const timer = timers.get(status);
    if (timer !== undefined) clearTimeout(timer);
    timers.delete(status);
    status.textContent = '';
    delete status.dataset.toastTone;
  };
  close.addEventListener('click', clear);
  status.append(icon, body, close);
  if (!options.persistent) {
    const view = doc.defaultView;
    if (view) timers.set(status, view.setTimeout(() => { if (status.contains(close)) clear(); }, lifetimes[tone]));
  }
  return body;
}
