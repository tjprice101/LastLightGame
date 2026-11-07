import { elements } from './activities';
import { lootRoll, materialRewardAmount } from './loot-random';
import { moonSunshadeEvents, newEventMaterialIds } from './moon-sunshade-events';

export const bannerMaterialTiers = [
  { rarity: 'Common', weight: 50, amount: materialRewardAmount(10) },
  { rarity: 'Uncommon', weight: 30, amount: materialRewardAmount(6) },
  { rarity: 'Rare', weight: 17, amount: materialRewardAmount(3) },
] as const;
export const authoredBannerDuplicateMaterialAmount = 15;
export const bannerDuplicateMaterialAmount = materialRewardAmount(authoredBannerDuplicateMaterialAmount);
export interface BannerMaterialReward { id: string; amount: number }

function materialFamilies(): string[] {
  return ['rosethorn', ...moonSunshadeEvents.map(event => event.family)];
}

export function bannerMaterialDefinition(id: string) {
  const family = id.slice(0, id.lastIndexOf('-'));
  const tier = bannerMaterialTiers.find(tier => id === `${family}-${tier.rarity.toLowerCase()}`);
  if (!tier || (!materialFamilies().includes(family) && !elements.some(element => element.id === family))) {
    throw new Error('Unknown banner material.');
  }
  return { id, ...tier, authoredAmount: [10, 6, 3][bannerMaterialTiers.indexOf(tier)] };
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

export function newEventBannerMaterialPool(family: 'moonwake' | 'dawnforge', remaining: number) {
  if (!materialFamilies().includes(family) || !Number.isFinite(remaining) || remaining <= 0 || remaining > 1) {
    throw new Error('Invalid event banner material pool.');
  }
  const ids = new Set(newEventMaterialIds(family === 'moonwake' ? 'moon' : 'sunshade'));
  return bannerMaterialTiers.flatMap((tier, index) => [...ids].filter(id => id.endsWith(`-${tier.rarity.toLowerCase()}`)).map(id => ({
    kind: 'material' as const, id, stars: (index + 1) as 1 | 2 | 3, amount: tier.amount,
    chance: remaining * tier.weight / 97,
  })));
}

export function newEventDuplicateMaterials(family: 'moonwake' | 'dawnforge'): BannerMaterialReward {
  if (!materialFamilies().includes(family)) throw new Error('Unknown event material family.');
  return { id: `${family}-rare`, amount: bannerDuplicateMaterialAmount };
}
