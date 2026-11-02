import { describe, expect, it } from 'vitest';
import { freshGame, resolveOperation, validateRequest, type DurableGame } from '../../supabase/functions/game-operation/engine';
import { validateGameResponse, type GameOperation } from './server-game';

const id = '00000000-0000-4000-8000-000000000001';
const entropy = { seed: () => 7321, random: () => .9, uuid: () => crypto.randomUUID() };
const op = (game: DurableGame, operation: GameOperation) => {
  validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 0, operation });
  return resolveOperation(game, operation, entropy);
};
function started() { return op(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }).game; }

describe('authoritative saved loadout operations', () => {
  it('derives snapshots from authoritative equipment, roundtrips responses and restores in one revision', () => {
    let game = started();
    game.account.characters.tide = { level: 0, evolution: 1 };
    game.account.conduits = { 'vigil-core': 1 };
    game.account.masterConduits = { 'master-ember-1': 1 };
    game = op(game, { kind: 'equipConduit', character: 'ember', slot: 5, conduit: 'vigil-core' }).game;
    game = op(game, { kind: 'equipMasterConduit', character: 'ember', conduit: 'master-ember-1' }).game;
    game = op(game, { kind: 'saveConduitConfiguration', character: 'ember', index: 0, name: 'Burst' }).game;
    game = op(game, { kind: 'saveSquadLoadout', id, name: 'First squad' }).game;
    const snapshot = structuredClone(game.account.squadLoadouts);
    game = op(game, { kind: 'renameSquadLoadout', id, name: 'Renamed' }).game;
    game = op(game, { kind: 'renameConduitConfiguration', character: 'ember', index: 0, name: 'Named' }).game;
    game = op(game, { kind: 'unequipAllConduits', character: 'ember' }).game;
    game = op(game, { kind: 'setSquad', ids: ['tide'] }).game;
    const before = structuredClone(game);
    const result = op(game, { kind: 'equipSquadLoadout', id });
    expect(game).toEqual(before);
    expect(result.game.account.squad).toEqual(['ember']);
    expect(result.game.account.conduitEquipment?.ember?.[5]).toBe('vigil-core');
    expect(result.game.account.masterEquipment?.ember).toBe('master-ember-1');
    expect(result.game.account.squadLoadouts?.[0].members).toEqual(snapshot?.[0].members);
    expect(validateGameResponse(result.response).account).toEqual(result.game.account);
    game = op(result.game, { kind: 'unequipAllConduits', character: 'ember' }).game;
    expect(op(game, { kind: 'equipConduitConfiguration', character: 'ember', index: 0 }).game.account.masterEquipment?.ember).toBe('master-ember-1');
    expect(op(game, { kind: 'deleteSquadLoadout', id }).game.account.squadLoadouts).toEqual([]);
  });
  it('does not mutate frozen encounters when menu equipment/configuration/squads change', () => {
    let game = started();
    game.account.conduits = { 'vigil-core': 1 };
    game = op(game, { kind: 'saveSquadLoadout', id, name: 'No gear' }).game;
    game = op(game, { kind: 'enter', activity: { kind: 'story', stage: 1 } }).game;
    const run = structuredClone(game.run);
    game = op(game, { kind: 'equipConduit', character: 'ember', slot: 0, conduit: 'vigil-core' }).game;
    game = op(game, { kind: 'saveConduitConfiguration', character: 'ember', index: 1, name: 'Gear' }).game;
    game = op(game, { kind: 'equipSquadLoadout', id }).game;
    game = op(game, { kind: 'equipConduitConfiguration', character: 'ember', index: 1 }).game;
    expect(game.run).toEqual(run);
    expect(game.account.conduitEquipment?.ember?.[0]).toBe('vigil-core');
  });
  it.each([
    { kind: 'saveSquadLoadout', id, name: 'A', members: ['tide'] },
    { kind: 'saveSquadLoadout', id },
    { kind: 'saveSquadLoadout', id, name: 'x'.repeat(41) },
    { kind: 'equipSquadLoadout', id, name: 'unexpected' },
    { kind: 'saveConduitConfiguration', character: 'ember', index: 0, name: 'A', conduits: [] },
    { kind: 'equipConduitConfiguration', character: 'ember', index: -1 },
    { kind: 'equipConduitConfiguration', character: 'ember', index: 0.5 },
  ])('rejects malformed or client-authored snapshots: %j', operation => {
    expect(() => validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 0, operation })).toThrow();
  });
  it('rejects missing and invalid targets without mutating authority', () => {
    const game = started(), before = structuredClone(game);
    for (const operation of [
      { kind: 'saveSquadLoadout', id: 'invalid', name: 'Team' },
      { kind: 'equipSquadLoadout', id },
      { kind: 'saveConduitConfiguration', character: 'tide', index: 0, name: 'Not owned' },
      { kind: 'saveConduitConfiguration', character: 'ember', index: 3, name: 'Not a slot' },
    ] satisfies GameOperation[]) {
      expect(() => op(game, operation)).toThrow();
      expect(game).toEqual(before);
    }
  });
});
