import { describe, expect, it } from 'vitest';
import {
  radiantAttunement, radiantAttunements, radiantBearerKits, radiantFlares, radiantMasters,
  radiantStarterKits, radiantFinalFlare, radiantLeaderBonus, radiantLeaderEffects, radiantEquipmentAmount,
  releasedRadiantIds, resolveRadiantStarterStats, validateRadiantLoadout,
  type RadiantBearerId, type RadiantLoadout, type RadiantMasterId, type RadiantStarter,
} from '../content/combat-kits';
import { starters } from '../content/starters';
import { masterConduits } from '../content/master-conduits';
import { characterReleased } from '../content/release-visibility';
import {
  applyRadiantCombatAction, createRadiantCombat, depleteRadiantCurrency, effectiveRadiantStats,
  radiantDirectDamage, validateRadiantCombat, validateRadiantCurrencyLedger, validateRadiantParty,
  type RadiantCombatAction, type RadiantCombatState, type RadiantSource,
} from './combat-engine';
import { readyFlare } from './combat-gauge';

function loadout(starter: RadiantStarter = 'ember', overrides: Partial<RadiantLoadout> = {}): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 1, convergenceRank: 1, masterId: null,
    weaponRank: 0, ascension: { stats: false, skill1: false, skill2: false, lastFlare: false }, ...overrides };
}
function fixture(starters: RadiantStarter[] = ['ember'], form = 1, enemyHP = 10000): RadiantCombatState {
  return createRadiantCombat(starters.map((starter, index) => loadout(starter, { id: `ally-${index}`, form })),
    [{ elementId: null, id: 'enemy', stats: { hp: enemyHP, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 101 }], 0);
}
function apply(state: RadiantCombatState, action: RadiantCombatAction): RadiantCombatState {
  return applyRadiantCombatAction(state, action).state;
}
function charged(state: RadiantCombatState, tier: 'sparkling' | 'glimmering' | 'ultimate', id = 'ally-0'): RadiantCombatState {
  const next = structuredClone(state);
  const member = next.gauge.members.find(member => member.id === id)!;
  const rank = tier === 'sparkling' ? 1 : tier === 'glimmering' ? 6 : 11;
  const form = tier === 'sparkling' ? member.form : tier === 'glimmering' ? Math.max(member.form, 4) : 6;
  const bearer = next.bearers.find(entry => entry.loadout.id === id)!;
  bearer.loadout = { ...bearer.loadout, form, level: Math.max(bearer.loadout.level, (rank - 1) * 5), convergenceRank: rank };
  bearer.stats = resolveRadiantStarterStats(bearer.loadout);
  member.form = form;
  member.convergenceRank = rank;
  member.charge = member.baseCost * (tier === 'sparkling' ? 1 : 2);
  return next;
}
function passPlayers(state: RadiantCombatState): RadiantCombatState {
  for (const member of state.bearers.filter(member => member.hp > 0)) {
    if (!state.acted.includes(member.loadout.id)) return apply(state, { type: 'end-turn' });
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
  state.bearers[index].buffs.push({ category: 'weaken', source: { kind: 'enemy', enemyId: 'enemy' }, magnitude, remaining });
}
function sourceShield(state: RadiantCombatState, index: number, source: RadiantSource, remaining: number): void {
  state.bearers[index].shields.push({ id: state.nextShieldId++, source, remaining });
}

describe('radiant four-stat frozen starter content', () => {
  it.each(['ember', 'tide', 'sprout'] as const)('resolves %s with fractional Defense and source Recovery', starter => {
    const stats = resolveRadiantStarterStats(loadout(starter, { level: 30 }));
    const base = radiantStarterKits[starter].base;
    const role = radiantStarterKits[starter].role;
    expect(stats.hp).toBe(base.hp * 5.5 * (role === 'Support' ? 1.5 : 1));
    expect(stats.attack).toBe(base.attack * 5.5);
    expect(stats.recovery).toBe(base.recovery * 5.5);
    expect(stats.defense).toBeCloseTo(base.defense * 5.5 ** .7 * (role === 'Tank' ? 1.5 : 1));
    expect(Object.keys(stats)).toEqual(['hp', 'attack', 'defense', 'recovery']);
  });
  it.each(Object.keys(radiantMasters) as RadiantMasterId[])('attunes %s and restores Equinox on removal', masterId => {
    const master = radiantMasters[masterId];
    const baseLoadout = loadout(master.starter);
    const base = resolveRadiantStarterStats(baseLoadout);
    const equipped = { ...baseLoadout, masterId };
    expect(master.attunement).not.toBe('equinox');
    expect(radiantAttunement(equipped)).toBe(master.attunement);
    const modified = resolveRadiantStarterStats(equipped);
    for (const stat of ['hp', 'attack', 'defense', 'recovery'] as const)
      expect(modified[stat]).toBeCloseTo(base[stat] * radiantAttunements[master.attunement][stat] *
        (1 + radiantEquipmentAmount(equipped, stat)));
    expect(resolveRadiantStarterStats({ ...equipped, masterId: null })).toEqual(base);
    expect(radiantAttunement({ ...equipped, masterId: null })).toBe('equinox');
  });
  it('retains weapon investment and ascension without adding a hidden fifth stat', () => {
    const stats = resolveRadiantStarterStats(loadout('ember', { weaponRank: 5, ascension: { stats: true, skill1: false, skill2: false, lastFlare: false } }));
    expect(stats.attack).toBeCloseTo(60 * 1.1 * 1.5);
    expect(stats.hp).toBe(240 * 1.5);
  });
  it('rejects mismatched Masters, unknown starters, nonfinite levels and overflow', () => {
    expect(() => resolveRadiantStarterStats(loadout('sprout', { masterId: 'master-tide-1' }))).toThrow('match');
    expect(() => resolveRadiantStarterStats(loadout('retired' as RadiantStarter))).toThrow('loadout');
    expect(() => resolveRadiantStarterStats(loadout('sprout', { level: NaN }))).toThrow('loadout');
    expect(() => resolveRadiantStarterStats(loadout('ember', { level: 105, weaponRank: Number.MAX_SAFE_INTEGER })))
      .toThrow('loadout');
  });
});

describe('released Element-Bearer catalog and frozen account compatibility', () => {
  it.each(releasedRadiantIds.flatMap(id => (['sparkling', 'glimmering', 'ultimate'] as const).map(tier => ({ id, tier }))))(
    '$id executes $tier with its authored target set and a valid atomic state', ({ id, tier }) => {
      const before = charged(fixture([id, id === 'ember' ? 'tide' : 'ember'], 6), tier);
      before.bearers.forEach(member => { member.hp -= 40; });
      const offer = radiantFlares[id][tier];
      const result = applyRadiantCombatAction(before, offer.target === 'one-enemy'
        ? { type: 'flare', bearerId: 'ally-0', targetId: 'enemy' }
        : { type: 'flare', bearerId: 'ally-0' });
      expect(result.events.find(event => event.type === 'flare')).toMatchObject({
        bearerId: 'ally-0', tier, name: offer.name,
      });
      validateRadiantCombat(result.state);
      expect(before.gauge.members[0].charge).toBe(before.gauge.members[0].baseCost * (tier === 'sparkling' ? 1 : 2));
      expect(result.events.filter(event => event.type === 'gauge-drop')).toHaveLength(0);
      expect(result.state.gauge.members[1].charge).toBeLessThan(100);
      expect(result.state.gauge.members[0].convergenceRank).toBe(before.gauge.members[0].convergenceRank);
      expect(result.events.filter(event => event.type === 'charge').every(event => event.bonusRolls <= 2)).toBe(true);
    },
  );
  it('covers exactly the 32 released canonical identities and excludes all six Sunshade bearers', () => {
    const released = starters.filter(entry => characterReleased(entry.id)).map(entry => entry.id).sort() as RadiantBearerId[];
    expect(releasedRadiantIds.slice().sort()).toEqual(released);
    expect(releasedRadiantIds).toHaveLength(32);
    expect(Object.keys(radiantBearerKits).sort()).toEqual(released);
    expect(Object.keys(radiantFlares).sort()).toEqual(released);
    expect(new Set(releasedRadiantIds.map(id => radiantBearerKits[id].signatureFamily)).size).toBe(32);
    expect(released.every(id => radiantBearerKits[id].id === id && !!radiantBearerKits[id].weapon &&
      !!radiantBearerKits[id].element && !!radiantBearerKits[id].passive.description &&
      !!radiantBearerKits[id].leader && !!radiantBearerKits[id].signatureFamily)).toBe(true);
    for (const id of releasedRadiantIds) {
      const character = starters.find(entry => entry.id === id)!;
      expect(radiantBearerKits[id]).toMatchObject({
        name: character.name, element: character.element, weapon: character.weapon,
      });
    }
    expect(starters.filter(entry => !characterReleased(entry.id)).map(entry => entry.id)
      .every(id => !Object.hasOwn(radiantBearerKits, id) && !Object.hasOwn(radiantFlares, id))).toBe(true);
  });
  it.each(releasedRadiantIds)('%s has valid offers for all three Convergent Light bands', id => {
    const offers = radiantFlares[id];
    expect(Object.keys(offers).sort()).toEqual(['glimmering', 'sparkling', 'ultimate']);
    expect(new Set(Object.values(offers).map(offer => offer.target)).size).toBe(1);
    for (const offer of Object.values(offers)) {
      expect(offer.name).toBe(radiantBearerKits[id].kit.flare.name);
      expect(Object.values(offer).filter(value => typeof value === 'number').every(value =>
        Number.isFinite(value) && value >= 0)).toBe(true);
      expect(offer.burn > 0).toBe(offer.burnPhases > 0);
      expect(offer.reduction > 0).toBe(offer.reductionPhases > 0);
      expect(offer.weaken > 0).toBe(offer.weakenPhases > 0);
      expect(offer.exposure > 0).toBe(offer.exposurePhases > 0);
      expect(offer.renewal > 0).toBe(offer.renewalRounds > 0);
      expect(offer.attackBuff > 0).toBe(offer.attackBuffRounds > 0);
    }
  });
  it('scales kit Flares by tier: Glimmering 75% damage / 85% effects / 8 hits, Sparkling 50% / 70% / 4 (D-473 N3)', () => {
    expect(radiantFlares.ember.sparkling).toMatchObject({ name: 'Dawnfire', comboHits: 4, burnPhases: 3, attackBuffRounds: 3 });
    expect(radiantFlares.ember.sparkling.damage).toBeCloseTo(9 * .5);
    expect(radiantFlares.ember.glimmering.damage).toBeCloseTo(9 * .75);
    expect(radiantFlares.ember.ultimate).toMatchObject({ damage: 9, comboHits: 12, burn: 1, attackBuff: .5 });
    expect(radiantFlares.ember.glimmering.burn).toBeCloseTo(.85);
    expect(radiantFlares.tide.sparkling).toMatchObject({ name: 'Ocean Memory', target: 'all-allies', damage: 0, reductionPhases: 2 });
    expect(radiantFlares.tide.sparkling.shieldHP).toBeCloseTo(.35);
    expect(radiantFlares.tide.ultimate.shieldHP).toBeCloseTo(.5);
    expect(radiantFlares.sprout.glimmering.heal).toBeCloseTo(.6 * .85);
    expect(radiantFlares.elise.ultimate).toMatchObject({ name: 'Infinite Thunderwheel', target: 'one-enemy', damage: 13 });
  });
  it('maps all 96 released personal Masters exactly and rejects hidden or cross-owner IDs', () => {
    const expected = masterConduits.filter(master => characterReleased(master.character)).map(master => master.id).sort();
    expect(expected).toHaveLength(96);
    expect(Object.keys(radiantMasters).sort()).toEqual(expected);
    for (const [id, master] of Object.entries(radiantMasters)) {
      expect(id).toBe(`master-${master.starter}-${id.slice(-1)}`);
      expect(master.attunement).not.toBe('equinox');
      expect(master.effect.length).toBeGreaterThan(10);
      expect(radiantMasters[id as RadiantMasterId].starter).toBe(master.starter);
      expect(() => validateRadiantLoadout(loadout(master.starter, { masterId: id as RadiantMasterId }))).not.toThrow();
    }
    const hidden = masterConduits.find(master => !characterReleased(master.character))!;
    expect(() => validateRadiantLoadout(loadout('ember', { masterId: hidden.id as RadiantMasterId })))
      .toThrow('unreleased');
    expect(() => validateRadiantLoadout(loadout('ember', { masterId: 'master-tide-1' }))).toThrow('match');
  });
  it('freezes legal level caps, weapon rank and action-specific ascension/Imbue choices', () => {
    expect(() => validateRadiantLoadout(loadout('ember', { form: 1, level: 31 }))).toThrow('loadout');
    expect(() => validateRadiantLoadout(loadout('ozriel', { form: 6, level: 111 }))).toThrow('loadout');
    expect(() => validateRadiantLoadout(loadout('ember', { form: 6, level: 115,
      ascension: { stats: true, skill1: false, skill2: false, lastFlare: true } }))).not.toThrow();
    expect(() => validateRadiantLoadout(loadout('ember', { weaponRank: 11 }))).toThrow('loadout');
    const base = loadout('ember', { form: 6, level: 105 });
    const imbued = { ...base, ascension: { ...base.ascension, lastFlare: true } };
    expect(resolveRadiantStarterStats(imbued)).toEqual(resolveRadiantStarterStats(base));
    const statsAscended = { ...base, ascension: { ...base.ascension, stats: true } };
    expect(resolveRadiantStarterStats(statsAscended).hp).toBeCloseTo(resolveRadiantStarterStats(base).hp * 1.5);
    // @ts-expect-error Deliberately malformed untrusted snapshot.
    expect(() => validateRadiantLoadout({ ...base, ascension: true })).toThrow('loadout');
    // @ts-expect-error Deliberately malformed untrusted snapshot.
    expect(() => validateRadiantLoadout({ ...base, ascension: [] })).toThrow('loadout');
    // @ts-expect-error The prior isolated study schema must be restarted.
    expect(() => validateRadiantCombat({ ...fixture(), version: 1 })).toThrow('version');
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
  it('does not randomize damage or consume the retired charge seed', () => {
    const first = fixture();
    const second = structuredClone(first);
    second.chargeSeed = 999;
    const action = { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' } as const;
    const a = applyRadiantCombatAction(first, action), b = applyRadiantCombatAction(second, action);
    expect(a.events.filter(event => event.type === 'damage')).toEqual(b.events.filter(event => event.type === 'damage'));
    expect(a.state.chargeSeed).not.toBe(b.state.chargeSeed);
    expect(a.state.chargeSeed).toBe(0);
    expect(b.state.chargeSeed).toBe(999);
    expect(a.state.gauge.members[0].charge).toBe(15);
    expect(first.chargeSeed).toBe(0);
  });
});

describe('saved enemy Gauge drops', () => {
  const squad = ['ember', 'tide', 'sprout'] as const;
  it('grants Normal Luminosity without cross-element sharing', () => {
    const state = fixture([...squad], 6), before = structuredClone(state);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.events.filter(event => event.type === 'gauge-drop')).toEqual([
      { type: 'gauge-drop', enemyId: 'enemy', bearerId: 'ally-0', trigger: 'hit', amount: 15 },
    ]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([15, 0, 0]);
    expect(Object.keys(result.state.gauge)).toEqual(['members']);
    expect(result.state.chargeSeed).toBe(0);
    expect(state).toEqual(before);
  });
  it('treats a fully absorbed direct hit as an enemy drop without awarding currency', () => {
    const state = fixture(['ember', 'tide'], 6);
    state.enemies[0].shields.push({ id: state.nextShieldId++, source: { kind: 'enemy', enemyId: 'enemy' }, remaining: 10000 });
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.state.enemies[0].hp).toBe(state.enemies[0].hp);
    expect(result.state.currencyEarned).toBe(0);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([15, 0]);
    expect(result.events.filter(event => event.type === 'gauge-drop')).toHaveLength(1);
  });
  it('does not add defeat Luminosity or duplicate currency', () => {
    const result = applyRadiantCombatAction(fixture([...squad], 6, 1),
      { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.events.filter(event => event.type === 'gauge-drop')).toEqual([
      { type: 'gauge-drop', enemyId: 'enemy', bearerId: 'ally-0', trigger: 'hit', amount: 15 },
    ]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([15, 0, 0]);
    expect(result.state.chargeSeed).toBe(0);
    expect(result.state.currencyEarned).toBe(101);
  });
  it('resolves eight hits per Flare target without generating Luminosity', () => {
    const loadouts = squad.map((starter, index) => loadout(starter, { id: `ally-${index}`, form: 6 }));
    const enemies = Array.from({ length: 6 }, (_, index) => ({ elementId: null, id: `enemy-${index}`,
      stats: { hp: 1000000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }));
    const result = applyRadiantCombatAction(charged(createRadiantCombat(loadouts, enemies, 0), 'glimmering'),
      { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'damage')).toHaveLength(48);
    expect(result.events.filter(event => event.type === 'gauge-drop')).toEqual([]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([0, 0, 0]);
    expect(result.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 0, bonusOffered: 0 });
    expect(result.state.chargeSeed).toBe(0);
  });
  it('keeps support Masters free of generated attacks and charge refunds', () => {
    const state = createRadiantCombat([
      loadout('tide', { id: 'ally-0', form: 6, masterId: 'master-tide-3' }),
      loadout('ember', { id: 'ally-1', form: 6 }),
    ], [{ elementId: null, id: 'enemy', stats: { hp: 1, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
    const result = applyRadiantCombatAction(charged(state, 'sparkling'), { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'damage')).toEqual([]);
    expect(result.events.filter(event => event.type === 'gauge-drop')).toEqual([]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([0, 0]);
    expect(result.state.currencyEarned).toBe(0);
    expect(result.state.chargeSeed).toBe(0);
  });
  it('pays periodic finishing damage without sharing Luminosity from a defeated owner', () => {
    const state = fixture(['ember', 'tide', 'sprout'], 6, 1);
    state.bearers[0].hp = 0; state.gauge.members[0].living = false;
    state.phase = 'enemy'; state.acted = ['ally-1', 'ally-2']; state.enemyActed = ['enemy'];
    state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 1, remaining: 1 });
    const result = applyRadiantCombatAction(state, { type: 'finish-enemy-phase' });
    expect(result.events.filter(event => event.type === 'gauge-drop')).toEqual([]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([0, 0, 0]);
    expect(result.state.chargeSeed).toBe(0);
    expect(result.state.phase).toBe('victory');
    expect(result.state.currencyEarned).toBe(101);
  });
});

describe('three-member action rounds, fixed leader and state isolation', () => {
  it('accepts a frozen three-distinct owned-bearer party and never promotes a dead first leader', () => {
    const ids = ['ember', 'rosetta', 'tide'] as const;
    const loadouts = ids.map((starter, index) => loadout(starter, {
      id: `owned-instance-${index}`, level: 30, form: 2,
    }));
    expect(() => validateRadiantParty(loadouts)).not.toThrow();
    const state = createRadiantCombat(loadouts,
      [{ elementId: null, id: 'enemy', stats: { hp: 10000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 101 }], 0);
    const before = effectiveRadiantStats(state, loadouts[1].id).attack;
    state.gauge.members[1].charge = state.gauge.members[1].baseCost;
    expect(readyFlare(state.gauge, loadouts[1].id)).toBe('sparkling');
    state.bearers[0].hp = 0;
    state.gauge.members[0].living = false;
    validateRadiantCombat(state);
    // D-473: Passives no longer add squad stats, so a defeated leader leaves Attack unchanged.
    expect(effectiveRadiantStats(state, loadouts[1].id).attack).toBeCloseTo(before);
    expect(readyFlare(state.gauge, loadouts[1].id)).toBe('sparkling');
    expect(state.gauge.members.slice(2).every(member => readyFlare(state.gauge, member.id) === null)).toBe(true);
    expect(() => validateRadiantParty([loadouts[0], { ...loadouts[1], starter: 'ember' }])).toThrow('distinct');
    const input = structuredClone(state);
    const resolved = applyRadiantCombatAction(state, { type: 'normal', bearerId: loadouts[1].id, targetId: 'enemy' });
    expect(state).toEqual(input);
    expect(resolved.state.bearers[0].hp).toBe(0);
  });
  it('End Turn skips members who have not acted and starts the enemy phase', () => {
    let state = fixture(['ember', 'tide', 'sprout'], 6);
    state = apply(state, { type: 'normal', bearerId: 'ally-1', targetId: 'enemy' });
    const ended = applyRadiantCombatAction(state, { type: 'end-turn' });
    expect(ended.events).toEqual([]);
    expect(ended.state.phase).toBe('enemy');
    expect(ended.state.acted).toEqual(['ally-1', 'ally-0', 'ally-2']);
    expect(ended.state.gauge).toEqual(state.gauge);
    expect(() => applyRadiantCombatAction(ended.state, { type: 'end-turn' })).toThrow('player phase');
    state.bearers[2].hp = 0; state.gauge.members[2].living = false;
    expect(applyRadiantCombatAction(state, { type: 'end-turn' }).state.acted).toEqual(['ally-1', 'ally-0']);
  });
  it('rejects a fourth squad member', () => {
    expect(() => fixture(['ember', 'tide', 'sprout', 'ember'])).toThrow();
  });
  it.each([1, 2, 3])('requires each of %i members to act once and preserves normalized round charge', size => {
    let state = fixture(Array.from({ length: size }, () => 'ember'), 6);
    for (let index = 0; index < size; index++) {
      state.gauge.members[index].charge = 25;
      state = apply(state, { type: 'skill', bearerId: `ally-${index}`, slot: 1, targetId: 'enemy' });
      expect(state.phase).toBe(index === size - 1 ? 'enemy' : 'player');
    }
    expect(() => apply(state, { type: 'finish-enemy-phase' })).toThrow('Every living enemy');
    expect(() => apply(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' })).toThrow('player phase');
    state = apply(state, { type: 'enemy-heal', enemyId: 'enemy', amount: 0 });
    expect(() => apply(state, { type: 'enemy-heal', enemyId: 'enemy', amount: 0 })).toThrow('already acted');
    state = apply(state, { type: 'finish-enemy-phase' });
    expect(state.round).toBe(2);
    expect(state.acted).toEqual([]);
    expect(state.skilled).toEqual([]);
    expect(state.gauge.members.every(member => member.charge === 0)).toBe(true);
    expect(Object.keys(state.gauge)).toEqual(['members']);
  });
  it('does not promote a surviving leader when first member dies and lets all survivors act next round', () => {
    let state = fixture(['ember', 'tide', 'sprout']);
    const leaderAttack = effectiveRadiantStats(state, 'ally-1').attack;
    expect(leaderAttack).toBeCloseTo(44);
    expect(effectiveRadiantStats(state, 'ally-2').recovery).toBeCloseTo(65);
    state = passPlayers(state);
    state = apply(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-0'], coefficient: 1000 });
    expect(state.bearers[0].hp).toBe(0);
    expect(effectiveRadiantStats(state, 'ally-1').attack).toBeCloseTo(44);
    expect(effectiveRadiantStats(state, 'ally-1').defense).toBeCloseTo(22 * 1.5);
    state = apply(state, { type: 'finish-enemy-phase' });
    expect(state.gauge.members[0].charge).toBe(0);
    expect(() => apply(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' })).toThrow('Defeated');
    state = passPlayers(state);
    expect(state.phase).toBe('enemy');
    expect(state.acted).toEqual(['ally-1', 'ally-2']);
  });
  it('keeps input, returned state, events and frozen loadouts independent', () => {
    const inputLoadout = loadout();
    const state = createRadiantCombat([inputLoadout],
      [{ elementId: null, id: 'enemy', stats: { hp: 1000, attack: 1, defense: 1, recovery: 0 }, currencyBudget: 100 }], 0);
    inputLoadout.masterId = 'master-ember-1';
    const before = structuredClone(state);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(state).toEqual(before);
    expect(state.bearers[0].loadout.masterId).toBeNull();
    result.state.bearers[0].loadout.level = 99;
    expect(state.bearers[0].loadout.level).toBe(0);
    const shieldResult = applyRadiantCombatAction(charged(fixture(['tide']), 'sparkling'),
      { type: 'flare', bearerId: 'ally-0' });
    const shieldEvent = shieldResult.events.find(event => event.type === 'shield')!;
    if ('bearerId' in shieldEvent.source) shieldEvent.source.bearerId = 'presentation-only';
    expect(shieldResult.state.bearers[0].shields[0].source).toEqual({ kind: 'flare', bearerId: 'ally-0' });
  });
  it('rejects duplicate/oversized squads, forged frozen stats and inconsistent gauges', () => {
    expect(() => fixture(Array.from({ length: 4 }, () => 'sprout'))).toThrow('roster');
    expect(() => createRadiantCombat([loadout(), loadout()],
      [{ elementId: null, id: 'enemy', stats: { hp: 10, attack: 1, defense: 0, recovery: 0 }, currencyBudget: 1 }], 0))
      .toThrow('distinct');
    const state = fixture();
    state.bearers[0].stats.attack++;
    expect(() => validateRadiantCombat(state)).toThrow('frozen stats');
    state.bearers[0].stats.attack--;
    state.gauge.members[0].form = 2;
    expect(() => validateRadiantCombat(state)).toThrow('Gauge member mismatch');
  });
  it('round-trips an in-progress three-member frozen run with charge seeds, snapshots and paid ledgers', () => {
    let state = charged(fixture(['tide', 'sprout', 'ember'], 6), 'sparkling');
    state.bearers[1].hp -= 100;
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    state = charged(state, 'sparkling', 'ally-1');
    state = apply(state, { type: 'flare', bearerId: 'ally-1' });
    const restored = JSON.parse(JSON.stringify(state)) as RadiantCombatState;
    validateRadiantCombat(restored);
    const action = { type: 'normal', bearerId: 'ally-2', targetId: 'enemy' } as const;
    expect(applyRadiantCombatAction(restored, action)).toEqual(applyRadiantCombatAction(state, action));
  });
  it('rejects a repeated player action, wrong phase and malformed inputs without mutation', () => {
    const state = apply(fixture(['ember', 'sprout']), { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    const before = structuredClone(state);
    for (const action of [
      { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' },
      { type: 'defense', bearerId: 'ally-1' },
      { type: 'skill', bearerId: 'ally-1', slot: 1 },
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
    let state = fixture(['ember'], 1, 1);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.state.phase).toBe('victory');
    expect(result.events.filter(event => event.type === 'defeated')).toHaveLength(1);
    expect(result.state.gauge.members[0].charge).toBe(15);
    expect(() => apply(result.state, { type: 'finish-enemy-phase' })).toThrow('finished');
    state = passPlayers(fixture());
    state = apply(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-0'], coefficient: 1000 });
    expect(state.phase).toBe('defeat');
    expect(() => apply(state, { type: 'finish-enemy-phase' })).toThrow('finished');
  });
});

describe('progressive signatures and layered shared readiness', () => {
  it.each(['ember', 'tide', 'sprout'] as const)('keeps %s signature targets and increases offers across all tiers', starter => {
    const records = (['sparkling', 'glimmering', 'ultimate'] as const).map(tier => {
      const state = charged(fixture([starter, 'ember'], 6, 1000000), tier);
      state.bearers.forEach(member => { member.hp -= 100; });
      const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
      expect(result.events.find(event => event.type === 'flare')).toMatchObject({ tier });
      if (starter === 'ember') {
        const damage = result.events.find(event => event.type === 'damage');
        expect(damage).toMatchObject({ targetId: 'enemy', origin: 'direct' });
        return result.events.reduce((sum, event) => sum + (event.type === 'damage' ? event.offered : 0), 0);
      }
      const events = result.events.filter(event => event.type === (starter === 'tide' ? 'shield' : 'heal') &&
        'source' in event && event.source.kind === 'flare');
      expect(events.map(event => 'targetId' in event ? event.targetId : '')).toEqual(['ally-0', 'ally-1']);
      const first = events[0];
      return first.type === 'shield' ? first.amount : first.type === 'heal' ? first.offered : 0;
    });
    expect(records[1]).toBeGreaterThan(records[0]);
    expect(records[2]).toBeGreaterThan(records[1]);
  });
  it('retains partial charge and spends each bearer窶冱 saved Convergent Light rank independently', () => {
    let state = fixture(['tide', 'sprout', 'ember'], 6);
    state.gauge.members[0].charge = 137;
    const partial = apply(state, { type: 'flare', bearerId: 'ally-0' });
    expect(partial.gauge.members[0].charge).toBe(37);
    state = charged(charged(state, 'ultimate'), 'glimmering', 'ally-1');
    state = charged(state, 'glimmering', 'ally-2');
    expect(readyFlare(state.gauge, 'ally-2')).toBe('glimmering');
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.find(event => event.type === 'flare')).toMatchObject({ tier: 'ultimate' });
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([0, 200, 200]);
    expect(readyFlare(result.state.gauge, 'ally-1')).toBe('glimmering');
    expect(() => apply(result.state, { type: 'flare', bearerId: 'ally-0' })).toThrow('already acted');
    expect(Object.keys(state.gauge)).toEqual(['members']);
  });
  it('uses only saved personal gauge state and never introduces a temporary mode', () => {
    let state = charged(fixture(['tide'], 5), 'glimmering');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    state = nextRound(state);
    expect(Object.keys(state.gauge)).toEqual(['members']);
    expect(Object.keys(state)).not.toEqual(expect.arrayContaining(['mode', 'timer', 'recovery']));
    expect(state.phase).toBe('player');
    expect(state.acted).toEqual([]);
  });
  it('resolves real AoE combos and support Flares without personal charge or random rolls', () => {
    const enemies = Array.from({ length: 6 }, (_, i) => ({ elementId: null, id: `enemy-${i}`,
      stats: { hp: 1000000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }));
    const state = charged(createRadiantCombat([loadout('ember', { id: 'ally-0', form: 6 })], enemies, 0), 'ultimate');
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'damage')).toHaveLength(72);
    expect(result.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 0, bonusOffered: 0 });
    expect(result.state.chargeSeed).toBe(0);
    const support = charged(createRadiantCombat([loadout('disciple', { id: 'disciple', masterId: 'master-disciple-3', form: 6 })],
      enemies, 0), 'glimmering', 'disciple');
    const supported = applyRadiantCombatAction(support, { type: 'flare', bearerId: 'disciple' });
    expect(supported.events.some(event => event.type === 'damage')).toBe(false);
    expect(supported.events.find(event => event.type === 'status' && event.status === 'attack-up')).toBeDefined();
    expect(supported.state.gauge.members[0].charge).toBe(0);
    expect(supported.state.chargeSeed).toBe(0);
  });
  it('does not detonate existing Burn before an Ultimate Convergent Light combo', () => {
    const state = charged(fixture(['ember'], 6, 100), 'ultimate');
    state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 1000, remaining: 1 });
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'damage').every(event => event.origin === 'direct')).toBe(true);
    expect(result.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 0 });
    expect(result.state.gauge.members[0].charge).toBe(0);
    expect(result.state.chargeSeed).toBe(0);
    expect(result.state.currencyEarned).toBe(101);
  });
});

describe('Burn as one category (D-473 N6)', () => {
  it('keeps one Burn per enemy: a stronger Burn takes over its source, a weaker one only extends the duration', () => {
    let state = charged(fixture(['ember', 'tide'], 6, 1000000), 'sparkling');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    const first = structuredClone(state.enemies[0].debuffs.find(effect => effect.category === 'burn')!);
    expect(first).toMatchObject({ source: { kind: 'flare', bearerId: 'ally-0' }, remaining: 3 });
    state = charged(nextRound(state), 'ultimate');
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'damage')).toHaveLength(12);
    expect(result.events.filter(event => event.type === 'damage').every(event => event.origin === 'direct')).toBe(true);
    const burns = result.state.enemies[0].debuffs.filter(effect => effect.category === 'burn');
    expect(burns).toHaveLength(1);
    expect(burns[0].magnitude).toBeGreaterThan(first.magnitude);
    expect(burns[0].remaining).toBe(3);
    // A weaker Burn from another caster leaves the stronger entry and its source in place.
    const weaker = structuredClone(result.state);
    weaker.phase = 'player'; weaker.acted = []; weaker.gauge.members[1].charge = 25;
    weaker.enemies[0].debuffs = [{ ...burns[0], remaining: 1 }];
    const cleave = applyRadiantCombatAction(charged(weaker, 'sparkling'), { type: 'skill', bearerId: 'ally-0', slot: 1, targetId: 'enemy' });
    expect(cleave.state.enemies[0].debuffs.find(effect => effect.category === 'burn')).toMatchObject({
      magnitude: burns[0].magnitude, remaining: 3, source: burns[0].source });
  });
  it('does not add retired passive packets to a Burning target', () => {
    const state = fixture();
    state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 1, remaining: 2 });
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.events.filter(event => event.type === 'damage').map(event => event.origin)).toEqual(['direct']);
    expect(result.state.enemies[0].debuffs).toEqual(state.enemies[0].debuffs);
    expect(result.state.gauge.members[0].charge).toBe(15);
  });
  it('does not grant a new round when a scheduled Burn finishes the encounter', () => {
    let state = passPlayers(fixture());
    state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 10000, remaining: 1 });
    state = apply(state, { type: 'enemy-heal', enemyId: 'enemy', amount: 0 });
    const result = applyRadiantCombatAction(state, { type: 'finish-enemy-phase' });
    expect(result.state.phase).toBe('victory');
    expect(result.events.some(event => event.type === 'round')).toBe(false);
    expect(result.state.gauge.members[0].charge).toBe(0);
    expect(result.state.currencyEarned).toBe(101);
  });
});

describe('kit Shields, Damage Reduction and incoming Luminosity', () => {
  it('adds repeat native layers indefinitely until broken with stable source and no expiry/cap', () => {
    let state = charged(fixture(['tide']), 'sparkling');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    const amount = state.bearers[0].shields[0].remaining;
    for (let index = 0; index < 8; index++) {
      state = charged(nextRound(state), 'sparkling');
      state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    }
    expect(state.bearers[0].shields).toHaveLength(9);
    expect(state.bearers[0].shields.reduce((sum, shield) => sum + shield.remaining, 0)).toBe(amount * 9);
    expect(amount * 9).toBeGreaterThan(state.bearers[0].stats.hp * .5);
    expect(state.bearers[0].shields.every(shield => !Object.hasOwn(shield, 'remainingPhases'))).toBe(true);
    expect(state.bearers[0].shields.map(shield => shield.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('sizes kit Shields from the recipient\'s max Health (D-473 N7)', () => {
    const state = charged(fixture(['tide', 'sprout']), 'sparkling');
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    // Ocean Memory Sparkling: 50% x 70% of each recipient's max Health; Tizu (Tank) has Skill Power 1.
    expect(result.events.filter(event => event.type === 'shield').map(event => event.type === 'shield' && event.amount))
      .toEqual(state.bearers.map(member => Math.round(.35 * member.stats.hp)));
  });
  it('grants incoming charge to each blocked target without extra Shield-owner charge', () => {
    let state = apply(charged(fixture(['tide', 'sprout']), 'sparkling'), { type: 'flare', bearerId: 'ally-0' });
    state = passPlayers(state);
    const result = applyRadiantCombatAction(state, { type: 'enemy-attack', enemyId: 'enemy',
      targetIds: ['ally-0', 'ally-1'], coefficient: .1 });
    expect(result.state.bearers.map(member => member.hp)).toEqual(state.bearers.map(member => member.hp));
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([10, 10]);
    expect(result.events.filter(event => event.type === 'damage').every(event => event.healthLoss === 0)).toBe(true);
  });
  it('grants each direct incoming hit without funding a different Shield owner', () => {
    const enemies = ['first', 'second'].map(id => ({ elementId: null,
      id, stats: { hp: 1000, attack: 1, defense: 1, recovery: 0 }, currencyBudget: 1 }));
    let state = charged(createRadiantCombat([loadout('tide', { id: 'ally-0', form: 6 }),
      loadout('sprout', { id: 'ally-1', form: 6 })], enemies, 0), 'sparkling');
    state = passPlayers(apply(state, { type: 'flare', bearerId: 'ally-0' }));
    state = apply(state, { type: 'enemy-attack', enemyId: 'first', targetIds: ['ally-1'], coefficient: 1 });
    expect(state.gauge.members.map(member => member.charge)).toEqual([0, 10]);
    state = apply(state, { type: 'enemy-attack', enemyId: 'second', targetIds: ['ally-1'], coefficient: 1 });
    expect(state.gauge.members.map(member => member.charge)).toEqual([0, 20]);
    state = apply(state, { type: 'finish-enemy-phase' });
    expect(state.gauge.members.map(member => member.charge)).toEqual([0, 20]);
  });
  it('applies Damage Reduction without a Defend base and expires it on its clock', () => {
    const state = fixture(['tide']);
    state.bearers[0].buffs.push({ category: 'reduction', source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: .2, remaining: 1 });
    let phase = passPlayers(state);
    const damage = applyRadiantCombatAction(phase, { type: 'enemy-attack', enemyId: 'enemy',
      targetIds: ['ally-0'], coefficient: 10 });
    expect(damage.events.find(event => event.type === 'damage')).toMatchObject({
      offered: radiantDirectDamage(20, effectiveRadiantStats(phase, 'ally-0').defense, 10, .8),
    });
    phase = apply(damage.state, { type: 'finish-enemy-phase' });
    expect(phase.bearers[0].buffs).toEqual([]);
  });
  it('caps Damage Reduction at 75% and keeps the 20% damage floor', () => {
    const state = fixture(['tide']);
    state.bearers[0].buffs.push({ category: 'reduction', source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: .76, remaining: 1 });
    expect(() => validateRadiantCombat(state)).toThrow('cap');
    state.bearers[0].buffs[0].magnitude = .75;
    const result = applyRadiantCombatAction(passPlayers(state), { type: 'enemy-attack', enemyId: 'enemy',
      targetIds: ['ally-0'], coefficient: 10 });
    expect(result.events.find(event => event.type === 'damage')).toMatchObject({
      offered: radiantDirectDamage(20, effectiveRadiantStats(state, 'ally-0').defense, 10, .25),
    });
  });
});

describe('kit healing and Health Over Time (D-473 N7)', () => {
  it('heals a % of the recipient\'s max Health x the caster\'s Skill Power, with no revive and no fake charge', () => {
    const state = charged(fixture(['sprout', 'ember']), 'sparkling');
    state.bearers[1].hp = 0;
    state.gauge.members[1].living = false;
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    // Worldseed Sparkling: 60% x 70% x Support Skill Power 1.25 of Flora's max Health, x1.2 from her own Leader (healing +20%).
    expect(result.events.filter(event => event.type === 'heal' && event.source.kind === 'flare')).toEqual([
      expect.objectContaining({ targetId: 'ally-0', effective: 0, offered: Math.round(.6 * .7 * 1.25 * state.bearers[0].stats.hp * 1.2) }),
    ]);
    expect(result.state.bearers[1].hp).toBe(0);
    expect(result.state.gauge.members[0].charge).toBe(0);
    expect(result.state.chargeSeed).toBe(0);
  });
  it('sizes each kit heal from its own recipient, not the caster', () => {
    const state = charged(fixture(['sprout', 'ember', 'tide']), 'sparkling');
    state.bearers.forEach(member => { member.hp = 1; });
    const cast = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(cast.events.filter(event => event.type === 'heal' && event.source.kind === 'flare').map(event => event.type === 'heal' && event.offered))
      .toEqual(state.bearers.map(member => Math.round(.6 * .7 * 1.25 * member.stats.hp * 1.2)));
  });
  it('heals Health Over Time at the end of the enemy phase and expires it on its clock', () => {
    const state = fixture(['sprout', 'ember']);
    state.bearers[1].hp = 1;
    state.bearers[1].buffs.push({ category: 'hot', source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: .1, remaining: 1 });
    const result = applyRadiantCombatAction(apply(passPlayers(state), { type: 'enemy-heal', enemyId: 'enemy', amount: 0 }),
      { type: 'finish-enemy-phase' });
    expect(result.events.find(event => event.type === 'heal' && event.targetId === 'ally-1')).toMatchObject({
      offered: Math.round(.1 * state.bearers[1].stats.hp * 1.2) });
    expect(result.state.bearers[1].buffs).toEqual([]);
  });
  it('does not create retired Seeds or Renewal after Normal damage', () => {
    const state = fixture(['sprout', 'ember', 'tide']);
    state.bearers.forEach(member => { member.hp = Math.round(member.stats.hp) / 2; });
    const result = apply(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.bearers.every(member => member.buffs.length === 0)).toBe(true);
    const following = nextRound(result);
    // Only Flora's Leader round heal (10% of her Recovery) lands, on the first most-wounded ally.
    expect(following.bearers[0].hp).toBe(state.bearers[0].hp + Math.round(effectiveRadiantStats(state, 'ally-0').recovery * .1));
    expect(following.bearers.slice(1).map(member => member.hp)).toEqual(state.bearers.slice(1).map(member => member.hp));
  });
});

describe('authored Master equipment', () => {
  it.each(Object.keys(radiantMasters) as RadiantMasterId[])('%s resolves legal native casts without instant repeat casts', masterId => {
    const master = radiantMasters[masterId], owner = loadout(master.starter, { id: 'ally-0', masterId, form: 6, level: 105 });
    expect(master.rule).toBe('standard');
    for (const tier of ['sparkling', 'glimmering', 'ultimate'] as const) {
      const state = createRadiantCombat([owner],
        [{ elementId: null, id: 'enemy', stats: { hp: 1000000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
      state.bearers[0].hp -= 10;
      const readyState = charged(state, tier);
      const readyOwner = readyState.bearers[0].loadout;
      const offer = radiantFinalFlare(readyOwner, tier);
      const plainOffer = radiantFinalFlare({ ...readyOwner, masterId: null }, tier);
      const result = applyRadiantCombatAction(readyState,
        offer.target === 'one-enemy' ? { type: 'flare', bearerId: owner.id, targetId: 'enemy' }
          : { type: 'flare', bearerId: owner.id });
      if (offer.damage > 0) {
        const damage = result.events.filter(event => event.type === 'damage' && event.origin === 'direct');
        expect(damage).toHaveLength(offer.comboHits);
        expect(damage.every(event => event.type === 'damage' && event.offered > 0)).toBe(true);
      }
      expect(offer).toEqual(plainOffer);
      expect(result.state.gauge.members[0].charge).toBeLessThan(100);
      validateRadiantCombat(result.state);
    }
  });
  it('gives each starter three mechanically different Master choices', () => {
    for (const starter of ['ember', 'tide', 'sprout'] as const) {
      const definitions = ([1, 2, 3] as const).map(slot => radiantMasters[`master-${starter}-${slot}`]);
      expect(new Set(definitions.map(master => master.effects.map(effect => effect.kind).sort().join('|'))).size).toBe(3);
    }
  });
  it('requires explicit valid target confirmation for one-enemy signatures before any spend or seed advance', () => {
    const state = charged(createRadiantCombat([loadout('rosetta', { id: 'ally-0', masterId: 'master-rosetta-3' })],
      [{ elementId: null, id: 'enemy', stats: { hp: 100, attack: 1, defense: 0, recovery: 0 }, currencyBudget: 100 }], 0), 'sparkling');
    const before = structuredClone(state);
    expect(() => apply(state, { type: 'flare', bearerId: 'ally-0' })).toThrow('selected living enemy');
    expect(() => apply(state, { type: 'flare', bearerId: 'ally-0', targetId: 'missing' })).toThrow('Unknown');
    expect(state).toEqual(before);
    expect(() => apply(charged(fixture(['sprout']), 'sparkling'), { type: 'flare', bearerId: 'ally-0', targetId: 'enemy' }))
      .toThrow('authored target set');
  });
});

describe('Passives, Masters and Leaders under the Phase 3 kits', () => {
  function exercisePassive(id: RadiantBearerId, masterId: RadiantMasterId | null = null) {
    const state = createRadiantCombat([loadout(id, { id: 'owner', form: 6, masterId }),
      loadout(id === 'ember' ? 'tide' : 'ember', { id: 'partner', form: 6 })],
    [{ elementId: null, id: 'enemy', stats: { hp: 1000000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
    for (const member of state.bearers) member.hp -= 80;
    return { before: state, result: applyRadiantCombatAction(state, { type: 'normal', bearerId: 'owner', targetId: 'enemy' }) };
  }

  it.each(releasedRadiantIds)('%s has no squad-stat Passive: a Normal changes no stats and grants the N1 15 Luminosity', id => {
    const { before, result } = exercisePassive(id);
    expect(effectiveRadiantStats(before, 'owner').attack).toBe(before.bearers[0].stats.attack);
    expect(result.events.filter(event => 'source' in event && event.source.kind === 'passive')).toEqual([]);
    expect(result.events.find(event => event.type === 'charge' && !event.gearSource)).toMatchObject({ personal: 15 });
    validateRadiantCombat(result.state);
  });

  it.each(releasedRadiantIds.filter(id => !['ember', 'tide', 'sprout'].includes(id)))(
    '%s Master leaves its kit Passive unchanged and applies separate equipment effects', id => {
    const masterId = `master-${id}-1` as RadiantMasterId;
    const { result } = exercisePassive(id, masterId);
    expect(radiantBearerKits[id].passive).toEqual(radiantStarterKits[id].passive);
    expect(result.events.filter(event => 'source' in event && event.source.kind === 'passive')).toEqual([]);
    validateRadiantCombat(result.state);
  },
  );

  it('does not recursively fund generated strikes or retaliatory Burn with bonus motes', () => {
    for (const id of ['elise', 'caldrex'] as const) {
      const { result } = exercisePassive(id);
      expect(result.events.filter(event => event.type === 'damage').map(event => event.origin)).toEqual(['direct']);
      expect(result.events.filter(event => event.type === 'charge').map(event => event.bonusRolls)).toEqual([0]);
      expect(result.state.enemies[0].debuffs.filter(effect => effect.category === 'burn')).toEqual([]);
    }
  });

  it('no longer folds skill1/skill2 Imbues into the Leader (D-473 O3)', () => {
    const plain = exercisePassive('rosetta'), invested = structuredClone(plain.before);
    invested.bearers[0].loadout.ascension.skill1 = true;
    invested.bearers[0].loadout.ascension.skill2 = true;
    expect(radiantLeaderBonus(invested.bearers[0].loadout)).toBeCloseTo(radiantLeaderBonus(plain.before.bearers[0].loadout));
    expect(invested.bearers[0].stats).toEqual(plain.before.bearers[0].stats);
    const result = applyRadiantCombatAction(invested, { type: 'normal', bearerId: 'owner', targetId: 'enemy' });
    expect(result.events.filter(event => event.type === 'damage')).toHaveLength(1);
    const expose = result.state.enemies[0].debuffs.find(effect => effect.category === 'expose')!;
    expect(expose).toMatchObject({ source: { kind: 'leader', bearerId: 'owner' }, remaining: 1 });
    expect(expose.magnitude).toBeCloseTo(.12);
  });

  it('does not treat fully shielded Normals as HP damage for exposure, healing or generated packets', () => {
    for (const id of ['rosetta', 'crinso', 'elise', 'myrthen', 'velmira', 'kaelith'] as const) {
      const { before } = exercisePassive(id);
      before.enemies[0].shields.push({ id: before.nextShieldId++, source: { kind: 'enemy', enemyId: 'enemy' }, remaining: 10000 });
      const result = applyRadiantCombatAction(before, { type: 'normal', bearerId: 'owner', targetId: 'enemy' });
      expect(result.events.filter(event => 'source' in event && event.source.kind === 'passive')).toEqual([]);
      expect(result.events.filter(event => event.type === 'damage')).toHaveLength(1);
      expect(result.state.currencyEarned).toBe(0);
    }
  });

  it('uses the common 15-point Normal Luminosity rule for Nerithe until her Passive lands', () => {
    const state = createRadiantCombat([
      loadout('nerithe', { id: 'nerithe', masterId: 'master-nerithe-1' }),
    ], [{ elementId: null, id: 'enemy', stats: { hp: 1000, attack: 10, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'nerithe', targetId: 'enemy' });
    expect(result.state.gauge.members[0].charge).toBe(15);
    expect(state.gauge.members[0].charge).toBe(0);
  });

  it('lets Rosetta\'s Flare Expose its target for a later squad strike (Skill Power scales Expose)', () => {
    let state = charged(createRadiantCombat([
      loadout('rosetta', { id: 'rosetta' }), loadout('ember', { id: 'ember' }),
    ], [{ elementId: null, id: 'enemy', stats: { hp: 10000, attack: 10, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0), 'sparkling', 'rosetta');
    const marked = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'rosetta', targetId: 'enemy' });
    // Sparkling 70% x Attacker Skill Power 1.5 x 30% = 31.5% Expose for 3 turns.
    const expose = marked.state.enemies[0].debuffs.find(effect => effect.category === 'expose')!;
    expect(expose).toMatchObject({ source: { kind: 'flare', bearerId: 'rosetta' }, remaining: 3 });
    expect(expose.magnitude).toBeCloseTo(.315);
    state = nextRound(marked.state);
    const attack = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(attack.events.find(event => event.type === 'damage')).toMatchObject({
      offered: radiantDirectDamage(effectiveRadiantStats(state, 'ember').attack, 10, 1, 1 + expose.magnitude),
    });
    expect(state.enemies[0].debuffs.find(effect => effect.category === 'expose')!.remaining).toBe(2);
  });

  it('lets Disciple grant squad Attack Up that strengthens the next action', () => {
    const initial = createRadiantCombat([
      loadout('disciple', { id: 'disciple' }), loadout('ember', { id: 'ember' }),
    ], [{ elementId: null, id: 'enemy', stats: { hp: 10000, attack: 10, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
    const instructed = applyRadiantCombatAction(charged(initial, 'sparkling', 'disciple'),
      { type: 'flare', bearerId: 'disciple' });
    // Sparkling 70% x Support Skill Power 1.25 x 60% = 52.5% Attack Up.
    expect(instructed.state.bearers.every(member => member.buffs.some(effect =>
      effect.category === 'attack-up' && effect.source.kind === 'flare' && Math.abs(effect.magnitude - .525) < 1e-9))).toBe(true);
    const strike = applyRadiantCombatAction(instructed.state,
      { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(strike.events.find(event => event.type === 'damage')).toMatchObject({
      offered: radiantDirectDamage(effectiveRadiantStats(instructed.state, 'ember').attack, 10, 1),
    });
    expect(effectiveRadiantStats(instructed.state, 'ember').attack).toBeCloseTo(instructed.state.bearers[1].stats.attack * 1.525);
    expect(initial.bearers.every(member => member.buffs.length === 0)).toBe(true);
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
    let state = fixture(['ember'], 1, 1000);
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
    state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 100000, remaining: 1 });
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
    expect(blocked.gauge.members[0].charge).toBe(15);
    const generated = charged(createRadiantCombat([loadout('rosetta', { id: 'ally-0', masterId: 'master-rosetta-3' })],
      [{ elementId: null, id: 'enemy', stats: { hp: 100, attack: 1, defense: 0, recovery: 0 }, currencyBudget: 100 }], 0), 'sparkling');
    const result = applyRadiantCombatAction(generated, { type: 'flare', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.events.find(event => event.type === 'damage')).toMatchObject({ origin: 'direct' });
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
    expect(() => createRadiantCombat([loadout()], ['first', 'second'].map(id => ({ elementId: null,
      id, stats: { hp: 10, attack: 1, defense: 0, recovery: 0 }, currencyBudget: Number.MAX_SAFE_INTEGER,
    })), 0)).toThrow('total currency budget');
  });
});
