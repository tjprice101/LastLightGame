import { describe, expect, it } from 'vitest';
import { resolveFighter } from '../content/combat';
import { elementalEffectFamilies } from '../content/elemental-effects';
import { enemyDebuffs } from '../presentation/battle-status';
import { act, createBattle, damageAmount, endTurn, nextWave } from './battle';

const availablePilots = ['atmoso', 'elise', 'vaelor', 'aurora', 'bliss', 'bruno', 'disciple', 'razor', 'nerithe', 'orvella'] as const;

function encounter(...roster: string[]) {
  const state = createBattle(1729, roster);
  state.enemies = [state.enemies[0]];
  for (const ally of state.allies) {
    ally.shatter = ally.stats.shatterCapacity;
    ally.stats.crit = 0;
  }
  const enemy = state.enemies[0];
  enemy.hp = enemy.stats.health = 1_000_000;
  enemy.stats.defense = 0;
  enemy.stats.damage = 32;
  enemy.stats.crit = 0;
  return state;
}

describe('consolidated flagship effects', () => {
  it('limits shared counters to the approved pilots and leaves the removed flagship loops native-free', () => {
    expect((['atmoso', 'elise', 'vaelor'] as const).map((id) => resolveFighter(id).pilot)).toEqual(['tempest', 'tempest', 'tempest']);
    expect(resolveFighter('bliss').pilot).toBe('bloom');
    for (const id of availablePilots.slice(3, 4).concat(availablePilots.slice(5))) {
      expect(resolveFighter(id).pilot).toBeUndefined();
    }
    expect(elementalEffectFamilies.tempest.element).toBe('atmospheric');
    expect(elementalEffectFamilies.focus.element).toBe('tranquilitic');
  });

  it('defines the live pilot applicability for every authored Element-Bearer, including starter, Rose and War exceptions', () => {
    expect((['ember', 'tide', 'sprout', 'rosetta', 'thornia', 'crinso', 'atmoso', 'aurora',
      'bliss', 'bruno', 'disciple', 'elise', 'razor', 'nerithe', 'orvella', 'vaelor'] as const)
      .map((id) => resolveFighter(id).pilot)).toEqual([
      'ember', 'ward', 'bloom', 'rose-grace', 'thorn-aegis', 'rose-duality', 'tempest', undefined,
      'bloom', undefined, undefined, 'tempest', undefined, undefined, undefined, 'tempest',
    ]);
  });

  it.each([
    { id: 'atmoso', action: 'skill1' as const },
    { id: 'elise', action: 'skill1' as const },
    { id: 'vaelor', action: 'skill2' as const },
  ])('$id earns Tempest from any effective critical direct activation and spends before the same activation can earn again', ({ id, action }) => {
    const state = encounter(id);
    const actor = state.allies[0];
    actor.stats.crit = 1;
    const ability = actor.kit!.abilities[action];
    actor.pilot = { tempest: 3 };
    const before = structuredClone(state);
    const ordinary = act(state, actor.id, action, state.enemies[0].id);
    const baseline = structuredClone(before);
    baseline.allies[0].kit!.pilot = undefined;
    const withoutPilot = act(baseline, actor.id, action, state.enemies[0].id);
    expect(ordinary.events.find((event) => event.kind === 'damage')?.amount).toBe(
      damageAmount(actor.stats.damage, ability.strength.damageMultiplier! * 1.24, 0, true, actor.stats.critMultiplier),
    );
    expect(ordinary.state.allies[0].pilot?.tempest).toBe(1);
    expect(ordinary.events.findIndex((event) => event.message.includes('spends 3 Atmospheric Charge')))
      .toBeLessThan(ordinary.events.findIndex((event) => event.kind === 'damage'));
    expect(ordinary.state.seed).toBe(withoutPilot.state.seed);
    expect(state).toEqual(before);
  });

  it('spends Tempest across an AoE then awards only one new stack from multiple existing critical rolls', () => {
    const state = encounter('vaelor');
    const actor = state.allies[0];
    const second = structuredClone(state.enemies[0]);
    second.id = 'second-target';
    state.enemies.push(second);
    actor.stats.crit = 1;
    actor.pilot = { tempest: 3 };
    const baseline = structuredClone(state);
    baseline.allies[0].pilot = undefined;
    const result = act(state, actor.id, 'skill2', state.enemies[0].id);
    const plain = act(baseline, actor.id, 'skill2', baseline.enemies[0].id);
    expect(result.events.filter((event) => event.kind === 'damage')).toHaveLength(2);
    expect(result.events.filter((event) => event.message.includes('gains Atmospheric Charge'))).toHaveLength(1);
    expect(result.state.allies[0].pilot?.tempest).toBe(1);
    expect(result.state.seed).toBe(plain.state.seed);
    expect(result.events.findIndex((event) => event.message.includes('spends 3 Atmospheric Charge')))
      .toBeLessThan(result.events.findIndex((event) => event.kind === 'damage'));
    for (const hit of result.events.filter((event) => event.kind === 'damage')) {
      expect(hit.amount).toBe(damageAmount(actor.stats.damage, 1.4 * 1.24, 0, true, actor.stats.critMultiplier));
    }
  });

  it('counts effective critical shield absorption for Tempest but Last Flare never earns it', () => {
    const shielded = encounter('elise');
    shielded.allies[0].stats.crit = 1;
    shielded.enemies[0].shield = 100_000;
    const absorbed = act(shielded, 'elise', 'light', shielded.enemies[0].id);
    expect(absorbed.state.allies[0].pilot?.tempest).toBe(1);

    const ultimate = encounter('vaelor');
    ultimate.allies[0].stats.crit = 1;
    ultimate.allies[0].pilot = { tempest: 2 };
    const flare = act(ultimate, 'vaelor', 'ultimate', ultimate.enemies[0].id);
    expect(flare.state.allies[0].pilot?.tempest).toBe(0);
    expect(flare.events.some((event) => event.message.includes('gains Atmospheric Charge'))).toBe(false);
    expect(flare.state.allies[0].recoverThrough).toBe(ultimate.round + 1);
  });

  it('keeps Aurora authored damage and Weaken with no native pilot, marks, or Precision bonus', () => {
    const state = encounter('aurora', 'bliss');
    const actor = state.allies[0];
    expect(actor.pilot).toBeUndefined();
    const first = act(state, actor.id, 'skill1', state.enemies[0].id);
    expect(first.state.enemies[0].pilot).toBeUndefined();
    expect(first.state.enemies[0].weakenFraction).toBe(.3);
    expect(first.events.some((event) => event.elementalEffect?.family === 'focus')).toBe(false);
    expect(enemyDebuffs(first.events.find((event) => event.kind === 'damage')!.debuffs!)).not.toContain('Focus');

    const phase = endTurn(first.state).state;
    phase.allies[0].shatter = 100;
    const before = structuredClone(phase);
    const result = act(phase, actor.id, 'ultimate', phase.enemies[0].id);
    const baseline = structuredClone(before);
    const plain = act(baseline, actor.id, 'ultimate', baseline.enemies[0].id);
    expect(result.state.enemies[0].pilot).toBeUndefined();
    expect(result.state.allies.every((ally) => ally.pilot === undefined)).toBe(true);
    expect(result.events.find((event) => event.kind === 'damage')?.amount).toBe(plain.events.find((event) => event.kind === 'damage')?.amount);
    expect(result.state.seed).toBe(plain.state.seed);
    expect(result.state.enemies[0].weakenFraction).toBe(.4);
    expect(resolveFighter('aurora').abilities.skill1.description).toContain('by 30%');
  });

  it('preserves Disciple active buff source/expiry and removes only the additional Concord stack loop', () => {
    const state = encounter('disciple', 'elise');
    const skill = act(state, 'disciple', 'skill1', state.enemies[0].id);
    expect(skill.state.allies[1].attackBoost).toEqual({ fraction: .2, throughRound: state.round + 1, sourceId: 'disciple' });
    expect(skill.state.allies[0].pilot).toBeUndefined();
    expect(skill.state.allies[1].pilot).toBeUndefined();
    expect(endTurn(endTurn(skill.state).state).state.allies[1].attackBoost).toBeUndefined();
    const kit = resolveFighter('disciple');
    expect(kit.abilities.skill1.strength.attackBoostFraction).toBe(.2);
    expect(kit.abilities.skill2.strength.attackBoostFraction).toBe(.3);
    expect(kit.abilities.ultimate.strength.attackBoostFraction).toBe(.4);
  });

  it('keeps Bloom spending on Bliss distinct while the new cap-three counter is shared with Flora', () => {
    const state = encounter('bliss');
    const actor = state.allies[0];
    actor.pilot = { bloom: 3 };
    const result = act(state, actor.id, 'ultimate', state.enemies[0].id);
    expect(result.state.allies[0].shield).toBe(actor.stats.health * .15);
    expect(result.state.allies[0].pilot?.bloom).toBe(0);
    expect(result.state.allies[0].recoverThrough).toBe(state.round + 1);
    expect(resolveFighter('bliss').abilities.skill1.description).toContain('+8% outgoing damage each');
    expect(resolveFighter('bliss').abilities.ultimate.description).toContain("5% of this caster's maximum Health each");
  });

  it('creates fresh shared state on a new encounter and preserves independent active Conduit effects', () => {
    const state = encounter('atmoso');
    state.allies[0].pilot = { tempest: 2 };
    state.allies[0].conduitCharges = { normalMomentum: true };
    state.phase = 'cleared';
    state.enemies.forEach((enemy) => { enemy.hp = 0; });
    const next = nextWave(state).state;
    expect(next.allies[0].pilot).toBeUndefined();
    expect(next.allies[0].conduitCharges?.normalMomentum).toBe(true);
    expect(state.allies[0].pilot?.tempest).toBe(2);
  });
});
