import { type InfusionModeId } from './activities';
import { bossLootMultiplier, bossLootRange } from './final-boss-loot';
import { activityPrismaticaDrop } from './prismatica';

export function lootRoll(random: () => number): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Loot roll must be in [0, 1).');
  return value;
}

export function infusionLycalisOdds(level: number) {
  if (!Number.isInteger(level) || level < 30 || level > 120) throw new Error('Null-Prismatica drops require an infusion enemy level from 30 to 120.');
  if (level < 80) return [{ amount: 0, chance: 1 }];
  const growth = (level - 80) / 40;
  return [
    { amount: 0, chance: .9 - .15 * growth },
    { amount: 1, chance: .08 + .02 * growth },
    { amount: 2, chance: .015 + .085 * growth },
    { amount: 3, chance: .005 + .045 * growth },
  ] as const;
}

export function rollInfusionLycalis(level: number, random: () => number): number {
  return rollLycalisOdds(infusionLycalisOdds(level), random);
}

export function sanctuaryLycalisOdds(level: number) {
  if (!Number.isInteger(level) || level < 65 || level > 120) throw new Error('Sanctuary Null-Prismatica drops require an enemy level from 65 to 120.');
  const growth = (level - 65) / 55;
  return [{ amount: 0, chance: 0 }, { amount: Math.round(1 + 4 * growth), chance: 1 }];
}

export function stagedLycalisOdds(mode: InfusionModeId, level: number, stage?: number) {
  if (mode !== 'heavens' && mode !== 'abyss' && mode !== 'sanctuary') throw new Error('This mode does not award Null-Prismatica drops.');
  const multiplier = stage === undefined ? 1 : bossLootMultiplier({ infusion: { mode, stage } });
  return (mode === 'sanctuary' ? sanctuaryLycalisOdds(level) : infusionLycalisOdds(level))
    .map(outcome => ({ ...outcome, amount: outcome.amount * multiplier }));
}

export function rollStagedLycalis(mode: InfusionModeId, level: number, random: () => number, stage?: number): number {
  return rollLycalisOdds(stagedLycalisOdds(mode, level, stage), random);
}

function rollLycalisOdds(odds: readonly { amount: number; chance: number }[], random: () => number): number {
  const roll = lootRoll(random);
  let cumulative = 0;
  for (const outcome of odds) {
    cumulative += outcome.chance;
    if (roll < cumulative) return outcome.amount;
  }
  // Absorb only floating-point summation error at the upper boundary.
  return odds[odds.length - 1].amount;
}

export function plentifulDrops(drops: Record<string, number>, random: () => number): Record<string, number> {
  return Object.fromEntries(Object.entries(drops).map(([id, base]) => [id, base + Math.floor(lootRoll(random) * (base + 1))]));
}

export interface ScaledDrop {
  minimum: number;
  maximum: number;
  chance: number;
  quantityMultiplier?: number;
  quantitySource?: { minimum: number; maximum: number; multiplier: number; factor: number; furtherFactor?: number };
}

export function materialRewardAmount(amount: number, factor = .5): number {
  if (!Number.isSafeInteger(amount) || amount < 1 || ![.5, .65, .85].includes(factor)) {
    throw new Error('Invalid material reward quantity or factor.');
  }
  return Math.max(1, Math.round(amount * factor));
}

/** Display the reduced bounds, but sample the authored range before rounding the saved reward. */
export function materialRewardRange<T extends ScaledDrop>(drop: T, factor = .5):
  Omit<T, 'quantityMultiplier'> & { quantitySource: NonNullable<ScaledDrop['quantitySource']> } {
  if (drop.quantitySource) throw new Error('Material reward range is already reduced.');
  const minimum = materialRewardAmount(drop.minimum, factor);
  const maximum = materialRewardAmount(drop.maximum, factor);
  const { quantityMultiplier = 1, ...rest } = drop;
  if (!Number.isSafeInteger(quantityMultiplier) || quantityMultiplier < 1 ||
      drop.minimum % quantityMultiplier !== 0 || drop.maximum % quantityMultiplier !== 0 ||
      drop.maximum < drop.minimum) throw new Error('Invalid material reward range.');
  return { ...rest, minimum, maximum,
    quantitySource: { minimum: drop.minimum, maximum: drop.maximum, multiplier: quantityMultiplier, factor } };
}

export function furtherMaterialRewardRange<T extends ScaledDrop>(drop: T): T {
  if (!drop.quantitySource || drop.quantitySource.furtherFactor !== undefined) {
    throw new Error('Additional material reduction requires a once-reduced range.');
  }
  return { ...drop, minimum: materialRewardAmount(drop.minimum, .65),
    maximum: materialRewardAmount(drop.maximum, .65), quantitySource: { ...drop.quantitySource, furtherFactor: .65 } };
}

function sourceRewardAmount(amount: number, source: NonNullable<ScaledDrop['quantitySource']>): number {
  const reduced = materialRewardAmount(amount, source.factor);
  if (source.furtherFactor === undefined) return reduced;
  if (source.furtherFactor !== .65) throw new Error('Invalid additional material reduction.');
  return materialRewardAmount(reduced, source.furtherFactor);
}

export function validDropAmount(drop: ScaledDrop, amount: number): boolean {
  if (!Number.isSafeInteger(amount) || amount < drop.minimum || amount > drop.maximum) return false;
  if (!drop.quantitySource) return amount % (drop.quantityMultiplier ?? 1) === 0;
  const source = drop.quantitySource;
  let low = source.minimum / source.multiplier, high = source.maximum / source.multiplier;
  while (low < high) {
    const middle = Math.floor(low + (high - low) / 2);
    if (sourceRewardAmount(middle * source.multiplier, source) < amount) low = middle + 1;
    else high = middle;
  }
  return sourceRewardAmount(low * source.multiplier, source) === amount;
}

export function scaledDrop(level: number, startingLevel: number, unlockLevel: number,
  startingChance: number, finalChance: number, finalQuantity: number, maximumLevel = 120): ScaledDrop | undefined {
  if (!Number.isInteger(maximumLevel) || maximumLevel < 120 || maximumLevel > 140) throw new Error('Invalid loot maximum level.');
  if (!Number.isInteger(startingLevel) || startingLevel < 1 || startingLevel >= 120 ||
      !Number.isInteger(level) || level < startingLevel || level > maximumLevel ||
      !Number.isInteger(unlockLevel) || unlockLevel < startingLevel || unlockLevel > maximumLevel ||
      !Number.isFinite(startingChance) || !Number.isFinite(finalChance) ||
      startingChance <= 0 || finalChance < startingChance || finalChance > 1 ||
      !Number.isSafeInteger(finalQuantity * 2) || finalQuantity < 1 ||
      !Number.isInteger(finalQuantity)) throw new Error('Invalid scaled loot configuration.');
  if (level < unlockLevel) return undefined;
  const growth = ((level - startingLevel) / (maximumLevel - startingLevel)) ** 2;
  const minimum = 1 + Math.floor((finalQuantity - 1) * growth);
  const chanceGrowth = unlockLevel === maximumLevel ? 1 : ((level - unlockLevel) / (maximumLevel - unlockLevel)) ** 1.4;
  return { minimum, maximum: minimum * 2, chance: startingChance + (finalChance - startingChance) * chanceGrowth };
}

export function rollDrop(drop: ScaledDrop, random: () => number): number | undefined {
  if (drop.quantitySource) {
    const source = drop.quantitySource;
    if (drop.quantityMultiplier !== undefined ||
        drop.minimum !== sourceRewardAmount(source.minimum, source) ||
        drop.maximum !== sourceRewardAmount(source.maximum, source)) {
      throw new Error('Invalid reduced material reward range.');
    }
    const amount = rollDrop({ minimum: source.minimum, maximum: source.maximum, chance: drop.chance,
      quantityMultiplier: source.multiplier }, random);
    return amount === undefined ? undefined : sourceRewardAmount(amount, source);
  }
  const multiplier = drop.quantityMultiplier ?? 1;
  if (!Number.isSafeInteger(drop.minimum) || !Number.isSafeInteger(drop.maximum) ||
      !Number.isSafeInteger(multiplier) || multiplier < 1 || drop.minimum % multiplier !== 0 || drop.maximum % multiplier !== 0 ||
      drop.minimum < 1 || drop.maximum < drop.minimum || !Number.isFinite(drop.chance) ||
      drop.chance <= 0 || drop.chance > 1) throw new Error('Invalid loot drop range or chance.');
  if (drop.chance < 1 && lootRoll(random) >= drop.chance) return undefined;
  return (drop.minimum / multiplier + Math.floor(lootRoll(random) * ((drop.maximum - drop.minimum) / multiplier + 1))) * multiplier;
}

export function fractalisDrop(level: number): ScaledDrop {
  return activityPrismaticaDrop({}, level);
}

export const treasuryPrismaticaText = 'Prismatica per enemy grows linearly from 133-266 at Stage 1 to 30,000-60,000 at Stage 25, without a final-boss multiplier.';
