import { canonicalProfilePicture, profilePictures } from '../content/profile-pictures';
import { profilePictureArt } from '../content/profile-picture-art';
import { assetUrl } from './portrait';

export function profilePicture(value: string): string {
  const id = canonicalProfilePicture(value);
  if (id === 'neutral') return '<span aria-hidden="true">L/L</span>';
  const picture = profilePictures.find(entry => entry.id === id)!;
  const asset = `${picture.characterId}-${picture.form}` as const;
  return `<img class="profile-picture-art" src="${assetUrl(`profile-pictures/${asset}.png`)}?v=${profilePictureArt[asset]}" alt="${picture.name} profile picture" draggable="false" width="1024" height="1024">`;
}
