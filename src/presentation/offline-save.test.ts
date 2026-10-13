import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyAccount, ACCOUNT_KEY } from '../game/account';
import { EXPORTED_SAVE_KEY, loadOfflineSave, SAVE_FILE_LIMIT, validateSaveFile } from '../game/save-file';
import { exportOfflineSave, offlineSaveCode, readSaveCode, readSaveUpload } from './offline-save';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { OfflineSavePanel } from '../ui/offline-save-panel';
import { readFileSync } from 'node:fs';
import { settingsPanel } from './settings-panel';
import { defaultBindings } from '../game/hotkeys';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });

function fixture() {
  const account = emptyAccount();
  account.characters.ember = { level: 12, evolution: 1 };
  account.squad = ['ember'];
  account.fractalis = 500;
  return validateSaveFile({ format: 'last-light-save', version: 1, profile: { version: 1, starterId: 'ember' }, account });
}

describe('offline save presentation', () => {
  it('round-trips a complete private offline code without auth or settings data', () => {
    const save = fixture();
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
    loadOfflineSave(storage, save);
    storage.setItem('last-light.online-auth', 'secret');
    storage.setItem('last-light.settings', 'preferences');
    vi.stubGlobal('localStorage', storage);
    const code = offlineSaveCode();
    expect(code.startsWith('LLSAVE1:')).toBe(true);
    expect(readSaveCode(`  ${code}\n`)).toEqual(save);
    expect(atob(code.slice(8))).not.toContain('secret');
    expect(atob(code.slice(8))).not.toContain('preferences');
    expect(() => readSaveCode('invalid')).toThrow('LLSAVE1:');
    expect(() => readSaveCode('LLSAVE1:%%%%')).toThrow();
    expect(() => readSaveCode('LLSAVE1:e30=')).toThrow('supported');
    expect(() => readSaveCode('LLSAVE1:' + 'A'.repeat(Math.ceil(SAVE_FILE_LIMIT / 3) * 4 + 1))).toThrow('4 MB');
    expect(values.get(ACCOUNT_KEY)).toBe(JSON.stringify(save.account));
  });
  it('keeps every save-data mount in Player info, not title or either Settings path', () => {
    const main = readFileSync(new URL('../main.ts', import.meta.url), 'utf8');
    const settingsPaths = main.match(/settingsPanel\(motionPreference, bindings, speed\)[^\n]*/g);
    expect(settingsPaths).toHaveLength(2);
    for (const path of settingsPaths!) expect(path).not.toMatch(/offlineSave|playerSave|ll-player-save/);
    expect(main).toContain('playerInfoOpen = !response.starterId && !progressReady');
    expect(main).toContain('onReady: () => enterOnline(true)');
    expect(main).not.toContain('deleteOfflineSave(');
    expect(main).not.toContain('exportOfflineSave(');
    const settings = settingsPanel('system', defaultBindings, 1);
    for (const label of ['Offline save data', 'Export Save File', 'Load Save File', 'Delete Save Data', 'll-player-save-data']) {
      expect(settings).not.toContain(label);
    }
  });
  it('reads real file content and rejects invalid and oversized uploads', async () => {
    const save = fixture();
    await expect(readSaveUpload(new File([JSON.stringify(save)], 'save.json'))).resolves.toEqual(save);
    await expect(readSaveUpload(new File(['{}'], 'invalid.json'))).rejects.toThrow('supported');
    await expect(readSaveUpload(new File([' '.repeat(SAVE_FILE_LIMIT + 1)], 'large.json'))).rejects.toThrow('4 MB');
  });

  it('downloads only the complete offline envelope and cleans up its URL', async () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
    const save = fixture();
    loadOfflineSave(storage, save);
    storage.setItem('last-light.online-auth', 'private');
    vi.stubGlobal('localStorage', storage);
    const link = { href: '', download: '', click: vi.fn(), remove: vi.fn() };
    vi.stubGlobal('document', { createElement: () => link, body: { append: vi.fn() } });
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fixture');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.useFakeTimers();
    exportOfflineSave();
    expect(link.download).toBe('last-light-save.json');
    expect(link.click).toHaveBeenCalledOnce();
    expect(link.remove).toHaveBeenCalledOnce();
    const blob = create.mock.calls[0][0];
    if (!(blob instanceof Blob)) throw new Error('Expected a save-file Blob.');
    expect(JSON.parse(await blob.text())).toEqual(save);
    expect(storage.getItem(EXPORTED_SAVE_KEY)).toBe(JSON.stringify(save));
    await vi.advanceTimersByTimeAsync(1000);
    expect(revoke).toHaveBeenCalledWith('blob:fixture');
  });

  it('retains all four explicit actions and an accessible status', () => {
    const html = renderToStaticMarkup(createElement(OfflineSavePanel, { onChanged: () => {} }));
    for (const label of ['Save', 'Export Save File', 'Load Save File', 'Delete Save Data']) expect(html).toContain(`>${label}</button>`);
    expect(html).toContain('role="status"');
  });
});
