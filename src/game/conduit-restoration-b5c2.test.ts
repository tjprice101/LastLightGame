import { describe, expect, it } from 'vitest';
import { radiantMasters, type RadiantBearerId, type RadiantLoadout, type RadiantMasterId } from '../content/combat-kits';
import { radiantMasterClauseKinds } from '../content/conduit-effects';
import { radiantConduitDescription } from '../content/conduit-effect-text';
import {
  applyRadiantCombatAction, createRadiantCombat, radiantMaximumHealth, radiantPendingActors, radiantSkillStats, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState,
} from './combat-engine';
import { chooseRadiantPressureAction } from './enemy-pressure';
import { emptyAccount, saveAccount, type Account } from './account';
import { LocalRadiantTransport } from '../online/battle-local';
import {
  applyRadiantTurn, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantRunOperation, type RadiantRunRequest, type RadiantTurnAction,
} from '../online/battle-run';

/** D-493 B5c2 (approved B5c plan, 2026-11-22): Master Luminosity, Shield and heal triggers. */
const clauses: Record<string, string> = {
  'master-atmoso-1': 'gust-charge 3', 'master-atmoso-2': 'cyclone-shield .3', 'master-bliss-2': 'warfeather-heal .06',
  'master-disciple-2': 'resolve-charge 10', 'master-razor-1': 'midnight-heal .2', 'master-razor-2': 'bastion-share .4',
  'master-rosetta-1': 'quarry-charge 12', 'master-rosetta-2': 'skyfall-heal .08', 'master-crinso-2': 'edge-shield .12',
  'master-crinso-3': 'combo-heal .08', 'master-nerithe-3': 'survey-charge 4', 'master-solenne-2': 'repose-shield .2',
  'master-myrthen-3': 'reaping-heal .06, reaping-charge 5', 'master-neralis-2': 'station-shield .2', 'master-neralis-3': 'weir-charge 10',
  'master-varkhel-2': 'chain-shield .16', 'master-seravelle-3': 'road-shield .22',
  'master-velmira-3': 'doorway-charge 25, doorway-heal .18', 'master-maerion-2': 'ferry-shield .35',
  'master-maerion-3': 'ferrywake-charge 15', 'master-vespera-3': 'relay-charge 10', 'master-ilyss-2': 'unbind-shield .15',
  'master-asteriel-2': 'shelter-heal .2', 'master-asteriel-3': 'starseed-charge 8',
};
const b5c2Kinds = radiantMasterClauseKinds.slice(radiantMasterClauseKinds.indexOf('gust-charge')) as readonly string[];
const parse = (text: string) => text.split(', ').map(part => { const [kind, amount] = part.split(' '); return [kind, Number(amount)]; });

function member(starter: RadiantBearerId, masterId: RadiantMasterId | null = null): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId, ascension: {}, gear: Array(8).fill(null) };
}
function fixture(squad: [RadiantBearerId, RadiantMasterId?][], enemyHP = 1000000): RadiantCombatState {
  const state = createRadiantCombat(squad.map(([starter, masterId]) => member(starter, masterId ?? null)),
    ['enemy', 'enemy2'].map(id => ({ id, elementId: null, stats: { hp: enemyHP, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })),
    0, false);
  for (const entry of state.gauge.members) entry.charge = 200;
  return state;
}
const bearerOf = (state: RadiantCombatState, id: string) => state.bearers.find(entry => entry.loadout.id === id)!;
const act = (state: RadiantCombatState, action: RadiantCombatAction) => applyRadiantCombatAction(state, action);
/** Only `id` keeps Luminosity to act; everyone else starts empty so Master grants are fully visible. */
function only(state: RadiantCombatState, id: string): RadiantCombatState {
  for (const entry of state.gauge.members) entry.charge = entry.id === id ? 200 : 0;
  return state;
}
function wound(state: RadiantCombatState, id: string, fraction: number): RadiantCombatState {
  const target = bearerOf(state, id);
  target.hp = Math.round(radiantMaximumHealth(state, id) * fraction);
  return state;
}
type Restore = Extract<RadiantCombatEvent, { type: 'heal' | 'shield' }>;
/** Heals or Shields a Master credited to `giver` gave, by target. */
function restores(events: RadiantCombatEvent[], giver: string, type: 'heal' | 'shield'): Record<string, number> {
  const out: Record<string, number> = {};
  for (const event of events) if (event.type === type && event.source.kind === 'master' && event.source.bearerId === giver)
    out[(event as Restore).targetId] = (out[(event as Restore).targetId] ?? 0) + (type === 'heal' ? (event as Extract<Restore, { type: 'heal' }>).offered : (event as Extract<Restore, { type: 'shield' }>).amount);
  return out;
}
/** Luminosity a Master credited to `giver` added, by recipient. */
function gains(events: RadiantCombatEvent[], giver: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const event of events) if (event.type === 'charge' && event.gearSource?.kind === 'master' && event.gearSource.bearerId === giver)
    out[event.bearerId] = (out[event.bearerId] ?? 0) + (event.gained ?? 0);
  return out;
}
const pct = (state: RadiantCombatState, id: string, fraction: number) => Math.round(fraction * bearerOf(state, id).stats.hp);
function nextTurn(state: RadiantCombatState, targetId = state.bearers[0].loadout.id): RadiantCombatState {
  let next = state.phase === 'player' ? act(state, { type: 'end-turn' }).state : state;
  for (const target of next.enemies.filter(entry => entry.hp > 0))
    next = act(next, { type: 'enemy-attack', enemyId: target.id, targetIds: [targetId], coefficient: .01 }).state;
  next = act(next, { type: 'finish-enemy-phase' }).state;
  for (const entry of next.gauge.members) entry.charge = 200;
  return next;
}

describe('D-493 B5c2 Master triggers: content', () => {
  it('adds the approved primitives to exactly the 24 B5c2 rows; the Radiant-era pairs are gone', () => {
    expect(Object.keys(clauses)).toHaveLength(24);
    for (const [id, master] of Object.entries(radiantMasters)) {
      const own = master.effects.filter(entry => b5c2Kinds.includes(entry.kind)).map(entry => [entry.kind, entry.amount]);
      expect(own, id).toEqual(clauses[id] ? parse(clauses[id]) : []);
    }
    expect(radiantMasters['master-disciple-2'].effects.map(entry => entry.kind)).toEqual(['resolve-charge']);
    expect(radiantMasters['master-nerithe-3'].effects.map(entry => entry.kind)).toEqual(['survey-charge']);
  });
  it('writes exact tooltips for every B5c2 kind', () => {
    for (const kind of b5c2Kinds) expect(radiantConduitDescription({ kind, amount: .25 } as never)).not.toMatch(/undefined|NaN/);
    expect(radiantMasters['master-razor-2'].effect).toContain('up to 45% of their own maximum Health');
    expect(radiantMasters['master-myrthen-3'].effect).toContain('heals 6% of their maximum Health and gains 5 Luminosity');
    expect(radiantMasters['master-velmira-3'].effect).toContain('at least 3 Crosscut, Velmira gains 25 Luminosity after its cost, rounded once, and heals 18%');
  });
});

describe('D-493 B5c2 Master triggers: combat', () => {
  it('Sky Without End Turbine and Horizon Cyclone Orrery: a Cyclone release fills per Gust and shields from Health removed', () => {
    const setup = (masterId: RadiantMasterId) => {
      const state = only(fixture([['atmoso', masterId], ['ember']]), 'atmoso');
      bearerOf(state, 'atmoso').signature = { kind: 'cyclone', gusts: 4, cyclone: { coefficient: 1, perGust: .1, remaining: 2 } };
      validateRadiantCombat(state);
      return act(state, { type: 'skill', bearerId: 'atmoso', slot: 1, targetId: 'enemy' });
    };
    expect(gains(setup('master-atmoso-1').events, 'atmoso').ember).toBe(12);
    const shielded = setup('master-atmoso-2').events;
    const release = shielded.findIndex(event => event.type === 'signature' && event.op === 'cyclone-release');
    const removed = shielded.slice(release).reduce((sum, event) => event.type === 'damage' ? sum + event.healthLoss : sum, 0);
    expect(removed).toBeGreaterThan(0);
    expect(restores(shielded, 'atmoso', 'shield')).toEqual({ atmoso: Math.round(.3 * removed), ember: Math.round(.3 * removed) });
  });
  it('Concord Planet Thoughtforge: a holder of Disciple\'s Attack Up (held before acting) fills the others on a skill', () => {
    let state = fixture([['disciple', 'master-disciple-2'], ['ember'], ['tide']]);
    const cast = act(state, { type: 'skill', bearerId: 'disciple', slot: 1 });
    expect(gains(cast.events, 'disciple')).toEqual({});
    state = cast.state;
    for (const entry of state.gauge.members) entry.charge = entry.id === 'ember' ? 200 : 0;
    const used = act(state, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' });
    expect(gains(used.events, 'disciple')).toEqual({ disciple: 10, tide: 10 });
    const normal = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(gains(normal.events, 'disciple')).toEqual({});
  });
  it('Unbroken Midnight Bastion and Eclipse Planet Watchtower: Wounds heal others; Eclipse Bastion\'s Shield is shared, capped', () => {
    const state = wound(fixture([['razor', 'master-razor-1'], ['ember']]), 'ember', .3);
    bearerOf(state, 'razor').signature = { kind: 'wounds', wounds: 500 };
    const flare = act(state, { type: 'flare', bearerId: 'razor', targetId: 'enemy' });
    expect(restores(flare.events, 'razor', 'heal')).toEqual({ ember: Math.round(Math.min(100, .15 * bearerOf(state, 'ember').stats.hp)) });
    const bastion = act(fixture([['razor', 'master-razor-2'], ['ember']]), { type: 'skill', bearerId: 'razor', slot: 2 });
    const own = bastion.events.find(event => event.type === 'shield' && event.source.kind === 'skill') as Extract<Restore, { type: 'shield' }>;
    expect(restores(bastion.events, 'razor', 'shield')).toEqual({
      ember: Math.round(Math.min(.4 * own.amount, .45 * bearerOf(bastion.state, 'ember').stats.hp)) });
  });
  it('Rose Beyond the Sun Orrery: every 2 damaging actions on the Quarry fill each ally; a new Quarry resets the count', () => {
    let state = act(fixture([['rosetta', 'master-rosetta-1'], ['ember']]), { type: 'skill', bearerId: 'rosetta', slot: 1, targetId: 'enemy' }).state;
    expect((bearerOf(state, 'rosetta').signature as { quarryHits?: number }).quarryHits).toBeUndefined();
    const first = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(gains(first.events, 'rosetta')).toEqual({});
    expect((bearerOf(first.state, 'rosetta').signature as { quarryHits?: number }).quarryHits).toBe(1);
    const forged = structuredClone(first.state);
    (bearerOf(forged, 'rosetta').signature as { quarryHits?: number }).quarryHits = 2;
    expect(() => validateRadiantCombat(forged)).toThrow();
    state = nextTurn(first.state);
    for (const entry of state.gauge.members) entry.charge = 0;
    const second = act(state, { type: 'normal', bearerId: 'rosetta', targetId: 'enemy' });
    expect(gains(second.events, 'rosetta')).toEqual({ rosetta: 12, ember: 12 });
    expect((bearerOf(second.state, 'rosetta').signature as { quarryHits?: number }).quarryHits).toBeUndefined();
    // A Quarry count without the Master is rejected.
    const plain = act(fixture([['rosetta'], ['ember']]), { type: 'skill', bearerId: 'rosetta', slot: 1, targetId: 'enemy' }).state;
    (bearerOf(plain, 'rosetta').signature as { quarryHits?: number }).quarryHits = 1;
    expect(() => validateRadiantCombat(plain)).toThrow();
  });
  it('Virtuous Planet Rosegarden: Crimson Skyfall on the Quarry heals Rosetta and each ally who hit it this turn', () => {
    let state = act(fixture([['rosetta', 'master-rosetta-2'], ['ember'], ['tide']]), { type: 'skill', bearerId: 'rosetta', slot: 1, targetId: 'enemy' }).state;
    state = nextTurn(state);
    state = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).state;
    const skyfall = act(state, { type: 'skill', bearerId: 'rosetta', slot: 2, targetId: 'enemy2' });
    expect(restores(skyfall.events, 'rosetta', 'heal')).toEqual({ rosetta: pct(state, 'rosetta', .08), ember: pct(state, 'ember', .08) });
  });
  it('Stillplume Planetary Ballet: Warfeather Cut in Closing heals every other living ally; in Opening it does not', () => {
    const opening = act(fixture([['bliss', 'master-bliss-2'], ['ember']]), { type: 'skill', bearerId: 'bliss', slot: 1, targetId: 'enemy' });
    expect(restores(opening.events, 'bliss', 'heal')).toEqual({});
    const state = act(fixture([['bliss', 'master-bliss-2'], ['ember']]), { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).state;
    const closing = act(state, { type: 'skill', bearerId: 'bliss', slot: 1, targetId: 'enemy' });
    expect(restores(closing.events, 'bliss', 'heal')).toEqual({ ember: pct(state, 'ember', .06) });
  });
  it('Duality Planet Flamewheel and Crimson Beauty Pyre Requiem: Golden Edge after Crimson Rupture shields; Combo heals', () => {
    let state = wound(fixture([['crinso', 'master-crinso-2'], ['ember']]), 'ember', .5);
    state = act(state, { type: 'skill', bearerId: 'crinso', slot: 2, targetId: 'enemy' }).state;
    state = nextTurn(state, 'crinso');
    const edge = act(state, { type: 'skill', bearerId: 'crinso', slot: 1, targetId: 'enemy' });
    expect(restores(edge.events, 'crinso', 'shield')).toEqual({ ember: pct(state, 'ember', .12) });
    const combo = wound(fixture([['crinso', 'master-crinso-3'], ['ember']]), 'ember', .5);
    bearerOf(combo, 'crinso').signature = { kind: 'combo', combo: 1, last: 1 };
    expect(restores(act(combo, { type: 'skill', bearerId: 'crinso', slot: 2, targetId: 'enemy' }).events, 'crinso', 'heal'))
      .toEqual({ ember: pct(combo, 'ember', .08) });
    bearerOf(combo, 'crinso').signature = { kind: 'combo', combo: 2, last: 1 };
    expect(restores(act(combo, { type: 'skill', bearerId: 'crinso', slot: 2, targetId: 'enemy' }).events, 'crinso', 'heal'))
      .toEqual({ crinso: pct(combo, 'crinso', .08), ember: pct(combo, 'ember', .08) });
    // Repeating a skill resets Combo: no heal.
    bearerOf(combo, 'crinso').signature = { kind: 'combo', combo: 2, last: 2 };
    expect(restores(act(combo, { type: 'skill', bearerId: 'crinso', slot: 2, targetId: 'enemy' }).events, 'crinso', 'heal')).toEqual({});
  });
  it('Abyssal Surveyor Crown: each Survey Ocean Beyond the Map spends fills every living ally', () => {
    const state = only(fixture([['nerithe', 'master-nerithe-3'], ['ember']]), 'nerithe');
    bearerOf(state, 'nerithe').signature = { kind: 'survey', targetId: 'enemy', count: 3 };
    expect(gains(act(state, { type: 'flare', bearerId: 'nerithe', targetId: 'enemy' }).events, 'nerithe').ember).toBe(12);
    expect(gains(act(state, { type: 'skill', bearerId: 'nerithe', slot: 1, targetId: 'enemy' }).events, 'nerithe')).toEqual({});
  });
  it('Quiet-Arc Shelter Projector, Scarlet-Hinge Load Distributor and Braided-Signal Continuance Engine Shields', () => {
    const solenne = wound(fixture([['solenne', 'master-solenne-2'], ['ember']]), 'ember', .5);
    expect(restores(act(solenne, { type: 'skill', bearerId: 'solenne', slot: 1, targetId: 'enemy' }).events, 'solenne', 'shield'))
      .toEqual({ ember: pct(solenne, 'ember', .2) });
    const varkhel = fixture([['varkhel', 'master-varkhel-2'], ['ember']]);
    const chainPower = radiantSkillStats(varkhel, 'varkhel', 1).skillPower;
    expect(restores(act(varkhel, { type: 'skill', bearerId: 'varkhel', slot: 1 }).events, 'varkhel', 'shield'))
      .toEqual({ ember: Math.round(.16 * chainPower * bearerOf(varkhel, 'ember').stats.hp) });
    const seravelle = fixture([['seravelle', 'master-seravelle-3'], ['ember']]);
    const roadPower = radiantSkillStats(seravelle, 'seravelle', 'flare').skillPower;
    expect(restores(act(seravelle, { type: 'flare', bearerId: 'seravelle' }).events, 'seravelle', 'shield')).toEqual({
      seravelle: Math.round(.22 * roadPower * bearerOf(seravelle, 'seravelle').stats.hp),
      ember: Math.round(.22 * roadPower * bearerOf(seravelle, 'ember').stats.hp) });
  });
  it('Reaping-Tide Recovery Dynamo: Myrthen\'s direct defeat heals and fills the squad, once per turn', () => {
    const state = only(wound(fixture([['myrthen', 'master-myrthen-3'], ['ember']], 1), 'ember', .5), 'myrthen');
    const kill = act(state, { type: 'normal', bearerId: 'myrthen', targetId: 'enemy' });
    expect(restores(kill.events, 'myrthen', 'heal')).toEqual({ myrthen: pct(state, 'myrthen', .06), ember: pct(state, 'ember', .06) });
    expect(gains(kill.events, 'myrthen').ember).toBe(5);
    expect(kill.state.gearTriggered).toContain('myrthen:master-myrthen-3');
    const miss = act(only(fixture([['myrthen', 'master-myrthen-3'], ['ember']]), 'myrthen'), { type: 'normal', bearerId: 'myrthen', targetId: 'enemy' });
    expect(restores(miss.events, 'myrthen', 'heal')).toEqual({});
  });
  it('Blackwing Crossing Stabilizer and Weirheart Recollection Dynamo: Light the Next Station shields and fills below 50%', () => {
    const shielded = wound(fixture([['neralis', 'master-neralis-2'], ['ember']]), 'ember', .3);
    const power = radiantSkillStats(shielded, 'neralis', 1).skillPower;
    expect(restores(act(shielded, { type: 'skill', bearerId: 'neralis', slot: 1 }).events, 'neralis', 'shield'))
      .toEqual({ ember: Math.round(.2 * power * bearerOf(shielded, 'ember').stats.hp) });
    const low = only(wound(fixture([['neralis', 'master-neralis-3'], ['ember']]), 'ember', .3), 'neralis');
    const cast = act(low, { type: 'skill', bearerId: 'neralis', slot: 1 });
    expect(gains(cast.events, 'neralis')).toEqual({ ember: 10 });
    expect(cast.state.gearTriggered).toContain('neralis:master-neralis-3:ember');
    const high = only(wound(fixture([['neralis', 'master-neralis-3'], ['ember']]), 'ember', .6), 'neralis');
    expect(gains(act(high, { type: 'skill', bearerId: 'neralis', slot: 1 }).events, 'neralis')).toEqual({});
    const forged = structuredClone(low);
    forged.gearTriggered = ['neralis:master-neralis-3:nobody'];
    expect(() => validateRadiantCombat(forged)).toThrow();
    const plain = structuredClone(low);
    plain.gearTriggered = ['neralis:master-neralis-3:ember'];
    expect(() => validateRadiantCombat(plain)).not.toThrow();
  });
  it('Open-Threshold Return Drive: Leave the Doorway Standing spending 3 Crosscut fills and heals Velmira', () => {
    const state = wound(fixture([['velmira', 'master-velmira-3'], ['ember']]), 'velmira', .5);
    bearerOf(state, 'velmira').signature = { kind: 'crosscut', count: 3, latch: false };
    const flare = act(state, { type: 'flare', bearerId: 'velmira', targetId: 'enemy' });
    expect(gains(flare.events, 'velmira')).toEqual({ velmira: 25 });
    expect(restores(flare.events, 'velmira', 'heal')).toEqual({ velmira: pct(state, 'velmira', .18) });
    bearerOf(state, 'velmira').signature = { kind: 'crosscut', count: 2, latch: false };
    expect(gains(act(state, { type: 'flare', bearerId: 'velmira', targetId: 'enemy' }).events, 'velmira')).toEqual({});
  });
  it('Crescent Rib Mercy Foundry and Ferrywake Remembrance Dynamo: overheal becomes a Shield; crossing 50% fills', () => {
    const full = fixture([['maerion', 'master-maerion-2'], ['ember']]);
    const ferry = act(full, { type: 'skill', bearerId: 'maerion', slot: 2 });
    const heal = ferry.events.find(event => event.type === 'heal' && event.source.kind === 'skill') as Extract<Restore, { type: 'heal' }>;
    expect(restores(ferry.events, 'maerion', 'shield')).toEqual({
      [heal.targetId]: Math.round(Math.min(heal.offered - heal.effective, .35 * bearerOf(full, heal.targetId).stats.hp)) });
    const low = only(wound(fixture([['maerion', 'master-maerion-3'], ['ember']]), 'ember', .4), 'maerion');
    const lifted = act(low, { type: 'skill', bearerId: 'maerion', slot: 2 });
    expect(bearerOf(lifted.state, 'ember').hp).toBeGreaterThanOrEqual(.5 * radiantMaximumHealth(lifted.state, 'ember'));
    expect(gains(lifted.events, 'maerion')).toEqual({ ember: 15 });
  });
  it('Unextinguished Relay Cathedral: another ally spending Vespera\'s Signal gains Luminosity, once per turn', () => {
    let state = act(fixture([['vespera', 'master-vespera-3'], ['ember'], ['tide']]), { type: 'skill', bearerId: 'vespera', slot: 2 }).state;
    for (const entry of state.gauge.members) entry.charge = entry.id === 'vespera' ? 0 : 100;
    const first = act(state, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' });
    expect(gains(first.events, 'vespera')).toEqual({ ember: 10 });
    state = first.state;
    expect(gains(act(state, { type: 'skill', bearerId: 'tide', slot: 1, targetId: 'enemy' }).events, 'vespera')).toEqual({});
  });
  it('Unbinding Mercy Worldlock: removing Weaken shields that ally, once per ally per turn', () => {
    const state = wound(fixture([['ilyss', 'master-ilyss-2'], ['ember']]), 'ember', .5);
    bearerOf(state, 'ember').buffs.push({ category: 'weaken', source: { kind: 'enemy', enemyId: 'enemy' }, magnitude: .2, remaining: 1 } as never);
    const cast = act(state, { type: 'skill', bearerId: 'ilyss', slot: 2 });
    expect(restores(cast.events, 'ilyss', 'shield')).toEqual({ ember: pct(state, 'ember', .15) });
    expect(cast.state.gearTriggered).toContain('ilyss:master-ilyss-2:ember');
  });
  it('Night-Library Germination Vault and Freely-Given Starseed Distributor', () => {
    const vault = wound(fixture([['asteriel', 'master-asteriel-2'], ['ember']]), 'ember', .5);
    const shelter = act(vault, { type: 'skill', bearerId: 'asteriel', slot: 1 });
    expect(restores(shelter.events, 'asteriel', 'heal')).toEqual({ ember: pct(vault, 'ember', .2) });
    expect(shelter.state.gearTriggered).toContain('asteriel:master-asteriel-2');
    let state = act(fixture([['asteriel', 'master-asteriel-3'], ['ember'], ['tide']]), { type: 'skill', bearerId: 'asteriel', slot: 2 }).state;
    for (const entry of state.gauge.members) entry.charge = 0;
    const hit = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(gains(hit.events, 'asteriel')).toEqual({ ember: 8 });
    state = hit.state;
    expect(gains(act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy' }).events, 'asteriel')).toEqual({});
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

describe('B5c2 save compatibility (standing requirement, 2026-11-20)', () => {
  const masters: Record<string, RadiantMasterId> = { rosetta: 'master-rosetta-1', razor: 'master-razor-2', atmoso: 'master-atmoso-1' };
  it('settles and reloads a journal with B5c2 Masters equipped', async () => {
    const transport = new LocalRadiantTransport(storageWith(['rosetta', 'razor', 'atmoso'], masters), () => 'rosetta');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const settled = await send(transport, { kind: 'settle', actions: play(started.run) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
    const snapshot = { revision: 9, state: { profile: {}, starterId: 'rosetta', run: null, account: settled.account, radiantStudy: settled.run } };
    expect(validateRadiantRunSnapshot(snapshot).state.radiantStudy).toEqual(settled.run);
  });
  it('loads an encounter with B5c2 Masters equipped mid-run and settles it', async () => {
    const transport = new LocalRadiantTransport(storageWith(['rosetta', 'razor', 'atmoso'], masters), () => 'rosetta');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const loaded = await transport.read();
    expect(loaded.notice).toBeUndefined();
    const settled = await send(transport, { kind: 'settle', actions: play(loaded.run!) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
  });
});
