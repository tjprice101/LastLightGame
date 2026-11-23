import { describe, expect, it } from 'vitest';
import type { ConduitId } from '../content/conduits';
import { radiantConduitPrimitives, radiantConduits, type RadiantGear } from '../content/conduit-effects';
import { radiantConduitEffectText } from '../content/conduit-effect-text';
import { type RadiantBearerId, type RadiantLoadout } from '../content/combat-kits';
import { personalChargeMaximum } from './combat-gauge';
import {
  applyRadiantCombatAction, createRadiantCombat, effectiveRadiantStats, radiantLoadoutSkillStats, radiantMaximumHealth,
  radiantPendingActors, radiantSkillStats, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState,
} from './combat-engine';
import { runRadiantPressure, chooseRadiantPressureAction } from './enemy-pressure';
import { radiantSignatureView } from '../presentation/battle-signatures';
import { radiantConduitCallouts } from '../presentation/battle-conduit-contribution';
import { radiantKitGlossary } from '../presentation/character-combat';
import { emptyAccount, saveAccount, type Account } from './account';
import { LocalRadiantTransport } from '../online/battle-local';
import {
  applyRadiantTurn, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantRunOperation, type RadiantRunRequest, type RadiantTurnAction,
} from '../online/battle-run';

/** D-493 batch B4: the 14 Calamitic Conduits and G12 (owner answers 2026-11-21: the turn waits for affordable borrowed skills;
 * allies who used Convergent Light this turn are eligible). */
const approved: Record<string, [string, number][]> = {
  'calamitic-aegis-engine-of-severed-fate': [['skill-power', .5], ['shield-guard', .367]],
  'calamitic-bulwark-of-the-last-horizon': [['hp', .4], ['defense', .4], ['shield-guard', .167]],
  'calamitic-cathedral-final-equation': [['skill-efficiency', .65], ['crit-rate', 2.5], ['crit-damage', 1.2]],
  'calamitic-causality-funeral-engine': [['skill-efficiency', .5], ['flare', 1.25]],
  'calamitic-choir-array-of-branded-stars': [['hp', .093], ['defense', .093], ['mark-team-power', .333], ['mark-team-charge', 6.7]],
  'calamitic-heartforge-of-the-sunless-dawn': [['hp', .667], ['skill-power', .167]],
  'calamitic-horizon-cleaving-godpress': [['defense', .15], ['skill-pierce', .55]],
  'calamitic-monolith-of-the-unmoved-star': [['defense', .667], ['skill-efficiency', .1]],
  'calamitic-reliquary-of-unending-mercy': [['restore-power', .833], ['restore-efficiency', .233]],
  'calamitic-ruinmark-censer': [['defense', .1], ['skill-power', .4], ['weaken-vulnerability', .1]],
  'calamitic-throne-borrowed-tomorrows': [['hp', .09], ['defense', .09], ['flare-extra-skill', 1]],
  'calamitic-throne-of-the-lone-apostate': [['lone-defense', .333], ['lone-hp', .333], ['lone-power', .833]],
  'calamitic-world-eater-orrery': [['skill-duration', 3], ['debuff-power', 1.25]],
  'calamitic-worldbreaker-cannonade': [['aoe-power', 1.667]],
};
const THRONE: ConduitId = 'calamitic-throne-borrowed-tomorrows';
const CHOIR: ConduitId = 'calamitic-choir-array-of-branded-stars';
const RUIN: ConduitId = 'calamitic-ruinmark-censer';

function gear(...ids: ConduitId[]): RadiantGear {
  return Array.from({ length: 8 }, (_, index) => ids[index] ? { id: ids[index], rank: 0 } : null);
}
function member(starter: RadiantBearerId, ids: ConduitId[] = []): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId: null, ascension: {}, gear: gear(...ids) };
}
function fixture(squad: [RadiantBearerId, ConduitId[]?][], seed = 0): RadiantCombatState {
  return createRadiantCombat(squad.map(([starter, ids]) => member(starter, ids)),
    ['enemy', 'enemy2'].map(id => ({ id, elementId: null, stats: { hp: 1000000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })),
    seed, false);
}
const act = (state: RadiantCombatState, action: RadiantCombatAction) => applyRadiantCombatAction(state, action);
const of = <T extends RadiantCombatEvent['type']>(events: RadiantCombatEvent[], type: T) =>
  events.filter((event): event is Extract<RadiantCombatEvent, { type: T }> => event.type === type);
const gauge = (state: RadiantCombatState, id: string) => state.gauge.members.find(entry => entry.id === id)!;
const unit = (state: RadiantCombatState, id: string) => state.bearers.find(entry => entry.loadout.id === id)!;
const signatures = (events: RadiantCombatEvent[], op: string) => of(events, 'signature').filter(event => event.op === op);
const fill = (state: RadiantCombatState, id: string, charge?: number) => {
  gauge(state, id).charge = charge ?? personalChargeMaximum(gauge(state, id));
  return state;
};
const normal = (state: RadiantCombatState, id: string) => act(state, { type: 'normal', bearerId: id, targetId: 'enemy' });
/** Convergent Light, with the current target when that bearer's Convergent Light takes one. */
function flare(state: RadiantCombatState, id: string) {
  try { return act(state, { type: 'flare', bearerId: id, targetId: 'enemy' }); }
  catch { return act(state, { type: 'flare', bearerId: id }); }
}
function skill(state: RadiantCombatState, id: string, slot: 1 | 2) {
  try { return act(state, { type: 'skill', bearerId: id, slot, targetId: 'enemy' }); }
  catch (error) {
    if (!(error instanceof Error) || !/authored target/.test(error.message)) throw error;
    return act(state, { type: 'skill', bearerId: id, slot });
  }
}
function finish(state: RadiantCombatState): RadiantCombatState {
  for (const id of ['enemy', 'enemy2']) if (!state.enemyActed.includes(id))
    state = act(state, { type: 'enemy-heal', enemyId: id, amount: 0 }).state;
  return act(state, { type: 'finish-enemy-phase' }).state;
}

describe('D-493 B4 restoration: approved designs', () => {
  it.each(Object.keys(approved))('%s matches the approved restore row at +0', id => {
    expect(radiantConduits[id as ConduitId].map(entry => [entry.kind, entry.amount])).toEqual(approved[id]);
  });
  it.each(Object.keys(approved))('%s has an exact tooltip with numbers', id => {
    const text = radiantConduitEffectText(id as ConduitId, 5);
    expect(text).toMatch(/[0-9]/);
    expect(text).not.toMatch(/undefined|NaN/);
  });
  it('applies C12 rank rules: Causality +2% per rank, fixed Skill Duration and extra skill, scaled values elsewhere', () => {
    const at5 = (id: ConduitId, kind: string) => radiantConduitPrimitives({ id, rank: 5 }).find(entry => entry.kind === kind)!.amount;
    expect(at5('calamitic-causality-funeral-engine', 'skill-efficiency')).toBeCloseTo(.6);
    expect(at5('calamitic-causality-funeral-engine', 'flare')).toBeCloseTo(1.875);
    expect(at5('calamitic-world-eater-orrery', 'skill-duration')).toBe(3);
    expect(at5('calamitic-world-eater-orrery', 'debuff-power')).toBeCloseTo(1.875);
    expect(at5(THRONE, 'flare-extra-skill')).toBe(1);
    expect(at5(THRONE, 'hp')).toBeCloseTo(.135);
    expect(at5(CHOIR, 'mark-team-charge')).toBeCloseTo(10.05);
    expect(at5('calamitic-cathedral-final-equation', 'crit-rate')).toBeCloseTo(3.75);
  });
  it('keeps Skill Efficiency within the 50% discount cap (Causality at +5)', () => {
    const loadout = { ...member('crinso'), gear: [{ id: 'calamitic-causality-funeral-engine' as ConduitId, rank: 5 }, ...Array(7).fill(null)] };
    expect(radiantLoadoutSkillStats(loadout, 1).skillEfficiency).toBeCloseTo(.6);
    const state = createRadiantCombat([loadout], [{ id: 'enemy', elementId: null, stats: { hp: 1000, attack: 1, defense: 1, recovery: 0 }, currencyBudget: 0 }], 0);
    fill(state, 'crinso', 40);
    const cast = skill(state, 'crinso', 2);
    expect(of(cast.events, 'skill')[0].cost).toBe(20);
  });
});

describe('D-493 B4: stat rows', () => {
  it('Throne of the Lone Apostate applies only to a one-bearer squad', () => {
    const alone = fixture([['crinso', ['calamitic-throne-of-the-lone-apostate']]]);
    const squad = fixture([['crinso', ['calamitic-throne-of-the-lone-apostate']], ['ember']]);
    expect(radiantMaximumHealth(alone, 'crinso')).toBe(Math.round(unit(alone, 'crinso').stats.hp * 1.333));
    expect(radiantMaximumHealth(squad, 'crinso')).toBe(Math.round(unit(squad, 'crinso').stats.hp));
    expect(unit(alone, 'crinso').hp).toBe(radiantMaximumHealth(alone, 'crinso'));
    expect(effectiveRadiantStats(alone, 'crinso').defense).toBeCloseTo(effectiveRadiantStats(squad, 'crinso').defense * 1.333);
    expect(radiantSkillStats(alone, 'crinso', 1).skillPower - radiantSkillStats(squad, 'crinso', 1).skillPower).toBeCloseTo(.833);
    expect(() => validateRadiantCombat(alone)).not.toThrow();
  });
  it('Reliquary of Unending Mercy adds Skill Power and Skill Efficiency only on heal/Shield slots', () => {
    const loadout = member('sprout', ['calamitic-reliquary-of-unending-mercy']);
    const base = member('sprout');
    expect(radiantLoadoutSkillStats(loadout, 2).skillEfficiency - radiantLoadoutSkillStats(base, 2).skillEfficiency).toBeCloseTo(.233);
    expect(radiantLoadoutSkillStats(loadout, 2).skillPower - radiantLoadoutSkillStats(base, 2).skillPower).toBeCloseTo(.833);
    expect(radiantLoadoutSkillStats(loadout, 1).skillEfficiency).toBe(radiantLoadoutSkillStats(base, 1).skillEfficiency);
  });
});

describe('D-493 B4: Ruinmark Censer', () => {
  /** Tide (Undertow Thrust Weakens) with or without Ruinmark; Ember attacks. */
  function weakened(ruin: boolean) {
    let state = fixture([['tide', ruin ? [RUIN] : []], ['ember']]);
    fill(state, 'tide', 40);
    state = skill(state, 'tide', 1).state;
    return state;
  }
  const hit = (events: RadiantCombatEvent[]) => of(events, 'damage').filter(event => event.targetId === 'enemy')
    .reduce((sum, event) => sum + event.offered, 0);
  it('raises direct damage from every ally on an enemy carrying the wearer\'s Weaken', () => {
    const plain = hit(normal(weakened(false), 'ember').events), boosted = hit(normal(weakened(true), 'ember').events);
    expect(boosted / plain).toBeGreaterThan(1.08);
    expect(boosted / plain).toBeLessThan(1.12);
  });
  it('raises Burn ticks too, and ends when the wearer falls', () => {
    const burned = (ruin: boolean, fallen = false) => {
      let state = weakened(ruin);
      state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'skill', bearerId: 'ember' }, magnitude: 1000, remaining: 2 });
      if (fallen) { unit(state, 'tide').hp = 0; gauge(state, 'tide').living = false; }
      state = act(state, { type: 'end-turn' }).state;
      for (const id of ['enemy', 'enemy2']) state = act(state, { type: 'enemy-heal', enemyId: id, amount: 0 }).state;
      const done = act(state, { type: 'finish-enemy-phase' });
      return of(done.events, 'damage').filter(event => event.origin === 'periodic' && event.targetId === 'enemy')
        .reduce((sum, event) => sum + event.offered, 0);
    };
    expect(burned(true) / burned(false)).toBeCloseTo(1.1, 2);
    expect(burned(true, true)).toBe(burned(false, true));
  });
  it('tags the enemy and explains the effect', () => {
    const view = radiantSignatureView(weakened(true));
    expect(view.holders.enemy.join()).toContain('Ruinmark Censer · +10% damage taken');
    expect(radiantConduitEffectText(RUIN)).toContain('Burn and Conduit-generated strikes');
  });
});

describe('D-493 B4: Choir-Array of Branded Stars', () => {
  it('a mark placed by the wearer gives the squad stacking Skill Power for the turn and Luminosity', () => {
    let state = fixture([['rosetta', [CHOIR]], ['ember'], ['tide']]);
    fill(state, 'rosetta', 40);
    const before = gauge(state, 'ember').charge;
    const cast = skill(state, 'rosetta', 1);
    expect(signatures(cast.events, 'choir')).toHaveLength(1);
    state = cast.state;
    for (const id of ['rosetta', 'ember', 'tide']) expect(unit(state, id).choirPower).toBeCloseTo(.333);
    expect(gauge(state, 'ember').charge - before).toBe(7);
    expect(radiantSkillStats(state, 'ember', 1).skillPower - radiantSkillStats(fixture([['rosetta'], ['ember'], ['tide']]), 'ember', 1).skillPower)
      .toBeCloseTo(.333);
    expect(radiantSignatureView(state).bonuses.ember.join()).toContain('+33.3% Skill Power this turn');
    expect(radiantConduitCallouts(cast.events, { state } as unknown as FrozenRadiantRun)
      .some(callout => callout.text.startsWith('Squad +33.3% Skill Power this turn (1/4)'))).toBe(true);
    // The bonus ends with the player turn.
    state = act(state, { type: 'end-turn' }).state;
    expect(state.bearers.every(entry => entry.choirPower === undefined)).toBe(true);
  });
  it('triggers at most 4 times per encounter and never on a Survey spend', () => {
    let state = fixture([['ilvaris', [CHOIR]], ['ember']]);
    for (let turn = 0; turn < 5; turn++) {
      fill(state, 'ilvaris', 40);
      const cast = skill(state, 'ilvaris', 1);
      expect(signatures(cast.events, 'choir')).toHaveLength(turn < 4 ? 1 : 0);
      state = finish(act(cast.state, { type: 'end-turn' }).state);
    }
    expect(unit(state, 'ilvaris').choirUsed).toBe(4);
    // Nerithe: a Normal Attack adds Survey (a placement); a skill that only spends Survey is not one.
    let survey = fixture([['nerithe', [CHOIR]], ['ember']]);
    const hit = normal(survey, 'nerithe');
    expect(signatures(hit.events, 'survey').length).toBeGreaterThan(0);
    expect(signatures(hit.events, 'choir')).toHaveLength(1);
    survey = finish(act(hit.state, { type: 'end-turn' }).state);
    const ember = normal(survey, 'ember');
    expect(signatures(ember.events, 'choir')).toHaveLength(0);
  });
  it('does nothing for marks placed by other allies', () => {
    const state = fill(fixture([['ember', [CHOIR]], ['rosetta']]), 'rosetta', 40);
    expect(signatures(skill(state, 'rosetta', 1).events, 'choir')).toHaveLength(0);
  });
});

describe('D-493 B4 (G12): Throne of Borrowed Tomorrows', () => {
  /** Crinso and Ember act first (Normal Attacks), then Tide wears the Throne and uses Convergent Light. */
  function borrowedTurn(charge = 40) {
    let state = fixture([['crinso'], ['ember'], ['tide', [THRONE]]]);
    state = normal(state, 'crinso').state;
    state = normal(state, 'ember').state;
    fill(state, 'crinso', charge); fill(state, 'ember', charge); fill(state, 'tide');
    return flare(state, 'tide');
  }
  it('grants every other living ally who already acted one extra Skill 1 or 2 and holds the turn open', () => {
    const cast = borrowedTurn();
    expect(signatures(cast.events, 'borrowed').map(event => event.holderId).sort()).toEqual(['crinso', 'ember']);
    expect(cast.state.phase).toBe('player');
    expect(cast.state.borrowed?.sort()).toEqual(['crinso', 'ember']);
    expect(radiantPendingActors(cast.state).sort()).toEqual(['crinso', 'ember']);
    expect(radiantSignatureView(cast.state).bonuses.crinso.join()).toContain('Throne of Borrowed Tomorrows · one extra Skill 1 or Skill 2');
    expect(radiantConduitCallouts(cast.events, { state: cast.state } as unknown as FrozenRadiantRun)
      .some(callout => callout.text.startsWith('Borrowed Tomorrows · '))).toBe(true);
  });
  it('allows only Skill 1 or 2, at the normal cost, once per ally per turn; the turn ends when none remain', () => {
    let state = borrowedTurn().state;
    expect(() => normal(state, 'crinso')).toThrow('already acted');
    expect(() => flare(fill(structuredClone(state), 'crinso'), 'crinso')).toThrow('already acted');
    const used = skill(state, 'crinso', 1);
    expect(of(used.events, 'skill')[0].cost).toBe(25);
    state = used.state;
    expect(state.borrowedSpent).toEqual(['crinso']);
    expect(state.acted.filter(id => id === 'crinso')).toHaveLength(1);
    expect(() => skill(fill(structuredClone(state), 'crinso', 40), 'crinso', 1)).toThrow('already acted');
    state = skill(state, 'ember', 1).state;
    expect(state.phase).toBe('enemy');
    expect(state.borrowed).toBeUndefined();
    expect(finish(state).borrowedSpent).toBeUndefined();
  });
  it('ends the turn at once when no holder can pay, and End Turn forfeits unused borrowed skills', () => {
    const broke = borrowedTurn(0);
    expect(broke.state.phase).toBe('enemy');
    expect(broke.state.borrowed).toBeUndefined();
    const forfeit = act(borrowedTurn().state, { type: 'end-turn' });
    expect(forfeit.state.phase).toBe('enemy');
    expect(forfeit.state.borrowed).toBeUndefined();
  });
  it('includes an ally who used Convergent Light earlier this turn, never the wearer, never an ally yet to act', () => {
    let state = fixture([['crinso'], ['ember'], ['tide', [THRONE]]]);
    fill(state, 'crinso');
    state = flare(state, 'crinso').state;
    fill(state, 'crinso', 40); fill(state, 'tide');
    const cast = flare(state, 'tide');
    expect(cast.state.borrowed).toEqual(['crinso']);
    expect(cast.state.phase).toBe('player');
    expect(radiantPendingActors(cast.state)).toEqual(['ember', 'crinso']);
  });
  it('the pressure policy uses borrowed skills before the enemy phase', () => {
    const state = borrowedTurn().state;
    expect(chooseRadiantPressureAction(state, 'crinso', 'balanced')).toMatchObject({ type: 'skill', bearerId: 'crinso' });
    expect(typeof runRadiantPressure).toBe('function');
  });
  it('rejects forged borrowed-skill ledgers', () => {
    const state = borrowedTurn().state;
    const bad = (mutate: (copy: RadiantCombatState) => void) => {
      const copy = structuredClone(state); mutate(copy); return () => validateRadiantCombat(copy);
    };
    expect(bad(() => {})).not.toThrow();
    expect(bad(copy => { copy.borrowed = ['enemy']; })).toThrow('borrowed');
    expect(bad(copy => { copy.borrowed = []; })).toThrow('borrowed');
    expect(bad(copy => { copy.borrowedSpent = ['crinso']; })).toThrow('borrowed');
    expect(bad(copy => { unit(copy, 'tide').loadout.gear = gear(); })).toThrow();
    const plain = fixture([['crinso'], ['ember']]);
    plain.acted = ['crinso']; plain.borrowed = ['crinso'];
    expect(() => validateRadiantCombat(plain)).toThrow('borrowed');
  });
  it('the glossary explains borrowed skills and marks', () => {
    expect(radiantKitGlossary()).toContain('<dt>Borrowed skill</dt>');
    expect(radiantKitGlossary()).toContain('<dt>Mark</dt>');
  });
});

describe('D-493 B4: validation of Choir-Array state', () => {
  it('rejects forged Choir-Array Skill Power and trigger counts', () => {
    const state = fixture([['rosetta', [CHOIR]], ['ember']]);
    const bad = (mutate: (copy: RadiantCombatState) => void) => {
      const copy = structuredClone(state); mutate(copy); return () => validateRadiantCombat(copy);
    };
    expect(bad(copy => { unit(copy, 'ember').choirPower = .333; unit(copy, 'rosetta').choirUsed = 1; })).not.toThrow();
    expect(bad(copy => { unit(copy, 'ember').choirUsed = 1; })).toThrow('Choir');
    expect(bad(copy => { unit(copy, 'rosetta').choirUsed = 5; })).toThrow('Choir');
    expect(bad(copy => { unit(copy, 'ember').choirPower = -1; })).toThrow('Choir');
    const plain = fixture([['rosetta'], ['ember']]);
    unit(plain, 'ember').choirPower = .333;
    expect(() => validateRadiantCombat(plain)).toThrow('Choir');
  });
});

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
/** Plays the encounter with the pressure policy, borrowed skills included (pending-actor order). */
function play(saved: FrozenRadiantRun, policy: 'balanced' | 'flare-saving' = 'balanced'): RadiantTurnAction[] {
  const run = structuredClone(saved), actions: RadiantTurnAction[] = [];
  while (run.state.phase === 'player' && actions.length < 2000) {
    const action = chooseRadiantPressureAction(run.state, radiantPendingActors(run.state)[0], policy) as RadiantTurnAction;
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
function storageWith(squad: string[], equip: Record<string, ConduitId[]> = {}): MemoryStorage {
  const storage = new MemoryStorage(), account: Account = emptyAccount();
  account.squad = squad;
  squad.forEach(id => { account.characters[id as keyof Account['characters']] = { level: 0, evolution: 1, weaponRank: 0 }; });
  const owned = Object.values(equip).flat();
  if (owned.length) {
    account.conduits = { ...account.conduits, ...Object.fromEntries(owned.map(id => [id, 1])) };
    account.conduitEquipment = Object.fromEntries(Object.entries(equip).map(([id, ids]) =>
      [id, [...ids, ...Array<null>(8 - ids.length).fill(null)]]));
  }
  saveAccount(storage, account);
  return storage;
}

describe('save compatibility (standing requirement, 2026-11-20)', () => {
  it('reloads a settled journal written before B4, accepts the new signature ops and rejects forged B4 state', async () => {
    const storage = storageWith(['elise', 'crinso']);
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const settled = await send(transport, { kind: 'settle', actions: play(started.run) });
    const snapshot = (run: FrozenRadiantRun) => ({ revision: 9,
      state: { profile: {}, starterId: 'ember', run: null, account: settled.account, radiantStudy: run } });
    expect(validateRadiantRunSnapshot(snapshot(settled.run)).state.radiantStudy).toEqual(settled.run);
    const id = settled.run.state.bearers[0].loadout.id;
    const withOps = structuredClone(settled.run);
    withOps.journal.events.push({ type: 'signature', bearerId: id, op: 'borrowed', holderId: id, amount: 1 },
      { type: 'signature', bearerId: id, op: 'choir', amount: 1 });
    expect(() => validateRadiantRunSnapshot(snapshot(withOps))).not.toThrow();
    const forged = structuredClone(settled.run);
    forged.state.borrowedSpent = [id];
    expect(() => validateRadiantRunSnapshot(snapshot(forged))).toThrow('Invalid saved Radiant account');
    const choir = structuredClone(settled.run);
    choir.state.bearers[0].choirUsed = 1;
    expect(() => validateRadiantRunSnapshot(snapshot(choir))).toThrow('Invalid saved Radiant account');
  });
  it('loads an encounter saved before B4 mid-run and settles it', async () => {
    const storage = storageWith(['elise', 'crinso']);
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const loaded = await transport.read();
    expect(loaded.notice).toBeUndefined();
    expect(loaded.run!.state.borrowed).toBeUndefined();
    expect(loaded.run!.state.borrowedSpent).toBeUndefined();
    const settled = await send(transport, { kind: 'settle', actions: play(loaded.run!) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
  });
  it('settles an encounter whose replay includes borrowed skills', async () => {
    const storage = storageWith(['elise', 'tide', 'crinso'], { crinso: [THRONE] });
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    expect(started.run.state.bearers.find(entry => entry.loadout.starter === 'crinso')!.loadout.gear?.[0]?.id).toBe(THRONE);
    // Training waves carry Luminosity forward; keep settling until a replay includes a borrowed skill.
    let run = started.run, borrowed = false;
    for (let wave = 0; wave < 12 && !borrowed; wave++) {
      const settled = await send(transport, { kind: 'settle', actions: play(run, 'flare-saving') });
      expect(['victory', 'defeat']).toContain(settled.run.state.phase);
      borrowed = settled.run.journal.events.some(event => event.type === 'signature' && event.op === 'borrowed');
      if (borrowed || settled.run.state.phase !== 'victory') break;
      run = (await send(transport, { kind: 'continue' })).run;
    }
    expect(borrowed).toBe(true);
  });
});
