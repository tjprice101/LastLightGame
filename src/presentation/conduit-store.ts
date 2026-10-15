import { conduits, getConduit, conduitEffect, validateConduitUpgradeLevel, type ConduitId, type ConduitSlots } from '../content/conduits';
import { type Account } from '../game/account';
import { currencyIcon } from './currency-icon';
import { assetUrl } from './portrait';
import './conduit-store.css';
import { information } from './information';
import { conduitUpgradeMeter } from './conduit-upgrade-meter';
import { isBannerConduitEligible } from '../content/machines';

export function conduitDetails(id: ConduitId, level = 0, revealArt = true): string {
  const conduit = getConduit(id);
  return `<div class="conduit-details-art${revealArt ? '' : ' unreached-character-art'}">${conduitIcon(id, level)}</div>${conduitRarity(id)}
    <dl><dt>Current effect (+${level})</dt><dd>${conduitEffect(conduit, level)}</dd>
    <dt>At +5</dt><dd>${conduitEffect(conduit, 5)}</dd></dl>
    <p>${conduit.lore}</p><p>${conduit.power}</p>
    <p>${conduit.price !== null ? `${conduit.price.toLocaleString('en-US')} Prismatica in the Conduit Store` : 'Awaken the Machines drop'}${isBannerConduitEligible(id) ? ' · Eligible for the 0.5% Legendary bonus tier on successful banner draws' : ''}</p>`;
}

export function conduitIcon(id: ConduitId, level = 0): string {
  const conduit = getConduit(id);
  validateConduitUpgradeLevel(level);
  return `<span class="conduit-icon-frame" role="img" aria-label="${conduit.name} · Upgrade +${level} of 5" data-conduit-upgrade="${level}">${conduit.art ? `<img draggable="false" class="conduit-icon" src="${assetUrl(`conduits/${conduit.art}.png`)}" alt="" aria-hidden="true" width="256" height="256" loading="lazy">`
    : '<span class="conduit-icon conduit-art-pending">Artwork pending</span>'}${conduitUpgradeMeter(level)}</span>`;
}
export function conduitRarity(id: ConduitId): string {
  const rarity = getConduit(id).rarity;
  return `<span class="rarity-badge conduit-rarity conduit-${rarity.toLowerCase()}">${rarity}</span>`;
}
export function kitConduitRules(equipment?: ConduitSlots): string {
  const rules = (equipment ?? []).flatMap((id) => {
    if (id === null) return [];
    const conduit = getConduit(id);
    return 'kitEffects' in conduit
      ? [`<li><strong>${conduit.name}:</strong> ${conduit.effect.slice(conduit.effect.indexOf('. ') + 2)}</li>`] : [];
  });
  return rules.length ? `<section class="equipped-kit-rules"><h3>Equipped kit rules</h3>
    <p>Ability descriptions show the character’s base abilities. These equipped rules apply during combat; account upgrades scale stats, not these rules.</p>
    <ul>${rules.join('')}</ul></section>` : '';
}
export function conduitInventory(account: Account | null): string {
  return `<section class="inventory-section"><div class="conduit-section-heading"><h2>Conduits</h2></div>
    ${!account ? '<p role="alert">Conduit inventory unavailable. Check the save error.</p>' :
      conduits.some((conduit) => (account.conduits?.[conduit.id] ?? 0) > 0)
        ? `<ul class="conduit-owned-list">${conduits.filter((conduit) => (account.conduits?.[conduit.id] ?? 0) > 0).map((conduit) =>
          `<li>${conduitIcon(conduit.id, account.conduitUpgrades?.[conduit.id])}<div><strong>${conduit.name}</strong>${conduitRarity(conduit.id)}<small>${conduitEffect(conduit, account.conduitUpgrades?.[conduit.id])}</small></div><span>Owned ${account.conduits?.[conduit.id]}</span></li>`).join('')}</ul>`
        : '<p>No Conduits owned yet.</p>'}
    </section>`;
}
export function conduitStore(account: Account | null, selected?: string, rarity = ''): string {
  const catalog = conduits.filter(entry => entry.price !== null && (!rarity || entry.rarity === rarity));
  const choice = catalog.find(entry => entry.id === selected) ?? catalog[0];
  return `<section class="conduit-store ref-screen ref-conduit-store"><nav class="ref-market-tabs"><button data-page="stores">Material Exchange</button><button data-page="stores" data-market-cosmetics>Cosmetic Store</button><button aria-current="page">Conduit Store</button><button data-page="conduit-upgrade">Upgrade →</button></nav>
    <aside class="ref-panel"><h3>Rarity</h3><nav class="ref-rarity-filter">${['', ...new Set(conduits.filter(entry => entry.price !== null).map(entry => entry.rarity))].map(value => `<button data-store-rarity="${value}" aria-pressed="${value === rarity}">${value || 'All'}<small>${conduits.filter(entry => entry.price !== null && (!value || entry.rarity === value)).length}</small></button>`).join('')}</nav></aside>
    <section class="ref-panel ref-store-catalog"><header class="ref-panel-heading">Recovered ancient mechanisms · ${catalog.length}</header><div class="ref-scroll"><div class="ref-product-grid">${catalog.map(conduit => `<button class="ref-product" data-store-conduit="${conduit.id}" aria-pressed="${conduit.id === choice?.id}">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}<b>${conduit.name}</b><small>${conduit.rarity}</small><small>${conduitEffect(conduit, account?.conduitUpgrades?.[conduit.id])}</small><span class="ref-chip">${account?.conduits?.[conduit.id] ? `Owned ${account.conduits[conduit.id]}` : `${conduit.price} Prismatica`}</span></button>`).join('')}</div></div></section>
    <aside class="ref-panel ref-store-detail">${choice ? `<header class="ref-panel-heading">Details</header><div class="ref-store-hero">${conduitIcon(choice.id, account?.conduitUpgrades?.[choice.id])}</div><h2>${choice.name}</h2>${conduitRarity(choice.id)}<p>${choice.lore}</p><dl class="ref-detail-facts"><div><dt>Current effect</dt><dd>${conduitEffect(choice, account?.conduitUpgrades?.[choice.id])}</dd></div><div><dt>At +5</dt><dd>${conduitEffect(choice, 5)}</dd></div><div><dt>Owned</dt><dd>${account?.conduits?.[choice.id] ?? 0}</dd></div></dl>
      <footer><p class="conduit-price">${currencyIcon('fractalis')}<strong>${choice.price} Prismatica</strong></p><button class="primary-button" data-buy-conduit="${choice.id}" ${!account || choice.price === null || account.fractalis < choice.price ? 'disabled' : ''}>Buy one · ${choice.price}</button>${account && choice.price !== null && account.fractalis < choice.price ? '<p class="quiet">Not enough Prismatica.</p>' : ''}</footer>` : '<p>No Conduits match this filter.</p>'}
    ${information('store-information', 'Conduit purchases', '<p>Purchase with Prismatica. One owned copy unlocks a Conduit for all owned characters. Each character can equip each name once. Additional copies do not increase its effect.</p><p>Equip Conduits in Character. Purchases require confirmation.</p>')}
    ${!account ? '<p role="alert">Store unavailable. Resolve the save error before purchasing.</p>' : ''}
    <p id="conduit-purchase-result" role="status"></p></aside></section>`;
}

export function updateConduitStore(host: HTMLElement, account: Account | null, selected?: string, rarity = ''): void {
  const current = host.querySelector<HTMLElement>('.ref-conduit-store');
  if (!current) throw new Error('Conduit Store is missing.');
  const template = document.createElement('template');
  template.innerHTML = conduitStore(account, selected, rarity);
  const next = template.content;
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
      const chip = card.querySelector('.ref-chip');
      const nextChip = updated.querySelector('.ref-chip');
      if (chip && nextChip) chip.textContent = nextChip.textContent;
    });
  }
  current.querySelectorAll<HTMLButtonElement>('[data-store-rarity]').forEach(button =>
    button.setAttribute('aria-pressed', String(button.dataset.storeRarity === rarity)));
  const scroll = detail.scrollTop;
  detail.replaceChildren(...Array.from(nextDetail.childNodes));
  detail.scrollTop = scroll;
}
