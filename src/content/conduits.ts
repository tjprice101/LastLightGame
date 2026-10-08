import { type ElementId } from './activities';

export interface ConduitBuff {
 stat: 'health' | 'damage' | 'defense' | 'crit' | 'critMultiplier' | 'elementalDamage' | 'shatterCapacity';
 kind: 'percent' | 'percentage-points' | 'flat';
 amount: number;
}
export type ConduitMechanic = 'burn-focus' | 'shield-heal' | 'defense-ward' | 'renewal' | 'critical-gauge' |
 'normal-momentum' | 'defeat-gauge' | 'weaken-pierce' | 'defense-heal' | 'ultimate-ward';

export const commonConduits = [
  { id: 'vigil-core', name: 'Vigil Core', rarity: 'Common', price: 1000,
    power: 'Elemental Light', buff: { stat: 'health', kind: 'percent', amount: 5 }, effect: '+5% Health',
    lore: 'An emergency life-support mechanism sealed beneath the battlefields of the ancient war. Its protected chamber still holds a fragment of Elemental Light.' },
  { id: 'siegebound-drive', name: 'Siegebound Drive', rarity: 'Common', price: 1200,
    power: 'Mechanical', buff: { stat: 'damage', kind: 'percent', amount: 5 }, effect: '+5% Attack',
    lore: 'A compact force-transmission engine once hidden inside siege harnesses. Its interlocking gears survived centuries in a buried armory.' },
  { id: 'bastion-lock', name: 'Bastion Lock', rarity: 'Common', price: 1000,
    power: 'Mechanical', buff: { stat: 'defense', kind: 'percent', amount: 5 }, effect: '+5% Defense',
    lore: 'A folding ward mechanism recovered from a forgotten defensive vault. Its layered plates remember the shape of the ancient war shields.' },
  { id: 'parallax-relay', name: 'Parallax Relay', rarity: 'Common', price: 1500,
    power: 'Elemental Light', buff: { stat: 'crit', kind: 'percentage-points', amount: 2 }, effect: '+2 percentage points Critical Rate',
    lore: 'A concealed targeting relay with a split crystal lens. A trace of Elemental Light aligns its two sightlines with uncanny precision.' },
  { id: 'fracture-reservoir', name: 'Fracture Reservoir', rarity: 'Common', price: 1200,
    power: 'Elemental Light', buff: { stat: 'shatterCapacity', kind: 'flat', amount: 5 }, effect: '+5 Shatter Capacity',
    lore: 'A sealed accumulator buried to keep it from the armies of the ancient war. Elemental Light rests within its nested rings, waiting for a new bearer.' },
] as const;

const recoveredConduits = [
  { id: 'duplex-heart', name: 'Duplex Heart', rarity: 'Rare', buffs: [{ stat: 'health', kind: 'percent', amount: 15 }, { stat: 'defense', kind: 'percent', amount: 12 }], effect: '+15% Health ~ +12% Defense', lore: 'Twin silver chambers restore a broken machine’s life-support and armor lattice.' },
  { id: 'spearwheel-engine', name: 'Spearwheel Engine', rarity: 'Rare', buffs: [{ stat: 'damage', kind: 'percent', amount: 15 }, { stat: 'elementalDamage', kind: 'percent', amount: 15 }], effect: '+15% Attack ~ +15% Elemental Damage', lore: 'Interlocked silver flywheels translate elemental pressure into striking force.' },
  { id: 'falcon-sight', name: 'Falcon Sight', rarity: 'Rare', buffs: [{ stat: 'crit', kind: 'percentage-points', amount: 4 }, { stat: 'damage', kind: 'percent', amount: 12 }], effect: '+4 percentage points Critical Rate ~ +12% Attack', lore: 'A split-wing targeting lens rejoins two forgotten sightlines.' },
  { id: 'aegis-capacitor', name: 'Aegis Capacitor', rarity: 'Rare', buffs: [{ stat: 'defense', kind: 'percent', amount: 15 }, { stat: 'shatterCapacity', kind: 'flat', amount: 15 }], effect: '+15% Defense ~ +15 Shatter Capacity', lore: 'Silver ward plates protect a restored ring accumulator.' },
  { id: 'springwell-pump', name: 'Springwell Pump', rarity: 'Rare', buffs: [{ stat: 'health', kind: 'percent', amount: 15 }, { stat: 'elementalDamage', kind: 'percent', amount: 12 }], effect: '+15% Health ~ +12% Elemental Damage', lore: 'Two balanced impellers carry Elemental Light through a sealed silver vessel.' },
  { id: 'worldbreaker-drive', name: 'Worldbreaker Drive', rarity: 'Legendary', buffs: [{ stat: 'damage', kind: 'percent', amount: 85 }, { stat: 'health', kind: 'percent', amount: -10 }], effect: '+85% Attack ~ -10% Health', lore: 'An ivory siege crown diverts its life-support reserve into a tremendous striking engine.' },
  { id: 'immortal-vessel', name: 'Immortal Vessel', rarity: 'Legendary', buffs: [{ stat: 'health', kind: 'percent', amount: 85 }, { stat: 'damage', kind: 'percent', amount: -10 }], effect: '+85% Health ~ -10% Attack', lore: 'Platinum sanctuary chambers preserve their bearer by slowing the force-transmission drive.' },
  { id: 'citadel-spine', name: 'Citadel Spine', rarity: 'Legendary', buffs: [{ stat: 'defense', kind: 'percent', amount: 85 }, { stat: 'elementalDamage', kind: 'percent', amount: -10 }], effect: '+85% Defense ~ -10% Elemental Damage', lore: 'An articulated white fortress folds around its core, sacrificing elemental output for armor.' },
  { id: 'astral-prism', name: 'Astral Prism', rarity: 'Legendary', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 85 }, { stat: 'defense', kind: 'percent', amount: -10 }], effect: '+85% Elemental Damage ~ -10% Defense', lore: 'A platinum prism unfolds its protective plates into an extraordinary elemental focus.' },
  { id: 'judgment-lens', name: 'Judgment Lens', rarity: 'Legendary', buffs: [{ stat: 'critMultiplier', kind: 'percent', amount: 85 }, { stat: 'health', kind: 'percent', amount: -10 }], effect: '+85% Critical Damage multiplier ~ -10% Health', lore: 'Nested ivory lenses magnify a perfect strike at the expense of their bearer’s reserve.' },
] as const satisfies readonly { id: string; name: string; rarity: 'Rare' | 'Legendary'; buffs: readonly ConduitBuff[]; effect: string; lore: string }[];

const omnicConduits = [
  { id: 'infernic-phoenix-reactor', name: 'Phoenix Reactor', element: 'infernic', mechanic: 'burn-focus', effect: '+60% Attack ~ +50% Elemental Damage ~ +40% Health. Inflicting Burn grants +5 percentage points Critical Rate for your next offensive activation; refreshes, never stacks.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'elementalDamage', kind: 'percent', amount: 50 }, { stat: 'health', kind: 'percent', amount: 40 }] },
  { id: 'aquatic-leviathan-pump', name: 'Leviathan Pump', element: 'aquatic', mechanic: 'shield-heal', effect: '+60% Health ~ +50% Defense ~ +40% Attack. When your ability increases an ally\'s shield, restore 5% of your maximum HP, once per activation; cannot revive.', buffs: [{ stat: 'health', kind: 'percent', amount: 60 }, { stat: 'defense', kind: 'percent', amount: 50 }, { stat: 'damage', kind: 'percent', amount: 40 }] },
  { id: 'tectonic-atlas-bastion', name: 'Atlas Bastion', element: 'tectonic', mechanic: 'defense-ward', effect: '+60% Defense ~ +50% Health ~ +40% Attack. Entering Defense grants a shield worth 10% of your maximum HP; refreshes, never stacks.', buffs: [{ stat: 'defense', kind: 'percent', amount: 60 }, { stat: 'health', kind: 'percent', amount: 50 }, { stat: 'damage', kind: 'percent', amount: 40 }] },
  { id: 'efflorescent-worldtree-heart', name: 'Worldtree Heart', element: 'efflorescent', mechanic: 'renewal', effect: '+60% Health ~ +50% Elemental Damage ~ +40% Defense. At each new player turn, restore 2% of your maximum HP; cannot revive.', buffs: [{ stat: 'health', kind: 'percent', amount: 60 }, { stat: 'elementalDamage', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'voltaic-thunderbird-coil', name: 'Thunderbird Coil', element: 'voltaic', mechanic: 'critical-gauge', effect: '+60% Attack ~ +50% Elemental Damage ~ +40% Defense. An activation that critically hits an enemy restores 5 Shatter Gauge, once per activation.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'elementalDamage', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'atmospheric-griffin-turbine', name: 'Griffin Turbine', element: 'atmospheric', mechanic: 'normal-momentum', effect: '+60% Attack ~ +50% Defense ~ +40% Health. Normal Attack empowers your next offensive skill by 10% outgoing damage; refreshes, never stacks.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'defense', kind: 'percent', amount: 50 }, { stat: 'health', kind: 'percent', amount: 40 }] },
  { id: 'luminous-seraph-mirror', name: 'Seraph Mirror', element: 'luminous', mechanic: 'defeat-gauge', effect: '+60% Elemental Damage ~ +50% Health ~ +40% Defense. Defeating an enemy with an offensive activation restores 5 Shatter Gauge, once per activation.', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 60 }, { stat: 'health', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'ominous-eclipse-mantle', name: 'Eclipse Mantle', element: 'ominous', mechanic: 'weaken-pierce', effect: '+60% Attack ~ +50% Health ~ +40% Defense. Inflicting Weaken makes your next offensive activation ignore 20% of enemy Defense; refreshes, never stacks.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'health', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'tranquilitic-kirin-cradle', name: 'Kirin Cradle', element: 'tranquilitic', mechanic: 'defense-heal', effect: '+60% Health ~ +50% Defense ~ +40% Elemental Damage. Entering Defense restores 5% of your maximum HP; cannot revive.', buffs: [{ stat: 'health', kind: 'percent', amount: 60 }, { stat: 'defense', kind: 'percent', amount: 50 }, { stat: 'elementalDamage', kind: 'percent', amount: 40 }] },
  { id: 'chaotic-ouroboros-core', name: 'Ouroboros Core', element: 'chaotic', mechanic: 'ultimate-ward', effect: '+60% Attack ~ +50% Elemental Damage ~ +40% Health. Last Flare grants a shield worth 15% of your maximum HP; refreshes, never stacks. Recovery still applies.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'elementalDamage', kind: 'percent', amount: 50 }, { stat: 'health', kind: 'percent', amount: 40 }] },
] as const satisfies readonly { id: string; name: string; element: ElementId; mechanic: ConduitMechanic; effect: string; buffs: readonly ConduitBuff[] }[];

export const conduits = [
  ...commonConduits.map((entry) => ({ ...entry, art: entry.id, element: null, mechanic: null })),
  ...recoveredConduits.map((entry) => ({ ...entry, price: null, power: 'Elemental Light', art: entry.id, element: null, mechanic: null })),
  ...omnicConduits.map((entry) => ({ ...entry, rarity: 'Omnic' as const, price: null, power: 'Elemental Light', art: entry.id,
    lore: 'A fully restored elemental masterpiece from the ancient white machine.' })),
] as const;

export type Conduit = (typeof conduits)[number];
export type ConduitId = Conduit['id'];
export type ConduitSlots = (ConduitId | null)[];
export type ConduitLoadouts = Partial<Record<string, ConduitSlots>>;
export type ConduitUpgrades = Partial<Record<ConduitId, number>>;
export const conduitUpgradeCap = 5;
export const conduitUpgradeCosts = [25, 50, 100, 175, 250] as const;
export const conduitUpgradeRarityMultipliers = { Common: 1, Rare: 2, Legendary: 4, Omnic: 200 } as const satisfies Record<Conduit['rarity'], number>;
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
export function validateConduitElement(equipment: ConduitSlots, element: ElementId): void {
  for (const id of validateConduitSlots(equipment)) {
    const conduit = id === null ? null : getConduit(id);
    if (conduit?.element && conduit.element !== element) throw new Error(`${conduit.name} requires a ${conduit.element} character.`);
  }
}
export function conduitBuffs(conduit: Conduit, level = 0): readonly ConduitBuff[] {
  validateConduitUpgradeLevel(level);
  const buffs = 'buff' in conduit ? [conduit.buff] : conduit.buffs;
  return buffs.map((buff) => ({ ...buff, amount: buff.amount * (1 + .5 * level) }));
}
export function conduitEffect(conduit: Conduit, level = 0): string {
  validateConduitUpgradeLevel(level);
  if (level === 0) return conduit.effect;
  const labels = { health: 'Health', damage: 'Attack', defense: 'Defense', crit: 'Critical Rate',
    critMultiplier: 'Critical Damage multiplier', elementalDamage: 'Elemental Damage', shatterCapacity: 'Shatter Capacity' };
  const stats = conduitBuffs(conduit, level).map((buff) => {
    const number = `${buff.amount > 0 ? '+' : ''}${buff.amount.toLocaleString('en-US', { maximumFractionDigits: 20 })}`;
    return `${number}${buff.kind === 'percent' ? '%' : buff.kind === 'percentage-points' ? ' percentage points' : ''} ${labels[buff.stat]}`;
  }).join(' ~ ');
  return conduit.mechanic ? `${stats}. ${conduit.effect.slice(conduit.effect.indexOf('. ') + 2)}` : stats;
}
export function conduitColor(conduit: Conduit): string {
  return conduit.rarity === 'Common' ? '#c39874' : conduit.rarity === 'Rare' ? '#c7cbd1' :
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
