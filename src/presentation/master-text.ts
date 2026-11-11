import { radiantAttunements, radiantMasters, type RadiantAttunement, type RadiantMasterId } from '../content/combat-kits';
import type { MasterConduitId } from '../content/master-conduits';

export const radiantAttunementNames: Record<RadiantAttunement, string> = {
  equinox: 'Equinox', corona: 'Corona', aegis: 'Aegis', solstice: 'Solstice', prism: 'Prism',
};
const statNames = { hp: 'Health', attack: 'Attack', defense: 'Defense', recovery: 'Recovery' } as const;

export function isRadiantMaster(id: MasterConduitId): id is RadiantMasterId {
  return Object.hasOwn(radiantMasters, id);
}
/** Exact stat multipliers of an attunement, e.g. "Attack ×1.25, Health ×0.9; other stats ×1". */
export function radiantAttunementProfile(attunement: RadiantAttunement): string {
  const changed = (Object.keys(statNames) as (keyof typeof statNames)[])
    .filter(stat => radiantAttunements[attunement][stat] !== 1)
    .sort((a, b) => radiantAttunements[attunement][b] - radiantAttunements[attunement][a])
    .map(stat => `${statNames[stat]} ×${radiantAttunements[attunement][stat]}`);
  return changed.length ? `${changed.join(', ')}; other stats ×1` : 'all stats ×1';
}
/** Attunement name and stat profile a Master applies, or null when Radiant combat cannot equip it. */
export function radiantMasterAttunement(id: MasterConduitId): string | null {
  if (!isRadiantMaster(id)) return null;
  const attunement = radiantMasters[id].attunement;
  return `${radiantAttunementNames[attunement]} attunement: ${radiantAttunementProfile(attunement)}.`;
}
export const radiantMasterUnavailable = 'Unavailable in combat: its Element-Bearer is not released.';
/** Complete live Master effect: attunement subtype/stat profile plus its character-specific enhancement. */
export function radiantMasterEffect(id: MasterConduitId): string {
  const attunement = radiantMasterAttunement(id);
  return attunement === null ? radiantMasterUnavailable : `${attunement} ${radiantMasters[id as RadiantMasterId].effect}`;
}
/** Shown for an empty Master slot: Radiant combat uses the neutral Equinox profile. */
export const radiantNoMasterEffect = `No Master: ${radiantAttunementNames.equinox} attunement, ${radiantAttunementProfile('equinox')}.`;
