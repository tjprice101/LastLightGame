import { describe, expect, it } from 'vitest';
import { allEncounters, assertNonCalamitic, calibrationSeeds, optimizedBattle, playerLevel,
  progressionBuild, runOptimized, trainingBattle } from './progression-balance';
import { loadout, makeBattle, measureBattle } from './battle-survey';
import { storyStageLayout } from '../src/content/activities';
import { calamityActivities } from '../src/content/calamity';
import { getConduit } from '../src/content/conduits';

describe('non-Calamitic progression calibration', () => {
  it('includes every current stage and never silently caps a mislabeled Training probe', () => {
    expect(allEncounters().filter(row => row.kind === 'story')).toHaveLength(storyStageLayout.stages);
    expect(allEncounters().filter(row => row.kind === 'calamity')).toHaveLength(36);
    for (const value of [0, 121, 140, NaN, 1.5])
      expect(() => trainingBattle(value, ['ember'], 105, 'common0', 1)).toThrow('Training benchmark');
    expect(trainingBattle(120, ['ember'], 105, 'common0', 1).enemies[0].level).toBe(120);
  });
  it('keeps all progression bands legal, capped and free of Calamitic assumptions', () => {
    for (let level = 1; level <= 185; level++) {
      expect(playerLevel(level)).toBeLessThanOrEqual(105);
      assertNonCalamitic(loadout(['ember', 'tide', 'sprout'], progressionBuild(level)));
    }
    expect(() => assertNonCalamitic(loadout(['ember'], 'calamitic5'))).toThrow('Calamitic');
    const state = optimizedBattle('machines', 3, ['ember', 'tide', 'sprout'], 1);
    for (const unit of state.allies) {
      expect(unit.masterConduit).toBeTruthy();
      expect(unit.conduits!.every(id => !id || getConduit(id).rarity !== 'Calamitic')).toBe(true);
    }
  });
  it('does not starve Tizu offense by repeatedly spending Gauge on a shield-only Flare', () => {
    const result = measureBattle(trainingBattle(20, ['tide'], 19, 'common0', 1729), 'balanced').result;
    expect(result.outcome).toBe('win');
    expect(result.rounds).toBeLessThan(20);
    expect(result.contribution.tide.actions.skill1).toBeGreaterThan(0);
  });
  it('keeps every Story stage viable for any single free starter using only Store Commons', () => {
    for (let stage = 1; stage <= storyStageLayout.stages; stage++)
      for (const id of ['ember', 'tide', 'sprout'] as const) for (const seed of calibrationSeeds) {
        const probe = makeBattle({ kind: 'story', stage }, [id], 0, 'common0', seed);
        const result = measureBattle(makeBattle({ kind: 'story', stage }, [id],
          playerLevel(probe.enemies[0].level!), 'common0', seed), 'balanced').result;
        expect(result.outcome, `${id} Story${stage} seed${seed}`).toBe('win');
        expect(result.rounds).toBeLessThanOrEqual(30);
      }
  }, 60_000);
  it('offers at least two repeatable non-Calamitic team solutions for every EX+3 boss', () => {
    const wins = new Map<string, number>();
    runOptimized(row => {
      const result = row as { encounter: { tier: number; activity: string }; roster: string[]; policy: string; outcome: string };
      if (result.encounter.tier !== 3 || result.outcome !== 'win') return;
      const key = [result.encounter.activity, result.roster.join(','), result.policy].join('|');
      wins.set(key, (wins.get(key) ?? 0) + 1);
    });
    for (const activity of calamityActivities) {
      const robust = new Set([...wins].filter(([key, count]) =>
        key.startsWith(`${activity.id}|`) && count === calibrationSeeds.length).map(([key]) => key.split('|')[1]));
      expect(robust.size, activity.id).toBeGreaterThanOrEqual(2);
    }
  }, 90_000);
});
