import { canonicalProfilePicture, profilePictures } from '../content/profile-pictures';
import { profilePictureArt } from '../content/profile-picture-art';
import { assetUrl } from './portrait';

export function profilePicture(value: string): string {
  const id = canonicalProfilePicture(value);
  if (id === 'neutral') return '<span aria-hidden="true">L/L</span>';
  const picture = profilePictures.find(entry => entry.id === id)!;
  const asset = `${picture.characterId}-${picture.form}` as const;
  if (!(asset in profilePictureArt)) return '<span class="profile-picture-pending" aria-label="Profile artwork pending">L/L</span>';
  const revision = profilePictureArt[asset as keyof typeof profilePictureArt];
  return `<img class="profile-picture-art" src="${assetUrl(`profile-pictures/${asset}.png`)}?v=${revision}" alt="${picture.name} profile picture" draggable="false" width="1024" height="1024">`;
}
