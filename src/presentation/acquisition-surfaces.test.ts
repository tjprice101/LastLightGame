// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { inventoryView } from './inventory';
import { referenceTeam } from './reference-team';
import { archives } from './archives';
import { masterConduits } from '../content/master-conduits';
import { bindAcquisitionMarkers } from './acquisition-markers';
import { acknowledgeAcquisitions } from '../game/acquisition-markers';
import { workspaceUnitsMenu } from './menu-workspace';

let release: (() => void) | undefined;
afterEach(() => { release?.(); document.body.innerHTML = ''; });
describe('actual Inventory, Team and Collections acquisition surfaces', () => {
  it('wires material, ordinary Conduit, Master and Element-Bearer marks to the actual rendered cards', () => {
    const account = emptyAccount();
    const master = masterConduits[0];
    account.characters = { ember: { level: 0, evolution: 1 }, tide: { level: 0, evolution: 1 } };
    account.materials = { 'oceanic-common': 10 }; account.conduits = { 'vigil-core': 1 };
    account.masterConduits = { [master.id]: 1 };
    account.acquisitionMarkers = {
      'character:ember': true, 'character:tide': false, 'material:oceanic-common': false,
      'conduit:vigil-core': false, [`master:${master.id}`]: false,
    };
    document.body.innerHTML = inventoryView(account) + workspaceUnitsMenu() + referenceTeam(account, { view: 'bearers', selected: 'ember', element: '', sort: 'name' }) + archives(account);
    release = bindAcquisitionMarkers(document.body, {
      account: () => account,
      acknowledge: async keys => {
        account.acquisitionMarkers = acknowledgeAcquisitions(account, keys); return account.acquisitionMarkers;
      }, error: () => {},
    });
    for (const selector of [
      '[data-inventory-material="oceanic-common"]', '[data-inventory-conduit="vigil-core"]',
      `[data-inventory-master="${master.id}"]`, '[data-team-detail="tide"]', '[data-archive-character="tide"]',
      '[data-archive-conduit="vigil-core"]', `[data-archive-master="${master.id}"]`,
      '[data-team-view="bearers"]', '[data-inventory-tab="materials"]', '[data-archive-gallery="conduits"]',
    ]) expect(document.querySelector(selector)?.hasAttribute('data-new-acquisition')).toBe(true);
    expect(document.querySelector('[data-archive-character="ember"]')?.hasAttribute('data-new-acquisition')).toBe(false);
    expect(document.querySelectorAll('[data-archive-conduit]:not([data-archive-conduit="vigil-core"]) [data-new-acquisition]')).toHaveLength(0);
  }, 20000);
});
