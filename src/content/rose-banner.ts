import { roseCharacters } from './starters';
import { bannerMaterialPool } from './banner-materials';
import { type StandardBannerEntry } from './standard-banner';

export const roseBannerCharacterChance = .011;

export const roseBanner = {
  id: 'roses', name: 'Roses Under Sunny Skies', cost: 10, available: true,
  artwork: { path: 'banners/summon-roses.png', aspectRatio: '16:9', direction: 'Omnic',
    alt: 'Roses Under Sunny Skies: crimson roses and golden thorns unfurl beneath a radiant sky.' },
} as const;

export function roseBannerPool(): StandardBannerEntry[] {
  const pool: StandardBannerEntry[] = roseCharacters.map((character) => ({
    kind: 'character', id: character.id, stars: character.stars,
    chance: roseBannerCharacterChance / roseCharacters.length,
  }));
  pool.push(...bannerMaterialPool(true, 1 - roseBannerCharacterChance));
  return pool;
}
