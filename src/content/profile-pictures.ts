import { starters, isStarterId, type StarterId } from './starters';
import { characterName } from './character-art';
import { ownedCharacters, ownedProgress, type Account } from '../game/account';

export type ProfilePictureId = `profile:${StarterId}:${'base' | 'omnic'}`;
export const profilePictures = starters.flatMap(character => (['base', 'omnic'] as const).map(form => ({
  id: `profile:${character.id}:${form}` as ProfilePictureId,
  characterId: character.id,
  form,
  evolution: form === 'base' ? 1 : 6,
  name: characterName(character.id, form === 'base' ? 1 : 6),
  requirement: form === 'base' ? `Own ${character.name}.` : `Reach Omnic with ${character.name}.`,
  element: character.element,
})));

export function isProfilePictureId(value: unknown): value is ProfilePictureId {
  return typeof value === 'string' && profilePictures.some(picture => picture.id === value);
}

export function profilePictureUnlocked(account: Account, id: ProfilePictureId): boolean {
  const picture = profilePictures.find(entry => entry.id === id);
  return !!picture && ownedCharacters(account).includes(picture.characterId) &&
    (picture.form === 'base' || ownedProgress(account, picture.characterId).evolution === 6);
}

export function canonicalProfilePicture(value: string): ProfilePictureId | 'neutral' {
  return isProfilePictureId(value) ? value : isStarterId(value) ? `profile:${value}:base` : 'neutral';
}
