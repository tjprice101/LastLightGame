import { describe, expect, it } from 'vitest';
import { radiantMasters, type RadiantBearerId, type RadiantLoadout, type RadiantMasterId } from '../content/combat-kits';
import { radiantMasterClauseKinds } from '../content/conduit-effects';
import { radiantConduitDescription } from '../content/conduit-effect-text';
import {
  applyRadiantCombatAction, createRadiantCombat, radiantActionEfficiency, radiantCriticalRate, radiantPendingActors, radiantSkillStats,
  validateRadiantCombat, type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState, type RadiantToken,
} from './combat-engine';
import { radiantTokenLabel } from '../presentation/battle-signatures';
import { chooseRadiantPressureAction } from './enemy-pressure';
import { emptyAccount, saveAccount, type Account } from './account';
import { LocalRadiantTransport } from '../online/battle-local';
import {
  applyRadiantTurn, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantRunOperation, type RadiantRunRequest, type RadiantTurnAction,
} from '../online/battle-run';

/** D-493 B5c1 (owner, Plan mode 2026-11-22): Master next-action bonuses and the two conditional rows. */
const clauses: Record<string, string> = {
  'master-ember-3': 'dawnfire-ally-power .4', 'master-tide-2': 'shelter-power .5, shelter-efficiency .25',
  'master-sprout-1': 'seed-power .25, seed-efficiency .15', 'master-atmoso-3': 'gust-gain .3',
  'master-bliss-2': 'opening-ally-crit .25', 'master-bliss-3': 'stillness-efficiency .25, stillness-duration 1',
  'master-disciple-3': 'resolve-crit-rate .3, resolve-crit-damage .4', 'master-elise-2': 'shuriken-power .35',
  'master-elise-3': 'recall-crit-damage .4, recall-crit-rate .15', 'master-razor-3': 'nightcleave-crit .3',
  'master-rosetta-2': 'skyfall-efficiency .2', 'master-rosetta-3': 'volley-power .35', 'master-crinso-1': 'cataclysm-crit-damage .15',
  'master-nerithe-2': 'fold-power .4', 'master-orvella-1': 'citadel-efficiency .2', 'master-vaelor-1': 'chord-power .3',
  'master-vaelor-3': 'tune-crit .25, crescendo-crit-damage .4', 'master-ilyss-3': 'unbind-power .25',
};
const b5cKinds = radiantMasterClauseKinds.slice(radiantMasterClauseKinds.indexOf('dawnfire-ally-power')) as readonly string[];
const parse = (text: string) => text.split(', ').map(part => { const [kind, amount] = part.split(' '); return [kind, Number(amount)]; });

function member(starter: RadiantBearerId, masterId: RadiantMasterId | null = null): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId, ascension: {}, gear: Array(8).fill(null) };
}
function fixture(squad: [RadiantBearerId, RadiantMasterId?][], criticalHits = false): RadiantCombatState {
  return createRadiantCombat(squad.map(([starter, masterId]) => member(starter, masterId ?? null)),
    ['enemy', 'enemy2'].map(id => ({ id, elementId: null, stats: { hp: 1000000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })),
    0, criticalHits);
}
function charged(state: RadiantCombatState, amount = 200): RadiantCombatState {
  for (const entry of state.gauge.members) entry.charge = amount;
  return state;
}
const bearerOf = (state: RadiantCombatState, id: string) => state.bearers.find(entry => entry.loadout.id === id)!;
const enemyOf = (state: RadiantCombatState, id: string) => state.enemies.find(entry => entry.id === id)!;
const tokens = (state: RadiantCombatState, id: string): RadiantToken[] => bearerOf(state, id).tokens ?? [];
const kinds = (state: RadiantCombatState, id: string) => tokens(state, id).map(token => token.kind);
const act = (state: RadiantCombatState, action: RadiantCombatAction) => applyRadiantCombatAction(state, action);
function dealt(events: RadiantCombatEvent[], bearerId: string, targetId?: string): number {
  return events.reduce((sum, event) => event.type === 'damage' && event.source.kind !== 'enemy' && event.source.bearerId === bearerId &&
    event.origin === 'direct' && (targetId === undefined || event.targetId === targetId) ? sum + event.healthLoss + event.absorbed : sum, 0);
}
/** End the player turn, let each living enemy make a tiny attack on `targetId`, and start the next turn. */
function nextTurn(state: RadiantCombatState, targetId = state.bearers[0].loadout.id, coefficient = .01): RadiantCombatState {
  let next = state.phase === 'player' ? act(state, { type: 'end-turn' }).state : state;
  for (const target of next.enemies.filter(entry => entry.hp > 0))
    next = act(next, { type: 'enemy-attack', enemyId: target.id, targetIds: [targetId], coefficient }).state;
  return charged(act(next, { type: 'finish-enemy-phase' }).state);
}

describe('D-493 B5c1 Master next-action bonuses: content', () => {
  it('adds the approved clause primitives to exactly the 18 B5c1 Masters', () => {
    expect(Object.keys(clauses)).toHaveLength(18);
    for (const [id, master] of Object.entries(radiantMasters)) {
      const own = master.effects.filter(entry => b5cKinds.includes(entry.kind)).map(entry => [entry.kind, entry.amount]);
      expect(own, id).toEqual(clauses[id] ? parse(clauses[id]) : []);
    }
  });
  it('writes exact tooltips for every B5c1 kind', () => {
    for (const kind of b5cKinds) expect(radiantConduitDescription({ kind, amount: .25 } as never)).not.toMatch(/undefined|NaN/);
    expect(radiantMasters['master-vaelor-1'].effect).toContain('30% Skill Power on their next skill or Convergent Light, or 60% when cast on Crescendo');
    expect(radiantMasters['master-crinso-1'].effect).toContain('up to 60%');
    expect(radiantMasters['master-orvella-1'].effect).toContain('20% Skill Efficiency on their next skill or Convergent Light');
  });
});

describe('D-493 B5c1 Master next-action bonuses: combat', () => {
  it('Unbroken Sunforge Throne: Dawnfire powers other allies against Infernis\'s Burn only, credits the Master, and labels it', () => {
    const cast = act(charged(fixture([['ember', 'master-ember-3'], ['elise']])), { type: 'flare', bearerId: 'ember' });
    expect(tokens(cast.state, 'elise')).toEqual([{ kind: 'dawnfire-ally-power', giverId: 'ember', masterId: 'master-ember-3', value: .4, until: 2 }]);
    expect(kinds(cast.state, 'ember')).toEqual([]);
    expect(radiantTokenLabel(tokens(cast.state, 'elise')[0])).toBe('Unbroken Sunforge Throne · Next damaging skill +40% Skill Power vs Infernis\'s Burn');
    // Without Infernis's Burn on the target the bonus waits.
    const clean = structuredClone(cast.state);
    enemyOf(clean, 'enemy2').debuffs = [];
    expect(kinds(act(clean, { type: 'skill', bearerId: 'elise', slot: 1, targetId: 'enemy2' }).state, 'elise')).toEqual(['dawnfire-ally-power']);
    const plain = structuredClone(cast.state);
    delete bearerOf(plain, 'elise').tokens;
    const boosted = act(cast.state, { type: 'skill', bearerId: 'elise', slot: 1, targetId: 'enemy' });
    expect(dealt(boosted.events, 'elise')).toBeGreaterThan(dealt(act(plain, { type: 'skill', bearerId: 'elise', slot: 1, targetId: 'enemy' }).events, 'elise'));
    expect(kinds(boosted.state, 'elise')).toEqual([]);
    const hit = boosted.events.find(event => event.type === 'damage' && event.source.kind === 'skill') as Extract<RadiantCombatEvent, { type: 'damage' }>;
    expect(hit.boosts?.some(boost => boost.source.kind === 'master' && boost.source.bearerId === 'ember')).toBe(true);
  });
  it('Ocean Memory Worldpump: Tidal Shelter gains Skill Power; its Shield holders keep a bonus only while the Shield remains', () => {
    const state = charged(fixture([['tide', 'master-tide-2'], ['ember']]));
    expect(radiantSkillStats(state, 'tide', 2).skillPower - radiantSkillStats(state, 'tide', 1).skillPower).toBeCloseTo(.5, 9);
    const cast = act(state, { type: 'skill', bearerId: 'tide', slot: 2 });
    expect(kinds(cast.state, 'ember')).toEqual(['shelter-efficiency']);
    expect(kinds(cast.state, 'tide')).toEqual(['shelter-efficiency']);
    expect(radiantActionEfficiency(cast.state, 'ember', 1) - radiantActionEfficiency(state, 'ember', 1)).toBeCloseTo(.25, 9);
    const forged = structuredClone(cast.state);
    bearerOf(forged, 'ember').shields = [];
    expect(() => validateRadiantCombat(forged)).toThrow();
    // An enemy hit that breaks the Shield ends the bonus.
    let broken = act(cast.state, { type: 'end-turn' }).state;
    bearerOf(broken, 'ember').shields.forEach(entry => { entry.remaining = 1; });
    broken = act(broken, { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 1 }).state;
    expect(bearerOf(broken, 'ember').shields).toEqual([]);
    expect(kinds(broken, 'ember')).toEqual([]);
    expect(kinds(broken, 'tide')).toEqual(['shelter-efficiency']);
  });
  it('Worldseed Mercy Foundry: a blooming Seed gives its holder Skill Power this turn, an Empowered Seed also Skill Efficiency', () => {
    const empowered = act(charged(fixture([['sprout', 'master-sprout-1'], ['ember']])), { type: 'flare', bearerId: 'sprout' });
    expect(bearerOf(empowered.state, 'ember').seed).toMatchObject({ empowered: true });
    const bloomed = nextTurn(empowered.state);
    expect(tokens(bloomed, 'ember').map(token => [token.kind, token.value, token.until])).toEqual([['seed-power', .25, 2], ['seed-efficiency', .15, 2]]);
    const plain = act(charged(fixture([['sprout', 'master-sprout-1'], ['ember']])), { type: 'skill', bearerId: 'sprout', slot: 2 });
    expect(bearerOf(plain.state, 'ember').seed?.empowered).toBeUndefined();
    expect(kinds(nextTurn(plain.state), 'ember')).toEqual(['seed-power']);
    const forged = structuredClone(empowered.state);
    (bearerOf(forged, 'ember').seed as { empowered: unknown }).empowered = false;
    expect(() => validateRadiantCombat(forged)).toThrow();
  });
  it('Stillplume Planetary Ballet: Warfeather Cut in Opening gives others Critical Rate; in Closing it does not', () => {
    const opening = act(charged(fixture([['bliss', 'master-bliss-2'], ['ember']])), { type: 'skill', bearerId: 'bliss', slot: 1, targetId: 'enemy' });
    expect(tokens(opening.state, 'ember').map(token => [token.kind, token.value])).toEqual([['opening-ally-crit', .25]]);
    const first = act(charged(fixture([['bliss', 'master-bliss-2'], ['ember']])), { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).state;
    const closing = act(first, { type: 'skill', bearerId: 'bliss', slot: 1, targetId: 'enemy' });
    expect(kinds(closing.state, 'ember')).toEqual([]);
  });
  it('Quiet Heaven Fanforge: Thousandfeather Stillness gives others Skill Efficiency, and +1 Skill Duration in Closing', () => {
    const opening = act(charged(fixture([['bliss', 'master-bliss-3'], ['tide']])), { type: 'flare', bearerId: 'bliss' });
    expect(kinds(opening.state, 'tide')).toEqual(['stillness-efficiency']);
    const first = act(charged(fixture([['bliss', 'master-bliss-3'], ['tide']])), { type: 'normal', bearerId: 'tide', targetId: 'enemy' }).state;
    const closing = act(first, { type: 'flare', bearerId: 'bliss' });
    expect(kinds(closing.state, 'tide')).toEqual(['stillness-efficiency', 'stillness-duration']);
    const remaining = (state: RadiantCombatState) => {
      const cast = act(nextTurn(state), { type: 'skill', bearerId: 'tide', slot: 2 }).state;
      return bearerOf(cast, 'tide').buffs.find(effect => effect.category === 'defense-up')!.remaining;
    };
    expect(remaining(closing.state)).toBe(remaining(opening.state) + 1);
  });
  it('Twin Star Planetary Ratchet: each lodged Shuriken stores one shared bonus on that enemy; recall removes unused ones', () => {
    let state = act(charged(fixture([['elise', 'master-elise-2'], ['ember'], ['tide']])), { type: 'skill', bearerId: 'elise', slot: 1, targetId: 'enemy' }).state;
    expect(tokens(state, 'ember')).toEqual([{ kind: 'shuriken-power', giverId: 'elise', masterId: 'master-elise-2', value: .35, until: 2, targetId: 'enemy', uses: 1 }]);
    state = act(nextTurn(state), { type: 'skill', bearerId: 'elise', slot: 1, targetId: 'enemy' }).state;
    expect(tokens(state, 'ember')[0].uses).toBe(2);
    expect(radiantTokenLabel(tokens(state, 'ember')[0])).toContain('2 stored');
    state = act(state, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' }).state;
    expect(tokens(state, 'ember')[0].uses).toBe(1);
    expect(tokens(state, 'tide')[0].uses).toBe(1);
    const forged = structuredClone(state);
    bearerOf(forged, 'tide').tokens![0].uses = 3;
    expect(() => validateRadiantCombat(forged)).toThrow();
    state = act(nextTurn(state), { type: 'skill', bearerId: 'elise', slot: 2, targetId: 'enemy' }).state;
    expect(kinds(state, 'ember')).toEqual([]);
    expect(kinds(state, 'tide')).toEqual([]);
  });
  it('Storm Empress Execution Clock: recalling both Shuriken gives others Critical Damage, plus Critical Rate from one enemy', () => {
    const recall = (lodged: string[]) => {
      const state = charged(fixture([['elise', 'master-elise-3'], ['ember']]));
      Object.assign(bearerOf(state, 'elise').signature!, { held: 2 - lodged.length, lodged });
      return act(state, { type: 'skill', bearerId: 'elise', slot: 2, targetId: 'enemy' }).state;
    };
    expect(kinds(recall(['enemy', 'enemy']), 'ember')).toEqual(['recall-crit-damage', 'recall-crit-rate']);
    expect(kinds(recall(['enemy', 'enemy2']), 'ember')).toEqual(['recall-crit-damage']);
    expect(kinds(recall(['enemy']), 'ember')).toEqual([]);
  });
  it('Nightglass Counterblade Engine: Nightcleave spending Wounds gives others Critical Rate', () => {
    const cleave = (wounds: number) => {
      const state = charged(fixture([['razor', 'master-razor-3'], ['ember']]));
      Object.assign(bearerOf(state, 'razor').signature!, { wounds });
      return kinds(act(state, { type: 'skill', bearerId: 'razor', slot: 1, targetId: 'enemy' }).state, 'ember');
    };
    expect(cleave(50)).toEqual(['nightcleave-crit']);
    expect(cleave(0)).toEqual([]);
  });
  it('Golden Thorn Judgment Loom and Virtuous Planet Rosegarden: Quarry bonuses', () => {
    const volley = act(charged(fixture([['rosetta', 'master-rosetta-3'], ['ember']])), { type: 'skill', bearerId: 'rosetta', slot: 1, targetId: 'enemy' }).state;
    expect(kinds(volley, 'ember')).toEqual(['volley-power']);
    // Off the Quarry the bonus waits; on it the bonus is spent.
    expect(kinds(act(volley, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy2' }).state, 'ember')).toEqual(['volley-power']);
    expect(kinds(act(volley, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' }).state, 'ember')).toEqual([]);
    const garden = charged(fixture([['rosetta', 'master-rosetta-2'], ['ember'], ['tide']]));
    Object.assign(bearerOf(garden, 'rosetta').signature!, { targetId: 'enemy', contributors: ['ember'] });
    const skyfall = act(garden, { type: 'skill', bearerId: 'rosetta', slot: 2, targetId: 'enemy' }).state;
    expect(kinds(skyfall, 'ember')).toEqual(['skyfall-efficiency']);
    expect(kinds(skyfall, 'tide')).toEqual([]);
  });
  it('Twin-Rose Singularity Drive: each spent Combo adds Critical Damage for others, up to 60%', () => {
    const cataclysm = (combo: number) => {
      const state = charged(fixture([['crinso', 'master-crinso-1'], ['ember']]));
      Object.assign(bearerOf(state, 'crinso').signature!, { combo, last: 1 });
      return tokens(act(state, { type: 'flare', bearerId: 'crinso', targetId: 'enemy' }).state, 'ember').map(token => token.value);
    };
    expect(cataclysm(3)[0]).toBeCloseTo(.45, 9);
    expect(cataclysm(5)).toEqual([.6]);
    expect(cataclysm(0)).toEqual([]);
  });
  it('Folded Ocean Planetarium: moving Survey gives others a bonus bound to that enemy', () => {
    const state = charged(fixture([['nerithe', 'master-nerithe-2'], ['ember']]));
    Object.assign(bearerOf(state, 'nerithe').signature!, { targetId: 'enemy', count: 2 });
    const fold = act(state, { type: 'skill', bearerId: 'nerithe', slot: 2, targetId: 'enemy2' }).state;
    expect(tokens(fold, 'ember')).toMatchObject([{ kind: 'fold-power', targetId: 'enemy2', value: .4 }]);
  });
  it('Throne Beneath the World and Final Chord Celestial Resonator: Convergent Light bonuses (Crescendo doubles Last Chord\'s)', () => {
    const citadel = act(charged(fixture([['orvella', 'master-orvella-1'], ['ember']])), { type: 'flare', bearerId: 'orvella' }).state;
    expect(tokens(citadel, 'ember').map(token => [token.kind, token.value])).toEqual([['citadel-efficiency', .2]]);
    const chord = (round: number) => {
      const state = charged(fixture([['vaelor', 'master-vaelor-1'], ['ember']]));
      state.round = round;
      return tokens(act(state, { type: 'flare', bearerId: 'vaelor' }).state, 'ember').map(token => token.value);
    };
    expect(chord(1)).toEqual([.3]);
    expect(chord(3)).toEqual([.6]);
  });
  it('Broken Sky Imperial Metronome: Vaelor\'s Normal Attack on Tune and Crescendo', () => {
    const strike = (round: number) => {
      const state = charged(fixture([['vaelor', 'master-vaelor-3'], ['ember']]));
      state.round = round;
      return kinds(act(state, { type: 'normal', bearerId: 'vaelor', targetId: 'enemy' }).state, 'ember');
    };
    expect(strike(1)).toEqual(['tune-crit']);
    expect(strike(2)).toEqual([]);
    expect(strike(3)).toEqual(['crescendo-crit-damage']);
  });
  it('Broken-Link Continuance Engine: Unbind the Living removing Weaken gives its target Skill Power through the next turn', () => {
    const state = charged(fixture([['ilyss', 'master-ilyss-3'], ['ember']]));
    const ember = bearerOf(state, 'ember');
    ember.hp = Math.round(ember.stats.hp / 4);
    ember.buffs.push({ category: 'weaken', source: { kind: 'enemy', enemyId: 'enemy' }, magnitude: .2, remaining: 2 });
    const cast = act(state, { type: 'skill', bearerId: 'ilyss', slot: 2 }).state;
    expect(tokens(cast, 'ember')).toMatchObject([{ kind: 'unbind-power', value: .25, until: 2 }]);
    // Timed: a skill does not spend it.
    expect(kinds(act(cast, { type: 'skill', bearerId: 'ember', slot: 1, targetId: 'enemy' }).state, 'ember')).toEqual(['unbind-power']);
    expect(kinds(act(charged(fixture([['ilyss', 'master-ilyss-3'], ['ember']])), { type: 'skill', bearerId: 'ilyss', slot: 2 }).state, 'ember')).toEqual([]);
  });
  it('Sovereign Will Amplifier: Attack Up from a living Disciple adds Critical Rate', () => {
    const state = fixture([['disciple', 'master-disciple-3'], ['ember']], true);
    const before = radiantCriticalRate(state, 'ember', 'enemy');
    bearerOf(state, 'ember').buffs.push({ category: 'attack-up', source: { kind: 'skill', bearerId: 'disciple' }, magnitude: .2, remaining: 2 });
    expect(radiantCriticalRate(state, 'ember', 'enemy') - before).toBeCloseTo(.3, 9);
    bearerOf(state, 'disciple').hp = 0;
    expect(radiantCriticalRate(state, 'ember', 'enemy')).toBeCloseTo(before, 9);
    const other = fixture([['disciple', 'master-disciple-3'], ['ember'], ['tide']], true);
    bearerOf(other, 'ember').buffs.push({ category: 'attack-up', source: { kind: 'skill', bearerId: 'tide' }, magnitude: .2, remaining: 2 });
    expect(radiantCriticalRate(other, 'ember', 'enemy')).toBeCloseTo(before, 9);
  });
  it('Crosswind Imperial Drive: the ally who adds a Gust gains Luminosity Gain Up', () => {
    const state = charged(fixture([['atmoso', 'master-atmoso-3'], ['ember']]));
    Object.assign(bearerOf(state, 'atmoso').signature!, { cyclone: { coefficient: 1, perGust: .2, remaining: 2 } });
    const hit = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).state;
    expect(bearerOf(hit, 'ember').buffs).toContainEqual({ category: 'gain-up', source: { kind: 'master', bearerId: 'atmoso' }, magnitude: .3, remaining: 2 });
  });
  it('rejects forged Master bonuses', () => {
    const cast = act(charged(fixture([['ember', 'master-ember-3'], ['elise']])), { type: 'flare', bearerId: 'ember' }).state;
    const forge = (change: (token: RadiantToken) => void) => {
      const state = structuredClone(cast);
      change(bearerOf(state, 'elise').tokens![0]);
      return () => validateRadiantCombat(state);
    };
    expect(forge(() => undefined)).not.toThrow();
    expect(forge(token => { token.masterId = 'master-ember-1'; })).toThrow();
    expect(forge(token => { token.value = .41; })).toThrow();
    expect(forge(token => { token.conduitId = 'covercharge-drum'; })).toThrow();
    expect(forge(token => { token.giverId = 'elise'; })).toThrow();
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

describe('B5c1 save compatibility (standing requirement, 2026-11-20)', () => {
  const masters: Record<string, RadiantMasterId> = { ember: 'master-ember-3', bliss: 'master-bliss-3', vaelor: 'master-vaelor-1' };
  it('settles and reloads a journal with B5c1 Masters equipped', async () => {
    const transport = new LocalRadiantTransport(storageWith(['ember', 'bliss', 'vaelor'], masters), () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const settled = await send(transport, { kind: 'settle', actions: play(started.run) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
    const snapshot = { revision: 9, state: { profile: {}, starterId: 'ember', run: null, account: settled.account, radiantStudy: settled.run } };
    expect(validateRadiantRunSnapshot(snapshot).state.radiantStudy).toEqual(settled.run);
  });
  it('loads an encounter with B5c1 Masters equipped mid-run and settles it', async () => {
    const transport = new LocalRadiantTransport(storageWith(['ember', 'bliss', 'vaelor'], masters), () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const loaded = await transport.read();
    expect(loaded.notice).toBeUndefined();
    const settled = await send(transport, { kind: 'settle', actions: play(loaded.run!) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
  });
});
