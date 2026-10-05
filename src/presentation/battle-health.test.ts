import { describe, expect, it } from 'vitest';
import { actAndAdvanceTurn, createBattle } from '../game/battle';
import { healthAfterEvent, healthSnapshot, impactEvents } from './battle-health';

describe('impact-synchronized health presentation', () => {
  it('keeps pre-hit health and applies each event in order to match resolved HP', () => {
    const state = createBattle(1729, ['ember']);
    const snapshot = healthSnapshot([...state.allies, ...state.enemies]);
    const result = actAndAdvanceTurn(state, 'ember', 'light', state.enemies[0].id);
    expect(snapshot.get(state.enemies[0].id)).toBe(110);
    for (const event of result.events) {
      const unit = [...state.allies, ...state.enemies].find((unit) => unit.id === event.target);
      if (unit) snapshot.set(unit.id, healthAfterEvent(snapshot.get(unit.id)!, unit.stats.health, event));
    }
    for (const unit of [...result.state.allies, ...result.state.enemies]) expect(snapshot.get(unit.id)).toBeCloseTo(unit.hp);
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
