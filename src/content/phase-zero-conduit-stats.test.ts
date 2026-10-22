import { describe, expect, it } from 'vitest';
import type { ConduitId, ConduitSlots } from './conduits';
import {
  applyPhaseZeroStaticBonuses, phaseZeroUpgradeMagnitude, phaseZeroSkillCost,
  phaseZeroGaugeOffer, phaseZeroPercentageGaugeOffer, type PhaseZeroEquipmentStats,
} from './phase-zero-conduit-stats';

const base: PhaseZeroEquipmentStats = {
  health: 1000, defense: 100, damage: 200, crit: .15, critMultiplier: 1.5,
  shatterCapacity: 100, skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1,
};
const slots = (...ids: ConduitId[]): ConduitSlots => [...ids, ...Array<null>(8 - ids.length).fill(null)];
const expectedBonuses = [
  ['bastion-lock', 'defense', 20],
  ['crosspin-governor', 'skillPower', .15],
  ['fieldbrace-coupler', 'skillPower', .2],
  ['fracture-reservoir', 'shatterCapacity', 50],
  ['parallax-relay', 'health', 450],
  ['precision-escapement', 'critMultiplier', .15],
  ['prism-splinter-socket', 'gaugeGain', .05],
  ['reserve-torque-crank', 'gaugeGain', .15],
  ['siegebound-drive', 'damage', 60],
  ['vigil-core', 'health', 350],
  ['coilfeed-ratchet', 'skillEfficiency', .07],
  ['hammerbalance-link', 'damage', 48],
  ['astral-prism', 'crit', .3],
  ['citadel-spine', 'defense', 35],
  ['immortal-vessel', 'health', 600],
  ['chaotic-ouroboros-core', 'shatterCapacity', 40],
  ['calamitic-causality-funeral-engine', 'skillPower', .8],
] as const satisfies readonly (readonly [ConduitId, keyof PhaseZeroEquipmentStats, number])[];

describe('Phase 0 static equipment foundation (not live activation)', () => {
  it.each(expectedBonuses)('%s has no benefit when absent', (id, key) => {
    expect(applyPhaseZeroStaticBonuses(base, slots())[key]).toBe(base[key]);
    expect(applyPhaseZeroStaticBonuses(base, slots(id))[key]).not.toBe(base[key]);
  });
  describe.each([0, 1, 2, 3, 4, 5])('upgrade +%i', (level) => {
    it.each(expectedBonuses)('%s scales its approved benefit once', (id, key, amount) => {
      const result = applyPhaseZeroStaticBonuses(base, slots(id), { [id]: level });
      expect(result[key]).toBeCloseTo(base[key] + amount * (1 + level * .1), 12);
    });

    it('keeps penalties and whole-turn duration fixed', () => {
      const result = applyPhaseZeroStaticBonuses(base,
        slots('fieldbrace-coupler', 'parallax-relay', 'reserve-torque-crank', 'hammerbalance-link',
          'astral-prism', 'nullsong-transmission', 'worldbreaker-drive', 'calamitic-world-eater-orrery'),
        {
          'fieldbrace-coupler': level, 'parallax-relay': level,
          'reserve-torque-crank': level, 'hammerbalance-link': level,
          'astral-prism': level, 'nullsong-transmission': level,
          'worldbreaker-drive': level, 'calamitic-world-eater-orrery': level,
        });
      expect(result.defense).toBeCloseTo(77);
      expect(result.damage).toBeCloseTo(200 * (.95 + .24 * (1 + level * .1)));
      expect(result.skillPower).toBeCloseTo(.8 + .2 * (1 + level * .1));
      expect(result.skillDuration).toBe(2);
    });
  });

  it('leaves absent equipment and its inputs unchanged', () => {
    const stats = structuredClone(base);
    const equipment = slots('aegis-capacitor');
    const result = applyPhaseZeroStaticBonuses(stats, equipment);
    expect(result).toEqual(base);
    expect(result).not.toBe(stats);
    expect(stats).toEqual(base);
    expect(equipment).toEqual(slots('aegis-capacitor'));
  });

  it('preserves negative Efficiency and ignores unrelated legacy stat fields', () => {
    const stats = { ...base, skillEfficiency: -.15, elementalDamage: 123.456 };
    const result = applyPhaseZeroStaticBonuses(stats, slots('coilfeed-ratchet'));
    expect(result.skillEfficiency).toBeCloseTo(-.08);
    expect(result).toHaveProperty('elementalDamage', 123.456);
    expect(phaseZeroSkillCost(25, result.skillEfficiency, 'skill1')).toBe(27);
  });

  it('adds stat bonuses against their original base regardless of slot order', () => {
    const equipment = slots('bastion-lock', 'citadel-spine', 'crosspin-governor',
      'fieldbrace-coupler', 'prism-splinter-socket', 'reserve-torque-crank');
    const result = applyPhaseZeroStaticBonuses(base, equipment);
    expect(result.defense).toBeCloseTo(150);
    expect(result.skillPower).toBeCloseTo(1.35);
    expect(result.gaugeGain).toBeCloseTo(1.2);
    expect(applyPhaseZeroStaticBonuses(base, [...equipment].reverse())).toEqual(result);
  });

  it('preserves Critical Rate above 100% and fractional growth values', () => {
    const stats = { ...base, crit: .95, damage: 201.123456789 };
    const result = applyPhaseZeroStaticBonuses(stats, slots('astral-prism', 'siegebound-drive'));
    expect(result.crit).toBeCloseTo(1.25);
    expect(result.damage).toBeCloseTo(stats.damage * 1.3, 12);
  });

  it('does not fill Gauge or mutate owned upgrade levels', () => {
    const upgrades = { 'fracture-reservoir': 5 };
    expect(applyPhaseZeroStaticBonuses(base, slots('fracture-reservoir'), upgrades).shatterCapacity).toBe(175);
    expect(upgrades).toEqual({ 'fracture-reservoir': 5 });
  });

  it.each([-1, 6, .5, NaN, Infinity])('rejects invalid upgrade level %s', (level) => {
    expect(() => phaseZeroUpgradeMagnitude(.2, level)).toThrow('integer from 0 to 5');
  });

  it('rejects malformed equipment, upgrades and base stats explicitly', () => {
    expect(() => applyPhaseZeroStaticBonuses(base, slots('vigil-core', 'vigil-core'))).toThrow();
    expect(() => applyPhaseZeroStaticBonuses(base, slots('vigil-core'), { 'vigil-core': 6 })).toThrow();
    expect(() => applyPhaseZeroStaticBonuses({ ...base, skillPower: NaN }, slots())).toThrow('Invalid Phase 0 base stat');
  });

  it('rounds skill costs once after additive Efficiency with floors and a discount cap', () => {
    expect(phaseZeroSkillCost(25, .07 + .25, 'skill1')).toBe(17);
    expect(phaseZeroSkillCost(40, .99, 'skill2')).toBe(20);
    expect(phaseZeroSkillCost(100, .99, 'ultimate')).toBe(70);
    expect(phaseZeroSkillCost(25, -.1, 'skill1')).toBe(28);
    expect(phaseZeroSkillCost(1, .5, 'skill1')).toBe(1);
    expect(phaseZeroSkillCost(0, .25, 'light')).toBe(0);
  });

  it('scales every positive Gauge offer once and percentages against recipient capacity', () => {
    expect(phaseZeroGaugeOffer(20, 1 + .05 + .15)).toBe(24);
    expect(phaseZeroPercentageGaugeOffer(250, .08, 1.2)).toBe(24);
    expect(phaseZeroPercentageGaugeOffer(175.5, .08, 1.15)).toBe(16);
    expect(phaseZeroGaugeOffer(0, 1.5)).toBe(0);
    expect(phaseZeroPercentageGaugeOffer(100, 0, 1.5)).toBe(0);
  });

  it('rejects nonfinite or invalid input rather than silently granting free actions', () => {
    expect(() => phaseZeroSkillCost(NaN, 0, 'skill1')).toThrow();
    expect(() => phaseZeroSkillCost(25, Infinity, 'skill1')).toThrow();
    expect(() => phaseZeroSkillCost(-1, 0, 'skill1')).toThrow();
    expect(() => phaseZeroGaugeOffer(-1, 1)).toThrow();
    expect(() => phaseZeroGaugeOffer(1, NaN)).toThrow();
    expect(() => phaseZeroPercentageGaugeOffer(0, .1, 1)).toThrow();
    expect(() => phaseZeroPercentageGaugeOffer(100, -.1, 1)).toThrow();
  });
});
