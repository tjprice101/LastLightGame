import { equippedSquad, ownedCharacterInstances, type Account } from '../game/account';
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
  const memberPreview = (id: string, index: number, equipment: SavedEquipment): string => {
    const member = ownedCompanion(account, id);
    return `<article class="saved-loadout-member"><header class="saved-loadout-member-heading"><span class="ref-thumb">${member.compactArt}</span><div><small>${index ? `Member ${index + 1}` : 'Leader'}</small><b>${escape(member.name)}</b><small>${escape(member.element)} · Lv.${member.level}</small></div></header>${equipmentPreview(equipment, account)}</article>`;
  };
  return `<section class="ref-panel saved-loadouts" data-saved-loadouts aria-labelledby="saved-loadouts-title">
    <header class="ref-panel-heading"><h2 id="saved-loadouts-title">Loadouts</h2><span>${account.squadLoadouts?.length ?? 0} saved</span></header>
    <p class="saved-loadout-intro">Your squad and its equipped Conduits, ready to swap together. Other characters and saved configurations stay unchanged.</p>
    <div class="ref-scroll saved-loadout-scroll">
    <section class="saved-loadout-card" data-saved-entry data-saved-id="" aria-label="Save a new squad loadout">
      <header class="saved-loadout-card-heading"><h3>Current squad</h3><span>${equippedSquad(account).length} / ${squadMemberLimit} members</span></header>
      <div class="saved-loadout-editor">${nameInput('', 'New loadout name')}<div class="saved-loadout-actions">${button('saveSquadLoadout', 'Save new loadout')}</div></div>
      <div class="saved-loadout-members">${equippedSquad(account).map((id, index) => memberPreview(id, index, currentEquipment(account, id))).join('')}</div>
    </section>
    <h3 class="saved-loadout-library-title">Saved loadouts</h3><div class="saved-loadout-list">${(account.squadLoadouts ?? []).map(entry => {
      const available = entry.members.every(member => owned.has(member.character));
      const equipped = available && equippedSquad(account).join('|') === entry.members.map(member => member.character).join('|') &&
        entry.members.every(member => equipmentMatches(member, currentEquipment(account, member.character)));
      return `<article class="saved-loadout-card" data-saved-entry data-saved-id="${entry.id}">
        <header class="saved-loadout-card-heading"><h3>${escape(entry.name)}</h3>${equipped ? '<span class="saved-loadout-match">Matches current</span>' : `<span>${entry.members.length} / ${squadMemberLimit} members</span>`}</header>
        ${nameInput(entry.name, 'Loadout name')}<div class="saved-loadout-actions">${button('equipSquadLoadout', 'Equip', !available)}
          ${button('saveSquadLoadout', 'Overwrite with current squad')}${button('renameSquadLoadout', 'Rename')}${button('deleteSquadLoadout', 'Delete')}</div>
        <div class="saved-loadout-members">${entry.members.map((member, index) => owned.has(member.character)
          ? memberPreview(member.character, index, member)
          : `<article class="saved-loadout-member"><header class="saved-loadout-member-heading"><span class="ref-thumb" aria-hidden="true">—</span><div><b>${escape(member.name)}</b><p>Member no longer owned</p></div></header>${equipmentPreview(member, account)}</article>`).join('')}</div>
        ${!available ? '<p role="note">Cannot equip: a captured member was sold or consumed. Overwrite this loadout with your current squad, or delete it.</p>' : ''}
      </article>`;
    }).join('') || '<p class="saved-loadout-empty-library">No saved loadouts yet. Name your current squad above to get started.</p>'}</div></div>
    <p data-saved-loadout-status role="status" aria-live="polite"></p></section>`;
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
