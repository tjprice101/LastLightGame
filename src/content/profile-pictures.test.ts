import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { profilePictures, profilePictureUnlocked, canonicalProfilePicture, isProfilePictureId } from './profile-pictures';

describe('earned character profile pictures', () => {
  it('defines exactly two pictures per Element-Bearer without load writes or grants', () => {
    expect(profilePictures).toHaveLength(32);
    const account = emptyAccount(), before = structuredClone(account);
    expect(profilePictures.some(picture => profilePictureUnlocked(account, picture.id))).toBe(false);
    expect(account).toEqual(before);
    account.characters.ember = { level: 0, evolution: 1 };
    expect(profilePictureUnlocked(account, 'profile:ember:base')).toBe(true);
    expect(profilePictureUnlocked(account, 'profile:ember:omnic')).toBe(false);
    account.characters.ember.evolution = 6;
    expect(profilePictureUnlocked(account, 'profile:ember:omnic')).toBe(true);
    expect(profilePictureUnlocked(account, 'profile:tide:base')).toBe(false);
  });
  it('preserves legacy icons and rejects unregistered form identifiers', () => {
    expect(canonicalProfilePicture('tide')).toBe('profile:tide:base');
    expect(canonicalProfilePicture('neutral')).toBe('neutral');
    expect(isProfilePictureId('profile:ember:omnic')).toBe(true);
    expect(isProfilePictureId('profile:ember:epic')).toBe(false);
    expect(isProfilePictureId('profile:unknown:base')).toBe(false);
  });
});
