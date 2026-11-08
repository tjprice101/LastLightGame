import { describe, expect, it, vi } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { RadiantSession } from './radiant-session';
import { RadiantRunError, resolveRadiantRun, type RadiantRunSnapshot, type RadiantRunRequest,
  type RadiantRunResponse, type RadiantRunAuthority } from './radiant-run';

let serial = 0;
const uuid = () => `00000000-0000-4000-8000-${(++serial).toString(16).padStart(12, '0')}`;
function fixture() {
  const game = freshGame('session-fixture'); game.starterId = 'ember';
  game.account.characters.ember = { level: 105, evolution: 6, weaponRank: 0 };
  game.account.squad = ['ember'];
  let snapshot: RadiantRunSnapshot = { revision: 0, state: game };
  const receipts = new Map<string, RadiantRunResponse>();
  const entries = new Map<string, ReturnType<RadiantRunAuthority['entry']>>();
  const authority: RadiantRunAuthority = { capability: 'isolated-radiant-study', now: Date.UTC(2026, 10, 8),
    entry: request => {
      if (!entries.has(request)) entries.set(request, { runId: uuid(), encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 });
      return entries.get(request)!;
    } };
  const transport = { read: vi.fn(async () => ({ revision: snapshot.revision,
    account: structuredClone(snapshot.state.account), run: structuredClone(snapshot.state.radiantStudy ?? null) })),
    execute: vi.fn(async (request: RadiantRunRequest) => {
      const cached = receipts.get(request.requestId);
      if (cached) return structuredClone(cached);
      const result = resolveRadiantRun(snapshot, request, authority);
      snapshot = { revision: result.response.revision, state: result.state };
      receipts.set(request.requestId, structuredClone(result.response));
      return structuredClone(result.response);
    }) };
  const session = new RadiantSession({ revision: 0, account: game.account, run: null }, transport, uuid);
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
function normal(session: RadiantSession) {
  return { kind: 'action', action: { type: 'normal', bearerId: 'ember',
    targetId: session.view().saved.run!.state.enemies.find(enemy => enemy.hp > 0)!.id } } as const;
}
describe('saved-only Radiant client run controller', () => {
  it('start is not optimistic; exactly saved receipt gates entrance/actions and consumers cannot mutate it', async () => {
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
    snapshot.saved.run!.state.enemies[0].hp = 0;
    expect(session.view().saved.account.fractalis).toBe(0);
    expect(session.view().saved.run!.state.enemies[0].hp).toBeGreaterThan(0);
    await expect(session.perform(normal(session))).rejects.toThrow('presentation');
    session.finishPresentation(session.view().presentation!.requestId);
    await expect(session.perform(normal(session))).rejects.toThrow('entrance');
    session.finishEntrance(); await session.perform(normal(session));
    expect(session.view().saved.revision).toBe(2);
    expect(session.view().rewards).toHaveLength(1);
  });
  it('lost acknowledgement retries the same saved request, pays once and presents once', async () => {
    const { session, transport, snapshot } = fixture(); await enter(session);
    const before = session.view(), execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => { await execute(request);
      throw new RadiantRunError('unavailable', 'Connection lost after save.'); });
    await expect(session.perform(normal(session))).rejects.toThrow('Connection lost');
    expect(session.view().saved).toEqual(before.saved);
    expect(session.view().presentation).toBeNull();
    const request = session.view().pending!, saved = snapshot();
    await expect(session.refresh()).rejects.toThrow('pending');
    await session.retryPending();
    expect(transport.execute.mock.calls.at(-1)![0]).toEqual(request);
    expect(snapshot()).toEqual(saved);
    expect(session.view().saved.account).toEqual(saved.state.account);
    expect(session.view().rewards).toHaveLength(1);
    expect(session.view().presentation!.requestId).toBe(request.requestId);
    await expect(session.retryPending()).rejects.toThrow('No unresolved');
    session.finishPresentation(request.requestId);
    expect(session.view().presentation).toBeNull();
  });
  it('Settings preserves frozen HP/Gauges/shields/events/receipt and dismissal without operations', async () => {
    const { session, transport } = fixture(); await enter(session);
    await session.perform(normal(session)); finish(session);
    session.dismissResults(true);
    const before = session.view(), calls = transport.execute.mock.calls.length;
    for (let i = 0; i < 3; i++) { session.setSettings(true);
      await expect(session.perform(normal(session))).rejects.toThrow('Settings');
      session.setSettings(false); }
    expect(session.view()).toEqual(before);
    expect(transport.execute).toHaveBeenCalledTimes(calls);
  });
  it('Continue/Retry retain saved receipts, new encounter resets presentation totals, exit disposes run', async () => {
    const { session } = fixture(); await enter(session);
    while (session.view().saved.run!.state.phase === 'player') { await session.perform(normal(session)); finish(session); }
    const banked = session.view(), rewards = banked.rewards;
    await session.perform({ kind: 'retry' }); finish(session);
    expect(session.view().rewards).toEqual(rewards);
    while (session.view().saved.run!.state.phase === 'player') { await session.perform(normal(session)); finish(session); }
    expect(session.view().saved.account.fractalis).toBe(banked.saved.account.fractalis);
    expect(session.view().rewards).toEqual(rewards);
    await session.perform({ kind: 'continue' });
    expect(session.view().saved.run!.anchor.activity).toEqual({ kind: 'story', stage: 2 });
    expect(session.view().saved.run!.initial.bearers).toEqual(banked.saved.run!.initial.bearers);
    expect(session.view().rewards).toEqual([]); expect(session.view().events).toEqual([]);
    finish(session);
    await session.perform({ kind: 'exit' });
    expect(session.view().saved.run).toBeNull();
    expect(session.view().saved.account.fractalis).toBe(banked.saved.account.fractalis);
    expect(session.view().presentation!.response.run.quit).toBe(true);
  });
  it('fresh checkpoint restores frozen run without replaying saved events or entrance on Settings close', async () => {
    const { session, transport, snapshot } = fixture(); await enter(session);
    await session.perform(normal(session)); finish(session);
    const stored = snapshot();
    const resumed = new RadiantSession({ revision: 0, account: freshGame('empty').account, run: null }, transport, uuid);
    await resumed.refresh();
    expect(resumed.view().saved.run).toEqual(stored.state.radiantStudy);
    expect(resumed.view().events).toEqual(session.view().events);
    expect(resumed.view().rewards).toEqual(session.view().rewards);
    expect(resumed.view().presentation).toBeNull();
    resumed.finishEntrance(); resumed.setSettings(true); resumed.setSettings(false);
    expect(resumed.view().entrancePending).toBe(false);
  });
  it.each(['invalid-input', 'manual-squad', 'stale-revision', 'stale-run', 'receipt-conflict', 'overflow'] as const)(
    'definite denial %s leaves saved state intact and allows refresh instead of new speculative actions', async code => {
      const { session, transport } = fixture(); await enter(session);
      const before = session.view().saved;
      transport.execute.mockRejectedValueOnce(new RadiantRunError(code, 'Explicit denial.'));
      await expect(session.perform(normal(session))).rejects.toThrow('Explicit denial.');
      expect(session.view().saved).toEqual(before); expect(session.view().pending).toBeNull();
      expect(session.view().error).toEqual({ code, message: 'Explicit denial.' });
      if (['stale-revision', 'stale-run', 'receipt-conflict'].includes(code))
        await expect(session.perform(normal(session))).rejects.toThrow('Refresh');
      await session.refresh(); expect(session.view().error).toBeNull();
    });
  it('invalid/unrelated successful-looking response cannot overwrite state and retains exact retry', async () => {
    const { session, transport } = fixture(); await enter(session);
    const before = session.view().saved, execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => {
      const saved = await execute(request); saved.revision++; return saved;
    });
    await expect(session.perform(normal(session))).rejects.toThrow('does not match');
    expect(session.view().saved).toEqual(before); expect(session.view().pending).not.toBeNull();
    await session.retryPending();
    expect(session.view().saved.revision).toBe(2);
  });
  it('disposed pending operation never queues presentation or changes the disposed view', async () => {
    const { session, transport } = fixture(); await enter(session);
    let release!: () => void;
    const execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => { await new Promise<void>(resolve => { release = resolve; }); return execute(request); });
    const before = session.view().saved, action = session.perform(normal(session));
    session.dispose(); release(); const saved = await action;
    expect(saved.revision).toBe(2);
    expect(session.view().saved).toEqual(before); expect(session.view().presentation).toBeNull();
    await expect(session.perform(normal(session))).rejects.toThrow('disposed');
  });
  it('Settings opened during save retains the exact saved presentation until explicitly finished', async () => {
    const { session, transport } = fixture(); await enter(session);
    let release!: () => void;
    const execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => {
      await new Promise<void>(resolve => { release = resolve; }); return execute(request);
    });
    const pending = session.perform(normal(session)); session.setSettings(true);
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
    while (session.view().saved.run!.state.phase === 'player') { await session.perform(normal(session)); finish(session); }
    const before = session.view();
    const resumed = new RadiantSession(before.saved, transport, uuid);
    expect(resumed.view().events).toEqual(before.events);
    expect(resumed.view().rewards).toEqual(before.rewards);
    expect(resumed.view().presentation).toBeNull();
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
    const before = session.view().saved;
    transport.execute.mockRejectedValueOnce(new Error('network failure'));
    await expect(session.perform(normal(session))).rejects.toThrow('network failure');
    expect(session.view().pending).not.toBeNull();
    expect(session.view().saved).toEqual(before);
    expect(session.view().error).toEqual({ code: 'unavailable',
      message: 'Operation was not acknowledged; retry the same request.' });
    expect(session.view().presentation).toBeNull();
    await session.retryPending();
    expect(session.view().error).toBeNull();
  });
});
