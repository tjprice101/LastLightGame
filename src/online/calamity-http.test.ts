import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import * as engine from '../../supabase/functions/game-operation/engine';
import { calamityChestId } from '../content/calamity';
import { calamiticConduits } from '../content/calamitic-conduits';
import { validateGameResponse, type GameOperation } from './server-game';

const source = readFileSync(join('supabase', 'functions', 'game-operation', 'index.ts'), 'utf8');
const executable = ts.transpileModule(source.replace(/^import .*;\r?$/gm, ''),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const requestId = '00000000-0000-4000-8000-000000000001';
const chestId = calamityChestId('treasury', 3);
function harness(kind: 'chest' | 'purchase' = 'chest', ownedChestId = chestId) {
  const entropy = { seed: () => 7321, random: () => .9, uuid: () => crypto.randomUUID() };
  const game = engine.resolveOperation(engine.freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
  game.account.calamityChests = { [ownedChestId]: 2 };
  if (kind === 'purchase') {
    game.account.calamityClears = { infernic: 1 };
    game.account.calamiticTokens = 125;
  }
  let stored = { state: structuredClone(game), revision: 7 };
  const cached = new Map<string, { fingerprint: unknown; response: unknown }>();
  let failure: 'fail' | 'conflict' | undefined;
  const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
    if (name === 'consume_game_attempt') return { data: true };
    if (name === 'find_game_request') {
      const previous = cached.get(String(args.p_request));
      if (previous && previous.fingerprint !== args.p_fingerprint) return { error: { code: 'LL409' } };
      return { data: previous?.response ?? null };
    }
    if (name === 'load_game_account') return { data: structuredClone(stored) };
    if (name === 'commit_game_operation') {
      if (failure === 'fail') return { error: { code: 'unavailable' } };
      if (failure === 'conflict') return { data: { conflict: true, revision: stored.revision + 1 } };
      expect(args.p_revision).toBe(stored.revision);
      stored = { state: structuredClone(args.p_state as typeof game), revision: stored.revision + 1 };
      const response = { ...(args.p_response as object), revision: stored.revision };
      cached.set(String(args.p_request), { fingerprint: args.p_fingerprint, response });
      return { data: response };
    }
    throw new Error(`Unexpected RPC: ${name}`);
  });
  const admin = { rpc, auth: { getUser: async () => ({ data: { user: { id: 'user' } } }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { username: 'tester', created_at: '2026-01-01' } }) }) }) }) };
  let handler!: (request: Request) => Promise<Response>;
  const Deno = { env: { get: () => 'configured' }, serve: (callback: typeof handler) => { handler = callback; } };
  new Function('Deno', 'createClient', ...Object.keys(engine), executable)(Deno, () => admin, ...Object.values(engine));
  const send = (operation: GameOperation = kind === 'chest'
    ? { kind: 'openCalamityChest', id: ownedChestId, expectedCount: 2 }
    : { kind: 'purchaseConduit', id: calamiticConduits[0].id }, revision = 7, id = requestId) =>
    handler(new Request('http://localhost/game-operation', { method: 'POST',
      headers: { authorization: 'Bearer test-session', 'content-type': 'application/json' },
      body: JSON.stringify({ requestId: id, expectedRevision: revision, operation }) }));
  return { send, rpc, original: game, stored: () => stored, fail: (mode: typeof failure) => { failure = mode; } };
}

describe('Calamity HTTP persistence and retries', () => {
  it('replays the same Roselius copies and UUIDs after an ambiguous opening response', async () => {
    const id = calamityChestId('roses', 3);
    const h = harness('chest', id);
    const firstResponse = await h.send();
    expect(firstResponse.status).toBe(200);
    const first = validateGameResponse(await firstResponse.json());
    expect(first.calamityOpening?.roseliusCopies).toBe(3);
    expect(first.account.capturedCharacters).toHaveLength(3);
    expect(first.account.calamityChests?.[id]).toBe(1);
    const retry = await h.send();
    expect(retry.status).toBe(200);
    expect(await retry.json()).toEqual(first);
    expect(h.stored().state.account.capturedCharacters).toEqual(first.account.capturedCharacters);
    expect(h.rpc.mock.calls.filter(([name]) => name === 'commit_game_operation')).toHaveLength(1);
  });
  it('returns the same saved receipt on ambiguous transport retry without consuming or rolling twice', async () => {
    const h = harness();
    const response = await h.send();
    expect(response.status).toBe(200);
    const first = validateGameResponse(await response.json());
    expect(first.account.calamityChests?.[chestId]).toBe(1);
    expect(first.account.masterChests).toBe(0);
    expect(first.calamityOpening?.id).toBe(chestId);
    expect(first.calamityOpening?.calamiticTokens).toBe(8);
    const seed = h.stored().state.account.calamitySeed;
    const retry = await h.send();
    expect(retry.status).toBe(200);
    expect(await retry.json()).toEqual(first);
    expect(h.stored().state.account.calamitySeed).toBe(seed);
    expect(h.rpc.mock.calls.filter(([name]) => name === 'commit_game_operation')).toHaveLength(1);
    expect((await h.send({ kind: 'openCalamityChest', id: chestId, expectedCount: 1 })).status).toBe(409);
    expect(h.stored().state.account.calamityChests?.[chestId]).toBe(1);
  });

  it.each(['fail', 'conflict'] as const)('does not expose or persist an opening when commit returns %s', async mode => {
    const h = harness();
    h.fail(mode);
    const response = await h.send();
    expect(response.status).toBe(mode === 'fail' ? 503 : 409);
    expect(await response.json()).not.toHaveProperty('calamityOpening');
    expect(h.stored().state).toEqual(h.original);
    expect(h.stored().revision).toBe(7);
  });

  it('rejects stale revisions before rolling or committing a chest', async () => {
    const h = harness();
    expect((await h.send(undefined, 6)).status).toBe(409);
    expect(h.rpc.mock.calls.some(([name]) => name === 'commit_game_operation')).toBe(false);
    expect(h.stored().state).toEqual(h.original);
  });

  it('authoritatively purchases once and returns the same saved receipt on retry', async () => {
    const h = harness('purchase');
    const operation = { kind: 'purchaseConduit', id: calamiticConduits[0].id } as const;
    const response = await h.send(operation, 7, requestId);
    expect(response.status).toBe(200);
    const first = validateGameResponse(await response.json());
    expect(first.account.calamiticTokens).toBe(25);
    expect(first.account.conduits?.[calamiticConduits[0].id]).toBe(1);
    const retry = await h.send(operation, 7, requestId);
    expect(retry.status).toBe(200);
    expect(await retry.json()).toEqual(first);
    expect(h.stored().state.account.calamiticTokens).toBe(25);
    expect(h.rpc.mock.calls.filter(([name]) => name === 'commit_game_operation')).toHaveLength(1);
    const forged = await h.send({ ...operation, price: 1 } as GameOperation, 7, '00000000-0000-4000-8000-000000000002');
    expect(forged.status).toBe(400);
    expect(h.rpc.mock.calls.filter(([name]) => name === 'commit_game_operation')).toHaveLength(1);
  });
});
