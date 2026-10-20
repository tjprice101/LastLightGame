import { type ElementId } from './activities';
import { kitConduitDesigns, convertedKitConduitIds } from './kit-conduits';
import { conduitOrigin } from './world-lore';
import { redesignEffect } from './conduit-redesign';
import { calamiticConduits, calamiticEffect, isCalamiticConduitId } from './calamitic-conduits';

export interface ConduitBuff {
 stat: 'health' | 'damage' | 'defense' | 'crit' | 'critMultiplier' | 'elementalDamage' | 'shatterCapacity';
 kind: 'percent' | 'percentage-points' | 'flat';
 amount: number;
}
type CommonConduitDesign = { id: string; name: string; rarity: 'Common'; price: number; power: string;
  effect: string; lore: string; buffs: readonly ConduitBuff[] };

export const commonConduits = [
  { id: 'vigil-core', name: 'Vigil Core', rarity: 'Common', price: 1000,
    power: 'Elemental Light', buffs: [{ stat: 'health', kind: 'percent', amount: 6 }], effect: redesignEffect('vigil-core'),
    lore: 'An emergency life-support mechanism from Let and Rise\'s shared prototype work, sealed beneath the battlefields of their later rivalry. Its protected chamber still holds a reserve of elemental energy.' },
  { id: 'siegebound-drive', name: 'Siegebound Drive', rarity: 'Common', price: 1200,
    power: 'Mechanical', buffs: [], effect: redesignEffect('siegebound-drive'),
    lore: 'A compact force-transmission engine once hidden inside siege harnesses. Its interlocking gears survived centuries in a buried armory.' },
  { id: 'bastion-lock', name: 'Bastion Lock', rarity: 'Common', price: 1000,
    power: 'Mechanical', buffs: [{ stat: 'defense', kind: 'percent', amount: 10 }], effect: redesignEffect('bastion-lock'),
    lore: 'A folding ward mechanism recovered from a forgotten defensive vault. Its layered plates were adapted from the creators\' shared prototypes into shields for the wars their rivalry provoked.' },
  { id: 'parallax-relay', name: 'Parallax Relay', rarity: 'Common', price: 1500,
    power: 'Elemental Light', buffs: [], effect: redesignEffect('parallax-relay'),
    lore: 'A concealed targeting relay with a split crystal lens. A trace of Elemental Light aligns its two sightlines with uncanny precision.' },
  { id: 'fracture-reservoir', name: 'Fracture Reservoir', rarity: 'Common', price: 1200,
    power: 'Elemental Light', buffs: [{ stat: 'shatterCapacity', kind: 'flat', amount: 10 }], effect: redesignEffect('fracture-reservoir'),
    lore: 'A sealed accumulator buried to keep it from the armies drawn into Let and Rise\'s rivalry. Elemental energy rests within its nested rings, waiting for a new bearer.' },
] as const satisfies readonly CommonConduitDesign[];

export const additionalCommonConduits = [
  { id: 'prism-splinter-socket', name: 'Prism Splinter Socket', rarity: 'Common', price: 1600,
    power: 'Elemental Light', buffs: [], effect: redesignEffect('prism-splinter-socket'),
    lore: 'A bronze triangular clamp preserves one split crystal, its paired facets still carrying a trace of Elemental Light.' },
  { id: 'precision-escapement', name: 'Precision Escapement', rarity: 'Common', price: 1800,
    power: 'Mechanical', buffs: [{ stat: 'critMultiplier', kind: 'percent', amount: 10 }], effect: redesignEffect('precision-escapement'),
    lore: 'A compact clock escapement turns an offset sight disc with measured force, preserving the timing of a perfect strike.' },
  { id: 'fieldbrace-coupler', name: 'Fieldbrace Coupler', rarity: 'Common', price: 1400,
    power: 'Mechanical', buffs: [],
    effect: redesignEffect('fieldbrace-coupler'), lore: 'Two bronze field braces close around a ceramic cushion, distributing strain across the bearer’s frame.' },
  { id: 'reserve-torque-crank', name: 'Reserve Torque Crank', rarity: 'Common', price: 1500,
    power: 'Mechanical', buffs: [],
    effect: redesignEffect('reserve-torque-crank'), lore: 'A folded hand-crank winds a sealed reserve cylinder, trading compact force for a steadier reserve.' },
  { id: 'crosspin-governor', name: 'Crosspin Governor', rarity: 'Common', price: 1500,
    power: 'Elemental Light', buffs: [],
    effect: redesignEffect('crosspin-governor'), lore: 'A bronze cross-shaped governor balances two armored counterweights around a stable central pin.' },
] as const satisfies readonly CommonConduitDesign[];

const expandedConduits = [
  { id: 'twinpulse-bellows', name: 'Twinpulse Bellows', rarity: 'Rare', buffs: [], effect: redesignEffect('twinpulse-bellows'), lore: 'Double silver bellows drive a piston through two measured pulses.' },
  { id: 'glassroot-gimbal', name: 'Glassroot Gimbal', rarity: 'Rare', buffs: [], effect: redesignEffect('glassroot-gimbal'), lore: 'A spherical silver gimbal suspends a faceted reservoir beside its calibrated sight rings.' },
  { id: 'lifeline-flywheel', name: 'Lifeline Flywheel', rarity: 'Rare', buffs: [], effect: redesignEffect('lifeline-flywheel'), lore: 'Braided channels feed an open flywheel that holds a measured reserve.' },
  { id: 'sentinel-aperture', name: 'Sentinel Aperture', rarity: 'Rare', buffs: [], effect: redesignEffect('sentinel-aperture'), lore: 'A shutter iris sits within an armored silver disc, opening only along a precise line.' },
  { id: 'wardglass-transformer', name: 'Wardglass Transformer', rarity: 'Rare', buffs: [], effect: redesignEffect('wardglass-transformer'), lore: 'Two crystal-insulated towers channel elemental pressure through stepped silver plates.' },
  { id: 'hammerbalance-link', name: 'Hammerbalance Link', rarity: 'Rare', buffs: [{ stat: 'damage', kind: 'percent', amount: 12 }, { stat: 'defense', kind: 'percent', amount: -4 }], effect: redesignEffect('hammerbalance-link'), lore: 'A hinged counterweight beam steadies a central impact joint.' },
  { id: 'breach-pendulum', name: 'Breach Pendulum', rarity: 'Rare', buffs: [], effect: redesignEffect('breach-pendulum'), lore: 'A silver pendulum blade swings inside an open fork frame.' },
  { id: 'coilfeed-ratchet', name: 'Coilfeed Ratchet', rarity: 'Rare', buffs: [], effect: redesignEffect('coilfeed-ratchet'), lore: 'A toothed silver ratchet feeds a coiled accumulator in measured increments.' },
  { id: 'opal-indexer', name: 'Opal Indexer', rarity: 'Rare', buffs: [], effect: redesignEffect('opal-indexer'), lore: 'Five inset opal lenses mark positions on a finely balanced silver indexing wheel.' },
  { id: 'resonance-crucible', name: 'Resonance Crucible', rarity: 'Rare', buffs: [], effect: redesignEffect('resonance-crucible'), lore: 'A crystal bridge joins two silver chambers, holding elemental resonance under pressure.' },
  { id: 'siege-cantilever', name: 'Siege Cantilever', rarity: 'Legendary', buffs: [], effect: redesignEffect('siege-cantilever'), lore: 'An ivory siege arm projects from a narrow platinum pivot, sacrificing armor for reach.' },
  { id: 'nullsong-transmission', name: 'Nullsong Transmission', rarity: 'Legendary', buffs: [], effect: redesignEffect('nullsong-transmission'), lore: 'A platinum gear train turns inside silent crystal baffles, redirecting power from elemental channels.' },
  { id: 'horizon-heartcase', name: 'Horizon Heartcase', rarity: 'Legendary', buffs: [], effect: redesignEffect('horizon-heartcase'), lore: 'A white radial life chamber opens broad reserve vanes while its ward plates retract.' },
  { id: 'stasis-reliquary', name: 'Stasis Reliquary', rarity: 'Legendary', buffs: [], effect: redesignEffect('stasis-reliquary'), lore: 'A platinum preservation capsule protects its reserve behind locked targeting rings.' },
  { id: 'granite-hourglass', name: 'Granite Hourglass', rarity: 'Legendary', buffs: [], effect: redesignEffect('granite-hourglass'), lore: 'Twin armored cones throttle the drive between them to reinforce a dense shell.' },
  { id: 'pale-bulwark-diadem', name: 'Pale Bulwark Diadem', rarity: 'Legendary', buffs: [], effect: redesignEffect('pale-bulwark-diadem'), lore: 'A crown-shaped fortress lattice folds inward around a narrow reserve core.' },
  { id: 'starvein-conductor', name: 'Starvein Conductor', rarity: 'Legendary', buffs: [], effect: redesignEffect('starvein-conductor'), lore: 'White conductor branches carry a bright current around a deliberately drained life vessel.' },
  { id: 'meridian-inverter', name: 'Meridian Inverter', rarity: 'Legendary', buffs: [], effect: redesignEffect('meridian-inverter'), lore: 'A platinum reversing prism displaces its precision lenses to redirect elemental force.' },
  { id: 'execution-orrery', name: 'Execution Orrery', rarity: 'Legendary', buffs: [], effect: redesignEffect('execution-orrery'), lore: 'An asymmetric celestial orrery folds its armor outward to align a decisive strike.' },
  { id: 'verdict-caliper', name: 'Verdict Caliper', rarity: 'Legendary', buffs: [], effect: redesignEffect('verdict-caliper'), lore: 'White precision jaws hold a throttled elemental core at an exact point.' },
] as const satisfies readonly { id: string; name: string; rarity: 'Rare' | 'Legendary'; buffs: readonly ConduitBuff[]; effect: string; lore: string }[];

const recoveredConduits = [
  { id: 'duplex-heart', name: 'Duplex Heart', rarity: 'Rare', buffs: [], effect: redesignEffect('duplex-heart'), lore: 'Twin silver chambers restore a broken machine’s life-support and armor lattice.' },
  { id: 'spearwheel-engine', name: 'Spearwheel Engine', rarity: 'Rare', buffs: [], effect: redesignEffect('spearwheel-engine'), lore: 'Interlocked silver flywheels translate elemental pressure into striking force.' },
  { id: 'falcon-sight', name: 'Falcon Sight', rarity: 'Rare', buffs: [], effect: redesignEffect('falcon-sight'), lore: 'A split-wing targeting lens rejoins two forgotten sightlines.' },
  { id: 'aegis-capacitor', name: 'Aegis Capacitor', rarity: 'Rare', buffs: [], effect: redesignEffect('aegis-capacitor'), lore: 'Silver ward plates protect a restored ring accumulator.' },
  { id: 'springwell-pump', name: 'Springwell Pump', rarity: 'Rare', buffs: [], effect: redesignEffect('springwell-pump'), lore: 'Two balanced impellers carry Elemental Light through a sealed silver vessel.' },
  { id: 'worldbreaker-drive', name: 'Worldbreaker Drive', rarity: 'Legendary', buffs: [{ stat: 'health', kind: 'percent', amount: -6 }], effect: redesignEffect('worldbreaker-drive'), lore: 'An ivory siege crown diverts its life-support reserve into a tremendous striking engine.' },
  { id: 'immortal-vessel', name: 'Immortal Vessel', rarity: 'Legendary', buffs: [{ stat: 'health', kind: 'percent', amount: 25 }, { stat: 'damage', kind: 'percent', amount: -6 }], effect: redesignEffect('immortal-vessel'), lore: 'Platinum sanctuary chambers preserve their bearer by slowing the force-transmission drive.' },
  { id: 'citadel-spine', name: 'Citadel Spine', rarity: 'Legendary', buffs: [{ stat: 'defense', kind: 'percent', amount: 25 }, { stat: 'crit', kind: 'percentage-points', amount: -6 }], effect: redesignEffect('citadel-spine'), lore: 'An articulated white fortress folds around its core, closing its targeting slits for armor.' },
  { id: 'astral-prism', name: 'Astral Prism', rarity: 'Legendary', buffs: [{ stat: 'crit', kind: 'percentage-points', amount: 20 }, { stat: 'defense', kind: 'percent', amount: -6 }], effect: redesignEffect('astral-prism'), lore: 'A platinum prism unfolds its protective plates into an extraordinary precision focus.' },
  { id: 'judgment-lens', name: 'Judgment Lens', rarity: 'Legendary', buffs: [], effect: redesignEffect('judgment-lens'), lore: 'Nested ivory lenses magnify a perfect strike at the expense of their bearer’s reserve.' },
] as const satisfies readonly { id: string; name: string; rarity: 'Rare' | 'Legendary'; buffs: readonly ConduitBuff[]; effect: string; lore: string }[];

const omnicConduits = [
  { id: 'infernic-phoenix-reactor', name: 'Phoenix Reactor', element: 'infernic',  effect: redesignEffect('infernic-phoenix-reactor'), buffs: [] },
  { id: 'aquatic-leviathan-pump', name: 'Leviathan Pump', element: 'oceanic',  effect: redesignEffect('aquatic-leviathan-pump'), buffs: [] },
  { id: 'tectonic-atlas-bastion', name: 'Atlas Bastion', element: 'botanic',  effect: redesignEffect('tectonic-atlas-bastion'), buffs: [] },
  { id: 'efflorescent-worldtree-heart', name: 'Worldtree Heart', element: 'botanic',  effect: redesignEffect('efflorescent-worldtree-heart'), buffs: [] },
  { id: 'voltaic-thunderbird-coil', name: 'Thunderbird Coil', element: 'atmospheric',  effect: redesignEffect('voltaic-thunderbird-coil'), buffs: [] },
  { id: 'atmospheric-griffin-turbine', name: 'Griffin Turbine', element: 'atmospheric',  effect: redesignEffect('atmospheric-griffin-turbine'), buffs: [] },
  { id: 'luminous-seraph-mirror', name: 'Seraph Mirror', element: 'tranquilitic',  effect: redesignEffect('luminous-seraph-mirror'), buffs: [] },
  { id: 'ominous-eclipse-mantle', name: 'Eclipse Mantle', element: 'chaotic',  effect: redesignEffect('ominous-eclipse-mantle'), buffs: [] },
  { id: 'tranquilitic-kirin-cradle', name: 'Kirin Cradle', element: 'tranquilitic',  effect: redesignEffect('tranquilitic-kirin-cradle'), buffs: [] },
  { id: 'chaotic-ouroboros-core', name: 'Ouroboros Core', element: 'chaotic',  effect: redesignEffect('chaotic-ouroboros-core'), buffs: [] },
  { id: 'infernic-cinder-testament', name: 'Cinder Testament', element: 'infernic',  effect: redesignEffect('infernic-cinder-testament'), buffs: [] },
  { id: 'aquatic-undertide-chronometer', name: 'Undertide Chronometer', element: 'oceanic',  effect: redesignEffect('aquatic-undertide-chronometer'), buffs: [] },
  { id: 'tectonic-faultkeeper-loom', name: 'Faultkeeper Loom', element: 'botanic',  effect: redesignEffect('tectonic-faultkeeper-loom'), buffs: [] },
  { id: 'efflorescent-verdant-covenant', name: 'Verdant Covenant', element: 'botanic',  effect: redesignEffect('efflorescent-verdant-covenant'), buffs: [] },
  { id: 'voltaic-stormstep-dynamo', name: 'Stormstep Dynamo', element: 'atmospheric',  effect: redesignEffect('voltaic-stormstep-dynamo'), buffs: [] },
  { id: 'atmospheric-skythread-rudder', name: 'Skythread Rudder', element: 'atmospheric',  effect: redesignEffect('atmospheric-skythread-rudder'), buffs: [] },
  { id: 'luminous-dawn-witness-array', name: 'Dawn Witness Array', element: 'tranquilitic',  effect: redesignEffect('luminous-dawn-witness-array'), buffs: [] },
  { id: 'ominous-nightglass-archive', name: 'Nightglass Archive', element: 'chaotic',  effect: redesignEffect('ominous-nightglass-archive'), buffs: [] },
  { id: 'tranquilitic-stillhour-carillon', name: 'Stillhour Carillon', element: 'tranquilitic',  effect: redesignEffect('tranquilitic-stillhour-carillon'), buffs: [] },
  { id: 'chaotic-paradox-spindle', name: 'Paradox Spindle', element: 'chaotic',  effect: redesignEffect('chaotic-paradox-spindle'), buffs: [] },
] as const satisfies readonly { id: string; name: string; element: ElementId; effect: string; buffs: readonly ConduitBuff[] }[];

export const conduits = ([
  ...commonConduits.map((entry) => ({ ...entry, art: entry.id, element: null, mechanic: null })),
  ...additionalCommonConduits.map((entry) => ({ ...entry, art: entry.id, element: null, mechanic: null })),
  ...recoveredConduits.map((entry) => ({ ...entry, price: null, power: 'Elemental Light', art: entry.id, element: null, mechanic: null })),
  ...expandedConduits.map((entry) => ({ ...entry, price: null, power: 'Elemental Light', art: entry.id, element: null, mechanic: null })),
  ...omnicConduits.slice(0, 10).map((entry) => ({ ...entry, rarity: 'Omnic' as const, price: null, power: 'Elemental Light', art: entry.id,
    lore: 'A fully restored elemental masterpiece recovered from one of Let and Rise\'s destroyed machine prototypes.' })),
  ...omnicConduits.slice(10).map((entry) => ({ ...entry, rarity: 'Omnic' as const, price: null, power: 'Elemental Light', art: entry.id,
    lore: 'A prismatic elemental masterpiece restored from the mechanisms left behind when Let and Rise\'s collaboration ended.' })),
  ...kitConduitDesigns.map((entry) => ({ ...entry, power: 'Elemental Light', art: entry.id })),
  ...calamiticConduits.map(entry => ({ ...entry, rarity: 'Calamitic' as const, price: null, power: "Rise's annihilation machinery",
    art: entry.id, element: null, mechanic: null, buffs: [] as readonly ConduitBuff[], effect: calamiticEffect(entry.id) })),
] as const).map(entry => ({ ...entry, mechanic: null,
  lore: isCalamiticConduitId(entry.id) ? entry.lore : `${conduitOrigin} ${entry.lore}` }));

export type Conduit = (typeof conduits)[number];
export type ConduitId = Conduit['id'];
export type ConduitSlots = (ConduitId | null)[];
export type ConduitLoadouts = Partial<Record<string, ConduitSlots>>;
export type ConduitUpgrades = Partial<Record<ConduitId, number>>;
export const conduitUpgradeCap = 5;
export const conduitUpgradeCosts = [25, 50, 100, 175, 250] as const;
export const conduitUpgradeRarityMultipliers = { Common: 1, Rare: 2, Legendary: 4, Omnic: 200, Calamitic: 400 } as const satisfies Record<Conduit['rarity'], number>;
export function validateConduitUpgradeLevel(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > conduitUpgradeCap) {
    throw new Error('Conduit upgrade level must be an integer from 0 to 5.');
  }
  return value;
}
export function validateConduitUpgrades(value: unknown): ConduitUpgrades {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Invalid saved Conduit upgrades.');
  const result: ConduitUpgrades = {};
  for (const [id, level] of Object.entries(value)) {
    if (!isConduitId(id)) throw new Error('Unknown upgraded Conduit.');
    result[id] = validateConduitUpgradeLevel(level);
  }
  return result;
}
export function conduitUpgradeCost(conduit: Conduit, level: number): number | null {
  validateConduitUpgradeLevel(level);
  const cost = conduitUpgradeCosts[level];
  return cost === undefined ? null : cost * conduitUpgradeRarityMultipliers[conduit.rarity];
}
export const conduitSlotCount = 8;
export function validateConduitSlots(value: unknown): ConduitSlots {
  if (!Array.isArray(value) || value.length !== conduitSlotCount ||
      !value.every((id) => id === null || isConduitId(id))) throw new Error('Invalid Conduit slots.');
  const ids = value.filter((id) => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error('Each named Conduit can be equipped only once per character.');
  if (ids.filter((id) => getConduit(id).rarity === 'Omnic').length > 4) throw new Error('Equip at most four Omnic Conduits per character.');
  return [...value];
}
/** Compatibility only: protect every original slot and keep converted slots in their original order. */
export function normalizeLegacyKitSlots(value: unknown, element: ElementId): ConduitSlots {
  if (!Array.isArray(value) || value.length !== conduitSlotCount || !value.every((id) => id === null || isConduitId(id))) {
    throw new Error('Invalid Conduit slots.');
  }
  const ids = value.filter((id) => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error('Each named Conduit can be equipped only once per character.');
  const originalSlots = value.map((id) => id !== null && convertedKitConduitIds.has(id) ? null : id);
  validateConduitElement(originalSlots, element);
  let capacity = 4 - originalSlots.filter((id) => id !== null && getConduit(id).rarity === 'Omnic').length;
  const normalized = value.map((id) => {
    if (id === null || !convertedKitConduitIds.has(id)) return id;
    if (getConduit(id).element !== element || capacity <= 0) return null;
    capacity--;
    return id;
  });
  return validateConduitSlots(normalized);
}
export function validateConduitElement(equipment: ConduitSlots, element: ElementId): void {
  for (const id of validateConduitSlots(equipment)) {
    const conduit = id === null ? null : getConduit(id);
    if (conduit?.element && conduit.element !== element) throw new Error(`${conduit.name} requires a ${conduit.element} character.`);
  }
}
export function conduitBuffs(conduit: Conduit, level = 0): readonly ConduitBuff[] {
  validateConduitUpgradeLevel(level);
  return conduit.buffs.map((buff) => ({ ...buff, amount: buff.amount * (1 + .5 * level) }));
}
export function conduitEffect(conduit: Conduit, level = 0): string {
  validateConduitUpgradeLevel(level);
  return isCalamiticConduitId(conduit.id) ? calamiticEffect(conduit.id, level) : redesignEffect(conduit.id, level);
}
export function conduitColor(conduit: Conduit): string {
  return conduit.rarity === 'Calamitic' ? '#ff1744' : conduit.rarity === 'Common' ? '#c39874' : conduit.rarity === 'Rare' ? '#c7cbd1' :
    conduit.rarity === 'Legendary' ? '#f1f0e9' : '#ded0ff';
}
export function conduitEquipReason(conduit: Conduit, element: ElementId, slots: ConduitSlots, slot: number): string | null {
  if (conduit.element && conduit.element !== element) return 'Element mismatch';
  const others = slots.filter((_, index) => index !== slot);
  if (others.includes(conduit.id)) return 'Already equipped';
  if (conduit.rarity === 'Omnic' && others.filter((id) => id !== null && getConduit(id).rarity === 'Omnic').length >= 4) return 'Four Omnic limit';
  return null;
}
export function isConduitId(value: unknown): value is ConduitId {
  return conduits.some((conduit) => conduit.id === value);
}
export function getConduit(id: ConduitId): Conduit {
  const conduit = conduits.find((entry) => entry.id === id);
  if (!conduit) throw new Error(`Unknown Conduit: ${id}.`);
  return conduit;
}
