import { infusionStageCount, storyStageLayout, warStageCount, type InfusionModeId } from './activities';

export const finalBossLootMultiplier = 5;
export const finalBossLootText = 'Prismatica grows linearly across each activity with no boss multiplier. Ordinary material rewards are halved after the quantity roll, rounded to the nearest whole unit with a minimum of 1. Soar and Delve final evolution specialties award 4 and leveling specialties 4-5. Final-boss Null-Prismatica and Machine components keep their quantity boosts; Story materials receive their boss boost before the material reduction. Drop, capture and recruitment chances, Conduits, chest counts and one-time Story bonuses are unchanged. Calamity bosses give one chest; only its material contents reduce 15%, not 50%.';

export function bossLootMultiplier(activity: {
  story?: { storyStage: number };
  dungeon?: { stage: number };
  infusion?: { mode: InfusionModeId; stage: number };
  war?: { stage: number };
}, boss = true): number {
  if (!boss) return 1;
  const final = activity.story ? activity.story.storyStage >= storyStageLayout.regionStages && activity.story.storyStage <= storyStageLayout.stages && activity.story.storyStage % storyStageLayout.regionStages === 0
    : activity.dungeon ? false
    : activity.infusion ? activity.infusion.stage === infusionStageCount(activity.infusion.mode)
    : activity.war ? activity.war.stage === warStageCount : false;
  return final ? finalBossLootMultiplier : 1;
}

export function bossLootRange<T extends { minimum: number; maximum: number }>(drop: T, multiplier: number): T & { quantityMultiplier?: number } {
  if (!Number.isSafeInteger(multiplier) || multiplier < 1 ||
      !Number.isSafeInteger(drop.minimum * multiplier) || !Number.isSafeInteger(drop.maximum * multiplier)) {
    throw new Error('Final-boss loot exceeds supported quantities.');
  }
  if (multiplier === 1) return drop;
  return { ...drop, minimum: drop.minimum * multiplier, maximum: drop.maximum * multiplier, quantityMultiplier: multiplier };
}
