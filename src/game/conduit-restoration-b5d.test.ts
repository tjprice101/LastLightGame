import { describe, expect, it } from 'vitest';
import { radiantMasters, type RadiantBearerId, type RadiantLoadout, type RadiantMasterId } from '../content/combat-kits';
import { radiantMasterClauseKinds } from '../content/conduit-effects';
import { radiantConduitDescription } from '../content/conduit-effect-text';
import {
  applyRadiantCombatAction, createRadiantCombat, effectiveRadiantStats, radiantMaximumHealth, radiantPendingActors,
  validateRadiantCombat, type RadiantCategoryEffect, type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState,
} from './combat-engine';
import { chooseRadiantPressureAction } from './enemy-pressure';
import { emptyAccount, saveAccount, type Account } from './account';
import { LocalRadiantTransport } from '../online/battle-local';
import {
  applyRadiantTurn, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantRunOperation, type RadiantRunRequest, type RadiantTurnAction,
} from '../online/battle-run';

/** D-493 B5d (approved plan, 2026-11-22): Master enemy-phase triggers, the Worldseed revive and Myrthen's chance rolls. */
const clauses: Record<string, string> = {
  'master-ember-1': 'burn-mend .25', 'master-sprout-3': 'seed-defense .25, worldseed-revive .35',
  'master-aurora-1': 'weaken-cut .25, weaken-ward .15', 'master-aurora-2': 'verdict-charge 8', 'master-aurora-3': 'weaken-mend .08',
  'master-bruno-1': 'cover-defense .4, cover-power .3', 'master-thornia-1': 'trap-cut .2', 'master-thornia-2': 'trap-ward .12',
  'master-thornia-3': 'trap-shelter .15, trap-power .2', 'master-orvella-2': 'foundation-store .4',
  'master-caldrex-2': 'recoil-strike .9', 'master-caldrex-3': 'burn-squad-mend .08',
  'master-solenne-3': 'stillness-charge 7, reverb-charge 3', 'master-myrthen-2': 'harvest-chance .1, ripen-health .05',
  'master-seravelle-2': 'burn-relay 5', 'master-ozriel-1': 'refusal-ward .2', 'master-caevren-3': 'watch-strike 1',
  'master-serapha-2': 'ceasefire-mend .12', 'master-serapha-3': 'weaken-relay 10',
};
const b5dKinds = radiantMasterClauseKinds.slice(radiantMasterClauseKinds.indexOf('burn-mend')) as readonly string[];
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
const enemyOf = (state: RadiantCombatState, id: string) => state.enemies.find(entry => entry.id === id)!;
const act = (state: RadiantCombatState, action: RadiantCombatAction) => applyRadiantCombatAction(state, action);
function only(state: RadiantCombatState, id: string): RadiantCombatState {
  for (const entry of state.gauge.members) entry.charge = entry.id === id ? 200 : 0;
  return state;
}
function wound(state: RadiantCombatState, id: string, fraction: number): RadiantCombatState {
  bearerOf(state, id).hp = Math.round(radiantMaximumHealth(state, id) * fraction);
  return state;
}
function defeat(state: RadiantCombatState, id: string): RadiantCombatState {
  bearerOf(state, id).hp = 0;
  state.gauge.members.find(entry => entry.id === id)!.living = false;
  return state;
}
type Restore = Extract<RadiantCombatEvent, { type: 'heal' | 'shield' }>;
function restores(events: RadiantCombatEvent[], giver: string, type: 'heal' | 'shield'): Record<string, number> {
  const out: Record<string, number> = {};
  for (const event of events) if (event.type === type && event.source.kind === 'master' && event.source.bearerId === giver)
    out[(event as Restore).targetId] = (out[(event as Restore).targetId] ?? 0) + (type === 'heal' ? (event as Extract<Restore, { type: 'heal' }>).offered : (event as Extract<Restore, { type: 'shield' }>).amount);
  return out;
}
function gains(events: RadiantCombatEvent[], giver: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const event of events) if (event.type === 'charge' && event.gearSource?.kind === 'master' && event.gearSource.bearerId === giver)
    out[event.bearerId] = (out[event.bearerId] ?? 0) + (event.gained ?? 0);
  return out;
}
const pct = (state: RadiantCombatState, id: string, fraction: number) => Math.round(fraction * bearerOf(state, id).stats.hp);
const burn = (bearerId: string, magnitude = 100): RadiantCategoryEffect<'burn'> =>
  ({ category: 'burn', source: { kind: 'skill', bearerId }, magnitude, remaining: 2 });
const weaken = (bearerId: string): RadiantCategoryEffect<'weaken'> =>
  ({ category: 'weaken', source: { kind: 'skill', bearerId }, magnitude: .2, remaining: 2 });
const attack = (state: RadiantCombatState, enemyId: string, targetId: string, coefficient = .01) =>
  act(state, { type: 'enemy-attack', enemyId, targetIds: [targetId], coefficient });
/** End the turn, let each living enemy attack `targetId`, then return the finish-enemy-phase result. */
function enemyPhase(state: RadiantCombatState, targetId: string, coefficient = .01) {
  let next = state.phase === 'player' ? act(state, { type: 'end-turn' }).state : state;
  const attacks: RadiantCombatEvent[][] = [];
  for (const target of next.enemies.filter(entry => entry.hp > 0)) {
    const result = attack(next, target.id, targetId, coefficient);
    attacks.push(result.events);
    next = result.state;
  }
  return { attacks, finish: act(next, { type: 'finish-enemy-phase' }) };
}
/** The Conduit stream's xorshift32 step (combat-engine `rollConduit`), to predict rolls exactly. */
function nextRoll(seed: number): { seed: number; roll: number } {
  let x = seed || 0x9e3779b9;
  x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
  return { seed: x, roll: x / 0x100000000 };
}
/** The first seed at or after `from` whose next roll satisfies `test`. */
function seedWhere(test: (roll: number) => boolean, from = 1): number {
  for (let seed = from; ; seed++) if (test(nextRoll(seed).roll)) return seed;
}

describe('D-493 B5d Master enemy-phase and special clauses: content', () => {
  it('adds the approved primitives to exactly the 19 B5d rows', () => {
    expect(Object.keys(clauses)).toHaveLength(19);
    for (const [id, master] of Object.entries(radiantMasters)) {
      const own = master.effects.filter(entry => b5dKinds.includes(entry.kind)).map(entry => [entry.kind, entry.amount]);
      expect(own, id).toEqual(clauses[id] ? parse(clauses[id]) : []);
    }
  });
  it('writes exact tooltips for every B5d kind', () => {
    for (const kind of b5dKinds) expect(radiantConduitDescription({ kind, amount: .25 } as never)).not.toMatch(/undefined|NaN/);
    expect(radiantMasters['master-ember-1'].effect).toContain('25% of that Health damage, up to 12% of their maximum Health');
    expect(radiantMasters['master-sprout-3'].effect).toContain('revives defeated allies with 35% of their maximum Health and 0 Luminosity');
    expect(radiantMasters['master-myrthen-2'].effect).toContain('5% chance to cost 15% of Myrthen');
  });
});

describe('D-493 B5d Master enemy-phase clauses: combat', () => {
  it('Helios Pyre Cathedral: Infernis\'s Burn ticks heal the most-wounded ally, capped; other Burns do not', () => {
    const state = wound(fixture([['ember', 'master-ember-1'], ['tide']]), 'tide', .3);
    enemyOf(state, 'enemy').debuffs.push(burn('ember', 400));
    const { finish } = enemyPhase(state, 'ember');
    const ticked = finish.events.reduce((sum, event) => event.type === 'damage' && event.origin === 'periodic' ? sum + event.healthLoss : sum, 0);
    expect(ticked).toBeGreaterThan(0);
    expect(restores(finish.events, 'ember', 'heal')).toEqual({ tide: Math.round(Math.min(.25 * ticked, .12 * bearerOf(state, 'tide').stats.hp)) });
    const other = wound(fixture([['ember', 'master-ember-1'], ['tide']]), 'tide', .3);
    enemyOf(other, 'enemy').debuffs.push(burn('tide', 400));
    expect(restores(enemyPhase(other, 'ember').finish.events, 'ember', 'heal')).toEqual({});
  });
  it('Evergreen Continuance Crucible: an Empowered Seed holder has Defense Up until it blooms', () => {
    const state = fixture([['sprout', 'master-sprout-3'], ['tide']]);
    const before = effectiveRadiantStats(state, 'tide').defense;
    bearerOf(state, 'tide').seed = { casterId: 'sprout', value: .1, empowered: true };
    expect(effectiveRadiantStats(state, 'tide').defense).toBeCloseTo(before * 1.25, 6);
    bearerOf(state, 'tide').seed = { casterId: 'sprout', value: .1 };
    expect(effectiveRadiantStats(state, 'tide').defense).toBeCloseTo(before, 6);
  });
  it('Evergreen Continuance Crucible: Worldseed revives defeated allies once per encounter on the shared rescue ledger', () => {
    const state = only(defeat(fixture([['sprout', 'master-sprout-3'], ['tide'], ['ember']]), 'tide'), 'sprout');
    const cast = act(state, { type: 'flare', bearerId: 'sprout' });
    const revive = cast.events.find(event => event.type === 'revive');
    expect(revive).toMatchObject({ targetId: 'tide', source: { kind: 'master', bearerId: 'sprout' }, amount: pct(state, 'tide', .35) });
    const tide = bearerOf(cast.state, 'tide');
    expect(tide.hp).toBe(pct(state, 'tide', .35));
    expect(tide.seed).toBeNull();
    expect(cast.state.gauge.members.find(entry => entry.id === 'tide')).toMatchObject({ living: true, charge: 0 });
    expect(cast.state.rescued).toEqual(['tide']);
    expect(cast.state.acted).toContain('tide');
    expect(bearerOf(cast.state, 'sprout').masterUsed).toBe(true);
    // Used once: a later Worldseed revives nobody.
    const later = only(defeat(structuredClone(cast.state), 'ember'), 'sprout');
    later.acted = []; later.skilled = [];
    expect(act(later, { type: 'flare', bearerId: 'sprout' }).events.some(event => event.type === 'revive')).toBe(false);
  });
  it('Evergreen Continuance Crucible: with nobody to revive (or a rescue already used) the revive is kept', () => {
    const none = act(only(fixture([['sprout', 'master-sprout-3'], ['tide']]), 'sprout'), { type: 'flare', bearerId: 'sprout' });
    expect(bearerOf(none.state, 'sprout').masterUsed).toBeUndefined();
    const rescued = only(defeat(fixture([['sprout', 'master-sprout-3'], ['tide'], ['ember']]), 'tide'), 'sprout');
    rescued.rescued = ['tide'];
    validateRadiantCombat(rescued);
    const cast = act(rescued, { type: 'flare', bearerId: 'sprout' });
    expect(cast.events.some(event => event.type === 'revive')).toBe(false);
    expect(bearerOf(cast.state, 'sprout').masterUsed).toBeUndefined();
    const forged = fixture([['sprout', 'master-sprout-1'], ['tide']]);
    bearerOf(forged, 'sprout').masterUsed = true;
    expect(() => validateRadiantCombat(forged)).toThrow('Invalid radiant Master ledger.');
  });
  it('Final Dawn Tribunal: Aurora\'s Weaken cuts Defense; an attack by such an enemy shields the lowest ally', () => {
    const plain = fixture([['aurora'], ['tide']]), cut = fixture([['aurora', 'master-aurora-1'], ['tide']]);
    for (const state of [plain, cut]) enemyOf(state, 'enemy').debuffs.push(weaken('aurora'));
    const damage = (state: RadiantCombatState) => (act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy' }).events
      .find(event => event.type === 'damage') as Extract<RadiantCombatEvent, { type: 'damage' }>).offered;
    expect(damage(cut)).toBeGreaterThan(damage(plain));
    const state = wound(cut, 'tide', .3);
    const { attacks } = enemyPhase(state, 'aurora');
    expect(restores(attacks[0], 'aurora', 'shield')).toEqual({ tide: pct(state, 'tide', .15) });
    expect(restores(attacks[1], 'aurora', 'shield')).toEqual({});
  });
  it('Prismseal Astral Judiciary: after an enemy phase under Final Dawn Verdict each living ally gains Luminosity', () => {
    const state = only(fixture([['aurora', 'master-aurora-2'], ['tide']]), 'aurora');
    const cast = act(state, { type: 'flare', bearerId: 'aurora' }).state;
    for (const entry of cast.gauge.members) entry.charge = 0;
    expect(gains(enemyPhase(cast, 'tide').finish.events, 'aurora')).toEqual({ aurora: 8, tide: 8 });
    const idle = only(fixture([['aurora', 'master-aurora-2'], ['tide']]), 'aurora');
    for (const entry of idle.gauge.members) entry.charge = 0;
    expect(gains(enemyPhase(idle, 'tide').finish.events, 'aurora')).toEqual({});
  });
  it('Merciful Eclipse Regulator: an attack by an enemy carrying Aurora\'s Weaken heals every living ally', () => {
    const state = wound(wound(fixture([['aurora', 'master-aurora-3'], ['tide']]), 'tide', .3), 'aurora', .5);
    enemyOf(state, 'enemy').debuffs.push(weaken('aurora'));
    const { attacks } = enemyPhase(state, 'tide');
    expect(restores(attacks[0], 'aurora', 'heal')).toEqual({ aurora: pct(state, 'aurora', .08), tide: pct(state, 'tide', .08) });
    expect(restores(attacks[1], 'aurora', 'heal')).toEqual({});
  });
  it('Living Worldwall Atlas: Defense Up while Cover is on an ally; redirected damage gives the protected ally a bonus', () => {
    const state = fixture([['bruno', 'master-bruno-1'], ['tide']]);
    const before = effectiveRadiantStats(state, 'bruno').defense;
    bearerOf(state, 'tide').cover = { casterId: 'bruno', share: .5, remaining: 2 };
    expect(effectiveRadiantStats(state, 'bruno').defense).toBeCloseTo(before * 1.4, 6);
    const { attacks } = enemyPhase(state, 'tide', 1);
    expect(attacks[0].some(event => event.type === 'damage' && event.targetId === 'bruno' && event.redirected)).toBe(true);
  });
  it('Living Worldwall Atlas: the protected ally holds a next-skill Skill Power bonus credited to the Master', () => {
    let state = fixture([['bruno', 'master-bruno-1'], ['tide']]);
    bearerOf(state, 'tide').cover = { casterId: 'bruno', share: .5, remaining: 2 };
    state = act(state, { type: 'end-turn' }).state;
    state = attack(state, 'enemy', 'tide', 1).state;
    expect(bearerOf(state, 'tide').tokens).toEqual([expect.objectContaining({ kind: 'cover-power', giverId: 'bruno', masterId: 'master-bruno-1', value: .3 })]);
  });
  it('Forbidden Garden Worldlock: a triggered trap cuts that enemy\'s Defense through the next player turn', () => {
    let state = fixture([['thornia', 'master-thornia-1'], ['tide']]);
    bearerOf(state, 'thornia').signature = { kind: 'thorns', traps: [{ enemyId: 'enemy', charges: 3, remaining: 3, value: .6 }] };
    state = act(state, { type: 'end-turn' }).state;
    const hit = attack(state, 'enemy', 'tide');
    expect(enemyOf(hit.state, 'enemy').trapCut).toEqual({ casterId: 'thornia' });
    expect(hit.events.some(event => event.type === 'signature' && event.op === 'trap-cut')).toBe(true);
    state = attack(hit.state, 'enemy2', 'tide').state;
    state = act(state, { type: 'finish-enemy-phase' }).state;
    expect(enemyOf(state, 'enemy').trapCut).toEqual({ casterId: 'thornia' });
    state = act(state, { type: 'end-turn' }).state;
    expect(enemyOf(state, 'enemy').trapCut).toBeUndefined();
    const forged = fixture([['thornia'], ['tide']]);
    enemyOf(forged, 'enemy').trapCut = { casterId: 'thornia' };
    expect(() => validateRadiantCombat(forged)).toThrow('Invalid radiant Thorn Trap cut.');
  });
  it('Thousand-Rose Planetary Aegis: an Empowered trap shields the allies its enemy hit; a plain trap does not', () => {
    const run = (empowered: boolean) => {
      let state = fixture([['thornia', 'master-thornia-2'], ['tide']]);
      bearerOf(state, 'thornia').signature = { kind: 'thorns',
        traps: [{ enemyId: 'enemy', charges: 3, remaining: 3, value: .6, ...(empowered ? { empowered: true as const } : {}) }] };
      validateRadiantCombat(state);
      state = act(state, { type: 'end-turn' }).state;
      return { state, events: act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['tide', 'thornia'], coefficient: .01 }).events };
    };
    const empowered = run(true);
    expect(restores(empowered.events, 'thornia', 'shield')).toEqual({ thornia: pct(empowered.state, 'thornia', .12), tide: pct(empowered.state, 'tide', .12) });
    expect(restores(run(false).events, 'thornia', 'shield')).toEqual({});
  });
  it('Thornia\'s Thousand-Rose Dominion places Empowered traps', () => {
    const cast = act(only(fixture([['thornia'], ['tide']]), 'thornia'), { type: 'flare', bearerId: 'thornia' });
    const own = bearerOf(cast.state, 'thornia').signature;
    expect(own?.kind === 'thorns' && own.traps.every(trap => trap.empowered === true)).toBe(true);
  });
  it('Shadow Rose Sovereign Foundry: trapped enemies deal 15% less direct damage; a trigger gives Thornia a bonus', () => {
    const offered = (masterId?: RadiantMasterId) => {
      let state = fixture([['thornia', masterId], ['tide']]);
      bearerOf(state, 'thornia').signature = { kind: 'thorns', traps: [{ enemyId: 'enemy', charges: 3, remaining: 3, value: .6 }] };
      state = act(state, { type: 'end-turn' }).state;
      const result = attack(state, 'enemy', 'tide', 2);
      return { result, damage: result.events.find(event => event.type === 'damage' && event.targetId === 'tide') as Extract<RadiantCombatEvent, { type: 'damage' }> };
    };
    const plain = offered(), sheltered = offered('master-thornia-3');
    expect(sheltered.damage.offered).toBeLessThan(plain.damage.offered);
    expect(sheltered.damage.offered).toBeCloseTo(plain.damage.offered * .85, -1);
    expect(bearerOf(sheltered.result.state, 'thornia').tokens).toEqual([expect.objectContaining({ kind: 'trap-power', value: .2, masterId: 'master-thornia-3' })]);
  });
  it('Deep Foundation Planetpress: 40% of Foundation-absorbed damage is stored and heals injured allies at the next turn', () => {
    let state = wound(fixture([['orvella', 'master-orvella-2'], ['tide']]), 'orvella', .6);
    bearerOf(state, 'orvella').signature = { kind: 'foundation', foundation: { durability: 5000, max: 5000, remaining: 3 } };
    state = act(state, { type: 'end-turn' }).state;
    const hit = attack(state, 'enemy', 'tide', 3);
    const absorbed = 5000 - (bearerOf(hit.state, 'orvella').signature as { foundation: { durability: number } }).foundation.durability;
    expect(absorbed).toBeGreaterThan(0);
    const stored = Math.round(absorbed * .4);
    expect(bearerOf(hit.state, 'orvella').foundationStored).toBe(stored);
    state = attack(hit.state, 'enemy2', 'orvella', .01).state;
    const total = bearerOf(state, 'orvella').foundationStored!;
    const injured = state.bearers.filter(ally => ally.hp > 0 && ally.hp < radiantMaximumHealth(state, ally.loadout.id));
    const finish = act(state, { type: 'finish-enemy-phase' });
    expect(bearerOf(finish.state, 'orvella').foundationStored).toBeUndefined();
    const healed = restores(finish.events, 'orvella', 'heal');
    for (const ally of injured)
      expect(healed[ally.loadout.id]).toBe(Math.round(Math.min(total / injured.length, .12 * ally.stats.hp)));
    const forged = fixture([['orvella'], ['tide']]);
    bearerOf(forged, 'orvella').foundationStored = 10;
    expect(() => validateRadiantCombat(forged)).toThrow('Invalid radiant Foundation store.');
  });
  it('Counterstroke Recoil Foundry and Falling-Star Recoil Turbine: strikes back (Caevren once per enemy phase)', () => {
    const strikes = (events: RadiantCombatEvent[], id: string) => events.filter(event =>
      event.type === 'damage' && event.source.kind === 'master' && event.source.bearerId === id && event.offered > 0).length;
    const caldrex = enemyPhase(fixture([['caldrex', 'master-caldrex-2'], ['tide']]), 'caldrex');
    expect(caldrex.attacks.map(events => strikes(events, 'caldrex'))).toEqual([1, 1]);
    const caevren = enemyPhase(fixture([['caevren', 'master-caevren-3'], ['tide']]), 'caevren');
    expect(caevren.attacks.map(events => strikes(events, 'caevren'))).toEqual([1, 0]);
    // A strike never chains into other triggers (Conduit-generated): the attacked tide does not provoke Caldrex.
    expect(enemyPhase(fixture([['caldrex', 'master-caldrex-2'], ['tide']]), 'tide').attacks.map(events => strikes(events, 'caldrex'))).toEqual([0, 0]);
  });
  it('Cinderpulse Triage Converter and Convoy-Flame Distribution Crown: an ability Burn tick heals the squad / fills the others', () => {
    const heal = wound(fixture([['caldrex', 'master-caldrex-3'], ['tide']]), 'tide', .5);
    enemyOf(heal, 'enemy').debuffs.push(burn('tide'));
    enemyOf(heal, 'enemy2').debuffs.push(burn('tide'));
    const healed = restores(enemyPhase(heal, 'caldrex').finish.events, 'caldrex', 'heal');
    expect(healed).toEqual({ caldrex: expect.any(Number), tide: pct(heal, 'tide', .08) });
    const fill = fixture([['seravelle', 'master-seravelle-2'], ['tide']]);
    enemyOf(fill, 'enemy').debuffs.push(burn('tide'));
    const end = act(fill, { type: 'end-turn' }).state;
    let next = attack(end, 'enemy', 'seravelle').state;
    next = attack(next, 'enemy2', 'seravelle').state;
    for (const entry of next.gauge.members) entry.charge = 0;
    expect(gains(act(next, { type: 'finish-enemy-phase' }).events, 'seravelle')).toEqual({ tide: 5 });
  });
  it('Cadence Differential Drive: a spent Stillness fills the squad once per enemy phase; The Last Reverberation fills per Stillness', () => {
    let state = fixture([['solenne', 'master-solenne-3'], ['tide']]);
    bearerOf(state, 'solenne').signature = { kind: 'stillness', count: 3, latch: false };
    state = act(state, { type: 'end-turn' }).state;
    for (const entry of state.gauge.members) entry.charge = 0;
    const first = attack(state, 'enemy', 'solenne');
    expect(gains(first.events, 'solenne')).toEqual({ solenne: 7, tide: 7 });
    expect(gains(attack(first.state, 'enemy2', 'solenne').events, 'solenne')).toEqual({});
    const flare = only(fixture([['solenne', 'master-solenne-3'], ['tide']]), 'solenne');
    bearerOf(flare, 'solenne').signature = { kind: 'stillness', count: 3, latch: false };
    expect(gains(act(flare, { type: 'flare', bearerId: 'solenne' }).events, 'solenne').tide).toBe(9);
  });
  it('Refusal Sovereign Heartdrive: an ally Refusal keeps at 1 Health also gains a Shield', () => {
    let state = fixture([['ozriel', 'master-ozriel-1'], ['tide']]);
    state = act(state, { type: 'end-turn' }).state;
    bearerOf(state, 'tide').hp = 1;
    const hit = attack(state, 'enemy', 'tide', 1);
    expect(hit.events.some(event => event.type === 'signature' && event.op === 'refusal')).toBe(true);
    expect(restores(hit.events, 'ozriel', 'shield')).toEqual({ tide: pct(state, 'tide', .2) });
  });
  it('Articulated Mercy Fanforge: Serapha\'s Damage Reduction heals the holder once per ally per enemy phase', () => {
    const state = wound(fixture([['serapha', 'master-serapha-2'], ['tide']]), 'tide', .5);
    bearerOf(state, 'tide').buffs.push({ category: 'reduction', source: { kind: 'skill', bearerId: 'serapha' }, magnitude: .2, remaining: 1 });
    const { attacks } = enemyPhase(state, 'tide');
    expect(restores(attacks[0], 'serapha', 'heal')).toEqual({ tide: pct(state, 'tide', .12) });
    expect(restores(attacks[1], 'serapha', 'heal')).toEqual({});
  });
  it('Unstruck Verdict Concordance: an attack by an enemy carrying Serapha\'s Weaken fills the lowest ally once per enemy phase', () => {
    const state = wound(fixture([['serapha', 'master-serapha-3'], ['tide']]), 'tide', .3);
    enemyOf(state, 'enemy').debuffs.push(weaken('serapha'));
    enemyOf(state, 'enemy2').debuffs.push(weaken('serapha'));
    for (const entry of state.gauge.members) entry.charge = 0;
    const { attacks } = enemyPhase(state, 'serapha');
    expect(gains(attacks[0], 'serapha')).toEqual({ tide: 10 });
    expect(gains(attacks[1], 'serapha')).toEqual({});
  });
});

describe('D-493 B5d Seedtrace Pursuit Distributor: Conduit-stream rolls', () => {
  it('the Conduit stream exists exactly when the Master is equipped', () => {
    expect(fixture([['myrthen', 'master-myrthen-2'], ['tide']]).conduitSeed).toBeTypeOf('number');
    expect(fixture([['myrthen', 'master-myrthen-1'], ['tide']]).conduitSeed).toBeUndefined();
  });
  it('after a skill outside Harvest, one roll below 10% enters Harvest; other streams are untouched', () => {
    const run = (seed: number) => {
      const state = only(fixture([['myrthen', 'master-myrthen-2'], ['tide']]), 'myrthen');
      state.conduitSeed = seed;
      return { state, cast: act(state, { type: 'skill', bearerId: 'myrthen', slot: 1, targetId: 'enemy' }) };
    };
    const lucky = run(seedWhere(roll => roll < .1)), plain = run(seedWhere(roll => roll >= .1));
    expect(lucky.cast.state.conduitSeed).toBe(nextRoll(lucky.state.conduitSeed!).seed);
    expect((bearerOf(lucky.cast.state, 'myrthen').signature as { count: number }).count).toBe(2);
    expect((bearerOf(plain.cast.state, 'myrthen').signature as { count: number }).count).toBe(1);
    expect(lucky.cast.state.chargeSeed).toBe(plain.cast.state.chargeSeed);
    // Already in Harvest after the cast: no roll is drawn.
    const harvest = only(fixture([['myrthen', 'master-myrthen-2'], ['tide']]), 'myrthen');
    bearerOf(harvest, 'myrthen').signature = { kind: 'season', count: 1, latch: false };
    const seed = harvest.conduitSeed;
    expect(act(harvest, { type: 'skill', bearerId: 'myrthen', slot: 1, targetId: 'enemy' }).state.conduitSeed).toBe(seed);
  });
  it('All That Ripens: a roll below 5% costs 15% of maximum Health instead of Luminosity, never defeating her', () => {
    const cast = (seed: number, hp?: number) => {
      const state = only(fixture([['myrthen', 'master-myrthen-2'], ['tide']]), 'myrthen');
      bearerOf(state, 'myrthen').signature = { kind: 'season', count: 2, latch: false };
      state.conduitSeed = seed;
      if (hp !== undefined) bearerOf(state, 'myrthen').hp = hp;
      return { state, result: act(state, { type: 'flare', bearerId: 'myrthen', targetId: 'enemy' }) };
    };
    const lucky = cast(seedWhere(roll => roll < .05));
    const cost = pct(lucky.state, 'myrthen', .15);
    expect(lucky.result.events).toContainEqual(expect.objectContaining({ type: 'signature', op: 'ripen-health', amount: cost }));
    expect(lucky.result.events.find(event => event.type === 'flare')).not.toHaveProperty('cost');
    const charge = (state: RadiantCombatState) => state.gauge.members.find(entry => entry.id === 'myrthen')!.charge;
    expect(charge(lucky.result.state)).toBeGreaterThanOrEqual(200);
    expect(bearerOf(lucky.result.state, 'myrthen').hp).toBeLessThanOrEqual(bearerOf(lucky.state, 'myrthen').hp - cost +
      pct(lucky.state, 'myrthen', 1));
    const plain = cast(seedWhere(roll => roll >= .05));
    expect(plain.result.events.some(event => event.type === 'signature' && event.op === 'ripen-health')).toBe(false);
    expect(charge(plain.result.state)).toBeLessThan(200);
    // The Health cost would defeat her: she pays Luminosity.
    const low = cast(seedWhere(roll => roll < .05), pct(lucky.state, 'myrthen', .15));
    expect(low.result.events.some(event => event.type === 'signature' && event.op === 'ripen-health')).toBe(false);
    expect(charge(low.result.state)).toBeLessThan(200);
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

describe('B5d save compatibility (standing requirement, 2026-11-20)', () => {
  const masters: Record<string, RadiantMasterId> = { myrthen: 'master-myrthen-2', thornia: 'master-thornia-2', aurora: 'master-aurora-1' };
  it('settles and reloads a journal with B5d Masters equipped', async () => {
    const transport = new LocalRadiantTransport(storageWith(['myrthen', 'thornia', 'aurora'], masters), () => 'myrthen');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    expect(started.run.state.conduitSeed).toBeTypeOf('number');
    const settled = await send(transport, { kind: 'settle', actions: play(started.run) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
    const snapshot = { revision: 9, state: { profile: {}, starterId: 'myrthen', run: null, account: settled.account, radiantStudy: settled.run } };
    expect(validateRadiantRunSnapshot(snapshot).state.radiantStudy).toEqual(settled.run);
  });
  it('loads an encounter with B5d Masters equipped mid-run and settles it', async () => {
    const transport = new LocalRadiantTransport(storageWith(['myrthen', 'thornia', 'aurora'], masters), () => 'myrthen');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const loaded = await transport.read();
    expect(loaded.notice).toBeUndefined();
    const settled = await send(transport, { kind: 'settle', actions: play(loaded.run!) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
  });
});
