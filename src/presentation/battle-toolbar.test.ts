// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { actAndAdvanceTurn } from '../game/battle';
import { applyBattleSpeed, battleSpeed } from './battle-speed';
import { BattleView, createSession, type BattleAuthority } from './battle-view';

vi.mock('./settings', () => ({ reducedMotion: () => false }));

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = false; },
  });
});

afterEach(() => {
  document.body.replaceChildren();
  delete document.documentElement.dataset.battleSpeed;
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  vi.unstubAllGlobals();
});

function fixture(authority?: BattleAuthority) {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  document.body.innerHTML = `<main class="battle-screen"><header class="battle-toolbar">
    <button data-menu-back>Leave</button>
    <button data-battle-speed-choice="1">1x</button>
    <button data-battle-speed-choice="2">2x</button>
    <button data-battle-speed-choice="3">3x</button>
    <button id="open-settings">Settings</button>
    </header><div id="battle-root"></div></main>`;
  const toolbar = document.querySelector<HTMLElement>('.battle-toolbar')!;
  const speed = toolbar.querySelector<HTMLButtonElement>('[data-battle-speed-choice="3"]')!;
  const settings = toolbar.querySelector<HTMLButtonElement>('#open-settings')!;
  const leave = toolbar.querySelector<HTMLButtonElement>('[data-menu-back]')!;
  const speedClick = vi.fn(() => applyBattleSpeed(3));
  speed.addEventListener('click', speedClick);
  const session = createSession('ember');
  session.entrancePending = false;
  const host = document.querySelector<HTMLElement>('#battle-root')!;
  const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, () => {}, undefined, authority);
  return { toolbar, speed, speedClick, settings, leave, session, host, view };
}

describe('retained battle toolbar controls', () => {
  it.each(['entrance', 'local', 'online'] as const)('keeps speed usable during %s and unlocks retained utilities afterwards', async phase => {
    let finish!: () => void;
    const pending = new Promise<void>(resolve => { finish = resolve; });
    const action = vi.fn(async () => {
      await pending;
      return { session: f.session, result: { state: f.session.state, events: [] } };
    });
    const authority: BattleAuthority = { action, endTurn: action, nextStage: action, nextWave: action, retry: action };
    const f = fixture(phase === 'online' ? authority : undefined);
    Reflect.set(f.view, 'play', () => pending);
    Reflect.set(f.view, 'animate', () => pending);
    try {
      const presentation = phase === 'entrance'
        ? Reflect.apply(Reflect.get(f.view, 'enterEncounter'), f.view, [])
        : phase === 'online'
          ? Reflect.apply(Reflect.get(f.view, 'authoritativeCommand'), f.view, ['light'])
          : Reflect.apply(Reflect.get(f.view, 'present'), f.view,
            [actAndAdvanceTurn(f.session.state, 'ember', 'light', f.session.state.enemies[0].id)]);
      expect(f.host.getAttribute('aria-busy')).toBe('true');
      expect(f.settings.disabled).toBe(true);
      expect(f.leave.disabled).toBe(true);
      expect(f.host.querySelector<HTMLButtonElement>('#open-battle-menu')!.disabled).toBe(true);
      expect(f.speed.disabled).toBe(false);
      f.speed.click();
      expect(f.speedClick).toHaveBeenCalledOnce();
      expect(battleSpeed()).toBe(3);
      finish();
      await presentation;
      expect(f.host.getAttribute('aria-busy')).toBe('false');
      expect(f.host.querySelector('.battle-toolbar')).toBe(f.toolbar);
      expect(f.settings.disabled).toBe(false);
      expect(f.leave.disabled).toBe(false);
      expect(f.speed.disabled).toBe(false);
      f.speed.click();
      expect(f.speedClick).toHaveBeenCalledTimes(2);
    } finally {
      finish();
      f.view.destroy();
    }
  });

  it('unlocks the same toolbar after a rejected server action without losing speed listeners', async () => {
    const rejected = vi.fn(async () => { throw new Error('Action rejected'); });
    const f = fixture({ action: rejected, endTurn: rejected, nextStage: rejected, nextWave: rejected, retry: rejected });
    const before = structuredClone(f.session);
    try {
      await Reflect.apply(Reflect.get(f.view, 'authoritativeCommand'), f.view, ['light']);
      expect(f.session).toEqual(before);
      expect(f.host.querySelector('#battle-error')?.textContent).toBe('Action rejected');
      expect(f.host.querySelector('.battle-toolbar')).toBe(f.toolbar);
      expect(f.settings.disabled).toBe(false);
      expect(f.leave.disabled).toBe(false);
      f.speed.click();
      expect(battleSpeed()).toBe(3);
      expect(f.speedClick).toHaveBeenCalledOnce();
    } finally { f.view.destroy(); }
  });
});
