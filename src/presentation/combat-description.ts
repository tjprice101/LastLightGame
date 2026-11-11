import { radiantFlares, radiantMasters, radiantStarterKits, type RadiantLoadout, type RadiantFlareOffer } from '../content/combat-kits';
import type { FlareTier } from '../game/combat-gauge';

const percent = (value: number): string => `${Number((value * 100).toPrecision(12))}%`;
const number = (value: number): string => String(Number(value.toPrecision(12)));

export function radiantFlareNeedsTarget(loadout: RadiantLoadout, tier: FlareTier): boolean {
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  return radiantFlares[loadout.starter][tier].target === 'one-enemy' ||
    master?.rule === 'tide-strike' || master?.rule === 'sprout-strike';
}
export function radiantFlareDescription(offer: RadiantFlareOffer): string[] {
  const lines: string[] = [];
  const enemies = offer.target === 'all-enemies' ? 'All living enemies' : 'Selected living enemy';
  if (offer.damage) lines.push(`${enemies}: direct damage at ${percent(offer.damage)} caster Attack before Defense mitigation.`);
  if (offer.burn) lines.push(`${enemies} surviving impact: Burn at ${percent(offer.burn)} caster Attack per enemy phase for ${offer.burnPhases} phases.`);
  if (offer.weaken) lines.push(`${enemies} surviving impact: ${percent(offer.weaken)} Weaken for ${offer.weakenPhases} enemy phases.`);
  if (offer.exposure) lines.push(`${enemies} surviving impact: ${percent(offer.exposure)} Exposure (increased direct damage taken) for ${offer.exposurePhases} enemy phases.`);
  if (offer.shieldDefense || offer.shieldHP)
    lines.push(`All living allies: Shield from ${percent(offer.shieldDefense)} caster Defense + ${percent(offer.shieldHP)} recipient maximum HP; persists until broken.`);
  if (offer.reduction) lines.push(`All living allies: ${percent(offer.reduction)} direct enemy damage reduction for ${offer.reductionPhases} enemy phases.`);
  if (offer.heal) lines.push(`All living allies: immediate healing at ${percent(offer.heal)} caster Recovery, capped by missing HP; no revival.`);
  if (offer.renewal) lines.push(`All living allies: Renewal at ${percent(offer.renewal)} caster Recovery at each of the next ${offer.renewalRounds} round starts.`);
  if (offer.attackBuff) lines.push(`All living allies: ${percent(offer.attackBuff)} Attack boost for ${offer.attackBuffRounds} rounds.`);
  return lines;
}
export function radiantPassiveEnhancements(loadout: RadiantLoadout): string[] {
  const passive = radiantStarterKits[loadout.starter].passive;
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  const passiveMaster = master?.rule === 'standard' && master.enhancement === 'passive';
  if (passive.rule === 'flare-cleanse' || passive.rule === 'guard-cleanse') {
    return [
      ...(loadout.ascension.skill1 ? ['Passive Imbue heals each ally whose Weaken this passive removes for 50% of caster Recovery.'] : []),
      ...(passiveMaster ? ['The Master separately heals each ally whose Weaken this passive removes for 15% of caster Recovery.'] : []),
    ];
  }
  const power = 1 + (passiveMaster ? master.magnitude : 0) + (loadout.ascension.skill1 ? .5 : 0);
  return power === 1 ? [] : [`Passive effect magnitude ×${number(power)} from the saved Passive Imbue and Master; durations do not change.`];
}
