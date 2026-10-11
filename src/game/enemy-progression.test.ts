import { describe, expect, it } from 'vitest';
import { enemyCombatStats } from '../content/stat-growth';
import { resolveFighter } from '../content/combat';
import { act, createBattle, createDungeonBattle, createInfusionBattle, createStoryBattle, damageAmount, endTurn, actionUnavailable } from './battle';
import { elementalEnemyLevel } from '../content/activities';
import { resolveCapturedFighter, createCreatureCopy, capturedProgress } from './character-instances';
import { capturedEnemyStats, infusionEncounter } from '../content/infusions';
import type { ConduitLoadouts } from '../content/conduits';

describe('hostile progression balance', () => {
  it.each(['ember', 'tide', 'sprout'] as const)('%s cannot one-shot enemies five to ten levels above it', (id) => {
    for (const [level, evolution] of [[0, 1], [10, 1], [30, 1], [45, 2], [60, 3], [75, 4], [90, 5], [105, 6]]) {
      const fighter = resolveFighter(id, { level, evolution });
      for (const gap of [0, 5, 8, 10]) {
        const enemy = enemyCombatStats(Math.max(1, level + gap), false);
        const state = createBattle(1729, [id], { [id]: { level, evolution } });
        state.enemies = [state.enemies[0]];
        Object.assign(state.enemies[0].stats, enemy);
        state.enemies[0].hp = enemy.health;
        state.allies[0].stats.crit = 0;
        const hit = act(state, id, 'light', state.enemies[0].id).events.find(event => event.kind === 'damage')!.amount!;
        const hits = Math.ceil(enemy.health / hit);
        const minimum = gap === 0 ? 2 : gap === 5 ? 3 : 5;
        const maximum = (gap === 0 ? 4 : gap === 5 ? 5 : 8) * (id === 'ember' ? 1 : 1.5);
        expect(hits, `${id} Lv.${level} +${gap}`).toBeGreaterThanOrEqual(minimum);
        expect(hits, `${id} Lv.${level} +${gap}`).toBeLessThanOrEqual(maximum);
        expect(damageAmount(fighter.stats.damage, 1, enemy.defense, true)).toBeLessThan(enemy.health);
      }
    }
  });

  it.each(['ember', 'tide', 'sprout'] as const)('%s can clear the first Story encounter at Lv.0 without equipment', (id) => {
    for (const seed of [1, 1729, 12345]) {
      let state = createStoryBattle(1, seed, id, { level: 0, evolution: 1 });
      for (let turn = 0; state.phase === 'player' && turn < 30; turn++) {
        const actor = state.allies[0];
        const action = (['skill1', 'light'] as const).find(action => !actionUnavailable(state, actor, action));
        if (action) state = act(state, id, action, state.enemies.find(enemy => enemy.hp > 0)!.id).state;
        if (state.phase === 'player') state = endTurn(state).state;
      }
      expect(state.phase).toBe('cleared');
    }
  });

  it('grows every hostile stat monotonically and rejects invalid levels', () => {
    for (const boss of [false, true]) for (let level = 2; level <= 140; level++) {
      const before = enemyCombatStats(level - 1, boss);
      const after = enemyCombatStats(level, boss);
      for (const stat of ['health', 'damage', 'defense'] as const) expect(after[stat]).toBeGreaterThanOrEqual(before[stat]);
    }
    for (const level of [0, 141, 1.5, NaN, Infinity]) expect(() => enemyCombatStats(level, false)).toThrow();
  });

  it.each(['ember', 'tide', 'sprout'] as const)('%s has a viable early material and evolution path with Store gear', (id) => {
    const gear: ConduitLoadouts = { [id]: ['vigil-core', 'siegebound-drive', 'bastion-lock', 'parallax-relay',
      'fieldbrace-coupler', 'reserve-torque-crank', 'crosspin-governor', 'precision-escapement'] };
    const rareStage = Array.from({ length: 35 }, (_, index) => index + 1).find(stage => elementalEnemyLevel(stage) >= 48)!;
    for (const seed of [1, 1729, 12345]) {
      const first = { level: 30, evolution: 2 };
      const rare = { level: 45, evolution: 2 };
      const infusion = { level: 60, evolution: 3 };
      for (const initial of [
        createDungeonBattle('infernic', 1, seed, id, first, [id], { [id]: first }, gear),
        createDungeonBattle('infernic', rareStage, seed, id, rare, [id], { [id]: rare }, gear),
        createInfusionBattle('abyss', 13, seed, id, infusion, [id], { [id]: infusion }, gear),
      ]) {
        let state = initial;
        for (let turn = 0; state.phase === 'player' && turn < 80; turn++) {
          const actor = state.allies[0];
          const priorities = id === 'sprout' && actor.hp < actor.stats.health * .7
            ? ['skill2', 'skill1', 'light'] as const : ['skill1', 'skill2', 'light'] as const;
          const action = priorities.find(action => !actionUnavailable(state, actor, action));
          if (action) state = act(state, id, action, state.enemies.find(enemy => enemy.hp > 0)!.id).state;
          if (state.phase === 'player') state = endTurn(state).state;
        }
        expect(state.phase, `${id}, seed ${seed}, ${initial.infusion?.mode ?? 'dungeon'} stage ${initial.wave}`).toBe('cleared');
      }
    }
  });

  it('keeps legacy and new captures on their original playable curve, not hostile bonuses', () => {
    for (const mode of ['heavens', 'abyss'] as const) {
      const legacy = { instanceId: 'capture:00000000-0000-4000-8000-000000000001', creatureId: `infusion:${mode}:0`, locked: false };
      expect(capturedProgress(legacy).level).toBe(80);
      expect(resolveCapturedFighter(legacy).stats.health).toBe(capturedEnemyStats(80).health * .65);
      const current = createCreatureCopy(`infusion:${mode}:0`, 1);
      expect(current.level).toBe(50);
      expect(resolveCapturedFighter(current).stats.health).toBe(capturedEnemyStats(50).health * .65);
      expect(resolveCapturedFighter(current).stats.damage).toBeLessThan(infusionEncounter(mode, 1).stats.damage);
    }
  });
});
