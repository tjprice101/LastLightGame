import { dungeonStageCount, infusionStageCount, storyStageLayout, warStageCount, type InfusionModeId } from './activities';

type CurrencyActivity = {
  dungeon?: { stage: number };
  infusion?: { mode: InfusionModeId; stage: number };
  story?: { storyStage: number };
  war?: { stage: number };
};

export function linearPrismaticaDrop(position: number, last: number,
  opening: readonly [number, number], final: readonly [number, number]) {
  if (!Number.isInteger(position) || !Number.isInteger(last) || last < 2 || position < 1 || position > last) {
    throw new Error('Invalid Prismatica progression position.');
  }
  const progress = (position - 1) / (last - 1);
  return { minimum: Math.round(opening[0] + (final[0] - opening[0]) * progress),
    maximum: Math.round(opening[1] + (final[1] - opening[1]) * progress), chance: 1 };
}

export function activityPrismaticaDrop(activity: CurrencyActivity, enemyLevel: number) {
  if (activity.story) return linearPrismaticaDrop(activity.story.storyStage, storyStageLayout.stages, [8, 16], [750, 1500]);
  if (activity.dungeon) return linearPrismaticaDrop(activity.dungeon.stage, dungeonStageCount, [5, 10], [300, 600]);
  if (activity.war) return linearPrismaticaDrop(activity.war.stage, warStageCount, [1500, 2500], [30000, 45000]);
  if (activity.infusion) {
    const { mode, stage } = activity.infusion;
    const endpoints: Record<InfusionModeId, { opening: readonly [number, number]; final: readonly [number, number] }> = {
      heavens: { opening: [6, 12], final: [500, 1000] },
      abyss: { opening: [6, 12], final: [500, 1000] },
      treasury: { opening: [133, 266], final: [30000, 60000] },
      sanctuary: { opening: [7, 14], final: [300, 600] },
      roses: { opening: [9, 18], final: [750, 1500] },
      machines: { opening: [5, 10], final: [500, 1000] },
    };
    const range = endpoints[mode];
    return linearPrismaticaDrop(stage, infusionStageCount(mode), range.opening, range.final);
  }
  return linearPrismaticaDrop(enemyLevel, 120, [5, 10], [300, 600]);
}
