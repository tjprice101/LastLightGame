import { describe, expect, it } from 'vitest';
import { validateConduitElement, validateConduitSlots } from '../src/content/conduits';
import { getStarter, starters } from '../src/content/starters';
import { createStoryBattle } from '../src/game/battle';
import { enemyCombatStats } from '../src/content/stat-growth';
import { calamityActivities } from '../src/content/calamity';
import { enemyAbilityMultiplier, enemySkills } from '../src/content/enemy-skills';
import { describeSurvey, enemyWhatIf, levelSweepLevels, loadout, makeBattle, makeLevelProbe, measureBattle, progressAt, surveyLimits } from './battle-survey';

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
  it('covers every ten enemy levels from80 through180 plus exact Calamity milestones', () => {
    expect(levelSweepLevels).toEqual([80, 90, 100, 110, 120, 130, 140, 145, 150, 160, 170, 180, 185]);
    for (const level of levelSweepLevels) {
      const state = makeLevelProbe(level, ['ember', 'tide', 'sprout'], 'master5', 1729, 'machines');
      expect(state.enemies[0].level).toBe(level);
      expect(state.enemies[0].stats).toEqual(enemyCombatStats(level, true));
      expect(state.enemies[0].hp).toBe(state.enemies[0].stats.health);
      expect(state.allies.map(unit => unit.level)).toEqual([105, 105, 105]);
    }
    expect(() => makeLevelProbe(190, ['ember'], 'bare', 1729, 'machines')).toThrow();
    expect(() => makeLevelProbe(150, ['ember'], 'bare', 1729, 'standard')).toThrow();
  });
  it('exactly reproduces all36 native Calamity encounters at145/160/185', () => {
    for (const { id } of calamityActivities) for (const tier of [1, 2, 3] as const) {
      const actual = makeBattle({ kind: 'calamity', activity: id, tier }, ['ember', 'tide', 'sprout'], 105, 'master5', 1729);
      expect(makeLevelProbe([145, 160, 185][tier - 1], ['ember', 'tide', 'sprout'], 'master5', 1729, id)).toEqual(actual);
    }
  });
  it('rebuilds standard boss level-dependent skills while preserving the native120 control', () => {
    const native = makeBattle({ kind: 'infusion', mode: 'machines', stage: 35 }, ['ember'], 105, 'mixed5', 1729);
    expect(makeLevelProbe(120, ['ember'], 'mixed5', 1729, 'standard')).toEqual(native);
    const state = makeLevelProbe(80, ['ember'], 'mixed5', 1729, 'standard'), enemy = state.enemies[0];
    expect(enemy.stats).toEqual(enemyCombatStats(80, true));
    expect(enemy.enemySkills).toEqual(enemySkills(80, true, native.enemies[0].enemySkills![0].name, enemyAbilityMultiplier(80)));
    expect(state.allies).toEqual(native.allies);
  });
  it('uses the real Rose reward range for standard130/140 so successful probes can finish', () => {
    for (const level of [130, 140]) {
      const state = makeLevelProbe(level, ['ember', 'tide', 'sprout'], 'mixed5', 1729, 'standard');
      expect(state.infusion?.mode).toBe('roses');
      expect(measureBattle(state).result.outcome).toBe('win');
    }
    expect(makeLevelProbe(140, ['ember'], 'mixed5', 1729, 'standard')).toEqual(
      makeBattle({ kind: 'infusion', mode: 'roses', stage: 35 }, ['ember'], 105, 'mixed5', 1729));
  });
});
