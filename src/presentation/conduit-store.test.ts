import { describe, expect, it } from 'vitest';
import { additionalCommonConduits, commonConduits as conduits } from '../content/conduits';
import { emptyAccount } from '../game/account';
import { conduitStore, conduitInventory } from './conduit-store';
import { inventoryHub, characterHub } from './hub';
import { starters } from '../content/starters';
import { isMenuPage, sanctuaryContext, sanctuaryHeader } from './sanctuary';

describe('Conduit Store and discovery routes', () => {
  it('retains existing Common mechanisms and lists all fifteen Store-only items', () => {
    const html = conduitStore({ ...emptyAccount(), fractalis: 10000 });
    expect(html.match(/data-buy-conduit=/g)).toHaveLength(15);
    expect(html).not.toContain('disabled');
    for (const conduit of conduits) {
      expect(conduit.rarity).toBe('Common');
      expect(html).toContain(conduit.name);
      expect(html).toContain(conduit.effect);
      expect(html).toContain(`${conduit.price} Prismatica`);
    }
    expect(html).not.toContain('Elemental Light core');
    expect(html).not.toContain('Mechanical drive');
    expect(html).toContain('One owned copy unlocks a Conduit for all owned characters');
    expect(html).toContain('data-information="store-information"');
    expect(html).not.toContain('Recovered mechanism');
    for (const conduit of conduits) expect(html).toContain(`assets/conduits/${conduit.id}.png`);
    for (const conduit of additionalCommonConduits) {
      expect(html).toContain(conduit.name);
      expect(html).toContain(`${conduit.price} Prismatica`);
      expect(html).toContain('Artwork pending');
      expect(html).not.toContain(`assets/conduits/${conduit.id}.png`);
    }
    expect(html).toContain('assets/banners/conduit-store.png');
    expect(conduits.map((entry) => entry.price)).toEqual([1000, 1200, 1000, 1500, 1200]);
    expect(conduits.map((entry) => entry.buff.amount)).toEqual([5, 5, 5, 2, 5]);
    expect(additionalCommonConduits.map((entry) => entry.price)).toEqual([1600, 1800, 1400, 1500, 1500]);
  });
  it('shows owned quantities, empty/error states and unaffordable disabled buttons', () => {
    const account = { ...emptyAccount(), conduits: { 'vigil-core': 2, 'bastion-lock': 0 } };
    expect(conduitInventory(account)).toContain('Owned 2');
    expect(conduitInventory(account)).not.toContain('Bastion Lock');
    expect(conduitInventory(emptyAccount())).toContain('No Conduits owned');
    expect(conduitInventory(null)).toContain('role="alert"');
    expect(conduitStore(emptyAccount()).match(/ disabled/g)).toHaveLength(15);
    expect(conduitStore(null)).toContain('Store unavailable');
  });
  it('belongs to Stores while retaining the contextual Character equipment route', () => {
    expect(isMenuPage('conduit-store')).toBe(true);
    expect(isMenuPage('stores')).toBe(true);
    expect(inventoryHub()).toContain('data-page="conduit-store"');
    expect(characterHub(starters[0], 'equipment')).toContain('data-page="conduit-store"');
    expect(characterHub(starters[0], 'equipment')).not.toContain('Artifact');
    expect(sanctuaryContext('conduit-store')).toBe('');
    expect(sanctuaryHeader('conduit-store', 0)).toContain('data-menu-back');
  });
});
