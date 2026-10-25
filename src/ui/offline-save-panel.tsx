import { useEffect, useRef, useState } from 'react';
import { deleteOfflineSave, loadOfflineSave, saveOfflineProgress } from '../game/save-file';
import { SAVE_KEY } from '../game/profile';
import { exportOfflineSave, offlineSaveCode, readSaveCode, readSaveUpload } from '../presentation/offline-save';
import { gameConfirm } from '../presentation/game-dialog';
import { Button, Dialog, Icon, Panel, Status } from './components';

export type OfflineChange = 'loaded' | 'deleted';

export function OfflineSavePanel({ onChanged, compact = false, onSaveOnline }: {
  onChanged: (change: OfflineChange) => void; compact?: boolean; onSaveOnline?: () => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const pending = useRef(false);
  const alive = useRef(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ message: '', error: false });
  const [codeOpen, setCodeOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [code, setCode] = useState('');
  const hasBrowserSave = !compact || localStorage.getItem(SAVE_KEY) !== null;
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  const run = async (operation: () => Promise<void> | void) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      await operation();
    } catch (error) {
      console.error('Offline save operation failed', error);
      if (alive.current) setStatus({ message: error instanceof Error ? error.message : 'Offline save operation failed. Please try again.', error: true });
    } finally { pending.current = false; if (alive.current) setBusy(false); }
  };
  const load = async (save: ReturnType<typeof readSaveCode>): Promise<void> => {
    if (!alive.current) return;
    if (!await gameConfirm('Replace the offline save on this browser? An active offline battle will end. Your online account is not changed. Export a backup first if you want to keep this browser save.', { title: 'Load offline save', confirmLabel: 'Load save', danger: true })) return;
    if (!alive.current) return;
    loadOfflineSave(localStorage, save);
    onChanged('loaded');
  };
  return <Panel title={compact ? 'Save data' : 'Offline save data'} description={compact ? hasBrowserSave ? 'Offline browser backup · Keep it private.' : 'No offline save on this browser yet.' : 'Saved automatically on this browser. Keep a file backup to restore progress or bring it to a new online account.'} className={`ll-save-panel${compact ? ' ll-save-panel--compact' : ''}`}>
    {compact && <div className="ll-save-file-tools"><Button disabled={busy} onClick={() => setFilesOpen(true)}>File tools</Button></div>}
    <div className="ll-save-actions" aria-busy={busy}>
      <Button disabled={busy || !hasBrowserSave && !onSaveOnline} onClick={() => void run(async () => {
        if (onSaveOnline) { await onSaveOnline(); if (alive.current) setStatus({ message: 'Online progress saved.', error: false }); }
        else { saveOfflineProgress(localStorage); setStatus({ message: 'Offline progress saved on this browser.', error: false }); }
      })}><Icon name="save" />{onSaveOnline ? 'Save now' : compact ? 'Save offline' : 'Save'}</Button>
      {compact && <Button disabled={busy || !hasBrowserSave} onClick={() => void run(async () => {
        await navigator.clipboard.writeText(offlineSaveCode());
        setStatus({ message: 'Offline save code copied. Keep it private; it contains your complete browser progress.', error: false });
      })}>Copy save code</Button>}
      {compact && <Button disabled={busy} onClick={() => { setCode(''); setCodeOpen(true); }}>Load save code</Button>}
      {!compact && <Button disabled={busy} onClick={() => void run(() => { exportOfflineSave(); setStatus({ message: 'Backup download requested. Keep the file somewhere safe.', error: false }); })}><Icon name="export" />Export Save File</Button>}
      {!compact && <Button disabled={busy} onClick={() => input.current!.click()}><Icon name="load" />Load Save File</Button>}
      <Button tone="danger" disabled={busy || !hasBrowserSave} onClick={() => void run(async () => {
        if (!await gameConfirm('Delete only the offline save on this browser? Export a backup first if you want to keep it. Online account data is not deleted.', { title: 'Delete Save Data', confirmLabel: 'Delete offline save', danger: true })) return;
        if (!alive.current) return;
        deleteOfflineSave(localStorage);
        onChanged('deleted');
      })}><Icon name="delete" />Delete Save Data</Button>
    </div>
    <input ref={input} type="file" accept=".json,application/json" hidden aria-label="Load offline save file" onChange={event => {
      const picker = event.currentTarget;
      const file = picker.files?.[0];
      if (!file) return;
      void run(async () => {
        const save = await readSaveUpload(file);
        if (!alive.current) return;
        if (!await gameConfirm('Replace the offline save on this browser with this file? An active offline battle will end. Export your current progress first if you want to keep it.', { title: 'Load Save File', confirmLabel: 'Load save', danger: true })) return;
        if (!alive.current) return;
        loadOfflineSave(localStorage, save);
        onChanged('loaded');
      }).finally(() => { picker.value = ''; });
    }} />
    <Status {...status} />
    {filesOpen && <Dialog id="offline-file-tools" title="Offline save files" onClose={() => setFilesOpen(false)}
      actions={<div className="ll-save-actions"><Button disabled={!hasBrowserSave} onClick={() => { setFilesOpen(false); void run(() => {
        exportOfflineSave(); setStatus({ message: 'Backup download requested. Keep the file somewhere safe.', error: false });
      }); }}>Export Save File</Button><Button onClick={() => { setFilesOpen(false); input.current!.click(); }}>Load Save File</Button></div>}>
      <p>File backups affect only this browser&apos;s offline progress. They never replace an existing online account.</p>
    </Dialog>}
    {codeOpen && <Dialog id="offline-save-code" title="Load offline save code" onClose={() => { if (!busy) setCodeOpen(false); }} busy={busy}
      actions={<Button disabled={busy} onClick={() => void run(async () => {
        const save = readSaveCode(code);
        setCodeOpen(false);
        await load(save);
      })}>Review and load</Button>}>
      <p>This replaces only this browser&apos;s offline save, never your online account. Save codes are editable backups, not rewards.</p>
      <label className="ll-field">Save code<textarea aria-label="Offline save code" value={code} onChange={event => setCode(event.currentTarget.value)} rows={5} disabled={busy} /></label>
      <Status {...status} />
    </Dialog>}
  </Panel>;
}
