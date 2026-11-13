import { radiantFlares, radiantMasters, type RadiantLoadout, type RadiantFlareOffer } from '../content/combat-kits';
import type { FlareTier } from '../game/combat-gauge';

const percent = (value: number): string => `${Number((value * 100).toPrecision(12))}%`;
const number = (value: number): string => String(Number(value.toPrecision(12)));

export function radiantFlareNeedsTarget(loadout: RadiantLoadout, tier: FlareTier): boolean {
  return radiantFlares[loadout.starter][tier].target === 'one-enemy';
}
export function radiantFlareDescription(offer: RadiantFlareOffer, element = ''): string[] {
  const lines: string[] = [];
  const enemies = offer.target === 'all-enemies' ? 'All living enemies' : 'Selected living enemy';
  const grade = offer.comboHits === 4 ? 'Sparkle' : offer.comboHits === 8 ? 'Shimmer' : 'Lustrous';
  if (offer.damage) lines.push(`${grade} ${offer.comboHits} Combo${element ? ` ${element}` : ''} damage to ${offer.target === 'all-enemies' ? 'all enemies' : 'one enemy'}: ${percent(offer.damage)} Attack total.`);
  if (offer.burn) lines.push(`${enemies} surviving impact: Burn at ${percent(offer.burn)} caster Attack per enemy phase for ${offer.burnPhases} phases.`);
  if (offer.weaken) lines.push(`${enemies} surviving impact: ${percent(offer.weaken)} Weaken for ${offer.weakenPhases} enemy phases.`);
  if (offer.exposure) lines.push(`${enemies} surviving impact: ${percent(offer.exposure)} Exposure (increased direct damage taken) for ${offer.exposurePhases} enemy phases.`);
  if (offer.shieldDefense || offer.shieldHP)
    lines.push(`All allies gain a Shield equal to ${percent(offer.shieldDefense)} caster Defense + ${percent(offer.shieldHP)} recipient maximum Health, until broken.`);
  if (offer.reduction) lines.push(`All living allies: ${percent(offer.reduction)} direct enemy damage reduction for ${offer.reductionPhases} enemy phases.`);
  if (offer.heal) lines.push(`Restore all living allies' Health by ${percent(offer.heal)} caster Recovery; no revival.`);
  if (offer.renewal) lines.push(`All living allies: Renewal at ${percent(offer.renewal)} caster Recovery at each of the next ${offer.renewalRounds} round starts.`);
  if (offer.attackBuff) lines.push(`All living allies: ${percent(offer.attackBuff)} Attack boost for ${offer.attackBuffRounds} rounds.`);
  return lines;
}
export function radiantPassiveEnhancements(loadout: RadiantLoadout): string[] {
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  const passiveMaster = master?.rule === 'standard' && master.enhancement === 'passive';
  const power = 1 + (passiveMaster ? master.magnitude : 0) + (loadout.ascension.skill1 ? .5 : 0);
  return power === 1 ? [] : [`Passive effect magnitude ×${number(power)} from the saved Passive Imbue and Master; durations do not change.`];
}
