import { dungeonStageCount, infusionStageCount, storyStageLayout, warStageCount, type InfusionModeId } from './activities';

export const finalBossLootMultiplier = 5;
export const finalBossLootText = 'Final bosses give 5x currency and component quantities on every clear. Elemental Dungeon materials include their stage-based reduction after the final-boss boost; Soar and Delve specialties grow linearly to 11-23 each with no extra final-boss boost. Other material quantities receive 5x. Drop, capture and recruitment chances, Conduits, chests and one-time Story bonuses are not multiplied. Calamity bosses give one unmultiplied chest instead.';

export function bossLootMultiplier(activity: {
  story?: { storyStage: number };
  dungeon?: { stage: number };
  infusion?: { mode: InfusionModeId; stage: number };
  war?: { stage: number };
}, boss = true): number {
  if (!boss) return 1;
  const final = activity.story ? activity.story.storyStage >= storyStageLayout.regionStages && activity.story.storyStage <= storyStageLayout.stages && activity.story.storyStage % storyStageLayout.regionStages === 0
    : activity.dungeon ? activity.dungeon.stage === dungeonStageCount
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
