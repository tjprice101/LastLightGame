import { useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { masterConduits, masterChest, type MasterConduitId } from '../content/master-conduits';
import { starters, getStarter, type StarterId } from '../content/starters';
import type { Account } from '../game/account';
import { Button, Dialog, Status } from './components';
import { assetUrl } from '../presentation/portrait';
import '../styles/ui.css';
import { getElement } from '../content/activities';
import { elementAccents } from '../content/dungeon-art';
import '../presentation/conduit-element.css';

export function MasterChoiceDialog({ account, onChoose, onClose }: {
  account: Account; onChoose: (id: MasterConduitId) => void; onClose: () => void;
}) {
  const [character, setCharacter] = useState<StarterId>(starters[0].id);
  const [selected, setSelected] = useState<MasterConduitId | null>(null);
  const [choosingCharacter, setChoosingCharacter] = useState(false);
  const entry = masterConduits.find(entry => entry.id === selected);
  const element = getStarter(character).elementId;
  const elementStyle: CSSProperties & { '--conduit-element-accent': string } = {
    '--conduit-element-accent': elementAccents[element],
  };
  return <Dialog id="master-choice" title={masterChest.name} onClose={onClose}
    tools={<><div className="ll-field"><label id="master-bearer-label" htmlFor="master-bearer">Any Element-Bearer</label>
      <select id="master-bearer" hidden value={character} onChange={event => {
      const choice = starters.find(starter => starter.id === event.target.value);
      if (!choice) throw new Error('Unknown Master character selection.');
      setCharacter(choice.id); setSelected(null);
    }}>{starters.map(starter => <option key={starter.id} value={starter.id}>{starter.name}{account.characters[starter.id] ? '' : ' · Not yet owned'}</option>)}</select>
      <Button aria-haspopup="dialog" aria-controls="master-bearer-picker" aria-labelledby="master-bearer-label master-bearer-value" onClick={() => setChoosingCharacter(true)}>
        <span id="master-bearer-value">{getStarter(character).name}{account.characters[character] ? '' : ' · Not yet owned'}</span>
      </Button></div>
      {choosingCharacter && <Dialog id="master-bearer-picker" title="Choose an Element-Bearer" subtitle="You may choose a Master for an Element-Bearer you do not yet own." onClose={() => setChoosingCharacter(false)}>
        <div className="master-bearer-options">{starters.map(starter => <Button key={starter.id} aria-pressed={starter.id === character} onClick={() => {
          setCharacter(starter.id); setSelected(null); setChoosingCharacter(false);
        }}><strong>{starter.name}</strong><span>{account.characters[starter.id] ? 'Owned' : 'Not yet owned'}</span></Button>)}</div>
      </Dialog>}</>}
    actions={<><Status message={entry ? `Selected: ${entry.name}` : `Owned ${account.masterChests ?? 0} · Nothing spent until confirmation.`} />
      <div className="ll-account-actions"><Button onClick={onClose}>Cancel</Button>
        <Button tone="primary" disabled={!selected || (account.masterChests ?? 0) < 1} onClick={() => { if (selected) onChoose(selected); }}>Choose Master</Button></div></>}>
    <div className="ll-master-options" role="group" aria-label={`${getStarter(character).name} Masters`}>
      {masterConduits.filter(entry => entry.character === character).map(entry => <article className="ll-master-card" key={entry.id}>
        <Button
        disabled={account.masterConduits?.[entry.id] === 1} aria-pressed={selected === entry.id}
        className="ll-master-option" data-conduit-element={element} style={elementStyle} onClick={() => setSelected(entry.id)}>
        <img className="ll-master-art master-element-art" draggable={false} src={assetUrl(entry.art)} alt="" width={256} height={256} /><strong>{entry.name}</strong>
        <strong className="conduit-element-label" data-conduit-element={element}>{getElement(element).name}</strong>
      </Button><p><small>Omnic Master{account.masterConduits?.[entry.id] === 1 ? ' · Owned' : ''} · {selected === entry.id ? 'Selected' : 'Select'}</small></p>
      <p className="ll-master-effect">{entry.effect}</p></article>)}
    </div>
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
