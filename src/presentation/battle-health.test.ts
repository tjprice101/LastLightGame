import { describe, expect, it } from 'vitest';
import { act, actAndAdvanceTurn, createBattle } from '../game/battle';
import { healthAfterEvent, healthSnapshot, impactEvents, attackEffectTargets } from './battle-health';
import { starters } from '../content/starters';

describe('impact-synchronized health presentation', () => {
  it('keeps pre-hit health and applies each event in order to match resolved HP', () => {
    const state = createBattle(1729, ['ember']);
    const snapshot = healthSnapshot([...state.allies, ...state.enemies]);
    const result = actAndAdvanceTurn(state, 'ember', 'light', state.enemies[0].id);
    expect(snapshot.get(state.enemies[0].id)).toBe(state.enemies[0].stats.health);
    for (const event of result.events) {
      const unit = [...state.allies, ...state.enemies].find((unit) => unit.id === event.target);
      if (unit) snapshot.set(unit.id, healthAfterEvent(snapshot.get(unit.id)!, unit.stats.health, event));
    }
    for (const unit of [...result.state.allies, ...result.state.enemies]) expect(snapshot.get(unit.id)).toBeCloseTo(unit.hp);
  });

  describe('ability visual recipients', () => {
    function recipients(state: ReturnType<typeof createBattle>, action: 'light' | 'skill1' | 'skill2' | 'ultimate') {
      const actor = state.allies[0];
      const ability = action === 'light' ? undefined : actor.kit?.abilities[action];
      const target = ability?.targets === 'one-ally'
        ? state.allies.find(unit => unit.hp > 0 && (!ability.excludeSelf || unit.id !== actor.id)) ?? actor : state.enemies[0];
      const result = act(state, actor.id, action, target.id);
      const index = result.events.findIndex(event => event.kind === 'attack');
      const impacts = impactEvents(result.events, index).map(index => result.events[index]);
      return { result, targets: attackEffectTargets(result.events[index], impacts,
        [...result.state.allies, ...result.state.enemies], healthSnapshot([...state.allies, ...state.enemies])) };
    }

    it.each(starters.map(unit => unit.id))('covers every direct recipient for %s without duplicate effects', id => {
      for (const action of ['light', 'skill1', 'skill2', 'ultimate'] as const) {
        const ids = [id, ...(['ember', 'tide', 'sprout'] as const).filter(other => other !== id).slice(0, 2)];
        const state = createBattle(1729, ids);
        state.allies[0].shatter = 100;
        state.allies.forEach(unit => { unit.hp *= .5; });
        state.enemies.forEach(unit => { unit.hp = unit.stats.health = 100000; });
        const { result, targets } = recipients(state, action);
        const attackIndex = result.events.findIndex(event => event.kind === 'attack');
        const expected = impactEvents(result.events, attackIndex).map(index => result.events[index].target);
        expect(targets).toEqual(expect.arrayContaining(expected));
        expect(new Set(targets).size).toBe(targets.length);
      }
    });

    it('shows team healing on full-health allies too, but never on fallen allies or enemies', () => {
      const state = createBattle(1729, ['sprout', 'ember', 'tide']);
      state.allies[0].shatter = 100;
      state.allies[2].hp = 0;
      expect(recipients(state, 'skill2').targets.sort()).toEqual(['ember', 'sprout']);
    });

    it('shows Tizu Last Flare shielding only on living allies, not enemies', () => {
      const state = createBattle(1729, ['tide', 'ember', 'sprout']);
      state.allies[0].shatter = 100;
      expect(recipients(state, 'ultimate').targets).toEqual([
        ...state.allies.map(unit => unit.id),
      ]);
    });

    it('keeps lethal targets visible and does not include unhit enemies in a single-target attack', () => {
      const state = createBattle(1729, ['ember']);
      state.allies[0].shatter = 100;
      state.enemies[0].hp = 1;
      expect(recipients(state, 'skill1').targets).toEqual([state.enemies[0].id]);
    });
  });
  it('groups all ultimate targets at one impact, separate from enemy retaliation', () => {
    const state = createBattle(1729, ['ember']);
    state.allies[0].shatter = 100;
    state.enemies.forEach((enemy) => { enemy.hp = 2000; enemy.stats.health = 2000; });
    const result = actAndAdvanceTurn(state, 'ember', 'ultimate', state.enemies[0].id);
    const impacts = impactEvents(result.events, 0).map((index) => result.events[index]);
    expect(impacts.filter((event) => event.kind === 'damage')).toHaveLength(3);
    expect(impacts.every((event) => event.source === 'ember')).toBe(true);
  });
  it('does not reduce HP for absorbed damage or shields, and clamps heal/lethal HP', () => {
    const state = createBattle(1729, ['ember']);
    state.allies[0].shield = 1000;
    const result = actAndAdvanceTurn(state, 'ember', 'defend', '');
    for (const event of result.events.filter((event) => event.kind === 'damage')) {
      expect(healthAfterEvent(220, 220, event)).toBe(220);
    }
    const event = result.events.find((event) => event.kind === 'damage')!;
    expect(healthAfterEvent(5, 220, { ...event, amount: 10 })).toBe(0);
    expect(healthAfterEvent(219.5, 220, { ...event, kind: 'heal', amount: 30 })).toBe(220);
  });
});
