import {
  getConduit, validateConduitElement, validateConduitSlots, validateConduitUpgradeLevel,
  type ConduitId,
} from './conduits';
import type { ElementId } from './activities';

export type RadiantConduitEffect =
  | 'hp' | 'attack' | 'defense' | 'recovery' | 'normal' | 'flare' | 'pierce'
  | 'healing' | 'shielding' | 'resilience' | 'guard' | 'leader'
  | 'normal-charge' | 'guard-charge' | 'shared-normal' | 'team-charge'
  | 'guard-shield' | 'normal-heal' | 'leech' | 'heal-charge' | 'heal-buff'
  | 'absorbed-charge' | 'reflect' | 'hurt-shield' | 'flare-shield'
  | 'round-heal' | 'round-shield' | 'normal-burn' | 'normal-expose'
  | 'normal-weaken' | 'cooperation' | 'next-buff' | 'status-shield';
export interface RadiantConduitPrimitive { kind: RadiantConduitEffect; amount: number }
type Design = readonly RadiantConduitPrimitive[];
const effect = (kind: RadiantConduitEffect, amount: number): RadiantConduitPrimitive => ({ kind, amount });
const pair = (kind: RadiantConduitEffect, amount: number, related: RadiantConduitEffect, extra: number): Design =>
  [effect(kind, amount), effect(related, extra)];

// Stable-ID design decisions. Fractions are ratios, charge values are whole personal
// charge, and shared-normal values are exact 60-unit shared-charge increments.
export const radiantConduits = {
  'vigil-core': [effect('hp', .2)],
  'siegebound-drive': pair('normal', .12, 'attack', .04),
  'bastion-lock': pair('defense', .15, 'guard', .03),
  'parallax-relay': pair('hp', .12, 'flare', .05),
  'fracture-reservoir': [effect('normal-charge', 3)],
  'prism-splinter-socket': pair('normal-charge', 2, 'guard-charge', 1),
  'precision-escapement': [effect('normal', .1)],
  'fieldbrace-coupler': [effect('resilience', .1)],
  'reserve-torque-crank': pair('guard-charge', 3, 'normal-charge', 1),
  'crosspin-governor': [effect('flare', .12)],
  'aegis-capacitor': pair('defense', .25, 'hp', .18),
  'duplex-heart': pair('heal-charge', 4, 'recovery', .15),
  'falcon-sight': pair('normal', .18, 'hp', .12),
  'spearwheel-engine': pair('pierce', .12, 'flare', .08),
  'springwell-pump': pair('healing', .2, 'shielding', .2),
  'twinpulse-bellows': pair('normal', .2, 'leech', .04),
  'glassroot-gimbal': pair('hp', .22, 'flare', .16),
  'lifeline-flywheel': [effect('leech', .1)],
  'sentinel-aperture': [effect('flare', .24)],
  'wardglass-transformer': pair('shielding', .25, 'resilience', .12),
  'hammerbalance-link': pair('normal', .25, 'attack', .08),
  'breach-pendulum': [effect('normal-expose', .12)],
  'coilfeed-ratchet': pair('normal-charge', 5, 'flare', .1),
  'opal-indexer': pair('normal-weaken', .12, 'flare', .16),
  'resonance-crucible': pair('defense', .25, 'hp', .2),
  'astral-prism': pair('flare', .35, 'normal-charge', 6),
  'citadel-spine': pair('guard-shield', .6, 'defense', .35),
  'execution-orrery': pair('normal', .4, 'pierce', .16),
  'immortal-vessel': pair('hp', .4, 'round-heal', .15),
  'judgment-lens': pair('flare', .4, 'normal', .2),
  'worldbreaker-drive': pair('normal', .45, 'attack', .15),
  'siege-cantilever': pair('flare', .45, 'pierce', .12),
  'nullsong-transmission': pair('normal', .35, 'resilience', .2),
  'horizon-heartcase': pair('hp', .45, 'hurt-shield', .05),
  'stasis-reliquary': pair('guard', .12, 'absorbed-charge', 6),
  'granite-hourglass': pair('defense', .4, 'guard', .08),
  'pale-bulwark-diadem': pair('shielding', .4, 'defense', .25),
  'starvein-conductor': pair('team-charge', 4, 'cooperation', .2),
  'meridian-inverter': pair('recovery', .4, 'healing', .25),
  'verdict-caliper': pair('normal-heal', .4, 'normal', .25),
  'infernic-phoenix-reactor': pair('hp', .55, 'round-heal', .3),
  'aquatic-leviathan-pump': pair('absorbed-charge', 10, 'defense', .4),
  'tectonic-atlas-bastion': pair('guard-shield', 1, 'defense', .5),
  'efflorescent-worldtree-heart': pair('healing', .5, 'flare-shield', .08),
  'voltaic-thunderbird-coil': pair('normal', .55, 'pierce', .25),
  'atmospheric-griffin-turbine': pair('team-charge', 8, 'normal', .4),
  'luminous-seraph-mirror': pair('normal-heal', .7, 'healing', .35),
  'ominous-eclipse-mantle': pair('pierce', .3, 'flare', .45),
  'tranquilitic-kirin-cradle': pair('normal-heal', 1, 'recovery', .4),
  'chaotic-ouroboros-core': pair('flare-shield', .1, 'normal-charge', 8),
  'infernic-cinder-testament': pair('normal-burn', .25, 'cooperation', .25),
  'aquatic-undertide-chronometer': pair('normal-weaken', .2, 'heal-charge', 8),
  'tectonic-faultkeeper-loom': pair('leader', .12, 'defense', .45),
  'efflorescent-verdant-covenant': pair('heal-buff', .3, 'healing', .4),
  'voltaic-stormstep-dynamo': pair('normal-charge', 9, 'flare', .45),
  'atmospheric-skythread-rudder': pair('team-charge', 10, 'cooperation', .3),
  'luminous-dawn-witness-array': pair('next-buff', .3, 'normal', .4),
  'ominous-nightglass-archive': pair('normal-expose', .22, 'cooperation', .3),
  'tranquilitic-stillhour-carillon': pair('round-heal', .55, 'recovery', .4),
  'chaotic-paradox-spindle': pair('next-buff', .35, 'shared-normal', 120),
  'clearwater-manifold': pair('cooperation', .35, 'healing', .35),
  'tranquilitic-accord-bastion': pair('heal-buff', .35, 'shielding', .45),
  'aegis-return-spring': pair('reflect', .3, 'shielding', .4),
  'flare-focusing-iris': pair('normal-burn', .3, 'flare', .4),
  'cinder-metering-nozzle': pair('normal-burn', .35, 'normal', .35),
  'firstlight-cam': pair('team-charge', 12, 'leader', .1),
  'tension-governor': pair('status-shield', .8, 'normal-weaken', .18),
  'tidebound-reflector': pair('reflect', .4, 'defense', .35),
  'ward-stitch-spool': pair('shielding', .55, 'healing', .35),
  'emberlife-kiln': pair('normal-burn', .3, 'round-heal', .4),
  'tempered-strike-link': pair('heal-buff', .4, 'normal', .35),
  'infernic-pyre-census': pair('cooperation', .4, 'flare', .4),
  'chaotic-fault-verdict': pair('normal', .6, 'guard-shield', .7),
  'ruinselect-prism': pair('hp', .5, 'flare', .5),
  'secondbeat-rack': pair('cooperation', .45, 'flare', .4),
  'oceanic-shared-tide-pump': pair('flare-shield', .12, 'shielding', .4),
  'pulse-trigger-pawl': pair('team-charge', 12, 'normal', .35),
  'solace-anchor': pair('next-buff', .4, 'leader', .1),
  'sootwake-crucible': pair('normal-expose', .25, 'normal-burn', .2),
  'atmospheric-storm-clock': pair('shared-normal', 180, 'normal-charge', 7),
  'pressurecrest-governor': pair('normal-heal', .8, 'normal-charge', 7),
  'covercharge-drum': pair('next-buff', .4, 'flare', .4),
  'botanic-graft-covenant': pair('healing', .6, 'heal-charge', 10),
  'mending-valve': pair('leech', .2, 'recovery', .4),
  'rootbound-triage-vault': pair('round-shield', 1, 'round-heal', .3),
  'calamitic-world-eater-orrery': pair('flare', .8, 'pierce', .4),
  'calamitic-causality-funeral-engine': pair('normal-charge', 15, 'flare', .6),
  'calamitic-horizon-cleaving-godpress': pair('normal', .9, 'pierce', .4),
  'calamitic-throne-borrowed-tomorrows': pair('team-charge', 18, 'shared-normal', 240),
  'calamitic-cathedral-final-equation': pair('flare', .85, 'cooperation', .5),
  'calamitic-bulwark-of-the-last-horizon': pair('hp', .8, 'round-shield', 1.5),
  'calamitic-reliquary-of-unending-mercy': pair('healing', .9, 'round-heal', .9),
  'calamitic-aegis-engine-of-severed-fate': pair('shielding', .9, 'reflect', .6),
  'calamitic-monolith-of-the-unmoved-star': pair('defense', .8, 'guard-shield', 1.5),
  'calamitic-heartforge-of-the-sunless-dawn': pair('hp', .8, 'hurt-shield', .1),
  'calamitic-ruinmark-censer': pair('normal-burn', .6, 'normal-expose', .3),
  'calamitic-choir-array-of-branded-stars': pair('leader', .2, 'next-buff', .6),
  'calamitic-throne-of-the-lone-apostate': pair('attack', .6, 'normal', .7),
  'calamitic-worldbreaker-cannonade': pair('normal', 1, 'flare', .6),
} as const satisfies Record<ConduitId, Design>;

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
  return radiantConduits[slot.id].map(entry => ({
    kind: entry.kind, amount: entry.amount * (1 + .1 * slot.rank),
  }));
}
export function radiantGearAmount(gear: RadiantGear | undefined, kind: RadiantConduitEffect): number {
  return (gear ?? []).flatMap(slot => slot === null ? [] : radiantConduitPrimitives(slot))
    .filter(entry => entry.kind === kind).reduce((total, entry) => total + entry.amount, 0);
}
