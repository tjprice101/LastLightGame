import { afterEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { freshGame, resolveOperation } from '../../supabase/functions/game-operation/engine';
import { gameOperation, GameOperationError } from './server-game';

const mocks = vi.hoisted(() => ({ onlineClient: vi.fn() }));
vi.mock('./account-client', () => ({ onlineClient: mocks.onlineClient }));

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('bounded authoritative gameplay transport', () => {
  it('aborts a stalled real SDK request at 30 seconds and retries the identical request envelope', async () => {
    vi.useFakeTimers();
    const response = resolveOperation(freshGame('tester'), { kind: 'read' }, {
      seed: () => 1, uuid: () => crypto.randomUUID(), random: () => .5,
    }).response;
    const requests: string[] = [];
    let signal: AbortSignal | null | undefined;
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      requests.push(String(init?.body));
      signal = init?.signal;
      if (requests.length > 1) return Promise.resolve(new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
      }));
      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')), { once: true });
      });
    });
    const client = createClient('https://fixture.supabase.co', 'fixture-key', {
      accessToken: async () => 'fixture-token',
      global: { fetch: fetcher },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    mocks.onlineClient.mockReturnValue(client);
    const requestId = '00000000-0000-4000-8000-000000000001';
    const pending = gameOperation({ kind: 'read' }, 7, requestId);
    const rejected = expect(pending).rejects.toMatchObject({
      name: 'Error', status: undefined,
      message: expect.stringContaining('may already be saved'),
    });
    await vi.advanceTimersByTimeAsync(29_999);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await rejected;
    expect(signal?.aborted).toBe(true);
    await expect(gameOperation({ kind: 'read' }, 7, requestId)).resolves.toEqual(response);
    expect(requests[1]).toBe(requests[0]);
    expect(JSON.parse(requests[0])).toEqual({ requestId, expectedRevision: 7, operation: { kind: 'read' } });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserves explicit server rejection status without classifying it as an ambiguous timeout', async () => {
    mocks.onlineClient.mockReturnValue({ functions: { invoke: vi.fn(async () => ({
      data: null,
      error: { context: new Response(JSON.stringify({ error: 'Revision changed.' }), { status: 409 }) },
    })) } });
    try {
      await gameOperation({ kind: 'read' });
      expect.fail('Expected server rejection.');
    } catch (error) {
      expect(error).toBeInstanceOf(GameOperationError);
      expect(error).toMatchObject({ status: 409, message: 'Revision changed.' });
    }
  });
});
