import { describe, expect, it } from 'vitest';
import { plentifulDrops, fractalisDrop, scaledDrop, storyEnemyFractalisDrop, storyFractalisDrop, treasuryFractalisDrop } from './loot-random';
import { storyEncounter, storyLoot, storyRules } from './story';
import { materialBracket, materialDrops, materialLoot, materialRarities } from './dungeons';
import { infusionDrops, infusionLoot, infusionEncounter } from './infusions';
import { elementalEnemyLevel, elements, infusionModeStageCount } from './activities';
import { bossLootRange, bossLootMultiplier } from './final-boss-loot';

describe('Story and Treasury Prismatica (D-225)', () => {
  it('gives Story a constant per-level step, so Prismatica rises linearly across all stages', () => {
    for (let level = 1; level < 120; level += 1) {
      expect(storyFractalisDrop(level + 1).minimum - storyFractalisDrop(level).minimum).toBe(2);
      expect(storyFractalisDrop(level).maximum).toBe(storyFractalisDrop(level).minimum * 2);
    }
    expect(storyFractalisDrop(1)).toEqual({ minimum: 5, maximum: 10, chance: 1 });
    expect(storyFractalisDrop(55)).toEqual({ minimum: 113, maximum: 226, chance: 1 });
    for (const level of [0, 121, 1.5, NaN]) expect(() => storyFractalisDrop(level)).toThrow();
    for (let stage = 1; stage <= storyRules.stages; stage += 1) {
      const encounter = storyEncounter(stage);
      const range = bossLootRange(storyEnemyFractalisDrop(encounter.level, encounter.boss), bossLootMultiplier({ story: { storyStage: stage } }));
      expect(storyLoot(stage).find((drop) => drop.id === 'fractalis')).toMatchObject(range);
    }
  });

  it('matches the Story line at Treasury entry, then climbs strictly faster to 20x', () => {
    expect(treasuryFractalisDrop(65)).toEqual(storyFractalisDrop(65));
    let previousStep = 0;
    for (let level = 66; level <= 120; level += 1) {
      const step = treasuryFractalisDrop(level).minimum - treasuryFractalisDrop(level - 1).minimum;
      expect(step).toBeGreaterThan(previousStep);
      expect(treasuryFractalisDrop(level).minimum).toBeGreaterThan(storyFractalisDrop(level).minimum);
      previousStep = step;
    }
    expect(treasuryFractalisDrop(120).minimum).toBe(storyFractalisDrop(120).minimum * 20);
  });
});

describe('plentiful loot quantities', () => {
  it('bounds every dungeon and infusion stack to triple normal quantities across all floors', () => {
    for (const element of elements) for (let stage = 1; stage <= 35; stage++) {
      for (const drop of materialLoot(element.id, stage)) {
        expect(drop.chance).toBe(1);
        expect(drop.minimum).toBeGreaterThanOrEqual(stage === 35 ? 10 : 2);
        expect(drop.maximum).toBeLessThanOrEqual(stage === 35 ? 150 : 30);
      }
    }
    for (const mode of ['heavens', 'abyss'] as const) for (let stage = 1; stage <= infusionModeStageCount; stage++) {
      const pool = infusionLoot(mode, stage);
      for (const drop of [...pool.specialties, ...pool.bonuses]) {
        expect(drop.minimum).toBeGreaterThanOrEqual(1);
        expect(drop.minimum).toBeLessThanOrEqual(stage === infusionModeStageCount ? 15 : 3);
        expect(drop.maximum).toBeLessThanOrEqual(stage === infusionModeStageCount ? 30 : 6);
      }
    }
    expect(materialLoot('infernic', 1)[0]).toMatchObject({ minimum: 8, maximum: 10 });
    expect(materialLoot('infernic', 25)[0]).toMatchObject({ minimum: 25, maximum: 30 });
    for (let level = 1; level <= 120; level++) expect(fractalisDrop(level).maximum).toBeLessThanOrEqual(30);
  });
  it('uses independent integer draws from base to double base without adding locked items', () => {
    const draws = [0, .999999, .5];
    expect(plentifulDrops({ seed: 3, crown: 4, epic: 1 }, () => draws.shift()!))
      .toEqual({ seed: 3, crown: 8, epic: 2 });
    for (const value of [-1, 1, NaN, Infinity]) expect(() => plentifulDrops({ seed: 1 }, () => value)).toThrow('[0, 1)');
  });

  it('guarantees every bracket rarity and never shrinks a stack as floors rise', () => {
    const previous = new Map<string, { minimum: number; maximum: number }>();
    for (let stage = 1; stage <= 34; stage++) {
      const pool = materialLoot('infernic', stage);
      const low = materialDrops('infernic', stage, () => 0);
      const high = materialDrops('infernic', stage, () => .999999);
      expect(pool.map(drop => drop.id)).toEqual(Object.keys(materialBracket(stage).ranges).map(rarity => `infernic-${rarity}`));
      for (const drop of pool) {
        expect(drop.chance).toBe(1);
        expect(low[drop.id]).toBe(drop.minimum);
        expect(high[drop.id]).toBe(drop.maximum);
        expect(drop.minimum).toBeGreaterThanOrEqual(previous.get(drop.id)?.minimum ?? 2);
        expect(drop.maximum).toBeGreaterThanOrEqual(previous.get(drop.id)?.maximum ?? 3);
        previous.set(drop.id, drop);
      }
      const rarities = pool.map(drop => drop.id.slice('infernic-'.length));
      expect(rarities).toEqual(materialRarities.slice(0, rarities.length));
    }
    const final = materialLoot('infernic', 35);
    expect(final.map(({ minimum, maximum }) => [minimum, maximum])).toEqual([[125, 150], [80, 100], [60, 75], [40, 50], [25, 30], [10, 15]]);
  });

  it('keeps specialty and any-element rarity gates at all Heaven and Abyss stages', () => {
    for (const mode of ['heavens', 'abyss'] as const) for (let stage = 1; stage <= infusionModeStageCount; stage++) {
      const pool = infusionLoot(mode, stage);
      const drops = infusionDrops(mode, stage, () => 0);
      for (const drop of pool.specialties) expect(drops[drop.id]).toBe(drop.minimum);
      for (const drop of pool.bonuses) expect(drops[`${mode === 'heavens' ? 'infernic' : 'tranquilitic'}-${drop.rarity}`]).toBe(drop.minimum);
      const { level } = infusionEncounter(mode, stage);
      expect(drops[`${mode}-evolution`] !== undefined).toBe(level >= 75);
      expect(drops[`${mode}-level`] !== undefined).toBe(level >= 75);
    }
  });

  it('scales currency in every mode, preserves opening drops, and validates configuration', () => {
    expect(fractalisDrop(1)).toEqual({ minimum: 5, maximum: 10, chance: 1 });
    expect(fractalisDrop(120)).toEqual({ minimum: 15, maximum: 30, chance: 1 });
    for (const mode of ['heavens', 'abyss'] as const) {
      const pool = infusionLoot(mode, infusionModeStageCount);
      for (const drop of [...pool.specialties, ...pool.bonuses]) {
        expect([drop.minimum, drop.maximum]).toEqual([15, 30]);
      }
    }
    for (let level = 2; level <= 120; level++) expect(fractalisDrop(level).minimum).toBeGreaterThanOrEqual(fractalisDrop(level - 1).minimum);
    for (const level of [0, 121, 1.5, NaN]) expect(() => fractalisDrop(level)).toThrow();
    expect(() => scaledDrop(120, 10, 23, .25, 2, 40)).toThrow();
    for (const chance of [NaN, Infinity, 0, -1]) expect(() => scaledDrop(120, 10, 23, chance, 1, 40)).toThrow();
    for (const start of [0, 120, 10.5, NaN]) expect(() => scaledDrop(120, start, 23, .25, .98, 40)).toThrow();
  });
});
