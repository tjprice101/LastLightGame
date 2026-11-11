import { describe, expect, it } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { releasedRadiantIds } from '../content/combat-kits';
import { starters } from '../content/starters';
import { getCreature } from '../content/creatures';
import { createCreatureCopy } from '../game/character-instances';
import { radiantAccountLoadouts, resolveRadiantRun, type RadiantRunSnapshot } from './battle-run';
import { resolveRadiantPreparation, validateRadiantPreparationRequest, type RadiantPreparationOperation } from './battle-preparation';

const id = '00000000-0000-4000-8000-000000000001';
function fixture(): RadiantRunSnapshot {
  const state = freshGame('preparation');
  state.starterId = 'ember'; state.account.squad = ['ember'];
  for (const member of releasedRadiantIds.slice(0, 6))
    state.account.characters[member] = { level: 0, evolution: 1, weaponRank: 0 };
  state.account.conduits = { 'vigil-core': 1 };
  state.account.masterConduits = { 'master-ember-1': 1 };
  state.account.capturedCharacters = [createCreatureCopy('infusion:heavens:0')];
  return { revision: 0, state };
}
function step(snapshot: RadiantRunSnapshot, operation: RadiantPreparationOperation): RadiantRunSnapshot {
  const resolved = resolveRadiantPreparation(snapshot, { kind: 'prepare', requestId: id,
    expectedRevision: snapshot.revision, operation });
  expect(resolved.response.revision).toBe(snapshot.revision + 1);
  expect(resolved.response.account).toEqual(resolved.state.account);
  return { state: resolved.state, revision: resolved.response.revision };
}
describe('gated manual bearer-only squad and saved equipment preparation', () => {
  it('manually replaces a captured squad with six acquired bearers without grants or holdings loss', () => {
    const before = fixture(), copy = before.state.account.capturedCharacters![0];
    before.state.account.squad = [copy.instanceId];
    const unchanged = structuredClone(before), ids = releasedRadiantIds.slice(0, 6);
    const after = step(before, { kind: 'setSquad', ids });
    expect(before).toEqual(unchanged);
    expect(after.state.account).toEqual({ ...before.state.account, squad: ids });
    expect(radiantAccountLoadouts(after.state.account)).toHaveLength(6);
    expect(step(after, { kind: 'setSquad', ids: [ids[5], ids[0]] }).state.account.squad).toEqual([ids[5], ids[0]]);
  });
  it.each([[], ['ember', 'ember'], ['tide', 'missing'], releasedRadiantIds.slice(0, 7)].map(ids => ({ ids })))(
    'rejects invalid replacement with no save: $ids', ({ ids }) => {
      const before = fixture(), original = structuredClone(before);
      expect(() => step(before, { kind: 'setSquad', ids })).toThrow();
      expect(before).toEqual(original);
    });
  it('does not fabricate missing starter ownership or accept hidden/captured equipment targets', () => {
    const snapshot = fixture(), copy = snapshot.state.account.capturedCharacters![0];
    const hidden = starters.find(entry => !releasedRadiantIds.some(id => id === entry.id))!;
    snapshot.state.account.characters[hidden.id] = { level: 0, evolution: 1, weaponRank: 0 };
    for (const character of [copy.instanceId, hidden.id]) {
      expect(() => step(snapshot, { kind: 'setSquad', ids: [character] })).toThrow();
      expect(() => step(snapshot, { kind: 'equipConduit', character, slot: 0, conduit: 'vigil-core' })).toThrow();
    }
    delete snapshot.state.account.characters.ember;
    snapshot.state.account.squad = ['tide'];
    expect(() => step(snapshot, { kind: 'setSquad', ids: ['tide'] })).toThrow('acquired starter');
    expect(snapshot.state.account.characters.ember).toBeUndefined();
  });
  it('saves/renames/restores six-member gear snapshots atomically with matching personal Masters', () => {
    let snapshot = step(fixture(), { kind: 'setSquad', ids: releasedRadiantIds.slice(0, 6) });
    snapshot = step(snapshot, { kind: 'equipConduit', character: 'ember', slot: 5, conduit: 'vigil-core' });
    snapshot = step(snapshot, { kind: 'equipMasterConduit', character: 'ember', conduit: 'master-ember-1' });
    snapshot = step(snapshot, { kind: 'saveConduitConfiguration', character: 'ember', index: 0, name: 'Burst' });
    snapshot = step(snapshot, { kind: 'saveSquadLoadout', id, name: 'Six members' });
    const saved = structuredClone(snapshot.state.account.squadLoadouts);
    snapshot = step(snapshot, { kind: 'renameSquadLoadout', id, name: 'Reordered' });
    snapshot = step(snapshot, { kind: 'renameConduitConfiguration', character: 'ember', index: 0, name: 'Prism' });
    snapshot = step(snapshot, { kind: 'unequipAllConduits', character: 'ember' });
    snapshot = step(snapshot, { kind: 'setSquad', ids: ['tide'] });
    snapshot = step(snapshot, { kind: 'equipSquadLoadout', id });
    expect(snapshot.state.account.squad).toEqual(releasedRadiantIds.slice(0, 6));
    expect(snapshot.state.account.squadLoadouts![0].members).toEqual(saved![0].members);
    expect(snapshot.state.account.masterEquipment!.ember).toBe('master-ember-1');
    snapshot = step(snapshot, { kind: 'unequipAllConduits', character: 'ember' });
    snapshot = step(snapshot, { kind: 'equipConduitConfiguration', character: 'ember', index: 0 });
    expect(snapshot.state.account.conduitEquipment!.ember![5]).toBe('vigil-core');
    expect(snapshot.state.account.masterEquipment!.ember).toBe('master-ember-1');
    expect(step(snapshot, { kind: 'deleteSquadLoadout', id }).state.account.squadLoadouts).toEqual([]);
  });
  it('legacy capture-containing libraries can be renamed/deleted but not applied as combat squads', () => {
    const snapshot = fixture(), copy = snapshot.state.account.capturedCharacters![0];
    snapshot.state.account.squadLoadouts = [{ id, name: 'Historical', members: [{ character: copy.instanceId,
      element: getCreature(copy.creatureId).element, name: 'Historical copy', conduits: Array<null>(8).fill(null), master: null }] }];
    expect(() => step(snapshot, { kind: 'equipSquadLoadout', id })).toThrow('holdings');
    const renamed = step(snapshot, { kind: 'renameSquadLoadout', id, name: 'Keep for reference' });
    expect(renamed.state.account.squadLoadouts![0].members).toEqual(snapshot.state.account.squadLoadouts[0].members);
    expect(step(renamed, { kind: 'deleteSquadLoadout', id }).state.account.capturedCharacters)
      .toEqual(snapshot.state.account.capturedCharacters);
  });
  it('rejects saving legacy captured or unreleased squads without mutating authority', () => {
    for (const kind of ['capture', 'unreleased'] as const) {
      const snapshot = fixture(), copy = snapshot.state.account.capturedCharacters![0];
      const hidden = starters.find(entry => !releasedRadiantIds.some(id => id === entry.id))!;
      snapshot.state.account.characters[hidden.id] = { level: 0, evolution: 1 };
      const member = kind === 'capture' ? copy.instanceId : hidden.id;
      const element = kind === 'capture' ? getCreature(copy.creatureId).element : hidden.elementId;
      snapshot.state.account.squad = [member];
      snapshot.state.account.squadLoadouts = [{ id, name: 'Historical', members: [{
        character: member, element, name: 'Legacy', conduits: Array<null>(8).fill(null), master: null }] }];
      const before = structuredClone(snapshot);
      expect(() => step(snapshot, { kind: 'saveSquadLoadout', id, name: 'Overwrite' })).toThrow();
      expect(() => step(snapshot, { kind: 'equipSquadLoadout', id })).toThrow();
      expect(snapshot).toEqual(before);
    }
  });
  it('menu preparation never restarts or changes frozen combat/journal/reward seeds', () => {
    const snapshot = fixture();
    const entered = resolveRadiantRun(snapshot, { requestId: id, expectedRevision: 0, runId: null, encounter: null,
      operation: { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' } },
    { capability: 'isolated-radiant-study', now: Date.UTC(2026, 10, 8),
      entry: () => ({ runId: id, encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }) });
    let saved = { revision: entered.response.revision, state: entered.state };
    const frozen = structuredClone(saved.state.radiantStudy);
    saved = step(saved, { kind: 'setSquad', ids: ['tide'] });
    saved = step(saved, { kind: 'equipConduit', character: 'ember', slot: 0, conduit: 'vigil-core' });
    expect(saved.state.radiantStudy).toEqual(frozen);
    expect(saved.state.account.squad).toEqual(['tide']);
    expect(saved.state.radiantStudy!.initial.bearers[0].loadout.gear?.filter(Boolean)).toEqual([]);
  });
  it('rejects unowned/duplicate/wrong-element Conduits and mismatched Masters without touching libraries', () => {
    const snapshot = fixture();
    snapshot.state.account.conduits!['aquatic-leviathan-pump'] = 1;
    snapshot.state.account.masterConduits!['master-tide-1'] = 1;
    const original = structuredClone(snapshot);
    for (const operation of [
      { kind: 'equipConduit', character: 'ember', slot: 0, conduit: 'siegebound-drive' },
      { kind: 'equipConduit', character: 'ember', slot: 0, conduit: 'aquatic-leviathan-pump' },
      { kind: 'equipMasterConduit', character: 'ember', conduit: 'master-tide-1' },
    ] satisfies RadiantPreparationOperation[])
      expect(() => step(snapshot, operation)).toThrow();
    expect(snapshot).toEqual(original);
    const equipped = step(snapshot, { kind: 'equipConduit', character: 'ember', slot: 0, conduit: 'vigil-core' });
    expect(() => step(equipped, { kind: 'equipConduit', character: 'ember', slot: 1, conduit: 'vigil-core' })).toThrow();
    expect(equipped.state.account.conduitEquipment!.ember![1]).toBeNull();
  });
  it('does not persist unrelated compatibility-normalized equipment during a targeted preparation save', () => {
    const snapshot = fixture();
    delete snapshot.state.account.capturedCharacters;
    Object.assign(snapshot.state.account, { version: 4 });
    snapshot.state.account.conduits!['tempered-strike-link'] = 1;
    snapshot.state.account.conduitEquipment = {
      tide: ['tempered-strike-link', ...Array<null>(7).fill(null)],
    };
    const raw = structuredClone(snapshot.state.account);
    const after = step(snapshot, { kind: 'equipConduit', character: 'ember', slot: 0, conduit: 'vigil-core' });
    expect(after.state.account).toEqual({ ...raw, conduitEquipment: {
      ...raw.conduitEquipment, ember: ['vigil-core', ...Array<null>(7).fill(null)],
    } });
    expect(after.state.account.conduitEquipment!.tide).toEqual(raw.conduitEquipment!.tide);
  });
  it('allows only explicit gear removal from an owned capture, retaining its holdings and saved libraries', () => {
    const snapshot = fixture(), copy = snapshot.state.account.capturedCharacters![0];
    snapshot.state.account.conduitEquipment = { [copy.instanceId]: ['vigil-core', ...Array<null>(7).fill(null)] };
    const raw = structuredClone(snapshot.state.account);
    const cleared = step(snapshot, { kind: 'unequipAllConduits', character: copy.instanceId });
    expect(cleared.state.account).toEqual({ ...raw,
      conduitEquipment: { [copy.instanceId]: Array<null>(8).fill(null) } });
    expect(() => step(cleared, { kind: 'equipConduit', character: copy.instanceId, slot: 0, conduit: 'vigil-core' }))
      .toThrow('holdings');
    expect(() => step(cleared, { kind: 'unequipAllConduits', character: `capture:${id}` })).toThrow();
  });
  it('rejects client-authored snapshots, unsupported operations and stale revisions', () => {
    const snapshot = fixture();
    const request = { kind: 'prepare', requestId: id, expectedRevision: 0, operation: { kind: 'setSquad', ids: ['ember'] } };
    for (const invalid of [{ ...request, seeds: [1] }, { ...request, operation: { kind: 'bootstrap', starterId: 'tide' } },
      { ...request, operation: { ...request.operation, loadouts: [] } }])
      expect(() => validateRadiantPreparationRequest(invalid)).toThrow();
    expect(() => resolveRadiantPreparation(snapshot, { ...validateRadiantPreparationRequest(request),
      expectedRevision: 1 })).toThrow('Concurrent');
  });
});
