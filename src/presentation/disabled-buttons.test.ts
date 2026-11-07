import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('unavailable buttons (D-224)', () => {
  it('ends the button stylesheet with a gray, non-accent disabled state outside battle', () => {
    const css = readFileSync(new URL('./button-style.css', import.meta.url), 'utf8');
    const main = readFileSync(new URL('../main.ts', import.meta.url), 'utf8');
    const rule = css.slice(css.indexOf('D-224'));
    expect(rule).toContain(':is(:disabled, [aria-disabled="true"]):not(#battle-root *)');
    expect(rule).toContain('background-image: linear-gradient(180deg, #34343a, #26262b) !important');
    expect(rule).toContain('color: var(--control-disabled-text) !important');
    expect(rule).toContain('cursor: not-allowed !important');
    expect(main.indexOf("button-style.css")).toBeGreaterThan(main.indexOf("reference-layout.css"));
  });

  it('keeps disabled labels readable against the lightest point of the shared gray fill', () => {
    const css = readFileSync(new URL('./button-style.css', import.meta.url), 'utf8');
    const color = css.match(/--control-disabled-text:\s*(#[0-9a-f]{6});/i)?.[1];
    if (!color) throw new Error('Disabled text color token is missing.');
    const luminance = (hex: string): number => {
      const channels = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255)
        .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
      return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
    };
    expect((luminance(color) + .05) / (luminance('#34343a') + .05)).toBeGreaterThanOrEqual(4.5);
  });
});
