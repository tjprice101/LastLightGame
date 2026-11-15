import { characterReleased } from './release-visibility';
import { masterConduits, type MasterConduitId } from './master-conduits';
import { starters, type StarterId } from './starters';
import { characterLevelCap, convergentLightRankCap, convergentLightTier, weaponRules,
  type CharacterAscension, type ConvergentLightTier } from './progression';
import { radiantGearAmount, validateRadiantGear, pair, type RadiantGear,
  type RadiantConduitDesign, type RadiantConduitEffect, type RadiantConduitPrimitive } from './conduit-effects';
import { radiantConduitDescription } from './conduit-effect-text';
import type { ElementId } from './activities';

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
  passive: RadiantPassive;
  leader: string;
  leaderStat: keyof RadiantStats;
  leaderBonus: number;
  signatureFamily: string;
  signature: Omit<RadiantFlareOffer, 'name'>;
}

export type RadiantPassiveRule =
  | 'squad-stat' | 'banked-cinder' | 'tide-return' | 'dawn-seed'
  | 'normal-expose' | 'guard-shelter' | 'burning-strike' | 'next-ally-focus'
  | 'flare-cleanse' | 'late-heal' | 'hurt-bulwark' | 'guard-focus'
  | 'exposed-strike' | 'guard-weaken' | 'heal-charge' | 'absorbed-heal'
  | 'normal-burn' | 'guard-cleanse' | 'long-seed' | 'hurt-shelter'
  | 'charted-charge' | 'guard-foundation' | 'exposed-charge' | 'absorbed-burn'
  | 'guard-stillness' | 'burning-heal' | 'heal-shelter' | 'next-ally-shield'
  | 'guard-convoy' | 'weakened-expose' | 'wounded-refusal' | 'normal-renewal' | 'opening-incision';
export interface RadiantPassive { name: string; description: string; rule: RadiantPassiveRule; magnitude: number; stat: keyof RadiantStats }


const bearerTuning: Record<RadiantBearerId, {
  base: RadiantStats;
  baseCost: number;
  leader: string;
  leaderStat: keyof RadiantStats;
  leaderBonus: number;
  family: string;
  target: SignatureTarget;
  damage?: number;
  burn?: number;
  burnPhases?: number;
  shieldDefense?: number;
  shieldHP?: number;
  reduction?: number;
  reductionPhases?: number;
  weaken?: number;
  weakenPhases?: number;
  exposure?: number;
  exposurePhases?: number;
  heal?: number;
  renewal?: number;
  renewalRounds?: number;
  attackBuff?: number;
  attackBuffRounds?: number;
}> = {
  ember: { base: { hp: 240, attack: 60, defense: 16, recovery: 28 }, baseCost: 30,
    leader: 'Hearthbound Oath', leaderStat: 'attack', leaderBonus: .15, family: 'Cinderwake',
    target: 'all-enemies', damage: 1.4, burn: .12, burnPhases: 2 },
  tide: { base: { hp: 300, attack: 44, defense: 22, recovery: 34 }, baseCost: 25,
    leader: 'Harbor Covenant', leaderStat: 'defense', leaderBonus: .2, family: 'Tideglass',
    target: 'all-allies', shieldDefense: .9, shieldHP: .05 },
  sprout: { base: { hp: 220, attack: 46, defense: 14, recovery: 65 }, baseCost: 20,
    leader: 'Garden Covenant', leaderStat: 'recovery', leaderBonus: .15, family: 'Dawnseed',
    target: 'all-allies', heal: .8, renewal: .15, renewalRounds: 2 },
  rosetta: { base: { hp: 245, attack: 58, defense: 15, recovery: 38 }, baseCost: 32,
    leader: 'Quarry Oath', leaderStat: 'attack', leaderBonus: .12, family: 'Rose Meridian',
    target: 'one-enemy', damage: 1.65, exposure: .18, exposurePhases: 2 },
  thornia: { base: { hp: 315, attack: 45, defense: 24, recovery: 32 }, baseCost: 34,
    leader: 'Garden Gate', leaderStat: 'defense', leaderBonus: .18, family: 'Thorn Aegis',
    target: 'all-allies', shieldDefense: .8, shieldHP: .06, reduction: .12, reductionPhases: 1 },
  crinso: { base: { hp: 235, attack: 64, defense: 14, recovery: 30 }, baseCost: 34,
    leader: 'Twin-Rose Accord', leaderStat: 'attack', leaderBonus: .1, family: 'Blossoming Edge',
    target: 'one-enemy', damage: 2.05, burn: .08, burnPhases: 2 },
  atmoso: { base: { hp: 245, attack: 56, defense: 16, recovery: 35 }, baseCost: 30,
    leader: 'Open-Sky Route', leaderStat: 'attack', leaderBonus: .12, family: 'Sky Without End',
    target: 'all-enemies', damage: 1.3, weaken: .1, weakenPhases: 1 },
  aurora: { base: { hp: 265, attack: 43, defense: 19, recovery: 58 }, baseCost: 34,
    leader: 'Merciful Verdict', leaderStat: 'recovery', leaderBonus: .12, family: 'Final Dawn',
    target: 'all-enemies', damage: .65, weaken: .2, weakenPhases: 2, reduction: .12, reductionPhases: 1 },
  bliss: { base: { hp: 235, attack: 55, defense: 15, recovery: 48 }, baseCost: 34,
    leader: 'Quietstorm Measure', leaderStat: 'attack', leaderBonus: .1, family: 'Thousandfeather',
    target: 'all-allies', heal: .18, attackBuff: .12, attackBuffRounds: 1 },
  bruno: { base: { hp: 320, attack: 43, defense: 25, recovery: 27 }, baseCost: 30,
    leader: 'Worldwall Stand', leaderStat: 'defense', leaderBonus: .18, family: 'Worldwall Mantle',
    target: 'all-allies', shieldDefense: 1.1, shieldHP: .04 },
  disciple: { base: { hp: 250, attack: 45, defense: 17, recovery: 54 }, baseCost: 34,
    leader: 'Unbound Concord', leaderStat: 'recovery', leaderBonus: .1, family: 'Mindcrown Resolve',
    target: 'all-allies', attackBuff: .22, attackBuffRounds: 1 },
  elise: { base: { hp: 230, attack: 62, defense: 14, recovery: 34 }, baseCost: 30,
    leader: 'Crosswind Opening', leaderStat: 'attack', leaderBonus: .13, family: 'Thunderwheel Recall',
    target: 'one-enemy', damage: 2.2, weaken: .08, weakenPhases: 1 },
  razor: { base: { hp: 310, attack: 52, defense: 24, recovery: 25 }, baseCost: 34,
    leader: 'Midnight Bastion', leaderStat: 'defense', leaderBonus: .15, family: 'Unbroken Midnight',
    target: 'one-enemy', damage: 1.65, shieldDefense: .55, shieldHP: .03 },
  maerion: { base: { hp: 285, attack: 40, defense: 20, recovery: 70 }, baseCost: 34,
    leader: 'Open Ferry', leaderStat: 'recovery', leaderBonus: .14, family: 'Unreturned Voyage',
    target: 'all-allies', heal: .55, renewal: .1, renewalRounds: 1 },
  caevren: { base: { hp: 325, attack: 40, defense: 28, recovery: 28 }, baseCost: 34,
    leader: 'Bridgeweight Vow', leaderStat: 'defense', leaderBonus: .2, family: 'Meridian Counterweight',
    target: 'all-allies', shieldDefense: 1.25, shieldHP: .03, reduction: .1, reductionPhases: 1 },
  vespera: { base: { hp: 250, attack: 48, defense: 18, recovery: 52 }, baseCost: 34,
    leader: 'Last Beacon', leaderStat: 'recovery', leaderBonus: .12, family: 'Beacon Signal',
    target: 'all-enemies', damage: .9, burn: .1, burnPhases: 2, attackBuff: .08, attackBuffRounds: 1 },
  ilyss: { base: { hp: 265, attack: 42, defense: 19, recovery: 68 }, baseCost: 34,
    leader: 'Living Thread', leaderStat: 'recovery', leaderBonus: .14, family: 'Severance Mercy',
    target: 'all-allies', heal: .38, reduction: .1, reductionPhases: 1 },
  asteriel: { base: { hp: 245, attack: 42, defense: 17, recovery: 66 }, baseCost: 34,
    leader: 'Shared Orbit', leaderStat: 'recovery', leaderBonus: .12, family: 'Moonflower Promise',
    target: 'all-allies', heal: .22, renewal: .22, renewalRounds: 2 },
  serapha: { base: { hp: 290, attack: 41, defense: 23, recovery: 62 }, baseCost: 34,
    leader: 'Ceasefire Interval', leaderStat: 'defense', leaderBonus: .12, family: 'Sanctuary Interval',
    target: 'all-allies', shieldDefense: .75, shieldHP: .05, reduction: .2, reductionPhases: 1 },
  nerithe: { base: { hp: 245, attack: 59, defense: 15, recovery: 38 }, baseCost: 34,
    leader: 'Uncharted Meridian', leaderStat: 'attack', leaderBonus: .12, family: 'Ocean Beyond the Map',
    target: 'one-enemy', damage: 1.8, weaken: .18, weakenPhases: 2 },
  orvella: { base: { hp: 320, attack: 42, defense: 27, recovery: 36 }, baseCost: 34,
    leader: 'Load-Bearing Will', leaderStat: 'defense', leaderBonus: .14, family: 'Faultline Foundation',
    target: 'all-allies', shieldDefense: 1.15, shieldHP: .04 },
  vaelor: { base: { hp: 235, attack: 61, defense: 14, recovery: 34 }, baseCost: 34,
    leader: 'Standing Thunder', leaderStat: 'attack', leaderBonus: .14, family: 'Final Chord',
    target: 'all-enemies', damage: 1.35, weaken: .12, weakenPhases: 1 },
  caldrex: { base: { hp: 330, attack: 46, defense: 27, recovery: 28 }, baseCost: 34,
    leader: 'Banked Heat', leaderStat: 'defense', leaderBonus: .12, family: 'Closed Kiln',
    target: 'all-enemies', damage: .7, shieldDefense: 1, shieldHP: .05, burn: .06, burnPhases: 2 },
  solenne: { base: { hp: 315, attack: 42, defense: 28, recovery: 39 }, baseCost: 34,
    leader: 'Held Stillness', leaderStat: 'defense', leaderBonus: .16, family: 'Last Reverberation',
    target: 'all-allies', shieldDefense: .8, shieldHP: .04, reduction: .16, reductionPhases: 2 },
  myrthen: { base: { hp: 245, attack: 60, defense: 15, recovery: 40 }, baseCost: 34,
    leader: 'Turning Season', leaderStat: 'attack', leaderBonus: .12, family: 'All That Ripens',
    target: 'all-enemies', damage: 1.65, burn: .08, burnPhases: 2 },
  neralis: { base: { hp: 285, attack: 43, defense: 20, recovery: 72 }, baseCost: 34,
    leader: 'Returning Current', leaderStat: 'recovery', leaderBonus: .14, family: 'No Crossing Left Empty',
    target: 'all-allies', heal: .42, renewal: .12, renewalRounds: 1 },
  varkhel: { base: { hp: 330, attack: 45, defense: 27, recovery: 31 }, baseCost: 34,
    leader: 'Tension Held', leaderStat: 'defense', leaderBonus: .14, family: 'Bridge Holds',
    target: 'all-allies', shieldDefense: .95, shieldHP: .06, attackBuff: .08, attackBuffRounds: 1 },
  seravelle: { base: { hp: 270, attack: 52, defense: 20, recovery: 47 }, baseCost: 34,
    leader: 'Convoy Cadence', leaderStat: 'attack', leaderBonus: .1, family: 'Road Belongs to Everyone',
    target: 'all-allies', attackBuff: .18, attackBuffRounds: 1, heal: .08 },
  velmira: { base: { hp: 240, attack: 63, defense: 15, recovery: 34 }, baseCost: 34,
    leader: 'Alternating Edge', leaderStat: 'attack', leaderBonus: .12, family: 'Leave the Doorway Standing',
    target: 'one-enemy', damage: 2.05, weaken: .14, weakenPhases: 2 },
  ozriel: { base: { hp: 360, attack: 40, defense: 31, recovery: 40 }, baseCost: 34,
    leader: 'Refusal', leaderStat: 'defense', leaderBonus: .2, family: 'Unbroken Refusal',
    target: 'all-allies', shieldDefense: 1.1, shieldHP: .06, reduction: .12, reductionPhases: 1 },
  ilvaris: { base: { hp: 320, attack: 45, defense: 24, recovery: 70 }, baseCost: 34,
    leader: 'Hymn of Broken Glass', leaderStat: 'recovery', leaderBonus: .12, family: 'Fate-seared Hymn',
    target: 'all-allies', heal: .38, renewal: .12, renewalRounds: 2 },
  kaelith: { base: { hp: 250, attack: 70, defense: 17, recovery: 32 }, baseCost: 34,
    leader: 'Fractalized Incision', leaderStat: 'attack', leaderBonus: .14, family: 'Glass Meridian',
    target: 'one-enemy', damage: 2.35, weaken: .15, weakenPhases: 1 },
};

const flareTiers: Record<ConvergentLightTier, { damage: number; support: number; comboHits: number }> = {
  sparkling: { damage: 4, support: 2, comboHits: 4 },
  glimmering: { damage: 8, support: 3, comboHits: 8 },
  ultimate: { damage: 12, support: 4, comboHits: 12 },
};
function baseSignature(tuning: typeof bearerTuning[RadiantBearerId]): Omit<RadiantFlareOffer, 'name'> {
  return {
    comboHits: 4,
    target: tuning.target, damage: tuning.damage ?? 0, burn: tuning.burn ?? 0,
    burnPhases: tuning.burnPhases ?? 0, shieldDefense: tuning.shieldDefense ?? 0,
    shieldHP: tuning.shieldHP ?? 0, reduction: tuning.reduction ?? 0,
    reductionPhases: tuning.reductionPhases ?? 0, weaken: tuning.weaken ?? 0,
    weakenPhases: tuning.weakenPhases ?? 0, exposure: tuning.exposure ?? 0,
    exposurePhases: tuning.exposurePhases ?? 0, heal: tuning.heal ?? 0,
    renewal: tuning.renewal ?? 0, renewalRounds: tuning.renewalRounds ?? 0,
    attackBuff: tuning.attackBuff ?? 0, attackBuffRounds: tuning.attackBuffRounds ?? 0,
  };
}
export const releasedRadiantIds = starters.filter(entry => characterReleased(entry.id)).map(entry => entry.id) as RadiantBearerId[];
export const radiantPassives = Object.fromEntries(releasedRadiantIds.map(id => {
  const tuning = bearerTuning[id], magnitude = tuning.leaderBonus / 2;
  const stat = tuning.leaderStat;
  return [id, {
    name: `${tuning.family} Accord`, rule: 'squad-stat', stat, magnitude,
    description: `All squad members gain ${Number((magnitude * 100).toPrecision(12))}% ${stat === 'hp' ? 'Health' : stat[0].toUpperCase() + stat.slice(1)} while this bearer is alive.`,
  } satisfies RadiantPassive];
})) as Record<RadiantBearerId, RadiantPassive>;
export const radiantBearerKits: Record<RadiantBearerId, RadiantBearerKit> = Object.fromEntries(
  releasedRadiantIds.map(id => {
    const character = starters.find(entry => entry.id === id)!;
    const tuning = bearerTuning[id];
    if (!tuning) throw new Error(`Missing radiant kit for released Element-Bearer: ${id}`);
    return [id, {
      id, name: character.name, element: character.element, elementId: character.elementId, weapon: character.weapon,
      base: tuning.base, baseCost: 100,
      passive: radiantPassives[id],
      leader: tuning.leader, leaderStat: tuning.leaderStat, leaderBonus: .2,
      signatureFamily: tuning.family, signature: baseSignature(tuning),
    }];
  }),
) as Record<RadiantBearerId, RadiantBearerKit>;

export const radiantFlares: Record<RadiantBearerId, Record<ConvergentLightTier, RadiantFlareOffer>> =
  Object.fromEntries(releasedRadiantIds.map(id => {
    const kit = radiantBearerKits[id];
    return [id, Object.fromEntries((Object.entries(flareTiers) as [ConvergentLightTier, typeof flareTiers.sparkling][]).map(([tier, scale]) =>
      [tier, {
        name: 'Convergent Light',
        ...kit.signature,
        comboHits: scale.comboHits,
        damage: kit.signature.damage * scale.damage,
        burn: kit.signature.burn * scale.support,
        shieldDefense: kit.signature.shieldDefense * scale.support,
        shieldHP: kit.signature.shieldHP * scale.support,
        reduction: kit.signature.reduction * scale.support,
        weaken: kit.signature.weaken * scale.support,
        exposure: kit.signature.exposure * scale.support,
        heal: kit.signature.heal * scale.support,
        renewal: kit.signature.renewal * scale.support,
        attackBuff: kit.signature.attackBuff * scale.support,
      }]))];
  })) as Record<RadiantBearerId, Record<ConvergentLightTier, RadiantFlareOffer>>;

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

export function radiantPassiveAmount(loadout: RadiantLoadout): number {
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  return (radiantBearerKits[loadout.starter].passive.magnitude + .01 * (loadout.form - 1)) *
    (1 + (master?.enhancement === 'passive' ? master.magnitude : 0) + (loadout.ascension.skill1 ? .5 : 0));
}

export function radiantLeaderBonus(loadout: RadiantLoadout): number {
  return (radiantBearerKits[loadout.starter].leaderBonus + .02 * (loadout.form - 1)) *
    (loadout.ascension.skill2 ? 1.5 : 1) * (1 + radiantEquipmentAmount(loadout, 'leader'));
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

export function radiantFinalFlare(loadout: RadiantLoadout, tier: ConvergentLightTier): RadiantFlareOffer {
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  const rankPower = 1 + .01 * (loadout.convergenceRank - 1);
  const power = (1 + .1 * (loadout.form - 1)) * rankPower *
    (1 + (master?.enhancement === 'signature' ? master.magnitude : 0) + (loadout.ascension.lastFlare ? .5 : 0));
  const offer = { ...radiantFlares[loadout.starter][tier] };
  for (const key of ['damage', 'burn', 'shieldDefense', 'shieldHP', 'reduction', 'weaken', 'exposure', 'heal', 'renewal', 'attackBuff'] as const)
    offer[key] *= power;
  for (const key of ['reduction', 'weaken', 'exposure', 'attackBuff'] as const)
    offer[key] = Math.min(.8, offer[key]);
  return offer;
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
  validateRadiantStats(stats);
  return stats;
}
