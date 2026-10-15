// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BattleView, createSession, type BattleAuthority } from './battle-view';
import { actAndAdvanceTurn } from '../game/battle';
import { createCreatureCopy } from '../game/character-instances';
import { gestureGuide } from './gesture-guide';

vi.mock('./settings', () => ({ reducedMotion: () => true }));
vi.mock('../vfx/battle-vfx-runner', () => ({ BattleVFXRunner: class { destroy() {} } }));

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  Reflect.deleteProperty(Element.prototype, 'animate');
});

function pointer(button: HTMLElement, type: string, x = 100, y = 100, pointerId = 1) {
  const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: y });
  Object.defineProperties(event, { pointerId: { value: pointerId }, isPrimary: { value: true } });
  button.dispatchEvent(event);
}

function fixture(online = false, captured = false) {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = false; },
  });
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true, value: () => ({ finished: Promise.resolve(), playbackRate: 1, cancel: vi.fn() }),
  });
  const copy = createCreatureCopy('infusion:heavens:0');
  const ids = ['ember', 'tide', captured ? copy.instanceId : 'sprout'];
  const session = createSession('ember', { level: 10, evolution: 1 }, undefined, {
    ids, progress: { ember: { level: 10, evolution: 1 }, tide: { level: 10, evolution: 1 },
      sprout: { level: 10, evolution: 1 } }, captures: captured ? [copy] : [],
  });
  session.entrancePending = false;
  session.state.allies.forEach(ally => { ally.shatter = 100; });
  const host = document.createElement('div');
  document.body.append(host);
  const commit = vi.fn();
  const action = vi.fn(async (actorId: string, command: Parameters<BattleAuthority['action']>[1], targetId: string) => {
    const result = actAndAdvanceTurn(session.state, actorId, command, targetId);
    return { session: { ...session, state: result.state }, result };
  });
  const authority: BattleAuthority | undefined = online
    ? { action, endTurn: vi.fn(), nextStage: vi.fn(), nextWave: vi.fn(), retry: vi.fn() } : undefined;
  const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, commit, undefined, authority);
  const button = (id: string) => {
    const element = host.querySelector<HTMLButtonElement>(`[data-unit="${id}"]`)!;
    element.setPointerCapture = vi.fn();
    element.hasPointerCapture = () => true;
    element.releasePointerCapture = vi.fn();
    return element;
  };
  return { session, host, commit, action, view, ids, button };
}

describe('per-member squad attack grids', () => {
  it.each([false, true])('opens the pressed member grid outside staggered units (captured=%s)', captured => {
    const f = fixture(false, captured);
    try {
      for (const id of f.ids) {
        const button = f.button(id);
        const actor = f.session.state.allies.find(ally => ally.id === id)!;
        pointer(button, 'pointerdown');
        const guide = f.host.querySelector<HTMLElement>('.gesture-choice')!;
        expect(guide.parentElement).toBe(f.host);
        expect(guide.dataset.gestureActor).toBe(id);
        expect(guide.style.getPropertyValue('--element')).toBe(button.style.getPropertyValue('--element'));
        const expected = document.createElement('span');
        expected.innerHTML = gestureGuide(f.session.state, actor);
        expect(guide.innerHTML).toBe(expected.innerHTML);
        expect(f.host.querySelectorAll('.gesture-choice')).toHaveLength(1);
        pointer(button, 'pointermove', 140, 100);
        expect(guide.querySelector('[data-gesture-action="skill2"]')?.getAttribute('data-selected')).toBe('true');
        expect(guide.querySelector('.gesture-status')?.textContent).toContain(actor.kit!.abilities.skill2.name);
        pointer(button, 'pointerup');
        button.click();
        expect(f.host.querySelector('.gesture-choice')).toBeNull();
        expect(f.commit).not.toHaveBeenCalled();
      }
    } finally { f.view.destroy(); }
  });

  it.each([false, true].flatMap(online => [0, 1, 2].map(index => ({ online, index }))))(
    'dispatches a drag from position $index to that actor once (online=$online)', async ({ online, index }) => {
      const f = fixture(online);
      try {
        const id = f.ids[index];
        const button = f.button(id);
        pointer(button, 'pointerdown');
        pointer(button, 'pointermove', 100, 140);
        pointer(button, 'pointerup', 100, 140);
        button.click();
        await vi.waitFor(() => expect(f.session.state.allies[index].spent).toBe(true));
        if (online) {
          expect(f.action).toHaveBeenCalledExactlyOnceWith(id, 'light', 'enemy-1-0');
          expect(f.commit).not.toHaveBeenCalled();
        } else {
          expect(f.commit).toHaveBeenCalledOnce();
          expect(f.commit.mock.calls[0][0].events[0]).toMatchObject({ source: id, action: 'light' });
        }
        expect(f.host.querySelector('.gesture-choice')).toBeNull();
      } finally { f.view.destroy(); }
    });

  it.each(['pointercancel', 'lostpointercapture'])('cleans up on %s and permits another member to hold', type => {
    const f = fixture();
    try {
      const first = f.button('tide');
      pointer(first, 'pointerdown');
      pointer(first, type);
      expect(first.classList.contains('gesture-active')).toBe(false);
      expect(f.host.querySelector('.gesture-choice')).toBeNull();
      pointer(f.button('sprout'), 'pointerdown');
      expect(f.host.querySelector<HTMLElement>('.gesture-choice')?.dataset.gestureActor).toBe('sprout');
      f.view.destroy();
      expect(f.host.querySelector('.gesture-choice')).toBeNull();
      expect(f.commit).not.toHaveBeenCalled();
    } finally { f.view.destroy(); }
  });

  it('keeps action restrictions and rejects concurrent pointers without replacing the active grid', () => {
    const f = fixture();
    try {
      f.session.state.allies[1].spent = true;
      pointer(f.button('tide'), 'pointerdown');
      expect(f.host.querySelector('.gesture-choice')).toBeNull();
      expect(f.host.querySelector('#battle-error')?.textContent).not.toBe('');
      const first = f.button('ember');
      pointer(first, 'pointerdown');
      pointer(f.button('sprout'), 'pointerdown', 100, 100, 2);
      expect(f.host.querySelector<HTMLElement>('.gesture-choice')?.dataset.gestureActor).toBe('ember');
      expect(f.host.querySelectorAll('.gesture-choice')).toHaveLength(1);
      pointer(first, 'pointercancel');
      expect(f.commit).not.toHaveBeenCalled();
    } finally { f.view.destroy(); }
  });
});
