import { elements } from '../content/activities';
import { characterName } from '../content/character-art';
import { getStarter, isStarterId, starters, type StarterId } from '../content/starters';
import { type Account, ownedCharacters, ownedProgress, equippedSquad } from '../game/account';
import { currencyIcon } from './currency-icon';
import { materialArt, materialName } from '../content/dungeon-art';
import { assetUrl } from './portrait';
import { information } from './information';
import { itemShowcase } from './item-showcase';
import { portrait } from './portrait';
import { exchangeProducts, exchangeQuantities } from '../content/material-exchange';
import './online-store-profile.css';
import { storyRegions, storyRules } from '../content/story';
import { creatures } from '../content/creatures';
import { conduits } from '../content/conduits';
import { ownedCompanion } from './owned-companion';
import './profile-layout.css';
import { profilePictures, profilePictureUnlocked, canonicalProfilePicture } from '../content/profile-pictures';
import { profilePicture } from './profile-picture';
import { chatShell } from './friend-chat';

export interface OnlineProfileDisplay {
  username: string;
  displayName: string;
  bio: string;
  icon: string;
  frame: string;
  ownedFrames: readonly string[];
  createdAt: string;
  totalDraws: number;
  friendCode?: string;
  playerId?: string;
  daysPlayed?: number;
  playTimeSeconds?: number;
  recentActivity?: readonly { id: string; message: string; detail: string; at: string }[];
}

export interface SocialPeerDisplay {
  userId: string;
  username: string;
  displayName: string;
  icon: string;
  frame: string;
  online?: boolean;
  lastSeenAt?: string | null;
}
export interface SocialDisplay {
  friends: readonly SocialPeerDisplay[];
  incoming: readonly SocialPeerDisplay[];
  outgoing: readonly SocialPeerDisplay[];
}

export function friendPresence(peer: SocialPeerDisplay): string {
  if (peer.online === undefined) return 'Status unavailable';
  if (peer.online) return 'Online';
  if (!peer.lastSeenAt) return 'Offline · Last seen unavailable';
  return `Offline · Last seen ${new Date(peer.lastSeenAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
}

export function refreshFriendPresence(host: HTMLElement, social: SocialDisplay): void {
  for (const peer of social.friends) {
    const row = Array.from(host.querySelectorAll<HTMLElement>('[data-presence-user]')).find(entry => entry.dataset.presenceUser === peer.userId);
    if (!row) continue;
    row.textContent = friendPresence(peer);
    row.dataset.online = peer.online === undefined ? 'unknown' : String(peer.online);
  }
}

function socialPeer(peer: SocialPeerDisplay, category: 'friends' | 'incoming' | 'outgoing'): string {
  const icon = profilePicture(peer.icon);
  const id = escape(peer.userId);
  const buttons = category === 'incoming'
    ? `<button data-friend-action="acceptFriendRequest" data-user-id="${id}">Accept</button><button data-friend-action="declineFriendRequest" data-user-id="${id}">Decline</button>`
    : category === 'outgoing' ? `<button data-friend-action="cancelFriendRequest" data-user-id="${id}">Cancel request</button>`
    : `<button data-message-friend="${id}">Message</button><button data-friend-action="removeFriend" data-user-id="${id}">Remove friend</button>`;
  if (category === 'friends') return `<li class="online-friend online-friend-accepted" data-friend-name="${escape(`${peer.displayName} ${peer.username}`.toLowerCase())}"><div class="profile-frame-preview" data-profile-frame="${escape(peer.frame)}">${icon}</div><div><strong>${escape(peer.displayName)}</strong><p>@${escape(peer.username)}</p><small data-presence-user="${id}" data-online="${peer.online === undefined ? 'unknown' : String(peer.online)}">${escape(friendPresence(peer))}</small></div><div>${information(`friend-${id}`, escape(peer.displayName), `<div class="profile-frame-preview" data-profile-frame="${escape(peer.frame)}">${icon}</div><p>@${escape(peer.username)}</p><p>Public profile: display name, username, icon and frame.</p>${buttons}`, 'View profile')}</div></li>`;
  return `<li class="online-friend"><div class="profile-frame-preview" data-profile-frame="${escape(peer.frame)}">${icon}</div><div><strong>${escape(peer.displayName)}</strong><p>@${escape(peer.username)}</p></div><div>${buttons}</div></li>`;
}

function socialPanel(profile: OnlineProfileDisplay, social?: SocialDisplay, requestView: 'incoming' | 'outgoing' = 'incoming'): string {
  return `<section class="online-friends profile-friends-list ref-panel"><header class="ref-panel-heading">Friends · ${social ? `${social.friends.length} / 30` : 'Unavailable'}<button data-refresh-social>Refresh</button></header>
    <label class="ref-friend-search">Search friends<input data-friend-search type="search" placeholder="Name or username"></label>
    <div class="profile-friend-list-scroll"><ul>${social?.friends.map(peer => socialPeer(peer, 'friends')).join('') ?? ''}</ul><p data-friend-empty ${social?.friends.length ? 'hidden' : ''}>${social ? 'No friends yet.' : 'Friends could not be loaded. Refresh to reconnect.'}</p><p data-friend-no-match hidden>No matching friends.</p></div><p class="profile-social-privacy">Friends see your public profile and online/last-seen status, never your email or balances. Online means activity within the last 90 seconds.</p><p id="online-friend-result" role="status"></p></section>
    <aside class="profile-friends-sidebar"><section class="ref-panel profile-add-friend"><h2>Add a friend</h2>
    <form id="online-friend-form"><label>Username or friend code<input name="username" minlength="3" maxlength="16" pattern="[A-Za-z0-9_-]{3,16}" autocomplete="off" placeholder="Username or LL-XXXX-XXXX" required></label><button type="submit">Send request</button></form>
    ${profile.friendCode ? `<p class="profile-share-code" aria-label="Your friend code"><b>${escape(profile.friendCode)}</b><button type="button" data-copy-profile="${escape(profile.friendCode)}">Copy</button></p>` : '<p>Your code is unavailable. Refresh to reconnect.</p>'}
    </section>
    <section class="ref-panel profile-friend-requests"><h2>Requests · ${social ? social.incoming.length + social.outgoing.length : 'Unavailable'}</h2><nav aria-label="Friend requests"><button data-social-tab="incoming" aria-pressed="${requestView === 'incoming'}">Received (${social?.incoming.length ?? '—'})</button><button data-social-tab="outgoing" aria-pressed="${requestView === 'outgoing'}">Sent (${social?.outgoing.length ?? '—'})</button></nav>
    ${(['incoming', 'outgoing'] as const).map(category => `<div data-social-panel="${category}" ${category === requestView ? '' : 'hidden'}><ul>${social?.[category].map(peer => socialPeer(peer, category)).join('') ?? ''}</ul>${social?.[category].length ? '' : `<p>${!social ? 'Requests unavailable. Refresh to reconnect.' : category === 'incoming' ? 'No incoming requests.' : 'No outgoing requests.'}</p>`}</div>`).join('')}</section></aside>`;
}

export const profileFrames = [
  { id: 'default', name: 'Default', price: 0 },
  { id: 'thin-outline', name: 'Thin Outline', price: 10 },
  { id: 'double-outline', name: 'Double Outline', price: 10 },
  { id: 'corner-brackets', name: 'Corner Brackets', price: 10 },
] as const;

function escape(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

function exchangeArt(materialId: string): string {
  const art = materialArt(materialId);
  return art ? `<img draggable="false" src="${assetUrl(`materials/${art}.png`)}" alt="">` : '<span>Artwork pending</span>';
}

export function materialExchange(account: Account | null, selected: string, navigation: string): string {
  const product = exchangeProducts.find(entry => entry.id === selected) ?? exchangeProducts[0];
  const category = product.category;
  const products = exchangeProducts.filter(entry => entry.category === category);
  const owned = (id: string) => (account?.materials[id] ?? 0).toLocaleString('en-US');
  const funds = account?.fractalis ?? 0;
  const restricted = product.restrictedTo ? product.restrictedTo.join(', ') : '';
  return `<section class="online-market ref-screen ref-market ref-exchange" data-exchange-category="${category}">${navigation}
    <section class="ref-panel"><header class="ref-panel-heading">Material Exchange</header>
    <nav class="ref-exchange-categories" aria-label="Material categories">
      <button data-market-category="normal" aria-pressed="${category === 'normal'}">Normal Game Materials</button>
      <button data-market-category="event" aria-pressed="${category === 'event'}">Limited-time Event Materials</button></nav>
    ${category === 'event' ? `<p class="ref-exchange-note" role="note">Event materials are only for ${restricted}. Normal Element-Bearers cannot use them.</p>` : ''}
    <div class="ref-scroll"><div class="ref-product-grid">${products.map(entry => `<button class="ref-product" data-market-material="${entry.id}" aria-pressed="${product.id === entry.id}"><div class="ref-product-art">${exchangeArt(entry.materialId)}</div><b>${materialName(entry.materialId)}</b><small>${entry.rarity} · Owned ${owned(entry.materialId)}</small><span class="ref-chip">${entry.price.toLocaleString('en-US')} Prismatica</span></button>`).join('')}</div></div></section>
    <aside class="ref-panel ref-store-detail"><header class="ref-panel-heading">Details</header>
    ${itemShowcase([{ id: product.materialId, amount: account?.materials[product.materialId] ?? 0 }], materialName(product.materialId))}
    <h2>${materialName(product.materialId)}</h2>
    <p>${product.category === 'event' ? `${product.rarity} ${product.eventName} event material. <strong>Only for ${restricted}</strong> — not usable by normal Element-Bearers.` : `${product.rarity} ${elements.find(element => element.id === product.id)?.name ?? ''} upgrade material. Usable by normal Element-Bearers.`}</p>
    <dl class="ref-detail-facts"><div><dt>Price per unit</dt><dd>${product.price.toLocaleString('en-US')} Prismatica</dd></div><div><dt>Owned</dt><dd>${owned(product.materialId)}</dd></div><div><dt>Prismatica</dt><dd>${funds.toLocaleString('en-US')}</dd></div></dl>
    <footer><div class="ref-exchange-buy" role="group" aria-label="Buy quantity">${exchangeQuantities.map(quantity => {
      const cost = product.price * quantity;
      return `<button data-buy-material="${product.id}" data-quantity="${quantity}" ${account && funds >= cost ? '' : 'disabled'}><b>Buy ${quantity}</b><small>${cost.toLocaleString('en-US')} Prismatica</small></button>`;
    }).join('')}</div>
    ${account ? '' : '<p role="status">Material Exchange unavailable. Resolve the save error.</p>'}
    <p>No bulk discounts or daily limits.${product.category === 'normal' ? ' Rarer materials and specialty items are not sold here.' : ''}</p></footer></aside></section>`;
}

export function onlineStores(account: Account | null, profile: OnlineProfileDisplay | null, tab: 'materials' | 'cosmetics', selectedMaterial = 'infernic', selectedFrame = 'default'): string {
  const online = profile !== null;
  const notice = online ? '' : '<p role="status" data-online-perk>Profile frames decorate your online profile, which friends see. Sign in to an online account to buy or equip them. Everything else in the game works without an account.</p>';
  const navigation = `<nav class="online-store-tabs" aria-label="Stores">
    <button data-store-tab="materials" aria-pressed="${tab === 'materials'}">Material Exchange</button>
    <button data-store-tab="cosmetics" aria-pressed="${tab === 'cosmetics'}">Cosmetic Store</button>
    <button data-page="conduit-store">Conduit Store</button></nav>`;
  if (tab === 'materials') return materialExchange(account, selectedMaterial, navigation);
  const choice = profileFrames.find(frame => frame.id === selectedFrame) ?? profileFrames[0];
  const owned = choice.id === 'default' || profile?.ownedFrames.includes(choice.id);
  return `<section class="online-market ref-screen ref-market">${navigation}<section class="ref-panel"><header class="ref-panel-heading">Cosmetic Store · Profile frames</header><div class="ref-scroll"><div class="ref-product-grid">${profileFrames.map(frame => {
    const owned = frame.id === 'default' || profile?.ownedFrames.includes(frame.id);
    return `<button class="ref-product" data-market-frame="${frame.id}" aria-pressed="${choice.id === frame.id}"><div class="profile-frame-preview" data-profile-frame="${frame.id}"><span>L/L</span></div><b>${frame.name}</b><small>For Profile</small><span class="ref-chip">${owned ? 'Owned' : `${frame.price} Null-Prismatica`}</span></button>`;
  }).join('')}</div></div></section><aside class="ref-panel ref-store-detail"><header class="ref-panel-heading">Details</header><div class="profile-frame-preview ref-frame-hero" data-profile-frame="${choice.id}"><span>L/L</span></div><h2>${choice.name}</h2><p>Profile decoration only. No gameplay effects.</p><dl class="ref-detail-facts"><div><dt>Price</dt><dd>${choice.price ? `${choice.price} Null-Prismatica` : 'Free default frame'}</dd></div><div><dt>Ownership</dt><dd>${owned ? 'Owned permanently' : 'Not owned'}</dd></div></dl>${notice}<footer><button ${owned ? `data-equip-frame="${choice.id}"` : `data-buy-frame="${choice.id}"`} ${!online || profile?.frame === choice.id ? 'disabled' : ''}>${profile?.frame === choice.id ? 'Equipped' : owned ? 'Equip' : 'Buy frame'}</button></footer></aside></section>`;
}

function profilePlayTime(seconds: number | undefined): string {
  if (seconds === undefined) return 'Tracking starts now';
  return `${Math.floor(seconds / 3600).toLocaleString('en-US')} h ${Math.floor(seconds % 3600 / 60)} m`;
}

export function refreshProfileTracking(host: HTMLElement, profile: OnlineProfileDisplay): void {
  const days = host.querySelector('[data-profile-days]');
  const time = host.querySelector('[data-profile-time]');
  if (days) days.textContent = profile.daysPlayed === undefined ? 'Tracking starts now' : profile.daysPlayed.toLocaleString('en-US');
  if (time) time.textContent = profilePlayTime(profile.playTimeSeconds);
}

export function onlineProfile(account: Account | null, profile: OnlineProfileDisplay | null, social?: SocialDisplay, view: 'info' | 'friends' | 'chats' = 'info', requestView: 'incoming' | 'outgoing' = 'incoming'): string {
  if (!profile || !account) return `<section class="online-profile"><h1 tabindex="-1">Player info</h1><ll-player-save-data></ll-player-save-data></section>`;
  const navigation = `<nav class="ref-market-tabs"><button data-profile-tab="info" aria-pressed="${view === 'info'}">Player info</button><button data-profile-tab="chats" aria-pressed="${view === 'chats'}">Chats <span data-chat-unread></span></button><button data-profile-tab="friends" aria-pressed="${view === 'friends'}">Friends · ${social?.friends.length ?? 'unavailable'}${social?.incoming.length ? `<span class="profile-new-requests">${social.incoming.length} new</span>` : ''}</button></nav>`;
  if (view === 'chats') return `<section class="online-profile ref-screen ref-profile profile-chat-layout">${navigation}${chatShell()}</section>`;
  const ids = ownedCharacters(account);
  const canonicalIcon = canonicalProfilePicture(profile.icon);
  const icon = canonicalIcon === 'neutral' || profilePictureUnlocked(account, canonicalIcon) ? profilePicture(profile.icon) : profilePicture('neutral');
  const beacons = Math.floor((account.storyCompleted ?? 0) / 25);
  const completed = account.storyCompleted ?? 0;
  const capturedForms = creatures.filter(creature => creature.mode && creature.mode !== 'machines');
  const captured = new Set(account.capturedCharacters?.map(copy => copy.creatureId) ?? []);
  const forms = ids.reduce((sum, id) => sum + ownedProgress(account, id).evolution, 0) + capturedForms.filter(creature => captured.has(creature.id)).length;
  const currentRegion = storyRegions[Math.min(Math.floor(completed / storyRules.regionStages), storyRegions.length - 1)];
  const number = (value: number) => value.toLocaleString('en-US');
  const progress = (value: number, maximum: number, label: string) => `<progress value="${value}" max="${maximum}" aria-label="${escape(label)}">${value} / ${maximum}</progress>`;
  const metric = (label: string, value: number, maximum: number, footer = '') => `<article class="profile-metric"><h2>${label}</h2><p><strong>${number(value)}</strong><span> / ${number(maximum)}</span></p>${footer || progress(value, maximum, label)}</article>`;
  const collection = (label: string, value: number, maximum: number) => `<div class="profile-progress-row"><span>${label}</span>${progress(value, maximum, label)}<b>${number(value)}/${number(maximum)}</b></div>`;
  const unlockedPictures = profilePictures.filter(picture => profilePictureUnlocked(account, picture.id));
  const squad = ids.length || account.capturedCharacters?.length ? equippedSquad(account) : [];
  const pity = (['standard', 'roses'] as const).map(id => {
    const counters = account.bannerPity?.[id];
    return `<div class="profile-pity-row"><span>${id === 'standard' ? 'Standard' : 'Roses'}</span><b>${counters?.highestStar ?? 0}/200</b><b>${counters?.unownedHighestStar ?? 0}/500</b></div>`;
  }).join('');
  const friendsMetric = social ? metric('Friends', social.friends.length, 30, `<button type="button" data-profile-tab="friends">${social.incoming.length} new requests</button>`)
    : '<article class="profile-metric"><h2>Friends</h2><p>Unavailable</p><button type="button" data-profile-tab="friends">Reconnect to load</button></article>';
  return `<section class="online-profile ref-screen ref-profile profile-layout">${navigation}<form id="online-profile-form" class="online-profile-panel ref-panel" aria-label="Edit public profile"><h2 class="profile-accessible-heading">Profile</h2>
    <div class="profile-frame-preview profile-main-avatar" data-profile-frame="${escape(profile.frame)}">${icon}</div>
    <label>Display name<input name="displayName" value="${escape(profile.displayName)}" maxlength="16" required></label>
    <div class="ref-profile-code"><small>Friend code · Share it to add friends</small>${profile.friendCode ? `<div><b>${escape(profile.friendCode)}</b><button type="button" data-copy-profile="${escape(profile.friendCode)}">Copy</button></div>` : '<p>Reconnect to receive your friend code.</p>'}<span>@${escape(profile.username)}</span></div>
    <div class="profile-picture-summary"><span>${unlockedPictures.length} / 32 pictures unlocked</span><button type="button" data-browse-profile-pictures>Change / Browse</button></div><select name="icon" data-profile-icon-picker data-native-select hidden aria-label="Profile picture"><option value="neutral" ${canonicalIcon === 'neutral' ? 'selected' : ''}>Last Light</option>${unlockedPictures.map(picture => `<option value="${picture.id}" ${canonicalIcon === picture.id ? 'selected' : ''}>${escape(picture.name)}</option>`).join('')}</select>
    <label><span class="ref-bio-label">Bio <small data-bio-count>${profile.bio.length} / 120</small></span><textarea name="bio" maxlength="120" rows="3">${escape(profile.bio)}</textarea></label>
    <div class="profile-id-row"><span>Player ID ${profile.playerId ? `<button type="button" data-copy-profile="${escape(profile.playerId)}">${escape(profile.playerId)} · Copy</button>` : 'pending'}</span><span>Auto-saves</span></div>
    <p class="ref-profile-save-note">Edits save when you finish a field.</p><button type="submit" data-profile-retry hidden>Retry saving profile</button><div class="profile-frame-row"><button type="button" data-page="stores" data-cosmetic-store>Frame · ${profileFrames.find(frame => frame.id === profile.frame)?.name ?? 'Default'}</button><button type="button" data-online-signout>Sign out</button></div><p id="online-profile-result" role="status"></p></form>
    <div class="online-profile-statistics" ${view !== 'info' ? 'hidden' : ''}>
      <div class="profile-metrics">${metric('Stages cleared', completed, storyRules.stages)}${metric('Beacons restored', beacons, storyRegions.length)}${metric('Element-Bearers', ids.length, starters.length)}${friendsMetric}</div>
      <article class="profile-story"><header><h2>Story progress</h2><span>${currentRegion.name}</span></header>${storyRegions.map((region, index) => {
        const cleared = Math.max(0, Math.min(storyRules.regionStages, completed - index * storyRules.regionStages));
        return `<div class="profile-progress-row ${region === currentRegion ? 'is-current' : ''}"><span>${region.name}</span>${progress(cleared, storyRules.regionStages, `${region.name} stages cleared`)}<b>${cleared}/25</b></div>`;
      }).join('')}</article>
      <article class="profile-collection"><h2>Collection</h2>${collection('Element-Bearers', ids.length, starters.length)}${collection('Captured forms', capturedForms.filter(creature => captured.has(creature.id)).length, capturedForms.length)}${collection('Conduit types', conduits.filter(conduit => (account.conduits?.[conduit.id] ?? 0) > 0).length, conduits.length)}${collection('Forms reached', forms, starters.length * 6 + capturedForms.length)}<p>${number(account.capturedCharacters?.length ?? 0)} captured Elemental-Devourer copies</p></article>
      <article class="profile-account"><h2>Account &amp; summons</h2><dl><div><dt>Joined</dt><dd>${escape(new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))}</dd></div><div><dt>Days played</dt><dd data-profile-days>${profile.daysPlayed === undefined ? 'Tracking starts now' : number(profile.daysPlayed)}</dd></div><div><dt>Play time</dt><dd data-profile-time>${profilePlayTime(profile.playTimeSeconds)}</dd></div><div><dt>Total summons</dt><dd>${number(profile.totalDraws)}</dd></div></dl><div class="profile-pity-heading"><span>Banner</span><span>Since highest</span><span>Since unowned</span></div>${pity}<p>Online totals; earlier untracked activity is not estimated.</p></article>
      ${view === 'info' ? `<ll-player-save-data compact online-user="${escape(profile.username)}"></ll-player-save-data>` : ''}
    </div><div class="ref-profile-social" ${view !== 'friends' ? 'hidden' : ''}>${socialPanel(profile, social, requestView)}</div>
    <aside class="ref-profile-right" ${view === 'friends' ? 'hidden' : ''}><section class="ref-panel profile-squad"><header class="ref-panel-heading">Squad · ${squad.length} of 3</header>${Array.from({ length: 3 }, (_, index) => {
      const id = squad[index];
      if (!id) return '<button type="button" class="ref-member-row ref-empty-row" data-team-view="formation">+ Add a member</button>';
      const member = ownedCompanion(account, id);
      return `<div class="ref-member-line"><button type="button" class="ref-member-row" ${isStarterId(id) ? `data-team-detail="${id}"` : `data-team-capture-detail="${id}"`}><span class="ref-thumb">${member.art}</span><span><b>${member.name}</b><small>${index ? 'Member' : 'Leader'} · Lv.${member.level}</small></span></button>${index ? `<button type="button" class="ref-chip" data-make-leader="${id}" aria-label="Make ${member.name} the leader">Lead</button>` : ''}</div>`;
    }).join('')}</section><section class="ref-panel profile-recent"><h2>Recent activity</h2>${profile.recentActivity?.length ? `<ul>${profile.recentActivity.slice(0, 5).map(entry => `<li><b>${escape(entry.message)}</b><small>${escape(entry.detail)}</small><time datetime="${escape(entry.at)}">${escape(new Date(entry.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}</time></li>`).join('')}</ul>` : '<p>New activity will appear here as you play. Earlier history is not reconstructed.</p>'}</section></aside></section>`;
}

export interface ProfileEdits {
  displayName: string;
  bio: string;
  icon: string;
}

export function bindProfileEditor(host: HTMLElement, save: (edits: ProfileEdits) => Promise<void>, reportError: (error: unknown) => void): void {
  const form = host.querySelector<HTMLFormElement>('#online-profile-form');
  if (!form) return;
  const result = form.querySelector<HTMLElement>('#online-profile-result')!;
  const retry = form.querySelector<HTMLButtonElement>('[data-profile-retry]')!;
  const read = (): ProfileEdits => {
    const data = new FormData(form);
    return { displayName: String(data.get('displayName') ?? ''), bio: String(data.get('bio') ?? ''), icon: String(data.get('icon') ?? '') };
  };
  let saved = JSON.stringify(read());
  let pending: ProfileEdits | undefined;
  let failed: ProfileEdits | undefined;
  let saving = false;
  const iconPicker = form.querySelector<HTMLSelectElement>('[data-profile-icon-picker]');
  const refreshIcon = (): void => {
    if (!iconPicker) return;
    const id = iconPicker.value;
    const preview = form.querySelector('.profile-main-avatar');
    if (preview) preview.innerHTML = profilePicture(id);
  };
  const persist = async (): Promise<void> => {
    if (saving || !form.reportValidity()) return;
    saving = true;
    try {
      while (failed || pending) {
        const edits = failed ?? pending!;
        if (edits === pending) pending = undefined;
        if (JSON.stringify(edits) === saved) continue;
        result.textContent = 'Saving profile…';
        try {
          await save(edits);
        } catch (error) {
          failed = edits;
          throw error;
        }
        saved = JSON.stringify(edits);
        failed = undefined;
      }
      result.textContent = JSON.stringify(read()) === saved ? 'Profile saved.' : 'Unsaved changes. Finish editing the field to save.';
      retry.hidden = true;
    } catch (error) {
      result.textContent = 'Profile was not confirmed saved. Retry to confirm the previous update before saving newer edits.';
      retry.hidden = false;
      reportError(error);
    } finally {
      saving = false;
    }
  };
  form.addEventListener('input', () => {
    form.querySelector<HTMLElement>('[data-bio-count]')!.textContent = `${read().bio.length} / 120`;
    result.textContent = 'Unsaved changes. Finish editing the field to save.';
  });
  form.addEventListener('change', () => { refreshIcon(); pending = read(); void persist(); });
  form.addEventListener('submit', event => { event.preventDefault(); pending = read(); void persist(); });
}
