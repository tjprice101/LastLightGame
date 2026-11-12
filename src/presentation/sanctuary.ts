import { currencies } from '../content/progression';
import { uiIcon } from './ui-icon';
import { currencyIcon } from './currency-icon';
import { informationTopics } from './information';
import { worldLore } from './world-lore';
import { storyRules } from '../content/story';

export const sanctuaryPages = ['home', 'team', 'character', 'gameplay', 'events', 'inventory', 'stores', 'collections', 'squad', 'summon', 'special-banner-archive', 'story', 'battle', 'glossary', 'archives', 'conduit-store', 'conduit-upgrade', 'profile'] as const;
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
  'special-banner-archive': ['SPECIAL BANNERS', 'Special Banner Archive'],
  battle: ['YOUR SQUAD · GRASSY FIELD', 'Training'],
  glossary: ['COLLECTIONS · DISCOVERIES', 'Archives'],
  archives: ['COLLECTIONS · DISCOVERIES', 'Archives'],
  'conduit-store': ['STORES', 'Conduit Store'],
  'conduit-upgrade': ['RESTORATION', 'Conduit Upgrade'],
  profile: ['PLAYER', 'Profile'],
};

export function sanctuaryHeader(page: MenuPage, fractalis: number | null, lycalis: number | null = null, homeProfile = ''): string {
  const [eyebrow, title] = headings[sanctuaryDestination(page)];
  const leading = page === 'home'
    ? homeProfile || `<span class="sanctuary-home-emblem" aria-hidden="true">${uiIcon('home')}</span>`
    : `<button type="button" class="text-button bubble-back" data-menu-back aria-label="Back"><span class="bubble-back-orb">${uiIcon('back')}</span><span>Back</span></button>`;
  const profileButton = page === 'home' ? '' : `<button type="button" class="text-button sanctuary-profile-trigger" data-page="profile" aria-label="Open profile">${uiIcon('squad')}</button>`;
  return `<header class="sanctuary-header${page === 'home' ? ' home-menu-header' : ''}" data-eyebrow="${eyebrow}">
    ${leading}<h1 class="ref-sr-only" tabindex="-1">${title}</h1><span class="sanctuary-wordmark" aria-hidden="true">Last Light</span>
    <div class="sanctuary-wallet"><div class="currency-strip" aria-label="Currencies">${currencies.map((currency) =>
      `<button type="button" data-page="inventory" aria-label="View ${currency.name} in Inventory">${currencyIcon(currency.id)}<strong><span id="${currency.id}-balance">${(currency.id === 'fractalis' ? fractalis : lycalis) ?? 'Unavailable'}</span><small>${currency.name}</small></strong></button>`).join('')}</div>
      <button type="button" class="text-button sanctuary-help-trigger" data-information="sanctuary-help" aria-label="Help for ${title}" aria-haspopup="dialog" aria-controls="sanctuary-help">?</button>
      <button type="button" class="text-button" data-page="collections" aria-label="Open Collections">${uiIcon('story')}</button>
      <button id="open-settings" type="button" class="text-button" aria-label="Open Settings" aria-haspopup="dialog" aria-controls="settings-drawer">${uiIcon('settings')}</button>
      ${profileButton}
      <dialog class="information-modal sanctuary-help-drawer" id="sanctuary-help" aria-labelledby="sanctuary-help-heading"><header class="drawer-heading"><h2 id="sanctuary-help-heading">${title}</h2><button type="button" class="drawer-close" data-close-information aria-label="Close Help">&times;</button></header><div class="information-content">${informationTopics('sanctuary-help', [
        { id: 'screen', title: `${title} help`, summary: 'Controls and game rules', content: sanctuaryHelp(page) },
        { id: 'origins', title: 'Let and Rise', summary: 'Origins of the world and the creators\' souls', content: worldLore() },
      ])}</div></dialog>
      </div>
    <button type="button" class="menu-frame-toggle menu-header-toggle" data-menu-frame="header" aria-expanded="true" aria-label="Collapse top bar" title="Collapse top bar">&and;</button>
  </header>`;
}

const primaryDestinations = [
  ['home', 'Home', 'home', 'Sanctuary'],
  ['team', 'Team', 'squad', 'Squad and Element-Bearers'],
  ['gameplay', 'Play', 'gameplay', 'Activities and events'],
  ['stores', 'Shop', 'weapon', 'Materials and Conduits'],
  ['summon', 'Summon', 'summon', 'Banners and rates'],
  ['profile', 'Social', 'squad', 'Friends and attendance'],
] as const;

function primaryDestination(page: MenuPage): MenuPage | null {
  if (page === 'home') return 'home';
  if (page === 'team' || page === 'character' || page === 'squad' || page === 'conduit-store' || page === 'conduit-upgrade') return 'team';
  if (page === 'summon' || page === 'special-banner-archive') return 'summon';
  if (page === 'stores' || page === 'inventory') return 'stores';
  if (page === 'profile') return 'profile';
  if (page === 'gameplay' || page === 'events' || page === 'story' || page === 'battle') return 'gameplay';
  return null;
}

export function sanctuaryDock(page: MenuPage): string {
  const active = primaryDestination(page);
  return `<nav class="sanctuary-dock" aria-label="Primary navigation"><button type="button" class="menu-frame-toggle menu-dock-toggle" data-menu-frame="dock" aria-expanded="true" aria-label="Collapse bottom bar" title="Collapse bottom bar">&or;</button>${primaryDestinations.map(([destination, label, icon, detail]) =>
    `<button type="button" data-page="${destination}" aria-label="${detail}" aria-current="${active === destination ? 'page' : 'false'}">
      <span class="nav-symbol" aria-hidden="true">${uiIcon(icon)}</span><span class="nav-copy"><strong>${label}</strong><span>${detail}</span></span>
    </button>`).join('')}</nav>`;
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
  if (destination === 'team') return '<h3>Squad</h3><p>Pick one to six owned members and save. Slot one leads.</p><h3>Element-Bearers</h3><p>Level, evolve and equip Conduits. Every upgrade shows its cost and asks to confirm.</p><h3>Captured Elemental-Devourers</h3><p>Each copy has its own level, skills, lock and Conduits. Locked copies, squad members and copies with Conduits cannot be sold or consumed.</p>';
  if (destination === 'summon') return '<p>Pick a banner and draw. Check Rates & Information for rewards and guarantees. Each banner has its own pity counter.</p>';
  if (destination === 'gameplay' || destination === 'events') return '<p>Activities unlock by your highest-level Element-Bearer; captures don\'t count. Rewards save per kill, even if you quit.</p>';
  if (destination === 'home') return '<p>Home shows your current squad leader, six squad slots and featured destinations. Use the quick actions for Archives, Loadouts, Items, Friends and Attendance; the primary navigation opens Home, Team, Play, Shop, Summon and Social.</p>';
  if (destination === 'story') return `<p>Six regions of ${storyRules.regionStages} stages. Each clear opens the next stage. First clear: 150 Prismatica and 2 Null-Prismatica; replays: 150 Prismatica. Regional bosses add a one-time bonus.</p>`;
  if (destination === 'inventory') return '<p>Browse owned materials, Conduits and chests. Select an item for its uses or effects. Open chests here; equip Conduits in Team.</p>';
  if (destination === 'collections' || destination === 'archives' || destination === 'glossary') return '<p>Browse Element-Bearer forms, Conduits and enemy discoveries. Filters narrow the catalog. Encounter enemies to reveal their identity and lore; defeat them to reveal loot.</p>';
  if (destination === 'stores') return '<p>Buy materials in Material Exchange or profile frames in Cosmetic Store. Conduit Store sells equipment unlocks. Check the price and quantity before buying.</p>';
  if (destination === 'conduit-store') return '<p>Select a Conduit to compare its current and maximum effects. Buying unlocks it for your collection; equip it in Team. Extra ordinary copies give no benefit.</p>';
  if (destination === 'conduit-upgrade') return '<p>Spend Broken Mechanical Components to upgrade owned Conduits. Upgrades apply to every member using that Conduit. Max Level previews the highest affordable upgrade before you confirm.</p>';
  if (destination === 'profile') return '<p>View Story progress, collection totals, squad and summon totals. Edit your online profile and manage friends when signed in.</p>';
  return '<p>Training starts at wave 1 with your saved squad. HP, Elemental Gauge and recovery carry between waves. Quitting ends the run but keeps rewards from defeated enemies.</p>';
}
