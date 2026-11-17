import { RadiantRunError, applyRadiantTurn, radiantRequestFingerprint, radiantSettleActionLimit, validateRadiantCheckpoint,
  validateRadiantRunRequest, validateRadiantRunResponse, type FrozenRadiantRun, type RadiantCheckpoint,
  type RadiantRunOperation, type RadiantRunRequest, type RadiantRunResponse, type RadiantTurnAction } from './battle-run';
import { radiantStudyOperation, readRadiantStudy, prepareRadiantStudy } from './battle-transport';
import { validateRadiantPreparationRequest, type RadiantPreparationOperation, type RadiantPreparationRequest } from './battle-preparation';
import type { RadiantCombatEvent, RadiantCombatState } from '../game/combat-engine';
import type { BattleEvent } from '../game/battle';

export interface RadiantSessionView {
  saved: RadiantCheckpoint;
  pending: RadiantRunRequest | null;
  preparationPending: RadiantPreparationRequest | null;
  busy: boolean;
  settingsOpen: boolean;
  entrancePending: boolean;
  resultsDismissed: boolean;
  events: RadiantCombatEvent[];
  rewards: BattleEvent[];
  presentation: { requestId: string; response: RadiantRunResponse } | null;
  preparationPresentation: { requestId: string; checkpoint: RadiantCheckpoint } | null;
  error: { code: string; message: string } | null;
  /** Live encounter: the device-resolved run while an encounter is underway, otherwise the saved run. */
  run: FrozenRadiantRun | null;
  /** Unsaved Prismatica gathered in this encounter attempt; saved only when the encounter settles. */
  haul: number;
  /** True once the device-run encounter has finished and still awaits its authority settle. */
  settleDue: boolean;
}
/** Combat-state-only resume log for a device-run encounter (never grants anything). */
export const RADIANT_ACTION_LOG_KEY = 'last-light.radiant-log';
export type RadiantLogStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
/** Browser storage for the resume log, or null when unavailable (private mode, blocked storage). */
export function radiantLogStorage(): RadiantLogStorage | null {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}
interface RadiantActionLog { runId: string; encounter: number; revision: number; actions: RadiantTurnAction[] }
/** One device-resolved input, shaped like a saved response so presentation stays shared. */
export interface RadiantLocalTurn { before: RadiantCombatState; response: RadiantRunResponse }
interface RadiantSessionTransport {
  read(): Promise<RadiantCheckpoint>;
  execute(request: RadiantRunRequest): Promise<RadiantRunResponse>;
  prepare?(request: RadiantPreparationRequest): Promise<RadiantCheckpoint>;
}
type SessionState = Omit<RadiantSessionView, 'run' | 'haul' | 'settleDue'>;
/**
 * Device-run encounter session (D-471). Inputs resolve instantly on the device with the same
 * pure turn step the authority uses; rewards change only when the authority replays the
 * encounter's ordered action log in one `settle` and acknowledges the atomic save.
 */
export class RadiantSession {
  private value: SessionState;
  private local: { run: FrozenRadiantRun; actions: RadiantTurnAction[] } | null = null;
  private disposed = false;
  constructor(checkpoint: RadiantCheckpoint, private readonly transport: RadiantSessionTransport = {
    read: readRadiantStudy, execute: radiantStudyOperation, prepare: prepareRadiantStudy,
  }, private readonly uuid: () => string = () => crypto.randomUUID(),
  private readonly logStorage: RadiantLogStorage | null = null) {
    this.value = { saved: validateRadiantCheckpoint(checkpoint), pending: null, preparationPending: null, busy: false,
      settingsOpen: false, entrancePending: !!checkpoint.run, resultsDismissed: false,
      events: structuredClone(checkpoint.run?.journal.events ?? []),
      rewards: structuredClone(checkpoint.run?.journal.rewards ?? []), presentation: null,
      preparationPresentation: null, error: null };
    this.seedLocal(true);
  }
  view(): RadiantSessionView {
    const saved = this.value.saved.run, live = this.local?.run ?? saved;
    return structuredClone({ ...this.value, run: live,
      haul: this.local && saved ? this.local.run.state.currencyEarned - saved.state.currencyEarned : 0,
      settleDue: !!this.local && ['victory', 'defeat'].includes(this.local.run.state.phase) });
  }
  /** Starts device play from the saved run; optionally resumes a matching combat-only log. */
  private seedLocal(resume: boolean): void {
    const saved = this.value.saved.run;
    this.local = saved && !saved.quit && saved.state.phase === 'player'
      ? { run: structuredClone(saved), actions: [] } : null;
    if (!this.local || !saved || !resume) { this.writeLog(); return; }
    let log: RadiantActionLog | null = null;
    try {
      const raw = this.logStorage?.getItem(RADIANT_ACTION_LOG_KEY);
      log = raw ? JSON.parse(raw) as RadiantActionLog : null;
    } catch { log = null; }
    if (!log || log.runId !== saved.id || log.encounter !== saved.encounter ||
      log.revision !== this.value.saved.revision || !Array.isArray(log.actions) ||
      log.actions.length > radiantSettleActionLimit) { this.writeLog(); return; }
    try {
      const run = structuredClone(saved);
      for (const action of log.actions) run.journal.events.push(...applyRadiantTurn(run, structuredClone(action)));
      this.local = { run, actions: structuredClone(log.actions) };
    } catch { this.writeLog(); }
  }
  private writeLog(): void {
    try {
      if (!this.logStorage) return;
      const saved = this.value.saved.run;
      if (!this.local?.actions.length || !saved) { this.logStorage.removeItem(RADIANT_ACTION_LOG_KEY); return; }
      this.logStorage.setItem(RADIANT_ACTION_LOG_KEY, JSON.stringify({ runId: saved.id, encounter: saved.encounter,
        revision: this.value.saved.revision, actions: this.local.actions } satisfies RadiantActionLog));
    } catch { /* The resume log is a convenience; play continues without it. */ }
  }
  /**
   * Resolves one input instantly on the device. No network and no reward: the Haul it adds is
   * saved only by the encounter's settle.
   */
  act(action: RadiantTurnAction): RadiantLocalTurn {
    this.active();
    if (this.value.error && ['stale-revision', 'stale-run', 'receipt-conflict'].includes(this.value.error.code))
      throw new RadiantRunError('stale-revision', 'Refresh the saved checkpoint before another choice.');
    if (this.value.settingsOpen || this.value.entrancePending)
      throw new RadiantRunError('invalid-input', 'Close Settings and finish the entrance before acting.');
    if (this.value.busy || this.value.pending || !this.local || this.local.run.state.phase !== 'player')
      throw new RadiantRunError('invalid-input', 'This encounter cannot accept a choice now.');
    if (this.local.actions.length >= radiantSettleActionLimit)
      throw new RadiantRunError('invalid-input', 'This encounter reached its action limit; quit or retry it.');
    const before = structuredClone(this.local.run.state), run = structuredClone(this.local.run);
    let events: RadiantCombatEvent[];
    try { events = applyRadiantTurn(run, structuredClone(action)); }
    catch (error) {
      if (error instanceof RadiantRunError) throw error;
      throw new RadiantRunError('invalid-input', error instanceof Error ? error.message : 'Invalid battle choice.');
    }
    run.journal.events.push(...structuredClone(events));
    this.local = { run, actions: [...this.local.actions, structuredClone(action)] };
    this.value.error = null;
    this.writeLog();
    return { before, response: { revision: this.value.saved.revision, account: structuredClone(this.value.saved.account),
      run: structuredClone(run), events: structuredClone(events), rewards: [] } };
  }
  /** Submits the finished encounter's ordered action log for authority replay and the atomic Haul save. */
  async settle(): Promise<RadiantRunResponse> {
    if (!this.local || !['victory', 'defeat'].includes(this.local.run.state.phase))
      throw new RadiantRunError('invalid-input', 'Only a finished encounter can be saved.');
    return this.perform({ kind: 'settle', actions: structuredClone(this.local.actions) });
  }
  private active(): void {
    if (this.disposed) throw new RadiantRunError('invalid-input', 'Radiant session has been disposed.');
  }
  setSettings(open: boolean): void { this.active(); this.value.settingsOpen = open; }
  finishEntrance(): void { this.active(); this.value.entrancePending = false; }
  dismissResults(dismissed: boolean): void { this.active(); this.value.resultsDismissed = dismissed; }
  finishPresentation(requestId: string): void {
    this.active();
    if (this.value.presentation?.requestId !== requestId)
      throw new RadiantRunError('invalid-input', 'Presentation receipt does not match.');
    this.value.presentation = null;
  }
  finishPreparation(requestId: string): void {
    this.active();
    if (this.value.preparationPresentation?.requestId !== requestId)
      throw new RadiantRunError('invalid-input', 'Preparation receipt does not match.');
    this.value.preparationPresentation = null;
  }
  private available(): void {
    this.active();
    if (this.value.busy || this.value.pending || this.value.preparationPending ||
      this.value.presentation || this.value.preparationPresentation)
      throw new RadiantRunError('invalid-input', 'Resolve the pending operation/presentation before another choice.');
  }
  async refresh(): Promise<RadiantCheckpoint> {
    this.available();
    this.value.busy = true; this.value.error = null;
    try {
      const saved = validateRadiantCheckpoint(await this.transport.read());
      if (!this.disposed) {
        const prior = this.value.saved.run;
        if (prior?.id !== saved.run?.id || prior?.encounter !== saved.run?.encounter) {
          this.value.resultsDismissed = false;
          this.value.entrancePending = !!saved.run;
        }
        this.value.events = structuredClone(saved.run?.journal.events ?? []);
        this.value.rewards = structuredClone(saved.run?.journal.rewards ?? []);
        const unchanged = this.value.saved.revision === saved.revision && prior?.id === saved.run?.id &&
          prior?.encounter === saved.run?.encounter;
        this.value.saved = saved;
        if (!unchanged) this.seedLocal(true);
      }
      return structuredClone(saved);
    } catch (error) { this.failure(error); throw error; }
    finally { this.value.busy = false; }
  }
  async perform(operation: RadiantRunOperation): Promise<RadiantRunResponse> {
    this.available();
    if (this.value.error && ['stale-revision', 'stale-run', 'receipt-conflict'].includes(this.value.error.code))
      throw new RadiantRunError('stale-revision', 'Refresh the saved checkpoint before another choice.');
    const run = this.value.saved.run;
    const request = validateRadiantRunRequest({ requestId: this.uuid(), expectedRevision: this.value.saved.revision,
      runId: operation.kind === 'start' ? null : run?.id ?? null,
      encounter: operation.kind === 'start' ? null : run?.encounter ?? null, operation });
    this.value.pending = request;
    return this.send();
  }
  async retryPending(): Promise<RadiantRunResponse> {
    this.active();
    if (this.value.busy || !this.value.pending)
      throw new RadiantRunError('invalid-input', 'No unresolved operation is available to retry.');
    return this.send();
  }
  async prepare(operation: RadiantPreparationOperation): Promise<RadiantCheckpoint> {
    this.available();
    if (!this.transport.prepare) throw new RadiantRunError('unavailable', 'Radiant preparation transport is unavailable.');
    if (this.value.error && ['stale-revision', 'stale-run', 'receipt-conflict'].includes(this.value.error.code))
      throw new RadiantRunError('stale-revision', 'Refresh the saved checkpoint before another choice.');
    this.value.preparationPending = validateRadiantPreparationRequest({ kind: 'prepare', requestId: this.uuid(),
      expectedRevision: this.value.saved.revision, operation });
    return this.sendPreparation();
  }
  async retryPreparation(): Promise<RadiantCheckpoint> {
    this.active();
    if (this.value.busy || !this.value.preparationPending)
      throw new RadiantRunError('invalid-input', 'No unresolved preparation is available to retry.');
    return this.sendPreparation();
  }
  private async sendPreparation(): Promise<RadiantCheckpoint> {
    const request = structuredClone(this.value.preparationPending!);
    this.value.busy = true; this.value.error = null;
    try {
      if (!this.transport.prepare) throw new RadiantRunError('unavailable', 'Radiant preparation transport is unavailable.');
      const saved = validateRadiantCheckpoint(await this.transport.prepare(structuredClone(request)));
      if (saved.revision !== request.expectedRevision + 1 ||
        await radiantRequestFingerprint(saved.run) !== await radiantRequestFingerprint(this.value.saved.run))
        throw new RadiantRunError('unavailable', 'Saved preparation does not match the pending operation.');
      if (!this.disposed) {
        this.value.saved = saved;
        this.value.preparationPending = null;
        this.value.preparationPresentation = { requestId: request.requestId, checkpoint: structuredClone(saved) };
      }
      return structuredClone(saved);
    } catch (error) {
      this.failure(error);
      if (error instanceof RadiantRunError && ['manual-squad', 'invalid-input', 'stale-revision',
        'stale-run', 'receipt-conflict', 'overflow'].includes(error.code)) this.value.preparationPending = null;
      throw error;
    } finally { this.value.busy = false; }
  }
  private failure(error: unknown): void {
    if (this.disposed) return;
    this.value.error = error instanceof RadiantRunError ? { code: error.code, message: error.message }
      : { code: 'unavailable', message: 'Operation was not acknowledged; retry the same request.' };
  }
  private async send(): Promise<RadiantRunResponse> {
    const request = structuredClone(this.value.pending!);
    this.value.busy = true; this.value.error = null;
    try {
      const response = validateRadiantRunResponse(await this.transport.execute(structuredClone(request)));
      if (response.revision !== request.expectedRevision + 1 ||
        request.operation.kind !== 'start' && response.run.id !== request.runId ||
        response.run.encounter !== (request.operation.kind === 'start' ? 1 :
          request.encounter! + (request.operation.kind === 'continue' ? 1 : 0)))
        throw new RadiantRunError('unavailable', 'Saved response does not match the pending operation.');
      let mismatch = false;
      if (request.operation.kind === 'settle' && this.local)
        mismatch = await radiantRequestFingerprint(response.run.state) !== await radiantRequestFingerprint(this.local.run.state);
      if (!this.disposed) {
        const changedEncounter = request.operation.kind === 'start' || request.operation.kind === 'continue';
        if (changedEncounter) { this.value.events = []; this.value.rewards = []; }
        this.value.saved = { revision: response.revision, account: structuredClone(response.account),
          run: request.operation.kind === 'exit' ? null : structuredClone(response.run) };
        this.value.events = structuredClone(response.run.journal.events);
        this.value.rewards = structuredClone(response.run.journal.rewards);
        this.value.pending = null;
        this.value.resultsDismissed = false;
        if (changedEncounter || request.operation.kind === 'retry') this.value.entrancePending = true;
        if (request.operation.kind === 'exit') this.value.entrancePending = false;
        this.value.presentation = { requestId: request.requestId, response: structuredClone(response) };
        // A settled, quit or exited encounter ends device play; start/continue/retry begin it again.
        this.seedLocal(false);
        if (mismatch) this.value.error = { code: 'settle-mismatch',
          message: 'The saved result differs from this device’s playback; the saved result is shown.' };
      }
      return structuredClone(response);
    } catch (error) {
      this.failure(error);
      if (error instanceof RadiantRunError && ['manual-squad', 'invalid-input', 'stale-revision',
        'stale-run', 'receipt-conflict', 'overflow'].includes(error.code)) {
        this.value.pending = null;
        if (request.operation.kind === 'settle' && error.code === 'invalid-input' && !this.disposed) {
          // The authority rejected the replay: nothing was saved, so play restarts from the saved start.
          this.seedLocal(false);
          this.value.error = { code: 'invalid-input',
            message: `${error.message} The encounter restarts from its saved start; nothing was saved.` };
        }
      }
      throw error;
    } finally { this.value.busy = false; }
  }
  dispose(): void { this.disposed = true; this.value.presentation = null; this.value.preparationPresentation = null; }
}
