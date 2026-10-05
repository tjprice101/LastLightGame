import { assetUrl } from './portrait';
import './currency-icon.css';

export type CurrencyId = 'fractalis' | 'lycalis';

export function currencyArt(id: CurrencyId): string {
  return assetUrl(`currencies/${id}.png`);
}

export function currencyIcon(id: CurrencyId): string {
  return `<img class="currency-icon" src="${currencyArt(id)}" alt="" aria-hidden="true" width="48" height="48">`;
}
