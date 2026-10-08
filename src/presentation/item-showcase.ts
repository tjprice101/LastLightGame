import { materialArt, materialName } from '../content/dungeon-art';
import { currencyArt } from './currency-icon';
import { assetUrl } from './portrait';
import './item-showcase.css';
import { mechanicalComponents } from '../content/mechanical-components';
import { mechanicalComponentIcon } from './mechanical-component-icon';

export function itemShowcase(items: readonly { id: string; amount?: number }[], label: string): string {
  return `<section class="item-showcase" aria-label="${label}"><h4>${label}</h4><ul>${items.map(({ id, amount }) => {
    if (id === mechanicalComponents.id) return `<li data-showcase-item="${id}"><span class="item-showcase-art">${mechanicalComponentIcon()}</span><span class="item-showcase-name">${mechanicalComponents.name}</span>${amount !== undefined ? `<strong>${amount.toLocaleString('en-US')}</strong>` : ''}</li>`;
    const currency = id === 'fractalis' || id === 'lycalis';
    const name = currency ? id === 'fractalis' ? 'Prismatica' : 'Null-Prismatica' : materialName(id);
    const art = currency ? currencyArt(id) : materialArt(id);
    const src = currency ? art : art ? assetUrl(`materials/${art}.png`) : undefined;
    return `<li data-showcase-item="${id}"><span class="item-showcase-art">${src
      ? `<img src="${src}" alt="" width="80" height="80" loading="lazy">`
      : '<span class="item-showcase-pending">Artwork pending</span>'}</span><span class="item-showcase-name">${name}</span>${amount !== undefined ? `<strong>${amount.toLocaleString('en-US')}</strong>` : ''}</li>`;
  }).join('')}</ul></section>`;
}
