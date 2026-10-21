import { describe, expect, it } from 'vitest';
import { artifactSlots, currencies, fractureRules, characterLevelCap, characterGrowthFactor, upgradePaths,
  characterEvolutionCost, evolutionCost, characterLevelCost } from './progression';
import { availableStarters, starters, isRoseCharacter, roseCharacters } from './starters';
import { loadMotion, saveMotion, SETTINGS_KEY } from '../presentation/settings';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';

describe('confirmed game foundation', () => {
  it('preserves ordinary evolution recipes and Rose leveling Soul surcharges', () => {
    for (const starter of starters.filter(starter => !isRoseCharacter(starter.id))) {
      for (let evolution = 1; evolution <= 5; evolution++) {
        const progress = { level: characterLevelCap(evolution), evolution };
        expect(characterEvolutionCost(starter.id, progress)).toEqual(evolutionCost(starter.elementId, progress));
      }
    }
    for (const character of roseCharacters) {
      expect(characterLevelCost(character.id, { level: 75, evolution: 5 }).materials).toEqual({
        'rosethorn-common': 3, 'rosethorn-uncommon': 1, 'rosethorn-rare': 1,
        'rosethorn-epic': 1, 'rosethorn-legendary': 1, 'rosethorn-omnic': 1,
      });
      expect(characterLevelCost(character.id, { level: 90, evolution: 6 }).materials['rosethorn-omnic']).toBe(2);
    }
  });

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
  it('defines additive linear growth, preserved levels and six increasing caps', () => {
    expect(fractureRules).toEqual({
      sourceTier: 1, destinationTier: 2, levelCap: 30, preservesLevel: true, lycalisReward: 10,
    });
    expect(upgradePaths[0].detail).toContain('Preserve your level');
    expect(upgradePaths[0].detail).toContain('150% of base');
    expect([1, 2, 3, 4, 5, 6].map(characterLevelCap)).toEqual([30, 45, 60, 75, 90, 105]);
    expect(characterGrowthFactor({ level: 0, evolution: 1 })).toBe(1);
    expect(characterGrowthFactor({ level: 30, evolution: 2 })).toBe(7);
    expect(characterGrowthFactor({ level: 90, evolution: 5 })).toBe(20.5);
    expect(characterGrowthFactor({ level: 105, evolution: 6 })).toBe(24.25);
    for (let evolution = 1; evolution <= 6; evolution++) {
      for (let level = 1; level <= characterLevelCap(evolution); level++) {
        expect(characterGrowthFactor({ level, evolution }) - characterGrowthFactor({ level: level - 1, evolution })).toBeCloseTo(.15, 12);
      }
      if (evolution < 6) {
        const level = characterLevelCap(evolution);
        expect(characterGrowthFactor({ level, evolution: evolution + 1 }) - characterGrowthFactor({ level, evolution })).toBe(1.5);
      }
    }
    for (const evolution of [0, 7, 1.5, NaN, Infinity]) expect(() => characterLevelCap(evolution)).toThrow('1 to 6');
    for (const level of [-1, 31, 0.5, NaN, Infinity]) {
      expect(() => characterGrowthFactor({ level, evolution: 1 })).toThrow('0 to 30');
    }
    expect(upgradePaths[1].detail).toContain('Linear');
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
