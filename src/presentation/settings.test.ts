import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { applyMotion, loadMotion, reducedMotion, saveMotion } from './settings';

afterEach(() => vi.unstubAllGlobals());

describe('explicit in-game motion preference', () => {
  it.each([true, false])('keeps the in-game preference explicit when system reduction is %s', (deviceReduced) => {
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

  it('supports both system and explicit in-game reduced motion for the portrait animation', () => {
    const workspaceCss = readFileSync(join(process.cwd(), 'src', 'presentation', 'menu-workspace.css'), 'utf8');
    expect(workspaceCss).toContain('html[data-menu-workspace]:not([data-motion="reduced"])');
    expect(workspaceCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(workspaceCss).toContain('.ref-character-portrait::before { animation: none !important; }');
    expect(readFileSync(join(process.cwd(), 'src', 'style.css'), 'utf8'))
      .toContain(':root[data-motion="reduced"] *::after { animation: none !important; transition: none !important; }');
  });
});
