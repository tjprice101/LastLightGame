import { ACCOUNT_KEY, loadAccount, saveAccount } from '../game/account';
import type { ProfileStorage } from '../game/profile';
import type { StarterId } from '../content/starters';
import { RadiantRunError, resolveRadiantRun, validateFrozenRadiantRun, validateRadiantRunRequest,
  type FrozenRadiantRun, type RadiantCheckpoint, type RadiantRunAuthority, type RadiantRunRequest,
  type RadiantRunResponse, type RadiantStudyGame } from './radiant-run';

export const LOCAL_RADIANT_KEY = 'last-light.radiant-run';
interface LocalRadiantRecord { revision: number; run: FrozenRadiantRun | null }

function seed(): number {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] || 1;
}

/** Local-profile Radiant authority. Runs the same pure resolver the online
 * authority uses; the account and frozen run commit together in one write. */
export class LocalRadiantTransport {
  private readonly receipts = new Map<string, RadiantRunResponse>();
  private readonly entries = new Map<string, ReturnType<RadiantRunAuthority['entry']>>();
  constructor(private readonly storage: ProfileStorage, private readonly starterId: () => StarterId | null,
    private readonly now: () => number = Date.now) {}

  private record(): LocalRadiantRecord {
    const raw = this.storage.getItem(LOCAL_RADIANT_KEY);
    if (!raw) return { revision: 0, run: null };
    try {
      const value = JSON.parse(raw) as LocalRadiantRecord;
      if (!Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error();
      return { revision: value.revision, run: value.run === null ? null : validateFrozenRadiantRun(value.run) };
    } catch {
      // An unreadable frozen encounter cannot be resumed; saved rewards live in the account.
      return { revision: 0, run: null };
    }
  }

  async read(): Promise<RadiantCheckpoint> {
    const saved = this.record();
    return { revision: saved.revision, account: loadAccount(this.storage), run: saved.run };
  }

  async execute(request: RadiantRunRequest): Promise<RadiantRunResponse> {
    validateRadiantRunRequest(request);
    const prior = this.receipts.get(request.requestId);
    if (prior) return structuredClone(prior);
    const saved = this.record();
    const state = { account: loadAccount(this.storage), starterId: this.starterId(), run: null,
      profile: {} as RadiantStudyGame['profile'], ...(saved.run ? { radiantStudy: saved.run } : {}) } as RadiantStudyGame;
    const authority: RadiantRunAuthority = { capability: 'isolated-radiant-study', now: this.now(),
      entry: requestId => {
        let entry = this.entries.get(requestId);
        if (!entry) {
          entry = { runId: crypto.randomUUID(), encounterSeed: seed(), chargeSeed: seed(), targetSeed: seed() };
          this.entries.set(requestId, entry);
        }
        return entry;
      } };
    const resolved = resolveRadiantRun({ revision: saved.revision, state }, request, authority);
    const previousAccount = this.storage.getItem(ACCOUNT_KEY);
    try {
      saveAccount(this.storage, resolved.state.account);
      this.storage.setItem(LOCAL_RADIANT_KEY, JSON.stringify({ revision: resolved.response.revision,
        run: resolved.state.radiantStudy ?? null } satisfies LocalRadiantRecord));
    } catch (error) {
      if (previousAccount === null) this.storage.removeItem(ACCOUNT_KEY);
      else this.storage.setItem(ACCOUNT_KEY, previousAccount);
      throw new RadiantRunError('denied-write', `Local save failed; nothing was saved. ${error instanceof Error ? error.message : ''}`.trim());
    }
    this.receipts.set(request.requestId, structuredClone(resolved.response));
    return structuredClone(resolved.response);
  }
}
