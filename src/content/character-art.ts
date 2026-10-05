import { getStarter, type StarterId } from './starters';
import { characterLevelCap } from './progression';

export const evolutionTitles: Record<StarterId, readonly string[]> = {
  ember: ['Beginner', 'Embersteel Knight', 'Phoenixflame Templar', 'Prismatic Dawn Ascendant', 'Seraph of the Heavenly Pyre', 'Eternal Heavenflame Sovereign'],
  tide: ['Beginner', 'Pearlcurrent Guard', 'Tidalcrest Paladin', 'Prismatic Wave Ascendant', 'Seraph of the Celestial Tide', 'Eternal Heavenwater Sovereign'],
  sprout: ['Beginner', 'Leaflight Warden', 'Bloomcrest Paladin', 'Prismatic Garden Ascendant', 'Seraph of the Heavenly Bloom', 'Eternal Heavenbloom Sovereign'],
};

export function characterArt(id: StarterId, evolution = 1): { art: string; title: string } {
  characterLevelCap(evolution);
  const starter = getStarter(id);
  return {
    art: evolution === 1 ? starter.art : `${starter.art}-evo-${evolution}`,
    title: evolutionTitles[id][evolution - 1],
  };
}
