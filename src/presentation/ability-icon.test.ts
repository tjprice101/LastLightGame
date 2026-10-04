import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { abilityIcon, infernisIcons } from './ability-icon';

describe('Infernis ability icons', () => {
  it('maps all six actions to separate square RGBA assets with accessible text supplied by the host', () => {
    expect(new Set(Object.values(infernisIcons)).size).toBe(6);
    for (const action of ['passive', 'light', 'heavy', 'skill1', 'skill2', 'ultimate'] as const) {
      expect(abilityIcon('ember', action)).toContain(`abilities/${infernisIcons[action]}.png`);
      expect(abilityIcon('ember', action)).toContain('alt="" aria-hidden="true"');
      const png = readFileSync(new URL(`../../public/assets/abilities/${infernisIcons[action]}.png`, import.meta.url));
      expect(png.readUInt32BE(16)).toBe(256);
      expect(png.readUInt32BE(20)).toBe(256);
      expect(png[25]).toBe(6);
    }
  });
  it('does not substitute Infernis icons for water or grass characters', () => {
    expect(abilityIcon('tide', 'skill1')).toBe('');
    expect(abilityIcon('sprout', 'passive')).toBe('');
  });
});
