import { describe, expect, it } from 'vitest';
import { emptyAccount, ACCOUNT_KEY } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { offlineSave, validateSaveFile, parseSaveFile, loadOfflineSave, deleteOfflineSave, saveOfflineProgress, needsOfflineExport, EXPORTED_SAVE_KEY } from './save-file';
import { createCreatureCopy } from './character-instances';

function storage(): ProfileStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
}
function fixture() {
  const account = emptyAccount();
  account.characters.ember = { level: 12, evolution: 1, weaponRank: 2 };
  account.squad = ['ember'];
  account.fractalis = 123456;
  account.lycalis = 777;
  account.storyCompleted = 29;
  account.capturedCharacters = [createCreatureCopy('infusion:treasury:0', 1, 89)];
  return validateSaveFile({ format: 'last-light-save', version: 1, profile: { version: 1, starterId: 'ember' }, account });
}
describe('offline save files', () => {
  it('round trips the full account without mutating it or including online credentials', () => {
    const file = fixture();
    const store = storage();
    store.setItem('last-light.online-auth', 'private session');
    loadOfflineSave(store, file);
    expect(offlineSave(store)).toEqual(file);
    expect(parseSaveFile(JSON.stringify(file))).toEqual(file);
    expect(store.getItem('last-light.online-auth')).toBe('private session');
    expect(JSON.stringify(offlineSave(store))).not.toContain('private session');
  });
  it('rejects unsupported files, malformed holdings and missing ownership before writing', () => {
    const file = fixture();
    for (const value of [{}, { ...file, version: 2 }, { ...file, account: { ...file.account, fractalis: -1 } },
      { ...file, profile: { version: 1, starterId: 'rosetta' } }, { ...file, account: emptyAccount() }]) {
      expect(() => validateSaveFile(value)).toThrow();
    }
    expect(() => parseSaveFile(' '.repeat(4 * 1024 * 1024 + 1))).toThrow('4 MB');
  });
  it('tracks whether the exact current progress was exported and preserves that marker on Save', () => {
    const store = storage();
    expect(needsOfflineExport(store)).toBe(false);
    loadOfflineSave(store, fixture());
    expect(needsOfflineExport(store)).toBe(true);
    store.setItem(EXPORTED_SAVE_KEY, JSON.stringify(offlineSave(store)));
    saveOfflineProgress(store);
    expect(needsOfflineExport(store)).toBe(false);
    const next = fixture();
    next.account.fractalis++;
    loadOfflineSave(store, next);
    expect(needsOfflineExport(store)).toBe(true);
  });
  it('restores prior data if an import write fails', () => {
    const store = storage();
    loadOfflineSave(store, fixture());
    const before = new Map(store.values);
    let writes = 0;
    const unreliable = { ...store, setItem(key: string, value: string) {
      if (++writes === 2) throw new Error('storage denied');
      store.setItem(key, value);
    } };
    const file = fixture();
    file.account.fractalis++;
    expect(() => loadOfflineSave(unreliable, file)).toThrow('not changed');
    expect(store.values).toEqual(before);
  });
  it('deletes only offline progress, never auth, settings or other data', () => {
    const store = storage();
    loadOfflineSave(store, fixture());
    store.setItem('last-light.online-auth', 'session');
    store.setItem('last-light.settings', 'reduced');
    deleteOfflineSave(store);
    expect(store.getItem(SAVE_KEY)).toBeNull();
    expect(store.getItem(ACCOUNT_KEY)).toBeNull();
    expect(store.getItem('last-light.online-auth')).toBe('session');
    expect(store.getItem('last-light.settings')).toBe('reduced');
  });
});
