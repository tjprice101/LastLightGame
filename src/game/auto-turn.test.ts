import { describe, expect, it } from 'vitest';
import { actAndAdvanceTurn, advanceUnavailableTurns, teamCanAct, nextWave, createBattle, createDungeonBattle } from './battle';

function battle(ids: ('ember' | 'tide' | 'sprout')[] = ['ember']) {
  const state = createBattle(1729, ids);
  state.allies.forEach((ally) => { ally.stats.crit = 0; });
  state.enemies.forEach((enemy) => { enemy.hp = 2000; enemy.stats.health = 2000; enemy.stats.damage = 0; enemy.stats.crit = 0; });
  return state;
}

describe('automatic enemy turn after the final available action', () => {
  it('advances once after a solo attack without mutating input', () => {
    const state = battle();
    const result = actAndAdvanceTurn(state, 'ember', 'light', state.enemies[0].id);
    expect(state.round).toBe(1);
    expect(result.state.round).toBe(2);
    expect(result.state.allies[0].spent).toBe(false);
    expect(result.events.filter((event) => event.kind === 'attack' && event.source !== 'ember')).toHaveLength(3);
    expect(result.events.filter((event) => event.kind === 'turn')).toHaveLength(1);
  });
  it('waits for all available characters, including support and Defense actions', () => {
    const state = battle(['ember', 'tide', 'sprout']);
    state.allies[1].shatter = 40;
    const first = actAndAdvanceTurn(state, 'ember', 'light', state.enemies[0].id);
    expect(first.state.round).toBe(1);
    const second = actAndAdvanceTurn(first.state, 'tide', 'skill2', '');
    expect(second.state.round).toBe(1);
    const final = actAndAdvanceTurn(second.state, 'sprout', 'defend', '');
    expect(final.state.round).toBe(2);
    expect(final.state.allies[2].defending).toBe(false);
    expect(final.events.filter((event) => event.kind === 'damage')).toHaveLength(3);
  });
  it('does not wait on defeated or recovering allies', () => {
    const state = battle(['ember', 'tide', 'sprout']);
    state.allies[1].hp = 0;
    state.allies[2].recoverThrough = 1;
    expect(actAndAdvanceTurn(state, 'ember', 'defend', '').state.round).toBe(2);
  });
  it('resolves the forced recovery enemy phase before returning control', () => {
    const state = battle();
    state.allies[0].shatter = 100;
    const result = actAndAdvanceTurn(state, 'ember', 'ultimate', state.enemies[0].id);
    expect(result.state.round).toBe(3);
    expect(result.state.allies[0].recoverThrough).toBe(2);
    expect(result.events.filter((event) => event.kind === 'attack' && event.source !== 'ember')).toHaveLength(6);
    expect(teamCanAct(result.state)).toBe(true);
  });
  it('waits for a ready teammate even when the other teammate uses Last Flare', () => {
    const state = battle(['ember', 'tide']);
    state.allies[0].shatter = 100;
    const first = actAndAdvanceTurn(state, 'ember', 'ultimate', state.enemies[0].id);
    expect(first.state.round).toBe(1);
    const second = actAndAdvanceTurn(first.state, 'tide', 'defend', '');
    expect(second.state.round).toBe(2);
    expect(teamCanAct(second.state)).toBe(true);
  });
  it('resolves already exhausted or recovering turns without mutating the input', () => {
    const state = battle();
    state.allies[0].spent = true;
    state.allies[0].recoverThrough = 2;
    const result = advanceUnavailableTurns(state);
    expect(state.round).toBe(1);
    expect(result.state.round).toBe(3);
    expect(teamCanAct(result.state)).toBe(true);
    expect(advanceUnavailableTurns(result.state)).toEqual({ state: result.state, events: [] });
  });
  it('resolves carried recovery on Continue, but never advances cleared or defeated encounters', () => {
    const state = battle();
    state.phase = 'cleared';
    state.allies[0].recoverThrough = 2;
    const next = nextWave(state);
    expect(next.state.round).toBe(3);
    expect(teamCanAct(next.state)).toBe(true);
    expect(advanceUnavailableTurns(state).events).toEqual([]);
    state.phase = 'defeat';
    expect(advanceUnavailableTurns(state).events).toEqual([]);
  });
  it('does not retaliate or advance automatically on a clear', () => {
    const state = battle();
    state.enemies.forEach((enemy) => { enemy.hp = 0; });
    state.enemies[0].hp = 1;
    const result = actAndAdvanceTurn(state, 'ember', 'light', state.enemies[0].id);
    expect(result.state.phase).toBe('cleared');
    expect(result.state.round).toBe(1);
    expect(result.events.filter((event) => event.kind === 'reward')).toHaveLength(1);
    expect(result.events.some((event) => event.kind === 'attack' && event.source !== 'ember')).toBe(false);
  });
  it('keeps automatic enemy-phase defeat terminal', () => {
    const state = battle();
    state.allies[0].hp = 1;
    const result = actAndAdvanceTurn(state, 'ember', 'light', state.enemies[0].id);
    expect(result.state.phase).toBe('defeat');
    expect(result.state.round).toBe(1);
  });
  it('includes burn-clear rewards and retains dungeon stage until manual advance', () => {
    const state = createDungeonBattle('botanic', 5, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies[0].hp = 1;
    state.enemies[0].burn = { damage: 8, turns: 2 };
    const result = actAndAdvanceTurn(state, 'ember', 'defend', '');
    expect(result.state.phase).toBe('cleared');
    expect(result.state.dungeon?.stage).toBe(5);
    expect(result.events.find((event) => event.kind === 'reward')?.materials).toEqual({ 'botanic-common': 1, 'botanic-uncommon': 1, 'botanic-rare': 2 });
  });
});
