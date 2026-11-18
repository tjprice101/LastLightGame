import { describe, expect, it } from 'vitest';
import { beatPlan, elementTint, FlashGovernor, neutralTint, screenTools, spectacleTier, staticImpactMs, tintCss } from './spectacle-timing';

describe('Battle Spectacle timing (D-483 R2)', () => {
  it('matches the approved per-tier totals at battle speed 1', () => {
    expect(beatPlan('normal', null, 1)).toMatchObject({ windup: 100, travel: 100, impact: 150, aftermath: 100, total: 450 });
    expect(beatPlan('skill1', null, 1)).toMatchObject({ windup: 200, travel: 150, impact: 300, aftermath: 200, total: 850 });
    expect(beatPlan('skill2', null, 1)).toMatchObject({ windup: 300, travel: 200, impact: 450, aftermath: 250, total: 1200 });
    expect(beatPlan('flare', 'sparkling', 1).total).toBe(1500);
    expect(beatPlan('flare', 'glimmering', 1).total).toBe(1900);
    expect(beatPlan('flare', 'ultimate', 1).total).toBe(2400);
  });
  it('escalates strictly by tier, with a 300 ms Convergent Light aftermath', () => {
    const totals = [beatPlan('normal', null, 1), beatPlan('skill1', null, 1), beatPlan('skill2', null, 1),
      beatPlan('flare', 'sparkling', 1), beatPlan('flare', 'glimmering', 1), beatPlan('flare', 'ultimate', 1)].map(plan => plan.total);
    expect(totals).toEqual([...totals].sort((a, b) => a - b));
    expect(new Set(totals).size).toBe(totals.length);
    for (const tier of ['sparkling', 'glimmering', 'ultimate'] as const) expect(beatPlan('flare', tier, 12).aftermath).toBe(300);
  });
  it('splits the impact beat across every hit so multi-hit actions keep their budget', () => {
    const ultimate = beatPlan('flare', 'ultimate', 12);
    expect(ultimate.hitInterval * ultimate.hits).toBeCloseTo(ultimate.impact);
    expect(ultimate.total).toBe(2400);
    expect(beatPlan('skill2', null, 6).hitInterval).toBe(75);
    // No visible hits (a pure support skill) still plays one impact slot.
    expect(beatPlan('skill1', null, 0)).toMatchObject({ hits: 1, hitInterval: 300 });
  });
  it('rejects a Convergent Light presentation without its tier', () => {
    expect(() => beatPlan('flare', null, 1)).toThrow();
    expect(() => screenTools('flare', null)).toThrow();
  });
  it('assigns the approved screen tools per tier', () => {
    expect(screenTools('normal', null)).toEqual({ shake: 2, hitStop: 0, flash: 'none', dim: 0, zoom: 1 });
    expect(screenTools('skill1', null)).toEqual({ shake: 3, hitStop: 40, flash: 'none', dim: 0, zoom: 1 });
    expect(screenTools('skill2', null)).toEqual({ shake: 5, hitStop: 60, flash: 'soft', dim: 0, zoom: 1 });
    for (const tier of ['sparkling', 'glimmering', 'ultimate'] as const) {
      const tools = screenTools('flare', tier);
      expect(tools).toMatchObject({ shake: 8, hitStop: 90, flash: 'full', zoom: 1.06 });
      expect(tools.dim).toBeGreaterThanOrEqual(.3); expect(tools.dim).toBeLessThanOrEqual(.55);
    }
    expect(staticImpactMs).toBeLessThanOrEqual(200);
  });
  it('maps actions to tiers', () => {
    expect(spectacleTier({ type: 'normal' })).toBe('normal');
    expect(spectacleTier({ type: 'skill', slot: 1 })).toBe('skill1');
    expect(spectacleTier({ type: 'skill', slot: 2 })).toBe('skill2');
    expect(spectacleTier({ type: 'flare' })).toBe('flare');
  });
});

describe('FlashGovernor (WCAG 2.3.1)', () => {
  it('allows at most three full flashes in any one second and softens the rest', () => {
    const governor = new FlashGovernor();
    expect([0, 100, 200, 300].map(time => governor.request('full', time))).toEqual(['full', 'full', 'full', 'soft']);
    expect(governor.request('full', 1001)).toBe('full');
    expect(governor.request('soft', 1002)).toBe('soft');
    expect(governor.request('none', 1003)).toBe('none');
  });
});

describe('element tints', () => {
  it('uses one tint per element and a neutral fallback', () => {
    const tints = ['infernic', 'oceanic', 'atmospheric', 'botanic', 'tranquilitic', 'chaotic'].map(elementTint);
    expect(new Set(tints).size).toBe(6);
    expect(elementTint(null)).toBe(neutralTint);
    expect(elementTint('unknown')).toBe(neutralTint);
    expect(tintCss(0x0a0b0c)).toBe('#0a0b0c');
  });
});
