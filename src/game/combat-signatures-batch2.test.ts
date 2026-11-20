import { describe, expect, it } from 'vitest';
import type { RadiantBearerId, RadiantLoadout } from '../content/combat-kits';
import { radiantImpactFrames } from '../presentation/battle-impact-frames';
import { applyRadiantCombatAction, createRadiantCombat, radiantDirectDamage, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState } from './combat-engine';

/** Battle Flurry Phase 3 Step 2b batch 2 (D-473 kits): Rose and Calamitic signatures and Passives. */
function loadout(starter: RadiantBearerId): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 1, convergenceRank: 1, masterId: null, weaponRank: 0, ascension: {} };
}
/** The first bearer leads; tests pick leaders whose Leader effects do not touch the numbers under test. */
function battle(starters: RadiantBearerId[], enemies = 1, hp = 1000000): RadiantCombatState {
  return createRadiantCombat(starters.map(loadout), Array.from({ length: enemies }, (_, index) => ({
    elementId: null, id: `enemy-${index}`, stats: { hp, attack: 20, defense: 0, recovery: 0 }, currencyBudget: 10,
  // Signature arithmetic is checked without critical hits (critical-hits.test.ts covers crits).
  })), 0, false);
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
const total = (events: RadiantCombatEvent[], kind: string) =>
  of(events, 'damage').filter(event => event.source.kind === kind).reduce((sum, event) => sum + event.offered, 0);

describe('Rosetta: Quarry', () => {
  it('marks a Quarry, counts another ally\'s hit as a contributor and strikes the Quarry for +40% per contributor', () => {
    let state = charge(battle(['tide', 'rosetta'], 2), 'rosetta', 65);
    const attack = member(state, 'rosetta').stats.attack;
    state = act(state, { type: 'skill', bearerId: 'rosetta', slot: 1, targetId: 'enemy-0' }).state;
    expect(member(state, 'rosetta').signature).toEqual({ kind: 'quarry', targetId: 'enemy-0', contributors: [] });
    state = nextTurn(state).state;
    const hit = act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy-0' });
    expect(of(hit.events, 'signature')).toEqual([{ type: 'signature', bearerId: 'rosetta', op: 'contributor', holderId: 'tide', amount: 1 }]);
    // Crimson Skyfall aimed at enemy-1 strikes the Quarry, Exposed by Golden Thorn Volley (+15% x Skill Power 1.5).
    const skyfall = act(hit.state, { type: 'skill', bearerId: 'rosetta', slot: 2, targetId: 'enemy-1' });
    expect(of(skyfall.events, 'damage').filter(event => event.source.kind === 'skill').every(event => event.targetId === 'enemy-0')).toBe(true);
    expect(total(skyfall.events, 'skill')).toBe(radiantDirectDamage(attack, 0, (3 + .4) * 1.5, 1 + .15 * 1.5));
    // Contributors count for one turn.
    expect(member(nextTurn(skyfall.state).state, 'rosetta').signature).toMatchObject({ contributors: [] });
  });
  it('heals only contributors with Rose Beyond the Sun and clears the Quarry when it is defeated', () => {
    let state = battle(['tide', 'bruno', 'rosetta'], 2);
    member(state, 'rosetta').signature = { kind: 'quarry', targetId: 'enemy-0', contributors: [] };
    state.bearers.forEach(entry => { entry.hp = 1; });
    state = act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy-0' }).state;
    state = act(state, { type: 'normal', bearerId: 'bruno', targetId: 'enemy-1' }).state;
    const result = act(charge(state, 'rosetta', 100), { type: 'flare', bearerId: 'rosetta', targetId: 'enemy-1' });
    expect(of(result.events, 'heal').filter(event => event.source.kind === 'flare').map(event => event.targetId)).toEqual(['tide']);
    expect(of(result.events, 'damage').filter(event => event.source.kind === 'flare').every(event => event.targetId === 'enemy-0')).toBe(true);
    const fragile = battle(['tide', 'rosetta'], 2, 10);
    member(fragile, 'rosetta').signature = { kind: 'quarry', targetId: 'enemy-0', contributors: [] };
    const defeated = act(fragile, { type: 'normal', bearerId: 'tide', targetId: 'enemy-0' });
    expect(member(defeated.state, 'rosetta').signature).toEqual({ kind: 'quarry', targetId: null, contributors: ['tide'] });
  });
});

describe('Thornia: Thorn Trap', () => {
  it('springs once per damaging enemy action, spends charges with Shadow Rose Cleave and expires after 3 turns', () => {
    let state = charge(battle(['tide', 'thornia']), 'thornia', 25);
    const attack = member(state, 'thornia').stats.attack;
    state = act(state, { type: 'skill', bearerId: 'thornia', slot: 1, targetId: 'enemy-0' }).state;
    expect(member(state, 'thornia').signature).toEqual({ kind: 'thorns',
      traps: [{ enemyId: 'enemy-0', charges: 3, remaining: 3, value: .6 }] });
    state = act(state, { type: 'end-turn' }).state;
    const sprung = act(state, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['tide', 'thornia'], coefficient: 1, hits: 3 });
    const strikes = of(sprung.events, 'damage').filter(event => event.source.kind === 'passive');
    expect(strikes.map(event => [event.targetId, event.offered])).toEqual([['enemy-0', radiantDirectDamage(attack, 0, .6)]]);
    state = charge(act(sprung.state, { type: 'finish-enemy-phase' }).state, 'thornia', 40);
    expect(member(state, 'thornia').signature).toMatchObject({ traps: [{ charges: 2, remaining: 2 }] });
    const cleave = act(state, { type: 'skill', bearerId: 'thornia', slot: 2, targetId: 'enemy-0' });
    expect(of(cleave.events, 'damage').filter(event => event.source.kind === 'skill').at(-1)!.offered)
      .toBe(radiantDirectDamage(attack, 0, 1));
    expect(member(cleave.state, 'thornia').signature).toMatchObject({ traps: [{ charges: 1 }] });
    state = nextTurn(nextTurn(cleave.state).state).state;
    expect(member(state, 'thornia').signature).toEqual({ kind: 'thorns', traps: [] });
  });
  it('does not spring after Thornia has fallen', () => {
    const state = battle(['tide', 'thornia']);
    member(state, 'thornia').signature = { kind: 'thorns', traps: [{ enemyId: 'enemy-0', charges: 3, remaining: 3, value: .6 }] };
    state.bearers[1].hp = 0;
    state.gauge.members[1].living = false;
    const ended = act(state, { type: 'end-turn' }).state;
    const result = act(ended, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['tide'], coefficient: 1 });
    expect(of(result.events, 'damage').some(event => event.source.kind === 'passive')).toBe(false);
  });
});

describe('Crinso: Combo', () => {
  it('adds Combo for alternating skills, uses the after-Golden-Edge power and resets on a repeat', () => {
    let state = charge(battle(['tide', 'crinso']), 'crinso', 100);
    const attack = member(state, 'crinso').stats.attack;
    state = act(state, { type: 'skill', bearerId: 'crinso', slot: 1, targetId: 'enemy-0' }).state;
    expect(member(state, 'crinso').signature).toEqual({ kind: 'combo', combo: 0, last: 1 });
    state = charge(nextTurn(state).state, 'crinso', 100);
    const rupture = act(state, { type: 'skill', bearerId: 'crinso', slot: 2, targetId: 'enemy-0' });
    expect(total(rupture.events, 'skill')).toBe(radiantDirectDamage(attack, 0, 3.7 * 1.5));
    expect(member(rupture.state, 'crinso').signature).toEqual({ kind: 'combo', combo: 1, last: 2 });
    state = charge(nextTurn(rupture.state).state, 'crinso', 100);
    state = act(state, { type: 'skill', bearerId: 'crinso', slot: 2, targetId: 'enemy-0' }).state;
    expect(member(state, 'crinso').signature).toEqual({ kind: 'combo', combo: 0, last: 2 });
  });
  it('ignores 20% Defense with Golden Edge after Crimson Rupture', () => {
    const state = charge(battle(['tide', 'crinso']), 'crinso', 25);
    state.enemies[0].stats.defense = 100;
    const attack = member(state, 'crinso').stats.attack;
    member(state, 'crinso').signature = { kind: 'combo', combo: 0, last: 2 };
    const edge = act(state, { type: 'skill', bearerId: 'crinso', slot: 1, targetId: 'enemy-0' });
    expect(total(edge.events, 'skill')).toBe(radiantDirectDamage(attack, 80, 2.5 * 1.5));
  });
  it('adds +200% per Combo to Blossoming Cataclysm and spends it', () => {
    const base = charge(battle(['tide', 'crinso']), 'crinso', 100);
    const plain = total(act(base, { type: 'flare', bearerId: 'crinso', targetId: 'enemy-0' }).events, 'flare');
    member(base, 'crinso').signature = { kind: 'combo', combo: 3, last: 1 };
    const combo = act(base, { type: 'flare', bearerId: 'crinso', targetId: 'enemy-0' });
    expect(total(combo.events, 'flare') / plain).toBeCloseTo((12 + 2 * 3) / 12, 3);
    expect(member(combo.state, 'crinso').signature).toEqual({ kind: 'combo', combo: 0, last: 1 });
  });
});

describe('Ozriel: Refusal', () => {
  it('lets each ally survive one lethal hit per encounter with 1 Health', () => {
    let state = act(battle(['ozriel', 'tide']), { type: 'end-turn' }).state;
    member(state, 'tide').hp = 5;
    const saved = act(state, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['tide'], coefficient: 50 });
    expect(member(saved.state, 'tide').hp).toBe(1);
    expect(of(saved.events, 'signature')).toEqual([{ type: 'signature', bearerId: 'ozriel', op: 'refusal', holderId: 'tide', amount: 1 }]);
    expect(member(saved.state, 'ozriel').signature).toEqual({ kind: 'refusal', spent: ['tide'] });
    state = act(act(saved.state, { type: 'finish-enemy-phase' }).state, { type: 'end-turn' }).state;
    const second = act(state, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['tide'], coefficient: 50 });
    expect(member(second.state, 'tide').hp).toBe(0);
  });
  it('saves nobody after Ozriel has fallen', () => {
    const state = battle(['ozriel', 'tide']);
    state.bearers[0].hp = 0;
    state.gauge.members[0].living = false;
    const ended = act(state, { type: 'end-turn' }).state;
    member(ended, 'tide').hp = 5;
    const result = act(ended, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['tide'], coefficient: 50 });
    expect(result.state.phase).toBe('defeat');
  });
});

describe('Ilvaris: Fate-seared Marks', () => {
  it('stacks Marks (max 5) for +10% damage each from allies and lets them expire after 2 turns', () => {
    let state = charge(battle(['ilvaris', 'rosetta']), 'ilvaris', 25);
    const attack = member(state, 'rosetta').stats.attack;
    state = act(state, { type: 'skill', bearerId: 'ilvaris', slot: 1, targetId: 'enemy-0' }).state;
    expect(member(state, 'ilvaris').signature).toEqual({ kind: 'marks', marks: [{ enemyId: 'enemy-0', stacks: 1, remaining: 2 }] });
    const marked = act(state, { type: 'normal', bearerId: 'rosetta', targetId: 'enemy-0' });
    expect(total(marked.events, 'normal')).toBe(radiantDirectDamage(attack, 0, 1, 1.1));
    const capped = structuredClone(state);
    member(capped, 'ilvaris').signature = { kind: 'marks', marks: [{ enemyId: 'enemy-0', stacks: 4, remaining: 1 }] };
    const flare = act(charge(nextTurn(capped).state, 'ilvaris', 100), { type: 'flare', bearerId: 'ilvaris' });
    expect(member(flare.state, 'ilvaris').signature).toEqual({ kind: 'marks', marks: [{ enemyId: 'enemy-0', stacks: 2, remaining: 2 }] });
    state = nextTurn(nextTurn(flare.state).state).state;
    expect(member(state, 'ilvaris').signature).toEqual({ kind: 'marks', marks: [] });
  });
  it('caps stacks at 5 and gives no bonus after Ilvaris has fallen', () => {
    const state = charge(battle(['ilvaris', 'rosetta']), 'ilvaris', 100);
    member(state, 'ilvaris').signature = { kind: 'marks', marks: [{ enemyId: 'enemy-0', stacks: 4, remaining: 1 }] };
    const flare = act(state, { type: 'flare', bearerId: 'ilvaris' });
    expect(member(flare.state, 'ilvaris').signature).toMatchObject({ marks: [{ stacks: 5, remaining: 2 }] });
    const fallen = structuredClone(flare.state);
    fallen.bearers[0].hp = 0;
    fallen.gauge.members[0].living = false;
    const attack = member(fallen, 'rosetta').stats.attack;
    expect(total(act(fallen, { type: 'normal', bearerId: 'rosetta', targetId: 'enemy-0' }).events, 'normal'))
      .toBe(radiantDirectDamage(attack, 0, 1));
  });
});

describe('Kaelith: Incisions', () => {
  it('adds an Incision to every enemy her skills hit and consumes them with Glass Meridian for +20% each', () => {
    let state = charge(battle(['tide', 'kaelith'], 2), 'kaelith', 65);
    const attack = member(state, 'kaelith').stats.attack;
    state = act(state, { type: 'skill', bearerId: 'kaelith', slot: 1 }).state;
    expect(member(state, 'kaelith').signature).toEqual({ kind: 'incisions',
      incisions: [{ enemyId: 'enemy-0', stacks: 1 }, { enemyId: 'enemy-1', stacks: 1 }] });
    state = nextTurn(state).state;
    const meridian = act(state, { type: 'skill', bearerId: 'kaelith', slot: 2, targetId: 'enemy-0' });
    expect(total(meridian.events, 'skill')).toBe(radiantDirectDamage(attack, 0, (3.6 + .2) * 1.5, 1.1));
    expect(member(meridian.state, 'kaelith').signature).toEqual({ kind: 'incisions', incisions: [{ enemyId: 'enemy-1', stacks: 1 }] });
  });
  it('caps Incisions at 3', () => {
    const state = charge(battle(['tide', 'kaelith']), 'kaelith', 25);
    member(state, 'kaelith').signature = { kind: 'incisions', incisions: [{ enemyId: 'enemy-0', stacks: 3 }] };
    const result = act(state, { type: 'skill', bearerId: 'kaelith', slot: 1 });
    expect(member(result.state, 'kaelith').signature).toEqual({ kind: 'incisions', incisions: [{ enemyId: 'enemy-0', stacks: 3 }] });
  });
});

describe('Batch 2 state validation', () => {
  it('rejects ledgers that reference defeated enemies or exceed their caps', () => {
    const trap = battle(['thornia'], 2);
    trap.enemies[1].hp = 0;
    member(trap, 'thornia').signature = { kind: 'thorns', traps: [{ enemyId: 'enemy-1', charges: 1, remaining: 1, value: .6 }] };
    expect(() => validateRadiantCombat(trap)).toThrow('Thorn Trap');
    const combo = battle(['crinso']);
    member(combo, 'crinso').signature = { kind: 'combo', combo: 6, last: 1 };
    expect(() => validateRadiantCombat(combo)).toThrow('Combo');
    const quarry = battle(['rosetta']);
    member(quarry, 'rosetta').signature = { kind: 'quarry', targetId: null, contributors: ['rosetta'] };
    expect(() => validateRadiantCombat(quarry)).toThrow('Quarry');
  });
});

describe('Batch 2 presentation replay', () => {
  it('replays Quarry, Thorn Trap, Combo, Refusal, Mark and Incision events without error', () => {
    const steps: { before: RadiantCombatState; result: ReturnType<typeof act> }[] = [];
    const step = (state: RadiantCombatState, action: RadiantCombatAction) => {
      const result = act(state, action);
      steps.push({ before: state, result });
      return result.state;
    };
    let state = battle(['ozriel', 'thornia', 'kaelith'], 2);
    state.gauge.members.forEach(entry => { entry.charge = 100; });
    state = step(state, { type: 'skill', bearerId: 'thornia', slot: 1, targetId: 'enemy-0' });
    state = step(state, { type: 'skill', bearerId: 'kaelith', slot: 1 });
    state = step(state, { type: 'skill', bearerId: 'ozriel', slot: 2 });
    state = structuredClone(state);
    member(state, 'kaelith').hp = 1;
    member(state, 'kaelith').shields = [];
    state = step(state, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['kaelith'], coefficient: 50 });
    state = step(state, { type: 'enemy-heal', enemyId: 'enemy-1', amount: 0 });
    step(state, { type: 'finish-enemy-phase' });
    let rose = battle(['ilvaris', 'rosetta', 'crinso'], 2);
    rose.gauge.members.forEach(entry => { entry.charge = 100; });
    rose = step(rose, { type: 'skill', bearerId: 'rosetta', slot: 1, targetId: 'enemy-0' });
    rose = step(rose, { type: 'skill', bearerId: 'ilvaris', slot: 1, targetId: 'enemy-0' });
    step(rose, { type: 'skill', bearerId: 'crinso', slot: 2, targetId: 'enemy-0' });
    const ops = new Set(steps.flatMap(({ result }) => of(result.events, 'signature').map(event => event.op)));
    expect([...ops].sort()).toEqual(['combo', 'contributor', 'incision', 'mark', 'quarry', 'refusal', 'trap', 'trap-strike']);
    for (const { before, result } of steps) expect(() => radiantImpactFrames(before, result.state, result.events)).not.toThrow();
  });
});
