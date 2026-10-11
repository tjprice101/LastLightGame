import { materialArt, materialName } from '../content/dungeon-art';
import type { CreatureSaleOption, CreatureSalePayout } from '../content/infusions';
import { currencyArt } from './currency-icon';
import { itemShowcase } from './item-showcase';
import { assetUrl } from './portrait';
import './creature-sale.css';

type SaleOffer = CreatureSalePayout & { options: CreatureSaleOption[]; reasons: string[] };

export function saleItems(payout: CreatureSalePayout) {
  return [
    ...(payout.fractalis ? [{ id: 'fractalis', amount: payout.fractalis }] : []),
    ...(payout.lycalis ? [{ id: 'lycalis', amount: payout.lycalis }] : []),
    ...Object.entries(payout.materials).map(([id, amount]) => ({ id, amount })),
  ];
}
export function saleItemName(id: string): string {
  return id === 'fractalis' ? 'Prismatica' : id === 'lycalis' ? 'Null-Prismatica' : materialName(id);
}
export function saleLabel(payout: CreatureSalePayout): string {
  return saleItems(payout).map(({ id, amount }) => `${amount.toLocaleString('en-US')} ${saleItemName(id)}`).join(' + ');
}
function choiceArt(id: string): string {
  const currency = id === 'fractalis' || id === 'lycalis';
  const art = currency ? currencyArt(id) : materialArt(id);
  const src = currency ? art : art ? assetUrl(`materials/${art}.png`) : undefined;
  return src ? `<img src="${src}" alt="" width="64" height="64" loading="lazy">` : '<span class="item-showcase-pending">Artwork pending</span>';
}

/** Sale value plus Sell control(s). Multi-option offers render one button per payout; the player picks exactly one. */
export function saleControls(sale: SaleOffer, id: string, buttonLabel = 'Sell copy'): string {
  const disabled = sale.reasons.length ? 'disabled' : '';
  const protectedNote = sale.reasons.length ? `<p class="ref-growth-summary">Sale protected: ${sale.reasons.join(', ')}</p>` : '';
  if (sale.options.length < 2) {
    return `${itemShowcase(saleItems(sale), 'Sale value')}<button class="text-button" data-sell-creature="${id}" ${disabled}>${buttonLabel}</button>${protectedNote}`;
  }
  return `<div class="creature-sale-choices" role="group" aria-label="Choose one sale payout"><h4>Choose one payout</h4><div class="creature-sale-choice-grid">${sale.options.map((option) => {
    const [item] = saleItems(option);
    return `<button type="button" class="creature-sale-choice" data-sell-creature="${id}" data-sale-option="${option.id}" ${disabled} aria-label="Sell for ${saleLabel(option)}"><span class="creature-sale-choice-art">${choiceArt(item.id)}</span><span class="creature-sale-choice-name">${saleItemName(item.id)}</span><strong>+${item.amount.toLocaleString('en-US')}</strong></button>`;
  }).join('')}</div></div>${protectedNote}`;
}
