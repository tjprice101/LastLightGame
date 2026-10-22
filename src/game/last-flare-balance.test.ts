import { describe, expect, it } from 'vitest';
import { nativeIdentityIds } from '../content/native-identities';
import { type StarterId } from '../content/starters';
import { act, createBattle, damageAmount, endTurn } from './battle';
import { nativeIncomingMultiplier, nativeInstructionDamage, nativeSupportMultiplier } from './native-kits';

function fixture(id: StarterId) {
  const state = createBattle(1729, [id, id === 'ember' ? 'tide' : 'ember']);
  for (const unit of state.allies) {
    unit.stats.health = 1000; unit.hp = 100;
    unit.stats.damage = 100; unit.stats.crit = 0;
    unit.shatter = 100;
  }
  for (const enemy of state.enemies) {
    enemy.stats.health = enemy.hp = 100000;
    enemy.stats.defense = 100; enemy.stats.damage = 1; enemy.stats.crit = 0;
  }
  return state;
}

const previousDirect: Partial<Record<StarterId, number>> = {
  ember: 3.2, atmoso: 3.2, elise: 4.16, bliss: 4, razor: 3.52,
  rosetta: 4.8, thornia: 2.24, crinso: 4.16, nerithe: 4.48, orvella: 3.2, vaelor: 4.16,
};

describe('Last Flare roster-wide potency', () => {
  it.each(nativeIdentityIds)('%s triples direct damage without changing Gauge, recovery or targets', id => {
    const state = fixture(id);
    state.allies[1].spent = true;
    const result = act(state, id, 'ultimate', state.enemies[0].id);
    const coefficient = previousDirect[id];
    const hits = result.events.filter(event => event.kind === 'damage' && !event.nativeKind);
    if (coefficient === undefined) expect(hits).toHaveLength(0);
    else {
      expect(hits.length).toBeGreaterThan(0);
      for (const hit of hits) {
        expect(hit.amount).toBe(damageAmount(100, coefficient * 3, 100, false));
        expect(hit.critical).toBe(false);
      }
    }
    expect(result.state.allies[0].shatter).toBe(0);
    expect(result.state.allies[0].recoverThrough).toBe(state.round + 1);
    expect(state.allies[0].shatter).toBe(100);
  });

  it('raises Tizu shielding and first-hit protection by 1.5, keeping the two-phase clock', () => {
    const state = fixture('tide');
    const result = act(state, 'tide', 'ultimate', state.enemies[0].id);
    for (const ally of result.state.allies) {
      expect(ally.shield).toBe(525);
      const layer = ally.conduitRuntime?.layers?.find(layer => layer.owner === 'tide');
      expect(layer?.firstReduction).toBeCloseTo(.45);
      expect(layer?.expiresAfterPhase).toBe(2);
    }
  });

  it('raises both Flora healing packets by 1.5 without double-scaling harvests or reviving', () => {
    const state = fixture('sprout');
    const result = act(state, 'sprout', 'ultimate', state.enemies[0].id);
    expect(result.events.filter(event => event.kind === 'heal').map(event => event.amount)).toEqual([750, 750]);
    for (const seed of Object.values(result.state.allies[0].native?.seeds ?? {}))
      expect(seed).toMatchObject({ fraction: .975, dueRound: 2, empowered: true });
    for (const ally of result.state.allies) ally.hp = 20;
    const delivery = endTurn(result.state);
    expect(delivery.events.filter(event => event.kind === 'heal' && event.source === 'sprout').map(event => event.amount)).toEqual([975, 975]);
  });

  it('raises Bruno Cover and Shield by 1.5, not their duration', () => {
    const state = fixture('bruno');
    const result = act(state, 'bruno', 'ultimate', state.enemies[0].id);
    expect(result.state.allies[0].shield).toBe(300);
    expect(result.state.allies[0].native?.cover?.fraction).toBeCloseTo(.6);
    expect(result.state.allies[0].native?.cover?.throughPhase).toBe(2);
  });

  it('raises Resolve bonuses by 1.5 without tripling an ally attack buff', () => {
    const state = fixture('disciple');
    const result = act(state, 'disciple', 'ultimate', state.enemies[0].id);
    expect(nativeInstructionDamage(result.state, result.state.allies[1])).toBeCloseTo(1.45);
    expect(nativeSupportMultiplier(result.state, result.state.allies[1])).toBeCloseTo(1.525);
    expect(result.state.allies[1].native?.instruction?.throughRound).toBe(2);
  });

  it('raises Aurora mitigation to75% but leaves non-ultimate attacks unaffected', () => {
    const state = fixture('aurora');
    const result = act(state, 'aurora', 'ultimate', state.enemies[0].id).state;
    expect(nativeIncomingMultiplier(result, result.enemies[0], result.allies[1], 'ultimate', [])).toBe(.25);
    delete result.enemies[0].native;
    expect(nativeIncomingMultiplier(result, result.enemies[0], result.allies[1], 'skill1', [])).toBe(1);
  });

  it('triples Elise recalls and same-target packet once while leaving ordinary recalls unchanged', () => {
    const state = fixture('elise');
    state.allies[0].native = { blades: [state.enemies[0].id, state.enemies[0].id] };
    for (const action of ['skill2', 'ultimate'] as const) {
      const result = act(state, 'elise', action, state.enemies[0].id);
      expect(result.events.filter(event => event.nativeKind === 'recall').map(event => event.amount))
        .toEqual([.9, .9, .6].map(coefficient => damageAmount(100, coefficient * (action === 'ultimate' ? 3 : 1), 100, false)));
    }
  });

  it('triples a Last Flare Cyclone release without changing an ordinary release', () => {
    const state = fixture('atmoso');
    state.allies[0].native = { cyclone: { gusts: 2, phases: 2, contributors: {}, skillPower: 1 } };
    for (const action of ['skill1', 'ultimate'] as const) {
      const result = act(state, 'atmoso', action, state.enemies[0].id);
      for (const event of result.events.filter(event => event.nativeKind === 'cyclone'))
        expect(event.amount).toBe(damageAmount(100, 1.3 * (action === 'ultimate' ? 3 : 1), 100, false));
    }
  });

  it('snapshots tripled Burn and trap damage once for later enemy phases', () => {
    for (const id of ['ember', 'thornia'] as const) {
      const state = fixture(id);
      const cast = act(state, id, 'ultimate', state.enemies[0].id).state;
      const phase = endTurn(cast);
      const kind = id === 'ember' ? 'burn' : 'trap';
      for (const event of phase.events.filter(event => event.nativeKind === kind))
        expect(event.amount).toBe(id === 'ember' ? 135 : damageAmount(100, 2.7, 100, false));
      expect(phase.events.some(event => event.nativeKind === kind)).toBe(true);
    }
  });

  it('raises Bliss Opening critical bonus and Closing healing by1.5', () => {
    const state = fixture('bliss');
    state.seed = 5000;
    const opening = act(state, 'bliss', 'ultimate', state.enemies[0].id);
    expect(opening.events.filter(event => event.kind === 'damage').some(event => event.critical)).toBe(true);
    state.allies[1].spent = true;
    const closing = act(state, 'bliss', 'ultimate', state.enemies[0].id);
    expect(closing.events.filter(event => event.kind === 'heal').map(event => event.amount)).toEqual([150]);
  });

  it('raises Rosetta contributor healing without healing noncontributors', () => {
    const state = fixture('rosetta');
    state.allies[0].native = { quarry: { target: state.enemies[0].id, round: 1, contributors: [state.allies[1].id] } };
    const result = act(state, 'rosetta', 'ultimate', state.enemies[0].id);
    expect(result.events.filter(event => event.kind === 'heal').map(event => event.amount)).toEqual([150, 150]);
  });

  it('triples stored Wounds and Foundation damage without multiplying the stored Attack inside mitigation', () => {
    for (const id of ['razor', 'orvella'] as const) {
      const state = fixture(id);
      state.allies[0].native = id === 'razor' ? { wounds: 200 }
        : { foundation: { durability: 200, maximum: 300, throughPhase: 3 } };
      const result = act(state, id, 'ultimate', state.enemies[0].id);
      const baseAttack = id === 'razor' ? 400 : 200;
      const packets = result.events.filter(event => event.nativeKind === (id === 'razor' ? 'revenge' : 'demolition'));
      expect(packets.length).toBeGreaterThan(0);
      for (const packet of packets) expect(packet.amount).toBe(damageAmount(baseAttack, 3, 100, false));
    }
  });

  it('raises Combo and Survey pierce by1.5 while consuming the original resource counts', () => {
    for (const id of ['crinso', 'nerithe'] as const) {
      const state = fixture(id);
      state.allies[0].native = id === 'crinso' ? { combo: 3, edge: 'crimson' }
        : { survey: { target: state.enemies[0].id, points: 2 } };
      const result = act(state, id, 'ultimate', state.enemies[0].id);
      const coefficient = id === 'crinso' ? 3.95 : 2.8;
      expect(result.events.find(event => event.kind === 'damage')?.amount)
        .toBe(damageAmount(100, coefficient * 1.6 * 3, 55, false));
      if (id === 'crinso') expect(result.state.allies[0].native?.combo).toBe(0);
      else expect(result.state.allies[0].native?.survey?.points).toBe(0);
    }
  });
});
