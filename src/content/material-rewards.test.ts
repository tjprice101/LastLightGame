import { describe, expect, it, vi } from 'vitest';
import { furtherMaterialRewardRange, materialRewardAmount, materialRewardRange, rollDrop, validDropAmount } from './loot-random';
import { materialLoot } from './dungeons';
import { infusionLoot, infusionDrops } from './infusions';
import { oblivionMaterialLoot, oblivionFragmentDrop } from './gates-of-oblivion';
import { calamityActivities, calamityChest, calamityLootTable, rollCalamityChest } from './calamity';
import { bannerMaterialTiers, bannerDuplicateMaterialAmount, newEventDuplicateMaterials } from './banner-materials';
import { storyMaterialLoot } from './story';
import { bossLootRange } from './final-boss-loot';

const finalRanges = [[5, 6], [4, 4], [3, 4], [2, 3], [2, 2], [1, 2]];
const ranges = (drops: readonly { minimum: number; maximum: number }[]) => drops.map(drop => [drop.minimum, drop.maximum]);
const furtherRanges = (values: number[][]) => values.map(range => range.map(amount => Math.max(1, Math.round(amount * .65))));

describe('future material reward quantities', () => {
  it('stacks the35% cut on already-rounded quantities, preserving RNG and exact reachable values', () => {
    for (const chance of [1, .25]) {
      const base = { minimum: 1, maximum: 30, chance, quantityMultiplier: 5 };
      const reduced = furtherMaterialRewardRange(materialRewardRange({ ...base, minimum: 5 }));
      const reachable = new Set([5, 10, 15, 20, 25, 30].map(amount => Math.max(1, Math.round(Math.round(amount * .5) * .65))));
      for (let roll = 0; roll < 1; roll += .01) {
        const originalRandom = vi.fn(() => roll), reducedRandom = vi.fn(() => roll);
        const original = rollDrop({ ...base, minimum: 5 }, originalRandom);
        const actual = rollDrop(reduced, reducedRandom);
        expect(actual).toBe(original === undefined ? undefined : Math.max(1, Math.round(Math.round(original * .5) * .65)));
        expect(reducedRandom.mock.calls).toEqual(originalRandom.mock.calls);
        if (actual !== undefined) reachable.add(actual);
      }
      for (let amount = 0; amount <= reduced.maximum + 1; amount++) {
        expect(validDropAmount(reduced, amount)).toBe(reachable.has(amount));
      }
      expect(() => furtherMaterialRewardRange(reduced)).toThrow();
      expect(() => rollDrop({ ...reduced, maximum: reduced.maximum + 1 }, () => 0)).toThrow();
    }
  });
  it('rounds positive rewards once to the nearest whole unit, with a minimum of1', () => {
    expect([1, 2, 3, 5, 7, 10, 12, 15].map(amount => materialRewardAmount(amount)))
      .toEqual([1, 1, 2, 3, 4, 5, 6, 8]);
    expect([1, 3, 9, 10, 15, 30, 60].map(amount => materialRewardAmount(amount, .85)))
      .toEqual([1, 3, 8, 9, 13, 26, 51]);
    for (const amount of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => materialRewardAmount(amount)).toThrow('Invalid material reward');
    }
    expect(() => materialRewardAmount(2, .25)).toThrow();
    expect(() => materialRewardRange(materialRewardRange({ minimum: 1, maximum: 2, chance: 1 }))).toThrow('already reduced');
  });

  it('preserves every authored chance and random draw, including failures and collapsed/odd ranges', () => {
    for (const chance of [1, .25, .8]) for (const factor of [.5, .85]) {
      for (const base of [{ minimum: 1, maximum: 2, chance }, { minimum: 3, maximum: 7, chance },
        { minimum: 10, maximum: 12, chance }, bossLootRange({ minimum: 1, maximum: 6, chance }, 5)]) {
        const reduced = materialRewardRange(base, factor);
        for (const roll of [0, .1, .25, .49, .5, .75, .999999]) {
          const originalRandom = vi.fn(() => roll), reducedRandom = vi.fn(() => roll);
          const original = rollDrop(base, originalRandom);
          const actual = rollDrop(reduced, reducedRandom);
          expect(actual).toBe(original === undefined ? undefined : Math.max(1, Math.round(original * factor)));
          expect(reducedRandom.mock.calls).toEqual(originalRandom.mock.calls);
          if (actual !== undefined) expect(validDropAmount(reduced, actual)).toBe(true);
        }
        expect(reduced.chance).toBe(chance);
      }
    }
    const drop = materialRewardRange({ minimum: 10, maximum: 12, chance: 1 });
    expect([.1, .4, .9].map(roll => rollDrop(drop, () => roll))).toEqual([5, 6, 6]);
    expect(() => rollDrop(drop, () => 1)).toThrow('[0, 1)');
    expect(() => rollDrop({ ...drop, maximum: 99 }, () => 0)).toThrow('Invalid reduced');
    expect(() => materialRewardRange({ minimum: 4, maximum: 2, chance: 1 })).toThrow();
  });

  it('keeps the exact reachable post-boss quantities rather than accepting forged integers between bounds', () => {
    const drop = materialRewardRange(bossLootRange({ minimum: 1, maximum: 6, chance: 1 }, 5));
    const reachable = new Set([3, 5, 8, 10, 13, 15]);
    for (let amount = 0; amount <= 16; amount++) expect(validDropAmount(drop, amount)).toBe(reachable.has(amount));
    expect(validDropAmount(drop, 3.5)).toBe(false);
    expect(validDropAmount({ minimum: 5, maximum: 15, chance: 1, quantityMultiplier: 5 }, 6)).toBe(false);
  });

  it('shows exact early, middle and final dungeon ranges without changing unlocks or family IDs', () => {
    expect(ranges(materialLoot('infernic', 1))).toEqual([[1, 1], [1, 1]]);
    expect(ranges(materialLoot('infernic', 18))).toEqual(furtherRanges([[3, 4], [2, 3], [2, 2], [1, 2]]));
    expect(ranges(materialLoot('infernic', 35))).toEqual(furtherRanges(finalRanges));
    expect(materialLoot('infernic', 5).map(drop => drop.id)).toEqual(['infernic-common', 'infernic-uncommon']);
    expect(materialLoot('infernic', 6).map(drop => drop.id)).toEqual(['infernic-common', 'infernic-uncommon', 'infernic-rare']);
  });

  it.each(['roses', 'moon', 'sunshade'] as const)('%s shares the ordinary family reduction, never a chest exception', mode => {
    expect(ranges(infusionLoot(mode, 1).specialties)).toEqual([[1, 1], [1, 1], [1, 1], [1, 1], [1, 1]]);
    expect(ranges(infusionLoot(mode, 18).specialties)).toEqual([[3, 4], [2, 3], [2, 3], [2, 2], [1, 2], [1, 1]]);
    expect(ranges(infusionLoot(mode, 35).specialties)).toEqual(finalRanges);
    for (const stage of [1, 18, 35]) {
      const drops = infusionDrops(mode, stage, () => .999999);
      expect(drops).toEqual(Object.fromEntries(infusionLoot(mode, stage).specialties.map(drop => [drop.id, drop.maximum])));
    }
  });

  it.each(['heavens', 'abyss'] as const)('%s specialty amounts reduce without changing schedules or final currency/capture boosts', mode => {
    for (const schedule of ['caps', 'legacy'] as const) {
      expect(ranges(infusionLoot(mode, 1, schedule).specialties)).toEqual([[1, 1], [1, 1]]);
      expect(ranges(infusionLoot(mode, 8, schedule).specialties)).toEqual(furtherRanges([[2, 3], [3, 3]]));
      expect(ranges(infusionLoot(mode, 15, schedule).specialties)).toEqual(furtherRanges([[4, 4], [4, 5]]));
    }
  });

  it('covers Gates family materials, but not Fragment of Rise probabilities/quantities', () => {
    expect(ranges(oblivionMaterialLoot(1))).toEqual([[1, 1], [1, 1]]);
    expect(ranges(oblivionMaterialLoot(13))).toEqual(furtherRanges([[3, 4], [2, 3], [2, 2], [1, 2]]));
    expect(ranges(oblivionMaterialLoot(25))).toEqual(furtherRanges(finalRanges));
    expect(oblivionFragmentDrop(19, false)).toBeUndefined();
    expect(oblivionFragmentDrop(20, false)).toEqual({ minimum: 1, maximum: 1, chance: .1 });
    expect(oblivionFragmentDrop(25, true)).toEqual({ minimum: 1, maximum: 1, chance: 1 });
  });

  it('reduces Story and banner family rewards, preserving probability/quantity metadata and duplicate rounding', () => {
    expect(ranges(storyMaterialLoot(1))).toEqual([[1, 1], [1, 1]]);
    expect(ranges(storyMaterialLoot(120))).toEqual([[8, 15], [8, 15]]);
    expect(storyMaterialLoot(1)[1].chance).toBe(.25);
    expect(bannerMaterialTiers.map(tier => [tier.weight, tier.amount])).toEqual([[50, 5], [30, 3], [17, 2]]);
    expect(bannerDuplicateMaterialAmount).toBe(8);
    expect(newEventDuplicateMaterials('moonwake')).toEqual({ id: 'moonwake-rare', amount: 8 });
    expect(newEventDuplicateMaterials('dawnforge')).toEqual({ id: 'dawnforge-rare', amount: 8 });
  });

  it('reduces each Calamity material bundle15%, with identical weights/draw counts and nonmaterial contents', () => {
    for (const { id: activity } of calamityActivities) for (const tier of [1, 2, 3] as const) {
      const chest = calamityChest(activity, tier), table = calamityLootTable(activity);
      expect(chest.bundles).toBe([3, 5, 7][tier - 1]);
      expect(chest).toMatchObject({ fractalis: [100000, 250000, 500000][tier - 1],
        lycalis: [50, 70, 100][tier - 1], calamiticTokens: [1, 3, 8][tier - 1],
        masterChests: activity === 'machines' && tier === 3 ? 2 : 0 });
      let offset = 0;
      for (const row of table) {
        if (row.kind === 'material') {
          const source = row.quantitySource;
          if (!source) throw new Error('Calamity material source range is missing.');
          expect(source.factor).toBe(.85);
          for (const roll of [0, .5, .999999]) {
            const random = vi.fn().mockImplementation(() => random.mock.calls.length % 2 === 1
              ? (offset + row.weight / 2) / 100 : roll);
            const reward = rollCalamityChest(activity, tier, random);
            const authored = source.minimum + Math.floor(roll * (source.maximum - source.minimum + 1));
            expect(reward.materials[row.id!]).toBe(Math.max(1, Math.round(authored * .85)) * chest.bundles);
            expect(reward.materials).toEqual({ ...chest.guaranteedMaterials, [row.id!]: reward.materials[row.id!] });
            expect(reward).toMatchObject({ fractalis: chest.fractalis, lycalis: chest.lycalis,
              devourerCopies: chest.devourerCopies, calamiticTokens: chest.calamiticTokens });
            expect(random).toHaveBeenCalledTimes(chest.bundles * 2);
          }
        } else expect(row.quantitySource).toBeUndefined();
        offset += row.weight;
      }
    }
    expect(calamityLootTable('roses').map(row => [row.weight, row.min, row.max]))
      .toEqual([[10, 26, 51], [15, 17, 34], [25, 13, 26], [25, 9, 17], [15, 5, 10], [10, 3, 5]]);
  });
});
