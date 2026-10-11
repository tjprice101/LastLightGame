import { elements } from './activities';
import { roseMaterials } from './roses';

export type ExchangeCategory = 'normal' | 'event';
export interface ExchangeProduct {
  /** Purchase identifier: an element ID for normal materials, the material ID for event materials. */
  id: string;
  materialId: string;
  category: ExchangeCategory;
  rarity: string;
  price: number;
  /** Event materials are restricted to these Element-Bearers. */
  restrictedTo?: readonly string[];
  eventName?: string;
}

export const exchangeQuantities = [1, 5, 10] as const;
export type ExchangeQuantity = typeof exchangeQuantities[number];
export const normalExchangePrice = 80;
export const roseExchangePrices = [2_500, 7_500, 25_000, 75_000, 250_000, 750_000] as const;
export const roseMaterialCharacters = ['Rosetta', 'Thornia', 'Crinso'] as const;

export const exchangeProducts: readonly ExchangeProduct[] = [
  ...elements.map((element): ExchangeProduct => ({
    id: element.id, materialId: `${element.id}-common`, category: 'normal', rarity: 'Common', price: normalExchangePrice,
  })),
  ...roseMaterials.map((material, tier): ExchangeProduct => ({
    id: material.id, materialId: material.id, category: 'event', rarity: material.rarity, price: roseExchangePrices[tier],
    restrictedTo: roseMaterialCharacters, eventName: 'Roses Under Sunny Skies',
  })),
];

export function exchangeProduct(id: string): ExchangeProduct {
  const product = exchangeProducts.find(entry => entry.id === id);
  if (!product) throw new Error('Unknown Material Exchange product.');
  return product;
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
export function eventMaterialWarning(product: ExchangeProduct, quantity: number): string {
  if (product.category !== 'event' || !product.restrictedTo) throw new Error('Only event materials need this warning.');
  return `These materials are ONLY for ${product.restrictedTo.join(', ')}, and NOT for normal Element-Bearers. Buy ${quantity} for ${(product.price * quantity).toLocaleString('en-US')} Prismatica?`;
}
