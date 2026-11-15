import { radiantAttunements, radiantMasters, type RadiantAttunement, type RadiantMasterId } from '../content/combat-kits';
import type { MasterConduitId } from '../content/master-conduits';

export const radiantAttunementNames: Record<RadiantAttunement, string> = {
  equinox: 'Equinox', corona: 'Corona', aegis: 'Aegis', solstice: 'Solstice', prism: 'Prism',
};
const statNames = { hp: 'Health', attack: 'Attack', defense: 'Defense', recovery: 'Recovery' } as const;

function statList(stats: (keyof typeof statNames)[]): string {
  const names = stats.map(stat => statNames[stat]);
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? '';
}

export function isRadiantMaster(id: MasterConduitId): id is RadiantMasterId {
  return Object.hasOwn(radiantMasters, id);
}
/** Plain-English summary of an attunement's exact stat changes. */
export function radiantAttunementProfile(attunement: RadiantAttunement): string {
  const stats = Object.keys(statNames) as (keyof typeof statNames)[];
  const changed = stats.filter(stat => radiantAttunements[attunement][stat] !== 1)
    .map(stat => {
      const difference = Number((Math.abs(radiantAttunements[attunement][stat] - 1) * 100).toPrecision(12));
      return `${statNames[stat]} is ${difference}% ${radiantAttunements[attunement][stat] > 1 ? 'higher' : 'lower'}`;
    });
  const unchanged = stats.filter(stat => radiantAttunements[attunement][stat] === 1);
  if (!changed.length) return `${statList(unchanged)} ${unchanged.length === 1 ? 'is' : 'are'} unchanged.`;
  const changes = changed.length > 1 ? `${changed.slice(0, -1).join(', ')} and ${changed[changed.length - 1]}` : changed[0] ?? '';
  return `${changes}${unchanged.length ? `; ${statList(unchanged)} ${unchanged.length === 1 ? 'is' : 'are'} unchanged` : ''}.`;
}
/** Attunement name and stat profile a Master applies, or null when Radiant combat cannot equip it. */
export function radiantMasterAttunement(id: MasterConduitId): string | null {
  if (!isRadiantMaster(id)) return null;
  const attunement = radiantMasters[id].attunement;
  return `${radiantAttunementNames[attunement]} attunement. ${radiantAttunementProfile(attunement)}`;
}
export const radiantMasterUnavailable = 'Unavailable in combat: its Element-Bearer is not released.';
/** Complete live Master effect: attunement subtype/stat profile plus its character-specific enhancement. */
export function radiantMasterEffect(id: MasterConduitId): string {
  const attunement = radiantMasterAttunement(id);
  return attunement === null ? radiantMasterUnavailable : `${attunement} ${radiantMasters[id as RadiantMasterId].effect}`;
}
/** Shown for an empty Master slot: Radiant combat uses the neutral Equinox profile. */
export const radiantNoMasterEffect = `No Master: Equinox attunement. ${radiantAttunementProfile('equinox')}`;
