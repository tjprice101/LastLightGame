// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getStarter } from '../content/starters';
import { characterName } from '../content/character-art';
import { emptyAccount, ownedProgress, ascendCharacter, saveAccount, type Account } from '../game/account';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';
import { ascensionEntry, ascensionContents, openCalamiticAscension } from './calamitic-ascension';
import { celebrateAscension } from './upgrade-celebration';
import { characterDetail } from './hub';

vi.mock('./upgrade-celebration', () => ({ celebrateAscension: vi.fn(() => vi.fn()) }));
const starter = getStarter('ember');
let account: Account;
let storage: ProfileStorage;
let writes: number;
const click = (selector: string): void => { document.querySelector<HTMLButtonElement>(selector)!.click(); };
const settle = async (): Promise<void> => { await Promise.resolve(); await Promise.resolve(); };

beforeEach(() => {
  vi.clearAllMocks();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
  HTMLElement.prototype.scrollIntoView = vi.fn();
  account = emptyAccount();
  account.characters.ember = { level: 105, evolution: 6 };
  account.materials['shard-of-calamity'] = 100;
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { writes++; values.set(key, value); }, removeItem: key => { values.delete(key); } };
  saveAccount(storage, account);
  writes = 0;
  document.body.innerHTML = ascensionEntry(starter, account, ownedProgress(account, 'ember'));
  document.querySelector<HTMLButtonElement>('[data-calamitic-ascension]')!.focus();
});
afterEach(() => {
  document.querySelector<HTMLButtonElement>('.ascension-close')?.click();
  document.body.innerHTML = '';
});
function launch(transact = async (step: Parameters<typeof ascendCharacter>[2], expected: Parameters<typeof ascendCharacter>[3]) => {
  account = ascendCharacter(storage, 'ember', step, expected);
}, refresh: () => void = vi.fn()): void {
  document.querySelector('[data-calamitic-ascension]')!.addEventListener('click', () => openCalamiticAscension(starter, () => account, transact, refresh));
  click('[data-calamitic-ascension]');
}

describe('Calamitic Ascension presentation', () => {
  it('hides the entry entirely below the final form cap, without teaser copy', () => {
    account.characters.ember = { level: 104, evolution: 6 };
    expect(ascensionEntry(starter, account, account.characters.ember)).toBe('');
    expect(characterDetail(starter, 'upgrade-0', account)).not.toContain('Calamitic Ascension');
    account.characters.ember = { level: 105, evolution: 5 };
    expect(ascensionEntry(starter, account, account.characters.ember)).toBe('');
  });
  it('shows eligible characters and retains the entry after all four steps', () => {
    expect(ascensionEntry(starter, account, account.characters.ember)).toContain('0/4');
    account.characters.ember = { level: 115, evolution: 6, ascension: { stats: true, skill1: true, skill2: true, lastFlare: true } };
    expect(ascensionEntry(starter, account, account.characters.ember)).toContain('<small>Ascended</small>');
  });
  it('opens a native modal from the entry and shows only Ascend initially', () => {
    launch();
    expect(document.querySelector('dialog[open]')).not.toBeNull();
    expect(document.querySelectorAll('[data-ascension-step]')).toHaveLength(1);
    expect(document.querySelector('.ascension-hero img')).not.toBeNull();
    expect(document.body.textContent).not.toMatch(/before|Requires|unlock/i);
    expect(writes).toBe(0);
  });
  it('reveals actual ability names and icons only after stats are saved', () => {
    account.characters.ember!.ascension = { stats: true };
    const html = ascensionContents(starter, account);
    expect(html).toContain('Cinder Cleave');
    expect(html).toContain('Flame Arc');
    expect(html).toContain('Last Flare: Dawnfire');
    expect(html).toContain('infernis-cinder-cleave.png');
    expect(html).not.toContain('Requires');
    expect(html).not.toContain('before');
  });
  it('shows insufficient funds without attempting a transaction', () => {
    account.materials['shard-of-calamity'] = 24;
    const transact = vi.fn();
    launch(transact);
    expect(document.querySelector<HTMLButtonElement>('[data-ascension-select]')!.disabled).toBe(true);
    expect(document.body.textContent).toContain('Not enough Shards');
    click('[data-ascension-select]');
    expect(transact).not.toHaveBeenCalled();
  });
  it('confirms, atomically saves once, refreshes states in place, then celebrates', async () => {
    const refresh = vi.fn(() => { expect(writes).toBe(1); expect(celebrateAscension).not.toHaveBeenCalled(); });
    launch(undefined, refresh);
    const dialog = document.querySelector('dialog');
    click('[data-ascension-select="stats"]');
    expect(document.activeElement).toBe(document.querySelector('[data-ascension-cancel]'));
    expect(writes).toBe(0);
    click('[data-ascension-confirm]');
    click('[data-ascension-confirm]');
    await settle();
    expect(writes).toBe(1);
    expect(refresh).toHaveBeenCalledOnce();
    expect(document.querySelector('dialog')).toBe(dialog);
    expect(document.querySelectorAll('[data-ascension-step]')).toHaveLength(4);
    expect(document.querySelector('[data-ascension-step="stats"]')!.textContent).toContain('Done');
    expect(document.querySelector('[data-ascension-shards]')!.textContent).toBe('75');
    expect(document.querySelector('.ascension-hero h2')!.textContent).toBe(characterName('ember', 6, true));
    expect(document.querySelector('.ascension-result')!.textContent).toBe('Ascended');
    expect(celebrateAscension).toHaveBeenCalledWith(dialog, starter, 'stats', account.characters.ember);
  });
  it('imbues the chosen skill and updates its Done state after saving', async () => {
    account.characters.ember!.ascension = { stats: true };
    saveAccount(storage, account); writes = 0;
    launch(); click('[data-ascension-select="skill1"]'); click('[data-ascension-confirm]'); await settle();
    expect(writes).toBe(1);
    expect(document.querySelector('[data-ascension-step="skill1"]')!.textContent).toContain('Done');
    expect(document.querySelector('.ascension-result')!.textContent).toBe('Cinder Cleave imbued');
  });
  it('does not celebrate or reveal imbues when persistence fails', async () => {
    storage.setItem = () => { throw new Error('Storage unavailable'); };
    launch(); click('[data-ascension-select="stats"]'); click('[data-ascension-confirm]'); await settle();
    expect(celebrateAscension).not.toHaveBeenCalled();
    expect(document.querySelectorAll('[data-ascension-step]')).toHaveLength(1);
    expect(document.querySelector('.ascension-result')!.textContent).not.toBe('');
    expect(document.querySelector('[data-ascension-shards]')!.textContent).toBe('100');
  });
  it('wraps Tab and Shift-Tab within visible enabled modal controls', () => {
    launch();
    const dialog = document.querySelector('dialog')!;
    const first = document.querySelector<HTMLButtonElement>('.ascension-close')!;
    const last = document.querySelector<HTMLButtonElement>('[data-ascension-select]')!;
    last.focus();
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(first);
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(last);
  });
  it('cancels confirmation on Escape and restores focus on modal dismissal', () => {
    const entry = document.activeElement;
    launch(); click('[data-ascension-select="stats"]');
    document.querySelector('dialog')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector<HTMLElement>('.ascension-confirm')!.hidden).toBe(true);
    expect(document.querySelector('dialog[open]')).not.toBeNull();
    document.querySelector('dialog')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(entry);
    expect(writes).toBe(0);
  });
  it('restores focus to the refreshed entry and disposes saved feedback on close', async () => {
    launch(undefined, () => {
      document.querySelector('[data-calamitic-ascension]')!.outerHTML = ascensionEntry(starter, account, account.characters.ember);
    });
    click('[data-ascension-select="stats"]'); click('[data-ascension-confirm]'); await settle();
    const cleanup = vi.mocked(celebrateAscension).mock.results[0].value;
    click('.ascension-close');
    expect(cleanup).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(document.querySelector('[data-calamitic-ascension]'));
  });
});
