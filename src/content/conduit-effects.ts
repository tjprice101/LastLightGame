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
  | 'skill-direct' | 'support-power' | 'restore-charge' | 'gamble-power' | 'shield-guard' | 'aoe-power'
  | 'prism-efficiency' | 'prism-gain' | 'last-block' | 'exposed-heal' | 'flare-power';
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
/** D-493 C12: Glassroot Gimbal's Health step (fixed at every rank). */
export const radiantHealthSkillPowerStep = 450;
export const pair = (kind: RadiantConduitEffect, amount: number, related: RadiantConduitEffect, extra: number): RadiantConduitDesign =>
  [effect(kind, amount), effect(related, extra)];

// Stable-ID design decisions. D-493 restores the pre-Radiant (Phase Zero) effects batch by batch
// (B1 Common + Rare and B2 Legendary in 4c; C1 x0.2 rescale on always-on Health/Defense/Attack). Rows not yet
// restored keep their Radiant-era designs.
// Fractions are ratios and charge values are whole personal charge.
export const radiantConduits = {
  'vigil-core': [effect('hp', .2)],
  'siegebound-drive': pair('attack', .07, 'skill-efficiency', .05),
  'bastion-lock': pair('defense', .07, 'skill-power', .25),
  'parallax-relay': pair('hp', .1, 'flare', .1),
  'fracture-reservoir': [effect('capacity', .4)],
  'prism-splinter-socket': pair('gauge-gain', .075, 'skill-efficiency', .05),
  'precision-escapement': [effect('direct', .025)],
  'fieldbrace-coupler': [effect('direct', .125)],
  'reserve-torque-crank': pair('capacity', .25, 'gauge-gain', .1),
  'crosspin-governor': [effect('skill-power', .4)],
  'aegis-capacitor': pair('hp', .15, 'defense', .15),
  'duplex-heart': [effect('ally-heal-self', .05)],
  'falcon-sight': pair('hp', .09, 'direct', .125),
  'spearwheel-engine': [effect('skill-pierce', .1)],
  'springwell-pump': [effect('restore-power', .2)],
  'twinpulse-bellows': [effect('twin-charge', 7)],
  'glassroot-gimbal': [effect('health-skill-power', .05)],
  'lifeline-flywheel': [effect('drain', .1)],
  'sentinel-aperture': [effect('skill1-power', .99)],
  'wardglass-transformer': [effect('direct', .0875), fixedEffect('defense', -.07)],
  'hammerbalance-link': pair('attack', .17, 'direct', .0375),
  'breach-pendulum': [effect('enemy-defense', .1)],
  'coilfeed-ratchet': [effect('skill-efficiency', .08), effect('skill-power', .08), effect('direct', .04)],
  'opal-indexer': [effect('debuff-power', .75), fixedEffect('debuff-duration', 1)],
  'resonance-crucible': [effect('defense', .15), effect('hp', .1), fixedEffect('skill-duration', 1)],
  'astral-prism': pair('hp', .1, 'direct', .2125),
  'citadel-spine': [effect('attack', .15), effect('gauge-gain', .07), effect('ally-guard', .35)],
  'execution-orrery': pair('skill2-power', .99, 'skill2-efficiency', .1),
  'immortal-vessel': pair('hp', .5, 'defense', .15),
  'judgment-lens': pair('skill-direct', .125, 'support-power', .5),
  'worldbreaker-drive': pair('flare-power', .99, 'direct', .65),
  'siege-cantilever': [effect('aoe-power', 1.5)],
  'nullsong-transmission': [effect('gamble-power', .75)],
  'horizon-heartcase': [effect('flare', .1375), effect('reserve-health', .2), effect('reserve-defense', .1)],
  'stasis-reliquary': [steppedEffect('last-block', .1, .02)],
  'granite-hourglass': [effect('phase-shield', .3)],
  'pale-bulwark-diadem': [effect('shield-guard', .5)],
  'starvein-conductor': pair('prism-efficiency', .35, 'prism-gain', .1),
  'meridian-inverter': [effect('restore-charge', 4)],
  'verdict-caliper': [effect('exposed-heal', .25)],
  'infernic-phoenix-reactor': pair('break-heal', .4, 'hurt-shield', .08),
  'aquatic-leviathan-pump': pair('absorbed-charge', 8, 'hurt-heal', .35),
  'tectonic-atlas-bastion': pair('normal-reduction', .15, 'guard-team-shield', .4),
  'efflorescent-worldtree-heart': pair('heal-shield', .5, 'round-heal', .25),
  'voltaic-thunderbird-coil': pair('normal-splash', .4, 'opening', .25),
  'atmospheric-griffin-turbine': pair('team-charge', 3, 'normal', .25),
  'luminous-seraph-mirror': pair('normal-heal', .4, 'normal-splash', .2),
  'ominous-eclipse-mantle': pair('weakened', .4, 'pierce', .2),
  'tranquilitic-kirin-cradle': pair('normal-heal', .5, 'recovery', .25),
  'chaotic-ouroboros-core': pair('flare-shield', .06, 'shielded', .3),
  'infernic-cinder-testament': pair('burn-power', .45, 'normal-burn', .12),
  'aquatic-undertide-chronometer': pair('normal-weaken', .2, 'guard-charge', 6),
  'tectonic-faultkeeper-loom': pair('guard-team-shield', .6, 'defense', .25),
  'efflorescent-verdant-covenant': pair('heal-buff', .2, 'heal-charge', 5),
  'voltaic-stormstep-dynamo': pair('cooperation', .4, 'flare-team-charge', 8),
  'atmospheric-skythread-rudder': pair('normal-charge', 5, 'next-buff', .15),
  'luminous-dawn-witness-array': pair('opening', .35, 'normal-shield', .5),
  'ominous-nightglass-archive': pair('normal-expose', .18, 'cooperation', .35),
  'tranquilitic-stillhour-carillon': pair('flare-team-charge', 10, 'round-charge', 3),
  'chaotic-paradox-spindle': pair('normal', .3, 'flare-team-charge', 8),
  'clearwater-manifold': pair('team-charge', 3, 'heal-team-charge', 4),
  'tranquilitic-accord-bastion': pair('heal-shield', .6, 'hurt-heal', .3),
  'aegis-return-spring': pair('shielding', .35, 'break-heal', .3),
  'flare-focusing-iris': pair('burn-power', .35, 'flare', .3),
  'cinder-metering-nozzle': pair('normal-burn', .15, 'normal-splash', .25),
  'firstlight-cam': pair('start-charge', 20, 'shelter', .15),
  'tension-governor': pair('normal-weaken', .2, 'status-shield', .5),
  'tidebound-reflector': pair('reflect', .5, 'defense', .3),
  'ward-stitch-spool': pair('healing', .3, 'heal-shield', .5),
  'emberlife-kiln': pair('burn-heal', .25, 'burn-power', .25),
  'tempered-strike-link': pair('burning', .4, 'normal', .2),
  'infernic-pyre-census': pair('burning', .35, 'cooperation', .3),
  'chaotic-fault-verdict': pair('shielded', .4, 'pierce', .2),
  'ruinselect-prism': pair('wounded', .45, 'leech', .12),
  'secondbeat-rack': pair('weakened', .3, 'kill-charge', 12),
  'oceanic-shared-tide-pump': pair('guard-team-shield', .5, 'absorbed-charge', 6),
  'pulse-trigger-pawl': pair('normal-charge', 4, 'exposed', .3),
  'solace-anchor': pair('round-charge', 4, 'normal-heal', .3),
  'sootwake-crucible': pair('burning', .3, 'next-buff', .2),
  'atmospheric-storm-clock': pair('normal-charge', 4, 'cooperation', .3),
  'pressurecrest-governor': pair('normal-reduction', .18, 'first-action', .25),
  'covercharge-drum': pair('hurt-heal', .3, 'hurt-charge', 8),
  'botanic-graft-covenant': pair('healing', .35, 'round-heal', .3),
  'mending-valve': pair('kill-heal', .1, 'recovery', .25),
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
