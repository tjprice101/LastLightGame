import { describe, expect, it } from 'vitest';
import { emptyAccount, loadAccount, saveAccount, type Account } from '../game/account';
import { releasedRadiantIds } from '../content/radiant-combat';
import { LOCAL_RADIANT_KEY, LocalRadiantTransport } from './radiant-local';
import type { RadiantRunOperation, RadiantRunRequest } from './radiant-run';

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
