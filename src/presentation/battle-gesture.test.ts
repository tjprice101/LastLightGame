import { describe, expect, it } from 'vitest';
import { dragAction } from './battle-gesture';

describe('directional battle gestures', () => {
  it.each([
    [0, -32, 'ultimate'], [-32, 0, 'skill1'], [32, 0, 'skill2'], [0, 32, 'light'],
    [-80, 30, 'skill1'], [30, -80, 'ultimate'],
    [0, 0, null], [0, 31, null], [20, 20, null], [40, 40, null],
  ] as const)('maps (%i, %i) to %s', (dx, dy, action) => {
    expect(dragAction(dx, dy)).toBe(action);
  });
  it('rejects invalid coordinates', () => {
    expect(() => dragAction(NaN, 1)).toThrow('Invalid battle gesture');
    expect(() => dragAction(1, Infinity)).toThrow('Invalid battle gesture');
  });
});
