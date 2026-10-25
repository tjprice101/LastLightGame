import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export function Icon({ name }: { name: 'arrow' | 'save' | 'export' | 'load' | 'delete' | 'close' | 'account' }) {
  const paths = {
    arrow: 'M5 12h14m-5-5 5 5-5 5',
    save: 'M5 3h12l4 4v14H3V3h2m2 0v6h10V3M7 21v-8h10v8',
    export: 'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6',
    load: 'M12 3v13m-5-5 5 5 5-5M4 15v6h16v-6',
    delete: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
    close: 'm6 6 12 12M6 18 18 6',
    account: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-3a8 8 0 0 1 16 0v3',
  };
  return <svg className="ll-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export function Button({ tone = 'secondary', className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary' | 'danger' | 'quiet';
}) {
  return <button type="button" {...props} className={`ll-button ll-button--${tone} ${className}`}>{children}</button>;
}

export function Panel({ title, description, children, className = '' }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return <section className={`ll-panel ${className}`}><div className="ll-panel-heading"><h3>{title}</h3>{description && <p>{description}</p>}</div>{children}</section>;
}

export function Status({ message, error = false }: { message: string; error?: boolean }) {
  return <p className={`ll-status${error ? ' ll-status--error' : ''}`} role={error ? 'alert' : 'status'} aria-live="polite">{message}</p>;
}

export function Dialog({ id, title, subtitle, onClose, children, busy = false }: {
  id: string; title: string; subtitle?: string; onClose: () => void; children: ReactNode; busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement;
    dialog.showModal();
    (dialog.querySelector<HTMLElement>('[autofocus]') ?? dialog.querySelector<HTMLElement>('input:not([type=radio])') ??
      dialog.querySelector<HTMLElement>('button'))?.focus();
    return () => {
      if (dialog.open) dialog.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} id={id} className="ll-ui ll-dialog" aria-labelledby={`${id}-heading`} aria-busy={busy}
    onCancel={event => { event.preventDefault(); close.current(); }}>
    <header className="ll-dialog-heading"><div><p className="ll-kicker">LAST LIGHT</p><h2 id={`${id}-heading`}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      <Button tone="quiet" className="ll-close" aria-label={`Close ${title}`} onClick={onClose}><Icon name="close" /></Button></header>
    {children}
  </dialog>;
}
