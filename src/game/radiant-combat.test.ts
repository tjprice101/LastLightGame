import { describe, expect, it } from 'vitest';
import {
  radiantAttunement, radiantAttunements, radiantFlares, radiantMasters, radiantStarterKits,
  resolveRadiantStarterStats, type RadiantLoadout, type RadiantMasterId, type RadiantStarter,
} from '../content/radiant-combat';
import {
  applyRadiantCombatAction, createRadiantCombat, depleteRadiantCurrency, effectiveRadiantStats,
  radiantDirectDamage, validateRadiantCombat, validateRadiantCurrencyLedger,
  type RadiantCombatAction, type RadiantCombatState, type RadiantSource,
} from './radiant-combat';
import { readyFlare, sharedChargeThreshold } from './radiant-gauge';

function loadout(starter: RadiantStarter = 'infernis', overrides: Partial<RadiantLoadout> = {}): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 1, masterId: null,
    weaponRank: 0, ascended: false, imbue: 0, ...overrides };
}
function fixture(starters: RadiantStarter[] = ['infernis'], form = 1, enemyHP = 10000): RadiantCombatState {
  return createRadiantCombat(starters.map((starter, index) => loadout(starter, { id: `ally-${index}`, form })),
    [{ id: 'enemy', stats: { hp: enemyHP, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 101 }], 0);
}
function apply(state: RadiantCombatState, action: RadiantCombatAction): RadiantCombatState {
  return applyRadiantCombatAction(state, action).state;
}
function charged(state: RadiantCombatState, tier: 'glowing' | 'lustrous' | 'eternal', id = 'ally-0'): RadiantCombatState {
  const next = structuredClone(state);
  const member = next.gauge.members.find(member => member.id === id)!;
  member.charge = member.baseCost * (tier === 'glowing' ? 1 : 2);
  if (tier === 'eternal') next.gauge.sharedUnits = sharedChargeThreshold(next.gauge.eternalCasts);
  return next;
}
function passPlayers(state: RadiantCombatState): RadiantCombatState {
  for (const member of state.bearers.filter(member => member.hp > 0)) {
    if (!state.acted.includes(member.loadout.id)) state = apply(state, { type: 'defense', bearerId: member.loadout.id });
  }
  return state;
}
function nextRound(state: RadiantCombatState): RadiantCombatState {
  state = passPlayers(state);
  for (const member of state.enemies.filter(member => member.hp > 0)) {
    if (!state.enemyActed.includes(member.id))
      state = apply(state, { type: 'enemy-heal', enemyId: member.id, amount: 0 });
  }
  return apply(state, { type: 'finish-enemy-phase' });
}
function weaken(state: RadiantCombatState, index: number, magnitude: number, remaining = 2): void {
  state.bearers[index].weaken.push({ source: { kind: 'enemy', enemyId: 'enemy' }, magnitude, remaining });
}
function sourceShield(state: RadiantCombatState, index: number, source: RadiantSource, remaining: number): void {
  state.bearers[index].shields.push({ id: state.nextShieldId++, source, remaining });
}

describe('radiant four-stat frozen starter content', () => {
  it.each(['infernis', 'tizu', 'flora'] as const)('resolves %s with fractional Defense and source Recovery', starter => {
    const stats = resolveRadiantStarterStats(loadout(starter, { level: 30 }));
    const base = radiantStarterKits[starter].base;
    expect(stats.hp).toBe(base.hp * 5.5);
    expect(stats.attack).toBe(base.attack * 5.5);
    expect(stats.recovery).toBe(base.recovery * 5.5);
    expect(stats.defense).toBeCloseTo(base.defense * 5.5 ** .7);
    expect(Object.keys(stats)).toEqual(['hp', 'attack', 'defense', 'recovery']);
  });
  it.each(Object.keys(radiantMasters) as RadiantMasterId[])('remaps %s without cumulative subtype changes', masterId => {
    const master = radiantMasters[masterId];
    const baseLoadout = loadout(master.starter);
    const base = resolveRadiantStarterStats(baseLoadout);
    const equipped = { ...baseLoadout, masterId };
    expect(radiantAttunement(equipped)).toBe(master.attunement);
    const modified = resolveRadiantStarterStats(equipped);
    for (const stat of ['hp', 'attack', 'defense', 'recovery'] as const)
      expect(modified[stat]).toBeCloseTo(base[stat] * radiantAttunements[master.attunement][stat]);
    expect(resolveRadiantStarterStats({ ...equipped, masterId: null })).toEqual(base);
    expect(radiantAttunement({ ...equipped, masterId: null })).toBe('equinox');
  });
  it('retains weapon investment and ascension without adding a hidden fifth stat', () => {
    const stats = resolveRadiantStarterStats(loadout('infernis', { weaponRank: 5, ascended: true }));
    expect(stats.attack).toBeCloseTo(60 * 1.1 * 1.5);
    expect(stats.hp).toBe(240 * 1.5);
  });
  it('rejects mismatched Masters, unknown starters, nonfinite levels and overflow', () => {
    expect(() => resolveRadiantStarterStats(loadout('flora', { masterId: 'master-tide-1' }))).toThrow('match');
    expect(() => resolveRadiantStarterStats(loadout('retired' as RadiantStarter))).toThrow('loadout');
    expect(() => resolveRadiantStarterStats(loadout('flora', { level: NaN }))).toThrow('loadout');
    expect(() => resolveRadiantStarterStats(loadout('infernis', { level: 115, weaponRank: Number.MAX_SAFE_INTEGER })))
      .toThrow('four-stat');
  });
});

describe('deterministic diminishing direct damage', () => {
  it('keeps coefficient and guarding outside the base Attack ratio, with one final rounding', () => {
    expect(radiantDirectDamage(100, 100, 1)).toBe(50);
    expect(radiantDirectDamage(100, 100, 2)).toBe(100);
    expect(radiantDirectDamage(100, 100, 2, .5)).toBe(50);
    expect(radiantDirectDamage(1, 100000, .1)).toBe(1);
    expect(radiantDirectDamage(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 1))
      .toBe(Math.round(Number.MAX_SAFE_INTEGER / 2));
    expect(() => radiantDirectDamage(Infinity, 0, 1)).toThrow('Attack');
    expect(() => radiantDirectDamage(1, -1, 1)).toThrow('Defense');
    expect(() => radiantDirectDamage(1, 1, 0)).toThrow('coefficient');
  });
  it('never randomizes damage: only the dedicated bounded charge seed changes', () => {
    const first = fixture();
    const second = structuredClone(first);
    second.chargeSeed = 999;
    const action = { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' } as const;
    const a = applyRadiantCombatAction(first, action), b = applyRadiantCombatAction(second, action);
    expect(a.events.filter(event => event.type === 'damage')).toEqual(b.events.filter(event => event.type === 'damage'));
    expect(a.state.chargeSeed).not.toBe(b.state.chargeSeed);
    expect(a.state.gauge.members[0].charge).toBe(25);
    expect(first.chargeSeed).toBe(0);
  });
});

describe('six-member action rounds, fixed leader and state isolation', () => {
  it.each([1, 2, 3, 4, 5, 6])('requires each of %i members to act once and preserves normalized round charge', size => {
    let state = fixture(Array.from({ length: size }, () => 'infernis'), 6);
    for (let index = 0; index < size; index++) {
      state = apply(state, { type: 'defense', bearerId: `ally-${index}` });
      expect(state.phase).toBe(index === size - 1 ? 'enemy' : 'player');
    }
    expect(() => apply(state, { type: 'finish-enemy-phase' })).toThrow('Every living enemy');
    expect(() => apply(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' })).toThrow('player phase');
    state = apply(state, { type: 'enemy-heal', enemyId: 'enemy', amount: 0 });
    expect(() => apply(state, { type: 'enemy-heal', enemyId: 'enemy', amount: 0 })).toThrow('already acted');
    state = apply(state, { type: 'finish-enemy-phase' });
    expect(state.round).toBe(2);
    expect(state.acted).toEqual([]);
    expect(state.bearers.every(member => !member.guarding)).toBe(true);
    expect(state.gauge.members.every(member => member.charge === 15)).toBe(true);
    expect(state.gauge.sharedUnits).toBe(24 * 60);
  });
  it('does not promote a surviving leader when first member dies and lets all survivors act next round', () => {
    let state = fixture(['infernis', 'tizu', 'flora', 'tizu', 'flora', 'infernis']);
    expect(effectiveRadiantStats(state, 'ally-1').attack).toBeCloseTo(44 * 1.15);
    expect(effectiveRadiantStats(state, 'ally-2').recovery).toBe(65);
    state = passPlayers(state);
    state = apply(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-0'], coefficient: 1000 });
    expect(state.bearers[0].hp).toBe(0);
    expect(effectiveRadiantStats(state, 'ally-1').attack).toBe(44);
    expect(effectiveRadiantStats(state, 'ally-1').defense).toBe(22);
    state = apply(state, { type: 'finish-enemy-phase' });
    expect(state.gauge.members[0].charge).toBe(10);
    expect(() => apply(state, { type: 'defense', bearerId: 'ally-0' })).toThrow('Defeated');
    state = passPlayers(state);
    expect(state.phase).toBe('enemy');
    expect(state.acted).toEqual(['ally-1', 'ally-2', 'ally-3', 'ally-4', 'ally-5']);
  });
  it('keeps input, returned state, events and frozen loadouts independent', () => {
    const inputLoadout = loadout();
    const state = createRadiantCombat([inputLoadout],
      [{ id: 'enemy', stats: { hp: 1000, attack: 1, defense: 1, recovery: 0 }, currencyBudget: 100 }], 0);
    inputLoadout.masterId = 'master-ember-1';
    const before = structuredClone(state);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'infernis', targetId: 'enemy' });
    expect(state).toEqual(before);
    expect(state.bearers[0].loadout.masterId).toBeNull();
    result.state.bearers[0].loadout.level = 99;
    expect(state.bearers[0].loadout.level).toBe(0);
    const shieldResult = applyRadiantCombatAction(charged(fixture(['tizu']), 'glowing'),
      { type: 'flare', bearerId: 'ally-0' });
    const shieldEvent = shieldResult.events.find(event => event.type === 'shield')!;
    if ('bearerId' in shieldEvent.source) shieldEvent.source.bearerId = 'presentation-only';
    expect(shieldResult.state.bearers[0].shields[0].source).toEqual({ kind: 'flare', bearerId: 'ally-0' });
  });
  it('rejects duplicate/oversized squads, forged frozen stats and inconsistent gauges', () => {
    expect(() => fixture(Array.from({ length: 7 }, () => 'flora'))).toThrow('roster');
    expect(() => createRadiantCombat([loadout(), loadout()],
      [{ id: 'enemy', stats: { hp: 10, attack: 1, defense: 0, recovery: 0 }, currencyBudget: 1 }], 0))
      .toThrow('distinct');
    const state = fixture();
    state.bearers[0].stats.attack++;
    expect(() => validateRadiantCombat(state)).toThrow('frozen stats');
    state.bearers[0].stats.attack--;
    state.gauge.members[0].form = 2;
    expect(() => validateRadiantCombat(state)).toThrow('Gauge member mismatch');
  });
  it('round-trips an in-progress six-member frozen run with charge seeds, snapshots and paid ledgers', () => {
    let state = charged(fixture(['tizu', 'flora', 'infernis', 'tizu', 'flora', 'infernis'], 6), 'glowing');
    state.bearers[1].hp -= 100;
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    state = charged(state, 'glowing', 'ally-1');
    state = apply(state, { type: 'flare', bearerId: 'ally-1' });
    state = apply(state, { type: 'normal', bearerId: 'ally-2', targetId: 'enemy' });
    const restored = JSON.parse(JSON.stringify(state)) as RadiantCombatState;
    validateRadiantCombat(restored);
    const action = { type: 'normal', bearerId: 'ally-3', targetId: 'enemy' } as const;
    expect(applyRadiantCombatAction(restored, action)).toEqual(applyRadiantCombatAction(state, action));
  });
  it('rejects a repeated player action, wrong phase and malformed inputs without mutation', () => {
    const state = apply(fixture(['infernis', 'flora']), { type: 'defense', bearerId: 'ally-0' });
    const before = structuredClone(state);
    for (const action of [
      { type: 'defense', bearerId: 'ally-0' },
      { type: 'normal', bearerId: 'ally-1', targetId: 'missing' },
      { type: 'flare', bearerId: 'ally-1' },
      { type: 'enemy-heal', enemyId: 'enemy', amount: 5 },
      { type: 'unknown' },
    ] as RadiantCombatAction[]) {
      expect(() => apply(state, action)).toThrow();
      expect(state).toEqual(before);
    }
  });
  it('ends on death/clear, emits one defeat and never grants a completion round after victory', () => {
    let state = fixture(['infernis'], 1, 1);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.state.phase).toBe('victory');
    expect(result.events.filter(event => event.type === 'defeated')).toHaveLength(1);
    expect(result.state.gauge.members[0].charge).toBe(25);
    expect(() => apply(result.state, { type: 'finish-enemy-phase' })).toThrow('finished');
    state = passPlayers(fixture());
    state = apply(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-0'], coefficient: 1000 });
    expect(state.phase).toBe('defeat');
    expect(() => apply(state, { type: 'finish-enemy-phase' })).toThrow('finished');
  });
});

describe('progressive signatures and layered shared readiness', () => {
  it.each(['infernis', 'tizu', 'flora'] as const)('keeps %s signature targets and increases offers across all tiers', starter => {
    const records = (['glowing', 'lustrous', 'eternal'] as const).map(tier => {
      const state = charged(fixture([starter, 'infernis'], 6), tier);
      state.bearers.forEach(member => { member.hp -= 100; });
      const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
      expect(result.events.find(event => event.type === 'flare')).toMatchObject({ tier });
      if (starter === 'infernis') {
        const damage = result.events.find(event => event.type === 'damage');
        expect(damage).toMatchObject({ targetId: 'enemy', origin: 'direct' });
        return damage?.type === 'damage' ? damage.offered : 0;
      }
      const events = result.events.filter(event => event.type === (starter === 'tizu' ? 'shield' : 'heal'));
      expect(events.map(event => 'targetId' in event ? event.targetId : '')).toEqual(['ally-0', 'ally-1']);
      const first = events[0];
      return first.type === 'shield' ? first.amount : first.type === 'heal' ? first.offered : 0;
    });
    expect(records[1]).toBeGreaterThan(records[0]);
    expect(records[2]).toBeGreaterThan(records[1]);
  });
  it('retains partial charge, chooses highest ready automatically and isolates one Eternal shared spend', () => {
    let state = fixture(['tizu', 'flora', 'infernis'], 6);
    state.gauge.members[0].charge = 37;
    const partial = apply(state, { type: 'flare', bearerId: 'ally-0' });
    expect(partial.gauge.members[0].charge).toBe(12);
    state = charged(charged(state, 'eternal'), 'lustrous', 'ally-1');
    state.gauge.members[2].charge = 60;
    state.gauge.members[2].form = 4;
    state.bearers[2].loadout.form = 4;
    state.bearers[2].stats = resolveRadiantStarterStats(state.bearers[2].loadout);
    state.bearers[2].hp = Math.round(state.bearers[2].stats.hp);
    expect(readyFlare(state.gauge, 'ally-2')).toBe('lustrous');
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.find(event => event.type === 'flare')).toMatchObject({ tier: 'eternal' });
    expect(result.state.gauge.sharedUnits).toBe(0);
    expect(result.state.gauge.eternalCasts).toBe(1);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([0, 40, 60]);
    expect(readyFlare(result.state.gauge, 'ally-1')).toBe('lustrous');
    expect(() => apply(result.state, { type: 'flare', bearerId: 'ally-0' })).toThrow('already acted');
    expect(state.gauge.sharedUnits).toBe(6000);
  });
  it('never creates hidden shared charge without frozen saved form6 and never uses a temporary mode', () => {
    let state = charged(fixture(['tizu'], 5), 'lustrous');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    state = nextRound(state);
    expect(state.gauge.sharedUnits).toBe(0);
    expect(Object.keys(state)).not.toEqual(expect.arrayContaining(['mode', 'timer', 'recovery']));
    expect(state.phase).toBe('player');
    expect(state.acted).toEqual([]);
  });
  it('bounds AoE charge rolls to two including at full charge and leaves support/generated actions roll-free', () => {
    const loadouts = [loadout('infernis', { id: 'ally-0', form: 6 })];
    const enemies = Array.from({ length: 6 }, (_, i) => ({ id: `enemy-${i}`,
      stats: { hp: 10000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }));
    const state = charged(createRadiantCombat(loadouts, enemies, 0), 'eternal');
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'damage')).toHaveLength(6);
    expect(result.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 2 });
    expect(result.state.chargeSeed).toBe(1196435762);
    const support = charged(createRadiantCombat([loadout('tizu', { masterId: 'master-tide-3', form: 6 })],
      enemies, 0), 'lustrous', 'tizu');
    const generated = applyRadiantCombatAction(support, { type: 'flare', bearerId: 'tizu', targetId: 'enemy-0' });
    expect(generated.events.find(event => event.type === 'damage')).toMatchObject({ origin: 'generated' });
    expect(generated.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 0, bonusOffered: 0 });
    expect(generated.state.chargeSeed).toBe(0);
    expect(generated.state.gauge.members[0].charge).toBe(0);
  });
  it('consumes no direct-hit charge rolls when old Eternal Burn kills before the primary strike', () => {
    const state = charged(fixture(['infernis'], 6, 100), 'eternal');
    state.enemies[0].burns.push({ source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 1000, remaining: 1 });
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'damage')).toEqual([
      expect.objectContaining({ origin: 'periodic' }),
    ]);
    expect(result.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 0 });
    expect(result.state.gauge.sharedUnits).toBe(0);
    expect(result.state.gauge.members[0].charge).toBe(0);
    expect(result.state.chargeSeed).toBe(0);
    expect(result.state.currencyEarned).toBe(101);
  });
});

describe('Infernis sourced Burn signature', () => {
  it('applies a snapshot, detonates only old same-owner Burn and rolls only primary surviving direct hits', () => {
    let state = charged(fixture(['infernis', 'infernis'], 6), 'glowing');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    const old = state.enemies[0].burns[0];
    const otherSource = { kind: 'flare', bearerId: 'ally-1' } as const;
    state.enemies[0].burns.push({ source: otherSource, magnitude: 10, remaining: 2 });
    state = nextRound(state);
    const remainingDamage = Math.round(old.magnitude) * state.enemies[0].burns[0].remaining;
    state = charged(state, 'eternal');
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    const damage = result.events.filter(event => event.type === 'damage');
    expect(damage[0]).toMatchObject({ origin: 'periodic', offered: remainingDamage, source: old.source });
    expect(damage[1]).toMatchObject({ origin: 'direct' });
    expect(result.state.enemies[0].burns.find(burn => burn.source.kind === 'flare' &&
      'bearerId' in burn.source && burn.source.bearerId === 'ally-1')).toMatchObject({ magnitude: 10 });
    expect(result.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 1 });
  });
  it('uses Banked Cinder only on direct Health damage to its own Burning target', () => {
    const state = fixture();
    state.enemies[0].burns.push({ source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 1, remaining: 2 });
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.events.filter(event => event.type === 'damage').map(event => event.origin)).toEqual(['direct', 'periodic']);
    expect(result.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 1 });
    const blocked = structuredClone(state);
    blocked.enemies[0].shields.push({ id: blocked.nextShieldId++, source: { kind: 'enemy', enemyId: 'enemy' }, remaining: 10000 });
    expect(applyRadiantCombatAction(blocked, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' })
      .events.filter(event => event.type === 'damage')).toHaveLength(1);
  });
  it('does not grant a new round when a scheduled Burn finishes the encounter', () => {
    let state = passPlayers(fixture());
    state.enemies[0].burns.push({ source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 10000, remaining: 1 });
    state = apply(state, { type: 'enemy-heal', enemyId: 'enemy', amount: 0 });
    const result = applyRadiantCombatAction(state, { type: 'finish-enemy-phase' });
    expect(result.state.phase).toBe('victory');
    expect(result.events.some(event => event.type === 'round')).toBe(false);
    expect(result.state.gauge.members[0].charge).toBe(10);
    expect(result.state.currencyEarned).toBe(101);
  });
});

describe('Tizu unlimited source Shields and actual absorption passive', () => {
  it('adds repeat native layers indefinitely until broken with stable source and no expiry/cap', () => {
    let state = charged(fixture(['tizu']), 'glowing');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    const amount = state.bearers[0].shields[0].remaining;
    for (let index = 0; index < 8; index++) {
      state = charged(nextRound(state), 'glowing');
      state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    }
    expect(state.bearers[0].shields).toHaveLength(9);
    expect(state.bearers[0].shields.reduce((sum, shield) => sum + shield.remaining, 0)).toBe(amount * 9);
    expect(amount * 9).toBeGreaterThan(state.bearers[0].stats.hp * .5);
    expect(state.bearers[0].shields.every(shield => !Object.hasOwn(shield, 'remainingPhases'))).toBe(true);
    expect(state.bearers[0].shields.map(shield => shield.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('grants incoming charge and Tizu owner charge separately, at most once per enemy phase for multi-target full blocks', () => {
    let state = charged(fixture(['tizu', 'flora']), 'glowing');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    state = passPlayers(state);
    const result = applyRadiantCombatAction(state, { type: 'enemy-attack', enemyId: 'enemy',
      targetIds: ['ally-0', 'ally-1'], coefficient: .1 });
    expect(result.state.bearers.map(member => member.hp)).toEqual([300, 220]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([16, 18]);
    expect(result.state.tideReturns).toEqual(['ally-0']);
    expect(result.events.filter(event => event.type === 'damage').every(event => event.healthLoss === 0)).toBe(true);
    const already = structuredClone(state);
    already.tideReturns = ['ally-0'];
    const bounded = apply(already, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-0'], coefficient: .1 });
    expect(bounded.gauge.members[0].charge).toBe(8);
  });
  it('does not grant owner charge twice across two genuine enemy actions in one phase', () => {
    const enemies = ['first', 'second'].map(id => ({
      id, stats: { hp: 1000, attack: 1, defense: 1, recovery: 0 }, currencyBudget: 1,
    }));
    let state = charged(createRadiantCombat([loadout('tizu', { id: 'ally-0', form: 6 }),
      loadout('flora', { id: 'ally-1', form: 6 })], enemies, 0), 'glowing');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    state = passPlayers(state);
    state = apply(state, { type: 'enemy-attack', enemyId: 'first', targetIds: ['ally-1'], coefficient: 1 });
    expect(state.gauge.members[0].charge).toBe(8);
    state = apply(state, { type: 'enemy-attack', enemyId: 'second', targetIds: ['ally-1'], coefficient: 1 });
    expect(state.gauge.members[0].charge).toBe(8);
    expect(state.gauge.members[1].charge).toBe(26);
    state = apply(state, { type: 'finish-enemy-phase' });
    expect(state.tideReturns).toEqual([]);
    expect(state.gauge.members[0].charge).toBe(13);
  });
  it('does not count generation, mixed owners, partial Health loss or a defeated Shield owner as full native blocks', () => {
    const state = fixture(['tizu', 'tizu']);
    sourceShield(state, 1, { kind: 'flare', bearerId: 'ally-0' }, 1);
    sourceShield(state, 1, { kind: 'flare', bearerId: 'ally-1' }, 100);
    const phase = passPlayers(state);
    const mixed = apply(phase, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-1'], coefficient: 1 });
    expect(mixed.tideReturns).toEqual([]);
    const partial = passPlayers(fixture(['tizu', 'flora']));
    sourceShield(partial, 1, { kind: 'flare', bearerId: 'ally-0' }, 1);
    expect(apply(partial, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-1'], coefficient: 1 }).tideReturns)
      .toEqual([]);
    const deadOwner = structuredClone(phase);
    deadOwner.bearers[0].hp = 0;
    deadOwner.gauge.members[0].living = false;
    deadOwner.bearers[1].shields = deadOwner.bearers[1].shields.slice(0, 1);
    deadOwner.bearers[1].shields[0].remaining = 100;
    expect(apply(deadOwner, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-1'], coefficient: 1 }).tideReturns)
      .toEqual([]);
  });
  it('uses strongest reduction with separate guard and does not age permanent Shields', () => {
    const state = fixture(['tizu']);
    state.bearers[0].reductions.push(
      { source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: .2, remaining: 1 },
      { source: { kind: 'enemy', enemyId: 'enemy' }, magnitude: .1, remaining: 2 });
    let phase = passPlayers(state);
    const damage = applyRadiantCombatAction(phase, { type: 'enemy-attack', enemyId: 'enemy',
      targetIds: ['ally-0'], coefficient: 10 });
    expect(damage.events.find(event => event.type === 'damage')).toMatchObject({
      offered: radiantDirectDamage(20, 22 * 1.2, 10, .5 * .8),
    });
    phase = apply(damage.state, { type: 'finish-enemy-phase' });
    expect(phase.bearers[0].reductions).toHaveLength(1);
    expect(phase.bearers[0].reductions[0].magnitude).toBe(.1);
  });
  it('caps combined guard and named mitigation at eighty percent rather than multiplying beyond the cap', () => {
    const state = fixture(['tizu']);
    state.bearers[0].reductions.push({ source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: .9, remaining: 1 });
    const result = applyRadiantCombatAction(passPlayers(state), { type: 'enemy-attack', enemyId: 'enemy',
      targetIds: ['ally-0'], coefficient: 10 });
    expect(result.events.find(event => event.type === 'damage')).toMatchObject({
      offered: radiantDirectDamage(20, 22 * 1.2, 10, .2),
    });
  });
});

describe('Flora healing, Seed and Renewal snapshots', () => {
  it('supports solo healing, full-HP casts with effective zero, no fake charge and no revive', () => {
    const state = charged(fixture(['flora', 'infernis']), 'glowing');
    state.bearers[1].hp = 0;
    state.gauge.members[1].living = false;
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'heal')).toEqual([
      expect.objectContaining({ targetId: 'ally-0', effective: 0, offered: Math.round(65 * 1.15 * .8) }),
    ]);
    expect(result.state.bearers[1].hp).toBe(0);
    expect(result.state.gauge.members[0].charge).toBe(0);
    expect(result.state.chargeSeed).toBe(0);
    const injured = charged(fixture(['flora']), 'glowing');
    injured.bearers[0].hp = 1;
    expect(apply(injured, { type: 'flare', bearerId: 'ally-0' }).bearers[0].hp).toBe(1 + Math.round(65 * 1.15 * .8));
  });
  it('uses caster Recovery, not recipient Recovery, and preserves Renewal after leader death', () => {
    let state = charged(fixture(['flora', 'infernis', 'tizu']), 'glowing');
    state.bearers[1].hp -= 100;
    state.bearers[2].hp -= 100;
    const cast = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(cast.events.filter(event => event.type === 'heal').map(event => event.offered))
      .toEqual(Array(3).fill(Math.round(65 * 1.15 * .8)));
    const snapshot = cast.state.bearers[1].renewal[0].magnitude;
    state = passPlayers(cast.state);
    state = apply(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-0'], coefficient: 1000 });
    state.bearers[1].hp = 1;
    const renew = applyRadiantCombatAction(state, { type: 'finish-enemy-phase' });
    expect(renew.events.find(event => event.type === 'heal' && event.targetId === 'ally-1'))
      .toMatchObject({ snapshot, offered: Math.round(snapshot), effective: Math.round(snapshot) });
    expect(renew.state.bearers[0].hp).toBe(0);
    expect(renew.state.bearers[1].renewal[0].remaining).toBe(1);
  });
  it('plants one sourced Seed on largest missing fraction in stable squad order and only after direct Health damage', () => {
    let state = fixture(['flora', 'infernis', 'tizu']);
    state.bearers.forEach(member => { member.hp = Math.round(member.stats.hp) / 2; });
    state = apply(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(state.bearers.map(member => member.seeds.length)).toEqual([1, 0, 0]);
    const snapshot = state.bearers[0].seeds[0].magnitude;
    const after = nextRound(state);
    expect(after.bearers[0].hp).toBe(110 + Math.round(snapshot));
    expect(after.bearers[0].seeds).toEqual([]);
    const blocked = fixture(['flora']);
    blocked.bearers[0].hp = 1;
    blocked.enemies[0].shields.push({ id: blocked.nextShieldId++, source: { kind: 'enemy', enemyId: 'enemy' }, remaining: 10000 });
    expect(apply(blocked, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' }).bearers[0].seeds).toEqual([]);
  });
  it('refreshes same-source Renewal without weakening its snapshot, preserves distinct casters, cleanses only strongest Weaken', () => {
    let state = charged(fixture(['flora', 'flora'], 6), 'lustrous');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    const strongest = state.bearers[0].renewal[0].magnitude;
    state = nextRound(state);
    state = charged(state, 'glowing');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    expect(state.bearers[0].renewal).toHaveLength(1);
    expect(state.bearers[0].renewal[0]).toMatchObject({ magnitude: strongest, remaining: 2 });
    state = charged(state, 'eternal', 'ally-1');
    weaken(state, 0, .1);
    state.bearers[0].weaken.push({ source: { kind: 'passive', bearerId: 'ally-1' }, magnitude: .3, remaining: 3 });
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-1' });
    expect(result.state.bearers[0].renewal).toHaveLength(2);
    expect(result.state.bearers[0].weaken).toHaveLength(1);
    expect(result.state.bearers[0].weaken[0].magnitude).toBe(.1);
    expect(result.events.find(event => event.type === 'status' && event.status === 'weaken-removed'))
      .toMatchObject({ magnitude: .3, source: { kind: 'passive', bearerId: 'ally-1' } });
  });
});

describe('fixed starter Master enhancements', () => {
  it.each(Object.keys(radiantMasters) as RadiantMasterId[])('%s produces only its mapped personal enhancement', masterId => {
    const master = radiantMasters[masterId];
    const state = createRadiantCombat([loadout(master.starter, { id: 'ally-0', masterId, form: 6, imbue: 3 })],
      [{ id: 'enemy', stats: { hp: 10000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
    const charge = charged(state, 'glowing');
    const strike = master.effect === 'tide-strike' || master.effect === 'sprout-strike';
    const result = applyRadiantCombatAction(charge, strike
      ? { type: 'flare', bearerId: 'ally-0', targetId: 'enemy' } : { type: 'flare', bearerId: 'ally-0' });
    const stats = effectiveRadiantStats(state, 'ally-0');
    const flare = radiantFlares[master.starter].glowing;
    switch (master.effect) {
      case 'longer-burn': expect(result.state.enemies[0].burns[0].remaining).toBe(3); break;
      case 'flare-damage':
        expect(result.events.find(event => event.type === 'damage')).toMatchObject({
          offered: radiantDirectDamage(stats.attack, 10, flare.damage, 1 + .3 + .15),
        }); break;
      case 'self-shield':
        expect(result.state.bearers[0].shields[0]).toMatchObject({
          source: { kind: 'master', bearerId: 'ally-0' }, remaining: Math.round(.12 * state.bearers[0].stats.hp),
        }); break;
      case 'flare-shield':
        expect(result.state.bearers[0].shields[0].remaining).toBe(
          Math.round((flare.shieldDefense * stats.defense + flare.shieldHP * stats.hp) * (1 + .3 + .15))); break;
      case 'deep-shield':
        expect(result.state.bearers[0].shields[0].remaining).toBe(
          Math.round((flare.shieldDefense * stats.defense + (flare.shieldHP + .08) * stats.hp) * 1.3)); break;
      case 'tide-strike':
      case 'sprout-strike':
        expect(result.events.filter(event => event.type === 'damage')).toHaveLength(1);
        expect(result.events.find(event => event.type === 'damage')).toMatchObject({ origin: 'generated' });
        expect(result.state.chargeSeed).toBe(0); break;
      case 'flare-heal':
        expect(result.events.find(event => event.type === 'heal')).toMatchObject({
          offered: Math.round(flare.heal * stats.recovery * (1 + .3 + .15)),
        }); break;
      case 'longer-renewal': expect(result.state.bearers[0].renewal[0].remaining).toBe(3); break;
    }
  });
  it('requires explicit valid target confirmation for generated strikes before any spend or seed advance', () => {
    const state = charged(createRadiantCombat([loadout('tizu', { id: 'ally-0', masterId: 'master-tide-3' })],
      [{ id: 'enemy', stats: { hp: 100, attack: 1, defense: 0, recovery: 0 }, currencyBudget: 100 }], 0), 'glowing');
    const before = structuredClone(state);
    expect(() => apply(state, { type: 'flare', bearerId: 'ally-0' })).toThrow('selected living enemy');
    expect(() => apply(state, { type: 'flare', bearerId: 'ally-0', targetId: 'missing' })).toThrow('Unknown');
    expect(state).toEqual(before);
    expect(() => apply(charged(fixture(['flora']), 'glowing'), { type: 'flare', bearerId: 'ally-0', targetId: 'enemy' }))
      .toThrow('signature target set');
  });
});

describe('exact persistable lowest-health currency ledger', () => {
  it('uses exact safe arithmetic even when budget times loss exceeds Number precision', () => {
    const max = Number.MAX_SAFE_INTEGER;
    const result = depleteRadiantCurrency({ budget: max, baselineHP: max, lowestHP: max, paid: 0 }, max - 123456789);
    expect(result.amount).toBe(123456789);
    expect(JSON.parse(JSON.stringify(result.ledger))).toEqual(result.ledger);
    const depleted = depleteRadiantCurrency(result.ledger, 0);
    expect(depleted.amount).toBe(max - 123456789);
    expect(depleted.ledger.paid).toBe(max);
    expect(depleteRadiantCurrency(depleted.ledger, 0).amount).toBe(0);
  });
  it('pays only new depletion, never healing, repeated damage or overkill; defeat exhausts the fixed budget', () => {
    let state = fixture(['infernis'], 1, 1000);
    state = apply(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    const firstHP = state.enemies[0].hp, firstPaid = state.currencyEarned;
    expect(firstPaid).toBe(Math.floor(101 * (1000 - firstHP) / 1000));
    state = apply(state, { type: 'enemy-heal', enemyId: 'enemy', amount: 1000 });
    expect(state.currencyEarned).toBe(firstPaid);
    state = apply(state, { type: 'finish-enemy-phase' });
    const repeated = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(repeated.state.enemies[0].hp).toBe(firstHP);
    expect(repeated.events.some(event => event.type === 'currency')).toBe(false);
    state = nextRound(repeated.state);
    state.enemies[0].burns.push({ source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 100000, remaining: 1 });
    state = nextRound(state);
    expect(state.phase).toBe('victory');
    expect(state.currencyEarned).toBe(101);
    expect(state.enemies[0].currency).toMatchObject({ paid: 101, lowestHP: 0 });
  });
  it('does not pay for Shield absorption and attributes actual generated/periodic Health damage', () => {
    const state = fixture();
    state.enemies[0].shields.push({ id: state.nextShieldId++, source: { kind: 'enemy', enemyId: 'enemy' }, remaining: 10000 });
    const blocked = apply(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(blocked.currencyEarned).toBe(0);
    expect(blocked.gauge.members[0].charge).toBe(25);
    const generated = charged(createRadiantCombat([loadout('flora', { id: 'ally-0', masterId: 'master-sprout-2' })],
      [{ id: 'enemy', stats: { hp: 100, attack: 1, defense: 0, recovery: 0 }, currencyBudget: 100 }], 0), 'glowing');
    const result = applyRadiantCombatAction(generated, { type: 'flare', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.events.find(event => event.type === 'damage')).toMatchObject({ origin: 'generated' });
    expect(result.state.currencyEarned).toBeGreaterThan(0);
    expect(result.state.chargeSeed).toBe(0);
  });
  it('rejects inconsistent/nonintegral/negative/overflow ledgers and never mutates rejected inputs', () => {
    const ledger = { budget: 101, baselineHP: 100, lowestHP: 50, paid: 50 };
    expect(() => validateRadiantCurrencyLedger({ ...ledger, paid: 49 })).toThrow('Inconsistent');
    expect(() => depleteRadiantCurrency(ledger, 101)).toThrow('baseline');
    expect(() => depleteRadiantCurrency(ledger, .5)).toThrow('actual enemy health');
    expect(() => validateRadiantCurrencyLedger({ ...ledger, budget: -1 })).toThrow('budget');
    const before = structuredClone(ledger);
    expect(() => depleteRadiantCurrency(ledger, NaN)).toThrow();
    expect(ledger).toEqual(before);
    const state = passPlayers(fixture());
    const snapshot = structuredClone(state);
    expect(() => apply(state, { type: 'enemy-attack', enemyId: 'enemy',
      targetIds: ['ally-0'], coefficient: Number.MAX_SAFE_INTEGER })).toThrow('packet magnitude');
    expect(state).toEqual(snapshot);
  });
  it('rejects combined budgets that could overflow a single persistable encounter total', () => {
    expect(() => createRadiantCombat([loadout()], ['first', 'second'].map(id => ({
      id, stats: { hp: 10, attack: 1, defense: 0, recovery: 0 }, currencyBudget: Number.MAX_SAFE_INTEGER,
    })), 0)).toThrow('total currency budget');
  });
});
