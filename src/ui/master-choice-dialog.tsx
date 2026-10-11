import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { masterConduits, masterChest, type MasterConduitId } from '../content/master-conduits';
import { starters, getStarter, type StarterId } from '../content/starters';
import type { Account } from '../game/account';
import { Button, Dialog, Status } from './components';
import { assetUrl } from '../presentation/portrait';
import '../styles/ui.css';

export function MasterChoiceDialog({ account, onChoose, onClose }: {
  account: Account; onChoose: (id: MasterConduitId) => void; onClose: () => void;
}) {
  const [character, setCharacter] = useState<StarterId>(starters[0].id);
  const [selected, setSelected] = useState<MasterConduitId | null>(null);
  const entry = masterConduits.find(entry => entry.id === selected);
  return <Dialog id="master-choice" title={masterChest.name} subtitle={`Owned ${account.masterChests ?? 0} · Choose one unowned Master. You may choose for a future Element-Bearer.`} onClose={onClose}>
    <label className="ll-field">Element-Bearer<select value={character} onChange={event => {
      const choice = starters.find(starter => starter.id === event.target.value);
      if (!choice) throw new Error('Unknown Master character selection.');
      setCharacter(choice.id); setSelected(null);
    }}>{starters.map(starter => <option key={starter.id} value={starter.id}>{starter.name}{account.characters[starter.id] ? '' : ' · Not yet owned'}</option>)}</select></label>
    <div className="ll-master-options" role="group" aria-label={`${getStarter(character).name} Masters`}>
      {masterConduits.filter(entry => entry.character === character).map(entry => <Button key={entry.id}
        disabled={account.masterConduits?.[entry.id] === 1} aria-pressed={selected === entry.id}
        className="ll-master-option" onClick={() => setSelected(entry.id)}>
        <img className="ll-master-art" draggable={false} src={assetUrl(entry.art)} alt="" width={256} height={256} /><strong>{entry.name}</strong>
        <small>Omnic Master{account.masterConduits?.[entry.id] === 1 ? ' · Owned' : ''}</small><span>{entry.effect}</span>
      </Button>)}
    </div>
    <Status message={entry ? `Chosen: ${entry.name}. One chest will be consumed after confirmation.` : 'Choose a Master to review it. No chest is spent until you confirm.'} />
    <div className="ll-account-actions"><Button onClick={onClose}>Cancel</Button>
      <Button tone="primary" disabled={!selected || (account.masterChests ?? 0) < 1} onClick={() => { if (selected) onChoose(selected); }}>Choose Master</Button></div>
  </Dialog>;
}

let choosing = false;
export async function chooseMasterConduit(account: Account): Promise<MasterConduitId | null> {
  if (choosing) throw new Error('A Master choice is already open.');
  choosing = true;
  const focus = document.activeElement;
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    return await new Promise<MasterConduitId | null>(resolve => {
      flushSync(() => root.render(<MasterChoiceDialog account={account} onChoose={resolve} onClose={() => resolve(null)} />));
    });
  } finally {
    root.unmount(); host.remove(); choosing = false;
    if (focus instanceof HTMLElement && focus.isConnected) focus.focus({ preventScroll: true });
  }
}
