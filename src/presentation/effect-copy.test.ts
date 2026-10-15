import { describe, expect, it } from 'vitest';
import { readableEffect } from './effect-copy';

describe('readable effect prose', () => {
  it('spaces word alternatives without changing ratios, formulas or effect numbers', () => {
    expect(readableEffect('Skill1/Skill2, Last Flare/Normal, shield growth/absorption.')).toBe('Skill1 / Skill2, Last Flare / Normal, shield growth / absorption.');
    expect(readableEffect('Skill 1/Skill 2 direct damage.')).toBe('Skill 1 / Skill 2 direct damage.');
    const formula = '15% H/R, A/(A+D), `D/(D + enemy Defense)`, 1/2, 3/5, +8% damage.';
    expect(readableEffect(formula)).toBe(formula);
  });
});
