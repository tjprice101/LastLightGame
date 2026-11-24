import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyAccent } from './accent';
import { deviceReducedMotion, installMotion, motionAllowed } from './motion';

afterEach(() => vi.unstubAllGlobals());

function world(inGame: 'system' | 'reduced', device: boolean) {
  const dataset: Record<string, string> = { motion: inGame };
  const windowListeners = new Map<string, () => void>();
  const media = { matches: device, listener: null as null | (() => void),
    addEventListener(_: string, listener: () => void) { media.listener = listener; },
    removeEventListener() { media.listener = null; } };
  vi.stubGlobal('document', { documentElement: { dataset } });
  vi.stubGlobal('window', {
    addEventListener: (type: string, listener: () => void) => { windowListeners.set(type, listener); },
    removeEventListener: (type: string) => { windowListeners.delete(type); },
  });
  vi.stubGlobal('matchMedia', () => media);
  return { dataset, windowListeners, media };
}

describe('menu motion: in-game setting or device setting', () => {
  it.each([
    ['system', false, true],
    ['system', true, false],
    ['reduced', false, false],
    ['reduced', true, false],
  ] as const)('in-game %s with device reduction %s allows motion: %s', (inGame, device, allowed) => {
    world(inGame, device);
    expect(deviceReducedMotion()).toBe(device);
    expect(motionAllowed()).toBe(allowed);
  });

  it('treats a missing matchMedia as no device preference', () => {
    vi.stubGlobal('document', { documentElement: { dataset: { motion: 'system' } } });
    vi.stubGlobal('matchMedia', undefined);
    expect(motionAllowed()).toBe(true);
  });

  it('mirrors the answer to one attribute and follows both settings', () => {
    const { dataset, windowListeners, media } = world('system', false);
    const dispose = installMotion();
    expect(dataset.motionEffective).toBe('full');
    dataset.motion = 'reduced';
    windowListeners.get('last-light-motion-change')!();
    expect(dataset.motionEffective).toBe('reduced');
    dataset.motion = 'system';
    media.matches = true;
    media.listener!();
    expect(dataset.motionEffective).toBe('reduced');
    dispose();
    expect(windowListeners.size).toBe(0);
    expect(media.listener).toBeNull();
  });
});

describe('interface accent channel', () => {
  it('writes the accent to --ui-accent and rejects anything but a hex colour', () => {
    const setProperty = vi.fn();
    applyAccent({ style: { setProperty } }, '#c9b8ff');
    expect(setProperty).toHaveBeenCalledWith('--ui-accent', '#c9b8ff');
    expect(() => applyAccent({ style: { setProperty } }, 'red')).toThrow('hex colour');
  });
});
