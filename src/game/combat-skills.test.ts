import { describe, expect, it } from 'vitest';
import { radiantLeaderEffects, radiantStarterKits, resolveRadiantStarterStats,
  type RadiantBearerId, type RadiantLoadout } from '../content/combat-kits';
import type { ConduitId } from '../content/conduits';
import { applyRadiantCombatAction, createRadiantCombat, radiantDirectDamage, radiantSkillStats, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState } from './combat-engine';
import { radiantPressureEnemyAction } from './enemy-pressure';
import type { RadiantPressureEnemy } from './enemy-pressure-encounters';

/** Battle Flurry Phase 3 Step 2a (D-473): skill action, Skill stats, categories, role traits, Health motes, O1/O2. */
function loadout(starter: RadiantBearerId, overrides: Partial<RadiantLoadout> = {}): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 1, convergenceRank: 1, masterId: null, weaponRank: 0, ascension: {}, ...overrides };
}
function gear(...ids: ConduitId[]): RadiantLoadout['gear'] {
  return Array.from({ length: 8 }, (_, index) => ids[index] ? { id: ids[index], rank: 0 } : null);
}
function battle(loadouts: RadiantLoadout[], enemy: { hp?: number; attack?: number; budget?: number } = {}): RadiantCombatState {
  return createRadiantCombat(loadouts, [{ elementId: null, id: 'enemy',
    stats: { hp: enemy.hp ?? 100000, attack: enemy.attack ?? 20, defense: 0, recovery: 0 }, currencyBudget: enemy.budget ?? 100 }], 0);
}
function act(state: RadiantCombatState, action: RadiantCombatAction) {
  return applyRadiantCombatAction(state, action);
}
function charge(state: RadiantCombatState, id: string, amount: number): RadiantCombatState {
  state.gauge.members.find(member => member.id === id)!.charge = amount;
  return state;
}
function of<T extends RadiantCombatEvent['type']>(events: RadiantCombatEvent[], type: T) {
  return events.filter((event): event is Extract<RadiantCombatEvent, { type: T }> => event.type === type);
}

describe('Skill 1 / Skill 2 action (D-473 N2, N8)', () => {
  it('spends 25 Luminosity, splits one total across the kit hits, applies Burn and drops no Gauge orbs', () => {
    const state = charge(battle([loadout('ember')]), 'ember', 25);
    const result = act(state, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' });
    expect(result.events[0]).toEqual({ type: 'skill', bearerId: 'ember', slot: 1, name: 'Cinder Cleave', cost: 25 });
    const hits = of(result.events, 'damage').filter(event => event.source.kind === 'skill' && event.origin === 'direct');
    expect(hits).toHaveLength(4);
    // Infernis is an Attacker: Skill Power 1.5 scales Cinder Cleave's 260%.
    const total = radiantDirectDamage(state.bearers[0].stats.attack, 0, 2.6 * 1.5);
    expect(hits.reduce((sum, event) => sum + event.offered, 0)).toBe(total);
    expect(hits.slice(0, 3).every(event => event.offered === Math.floor(total / 4))).toBe(true);
    expect(of(result.events, 'gauge-drop')).toEqual([]);
    expect(result.state.gauge.members[0].charge).toBe(0);
    expect(result.state.acted).toEqual(['ember']);
    expect(result.state.skilled).toEqual(['ember']);
    const burnPower = radiantLeaderEffects(state.bearers[0].loadout).find(effect => effect.kind === 'burn-power')!.amount;
    const burn = result.state.enemies[0].debuffs.find(effect => effect.category === 'burn')!;
    expect(burn).toMatchObject({ source: { kind: 'skill', bearerId: 'ember' }, remaining: 3 });
    expect(burn.magnitude).toBeCloseTo(.25 * 1.5 * state.bearers[0].stats.attack * (1 + burnPower));
  });
  it('rejects a missing or extra target and an unaffordable skill without mutating the input', () => {
    const state = charge(battle([loadout('ember'), loadout('tide')]), 'ember', 24);
    charge(state, 'tide', 40);
    const before = structuredClone(state);
    expect(() => act(state, { type: 'skill', bearerId: 'ember', slot: 1 })).toThrow('selected living enemy');
    expect(() => act(state, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' })).toThrow('Luminosity');
    expect(() => act(state, { type: 'skill', bearerId: 'tide', slot: 2, targetId: 'enemy' })).toThrow('authored target set');
    expect(() => act(state, { type: 'skill', bearerId: 'tide', slot: 3 as 1 })).toThrow('slot');
    expect(state).toEqual(before);
  });
  it('lets the skill1/skill2 Imbue boost only its own skill: +50% Skill Power and +5% Efficiency (D-473 O3)', () => {
    const plain = battle([loadout('ember')]);
    const imbued = battle([loadout('ember', { ascension: { skill1: true } })]);
    expect(radiantSkillStats(imbued, 'ember', 1)).toMatchObject({ skillPower: 2, skillEfficiency: .05 });
    expect(radiantSkillStats(imbued, 'ember', 2)).toMatchObject({ skillPower: 1.5, skillEfficiency: 0 });
    expect(radiantSkillStats(plain, 'ember', 1)).toMatchObject({ skillPower: 1.5, skillEfficiency: 0, skillDuration: 0, gaugeGain: 1 });
    const result = act(charge(imbued, 'ember', 24), { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' });
    expect(of(result.events, 'skill')[0].cost).toBe(24);
    expect(of(result.events, 'damage').filter(event => event.origin === 'direct').reduce((sum, event) => sum + event.offered, 0))
      .toBe(radiantDirectDamage(imbued.bearers[0].stats.attack, 0, 2.6 * 2));
  });
  it('does not scale Normal Attack by Skill Power', () => {
    const state = battle([loadout('ember')]);
    const result = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    const leaderNormal = radiantLeaderEffects(state.bearers[0].loadout).find(effect => effect.kind === 'normal')!.amount;
    expect(of(result.events, 'damage')[0].offered).toBe(radiantDirectDamage(state.bearers[0].stats.attack, 0, 1 + leaderNormal));
  });
});

describe('kit heals, Shields and buffs scale with Skill Power (D-473 N4, N7)', () => {
  it('sizes Shields and buffs from each recipient and the caster\'s Skill Power', () => {
    const state = charge(battle([loadout('tide'), loadout('sprout')]), 'tide', 40);
    const result = act(state, { type: 'skill', bearerId: 'tide', slot: 2 });
    // Tidal Shelter: Shield 25% of each recipient's max Health; Defense Up +30% for 2 turns (Tank Skill Power 1).
    expect(of(result.events, 'shield').filter(event => event.source.kind === 'skill').map(event => event.amount))
      .toEqual(state.bearers.map(member => Math.round(.25 * member.stats.hp)));
    expect(result.state.bearers.every(member => member.buffs.some(effect =>
      effect.category === 'defense-up' && effect.magnitude === .3 && effect.remaining === 2))).toBe(true);
  });
  it('heals by recipient max Health x Support Skill Power, then adds the unscaled Support squad heal', () => {
    const state = charge(battle([loadout('tide'), loadout('sprout')]), 'sprout', 40);
    state.bearers.forEach(member => { member.hp = 1; });
    const result = act(state, { type: 'skill', bearerId: 'sprout', slot: 2 });
    const kit = of(result.events, 'heal').filter(event => event.source.kind === 'skill');
    expect(kit.map(event => event.offered)).toEqual(state.bearers.map(member => Math.round(.25 * 1.25 * member.stats.hp)));
    const role = of(result.events, 'heal').filter(event => event.source.kind === 'role');
    expect(role.map(event => event.offered)).toEqual(state.bearers.map(member => Math.round(.04 * member.stats.hp)));
    const normal = act(battle([loadout('sprout')]), { type: 'normal', bearerId: 'sprout', targetId: 'enemy' });
    expect(of(normal.events, 'heal').filter(event => event.source.kind === 'role')).toEqual([]);
  });
});

describe('categories (D-473 N6)', () => {
  it('keeps the strongest Attack Up and the longer duration, with the stronger source', () => {
    let state = charge(battle([loadout('disciple'), loadout('ember')]), 'disciple', 25);
    charge(state, 'ember', 100);
    state = act(state, { type: 'skill', bearerId: 'disciple', slot: 1 }).state;
    // Thoughtspark: +30% x Support Skill Power 1.25 = +37.5% for 2 turns.
    expect(state.bearers[1].buffs).toEqual([{ category: 'attack-up', source: { kind: 'skill', bearerId: 'disciple' },
      magnitude: .375, remaining: 2 }]);
    state = act(state, { type: 'flare', bearerId: 'ember' }).state;
    // Dawnfire Sparkling: +50% x 70% x Attacker Skill Power 1.5 = +52.5% for 3 turns.
    const attackUp = state.bearers[1].buffs.filter(effect => effect.category === 'attack-up');
    expect(attackUp).toHaveLength(1);
    expect(attackUp[0]).toMatchObject({ source: { kind: 'flare', bearerId: 'ember' }, remaining: 3 });
    expect(attackUp[0].magnitude).toBeCloseTo(.525);
  });
  it('caps Attack Up at +100% and Weaken at 50%, and rejects saved effects past their cap or six turns', () => {
    const mindcrown = charge(battle([loadout('disciple', { form: 6, ascension: { lastFlare: true } })]), 'disciple', 100);
    const result = act(mindcrown, { type: 'flare', bearerId: 'disciple' });
    expect(result.state.bearers[0].buffs.find(effect => effect.category === 'attack-up')!.magnitude).toBe(1);
    const pane = charge(battle([loadout('ozriel', { ascension: { skill1: true } })]), 'ozriel', 25);
    const weakened = act(pane, { type: 'skill', bearerId: 'ozriel', slot: 1, targetId: 'enemy' });
    expect(weakened.state.enemies[0].debuffs.find(effect => effect.category === 'weaken')!.magnitude).toBe(.5);
    const forged = battle([loadout('ember')]);
    forged.bearers[0].buffs.push({ category: 'attack-up', source: { kind: 'skill', bearerId: 'ember' }, magnitude: .2, remaining: 7 });
    expect(() => validateRadiantCombat(forged)).toThrow('maximum duration');
    forged.bearers[0].buffs[0].remaining = 1;
    forged.bearers[0].buffs.push({ category: 'attack-up', source: { kind: 'flare', bearerId: 'ember' }, magnitude: .1, remaining: 1 });
    expect(() => validateRadiantCombat(forged)).toThrow('category effect');
  });
});

describe('role traits (D-473 O5)', () => {
  it('bakes Tank +50% Defense and Support +50% Health into frozen stats; Attackers keep their base', () => {
    const base = (id: RadiantBearerId) => radiantStarterKits[id].base;
    expect(resolveRadiantStarterStats(loadout('tide')).defense).toBeCloseTo(base('tide').defense * 1.5);
    expect(resolveRadiantStarterStats(loadout('tide')).hp).toBe(base('tide').hp);
    expect(resolveRadiantStarterStats(loadout('sprout')).hp).toBeCloseTo(base('sprout').hp * 1.5);
    expect(resolveRadiantStarterStats(loadout('ember'))).toMatchObject({ hp: base('ember').hp, defense: base('ember').defense });
    expect(['ember', 'tide', 'sprout'].map(id => radiantStarterKits[id as RadiantBearerId].role))
      .toEqual(['Attacker', 'Tank', 'Support']);
  });
  it('picks Tanks with weight 1.25 on the same single target roll', () => {
    const state = battle([loadout('ember'), loadout('tide'), loadout('sprout')]);
    const enemy = { id: 'enemy', skills: [] } as unknown as RadiantPressureEnemy;
    const pick = (roll: number) => radiantPressureEnemyAction(state, enemy, () => roll).targetIds[0];
    // Weights 1 / 1.25 / 1 over a total of 3.25.
    expect([0, .3, .31, .69, .7, .999].map(pick)).toEqual(['ember', 'ember', 'tide', 'tide', 'sprout', 'sprout']);
    let rolls = 0;
    const share = Array.from({ length: 1300 }, (_, index) => pick((index + .5) / 1300)).filter(id => id === 'tide').length / 1300;
    expect(share).toBeCloseTo(1.25 / 3.25, 2);
    const counted = radiantPressureEnemyAction(state, enemy, () => { rolls++; return .5; });
    expect(counted.targetIds).toHaveLength(1);
    expect(rolls).toBe(1);
  });
});

describe('Health motes (D-473 N5)', () => {
  it('heals the defeating bearer 10% of max Health once, without a Conduit-visible heal', () => {
    const state = battle([loadout('ember')], { hp: 1 });
    state.bearers[0].hp -= 50;
    const result = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    const defeat = result.events.findIndex(event => event.type === 'defeated');
    expect(result.events[defeat + 1]).toEqual({ type: 'health-mote', enemyId: 'enemy', bearerId: 'ember',
      offered: Math.round(.1 * state.bearers[0].stats.hp), effective: Math.round(.1 * state.bearers[0].stats.hp) });
    expect(result.state.bearers[0].hp).toBe(state.bearers[0].hp + Math.round(.1 * state.bearers[0].stats.hp));
    expect(of(result.events, 'heal')).toEqual([]);
  });
  it('sends a Burn defeat\'s mote to the Burn\'s caster, and to no one when that caster is defeated', () => {
    const tick = (casterAlive: boolean) => {
      const state = battle([loadout('ember'), loadout('tide')], { hp: 5 });
      state.bearers[1].hp = casterAlive ? 100 : 0;
      state.gauge.members[1].living = casterAlive;
      state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'skill', bearerId: 'tide' }, magnitude: 50, remaining: 1 });
      state.phase = 'enemy'; state.acted = casterAlive ? ['ember', 'tide'] : ['ember']; state.enemyActed = ['enemy'];
      return act(state, { type: 'finish-enemy-phase' });
    };
    const alive = tick(true);
    expect(of(alive.events, 'health-mote')).toEqual([expect.objectContaining({ bearerId: 'tide' })]);
    const dead = tick(false);
    expect(of(dead.events, 'health-mote')).toEqual([]);
    expect(dead.state.bearers[1].hp).toBe(0);
  });
});

describe('Defend-triggered and conditional Conduits under skills (D-473 O1, O2)', () => {
  it('applies `guard` reduction only while the bearer used a skill this turn', () => {
    const incoming = (skill: boolean) => {
      let state = charge(battle([loadout('ember', { gear: gear('stasis-reliquary') })], { attack: 200 }), 'ember', 40);
      state = act(state, skill ? { type: 'skill', bearerId: 'ember', slot: 2 } : { type: 'end-turn' }).state;
      const result = act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: .5 });
      return of(result.events, 'damage')[0].offered;
    };
    expect(incoming(true)).toBeLessThan(incoming(false));
  });
  it('boosts skill damage with conditional damage Conduits such as Execution', () => {
    const strike = (ids: ConduitId[]) => {
      const state = charge(battle([loadout('ember', { gear: gear(...ids) })], { budget: 0 }), 'ember', 25);
      state.enemies[0].hp = 20000;
      state.enemies[0].currency.lowestHP = 20000;
      const result = act(state, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' });
      return of(result.events, 'damage').filter(event => event.origin === 'direct').reduce((sum, event) => sum + event.offered, 0);
    };
    expect(strike(['execution-orrery'])).toBeGreaterThan(strike([]));
  });
});

describe('Gauge Gain (D-473 N1)', () => {
  it('multiplies Normal drops and incoming-hit Luminosity by Luminosity Gain Up, rounded once', () => {
    let state = battle([loadout('ember')]);
    state.bearers[0].buffs.push({ category: 'gain-up', source: { kind: 'skill', bearerId: 'ember' }, magnitude: .3, remaining: 2 });
    const normal = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(of(normal.events, 'gauge-drop')[0].amount).toBe(20);
    expect(normal.state.gauge.members[0].charge).toBe(20);
    state = normal.state;
    const hit = act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: .1 });
    expect(hit.state.gauge.members[0].charge).toBe(33);
  });
});
