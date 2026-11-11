import { escapeDialogText as escape } from './game-dialog';

export interface InformationSection { title: string; content: string; kind?: string }
export interface CatalogInformation {
  name: string;
  art: string;
  metadata?: string;
  effects?: readonly string[];
  details?: string;
  owned?: number;
  state?: string;
  lore?: string;
  acquisition?: string;
  cost?: string;
}
export interface OfferInformation {
  name: string;
  art: string;
  summary: string;
  owned: number;
  price: string;
  action: string;
  reason?: string;
}

export function informationSheet(sections: readonly InformationSection[]): string {
  return `<div class="info-sheet">${sections.map(section => {
    const heading = section.kind === 'profile' ? 'h2' : 'h3';
    return `<section class="info-section"${section.kind ? ` data-info-section="${escape(section.kind)}"` : ''}><${heading}>${escape(section.title)}</${heading}>${section.content}</section>`;
  }).join('')}</div>`;
}

export function catalogInformation(item: CatalogInformation): string {
  return `<div class="info-catalog">
    <header class="info-item-header">${item.art ? `<div class="info-item-art">${item.art}</div>` : ''}<div><h3>${escape(item.name)}</h3>${item.metadata ? `<div class="info-label">${item.metadata}</div>` : ''}</div></header>
    ${item.effects?.length ? `<ul class="info-effects">${item.effects.map(effect => `<li>${effect}</li>`).join('')}</ul>` : ''}
    ${item.details ? `<div class="info-details">${item.details}</div>` : ''}
    ${item.owned === undefined ? '' : `<p class="info-number inventory-quantity">Owned ${item.owned}</p>`}
    ${item.state ? `<p class="info-label">${escape(item.state)}</p>` : ''}
    ${item.lore ? `<details class="info-lore conduit-lore-disclosure"><summary>Lore</summary><p class="conduit-lore">${escape(item.lore)}</p></details>` : ''}
    ${item.acquisition || item.cost ? `<div class="info-acquisition">${item.acquisition ? `<p>${escape(item.acquisition)}</p>` : ''}${item.cost ? `<div class="info-price">${item.cost}</div>` : ''}</div>` : ''}
  </div>`;
}

export function offerInformation(offer: OfferInformation): string {
  return `<div class="info-offer">
    <div class="info-item-art">${offer.art}</div>
    <div class="info-offer-description"><h3>${escape(offer.name)}</h3><div class="info-effects">${offer.summary}</div></div>
    <div class="info-offer-owned"><span class="info-label">Owned</span><strong class="info-number">${offer.owned.toLocaleString('en-US')}</strong></div>
    <div class="info-price">${offer.price}</div>
    <div class="info-offer-action">${offer.action}${offer.reason ? `<p class="info-label" role="note">${escape(offer.reason)}</p>` : ''}</div>
  </div>`;
}
