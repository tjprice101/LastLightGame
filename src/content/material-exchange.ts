import { elements, materialRarities, materialFirstNeededLevel } from './activities';
import { roseMaterials } from './roses';
import { getStarter } from './starters';
import { moonSunshadeEvents, newEventMaterialIds } from './moon-sunshade-events';
import { materialReleased } from './release-visibility';

export type ExchangeCategory = 'normal' | 'event';
export interface ExchangeProduct {
  /** Legacy element ID for ordinary Seeds; material ID for higher/event tiers. */
  id: string;
  materialId: string;
  category: ExchangeCategory;
  rarity: string;
  price: number;
  unlockLevel?: number;
  /** Event materials are restricted to these Element-Bearers. */
  restrictedTo?: readonly string[];
  eventName?: string;
}

export const exchangeQuantities = [1, 5, 10] as const;
export type ExchangeQuantity = typeof exchangeQuantities[number];
export const normalExchangePrice = 80;
export const normalExchangePrices = [80, 470, 2_750, 16_100, 94_100, 550_000] as const;
export const roseExchangePrices = [2_500, 7_500, 25_000, 75_000, 250_000, 750_000] as const;
export const roseMaterialCharacters = ['Rosetta', 'Thornia', 'Crinso'] as const;

export const exchangeProducts: readonly ExchangeProduct[] = [
  ...elements.flatMap(element => materialRarities.map((rarity, tier): ExchangeProduct => ({
    id: tier === 0 ? element.id : `${element.id}-${rarity.toLowerCase()}`,
    materialId: `${element.id}-${rarity.toLowerCase()}`, category: 'normal', rarity,
    price: normalExchangePrices[tier], unlockLevel: materialFirstNeededLevel[rarity],
  }))),
  ...roseMaterials.map((material, tier): ExchangeProduct => ({
    id: material.id, materialId: material.id, category: 'event', rarity: material.rarity, price: roseExchangePrices[tier],
    restrictedTo: roseMaterialCharacters, eventName: 'Roses Under Sunny Skies',
  })),
  ...moonSunshadeEvents.flatMap(event => newEventMaterialIds(event.id).map((materialId, tier): ExchangeProduct => ({
    id: materialId, materialId, category: 'event', rarity: materialRarities[tier], price: roseExchangePrices[tier],
    restrictedTo: event.characters.map(id => getStarter(id as Parameters<typeof getStarter>[0]).name),
    eventName: event.bannerName,
  }))),
];

export function exchangeProduct(id: string): ExchangeProduct {
  const product = exchangeProducts.find(entry => entry.id === id || entry.materialId === id);
  if (!product) throw new Error('Unknown Material Exchange product.');
  if (!materialReleased(product.materialId)) throw new Error('This material is not released.');
  return product;
}
export function exchangeProductUnlocked(product: ExchangeProduct, account: {
  characters: Partial<Record<string, { level: number }>>;
} | null): boolean {
  return account !== null && (product.category === 'event' ||
    Object.values(account.characters).some(progress => progress && progress.level >= (product.unlockLevel ?? 0)));
}
export function isExchangeQuantity(value: unknown): value is ExchangeQuantity {
  return exchangeQuantities.includes(value as ExchangeQuantity);
}
export function exchangeCategory(id: string): ExchangeCategory {
  return exchangeProducts.find(entry => entry.id === id)?.category ?? 'normal';
}
export const eventMaterialWarningKey = 'last-light.event-material-warning';
interface PreferenceStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function eventMaterialWarningHidden(storage: PreferenceStorage): boolean {
  try { return storage.getItem(eventMaterialWarningKey) === 'hidden'; } catch { return false; }
}
export function hideEventMaterialWarning(storage: PreferenceStorage): void {
  storage.setItem(eventMaterialWarningKey, 'hidden');
}
export function eventMaterialWarningRequired(product: ExchangeProduct, ownsEventBearer: boolean, hidden: boolean): boolean {
  return product.category === 'event' && (!ownsEventBearer || !hidden);
}
export function eventMaterialWarning(product: ExchangeProduct, quantity: number): string {
  if (product.category !== 'event' || !product.restrictedTo) throw new Error('Only event materials need this warning.');
  return `These materials are ONLY for ${product.restrictedTo.join(', ')}, and NOT for normal Element-Bearers. Buy ${quantity} for ${(product.price * quantity).toLocaleString('en-US')} Prismatica?`;
}
