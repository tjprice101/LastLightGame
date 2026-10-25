// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { machineLootFocus, bindMachineLootFocus } from './machine-loot-focus';
import { conduits } from '../content/conduits';
import { machineFocusRarities } from '../content/machines';
import { emptyAccount } from '../game/account';
import { bindInformation } from './information';
import { creatureGlossary, bindCreatureGlossary } from './creature-glossary';
import { formatStat } from '../content/combat';

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });
function mount(account = emptyAccount()) {
  const host = document.createElement('main');
  host.innerHTML = machineLootFocus(account);
  document.body.append(host);
  return host;
}
describe('Machines Focus Loot screen', () => {
  it('offers every eligible name with full Details and no Master, Common or Calamitic controls', () => {
    const account = emptyAccount();
    const owned = conduits.find(entry => entry.rarity === 'Rare')!;
    account.conduits = { [owned.id]: 1 };
    const before = structuredClone(account), host = mount(account);
    const eligible = conduits.filter(entry => machineFocusRarities.some(rarity => rarity === entry.rarity));
    expect(host.querySelectorAll('[data-focus-conduit]')).toHaveLength(eligible.length);
    for (const entry of eligible) {
      const button = host.querySelector<HTMLButtonElement>(`[data-focus-conduit="${entry.id}"]`)!;
      expect(button.disabled).toBe(entry.id === owned.id);
      expect(host.querySelector(`[id="focus-details-${entry.id}"]`)?.textContent).toContain(entry.name);
    }
    expect(host.textContent).toContain('Masters cannot be focused');
    expect(account).toEqual(before);
    const ids = Array.from(host.querySelectorAll('[id]')).map(node => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('switches rarity tabs without writes and opens nested Details', () => {
    const host = mount(), save = vi.fn(), error = vi.fn();
    bindMachineLootFocus(host, save, error);
    bindInformation(host);
    host.querySelector<HTMLButtonElement>('[data-focus-tier="Omnic"]')!.click();
    expect(host.querySelector<HTMLElement>('[data-focus-panel="Omnic"]')!.hidden).toBe(false);
    expect(host.querySelector<HTMLElement>('[data-focus-panel="Rare"]')!.hidden).toBe(true);
    const opener = host.querySelector<HTMLButtonElement>('[data-focus-panel="Omnic"] [data-information]')!;
    const details = document.getElementById(opener.dataset.information!) as HTMLDialogElement;
    details.showModal = vi.fn();
    opener.click();
    expect(details.showModal).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
  });
  it('saves, replaces and clears a focus while retaining Details and the active rarity', async () => {
    const account = emptyAccount(), host = mount(account);
    const entry = conduits.find(entry => entry.rarity === 'Legendary')!;
    const save = vi.fn(async (rarity, id) => {
      account.machineLootFocus = id ? { [rarity]: id } : {};
      return account;
    });
    bindMachineLootFocus(host, save, vi.fn());
    host.querySelector<HTMLButtonElement>('[data-focus-tier="Legendary"]')!.click();
    host.querySelector<HTMLButtonElement>(`[data-focus-conduit="${entry.id}"]`)!.click();
    await vi.waitFor(() => expect(host.querySelector('.machine-focus-status')!.textContent).toContain('saved'));
    expect(save).toHaveBeenCalledWith('Legendary', entry.id);
    expect(host.querySelector<HTMLElement>('[data-focus-panel="Legendary"]')!.hidden).toBe(false);
    expect(host.querySelector<HTMLButtonElement>(`[data-focus-conduit="${entry.id}"]`)!.textContent).toBe('Focused');
    expect(host.querySelector(`[id="focus-details-${entry.id}"]`)).not.toBeNull();
    host.querySelector<HTMLButtonElement>('[data-clear-loot-focus="Legendary"]')!.click();
    await vi.waitFor(() => expect(host.querySelector('.machine-focus-status')!.textContent).toContain('cleared'));
    expect(save).toHaveBeenLastCalledWith('Legendary', null);
  });
  it('locks pending edits and restores controls after an explicitly reported save failure', async () => {
    const host = mount(), failed = new Error('Storage denied'), error = vi.fn();
    let reject!: (error: Error) => void;
    const save = vi.fn(() => new Promise<ReturnType<typeof emptyAccount>>((_, fail) => { reject = fail; }));
    bindMachineLootFocus(host, save, error);
    const entry = conduits.find(entry => entry.rarity === 'Rare')!;
    const button = host.querySelector<HTMLButtonElement>(`[data-focus-conduit="${entry.id}"]`)!;
    button.click(); button.click();
    expect(save).toHaveBeenCalledOnce();
    expect(host.querySelector('.machine-focus-body')?.getAttribute('aria-busy')).toBe('true');
    reject(failed);
    await vi.waitFor(() => expect(error).toHaveBeenCalledWith(failed));
    expect(host.querySelector('.machine-focus-status')!.textContent).toContain('could not be confirmed');
    expect(button.disabled).toBe(false);
    expect(host.querySelector('.machine-focus-body')!.hasAttribute('aria-busy')).toBe(false);
    expect(document.activeElement).toBe(button);
  });
  it('disables editing for an unavailable account', () => {
    const host = document.createElement('main');
    host.innerHTML = machineLootFocus(null);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('unavailable');
    expect(Array.from(host.querySelectorAll<HTMLButtonElement>('[data-focus-conduit], [data-clear-loot-focus]')).every(button => button.disabled)).toBe(true);
  });
  it('keeps baseline per-name chances in Collections despite focus on render and stage changes', () => {
    const account = emptyAccount();
    const entry = conduits.find(entry => entry.rarity === 'Rare')!;
    account.machineLootFocus = { Rare: entry.id };
    account.creatures = { 'infusion:machines:0': { defeated: true } };
    const host = document.createElement('main');
    host.innerHTML = creatureGlossary(account);
    document.body.append(host);
    bindCreatureGlossary(host);
    const check = () => {
      const rows = Array.from(host.querySelectorAll('tbody tr'));
      for (const conduit of conduits.filter(entry => entry.rarity === 'Rare')) {
        const row = rows.find(row => row.textContent?.includes(`${conduit.name} · Rare`))!;
        expect(row.children[2].textContent).toBe(`${formatStat(8 / conduits.filter(entry => entry.rarity === 'Rare').length)}%`);
      }
    };
    check();
    const select = host.querySelector<HTMLSelectElement>('[data-loot-stage]')!;
    select.value = '5'; select.dispatchEvent(new Event('change', { bubbles: true }));
    check();
  });
});
