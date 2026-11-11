import { describe, expect, it } from 'vitest';
import { conduits, conduitUpgradeCost, type ConduitId } from '../content/conduits';
import {
  radiantConduits, radiantConduitPrimitives, radiantGearAmount, validateRadiantGear,
  type RadiantGear,
} from '../content/conduit-effects';
import {
  radiantBearerKits, resolveRadiantStarterStats, type RadiantBearerId, type RadiantLoadout,
} from '../content/combat-kits';
import {
  createRadiantCombat, applyRadiantCombatAction, effectiveRadiantStats, validateRadiantCombat,
  type RadiantCombatState, type RadiantCombatAction, type RadiantSource,
} from './combat-engine';
import { adaptRadiantLoadouts, type RadiantAccountGear } from './combat-loadout';
import { personalChargeMaximum, sharedChargeThreshold } from './combat-gauge';

function gear(...ids: ConduitId[]): RadiantGear {
  return Array.from({ length: 8 }, (_, index) => ids[index] ? { id: ids[index], rank: 0 } : null);
}
function member(starter: RadiantBearerId = 'ember', equipment?: RadiantGear, form = 6): RadiantLoadout {
  return { id: starter, starter, level: 0, form, weaponRank: 0, masterId: null, ascension: {}, gear: equipment };
}
function fixture(ids: ConduitId[] = [], starter: RadiantBearerId = 'ember', others: RadiantBearerId[] = []): RadiantCombatState {
  return createRadiantCombat([member(starter, gear(...ids)), ...others.map(id => member(id))],
    ['enemy', 'enemy2'].map(id => ({ id, stats: { hp: 100000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })), 0);
}
function act(state: RadiantCombatState, action: RadiantCombatAction) {
  return applyRadiantCombatAction(state, action);
}
function ready(state: RadiantCombatState, eternal = false): RadiantCombatState {
  for (const gauge of state.gauge.members) gauge.charge = personalChargeMaximum(gauge);
  if (eternal) state.gauge.sharedUnits = sharedChargeThreshold(state.gauge.eternalCasts);
  return state;
}
function defend(state: RadiantCombatState): RadiantCombatState {
  for (const ally of state.bearers)
    if (ally.hp > 0 && !state.acted.includes(ally.loadout.id))
      state = act(state, { type: 'defense', bearerId: ally.loadout.id }).state;
  return state;
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
    let previous = radiantConduitPrimitives({ id, rank: 0 });
    expect(previous.length).toBeGreaterThan(0);
    expect(previous.length).toBeLessThanOrEqual(2);
    const multipliers = { Common: 1, Rare: 2, Legendary: 4, Omnic: 200, Calamitic: 400 };
    for (let rank = 0; rank <= 5; rank++) {
      const current = radiantConduitPrimitives({ id, rank });
      current.forEach((primitive, index) => {
        expect(primitive.amount).toBeGreaterThan(0);
        expect(Number.isFinite(primitive.amount)).toBe(true);
        expect(primitive.amount).toBeCloseTo(previous[index].amount * (1 + .1 * rank));
      });
      expect(conduitUpgradeCost(conduit, rank)).toBe(
        rank === 5 ? null : [25, 50, 100, 175, 250][rank] * multipliers[conduit.rarity]);
    }
    expect(() => radiantConduitPrimitives({ id, rank: 6 })).toThrow();
    expect(() => radiantConduitPrimitives({ id, rank: -.1 })).toThrow();
  });
  it.each([
    ['precision-escapement', 'falcon-sight', 'execution-orrery', 'chaotic-fault-verdict', 'calamitic-worldbreaker-cannonade'],
    ['crosspin-governor', 'sentinel-aperture', 'siege-cantilever', 'ruinselect-prism', 'calamitic-world-eater-orrery'],
    ['bastion-lock', 'aegis-capacitor', 'granite-hourglass', 'tectonic-atlas-bastion', 'calamitic-monolith-of-the-unmoved-star'],
    ['fracture-reservoir', 'coilfeed-ratchet', 'astral-prism', 'voltaic-stormstep-dynamo', 'calamitic-causality-funeral-engine'],
  ] as ConduitId[][])('comparable purpose ladder %s is stronger at every equal rank', (...ladder) => {
    for (let rank = 0; rank <= 5; rank++) {
      const kind = radiantConduitPrimitives({ id: ladder[0], rank })[0].kind;
      const amounts = ladder.map(id => radiantConduitPrimitives({ id, rank }).find(entry => entry.kind === kind)!.amount);
      expect(amounts).toEqual([...amounts].sort((a, b) => a - b));
      expect(new Set(amounts).size).toBe(ladder.length);
    }
  });
  it.each(ids)('%s is usable in a real frozen encounter at every rank', id => {
    const conduit = conduits.find(entry => entry.id === id)!;
    const starter = (Object.keys(radiantBearerKits) as RadiantBearerId[])
      .find(key => !conduit.element || radiantBearerKits[key].elementId === conduit.element)!;
    for (let rank = 0; rank <= 5; rank++) {
      let state = fixture([id], starter);
      state.bearers[0].hp = Math.floor(state.bearers[0].hp / 2);
      state.bearers[0].loadout.gear![0]!.rank = rank;
      state.bearers[0].stats = resolveRadiantStarterStats(state.bearers[0].loadout);
      const before = structuredClone(state);
      state = normal(state).state;
      expect(before.acted).toEqual([]);
      state = round(state).state;
      state = ready(state);
      const offerTarget = radiantBearerKits[starter].signature.target;
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
  it.each(['hp', 'attack', 'defense', 'recovery'] as const)('%s modifies only its frozen stat', kind => {
    const id = ids.find(id => radiantConduitPrimitives({ id, rank: 0 }).some(effect => effect.kind === kind))!;
    const loadout = member('ember', gear(id));
    const base = resolveRadiantStarterStats(member());
    const actual = resolveRadiantStarterStats(loadout);
    expect(actual[kind]).toBeCloseTo(base[kind] * (1 + radiantGearAmount(loadout.gear, kind)));
    expect(Object.keys(actual)).toEqual(['hp', 'attack', 'defense', 'recovery']);
  });
  it.each(['precision-escapement', 'spearwheel-engine'] as ConduitId[])('%s increases actual Normal damage without extra RNG', id => {
    const control = normal(fixture()), result = normal(fixture([id]));
    const hit = result.events.find(event => event.type === 'damage' && event.source.kind === 'normal')!;
    expect(hit.type === 'damage' && hit.healthLoss).toBeGreaterThan(
      control.events.find(event => event.type === 'damage')!.type === 'damage'
        ? (control.events.find(event => event.type === 'damage') as Extract<typeof hit, { type: 'damage' }>).healthLoss : 0);
    expect(result.state.chargeSeed).toBe(control.state.chargeSeed);
  });
  it('Flare offense, support healing and native shield amplification affect actual results', () => {
    const cast = (id?: ConduitId, starter: RadiantBearerId = 'ember') => {
      const state = ready(fixture(id ? [id] : [], starter, ['rosetta']));
      state.bearers.forEach(ally => { ally.hp = 1; });
      return act(state, { type: 'flare', bearerId: starter });
    };
    const plain = cast(), boosted = cast('crosspin-governor');
    expect(boosted.state.enemies[0].hp).toBeLessThan(plain.state.enemies[0].hp);
    expect(cast('springwell-pump', 'sprout').state.bearers[0].hp).toBeGreaterThan(cast(undefined, 'sprout').state.bearers[0].hp);
    expect(cast('wardglass-transformer', 'tide').state.bearers[0].shields[0].remaining)
      .toBeGreaterThan(cast(undefined, 'tide').state.bearers[0].shields[0].remaining);
  });
  it('guard and resilience improve a real hostile phase and do not cleanse statuses', () => {
    const test = (id?: ConduitId) => {
      let state = fixture(id ? [id] : []);
      state.bearers[0].weaken.push({ source: { kind: 'enemy', enemyId: 'enemy' }, magnitude: .5, remaining: 2 });
      const attack = effectiveRadiantStats(state, 'ember').attack;
      state = defend(state);
      return { attack, result: act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 2 }) };
    };
    expect(test('fieldbrace-coupler').attack).toBeGreaterThan(test().attack);
    expect(test('stasis-reliquary').result.state.bearers[0].hp).toBeGreaterThan(test().result.state.bearers[0].hp);
    expect(test('fieldbrace-coupler').result.state.bearers[0].weaken).toHaveLength(1);
  });
  it('leader gear only applies while first and alive; cooperation requires a previous ally action', () => {
    let state = fixture(['calamitic-choir-array-of-branded-stars'], 'ember', ['rosetta']);
    expect(effectiveRadiantStats(state, 'rosetta').attack).toBeGreaterThan(
      effectiveRadiantStats(fixture([], 'ember', ['rosetta']), 'rosetta').attack);
    state.bearers[0].hp = 0; state.gauge.members[0].living = false;
    expect(effectiveRadiantStats(state, 'rosetta').attack).toBe(state.bearers[1].stats.attack);
    const control = normal(fixture(['clearwater-manifold'], 'tide', ['ember']));
    let after = fixture(['clearwater-manifold'], 'tide', ['ember']);
    after = normal(after, 'ember').state;
    expect(normal(after, 'tide').state.enemies[0].hp).toBeLessThan(
      normal(fixture([], 'tide', ['ember']), 'ember').state.enemies[0].hp - (100000 - control.state.enemies[0].hp));
  });
});

describe('bounded source-owned effect ledger', () => {
  it('personal/guard/team/shared charge are deterministic, six-wearer safe, and never expand C/2C', () => {
    let state = createRadiantCombat(['ember', 'tide', 'sprout', 'rosetta', 'thornia', 'crinso'].map(starter =>
      member(starter as RadiantBearerId, gear('fracture-reservoir', 'reserve-torque-crank',
        'calamitic-throne-borrowed-tomorrows'))),
    [{ id: 'enemy', stats: { hp: 1000000, attack: 20, defense: 20, recovery: 0 }, currencyBudget: 10 }], 0);
    for (let iteration = 0; iteration < 6; iteration++) {
      for (const ally of state.bearers) state = normal(state, ally.loadout.id).state;
      state = round(state).state;
      for (const gauge of state.gauge.members) expect(gauge.charge).toBeLessThanOrEqual(gauge.baseCost * 2);
    }
    expect(state.gauge.sharedUnits).toBeGreaterThan(0);
    expect(state.bearers).toHaveLength(6);
    const small = fixture(['fracture-reservoir']);
    small.bearers[0].loadout.form = 1; small.gauge.members[0].form = 1;
    small.bearers[0].stats = resolveRadiantStarterStats(small.bearers[0].loadout);
    small.bearers[0].hp = Math.round(small.bearers[0].stats.hp);
    expect(normal(small).state.gauge.members[0].charge).toBeLessThanOrEqual(small.gauge.members[0].baseCost);
  });
  it('shared gear gains require a frozen final form and Eternal never funds itself', () => {
    const early = fixture(['calamitic-throne-borrowed-tomorrows'], 'ember', ['rosetta']);
    for (const ally of early.bearers) {
      ally.loadout.form = 5;
      ally.stats = resolveRadiantStarterStats(ally.loadout); ally.hp = Math.round(ally.stats.hp);
    }
    early.gauge.members.forEach(gauge => { gauge.form = 5; });
    expect(normal(early).state.gauge.sharedUnits).toBe(0);
    const eternal = ready(fixture(['calamitic-throne-borrowed-tomorrows', 'duplex-heart'], 'sprout'), true);
    eternal.bearers[0].hp = 1;
    const result = act(eternal, { type: 'flare', bearerId: 'sprout' });
    expect(result.state.gauge.sharedUnits).toBe(0);
    expect(result.events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'gear')).toHaveLength(0);
  });
  it('native effective healing triggers once per cast; full HP and generated healing do not', () => {
    const run = (wounded: boolean) => {
      const state = ready(fixture(['duplex-heart', 'lifeline-flywheel'], 'sprout', ['tide', 'rosetta']));
      if (wounded) state.bearers.forEach(ally => { ally.hp = 1; });
      return act(state, { type: 'flare', bearerId: 'sprout' });
    };
    const healed = run(true);
    expect(healed.events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'gear')).toHaveLength(1);
    expect(run(false).events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'gear')).toHaveLength(0);
    const leech = normal(fixture(['lifeline-flywheel', 'duplex-heart']));
    expect(leech.events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'gear')).toHaveLength(0);
  });
  it('heal buffs use actual native recipients, never full-HP healing or gear-created healing', () => {
    const state = ready(fixture(['efflorescent-verdant-covenant'], 'sprout', ['rosetta']));
    state.bearers[1].hp = 1;
    const result = act(state, { type: 'flare', bearerId: 'sprout' });
    expect(result.state.bearers[0].attackBuffs).toEqual([]);
    expect(result.state.bearers[1].attackBuffs).toHaveLength(1);
    const generated = fixture(['lifeline-flywheel', 'tempered-strike-link'], 'ember', ['tide']);
    generated.bearers[0].hp = 1;
    expect(normal(generated).state.bearers[0].attackBuffs).toEqual([]);
  });
  it('native owned absorption—not creation or other-owner/gear Shields—funds charge and bounded reflection', () => {
    let state = fixture(['tidebound-reflector', 'aquatic-leviathan-pump'], 'tide', ['rosetta']);
    sourceShield(state, 1, { kind: 'flare', bearerId: 'tide' }, 1000);
    state = defend(state);
    const before = structuredClone(state);
    const hit = act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['rosetta'], coefficient: 1 });
    expect(hit.events.filter(event => event.type === 'damage' && event.source.kind === 'gear')).toHaveLength(1);
    expect(hit.events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'gear')).toHaveLength(1);
    const repeat = act(hit.state, { type: 'enemy-attack', enemyId: 'enemy2', targetIds: ['rosetta'], coefficient: 1 });
    expect(repeat.events.filter(event => 'source' in event && event.source?.kind === 'gear')).toHaveLength(0);
    expect(before.gearTriggered).toEqual([]);
    for (const source of [{ kind: 'flare', bearerId: 'rosetta' },
      { kind: 'gear', bearerId: 'tide', conduitId: 'tidebound-reflector' }] as RadiantSource[]) {
      let excluded = fixture(['tidebound-reflector', 'aquatic-leviathan-pump'], 'tide', ['rosetta']);
      sourceShield(excluded, 1, source, 1000);
      excluded = defend(excluded);
      const result = act(excluded, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['rosetta'], coefficient: 1 });
      expect(result.events.filter(event => 'source' in event && event.source?.kind === 'gear')).toHaveLength(0);
    }
  });
  it('dead source owners cannot reflect or receive absorption charge', () => {
    let state = fixture(['tidebound-reflector', 'aquatic-leviathan-pump'], 'tide', ['rosetta']);
    sourceShield(state, 1, { kind: 'flare', bearerId: 'tide' }, 1000);
    state.bearers[0].hp = 0; state.gauge.members[0].living = false;
    state = defend(state);
    const result = act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['rosetta'], coefficient: 1 });
    expect(result.events.filter(event => 'source' in event && event.source?.kind === 'gear')).toHaveLength(0);
  });
  it('multi-target absorption grants and reflects once, while lethal recipients never revive', () => {
    let state = fixture(['tidebound-reflector', 'aquatic-leviathan-pump'], 'tide', ['rosetta', 'ember']);
    state.bearers.forEach((_, index) => sourceShield(state, index, { kind: 'flare', bearerId: 'tide' }, 1000));
    state = defend(state);
    const hit = act(state, { type: 'enemy-attack', enemyId: 'enemy',
      targetIds: ['tide', 'rosetta', 'ember'], coefficient: 2 });
    expect(hit.events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'gear')).toHaveLength(1);
    expect(hit.events.filter(event => event.type === 'damage' && event.source.kind === 'gear')).toHaveLength(1);
    let doomed = fixture(['horizon-heartcase', 'immortal-vessel']);
    doomed.bearers[0].hp = 1;
    doomed = defend(doomed);
    const death = act(doomed, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 100 });
    expect(death.state.bearers[0].hp).toBe(0);
    expect(death.state.bearers[0].shields).toEqual([]);
    expect(death.state.phase).toBe('defeat');
  });
  it('generated native attacks never multiply leech or action-charge triggers', () => {
    const state = fixture(['lifeline-flywheel', 'fracture-reservoir'], 'crinso');
    state.bearers[0].hp = 1;
    state.enemies[0].burns.push({ source: { kind: 'flare', bearerId: 'crinso' }, magnitude: 10, remaining: 2 });
    const result = normal(state);
    const direct = result.events.find(event => event.type === 'damage' && event.origin === 'direct')!;
    expect(result.events.some(event => event.type === 'damage' && event.origin === 'generated')).toBe(true);
    const recovery = result.events.filter(event => event.type === 'heal' && event.source.kind === 'gear');
    expect(recovery).toHaveLength(1);
    expect(recovery[0].type === 'heal' && recovery[0].offered)
      .toBe(direct.type === 'damage' ? Math.round(direct.healthLoss * .1) : -1);
    expect(result.events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'gear')).toHaveLength(1);
  });
  it('guard, hurt, Flare and round Shields are finite unlimited-until-broken ledgers', () => {
    const guard = act(fixture(['citadel-spine']), { type: 'defense', bearerId: 'ember' });
    expect(guard.state.bearers[0].shields[0].remaining).toBeGreaterThan(0);
    const incoming = act(defend(fixture(['horizon-heartcase'])), {
      type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 2 });
    expect(incoming.state.bearers[0].shields.length).toBe(1);
    const cast = act(ready(fixture(['chaotic-ouroboros-core'], 'crinso', ['tide'])),
      { type: 'flare', bearerId: 'crinso', targetId: 'enemy' });
    expect(cast.state.bearers.every(ally => ally.shields.some(shield => shield.source.kind === 'gear'))).toBe(true);
    const shielded = round(fixture(['rootbound-triage-vault'], 'sprout'));
    expect(shielded.state.bearers[0].shields).toHaveLength(1);
    const saved = shielded.state.bearers[0].shields[0].remaining;
    expect(round(shielded.state).state.bearers[0].shields[0].remaining).toBe(saved);
  });
  it('round healing and Normal sustain use actual health; generated heals never feed gear', () => {
    const state = fixture(['immortal-vessel', 'verdict-caliper']);
    state.bearers[0].hp = 1;
    const sustained = normal(state);
    expect(sustained.state.bearers[0].hp).toBeGreaterThan(1);
    const reset = round(sustained.state);
    expect(reset.state.bearers[0].hp).toBeGreaterThan(sustained.state.bearers[0].hp);
    expect(reset.events.some(event => event.type === 'heal' && event.source.kind === 'gear')).toBe(true);
  });
  it('Burn/exposure/Weaken act on living targets; generated periodic packets cannot fund gear', () => {
    let state = fixture(['infernic-cinder-testament', 'fracture-reservoir']);
    const result = normal(state);
    expect(result.state.enemies[0].burns).toHaveLength(1);
    const finished = round(result.state);
    expect(finished.events.some(event => event.type === 'damage' && event.source.kind === 'gear' && event.origin === 'periodic')).toBe(true);
    expect(finished.events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'gear')).toHaveLength(0);
    expect(normal(fixture(['breach-pendulum', 'opal-indexer'])).state.enemies[0].exposures).toHaveLength(1);
    expect(normal(fixture(['opal-indexer'])).state.enemies[0].weaken).toHaveLength(1);
    state = fixture(['infernic-cinder-testament']);
    state.enemies[0].hp = 1; state.enemies[0].currency.lowestHP = 1;
    state.enemies[0].currency.paid = 999; state.currencyEarned = 999;
    expect(normal(state).state.enemies[0].burns).toEqual([]);
  });
  it('native statuses shield once per cast; next-ally buffs preserve immediate action', () => {
    const state = ready(fixture(['tension-governor'], 'crinso', ['rosetta']));
    const result = act(state, { type: 'flare', bearerId: 'crinso', targetId: 'enemy' });
    expect(result.events.filter(event => event.type === 'shield' && event.source.kind === 'gear')).toHaveLength(1);
    const next = normal(fixture(['luminous-dawn-witness-array'], 'rosetta', ['tide']));
    expect(next.state.bearers[1].attackBuffs).toHaveLength(1);
    expect(next.state.acted).toEqual(['rosetta']);
  });
  it('records exact personal/team/shared grants on native Shield hits without healing or status farming', () => {
    const state = fixture(['fracture-reservoir', 'calamitic-throne-borrowed-tomorrows'], 'ember', ['tide']);
    state.enemies[0].shields.push({ id: state.nextShieldId++, source: { kind: 'enemy', enemyId: 'enemy' }, remaining: 10000 });
    const result = normal(state);
    expect(result.state.gauge.members[0].charge).toBe(28);
    expect(result.state.gauge.members[1].charge).toBe(20.5);
    expect(result.state.gauge.sharedUnits).toBe(420);
    const chargeEvents = result.events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'gear');
    expect(chargeEvents).toHaveLength(3);
    const control = normal(fixture([], 'ember', ['tide']));
    expect(result.state.chargeSeed).toBe(control.state.chargeSeed);
    const guard = act(fixture(['reserve-torque-crank']), { type: 'defense', bearerId: 'ember' });
    expect(guard.state.gauge.members[0].charge).toBe(13);
    const ranked = fixture(['calamitic-throne-borrowed-tomorrows'], 'ember', ['tide']);
    ranked.bearers[0].loadout.gear![0]!.rank = 1;
    expect(normal(ranked).state.gauge.sharedUnits).toBe(444);
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
      [{ id: 'enemy', stats: { hp: 10000, attack: 10, defense: 20, recovery: 0 }, currencyBudget: 10 }], 0);
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
