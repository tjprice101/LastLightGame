import { describe, expect, it } from 'vitest';
import { act, createBattle, endTurn, type BattleEvent, type BattleState } from './battle';
import { nativeBurnPhase, nativeDefenseBonus, nativeEnemyCompleted, nativePrimaryHit,
  nativeReadout, nativeTauntTarget } from './native-kits';
import { initializeConduits } from './conduit-runtime';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(1729, roster);
  state.enemies = [state.enemies[0], { ...structuredClone(state.enemies[0]), id: 'other-enemy' }];
  state.enemies.forEach(unit => {
    unit.hp = unit.stats.health = 1_000_000;
    unit.stats.defense = 0;
    unit.stats.damage = 10;
    unit.stats.crit = 0;
  });
  state.allies.forEach(unit => {
    unit.shatter = 0;
    unit.stats.crit = 0;
    unit.stats.damage = 100;
    unit.stats.skillPower = 1;
    unit.hp = unit.stats.health;
  });
  return state;
}

function use(state: BattleState, id: string, action: 'light' | 'skill1' | 'skill2' | 'ultimate', target = state.enemies[0].id) {
  const actor = state.allies.find(unit => unit.id === id)!;
  actor.spent = false;
  actor.shatter = 100;
  actor.recoverThrough = 0;
  if (actor.conduitRuntime) actor.conduitRuntime.numbers.actions = 0;
  return act(state, id, action, target);
}

function packet(state: BattleState, target: string, origin: 'native' | 'conduit' = 'native'): BattleEvent[] {
  return [
    { kind: 'attack', source: state.enemies[0].id, target, amount: 0, critical: false, message: 'enemy attack' },
    { kind: 'damage', source: state.enemies[0].id, target, amount: 0, critical: false,
      shieldAbsorbed: 10, origin, message: 'effective packet' },
  ];
}

describe('Phase 2 native War kits', () => {
  it('grants Current once after effective native healing and after spending, but not for overheal', () => {
    const state = encounter('neralis', 'tide', 'sprout');
    state.allies[1].hp = Math.floor(state.allies[1].stats.health * .25);
    const hpBefore = state.allies[1].hp;
    const first = use(state, 'neralis', 'skill1', 'tide');
    expect(first.state.allies[0].native?.current).toBe(1);
    expect(first.state.allies[1].hp).toBeGreaterThan(hpBefore);
    const spent = use(first.state, 'neralis', 'skill2');
    expect(spent.state.allies[0].native?.current).toBe(1);

    const full = encounter('neralis', 'tide', 'sprout');
    const overheal = use(full, 'neralis', 'skill1', 'tide');
    expect(overheal.state.allies[0].native?.current ?? 0).toBe(0);
  });

  it('applies Neralis Master cap, stronger Current healing, and Station shield', () => {
    const capped = encounter('neralis', 'tide', 'sprout');
    const owner = capped.allies[0];
    owner.masterConduit = 'master-neralis-1';
    initializeConduits(capped);
    let result = capped;
    for (let count = 0; count < 4; count++) {
      result.allies[1].hp = Math.floor(result.allies[1].stats.health * .1);
      result = use(result, owner.id, 'skill1', 'tide').state;
    }
    expect(result.allies[0].native?.current).toBe(4);

    const healing = (master?: 'master-neralis-1') => {
      const state = encounter('neralis', 'tide', 'sprout');
      const neralis = state.allies[0];
      neralis.native = { current: 2 };
      if (master) neralis.masterConduit = master;
      initializeConduits(state);
      state.allies[1].hp = Math.floor(state.allies[1].stats.health * .1);
      return use(state, neralis.id, 'skill2').events
        .filter(event => event.kind === 'heal' && event.source === neralis.id && event.target === state.allies[1].id)
        .reduce((sum, event) => sum + event.amount, 0);
    };
    expect(healing('master-neralis-1')).toBeGreaterThan(healing());

    const shielded = encounter('neralis', 'tide');
    shielded.allies[0].masterConduit = 'master-neralis-2';
    initializeConduits(shielded);
    const shield = use(shielded, 'neralis', 'skill1', 'tide');
    expect(shield.state.allies[1].shield).toBeGreaterThan(0);
  });

  it('checks Neralis gauge return per wounded recipient, once per ally each round, through a serialized run', () => {
    const state = encounter('neralis', 'tide', 'sprout');
    const owner = state.allies[0];
    owner.masterConduit = 'master-neralis-3';
    initializeConduits(state);
    for (const ally of state.allies) ally.hp = Math.floor(ally.stats.health * .4);
    const first = use(state, owner.id, 'skill2');
    expect(first.state.allies.every(ally => ally.shatter > 0)).toBe(true);
    const gauges = first.state.allies.map(ally => ally.shatter);
    expect(first.state.allies[0].native?.current).toBe(1);
    const resumed = JSON.parse(JSON.stringify(first.state)) as BattleState;
    resumed.allies[0].spent = false;
    resumed.allies[0].recoverThrough = 0;
    const second = act(resumed, owner.id, 'skill2', resumed.enemies[0].id);
    expect(second.state.allies.map(ally => ally.shatter)).toEqual([gauges[0] - 40, gauges[1], gauges[2]]);
    expect(second.state.allies[0].native?.current).toBe(1);
    expect(nativeReadout(second.state, second.state.allies[0]).find(row => row.label === 'Current')?.value).toBe('1/3');
  });

  it('caps Varkhel Tension at four or five with its Master and excludes Conduit packets', () => {
    for (const [master, expected] of [[undefined, 4], ['master-varkhel-1', 5]] as const) {
      const state = encounter('varkhel', 'tide', 'sprout');
      const owner = state.allies[0];
      if (master) owner.masterConduit = master;
      initializeConduits(state);
      for (let phase = 0; phase < 6; phase++) {
        state.round = phase;
        nativeEnemyCompleted(state, state.enemies[0], true, packet(state, owner.id));
      }
      expect(owner.native?.tension).toBe(expected);
      if (master) expect(nativeDefenseBonus(state, owner, owner.stats.defense)).toBeCloseTo(owner.stats.defense * .5);
      state.round++;
      nativeEnemyCompleted(state, state.enemies[0], true, packet(state, owner.id, 'conduit'));
      expect(owner.native?.tension).toBe(expected);
    }
    const normal = encounter('varkhel', 'tide');
    const result = use(normal, 'varkhel', 'light');
    expect(result.state.allies[0].native?.tension).toBe(1);
  });

  it('refreshes Varkhel defense and taunt, shares the Master shield, and refunds Gauge after Skill 2 cost', () => {
    const state = encounter('varkhel', 'tide', 'sprout');
    const owner = state.allies[0];
    owner.masterConduit = 'master-varkhel-2';
    initializeConduits(state);
    owner.stats.skillPower = 2;
    const result = use(state, owner.id, 'skill1');
    const defender = result.state.allies[0];
    const other = result.state.allies[1];
    expect(other.shield).toBeGreaterThan(0);
    expect(nativeDefenseBonus(result.state, defender, defender.stats.defense)).toBeCloseTo(defender.stats.defense * .4);
    expect(nativeTauntTarget(result.state, result.state.enemies[0])?.id).toBe(owner.id);
    const refresh = use(result.state, owner.id, 'skill1');
    expect(refresh.state.allies[1].shield).toBeGreaterThan(other.shield);

    const funded = encounter('varkhel', 'tide');
    funded.allies[0].masterConduit = 'master-varkhel-3';
    funded.allies[0].native = { tension: 3 };
    initializeConduits(funded);
    const flare = use(funded, 'varkhel', 'skill2');
    expect(flare.state.allies[0].shatter).toBe(75);
    expect(flare.state.allies[0].native?.tension).toBe(0);
  });

  it('grants Seravelle Cadence only on the first effective manual Normal each round', () => {
    const state = encounter('seravelle', 'tide', 'sprout');
    const first = use(state, 'tide', 'light');
    expect(first.state.allies[0].native?.cadence).toBe(1);
    const second = use(first.state, 'seravelle', 'light');
    expect(second.state.allies[0].native?.cadence).toBe(1);
    nativePrimaryHit(second.state, second.state.allies[1], second.state.enemies[0], true, []);
    expect(second.state.allies[0].native?.cadence).toBe(1);
    second.state.round++;
    const nextRound = use(second.state, 'sprout', 'light');
    expect(nextRound.state.allies[0].native?.cadence).toBe(2);
  });

  it('keeps Seravelle’s Direct Attack buff fixed against Skill Power and refreshes it', () => {
    const state = encounter('seravelle', 'tide', 'sprout');
    const owner = state.allies[0];
    owner.masterConduit = 'master-seravelle-1';
    owner.native = { cadence: 2 };
    initializeConduits(state);
    owner.stats.skillPower = 5;
    const first = use(state, owner.id, 'skill2');
    expect(first.state.allies.map(ally => ally.attackBoost?.fraction)).toEqual([.6, .6, .6].map(value => expect.closeTo(value)));
    const through = first.state.allies[0].attackBoost!.throughRound;
    first.state.round++;
    const refreshed = use(first.state, owner.id, 'skill2');
    expect(refreshed.state.allies[0].attackBoost?.fraction).toBe(.4);
    expect(refreshed.state.allies[0].attackBoost?.throughRound).toBeGreaterThan(through);
  });

  it('funds only other living allies from effective native Burn ticks once per enemy phase', () => {
    const state = encounter('seravelle', 'tide', 'sprout');
    const owner = state.allies[0];
    owner.masterConduit = 'master-seravelle-2';
    initializeConduits(state);
    owner.native = { burns: Object.fromEntries(state.enemies.map(enemy => [enemy.id, { damage: 10, turns: 2 }])) };
    for (const enemy of state.enemies) enemy.burn = { damage: 10, turns: 2, sourceId: owner.id, origin: 'native' };
    for (const enemy of state.enemies) nativeBurnPhase(state, enemy, []);
    expect(state.allies[0].shatter).toBe(0);
    expect(state.allies[1].shatter).toBe(5);
    expect(state.allies[2].shatter).toBe(5);
  });

  it('grants Seravelle Master 3 shields to the squad on Ultimate without spending Cadence', () => {
    const state = encounter('seravelle', 'tide', 'sprout');
    state.allies[0].masterConduit = 'master-seravelle-3';
    state.allies[0].native = { cadence: 2 };
    initializeConduits(state);
    const result = use(state, 'seravelle', 'ultimate');
    expect(result.state.allies.every(ally => ally.shield > 0)).toBe(true);
    expect(result.state.allies[0].native?.cadence).toBe(2);
  });

  it('uses Velmira’s pre-action Crosscut for piercing, alternates after damage and funds the first Skill once', () => {
    const state = encounter('velmira', 'tide', 'sprout');
    const owner = state.allies[0];
    owner.masterConduit = 'master-velmira-1';
    initializeConduits(state);
    for (const enemy of state.enemies) enemy.stats.defense = 1000;
    let result = use(state, owner.id, 'skill1');
    expect(result.state.allies[0].native?.crosscut).toBe(1);
    result = use(result.state, owner.id, 'skill1');
    expect(result.state.allies[0].native?.crosscut).toBe(1);
    result = use(result.state, owner.id, 'skill2');
    expect(result.state.allies[0].native?.crosscut).toBe(2);
    result = use(result.state, owner.id, 'skill2');
    expect(result.state.allies[0].native?.crosscut).toBe(2);
    result = use(result.state, owner.id, 'skill1');
    expect(result.state.allies[0].native?.crosscut).toBe(3);
    result = use(result.state, owner.id, 'skill2');
    expect(result.state.allies[0].native?.crosscut).toBe(4);
    const persisted = JSON.parse(JSON.stringify(result.state)) as BattleState;
    const firstSkill = use(persisted, owner.id, 'skill1');
    expect(firstSkill.state.allies[0].native?.crosscut).toBe(4);
  });

  it('gates Velmira Master damage on pre-existing Weaken and applies funded Last Flare recovery after cost', () => {
    const state = encounter('velmira', 'tide');
    const owner = state.allies[0];
    owner.masterConduit = 'master-velmira-2';
    initializeConduits(state);
    owner.stats.crit = 0;
    const target = state.enemies[0];
    target.stats.defense = 400;
    const plain = structuredClone(state);
    const weakened = structuredClone(state);
    weakened.enemies[0].weakened = 1;
    weakened.enemies[0].weakenFraction = .25;
    const plainHit = use(plain, owner.id, 'skill1').events.find(event => event.kind === 'damage' && event.target === target.id)!.amount;
    const empoweredHit = use(weakened, owner.id, 'skill1').events.find(event => event.kind === 'damage' && event.target === target.id)!.amount;
    expect(empoweredHit).toBeGreaterThan(plainHit);

    const flareState = encounter('velmira', 'tide');
    flareState.allies[0].masterConduit = 'master-velmira-3';
    flareState.allies[0].native = { crosscut: 3, previousSkill: 'skill2' };
    flareState.allies[0].hp = flareState.allies[0].stats.health - 10;
    initializeConduits(flareState);
    const flare = use(flareState, 'velmira', 'ultimate');
    expect(flare.state.allies[0].native?.crosscut).toBe(0);
    expect(flare.state.allies[0].shatter).toBe(25);
    expect(flare.state.allies[0].hp).toBeGreaterThan(flareState.allies[0].hp);
    expect(flare.state.allies[0].recoverThrough).toBeGreaterThan(flare.state.round);
  });

  it('keeps all four new native kits free of revive and cleanse effects', () => {
    for (const id of ['neralis', 'varkhel', 'seravelle', 'velmira'] as const) {
      const state = encounter(id, 'tide');
      const text = JSON.stringify(state.allies.find(ally => ally.id === id)?.kit);
      expect(text).not.toMatch(/revive|cleanse/i);
      expect(state.allies.find(ally => ally.id === id)?.native).toBeDefined();
    }
  });

  it('retains the current counters, round guards and personal Masters in a Settings-style saved run snapshot', () => {
    const state = encounter('seravelle', 'tide', 'sprout');
    const owner = state.allies[0];
    owner.masterConduit = 'master-seravelle-1';
    owner.native = { cadence: 2, guards: { cadence: state.round } };
    initializeConduits(state);
    const saved = JSON.parse(JSON.stringify(state)) as BattleState;
    expect(saved.allies[0].masterConduit).toBe('master-seravelle-1');
    expect(saved.allies[0].native).toEqual(owner.native);
    use(saved, saved.allies[1].id, 'light');
    expect(saved.allies[0].native?.cadence).toBe(2);
    expect(saved.allies[0].native?.guards?.cadence).toBe(saved.round);
  });

  it('keeps a stage10 direct enemy packet distinct from native counters, Burn and repeated hits', () => {
    const state = encounter('varkhel', 'tide');
    const owner = state.allies[0];
    const target = state.enemies[0];
    const eventSet = packet(state, owner.id);
    nativeEnemyCompleted(state, target, true, eventSet);
    expect(owner.native?.tension).toBe(1);
    const burn: BattleEvent[] = [
      { kind: 'attack', source: target.id, target: owner.id, amount: 0, critical: false, message: 'enemy attack' },
      { kind: 'damage', source: target.id, target: owner.id, amount: 10, critical: false, periodic: true,
        origin: 'native', message: 'Burn' },
    ];
    nativeEnemyCompleted(state, target, true, burn);
    expect(owner.native?.tension).toBe(1);
    const repeated = endTurn(state);
    expect(repeated.state.allies[0].native?.tension).toBeLessThanOrEqual(4);
  });
});
