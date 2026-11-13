import { describe, expect, it } from 'vitest';
import { artifactSlots, currencies, fractureRules, characterLevelCap, characterGrowthFactor, upgradePaths,
  characterEvolutionCost, evolutionCost, characterLevelCost, levelingMaterials, evolutionBalance, displayEvolution, rarityRank,
  convergentLightRankCap, convergentLightRankCost, convergentLightRules, convergentLightTier } from './progression';
import { evolutionRecipes } from './activities';
import { availableStarters, starters, isRoseCharacter, roseCharacters } from './starters';
import { isCalamiticCharacter, calamiticCharacters } from './calamitic-characters';
import { newEventForCharacter } from './moon-sunshade-events';
import { loadMotion, saveMotion, SETTINGS_KEY } from '../presentation/settings';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';

describe('displayed evolution rarity rank', () => {
  it('keeps ordinary evolution numbers aligned with Common through Omnic', () => {
    for (const starter of starters.filter(starter => !isCalamiticCharacter(starter.id))) {
      expect([1, 2, 3, 4, 5, 6].map(evolution => displayEvolution(starter.id, evolution))).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it('displays Calamitic internal evolutions 1-6 as rarity ranks 2-7', () => {
    for (const character of calamiticCharacters) {
      expect([1, 2, 3, 4, 5, 6].map(evolution => displayEvolution(character.id, evolution))).toEqual([2, 3, 4, 5, 6, 7]);
    }
    expect((['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Omnic', 'Calamitic'] as const).map(rarityRank))
      .toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('confirmed game foundation', () => {
  it('doubles late Element-Bearer materials exactly once, keeps currency and verifies full-progression totals', () => {
    for (const starter of starters.filter(starter => !isCalamiticCharacter(starter.id))) {
      const totals: Record<string, number> = {};
      let currency = 0, level = 0;
      const event = newEventForCharacter(starter.id);
      const family = event?.family ?? (isRoseCharacter(starter.id) ? 'rosethorn' : starter.elementId);
      const add = (cost: ReturnType<typeof characterLevelCost>) => {
        currency += cost.fractalis;
        for (const [id, amount] of Object.entries(cost.materials)) totals[id] = (totals[id] ?? 0) + amount;
      };
      for (let evolution = 1; evolution <= 6; evolution++) {
        while (level < characterLevelCap(evolution)) {
          const cost = characterLevelCost(starter.id, { level, evolution }), destination = level + 1;
          const multiplier = destination >= 61 ? 2 : 1;
          const expected = Object.fromEntries(Object.entries(levelingMaterials(family, destination))
            .map(([id, amount]) => [id, Math.ceil(amount * multiplier * 1.5)]));
          if (!isRoseCharacter(starter.id) && !event && evolution >= 5) {
            const specialty = starter.elementId === 'chaotic' || starter.elementId === 'tranquilitic' ? 'abyss' : 'heavens';
            expected[`${specialty}-level`] = Math.ceil(multiplier * 1.5);
          }
          expect(cost).toEqual({ fractalis: 10 + 2 * destination, materials: expected });
          add(cost); level++;
        }
        if (evolution < 6) add(characterEvolutionCost(starter.id, { level, evolution }));
      }
      expect(currency).toBe(21480);
      expect(['common', 'uncommon', 'rare', 'epic', 'legendary', 'omnic']
        .map(rarity => totals[`${family}-${rarity}`])).toEqual([661, 248, 255, 240, 120, 45]);
      if (isRoseCharacter(starter.id) || event) expect(Object.keys(totals)).toHaveLength(6);
      else {
        expect(Object.entries(totals).find(([id]) => id.endsWith('-evolution'))?.[1]).toBe(45);
        expect(Object.entries(totals).find(([id]) => id.endsWith('-level'))?.[1]).toBe(90);
      }
    }
  });
  it('preserves ordinary recipes and uses their base rarity format with Rosethorn for Roses', () => {
    for (const starter of starters.filter(starter => !isRoseCharacter(starter.id) &&
      !newEventForCharacter(starter.id) && !isCalamiticCharacter(starter.id))) {
      for (let evolution = 1; evolution <= 5; evolution++) {
        const progress = { level: characterLevelCap(evolution), evolution };
        expect(characterEvolutionCost(starter.id, progress)).toEqual(evolutionCost(starter.elementId, progress));
      }
    }
    for (const character of roseCharacters) {
      expect(characterLevelCost(character.id, { level: 75, evolution: 5 }).materials).toEqual({
        'rosethorn-common': 9, 'rosethorn-uncommon': 3, 'rosethorn-rare': 3,
        'rosethorn-epic': 3, 'rosethorn-legendary': 3,
      });
      expect(characterLevelCost(character.id, { level: 90, evolution: 6 }).materials['rosethorn-omnic']).toBe(3);
      for (let evolution = 1; evolution <= 6; evolution++) {
        for (let level = 0; level < characterLevelCap(evolution); level++) {
          expect(characterLevelCost(character.id, { level, evolution })).toEqual({
            fractalis: 10 + 2 * (level + 1), materials: Object.fromEntries(
              Object.entries(levelingMaterials('rosethorn', level + 1)).map(([id, amount]) => [id, Math.ceil(amount * (level >= 60 ? 2 : 1) * 1.5)])),
          });
        }
        if (evolution < 6) expect(characterEvolutionCost(character.id, { level: characterLevelCap(evolution), evolution }))
          .toEqual({ fractalis: evolutionBalance[evolution - 1].fractalis,
            materials: Object.fromEntries(evolutionRecipes[evolution - 1].rarities.map((rarity, index) =>
              [`rosethorn-${rarity.toLowerCase()}`, Math.ceil(evolutionBalance[evolution - 1].amounts[index] * (evolution >= 4 ? 2 : 1) * 1.5)])) });
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
      'Fracture & Evolution', 'Character level', 'Unique passive', 'Ability 1', 'Ability 2', 'Convergent Light',
    ]);
    expect(upgradePaths[5].detail).toContain('saved Convergent Light rank');
  });
  it('caps saved Convergent Light ranks by level and evolution and calculates milestone costs', () => {
    expect(convergentLightRules).toEqual({ maximumRank: 20, levelsPerRank: 5, glimmeringEvolution: 4, ultimateEvolution: 6 });
    expect(convergentLightTier(1)).toBe('sparkling');
    expect(convergentLightTier(5)).toBe('sparkling');
    expect(convergentLightTier(6)).toBe('glimmering');
    expect(convergentLightTier(10)).toBe('glimmering');
    expect(convergentLightTier(11)).toBe('ultimate');
    expect(convergentLightTier(20)).toBe('ultimate');
    expect(convergentLightRankCap({ level: 20, evolution: 3 }, 'ember')).toBe(5);
    expect(convergentLightRankCap({ level: 25, evolution: 4 }, 'ember')).toBe(6);
    expect(convergentLightRankCap({ level: 50, evolution: 6 }, 'ember')).toBe(11);
    expect(convergentLightRankCap({ level: 105, evolution: 6 }, 'ember')).toBe(20);
    const progress = { level: 5, evolution: 1, convergenceRank: 1 };
    expect(convergentLightRankCost('ember', progress)).toEqual(characterLevelCost('ember', { level: 0, evolution: 1 }));
    expect(() => convergentLightRankCost('ember', { level: 4, evolution: 1, convergenceRank: 1 })).toThrow('Reach');
  });
  it('defines additive linear growth, preserved levels and six increasing caps', () => {
    expect(fractureRules).toEqual({
      sourceTier: 1, destinationTier: 2, levelCap: 30, preservesLevel: true, lycalisReward: 10,
    });
    expect(upgradePaths[0].detail).toContain('Preserve your level');
    expect(upgradePaths[0].detail).toContain('150% of base');
    expect([1, 2, 3, 4, 5, 6].map(evolution => characterLevelCap(evolution))).toEqual([30, 45, 60, 75, 90, 105]);
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
