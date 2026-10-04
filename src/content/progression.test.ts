import { describe, expect, it } from 'vitest';
import { artifactSlots, currencies, fractureRules, upgradePaths } from './progression';
import { availableStarters } from './starters';
import { loadMotion, saveMotion, SETTINGS_KEY } from '../presentation/settings';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';

describe('confirmed game foundation', () => {
  it('offers only fire and names both currencies correctly', () => {
    expect(availableStarters.map((starter) => starter.id)).toEqual(['ember']);
    expect(currencies.map((currency) => currency.name)).toEqual(['Fractalis', 'Lycalis']);
  });
  it('defines eight distinct artifact slots and seven upgrade paths', () => {
    expect(artifactSlots).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(upgradePaths.map((path) => path.name)).toEqual([
      'Fracture / Evolution', 'Character level', 'Weapon upgrade', 'Unique passive', 'Ability 1', 'Ability 2', 'Last Flare',
    ]);
    expect(upgradePaths[6].detail).toContain('Last Flare: <character-specific name>');
  });
  it('defines the confirmed first Fracture without inventing materials or stat bonuses', () => {
    expect(fractureRules).toEqual({
      sourceTier: 1, destinationTier: 2, levelCap: 30, resetLevel: 0, lycalisReward: 10,
    });
    expect(upgradePaths[0].detail).toContain('At level 30');
    expect(upgradePaths[0].detail).toContain('Reset to level 0');
    expect(upgradePaths[0].detail).toContain('+10 Lycalis');
    expect(upgradePaths[0].detail).toContain('Exact stat bonuses and materials are pending');
    expect(upgradePaths[1].detail).toContain('0 to 30');
    expect(upgradePaths[1].detail).toContain('different resources');
  });
  it('persists motion preferences without changing the companion save', () => {
    const entries = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
    const storage: ProfileStorage = {
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => { entries.set(key, value); },
      removeItem: (key) => { entries.delete(key); },
    };
    expect(loadMotion(storage)).toBe('system');
    saveMotion(storage, 'reduced');
    expect(loadMotion(storage)).toBe('reduced');
    expect(entries.get(SAVE_KEY)).toBe('{"version":1,"starterId":"ember"}');
    entries.set(SETTINGS_KEY, 'bad');
    expect(() => loadMotion(storage)).toThrow('Unsupported motion');
    expect(entries.get(SETTINGS_KEY)).toBe('bad');
  });
  it('reports storage failures rather than claiming settings were saved', () => {
    const storage: ProfileStorage = {
      getItem: () => { throw new Error('Read denied'); },
      setItem: () => { throw new Error('Write denied'); },
      removeItem: () => { throw new Error('Remove denied'); },
    };
    expect(() => loadMotion(storage)).toThrow('Read denied');
    expect(() => saveMotion(storage, 'reduced')).toThrow('Write denied');
  });
});
