import { describe, expect, it } from 'vitest';
import type { RadiantBearerId, RadiantLoadout } from '../content/combat-kits';
import { radiantImpactFrames } from '../presentation/battle-impact-frames';
import { applyRadiantCombatAction, createRadiantCombat, radiantDirectDamage, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState } from './combat-engine';

/** Battle Flurry Phase 3 Step 2b batch 1 (D-473 kits): Opening and Flagship signatures and Passives. */
function loadout(starter: RadiantBearerId): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 1, convergenceRank: 1, masterId: null, weaponRank: 0, ascension: {} };
}
/** Tizu leads by default: an Oceanic leader gives no Leader effects to the non-Oceanic bearers under test. */
function battle(starters: RadiantBearerId[], enemies = 1, hp = 1000000): RadiantCombatState {
  return createRadiantCombat(starters.map(loadout), Array.from({ length: enemies }, (_, index) => ({
    elementId: null, id: `enemy-${index}`, stats: { hp, attack: 20, defense: 0, recovery: 0 }, currencyBudget: 10,
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
function of<T extends RadiantCombatEvent['type']>(events: RadiantCombatEvent[], type: T) {
  return events.filter((event): event is Extract<RadiantCombatEvent, { type: T }> => event.type === type);
}
const member = (state: RadiantCombatState, id: string) => state.bearers.find(entry => entry.loadout.id === id)!;

describe('Infernis: Unbroken Ember and Burn detonation', () => {
  it('detonates only Infernis\'s Burn for up to 2 remaining turns and removes the spent turns', () => {
    const state = charge(battle(['ember'], 2), 'ember', 40);
    state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'skill', bearerId: 'ember' }, magnitude: 100, remaining: 3 });
    state.enemies[1].debuffs.push({ category: 'burn', source: { kind: 'skill', bearerId: 'ember' }, magnitude: 50, remaining: 1 });
    const result = act(state, { type: 'skill', bearerId: 'ember', slot: 2 });
    const periodic = of(result.events, 'damage').filter(event => event.origin === 'periodic');
    expect(periodic.map(event => [event.targetId, event.offered])).toEqual([['enemy-0', 200], ['enemy-1', 50]]);
    expect(result.state.enemies[0].debuffs).toEqual([{ category: 'burn', source: { kind: 'skill', bearerId: 'ember' },
      magnitude: 100, remaining: 1 }]);
    expect(result.state.enemies[1].debuffs).toEqual([]);
  });
  it('leaves another ally\'s Burn in place', () => {
    const state = charge(battle(['ember', 'tide']), 'ember', 40);
    state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'skill', bearerId: 'tide' }, magnitude: 100, remaining: 3 });
    const result = act(state, { type: 'skill', bearerId: 'ember', slot: 2 });
    expect(of(result.events, 'damage').some(event => event.origin === 'periodic')).toBe(false);
    expect(result.state.enemies[0].debuffs[0].remaining).toBe(3);
  });
});

describe('Tizu: Stillwater Guard', () => {
  it('refunds nothing when the hit gets through the Shield', () => {
    const state = battle(['tide', 'sprout']);
    state.phase = 'enemy';
    state.acted = ['tide', 'sprout'];
    state.bearers[1].shields.push({ id: state.nextShieldId++, source: { kind: 'skill', bearerId: 'tide' }, remaining: 1 });
    const result = act(state, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['sprout'], coefficient: 1 });
    expect(of(result.events, 'signature')).toEqual([]);
    expect(result.state.gauge.members[1].charge).toBe(10);
  });
  it('refunds nothing after Tizu has fallen', () => {
    const state = battle(['tide', 'sprout']);
    state.phase = 'enemy';
    state.acted = ['tide', 'sprout'];
    state.bearers[0].hp = 0;
    state.gauge.members[0].living = false;
    state.bearers[1].shields.push({ id: state.nextShieldId++, source: { kind: 'skill', bearerId: 'tide' }, remaining: 1000 });
    const result = act(state, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['sprout'], coefficient: 1 });
    expect(result.state.gauge.members[1].charge).toBe(10);
  });
});

describe('Flora: Seeds', () => {
  it('plants a Seed on the ally with the lowest Health that heals 30% x Skill Power at the next turn start', () => {
    const state = charge(battle(['tide', 'sprout']), 'sprout', 25);
    state.bearers[0].hp = 1;
    const planted = act(state, { type: 'skill', bearerId: 'sprout', slot: 1, targetId: 'enemy-0' });
    expect(member(planted.state, 'tide').seed).toEqual({ casterId: 'sprout', value: .3 * 1.25 });
    const bloom = nextTurn(planted.state);
    const heal = of(bloom.events, 'heal').find(event => event.source.kind === 'passive');
    expect(heal).toMatchObject({ targetId: 'tide', source: { kind: 'passive', bearerId: 'sprout' } });
    expect(heal!.snapshot).toBeCloseTo(.375 * state.bearers[0].stats.hp);
    expect(bloom.state.bearers.every(entry => entry.seed === null)).toBe(true);
  });
  it('keeps the stronger Seed and lets Seeds wither when Flora has fallen', () => {
    const state = charge(battle(['tide', 'sprout']), 'sprout', 40);
    state.bearers[0].seed = { casterId: 'sprout', value: 2 };
    const planted = act(state, { type: 'skill', bearerId: 'sprout', slot: 2 });
    expect(member(planted.state, 'tide').seed!.value).toBe(2);
    expect(member(planted.state, 'sprout').seed!.value).toBeCloseTo(.375);
    const fallen = structuredClone(planted.state);
    fallen.bearers[1].hp = 0;
    fallen.gauge.members[1].living = false;
    const bloom = nextTurn(fallen);
    expect(of(bloom.events, 'heal').some(event => event.source.kind === 'passive')).toBe(false);
    expect(of(bloom.events, 'signature').filter(event => event.op === 'seed-wither')).toHaveLength(2);
  });
});

describe('Atmoso: Cyclone and Gusts', () => {
  it('collects a Gust from each other ally\'s Normal Attack and releases them with Razor Gale', () => {
    let state = charge(battle(['tide', 'atmoso']), 'atmoso', 65);
    state = act(state, { type: 'skill', bearerId: 'atmoso', slot: 2 }).state;
    expect(member(state, 'atmoso').signature).toEqual({ kind: 'cyclone', gusts: 0,
      cyclone: { coefficient: .6 * 1.5, perGust: .2 * 1.5, remaining: 2 } });
    state = act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy-0' }).state;
    state = nextTurn(state).state;
    state = act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy-0' }).state;
    expect(member(state, 'atmoso').signature).toMatchObject({ gusts: 2, cyclone: { remaining: 1 } });
    const attack = member(state, 'atmoso').stats.attack;
    const result = act(state, { type: 'skill', bearerId: 'atmoso', slot: 1, targetId: 'enemy-0' });
    const release = of(result.events, 'damage').filter(event => event.source.kind === 'skill').at(-1)!;
    expect(release.offered).toBe(radiantDirectDamage(attack, 0, .9 + .3 * 2));
    expect(member(result.state, 'atmoso').signature).toEqual({ kind: 'cyclone', gusts: 0, cyclone: null });
  });
  it('releases on its own after 2 turns, on all enemies', () => {
    let state = charge(battle(['atmoso'], 2), 'atmoso', 40);
    state = act(state, { type: 'skill', bearerId: 'atmoso', slot: 2 }).state;
    state = nextTurn(state).state;
    expect(member(state, 'atmoso').signature).toMatchObject({ cyclone: { remaining: 1 } });
    const result = nextTurn(state);
    expect(of(result.events, 'signature').map(event => event.op)).toContain('cyclone-release');
    expect(of(result.events, 'damage').filter(event => event.source.kind === 'skill').map(event => event.targetId))
      .toEqual(['enemy-0', 'enemy-1']);
  });
});

describe('Aurora: Lens of Diminishment', () => {
  it('adds 1 turn to Weaken from allies while she lives', () => {
    const alone = act(charge(battle(['tide']), 'tide', 25), { type: 'skill', bearerId: 'tide', slot: 1, targetId: 'enemy-0' });
    expect(alone.state.enemies[0].debuffs.find(effect => effect.category === 'weaken')!.remaining).toBe(2);
    const lens = act(charge(battle(['tide', 'aurora']), 'tide', 25), { type: 'skill', bearerId: 'tide', slot: 1, targetId: 'enemy-0' });
    expect(lens.state.enemies[0].debuffs.find(effect => effect.category === 'weaken')!.remaining).toBe(3);
  });
});

describe('Bliss: Tempo', () => {
  it('gives the Opening bonus when Bliss acts first and the Closing bonus when she acts last', () => {
    const state = charge(battle(['tide', 'bliss']), 'bliss', 25);
    const attack = state.bearers[1].stats.attack;
    const opening = act(state, { type: 'skill', bearerId: 'bliss', slot: 1, targetId: 'enemy-0' });
    expect(of(opening.events, 'damage').reduce((sum, event) => sum + event.offered, 0))
      .toBe(radiantDirectDamage(attack, 0, 2.6 * 1.5 * 1.3));
    expect(of(opening.events, 'heal')).toEqual([]);
    state.bearers[0].hp = 1;
    const closing = act(act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy-0' }).state,
      { type: 'skill', bearerId: 'bliss', slot: 1, targetId: 'enemy-0' });
    expect(of(closing.events, 'damage').filter(event => event.source.kind === 'skill').reduce((sum, event) => sum + event.offered, 0))
      .toBe(radiantDirectDamage(attack, 0, 2.6 * 1.5));
    const heal = of(closing.events, 'heal')[0];
    expect(heal).toMatchObject({ targetId: 'tide', source: { kind: 'skill', bearerId: 'bliss' } });
    expect(heal.snapshot).toBeCloseTo(.15 * 1.5 * state.bearers[0].stats.hp);
  });
  it('treats every action as Opening when Bliss is alone', () => {
    const state = charge(battle(['bliss']), 'bliss', 40);
    const result = act(state, { type: 'skill', bearerId: 'bliss', slot: 2 });
    expect(result.state.bearers[0].buffs.find(effect => effect.category === 'attack-up')).toMatchObject({ magnitude: .2 * 1.5 });
    expect(result.state.bearers[0].shields).toEqual([]);
  });
});

describe('Bruno: Cover and Faultbound Resolve', () => {
  it('moves 40% of a covered ally\'s hit to Bruno, reduced by 25%, for 1 turn', () => {
    let state = charge(battle(['tide', 'bruno', 'sprout']), 'bruno', 40);
    state = act(state, { type: 'skill', bearerId: 'bruno', slot: 2 }).state;
    expect(member(state, 'sprout').cover).toEqual({ casterId: 'bruno', share: .4, remaining: 1 });
    expect(member(state, 'tide').cover).toEqual({ casterId: 'bruno', share: .4, remaining: 1 });
    expect(member(state, 'bruno').cover).toBeNull();
    state = act(state, { type: 'end-turn' }).state;
    const uncovered = structuredClone(state);
    uncovered.bearers.forEach(entry => { entry.cover = null; });
    const attack: RadiantCombatAction = { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['sprout'], coefficient: 5 };
    const total = of(act(uncovered, attack).events, 'damage')[0].offered;
    const covered = act(state, attack);
    const moved = Math.round(total * .4);
    expect(of(covered.events, 'damage').map(event => [event.targetId, event.offered, event.redirected ?? false]))
      .toEqual([['bruno', Math.round(moved * .75), true], ['sprout', total - moved, false]]);
    const after = act(covered.state, { type: 'finish-enemy-phase' }).state;
    expect(after.bearers.every(entry => entry.cover === null)).toBe(true);
  });
});

describe('Disciple: Shared Mindflame', () => {
  it('fills 5 Luminosity for each ally her Attack Up reaches', () => {
    const state = charge(battle(['tide', 'disciple']), 'disciple', 25);
    const result = act(state, { type: 'skill', bearerId: 'disciple', slot: 1 });
    expect(result.state.gauge.members.map(entry => entry.charge)).toEqual([5, 5]);
  });
});

describe('Elise: Shuriken', () => {
  it('lodges both Shuriken, then Voltstar Cut hits for 280%, and Crosscurrent Volley recalls each for 150%', () => {
    let state = charge(battle(['tide', 'elise']), 'elise', 100);
    const attack = member(state, 'elise').stats.attack;
    state = act(state, { type: 'skill', bearerId: 'elise', slot: 1, targetId: 'enemy-0' }).state;
    state = act(nextTurn(state).state, { type: 'skill', bearerId: 'elise', slot: 1, targetId: 'enemy-0' }).state;
    expect(member(state, 'elise').signature).toEqual({ kind: 'shuriken', held: 0, lodged: ['enemy-0', 'enemy-0'] });
    state = charge(nextTurn(state).state, 'elise', 65);
    const empty = act(state, { type: 'skill', bearerId: 'elise', slot: 1, targetId: 'enemy-0' });
    expect(of(empty.events, 'damage').reduce((sum, event) => sum + event.offered, 0)).toBe(radiantDirectDamage(attack, 0, 2.8 * 1.5));
    const recall = act(state, { type: 'skill', bearerId: 'elise', slot: 2, targetId: 'enemy-0' });
    const strikes = of(recall.events, 'damage').slice(2);
    expect(strikes.map(event => event.offered)).toEqual([1, 2].map(() => radiantDirectDamage(attack, 0, 1.5 * 1.5)));
    expect(member(recall.state, 'elise').signature).toEqual({ kind: 'shuriken', held: 2, lodged: [] });
  });
  it('returns a lodged Shuriken without damage when its enemy is defeated', () => {
    const state = battle(['tide', 'elise'], 2, 10);
    state.bearers[1].signature = { kind: 'shuriken', held: 1, lodged: ['enemy-1'] };
    validateRadiantCombat(state);
    const result = act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy-1' });
    expect(member(result.state, 'elise').signature).toEqual({ kind: 'shuriken', held: 2, lodged: [] });
    expect(of(result.events, 'signature').map(event => event.op)).toEqual(['return']);
  });
});

describe('Razor: Wounds', () => {
  it('stores Health lost to enemy hits (not Shield-absorbed) and spends it on an extra Nightcleave strike', () => {
    let state = battle(['tide', 'razor']);
    state = act(state, { type: 'end-turn' }).state;
    state.bearers[1].shields.push({ id: state.nextShieldId++, source: { kind: 'skill', bearerId: 'tide' }, remaining: 3 });
    const hit = act(state, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['razor'], coefficient: 5 });
    const damage = of(hit.events, 'damage')[0];
    expect(damage.absorbed).toBe(3);
    expect(member(hit.state, 'razor').signature).toEqual({ kind: 'wounds', wounds: damage.healthLoss });
    state = charge(act(hit.state, { type: 'finish-enemy-phase' }).state, 'razor', 25);
    const strike = act(state, { type: 'skill', bearerId: 'razor', slot: 1, targetId: 'enemy-0' });
    expect(of(strike.events, 'damage').at(-1)!.offered).toBe(damage.healthLoss);
    expect(member(strike.state, 'razor').signature).toEqual({ kind: 'wounds', wounds: 0 });
  });
});

describe('Later batches stay inert', () => {
  it('gives no signature state or conditional bonus to bearers outside batches 1-2', () => {
    const state = battle(['nerithe', 'velmira']);
    expect(state.bearers.map(entry => entry.signature)).toEqual([null, null]);
    const result = act(charge(state, 'nerithe', 25), { type: 'skill', bearerId: 'nerithe', slot: 1, targetId: 'enemy-0' });
    expect(of(result.events, 'signature')).toEqual([]);
  });
  it('rejects a Shuriken ledger that does not hold exactly 2', () => {
    const state = battle(['elise']);
    state.bearers[0].signature = { kind: 'shuriken', held: 3, lodged: [] };
    expect(() => validateRadiantCombat(state)).toThrow('Shuriken');
  });
});

describe('Presentation replay', () => {
  it('reproduces final HP, Shields, charge and statuses from detonation, Cover, Seed and Cyclone events', () => {
    const steps: { before: RadiantCombatState; result: ReturnType<typeof act> }[] = [];
    const step = (state: RadiantCombatState, action: RadiantCombatAction) => {
      const result = act(state, action);
      steps.push({ before: state, result });
      return result.state;
    };
    let state = battle(['bruno', 'ember', 'sprout'], 2);
    state.gauge.members.forEach(entry => { entry.charge = 100; });
    state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'skill', bearerId: 'ember' }, magnitude: 100, remaining: 3 });
    state = step(state, { type: 'skill', bearerId: 'bruno', slot: 2 });
    state = step(state, { type: 'skill', bearerId: 'ember', slot: 2 });
    state = step(state, { type: 'skill', bearerId: 'sprout', slot: 2 });
    state = step(state, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['sprout'], coefficient: 5 });
    state = step(state, { type: 'enemy-heal', enemyId: 'enemy-1', amount: 0 });
    step(state, { type: 'finish-enemy-phase' });
    for (const { before, result } of steps) expect(() => radiantImpactFrames(before, result.state, result.events)).not.toThrow();
    let cyclone = charge(battle(['atmoso'], 2), 'atmoso', 40);
    cyclone = act(cyclone, { type: 'skill', bearerId: 'atmoso', slot: 2 }).state;
    cyclone = nextTurn(cyclone).state;
    const ended = act(cyclone, { type: 'end-turn' }).state;
    const healed = act(act(ended, { type: 'enemy-heal', enemyId: 'enemy-0', amount: 0 }).state,
      { type: 'enemy-heal', enemyId: 'enemy-1', amount: 0 }).state;
    const release = act(healed, { type: 'finish-enemy-phase' });
    expect(() => radiantImpactFrames(healed, release.state, release.events)).not.toThrow();
  });
});
