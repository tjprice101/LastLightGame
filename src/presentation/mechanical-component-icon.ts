import { mechanicalComponents } from '../content/mechanical-components';
import { currencyArt } from './currency-icon';
import './conduit-upgrade.css';

export function mechanicalComponentIcon(): string {
  return `<img class="mechanical-component-icon" src="${currencyArt('mechanical-components')}" alt="${mechanicalComponents.name}" width="80" height="80">`;
}
