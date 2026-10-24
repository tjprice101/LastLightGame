// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BattleView, createSession, type BattleAuthority } from './battle-view';
import { healthSnapshot } from './battle-health';
import { buffSnapshot } from '../game/battle-buffs';
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
  Reflect.deleteProperty(Element.prototype, 'animate');
});

const progress = { level: 105, evolution: 6 };
function mount(session = createSession('ember', progress), authority?: BattleAuthority) {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true, value: function (this: HTMLDialogElement) { this.open = false; },
  });
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true, value: () => ({ finished: Promise.resolve(), playbackRate: 1, cancel: vi.fn() }),
  });
  session.entrancePending = false;
  const host = document.createElement('div');
  document.body.append(host);
  const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, vi.fn(), undefined, authority);
  return { host, session, view };
}

describe('restored pre-reference battle screen', () => {
  it.each([
    undefined, { storyStage: storyRules.stages }, { element: 'infernic', stage: 35 },
    { mode: 'heavens', stage: infusionModeStageCount }, { mode: 'abyss', stage: infusionModeStageCount },
    { mode: 'machines', stage: 35 }, { mode: 'treasury', stage: 25 },
    { mode: 'sanctuary', stage: 25 }, { mode: 'roses', stage: 35 },
    { character: 'nerithe', stage: 10 }, { activity: 'machines', tier: 3 },
  ] as const)('restores field readouts and menu actions while keeping stage progress in %j', activity => {
    const f = mount(createSession('ember', progress, activity, {
      ids: ['ember', 'tide', 'sprout'], progress: { ember: progress, tide: progress, sprout: progress },
    }));
    try {
      expect(f.host.querySelectorAll('.allies .unit-readout')).toHaveLength(3);
      expect(f.host.querySelectorAll('.allies .battle-art')).toHaveLength(3);
      expect(f.host.querySelector('.battle-command-dock')).toBeNull();
      expect(f.host.querySelector('[data-view-stats]')).toBeNull();
      expect(f.host.querySelector('.battle-field-actions')).toBeNull();
      expect(f.host.querySelectorAll('[data-action]')).toHaveLength(4);
      expect(f.host.querySelectorAll('#battle-menu [data-action]')).toHaveLength(4);
      expect(f.host.querySelector('[data-action="defend"]')).toBeNull();
      expect(f.host.querySelector('.battle-progress')?.textContent).toContain('Turn 1');
      const meter = f.host.querySelector<HTMLMeterElement>('[aria-label="Activity stage progress"]');
      if (activity) {
        expect(meter?.value).toBe(f.session.state.wave);
        expect(meter!.max).toBeGreaterThanOrEqual(meter!.value);
      } else expect(meter).toBeNull();
      for (const unit of f.session.state.allies) {
        const field = f.host.querySelector(`[data-unit="${unit.id}"]`)!;
        expect(field.querySelector('.unit-health')?.textContent).toBe(`HP ${formatStat(unit.hp)} / ${formatStat(unit.stats.health)}`);
        expect(field.querySelector('.unit-gauge')).not.toBeNull();
        expect(field.querySelector('.unit-active-buffs')).not.toBeNull();
        expect(field.querySelector('.native-kit-slot')).not.toBeNull();
      }
    } finally { f.view.destroy(); }
  });

  it('keeps health and Shield updates on the field at impact instead of a removed footer card', async () => {
    const f = mount();
    try {
      const ally = f.session.state.allies[0];
      const target = f.host.querySelector(`[data-unit="${ally.id}"]`)!;
      const before = ally.hp;
      Reflect.set(f.view, 'displayedHealth', healthSnapshot([...f.session.state.allies, ...f.session.state.enemies]));
      Reflect.set(f.view, 'displayedBuffs', new Map([[ally.id, buffSnapshot(ally)]]));
      const animate = Reflect.get(f.view, 'animate');
      await Reflect.apply(animate, f.view, [{
        kind: 'damage', source: f.session.state.enemies[0].id, target: ally.id,
        amount: 17, critical: false, shieldRemaining: 8,
        buffs: { ...buffSnapshot(ally), shield: 8 }, message: 'Impact',
      }]);
      expect(target.querySelector('.unit-health')?.textContent).toBe(`HP ${formatStat(before - 17)} / ${formatStat(ally.stats.health)}`);
      expect(target.querySelector('[data-buff="shield"]')?.textContent).toContain('8');
      expect(ally.hp).toBe(before);
    } finally { f.view.destroy(); }
  });
});
