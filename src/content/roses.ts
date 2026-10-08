import { materialRarities } from './activities';

export const roseMaterialNames = ['Seed', 'Bud', 'Bloom', 'Crest', 'Heart', 'Soul'] as const;
export const roseMaterials = materialRarities.map((rarity, tier) => ({
  id: `rosethorn-${rarity.toLowerCase()}`, name: `${roseMaterialNames[tier]} of Rosethorn`, rarity,
}));
export const roseSaleQuantities = [1, 2, 3, 4, 5, 6] as const;
export const roseMaterialUnlocks = [80, 90, 100, 110, 120, 130] as const;
export const roseFinalChances = [1, .98, .9, .8, .6, .35] as const;
export const roseCaptureMaximumLevel = 120;
export const roseFormStages = [1, 6, 11, 16, 22, 29] as const;
export function roseCaptureAllowed(level: number): boolean {
  if (!Number.isInteger(level) || level < 80 || level > 140) throw new Error('Roselius enemy level must be from 80 to 140.');
  return level <= roseCaptureMaximumLevel;
}
export function roseDuplicateMinimumLevel(creatureId: string): number | undefined {
  return creatureId === 'infusion:treasury:5' ? 50 : creatureId === 'infusion:roses:5' ? 80 : undefined;
}
