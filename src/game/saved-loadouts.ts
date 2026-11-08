import type { Account } from './account';
import { squadMemberLimit } from '../content/squad-rules';
import { getStarter, isStarterId } from '../content/starters';
import { getCreature } from '../content/creatures';
import { elements, type ElementId } from '../content/activities';
import { conduitSlotCount, isConduitId, validateConduitElement, validateConduitSlots, type ConduitSlots } from '../content/conduits';
import { isMasterConduitId, validateMasterCharacter, type MasterConduitId } from '../content/master-conduits';

export interface SavedEquipment {
  conduits: ConduitSlots;
  master: MasterConduitId | null;
}
export interface ConduitConfiguration extends SavedEquipment { name: string }
export type ConduitConfigurations = [ConduitConfiguration | null, ConduitConfiguration | null, ConduitConfiguration | null];
export interface SquadLoadoutMember extends SavedEquipment { character: string; name: string; element: ElementId }
export interface SquadLoadout { id: string; name: string; members: SquadLoadoutMember[] }
export const loadoutNameLimit = 40;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function loadoutName(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > loadoutNameLimit || /[\u0000-\u001f\u007f]/.test(value))
    throw new Error(`Use a name of 1–${loadoutNameLimit} characters without control characters.`);
  return value.trim();
}
export function validateLoadoutId(id: unknown): asserts id is string {
  if (typeof id !== 'string' || !uuid.test(id)) throw new Error('Invalid squad loadout ID.');
}
export function validateConfigurationIndex(index: unknown): asserts index is number {
  if (!Number.isInteger(index) || typeof index !== 'number' || index < 0 || index > 2)
    throw new Error('Choose Conduit configuration 1, 2 or 3.');
}
export function characterElement(account: Account, character: string): ElementId {
  if (isStarterId(character) && account.characters[character]) return getStarter(character).elementId;
  const copy = account.capturedCharacters?.find(copy => copy.instanceId === character);
  if (copy) return getCreature(copy.creatureId).element;
  throw new Error('A saved squad member is no longer owned. Update the loadout before equipping it.');
}
function validateEquipment(account: Account, character: string, element: ElementId, value: unknown): SavedEquipment {
  if (!record(value)) throw new Error('Invalid saved Conduit configuration.');
  const conduits = validateConduitSlots(value.conduits);
  validateConduitElement(conduits, element);
  for (const id of conduits)
    if (id !== null && (!isConduitId(id) || !(account.conduits?.[id] ?? 0))) throw new Error('A loadout requires owned Conduits.');
  const master = value.master;
  if (master !== null) {
    if (!isStarterId(character) || !isMasterConduitId(master) || account.masterConduits?.[master] !== 1)
      throw new Error('A loadout requires an owned, matching Master Conduit.');
    validateMasterCharacter(master, character);
  }
  return { conduits: [...conduits], master };
}
export function currentEquipment(account: Account, character: string): SavedEquipment {
  characterElement(account, character);
  return {
    conduits: [...(account.conduitEquipment?.[character] ?? Array<null>(conduitSlotCount).fill(null))],
    master: isStarterId(character) ? account.masterEquipment?.[character] ?? null : null,
  };
}
export function equipmentMatches(a: SavedEquipment, b: SavedEquipment): boolean {
  return a.master === b.master && a.conduits.every((id, index) => id === b.conduits[index]);
}
export function validateSquadLoadouts(account: Account, value: unknown): SquadLoadout[] {
  if (!Array.isArray(value)) throw new Error('Invalid saved squad loadouts.');
  const ids = new Set<string>();
  return value.map(entry => {
    if (!record(entry)) throw new Error('Invalid saved squad loadout.');
    validateLoadoutId(entry.id);
    if (ids.has(entry.id)) throw new Error('Duplicate squad loadout ID.');
    ids.add(entry.id);
    if (!Array.isArray(entry.members) || !entry.members.length || entry.members.length > squadMemberLimit)
      throw new Error('A squad loadout needs one to six members.');
    const members = new Set<string>();
    return { id: entry.id, name: loadoutName(entry.name), members: entry.members.map(member => {
      if (!record(member) || typeof member.character !== 'string' ||
          (!isStarterId(member.character) && !(member.character.startsWith('capture:') && uuid.test(member.character.slice(8)))) ||
          typeof member.element !== 'string' || !elements.some(element => element.id === member.element) ||
          members.has(member.character)) throw new Error('Invalid saved squad loadout member.');
      const element = elements.find(element => element.id === member.element)?.id;
      if (!element || typeof member.name !== 'string' || !member.name.trim() || member.name.length > 200)
        throw new Error('Invalid saved squad member identity.');
      if (isStarterId(member.character) && (!account.characters[member.character] || getStarter(member.character).elementId !== element))
        throw new Error('A squad loadout requires an owned Element-Bearer of the saved element.');
      const copy = account.capturedCharacters?.find(copy => copy.instanceId === member.character);
      if (copy && getCreature(copy.creatureId).element !== element) throw new Error('Saved loadout element does not match its member.');
      members.add(member.character);
      return { character: member.character, name: member.name, element,
        ...validateEquipment(account, member.character, element, member) };
    }) };
  });
}
export function validateConduitConfigurations(account: Account, value: unknown): Record<string, ConduitConfigurations> {
  if (!record(value)) throw new Error('Invalid saved character Conduit configurations.');
  const result: Record<string, ConduitConfigurations> = {};
  for (const [character, entries] of Object.entries(value)) {
    const element = characterElement(account, character);
    if (!Array.isArray(entries) || entries.length !== 3) throw new Error('Each character has exactly three Conduit configurations.');
    const validate = (entry: unknown): ConduitConfiguration | null => {
      if (entry === null) return null;
      if (!record(entry)) throw new Error('Invalid saved character Conduit configuration.');
      return { name: loadoutName(entry.name), ...validateEquipment(account, character, element, entry) };
    };
    result[character] = [validate(entries[0]), validate(entries[1]), validate(entries[2])];
  }
  return result;
}
export function applySavedEquipment(account: Account, character: string, equipment: SavedEquipment): void {
  const validated = validateEquipment(account, character, characterElement(account, character), equipment);
  account.conduitEquipment = { ...account.conduitEquipment, [character]: [...validated.conduits] };
  if (isStarterId(character)) account.masterEquipment = { ...account.masterEquipment, [character]: validated.master };
}
