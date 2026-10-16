import { assetUrl } from './portrait';
import './currency-icon.css';
import { currencyArtRevisions } from '../content/currency-art-revisions';

export type CurrencyId = 'fractalis' | 'lycalis' | 'mechanical-components' | 'calamitic-tokens';

export function currencyArt(id: CurrencyId): string {
  if (id === 'calamitic-tokens') throw new Error('Calamitic Token artwork has not been delivered.');
  const url = assetUrl(`currencies/${id}.png`);
  const revision = currencyArtRevisions[id];
  return revision ? `${url}?v=${revision}` : url;
}

export function currencyIcon(id: CurrencyId): string {
  if (id === 'calamitic-tokens') return '<span class="currency-icon currency-art-pending" aria-hidden="true">—</span>';
  return `<img class="currency-icon" src="${currencyArt(id)}" alt="" aria-hidden="true" width="48" height="48">`;
}
