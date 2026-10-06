import { evolutionRecipes, getElement, materialRarities, type ElementId, type MaterialRarity } from './activities';
import { specialtyId } from './infusions';

export const currencies = [
  { id: 'fractalis', name: 'Fractalis', role: 'Main currency' },
  { id: 'lycalis', name: 'Lycalis', role: 'Premium currency' },
] as const;

export const artifactSlots = Array.from({ length: 8 }, (_, index) => index + 1);
// Opening Lv1 range; live per-enemy rewards use fractalisDrop(level).
export const enemyFractalisDrop = { minimum: 5, maximum: 10 } as const;
export const characterGrowth = { forms: 6, firstLevelCap: 30, levelsPerEvolution: 15, perLevel: 0.03, evolutionMultiplier: 1.45, exponent: 3 } as const;
export function evolutionRarity(evolution: number): MaterialRarity {
  characterLevelCap(evolution);
  return materialRarities[evolution - 1];
}
export const fractureRules = {
  sourceTier: 1,
  destinationTier: 2,
  levelCap: characterGrowth.firstLevelCap,
  preservesLevel: true,
  lycalisReward: 10,
} as const;
export interface CharacterProgress { level: number; evolution: number; weaponRank?: number }
export const weaponRules = { maximumRank: 10, attackPerRank: .02 } as const;
export function weaponCost(element: ElementId, progress: CharacterProgress): UpgradeCost {
  characterGrowthFactor(progress);
  const rank = (progress.weaponRank ?? 0) + 1;
  if (rank > weaponRules.maximumRank) throw new Error('Maximum weapon rank reached.');
  return { fractalis: 100 * rank, materials: { [specialtyId(element, 'weapon')]: 5 * rank } };
}

export interface UpgradeCost { fractalis: number; materials: Record<string, number> }
export const evolutionBalance = [
  { fractalis: 300, amounts: [15] },
  { fractalis: 600, amounts: [25, 10] },
  { fractalis: 1200, amounts: [25, 10] },
  { fractalis: 2400, amounts: [25, 10] },
  { fractalis: 4800, amounts: [25, 10] },
] as const;

export function levelCost(element: ElementId, progress: CharacterProgress): UpgradeCost {
  getElement(element);
  characterGrowthFactor(progress);
  if (progress.level === characterLevelCap(progress.evolution)) throw new Error('Reach the next evolution to raise the level cap.');
  const destination = progress.level + 1;
  return { fractalis: 10 + 2 * destination, materials: { [`${element}-common`]: Math.ceil(destination / 30),
    ...(progress.evolution >= 5 ? { [specialtyId(element, 'level')]: 1 } : {}) } };
}

export function evolutionCost(element: ElementId, progress: CharacterProgress): UpgradeCost {
  getElement(element);
  characterGrowthFactor(progress);
  if (progress.evolution === characterGrowth.forms) throw new Error('This character has reached its final evolution.');
  const recipe = evolutionRecipes[progress.evolution - 1];
  const balance = evolutionBalance[progress.evolution - 1];
  return {
    fractalis: balance.fractalis,
    materials: {
      ...Object.fromEntries(recipe.rarities.map((rarity, index) => [`${element}-${rarity.toLowerCase()}`, balance.amounts[index]])),
      ...(progress.evolution >= 4 ? { [specialtyId(element, 'evolution')]: progress.evolution === 4 ? 5 : 10 } : {}),
    },
  };
}

export function characterLevelCap(evolution: number): number {
  if (!Number.isInteger(evolution) || evolution < 1 || evolution > characterGrowth.forms) {
    throw new Error(`Character evolution must be an integer from 1 to ${characterGrowth.forms}.`);
  }
  return characterGrowth.firstLevelCap + (evolution - 1) * characterGrowth.levelsPerEvolution;
}

export function characterGrowthFactor(progress: CharacterProgress): number {
  if (!Number.isInteger(progress.weaponRank ?? 0) || (progress.weaponRank ?? 0) < 0 || (progress.weaponRank ?? 0) > weaponRules.maximumRank) throw new Error('Invalid weapon rank.');
  const cap = characterLevelCap(progress.evolution);
  if (!Number.isInteger(progress.level) || progress.level < 0 || progress.level > cap) {
    throw new Error(`Character level must be an integer from 0 to ${cap}.`);
  }
  return (1 + progress.level * characterGrowth.perLevel) ** characterGrowth.exponent *
    characterGrowth.evolutionMultiplier ** (progress.evolution - 1);
}

export function characterPotencyFactor(progress: CharacterProgress): number {
  characterGrowthFactor(progress);
  return 1 + progress.level * .003 + (progress.evolution - 1) * .05;
}

export const upgradePaths = [
  { id: 'upgrade-0', name: 'Fracture / Evolution', detail: 'Preserve your level; multiply core growth by 1.45 and increase skill/passive potency.' },
  { id: 'upgrade-1', name: 'Character level', detail: 'Accelerating cubic core-stat growth; bounded percentage stats and skill/passive potency.' },
  { id: 'upgrade-3', name: 'Unique passive', detail: 'Upgrade the character\'s unique passive ability.' },
  { id: 'upgrade-4', name: 'Ability 1', detail: 'Upgrade the first active ability.' },
  { id: 'upgrade-5', name: 'Ability 2', detail: 'Upgrade the second active ability.' },
  { id: 'upgrade-6', name: 'Last Flare', detail: 'Upgrade the ultimate. Naming format: Last Flare: <character-specific name>.' },
] as const;
