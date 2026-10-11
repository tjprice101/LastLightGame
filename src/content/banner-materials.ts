import { elements } from './activities';
import { lootRoll } from './loot-random';

export const bannerMaterialTiers = [
  { rarity: 'Common', weight: 50, amount: 10 },
  { rarity: 'Uncommon', weight: 30, amount: 6 },
  { rarity: 'Rare', weight: 17, amount: 3 },
] as const;
export const bannerDuplicateMaterialAmount = 15;
export interface BannerMaterialReward { id: string; amount: number }

export function bannerMaterialDefinition(id: string) {
  const family = id.slice(0, id.lastIndexOf('-'));
  const tier = bannerMaterialTiers.find(tier => id === `${family}-${tier.rarity.toLowerCase()}`);
  if (!tier || (family !== 'rosethorn' && !elements.some(element => element.id === family))) {
    throw new Error('Unknown banner material.');
  }
  return { id, ...tier };
}

export function bannerMaterialPool(event: boolean, remaining: number) {
  const families = event ? ['rosethorn'] : elements.map(element => element.id);
  return bannerMaterialTiers.flatMap((tier, index) => families.map(family => ({
    kind: 'material' as const, id: `${family}-${tier.rarity.toLowerCase()}`,
    stars: (index + 1) as 1 | 2 | 3, amount: tier.amount,
    chance: remaining * tier.weight / 97 / families.length,
  })));
}

export function bannerDuplicateMaterials(event: boolean, random: () => number): BannerMaterialReward {
  const family = event ? 'rosethorn' : elements[Math.floor(lootRoll(random) * elements.length)].id;
  return { id: `${family}-rare`, amount: bannerDuplicateMaterialAmount };
}
