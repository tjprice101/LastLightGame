import { describe, expect, it } from 'vitest';
import { resolveFighter } from '../content/combat';
import { nativeBalance } from '../content/native-balance';
import { act, createBattle, damageAmount, endTurn, nextWave, type BattleState } from './battle';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(7, roster);
  state.enemies = [state.enemies[0]];
  state.allies.forEach(unit => {
    unit.shatter = 100; unit.stats.crit = 0; unit.stats.damage = 100;
    unit.hp = unit.stats.health = 1000;
  });
  Object.assign(state.enemies[0].stats, { health: 100_000, defense: 0, damage: 0, crit: 0 });
  state.enemies[0].hp = 100_000;
  return state;
}

function use(state: BattleState, id: string, action: 'skill1' | 'skill2' | 'ultimate', target = state.enemies[0].id) {
  const actor = state.allies.find(unit => unit.id === id)!;
  actor.spent = false; actor.shatter = 100; actor.recoverThrough = 0;
  if (actor.conduitRuntime) actor.conduitRuntime.numbers.actions = 0;
  return act(state, id, action, target);
}

describe('distinct no-equipment starter identities', () => {
  it('Infernis banks three Attack-based fire phases without a personal charge bank', () => {
    const state = encounter('ember');
    const result = use(state, 'ember', 'skill1');
    expect(result.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 1.6 * nativeBalance.skillDamageScale, 0, false));
    expect(result.state.allies[0].native?.burns?.[state.enemies[0].id]).toEqual({ damage: 25, turns: 3 });
    const phase = endTurn(result.state);
    expect(phase.events.find(event => event.nativeKind === 'burn')?.amount).toBe(25);
    expect(phase.state.allies[0].native?.burns?.[state.enemies[0].id]?.turns).toBe(2);
    expect(phase.state.allies[0].pilot).toBeUndefined();
    expect(state.allies[0].native).toBeUndefined();
  });

  it('detonation spends at most two stored phases and leaves other owners’ Burn untouched', () => {
    let state = use(encounter('ember'), 'ember', 'skill1').state;
    state.enemies.push({ ...structuredClone(state.enemies[0]), id: 'other' });
    delete state.allies[0].native!.burns!.other;
    state.enemies[1].burn = { damage: 7, turns: 3, sourceId: 'another-owner' };
    const result = use(state, 'ember', 'skill2');
    expect(result.events.filter(event => event.nativeKind === 'detonation').map(event => event.amount)).toEqual([50]);
    expect(result.state.allies[0].native?.burns?.[state.enemies[0].id]?.turns).toBe(1);
    expect(result.state.enemies[1].burn).toEqual(state.enemies[1].burn);
  });

  it('Dawnfire invests stronger fire rather than detonating, and weaker refresh cannot downgrade it', () => {
    const state = encounter('ember');
    const flare = use(state, 'ember', 'ultimate');
    expect(flare.events.some(event => event.nativeKind === 'detonation')).toBe(false);
    expect(flare.events.find(event => event.kind === 'damage')?.amount).toBe(200 * nativeBalance.skillDamageScale * 3);
    expect(flare.state.allies[0].recoverThrough).toBe(state.round + 1);
    const refreshed = use(flare.state, 'ember', 'skill1');
    expect(refreshed.state.allies[0].native?.burns?.[state.enemies[0].id]).toEqual({ damage: 135, turns: 3 });
  });

  it('Tizu requires a living ally target and grants only that recipient the tuned short barrier', () => {
    const state = encounter('tide', 'ember');
    expect(() => use(state, 'tide', 'skill2')).toThrow('living ally');
    const result = use(state, 'tide', 'skill2', 'ember');
    expect(result.state.allies.map(unit => unit.shield)).toEqual([0, 1000 * nativeBalance.tizu.shelter]);
    expect(result.state.allies[0].shatter).toBe(60);
    expect(endTurn(result.state).state.allies[1].shield).toBe(0);
    expect(result.state.allies[0].pilot).toBeUndefined();
  });

  it('Tizu weakens exactly one window without Ward spending and can repeat a funded skill next turn', () => {
    const result = use(encounter('tide'), 'tide', 'skill1');
    expect(result.state.enemies[0].weakenFraction).toBe(.25);
    expect(result.state.enemies[0].weakened).toBe(1);
    expect(result.state.allies[0].readyRound.skill1).toBe(result.state.round);
    const phase = endTurn(result.state);
    expect(phase.state.enemies[0].weakened).toBe(0);
    const repeated = use(phase.state, 'tide', 'skill1');
    expect(repeated.events.find(event => event.kind === 'damage')?.amount).toBe(150 * nativeBalance.skillDamageScale);
  });

  it('Ocean Memory is a non-damaging two-phase team barrier with mandatory recovery', () => {
    const state = encounter('tide', 'ember');
    const result = use(state, 'tide', 'ultimate');
    expect(result.events.filter(event => event.kind === 'damage')).toHaveLength(0);
    expect(result.state.allies.map(unit => unit.shield)).toEqual([1000 * nativeBalance.tizu.oceanMemory, 1000 * nativeBalance.tizu.oceanMemory]);
    expect(result.state.allies[0].recoverThrough).toBe(state.round + 1);
    expect(result.state.allies[1].conduitRuntime?.layers).toContainEqual(expect.objectContaining({
      owner: 'tide', native: true, firstReduction: .3 * 1.5, expiresAfterPhase: state.round + 1,
    }));
  });

  it('Flora has no automatic passive healing: empty harvest plants, then delivers at next player turn', () => {
    const state = encounter('sprout', 'ember');
    state.allies.forEach(unit => { unit.hp = 500; });
    expect(endTurn(state).events.some(event => event.kind === 'heal')).toBe(false);
    const planted = use(state, 'sprout', 'skill2');
    expect(planted.events.some(event => event.kind === 'heal')).toBe(false);
    expect(planted.state.allies[0].attackBoost).toBeUndefined();
    const delivered = endTurn(planted.state);
    expect(delivered.events.filter(event => event.kind === 'heal').map(event => event.amount)).toEqual([1000 * nativeBalance.flora.seed, 1000 * nativeBalance.flora.seed]);
    expect(delivered.state.allies[0].native?.seeds).toEqual({});
    expect(delivered.state.allies[0].pilot).toBeUndefined();
  });

  it('Briar chooses lowest health fraction and an emergency harvest heals only existing Seeds', () => {
    const state = encounter('sprout', 'ember', 'tide');
    state.allies[0].hp = 700; state.allies[1].hp = state.allies[2].hp = 500;
    const planted = use(state, 'sprout', 'skill1');
    expect(Object.keys(planted.state.allies[0].native?.seeds ?? {})).toEqual(['ember']);
    const harvest = use(planted.state, 'sprout', 'skill2');
    expect(harvest.events.filter(event => event.kind === 'heal').map(event => [event.target, event.amount])).toEqual([['ember', 1000 * nativeBalance.flora.seed]]);
    expect(Object.keys(harvest.state.allies[0].native?.seeds ?? {})).toHaveLength(3);
  });

  it('Worldseed heals immediately, preserves empowered delivery and never revives', () => {
    const state = encounter('sprout', 'ember', 'tide');
    state.allies[0].hp = state.allies[1].hp = 100;
    state.allies[2].hp = 0;
    const flare = use(state, 'sprout', 'ultimate');
    expect(flare.events.filter(event => event.kind === 'heal').map(event => event.amount)).toEqual([1000 * nativeBalance.flora.immediateHeal, 1000 * nativeBalance.flora.immediateHeal]);
    expect(flare.state.allies[2].hp).toBe(0);
    const normal = use(flare.state, 'sprout', 'skill1');
    expect(Object.values(normal.state.allies[0].native?.seeds ?? {}).map(seed => seed.fraction)).toEqual([nativeBalance.flora.empoweredSeed, nativeBalance.flora.empoweredSeed]);
    expect(resolveFighter('sprout').abilities.ultimate.strength).toEqual({});
  });

  it('new encounters reset native investments and independent encounter Conduit charges without mutating the source', () => {
    const state = use(encounter('ember'), 'ember', 'skill1').state;
    state.allies[0].conduitCharges = { normalMomentum: true };
    state.phase = 'cleared';
    state.enemies.forEach(enemy => { enemy.hp = 0; });
    const next = nextWave(state).state;
    expect(next.allies[0].native).toEqual({});
    expect(next.allies[0].conduitCharges?.normalMomentum).toBeUndefined();
    expect(Object.keys(state.allies[0].native?.burns ?? {})).toHaveLength(1);
  });
});
