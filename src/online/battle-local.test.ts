import { describe, expect, it } from 'vitest';
import { emptyAccount, loadAccount, saveAccount, type Account } from '../game/account';
import { releasedRadiantIds } from '../content/combat-kits';
import { LOCAL_RADIANT_KEY, LocalRadiantTransport } from './battle-local';
import { applyRadiantTurn, retiredRadiantRunNotice, validateRadiantRunSnapshot,
  type FrozenRadiantRun, type RadiantRunOperation, type RadiantRunRequest, type RadiantTurnAction } from './battle-run';

class MemoryStorage {
  values = new Map<string, string>();
  failNext = false;
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (this.failNext && key === LOCAL_RADIANT_KEY) { this.failNext = false; throw new Error('quota'); }
    this.values.set(key, value);
  }
  removeItem(key: string) { this.values.delete(key); }
}

function seeded(): MemoryStorage {
  const storage = new MemoryStorage(), account: Account = emptyAccount();
  account.squad = releasedRadiantIds.slice(0, 2);
  account.squad.forEach(member => { account.characters[member as keyof Account['characters']] = {
    level: 0, evolution: 1, weaponRank: 0 }; });
  saveAccount(storage, account);
  return storage;
}

/** Device play on a copy of the saved run until the encounter ends (D-471). */
function play(saved: FrozenRadiantRun): { run: FrozenRadiantRun; actions: RadiantTurnAction[] } {
  const run = structuredClone(saved), actions: RadiantTurnAction[] = [];
  while (run.state.phase === 'player' && actions.length < 1000) {
    const action: RadiantTurnAction = { type: 'normal',
      bearerId: run.state.bearers.find(unit => unit.hp > 0 && !run.state.acted.includes(unit.loadout.id))!.loadout.id,
      targetId: run.state.enemies.find(unit => unit.hp > 0)!.id };
    applyRadiantTurn(run, action); actions.push(action);
  }
  return { run, actions };
}
async function send(transport: LocalRadiantTransport, operation: RadiantRunOperation, requestId: string = crypto.randomUUID()) {
  const checkpoint = await transport.read();
  const request: RadiantRunRequest = { requestId, expectedRevision: checkpoint.revision,
    runId: operation.kind === 'start' ? null : checkpoint.run!.id,
    encounter: operation.kind === 'start' ? null : checkpoint.run!.encounter, operation };
  return transport.execute(request);
}

describe('local Radiant authority', () => {
  it('reloads a settled encounter whose journal carries signature events (saves stay playable)', async () => {
    const storage = new MemoryStorage(), account: Account = emptyAccount();
    account.squad = ['vaelor', 'ember'];
    account.squad.forEach(member => { account.characters[member as keyof Account['characters']] = {
      level: 0, evolution: 1, weaponRank: 0 }; });
    saveAccount(storage, account);
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const local = play(started.run);
    const settled = await send(transport, { kind: 'settle', actions: local.actions });
    // Vaelor's Beat is signature bookkeeping recorded every new round.
    expect(settled.run.journal.events.some(event => event.type === 'signature')).toBe(true);
    const checkpoint = await transport.read();
    expect(checkpoint.run?.id).toBe(settled.run.id);
    expect(checkpoint.revision).toBe(settled.revision);
    const snapshot = { revision: 9, state: { profile: {}, starterId: 'ember', run: null,
      account: settled.account, radiantStudy: settled.run } };
    expect(validateRadiantRunSnapshot(snapshot).state.radiantStudy).toEqual(settled.run);
    const journal = structuredClone(settled.run);
    const signature = journal.journal.events.find(event => event.type === 'signature')!;
    Object.assign(signature, { op: 'not-an-op' });
    expect(() => validateRadiantRunSnapshot({ ...snapshot, state: { ...snapshot.state, radiantStudy: journal } }))
      .toThrow('Invalid saved Radiant account');
  });

  it.each([3, 4, 5, 6, 7])('retires rules %s without changing storage, revision, holdings or saved rewards on read', async version => {
    const storage = seeded();
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const record = JSON.parse(storage.getItem(LOCAL_RADIANT_KEY)!);
    record.run.version = version;
    storage.setItem(LOCAL_RADIANT_KEY, JSON.stringify(record));
    const before = new Map(storage.values);
    const checkpoint = await transport.read();
    expect(checkpoint).toEqual({ revision: started.revision, account: started.account,
      run: null, notice: retiredRadiantRunNotice });
    expect(storage.values).toEqual(before);
    const fresh = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    expect(fresh.revision).toBe(started.revision + 1);
    expect(fresh.run.version).toBe(8);
    expect((await transport.read()).notice).toBeUndefined();
  });

  it('retires the online old encounter on a cloned read without changing account or revision', async () => {
    const storage = seeded(), transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const snapshot = { revision: 17, state: { profile: {}, starterId: 'ember', run: null,
      account: started.account, radiantStudy: { ...started.run, version: 3 } } };
    const before = structuredClone(snapshot);
    const result = validateRadiantRunSnapshot(snapshot);
    expect(result.revision).toBe(17);
    expect(result.notice).toBe(retiredRadiantRunNotice);
    expect(result.state.radiantStudy).toBeUndefined();
    expect(result.state.account).toEqual(started.account);
    expect(snapshot).toEqual(before);
    snapshot.state.radiantStudy.version = 8;
    snapshot.state.radiantStudy.state.enemies[0].elementId = null;
    expect(() => validateRadiantRunSnapshot(snapshot)).toThrow('Invalid saved Radiant account');
  });

  it('rejects corrupt current encounters explicitly without changing the saved account or record', async () => {
    const storage = seeded(), transport = new LocalRadiantTransport(storage, () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const record = JSON.parse(storage.getItem(LOCAL_RADIANT_KEY)!);
    record.run.state.enemies[0].elementId = null;
    storage.setItem(LOCAL_RADIANT_KEY, JSON.stringify(record));
    const before = new Map(storage.values);
    await expect(transport.read()).rejects.toMatchObject({ code: 'unavailable' });
    expect(storage.values).toEqual(before);
  });

  it('starts a live encounter, persists the frozen run and resumes it after reload', async () => {
    const storage = seeded();
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    expect(started.revision).toBe(1);
    const reloaded = await new LocalRadiantTransport(storage, () => 'ember').read();
    expect(reloaded.run?.id).toBe(started.run.id);
    expect(reloaded.run?.state.bearers).toHaveLength(2);
  });
  it('applies owned Conduits in a new battle and keeps their frozen effects after menu equipment changes', async () => {
    const storage = seeded();
    const account = loadAccount(storage);
    account.squad = ['ember', 'tide'];
    account.conduits = { 'vigil-core': 1, 'reserve-torque-crank': 1 };
    account.conduitEquipment = { ember: ['vigil-core', 'reserve-torque-crank', null, null, null, null, null, null] };
    saveAccount(storage, account);
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    expect(started.run.state.bearers[0].stats.hp).toBe(288);
    const unequipped = loadAccount(storage);
    unequipped.conduitEquipment = {};
    saveAccount(storage, unequipped);
    const reloaded = new LocalRadiantTransport(storage, () => 'ember');
    expect((await reloaded.read()).run!.state.bearers[0].stats.hp).toBe(288);
    const device = structuredClone((await reloaded.read()).run!);
    const events = applyRadiantTurn(device, { type: 'normal', bearerId: 'ember', targetId: started.run.state.enemies[0].id });
    // 15 Normal hit + 1 from Reserve Torque Crank (D-480).
    expect(device.state.gauge.members[0].charge).toBe(16);
    expect(events).toContainEqual(expect.objectContaining({
      type: 'charge', gearSource: { kind: 'gear', bearerId: 'ember', conduitId: 'reserve-torque-crank' },
    }));
  });

  it('device play writes nothing until the settle saves the replayed encounter and its Haul', async () => {
    const storage = seeded();
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const saved = (await transport.read()).run!, before = new Map(storage.values);
    const wallet = loadAccount(storage).fractalis;
    const local = play(saved);
    expect(['victory', 'defeat']).toContain(local.run.state.phase);
    expect(storage.values).toEqual(before);
    const settled = await send(transport, { kind: 'settle', actions: local.actions });
    expect(settled.revision).toBe(2);
    expect(settled.run.state).toEqual(local.run.state);
    expect(loadAccount(storage).fractalis).toBe(settled.account.fractalis);
    expect(settled.account.fractalis - wallet).toBeGreaterThanOrEqual(local.run.state.currencyEarned);
    expect((await transport.read()).run!.state).toEqual(local.run.state);
  });

  it('rejects an unfinished settle without writing', async () => {
    const storage = seeded();
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const saved = (await transport.read()).run!, before = new Map(storage.values);
    const local = play(saved);
    await expect(send(transport, { kind: 'settle', actions: local.actions.slice(0, 1) }))
      .rejects.toMatchObject({ code: 'invalid-input' });
    expect(storage.values).toEqual(before);
  });

  it('commits a settled encounter and exits while keeping the saved account', async () => {
    const storage = seeded();
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const run = (await transport.read()).run!;
    const acted = await send(transport, { kind: 'settle', actions: play(run).actions });
    expect(acted.revision).toBe(2);
    expect(acted.events.length).toBeGreaterThan(0);
    await send(transport, { kind: 'exit' });
    const after = await transport.read();
    expect(after.revision).toBe(3);
    expect(loadAccount(storage).fractalis).toBe(acted.account.fractalis);
  });

  it('replays an identical request ID without a second resolution', async () => {
    const storage = seeded();
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const operation: RadiantRunOperation = { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' };
    const id = crypto.randomUUID();
    const first = await send(transport, operation, id);
    const checkpoint = await transport.read();
    const again = await transport.execute({ requestId: id, expectedRevision: 0, runId: null, encounter: null, operation });
    expect(again).toEqual(first);
    expect((await transport.read()).revision).toBe(checkpoint.revision);
  });

  it('restores the account when the run write fails', async () => {
    const storage = seeded();
    const before = storage.getItem('last-light.wallet');
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    storage.failNext = true;
    await expect(send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' }))
      .rejects.toMatchObject({ code: 'denied-write' });
    expect(storage.getItem('last-light.wallet')).toBe(before);
    expect((await transport.read()).run).toBeNull();
  });
});
