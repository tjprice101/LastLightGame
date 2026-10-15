// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { conduits, conduitEffect, getConduit, type ConduitId } from '../content/conduits';
import { emptyAccount, type Account } from '../game/account';
import { bindConduitUpgrades, conduitUpgradeMenu, updateConduitUpgradeMenu } from './conduit-upgrade';
import { bindSelectionPanels } from './selection-panel';
import { readableEffect } from './effect-copy';

afterEach(() => document.body.replaceChildren());

function fixture(account: Account = { ...emptyAccount(), mechanicalComponents: 1000,
  conduits: Object.fromEntries(conduits.map(conduit => [conduit.id, 1])) }) {
  const host = document.createElement('div');
  host.innerHTML = conduitUpgradeMenu(account);
  document.body.append(host);
  const write = vi.fn();
  const bind = () => bindConduitUpgrades(host, { getItem: () => null, setItem: write, removeItem: vi.fn() }, vi.fn(), vi.fn());
  bind();
  const ids = () => Array.from(host.querySelectorAll<HTMLElement>('[data-select-upgrade-conduit]'))
    .map(card => card.dataset.selectUpgradeConduit as ConduitId);
  const change = (selector: string, value: string, event = 'change') => {
    const control = host.querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    control.value = value;
    control.dispatchEvent(new Event(event, { bubbles: true }));
    return control;
  };
  const page = (direction = 1) => host.querySelector<HTMLButtonElement>(`[data-upgrade-page="${direction}"]`)!.click();
  return { host, account, write, bind, ids, change, page };
}

describe('owned Conduit upgrade catalog', () => {
  it('paginates all 85 real names exactly once with six small cards and no list scrollers', () => {
    const f = fixture();
    const before = structuredClone(f.account);
    expect(conduits).toHaveLength(85);
    expect(f.ids()).toHaveLength(6);
    expect(f.host.querySelector('.ref-scroll')).toBeNull();
    expect(f.host.querySelector<HTMLButtonElement>('[data-upgrade-page="-1"]')!.disabled).toBe(true);
    const seen = [...f.ids()];
    for (let index = 1; index < 15; index++) { f.page(); seen.push(...f.ids()); }
    expect(seen).toHaveLength(85);
    expect(new Set(seen).size).toBe(85);
    expect(seen).toEqual([...conduits].sort((a, b) => a.name.localeCompare(b.name)).map(conduit => conduit.id));
    expect(f.host.querySelector('.ref-upgrade-pagination span')!.textContent).toBe('85–85 of 85 · Page 15 / 15');
    expect(f.host.querySelector<HTMLButtonElement>('[data-upgrade-page="1"]')!.disabled).toBe(true);
    f.page(-1);
    expect(f.ids()).toHaveLength(6);
    expect(f.account).toEqual(before);
    expect(f.write).not.toHaveBeenCalled();
  });

  it('combines trimmed case-insensitive search, rarity, status and deterministic sorting', () => {
    const f = fixture({ ...emptyAccount(), mechanicalComponents: 25,
      conduits: { 'vigil-core': 1, 'siegebound-drive': 1, 'worldbreaker-drive': 1 },
      conduitUpgrades: { 'siegebound-drive': 5, 'worldbreaker-drive': 4 } });
    f.change('[data-upgrade-search]', '  DRIVE  ', 'input');
    expect(new Set(f.ids())).toEqual(new Set(['siegebound-drive', 'worldbreaker-drive']));
    f.change('[data-upgrade-rarity]', 'Legendary');
    expect(f.ids()).toEqual(['worldbreaker-drive']);
    f.change('[data-upgrade-status]', 'available');
    expect(f.ids()).toEqual([]);
    expect(f.host.textContent).toContain('No matching owned Conduits');
    expect(f.host.querySelector('.ref-upgrade-pagination span')!.textContent).toBe('0 of 0 · Page 1 / 1');
    expect(f.host.querySelector('[data-upgrade-card]')!.getAttribute('data-upgrade-card')).toBe('vigil-core');
    f.change('[data-upgrade-search]', '', 'input');
    f.change('[data-upgrade-rarity]', '');
    expect(f.ids()).toEqual(['vigil-core']);
    f.change('[data-upgrade-status]', 'maximum');
    expect(f.ids()).toEqual(['siegebound-drive']);
    f.change('[data-upgrade-status]', 'unfinished');
    expect(new Set(f.ids())).toEqual(new Set(['vigil-core', 'worldbreaker-drive']));
    f.change('[data-upgrade-status]', '');
    f.change('[data-upgrade-sort]', 'level');
    expect(f.ids()).toEqual(['siegebound-drive', 'worldbreaker-drive', 'vigil-core']);
    f.change('[data-upgrade-sort]', 'rarity');
    expect(f.ids()[0]).toBe('worldbreaker-drive');
    expect(f.write).not.toHaveBeenCalled();
  });

  it('retains filters, page, controls, selection, owned art and focus through account updates', () => {
    const f = fixture();
    f.change('[data-upgrade-rarity]', 'Common');
    f.change('[data-upgrade-sort]', 'level');
    f.page();
    const beforeIds = f.ids();
    const id = beforeIds[0];
    const card = f.host.querySelector<HTMLButtonElement>(`[data-select-upgrade-conduit="${id}"]`)!;
    const art = card.querySelector('img');
    const search = f.host.querySelector<HTMLInputElement>('[data-upgrade-search]')!;
    const rarity = f.host.querySelector('[data-upgrade-rarity]');
    const pager = f.host.querySelector('[data-upgrade-page="1"]');
    card.focus();
    updateConduitUpgradeMenu(f.host, { ...f.account, mechanicalComponents: 777 }, id);
    expect(f.ids()).toEqual(beforeIds);
    expect(f.host.querySelector('[data-upgrade-rarity]')).toBe(rarity);
    expect(f.host.querySelector('[data-upgrade-page="1"]')).toBe(pager);
    expect(f.host.querySelector(`[data-select-upgrade-conduit="${id}"]`)).toBe(card);
    expect(card.querySelector('img')).toBe(art);
    expect(card.getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(card);
    expect(f.host.querySelector('#mechanical-components-balance')!.textContent).toBe('777');
    search.focus();
    f.change('[data-upgrade-search]', 'NO MATCH <"', 'input');
    updateConduitUpgradeMenu(f.host, f.account);
    expect(search.value).toBe('NO MATCH <"');
    expect(document.activeElement).toBe(search);
    expect(f.host.querySelector('[data-upgrade-card]')!.getAttribute('data-upgrade-card')).toBe(id);
    expect(f.ids()).toHaveLength(0);
    expect(f.write).not.toHaveBeenCalled();
  });

  it('recalculates availability and clamps the page after changed holdings without duplicate binding', () => {
    const f = fixture();
    f.bind();
    f.page();
    expect(f.host.querySelector('.ref-upgrade-pagination span')!.textContent).toContain('Page 2 / 15');
    f.change('[data-upgrade-status]', 'available');
    updateConduitUpgradeMenu(f.host, { ...f.account, mechanicalComponents: 0 });
    expect(f.ids()).toHaveLength(0);
    updateConduitUpgradeMenu(f.host, f.account);
    expect(f.ids().every(id => getConduit(id).rarity !== 'Omnic')).toBe(true);
    f.change('[data-upgrade-status]', '');
    f.page();
    updateConduitUpgradeMenu(f.host, { ...f.account, conduits: { 'vigil-core': 1 } });
    expect(f.ids()).toEqual(['vigil-core']);
    expect(f.host.querySelector('.ref-upgrade-pagination span')!.textContent).toBe('1–1 of 1 · Page 1 / 1');
    updateConduitUpgradeMenu(f.host, emptyAccount());
    expect(f.host.textContent).toContain('No owned Conduits to upgrade');
    expect(f.ids()).toHaveLength(0);
    updateConduitUpgradeMenu(f.host, f.account, 'worldbreaker-drive');
    expect(f.host.querySelector('[data-upgrade-card]')!.getAttribute('data-upgrade-card')).toBe('worldbreaker-drive');
    updateConduitUpgradeMenu(f.host, null);
    expect(f.host.querySelector('[role="alert"]')!.textContent).toContain('Resolve the save error');
  });

  it('keeps resource navigation and restores upgrade-action focus, using status at the real cap', () => {
    const f = fixture({ ...emptyAccount(), mechanicalComponents: 1000, conduits: { 'vigil-core': 1 } });
    const resources = f.host.querySelector('.ref-upgrade-resources');
    const earn = f.host.querySelector('[data-machine-activity]');
    f.host.querySelector<HTMLButtonElement>('[data-upgrade-conduit]')!.focus();
    updateConduitUpgradeMenu(f.host, { ...f.account, conduitUpgrades: { 'vigil-core': 4 } });
    expect(document.activeElement).toBe(f.host.querySelector('[data-upgrade-conduit]'));
    expect(f.host.querySelector('.ref-upgrade-resources')).toBe(resources);
    expect(f.host.querySelector('[data-machine-activity]')).toBe(earn);
    expect(f.host.querySelectorAll('.ref-effect-progression article')).toHaveLength(6);
    expect(f.host.querySelector('[aria-current="step"]')!.textContent).toContain('+4');
    updateConduitUpgradeMenu(f.host, { ...f.account, conduitUpgrades: { 'vigil-core': 5 } });
    expect(document.activeElement).toBe(f.host.querySelector('#conduit-upgrade-result'));
    expect(f.host.querySelector<HTMLButtonElement>('[data-upgrade-conduit]')!.disabled).toBe(true);
    expect(f.host.querySelector('meter')).toBeNull();
    expect(f.host.textContent).not.toContain('Prismatica required');
  });

  it('shows complete upgraded mechanics at all six levels without falsely marking them immutable', () => {
    expect(conduits).toHaveLength(85);
    for (const conduit of conduits) {
      const root = document.createElement('div');
      root.innerHTML = conduitUpgradeMenu({ ...emptyAccount(), conduits: { [conduit.id]: 1 } }, conduit.id);
      expect(root.textContent).not.toContain('Special effect unchanged');
      expect(root.querySelector('.conduit-upgrade-values')!.textContent).toContain(readableEffect(conduitEffect(conduit, 0)));
      expect(root.querySelector('.conduit-upgrade-values')!.textContent).toContain(readableEffect(conduitEffect(conduit, 1)));
      const cards = root.querySelectorAll('.ref-effect-progression article');
      expect(cards).toHaveLength(6);
      Array.from(cards).forEach((card, level) => expect(card.querySelector('p')!.textContent).toBe(readableEffect(conduitEffect(conduit, level))));
      expect(root.querySelector('[data-expected-upgrade]')!.getAttribute('data-expected-upgrade')).toBe('0');
    }
  });

  it('preserves the shared selection-panel backing selects and triggers during updates', async () => {
    const f = fixture();
    const dispose = bindSelectionPanels(f.host);
    try {
      const select = f.host.querySelector<HTMLSelectElement>('[data-upgrade-sort]')!;
      const trigger = select.previousElementSibling;
      expect(trigger?.classList.contains('selection-trigger')).toBe(true);
      f.change('[data-upgrade-sort]', 'rarity');
      updateConduitUpgradeMenu(f.host, f.account);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(f.host.querySelector('[data-upgrade-sort]')).toBe(select);
      expect(select.previousElementSibling).toBe(trigger);
      expect(trigger!.textContent).toBe('Rarity highest');
      expect(f.ids().every(id => getConduit(id).rarity === 'Omnic')).toBe(true);
      expect(f.host.querySelectorAll('.selection-trigger')).toHaveLength(1);
    } finally { dispose(); }
  });

  it('uses accessible rarity/status pills, preserving chip focus and filters on refresh', () => {
    const f = fixture();
    const chip = f.host.querySelector<HTMLButtonElement>('[data-upgrade-rarity-chip="Common"]')!;
    const status = f.host.querySelector<HTMLButtonElement>('[data-upgrade-status-chip="available"]')!;
    expect(f.host.querySelectorAll('[data-upgrade-rarity-chip]')).toHaveLength(5);
    expect(f.host.querySelectorAll('[data-upgrade-status-chip]')).toHaveLength(4);
    chip.focus();
    chip.click();
    status.click();
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(status.getAttribute('aria-pressed')).toBe('true');
    expect(f.host.querySelector('[data-upgrade-rarity-chip=""]')!.getAttribute('aria-pressed')).toBe('false');
    expect(f.ids().every(id => getConduit(id).rarity === 'Common')).toBe(true);
    expect(f.host.querySelector<HTMLSelectElement>('[data-upgrade-rarity]')!.value).toBe('Common');
    chip.focus();
    updateConduitUpgradeMenu(f.host, { ...f.account, mechanicalComponents: 0 });
    expect(document.activeElement).toBe(chip);
    expect(f.host.querySelector('[data-upgrade-rarity-chip="Common"]')).toBe(chip);
    expect(f.ids()).toHaveLength(0);
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(status.getAttribute('aria-pressed')).toBe('true');
    expect(f.write).not.toHaveBeenCalled();
  });
});
