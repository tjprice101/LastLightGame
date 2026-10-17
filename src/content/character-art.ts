import { getStarter, type StarterId } from './starters';
import { characterLevelCap } from './progression';
import { flagshipEvolutionTitles } from './flagships';
import { warEvolutionTitles } from './war-characters';

export const evolutionTitles: Record<StarterId, readonly string[]> = {
  ...flagshipEvolutionTitles,
  ...warEvolutionTitles,
  ember: ['Beginner', 'Embersteel Knight', 'Phoenixflame Templar', 'Prismatic Dawn Ascendant', 'Seraph of the Heavenly Pyre', 'Eternal Heavenflame Sovereign'],
  tide: ['Beginner', 'Pearlcurrent Guard', 'Tidalcrest Paladin', 'Prismatic Wave Ascendant', 'Seraph of the Celestial Tide', 'Eternal Heavenwater Sovereign'],
  sprout: ['Beginner', 'Leaflight Warden', 'Bloomcrest Paladin', 'Prismatic Garden Ascendant', 'Seraph of the Heavenly Bloom', 'Eternal Heavenbloom Sovereign'],
  rosetta: ['Gilded Rose', 'Gilded Vow', 'Daybreak Archer', 'Seraph of Virtue', 'Sovereign of Passion', 'The Rose Beyond the Sun'],
  thornia: ['Burdened by Thorns', 'Gilded Squire', 'Forbidden Rose Knight', 'Warden of the Shadow Garden', 'Queen of Golden Shadows', 'The Thousand-Rose Empress'],
  crinso: ['Rosebound Page', 'Duality Initiate', 'Crimson-Gold Knight', 'Storm of the Twin Rose', 'Sovereign of Beautiful Ruin', 'The Rose Beyond Duality'],
};

export function characterArt(id: StarterId, evolution = 1): { art: string; title: string; available: boolean } {
  characterLevelCap(evolution);
  const starter = getStarter(id);
  return {
    art: evolution === 1 ? starter.art : `${starter.art}-evo-${evolution}`,
    title: evolutionTitles[id][evolution - 1],
    available: true,
  };
}

export function characterName(id: StarterId, evolution = 1): string {
  return `${characterArt(id, evolution).title}, ${getStarter(id).name}`;
}
