// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BattleView, createSession, type BattleAuthority } from './battle-view';
import { MenuHistory } from './menu-history';

vi.mock('./settings', () => ({ reducedMotion: () => true }));
vi.mock('../vfx/battle-vfx-runner', () => ({ BattleVFXRunner: class { destroy() {} } }));

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
});

function fixture(phase: 'cleared' | 'defeat', exit: () => Promise<void>, online: boolean) {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = false; },
  });
  const session = createSession('ember');
  session.entrancePending = false;
  session.state.phase = phase;
  session.resultsVisible = true;
  const host = document.createElement('div');
  document.body.append(host);
  const unexpected = vi.fn(async () => { throw new Error('Exit must not use combat authority.'); });
  const authority: BattleAuthority | undefined = online ? {
    action: unexpected, endTurn: unexpected, nextStage: unexpected, nextWave: unexpected, retry: unexpected,
  } : undefined;
  const commit = vi.fn();
  const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, commit, exit, authority);
  return { session, host, view, commit, unexpected };
}

describe('battle results exit', () => {
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
