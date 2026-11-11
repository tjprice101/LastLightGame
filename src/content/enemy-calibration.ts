import type { RadiantStats } from './combat-kits';
import type { Stats } from './combat';

export type RadiantEnemyCategory = 'ordinary' | 'boss' | 'calamity';
export interface RadiantEnemyFactors { hp: number; attack: number; defense: number }
export interface RadiantCalibrationPoint extends RadiantEnemyFactors { level: number }
export interface RadiantEnemyCalibration {
  id: string;
  points: readonly RadiantCalibrationPoint[];
  categories: Record<RadiantEnemyCategory, RadiantEnemyFactors>;
}
const unity = { hp: 1, attack: 1, defense: 1 };
export const liveRadiantCalibrationId = 'authored-control' as const;
export const authoredRadiantCalibration: RadiantEnemyCalibration = {
  id: liveRadiantCalibrationId, points: [{ level: 1, ...unity }, { level: 185, ...unity }],
  categories: { ordinary: unity, boss: unity, calamity: unity },
};
// Experimental overlay only: never feeds live spawn, progression or rewards.
export const pressureRadiantCalibration: RadiantEnemyCalibration = {
  id: 'radiant-pressure-v2',
  points: [
    { level: 1, hp: 1, attack: 1, defense: 1 },
    { level: 30, hp: .7, attack: .75, defense: 1 },
    { level: 60, hp: .5, attack: .5, defense: .9 },
    { level: 80, hp: .4, attack: .4, defense: .8 },
    { level: 120, hp: .25, attack: .2, defense: .6 },
    { level: 140, hp: .18, attack: .12, defense: .5 },
    { level: 170, hp: .12, attack: .07, defense: .4 },
    { level: 185, hp: .12, attack: .07, defense: .4 },
  ],
  categories: { ordinary: unity, boss: unity, calamity: { hp: 1.5, attack: 3, defense: 1.1 } },
};
export function radiantEnemyFactors(
  level: number, category: RadiantEnemyCategory, calibration: RadiantEnemyCalibration,
): RadiantEnemyFactors {
  if (!Number.isInteger(level) || level < 1 || level > 185) throw new Error('Invalid authored enemy level.');
  const points = calibration.points;
  if (points.length < 2 || points[0].level !== 1 || points.at(-1)!.level !== 185 ||
    points.some((point, i) => !Number.isInteger(point.level) || i > 0 && point.level <= points[i - 1].level))
    throw new Error('Invalid radiant calibration anchors.');
  const categoryFactor = calibration.categories[category];
  if (!categoryFactor) throw new Error('Invalid radiant enemy category.');
  for (const factor of [...points, ...Object.values(calibration.categories)])
    for (const key of ['hp', 'attack', 'defense'] as const)
      if (!Number.isFinite(factor[key]) || factor[key] <= 0 || factor[key] > 10)
        throw new Error('Invalid radiant calibration magnitude.');
  const afterIndex = Math.max(1, points.findIndex(point => point.level >= level));
  const before = points[afterIndex - 1], after = points[afterIndex];
  const t = (level - before.level) / (after.level - before.level);
  return Object.fromEntries((['hp', 'attack', 'defense'] as const).map(key =>
    [key, (before[key] + (after[key] - before[key]) * t) * categoryFactor[key]])) as unknown as RadiantEnemyFactors;
}
export function calibratedRadiantEnemyStats(
  authored: Stats, level: number, category: RadiantEnemyCategory, calibration: RadiantEnemyCalibration,
): RadiantStats {
  const factors = radiantEnemyFactors(level, category, calibration);
  return { hp: Math.max(1, Math.round(authored.health * factors.hp)),
    attack: authored.damage * factors.attack, defense: authored.defense * factors.defense, recovery: 0 };
}
