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
  | 'burn-ally-crit' | 'skill-shield-crit';
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
} as const;
export const pair = (kind: RadiantConduitEffect, amount: number, related: RadiantConduitEffect, extra: number): RadiantConduitDesign =>
  [effect(kind, amount), effect(related, extra)];

// Stable-ID design decisions. D-493 restores the pre-Radiant (Phase Zero) effects batch by batch
// (B1 Common + Rare, B2 Legendary and B3a Omnic in 4c; C1 x0.2 rescale on always-on Health/Defense/Attack). Rows not yet
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
  'infernic-phoenix-reactor': pair('break-heal', .4, 'hurt-shield', .08),
  'aquatic-leviathan-pump': [effect('defense', .09), effect('crit-rate', .25), effect('shield-charge', 5)],
  'tectonic-atlas-bastion': pair('normal-reduction', .15, 'guard-team-shield', .4),
  'efflorescent-worldtree-heart': [effect('hp', .28), effect('skill-power', .35), effect('overheal-shield', .6)],
  'voltaic-thunderbird-coil': pair('normal-splash', .4, 'opening', .25),
  'atmospheric-griffin-turbine': pair('attack', .198, 'team-charge', 10),
  'luminous-seraph-mirror': pair('first-crit-heal', .06, 'squad-hp', .13),
  'ominous-eclipse-mantle': [effect('skill-power', .35), effect('flare', .45), effect('weakened-pierce', .35), effect('weakened-ally-power', .2)],
  'tranquilitic-kirin-cradle': [effect('defense', .13), effect('attack', .4), effect('defense-heal', 1)],
  'chaotic-ouroboros-core': [effect('capacity', .4), effect('flare-shield', .1), effect('squad-hp', .11)],
  'infernic-cinder-testament': [effect('burn-amp', .2)],
  'aquatic-undertide-chronometer': [effect('defense', .14), effect('skill-efficiency', .3), fixedEffect('weaken-duration', 1), effect('weaken-ally-efficiency', .15)],
  'tectonic-faultkeeper-loom': [effect('defense', .15), effect('skill-power', .55), effect('ally-defense-share', .25)],
  'efflorescent-verdant-covenant': pair('heal-buff', .2, 'heal-charge', 5),
  'voltaic-stormstep-dynamo': pair('cooperation', .4, 'flare-team-charge', 8),
  'atmospheric-skythread-rudder': pair('normal-charge', 5, 'next-buff', .15),
  'luminous-dawn-witness-array': pair('opening', .35, 'normal-shield', .5),
  'ominous-nightglass-archive': pair('squad-attack', .4, 'skill-mark', .5),
  'tranquilitic-stillhour-carillon': [effect('hp', .24), effect('gauge-gain', .3), effect('flare-round-heal', .08), effect('flare-round-charge', 10)],
  'chaotic-paradox-spindle': pair('normal', .3, 'flare-team-charge', 8),
  'clearwater-manifold': [effect('oceanic-power', .35)],
  'tranquilitic-accord-bastion': pair('heal-shield', .6, 'hurt-heal', .3),
  'aegis-return-spring': [effect('defense', .18), effect('crit-damage', .4), effect('skill-shield-crit', .2), effect('skill-shield-brace', .3)],
  'flare-focusing-iris': [effect('attack', .11), fixedEffect('burn-duration', 1), effect('burn-skill-power', .8), effect('burn-ally-crit', .2)],
  'cinder-metering-nozzle': [effect('attack', .45), fixedEffect('burn-transfer', 1)],
  'firstlight-cam': [effect('hp', .07), effect('skill-power', .45), effect('squad-gain', .5), effect('squad-defense', .08)],
  'tension-governor': [effect('skill-efficiency', .25), effect('squad-hp', .11), effect('weaken-guard', .3), effect('weaken-heal', .06)],
  'tidebound-reflector': pair('attack', .25, 'shield-reflect', .4),
  'ward-stitch-spool': [effect('defense', .11), effect('skill-power', .55), effect('shielded-restore-power', .3)],
  'emberlife-kiln': [effect('skill-power', .55), effect('capacity', .4), effect('burning-attack', 1), effect('burn-tick-heal', .08)],
  'tempered-strike-link': pair('burning', .4, 'normal', .2),
  'infernic-pyre-census': [effect('hp', .05), effect('skill-power', .55), effect('census-power', .2)],
  'chaotic-fault-verdict': pair('shielded', .4, 'pierce', .2),
  'ruinselect-prism': pair('ruin-power', .55, 'ruin-defense', .04),
  'secondbeat-rack': pair('weakened', .3, 'kill-charge', 12),
  'oceanic-shared-tide-pump': [effect('hp', .13), effect('skill-efficiency', .3), effect('shield-echo', .5)],
  'pulse-trigger-pawl': [effect('skill-power', .65), effect('crit-rate', .4), effect('first-crit-skill-charge', 8)],
  'solace-anchor': [effect('attack', .16), effect('crit-damage', .35), effect('first-turn-attack', .2)],
  'sootwake-crucible': pair('burning', .3, 'next-buff', .2),
  'atmospheric-storm-clock': pair('normal-charge', 4, 'cooperation', .3),
  'pressurecrest-governor': [effect('defense', .17), effect('crit-rate', .3), effect('first-crit-skill-shield', .15)],
  'covercharge-drum': pair('hurt-heal', .3, 'hurt-charge', 8),
  'botanic-graft-covenant': [effect('hp', .22), effect('skill-efficiency', .2), effect('low-heal-power', .5), effect('lift-guard', .3)],
  'mending-valve': [effect('attack', .17), effect('skill-power', .4), effect('skill-drain-ally', .15)],
  'rootbound-triage-vault': pair('heal-charge', 6, 'heal-shield', .5),
  'calamitic-world-eater-orrery': pair('solo', .65, 'flare', .5),
  'calamitic-causality-funeral-engine': pair('kill-charge', 20, 'execution', .6),
  'calamitic-horizon-cleaving-godpress': pair('opening', .6, 'normal', .5),
  'calamitic-throne-borrowed-tomorrows': pair('first-action', .6, 'round-charge', 6),
  'calamitic-cathedral-final-equation': pair('exposed', .6, 'flare-weaken', .25),
  'calamitic-bulwark-of-the-last-horizon': pair('hurt-shield', .12, 'guard-team-shield', .9),
  'calamitic-reliquary-of-unending-mercy': pair('round-team-heal', .2, 'heal-buff', .3),
  'calamitic-aegis-engine-of-severed-fate': pair('break-heal', .5, 'flare-shield', .1),
  'calamitic-monolith-of-the-unmoved-star': pair('shelter', .25, 'guard-shield', 1.2),
  'calamitic-heartforge-of-the-sunless-dawn': pair('hurt-heal', .6, 'hp', .5),
  'calamitic-ruinmark-censer': pair('normal-expose', .3, 'burn-power', .5),
  'calamitic-choir-array-of-branded-stars': pair('leader', .3, 'team-charge', 5),
  'calamitic-throne-of-the-lone-apostate': pair('wounded', .6, 'normal-reduction', .25),
  'calamitic-worldbreaker-cannonade': pair('normal-splash', .6, 'execution', .5),
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
