import { describe, expect, it } from 'vitest';
import { describeFighter, fighters, formatStat, resolveFighter, shatterGauge } from './combat';
import { openingStarters as starters, starters as roster } from './starters';
import { characterLevelCap, characterGrowthFactor, characterPotencyFactor } from './progression';
import { nativeIdentities } from './native-identities';
import { nativeBalance } from './native-balance';

describe('character stat and kit growth', () => {
  it.each(roster)('$name has no ordinary skill cooldown at any evolution', starter => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      const kit = resolveFighter(starter.id, { level: 0, evolution });
      for (const action of ['skill1', 'skill2'] as const) {
        expect(fighters[starter.id].abilities[action].cooldown).toBe(0);
        expect(kit.abilities[action].cooldown).toBe(0);
      }
      expect(kit.abilities.ultimate.cooldown).toBe(fighters[starter.id].abilities.ultimate.cooldown);
    }
  });
  it.each(roster)('$name explains actual ability effects without changing frozen kits', starter => {
    const original = resolveFighter(starter.id);
    const before = structuredClone(original);
    const kit = describeFighter(starter.id, original);
    expect(original).toEqual(before);
    for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
      const ability = kit.abilities[action];
      expect(ability.strength).toEqual(original.abilities[action].strength);
      expect(ability.cooldown).toBe(original.abilities[action].cooldown);
      if (ability.strength.shield !== undefined) {
        expect(ability.description).toContain('Shield: absorbs damage before HP');
        expect(ability.description).toContain('higher amount');
      }
      if (ability.strength.weakenFraction !== undefined) expect(ability.description).toContain('Weaken');
      if (ability.strength.critBonus !== undefined) expect(ability.description).toContain('Critical chance bonus: this attack only.');
      if (action === 'ultimate') expect(ability.description).toContain('Recovery: caster skips the next player turn.');
      expect(ability.description).not.toMatch(/\bauthored\b/);
    }
    expect(kit.passive.description).not.toMatch(/\beffective authored\b/);
    expect(kit.passive.description).toBe(nativeIdentities[starter.id].passive.description);
  });
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
    if (starter.id === 'sprout') expect(kit.abilities.ultimate.description).toContain(`${nativeBalance.flora.empoweredSeed * 100}% at the start of the next player turn`);
    kit.stats.health = 1;
    expect(fighters[starter.id]).toEqual(original);
  });

  it.each(roster)('$name uses linear core growth and separate bounded potency through every level/form', (starter) => {
    const base = resolveFighter(starter.id);
    for (let evolution = 1; evolution <= 6; evolution++) for (let level = 0; level <= characterLevelCap(evolution); level++) {
      const progress = { level, evolution };
      const kit = resolveFighter(starter.id, progress);
      const factor = 1 + level * .15 + (evolution - 1) * 1.5;
      const potency = 1 + level * .003 + (evolution - 1) * .05;
      for (const key of ['health', 'damage', 'elementalDamage'] as const) expect(kit.stats[key]).toBeCloseTo(base.stats[key] * factor);
      expect(kit.stats.defense).toBeCloseTo(base.stats.defense * factor ** .7);
      expect(kit.stats.shatterCapacity).toBeCloseTo(base.stats.shatterCapacity * potency);
      expect(kit.stats.crit).toBeCloseTo(Math.min(.75, base.stats.crit * potency));
      expect(kit.stats.critMultiplier).toBeCloseTo(Math.min(3, base.stats.critMultiplier * potency));
      expect(kit.passive.healFraction).toBeLessThanOrEqual(.1);
      expect(kit.passive.damageBonus).toBeLessThanOrEqual(.75);
      for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
        expect(kit.abilities[action].cooldown).toBe(base.abilities[action].cooldown);
        for (const key of ['damageMultiplier', 'burnMultiplier', 'shield', 'healing'] as const) {
          const value = base.abilities[action].strength[key];
          if (value === undefined) expect(kit.abilities[action].strength[key]).toBeUndefined();
          else expect(kit.abilities[action].strength[key]).toBe(value);
        }
        expect(kit.abilities[action].strength.weakenFraction ?? 0).toBeLessThanOrEqual(.5);
        expect(kit.abilities[action].strength.critBonus ?? 0).toBeLessThanOrEqual(.5);
      }
      if (level) expect(kit.stats.health).toBeGreaterThan(resolveFighter(starter.id, { level: level - 1, evolution }).stats.health);
    }
    expect(shatterGauge.costs).toEqual({ light: 0, skill1: 25, skill2: 40, ultimate: 100 });
    expect(shatterGauge.gains.light).toBe(20);
  });

  it('descriptions retain fixed native percentages while Attack and HP grow independently', () => {
    const progress = { level: 30, evolution: 2 };
    const factor = characterGrowthFactor(progress);
    const ember = resolveFighter('ember', progress);
    expect(ember.stats.damage).toBeCloseTo(fighters.ember.stats.damage * factor);
    expect(ember.abilities.skill1.description).toContain(`${160 * nativeBalance.skillDamageScale}% direct damage`);
    expect(ember.abilities.skill1.description).toContain('25% of [Infernis]’s Attack');
    expect(ember.passive.damageBonus).toBe(0);
    const tide = resolveFighter('tide', progress);
    expect(tide.passive.defenseBonus).toBe(0);
    expect(tide.abilities.skill1.strength.weakenFraction).toBe(.25);
    expect(tide.abilities.skill1.description).toContain('for the next enemy phase');
    expect(tide.abilities.skill2.description).toContain(`${nativeBalance.tizu.shelter * 100}% of its maximum HP`);
    const flora = resolveFighter('sprout', progress);
    expect(flora.abilities.skill2.strength).toEqual({});
    expect(flora.abilities.skill2.description).toContain(`${nativeBalance.flora.seed * 100}% of maximum HP`);
    expect(flora.passive.healFraction).toBe(0);
    expect(flora.passive.description).toContain('start of the next player turn');
    expect(ember.stats.crit).toBeCloseTo(fighters.ember.stats.crit * characterPotencyFactor(progress));
  });

  it.each(starters)('$name reaches bounded linear endgame stats before equipment and keeps percentage stats meaningful', (starter) => {
    const kit = resolveFighter(starter.id, { level: 105, evolution: 6 });
    expect(kit.stats.health).toBeGreaterThan(4_500);
    expect(kit.stats.health).toBeLessThan(6_400);
    expect(kit.stats.damage).toBeGreaterThan(700);
    expect(kit.stats.damage).toBeLessThan(950);
    expect(kit.stats.defense).toBeGreaterThan(70);
    expect(kit.stats.shatterCapacity).toBeLessThan(200);
    expect(kit.stats.crit).toBeLessThan(.5);
    expect(kit.stats.critMultiplier).toBeLessThan(3);
    expect(kit.passive.healFraction).toBeLessThan(.1);
  });

  it('keeps fractional values and validates progress without rounding the underlying kit', () => {
    const kit = resolveFighter('ember', { level: 1, evolution: 1 });
    expect(kit.stats.health).toBeCloseTo(220 * 1.15);
    expect(kit.stats.defense).toBeCloseTo(10 * 1.15 ** .7);
    expect(formatStat(38.38000000000001)).toBe('38.38');
    expect(() => resolveFighter('ember', { level: 31, evolution: 1 })).toThrow('0 to 30');
    expect(() => resolveFighter('ember', { level: 106, evolution: 6 })).toThrow('0 to 105');
    expect(() => resolveFighter('ember', { level: 90, evolution: 7 })).toThrow('1 to 6');
  });
});
