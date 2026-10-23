import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { approvedConduitCatalog } from './phase-zero-conduit-catalog';
import { phaseZeroUpgradedAbility, phaseZeroUpgradePercentages } from './phase-zero-conduit-upgrades';
import { conduits, conduitEffect } from './conduits';
import { masterConduits } from './master-conduits';
import { calamiticEffect, isCalamiticConduitId } from './calamitic-conduits';

vi.mock('./phase-zero-stats', async original => ({
  ...await original<typeof import('./phase-zero-stats')>(), phaseZeroStatsReady: true,
}));

describe('approved ability upgrade presentation', () => {
  it('has an explicit policy for exactly all 90 upgradable entries', () => {
    expect(Object.keys(phaseZeroUpgradePercentages).sort()).toEqual(conduits.map(entry => entry.id).sort());
    for (const [id, indices] of Object.entries(phaseZeroUpgradePercentages)) {
      const values = [...approvedConduitCatalog[id].ability.matchAll(/([+-]?\d+(?:\.\d+)?)%/g)];
      expect(new Set(indices).size, id).toBe(indices.length);
      for (const index of indices) {
        expect(index, id).toBeGreaterThanOrEqual(0);
        expect(index, id).toBeLessThan(values.length);
        expect(Number(values[index][1]), id).toBeGreaterThan(0);
      }
    }
  });

  it.each([...conduits, ...masterConduits])('$id preserves its entire owner-authored default, including continuation lines', entry => {
    const text = readFileSync(new URL('../../docs/conduit-catalog.txt', import.meta.url), 'utf8');
    const blocks = [...text.matchAll(/^Name: (.+)\r?\nRarity: .+\r?\nElement: .+\r?\nAbility \(Default Value\): ([\s\S]*?)(?=\r?\n\r?\n|(?![\s\S]))/gm)];
    const expected = blocks.find(block => block[1].trim() === entry.name)?.[2].trim();
    expect(expected, entry.id).toBeDefined();
    expect(phaseZeroUpgradedAbility(entry.id)).toBe(expected?.replace(/\s+/g, ' '));
  });

  describe.each([0, 1, 2, 3, 4, 5])('+%i', level => {
    it.each(conduits)('$id exposes the same upgraded value through every effect API and keeps fixed tokens', entry => {
      const actual = phaseZeroUpgradedAbility(entry.id, level)!;
      const expectedIndices = phaseZeroUpgradePercentages[entry.id];
      const base = approvedConduitCatalog[entry.id].ability;
      const baseNumbers = [...base.matchAll(/([+-]?\d+(?:\.\d+)?)%/g)].map(match => Number(match[1]));
      const actualNumbers = [...actual.matchAll(/([+-]?\d+(?:\.\d+)?)%/g)].map(match => Number(match[1]));
      expect(actualNumbers).toHaveLength(baseNumbers.length);
      baseNumbers.forEach((value, index) => expect(actualNumbers[index], `${entry.id} percentage ${index}`)
        .toBeCloseTo(value * (expectedIndices.includes(index) ? 1 + level * .1 : 1), 8));
      expect(actual.replace(/([+-]?\d+(?:\.\d+)?)%/g, '%')).toBe(base.replace(/([+-]?\d+(?:\.\d+)?)%/g, '%'));
      expect(conduitEffect(entry, level)).toBe(actual);
      if (isCalamiticConduitId(entry.id)) expect(calamiticEffect(entry.id, level)).toBe(actual);
    });
  });

  it.each(masterConduits)('$id stays fixed and rejects every positive upgrade', entry => {
    expect(entry.effect).toBe(phaseZeroUpgradedAbility(entry.id));
    for (let level = 1; level <= 5; level++)
      expect(() => phaseZeroUpgradedAbility(entry.id, level)).toThrow('cannot be upgraded');
  });

  it('does not upgrade thresholds, costs, penalties, duration or the Kirin recipient cap', () => {
    expect(phaseZeroUpgradedAbility('citadel-spine', 5)).toContain('below 75% [Health] gain +52.5% [Defense]');
    expect(phaseZeroUpgradedAbility('wardglass-transformer', 5)).toContain('-35% [Defense]');
    expect(phaseZeroUpgradedAbility('nullsong-transmission', 5)).toContain('50% chance to gain +112.5% [Skill Power]; otherwise it receives -75%');
    expect(phaseZeroUpgradedAbility('tranquilitic-kirin-cradle', 5)).toContain('150% of your effective [Defense], capped at 50%');
    expect(phaseZeroUpgradedAbility('calamitic-world-eater-orrery', 5)).toContain('+3 turns [Skill Duration]');
    expect(phaseZeroUpgradedAbility('stasis-reliquary', 5)).toContain('25% more');
  });

  it.each([-1, .5, 6, NaN, Infinity])('rejects invalid upgrade %s', level => {
    expect(() => phaseZeroUpgradedAbility('bastion-lock', level)).toThrow('integer from 0 to 5');
  });
});
