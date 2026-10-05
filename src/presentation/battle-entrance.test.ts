import { afterEach, describe, expect, it, vi } from 'vitest';
import { entranceFrames } from './battle-entrance';
import { BattleView } from './battle-view';
import { reducedMotion } from './settings';
import { waitForActivityTransition } from './activity-transition';
import { createBattle } from '../game/battle';

vi.mock('./settings', () => ({ reducedMotion: vi.fn(() => false) }));
vi.mock('./activity-transition', () => ({
  waitForActivityTransition: vi.fn(() => Promise.resolve()),
  activityTransitionPending: () => false,
  transitionActivity: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(reducedMotion).mockReturnValue(false);
  vi.mocked(waitForActivityTransition).mockImplementation(() => Promise.resolve());
});

function fixture() {
  vi.stubGlobal('innerWidth', 1280);
  const units = [
    { disabled: false, dataset: { side: 'enemy' }, getBoundingClientRect: () => ({ left: 100, right: 400 }) },
    { disabled: false, dataset: { side: 'ally' }, getBoundingClientRect: () => ({ left: 800, right: 1100 }) },
  ];
  const classes = new Set<string>();
  const host = {
    setAttribute: vi.fn(),
    classList: { add: (value: string) => classes.add(value), remove: (value: string) => classes.delete(value) },
    querySelectorAll: () => units,
    querySelector: () => ({ textContent: '', focus: vi.fn() }),
  };
  const view = Object.create(BattleView.prototype);
  const finish: (() => void)[] = [];
  Object.assign(view, {
    host, session: { entrancePending: true, state: createBattle() }, disposed: false,
    render: vi.fn(), error: vi.fn(),
    play: vi.fn(() => new Promise<void>((resolve) => { finish.push(resolve); })),
  });
  return { view, units, classes, finish,
    enter: () => Reflect.apply(Reflect.get(BattleView.prototype, 'enterEncounter'), view, []) as Promise<void>,
  };
}

describe('encounter entrance', () => {
  it('resumes an exhausted session once, commits resolved rewards and presents all recovery phases', () => {
    const state = createBattle();
    state.allies[0].spent = true;
    state.allies[0].recoverThrough = 2;
    const view = Object.create(BattleView.prototype);
    const commitRewards = vi.fn();
    const present = vi.fn();
    Object.assign(view, { session: { state }, busy: false, disposed: false, commitRewards, present });
    Reflect.apply(Reflect.get(BattleView.prototype, 'advanceIdleTurn'), view, []);
    expect(commitRewards).toHaveBeenCalledOnce();
    const result = commitRewards.mock.calls[0][0];
    expect(result.state.round).toBe(3);
    expect(result.events.filter((event: { kind: string }) => event.kind === 'attack')).toHaveLength(6);
    expect(present).toHaveBeenCalledWith(result);
    view.disposed = true;
    Reflect.apply(Reflect.get(BattleView.prototype, 'advanceIdleTurn'), view, []);
    expect(commitRewards).toHaveBeenCalledOnce();
  });
  it.each([320, 390, 1280])('starts combatants completely outside a %ipx viewport', (width) => {
    const bounds = { left: width * .2, right: width * .4 };
    for (const side of ['ally', 'enemy']) {
      const frames = entranceFrames(side, bounds, width);
      const distance = Number(String(frames[0].transform).match(/-?[\d.]+/)?.[0]);
      if (side === 'ally') expect(bounds.left + distance).toBeGreaterThan(width);
      else expect(bounds.right + distance).toBeLessThan(0);
      expect(frames[1]).toEqual({ transform: 'translateX(0)', opacity: 1 });
    }
    expect(() => entranceFrames('unknown', bounds, width)).toThrow('Unknown');
  });

  it('locks combat until loading and every entrance animation complete', async () => {
    let reveal = () => {};
    vi.mocked(waitForActivityTransition).mockReturnValue(new Promise<void>((resolve) => { reveal = resolve; }));
    const f = fixture();
    const entry = f.enter();
    expect(f.view.busy).toBe(true);
    expect(f.view.host.setAttribute).toHaveBeenCalledWith('aria-busy', 'true');
    expect(f.units.every((unit) => unit.disabled)).toBe(true);
    expect(f.classes.has('battle-entering')).toBe(true);
    expect(f.view.play).not.toHaveBeenCalled();
    reveal();
    await Promise.resolve();
    expect(f.view.play).toHaveBeenCalledTimes(2);
    expect(f.view.session.entrancePending).toBe(true);
    f.finish[0]();
    await Promise.resolve();
    expect(f.view.busy).toBe(true);
    f.finish[1]();
    await entry;
    expect(f.view.busy).toBe(false);
    expect(f.view.session.entrancePending).toBe(false);
    expect(f.view.render).toHaveBeenCalledOnce();
  });

  it('skips sliding for reduced motion but still ends entry gating', async () => {
    vi.mocked(reducedMotion).mockReturnValue(true);
    const f = fixture();
    await f.enter();
    expect(f.view.play).not.toHaveBeenCalled();
    expect(f.classes.size).toBe(0);
    expect(f.view.session.entrancePending).toBe(false);
    expect(f.view.render).toHaveBeenCalledOnce();
  });

  it('does not rerender a disposed field while loading', async () => {
    const f = fixture();
    const entry = f.enter();
    f.view.disposed = true;
    await entry;
    expect(f.view.play).not.toHaveBeenCalled();
    expect(f.view.render).not.toHaveBeenCalled();
    expect(f.view.session.entrancePending).toBe(true);
    expect(f.classes.size).toBe(0);
  });

  it('reports entrance errors without losing the resolved encounter or keeping controls locked', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const f = fixture();
      f.view.play.mockRejectedValue(new Error('Animation unavailable'));
      await f.enter();
      expect(f.view.busy).toBe(false);
      expect(f.view.session.entrancePending).toBe(false);
      expect(f.view.render).toHaveBeenCalledOnce();
      expect(f.view.error).toHaveBeenCalledWith(expect.stringContaining('Encounter state is preserved'));
      expect(f.classes.size).toBe(0);
    } finally { log.mockRestore(); }
  });
});
