import { describe, expect, it } from 'vitest';
import { actionIds, isActionId } from '../content/combat';
import { act, createBattle, endTurn } from './battle';

describe('retired Defend and Heavy actions', () => {
  it('removes Heavy and Defend from all action definitions and rejects them without changing state', () => {
    for (const retired of ['heavy', 'defend']) {
      expect(actionIds).not.toContain(retired);
      expect(isActionId(retired)).toBe(false);
      const state = createBattle();
      const before = structuredClone(state);
      // Exercise the runtime guard against stale external commands.
      expect(() => Reflect.apply(act, null, [state, 'ember', retired, state.enemies[0].id])).toThrow('Unknown combat action');
      expect(state).toEqual(before);
    }
  });

  it('applies Defense-stat mitigation before shields and keeps the one-damage floor', () => {
    const state = createBattle();
    state.enemies.forEach((enemy) => { enemy.stats.damage = 110; enemy.stats.crit = 0; });
    state.allies[0].hp = 1000;
    state.allies[0].stats.health = 1000;
    state.allies[0].shield = 20;
    expect(endTurn(state).events.filter((e) => e.kind === 'damage').map((e) => e.amount)).toEqual([81, 101, 101]);
    const weak = createBattle();
    weak.enemies.forEach((enemy) => { enemy.stats.damage = 0; enemy.stats.crit = 0; });
    expect(endTurn(weak).events.filter((e) => e.kind === 'damage').map((e) => e.amount)).toEqual([1, 1, 1]);
  });
});
