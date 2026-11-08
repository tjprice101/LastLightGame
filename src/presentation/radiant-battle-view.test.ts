// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { resolveRadiantRun, type RadiantRunRequest, type RadiantRunResponse, type RadiantRunSnapshot } from '../online/radiant-run';
import { RadiantSession } from '../online/radiant-session';
import { releasedRadiantIds } from '../content/radiant-combat';
import { RadiantBattleView, type RadiantBattleEffects } from './radiant-battle-view';
import { applyMotion } from './settings';
import type { RadiantImpactFrame } from './radiant-impact';

let serial = 0;
const uuid = () => `00000000-0000-4000-8000-${(++serial).toString(16).padStart(12, '0')}`;
const disposed: RadiantBattleView[] = [];
function fixture(count = 6, form = 6, effects?: RadiantBattleEffects) {
  const state = freshGame('battle-surface'); state.starterId = 'ember';
  state.account.storyCompleted = 24;
  state.account.squad = releasedRadiantIds.slice(0, count);
  for (const id of state.account.squad) state.account.characters[id as keyof typeof state.account.characters] =
    { level: form === 1 ? 30 : 105, evolution: form, weaponRank: 0 };
  const authority = { capability: 'isolated-radiant-study' as const, now: Date.UTC(2026, 10, 8),
    entry: () => ({ runId: uuid(), encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }) };
  const entered = resolveRadiantRun({ revision: 0, state }, { requestId: uuid(), expectedRevision: 0,
    runId: null, encounter: null, operation: { kind: 'start', activity: { kind: 'story', stage: 25 },
      calibration: 'authored-control' } }, authority);
  let snapshot: RadiantRunSnapshot = { revision: 1, state: entered.state };
  const receipts = new Map<string, RadiantRunResponse>();
  const transport = { read: vi.fn(async () => ({ revision: snapshot.revision, account: snapshot.state.account,
    run: snapshot.state.radiantStudy ?? null })), execute: vi.fn(async (request: RadiantRunRequest) => {
    const cached = receipts.get(request.requestId);
    if (cached) return structuredClone(cached);
    const result = resolveRadiantRun(snapshot, request, authority);
    snapshot = { revision: result.response.revision, state: result.state };
    receipts.set(request.requestId, structuredClone(result.response)); return result.response;
  }) };
  const session = new RadiantSession({ revision: 1, account: snapshot.state.account,
    run: snapshot.state.radiantStudy! }, transport, uuid);
  const host = document.createElement('div'); document.body.append(host);
  const settings = vi.fn();
  const view = new RadiantBattleView(host, session, settings, effects); disposed.push(view);
  return { view, session, host, transport, settings };
}
function controls(host: HTMLElement, selector: string) { return host.querySelector<HTMLButtonElement>(selector)!; }
afterEach(() => {
  for (const view of disposed.splice(0)) view.dispose();
  document.body.replaceChildren(); document.documentElement.dataset.motion = 'system';
  document.documentElement.dataset.battleSpeed = '1';
});
describe('saved six-member Radiant battle surface', () => {
  it('renders six stable per-form face controls, four stats, two personal layers and exact shared charge', async () => {
    const { view, host, session } = fixture(); applyMotion('reduced'); await view.finishEntrance();
    expect(host.querySelectorAll('[data-radiant-actor]')).toHaveLength(6);
    expect(host.querySelectorAll('.compact-portrait img')).toHaveLength(6);
    expect(host.querySelectorAll('[data-radiant-charge]')).toHaveLength(12);
    expect(host.querySelectorAll('dl dt')).toHaveLength(24);
    expect(host.textContent).not.toMatch(/Critical|Shatter|Elemental Damage/);
    expect(host.querySelector('[data-radiant-shared-text]')!.textContent).toBe('0 / 100');
    expect(host.querySelector<HTMLMeterElement>('[data-radiant-shared]')!.max).toBe(100);
    expect(host.getAttribute('aria-busy')).toBe('false');
    const image = host.querySelector('.compact-portrait img');
    await view.act('normal');
    expect(host.querySelector('.compact-portrait img')).toBe(image);
    expect(session.view().presentation).toBeNull();
    expect(host.querySelector('[data-radiant-charge-text="ember"]')!.textContent).toMatch(/2[05] \/ 60 charge/);
  });
  it('form1 has one layer and no shared meter; unavailable faces use honest pending art', async () => {
    const { view, host } = fixture(6, 1); applyMotion('reduced'); await view.finishEntrance();
    expect(host.querySelectorAll('[data-radiant-charge]')).toHaveLength(6);
    expect(host.querySelector<HTMLElement>('.radiant-shared')!.hidden).toBe(true);
    expect(host.querySelector<HTMLImageElement>('[data-character="rosetta"] img')!.alt).toContain('pending');
    expect(host.querySelector<HTMLImageElement>('[data-character="ember"] img')!.alt).not.toContain('pending');
  });
  it('keeps old HP while save and windup are pending, then shows the saved impact before visuals finish', async () => {
    let windup!: () => void, impact!: () => void;
    const frames: RadiantImpactFrame[] = [];
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { windup = resolve; })),
      impact: vi.fn((frame: RadiantImpactFrame) => { frames.push(frame);
        return frames.length === 1 ? new Promise<void>(resolve => { impact = resolve; }) : Promise.resolve(); }),
      cancel: vi.fn() };
    const { view, host, session, transport } = fixture(6, 6, effects);
    await view.finishEntrance();
    const execute = transport.execute.getMockImplementation()!;
    let save!: () => void;
    transport.execute.mockImplementationOnce(async request => {
      await new Promise<void>(resolve => { save = resolve; }); return execute(request);
    });
    const enemyHP = host.querySelector('.radiant-enemy [data-hp]')!.textContent;
    const pending = view.act('normal');
    expect(host.querySelector('.radiant-enemy [data-hp]')!.textContent).toBe(enemyHP);
    expect(effects.windup).not.toHaveBeenCalled(); expect(host.getAttribute('aria-busy')).toBe('true');
    save(); await vi.waitFor(() => expect(effects.windup).toHaveBeenCalledTimes(1));
    expect(host.querySelector('.radiant-enemy [data-hp]')!.textContent).toBe(enemyHP);
    expect(session.view().saved.revision).toBe(2);
    windup(); await vi.waitFor(() => expect(effects.impact).toHaveBeenCalledTimes(1));
    expect(host.querySelector('.radiant-enemy [data-hp]')!.textContent).not.toBe(enemyHP);
    expect(controls(host, '[data-radiant-action="normal"]').disabled).toBe(true);
    impact(); await pending;
    expect(session.view().presentation).toBeNull(); expect(host.getAttribute('aria-busy')).toBe('false');
  });
  it('Skip settles exactly once and late old visuals cannot overwrite a newer action', async () => {
    const releases: (() => void)[] = [];
    const effects = { windup: vi.fn(() => {
      const cancelled = releases.length === 0;
      return new Promise<void>(resolve => { releases.push(resolve); }).then(() => {
        if (cancelled) throw new DOMException('Old windup cancelled.', 'AbortError');
      });
    }),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, session, host } = fixture(6, 6, effects); await view.finishEntrance();
    const old = view.act('normal'); await vi.waitFor(() => expect(releases).toHaveLength(1));
    view.skip(); expect(session.view().presentation).toBeNull();
    const next = view.act('normal'); await vi.waitFor(() => expect(releases).toHaveLength(2));
    releases[0](); await old;
    expect(session.view().presentation).not.toBeNull();
    expect(host.querySelector('[data-radiant-error]')!.textContent).toBe('');
    expect(controls(host, '[data-radiant-action="normal"]').disabled).toBe(true);
    releases[1](); await next; expect(session.view().presentation).toBeNull();
  });
  it('Settings locks controls without a new request and Reduce motion settles saved effects immediately', async () => {
    let release!: () => void;
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { release = resolve; })),
      impact: vi.fn(async () => {}), cancel: vi.fn(), pause: vi.fn() };
    const { view, session, host, transport, settings } = fixture(6, 6, effects); await view.finishEntrance();
    controls(host, '[data-radiant-settings]').click();
    expect(settings).toHaveBeenCalledTimes(1); expect(session.view().settingsOpen).toBe(true);
    expect(controls(host, '[data-radiant-action="normal"]').disabled).toBe(true);
    expect(transport.execute).not.toHaveBeenCalled();
    session.setSettings(false); view.render();
    const pending = view.act('normal'); await vi.waitFor(() => expect(effects.windup).toHaveBeenCalled());
    applyMotion('reduced');
    expect(effects.cancel).toHaveBeenCalled(); expect(session.view().presentation).toBeNull();
    release(); await pending; expect(effects.impact).not.toHaveBeenCalled();
  });
  it('lost acknowledgements expose an exact action retry and never celebrate a failure', async () => {
    const effects = { windup: vi.fn(async () => {}), impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, host, session, transport } = fixture(6, 6, effects); await view.finishEntrance();
    const execute = transport.execute.getMockImplementation()!;
    transport.execute.mockImplementationOnce(async request => { await execute(request); throw new Error('Lost reply'); });
    await expect(view.act('normal')).rejects.toThrow('Lost reply');
    expect(effects.windup).not.toHaveBeenCalled(); expect(session.view().presentation).toBeNull();
    expect(controls(host, '[data-radiant-retry]').hidden).toBe(false);
    const request = session.view().pending!;
    await view.retry(); expect(transport.execute.mock.calls.at(-1)![0]).toEqual(request);
    expect(session.view().saved.revision).toBe(2); expect(effects.windup).toHaveBeenCalledTimes(1);
  });
  it('disposing during saved presentation cancels effects and prevents late DOM updates', async () => {
    let release!: () => void;
    const effects = { windup: vi.fn(() => new Promise<void>(resolve => { release = resolve; })),
      impact: vi.fn(async () => {}), cancel: vi.fn() };
    const { view, host, session } = fixture(6, 6, effects); await view.finishEntrance();
    const pending = view.act('normal'); await vi.waitFor(() => expect(effects.windup).toHaveBeenCalled());
    view.dispose(); release(); await pending;
    expect(host.children).toHaveLength(0); expect(effects.impact).not.toHaveBeenCalled();
    expect(session.view().saved.revision).toBe(2);
  });
});
