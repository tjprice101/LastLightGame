import './status-toast.css';

export const autosaveInterval = 60_000;
export const autosaveNoticeDuration = 1800;

export function showAutosaveNotice(): void {
  document.querySelector('.autosave-notice')?.remove();
  const notice = document.createElement('div');
  notice.className = 'autosave-notice';
  notice.setAttribute('role', 'status');
  notice.textContent = 'Your light endures. Progress saved.';
  document.body.append(notice);
  window.setTimeout(() => notice.remove(), autosaveNoticeDuration);
}

export function startAutosave(save: () => Promise<boolean> | boolean, saved: () => void, failed: (error: unknown) => void): () => void {
  let busy = false;
  let disposed = false;
  const timer = window.setInterval(() => {
    if (busy || disposed) return;
    busy = true;
    void Promise.resolve().then(save).then(result => {
      if (result && !disposed) saved();
    }).catch(error => { if (!disposed) failed(error); }).finally(() => { busy = false; });
  }, autosaveInterval);
  return () => { disposed = true; window.clearInterval(timer); };
}
