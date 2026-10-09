import { describe, expect, it } from 'vitest';
import { resolveFighter } from '../content/combat';
import { act, createBattle, damageAmount, endTurn, nextWave, type BattleEvent } from './battle';
import { pilotAfterAbility, pilotBurnDamage, pilotCriticalBonus, pilotIncomingMultiplier, pilotNewTurn, pilotOutgoingBonus, pilotPrepareVerdict, pilotUltimateShield, pilotVerdictHit } from './kit-pilots';

describe('bounded character kit pilots', () => {
  it('grants at most one personal Ember Seal per effective owned Burn phase, capped at three; Skill2 spends', () => {
    const state = createBattle();
    const actor = state.allies[0];
    const events: BattleEvent[] = [];
    pilotBurnDamage(state, actor, 0, events);
    expect(actor.pilot).toBeUndefined();
    for (let round = 1; round <= 5; round++) {
      state.round = round;
      pilotBurnDamage(state, actor, 20, events);
      pilotBurnDamage(state, actor, 20, events);
    }
    expect(actor.pilot?.emberSeals).toBe(3);
    expect(pilotOutgoingBonus(actor, 'skill1', events)).toBe(0);
    expect(actor.pilot?.emberSeals).toBe(3);
    expect(pilotOutgoingBonus(actor, 'skill2', events)).toBeCloseTo(.24);
    expect(pilotOutgoingBonus(actor, 'skill2', events)).toBe(0);
    actor.hp = 0;
    state.round++;
    pilotBurnDamage(state, actor, 20, events);
    expect(actor.pilot?.emberSeals).toBe(0);
  });

  describe('playable pilot integration', () => {
    it('combines personal and Conduit seals in the additive bucket with independent caps/spenders', () => {
      const state = createBattle(7, ['ember']);
      state.enemies = [state.enemies[0]];
      const actor = state.allies[0];
      actor.conduits = ['infernic-cinder-testament', null, null, null, null, null, null, null];
      actor.shatter = 100;
      actor.stats.crit = 0;
      state.enemies[0].hp = state.enemies[0].stats.health = 10000;
      const phase = endTurn(act(state, 'ember', 'skill1', state.enemies[0].id).state);
      expect(phase.state.allies[0].pilot?.emberSeals).toBe(1);
      expect(phase.state.allies[0].conduitCharges?.emberSeals).toBe(1);
      const result = act(phase.state, 'ember', 'skill2', phase.state.enemies[0].id);
      expect(result.events.find((event) => event.kind === 'damage')?.amount).toBe(
        damageAmount(actor.stats.damage, 1.1 * (1 + .05 + .08), state.enemies[0].stats.defense, false),
      );
      expect(result.state.allies[0].pilot?.emberSeals).toBe(0);
      expect(result.state.allies[0].conduitCharges?.emberSeals).toBeUndefined();
    });
    it('Infernis Burn events grant personal seals separately from equipment and one AoE skill spends once without mutating prior state', () => {
      const state = createBattle(7, ['ember']);
      state.enemies = [state.enemies[0]];
      state.enemies[0].hp = state.enemies[0].stats.health = 10000;
      state.allies[0].shatter = 100;
      const first = act(state, 'ember', 'skill1', state.enemies[0].id);
      expect(state.enemies[0].burn.turns).toBe(0);
      const phase = endTurn(first.state);
      expect(phase.state.allies[0].pilot?.emberSeals).toBe(1);
      expect(phase.events.some((event) => event.message.includes('Ember Seal'))).toBe(true);
      const second = structuredClone(phase.state.enemies[0]);
      second.id = 'second';
      phase.state.enemies.push(second);
      const result = act(phase.state, 'ember', 'skill2', phase.state.enemies[0].id);
      expect(phase.state.allies[0].pilot?.emberSeals).toBe(1);
      expect(result.state.allies[0].pilot?.emberSeals).toBe(0);
      expect(result.events.filter((event) => event.message.includes('spends 1 Ember Seals'))).toHaveLength(1);
      expect(result.events.filter((event) => event.kind === 'damage')).toHaveLength(2);
    });

    it('Aurora skill events carry owned marks, consume them before AoE and apply a bounded team Precision snapshot', () => {
      const state = createBattle(7, ['aurora', 'bliss']);
      state.enemies[0].hp = state.enemies[0].stats.health = 10000;
      state.allies[0].shatter = 100;
      const first = act(state, 'aurora', 'skill1', state.enemies[0].id);
      expect(first.events.find((event) => event.message.includes('applies Verdict'))?.debuffs?.verdict)
        .toEqual([{ bearerId: 'aurora', stacks: 1, turns: 2 }]);
      const phase = endTurn(first.state);
      expect(phase.state.enemies[0].pilot?.verdictMarks?.aurora.turns).toBe(1);
      const result = act(phase.state, 'aurora', 'skill2', phase.state.enemies[0].id);
      expect(result.state.enemies[0].pilot?.verdictMarks?.aurora).toBeUndefined();
      expect(result.state.allies.every((ally) => ally.pilot?.precision?.points === .05)).toBe(true);
      const consume = result.events.findIndex((event) => event.message.includes('spends 1 Verdict'));
      const damage = result.events.findIndex((event) => event.kind === 'damage');
      expect(consume).toBeLessThan(damage);
      expect(result.events[consume].debuffs?.verdict).toBeUndefined();
      expect(result.state.allies[0].readyRound.skill2).toBe(phase.state.round + 3);
    });

    it('Bliss retains offensive Skill2, charges only once across healed allies and spends the charge on the normal Last Flare recovery', () => {
      const state = createBattle(7, ['bliss', 'tide', 'ember']);
      state.enemies = [state.enemies[0]];
      state.enemies[0].hp = state.enemies[0].stats.health = 10000;
      state.allies.forEach((ally) => { ally.hp -= 20; ally.shatter = 100; });
      const first = act(state, 'bliss', 'skill2', state.enemies[0].id);
      expect(first.events.filter((event) => event.kind === 'damage')).toHaveLength(1);
      expect(first.events.filter((event) => event.kind === 'heal')).toHaveLength(3);
      expect(first.state.allies[0].pilot?.restorativeCharges).toBe(1);
      const phase = endTurn(first.state);
      phase.state.allies[0].shatter = phase.state.allies[0].stats.shatterCapacity;
      const result = act(phase.state, 'bliss', 'ultimate', phase.state.enemies[0].id);
      expect(result.state.allies[0].pilot?.restorativeCharges).toBe(0);
      expect(result.state.allies.every((ally) => ally.shield === result.state.allies[0].stats.health * .05)).toBe(true);
      expect(result.state.allies[0].shatter).toBe(0);
      expect(result.state.allies[0].recoverThrough).toBe(phase.state.round + 1);
      const unchanged = structuredClone(result.state);
      expect(() => act(result.state, 'bliss', 'skill2', result.state.enemies[0].id)).toThrow();
      expect(result.state).toEqual(unchanged);
    });

    it('Tizu primes only a surviving shield, consumes protection before absorption and does not consume it for Burn', () => {
      const state = createBattle(7, ['tide']);
      state.enemies = [state.enemies[0]];
      state.enemies[0].stats.damage = 1;
      state.allies[0].shatter = 100;
      const first = act(state, 'tide', 'skill2', state.enemies[0].id);
      const phase = endTurn(first.state);
      expect(phase.state.allies[0].pilot?.shelterWard?.fraction).toBe(.1);
      const next = endTurn(phase.state);
      expect(next.events.filter((event) => event.message.includes('consumes Shelter'))).toHaveLength(1);
      expect(next.state.allies[0].hp).toBe(state.allies[0].hp);
      expect(next.state.allies[0].pilot?.shelterWard?.fraction).toBe(.1);
    });

    it('Continue uses fresh encounter pilot state but retains character kit/progress; Settings clones preserve independent pilot state', () => {
      const state = createBattle(7, ['ember', 'aurora', 'bliss']);
      state.allies[0].pilot = { emberSeals: 3 };
      state.allies[1].pilot = { precision: { points: .1, throughRound: 10 } };
      state.allies[2].pilot = { restorativeCharges: 3 };
      const snapshot = structuredClone(state);
      snapshot.allies[0].pilot!.emberSeals = 1;
      expect(state.allies[0].pilot?.emberSeals).toBe(3);
      state.enemies.forEach((enemy) => { enemy.hp = 0; });
      state.phase = 'cleared';
      const continued = nextWave(state).state;
      expect(continued.allies.every((ally) => ally.pilot === undefined)).toBe(true);
      expect(continued.allies.map((ally) => ally.kit?.pilot)).toEqual(['ember-seals', 'verdict', 'restoration']);
    });
  });

  it('owns and caps Verdict Marks, refreshes a two-phase clock, spends only own living-target marks once per activation', () => {
    const state = createBattle(1, ['aurora', 'tide']);
    const actor = state.allies[0];
    const enemy = state.enemies[0];
    const other = structuredClone(actor);
    other.id = 'other-owner';
    const events: BattleEvent[] = [];
    pilotVerdictHit(actor, enemy, 'skill2', events);
    expect(enemy.pilot).toBeUndefined();
    for (let index = 0; index < 3; index++) pilotVerdictHit(actor, enemy, 'skill1', events);
    pilotVerdictHit(other, enemy, 'skill1', events);
    expect(enemy.pilot?.verdictMarks?.aurora).toEqual({ stacks: 2, turns: 2 });
    pilotPrepareVerdict(state, actor, 'skill2', events);
    expect(enemy.pilot?.verdictMarks?.aurora).toBeUndefined();
    expect(enemy.pilot?.verdictMarks?.['other-owner'].stacks).toBe(1);
    for (const ally of state.allies) expect(pilotCriticalBonus(ally, state.round)).toBeCloseTo(.1);
    state.round++;
    pilotNewTurn(state, events);
    expect(pilotCriticalBonus(actor, state.round)).toBeCloseTo(.1);
    expect(enemy.pilot?.verdictMarks?.['other-owner'].turns).toBe(1);
    state.round++;
    pilotNewTurn(state, events);
    expect(pilotCriticalBonus(actor, state.round)).toBe(0);
    expect(enemy.pilot?.verdictMarks?.['other-owner']).toBeUndefined();
  });

  it('never marks defeated enemies or spends dead-target marks to gain Precision', () => {
    const state = createBattle(1, ['aurora']);
    const actor = state.allies[0];
    const enemy = state.enemies[0];
    const events: BattleEvent[] = [];
    pilotVerdictHit(actor, enemy, 'skill1', events);
    enemy.hp = 0;
    pilotVerdictHit(actor, enemy, 'skill1', events);
    expect(enemy.pilot?.verdictMarks?.aurora.stacks).toBe(1);
    pilotPrepareVerdict(state, actor, 'skill2', events);
    expect(pilotCriticalBonus(actor, state.round)).toBe(0);
    pilotNewTurn(state, events);
    expect(enemy.pilot?.verdictMarks?.aurora).toBeUndefined();
  });

  it('charges Bliss once for effective healing of another ally, never from overheal/self/other sources; spends before ultimate', () => {
    const state = createBattle(1, ['bliss', 'tide']);
    const actor = state.allies[0];
    const events: BattleEvent[] = [
      { kind: 'heal', source: 'bliss', target: 'bliss', amount: 12, critical: false, message: 'self' },
      { kind: 'heal', source: 'bliss', target: 'tide', amount: 0, critical: false, message: 'overheal' },
      { kind: 'heal', source: 'tide', target: 'tide', amount: 12, critical: false, message: 'other' },
    ];
    pilotAfterAbility(actor, 'skill2', state.allies, events, 0);
    expect(actor.pilot).toBeUndefined();
    for (let activation = 0; activation < 5; activation++) {
      const start = events.length;
      events.push({ kind: 'heal', source: 'bliss', target: 'tide', amount: 12, critical: false, message: 'effective' });
      events.push({ kind: 'heal', source: 'bliss', target: 'tide', amount: 12, critical: false, message: 'same activation' });
      pilotAfterAbility(actor, 'skill2', state.allies, events, start);
    }
    expect(actor.pilot?.restorativeCharges).toBe(3);
    expect(pilotUltimateShield(actor, 'skill2', events)).toBe(0);
    expect(pilotUltimateShield(actor, 'ultimate', events)).toBeCloseTo(actor.stats.health * .15);
    expect(pilotUltimateShield(actor, 'ultimate', events)).toBe(0);
  });

  it('primes Tizu protection only after an effective authored shield survives, refreshes without stacking, consumes at first hit', () => {
    const state = createBattle(1, ['tide', 'ember']);
    const source = state.allies[0];
    const target = state.allies[1];
    const events: BattleEvent[] = [{ kind: 'shield', source: 'tide', target: 'ember', amount: 25, critical: false, message: 'shield' }];
    pilotAfterAbility(source, 'skill2', state.allies, events, 0);
    expect(target.pilot?.shelterWard).toBeUndefined();
    target.shield = 25;
    state.round++;
    pilotNewTurn(state, events);
    pilotNewTurn(state, events);
    expect(target.pilot?.shelterWard).toEqual({ sourceId: 'tide', fraction: .1 });
    expect(pilotIncomingMultiplier(state, target, events)).toBeCloseTo(.9);
    expect(pilotIncomingMultiplier(state, target, events)).toBe(1);
    pilotNewTurn(state, events);
    source.hp = 0;
    expect(pilotIncomingMultiplier(state, target, events)).toBe(1);
    target.shield = 0;
    pilotNewTurn(state, events);
    expect(target.pilot?.shelterSourceId).toBeUndefined();
  });

  it('preserves pilot identities and fixed caps/coefficient text while grown healing stays fractional', () => {
    const base = resolveFighter('bliss');
    const grown = resolveFighter('bliss', { level: 1, evolution: 1 });
    expect(base.pilot).toBe('restoration');
    expect(base.abilities.skill2.strength.healing).toBe(12);
    expect(grown.abilities.skill2.strength.healing).toBeCloseTo(12 * 1.03 ** 3);
    expect(grown.abilities.ultimate.description).toContain('maximum 15%');
    expect(resolveFighter('ember').abilities.skill2.description).toContain('maximum +24%');
    expect(resolveFighter('aurora').abilities.skill2.description).toContain('maximum +10');
    expect(resolveFighter('tide').passive.description).toContain('10% less damage');
    expect(resolveFighter('sprout').pilot).toBe('bloom');
  });
});
