import { conduits, type ConduitId } from '../content/conduits';
import { type Account } from '../game/account';
import { currencyIcon } from './currency-icon';
import { assetUrl } from './portrait';
import './conduit-store.css';

export function conduitIcon(id: ConduitId): string {
  return `<img class="conduit-icon" src="${assetUrl(`conduits/${id}.png`)}" alt="" aria-hidden="true" width="256" height="256" loading="lazy">`;
}
export function conduitInventory(account: Account | null): string {
  return `<section class="inventory-section"><div class="conduit-section-heading"><h2>Conduits</h2><button class="text-button" data-page="conduit-store">Conduit Store &rarr;</button></div>
    ${!account ? '<p role="alert">Conduit inventory unavailable. Check the save error.</p>' :
      conduits.some((conduit) => (account.conduits?.[conduit.id] ?? 0) > 0)
        ? `<ul class="conduit-owned-list">${conduits.filter((conduit) => (account.conduits?.[conduit.id] ?? 0) > 0).map((conduit) =>
          `<li>${conduitIcon(conduit.id)}<div><strong>${conduit.name}</strong><small>Common / ${conduit.effect}</small></div><span>Owned ${account.conduits?.[conduit.id]}</span></li>`).join('')}</ul>`
        : '<p>No Conduits owned yet. Recover ancient-war mechanisms from the Conduit Store.</p>'}
    <p class="quiet">Owning one copy unlocks the Conduit for every character. Equip each name once per character in Character / Conduits.</p></section>`;
}
export function conduitStore(account: Account | null): string {
  return `<section class="conduit-store"><header class="conduit-store-banner" style="--conduit-store-art:url('${assetUrl('banners/conduit-store.png')}')"><p class="eyebrow">RECOVERED / ANCIENT WAR MECHANISMS</p><h2>The Conduit Store</h2>
    <p>Long-hidden mechanisms, recovered from sealed armories and forgotten battlefields.</p>
    <p>Some still carry Elemental Light: the source that gave every being their element and elemental powers.</p>
    <button class="text-button" data-page="inventory">View owned Conduits &rarr;</button></header>
    <p class="quiet">Buy one copy at a time with Fractalis. Owning one unlocks it for every character. Equip each name once per character in ordinary Conduit slots; extra copies add no equipment benefit.</p>
    ${!account ? '<p role="alert">Store unavailable. Resolve the save error before purchasing.</p>' : ''}
    <div class="conduit-catalog">${conduits.map((conduit) => `<article class="conduit-card">
      <div class="conduit-mechanism">${conduitIcon(conduit.id)}<span>Recovered mechanism</span></div>
      <div class="conduit-card-heading"><span class="rarity-badge rarity-common">Common</span><small>${conduit.power === 'Elemental Light' ? 'Elemental Light core' : 'Mechanical drive'}</small></div>
      <h3>${conduit.name}</h3><p class="conduit-effect">${conduit.effect}</p><p>${conduit.lore}</p>
      <p class="conduit-quantity">Owned ${account ? account.conduits?.[conduit.id] ?? 0 : 'Unavailable'}</p>
      <p class="conduit-price">${currencyIcon('fractalis')}<strong>${conduit.price} Fractalis</strong></p>
      <button class="primary-button" data-buy-conduit="${conduit.id}" ${!account || account.fractalis < conduit.price ? 'disabled' : ''}>Buy one / ${conduit.price}</button>
      <p class="quiet">${!account ? 'Save unavailable.' : account.fractalis < conduit.price ? 'Not enough Fractalis.' : 'Purchase requires confirmation.'}</p></article>`).join('')}</div>
    <p id="conduit-purchase-result" role="status"></p></section>`;
}
