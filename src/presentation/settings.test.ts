import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { applyMotion, loadMotion, reducedMotion, saveMotion } from './settings';

afterEach(() => vi.unstubAllGlobals());

describe('explicit in-game motion preference', () => {
  it.each([true, false])('plays animations by default even when device reduction is %s', (deviceReduced) => {
    const dataset: Record<string, string> = {};
    const dispatchEvent = vi.fn();
    const matchMedia = vi.fn(() => ({ matches: deviceReduced }));
    vi.stubGlobal('document', { documentElement: { dataset } });
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal('matchMedia', matchMedia);
    expect(reducedMotion()).toBe(false);
    applyMotion('system');
    expect(reducedMotion()).toBe(false);
    applyMotion('reduced');
    expect(reducedMotion()).toBe(true);
    applyMotion('system');
    expect(reducedMotion()).toBe(false);
    expect(matchMedia).not.toHaveBeenCalled();
    expect(dispatchEvent).toHaveBeenCalledTimes(3);
  });

  it('preserves existing saved keys and only reduces motion on explicit selection', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); } };
    expect(loadMotion(storage)).toBe('system');
    expect(values.size).toBe(0);
    saveMotion(storage, 'reduced');
    expect(loadMotion(storage)).toBe('reduced');
    saveMotion(storage, 'system');
    expect(loadMotion(storage)).toBe('system');
  });

  it('never lets a device media query suppress CSS animation independently of the game setting', () => {
    function check(directory: string): void {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) check(path);
        else if (entry.name.endsWith('.css')) expect(readFileSync(path, 'utf8'), path).not.toContain('prefers-reduced-motion');
      }
    }
    check(join(process.cwd(), 'src'));
    expect(readFileSync(join(process.cwd(), 'src', 'style.css'), 'utf8'))
      .toContain(':root[data-motion="reduced"] *::after { animation: none !important; transition: none !important; }');
  });
});
