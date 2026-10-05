export function lootRoll(random: () => number): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Loot roll must be in [0, 1).');
  return value;
}

export function plentifulDrops(drops: Record<string, number>, random: () => number): Record<string, number> {
  return Object.fromEntries(Object.entries(drops).map(([id, base]) => [id, base + Math.floor(lootRoll(random) * (base + 1))]));
}

export interface ScaledDrop {
  minimum: number;
  maximum: number;
  chance: number;
}

export function scaledDrop(level: number, startingLevel: number, unlockLevel: number,
  startingChance: number, finalChance: number, finalQuantity: number): ScaledDrop | undefined {
  if (!Number.isInteger(startingLevel) || startingLevel < 1 || startingLevel >= 120 ||
      !Number.isInteger(level) || level < startingLevel || level > 120 ||
      !Number.isInteger(unlockLevel) || unlockLevel < startingLevel || unlockLevel > 120 ||
      !Number.isFinite(startingChance) || !Number.isFinite(finalChance) ||
      startingChance <= 0 || finalChance < startingChance || finalChance > 1 ||
      !Number.isSafeInteger(finalQuantity * 2) || finalQuantity < 1 ||
      !Number.isInteger(finalQuantity)) throw new Error('Invalid scaled loot configuration.');
  if (level < unlockLevel) return undefined;
  const growth = ((level - startingLevel) / (120 - startingLevel)) ** 2;
  const minimum = 1 + Math.floor((finalQuantity - 1) * growth);
  const chanceGrowth = unlockLevel === 120 ? 1 : ((level - unlockLevel) / (120 - unlockLevel)) ** 1.4;
  return { minimum, maximum: minimum * 2, chance: startingChance + (finalChance - startingChance) * chanceGrowth };
}

export function rollDrop(drop: ScaledDrop, random: () => number): number | undefined {
  if (!Number.isSafeInteger(drop.minimum) || !Number.isSafeInteger(drop.maximum) ||
      drop.minimum < 1 || drop.maximum < drop.minimum || !Number.isFinite(drop.chance) ||
      drop.chance <= 0 || drop.chance > 1) throw new Error('Invalid loot drop range or chance.');
  if (drop.chance < 1 && lootRoll(random) >= drop.chance) return undefined;
  return drop.minimum + Math.floor(lootRoll(random) * (drop.maximum - drop.minimum + 1));
}

export function fractalisDrop(level: number): ScaledDrop {
  if (!Number.isInteger(level) || level < 1 || level > 120) throw new Error('Fractalis drops require an enemy level from 1 to 120.');
  const minimum = 5 + Math.floor(10 * ((level - 1) / 119) ** 2);
  return { minimum, maximum: minimum * 2, chance: 1 };
}
