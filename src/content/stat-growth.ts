export const enemyGrowth = { maximumLevel: 120, health: 200_000, bossHealth: 400_000, damage: 4_000,
  bossDamage: 6_000, defense: 1_500, bossDefense: 2_250 } as const;

export function stagedEnemyAttack(level: number, boss: boolean, startingLevel = 10, maximumLevel: number = enemyGrowth.maximumLevel): number {
  return enemyStat(boss ? 48 : 32, boss ? enemyGrowth.bossDamage : enemyGrowth.damage, level, startingLevel, .12, maximumLevel, .036);
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
