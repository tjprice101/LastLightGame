import { describe, expect, it } from 'vitest';
import { emptyAccount, loadAccount, saveAccount, type Account } from '../game/account';
import { releasedRadiantIds } from '../content/combat-kits';
import { LOCAL_RADIANT_KEY, LocalRadiantTransport } from './battle-local';
import { retiredRadiantRunNotice, validateRadiantRunSnapshot,
  type RadiantRunOperation, type RadiantRunRequest } from './battle-run';

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

let next = 0;
async function send(transport: LocalRadiantTransport, operation: RadiantRunOperation, requestId: string = crypto.randomUUID()) {
  const checkpoint = await transport.read();
  const request: RadiantRunRequest = { requestId, expectedRevision: checkpoint.revision,
    runId: operation.kind === 'start' ? null : checkpoint.run!.id,
    encounter: operation.kind === 'start' ? null : checkpoint.run!.encounter, operation };
  return transport.execute(request);
}

describe('local Radiant authority', () => {
  it('retires old rules without changing storage, revision, holdings or saved rewards on read', async () => {
    const storage = seeded();
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    const started = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const record = JSON.parse(storage.getItem(LOCAL_RADIANT_KEY)!);
    record.run.version = 3;
    storage.setItem(LOCAL_RADIANT_KEY, JSON.stringify(record));
    const before = new Map(storage.values);
    const checkpoint = await transport.read();
    expect(checkpoint).toEqual({ revision: started.revision, account: started.account,
      run: null, notice: retiredRadiantRunNotice });
    expect(storage.values).toEqual(before);
    const fresh = await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    expect(fresh.revision).toBe(started.revision + 1);
    expect(fresh.run.version).toBe(4);
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
    snapshot.state.radiantStudy.version = 4;
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

  it('commits actions and exits while keeping the saved account', async () => {
    const storage = seeded();
    const transport = new LocalRadiantTransport(storage, () => 'ember');
    await send(transport, { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' });
    const run = (await transport.read()).run!;
    const bearer = run.state.bearers.find(unit => unit.hp > 0)!;
    const enemy = run.state.enemies.find(unit => unit.hp > 0)!;
    const acted = await send(transport, { kind: 'action', action: { type: 'normal', bearerId: bearer.loadout.id, targetId: enemy.id } });
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
