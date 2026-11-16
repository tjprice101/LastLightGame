// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { additionalCommonConduits, commonConduits as conduits, conduits as allConduits } from '../content/conduits';
import { radiantConduitEffectText } from '../content/conduit-effect-text';
import { emptyAccount } from '../game/account';
import { conduitStore, conduitInventory, conduitDetails, conduitLore } from './conduit-store';
import { masterConduits } from '../content/master-conduits';
import { masterReference } from './master-conduits';
import { inventoryHub, characterHub } from './hub';
import { starters } from '../content/starters';
import { isMenuPage, sanctuaryContext, sanctuaryHeader } from './sanctuary';
import { readableEffect } from './effect-copy';
import { bindMenuPagination } from './menu-pagination';

describe('Conduit Store and discovery routes', () => {
  it('shows the current maximum effect once and retains acquisition information outside the Store', () => {
    const account = { ...emptyAccount(), conduits: { 'vigil-core': 1 }, conduitUpgrades: { 'vigil-core': 5 } };
    const host = document.createElement('div');
    host.innerHTML = conduitStore(account, 'vigil-core');
    const detail = host.querySelector('.ref-store-detail .info-catalog')!;
    expect(detail.querySelectorAll('.info-effects li')).toHaveLength(1);
    expect(detail.textContent).toContain('Maximum:');
    expect(detail.querySelector('.info-acquisition')).toBeNull();
    host.innerHTML = conduitDetails('vigil-core', 5);
    expect(host.querySelector('.info-acquisition')).not.toBeNull();
  });
  it('keeps upgrade navigation outside the Store and pages the complete catalog', () => {
    const host = document.createElement('div');
    host.innerHTML = conduitStore(emptyAccount());
    bindMenuPagination(host);
    expect(host.querySelector('[data-page="conduit-upgrade"]')).toBeNull();
    const panel = host.querySelector<HTMLElement>('.ref-store-catalog')!;
    const seen = new Set<string>();
    for (let page = 1; page <= 5; page++) {
      expect(panel.querySelector('[data-menu-page-status]')?.textContent).toBe(`${page} / 5`);
      const cards = Array.from(panel.querySelectorAll<HTMLElement>('[data-store-conduit]:not([hidden])'));
      expect(cards).toHaveLength(2);
      cards.forEach(card => seen.add(card.dataset.storeConduit!));
      if (page < 5) panel.querySelector<HTMLButtonElement>('[data-menu-page="1"]')!.click();
    }
    expect(seen.size).toBe(10);
    expect(panel.querySelector<HTMLButtonElement>('[data-menu-page="1"]')!.disabled).toBe(true);
  });
  it('keeps all Conduit lore collapsed while effects remain outside the disclosure', () => {
    const host = document.createElement('div');
    for (const entry of [...allConduits, ...masterConduits]) {
      host.innerHTML = 'buffs' in entry ? conduitDetails(entry.id) : masterReference(entry.id);
      const lore = host.querySelector<HTMLDetailsElement>('details.conduit-lore-disclosure')!;
      expect(lore.open).toBe(false);
      expect(lore.querySelector('summary')?.textContent).toBe('Lore');
      expect(lore.textContent).toContain(entry.lore);
      expect(host.querySelector('.info-effects')).not.toBeNull();
      expect(lore.querySelector('dd')).toBeNull();
      lore.open = true;
      expect(lore.open).toBe(true);
      expect(lore.querySelector('.conduit-lore')?.textContent).toContain(entry.lore);
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
      expect(html).toContain(readableEffect(radiantConduitEffectText(conduit.id)));
      expect(html).toContain(`${conduit.price?.toLocaleString('en-US')} Prismatica`);
    }
    expect(html).not.toContain('Elemental Light core');
    expect(html).not.toContain('Mechanical drive');
    expect(html).toContain('Unlock once');
    expect(html).toContain('data-information="store-information"');
    expect(html).not.toContain('Recovered mechanism');
    for (const conduit of conduits) expect(html).toContain(`assets/conduits/${conduit.id}.png`);
    for (const conduit of additionalCommonConduits) {
      expect(html).toContain(conduit.name);
      expect(html).toContain(`${conduit.price?.toLocaleString('en-US')} Prismatica`);
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
    expect(sanctuaryHeader('conduit-store', 0).match(/data-menu-back/g)).toHaveLength(1);
  });
});
