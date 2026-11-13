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
  | 'normal-weaken' | 'cooperation' | 'next-buff' | 'status-shield';
export interface RadiantConduitPrimitive { kind: RadiantConduitEffect; amount: number }
type Design = readonly RadiantConduitPrimitive[];
const effect = (kind: RadiantConduitEffect, amount: number): RadiantConduitPrimitive => ({ kind, amount });
const pair = (kind: RadiantConduitEffect, amount: number, related: RadiantConduitEffect, extra: number): Design =>
  [effect(kind, amount), effect(related, extra)];

// Stable-ID design decisions. Fractions are ratios and charge values are whole personal charge.
export const radiantConduits = {
  'vigil-core': [effect('hp', .2)],
  'siegebound-drive': pair('normal', .12, 'attack', .04),
  'bastion-lock': pair('defense', .15, 'guard', .03),
  'parallax-relay': pair('hp', .12, 'flare', .05),
  'fracture-reservoir': [effect('attack', .08)],
  'prism-splinter-socket': pair('recovery', .08, 'defense', .04),
  'precision-escapement': [effect('normal', .1)],
  'fieldbrace-coupler': [effect('resilience', .1)],
  'reserve-torque-crank': pair('defense', .08, 'attack', .04),
  'crosspin-governor': [effect('flare', .12)],
  'aegis-capacitor': pair('defense', .25, 'hp', .18),
  'duplex-heart': pair('healing', .15, 'recovery', .15),
  'falcon-sight': pair('normal', .18, 'hp', .12),
  'spearwheel-engine': pair('pierce', .12, 'flare', .08),
  'springwell-pump': pair('healing', .2, 'shielding', .2),
  'twinpulse-bellows': pair('normal', .2, 'recovery', .1),
  'glassroot-gimbal': pair('hp', .22, 'flare', .16),
  'lifeline-flywheel': [effect('recovery', .25)],
  'sentinel-aperture': [effect('flare', .24)],
  'wardglass-transformer': pair('shielding', .25, 'resilience', .12),
  'hammerbalance-link': pair('normal', .25, 'attack', .08),
  'breach-pendulum': [effect('pierce', .12)],
  'coilfeed-ratchet': pair('attack', .15, 'flare', .1),
  'opal-indexer': pair('resilience', .15, 'flare', .16),
  'resonance-crucible': pair('defense', .25, 'hp', .2),
  'astral-prism': pair('flare', .35, 'attack', .2),
  'citadel-spine': pair('hp', .25, 'defense', .35),
  'execution-orrery': pair('normal', .4, 'pierce', .16),
  'immortal-vessel': pair('hp', .4, 'recovery', .2),
  'judgment-lens': pair('flare', .4, 'normal', .2),
  'worldbreaker-drive': pair('normal', .45, 'attack', .15),
  'siege-cantilever': pair('flare', .45, 'pierce', .12),
  'nullsong-transmission': pair('normal', .35, 'resilience', .2),
  'horizon-heartcase': pair('hp', .45, 'defense', .15),
  'stasis-reliquary': pair('guard', .12, 'recovery', .25),
  'granite-hourglass': pair('defense', .4, 'guard', .08),
  'pale-bulwark-diadem': pair('shielding', .4, 'defense', .25),
  'starvein-conductor': pair('attack', .2, 'cooperation', .2),
  'meridian-inverter': pair('recovery', .4, 'healing', .25),
  'verdict-caliper': pair('recovery', .3, 'normal', .25),
  'infernic-phoenix-reactor': pair('hp', .55, 'recovery', .3),
  'aquatic-leviathan-pump': pair('hp', .4, 'defense', .4),
  'tectonic-atlas-bastion': pair('guard', .15, 'defense', .5),
  'efflorescent-worldtree-heart': pair('healing', .5, 'shielding', .3),
  'voltaic-thunderbird-coil': pair('normal', .55, 'pierce', .25),
  'atmospheric-griffin-turbine': pair('attack', .3, 'normal', .4),
  'luminous-seraph-mirror': pair('recovery', .4, 'healing', .35),
  'ominous-eclipse-mantle': pair('pierce', .3, 'flare', .45),
  'tranquilitic-kirin-cradle': pair('healing', .5, 'recovery', .4),
  'chaotic-ouroboros-core': pair('shielding', .4, 'attack', .3),
  'infernic-cinder-testament': pair('attack', .35, 'cooperation', .25),
  'aquatic-undertide-chronometer': pair('resilience', .3, 'recovery', .4),
  'tectonic-faultkeeper-loom': pair('leader', .12, 'defense', .45),
  'efflorescent-verdant-covenant': pair('recovery', .3, 'healing', .4),
  'voltaic-stormstep-dynamo': pair('attack', .3, 'flare', .45),
  'atmospheric-skythread-rudder': pair('normal', .35, 'cooperation', .3),
  'luminous-dawn-witness-array': pair('attack', .3, 'normal', .4),
  'ominous-nightglass-archive': pair('pierce', .22, 'cooperation', .3),
  'tranquilitic-stillhour-carillon': pair('healing', .45, 'recovery', .4),
  'chaotic-paradox-spindle': pair('attack', .35, 'flare', .4),
  'clearwater-manifold': pair('cooperation', .35, 'healing', .35),
  'tranquilitic-accord-bastion': pair('recovery', .35, 'shielding', .45),
  'aegis-return-spring': pair('guard', .15, 'shielding', .4),
  'flare-focusing-iris': pair('attack', .3, 'flare', .4),
  'cinder-metering-nozzle': pair('attack', .35, 'normal', .35),
  'firstlight-cam': pair('attack', .3, 'leader', .1),
  'tension-governor': pair('shielding', .45, 'resilience', .3),
  'tidebound-reflector': pair('guard', .2, 'defense', .35),
  'ward-stitch-spool': pair('shielding', .55, 'healing', .35),
  'emberlife-kiln': pair('attack', .3, 'healing', .4),
  'tempered-strike-link': pair('recovery', .4, 'normal', .35),
  'infernic-pyre-census': pair('cooperation', .4, 'flare', .4),
  'chaotic-fault-verdict': pair('normal', .6, 'defense', .35),
  'ruinselect-prism': pair('hp', .5, 'flare', .5),
  'secondbeat-rack': pair('cooperation', .45, 'flare', .4),
  'oceanic-shared-tide-pump': pair('hp', .35, 'shielding', .4),
  'pulse-trigger-pawl': pair('attack', .35, 'normal', .35),
  'solace-anchor': pair('recovery', .4, 'leader', .1),
  'sootwake-crucible': pair('pierce', .25, 'attack', .35),
  'atmospheric-storm-clock': pair('normal', .45, 'attack', .3),
  'pressurecrest-governor': pair('recovery', .4, 'attack', .25),
  'covercharge-drum': pair('attack', .4, 'flare', .4),
  'botanic-graft-covenant': pair('healing', .6, 'recovery', .35),
  'mending-valve': pair('healing', .35, 'recovery', .4),
  'rootbound-triage-vault': pair('shielding', .5, 'healing', .3),
  'calamitic-world-eater-orrery': pair('flare', .8, 'pierce', .4),
  'calamitic-causality-funeral-engine': pair('attack', .6, 'flare', .6),
  'calamitic-horizon-cleaving-godpress': pair('normal', .9, 'pierce', .4),
  'calamitic-throne-borrowed-tomorrows': pair('normal', .7, 'flare', .5),
  'calamitic-cathedral-final-equation': pair('flare', .85, 'cooperation', .5),
  'calamitic-bulwark-of-the-last-horizon': pair('hp', .8, 'shielding', .6),
  'calamitic-reliquary-of-unending-mercy': pair('healing', .9, 'recovery', .6),
  'calamitic-aegis-engine-of-severed-fate': pair('shielding', .9, 'guard', .25),
  'calamitic-monolith-of-the-unmoved-star': pair('defense', .8, 'shielding', .6),
  'calamitic-heartforge-of-the-sunless-dawn': pair('hp', .8, 'defense', .45),
  'calamitic-ruinmark-censer': pair('attack', .65, 'pierce', .3),
  'calamitic-choir-array-of-branded-stars': pair('leader', .2, 'attack', .6),
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
