import { describe, expect, it } from 'vitest';
import type { RadiantBearerId, RadiantLoadout } from '../content/combat-kits';
import { radiantFlareTierScale } from '../content/radiant-kits';
import { radiantImpactFrames } from '../presentation/battle-impact-frames';
import { applyRadiantCombatAction, createRadiantCombat, radiantBeat, radiantDirectDamage, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState } from './combat-engine';

/** Battle Flurry Phase 3 Step 2b batch 3 (D-473 kits): Elemental War signatures and Passives. */
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
/** Ends the player turn; the first enemy attacks `targetIds`, the rest heal 0. Returns the state still in the enemy phase. */
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
const personal = (state: RadiantCombatState, id: string) => state.gauge.members.find(entry => entry.id === id)!.charge;
const total = (events: RadiantCombatEvent[], kind: string, target?: string) => of(events, 'damage')
  .filter(event => event.source.kind === kind && (target === undefined || event.targetId === target))
  .reduce((sum, event) => sum + event.offered, 0);
const ops = (events: RadiantCombatEvent[]) => of(events, 'signature').map(event => event.op);

describe('Nerithe: Survey', () => {
  it('fills 5 extra Luminosity and adds Survey on a Normal hit, up to 3, moving to a newly surveyed enemy', () => {
    let state = battle(['bruno', 'nerithe'], 2);
    const before = personal(state, 'nerithe');
    const hit = act(state, { type: 'normal', bearerId: 'nerithe', targetId: 'enemy-0' });
    const drops = of(hit.events, 'gauge-drop').filter(event => event.bearerId === 'nerithe')
      .reduce((sum, event) => sum + event.amount, 0);
    expect(personal(hit.state, 'nerithe')).toBe(before + drops + 5);
    expect(member(hit.state, 'nerithe').signature).toEqual({ kind: 'survey', targetId: 'enemy-0', count: 1 });
    state = hit.state;
    for (let turn = 0; turn < 3; turn++) {
      state = nextTurn(state).state;
      state = act(state, { type: 'normal', bearerId: 'nerithe', targetId: 'enemy-0' }).state;
    }
    expect(member(state, 'nerithe').signature).toEqual({ kind: 'survey', targetId: 'enemy-0', count: 3 });
    state = act(nextTurn(state).state, { type: 'normal', bearerId: 'nerithe', targetId: 'enemy-1' }).state;
    expect(member(state, 'nerithe').signature).toEqual({ kind: 'survey', targetId: 'enemy-1', count: 1 });
  });
  it('aims Meridian Break at the Surveyed enemy and spends 1 Survey to ignore 25% of its Defense', () => {
    const state = charge(battle(['bruno', 'nerithe'], 2, 400), 'nerithe', 25);
    member(state, 'nerithe').signature = { kind: 'survey', targetId: 'enemy-0', count: 2 };
    const attack = member(state, 'nerithe').stats.attack;
    const result = act(state, { type: 'skill', bearerId: 'nerithe', slot: 1, targetId: 'enemy-1' });
    expect(total(result.events, 'skill', 'enemy-1')).toBe(0);
    expect(total(result.events, 'skill', 'enemy-0')).toBe(radiantDirectDamage(attack, 400 * .75, 2.6 * 1.5));
    expect(member(result.state, 'nerithe').signature).toEqual({ kind: 'survey', targetId: 'enemy-0', count: 1 });
  });
  it('strikes the current target at full Defense when no enemy holds Survey', () => {
    const state = charge(battle(['bruno', 'nerithe'], 2, 400), 'nerithe', 25);
    const attack = member(state, 'nerithe').stats.attack;
    const result = act(state, { type: 'skill', bearerId: 'nerithe', slot: 1, targetId: 'enemy-1' });
    expect(total(result.events, 'skill', 'enemy-1')).toBe(radiantDirectDamage(attack, 400, 2.6 * 1.5));
    expect(ops(result.events)).toEqual([]);
  });
  it('moves all Survey to the current target with Fold the Sea, which alone among all-enemy skills takes a target', () => {
    const state = charge(battle(['bruno', 'nerithe', 'kaelith'], 2), 'nerithe', 40);
    member(state, 'nerithe').signature = { kind: 'survey', targetId: 'enemy-0', count: 3 };
    const fold = act(state, { type: 'skill', bearerId: 'nerithe', slot: 2, targetId: 'enemy-1' });
    expect(new Set(of(fold.events, 'damage').map(event => event.targetId))).toEqual(new Set(['enemy-0', 'enemy-1']));
    expect(member(fold.state, 'nerithe').signature).toEqual({ kind: 'survey', targetId: 'enemy-1', count: 3 });
    const untargeted = act(state, { type: 'skill', bearerId: 'nerithe', slot: 2 });
    expect(member(untargeted.state, 'nerithe').signature).toEqual({ kind: 'survey', targetId: 'enemy-0', count: 3 });
    expect(() => act(charge(state, 'kaelith', 25), { type: 'skill', bearerId: 'kaelith', slot: 1, targetId: 'enemy-0' }))
      .toThrow('authored target set');
  });
  it('spends all Survey with its Convergent Light (20% Defense ignored each) and loses Survey when its enemy falls', () => {
    const state = charge(battle(['bruno', 'nerithe'], 2, 400), 'nerithe', 100);
    member(state, 'nerithe').signature = { kind: 'survey', targetId: 'enemy-0', count: 3 };
    const attack = member(state, 'nerithe').stats.attack;
    const result = act(state, { type: 'flare', bearerId: 'nerithe', targetId: 'enemy-1' });
    const tier = of(result.events, 'flare')[0].tier;
    expect(total(result.events, 'flare', 'enemy-0'))
      .toBe(radiantDirectDamage(attack, 400 * .4, 12.5 * radiantFlareTierScale[tier].damage * 1.5));
    expect(member(result.state, 'nerithe').signature).toEqual({ kind: 'survey', targetId: null, count: 0 });
    const fragile = battle(['bruno', 'nerithe'], 2, 0, 1);
    member(fragile, 'nerithe').signature = { kind: 'survey', targetId: 'enemy-0', count: 2 };
    const defeat = act(fragile, { type: 'normal', bearerId: 'bruno', targetId: 'enemy-0' });
    expect(member(defeat.state, 'nerithe').signature).toEqual({ kind: 'survey', targetId: null, count: 0 });
  });
});

describe('Orvella: Foundation', () => {
  it('creates a Foundation that absorbs 20% of each enemy hit on an ally before Shields', () => {
    let state = charge(battle(['tide', 'orvella', 'bruno']), 'orvella', 40);
    const created = act(state, { type: 'skill', bearerId: 'orvella', slot: 2 });
    const durability = Math.round(.35 * member(state, 'orvella').stats.hp);
    expect(member(created.state, 'orvella').signature).toEqual({ kind: 'foundation',
      foundation: { durability, max: durability, remaining: 3 } });
    state = created.state;
    const phase = enemyPhase(state, ['bruno'], 5);
    const hit = of(phase.events, 'damage').find(event => event.targetId === 'bruno')!;
    const left = (member(phase.state, 'orvella').signature as { foundation: { durability: number } }).foundation.durability;
    const absorbed = durability - left;
    expect(absorbed).toBe(Math.round((hit.offered + absorbed) * .2));
    expect(of(phase.events, 'signature')).toContainEqual({ type: 'signature', bearerId: 'orvella', op: 'foundation-absorb',
      holderId: 'bruno', amount: left });
  });
  it('deals 270% with no Foundation; with one, deals 210% and repairs 8% up to the created durability', () => {
    const state = charge(battle(['tide', 'orvella']), 'orvella', 25);
    const attack = member(state, 'orvella').stats.attack, hp = member(state, 'orvella').stats.hp;
    expect(total(act(state, { type: 'skill', bearerId: 'orvella', slot: 1, targetId: 'enemy-0' }).events, 'skill'))
      .toBe(radiantDirectDamage(attack, 0, 2.7));
    member(state, 'orvella').signature = { kind: 'foundation', foundation: { durability: 10, max: 100000, remaining: 2 } };
    const repaired = act(state, { type: 'skill', bearerId: 'orvella', slot: 1, targetId: 'enemy-0' });
    expect(total(repaired.events, 'skill')).toBe(radiantDirectDamage(attack, 0, 2.1));
    expect(member(repaired.state, 'orvella').signature).toMatchObject({ foundation: { durability: 10 + Math.round(.08 * hp) } });
    member(state, 'orvella').signature = { kind: 'foundation', foundation: { durability: 50, max: 60, remaining: 2 } };
    expect(member(act(state, { type: 'skill', bearerId: 'orvella', slot: 1, targetId: 'enemy-0' }).state, 'orvella').signature)
      .toMatchObject({ foundation: { durability: 60 } });
  });
  it('spends the Foundation with its Convergent Light for an exact strike of 3x durability on each enemy, then raises a new one', () => {
    const state = charge(battle(['tide', 'orvella'], 2), 'orvella', 100);
    member(state, 'orvella').signature = { kind: 'foundation', foundation: { durability: 500, max: 500, remaining: 1 } };
    const result = act(state, { type: 'flare', bearerId: 'orvella' });
    const scale = radiantFlareTierScale[of(result.events, 'flare')[0].tier];
    const strikes = of(result.events, 'damage').filter(event => event.offered === Math.round(1500 * scale.damage));
    expect(strikes.map(event => event.targetId).sort()).toEqual(['enemy-0', 'enemy-1']);
    const durability = Math.round(.5 * scale.effect * member(state, 'orvella').stats.hp);
    expect(member(result.state, 'orvella').signature).toEqual({ kind: 'foundation',
      foundation: { durability, max: durability, remaining: 3 } });
  });
  it('collapses when Orvella falls and expires after 3 turns', () => {
    const state = battle(['tide', 'orvella']);
    member(state, 'orvella').signature = { kind: 'foundation', foundation: { durability: 5000, max: 5000, remaining: 3 } };
    member(state, 'orvella').hp = 1;
    const fallen = enemyPhase(state, ['orvella'], 50);
    expect(member(fallen.state, 'orvella').hp).toBe(0);
    expect(member(fallen.state, 'orvella').signature).toEqual({ kind: 'foundation', foundation: null });
    let clock = battle(['tide', 'orvella']);
    member(clock, 'orvella').signature = { kind: 'foundation', foundation: { durability: 5000, max: 5000, remaining: 3 } };
    for (let turn = 0; turn < 2; turn++) clock = nextTurn(clock).state;
    expect(member(clock, 'orvella').signature).toMatchObject({ foundation: { remaining: 1 } });
    expect(member(nextTurn(clock).state, 'orvella').signature).toEqual({ kind: 'foundation', foundation: null });
  });
});

describe('Vaelor: Beat', () => {
  it('cycles Tune, Rise, Crescendo one step per player turn and announces each step', () => {
    expect([1, 2, 3, 4].map(radiantBeat)).toEqual([0, 1, 2, 0]);
    const turn = nextTurn(battle(['tide', 'vaelor']));
    expect(of(turn.events, 'signature')).toEqual([{ type: 'signature', bearerId: 'vaelor', op: 'beat', amount: 1 }]);
  });
  it('gives Forked Cadence +30% on Tune, Attack Up on Rise and the 1500% Convergent Light on Crescendo', () => {
    let state = charge(battle(['tide', 'vaelor']), 'vaelor', 25);
    const attack = member(state, 'vaelor').stats.attack;
    expect(total(act(state, { type: 'skill', bearerId: 'vaelor', slot: 1, targetId: 'enemy-0' }).events, 'skill'))
      .toBe(radiantDirectDamage(attack, 0, 2.5 * 1.5 * 1.3));
    expect(of(act(charge(state, 'vaelor', 40), { type: 'skill', bearerId: 'vaelor', slot: 2 }).events, 'status')).toEqual([]);
    state = charge(nextTurn(state).state, 'vaelor', 40);
    expect(total(act(state, { type: 'skill', bearerId: 'vaelor', slot: 1, targetId: 'enemy-0' }).events, 'skill'))
      .toBe(radiantDirectDamage(attack, 0, 2.5 * 1.5));
    const rise = act(state, { type: 'skill', bearerId: 'vaelor', slot: 2 });
    expect(of(rise.events, 'status')).toMatchObject([{ targetId: 'vaelor', status: 'attack-up', magnitude: .25 * 1.5 }]);
    state = charge(nextTurn(state).state, 'vaelor', 100);
    const chord = act(state, { type: 'flare', bearerId: 'vaelor' });
    const scale = radiantFlareTierScale[of(chord.events, 'flare')[0].tier].damage;
    expect(total(chord.events, 'flare')).toBe(radiantDirectDamage(attack, 0, 15 * scale * 1.5));
  });
});

describe('Caldrex: Heat', () => {
  it('gains 1 Heat once per enemy phase when an enemy damages him, up to 3', () => {
    let state = battle(['tide', 'caldrex'], 2);
    let phase = enemyPhase(state, ['caldrex'], 2, 2);
    expect(member(phase.state, 'caldrex').signature).toEqual({ kind: 'heat', count: 1, latch: true });
    state = act(phase.state, { type: 'finish-enemy-phase' }).state;
    expect(member(state, 'caldrex').signature).toMatchObject({ count: 1, latch: false });
    for (let turn = 0; turn < 3; turn++) {
      phase = enemyPhase(state, ['caldrex'], 2);
      state = act(phase.state, { type: 'finish-enemy-phase' }).state;
    }
    expect(member(state, 'caldrex').signature).toMatchObject({ count: 3 });
  });
  it('spends all Heat on Cinder Discharge (+25% each) and its Convergent Light (+5% Shield each)', () => {
    const state = charge(battle(['tide', 'caldrex']), 'caldrex', 100);
    member(state, 'caldrex').signature = { kind: 'heat', count: 2, latch: false };
    const attack = member(state, 'caldrex').stats.attack;
    const discharge = act(state, { type: 'skill', bearerId: 'caldrex', slot: 2 });
    expect(total(discharge.events, 'skill')).toBe(radiantDirectDamage(attack, 0, 2.2 + .5));
    expect(member(discharge.state, 'caldrex').signature).toMatchObject({ count: 0 });
    const gates = act(state, { type: 'flare', bearerId: 'caldrex' });
    const effect = radiantFlareTierScale[of(gates.events, 'flare')[0].tier].effect;
    const tide = member(state, 'tide');
    expect(of(gates.events, 'shield').find(event => event.targetId === 'tide')!.amount)
      .toBe(Math.round((.5 + .1) * effect * tide.stats.hp));
    expect(member(gates.state, 'caldrex').signature).toMatchObject({ count: 0 });
    expect(member(gates.state, 'caldrex').burnUp).toEqual({ value: .25 * effect, remaining: 2 });
  });
  it('boosts Burn ticks from allies while Nothing Beyond These Gates lasts', () => {
    let state = charge(battle(['tide', 'caldrex']), 'caldrex', 40);
    state = act(state, { type: 'skill', bearerId: 'caldrex', slot: 2 }).state;
    const burn = state.enemies[0].debuffs.find(effect => effect.category === 'burn')!.magnitude;
    state = nextTurn(state).state;
    state = act(charge(state, 'caldrex', 100), { type: 'flare', bearerId: 'caldrex' }).state;
    const boost = member(state, 'caldrex').burnUp!.value;
    const ticks = (events: RadiantCombatEvent[]) => of(events, 'damage').filter(event => event.origin === 'periodic');
    const first = nextTurn(state);
    expect(ticks(first.events).map(event => event.offered)).toEqual([Math.round(burn * (1 + boost))]);
    const second = nextTurn(first.state);
    expect(member(second.state, 'caldrex').burnUp).toBeNull();
  });
});

describe('Solenne: Stillness', () => {
  it('gains 2 Stillness with Circle of Repose and spends 1 per enemy hit to reduce it by 20%', () => {
    const plain = enemyPhase(battle(['tide', 'solenne']), ['solenne'], 20);
    const full = of(plain.events, 'damage')[0].offered;
    let state = charge(battle(['tide', 'solenne']), 'solenne', 40);
    state = act(state, { type: 'skill', bearerId: 'solenne', slot: 2 }).state;
    expect(member(state, 'solenne').signature).toEqual({ kind: 'stillness', count: 2, latch: false });
    const held = enemyPhase(state, ['solenne'], 20);
    expect(of(held.events, 'damage')[0].offered).toBe(full - Math.round(full * .2));
    expect(member(held.state, 'solenne').signature).toMatchObject({ count: 1 });
  });
  it('caps Stillness at 4 and spends it all on its Convergent Light (+45% damage and +5% Shield each)', () => {
    const state = charge(battle(['tide', 'solenne']), 'solenne', 100);
    member(state, 'solenne').signature = { kind: 'stillness', count: 3, latch: false };
    expect(member(act(charge(structuredClone(state), 'solenne', 40), { type: 'skill', bearerId: 'solenne', slot: 2 }).state,
      'solenne').signature).toMatchObject({ count: 4 });
    const attack = member(state, 'solenne').stats.attack;
    const flare = act(state, { type: 'flare', bearerId: 'solenne' });
    const scale = radiantFlareTierScale[of(flare.events, 'flare')[0].tier];
    expect(total(flare.events, 'flare')).toBe(radiantDirectDamage(attack, 0, (7 + 3 * .45) * scale.damage));
    expect(of(flare.events, 'shield').find(event => event.targetId === 'tide')!.amount)
      .toBe(Math.round((.25 + .15) * scale.effect * member(state, 'tide').stats.hp));
    expect(member(flare.state, 'solenne').signature).toMatchObject({ count: 0 });
  });
});

describe('Myrthen: Season', () => {
  it('advances Sprout, Bloom, Harvest with skills; Harvest adds +35% and 20% Defense ignore, then returns to Sprout', () => {
    let state = charge(battle(['tide', 'myrthen'], 2, 400), 'myrthen', 25);
    const attack = member(state, 'myrthen').stats.attack;
    state = act(state, { type: 'skill', bearerId: 'myrthen', slot: 1, targetId: 'enemy-0' }).state;
    expect(member(state, 'myrthen').signature).toMatchObject({ kind: 'season', count: 1 });
    state = act(charge(nextTurn(state).state, 'myrthen', 40), { type: 'skill', bearerId: 'myrthen', slot: 2 }).state;
    expect(member(state, 'myrthen').signature).toMatchObject({ count: 2 });
    const harvest = act(charge(nextTurn(state).state, 'myrthen', 25), { type: 'skill', bearerId: 'myrthen', slot: 1, targetId: 'enemy-1' });
    expect(total(harvest.events, 'skill', 'enemy-1')).toBe(radiantDirectDamage(attack, 400 * .8, 2.5 * 1.5 * 1.35));
    expect(member(harvest.state, 'myrthen').signature).toMatchObject({ count: 0 });
  });
  it('keeps the Season through a Convergent Light outside Harvest and resets it after a Convergent Light in Harvest', () => {
    const state = charge(battle(['tide', 'myrthen']), 'myrthen', 100);
    member(state, 'myrthen').signature = { kind: 'season', count: 1, latch: false };
    expect(member(act(state, { type: 'flare', bearerId: 'myrthen', targetId: 'enemy-0' }).state, 'myrthen').signature)
      .toMatchObject({ count: 1 });
    member(state, 'myrthen').signature = { kind: 'season', count: 2, latch: false };
    const attack = member(state, 'myrthen').stats.attack;
    const ripe = act(state, { type: 'flare', bearerId: 'myrthen', targetId: 'enemy-0' });
    const scale = radiantFlareTierScale[of(ripe.events, 'flare')[0].tier].damage;
    expect(total(ripe.events, 'flare')).toBe(radiantDirectDamage(attack, 0, 12.5 * scale * 1.5 * 1.35));
    expect(member(ripe.state, 'myrthen').signature).toMatchObject({ count: 0 });
  });
});

describe('Neralis: Current', () => {
  it('gains 1 Current from a Normal hit and from a skill heal that restores Health, but not from a full-Health heal', () => {
    let state = charge(battle(['bruno', 'neralis']), 'neralis', 25);
    expect(member(act(state, { type: 'normal', bearerId: 'neralis', targetId: 'enemy-0' }).state, 'neralis').signature)
      .toMatchObject({ kind: 'current', count: 1 });
    expect(member(act(state, { type: 'skill', bearerId: 'neralis', slot: 1 }).state, 'neralis').signature).toMatchObject({ count: 0 });
    member(state, 'bruno').hp = 1;
    state = act(state, { type: 'skill', bearerId: 'neralis', slot: 1 }).state;
    expect(member(state, 'neralis').signature).toMatchObject({ count: 1 });
  });
  it('spends all Current on Carry Them Back (+6% heal each) and earns 1 back when that heal restores Health', () => {
    const state = charge(battle(['bruno', 'neralis']), 'neralis', 40);
    member(state, 'neralis').signature = { kind: 'current', count: 2, latch: false };
    member(state, 'bruno').hp = 1;
    const result = act(state, { type: 'skill', bearerId: 'neralis', slot: 2 });
    const healed = of(result.events, 'heal').find(event => event.targetId === 'bruno' && event.source.kind === 'skill')!;
    expect(healed.offered).toBe(Math.round((.18 + .12) * 1.25 * member(state, 'bruno').stats.hp));
    expect(ops(result.events)).toEqual(['current', 'current']);
    expect(member(result.state, 'neralis').signature).toMatchObject({ count: 1 });
  });
});

describe('Varkhel: Tension', () => {
  it('gains Tension from his Normal hits and once per enemy phase from enemy hits, up to 4', () => {
    let state = battle(['tide', 'varkhel'], 2);
    state = act(state, { type: 'normal', bearerId: 'varkhel', targetId: 'enemy-0' }).state;
    const phase = enemyPhase(state, ['varkhel'], 2, 2);
    expect(member(phase.state, 'varkhel').signature).toEqual({ kind: 'tension', count: 2, latch: true });
    state = act(phase.state, { type: 'finish-enemy-phase' }).state;
    for (let turn = 0; turn < 3; turn++)
      state = nextTurn(act(state, { type: 'normal', bearerId: 'varkhel', targetId: 'enemy-0' }).state).state;
    expect(member(state, 'varkhel').signature).toMatchObject({ count: 4 });
  });
  it('spends all Tension on Return the Strain (+45% each, 20% Defense ignored)', () => {
    const state = charge(battle(['tide', 'varkhel'], 1, 400), 'varkhel', 40);
    member(state, 'varkhel').signature = { kind: 'tension', count: 3, latch: false };
    const attack = member(state, 'varkhel').stats.attack;
    const result = act(state, { type: 'skill', bearerId: 'varkhel', slot: 2, targetId: 'enemy-0' });
    expect(total(result.events, 'skill')).toBe(radiantDirectDamage(attack, 400 * .8, 2.6 + 3 * .45));
    expect(member(result.state, 'varkhel').signature).toMatchObject({ count: 0 });
  });
});

describe('Seravelle: Cadence', () => {
  it('adds 1 Cadence for the first ally Normal hit each turn while Seravelle lives', () => {
    let state = battle(['tide', 'seravelle', 'bruno']);
    state = act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy-0' }).state;
    state = act(state, { type: 'normal', bearerId: 'seravelle', targetId: 'enemy-0' }).state;
    expect(member(state, 'seravelle').signature).toEqual({ kind: 'cadence', count: 1, latch: true });
    state = nextTurn(state).state;
    state = act(state, { type: 'normal', bearerId: 'bruno', targetId: 'enemy-0' }).state;
    expect(member(state, 'seravelle').signature).toMatchObject({ count: 2 });
    state = nextTurn(state).state;
    member(state, 'seravelle').hp = 0;
    member(state, 'seravelle').shields = [];
    state.gauge.members[1].living = false;
    expect(member(act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy-0' }).state, 'seravelle').signature)
      .toMatchObject({ count: 2 });
  });
  it('spends all Cadence on Move as One (+10% Attack Up each)', () => {
    const state = charge(battle(['tide', 'seravelle']), 'seravelle', 40);
    member(state, 'seravelle').signature = { kind: 'cadence', count: 3, latch: false };
    const result = act(state, { type: 'skill', bearerId: 'seravelle', slot: 2 });
    expect(of(result.events, 'status').filter(event => event.status === 'attack-up').map(event => event.magnitude))
      .toEqual([(.3 + .1 * 3) * 1.25, (.3 + .1 * 3) * 1.25]);
    expect(member(result.state, 'seravelle').signature).toMatchObject({ count: 0 });
  });
});

describe('Velmira: Crosscut', () => {
  it('adds 1 Crosscut per skill that hits an enemy Weakened before the hit, so Open the Seam\'s own Weaken does not count', () => {
    let state = charge(battle(['tide', 'velmira'], 2), 'velmira', 25);
    state = act(state, { type: 'skill', bearerId: 'velmira', slot: 1, targetId: 'enemy-0' }).state;
    expect(member(state, 'velmira').signature).toMatchObject({ kind: 'crosscut', count: 0 });
    state = act(charge(nextTurn(state).state, 'velmira', 40), { type: 'skill', bearerId: 'velmira', slot: 2 }).state;
    expect(member(state, 'velmira').signature).toMatchObject({ count: 1 });
  });
  it('ignores 20% Defense with Turn the Other Edge at 2+ Crosscut and spends all on its Convergent Light (+90% each)', () => {
    const state = charge(battle(['tide', 'velmira'], 1, 400), 'velmira', 100);
    const attack = member(state, 'velmira').stats.attack;
    member(state, 'velmira').signature = { kind: 'crosscut', count: 1, latch: false };
    expect(total(act(state, { type: 'skill', bearerId: 'velmira', slot: 2 }).events, 'skill'))
      .toBe(radiantDirectDamage(attack, 400, 1.8 * 1.5));
    member(state, 'velmira').signature = { kind: 'crosscut', count: 2, latch: false };
    const edge = act(state, { type: 'skill', bearerId: 'velmira', slot: 2 });
    expect(total(edge.events, 'skill')).toBe(radiantDirectDamage(attack, 400 * .8, 1.8 * 1.5));
    expect(member(edge.state, 'velmira').signature).toMatchObject({ count: 2 });
    member(state, 'velmira').signature = { kind: 'crosscut', count: 3, latch: false };
    const door = act(state, { type: 'flare', bearerId: 'velmira', targetId: 'enemy-0' });
    const scale = radiantFlareTierScale[of(door.events, 'flare')[0].tier].damage;
    expect(total(door.events, 'flare')).toBe(radiantDirectDamage(attack, 400 * .7, (10 + 2.7) * scale * 1.5));
    expect(member(door.state, 'velmira').signature).toMatchObject({ count: 0 });
  });
});

describe('Batch 3 state and presentation', () => {
  it('rejects counters above their caps and malformed Survey or Foundation state', () => {
    const cases: [RadiantBearerId, unknown, string][] = [
      ['nerithe', { kind: 'survey', targetId: 'enemy-0', count: 4 }, 'Survey'],
      ['nerithe', { kind: 'survey', targetId: null, count: 1 }, 'Survey'],
      ['orvella', { kind: 'foundation', foundation: { durability: 11, max: 10, remaining: 2 } }, 'Foundation'],
      ['caldrex', { kind: 'heat', count: 1, latch: 'no' }, 'heat'],
      ['solenne', { kind: 'stillness', count: 5, latch: false }, 'stillness'],
      ['myrthen', { kind: 'season', count: 3, latch: false }, 'season'],
      ['seravelle', { kind: 'cadence', count: 4, latch: false }, 'cadence'],
      ['velmira', { kind: 'season', count: 0, latch: false }, 'signature state'],
    ];
    for (const [starter, signature, message] of cases) {
      const state = battle(['tide', starter]);
      (member(state, starter) as { signature: unknown }).signature = signature;
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
    let state = battle(['nerithe', 'orvella', 'caldrex'], 2);
    state.gauge.members.forEach(entry => { entry.charge = 100; });
    state = step(state, { type: 'normal', bearerId: 'nerithe', targetId: 'enemy-0' });
    state = step(state, { type: 'skill', bearerId: 'orvella', slot: 2 });
    state = step(state, { type: 'flare', bearerId: 'caldrex' });
    state = step(state, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['caldrex'], coefficient: 20 });
    state = step(state, { type: 'enemy-heal', enemyId: 'enemy-1', amount: 0 });
    step(state, { type: 'finish-enemy-phase' });
    let bell = battle(['vaelor', 'solenne']);
    bell.gauge.members.forEach(entry => { entry.charge = 100; });
    bell = step(bell, { type: 'skill', bearerId: 'solenne', slot: 2 });
    bell = step(bell, { type: 'end-turn' });
    bell = step(bell, { type: 'enemy-attack', enemyId: 'enemy-0', targetIds: ['solenne'], coefficient: 20 });
    step(bell, { type: 'finish-enemy-phase' });
    let war = battle(['varkhel', 'neralis', 'seravelle'], 1);
    war.gauge.members.forEach(entry => { entry.charge = 100; });
    war = step(war, { type: 'normal', bearerId: 'varkhel', targetId: 'enemy-0' });
    war = step(war, { type: 'normal', bearerId: 'neralis', targetId: 'enemy-0' });
    step(war, { type: 'skill', bearerId: 'seravelle', slot: 2 });
    let edge = battle(['myrthen', 'velmira'], 1);
    edge.gauge.members.forEach(entry => { entry.charge = 100; });
    edge = step(edge, { type: 'skill', bearerId: 'velmira', slot: 1, targetId: 'enemy-0' });
    edge = step(edge, { type: 'skill', bearerId: 'myrthen', slot: 2 });
    edge = step(nextTurn(edge).state, { type: 'skill', bearerId: 'velmira', slot: 2 });
    const seen = new Set(steps.flatMap(({ result }) => ops(result.events)));
    expect([...seen].sort()).toEqual(['beat', 'burn-up', 'cadence', 'crosscut', 'current', 'foundation', 'foundation-absorb',
      'heat', 'season', 'stillness', 'survey', 'tension']);
    for (const { before, result } of steps) expect(() => radiantImpactFrames(before, result.state, result.events)).not.toThrow();
  });
});
