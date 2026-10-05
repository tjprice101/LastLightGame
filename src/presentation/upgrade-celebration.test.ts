import { afterEach, describe, expect, it, vi } from 'vitest';
import { starters } from '../content/starters';
import { celebrateUpgrade, upgradeCelebration } from './upgrade-celebration';
import { reducedMotion } from './settings';

vi.mock('./settings', () => ({ reducedMotion: vi.fn(() => false) }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.mocked(reducedMotion).mockReturnValue(false);
});

function fixture() {
  vi.useFakeTimers();
  const classes = new Set<string>();
  const overlays: { className: string; innerHTML: string; removed: boolean }[] = [];
  const portrait = {
    classList: {
      add: (...values: string[]) => values.forEach((value) => classes.add(value)),
      remove: (...values: string[]) => values.forEach((value) => classes.delete(value)),
    },
    append: (overlay: (typeof overlays)[number]) => overlays.push(overlay),
  };
  vi.stubGlobal('document', {
    createElement: () => {
      const overlay = {
        className: '', innerHTML: '', removed: false,
        style: { setProperty: vi.fn() },
        remove: () => { overlay.removed = true; },
      };
      return overlay;
    },
  });
  const host = { querySelector: () => portrait };
  return {
    classes, overlays,
    play: (kind: 'level' | 'evolve') => Reflect.apply(celebrateUpgrade, undefined, [host, starters[0], kind, { level: 30, evolution: 2 }]),
  };
}

describe('saved character upgrade celebrations', () => {
  it.each(starters)('uses $name identity with distinct level and evolution effects', (starter) => {
    const level = upgradeCelebration(starter, 'level', { level: 1, evolution: 1 });
    const evolution = upgradeCelebration(starter, 'evolve', { level: 30, evolution: 2 });
    expect(level).toContain(starter.name);
    expect(level).toContain('Level up');
    expect(level).toContain('Level 1');
    expect(level.match(/class="upgrade-spark"/g)).toHaveLength(6);
    expect(evolution).toContain('Evolution complete');
    expect(evolution).toContain('Evolution 2');
    expect(evolution.match(/class="upgrade-spark"/g)).toHaveLength(12);
    expect(evolution).toContain('role="status"');
    expect(evolution).toContain('aria-hidden="true"');
  });

  it('restarts cleanly without overlapping effects and removes all temporary classes', () => {
    const f = fixture();
    f.play('level');
    expect(f.classes.has('celebrating-level')).toBe(true);
    vi.advanceTimersByTime(500);
    f.play('evolve');
    expect(f.overlays[0].removed).toBe(true);
    expect(f.classes.has('celebrating-level')).toBe(false);
    expect(f.classes.has('celebrating-evolve')).toBe(true);
    vi.advanceTimersByTime(1800);
    expect(f.overlays[1].removed).toBe(false);
    vi.advanceTimersByTime(600);
    expect(f.overlays[1].removed).toBe(true);
    expect(f.classes.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows a static, temporary success label with reduced motion', () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    const f = fixture();
    f.play('level');
    expect(f.overlays[0].className).toContain('celebration-reduced');
    expect(f.overlays[0].innerHTML).toContain('Level up');
    vi.advanceTimersByTime(1800);
    expect(f.overlays[0].removed).toBe(true);
  });

  it('reports a missing portrait explicitly', () => {
    expect(() => Reflect.apply(celebrateUpgrade, undefined, [
      { querySelector: () => null }, starters[0], 'level', { level: 1, evolution: 1 },
    ])).toThrow('Character portrait is missing');
  });
});
