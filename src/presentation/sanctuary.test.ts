import { describe, expect, it } from 'vitest';
import { sanctuaryHeader, sanctuaryNavigation, isMenuPage } from './sanctuary';
import { inventoryHub } from './hub';
import { gameplayHub } from './gameplay';
import { elements, infusionModes } from '../content/activities';
import { emptyAccount } from '../game/account';

describe('full sanctuary UI', () => {
  it('exposes seven bottom destinations with live squad and summon navigation', () => {
    const html = sanctuaryNavigation('inventory');
    expect(html.match(/data-page=/g)).toHaveLength(7);
    expect(html).toContain('data-page="inventory" aria-current="page"');
    expect(html).not.toContain('SOON');
    for (const page of ['home', 'character', 'gameplay', 'events', 'inventory', 'squad', 'summon', 'story', 'battle']) {
      expect(isMenuPage(page)).toBe(true);
    }
    expect(isMenuPage('settings')).toBe(false);
    expect(isMenuPage(undefined)).toBe(false);
    expect(sanctuaryNavigation('story')).toContain('data-page="gameplay" aria-current="page"');
  });
  it('renders real currency without inventing a premium balance or level', () => {
    const html = sanctuaryHeader('home', 123);
    expect(html).toContain('id="fractalis-balance">123');
    expect(html).toContain('id="lycalis-balance">Unavailable');
    expect(sanctuaryHeader('home', 123, 10)).toContain('id="lycalis-balance">10');
    expect(sanctuaryHeader('inventory', null)).toContain('Unavailable');
    expect(html).toContain('aria-haspopup="dialog"');
  });
  it('limits global inventory to owned materials, separate from character equipment', () => {
    const html = inventoryHub();
    expect(html).not.toContain('artifact-slot');
    expect(html).not.toContain('Master Artifact');
    expect(html).not.toContain('equipment-panel');
    expect(html).toContain('No materials yet');
    const account = emptyAccount();
    account.materials = { 'tectonic-common': 3, 'chaotic-omnic': 1, 'aquatic-rare': 0 };
    const owned = inventoryHub(account);
    expect(owned).toContain('Seed of Tectonic');
    expect(owned).toContain('Soul of Chaotic');
    expect(owned).not.toContain('Shard of Aquatic');
    expect(owned).not.toContain('artifact-slot');
    expect(inventoryHub(null)).toContain('Material inventory unavailable');
  });
  it('keeps canonical dungeon and infusion content while separating activity categories', () => {
    const html = gameplayHub();
    for (const element of elements) expect(html).toContain(element.dungeon);
    for (const mode of infusionModes) expect(html).toContain(mode.name);
    expect(html.match(/class="activity-group"/g)).toHaveLength(5);
    expect(html).not.toContain('Dungeon not playable yet');
    expect(html.match(/data-dungeon="/g)).toHaveLength(10);
    expect(html.match(/data-infusion="/g)).toHaveLength(2);
    expect(html).toContain('data-page="battle"');
  });
});
