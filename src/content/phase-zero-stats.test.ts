import { describe, expect, it } from 'vitest';
import { enemies, fighters, resolveFighter, type Stats } from './combat';
import { starters } from './starters';
import { characterGrowthFactor, characterPotencyFactor } from './progression';
import { capturedEnemyStats } from './infusions';
import { enemyCombatStats } from './stat-growth';
import { creatures } from './creatures';
import { capturedLevelCap, resolveCapturedFighter, type CapturedCharacter } from '../game/character-instances';
import { normalizeStats, phaseZeroStatDefaults, phaseZeroStatKeys, phaseZeroStatLabels, phaseZeroStatsReady } from './phase-zero-stats';

describe('gated Phase 0 stat foundation', () => {
  it('activates the verified release and names exactly ten current stats', () => {
    expect(phaseZeroStatsReady).toBe(true);
    expect(phaseZeroStatKeys).toHaveLength(10);
    expect(phaseZeroStatLabels.damage).toBe('Direct Attack');
    expect(phaseZeroStatKeys).not.toContain('elementalDamage');
  });

  it('normalizes legacy snapshots without mutation or reinterpreting their Burn source', () => {
    const legacy: Stats = { health: 100, defense: 5, damage: 20, crit: .1,
      critMultiplier: 1.5, shatterCapacity: 100, elementalDamage: 37 };
    const before = structuredClone(legacy);
    expect(normalizeStats(legacy)).toEqual({ ...legacy, ...phaseZeroStatDefaults });
    expect(legacy).toEqual(before);
    expect(normalizeStats({ ...legacy, skillPower: 1.4, skillDuration: 2, skillEfficiency: -.1, gaugeGain: 0 }))
      .toMatchObject({ skillPower: 1.4, skillDuration: 2, skillEfficiency: -.1, gaugeGain: 0, elementalDamage: 37 });
  });

  it.each(starters)('$name resolves all new defaults without level/evolution growth', starter => {
    const original = structuredClone(fighters[starter.id]);
    for (const progress of [{ level: 0, evolution: 1 }, { level: 30, evolution: 2 }, { level: 105, evolution: 6 }]) {
      const stats = resolveFighter(starter.id, progress).stats;
      expect(stats).toMatchObject(phaseZeroStatDefaults);
      const growth = characterGrowthFactor(progress);
      const potency = characterPotencyFactor(progress);
      expect(stats.health).toBeCloseTo(original.stats.health * growth);
      expect(stats.damage).toBeCloseTo(original.stats.damage * growth);
      expect(stats.defense).toBeCloseTo((original.stats.defense + original.passive.defenseBonus) * growth ** .7);
      expect(stats.crit).toBeCloseTo(Math.min(1, original.stats.crit * potency));
      expect(stats.critMultiplier).toBeCloseTo(original.stats.critMultiplier * potency);
      expect(stats.shatterCapacity).toBeCloseTo(original.stats.shatterCapacity * potency);
      expect(stats.elementalDamage).toBeCloseTo(original.stats.elementalDamage * growth);
    }
    expect(fighters[starter.id]).toEqual(original);
  });

  it('normalizes every capturable form while keeping captured growth and fixed skills', () => {
    const capturable = creatures.filter(creature => creature.mode && creature.mode !== 'machines');
    expect(capturable.length).toBeGreaterThan(20);
    for (const creature of capturable) {
      const copy: CapturedCharacter = { instanceId: 'capture:00000000-0000-0000-0000-000000000001',
        creatureId: creature.id, locked: false };
      const before = structuredClone(copy);
      const initial = resolveCapturedFighter(copy);
      const maximum = resolveCapturedFighter({ ...copy, level: capturedLevelCap });
      expect(initial.stats).toMatchObject(phaseZeroStatDefaults);
      expect(maximum.stats).toMatchObject(phaseZeroStatDefaults);
      expect(maximum.stats.health).toBeGreaterThanOrEqual(initial.stats.health);
      expect(maximum.abilities).toEqual(initial.abilities);
      expect(copy).toEqual(before);
    }
  });

  it('includes neutral defaults on hostile and captured stat constructors', () => {
    for (const level of [10, 60, 120]) {
      expect(enemyCombatStats(level, false)).toMatchObject(phaseZeroStatDefaults);
      expect(enemyCombatStats(level, true)).toMatchObject(phaseZeroStatDefaults);
      expect(capturedEnemyStats(level)).toMatchObject(phaseZeroStatDefaults);
    }
    for (const enemy of Object.values(enemies)) expect(enemy.stats).toMatchObject(phaseZeroStatDefaults);
  });
});
