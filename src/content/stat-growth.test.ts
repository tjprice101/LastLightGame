import { describe, expect, it } from 'vitest';
import { enemyBenchmarkMultiplier, enemyCombatStats, enemyExponentialRates, enemyGrowth, enemyResistanceRamp, enemyStat, enemyStrengthMultiplier } from './stat-growth';
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
          const benchmark = enemyBenchmarkMultiplier(level, stat);
          expect(stats[stat]).toBe(Math.round(original * 1.05 * resistance * benchmark));
          expect(Math.abs(stats[stat] - original * 1.05 * resistance * benchmark)).toBeLessThanOrEqual(.5);
          expect(Number.isSafeInteger(stats[stat])).toBe(true);
          if (level >= 21 && level <= 80) {
            const before = enemyCombatStats(level - 20, boss)[stat];
            const middle = enemyCombatStats(level - 10, boss)[stat];
            expect(Math.abs((stats[stat] - middle) - (middle - before) * Math.exp(rate * 10))).toBeLessThan(3);
          }
          if (level > 1) {
            const previous = enemyCombatStats(level - 1, boss)[stat];
            expect(stats[stat]).toBeGreaterThanOrEqual(previous);
            if (level > 80) expect(stats[stat] / previous).toBeLessThan(1.09);
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

  it('preserves1-80 and trades later burst/Defense for endurance on the non-Calamitic benchmark', () => {
    for (const boss of [false, true]) {
      for (let level = 1; level <= 185; level++) {
        for (const [stat, base, slope, target] of [
          ['health', boss ? 207.5 : 83, .45, 3],
          ['damage', boss ? 27.5 : 22, .25, 1.5],
          ['defense', boss ? 16 / 3 : 4, .30, 2],
        ] as const) {
          const rate = enemyExponentialRates[stat];
          const p = (level - 80) / 65;
          const effective = level > 80 && level < 145 ? level + 160 * p ** 2 * (1 - p) ** 2 : level;
          const before = base * (1 + slope * Math.expm1(rate * (effective - 1)) / rate) * 1.05;
          const previous = Math.round(before * target ** (Math.max(0, effective - 80) / 60));
          const current = enemyCombatStats(level, boss)[stat];
          if (level <= 80) expect(current).toBe(previous);
          else if (stat === 'health') expect(current).toBeGreaterThanOrEqual(previous);
          else expect(current).toBeLessThanOrEqual(previous);
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
        expect(Math.abs(growth(level + 1) - growth(level))).toBeLessThan(.008);
        expect(enemyCombatStats(level, boss)[stat]).toBeLessThan(enemyCombatStats(145, boss)[stat]);
      }
    }
  });

  it.each([
    [80, 25856, 1731, 329],
    [90, 51886, 2598, 518],
    [100, 111078, 4090, 856],
    [110, 214237, 5988, 1278],
    [120, 348261, 7787, 1685],
    [130, 474609, 9024, 2005],
    [140, 636488, 10323, 2358],
    [145, 768470, 11494, 2704],
    [160, 1504763, 16094, 4281],
    [170, 2351938, 18844, 5743],
    [185, 4589119, 30036, 9297],
  ])('locks exact Lv%s boss stats with one final rounding step', (level, health, damage, defense) => {
    expect(enemyCombatStats(level, true)).toMatchObject({ health, damage, defense });
  });

  it('leaves captured playable stats on their independent player-growth curve', () => {
    expect(capturedEnemyStats(120)).toMatchObject({ health: 4180, damage: 722, defense: 16 * 19 ** .7 });
  });
  it('locks benchmark anchors, smooth interpolation and invalid-input rejection', () => {
    for (const [level, health, damage, defense] of [[80, 1, 1, 1], [100, 1.2, .95, 1],
      [120, 1.4, .9, .95], [140, 1.5, .82, .9], [145, 1.5, .8, .9],
      [160, 1.5, .7, .875], [170, 1.5, .6, .85], [185, 1.5, .6, .85]]) {
      expect(enemyBenchmarkMultiplier(level, 'health')).toBe(health);
      expect(enemyBenchmarkMultiplier(level, 'damage')).toBe(damage);
      expect(enemyBenchmarkMultiplier(level, 'defense')).toBe(defense);
    }
    expect(enemyBenchmarkMultiplier(85, 'health')).toBeCloseTo(1 + .2 * .15625, 12);
    for (const value of [0, 186, NaN, Infinity, 1.5]) expect(() => enemyBenchmarkMultiplier(value, 'health')).toThrow();
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
