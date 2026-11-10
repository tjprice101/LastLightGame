// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { conduitStore } from './conduit-store';
import { conduitUpgradeMenu } from './conduit-upgrade';
import { onlineStores } from './online-store-profile';
import { bindShopHosts, setShopHostLine, shopHost } from './shop-host';

afterEach(() => document.body.replaceChildren());

describe('shop hosts', () => {
  it('places each original host on its actual destination, with neutral pending portrait art', () => {
    const account = emptyAccount();
    const destinations = [
      [onlineStores(account, null, 'materials'), 'mirel'],
      [onlineStores(account, null, 'cosmetics'), 'veylin'],
      [onlineStores(account, null, 'event-devourers'), 'nimra'],
      [conduitStore(account), 'torven'],
      [conduitStore(account, undefined, 'Calamitic'), 'sarev'],
      [conduitUpgradeMenu(account), 'edda'],
    ] as const;
    for (const [html, id] of destinations) {
      document.body.innerHTML = html;
      const panel = document.querySelector<HTMLElement>(`[data-shop-host="${id}"]`);
      expect(panel).not.toBeNull();
      expect(panel!.querySelector('img')).toBeNull();
      expect(panel!.querySelector('[role="img"]')?.getAttribute('aria-label')).toContain('portrait artwork pending');
      expect(panel!.querySelector<HTMLButtonElement>('[data-shop-talk]')?.getAttribute('aria-label')).toContain('Talk to');
      expect(panel!.querySelector('[data-shop-line]')?.getAttribute('aria-live')).toBe('polite');
    }
    expect(onlineStores(account, null, 'cosmetics')).toContain('Sign in when');
    expect(onlineStores(account, null, 'event-devourers')).toContain('purchases need an online sign-in');
    expect(conduitStore(account, undefined, 'Calamitic')).toContain('The seal opens after a Calamity tier');
  });

  it('cycles distinct idle lines without changing account data, spending or replacing the control', () => {
    const account = emptyAccount();
    const before = structuredClone(account);
    const root = document.createElement('div');
    root.innerHTML = shopHost('mirel');
    document.body.append(root);
    bindShopHosts(root);
    bindShopHosts(root);
    const button = root.querySelector<HTMLButtonElement>('[data-shop-talk]')!;
    const output = root.querySelector<HTMLElement>('[data-shop-line]')!;
    button.focus();
    button.click(); const first = output.textContent;
    button.click(); const second = output.textContent;
    button.click(); const third = output.textContent;
    expect(new Set([first, second, third]).size).toBe(3);
    button.click();
    expect(output.textContent).toBe(first);
    expect(document.activeElement).toBe(button);
    expect(account).toEqual(before);
    setShopHostLine(root, 'mirel', 'inspect');
    expect(output.textContent).toContain('quantity');
    setShopHostLine(root, 'mirel', 'cancel');
    expect(output.textContent).toContain('No rush');
    setShopHostLine(root, 'mirel', 'saved');
    expect(output.textContent).toContain('Packed and accounted');
  });
});
