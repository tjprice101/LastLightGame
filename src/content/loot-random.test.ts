import { describe, expect, it } from 'vitest';
import { plentifulDrops, fractalisDrop, scaledDrop } from './loot-random';
import { materialDrops, materialLoot, materialDropTable } from './dungeons';
import { infusionDrops, infusionLoot, infusionEncounter } from './infusions';
import { elementalEnemyLevel, elements } from './activities';

describe('plentiful loot quantities', () => {
  it('bounds every dungeon and infusion stack to triple normal quantities across all floors', () => {
    for (const element of elements) for (let stage = 1; stage <= 35; stage++) {
      for (const drop of materialLoot(element.id, stage)) {
        expect(drop.minimum).toBeGreaterThanOrEqual(1);
        expect(drop.minimum).toBeLessThanOrEqual(3);
        expect(drop.maximum).toBeLessThanOrEqual(6);
      }
    }
    for (const mode of ['heavens', 'abyss'] as const) for (let stage = 1; stage <= 35; stage++) {
      const pool = infusionLoot(mode, stage);
      for (const drop of [...pool.specialties, ...pool.bonuses]) {
        expect(drop.minimum).toBeGreaterThanOrEqual(1);
        expect(drop.minimum).toBeLessThanOrEqual(3);
        expect(drop.maximum).toBeLessThanOrEqual(6);
      }
    }
    expect(materialLoot('infernic', 1)[0]).toMatchObject({ minimum: 1, maximum: 2 });
    expect(materialLoot('infernic', 25)[0]).toMatchObject({ minimum: 2, maximum: 4 });
    for (let level = 1; level <= 120; level++) expect(fractalisDrop(level).maximum).toBeLessThanOrEqual(30);
  });
  it('uses independent integer draws from base to double base without adding locked items', () => {
    const draws = [0, .999999, .5];
    expect(plentifulDrops({ seed: 3, crown: 4, epic: 1 }, () => draws.shift()!))
      .toEqual({ seed: 3, crown: 8, epic: 2 });
    for (const value of [-1, 1, NaN, Infinity]) expect(() => plentifulDrops({ seed: 1 }, () => value)).toThrow('[0, 1)');
  });

  it('preserves enemy-level gates and scales every eligible stack and chance monotonically', () => {
    const previous = new Map<string, { minimum: number; chance: number }>();
    for (let stage = 1; stage <= 35; stage++) {
      const pool = materialLoot('infernic', stage);
      const drops = materialDrops('infernic', stage, () => 0);
      for (const drop of pool) {
        expect(drops[drop.id]).toBe(drop.minimum);
        expect(drop.maximum).toBe(drop.minimum * 2);
        expect(drop.minimum).toBeGreaterThanOrEqual(previous.get(drop.id)?.minimum ?? 1);
        expect(drop.chance).toBeGreaterThanOrEqual(previous.get(drop.id)?.chance ?? 0);
        previous.set(drop.id, drop);
      }
      for (const entry of materialDropTable) expect(drops[`infernic-${entry.rarity}`] !== undefined)
        .toBe(elementalEnemyLevel(stage) >= entry.level);
    }
    const final = materialLoot('infernic', 35);
    expect(final.map(({ minimum, maximum }) => [minimum, maximum])).toEqual(Array.from({ length: 6 }, () => [3, 6]));
    final.forEach((drop, index) => expect(drop.chance).toBeCloseTo([1, .98, .90, .80, .60, .35][index]));
    expect(materialDrops('infernic', 35, () => .99999)).toEqual({ 'infernic-common': 6 });
    for (let index = 1; index < final.length; index++) {
      const sequence = [0, ...Array<number>((index - 1) * 2).fill(0), final[index].chance];
      const drops = materialDrops('infernic', 35, () => sequence.shift() ?? .999999);
      expect(drops[final[index].id]).toBeUndefined();
    }
  });

  it('keeps specialty and any-element rarity gates at all Heaven and Abyss stages', () => {
    for (const mode of ['heavens', 'abyss'] as const) for (let stage = 1; stage <= 35; stage++) {
      const pool = infusionLoot(mode, stage);
      const drops = infusionDrops(mode, stage, () => 0);
      for (const drop of pool.specialties) expect(drops[drop.id]).toBe(drop.minimum);
      for (const drop of pool.bonuses) expect(drops[`${mode === 'heavens' ? 'infernic' : 'voltaic'}-${drop.rarity}`]).toBe(drop.minimum);
      const { level } = infusionEncounter(mode, stage);
      expect(drops[`${mode}-evolution`] !== undefined).toBe(level >= 93);
      expect(drops[`${mode}-level`] !== undefined).toBe(level >= 100);
    }
  });

  it('scales currency in every mode, preserves opening drops, and validates configuration', () => {
    expect(fractalisDrop(1)).toEqual({ minimum: 5, maximum: 10, chance: 1 });
    expect(fractalisDrop(120)).toEqual({ minimum: 15, maximum: 30, chance: 1 });
    for (const mode of ['heavens', 'abyss'] as const) {
      const pool = infusionLoot(mode, 35);
      for (const drop of [...pool.specialties, ...pool.bonuses]) {
        expect([drop.minimum, drop.maximum]).toEqual([3, 6]);
      }
    }
    for (let level = 2; level <= 120; level++) expect(fractalisDrop(level).minimum).toBeGreaterThanOrEqual(fractalisDrop(level - 1).minimum);
    for (const level of [0, 121, 1.5, NaN]) expect(() => fractalisDrop(level)).toThrow();
    expect(() => scaledDrop(120, 10, 23, .25, 2, 40)).toThrow();
    for (const chance of [NaN, Infinity, 0, -1]) expect(() => scaledDrop(120, 10, 23, chance, 1, 40)).toThrow();
    for (const start of [0, 120, 10.5, NaN]) expect(() => scaledDrop(120, start, 23, .25, .98, 40)).toThrow();
  });
});
