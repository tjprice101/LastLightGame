import { assetUrl } from './portrait';
import './currency-icon.css';
import { currencyArtRevisions } from '../content/currency-art-revisions';

export type CurrencyId = 'fractalis' | 'lycalis' | 'mechanical-components';

export function currencyArt(id: CurrencyId): string {
  const url = assetUrl(`currencies/${id}.png`);
  const revision = currencyArtRevisions[id];
  return revision ? `${url}?v=${revision}` : url;
}

export function currencyIcon(id: CurrencyId): string {
  return `<img class="currency-icon" src="${currencyArt(id)}" alt="" aria-hidden="true" width="48" height="48">`;
}
