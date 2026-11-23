import { describe, expect, it } from 'vitest';
import type { ConduitId } from '../content/conduits';
import { radiantConduitPrimitives, radiantConduits, type RadiantGear } from '../content/conduit-effects';
import { radiantConduitEffectText } from '../content/conduit-effect-text';
import { type RadiantBearerId, type RadiantLoadout } from '../content/combat-kits';
import {
  applyRadiantCombatAction, createRadiantCombat, radiantActionEfficiency, radiantSkillStats, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState,
} from './combat-engine';
import { radiantPressureEnemyAction } from './enemy-pressure';
import type { RadiantPressureEnemy } from './enemy-pressure-encounters';
import { radiantImpactFrames } from '../presentation/battle-impact-frames';
import { radiantSignatureView } from '../presentation/battle-signatures';
import { radiantConduitCallouts } from '../presentation/battle-conduit-contribution';
import { radiantKitGlossary } from '../presentation/character-combat';
import { characterName } from '../content/character-art';
import { emptyAccount, saveAccount, type Account } from './account';
import { LocalRadiantTransport } from '../online/battle-local';
import {
  applyRadiantTurn, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantRunOperation, type RadiantRunRequest, type RadiantTurnAction,
} from '../online/battle-run';

/** D-493 batch B3c: shared rescue limit (C18), Phoenix Reactor revive, Accord, Atlas Bastion taunt (owner answers 2026-11-20). */
const approved: Record<string, [string, number][]> = {
  'infernic-phoenix-reactor': [['squad-hp', .11], ['revive', .35], ['revive-shield', .15]],
  'tranquilitic-accord-bastion': [['hp', .17], ['skill-efficiency', .2], ['accord-efficiency', .25]],
  'tectonic-atlas-bastion': [['taunt', 1], ['taunt-charge', 4]],
};

function gear(...ids: ConduitId[]): RadiantGear {
  return Array.from({ length: 8 }, (_, index) => ids[index] ? { id: ids[index], rank: 0 } : null);
}
function member(starter: RadiantBearerId, ids: ConduitId[] = []): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId: null, ascension: {}, gear: gear(...ids) };
}
function fixture(squad: [RadiantBearerId, ConduitId[]?][], seed = 0): RadiantCombatState {
  return createRadiantCombat(squad.map(([starter, ids]) => member(starter, ids)),
    ['enemy', 'enemy2'].map(id => ({ id, elementId: null, stats: { hp: 1000000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })),
    seed);
}
const act = (state: RadiantCombatState, action: RadiantCombatAction) => applyRadiantCombatAction(state, action);
const of = <T extends RadiantCombatEvent['type']>(events: RadiantCombatEvent[], type: T) =>
  events.filter((event): event is Extract<RadiantCombatEvent, { type: T }> => event.type === type);
const gauge = (state: RadiantCombatState, id: string) => state.gauge.members.find(entry => entry.id === id)!;
const unit = (state: RadiantCombatState, id: string) => state.bearers.find(entry => entry.loadout.id === id)!;
const signatures = (events: RadiantCombatEvent[], op: string) => of(events, 'signature').filter(event => event.op === op);
/** End the player turn (if needed) and let `enemy` hit `targets` once, with `hits` packets. */
function strike(state: RadiantCombatState, targets: string[], hits = 1, coefficient = 1) {
  if (state.phase === 'player') state = act(state, { type: 'end-turn' }).state;
  return act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: targets, coefficient, hits });
}
function finish(state: RadiantCombatState): RadiantCombatState {
  for (const id of ['enemy', 'enemy2']) if (!state.enemyActed.includes(id))
    state = act(state, { type: 'enemy-heal', enemyId: id, amount: 0 }).state;
  return act(state, { type: 'finish-enemy-phase' }).state;
}
/** Put a bearer one hit from defeat (no Shields, 1 Health). */
function brink(state: RadiantCombatState, id: string): RadiantCombatState {
  unit(state, id).hp = 1; unit(state, id).shields = [];
  return state;
}
function enemyFor(pattern?: { targeting: 'lowest' | 'highest' }): RadiantPressureEnemy {
  return { id: 'enemy', skills: [], ...(pattern ? { pattern } : {}) } as unknown as RadiantPressureEnemy;
}

describe('D-493 B3c restoration: approved designs', () => {
  it.each(Object.keys(approved))('%s matches the approved restore row at +0', id => {
    expect(radiantConduits[id as ConduitId].map(entry => [entry.kind, entry.amount])).toEqual(approved[id]);
  });
  it.each(Object.keys(approved))('%s has an exact tooltip with numbers', id => {
    const text = radiantConduitEffectText(id as ConduitId, 0);
    expect(text).toMatch(/[0-9]/);
    expect(text).not.toMatch(/undefined|NaN/);
  });
  it('scales values with rank; the taunt itself is fixed (C12)', () => {
    const at5 = (id: ConduitId, kind: string) => radiantConduitPrimitives({ id, rank: 5 }).find(entry => entry.kind === kind)!.amount;
    expect(at5('infernic-phoenix-reactor', 'revive')).toBeCloseTo(.525);
    expect(at5('infernic-phoenix-reactor', 'revive-shield')).toBeCloseTo(.225);
    expect(at5('tranquilitic-accord-bastion', 'accord-efficiency')).toBeCloseTo(.375);
    expect(at5('tectonic-atlas-bastion', 'taunt-charge')).toBeCloseTo(6);
    expect(at5('tectonic-atlas-bastion', 'taunt')).toBe(1);
    expect(radiantConduitEffectText('tranquilitic-accord-bastion')).toContain('rescue');
    expect(radiantConduitEffectText('infernic-phoenix-reactor')).toContain('rescue');
  });
});

describe('D-493 B3c: Phoenix Reactor revive', () => {
  it('revives once at 35% maximum Health with 0 Luminosity and Shields every other living ally', () => {
    let state = brink(fixture([['ember', ['infernic-phoenix-reactor']], ['crinso']]), 'ember');
    gauge(state, 'ember').charge = 50;
    unit(state, 'ember').buffs.push({ category: 'attack-up', source: { kind: 'skill', bearerId: 'ember' }, magnitude: .2, remaining: 2 });
    const hit = strike(state, ['ember']);
    const types = hit.events.map(event => event.type);
    expect(types.indexOf('defeated')).toBeLessThan(types.indexOf('revive'));
    state = hit.state;
    const ember = unit(state, 'ember'), crinso = unit(state, 'crinso');
    expect(ember.hp).toBe(Math.round(.35 * ember.stats.hp));
    expect(of(hit.events, 'revive')[0]).toMatchObject({ targetId: 'ember', amount: ember.hp,
      source: { kind: 'gear', bearerId: 'ember', conduitId: 'infernic-phoenix-reactor' } });
    expect(gauge(state, 'ember')).toMatchObject({ charge: 0, living: true });
    expect(ember.buffs).toEqual([]);
    expect(crinso.shields.find(layer => layer.source.kind === 'gear')?.remaining).toBe(Math.round(.15 * crinso.stats.hp));
    expect(state.rescued).toEqual(['ember']);
    expect(radiantImpactFrames(structuredClone(brink(fixture([['ember', ['infernic-phoenix-reactor']], ['crinso']]), 'ember')),
      hit.state, hit.events)).not.toHaveLength(0);
    // The rescue is used: the next defeat stands.
    state = brink(finish(state), 'ember');
    const second = strike(state, ['ember']);
    expect(of(second.events, 'revive')).toEqual([]);
    expect(unit(second.state, 'ember').hp).toBe(0);
  });
  it('keeps the encounter going when the wearer was the last bearer standing', () => {
    const hit = strike(brink(fixture([['ember', ['infernic-phoenix-reactor']]]), 'ember'), ['ember']);
    expect(hit.state.phase).toBe('enemy');
    expect(unit(hit.state, 'ember').hp).toBeGreaterThan(0);
  });
  it('removes the revived bearer from the rest of that attack (no further damage or hit Luminosity)', () => {
    const hit = strike(brink(fixture([['ember', ['infernic-phoenix-reactor']], ['crinso']]), 'ember'), ['ember'], 4);
    expect(of(hit.events, 'damage').filter(event => event.targetId === 'ember')).toHaveLength(1);
    expect(unit(hit.state, 'ember').hp).toBe(Math.round(.35 * unit(hit.state, 'ember').stats.hp));
    expect(gauge(hit.state, 'ember').charge).toBe(0);
  });
  it('does nothing for bearers without the Conduit', () => {
    const hit = strike(brink(fixture([['ember'], ['crinso']]), 'ember'), ['ember']);
    expect(of(hit.events, 'revive')).toEqual([]);
    expect(hit.state.rescued).toBeUndefined();
  });
});

describe('D-493 B3c: Accord and the shared rescue limit (C18)', () => {
  /** Ozriel wears Accord and shields every ally with Cathedral of Shards. Refusal is pre-spent unless `refusal` is set. */
  function accorded(squad: [RadiantBearerId, ConduitId[]?][], refusal = false): RadiantCombatState {
    let state = fixture([['ozriel', ['tranquilitic-accord-bastion']], ...squad]);
    gauge(state, 'ozriel').charge = 40;
    const cast = act(state, { type: 'skill', bearerId: 'ozriel', slot: 2 });
    state = cast.state;
    const own = unit(state, 'ozriel').signature;
    if (!refusal && own?.kind === 'refusal') own.spent = state.bearers.map(entry => entry.loadout.id);
    return state;
  }
  it("grants Accord to other allies the wearer's heal or Shield reaches, never to the wearer", () => {
    let state = fixture([['ozriel', ['tranquilitic-accord-bastion']], ['crinso'], ['ember']]);
    gauge(state, 'ozriel').charge = 40;
    const cast = act(state, { type: 'skill', bearerId: 'ozriel', slot: 2 });
    state = cast.state;
    expect(unit(state, 'crinso').accord).toBe('ozriel');
    expect(unit(state, 'ember').accord).toBe('ozriel');
    expect(unit(state, 'ozriel').accord).toBeUndefined();
    expect(signatures(cast.events, 'accord').map(event => event.holderId).sort()).toEqual(['crinso', 'ember']);
  });
  it('keeps the holder at 1 Health against a fatal direct hit and gives a next-skill Skill Efficiency bonus', () => {
    const state = brink(accorded([['crinso']]), 'crinso');
    const before = radiantSkillStats(state, 'crinso', 1).skillEfficiency;
    const hit = strike(state, ['crinso']);
    const crinso = unit(hit.state, 'crinso');
    expect(crinso.hp).toBe(1);
    expect(crinso.accord).toBeUndefined();
    expect(hit.state.rescued).toEqual(['crinso']);
    expect(crinso.tokens).toEqual([{ kind: 'accord-efficiency', giverId: 'ozriel', conduitId: 'tranquilitic-accord-bastion',
      value: .25, until: hit.state.round + 1 }]);
    expect(signatures(hit.events, 'accord-save')[0]).toMatchObject({ bearerId: 'ozriel', holderId: 'crinso', amount: 1 });
    const next = finish(hit.state);
    expect(radiantActionEfficiency(next, 'crinso', 1)).toBeCloseTo(before + .25);
    // Once per encounter: a later heal or Shield from the wearer grants no new Accord, and the next fatal hit stands.
    gauge(next, 'ozriel').charge = 40;
    const again = act(next, { type: 'skill', bearerId: 'ozriel', slot: 2 }).state;
    expect(unit(again, 'crinso').accord).toBeUndefined();
  });
  it("lets Ozriel's Refusal act first without using the rescue limit (O12)", () => {
    const hit = strike(brink(accorded([['crinso']], true), 'crinso'), ['crinso']);
    expect(signatures(hit.events, 'refusal')).toHaveLength(1);
    expect(signatures(hit.events, 'accord-save')).toEqual([]);
    expect(unit(hit.state, 'crinso').accord).toBe('ozriel');
    expect(hit.state.rescued).toBeUndefined();
  });
  it('needs the giver alive at the moment of the save', () => {
    const state = brink(accorded([['crinso']]), 'crinso');
    unit(state, 'ozriel').hp = 0; unit(state, 'ozriel').shields = []; gauge(state, 'ozriel').living = false;
    const hit = strike(state, ['crinso']);
    expect(unit(hit.state, 'crinso').hp).toBe(0);
    expect(hit.state.rescued).toBeUndefined();
  });
  it("an Accord save uses a Phoenix Reactor wearer's rescue, so its revive no longer fires", () => {
    let state = brink(accorded([['ember', ['infernic-phoenix-reactor']]]), 'ember');
    expect(unit(state, 'ember').accord).toBe('ozriel');
    state = strike(state, ['ember']).state;
    expect(unit(state, 'ember').hp).toBe(1);
    expect(state.rescued).toEqual(['ember']);
    state = brink(finish(state), 'ember');
    const second = strike(state, ['ember']);
    expect(of(second.events, 'revive')).toEqual([]);
    expect(unit(second.state, 'ember').hp).toBe(0);
  });
});

describe('D-493 B3c: Atlas Bastion taunt', () => {
  it('a Normal Attack taunts every enemy through the next enemy phase, overriding the weighted roll and Calamity targeting', () => {
    const state = act(fixture([['sprout', ['tectonic-atlas-bastion']], ['crinso'], ['ember']]),
      { type: 'normal', bearerId: 'sprout', targetId: 'enemy' }).state;
    expect(state.taunt).toBe('sprout');
    unit(state, 'crinso').hp = 5;
    for (const roll of [0, .5, .999]) {
      let draws = 0;
      const random = () => { draws++; return roll; };
      expect(radiantPressureEnemyAction(state, enemyFor(), random).targetIds).toEqual(['sprout']);
      expect(radiantPressureEnemyAction(state, enemyFor({ targeting: 'lowest' }), random).targetIds).toEqual(['sprout']);
      expect(draws).toBe(2);
    }
    const untaunted = structuredClone(state); delete untaunted.taunt;
    expect(radiantPressureEnemyAction(untaunted, enemyFor({ targeting: 'lowest' }), () => .5).targetIds).toEqual(['crinso']);
  });
  it('each enemy attack aimed at the taunter grants each other living ally 4 Luminosity; the taunt ends with the enemy phase', () => {
    let state = act(fixture([['sprout', ['tectonic-atlas-bastion']], ['crinso'], ['ember']]),
      { type: 'normal', bearerId: 'sprout', targetId: 'enemy' }).state;
    for (const id of ['crinso', 'ember']) gauge(state, id).charge = 0;
    unit(state, 'sprout').shields = [];
    const hit = strike(state, ['sprout']);
    const grants = of(hit.events, 'charge').filter(event => event.gearSource?.kind === 'gear' &&
      event.gearSource.conduitId === 'tectonic-atlas-bastion');
    expect(grants.map(event => [event.bearerId, event.personal])).toEqual([['crinso', 4], ['ember', 4]]);
    state = finish(hit.state);
    expect(state.taunt).toBeUndefined();
  });
  it('the latest taunt in the squad applies, and a defeated taunter stops taunting', () => {
    let state = fixture([['sprout', ['tectonic-atlas-bastion']], ['bruno', ['tectonic-atlas-bastion']]]);
    state = act(state, { type: 'normal', bearerId: 'sprout', targetId: 'enemy' }).state;
    state = act(state, { type: 'normal', bearerId: 'bruno', targetId: 'enemy' }).state;
    expect(state.taunt).toBe('bruno');
    const hit = strike(brink(state, 'bruno'), ['bruno']);
    expect(unit(hit.state, 'bruno').hp).toBe(0);
    expect(hit.state.taunt).toBeUndefined();
  });
});

describe('D-493 B3c: presentation', () => {
  it('tags Accord, a used rescue, the taunter and every taunted enemy; the glossary explains both rules', () => {
    const state = fixture([['ozriel', ['tranquilitic-accord-bastion']], ['ember', ['infernic-phoenix-reactor']], ['sprout', ['tectonic-atlas-bastion']]]);
    unit(state, 'ember').accord = 'ozriel'; state.rescued = ['sprout']; state.taunt = 'sprout';
    const view = radiantSignatureView(state);
    expect(view.bonuses.ember.join()).toMatch(/Accord Seraph Sanctuary · survives one fatal hit \(.*Ozriel.*\)/);
    expect(view.holders.sprout).toContain('Conduit rescue used');
    expect(view.owners.sprout.join()).toContain('Atlas Bastion · taunting all enemies');
    for (const id of ['enemy', 'enemy2']) expect(view.holders[id].join()).toBe(`Taunted · attacks ${characterName("sprout")}`);
    expect(radiantKitGlossary()).toContain('<dt>Rescue limit</dt>');
    expect(radiantKitGlossary()).toContain('<dt>Taunt</dt>');
  });
  it('callouts lead with the revival, the Accord save and the taunt', () => {
    const hit = strike(brink(fixture([['ember', ['infernic-phoenix-reactor']], ['crinso']]), 'ember'), ['ember']);
    const run = { state: hit.state } as unknown as FrozenRadiantRun;
    const revive = radiantConduitCallouts(hit.events.filter(event => event.type === 'revive'), run);
    expect(revive[0]).toMatchObject({ bearerId: 'ember', name: 'Phoenix Reactor' });
    expect(revive[0].text).toMatch(/^Revived · [0-9,]+ Health/);
    const taunt = act(fixture([['sprout', ['tectonic-atlas-bastion']]]), { type: 'normal', bearerId: 'sprout', targetId: 'enemy' });
    expect(radiantConduitCallouts(taunt.events, { state: taunt.state } as unknown as FrozenRadiantRun)
      .some(callout => callout.text.startsWith('Taunt · all enemies'))).toBe(true);
  });
});

describe('D-493 B3c: validation', () => {
  it('rejects forged Accord, rescue ledgers and taunts', () => {
    const state = fixture([['ozriel', ['tranquilitic-accord-bastion']], ['ember', ['infernic-phoenix-reactor']], ['sprout', ['tectonic-atlas-bastion']]]);
    const bad = (mutate: (copy: RadiantCombatState) => void) => {
      const copy = structuredClone(state); mutate(copy);
      return () => validateRadiantCombat(copy);
    };
    expect(bad(copy => { unit(copy, 'ember').accord = 'ozriel'; copy.rescued = ['sprout']; copy.taunt = 'sprout'; })).not.toThrow();
    expect(bad(copy => { unit(copy, 'ember').accord = 'sprout'; })).toThrow('Accord');
    expect(bad(copy => { unit(copy, 'ozriel').accord = 'ozriel'; })).toThrow('Accord');
    expect(bad(copy => { unit(copy, 'ember').accord = 'ozriel'; copy.rescued = ['ember']; })).toThrow('Accord');
    expect(bad(copy => { copy.rescued = []; })).toThrow('rescue');
    expect(bad(copy => { copy.rescued = ['ember', 'ember']; })).toThrow('rescue');
    expect(bad(copy => { copy.rescued = ['nobody']; })).toThrow('rescue');
    expect(bad(copy => { copy.taunt = 'ember'; })).toThrow('taunt');
    const plain = fixture([['crinso'], ['ember']]);
    plain.rescued = ['crinso'];
    expect(() => validateRadiantCombat(plain)).toThrow('rescue');
  });
  it('impact replay rejects a revival of a living bearer', () => {
    const before = brink(fixture([['ember', ['infernic-phoenix-reactor']], ['crinso']]), 'ember');
    const hit = strike(structuredClone(before), ['ember']);
    const forged = hit.events.filter(event => event.type !== 'defeated' && !(event.type === 'damage' && event.targetId === 'ember'));
    expect(() => radiantImpactFrames(before, hit.state, forged)).toThrow();
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
  while (run.state.phase === 'player' && actions.length < 1000) {
    const bearerId = run.state.bearers.find(entry => entry.hp > 0 && !run.state.acted.includes(entry.loadout.id))!.loadout.id;
    const targetId = run.state.enemies.find(entry => entry.hp > 0)!.id;
    const action: RadiantTurnAction = { type: 'normal', bearerId, targetId };
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
function storageWith(squad: string[]): MemoryStorage {
  const storage = new MemoryStorage(), account: Account = emptyAccount();
  account.squad = squad;
  squad.forEach(id => { account.characters[id as keyof Account['characters']] = { level: 0, evolution: 1, weaponRank: 0 }; });
  saveAccount(storage, account);
  return storage;
}

describe('save compatibility (standing requirement, 2026-11-20)', () => {
  it('reloads a settled journal written before B3c, accepts a revive event and rejects forged rescue state', async () => {
    const storage = storageWith(['elise', 'crinso']);
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const settled = await send(transport, { kind: 'settle', actions: play(started.run) });
    const snapshot = (run: FrozenRadiantRun) => ({ revision: 9,
      state: { profile: {}, starterId: 'ember', run: null, account: settled.account, radiantStudy: run } });
    expect(validateRadiantRunSnapshot(snapshot(settled.run)).state.radiantStudy).toEqual(settled.run);
    const id = settled.run.state.bearers[0].loadout.id;
    const revive: RadiantCombatEvent = { type: 'revive', targetId: id, amount: 10,
      source: { kind: 'gear', bearerId: id, conduitId: 'infernic-phoenix-reactor' } };
    const withRevive = structuredClone(settled.run);
    withRevive.journal.events.push(revive);
    expect(() => validateRadiantRunSnapshot(snapshot(withRevive))).not.toThrow();
    const badSource = structuredClone(settled.run);
    badSource.journal.events.push({ ...revive, source: { kind: 'skill', bearerId: id } } as unknown as RadiantCombatEvent);
    expect(() => validateRadiantRunSnapshot(snapshot(badSource))).toThrow('Invalid saved Radiant account');
    const badAmount = structuredClone(settled.run);
    badAmount.journal.events.push({ ...revive, amount: 0 });
    expect(() => validateRadiantRunSnapshot(snapshot(badAmount))).toThrow('Invalid saved Radiant account');
    const forged = structuredClone(settled.run);
    forged.state.rescued = [id];
    expect(() => validateRadiantRunSnapshot(snapshot(forged))).toThrow('Invalid saved Radiant account');
    const taunt = structuredClone(settled.run);
    taunt.state.taunt = id;
    expect(() => validateRadiantRunSnapshot(snapshot(taunt))).toThrow('Invalid saved Radiant account');
  });
  it('loads an encounter saved before B3c mid-run and settles it', async () => {
    const storage = storageWith(['elise', 'crinso']);
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const loaded = await transport.read();
    expect(loaded.notice).toBeUndefined();
    expect(loaded.run!.state.rescued).toBeUndefined();
    expect(loaded.run!.state.taunt).toBeUndefined();
    expect(loaded.run!.state.bearers.every(entry => entry.accord === undefined)).toBe(true);
    const settled = await send(transport, { kind: 'settle', actions: play(loaded.run!) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
  });
});
