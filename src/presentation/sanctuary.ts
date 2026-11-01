import { currencies } from '../content/progression';
import { uiIcon } from './ui-icon';
import { currencyIcon } from './currency-icon';
import { informationTopics } from './information';
import { worldLore } from './world-lore';
import { storyRules } from '../content/story';

export const sanctuaryPages = ['home', 'team', 'character', 'gameplay', 'events', 'inventory', 'stores', 'collections', 'squad', 'summon', 'story', 'battle', 'glossary', 'archives', 'conduit-store', 'conduit-upgrade', 'profile'] as const;
export type MenuPage = (typeof sanctuaryPages)[number];
export type TeamArea = 'squad' | 'bearers' | 'creatures';

export function sanctuaryDestination(page: MenuPage): MenuPage {
  return page === 'character' || page === 'squad' ? 'team' : page;
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
  const leading = page === 'home'
    ? '<span class="bubble-title-mark" aria-hidden="true"><i></i>Last Light</span>'
    : `<button type="button" class="text-button bubble-back" data-menu-back aria-label="Back"><span class="bubble-back-orb">${uiIcon('back')}</span><span>Back</span></button>`;
  return `<header class="sanctuary-header" data-eyebrow="${eyebrow}">
    ${leading}<h1 class="ref-sr-only" tabindex="-1">${title}</h1>
    <div class="sanctuary-wallet"><div class="currency-strip" aria-label="Currencies">${currencies.map((currency) =>
      `<button type="button" data-page="inventory" aria-label="View ${currency.name} in Inventory">${currencyIcon(currency.id)}<strong><span id="${currency.id}-balance">${(currency.id === 'fractalis' ? fractalis : lycalis) ?? 'Unavailable'}</span><small>${currency.name}</small></strong></button>`).join('')}</div>
      <button type="button" class="text-button sanctuary-help-trigger" data-information="sanctuary-help" aria-label="Help for ${title}" aria-haspopup="dialog" aria-controls="sanctuary-help">?</button>
      <button type="button" class="text-button" data-page="collections" aria-label="Open Collections">${uiIcon('story')}</button>
      <button id="open-settings" type="button" class="text-button" aria-label="Open Settings" aria-haspopup="dialog" aria-controls="settings-drawer">${uiIcon('settings')}</button>
      <button type="button" class="text-button sanctuary-profile-trigger" data-page="profile" aria-label="Open profile">${uiIcon('squad')}</button>
      <dialog class="information-modal sanctuary-help-drawer" id="sanctuary-help" aria-labelledby="sanctuary-help-heading"><header class="drawer-heading"><h2 id="sanctuary-help-heading">${title}</h2><button type="button" class="drawer-close" data-close-information aria-label="Close Help">&times;</button></header><div class="information-content">${informationTopics('sanctuary-help', [
        { id: 'screen', title: `${title} help`, summary: 'Controls, progression and transactions', content: sanctuaryHelp(page) },
        { id: 'origins', title: 'Let and Rise', summary: 'Origins of the world and the creators\' souls', content: worldLore() },
      ])}</div></dialog>
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
  if (destination === 'team') return '<h3>Squad</h3><p>Pick one to three owned members and save. Slot one leads.</p><h3>Element-Bearers</h3><p>Level, evolve and equip Conduits. Every upgrade shows its cost and asks to confirm.</p><h3>Captured Elemental-Devourers</h3><p>Each copy has its own level, skills, lock and Conduits. Locked copies, squad members and copies with Conduits cannot be sold or consumed.</p>';
  if (destination === 'summon') return '<p>Pick a banner, check Rates & Information, then draw. Only saved draws spend currency or add pity; each banner tracks its own pity.</p>';
  if (destination === 'gameplay' || destination === 'events') return '<p>Activities unlock by your highest-level Element-Bearer; captures don\'t count. Rewards save per kill, even if you quit.</p>';
  if (destination === 'home') return '<p>Choose a destination around your leader. The Story card shows your next stage; select a squad portrait to view that member. Currency balances open Inventory. Collections, Settings and Profile are in the top bar.</p>';
  if (destination === 'story') return `<p>Six regions of ${storyRules.regionStages} stages. Each clear opens the next stage. First clear: 150 Prismatica and 2 Null-Prismatica; replays: 150 Prismatica. Regional bosses add a one-time bonus.</p>`;
  if (destination === 'inventory') return '<p>Browse owned materials, Conduits and chests. Select an item for its uses or effects. Open chests here; equip Conduits in Team.</p>';
  if (destination === 'collections' || destination === 'archives' || destination === 'glossary') return '<p>Browse Element-Bearer forms, Conduits and enemy discoveries. Filters narrow the catalog. Encounter enemies to reveal their identity and lore; defeat them to reveal loot.</p>';
  if (destination === 'stores') return '<p>Buy materials in Material Exchange or profile frames in Cosmetic Store. Conduit Store sells equipment unlocks. Prices and balances are shown before you buy.</p>';
  if (destination === 'conduit-store') return '<p>Select a Conduit to compare its current and maximum effects. Buying unlocks it for your collection; equip it in Team. Extra ordinary copies give no benefit.</p>';
  if (destination === 'conduit-upgrade') return '<p>Spend Broken Mechanical Components to upgrade owned Conduits. Upgrades apply to every member using that Conduit. Max Level previews the highest affordable upgrade before you confirm.</p>';
  if (destination === 'profile') return '<p>View Story progress, collection totals, squad and summon totals. Edit your online profile and manage friends when signed in.</p>';
  return '<p>Training starts at wave 1 with your saved squad. HP, Elemental Gauge and recovery carry between waves. Quitting ends the run but keeps rewards from defeated enemies.</p>';
}
