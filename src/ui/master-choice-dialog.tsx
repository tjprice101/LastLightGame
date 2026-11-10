import { useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { masterConduits as allMasters, masterChest, type MasterConduitId } from '../content/master-conduits';
import { characterReleased } from '../content/release-visibility';
const masterConduits = allMasters.filter(master => characterReleased(master.character));
import { starters, getStarter, type StarterId } from '../content/starters';
import type { Account } from '../game/account';
import { Button, Dialog, Status } from './components';
import { masterArtUrl } from '../presentation/master-conduits';
import { referencedEffect } from '../presentation/effect-copy';
import { radiantMasterEffect } from '../presentation/radiant-master-text';
import '../styles/ui.css';
import { getElement } from '../content/activities';
import { elementAccents } from '../content/dungeon-art';
import '../presentation/conduit-element.css';
import './master-choice-dialog.css';
import { rarityFeedback } from '../presentation/rarity-feedback';
const masterCharacters = starters.filter(starter => masterConduits.some(entry => entry.character === starter.id));

export function MasterChoiceDialog({ account, onChoose, onClose }: {
  account: Account; onChoose: (ids: MasterConduitId[]) => void; onClose: () => void;
}) {
  const [character, setCharacter] = useState<StarterId>(masterCharacters[0].id);
  const [selected, setSelected] = useState<MasterConduitId[]>([]);
  const availableChests = account.masterChests ?? 0;
  const unownedCount = masterConduits.filter(entry => !account.masterConduits?.[entry.id]).length;
  const maximum = Math.min(availableChests, unownedCount);
  const entries = masterConduits.filter(entry => selected.includes(entry.id));
  const emptyStatus = availableChests < 1 ? 'No Machine’s Master Chest is available.'
    : unownedCount < 1 ? 'All Masters are already owned; no chest will be spent.'
      : 'Select at least one unowned Master. No chest is spent until you confirm.';
  const element = getStarter(character).elementId;
  const elementStyle: CSSProperties & { '--conduit-element-accent': string } = {
    '--conduit-element-accent': elementAccents[element],
  };
  return <Dialog id="master-choice" title={masterChest.name}
    subtitle={`Owned ${availableChests} · Select up to ${maximum} unowned Masters across any Element-Bearer.`} onClose={onClose}>
    <div className="ll-master-layout">
    <label className="ll-field">Element-Bearer<select value={character} onChange={event => {
      const choice = starters.find(starter => starter.id === event.target.value);
      if (!choice) throw new Error('Unknown Master character selection.');
      setCharacter(choice.id);
    }}>{masterCharacters.map(starter => <option key={starter.id} value={starter.id}>{starter.name}{account.characters[starter.id] ? '' : ' · Not yet owned'}</option>)}</select></label>
    <div className="ll-master-options" role="group" aria-label={`${getStarter(character).name} Masters`}>
      {masterConduits.filter(entry => entry.character === character).map(entry => <Button key={entry.id}
        disabled={account.masterConduits?.[entry.id] === 1 || (!selected.includes(entry.id) && selected.length >= maximum)}
        aria-pressed={selected.includes(entry.id)}
        className="ll-master-option" data-rarity="Omnic" data-conduit-element={element} style={elementStyle} onClick={event => {
          const wasSelected = selected.includes(entry.id);
          if (!wasSelected) rarityFeedback(event.currentTarget, 'Omnic');
          setSelected(current => current.includes(entry.id)
            ? current.filter(id => id !== entry.id)
            : current.length < maximum ? [...current, entry.id] : current);
        }}>
        <img className="ll-master-art master-element-art" draggable={false} src={masterArtUrl(entry.id)} alt="" width={256} height={256} /><strong>{entry.name}</strong>
        <strong className="conduit-element-label" data-conduit-element={element}>{getElement(element).name}</strong>
        <small>Omnic Master{account.masterConduits?.[entry.id] === 1 ? ' · Owned' : selected.includes(entry.id) ? ' · Selected' : ''}</small><span>{referencedEffect(radiantMasterEffect(entry.id), false)}</span>
      </Button>)}
    </div>
    <section className="ll-master-selected" aria-label="Selected Masters">
      <strong>Selected {selected.length} of {maximum}</strong>
      {entries.length ? <ul>{entries.map(entry => <li key={entry.id}>
        <span>{getStarter(entry.character).name} · {entry.name}</span>
        <Button aria-label={`Remove ${entry.name} from selection`} onClick={() => setSelected(current => current.filter(id => id !== entry.id))}>Remove</Button>
      </li>)}</ul> : <p>No Masters selected. You can change characters without losing your selection.</p>}
    </section>
    <footer className="ll-master-footer">
    <Status message={selected.length ? `${selected.length} chest${selected.length === 1 ? '' : 's'} will be spent only after one confirmation.` : emptyStatus} />
    <div className="ll-account-actions"><Button onClick={onClose}>Cancel</Button>
      <Button tone="primary" disabled={!selected.length} onClick={() => { if (selected.length) onChoose(selected); }}>
        {selected.length ? `Choose ${selected.length} Master${selected.length === 1 ? '' : 's'}` : 'Choose Masters'}
      </Button></div>
    </footer></div>
  </Dialog>;
}

let choosing = false;
export async function chooseMasterConduits(account: Account): Promise<MasterConduitId[] | null> {
  if (choosing) throw new Error('A Master choice is already open.');
  choosing = true;
  const focus = document.activeElement;
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    return await new Promise<MasterConduitId[] | null>(resolve => {
      flushSync(() => root.render(<MasterChoiceDialog account={account} onChoose={resolve} onClose={() => resolve(null)} />));
    });
  } finally {
    root.unmount(); host.remove(); choosing = false;
    if (focus instanceof HTMLElement && focus.isConnected) focus.focus({ preventScroll: true });
  }
}
export async function chooseMasterConduit(account: Account): Promise<MasterConduitId | null> {
  const selection = await chooseMasterConduits(account);
  return selection?.length === 1 ? selection[0] : null;
}
