import { ACCOUNT_KEY, saveAccount, type Account } from '../game/account';
import type { ProfileStorage } from '../game/profile';
import type { DurableGame } from '../../supabase/functions/game-operation/engine';
import type { Activity } from './server-game';
import { squadMemberLimit } from '../content/squad-rules';
import { radiantBearerKits, type RadiantBearerId, type RadiantLoadout } from '../content/radiant-combat';
import { authoredRadiantCalibration, pressureRadiantCalibration } from '../content/radiant-enemy-calibration';
import { adaptRadiantLoadouts } from '../game/radiant-loadout';
import { adaptRadiantPressureEncounter, assertRadiantPressureAccess,
  type RadiantPressureAnchor, type RadiantPressureEnemy } from '../game/radiant-pressure-encounters';
import { radiantPressureEnemyAction } from '../game/radiant-pressure';
import { applyRadiantCombatAction, createRadiantCombat, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState } from '../game/radiant-combat';

export type RadiantRunErrorCode = 'manual-squad' | 'invalid-input' | 'stale-revision' |
  'stale-run' | 'receipt-conflict' | 'denied-write' | 'overflow' | 'unavailable';
export class RadiantRunError extends Error {
  constructor(public readonly code: RadiantRunErrorCode, message: string) { super(message); }
}
export interface FrozenRadiantRun {
  version: 1;
  id: string;
  encounter: number;
  anchor: RadiantPressureAnchor;
  calibration: 'authored-control' | 'radiant-pressure-v2';
  encounterSeed: number;
  initialChargeSeed: number;
  initialTargetSeed: number;
  targetSeed: number;
  enemies: RadiantPressureEnemy[];
  initial: RadiantCombatState;
  state: RadiantCombatState;
  quit: boolean;
}
/** Optional server aggregate extension, not a new wallet or production battle schema.
 * The existing commit_game_operation RPC locks/commits this entire aggregate.
 * No live dispatch imports this module; a study-enabled authority must opt in. */
export type RadiantStudyGame = DurableGame & { radiantStudy?: FrozenRadiantRun };
export type RadiantPlayerAction = Extract<RadiantCombatAction, { type: 'normal' | 'defense' | 'flare' }>;
export type RadiantRunOperation =
  | { kind: 'start'; activity: Activity; calibration: FrozenRadiantRun['calibration'] }
  | { kind: 'action'; action: RadiantPlayerAction }
  | { kind: 'retry' | 'quit' | 'continue' };
export interface RadiantRunRequest {
  requestId: string;
  expectedRevision: number;
  runId: string | null;
  encounter: number | null;
  operation: RadiantRunOperation;
}
export interface RadiantRunResponse {
  revision: number;
  account: Account;
  run: FrozenRadiantRun;
  events: RadiantCombatEvent[];
}
export interface RadiantRunSnapshot { revision: number; state: RadiantStudyGame }
export interface RadiantRunCommit {
  requestId: string; fingerprint: string; expectedRevision: number;
  state: RadiantStudyGame; response: RadiantRunResponse;
}
export interface RadiantRunRepository {
  load(): Promise<RadiantRunSnapshot>;
  find(requestId: string, fingerprint: string): Promise<RadiantRunResponse | null>;
  /** Must atomically CAS the whole account/run aggregate and insert the immutable
   * request response. Duplicate lookup occurs under the same lock BEFORE CAS. */
  commit(input: RadiantRunCommit): Promise<RadiantRunResponse>;
}
export interface RadiantRunAuthority {
  capability: 'isolated-radiant-study';
  now: number;
  /** Server entropy only, never seeds supplied by a client. Must return the same
   * server-authorized entry for a request retry (e.g. server-secret derivation).
   * Called only on entry; authenticated authority owns this namespace. */
  entry(requestId: string): { runId: string; encounterSeed: number; chargeSeed: number; targetSeed: number };
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function invalid(message: string): never { throw new RadiantRunError('invalid-input', message); }
function seed(value: number): void {
  if (!Number.isSafeInteger(value) || value < 1 || value > 0xffffffff) invalid('Invalid authority seed.');
}
function nextSeed(value: number): number { return (Math.imul(value, 1664525) + 1013904223) >>> 0; }

export function radiantAccountLoadouts(account: Account): RadiantLoadout[] {
  const ids = account.squad;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > squadMemberLimit || new Set(ids).size !== ids.length)
    throw new RadiantRunError('manual-squad', 'Manually select one to six distinct acquired Element-Bearers.');
  const members = ids.map(id => {
    if (typeof id !== 'string' || !Object.hasOwn(radiantBearerKits, id) || !account.characters[id as RadiantBearerId])
      throw new RadiantRunError('manual-squad', 'Captured, missing or unreleased squad member requires manual replacement.');
    const progress = account.characters[id as RadiantBearerId]!;
    return { id, starter: id as RadiantBearerId, level: progress.level, form: progress.evolution,
      weaponRank: progress.weaponRank ?? 0, ascension: structuredClone(progress.ascension ?? {}),
      masterId: null } satisfies RadiantLoadout;
  });
  const result = adaptRadiantLoadouts(members, Object.keys(account.characters), account);
  if (!result.ok) throw new RadiantRunError('manual-squad', result.errors.map(error => error.reason).join(' '));
  return result.loadouts;
}
function initialize(anchor: RadiantPressureAnchor, calibration: FrozenRadiantRun['calibration'],
  loadouts: RadiantLoadout[], entropy: ReturnType<RadiantRunAuthority['entry']>, encounter = 1): FrozenRadiantRun {
  if (!uuid.test(entropy.runId)) invalid('Invalid authority run ID.');
  [entropy.encounterSeed, entropy.chargeSeed, entropy.targetSeed].forEach(seed);
  const enemies = adaptRadiantPressureEncounter(anchor, entropy.encounterSeed,
    calibration === 'authored-control' ? authoredRadiantCalibration : pressureRadiantCalibration);
  const initial = createRadiantCombat(loadouts, enemies, entropy.chargeSeed);
  return { version: 1, id: entropy.runId, encounter, anchor, calibration,
    encounterSeed: entropy.encounterSeed, initialChargeSeed: entropy.chargeSeed,
    initialTargetSeed: entropy.targetSeed, targetSeed: entropy.targetSeed, enemies,
    initial: structuredClone(initial), state: initial, quit: false };
}
function exactKeys(value: object, keys: string[]): void {
  if (Object.keys(value).some(key => !keys.includes(key))) invalid('Unexpected study request field.');
}
function validateRequest(request: RadiantRunRequest): void {
  if (!request || !uuid.test(request.requestId) || !Number.isSafeInteger(request.expectedRevision) ||
    request.expectedRevision < 0 || !request.operation) invalid('Invalid study request.');
  exactKeys(request, ['requestId', 'expectedRevision', 'runId', 'encounter', 'operation']);
  const op = request.operation;
  if (op.kind === 'start') {
    exactKeys(op, ['kind', 'activity', 'calibration']);
    if (!['authored-control', 'radiant-pressure-v2'].includes(op.calibration) ||
      request.runId !== null || request.encounter !== null) invalid('Invalid explicit study entry.');
    const activityKeys: Record<Activity['kind'], string[]> = {
      training: ['kind'], story: ['kind', 'stage'], dungeon: ['kind', 'element', 'stage'],
      infusion: ['kind', 'mode', 'stage'], war: ['kind', 'character', 'stage'],
      oblivion: ['kind', 'stage'], calamity: ['kind', 'activity', 'tier'],
    };
    if (!op.activity || !Object.hasOwn(activityKeys, op.activity.kind)) invalid('Invalid study activity.');
    exactKeys(op.activity, activityKeys[op.activity.kind]);
  } else {
    if (!uuid.test(request.runId ?? '') || !Number.isSafeInteger(request.encounter) ||
      request.encounter! < 1) invalid('Missing prior study encounter.');
    if (op.kind === 'action') {
      exactKeys(op, ['kind', 'action']);
      if (!op.action || !['normal', 'defense', 'flare'].includes(op.action.type)) invalid('Only player choices are accepted.');
      exactKeys(op.action, op.action.type === 'defense' ? ['type', 'bearerId'] : ['type', 'bearerId', 'targetId']);
      if (typeof op.action.bearerId !== 'string' ||
        'targetId' in op.action && op.action.targetId !== undefined && typeof op.action.targetId !== 'string')
        invalid('Invalid player choice.');
    } else {
      if (!['retry', 'quit', 'continue'].includes(op.kind)) invalid('Unknown study operation.');
      exactKeys(op, ['kind']);
    }
  }
}
function saveCurrency(game: RadiantStudyGame, amount: number, receipt: string): void {
  if (!Number.isSafeInteger(amount) || amount < 0 ||
    !Number.isSafeInteger(game.account.fractalis + amount))
    throw new RadiantRunError('overflow', 'Prismatica overflow; nothing was saved.');
  if (game.account.receipts.includes(receipt))
    throw new RadiantRunError('receipt-conflict', 'Action receipt exists without its saved response.');
  const previous = structuredClone(game.account);
  const candidate = { ...previous, fractalis: previous.fractalis + amount,
    receipts: [...previous.receipts, receipt] };
  const items = new Map([[ACCOUNT_KEY, JSON.stringify(previous)]]);
  const storage: ProfileStorage = {
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => { items.set(key, value); },
    removeItem: key => { items.delete(key); },
  };
  const saved = saveAccount(storage, candidate);
  // Reuse wallet validation/acquisition machinery without rewriting untouched raw
  // captures, holdings, loadouts or compatibility-normalized equipment.
  game.account = { ...previous, fractalis: saved.fractalis, receipts: saved.receipts,
    ...(saved.acquisitionMarkers ? { acquisitionMarkers: saved.acquisitionMarkers } : {}) };
}
/** Pure authoritative recomputation. No save is performed by this function. */
export function resolveRadiantRun(snapshot: RadiantRunSnapshot, request: RadiantRunRequest,
  authority: RadiantRunAuthority): { state: RadiantStudyGame; response: RadiantRunResponse } {
  validateRequest(request);
  if (authority.capability !== 'isolated-radiant-study') invalid('Study capability is required.');
  if (snapshot.revision !== request.expectedRevision)
    throw new RadiantRunError('stale-revision', 'Account changed; refresh before a new operation.');
  if (snapshot.revision === Number.MAX_SAFE_INTEGER)
    throw new RadiantRunError('overflow', 'Account revision overflow; nothing was saved.');
  const game = structuredClone(snapshot.state), op = request.operation;
  let events: RadiantCombatEvent[] = [];
  if (op.kind === 'start') {
    if (game.run || game.radiantStudy) throw new RadiantRunError('stale-run', 'Existing run must not be replaced.');
    const anchor: RadiantPressureAnchor = { id: 'authority-entry', family: op.activity.kind,
      position: 'early', activity: structuredClone(op.activity) };
    assertRadiantPressureAccess(anchor, game.account, authority.now);
    game.radiantStudy = initialize(anchor, op.calibration, radiantAccountLoadouts(game.account),
      authority.entry(request.requestId));
  } else {
    const run = game.radiantStudy;
    if (!run || run.version !== 1 || run.id !== request.runId || run.encounter !== request.encounter)
      throw new RadiantRunError('stale-run', 'Prior frozen study encounter does not match.');
    validateRadiantCombat(run.state);
    validateRadiantCombat(run.initial);
    if (run.enemies.length !== run.state.enemies.length ||
      run.enemies.some((enemy, i) => enemy.id !== run.state.enemies[i].id ||
        enemy.currencyBudget !== run.state.enemies[i].currency.budget ||
        enemy.currencyBudget !== run.initial.enemies[i]?.currency.budget))
      invalid('Frozen encounter budget does not match its authored snapshot.');
    if (op.kind === 'action') {
      if (run.quit || run.state.phase !== 'player') invalid('Run cannot accept a player action.');
      const apply = (action: RadiantCombatAction) => {
        const result = applyRadiantCombatAction(run.state, action);
        run.state = result.state; events.push(...result.events);
      };
      apply(op.action);
      if ((run.state as RadiantCombatState).phase === 'enemy') {
        for (const enemy of run.enemies) {
          if ((run.state as RadiantCombatState).phase !== 'enemy') break;
          if (run.state.enemies.find(unit => unit.id === enemy.id)!.hp <= 0) continue;
          apply(radiantPressureEnemyAction(run.state, enemy, () => {
            run.targetSeed = nextSeed(run.targetSeed); return run.targetSeed / 0x100000000;
          }));
        }
        if ((run.state as RadiantCombatState).phase === 'enemy') apply({ type: 'finish-enemy-phase' });
      }
    } else if (op.kind === 'quit') run.quit = true;
    else if (op.kind === 'retry') {
      if (!run.quit && !['defeat', 'victory'].includes(run.state.phase)) invalid('Retry requires a finished or quit encounter.');
      const ledgers = run.state.enemies.map(enemy => structuredClone(enemy.currency));
      run.state = structuredClone(run.initial);
      run.state.enemies.forEach((enemy, i) => { enemy.currency = ledgers[i]; });
      run.state.currencyEarned = ledgers.reduce((sum, ledger) => sum + ledger.paid, 0);
      run.targetSeed = run.initialTargetSeed; run.quit = false;
    } else {
      if (run.quit || run.state.phase !== 'victory') invalid('Continue requires victory.');
      const activity = run.anchor.activity;
      // Continue authorizes only the next existing accessible stage. No study
      // progression/kill loot grants are fabricated, and final stages are denied.
      if (!('stage' in activity)) invalid('Study Continue is available only for staged activities.');
      const anchor = structuredClone(run.anchor);
      if ('stage' in anchor.activity) anchor.activity.stage++;
      assertRadiantPressureAccess(anchor, game.account, authority.now);
      game.radiantStudy = initialize(anchor, run.calibration, run.initial.bearers.map(unit => unit.loadout),
        { runId: run.id, encounterSeed: nextSeed(run.encounterSeed) || 1,
          chargeSeed: run.state.chargeSeed || 1, targetSeed: run.targetSeed || 1 }, run.encounter + 1);
    }
  }
  const run = game.radiantStudy!;
  validateRadiantCombat(run.state);
  const amount = events.reduce((sum, event) => sum + (event.type === 'currency' ? event.amount : 0), 0);
  saveCurrency(game, amount, `radiant-study:v1:${run.id}:${run.encounter}:${request.requestId}`);
  return { state: game, response: { revision: snapshot.revision + 1,
    account: structuredClone(game.account), run: structuredClone(run), events } };
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
export async function executeRadiantRun(repository: RadiantRunRepository, request: RadiantRunRequest,
  authority: RadiantRunAuthority): Promise<RadiantRunResponse> {
  validateRequest(request);
  if (authority.capability !== 'isolated-radiant-study') invalid('Study capability is required.');
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(request)));
  const fingerprint = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  const cached = await repository.find(request.requestId, fingerprint);
  if (cached) return structuredClone(cached);
  const resolved = resolveRadiantRun(await repository.load(), request, authority);
  return repository.commit({ requestId: request.requestId, fingerprint,
    expectedRevision: request.expectedRevision, state: resolved.state, response: resolved.response });
}

export interface RadiantGameRpc {
  rpc(name: 'find_game_request' | 'commit_game_operation',
    args: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }>;
}
/** Uses the existing service-role RPC transaction, with the current server's
 * load callback (no initialization or load-time write). Not mounted in dispatch. */
export function radiantRpcRepository(rpc: RadiantGameRpc, userId: string,
  load: RadiantRunRepository['load']): RadiantRunRepository {
  const response = (data: unknown): RadiantRunResponse => {
    if (!data || typeof data !== 'object') throw new RadiantRunError('unavailable', 'Missing commit response.');
    if ('conflict' in data) throw new RadiantRunError('stale-revision', 'Concurrent account update; nothing committed.');
    const value = data as RadiantRunResponse;
    if (!Number.isSafeInteger(value.revision) || !value.account || !value.run ||
      !Array.isArray(value.events)) throw new RadiantRunError('unavailable', 'Invalid stored study response.');
    validateRadiantCombat(value.run.state);
    return structuredClone(value);
  };
  return { load,
    async find(requestId, fingerprint) {
      const result = await rpc.rpc('find_game_request',
        { p_user: userId, p_request: requestId, p_fingerprint: fingerprint });
      if (result.error) throw new RadiantRunError('receipt-conflict', 'Receipt lookup denied.');
      return result.data === null ? null : response(result.data);
    },
    async commit(input) {
      const result = await rpc.rpc('commit_game_operation', {
        p_user: userId, p_request: input.requestId, p_fingerprint: input.fingerprint,
        p_revision: input.expectedRevision, p_state: input.state, p_response: input.response,
      });
      if (result.error) throw new RadiantRunError('denied-write', 'Atomic study commit denied; retry the same request.');
      return response(result.data);
    },
  };
}
