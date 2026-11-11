import { describe, expect, it } from 'vitest';
import {
  radiantAttunement, radiantAttunements, radiantBearerKits, radiantFlares, radiantMasters,
  radiantStarterKits, releasedRadiantIds, resolveRadiantStarterStats, validateRadiantLoadout,
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
import { readyFlare, sharedChargeThreshold } from './combat-gauge';

function loadout(starter: RadiantStarter = 'ember', overrides: Partial<RadiantLoadout> = {}): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 1, masterId: null,
    weaponRank: 0, ascension: { stats: false, skill1: false, skill2: false, lastFlare: false }, ...overrides };
}
function fixture(starters: RadiantStarter[] = ['ember'], form = 1, enemyHP = 10000): RadiantCombatState {
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
  it.each(['ember', 'tide', 'sprout'] as const)('resolves %s with fractional Defense and source Recovery', starter => {
    const stats = resolveRadiantStarterStats(loadout(starter, { level: 30 }));
    const base = radiantStarterKits[starter].base;
    expect(stats.hp).toBe(base.hp * 5.5);
    expect(stats.attack).toBe(base.attack * 5.5);
    expect(stats.recovery).toBe(base.recovery * 5.5);
    expect(stats.defense).toBeCloseTo(base.defense * 5.5 ** .7);
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
      expect(modified[stat]).toBeCloseTo(base[stat] * radiantAttunements[master.attunement][stat]);
    if (master.rule === 'standard' && master.enhancement === 'passive')
      expect(master.effect).toContain(radiantBearerKits[master.starter].passive.name);
    if (master.rule === 'standard' && master.enhancement === 'leader')
      expect(master.effect).toContain(radiantBearerKits[master.starter].leader);
    if (master.rule === 'standard' && master.enhancement === 'signature')
      expect(master.effect).toContain(radiantBearerKits[master.starter].signatureFamily);
    expect(['passive', 'leader', 'signature']).toContain(master.enhancement);
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
  it.each(releasedRadiantIds.flatMap(id => (['glowing', 'lustrous', 'eternal'] as const).map(tier => ({ id, tier }))))(
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
      expect(before.gauge.members[0].charge).toBe(before.gauge.members[0].baseCost * (tier === 'glowing' ? 1 : 2));
      const drops = result.events.filter(event => event.type === 'gauge-drop');
      expect(result.state.gauge.members[1].charge).toBe(drops.reduce((sum, event) => sum + event.amount, 0) / 10);
      expect(result.state.gauge.eternalCasts).toBe(tier === 'eternal' ? 1 : 0);
      if (tier === 'eternal') expect(result.state.gauge.sharedUnits).toBe(0);
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
  it.each(releasedRadiantIds)('%s has valid Glowing, Lustrous and Eternal family offers', id => {
    const offers = radiantFlares[id];
    expect(Object.keys(offers).sort()).toEqual(['eternal', 'glowing', 'lustrous']);
    expect(new Set(Object.values(offers).map(offer => offer.target)).size).toBe(1);
    for (const offer of Object.values(offers)) {
      expect(offer.name).toContain(radiantBearerKits[id].signatureFamily);
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
  it('preserves the original starter signatures while extending their canonical identities', () => {
    expect(radiantFlares.ember).toMatchObject({
      glowing: { name: 'Cinderwake', damage: 1.4, burn: .12, burnPhases: 2 },
      lustrous: { name: 'Cinderwake Ascendant', damage: 2, burn: .16, burnPhases: 2 },
      eternal: { name: 'Cinderwake Everlasting', damage: 3, burn: .2, burnPhases: 3 },
    });
    expect(radiantFlares.tide).toMatchObject({
      glowing: { name: 'Tideglass Shelter', shieldDefense: .9, shieldHP: .05 },
      lustrous: { name: 'Tideglass Dominion', shieldDefense: 1.3, shieldHP: .07, reduction: .15, reductionPhases: 1 },
      eternal: { name: 'Tideglass Eternity', shieldDefense: 1.8, shieldHP: .1, reduction: .25, reductionPhases: 2 },
    });
    expect(radiantFlares.sprout).toMatchObject({
      glowing: { name: 'Dawnseed Renewal', heal: .8, renewal: .15, renewalRounds: 2 },
      lustrous: { name: 'Dawnseed Flourishing', heal: 1.1, renewal: .2, renewalRounds: 2 },
      eternal: { name: 'Dawnseed Perennial', heal: 1.8, renewal: .3, renewalRounds: 3 },
    });
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

describe('saved enemy Gauge drops', () => {
  const squad = ['ember', 'tide', 'sprout', 'rosetta', 'thornia', 'crinso'] as const;
  it('gives the full Normal hit drop to its attacker and ten percent to every other member', () => {
    const state = fixture([...squad], 6);
    const before = structuredClone(state);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.events.filter(event => event.type === 'gauge-drop')).toEqual([
      { type: 'gauge-drop', enemyId: 'enemy', bearerId: 'ally-0', trigger: 'hit', amount: 25 },
    ]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([25, 2.5, 2.5, 2.5, 2.5, 2.5]);
    expect(result.state.gauge.sharedUnits).toBe(60);
    expect(result.state.chargeSeed).toBe(1013904223);
    expect(state).toEqual(before);
  });
  it('treats a fully absorbed direct hit as an enemy drop without awarding currency', () => {
    const state = fixture(['ember', 'tide'], 6);
    state.enemies[0].shields.push({ id: state.nextShieldId++, source: { kind: 'enemy', enemyId: 'enemy' }, remaining: 10000 });
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.state.enemies[0].hp).toBe(state.enemies[0].hp);
    expect(result.state.currencyEarned).toBe(0);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([25, 2.5]);
    expect(result.events.filter(event => event.type === 'gauge-drop')).toHaveLength(1);
  });
  it('awards a separate defeat drop without another bonus roll or extra currency', () => {
    const state = fixture([...squad], 6, 1);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.events.filter(event => event.type === 'gauge-drop')).toEqual([
      { type: 'gauge-drop', enemyId: 'enemy', bearerId: 'ally-0', trigger: 'hit', amount: 25 },
      { type: 'gauge-drop', enemyId: 'enemy', bearerId: 'ally-0', trigger: 'defeat', amount: 5 },
    ]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([30, 3, 3, 3, 3, 3]);
    expect(result.state.chargeSeed).toBe(1013904223);
    expect(result.state.currencyEarned).toBe(101);
  });
  it('drops on each Flare target while retaining the two-roll action cap', () => {
    const loadouts = squad.map((starter, index) => loadout(starter, { id: `ally-${index}`, form: 6 }));
    const enemies = Array.from({ length: 6 }, (_, index) => ({ id: `enemy-${index}`,
      stats: { hp: 10000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }));
    const state = charged(createRadiantCombat(loadouts, enemies, 0), 'lustrous');
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    const drops = result.events.filter(event => event.type === 'gauge-drop');
    expect(drops.map(drop => [drop.enemyId, drop.trigger, drop.amount])).toEqual([
      ['enemy-0', 'hit', 6], ['enemy-1', 'hit', 1], ['enemy-2', 'hit', 1],
      ['enemy-3', 'hit', 1], ['enemy-4', 'hit', 1], ['enemy-5', 'hit', 1],
    ]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([11, 1.1, 1.1, 1.1, 1.1, 1.1]);
    expect(result.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 2, bonusOffered: 5 });
    expect(result.state.chargeSeed).toBe(1196435762);
  });
  it('credits a generated finishing strike once, without granting a direct-hit drop or consuming RNG', () => {
    const state = createRadiantCombat([
      loadout('tide', { id: 'ally-0', form: 6, masterId: 'master-tide-3' }),
      loadout('ember', { id: 'ally-1', form: 6 }),
    ], [{ id: 'enemy', stats: { hp: 1, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
    const result = applyRadiantCombatAction(charged(state, 'glowing'), {
      type: 'flare', bearerId: 'ally-0', targetId: 'enemy',
    });
    expect(result.events.filter(event => event.type === 'damage')).toMatchObject([{ origin: 'generated' }]);
    expect(result.events.filter(event => event.type === 'gauge-drop')).toEqual([
      { type: 'gauge-drop', enemyId: 'enemy', bearerId: 'ally-0', trigger: 'defeat', amount: 5 },
    ]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([5, .5]);
    expect(result.state.chargeSeed).toBe(0);
  });
  it('shares a defeated owner’s periodic finishing drop only with surviving teammates', () => {
    const state = fixture(['ember', 'tide', 'sprout'], 6, 1);
    state.bearers[0].hp = 0; state.gauge.members[0].living = false;
    state.phase = 'enemy'; state.acted = ['ally-1', 'ally-2']; state.enemyActed = ['enemy'];
    state.enemies[0].burns.push({ source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 1, remaining: 1 });
    const result = applyRadiantCombatAction(state, { type: 'finish-enemy-phase' });
    expect(result.events.filter(event => event.type === 'gauge-drop')).toEqual([
      { type: 'gauge-drop', enemyId: 'enemy', bearerId: 'ally-0', trigger: 'defeat', amount: 5 },
    ]);
    expect(result.state.gauge.members.map(member => member.charge)).toEqual([0, .5, .5]);
    expect(result.state.chargeSeed).toBe(0);
    expect(result.state.phase).toBe('victory');
  });
});

describe('six-member action rounds, fixed leader and state isolation', () => {
  it('accepts a frozen six-distinct owned-bearer party and never promotes a dead first leader', () => {
    const ids = ['ember', 'rosetta', 'tide', 'sprout', 'bliss', 'ozriel'] as const;
    const loadouts = ids.map((starter, index) => loadout(starter, {
      id: `owned-instance-${index}`, level: 30, form: 2,
    }));
    expect(() => validateRadiantParty(loadouts)).not.toThrow();
    const state = createRadiantCombat(loadouts,
      [{ id: 'enemy', stats: { hp: 10000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 101 }], 0);
    const before = effectiveRadiantStats(state, loadouts[1].id).attack;
    state.gauge.members[1].charge = state.gauge.members[1].baseCost;
    expect(readyFlare(state.gauge, loadouts[1].id)).toBe('glowing');
    state.bearers[0].hp = 0;
    state.gauge.members[0].living = false;
    validateRadiantCombat(state);
    expect(effectiveRadiantStats(state, loadouts[1].id).attack).toBeCloseTo(before / 1.15);
    expect(readyFlare(state.gauge, loadouts[1].id)).toBe('glowing');
    expect(state.gauge.members.slice(2).every(member => readyFlare(state.gauge, member.id) === null)).toBe(true);
    expect(() => validateRadiantParty([loadouts[0], { ...loadouts[1], starter: 'ember' }])).toThrow('distinct');
    const input = structuredClone(state);
    const resolved = applyRadiantCombatAction(state, { type: 'normal', bearerId: loadouts[1].id, targetId: 'enemy' });
    expect(state).toEqual(input);
    expect(resolved.state.bearers[0].hp).toBe(0);
  });
  it.each([1, 2, 3, 4, 5, 6])('requires each of %i members to act once and preserves normalized round charge', size => {
    let state = fixture(Array.from({ length: size }, () => 'ember'), 6);
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
    let state = fixture(['ember', 'tide', 'sprout', 'tide', 'sprout', 'ember']);
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
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(state).toEqual(before);
    expect(state.bearers[0].loadout.masterId).toBeNull();
    result.state.bearers[0].loadout.level = 99;
    expect(state.bearers[0].loadout.level).toBe(0);
    const shieldResult = applyRadiantCombatAction(charged(fixture(['tide']), 'glowing'),
      { type: 'flare', bearerId: 'ally-0' });
    const shieldEvent = shieldResult.events.find(event => event.type === 'shield')!;
    if ('bearerId' in shieldEvent.source) shieldEvent.source.bearerId = 'presentation-only';
    expect(shieldResult.state.bearers[0].shields[0].source).toEqual({ kind: 'flare', bearerId: 'ally-0' });
  });
  it('rejects duplicate/oversized squads, forged frozen stats and inconsistent gauges', () => {
    expect(() => fixture(Array.from({ length: 7 }, () => 'sprout'))).toThrow('roster');
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
    let state = charged(fixture(['tide', 'sprout', 'ember', 'tide', 'sprout', 'ember'], 6), 'glowing');
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
    const state = apply(fixture(['ember', 'sprout']), { type: 'defense', bearerId: 'ally-0' });
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
    let state = fixture(['ember'], 1, 1);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.state.phase).toBe('victory');
    expect(result.events.filter(event => event.type === 'defeated')).toHaveLength(1);
    expect(result.state.gauge.members[0].charge).toBe(30);
    expect(() => apply(result.state, { type: 'finish-enemy-phase' })).toThrow('finished');
    state = passPlayers(fixture());
    state = apply(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-0'], coefficient: 1000 });
    expect(state.phase).toBe('defeat');
    expect(() => apply(state, { type: 'finish-enemy-phase' })).toThrow('finished');
  });
});

describe('progressive signatures and layered shared readiness', () => {
  it.each(['ember', 'tide', 'sprout'] as const)('keeps %s signature targets and increases offers across all tiers', starter => {
    const records = (['glowing', 'lustrous', 'eternal'] as const).map(tier => {
      const state = charged(fixture([starter, 'ember'], 6), tier);
      state.bearers.forEach(member => { member.hp -= 100; });
      const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
      expect(result.events.find(event => event.type === 'flare')).toMatchObject({ tier });
      if (starter === 'ember') {
        const damage = result.events.find(event => event.type === 'damage');
        expect(damage).toMatchObject({ targetId: 'enemy', origin: 'direct' });
        return damage?.type === 'damage' ? damage.offered : 0;
      }
      const events = result.events.filter(event => event.type === (starter === 'tide' ? 'shield' : 'heal'));
      expect(events.map(event => 'targetId' in event ? event.targetId : '')).toEqual(['ally-0', 'ally-1']);
      const first = events[0];
      return first.type === 'shield' ? first.amount : first.type === 'heal' ? first.offered : 0;
    });
    expect(records[1]).toBeGreaterThan(records[0]);
    expect(records[2]).toBeGreaterThan(records[1]);
  });
  it('retains partial charge, chooses highest ready automatically and isolates one Eternal shared spend', () => {
    let state = fixture(['tide', 'sprout', 'ember'], 6);
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
    let state = charged(fixture(['tide'], 5), 'lustrous');
    state = apply(state, { type: 'flare', bearerId: 'ally-0' });
    state = nextRound(state);
    expect(state.gauge.sharedUnits).toBe(0);
    expect(Object.keys(state)).not.toEqual(expect.arrayContaining(['mode', 'timer', 'recovery']));
    expect(state.phase).toBe('player');
    expect(state.acted).toEqual([]);
  });
  it('bounds AoE charge rolls to two including at full charge and leaves support/generated actions roll-free', () => {
    const loadouts = [loadout('ember', { id: 'ally-0', form: 6 })];
    const enemies = Array.from({ length: 6 }, (_, i) => ({ id: `enemy-${i}`,
      stats: { hp: 10000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }));
    const state = charged(createRadiantCombat(loadouts, enemies, 0), 'eternal');
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'damage')).toHaveLength(6);
    expect(result.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 2 });
    expect(result.state.chargeSeed).toBe(1196435762);
    const support = charged(createRadiantCombat([loadout('disciple', { id: 'disciple', masterId: 'master-disciple-3', form: 6 })],
      enemies, 0), 'lustrous', 'disciple');
    const supportResult = applyRadiantCombatAction(support, { type: 'flare', bearerId: 'disciple' });
    expect(supportResult.events.some(event => event.type === 'damage')).toBe(false);
    expect(supportResult.events.find(event => event.type === 'status' && event.status === 'attack-buff')).toBeDefined();
    expect(supportResult.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 0, bonusOffered: 0 });
    expect(supportResult.state.chargeSeed).toBe(0);
    expect(supportResult.state.gauge.members[0].charge).toBe(0);
  });
  it('consumes no direct-hit charge rolls when old Eternal Burn kills before the primary strike', () => {
    const state = charged(fixture(['ember'], 6, 100), 'eternal');
    state.enemies[0].burns.push({ source: { kind: 'flare', bearerId: 'ally-0' }, magnitude: 1000, remaining: 1 });
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'damage')).toEqual([
      expect.objectContaining({ origin: 'periodic' }),
    ]);
    expect(result.events.find(event => event.type === 'charge')).toMatchObject({ bonusRolls: 0 });
    expect(result.state.gauge.sharedUnits).toBe(0);
    expect(result.state.gauge.members[0].charge).toBe(5);
    expect(result.state.chargeSeed).toBe(0);
    expect(result.state.currencyEarned).toBe(101);
  });
});

describe('Infernis sourced Burn signature', () => {
  it('applies a snapshot, detonates only old same-owner Burn and rolls only primary surviving direct hits', () => {
    let state = charged(fixture(['ember', 'ember'], 6), 'glowing');
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
    expect(result.state.gauge.members[0].charge).toBe(15);
    expect(result.state.currencyEarned).toBe(101);
  });
});

describe('Tizu unlimited source Shields and actual absorption passive', () => {
  it('adds repeat native layers indefinitely until broken with stable source and no expiry/cap', () => {
    let state = charged(fixture(['tide']), 'glowing');
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
    let state = charged(fixture(['tide', 'sprout']), 'glowing');
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
    let state = charged(createRadiantCombat([loadout('tide', { id: 'ally-0', form: 6 }),
      loadout('sprout', { id: 'ally-1', form: 6 })], enemies, 0), 'glowing');
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
    const state = fixture(['tide', 'tide']);
    sourceShield(state, 1, { kind: 'flare', bearerId: 'ally-0' }, 1);
    sourceShield(state, 1, { kind: 'flare', bearerId: 'ally-1' }, 100);
    const phase = passPlayers(state);
    const mixed = apply(phase, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ally-1'], coefficient: 1 });
    expect(mixed.tideReturns).toEqual([]);
    const partial = passPlayers(fixture(['tide', 'sprout']));
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
    const state = fixture(['tide']);
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
    const state = fixture(['tide']);
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
    const state = charged(fixture(['sprout', 'ember']), 'glowing');
    state.bearers[1].hp = 0;
    state.gauge.members[1].living = false;
    const result = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ally-0' });
    expect(result.events.filter(event => event.type === 'heal')).toEqual([
      expect.objectContaining({ targetId: 'ally-0', effective: 0, offered: Math.round(65 * 1.15 * .8) }),
    ]);
    expect(result.state.bearers[1].hp).toBe(0);
    expect(result.state.gauge.members[0].charge).toBe(0);
    expect(result.state.chargeSeed).toBe(0);
    const injured = charged(fixture(['sprout']), 'glowing');
    injured.bearers[0].hp = 1;
    expect(apply(injured, { type: 'flare', bearerId: 'ally-0' }).bearers[0].hp).toBe(1 + Math.round(65 * 1.15 * .8));
  });
  it('uses caster Recovery, not recipient Recovery, and preserves Renewal after leader death', () => {
    let state = charged(fixture(['sprout', 'ember', 'tide']), 'glowing');
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
    let state = fixture(['sprout', 'ember', 'tide']);
    state.bearers.forEach(member => { member.hp = Math.round(member.stats.hp) / 2; });
    state = apply(state, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' });
    expect(state.bearers.map(member => member.seeds.length)).toEqual([1, 0, 0]);
    const snapshot = state.bearers[0].seeds[0].magnitude;
    const after = nextRound(state);
    expect(after.bearers[0].hp).toBe(110 + Math.round(snapshot));
    expect(after.bearers[0].seeds).toEqual([]);
    const blocked = fixture(['sprout']);
    blocked.bearers[0].hp = 1;
    blocked.enemies[0].shields.push({ id: blocked.nextShieldId++, source: { kind: 'enemy', enemyId: 'enemy' }, remaining: 10000 });
    expect(apply(blocked, { type: 'normal', bearerId: 'ally-0', targetId: 'enemy' }).bearers[0].seeds).toEqual([]);
  });
  it('refreshes same-source Renewal without weakening its snapshot, preserves distinct casters, cleanses only strongest Weaken', () => {
    let state = charged(fixture(['sprout', 'sprout'], 6), 'lustrous');
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
    const state = createRadiantCombat([loadout(master.starter, { id: 'ally-0', masterId, form: 6 })],
      [{ id: 'enemy', stats: { hp: 10000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
    if (master.enhancement === 'leader') {
      const base = radiantBearerKits[master.starter];
      expect(effectiveRadiantStats(state, 'ally-0')[base.leaderStat]).toBeCloseTo(
        state.bearers[0].stats[base.leaderStat] * (1 + base.leaderBonus + master.magnitude));
      return;
    }
    const offer = radiantFlares[master.starter].glowing;
    const charge = charged(state, 'glowing');
    const action = offer.target === 'one-enemy' || master.rule === 'tide-strike' || master.rule === 'sprout-strike'
      ? { type: 'flare', bearerId: 'ally-0', targetId: 'enemy' } as const
      : { type: 'flare', bearerId: 'ally-0' } as const;
    const result = applyRadiantCombatAction(charge, action);
    if (master.enhancement === 'signature') {
      if (offer.damage > 0 && master.rule !== 'self-shield') {
        expect(result.events.find(event => event.type === 'damage')).toMatchObject({
          offered: radiantDirectDamage(effectiveRadiantStats(state, 'ally-0').attack, 10, offer.damage * 1.15),
        });
      } else if (offer.shieldHP > 0 || offer.shieldDefense > 0) {
        expect(result.events.find(event => event.type === 'shield')).toBeDefined();
      } else if (offer.heal > 0) {
        expect(result.events.find(event => event.type === 'heal')).toBeDefined();
      }
    } else if (master.rule === 'standard') {
      expect(master.effect).toContain(radiantBearerKits[master.starter].passive.name);
      expect(result.events.some(event => event.type === 'flare')).toBe(true);
    }
  });
  it('retains the nine specific starter Master payoffs rather than replacing them with generic boosts', () => {
    for (const id of ['master-ember-1', 'master-ember-2', 'master-ember-3', 'master-tide-1',
      'master-tide-2', 'master-tide-3', 'master-sprout-1', 'master-sprout-2', 'master-sprout-3'] as const) {
      const master = radiantMasters[id];
      const state = createRadiantCombat([loadout(master.starter, { id: 'ally-0', masterId: id, form: 6 })],
        [{ id: 'enemy', stats: { hp: 10000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
      state.bearers[0].hp -= 100;
      const selected = master.rule === 'tide-strike' || master.rule === 'sprout-strike';
      const result = applyRadiantCombatAction(charged(state, 'glowing'), selected
        ? { type: 'flare', bearerId: 'ally-0', targetId: 'enemy' }
        : { type: 'flare', bearerId: 'ally-0' });
      const stats = effectiveRadiantStats(state, 'ally-0');
      if (master.rule === 'longer-burn') expect(result.state.enemies[0].burns[0].remaining).toBe(3);
      if (master.rule === 'flare-damage') expect(result.events.find(event => event.type === 'damage'))
        .toMatchObject({ offered: radiantDirectDamage(stats.attack, 10, 1.4 * 1.15) });
      if (master.rule === 'self-shield') expect(result.events.find(event => event.type === 'shield'))
        .toMatchObject({ source: { kind: 'master', bearerId: 'ally-0' }, amount: Math.round(.08 * state.bearers[0].stats.hp) });
      if (master.rule === 'flare-shield' || master.rule === 'deep-shield') {
        const hpFraction = master.rule === 'deep-shield' ? .13 : .05;
        const multiplier = master.rule === 'flare-shield' ? 1.15 : 1;
        expect(result.events.find(event => event.type === 'shield')).toMatchObject({
          amount: Math.round((.9 * stats.defense + hpFraction * state.bearers[0].stats.hp) * multiplier),
        });
      }
      if (selected) {
        const damage = result.events.filter(event => event.type === 'damage');
        expect(damage).toHaveLength(1);
        expect(damage[0]).toMatchObject({ origin: 'generated', source: { kind: 'master', bearerId: 'ally-0' },
          offered: radiantDirectDamage(stats.attack, 10, master.rule === 'tide-strike' ? .9 : .75) });
        expect(result.events.filter(event => event.type === 'charge').every(event => event.bonusRolls === 0)).toBe(true);
        const unchanged = structuredClone(state);
        expect(() => apply(charged(state, 'glowing'), { type: 'flare', bearerId: 'ally-0' })).toThrow('selected');
        expect(state).toEqual(unchanged);
      }
      if (master.rule === 'flare-heal') expect(result.events.find(event => event.type === 'heal'))
        .toMatchObject({ offered: Math.round(.8 * stats.recovery * 1.15) });
      if (master.rule === 'longer-renewal') expect(result.state.bearers[0].renewal[0].remaining).toBe(3);
    }
  });
  it('requires explicit valid target confirmation for one-enemy signatures before any spend or seed advance', () => {
    const state = charged(createRadiantCombat([loadout('rosetta', { id: 'ally-0', masterId: 'master-rosetta-3' })],
      [{ id: 'enemy', stats: { hp: 100, attack: 1, defense: 0, recovery: 0 }, currencyBudget: 100 }], 0), 'glowing');
    const before = structuredClone(state);
    expect(() => apply(state, { type: 'flare', bearerId: 'ally-0' })).toThrow('selected living enemy');
    expect(() => apply(state, { type: 'flare', bearerId: 'ally-0', targetId: 'missing' })).toThrow('Unknown');
    expect(state).toEqual(before);
    expect(() => apply(charged(fixture(['sprout']), 'glowing'), { type: 'flare', bearerId: 'ally-0', targetId: 'enemy' }))
      .toThrow('authored target set');
  });
});

describe('distinct bearer signature interactions', () => {
  function exercisePassive(id: RadiantBearerId, masterId: RadiantMasterId | null = null) {
    let state = createRadiantCombat([loadout(id, { id: 'owner', form: 6, masterId }),
      loadout(id === 'ember' ? 'tide' : 'ember', { id: 'partner', form: 6 })],
    [{ id: 'enemy', stats: { hp: 10000, attack: 20, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
    for (const member of state.bearers) member.hp -= 80;
    const rule = radiantBearerKits[id].passive.rule;
    const source: RadiantSource = { kind: 'flare', bearerId: 'owner' };
    if (['banked-cinder', 'burning-strike', 'burning-heal'].includes(rule))
      state.enemies[0].burns.push({ source, magnitude: 1, remaining: 2 });
    if (['exposed-strike', 'exposed-charge'].includes(rule))
      state.enemies[0].exposures.push({ source, magnitude: .1, remaining: 2 });
    if (rule === 'weakened-expose') state.enemies[0].weaken.push({ source, magnitude: .1, remaining: 2 });
    if (rule === 'flare-cleanse' || rule === 'guard-cleanse') {
      weaken(state, 0, .1);
      weaken(state, 1, .3);
    }
    if (rule === 'late-heal')
      state = apply(state, { type: 'defense', bearerId: 'partner' });
    if (['tide-return', 'hurt-bulwark', 'absorbed-heal', 'hurt-shelter', 'absorbed-burn', 'wounded-refusal'].includes(rule)) {
      if (rule === 'tide-return')
        state = apply(charged(state, 'glowing', 'owner'), { type: 'flare', bearerId: 'owner' });
      else if (rule === 'absorbed-heal' || rule === 'absorbed-burn') sourceShield(state, 0, source, 100);
      if (rule === 'wounded-refusal') state.bearers[0].hp = Math.floor(state.bearers[0].stats.hp / 2) - 1;
      state = passPlayers(state);
      return { before: state, result: applyRadiantCombatAction(state,
        { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['owner'], coefficient: .1 }) };
    }
    const guard = ['guard-shelter', 'guard-focus', 'guard-weaken', 'guard-cleanse',
      'guard-foundation', 'guard-stillness', 'guard-convoy'].includes(rule);
    const flare = ['flare-cleanse', 'heal-charge', 'heal-shelter'].includes(rule);
    if (flare) state = charged(state, 'glowing', 'owner');
    const action: RadiantCombatAction = guard ? { type: 'defense', bearerId: 'owner' }
      : flare ? { type: 'flare', bearerId: 'owner' }
        : { type: 'normal', bearerId: 'owner', targetId: 'enemy' };
    return { before: state, result: applyRadiantCombatAction(state, action) };
  }

  it.each(releasedRadiantIds)('%s has an executed passive payoff, not an unwired native tooltip', id => {
    const { before, result } = exercisePassive(id);
    const rule = radiantBearerKits[id].passive.rule;
    expect(result.state).not.toBe(before);
    const sourceEvents = result.events.filter(event => 'source' in event && event.source.kind === 'passive' &&
      'bearerId' in event.source && event.source.bearerId === 'owner');
    if (['charted-charge', 'exposed-charge', 'heal-charge', 'tide-return'].includes(rule)) {
      const offers = result.events.filter(event => event.type === 'charge').filter(event => event.bearerId === 'owner');
      expect(offers.length).toBeGreaterThanOrEqual(2);
      if (rule === 'tide-return') expect(offers[1].personal).toBe(offers[0].personal + 8);
      else expect(offers[0].personal).toBeGreaterThan(0);
    } else if (rule === 'flare-cleanse' || rule === 'guard-cleanse') {
      expect(result.events.some(event => event.type === 'status' && event.status === 'weaken-removed')).toBe(true);
    } else {
      expect(sourceEvents.length, `${id}: ${rule}`).toBeGreaterThan(0);
    }
    if (rule === 'long-seed') expect(result.state.bearers[1].seeds[0].remaining).toBe(2);
    if (rule === 'guard-weaken') expect(result.state.enemies[0].weaken[0].remaining).toBe(1);
    if (['hurt-bulwark', 'absorbed-heal', 'hurt-shelter', 'absorbed-burn', 'wounded-refusal'].includes(rule))
      expect(result.state.passiveTriggered).toEqual(['owner']);
    validateRadiantCombat(result.state);
  });

  it.each(releasedRadiantIds.filter(id => !['ember', 'tide', 'sprout'].includes(id)))(
    '%s first Master amplifies its actual passive without changing its trigger', id => {
      const masterId = `master-${id}-1` as RadiantMasterId;
      const { before, result } = exercisePassive(id, masterId);
      const rule = radiantBearerKits[id].passive.rule;
      const master = radiantMasters[masterId];
      expect(master.enhancement).toBe('passive');
      if (rule === 'flare-cleanse' || rule === 'guard-cleanse') {
        expect(result.events.some(event => event.type === 'heal' && event.source.kind === 'master' && event.effective > 0))
          .toBe(true);
      } else {
        const sourceEvent = result.events.find(event => 'source' in event && event.source.kind === 'passive' &&
          'bearerId' in event.source && event.source.bearerId === 'owner');
        if (['charted-charge', 'exposed-charge', 'heal-charge'].includes(rule)) {
          const drops = result.events.reduce((sum, event) =>
            sum + (event.type === 'gauge-drop' && event.bearerId === 'owner' ? event.amount : 0), 0);
          expect(result.events.filter(event => event.type === 'charge').find(event => event.bearerId === 'owner')?.personal)
            .toBe(drops + Math.round(radiantBearerKits[id].passive.magnitude * 1.15));
        } else {
          expect(sourceEvent).toBeDefined();
          const stats = effectiveRadiantStats(before, 'owner');
          const magnitude = radiantBearerKits[id].passive.magnitude * 1.15;
          if (sourceEvent?.type === 'shield') {
            const stat = ['guard-shelter', 'hurt-bulwark', 'guard-foundation', 'next-ally-shield'].includes(rule)
              ? stats.defense : ['guard-convoy', 'heal-shelter'].includes(rule) ? stats.recovery : before.bearers[0].stats.hp;
            expect(sourceEvent.amount).toBe(Math.round(magnitude * stat));
          } else if (sourceEvent?.type === 'heal') {
            expect(sourceEvent.snapshot).toBeCloseTo(magnitude * stats.recovery);
            expect(sourceEvent.offered).toBe(Math.round(magnitude * stats.recovery));
          } else if (sourceEvent?.type === 'damage') {
            expect(sourceEvent.offered).toBe(Math.max(1, Math.round(magnitude * stats.attack)));
            expect(sourceEvent.origin).toBe('generated');
          } else if (sourceEvent?.type === 'status') {
            const stat = ['normal-burn', 'absorbed-burn'].includes(rule) ? stats.attack
              : ['long-seed', 'normal-renewal'].includes(rule) ? stats.recovery : 1;
            expect(sourceEvent.magnitude).toBeCloseTo(magnitude * stat);
          }
        }
      }
    },
  );

  it('does not recursively fund generated strikes or retaliatory Burn with bonus motes', () => {
    const { result } = exercisePassive('elise');
    expect(result.events.filter(event => event.type === 'damage').map(event => event.origin)).toEqual(['direct', 'generated']);
    expect(result.events.filter(event => event.type === 'charge').map(event => event.bonusRolls)).toEqual([1]);
    const retaliation = exercisePassive('caldrex');
    expect(retaliation.result.events.filter(event => event.type === 'charge').map(event => event.bonusRolls)).toEqual([0]);
    expect(retaliation.result.state.enemies[0].burns[0].source).toEqual({ kind: 'passive', bearerId: 'owner' });
    const duplicate = structuredClone(retaliation.before);
    duplicate.passiveTriggered.push('owner');
    const bounded = applyRadiantCombatAction(duplicate, { type: 'enemy-attack', enemyId: 'enemy',
      targetIds: ['owner'], coefficient: .1 });
    expect(bounded.state.enemies[0].burns).toEqual([]);
  });

  it('folds saved skill1 and skill2 Imbues into passive magnitude and leader potency without a fifth stat', () => {
    const plain = exercisePassive('rosetta');
    const invested = structuredClone(plain.before);
    invested.bearers[0].loadout.ascension.skill1 = true;
    invested.bearers[0].loadout.ascension.skill2 = true;
    const result = applyRadiantCombatAction(invested, { type: 'normal', bearerId: 'owner', targetId: 'enemy' });
    expect(result.state.enemies[0].exposures[0].magnitude).toBeCloseTo(.08 * 1.5);
    expect(effectiveRadiantStats(invested, 'owner').attack).toBeCloseTo(
      invested.bearers[0].stats.attack * (1 + radiantBearerKits.rosetta.leaderBonus * 1.5));
    expect(invested.bearers[0].stats).toEqual(plain.before.bearers[0].stats);
    const cleanser = exercisePassive('ilyss');
    const investedCleanse = structuredClone(cleanser.before);
    investedCleanse.bearers[0].loadout.ascension.skill1 = true;
    const clean = applyRadiantCombatAction(investedCleanse, { type: 'defense', bearerId: 'owner' });
    expect(clean.events.find(event => event.type === 'heal')).toMatchObject({
      source: { kind: 'passive', bearerId: 'owner' },
      offered: Math.round(.5 * effectiveRadiantStats(investedCleanse, 'owner').recovery),
    });
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

  it('keeps Nerithe’s Normal-only five-point Surveyor bonus inside the existing personal Gauge', () => {
    const state = createRadiantCombat([
      loadout('nerithe', { id: 'nerithe', masterId: 'master-nerithe-1' }),
    ], [{ id: 'enemy', stats: { hp: 1000, attack: 10, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
    const result = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'nerithe', targetId: 'enemy' });
    expect(result.state.gauge.members[0].charge).toBe(31);
    expect(result.state).not.toHaveProperty('personalMode');
    expect(result.state).not.toHaveProperty('passiveTimer');
    expect(state.gauge.members[0].charge).toBe(0);
  });
  it('lets Rosetta establish a source-owned Quarry that empowers a later squad strike', () => {
    let state = charged(createRadiantCombat([
      loadout('rosetta', { id: 'rosetta' }), loadout('ember', { id: 'ember' }),
    ], [{ id: 'enemy', stats: { hp: 10000, attack: 10, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0), 'glowing', 'rosetta');
    const marked = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'rosetta', targetId: 'enemy' });
    expect(marked.state.enemies[0].exposures).toMatchObject([
      { source: { kind: 'flare', bearerId: 'rosetta' }, magnitude: .18, remaining: 2 },
    ]);
    state = nextRound(marked.state);
    const attack = applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(attack.events.find(event => event.type === 'damage')).toMatchObject({
      offered: radiantDirectDamage(effectiveRadiantStats(state, 'ember').attack, 10, 1, 1.18),
    });
    expect(marked.state.enemies[0].exposures[0].remaining).toBe(2);
  });
  it('lets Disciple grant a bounded squad attack instruction that strengthens the next action', () => {
    const initial = createRadiantCombat([
      loadout('disciple', { id: 'disciple' }), loadout('ember', { id: 'ember' }),
    ], [{ id: 'enemy', stats: { hp: 10000, attack: 10, defense: 10, recovery: 0 }, currencyBudget: 100 }], 0);
    const instructed = applyRadiantCombatAction(charged(initial, 'glowing', 'disciple'),
      { type: 'flare', bearerId: 'disciple' });
    expect(instructed.state.bearers.every(member =>
      member.attackBuffs.some(effect => effect.source.kind === 'flare' && effect.magnitude === .22))).toBe(true);
    const strike = applyRadiantCombatAction(instructed.state,
      { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(strike.events.find(event => event.type === 'damage')).toMatchObject({
      offered: radiantDirectDamage(effectiveRadiantStats(instructed.state, 'ember').attack, 10, 1),
    });
    expect(initial.bearers.every(member => member.attackBuffs.length === 0)).toBe(true);
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
    const generated = charged(createRadiantCombat([loadout('rosetta', { id: 'ally-0', masterId: 'master-rosetta-3' })],
      [{ id: 'enemy', stats: { hp: 100, attack: 1, defense: 0, recovery: 0 }, currencyBudget: 100 }], 0), 'glowing');
    const result = applyRadiantCombatAction(generated, { type: 'flare', bearerId: 'ally-0', targetId: 'enemy' });
    expect(result.events.find(event => event.type === 'damage')).toMatchObject({ origin: 'direct' });
    expect(result.state.currencyEarned).toBeGreaterThan(0);
    expect(result.state.chargeSeed).toBe(1013904223);
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
