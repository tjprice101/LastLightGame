import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('squad battle art sizing (D-227)', () => {
  const css = readFileSync(new URL('./battle-mono.css', import.meta.url), 'utf8');

  it('sizes desktop squad allies from the arena container', () => {
    expect(css).toMatch(/\.battle-arena \{ container-type: size; \}/);
    expect(css).toMatch(/\.allies\.squad \.battle-art \{ width: min\(100%, calc\(150px \* var\(--unit-scale, 1\)\), 38cqh, 24cqw\); \}/);
    expect(css).toMatch(/\.allies\.squad \.battle-unit:first-child \{ margin-top: 0; \}/);
    expect(css).toMatch(/\.allies\.squad \.battle-unit:last-child \{ margin-bottom: 0; \}/);
  });

  it('raises phone squad art above the generic unit cap', () => {
    expect(css).toMatch(/\.allies\.squad \.battle-art \{ width: min\(100%, calc\(120px \* var\(--unit-scale, 1\)\), 17dvh\); \}/);
    expect(css).toMatch(/\.allies\.squad \.battle-art \{ width: min\(100%, 16dvh\); \}/);
  });
});
