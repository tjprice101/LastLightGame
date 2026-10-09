import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { inventoryView, isInventoryTab } from './inventory';
import { sanctuaryHeader } from './sanctuary';

describe('reference Inventory layout', () => {
  it('renders currency art, accessible tabs and fourteen decorative slots for each empty category', () => {
    const html = inventoryView(emptyAccount());
    expect(html.match(/class="inventory-currency"/g)).toHaveLength(3);
    for (const id of ['fractalis', 'lycalis']) expect(html).toContain(`currencies/${id}.png`);
    expect(html).toContain('id="inventory-tab-materials" data-inventory-tab="materials" aria-controls="inventory-panel-materials" aria-selected="true" tabindex="0"');
    expect(html).toContain('id="inventory-tab-conduits" data-inventory-tab="conduits" aria-controls="inventory-panel-conduits" aria-selected="false" tabindex="-1"');
    expect(html.match(/<i><\/i>/g)).toHaveLength(28);
    expect(html.match(/class="inventory-empty-slots" aria-hidden="true"/g)).toHaveLength(2);
    expect(html).toContain('No materials yet');
    expect(html).toContain('No Conduits owned yet');
    expect(html).toContain('data-page="gameplay"');
    expect(html).toContain('data-page="conduit-store"');
  });
  it('counts distinct positive holdings and displays actual names, artwork, effects and exact stack quantities', () => {
    const account = emptyAccount();
    account.fractalis = Number.MAX_SAFE_INTEGER;
    account.lycalis = Number.MAX_SAFE_INTEGER;
    account.materials = { 'infernic-common': Number.MAX_SAFE_INTEGER, 'rosethorn-omnic': 2, 'oceanic-rare': 0 };
    account.conduits = { 'vigil-core': 3, 'bastion-lock': 0 };
    const before = structuredClone(account);
    const html = inventoryView(account, 'conduits');
    expect(html).toContain('Materials &middot; 2');
    expect(html).toContain('Conduits &middot; 1');
    expect(html.match(/data-inventory-material=/g)).toHaveLength(2);
    expect(html.match(/data-inventory-conduit=/g)).toHaveLength(1);
    expect(html).toContain('Seed of Infernic');
    expect(html).toContain('Soul of Rosethorn');
    expect(html).toContain('Vigil Core');
    expect(html).toContain('+5% Health');
    expect(html).toContain('Owned 3');
    expect(html).not.toContain('Shard of Aquatic');
    expect(html).not.toContain('Bastion Lock');
    expect(html.match(/9007199254740991/g)).toHaveLength(3);
    expect(html).toContain('id="inventory-panel-materials" aria-labelledby="inventory-tab-materials" tabindex="0" hidden');
    expect(html).not.toContain('No materials yet');
    expect(html).not.toContain('inventory-empty-slots');
    expect(account).toEqual(before);
  });
  it('distinguishes unavailable saves from empty holdings without displaying fake zero balances', () => {
    const html = inventoryView(null);
    expect(html.match(/role="alert"/g)).toHaveLength(3);
    for (const type of ['Currency', 'Material', 'Conduit']) expect(html).toContain(`${type} inventory unavailable`);
    expect(html).not.toContain('No materials yet');
    expect(html).not.toContain('No Conduits owned yet');
    expect(html).not.toContain('inventory-empty-slots');
    expect(html).not.toContain('data-page="conduit-store"');
    expect(html).toContain('Materials &middot; Unavailable');
    expect(isInventoryTab('materials')).toBe(true);
    expect(isInventoryTab('conduits')).toBe(true);
    for (const input of ['currency', null, undefined]) expect(isInventoryTab(input)).toBe(false);
  });
});

describe('right-side sanctuary Menu', () => {
  it('features Inventory and Collections, retains all routes and keeps utility handlers unique', () => {
    const html = sanctuaryHeader('inventory', 12, 34);
    expect(html).toContain('class="information-modal sanctuary-menu-drawer"');
    expect(html).toContain('aria-controls="sanctuary-menu"');
    const tiles = html.slice(html.indexOf('class="sanctuary-menu-tiles"'), html.indexOf('class="sanctuary-menu-utilities"'));
    expect(tiles.match(/data-page=/g)).toHaveLength(2);
    expect(tiles).toContain('data-page="inventory" aria-current="page"');
    expect(tiles).toContain('data-page="collections"');
    expect(tiles).toContain('Currencies &amp; materials');
    expect(html).toContain('Recovered ancient mechanisms');
    expect(html).toContain('data-page="conduit-store"');
    for (const page of ['events', 'stores', 'story']) {
      expect(html.match(new RegExp(`data-page="${page}"`, 'g'))).toHaveLength(1);
    }
    for (const page of ['home', 'team', 'summon', 'gameplay']) expect(html).not.toContain(`data-page="${page}"`);
    expect(html).not.toContain('id="return-title"');
    for (const id of ['open-settings', 'fractalis-balance', 'lycalis-balance']) {
      expect(html.match(new RegExp(`id="${id}"`, 'g'))).toHaveLength(1);
    }
    expect(html).toContain('data-close-information aria-label="Close Menu"');
    expect(html).not.toContain('sanctuary-menu-note');
  });
});
