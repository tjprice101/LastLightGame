import { describe, expect, it } from 'vitest';
import { plentifulDrops, fractalisDrop, scaledDrop } from './loot-random';
import { activityPrismaticaDrop } from './prismatica';
import { storyEncounter, storyLoot, storyRules } from './story';
import { materialBracket, materialDrops, materialLoot, materialRarities } from './dungeons';
import { infusionDrops, infusionLoot } from './infusions';
import { elementalEnemyLevel, elements, infusionModeStageCount } from './activities';

describe('Story and Treasury Prismatica (D-428)', () => {
  it('uses the same smooth stage-based Story range in live loot', () => {
    for (let stage = 1; stage <= storyRules.stages; stage += 1) {
      const encounter = storyEncounter(stage);
      const range = activityPrismaticaDrop({ story: { storyStage: stage } }, encounter.level);
      expect(storyLoot(stage).find((drop) => drop.id === 'fractalis')).toMatchObject(range);
    }
  });

  it('grows Treasury linearly by stage without an extra final multiplier', () => {
    for (let stage = 1; stage <= 25; stage++) {
      expect(activityPrismaticaDrop({ infusion: { mode: 'treasury', stage } }, 65))
        .toEqual({ minimum: Math.round(133 + 29867 * (stage - 1) / 24),
          maximum: Math.round(266 + 59734 * (stage - 1) / 24), chance: 1 });
    }
  });
});

describe('plentiful loot quantities', () => {
  it('bounds linear dungeon and infusion stacks across all floors', () => {
    for (const element of elements) for (let stage = 1; stage <= 35; stage++) {
      for (const drop of materialLoot(element.id, stage)) {
        expect(drop.chance).toBe(1);
        expect(drop.minimum).toBeGreaterThanOrEqual(1);
        expect(drop.maximum).toBeLessThanOrEqual(9);
      }
    }
    for (const mode of ['heavens', 'abyss'] as const) for (let stage = 1; stage <= infusionModeStageCount; stage++) {
      const pool = infusionLoot(mode, stage);
      for (const drop of [...pool.specialties, ...pool.bonuses]) {
        expect(drop.minimum).toBeGreaterThanOrEqual(1);
        expect(drop.minimum).toBeLessThanOrEqual(11);
        expect(drop.maximum).toBeLessThanOrEqual(23);
      }
    }
    expect(materialLoot('infernic', 1)[0]).toMatchObject({ minimum: 1, maximum: 2 });
    expect(materialLoot('infernic', 25)[0]).toMatchObject({ minimum: 6, maximum: 7 });
    for (let level = 1; level <= 120; level++) expect(fractalisDrop(level).maximum).toBeLessThanOrEqual(600);
  });
  it('uses independent integer draws from base to double base without adding locked items', () => {
    const draws = [0, .999999, .5];
    expect(plentifulDrops({ seed: 3, crown: 4, epic: 1 }, () => draws.shift()!))
      .toEqual({ seed: 3, crown: 8, epic: 2 });
    for (const value of [-1, 1, NaN, Infinity]) expect(() => plentifulDrops({ seed: 1 }, () => value)).toThrow('[0, 1)');
  });

  it('guarantees every bracket rarity while quantities grow linearly', () => {
    for (let stage = 1; stage <= 34; stage++) {
      const pool = materialLoot('infernic', stage);
      const low = materialDrops('infernic', stage, () => 0);
      const high = materialDrops('infernic', stage, () => .999999);
      expect(pool.map(drop => drop.id)).toEqual(Object.keys(materialBracket(stage).ranges).map(rarity => `infernic-${rarity}`));
      for (const drop of pool) {
        expect(drop.chance).toBe(1);
        expect(low[drop.id]).toBe(drop.minimum);
        expect(high[drop.id]).toBe(drop.maximum);
        expect(drop.minimum).toBeGreaterThanOrEqual(1);
        expect(drop.maximum).toBeGreaterThanOrEqual(drop.minimum);
      }
      const rarities = pool.map(drop => drop.id.slice('infernic-'.length));
      expect(rarities).toEqual(materialRarities.slice(0, rarities.length));
    }
    const final = materialLoot('infernic', 35);
    expect(final.map(({ minimum, maximum }) => [minimum, maximum])).toEqual([[8, 9], [5, 6], [4, 5], [2, 3], [2, 2], [1, 2]]);
  });

  it('keeps specialty and any-element rarity gates at all Heaven and Abyss stages', () => {
    for (const mode of ['heavens', 'abyss'] as const) for (let stage = 1; stage <= infusionModeStageCount; stage++) {
      const pool = infusionLoot(mode, stage);
      const drops = infusionDrops(mode, stage, () => 0);
      for (const drop of pool.specialties) expect(drops[drop.id]).toBe(drop.minimum);
      for (const drop of pool.bonuses) expect(drops[`${mode === 'heavens' ? 'infernic' : 'tranquilitic'}-${drop.rarity}`]).toBe(drop.minimum);
      expect(drops[`${mode}-evolution`]).toBeDefined();
      expect(drops[`${mode}-level`]).toBeDefined();
      expect(drops[`${mode}-weapon`]).toBeUndefined();
    }
  });

  it('scales currency in every mode, preserves opening drops, and validates configuration', () => {
    expect(fractalisDrop(1)).toEqual({ minimum: 5, maximum: 10, chance: 1 });
    expect(fractalisDrop(120)).toEqual({ minimum: 300, maximum: 600, chance: 1 });
    for (const mode of ['heavens', 'abyss'] as const) {
      const pool = infusionLoot(mode, infusionModeStageCount);
      for (const drop of [...pool.specialties, ...pool.bonuses]) {
        expect([drop.minimum, drop.maximum]).toEqual([11, 23]);
      }
    }
    for (let level = 2; level <= 120; level++) expect(fractalisDrop(level).minimum).toBeGreaterThanOrEqual(fractalisDrop(level - 1).minimum);
    for (const level of [0, 121, 1.5, NaN]) expect(() => fractalisDrop(level)).toThrow();
    expect(() => scaledDrop(120, 10, 23, .25, 2, 40)).toThrow();
    for (const chance of [NaN, Infinity, 0, -1]) expect(() => scaledDrop(120, 10, 23, chance, 1, 40)).toThrow();
    for (const start of [0, 120, 10.5, NaN]) expect(() => scaledDrop(120, start, 23, .25, .98, 40)).toThrow();
  });
});
