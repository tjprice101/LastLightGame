import { RadiantRunError, radiantRequestFingerprint, validateRadiantCheckpoint, validateRadiantRunRequest, validateRadiantRunResponse,
  type RadiantCheckpoint, type RadiantRunOperation, type RadiantRunRequest, type RadiantRunResponse } from './battle-run';
import { radiantStudyOperation, readRadiantStudy, prepareRadiantStudy } from './battle-transport';
import { validateRadiantPreparationRequest, type RadiantPreparationOperation, type RadiantPreparationRequest } from './battle-preparation';
import type { RadiantCombatEvent } from '../game/combat-engine';
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
}
interface RadiantSessionTransport {
  read(): Promise<RadiantCheckpoint>;
  execute(request: RadiantRunRequest): Promise<RadiantRunResponse>;
  prepare?(request: RadiantPreparationRequest): Promise<RadiantCheckpoint>;
}
/** In-memory presentation state only; authority owns every combat/reward change. */
export class RadiantSession {
  private value: RadiantSessionView;
  private disposed = false;
  constructor(checkpoint: RadiantCheckpoint, private readonly transport: RadiantSessionTransport = {
    read: readRadiantStudy, execute: radiantStudyOperation, prepare: prepareRadiantStudy,
  }, private readonly uuid: () => string = () => crypto.randomUUID()) {
    this.value = { saved: validateRadiantCheckpoint(checkpoint), pending: null, preparationPending: null, busy: false,
      settingsOpen: false, entrancePending: !!checkpoint.run, resultsDismissed: false,
      events: structuredClone(checkpoint.run?.journal.events ?? []),
      rewards: structuredClone(checkpoint.run?.journal.rewards ?? []), presentation: null,
      preparationPresentation: null, error: null };
  }
  view(): RadiantSessionView { return structuredClone(this.value); }
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
        this.value.saved = saved;
      }
      return structuredClone(saved);
    } catch (error) { this.failure(error); throw error; }
    finally { this.value.busy = false; }
  }
  async perform(operation: RadiantRunOperation): Promise<RadiantRunResponse> {
    this.available();
    if (this.value.error && ['stale-revision', 'stale-run', 'receipt-conflict'].includes(this.value.error.code))
      throw new RadiantRunError('stale-revision', 'Refresh the saved checkpoint before another choice.');
    if (operation.kind === 'action' && (this.value.settingsOpen || this.value.entrancePending))
      throw new RadiantRunError('invalid-input', 'Close Settings and finish the entrance before acting.');
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
      }
      return structuredClone(response);
    } catch (error) {
      this.failure(error);
      if (error instanceof RadiantRunError && ['manual-squad', 'invalid-input', 'stale-revision',
        'stale-run', 'receipt-conflict', 'overflow'].includes(error.code)) this.value.pending = null;
      throw error;
    } finally { this.value.busy = false; }
  }
  dispose(): void { this.disposed = true; this.value.presentation = null; this.value.preparationPresentation = null; }
}
