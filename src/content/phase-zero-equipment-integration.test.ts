import { describe, expect, it, vi } from 'vitest';
import { applyConduitBuffs, type Stats } from './combat';
import type { ConduitSlots } from './conduits';

vi.mock('./phase-zero-stats', async (importOriginal) => ({
  ...await importOriginal<typeof import('./phase-zero-stats')>(),
  phaseZeroStatsReady: true,
}));

const slots: ConduitSlots = ['bastion-lock', 'citadel-spine', 'crosspin-governor',
  'fieldbrace-coupler', 'precision-escapement', 'fracture-reservoir', null, null];
const base = (): Stats => ({
  health: 1000, defense: 100, damage: 200, crit: .15, critMultiplier: 1.5,
  shatterCapacity: 100, elementalDamage: 12.345,
});

describe('Phase 0 equipment resolution when the release gate is enabled', () => {
  it('replaces legacy bonuses with additive new stats without changing legacy Burn', () => {
    const stats = base();
    applyConduitBuffs(stats, slots);
    expect(stats.health).toBe(1000);
    expect(stats.defense).toBeCloseTo(135);
    expect(stats.damage).toBe(350);
    expect(stats.critMultiplier).toBeCloseTo(1.65);
    expect(stats.shatterCapacity).toBe(140);
    expect(stats.skillPower).toBeCloseTo(1.65);
    expect(stats.skillDuration).toBe(0);
    expect(stats.skillEfficiency).toBe(0);
    expect(stats.gaugeGain).toBe(1.07);
    expect(stats.elementalDamage).toBe(12.345);
  });

  it('preserves saved upgrade inputs and applies the new upgrade curve exactly once', () => {
    const stats = base();
    const upgrades = { 'bastion-lock': 5, 'fieldbrace-coupler': 5 };
    applyConduitBuffs(stats, slots, upgrades);
    expect(stats.defense).toBeCloseTo(152.5);
    expect(stats.skillPower).toBeCloseTo(1.775);
    expect(upgrades).toEqual({ 'bastion-lock': 5, 'fieldbrace-coupler': 5 });
    expect(slots[0]).toBe('bastion-lock');
  });

  it('normalizes an unequipped legacy fighter without granting capacity or Gauge', () => {
    const stats = base();
    applyConduitBuffs(stats);
    expect(stats).toEqual({
      ...base(), skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1,
    });
    expect(stats).not.toHaveProperty('gauge');
  });
});
