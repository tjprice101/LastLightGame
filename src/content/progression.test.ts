import { describe, expect, it } from 'vitest';
import { artifactSlots, currencies, fractureRules, characterLevelCap, characterGrowthFactor, upgradePaths,
  characterEvolutionCost, evolutionCost, characterLevelCost, levelingMaterials, evolutionBalance } from './progression';
import { evolutionRecipes } from './activities';
import { availableStarters, starters, isRoseCharacter, roseCharacters } from './starters';
import { loadMotion, saveMotion, SETTINGS_KEY } from '../presentation/settings';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';

describe('confirmed game foundation', () => {
  it('doubles late Element-Bearer materials exactly once, keeps currency and verifies full-progression totals', () => {
    for (const starter of starters) {
      const totals: Record<string, number> = {};
      let currency = 0, level = 0;
      const family = isRoseCharacter(starter.id) ? 'rosethorn' : starter.elementId;
      const add = (cost: ReturnType<typeof characterLevelCost>) => {
        currency += cost.fractalis;
        for (const [id, amount] of Object.entries(cost.materials)) totals[id] = (totals[id] ?? 0) + amount;
      };
      for (let evolution = 1; evolution <= 6; evolution++) {
        while (level < characterLevelCap(evolution)) {
          const cost = characterLevelCost(starter.id, { level, evolution }), destination = level + 1;
          const multiplier = destination >= 61 ? 2 : 1;
          const expected = Object.fromEntries(Object.entries(levelingMaterials(family, destination))
            .map(([id, amount]) => [id, amount * multiplier]));
          if (!isRoseCharacter(starter.id) && evolution >= 5) {
            const specialty = starter.elementId === 'chaotic' || starter.elementId === 'tranquilitic' ? 'abyss' : 'heavens';
            expected[`${specialty}-level`] = multiplier;
          }
          expect(cost).toEqual({ fractalis: 10 + 2 * destination, materials: expected });
          add(cost); level++;
        }
        if (evolution < 6) add(characterEvolutionCost(starter.id, { level, evolution }));
      }
      expect(currency).toBe(21480);
      expect(['common', 'uncommon', 'rare', 'epic', 'legendary', 'omnic']
        .map(rarity => totals[`${family}-${rarity}`])).toEqual([430, 155, 165, 160, 80, 30]);
      if (isRoseCharacter(starter.id)) expect(Object.keys(totals)).toHaveLength(6);
      else {
        expect(Object.entries(totals).find(([id]) => id.endsWith('-evolution'))?.[1]).toBe(30);
        expect(Object.entries(totals).find(([id]) => id.endsWith('-level'))?.[1]).toBe(60);
      }
    }
  });
  it('preserves ordinary recipes and uses their base rarity format with Rosethorn for Roses', () => {
    for (const starter of starters.filter(starter => !isRoseCharacter(starter.id))) {
      for (let evolution = 1; evolution <= 5; evolution++) {
        const progress = { level: characterLevelCap(evolution), evolution };
        expect(characterEvolutionCost(starter.id, progress)).toEqual(evolutionCost(starter.elementId, progress));
      }
    }
    for (const character of roseCharacters) {
      expect(characterLevelCost(character.id, { level: 75, evolution: 5 }).materials).toEqual({
        'rosethorn-common': 6, 'rosethorn-uncommon': 2, 'rosethorn-rare': 2,
        'rosethorn-epic': 2, 'rosethorn-legendary': 2,
      });
      expect(characterLevelCost(character.id, { level: 90, evolution: 6 }).materials['rosethorn-omnic']).toBe(2);
      for (let evolution = 1; evolution <= 6; evolution++) {
        for (let level = 0; level < characterLevelCap(evolution); level++) {
          expect(characterLevelCost(character.id, { level, evolution })).toEqual({
            fractalis: 10 + 2 * (level + 1), materials: Object.fromEntries(
              Object.entries(levelingMaterials('rosethorn', level + 1)).map(([id, amount]) => [id, amount * (level >= 60 ? 2 : 1)])),
          });
        }
        if (evolution < 6) expect(characterEvolutionCost(character.id, { level: characterLevelCap(evolution), evolution }))
          .toEqual({ fractalis: evolutionBalance[evolution - 1].fractalis,
            materials: Object.fromEntries(evolutionRecipes[evolution - 1].rarities.map((rarity, index) =>
              [`rosethorn-${rarity.toLowerCase()}`, evolutionBalance[evolution - 1].amounts[index] * (evolution >= 4 ? 2 : 1)])) });
      }
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
