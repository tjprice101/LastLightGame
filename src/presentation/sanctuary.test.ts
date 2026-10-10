import { describe, expect, it } from 'vitest';
import { sanctuaryHeader, sanctuaryContext, sanctuaryPages, isMenuPage, sanctuaryDock, sanctuaryDestination } from './sanctuary';
import { inventoryHub } from './hub';
import { gameplayHub } from './gameplay';
import { elements, infusionModes } from '../content/activities';
import { emptyAccount } from '../game/account';

describe('full sanctuary UI', () => {
  it('keeps every menu reachable through the dock and Menu while leaving battle immersive', () => {
    for (const page of sanctuaryPages) {
      const html = sanctuaryHeader(page, 0, 0);
      expect(html).not.toContain('sanctuary-nav');
      expect(sanctuaryDock(page === 'battle' ? 'home' : page)).toContain('data-page="home"');
      expect(html).toContain('data-information="sanctuary-menu"');
      expect(html).not.toContain('id="return-title"');
      for (const destination of ['events', 'inventory', 'stores', 'collections', 'story']) {
        expect(html).toContain(`data-page="${destination}"`);
      }
      expect(html).not.toContain('sanctuary-home');
      if (page !== 'home') expect(html).toContain('data-menu-back');
    }
    for (const page of ['home', 'team', 'character', 'gameplay', 'events', 'inventory', 'stores', 'collections', 'squad', 'summon', 'story', 'battle']) {
      expect(isMenuPage(page)).toBe(true);
    }
    expect(isMenuPage('settings')).toBe(false);
    expect(isMenuPage(undefined)).toBe(false);
  });
  it('has exactly four primary destinations and normalizes old Character/Squad links to Team', () => {
    for (const page of sanctuaryPages.filter((page) => page !== 'battle')) {
      const dock = sanctuaryDock(page);
      expect(dock.match(/data-page=/g)).toHaveLength(4);
      for (const destination of ['home', 'team', 'summon', 'gameplay']) expect(dock).toContain(`data-page="${destination}"`);
    }
    expect(sanctuaryDock('battle')).toBe('');
    expect(sanctuaryDock('character')).toContain('data-page="team" aria-current="page"');
    expect(sanctuaryDock('squad')).toContain('data-page="team" aria-current="page"');
    expect(sanctuaryDestination('character')).toBe('team');
    expect(sanctuaryDestination('squad')).toBe('team');
    expect(sanctuaryDestination('conduit-upgrade')).toBe('conduit-upgrade');
  });
  it('renders all three Team areas and contextual Help without changing balances', () => {
    for (const area of ['squad', 'bearers', 'creatures'] as const) {
      const context = sanctuaryContext('team', area);
      expect(context.match(/data-character-category=/g)).toHaveLength(3);
      expect(context).toContain(`data-character-category="${area}" aria-pressed="true"`);
    }
    const header = sanctuaryHeader('team', Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    expect(header).toContain('Help for Team');
    expect(header).toContain('id="sanctuary-help"');
    expect(header.match(/data-page="inventory"/g)).toHaveLength(3);
    expect(header).toContain('id="fractalis-balance">9007199254740991');
    expect(header).toContain('id="lycalis-balance">9007199254740991');
    expect(header).toContain('<h3>Conduits</h3>');
    expect(header).toContain('<h3>Game</h3>');
  });
  it('renders real currency without inventing a premium balance or level', () => {
    const html = sanctuaryHeader('home', 123);
    expect(html).toContain('id="fractalis-balance">123');
    expect(html).toContain('id="lycalis-balance">Unavailable');
    expect(sanctuaryHeader('home', 123, 10)).toContain('id="lycalis-balance">10');
    expect(sanctuaryHeader('inventory', null)).toContain('Unavailable');
    expect(html).toContain('aria-haspopup="dialog"');
  });
  it('separates holdings, stores and collections and exposes both Character categories', () => {
    expect(sanctuaryContext('inventory')).toBe('');
    expect(inventoryHub()).not.toMatch(/data-page="(?:archives|collections)"/);
    expect(inventoryHub()).toContain('data-page="conduit-store"');
    expect(sanctuaryContext('conduit-store')).toBe('');
    for (const page of ['archives', 'glossary'] as const) expect(sanctuaryContext(page)).toBe('');
    expect(sanctuaryContext('character')).toContain('data-character-category="bearers"');
    expect(sanctuaryContext('character')).toContain('data-character-category="creatures"');
    expect(sanctuaryContext('story')).toBe('');
    expect(sanctuaryContext('home')).toBe('');
  });
  it('shows Back based on actual history even on Home, not a fixed Home shortcut', () => {
    expect(sanctuaryHeader('home', 0, 0, true)).toContain('data-menu-back');
    expect(sanctuaryHeader('character', 0, 0, false)).not.toContain('data-menu-back');
    const header = sanctuaryHeader('story', 0, 0, true).split('data-information="sanctuary-menu"')[0];
    expect(header).not.toContain('data-page="home"');
    expect(header).toContain('>Back');
    expect(sanctuaryHeader('conduit-store', 0, 0, true, 'character')).toContain('aria-label="Back to Team"');
    expect(sanctuaryHeader('home', 0, 0, true, 'inventory')).toContain('<small>Inventory</small>');
    expect(sanctuaryHeader('home', 0, 0, false, 'inventory')).not.toContain('data-menu-back');
  });
  it('limits global inventory to owned materials, separate from character equipment', () => {
    const html = inventoryHub();
    expect(html).not.toContain('artifact-slot');
    expect(html).not.toContain('Master Artifact');
    expect(html).not.toContain('equipment-panel');
    expect(html).toContain('No materials yet');
    const account = emptyAccount();
    account.materials = { 'botanic-common': 3, 'chaotic-omnic': 1, 'oceanic-rare': 0 };
    const owned = inventoryHub(account);
    expect(owned).toContain('Seed of Botanic');
    expect(owned).toContain('Soul of Chaotic');
    expect(owned).not.toContain('Shard of Aquatic');
    expect(owned).not.toContain('artifact-slot');
    expect(inventoryHub(null)).toContain('Material inventory unavailable');
  });
  it('keeps canonical dungeon and infusion content while separating activity categories', () => {
    const html = gameplayHub();
    for (const element of elements) expect(html).toContain(element.dungeon);
    for (const mode of infusionModes) expect(html).toContain(mode.name);
    expect(html.match(/class="activity-group"/g)).toHaveLength(8);
    expect(html).not.toContain('Dungeon not playable yet');
    expect(html.match(/data-dungeon="/g)).toHaveLength(6);
    expect(html.match(/data-infusion="/g)).toHaveLength(6);
    expect(html).toContain('data-page="battle"');
    expect(html.match(/class="activity-picker"/g)).toHaveLength(4);
    expect(html.match(/data-activity-choice=/g)).toHaveLength(13);
    expect(html).toContain('TRANQUILITIC · PRISMATICA');
    expect(html).not.toContain('LUMINOUS');
    expect(html).toContain('data-information="gameplay-information"');
  });
});
