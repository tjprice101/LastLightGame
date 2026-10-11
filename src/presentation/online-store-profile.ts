import { elements } from '../content/activities';
import { characterName } from '../content/character-art';
import { getStarter, isStarterId } from '../content/starters';
import { type Account, ownedCharacters } from '../game/account';
import { currencyIcon } from './currency-icon';
import { materialArt, materialName } from '../content/dungeon-art';
import { assetUrl } from './portrait';
import { information } from './information';
import { referenceTeamSidebar } from './reference-team';
import { itemShowcase } from './item-showcase';
import { portrait } from './portrait';
import { exchangeProducts, exchangeQuantities } from '../content/material-exchange';
import './online-store-profile.css';

export interface OnlineProfileDisplay {
  username: string;
  displayName: string;
  bio: string;
  icon: string;
  frame: string;
  ownedFrames: readonly string[];
  createdAt: string;
  totalDraws: number;
}

export interface SocialPeerDisplay {
  userId: string;
  username: string;
  displayName: string;
  icon: string;
  frame: string;
}
export interface SocialDisplay {
  friends: readonly SocialPeerDisplay[];
  incoming: readonly SocialPeerDisplay[];
  outgoing: readonly SocialPeerDisplay[];
}

function socialPeer(peer: SocialPeerDisplay, category: 'friends' | 'incoming' | 'outgoing'): string {
  const icon = isStarterId(peer.icon) ? portrait(getStarter(peer.icon)) : '<span aria-hidden="true">L/L</span>';
  const id = escape(peer.userId);
  const buttons = category === 'incoming'
    ? `<button data-friend-action="acceptFriendRequest" data-user-id="${id}">Accept</button><button data-friend-action="declineFriendRequest" data-user-id="${id}">Decline</button>`
    : category === 'outgoing' ? `<button data-friend-action="cancelFriendRequest" data-user-id="${id}">Cancel request</button>`
    : `<button data-friend-action="removeFriend" data-user-id="${id}">Remove friend</button>`;
  return `<li class="online-friend" data-friend-name="${escape(`${peer.displayName} ${peer.username}`.toLowerCase())}"><div class="profile-frame-preview" data-profile-frame="${escape(peer.frame)}">${icon}</div><div><strong>${escape(peer.displayName)}</strong><p>@${escape(peer.username)}</p>${category === 'friends' ? information(`friend-${id}`, escape(peer.displayName), `<div class="profile-frame-preview" data-profile-frame="${escape(peer.frame)}">${icon}</div><p>@${escape(peer.username)}</p><p>Public profile: display name, username, icon and frame.</p>`, 'View profile') : ''}</div><div>${buttons}</div></li>`;
}

function socialPanel(social?: SocialDisplay): string {
  if (!social) return '<section class="online-friends"><h2>Friends</h2><p role="status">Friends could not be loaded. Reconnect to your account.</p></section>';
  return `<section class="online-friends ref-panel"><header class="ref-panel-heading">Friends · ${social.friends.length}<button data-refresh-social>Refresh</button></header>
    <form id="online-friend-form"><label>Add a friend by username<input name="username" minlength="3" maxlength="16" pattern="[A-Za-z0-9_]{3,16}" autocomplete="off" required></label><button type="submit">Send request</button></form>
    <p>Requests require acceptance. Friends see your username, display name, icon and frame, never your email or balances.</p>
    <label class="ref-friend-search">Search friends<input data-friend-search type="search" placeholder="Name or username"></label><nav aria-label="Friends and requests"><button data-social-tab="friends" aria-pressed="true">Friends (${social.friends.length})</button><button data-social-tab="incoming" aria-pressed="false">Incoming (${social.incoming.length})</button><button data-social-tab="outgoing" aria-pressed="false">Outgoing (${social.outgoing.length})</button></nav>
    ${(['friends', 'incoming', 'outgoing'] as const).map(category => `<div data-social-panel="${category}" ${category === 'friends' ? '' : 'hidden'}><ul>${social[category].map(peer => socialPeer(peer, category)).join('')}</ul>${social[category].length ? '' : `<p>${category === 'friends' ? 'No friends yet.' : category === 'incoming' ? 'No incoming requests.' : 'No outgoing requests.'}</p>`}</div>`).join('')}
    <p id="online-friend-result" role="status"></p></section>`;
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

export function onlineProfile(account: Account | null, profile: OnlineProfileDisplay | null, social?: SocialDisplay, view: 'info' | 'friends' = 'info'): string {
  if (!profile || !account) return `<section class="online-profile"><h1 tabindex="-1">Player info</h1><ll-player-save-data></ll-player-save-data></section>`;
  const ids = ownedCharacters(account);
  const icon = isStarterId(profile.icon) && ids.includes(profile.icon)
    ? portrait(getStarter(profile.icon)) : '<span aria-hidden="true">L/L</span>';
  const beacons = Math.floor((account.storyCompleted ?? 0) / 25);
  return `<section class="online-profile ref-screen ref-profile"><nav class="ref-market-tabs"><button data-profile-tab="info" aria-pressed="${view === 'info'}">Player info</button><button data-profile-tab="friends" aria-pressed="${view === 'friends'}">Friends · ${social?.friends.length ?? 0}</button></nav><form id="online-profile-form" class="online-profile-panel ref-panel"><h2>Profile</h2>
    <div class="profile-frame-preview" data-profile-frame="${escape(profile.frame)}">${icon}</div>
    <div class="ref-profile-code"><small>Username · Use this to add friends</small><b>@${escape(profile.username)}</b><button type="button" data-copy-username="${escape(profile.username)}">Copy username</button></div>
    <label>Display name<input name="displayName" value="${escape(profile.displayName)}" maxlength="16" required></label>
    <fieldset class="ref-profile-icons"><legend>Icon</legend><label><input type="radio" name="icon" value="neutral" ${profile.icon === 'neutral' || !ids.some(id => id === profile.icon) ? 'checked' : ''}><span aria-label="Last Light">L/L</span></label>${ids.map(id => `<label><input type="radio" name="icon" value="${id}" ${profile.icon === id ? 'checked' : ''}><span aria-label="${characterName(id)}">${portrait(getStarter(id))}</span></label>`).join('')}</fieldset>
    <label><span class="ref-bio-label">Bio <small data-bio-count>${profile.bio.length} / 120</small></span><textarea name="bio" maxlength="120" rows="4">${escape(profile.bio)}</textarea></label>
    <p class="ref-profile-save-note">Changes save automatically when you finish editing a field.</p><button type="submit" data-profile-retry hidden>Retry saving profile</button><button type="button" data-online-signout>Sign out</button><p id="online-profile-result" role="status"></p></form>
    <div class="online-profile-statistics" ${view !== 'info' ? 'hidden' : ''}><article class="ref-panel"><h2>Story progress</h2><dl><dt>Stages cleared</dt><dd>${account.storyCompleted ?? 0} / 150</dd><dt>Beacons restored</dt><dd>${beacons} / 6</dd></dl></article>
    <article><h2>Collection</h2><dl><dt>Element-Bearers</dt><dd>${ids.length}</dd><dt>Captured Elemental-Devourers</dt><dd>${account.capturedCharacters?.length ?? 0}</dd><dt>Owned Conduit types</dt><dd>${Object.values(account.conduits ?? {}).filter(count => count > 0).length}</dd></dl></article>
    <article><h2>Account</h2><dl><dt>Joined</dt><dd>${escape(new Date(profile.createdAt).toLocaleDateString('en-US'))}</dd><dt>Total summons</dt><dd>${profile.totalDraws}</dd></dl><p>Online account statistics only. Legacy activity is not imported.</p></article>
    <article><h2>Profile frame</h2><p>${profileFrames.find(frame => frame.id === profile.frame)?.name ?? 'Default'}</p><button data-page="stores" data-cosmetic-store>Visit Cosmetic Store</button></article>${view === 'info' ? '<ll-player-save-data></ll-player-save-data>' : ''}</div><div class="ref-profile-social" ${view !== 'friends' ? 'hidden' : ''}>${socialPanel(social)}</div>
    <aside class="ref-profile-right">${account.squad?.length ? referenceTeamSidebar(account, { view: 'formation', selected: ids[0] ?? 'ember', element: '', sort: 'level' }) : '<section class="ref-panel"><header class="ref-panel-heading">Squad</header><p>No squad saved.</p></section>'}<section class="ref-panel"><header class="ref-panel-heading">Recent activity</header><p>Activity history is not recorded. Your saved progress and totals are shown in Player info.</p></section></aside></section>`;
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
  form.addEventListener('change', () => { pending = read(); void persist(); });
  form.addEventListener('submit', event => { event.preventDefault(); pending = read(); void persist(); });
}
