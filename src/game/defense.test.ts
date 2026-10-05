import { describe, expect, it } from 'vitest';
import { actionIds, isActionId } from '../content/combat';
import { act, createBattle, endTurn, nextWave } from './battle';

describe('Defense action and Heavy removal', () => {
  it('removes Heavy from all action definitions and rejects it without changing state', () => {
    expect(actionIds).not.toContain('heavy');
    expect(isActionId('heavy')).toBe(false);
    const state = createBattle();
    const before = structuredClone(state);
    // Exercise the runtime guard against stale external commands.
    expect(() => Reflect.apply(act, null, [state, 'ember', 'heavy', state.enemies[0].id])).toThrow('Unknown combat action');
    expect(state).toEqual(before);
  });

  it('consumes one action, needs no enemy target and changes neither gauge nor recovery', () => {
    const state = createBattle();
    const defended = act(state, 'ember', 'defend', '').state;
    expect(state.allies[0].defending).toBe(false);
    expect(defended.allies[0].defending).toBe(true);
    expect(defended.allies[0].spent).toBe(true);
    expect(defended.allies[0].shatter).toBe(0);
    expect(defended.allies[0].recoverThrough).toBe(0);
    expect(() => act(defended, 'ember', 'light', state.enemies[0].id)).toThrow('already acted');
    expect(() => act(defended, 'ember', 'defend', '')).toThrow('already acted');
  });

  it('reduces each hit after defense by 10%, before shields, while retaining incoming gauge gains', () => {
    const state = createBattle();
    state.enemies.forEach((enemy) => { enemy.stats.damage = 110; enemy.stats.crit = 0; });
    state.allies[0].hp = 1000;
    state.allies[0].stats.health = 1000;
    state.allies[0].shield = 20;
    const normal = endTurn(state);
    const defended = endTurn(act(state, 'ember', 'defend', '').state);
    expect(normal.events.filter((e) => e.kind === 'damage').map((e) => e.amount)).toEqual([80, 100, 100]);
    expect(defended.events.filter((e) => e.kind === 'damage').map((e) => e.amount)).toEqual([70, 90, 90]);
    expect(defended.state.allies[0].shatter).toBe(30);
    expect(defended.state.allies[0].defending).toBe(false);
    expect(defended.state.allies[0].spent).toBe(false);
    expect(defended.state.round).toBe(2);
  });

  it('retains a one-damage floor and does not allow defending during ultimate recovery', () => {
    const state = createBattle();
    state.enemies.forEach((enemy) => { enemy.stats.damage = 0; enemy.stats.crit = 0; });
    const result = endTurn(act(state, 'ember', 'defend', '').state);
    expect(result.events.filter((e) => e.kind === 'damage').map((e) => e.amount)).toEqual([1, 1, 1]);
    state.allies[0].recoverThrough = 1;
    expect(() => act(state, 'ember', 'defend', '')).toThrow('Recovering');
  });

  it('clears Defense at the next wave player-turn boundary too', () => {
    const state = act(createBattle(), 'ember', 'defend', '').state;
    state.enemies.forEach((enemy) => { enemy.hp = 0; });
    state.phase = 'cleared';
    expect(nextWave(state).state.allies[0].defending).toBe(false);
  });
});
