import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { inventoryView, isInventoryTab } from './inventory';
import { sanctuaryHeader } from './sanctuary';
import { masterConduits } from '../content/master-conduits';

describe('reference Inventory layout', () => {
  it('keeps Masters and chest in a dedicated full-width section without hiding ordinary holdings', () => {
    const account = emptyAccount();
    account.masterChests = 1;
    account.masterConduits = { [masterConduits[0].id]: 1 };
    account.materials = { 'rosethorn-rare': 15 };
    account.conduits = { 'vigil-core': 1 };
    const before = structuredClone(account);
    const html = inventoryView(account);
    expect(html).toContain('class="inventory-panel ref-panel inventory-masters"');
    expect(html).toContain('Masters · 1 / 48');
    expect(html).toContain('data-open-master-chest >Open chest');
    expect(html).toContain(masterConduits[0].name);
    expect(html).toContain('data-inventory-material="rosethorn-rare"');
    expect(html).toContain('data-inventory-conduit="vigil-core"');
    expect(html).not.toContain('inventory-empty-slots');
    expect(account).toEqual(before);
  });
  it('renders both holdings panels simultaneously with currency art and decorative empty slots', () => {
    const html = inventoryView(emptyAccount());
    expect(html.match(/class="inventory-currency ref-panel"/g)).toHaveLength(2);
    for (const id of ['fractalis', 'lycalis']) expect(html).toContain(`currencies/${id}.png`);
    expect(html).toContain('id="inventory-panel-materials" aria-label="Owned materials"');
    expect(html).toContain('id="inventory-panel-conduits" aria-label="Owned Conduits"');
    expect(html).not.toContain('role="tab"');
    expect(html).toContain('0 Broken Mechanical Components');
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
    expect(html).toContain('Materials · 2');
    expect(html).toContain('Conduits · 1');
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
    expect(html).not.toContain('id="inventory-panel-materials" aria-label="Owned materials" hidden');
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
    expect(html).toContain('data-page="conduit-store"');
    expect(html).toContain('Materials · Unavailable');
    expect(isInventoryTab('materials')).toBe(true);
    expect(isInventoryTab('conduits')).toBe(true);
    for (const input of ['currency', null, undefined]) expect(isInventoryTab(input)).toBe(false);
  });
});

describe('direct sanctuary utilities', () => {
  it('removes the Menu sidebar and keeps unique Settings, Collections and currency controls', () => {
    const html = sanctuaryHeader('inventory', 12, 34);
    expect(html).not.toContain('sanctuary-menu');
    expect(html.match(/data-page="collections"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Open Collections"');
    expect(html).toContain('aria-label="Open Settings" aria-haspopup="dialog" aria-controls="settings-drawer"');
    expect(html.match(/data-page="inventory"/g)).toHaveLength(2);
    expect(html).not.toContain('id="return-title"');
    for (const id of ['open-settings', 'fractalis-balance', 'lycalis-balance']) {
      expect(html.match(new RegExp(`id="${id}"`, 'g'))).toHaveLength(1);
    }
    expect(html).toContain('data-close-information aria-label="Close Help"');
  });
});
