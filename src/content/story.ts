import { type ElementId } from './activities';
import { type Stats } from './combat';
import { elementAccents } from './dungeon-art';
import { storyStageLayout } from './activities';
import { enemyCombatStats } from './stat-growth';
import { materialRewardRange, rollDrop } from './loot-random';
import { activityPrismaticaDrop } from './prismatica';
import { bossLootMultiplier, bossLootRange } from './final-boss-loot';
import { storyRegionArt } from './story-art';
import { enemyAbilityMultiplier } from './enemy-skills';

export const storyRules = { regionStages: storyStageLayout.regionStages, stages: storyStageLayout.stages, startingLevel: 1, maximumLevel: 55 } as const;
/** First clear of a Story stage pays both currencies; replays pay only the Prismatica (D-343). */
export const storyCompletionReward = { fractalis: 150, lycalis: 2 } as const;
export const storyReplayReward = { fractalis: storyCompletionReward.fractalis, lycalis: 0 } as const;
export function storyClearReward(firstClear: boolean): { fractalis: number; lycalis: number } {
  return firstClear ? storyCompletionReward : storyReplayReward;
}

const storyRegionCount = storyStageLayout.stages / storyStageLayout.regionStages;
function remapStoryCompleted(completed: number, regionStages: number): number {
  if (!Number.isSafeInteger(completed) || completed < 0 || completed > regionStages * storyRegionCount) throw new Error('Invalid saved Story progress.');
  const region = Math.floor(completed / regionStages);
  const within = completed % regionStages;
  return region * storyRules.regionStages + Math.floor(within * storyRules.regionStages / regionStages);
}
/** Maps a clear count saved on the original six-region 25-stage layout (pre-v6) to the current layout. Partial regions round down. */
export function migrateLegacyStoryCompleted(completed: number): number {
  return remapStoryCompleted(completed, storyStageLayout.legacyRegionStages);
}
/** Maps a clear count saved on the 18-stage-region layout (v6-v7) to the current 20-stage layout; never loses a clear. */
export function migratePreviousStoryCompleted(completed: number): number {
  return remapStoryCompleted(completed, storyStageLayout.previousRegionStages);
}
export const storyRegions: readonly {
  element: ElementId; name: string; introduction: string; enemies: readonly string[]; boss: string; conclusion: string;
}[] = [
  { element: 'infernic', name: 'Emberwake March', introduction: 'Restore the first beacon in the Infernic region to open the road to Glasswater Reach.',
    enemies: ['Cinderling', 'Ashback Boar', 'Coalcrest Moth', 'Furnace Jackal'], boss: 'Kilnheart Warden',
    conclusion: 'Emberwake March cleared. The first beacon is restored; Glasswater Reach is now open.' },
  { element: 'oceanic', name: 'Glasswater Reach', introduction: 'Cross the Oceanic causeways and restore the second beacon to reach Stormspan Heights.',
    enemies: ['Tideglass Crab', 'Foamfin Drake', 'Pearlshell Turtle', 'Current Ray'], boss: 'Deepbell Leviathan',
    conclusion: 'Glasswater Reach cleared. The second beacon is restored; Stormspan Heights is now open.' },
  { element: 'atmospheric', name: 'Stormspan Heights', introduction: 'Cross the Atmospheric sky bridges and restore the third beacon to reach Rootstone Wilds.',
    enemies: ['Cloudhorn Ram', 'Staticwing Kite', 'Gusttail Lynx', 'Thundercoil Serpent'], boss: 'Tempest Crown Roc',
    conclusion: 'Stormspan Heights cleared. The third beacon is restored; Rootstone Wilds is now open.' },
  { element: 'botanic', name: 'Rootstone Wilds', introduction: 'Follow the Botanic garden paths and restore the fourth beacon to reach Stillhalo Vale.',
    enemies: ['Mossplate Beetle', 'Briarback Stag', 'Loamjaw Mole', 'Fernmantle Basilisk'], boss: 'Heartwood Colossus',
    conclusion: 'Rootstone Wilds cleared. The fourth beacon is restored; Stillhalo Vale is now open.' },
  { element: 'tranquilitic', name: 'Stillhalo Vale', introduction: 'Restore the fifth beacon in the Tranquilitic sanctuaries to reach Riftbound Frontier.',
    enemies: ['Ivoryveil Moth', 'Dewhalo Hart', 'Vowcrest Crane', 'Opalward Lion'], boss: 'Serene Oathkeeper',
    conclusion: 'Stillhalo Vale cleared. The fifth beacon is restored; Riftbound Frontier is now open.' },
  { element: 'chaotic', name: 'Riftbound Frontier', introduction: 'Cross the Chaotic fractures and defeat Fracture Sovereign to restore the final beacon.',
    enemies: ['Riftfang Hound', 'Splinterhide Lizard', 'Voidcrest Raven', 'Faultcoil Wyrm'], boss: 'Fracture Sovereign',
    conclusion: 'All six regions cleared and their beacons restored. Neither Let\'s nor Rise\'s soul has been found.' },
];

export function storyEncounter(stage: number) {
  if (!Number.isInteger(stage) || stage < 1 || stage > storyRules.stages) throw new Error(`Story stage must be from 1 to ${storyRules.stages}.`);
  const regionIndex = Math.floor((stage - 1) / storyRules.regionStages);
  const region = storyRegions[regionIndex];
  const regionStage = (stage - 1) % storyRules.regionStages + 1;
  const level = Math.round(storyRules.startingLevel + (stage - 1) *
    (storyRules.maximumLevel - storyRules.startingLevel) / (storyRules.stages - 1));
  const boss = regionStage === storyRules.regionStages;
  const stats: Stats = enemyCombatStats(level, boss);
  return { ...region, name: region.name, stage, regionIndex, regionStage, level, boss, stats,
    color: elementAccents[region.element], background: storyRegionArt[region.element]?.background ?? null,
    abilityMultiplier: enemyAbilityMultiplier(level) };
}

export function storyCreature(stage: number, identity: number): { id: string; name: string; art?: string } {
  const encounter = storyEncounter(stage);
  if (!Number.isInteger(identity) || identity < 0 || identity >= (encounter.boss ? 1 : 4)) throw new Error('Invalid Story enemy identity.');
  const art = storyRegionArt[encounter.element];
  return { ...(art ? { art: encounter.boss ? art.boss : art.enemies[identity] } : {}),
    id: `story:${encounter.element}:${encounter.boss ? 'boss' : identity}`,
    name: encounter.boss ? storyRegions[encounter.regionIndex].boss : encounter.enemies[identity] };
}

export function storyBossBonus(stage: number) {
  const encounter = storyEncounter(stage);
  if (!encounter.boss) throw new Error('Only a regional Story boss has a first-clear bonus.');
  const numerator = 115 ** encounter.regionIndex;
  const denominator = 100 ** encounter.regionIndex;
  return { fractalis: Math.round(1000 * numerator / denominator), lycalis: Math.round(50 * numerator / denominator) };
}

export function storyMaterialLoot(stage: number) {
  const { element, level } = storyEncounter(stage);
  const growth = ((level - 1) / 54) ** 2;
  const minimum = 1 + Math.floor(2 * growth);
  const drops = [
    { id: `${element}-common`, minimum, maximum: minimum * 2, chance: 1 },
    { id: `${element}-uncommon`, minimum, maximum: minimum * 2, chance: .25 + .55 * (level - 1) / 54 },
  ];
  return drops.map(drop => materialRewardRange(bossLootRange(drop, bossLootMultiplier({ story: { storyStage: stage } }))));
}

export function storyDrops(stage: number, random: () => number): Record<string, number> {
  return Object.fromEntries(storyMaterialLoot(stage).flatMap((drop) => {
    const amount = rollDrop(drop, random);
    return amount === undefined ? [] : [[drop.id, amount]];
  }));
}

export const storyRulesText = `Six regions of ${storyRules.regionStages} stages, Lv.1-55. First clear: 150 Prismatica and 2 Null-Prismatica; replays: 150 Prismatica. Enemies drop Common and Uncommon materials of their region; no captures. Material rewards are halved after the quantity roll, rounded to the nearest whole unit with a minimum of 1. Prismatica per kill grows linearly from 8-16 at Stage 1 to 750-1,500 at Stage ${storyRules.stages}, with no regional-boss multiplier. Regional bosses give 5x materials before the reduction and a one-time bonus of 1,000 Prismatica and 50 Null-Prismatica, rising 15% per region. Continue restores HP and keeps Gauge.`;

export function storyLoot(stage: number) {
  const encounter = storyEncounter(stage);
  return [{ id: 'fractalis', ...activityPrismaticaDrop({ story: { storyStage: stage } }, encounter.level) }, ...storyMaterialLoot(stage)];
}
