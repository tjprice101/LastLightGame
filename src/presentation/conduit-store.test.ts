import { describe, expect, it } from 'vitest';
import { conduits } from '../content/conduits';
import { emptyAccount } from '../game/account';
import { conduitStore, conduitInventory } from './conduit-store';
import { inventoryHub, characterHub } from './hub';
import { starters } from '../content/starters';
import { isMenuPage, sanctuaryNavigation } from './sanctuary';

describe('Conduit Store and discovery routes', () => {
  it('has five Common mechanisms with approved prices/buffs and clearly deferred equipping', () => {
    const html = conduitStore({ ...emptyAccount(), fractalis: 10000 });
    expect(html.match(/data-buy-conduit=/g)).toHaveLength(5);
    expect(html).not.toContain('disabled');
    for (const conduit of conduits) {
      expect(conduit.rarity).toBe('Common');
      expect(html).toContain(conduit.name);
      expect(html).toContain(conduit.effect);
      expect(html).toContain(`${conduit.price} Fractalis`);
    }
    expect(html).toContain('Elemental Light');
    expect(html).toContain('Owning one unlocks it for every character');
    expect(html).toContain('Recovered mechanism');
    for (const conduit of conduits) expect(html).toContain(`assets/conduits/${conduit.id}.png`);
    expect(html).toContain('assets/banners/conduit-store.png');
    expect(conduits.map((entry) => entry.price)).toEqual([1000, 1200, 1000, 1500, 1200]);
    expect(conduits.map((entry) => entry.buff.amount)).toEqual([5, 5, 5, 2, 5]);
  });
  it('shows owned quantities, empty/error states and unaffordable disabled buttons', () => {
    const account = { ...emptyAccount(), conduits: { 'vigil-core': 2, 'bastion-lock': 0 } };
    expect(conduitInventory(account)).toContain('Owned 2');
    expect(conduitInventory(account)).not.toContain('Bastion Lock');
    expect(conduitInventory(emptyAccount())).toContain('No Conduits owned');
    expect(conduitInventory(null)).toContain('role="alert"');
    expect(conduitStore(emptyAccount()).match(/ disabled/g)).toHaveLength(5);
    expect(conduitStore(null)).toContain('Store unavailable');
  });
  it('is reachable from Inventory and Character without adding a bottom-navigation destination', () => {
    expect(isMenuPage('conduit-store')).toBe(true);
    expect(inventoryHub()).toContain('data-page="conduit-store"');
    expect(characterHub(starters[0], 'equipment')).toContain('data-page="conduit-store"');
    expect(characterHub(starters[0], 'equipment')).not.toContain('Artifact');
    expect(sanctuaryNavigation('conduit-store')).toContain('data-page="inventory" aria-current="page"');
    expect(sanctuaryNavigation('conduit-store').match(/data-page=/g)).toHaveLength(7);
  });
});
