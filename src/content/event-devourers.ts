import { getCreature } from './creatures';
import { roseEventActive, roseEventEndsAt } from './event-schedule';
import { materialRarities } from './activities';
import { getStarter, type StarterId } from './starters';
import {
  moonSunshadeEvents, moonSunshadeShopPrices, newEventHasCompletedWindow, newEventWindowActive, type NewEventId,
} from './moon-sunshade-events';

export const eventDevourerPrices = [10_000, 30_000, 100_000, 350_000, 1_500_000, 5_000_000] as const;
export const eventBearerIds = ['rosetta', 'thornia', 'crinso'] as const;
export interface EventDevourerProduct {
  id: string;
  price: number;
  rarity: typeof materialRarities[number];
  creature: ReturnType<typeof getCreature>;
  eventId: 'roses' | NewEventId;
  eventName: string;
  bearerIds: readonly StarterId[];
}
export const eventDevourers: readonly EventDevourerProduct[] = [
  ...eventDevourerPrices.map((price, tier): EventDevourerProduct => ({
    id: `infusion:roses:${tier}`, price, rarity: materialRarities[tier], creature: getCreature(`infusion:roses:${tier}`),
    eventId: 'roses', eventName: 'Roses Under Sunny Skies', bearerIds: eventBearerIds,
  })),
  ...moonSunshadeEvents.flatMap(event => eventDevourersFor(event.id, event.bannerName, event.characters)),
];

function eventDevourersFor(id: NewEventId, eventName: string, bearerIds: readonly StarterId[]): EventDevourerProduct[] {
  return moonSunshadeShopPrices.map((price, tier) => ({
    id: `infusion:${id}:${tier}`, price, rarity: materialRarities[tier],
    creature: getCreature(`infusion:${id}:${tier}`), eventId: id, eventName, bearerIds,
  }));
}

export function eventDevourerProduct(id: string) {
  const product = eventDevourers.find(entry => entry.id === id);
  if (!product) throw new Error('Unknown Event Elemental-Devourer.');
  return product;
}

export function eventDevourerAvailable(eventId: EventDevourerProduct['eventId'], now: number): boolean {
  if (!Number.isFinite(now)) throw new Error('Invalid event shop time.');
  if (eventId === 'roses') return now >= roseEventEndsAt && !roseEventActive(now);
  return !newEventWindowActive(eventId, now) && newEventHasCompletedWindow(eventId, now);
}

export function assertEventDevourerAvailable(now: number, eventId: EventDevourerProduct['eventId'] = 'roses'): void {
  if (!eventDevourerAvailable(eventId, now)) {
    throw new Error('Event Elemental-Devourers can only be purchased after an actually completed event window, not during a rerun.');
  }
}

export function eventDevourerWarning(product: EventDevourerProduct): string {
  const names = product.bearerIds.map(id => getStarter(id).name);
  return `These copies are used by ${names.join(', ')}. Their event materials and evolution-fodder uses remain exclusive to that banner's Element-Bearers.`;
}
