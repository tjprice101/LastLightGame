import { characterReleased } from './release-visibility';
import { masterConduits, type MasterConduitId } from './master-conduits';
import { starters, type StarterId } from './starters';
import { characterLevelCap, convergentLightRankCap, convergentLightTier, weaponRules,
  type CharacterAscension, type ConvergentLightTier } from './progression';
import { radiantGearAmount, validateRadiantGear, pair, type RadiantGear,
  type RadiantConduitDesign, type RadiantConduitEffect, type RadiantConduitPrimitive } from './conduit-effects';
import { radiantConduitDescription } from './conduit-effect-text';
import type { ElementId } from './activities';
import { intrinsicRole } from './role-perks';
import { radiantFlareTierScale, radiantKits, type RadiantKitDef, type RadiantKitId } from './radiant-kits';

export type RadiantBearerId = StarterId & (
  | 'ember' | 'tide' | 'sprout' | 'rosetta' | 'thornia' | 'crinso'
  | 'atmoso' | 'aurora' | 'bliss' | 'bruno' | 'disciple' | 'elise' | 'razor'
  | 'maerion' | 'caevren' | 'vespera' | 'ilyss' | 'asteriel' | 'serapha'
  | 'nerithe' | 'orvella' | 'vaelor' | 'caldrex' | 'solenne' | 'myrthen'
  | 'neralis' | 'varkhel' | 'seravelle' | 'velmira' | 'ozriel' | 'ilvaris' | 'kaelith'
);
export type RadiantStarter = RadiantBearerId;
export type RadiantAttunement = 'equinox' | 'corona' | 'aegis' | 'solstice' | 'prism';
export interface RadiantStats { hp: number; attack: number; defense: number; recovery: number }
export interface RadiantLoadout {
  id: string;
  starter: RadiantBearerId;
  level: number;
  form: number;
  convergenceRank: number;
  masterId: RadiantMasterId | null;
  weaponRank: number;
  ascension: CharacterAscension;
  gear?: RadiantGear;
}

export const radiantAttunements: Record<RadiantAttunement, RadiantStats> = {
  equinox: { hp: 1, attack: 1, defense: 1, recovery: 1 },
  corona: { hp: .9, attack: 1.25, defense: 1, recovery: 1 },
  aegis: { hp: 1, attack: .9, defense: 1.35, recovery: 1 },
  solstice: { hp: 1.25, attack: .9, defense: 1, recovery: 1 },
  prism: { hp: 1, attack: 1, defense: .9, recovery: 1.3 },
};

type SignatureTarget = 'all-enemies' | 'one-enemy' | 'all-allies';
/** Display summary of a kit Flare at one tier (presentation compatibility; the engine reads `radiantKits`). */
export interface RadiantFlareOffer {
  name: string;
  comboHits: number;
  target: SignatureTarget;
  damage: number;
  burn: number;
  burnPhases: number;
  shieldDefense: number;
  shieldHP: number;
  reduction: number;
  reductionPhases: number;
  weaken: number;
  weakenPhases: number;
  exposure: number;
  exposurePhases: number;
  heal: number;
  renewal: number;
  renewalRounds: number;
  attackBuff: number;
  attackBuffRounds: number;
}
export interface RadiantBearerKit {
  id: StarterId;
  name: string;
  element: string;
  elementId: ElementId;
  weapon: string;
  base: RadiantStats;
  baseCost: number;
  role: RadiantRole;
  passive: RadiantPassive;
  kit: RadiantKitDef;
  leader: string;
  leaderStat: keyof RadiantStats;
  leaderBonus: number;
  signatureFamily: string;
}
export type RadiantRole = 'Tank' | 'Attacker' | 'Support';
/** Phase 3 Passive (D-473); its rules run in the signature handlers. */
export interface RadiantPassive { name: string; description: string }


const bearerTuning: Record<RadiantBearerId, {
  base: RadiantStats;
  baseCost: number;
  leader: string;
  leaderStat: keyof RadiantStats;
  leaderBonus: number;
  family: string;
}> = {
  ember: { base: { hp: 240, attack: 60, defense: 16, recovery: 28 }, baseCost: 30,
    leader: 'Hearthbound Oath', leaderStat: 'attack', leaderBonus: .15, family: 'Cinderwake' },
  tide: { base: { hp: 300, attack: 44, defense: 22, recovery: 34 }, baseCost: 25,
    leader: 'Harbor Covenant', leaderStat: 'defense', leaderBonus: .2, family: 'Tideglass' },
  sprout: { base: { hp: 220, attack: 46, defense: 14, recovery: 65 }, baseCost: 20,
    leader: 'Garden Covenant', leaderStat: 'recovery', leaderBonus: .15, family: 'Dawnseed' },
  rosetta: { base: { hp: 245, attack: 58, defense: 15, recovery: 38 }, baseCost: 32,
    leader: 'Quarry Oath', leaderStat: 'attack', leaderBonus: .12, family: 'Rose Meridian' },
  thornia: { base: { hp: 315, attack: 45, defense: 24, recovery: 32 }, baseCost: 34,
    leader: 'Garden Gate', leaderStat: 'defense', leaderBonus: .18, family: 'Thorn Aegis' },
  crinso: { base: { hp: 235, attack: 64, defense: 14, recovery: 30 }, baseCost: 34,
    leader: 'Twin-Rose Accord', leaderStat: 'attack', leaderBonus: .1, family: 'Blossoming Edge' },
  atmoso: { base: { hp: 245, attack: 56, defense: 16, recovery: 35 }, baseCost: 30,
    leader: 'Open-Sky Route', leaderStat: 'attack', leaderBonus: .12, family: 'Sky Without End' },
  aurora: { base: { hp: 265, attack: 43, defense: 19, recovery: 58 }, baseCost: 34,
    leader: 'Merciful Verdict', leaderStat: 'recovery', leaderBonus: .12, family: 'Final Dawn' },
  bliss: { base: { hp: 235, attack: 55, defense: 15, recovery: 48 }, baseCost: 34,
    leader: 'Quietstorm Measure', leaderStat: 'attack', leaderBonus: .1, family: 'Thousandfeather' },
  bruno: { base: { hp: 320, attack: 43, defense: 25, recovery: 27 }, baseCost: 30,
    leader: 'Worldwall Stand', leaderStat: 'defense', leaderBonus: .18, family: 'Worldwall Mantle' },
  disciple: { base: { hp: 250, attack: 45, defense: 17, recovery: 54 }, baseCost: 34,
    leader: 'Unbound Concord', leaderStat: 'recovery', leaderBonus: .1, family: 'Mindcrown Resolve' },
  elise: { base: { hp: 230, attack: 62, defense: 14, recovery: 34 }, baseCost: 30,
    leader: 'Crosswind Opening', leaderStat: 'attack', leaderBonus: .13, family: 'Thunderwheel Recall' },
  razor: { base: { hp: 310, attack: 52, defense: 24, recovery: 25 }, baseCost: 34,
    leader: 'Midnight Bastion', leaderStat: 'defense', leaderBonus: .15, family: 'Unbroken Midnight' },
  maerion: { base: { hp: 285, attack: 40, defense: 20, recovery: 70 }, baseCost: 34,
    leader: 'Open Ferry', leaderStat: 'recovery', leaderBonus: .14, family: 'Unreturned Voyage' },
  caevren: { base: { hp: 325, attack: 40, defense: 28, recovery: 28 }, baseCost: 34,
    leader: 'Bridgeweight Vow', leaderStat: 'defense', leaderBonus: .2, family: 'Meridian Counterweight' },
  vespera: { base: { hp: 250, attack: 48, defense: 18, recovery: 52 }, baseCost: 34,
    leader: 'Last Beacon', leaderStat: 'recovery', leaderBonus: .12, family: 'Beacon Signal' },
  ilyss: { base: { hp: 265, attack: 42, defense: 19, recovery: 68 }, baseCost: 34,
    leader: 'Living Thread', leaderStat: 'recovery', leaderBonus: .14, family: 'Severance Mercy' },
  asteriel: { base: { hp: 245, attack: 42, defense: 17, recovery: 66 }, baseCost: 34,
    leader: 'Shared Orbit', leaderStat: 'recovery', leaderBonus: .12, family: 'Moonflower Promise' },
  serapha: { base: { hp: 290, attack: 41, defense: 23, recovery: 62 }, baseCost: 34,
    leader: 'Ceasefire Interval', leaderStat: 'defense', leaderBonus: .12, family: 'Sanctuary Interval' },
  nerithe: { base: { hp: 245, attack: 59, defense: 15, recovery: 38 }, baseCost: 34,
    leader: 'Uncharted Meridian', leaderStat: 'attack', leaderBonus: .12, family: 'Ocean Beyond the Map' },
  orvella: { base: { hp: 320, attack: 42, defense: 27, recovery: 36 }, baseCost: 34,
    leader: 'Load-Bearing Will', leaderStat: 'defense', leaderBonus: .14, family: 'Faultline Foundation' },
  vaelor: { base: { hp: 235, attack: 61, defense: 14, recovery: 34 }, baseCost: 34,
    leader: 'Standing Thunder', leaderStat: 'attack', leaderBonus: .14, family: 'Final Chord' },
  caldrex: { base: { hp: 330, attack: 46, defense: 27, recovery: 28 }, baseCost: 34,
    leader: 'Banked Heat', leaderStat: 'defense', leaderBonus: .12, family: 'Closed Kiln' },
  solenne: { base: { hp: 315, attack: 42, defense: 28, recovery: 39 }, baseCost: 34,
    leader: 'Held Stillness', leaderStat: 'defense', leaderBonus: .16, family: 'Last Reverberation' },
  myrthen: { base: { hp: 245, attack: 60, defense: 15, recovery: 40 }, baseCost: 34,
    leader: 'Turning Season', leaderStat: 'attack', leaderBonus: .12, family: 'All That Ripens' },
  neralis: { base: { hp: 285, attack: 43, defense: 20, recovery: 72 }, baseCost: 34,
    leader: 'Returning Current', leaderStat: 'recovery', leaderBonus: .14, family: 'No Crossing Left Empty' },
  varkhel: { base: { hp: 330, attack: 45, defense: 27, recovery: 31 }, baseCost: 34,
    leader: 'Tension Held', leaderStat: 'defense', leaderBonus: .14, family: 'Bridge Holds' },
  seravelle: { base: { hp: 270, attack: 52, defense: 20, recovery: 47 }, baseCost: 34,
    leader: 'Convoy Cadence', leaderStat: 'attack', leaderBonus: .1, family: 'Road Belongs to Everyone' },
  velmira: { base: { hp: 240, attack: 63, defense: 15, recovery: 34 }, baseCost: 34,
    leader: 'Alternating Edge', leaderStat: 'attack', leaderBonus: .12, family: 'Leave the Doorway Standing' },
  ozriel: { base: { hp: 360, attack: 40, defense: 31, recovery: 40 }, baseCost: 34,
    leader: 'Refusal', leaderStat: 'defense', leaderBonus: .2, family: 'Unbroken Refusal' },
  ilvaris: { base: { hp: 320, attack: 45, defense: 24, recovery: 70 }, baseCost: 34,
    leader: 'Hymn of Broken Glass', leaderStat: 'recovery', leaderBonus: .12, family: 'Fate-seared Hymn' },
  kaelith: { base: { hp: 250, attack: 70, defense: 17, recovery: 32 }, baseCost: 34,
    leader: 'Fractalized Incision', leaderStat: 'attack', leaderBonus: .14, family: 'Glass Meridian' },
};

/** D-493 crit step: base Critical Rate (fraction) and Critical Damage (multiplier) per bearer, the pre-Radiant
 * values. Fixed: no level, form or rank growth. A critical hit multiplies direct damage by `damage`. */
export interface RadiantCriticalStats { rate: number; damage: number }
export const radiantCriticalStats: Readonly<Record<RadiantBearerId, RadiantCriticalStats>> = {
  ember: { rate: .15, damage: 1.5 }, tide: { rate: .1, damage: 1.5 }, sprout: { rate: .2, damage: 1.5 },
  rosetta: { rate: .2, damage: 1.6 }, thornia: { rate: .1, damage: 1.5 }, crinso: { rate: .25, damage: 1.7 },
  atmoso: { rate: .2, damage: 1.6 }, aurora: { rate: .12, damage: 1.5 }, bliss: { rate: .25, damage: 1.7 },
  bruno: { rate: .08, damage: 1.5 }, disciple: { rate: .12, damage: 1.5 }, elise: { rate: .25, damage: 1.7 },
  razor: { rate: .1, damage: 1.5 }, maerion: { rate: .12, damage: 1.5 }, caevren: { rate: .1, damage: 1.5 },
  vespera: { rate: .12, damage: 1.5 }, ilyss: { rate: .12, damage: 1.5 }, asteriel: { rate: .12, damage: 1.5 },
  serapha: { rate: .12, damage: 1.5 }, nerithe: { rate: .18, damage: 1.6 }, orvella: { rate: .1, damage: 1.5 },
  vaelor: { rate: .22, damage: 1.65 }, caldrex: { rate: .1, damage: 1.5 }, solenne: { rate: .12, damage: 1.5 },
  myrthen: { rate: .22, damage: 1.65 }, neralis: { rate: .12, damage: 1.5 }, varkhel: { rate: .1, damage: 1.5 },
  seravelle: { rate: .14, damage: 1.5 }, velmira: { rate: .23, damage: 1.65 }, ozriel: { rate: .1, damage: 1.5 },
  ilvaris: { rate: .15, damage: 1.55 }, kaelith: { rate: .22, damage: 1.7 },
};
/** Every enemy: flat Critical Rate and Critical Damage (owner, 2026-11-20). */
export const radiantEnemyCritical: RadiantCriticalStats = { rate: .1, damage: 1.5 };
/** Above 100% Critical Rate, a second roll against the excess makes an Elemental Crit: Critical Damage x this. */
export const radiantElementalCritFactor = 1.5;

export const releasedRadiantIds = starters.filter(entry => characterReleased(entry.id)).map(entry => entry.id) as RadiantBearerId[];
function kitFor(id: RadiantBearerId): RadiantKitDef {
  if (!Object.hasOwn(radiantKits, id)) throw new Error(`Missing radiant kit for released Element-Bearer: ${id}`);
  return radiantKits[id as RadiantKitId];
}
export const radiantPassives = Object.fromEntries(releasedRadiantIds.map(id =>
  [id, { ...kitFor(id).passive } satisfies RadiantPassive])) as Record<RadiantBearerId, RadiantPassive>;
export const radiantBearerKits: Record<RadiantBearerId, RadiantBearerKit> = Object.fromEntries(
  releasedRadiantIds.map(id => {
    const character = starters.find(entry => entry.id === id)!;
    const tuning = bearerTuning[id];
    const role = intrinsicRole(id);
    if (!tuning || !role) throw new Error(`Missing radiant kit for released Element-Bearer: ${id}`);
    return [id, {
      id, name: character.name, element: character.element, elementId: character.elementId, weapon: character.weapon,
      base: tuning.base, baseCost: 100, role,
      passive: radiantPassives[id], kit: kitFor(id),
      leader: tuning.leader, leaderStat: tuning.leaderStat, leaderBonus: .2,
      signatureFamily: tuning.family,
    }];
  }),
) as Record<RadiantBearerId, RadiantBearerKit>;

/** Display summary of the unconditional generic clauses of a kit Flare (Step 3 replaces this with kit text). */
function flareSummary(id: RadiantBearerId, tier: ConvergentLightTier, power = 1): RadiantFlareOffer {
  const def = kitFor(id).flare, scale = radiantFlareTierScale[tier];
  const offer: RadiantFlareOffer = { name: def.name, comboHits: def.target === 'none' ? 0 : scale.hits,
    target: def.target === 'none' ? 'all-allies' : def.target, damage: def.power * scale.damage * power,
    burn: 0, burnPhases: 0, shieldDefense: 0, shieldHP: 0, reduction: 0, reductionPhases: 0, weaken: 0, weakenPhases: 0,
    exposure: 0, exposurePhases: 0, heal: 0, renewal: 0, renewalRounds: 0, attackBuff: 0, attackBuffRounds: 0 };
  for (const effect of def.effects) {
    if (effect.when !== undefined || effect.kind === 'signature' || !('value' in effect)) continue;
    const value = effect.value * scale.effect * power, turns = 'turns' in effect ? effect.turns ?? 0 : 0;
    switch (effect.kind) {
      case 'burn': offer.burn = value; offer.burnPhases = turns; break;
      case 'weaken': offer.weaken = value; offer.weakenPhases = turns; break;
      case 'expose': offer.exposure = value; offer.exposurePhases = turns; break;
      case 'reduction': offer.reduction = value; offer.reductionPhases = turns; break;
      case 'attack-up': offer.attackBuff = value; offer.attackBuffRounds = turns; break;
      case 'heal': offer.heal = value; break;
      case 'shield': offer.shieldHP = value; break;
    }
  }
  return offer;
}
export const radiantFlares: Record<RadiantBearerId, Record<ConvergentLightTier, RadiantFlareOffer>> =
  Object.fromEntries(releasedRadiantIds.map(id => [id, Object.fromEntries(
    (Object.keys(radiantFlareTierScale) as ConvergentLightTier[]).map(tier => [tier, flareSummary(id, tier)]))])) as
    Record<RadiantBearerId, Record<ConvergentLightTier, RadiantFlareOffer>>;
export function radiantFlareName(id: RadiantBearerId): string {
  return kitFor(id).flare.name;
}

export type RadiantMasterId = `master-${RadiantBearerId}-${1 | 2 | 3}` & MasterConduitId;
export type RadiantMasterEnhancement = 'passive' | 'leader' | 'signature' | 'none';
export interface RadiantMasterDefinition {
  starter: RadiantBearerId;
  attunement: Exclude<RadiantAttunement, 'equinox'>;
  enhancement: RadiantMasterEnhancement;
  magnitude: number;
  effect: string;
  effects: RadiantConduitDesign;
  rule: 'standard' | 'longer-burn' | 'flare-damage' | 'self-shield' | 'flare-shield'
    | 'deep-shield' | 'tide-strike' | 'flare-heal' | 'sprout-strike' | 'longer-renewal';
}
const masterAttunements: Record<RadiantBearerId, readonly [
  Exclude<RadiantAttunement, 'equinox'>, Exclude<RadiantAttunement, 'equinox'>, Exclude<RadiantAttunement, 'equinox'>,
]> = {
  ember: ['corona', 'corona', 'solstice'], tide: ['aegis', 'solstice', 'corona'], sprout: ['prism', 'corona', 'solstice'],
  rosetta: ['corona', 'corona', 'prism'], thornia: ['aegis', 'solstice', 'corona'], crinso: ['corona', 'solstice', 'prism'],
  atmoso: ['corona', 'prism', 'solstice'], aurora: ['prism', 'solstice', 'aegis'], bliss: ['prism', 'corona', 'solstice'],
  bruno: ['aegis', 'solstice', 'corona'], disciple: ['prism', 'corona', 'solstice'], elise: ['corona', 'corona', 'aegis'],
  razor: ['aegis', 'corona', 'solstice'], maerion: ['prism', 'solstice', 'aegis'], caevren: ['aegis', 'solstice', 'prism'],
  vespera: ['corona', 'prism', 'solstice'], ilyss: ['prism', 'solstice', 'aegis'], asteriel: ['prism', 'prism', 'solstice'],
  serapha: ['solstice', 'aegis', 'prism'], nerithe: ['corona', 'corona', 'prism'], orvella: ['aegis', 'solstice', 'corona'],
  vaelor: ['corona', 'corona', 'solstice'], caldrex: ['aegis', 'solstice', 'corona'], solenne: ['aegis', 'solstice', 'prism'],
  myrthen: ['corona', 'corona', 'prism'], neralis: ['prism', 'solstice', 'aegis'], varkhel: ['aegis', 'solstice', 'corona'],
  seravelle: ['prism', 'corona', 'solstice'], velmira: ['corona', 'corona', 'aegis'], ozriel: ['solstice', 'aegis', 'corona'],
  ilvaris: ['prism', 'solstice', 'corona'], kaelith: ['corona', 'corona', 'aegis'],
};
const leaderDesigns: Record<RadiantBearerId, RadiantConduitDesign> = {
  ember: pair('normal', .2, 'burn-power', .15),
  tide: pair('defense', .2, 'guard-shield', .4),
  sprout: pair('healing', .2, 'round-heal', .1),
  rosetta: pair('exposed', .25, 'normal-expose', .08),
  thornia: pair('shielding', .2, 'reflect', .2),
  crinso: pair('burning', .25, 'leech', .04),
  atmoso: pair('cooperation', .2, 'normal-charge', 2),
  aurora: pair('weakened', .2, 'resilience', .2),
  bliss: pair('next-buff', .1, 'normal-heal', .12),
  bruno: pair('guard', .12, 'guard-team-shield', .2),
  disciple: pair('flare', .2, 'flare-team-charge', 3),
  elise: pair('first-action', .25, 'pierce', .1),
  razor: pair('shielded', .25, 'normal-reduction', .08),
  maerion: pair('recovery', .2, 'heal-charge', 2),
  caevren: pair('brace', .1, 'absorbed-charge', 3),
  vespera: pair('burn-power', .2, 'next-buff', .1),
  ilyss: pair('resilience', .25, 'heal-shield', .2),
  asteriel: pair('round-team-heal', .06, 'heal-buff', .08),
  serapha: pair('shelter', .1, 'guard-heal', .2),
  nerithe: pair('normal-expose', .1, 'team-charge', 1),
  orvella: pair('guard-shield', .35, 'hurt-heal', .12),
  vaelor: pair('cooperation', .2, 'normal-splash', .12),
  caldrex: pair('burn-heal', .1, 'hurt-shield', .025),
  solenne: pair('guard', .1, 'break-heal', .2),
  myrthen: pair('execution', .3, 'kill-heal', .03),
  neralis: pair('heal-team-charge', 2, 'shielding', .15),
  varkhel: pair('wounded', .25, 'normal-shield', .25),
  seravelle: pair('normal-heal', .15, 'flare-team-charge', 3),
  velmira: pair('weakened', .2, 'normal-weaken', .08),
  ozriel: pair('shelter', .12, 'hurt-shield', .03),
  ilvaris: pair('heal-buff', .1, 'round-charge', 2),
  kaelith: pair('opening', .25, 'exposed', .2),
};
const masterDesigns: Record<RadiantBearerId, readonly [RadiantConduitDesign, RadiantConduitDesign, RadiantConduitDesign]> = {
  ember: [pair('burn-power', .4, 'leech', .08), pair('flare', .3, 'normal-burn', .15), pair('burning', .35, 'flare-heal', .3)],
  tide: [pair('break-heal', .4, 'defense', .25), pair('shielding', .4, 'guard-heal', .3), pair('normal-weaken', .18, 'guard-shield', .6)],
  sprout: [pair('round-team-heal', .12, 'healing', .25), pair('normal-weaken', .15, 'normal-heal', .4), pair('heal-shield', .5, 'flare-team-charge', 6)],
  atmoso: [pair('normal-splash', .4, 'normal-charge', 4), pair('hurt-charge', 8, 'cooperation', .3), pair('first-action', .35, 'pierce', .2)],
  aurora: [pair('normal-expose', .18, 'weakened', .3), pair('flare-weaken', .2, 'shelter', .15), pair('hurt-heal', .4, 'normal-weaken', .15)],
  bliss: [pair('flare-heal', .5, 'heal-buff', .15), pair('normal', .3, 'normal-heal', .25), pair('flare-team-charge', 10, 'next-buff', .15)],
  bruno: [pair('normal-reduction', .15, 'defense', .3), pair('guard-shield', 1, 'flare-shield', .05), pair('normal-expose', .18, 'guard-team-shield', .4)],
  disciple: [pair('next-buff', .25, 'cooperation', .2), pair('team-charge', 3, 'flare-team-charge', 8), pair('heal-buff', .2, 'normal-splash', .25)],
  elise: [pair('pierce', .3, 'normal-charge', 3), pair('flare', .35, 'normal-splash', .25), pair('kill-charge', 15, 'first-action', .3)],
  razor: [pair('reflect', .4, 'normal-reduction', .15), pair('shielded', .4, 'flare', .25), pair('normal-weaken', .2, 'solo', .3)],
  rosetta: [pair('status-shield', .6, 'cooperation', .25), pair('exposed', .35, 'normal-splash', .3), pair('normal-expose', .2, 'next-buff', .2)],
  thornia: [pair('reflect', .5, 'normal-burn', .1), pair('flare-weaken', .2, 'guard-shield', .6), pair('guard-team-shield', .6, 'shelter', .12)],
  crinso: [pair('burn-power', .3, 'execution', .4), pair('shielded', .35, 'normal-splash', .3), pair('flare', .25, 'leech', .12)],
  nerithe: [pair('normal-expose', .18, 'team-charge', 3), pair('flare-team-charge', 8, 'normal-reduction', .15), pair('flare', .3, 'kill-charge', 12)],
  orvella: [pair('normal-shield', .6, 'guard-team-shield', .4), pair('guard-heal', .4, 'hurt-heal', .3), pair('defense', .35, 'shielded', .25)],
  vaelor: [pair('hurt-charge', 8, 'flare', .3), pair('cooperation', .3, 'flare-weaken', .18), pair('team-charge', 4, 'next-buff', .15)],
  caldrex: [pair('defense', .35, 'burning', .25), pair('reflect', .6, 'hurt-charge', 5), pair('burn-heal', .25, 'round-team-heal', .1)],
  solenne: [pair('guard', .2, 'shelter', .15), pair('flare-shield', .08, 'round-shield', .5), pair('absorbed-charge', 8, 'flare-team-charge', 6)],
  myrthen: [pair('execution', .45, 'normal', .25), pair('normal-charge', 5, 'wounded', .3), pair('kill-heal', .08, 'kill-charge', 12)],
  neralis: [pair('heal-shield', .6, 'recovery', .25), pair('guard-team-shield', .5, 'heal-charge', 5), pair('heal-team-charge', 4, 'hurt-heal', .3)],
  varkhel: [pair('hurt-shield', .08, 'burn-power', .3), pair('reflect', .5, 'shielded', .3), pair('guard-team-shield', .5, 'wounded', .3)],
  seravelle: [pair('normal-heal', .45, 'flare-team-charge', 6), pair('heal-buff', .2, 'round-charge', 4), pair('heal-team-charge', 4, 'shelter', .12)],
  velmira: [pair('weakened', .4, 'normal-charge', 4), pair('normal-splash', .3, 'normal-weaken', .18), pair('kill-charge', 12, 'leech', .1)],
  maerion: [pair('absorbed-charge', 8, 'healing', .25), pair('heal-shield', .6, 'flare-heal', .35), pair('heal-charge', 6, 'normal-heal', .25)],
  caevren: [pair('defense', .4, 'hurt-charge', 6), pair('shielding', .4, 'brace', .15), pair('reflect', .6, 'normal-shield', .5)],
  vespera: [pair('next-buff', .2, 'flare', .25), pair('burn-power', .4, 'pierce', .15), pair('team-charge', 3, 'burning', .3)],
  ilyss: [pair('healing', .35, 'flare-team-charge', 6), pair('heal-shield', .6, 'resilience', .3), pair('heal-buff', .2, 'guard-heal', .3)],
  asteriel: [pair('healing', .3, 'heal-buff', .18), pair('guard-heal', .4, 'round-shield', .5), pair('heal-team-charge', 4, 'normal-charge', 3)],
  serapha: [pair('flare-heal', .4, 'guard-team-shield', .4), pair('shelter', .15, 'hurt-heal', .4), pair('normal-weaken', .18, 'round-charge', 4)],
  ozriel: [pair('hurt-shield', .1, 'brace', .15), pair('flare-weaken', .25, 'shielding', .3), pair('break-heal', .5, 'round-charge', 5)],
  ilvaris: [pair('heal-buff', .25, 'flare-weaken', .15), pair('flare-team-charge', 10, 'round-team-heal', .1), pair('normal-expose', .18, 'heal-charge', 5)],
  kaelith: [pair('exposed', .4, 'pierce', .25), pair('normal-expose', .2, 'kill-charge', 12), pair('execution', .4, 'normal-weaken', .2)],
};
export const radiantMasters: Record<RadiantMasterId, RadiantMasterDefinition> = Object.fromEntries(
  masterConduits.filter(master => characterReleased(master.character)).map(master => {
    const slot = Number(master.id.slice(-1));
    const effects = masterDesigns[master.character as RadiantBearerId][slot - 1];
    return [master.id, {
      starter: master.character as RadiantBearerId,
      attunement: masterAttunements[master.character as RadiantBearerId][slot - 1],
      rule: 'standard',
      enhancement: 'none', magnitude: 0, effects,
      effect: effects.map(radiantConduitDescription).join(' '),
    }];
  }),
) as Record<RadiantMasterId, RadiantMasterDefinition>;

export const radiantStarterKits = radiantBearerKits;

/** D-473 O5 role traits: built-in Skill Power by role (Tank Defense and Support Health are in the frozen stats). */
export const radiantRoleSkillPower: Record<RadiantRole, number> = { Tank: 0, Attacker: .5, Support: .25 };
/** Support role: each skill and Flare heals all allies this fraction of max Health (not scaled by Skill Power). */
export const radiantSupportSquadHeal = .04;
/** Tank role: enemy single-target weight against 1 for other roles. */
export const radiantTankTargetWeight = 1.25;
/** D-473 O3: the `skill1`/`skill2` ascension flags boost their own skill. */
export const radiantSkillAscension = { skillPower: .5, efficiency: .05 } as const;

/** D-473 O3: Leaders no longer take the `skill2` ascension boost. */
export function radiantLeaderBonus(loadout: RadiantLoadout): number {
  return (radiantBearerKits[loadout.starter].leaderBonus + .02 * (loadout.form - 1)) *
    (1 + radiantEquipmentAmount(loadout, 'leader'));
}
export function radiantLeaderEffects(loadout: RadiantLoadout): RadiantConduitPrimitive[] {
  return leaderDesigns[loadout.starter].map(entry => ({
    kind: entry.kind, amount: entry.amount * radiantLeaderBonus(loadout) / .2,
  }));
}
export function radiantLeaderDescription(loadout: RadiantLoadout): string {
  const effects = radiantLeaderEffects(loadout).map(radiantConduitDescription).join(' ')
    .replace(/This bearer/g, 'The recipient').replace(/this bearer/g, 'the recipient');
  return `While this bearer is the living leader, ${radiantBearerKits[loadout.starter].element} squad members receive these effects: ${effects}`;
}
export function radiantEquipmentAmount(loadout: RadiantLoadout, kind: RadiantConduitEffect): number {
  const master = loadout.masterId === null ? undefined : radiantMasters[loadout.masterId];
  return radiantGearAmount(loadout.gear, kind) +
    (master?.effects.filter(entry => entry.kind === kind).reduce((sum, entry) => sum + entry.amount, 0) ?? 0);
}

/** Flare power from form, Convergent Light rank (+1% per rank), Master signature scaling and the `lastFlare` ascension. */
export function radiantFlarePower(loadout: RadiantLoadout): number {
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  const rankPower = 1 + .01 * (loadout.convergenceRank - 1);
  return (1 + .1 * (loadout.form - 1)) * rankPower *
    (1 + (master?.enhancement === 'signature' ? master.magnitude : 0) + (loadout.ascension.lastFlare ? .5 : 0));
}
/** Display summary of this loadout's Flare at a tier (before Skill Power and category caps). */
export function radiantFinalFlare(loadout: RadiantLoadout, tier: ConvergentLightTier): RadiantFlareOffer {
  return flareSummary(loadout.starter, tier, radiantFlarePower(loadout));
}

export function validateRadiantStats(stats: RadiantStats): void {
  if (!stats || Object.keys(stats).length !== 4 ||
      !(['hp', 'attack', 'defense', 'recovery'] as const).every(key =>
        Number.isFinite(stats[key]) && stats[key] >= 0 && stats[key] <= Number.MAX_SAFE_INTEGER) ||
      stats.hp < 1 || stats.attack <= 0)
    throw new Error('Invalid radiant four-stat snapshot.');
}
export function validateRadiantLoadout(loadout: RadiantLoadout): void {
  if (!loadout || typeof loadout.id !== 'string' || !loadout.id ||
      !Object.hasOwn(radiantBearerKits, loadout.starter) ||
      !Number.isSafeInteger(loadout.level) || loadout.level < 0 ||
      !Number.isSafeInteger(loadout.form) || loadout.form < 1 || loadout.form > 6 ||
      loadout.level > characterLevelCap(loadout.form, loadout.starter, loadout.ascension?.stats === true) ||
      !Number.isSafeInteger(loadout.convergenceRank) || loadout.convergenceRank < 1 ||
      loadout.convergenceRank > convergentLightRankCap({
        level: loadout.level, evolution: loadout.form, convergenceRank: loadout.convergenceRank,
        ascension: loadout.ascension,
      }, loadout.starter) ||
      !Number.isSafeInteger(loadout.weaponRank) || loadout.weaponRank < 0 ||
      loadout.weaponRank > weaponRules.maximumRank ||
      !loadout.ascension || typeof loadout.ascension !== 'object' || Array.isArray(loadout.ascension) ||
      Object.keys(loadout.ascension).some(key =>
        !['stats', 'skill1', 'skill2', 'lastFlare'].includes(key)) ||
      Object.values(loadout.ascension).some(value => typeof value !== 'boolean'))
    throw new Error('Invalid radiant bearer loadout.');
  if (loadout.masterId !== null && (!Object.hasOwn(radiantMasters, loadout.masterId) ||
      radiantMasters[loadout.masterId].starter !== loadout.starter))
    throw new Error('Radiant Master does not match this bearer or is unreleased.');
  if (loadout.gear !== undefined)
    validateRadiantGear(loadout.gear, radiantBearerKits[loadout.starter].elementId);
}
export function radiantAttunement(loadout: RadiantLoadout): RadiantAttunement {
  validateRadiantLoadout(loadout);
  return loadout.masterId === null ? 'equinox' : radiantMasters[loadout.masterId].attunement;
}
export function resolveRadiantStarterStats(loadout: RadiantLoadout): RadiantStats {
  validateRadiantLoadout(loadout);
  const growth = 1 + .15 * loadout.level + 1.5 * (loadout.form - 1);
  const base = radiantBearerKits[loadout.starter].base;
  const profile = radiantAttunements[radiantAttunement(loadout)];
  const ascension = loadout.ascension.stats ? 1.5 : 1;
  const stats = {
    hp: base.hp * growth * profile.hp * ascension,
    attack: base.attack * growth * (1 + weaponRules.attackPerRank * loadout.weaponRank) * profile.attack * ascension,
    defense: base.defense * growth ** .7 * profile.defense * ascension,
    recovery: base.recovery * growth * profile.recovery * ascension,
  };
  for (const key of ['hp', 'attack', 'defense', 'recovery'] as const)
    stats[key] *= 1 + radiantEquipmentAmount(loadout, key);
  // D-473 O5 role traits: Tank +50% Defense, Support +50% Health.
  const role = radiantBearerKits[loadout.starter].role;
  if (role === 'Tank') stats.defense *= 1.5;
  if (role === 'Support') stats.hp *= 1.5;
  validateRadiantStats(stats);
  return stats;
}
