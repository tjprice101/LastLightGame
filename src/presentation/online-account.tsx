import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { OnlineAccountDialog } from '../ui/online-account-dialog';
import '../styles/ui.css';

export function openOnlineAccount(onPlay?: () => Promise<void>): void {
  if (document.querySelector('#online-account')) return;
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    root.unmount();
    host.remove();
  };
  try { flushSync(() => root.render(<OnlineAccountDialog onClose={dispose} onPlay={onPlay} />)); }
  catch (error) { dispose(); throw error; }
}
