import { describe, expect, it } from 'vitest';
import { damageOverTimeLevelMultiplier } from '../content/native-balance';
import { act, createBattle, endTurn, type BattleEvent } from './battle';
import { applyConduitBurn, conduitBurnTick, gear, prepareConduitAction } from './conduit-runtime';
import { nativeBurnPhase, nativePhaseEnd } from './native-kits';
import { freshGame, resolveOperation } from '../../supabase/functions/game-operation/engine';
import type { GameOperation } from '../online/server-game';

function fixture(level = 0) {
  const state = createBattle(1729, ['ember', 'tide'], { ember: { level, evolution: 6 }, tide: { level: 0, evolution: 1 } });
  for (const unit of state.allies) {
    unit.hp = unit.stats.health = 10000;
    unit.stats.damage = 100; unit.stats.crit = 0; unit.shatter = 100;
  }
  for (const enemy of state.enemies) {
    enemy.hp = enemy.stats.health = 100000;
    enemy.stats.damage = 1; enemy.stats.defense = 0; enemy.stats.crit = 0;
  }
  return state;
}

describe('linear allied DoT level scaling', () => {
  it.each([[0, 1], [15, 1.5], [30, 2], [60, 3], [90, 4], [105, 4.5], [120, 5], [140, 1 + 140 / 30]])(
    'uses exact 1+level/30 at level%s', (level, factor) => {
      expect(damageOverTimeLevelMultiplier(level)).toBe(factor);
    });
  it.each([-1, NaN, Infinity, .5])('rejects invalid source level%s explicitly', level => {
    expect(() => damageOverTimeLevelMultiplier(level)).toThrow('source level');
  });
  it('scales every supported source level linearly, preserving base-level damage and rounding only once', () => {
    for (let level = 0; level <= 140; level++) {
      const state = fixture(), owner = state.allies[0], target = state.enemies[0];
      owner.level = level;
      const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
      ctx.skillPower = 1.37;
      ctx.shieldBurn = 3.7;
      expect(applyConduitBurn(state, owner, target, 25.73, ctx)).toBe(Math.round((25.73 * 1.37 + 3.7) * (1 + level / 30)));
      expect(gear(target).numbers[`cinderBase:${owner.id}`]).toBeCloseTo(25.73 * (1 + level / 30), 12);
    }
  });
  it.each([0, 30, 60, 105])('applies Infernis skill and Last Flare Burn once at level%s, not their direct hits or clocks', level => {
    for (const action of ['skill1', 'ultimate'] as const) {
      const state = fixture(level);
      const result = act(state, 'ember', action, state.enemies[0].id);
      const damage = Math.round(100 * (action === 'ultimate' ? 1.35 : .25) * (1 + level / 30));
      const burned = result.state.enemies.filter(enemy => enemy.burn.turns > 0);
      expect(burned).toHaveLength(action === 'ultimate' ? state.enemies.length : 1);
      for (const enemy of burned) {
        expect(enemy.burn.damage).toBe(damage);
        expect(enemy.burn.turns).toBe(3);
        expect(result.state.allies[0].native?.burns?.[enemy.id]).toEqual({ damage, turns: 3 });
      }
      expect(result.events.filter(event => event.kind === 'damage' && !event.nativeKind).map(event => event.amount))
        .toEqual(Array(action === 'ultimate' ? 3 : 1).fill(action === 'ultimate' ? 960 : 256));
      expect(result.state.allies[0].shatter).toBe(100 - (action === 'ultimate' ? 100 : 25));
      expect(state.enemies[0].burn.turns).toBe(0);
    }
  });
  it('keeps a snapshotted tick after source level/Attack/Power changes, through recovery, without rescaling each phase', () => {
    const state = fixture(60);
    const applied = act(state, 'ember', 'ultimate', state.enemies[0].id).state;
    const owner = applied.allies[0], target = applied.enemies[0];
    expect(target.burn.damage).toBe(405);
    owner.level = 105; owner.stats.damage = 7000; owner.stats.skillPower = 5;
    for (let phase = 0; phase < 3; phase++) {
      const events: BattleEvent[] = [];
      nativeBurnPhase(applied, target, events);
      expect(events.filter(event => event.nativeKind === 'burn').map(event => event.amount)).toEqual([405]);
      expect(target.burn.turns).toBe(2 - phase);
    }
    const events: BattleEvent[] = [];
    nativeBurnPhase(applied, target, events);
    expect(events).toEqual([]);
  });
  it('keeps existing old snapshots and strongest-only reapplications, while new applications gain current level scaling', () => {
    const state = fixture(60), owner = state.allies[0], target = state.enemies[0];
    owner.native = { burns: { [target.id]: { damage: 10, turns: 3 } } };
    target.burn = { damage: 10, turns: 3, sourceId: owner.id, origin: 'native' };
    const events: BattleEvent[] = [];
    nativeBurnPhase(state, target, events);
    expect(events.find(event => event.nativeKind === 'burn')?.amount).toBe(10);
    const upgraded = act(state, owner.id, 'skill1', target.id).state;
    expect(upgraded.enemies[0].burn.damage).toBe(75);
    const stronger = fixture(60);
    stronger.allies[0].native = { burns: { [target.id]: { damage: 999, turns: 1 } } };
    stronger.enemies[0].burn = { damage: 999, turns: 1, sourceId: owner.id, origin: 'native' };
    const refreshed = act(stronger, owner.id, 'skill1', target.id).state;
    expect(refreshed.enemies[0].burn).toMatchObject({ damage: 999, turns: 3 });
  });
  it('detonates already-scaled Burn without a second level multiplier', () => {
    const state = fixture(60);
    const applied = act(state, 'ember', 'skill1', state.enemies[0].id).state;
    applied.allies[0].spent = false;
    const result = act(applied, 'ember', 'skill2', applied.enemies[0].id);
    expect(result.events.filter(event => event.nativeKind === 'detonation').map(event => event.amount)).toEqual([150]);
    expect(result.state.enemies[0].burn.turns).toBe(1);
  });
  it('scales Cinder growth from the same level-adjusted base, without double scaling or rewriting old bases', () => {
    const state = fixture(60), owner = state.allies[0], target = state.enemies[0];
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    ctx.skillPower = 1.5;
    const damage = applyConduitBurn(state, owner, target, 25, ctx);
    target.burn = { damage, turns: 3, sourceId: owner.id, origin: 'native' };
    gear(target).numbers[`cinderPower:${owner.id}`] = .6;
    expect(damage).toBe(113);
    expect(conduitBurnTick(state, owner, target)).toBe(158);
    owner.level = 105;
    expect(conduitBurnTick(state, owner, target)).toBe(158);
    target.burn.origin = 'conduit';
    expect(conduitBurnTick(state, owner, target)).toBe(113);
  });
  it('leaves enemy-origin DoT applications unchanged at high levels', () => {
    const state = fixture(105), owner = state.enemies[0], target = state.allies[0];
    owner.level = 120;
    const ctx = prepareConduitAction(state, owner, 'skill1', 0, false);
    ctx.skillPower = 1.5;
    expect(applyConduitBurn(state, owner, target, 25, ctx)).toBe(38);
  });
  it('does not multiply externally stored conduit-origin ticks or existing periodic snapshots', () => {
    const state = fixture(105), target = state.enemies[0];
    target.burn = { damage: 75, turns: 2, sourceId: 'tide', origin: 'conduit' };
    state.allies.forEach(unit => { unit.spent = true; });
    const result = endTurn(state);
    expect(result.events.find(event => event.periodic && event.target === target.id)?.amount).toBe(75);
    expect(result.state.enemies[0].burn.damage).toBe(75);
  });
  it('banks actual Burn damage for Master healing without multiplying the copied amount again', () => {
    const state = fixture(60), owner = state.allies[0], target = state.enemies[0];
    owner.masterConduit = 'master-ember-1';
    state.allies[1].hp = 100;
    const applied = act(state, owner.id, 'skill1', target.id).state;
    const events: BattleEvent[] = [];
    nativeBurnPhase(applied, applied.enemies[0], events);
    expect(events.find(event => event.nativeKind === 'burn')?.amount).toBe(75);
    nativePhaseEnd(applied, events);
    expect(events.find(event => event.kind === 'heal')?.amount).toBe(19);
    const healed = applied.allies[1].hp;
    nativePhaseEnd(applied, []);
    expect(applied.allies[1].hp).toBe(healed);
  });
  it.each(['thornia', 'atmoso', 'elise'] as const)('leaves %s trap/delayed direct damage unchanged with fixed Attack at higher levels', id => {
    const packets = (level: number) => {
      const state = createBattle(1729, [id, 'tide'], { [id]: { level, evolution: 6 } });
      for (const unit of state.allies) {
        unit.hp = unit.stats.health = 10000; unit.stats.damage = 100; unit.stats.crit = 0; unit.shatter = 100;
      }
      for (const enemy of state.enemies) {
        enemy.hp = enemy.stats.health = 100000; enemy.stats.damage = 1; enemy.stats.defense = 0; enemy.stats.crit = 0;
      }
      const result = act(state, id, 'ultimate', state.enemies[0].id);
      const phase = endTurn(result.state);
      return [...result.events, ...phase.events].filter(event => event.source === id && event.kind === 'damage')
        .map(event => ({ amount: event.amount, nativeKind: event.nativeKind }));
    };
    expect(packets(105)).toEqual(packets(0));
  });
  it.each([0, 30, 60, 105])('matches authoritative Burn at level%s, persists snapshots and leaves input unchanged', level => {
    let game = resolveOperation(freshGame('dot'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    game.account.characters.ember = { level, evolution: 6 };
    game.account.characters.tide = { level: 0, evolution: 1 }; game.account.squad = ['ember', 'tide'];
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    game.run!.session.state = fixture(level);
    const state = game.run!.session.state;
    const operation: GameOperation = { kind: 'act', runId: game.run!.session.runId,
      actorId: 'ember', action: 'skill1', targetId: state.enemies[0].id };
    const before = structuredClone(game), expected = act(state, 'ember', 'skill1', state.enemies[0].id);
    const actual = resolveOperation(game, operation, entropy);
    expect(actual.response.result).toEqual(expected);
    expect(actual.response.session!.state.enemies[0].burn.damage).toBe(Math.round(25 * (1 + level / 30)));
    expect(resolveOperation(actual.game, { kind: 'read' }, entropy).response.session!.state).toEqual(expected.state);
    expect(game).toEqual(before);
  });
});

const entropy = { seed: () => 1729, uuid: () => crypto.randomUUID(), random: () => .5 };
