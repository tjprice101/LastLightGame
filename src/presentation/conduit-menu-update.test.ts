// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { conduitStore, updateConduitStore } from './conduit-store';
import { conduitUpgradeMenu, updateConduitUpgradeMenu } from './conduit-upgrade';

describe('Conduit panel updates', () => {
  const account = { ...emptyAccount(), fractalis: 10000, mechanicalComponents: 1000,
    conduits: { 'vigil-core': 1, 'siegebound-drive': 1 } };

  function host(content: string): HTMLElement {
    const root = document.createElement('div');
    root.innerHTML = `<header>Retained header</header><main>${content}</main>`;
    return root;
  }

  it('retains the screen, catalog, art, focus and scroll when selecting a Store item', () => {
    const root = host(conduitStore(account));
    document.body.replaceChildren(root);
    const header = root.querySelector('header');
    const menu = root.querySelector('.ref-conduit-store');
    const catalog = root.querySelector('.ref-store-catalog');
    const card = root.querySelector<HTMLButtonElement>('[data-store-conduit="siegebound-drive"]')!;
    const art = card.querySelector('img');
    const scroll = root.querySelector<HTMLElement>('.ref-store-catalog .ref-scroll')!;
    scroll.scrollTop = 123;
    card.focus();
    updateConduitStore(root, account, 'siegebound-drive');
    expect(root.querySelector('header')).toBe(header);
    expect(root.querySelector('.ref-conduit-store')).toBe(menu);
    expect(root.querySelector('.ref-store-catalog')).toBe(catalog);
    expect(card.querySelector('img')).toBe(art);
    expect(document.activeElement).toBe(card);
    expect(scroll.scrollTop).toBe(123);
    expect(card.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-store-conduit="vigil-core"]')?.getAttribute('aria-pressed')).toBe('false');
    expect(root.querySelector('[data-buy-conduit]')?.getAttribute('data-buy-conduit')).toBe('siegebound-drive');
  });

  it('refreshes holdings and affordability after a saved purchase without rebuilding the catalog', () => {
    const root = host(conduitStore(account));
    const card = root.querySelector('[data-store-conduit="vigil-core"]');
    updateConduitStore(root, { ...account, fractalis: 0, conduits: { ...account.conduits, 'vigil-core': 2 } }, 'vigil-core');
    expect(root.querySelector('[data-store-conduit="vigil-core"]')).toBe(card);
    expect(card?.querySelector('.ref-chip')?.textContent).toBe('Owned 2');
    expect(root.querySelector<HTMLButtonElement>('[data-buy-conduit]')?.disabled).toBe(true);
  });

  it('updates a rarity filter without replacing its controls or the menu', () => {
    const root = host(conduitStore(account));
    const menu = root.querySelector('.ref-conduit-store');
    const filter = root.querySelector('[data-store-rarity="Common"]');
    updateConduitStore(root, account, 'vigil-core', 'Common');
    expect(root.querySelector('.ref-conduit-store')).toBe(menu);
    expect(root.querySelector('[data-store-rarity="Common"]')).toBe(filter);
    expect(filter?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelectorAll('[data-store-conduit]')).toHaveLength(10);
  });

  it('retains the owned list and resource panel while updating selected upgrade actions', () => {
    const root = host(conduitUpgradeMenu(account));
    const row = root.querySelector('[data-select-upgrade-conduit="siegebound-drive"]');
    const resource = root.querySelector('.ref-upgrade-resources');
    const info = root.querySelector('.ref-upgrade-information');
    const earn = root.querySelector('[data-machine-activity]');
    updateConduitUpgradeMenu(root, account, 'siegebound-drive');
    expect(root.querySelector('[data-select-upgrade-conduit="siegebound-drive"]')).toBe(row);
    expect(root.querySelector('.ref-upgrade-resources')).toBe(resource);
    expect(root.querySelector('.ref-upgrade-information')).toBe(info);
    expect(root.querySelector('[data-machine-activity]')).toBe(earn);
    expect(row?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-upgrade-card]')?.getAttribute('data-upgrade-card')).toBe('siegebound-drive');
    expect(root.querySelector('[data-upgrade-conduit]')?.getAttribute('data-upgrade-conduit')).toBe('siegebound-drive');
    updateConduitUpgradeMenu(root, { ...account, conduitUpgrades: { 'siegebound-drive': 5 } }, 'siegebound-drive');
    expect(row?.querySelector('[data-conduit-upgrade]')?.getAttribute('data-conduit-upgrade')).toBe('5');
    expect(root.querySelector<HTMLButtonElement>('[data-upgrade-conduit]')?.disabled).toBe(true);
  });

  it('reports missing panels instead of silently claiming an update', () => {
    expect(() => updateConduitStore(document.createElement('div'), account)).toThrow('Conduit Store is missing');
    expect(() => updateConduitUpgradeMenu(document.createElement('div'), account)).toThrow('Conduit Upgrade is missing');
  });
});
