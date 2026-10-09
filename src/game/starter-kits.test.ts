import { describe, expect, it } from 'vitest';
import { resolveFighter } from '../content/combat';
import { act, createBattle, createDungeonBattle, damageAmount, endTurn, nextStage, nextWave, type BattleEvent, type BattleState } from './battle';
import { pilotEffectiveHeal, pilotPrepareStarter, pilotShieldAbsorbed } from './kit-pilots';

function encounter(): BattleState {
  const state = createBattle(7, ['ember', 'tide', 'sprout']);
  state.allies.forEach((unit) => { unit.shatter = 100; unit.stats.crit = 0; });
  state.enemies.forEach((unit) => {
    unit.hp = unit.stats.health = 100000;
    unit.stats.crit = 0;
    unit.stats.damage = 1;
  });
  return state;
}

describe('intrinsic starter kit loops without Conduits', () => {
  it('spends Infernis seals once across Last Flare AoE and ignites survivors with the authored snapshot', () => {
    const state = encounter();
    const actor = state.allies[0];
    actor.pilot = { emberSeals: 3 };
    const result = act(state, actor.id, 'ultimate', state.enemies[0].id);
    const hits = result.events.filter((event) => event.kind === 'damage');
    expect(hits).toHaveLength(state.enemies.length);
    for (const hit of hits) {
      const target = state.enemies.find((enemy) => enemy.id === hit.target)!;
      expect(hit.amount).toBe(damageAmount(actor.stats.damage, 2.8 * 1.36, target.stats.defense, false));
    }
    expect(result.state.enemies.every((enemy) => enemy.burn.damage === 6 && enemy.burn.turns === 2 && enemy.burn.sourceId === actor.id)).toBe(true);
    expect(result.events.filter((event) => event.message.includes('spends 3 Ember Seals'))).toHaveLength(1);
    expect(result.state.allies[0].pilot?.emberSeals).toBe(0);
    expect(actor.pilot.emberSeals).toBe(3);
    expect(result.state.allies[0].recoverThrough).toBe(state.round + 1);
    expect(result.state.seed).not.toBe(state.seed);
  });

  it('earns Tide from effective direct absorption once per phase across recipients, caps at three and requires a living owner', () => {
    const state = encounter();
    const events: BattleEvent[] = [];
    pilotShieldAbsorbed(state, 'tide', 0, events);
    pilotShieldAbsorbed(state, 'ember', 10, events);
    expect(state.allies[1].pilot).toBeUndefined();
    for (let round = 1; round <= 5; round++) {
      state.round = round;
      pilotShieldAbsorbed(state, 'tide', 10, events);
      pilotShieldAbsorbed(state, 'tide', 10, events);
    }
    expect(state.allies[1].pilot?.tideStacks).toBe(3);
    expect(events).toHaveLength(3);
    state.allies[1].hp = 0;
    state.allies[1].pilot = {};
    state.round++;
    pilotShieldAbsorbed(state, 'tide', 10, events);
    expect(state.allies[1].pilot).toEqual({});
  });

  it('Tizu authored shields build Tide in combat; repeated shielding preserves stacks and Skill1 spends for stronger Weaken', () => {
    const state = encounter();
    const first = act(state, 'tide', 'skill2', state.enemies[0].id);
    const phase = endTurn(first.state).state;
    expect(phase.allies[1].pilot?.tideStacks).toBe(1);
    expect(phase.allies.some((unit) => unit.pilot?.shelterWard)).toBe(true);
    phase.allies[1].pilot!.tideStacks = 3;
    const result = act(phase, 'tide', 'skill1', phase.enemies[0].id);
    expect(result.state.enemies[0].weakenFraction).toBeCloseTo(.4);
    expect(result.state.enemies[0].weakened).toBe(2);
    expect(result.state.allies[1].pilot?.tideStacks).toBe(0);
    expect(phase.allies[1].pilot?.tideStacks).toBe(3);
    expect(result.state.allies[1].readyRound.skill1).toBe(phase.round + 2);
  });

  it('Last Flare adds Tizu stack shield to base before a refresh, never adds to existing shields or double spends', () => {
    const state = encounter();
    const actor = state.allies[1];
    actor.pilot = { tideStacks: 3 };
    state.allies[0].shield = 1000;
    const result = act(state, 'tide', 'ultimate', state.enemies[0].id);
    expect(result.state.allies[0].shield).toBe(1000);
    expect(result.state.allies[1].shield).toBeCloseTo(35 + actor.stats.health * .15);
    expect(result.state.allies[2].shield).toBeCloseTo(35 + actor.stats.health * .15);
    expect(result.state.allies[1].pilot?.tideStacks).toBe(0);
    expect(result.events.filter((event) => event.message.includes('spends 3 Tide'))).toHaveLength(1);
  });

  it('Tide Weaken plus Conduits caps at 60%, without changing the separate two-attack clock', () => {
    const state = encounter();
    const actor = state.allies[1];
    actor.pilot = { tideStacks: 3 };
    actor.kit!.abilities.skill1.strength.weakenFraction = .5;
    actor.conduits = ['tension-governor', null, null, null, null, null, null, null];
    const result = act(state, 'tide', 'skill1', state.enemies[0].id);
    expect(result.state.enemies[0].weakenFraction).toBe(.6);
    expect(endTurn(result.state).state.enemies[0].weakened).toBe(1);
  });

  it('Bloom requires effective Flora healing, grants once per round across passive/active recipients, caps and never grants to dead sources', () => {
    const state = encounter();
    const actor = state.allies[2];
    const events: BattleEvent[] = [];
    pilotEffectiveHeal(state, actor, 0, events);
    pilotEffectiveHeal(state, state.allies[1], 10, events);
    expect(actor.pilot).toBeUndefined();
    for (let round = 1; round <= 5; round++) {
      state.round = round;
      pilotEffectiveHeal(state, actor, 10, events);
      pilotEffectiveHeal(state, actor, 10, events);
    }
    expect(actor.pilot?.blooms).toBe(3);
    expect(events).toHaveLength(3);
    actor.hp = 0;
    actor.pilot = {};
    state.round++;
    pilotEffectiveHeal(state, actor, 10, events);
    expect(actor.pilot).toEqual({});
  });

  it('Flora Renewal heals, builds one Bloom and grants a refresh-only attack buff to living allies', () => {
    const state = encounter();
    state.allies.forEach((unit) => { unit.hp -= 50; });
    state.allies[0].attackBoost = { fraction: .2, throughRound: state.round + 1 };
    const result = act(state, 'sprout', 'skill2', state.enemies[0].id);
    expect(result.state.allies[2].pilot?.blooms).toBe(1);
    expect(result.events.filter((event) => event.message.includes('gains a Bloom'))).toHaveLength(1);
    expect(result.state.allies[0].attackBoost?.fraction).toBe(.2);
    expect(result.state.allies[1].attackBoost).toEqual({ fraction: .1, throughRound: state.round + 1 });
    const next = endTurn(result.state).state;
    expect(next.allies[2].pilot?.blooms).toBe(2);
    expect(next.allies[1].attackBoost?.fraction).toBe(.1);
    expect(endTurn(next).state.allies[1].attackBoost).toBeUndefined();
    const overheal = act(encounter(), 'sprout', 'skill2', state.enemies[0].id);
    expect(overheal.state.allies[2].pilot).toBeUndefined();
  });

  it('Flora spends Bloom for stronger Briar Shot without changing crit chance, cost or cooldown', () => {
    const state = encounter();
    const actor = state.allies[2];
    actor.pilot = { blooms: 3, bloomRound: state.round };
    actor.kit!.abilities.skill1.strength.critBonus = 0;
    const result = act(state, 'sprout', 'skill1', state.enemies[0].id);
    expect(result.events.find((event) => event.kind === 'damage')?.amount).toBe(
      damageAmount(actor.stats.damage, 1.5 * 1.3, state.enemies[0].stats.defense, false));
    expect(result.state.allies[2].pilot?.blooms).toBe(0);
    expect(result.state.allies[2].shatter).toBe(75);
    expect(result.state.allies[2].readyRound.skill1).toBe(state.round + 2);
  });

  it('Flora spends Bloom once for the whole ultimate heal, keeps fractions and cannot recharge twice in the same round', () => {
    const state = encounter();
    state.allies.forEach((unit) => { unit.hp -= 100; });
    const actor = state.allies[2];
    actor.pilot = { blooms: 3, bloomRound: state.round };
    const result = act(state, 'sprout', 'ultimate', state.enemies[0].id);
    expect(result.events.filter((event) => event.kind === 'heal').map((event) => event.amount)).toEqual([55 * 1.45, 55 * 1.45, 55 * 1.45]);
    expect(result.state.allies[2].pilot?.blooms).toBe(0);
    expect(result.state.allies[2].recoverThrough).toBe(state.round + 1);
    expect(result.events.filter((event) => event.message.includes('spends 3 Blooms'))).toHaveLength(1);
  });

  it('rejected actions preserve all stacks and prior snapshots; Normal/Defense do not spend', () => {
    for (const id of ['tide', 'sprout'] as const) {
      const state = encounter();
      const actor = state.allies.find((unit) => unit.id === id)!;
      actor.pilot = { tideStacks: 3, blooms: 3 };
      actor.shatter = 0;
      const prior = structuredClone(state);
      expect(() => act(state, id, 'skill1', state.enemies[0].id)).toThrow();
      expect(state).toEqual(prior);
      expect(act(state, id, 'light', state.enemies[0].id).state.allies.find((unit) => unit.id === id)!.pilot).toEqual(actor.pilot);
      expect(act(state, id, 'defend', '').state.allies.find((unit) => unit.id === id)!.pilot).toEqual(actor.pilot);
    }
  });

  it('prepares only the matching starter mechanic, and staged/Adventure Continue reset stacks', () => {
    const state = encounter();
    const events: BattleEvent[] = [];
    expect(pilotPrepareStarter(state.allies[0], 'ultimate', events)).toEqual({ damage: 0, weaken: 0, shield: 0, healing: 1 });
    state.allies[1].pilot = { tideStacks: 3 };
    state.allies[2].pilot = { blooms: 3 };
    state.enemies.forEach((unit) => { unit.hp = 0; });
    state.phase = 'cleared';
    expect(nextWave(state).state.allies.every((unit) => !unit.pilot?.tideStacks && !unit.pilot?.blooms)).toBe(true);
    const staged = createDungeonBattle('infernic', 1, 7, 'tide', { level: 0, evolution: 1 }, ['tide']);
    staged.allies[0].pilot = { tideStacks: 3 };
    staged.enemies.forEach((unit) => { unit.hp = 0; });
    staged.phase = 'cleared';
    expect(nextStage(staged, { tide: { level: 0, evolution: 1 } }).state.allies[0].pilot).toBeUndefined();
  });

  it('describes exact intrinsic triggers/spenders and bounded grown buffs with no gear prerequisite', () => {
    const flora = resolveFighter('sprout', { level: 105, evolution: 6 });
    expect(flora.passive.description).toContain('one Bloom per round');
    expect(flora.abilities.skill1.description).toContain('maximum +30%');
    expect(flora.abilities.ultimate.description).toContain('maximum +45%');
    expect(flora.abilities.skill2.description).toContain('this and next player turn');
    expect(flora.abilities.skill2.strength.attackBoostFraction).toBeLessThanOrEqual(.5);
    expect(resolveFighter('tide').abilities.skill1.description).toContain('Tide stacks');
    expect(resolveFighter('ember').abilities.ultimate.description).toContain('maximum +36%');
  });
});
