import { equippedSquad, ownedCharacterInstances, squadEligibilityIssue, type Account } from '../game/account';
import { squadMemberLimit } from '../content/squad-rules';
import { currentEquipment, equipmentMatches, loadoutNameLimit, type SavedEquipment } from '../game/saved-loadouts';
import { getConduit } from '../content/conduits';
import { getMasterConduit } from '../content/master-conduits';
import { ownedCompanion } from './owned-companion';
import { conduitIcon } from './conduit-store';
import { masterConduitIcon } from './master-conduits';
import { escapeDialogText as escape, gameConfirm } from './game-dialog';
import type { GameOperation } from '../online/server-game';
import './saved-loadouts.css';

export type SavedLoadoutOperation = Extract<GameOperation, { kind:
  'saveSquadLoadout' | 'renameSquadLoadout' | 'equipSquadLoadout' | 'deleteSquadLoadout' |
  'saveConduitConfiguration' | 'renameConduitConfiguration' | 'equipConduitConfiguration' }>;

function equipmentPreview(equipment: SavedEquipment, account: Account): string {
  return `<div class="saved-loadout-gear"><ol class="saved-loadout-slots" aria-label="Ordinary Conduit slots">${equipment.conduits.map((id, index) =>
    `<li${id ? '' : ' class="is-empty"'}><span class="saved-loadout-slot-art" aria-hidden="true">${id ? conduitIcon(id, account.conduitUpgrades?.[id]) : '<span class="saved-loadout-empty">—</span>'}<span class="saved-loadout-slot-number">${index + 1}</span></span><span><small>Slot ${index + 1}</small>${id ? escape(getConduit(id).name) : 'Empty'}</span></li>`).join('')}</ol>
    <div class="saved-loadout-master"><span class="saved-loadout-slot-art" aria-hidden="true">${equipment.master ? masterConduitIcon(equipment.master) : '<span class="saved-loadout-empty">—</span>'}</span><span><small>Master</small>${equipment.master ? escape(getMasterConduit(equipment.master).name) : 'None equipped'}</span></div></div>`;
}
function nameInput(name: string, label: string): string {
  return `<label class="saved-loadout-name"><span>${escape(label)}</span><input data-saved-name type="text" maxlength="${loadoutNameLimit}" value="${escape(name)}" required autocomplete="off"></label>`;
}
function button(action: SavedLoadoutOperation['kind'], label: string, disabled = false): string {
  return `<button type="button" data-saved-loadout-action="${action}"${disabled ? ' disabled' : ''}>${label}</button>`;
}
export function squadLoadoutsPanel(account: Account): string {
  const owned = new Set(ownedCharacterInstances(account));
  const current = equippedSquad(account);
  const currentIssue = squadEligibilityIssue(account, current);
  const memberPreview = (id: string, index: number, equipment: SavedEquipment): string => {
    const member = ownedCompanion(account, id);
    return `<article class="saved-loadout-member"><header class="saved-loadout-member-heading"><span class="ref-thumb">${member.compactArt}</span><div><small>${index ? `Member ${index + 1}` : 'Leader'}</small><b>${escape(member.name)}</b><small>${escape(member.element)} · Lv.${member.level}</small></div></header><p class="saved-loadout-equipment-count">Conduits · ${equipment.conduits.filter(Boolean).length} of 8</p>${equipment.conduits.some(Boolean) ? '' : '<p>No ordinary Conduits saved.</p>'}${equipmentPreview(equipment, account)}</article>`;
  };
  const entries = account.squadLoadouts ?? [];
  const matchesCurrent = (members: readonly { character: string; conduits: SavedEquipment['conduits']; master: SavedEquipment['master'] }[]) =>
    !squadEligibilityIssue(account, members.map(member => member.character)) &&
    current.join('|') === members.map(member => member.character).join('|') &&
    members.every(member => equipmentMatches(member, currentEquipment(account, member.character)));
  const selected = entries.find(entry => matchesCurrent(entry.members))?.id ?? '';
  const summary = (ids: readonly string[]) => `<span class="saved-loadout-summary-art" aria-hidden="true">${ids.map(id =>
    `<span class="ref-thumb">${owned.has(id) ? ownedCompanion(account, id).compactArt : '—'}</span>`).join('')}</span>`;
  return `<section class="ref-panel saved-loadouts" data-saved-loadouts aria-labelledby="saved-loadouts-title">
    <header class="ref-panel-heading"><h2 id="saved-loadouts-title">Loadouts</h2><span>${account.squadLoadouts?.length ?? 0} saved</span></header>
    <div class="ref-scroll saved-loadout-scroll">
    <nav class="saved-loadout-sidebar" aria-label="Squad loadouts">
      <button type="button" class="saved-loadout-choice is-current" data-loadout-select="" aria-controls="loadout-current" aria-pressed="${selected === ''}">
        <b>Current setup</b>${summary(current)}<span>${current.length} / ${squadMemberLimit} members</span><strong>+ New loadout</strong>
      </button>
      ${entries.map(entry => `<button type="button" class="saved-loadout-choice" data-loadout-select="${entry.id}" aria-controls="loadout-${entry.id}" aria-pressed="${selected === entry.id}">
        <b>${escape(entry.name)}</b>${matchesCurrent(entry.members) ? '<span class="saved-loadout-match">Equipped</span>' : ''}
        ${summary(entry.members.map(member => member.character))}
        <span>${entry.members.length} members · ${entry.members.reduce((count, member) => count + member.conduits.filter(Boolean).length + Number(!!member.master), 0)} Conduits</span>
      </button>`).join('')}
      ${entries.length ? '' : '<p class="saved-loadout-empty-library">No saved loadouts yet. Save your current setup to get started.</p>'}
    </nav><div class="saved-loadout-detail">
    <section id="loadout-current" class="saved-loadout-card" data-saved-entry data-saved-id="" aria-label="Save a new squad loadout"${selected === '' ? '' : ' hidden'}>
      <header class="saved-loadout-card-heading"><h3>Current squad</h3><span>${current.length} / ${squadMemberLimit} members</span></header>
      <p class="saved-loadout-intro">Save your squad and every member's equipped Conduits together.</p>
      <div class="saved-loadout-editor">${nameInput('', 'New loadout name')}<div class="saved-loadout-actions">${button('saveSquadLoadout', 'Save new loadout', !!currentIssue)}</div></div>
      ${currentIssue ? `<p role="note">Cannot save: ${escape(currentIssue)} Update your current squad first.</p>` : ''}
      <div class="saved-loadout-members">${current.map((id, index) => memberPreview(id, index, currentEquipment(account, id))).join('')}</div>
    </section>
    <div class="saved-loadout-list">${entries.map(entry => {
      const issue = squadEligibilityIssue(account, entry.members.map(member => member.character));
      const available = !issue;
      const equipped = available && current.join('|') === entry.members.map(member => member.character).join('|') &&
        entry.members.every(member => equipmentMatches(member, currentEquipment(account, member.character)));
      return `<article id="loadout-${entry.id}" class="saved-loadout-card" data-saved-entry data-saved-id="${entry.id}"${selected === entry.id ? '' : ' hidden'}>
        <header class="saved-loadout-card-heading"><h3>${escape(entry.name)}</h3>${equipped ? '<span class="saved-loadout-match">Matches current</span>' : `<span>${entry.members.length} / ${squadMemberLimit} members</span>`}</header>
        ${equipped ? '<p class="saved-loadout-equipped" role="note">Currently equipped. Your squad and every member’s Conduits match this loadout.</p>' : ''}
        <div class="saved-loadout-members">${entry.members.map((member, index) => owned.has(member.character)
          ? memberPreview(member.character, index, member)
          : `<article class="saved-loadout-member"><header class="saved-loadout-member-heading"><span class="ref-thumb" aria-hidden="true">—</span><div><b>${escape(member.name)}</b><p>Member no longer owned</p></div></header>${equipmentPreview(member, account)}</article>`).join('')}${Array.from({ length: squadMemberLimit - entry.members.length }, () => '<div class="saved-loadout-member is-vacant">Empty squad slot</div>').join('')}</div>
        <footer class="saved-loadout-footer">${nameInput(entry.name, 'Loadout name')}<div class="saved-loadout-actions">${button('equipSquadLoadout', equipped ? 'Equipped' : 'Equip', !available || equipped)}
          ${button('saveSquadLoadout', 'Update with current setup', !!currentIssue)}${button('renameSquadLoadout', 'Rename')}${button('deleteSquadLoadout', 'Delete')}</div></footer>
        ${issue ? `<p role="note">Cannot equip: ${escape(issue)} ${currentIssue ? 'Update your current squad before overwriting.' : 'Overwrite with your current squad, or delete it.'}</p>` : ''}
      </article>`;
    }).join('')}</div></div></div>
    <p data-saved-loadout-status role="status" aria-live="polite"></p></section>`;
}

export function selectSquadLoadout(root: ParentNode, id: string): void {
  const panel = Array.from(root.querySelectorAll<HTMLElement>('[data-saved-loadouts] [data-saved-id]'))
    .find(entry => entry.dataset.savedId === id);
  if (!panel) throw new Error('The selected squad loadout is unavailable.');
  root.querySelectorAll<HTMLElement>('[data-saved-loadouts] [data-saved-id]').forEach(entry => {
    entry.hidden = entry !== panel;
  });
  root.querySelectorAll<HTMLButtonElement>('[data-loadout-select]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.loadoutSelect === id));
  });
}

export function bindSquadLoadouts(root: ParentNode): void {
  root.querySelectorAll<HTMLButtonElement>('[data-loadout-select]').forEach(button => button.addEventListener('click', () => {
    selectSquadLoadout(root, button.dataset.loadoutSelect ?? '');
  }));
}
export function conduitConfigurationsPanel(account: Account, character: string): string {
  if (!ownedCharacterInstances(account).includes(character)) return '<p>Conduit configurations are available for owned characters.</p>';
  const current = currentEquipment(account, character);
  return `<section class="ref-panel saved-configurations" data-saved-configurations aria-label="Three named Conduit configurations">
    <header class="ref-panel-heading"><h3>Conduit configurations</h3><span>${account.conduitConfigurations?.[character]?.filter(Boolean).length ?? 0} / 3 saved</span></header>
    <p>Save your equipped Conduits and Master, then swap back anytime. Changing equipment never overwrites a saved configuration.</p>
    <div class="saved-configuration-grid">${[0, 1, 2].map(index => {
      const entry = account.conduitConfigurations?.[character]?.[index];
      const matches = !!entry && equipmentMatches(current, entry);
      return `<article class="saved-loadout-card" data-saved-entry data-config-character="${escape(character)}" data-config-index="${index}" data-config-saved="${!!entry}">
        <header class="saved-loadout-card-heading"><h4><span class="saved-configuration-number" aria-hidden="true">0${index + 1}</span>Configuration ${index + 1}</h4><span${matches ? ' class="saved-loadout-match"' : ''}>${matches ? 'Matches current' : entry ? 'Saved' : 'Empty slot'}</span></header>
        ${nameInput(entry?.name ?? `Configuration ${index + 1}`, `Configuration ${index + 1} name`)}
        <div class="saved-loadout-actions">${button('saveConduitConfiguration', entry ? 'Overwrite with current' : 'Save current')}${button('equipConduitConfiguration', 'Equip', !entry)}${button('renameConduitConfiguration', 'Rename', !entry)}</div>
        ${entry ? `<details class="saved-configuration-equipment"><summary>Saved equipment <span>${entry.conduits.filter(Boolean).length} / 8 Conduits${entry.master ? ' + Master' : ''}</span></summary>${equipmentPreview(entry, account)}</details>` : '<div class="saved-configuration-empty"><strong>No equipment saved</strong><p>Save your current equipment here to create a quick-swap configuration.</p></div>'}
      </article>`;
    }).join('')}</div><p data-saved-loadout-status role="status" aria-live="polite"></p></section>`;
}
export async function savedLoadoutOperation(button: HTMLButtonElement): Promise<SavedLoadoutOperation | null> {
  const entry = button.closest<HTMLElement>('[data-saved-entry]');
  if (!entry) throw new Error('Loadout controls are unavailable.');
  const name = entry.querySelector<HTMLInputElement>('[data-saved-name]')?.value ?? '';
  const id = entry.dataset.savedId ?? '';
  const character = entry.dataset.configCharacter ?? '';
  const index = Number(entry.dataset.configIndex);
  switch (button.dataset.savedLoadoutAction) {
    case 'saveSquadLoadout':
      if (id && !await gameConfirm('Replace this saved squad and all its equipment with your current squad?', { title: 'Overwrite loadout', confirmLabel: 'Overwrite' })) return null;
      return { kind: 'saveSquadLoadout', id: id || crypto.randomUUID(), name };
    case 'renameSquadLoadout': return { kind: 'renameSquadLoadout', id, name };
    case 'equipSquadLoadout': return { kind: 'equipSquadLoadout', id };
    case 'deleteSquadLoadout':
      if (!await gameConfirm('Delete this saved loadout? Your equipped squad and equipment will not change.', { title: 'Delete loadout', confirmLabel: 'Delete', danger: true })) return null;
      return { kind: 'deleteSquadLoadout', id };
    case 'saveConduitConfiguration':
      if (entry.dataset.configSaved === 'true' && !await gameConfirm('Replace this configuration with the character’s currently equipped Conduits and Master?', { title: 'Overwrite configuration', confirmLabel: 'Overwrite' })) return null;
      return { kind: 'saveConduitConfiguration', character, index, name };
    case 'renameConduitConfiguration': return { kind: 'renameConduitConfiguration', character, index, name };
    case 'equipConduitConfiguration': return { kind: 'equipConduitConfiguration', character, index };
    default: throw new Error('Invalid loadout action.');
  }
}
