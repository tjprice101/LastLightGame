import { phaseZeroStatDefaults } from './phase-zero-stats';
import type { Stats } from './combat';

export const playableGrowth = { perLevel: .15, perEvolution: 1.5 } as const;
export const enemyExponentialRates = { health: .026, damage: .024, defense: .020 } as const;
export const enemyStrengthMultiplier = 1.05;
export const enemyResistanceRamp = { startingLevel: 80, span: 60, health: 3, damage: 1.5, defense: 2 } as const;
export const enemyCalamityApproach = { startingLevel: 80, endingLevel: 145, maximumAdvance: 10 } as const;
/** D-404: longer late fights, less burst; no Calamitic gear in calibration. */
export const enemyBenchmarkAnchors = [
  { level: 80, health: 1, damage: 1, defense: 1 },
  { level: 100, health: 1.2, damage: .95, defense: 1 },
  { level: 120, health: 1.4, damage: .9, defense: .95 },
  { level: 140, health: 1.5, damage: .82, defense: .9 },
  { level: 145, health: 1.5, damage: .8, defense: .9 },
  { level: 160, health: 1.5, damage: .7, defense: .875 },
  { level: 170, health: 1.5, damage: .6, defense: .85 },
  { level: 185, health: 1.5, damage: .6, defense: .85 },
] as const;
export function enemyBenchmarkMultiplier(level: number, stat: keyof typeof enemyExponentialRates): number {
  if (!Number.isInteger(level) || level < 1 || level > 185) throw new Error('Enemy benchmark level must be from 1 to 185.');
  if (level <= enemyBenchmarkAnchors[0].level) return 1;
  const index = enemyBenchmarkAnchors.findIndex(anchor => anchor.level >= level);
  const before = enemyBenchmarkAnchors[index - 1], after = enemyBenchmarkAnchors[index];
  const progress = (level - before.level) / (after.level - before.level);
  const blend = progress * progress * (3 - 2 * progress);
  return before[stat] + (after[stat] - before[stat]) * blend;
}
function hostileStat(base: number, initialRate: number, stat: keyof typeof enemyExponentialRates, level: number): number {
  const benchmark = enemyBenchmarkMultiplier(level, stat);
  if (level > enemyCalamityApproach.startingLevel && level < enemyCalamityApproach.endingLevel) {
    const progress = (level - enemyCalamityApproach.startingLevel) /
      (enemyCalamityApproach.endingLevel - enemyCalamityApproach.startingLevel);
    // Keep the historical approach separate from the benchmark adjustment.
    level += enemyCalamityApproach.maximumAdvance * 16 * progress ** 2 * (1 - progress) ** 2;
  }
  const rate = enemyExponentialRates[stat];
  const resistance = enemyResistanceRamp[stat] ** (Math.max(0, level - enemyResistanceRamp.startingLevel) / enemyResistanceRamp.span);
  return Math.round(base * (1 + initialRate * Math.expm1(rate * (level - 1)) / rate) * enemyStrengthMultiplier * resistance * benchmark);
}
export const enemyGrowth = { maximumLevel: 120, maximumHostileLevel: 185,
  health: hostileStat(83, .45, 'health', 120),
  bossHealth: hostileStat(207.5, .45, 'health', 120),
  damage: hostileStat(22, .25, 'damage', 120),
  bossDamage: hostileStat(27.5, .25, 'damage', 120),
  defense: hostileStat(4, .30, 'defense', 120),
  bossDefense: hostileStat(16 / 3, .30, 'defense', 120) } as const;
export const capturedGrowth = { health: 220, damage: 38, defense: 16 } as const;

export function enemyCombatStats(level: number, boss: boolean): Stats {
  if (!Number.isInteger(level) || level < 1 || level > enemyGrowth.maximumHostileLevel) throw new Error('Enemy level must be from 1 to 185.');
  return {
    ...phaseZeroStatDefaults,
    health: hostileStat(boss ? 207.5 : 83, .45, 'health', level),
    damage: hostileStat(boss ? 27.5 : 22, .25, 'damage', level),
    defense: hostileStat(boss ? 16 / 3 : 4, .30, 'defense', level),
    crit: .12, critMultiplier: 1.5, shatterCapacity: 100, elementalDamage: 0,
  };
}

export function stagedEnemyAttack(level: number, boss: boolean, startingLevel = 10, maximumLevel: number = enemyGrowth.maximumLevel): number {
  if (!Number.isInteger(level) || level < 1 || !Number.isInteger(startingLevel) || startingLevel < 1 || startingLevel > level ||
      !Number.isInteger(maximumLevel) || maximumLevel < 120 || maximumLevel > 140) throw new Error('Invalid staged enemy range.');
  return enemyCombatStats(Math.min(level, maximumLevel), boss).damage;
}

export function enemyStat(base: number, target: number, level: number, startingLevel: number, initialRate: number, maximumLevel: number = enemyGrowth.maximumLevel, extensionRate = initialRate): number {
  if (![base, target, initialRate, extensionRate].every(Number.isFinite) || base <= 0 || target < base || initialRate <= 0 || extensionRate <= 0 ||
      !Number.isInteger(level) || !Number.isInteger(startingLevel) || startingLevel < 1 ||
      !Number.isInteger(maximumLevel) || maximumLevel < enemyGrowth.maximumLevel || maximumLevel > 140 ||
      startingLevel >= enemyGrowth.maximumLevel || level < startingLevel) throw new Error('Invalid enemy growth inputs.');
  const steps = Math.min(level, enemyGrowth.maximumLevel) - startingLevel;
  const extension = Math.max(0, Math.min(level, maximumLevel) - enemyGrowth.maximumLevel);
  const span = enemyGrowth.maximumLevel - startingLevel;
  const linear = 1 + steps * initialRate;
  const acceleration = Math.log(target / (base * (1 + span * initialRate)));
  return Math.round(base * linear * Math.exp(acceleration * (steps / span) ** 2) * (1 + extension * extensionRate) ** 2);
}
