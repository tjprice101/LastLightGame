import { equippedSquad, ownedCharacterInstances, type Account } from '../game/account';
import { currentEquipment, equipmentMatches, loadoutNameLimit, type SavedEquipment } from '../game/saved-loadouts';
import { getConduit } from '../content/conduits';
import { getMasterConduit } from '../content/master-conduits';
import { ownedCompanion } from './owned-companion';
import { escapeDialogText as escape, gameConfirm } from './game-dialog';
import type { GameOperation } from '../online/server-game';
import './saved-loadouts.css';

export type SavedLoadoutOperation = Extract<GameOperation, { kind:
  'saveSquadLoadout' | 'renameSquadLoadout' | 'equipSquadLoadout' | 'deleteSquadLoadout' |
  'saveConduitConfiguration' | 'renameConduitConfiguration' | 'equipConduitConfiguration' }>;

function equipmentText(equipment: SavedEquipment): string {
  const names = equipment.conduits.map((id, index) => id ? `${index + 1}. ${getConduit(id).name}` : '').filter(Boolean);
  return `<p class="saved-loadout-gear">${escape(names.join(' · ') || 'No ordinary Conduits')}<br>Master: ${equipment.master ? escape(getMasterConduit(equipment.master).name) : 'None'}</p>`;
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
    return `<article class="saved-loadout-member"><span class="ref-thumb">${member.art}</span><div><b>${escape(member.name)}</b><small>${index ? 'Member' : 'Leader'}</small>${equipmentText(equipment)}</div></article>`;
  };
  return `<section class="ref-panel saved-loadouts" data-saved-loadouts aria-labelledby="saved-loadouts-title">
    <header class="ref-panel-heading"><h2 id="saved-loadouts-title">Loadouts</h2><span>${account.squadLoadouts?.length ?? 0} saved</span></header>
    <p>Save your current squad of 1–3 members, their eight ordinary Conduit slots and their Masters. Equipping leaves other characters and named configurations untouched.</p>
    <section class="saved-loadout-card" data-saved-entry data-saved-id="" aria-label="Save a new squad loadout">
      <h3>Current squad</h3><div class="saved-loadout-members">${equippedSquad(account).map((id, index) => memberPreview(id, index, currentEquipment(account, id))).join('')}</div>
      ${nameInput('', 'New loadout name')}<div class="saved-loadout-actions">${button('saveSquadLoadout', 'Save new loadout')}</div>
    </section>
    <div class="saved-loadout-list">${(account.squadLoadouts ?? []).map(entry => {
      const available = entry.members.every(member => owned.has(member.character));
      const equipped = available && equippedSquad(account).join('|') === entry.members.map(member => member.character).join('|') &&
        entry.members.every(member => equipmentMatches(member, currentEquipment(account, member.character)));
      return `<article class="saved-loadout-card" data-saved-entry data-saved-id="${entry.id}">
        <h3>${escape(entry.name)}${equipped ? ' · Matches current' : ''}</h3>
        <div class="saved-loadout-members">${entry.members.map((member, index) => owned.has(member.character)
          ? memberPreview(member.character, index, member)
          : `<article class="saved-loadout-member"><span class="ref-thumb" aria-hidden="true">—</span><div><b>${escape(member.name)}</b><p>Member no longer owned</p>${equipmentText(member)}</div></article>`).join('')}</div>
        ${!available ? '<p role="note">Cannot equip: a captured member was sold or consumed. Overwrite this loadout with your current squad, or delete it.</p>' : ''}
        ${nameInput(entry.name, 'Loadout name')}<div class="saved-loadout-actions">${button('equipSquadLoadout', 'Equip', !available)}
          ${button('saveSquadLoadout', 'Overwrite with current squad')}${button('renameSquadLoadout', 'Rename')}${button('deleteSquadLoadout', 'Delete')}</div>
      </article>`;
    }).join('') || '<p>No saved loadouts yet. Name your current squad above to get started.</p>'}</div>
    <p data-saved-loadout-status role="status" aria-live="polite"></p></section>`;
}
export function conduitConfigurationsPanel(account: Account, character: string): string {
  if (!ownedCharacterInstances(account).includes(character)) return '<p>Conduit configurations are available for owned characters.</p>';
  const current = currentEquipment(account, character);
  return `<section class="ref-panel saved-configurations" data-saved-configurations aria-label="Three named Conduit configurations">
    <header class="ref-panel-heading"><h3>Conduit configurations</h3></header>
    <p>Three saved configurations for this character. Save current equipment to a slot, then Equip to restore it. Manual equipment changes do not overwrite saved configurations.</p>
    <div class="saved-configuration-grid">${[0, 1, 2].map(index => {
      const entry = account.conduitConfigurations?.[character]?.[index];
      return `<article class="saved-loadout-card" data-saved-entry data-config-character="${escape(character)}" data-config-index="${index}" data-config-saved="${!!entry}">
        <h4>Configuration ${index + 1}${entry && equipmentMatches(current, entry) ? ' · Matches current' : ''}</h4>
        ${nameInput(entry?.name ?? `Configuration ${index + 1}`, `Configuration ${index + 1} name`)}
        ${entry ? equipmentText(entry) : '<p>Not saved yet</p>'}
        <div class="saved-loadout-actions">${button('saveConduitConfiguration', 'Save current')}${button('equipConduitConfiguration', 'Equip', !entry)}${button('renameConduitConfiguration', 'Rename', !entry)}</div>
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
