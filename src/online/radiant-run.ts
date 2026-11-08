import { ACCOUNT_KEY, saveAccount, validateAccount, type Account } from '../game/account';
import { dungeonStageCount, storyStageLayout, warStageCount, infusionStageCount } from '../content/activities';
import { isPlayableDungeon } from '../content/dungeons';
import { isInfusionMode } from '../content/infusions';
import { isWarCharacter } from '../content/war-characters';
import { isCalamityActivityId, isCalamityTier } from '../content/calamity';
import { isOblivionStage } from '../content/gates-of-oblivion';
import type { ProfileStorage } from '../game/profile';
import type { BattleEvent } from '../game/battle';
import { initialRadiantRewards, resolveRadiantRewards, validateRadiantRewards, validateRadiantRewardEvents,
  type RadiantRewardLedger } from './radiant-rewards';
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
export function isRadiantRunErrorCode(value: unknown): value is RadiantRunErrorCode {
  return typeof value === 'string' && ['manual-squad', 'invalid-input', 'stale-revision',
    'stale-run', 'receipt-conflict', 'denied-write', 'overflow', 'unavailable'].includes(value);
}
export class RadiantRunError extends Error {
  constructor(public readonly code: RadiantRunErrorCode, message: string) { super(message); }
}
export interface FrozenRadiantRun {
  version: 3;
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
  rewards: RadiantRewardLedger;
  journal: { events: RadiantCombatEvent[]; rewards: BattleEvent[] };
}
/** Optional server aggregate extension, not a new wallet or production battle schema.
 * The existing commit_game_operation RPC locks/commits this entire aggregate.
 * Only the explicitly gated dedicated transport may resolve this extension. */
export type RadiantStudyGame = DurableGame & { radiantStudy?: FrozenRadiantRun };
export type RadiantPlayerAction = Extract<RadiantCombatAction, { type: 'normal' | 'defense' | 'flare' }>;
export type RadiantRunOperation =
  | { kind: 'start'; activity: Activity; calibration: FrozenRadiantRun['calibration'] }
  | { kind: 'action'; action: RadiantPlayerAction }
  | { kind: 'retry' | 'quit' | 'continue' | 'exit' };
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
  rewards: BattleEvent[];
}
export interface RadiantRunSnapshot { revision: number; state: RadiantStudyGame }
export interface RadiantCheckpoint {
  revision: number;
  account: Account;
  run: FrozenRadiantRun | null;
}
export function validateRadiantCheckpoint(value: unknown): RadiantCheckpoint {
  try {
    if (!record(value) || typeof value.revision !== 'number' ||
      !Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error();
    validateAccount(value.account);
    if (value.run !== null) validateFrozenRadiantRun(value.run);
    return structuredClone(value) as unknown as RadiantCheckpoint;
  } catch {
    throw new RadiantRunError('unavailable', 'Invalid saved Radiant checkpoint.');
  }
}
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
   * Also namespaces capture identities on kill operations; authenticated
   * authority owns this namespace, including retries of denied writes. */
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
  return { version: 3, id: entropy.runId, encounter, anchor, calibration,
    encounterSeed: entropy.encounterSeed, initialChargeSeed: entropy.chargeSeed,
    initialTargetSeed: entropy.targetSeed, targetSeed: entropy.targetSeed, enemies,
    initial: structuredClone(initial), state: initial, quit: false,
    rewards: initialRadiantRewards(anchor, entropy.encounterSeed), journal: { events: [], rewards: [] } };
}
function exactKeys(value: object, keys: string[]): void {
  if (Object.keys(value).some(key => !keys.includes(key))) invalid('Unexpected study request field.');
}
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9:_-]{0,159}$/i.test(value);
}
export function validateRadiantActivity(value: unknown): Activity {
  if (!record(value) || typeof value.kind !== 'string') invalid('Invalid study activity.');
  const activityKeys: Record<Activity['kind'], string[]> = {
    training: ['kind'], story: ['kind', 'stage'], dungeon: ['kind', 'element', 'stage'],
    infusion: ['kind', 'mode', 'stage'], war: ['kind', 'character', 'stage'],
    oblivion: ['kind', 'stage'], calamity: ['kind', 'activity', 'tier'],
  };
  if (!Object.hasOwn(activityKeys, value.kind)) invalid('Invalid study activity.');
  exactKeys(value, activityKeys[value.kind as Activity['kind']]);
  if (value.kind === 'training') return { kind: 'training' };
  if (value.kind === 'calamity') {
    if (!isCalamityActivityId(value.activity) || !isCalamityTier(value.tier)) invalid('Invalid study Calamity.');
    return { kind: 'calamity', activity: value.activity, tier: value.tier };
  }
  if (typeof value.stage !== 'number' || !Number.isSafeInteger(value.stage) || value.stage < 1)
    invalid('Invalid study stage.');
  const stage = value.stage;
  switch (value.kind) {
    case 'story': if (stage <= storyStageLayout.stages) return { kind: 'story', stage }; break;
    case 'oblivion': if (isOblivionStage(stage)) return { kind: 'oblivion', stage }; break;
    case 'dungeon': if (isPlayableDungeon(value.element) && stage <= dungeonStageCount)
      return { kind: 'dungeon', element: value.element, stage }; break;
    case 'infusion': if (isInfusionMode(value.mode) && stage <= infusionStageCount(value.mode))
      return { kind: 'infusion', mode: value.mode, stage }; break;
    case 'war': if (isWarCharacter(value.character) && stage <= warStageCount)
      return { kind: 'war', character: value.character, stage }; break;
  }
  return invalid('Invalid study activity or stage.');
}
export function validateRadiantRunRequest(request: unknown): RadiantRunRequest {
  if (!record(request) || typeof request.requestId !== 'string' || !uuid.test(request.requestId) ||
    typeof request.expectedRevision !== 'number' || !Number.isSafeInteger(request.expectedRevision) ||
    request.expectedRevision < 0 || !record(request.operation)) invalid('Invalid study request.');
  exactKeys(request, ['requestId', 'expectedRevision', 'runId', 'encounter', 'operation']);
  const op = request.operation;
  if (op.kind === 'start') {
    exactKeys(op, ['kind', 'activity', 'calibration']);
    if (typeof op.calibration !== 'string' || !['authored-control', 'radiant-pressure-v2'].includes(op.calibration) ||
      request.runId !== null || request.encounter !== null) invalid('Invalid explicit study entry.');
    validateRadiantActivity(op.activity);
  } else {
    if (typeof request.runId !== 'string' || !uuid.test(request.runId) ||
      typeof request.encounter !== 'number' || !Number.isSafeInteger(request.encounter) ||
      request.encounter < 1) invalid('Missing prior study encounter.');
    if (op.kind === 'action') {
      exactKeys(op, ['kind', 'action']);
      if (!record(op.action) || typeof op.action.type !== 'string' ||
        !['normal', 'defense', 'flare'].includes(op.action.type)) invalid('Only player choices are accepted.');
      exactKeys(op.action, op.action.type === 'defense' ? ['type', 'bearerId'] : ['type', 'bearerId', 'targetId']);
      if (!validId(op.action.bearerId) || op.action.type === 'normal' && !validId(op.action.targetId) ||
        'targetId' in op.action && !validId(op.action.targetId))
        invalid('Invalid player choice.');
    } else {
      if (typeof op.kind !== 'string' || !['retry', 'quit', 'continue', 'exit'].includes(op.kind)) invalid('Unknown study operation.');
      exactKeys(op, ['kind']);
    }
  }
  return structuredClone(request) as unknown as RadiantRunRequest;
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
  validateRadiantRunRequest(request);
  if (authority.capability !== 'isolated-radiant-study') invalid('Study capability is required.');
  if (snapshot.revision !== request.expectedRevision)
    throw new RadiantRunError('stale-revision', 'Account changed; refresh before a new operation.');
  if (snapshot.revision === Number.MAX_SAFE_INTEGER)
    throw new RadiantRunError('overflow', 'Account revision overflow; nothing was saved.');
  const game = structuredClone(snapshot.state), op = request.operation;
  validateAccount(game.account);
  let events: RadiantCombatEvent[] = [];
  let discover = false;
  if (op.kind === 'start') {
    if (game.run || game.radiantStudy) throw new RadiantRunError('stale-run', 'Existing run must not be replaced.');
    const anchor: RadiantPressureAnchor = { id: 'authority-entry', family: op.activity.kind,
      position: 'early', activity: structuredClone(op.activity) };
    assertRadiantPressureAccess(anchor, game.account, authority.now);
    game.radiantStudy = initialize(anchor, op.calibration, radiantAccountLoadouts(game.account),
      authority.entry(request.requestId));
    discover = true;
  } else {
    const run = game.radiantStudy;
    if (!run || run.version !== 3 || run.id !== request.runId || run.encounter !== request.encounter)
      throw new RadiantRunError('stale-run', 'Prior frozen study encounter does not match.');
    validateFrozenRadiantRun(run);
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
    } else if (op.kind === 'quit' || op.kind === 'exit') run.quit = true;
    else if (op.kind === 'retry') {
      if (!run.quit && !['defeat', 'victory'].includes(run.state.phase)) invalid('Retry requires a finished or quit encounter.');
      assertRadiantPressureAccess(run.anchor, game.account, authority.now);
      const ledgers = run.state.enemies.map(enemy => structuredClone(enemy.currency));
      run.state = structuredClone(run.initial);
      run.state.enemies.forEach((enemy, i) => { enemy.currency = ledgers[i]; });
      run.state.currencyEarned = ledgers.reduce((sum, ledger) => sum + ledger.paid, 0);
      run.targetSeed = run.initialTargetSeed; run.quit = false;
    } else {
      if (run.quit || run.state.phase !== 'victory') invalid('Continue requires victory.');
      const activity = run.anchor.activity;
      if (activity.kind === 'calamity') invalid('Calamity ends after one boss.');
      const anchor = structuredClone(run.anchor);
      if ('stage' in anchor.activity) anchor.activity.stage++;
      else if (anchor.activity.kind === 'training') anchor.trainingWave = (anchor.trainingWave ?? 1) + 1;
      validateRadiantActivity(anchor.activity);
      assertRadiantPressureAccess(anchor, game.account, authority.now);
      game.radiantStudy = initialize(anchor, run.calibration, run.initial.bearers.map(unit => unit.loadout),
        { runId: run.id, encounterSeed: nextSeed(run.encounterSeed) || 1,
          chargeSeed: run.state.chargeSeed || 1, targetSeed: run.targetSeed || 1 }, run.encounter + 1);
      game.radiantStudy.rewards = initialRadiantRewards(anchor, game.radiantStudy.encounterSeed, run.rewards);
      discover = true;
    }
  }
  const run = game.radiantStudy!;
  validateRadiantCombat(run.state);
  const amount = events.reduce((sum, event) => sum + (event.type === 'currency' ? event.amount : 0), 0);
  saveCurrency(game, amount, `radiant-study:v1:${run.id}:${run.encounter}:${request.requestId}`);
  const settled = resolveRadiantRewards(game.account, run.anchor, run.encounterSeed, run.rewards,
    run.state, `radiant-study:v1:${run.id}:${run.encounter}:loot`, discover, enemyId => {
      const index = run.enemies.findIndex(enemy => enemy.id === enemyId);
      if (index < 0) invalid('Capture source is missing.');
      const base = authority.entry(request.requestId).runId;
      if (!uuid.test(base)) invalid('Invalid authority capture identity.');
      const suffix = (Number.parseInt(base.slice(-8), 16) ^ index) >>> 0;
      return base.slice(0, -8) + suffix.toString(16).padStart(8, '0');
    });
  game.account = settled.account; run.rewards = settled.ledger;
  run.journal.events.push(...structuredClone(events));
  run.journal.rewards.push(...structuredClone(settled.rewards));
  if (op.kind === 'exit') delete game.radiantStudy;
  return { state: game, response: { revision: snapshot.revision + 1,
    account: structuredClone(game.account), run: structuredClone(run), events, rewards: settled.rewards } };
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
export function validateFrozenRadiantRun(value: unknown): FrozenRadiantRun {
  try {
    if (!record(value) || value.version !== 3 || typeof value.id !== 'string' || !uuid.test(value.id) ||
      typeof value.encounter !== 'number' || !Number.isSafeInteger(value.encounter) || value.encounter < 1 ||
      typeof value.quit !== 'boolean' || !record(value.anchor) ||
      !['authored-control', 'radiant-pressure-v2'].includes(String(value.calibration)) ||
      !Array.isArray(value.enemies) || !record(value.initial) || !record(value.state))
      throw new Error();
    for (const key of ['encounterSeed', 'initialChargeSeed', 'initialTargetSeed'])
      seed(value[key] as number);
    if (!Number.isSafeInteger(value.targetSeed) || Number(value.targetSeed) < 0 ||
      Number(value.targetSeed) > 0xffffffff) throw new Error();
    validateRadiantActivity(value.anchor.activity);
    if (typeof value.anchor.id !== 'string' || typeof value.anchor.family !== 'string' ||
      !['early', 'mid', 'final', 'boss', 'species'].includes(String(value.anchor.position))) throw new Error();
    const run = value as unknown as FrozenRadiantRun;
    validateRadiantCombat(run.initial);
    validateRadiantCombat(run.state);
    validateRadiantRewards(run.rewards, run.state);
    if (!record(run.journal) || Object.keys(run.journal).some(key => !['events', 'rewards'].includes(key)) ||
      !Array.isArray(run.journal.events) || !run.journal.events.every(validEvent))
      throw new Error();
    if (run.journal.events.reduce((sum, event) => sum + (event.type === 'currency' ? event.amount : 0), 0)
      !== run.state.currencyEarned) throw new Error();
    // Historical batches may share a source when a delayed clear pays after a
    // prior kill. Validate entries individually, not as one new kill batch.
    if (!Array.isArray(run.journal.rewards)) throw new Error();
    for (const reward of run.journal.rewards) validateRadiantRewardEvents([reward], run.rewards);
    const expected = initialize(run.anchor, run.calibration, run.initial.bearers.map(unit => unit.loadout),
      { runId: run.id, encounterSeed: run.encounterSeed, chargeSeed: run.initialChargeSeed,
        targetSeed: run.initialTargetSeed }, run.encounter);
    if (canonical(expected.enemies) !== canonical(run.enemies) ||
      canonical(expected.initial) !== canonical(run.initial) ||
      run.state.bearers.length !== run.initial.bearers.length ||
      run.state.bearers.some((unit, i) => canonical(unit.loadout) !== canonical(run.initial.bearers[i].loadout)) ||
      run.state.enemies.length !== run.enemies.length ||
      run.state.enemies.some((unit, i) => unit.id !== run.enemies[i].id ||
        canonical(unit.stats) !== canonical(run.enemies[i].stats) ||
        unit.currency.budget !== run.enemies[i].currencyBudget)) throw new Error();
    return structuredClone(run);
  } catch {
    throw new RadiantRunError('unavailable', 'Invalid frozen study snapshot; nothing was saved.');
  }
}
export function validateRadiantRunSnapshot(value: unknown): RadiantRunSnapshot {
  try {
    if (!record(value) || typeof value.revision !== 'number' ||
      !Number.isSafeInteger(value.revision) || value.revision < 0 || !record(value.state) ||
      !record(value.state.profile) || !('run' in value.state) || !('starterId' in value.state))
      throw new Error();
    validateAccount(value.state.account);
    if (value.state.radiantStudy !== undefined) validateFrozenRadiantRun(value.state.radiantStudy);
    return structuredClone(value) as unknown as RadiantRunSnapshot;
  } catch {
    throw new RadiantRunError('unavailable', 'Invalid stored study account; nothing was saved.');
  }
}
const eventFields = {
  damage: { text: ['targetId', 'origin'], number: ['offered', 'absorbed', 'healthLoss'] },
  heal: { text: ['targetId'], number: ['snapshot', 'offered', 'effective'] },
  shield: { text: ['targetId'], number: ['amount', 'shieldId'] },
  currency: { text: ['enemyId'], number: ['amount', 'totalPaid'] },
  defeated: { text: ['targetId'], number: [] },
  flare: { text: ['bearerId', 'tier', 'name'], number: [] },
  charge: { text: ['bearerId'], number: ['personal', 'sharedUnits', 'bonusRolls', 'bonusOffered'] },
  round: { text: [], number: ['round'] },
  status: { text: ['targetId', 'status'], number: ['magnitude', 'remaining'] },
};
function validSource(value: unknown): boolean {
  return record(value) && (value.kind === 'enemy' ? validId(value.enemyId) :
    ['normal', 'flare', 'passive', 'master'].includes(String(value.kind)) ? validId(value.bearerId) :
    value.kind === 'gear' && validId(value.bearerId) && validId(value.conduitId));
}
function validEvent(value: unknown): boolean {
  if (!record(value) || typeof value.type !== 'string' || !Object.hasOwn(eventFields, value.type)) return false;
  const fields = eventFields[value.type as keyof typeof eventFields];
  if (!fields.text.every(key => typeof value[key] === 'string' && (value[key] as string).length > 0) ||
    !fields.number.every(key => typeof value[key] === 'number' && Number.isFinite(value[key]) &&
      Number(value[key]) >= 0 && Number(value[key]) <= Number.MAX_SAFE_INTEGER)) return false;
  if (['damage', 'heal', 'shield', 'status'].includes(value.type) && !validSource(value.source)) return false;
  if (value.type === 'damage' && (!['direct', 'periodic', 'generated'].includes(String(value.origin)) ||
    !Array.isArray(value.shields) || !value.shields.every(shield => record(shield) && validSource(shield.source) &&
      typeof shield.amount === 'number' && Number.isFinite(shield.amount) && shield.amount >= 0))) return false;
  if (value.type === 'flare' && !['glowing', 'lustrous', 'eternal'].includes(String(value.tier))) return false;
  if (value.type === 'status' && !['burn', 'seed', 'renewal', 'reduction', 'weaken', 'attack-buff',
    'exposure', 'weaken-removed'].includes(String(value.status))) return false;
  return value.gearSource === undefined || validSource(value.gearSource);
}
export function validateRadiantRunResponse(value: unknown): RadiantRunResponse {
  try {
    if (!record(value) || typeof value.revision !== 'number' || !Number.isSafeInteger(value.revision) ||
      value.revision < 1 || !Array.isArray(value.events) || !value.events.every(validEvent)) throw new Error();
    validateAccount(value.account);
    const run = validateFrozenRadiantRun(value.run);
    validateRadiantRewardEvents(value.rewards, run.rewards);
    if (value.events.length > 0 &&
      canonical(value.events) !== canonical(run.journal.events.slice(-value.events.length)))
      throw new Error();
    if (value.rewards.length > 0 &&
      canonical(value.rewards) !== canonical(run.journal.rewards.slice(-value.rewards.length)))
      throw new Error();
    return structuredClone(value) as unknown as RadiantRunResponse;
  } catch {
    throw new RadiantRunError('unavailable', 'Invalid stored study response.');
  }
}
export async function executeRadiantRun(repository: RadiantRunRepository, request: RadiantRunRequest,
  authority: RadiantRunAuthority): Promise<RadiantRunResponse> {
  validateRadiantRunRequest(request);
  if (authority.capability !== 'isolated-radiant-study') invalid('Study capability is required.');
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(request)));
  const fingerprint = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  const cached = await repository.find(request.requestId, fingerprint);
  if (cached) return structuredClone(cached);
  const snapshot = await repository.load();
  let resolved: ReturnType<typeof resolveRadiantRun>;
  try { resolved = resolveRadiantRun(snapshot, request, authority); }
  catch (error) {
    if (error instanceof RadiantRunError) throw error;
    throw new RadiantRunError('invalid-input', 'Invalid or locked study operation.');
  }
  return repository.commit({ requestId: request.requestId, fingerprint,
    expectedRevision: request.expectedRevision, state: resolved.state, response: resolved.response });
}

export interface RadiantGameRpc {
  rpc(name: 'find_game_request' | 'commit_game_operation',
    args: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }>;
}
function receiptConflict(error: unknown): boolean {
  return record(error) && (error.code === 'LL409' ||
    error.code === 'P0001' && error.message === 'Request ID reused with different input');
}
/** Uses the existing service-role RPC transaction, with the current server's
 * load callback and immutable response, with duplicate-before-CAS owned by SQL. */
export function radiantRpcRepository(rpc: RadiantGameRpc, userId: string,
  load: RadiantRunRepository['load']): RadiantRunRepository {
  const response = (data: unknown): RadiantRunResponse => {
    if (!record(data)) throw new RadiantRunError('unavailable', 'Missing commit response.');
    if ('conflict' in data) throw new RadiantRunError('stale-revision', 'Concurrent account update; nothing committed.');
    return validateRadiantRunResponse(data);
  };
  return { load,
    async find(requestId, fingerprint) {
      const result = await rpc.rpc('find_game_request',
        { p_user: userId, p_request: requestId, p_fingerprint: fingerprint });
      if (result.error) {
        const conflict = receiptConflict(result.error);
        throw new RadiantRunError(conflict ? 'receipt-conflict' : 'unavailable', 'Study receipt lookup unavailable or conflicting.');
      }
      return result.data === null ? null : response(result.data);
    },
    async commit(input) {
      const result = await rpc.rpc('commit_game_operation', {
        p_user: userId, p_request: input.requestId, p_fingerprint: input.fingerprint,
        p_revision: input.expectedRevision, p_state: input.state, p_response: input.response,
        p_social: null, p_activity: null,
      });
      if (result.error) throw new RadiantRunError(receiptConflict(result.error) ? 'receipt-conflict' : 'denied-write',
        'Atomic study commit denied; retry the same request.');
      return response(result.data);
    },
  };
}
