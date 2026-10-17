import { describe, expect, it } from 'vitest';
import { artifactSlots, currencies, fractureRules, evolutionLevelRequirement, characterGrowthFactor, upgradePaths } from './progression';
import { availableStarters } from './starters';
import { loadMotion, saveMotion, SETTINGS_KEY } from '../presentation/settings';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';

describe('confirmed game foundation', () => {
  it('offers fire, water, and grass and names both currencies correctly', () => {
    expect(availableStarters.map((starter) => starter.id)).toEqual(['ember', 'tide', 'sprout']);
    expect(currencies.map((currency) => currency.name)).toEqual(['Prismatica', 'Null-Prismatica']);
  });
  it('defines eight distinct artifact slots and six upgrade paths without weapons', () => {
    expect(artifactSlots).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(upgradePaths.map((path) => path.name)).toEqual([
      'Fracture & Evolution', 'Character level', 'Unique passive', 'Ability 1', 'Ability 2', 'Last Flare',
    ]);
    expect(upgradePaths[5].detail).toContain('Last Flare: <character-specific name>');
  });
  it('defines additive linear growth, preserved levels and six evolution requirements', () => {
    expect(fractureRules).toEqual({
      sourceTier: 1, destinationTier: 2, evolutionLevel: 30, preservesLevel: true, lycalisReward: 10,
    });
    expect(upgradePaths[0].detail).toContain('Preserve your level');
    expect(upgradePaths[0].detail).toContain('150% of base');
    expect([1, 2, 3, 4, 5, 6].map(evolutionLevelRequirement)).toEqual([30, 45, 60, 75, 90, 105]);
    expect(characterGrowthFactor({ level: 0, evolution: 1 })).toBe(1);
    expect(characterGrowthFactor({ level: 30, evolution: 2 })).toBe(7);
    expect(characterGrowthFactor({ level: 90, evolution: 5 })).toBe(20.5);
    expect(characterGrowthFactor({ level: 105, evolution: 6 })).toBe(24.25);
    for (let evolution = 1; evolution <= 6; evolution++) {
      for (let level = 1; level <= evolutionLevelRequirement(evolution); level++) {
        expect(characterGrowthFactor({ level, evolution }) - characterGrowthFactor({ level: level - 1, evolution })).toBeCloseTo(.15, 12);
      }
      if (evolution < 6) {
        const level = evolutionLevelRequirement(evolution);
        expect(characterGrowthFactor({ level, evolution: evolution + 1 }) - characterGrowthFactor({ level, evolution })).toBe(1.5);
      }
    }
    for (const evolution of [0, 7, 1.5, NaN, Infinity]) expect(() => evolutionLevelRequirement(evolution)).toThrow('1 to 6');
    for (const level of [-1, 0.5, NaN, Infinity]) {
      expect(() => characterGrowthFactor({ level, evolution: 1 })).toThrow('0 or more');
    }
    expect(characterGrowthFactor({ level: 500, evolution: 1 })).toBeGreaterThan(characterGrowthFactor({ level: 30, evolution: 1 }));
    expect(upgradePaths[1].detail).toContain('Levels have no limit');
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
