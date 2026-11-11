import { describe, expect, it } from 'vitest';
import { characterLevelCap } from '../content/progression';
import { releasedRadiantIds } from '../content/combat-kits';
import { readyFlare } from '../game/combat-gauge';
import { resolveRadiantRun, type RadiantRunAuthority } from '../online/battle-run';
import { createRadiantReviewFixture, radiantReviewEncounters, setRadiantReviewCharge } from './battle-review-fixtures';

const authority: RadiantRunAuthority = {
  capability: 'isolated-radiant-study',
  now: Date.UTC(2026, 10, 8),
  entry: () => ({ runId: '00000000-0000-4000-8000-000000000001', encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }),
};

function enter(fixture: ReturnType<typeof createRadiantReviewFixture>) {
  return resolveRadiantRun({ revision: 0, state: fixture.game }, {
    requestId: '00000000-0000-4000-8000-000000000002', expectedRevision: 0, runId: null, encounter: null,
    operation: { kind: 'start', activity: fixture.activity, calibration: 'radiant-pressure-v2' },
  }, authority).state.radiantStudy!;
}

describe('isolated Radiant review fixtures', () => {
  it('enters every released leader and saved form with legal levels and charge layers', () => {
    for (const leader of releasedRadiantIds) for (let form = 1; form <= 6; form++) {
      const fixture = createRadiantReviewFixture(leader, form, 'story-25', true);
      const run = enter(fixture);
      expect(run.state.bearers[0].loadout, `${leader} form ${form}`).toMatchObject({
        id: leader, form, level: Math.min(105, characterLevelCap(form, leader)),
      });
      expect(run.state.bearers).toHaveLength(6);
      for (let cycle = 0; cycle <= 3; cycle++) {
        const gauge = structuredClone(run.state.gauge);
        setRadiantReviewCharge(gauge, cycle);
        const expected = cycle === 0 ? null : form < 4 || cycle === 1 ? 'glowing'
          : form === 6 && cycle === 3 ? 'eternal' : 'lustrous';
        expect(readyFlare(gauge, leader), `${leader} form ${form}, cycle ${cycle}`).toBe(expected);
      }
    }
  });

  it('enters each representative authored formation through the actual run resolver', () => {
    const sizes: Record<string, number> = {
      'story-25': 2, 'story-1': 2, 'story-20': 1, training: 3,
      'infernic-34': 6, 'machines-34': 6, 'nerithe-10': 1,
    };
    for (const encounter of radiantReviewEncounters) {
      const run = enter(createRadiantReviewFixture('ember', 6, encounter.id, false));
      expect(run.anchor.activity).toEqual(encounter.activity);
      expect(run.state.enemies, encounter.id).toHaveLength(sizes[encounter.id]);
    }
  });

  it('rejects invalid forms, encounters and charge cycles rather than substituting a fixture', () => {
    expect(() => createRadiantReviewFixture('ember', 7, 'story-25', false)).toThrow();
    expect(() => createRadiantReviewFixture('ember', 6, 'missing', false)).toThrow('Unknown Radiant review encounter.');
    const run = enter(createRadiantReviewFixture('ember', 6, 'story-25', false));
    const gauge = structuredClone(run.state.gauge);
    expect(() => setRadiantReviewCharge(gauge, 4)).toThrow('Invalid Radiant review charge cycle.');
    expect(gauge).toEqual(run.state.gauge);
  });
});
