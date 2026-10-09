import { describe, expect, it } from 'vitest';
import { playableDungeons } from '../content/dungeons';
import { createBattle, createDungeonBattle, createInfusionBattle, endTurn, nextStage, nextWave } from './battle';

describe('Shatter Gauge carry within a run', () => {
  const progress = { level: 105, evolution: 6 };
  const staged = [
    ...playableDungeons.map((element) => createDungeonBattle(element, 1, 1729, 'ember', progress)),
    ...(['heavens', 'abyss'] as const).map((mode) => createInfusionBattle(mode, 1, 1729, 'ember', progress)),
  ];
  it('retains gauge through enemy turns and Adventure waves', () => {
    const state = createBattle(1729, ['ember'], { ember: progress });
    state.allies[0].shatter = 65;
    expect(endTurn(state).state.allies[0].shatter).toBeGreaterThanOrEqual(65);
    state.phase = 'cleared';
    expect(nextWave(state).state.allies[0].shatter).toBe(65);
  });
  it.each(staged)('carries gauge to the next stage while refreshing other encounter state ($dungeon.element $infusion.mode)', (initial) => {
    for (const gauge of [0, 65.5, initial.allies[0].stats.shatterCapacity]) {
      const state = structuredClone(initial);
      state.phase = 'cleared';
      state.allies[0].shatter = gauge;
      state.allies[0].hp = 1;
      state.allies[0].spent = true;
      state.allies[0].readyRound.skill1 = 99;
      const before = structuredClone(state);
      const next = nextStage(state, progress).state;
      expect(next.wave).toBe(2);
      expect(next.allies[0].shatter).toBe(gauge);
      expect(next.allies[0].hp).toBe(next.allies[0].stats.health);
      expect(next.allies[0].spent).toBe(false);
      expect(next.allies[0].readyRound.skill1).toBeLessThan(99);
      expect(state).toEqual(before);
      next.phase = 'cleared';
      expect(nextStage(next, progress).state.allies[0].shatter).toBe(gauge);
    }
    const destination = initial.infusion ?? initial.dungeon;
    if (!destination) throw new Error('Expected a staged test encounter.');
    const fresh = 'mode' in destination
      ? createInfusionBattle(destination.mode, 1, 1729, 'ember', progress)
      : createDungeonBattle(destination.element, 1, 1729, 'ember', progress);
    expect(fresh.allies[0].shatter).toBe(0);
  });
  it('rejects unfinished/final stages and Adventure through the stage API', () => {
    expect(() => nextStage(staged[0], progress)).toThrow('Clear this stage');
    expect(() => nextStage(createBattle(), progress)).toThrow('Only staged');
    for (const final of [createDungeonBattle('atmospheric', 35, 1, 'ember', progress),
      createInfusionBattle('abyss', 35, 1, 'ember', progress)]) {
      final.phase = 'cleared';
      expect(() => nextStage(final, progress)).toThrow('Dungeon complete');
    }
  });
});
