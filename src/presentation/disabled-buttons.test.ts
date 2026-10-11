import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('unavailable buttons (D-224)', () => {
  it('ends the button stylesheet with a gray, non-accent disabled state outside battle', () => {
    const css = readFileSync(new URL('./button-style.css', import.meta.url), 'utf8');
    const main = readFileSync(new URL('../main.ts', import.meta.url), 'utf8');
    const rule = css.slice(css.indexOf('D-224'));
    expect(rule).toContain(':is(:disabled, [aria-disabled="true"]):not(#battle-root *)');
    expect(rule).toContain('background-image: linear-gradient(180deg, #34343a, #26262b) !important');
    expect(rule).toContain('color: #8d8d95 !important');
    expect(rule).toContain('cursor: not-allowed !important');
    expect(main.indexOf("button-style.css")).toBeGreaterThan(main.indexOf("reference-layout.css"));
  });
});
