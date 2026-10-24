// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BattleView, createSession, type BattleAuthority } from './battle-view';
import { actAndAdvanceTurn } from '../game/battle';

vi.mock('./settings', () => ({ reducedMotion: () => true }));
vi.mock('../vfx/battle-vfx-runner', () => ({ BattleVFXRunner: class { destroy() {} } }));

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  Reflect.deleteProperty(Element.prototype, 'animate');
});

function fixture(online = false) {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = false; },
  });
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true, value: () => ({ finished: Promise.resolve(), playbackRate: 1, cancel: vi.fn() }),
  });
  const session = createSession('ember', { level: 10, evolution: 1 }, undefined, {
    ids: ['ember', 'tide'], progress: { ember: { level: 10, evolution: 1 }, tide: { level: 10, evolution: 1 } },
  });
  session.entrancePending = false;
  const host = document.createElement('div');
  document.body.append(host);
  const commit = vi.fn();
  const action = vi.fn(async (actorId: string, command: Parameters<BattleAuthority['action']>[1], targetId: string) => {
    const result = actAndAdvanceTurn(session.state, actorId, command, targetId);
    return { session: { ...session, state: result.state }, result };
  });
  const authority: BattleAuthority | undefined = online
    ? { action, endTurn: vi.fn(), nextStage: vi.fn(), nextWave: vi.fn(), retry: vi.fn() }
    : undefined;
  const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, commit, undefined, authority);
  return { session, host, commit, action, view };
}

describe('Normal Attack secondary-click shortcut', () => {
  it.each([false, true])('uses the right-clicked ally and selected enemy exactly once (online=%s)', async online => {
    const f = fixture(online);
    try {
      f.host.querySelector<HTMLButtonElement>('[data-unit="enemy-1-1"]')!.click();
      const actor = f.host.querySelector<HTMLButtonElement>('[data-unit="tide"]')!;
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });
      actor.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      await vi.waitFor(() => expect(f.session.state.allies.find(unit => unit.id === 'tide')!.spent).toBe(true));
      if (online) {
        expect(f.action).toHaveBeenCalledExactlyOnceWith('tide', 'light', 'enemy-1-1');
        expect(f.commit).not.toHaveBeenCalled();
      } else {
        expect(f.commit).toHaveBeenCalledOnce();
        expect(f.commit.mock.calls[0][0].events[0]).toMatchObject({ kind: 'attack', source: 'tide', target: 'enemy-1-1', action: 'light' });
      }
    } finally { f.view.destroy(); }
  });

  it('describes the Normal Attack shortcut and offers no Defense action', () => {
    const f = fixture();
    try {
      expect(f.host.querySelector('#battle-announcement')!.textContent).toContain('Right-click: Normal Attack');
      expect(f.host.querySelector('#battle-announcement')!.textContent).not.toContain('Defense');
      expect(f.host.querySelector('#battle-menu [data-action="light"]')!.textContent).toContain('Down or right-click');
      expect(f.host.querySelector('.battle-field-actions [data-action="light"]')!.textContent).toContain('Normal Attack');
      expect(f.host.querySelector('[data-action="defend"]')).toBeNull();
    } finally { f.view.destroy(); }
  });

  it('ignores secondary-click during playback and never maps enemy context menus to ally actions', () => {
    const f = fixture();
    try {
      Reflect.set(f.view, 'busy', true);
      f.host.querySelector('[data-unit="tide"]')!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
      Reflect.set(f.view, 'busy', false);
      f.host.querySelector('[data-unit="enemy-1-0"]')!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
      expect(f.commit).not.toHaveBeenCalled();
    } finally { f.view.destroy(); }
  });
});
