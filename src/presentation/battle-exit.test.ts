// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BattleView, createSession, type BattleAuthority } from './battle-view';
import { MenuHistory } from './menu-history';

vi.mock('./settings', () => ({ reducedMotion: () => true }));
vi.mock('../vfx/battle-vfx-runner', () => ({ BattleVFXRunner: class { destroy() {} } }));
vi.mock('./activity-transition', () => ({
  activityTransitionPending: () => false,
  transitionActivity: async (enter: () => void) => { enter(); },
}));

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
});

function fixture(phase: 'cleared' | 'defeat', exit: () => Promise<void>, online: boolean, staged: boolean | 'machines' = false) {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = false; },
  });
  const session = createSession('ember', undefined, staged === 'machines' ? { mode: 'machines', stage: 35 } : staged ? { storyStage: 25 } : undefined);
  session.entrancePending = false;
  session.state.phase = phase;
  session.resultsVisible = true;
  const host = document.createElement('div');
  document.body.append(host);
  const unexpected = vi.fn<BattleAuthority['retry']>(async () => { throw new Error('Exit must not use combat authority.'); });
  const authority: BattleAuthority | undefined = online ? {
    action: unexpected, endTurn: unexpected, nextStage: unexpected, nextWave: unexpected, retry: unexpected,
  } : undefined;
  const commit = vi.fn();
  const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, commit, exit, authority);
  return { session, host, view, commit, unexpected };
}

describe('battle results exit', () => {
  it('retains acquired Machines ownership when the offline Replay stage button creates a fresh encounter', async () => {
    const f = fixture('cleared', vi.fn(), false, 'machines');
    f.session.state.machineConduits = { 'duplex-heart': 2, 'worldbreaker-drive': 1 };
    const before = structuredClone(f.session);
    Object.assign(f.view, { enterEncounter: vi.fn(async () => {}) });
    try {
      f.host.querySelector<HTMLButtonElement>('.battle-results [data-result-restart]')!.click();
      await vi.waitFor(() => expect(f.session.runId).not.toBe(before.runId));
      expect(f.session.state.infusion?.stage).toBe(35);
      expect(f.session.state.machineConduits).toEqual(before.state.machineConduits);
      expect(f.session.state.machineConduits).not.toBe(before.state.machineConduits);
      expect(f.commit).not.toHaveBeenCalled();
    } finally { f.view.destroy(); }
  });
  it.each([false, true])('replays a victory stage through its bound button (online: %s)', async online => {
    const f = fixture('cleared', vi.fn(), online, true);
    const before = structuredClone(f.session);
    const fresh = createSession('ember', undefined, { storyStage: 25 });
    const enter = vi.fn(async () => {});
    Object.assign(f.view, { enterEncounter: enter });
    if (online) f.unexpected.mockResolvedValue({ session: fresh });
    try {
      const button = f.host.querySelector<HTMLButtonElement>('.battle-results [data-result-restart]')!;
      expect(button.textContent).toBe('Replay stage');
      button.click();
      await vi.waitFor(() => expect(f.session.runId).not.toBe(before.runId));
      expect(f.session.state.story?.storyStage).toBe(25);
      expect(f.session.state.phase).toBe('player');
      expect(f.session.stageEvents).toEqual([]);
      expect(f.session.state.allies[0].shatter).toBe(0);
      expect(f.commit).not.toHaveBeenCalled();
      expect(f.unexpected).toHaveBeenCalledTimes(online ? 1 : 0);
      expect(enter).toHaveBeenCalledOnce();
    } finally { f.view.destroy(); }
  });
  it.each(['cleared', 'defeat'] as const)('returns a resumed online %s run through one exit callback', async phase => {
    const history = new MenuHistory<{ page: string }>();
    let page = 'battle';
    const exit = vi.fn(async () => { page = history.back({ page: 'gameplay' }).page; });
    const f = fixture(phase, exit, true);
    const before = structuredClone(f.session);
    try {
      f.host.querySelector<HTMLButtonElement>('[data-result-quit]')!.click();
      await vi.waitFor(() => expect(page).toBe('gameplay'));
      expect(exit).toHaveBeenCalledOnce();
      expect(f.unexpected).not.toHaveBeenCalled();
      expect(f.commit).not.toHaveBeenCalled();
      expect(f.session).toEqual(before);
      expect(f.host.querySelector('#battle-error')?.textContent).toBe('');
    } finally { f.view.destroy(); }
  });

  it('retains the actual caller for an offline defeat', async () => {
    const history = new MenuHistory<{ page: string; stage?: number }>();
    history.visit({ page: 'story', stage: 19 }, 'battle');
    let destination: { page: string; stage?: number } | undefined;
    const f = fixture('defeat', async () => { destination = history.back({ page: 'gameplay' }); }, false);
    try {
      f.host.querySelector<HTMLButtonElement>('[data-result-quit]')!.click();
      await vi.waitFor(() => expect(destination).toEqual({ page: 'story', stage: 19 }));
      expect(f.commit).not.toHaveBeenCalled();
    } finally { f.view.destroy(); }
  });

  it('keeps failed exits retryable and ignores repeated clicks while waiting', async () => {
    let finish!: () => void;
    const pending = new Promise<void>(resolve => { finish = resolve; });
    const exit = vi.fn()
      .mockRejectedValueOnce(new Error('Quit was not confirmed. Retry the same request.'))
      .mockImplementationOnce(() => pending);
    const f = fixture('defeat', exit, true);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const button = f.host.querySelector<HTMLButtonElement>('[data-result-quit]')!;
      button.click();
      await vi.waitFor(() => expect(f.host.querySelector('#battle-error')?.textContent).toContain('Quit was not confirmed'));
      button.click();
      button.click();
      expect(exit).toHaveBeenCalledTimes(2);
      finish();
      await vi.waitFor(() => expect(Reflect.get(f.view, 'busy')).toBe(false));
      expect(f.unexpected).not.toHaveBeenCalled();
      expect(f.commit).not.toHaveBeenCalled();
    } finally { finish?.(); f.view.destroy(); }
  });

});
