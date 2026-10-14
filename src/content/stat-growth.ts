export const playableGrowth = { perLevel: .15, perEvolution: 1.5 } as const;
export const enemyGrowth = { maximumLevel: 120, health: 7_000, bossHealth: 35_000, damage: 1_200,
  bossDamage: 3_000, defense: 400, bossDefense: 600 } as const;
export const capturedGrowth = { health: 220, damage: 38, defense: 16 } as const;

export function enemyCombatStats(level: number, boss: boolean, opening?: { health: number; damage: number; defense: number }) {
  if (!Number.isInteger(level) || level < 1 || level > 140) throw new Error('Enemy level must be from 1 to 140.');
  const bounded = Math.min(level, enemyGrowth.maximumLevel);
  const extension = (1 + Math.max(0, level - enemyGrowth.maximumLevel) * .018) ** 2;
  const stat = (base: number, target: number, rate: number) =>
    Math.round(enemyStat(base, target, bounded, 1, rate) * extension);
  if (opening && ![opening.health, opening.damage, opening.defense].every(value => Number.isFinite(value) && value > 0)) throw new Error('Invalid opening enemy stats.');
  return {
    health: stat(opening?.health ?? (boss ? 207.5 : 83), boss ? enemyGrowth.bossHealth : enemyGrowth.health, .30),
    damage: stat(opening?.damage ?? (boss ? 27.5 : 22), boss ? enemyGrowth.bossDamage : enemyGrowth.damage, .12),
    defense: stat(opening?.defense ?? (boss ? 16 / 3 : 4), boss ? enemyGrowth.bossDefense : enemyGrowth.defense, .15),
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
