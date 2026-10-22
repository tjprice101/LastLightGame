import { materialDropLevel, materialRarities as rarityNames } from './activities';

export const materialRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'omnic'] as const;
export type MaterialRarity = (typeof materialRarities)[number];

const bracketRanges: readonly Partial<Record<MaterialRarity, readonly [number, number]>>[] = [
  { common: [4, 5] },
  { common: [8, 10], uncommon: [2, 3] },
  { common: [12, 15], uncommon: [5, 6], rare: [2, 3] },
  { common: [16, 20], uncommon: [8, 10], rare: [5, 6], epic: [2, 3] },
  { common: [20, 25], uncommon: [12, 15], rare: [8, 10], epic: [5, 6], legendary: [2, 3] },
  { common: [25, 30], uncommon: [16, 20], rare: [12, 15], epic: [8, 10], legendary: [5, 6], omnic: [2, 3] },
];

export const materialLevelBrackets = bracketRanges.map((ranges, index) => ({
  level: materialDropLevel(rarityNames[index]), ranges,
}));

export function materialRangesAtLevel(level: number) {
  if (!Number.isInteger(level) || level < 1 || level > 140) throw new Error('Material drop level must be from 1 to 140.');
  return [...materialLevelBrackets].reverse().find(bracket => level >= bracket.level)!.ranges;
}
