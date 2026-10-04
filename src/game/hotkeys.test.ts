import { describe, expect, it } from 'vitest';
import { defaultBindings, HOTKEYS_KEY, loadBindings, saveBindings, validateBindings } from './hotkeys';
import { type ProfileStorage } from './profile';

describe('battle hotkeys', () => {
  it('loads default keys and persists a complete remapping', () => {
    const data = new Map<string, string>();
    const storage: ProfileStorage = {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => { data.set(key, value); },
      removeItem: (key) => { data.delete(key); },
    };
    expect(loadBindings(storage)).toEqual(defaultBindings);
    const changed = { ...defaultBindings, light: 'KeyL' };
    saveBindings(storage, changed);
    expect(loadBindings(storage)).toEqual(changed);
    const raw = data.get(HOTKEYS_KEY);
    expect(() => saveBindings(storage, { ...changed, heavy: 'KeyL' })).toThrow('different key');
    expect(data.get(HOTKEYS_KEY)).toBe(raw);
  });
  it('rejects incomplete, unsupported, duplicate, and corrupt mappings', () => {
    expect(() => validateBindings({ light: 'KeyQ' })).toThrow('Missing binding');
    expect(() => validateBindings({ ...defaultBindings, light: 'Escape' })).toThrow('Unsupported');
    expect(() => validateBindings({ ...defaultBindings, heavy: 'KeyQ' })).toThrow('different key');
    expect(() => loadBindings({ getItem: () => '{', setItem: () => {}, removeItem: () => {} })).toThrow();
  });
  it('surfaces storage errors', () => {
    expect(() => saveBindings({
      getItem: () => null,
      setItem: () => { throw new Error('Storage unavailable'); },
      removeItem: () => {},
    }, defaultBindings)).toThrow('Storage unavailable');
  });
});
