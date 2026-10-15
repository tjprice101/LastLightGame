import { describe, expect, it } from 'vitest';
import { createBattle, createCalamityBattle, createDungeonBattle, createInfusionBattle, createStoryBattle, createWarBattle } from '../game/battle';
import { calamityActivities } from '../content/calamity';
import { playableDungeons } from '../content/dungeons';
import { battleArtScale, enemyArtworkScales } from './battle-scale';
import { creatures } from '../content/creatures';
import { starters } from '../content/starters';

describe('battlefield visual rank', () => {
  it('uses the same compact body baseline and bounded ensemble growth for every character', () => {
    for (const starter of starters) {
      for (let evolution = 1; evolution <= 6; evolution++) {
        const state = createBattle(1729, [starter.id], { [starter.id]: { level: 0, evolution } });
        const before = structuredClone(state);
        expect(battleArtScale(state, state.allies[0])).toBe([1, 1.08, 1.16, 1.3, 1.5, 1.65][evolution - 1]);
        expect(state).toEqual(before);
      }
    }
  });
  it('has reviewed size metadata for every installed enemy design, without stale entries', () => {
    const arts = new Set(creatures.flatMap(creature => creature.art ? [creature.art] : []));
    expect(new Set(enemyArtworkScales.keys())).toEqual(arts);
    for (const scale of enemyArtworkScales.values()) {
      expect(scale).toBeGreaterThanOrEqual(.65);
      expect(scale).toBeLessThanOrEqual(1.75);
    }
  });
  it.each(calamityActivities)('keeps the delivered $id Calamity boss imposing across tiers and old snapshots', activity => {
    for (const tier of [1, 2, 3] as const) {
      const state = createCalamityBattle(activity.id, tier, 1729, 'ember', { level: 0, evolution: 1 });
      const unit = state.enemies[0];
      expect(battleArtScale(state, unit)).toBe(1.75);
      delete unit.art;
      expect(battleArtScale(state, unit)).toBe(1.75);
    }
  });
  it.each(['heavens', 'abyss'] as const)('%s follows artwork rather than inflating the same design on boss stages', (mode) => {
    let previous = 0;
    for (const stage of [1, 7, 13, 19, 26, 31]) {
      const state = createInfusionBattle(mode, stage, 1729, 'ember', { level: 0, evolution: 1 });
      const scale = battleArtScale(state, state.enemies[0]);
      expect(scale).toBeGreaterThanOrEqual(previous);
      expect(scale).toBe(enemyArtworkScales.get(state.enemies[0].art!));
      previous = scale;
    }
    const boss = createInfusionBattle(mode, 35, 1729, 'ember', { level: 0, evolution: 1 });
    expect(battleArtScale(boss, boss.enemies[0])).toBe(1.75);
    const ordinary = createInfusionBattle(mode, 34, 1729, 'ember', { level: 0, evolution: 1 });
    expect(ordinary.enemies[0].art).toBe(boss.enemies[0].art);
    expect(battleArtScale(ordinary, ordinary.enemies[0])).toBe(battleArtScale(boss, boss.enemies[0]));
  });
  it.each(playableDungeons)('%s scales authored enemy rank independently of stats and caps final bosses', (element) => {
    const base = createDungeonBattle(element, 1, 1729, 'ember', { level: 0, evolution: 1 });
    const last = createDungeonBattle(element, 35, 1729, 'ember', { level: 0, evolution: 1 });
    expect(battleArtScale(base, base.enemies[0])).toBe(.65);
    expect(battleArtScale(last, last.enemies[0])).toBe(1.75);
  });
  it('keeps basic Adventure Elemental-Devourers small and the golem heavier', () => {
    const state = createBattle();
    expect(state.enemies.map((unit) => battleArtScale(state, unit))).toEqual([.85, .65, 1.25]);
  });
  it('makes the Story stag substantial, insects small and the colossus imposing', () => {
    const state = createStoryBattle(80, 1729, 'ember', { level: 45, evolution: 3 });
    const unit = state.enemies[0];
    const scale = (art: string) => battleArtScale(state, { ...unit, art });
    expect(scale('story-botanic-1')).toBeGreaterThan(battleArtScale(state, state.allies[0]));
    expect(scale('story-botanic-0')).toBeLessThan(scale('story-botanic-1'));
    expect(scale('story-botanic-boss')).toBeGreaterThan(scale('story-botanic-1'));
  });
  it('keeps captured artwork the same size across side, level and encounter changes', () => {
    const state = createInfusionBattle('heavens', 1, 1729, 'ember', { level: 0, evolution: 1 });
    const enemy = state.enemies[0];
    const captured = { ...enemy, side: 'ally' as const, level: 120, evolution: 6,
      captured: { instanceId: 'capture:test', creatureId: 'infusion:heavens:0', locked: false } };
    const other = createDungeonBattle('infernic', 35, 1729, 'ember', { level: 0, evolution: 1 });
    expect(battleArtScale(other, captured)).toBe(battleArtScale(state, enemy));
  });
  it('uses the actual dungeon family artwork instead of the first family encounter tier', () => {
    const state = createDungeonBattle('oceanic', 20, 1729, 'ember', { level: 0, evolution: 1 });
    for (const art of ['coralcrest-nereid', 'glasswake-kelpie', 'furnace-salamander']) {
      expect(battleArtScale(state, { ...state.enemies[0], art })).toBe(enemyArtworkScales.get(art));
    }
  });
  it('keeps War opponents on the same character-form scale as allies', () => {
    for (const character of ['nerithe', 'orvella', 'vaelor'] as const) {
      for (let stage = 1; stage <= 10; stage++) {
        const state = createWarBattle(character, stage, 1729, 'ember', { level: 0, evolution: 1 });
        const enemy = state.enemies[0];
        expect(battleArtScale(state, enemy)).toBe(battleArtScale(state, { ...enemy, side: 'ally' }));
      }
    }
  });
  it('keeps named pending art neutral and reports unreviewed image metadata', () => {
    const state = createStoryBattle(1, 1729, 'ember', { level: 0, evolution: 1 });
    expect(battleArtScale(state, { ...state.enemies[0], art: undefined })).toBe(1);
    expect(() => battleArtScale(state, { ...state.enemies[0], art: 'unreviewed' })).toThrow('size is missing');
  });
});
