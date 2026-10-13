// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TitleScreen } from './title-screen';
import { OfflineSavePanel } from './offline-save-panel';
import { OnlineAccountDialog } from './online-account-dialog';
import { PlayerSaveData, PlayerInfoScreen } from './player-save-data';
import { emptyAccount, ACCOUNT_KEY } from '../game/account';
import { SAVE_KEY } from '../game/profile';
import { loadOfflineSave, PENDING_IMPORT_KEY } from '../game/save-file';

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(), export: vi.fn(), username: vi.fn(), request: vi.fn(), operation: vi.fn(),
  signOut: vi.fn(), updateUser: vi.fn(), unsubscribe: vi.fn(), subscribe: vi.fn(),
}));
vi.mock('../presentation/game-dialog', () => ({ gameConfirm: mocks.confirm }));
vi.mock('../presentation/offline-save', async original => ({
  ...await original<typeof import('../presentation/offline-save')>(), exportOfflineSave: mocks.export,
}));
vi.mock('../online/account-client', () => ({
  onlineUsername: mocks.username, accountRequest: mocks.request,
  onlineClient: () => ({ auth: { signOut: mocks.signOut, updateUser: mocks.updateUser, onAuthStateChange: mocks.subscribe } }),
}));
vi.mock('../online/server-game', () => ({ gameOperation: mocks.operation }));

let root: Root;
let host: HTMLDivElement;
function fixture() {
  const account = emptyAccount();
  account.characters.ember = { level: 12, evolution: 1 };
  account.squad = ['ember'];
  account.fractalis = 500;
  return { format: 'last-light-save' as const, version: 1 as const, profile: { version: 1 as const, starterId: 'ember' as const }, account };
}
async function render(node: ReactNode) { await act(async () => root.render(node)); }
async function click(label: string) {
  const button = Array.from(host.querySelectorAll('button')).find(element => element.textContent === label);
  if (!button) throw new Error(`Button missing: ${label}`);
  await act(async () => button.click());
}
async function upload(selector: string, text: string, read?: () => Promise<string>) {
  const input = host.querySelector<HTMLInputElement>(selector)!;
  const file = new File([text], 'save.json', { type: 'application/json' });
  Object.defineProperty(file, 'text', { value: read ?? (() => Promise.resolve(text)) });
  Object.defineProperty(input, 'files', { configurable: true, value: [file] });
  await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
}
async function submit() {
  const form = host.querySelector('form')!;
  for (const [name, value] of [['username', 'fixtureuser'], ['password', 'fixture-password'], ['email', 'fixture@example.invalid']]) {
    const input = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
    if (input) input.value = value;
  }
  await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
  mocks.confirm.mockResolvedValue(true);
  mocks.username.mockResolvedValue(null);
  mocks.request.mockResolvedValue('Fixture registration accepted.');
  mocks.operation.mockResolvedValue({ revision: 0, starterId: null });
  mocks.subscribe.mockReturnValue({ data: { subscription: { unsubscribe: mocks.unsubscribe } } });
  mocks.signOut.mockResolvedValue({ error: null });
  mocks.updateUser.mockResolvedValue({ error: null });
  localStorage.clear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('React opening screens', () => {
  it('renders only account entry and offline play without save controls or writes', async () => {
    const offline = vi.fn(), online = vi.fn();
    await render(<TitleScreen onOffline={offline} onOnline={online} />);
    expect(host.querySelectorAll('.ll-button')).toHaveLength(2);
    await click('Play Offline'); await click('Sign-in / Create Account');
    expect(offline).toHaveBeenCalledOnce(); expect(online).toHaveBeenCalledOnce();
    expect(host.textContent).not.toContain('Player info');
    expect(host.textContent).not.toContain('Play Online');
    expect(localStorage.length).toBe(0);
    expect(host.textContent).not.toContain('save data');
    expect(host.querySelector('input[type=file]')).toBeNull();
  });
  it('saves and exports current progress, with explicit error reporting before a starter exists', async () => {
    await render(<OfflineSavePanel onChanged={vi.fn()} />);
    await click('Save');
    expect(host.querySelector('[role=alert]')?.textContent).toContain('Start an offline game');
    loadOfflineSave(localStorage, fixture());
    await click('Save'); await click('Export Save File');
    expect(JSON.parse(localStorage.getItem(ACCOUNT_KEY)!).fractalis).toBe(500);
    expect(mocks.export).toHaveBeenCalledOnce();
    expect(host.querySelector('[role=alert]')).toBeNull();
  });
  it('rejects malformed uploads before replacement and loads a valid file after confirmation', async () => {
    const changed = vi.fn();
    loadOfflineSave(localStorage, fixture());
    await render(<OfflineSavePanel onChanged={changed} />);
    await upload('input[type=file]', '{}');
    expect(host.querySelector('[role=alert]')?.textContent).toContain('supported');
    expect(mocks.confirm).not.toHaveBeenCalled();
    const next = fixture(); next.account.fractalis = 900;
    await upload('input[type=file]', JSON.stringify(next));
    expect(JSON.parse(localStorage.getItem(ACCOUNT_KEY)!).fractalis).toBe(900);
    expect(changed).toHaveBeenCalledWith('loaded');
  });
  it('honors deletion cancellation and keeps credentials/settings on confirmed deletion', async () => {
    const changed = vi.fn();
    loadOfflineSave(localStorage, fixture());
    localStorage.setItem('last-light.online-auth', 'private');
    localStorage.setItem('last-light.settings', 'preferences');
    await render(<OfflineSavePanel onChanged={changed} />);
    mocks.confirm.mockResolvedValueOnce(false);
    await click('Delete Save Data');
    expect(localStorage.getItem(SAVE_KEY)).not.toBeNull();
    expect(changed).not.toHaveBeenCalled();
    await click('Delete Save Data');
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    expect(localStorage.getItem('last-light.online-auth')).toBe('private');
    expect(localStorage.getItem('last-light.settings')).toBe('preferences');
    expect(changed).toHaveBeenCalledWith('deleted');
  });
  it('does not overwrite progress when an upload finishes after leaving its screen', async () => {
    const changed = vi.fn();
    let finish!: (text: string) => void;
    loadOfflineSave(localStorage, fixture());
    await render(<OfflineSavePanel onChanged={changed} />);
    await upload('input[type=file]', '', () => new Promise(resolve => { finish = resolve; }));
    await act(async () => root.unmount());
    root = createRoot(host);
    const next = fixture(); next.account.fractalis = 900;
    await act(async () => finish(JSON.stringify(next)));
    expect(mocks.confirm).not.toHaveBeenCalled();
    expect(changed).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(ACCOUNT_KEY)!).fractalis).toBe(500);
  });
});

describe('compact profile save controls', () => {
  it('confirms code replacement and preserves the browser save when cancelled', async () => {
    loadOfflineSave(localStorage, fixture());
    const changed = vi.fn(), target = fixture();
    target.account.fractalis = 900;
    await render(<OfflineSavePanel compact onChanged={changed} />);
    const enterCode = async () => {
      await click('Load save code');
      const textarea = host.querySelector<HTMLTextAreaElement>('[aria-label="Offline save code"]')!;
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, 'LLSAVE1:' + btoa(JSON.stringify(target)));
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await click('Review and load');
    };
    mocks.confirm.mockResolvedValueOnce(false);
    await enterCode();
    expect(mocks.confirm).toHaveBeenCalledOnce();
    expect(JSON.parse(localStorage.getItem(ACCOUNT_KEY)!).fractalis).toBe(500);
    expect(changed).not.toHaveBeenCalled();
    await enterCode();
    expect(JSON.parse(localStorage.getItem(ACCOUNT_KEY)!).fractalis).toBe(900);
    expect(changed).toHaveBeenCalledExactlyOnceWith('loaded');
    expect(mocks.operation).not.toHaveBeenCalled();
  });
  it('copies only the browser save and shows file tools in a separate dialog', async () => {
    loadOfflineSave(localStorage, fixture());
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await render(<PlayerSaveData compact onlineUser="fixtureuser" onChanged={vi.fn()} onReady={vi.fn()} onAccount={vi.fn()} />);
    expect(mocks.operation).not.toHaveBeenCalled();
    expect(host.textContent).toContain('Online connected');
    await click('Copy save code');
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0][0]).toMatch(/^LLSAVE1:/);
    expect(host.textContent).toContain('Offline save code copied');
    expect(host.querySelector('dialog')).toBeNull();
    await click('File tools');
    expect(host.querySelector('dialog')?.getAttribute('aria-labelledby')).toBe('offline-file-tools-heading');
    await click('Export Save File');
    expect(mocks.export).toHaveBeenCalledOnce();
    expect(host.querySelector('dialog')).toBeNull();
  });
  it('reports clipboard denial and malformed codes without changing either save', async () => {
    loadOfflineSave(localStorage, fixture());
    const before = localStorage.getItem(ACCOUNT_KEY);
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Clipboard denied')) } });
    await render(<OfflineSavePanel compact onChanged={vi.fn()} />);
    await click('Copy save code');
    expect(host.querySelector('[role=alert]')?.textContent).toContain('Clipboard denied');
    expect(host.textContent).not.toContain('Offline save code copied');
    await click('Load save code');
    await click('Review and load');
    expect(host.querySelector('dialog [role=alert]')?.textContent).toContain('LLSAVE1:');
    expect(localStorage.getItem(ACCOUNT_KEY)).toBe(before);
    expect(mocks.operation).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalled();
  });
});

describe('React account onboarding', () => {
  it('starts with sign-in, exposes registration/recovery, and closes on Escape with cleanup', async () => {
    const close = vi.fn();
    await render(<OnlineAccountDialog onClose={close} />);
    expect(host.querySelector('[name=email]')).toBeNull();
    await click('Create account');
    expect(host.querySelector('[name=email]')).not.toBeNull();
    await click('Recover');
    expect(host.querySelector('[name=password]')).toBeNull();
    await act(async () => host.querySelector('dialog')!.dispatchEvent(new Event('cancel', { cancelable: true })));
    expect(close).toHaveBeenCalledOnce();
  });
  it('keeps registration focused on access and never changes staged or offline saves', async () => {
    loadOfflineSave(localStorage, fixture());
    localStorage.setItem(PENDING_IMPORT_KEY, 'old staging');
    await render(<OnlineAccountDialog onClose={vi.fn()} />);
    await click('Create account');
    expect(host.querySelector('[name=save-choice]')).toBeNull();
    expect(host.querySelector('input[type=file]')).toBeNull();
    await submit();
    expect(mocks.request).toHaveBeenCalledWith('register', 'fixtureuser', 'fixture-password', 'fixture@example.invalid');
    expect(mocks.confirm).not.toHaveBeenCalled();
    expect(mocks.export).not.toHaveBeenCalled();
    expect(localStorage.getItem(PENDING_IMPORT_KEY)).toBe('old staging');
    expect(JSON.parse(localStorage.getItem(ACCOUNT_KEY)!).fractalis).toBe(500);
  });
  it('opens signed-in play without importing staged progress in the account dialog', async () => {
    mocks.username.mockResolvedValue('fixtureuser');
    const close = vi.fn(), play = vi.fn().mockResolvedValue(undefined);
    localStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify({ username: 'fixtureuser', save: fixture(), requestId: crypto.randomUUID() }));
    await render(<OnlineAccountDialog onClose={close} onPlay={play} />);
    expect(host.querySelector('[name=save-choice]')).toBeNull();
    expect(host.textContent).not.toContain('Play Online');
    expect(mocks.operation).not.toHaveBeenCalled();
    expect(play).toHaveBeenCalledOnce(); expect(close).toHaveBeenCalledOnce();
    expect(localStorage.getItem(PENDING_IMPORT_KEY)).not.toBeNull();
  });
  it('enters online play immediately after successful sign-in', async () => {
    const play = vi.fn().mockResolvedValue(undefined), close = vi.fn();
    mocks.username.mockResolvedValueOnce(null).mockResolvedValue('fixtureuser');
    await render(<OnlineAccountDialog onClose={close} onPlay={play} />);
    await submit();
    expect(play).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(host.textContent).not.toContain('Play Online');
  });
  it('reports failed automatic entry and retries without another sign-in', async () => {
    mocks.username.mockResolvedValue('fixtureuser');
    const play = vi.fn().mockRejectedValueOnce(new Error('Connection unavailable')).mockResolvedValue(undefined);
    const close = vi.fn();
    await render(<OnlineAccountDialog onClose={close} onPlay={play} />);
    expect(host.querySelector('[role=alert]')?.textContent).toContain('Connection unavailable');
    expect(close).not.toHaveBeenCalled();
    await click('Retry connection');
    expect(play).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledOnce();
  });
  it('keeps verification-required registration out of online play', async () => {
    const play = vi.fn(), close = vi.fn();
    await render(<OnlineAccountDialog onClose={close} onPlay={play} />);
    await click('Create account');
    await submit();
    expect(play).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    expect(host.textContent).toContain('Fixture registration accepted.');
  });
  it('does not enter a recovery session until the new password is saved', async () => {
    const url = location.href;
    history.replaceState(null, '', '#type=recovery');
    try {
      mocks.username.mockResolvedValue('fixtureuser');
      const play = vi.fn().mockResolvedValue(undefined), close = vi.fn();
      await render(<OnlineAccountDialog onClose={close} onPlay={play} />);
      expect(play).not.toHaveBeenCalled();
      const form = host.querySelector<HTMLFormElement>('.ll-password-reset')!;
      form.querySelector<HTMLInputElement>('input')!.value = 'new-secure-password';
      await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
      expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'new-secure-password' });
      expect(play).toHaveBeenCalledOnce();
      expect(close).toHaveBeenCalledOnce();
    } finally { history.replaceState(null, '', url); }
  });
});

describe('Player info save-data ownership', () => {
  const props = () => ({ onChanged: vi.fn(), onReady: vi.fn().mockResolvedValue(undefined), onAccount: vi.fn() });
  it('exposes all offline controls before a starter exists, including unreadable-save deletion', async () => {
    localStorage.setItem(SAVE_KEY, 'unreadable');
    const close = vi.fn(), actions = props();
    await render(<PlayerInfoScreen {...actions} onClose={close} />);
    expect(host.querySelector('h1')?.textContent).toBe('Player info');
    expect(host.querySelectorAll('.ll-save-actions button')).toHaveLength(4);
    await click('Delete Save Data');
    expect(actions.onChanged).toHaveBeenCalledWith('deleted');
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    await click('Close');
    expect(close).toHaveBeenCalledOnce();
  });
  it('requires a file before attempting an online import', async () => {
    mocks.username.mockResolvedValue('fixtureuser');
    await render(<PlayerSaveData {...props()} />);
    await act(async () => host.querySelector<HTMLInputElement>('[value=import]')!.click());
    await click('Import and play');
    expect(mocks.operation).toHaveBeenCalledTimes(1);
    expect(host.querySelector('[role=alert]')?.textContent).toContain('Choose a Last Light save file');
  });
  it('prompts for a backup only from Player info before opening account setup', async () => {
    loadOfflineSave(localStorage, fixture());
    const actions = props();
    await render(<PlayerSaveData {...actions} />);
    await click('Sign in / Create account');
    expect(mocks.confirm.mock.calls[0][1].title).toBe('Back up offline progress');
    expect(mocks.export).toHaveBeenCalledOnce();
    expect(actions.onAccount).toHaveBeenCalledOnce();
    expect(localStorage.getItem(PENDING_IMPORT_KEY)).toBeNull();
  });
  it('requires explicit consent to proceed without a backup', async () => {
    loadOfflineSave(localStorage, fixture());
    mocks.confirm.mockResolvedValueOnce(false).mockResolvedValueOnce(false);
    const actions = props();
    await render(<PlayerSaveData {...actions} />);
    await click('Sign in / Create account');
    expect(mocks.confirm).toHaveBeenCalledTimes(2);
    expect(actions.onAccount).not.toHaveBeenCalled();
  });
  it('clears old staging only after confirming fresh online progress in Player info', async () => {
    mocks.username.mockResolvedValue('fixtureuser');
    localStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify({ username: 'fixtureuser', save: fixture(), requestId: crypto.randomUUID() }));
    const actions = props();
    await render(<PlayerSaveData {...actions} />);
    await act(async () => host.querySelector<HTMLInputElement>('[value=fresh]')!.click());
    await click('Start fresh online');
    expect(localStorage.getItem(PENDING_IMPORT_KEY)).toBeNull();
    expect(actions.onReady).toHaveBeenCalledOnce();
  });
  it('restores staged progress only for its new account and imports the exact request once', async () => {
    mocks.username.mockResolvedValue('fixtureuser');
    const actions = props();
    const id = crypto.randomUUID();
    localStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify({ username: 'fixtureuser', save: fixture(), requestId: id }));
    await render(<PlayerSaveData {...actions} />);
    expect(host.querySelector<HTMLInputElement>('[value=import]')!.checked).toBe(true);
    await click('Import and play');
    expect(mocks.operation).toHaveBeenCalledWith({ kind: 'importSave', save: fixture() }, 0, id);
    expect(localStorage.getItem(PENDING_IMPORT_KEY)).toBeNull();
    expect(actions.onReady).toHaveBeenCalledOnce();
    expect(host.querySelector('[name=save-choice]')).toBeNull();
  });
  it('imports an uploaded file without changing the offline original and retries the same uncertain request', async () => {
    mocks.username.mockResolvedValue('fixtureuser');
    loadOfflineSave(localStorage, fixture());
    const original = localStorage.getItem(ACCOUNT_KEY);
    const actions = props();
    await render(<PlayerSaveData {...actions} />);
    await act(async () => host.querySelector<HTMLInputElement>('[value=import]')!.click());
    await upload('[aria-label="Choose online import save file"]', JSON.stringify(fixture()));
    mocks.operation.mockRejectedValueOnce(new Error('Connection lost.'));
    await click('Import and play');
    expect(actions.onReady).not.toHaveBeenCalled();
    expect(host.querySelector('[role=alert]')?.textContent).toContain('Connection lost');
    const staged = JSON.parse(localStorage.getItem(PENDING_IMPORT_KEY)!);
    expect(staged.save).toEqual(fixture());
    await click('Import and play');
    expect(mocks.operation.mock.calls[1]).toEqual([{ kind: 'importSave', save: fixture() }, 0, staged.requestId]);
    expect(mocks.operation.mock.calls[2]).toEqual(mocks.operation.mock.calls[1]);
    expect(actions.onReady).toHaveBeenCalledOnce();
    expect(localStorage.getItem(ACCOUNT_KEY)).toBe(original);
    expect(localStorage.getItem(PENDING_IMPORT_KEY)).toBeNull();
  });
  it('preserves pending transfer and progress when fresh/import confirmation is cancelled', async () => {
    mocks.username.mockResolvedValue('fixtureuser');
    const pending = JSON.stringify({ username: 'fixtureuser', save: fixture(), requestId: crypto.randomUUID() });
    localStorage.setItem(PENDING_IMPORT_KEY, pending);
    const actions = props();
    await render(<PlayerSaveData {...actions} />);
    mocks.confirm.mockResolvedValue(false);
    await click('Import and play');
    await act(async () => host.querySelector<HTMLInputElement>('[value=fresh]')!.click());
    await click('Start fresh online');
    expect(localStorage.getItem(PENDING_IMPORT_KEY)).toBe(pending);
    expect(mocks.operation).toHaveBeenCalledTimes(1);
    expect(actions.onReady).not.toHaveBeenCalled();
  });
  it('does not label an unreadable online account as established and supports refresh', async () => {
    mocks.username.mockResolvedValue('fixtureuser');
    mocks.operation.mockRejectedValueOnce(new Error('Unable to read online account.'));
    await render(<PlayerSaveData {...props()} />);
    expect(host.querySelector('[role=alert]')?.textContent).toContain('Unable to read online account');
    expect(host.textContent).not.toContain('This account has already started');
    expect(host.querySelector('[name=save-choice]')).toBeNull();
    await click('Refresh online status');
    expect(host.querySelector('[name=save-choice]')).not.toBeNull();
  });
  it('ignores another username’s staged file and clears selected files after an account switch', async () => {
    mocks.username.mockResolvedValue('fixtureuser');
    const pending = JSON.stringify({ username: 'someoneelse', save: fixture(), requestId: crypto.randomUUID() });
    localStorage.setItem(PENDING_IMPORT_KEY, pending);
    await render(<PlayerSaveData {...props()} />);
    expect(host.querySelector<HTMLInputElement>('[value=fresh]')!.checked).toBe(true);
    await act(async () => host.querySelector<HTMLInputElement>('[value=import]')!.click());
    await upload('[aria-label="Choose online import save file"]', JSON.stringify(fixture()));
    mocks.username.mockResolvedValue('newuser');
    await click('Refresh online status');
    expect(host.querySelector<HTMLInputElement>('[value=fresh]')!.checked).toBe(true);
    expect(localStorage.getItem(PENDING_IMPORT_KEY)).toBe(pending);
  });
  it('hides import for an established account while preserving offline management', async () => {
    mocks.username.mockResolvedValue('fixtureuser');
    mocks.operation.mockResolvedValue({ revision: 2, starterId: 'ember' });
    await render(<PlayerSaveData {...props()} />);
    expect(host.querySelector('[name=save-choice]')).toBeNull();
    expect(host.textContent).toContain('This account has already started');
    expect(host.querySelectorAll('.ll-save-actions button')).toHaveLength(4);
  });
  it('blocks actions during upload and ignores the result after unmount', async () => {
    let finish!: (text: string) => void;
    mocks.username.mockResolvedValue('fixtureuser');
    await render(<PlayerSaveData {...props()} />);
    await act(async () => host.querySelector<HTMLInputElement>('[value=import]')!.click());
    await upload('[aria-label="Choose online import save file"]', '', () => new Promise(resolve => { finish = resolve; }));
    expect(host.querySelector<HTMLInputElement>('[value=fresh]')!.disabled).toBe(true);
    await act(async () => root.unmount());
    root = createRoot(host);
    await act(async () => finish(JSON.stringify(fixture())));
    expect(host.textContent).toBe('');
    expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.operation).toHaveBeenCalledTimes(1);
  });
});
