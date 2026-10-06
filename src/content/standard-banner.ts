import { starters, type StarterId } from './starters';
import { getCreature } from './creatures';
import { lootRoll } from './loot-random';

export const bannerPityLimits = { highestStar: 200, unownedHighestStar: 500 } as const;
export const bannerCharacterTierRates = { 5: .01, 6: .001 } as const;
export interface BannerPity { highestStar: number; unownedHighestStar: number }
export interface BannerOutcome { kind: 'character' | 'creature'; id: string; stars: number; chance: number }

export function validateBannerPity(value: unknown): BannerPity {
  if (typeof value !== 'object' || value === null || Array.isArray(value) ||
      !('highestStar' in value) || typeof value.highestStar !== 'number' ||
      !Number.isInteger(value.highestStar) || value.highestStar < 0 || value.highestStar >= bannerPityLimits.highestStar ||
      !('unownedHighestStar' in value) || typeof value.unownedHighestStar !== 'number' ||
      !Number.isInteger(value.unownedHighestStar) || value.unownedHighestStar < 0 ||
      value.unownedHighestStar >= bannerPityLimits.unownedHighestStar) {
    throw new Error('Invalid saved banner pity counters.');
  }
  return { highestStar: value.highestStar, unownedHighestStar: value.unownedHighestStar };
}

export function resolveBannerPull<T extends BannerOutcome>(
  pool: readonly T[], ownedCharacters: readonly string[], counters: BannerPity, random: () => number,
): { entry: T; pity: BannerPity; guarantee: 'none' | 'highest-star' | 'unowned-highest-star' | 'all-owned-highest-star' } {
  const pity = validateBannerPity(counters);
  if (!pool.length || new Set(pool.map((entry) => entry.id)).size !== pool.length ||
      pool.some((entry) => !entry.id || (entry.kind !== 'character' && entry.kind !== 'creature') ||
        !Number.isInteger(entry.stars) || entry.stars < 1 || entry.stars > 6 ||
        !Number.isFinite(entry.chance) || entry.chance <= 0 || entry.chance > 1) ||
      Math.abs(pool.reduce((sum, entry) => sum + entry.chance, 0) - 1) > 1e-12) {
    throw new Error('Invalid banner outcome pool.');
  }
  const highestStars = Math.max(...pool.map((entry) => entry.stars));
  const highest = pool.filter((entry) => entry.kind === 'character' && entry.stars === highestStars);
  if (!highest.length) throw new Error('Banner pity requires a highest-star character tier.');
  const unowned = highest.filter((entry) => !ownedCharacters.includes(entry.id));
  let eligible: readonly T[] = pool;
  let guarantee: 'none' | 'highest-star' | 'unowned-highest-star' | 'all-owned-highest-star' = 'none';
  if (pity.unownedHighestStar + 1 === bannerPityLimits.unownedHighestStar) {
    eligible = unowned.length ? unowned : highest;
    guarantee = unowned.length ? 'unowned-highest-star' : 'all-owned-highest-star';
  } else if (pity.highestStar + 1 === bannerPityLimits.highestStar) {
    eligible = highest;
    guarantee = 'highest-star';
  }
  const roll = lootRoll(random);
  let entry: T;
  if (guarantee !== 'none') {
    entry = eligible[Math.floor(roll * eligible.length)];
  } else {
    let cumulative = 0;
    entry = pool[pool.length - 1];
    for (const candidate of pool) {
      cumulative += candidate.chance;
      if (roll < cumulative) { entry = candidate; break; }
    }
  }
  const highestResult = entry.kind === 'character' && entry.stars === highestStars;
  const newHighest = highestResult && !ownedCharacters.includes(entry.id);
  return { entry, guarantee, pity: {
    highestStar: highestResult ? 0 : pity.highestStar + 1,
    unownedHighestStar: newHighest || guarantee === 'all-owned-highest-star' ? 0 : pity.unownedHighestStar + 1,
  } };
}

const standardBannerArtwork: { path: string | null; aspectRatio: '16:9'; direction: 'Omnic'; alt: string } = {
  path: 'banners/summon-standard.png', aspectRatio: '16:9', direction: 'Omnic',
  alt: 'Standard Banner: a transcendent elemental sanctuary uniting fire, water, nature, Heaven, Abyss, Crownfall Treasury and Rosethorn Sanctuary.',
};

export const standardBanner = {
  id: 'standard', name: 'Standard Banner', cost: 10, available: true,
  duplicateReward: { kind: 'final-fractalis-crowned-slime', creatureId: 'infusion:treasury:5', level: 50 },
  artwork: standardBannerArtwork,
} as const;

export type StandardBannerEntry =
  | { kind: 'character'; id: StarterId; stars: 5; chance: number }
  | { kind: 'creature'; id: string; stars: 1 | 2 | 3; chance: number };

export function standardBannerPool(): StandardBannerEntry[] {
  const characterChance = bannerCharacterTierRates[5];
  const remaining = 1 - characterChance;
  const weights = [50, 30, 17] as const;
  const pool: StandardBannerEntry[] = starters.map((starter) => ({
    kind: 'character', id: starter.id, stars: 5, chance: characterChance / starters.length,
  }));
  for (const stars of [1, 2, 3] as const) {
    const modes = ['heavens', 'abyss', 'treasury', 'sanctuary'] as const;
    const chance = remaining * weights[stars - 1] / 97 / modes.length;
    for (const mode of modes) {
      const creature = getCreature(`infusion:${mode}:${stars - 1}`);
      pool.push({ kind: 'creature', id: creature.id, stars, chance });
    }
  }
  if (Math.abs(pool.reduce((total, entry) => total + entry.chance, 0) - 1) > 1e-12) {
    throw new Error('Standard Banner probabilities must total 100%.');
  }
  return pool;
}

export function bannerPercent(chance: number): string {
  if (!Number.isFinite(chance) || chance <= 0 || chance > 1) throw new Error('Invalid banner probability.');
  return `${(chance * 100).toFixed(6).replace(/\.?0+$/, '')}%`;
}
