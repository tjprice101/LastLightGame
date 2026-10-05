import { describe, expect, it } from 'vitest';
import { createBattle, createDungeonBattle, createInfusionBattle } from '../game/battle';
import { playableDungeons } from '../content/dungeons';
import { battleArtScale } from './battle-scale';

describe('battlefield visual rank', () => {
  it('increases character art through all six forms without altering stats', () => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      const state = createBattle(1729, ['ember'], { ember: { level: 0, evolution } });
      const before = structuredClone(state);
      expect(battleArtScale(state, state.allies[0])).toBeCloseTo(1 + (evolution - 1) * .34);
      expect(state).toEqual(before);
    }
  });
  it.each(['heavens', 'abyss'] as const)('%s makes each later form larger and grants bosses extra presence', (mode) => {
    let previous = 0;
    for (const stage of [1, 7, 13, 19, 26, 31]) {
      const state = createInfusionBattle(mode, stage, 1729, 'ember', { level: 0, evolution: 1 });
      const scale = battleArtScale(state, state.enemies[0]);
      expect(scale).toBeGreaterThan(previous);
      previous = scale;
    }
    const boss = createInfusionBattle(mode, 35, 1729, 'ember', { level: 0, evolution: 1 });
    expect(battleArtScale(boss, boss.enemies[0])).toBeCloseTo(3.1);
  });
  it.each(playableDungeons)('%s scales authored enemy rank independently of stats and caps final bosses', (element) => {
    const base = createDungeonBattle(element, 1, 1729, 'ember', { level: 0, evolution: 1 });
    const last = createDungeonBattle(element, 35, 1729, 'ember', { level: 0, evolution: 1 });
    expect(battleArtScale(base, base.enemies[0])).toBe(1);
    expect(battleArtScale(last, last.enemies[0])).toBeCloseTo(3.1);
  });
  it('keeps basic Adventure creatures small and the golem heavier', () => {
    const state = createBattle();
    expect(state.enemies.map((unit) => battleArtScale(state, unit))).toEqual([1, 1, 1.2]);
  });
});
