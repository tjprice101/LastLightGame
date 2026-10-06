import { currencies } from '../content/progression';
import { uiIcon } from './ui-icon';
import { currencyIcon } from './currency-icon';

export const sanctuaryPages = ['home', 'character', 'gameplay', 'events', 'inventory', 'squad', 'summon', 'story', 'battle', 'glossary', 'archives', 'conduit-store'] as const;
export type MenuPage = (typeof sanctuaryPages)[number];

export function isMenuPage(value: unknown): value is MenuPage {
  return sanctuaryPages.some((page) => page === value);
}

const navigation = [
  ['home', 'Home'], ['character', 'Character'], ['gameplay', 'Gameplay'],
  ['events', 'Events'], ['inventory', 'Inventory'], ['squad', 'Squad'], ['summon', 'Summon'],
] as const;

const headings: Record<MenuPage, readonly [string, string]> = {
  home: ['THE SANCTUARY', 'Home'], character: ['YOUR ELEMENT-BEARER / PROGRESSION', 'Character Upgrades'],
  gameplay: ['CHOOSE YOUR ACTIVITY', 'Gameplay'], events: ['FUTURE ADVENTURES', 'Events'],
  inventory: ['YOUR HOLDINGS', 'Inventory'], squad: ['YOUR ELEMENT-BEARERS', 'Squad'],
  summon: ['A NEW LIGHT ANSWERS', 'Summon'], story: ['A FIRST LIGHT', 'Opening Story'],
  battle: ['YOUR SQUAD / GRASSY FIELD', 'Adventure'],
  glossary: ['COLLECTIONS / DISCOVERIES', 'Archives'],
  archives: ['COLLECTIONS / DISCOVERIES', 'Archives'],
  'conduit-store': ['ANCIENT WAR / RECOVERED MECHANISMS', 'Conduit Store'],
};

export function sanctuaryHeader(page: MenuPage, fractalis: number | null, lycalis: number | null = null): string {
  const [eyebrow, title] = headings[page];
  return `<header class="sanctuary-header">
    <div class="sanctuary-brand"><span class="brand-mark"><span>L / L</span></span>
      <div><strong>LAST LIGHT</strong><small>PRELUDE &middot; 0.1</small></div></div>
    <div class="sanctuary-title"><p class="eyebrow">${eyebrow}</p><h1 tabindex="-1">${title}</h1></div>
    <div class="sanctuary-wallet"><div class="currency-strip" aria-label="Currencies">${currencies.map((currency) =>
      `<span>${currencyIcon(currency.id)}<strong>${currency.name} <span id="${currency.id}-balance">${(currency.id === 'fractalis' ? fractalis : lycalis) ?? 'Unavailable'}</span></strong><small>${currency.role} &middot; Saved locally</small></span>`).join('')}</div>
      <button id="open-settings" class="settings-trigger" aria-haspopup="dialog">${uiIcon('settings')}<span>Settings</span></button></div>
  </header>`;
}

export function sanctuaryNavigation(page: MenuPage): string {
  return `<nav class="sanctuary-nav" aria-label="Main screens">${navigation.map(([id, label]) =>
    `<button data-page="${id}" ${page === id || (page === 'story' && id === 'gameplay') || (['conduit-store', 'archives', 'glossary'].includes(page) && id === 'inventory') ? 'aria-current="page"' : ''}>
      <span class="nav-symbol" aria-hidden="true">${uiIcon(id)}</span><span>${label}</span>
      </button>`).join('')}</nav>`;
}
