import { describe, expect, it } from 'vitest';
import { validateConduitElement, validateConduitSlots } from '../src/content/conduits';
import { getStarter, starters } from '../src/content/starters';
import { createStoryBattle } from '../src/game/battle';
import { describeSurvey, enemyWhatIf, loadout, makeBattle, measureBattle, progressAt, surveyLimits } from './battle-survey';

describe('offline battle survey integrity', () => {
  it('constructs legal eight-slot, matching-element loadouts for all16 characters and every build', () => {
    const metadata = describeSurvey();
    expect(starters).toHaveLength(16);
    for (const gear of Object.values(metadata.builds)) for (const character of starters) {
      const slots = gear.equipment[character.id]!;
      expect(validateConduitSlots(slots)).toEqual(slots);
      expect(() => validateConduitElement(slots, getStarter(character.id).elementId)).not.toThrow();
    }
  });
  it('uses minimum legal evolutions without hidden levels or weapon ranks', () => {
    expect([0, 15, 30, 45, 60, 75, 90, 105].map(progressAt)).toEqual([
      { level: 0, evolution: 1 }, { level: 15, evolution: 1 }, { level: 30, evolution: 1 },
      { level: 45, evolution: 2 }, { level: 60, evolution: 3 }, { level: 75, evolution: 4 },
      { level: 90, evolution: 5 }, { level: 105, evolution: 6 },
    ]);
    expect(() => progressAt(106)).toThrow();
  });
  it('preserves real enemy stats and natural entry Gauge without mutating the initial state', () => {
    const state = makeBattle({ kind: 'story', stage: 20 }, ['ember', 'tide', 'sprout'], 30, 'bare', 1729);
    expect(state).toEqual(createStoryBattle(20, 1729, 'ember', progressAt(30),
      ['ember', 'tide', 'sprout'], { ember: progressAt(30), tide: progressAt(30), sprout: progressAt(30) },
      loadout(['ember', 'tide', 'sprout'], 'bare').equipment));
    const before = structuredClone(state);
    const result = measureBattle(state);
    expect(state).toEqual(before);
    expect(result.result.outcome).toBe('win');
    expect(result.result.rounds).toBeGreaterThan(0);
    expect(Object.values(result.result.contribution).reduce((sum, unit) => sum + unit.damage, 0))
      .toBe(state.enemies.reduce((sum, enemy) => sum + enemy.hp, 0));
  });
  it('is deterministic for identical seeds, builds and policies', () => {
    const state = makeBattle({ kind: 'calamity', activity: 'machines', tier: 3 },
      ['ember', 'tide', 'sprout'], 105, 'master5', 54321);
    expect(measureBattle(state)).toEqual(measureBattle(state));
  });
  it('distinguishes defeat from unresolved simulation limits', () => {
    const state = makeBattle({ kind: 'calamity', activity: 'machines', tier: 3 }, ['ember'], 0, 'bare', 1729);
    expect(measureBattle(state).result.outcome).toBe('defeat');
    expect(measureBattle(state, 'native', { ...surveyLimits, rounds: 0 }).result.outcome).toBe('timeout');
  });
  it('tests no-Master controls without removing the support characters Masters', () => {
    const gear = loadout(['elise', 'ember', 'tide'], 'master5', { elise: null });
    expect(gear.masters.elise).toBeNull();
    expect(gear.masters.ember).toBe('master-ember-1');
    expect(gear.masters.tide).toBe('master-tide-3');
  });
  it('isolates hypothetical enemy increases, leaving allies, live input and sub100 enemies untouched', () => {
    const state = makeBattle({ kind: 'infusion', mode: 'machines', stage: 35 }, ['ember'], 105, 'master5', 1729);
    const before = structuredClone(state), hypothetical = enemyWhatIf(state, 'hp150-attack110');
    expect(state).toEqual(before);
    expect(hypothetical.allies).toEqual(state.allies);
    expect(hypothetical.enemies[0].hp).toBe(Math.round(state.enemies[0].hp * 1.5));
    expect(hypothetical.enemies[0].stats.damage).toBe(Math.round(state.enemies[0].stats.damage * 1.1));
    const early = makeBattle({ kind: 'infusion', mode: 'machines', stage: 25 }, ['ember'], 105, 'master5', 1729);
    expect(early.enemies[0].level).toBeLessThan(100);
    expect(enemyWhatIf(early, 'hp150-attack110')).toEqual(early);
  });
});
