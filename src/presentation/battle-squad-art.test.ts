import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('shared artwork-led battle sizing', () => {
  const css = readFileSync(new URL('./battle-mono.css', import.meta.url), 'utf8');

  it('uses one arena-relative baseline for both sides and reserves room for all rows', () => {
    expect(css).toContain('container-type: size; grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(css).toContain('--battle-art-base: min(180px, calc(48cqh / var(--battle-rows, 3)), 11cqw)');
    expect(css).toContain('.battle-art { width: calc(var(--battle-art-base) * var(--unit-scale, 1)); max-width: 44%; flex-shrink: 0; }');
    expect(css).not.toMatch(/\.allies\.(?:solo|squad) \.battle-art/);
    expect(css).not.toMatch(/\.battle-unit:only-child \.battle-art/);
    expect(css).not.toContain('margin-block: -5cqh');
  });

  it('preserves artwork size ratios on phones instead of replacing them with fixed caps', () => {
    expect(css).toContain('--battle-art-base: min(100px, calc(88cqw / var(--battle-rows, 3) / 1.75), 18cqh)');
    expect(css).toContain('.battle-art { max-width: 100%; }');
    expect(css).not.toMatch(/\.battle-art \{ width: min\(100%, \d+dvh\)/);
  });
  it('keeps full readouts reachable in cramped landscape arenas rather than painting over the footer', () => {
    expect(css).toContain('@media (max-height: 540px) and (min-width: 541px)');
    expect(css).toContain('.battle-arena { overflow-y: auto; overflow-x: hidden; }');
    expect(css).toContain('.battle-side { height: auto; max-height: none; }');
  });
});
