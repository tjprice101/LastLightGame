import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import * as engine from '../../supabase/functions/game-operation/engine';

const source = readFileSync(join('supabase', 'functions', 'game-operation', 'index.ts'), 'utf8');
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
  const sendRaw = (operation: Record<string, unknown>, revision: number) => handler(new Request('http://localhost/game-operation', {
    method: 'POST', headers: { authorization: 'Bearer test', 'content-type': 'application/json' },
    body: JSON.stringify({ requestId: '00000000-0000-4000-8000-000000000099', expectedRevision: revision, operation }),
  }));
  return { send, sendRaw, rpc, original: game, stored: () => stored,
    fail: () => { failCommit = true; }, conflict: () => { conflictCommit = true; } };
}

describe('HTTP retired legacy battles', () => {
  it.each(['read', 'checkpoint'] as const)('%s hides a stored legacy run without committing or touching saved rewards', async kind => {
    const h = harness();
    const response = await h.send(kind, kind === 'read' ? 0 : 7);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.session).toBeNull();
    expect(body.account).toEqual(h.original.account);
    expect(body.social).toEqual({ friends: [], incoming: [], outgoing: [] });
    expect(h.rpc.mock.calls.some(([name]) => name === 'commit_game_operation')).toBe(false);
    expect(h.stored().revision).toBe(7);
  });

  it('rejects stale checkpoint revisions', async () => {
    const h = harness();
    expect((await h.send('checkpoint', 6)).status).toBe(409);
    expect(h.rpc.mock.calls.some(([name]) => name === 'commit_game_operation')).toBe(false);
    expect(h.stored().state).toEqual(h.original);
  });

  it.each(['enter', 'act', 'endTurn', 'continue', 'retry'])('rejects the legacy %s battle operation', async kind => {
    const h = harness(false);
    const response = await h.sendRaw(kind === 'enter' ? { kind, activity: { kind: 'training' } } : { kind }, 7);
    expect(response.status).toBe(400);
    if (kind === 'enter') expect((await response.json()).error).toMatch(/Radiant/);
    expect(h.rpc.mock.calls.some(([name]) => name === 'commit_game_operation')).toBe(false);
  });

  it('persists the cleared legacy run with the next committed operation', async () => {
    const h = harness();
    const response = await h.sendRaw({ kind: 'setMachineLootFocus', rarity: 'Rare', id: null }, 7);
    expect(response.status).toBe(200);
    expect(h.stored().state.run).toBeNull();
    expect(h.stored().state.account.fractalis).toBe(123);
  });
});
