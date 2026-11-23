import type { RadiantStats } from './combat-kits';
import type { Stats } from './combat';

export type RadiantEnemyCategory = 'ordinary' | 'boss' | 'calamity';
export interface RadiantEnemyFactors { hp: number; attack: number; defense: number }
export interface RadiantCalibrationPoint extends RadiantEnemyFactors { level: number }
export interface RadiantEnemyCalibration {
  id: string;
  points: readonly RadiantCalibrationPoint[];
  /** Optional per-category level curves (Step 4 retune); a category without one uses `points`. */
  categoryPoints?: Partial<Record<RadiantEnemyCategory, readonly RadiantCalibrationPoint[]>>;
  categories: Record<RadiantEnemyCategory, RadiantEnemyFactors>;
}
const unity = { hp: 1, attack: 1, defense: 1 };
/** Every enemy calibration a frozen run may carry. */
export const radiantCalibrationIds = ['authored-control', 'radiant-pressure-v2', 'radiant-trio-v1', 'radiant-trio-v2'] as const;
export type RadiantCalibrationId = typeof radiantCalibrationIds[number];
/** New encounters start on this calibration (D-493 retune). */
export const liveRadiantCalibrationId = 'radiant-trio-v2' as const;
/** Earlier live calibrations (before D-481, before the D-493 retune): runs already underway on them may still finish. */
export const previousLiveRadiantCalibrationIds: readonly RadiantCalibrationId[] = ['authored-control', 'radiant-trio-v1'];
export const authoredRadiantCalibration: RadiantEnemyCalibration = {
  id: 'authored-control', points: [{ level: 1, ...unity }, { level: 185, ...unity }],
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
/**
 * Calibration `radiant-trio-v1` (candidate D, owner-approved D-481; live until the D-493 retune, now frozen): levels 1-95 unchanged; above
 * that an enemy of level L gets the shared curve's stats at a lower effective level that never falls as
 * L rises. Ordinary enemies, bosses and Calamity each have their own curve. Fitted by
 * `node tools\run_pressure_study.mjs <out> --retune-fit` (tools/retune-fit.ts).
 */
export const radiantTrioCalibration: RadiantEnemyCalibration = {
  id: 'radiant-trio-v1',
  points: [
    { level: 1, hp: 1, attack: 1, defense: 1 },
    { level: 95, hp: 1, attack: 1, defense: 1 },
    { level: 100, hp: .6981, attack: .7958, defense: .7819 },
    { level: 105, hp: .5005, attack: .6457, defense: .6275 },
    { level: 110, hp: .362, attack: .5435, defense: .5235 },
    { level: 115, hp: .274, attack: .472, defense: .451 },
    { level: 120, hp: .2227, attack: .418, defense: .3972 },
    { level: 140, hp: .2128, attack: .4513, defense: .4163 },
    { level: 150, hp: .1408, attack: .358, defense: .3105 },
    { level: 155, hp: .1126, attack: .3264, defense: .2675 },
    { level: 160, hp: .09, attack: .2895, defense: .2292 },
    { level: 170, hp: .0576, attack: .2472, defense: .1709 },
    { level: 180, hp: .0369, attack: .1812, defense: .1239 },
    { level: 185, hp: .0412, attack: .1869, defense: .1285 },
  ],
  categoryPoints: {
    boss: [
      { level: 1, hp: 1, attack: 1, defense: 1 },
      { level: 90, hp: 1, attack: 1, defense: 1 },
      { level: 105, hp: .671, attack: .7751, defense: .765 },
      { level: 115, hp: .3924, attack: .5931, defense: .5768 },
      { level: 120, hp: .3189, attack: .5252, defense: .5079 },
      { level: 125, hp: .2901, attack: .5018, defense: .4814 },
      { level: 135, hp: .2164, attack: .4502, defense: .4178 },
      { level: 140, hp: .1863, attack: .4145, defense: .3807 },
      { level: 150, hp: .1611, attack: .3874, defense: .3376 },
      { level: 165, hp: .1004, attack: .3214, defense: .2409 },
      { level: 175, hp: .0643, attack: .255, defense: .1771 },
      { level: 180, hp: .0514, attack: .2183, defense: .1508 },
      { level: 185, hp: .0556, attack: .2177, defense: .1509 },
    ],
    calamity: [
      { level: 1, hp: 1, attack: 1, defense: 1 },
      { level: 80, hp: 1, attack: 1, defense: 1 },
      { level: 145, hp: .1762, attack: .4053, defense: .3629 },
      { level: 160, hp: .1338, attack: .3604, defense: .2887 },
      { level: 170, hp: .0968, attack: .3276, defense: .2299 },
      { level: 185, hp: .0918, attack: .2877, defense: .2036 },
    ],
  },
  categories: { ordinary: unity, boss: unity, calamity: unity },
};
/**
 * Live calibration `radiant-trio-v2` (owner-approved 2026-11-23, D-493): the one enemy retune on the final
 * Conduit set (B1-B5d). Same effective-level model as `radiant-trio-v1`, refitted by
 * `node tools\run_pressure_study.mjs <out> --retune-fit` against the D-481 targets (ordinary >= 95% per
 * activity x 20-level band; Calamity EX+1/2/3 80/50/30%). `radiant-trio-v1` stays frozen for underway runs.
 */
export const radiantTrioV2Calibration: RadiantEnemyCalibration = {
  id: 'radiant-trio-v2',
  points: [
    { level: 1, hp: 1, attack: 1, defense: 1 },
    { level: 100, hp: 1, attack: 1, defense: 1 },
    { level: 105, hp: .7169, attack: .8113, defense: .8025 },
    { level: 110, hp: .5185, attack: .6829, defense: .6694 },
    { level: 115, hp: .3924, attack: .5931, defense: .5768 },
    { level: 120, hp: .3189, attack: .5252, defense: .5079 },
    { level: 140, hp: .4665, attack: .6852, defense: .6465 },
    { level: 150, hp: .3229, attack: .5573, defense: .4949 },
    { level: 155, hp: .2795, attack: .533, defense: .4482 },
    { level: 160, hp: .2235, attack: .4727, defense: .384 },
    { level: 170, hp: .153, attack: .4225, defense: .3004 },
    { level: 180, hp: .098, attack: .3096, defense: .2178 },
    { level: 185, hp: .0918, attack: .2877, defense: .2036 },
  ],
  categoryPoints: {
    boss: [
      { level: 1, hp: 1, attack: 1, defense: 1 },
      { level: 105, hp: 1, attack: 1, defense: 1 },
      { level: 115, hp: .8522, attack: .9217, defense: .9173 },
      { level: 120, hp: .6926, attack: .8162, defense: .8078 },
      { level: 125, hp: .5901, attack: .7455, defense: .7303 },
      { level: 135, hp: .4402, attack: .6687, defense: .6338 },
      { level: 140, hp: .379, attack: .6157, defense: .5775 },
      { level: 150, hp: .3087, attack: .5436, defense: .4823 },
      { level: 165, hp: .245, attack: .5115, defense: .3989 },
      { level: 175, hp: .1568, attack: .4058, defense: .2933 },
      { level: 180, hp: .1255, attack: .3474, defense: .2498 },
      { level: 185, hp: .116, attack: .3128, defense: .2277 },
    ],
    calamity: [
      { level: 1, hp: 1, attack: 1, defense: 1 },
      { level: 80, hp: 1, attack: 1, defense: 1 },
      { level: 145, hp: .4041, attack: .6309, defense: .5784 },
      { level: 160, hp: .4891, attack: .6946, defense: .612 },
      { level: 170, hp: .5595, attack: .7891, defense: .6784 },
      { level: 185, hp: .5603, attack: .6677, defense: .6588 },
    ],
  },
  categories: { ordinary: unity, boss: unity, calamity: unity },
};
const calibrationsById: Record<RadiantCalibrationId, RadiantEnemyCalibration> = {
  'authored-control': authoredRadiantCalibration,
  'radiant-pressure-v2': pressureRadiantCalibration,
  'radiant-trio-v1': radiantTrioCalibration,
  'radiant-trio-v2': radiantTrioV2Calibration,
};
export function isRadiantCalibrationId(value: unknown): value is RadiantCalibrationId {
  return typeof value === 'string' && (radiantCalibrationIds as readonly string[]).includes(value);
}
export function radiantCalibration(id: RadiantCalibrationId): RadiantEnemyCalibration {
  return calibrationsById[id];
}
export const liveRadiantCalibration = radiantTrioV2Calibration;
export function radiantEnemyFactors(
  level: number, category: RadiantEnemyCategory, calibration: RadiantEnemyCalibration,
): RadiantEnemyFactors {
  if (!Number.isInteger(level) || level < 1 || level > 185) throw new Error('Invalid authored enemy level.');
  const points = calibration.categoryPoints?.[category] ?? calibration.points;
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
/** Extra calibrations the offline retune study measures beside authored-control and the live one. */
export const radiantRetuneCandidates: readonly RadiantEnemyCalibration[] = [];
