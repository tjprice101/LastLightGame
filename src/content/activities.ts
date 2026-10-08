export const elements = [
  { id: 'infernic', name: 'Infernic', affinity: 'Fire', dungeon: 'Flaming Depths', infusion: 'heavens' },
  { id: 'aquatic', name: 'Aquatic', affinity: 'Water', dungeon: 'Oceanic Valley', infusion: 'heavens' },
  { id: 'tectonic', name: 'Tectonic', affinity: 'Earth', dungeon: 'Precipice of the Earth', infusion: 'heavens' },
  { id: 'efflorescent', name: 'Efflorescent', affinity: 'Nature', dungeon: 'Garden of Beauty', infusion: 'heavens' },
  { id: 'voltaic', name: 'Voltaic', affinity: 'Electricity', dungeon: 'Galvanic Field', infusion: 'abyss' },
  { id: 'atmospheric', name: 'Atmospheric', affinity: 'Wind', dungeon: 'Sky-bound Rift', infusion: 'heavens' },
  { id: 'luminous', name: 'Luminous', affinity: 'Light', dungeon: 'Lustrous River', infusion: 'abyss' },
  { id: 'ominous', name: 'Ominous', affinity: 'Shadow', dungeon: 'Valley of Solitude', infusion: 'abyss' },
  { id: 'tranquilitic', name: 'Tranquilitic', affinity: 'Peace', dungeon: 'City of Heaven', infusion: 'abyss' },
  { id: 'chaotic', name: 'Chaotic', affinity: 'Dark Matter ~ Energy', dungeon: 'Ruins of Chaos', infusion: 'abyss' },
] as const;

export type ElementId = (typeof elements)[number]['id'];
export const materialRarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Omnic'] as const;
export type MaterialRarity = (typeof materialRarities)[number];
export const elementalMaterials = elements.flatMap((element) => materialRarities.map((rarity) => ({
  id: `${element.id}-${rarity.toLowerCase()}`,
  elementId: element.id,
  rarity,
  name: `${element.name} ${rarity} Material`,
})));
export const dungeonStageCount = 35;
export const elementalDungeonRules = { stages: dungeonStageCount, startingLevel: 10, maximumLevel: 120, maximumLevelStage: dungeonStageCount } as const;
export const infusionModes = [
  { id: 'heavens', name: 'Soar to Heaven', energy: 'Light', enemyTheme: 'Dawnthorn Slime evolution line', stages: dungeonStageCount, startingLevel: 80, enemyTiers: 6, uniqueEnemies: { minimum: 6, maximum: 6 } },
  { id: 'abyss', name: 'Delve into the Abyss', energy: 'Chaotic', enemyTheme: 'Wraththorn Slime evolution line', stages: dungeonStageCount, startingLevel: 80, enemyTiers: 6, uniqueEnemies: { minimum: 6, maximum: 6 } },
] as const;
export const currencyModes = [
  { id: 'treasury', name: 'Crownfall Treasury', stages: 25, startingLevel: 65, maximumLevel: 120, enemyTiers: 6 },
  { id: 'sanctuary', name: 'Rosethorn Sanctuary', stages: 25, startingLevel: 65, maximumLevel: 120, enemyTiers: 6 },
] as const;
export const eventModes = [
  { id: 'roses', name: 'Passion of Crimson Roses', stages: 35, startingLevel: 80, maximumLevel: 140, enemyTiers: 6 },
] as const;
export const machineModes = [
  { id: 'machines', name: 'Awaken the Machines', stages: 100, startingLevel: 10, maximumLevel: 120, enemyTiers: 6 },
] as const;
export type InfusionModeId = (typeof infusionModes)[number]['id'] | (typeof currencyModes)[number]['id'] | (typeof eventModes)[number]['id'] | (typeof machineModes)[number]['id'];
export function isCurrencyMode(mode: InfusionModeId): boolean {
  return currencyModes.some((entry) => entry.id === mode);
}
export function infusionStageCount(mode: InfusionModeId): number {
  const definition = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].find((entry) => entry.id === mode);
  if (!definition) throw new Error('Unknown staged creature mode.');
  return definition.stages;
}
export function validateMachineStage(stage: number): void {
  const stages = infusionStageCount('machines');
  if (!Number.isInteger(stage) || stage < 1 || stage > stages) {
    throw new Error(`Awaken the Machines stage must be an integer from 1 to ${stages}.`);
  }
}

export function getElement(id: ElementId) {
  const element = elements.find((entry) => entry.id === id);
  if (!element) throw new Error(`Unknown element: ${id}`);
  return element;
}

export function elementalEnemyLevel(stage: number): number {
  if (!Number.isInteger(stage) || stage < 1 || stage > elementalDungeonRules.stages) {
    throw new Error(`Elemental dungeon stage must be an integer from 1 to ${dungeonStageCount}.`);
  }
  const progress = Math.min(stage, elementalDungeonRules.maximumLevelStage) - 1;
  return Math.round(elementalDungeonRules.startingLevel +
    progress * (elementalDungeonRules.maximumLevel - elementalDungeonRules.startingLevel) /
    (elementalDungeonRules.maximumLevelStage - 1));
}

export const evolutionRecipes = [
  { from: 1, to: 2, rarities: ['Common'] },
  { from: 2, to: 3, rarities: ['Common', 'Uncommon'] },
  { from: 3, to: 4, rarities: ['Uncommon', 'Rare'] },
  { from: 4, to: 5, rarities: ['Rare', 'Epic'] },
  { from: 5, to: 6, rarities: ['Epic', 'Legendary'] },
] as const satisfies readonly { from: number; to: number; rarities: readonly MaterialRarity[] }[];

export function evolutionRequirement(elementId: ElementId, from: number) {
  const element = getElement(elementId);
  const recipe = evolutionRecipes.find((entry) => entry.from === from);
  if (!recipe) throw new Error('Evolution source must be an integer from 1 to 5.');
  return {
    ...recipe, elementId, dungeon: element.dungeon, infusion: element.infusion,
    requiresFractalis: true, requiresInfusableEnemies: from >= 3,
    creatureCount: from >= 3 ? from - 2 : 0,
    minimumCreatureForm: from >= 3 ? from : null,
    quantitiesDefined: true,
  } as const;
}
