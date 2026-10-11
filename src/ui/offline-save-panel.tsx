import { useEffect, useRef, useState } from 'react';
import { deleteOfflineSave, loadOfflineSave, saveOfflineProgress } from '../game/save-file';
import { exportOfflineSave, readSaveUpload } from '../presentation/offline-save';
import { gameConfirm } from '../presentation/game-dialog';
import { Button, Icon, Panel, Status } from './components';

export type OfflineChange = 'loaded' | 'deleted';

export function OfflineSavePanel({ onChanged }: { onChanged: (change: OfflineChange) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const pending = useRef(false);
  const alive = useRef(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ message: '', error: false });
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
  return <Panel title="Offline save data" description="Saved automatically on this browser. Keep a file backup to restore progress or bring it to a new online account." className="ll-save-panel">
    <div className="ll-save-actions" aria-busy={busy}>
      <Button disabled={busy} onClick={() => void run(() => { saveOfflineProgress(localStorage); setStatus({ message: 'Offline progress saved on this browser.', error: false }); })}><Icon name="save" />Save</Button>
      <Button disabled={busy} onClick={() => void run(() => { exportOfflineSave(); setStatus({ message: 'Backup download requested. Keep the file somewhere safe.', error: false }); })}><Icon name="export" />Export Save File</Button>
      <Button disabled={busy} onClick={() => input.current!.click()}><Icon name="load" />Load Save File</Button>
      <Button tone="danger" disabled={busy} onClick={() => void run(async () => {
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
  </Panel>;
}
