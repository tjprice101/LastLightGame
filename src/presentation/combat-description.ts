import { radiantKits, type RadiantKitId } from '../content/radiant-kits';
import { radiantKitSkill, radiantMasters, type RadiantLoadout } from '../content/combat-kits';
import type { ConvergentLightTier } from '../content/progression';

const number = (value: number): string => String(Number(value.toPrecision(12)));

/** Whether this loadout's kit Flare strikes one selected enemy (the tier does not change the target). */
export function radiantFlareNeedsTarget(loadout: RadiantLoadout, _tier?: ConvergentLightTier): boolean {
  return radiantKitSkill(loadout, 'flare').target === 'one-enemy';
}
export function radiantPassiveEnhancements(loadout: RadiantLoadout): string[] {
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  const passiveMaster = master?.rule === 'standard' && master.enhancement === 'passive';
  // D-473 O3: the skill1 Imbue now boosts Skill 1, not the Passive.
  const power = 1 + (passiveMaster ? master.magnitude : 0);
  return power === 1 ? [] : [`Passive effect magnitude ×${number(power)} from the saved Passive Imbue and Master; durations do not change.`];
}
