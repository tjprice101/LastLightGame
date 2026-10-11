import { useEffect, useRef, useState } from 'react';
import { onlineUsername } from '../online/account-client';
import { gameOperation } from '../online/server-game';
import { needsOfflineExport, PENDING_IMPORT_KEY, validateSaveFile, type SaveFile } from '../game/save-file';
import { exportOfflineSave, readSaveUpload } from '../presentation/offline-save';
import { gameConfirm } from '../presentation/game-dialog';
import { OfflineSavePanel, type OfflineChange } from './offline-save-panel';
import { Button, Icon, Panel, Status } from './components';

export function PlayerSaveData({ onChanged, onReady, onAccount }: {
  onChanged: (change: OfflineChange) => void; onReady: () => Promise<void> | void; onAccount: () => void;
}) {
  const [username, setUsername] = useState<string | null>(null);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [choice, setChoice] = useState<'fresh' | 'import'>('fresh');
  const [save, setSave] = useState<SaveFile | null>(null);
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState({ message: '', error: false });
  const [busy, setBusy] = useState(true);
  const alive = useRef(true);
  const lock = useRef(true);
  const loadedUser = useRef<string | null>(null);
  const requestId = useRef<string>(crypto.randomUUID());
  const report = (error: unknown) => {
    console.error('Player save-data operation failed', error);
    if (alive.current) setStatus({ message: error instanceof Error ? error.message : 'Save-data operation failed. Please try again.', error: true });
  };
  const run = async (operation: () => Promise<void> | void) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setStatus({ message: '', error: false });
    try { await operation(); } catch (error) { report(error); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  };
  const refresh = async () => {
    setEligible(null);
    const user = await onlineUsername();
    if (!alive.current) return;
    if (loadedUser.current !== user) {
      setSave(null); setChoice('fresh'); setSummary(''); requestId.current = crypto.randomUUID();
    }
    loadedUser.current = user;
    setUsername(user);
    if (!user) return;
    const response = await gameOperation({ kind: 'read' });
    if (!alive.current) return;
    const canImport = response.starterId === null && response.revision === 0;
    setEligible(canImport);
    if (!canImport) return;
    const raw = localStorage.getItem(PENDING_IMPORT_KEY);
    if (!raw) return;
    const staged: unknown = JSON.parse(raw);
    if (!staged || typeof staged !== 'object' || !('username' in staged) || !('save' in staged) ||
      !('requestId' in staged) || typeof staged.requestId !== 'string') throw new Error('Pending save import is unreadable. Choose your exported file again.');
    if (staged.username !== user) return;
    setSave(validateSaveFile(staged.save)); setChoice('import'); requestId.current = staged.requestId;
    setSummary('Your previously selected save is ready to import.');
  };
  useEffect(() => {
    alive.current = true;
    void refresh().catch(report).finally(() => { lock.current = false; if (alive.current) setBusy(false); });
    return () => { alive.current = false; };
  }, []);

  return <div className="ll-player-save-data">
    <OfflineSavePanel onChanged={onChanged} />
    <Panel title="Online save data" description={username ? `Signed in as ${username}. Online progress saves automatically to your account.` : 'Sign in or create an account to bring your offline progress online.'}>
      {!username && <Button disabled={busy} onClick={() => void run(async () => {
        if (needsOfflineExport(localStorage)) {
          if (await gameConfirm('Your latest offline progress has not been exported. Download a backup before opening account setup? Your browser save will also be kept.', { title: 'Back up offline progress', confirmLabel: 'Export backup' })) exportOfflineSave();
          else if (!await gameConfirm('Continue without exporting a backup? Browser data can be lost if this device is cleared.', { title: 'Continue without backup', confirmLabel: 'Continue' })) return;
        }
        if (alive.current) onAccount();
      })}>Sign in / Create account<Icon name="arrow" /></Button>}
      {username && <Button disabled={busy} onClick={onAccount}>Online account<Icon name="arrow" /></Button>}
      {username && eligible === false && <p className="ll-account-copy">This account has already started. A save file cannot replace its progress. The controls above manage only this browser&apos;s offline save.</p>}
      {username && eligible && <>
        <p className="ll-account-copy">Choose your starting progress before playing. Import is available only once, before your first starter or online transaction.</p>
        <div className="ll-import-options" role="group" aria-label="New account progress">
          <label className="ll-import-option"><input type="radio" name="save-choice" checked={choice === 'fresh'} disabled={busy} onChange={() => setChoice('fresh')} value="fresh" />Start fresh</label>
          <label className="ll-import-option"><input type="radio" name="save-choice" checked={choice === 'import'} disabled={busy} onChange={() => setChoice('import')} value="import" />Import Save File</label>
        </div>
        {choice === 'import' && <input className="ll-file" type="file" accept=".json,application/json" aria-label="Choose online import save file" disabled={busy} onChange={event => {
          const file = event.currentTarget.files?.[0];
          if (!file) return;
          void run(async () => {
            setSave(null); setSummary('');
            const result = await readSaveUpload(file);
            if (!alive.current) return;
            setSave(result); requestId.current = crypto.randomUUID();
            setSummary(`Ready: ${result.account.storyCompleted ?? 0} Story stages cleared · ${Object.keys(result.account.characters).length} Element-Bearers.`);
          });
        }} />}
        <Status message={summary} />
        <Button tone="primary" disabled={busy} onClick={() => void run(async () => {
          if (choice === 'import') {
            if (!save) throw new Error('Choose a Last Light save file first.');
            if (!await gameConfirm('Bring all progress, currencies, characters and equipment from this file into your new online account? This can only be done once.', { title: 'Import save', confirmLabel: 'Import and play' })) return;
            if (!alive.current) return;
            localStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify({ username, save, requestId: requestId.current }));
            await gameOperation({ kind: 'importSave', save }, 0, requestId.current);
            localStorage.removeItem(PENDING_IMPORT_KEY);
            if (alive.current) { setEligible(false); setStatus({ message: 'Your online save was imported.', error: false }); }
          } else {
            if (!await gameConfirm('Start a fresh online game? Once you choose a starter, an offline save cannot replace this account.', { title: 'Start fresh', confirmLabel: 'Start fresh' })) return;
            if (!alive.current) return;
            localStorage.removeItem(PENDING_IMPORT_KEY);
          }
          if (alive.current) await onReady();
        })}>{choice === 'import' ? 'Import and play' : 'Start fresh online'}<Icon name="arrow" /></Button>
      </>}
      <Button tone="quiet" disabled={busy} onClick={() => void run(refresh)}>Refresh online status</Button>
      <Status {...status} />
    </Panel>
  </div>;
}

export function PlayerInfoScreen({ onClose, ...props }: Parameters<typeof PlayerSaveData>[0] & { onClose: () => void }) {
  return <section className="ll-ui ll-player-info" aria-label="Player info">
    <header><div><p className="ll-kicker">LAST LIGHT</p><h1 tabIndex={-1}>Player info</h1></div><Button onClick={onClose}>Close</Button></header>
    <PlayerSaveData {...props} />
  </section>;
}
