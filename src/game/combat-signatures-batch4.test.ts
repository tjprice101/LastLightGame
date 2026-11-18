import { describe, expect, it } from 'vitest';
import type { RadiantBearerId, RadiantLoadout } from '../content/combat-kits';
import { radiantFlareTierScale } from '../content/radiant-kits';
import { radiantImpactFrames } from '../presentation/battle-impact-frames';
import { applyRadiantCombatAction, createRadiantCombat, radiantDirectDamage, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState } from './combat-engine';

/** Battle Flurry Phase 3 Step 2b batch 4 (D-473 kits): Moon signatures and Passives. */
function loadout(starter: RadiantBearerId): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 1, convergenceRank: 1, masterId: null, weaponRank: 0, ascension: {} };
}
/** The first bearer leads; tests lead with a bearer of another element so Leader effects stay out of the numbers. */
function battle(starters: RadiantBearerId[], enemies = 1, defense = 0, hp = 1000000): RadiantCombatState {
  return createRadiantCombat(starters.map(loadout), Array.from({ length: enemies }, (_, index) => ({
    elementId: null, id: `enemy-${index}`, stats: { hp, attack: 20, defense, recovery: 0 }, currencyBudget: 10,
  })), 0);
}
function act(state: RadiantCombatState, action: RadiantCombatAction) {
  return applyRadiantCombatAction(state, action);
}
function charge(state: RadiantCombatState, id: string, amount: number): RadiantCombatState {
  state.gauge.members.find(member => member.id === id)!.charge = amount;
  return state;
}
/** Ends the player turn and runs a quiet enemy phase (enemies heal 0). */
function nextTurn(state: RadiantCombatState): { state: RadiantCombatState; events: RadiantCombatEvent[] } {
  if (state.phase === 'player') state = act(state, { type: 'end-turn' }).state;
  for (const enemy of state.enemies.filter(member => member.hp > 0))
    state = act(state, { type: 'enemy-heal', enemyId: enemy.id, amount: 0 }).state;
  return act(state, { type: 'finish-enemy-phase' });
}
/** Ends the player turn; the first `attackers` enemies attack `targetIds`, the rest heal 0. Stays in the enemy phase. */
function enemyPhase(state: RadiantCombatState, targetIds: string[], coefficient = 20, attackers = 1) {
  if (state.phase === 'player') state = act(state, { type: 'end-turn' }).state;
  const events: RadiantCombatEvent[] = [];
  state.enemies.filter(member => member.hp > 0).forEach((enemy, index) => {
    const result = act(state, index < attackers ? { type: 'enemy-attack', enemyId: enemy.id, targetIds, coefficient }
      : { type: 'enemy-heal', enemyId: enemy.id, amount: 0 });
    state = result.state;
    events.push(...result.events);
  });
  return { state, events };
}
function of<T extends RadiantCombatEvent['type']>(events: RadiantCombatEvent[], type: T) {
  return events.filter((event): event is Extract<RadiantCombatEvent, { type: T }> => event.type === type);
}
const member = (state: RadiantCombatState, id: string) => state.bearers.find(entry => entry.loadout.id === id)!;
const total = (events: RadiantCombatEvent[], kind: string, target?: string) => of(events, 'damage')
  .filter(event => event.source.kind === kind && (target === undefined || event.targetId === target))
  .reduce((sum, event) => sum + event.offered, 0);
const ops = (events: RadiantCombatEvent[]) => of(events, 'signature').map(event => event.op);
const tier = (events: RadiantCombatEvent[]) => radiantFlareTierScale[of(events, 'flare')[0].tier];
/** Support role trait: +25% Skill Power. */
const support = 1.25;

describe('Maerion: Unreturned', () => {
  it('stores Health allies lose to direct enemy hits, but not damage Cover redirected', () => {
    let state = charge(battle(['bruno', 'maerion', 'tide']), 'bruno', 40);
    state = act(state, { type: 'skill', bearerId: 'bruno', slot: 2 }).state;
    const phase = enemyPhase(state, ['tide']);
    const hits = of(phase.events, 'damage').filter(event => event.source.kind === 'enemy');
    expect(hits.some(event => event.redirected && event.targetId === 'bruno')).toBe(true);
    const lost = hits.filter(event => !event.redirected).reduce((sum, event) => sum + event.healthLoss, 0);
    expect(lost).toBeGreaterThan(0);
    expect(member(phase.state, 'maerion').signature).toEqual({ kind: 'unreturned', stored: lost });
  });
  it('caps Unreturned at 45% of her max Health and stores nothing after she has fallen', () => {
    const state = battle(['bruno', 'maerion']);
    const cap = Math.round(.45 * member(state, 'maerion').stats.hp);
    member(state, 'maerion').signature = { kind: 'unreturned', stored: cap - 1 };
    expect(member(enemyPhase(state, ['bruno']).state, 'maerion').signature).toEqual({ kind: 'unreturned', stored: cap });
    const fallen = battle(['bruno', 'maerion']);
    fallen.bearers[1].hp = 0;
    fallen.gauge.members[1].living = false;
    const phase = enemyPhase(fallen, ['bruno']);
    expect(ops(phase.events)).toEqual([]);
    expect(member(phase.state, 'maerion').signature).toEqual({ kind: 'unreturned', stored: 0 });
  });
  it('adds all Unreturned to A Place on the Ferry\'s heal on the lowest ally, then spends it', () => {
    const state = charge(battle(['bruno', 'maerion']), 'maerion', 40);
    member(state, 'maerion').signature = { kind: 'unreturned', stored: 50 };
    member(state, 'bruno').hp = 1;
    const result = act(state, { type: 'skill', bearerId: 'maerion', slot: 2 });
    const healed = of(result.events, 'heal').find(event => event.targetId === 'bruno' && event.source.kind === 'skill')!;
    expect(healed.offered).toBe(Math.round(.45 * support * member(state, 'bruno').stats.hp + 50));
    expect(member(result.state, 'maerion').signature).toEqual({ kind: 'unreturned', stored: 0 });
  });
  it('splits Unreturned evenly across Bring Every Name Home\'s heal on all allies', () => {
    const state = charge(battle(['bruno', 'maerion']), 'maerion', 100);
    member(state, 'maerion').signature = { kind: 'unreturned', stored: 60 };
    state.bearers.forEach(entry => { entry.hp = 1; });
    const result = act(state, { type: 'flare', bearerId: 'maerion' });
    const effect = tier(result.events).effect;
    for (const id of ['bruno', 'maerion']) {
      const healed = of(result.events, 'heal').find(event => event.targetId === id && event.source.kind === 'flare')!;
      expect(healed.offered).toBe(Math.round(.65 * effect * support * member(state, id).stats.hp + 30));
    }
    expect(member(result.state, 'maerion').signature).toEqual({ kind: 'unreturned', stored: 0 });
  });
});

describe('Caevren: Load', () => {
  it('gains 1 Load once per enemy phase when an enemy damages him, up to 3', () => {
    let state = battle(['tide', 'caevren'], 2);
    const phase = enemyPhase(state, ['caevren'], 2, 2);
    expect(member(phase.state, 'caevren').signature).toEqual({ kind: 'load', count: 1, latch: true });
    state = act(phase.state, { type: 'finish-enemy-phase' }).state;
    for (let turn = 0; turn < 3; turn++) state = act(enemyPhase(state, ['caevren'], 2).state, { type: 'finish-enemy-phase' }).state;
    expect(member(state, 'caevren').signature).toMatchObject({ count: 3 });
  });
  it('places Cover with Counterweight Covenant (30%, no Faultbound reduction) and gains Load from redirected hits', () => {
    let state = charge(battle(['tide', 'caevren']), 'caevren', 40);
    const covenant = act(state, { type: 'skill', bearerId: 'caevren', slot: 2 });
    expect(member(covenant.state, 'tide').cover).toEqual({ casterId: 'caevren', share: .3, remaining: 2 });
    expect(member(covenant.state, 'caevren').cover).toBeNull();
    expect(of(covenant.events, 'shield').map(event => event.targetId)).toContain('tide');
    state = covenant.state;
    const phase = enemyPhase(state, ['tide']);
    const hits = of(phase.events, 'damage').filter(event => event.source.kind === 'enemy');
    const moved = hits.find(event => event.redirected)!, kept = hits.find(event => !event.redirected)!;
    expect(moved.targetId).toBe('caevren');
    expect(moved.offered).toBe(Math.round((moved.offered + kept.offered) * .3));
    expect(member(phase.state, 'caevren').signature).toMatchObject({ count: 1 });
  });
  it('spends all Load on The Night Shall Not Fall (+12% Shield each) and covers the others', () => {
    const state = charge(battle(['tide', 'caevren']), 'caevren', 100);
    member(state, 'caevren').signature = { kind: 'load', count: 2, latch: false };
    const result = act(state, { type: 'flare', bearerId: 'caevren' });
    const effect = tier(result.events).effect;
    expect(of(result.events, 'shield').find(event => event.targetId === 'caevren' && event.source.kind === 'flare')!.amount)
      .toBe(Math.round((.6 + .24) * effect * member(state, 'caevren').stats.hp));
    expect(member(result.state, 'tide').cover).toMatchObject({ casterId: 'caevren', share: .3 });
    expect(member(result.state, 'caevren').signature).toMatchObject({ count: 0 });
  });
});

describe('Vespera: Signal', () => {
  it('gives Signal to the others; their next damaging skill spends it for +35% (x Skill Power)', () => {
    let state = charge(battle(['bruno', 'vespera', 'tide']), 'vespera', 40);
    state = act(state, { type: 'skill', bearerId: 'vespera', slot: 2 }).state;
    expect(member(state, 'vespera').signature).toEqual({ kind: 'signal', signals: [
      { holderId: 'bruno', value: .35 * support, remaining: 2 }, { holderId: 'tide', value: .35 * support, remaining: 2 }] });
    const attack = member(state, 'tide').stats.attack;
    const thrust = act(charge(state, 'tide', 25), { type: 'skill', bearerId: 'tide', slot: 1, targetId: 'enemy-0' });
    expect(total(thrust.events, 'skill', 'enemy-0')).toBe(radiantDirectDamage(attack, 0, 2.4 * (1 + .35 * support)));
    expect(member(thrust.state, 'vespera').signature).toMatchObject({ signals: [{ holderId: 'bruno' }] });
  });
  it('is not spent by a skill that deals no damage and lasts through the next player turn', () => {
    let state = charge(battle(['bruno', 'vespera', 'tide']), 'vespera', 40);
    state = act(state, { type: 'skill', bearerId: 'vespera', slot: 2 }).state;
    state = act(charge(state, 'tide', 40), { type: 'skill', bearerId: 'tide', slot: 2 }).state;
    expect(member(state, 'vespera').signature).toMatchObject({ signals: [{ holderId: 'bruno' }, { holderId: 'tide' }] });
    state = nextTurn(state).state;
    expect(member(state, 'vespera').signature).toMatchObject({ signals: [{ remaining: 1 }, { remaining: 1 }] });
    state = nextTurn(state).state;
    expect(member(state, 'vespera').signature).toEqual({ kind: 'signal', signals: [] });
  });
  it('refreshes rather than stacks, keeping the stronger Empowered Signal', () => {
    let state = charge(battle(['bruno', 'vespera']), 'vespera', 100);
    const flare = act(state, { type: 'flare', bearerId: 'vespera' });
    const empowered = .5 * tier(flare.events).effect * support;
    state = nextTurn(flare.state).state;
    state = act(charge(state, 'vespera', 40), { type: 'skill', bearerId: 'vespera', slot: 2 }).state;
    expect(member(state, 'vespera').signature).toEqual({ kind: 'signal', signals: [
      { holderId: 'bruno', value: Math.max(empowered, .35 * support), remaining: 2 }] });
  });
  it('shares the Burn boost with Caldrex: both Convergent Light add to Burn ticks from allies', () => {
    let state = charge(battle(['tide', 'vespera', 'caldrex']), 'vespera', 25);
    state = act(state, { type: 'skill', bearerId: 'vespera', slot: 1, targetId: 'enemy-0' }).state;
    const burn = state.enemies[0].debuffs.find(effect => effect.category === 'burn')!.magnitude;
    state = nextTurn(state).state;
    state = charge(charge(state, 'vespera', 100), 'caldrex', 100);
    const beacon = act(state, { type: 'flare', bearerId: 'vespera' });
    const gates = act(beacon.state, { type: 'flare', bearerId: 'caldrex' });
    const vespera = member(gates.state, 'vespera').burnUp!, caldrex = member(gates.state, 'caldrex').burnUp!;
    expect(vespera).toEqual({ value: .2 * tier(beacon.events).effect * support, remaining: 2 });
    expect(caldrex).toEqual({ value: .25 * tier(gates.events).effect, remaining: 2 });
    const ticks = of(nextTurn(gates.state).events, 'damage').filter(event => event.origin === 'periodic');
    expect(ticks.map(event => event.offered)).toEqual([Math.round(burn * (1 + vespera.value + caldrex.value))]);
  });
});

describe('Ilyss: Severance', () => {
  const weakened = (state: RadiantCombatState, id: string) => {
    member(state, id).buffs.push({ category: 'weaken', source: { kind: 'enemy', enemyId: 'enemy-0' }, magnitude: .2, remaining: 2 });
  };
  it('gains 1 Severance when Unbind the Living removes a Weaken, and none when there is none to remove', () => {
    const state = charge(battle(['bruno', 'ilyss']), 'ilyss', 40);
    member(state, 'bruno').hp = 1;
    expect(member(act(state, { type: 'skill', bearerId: 'ilyss', slot: 2 }).state, 'ilyss').signature)
      .toEqual({ kind: 'severance', count: 0, latch: false });
    weakened(state, 'bruno');
    const result = act(state, { type: 'skill', bearerId: 'ilyss', slot: 2 });
    expect(member(result.state, 'bruno').buffs.some(effect => effect.category === 'weaken')).toBe(false);
    expect(member(result.state, 'ilyss').signature).toEqual({ kind: 'severance', count: 1, latch: true });
    expect(member(nextTurn(result.state).state, 'ilyss').signature).toMatchObject({ count: 1, latch: false });
  });
  it('spends all Severance on its Convergent Light (+10% heal each), then earns 1 back from the Weaken it removes', () => {
    const state = charge(battle(['bruno', 'ilyss']), 'ilyss', 100);
    member(state, 'ilyss').signature = { kind: 'severance', count: 2, latch: false };
    state.bearers.forEach(entry => { entry.hp = 1; });
    weakened(state, 'bruno');
    weakened(state, 'ilyss');
    const result = act(state, { type: 'flare', bearerId: 'ilyss' });
    const effect = tier(result.events).effect;
    const healed = of(result.events, 'heal').find(event => event.targetId === 'bruno' && event.source.kind === 'flare')!;
    expect(healed.offered).toBe(Math.round((.6 + .2) * effect * support * member(state, 'bruno').stats.hp));
    expect(ops(result.events)).toEqual(['severance', 'severance']);
    expect(member(result.state, 'ilyss').signature).toEqual({ kind: 'severance', count: 1, latch: true });
  });
});

describe('Asteriel: Path', () => {
  it('enters Shelter with Skill 1 and Flourish with Skill 2; only switching grants Promise, up to 3', () => {
    let state = charge(battle(['tide', 'asteriel']), 'asteriel', 25);
    const first = act(state, { type: 'skill', bearerId: 'asteriel', slot: 1 });
    expect(ops(first.events)).toEqual(['path']);
    expect(member(first.state, 'asteriel').signature).toEqual({ kind: 'path', count: 0, path: 'shelter' });
    state = act(charge(nextTurn(first.state).state, 'asteriel', 40), { type: 'skill', bearerId: 'asteriel', slot: 2 }).state;
    expect(member(state, 'asteriel').signature).toEqual({ kind: 'path', count: 1, path: 'flourish' });
    state = act(charge(nextTurn(state).state, 'asteriel', 40), { type: 'skill', bearerId: 'asteriel', slot: 2 }).state;
    expect(member(state, 'asteriel').signature).toMatchObject({ count: 1 });
    for (const slot of [1, 2, 1] as const)
      state = act(charge(nextTurn(state).state, 'asteriel', 40), { type: 'skill', bearerId: 'asteriel', slot }).state;
    expect(member(state, 'asteriel').signature).toEqual({ kind: 'path', count: 3, path: 'shelter' });
  });
  it('Convergent Light grants Shields with no path (or in Shelter) and Attack Up in Flourish, spending Promise and keeping the path', () => {
    const plain = charge(battle(['tide', 'asteriel']), 'asteriel', 100);
    const shelter = act(plain, { type: 'flare', bearerId: 'asteriel' });
    expect(of(shelter.events, 'shield').find(event => event.targetId === 'tide')!.amount)
      .toBe(Math.round(.45 * tier(shelter.events).effect * support * member(plain, 'tide').stats.hp));
    expect(member(shelter.state, 'tide').buffs.some(effect => effect.category === 'attack-up')).toBe(false);
    const bloom = charge(battle(['tide', 'asteriel']), 'asteriel', 100);
    member(bloom, 'asteriel').signature = { kind: 'path', count: 2, path: 'flourish' };
    const result = act(bloom, { type: 'flare', bearerId: 'asteriel' });
    expect(of(result.events, 'shield').filter(event => event.source.kind === 'flare')).toEqual([]);
    expect(member(result.state, 'tide').buffs.find(effect => effect.category === 'attack-up'))
      .toMatchObject({ magnitude: (.5 + .2) * tier(result.events).effect * support, remaining: 2 });
    expect(member(result.state, 'asteriel').signature).toEqual({ kind: 'path', count: 0, path: 'flourish' });
  });
});

describe('Serapha: Interval', () => {
  it('gains 1 Interval once per enemy phase when an enemy she Weakened attacks', () => {
    let state = charge(battle(['tide', 'serapha'], 2), 'serapha', 25);
    state = act(state, { type: 'skill', bearerId: 'serapha', slot: 1, targetId: 'enemy-0' }).state;
    state = act(state, { type: 'end-turn' }).state;
    const second = act(state, { type: 'enemy-attack', enemyId: 'enemy-1', targetIds: ['tide'], coefficient: 2 });
    expect(member(second.state, 'serapha').signature).toEqual({ kind: 'interval', count: 0, latch: false });
    const first = act(second.state, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['tide'], coefficient: 2 });
    expect(member(first.state, 'serapha').signature).toEqual({ kind: 'interval', count: 1, latch: true });
    state = act(first.state, { type: 'finish-enemy-phase' }).state;
    expect(member(enemyPhase(state, ['tide'], 2).state, 'serapha').signature).toMatchObject({ count: 2 });
  });
  it('ignores a Weaken applied by another ally', () => {
    let state = charge(battle(['ilyss', 'serapha']), 'ilyss', 25);
    state = act(state, { type: 'skill', bearerId: 'ilyss', slot: 1, targetId: 'enemy-0' }).state;
    expect(member(enemyPhase(state, ['ilyss'], 2).state, 'serapha').signature).toMatchObject({ count: 0 });
  });
  it('spends all Interval on Let Them Leave Alive (+5% Damage Reduction each)', () => {
    const state = charge(battle(['tide', 'serapha']), 'serapha', 100);
    member(state, 'serapha').signature = { kind: 'interval', count: 2, latch: false };
    const result = act(state, { type: 'flare', bearerId: 'serapha' });
    expect(member(result.state, 'tide').buffs.find(effect => effect.category === 'reduction'))
      .toMatchObject({ magnitude: (.2 + .1) * tier(result.events).effect * support, remaining: 2 });
    expect(member(result.state, 'serapha').signature).toMatchObject({ count: 0 });
  });
});

describe('Batch 4 state and presentation', () => {
  it('rejects malformed Unreturned, Signal, Path, counters, Burn boosts and Cover casters', () => {
    const cases: [RadiantBearerId, (state: RadiantCombatState) => void, string][] = [
      ['maerion', state => { member(state, 'maerion').signature = { kind: 'unreturned', stored: 1e9 }; }, 'Unreturned'],
      ['vespera', state => { member(state, 'vespera').signature = { kind: 'signal',
        signals: [{ holderId: 'vespera', value: .35, remaining: 2 }] }; }, 'Signal'],
      ['vespera', state => { member(state, 'vespera').signature = { kind: 'signal',
        signals: [{ holderId: 'tide', value: .35, remaining: 3 }] }; }, 'Signal'],
      ['asteriel', state => { member(state, 'asteriel').signature = { kind: 'path', count: 1, path: null }; }, 'Path'],
      ['asteriel', state => { member(state, 'asteriel').signature = { kind: 'path', count: 4, path: 'shelter' }; }, 'Promise'],
      ['caevren', state => { member(state, 'caevren').signature = { kind: 'load', count: 4, latch: false }; }, 'load'],
      ['serapha', state => { member(state, 'tide').burnUp = { value: .2, remaining: 2 }; }, 'Burn boost'],
      ['serapha', state => { member(state, 'tide').cover = { casterId: 'serapha', share: .3, remaining: 2 }; }, 'caster'],
    ];
    for (const [starter, corrupt, message] of cases) {
      const state = battle(['tide', starter]);
      corrupt(state);
      expect(() => validateRadiantCombat(state)).toThrow(message);
    }
  });
  it('replays every new event op through the battle presentation', () => {
    const steps: { before: RadiantCombatState; result: ReturnType<typeof act> }[] = [];
    const step = (state: RadiantCombatState, action: RadiantCombatAction) => {
      const result = act(state, action);
      steps.push({ before: state, result });
      return result.state;
    };
    let moon = battle(['maerion', 'caevren', 'serapha'], 1);
    moon.gauge.members.forEach(entry => { entry.charge = 100; });
    moon = step(moon, { type: 'skill', bearerId: 'caevren', slot: 2 });
    moon = step(moon, { type: 'skill', bearerId: 'serapha', slot: 1, targetId: 'enemy-0' });
    moon = step(moon, { type: 'end-turn' });
    moon = step(moon, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['serapha'], coefficient: 20 });
    moon = step(moon, { type: 'finish-enemy-phase' });
    step(moon, { type: 'skill', bearerId: 'maerion', slot: 2 });
    let beacon = battle(['vespera', 'ilyss', 'asteriel'], 1);
    beacon.gauge.members.forEach(entry => { entry.charge = 100; });
    beacon.bearers[1].buffs.push({ category: 'weaken', source: { kind: 'enemy', enemyId: 'enemy-0' }, magnitude: .2, remaining: 2 });
    beacon.bearers[1].hp = 1;
    beacon = step(beacon, { type: 'flare', bearerId: 'vespera' });
    beacon = step(beacon, { type: 'skill', bearerId: 'ilyss', slot: 2 });
    beacon = step(beacon, { type: 'skill', bearerId: 'asteriel', slot: 1 });
    beacon = step(nextTurn(beacon).state, { type: 'skill', bearerId: 'asteriel', slot: 2 });
    const seen = new Set(steps.flatMap(({ result }) => ops(result.events)));
    expect([...seen].sort()).toEqual(['burn-up', 'cover', 'interval', 'load', 'path', 'promise', 'severance', 'signal',
      'unreturned']);
    for (const { before, result } of steps) expect(() => radiantImpactFrames(before, result.state, result.events)).not.toThrow();
  });
});
