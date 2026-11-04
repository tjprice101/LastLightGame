import { getCreature } from './creatures';
import { roseEventActive, roseEventEndsAt } from './event-schedule';
import { materialRarities } from './activities';

export const eventDevourerPrices = [10_000, 30_000, 100_000, 350_000, 1_500_000, 5_000_000] as const;
export const eventBearerIds = ['rosetta', 'thornia', 'crinso'] as const;
export const eventDevourers = eventDevourerPrices.map((price, tier) => ({
  id: `infusion:roses:${tier}`, price, rarity: materialRarities[tier], creature: getCreature(`infusion:roses:${tier}`),
}));

export function eventDevourerProduct(id: string) {
  const product = eventDevourers.find(entry => entry.id === id);
  if (!product) throw new Error('Unknown Event Elemental-Devourer.');
  return product;
}

export function assertEventDevourerAvailable(now: number): void {
  if (now < roseEventEndsAt || roseEventActive(now)) throw new Error('Event Elemental-Devourers can only be purchased after their event ends, not while it is active.');
}

export const eventDevourerWarning = 'You do not own Rosetta, Thornia or Crinso. Roselius can fight in your squad, but their Rosethorn materials and evolution-fodder uses are for those event Element-Bearers only.';
