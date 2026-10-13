// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountTitle, mountStarterSelection, unmountTitle, type OnlineSaveRequest } from './mount';
import { loadOfflineSave } from '../game/save-file';
import { emptyAccount } from '../game/account';
vi.mock('../online/account-client', () => ({ onlineUsername: vi.fn().mockResolvedValue(null) }));

vi.mock('../presentation/game-dialog', () => ({ gameConfirm: vi.fn().mockResolvedValue(true) }));
afterEach(async () => {
  await act(async () => {
    unmountTitle();
    document.body.replaceChildren();
    await Promise.resolve();
  });
  localStorage.clear();
  vi.unstubAllGlobals();
});
describe('React and retained game-screen boundary', () => {
  it('waits for the main online checkpoint and keeps offline controls distinct', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const host = document.createElement('div');
    let request!: OnlineSaveRequest;
    host.addEventListener('player-save-online', event => { request = (event as CustomEvent<OnlineSaveRequest>).detail; });
    await act(async () => { document.body.append(host); host.innerHTML = '<ll-player-save-data compact online-user="testuser"></ll-player-save-data>'; });
    expect(host.textContent).toContain('No offline save on this browser yet.');
    const save = Array.from(host.querySelectorAll('button')).find(button => button.textContent === 'Save now')!;
    expect(save.disabled).toBe(false);
    await act(async () => save.click());
    expect(request).toBeDefined();
    expect(host.textContent).not.toContain('Online progress saved.');
    await act(async () => request.resolve());
    expect(host.textContent).toContain('Online progress saved.');
    const copy = Array.from(host.querySelectorAll('button')).find(button => button.textContent === 'Copy save code')!;
    expect(copy.disabled).toBe(true);
    expect(localStorage.length).toBe(0);
  });
  it('replaces the title with organized starter selection and restores its selected state', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const host = document.createElement('div');
    document.body.append(host);
    const selected = vi.fn();
    await act(async () => mountTitle(host, { onOffline: vi.fn(), onOnline: vi.fn() }));
    await act(async () => mountStarterSelection(host, {
      initialSelected: 'tide', onSelect: selected, onBegin: vi.fn().mockResolvedValue(undefined), onPlayerInfo: vi.fn(),
    }));
    expect(host.querySelector('.ll-title')).toBeNull();
    expect(host.querySelectorAll('[data-starter]')).toHaveLength(3);
    expect(host.querySelector('[data-starter="tide"]')?.getAttribute('aria-pressed')).toBe('true');
    await act(async () => host.querySelector<HTMLButtonElement>('[data-starter="ember"]')!.click());
    expect(selected).toHaveBeenCalledExactlyOnceWith('ember');
    await act(async () => unmountTitle());
    expect(host.childElementCount).toBe(0);
  });
  it('mounts and disposes the opening root without save controls', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const host = document.createElement('div');
    document.body.append(host);
    const props = { onOffline: vi.fn(), onOnline: vi.fn() };
    await act(async () => mountTitle(host, props));
    expect(host.querySelectorAll('button')).toHaveLength(2);
    expect(host.textContent).not.toContain('Player info');
    expect(host.textContent).toContain('Sign-in / Create Account');
    expect(host.textContent).not.toContain('Save File');
    await act(async () => { unmountTitle(); mountTitle(host, props); });
    expect(host.querySelector('#save-recovery')).toBeNull();
  });
  it('mounts real React save controls in Player info and forwards saved changes once', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const account = emptyAccount();
    account.characters.ember = { level: 0, evolution: 1 };
    account.squad = ['ember'];
    loadOfflineSave(localStorage, { format: 'last-light-save', version: 1, profile: { version: 1, starterId: 'ember' }, account });
    const host = document.createElement('div');
    const changed = vi.fn();
    host.addEventListener('offline-save-changed', changed);
    await act(async () => { document.body.append(host); host.innerHTML = '<ll-player-save-data></ll-player-save-data>'; });
    expect(host.querySelectorAll('.ll-save-actions .ll-button')).toHaveLength(4);
    const panel = host.querySelector('ll-player-save-data')!;
    await act(async () => { host.append(panel); await Promise.resolve(); });
    expect(host.querySelectorAll('.ll-save-actions .ll-button')).toHaveLength(4);
    const deleteButton = Array.from(host.querySelectorAll('button')).find(button => button.textContent === 'Delete Save Data')!;
    await act(async () => deleteButton.click());
    expect(changed).toHaveBeenCalledOnce();
    expect((changed.mock.calls[0][0] as CustomEvent).detail).toBe('deleted');
    await act(async () => { host.innerHTML = '<ll-player-save-data></ll-player-save-data>'; await Promise.resolve(); });
    expect(host.querySelectorAll('.ll-save-actions .ll-button')).toHaveLength(4);
  });
});
