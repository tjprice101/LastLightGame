import { conduits, getConduit, conduitEffect, validateConduitUpgradeLevel, type ConduitId, type ConduitSlots, type ConduitUpgrades } from '../content/conduits';
import { type Account } from '../game/account';
import { currencyIcon } from './currency-icon';
import { assetUrl } from './portrait';
import './conduit-store.css';
import { information } from './information';
import { conduitUpgradeMeter } from './conduit-upgrade-meter';
import { isBannerConduitEligible } from '../content/machines';
import { referencedEffect as readableEffect } from './effect-copy';
import { escapeDialogText } from './game-dialog';
import { calamiticLockMessage, calamiticStoreUnlocked, calamiticTokenPrice, isCalamiticConduitId } from '../content/calamitic-conduits';
import { conduitElement, omnicTheme } from './conduit-element';
import { shopHost } from './shop-host';
import './rarity-feedback.css';
import { catalogInformation, offerInformation } from './information-layout';

export function conduitLore(...paragraphs: string[]): string {
  return `<details class="conduit-lore-disclosure"><summary>Lore</summary>${paragraphs.map(text => `<p class="conduit-lore">${escapeDialogText(text)}</p>`).join('')}</details>`;
}

export function conduitDetails(id: ConduitId, level = 0, revealArt = true): string {
  const conduit = getConduit(id);
  return catalogInformation({ name: conduit.name, art: `<div class="conduit-details-art${revealArt ? '' : ' unreached-character-art'}">${conduitIcon(id, level)}</div>`,
    metadata: conduitRarity(id), effects: [`Current effect (+${level}): ${readableEffect(conduitEffect(conduit, level))}`, `At +5: ${readableEffect(conduitEffect(conduit, 5))}`],
    lore: `${conduit.lore} ${conduit.power}`, acquisition: `${isCalamiticConduitId(id) ? `${calamiticTokenPrice} Calamitic Tokens in Rise's Conduit Store · Universal` : conduit.price !== null ? `${conduit.price.toLocaleString('en-US')} Prismatica in the Conduit Store` : 'Awaken the Machines drop'}${isBannerConduitEligible(id) ? ' · Part of the 0.5% Legendary banner bonus pool' : ''}` });
}

export function conduitIcon(id: ConduitId, level = 0): string {
  const conduit = getConduit(id);
  validateConduitUpgradeLevel(level);
  return `<span class="conduit-icon-frame" data-rarity="${conduit.rarity}" ${omnicTheme(id)} role="img" aria-label="${conduit.name} · Upgrade +${level} of 5" data-conduit-upgrade="${level}">${conduit.art ? `<img draggable="false" class="conduit-icon" src="${assetUrl(`conduits/${conduit.art}.png`)}" alt="" aria-hidden="true" width="256" height="256" loading="lazy">`
    : '<span class="conduit-icon conduit-art-pending">Artwork pending</span>'}${conduitUpgradeMeter(level)}</span>`;
}
export function conduitRarity(id: ConduitId): string {
  const rarity = getConduit(id).rarity;
  return `<span class="rarity-badge conduit-rarity conduit-${rarity.toLowerCase()}">${rarity}</span>${conduitElement(id)}`;
}
export function conduitInventory(account: Account | null): string {
  return `<section class="inventory-section"><div class="conduit-section-heading"><h2>Conduits</h2></div>
    ${!account ? '<p role="alert">Conduit inventory unavailable. Check the save error.</p>' :
      conduits.some((conduit) => (account.conduits?.[conduit.id] ?? 0) > 0)
        ? `<ul class="conduit-owned-list">${conduits.filter((conduit) => (account.conduits?.[conduit.id] ?? 0) > 0).map((conduit) =>
          `<li ${omnicTheme(conduit.id)}>${conduitIcon(conduit.id, account.conduitUpgrades?.[conduit.id])}<div><strong>${conduit.name}</strong>${conduitRarity(conduit.id)}<small>${readableEffect(conduitEffect(conduit, account.conduitUpgrades?.[conduit.id]))}</small></div><span>Owned ${account.conduits?.[conduit.id]}</span></li>`).join('')}</ul>`
        : '<p>No Conduits owned yet.</p>'}
    </section>`;
}
export function conduitStore(account: Account | null, selected?: string, rarity = ''): string {
  const calamitic = rarity === 'Calamitic';
  const navigation = `<nav class="ref-market-tabs"><button data-page="stores">Material Exchange</button><button data-page="stores" data-market-cosmetics>Cosmetic Store</button><button data-store-rarity="" ${calamitic ? '' : 'aria-current="page"'}>Conduit Store</button><button data-store-rarity="Calamitic" ${calamitic ? 'aria-current="page"' : ''}>Calamitic Conduits</button><button data-page="conduit-upgrade">Upgrade &rarr;</button></nav>`;
  if (calamitic && !calamiticStoreUnlocked(account)) return `<section class="conduit-store ref-screen ref-conduit-store" data-store-mode="locked">${navigation}${shopHost('sarev', 'locked')}<div class="calamitic-store-lock" role="region" aria-label="Calamitic Conduits locked"><span class="calamitic-lock-symbol" aria-hidden="true"></span><p>${calamiticLockMessage}</p></div></section>`;
  const catalog = conduits.filter(entry => calamitic ? entry.rarity === 'Calamitic' : entry.price !== null && (!rarity || entry.rarity === rarity));
  const choice = catalog.find(entry => entry.id === selected) ?? catalog[0];
  const cost = calamitic ? calamiticTokenPrice : choice?.price;
  const currency = calamitic ? 'Calamitic Tokens' : 'Prismatica';
  const balance = calamitic ? account?.calamiticTokens ?? 0 : account?.fractalis ?? 0;
  const owned = !!choice && (account?.conduits?.[choice.id] ?? 0) > 0;
  return `<section class="conduit-store ref-screen ref-conduit-store" data-store-mode="${calamitic ? 'calamitic' : 'ordinary'}">${navigation}
    <aside class="ref-panel"><h3>${calamitic ? 'Calamitic' : 'Rarity'}</h3>${calamitic ? `<p>Any element</p><p>${currencyIcon('calamitic-tokens')}<strong>${balance.toLocaleString('en-US')}</strong> Calamitic Tokens</p><p>One copy lets all your squad members equip this Conduit.</p>` : `<nav class="ref-rarity-filter">${['', ...new Set(conduits.filter(entry => entry.price !== null).map(entry => entry.rarity))].map(value => `<button data-store-rarity="${value}" aria-pressed="${value === rarity}">${value || 'All'}<small>${conduits.filter(entry => entry.price !== null && (!value || entry.rarity === value)).length}</small></button>`).join('')}</nav>`}</aside>
    <section class="ref-panel ref-store-catalog"><header class="ref-panel-heading">${calamitic ? "Calamitic Conduits" : 'Available Conduits'} &middot; ${catalog.length}</header><div class="ref-scroll"><div class="info-catalog-grid">${catalog.map(conduit => `<button class="info-catalog-choice" data-store-conduit="${conduit.id}" aria-pressed="${conduit.id === choice?.id}">${catalogInformation({ name: conduit.name, art: conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id]), metadata: `${conduit.rarity}${calamitic ? ' · Universal' : ''}`, effects: [readableEffect(conduitEffect(conduit, account?.conduitUpgrades?.[conduit.id]))], owned: account?.conduits?.[conduit.id] ?? 0, cost: `${currencyIcon(calamitic ? 'calamitic-tokens' : 'fractalis')}<strong>${calamitic ? calamiticTokenPrice : conduit.price} ${currency}</strong>` })}</button>`).join('')}</div></div></section>
    <aside class="ref-panel ref-store-detail">${shopHost(calamitic ? 'sarev' : 'torven')}${choice ? `<header class="ref-panel-heading">Details</header><div class="ref-store-hero">${conduitIcon(choice.id, account?.conduitUpgrades?.[choice.id])}</div>${conduitDetails(choice.id, account?.conduitUpgrades?.[choice.id])}
      ${offerInformation({ name: choice.name, art: conduitIcon(choice.id, account?.conduitUpgrades?.[choice.id]), summary: '<p>Unlock one copy for your collection; no automatic equip.</p>', owned: account?.conduits?.[choice.id] ?? 0, price: `${currencyIcon(calamitic ? 'calamitic-tokens' : 'fractalis')}<strong>${cost} ${currency}</strong>`,
        action: `<button class="primary-button" data-buy-conduit="${choice.id}" ${!account || cost === null || cost === undefined || balance < cost || (calamitic && owned) ? 'disabled' : ''}>${calamitic && owned ? 'Owned' : 'Buy one'}</button>`,
        reason: !account ? 'Account unavailable.' : calamitic && owned ? 'Already owned.' : cost != null && balance < cost ? `Not enough ${currency}.` : undefined })}` : '<p>No Conduits match this filter.</p>'}
    ${information('store-information', 'Conduit purchases', `<p>Unlock once, equip across your squad. ${calamitic ? 'Calamitic Conduits fit any element and share a five-per-character limit.' : 'Extra copies give no benefit.'}</p>`)}
    ${!account ? '<p role="alert">Store unavailable. Resolve the save error before purchasing.</p>' : ''}
    <p id="conduit-purchase-result" role="status"></p></aside></section>`;
}

export function updateConduitStore(host: HTMLElement, account: Account | null, selected?: string, rarity = ''): void {
  const current = host.querySelector<HTMLElement>('.ref-conduit-store');
  if (!current) throw new Error('Conduit Store is missing.');
  const template = document.createElement('template');
  template.innerHTML = conduitStore(account, selected, rarity);
  const next = template.content;
  const nextStore = next.querySelector<HTMLElement>('.ref-conduit-store');
  if (!nextStore) throw new Error('Conduit Store replacement is missing.');
  if (current.dataset.storeMode !== nextStore.dataset.storeMode) {
    current.replaceWith(nextStore);
    return;
  }
  if (current.dataset.storeMode === 'locked') return;
  const sidebar = current.querySelector(':scope > aside.ref-panel');
  const nextSidebar = nextStore.querySelector(':scope > aside.ref-panel');
  if (current.dataset.storeMode === 'calamitic' && sidebar && nextSidebar) sidebar.replaceWith(nextSidebar);
  const catalog = current.querySelector<HTMLElement>('.ref-store-catalog');
  const nextCatalog = next.querySelector<HTMLElement>('.ref-store-catalog');
  const detail = current.querySelector<HTMLElement>('.ref-store-detail');
  const nextDetail = next.querySelector<HTMLElement>('.ref-store-detail');
  if (!catalog || !nextCatalog || !detail || !nextDetail) throw new Error('Conduit Store panels are missing.');
  const cards = Array.from(catalog.querySelectorAll<HTMLButtonElement>('[data-store-conduit]'));
  const nextCards = Array.from(nextCatalog.querySelectorAll<HTMLButtonElement>('[data-store-conduit]'));
  if (cards.length !== nextCards.length || cards.some((card, index) => card.dataset.storeConduit !== nextCards[index]?.dataset.storeConduit)) {
    catalog.replaceChildren(...Array.from(nextCatalog.childNodes));
  } else {
    cards.forEach((card, index) => {
      const updated = nextCards[index];
      card.setAttribute('aria-pressed', updated.getAttribute('aria-pressed') ?? 'false');
      const count = card.querySelector('.info-number');
      const nextCount = updated.querySelector('.info-number');
      if (!count || !nextCount) throw new Error('Conduit holdings label is missing.');
      count.textContent = nextCount.textContent;
    });
  }
  current.querySelectorAll<HTMLButtonElement>('[data-store-rarity]').forEach(button =>
    button.setAttribute('aria-pressed', String(button.dataset.storeRarity === rarity)));
  const scroll = detail.scrollTop;
  detail.replaceChildren(...Array.from(nextDetail.childNodes));
  detail.scrollTop = scroll;
}
