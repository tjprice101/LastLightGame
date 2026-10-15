import { describe, expect, it } from 'vitest';
import { enemyCombatStats, enemyExponentialRates, enemyGrowth, enemyStat } from './stat-growth';
import { calamityActivities, calamityEncounter } from './calamity';
import { resolveFighter } from './combat';
import { dungeonEncounter, playableDungeons } from './dungeons';
import { infusionEncounter } from './infusions';
import { act, actionUnavailable, createBattle, createDungeonBattle, createInfusionBattle, endTurn, nextWave } from '../game/battle';
import { starters } from './starters';
import { benchmarkTarget } from '../game/native-benchmark-pilot';

describe('accelerating enemy stat curves', () => {
  it('uses one shifted exponential from the opening through185 without120/140 plateaus or Calamity multipliers', () => {
    for (const boss of [false, true]) {
      const opening = enemyCombatStats(1, boss);
      expect(opening).toMatchObject({ health: boss ? 208 : 83, damage: boss ? 28 : 22, defense: boss ? 5 : 4 });
      for (let level = 1; level <= 185; level++) {
        const stats = enemyCombatStats(level, boss);
        for (const [stat, base, slope] of [
          ['health', boss ? 207.5 : 83, .45],
          ['damage', boss ? 27.5 : 22, .25],
          ['defense', boss ? 16 / 3 : 4, .30],
        ] as const) {
          const rate = enemyExponentialRates[stat];
          expect(stats[stat]).toBe(Math.round(base * (1 + slope * Math.expm1(rate * (level - 1)) / rate)));
          expect(Number.isSafeInteger(stats[stat])).toBe(true);
          if (level >= 21) {
            const before = enemyCombatStats(level - 20, boss)[stat];
            const middle = enemyCombatStats(level - 10, boss)[stat];
            expect(Math.abs((stats[stat] - middle) - (middle - before) * Math.exp(rate * 10))).toBeLessThan(3);
          }
        }
      }
    }
    for (const { id } of calamityActivities) for (const tier of [1, 2, 3] as const) {
      const encounter = calamityEncounter(id, tier);
      expect(encounter.stats).toEqual(enemyCombatStats(encounter.level, true));
    }
    for (const value of [0, -1, 186, NaN, Infinity, 1.5]) expect(() => enemyCombatStats(value, false)).toThrow();
  });

  it.each(starters)('$name retains playable growth while hostile relative pressure compounds', ({ id }) => {
    const early = resolveFighter(id, { level: 60, evolution: 3 }).stats;
    const late = resolveFighter(id, { level: 105, evolution: 6 }).stats;
    const before = enemyCombatStats(60, false);
    const after = enemyCombatStats(105, false);
    for (const stat of ['health', 'damage', 'defense'] as const) {
      expect(after[stat] / before[stat]).toBeGreaterThan(late[stat] / early[stat]);
      expect(enemyCombatStats(185, true)[stat] / enemyCombatStats(120, true)[stat]).toBeGreaterThan(3.5);
    }
  });
  it('keeps opening values, doubles initial health/attack growth and reaches exact endgame thresholds', () => {
    expect(enemyStat(110, 200_000, 1, 1, .24)).toBe(110);
    expect(enemyStat(110, 200_000, 2, 1, .24)).toBe(136);
    let last = 0;
    for (let level = 10; level <= 120; level++) {
      const health = enemyStat(55, 200_000, level, 10, .024);
      expect(health).toBeGreaterThanOrEqual(last);
      expect(health).toBeGreaterThanOrEqual(Math.round(55 * (1 + (level - 10) * .024)));
      last = health;
    }
    expect(last).toBe(200_000);
    expect(enemyStat(55, 200_000, 500, 10, .024)).toBe(200_000);
    for (const level of [0, 1.5, NaN, Infinity]) expect(() => enemyStat(55, 200_000, level, 10, .024)).toThrow();
  });

  it('applies the same endpoints to shortened dungeons, both infusion modes and Adventure', () => {
    for (const element of playableDungeons) {
      expect(dungeonEncounter(element, 34).stats.health).toBeLessThan(enemyGrowth.health);
      expect(dungeonEncounter(element, 35).stats).toMatchObject(enemyCombatStats(120, true));
    }
    for (const mode of ['heavens', 'abyss'] as const) expect(infusionEncounter(mode, 35).stats.health).toBe(enemyGrowth.bossHealth);
    let state = createBattle();
    for (let wave = 1; wave < 120; wave++) {
      state.phase = 'cleared';
      state.enemies.forEach((enemy) => { enemy.hp = 0; });
      state = nextWave(state).state;
    }
    expect(state.enemies.every((enemy) => enemy.level === 120 && enemy.stats.health === enemyGrowth.health)).toBe(true);
  });

  it('opts into the anchored quadratic140 extension without changing legacy120 curves', () => {
    for (let level = 80; level <= 120; level++) {
      expect(enemyStat(90, 200000, level, 80, .036, 140))
        .toBe(enemyStat(90, 200000, level, 80, .036));
    }
    expect(enemyStat(90, 200000, 140, 80, .036, 140)).toBe(591680);
    expect(enemyStat(90, 200000, 140, 80, .036)).toBe(200000);
    expect(() => enemyStat(90, 200000, 140, 80, .036, 141)).toThrow();
  });

  it.each(starters)('$name cannot solo trivialize final bosses without equipment across three seeds', (starter) => {
    const progress = { level: 105, evolution: 6 };
    for (const seed of [1, 1729, 12345]) {
      for (const initial of [createDungeonBattle(starter.elementId, 35, seed, starter.id, progress),
        createInfusionBattle('heavens', 35, seed, starter.id, progress), createInfusionBattle('abyss', 35, seed, starter.id, progress)]) {
        let state = initial;
        for (let turn = 0; state.phase === 'player' && turn < 100; turn++) {
          const actor = state.allies[0];
          const priorities = starter.id === 'disciple' ? ['skill1', 'skill2', 'light'] as const : ['ultimate', 'skill1', 'light'] as const;
          const action = priorities.find((id) => !actionUnavailable(state, actor, id));
          if (action) state = act(state, actor.id, action, benchmarkTarget(state, actor, action)).state;
          if (state.phase === 'player') state = endTurn(state).state;
        }
        expect(state.phase, `${starter.name}, seed ${seed}, ${initial.infusion?.mode ?? 'dungeon'}`).toBe('defeat');
      }
    }
  });
});
