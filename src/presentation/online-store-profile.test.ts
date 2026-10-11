import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { onlineProfile, onlineStores, profileFrames, type OnlineProfileDisplay } from './online-store-profile';

const profile: OnlineProfileDisplay = {
  username: 'Test_Player', displayName: 'Test Player', bio: '', icon: 'neutral',
  frame: 'default', ownedFrames: ['default'], createdAt: '2026-10-10T00:00:00Z', totalDraws: 0,
};

describe('online Material Exchange and Cosmetic Store', () => {
  it('separates normal Common materials from Rose event materials with 1/5/10 purchase buttons', () => {
    const account = emptyAccount();
    account.materials['infernic-common'] = 7;
    account.fractalis = 1000;
    const before = structuredClone(account);
    const html = onlineStores(account, profile, 'materials');
    expect(html).toContain('data-market-category="normal" aria-pressed="true"');
    expect(html).toContain('data-market-category="event" aria-pressed="false"');
    expect(html.match(/data-market-material=/g)).toHaveLength(6);
    expect(html.match(/data-buy-material="infernic"/g)).toHaveLength(3);
    for (const quantity of [1, 5, 10]) expect(html).toContain(`data-quantity="${quantity}"`);
    expect(html).toContain('800 Prismatica');
    expect(html).not.toMatch(/data-buy-material="infernic" data-quantity="10"[^>]*disabled/);
    for (const id of ['infernic', 'oceanic', 'atmospheric', 'botanic', 'tranquilitic', 'chaotic']) {
      expect(html).toContain(`data-market-material="${id}"`);
      const selected = onlineStores(account, profile, 'materials', id);
      expect(selected).toContain(`data-buy-material="${id}"`);
      expect(selected).toContain(`data-showcase-item="${id}-common"`);
    }
    expect(html).not.toContain('data-showcase-item="rosethorn');
    const event = onlineStores({ ...account, fractalis: 3000 }, profile, 'materials', 'rosethorn-common');
    expect(event).toContain('data-market-category="event" aria-pressed="true"');
    expect(event.match(/data-market-material="rosethorn-/g)).toHaveLength(6);
    expect(event).toContain('Rosetta, Thornia, Crinso');
    expect(event).toContain('2,500');
    expect(event).toMatch(/data-buy-material="rosethorn-common" data-quantity="1"(?![^>]*disabled)/);
    expect(event).toMatch(/data-buy-material="rosethorn-common" data-quantity="5"[^>]*disabled/);
    expect(account).toEqual(before);
  });

  it('keeps the exchange usable offline without simulating an online account', () => {
    const account = emptyAccount();
    account.fractalis = 80;
    const html = onlineStores(account, null, 'materials');
    expect(html).not.toMatch(/data-buy-material="infernic" data-quantity="1"[^>]*disabled/);
    expect(html).toMatch(/data-buy-material="infernic" data-quantity="5"[^>]*disabled/);
    expect(onlineProfile(emptyAccount(), null)).toContain('<ll-player-save-data>');
    const cosmetics = onlineStores(account, null, 'cosmetics');
    expect(cosmetics).toContain('data-online-perk');
    expect(cosmetics).toContain('Everything else in the game works without an account.');
    expect(cosmetics).not.toContain('purchase materials');
  });

  it('distinguishes free switching, permanent purchases and the selected frame', () => {
    const html = onlineStores(emptyAccount(), { ...profile, ownedFrames: ['default', 'thin-outline'] }, 'cosmetics');
    expect(profileFrames.map(frame => frame.price)).toEqual([0, 10, 10, 10]);
    expect(html).toContain('data-equip-frame="default" disabled');
    for (const id of ['thin-outline', 'double-outline', 'corner-brackets']) {
      const selected = onlineStores(emptyAccount(), { ...profile, ownedFrames: ['default', 'thin-outline'] }, 'cosmetics', 'infernic', id);
      expect(selected).toContain(`${id === 'thin-outline' ? 'data-equip-frame' : 'data-buy-frame'}="${id}"`);
      expect(selected).toContain('10 Null-Prismatica');
    }
    expect(html.match(/data-market-frame=/g)).toHaveLength(4);
    expect(html).toContain('No gameplay effects');
  });
});

describe('online profile presentation', () => {
  it('places save-data controls only in Player info, for offline and online players', () => {
    expect(onlineProfile(emptyAccount(), null)).toContain('<ll-player-save-data>');
    expect(onlineProfile(emptyAccount(), profile)).toContain('<ll-player-save-data>');
    expect(onlineProfile(emptyAccount(), profile, undefined, 'friends')).not.toContain('ll-player-save-data');
  });
  it('uses actual progress, holdings and forward-only summon counts', () => {
    const account = emptyAccount();
    account.characters = { ember: { level: 0, evolution: 1 } };
    account.storyCompleted = 50;
    account.conduits = { 'vigil-core': 3, 'bastion-lock': 0 };
    const html = onlineProfile(account, { ...profile, totalDraws: 17, icon: 'ember' });
    expect(html).toContain('50 / 150');
    expect(html).toContain('2 / 6');
    expect(html).toContain('<dt>Element-Bearers</dt><dd>1</dd>');
    expect(html).toContain('<dt>Owned Conduit types</dt><dd>1</dd>');
    expect(html).toContain('<dt>Total summons</dt><dd>17</dd>');
    expect(html).toContain('characters/infernis');
    expect(html).toContain('draggable="false"');
    expect(html).not.toContain('name="username"');
  });

  it('escapes persisted profile text and never exposes an unowned portrait', () => {
    const html = onlineProfile(emptyAccount(), { ...profile, displayName: '"><script>', bio: '</textarea><script>', icon: 'ember' });
    expect(html).toContain('&quot;&gt;&lt;script&gt;');
    expect(html).toContain('&lt;/textarea&gt;&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('characters/infernis');
  });

  it('renders real friend/request lists without exposing private account data', () => {
    const peer = { userId: 'user-2', username: 'Friend', displayName: '<Friend>', icon: 'neutral', frame: 'default' };
    const html = onlineProfile(emptyAccount(), profile, { friends: [peer], incoming: [peer], outgoing: [peer] });
    expect(html).toContain('Friends · 1');
    for (const kind of ['acceptFriendRequest', 'declineFriendRequest', 'cancelFriendRequest', 'removeFriend']) {
      expect(html).toContain(`data-friend-action="${kind}"`);
    }
    expect(html).toContain('data-user-id="user-2"');
    expect(html).toContain('&lt;Friend&gt;');
    expect(html).toContain('data-social-panel="incoming" hidden');
    expect(html).toContain('data-social-panel="outgoing" hidden');
    expect(html).toContain('never your email or balances');
    expect(html).toContain('id="online-friend-form"');
  });
});
