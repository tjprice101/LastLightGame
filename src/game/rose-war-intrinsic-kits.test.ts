import { describe, expect, it } from 'vitest';
import { resolveFighter } from '../content/combat';
import { unitReadout } from '../presentation/unit-readout';
import type { StarterId } from '../content/starters';
import { act, createBattle, damageAmount, endTurn, nextWave, type BattleState } from './battle';
import { debuffSnapshot } from './battle-debuffs';
import { pilotAuthoredShieldAbsorbed, pilotBurnDamage, pilotEffectiveHeal } from './kit-pilots';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(1729, roster);
  state.enemies = [state.enemies[0], { ...structuredClone(state.enemies[0]), id: 'other-enemy' }];
  state.enemies.forEach((enemy) => {
    enemy.hp = enemy.stats.health = 1_000_000;
    enemy.stats.defense = 0;
    enemy.stats.damage = 1;
    enemy.stats.crit = 0;
  });
  state.allies.forEach((ally) => { ally.shatter = 100; ally.stats.crit = 0; });
  return state;
}

function starter(id: StarterId): BattleState {
  return encounter(id);
}

describe('Rose specializations and shared Elemental War loops', () => {
  it('retains Rose Grace, Thorn Aegis and Rose Duality as Rose-only named specializations', () => {
    expect(resolveFighter('rosetta').pilot).toBe('rose-grace');
    expect(resolveFighter('thornia').pilot).toBe('thorn-aegis');
    expect(resolveFighter('crinso').pilot).toBe('rose-duality');
    expect(resolveFighter('rosetta').pilot).not.toBe(resolveFighter('sprout').pilot);
    expect(resolveFighter('thornia').pilot).not.toBe(resolveFighter('tide').pilot);
    expect(resolveFighter('crinso').pilot).not.toBe(resolveFighter('ember').pilot);
  });

  it('keeps Rose Grace effective own authored healing, one round guard, and the unchanged Weaken/damage choices', () => {
    const state = encounter('rosetta');
    const actor = state.allies[0];
    const events: Parameters<typeof pilotEffectiveHeal>[4] = [];
    pilotEffectiveHeal(state, actor, actor, 0, events);
    pilotEffectiveHeal(state, actor, actor, 10, events);
    pilotEffectiveHeal(state, actor, actor, 10, events);
    expect(actor.pilot?.roseGrace).toBe(1);
    state.round++;
    pilotEffectiveHeal(state, actor, actor, 10, events);
    expect(actor.pilot?.roseGrace).toBe(2);
    actor.pilot!.roseGrace = 3;
    const skill = act(state, actor.id, 'skill1', state.enemies[0].id);
    expect(skill.state.enemies[0].weakenFraction).toBeCloseTo(.35);
    expect(skill.state.allies[0].pilot?.roseGrace).toBe(0);
    const flareState = encounter('rosetta');
    flareState.allies[0].pilot = { roseGrace: 3 };
    const flare = act(flareState, 'rosetta', 'ultimate', flareState.enemies[0].id);
    expect(flare.events.find((event) => event.kind === 'damage')?.amount)
      .toBe(damageAmount(flareState.allies[0].stats.damage, 3 * 1.3, 0, false, flareState.allies[0].stats.critMultiplier));
    expect(flare.state.allies[0].pilot?.roseGrace).toBe(0);
    expect(unitReadout(flareState.allies[0])).toContain('Rose Grace 3 / 3');
  });

  it('counts actual Rose passive healing once per round but not overheal or Conduit Defense healing', () => {
    const state = encounter('rosetta');
    const actor = state.allies[0];
    state.allies.forEach((ally) => { ally.hp -= 40; });
    const first = endTurn(state).state;
    expect(first.allies[0].pilot?.roseGrace).toBe(1);
    const events: Parameters<typeof pilotEffectiveHeal>[4] = [];
    pilotEffectiveHeal(first, first.allies[0], first.allies[1], 10, events);
    expect(first.allies[0].pilot?.roseGrace).toBe(1);
    first.round++;
    pilotEffectiveHeal(first, first.allies[0], first.allies[1], 10, events);
    expect(first.allies[0].pilot?.roseGrace).toBe(2);
    expect(actor.pilot).toBeUndefined();

    const conduit = createBattle(1729, ['rosetta'], {}, {
      rosetta: ['tranquilitic-kirin-cradle', null, null, null, null, null, null, null],
    });
    conduit.allies[0].hp -= 40;
    const defended = act(conduit, 'rosetta', 'defend', '');
    expect(defended.events.some((event) => event.kind === 'heal')).toBe(true);
    expect(defended.state.allies[0].pilot?.roseGrace).toBeUndefined();
  });

  it('keeps Thorn Aegis sourced to living authored shields and excludes Conduit/unrelated absorption', () => {
    const state = encounter('thornia', 'ember');
    const thornia = state.allies[0];
    const events: Parameters<typeof pilotAuthoredShieldAbsorbed>[3] = [];
    pilotAuthoredShieldAbsorbed(state, thornia.id, 0, events);
    pilotAuthoredShieldAbsorbed(state, thornia.id, 10, events);
    pilotAuthoredShieldAbsorbed(state, thornia.id, 10, events);
    expect(thornia.pilot?.thornAegis).toBe(1);
    state.round++;
    pilotAuthoredShieldAbsorbed(state, state.allies[1].id, 10, events);
    pilotAuthoredShieldAbsorbed(state, thornia.id, 10, events);
    expect(thornia.pilot?.thornAegis).toBe(2);
    thornia.pilot!.thornAegis = 3;
    const skill = act(state, thornia.id, 'skill2', state.enemies[0].id);
    expect(skill.state.enemies[0].weakenFraction).toBeCloseTo(.35);
    expect(skill.state.allies[0].pilot?.thornAegis).toBe(0);
  });

  it('keeps Rose Duality own effective Burn and unchanged coefficients independent from conduit Ember Seals', () => {
    const state = encounter('crinso');
    const actor = state.allies[0];
    actor.conduitCharges = { emberSeals: 2, emberSealRound: state.round };
    const events: Parameters<typeof pilotBurnDamage>[3] = [];
    pilotBurnDamage(state, actor, 0, events);
    pilotBurnDamage(state, actor, 9, events);
    pilotBurnDamage(state, actor, 9, events);
    expect(actor.pilot?.duality).toBe(1);
    expect(actor.conduitCharges.emberSeals).toBe(2);
    actor.pilot!.duality = 3;
    const baseline = structuredClone(state);
    baseline.allies[0].pilot = undefined;
    const skill = act(state, actor.id, 'skill1', state.enemies[0].id);
    const plain = act(baseline, actor.id, 'skill1', baseline.enemies[0].id);
    expect(skill.events.find((event) => event.kind === 'damage')?.amount)
      .toBeGreaterThan(plain.events.find((event) => event.kind === 'damage')?.amount ?? 0);
    expect(actor.kit?.abilities.skill1.description).toContain('+8% outgoing damage each');
    expect(actor.kit?.abilities.ultimate.description).toContain('+12% outgoing damage each');
    expect(skill.state.allies[0].pilot?.duality).toBe(0);
    expect(skill.state.allies[0].conduitCharges?.emberSeals).toBeUndefined();
  });

  it('credits Crinso once for multiple effective Burn targets, then rejects dead or captured ownership', () => {
    const state = encounter('crinso');
    const actor = state.allies[0];
    const inflicted = act(state, actor.id, 'skill2', state.enemies[0].id);
    expect(inflicted.state.enemies.every((enemy) => enemy.burn.damage > 0)).toBe(true);
    const tick = endTurn(inflicted.state);
    expect(tick.state.allies[0].pilot?.duality).toBe(1);
    expect(tick.events.filter((event) => event.message.includes('gains Rose Duality'))).toHaveLength(1);
    const captured = encounter('crinso');
    captured.allies[0].captured = {
      instanceId: 'capture:00000000-0000-0000-0000-000000000002',
      creatureId: 'rosethorn-sanctuary-seed-common', locked: false,
    };
    pilotBurnDamage(captured, captured.allies[0], 9, []);
    expect(captured.allies[0].pilot).toBeUndefined();
    const dead = encounter('crinso');
    dead.allies[0].hp = 0;
    pilotBurnDamage(dead, dead.allies[0], 9, []);
    expect(dead.allies[0].pilot).toBeUndefined();
  });
  it('rejects zero-effect, dead-source and captured-source Rose triggers while preserving precision origin tags', () => {
    const graceState = encounter('rosetta', 'bliss');
    const rosetta = graceState.allies[0];
    const events: Parameters<typeof pilotEffectiveHeal>[4] = [];
    pilotEffectiveHeal(graceState, rosetta, rosetta, 0, events);
    expect(rosetta.pilot).toBeUndefined();
    rosetta.captured = { instanceId: 'capture:00000000-0000-0000-0000-000000000001', creatureId: 'rosethorn-sanctuary-seed-common', locked: false };
    pilotEffectiveHeal(graceState, rosetta, graceState.allies[1], 10, events);
    expect(rosetta.pilot).toBeUndefined();
    delete rosetta.captured;
    rosetta.hp = 0;
    pilotEffectiveHeal(graceState, rosetta, graceState.allies[1], 10, events);
    expect(rosetta.pilot).toBeUndefined();

    const thornState = encounter('thornia');
    const thornia = thornState.allies[0];
    const shieldEvents: Parameters<typeof pilotAuthoredShieldAbsorbed>[3] = [];
    pilotAuthoredShieldAbsorbed(thornState, thornia.id, 0, shieldEvents);
    thornia.hp = 0;
    pilotAuthoredShieldAbsorbed(thornState, thornia.id, 10, shieldEvents);
    expect(thornia.pilot).toBeUndefined();

    const crinsoState = encounter('crinso');
    const crinso = crinsoState.allies[0];
    const burnEvents: Parameters<typeof pilotBurnDamage>[3] = [];
    pilotBurnDamage(crinsoState, crinso, 0, burnEvents);
    crinso.hp = 0;
    pilotBurnDamage(crinsoState, crinso, 9, burnEvents);
    expect(crinso.pilot).toBeUndefined();

    const marked = encounter('rosetta');
    marked.enemies[0].weakened = 2;
    marked.enemies[0].weakenFraction = .2;
    marked.enemies[0].weakenOrigin = 'rose';
    expect(debuffSnapshot(marked.enemies[0]).elementalEffects).toContainEqual({
      family: 'suppression', kind: 'weaken', origin: 'rose', source: 'authored-weaken',
    });
  });

  it('Nerithe retains only Normal Attack fixed Gauge and authored Weaken, with no per-character counter', () => {
    const state = encounter('nerithe');
    const actor = state.allies[0];
    actor.shatter = 20;
    const normal = act(state, actor.id, 'light', state.enemies[0].id);
    expect(normal.state.allies[0].shatter).toBe(45);
    expect(normal.state.allies[0].pilot).toBeUndefined();
    const skill = act({ ...normal.state, allies: normal.state.allies.map((ally) => ({ ...ally, spent: false, shatter: 100 })) },
      actor.id, 'skill1', normal.state.enemies[0].id);
    expect(skill.state.enemies[0].weakenFraction).toBe(.2);
    expect(skill.state.allies[0].pilot).toBeUndefined();
  });

  it('Orvella has no Foundation counter while authored Defense shields and cooldowns still behave', () => {
    const state = encounter('orvella');
    const defense = act(state, 'orvella', 'defend', '');
    expect(defense.state.allies[0].pilot).toBeUndefined();
    expect(resolveFighter('orvella').abilities.skill2.strength.shield).toBe(40);
    expect(resolveFighter('orvella').abilities.ultimate.strength.shield).toBe(65);
  });

  it('Vaelor shares Tempest, spends Skill2 before earning from its existing critical outcome; ultimate never earns', () => {
    const state = encounter('vaelor');
    const actor = state.allies[0];
    actor.stats.crit = 1;
    actor.pilot = { tempest: 3 };
    const result = act(state, actor.id, 'skill2', state.enemies[0].id);
    expect(result.state.allies[0].pilot?.tempest).toBe(1);
    expect(result.events.find((event) => event.kind === 'damage')?.amount)
      .toBe(damageAmount(actor.stats.damage, 1.4 * 1.24, 0, true, actor.stats.critMultiplier));
    expect(result.events.findIndex((event) => event.message.includes('spends 3 Atmospheric Charge')))
      .toBeLessThan(result.events.findIndex((event) => event.kind === 'damage'));
    const afterSkill = endTurn(result.state).state;
    afterSkill.allies[0].spent = false;
    afterSkill.allies[0].shatter = 100;
    afterSkill.allies[0].recoverThrough = 0;
    const ultimate = act(afterSkill, actor.id, 'ultimate', afterSkill.enemies[0].id);
    expect(ultimate.state.allies[0].pilot?.tempest).toBe(0);
    expect(ultimate.events.some((event) => event.message.includes('gains Atmospheric Charge'))).toBe(false);
  });

  it('native shared and Rose resource ownership excludes captured copies; Settings clones and new encounters remain isolated', () => {
    const state = encounter('atmoso', 'rosetta', 'thornia');
    const crinsoState = encounter('crinso');
    state.allies[0].pilot = { tempest: 2 };
    state.allies[1].pilot = { roseGrace: 2 };
    state.allies[2].pilot = { thornAegis: 2 };
    crinsoState.allies[0].pilot = { duality: 2 };
    const snapshot = structuredClone(state);
    snapshot.allies[0].pilot!.tempest = 1;
    expect(state.allies[0].pilot?.tempest).toBe(2);
    state.phase = 'cleared';
    state.enemies.forEach((enemy) => { enemy.hp = 0; });
    const next = nextWave(state).state;
    expect(next.allies.every((ally) => ally.pilot === undefined)).toBe(true);
    expect(state.allies[1].pilot?.roseGrace).toBe(2);
    expect(crinsoState.allies[0].pilot?.duality).toBe(2);
  });
});
