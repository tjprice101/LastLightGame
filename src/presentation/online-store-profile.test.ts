// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyAccount } from '../game/account';
import { bindProfileEditor, friendPresence, onlineProfile, onlineStores, profileFrames, refreshFriendPresence, refreshProfileTracking, type OnlineProfileDisplay } from './online-store-profile';
import { starters } from '../content/starters';

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

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
  it('removes Edit squad from Profile while retaining member links and empty-slot navigation', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    account.squad = ['ember'];
    const before = structuredClone(account);
    document.body.innerHTML = onlineProfile(account, profile);
    expect(document.querySelector('.profile-squad .ref-panel-heading')?.textContent).toBe('Squad · 1 of 3');
    expect(document.querySelector('.profile-squad .ref-panel-heading button')).toBeNull();
    expect(document.querySelector('.profile-squad [data-team-detail="ember"]')).not.toBeNull();
    expect(document.querySelectorAll('.profile-squad [data-team-view="formation"]')).toHaveLength(2);
    expect(account).toEqual(before);
  });
  it('omits the redundant Requests navigation button while retaining request controls', () => {
    document.body.innerHTML = onlineProfile(emptyAccount(), profile, {
      friends: [], incoming: [], outgoing: [],
    }, 'friends');
    expect(document.querySelectorAll('.ref-market-tabs button')).toHaveLength(3);
    expect(document.querySelector('[data-open-friend-requests]')).toBeNull();
    expect(document.querySelector('[data-social-tab="incoming"]')).not.toBeNull();
    expect(document.querySelector('[data-social-tab="outgoing"]')).not.toBeNull();
  });
  it('refreshes tracked totals without replacing unsaved fields or portrait DOM', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    account.squad = ['ember'];
    document.body.innerHTML = onlineProfile(account, profile);
    const input = document.querySelector<HTMLInputElement>('[name=displayName]')!;
    input.value = 'Unsaved name';
    const avatar = document.querySelector('.profile-main-avatar');
    refreshProfileTracking(document.body, { ...profile, daysPlayed: 4, playTimeSeconds: 7260 });
    expect(document.querySelector('[data-profile-days]')?.textContent).toBe('4');
    expect(document.querySelector('[data-profile-time]')?.textContent).toBe('2 h 1 m');
    expect(document.querySelector('[name=displayName]')).toBe(input);
    expect(input.value).toBe('Unsaved name');
    expect(document.querySelector('.profile-main-avatar')).toBe(avatar);
  });
  it('keeps acquisition pictures available and saves a browser selection exactly once', async () => {
    const account = emptyAccount();
    for (const starter of starters) account.characters[starter.id] = { level: 0, evolution: 1 };
    account.squad = ['ember'];
    document.body.innerHTML = onlineProfile(account, profile);
    const picker = document.querySelector<HTMLSelectElement>('[data-profile-icon-picker]')!;
    expect(picker.options).toHaveLength(starters.length + 1);
    const save = vi.fn().mockResolvedValue(undefined), error = vi.fn();
    bindProfileEditor(document.body, save, error);
    picker.value = 'profile:ember:base';
    picker.dispatchEvent(new Event('change', { bubbles: true }));
    await vi.waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save).toHaveBeenCalledWith({ displayName: 'Test Player', bio: '', icon: 'profile:ember:base' });
    expect(picker.value).toBe('profile:ember:base');
    expect(document.querySelector('.profile-main-avatar img')?.getAttribute('src')).toContain('profile-pictures/ember-base.png?v=');
    expect(document.querySelector('[data-browse-profile-pictures]')).not.toBeNull();
    expect(error).not.toHaveBeenCalled();
  });
  it('uses all six real region names, catalog totals and each banner pity without demo values', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 12, evolution: 3 };
    account.squad = ['ember'];
    account.storyCompleted = 26;
    account.bannerPity = { standard: { highestStar: 12, unownedHighestStar: 24 }, roses: { highestStar: 8, unownedHighestStar: 9 } };
    const html = onlineProfile(account, { ...profile, friendCode: 'LL-ABCD-1234', playerId: 'ABCD1234',
      daysPlayed: 3, playTimeSeconds: 51720, recentActivity: [{ id: '1', message: '<Saved>', detail: 'Story & beacon', at: '2026-10-11T00:00:00Z' }] },
    { friends: [], incoming: [{ userId: '1', username: 'peer', displayName: 'Peer', icon: 'neutral', frame: 'default' }], outgoing: [] });
    for (const region of ['Emberwake March', 'Glasswater Reach', 'Stormspan Heights', 'Rootstone Wilds', 'Stillhalo Vale', 'Riftbound Frontier']) expect(html).toContain(region);
    expect(html).toContain('1/25');
    expect(html).toContain('max="85"');
    expect(html).toContain('max="126"');
    expect(html).toContain('3/126');
    expect(html).toContain('<span>Standard</span><b>12/200</b><b>24/500</b>');
    expect(html).toContain('<span>Roses</span><b>8/200</b><b>9/500</b>');
    expect(html).toContain('14 h 22 m');
    expect(html).toContain('data-copy-profile="LL-ABCD-1234"');
    expect(html).toContain('data-copy-profile="ABCD1234"');
    expect(html).toContain('1 new');
    expect(html).toContain('Leader · Lv.12');
    expect(html).toContain('&lt;Saved&gt;');
    expect(html).not.toContain('Beacon Seeker');
    expect(html).not.toContain('Sample data');
    expect(html).not.toContain('<details');
  });
  it('places save-data controls only in Player info, for offline and online players', () => {
    expect(onlineProfile(emptyAccount(), null)).toContain('<ll-player-save-data>');
    expect(onlineProfile(emptyAccount(), profile)).toContain('<ll-player-save-data compact online-user="Test_Player">');
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
    expect(html).toContain('<h2>Element-Bearers</h2><p><strong>1</strong><span> / 16</span>');
    expect(html).toContain('<span>Conduit types</span><progress value="1" max="85"');
    expect(html).toContain('<dt>Total summons</dt><dd>17</dd>');
    expect(html).toContain('characters/infernis');
    expect(html).toContain('draggable="false"');
    const host = document.createElement('div');
    host.innerHTML = html;
    expect(host.querySelector('#online-profile-form [name="username"]')).toBeNull();
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
    expect(html).toContain('data-social-panel="incoming" >');
    expect(html).toContain('data-social-panel="outgoing" hidden');
    expect(html).toContain('never your email or balances');
    expect(html).toContain('id="online-friend-form"');
  });

  it('keeps the Friends list separate from the received/sent request tabs and omits demo features', () => {
    const peer = { userId: 'peer', username: 'Actual_Peer', displayName: 'Actual Peer', icon: 'neutral', frame: 'default', online: true, lastSeenAt: '2026-10-11T00:00:00Z' };
    const host = document.createElement('div');
    host.innerHTML = onlineProfile(emptyAccount(), { ...profile, friendCode: 'LL-ABCD-1234' }, { friends: [peer], incoming: [peer], outgoing: [peer] }, 'friends');
    expect(host.querySelector('.ref-profile-right')?.hasAttribute('hidden')).toBe(true);
    expect(host.querySelector('.profile-friends-list [data-friend-name]')).not.toBeNull();
    expect(host.querySelector('.profile-friends-sidebar #online-friend-form')).not.toBeNull();
    expect(host.querySelector('[data-social-tab="incoming"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[data-social-panel="incoming"]')?.hasAttribute('hidden')).toBe(false);
    expect(host.querySelector('[data-social-panel="outgoing"]')?.hasAttribute('hidden')).toBe(true);
    expect(host.querySelector('.profile-friend-requests [data-presence-user]')).toBeNull();
    expect(host.querySelector('[data-presence-user]')?.textContent).toBe('Online');
    expect(host.textContent).not.toMatch(/Beacon Seeker|Sample codes|Sample data|Chat room/);
    host.innerHTML = onlineProfile(emptyAccount(), profile, { friends: [peer], incoming: [], outgoing: [peer] }, 'friends', 'outgoing');
    expect(host.querySelector('[data-social-tab="outgoing"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[data-social-panel="outgoing"]')?.hasAttribute('hidden')).toBe(false);
    expect(host.querySelector('.profile-friends-list [data-friend-name]')).not.toBeNull();
  });

  it('refreshes only friend presence without replacing editor inputs or request tabs', () => {
    const peer = { userId: 'peer', username: 'Peer', displayName: 'Peer', icon: 'neutral', frame: 'default' };
    const host = document.createElement('div');
    host.innerHTML = onlineProfile(emptyAccount(), profile, { friends: [peer], incoming: [], outgoing: [] }, 'friends');
    const input = host.querySelector<HTMLInputElement>('[name="displayName"]')!;
    input.value = 'Unsaved';
    refreshFriendPresence(host, { friends: [{ ...peer, online: false, lastSeenAt: '2026-10-11T00:00:00Z' }], incoming: [], outgoing: [] });
    expect(host.querySelector('[name="displayName"]')).toBe(input);
    expect(input.value).toBe('Unsaved');
    expect(host.querySelector('[data-presence-user]')?.textContent).toContain('Offline · Last seen');
    expect(host.querySelector('[data-presence-user]')?.getAttribute('data-online')).toBe('false');
    expect(friendPresence(peer)).toBe('Status unavailable');
    expect(friendPresence({ ...peer, online: false, lastSeenAt: null })).toBe('Offline · Last seen unavailable');
  });
});
