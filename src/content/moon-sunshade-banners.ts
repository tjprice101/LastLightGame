import { bannerMaterialTiers, newEventBannerMaterialPool } from './banner-materials';
import { moonCharacters, sunshadeCharacters } from './moon-sunshade-characters';
import { moonSunshadeEvents, moonSunshadeCharacterChance } from './moon-sunshade-events';
import type { StandardBannerEntry } from './standard-banner';

function eventBanner(index: 0 | 1) {
  const definition = moonSunshadeEvents[index];
  const characters = index === 0 ? moonCharacters : sunshadeCharacters;
  const characterChance = moonSunshadeCharacterChance;
  const family = definition.family;
  const pool = (): StandardBannerEntry[] => {
    const entries: StandardBannerEntry[] = characters.map(character => ({
      kind: 'character',
      id: character.id,
      stars: 6,
      chance: characterChance / characters.length,
    }));
    entries.push(...newEventBannerMaterialPool(family, 1 - characterChance));
    if (Math.abs(entries.reduce((sum, entry) => sum + entry.chance, 0) - 1) > 1e-12 ||
        entries.filter(entry => entry.kind === 'character').length !== 6 ||
        bannerMaterialTiers.reduce((sum, tier) => sum + tier.weight, 0) !== 97) {
      throw new Error(`Invalid ${definition.bannerName} banner pool.`);
    }
    return entries;
  };
  return {
    id: definition.bannerId,
    name: definition.bannerName,
    cost: 10,
    available: true,
    artwork: {
      path: definition.bannerArt,
      aspectRatio: '16:9' as const,
      direction: 'Omnic' as const,
      alt: definition.bannerArt ? `${definition.bannerName} lunar harbor.` : `${definition.bannerName} artwork pending.`,
    },
    pool,
  };
}

export const moonBanner = eventBanner(0);
export const sunshadeBanner = eventBanner(1);
