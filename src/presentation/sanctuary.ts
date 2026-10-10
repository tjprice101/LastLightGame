import { currencies } from '../content/progression';
import { uiIcon } from './ui-icon';
import { currencyIcon } from './currency-icon';
import './sanctuary-menu.css';

export const sanctuaryPages = ['home', 'team', 'character', 'gameplay', 'events', 'inventory', 'stores', 'collections', 'squad', 'summon', 'story', 'battle', 'glossary', 'archives', 'conduit-store', 'conduit-upgrade'] as const;
export type MenuPage = (typeof sanctuaryPages)[number];
export type TeamArea = 'squad' | 'bearers' | 'creatures';

export function sanctuaryDestination(page: MenuPage): MenuPage {
  return page === 'character' || page === 'squad' ? 'team' : page;
}

export function sanctuaryDock(page: MenuPage): string {
  if (page === 'battle') return '';
  const active = sanctuaryDestination(page);
  return `<nav class="sanctuary-dock" aria-label="Main destinations">${([
    ['home', 'Home', 'home'], ['team', 'Team', 'squad'],
    ['summon', 'Summon', 'summon'], ['gameplay', 'Play', 'gameplay'],
  ] as const).map(([destination, label, icon]) => `<button type="button" data-page="${destination}" ${active === destination ? 'aria-current="page"' : ''}>${uiIcon(icon)}<span>${label}</span></button>`).join('')}</nav>`;
}

export function isMenuPage(value: unknown): value is MenuPage {
  return sanctuaryPages.some((page) => page === value);
}

const headings: Record<MenuPage, readonly [string, string]> = {
  home: ['SANCTUARY', 'Home'], character: ['OWNED CHARACTERS', 'Character'],
  team: ['FORMATION AND GROWTH', 'Team'],
  gameplay: ['ACTIVITIES', 'Gameplay'], events: ['EVENTS', 'Events'],
  inventory: ['OWNED ITEMS', 'Inventory'], stores: ['STORES', 'Stores'], collections: ['CATALOGS', 'Collections'], squad: ['FORMATION', 'Squad'],
  summon: ['SUMMONING', 'Summon'], story: ['SIX BEACONS', 'Story'],
  battle: ['YOUR SQUAD · GRASSY FIELD', 'Training'],
  glossary: ['COLLECTIONS · DISCOVERIES', 'Archives'],
  archives: ['COLLECTIONS · DISCOVERIES', 'Archives'],
  'conduit-store': ['STORES', 'Conduit Store'],
  'conduit-upgrade': ['RESTORATION', 'Conduit Upgrade'],
};

export function sanctuaryHeader(page: MenuPage, fractalis: number | null, lycalis: number | null = null, canGoBack = page !== 'home', backPage?: MenuPage): string {
  const [eyebrow, title] = headings[sanctuaryDestination(page)];
  const backTitle = backPage ? headings[sanctuaryDestination(backPage)][1] : undefined;
  return `<header class="sanctuary-header">
    <div class="sanctuary-brand"><span class="brand-mark"><span>L · L</span></span>
      <div><strong>Last Light</strong></div>
      ${canGoBack ? `<button type="button" class="text-button sanctuary-back" data-menu-back${backTitle ? ` aria-label="Back to ${backTitle}"` : ''}>${uiIcon('back')}<span>Back${backTitle ? `<small>${backTitle}</small>` : ''}</span></button>` : ''}</div>
    <div class="sanctuary-title"><p class="eyebrow">${eyebrow}</p><h1 tabindex="-1">${title}</h1></div>
    <div class="sanctuary-wallet"><div class="currency-strip" aria-label="Currencies">${currencies.map((currency) =>
      `<button type="button" data-page="inventory" aria-label="View ${currency.name} in Inventory">${currencyIcon(currency.id)}<strong><span id="${currency.id}-balance">${(currency.id === 'fractalis' ? fractalis : lycalis) ?? 'Unavailable'}</span><small>${currency.name}</small></strong></button>`).join('')}</div>
      <button type="button" class="text-button sanctuary-help-trigger" data-information="sanctuary-help" aria-label="Help for ${title}" aria-haspopup="dialog" aria-controls="sanctuary-help">?</button>
      <button type="button" class="text-button sanctuary-menu-trigger" data-information="sanctuary-menu" aria-label="Menu" aria-haspopup="dialog" aria-controls="sanctuary-menu">${uiIcon('menu')}</button>
      <dialog class="information-modal sanctuary-help-drawer" id="sanctuary-help" aria-labelledby="sanctuary-help-heading"><header class="drawer-heading"><h2 id="sanctuary-help-heading">${title}</h2><button type="button" class="drawer-close" data-close-information aria-label="Close Help">&times;</button></header><div class="information-content">${sanctuaryHelp(page)}</div></dialog>
      <dialog class="information-modal sanctuary-menu-drawer" id="sanctuary-menu" aria-labelledby="sanctuary-menu-heading">
      <header class="drawer-heading"><h2 id="sanctuary-menu-heading">Menu</h2><button type="button" class="drawer-close" data-close-information aria-label="Close Menu">&times;</button></header>
      <div class="information-content"><nav class="sanctuary-menu-tiles" aria-label="Holdings and collections">
        <button type="button" data-page="inventory" ${page === 'inventory' ? 'aria-current="page"' : ''}>${uiIcon('inventory')}<strong>Inventory</strong><small>Currencies &amp; materials</small></button>
        <button type="button" data-page="collections" ${['collections', 'archives', 'glossary'].includes(page) ? 'aria-current="page"' : ''}>${uiIcon('story')}<strong>Collections</strong><small>Characters, Conduits, creatures</small></button>
      </nav><nav class="sanctuary-menu-utilities" aria-label="Sanctuary utilities">
        <h3>Conduits</h3>
        <button type="button" data-page="conduit-store" ${page === 'conduit-store' ? 'aria-current="page"' : ''}>${uiIcon('inventory')}<span>Conduit Store<small>Recovered ancient mechanisms</small></span></button>
        <button type="button" data-page="conduit-upgrade" ${page === 'conduit-upgrade' ? 'aria-current="page"' : ''}>${uiIcon('evolution')}<span>Conduit Upgrade<small>Broken Mechanical Components</small></span></button>
        <h3>Game</h3>        <button type="button" data-page="story" ${page === 'story' ? 'aria-current="page"' : ''}>${uiIcon('story')}<span>Story world map</span></button>
        <button id="open-settings" type="button" aria-haspopup="dialog">${uiIcon('settings')}<span>Settings</span></button>
      </nav><nav class="sanctuary-menu-links" aria-label="Sanctuary destinations">
        ${([
          ['events', 'Events', 'events'],
          ['stores', 'Stores', 'inventory'],
        ] as const).map(([destination, name, icon]) => `<button type="button" data-page="${destination}" ${destination === page ? 'aria-current="page"' : ''}>${uiIcon(icon)}<span>${name}</span></button>`).join('')}
      </nav></div>
      </dialog></div>
  </header>`;
}

export function sanctuaryContext(page: MenuPage, area: TeamArea = 'squad'): string {
  if (sanctuaryDestination(page) === 'team') {
    return `<nav class="section-navigation sanctuary-team-tabs" aria-label="Team areas">${([
      ['squad', 'Squad'], ['bearers', 'Element-Bearers'], ['creatures', 'Captured Creatures'],
    ] as const).map(([value, label]) => `<button type="button" data-character-category="${value}" aria-pressed="${area === value}"><strong>${label}</strong></button>`).join('')}</nav>`;
  }
  return '';
}

function sanctuaryHelp(page: MenuPage): string {
  const destination = sanctuaryDestination(page);
  if (destination === 'team') return '<p>Manage your saved squad, Element-Bearers and captured creatures.</p><h3>Squad</h3><p>Choose an owned member, assign a slot and save. The first slot is the leader; teams contain one to three distinct owned IDs.</p><h3>Element-Bearers</h3><p>Review stats and skills, level up, evolve and equip Conduits. Growth actions show exact costs and require confirmation.</p><h3>Captured Creatures</h3><p>Each copy has its own level, skills, lock and equipment. Locked, squad-assigned and equipped copies are protected from sales and consumption.</p>';
  if (destination === 'summon') return '<p>Choose a real banner, review its rates and pity, then confirm a single draw. Showcase displays its available high-star Element-Bearers.</p><p>Only successfully saved draws spend currency or advance pity. Each banner keeps its own counters.</p>';
  if (destination === 'gameplay' || destination === 'events') return '<p>Select an activity category and location, choose an unlocked stage and enter with your saved squad. All implemented activities remain playable.</p><p>Rewards save per defeated enemy. Continue is manual; Settings retains the run and quitting ends it. The Information panel contains exact activity rules.</p>';
  if (destination === 'home') return '<p>Your saved leader is the centerpiece. Select a banner to summon, tap a squad slot to edit your team, or open the Story world map. Play also offers endless Training from wave 1.</p><p>The bottom dock opens Home, Team, Summon and Play. The Menu holds Inventory, Collections, Conduits, Events, Settings and Story.</p>';
  return '<p>Use the visible categories and controls to inspect your actual holdings or discoveries. Exact costs, eligibility and save errors remain visible.</p><p>Menu contains the other destinations. Back returns to the screen and selections you came from; opening panels does not spend or grant resources.</p>';
}
