export const conduits = [
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

export type Conduit = (typeof conduits)[number];
export type ConduitId = Conduit['id'];
export type ConduitSlots = (ConduitId | null)[];
export type ConduitLoadouts = Partial<Record<string, ConduitSlots>>;
export const conduitSlotCount = 8;
export function validateConduitSlots(value: unknown): ConduitSlots {
  if (!Array.isArray(value) || value.length !== conduitSlotCount ||
      !value.every((id) => id === null || isConduitId(id))) throw new Error('Invalid Conduit slots.');
  const ids = value.filter((id) => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error('Each named Conduit can be equipped only once per character.');
  return [...value];
}
export function isConduitId(value: unknown): value is ConduitId {
  return conduits.some((conduit) => conduit.id === value);
}
export function getConduit(id: ConduitId): Conduit {
  const conduit = conduits.find((entry) => entry.id === id);
  if (!conduit) throw new Error(`Unknown Conduit: ${id}.`);
  return conduit;
}
