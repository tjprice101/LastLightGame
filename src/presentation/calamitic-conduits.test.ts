// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { calamiticConduits, calamiticLockMessage } from '../content/calamitic-conduits';
import { emptyAccount, type Account } from '../game/account';
import { conduitStore, updateConduitStore, conduitDetails, conduitIcon } from './conduit-store';
import { onlineStores } from './online-store-profile';
import { inventoryView } from './inventory';
import { archives } from './archives';
import { conduitUpgradeMenu } from './conduit-upgrade';
import { calamityLoot, calamityOpeningReward } from './calamity';
import { rollCalamityChest } from '../content/calamity';
import { conduitStatuses } from './conduit-status';
import { currencyIcon, currencyArt } from './currency-icon';

afterEach(() => { document.body.replaceChildren(); });
const first = calamiticConduits[0].id;
function unlocked(): Account {
  return { ...emptyAccount(), calamityClears: { oceanic: 1 }, calamiticTokens: 100 };
}
function render(html: string): HTMLDivElement {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.append(host);
  return host;
}

describe('Calamitic market and shared surfaces', () => {
  it('always exposes the market destination, but reveals only the exact locked message', () => {
    for (const tab of ['materials', 'cosmetics'] as const)
      expect(onlineStores(emptyAccount(), null, tab)).toContain('data-market-calamitic');
    for (const account of [null, emptyAccount(), { ...emptyAccount(), normalFinalClears: { machines: true } }]) {
      const before = structuredClone(account);
      const host = render(conduitStore(account, first, 'Calamitic'));
      const lock = host.querySelector('.calamitic-store-lock')!;
      expect(lock.textContent).toBe(calamiticLockMessage);
      expect(host.querySelectorAll('[data-buy-conduit], [data-store-conduit], dialog')).toHaveLength(0);
      expect(host.textContent).not.toMatch(/beat|defeat|unlock|EX\+|Tokens|100|Artwork pending/i);
      for (const design of calamiticConduits) expect(host.textContent).not.toContain(design.name);
      expect(account).toEqual(before);
      host.remove();
    }
  });

  it('shows five universal pending-art creations after any recorded EX clear and prevents duplicate purchases', () => {
    const account = unlocked();
    const host = render(conduitStore(account, first, 'Calamitic'));
    expect(host.querySelectorAll('[data-store-conduit]')).toHaveLength(5);
    expect(host.textContent).toContain('Universal');
    expect(host.textContent).toContain('100 Calamitic Tokens');
    expect(host.querySelector<HTMLButtonElement>('[data-buy-conduit]')!.disabled).toBe(false);
    expect(host.querySelectorAll('img')).toHaveLength(0);
    updateConduitStore(host, { ...account, calamiticTokens: 0, conduits: { [first]: 1 } }, first, 'Calamitic');
    expect(host.querySelector<HTMLButtonElement>('[data-buy-conduit]')!.disabled).toBe(true);
    expect(host.querySelector('[data-buy-conduit]')!.textContent).toBe('Owned');
    expect(host.querySelector(':scope > section > aside')!.textContent).toContain('0 Calamitic Tokens');
    expect(host.textContent).not.toContain('Not enough Calamitic Tokens.');
  });

  it('updates locked/ordinary/Calamitic modes without exposing stale products or losing the selector', () => {
    const host = render(conduitStore(emptyAccount()));
    expect(host.querySelectorAll('[data-store-conduit]')).toHaveLength(10);
    updateConduitStore(host, emptyAccount(), first, 'Calamitic');
    expect(host.querySelectorAll('[data-store-conduit]')).toHaveLength(0);
    expect(host.querySelector('.calamitic-store-lock')!.textContent).toBe(calamiticLockMessage);
    updateConduitStore(host, unlocked(), first, 'Calamitic');
    expect(host.querySelectorAll('[data-store-conduit]')).toHaveLength(5);
    updateConduitStore(host, unlocked());
    expect(host.querySelectorAll('[data-store-conduit]')).toHaveLength(10);
    expect(host.querySelector('[data-store-rarity="Calamitic"]')).not.toBeNull();
  });

  it('carries the real currency, rarity, costs and acquisition into Inventory, Collections and Upgrade', () => {
    const account = { ...unlocked(), conduits: { [first]: 1 } };
    const inventory = render(inventoryView(account));
    expect(inventory.querySelector('[aria-label="Calamitic Tokens balance"]')!.textContent).toContain('100');
    expect(inventory.querySelector('option[value="Calamitic"]')).not.toBeNull();
    const upgrade = render(conduitUpgradeMenu(account, first));
    expect(upgrade.querySelector('[data-upgrade-rarity-chip="Calamitic"]')).not.toBeNull();
    expect(upgrade.textContent).toContain('10000 / 20000 / 40000 / 70000 / 100000');
    expect(conduitDetails(first)).toContain("Rise's Conduit Store");
    expect(conduitDetails(first)).not.toContain('Awaken the Machines drop');
    expect(conduitIcon(first)).not.toContain('<img');
    expect(archives(emptyAccount(), 'conduits')).not.toContain(first);
    expect(archives(account, 'conduits')).toContain(first);
    expect(currencyIcon('calamitic-tokens')).not.toContain('<img');
    expect(() => currencyArt('calamitic-tokens')).toThrow('not been delivered');
  });

  it('shows exact tokens in every tier preview and in the saved opening receipt', () => {
    for (const [tier, tokens] of [[1, 1], [2, 3], [3, 8]] as const) {
      const preview = render(calamityLoot('machines', tier));
      const row = Array.from(preview.querySelectorAll('li')).find(row => row.textContent?.includes('Calamitic Tokens'));
      expect(row?.querySelector('strong')?.textContent).toBe(String(tokens));
      const reward = rollCalamityChest('machines', tier, () => 0);
      expect(calamityOpeningReward(`calamity:machines:${tier}`, reward).details).toContain(`${tokens} Calamitic Tokens`);
    }
  });

  it('reports actual resources and owed turns with no invented status icon URLs', () => {
    const html = conduitStatuses({ numbers: { calamiticOrrery: 123, calamiticDebt: 80, calamiticDebtDue: 3,
      calamiticThroneArmed: 2, calamiticThroneSkip: 3, calamiticEquation: 5 }, owners: {} }, 2);
    expect(html).toContain('123 force');
    expect(html).toContain('80 HP');
    expect(html).toContain('enemy phase 3');
    expect(html).toContain('player turn 3');
    expect(html).toContain('2 / 3 different actions');
    expect(html).not.toContain('<img');
  });
});
