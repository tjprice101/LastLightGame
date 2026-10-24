import { describe, expect, it } from 'vitest';
import { enemyCombatStats, enemyExponentialRates, enemyGrowth, enemyResistanceRamp, enemyStat, enemyStrengthMultiplier } from './stat-growth';
import { calamityActivities, calamityEncounter, calamityTierScaling } from './calamity';
import { resolveFighter } from './combat';
import { dungeonEncounter, playableDungeons } from './dungeons';
import { capturedEnemyStats, infusionEncounter } from './infusions';
import { infusionModeStageCount } from './activities';
import { act, actionUnavailable, createBattle, createDungeonBattle, createInfusionBattle, endTurn, nextWave } from '../game/battle';
import { starters } from './starters';
import { benchmarkTarget } from '../game/native-benchmark-pilot';

describe('accelerating enemy stat curves', () => {
  it('preserves the shared curve through185 and applies Calamity adjustments only at the encounter boundary', () => {
    for (const boss of [false, true]) {
      const opening = enemyCombatStats(1, boss);
      expect(enemyStrengthMultiplier).toBe(1.05);
      expect(opening).toMatchObject({ health: boss ? 218 : 87, damage: boss ? 29 : 23, defense: boss ? 6 : 4 });
      for (let level = 1; level <= 185; level++) {
        const stats = enemyCombatStats(level, boss);
        for (const [stat, base, slope] of [
          ['health', boss ? 207.5 : 83, .45],
          ['damage', boss ? 27.5 : 22, .25],
          ['defense', boss ? 16 / 3 : 4, .30],
        ] as const) {
          const rate = enemyExponentialRates[stat];
          const progress = (level - 80) / 65;
          const effectiveLevel = level > 80 && level < 145
            ? level + 160 * progress ** 2 * (1 - progress) ** 2 : level;
          const original = base * (1 + slope * Math.expm1(rate * (effectiveLevel - 1)) / rate);
          const resistance = enemyResistanceRamp[stat] ** (Math.max(0, effectiveLevel - 80) / 60);
          expect(stats[stat]).toBe(Math.round(original * 1.05 * resistance));
          expect(Math.abs(stats[stat] - original * 1.05 * resistance)).toBeLessThanOrEqual(.5);
          expect(Number.isSafeInteger(stats[stat])).toBe(true);
          if (level >= 21 && level <= 80) {
            const before = enemyCombatStats(level - 20, boss)[stat];
            const middle = enemyCombatStats(level - 10, boss)[stat];
            expect(Math.abs((stats[stat] - middle) - (middle - before) * Math.exp(rate * 10))).toBeLessThan(3);
          }
          if (level > 1) {
            const previous = enemyCombatStats(level - 1, boss)[stat];
            expect(stats[stat]).toBeGreaterThanOrEqual(previous);
            if (level > 80) expect(stats[stat] / previous).toBeLessThan(1.072);
          }
        }
      }
    }
    for (const { id } of calamityActivities) for (const tier of [1, 2, 3] as const) {
      const encounter = calamityEncounter(id, tier);
      const expected = enemyCombatStats(encounter.level, true);
      for (const stat of ['health', 'damage', 'defense'] as const)
        expected[stat] = Math.round(expected[stat] * calamityTierScaling[tier].statMultiplier);
      expect(encounter.stats).toEqual(expected);
    }
    for (const value of [0, -1, 186, NaN, Infinity, 1.5]) expect(() => enemyCombatStats(value, false)).toThrow();
  });

  it('strengthens every intermediate81-144 stat while preserving all opening and accepted Calamity stats', () => {
    for (const boss of [false, true]) {
      for (let level = 1; level <= 185; level++) {
        for (const [stat, base, slope, target] of [
          ['health', boss ? 207.5 : 83, .45, 3],
          ['damage', boss ? 27.5 : 22, .25, 1.5],
          ['defense', boss ? 16 / 3 : 4, .30, 2],
        ] as const) {
          const rate = enemyExponentialRates[stat];
          const before = base * (1 + slope * Math.expm1(rate * (level - 1)) / rate) * 1.05;
          const previous = Math.round(before * target ** (Math.max(0, level - 80) / 60));
          if (level > 80 && level < 145) expect(enemyCombatStats(level, boss)[stat]).toBeGreaterThanOrEqual(previous);
          else expect(enemyCombatStats(level, boss)[stat]).toBe(previous);
          if (level >= 82 && level <= 143) expect(enemyCombatStats(level, boss)[stat]).toBeGreaterThan(previous);
        }
      }
    }
  });

  it('joins80 and145 without a growth-rate cliff and never reaches EX+1 stats early', () => {
    for (const boss of [false, true]) for (const stat of ['health', 'damage', 'defense'] as const) {
      const growth = (level: number) => Math.log(enemyCombatStats(level, boss)[stat] / enemyCombatStats(level - 1, boss)[stat]);
      const base = stat === 'health' ? boss ? 207.5 : 83 : stat === 'damage' ? boss ? 27.5 : 22 : boss ? 16 / 3 : 4;
      const slope = stat === 'health' ? .45 : stat === 'damage' ? .25 : .30;
      const rate = enemyExponentialRates[stat];
      const previous81 = Math.round(base * (1 + slope * Math.expm1(rate * 80) / rate) * 1.05 * enemyResistanceRamp[stat] ** (1 / 60));
      const previousGrowth81 = Math.log(previous81 / enemyCombatStats(80, boss)[stat]);
      expect(Math.abs(growth(81) - previousGrowth81)).toBeLessThan(.007);
      expect(Math.abs(growth(145) - growth(146))).toBeLessThan(.007);
      for (let level = 81; level < 145; level++) {
        expect(Math.abs(growth(level + 1) - growth(level))).toBeLessThan(.007);
        expect(enemyCombatStats(level, boss)[stat]).toBeLessThan(enemyCombatStats(145, boss)[stat]);
      }
    }
  });

  it.each([
    [80, 25856, 1731, 329],
    [90, 47170, 2665, 518],
    [100, 92565, 4306, 856],
    [110, 164798, 6474, 1311],
    [120, 248758, 8652, 1774],
    [130, 327316, 10493, 2168],
    [140, 424325, 12589, 2620],
    [145, 512313, 14367, 3005],
    [160, 1003175, 22992, 4892],
    [170, 1567959, 31407, 6756],
    [185, 3059413, 50059, 10938],
  ])('locks exact Lv%s boss stats with one final rounding step', (level, health, damage, defense) => {
    expect(enemyCombatStats(level, true)).toMatchObject({ health, damage, defense });
  });

  it('leaves captured playable stats on their independent player-growth curve', () => {
    expect(capturedEnemyStats(120)).toMatchObject({ health: 4180, damage: 722, defense: 16 * 19 ** .7 });
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
    for (const mode of ['heavens', 'abyss'] as const) expect(infusionEncounter(mode, infusionModeStageCount).stats.health).toBe(enemyGrowth.bossHealth);
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
        createInfusionBattle('heavens', infusionModeStageCount, seed, starter.id, progress), createInfusionBattle('abyss', infusionModeStageCount, seed, starter.id, progress)]) {
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
