import { useEffect, useRef, useState, type FormEvent } from 'react';
import { accountRequest, onlineClient, onlineUsername } from '../online/account-client';
import { Button, Dialog, Icon, Status } from './components';

type AccountAction = 'login' | 'register' | 'recover';

export function OnlineAccountDialog({ onClose, onPlay }: { onClose: () => void; onPlay?: () => Promise<void> }) {
  const [mode, setMode] = useState<AccountAction>('login');
  const [username, setUsername] = useState<string | null>(null);
  const [status, setStatus] = useState({ message: '', error: false });
  const [busy, setBusy] = useState(true);
  const [resetPassword, setResetPassword] = useState(() => new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery');
  const lock = useRef(true);
  const alive = useRef(true);
  const recovery = useRef(new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery');
  const report = (error: unknown) => {
    console.error('Online account operation failed', error instanceof Error ? error.message : error);
    if (alive.current) setStatus({ message: error instanceof Error ? error.message : 'Account operation failed. Please try again.', error: true });
  };
  const run = async (operation: () => Promise<void> | void) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setStatus({ message: '', error: false });
    try { await operation(); } catch (error) { report(error); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  };
  const refresh = async () => {
    const user = await onlineUsername();
    if (!alive.current) return null;
    setUsername(user);
    if (user) setStatus({ message: `Signed in as ${user}.`, error: false });
    return user;
  };
  const enter = async () => {
    if (!onPlay || !alive.current || recovery.current) return;
    await onPlay();
    if (alive.current) onClose();
  };
  useEffect(() => {
    alive.current = true;
    let subscription: { unsubscribe(): void } | undefined;
    try {
      subscription = onlineClient().auth.onAuthStateChange(event => {
        if (event === 'PASSWORD_RECOVERY' && alive.current) {
          recovery.current = true;
          setResetPassword(true);
          setStatus({ message: 'Choose a new password for your account.', error: false });
        }
      }).data.subscription;
      void refresh().then(async user => { if (user) await enter(); }).catch(report).finally(() => { lock.current = false; if (alive.current) setBusy(false); });
    } catch (error) { report(error); lock.current = false; setBusy(false); }
    return () => { alive.current = false; subscription?.unsubscribe(); };
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const action = mode;
    void run(async () => {
      const message = await accountRequest(action, String(data.get('username') ?? ''), String(data.get('password') ?? ''), String(data.get('email') ?? ''));
      const password = form.elements.namedItem('password');
      if (password instanceof HTMLInputElement) password.value = '';
      const user = await refresh();
      if (user && action !== 'recover') await enter();
      else if (alive.current) setStatus({ message, error: false });
    });
  };

  const play = () => void run(async () => {
    if (!onPlay) return;
    const user = await onlineUsername();
    if (!user) throw new Error('Sign in before playing online.');
    if (!alive.current) return;
    await enter();
  });

  return <Dialog id="online-account" title="Online account" subtitle="Sign in, create an account or recover access." onClose={onClose} busy={busy}>
    {!username ? <>
      <div className="ll-account-tabs" role="group" aria-label="Account action">
        {(['login', 'register', 'recover'] as const).map(action => <Button key={action} tone="quiet" disabled={busy} aria-pressed={mode === action} onClick={() => setMode(action)}>
          {action === 'login' ? 'Sign in' : action === 'register' ? 'Create account' : 'Recover'}</Button>)}
      </div>
      <form className="ll-account-form" onSubmit={submit}>
        <fieldset disabled={busy} className="ll-fields">
          <label className="ll-field">Username<input name="username" autoComplete="username" minLength={3} maxLength={16} pattern="[A-Za-z0-9_]{3,16}" required /></label>
          {mode !== 'recover' && <label className="ll-field">Password<input name="password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 12 : undefined} maxLength={128} required /></label>}
          {mode === 'register' && <label className="ll-field">Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>}
        </fieldset>
        <Button tone="primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send recovery email'}<Icon name="arrow" /></Button>
      </form>
    </> : <>
      <div className="ll-account-actions">{onPlay && status.error && !resetPassword && <Button tone="primary" disabled={busy} onClick={play}>Retry connection<Icon name="arrow" /></Button>}
        <Button disabled={busy} onClick={() => void run(async () => {
          const { error } = await onlineClient().auth.signOut();
          if (error) throw new Error('Sign-out failed. Please try again.');
          setResetPassword(false);
          await refresh();
          if (alive.current) setStatus({ message: 'Signed out.', error: false });
        })}>Sign out</Button></div>
    </>}
    {resetPassword && <form className="ll-account-form ll-password-reset" onSubmit={event => {
      event.preventDefault();
      const form = event.currentTarget;
      const password = String(new FormData(form).get('new-password') ?? '');
      void run(async () => {
        if (password.length < 12 || password.length > 128) throw new Error('Use a password of 12–128 characters.');
        const { error } = await onlineClient().auth.updateUser({ password });
        if (error) throw new Error('Password could not be updated. Please request a new recovery link.');
        form.reset(); setResetPassword(false); recovery.current = false;
        if (onPlay) await enter();
        else setStatus({ message: 'Your password has been updated.', error: false });
      });
    }}><label className="ll-field">New password<input name="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} disabled={busy} required /></label>
      <Button tone="primary" type="submit" disabled={busy}>Save new password</Button></form>}
    <Status {...status} />
  </Dialog>;
}
