import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('shared artwork-led battle sizing', () => {
  const css = readFileSync(new URL('./battle-mono.css', import.meta.url), 'utf8');

  it('makes units the focal point with one large arena-relative baseline for both sides and reserves room for all rows', () => {
    expect(css).toContain('container-type: size; grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(css).toContain('--battle-art-base: min(330px, calc(125cqh / var(--battle-rows, 3)), 19cqw)');
    expect(css).toContain('.battle-art { --battle-art-size: calc(var(--battle-art-base) * (.82 + .18 * var(--unit-scale, 1))); width: var(--battle-art-size); max-width: none; flex-shrink: 0; margin-block: calc(var(--battle-art-size) * -.16); }');
    expect(css).not.toMatch(/\.battle-art \{[^}]*max-width: \d+%; flex-shrink/);
    expect(css).not.toMatch(/\.allies\.(?:solo|squad) \.battle-art/);
    expect(css).not.toMatch(/\.battle-unit:only-child \.battle-art/);
    expect(css).not.toContain('margin-block: -5cqh');
    const baselines = [...css.matchAll(/--battle-art-base: ([^;}]+)/g)].map(match => match[1]);
    expect(baselines.slice(-2)).toEqual([
      'min(330px, calc(1.25 * (100dvh - 126px) / var(--battle-rows, 3)), 19cqw)',
      'min(140px, calc(88cqw / var(--battle-rows, 3) / 1.2), calc(.22 * (100dvh - 164px)))',
    ]);
  });

  it('preserves artwork size ratios on phones instead of replacing them with fixed caps', () => {
    expect(css).toContain('--battle-art-base: min(140px, calc(88cqw / var(--battle-rows, 3) / 1.2), 22cqh)');
    expect(css).toContain('.battle-art { max-width: 100%; }');
    expect(css).not.toMatch(/\.battle-art \{ width: min\(100%, \d+dvh\)/);
    expect(css).toContain('.battle-dock-action > :is(strong, span, small) { min-width: 0; max-width: 100%; justify-self: stretch; }');
  });
  it('keeps full readouts reachable in cramped landscape arenas rather than painting over the footer', () => {
    expect(css).toContain('@media (max-height: 480px) and (min-width: 541px)');
    expect(css).toContain('.battle-screen { overflow-y: auto; }');
    expect(css).toContain('#battle-root { min-height: 640px; flex-shrink: 0; }');
  });
  it('separates all sprite silhouettes from bright and dark scenery without replacing state filters', () => {
    expect(css).toContain('#battle-root .battle-sprite img { filter: drop-shadow(0 1px 1px #080b10) drop-shadow(0 0 2px #ffffffd9) drop-shadow(0 2px 6px #080b10b3); }');
    expect(css).toContain('.ultimate-ready .battle-art { filter: drop-shadow(0 0 12px #fff) drop-shadow(0 0 22px #fff9); }');
  });
});
