import { materialDropLevel, materialRarities } from './activities';

export const roseMaterialNames = ['Seed', 'Bud', 'Bloom', 'Crest', 'Heart', 'Soul'] as const;
export const roseMaterials = materialRarities.map((rarity, tier) => ({
  id: `rosethorn-${rarity.toLowerCase()}`, name: `${roseMaterialNames[tier]} of Rosethorn`, rarity,
}));
export const roseSaleQuantities = [1, 2, 3, 4, 5, 6] as const;
/** Event enemies start at Lv.80, so every tier the D-357 rule has unlocked by then drops from the first stage. */
export const roseMaterialUnlocks = materialRarities.map(rarity => Math.max(80, materialDropLevel(rarity)));
export const roseCaptureMaximumLevel = 120;
export const roseFormStages = [1, 6, 11, 16, 22, 29] as const;
export function roseCaptureAllowed(level: number): boolean {
  if (!Number.isInteger(level) || level < 80 || level > 140) throw new Error('Roselius enemy level must be from 80 to 140.');
  return level <= roseCaptureMaximumLevel;
}
export function roseDuplicateMinimumLevel(creatureId: string): number | undefined {
  return creatureId === 'infusion:treasury:5' ? 50 : creatureId === 'infusion:roses:5' ? 80 : undefined;
}
