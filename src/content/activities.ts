export const elements = [
  { id: 'infernic', name: 'Infernic', affinity: 'Fire', dungeon: 'Flaming Depths', infusion: 'heavens' },
  { id: 'oceanic', name: 'Oceanic', affinity: 'Water', dungeon: 'Oceanic Valley', infusion: 'heavens' },
  { id: 'atmospheric', name: 'Atmospheric', affinity: 'Wind', dungeon: 'Sky-bound Rift', infusion: 'heavens' },
  { id: 'botanic', name: 'Botanic', affinity: 'Nature', dungeon: 'Garden of Beauty', infusion: 'heavens' },
  { id: 'tranquilitic', name: 'Tranquilitic', affinity: 'Peace', dungeon: 'City of Heaven', infusion: 'abyss' },
  { id: 'chaotic', name: 'Chaotic', affinity: 'Dark Matter & Energy', dungeon: 'Ruins of Chaos', infusion: 'abyss' },
] as const;

export type ElementId = (typeof elements)[number]['id'];
export const materialRarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Omnic'] as const;
export type MaterialRarity = (typeof materialRarities)[number];
/** Highest character level whose next level-up first needs each rarity (leveling destinations 31/46/61/76/91). */
export const materialFirstNeededLevel = { Common: 0, Uncommon: 30, Rare: 45, Epic: 60, Legendary: 75, Omnic: 90 } as const satisfies Record<MaterialRarity, number>;
/** D-357: an enemy of level X drops the materials a character of level X-5 needs next. */
export const materialDropLevelOffset = 5;
export function materialDropLevel(rarity: MaterialRarity): number {
  return rarity === 'Common' ? 1 : materialFirstNeededLevel[rarity] + materialDropLevelOffset;
}
export const elementalMaterials = elements.flatMap((element) => materialRarities.map((rarity) => ({
  id: `${element.id}-${rarity.toLowerCase()}`,
  elementId: element.id,
  rarity,
  name: `${element.name} ${rarity} Material`,
})));
export const dungeonStageCount = 35;
/** Soar to Heaven / Delve into the Abyss use 25 stages (D-346); wallets before v7 recorded 35. */
export const infusionModeStageCount = 25;
/** D-380: 35 stages; v7-v8 wallets recorded 75, and pre-v7 wallets recorded 100. */
export const machineStageCount = 35;
export const previousMachineStageCount = 75;
export function migratePreviousMachineStage(stage: number): number {
  if (!Number.isSafeInteger(stage) || stage < 1 || stage > previousMachineStageCount) throw new Error('Invalid saved Machines stage.');
  return Math.max(1, Math.floor(stage * machineStageCount / previousMachineStageCount));
}
export const legacyActivityStageCounts = { heavens: 35, abyss: 35, machines: 100 } as const;
export type ResizedActivityId = keyof typeof legacyActivityStageCounts;
export function isResizedActivity(mode: string): mode is ResizedActivityId {
  return Object.hasOwn(legacyActivityStageCounts, mode);
}
/** Maps a pre-v7 saved unlocked stage onto the shorter layout; partial progress rounds up so no clear is lost, final stays final. */
export function migrateLegacyActivityStage(mode: ResizedActivityId, stage: number): number {
  const legacy = legacyActivityStageCounts[mode];
  const current = mode === 'machines' ? previousMachineStageCount : infusionModeStageCount;
  if (!Number.isSafeInteger(stage) || stage < 1 || stage > legacy) throw new Error('Invalid saved infusion stage.');
  return 1 + Math.ceil((stage - 1) * (current - 1) / (legacy - 1));
}
export const warStageCount = 10;
/** Story layout: six regions of 20 stages (D-347). v6-v7 saves recorded clears on 18-stage regions (D-340), older saves on 25. */
export const storyStageLayout = { regionStages: 20, stages: 120, previousRegionStages: 18, previousStages: 108, legacyRegionStages: 25, legacyStages: 150 } as const;
export const elementalDungeonRules = { stages: dungeonStageCount, startingLevel: 38, maximumLevel: 120, maximumLevelStage: dungeonStageCount } as const;
export const infusionModes = [
  { id: 'heavens', name: 'Soar to Heaven', energy: 'Light', enemyTheme: 'Dawnthorn Slime evolution line', stages: infusionModeStageCount, startingLevel: 50, enemyTiers: 6, uniqueEnemies: { minimum: 6, maximum: 6 } },
  { id: 'abyss', name: 'Delve into the Abyss', energy: 'Chaotic', enemyTheme: 'Wraththorn Slime evolution line', stages: infusionModeStageCount, startingLevel: 50, enemyTiers: 6, uniqueEnemies: { minimum: 6, maximum: 6 } },
] as const;
export const currencyModes = [
  { id: 'treasury', name: 'Crownfall Treasury', stages: 25, startingLevel: 65, maximumLevel: 120, enemyTiers: 6 },
  { id: 'sanctuary', name: 'Rosethorn Sanctuary', stages: 25, startingLevel: 65, maximumLevel: 120, enemyTiers: 6 },
] as const;
export const eventModes = [
  { id: 'roses', name: 'Passion of Crimson Roses', stages: 35, startingLevel: 80, maximumLevel: 140, enemyTiers: 6 },
] as const;
export const machineModes = [
  { id: 'machines', name: 'Awaken the Machines', stages: machineStageCount, startingLevel: 10, maximumLevel: 120, enemyTiers: 6 },
] as const;
export type InfusionModeId = (typeof infusionModes)[number]['id'] | (typeof currencyModes)[number]['id'] | (typeof eventModes)[number]['id'] | (typeof machineModes)[number]['id'];
export function isCurrencyMode(mode: InfusionModeId): boolean {
  return currencyModes.some((entry) => entry.id === mode);
}
export function infusionStageCount(mode: InfusionModeId): number {
  const definition = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].find((entry) => entry.id === mode);
  if (!definition) throw new Error('Unknown staged Elemental-Devourer mode.');
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
    /** D-346 addition rule: each captured copy is worth its form (1-6); the chosen copies must total this value. */
    fodderValue: from >= 3 ? (from - 2) * from : 0,
    quantitiesDefined: true,
  } as const;
}
