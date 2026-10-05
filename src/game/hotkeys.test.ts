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
    const changed = { ...defaultBindings, nextAlly: 'KeyL' };
    saveBindings(storage, changed);
    expect(loadBindings(storage)).toEqual(changed);
    const raw = data.get(HOTKEYS_KEY);
    expect(() => saveBindings(storage, { ...changed, nextTarget: 'KeyL' })).toThrow('different key');
    expect(data.get(HOTKEYS_KEY)).toBe(raw);
  });
  it('rejects incomplete, unsupported, duplicate, and corrupt mappings', () => {
    expect(() => validateBindings({ nextAlly: 'KeyC' })).toThrow('Missing binding');
    expect(() => validateBindings({ ...defaultBindings, nextAlly: 'Escape' })).toThrow('Unsupported');
    expect(() => validateBindings({ ...defaultBindings, nextTarget: 'KeyC' })).toThrow('different key');
    expect(() => validateBindings({ ...defaultBindings, nextTarget: 'Space' })).toThrow('Unsupported');
    expect(() => loadBindings({ getItem: () => '{', setItem: () => {}, removeItem: () => {} })).toThrow();
  });
  it('surfaces storage errors', () => {
    expect(() => saveBindings({
      getItem: () => null,
      setItem: () => { throw new Error('Storage unavailable'); },
      removeItem: () => {},
    }, defaultBindings)).toThrow('Storage unavailable');
  });
  it('discards legacy attack/end-turn keys without losing selection keys or rewriting storage', () => {
    const raw = JSON.stringify({ nextAlly: 'KeyN', nextTarget: 'KeyV', heavy: 'KeyZ', light: 'KeyL',
      skill1: 'KeyE', skill2: 'KeyR', ultimate: 'KeyF', endTurn: 'Space' });
    const storage: ProfileStorage = {
      getItem: () => raw,
      setItem: () => { throw new Error('Must not write during migration'); },
      removeItem: () => { throw new Error('Must not delete during migration'); },
    };
    expect(loadBindings(storage)).toEqual({ nextAlly: 'KeyN', nextTarget: 'KeyV' });
    expect(Object.keys(loadBindings(storage))).toEqual(['nextAlly', 'nextTarget']);
  });
});
