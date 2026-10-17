import { describe, expect, it } from 'vitest';
import { resolveFighter } from '../content/combat';
import { nativeIdentityIds } from '../content/native-identities';
import { nativeBalance } from '../content/native-balance';
import { act, createBattle, damageAmount, endTurn, nextWave, type BattleState } from './battle';
import { nativeForecast, nativeIncomingMultiplier, nativeRouteDamage } from './native-kits';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(1729, roster);
  state.enemies = [state.enemies[0], { ...structuredClone(state.enemies[0]), id: 'second-target' }];
  state.allies.forEach(unit => {
    unit.shatter = 100; unit.stats.crit = 0; unit.stats.damage = 100;
    unit.hp = unit.stats.health = 1000;
  });
  state.enemies.forEach(unit => {
    unit.hp = unit.stats.health = 100_000; unit.stats.defense = 0; unit.stats.damage = 0; unit.stats.crit = 0;
    unit.enemySkills = [{ name: 'Trial', every: 2, multiplier: 2, action: 'skill1' },
      { name: 'Final Trial', every: 6, multiplier: 3, action: 'ultimate' }];
  });
  return state;
}
function use(state: BattleState, id: string, action: 'light' | 'skill1' | 'skill2' | 'ultimate', target = state.enemies[0].id) {
  const actor = state.allies.find(unit => unit.id === id)!;
  actor.spent = false; actor.shatter = 100; actor.recoverThrough = 0;
  if (actor.conduitRuntime) actor.conduitRuntime.numbers.actions = 0;
  return act(state, id, action, target);
}

describe('distinct flagship native identities', () => {
  it.each(nativeIdentityIds)('%s replaces retired shared pilots rather than layering a second personal bank', id => {
    const kit = resolveFighter(id);
    expect(kit.nativeIdentity).toBe(true);
    expect(kit.pilot).toBeUndefined();
    expect(kit.passive).toMatchObject({ damageBonus: 0, defenseBonus: 0, healFraction: 0 });
    expect(encounter(id).allies[0].pilot).toBeUndefined();
  });

  it('Atmoso earns Gusts from other allies once per turn, not from his criticals', () => {
    let state = use(encounter('atmoso', 'ember', 'tide'), 'atmoso', 'skill2').state;
    state = use(state, 'ember', 'light').state;
    state = use(state, 'ember', 'light').state;
    state = use(state, 'tide', 'light').state;
    expect(state.allies[0].native?.cyclone?.gusts).toBe(2);
    state.allies[0].stats.crit = 1;
    const release = use(state, 'atmoso', 'skill1');
    expect(release.events.filter(event => event.nativeKind === 'cyclone').map(event => event.amount)).toEqual([130, 130]);
    expect(release.state.allies[0].native?.cyclone).toBeUndefined();
    expect(release.state.allies[0].pilot).toBeUndefined();
  });

  it('Atmoso recasting releases old wind before restarting empty and releases naturally after two phases', () => {
    let state = use(encounter('atmoso'), 'atmoso', 'skill2').state;
    const recast = use(state, 'atmoso', 'skill2');
    expect(recast.events.filter(event => event.nativeKind === 'cyclone').map(event => event.amount)).toEqual([70, 70]);
    expect(recast.state.allies[0].native?.cyclone?.gusts).toBe(0);
    const first = endTurn(recast.state);
    expect(first.events.some(event => event.nativeKind === 'cyclone')).toBe(false);
    const second = endTurn(first.state);
    expect(second.events.filter(event => event.nativeKind === 'cyclone').map(event => event.amount)).toEqual([70, 70]);
  });

  it('Elise uses two persistent placements and one noncritical convergence strike, with no recall RNG', () => {
    let state = use(encounter('elise'), 'elise', 'skill1').state;
    state = use(state, 'elise', 'skill1').state;
    expect(state.allies[0].native?.blades).toEqual([state.enemies[0].id, state.enemies[0].id]);
    const noBlade = use(state, 'elise', 'skill1');
    expect(noBlade.events.find(event => event.kind === 'damage')?.amount).toBe(140 * nativeBalance.skillDamageScale);
    const beforeSeed = state.seed;
    const recall = use(state, 'elise', 'skill2');
    expect(recall.events.filter(event => event.nativeKind === 'recall').map(event => event.amount)).toEqual([90, 90, 60]);
    expect(recall.events.every(event => !event.critical)).toBe(true);
    expect(recall.state.seed).toBe(beforeSeed);
    expect(recall.state.allies[0].native?.blades).toEqual([null, null]);
  });

  it('Elise split placement covers separate targets but Last Flare remains one direct target', () => {
    let state = use(encounter('elise'), 'elise', 'skill1').state;
    state = use(state, 'elise', 'skill1', state.enemies[1].id).state;
    const flare = use(state, 'elise', 'ultimate');
    expect(flare.events.filter(event => event.nativeKind === 'recall').map(event => event.amount)).toEqual([90, 90]);
    expect(flare.events.filter(event => event.kind === 'damage' && !event.nativeKind).map(event => event.amount)).toEqual([260 * nativeBalance.skillDamageScale]);
    expect(flare.state.allies[0].native?.blades).toEqual([null, null]);
  });

  it('Bliss opening grants offense, passing neither payoff, and closing restores a different ally', () => {
    const opening = use(encounter('bliss', 'ember', 'tide'), 'bliss', 'skill2');
    expect(opening.state.allies.every(unit => unit.attackBoost?.fraction === .1)).toBe(true);
    let state = encounter('bliss', 'ember', 'tide');
    state.allies[1].hp = 500;
    state = use(state, 'ember', 'light').state;
    const passing = use(state, 'bliss', 'skill1');
    expect(passing.state.allies[1].hp).toBe(500);
    expect(passing.events.find(event => event.kind === 'damage')?.amount).toBe(170 * nativeBalance.skillDamageScale);
    state = use(state, 'tide', 'light').state;
    const closing = use(state, 'bliss', 'skill1');
    expect(closing.state.allies[1].hp).toBe(560);
    const solo = use(encounter('bliss'), 'bliss', 'skill2');
    expect(solo.state.allies[0].shield).toBe(0);
    expect(solo.state.allies[0].attackBoost?.fraction).toBe(.1);
  });

  it('Bruno explicitly selects another ally, replaces Cover, and reduces only redirected damage', () => {
    let state = use(encounter('bruno', 'ember', 'tide'), 'bruno', 'skill2', 'ember').state;
    const redirected: number[] = [];
    expect(nativeRouteDamage(state, state.enemies[0], state.allies[1], 100, [], (_, amount) => redirected.push(amount))).toBe(50);
    expect(redirected).toEqual([37.5]);
    expect(nativeRouteDamage(state, state.enemies[0], state.allies[2], 100, [], () => {})).toBe(100);
    expect(() => use(state, 'bruno', 'skill2', 'bruno')).toThrow('another living ally');
    state = use(state, 'bruno', 'skill2', 'tide').state;
    expect(state.allies[0].native?.cover?.targets).toEqual(['tide']);
    const solo = use(encounter('bruno'), 'bruno', 'skill2', 'bruno');
    expect(solo.state.allies[0].native?.reduction?.fraction).toBe(.2);
  });

  it('Disciple commands a selected ally, expires after one action, and never grants permanent Attack stats', () => {
    let state = use(encounter('disciple', 'ember', 'tide'), 'disciple', 'skill1', 'ember').state;
    expect(state.allies[1].attackBoost).toBeUndefined();
    const strike = use(state, 'ember', 'light');
    expect(strike.events.find(event => event.kind === 'damage')?.amount).toBe(130);
    expect(strike.state.allies[1].native?.instruction).toBeUndefined();
    state = use(state, 'disciple', 'skill2', 'tide').state;
    const barrier = use(state, 'tide', 'skill2', 'ember');
    expect(barrier.state.allies[1].shield).toBe(1000 * nativeBalance.tizu.shelter * 1.35);
    expect(barrier.state.allies[2].native?.instruction).toBeUndefined();
  });

  it('Disciple self-instruction activates after granting and a wrong-type action consumes without benefit', () => {
    let state = use(encounter('disciple', 'ember'), 'disciple', 'skill1', 'disciple').state;
    expect(state.allies[0].native?.instruction?.kind).toBe('strike');
    expect(use(state, 'disciple', 'light').state.allies[0].native?.instruction).toBeUndefined();
    state = use(state, 'disciple', 'skill2', 'ember').state;
    const wrong = use(state, 'ember', 'light');
    expect(wrong.events.find(event => event.kind === 'damage')?.amount).toBe(100);
    expect(wrong.state.allies[1].native?.instruction).toBeUndefined();
  });

  it('Disciple replacing an ordinary Instruction discards the old recipient rather than commanding two allies', () => {
    let state = use(encounter('disciple', 'ember', 'tide'), 'disciple', 'skill1', 'ember').state;
    state = endTurn(state).state;
    state = use(state, 'disciple', 'skill2', 'tide').state;
    expect(state.allies[1].native?.instruction).toBeUndefined();
    expect(state.allies[2].native?.instruction?.kind).toBe('shelter');
  });

  it('Aurora forecasts specials and retains a stronger single-target Seal without damage or Weaken', () => {
    let state = encounter('aurora', 'ember');
    expect(nativeForecast(state, state.allies[0])[0]).toContain('enemy phase 2');
    const seal = use(state, 'aurora', 'skill1');
    expect(seal.events.some(event => event.kind === 'damage')).toBe(false);
    expect(seal.state.enemies[0].weakened).toBe(0);
    state = use(seal.state, 'aurora', 'skill2').state;
    expect(state.allies[0].native?.seals?.[state.enemies[0].id]?.fraction).toBe(.4);
    expect(state.allies[0].native?.seals?.[state.enemies[1].id]?.fraction).toBe(.25);
    expect(nativeIncomingMultiplier(state, state.enemies[0], state.allies[1], 'light', [])).toBe(1);
  });

  it('Razor has a personal defensive stance, not a team barrier or flat Defense passive', () => {
    const state = encounter('razor', 'ember');
    const result = use(state, 'razor', 'skill2');
    expect(result.state.allies.every(unit => unit.shield === 0)).toBe(true);
    expect(result.state.allies[0].native?.bastion).toEqual({ throughPhase: state.round, loss: 0 });
    expect(nativeIncomingMultiplier(result.state, result.state.enemies[0], result.state.allies[0], 'light', [])).toBeCloseTo(.7);
    const ordinary = use(encounter('razor'), 'razor', 'skill1');
    expect(ordinary.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 1.6 * nativeBalance.skillDamageScale, 0, false));
    expect(ordinary.events.some(event => event.nativeKind === 'revenge')).toBe(false);
  });

  it('new encounters clear field investments without mutating a Settings clone or retaining encounter gear charges', () => {
    const state = use(encounter('atmoso'), 'atmoso', 'skill2').state;
    state.allies[0].native!.cyclone!.gusts = 2;
    state.allies[0].conduitCharges = { normalMomentum: true };
    const settings = structuredClone(state);
    settings.allies[0].native!.cyclone!.gusts = 1;
    expect(state.allies[0].native?.cyclone?.gusts).toBe(2);
    state.phase = 'cleared';
    state.enemies.forEach(enemy => { enemy.hp = 0; });
    const next = nextWave(state).state;
    expect(next.allies[0].native?.cyclone).toBeUndefined();
    expect(next.allies[0].conduitCharges?.normalMomentum).toBeUndefined();
  });
});
