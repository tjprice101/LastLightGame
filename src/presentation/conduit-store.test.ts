// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { additionalCommonConduits, commonConduits as conduits, conduits as allConduits } from '../content/conduits';
import { emptyAccount } from '../game/account';
import { conduitStore, conduitInventory, conduitDetails, conduitLore } from './conduit-store';
import { masterConduits } from '../content/master-conduits';
import { masterReference } from './master-conduits';
import { inventoryHub, characterHub } from './hub';
import { starters } from '../content/starters';
import { isMenuPage, sanctuaryContext, sanctuaryHeader } from './sanctuary';
import { referencedEffect } from './effect-copy';

describe('Conduit Store and discovery routes', () => {
  it('keeps all Conduit lore collapsed while effects remain outside the disclosure', () => {
    const host = document.createElement('div');
    for (const entry of [...allConduits, ...masterConduits]) {
      host.innerHTML = 'buffs' in entry ? conduitDetails(entry.id) : masterReference(entry.id);
      const lore = host.querySelector<HTMLDetailsElement>('details.conduit-lore-disclosure')!;
      expect(lore.open).toBe(false);
      expect(lore.querySelector('summary')?.textContent).toBe('Lore');
      expect(lore.textContent).toContain(entry.lore);
      expect(host.querySelector('dd, .master-reference > p')).not.toBeNull();
      expect(lore.querySelector('dd')).toBeNull();
      lore.open = true;
      expect(lore.open).toBe(true);
      expect(lore.querySelector('.conduit-lore')?.textContent).toBe(entry.lore);
    }
    host.innerHTML = conduitStore({ ...emptyAccount(), fractalis: 10000 });
    expect(host.querySelector<HTMLDetailsElement>('.ref-store-detail details')?.open).toBe(false);
    expect(host.querySelector('.ref-store-detail .conduit-lore')?.closest('details')).not.toBeNull();
    expect(conduitLore('<test> & lore')).toContain('&lt;test&gt; &amp; lore');
  });

  it('retains all ten original Common Store mechanisms after the Omnic replacements', () => {
    const html = conduitStore({ ...emptyAccount(), fractalis: 10000 });
    expect(html.match(/data-store-conduit=/g)).toHaveLength(10);
    expect(html.match(/data-buy-conduit=/g)).toHaveLength(1);
    expect(html).not.toContain('disabled');
    for (const conduit of conduits) {
      expect(conduit.rarity).toBe('Common');
      expect(html).toContain(conduit.name);
      expect(html).toContain(referencedEffect(conduit.effect));
      expect(html).toContain(`${conduit.price} Prismatica`);
    }
    expect(html).not.toContain('Elemental Light core');
    expect(html).not.toContain('Mechanical drive');
    expect(html).toContain('One copy unlocks a Conduit for every Element-Bearer');
    expect(html).toContain('data-information="store-information"');
    expect(html).not.toContain('Recovered mechanism');
    for (const conduit of conduits) expect(html).toContain(`assets/conduits/${conduit.id}.png`);
    for (const conduit of additionalCommonConduits) {
      expect(html).toContain(conduit.name);
      expect(html).toContain(`${conduit.price} Prismatica`);
      expect(html).toContain(`assets/conduits/${conduit.id}.png`);
    }
    expect(html).toContain('ref-store-detail');
    expect(conduits.map((entry) => entry.price)).toEqual([1000, 1200, 1000, 1500, 1200]);
    expect(conduits.map(entry => entry.buffs.map(buff => buff.amount))).toEqual([[6], [], [10], [], [10]]);
    expect(additionalCommonConduits.map((entry) => entry.price)).toEqual([1600, 1800, 1400, 1500, 1500]);
  });
  it('shows owned quantities, empty/error states and unaffordable disabled buttons', () => {
    const account = { ...emptyAccount(), conduits: { 'vigil-core': 2, 'bastion-lock': 0 } };
    expect(conduitInventory(account)).toContain('Owned 2');
    expect(conduitInventory(account)).not.toContain('Bastion Lock');
    expect(conduitInventory(emptyAccount())).toContain('No Conduits owned');
    expect(conduitInventory(null)).toContain('role="alert"');
    expect(conduitStore(emptyAccount()).match(/ disabled/g)).toHaveLength(1);
    expect(conduitStore(null)).toContain('Store unavailable');
  });
  it('belongs to Stores while retaining the contextual Character equipment route', () => {
    expect(isMenuPage('conduit-store')).toBe(true);
    expect(isMenuPage('stores')).toBe(true);
    expect(inventoryHub()).not.toContain('data-page="conduit-store"');
    expect(characterHub(starters[0], 'equipment')).toContain('data-page="conduit-store"');
    expect(characterHub(starters[0], 'equipment')).not.toContain('Artifact');
    expect(sanctuaryContext('conduit-store')).toBe('');
    expect(sanctuaryHeader('conduit-store', 0)).not.toContain('data-menu-back');
  });
});
