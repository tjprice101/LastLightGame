import { radiantFlares, radiantMasters, type RadiantLoadout, type RadiantFlareOffer } from '../content/combat-kits';
import type { ConvergentLightTier } from '../content/progression';

const percent = (value: number): string => `${Number((value * 100).toPrecision(12))}%`;
const number = (value: number): string => String(Number(value.toPrecision(12)));

export function radiantFlareNeedsTarget(loadout: RadiantLoadout, tier: ConvergentLightTier): boolean {
  return radiantFlares[loadout.starter][tier].target === 'one-enemy';
}
export function radiantFlareDescription(offer: RadiantFlareOffer, element = ''): string[] {
  const lines: string[] = [];
  const enemies = offer.target === 'all-enemies' ? 'All living enemies' : 'Selected living enemy';
  const tier = offer.comboHits === 4 ? 'Sparkling Convergent Light' :
    offer.comboHits === 8 ? 'Glimmering Convergent Light' : 'Ultimate Convergence of Light';
  if (offer.damage) lines.push(`${tier}: ${offer.comboHits}-hit ${element ? `${element}-type ` : ''}damage to ${offer.target === 'all-enemies' ? 'all enemies' : 'one enemy'} (${percent(offer.damage)} Attack total).`);
  if (offer.burn) lines.push(`${enemies} surviving impact: Burn for ${offer.burnPhases} enemy phases (${percent(offer.burn)} caster Attack each phase).`);
  if (offer.weaken) lines.push(`${enemies} surviving impact: Weaken by ${percent(offer.weaken)} for ${offer.weakenPhases} enemy phases.`);
  if (offer.exposure) lines.push(`${enemies} surviving impact: Exposure, increasing direct damage taken by ${percent(offer.exposure)} for ${offer.exposurePhases} enemy phases.`);
  if (offer.shieldDefense || offer.shieldHP)
    lines.push(`All living allies gain a Shield equal to ${percent(offer.shieldDefense)} caster Defense + ${percent(offer.shieldHP)} recipient maximum Health, until broken.`);
  if (offer.reduction) lines.push(`All living allies take ${percent(offer.reduction)} less direct enemy damage for ${offer.reductionPhases} enemy phases.`);
  if (offer.heal) lines.push(`Restore ${percent(offer.heal)} caster Recovery as Health to all living allies; no revival.`);
  if (offer.renewal) lines.push(`All living allies restore ${percent(offer.renewal)} caster Recovery as Health at each of the next ${offer.renewalRounds} round starts.`);
  if (offer.attackBuff) lines.push(`All living allies gain ${percent(offer.attackBuff)} Attack for ${offer.attackBuffRounds} rounds.`);
  return lines;
}
export function radiantPassiveEnhancements(loadout: RadiantLoadout): string[] {
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  const passiveMaster = master?.rule === 'standard' && master.enhancement === 'passive';
  const power = 1 + (passiveMaster ? master.magnitude : 0) + (loadout.ascension.skill1 ? .5 : 0);
  return power === 1 ? [] : [`Passive effect magnitude ×${number(power)} from the saved Passive Imbue and Master; durations do not change.`];
}
