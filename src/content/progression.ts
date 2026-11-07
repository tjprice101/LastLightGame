import { evolutionRecipes, evolutionRequirement, getElement, materialFirstNeededLevel, materialRarities, type ElementId, type MaterialRarity } from './activities';
import { specialtyId } from './infusions';
import { getStarter, isRoseCharacter, type StarterId } from './starters';
import { roseMaterials } from './roses';
import { isNewEventCharacter, newEventForCharacter, newEventMaterialIds, type NewEventFamily } from './moon-sunshade-events';
import { isCalamiticCharacter } from './calamitic-characters';
import { playableGrowth } from './stat-growth';

export const currencies = [
  { id: 'fractalis', name: 'Prismatica', role: 'Main currency' },
  { id: 'lycalis', name: 'Null-Prismatica', role: 'Premium currency' },
] as const;

export const artifactSlots = Array.from({ length: 8 }, (_, index) => index + 1);
// Opening Lv1 range; live per-enemy rewards use fractalisDrop(level).
export const enemyFractalisDrop = { minimum: 5, maximum: 10 } as const;
export const characterGrowth = { forms: 6, firstLevelCap: 30, levelsPerEvolution: 15, ...playableGrowth } as const;
export function evolutionRarity(evolution: number): MaterialRarity {
  characterLevelCap(evolution);
  return materialRarities[evolution - 1];
}
export function characterRarity(id: StarterId, evolution: number): MaterialRarity | 'Calamitic' {
  if (!isCalamiticCharacter(id)) return evolutionRarity(evolution);
  characterLevelCap(evolution, id);
  return evolution === 6 ? 'Calamitic' : materialRarities[evolution];
}
export function rarityRank(rarity: MaterialRarity | 'Calamitic'): number {
  const rank = rarity === 'Calamitic' ? materialRarities.length + 1 : materialRarities.indexOf(rarity) + 1;
  if (rank < 1) throw new Error(`Unknown character rarity: ${rarity}.`);
  return rank;
}
export function displayEvolution(id: StarterId, evolution: number): number {
  return rarityRank(characterRarity(id, evolution));
}
export const fractureRules = {
  sourceTier: 1,
  destinationTier: 2,
  levelCap: characterGrowth.firstLevelCap,
  preservesLevel: true,
  lycalisReward: 10,
} as const;
export interface CharacterAscension { stats?: boolean; skill1?: boolean; skill2?: boolean; lastFlare?: boolean }
export interface CharacterProgress { level: number; evolution: number; weaponRank?: number; ascension?: CharacterAscension }
export const weaponRules = { maximumRank: 10, attackPerRank: .02 } as const;
export function weaponCost(element: ElementId, progress: CharacterProgress): UpgradeCost {
  characterGrowthFactor(progress);
  const rank = (progress.weaponRank ?? 0) + 1;
  if (rank > weaponRules.maximumRank) throw new Error('Maximum weapon rank reached.');
  return { fractalis: 100 * rank, materials: { [specialtyId(element, 'weapon')]: 5 * rank } };
}

export interface UpgradeCost { fractalis: number; materials: Record<string, number> }
export function increasedMaterialCost(cost: UpgradeCost): UpgradeCost {
  return { fractalis: cost.fractalis, materials: Object.fromEntries(Object.entries(cost.materials).map(([id, amount]) => {
    if (!Number.isSafeInteger(amount) || amount < 1) throw new Error('Invalid upgrade material quantity.');
    const increased = amount + Math.ceil(amount / 2);
    if (!Number.isSafeInteger(increased)) throw new Error('Upgrade material quantity overflow.');
    return [id, increased];
  })) };
}
function lateMaterialCost(cost: UpgradeCost, late: boolean): UpgradeCost {
  return late ? { fractalis: cost.fractalis,
    materials: Object.fromEntries(Object.entries(cost.materials).map(([id, amount]) => [id, amount * 2])) } : cost;
}
export const evolutionBalance = [
  { fractalis: 300, amounts: [15] },
  { fractalis: 600, amounts: [25, 10] },
  { fractalis: 1200, amounts: [25, 10] },
  { fractalis: 2400, amounts: [25, 10] },
  { fractalis: 4800, amounts: [25, 10] },
] as const;

export const levelingMaterialTiers = [
  { rarity: 'Uncommon', destination: materialFirstNeededLevel.Uncommon + 1 },
  { rarity: 'Rare', destination: materialFirstNeededLevel.Rare + 1 },
  { rarity: 'Epic', destination: materialFirstNeededLevel.Epic + 1 },
  { rarity: 'Legendary', destination: materialFirstNeededLevel.Legendary + 1 },
  { rarity: 'Omnic', destination: materialFirstNeededLevel.Omnic + 1 },
] as const satisfies readonly { rarity: MaterialRarity; destination: number }[];

export function levelingMaterials(element: ElementId | 'rosethorn' | NewEventFamily, destination: number): Record<string, number> {
  if (element !== 'rosethorn' && element !== 'moonwake' && element !== 'dawnforge') getElement(element);
  if (!Number.isInteger(destination) || destination < 1 || destination > 120) {
    throw new Error('Leveling destination must be an integer from 1 to 120.');
  }
  return {
    [`${element}-common`]: Math.ceil(destination / 30),
    ...Object.fromEntries(levelingMaterialTiers.filter((tier) => destination >= tier.destination)
      .map((tier) => [`${element}-${tier.rarity.toLowerCase()}`, 1])),
  };
}

export function levelCost(element: ElementId, progress: CharacterProgress, id?: StarterId): UpgradeCost {
  return increasedMaterialCost(baseLevelCost(element, progress, id));
}

function baseLevelCost(element: ElementId, progress: CharacterProgress, id?: StarterId): UpgradeCost {
  getElement(element);
  characterGrowthFactor(progress, id);
  if (progress.level === characterLevelCap(progress.evolution, id, progress.ascension?.stats === true)) throw new Error('Reach the next evolution to raise the level cap.');
  const destination = progress.level + 1;
  return lateMaterialCost({ fractalis: 10 + 2 * destination, materials: { ...levelingMaterials(element, destination),
    ...(progress.evolution >= 5 ? { [specialtyId(element, 'level')]: 1 } : {}) } }, destination >= 61);
}

export function evolutionCost(element: ElementId, progress: CharacterProgress, id?: StarterId): UpgradeCost {
  return increasedMaterialCost(baseEvolutionCost(element, progress, id));
}

function baseEvolutionCost(element: ElementId, progress: CharacterProgress, id?: StarterId): UpgradeCost {
  getElement(element);
  characterGrowthFactor(progress, id);
  if (progress.evolution === characterGrowth.forms) throw new Error('This character has reached its final evolution.');
  const recipe = evolutionRecipes[progress.evolution - 1];
  const balance = evolutionBalance[progress.evolution - 1];
  return lateMaterialCost({
    fractalis: balance.fractalis,
    materials: {
      ...Object.fromEntries(recipe.rarities.map((rarity, index) => [`${element}-${rarity.toLowerCase()}`, balance.amounts[index]])),
      ...(progress.evolution >= 4 ? { [specialtyId(element, 'evolution')]: progress.evolution === 4 ? 5 : 10 } : {}),
    },
  }, progress.evolution >= 4);
}

export function characterLevelCap(evolution: number, id?: StarterId, ascended = false): number {
  if (!Number.isInteger(evolution) || evolution < 1 || evolution > characterGrowth.forms) {
    throw new Error(`Character evolution must be an integer from 1 to ${characterGrowth.forms}.`);
  }

  if (ascended) return 115;
  if (id && isCalamiticCharacter(id) && evolution === 6) return 110;
  return characterGrowth.firstLevelCap + (evolution - 1) * characterGrowth.levelsPerEvolution;
}

export function characterLevelCost(id: StarterId, progress: CharacterProgress): UpgradeCost {
  return increasedMaterialCost(baseCharacterLevelCost(id, progress));
}

function baseCharacterLevelCost(id: StarterId, progress: CharacterProgress): UpgradeCost {
  const cost = baseLevelCost(getStarter(id).elementId, progress, id);
  if (isCalamiticCharacter(id)) {
    const destination = progress.level + 1;
    const chain = {
      'calamity-common': Math.ceil(destination / 30),
      ...Object.fromEntries(levelingMaterialTiers.filter((tier) => destination >= tier.destination)
        .map((tier) => [`calamity-${tier.rarity.toLowerCase()}`, 1])),
      ...(destination >= 91 ? { 'fragment-of-rise': 1 } : {}),
    };
    return lateMaterialCost({ fractalis: cost.fractalis, materials: chain }, destination >= 61);
  }
  if (isNewEventCharacter(id)) {
    const family = newEventForCharacter(id)!.family;
    return lateMaterialCost({ fractalis: cost.fractalis, materials: levelingMaterials(family, progress.level + 1) },
      progress.level + 1 >= 61);
  }
  if (!isRoseCharacter(id)) return cost;
  return lateMaterialCost({ fractalis: cost.fractalis, materials: levelingMaterials('rosethorn', progress.level + 1) },
    progress.level + 1 >= 61);
}

export function characterEvolutionCost(id: StarterId, progress: CharacterProgress): UpgradeCost {
  return increasedMaterialCost(baseCharacterEvolutionCost(id, progress));
}

function baseCharacterEvolutionCost(id: StarterId, progress: CharacterProgress): UpgradeCost {
  const cost = baseEvolutionCost(getStarter(id).elementId, progress, id);
  if (isCalamiticCharacter(id)) {
    const recipes = ['calamity-rare', 'calamity-epic', 'calamity-legendary', 'calamity-omnic', 'fragment-of-rise'] as const;
    const amount = [5, 5, 5, 5, 5][progress.evolution - 1];
    const chestAmount = [1, 2, 3, 5, 8][progress.evolution - 1];
    const materials = { ...cost.materials, [recipes[progress.evolution - 1]]: amount,
      'feather-severed-dawn': chestAmount, 'splinter-unmade-night': chestAmount };
    return lateMaterialCost({ fractalis: cost.fractalis, materials }, progress.evolution >= 4);
  }
  if (isNewEventCharacter(id)) {
    const familyMaterials = newEventMaterialIds(newEventForCharacter(id)!.id);
    const recipe = evolutionRecipes[progress.evolution - 1];
    const balance = evolutionBalance[progress.evolution - 1];
    return lateMaterialCost({ fractalis: cost.fractalis, materials: Object.fromEntries(recipe.rarities.map((rarity, index) => [
      familyMaterials[materialRarities.indexOf(rarity)], balance.amounts[index],
    ])) }, progress.evolution >= 4);
  }
  if (!isRoseCharacter(id)) return cost;
  const recipe = evolutionRecipes[progress.evolution - 1];
  const balance = evolutionBalance[progress.evolution - 1];
  return lateMaterialCost({ fractalis: cost.fractalis, materials: {
    ...Object.fromEntries(recipe.rarities.map((rarity, index) => [
      roseMaterials[materialRarities.indexOf(rarity)].id, balance.amounts[index],
    ])),
  } }, progress.evolution >= 4);
}

export function characterEvolutionRequirement(id: StarterId, evolution: number) {
  const requirement = evolutionRequirement(getStarter(id).elementId, evolution);
  const event = newEventForCharacter(id);
  return { ...requirement, infusion: isRoseCharacter(id) ? 'roses' as const : event?.id ?? requirement.infusion };
}

export function characterGrowthFactor(progress: CharacterProgress, id?: StarterId): number {
  if (!Number.isInteger(progress.weaponRank ?? 0) || (progress.weaponRank ?? 0) < 0 || (progress.weaponRank ?? 0) > weaponRules.maximumRank) throw new Error('Invalid weapon rank.');
  const cap = characterLevelCap(progress.evolution, id, progress.ascension?.stats === true);
  if (!Number.isInteger(progress.level) || progress.level < 0 || progress.level > cap) {
    throw new Error(`Character level must be an integer from 0 to ${cap}.`);
  }
  return 1 + progress.level * characterGrowth.perLevel +
    (progress.evolution - 1) * characterGrowth.perEvolution;
}

export function characterPotencyFactor(progress: CharacterProgress, id?: StarterId): number {
  characterGrowthFactor(progress, id);
  return 1 + progress.level * .003 + (progress.evolution - 1) * .05;
}

export const upgradePaths = [
  { id: 'upgrade-0', name: 'Fracture & Evolution', detail: 'Preserve your level; add 150% of base core stats and increase skill and passive potency.' },
  { id: 'upgrade-1', name: 'Character level', detail: 'Linear core-stat growth: add 15% of base per level. Later enemies accelerate; build Conduits and a reliable squad.' },
  { id: 'upgrade-3', name: 'Unique passive', detail: 'Upgrade the character\'s unique passive ability.' },
  { id: 'upgrade-4', name: 'Ability 1', detail: 'Upgrade the first active ability.' },
  { id: 'upgrade-5', name: 'Ability 2', detail: 'Upgrade the second active ability.' },
  { id: 'upgrade-6', name: 'Last Flare', detail: 'Upgrade the ultimate. Naming format: Last Flare: <character-specific name>.' },
] as const;
