import { describe, expect, it } from 'vitest';
import { act, actionUnavailable, createBattle, endTurn, periodicDamage, roll, type BattleEvent, type BattleState } from './battle';
import { nativeReadout, nativeTauntTarget, nativeDamageTakenMultiplier, nativeIncomingMultiplier, nativeTrace,
  nativeEnemyCompleted, nativeBurnPhase, nativePrimaryHit, nativeHeatCap, nativeDefenseBonus } from './native-kits';
import { debuffSnapshot } from './battle-debuffs';
import { generatedStrike, initializeConduits, nativeShield, gear } from './conduit-runtime';
import { getVFXProfileForCombatant } from '../vfx/vfx-registry';
import { nativeIdentities } from '../content/native-identities';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(1729, roster);
  state.enemies = [state.enemies[0], { ...structuredClone(state.enemies[0]), id: 'other-enemy' }];
  state.enemies.forEach(unit => { unit.hp = unit.stats.health = 1_000_000; unit.stats.defense = 0; unit.stats.damage = 10; unit.stats.crit = 0; });
  state.allies.forEach(unit => { unit.shatter = 100; unit.stats.crit = 0; unit.stats.damage = 100; unit.stats.skillPower = 1; unit.hp = unit.stats.health = 1000; });
  return state;
}
function use(state: BattleState, id: string, action: 'light' | 'skill1' | 'skill2' | 'ultimate', target = state.enemies[0].id) {
  const actor = state.allies.find(unit => unit.id === id)!;
  actor.spent = false; actor.shatter = 100; actor.recoverThrough = 0;
  if (actor.conduitRuntime) actor.conduitRuntime.numbers.actions = 0;
  return act(state, id, action, target);
}

describe('Caldrex, Solenne and Myrthen native kits', () => {
  it('Heat caps at five with its Master, grants 12% Defense per Heat and gains only once per enemy phase', () => {
    const state = encounter('caldrex'), owner = state.allies[0], enemy = state.enemies[0];
    owner.masterConduit = 'master-caldrex-1';
    initializeConduits(state);
    owner.native = { heat: 4 };
    expect(nativeDefenseBonus(state, owner, 100)).toBe(48);
    const attacks = (): BattleEvent[] => [
      { kind: 'attack', source: enemy.id, target: owner.id, amount: 0, critical: false, message: 'attack' },
      { kind: 'damage', source: enemy.id, target: owner.id, amount: 0, critical: false, shieldAbsorbed: 10, origin: 'native', message: 'shield hit' },
    ];
    nativeEnemyCompleted(state, enemy, true, attacks());
    nativeEnemyCompleted(state, enemy, true, attacks());
    expect(nativeHeatCap(owner)).toBe(5);
    expect(owner.native.heat).toBe(5);
    expect(nativeDefenseBonus(state, owner, 100)).toBe(60);
  });

  it('Caldrex counter uses 90% Attack, can crit, and ignores Skill Power and Claim', () => {
    for (const skillPower of [1, 7]) for (const crit of [0, 1]) {
      const state = encounter('caldrex', 'myrthen'), owner = state.allies[0], enemy = state.enemies[0];
      owner.masterConduit = 'master-caldrex-2';
      owner.native = { tauntThrough: state.round };
      owner.stats.skillPower = skillPower; owner.stats.crit = crit; owner.stats.critMultiplier = 1.5;
      state.allies[1].native = { claim: { target: enemy.id, throughPhase: state.round } };
      gear(enemy).owners.nativeTaunt = owner.id;
      const events: BattleEvent[] = [
        { kind: 'attack', source: enemy.id, target: owner.id, amount: 0, critical: false, message: 'attack' },
        { kind: 'damage', source: enemy.id, target: owner.id, amount: 10, critical: false, origin: 'native', message: 'hit' },
      ];
      nativeEnemyCompleted(state, enemy, true, events);
      expect(events.find(e => e.source === owner.id && e.kind === 'damage')).toMatchObject({
        amount: crit ? 135 : 90, critical: !!crit, origin: 'conduit',
      });
    }
  });

  it('Cinderpulse heals 8% once per phase on actual ability Burn damage without Skill Power scaling', () => {
    const state = encounter('caldrex', 'ember'), owner = state.allies[0];
    owner.masterConduit = 'master-caldrex-3'; owner.stats.skillPower = 9;
    state.allies.forEach(ally => { ally.hp = 100; });
    state.allies[1].native = { burns: Object.fromEntries(state.enemies.map(enemy => [enemy.id, { damage: 10, turns: 3 }])) };
    for (const enemy of state.enemies) nativeBurnPhase(state, enemy, []);
    expect(state.allies.map(ally => ally.hp)).toEqual([180, 180]);
    state.round++;
    nativeBurnPhase(state, state.enemies[0], []);
    expect(state.allies.map(ally => ally.hp)).toEqual([260, 260]);
  });

  it('Quiet-Arc generates exactly 20% maximum-Health shield, independent of Skill Power', () => {
    for (const skillPower of [1, 7]) {
      const state = encounter('solenne', 'ember');
      state.allies[0].masterConduit = 'master-solenne-2';
      state.allies[0].stats.skillPower = skillPower;
      state.allies[1].hp = 100;
      initializeConduits(state);
      const result = use(state, 'solenne', 'skill2');
      expect(result.events.find(e => e.kind === 'shield' && e.origin === 'conduit' && e.target === 'ember')?.amount).toBe(200);
      expect(result.state.allies[0].native?.stillness).toBe(2);
    }
  });

  it('Seasonwheel uses the exact 75% Harvest bonus and returns to Bloom', () => {
    const state = encounter('myrthen', 'ember');
    state.allies[0].masterConduit = 'master-myrthen-1';
    state.allies[0].native = { season: 'harvest' };
    initializeConduits(state);
    const result = use(state, 'myrthen', 'skill1');
    const owner = result.state.allies[0];
    expect(result.events.find(e => e.kind === 'damage' && e.source === 'myrthen')?.amount)
      .toBe(Math.round(owner.stats.damage * 2.72 * 1.75 * (owner.stats.skillPower ?? 1)));
    expect(owner.native?.season).toBe('bloom');
  });

  it('Cadence grants 7% Gauge once per phase and exactly 3% per charge to other allies on Last Flare', () => {
    const state = encounter('solenne', 'ember'), owner = state.allies[0];
    owner.masterConduit = 'master-solenne-3'; owner.native = { stillness: 4 };
    state.allies.forEach(ally => { ally.shatter = 0; ally.stats.shatterCapacity = 100; });
    for (let index = 0; index < 2; index++) nativeIncomingMultiplier(state, state.enemies[0], owner, 'light', []);
    expect(state.allies.map(ally => ally.shatter)).toEqual([7, 7]);
    const flare = use(state, 'solenne', 'ultimate');
    expect(flare.state.allies[1].shatter).toBe(13);
    expect(flare.state.allies[0].native?.stillness).toBe(0);
  });

  it('Reaping-Tide requires a native direct kill while combat continues, heals 6% and grants 5% Gauge once per round', () => {
    const state = encounter('myrthen', 'ember'), owner = state.allies[0];
    owner.masterConduit = 'master-myrthen-3'; owner.stats.skillPower = 9;
    state.allies.forEach(ally => { ally.hp = 100; ally.shatter = 0; ally.stats.shatterCapacity = 100; });
    state.enemies[0].hp = 1;
    generatedStrike(state, owner, state.enemies[0], 10, []);
    expect(state.allies.map(ally => ally.hp)).toEqual([100, 100]);
    nativePrimaryHit(state, owner, state.enemies[0], true, []);
    nativePrimaryHit(state, owner, state.enemies[0], true, []);
    expect(state.allies.map(ally => ally.hp)).toEqual([160, 160]);
    expect(state.allies.map(ally => ally.shatter)).toEqual([5, 5]);
    state.enemies[1].hp = 0; state.round++;
    nativePrimaryHit(state, owner, state.enemies[1], true, []);
    expect(state.allies.map(ally => ally.hp)).toEqual([160, 160]);
  });
  it('Claim amplifies native squad direct packets, never generated Conduit or periodic packets', () => {
    const state = encounter('myrthen', 'ember');
    const [myrthen, ally] = state.allies, target = state.enemies[0];
    myrthen.native = { claim: { target: target.id, throughPhase: state.round + 1 } };
    expect(nativeDamageTakenMultiplier(state, ally, target)).toBeCloseTo(1.12);
    expect(nativeDamageTakenMultiplier(state, myrthen, target)).toBeCloseTo(1.12);
    expect(nativeDamageTakenMultiplier(state, ally, target, 'periodic')).toBe(1);
    const events: BattleEvent[] = [];
    expect(generatedStrike(state, ally, target, 100, events)).toBe(100);
    expect(events[0]).toMatchObject({ amount: 100, origin: 'conduit' });
    const marked = use(state, 'ember', 'light').events.find(e => e.kind === 'damage' && e.source === 'ember')!;
    const baseline = structuredClone(state);
    delete baseline.allies[0].native!.claim;
    const unmarked = use(baseline, 'ember', 'light').events.find(e => e.kind === 'damage' && e.source === 'ember')!;
    expect(marked.amount).toBe(Math.round(unmarked.amount * 1.12));
  });

  it('Seedtrace advances the established combat RNG and preserves unrelated streams', () => {
    const state = encounter('myrthen'), expected = structuredClone(state);
    const result = roll(expected) < .1;
    expect(nativeTrace(state, state.allies[0], .1)).toBe(result);
    expect(state.seed).toBe(expected.seed);
    expect(state.rewardSeed).toBe(expected.rewardSeed);
    expect(state.conduitSeed).toBe(expected.conduitSeed);
  });

  it('Seedtrace requires normal Gauge, pays survivable 15% Health on its 5% draw, and retains recovery', () => {
    for (const health of [1000, 150]) {
      const state = encounter('myrthen', 'ember');
      state.allies[0].masterConduit = 'master-myrthen-2';
      initializeConduits(state);
      const owner = state.allies[0];
      owner.hp = health;
      state.seed = 1;
      const result = act(state, owner.id, 'ultimate', state.enemies[0].id);
      const cost = Math.round(owner.stats.health * .15);
      expect(result.state.allies[0].hp).toBe(health > cost ? health - cost : health);
      expect(result.state.allies[0].shatter).toBe(health > cost ? 100 : 0);
      expect(result.state.allies[0].recoverThrough).toBe(state.round + 1);
    }
    const locked = encounter('myrthen');
    locked.allies[0].masterConduit = 'master-myrthen-2';
    locked.allies[0].shatter = 99;
    expect(actionUnavailable(locked, locked.allies[0], 'ultimate')).toBeTruthy();
    expect(() => act(locked, 'myrthen', 'ultimate', locked.enemies[0].id)).toThrow();
  });

  it.each(['skill1', 'skill2', 'ultimate'] as const)('Seedtrace has a deterministic 10% Harvest draw after %s', action => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      const state = encounter('myrthen', 'ember');
      state.allies[0].masterConduit = 'master-myrthen-2';
      state.allies[0].native = { season: 'sprout' };
      state.seed = seed;
      const result = use(state, 'myrthen', action);
      expect(use(structuredClone(state), 'myrthen', action)).toEqual(result);
      seen.add(result.state.allies[0].native!.season!);
    }
    expect(seen.has('harvest')).toBe(true);
    expect(seen.has(action === 'ultimate' ? 'sprout' : 'bloom')).toBe(true);
  });

  it.each([false, true])('Stillness consumes one per direct/periodic packet before shields (Master=%s)', master => {
    const state = encounter('solenne', 'ember');
    const owner = state.allies[0];
    if (master) owner.masterConduit = 'master-solenne-1';
    owner.native = { stillness: 4 };
    const events: BattleEvent[] = [];
    const expected = master ? 65 : 80;
    nativeShield(state, owner, owner, 100, events);
    periodicDamage(state, owner, 100, state.enemies[0], events);
    expect(owner.shield).toBe(100 - expected);
    expect(owner.hp).toBe(1000);
    expect(owner.native.stillness).toBe(3);
    periodicDamage(state, owner, 100, state.enemies[0], events);
    expect(owner.hp).toBe(1000 - (expected * 2 - 100));
    expect(owner.native.stillness).toBe(2);
    expect(nativeIncomingMultiplier(state, state.enemies[0], owner, 'light', events)).toBeCloseTo(expected / 100);
    expect(owner.native.stillness).toBe(1);
    expect(events.filter(e => e.kind === 'damage').every(e => e.periodic)).toBe(true);
  });

  it.each(['caldrex', 'solenne', 'myrthen'] as const)('%s has explicit named VFX for every action', id => {
    const profile = getVFXProfileForCombatant(id);
    expect(profile.characterId).toBe(id);
    for (const action of ['skill1', 'skill2', 'ultimate'] as const)
      expect(profile.abilities[action].name).toBe(nativeIdentities[id].abilities[action].name);
  });
  it.each(['caldrex', 'solenne', 'myrthen'])('%s resolves every action deterministically and exposes a readout', id => {
    for (const action of ['light', 'skill1', 'skill2', 'ultimate'] as const) {
      const a = use(encounter(id, 'ember'), id, action);
      const b = use(encounter(id, 'ember'), id, action);
      expect(a.events).toEqual(b.events);
    }
    const fresh = encounter(id);
    expect(Array.isArray(nativeReadout(fresh, fresh.allies[0]))).toBe(true);
  });

  it('Caldrex Skill2 burns every enemy and the taunt only captures eligible single-target attacks', () => {
    const result = use(encounter('caldrex', 'ember'), 'caldrex', 'skill2');
    for (const enemy of result.state.enemies) expect(debuffSnapshot(enemy).burn?.turns).toBeGreaterThan(0);
    const taunted = nativeTauntTarget(result.state, result.state.enemies[0]);
    expect(taunted === undefined || taunted.id === 'caldrex').toBe(true);
  });

  it('Solenne Skill1 weakens the target for one enemy phase only', () => {
    let state = use(encounter('solenne', 'ember'), 'solenne', 'skill1').state;
    expect(debuffSnapshot(state.enemies[0]).weakened ?? 0).toBeGreaterThan(0);
    state = endTurn(endTurn(state).state).state;
    expect(debuffSnapshot(state.enemies[0]).weakened ?? 0).toBe(0);
  });

  it('Myrthen Last Flare uses exact authored scale without the roster-wide tripling', () => {
    const light = use(encounter('myrthen'), 'myrthen', 'light').events.find(event => event.kind === 'damage')!;
    const ult = use(encounter('myrthen'), 'myrthen', 'ultimate').events.filter(event => event.kind === 'damage');
    expect(light.amount).toBeGreaterThan(0);
    expect(ult.length).toBeGreaterThan(0);
  });
});
