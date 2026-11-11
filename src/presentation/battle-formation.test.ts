import { describe, expect, it } from 'vitest';
import { radiantFormation, radiantFormationStyle } from './battle-formation';

describe('grounded Radiant formations', () => {
  it.each([1, 2, 3, 4, 5, 6])('places %i units in deterministic, distinct depth slots', size => {
    const first = radiantFormation(size);
    expect(first).toHaveLength(size);
    expect(radiantFormation(size)).toEqual(first);
    expect(new Set(first.map(slot => `${slot.x}:${slot.y}`)).size).toBe(size);
    for (const slot of first) {
      expect(slot.x).toBeGreaterThanOrEqual(15);
      expect(slot.x).toBeLessThanOrEqual(85);
      expect(slot.y).toBeGreaterThanOrEqual(49);
      expect(slot.y).toBeLessThanOrEqual(97);
      expect(slot.scale).toBeGreaterThanOrEqual(.8);
      expect(slot.scale).toBeLessThanOrEqual(1.35);
    }
    if (size > 1) expect(new Set(first.map(slot => slot.y)).size).toBeGreaterThan(1);
  });

  it.each([4, 5, 6])('separates the back and front ground rows for %i units', size => {
    const slots = radiantFormation(size);
    const backCount = size === 4 ? 2 : 3;
    expect(Math.min(...slots.slice(backCount).map(slot => slot.y)) - Math.max(...slots.slice(0, backCount).map(slot => slot.y)))
      .toBeGreaterThanOrEqual(28);
  });

  it.each([1, 2, 3, 4, 5, 6])('contains enlarged artwork within the field for %i units', size => {
    for (const slot of radiantFormation(size)) {
      const centre = .02 + .44 * slot.x / 100;
      const halfWidth = .30 * slot.scale / 2;
      expect(centre - halfWidth).toBeGreaterThanOrEqual(0);
      expect(centre + halfWidth).toBeLessThanOrEqual(1);
      expect(1 - centre - halfWidth).toBeGreaterThanOrEqual(0);
      expect(1 - centre + halfWidth).toBeLessThanOrEqual(1);
    }
  });

  it('mirrors positions rather than mirroring sprites or changing depth', () => {
    const slot = radiantFormation(3)[0];
    expect(radiantFormationStyle(slot, 0, false)).toContain('--formation-x:34%');
    expect(radiantFormationStyle(slot, 0, true)).toContain('--formation-x:66%');
    expect(radiantFormationStyle(slot, 0, true)).toContain('--formation-depth:84');
  });

  it.each([0, 7, -1, 1.5, Number.NaN])('rejects invalid formation size %s', size => {
    expect(() => radiantFormation(size)).toThrow('one to six');
  });
});
