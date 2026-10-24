// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { afterCalamiticAction } from '../game/calamitic-conduits';
import { applyConduitWeaken, prepareConduitAction } from '../game/conduit-runtime';
import { BattleView, createSession } from './battle-view';
import { gestureGuide } from './gesture-guide';

vi.mock('../content/phase-zero-stats', async original => ({
  ...await original<typeof import('../content/phase-zero-stats')>(),
  phaseZeroStatsReady: true,
}));
vi.mock('./settings', () => ({ reducedMotion: () => true }));
vi.mock('../vfx/battle-vfx-runner', () => ({ BattleVFXRunner: class { destroy() {} } }));

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
});

function fixture() {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = false; },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = true; },
  });
  const session = createSession('ember', { level: 0, evolution: 1 }, undefined, {
    ids: ['ember', 'tide', 'sprout'], progress: {
      ember: { level: 0, evolution: 1 }, tide: { level: 0, evolution: 1 }, sprout: { level: 0, evolution: 1 },
    }, captures: [],
  });
  session.entrancePending = false;
  const host = document.createElement('div');
  document.body.append(host);
  return { session, host };
}

describe('Phase 0 battle action controls', () => {
  it('allows a spent Throne recipient to be selected and open their skill-only gesture grid', () => {
    const { session, host } = fixture();
    const [owner, recipient] = session.state.allies;
    owner.conduits = ['calamitic-throne-borrowed-tomorrows', null, null, null, null, null, null, null];
    owner.spent = true;
    recipient.spent = true;
    recipient.shatter = 100;
    afterCalamiticAction(session.state, owner, 'ultimate', []);
    const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, () => {});
    try {
      host.querySelector<HTMLButtonElement>('#open-battle-menu')!.click();
      const picker = host.querySelector<HTMLButtonElement>(`[data-actor="${recipient.id}"]`)!;
      expect(picker.disabled).toBe(false);
      picker.click();
      expect(host.querySelector<HTMLButtonElement>('[data-action="skill1"]')!.disabled).toBe(false);
      expect(host.querySelector<HTMLButtonElement>('[data-action="light"]')!.disabled).toBe(true);
      const guide = document.createElement('div');
      guide.innerHTML = gestureGuide(session.state, recipient, session.state.enemies[0].id);
      expect(guide.querySelector('[data-gesture-action="skill1"]')?.getAttribute('data-available')).toBe('true');
      expect(guide.querySelector('[data-gesture-action="light"]')?.getAttribute('data-available')).toBe('false');
    } finally { view.destroy(); }
  });

  it('shows the same target-dependent Gauge cost and availability in gesture and menu controls without mutating state', () => {
    const { session, host } = fixture();
    const [actor, tizu] = session.state.allies;
    tizu.conduits = ['aquatic-undertide-chronometer', null, null, null, null, null, null, null];
    actor.shatter = 22;
    const target = session.state.enemies[0];
    applyConduitWeaken(session.state, tizu, target, .25, [], 'skill1', 1,
      prepareConduitAction(session.state, tizu, 'skill1', 25, false));
    const before = structuredClone(session.state);
    const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, () => {});
    try {
      const guide = document.createElement('div');
      guide.innerHTML = gestureGuide(session.state, actor, target.id);
      const skill = guide.querySelector<HTMLElement>('[data-gesture-action="skill1"]')!;
      expect(skill.dataset.available).toBe('true');
      expect(skill.textContent).toContain('22 Elemental Gauge');
      host.querySelector<HTMLButtonElement>('#open-battle-menu')!.click();
      const button = host.querySelector<HTMLButtonElement>('[data-action="skill1"]')!;
      expect(button.disabled).toBe(false);
      expect(button.textContent).toContain('Costs 22 Elemental Gauge');
      expect(session.state).toEqual(before);
    } finally { view.destroy(); }
  });
});
