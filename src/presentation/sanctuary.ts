import { currencies } from '../content/progression';
import { uiIcon } from './ui-icon';
import { currencyIcon } from './currency-icon';

export const sanctuaryPages = ['home', 'team', 'character', 'gameplay', 'events', 'inventory', 'stores', 'collections', 'squad', 'summon', 'story', 'battle', 'glossary', 'archives', 'conduit-store', 'conduit-upgrade', 'profile'] as const;
export type MenuPage = (typeof sanctuaryPages)[number];
export type TeamArea = 'squad' | 'bearers' | 'creatures';

export function sanctuaryDestination(page: MenuPage): MenuPage {
  return page === 'character' || page === 'squad' ? 'team' : page;
}

export function sanctuaryDock(page: MenuPage): string {
  if (page === 'battle') return '';
  const active = page === 'story' || page === 'events' ? 'gameplay' : sanctuaryDestination(page);
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
  profile: ['PLAYER', 'Profile'],
};

export function sanctuaryHeader(page: MenuPage, fractalis: number | null, lycalis: number | null = null): string {
  const [eyebrow, title] = headings[sanctuaryDestination(page)];
  return `<header class="sanctuary-header">
    <div class="sanctuary-brand"><span class="brand-mark"><span>L · L</span></span>
      <div><strong>Last Light</strong></div></div>
    ${sanctuaryDock(page)}<h1 class="ref-sr-only" tabindex="-1">${title}</h1>
    <div class="sanctuary-wallet"><div class="currency-strip" aria-label="Currencies">${currencies.map((currency) =>
      `<button type="button" data-page="inventory" aria-label="View ${currency.name} in Inventory">${currencyIcon(currency.id)}<strong><span id="${currency.id}-balance">${(currency.id === 'fractalis' ? fractalis : lycalis) ?? 'Unavailable'}</span><small>${currency.name}</small></strong></button>`).join('')}</div>
      <button type="button" class="text-button sanctuary-help-trigger" data-information="sanctuary-help" aria-label="Help for ${title}" aria-haspopup="dialog" aria-controls="sanctuary-help">?</button>
      <button type="button" class="text-button" data-page="collections" aria-label="Open Collections">${uiIcon('story')}</button>
      <button id="open-settings" type="button" class="text-button" aria-label="Open Settings" aria-haspopup="dialog" aria-controls="settings-drawer">${uiIcon('settings')}</button>
      <button type="button" class="text-button sanctuary-profile-trigger" data-page="profile" aria-label="Open profile">${uiIcon('squad')}</button>
      <dialog class="information-modal sanctuary-help-drawer" id="sanctuary-help" aria-labelledby="sanctuary-help-heading"><header class="drawer-heading"><h2 id="sanctuary-help-heading">${title}</h2><button type="button" class="drawer-close" data-close-information aria-label="Close Help">&times;</button></header><div class="information-content">${sanctuaryHelp(page)}</div></dialog>
      </div>
  </header>`;
}

export function sanctuaryContext(page: MenuPage, area: TeamArea = 'squad'): string {
  if (sanctuaryDestination(page) === 'team') {
    return `<nav class="section-navigation sanctuary-team-tabs" aria-label="Team areas">${([
      ['squad', 'Squad'], ['bearers', 'Element-Bearers'], ['creatures', 'Captured Elemental-Devourers'],
    ] as const).map(([value, label]) => `<button type="button" data-character-category="${value}" aria-pressed="${area === value}"><strong>${label}</strong></button>`).join('')}</nav>`;
  }
  return '';
}

function sanctuaryHelp(page: MenuPage): string {
  const destination = sanctuaryDestination(page);
  if (destination === 'team') return '<p>Manage your saved squad, Element-Bearers and captured Elemental-Devourers.</p><h3>Squad</h3><p>Choose an owned member, assign a slot and save. The first slot is the leader; teams contain one to three distinct owned IDs.</p><h3>Element-Bearers</h3><p>Review stats and skills, level up, evolve and equip Conduits. Growth actions show exact costs and require confirmation.</p><h3>Captured Elemental-Devourers</h3><p>Each copy has its own level, skills, lock and equipment. Locked, squad-assigned and equipped copies are protected from sales and consumption.</p>';
  if (destination === 'summon') return '<p>Choose a real banner, review outcomes and rules in Rates & Information, then confirm a single draw.</p><p>Only successfully saved draws spend currency or advance pity. Each banner keeps its own counters.</p>';
  if (destination === 'gameplay' || destination === 'events') return '<p>Start with Story. Replay stages for materials, then level up and evolve in Team. Other activities unlock with your highest-level owned Element-Bearer; captured Elemental-Devourers do not count.</p><p>Check enemy levels before entering. Equip Conduits and bring healing or shields for tougher fights. Rewards save per kill; quitting keeps them.</p>';
  if (destination === 'home') return '<p>Open Story to earn your first materials and currencies. Level up and evolve in Team. Replay cleared stages when you need more materials.</p><p>Use Home, Team, Summon and Play to navigate. Currency buttons open Inventory; Collections, Settings and Profile have direct top-bar controls. Market opens Stores.</p>';
  if (destination === 'story') return '<p>Choose a beacon, then a stage. Clear it to open the next one. Regional bosses give extra currencies once.</p><p>Compare enemy levels with your team. Level up, evolve and equip Conduits before pushing ahead. Replay earlier stages for materials.</p>';
  return '<p>Use the visible categories to inspect your holdings and discoveries. Costs and requirements appear beside each action.</p><p>Use the main navigation and direct top-bar controls to change screens. Viewing information never spends resources.</p>';
}
