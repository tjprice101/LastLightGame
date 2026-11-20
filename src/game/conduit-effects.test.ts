import { describe, expect, it } from 'vitest';
import { conduits, conduitUpgradeCost, type ConduitId } from '../content/conduits';
import {
  radiantConduits, radiantConduitPrimitives, radiantGearAmount, validateRadiantGear,
  type RadiantGear,
} from '../content/conduit-effects';
import {
  radiantBearerKits, radiantLeaderBonus, resolveRadiantStarterStats, type RadiantBearerId, type RadiantLoadout,
} from '../content/combat-kits';
import {
  createRadiantCombat, applyRadiantCombatAction, effectiveRadiantStats, validateRadiantCombat,
  type RadiantCombatState, type RadiantCombatAction, type RadiantSource,
} from './combat-engine';
import { adaptRadiantLoadouts, type RadiantAccountGear } from './combat-loadout';

function gear(...ids: ConduitId[]): RadiantGear {
  return Array.from({ length: 8 }, (_, index) => ids[index] ? { id: ids[index], rank: 0 } : null);
}
function ranked(rank: number, ...ids: ConduitId[]): RadiantGear {
  return gear(...ids).map(slot => slot && { ...slot, rank });
}
function member(starter: RadiantBearerId = 'ember', equipment?: RadiantGear, form = 6): RadiantLoadout {
  return { id: starter, starter, level: 0, form, convergenceRank: 1, weaponRank: 0, masterId: null, ascension: {}, gear: equipment };
}
function fixture(ids: ConduitId[] = [], starter: RadiantBearerId = 'ember', others: RadiantBearerId[] = [], rank = 0): RadiantCombatState {
  return createRadiantCombat([member(starter, ranked(rank, ...ids)), ...others.map(id => member(id))],
    ['enemy', 'enemy2'].map(id => ({ elementId: null, id, stats: { hp: 100000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })), 0);
}
function act(state: RadiantCombatState, action: RadiantCombatAction) {
  return applyRadiantCombatAction(state, action);
}
function ready(state: RadiantCombatState): RadiantCombatState {
  for (const gauge of state.gauge.members) gauge.charge = gauge.baseCost;
  return state;
}
/** Passes the rest of the player phase (Defend was removed in D-473). */
function defend(state: RadiantCombatState): RadiantCombatState {
  return state.phase === 'player' ? act(state, { type: 'end-turn' }).state : state;
}
/** Uses Skill 2 (D-473 O1: Defend-triggered effects fire on skill use). Ember's Flame Arc needs no target. */
function skillUse(state: RadiantCombatState, id: string): RadiantCombatState {
  state.gauge.members.find(member => member.id === id)!.charge = 40;
  return act(state, { type: 'skill', bearerId: id, slot: 2 }).state;
}
function round(state: RadiantCombatState) {
  state = defend(state);
  for (const enemy of state.enemies)
    if (enemy.hp > 0 && !state.enemyActed.includes(enemy.id))
      state = act(state, { type: 'enemy-heal', enemyId: enemy.id, amount: 0 }).state;
  return act(state, { type: 'finish-enemy-phase' });
}
function sourceShield(state: RadiantCombatState, targetIndex: number, source: RadiantSource, remaining: number) {
  state.bearers[targetIndex].shields.push({ id: state.nextShieldId++, source, remaining });
}
function normal(state: RadiantCombatState, id = state.bearers[0].loadout.id) {
  return act(state, { type: 'normal', bearerId: id, targetId: 'enemy' });
}
const ids = conduits.map(conduit => conduit.id);

describe('exhaustive stable-ID radiant conversion', () => {
  it('covers exactly the installed catalog and its five tiers, without Masters', () => {
    expect(Object.keys(radiantConduits).sort()).toEqual([...ids].sort());
    expect(conduits.reduce((counts, item) => ({ ...counts, [item.rarity]: (counts[item.rarity] ?? 0) + 1 }),
      {} as Record<string, number>)).toEqual({ Common: 10, Rare: 15, Legendary: 15, Omnic: 45, Calamitic: 14 });
    expect(ids).toHaveLength(99);
  });
  it.each(ids)('%s has a finite meaningful monotonic rank matrix and unchanged costs', id => {
    const conduit = conduits.find(entry => entry.id === id)!;
    const previous = radiantConduitPrimitives({ id, rank: 0 });
    expect(previous.length).toBeGreaterThan(0);
    // D-493 O6: restored packages carry up to 6 primitives.
    expect(previous.length).toBeLessThanOrEqual(6);
    const multipliers = { Common: 1, Rare: 2, Legendary: 4, Omnic: 200, Calamitic: 400 };
    for (let rank = 0; rank <= 5; rank++) {
      const current = radiantConduitPrimitives({ id, rank });
      current.forEach((primitive, index) => {
        expect(Number.isFinite(primitive.amount)).toBe(true);
        // D-493 C12: fixed primitives (penalties, flat Skill Duration) keep their amount at every rank;
        // stepped ones add their step per rank.
        if (primitive.fixed) { expect(primitive.amount).toBe(previous[index].amount); return; }
        if (primitive.step !== undefined) { expect(primitive.amount).toBeCloseTo(previous[index].amount + primitive.step * rank); return; }
        expect(primitive.amount).toBeGreaterThan(0);
        expect(primitive.amount).toBeCloseTo(previous[index].amount * (1 + .1 * rank));
      });
      expect(conduitUpgradeCost(conduit, rank)).toBe(
        rank === 5 ? null : [25, 50, 100, 175, 250][rank] * multipliers[conduit.rarity]);
    }
    expect(() => radiantConduitPrimitives({ id, rank: 6 })).toThrow();
    expect(() => radiantConduitPrimitives({ id, rank: -.1 })).toThrow();
  });
  it.each(ids)('%s is usable in a real frozen encounter at every rank', id => {
    const conduit = conduits.find(entry => entry.id === id)!;
    const starter = (Object.keys(radiantBearerKits) as RadiantBearerId[])
      .find(key => !conduit.element || radiantBearerKits[key].elementId === conduit.element)!;
    for (let rank = 0; rank <= 5; rank++) {
      let state = fixture([id], starter, [], rank);
      state.bearers[0].hp = Math.floor(state.bearers[0].hp / 2);
      const before = structuredClone(state);
      state = normal(state).state;
      expect(before.acted).toEqual([]);
      state = round(state).state;
      state = ready(state);
      const offerTarget = radiantBearerKits[starter].kit.flare.target;
      state = act(state, { type: 'flare', bearerId: starter,
        ...(offerTarget === 'one-enemy' ? { targetId: 'enemy' } : {}) }).state;
      state = defend(state);
      state = act(state, { type: 'enemy-attack', enemyId: 'enemy',
        targetIds: [starter], coefficient: .5 }).state;
      validateRadiantCombat(state);
      expect(state.bearers[0].loadout.gear![0]).toEqual({ id, rank });
    }
  });
});

describe('real four-stat and action modifiers', () => {
  // D-493 B3a: no Conduit carries Recovery after Kirin Cradle and Sap Cathedral were restored.
  it.each(['hp', 'attack', 'defense'] as const)('%s modifies only its frozen stat', kind => {
    const id = ids.find(id => radiantConduitPrimitives({ id, rank: 0 }).some(effect => effect.kind === kind))!;
    const element = conduits.find(entry => entry.id === id)!.element;
    const starter = (Object.keys(radiantBearerKits) as RadiantBearerId[]).find(id => !element || radiantBearerKits[id].elementId === element)!;
    const loadout = member(starter, gear(id));
    const base = resolveRadiantStarterStats(member(starter));
    const actual = resolveRadiantStarterStats(loadout);
    expect(actual[kind]).toBeCloseTo(base[kind] * (1 + radiantGearAmount(loadout.gear, kind)));
    expect(Object.keys(actual)).toEqual(['hp', 'attack', 'defense', 'recovery']);
  });
  it.each(['precision-escapement', 'fieldbrace-coupler', 'breach-pendulum'] as ConduitId[])('%s increases actual Normal damage without extra RNG', id => {
    const control = normal(fixture()), result = normal(fixture([id]));
    const hit = result.events.find(event => event.type === 'damage' && event.source.kind === 'normal')!;
    expect(hit.type === 'damage' && hit.healthLoss).toBeGreaterThan(
      control.events.find(event => event.type === 'damage')!.type === 'damage'
        ? (control.events.find(event => event.type === 'damage') as Extract<typeof hit, { type: 'damage' }>).healthLoss : 0);
    expect(result.state.chargeSeed).toBe(control.state.chargeSeed);
  });
  it('Convergent Light offense, support healing and native shield amplification affect actual results', () => {
    const cast = (id?: ConduitId, starter: RadiantBearerId = 'ember') => {
      const state = ready(fixture(id ? [id] : [], starter, ['rosetta']));
      state.bearers.forEach(ally => { ally.hp = 1; });
      return act(state, { type: 'flare', bearerId: starter });
    };
    const plain = cast(), boosted = cast('crosspin-governor');
    expect(boosted.state.enemies[0].hp).toBeLessThan(plain.state.enemies[0].hp);
    const healing = (id?: ConduitId) => cast(id, 'sprout').events
      .filter(event => event.type === 'heal').reduce((sum, event) => sum + event.offered, 0);
    expect(healing('springwell-pump')).toBeGreaterThan(healing());
    // Tizu's second Master carries `shielding`.
    const shieldOf = (masterId: RadiantLoadout['masterId']) => {
      const state = ready(createRadiantCombat([{ ...member('tide'), masterId }, member('rosetta')],
        [{ elementId: null, id: 'enemy', stats: { hp: 100000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 }], 0));
      return act(state, { type: 'flare', bearerId: 'tide' }).state.bearers[0].shields[0].remaining;
    };
    expect(shieldOf('master-tide-2')).toBeGreaterThan(shieldOf(null));
  });
  it('guard (after a skill) improves a real hostile phase and does not cleanse statuses', () => {
    // Solenne's first Master carries `guard`; the same post-skill state without the "used a skill" mark is the control.
    let state = createRadiantCombat([{ ...member('solenne'), masterId: 'master-solenne-1' }],
      [{ elementId: null, id: 'enemy', stats: { hp: 100000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 }], 0);
    state.bearers[0].hp = 100;
    state.bearers[0].buffs.push({ category: 'weaken', source: { kind: 'enemy', enemyId: 'enemy' }, magnitude: .5, remaining: 2 });
    state = skillUse(state, 'solenne');
    const hit = (input: RadiantCombatState) => act(input, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['solenne'], coefficient: 2 });
    const unmarked = structuredClone(state);
    unmarked.skilled = [];
    const offered = (result: ReturnType<typeof hit>) => result.events.find(event => event.type === 'damage')!;
    const [guarded, plain] = [offered(hit(state)), offered(hit(unmarked))];
    expect(guarded.type === 'damage' && plain.type === 'damage' && guarded.offered < plain.offered).toBe(true);
    expect(hit(state).state.bearers[0].buffs.filter(effect => effect.category === 'weaken')).toHaveLength(1);
  });
  it('leader gear only applies while first and alive; cooperation requires a previous ally action', () => {
    let state = fixture(['calamitic-choir-array-of-branded-stars'], 'ember', ['rosetta']);
    const controlLeader = fixture([], 'ember', ['rosetta']);
    expect(radiantLeaderBonus(state.bearers[0].loadout))
      .toBeCloseTo(radiantLeaderBonus(controlLeader.bearers[0].loadout) * 1.3);
    expect(effectiveRadiantStats(state, 'rosetta').attack)
      .toBe(effectiveRadiantStats(controlLeader, 'rosetta').attack);
    expect(normal(state).state.enemies[0].hp).toBeLessThan(normal(controlLeader).state.enemies[0].hp);
    state.bearers[0].hp = 0; state.gauge.members[0].living = false;
    expect(effectiveRadiantStats(state, 'rosetta').attack)
      .toBeCloseTo(state.bearers[1].stats.attack);
    const control = normal(fixture(['atmospheric-storm-clock'], 'atmoso', ['ember']));
    let after = fixture(['atmospheric-storm-clock'], 'atmoso', ['ember']);
    after = normal(after, 'ember').state;
    expect(normal(after, 'atmoso').state.enemies[0].hp).toBeLessThan(
      normal(fixture([], 'atmoso', ['ember']), 'ember').state.enemies[0].hp - (100000 - control.state.enemies[0].hp));
  });
});

describe('bounded, sourced Conduit triggers', () => {
  it('rounds upgraded charge once, caps it, and does not change combat RNG', () => {
    const state = fixture(['twinpulse-bellows'], 'ember', [], 3);
    const result = normal(state);
    // 15 Normal hit + round(7 x 1.3) = 24.
    expect(result.state.gauge.members[0].charge).toBe(24);
    expect(result.state.chargeSeed).toBe(state.chargeSeed);
    state.gauge.members[0].charge = 199;
    expect(normal(state).state.gauge.members[0].charge).toBe(200);
  });
  it('resolves native Shield breaks before generated replacement Shields, independent of slot order', () => {
    for (const ids of [['granite-hourglass', 'infernic-phoenix-reactor'], ['infernic-phoenix-reactor', 'granite-hourglass']] as ConduitId[][]) {
      let state = fixture(ids);
      state.bearers[0].hp = 500;
      sourceShield(state, 0, { kind: 'flare', bearerId: 'ember' }, 1);
      state = defend(state);
      const first = act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 2, hits: 3 });
      expect(first.events.filter(event => event.type === 'heal' && event.source.kind === 'gear')).toHaveLength(1);
      expect(first.state.bearers[0].shields.length).toBeGreaterThan(0);
      const second = act(first.state, { type: 'enemy-attack', enemyId: 'enemy2', targetIds: ['ember'], coefficient: 2 });
      expect(second.events.filter(event => event.type === 'heal' && event.source.kind === 'gear')).toHaveLength(0);
    }
  });
  it('splash cannot generate another splash, charge drop or direct-kill reward', () => {
    const state = createRadiantCombat([member('ember', gear('calamitic-worldbreaker-cannonade', 'calamitic-causality-funeral-engine'))],
      ['enemy', 'other'].map((id, index) => ({ id, elementId: null,
        stats: { hp: index === 0 ? 100000 : 1, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })), 0);
    const result = normal(state);
    expect(result.events.filter(event => event.type === 'damage').map(event => event.origin)).toEqual(['direct', 'generated']);
    expect(result.events.filter(event => event.type === 'gauge-drop')).toHaveLength(1);
    expect(result.state.gauge.members[0].charge).toBe(15);
    expect(result.state.chargeSeed).toBe(state.chargeSeed);
  });
  it('native healing grants charge once per action, but generated healing and overhealing cannot', () => {
    const state = ready(fixture(['rootbound-triage-vault'], 'sprout', ['ember', 'tide']));
    state.bearers.forEach(owner => { owner.hp = 1; });
    const result = act(state, { type: 'flare', bearerId: 'sprout' });
    // Worldseed's Luminosity Gain Up (+30%) multiplies the heal-charge grant: round(6 x 1.3) = 8.
    expect(result.state.gauge.members[0].charge).toBe(8);
    expect(result.events.filter(event => event.type === 'shield' && event.source.kind === 'gear')).toHaveLength(3);
    const full = ready(fixture(['rootbound-triage-vault'], 'sprout'));
    expect(act(full, { type: 'flare', bearerId: 'sprout' }).state.gauge.members[0].charge).toBe(0);
    let generated = fixture(['lifeline-flywheel', 'rootbound-triage-vault'], 'sprout');
    generated.bearers[0].hp = 1;
    generated = normal(generated).state;
    expect(generated.gauge.members[0].charge).toBe(15);
  });
  it('does not revive a lethal recipient through former sustain Conduits', () => {
    let state = fixture(['horizon-heartcase', 'immortal-vessel']);
    state.bearers[0].hp = 1;
    const result = act(defend(state), { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 100 });
    expect(result.state.phase).toBe('defeat');
    expect(result.state.bearers[0].hp).toBe(0);
    expect(result.state.bearers[0].shields).toEqual([]);
    expect(result.state.gauge.members[0].charge).toBe(0);
  });
});

describe('eligibility, frozen identity and read-only account boundary', () => {
  it('preserves omitted gear callers and rejects illegal gear without input mutation', () => {
    expect(resolveRadiantStarterStats(member())).toEqual(resolveRadiantStarterStats(member('ember', gear())));
    const bad: unknown[] = [null, [], gear('vigil-core', 'vigil-core'),
      gear('aquatic-leviathan-pump'), gear('vigil-core').map((slot, index) => index ? slot : { id: 'vigil-core', rank: 6 }),
      gear('vigil-core').map((slot, index) => index ? slot : { id: 'unknown', rank: 0 }),
      gear('vigil-core').map((slot, index) => index ? slot : { id: 'vigil-core', rank: 0, health: 20 })];
    for (const value of bad) {
      const before = structuredClone(value);
      expect(() => validateRadiantGear(value, 'infernic')).toThrow();
      expect(value).toEqual(before);
    }
  });
  it('enforces four matching Omnic of eight and five universal Calamitic, never copy consumption', () => {
    const infernic = conduits.filter(item => item.rarity === 'Omnic' && item.element === 'infernic').map(item => item.id);
    expect(() => validateRadiantGear(gear(...infernic.slice(0, 4)), 'infernic')).not.toThrow();
    expect(() => validateRadiantGear(gear(...infernic.slice(0, 5)), 'infernic')).toThrow(/four/i);
    const calamitic = conduits.filter(item => item.rarity === 'Calamitic').map(item => item.id);
    expect(() => validateRadiantGear(gear(...calamitic.slice(0, 5)), 'oceanic')).not.toThrow();
    expect(() => validateRadiantGear(gear(...calamitic.slice(0, 6)), 'oceanic')).toThrow(/five/i);
    const account: RadiantAccountGear = { conduits: { 'vigil-core': 1 }, conduitUpgrades: { 'vigil-core': 5 },
      conduitEquipment: { ember: gear('vigil-core').map(slot => slot?.id ?? null), tide: gear('vigil-core').map(slot => slot?.id ?? null) } };
    const before = structuredClone(account);
    const result = adaptRadiantLoadouts([member('ember'), member('tide')], ['ember', 'tide'], account);
    expect(result.ok).toBe(true); expect(account).toEqual(before);
    if (result.ok) expect(result.loadouts.every(loadout => loadout.gear![0]!.rank === 5)).toBe(true);
  });
  it('requires actual ownership, explicit manual captured choice, distinct acquired bearers, and owned matching Masters', () => {
    for (const [members, acquired, account] of [
      [[member()], [], {}],
      [[{ ...member(), id: 'capture:123' }], ['ember'], {}],
      [[member(), { ...member(), id: 'second' }], ['ember'], {}],
      [[member()], ['ember'], { conduitEquipment: { ember: gear('vigil-core').map(slot => slot?.id ?? null) } }],
      [[{ ...member(), masterId: 'master-ember-1' }], ['ember'], {}],
      [[member()], ['ember'], { masterConduits: { 'master-tide-1': 1 }, masterEquipment: { ember: 'master-tide-1' } }],
      [[member()], ['ember'], { conduitUpgrades: { 'vigil-core': 5 } }],
    ] as [RadiantLoadout[], string[], RadiantAccountGear][]) {
      const before = structuredClone({ members, account });
      const result = adaptRadiantLoadouts(members, acquired, account);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors[0].reason.length).toBeGreaterThan(0);
      expect({ members, account }).toEqual(before);
    }
  });
  it('snapshots saved gear and Master; rejects tampered frozen stats, sources, old schema and ledger', () => {
    const account: RadiantAccountGear = { conduits: { 'vigil-core': 1 }, conduitUpgrades: { 'vigil-core': 5 },
      masterConduits: { 'master-ember-1': 1 }, masterEquipment: { ember: 'master-ember-1' },
      conduitEquipment: { ember: gear('vigil-core').map(slot => slot?.id ?? null) } };
    const adapted = adaptRadiantLoadouts([member()], ['ember'], account);
    expect(adapted.ok).toBe(true);
    if (!adapted.ok) return;
    const state = createRadiantCombat(adapted.loadouts,
      [{ elementId: null, id: 'enemy', stats: { hp: 10000, attack: 10, defense: 20, recovery: 0 }, currencyBudget: 10 }], 0);
    account.conduitUpgrades!['vigil-core'] = 0;
    adapted.loadouts[0].gear![0]!.rank = 0;
    expect(state.bearers[0].loadout.gear![0]!.rank).toBe(5);
    expect(state.bearers[0].loadout.masterId).toBe('master-ember-1');
    for (const mutate of [
      (input: RadiantCombatState) => { input.bearers[0].stats.hp += 1; },
      (input: RadiantCombatState) => { input.bearers[0].loadout.gear![0]!.rank = 0; },
      (input: RadiantCombatState) => { input.gearTriggered = ['ember:unknown']; },
      (input: RadiantCombatState) => { Object.assign(input, { version: 2 }); },
      (input: RadiantCombatState) => { sourceShield(input, 0, { kind: 'gear', bearerId: 'ember', conduitId: 'citadel-spine' }, 10); },
    ]) {
      const invalid = structuredClone(state); mutate(invalid);
      const before = structuredClone(invalid);
      expect(() => normal(invalid)).toThrow(); expect(invalid).toEqual(before);
    }
  });
});

describe('Conduit contribution attribution (D-492)', () => {
  const damage = (events: ReturnType<typeof act>['events']) =>
    events.filter((event): event is Extract<typeof event, { type: 'damage' }> => event.type === 'damage');
  it('splits a Normal hit between damage and Attack Conduits without changing the hit', () => {
    const bare = normal(fixture());
    const boosted = normal(fixture(['calamitic-horizon-cleaving-godpress', 'siegebound-drive']));
    const [plain] = damage(bare.events), [hit] = damage(boosted.events);
    const total = (boosts: typeof hit.boosts) => (boosts ?? []).reduce((sum, entry) => sum + entry.amount, 0);
    // Ember's own Leader effect is attributed in both; the Conduits add their own shares on top.
    expect(plain.boosts!.map(entry => entry.source.kind)).toEqual(['leader']);
    const shares = new Map(hit.boosts!.map(entry => [entry.source.kind === 'gear' ? entry.source.conduitId : entry.source.kind, entry.amount]));
    expect([...shares.keys()].sort()).toEqual(['calamitic-horizon-cleaving-godpress', 'leader', 'siegebound-drive']);
    expect(total(hit.boosts) - total(plain.boosts)).toBeGreaterThan(0);
    expect(total(hit.boosts)).toBeLessThan(hit.offered);
    expect(shares.get('calamitic-horizon-cleaving-godpress')!).toBeGreaterThan(shares.get('siegebound-drive')!);
  });
  it('records damage prevented by a Defense Conduit on enemy hits', () => {
    const attack = (ids: ConduitId[]) => {
      const state = defend(fixture(ids));
      return damage(act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 2 }).events)[0];
    };
    const plain = attack([]), guarded = attack(['bastion-lock']);
    expect(guarded.boosts).toEqual([{ source: { kind: 'gear', bearerId: 'ember', conduitId: 'bastion-lock' },
      amount: plain.offered - guarded.offered }]);
  });
  it('attribution is pure bookkeeping: stripping boosts leaves identical state and events', () => {
    const state = fixture(['prism-splinter-socket', 'bastion-lock'], 'ember', ['tide']);
    const first = normal(structuredClone(state)), second = normal(structuredClone(state));
    expect(second.state).toEqual(first.state);
    expect(first.events.some(event => 'boosts' in event)).toBe(true);
    expect(() => validateRadiantCombat(first.state)).not.toThrow();
  });
});
