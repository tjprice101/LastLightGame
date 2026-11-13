import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createGameOperationHandler } from '../../supabase/functions/game-operation/handler';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { deriveRadiantEntry, type RadiantServerConfig } from '../../supabase/functions/game-operation/battle-dispatch';
import { radiantClientAccept, validateRadiantRunRequest, validateRadiantRunResponse,
  type RadiantRunRequest, type RadiantRunOperation } from './battle-run';
import { createCreatureCopy } from '../game/character-instances';

const user = '00000000-0000-4000-8000-000000000001';
const otherUser = '00000000-0000-4000-8000-000000000002';
const secret = 'test-only-secret-0123456789abcdef0123456789';
const enabled: RadiantServerConfig = { enabled: 'true', secret };
let serial = 10;
const uuid = () => `00000000-0000-4000-8000-${(++serial).toString(16).padStart(12, '0')}`;
function entry(activity: unknown = { kind: 'training' }): RadiantRunRequest {
  return { requestId: uuid(), expectedRevision: 0, runId: null, encounter: null,
    operation: { kind: 'start', calibration: 'authored-control', activity } } as RadiantRunRequest;
}
class SupabaseMock {
  state = freshGame('study_player', '2026-11-08T00:00:00Z');
  revision = 0;
  writes = 0;
  denied?: string;
  limited = false;
  cache = new Map<string, { fingerprint: unknown; response: unknown }>();
  auth = { getClaims: vi.fn(async (token: string) => ({ data: { claims: { sub: token === 'valid' ? user :
    token === 'other' ? otherUser : undefined } }, error: token === 'bad' ? {} : null })),
    getUser: vi.fn(async () => ({ data: { user: { id: user } }, error: null })) };
  from = vi.fn(() => ({ select: () => ({ eq: (_column: string, id: string) => ({
    single: async () => ({ data: { username: id === user ? 'study_player' : 'other_player',
      created_at: '2026-11-08T00:00:00Z' }, error: null }),
  }) }) }));
  constructor(level = 0) {
    this.state.starterId = 'ember';
    this.state.account.characters.ember = { level, evolution: level ? 6 : 1, weaponRank: 0 };
    this.state.account.squad = ['ember'];
  }
  rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
    if (this.denied === name) return { data: null, error: { code: '08006', message: 'private storage failure' } };
    if (name === 'consume_game_attempt') return { data: !this.limited, error: null };
    const key = `${args.p_user}:${args.p_request}`;
    if (name === 'find_game_request' || name === 'commit_game_operation') {
      const cached = this.cache.get(key);
      // Models the real SQL receipt lookup under lock, before checking revision.
      if (cached) return cached.fingerprint === args.p_fingerprint
        ? { data: structuredClone(cached.response), error: null }
        : { data: null, error: { code: 'P0001', message: 'Request ID reused with different input' } };
    }
    if (name === 'find_game_request') return { data: null, error: null };
    if (name === 'load_game_account') return { data: { revision: this.revision,
      state: structuredClone(this.state) }, error: null };
    if (name === 'commit_game_operation') {
      if (args.p_revision !== this.revision) return { data: { conflict: true, revision: this.revision }, error: null };
      this.state = structuredClone(args.p_state) as typeof this.state;
      this.revision++; this.writes++;
      // The profile wrapper and acquisition trigger add fields to the response in SQL.
      const response = { ...structuredClone(args.p_response) as object, revision: this.revision,
        account: structuredClone(this.state.account), profile: this.state.profile,
        social: { friends: [], incoming: [], outgoing: [] } };
      this.cache.set(key, { fingerprint: args.p_fingerprint, response });
      return { data: structuredClone(response), error: null };
    }
    throw new Error(`Unexpected RPC ${name}`);
  });
  handler(config: RadiantServerConfig = enabled) {
    return createGameOperationHandler(this as unknown as SupabaseClient, config);
  }
  request(operation: RadiantRunOperation): RadiantRunRequest {
    return { requestId: uuid(), expectedRevision: this.revision, runId: this.state.radiantStudy!.id,
      encounter: this.state.radiantStudy!.encounter, operation };
  }
  normal(): RadiantRunRequest {
    return this.request({ kind: 'action', action: { type: 'normal', bearerId: 'ember',
      targetId: this.state.radiantStudy!.state.enemies.find(enemy => enemy.hp > 0)!.id } });
  }
}
async function send(handler: ReturnType<SupabaseMock['handler']>, radiantStudy: unknown, token = 'valid',
  supportsContinuation = true) {
  const response = await handler(new Request('http://localhost/game-operation', { method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json',
      ...(supportsContinuation ? { accept: radiantClientAccept } : {}) },
    body: JSON.stringify({ radiantStudy }) }));
  return { status: response.status, body: await response.json() };
}

describe('authenticated actual game-operation dispatch with mocked Supabase boundary', () => {
  it('gated preparation commits manual six-member loadout changes once and preserves frozen encounters', async () => {
    const db = new SupabaseMock(105), handler = db.handler();
    for (const id of ['tide', 'sprout', 'rosetta', 'thornia', 'crinso'] as const)
      db.state.account.characters[id] = { level: 0, evolution: 1, weaponRank: 0 };
    await send(handler, entry());
    const frozen = structuredClone(db.state.radiantStudy), holdings = structuredClone(db.state.account);
    const ids = ['ember', 'tide', 'sprout', 'rosetta', 'thornia', 'crinso'];
    const request = { kind: 'prepare', requestId: uuid(), expectedRevision: db.revision,
      operation: { kind: 'setSquad', ids } };
    const result = await send(handler, request), writes = db.writes;
    expect(result.status).toBe(200); expect(result.body.account).toEqual({ ...holdings, squad: ids });
    expect(result.body.run).toEqual(frozen); expect(db.state.radiantStudy).toEqual(frozen);
    expect((await send(handler, request)).body).toEqual(result.body); expect(db.writes).toBe(writes);
    const reordered = { operation: { ids, kind: 'setSquad' }, expectedRevision: request.expectedRevision,
      requestId: request.requestId, kind: 'prepare' };
    expect((await send(handler, reordered)).body).toEqual(result.body); expect(db.writes).toBe(writes);
    expect((await send(handler, { ...request, operation: { kind: 'setSquad', ids: ['tide'] } })).status).toBe(409);
    expect((await send(handler, { ...request, requestId: uuid() })).status).toBe(409);
    expect(db.writes).toBe(writes);
  });
  it('preparation fails closed for disabled/auth/rate/storage and retries a denied commit without losing holdings', async () => {
    const db = new SupabaseMock(), handler = db.handler();
    const request = { kind: 'prepare', requestId: uuid(), expectedRevision: 0,
      operation: { kind: 'setSquad', ids: ['ember'] } };
    expect((await send(db.handler({}), request)).status).toBe(503); expect(db.rpc).not.toHaveBeenCalled();
    expect((await send(handler, request, 'bad')).status).toBe(401); expect(db.writes).toBe(0);
    db.limited = true; expect((await send(handler, request)).status).toBe(429);
    db.limited = false;
    const before = structuredClone(db.state);
    db.denied = 'commit_game_operation';
    expect((await send(handler, request)).body.code).toBe('denied-write');
    expect(db.state).toEqual(before); expect(db.writes).toBe(0);
    db.denied = undefined;
    expect((await send(handler, request)).status).toBe(200); expect(db.writes).toBe(1);
    expect((await send(handler, request)).status).toBe(200); expect(db.writes).toBe(1);
    expect((await send(handler, { ...request, requestId: uuid(), expectedRevision: 1,
      operation: { kind: 'setSquad', ids: ['tide'] } })).body.code).toBe('manual-squad');
    expect(db.writes).toBe(1);
  });
  it('dedicated authenticated read restores the frozen aggregate without committing, earning or replaying events', async () => {
    const db = new SupabaseMock(105), handler = db.handler();
    const empty = await send(handler, { kind: 'read' });
    expect(empty.status).toBe(200); expect(empty.body.run).toBeNull(); expect(db.writes).toBe(0);
    await send(handler, entry());
    await send(handler, db.normal());
    const before = structuredClone(db.state), writes = db.writes;
    const read = await send(handler, { kind: 'read' });
    expect(read.status).toBe(200);
    expect(read.body).toEqual({ revision: db.revision, account: db.state.account, run: db.state.radiantStudy });
    expect(read.body.events).toBeUndefined(); expect(read.body.rewards).toBeUndefined();
    expect(db.state).toEqual(before); expect(db.writes).toBe(writes);
    expect((await send(handler, { kind: 'read', seed: 1 })).status).toBe(400);
    expect((await send(handler, { kind: 'read' }, 'bad')).status).toBe(401);
    expect((await send(db.handler({}), { kind: 'read' })).status).toBe(503);
  });
  it.each([{}, { enabled: 'false' }, { enabled: '1' }, { enabled: 'TRUE' }])('is off by default: %j', async config => {
    const db = new SupabaseMock();
    const result = await send(db.handler(config), entry());
    expect(result.status).toBe(503);
    expect(result.body.code).toBe('unavailable');
    expect(db.auth.getClaims).toHaveBeenCalledWith('valid');
    expect(db.rpc).not.toHaveBeenCalled(); expect(db.from).not.toHaveBeenCalled();
  });
  it.each([{ enabled: 'true' }, { enabled: 'true', secret: 'short' },
    { ...enabled, calibration: 'client-choice' }])('fails closed without stable configuration %j', async config => {
    const db = new SupabaseMock();
    expect((await send(db.handler(config), entry())).status).toBe(503);
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it('denies missing/invalid authentication before DB access; retains Auth fallback', async () => {
    const db = new SupabaseMock(), handler = db.handler();
    expect((await handler(new Request('http://localhost', { method: 'POST', body: '{}' }))).status).toBe(401);
    expect((await send(handler, entry(), 'bad')).status).toBe(401);
    expect(db.rpc).not.toHaveBeenCalled();
    db.auth.getClaims.mockRejectedValueOnce(new Error('claims unavailable'));
    expect((await send(handler, entry())).status).toBe(200);
    expect(db.auth.getUser).toHaveBeenCalledWith('valid');
  });
  it('saves deterministic authenticated entry, retries cached response and freezes server-owned data', async () => {
    const db = new SupabaseMock(), handler = db.handler(), request = entry();
    const first = await send(handler, request);
    expect(first.status).toBe(200);
    const response = validateRadiantRunResponse(first.body);
    expect(response.run).toMatchObject({ id: (await deriveRadiantEntry(secret, user, request.requestId)).runId,
      calibration: 'authored-control', encounter: 1 });
    expect(response.run.initial.bearers[0].loadout).toMatchObject({ id: 'ember', level: 0, form: 1 });
    expect(response.run.enemies.length).toBeGreaterThan(0);
    expect(response.account.storyCompleted ?? 0).toBe(0);
    expect((await send(handler, request)).body).toEqual(first.body);
    expect(db.writes).toBe(1);
    expect(db.rpc.mock.calls.filter(([name]) => name === 'load_game_account')).toHaveLength(1);
    const commit = db.rpc.mock.calls.find(([name]) => name === 'commit_game_operation')![1];
    expect(commit).toMatchObject({ p_user: user, p_revision: 0, p_social: null, p_activity: null });
    expect(JSON.stringify(commit)).not.toContain(secret);
  });
  it('separates authenticated users despite identical client request IDs', async () => {
    const one = new SupabaseMock(), two = new SupabaseMock(), request = entry();
    const a = await send(one.handler(), request), b = await send(two.handler(), request, 'other');
    expect(a.status).toBe(200); expect(b.status).toBe(200);
    expect(a.body.run.id).not.toBe(b.body.run.id);
    expect(two.rpc.mock.calls.find(([name]) => name === 'commit_game_operation')![1].p_user).toBe(otherUser);
  });
  it('does not allow experimental calibration by client choice; explicit server config enables it', async () => {
    const request = entry();
    request.operation = { kind: 'start', calibration: 'radiant-pressure-v2', activity: { kind: 'training' } };
    const db = new SupabaseMock();
    expect((await send(db.handler(), request)).status).toBe(503);
    expect(db.rpc).not.toHaveBeenCalled();
    expect((await send(db.handler({ ...enabled, calibration: 'radiant-pressure-v2' }), request)).status).toBe(200);
  });
  it('action duplicates pay once; quit/retry preserve frozen roster, gear and earned ledger', async () => {
    const db = new SupabaseMock(), handler = db.handler();
    await send(handler, entry());
    const initial = structuredClone(db.state.radiantStudy!.initial), action = db.normal();
    const first = await send(handler, action);
    expect(first.status).toBe(200);
    expect(first.body.events.some((event: { type: string }) => event.type === 'currency')).toBe(true);
    expect((await send(handler, action)).body).toEqual(first.body);
    const balance = db.state.account.fractalis, ledgers = structuredClone(db.state.radiantStudy!.state.enemies.map(e => e.currency));
    expect(db.writes).toBe(2);
    const quit = db.request({ kind: 'quit' });
    expect((await send(handler, quit)).status).toBe(200);
    expect((await send(handler, quit)).status).toBe(200);
    expect((await send(handler, db.normal())).status).toBe(400);
    expect((await send(handler, db.request({ kind: 'retry' }))).status).toBe(200);
    expect(db.state.radiantStudy!.initial).toEqual(initial);
    expect(db.state.radiantStudy!.state.enemies.map(e => e.currency)).toEqual(ledgers);
    expect(db.state.account.fractalis).toBe(balance);
    expect(db.state.radiantStudy!.state.chargeSeed).toBe(initial.chargeSeed);
    expect((await send(handler, db.normal())).status).toBe(200);
    expect(db.state.account.fractalis).toBe(balance);
  });
  it('concurrent identical requests duplicate under lock before CAS; distinct requests conflict', async () => {
    const db = new SupabaseMock(), handler = db.handler(), start = entry();
    const same = await Promise.all([send(handler, start), send(handler, start)]);
    expect(same.map(r => r.status)).toEqual([200, 200]); expect(db.writes).toBe(1);
    const one = db.normal(), two = { ...one, requestId: uuid() };
    const different = await Promise.all([send(handler, one), send(handler, two)]);
    expect(different.map(r => r.status).sort()).toEqual([200, 409]); expect(db.writes).toBe(2);
    expect((await send(handler, { ...one, operation: { kind: 'quit' } })).status).toBe(409);
  });
  it('old menu transactions preserve the entire extension, but old battle entry cannot co-exist', async () => {
    const db = new SupabaseMock(), handler = db.handler();
    await send(handler, entry());
    const frozen = structuredClone(db.state.radiantStudy);
    const legacy = async (operation: unknown) => handler(new Request('http://localhost', { method: 'POST',
      headers: { authorization: 'Bearer valid' }, body: JSON.stringify({
        requestId: uuid(), expectedRevision: db.revision, operation }) }));
    expect((await legacy({ kind: 'updateProfile', displayName: 'Changed', bio: '', icon: 'neutral', frame: 'default' })).status).toBe(200);
    expect(db.state.radiantStudy).toEqual(frozen);
    expect((await legacy({ kind: 'setSquad', ids: ['ember'] })).status).toBe(200);
    expect(db.state.radiantStudy).toEqual(frozen);
    expect((await legacy({ kind: 'enter', activity: { kind: 'training' } })).status).toBe(400);
    expect((await send(handler, db.normal())).status).toBe(200);
    expect(db.state.radiantStudy!.initial).toEqual(frozen!.initial);
  });
  it('supports staged Continue only after victory without repeating an already-completed Story unlock', async () => {
    const db = new SupabaseMock(105), handler = db.handler();
    db.state.account.storyCompleted = 1;
    expect((await send(handler, entry({ kind: 'story', stage: 1 }))).status).toBe(200);
    expect((await send(handler, db.request({ kind: 'continue' }))).status).toBe(400);
    for (let i = 0; i < 10 && db.state.radiantStudy!.state.phase === 'player'; i++)
      expect((await send(handler, db.normal())).status).toBe(200);
    expect(db.state.radiantStudy!.state.phase).toBe('victory');
    const loadout = structuredClone(db.state.radiantStudy!.initial.bearers[0].loadout);
    expect((await send(handler, db.request({ kind: 'continue' }))).status).toBe(200);
    expect(db.state.radiantStudy!.anchor.activity).toEqual({ kind: 'story', stage: 2 });
    expect(db.state.radiantStudy!.initial.bearers[0].loadout).toEqual(loadout);
    expect(db.state.account.storyCompleted).toBe(1);
  });
  it('lets older clients finish existing fights but requires a refresh before incompatible continuations', async () => {
    const db = new SupabaseMock(105), handler = db.handler();
    expect((await send(handler, entry(), 'valid', false)).status).toBe(200);
    expect((await send(handler, { kind: 'read' }, 'valid', false)).status).toBe(200);
    for (let i = 0; i < 10 && db.state.radiantStudy!.state.phase === 'player'; i++)
      expect((await send(handler, db.normal(), 'valid', false)).status).toBe(200);
    expect(db.state.radiantStudy!.state.phase).toBe('victory');
    const before = structuredClone(db.state), writes = db.writes, continued = db.request({ kind: 'continue' });
    const denied = await send(handler, continued, 'valid', false);
    expect(denied.status).toBe(400);
    expect(denied.body.error).toContain('Refresh the page');
    expect(db.state).toEqual(before); expect(db.writes).toBe(writes);

    const saved = await send(handler, continued);
    expect(saved.status).toBe(200);
    expect(saved.body.run.continuation).toBeTruthy();
    expect((await send(handler, continued)).body).toEqual(saved.body);
    const after = structuredClone(db.state), afterWrites = db.writes;
    for (const operation of [
      { kind: 'read' },
      db.normal(),
      { kind: 'prepare', requestId: uuid(), expectedRevision: db.revision,
        operation: { kind: 'setSquad', ids: ['ember'] } },
    ]) {
      const stale = await send(handler, operation, 'valid', false);
      expect(stale.status).toBe(400);
      expect(stale.body.error).toContain('Refresh the page');
    }
    expect(db.state).toEqual(after); expect(db.writes).toBe(afterWrites);
    expect((await send(handler, { kind: 'read' })).body.run).toEqual(saved.body.run);
    expect((await send(handler, db.request({ kind: 'quit' }))).status).toBe(200);
    expect((await send(handler, db.request({ kind: 'retry' }))).status).toBe(200);
  });
  it('actual HTTP Story victory unlocks Continue and exit receipts retain the banked outcome', async () => {
    const db = new SupabaseMock(105), handler = db.handler();
    expect((await send(handler, entry({ kind: 'story', stage: 1 }))).status).toBe(200);
    let rewardCount = 0;
    for (let i = 0; i < 20 && db.state.radiantStudy!.state.phase === 'player'; i++) {
      const request = db.normal(), result = await send(handler, request);
      expect(result.status).toBe(200);
      rewardCount += result.body.rewards.length;
      if (result.body.rewards.length) {
        const writes = db.writes;
        expect((await send(handler, request)).body).toEqual(result.body);
        expect(db.writes).toBe(writes);
      }
    }
    expect(db.state.radiantStudy!.state.phase).toBe('victory');
    expect(rewardCount).toBe(2); expect(db.state.account.storyCompleted).toBe(1);
    const frozen = structuredClone(db.state.radiantStudy!.initial.bearers[0].loadout);
    expect((await send(handler, db.request({ kind: 'continue' }))).status).toBe(200);
    expect(db.state.radiantStudy!.anchor.activity).toEqual({ kind: 'story', stage: 2 });
    expect(db.state.radiantStudy!.initial.bearers[0].loadout).toEqual(frozen);
    const banked = structuredClone(db.state.account), exit = db.request({ kind: 'exit' });
    const result = await send(handler, exit);
    expect(result.status).toBe(200); expect(result.body.run.quit).toBe(true);
    expect(db.state.radiantStudy).toBeUndefined();
    expect((await send(handler, exit)).body).toEqual(result.body);
    expect(db.state.account.fractalis).toBe(banked.fractalis);
    expect(db.state.account.materials).toEqual(banked.materials);
    const fresh = entry(); fresh.expectedRevision = db.revision;
    expect((await send(handler, fresh)).status).toBe(200);
  });
  it.each(['consume_game_attempt', 'load_game_account', 'find_game_request', 'commit_game_operation'])(
    'maps storage error %s without leaking DB text or secrets', async name => {
      const db = new SupabaseMock(); db.denied = name;
      const result = await send(db.handler(), entry());
      expect(result.status).toBe(503); expect(db.writes).toBe(0);
      expect(JSON.stringify(result.body)).not.toContain('private storage');
      expect(JSON.stringify(result.body)).not.toContain(secret);
      const log = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        const thrown = new SupabaseMock();
        thrown.rpc.mockRejectedValueOnce(new Error(`private storage ${secret}`));
        const unavailable = await send(thrown.handler(), entry());
        expect(unavailable.status).toBe(503); expect(thrown.writes).toBe(0);
        expect(log).toHaveBeenCalledExactlyOnceWith(
          'Unexpected Radiant authority failure; no successful commit acknowledged.');
        expect(JSON.stringify(unavailable.body)).not.toContain(secret);
        expect(JSON.stringify(log.mock.calls)).not.toContain(secret);
      } finally { log.mockRestore(); }
    });
  it('maps rate limits, stale references and unsupported continuation without writes', async () => {
    const db = new SupabaseMock(), handler = db.handler();
    db.limited = true;
    expect((await send(handler, entry())).status).toBe(429); expect(db.writes).toBe(0);
    db.limited = false;
    await send(handler, entry());
    expect((await send(handler, { ...db.normal(), runId: uuid() })).status).toBe(409);
    expect((await send(handler, { ...db.normal(), encounter: 2 })).status).toBe(409);
    expect((await send(handler, { ...db.normal(), expectedRevision: 0 })).status).toBe(409);
    expect((await send(handler, db.request({ kind: 'continue' }))).status).toBe(400);
    expect(db.writes).toBe(1);
  });
  it.each([
    null, [], 'start', {}, { ...entry(), operation: [] }, { ...entry(), operation: null },
    { ...entry(), requestId: 42 }, { ...entry(), expectedRevision: -1 },
    { ...entry(), seed: 1 }, { ...entry(), operation: { kind: 'start', activity: [], calibration: 'authored-control' } },
    entry({ kind: 'story', stage: 0 }), entry({ kind: 'story', stage: 121 }),
    entry({ kind: 'dungeon', element: 'unknown', stage: 1 }), entry({ kind: 'infusion', mode: 'unknown', stage: 1 }),
    entry({ kind: 'war', character: 'ember', stage: 1 }), entry({ kind: 'training', hp: 1 }),
    entry({ kind: 'calamity', activity: 'unknown', tier: 1 }),
    { ...entry(), operation: { kind: 'enemy-attack' } },
  ])('rejects malformed runtime JSON %j before account RPC', async input => {
    const db = new SupabaseMock();
    expect((await send(db.handler(), input)).status).toBe(400);
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it('denies locked access/captured squads and corrupt stored snapshots', async () => {
    const db = new SupabaseMock(), handler = db.handler();
    const stage = await send(handler, entry({ kind: 'story', stage: 2 }));
    expect(stage.status).toBe(400);
    expect(stage.body.error).toContain('Clear the previous stage first');
    const dungeon = await send(handler, entry({ kind: 'dungeon', element: 'infernic', stage: 1 }));
    expect(dungeon.status).toBe(400);
    expect(dungeon.body.error).toContain('Activity locked.');
    expect(dungeon.body.error).toContain('Lv.30');
    expect(db.writes).toBe(0);
    const copy = createCreatureCopy('infusion:heavens:0');
    db.state.account.capturedCharacters = [copy];
    db.state.account.squad = [copy.instanceId];
    expect((await send(handler, entry())).status).toBe(400);
    db.state.account.squad = ['ember']; await send(handler, entry());
    db.state.radiantStudy!.enemies[0].currencyBudget++;
    expect((await send(handler, db.request({ kind: 'quit' }))).status).toBe(503);
    expect(db.writes).toBe(1);
  });
  it('explains an expired Rose event without writing the account', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(Date.UTC(2026, 11, 2));
    try {
      const db = new SupabaseMock(105);
      const before = structuredClone(db.state);
      const result = await send(db.handler(), entry({ kind: 'infusion', mode: 'roses', stage: 1 }));
      expect(result.status).toBe(400);
      expect(result.body.error).toContain('Roses Under Sunny Skies has ended');
      expect(db.state).toEqual(before);
      expect(db.writes).toBe(0);
    } finally { now.mockRestore(); }
  });
  it('preserves CORS/preflight/body size policy before study dispatch', async () => {
    const db = new SupabaseMock(), handler = db.handler();
    expect((await handler(new Request('http://localhost', { method: 'OPTIONS',
      headers: { origin: 'https://tjprice101.github.io' } }))).headers.get('access-control-allow-origin'))
      .toBe('https://tjprice101.github.io');
    expect((await handler(new Request('http://localhost', { method: 'POST',
      headers: { origin: 'https://untrusted.example' }, body: '{}' }))).status).toBe(403);
    expect((await send(handler, { ...entry(), padding: 'x'.repeat(9000) })).status).toBe(400);
    expect(db.rpc).not.toHaveBeenCalled();
  });
});
describe('stable server entry entropy and unknown transport validation', () => {
  it('matches a fixed HMAC vector and separates user/request/secret with RFC4122 UUID bits', async () => {
    const id = '00000000-0000-4000-8000-000000000010';
    const first = await deriveRadiantEntry(secret, user, id);
    expect(first).toEqual({ runId: '75f4a540-3678-4fad-9c71-f67b44860869',
      encounterSeed: 1313109579, chargeSeed: 2388329328, targetSeed: 2839734864 });
    expect(first).toEqual(await deriveRadiantEntry(secret, user.toUpperCase(), id.toUpperCase()));
    expect(first.runId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(first).not.toEqual(await deriveRadiantEntry(secret, otherUser, id));
    expect(first).not.toEqual(await deriveRadiantEntry(secret, user, uuid()));
    expect(first).not.toEqual(await deriveRadiantEntry(secret + 'different', user, id));
    // Independently computed with Node's createHmac in the vector test below.
    const { createHmac } = await import('node:crypto');
    const digest = createHmac('sha256', secret).update(JSON.stringify(['last-light:radiant-entry:v1', user, id])).digest();
    expect(first.encounterSeed).toBe(digest.readUInt32BE(16));
    expect(first.chargeSeed).toBe(digest.readUInt32BE(20));
    expect(first.targetSeed).toBe(digest.readUInt32BE(24));
    digest[6] = (digest[6] & 15) | 64; digest[8] = (digest[8] & 63) | 128;
    expect(first.runId.replaceAll('-', '')).toBe(digest.subarray(0, 16).toString('hex'));
    await expect(deriveRadiantEntry('', user, id)).rejects.toMatchObject({ code: 'unavailable' });
  });
  it.each([NaN, Infinity, undefined, null, [], {}, -1, 1.5])('rejects hostile non-JSON revision %j', revision => {
    expect(() => validateRadiantRunRequest({ ...entry(), expectedRevision: revision })).toThrow();
  });
  it.each([undefined, null, [], { revision: 1, account: {}, events: [] }])('rejects malformed RPC response %j', value => {
    expect(() => validateRadiantRunResponse(value)).toThrow(expect.objectContaining({ code: 'unavailable' }));
  });
  it.each([null, [], 'normal', { type: 'normal', bearerId: 'ember' },
    { type: 'normal', bearerId: 'ember', targetId: null },
    { type: 'normal', bearerId: [], targetId: 'enemy' },
    { type: 'normal', bearerId: 'ember', targetId: 'enemy', amount: 999999 },
    { type: 'enemy-attack', enemyId: 'enemy', targetIds: ['ember'], coefficient: 99 },
    { type: 'flare', bearerId: 'ember', tier: 'ultimate' },
    { type: 'flare', bearerId: 'ember', targetId: undefined },
    { type: 'defense', bearerId: 'ember', targetId: 'enemy' },
    { type: 'normal', bearerId: '', targetId: 'enemy' }])('rejects hostile player choice %j', action => {
      expect(() => validateRadiantRunRequest({ requestId: uuid(), expectedRevision: 1, runId: user, encounter: 1,
        operation: { kind: 'action', action } })).toThrow(expect.objectContaining({ code: 'invalid-input' }));
    });
});
