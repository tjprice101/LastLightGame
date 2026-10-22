import { describe, expect, it } from 'vitest';
import { act, createBattle, damageAmount, endTurn, nextWave, type BattleState } from './battle';
import { nativeDirectHpLoss } from './native-kits';
import { debuffSnapshot } from './battle-debuffs';
import { nativeBalance } from '../content/native-balance';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(1729, roster);
  state.enemies = [state.enemies[0], { ...structuredClone(state.enemies[0]), id: 'other-enemy' }];
  state.enemies.forEach(unit => {
    unit.hp = unit.stats.health = 1_000_000; unit.stats.defense = 0; unit.stats.damage = 10; unit.stats.crit = 0;
  });
  state.allies.forEach(unit => {
    unit.shatter = 100; unit.stats.crit = 0; unit.stats.damage = 100;
    unit.hp = unit.stats.health = 1000;
  });
  return state;
}
function use(state: BattleState, id: string, action: 'light' | 'skill1' | 'skill2' | 'ultimate', target = state.enemies[0].id) {
  const actor = state.allies.find(unit => unit.id === id)!;
  actor.spent = false; actor.shatter = 100; actor.recoverThrough = 0;
  if (actor.conduitRuntime) actor.conduitRuntime.numbers.actions = 0;
  return act(state, id, action, target);
}

describe('distinct Rose and Elemental War identities', () => {
  it('Rosetta marks before contributing and rewards distinct participants, not repeated self hits', () => {
    let state = use(encounter('rosetta', 'ember', 'tide'), 'rosetta', 'skill1').state;
    expect(state.allies[0].native?.quarry?.contributors).toEqual(['rosetta']);
    state = use(state, 'rosetta', 'light').state;
    expect(state.allies[0].shield).toBe(0);
    state = use(state, 'ember', 'light').state;
    expect(state.allies.map(unit => unit.shield)).toEqual([80, 80, 0]);
    const cashout = use(state, 'rosetta', 'skill2');
    expect(cashout.events.find(event => event.kind === 'damage')?.amount).toBe(Math.round(225 * nativeBalance.skillDamageScale));
    expect(cashout.state.allies[0].pilot?.roseGrace).toBeUndefined();
  });

  it('Rosetta preserves same-target history, clears it on a new Quarry, and heals only participants', () => {
    let state = use(encounter('rosetta', 'ember', 'tide'), 'rosetta', 'skill1').state;
    state = use(state, 'ember', 'light').state;
    state = use(state, 'rosetta', 'skill1').state;
    expect(state.allies[0].native?.quarry?.contributors).toHaveLength(2);
    state.allies.forEach(unit => { unit.hp = 500; });
    const flare = use(state, 'rosetta', 'ultimate');
    expect(flare.events.filter(event => event.kind === 'heal').map(event => event.target)).toEqual(['rosetta', 'ember']);
    state = use(state, 'rosetta', 'skill1', state.enemies[1].id).state;
    expect(state.allies[0].native?.quarry?.contributors).toEqual(['rosetta']);
    const solo = use(encounter('rosetta'), 'rosetta', 'skill2');
    expect(solo.events.find(event => event.kind === 'damage')?.amount).toBe(160 * nativeBalance.skillDamageScale);
  });

  it('Thornia plants without damage, then retaliates once per enemy activation, not per ally hit', () => {
    const state = encounter('thornia', 'ember');
    state.enemies = [state.enemies[0]];
    const planted = use(state, 'thornia', 'skill1');
    expect(planted.events.some(event => event.kind === 'damage')).toBe(false);
    expect(planted.state.allies[0].native?.traps?.[state.enemies[0].id]?.charges).toBe(3);
    const phase = endTurn(planted.state);
    expect(phase.events.filter(event => event.nativeKind === 'trap').map(event => event.amount)).toEqual([60]);
    expect(phase.state.allies[0].native?.traps?.[state.enemies[0].id]?.charges).toBe(2);
    expect(phase.state.allies[0].pilot).toBeUndefined();
  });

  it('Thornia can harvest one charge immediately and weaker refresh preserves empowered retaliation', () => {
    let state = use(encounter('thornia'), 'thornia', 'ultimate').state;
    state = use(state, 'thornia', 'skill1').state;
    expect(state.allies[0].native?.traps?.[state.enemies[0].id]).toMatchObject({ charges: 3, coefficient: 2.7 });
    const harvest = use(state, 'thornia', 'skill2');
    expect(harvest.events.find(event => event.nativeKind === 'trap')?.amount).toBe(80);
    expect(harvest.state.allies[0].native?.traps?.[state.enemies[0].id]?.charges).toBe(2);
  });

  it('Crinso alternates four edges for Combo3, then consumes it before a 395% single-target finisher', () => {
    let state = encounter('crinso');
    for (const action of ['skill1', 'skill2', 'skill1', 'skill2'] as const) state = use(state, 'crinso', action).state;
    expect(state.allies[0].native).toMatchObject({ combo: 3, edge: 'crimson' });
    expect(state.enemies.every(enemy => enemy.burn.turns === 0)).toBe(true);
    const flare = use(state, 'crinso', 'ultimate');
    expect(flare.events.filter(event => event.kind === 'damage').map(event => event.amount)).toEqual([Math.round(395 * nativeBalance.skillDamageScale * 3)]);
    expect(flare.state.allies[0].native?.combo).toBe(0);
    expect(flare.state.allies[0].native?.edge).toBeUndefined();
    expect(flare.state.allies[0].recoverThrough).toBe(state.round + 1);
  });

  it('Crinso repeats reset Combo, Normal/Defense preserve it, and alternate Gold pierces Defense', () => {
    let state = use(encounter('crinso'), 'crinso', 'skill2').state;
    state = use(state, 'crinso', 'light').state;
    state = use(state, 'crinso', 'light').state;
    expect(state.allies[0].native?.edge).toBe('crimson');
    state.enemies[0].stats.defense = 100;
    const gold = use(state, 'crinso', 'skill1');
    expect(gold.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 1.6 * nativeBalance.skillDamageScale, 80, false));
    const repeat = use(gold.state, 'crinso', 'skill1');
    expect(repeat.state.allies[0].native?.combo).toBe(0);
    expect(repeat.state.allies[0].pilot).toBeUndefined();
  });

  it('Nerithe normals add exactly five Gauge and survey points; spending uses pierce, not Weaken', () => {
    const state = encounter('nerithe');
    state.allies[0].shatter = 20;
    const normal = act(state, 'nerithe', 'light', state.enemies[0].id);
    expect(normal.state.allies[0].shatter).toBe(45);
    expect(normal.state.allies[0].native?.survey).toEqual({ target: state.enemies[0].id, points: 1 });
    normal.state.enemies[0].stats.defense = 100;
    const pierce = use(normal.state, 'nerithe', 'skill1');
    expect(pierce.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 1.8 * nativeBalance.skillDamageScale, 75, false));
    expect(pierce.state.enemies[0].weakened).toBe(0);
    expect(pierce.state.allies[0].native?.survey?.points ?? 0).toBe(0);
    expect(pierce.state.allies[0].shatter).toBe(75);
  });

  it('Nerithe moves existing points but creates none with Fold the Sea and surveys only one enemy', () => {
    let state = use(encounter('nerithe'), 'nerithe', 'skill2').state;
    expect(state.allies[0].native?.survey).toBeUndefined();
    state = use(state, 'nerithe', 'light').state;
    state = use(state, 'nerithe', 'light').state;
    state = use(state, 'nerithe', 'skill2', state.enemies[1].id).state;
    expect(state.allies[0].native?.survey).toEqual({ target: state.enemies[1].id, points: 2 });
    state = use(state, 'nerithe', 'light', state.enemies[0].id).state;
    expect(state.allies[0].native?.survey).toEqual({ target: state.enemies[0].id, points: 1 });
  });

  it('Orvella constructs shared durability, repairs past its starting value and demolishes without rebuilding', () => {
    let state = use(encounter('orvella'), 'orvella', 'skill2').state;
    expect(state.allies[0].native?.foundation?.durability).toBe(300);
    expect(state.allies[0].shield).toBe(0);
    state.allies[0].native!.foundation!.durability = 250;
    const repair = use(state, 'orvella', 'skill1');
    expect(repair.events.find(event => event.kind === 'damage')?.amount).toBe(140 * nativeBalance.skillDamageScale);
    expect(repair.state.allies[0].native?.foundation?.durability).toBe(330);
    const demolition = use(repair.state, 'orvella', 'ultimate');
    expect(demolition.events.filter(event => event.nativeKind === 'demolition').map(event => event.amount)).toEqual([990, 990]);
    expect(demolition.state.allies[0].native?.foundation).toBeUndefined();
    const noStructure = use(encounter('orvella'), 'orvella', 'skill1');
    expect(noStructure.events.find(event => event.kind === 'damage')?.amount).toBe(180 * nativeBalance.skillDamageScale);
  });

  it('Vaelor advances global Tune/Rise/Crescendo through recovery and receives the exact finisher window', () => {
    let state = encounter('vaelor');
    expect(state.allies[0].native?.beat ?? 0).toBe(0);
    state = endTurn(state).state;
    expect(state.allies[0].native?.beat).toBe(1);
    state = use(state, 'vaelor', 'skill2').state;
    expect(state.allies[0].attackBoost?.fraction).toBe(.2);
    state = endTurn(state).state;
    expect(state.allies[0].native?.beat).toBe(2);
    const flare = use(state, 'vaelor', 'ultimate');
    expect(flare.events.filter(event => event.kind === 'damage').map(event => event.amount)).toEqual([Math.round(340 * nativeBalance.skillDamageScale * 1.2 * 3), Math.round(340 * nativeBalance.skillDamageScale * 1.2 * 3)]);
    const recovery = endTurn(flare.state).state;
    expect(recovery.allies[0].native?.beat).toBe(0);
    expect(recovery.allies[0].recoverThrough).toBe(flare.state.round + 1);
    expect(recovery.allies[0].pilot).toBeUndefined();
  });

  it('Razor banks only supplied direct HP loss and spends all of it on each skill', () => {
    const state = encounter('razor');
    nativeDirectHpLoss(state, state.allies[0], 500, []);
    expect(state.allies[0].native?.wounds).toBe(500);
    const small = use(state, 'razor', 'skill1');
    expect(small.events.find(event => event.nativeKind === 'revenge')?.amount).toBe(500);
    expect(small.state.allies[0].native?.wounds).toBe(0);
    const flare = use(state, 'razor', 'ultimate');
    expect(flare.events.find(event => event.nativeKind === 'revenge')?.amount).toBe(3000);
    expect(flare.state.allies[0].native?.wounds).toBe(0);
  });

  it('preserves precise origin tags for frozen historical effects independently of replacement kits', () => {
    const state = encounter('rosetta');
    Object.assign(state.enemies[0], { weakened: 2, weakenFraction: .2, weakenOrigin: 'rose' });
    expect(debuffSnapshot(state.enemies[0]).elementalEffects).toContainEqual({
      family: 'suppression', kind: 'weaken', origin: 'rose', source: 'authored-weaken',
    });
  });

  it('Settings clones isolate native state and a new encounter clears all six Rose/War investments', () => {
    for (const [id, action] of [['rosetta', 'skill1'], ['thornia', 'skill1'], ['crinso', 'skill1'],
      ['nerithe', 'light'], ['orvella', 'skill2'], ['vaelor', 'skill2']] as const) {
      const state = use(encounter(id), id, action).state;
      const before = structuredClone(state);
      const settings = structuredClone(state);
      settings.allies[0].native = {};
      expect(state).toEqual(before);
      state.phase = 'cleared';
      state.enemies.forEach(enemy => { enemy.hp = 0; });
      const next = nextWave(state).state;
      expect(next.allies[0].native).toEqual(id === 'vaelor' ? { beat: 0, beatRound: next.round } : {});
      expect(next.allies[0].pilot).toBeUndefined();
    }
  });
});
