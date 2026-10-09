import { describe, expect, it } from 'vitest';
import { stagedEnemyAttack } from '../content/stat-growth';
import { infusionStageCount } from '../content/activities';
import { infusionEncounter } from '../content/infusions';
import { storyEncounter } from '../content/story';
import { dungeonEncounter, playableDungeons } from '../content/dungeons';
import { createBattle, createInfusionBattle, createStoryBattle, damageAmount, endTurn } from './battle';

describe('attack-relative Defense balance', () => {
  it('halves equal Attack/Defense without cancelling hits, with diminishing returns', () => {
    expect(damageAmount(40, 1, 0, false)).toBe(40);
    expect(damageAmount(40, 1, 40, false)).toBe(20);
    expect(damageAmount(40, 1, 80, false)).toBe(13);
    expect(damageAmount(40, 1, 120, false)).toBe(10);
    expect(damageAmount(8, 1, 10, false)).toBe(4);
    expect(damageAmount(40, 2, 40, false)).toBe(40);
    expect(damageAmount(40, 1, 40, true)).toBe(30);
    expect(damageAmount(0, 1, 40, false)).toBe(1);
    expect(damageAmount(40, 0, 40, false)).toBe(1);
    expect(damageAmount(40, 1, Number.MAX_VALUE, false)).toBe(1);
  });

  it('keeps full-precision Defense, scale-consistent mitigation and monotonic damage', () => {
    expect(damageAmount(40, 1, 10.5, false)).toBe(32);
    expect(damageAmount(4000, 1, 4000, false)).toBe(2000);
    let previous = Infinity;
    for (let defense = 0; defense <= 400; defense++) {
      const hit = damageAmount(40, 1, defense, false);
      expect(hit).toBeLessThanOrEqual(previous);
      expect(Number.isInteger(hit)).toBe(true);
      previous = hit;
    }
    let last = 0;
    for (let attack = 1; attack <= 400; attack++) {
      const hit = damageAmount(attack, 1, 40, false);
      expect(hit).toBeGreaterThanOrEqual(last);
      last = hit;
    }
    for (const defense of [-1, NaN, Infinity]) expect(() => damageAmount(40, 1, defense, false)).toThrow('Invalid damage');
  });

  it('makes Lv13 Story and Machines direct hits cost at least 9% of every unequipped Lv0 starter HP', () => {
    expect(storyEncounter(35).level).toBe(13);
    expect(infusionEncounter('machines', 4).level).toBe(13);
    expect(storyEncounter(35).stats.damage).toBe(40);
    expect(infusionEncounter('machines', 4).stats.damage).toBe(44);
    for (const id of ['ember', 'tide', 'sprout'] as const) {
      for (const state of [
        createStoryBattle(35, 1729, id, { level: 0, evolution: 1 }),
        createInfusionBattle('machines', 4, 1729, id, { level: 0, evolution: 1 }),
      ]) {
        state.enemies.forEach((enemy) => { enemy.stats.crit = 0; });
        const original = structuredClone(state);
        const result = endTurn(state);
        const hits = result.events.filter((event) => event.kind === 'damage' && event.target === id);
        expect(hits.length).toBeGreaterThan(0);
        for (const hit of hits) {
          expect(hit.amount).toBeGreaterThanOrEqual(state.allies[0].stats.health * .09);
          expect(hit.amount).toBeLessThan(state.allies[0].stats.health * .4);
        }
        expect(state).toEqual(original);
      }
    }
  });

  it('keeps progression and Defense useful without requiring Conduits, including Training', () => {
    const beginner = createStoryBattle(35, 1729, 'ember', { level: 0, evolution: 1 }).allies[0];
    const trained = createStoryBattle(35, 1729, 'ember', { level: 13, evolution: 1 }).allies[0];
    const hit = damageAmount(40, 1, beginner.stats.defense, false);
    expect(damageAmount(40, 1, beginner.stats.defense * 2, false)).toBeLessThan(hit);
    expect(damageAmount(40, 1, trained.stats.defense, false) / trained.stats.health)
      .toBeLessThan(hit / beginner.stats.health);
    const training = createBattle(1729);
    training.enemies.forEach((enemy) => { enemy.stats.crit = 0; });
    expect(endTurn(training).events.some((event) => event.kind === 'damage' && event.amount! > 1)).toBe(true);
  });

  it('preserves shared late endpoints and easier Story Attack at overlapping dungeon levels', () => {
    for (const boss of [false, true]) {
      let last = 0;
      for (let level = 10; level <= 120; level++) {
        const attack = stagedEnemyAttack(level, boss);
        expect(attack).toBeGreaterThanOrEqual(last);
        last = attack;
      }
      expect(last).toBe(boss ? 6000 : 4000);
    }
    for (const element of playableDungeons) expect(dungeonEncounter(element, 35).stats.damage).toBe(6000);
    for (const mode of ['heavens', 'abyss', 'treasury', 'sanctuary', 'machines'] as const) {
      expect(infusionEncounter(mode, infusionStageCount(mode)).stats.damage).toBe(6000);
    }
    expect(storyEncounter(1).stats.damage).toBe(16);
    expect(stagedEnemyAttack(121, true, 10, 140)).toBeGreaterThan(6000);
    expect(stagedEnemyAttack(140, true, 10, 140)).toBe(17750);
  });
});
