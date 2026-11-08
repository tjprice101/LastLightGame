import { ACCOUNT_KEY, loadAccount, setSquad, saveSquadLoadout, renameSquadLoadout,
  equipSquadLoadout, deleteSquadLoadout, saveConduitConfiguration, renameConduitConfiguration,
  equipConduitConfiguration, equipConduit, unequipAllConduits, equipMasterConduit } from '../game/account';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';
import { radiantBearerKits, type RadiantBearerId } from '../content/radiant-combat';
import { squadMemberLimit } from '../content/squad-rules';
import { validateRequest } from '../../supabase/functions/game-operation/engine';
import type { GameOperation } from './server-game';
import { RadiantRunError, radiantAccountLoadouts, radiantRequestFingerprint, validateRadiantCheckpoint, validateRadiantRunSnapshot,
  type RadiantCheckpoint, type RadiantRunRepository, type RadiantRunSnapshot } from './radiant-run';

export type RadiantPreparationOperation = Extract<GameOperation, { kind:
  'setSquad' | 'saveSquadLoadout' | 'renameSquadLoadout' | 'equipSquadLoadout' | 'deleteSquadLoadout' |
  'saveConduitConfiguration' | 'renameConduitConfiguration' | 'equipConduitConfiguration' |
  'equipConduit' | 'unequipAllConduits' | 'equipMasterConduit' }>;
export interface RadiantPreparationRequest {
  kind: 'prepare';
  requestId: string;
  expectedRevision: number;
  operation: RadiantPreparationOperation;
}
const kinds = ['setSquad', 'saveSquadLoadout', 'renameSquadLoadout', 'equipSquadLoadout', 'deleteSquadLoadout',
  'saveConduitConfiguration', 'renameConduitConfiguration', 'equipConduitConfiguration',
  'equipConduit', 'unequipAllConduits', 'equipMasterConduit'];
export function validateRadiantPreparationRequest(value: unknown): RadiantPreparationRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !('kind' in value) || value.kind !== 'prepare' ||
    Object.keys(value).some(key => !['kind', 'requestId', 'expectedRevision', 'operation'].includes(key)) ||
    !('operation' in value) || !value.operation || typeof value.operation !== 'object' ||
    !('kind' in value.operation) || !kinds.includes(String(value.operation.kind)))
    throw new RadiantRunError('invalid-input', 'Invalid Radiant preparation request.');
  try {
    const request = validateRequest({ requestId: 'requestId' in value ? value.requestId : undefined,
      expectedRevision: 'expectedRevision' in value ? value.expectedRevision : undefined, operation: value.operation });
    return { kind: 'prepare', requestId: request.requestId, expectedRevision: request.expectedRevision,
      operation: request.operation as RadiantPreparationOperation };
  } catch (error) {
    throw new RadiantRunError('invalid-input', error instanceof Error ? error.message : 'Invalid preparation choice.');
  }
}
export function resolveRadiantPreparation(value: RadiantRunSnapshot, input: RadiantPreparationRequest) {
  const snapshot = validateRadiantRunSnapshot(value), request = validateRadiantPreparationRequest(input);
  if (snapshot.revision !== request.expectedRevision)
    throw new RadiantRunError('stale-revision', 'Concurrent account update; refresh before preparing your squad.');
  if (!Number.isSafeInteger(snapshot.revision + 1))
    throw new RadiantRunError('overflow', 'Account revision capacity reached.');
  const state = snapshot.state, raw = structuredClone(state.account);
  if (!state.starterId || !raw.characters[state.starterId])
    throw new RadiantRunError('manual-squad', 'Choose an acquired starter before preparing your squad.');
  const acquired = (id: string): RadiantBearerId => {
    if (!Object.hasOwn(radiantBearerKits, id) || !raw.characters[id as RadiantBearerId])
      throw new RadiantRunError('manual-squad', 'Manually choose an acquired, released Element-Bearer; captures remain holdings and fodder.');
    return id as RadiantBearerId;
  };
  const op = request.operation;
  const capturedCleanup = op.kind === 'unequipAllConduits' &&
    raw.capturedCharacters?.some(copy => copy.instanceId === op.character);
  if ('character' in op && !capturedCleanup) acquired(op.character);
  if (op.kind === 'setSquad') {
    if (!op.ids.length || op.ids.length > squadMemberLimit || new Set(op.ids).size !== op.ids.length)
      throw new RadiantRunError('manual-squad', 'Choose one to six distinct acquired Element-Bearers.');
    op.ids.forEach(acquired);
  }
  if (op.kind === 'equipSquadLoadout') {
    const entry = raw.squadLoadouts?.find(entry => entry.id === op.id);
    if (!entry) throw new RadiantRunError('invalid-input', 'Choose a saved squad loadout.');
    entry.members.forEach(member => acquired(member.character));
  }
  const data = new Map([[ACCOUNT_KEY, JSON.stringify(raw)],
    [SAVE_KEY, JSON.stringify({ version: 1, starterId: state.starterId })]]);
  const storage: ProfileStorage = { getItem: key => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value); }, removeItem: key => { data.delete(key); } };
  const before = loadAccount(storage);
  try {
    if (op.kind === 'saveSquadLoadout') radiantAccountLoadouts(before);
    switch (op.kind) {
      case 'setSquad': setSquad(storage, op.ids); break;
      case 'saveSquadLoadout': saveSquadLoadout(storage, op.id, op.name); break;
      case 'renameSquadLoadout': renameSquadLoadout(storage, op.id, op.name); break;
      case 'equipSquadLoadout': equipSquadLoadout(storage, op.id); break;
      case 'deleteSquadLoadout': deleteSquadLoadout(storage, op.id); break;
      case 'saveConduitConfiguration': saveConduitConfiguration(storage, op.character, op.index, op.name); break;
      case 'renameConduitConfiguration': renameConduitConfiguration(storage, op.character, op.index, op.name); break;
      case 'equipConduitConfiguration': equipConduitConfiguration(storage, op.character, op.index); break;
      case 'equipConduit': equipConduit(storage, op.character, op.slot, op.conduit); break;
      case 'unequipAllConduits': unequipAllConduits(storage, op.character); break;
      case 'equipMasterConduit': equipMasterConduit(storage, acquired(op.character), op.conduit); break;
    }
    const saved = loadAccount(storage);
    if (op.kind === 'equipSquadLoadout') radiantAccountLoadouts(saved);
    if ('character' in op && !capturedCleanup) radiantAccountLoadouts({ ...saved, squad: [op.character] });
    // Loading compatibility-normalized gear must not rewrite unrelated holdings.
    if (JSON.stringify(before.squad) !== JSON.stringify(saved.squad)) raw.squad = structuredClone(saved.squad);
    if (JSON.stringify(before.squadLoadouts) !== JSON.stringify(saved.squadLoadouts)) {
      raw.squadLoadouts = saved.squadLoadouts?.map(entry => {
        const prior = before.squadLoadouts?.find(prior => prior.id === entry.id);
        const original = raw.squadLoadouts?.find(original => original.id === entry.id);
        return structuredClone(original && JSON.stringify(prior) === JSON.stringify(entry) ? original : entry);
      });
    }
    for (const key of ['conduitConfigurations', 'conduitEquipment', 'masterEquipment'] as const) {
      const prior = new Map(Object.entries(before[key] ?? {}));
      const changed = Object.fromEntries(Object.entries(saved[key] ?? {}).filter(([id, entry]) =>
        JSON.stringify(entry) !== JSON.stringify(prior.get(id))));
      if (Object.keys(changed).length) Object.assign(raw, { [key]: { ...raw[key], ...structuredClone(changed) } });
    }
    state.account = raw;
    const response = validateRadiantCheckpoint({ revision: snapshot.revision + 1, account: raw,
      run: state.radiantStudy ?? null });
    return { state, response };
  } catch (error) {
    if (error instanceof RadiantRunError) throw error;
    throw new RadiantRunError('invalid-input', error instanceof Error ? error.message : 'Invalid preparation choice.');
  }
}
export async function executeRadiantPreparation(repository: RadiantRunRepository<RadiantCheckpoint>,
  input: RadiantPreparationRequest): Promise<RadiantCheckpoint> {
  const request = validateRadiantPreparationRequest(input);
  const fingerprint = await radiantRequestFingerprint(['radiant-preparation:v1', request]);
  const cached = await repository.find(request.requestId, fingerprint);
  if (cached) return validateRadiantCheckpoint(cached);
  const resolved = resolveRadiantPreparation(await repository.load(), request);
  return repository.commit({ requestId: request.requestId, fingerprint, expectedRevision: request.expectedRevision,
    state: resolved.state, response: resolved.response });
}
