/** Encounter sizing: 1-6 enemies per battle, bosses alone but harder, stage loot totals preserved. */

export const maximumEncounterSize = 6;
/** Stage-boss multipliers; bosses fight alone instead of gaining fodder. */
export const stageBossFactors = { health: 1.1, damage: 1 } as const;
/** Legacy per-encounter loot carriers (old ordinary 2 / Training 3); never grows with encounter size. */
export const ordinaryRewardDrops = 2;
export const trainingRewardDrops = 3;
export const storyEncounterMaximum = 2;
const rhythm = [0, 1, -1, 0, 1] as const;

function clampSize(size: number, minimum: number): number {
  return Math.max(minimum, Math.min(maximumEncounterSize, size));
}

/** Ordinary stages keep compact early fights, then grow to 4-6 late; bosses stay alone. */
export function stagedEncounterSize(
  stage: number,
  stages: number,
  boss: boolean,
  minimum = ordinaryRewardDrops,
  maximum = maximumEncounterSize,
): number {
  if (!Number.isInteger(stage) || !Number.isInteger(stages) || stages < 1 || stage < 1 || stage > stages) {
    throw new Error('Invalid encounter stage.');
  }
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 1 || maximum < minimum || maximum > maximumEncounterSize) {
    throw new Error('Invalid encounter size bounds.');
  }
  if (boss) return 1;
  const progress = stages === 1 ? 1 : (stage - 1) / (stages - 1);
  const variation = progress >= 0.5 ? rhythm[stage % 5] : 0;
  return Math.max(minimum, Math.min(maximum, clampSize(1 + Math.round(progress * 4) + variation, minimum)));
}

/** Endless Training waves grow from three enemies at wave 1 to six near wave 120. */
export function trainingWaveSize(wave: number): number {
  if (!Number.isSafeInteger(wave) || wave < 1) throw new Error('Invalid Training wave.');
  const progress = Math.min(1, (wave - 1) / 119);
  const variation = progress >= 0.75 ? rhythm[(wave - 1) % 5] : 0;
  return clampSize(3 + Math.round(progress * 3) + variation, trainingRewardDrops);
}

/** Spreads exactly min(drops, size) loot carriers evenly across the formation; other enemies drop no loot. */
export function isRewardCarrier(index: number, size: number, drops: number): boolean {
  if (!Number.isInteger(index) || !Number.isInteger(size) || !Number.isInteger(drops) || index < 0 || index >= size || drops < 1) {
    throw new Error('Invalid reward carrier query.');
  }
  const carriers = Math.min(drops, size);
  return Math.ceil((index + 1) * carriers / size) > Math.ceil(index * carriers / size);
}
