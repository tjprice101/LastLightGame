// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyAccount } from '../game/account';
import { bindInventory, inventorySections, inventoryFilters, inventoryView, isInventoryTab } from './inventory';
import { sanctuaryHeader } from './sanctuary';
import { masterChest, masterConduits } from '../content/master-conduits';
import { conduits, conduitEffect, getConduit } from '../content/conduits';
import { bindInformation } from './information';
import { bracketReferences } from './reference-text';

afterEach(() => document.body.replaceChildren());

describe('reference Inventory layout', () => {
  it('shows an owned chest as a normal Master inventory tile without a dedicated action panel', () => {
    const account = emptyAccount();
    account.masterChests = 1;
    account.masterConduits = { [masterConduits[0].id]: 1 };
    account.materials = { 'rosethorn-rare': 15 };
    account.conduits = { 'vigil-core': 1 };
    const before = structuredClone(account);
    const html = inventoryView(account);
    expect(html).toContain('class="inventory-panel ref-panel inventory-masters"');
    expect(html).toContain('Master Conduits &amp; Chests · 1 / 48');
    expect(html).toContain(`data-inventory-chest="${masterChest.id}"`);
    expect(html).toContain('class="inventory-item-art inventory-chest-control" data-open-master-chest');
    expect(html).not.toContain('Open chest · Choose a Master</button>');
    expect(html).toContain(masterConduits[0].name);
    expect(html).toContain('data-inventory-material="rosethorn-rare"');
    expect(html).toContain('data-inventory-conduit="vigil-core"');
    expect(html).not.toContain('inventory-empty-slots');
    expect(html).not.toContain('data-page=');
    expect(account).toEqual(before);
  });
  it('omits unowned chests and retains owned chests when all Masters are unlocked', () => {
    expect(inventoryView(emptyAccount())).not.toContain('data-open-master-chest');
    expect(inventoryView(null)).not.toContain('data-inventory-chest');
    const account = emptyAccount();
    account.masterChests = Number.MAX_SAFE_INTEGER;
    account.masterConduits = Object.fromEntries(masterConduits.map(entry => [entry.id, 1]));
    const html = inventoryView(account);
    expect(html).toContain('aria-label="Open Cosmic Grand Master Chest · Choose a Master" disabled');
    expect(html).toContain('Extra chests stay unopened once you own every Master.');
    expect(html).toContain(`Owned ${Number.MAX_SAFE_INTEGER}`);
  });
  it('renders both holdings panels simultaneously with currency art and decorative empty slots', () => {
    const html = inventoryView(emptyAccount());
    expect(html.match(/class="inventory-currency ref-panel"/g)).toHaveLength(3);
    for (const id of ['fractalis', 'lycalis']) expect(html).toContain(`currencies/${id}.png`);
    expect(html).toContain('id="inventory-panel-materials" data-inventory-section="materials" open');
    expect(html).toContain('id="inventory-panel-conduits" data-inventory-section="conduits" open');
    expect(html).not.toContain('role="tab"');
    expect(html).not.toContain('data-inventory-resource="mechanical-components"');
    expect(html.match(/<i><\/i>/g)).toHaveLength(28);
    expect(html.match(/class="inventory-empty-slots" aria-hidden="true"/g)).toHaveLength(2);
    expect(html).toContain('No resources yet');
    expect(html).toContain('No Conduits owned yet');
    expect(html).not.toContain('data-page=');
  });
  it('counts distinct positive holdings and displays actual names, artwork, effects and exact stack quantities', () => {
    const account = emptyAccount();
    account.fractalis = Number.MAX_SAFE_INTEGER;
    account.lycalis = Number.MAX_SAFE_INTEGER;
    account.materials = { 'infernic-common': Number.MAX_SAFE_INTEGER, 'rosethorn-omnic': 2, 'oceanic-rare': 0 };
    account.conduits = { 'vigil-core': 3, 'bastion-lock': 0 };
    const before = structuredClone(account);
    const html = inventoryView(account, 'conduits');
    expect(html).toContain('Resources · 2');
    expect(html).toContain('Conduits · 1');
    expect(html.match(/data-inventory-material=/g)).toHaveLength(2);
    expect(html.match(/data-inventory-conduit=/g)).toHaveLength(1);
    expect(html).toContain('Seed of Infernic');
    expect(html).toContain('Soul of Rosethorn');
    expect(html).toContain('Vigil Core');
    expect(html).toContain(conduitEffect(getConduit('vigil-core'), 0));
    expect(html).toContain('Owned 3');
    expect(html).not.toContain('Shard of Aquatic');
    expect(html).not.toContain('Bastion Lock');
    expect(html.match(/9007199254740991/g)).toHaveLength(4);
    expect(html).not.toContain('id="inventory-panel-materials" aria-label="Owned materials" hidden');
    expect(html).not.toContain('No resources yet');
    expect(html).not.toContain('inventory-empty-slots');
    expect(account).toEqual(before);
  });
  it('distinguishes unavailable saves from empty holdings without displaying fake zero balances', () => {
    const html = inventoryView(null);
    expect(html.match(/role="alert"/g)).toHaveLength(4);
    for (const type of ['Currency', 'Resource', 'Conduit']) expect(html).toContain(`${type} inventory unavailable`);
    expect(html).not.toContain('No resources yet');
    expect(html).not.toContain('No Conduits owned yet');
    expect(html).not.toContain('inventory-empty-slots');
    expect(html).not.toContain('data-page=');
    expect(html).toContain('Resources · Unavailable');
    expect(isInventoryTab('materials')).toBe(true);
    expect(isInventoryTab('conduits')).toBe(true);
    for (const input of ['currency', null, undefined]) expect(isInventoryTab(input)).toBe(false);
  });
  it('expands and collapses sections independently, preserving item DOM and transient state', () => {
    const account = emptyAccount();
    account.conduits = { 'vigil-core': 1 };
    const before = structuredClone(account);
    const host = document.createElement('div');
    host.innerHTML = inventoryView(account, 'materials', { masters: false, materials: true, conduits: false });
    const changed = vi.fn();
    const selected = vi.fn();
    bindInventory(host, selected, changed);
    const panel = host.querySelector<HTMLDetailsElement>('[data-inventory-section="conduits"]')!;
    const item = panel.querySelector('[data-inventory-conduit]');
    panel.open = true;
    panel.dispatchEvent(new Event('toggle'));
    expect(selected).toHaveBeenCalledWith('conduits');
    expect(changed).toHaveBeenLastCalledWith({ masters: false, materials: true, conduits: true });
    panel.open = false;
    panel.dispatchEvent(new Event('toggle'));
    expect(inventorySections(host)).toEqual({ masters: false, materials: true, conduits: false });
    expect(panel.querySelector('[data-inventory-conduit]')).toBe(item);
    const restored = document.createElement('div');
    restored.innerHTML = inventoryView(account, 'conduits', inventorySections(host));
    expect(inventorySections(restored)).toEqual(inventorySections(host));
    expect(host.querySelectorAll('details > summary')).toHaveLength(3);
    expect(account).toEqual(before);
  });

  it('puts complete upgraded Conduit effects and Master rules in Details, not the item grid', () => {
    const account = emptyAccount();
    account.conduits = Object.fromEntries(conduits.map(entry => [entry.id, 1]));
    account.conduitUpgrades = Object.fromEntries(conduits.map(entry => [entry.id, 5]));
    account.masterConduits = Object.fromEntries(masterConduits.map(entry => [entry.id, 1]));
    const before = structuredClone(account);
    const host = document.createElement('div');
    host.innerHTML = inventoryView(account);
    for (const entry of [...conduits, ...masterConduits]) {
      const ordinary = 'power' in entry;
      const card = host.querySelector(`[data-inventory-${ordinary ? 'conduit' : 'master'}="${entry.id}"]`)!;
      const dialog = card.querySelector('dialog')!;
      const effect = ordinary ? conduitEffect(entry, 5) : entry.effect;
      const expected = document.createElement('div');
      expected.innerHTML = bracketReferences(effect);
      expect(dialog.textContent).toContain(expected.textContent);
      if (ordinary) expect(dialog.textContent).toContain(entry.lore);
      expect(card.querySelector('[data-information]')?.textContent).toBe('Details');
      const compact = card.cloneNode(true) as HTMLElement;
      compact.querySelector('dialog')!.remove();
      expect(compact.textContent?.replace(/[[\]]/g, '')).not.toContain(effect.replace(/[[\]]/g, ''));
      expect(compact.textContent).toContain(entry.name);
      expect(compact.textContent).toContain('Owned 1');
    }
    expect(account).toEqual(before);
  });

  it('opens material Details with honest usage copy and closes without consuming anything', () => {
    const account = emptyAccount();
    account.materials = { 'heavens-weapon': 2, 'heavens-level': 3, 'heavens-evolution': 4, 'rosethorn-common': 5, 'infernic-common': 6 };
    const before = structuredClone(account);
    const host = document.createElement('main');
    host.innerHTML = inventoryView(account);
    document.body.append(host);
    bindInformation(host);
    const dialog = host.querySelector<HTMLDialogElement>('#inventory-heavens-weapon-details')!;
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => dialog.removeAttribute('open'));
    host.querySelector<HTMLButtonElement>('[data-information="inventory-heavens-weapon-details"]')!.click();
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(dialog.textContent).toContain('Weapon upgrading is unavailable');
    expect(dialog.textContent).toContain('Owned 2');
    host.querySelector<HTMLButtonElement>('#inventory-heavens-weapon-details [data-close-information]')!.click();
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(host.querySelectorAll('[data-inventory-material] > [data-information]')).toHaveLength(5);
    expect(account).toEqual(before);
  });

  it('combines live search, item type, rarity and real elemental metadata without replacing cards', () => {
    const account = emptyAccount();
    account.materials = { 'infernic-common': 7, 'oceanic-rare': 2, 'heavens-level': 3, 'rosethorn-common': 1 };
    account.conduits = { 'vigil-core': 1, 'infernic-phoenix-reactor': 1 };
    account.masterConduits = { [masterConduits[0].id]: 1 };
    account.masterChests = 1;
    account.mechanicalComponents = 8;
    const before = structuredClone(account);
    const host = document.createElement('main');
    host.innerHTML = inventoryView(account);
    const changed = vi.fn();
    bindInventory(host, vi.fn(), undefined, changed);
    const visible = () => Array.from(host.querySelectorAll<HTMLElement>('[data-inventory-entry]')).filter(item => !item.hidden);
    expect(visible()).toHaveLength(9);
    const card = host.querySelector<HTMLElement>('[data-inventory-material="infernic-common"]')!;
    const setFilter = (key: string, value: string) => {
      const select = host.querySelector<HTMLSelectElement>(`[data-inventory-filter="${key}"]`)!;
      select.value = value;
      select.dispatchEvent(new Event('change'));
    };
    setFilter('element', 'infernic');
    expect(visible()).toHaveLength(4); // Material, specialty recipe, Omnic and Master.
    setFilter('rarity', 'Common');
    expect(visible()).toEqual([card]);
    setFilter('type', 'materials');
    const query = host.querySelector<HTMLInputElement>('[data-inventory-query]')!;
    query.value = '  SEED  ';
    query.dispatchEvent(new Event('input'));
    expect(visible()).toEqual([card]);
    query.value = 'not owned';
    query.dispatchEvent(new Event('input'));
    expect(visible()).toHaveLength(0);
    expect(host.querySelector('[data-inventory-results]')?.textContent).toContain('No owned items match');
    expect(host.querySelector<HTMLElement>('[data-inventory-section="materials"]')!.hidden).toBe(true);
    host.querySelector<HTMLButtonElement>('[data-inventory-clear]')!.click();
    expect(visible()).toHaveLength(9);
    expect(host.querySelector('[data-inventory-material="infernic-common"]')).toBe(card);
    setFilter('element', 'none');
    expect(visible().map(item => item.dataset.itemType)).toEqual(['chests', 'components', 'materials', 'conduits']);
    setFilter('type', 'components');
    expect(visible()).toHaveLength(1);
    expect(changed).toHaveBeenLastCalledWith(inventoryFilters(host));
    expect(account).toEqual(before);
  });

  it('restores escaped queries and filters while retaining collapsed sections and unavailable errors', () => {
    const account = emptyAccount();
    account.materials = { 'infernic-common': 5 };
    const filters = { query: '"><img src=x>', type: 'materials', rarity: 'Common', element: 'infernic' };
    const host = document.createElement('main');
    host.innerHTML = inventoryView(account, 'materials', { masters: true, materials: false, conduits: true }, filters);
    bindInventory(host, vi.fn());
    expect(inventoryFilters(host)).toEqual(filters);
    expect(host.querySelector('img[src="x"]')).toBeNull();
    expect(inventorySections(host).materials).toBe(false);
    const restored = document.createElement('main');
    restored.innerHTML = inventoryView(account, 'materials', inventorySections(host), { ...filters, query: 'seed' });
    bindInventory(restored, vi.fn());
    expect(restored.querySelector<HTMLElement>('[data-inventory-material]')!.hidden).toBe(false);
    expect(inventorySections(restored).materials).toBe(false);
    host.innerHTML = inventoryView(null, 'materials', undefined, filters);
    bindInventory(host, vi.fn());
    expect(host.querySelectorAll('[role="alert"]')).toHaveLength(4);
    expect(host.querySelector<HTMLInputElement>('[data-inventory-query]')!.disabled).toBe(true);
    expect(host.querySelector('[data-inventory-results]')?.hasAttribute('hidden')).toBe(true);
  });

  it('organizes Inventory help into five optional topics with short paragraphs', () => {
    const host = document.createElement('main');
    host.innerHTML = inventoryView(emptyAccount());
    const dialog = host.querySelector('#inventory-information')!;
    expect(dialog.querySelectorAll('[data-info-topic]')).toHaveLength(5);
    expect(dialog.querySelectorAll('[data-info-panel][hidden]')).toHaveLength(5);
    for (const paragraph of Array.from(dialog.querySelectorAll('p'))) expect(paragraph.textContent!.length).toBeLessThan(300);
  });

  it('treats components as a normal positive resource stack with full-size art and Details', () => {
    const account = emptyAccount();
    account.mechanicalComponents = Number.MAX_SAFE_INTEGER;
    const before = structuredClone(account);
    const host = document.createElement('main');
    host.innerHTML = inventoryView(account);
    const resources = host.querySelector('#inventory-panel-materials')!;
    const card = resources.querySelector('[data-inventory-resource="mechanical-components"]')!;
    expect(resources.querySelector('summary')!.textContent).toBe('Resources · 1');
    expect(card.closest('.inventory-item-grid')).not.toBeNull();
    expect(card.querySelector('.inventory-item-art > img')?.getAttribute('src')).toContain('currencies/mechanical-components.png');
    expect(card.querySelector('.inventory-quantity')!.textContent).toBe(`Owned ${Number.MAX_SAFE_INTEGER}`);
    expect(card.querySelector('dialog')!.textContent).toContain('Masters can\'t be upgraded');
    expect(host.querySelector('#inventory-panel-conduits')!.textContent).not.toContain('Broken Mechanical Components');
    expect(host.querySelector('.ref-component-count')).toBeNull();
    expect(resources.querySelector('.inventory-empty-slots')).toBeNull();
    expect(account).toEqual(before);
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
