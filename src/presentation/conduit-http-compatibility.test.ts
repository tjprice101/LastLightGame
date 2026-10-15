import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import * as engine from '../../supabase/functions/game-operation/engine';

const source = readFileSync('supabase\\functions\\game-operation\\index.ts', 'utf8');
const executable = ts.transpileModule(source.replace(/^import .*;\r?$/gm, ''),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const requestId = '00000000-0000-4000-8000-000000000001';
function harness(historical = true) {
  let sequence = 0;
  const entropy = { seed: () => 7321, random: () => .9,
    uuid: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}` };
  let game = engine.resolveOperation(engine.freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
  game = engine.resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
  if (historical) delete game.run!.session.state.conduitRulesVersion;
  game.account.fractalis = 123;
  game.account.receipts = ['saved-reward'];
  let stored = { state: structuredClone(game), revision: 7 };
  const cached = new Map<string, unknown>();
  let failCommit = false, conflictCommit = false;
  const social = { friends: [], incoming: [], outgoing: [] };
  const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
    if (name === 'consume_game_attempt') return { data: true };
    if (name === 'find_game_request') return { data: cached.get(String(args.p_request)) ?? null };
    if (name === 'load_game_account') return { data: structuredClone(stored) };
    if (name === 'checkpoint_game_account') return { data: args.p_revision !== stored.revision
      ? { conflict: true, revision: stored.revision } : structuredClone(stored) };
    if (name === 'track_game_session') return { data: { username: 'tester' } };
    if (name === 'game_social') return { data: social };
    if (name === 'commit_game_operation') {
      if (failCommit) return { error: { code: 'unavailable' } };
      if (conflictCommit) return { data: { conflict: true, revision: stored.revision + 1 } };
      expect(args.p_revision).toBe(stored.revision);
      stored = { state: structuredClone(args.p_state as typeof game), revision: stored.revision + 1 };
      const result = { ...(args.p_response as object), revision: stored.revision };
      cached.set(String(args.p_request), result);
      return { data: result };
    }
    throw new Error(`Unexpected RPC: ${name}`);
  });
  const admin = { rpc, auth: { getUser: async () => ({ data: { user: { id: 'user' } } }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { username: 'tester', created_at: '2026-01-01' } }) }) }) }) };
  let handler!: (request: Request) => Promise<Response>;
  const Deno = { env: { get: () => 'configured' }, serve: (callback: typeof handler) => { handler = callback; } };
  new Function('Deno', 'createClient', ...Object.keys(engine), executable)(Deno, () => admin, ...Object.values(engine));
  const send = (kind: 'read' | 'checkpoint', revision = 0, id = requestId) => handler(new Request('http://localhost/game-operation', {
    method: 'POST', headers: { authorization: 'Bearer test', 'content-type': 'application/json' },
    body: JSON.stringify({ requestId: id, expectedRevision: revision, operation: { kind } }),
  }));
  return { send, rpc, original: game, stored: () => stored,
    fail: () => { failCommit = true; }, conflict: () => { conflictCommit = true; } };
}

describe('HTTP historical Conduit read/checkpoint persistence', () => {
  it.each(['read', 'checkpoint'] as const)('commits %s restart once and replays the same request result', async kind => {
    const h = harness();
    const response = await h.send(kind, kind === 'read' ? 0 : 7);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.revision).toBe(8);
    expect(body.session.state.conduitRulesVersion).toBe(engine.conduitRulesVersion);
    expect(body.session.runId).not.toBe(h.original.run!.session.runId);
    expect(body.account).toEqual(h.original.account);
    expect(body.social).toEqual({ friends: [], incoming: [], outgoing: [] });
    expect(h.stored().state.run!.session.runId).toBe(body.session.runId);
    const retry = await h.send(kind, kind === 'read' ? 0 : 7);
    expect(await retry.json()).toEqual(body);
    expect(h.rpc.mock.calls.filter(([name]) => name === 'commit_game_operation')).toHaveLength(1);
  });

  it.each(['read', 'checkpoint'] as const)('does not commit current-version %s', async kind => {
    const h = harness(false);
    expect((await h.send(kind, 7)).status).toBe(200);
    expect(h.rpc.mock.calls.some(([name]) => name === 'commit_game_operation')).toBe(false);
    expect(h.stored().revision).toBe(7);
  });

  it('rejects stale checkpoint revisions before attempting a restart', async () => {
    const h = harness();
    expect((await h.send('checkpoint', 6)).status).toBe(409);
    expect(h.rpc.mock.calls.some(([name]) => name === 'commit_game_operation')).toBe(false);
    expect(h.stored().state).toEqual(h.original);
  });

  it.each(['fail', 'conflict'] as const)('does not expose an uncommitted replacement when commit returns %s', async mode => {
    const h = harness();
    h[mode]();
    const response = await h.send('read');
    expect(response.status).toBe(mode === 'fail' ? 503 : 409);
    expect(await response.json()).not.toHaveProperty('session');
    expect(h.stored().state).toEqual(h.original);
  });
});
