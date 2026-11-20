import { describe, expect, it } from 'vitest';
import type { ConduitId } from '../content/conduits';
import type { RadiantGear } from '../content/conduit-effects';
import { radiantConduitEffectText } from '../content/conduit-effect-text';
import {
  radiantCriticalStats, radiantElementalCritFactor, radiantEnemyCritical, releasedRadiantIds,
  type RadiantBearerId, type RadiantLoadout,
} from '../content/combat-kits';
import {
  applyRadiantCombatAction, createRadiantCombat, effectiveRadiantStats, radiantCriticalRate, radiantDirectDamage,
  validateRadiantCombat, type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState,
} from './combat-engine';
import { radiantFlareCost } from './combat-gauge';
import { emptyAccount, saveAccount, type Account } from './account';
import { LOCAL_RADIANT_KEY, LocalRadiantTransport } from '../online/battle-local';
import {
  applyRadiantTurn, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantRunOperation, type RadiantRunRequest, type RadiantTurnAction,
} from '../online/battle-run';

/** D-493 crit step (owner, 2026-11-20): real critical hits, Critical Up in place of Exposure. */
function gear(...ids: ConduitId[]): RadiantGear {
  return Array.from({ length: 8 }, (_, index) => ids[index] ? { id: ids[index], rank: 0 } : null);
}
function member(starter: RadiantBearerId, ids: ConduitId[] = []): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId: null, ascension: {}, gear: gear(...ids) };
}
function fixture(squad: [RadiantBearerId, ConduitId[]?][], seed = 0, criticalHits = true, defense = 50): RadiantCombatState {
  const state = createRadiantCombat(squad.map(([starter, ids]) => member(starter, ids)),
    ['enemy', 'enemy2'].map(id => ({ id, elementId: null, stats: { hp: 1000000, attack: 400, defense, recovery: 0 }, currencyBudget: 1000 })),
    seed, criticalHits);
  // One Health below full, so full-Health ("opening") Leader bonuses stay out of the expected numbers.
  for (const enemy of state.enemies) { enemy.hp -= 1; enemy.currency.lowestHP = enemy.hp; }
  return state;
}
const act = (state: RadiantCombatState, action: RadiantCombatAction) => applyRadiantCombatAction(state, action);
const damage = (events: RadiantCombatEvent[]) =>
  events.filter((event): event is Extract<RadiantCombatEvent, { type: 'damage' }> => event.type === 'damage');
/** Critical Up stored magnitude that lifts `starter`'s Normal Attack to exactly 100% Critical Rate (never Elemental). */
function certain(state: RadiantCombatState, starter: RadiantBearerId, magnitude = (1 - radiantCriticalStats[starter].rate) / 2): RadiantCombatState {
  state.enemies[0].debuffs = [{ category: 'expose', source: { kind: 'skill', bearerId: state.bearers[0].loadout.id }, magnitude, remaining: 3 }];
  return state;
}
/** End the player turn, let `enemy` hit `targets` and finish the enemy phase. */
function enemyPhase(state: RadiantCombatState, targets: string[]) {
  if (state.phase === 'player') state = act(state, { type: 'end-turn' }).state;
  const hit = act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: targets, coefficient: 1 });
  state = act(hit.state, { type: 'enemy-heal', enemyId: 'enemy2', amount: 0 }).state;
  return { hit, round: act(state, { type: 'finish-enemy-phase' }) };
}

describe('critical hits: base values and stream', () => {
  it('gives every released bearer its pre-Radiant Critical Rate and Critical Damage', () => {
    for (const id of releasedRadiantIds) {
      expect(radiantCriticalStats[id].rate).toBeGreaterThanOrEqual(.08);
      expect(radiantCriticalStats[id].rate).toBeLessThanOrEqual(.25);
      expect(radiantCriticalStats[id].damage).toBeGreaterThanOrEqual(1.5);
      expect(radiantCriticalStats[id].damage).toBeLessThanOrEqual(1.7);
    }
    expect(radiantCriticalStats.ember).toEqual({ rate: .15, damage: 1.5 });
    expect(radiantCriticalStats.bliss).toEqual({ rate: .25, damage: 1.7 });
    expect(radiantCriticalStats.velmira).toEqual({ rate: .23, damage: 1.65 });
    expect(radiantEnemyCritical).toEqual({ rate: .1, damage: 1.5 });
  });
  it('creates new encounters with a crit stream derived from the charge seed, and validates it', () => {
    const state = fixture([['ember']], 1234);
    expect(state.critSeed).toBeTypeOf('number');
    expect(state.critSeed).not.toBe(state.chargeSeed);
    expect(fixture([['ember']], 1234).critSeed).toBe(state.critSeed);
    expect(fixture([['ember']], 1234, false).critSeed).toBeUndefined();
    const tampered = structuredClone(state);
    tampered.critSeed = -1;
    expect(() => validateRadiantCombat(tampered)).toThrow(/critical RNG stream/);
  });
  it('only the crit stream moves: charge and Conduit streams match an encounter without crits', () => {
    let crit = fixture([['ember', ['nullsong-transmission']], ['tide']], 77);
    let plain = fixture([['ember', ['nullsong-transmission']], ['tide']], 77, false);
    for (let round = 0; round < 3; round++) {
      for (const id of ['ember', 'tide']) {
        crit = act(crit, { type: 'normal', bearerId: id, targetId: 'enemy' }).state;
        plain = act(plain, { type: 'normal', bearerId: id, targetId: 'enemy' }).state;
      }
      expect(crit.chargeSeed).toBe(plain.chargeSeed);
      expect(crit.conduitSeed).toBe(plain.conduitSeed);
      crit = enemyPhase(crit, ['ember']).round.state;
      plain = enemyPhase(plain, ['ember']).round.state;
    }
    expect(crit.critSeed).not.toBe(fixture([['ember', ['nullsong-transmission']], ['tide']], 77).critSeed);
  });
  it('lands critical hits at roughly the base rate over many seeds', () => {
    let crits = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const hit = damage(act(fixture([['ember']], seed), { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).events)[0];
      if (hit.critical) crits++;
    }
    // Infernis: 15%. 400 samples keep this well inside the band.
    expect(crits / 400).toBeGreaterThan(.08);
    expect(crits / 400).toBeLessThan(.23);
  });
});

describe('critical hits: damage', () => {
  it('multiplies direct damage by Critical Damage before the single rounding', () => {
    // Tizu leads: his Leader Skill touches only Oceanic allies, so Infernis's numbers stay bare.
    const state = certain(fixture([['tide'], ['ember']]), 'ember');
    expect(radiantCriticalRate(state, 'ember', 'enemy')).toBeCloseTo(1);
    const hit = damage(act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).events)[0];
    expect(hit.critical).toBe('critical');
    expect(hit.offered).toBe(radiantDirectDamage(effectiveRadiantStats(state, 'ember').attack, 50, 1, 1.5));
  });
  it('makes an Elemental Crit only above 100% (Critical Damage x1.5 again)', () => {
    const outcomes = new Set<string>();
    for (let seed = 0; seed < 60; seed++) {
      // Critical Up at its cap: Infernis at 15% + 160 points = 175%, so 75% of hits are Elemental.
      const state = certain(fixture([['tide'], ['ember']], seed), 'ember', .8);
      const hit = damage(act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).events)[0];
      const attack = effectiveRadiantStats(state, 'ember').attack;
      expect(hit.critical).toBeDefined();
      expect(hit.offered).toBe(radiantDirectDamage(attack, 50, 1, hit.critical === 'elemental' ? 1.5 * radiantElementalCritFactor : 1.5));
      outcomes.add(hit.critical!);
    }
    expect([...outcomes].sort()).toEqual(['critical', 'elemental']);
  });
  it('rolls once per target for a multi-hit cast: every hit of that target shares the outcome', () => {
    const state = certain(fixture([['ember']]), 'ember');
    state.gauge.members[0].charge = radiantFlareCost(state.gauge.members[0]);
    const hits = damage(act(state, { type: 'flare', bearerId: 'ember' }).events).filter(event => event.targetId === 'enemy');
    expect(hits.length).toBeGreaterThan(1);
    expect(new Set(hits.map(event => event.critical)).size).toBe(1);
  });
  it('lets kit Burn ticks crit with the caster\'s stats and never lets Conduit-generated strikes crit', () => {
    const start = fixture([['ember']]);
    start.gauge.members[0].charge = 40;
    const lit = act(start, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' }).state;
    const burn = lit.enemies[0].debuffs.find(effect => effect.category === 'burn')!;
    // Critical Up at its cap: Infernis's Burn tick is certain to crit (175%).
    certain(lit, 'ember', .8).enemies[0].debuffs.push(burn);
    const tick = damage(enemyPhase(lit, ['ember']).round.events).find(event => event.origin === 'periodic' && event.targetId === 'enemy')!;
    expect(tick.critical).toBeDefined();
    expect(tick.offered).toBeGreaterThanOrEqual(Math.round(burn.magnitude * 1.5) - 1);
    // Conduit-generated packets (here Thunderbird Coil's splash) carry no critical flag even when the hit crits.
    const splash = certain(fixture([['atmoso', ['voltaic-thunderbird-coil']]]), 'atmoso', .8);
    const events = damage(act(splash, { type: 'normal', bearerId: 'atmoso', targetId: 'enemy' }).events);
    expect(events.find(event => event.origin === 'direct')?.critical).toBeDefined();
    expect(events.filter(event => event.origin === 'generated').length).toBeGreaterThan(0);
    expect(events.filter(event => event.origin === 'generated').every(event => event.critical === undefined)).toBe(true);
  });
  it('lets every enemy crit at 10% for 1.5x, one roll per target per action', () => {
    let crits = 0, total = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const state = fixture([['bruno'], ['tide']], seed);
      const { hit } = enemyPhase(state, ['bruno', 'tide']);
      for (const event of damage(hit.events).filter(entry => entry.source.kind === 'enemy')) {
        total++;
        if (event.critical) crits++;
      }
    }
    expect(crits / total).toBeGreaterThan(.05);
    expect(crits / total).toBeLessThan(.16);
  });
});

describe('Critical Up (replaces Exposure)', () => {
  it('adds 2 points of Critical Rate per stored point and no longer raises damage taken', () => {
    const plain = fixture([['ember']]);
    const marked = certain(fixture([['ember']]), 'ember', .2);
    expect(radiantCriticalRate(marked, 'ember', 'enemy') - radiantCriticalRate(plain, 'ember', 'enemy')).toBeCloseTo(.4);
    // An encounter saved before the crit step keeps the old rule: +20% damage taken, no crits.
    const legacy = certain(fixture([['tide'], ['ember']], 0, false), 'ember', .2);
    expect(radiantCriticalRate(legacy, 'ember', 'enemy')).toBe(0);
    const hit = damage(act(legacy, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).events)[0];
    expect(hit.critical).toBeUndefined();
    expect(hit.offered).toBe(radiantDirectDamage(effectiveRadiantStats(legacy, 'ember').attack, 50, 1, 1.2));
  });
  it('describes Critical Up and the crit Conduits with exact numbers', () => {
    expect(radiantConduitEffectText('calamitic-ruinmark-censer')).toContain('+60 percentage points Critical Rate');
    expect(radiantConduitEffectText('astral-prism')).toBe(
      'Maximum Health increases by 10%. Critical Rate +30 percentage points on Normal Attacks, skills, Convergent Light, ' +
      "signature strikes and Burn. Critical Damage +25% (multiplies this bearer's base Critical Damage).");
    expect(radiantConduitEffectText('verdict-caliper')).toContain('lands a critical hit');
  });
});

describe('crit Conduits', () => {
  it('Critical Rate and Critical Damage Conduits raise the roll and the multiplier', () => {
    const base = fixture([['ember']]);
    expect(radiantCriticalRate(fixture([['ember', ['fieldbrace-coupler']]]), 'ember', 'enemy') -
      radiantCriticalRate(base, 'ember', 'enemy')).toBeCloseTo(.25);
    const crit = (ids: ConduitId[]) => damage(act(certain(fixture([['tide'], ['ember', ids]]), 'ember'), {
      type: 'normal', bearerId: 'ember', targetId: 'enemy' }).events)[0];
    const plain = crit([]), precise = crit(['precision-escapement']);
    expect(plain.critical).toBe('critical');
    expect(precise.critical).toBe('critical');
    expect(precise.offered).toBe(radiantDirectDamage(effectiveRadiantStats(fixture([['tide'], ['ember']]), 'ember').attack, 50, 1, 1.5 * 1.1));
    // D-492: the Critical Damage Conduit is credited with its share of the hit.
    expect(precise.boosts?.some(entry => entry.source.kind === 'gear' && entry.source.conduitId === 'precision-escapement')).toBe(true);
  });
  it('Horizon Heartcase adds Critical Rate to Convergent Light only', () => {
    const state = fixture([['ember', ['horizon-heartcase']]]);
    expect(radiantCriticalRate(state, 'ember', 'enemy', 'flare') - radiantCriticalRate(state, 'ember', 'enemy', 'normal')).toBeCloseTo(.1);
  });
  it('Verdict Caliper heals only after a critical hit', () => {
    const heals = (critical: boolean) => {
      const state = critical ? certain(fixture([['ember', ['verdict-caliper']]]), 'ember') : fixture([['ember', ['verdict-caliper']]], 0, false);
      state.bearers[0].hp = 10;
      return act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).events
        .filter(event => event.type === 'heal' && event.source.kind === 'gear');
    };
    expect(heals(true)).toHaveLength(1);
    expect(heals(false)).toHaveLength(0);
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
    const action: RadiantTurnAction = { type: 'normal',
      bearerId: run.state.bearers.find(unit => unit.hp > 0 && !run.state.acted.includes(unit.loadout.id))!.loadout.id,
      targetId: run.state.enemies.find(unit => unit.hp > 0)!.id };
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
/** What an encounter saved before the crit step looks like: identical, without the crit stream. */
function preCrit(run: FrozenRadiantRun): FrozenRadiantRun {
  const old = structuredClone(run);
  delete old.initial.critSeed;
  delete old.state.critSeed;
  return old;
}

describe('save compatibility (standing requirement, 2026-11-20)', () => {
  it('loads, settles and reloads an encounter saved before critical hits, without any critical hit', async () => {
    const storage = storageWith(['vaelor', 'ember']);
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    expect(started.run.initial.critSeed).toBeTypeOf('number');
    const record = JSON.parse(storage.getItem(LOCAL_RADIANT_KEY)!);
    record.run = preCrit(record.run);
    storage.setItem(LOCAL_RADIANT_KEY, JSON.stringify(record));
    const loaded = await transport.read();
    expect(loaded.run?.state.critSeed).toBeUndefined();
    expect(loaded.notice).toBeUndefined();
    const settled = await send(transport, { kind: 'settle', actions: play(loaded.run!) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
    expect(settled.run.journal.events.some(event => event.type === 'signature')).toBe(true);
    expect(settled.run.journal.events.every(event => event.type !== 'damage' || event.critical === undefined)).toBe(true);
    const snapshot = { revision: 9, state: { profile: {}, starterId: 'ember', run: null, account: settled.account, radiantStudy: settled.run } };
    expect(validateRadiantRunSnapshot(snapshot).state.radiantStudy).toEqual(settled.run);
  });
  it('settles a new encounter with critical hits, reloads it and rejects a tampered flag or stripped stream', async () => {
    const storage = storageWith(['bliss', 'elise']);
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const settled = await send(transport, { kind: 'settle', actions: play(started.run) });
    const snapshot = { revision: 9, state: { profile: {}, starterId: 'ember', run: null, account: settled.account, radiantStudy: settled.run } };
    expect(validateRadiantRunSnapshot(snapshot).state.radiantStudy).toEqual(settled.run);
    const tampered = structuredClone(settled.run);
    const hit = tampered.journal.events.find(event => event.type === 'damage')!;
    Object.assign(hit, { critical: 'super' });
    expect(() => validateRadiantRunSnapshot({ ...snapshot, state: { ...snapshot.state, radiantStudy: tampered } }))
      .toThrow('Invalid saved Radiant account');
    const stripped = structuredClone(settled.run);
    delete stripped.state.critSeed;
    expect(() => validateRadiantRunSnapshot({ ...snapshot, state: { ...snapshot.state, radiantStudy: stripped } }))
      .toThrow('Invalid saved Radiant account');
  });
});
