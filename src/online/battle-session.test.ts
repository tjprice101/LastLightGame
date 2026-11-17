import { describe, expect, it, vi } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { RADIANT_ACTION_LOG_KEY, RadiantSession, type RadiantLogStorage } from './battle-session';
import { resolveRadiantPreparation, type RadiantPreparationRequest } from './battle-preparation';
import { RadiantRunError, resolveRadiantRun, type RadiantRunSnapshot, type RadiantRunRequest,
  type RadiantRunResponse, type RadiantRunAuthority, type FrozenRadiantRun } from './battle-run';

let serial = 0;
const uuid = () => `00000000-0000-4000-8000-${(++serial).toString(16).padStart(12, '0')}`;
function memoryStorage(): RadiantLogStorage {
  const items = new Map<string, string>();
  return { getItem: key => items.get(key) ?? null, setItem: (key, value) => { items.set(key, value); },
    removeItem: key => { items.delete(key); } };
}
function fixture(logStorage: RadiantLogStorage | null = null) {
  const game = freshGame('session-fixture'); game.starterId = 'ember';
  game.account.characters.ember = { level: 105, evolution: 6, weaponRank: 0 };
  game.account.squad = ['ember'];
  let snapshot: RadiantRunSnapshot = { revision: 0, state: game };
  const receipts = new Map<string, RadiantRunResponse>();
  const entries = new Map<string, ReturnType<RadiantRunAuthority['entry']>>();
  const preparations = new Map<string, ReturnType<typeof resolveRadiantPreparation>['response']>();
  const authority: RadiantRunAuthority = { capability: 'isolated-radiant-study', now: Date.UTC(2026, 10, 8),
    entry: request => {
      if (!entries.has(request)) entries.set(request, { runId: uuid(), encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 });
      return entries.get(request)!;
    } };
  const transport = { prepare: vi.fn(async (request: RadiantPreparationRequest) => {
    const cached = preparations.get(request.requestId);
    if (cached) return structuredClone(cached);
    const result = resolveRadiantPreparation(snapshot, request);
    snapshot = { revision: result.response.revision, state: result.state };
    preparations.set(request.requestId, structuredClone(result.response));
    return structuredClone(result.response);
  }), read: vi.fn(async () => ({ revision: snapshot.revision,
    account: structuredClone(snapshot.state.account), run: structuredClone(snapshot.state.radiantStudy ?? null) })),
    execute: vi.fn(async (request: RadiantRunRequest) => {
      const cached = receipts.get(request.requestId);
      if (cached) return structuredClone(cached);
      const result = resolveRadiantRun(snapshot, request, authority);
      snapshot = { revision: result.response.revision, state: result.state };
      receipts.set(request.requestId, structuredClone(result.response));
      return structuredClone(result.response);
    }) };
  const session = new RadiantSession({ revision: 0, account: game.account, run: null }, transport, uuid, logStorage);
  return { session, transport, snapshot: () => structuredClone(snapshot) };
}
function finish(session: RadiantSession) {
  session.finishPresentation(session.view().presentation!.requestId);
  session.finishEntrance();
}
async function enter(session: RadiantSession) {
  await session.perform({ kind: 'start', activity: { kind: 'story', stage: 1 }, calibration: 'radiant-pressure-v2' });
  finish(session);
}
function target(session: RadiantSession): string {
  return session.view().run!.state.enemies.find(enemy => enemy.hp > 0)!.id;
}
function strike(session: RadiantSession) {
  return session.act({ type: 'normal', bearerId: 'ember', targetId: target(session) });
}
function playOut(session: RadiantSession): void {
  while (session.view().run!.state.phase === 'player') strike(session);
}
async function settled(session: RadiantSession): Promise<void> {
  playOut(session); await session.settle();
  session.finishPresentation(session.view().presentation!.requestId);
}
describe('saved-only Radiant client run controller', () => {
  it('preparation waits for the saved checkpoint; lost acknowledgements retain exact IDs and never change frozen state', async () => {
    const { session, transport, snapshot } = fixture(); await enter(session);
    session.dismissResults(true); session.setSettings(true);
    const before = session.view(), prepare = transport.prepare.getMockImplementation()!;
    let release!: () => void;
    transport.prepare.mockImplementationOnce(async request => {
      await new Promise<void>(resolve => { release = resolve; });
      await prepare(request); throw new RadiantRunError('unavailable', 'Preparation acknowledgement lost.');
    });
    const pending = session.prepare({ kind: 'setSquad', ids: ['ember'] });
    expect(session.view().saved).toEqual(before.saved);
    await expect(session.perform({ kind: 'quit' })).rejects.toThrow('pending');
    await expect(session.prepare({ kind: 'setSquad', ids: ['ember'] })).rejects.toThrow('pending');
    release(); await expect(pending).rejects.toThrow('acknowledgement');
    expect(session.view().saved).toEqual(before.saved); expect(session.view().preparationPresentation).toBeNull();
    const request = session.view().preparationPending!, committed = snapshot();
    await expect(session.refresh()).rejects.toThrow('pending');
    await session.retryPreparation();
    expect(transport.prepare.mock.calls.at(-1)![0]).toEqual(request); expect(snapshot()).toEqual(committed);
    expect(session.view().saved.revision).toBe(before.saved.revision + 1);
    expect(session.view().saved.run).toEqual(before.saved.run);
    expect(session.view().events).toEqual(before.events); expect(session.view().rewards).toEqual(before.rewards);
    expect(session.view().settingsOpen).toBe(true); expect(session.view().resultsDismissed).toBe(true);
    expect(session.view().presentation).toBeNull();
    await expect(session.prepare({ kind: 'setSquad', ids: ['ember'] })).rejects.toThrow('presentation');
    expect(() => session.finishPreparation(uuid())).toThrow('receipt');
    session.finishPreparation(request.requestId);
    expect(session.view().preparationPresentation).toBeNull();
    await expect(session.retryPreparation()).rejects.toThrow('No unresolved');
  });
  it('definite preparation rejection preserves ownership and requires refresh after revision conflict', async () => {
    const { session, transport } = fixture();
    const before = session.view().saved;
    await expect(session.prepare({ kind: 'setSquad', ids: ['tide'] })).rejects.toMatchObject({ code: 'manual-squad' });
    expect(session.view().saved).toEqual(before); expect(session.view().preparationPending).toBeNull();
    transport.prepare.mockRejectedValueOnce(new RadiantRunError('stale-revision', 'Changed elsewhere.'));
    await expect(session.prepare({ kind: 'setSquad', ids: ['ember'] })).rejects.toMatchObject({ code: 'stale-revision' });
    await expect(session.prepare({ kind: 'setSquad', ids: ['ember'] })).rejects.toThrow('Refresh');
    await session.refresh(); await session.prepare({ kind: 'setSquad', ids: ['ember'] });
    expect(session.view().preparationPresentation).not.toBeNull();
  });
  it('a preparation response cannot erase the frozen run, and disposal suppresses a late saved celebration', async () => {
    const { session, transport, snapshot } = fixture(); await enter(session);
    const before = session.view().saved, prepare = transport.prepare.getMockImplementation()!;
    transport.prepare.mockImplementationOnce(async request => {
      const saved = await prepare(request); return { ...saved, run: null };
    });
    await expect(session.prepare({ kind: 'setSquad', ids: ['ember'] })).rejects.toThrow('does not match');
    expect(session.view().saved).toEqual(before); expect(session.view().preparationPresentation).toBeNull();
    await session.retryPreparation();
    session.finishPreparation(session.view().preparationPresentation!.requestId);
    const acknowledged = session.view().saved;
    let release!: () => void;
    transport.prepare.mockImplementationOnce(async request => {
      await new Promise<void>(resolve => { release = resolve; }); return prepare(request);
    });
    const pending = session.prepare({ kind: 'setSquad', ids: ['ember'] });
    session.dispose(); release();
    const saved = await pending;
    expect(saved.revision).toBe(acknowledged.revision + 1);
    expect(snapshot().revision).toBe(saved.revision);
    expect(session.view().saved).toEqual(acknowledged);
    expect(session.view().preparationPresentation).toBeNull();
  });
  it('start is not optimistic; the saved receipt gates entrance and taps resolve on the device without saving', async () => {
    const { session, transport } = fixture();
    const execute = transport.execute.getMockImplementation()!;
    let release!: () => void;
    transport.execute.mockImplementationOnce(async request => { await new Promise<void>(resolve => { release = resolve; }); return execute(request); });
    const pending = session.perform({ kind: 'start', activity: { kind: 'story', stage: 1 }, calibration: 'radiant-pressure-v2' });
    expect(session.view().busy).toBe(true); expect(session.view().saved.run).toBeNull();
    await expect(session.perform({ kind: 'start', activity: { kind: 'training' }, calibration: 'radiant-pressure-v2' }))
      .rejects.toThrow('pending');
    release(); await pending;
    expect(session.view().entrancePending).toBe(true);
    const snapshot = session.view(); snapshot.saved.account.fractalis = 999999;
    snapshot.saved.run!.state.enemies[0].hp = 0; snapshot.run!.state.enemies[0].hp = 0;
    expect(session.view().saved.account.fractalis).toBe(0);
    expect(session.view().run!.state.enemies[0].hp).toBeGreaterThan(0);
    session.finishPresentation(session.view().presentation!.requestId);
    expect(() => strike(session)).toThrow('entrance');
    session.finishEntrance();
    const calls = transport.execute.mock.calls.length;
    const turn = strike(session);
    expect(transport.execute).toHaveBeenCalledTimes(calls);
    expect(turn.response.rewards).toEqual([]);
    expect(turn.response.revision).toBe(1);
    expect(session.view().saved.revision).toBe(1);
    expect(session.view().saved.account.fractalis).toBe(0);
    expect(session.view().haul).toBe(session.view().run!.state.currencyEarned - session.view().saved.run!.state.currencyEarned);
    expect(session.view().haul).toBeGreaterThan(0);
    playOut(session);
    expect(session.view().settleDue).toBe(true);
    expect(transport.execute).toHaveBeenCalledTimes(calls);
    const haul = session.view().haul;
    await session.settle();
    expect(transport.execute).toHaveBeenCalledTimes(calls + 1);
    expect(transport.execute.mock.calls.at(-1)![0].operation.kind).toBe('settle');
    expect(session.view().saved.revision).toBe(2);
    expect(session.view().saved.account.fractalis).toBeGreaterThanOrEqual(haul);
    expect(session.view().rewards.length).toBeGreaterThan(0);
    expect(session.view().settleDue).toBe(false);
    expect(session.view().run).toEqual(session.view().saved.run);
  });
  it('settle requires a finished encounter and End Turn resolves the enemy phase locally', async () => {
    const { session, transport } = fixture(); await enter(session);
    await expect(session.settle()).rejects.toThrow('finished encounter');
    const calls = transport.execute.mock.calls.length, round = session.view().run!.state.round;
    session.act({ type: 'end-turn' });
    expect(transport.execute).toHaveBeenCalledTimes(calls);
    const live = session.view().run!.state;
    if (live.phase === 'player') { expect(live.round).toBe(round + 1); expect(live.acted).toEqual([]); }
    else expect(live.phase).toBe('defeat');
    expect(session.view().saved.run!.state.round).toBe(round);
  });
  it('lost settle acknowledgement retries the same saved request, pays once and presents once', async () => {
    const { session, transport, snapshot } = fixture(); await enter(session);
    playOut(session);
    const before = session.view(), execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => { await execute(request);
      throw new RadiantRunError('unavailable', 'Connection lost after save.'); });
    await expect(session.settle()).rejects.toThrow('Connection lost');
    expect(session.view().saved).toEqual(before.saved);
    expect(session.view().settleDue).toBe(true);
    expect(session.view().presentation).toBeNull();
    const request = session.view().pending!, saved = snapshot();
    expect(request.operation.kind).toBe('settle');
    await expect(session.refresh()).rejects.toThrow('pending');
    await session.retryPending();
    expect(transport.execute.mock.calls.at(-1)![0]).toEqual(request);
    expect(snapshot()).toEqual(saved);
    expect(session.view().saved.account).toEqual(saved.state.account);
    expect(session.view().rewards).toEqual(saved.state.radiantStudy!.journal.rewards);
    expect(session.view().presentation!.requestId).toBe(request.requestId);
    await expect(session.retryPending()).rejects.toThrow('No unresolved');
    session.finishPresentation(request.requestId);
    expect(session.view().presentation).toBeNull();
  });
  it('Settings blocks device choices and preserves the live run, events and dismissal without operations', async () => {
    const { session, transport } = fixture(); await enter(session);
    session.act({ type: 'defense', bearerId: 'ember' });
    session.dismissResults(true);
    const before = session.view(), calls = transport.execute.mock.calls.length;
    for (let i = 0; i < 3; i++) { session.setSettings(true);
      expect(() => strike(session)).toThrow('Settings');
      session.setSettings(false); }
    expect(session.view()).toEqual(before);
    expect(transport.execute).toHaveBeenCalledTimes(calls);
  });
  it('Continue/Retry retain saved receipts, new encounter resets presentation totals, exit disposes run', async () => {
    const { session } = fixture(); await enter(session);
    await settled(session);
    const banked = session.view(), rewards = banked.rewards;
    expect(banked.saved.run!.state.phase).toBe('victory');
    await session.perform({ kind: 'retry' }); finish(session);
    expect(session.view().rewards).toEqual(rewards);
    expect(session.view().run!.state.phase).toBe('player');
    await settled(session);
    expect(session.view().saved.account.fractalis).toBe(banked.saved.account.fractalis);
    expect(session.view().rewards).toEqual(rewards);
    await session.perform({ kind: 'continue' });
    expect(session.view().saved.run!.anchor.activity).toEqual({ kind: 'story', stage: 2 });
    expect(session.view().saved.run!.initial.bearers).toEqual(banked.saved.run!.initial.bearers);
    expect(session.view().rewards).toEqual([]); expect(session.view().events).toEqual([]);
    expect(session.view().run).toEqual(session.view().saved.run);
    finish(session);
    strike(session);
    await session.perform({ kind: 'exit' });
    expect(session.view().saved.run).toBeNull(); expect(session.view().run).toBeNull();
    expect(session.view().haul).toBe(0);
    expect(session.view().saved.account.fractalis).toBe(banked.saved.account.fractalis);
    expect(session.view().presentation!.response.run.quit).toBe(true);
  });
  it('fresh checkpoint restores the frozen run without replaying saved events or entrance on Settings close', async () => {
    const { session, transport, snapshot } = fixture(); await enter(session);
    const stored = snapshot();
    const resumed = new RadiantSession({ revision: 0, account: freshGame('empty').account, run: null }, transport, uuid);
    await resumed.refresh();
    expect(resumed.view().saved.run).toEqual(stored.state.radiantStudy);
    expect(resumed.view().run).toEqual(stored.state.radiantStudy);
    expect(resumed.view().events).toEqual(session.view().events);
    expect(resumed.view().rewards).toEqual(session.view().rewards);
    expect(resumed.view().presentation).toBeNull();
    resumed.finishEntrance(); resumed.setSettings(true); resumed.setSettings(false);
    expect(resumed.view().entrancePending).toBe(false);
  });
  it('a combat-only resume log replays device play after reconstruction and never grants anything', async () => {
    const storage = memoryStorage();
    const { session, transport } = fixture(storage); await enter(session);
    session.act({ type: 'defense', bearerId: 'ember' });
    const live = session.view(), raw = storage.getItem(RADIANT_ACTION_LOG_KEY)!;
    expect(JSON.parse(raw)).toMatchObject({ runId: live.saved.run!.id, encounter: 1, revision: live.saved.revision,
      actions: [{ type: 'defense', bearerId: 'ember' }] });
    const resumed = new RadiantSession(live.saved, transport, uuid, storage);
    expect(resumed.view().run).toEqual(live.run);
    expect(resumed.view().haul).toBe(live.haul);
    expect(resumed.view().saved).toEqual(live.saved);
    expect(new RadiantSession(live.saved, transport, uuid).view().run).toEqual(live.saved.run);
    storage.setItem(RADIANT_ACTION_LOG_KEY, JSON.stringify({ ...JSON.parse(raw), revision: live.saved.revision + 1 }));
    expect(new RadiantSession(live.saved, transport, uuid, storage).view().run).toEqual(live.saved.run);
    expect(storage.getItem(RADIANT_ACTION_LOG_KEY)).toBeNull();
    storage.setItem(RADIANT_ACTION_LOG_KEY, raw);
    const replayed = new RadiantSession(live.saved, transport, uuid, storage);
    replayed.finishEntrance(); playOut(replayed);
    await replayed.settle();
    expect(storage.getItem(RADIANT_ACTION_LOG_KEY)).toBeNull();
    const actions = (transport.execute.mock.calls.at(-1)![0].operation as { actions: unknown[] }).actions;
    expect(actions[0]).toEqual({ type: 'defense', bearerId: 'ember' });
  });
  it('a settle whose saved replay differs from device playback adopts the saved result', async () => {
    const { session, snapshot } = fixture(); await enter(session);
    playOut(session);
    (session as unknown as { local: { run: FrozenRadiantRun } }).local.run.state.round += 7;
    await session.settle();
    expect(session.view().error?.code).toBe('settle-mismatch');
    expect(session.view().saved.run).toEqual(snapshot().state.radiantStudy);
    expect(session.view().run).toEqual(session.view().saved.run);
  });
  it.each(['invalid-input', 'manual-squad', 'stale-revision', 'stale-run', 'receipt-conflict', 'overflow'] as const)(
    'definite settle denial %s leaves saved state intact and allows refresh instead of new speculative actions', async code => {
      const { session, transport } = fixture(); await enter(session);
      playOut(session);
      const before = session.view().saved;
      transport.execute.mockRejectedValueOnce(new RadiantRunError(code, 'Explicit denial.'));
      await expect(session.settle()).rejects.toThrow('Explicit denial.');
      expect(session.view().saved).toEqual(before); expect(session.view().pending).toBeNull();
      if (code === 'invalid-input') {
        // A rejected replay saved nothing: device play restarts from the saved start.
        expect(session.view().error!.code).toBe(code);
        expect(session.view().error!.message).toContain('restarts from its saved start');
        expect(session.view().settleDue).toBe(false);
        expect(session.view().run).toEqual(before.run);
      } else expect(session.view().error).toEqual({ code, message: 'Explicit denial.' });
      if (['stale-revision', 'stale-run', 'receipt-conflict'].includes(code)) {
        await expect(session.settle()).rejects.toThrow('Refresh');
        expect(() => session.act({ type: 'end-turn' })).toThrow('Refresh');
      }
      await session.refresh(); expect(session.view().error).toBeNull();
    });
  it('invalid/unrelated successful-looking response cannot overwrite state and retains exact retry', async () => {
    const { session, transport } = fixture(); await enter(session);
    playOut(session);
    const before = session.view().saved, execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => {
      const saved = await execute(request); saved.revision++; return saved;
    });
    await expect(session.settle()).rejects.toThrow('does not match');
    expect(session.view().saved).toEqual(before); expect(session.view().pending).not.toBeNull();
    await session.retryPending();
    expect(session.view().saved.revision).toBe(2);
  });
  it('disposed pending settle never queues presentation or changes the disposed view', async () => {
    const { session, transport } = fixture(); await enter(session);
    playOut(session);
    let release!: () => void;
    const execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => { await new Promise<void>(resolve => { release = resolve; }); return execute(request); });
    const before = session.view().saved, settle = session.settle();
    session.dispose(); release(); const saved = await settle;
    expect(saved.revision).toBe(2);
    expect(session.view().saved).toEqual(before); expect(session.view().presentation).toBeNull();
    expect(() => session.act({ type: 'end-turn' })).toThrow('disposed');
  });
  it('Settings opened during a settle retains the exact saved presentation until explicitly finished', async () => {
    const { session, transport } = fixture(); await enter(session);
    playOut(session);
    let release!: () => void;
    const execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => {
      await new Promise<void>(resolve => { release = resolve; }); return execute(request);
    });
    const pending = session.settle(); session.setSettings(true);
    release(); const response = await pending;
    expect(session.view().settingsOpen).toBe(true);
    expect(session.view().saved.run).toEqual(response.run);
    const presentation = session.view().presentation!;
    session.setSettings(false); session.setSettings(true); session.setSettings(false);
    expect(session.view().presentation).toEqual(presentation);
    expect(() => session.finishPresentation(uuid())).toThrow('does not match');
    session.finishPresentation(presentation.requestId);
    expect(session.view().presentation).toBeNull();
  });
  it('read failure or malformed checkpoint cannot overwrite or celebrate prior saved state', async () => {
    const { session, transport } = fixture(); await enter(session);
    const before = session.view().saved;
    transport.read.mockRejectedValueOnce(new RadiantRunError('unavailable', 'Read unavailable.'));
    await expect(session.refresh()).rejects.toThrow('Read unavailable.');
    expect(session.view().saved).toEqual(before);
    expect(session.view().presentation).toBeNull();
    transport.read.mockResolvedValueOnce({ ...before, revision: -1 } as never);
    await expect(session.refresh()).rejects.toThrow('Invalid saved Radiant checkpoint');
    expect(session.view().saved).toEqual(before);
    await session.refresh();
    expect(session.view().saved).toEqual(before); expect(session.view().error).toBeNull();
  });
  it('durable journal survives independent controller reconstruction without replaying a celebration', async () => {
    const { session, transport } = fixture(); await enter(session);
    await settled(session);
    const before = session.view();
    const resumed = new RadiantSession(before.saved, transport, uuid);
    expect(resumed.view().events).toEqual(before.events);
    expect(resumed.view().rewards).toEqual(before.rewards);
    expect(resumed.view().presentation).toBeNull();
    expect(resumed.view().settleDue).toBe(false);
    resumed.dismissResults(true); resumed.setSettings(true); resumed.setSettings(false);
    expect(resumed.view().resultsDismissed).toBe(true);
    const corrupt = structuredClone(before.saved);
    corrupt.run!.journal.events.push({ type: 'currency', enemyId: corrupt.run!.enemies[0].id, amount: 1, totalPaid: 1 });
    expect(() => new RadiantSession(corrupt, transport, uuid)).toThrow('checkpoint');
    const invalid = structuredClone(before.saved);
    invalid.run!.journal.rewards[0].materials = { invented: 1 };
    expect(() => new RadiantSession(invalid, transport, uuid)).toThrow('checkpoint');
  });
  it('unknown transport failure preserves retry and surfaces explicit non-success feedback', async () => {
    const { session, transport } = fixture(); await enter(session);
    playOut(session);
    const before = session.view().saved;
    transport.execute.mockRejectedValueOnce(new Error('network failure'));
    await expect(session.settle()).rejects.toThrow('network failure');
    expect(session.view().pending).not.toBeNull();
    expect(session.view().saved).toEqual(before);
    expect(session.view().error).toEqual({ code: 'unavailable',
      message: 'Operation was not acknowledged; retry the same request.' });
    expect(session.view().presentation).toBeNull();
    await session.retryPending();
    expect(session.view().error).toBeNull();
  });
});
