// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { freshGame, friendProfileView, resolveOperation, validateFriendProfileRequest, type DurableGame } from '../../supabase/functions/game-operation/engine';
import { validateFriendProfileResponse } from './server-game';
import { redactFriendAccount } from '../game/friend-profile';
import { friendProfileScreen, onlineProfile } from '../presentation/online-store-profile';

let sequence = 0;
const entropy = { seed: () => 7321, random: () => .9,
  uuid: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}` };
const friendId = '11111111-2222-4333-8444-555555555555';

function friendGame(): DurableGame {
  const game = resolveOperation(freshGame('friend_one', '2026-02-01T00:00:00.000Z'), { kind: 'bootstrap', starterId: 'tide' }, entropy).game;
  game.account.fractalis = 987654;
  game.account.lycalis = 4321;
  game.account.materials = { 'atmospheric-common': 12 };
  game.account.storyCompleted = 40;
  game.account.receipts = ['secret-receipt'];
  game.profile = { ...game.profile, displayName: 'Tidecaller', bio: 'Hello there', frame: 'thin-outline', totalDraws: 33 };
  return game;
}
function row(state: unknown = friendGame()) {
  return { userId: friendId, username: 'friend_one', createdAt: '2026-02-01T00:00:00.000Z', state,
    reference: { friendCode: 'LL-ABCD-1234', playerId: 'ABCD-1234', daysPlayed: 9, playTimeSeconds: 7260,
      recentActivity: [{ id: 'a', message: 'Story stage cleared', detail: 'Story · Stage 40', at: '2026-02-03T00:00:00.000Z' }, { bad: true }] } };
}

describe('friend profile view (D-340)', () => {
  it('validates the request shape strictly', () => {
    expect(validateFriendProfileRequest({ requestId: crypto.randomUUID(), friendProfile: { userId: friendId } }).friendProfile.userId).toBe(friendId);
    expect(() => validateFriendProfileRequest({ requestId: crypto.randomUUID(), friendProfile: { userId: 'nope' } })).toThrow();
    expect(() => validateFriendProfileRequest({ requestId: crypto.randomUUID(), friendProfile: { userId: friendId, extra: 1 } })).toThrow();
    expect(() => validateFriendProfileRequest({ requestId: 'x', friendProfile: { userId: friendId } })).toThrow();
  });

  it('redacts balances, materials and receipts while keeping progress and collection', () => {
    const view = friendProfileView(row());
    expect(view.account.fractalis).toBe(0);
    expect(view.account.lycalis).toBe(0);
    expect(view.account.materials).toEqual({});
    expect(view.account.receipts).toEqual([]);
    expect(view.account.storyCompleted).toBe(40);
    expect(view.account.characters.tide).toBeDefined();
    expect(JSON.stringify(view)).not.toContain('secret-receipt');
    expect(view.profile).toMatchObject({ displayName: 'Tidecaller', bio: 'Hello there', frame: 'thin-outline', totalDraws: 33,
      friendCode: 'LL-ABCD-1234', daysPlayed: 9, playTimeSeconds: 7260 });
    expect(view.profile.recentActivity).toHaveLength(1);
    expect(validateFriendProfileResponse(JSON.parse(JSON.stringify(view))).userId).toBe(friendId);
  });

  it('falls back to a fresh profile when the friend has not started playing', () => {
    const view = friendProfileView(row(null));
    expect(view.profile.displayName).toBe('friend_one');
    expect(view.account.storyCompleted ?? 0).toBe(0);
  });

  it('never exposes gear or chests through the redaction helper', () => {
    const redacted = redactFriendAccount(friendGame().account);
    expect(redacted.conduitEquipment).toBeUndefined();
    expect(redacted.conduitUpgrades).toBeUndefined();
  });

  it('renders the same profile panels as Player info without editing controls', () => {
    const view = friendProfileView(row());
    const html = friendProfileScreen(view.account, { ...view.profile, userId: view.userId });
    const own = onlineProfile(view.account, { ...view.profile, ownedFrames: ['default'] });
    for (const panel of ['profile-metrics', 'profile-story', 'profile-collection', 'profile-account', 'profile-squad', 'profile-recent']) {
      expect(html).toContain(panel);
      expect(own).toContain(panel);
    }
    expect(html).toContain('Tidecaller');
    expect(html).toContain('Hello there');
    expect(html).toContain('Story stage cleared');
    expect(html).toContain('data-close-friend-profile');
    expect(html).not.toContain('online-profile-form');
    expect(html).not.toContain('data-online-signout');
    expect(html).not.toContain('data-make-leader');
    expect(html).not.toContain('data-team-view="formation"');
    expect(html).not.toContain('ll-player-save-data');
  });

  it('escapes friend-supplied text', () => {
    const view = friendProfileView(row());
    const html = friendProfileScreen(view.account, { ...view.profile, displayName: '<script>', bio: '"><img>', userId: view.userId });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('"><img>');
  });
});
