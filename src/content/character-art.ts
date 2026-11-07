import { getStarter, type StarterId } from './starters';
import { characterLevelCap } from './progression';
import { flagshipEvolutionTitles } from './flagships';
import { warEvolutionTitles } from './war-characters';
import { calamiticEvolutionTitles } from './calamitic-characters';

export const evolutionTitles: Record<StarterId, readonly string[]> = {
  ...flagshipEvolutionTitles,
  ...warEvolutionTitles,
  ...calamiticEvolutionTitles,
  ember: ['Beginner', 'Embersteel Knight', 'Phoenixflame Templar', 'Prismatic Dawn Ascendant', 'Seraph of the Heavenly Pyre', 'Eternal Heavenflame Sovereign'],
  tide: ['Beginner', 'Pearlcurrent Guard', 'Tidalcrest Paladin', 'Prismatic Wave Ascendant', 'Seraph of the Celestial Tide', 'Eternal Heavenwater Sovereign'],
  sprout: ['Beginner', 'Leaflight Warden', 'Bloomcrest Paladin', 'Prismatic Garden Ascendant', 'Seraph of the Heavenly Bloom', 'Eternal Heavenbloom Sovereign'],
  rosetta: ['Gilded Rose', 'Gilded Vow', 'Daybreak Archer', 'Seraph of Virtue', 'Sovereign of Passion', 'The Rose Beyond the Sun'],
  thornia: ['Burdened by Thorns', 'Gilded Squire', 'Forbidden Rose Knight', 'Warden of the Shadow Garden', 'Queen of Golden Shadows', 'The Thousand-Rose Empress'],
  crinso: ['Rosebound Page', 'Duality Initiate', 'Crimson-Gold Knight', 'Storm of the Twin Rose', 'Sovereign of Beautiful Ruin', 'The Rose Beyond Duality'],
  maerion: ['Ferry-Token Keeper', 'Crescent Field Medic', 'Ribs of the Returning Tide', 'Steward of Unfinished Voyages', 'Harbor for the Unreturned', 'Every Name Carried Home'],
  caevren: ['Observatory Sentinel', 'Keeper of the Counterweight', 'The Meridian Holds', 'Brace Beneath the Falling Sky', 'Anchor of the Unfinished Night', 'No Star Falls Unheld'],
  vespera: ['Last-Beacon Watch', 'Whitefire Messenger', 'Standard of the Night Road', 'Marshal of Unextinguished Signals', 'Procession Beyond the Walls', 'None Left in the Dark'],
  ilyss: ['Memorial Restorer', 'Tender of the Broken Link', 'Crescent Unbinder', 'Mercy Between the Severed Threads', 'Release Without Oblivion', 'What Harm Cannot Hold'],
  asteriel: ['Night-Seed Librarian', 'Lender of Moonflowers', 'Cultivator of Quiet Orbits', 'Keeper of the Open Conservatory', 'Garden of Unhoarded Stars', 'Every Orbit Bears a Future'],
  serapha: ['Ceasefire Escort', '****** the Unstruck Verdict', 'Adjudicator of Open Arcs', 'Mantle of the Merciful Passage', 'Sanctuary Without Surrender', 'Let Them Leave Alive'],
  rhaziel: ['Field-Forge Mender', 'Keeper of Remembered Dents', 'Seams That Hold', 'Armorer Beyond the Court', 'Return Through the Fire', 'A Defense Worth Returning To'],
  oryn: ['****** the Unstruck Seal', 'Mediator at the Open Gate', 'An Exit in the Accord', 'Keeper of Unforced Terms', 'Authority Without a Sentence', 'No Victory Requires This'],
  thessara: ['Reservoir Route Captain', 'Keeper of the Empty Channel', 'Water Delivered in Full', 'Promises Beyond the Procession', 'The Unomitted Reservoir', 'No Village Omitted'],
  elaris: ['Outrider at the Firebreak', 'Seedpod Pathfinder', 'A Branch Through the Walls', 'Rider of the Open Grove', 'Spear-Grove Passage', 'A Grove Beyond the Burning Walls'],
  veyr: ['Refuge-Sparing Dismantler', 'Reader of the Load Path', 'The Fault Laid Bare', 'Unmaker of Occupied Engines', 'Precision Beyond Conquest', 'What Remains Standing'],
  aureth: ['Corridor Rescue Captain', '****** the Keystone', 'A Route Beneath the Ashwind', 'Command of the Moving Shelter', 'Walking Eclipse Guardian', 'Hold the Burning Sky Open'],
};

const artworkPending = new Set([
  'rhaziel', 'oryn', 'thessara', 'elaris', 'veyr', 'aureth',
]);

export function characterArt(id: StarterId, evolution = 1): { art: string; title: string; available: boolean } {
  characterLevelCap(evolution, id);
  const starter = getStarter(id);
  return {
    art: evolution === 1 ? starter.art : `${starter.art}-evo-${evolution}`,
    title: evolutionTitles[id][evolution - 1],
    available: !artworkPending.has(id),
  };
}

export function characterName(id: StarterId, evolution = 1, riseBlessed = false): string {
  return `${characterArt(id, evolution).title}, ${getStarter(id).name}${riseBlessed ? ', Rise-blessed' : ''}`;
}
