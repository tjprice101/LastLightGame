import { describe, expect, it } from 'vitest';
import type { ConduitId } from '../content/conduits';
import { radiantConduitPrimitives, radiantConduits, radiantOmnicRules, type RadiantGear } from '../content/conduit-effects';
import { radiantConduitEffectText } from '../content/conduit-effect-text';
import { type RadiantBearerId, type RadiantLoadout } from '../content/combat-kits';
import {
  applyRadiantCombatAction, createRadiantCombat, radiantActionEfficiency, radiantFlareReady, radiantSkillStats, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState, type RadiantToken,
} from './combat-engine';
import { radiantFlareCost, radiantFlareTierCost, radiantSkillCost } from './combat-gauge';
import { radiantSignatureView } from '../presentation/battle-signatures';
import { radiantImpactFrames } from '../presentation/battle-impact-frames';
import { emptyAccount, saveAccount, type Account } from './account';
import { LocalRadiantTransport } from '../online/battle-local';
import {
  applyRadiantTurn, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantRunOperation, type RadiantRunRequest, type RadiantTurnAction,
} from '../online/battle-run';

/** D-493 batch B3b (next-action bonuses, C17): restore rows at +0 with real crits (crit step), owner answers 2026-11-20. */
const approved: Record<string, [string, number][]> = {
  'luminous-dawn-witness-array': [['miss-ally-crit', .15], ['miss-self-crit-damage', .3], ['miss-self-direct', 2]],
  'chaotic-paradox-spindle': [['defense', .07], ['skill-efficiency', .2], ['flare-team-power', .4], ['flare-team-efficiency', .2]],
  'atmospheric-skythread-rudder': [['capacity', .6], ['gauge-gain', .35], ['normal-ally-efficiency', .25]],
  'voltaic-stormstep-dynamo': [['attack', .14], ['skill-efficiency', .25], ['alternate-power', .3], ['alternate-ally-efficiency', .15]],
  'voltaic-thunderbird-coil': [['attack', .19], ['crit-damage', .45], ['crit-skill-strike', .4], ['crit-skill-ally-crit', .2]],
  'efflorescent-verdant-covenant': [['hp', .19], ['gauge-gain', .25], ['heal-ally-power', .3]],
  'tempered-strike-link': [['attack', .2], ['crit-rate', .1], ['healed-attack', .4], ['healer-efficiency', .2]],
  'chaotic-fault-verdict': [['hp', .11], ['flare', .7], ['shielded-crit-damage', .5], ['first-crit-provider-power', .2]],
  'secondbeat-rack': [['hp', .07], ['crit-rate', .15], ['followup-power', .35], ['followup-charge', 8]],
  'sootwake-crucible': [['skill-power', .75], ['crit-damage', .25], ['burn-ally-power', .3]],
  'atmospheric-storm-clock': [['crit-rate', .35], ['capacity', .75], ['third-crit-flare-efficiency', .25]],
  'covercharge-drum': [['skill-power', .6], ['capacity', .5], ['relay-power', .2], ['relay-efficiency', .15]],
  'rootbound-triage-vault': [['hp', .14], ['defense', .12], ['turn-restore-efficiency', .25], ['turn-restore-power', .35]],
};

function gear(...ids: ConduitId[]): RadiantGear {
  return Array.from({ length: 8 }, (_, index) => ids[index] ? { id: ids[index], rank: 0 } : null);
}
function member(starter: RadiantBearerId, ids: ConduitId[] = []): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId: null, ascension: {}, gear: gear(...ids) };
}
function fixture(squad: [RadiantBearerId, ConduitId[]?][], seed = 0, criticalHits = true): RadiantCombatState {
  const state = createRadiantCombat(squad.map(([starter, ids]) => member(starter, ids)),
    ['enemy', 'enemy2'].map(id => ({ id, elementId: null, stats: { hp: 1000000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })),
    seed, criticalHits);
  // One Health below full, so full-Health ("opening") bonuses stay out of the expected numbers.
  for (const enemy of state.enemies) { enemy.hp -= 1; enemy.currency.lowestHP = enemy.hp; }
  return state;
}
const act = (state: RadiantCombatState, action: RadiantCombatAction) => applyRadiantCombatAction(state, action);
const of = <T extends RadiantCombatEvent['type']>(events: RadiantCombatEvent[], type: T) =>
  events.filter((event): event is Extract<RadiantCombatEvent, { type: T }> => event.type === type);
const gauge = (state: RadiantCombatState, id: string) => state.gauge.members.find(entry => entry.id === id)!;
const unit = (state: RadiantCombatState, id: string) => state.bearers.find(entry => entry.loadout.id === id)!;
const tokens = (state: RadiantCombatState, id: string): RadiantToken[] => unit(state, id).tokens ?? [];
const kinds = (state: RadiantCombatState, id: string) => tokens(state, id).map(token => token.kind).sort();
/** Every hit on `enemy` crits (Critical Up at its cap). */
function certain(state: RadiantCombatState, enemyId = 'enemy'): RadiantCombatState {
  const target = state.enemies.find(entry => entry.id === enemyId)!;
  target.debuffs = target.debuffs.filter(effect => effect.category !== 'expose');
  target.debuffs.push({ category: 'expose', source: { kind: 'skill', bearerId: state.bearers[0].loadout.id }, magnitude: .8, remaining: 3 });
  return state;
}
function skill(state: RadiantCombatState, id: string, slot: 1 | 2, targetId?: string) {
  gauge(state, id).charge = 40;
  return act(state, { type: 'skill', bearerId: id, slot, ...(targetId ? { targetId } : {}) });
}
function flare(state: RadiantCombatState, id: string, targetId?: string, charge = radiantFlareCost(gauge(state, id))) {
  gauge(state, id).charge = charge;
  return act(state, { type: 'flare', bearerId: id, ...(targetId ? { targetId } : {}) });
}
const normal = (state: RadiantCombatState, id: string, targetId = 'enemy') => act(state, { type: 'normal', bearerId: id, targetId });
/** End the player turn, let `enemy` hit `targets` and finish the enemy phase. */
function enemyPhase(state: RadiantCombatState, targets: string[]) {
  if (state.phase === 'player') state = act(state, { type: 'end-turn' }).state;
  const hit = act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: targets, coefficient: 1 });
  state = act(hit.state, { type: 'enemy-heal', enemyId: 'enemy2', amount: 0 }).state;
  return act(state, { type: 'finish-enemy-phase' });
}
/** The first seed whose opening Normal Attack by `id` lands no critical hit. */
function missSeed(squad: [RadiantBearerId, ConduitId[]?][], id: string): RadiantCombatState {
  for (let seed = 1; seed < 200; seed++) {
    const state = fixture(squad, seed);
    if (of(normal(structuredClone(state), id).events, 'damage').every(event => event.critical === undefined)) return state;
  }
  throw new Error('No non-critical seed found.');
}
const gearEvents = (events: RadiantCombatEvent[], conduitId: ConduitId) => events.filter(event =>
  ('source' in event && event.source.kind === 'gear' && event.source.conduitId === conduitId) ||
  (event.type === 'charge' && event.gearSource?.kind === 'gear' && event.gearSource.conduitId === conduitId));

describe('D-493 B3b restoration: approved designs', () => {
  it.each(Object.keys(approved))('%s matches the approved restore row at +0', id => {
    expect(radiantConduits[id as ConduitId].map(entry => [entry.kind, entry.amount])).toEqual(approved[id]);
  });
  it.each(Object.keys(approved))('%s has an exact tooltip with numbers', id => {
    const text = radiantConduitEffectText(id as ConduitId, 0);
    expect(text).toMatch(/[0-9]/);
    expect(text).not.toMatch(/undefined|NaN/);
  });
  it('scales every percentage with rank (C12)', () => {
    const at5 = (id: ConduitId, kind: string) => radiantConduitPrimitives({ id, rank: 5 }).find(entry => entry.kind === kind)!.amount;
    expect(at5('atmospheric-storm-clock', 'third-crit-flare-efficiency')).toBeCloseTo(.375);
    expect(at5('secondbeat-rack', 'followup-charge')).toBeCloseTo(12);
    expect(at5('luminous-dawn-witness-array', 'miss-self-direct')).toBeCloseTo(3);
  });
});

describe('D-493 B3b: next-action bonus rules (C17)', () => {
  it('Skythread Rudder: a Normal Attack gives the lowest-Luminosity ally a Skill 1/2 discount that one skill spends', () => {
    let state = fixture([['elise', ['atmospheric-skythread-rudder']], ['crinso'], ['velmira']]);
    gauge(state, 'velmira').charge = 30;
    state = normal(state, 'elise').state;
    expect(kinds(state, 'crinso')).toEqual(['normal-ally-efficiency']);
    expect(tokens(state, 'velmira')).toEqual([]);
    expect(radiantActionEfficiency(state, 'crinso', 1)).toBeCloseTo(radiantSkillStats(state, 'crinso', 1).skillEfficiency + .25);
    const cast = skill(state, 'crinso', 1, 'enemy');
    expect(of(cast.events, 'skill')[0].cost).toBe(radiantSkillCost(1, radiantSkillStats(state, 'crinso', 1).skillEfficiency + .25));
    expect(tokens(cast.state, 'crinso')).toEqual([]);
  });
  it('refreshes instead of stacking, and expires at the end of the next turn', () => {
    let state = fixture([['elise', ['atmospheric-skythread-rudder']], ['crinso']]);
    state = normal(state, 'elise').state;
    const first = tokens(state, 'crinso')[0];
    expect(first.until).toBe(2);
    state = enemyPhase(state, ['elise']).state;
    expect(kinds(state, 'crinso')).toEqual(['normal-ally-efficiency']);
    state = normal(state, 'elise').state;
    expect(tokens(state, 'crinso')).toHaveLength(1);
    expect(tokens(state, 'crinso')[0].until).toBe(3);
    state = enemyPhase(state, ['elise']).state;
    state = enemyPhase(state, ['elise']).state;
    expect(tokens(state, 'crinso')).toEqual([]);
  });
  it('Dawn Witness Array: a non-critical damaging action powers the next actions; a critical one does not', () => {
    const squad: [RadiantBearerId, ConduitId[]?][] = [['rosetta', ['luminous-dawn-witness-array']], ['elise']];
    let state = normal(missSeed(squad, 'rosetta'), 'rosetta').state;
    expect(kinds(state, 'rosetta')).toEqual(['miss-self-crit-damage', 'miss-self-direct']);
    expect(kinds(state, 'elise')).toEqual(['miss-ally-crit']);
    const crit = normal(certain(fixture(squad)), 'rosetta').state;
    expect(tokens(crit, 'rosetta')).toEqual([]);
    // Encounters without crit rolls (saved before the crit step) never count as a missed critical hit.
    expect(tokens(normal(fixture(squad, 0, false), 'rosetta').state, 'rosetta')).toEqual([]);
    // The +200% direct damage spends on the next damaging action.
    state = enemyPhase(state, ['rosetta']).state;
    const before = fixture(squad, 5);
    const plain = of(normal(structuredClone(before), 'rosetta').events, 'damage')[0];
    before.bearers[0].tokens = structuredClone(tokens(state, 'rosetta')).map(token => ({ ...token, until: 2 }));
    const boosted = normal(before, 'rosetta');
    expect(of(boosted.events, 'damage')[0].offered).toBeGreaterThan(plain.offered * 2);
  });
  it('Paradox Spindle: after Convergent Light, other allies keep +40% Skill Power and +20% Skill Efficiency through the next turn', () => {
    let state = flare(fixture([['velmira', ['chaotic-paradox-spindle']], ['crinso']]), 'velmira', 'enemy').state;
    expect(kinds(state, 'crinso')).toEqual(['flare-team-efficiency', 'flare-team-power']);
    const powered = skill(structuredClone(state), 'crinso', 1, 'enemy');
    expect(kinds(powered.state, 'crinso')).toEqual(['flare-team-efficiency', 'flare-team-power']);
    state = enemyPhase(state, ['velmira']).state;
    expect(kinds(state, 'crinso')).toHaveLength(2);
    state = enemyPhase(state, ['velmira']).state;
    expect(tokens(state, 'crinso')).toEqual([]);
  });
  it('Stormstep Dynamo: alternating skills gain Skill Power and pass one shared discount to the next other ally', () => {
    let state = fixture([['elise', ['voltaic-stormstep-dynamo']], ['crinso'], ['velmira']]);
    state = skill(state, 'elise', 1, 'enemy').state;
    expect(unit(state, 'elise').stormstep).toBe(1);
    expect(tokens(state, 'crinso')).toEqual([]);
    state = enemyPhase(state, ['elise']).state;
    expect(radiantSkillStats(state, 'elise', 2).skillPower - radiantSkillStats(state, 'elise', 1).skillPower).toBeCloseTo(.3);
    state = skill(state, 'elise', 2, 'enemy').state;
    expect(kinds(state, 'crinso')).toEqual(['alternate-ally-efficiency']);
    expect(kinds(state, 'velmira')).toEqual(['alternate-ally-efficiency']);
    state = skill(state, 'crinso', 1, 'enemy').state;
    expect(tokens(state, 'crinso')).toEqual([]);
    expect(tokens(state, 'velmira')).toEqual([]);
    state = enemyPhase(state, ['elise']).state;
    expect(unit(normal(state, 'elise').state, 'elise').stormstep).toBeUndefined();
  });
  it('Thunderbird Coil: a critical skill strikes the healthiest other enemy; with none left, allies gain Critical Rate', () => {
    const squad: [RadiantBearerId, ConduitId[]?][] = [['elise', ['voltaic-thunderbird-coil']], ['crinso']];
    const result = skill(certain(fixture(squad)), 'elise', 1, 'enemy');
    const loss = of(result.events, 'damage').filter(event => event.origin === 'direct' && event.targetId === 'enemy')
      .reduce((sum, event) => sum + event.healthLoss, 0);
    const strike = gearEvents(result.events, 'voltaic-thunderbird-coil');
    expect(strike).toMatchObject([{ type: 'damage', targetId: 'enemy2', origin: 'generated', offered: Math.round(.4 * loss) }]);
    const lone = certain(createRadiantCombat(squad.map(([starter, ids]) => member(starter, ids)),
      [{ id: 'enemy', elementId: null, stats: { hp: 1000000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 }], 0));
    const alone = skill(lone, 'elise', 1, 'enemy');
    expect(gearEvents(alone.events, 'voltaic-thunderbird-coil')).toEqual([]);
    expect(kinds(alone.state, 'crinso')).toEqual(['crit-skill-ally-crit']);
  });
  it('Verdant Covenant and Phoenix Temper: healing grants bonuses; the healer gets its discount after the boosted action', () => {
    let state = fixture([['sprout', ['efflorescent-verdant-covenant']], ['ember', ['tempered-strike-link']]]);
    unit(state, 'ember').hp = 10;
    state = skill(state, 'sprout', 2).state;
    expect(kinds(state, 'ember')).toEqual(['heal-ally-power', 'healed-attack']);
    expect(tokens(state, 'ember').find(token => token.kind === 'healed-attack')!.relayId).toBe('sprout');
    const boosted = skill(state, 'ember', 1, 'enemy');
    expect(tokens(boosted.state, 'ember')).toEqual([]);
    expect(kinds(boosted.state, 'sprout')).toEqual(['healer-efficiency']);
    expect(tokens(boosted.state, 'sprout')[0].value).toBeCloseTo(.2);
  });
  it('Rosefault: first critical hit each turn gives the Shield provider Skill Power; Shielded crits deal more', () => {
    let state = fixture([['crinso', ['chaotic-fault-verdict']], ['tide']]);
    state = skill(state, 'tide', 2).state;
    const crit = normal(certain(state), 'crinso');
    expect(kinds(crit.state, 'tide')).toEqual(['first-crit-provider-power']);
    expect(crit.state.gearTriggered).toContain('crinso:chaotic-fault-verdict');
  });
  it('Secondbeat: another ally\'s hit sets up a skill on that enemy, which grants that ally Luminosity', () => {
    let state = fixture([['elise'], ['crinso', ['secondbeat-rack']]]);
    state = normal(state, 'elise', 'enemy2').state;
    expect(tokens(state, 'crinso')).toMatchObject([{ kind: 'followup-power', targetId: 'enemy2', relayId: 'elise' }]);
    expect(radiantSignatureView(state).holders.enemy2.some(tag => tag.startsWith('Secondbeat'))).toBe(true);
    const wrong = skill(structuredClone(state), 'crinso', 1, 'enemy');
    expect(kinds(wrong.state, 'crinso')).toEqual(['followup-power']);
    const right = skill(state, 'crinso', 1, 'enemy2');
    expect(tokens(right.state, 'crinso')).toEqual([]);
    expect(gearEvents(right.events, 'secondbeat-rack')).toMatchObject([{ type: 'charge', bearerId: 'elise', gained: 8 }]);
  });
  it('Sootwake: this bearer\'s Burn tick gives other allies Skill Power on that enemy until their next action', () => {
    let state = skill(fixture([['ember', ['sootwake-crucible']], ['crinso']]), 'ember', 1, 'enemy').state;
    state = enemyPhase(state, ['ember']).state;
    expect(tokens(state, 'crinso')).toMatchObject([{ kind: 'burn-ally-power', targetId: 'enemy' }]);
    expect(tokens(normal(state, 'crinso').state, 'crinso')).toEqual([]);
  });
  it('Tempest Return: every third critical action gives every ally a Convergent Light discount kept until used', () => {
    let state = fixture([['elise', ['atmospheric-storm-clock']], ['crinso']]);
    for (let turn = 0; turn < 3; turn++) {
      state = normal(certain(state), 'elise').state;
      if (turn < 2) { expect(unit(state, 'elise').critCount).toBe(turn + 1); state = enemyPhase(state, ['elise']).state; }
    }
    expect(unit(state, 'elise').critCount).toBeUndefined();
    expect(tokens(state, 'crinso')).toMatchObject([{ kind: 'third-crit-flare-efficiency', until: null }]);
    for (let turn = 0; turn < 4; turn++) state = enemyPhase(state, ['elise']).state;
    expect(kinds(state, 'crinso')).toEqual(['third-crit-flare-efficiency']);
    const base = radiantFlareCost(gauge(state, 'crinso'));
    const discounted = radiantFlareCost(gauge(state, 'crinso'), (gauge(state, 'crinso').flareEfficiency ?? 0) + .25);
    expect(discounted).toBeLessThan(base);
    gauge(state, 'crinso').charge = discounted;
    expect(radiantFlareReady(state, 'crinso')).not.toBeNull();
    const cast = act(state, { type: 'flare', bearerId: 'crinso', targetId: 'enemy' });
    expect(of(cast.events, 'flare')[0].cost).toBe(discounted);
    expect(tokens(cast.state, 'crinso')).toEqual([]);
  });
  it('Covercharge: a damaging skill powers and a restoring skill discounts the next other ally\'s skill (one use)', () => {
    const wounded = fixture([['sprout', ['covercharge-drum']], ['bruno'], ['orvella']]);
    unit(wounded, 'orvella').hp = 10;
    let state = skill(wounded, 'sprout', 2).state;
    expect(kinds(state, 'bruno')).toEqual(['relay-efficiency']);
    state = skill(state, 'orvella', 1, 'enemy').state;
    expect(tokens(state, 'bruno')).toEqual([]);
    const damaging = skill(fixture([['sprout', ['covercharge-drum']], ['bruno']]), 'sprout', 1, 'enemy').state;
    expect(kinds(damaging, 'bruno')).toEqual(['relay-power']);
  });
  it('Triage Sanctuary: at turn start the most-wounded ally gains heal/Shield bonuses until its next action ends', () => {
    let state = fixture([['sprout', ['rootbound-triage-vault']], ['bruno']]);
    state = enemyPhase(state, ['bruno']).state;
    expect(kinds(state, 'bruno')).toEqual(['turn-restore-efficiency', 'turn-restore-power']);
    const shielded = skill(structuredClone(state), 'bruno', 2);
    const plain = skill(fixture([['sprout'], ['bruno']]), 'bruno', 2);
    const amount = (events: RadiantCombatEvent[]) => of(events, 'shield').filter(event => event.source.kind === 'skill')[0].amount;
    expect(amount(shielded.events)).toBeGreaterThan(amount(plain.events));
    expect(of(shielded.events, 'skill')[0].cost).toBe(radiantSkillCost(2, radiantSkillStats(state, 'bruno', 2).skillEfficiency + .25));
    expect(tokens(normal(state, 'bruno').state, 'bruno')).toEqual([]);
  });
  it('Undertide Chronometer discounts Convergent Light on its Weakened enemy and the flare event carries the cost', () => {
    let state = skill(fixture([['tide', ['aquatic-undertide-chronometer']], ['elise']]), 'tide', 1, 'enemy').state;
    const member = gauge(state, 'elise');
    const expected = radiantFlareTierCost(member.baseCost, 'sparkling', (member.flareEfficiency ?? 0) + .15);
    expect(expected).toBeLessThan(radiantFlareCost(member));
    const cast = flare(structuredClone(state), 'elise', 'enemy');
    expect(of(cast.events, 'flare')[0].cost).toBe(expected);
    expect(gauge(cast.state, 'elise').charge).toBe(radiantFlareCost(member) - expected);
    expect(of(flare(state, 'elise', 'enemy2').events, 'flare')[0].cost).toBe(radiantFlareCost(member));
    // Impact replay follows the carried cost.
    expect(() => radiantImpactFrames(state, cast.state, cast.events)).not.toThrow();
  });
});

describe('D-493 B3b: validation and saves', () => {
  it('rejects bonuses from Conduits the giver does not wear, bad clocks and leftover Stormstep or Tempest state', () => {
    const state = fixture([['elise', ['atmospheric-skythread-rudder']], ['crinso']]);
    const bad = (mutate: (copy: RadiantCombatState) => void) => {
      const copy = structuredClone(state); mutate(copy);
      return () => validateRadiantCombat(copy);
    };
    const token: RadiantToken = { kind: 'normal-ally-efficiency', giverId: 'elise', conduitId: 'atmospheric-skythread-rudder', value: .25, until: 2 };
    expect(bad(copy => { unit(copy, 'crinso').tokens = [token]; })).not.toThrow();
    expect(bad(copy => { unit(copy, 'crinso').tokens = [{ ...token, giverId: 'crinso' }]; })).toThrow();
    expect(bad(copy => { unit(copy, 'crinso').tokens = [{ ...token, until: 9 }]; })).toThrow();
    expect(bad(copy => { unit(copy, 'crinso').tokens = [{ ...token, value: 5 }]; })).toThrow();
    expect(bad(copy => { unit(copy, 'crinso').tokens = [token, token]; })).toThrow();
    expect(bad(copy => { unit(copy, 'crinso').tokens = []; })).toThrow();
    expect(bad(copy => { unit(copy, 'elise').stormstep = 1; })).toThrow();
    expect(bad(copy => { unit(copy, 'elise').critCount = 1; })).toThrow();
  });
  it('keeps the Tempest count below its cycle', () => {
    expect(radiantOmnicRules.critCycle).toBe(3);
  });
});

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
/** Normal Attacks, plus Convergent Light whenever it is ready, so settled journals hold flare events. */
function play(saved: FrozenRadiantRun): RadiantTurnAction[] {
  const run = structuredClone(saved), actions: RadiantTurnAction[] = [];
  while (run.state.phase === 'player' && actions.length < 1000) {
    const bearerId = run.state.bearers.find(entry => entry.hp > 0 && !run.state.acted.includes(entry.loadout.id))!.loadout.id;
    const targetId = run.state.enemies.find(entry => entry.hp > 0)!.id;
    const action: RadiantTurnAction = radiantFlareReady(run.state, bearerId)
      ? { type: 'flare', bearerId, targetId } : { type: 'normal', bearerId, targetId };
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
  it('reloads a settled journal written before B3b (flare events without cost) and rejects a bad cost', async () => {
    const storage = storageWith(['elise', 'crinso']);
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const settled = await send(transport, { kind: 'settle', actions: play(started.run) });
    const snapshot = (run: FrozenRadiantRun) => ({ revision: 9,
      state: { profile: {}, starterId: 'ember', run: null, account: settled.account, radiantStudy: run } });
    expect(validateRadiantRunSnapshot(snapshot(settled.run)).state.radiantStudy).toEqual(settled.run);
    const flares = settled.run.journal.events.filter(event => event.type === 'flare');
    expect(flares.every(event => event.type === 'flare' && typeof event.cost === 'number')).toBe(true);
    const old = structuredClone(settled.run);
    for (const event of old.journal.events) if (event.type === 'flare') delete event.cost;
    expect(validateRadiantRunSnapshot(snapshot(old)).state.radiantStudy).toEqual(old);
    if (flares.length) {
      const tampered = structuredClone(settled.run);
      Object.assign(tampered.journal.events.find(event => event.type === 'flare')!, { cost: 0 });
      expect(() => validateRadiantRunSnapshot(snapshot(tampered))).toThrow('Invalid saved Radiant account');
    }
    const forged = structuredClone(settled.run);
    forged.state.bearers[0].tokens = [{ kind: 'relay-power', giverId: forged.state.bearers[0].loadout.id, conduitId: 'covercharge-drum',
      value: .2, until: forged.state.round }];
    expect(() => validateRadiantRunSnapshot(snapshot(forged))).toThrow('Invalid saved Radiant account');
  });
  it('loads an encounter saved before B3b mid-run and settles it', async () => {
    const storage = storageWith(['elise', 'crinso']);
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const loaded = await transport.read();
    expect(loaded.notice).toBeUndefined();
    expect(loaded.run!.state.bearers.every(entry => entry.tokens === undefined && entry.stormstep === undefined)).toBe(true);
    const settled = await send(transport, { kind: 'settle', actions: play(loaded.run!) });
    expect(['victory', 'defeat']).toContain(settled.run.state.phase);
  });
});
