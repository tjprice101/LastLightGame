import { describe, expect, it } from 'vitest';
import {
  radiantFlarePower, radiantKitSkill, radiantMasters, radiantSignatureCap, type RadiantBearerId, type RadiantLoadout, type RadiantMasterId,
} from '../content/combat-kits';
import { radiantMasterClauseKinds } from '../content/conduit-effects';
import { radiantConduitDescription } from '../content/conduit-effect-text';
import { radiantFlareTierScale } from '../content/radiant-kits';
import {
  applyRadiantCombatAction, createRadiantCombat, effectiveRadiantStats, radiantPendingActors, radiantSkillStats,
  validateRadiantCombat, type RadiantCombatEvent, type RadiantCombatState,
} from './combat-engine';
import { chooseRadiantPressureAction } from './enemy-pressure';
import { emptyAccount, saveAccount, type Account } from './account';
import { LocalRadiantTransport } from '../online/battle-local';
import {
  applyRadiantTurn, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantRunOperation, type RadiantRunRequest, type RadiantTurnAction,
} from '../online/battle-run';

/** The approved B5b clause primitives per Master (the B5a stat package sits beside them). */
const clauses: Record<string, string> = {
  'master-ember-2': 'dawnfire-focus 1.25', 'master-tide-3': 'tide-shield-pierce .25', 'master-sprout-2': 'briar-seeds .45',
  'master-bliss-1': 'flourish-both 1', 'master-bruno-2': 'worldwall-shield 3.75, cover-gain .25',
  'master-bruno-3': 'hammerfall-sunder .25, cover-attack .25', 'master-disciple-1': 'attack-up-duration 2',
  'master-elise-1': 'shuriken-sunder .15', 'master-nerithe-1': 'survey-pierce .1', 'master-orvella-1': 'citadel-carry .4',
  'master-orvella-3': 'foundation-guard .25, keystone-power .5', 'master-vaelor-2': 'rise-cascade .2',
  'master-caldrex-1': 'signature-cap 2, counter-defense .12', 'master-solenne-1': 'stillness-reduction .35',
  'master-myrthen-1': 'harvest-bloom .75', 'master-neralis-1': 'signature-cap 1, carry-current .09',
  'master-varkhel-1': 'signature-cap 1, counter-defense .1', 'master-varkhel-3': 'strain-pierce .35, strain-charge 15',
  'master-seravelle-1': 'signature-cap 1, move-as-one .4', 'master-velmira-1': 'signature-cap 1, first-skill-crosscut 1',
  'master-velmira-2': 'seam-weakened .35, edge-pierce .35', 'master-ozriel-2': 'pane-weaken .25', 'master-ozriel-3': 'refusal-restore 1',
  'master-ilvaris-1': 'verse-marks 2', 'master-ilvaris-2': 'hymn-charge 8', 'master-ilvaris-3': 'tomorrow-marks 3',
  'master-kaelith-1': 'meridian-pierce .4', 'master-kaelith-2': 'shatterfall-incision 1', 'master-kaelith-3': 'denial-incisions 3',
  'master-maerion-1': 'unreturned-cap .85', 'master-caevren-1': 'signature-cap 2, counter-defense .1', 'master-caevren-2': 'covenant .55',
  'master-vespera-1': 'beacon-signal .5', 'master-vespera-2': 'burn-power .3, signal-pierce .15',
  'master-ilyss-1': 'signature-cap 1, resurrection-heal .13', 'master-asteriel-1': 'signature-cap 1, promise-power .05',
  'master-serapha-1': 'signature-cap 1, interval-heal .05',
};
const parse = (text: string) => text.split(', ').map(part => { const [kind, amount] = part.split(' '); return [kind, Number(amount)]; });
// B5c kinds (listed after 'interval-heal') are checked in their own suite.
const b5bKinds = radiantMasterClauseKinds.slice(0, radiantMasterClauseKinds.indexOf('interval-heal') + 1) as readonly string[];
const clauseKind = (id: string, kind: string) => b5bKinds.includes(kind) ||
  (id === 'master-vespera-2' && kind === 'burn-power');

function member(starter: RadiantBearerId, masterId: RadiantMasterId | null = null): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId, ascension: {}, gear: Array(8).fill(null) };
}
function fixture(squad: [RadiantBearerId, RadiantMasterId?][]): RadiantCombatState {
  return createRadiantCombat(squad.map(([starter, masterId]) => member(starter, masterId ?? null)),
    ['enemy', 'enemy2'].map(id => ({ id, elementId: null, stats: { hp: 1000000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })),
    0, false);
}
function charge(state: RadiantCombatState, id: string, amount = 100): RadiantCombatState {
  state.gauge.members.find(entry => entry.id === id)!.charge = amount;
  return state;
}
function bearerOf(state: RadiantCombatState, id: string) { return state.bearers.find(entry => entry.loadout.id === id)!; }
function enemyOf(state: RadiantCombatState, id: string) { return state.enemies.find(entry => entry.id === id)!; }
function dealt(events: RadiantCombatEvent[], bearerId: string, targetId?: string): number {
  return events.reduce((sum, event) => event.type === 'damage' && event.source.kind !== 'enemy' && event.source.bearerId === bearerId &&
    event.origin === 'direct' && (targetId === undefined || event.targetId === targetId) ? sum + event.healthLoss + event.absorbed : sum, 0);
}
function shieldFrom(state: RadiantCombatState, holder: string, casterId: string, remaining = 100): void {
  bearerOf(state, holder).shields.push({ id: state.nextShieldId++, source: { kind: 'skill', bearerId: casterId }, remaining });
}

describe('D-493 B5b Master kit modifiers: content', () => {
  it('adds the approved clause primitives to exactly the 37 B5b Masters', () => {
    expect(Object.keys(clauses)).toHaveLength(37);
    for (const [id, master] of Object.entries(radiantMasters)) {
      const own = master.effects.filter(entry => clauseKind(id, entry.kind)).map(entry => [entry.kind, entry.amount]);
      expect(own, id).toEqual(clauses[id] ? parse(clauses[id]) : []);
    }
    expect(radiantMasters['master-sprout-2'].effects.map(entry => entry.kind)).toEqual(['briar-seeds']);
  });
  it('writes exact tooltips for every clause kind and names counters in Master text', () => {
    for (const kind of radiantMasterClauseKinds) expect(radiantConduitDescription({ kind, amount: .5 })).not.toMatch(/undefined|NaN/);
    expect(radiantMasters['master-caldrex-1'].effect).toContain('Maximum Heat becomes 5.');
    expect(radiantMasters['master-caldrex-1'].effect).toContain('Caldrex has Defense Up +12% per stored Heat');
    expect(radiantMasters['master-asteriel-1'].effect).toContain('Maximum Promise becomes 4.');
    expect(radiantMasters['master-ember-2'].effect).toContain('Dawnfire hits only the current target');
    expect(radiantMasters['master-bruno-2'].effect).toContain('largest of 40% of his maximum Health, 375% of his current Defense, or 37.5% of his maximum Health');
  });
  it('applies structural clauses to the kit as the loadout casts it', () => {
    const def = (starter: RadiantBearerId, master: RadiantMasterId | null, slot: 1 | 2 | 'flare') => radiantKitSkill(member(starter, master), slot);
    expect(def('ember', 'master-ember-2', 'flare').target).toBe('one-enemy');
    expect(def('ember', null, 'flare').target).toBe('all-enemies');
    expect(def('bliss', 'master-bliss-1', 2).effects.every(effect => effect.when === undefined)).toBe(true);
    expect(def('caevren', 'master-caevren-2', 2).effects.map(effect => 'value' in effect ? effect.value : 0)).toEqual([.55, .55]);
    expect(def('vespera', 'master-vespera-1', 2).effects[0]).toMatchObject({ op: 'signal', value: .5 });
    expect(def('neralis', 'master-neralis-1', 2).effects[0]).toMatchObject({ kind: 'heal', perStack: .09 });
    expect(def('ilyss', 'master-ilyss-1', 'flare').effects[0]).toMatchObject({ kind: 'heal', perStack: .13 });
    expect(def('serapha', 'master-serapha-1', 'flare').effects[1]).toMatchObject({ kind: 'heal', perStack: .05 });
    expect(def('seravelle', 'master-seravelle-1', 2).effects[0]).toMatchObject({ kind: 'attack-up', value: .4 });
    expect(def('varkhel', 'master-varkhel-3', 2).effects[0]).toMatchObject({ kind: 'ignore-defense', value: .35 });
    expect(def('velmira', 'master-velmira-2', 2).effects[0]).toMatchObject({ kind: 'ignore-defense', value: .35, when: 'crosscut-2' });
    expect(def('disciple', 'master-disciple-1', 1).effects[0]).toMatchObject({ kind: 'attack-up', turns: 4 });
    expect(def('ilvaris', 'master-ilvaris-1', 1).effects[0]).toMatchObject({ op: 'fate-mark', value: 2 });
    expect(def('ilvaris', 'master-ilvaris-3', 'flare').effects[0]).toMatchObject({ op: 'fate-mark', value: 3 });
    expect(radiantSignatureCap(member('caldrex', 'master-caldrex-1'), 'heat')).toBe(5);
    expect(radiantSignatureCap(member('caldrex'), 'heat')).toBe(3);
  });
});

describe('D-493 B5b Master kit modifiers: combat', () => {
  it('makes Dawnfire single-target with its Burn on the target only, and the pressure policy aims it', () => {
    const state = charge(fixture([['ember', 'master-ember-2']]), 'ember', 200);
    expect(() => applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ember' })).toThrow();
    expect(chooseRadiantPressureAction(state, 'ember', 'balanced')).toMatchObject({ type: 'flare', targetId: expect.any(String) });
    const cast = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'ember', targetId: 'enemy' });
    expect(dealt(cast.events, 'ember', 'enemy')).toBeGreaterThan(0);
    expect(dealt(cast.events, 'ember', 'enemy2')).toBe(0);
    expect(enemyOf(cast.state, 'enemy').debuffs.some(effect => effect.category === 'burn')).toBe(true);
    expect(enemyOf(cast.state, 'enemy2').debuffs).toEqual([]);
  });
  it('raises counter caps in play and in validation, and adds Defense Up per stored count', () => {
    const state = fixture([['caldrex', 'master-caldrex-1']]);
    const own = bearerOf(state, 'caldrex').signature as { count: number };
    own.count = 5;
    expect(() => validateRadiantCombat(state)).not.toThrow();
    own.count = 6;
    expect(() => validateRadiantCombat(state)).toThrow();
    own.count = 3;
    const base = structuredClone(state);
    (bearerOf(base, 'caldrex').signature as { count: number }).count = 0;
    expect(effectiveRadiantStats(state, 'caldrex').defense / effectiveRadiantStats(base, 'caldrex').defense).toBeCloseTo(1.36);
    const plain = fixture([['caldrex']]);
    (bearerOf(plain, 'caldrex').signature as { count: number }).count = 4;
    expect(() => validateRadiantCombat(plain)).toThrow();
    const asteriel = fixture([['asteriel', 'master-asteriel-1']]);
    const path = bearerOf(asteriel, 'asteriel').signature as { count: number; path: string | null };
    path.path = 'shelter'; path.count = 4;
    expect(() => validateRadiantCombat(asteriel)).not.toThrow();
    const none = structuredClone(asteriel);
    (bearerOf(none, 'asteriel').signature as { count: number }).count = 0;
    expect(radiantSkillStats(asteriel, 'asteriel', 1).skillPower - radiantSkillStats(none, 'asteriel', 1).skillPower).toBeCloseTo(.2);
    path.count = 5;
    expect(() => validateRadiantCombat(asteriel)).toThrow();
  });
  it('lets Seismic Hammerfall sunder its target for every ally through the next enemy phase', () => {
    const state = charge(fixture([['bruno', 'master-bruno-3'], ['ember']]), 'bruno');
    const cast = applyRadiantCombatAction(state, { type: 'skill', bearerId: 'bruno', slot: 1, targetId: 'enemy' });
    expect(enemyOf(cast.state, 'enemy').sunder).toEqual({ casterId: 'bruno', remaining: 2 });
    const without = structuredClone(cast.state);
    delete enemyOf(without, 'enemy').sunder;
    const hit = (from: RadiantCombatState) => dealt(applyRadiantCombatAction(from, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).events, 'ember');
    expect(hit(cast.state)).toBeGreaterThan(hit(without));
    const forged = fixture([['bruno'], ['ember']]);
    enemyOf(forged, 'enemy').sunder = { casterId: 'bruno', remaining: 2 };
    expect(() => validateRadiantCombat(forged)).toThrow();
    const long = structuredClone(cast.state);
    enemyOf(long, 'enemy').sunder!.remaining = 3;
    expect(() => validateRadiantCombat(long)).toThrow();
  });
  it('applies Tizu, Elise and Nerithe Defense clauses to other allies while the bearer lives, credited to the Master', () => {
    const tide = (master: RadiantMasterId | null) => {
      const state = fixture([['tide', master ?? undefined], ['ember']]);
      enemyOf(state, 'enemy').debuffs.push({ category: 'weaken', source: { kind: 'skill', bearerId: 'tide' }, magnitude: .25, remaining: 2 });
      shieldFrom(state, 'ember', 'tide');
      return state;
    };
    const normal = (state: RadiantCombatState) => applyRadiantCombatAction(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    const harpoon = normal(tide('master-tide-3'));
    expect(dealt(harpoon.events, 'ember')).toBeGreaterThan(dealt(normal(tide(null)).events, 'ember'));
    expect(harpoon.events.some(event => event.type === 'damage' &&
      event.boosts?.some(boost => boost.source.kind === 'master' && boost.source.bearerId === 'tide'))).toBe(true);
    const fallen = tide('master-tide-3');
    bearerOf(fallen, 'tide').hp = 0; fallen.gauge.members[0].living = false;
    const fallenPlain = tide(null);
    bearerOf(fallenPlain, 'tide').hp = 0; fallenPlain.gauge.members[0].living = false;
    expect(dealt(normal(fallen).events, 'ember')).toBe(dealt(normal(fallenPlain).events, 'ember'));

    const elise = (master: RadiantMasterId | null) => {
      const state = fixture([['elise', master ?? undefined], ['ember']]);
      const own = bearerOf(state, 'elise').signature as { held: number; lodged: string[] };
      own.held = 0; own.lodged = ['enemy', 'enemy'];
      return state;
    };
    expect(dealt(normal(elise('master-elise-1')).events, 'ember')).toBeGreaterThan(dealt(normal(elise(null)).events, 'ember'));

    const nerithe = (master: RadiantMasterId | null) => {
      const state = charge(fixture([['nerithe', master ?? undefined], ['ember']]), 'ember');
      Object.assign(bearerOf(state, 'nerithe').signature!, { targetId: 'enemy', count: 3 });
      return state;
    };
    const skill = (state: RadiantCombatState) => dealt(applyRadiantCombatAction(state,
      { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' }).events, 'ember', 'enemy');
    expect(skill(nerithe('master-nerithe-1'))).toBeGreaterThan(skill(nerithe(null)));
    expect(dealt(normal(nerithe('master-nerithe-1')).events, 'ember')).toBe(dealt(normal(nerithe(null)).events, 'ember'));
  });
  it('gives allies under Bruno\'s Cover Gauge Gain and Attack Up, and Foundation holders Defense Up', () => {
    const covered = (master: RadiantMasterId) => {
      const state = fixture([['bruno', master], ['ember']]);
      bearerOf(state, 'ember').cover = { casterId: 'bruno', share: .4, remaining: 1 };
      return state;
    };
    const open = (state: RadiantCombatState) => { const copy = structuredClone(state); bearerOf(copy, 'ember').cover = null; return copy; };
    const gain = covered('master-bruno-2');
    expect(radiantSkillStats(gain, 'ember', 1).gaugeGain - radiantSkillStats(open(gain), 'ember', 1).gaugeGain).toBeCloseTo(.25);
    const attack = covered('master-bruno-3');
    expect(effectiveRadiantStats(attack, 'ember').attack / effectiveRadiantStats(open(attack), 'ember').attack).toBeCloseTo(1.25);
    const keystone = fixture([['orvella', 'master-orvella-3'], ['ember']]);
    const bare = structuredClone(keystone);
    Object.assign(bearerOf(keystone, 'orvella').signature!, { foundation: { durability: 100, max: 100, remaining: 2 } });
    expect(effectiveRadiantStats(keystone, 'ember').defense / effectiveRadiantStats(bare, 'ember').defense).toBeCloseTo(1.25);
  });
  it('builds Worldwall Ascendant\'s Shield from the largest of its kit value, Defense and Health shares', () => {
    const state = charge(fixture([['bruno', 'master-bruno-2'], ['ember']]), 'bruno', 200);
    const bruno = bearerOf(state, 'bruno');
    const defense = effectiveRadiantStats(state, 'bruno').defense, power = radiantSkillStats(state, 'bruno', 'flare').skillPower;
    const cast = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'bruno' });
    const flare = cast.events.find(event => event.type === 'flare');
    const tier = flare?.type === 'flare' ? flare.tier : 'ultimate';
    const scale = radiantFlareTierScale[tier].effect * radiantFlarePower(bruno.loadout);
    const expected = Math.round(Math.max(.4 * bruno.stats.hp, 3.75 * defense, .375 * bruno.stats.hp) * scale * power);
    expect(cast.events.find(event => event.type === 'shield' && event.targetId === 'bruno')).toMatchObject({ amount: expected });
  });
  it('resolves the skill clauses of Flora, Disciple, Vaelor, Ilvaris, Kaelith, Myrthen and Ozriel', () => {
    const sprout = charge(fixture([['sprout', 'master-sprout-2'], ['ember'], ['tide']]), 'sprout');
    const seeded = applyRadiantCombatAction(sprout, { type: 'skill', bearerId: 'sprout', slot: 1, targetId: 'enemy' });
    expect(seeded.state.bearers.every(entry => entry.seed !== null)).toBe(true);

    const disciple = applyRadiantCombatAction(charge(fixture([['disciple', 'master-disciple-1']]), 'disciple'),
      { type: 'skill', bearerId: 'disciple', slot: 1 });
    expect(disciple.state.bearers[0].buffs.find(effect => effect.category === 'attack-up')?.remaining).toBe(4);

    const vaelor = charge(fixture([['vaelor', 'master-vaelor-2'], ['ember']]), 'vaelor');
    vaelor.round = 2;
    const cascade = applyRadiantCombatAction(vaelor, { type: 'skill', bearerId: 'vaelor', slot: 2 });
    for (const ally of cascade.state.bearers) {
      expect(ally.buffs.some(effect => effect.category === 'attack-up')).toBe(true);
      expect(ally.buffs.find(effect => effect.category === 'gain-up')).toMatchObject({ magnitude: .2, source: { kind: 'master', bearerId: 'vaelor' } });
    }

    const verse = applyRadiantCombatAction(charge(fixture([['ilvaris', 'master-ilvaris-1']]), 'ilvaris'),
      { type: 'skill', bearerId: 'ilvaris', slot: 1, targetId: 'enemy' });
    expect((verse.state.bearers[0].signature as { marks: { stacks: number }[] }).marks[0].stacks).toBe(2);
    const hymn = applyRadiantCombatAction(charge(fixture([['ilvaris', 'master-ilvaris-2'], ['ember']]), 'ilvaris'),
      { type: 'skill', bearerId: 'ilvaris', slot: 2 });
    expect(hymn.events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'master')).toHaveLength(2);

    const shatter = applyRadiantCombatAction(charge(fixture([['kaelith', 'master-kaelith-2']]), 'kaelith'),
      { type: 'skill', bearerId: 'kaelith', slot: 1 });
    expect((shatter.state.bearers[0].signature as { incisions: { stacks: number }[] }).incisions.map(entry => entry.stacks)).toEqual([2, 2]);
    const denial = applyRadiantCombatAction(charge(fixture([['kaelith', 'master-kaelith-3']]), 'kaelith', 200),
      { type: 'flare', bearerId: 'kaelith' });
    expect((denial.state.bearers[0].signature as { incisions: { stacks: number }[] }).incisions.map(entry => entry.stacks)).toEqual([3, 3]);

    const myrthen = charge(fixture([['myrthen', 'master-myrthen-1']]), 'myrthen');
    (bearerOf(myrthen, 'myrthen').signature as { count: number }).count = 2;
    const harvest = applyRadiantCombatAction(myrthen, { type: 'skill', bearerId: 'myrthen', slot: 1, targetId: 'enemy' });
    expect((harvest.state.bearers[0].signature as { count: number }).count).toBe(1);

    const pane = applyRadiantCombatAction(charge(fixture([['ozriel', 'master-ozriel-2']]), 'ozriel'),
      { type: 'skill', bearerId: 'ozriel', slot: 1, targetId: 'enemy' });
    expect(enemyOf(pane.state, 'enemy2').debuffs.find(effect => effect.category === 'weaken'))
      .toMatchObject({ magnitude: .25, source: { kind: 'master', bearerId: 'ozriel' } });
    const refuses = charge(fixture([['ozriel', 'master-ozriel-3'], ['ember']]), 'ozriel', 200);
    (bearerOf(refuses, 'ozriel').signature as { spent: string[] }).spent = ['ember'];
    const restored = applyRadiantCombatAction(refuses, { type: 'flare', bearerId: 'ozriel' });
    expect((restored.state.bearers[0].signature as { spent: string[] }).spent).toEqual([]);
    expect(restored.events.some(event => event.type === 'signature' && event.op === 'refusal-restore' && event.holderId === 'ember')).toBe(true);
  });
  it('resolves Velmira\'s once-per-encounter Crosscut, Varkhel\'s Luminosity and Orvella\'s Foundation carry', () => {
    const velmira = charge(fixture([['velmira', 'master-velmira-1'], ['ember']]), 'velmira');
    const first = applyRadiantCombatAction(velmira, { type: 'skill', bearerId: 'velmira', slot: 1, targetId: 'enemy' });
    expect((first.state.bearers[0].signature as { count: number }).count).toBe(1);
    expect(first.state.bearers[0].masterUsed).toBe(true);
    const used = structuredClone(velmira);
    used.bearers[0].masterUsed = true;
    const again = applyRadiantCombatAction(used, { type: 'skill', bearerId: 'velmira', slot: 1, targetId: 'enemy' });
    expect((again.state.bearers[0].signature as { count: number }).count).toBe(0);
    const forged = fixture([['velmira'], ['ember']]);
    forged.bearers[0].masterUsed = true;
    expect(() => validateRadiantCombat(forged)).toThrow();

    const varkhel = charge(fixture([['varkhel', 'master-varkhel-3']]), 'varkhel');
    (bearerOf(varkhel, 'varkhel').signature as { count: number }).count = 3;
    const strain = applyRadiantCombatAction(varkhel, { type: 'skill', bearerId: 'varkhel', slot: 2, targetId: 'enemy' });
    expect(strain.events.find(event => event.type === 'charge' && event.gearSource?.kind === 'master')).toMatchObject({ gained: 15 });

    const citadel = (foundation: { durability: number; max: number; remaining: number } | null) => {
      const state = charge(fixture([['orvella', 'master-orvella-1']]), 'orvella', 200);
      Object.assign(bearerOf(state, 'orvella').signature!, { foundation });
      const cast = applyRadiantCombatAction(state, { type: 'flare', bearerId: 'orvella' });
      return (cast.state.bearers[0].signature as { foundation: { durability: number; max: number } }).foundation;
    };
    const fresh = citadel(null), carried = citadel({ durability: 400, max: 400, remaining: 2 });
    expect(carried.durability).toBe(fresh.durability + 160);
    expect(carried.max).toBe(carried.durability);
  });
  it('stores Shield-absorbed damage as Unreturned up to the raised cap', () => {
    const run = (master: RadiantMasterId | null) => {
      const state = fixture([['maerion', master ?? undefined], ['ember']]);
      shieldFrom(state, 'ember', 'maerion', 20);
      const enemyPhase = applyRadiantCombatAction(state, { type: 'end-turn' }).state;
      const hit = applyRadiantCombatAction(enemyPhase, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 3 });
      const loss = hit.events.reduce((sum, event) => event.type === 'damage' && event.targetId === 'ember' ? sum + event.healthLoss : sum, 0);
      return { stored: (hit.state.bearers[0].signature as { stored: number }).stored, loss };
    };
    const plain = run(null), voyage = run('master-maerion-1');
    expect(plain.stored).toBe(plain.loss);
    expect(voyage.stored).toBe(voyage.loss + 20);
    const capped = fixture([['maerion', 'master-maerion-1']]);
    const own = capped.bearers[0].signature as { stored: number };
    own.stored = Math.round(.85 * capped.bearers[0].stats.hp);
    expect(() => validateRadiantCombat(capped)).not.toThrow();
    const base = fixture([['maerion']]);
    (base.bearers[0].signature as { stored: number }).stored = Math.round(.85 * base.bearers[0].stats.hp);
    expect(() => validateRadiantCombat(base)).toThrow();
  });
});

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
function play(saved: FrozenRadiantRun): RadiantTurnAction[] {
  const run = structuredClone(saved), actions: RadiantTurnAction[] = [];
  while (run.state.phase === 'player' && actions.length < 2000) {
    const action = chooseRadiantPressureAction(run.state, radiantPendingActors(run.state)[0], 'balanced') as RadiantTurnAction;
    applyRadiantTurn(run, action); actions.push(action);
  }
  return actions;
}
async function send(transport: LocalRadiantTransport, operation: RadiantRunOperation) {
  const checkpoint = await transport.read();
  const request: RadiantRunRequest = { requestId: crypto.randomUUID(), expectedRevision: checkpoint.revision,
    runId: operation.kind === 'start' ? null : checkpoint.run!.id,
    encounter: operation.kind === 'start' ? null : checkpoint.run!.encounter, operation };
  return transport.execute(request);
}
function storageWith(squad: string[], masters: Record<string, RadiantMasterId>): MemoryStorage {
  const storage = new MemoryStorage(), account: Account = emptyAccount();
  account.squad = squad;
  squad.forEach(id => { account.characters[id as keyof Account['characters']] = { level: 0, evolution: 1, weaponRank: 0 }; });
  account.masterConduits = Object.fromEntries(Object.values(masters).map(id => [id, 1]));
  account.masterEquipment = masters;
  saveAccount(storage, account);
  return storage;
}

describe('B5b save compatibility (standing requirement, 2026-11-20)', () => {
  const masters: Record<string, RadiantMasterId> = { ember: 'master-ember-2', bruno: 'master-bruno-3', caldrex: 'master-caldrex-1' };
  it('settles and reloads a journal with B5b Masters equipped, and rejects an unknown signature op', async () => {
    const transport = new LocalRadiantTransport(storageWith(['ember', 'bruno', 'caldrex'], masters), () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const settled = await send(transport, { kind: 'settle', actions: play(started.run) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
    const snapshot = (run: FrozenRadiantRun) => ({ revision: 9,
      state: { profile: {}, starterId: 'ember', run: null, account: settled.account, radiantStudy: run } });
    expect(validateRadiantRunSnapshot(snapshot(settled.run)).state.radiantStudy).toEqual(settled.run);
    const forged = structuredClone(settled.run);
    forged.journal.events.push({ type: 'signature', bearerId: 'bruno', op: 'shatter', amount: 1 } as never);
    expect(() => validateRadiantRunSnapshot(snapshot(forged))).toThrow();
  });
  it('loads an encounter with B5b Masters equipped mid-run and settles it', async () => {
    const transport = new LocalRadiantTransport(storageWith(['ember', 'bruno', 'caldrex'], masters), () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const loaded = await transport.read();
    expect(loaded.notice).toBeUndefined();
    const settled = await send(transport, { kind: 'settle', actions: play(loaded.run!) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
  });
});
