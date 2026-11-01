import { describe, expect, it } from 'vitest';
import { profilePicture } from './profile-picture';
import { profilePictures } from '../content/profile-pictures';
import { profilePictureArt } from '../content/profile-picture-art';
import { assetUrl } from './portrait';

describe('installed square profile illustrations', () => {
  it('resolves all32 pictures and legacy choices through revisioned square artwork', () => {
    expect(Object.keys(profilePictureArt)).toHaveLength(32);
    for (const picture of profilePictures) {
      const html = profilePicture(picture.id);
      const asset = `${picture.characterId}-${picture.form}` as const;
      if (!(asset in profilePictureArt)) {
        expect(html).toContain('Profile artwork pending');
        expect(html).not.toContain('<img');
        continue;
      }
      const revision = profilePictureArt[asset as keyof typeof profilePictureArt];
      expect(html).toContain(`src="${assetUrl(`profile-pictures/${asset}.png`)}?v=${revision}"`);
      expect(html).not.toContain('assets/characters/');
      expect(html).not.toContain('character-idle');
    }
    expect(profilePicture('ember')).toBe(profilePicture('profile:ember:base'));
    expect(profilePicture('neutral')).not.toContain('<img');
  });
});
