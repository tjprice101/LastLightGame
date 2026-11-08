import { afterEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { resolveRadiantRun, type RadiantRunRequest, type RadiantCheckpoint } from './radiant-run';
import { radiantStudyOperation, readRadiantStudy } from './radiant-transport';

const mocks = vi.hoisted(() => ({ onlineClient: vi.fn() }));
vi.mock('./account-client', () => ({ onlineClient: mocks.onlineClient }));
const id = '00000000-0000-4000-8000-000000000001';
const request: RadiantRunRequest = { requestId: id, expectedRevision: 0, runId: null, encounter: null,
  operation: { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' } };
function savedResponse() {
  const game = freshGame('fixture');
  game.account.characters.ember = { level: 0, evolution: 1, weaponRank: 0 };
  game.account.squad = ['ember']; game.starterId = 'ember';
  return resolveRadiantRun({ revision: 0, state: game }, request, {
    capability: 'isolated-radiant-study', now: Date.UTC(2026, 10, 8),
    entry: () => ({ runId: id, encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }),
  }).response;
}
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });
describe('dedicated typed Radiant transport, not a production gameOperation', () => {
  it('reads a dedicated saved checkpoint without a new action ID or replay reward payload', async () => {
    const saved = savedResponse();
    const checkpoint: RadiantCheckpoint = { revision: saved.revision, account: saved.account, run: saved.run };
    const invoke = vi.fn(async () => ({ data: checkpoint, error: null }));
    mocks.onlineClient.mockReturnValue({ functions: { invoke } });
    await expect(readRadiantStudy()).resolves.toEqual(checkpoint);
    expect(invoke).toHaveBeenCalledWith('game-operation', { body: { radiantStudy: { kind: 'read' } }, timeout: 30_000 });
    invoke.mockResolvedValueOnce({ data: { ...checkpoint, run: null }, error: null });
    await expect(readRadiantStudy()).resolves.toMatchObject({ run: null });
    invoke.mockResolvedValueOnce({ data: { ...checkpoint, run: [] } as never, error: null });
    await expect(readRadiantStudy()).rejects.toMatchObject({ code: 'unavailable' });
  });
  it('uses real authenticated SDK function request with the dedicated envelope and parses a saved response', async () => {
    const response = savedResponse(), bodies: unknown[] = [], auth: string[] = [];
    const client = createClient('https://fixture.supabase.co', 'fixture-key', {
      accessToken: async () => 'fixture-token',
      global: { fetch: async (_url, init) => {
        bodies.push(JSON.parse(String(init?.body)));
        auth.push(new Headers(init?.headers).get('authorization')!);
        return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } });
      } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    mocks.onlineClient.mockReturnValue(client);
    await expect(radiantStudyOperation(request)).resolves.toEqual(response);
    expect(bodies).toEqual([{ radiantStudy: request }]);
    expect(auth).toEqual(['Bearer fixture-token']);
  });
  it.each([[503, 'unavailable'], [409, 'receipt-conflict'], [400, 'manual-squad']])(
    'preserves explicit authority error %i/%s', async (status, code) => {
      const invoke = vi.fn(async () => ({ data: null, error: {
        context: new Response(JSON.stringify({ code, error: 'Authority denial.' }), { status }),
      } }));
      mocks.onlineClient.mockReturnValue({ functions: { invoke } });
      await expect(radiantStudyOperation(request)).rejects.toMatchObject({ code, message: 'Authority denial.' });
      expect(invoke).toHaveBeenCalledWith('game-operation', { body: { radiantStudy: request }, timeout: 30_000 });
    });
  it('rejects malformed request before transport and malformed RPC responses before use', async () => {
    const invoke = vi.fn(async () => ({ data: { revision: 1, run: [] }, error: null }));
    mocks.onlineClient.mockReturnValue({ functions: { invoke } });
    await expect(radiantStudyOperation({ ...request, expectedRevision: NaN })).rejects.toMatchObject({ code: 'invalid-input' });
    expect(invoke).not.toHaveBeenCalled();
    await expect(radiantStudyOperation(request)).rejects.toMatchObject({ code: 'unavailable' });
    const response = savedResponse();
    response.run.initial.enemies[0].currency.budget++;
    invoke.mockResolvedValueOnce({ data: response as never, error: null });
    await expect(radiantStudyOperation(request)).rejects.toMatchObject({ code: 'unavailable' });
  });
  it('bounds real SDK network wait at 30s; caller retry sends identical request without local mutation', async () => {
    vi.useFakeTimers();
    const bodies: string[] = [], response = savedResponse();
    let signal: AbortSignal | null | undefined;
    const client = createClient('https://fixture.supabase.co', 'fixture-key', {
      accessToken: async () => 'fixture-token',
      global: { fetch: async (_url, init) => {
        bodies.push(String(init?.body)); signal = init?.signal;
        if (bodies.length > 1) return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } });
        return new Promise((_resolve, reject) => signal?.addEventListener('abort',
          () => reject(new DOMException('Timed out', 'AbortError')), { once: true }));
      } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    mocks.onlineClient.mockReturnValue(client);
    const pending = expect(radiantStudyOperation(request)).rejects.toMatchObject({
      code: 'unavailable', message: expect.stringContaining('same study request ID'),
    });
    await vi.advanceTimersByTimeAsync(30_000); await pending;
    expect(signal?.aborted).toBe(true);
    await expect(radiantStudyOperation(request)).resolves.toEqual(response);
    expect(bodies[1]).toBe(bodies[0]); expect(vi.getTimerCount()).toBe(0);
  });
});
