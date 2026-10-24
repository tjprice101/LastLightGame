// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BattleView, createSession, type BattleAuthority } from './battle-view';
import { actionUnavailable, endTurn, type BattleEvent } from '../game/battle';
import { healthSnapshot } from './battle-health';
import { buffSnapshot } from '../game/battle-buffs';
import { createCreatureCopy } from '../game/character-instances';
import { formatStat } from '../content/combat';
import { storyRules } from '../content/story';
import { infusionModeStageCount } from '../content/activities';

vi.mock('./settings', () => ({ reducedMotion: () => true }));
vi.mock('../vfx/battle-vfx-runner', () => ({ BattleVFXRunner: class { destroy() {} } }));

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

const progress = { level: 105, evolution: 6 };
function mount(session = createSession('ember', progress), authority?: BattleAuthority) {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = false; },
  });
  session.entrancePending = false;
  const host = document.createElement('div');
  document.body.append(host);
  const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, vi.fn(), undefined, authority);
  return { host, session, view };
}

describe('reference-style shared battle HUD', () => {
  it.each([
    undefined, { storyStage: storyRules.stages }, { element: 'infernic', stage: 35 },
    { mode: 'heavens', stage: infusionModeStageCount }, { mode: 'abyss', stage: infusionModeStageCount },
    { mode: 'machines', stage: 35 }, { mode: 'treasury', stage: 25 },
    { mode: 'sanctuary', stage: 25 }, { mode: 'roses', stage: 35 },
    { character: 'nerithe', stage: 10 }, { activity: 'machines', tier: 3 },
  ] as const)('uses one bottom readout per ally and visible modifiers in %j', activity => {
    const f = mount(createSession('ember', progress, activity, {
      ids: ['ember', 'tide', 'sprout'], progress: { ember: progress, tide: progress, sprout: progress },
    }));
    try {
      expect(f.host.querySelectorAll('.battle-squad-card')).toHaveLength(3);
      expect(f.host.querySelectorAll('.allies .unit-readout')).toHaveLength(0);
      expect(f.host.querySelectorAll('.allies .battle-art')).toHaveLength(3);
      expect(f.host.querySelectorAll('.battle-field-actions [data-action]')).toHaveLength(4);
      expect(f.host.querySelector('.battle-selected-target [data-enemy-scaling]')).not.toBeNull();
      expect(f.host.querySelector('.battle-selected-target .element-label')).toBeNull();
      expect(f.host.querySelector('.battle-selected-target')?.textContent).not.toContain(f.session.state.enemies[0].name);
      expect(f.host.querySelector('.enemies .unit-name')?.textContent).toContain(f.session.state.enemies[0].name);
      expect(f.host.querySelector('[data-action="defend"]')).toBeNull();
      for (const unit of f.session.state.allies) {
        const card = f.host.querySelector(`[data-squad-member="${unit.id}"]`)!;
        expect(card.getAttribute('data-button-surface')).toBe('art');
        expect(card.querySelector('.unit-health')?.textContent).toBe(`HP ${formatStat(unit.hp)} / ${formatStat(unit.stats.health)}`);
        expect(card.querySelector('.unit-gauge')).not.toBeNull();
        expect(card.querySelector('img')?.getAttribute('src')).toContain('/characters/');
      }
      for (const button of Array.from(f.host.querySelectorAll<HTMLButtonElement>('.battle-field-actions [data-action]'))) {
        const action = button.dataset.action as 'light' | 'skill1' | 'skill2' | 'ultimate';
        expect(button.disabled).toBe(actionUnavailable(f.session.state, f.session.state.allies[0], action, f.session.state.enemies[0].id) !== null);
        expect(button.dataset.buttonSurface).toBe('text');
      }
      expect(f.host.querySelector('#battle-menu .battle-unit-intel')).not.toBeNull();
      expect(f.host.querySelector('#battle-announcement')?.getAttribute('role')).toBe('status');
    } finally { f.view.destroy(); }
  });

  it('keeps unavailable cards readable but disabled, without changing formation slots or silently changing the actor', () => {
    const session = createSession('ember', progress, undefined, {
      ids: ['ember', 'tide', 'sprout'], progress: { ember: progress, tide: progress, sprout: progress },
    });
    session.state.allies[1].spent = true;
    session.state.allies[2].recoverThrough = session.state.round;
    const f = mount(session);
    try {
      const selected = f.host.querySelector('[data-squad-member="ember"]');
      for (const id of ['tide', 'sprout']) {
        const card = f.host.querySelector<HTMLButtonElement>(`[data-squad-member="${id}"]`)!;
        expect(card.disabled).toBe(true);
        card.click();
        expect(f.host.querySelector('[data-squad-member="ember"]')).toBe(selected);
        expect(selected?.getAttribute('aria-pressed')).toBe('true');
      }
      session.state.allies[1].hp = 0;
      Reflect.apply(Reflect.get(f.view, 'render'), f.view, []);
      expect(Array.from(f.host.querySelectorAll('.allies [data-unit]')).map(unit => unit.getAttribute('data-unit')))
        .toEqual(['ember', 'tide', 'sprout']);
      expect(f.host.querySelector('.allies')?.getAttribute('style')).toContain('--combatant-count:3');
      expect(f.host.querySelector('[data-squad-member="tide"]')?.textContent).toContain('Defeated');
    } finally { f.view.destroy(); }
  });

  it('selects a captured squad card and sends exactly one action through the existing online authority', async () => {
    const copy = createCreatureCopy('infusion:heavens:0');
    const session = createSession('ember', progress, undefined, {
      ids: ['ember', copy.instanceId], progress: { ember: progress }, captures: [copy],
    });
    const action = vi.fn(async () => ({ session, result: { state: session.state, events: [] } }));
    const authority: BattleAuthority = { action, endTurn: vi.fn(), nextStage: vi.fn(), nextWave: vi.fn(), retry: vi.fn() };
    const f = mount(session, authority);
    try {
      f.host.querySelector<HTMLButtonElement>(`[data-squad-member="${copy.instanceId}"]`)!.click();
      const selected = f.host.querySelector(`[data-squad-member="${copy.instanceId}"]`)!;
      expect(selected.getAttribute('aria-pressed')).toBe('true');
      expect(selected.querySelector('img')?.getAttribute('src')).toContain('/enemies/');
      expect(document.activeElement).toBe(selected);
      f.host.querySelector<HTMLButtonElement>('.battle-field-actions [data-action="light"]')!.click();
      expect(action).toHaveBeenCalledExactlyOnceWith(copy.instanceId, 'light', session.state.enemies[0].id);
      await vi.waitFor(() => expect(f.host.getAttribute('aria-busy')).toBe('false'));
    } finally { f.view.destroy(); }
  });

  it('patches allied HP in the bottom card at impact, while numbers remain anchored to the sprite', async () => {
    const f = mount();
    try {
      const before = structuredClone(f.session.state);
      const result = endTurn(before);
      const damage = result.events.find(event => event.kind === 'damage' && event.target === 'ember')!;
      const ally = before.allies[0];
      Reflect.set(f.view, 'displayedHealth', healthSnapshot([...before.allies, ...before.enemies]));
      Reflect.set(f.view, 'displayedBuffs', new Map([[ally.id, buffSnapshot(ally)]]));
      f.session.state = result.state;
      let finish!: () => void;
      const pending = new Promise<void>(resolve => { finish = resolve; });
      Reflect.set(f.view, 'play', () => pending);
      const presentation = Reflect.apply(Reflect.get(f.view, 'animate'), f.view, [damage]);
      const card = f.host.querySelector('[data-squad-member="ember"]')!;
      expect(card.querySelector('.unit-health')?.textContent).toBe(`HP ${formatStat(ally.hp - damage.amount)} / ${formatStat(ally.stats.health)}`);
      expect(f.host.querySelector('[data-unit="ember"] .damage-number')).not.toBeNull();
      expect(card.querySelector('.damage-number')).toBeNull();
      finish();
      await presentation;
    } finally { f.view.destroy(); }
  });

  it.each(['heal', 'shield'] as const)('updates %s in the bottom card without replacing the field sprite', async kind => {
    const session = createSession('ember', progress);
    const ally = session.state.allies[0];
    ally.hp -= 100;
    const f = mount(session);
    try {
      const snapshot = buffSnapshot(ally);
      Reflect.set(f.view, 'displayedHealth', healthSnapshot([ally]));
      Reflect.set(f.view, 'displayedBuffs', new Map([[ally.id, snapshot]]));
      Reflect.set(f.view, 'play', () => Promise.resolve());
      const sprite = f.host.querySelector('[data-unit="ember"] .battle-sprite');
      const entry: BattleEvent = { kind, source: ally.id, target: ally.id, amount: 25, critical: false, message: '',
        ...(kind === 'shield' ? { buffs: { ...snapshot, shield: 25 } } : {}) };
      await Reflect.apply(Reflect.get(f.view, 'animate'), f.view, [entry]);
      const card = f.host.querySelector('[data-squad-member="ember"]')!;
      expect(card.querySelector('.unit-health')?.textContent).toBe(`HP ${formatStat(ally.hp + (kind === 'heal' ? 25 : 0))} / ${formatStat(ally.stats.health)}`);
      if (kind === 'shield') expect(card.querySelector('.unit-active-buffs')?.textContent).toContain('25');
      expect(f.host.querySelector('[data-unit="ember"] .battle-sprite')).toBe(sprite);
    } finally { f.view.destroy(); }
  });

  it('uses native event snapshots in bottom cards and updates the persistent turn cue during enemy playback', () => {
    const f = mount(createSession('crinso', progress));
    try {
      const before = structuredClone(f.session.state);
      Reflect.apply(Reflect.get(f.view, 'updateNative'), f.view, [{ round: 1, units: { crinso: { combo: 2 } } }]);
      expect(f.host.querySelector('[data-squad-member="crinso"] .native-kit-slot')?.textContent).toContain('Combo: 2');
      expect(f.host.querySelector('[data-unit="crinso"] .native-kit-slot')).toBeNull();
      expect(f.session.state).toEqual(before);
      Reflect.set(f.view, 'play', () => Promise.resolve());
      Reflect.apply(Reflect.get(f.view, 'showTurnCue'), f.view, ['Enemy turn']);
      expect(f.host.querySelector('.battle-turn-label')?.textContent).toBe('Enemy turn');
    } finally { f.view.destroy(); }
  });
});
