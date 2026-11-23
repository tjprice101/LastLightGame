import { describe, expect, it } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { emptyAccount, type Account } from '../game/account';
import { createCreatureCopy } from '../game/character-instances';
import { createRadiantCombat, depleteRadiantCurrency, validateRadiantCombat } from '../game/combat-engine';
import { adaptRadiantPressureEncounter } from '../game/enemy-pressure-encounters';
import { chooseRadiantPressureAction } from '../game/enemy-pressure';
import { pressureRadiantCalibration } from '../content/enemy-calibration';
import { releasedRadiantIds } from '../content/combat-kits';
import { squadMemberLimit } from '../content/squad-rules';
import { applyRadiantTurn, executeRadiantRun, radiantAccountLoadouts, radiantRpcRepository, resolveRadiantRun,
  retiredRadiantRunNotice, retiredRunVersion, validateRadiantRunResponse, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantGameRpc, type RadiantPlayerAction, type RadiantRunAuthority,
  type RadiantRunOperation, type RadiantRunRequest, type RadiantRunResponse, type RadiantRunSnapshot,
  type RadiantTurnAction } from './battle-run';

let sequence = 0;
const entries = new Map<string, ReturnType<RadiantRunAuthority['entry']>>();
function id(): string { return `00000000-0000-4000-8000-${(++sequence).toString(16).padStart(12, '0')}`; }
function account(n = 1): Account {
  const result = emptyAccount();
  result.squad = releasedRadiantIds.slice(0, n);
  result.squad.forEach(member => { result.characters[member as keyof Account['characters']] = {
    level: 0, evolution: 1, weaponRank: 0 };
  });
  return result;
}
function snapshot(n = 1): RadiantRunSnapshot {
  const game = freshGame('study-player');
  game.starterId = 'ember'; game.account = account(n);
  return { revision: 0, state: game };
}
function authority(): RadiantRunAuthority {
  return { capability: 'isolated-radiant-study', now: Date.UTC(2026, 10, 8),
    entry: requestId => {
      if (!entries.has(requestId)) entries.set(requestId,
        { runId: id(), encounterSeed: 1729, chargeSeed: 104729, targetSeed: 7 });
      return structuredClone(entries.get(requestId)!);
    } };
}
function request(value: RadiantRunSnapshot, operation: RadiantRunOperation): RadiantRunRequest {
  return { requestId: id(), expectedRevision: value.revision,
    runId: operation.kind === 'start' ? null : value.state.radiantStudy!.id,
    encounter: operation.kind === 'start' ? null : value.state.radiantStudy!.encounter, operation };
}
const start: RadiantRunOperation = { kind: 'start', activity: { kind: 'training' }, calibration: 'radiant-pressure-v2' };
function entered(n = 1): RadiantRunSnapshot {
  const before = snapshot(n), result = resolveRadiantRun(before, request(before, start), authority());
  return { revision: result.response.revision, state: result.state };
}
/** The next device input: the first living member yet to act attacks the first living enemy. */
function nextAction(run: FrozenRadiantRun): RadiantPlayerAction {
  return { type: 'normal',
    bearerId: run.state.bearers.find(unit => unit.hp > 0 && !run.state.acted.includes(unit.loadout.id))!.loadout.id,
    targetId: run.state.enemies.find(unit => unit.hp > 0)!.id };
}
/** Device play (D-471): resolves turns locally on a copy of the saved run until the encounter ends. */
function play(value: RadiantRunSnapshot, limit = 1000): { run: FrozenRadiantRun; actions: RadiantTurnAction[] } {
  const run = structuredClone(value.state.radiantStudy!), actions: RadiantTurnAction[] = [];
  while (run.state.phase === 'player' && actions.length < limit) {
    const action = nextAction(run);
    run.journal.events.push(...applyRadiantTurn(run, action));
    actions.push(action);
  }
  return { run, actions };
}
function settleOp(value: RadiantRunSnapshot): RadiantRunOperation {
  const { run, actions } = play(value);
  expect(['victory', 'defeat']).toContain(run.state.phase);
  return { kind: 'settle', actions };
}
function step(value: RadiantRunSnapshot, operation: RadiantRunOperation): RadiantRunSnapshot {
  const result = resolveRadiantRun(value, request(value, operation), authority());
  return { revision: result.response.revision, state: result.state };
}
function settled(value: RadiantRunSnapshot): RadiantRunSnapshot { return step(value, settleOp(value)); }
/** Mimics the existing SQL RPC's row lock, duplicate-before-CAS order and
 * aggregate+request transaction. No separate wallet save exists in this store. */
class AtomicRpc implements RadiantGameRpc {
  current: RadiantRunSnapshot;
  receipts = new Map<string, { hash: string; response: RadiantRunResponse }>();
  writes = 0;
  denied = false;
  constructor(value = snapshot()) { this.current = structuredClone(value); }
  async rpc(name: 'find_game_request' | 'commit_game_operation', args: Record<string, unknown>) {
    const cached = this.receipts.get(args.p_request as string);
    if (cached) return cached.hash !== args.p_fingerprint
      ? { data: null, error: { code: 'P0001', message: 'Request ID reused with different input' } }
      : { data: structuredClone(cached.response), error: null };
    if (name === 'find_game_request') return { data: null, error: null };
    if (this.denied) return { data: null, error: 'Denied before transaction commit' };
    if (this.current.revision !== args.p_revision)
      return { data: { conflict: true, revision: this.current.revision }, error: null };
    const revision = this.current.revision + 1;
    const state = structuredClone(args.p_state) as RadiantRunSnapshot['state'];
    const response = { ...structuredClone(args.p_response) as RadiantRunResponse, revision };
    this.current = { revision, state };
    this.receipts.set(args.p_request as string, { hash: args.p_fingerprint as string, response });
    this.writes++;
    return { data: structuredClone(response), error: null };
  }
  repository() {
    return radiantRpcRepository(this, 'server-authenticated-user', async () => structuredClone(this.current));
  }
}

describe('actual saved Account to frozen radiant loadouts', () => {
  it.each([1, 2, 3])('derives exactly %i acquired members read-only', n => {
    const value = account(n), raw = structuredClone(value);
    const members = radiantAccountLoadouts(value);
    expect(members.map(member => member.id)).toEqual(value.squad);
    expect(members).toHaveLength(n);
    expect(value).toEqual(raw);
  });
  it('plays a stored pre-D-471 six-member squad as its first three without rewriting it', () => {
    const value = account(6), raw = structuredClone(value);
    const members = radiantAccountLoadouts(value);
    expect(members.map(member => member.id)).toEqual(value.squad!.slice(0, squadMemberLimit));
    expect(value).toEqual(raw);
  });

  describe('atomic captured kill loot through the radiant run', () => {
    it('denied capture settle retries the identical deterministic UUID and saved outcome', async () => {
      let captured = false;
      for (let encounterSeed = 1; encounterSeed <= 60 && !captured; encounterSeed++) {
        const value = snapshot();
        value.state.account.characters.ember = { level: 105, evolution: 6, weaponRank: 0 };
        const rpc = new AtomicRpc(value), repository = rpc.repository();
        const auth = authority(), originalEntry = auth.entry;
        auth.entry = requestId => ({ ...originalEntry(requestId), encounterSeed });
        await executeRadiantRun(repository, request(rpc.current, {
          kind: 'start', activity: { kind: 'infusion', mode: 'heavens', stage: 1 }, calibration: 'radiant-pressure-v2',
        }), auth);
        const req = request(rpc.current, settleOp(rpc.current));
        const planned = resolveRadiantRun(rpc.current, req, auth);
        if (!planned.response.rewards.some(reward => reward.capture)) continue;
        const raw = structuredClone(rpc.current);
        rpc.denied = true;
        await expect(executeRadiantRun(repository, req, auth)).rejects.toMatchObject({ code: 'denied-write' });
        expect(rpc.current).toEqual(raw);
        rpc.denied = false;
        const saved = await executeRadiantRun(repository, req, auth);
        expect(saved).toEqual(planned.response);
        expect(saved.account.capturedCharacters).toHaveLength(1);
        const cached = await executeRadiantRun(repository, req, auth);
        expect(cached).toEqual(saved);
        expect(rpc.current.state.account.capturedCharacters).toHaveLength(1);
        captured = true;
      }
      expect(captured).toBe(true);
    });
  });
  it('freezes actual binary ascensions, growth, ordinary ranks and personal Master', () => {
    const value = account();
    value.characters.ember = { level: 105, evolution: 6, weaponRank: 7,
      ascension: { stats: true, skill1: true, lastFlare: true } };
    value.conduits = { 'fieldbrace-coupler': 3 };
    value.conduitUpgrades = { 'fieldbrace-coupler': 4 };
    value.conduitEquipment = { ember: ['fieldbrace-coupler', null, null, null, null, null, null, null] };
    value.masterConduits = { 'master-ember-1': 1 };
    value.masterEquipment = { ember: 'master-ember-1' };
    const members = radiantAccountLoadouts(value);
    expect(members[0]).toMatchObject({ level: 105, form: 6, weaponRank: 7,
      masterId: 'master-ember-1', ascension: value.characters.ember.ascension,
      gear: [{ id: 'fieldbrace-coupler', rank: 4 }, null, null, null, null, null, null, null] });
    value.characters.ember.level = 106;
    value.conduitUpgrades['fieldbrace-coupler'] = 5;
    expect(members[0].level).toBe(105);
    expect(members[0].gear![0]!.rank).toBe(4);
  });
  it.each([
    undefined, [], ['ember', 'ember'], ['capture:unowned'], ['missing'], ['rhaziel'],
  ])('explicit manual denial of invalid squad %j without repair', squad => {
    const value = account(6);
    value.squad = squad;
    const before = structuredClone(value);
    expect(() => radiantAccountLoadouts(value)).toThrow(expect.objectContaining({ code: 'manual-squad' }));
    expect(value).toEqual(before);
  });
  it('denies a released but unacquired member, unowned gear, and nonbinary ascension', () => {
    const value = account();
    value.squad = ['tide'];
    expect(() => radiantAccountLoadouts(value)).toThrow();
    value.squad = ['ember'];
    value.conduitEquipment = { ember: ['fieldbrace-coupler', null, null, null, null, null, null, null] };
    expect(() => radiantAccountLoadouts(value)).toThrow();
    value.conduitEquipment = {};
    value.characters.ember!.ascension = { stats: 2 } as never;
    expect(() => radiantAccountLoadouts(value)).toThrow();
  });
});

describe('authority-ready frozen run and settled encounter Haul', () => {
  it('uses actual authored enemies, explicit shared calibration and minimum currency table', () => {
    const value = entered(), run = value.state.radiantStudy!;
    expect(run.version).toBe(9);
    expect(run.enemies).toEqual(adaptRadiantPressureEncounter(run.anchor, 1729, pressureRadiantCalibration));
    expect(run.state.chargeSeed).toBe(104729);
    expect(run.targetSeed).toBe(7);
    expect(run.state.currencyEarned).toBe(0);
    expect(run.state.enemies.every(enemy => enemy.currency.budget > 0)).toBe(true);
    expect(value.state.account.receipts).toEqual([]);
  });
  it.each([1, 2, 3])('atomically enters the actual saved %i-member squad', async n => {
    const rpc = new AtomicRpc(snapshot(n));
    const before = structuredClone(rpc.current);
    const response = await executeRadiantRun(rpc.repository(), request(before, start), authority());
    expect(response.run.initial.bearers.map(unit => unit.loadout.id)).toEqual(before.state.account.squad);
    expect(rpc.current.state.account.squad).toEqual(before.state.account.squad);
    expect(rpc.writes).toBe(1); expect(rpc.receipts.size).toBe(1);
    expect(rpc.current.state.run).toBeNull();
  });
  it('enters a stored six-member squad as its first three and keeps the stored squad unchanged', async () => {
    const rpc = new AtomicRpc(snapshot(6));
    const before = structuredClone(rpc.current);
    const response = await executeRadiantRun(rpc.repository(), request(before, start), authority());
    expect(response.run.initial.bearers.map(unit => unit.loadout.id))
      .toEqual(before.state.account.squad!.slice(0, squadMemberLimit));
    expect(rpc.current.state.account.squad).toEqual(before.state.account.squad);
  });
  it('persists actual owned final-form investment and Master without normalizing the raw wallet', async () => {
    const before = snapshot();
    before.state.account.characters.ember = { level: 105, evolution: 6, weaponRank: 8,
      ascension: { stats: true, skill1: true, lastFlare: true } };
    before.state.account.conduits = { 'fieldbrace-coupler': 2 };
    before.state.account.conduitUpgrades = { 'fieldbrace-coupler': 4 };
    before.state.account.conduitEquipment = {
      ember: ['fieldbrace-coupler', null, null, null, null, null, null, null] };
    before.state.account.masterConduits = { 'master-ember-1': 1 };
    before.state.account.masterEquipment = { ember: 'master-ember-1' };
    const rpc = new AtomicRpc(before);
    const result = await executeRadiantRun(rpc.repository(), request(before, start), authority());
    expect(result.run.initial.bearers[0].loadout).toMatchObject({
      level: 105, form: 6, weaponRank: 8, masterId: 'master-ember-1',
      ascension: before.state.account.characters.ember.ascension,
      gear: [{ id: 'fieldbrace-coupler', rank: 4 }, null, null, null, null, null, null, null],
    });
    expect(result.account.masterConduits).toEqual(before.state.account.masterConduits);
    expect(result.account.conduitEquipment).toEqual(before.state.account.conduitEquipment);
    expect(result.account.characters).toEqual(before.state.account.characters);
  });
  it('raw captured copies, fodder, locks, loadouts and ALL holdings survive entry and settle', () => {
    const before = snapshot();
    const copy = createCreatureCopy('infusion:heavens:0');
    copy.locked = true;
    Object.assign(before.state.account, { capturedCharacters: [copy], characterLocks: { ember: true },
      materials: { 'infernic-common': 12 }, lycalis: 83, mechanicalComponents: 9,
      conduits: { 'fieldbrace-coupler': 2 }, conduitUpgrades: { 'fieldbrace-coupler': 3 },
      squadLoadouts: [{ id: id(), name: 'Saved squad', members: [
        { character: 'ember', name: 'Infernis', element: 'infernic', conduits: Array(8).fill(null), master: null },
      ] }] });
    // Check the actual schema with entry before comparing raw holdings.
    const result = resolveRadiantRun(before, request(before, start), authority());
    const next = settled({ state: result.state, revision: result.response.revision });
    for (const [key, value] of Object.entries(before.state.account))
      if (!['fractalis', 'receipts', 'acquisitionMarkers', 'creatures'].includes(key))
        expect(next.state.account[key as keyof Account], key).toEqual(value);
    expect(before.state.account.receipts).toEqual([]);
  });
  it('replays the log on the prior frozen state; menu edits never alter combat investment', () => {
    const before = entered();
    before.state.account.characters.ember = { level: 90, evolution: 6, weaponRank: 9 };
    before.state.account.squad = ['tide'];
    before.state.account.characters.tide = { level: 0, evolution: 1 };
    const frozen = structuredClone(before.state.radiantStudy!.state.bearers[0]);
    const next = settled(before);
    expect(next.state.radiantStudy!.state.bearers[0].loadout).toEqual(frozen.loadout);
    expect(next.state.radiantStudy!.state.bearers[0].stats).toEqual(frozen.stats);
    expect(next.state.account.characters.ember!.level).toBe(90);
  });
  it('settle replay equals the device-played state and saves exactly its Haul', () => {
    const before = entered(3), local = play(before);
    const result = resolveRadiantRun(before, request(before, { kind: 'settle', actions: local.actions }), authority());
    expect(result.response.run.state).toEqual(local.run.state);
    expect(result.response.run.targetSeed).toBe(local.run.targetSeed);
    expect(result.response.account.fractalis - before.state.account.fractalis).toBe(local.run.state.currencyEarned);
    expect(result.response.account.receipts.filter(receipt => receipt.startsWith('radiant-study:v2:'))).toHaveLength(1);
  });
  it('settle replays device Skill 1 / Skill 2 / Convergent Light choices exactly and rejects the retired Defend choice (D-473)', () => {
    const before = entered(3), run = structuredClone(before.state.radiantStudy!), actions: RadiantTurnAction[] = [];
    while (run.state.phase === 'player' && actions.length < 1000) {
      const actor = run.state.bearers.find(unit => unit.hp > 0 && !run.state.acted.includes(unit.loadout.id))!;
      const action = chooseRadiantPressureAction(run.state, actor.loadout.id, 'balanced') as RadiantTurnAction;
      run.journal.events.push(...applyRadiantTurn(run, action));
      actions.push(action);
    }
    expect(actions.some(action => action.type === 'skill')).toBe(true);
    expect(['victory', 'defeat']).toContain(run.state.phase);
    const result = resolveRadiantRun(before, request(before, { kind: 'settle', actions }), authority());
    expect(result.response.run.state).toEqual(run.state);
    expect(result.response.run.targetSeed).toBe(run.targetSeed);
    const defend = [{ type: 'defense', bearerId: run.state.bearers[0].loadout.id }] as unknown as RadiantTurnAction[];
    expect(() => resolveRadiantRun(before, request(before, { kind: 'settle', actions: defend }), authority()))
      .toThrow('Only player choices');
    const badSlot = [{ type: 'skill', bearerId: run.state.bearers[0].loadout.id, slot: 3 }] as unknown as RadiantTurnAction[];
    expect(() => resolveRadiantRun(before, request(before, { kind: 'settle', actions: badSlot }), authority()))
      .toThrow('skill slot');
  });
  it('device turns bank nothing; shields block currency; settle pays floor(B*lowest legitimate HP loss/M)', () => {
    const before = entered(), run = structuredClone(before.state.radiantStudy!);
    const enemy = run.state.enemies[0];
    enemy.shields = [{ id: 1, source: { kind: 'enemy', enemyId: enemy.id }, remaining: 100000 }];
    run.state.nextShieldId = 2;
    applyRadiantTurn(run, nextAction(run));
    expect(run.state.currencyEarned).toBe(0);
    expect(run.state.enemies[0].currency.lowestHP).toBe(enemy.hp);
    const raw = entered();
    const paid = settled(raw);
    const state = paid.state.radiantStudy!.state;
    const expected = state.enemies.reduce((sum, unit) =>
      sum + Number(BigInt(unit.currency.budget) * BigInt(unit.currency.baselineHP - unit.currency.lowestHP) /
        BigInt(unit.currency.baselineHP)), 0);
    expect(paid.state.account.fractalis - raw.state.account.fractalis).toBe(expected);
    expect(state.currencyEarned).toBe(expected);
  });
  it('banks exact defeat remainder once and quit/retry never pay the same lowestHP twice', () => {
    let value = entered();
    const budget = value.state.radiantStudy!.state.enemies.reduce((sum, unit) => sum + unit.currency.budget, 0);
    value = settled(value);
    expect(value.state.radiantStudy!.state.phase).toBe('victory');
    expect(value.state.account.fractalis).toBe(budget);
    const cleared = structuredClone(value);
    value = step(value, { kind: 'quit' });
    value = step(value, { kind: 'retry' });
    expect(value.state.radiantStudy!.state.currencyEarned).toBe(budget);
    value = settled(value);
    expect(value.state.account.fractalis).toBe(budget);
    expect(value.state.radiantStudy!.state.enemies.map(enemy => enemy.currency))
      .toEqual(cleared.state.radiantStudy!.state.enemies.map(enemy => enemy.currency));
  });
  it('quit forfeits unsettled play; deterministic Retry restores charge/target seeds and full ledgers', () => {
    let value = entered();
    const ledger = structuredClone(value.state.radiantStudy!.state.enemies.map(unit => unit.currency));
    const partial = play(value, 1);
    expect(partial.run.state.currencyEarned).toBeGreaterThan(0);
    expect(() => resolveRadiantRun(value, request(value, { kind: 'settle', actions: partial.actions }), authority()))
      .toThrow('finished encounter');
    value = step(value, { kind: 'quit' });
    const quit = structuredClone(value);
    value = step(value, { kind: 'retry' });
    expect(value.state.account.fractalis).toBe(0);
    expect(value.state.account.receipts).toEqual([]);
    expect(value.state.radiantStudy!.state.chargeSeed).toBe(value.state.radiantStudy!.initialChargeSeed);
    expect(value.state.radiantStudy!.targetSeed).toBe(value.state.radiantStudy!.initialTargetSeed);
    expect(value.state.radiantStudy!.state.enemies.map(unit => unit.currency)).toEqual(ledger);
    expect(quit.state.radiantStudy!.quit).toBe(true);
  });
  it('healing/re-hit has no duplicate payout; exact near-MAX_SAFE_INTEGER ledger math', () => {
    let ledger = { budget: Number.MAX_SAFE_INTEGER, baselineHP: 1000000001,
      lowestHP: 1000000001, paid: 0 };
    const first = depleteRadiantCurrency(ledger, 800000001);
    ledger = first.ledger;
    expect(first.amount).toBe(Number(BigInt(Number.MAX_SAFE_INTEGER) * 200000000n / 1000000001n));
    expect(depleteRadiantCurrency(ledger, 900000000).amount).toBe(0);
    expect(depleteRadiantCurrency(ledger, 800000001).amount).toBe(0);
    expect(depleteRadiantCurrency(ledger, 0).amount + first.amount).toBe(Number.MAX_SAFE_INTEGER);
  });
  it('a defeat settle saves its Haul and permits same-budget retry without double pay', () => {
    let value = entered();
    value.state.radiantStudy!.state.bearers[0].hp = 1;
    value = settled(value);
    expect(value.state.radiantStudy!.state.phase).toBe('defeat');
    const banked = value.state.account.fractalis;
    expect(banked).toBe(value.state.radiantStudy!.state.currencyEarned);
    value = step(value, { kind: 'retry' });
    expect(value.state.account.fractalis).toBe(banked);
    expect(value.state.radiantStudy!.state.currencyEarned).toBe(banked);
    validateRadiantCombat(value.state.radiantStudy!.state);
    const budget = value.state.radiantStudy!.state.enemies.reduce((sum, unit) => sum + unit.currency.budget, 0);
    value = settled(value);
    expect(value.state.account.fractalis).toBeLessThanOrEqual(budget);
    expect(value.state.account.fractalis).toBe(value.state.radiantStudy!.state.currencyEarned);
  });
  it('does not replace a retained quit run; a retired legacy run ends and keeps saved rewards', () => {
    const value = step(entered(), { kind: 'quit' });
    expect(() => resolveRadiantRun(value, request(value, start), authority())).toThrow();
    const legacy = snapshot();
    legacy.state.run = {} as never;
    legacy.state.account.fractalis = 777;
    const result = resolveRadiantRun(legacy, request(legacy, start), authority());
    expect(result.state.run).toBeNull();
    expect(result.state.radiantStudy).toBeTruthy();
    expect(result.state.account.fractalis).toBe(777);
  });
  it('retires saved v6 and v8 runs read-only with the rules notice', () => {
    const value = entered();
    expect(retiredRunVersion(6)).toBe(true);
    expect(retiredRunVersion(7)).toBe(true);
    expect(retiredRunVersion(8)).toBe(true);
    expect(retiredRunVersion(9)).toBe(false);
    value.state.radiantStudy!.version = 6 as never;
    const raw = structuredClone(value);
    const checked = validateRadiantRunSnapshot(value);
    expect(checked.state.radiantStudy).toBeUndefined();
    expect(checked.notice).toBe(retiredRadiantRunNotice);
    expect(value).toEqual(raw);
  });
  it('Continue denies fresh budgets without victory and accessible next authored entry', () => {
    const value = entered();
    expect(() => step(value, { kind: 'continue' })).toThrow();
    value.state.radiantStudy!.state = createRadiantCombat(
      value.state.radiantStudy!.initial.bearers.map(unit => unit.loadout),
      value.state.radiantStudy!.enemies, 1);
    expect(() => step(value, { kind: 'retry' })).toThrow();
    const before = snapshot();
    expect(() => resolveRadiantRun(before, request(before,
      { kind: 'start', activity: { kind: 'story', stage: 2 }, calibration: 'authored-control' }), authority())).toThrow();
  });
  it('authorized Continue uses existing stage gates, server encounter namespace and frozen squad', () => {
    const before = snapshot();
    before.state.account.storyCompleted = 2;
    before.state.account.characters.ember = { level: 105, evolution: 6 };
    const entry = resolveRadiantRun(before, request(before,
      { kind: 'start', activity: { kind: 'story', stage: 1 }, calibration: 'radiant-pressure-v2' }), authority());
    let value = { state: entry.state, revision: entry.response.revision };
    value = settled(value);
    expect(value.state.radiantStudy!.state.phase).toBe('victory');
    const run = structuredClone(value.state.radiantStudy!);
    expect(value.state.account.receipts.filter(receipt => receipt.startsWith(`radiant-study:v2:${run.id}:1:`)))
      .toHaveLength(1);
    const banked = value.state.account.fractalis;
    value.state.account.characters.ember = { level: 0, evolution: 1 };
    const next = step(value, { kind: 'continue' });
    expect(next.state.radiantStudy).toMatchObject({ id: run.id, encounter: 2,
      anchor: { activity: { kind: 'story', stage: 2 } } });
    expect(next.state.radiantStudy!.initial.bearers[0].loadout).toEqual(run.initial.bearers[0].loadout);
    expect(next.state.radiantStudy!.state.currencyEarned).toBe(0);
    expect(next.state.account.fractalis).toBe(banked);
    expect(next.state.account.storyCompleted).toBe(2);
    expect(next.state.radiantStudy!.encounterSeed).not.toBe(run.encounterSeed);
    // Continue pays nothing, so it adds no receipt.
    expect(next.state.account.receipts).toEqual(value.state.account.receipts);
    const stale = request(value, { kind: 'quit' });
    expect(() => resolveRadiantRun(next, { ...stale, expectedRevision: next.revision }, authority()))
      .toThrow(expect.objectContaining({ code: 'stale-run' }));
  });
  it('legitimate one-HP defeat pays only the remaining budget, never an overkill amount', () => {
    const before = entered(), run = before.state.radiantStudy!;
    const enemy = run.state.enemies[0];
    const paid = depleteRadiantCurrency(enemy.currency, 1);
    enemy.hp = 1; enemy.currency = paid.ledger;
    run.state.currencyEarned = paid.amount;
    run.journal.events.push({ type: 'currency', enemyId: enemy.id, amount: paid.amount, totalPaid: paid.amount });
    before.state.account.fractalis = paid.amount;
    const local = structuredClone(run);
    const events = applyRadiantTurn(local, { type: 'normal', bearerId: local.state.bearers[0].loadout.id, targetId: enemy.id });
    const defeated = local.state.enemies[0];
    expect(defeated.hp).toBe(0);
    expect(defeated.currency.paid).toBe(enemy.currency.budget);
    expect(events.filter(event => event.type === 'currency' && event.enemyId === enemy.id)
      .reduce((sum, event) => sum + (event.type === 'currency' ? event.amount : 0), 0))
      .toBe(enemy.currency.budget - paid.amount);
    const after = settled(before);
    expect(after.state.radiantStudy!.state.enemies[0].currency.paid).toBe(enemy.currency.budget);
    expect(after.state.account.fractalis).toBe(after.state.radiantStudy!.state.currencyEarned);
  });
  it('schema mismatch and corrupted frozen budgets explicitly deny without reset', () => {
    const value = entered(), req = request(value, settleOp(value));
    const corrupt = structuredClone(value);
    corrupt.state.radiantStudy!.version = 0 as never;
    expect(() => resolveRadiantRun(corrupt, req, authority())).toThrow();
    const budget = structuredClone(value);
    budget.state.radiantStudy!.enemies[0].currencyBudget++;
    expect(() => resolveRadiantRun(budget, req, authority())).toThrow();
    expect(value.state.radiantStudy!.version).toBe(9);
  });
  it('explicit client outcome, HP, budget, enemy-action and seed injection are rejected', () => {
    const value = entered(), req = request(value, settleOp(value));
    const actions = (req.operation as Extract<RadiantRunOperation, { kind: 'settle' }>).actions;
    for (const [field, payload] of [['hp', 0], ['budget', 10000], ['outcome', 'victory'], ['chargeSeed', 1]]) {
      expect(() => resolveRadiantRun(value, { ...req, [field]: payload }, authority())).toThrow();
      expect(() => resolveRadiantRun(value, { ...req, operation: { ...req.operation, [field]: payload } } as never,
        authority())).toThrow();
    }
    expect(() => resolveRadiantRun(value, { ...req, operation: { kind: 'settle',
      actions: [{ type: 'enemy-heal', enemyId: 'enemy', amount: 1 }] } } as never, authority())).toThrow();
    expect(() => resolveRadiantRun(value, { ...req, operation: { kind: 'settle',
      actions: [{ ...actions[0], hp: 0 }, ...actions.slice(1)] } } as never, authority())).toThrow();
  });
  it('rejects the retired per-action operation with an update notice', () => {
    const value = entered(), run = value.state.radiantStudy!;
    expect(() => resolveRadiantRun(value, request(value,
      { kind: 'action', action: nextAction(run) } as never), authority()))
      .toThrow('Update the game to continue this battle.');
  });
  it('rejects illegal, out-of-order, trailing and unfinished logs with nothing saved', async () => {
    const value = entered(3), { actions } = play(value);
    const first = actions[0] as Extract<RadiantTurnAction, { type: 'normal' }>;
    for (const bad of [
      [{ ...first, bearerId: 'missing' }, ...actions.slice(1)],
      [first, first, ...actions.slice(1)],
      [...actions, first],
      actions.slice(0, 1),
      [],
    ] as RadiantTurnAction[][]) {
      const rpc = new AtomicRpc(value), before = structuredClone(rpc.current);
      await expect(executeRadiantRun(rpc.repository(), request(value, { kind: 'settle', actions: bad }), authority()))
        .rejects.toMatchObject({ code: 'invalid-input' });
      expect(rpc.current).toEqual(before); expect(rpc.writes).toBe(0);
    }
  });
  it('accepts End Turn in the replayed log', () => {
    const value = entered(3), run = structuredClone(value.state.radiantStudy!);
    const actions: RadiantTurnAction[] = [];
    while (run.state.phase === 'player' && actions.length < 1000) {
      const action: RadiantTurnAction = actions.length % 4 === 3 ? { type: 'end-turn' } : nextAction(run);
      applyRadiantTurn(run, action); actions.push(action);
    }
    const result = resolveRadiantRun(value, request(value, { kind: 'settle', actions }), authority());
    expect(result.response.run.state).toEqual(run.state);
  });
});

describe('bounded study journal payload', () => {
  it('round-trips 5000 typed events without truncation and reports local payload cost', () => {
    const before = entered(3);
    const local = structuredClone(before.state.radiantStudy!);
    const exemplar = applyRadiantTurn(local, nextAction(local)).find(event => event.type === 'damage');
    expect(exemplar).toBeDefined();
    const run = before.state.radiantStudy!;
    while (run.journal.events.length < 5000) run.journal.events.push(structuredClone(exemplar!));
    const started = performance.now();
    const payload = JSON.stringify({ state: before.state });
    const bytes = new TextEncoder().encode(payload).byteLength;
    const parsed = JSON.parse(payload);
    const checkedState = validateRadiantRunSnapshot({ revision: before.revision, state: parsed.state });
    const roundTripElapsed = performance.now() - started;
    expect(checkedState.state.radiantStudy?.journal.events).toHaveLength(5000);
    const settleStarted = performance.now();
    const next = resolveRadiantRun(checkedState, request(checkedState, settleOp(checkedState)), authority());
    const checkedResponse = validateRadiantRunResponse(JSON.parse(JSON.stringify(next.response)));
    const settleElapsed = performance.now() - settleStarted;
    expect(checkedResponse.run.journal.events.length).toBeGreaterThan(5000);
    console.info(`Synthetic Radiant journal: 5000 events, ${bytes} aggregate bytes, ` +
      `${roundTripElapsed.toFixed(1)} ms serialize/parse/validate, ${settleElapsed.toFixed(1)} ms settle replay.`);
  });
});

describe('existing aggregate+revision+request RPC atomicity', () => {
  it('commits carried Training resources exactly once after a denied Continue retry', async () => {
    const value = snapshot();
    value.state.account.characters.ember = { level: 105, evolution: 6, weaponRank: 0 };
    const rpc = new AtomicRpc(value), auth = authority();
    await executeRadiantRun(rpc.repository(), request(rpc.current, start), auth);
    await executeRadiantRun(rpc.repository(), request(rpc.current, settleOp(rpc.current)), auth);
    expect(rpc.current.state.radiantStudy!.state.phase).toBe('victory');
    const before = structuredClone(rpc.current), req = request(before, { kind: 'continue' });
    const expected = resolveRadiantRun(before, req, auth).response, writes = rpc.writes;
    rpc.denied = true;
    await expect(executeRadiantRun(rpc.repository(), req, auth)).rejects.toMatchObject({ code: 'denied-write' });
    expect(rpc.current).toEqual(before);
    expect(rpc.writes).toBe(writes);
    rpc.denied = false;
    const saved = await executeRadiantRun(rpc.repository(), req, auth);
    expect(saved).toEqual(expected);
    expect(saved.run.state.gauge).toEqual(before.state.radiantStudy!.state.gauge);
    expect(await executeRadiantRun(rpc.repository(), req, auth)).toEqual(saved);
    expect(rpc.writes).toBe(writes + 1);
  });
  it('resolves full-attacker and ten-percent team drops on the device and saves them atomically', async () => {
    const value = entered(3);
    value.state.radiantStudy!.state.chargeSeed = 0;
    const local = structuredClone(value.state.radiantStudy!);
    const turn = applyRadiantTurn(local, nextAction(local));
    const drops = turn.filter(event => event.type === 'gauge-drop');
    const total = drops.reduce((sum, event) => sum + event.amount, 0);
    expect(drops.length).toBeGreaterThan(0);
    expect(local.state.gauge.members.map(member => member.charge)).toEqual([
      Math.min(total, local.state.gauge.members[0].baseCost),
      ...local.state.gauge.members.slice(1).map(member =>
        member.elementId === local.state.gauge.members[0].elementId ? total / 10 : 0),
    ]);
    const rpc = new AtomicRpc(value), req = request(value, settleOp(value)), raw = structuredClone(value);
    const expected = resolveRadiantRun(raw, req, authority()).response;
    rpc.denied = true;
    await expect(executeRadiantRun(rpc.repository(), req, authority())).rejects.toMatchObject({ code: 'denied-write' });
    expect(rpc.current).toEqual(raw);
    rpc.denied = false;
    const saved = await executeRadiantRun(rpc.repository(), req, authority());
    expect(saved).toEqual(expected);
    expect(validateRadiantRunResponse(JSON.parse(JSON.stringify(saved)))).toEqual(saved);
    expect(await executeRadiantRun(rpc.repository(), req, authority())).toEqual(saved);
    expect(rpc.writes).toBe(1);
    expect(rpc.current.state.radiantStudy!.state.gauge).toEqual(saved.run.state.gauge);
    for (const change of [
      { enemyId: 'missing' }, { bearerId: 'missing' },
      { trigger: 'other' }, { amount: .5 }, { amount: -1 }, { amount: 0 },
    ]) {
      const corrupt = structuredClone(saved);
      const invalid = corrupt.run.journal.events.find(event => event.type === 'gauge-drop')!;
      Object.assign(invalid, change);
      Object.assign(corrupt.events.find(event => event.type === 'gauge-drop')!, change);
      expect(() => validateRadiantRunResponse(corrupt)).toThrow('Invalid');
    }
  });
  it('saves exactly once and identical receipt retries return the immutable prior outcome', async () => {
    const rpc = new AtomicRpc(entered()), req = request(rpc.current, settleOp(rpc.current)), raw = structuredClone(rpc.current);
    const first = await executeRadiantRun(rpc.repository(), req, authority());
    expect(rpc.writes).toBe(1);
    expect(rpc.current.state.account).toEqual(first.account);
    expect(rpc.current.state.radiantStudy).toEqual(first.run);
    expect(rpc.current.revision).toBe(raw.revision + 1);
    first.account.fractalis = 99999; first.run.state.chargeSeed = 2;
    const retry = await executeRadiantRun(rpc.repository(), req, authority());
    expect(retry).toEqual(rpc.receipts.get(req.requestId)!.response);
    expect(rpc.writes).toBe(1);
    await executeRadiantRun(rpc.repository(), request(rpc.current, { kind: 'quit' }), authority());
    expect(await executeRadiantRun(rpc.repository(), req, authority())).toEqual(retry);
    expect(rpc.writes).toBe(2);
  });
  it('denied writes preserve account/run/revision/seeds/receipts; exact retry saves same result', async () => {
    const rpc = new AtomicRpc(entered()), req = request(rpc.current, settleOp(rpc.current));
    const before = structuredClone(rpc.current);
    const expected = resolveRadiantRun(before, req, authority()).response;
    rpc.denied = true;
    await expect(executeRadiantRun(rpc.repository(), req, authority())).rejects.toMatchObject({ code: 'denied-write' });
    expect(rpc.current).toEqual(before); expect(rpc.writes).toBe(0); expect(rpc.receipts.size).toBe(0);
    rpc.denied = false;
    expect(await executeRadiantRun(rpc.repository(), req, authority())).toEqual(expected);
    expect(rpc.writes).toBe(1);
  });
  it('denied entry retry uses the same authorized namespace/independent seeds, not a reroll', async () => {
    const rpc = new AtomicRpc(), req = request(rpc.current, start);
    const expected = resolveRadiantRun(rpc.current, req, authority()).response;
    const before = structuredClone(rpc.current);
    rpc.denied = true;
    await expect(executeRadiantRun(rpc.repository(), req, authority())).rejects.toMatchObject({ code: 'denied-write' });
    expect(rpc.current).toEqual(before); expect(rpc.receipts.size).toBe(0);
    rpc.denied = false;
    const saved = await executeRadiantRun(rpc.repository(), req, authority());
    expect(saved).toEqual(expected);
    expect(saved.run.id).not.toBe(req.requestId);
    expect(rpc.writes).toBe(1);
  });
  it('overflow does not commit even a partial run, settle receipt or charge seed', async () => {
    const value = entered(); value.state.account.fractalis = Number.MAX_SAFE_INTEGER;
    const rpc = new AtomicRpc(value), before = structuredClone(rpc.current);
    await expect(executeRadiantRun(rpc.repository(), request(value, settleOp(value)), authority()))
      .rejects.toMatchObject({ code: 'overflow' });
    expect(rpc.current).toEqual(before); expect(rpc.writes).toBe(0); expect(rpc.receipts.size).toBe(0);
  });
  it('distinct concurrent settles from the same revision CAS exactly one whole aggregate', async () => {
    const rpc = new AtomicRpc(entered()), repository = rpc.repository();
    const requests = [request(rpc.current, settleOp(rpc.current)), request(rpc.current, settleOp(rpc.current))];
    const results = await Promise.allSettled(requests.map(req => executeRadiantRun(repository, req, authority())));
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    expect(rpc.writes).toBe(1); expect(rpc.receipts.size).toBe(1);
    const winner = results.find(result => result.status === 'fulfilled')!;
    if (winner.status === 'fulfilled') {
      expect(rpc.current.state.account).toEqual(winner.value.account);
      expect(rpc.current.state.radiantStudy).toEqual(winner.value.run);
    }
  });
  it('concurrent identical request commits once and returns exactly the same receipt', async () => {
    const rpc = new AtomicRpc(entered()), req = request(rpc.current, settleOp(rpc.current));
    const results = await Promise.all([executeRadiantRun(rpc.repository(), req, authority()),
      executeRadiantRun(rpc.repository(), req, authority())]);
    expect(results[0]).toEqual(results[1]); expect(rpc.writes).toBe(1);
  });
  it('stale revision, mismatched run/encounter and changed receipt input are explicit denials', async () => {
    const rpc = new AtomicRpc(entered()), req = request(rpc.current, settleOp(rpc.current));
    for (const modified of [{ ...req, expectedRevision: 0 }, { ...req, runId: id() }, { ...req, encounter: 2 }]) {
      await expect(executeRadiantRun(rpc.repository(), modified, authority())).rejects.toThrow();
    }
    expect(rpc.writes).toBe(0);
    await executeRadiantRun(rpc.repository(), req, authority());
    await expect(executeRadiantRun(rpc.repository(), { ...req, operation: { kind: 'quit' } }, authority()))
      .rejects.toMatchObject({ code: 'receipt-conflict' });
    expect(rpc.writes).toBe(1);
  });
  it('uncached prior settle receipt cannot be paid again', async () => {
    const rpc = new AtomicRpc(entered()), req = request(rpc.current, settleOp(rpc.current)), run = rpc.current.state.radiantStudy!;
    rpc.current.state.account.receipts.push(`radiant-study:v2:${run.id}:${run.encounter}:${req.requestId}`);
    const before = structuredClone(rpc.current);
    await expect(executeRadiantRun(rpc.repository(), req, authority())).rejects.toMatchObject({ code: 'receipt-conflict' });
    expect(rpc.current).toEqual(before); expect(rpc.writes).toBe(0);
  });
  it('the retired per-action operation commits nothing', async () => {
    const rpc = new AtomicRpc(entered()), run = rpc.current.state.radiantStudy!;
    await expect(executeRadiantRun(rpc.repository(), request(rpc.current,
      { kind: 'action', action: nextAction(run) } as never), authority())).rejects.toMatchObject({ code: 'invalid-input' });
    expect(rpc.writes).toBe(0);
  });
  it('Settings/read is a repository load: no transaction and frozen snapshot retained', async () => {
    const rpc = new AtomicRpc(entered());
    await executeRadiantRun(rpc.repository(), request(rpc.current, settleOp(rpc.current)), authority());
    const before = structuredClone(rpc.current);
    const resumed = await rpc.repository().load();
    expect(resumed).toEqual(before); expect(rpc.writes).toBe(1);
    resumed.state.radiantStudy!.state.chargeSeed = 2;
    expect(rpc.current).toEqual(before);
  });
  it('study capability is required even for an already-cached settle', async () => {
    const rpc = new AtomicRpc(entered()), req = request(rpc.current, settleOp(rpc.current));
    await executeRadiantRun(rpc.repository(), req, authority());
    await expect(executeRadiantRun(rpc.repository(), req,
      { ...authority(), capability: 'production' } as never)).rejects.toMatchObject({ code: 'invalid-input' });
    expect(rpc.writes).toBe(1);
  });
  it('revision overflow does not create an unsafe revision or save', async () => {
    const value = entered(); value.revision = Number.MAX_SAFE_INTEGER;
    const rpc = new AtomicRpc(value);
    await expect(executeRadiantRun(rpc.repository(), request(value, settleOp(value)), authority()))
      .rejects.toMatchObject({ code: 'overflow' });
    expect(rpc.writes).toBe(0);
  });
});
