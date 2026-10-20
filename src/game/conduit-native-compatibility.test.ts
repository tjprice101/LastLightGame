import { describe, expect, it } from 'vitest';
import { act, createBattle, type BattleEvent } from './battle';
import { nativeTurnStart } from './native-kits';
import { nativeBalance } from '../content/native-balance';
import type { CapturedCharacter } from './character-instances';
import { conduitIncoming, nativeHeal, nativeShield } from './conduit-runtime';

function encounter(roster: string[], captures: CapturedCharacter[] = []) {
  const state = createBattle(31, roster, {}, {}, captures);
  for (const ally of state.allies) {
    ally.stats.health = ally.hp = 1_000;
    ally.stats.defense = 0;
    ally.stats.damage = 100;
  }
  for (const enemy of state.enemies) {
    enemy.stats.health = enemy.hp = 10_000;
    enemy.stats.defense = 0;
    enemy.stats.damage = 100;
  }
  return state;
}

describe('native and equipment compatibility', () => {
  it('applies a native shield first-hit reduction across every impact in one enemy activation', () => {
    const state = encounter(['tide', 'ember']);
    const [owner, target] = state.allies;
    const enemy = state.enemies[0];
    const events: BattleEvent[] = [];
    nativeShield(state, owner, target, 1_000, events, {
      throughPhase: state.round + 1,
      firstReduction: .3,
    });

    conduitIncoming(state, enemy, target, 100, false, false, events);
    expect(target.shield).toBe(930);
    conduitIncoming(state, enemy, target, 100, false, false, events);
    expect(target.shield).toBe(860);

    delete enemy.native;
    conduitIncoming(state, enemy, target, 100, false, false, events);
    expect(target.shield).toBe(760);
  });

  it('applies the version-three mitigation floor to captured recipients too', () => {
    const copy: CapturedCharacter = {
      instanceId: 'capture:00000000-0000-4000-8000-000000000001',
      creatureId: 'infusion:roses:0',
      locked: false,
    };
    const state = encounter([copy.instanceId], [copy]);
    state.conduitUpgrades = {
      'sentinel-aperture': 5,
      'pale-bulwark-diadem': 5,
    };
    const target = state.allies[0];
    expect(target.captured?.instanceId).toBe(copy.instanceId);
    target.shield = 100;
    target.conduits = ['sentinel-aperture', 'pale-bulwark-diadem'];
    const events: BattleEvent[] = [];

    conduitIncoming(state, state.enemies[0], target, 1_000, true, false, events);

    expect(target.hp).toBe(750);
    expect(target.shield).toBe(0);
    expect(events.find(event => event.kind === 'damage')?.amount).toBe(250);
  });

  it('converts healing above maximum HP into a non-stacking Shield', () => {
    const state = encounter(['sprout', 'ember']);
    const [owner, target] = state.allies;
    target.hp = target.stats.health - 50;
    target.shield = 0;
    const events: BattleEvent[] = [];

    expect(nativeHeal(state, owner, target, 200, events, false)).toBe(50);
    expect(target.hp).toBe(target.stats.health);
    expect(target.shield).toBe(150);
    expect(events.some(event => event.kind === 'shield' && event.amount === 150)).toBe(true);
    nativeHeal(state, owner, target, 100, events, false);
    expect(target.shield).toBe(150);
    nativeHeal(state, owner, target, 400, events, false);
    expect(target.shield).toBe(400);
  });

  it('does not heal or shield a dead native recipient', () => {
    const state = encounter(['sprout', 'ember']);
    const [owner, target] = state.allies;
    target.hp = 0;
    const events: BattleEvent[] = [];

    expect(nativeHeal(state, owner, target, 200, events, true)).toBe(0);
    nativeShield(state, owner, target, 200, events);

    expect(target.hp).toBe(0);
    expect(target.shield).toBe(0);
    expect(events).toHaveLength(0);
  });

  it('requires Tizu alone to absorb the complete hit before awarding Stillwater Gauge', () => {
    for (const ownShield of [60, 100]) {
      const state = encounter(['tide', 'ember']);
      const [owner, target] = state.allies;
      target.shatter = 0;
      nativeShield(state, owner, target, ownShield, []);
      target.conduitRuntime!.layers!.push({ amount: 100, owner: target.id, native: false });
      target.shield += 100;
      conduitIncoming(state, state.enemies[0], target, 100, false, false, []);
      expect(target.hp).toBe(1000);
      expect(target.shatter).toBe(10 + (ownShield === 100 ? 8 : 0));
    }
  });

  it('refreshes a stronger owned shield clock and first-hit ward without stacking the reduction', () => {
    const state = encounter(['tide', 'ember']);
    const [owner, target] = state.allies;
    const events: BattleEvent[] = [];
    nativeShield(state, owner, target, 500, events, { throughPhase: 1, firstReduction: .3 });
    nativeShield(state, owner, target, 300, events, { throughPhase: 2, firstReduction: .3 });
    expect(target.shield).toBe(500);
    expect(target.conduitRuntime?.layers?.[0].expiresAfterPhase).toBe(2);
    conduitIncoming(state, state.enemies[0], target, 100, false, false, events);
    expect(target.shield).toBe(430);
    delete state.enemies[0].native;
    conduitIncoming(state, state.enemies[0], target, 100, false, false, events);
    expect(target.shield).toBe(330);
  });

  it('snapshots Shelter on planting and applies Springwell once when the Seed matures', () => {
    let state = encounter(['sprout', 'disciple']);
    const [flora, disciple] = state.allies;
    flora.conduits = ['springwell-pump'];
    state.conduitUpgrades = { 'springwell-pump': 5 };
    flora.native = { instruction: { kind: 'shelter', owner: disciple.id, throughRound: 2 } };
    flora.shatter = 40;
    state = act(state, flora.id, 'skill2', state.enemies[0].id).state;
    expect(state.allies[0].native?.instruction).toBeUndefined();
    const pending = state.allies[0].native?.seeds?.[disciple.id];
    expect(pending?.fraction).toBeCloseTo(nativeBalance.flora.seed * 1.35);
    state.allies[1].hp = 1;
    state.round++;
    const events: BattleEvent[] = [];
    nativeTurnStart(state, events);
    expect(state.allies[1].hp).toBeCloseTo(1 + 1000 * nativeBalance.flora.seed * 1.35 * 1.4);
    expect(events.filter(event => event.kind === 'heal' && event.target === disciple.id)).toHaveLength(1);
    nativeTurnStart(state, events);
    expect(events.filter(event => event.kind === 'heal' && event.target === disciple.id)).toHaveLength(1);
  });

  it('settles delayed team-heal equipment once without replaying skill or Master activation hooks', () => {
    const state = encounter(['sprout', 'ember', 'tide']);
    const flora = state.allies[0];
    flora.conduits = ['springwell-pump', 'covercharge-drum'];
    state.conduitUpgrades = { 'springwell-pump': 5, 'covercharge-drum': 5 };
    flora.masterConduit = 'master-sprout-1';
    flora.native = { seeds: Object.fromEntries(state.allies.map(ally => [ally.id, { fraction: .5, dueRound: 2 }])) };
    state.allies[1].hp = state.allies[2].hp = 100;
    state.round = 2;
    const events: BattleEvent[] = [];
    nativeTurnStart(state, events);
    expect(state.allies.map(ally => ally.hp)).toEqual([1000, 800, 800]);
    expect(events.filter(event => event.kind === 'heal' && event.origin === 'conduit')).toHaveLength(0);
    expect(events.filter(event => event.kind === 'heal' && event.origin === 'native')).toHaveLength(2);
  });

  it('trades half Foundation durability for distinct finite personal plates', () => {
    const state = encounter(['orvella', 'ember', 'tide']);
    state.allies[0].masterConduit = 'master-orvella-1';
    state.allies[0].shatter = 40;
    const result = act(state, 'orvella', 'skill2', state.enemies[0].id);
    expect(result.state.allies[0].native?.foundation?.durability).toBe(150);
    expect(result.state.allies.map(ally => ally.shield)).toEqual([50, 50, 50]);
    expect(result.state.allies.every(ally => ally.conduitRuntime?.layers?.every(layer => layer.plate && !layer.native))).toBe(true);
  });
});
