import { characterReleased } from './release-visibility';
import { masterConduits, type MasterConduitId } from './master-conduits';
import { starters, type StarterId } from './starters';
import { characterLevelCap, convergentLightRankCap, convergentLightTier, weaponRules,
  type CharacterAscension, type ConvergentLightTier } from './progression';
import { radiantGearAmount, validateRadiantGear, type RadiantGear } from './conduit-effects';
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
export type RadiantMasterEnhancement = 'passive' | 'leader' | 'signature';
export interface RadiantMasterDefinition {
  starter: RadiantBearerId;
  attunement: Exclude<RadiantAttunement, 'equinox'>;
  enhancement: RadiantMasterEnhancement;
  magnitude: number;
  effect: string;
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
export const radiantMasters: Record<RadiantMasterId, RadiantMasterDefinition> = Object.fromEntries(
  masterConduits.filter(master => characterReleased(master.character)).map(master => {
    const slot = Number(master.id.slice(-1));
    const enhancement: RadiantMasterEnhancement = slot === 1 ? 'passive' : slot === 2 ? 'signature' : 'leader';
    const kit = radiantBearerKits[master.character as RadiantBearerId];
    return [master.id, {
      starter: master.character as RadiantBearerId,
      attunement: masterAttunements[master.character as RadiantBearerId][slot - 1],
      rule: 'standard',
      enhancement,
      magnitude: enhancement === 'passive' ? .15 : enhancement === 'leader' ? .05 : .15,
      effect: enhancement === 'passive'
        ? kit.passive.magnitude === 1
          ? `${kit.passive.name} also heals each cleansed recipient for 15% of its bearer’s Recovery.`
          : `Strengthens ${kit.passive.name} by 15% while its bearer is alive.`
        : enhancement === 'leader'
          ? `Strengthens ${kit.leader} by 5 percentage points while this bearer is first and alive.`
          : `Strengthens ${kit.signatureFamily} by 15%.`,
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
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  return (radiantBearerKits[loadout.starter].leaderBonus + .02 * (loadout.form - 1)) *
    (loadout.ascension.skill2 ? 1.5 : 1) + (master?.enhancement === 'leader' ? master.magnitude : 0) +
    radiantGearAmount(loadout.gear, 'leader');
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
    stats[key] *= 1 + radiantGearAmount(loadout.gear, key);
  validateRadiantStats(stats);
  return stats;
}
