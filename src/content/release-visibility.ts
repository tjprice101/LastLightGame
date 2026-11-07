import { sunshadeCharacters } from './moon-sunshade-characters';

const unreleasedCharacters = new Set<string>(sunshadeCharacters.map(character => character.id));

export function characterReleased(id: string): boolean {
  return !unreleasedCharacters.has(id);
}

export function eventReleased(id: string): boolean {
  return id !== 'sunshade';
}

export function materialReleased(id: string): boolean {
  return !id.startsWith('dawnforge-');
}

export function creatureReleased(id: string): boolean {
  return !id.startsWith('infusion:sunshade:');
}
