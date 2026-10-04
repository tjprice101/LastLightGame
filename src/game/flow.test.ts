import { describe, expect, it } from 'vitest';
import { Journey } from './flow';
import { SAVE_KEY, loadProfile, saveStarter, type ProfileStorage } from './profile';
import { starters } from '../content/starters';

function memoryStorage(initial?: string): ProfileStorage {
  const entries = new Map<string, string>();
  if (initial !== undefined) entries.set(SAVE_KEY, initial);
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => { entries.set(key, value); },
    removeItem: (key) => { entries.delete(key); },
  };
}

describe('opening journey', () => {
  it('starts at the title and enters selection without a save', () => {
    const journey = new Journey();
    expect(journey.screen).toBe('title');
    journey.enter(memoryStorage());
    expect(journey.screen).toBe('selection');
    expect(journey.selected).toBeNull();
  });
  it.each(starters)('saves $id and opens the menu', ({ id }) => {
    const storage = memoryStorage();
    const journey = new Journey();
    journey.enter(storage);
    journey.select(id);
    journey.confirm(storage);
    expect(journey.screen).toBe('menu');
    expect(loadProfile(storage)).toEqual({ version: 1, starterId: id });
  });
  it('requires an explicit selection', () => {
    const journey = new Journey();
    const storage = memoryStorage();
    journey.enter(storage);
    expect(() => journey.confirm(storage)).toThrow('Select a companion');
    expect(loadProfile(storage)).toBeNull();
  });
  it('continues an existing journey after the title', () => {
    const storage = memoryStorage();
    saveStarter(storage, 'tide');
    const journey = new Journey();
    journey.enter(storage);
    expect(journey.screen).toBe('menu');
    expect(journey.profile?.starterId).toBe('tide');
  });
  it('ignores repeated title input after entering selection', () => {
    const journey = new Journey();
    const storage = memoryStorage();
    journey.enter(storage);
    journey.select('sprout');
    journey.enter(storage);
    expect(journey.selected).toBe('sprout');
  });
  it.each(['{', '{}', '{"version":2,"starterId":"ember"}', '{"version":1,"starterId":"unknown"}'])(
    'does not overwrite an unreadable save: %s', (raw) => {
      const storage = memoryStorage(raw);
      const journey = new Journey();
      expect(() => journey.enter(storage)).toThrow();
      expect(journey.screen).toBe('title');
      expect(storage.getItem(SAVE_KEY)).toBe(raw);
    },
  );
  it('stays in selection when storage rejects a write', () => {
    const storage = memoryStorage();
    const journey = new Journey();
    journey.enter(storage);
    journey.select('ember');
    storage.setItem = () => { throw new Error('Storage unavailable'); };
    expect(() => journey.confirm(storage)).toThrow('Storage unavailable');
    expect(journey.screen).toBe('selection');
    expect(journey.profile).toBeNull();
  });
});
