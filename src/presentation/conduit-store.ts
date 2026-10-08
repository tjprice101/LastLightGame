import { conduits, getConduit, conduitEffect, validateConduitUpgradeLevel, type ConduitId } from '../content/conduits';
import { type Account } from '../game/account';
import { currencyIcon } from './currency-icon';
import { assetUrl } from './portrait';
import './conduit-store.css';
import { information } from './information';
import { conduitUpgradeMeter } from './conduit-upgrade-meter';

export function conduitIcon(id: ConduitId, level = 0): string {
  const conduit = getConduit(id);
  validateConduitUpgradeLevel(level);
  return `<span class="conduit-icon-frame" role="img" aria-label="${conduit.name} ~ Upgrade +${level} of 5" data-conduit-upgrade="${level}">${conduit.art ? `<img class="conduit-icon" src="${assetUrl(`conduits/${conduit.art}.png`)}" alt="" aria-hidden="true" width="256" height="256" loading="lazy">`
    : '<span class="conduit-icon conduit-art-pending">Artwork pending</span>'}${conduitUpgradeMeter(level)}</span>`;
}
export function conduitRarity(id: ConduitId): string {
  const rarity = getConduit(id).rarity;
  return `<span class="rarity-badge conduit-rarity conduit-${rarity.toLowerCase()}">${rarity}</span>`;
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
export function conduitStore(account: Account | null): string {
  return `<section class="conduit-store"><header class="conduit-store-banner" style="--conduit-store-art:url('${assetUrl('banners/conduit-store.png')}')"><p class="eyebrow">RECOVERED ~ ANCIENT WAR MECHANISMS</p><h2>The Conduit Store</h2>
    <p>Long-hidden mechanisms, recovered from sealed armories and forgotten battlefields.</p>
    </header>
    ${information('store-information', 'Conduit purchases', '<p>Purchase with Prismatica. One owned copy unlocks a Conduit for all owned characters. Each character can equip each name once. Additional copies do not increase its effect.</p><p>Equip Conduits in Character. Purchases require confirmation.</p>')}
    <button class="text-button" data-page="conduit-upgrade">Conduit Upgrade &rarr;</button>
    ${!account ? '<p role="alert">Store unavailable. Resolve the save error before purchasing.</p>' : ''}
    <div class="conduit-catalog">${conduits.filter((entry) => entry.price !== null).map((conduit) => `<article class="conduit-card">
      <div class="conduit-mechanism">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}</div>
      <div class="conduit-card-heading">${conduitRarity(conduit.id)}</div>
      <h3>${conduit.name}</h3><p class="conduit-effect">${conduitEffect(conduit, account?.conduitUpgrades?.[conduit.id])}</p>
      <p class="conduit-quantity">Owned ${account ? account.conduits?.[conduit.id] ?? 0 : 'Unavailable'}</p>
      <p class="conduit-price">${currencyIcon('fractalis')}<strong>${conduit.price} Prismatica</strong></p>
      <button class="primary-button" data-buy-conduit="${conduit.id}" ${!account || account.fractalis < conduit.price ? 'disabled' : ''}>Buy one ~ ${conduit.price}</button>
      ${account && account.fractalis < conduit.price ? '<p class="quiet">Not enough Prismatica.</p>' : ''}</article>`).join('')}</div>
    <p id="conduit-purchase-result" role="status"></p></section>`;
}
