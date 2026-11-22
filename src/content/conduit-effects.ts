import {
  getConduit, validateConduitElement, validateConduitSlots, validateConduitUpgradeLevel,
  type ConduitId,
} from './conduits';
import type { ElementId } from './activities';

export type RadiantConduitEffect =
  | 'hp' | 'attack' | 'defense' | 'recovery' | 'normal' | 'flare' | 'pierce'
  | 'healing' | 'shielding' | 'resilience' | 'guard' | 'leader'
  | 'normal-charge' | 'guard-charge' | 'team-charge'
  | 'guard-shield' | 'normal-heal' | 'leech' | 'heal-charge' | 'heal-buff'
  | 'absorbed-charge' | 'reflect' | 'hurt-shield' | 'flare-shield'
  | 'round-heal' | 'round-shield' | 'normal-burn' | 'normal-expose'
  | 'normal-weaken' | 'cooperation' | 'next-buff' | 'status-shield'
  | 'opening' | 'execution' | 'burning' | 'exposed' | 'weakened' | 'shielded' | 'wounded' | 'solo'
  | 'first-action' | 'burn-power' | 'shelter' | 'brace'
  | 'start-charge' | 'guard-heal' | 'flare-heal' | 'normal-shield' | 'heal-shield'
  | 'hurt-heal' | 'break-heal' | 'burn-heal' | 'kill-heal' | 'kill-charge' | 'normal-splash'
  | 'flare-team-charge' | 'hurt-charge' | 'heal-team-charge' | 'guard-team-shield'
  | 'flare-weaken' | 'normal-reduction' | 'round-charge' | 'round-team-heal'
  // D-493 restoration (Phase 4c): pre-Radiant Skill stats, Luminosity and damage layers.
  | 'skill-power' | 'skill1-power' | 'debuff-power' | 'restore-power' | 'health-skill-power'
  | 'skill-efficiency' | 'skill-duration' | 'debuff-duration' | 'gauge-gain' | 'capacity'
  | 'direct' | 'skill-pierce' | 'enemy-defense' | 'drain' | 'ally-heal-self' | 'twin-charge'
  // D-493 B2 (Legendary).
  | 'ally-guard' | 'skill2-power' | 'skill2-efficiency' | 'phase-shield' | 'reserve-health' | 'reserve-defense'
  | 'support-power' | 'restore-charge' | 'gamble-power' | 'shield-guard' | 'aoe-power'
  | 'prism-efficiency' | 'prism-gain' | 'last-block' | 'flare-power'
  // D-493 B3a (Omnic, no new system): squad auras, dynamic Skill Power, per-target hooks and new triggers.
  | 'squad-hp' | 'squad-attack' | 'squad-gain' | 'squad-defense' | 'ally-defense-share'
  | 'oceanic-power' | 'census-power' | 'ruin-power' | 'ruin-defense'
  | 'weakened-pierce' | 'weakened-ally-power' | 'low-heal-power' | 'lift-guard'
  | 'burn-skill-power' | 'burn-duration' | 'skill-shield-brace'
  | 'shielded-restore-power' | 'skill-mark' | 'burn-amp' | 'burn-transfer' | 'overheal-shield'
  | 'defense-heal' | 'shield-charge'
  | 'flare-round-heal' | 'flare-round-charge' | 'weaken-guard' | 'weaken-heal' | 'shield-echo' | 'skill-drain-ally'
  | 'burning-attack' | 'burn-tick-heal' | 'shield-reflect' | 'weaken-duration' | 'weaken-ally-efficiency'
  | 'first-turn-attack'
  // D-493 crit step: real critical hits (Critical Rate in points, Critical Damage multiplying the base).
  | 'crit-rate' | 'crit-damage' | 'skill-crit-damage' | 'flare-crit-rate' | 'flare-crit-damage'
  | 'crit-heal' | 'first-crit-heal' | 'first-crit-skill-charge' | 'first-crit-skill-shield'
  | 'burn-ally-crit' | 'skill-shield-crit'
  // D-493 B3b: next-action bonuses (C17) and their triggers.
  | 'miss-ally-crit' | 'miss-self-crit-damage' | 'miss-self-direct' | 'flare-team-power' | 'flare-team-efficiency'
  | 'normal-ally-efficiency' | 'alternate-power' | 'alternate-ally-efficiency' | 'crit-skill-strike' | 'crit-skill-ally-crit'
  | 'heal-ally-power' | 'healed-attack' | 'healer-efficiency' | 'shielded-crit-damage' | 'first-crit-provider-power'
  | 'followup-power' | 'followup-charge' | 'burn-ally-power' | 'third-crit-flare-efficiency' | 'relay-power'
  | 'relay-efficiency' | 'turn-restore-efficiency' | 'turn-restore-power'
  // D-493 B3c: shared rescue limit (C18), Phoenix Reactor revive, Accord, Atlas Bastion taunt.
  | 'revive' | 'revive-shield' | 'accord-efficiency' | 'taunt' | 'taunt-charge'
  // D-493 B4 (Calamitic): heal/Shield Skill Efficiency, Ruinmark's Weaken amplifier, Choir-Array's mark trigger,
  // Lone Apostate's solo-squad stats and Throne of Borrowed Tomorrows' extra skill (G12).
  | 'restore-efficiency' | 'weaken-vulnerability' | 'mark-team-power' | 'mark-team-charge'
  | 'lone-hp' | 'lone-defense' | 'lone-power' | 'flare-extra-skill'
  // D-493 B5a (Masters): squad Skill Power and Skill Efficiency auras (Deep Foundation Planetpress, Eclipse Planet Watchtower).
  | 'squad-skill-power' | 'squad-skill-efficiency';
/** `fixed` primitives ignore upgrade-rank scaling (D-493 C12: penalties, thresholds, flat Skill Duration);
 * `step` primitives add `step` per rank instead of scaling (C12 exceptions such as Stasis Reliquary's chance). */
export interface RadiantConduitPrimitive { kind: RadiantConduitEffect; amount: number; fixed?: true; step?: number }
export type RadiantConduitDesign = readonly RadiantConduitPrimitive[];
export const effect = (kind: RadiantConduitEffect, amount: number): RadiantConduitPrimitive => ({ kind, amount });
/** A primitive that keeps its amount at every upgrade rank (D-493 C12). */
export const fixedEffect = (kind: RadiantConduitEffect, amount: number): RadiantConduitPrimitive => ({ kind, amount, fixed: true });
/** A primitive whose amount rises by `step` per upgrade rank (D-493 C12 exceptions). */
export const steppedEffect = (kind: RadiantConduitEffect, amount: number, step: number): RadiantConduitPrimitive => ({ kind, amount, step });
/** D-493 B2 fixed rules: Nullsong's 50% roll and -75% loss, Citadel Spine's 75% Health line,
 * Pale Bulwark's Shield cap, Stasis Reliquary's +25% damage taken. */
export const radiantGambleRules = { chance: .5, loss: .75 } as const;
export const radiantAllyGuardThreshold = .75;
export const radiantShieldGuardCap = .8;
export const radiantStasisVulnerability = .25;
/** Critical Up (internal category `expose`): each point of stored magnitude grants this many points of Critical Rate
 * on hits against the enemy (the same expected damage as the old Exposure at a 1.5x base). */
export const radiantCriticalUpRate = 2;
/** D-493 C12: Glassroot Gimbal's Health step (fixed at every rank). */
export const radiantHealthSkillPowerStep = 450;
/** D-493 B3a fixed rules (C12): thresholds, caps and fallbacks keep their value at every rank. */
export const radiantOmnicRules = {
  /** Kirin Cradle: heal cap (fraction of the ally's maximum Health) and the all-full Luminosity fallback. */
  defenseHealCap: .5, defenseHealCharge: 8,
  /** Worldroot Graft: the Health line below which healing gains Skill Power and above which a lift grants Defense Up. */
  lowHealthLine: .4,
  /** Fractured Mercy Governor: the Health line below which its heal applies. */
  weakenHealLine: .5,
  /** Cinder Testament: Burn bonus cap. */
  burnAmpCap: .6,
  /** Worldtree Heart: Shield cap (fraction of the healed ally's maximum Health). */
  overhealCap: .2,
  /** Worldroot Sap Cathedral: heal cap per cast (fraction of the ally's maximum Health). */
  drainAllyCap: .1,
  /** Leviathan Mercy Reflector: reflection cap per enemy phase (multiple of this bearer's current Attack). */
  reflectCap: 1.5,
  /** Nightglass Archive: mark duration in turns. */
  markTurns: 2,
  /** D-493 B3b Tempest Return Chronarch: every this-many critical damaging actions grant its Convergent Light bonus. */
  critCycle: 3,
} as const;
/** D-493 B4 fixed rules (C12): Choir-Array of Branded Stars triggers at most this many times per encounter. */
export const radiantCalamiticRules = { markTriggers: 4 } as const;
export const pair = (kind: RadiantConduitEffect, amount: number, related: RadiantConduitEffect, extra: number): RadiantConduitDesign =>
  [effect(kind, amount), effect(related, extra)];

// Stable-ID design decisions. D-493 restores the pre-Radiant (Phase Zero) effects batch by batch
// (B1 Common + Rare, B2 Legendary, B3a, B3b and B3c Omnic, B4 Calamitic in 4c; C1 x0.2 rescale on always-on Health/Defense/Attack). Rows not yet
// restored keep their Radiant-era designs.
// Fractions are ratios and charge values are whole personal charge.
export const radiantConduits = {
  'vigil-core': [effect('hp', .2)],
  'siegebound-drive': pair('attack', .07, 'skill-efficiency', .05),
  'bastion-lock': pair('defense', .07, 'skill-power', .25),
  'parallax-relay': pair('hp', .1, 'flare', .1),
  'fracture-reservoir': [effect('capacity', .4)],
  'prism-splinter-socket': pair('gauge-gain', .075, 'skill-efficiency', .05),
  'precision-escapement': [effect('crit-damage', .1)],
  'fieldbrace-coupler': [effect('crit-rate', .25)],
  'reserve-torque-crank': pair('capacity', .25, 'gauge-gain', .1),
  'crosspin-governor': [effect('skill-power', .4)],
  'aegis-capacitor': pair('hp', .15, 'defense', .15),
  'duplex-heart': [effect('ally-heal-self', .05)],
  'falcon-sight': pair('hp', .09, 'crit-rate', .25),
  'spearwheel-engine': [effect('skill-pierce', .1)],
  'springwell-pump': [effect('restore-power', .2)],
  'twinpulse-bellows': [effect('twin-charge', 7)],
  'glassroot-gimbal': [effect('health-skill-power', .05)],
  'lifeline-flywheel': [effect('drain', .1)],
  'sentinel-aperture': [effect('skill1-power', .99)],
  'wardglass-transformer': [effect('crit-damage', .35), fixedEffect('defense', -.07)],
  'hammerbalance-link': pair('attack', .17, 'crit-damage', .15),
  'breach-pendulum': [effect('enemy-defense', .1)],
  'coilfeed-ratchet': [effect('skill-efficiency', .08), effect('skill-power', .08), effect('crit-rate', .08)],
  'opal-indexer': [effect('debuff-power', .75), fixedEffect('debuff-duration', 1)],
  'resonance-crucible': [effect('defense', .15), effect('hp', .1), fixedEffect('skill-duration', 1)],
  'astral-prism': [effect('hp', .1), effect('crit-rate', .3), effect('crit-damage', .25)],
  'citadel-spine': [effect('attack', .15), effect('gauge-gain', .07), effect('ally-guard', .35)],
  'execution-orrery': pair('skill2-power', .99, 'skill2-efficiency', .1),
  'immortal-vessel': pair('hp', .5, 'defense', .15),
  'judgment-lens': pair('skill-crit-damage', .5, 'support-power', .5),
  'worldbreaker-drive': pair('flare-power', .99, 'direct', .65),
  'siege-cantilever': [effect('aoe-power', 1.5)],
  'nullsong-transmission': [effect('gamble-power', .75)],
  'horizon-heartcase': [effect('flare-crit-damage', .35), effect('flare-crit-rate', .1), effect('reserve-health', .2), effect('reserve-defense', .1)],
  'stasis-reliquary': [steppedEffect('last-block', .1, .02)],
  'granite-hourglass': [effect('phase-shield', .3)],
  'pale-bulwark-diadem': [effect('shield-guard', .5)],
  'starvein-conductor': pair('prism-efficiency', .35, 'prism-gain', .1),
  'meridian-inverter': [effect('restore-charge', 4)],
  'verdict-caliper': [effect('crit-heal', .25)],
  'infernic-phoenix-reactor': [effect('squad-hp', .11), effect('revive', .35), effect('revive-shield', .15)],
  'aquatic-leviathan-pump': [effect('defense', .09), effect('crit-rate', .25), effect('shield-charge', 5)],
  'tectonic-atlas-bastion': [fixedEffect('taunt', 1), effect('taunt-charge', 4)],
  'efflorescent-worldtree-heart': [effect('hp', .28), effect('skill-power', .35), effect('overheal-shield', .6)],
  'voltaic-thunderbird-coil': [effect('attack', .19), effect('crit-damage', .45), effect('crit-skill-strike', .4), effect('crit-skill-ally-crit', .2)],
  'atmospheric-griffin-turbine': pair('attack', .198, 'team-charge', 10),
  'luminous-seraph-mirror': pair('first-crit-heal', .06, 'squad-hp', .13),
  'ominous-eclipse-mantle': [effect('skill-power', .35), effect('flare', .45), effect('weakened-pierce', .35), effect('weakened-ally-power', .2)],
  'tranquilitic-kirin-cradle': [effect('defense', .13), effect('attack', .4), effect('defense-heal', 1)],
  'chaotic-ouroboros-core': [effect('capacity', .4), effect('flare-shield', .1), effect('squad-hp', .11)],
  'infernic-cinder-testament': [effect('burn-amp', .2)],
  'aquatic-undertide-chronometer': [effect('defense', .14), effect('skill-efficiency', .3), fixedEffect('weaken-duration', 1), effect('weaken-ally-efficiency', .15)],
  'tectonic-faultkeeper-loom': [effect('defense', .15), effect('skill-power', .55), effect('ally-defense-share', .25)],
  'efflorescent-verdant-covenant': [effect('hp', .19), effect('gauge-gain', .25), effect('heal-ally-power', .3)],
  'voltaic-stormstep-dynamo': [effect('attack', .14), effect('skill-efficiency', .25), effect('alternate-power', .3), effect('alternate-ally-efficiency', .15)],
  'atmospheric-skythread-rudder': [effect('capacity', .6), effect('gauge-gain', .35), effect('normal-ally-efficiency', .25)],
  'luminous-dawn-witness-array': [effect('miss-ally-crit', .15), effect('miss-self-crit-damage', .3), effect('miss-self-direct', 2)],
  'ominous-nightglass-archive': pair('squad-attack', .4, 'skill-mark', .5),
  'tranquilitic-stillhour-carillon': [effect('hp', .24), effect('gauge-gain', .3), effect('flare-round-heal', .08), effect('flare-round-charge', 10)],
  'chaotic-paradox-spindle': [effect('defense', .07), effect('skill-efficiency', .2), effect('flare-team-power', .4), effect('flare-team-efficiency', .2)],
  'clearwater-manifold': [effect('oceanic-power', .35)],
  'tranquilitic-accord-bastion': [effect('hp', .17), effect('skill-efficiency', .2), effect('accord-efficiency', .25)],
  'aegis-return-spring': [effect('defense', .18), effect('crit-damage', .4), effect('skill-shield-crit', .2), effect('skill-shield-brace', .3)],
  'flare-focusing-iris': [effect('attack', .11), fixedEffect('burn-duration', 1), effect('burn-skill-power', .8), effect('burn-ally-crit', .2)],
  'cinder-metering-nozzle': [effect('attack', .45), fixedEffect('burn-transfer', 1)],
  'firstlight-cam': [effect('hp', .07), effect('skill-power', .45), effect('squad-gain', .5), effect('squad-defense', .08)],
  'tension-governor': [effect('skill-efficiency', .25), effect('squad-hp', .11), effect('weaken-guard', .3), effect('weaken-heal', .06)],
  'tidebound-reflector': pair('attack', .25, 'shield-reflect', .4),
  'ward-stitch-spool': [effect('defense', .11), effect('skill-power', .55), effect('shielded-restore-power', .3)],
  'emberlife-kiln': [effect('skill-power', .55), effect('capacity', .4), effect('burning-attack', 1), effect('burn-tick-heal', .08)],
  'tempered-strike-link': [effect('attack', .2), effect('crit-rate', .1), effect('healed-attack', .4), effect('healer-efficiency', .2)],
  'infernic-pyre-census': [effect('hp', .05), effect('skill-power', .55), effect('census-power', .2)],
  'chaotic-fault-verdict': [effect('hp', .11), effect('flare', .7), effect('shielded-crit-damage', .5), effect('first-crit-provider-power', .2)],
  'ruinselect-prism': pair('ruin-power', .55, 'ruin-defense', .04),
  'secondbeat-rack': [effect('hp', .07), effect('crit-rate', .15), effect('followup-power', .35), effect('followup-charge', 8)],
  'oceanic-shared-tide-pump': [effect('hp', .13), effect('skill-efficiency', .3), effect('shield-echo', .5)],
  'pulse-trigger-pawl': [effect('skill-power', .65), effect('crit-rate', .4), effect('first-crit-skill-charge', 8)],
  'solace-anchor': [effect('attack', .16), effect('crit-damage', .35), effect('first-turn-attack', .2)],
  'sootwake-crucible': [effect('skill-power', .75), effect('crit-damage', .25), effect('burn-ally-power', .3)],
  'atmospheric-storm-clock': [effect('crit-rate', .35), effect('capacity', .75), effect('third-crit-flare-efficiency', .25)],
  'pressurecrest-governor': [effect('defense', .17), effect('crit-rate', .3), effect('first-crit-skill-shield', .15)],
  'covercharge-drum': [effect('skill-power', .6), effect('capacity', .5), effect('relay-power', .2), effect('relay-efficiency', .15)],
  'botanic-graft-covenant': [effect('hp', .22), effect('skill-efficiency', .2), effect('low-heal-power', .5), effect('lift-guard', .3)],
  'mending-valve': [effect('attack', .17), effect('skill-power', .4), effect('skill-drain-ally', .15)],
  'rootbound-triage-vault': [effect('hp', .14), effect('defense', .12), effect('turn-restore-efficiency', .25), effect('turn-restore-power', .35)],
  // D-493 B4 (Calamitic): pre-Radiant effects, C1 x0.2 on always-on Health/Defense, real crits on Cathedral.
  'calamitic-world-eater-orrery': [fixedEffect('skill-duration', 3), effect('debuff-power', 1.25)],
  'calamitic-causality-funeral-engine': [steppedEffect('skill-efficiency', .5, .02), effect('flare', 1.25)],
  'calamitic-horizon-cleaving-godpress': pair('defense', .15, 'skill-pierce', .55),
  'calamitic-throne-borrowed-tomorrows': [effect('hp', .09), effect('defense', .09), fixedEffect('flare-extra-skill', 1)],
  'calamitic-cathedral-final-equation': [effect('skill-efficiency', .65), effect('crit-rate', 2.5), effect('crit-damage', 1.2)],
  'calamitic-bulwark-of-the-last-horizon': [effect('hp', .4), effect('defense', .4), effect('shield-guard', .167)],
  'calamitic-reliquary-of-unending-mercy': pair('restore-power', .833, 'restore-efficiency', .233),
  'calamitic-aegis-engine-of-severed-fate': pair('skill-power', .5, 'shield-guard', .367),
  'calamitic-monolith-of-the-unmoved-star': pair('defense', .667, 'skill-efficiency', .1),
  'calamitic-heartforge-of-the-sunless-dawn': pair('hp', .667, 'skill-power', .167),
  'calamitic-ruinmark-censer': [effect('defense', .1), effect('skill-power', .4), effect('weaken-vulnerability', .1)],
  'calamitic-choir-array-of-branded-stars': [effect('hp', .093), effect('defense', .093), effect('mark-team-power', .333), effect('mark-team-charge', 6.7)],
  'calamitic-throne-of-the-lone-apostate': [effect('lone-defense', .333), effect('lone-hp', .333), effect('lone-power', .833)],
  'calamitic-worldbreaker-cannonade': [effect('aoe-power', 1.667)],
} as const satisfies Record<ConduitId, RadiantConduitDesign>;

export interface RadiantGearSlot { id: ConduitId; rank: number }
export type RadiantGear = (RadiantGearSlot | null)[];
export function validateRadiantGear(value: unknown, element: ElementId): RadiantGear {
  if (!Array.isArray(value)) throw new Error('Invalid radiant gear.');
  const ids = value.map(slot => {
    if (slot === null) return null;
    if (!slot || typeof slot !== 'object' || Object.keys(slot).length !== 2 ||
        !Object.hasOwn(slot, 'id') || !Object.hasOwn(slot, 'rank'))
      throw new Error('Invalid radiant gear slot.');
    validateConduitUpgradeLevel(slot.rank);
    return slot.id;
  });
  validateConduitElement(validateConduitSlots(ids), element);
  return value.map(slot => slot === null ? null : { id: slot.id, rank: slot.rank });
}
export function radiantConduitPrimitives(slot: RadiantGearSlot): RadiantConduitPrimitive[] {
  getConduit(slot.id);
  validateConduitUpgradeLevel(slot.rank);
  return (radiantConduits[slot.id] as RadiantConduitDesign).map(entry => entry.fixed
    ? { kind: entry.kind, amount: entry.amount, fixed: true as const }
    : entry.step !== undefined ? { kind: entry.kind, amount: entry.amount + entry.step * slot.rank, step: entry.step }
      : { kind: entry.kind, amount: entry.amount * (1 + .1 * slot.rank) });
}
export function radiantGearAmount(gear: RadiantGear | undefined, kind: RadiantConduitEffect): number {
  return (gear ?? []).flatMap(slot => slot === null ? [] : radiantConduitPrimitives(slot))
    .filter(entry => entry.kind === kind).reduce((total, entry) => total + entry.amount, 0);
}
