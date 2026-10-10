import { describe, expect, it } from 'vitest';
import { fighters, formatStat, resolveFighter, shatterGauge } from './combat';
import { openingStarters as starters } from './starters';
import { characterLevelCap, characterGrowthFactor, characterPotencyFactor } from './progression';

describe('character stat and kit growth', () => {
  it.each(starters)('$name preserves its original base kit without mutating definitions', (starter) => {
    const original = structuredClone(fighters[starter.id]);
    const kit = resolveFighter(starter.id);
    expect(kit.stats.health).toBe(original.stats.health);
    expect(kit.stats.defense).toBe(original.stats.defense + original.passive.defenseBonus);
    expect(kit.stats.critMultiplier).toBe(1.5);
    expect(kit.stats.shatterCapacity).toBe(100);
    for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
      expect(kit.abilities[action].name).toBe(original.abilities[action].name);
      expect(kit.abilities[action].strength).toEqual(original.abilities[action].strength);
      expect(kit.abilities[action].cooldown).toBe(original.abilities[action].cooldown);
    }
    if (starter.id === 'sprout') expect(kit.abilities.ultimate.description).toContain('spent before healing');
    kit.stats.health = 1;
    expect(fighters[starter.id]).toEqual(original);
  });

  it.each(starters)('$name uses accelerating core growth and separate bounded potency through every level/form', (starter) => {
    const base = resolveFighter(starter.id);
    for (let evolution = 1; evolution <= 6; evolution++) for (let level = 0; level <= characterLevelCap(evolution); level++) {
      const progress = { level, evolution };
      const kit = resolveFighter(starter.id, progress);
      const factor = (1 + level * .03) ** 3 * 1.45 ** (evolution - 1);
      const potency = 1 + level * .003 + (evolution - 1) * .05;
      for (const key of ['health', 'damage', 'elementalDamage'] as const) expect(kit.stats[key]).toBeCloseTo(base.stats[key] * factor);
      expect(kit.stats.defense).toBeCloseTo(base.stats.defense * factor ** .7);
      expect(kit.stats.shatterCapacity).toBeCloseTo(100 * potency);
      expect(kit.stats.crit).toBeCloseTo(Math.min(.75, base.stats.crit * potency));
      expect(kit.stats.critMultiplier).toBeCloseTo(Math.min(3, 1.5 * potency));
      expect(kit.passive.healFraction).toBeLessThanOrEqual(.1);
      expect(kit.passive.damageBonus).toBeLessThanOrEqual(.75);
      for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
        expect(kit.abilities[action].cooldown).toBe(base.abilities[action].cooldown);
        for (const key of ['damageMultiplier', 'burnMultiplier', 'shield', 'healing'] as const) {
          const value = base.abilities[action].strength[key];
          if (value === undefined) expect(kit.abilities[action].strength[key]).toBeUndefined();
          else expect(kit.abilities[action].strength[key]).toBeCloseTo(value * (key === 'shield' || key === 'healing' ? factor : potency));
        }
        expect(kit.abilities[action].strength.weakenFraction ?? 0).toBeLessThanOrEqual(.5);
        expect(kit.abilities[action].strength.critBonus ?? 0).toBeLessThanOrEqual(.5);
      }
      if (level) expect(kit.stats.health).toBeGreaterThan(resolveFighter(starter.id, { level: level - 1, evolution }).stats.health);
    }
    expect(shatterGauge.costs).toEqual({ light: 0, defend: 0, skill1: 25, skill2: 40, ultimate: 100 });
    expect(shatterGauge.gains.light).toBe(20);
  });

  it('descriptions use the same resolved flat and percentage strengths as combat', () => {
    const progress = { level: 30, evolution: 2 };
    const factor = characterGrowthFactor(progress);
    const potency = characterPotencyFactor(progress);
    const ember = resolveFighter('ember', progress);
    expect(ember.abilities.skill1.description).toContain(`${formatStat(1.6 * potency * 100)}%`);
    expect(ember.abilities.skill1.description).toContain(`burn for ${Math.round(8 * factor * potency)} damage`);
    expect(ember.passive.description).toContain(`+${formatStat(.2 * potency * 100)}%`);
    const tide = resolveFighter('tide', progress);
    expect(tide.passive.description).toContain(`+${formatStat(8 * factor ** .7)} defense`);
    expect(tide.abilities.skill1.description).toContain(`${formatStat(.25 * potency * 100)}%`);
    expect(tide.abilities.skill2.description).toContain(`${formatStat(25 * factor)} shield`);
    const flora = resolveFighter('sprout', progress);
    expect(flora.abilities.skill2.description).toContain(`${formatStat(30 * factor)} health`);
    expect(flora.passive.description).toContain(`${formatStat(.05 * potency * 100)}%`);
  });

  it.each(starters)('$name reaches roughly 100,000 HP before equipment and keeps percentage stats meaningful', (starter) => {
    const kit = resolveFighter(starter.id, { level: 105, evolution: 6 });
    expect(kit.stats.health).toBeGreaterThan(85_000);
    expect(kit.stats.health).toBeLessThan(125_000);
    expect(kit.stats.damage).toBeGreaterThan(10_000);
    expect(kit.stats.defense).toBeGreaterThan(500);
    expect(kit.stats.shatterCapacity).toBeLessThan(200);
    expect(kit.stats.crit).toBeLessThan(.5);
    expect(kit.stats.critMultiplier).toBeLessThan(3);
    expect(kit.passive.healFraction).toBeLessThan(.1);
  });

  it('keeps fractional values and validates progress without rounding the underlying kit', () => {
    const kit = resolveFighter('ember', { level: 1, evolution: 1 });
    expect(kit.stats.health).toBeCloseTo(220 * 1.03 ** 3);
    expect(kit.stats.defense).toBeCloseTo(10 * 1.03 ** 2.1);
    expect(formatStat(38.38000000000001)).toBe('38.38');
    expect(() => resolveFighter('ember', { level: 31, evolution: 1 })).toThrow('0 to 30');
    expect(() => resolveFighter('ember', { level: 106, evolution: 6 })).toThrow('0 to 105');
    expect(() => resolveFighter('ember', { level: 90, evolution: 7 })).toThrow('1 to 6');
  });
});
