import { roseCharacters } from './starters';
import { getCreature } from './creatures';
import { type StandardBannerEntry } from './standard-banner';

export const roseBannerCharacterChance = .011;

export const roseBanner = {
  id: 'roses', name: 'Roses Under Sunny Skies', cost: 10, available: true,
  duplicateReward: { kind: 'final-roselius', creatureId: 'infusion:roses:5', level: 80 },
  artwork: { path: 'banners/summon-roses.png', aspectRatio: '16:9', direction: 'Omnic',
    alt: 'Roses Under Sunny Skies: crimson roses and golden thorns unfurl beneath a radiant sky.' },
} as const;

export function roseBannerPool(): StandardBannerEntry[] {
  const pool: StandardBannerEntry[] = roseCharacters.map((character) => ({
    kind: 'character', id: character.id, stars: character.stars,
    chance: roseBannerCharacterChance / roseCharacters.length,
  }));
  for (const stars of [1, 2, 3] as const) {
    const creature = getCreature(`infusion:roses:${stars - 1}`);
    pool.push({ kind: 'creature', id: creature.id, stars,
      chance: (1 - roseBannerCharacterChance) * [50, 30, 17][stars - 1] / 97 });
  }
  return pool;
}
