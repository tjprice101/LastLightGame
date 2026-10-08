import { describe, expect, it } from 'vitest';
import { statChange } from './stat-change';

describe('stat change emphasis', () => {
  it.each([
    [10, 12, 'increase', 'Increased to 12'],
    [12, 10, 'decrease', 'Decreased to 10'],
    [10, 10, 'unchanged', 'Unchanged at 10'],
    [0, 0, 'unchanged', 'Unchanged at 0'],
  ] as const)('compares %i to %i before formatting', (before, after, direction, label) => {
    const html = statChange(before, after);
    expect(html).toContain(`stat-change--${direction}`);
    expect(html).toContain(`aria-label="${label}"`);
    expect(html).toContain(`${before} &rarr;`);
  });

  it('retains percentage and multiplier formatting and fractional direction', () => {
    expect(statChange(.15, .1504, '%')).toContain('15% &rarr;');
    expect(statChange(.15, .1504, '%')).toContain('15.04%</b>');
    expect(statChange(1.5, 1.50001, 'x')).toContain('stat-change--increase');
    expect(statChange(1.5, 1.50001, 'x')).toContain('1.5x</b>');
    expect(statChange(1.50001, 1.5, 'x')).toContain('stat-change--decrease');
  });
});
