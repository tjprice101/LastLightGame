// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { actAndAdvanceTurn } from '../game/battle';
import { applyBattleSpeed, battleSpeed } from './battle-speed';
import { BattleView, createSession, type BattleAuthority } from './battle-view';

vi.mock('./settings', () => ({ reducedMotion: () => false }));
vi.mock('../vfx/battle-vfx-runner', () => ({
  BattleVFXRunner: class {
    clear() {}
    destroy() {}
    playAttackVFX() { return Promise.resolve(); }
  },
}));

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
  it('keeps DOM/tab order aligned with speed, Settings, Menu, Leave through repeated renders', () => {
    const f = fixture();
    const settingsClick = vi.fn();
    const leaveClick = vi.fn();
    f.settings.addEventListener('click', settingsClick);
    f.leave.addEventListener('click', leaveClick);
    try {
      for (let pass = 0; pass < 3; pass++) {
        const buttons = Array.from(f.toolbar.querySelectorAll('button'));
        expect(buttons.map(button => button.textContent)).toEqual(['1x', '2x', '3x', 'Settings', 'Menu', 'Leave']);
        expect(f.host.querySelectorAll('#open-battle-menu')).toHaveLength(1);
        expect(f.host.querySelector('#open-settings')).toBe(f.settings);
        expect(f.host.querySelector('[data-menu-back]')).toBe(f.leave);
        f.settings.click();
        f.leave.click();
        Reflect.apply(Reflect.get(f.view, 'render'), f.view, []);
      }
      expect(settingsClick).toHaveBeenCalledTimes(3);
      expect(leaveClick).toHaveBeenCalledTimes(3);
    } finally { f.view.destroy(); }
  });

  it('announces errors without locking play, fades after three seconds and clears the message', () => {
    vi.useFakeTimers();
    const f = fixture();
    try {
      Reflect.apply(Reflect.get(f.view, 'error'), f.view, ['This action is unavailable.']);
      const error = f.host.querySelector<HTMLElement>('#battle-error')!;
      expect(error.getAttribute('role')).toBe('alert');
      expect(error.getAttribute('aria-atomic')).toBe('true');
      expect(error.textContent).toBe('This action is unavailable.');
      expect(f.host.getAttribute('aria-busy')).not.toBe('true');
      expect(f.host.querySelector<HTMLButtonElement>('#open-battle-menu')!.disabled).toBe(false);
      expect(document.activeElement).not.toBe(error);
      vi.advanceTimersByTime(2999);
      expect(error.classList.contains('is-fading')).toBe(false);
      vi.advanceTimersByTime(1);
      expect(error.classList.contains('is-fading')).toBe(true);
      vi.advanceTimersByTime(250);
      expect(error.textContent).toBe('');
    } finally { f.view.destroy(); vi.useRealTimers(); }
  });

  it('restarts the full lifetime for a new error, including while the previous one is fading', () => {
    vi.useFakeTimers();
    const f = fixture();
    const show = (message: string) => Reflect.apply(Reflect.get(f.view, 'error'), f.view, [message]);
    try {
      show('First rejection');
      vi.advanceTimersByTime(3000);
      show('Latest rejection');
      const error = f.host.querySelector<HTMLElement>('#battle-error')!;
      expect(error.classList.contains('is-fading')).toBe(false);
      vi.advanceTimersByTime(250);
      expect(error.textContent).toBe('Latest rejection');
      vi.advanceTimersByTime(2750);
      expect(error.classList.contains('is-fading')).toBe(true);
      vi.advanceTimersByTime(250);
      expect(error.textContent).toBe('');
    } finally { f.view.destroy(); vi.useRealTimers(); }
  });

  it.each(['render', 'destroy'] as const)('cancels pending error timers on %s', operation => {
    vi.useFakeTimers();
    const f = fixture();
    try {
      Reflect.apply(Reflect.get(f.view, 'error'), f.view, ['Temporary rejection']);
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      Reflect.apply(Reflect.get(f.view, operation), f.view, []);
      expect(vi.getTimerCount()).toBe(0);
      vi.advanceTimersByTime(4000);
      if (operation === 'render') expect(f.host.querySelector('#battle-error')?.textContent).toBe('');
    } finally { f.view.destroy(); vi.useRealTimers(); }
  });

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
