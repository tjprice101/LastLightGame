import { describe, expect, it } from 'vitest';
import { resolveFighter } from '../content/combat';
import { elementalEffectFamilies } from '../content/elemental-effects';
import type { ConduitSlots } from '../content/conduits';
import { unitReadout } from '../presentation/unit-readout';
import { act, createBattle, damageAmount, endTurn, nextWave, type BattleEvent, type BattleState } from './battle';
import { pilotAuthoredShieldAbsorbed, pilotBurnDamage, pilotEffectiveHeal, pilotOutgoingBonus } from './kit-pilots';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(7, roster);
  state.enemies = [state.enemies[0]];
  state.allies.forEach((unit) => { unit.shatter = 100; unit.stats.crit = 0; });
  state.enemies[0].hp = state.enemies[0].stats.health = 100_000;
  state.enemies[0].stats.defense = 0;
  state.enemies[0].stats.damage = 100;
  state.enemies[0].stats.crit = 0;
  return state;
}

describe('shared starter elemental loops', () => {
  it('Infernis earns shared Ember from effective own Burn once per enemy phase and spends once per activation', () => {
    const state = encounter('ember');
    const actor = state.allies[0];
    const first = act(state, actor.id, 'skill1', state.enemies[0].id);
    const phase = endTurn(first.state);
    expect(phase.state.allies[0].pilot?.ember).toBe(1);
    expect(phase.events.some((event) => event.message.includes('gains Infernic Embers'))).toBe(true);
    const events: BattleEvent[] = [];
    for (let round = 1; round <= 4; round++) {
      phase.state.round = round;
      pilotBurnDamage(phase.state, phase.state.allies[0], 10, events);
      pilotBurnDamage(phase.state, phase.state.allies[0], 10, events);
    }
    expect(phase.state.allies[0].pilot?.ember).toBe(3);
    const skill = act(phase.state, actor.id, 'skill2', phase.state.enemies[0].id);
    expect(skill.events.filter((event) => event.message.includes('spends 3 Infernic Embers'))).toHaveLength(1);
    expect(skill.state.allies[0].pilot?.ember).toBe(0);
    expect(skill.events.find((event) => event.kind === 'damage')?.amount)
      .toBe(damageAmount(actor.stats.damage, 1.1 * 1.24, 0, false, actor.stats.critMultiplier));
    expect(resolveFighter('ember').abilities.skill2.description).toContain('Consumes all Infernic Embers');
  });

  it('keeps native Ember and owned Cinder Conduit Ember Seal charges independent with the original additive damage', () => {
    const conduitSlots: ConduitSlots = ['infernic-cinder-testament', null, null, null, null, null, null, null];
    const state = createBattle(7, ['ember'], {}, { ember: conduitSlots });
    state.enemies = [state.enemies[0]];
    state.allies[0].shatter = 100;
    state.allies[0].stats.crit = 0;
    state.enemies[0].hp = state.enemies[0].stats.health = 100_000;
    state.enemies[0].stats.defense = 0;
    state.enemies[0].stats.damage = 0;
    const first = act(state, 'ember', 'skill1', state.enemies[0].id);
    const phase = endTurn(first.state).state;
    expect(phase.allies[0].pilot?.ember).toBe(1);
    expect(phase.allies[0].conduitCharges?.emberSeals).toBe(1);
    phase.allies[0].pilot!.ember = 2;
    const before = structuredClone(phase);
    const hit = act(phase, 'ember', 'skill2', phase.enemies[0].id);
    const actor = phase.allies[0];
    expect(hit.events.find((event) => event.kind === 'damage')?.amount).toBe(
      damageAmount(actor.stats.damage, 1.1 * (1 + .05 + .16), 0, false, actor.stats.critMultiplier),
    );
    expect(hit.state.allies[0].pilot?.ember).toBe(0);
    expect(hit.state.allies[0].conduitCharges?.emberSeals).toBeUndefined();
    expect(phase.allies[0].pilot?.ember).toBe(2);
    expect(state.allies[0].conduitCharges).toBeUndefined();
    expect(before.allies[0].conduitCharges?.emberSeals).toBe(1);
  });

  it('Tizu earns shared Ward from actual authored shield absorption; it no longer primes a shield-survival charge', () => {
    const state = encounter('tide');
    const shield = act(state, 'tide', 'skill2', state.enemies[0].id);
    const phase = endTurn(shield.state);
    expect(phase.state.allies[0].pilot?.ward).toBe(1);
    expect(Object.keys(phase.state.allies[0].pilot ?? {})).not.toContain('shelterWard');
    expect(Object.keys(phase.state.allies[0].pilot ?? {})).not.toContain('shelterSourceId');
    expect(phase.events.some((event) => event.message.includes('Shelter Charge'))).toBe(false);
    expect(unitReadout(phase.state.allies[0])).toContain('Oceanic Protection 1 / 3');
  });

  it('Ward spending strengthens only Tizu authored Weaken/shield values, with refresh and cooldown rules intact', () => {
    const state = encounter('tide');
    state.allies[0].pilot = { ward: 3 };
    const weakened = act(state, 'tide', 'skill1', state.enemies[0].id);
    expect(weakened.state.enemies[0].weakenFraction).toBeCloseTo(.4);
    expect(weakened.state.enemies[0].weakened).toBe(2);
    expect(weakened.state.allies[0].pilot?.ward).toBe(0);
    expect(weakened.state.allies[0].readyRound.skill1).toBe(state.round + 2);

    const ultimateState = encounter('tide');
    ultimateState.allies[0].pilot = { ward: 3 };
    ultimateState.allies[0].shield = 1_000;
    const ultimate = act(ultimateState, 'tide', 'ultimate', ultimateState.enemies[0].id);
    expect(ultimate.state.allies[0].shield).toBe(1_000);
    expect(ultimate.state.allies.slice(1).every((unit) => unit.shield === 35 + 260 * .15)).toBe(true);
    expect(ultimate.state.allies[0].pilot?.ward).toBe(0);
    expect(ultimate.state.allies[0].recoverThrough).toBe(ultimateState.round + 1);
  });

  it('Flora earns shared Bloom from effective authored healing once per round, including self healing', () => {
    const state = encounter('sprout');
    const actor = state.allies[0];
    const events: BattleEvent[] = [];
    pilotEffectiveHeal(state, actor, actor, 0, events);
    pilotEffectiveHeal(state, actor, actor, 10, events);
    pilotEffectiveHeal(state, actor, state.enemies[0], 10, events);
    expect(actor.pilot?.bloom).toBe(1);
    state.round++;
    pilotEffectiveHeal(state, actor, actor, 10, events);
    expect(actor.pilot?.bloom).toBe(2);

    const ability = encounter('sprout');
    ability.allies.forEach((unit) => { unit.hp -= 60; });
    const renewal = act(ability, 'sprout', 'skill2', ability.enemies[0].id);
    expect(renewal.state.allies[0].pilot?.bloom).toBe(1);
    expect(renewal.events.filter((event) => event.message.includes('gains Botanic Renewal'))).toHaveLength(1);
    const passive = endTurn(renewal.state);
    expect(passive.state.allies[0].pilot?.bloom).toBe(2);
  });

  it('Bliss earns Bloom from another ally healing only and spends at her authored rates', () => {
    const state = encounter('bliss', 'ember');
    const actor = state.allies[0];
    const events: BattleEvent[] = [];
    pilotEffectiveHeal(state, actor, actor, 10, events);
    expect(actor.pilot).toBeUndefined();
    pilotEffectiveHeal(state, actor, state.allies[1], 10, events);
    pilotEffectiveHeal(state, actor, state.allies[1], 10, events);
    expect(actor.pilot?.bloom).toBe(1);
    actor.pilot!.bloom = 3;
    const baseline = structuredClone(state);
    baseline.allies[0].pilot = undefined;
    const skill = act(state, actor.id, 'skill1', state.enemies[0].id);
    const plain = act(baseline, actor.id, 'skill1', baseline.enemies[0].id);
    expect(skill.events.find((event) => event.kind === 'damage')?.amount)
      .toBe(plain.events.find((event) => event.kind === 'damage')?.amount! * 1.24);
    expect(skill.state.allies[0].pilot?.bloom).toBe(0);
    expect(resolveFighter('bliss').abilities.skill1.description).toContain('+8% outgoing damage each');
    const ultimateState = encounter('bliss');
    ultimateState.allies[0].pilot = { bloom: 2 };
    const ultimate = act(ultimateState, 'bliss', 'ultimate', ultimateState.enemies[0].id);
    expect(ultimate.state.allies[0].shield).toBe(ultimateState.allies[0].stats.health * .1);
  });

  it('shared counter metadata is typed and each new wave clears native state without clearing independent Conduit charges', () => {
    expect(elementalEffectFamilies.bloom.element).toBe('botanic');
    const state = encounter('sprout');
    state.allies[0].pilot = { bloom: 2, bloomRound: state.round };
    state.allies[0].conduitCharges = { normalMomentum: true };
    state.phase = 'cleared';
    const next = nextWave(state).state;
    expect(next.allies[0].pilot).toBeUndefined();
    expect(next.allies[0].conduitCharges?.normalMomentum).toBe(true);
    expect(unitReadout(next.allies[0], true)).toContain('Botanic Renewal 0 / 3');
  });
});
