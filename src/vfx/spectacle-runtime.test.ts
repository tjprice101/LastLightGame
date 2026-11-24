// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const scene = {
  ready: true, stats: {}, onReady: null as null | (() => void), onActivity: null,
  attach: vi.fn(), setPaused: vi.fn(), setClock: vi.fn(), shareFlashGovernor: vi.fn(), cancelAll: vi.fn(),
};

afterEach(() => { vi.restoreAllMocks(); vi.resetModules(); vi.doUnmock('phaser'); vi.doUnmock('./spectacle-scene');
  document.body.replaceChildren(); });

describe('shared Spectacle runtime (D-495 S1)', () => {
  it('is null without WebGL and never mounts a layer', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { spectacleRuntime } = await import('./spectacle-runtime');
    expect(await spectacleRuntime()).toBeNull();
    expect(document.querySelector('.radiant-gpu-layer')).toBeNull();
  });

  describe('with WebGL', () => {
    beforeEach(() => {
      for (const value of Object.values(scene)) if (vi.isMockFunction(value)) value.mockClear();
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as RenderingContext);
      vi.doMock('./spectacle-scene', () => ({ SpectacleScene: class { constructor() { return scene; } } }));
      vi.doMock('phaser', () => ({ default: { WEBGL: 2, Scale: { RESIZE: 3 },
        Game: class { loop = { sleep: vi.fn(), wake: vi.fn() }; constructor() { queueMicrotask(() => scene.onReady?.()); } } } }));
    });

    it('boots one shared layer however many times it is requested', async () => {
      const { spectacleRuntime } = await import('./spectacle-runtime');
      const [first, second] = await Promise.all([spectacleRuntime(), spectacleRuntime()]);
      expect(first).toBe(second);
      expect(document.querySelectorAll('.radiant-gpu-layer')).toHaveLength(1);
    });

    it('a summon claim runs on the UI clock with its own frame and raised layer', async () => {
      const { claimSpectacle, ownsSpectacle, spectacleRuntime } = await import('./spectacle-runtime');
      const runtime = (await spectacleRuntime())!;
      const frame = document.createElement('div');
      const summon = {};
      claimSpectacle(runtime, summon, { kind: 'summon', frame: () => frame });
      expect(ownsSpectacle(summon)).toBe(true);
      expect(scene.setClock).toHaveBeenLastCalledWith('ui');
      expect((scene.attach.mock.calls.at(-1)![0] as () => HTMLElement)()).toBe(frame);
      expect(scene.setPaused).toHaveBeenLastCalledWith(false);
      expect(runtime.host.dataset.spectacleOwner).toBe('summon');
      expect(runtime.host.style.visibility).toBe('');
    });

    it('a new owner cancels the previous owner\'s effects; re-claiming by the same owner does not', async () => {
      const { claimSpectacle, ownsSpectacle, spectacleRuntime } = await import('./spectacle-runtime');
      const runtime = (await spectacleRuntime())!;
      const battle = {}, summon = {};
      claimSpectacle(runtime, battle, { kind: 'battle', frame: () => null, paused: true });
      claimSpectacle(runtime, battle, { kind: 'battle', frame: () => null });
      expect(scene.cancelAll).not.toHaveBeenCalled();
      expect(scene.setClock).toHaveBeenLastCalledWith('battle');
      claimSpectacle(runtime, summon, { kind: 'summon', frame: () => null });
      expect(scene.cancelAll).toHaveBeenCalledTimes(1);
      expect(ownsSpectacle(battle)).toBe(false);
    });

    it('only the current owner can release; release hides, detaches and restores the battle clock', async () => {
      const { claimSpectacle, ownsSpectacle, releaseSpectacle, spectacleRuntime } = await import('./spectacle-runtime');
      const runtime = (await spectacleRuntime())!;
      const battle = {}, summon = {};
      claimSpectacle(runtime, battle, { kind: 'battle', frame: () => null });
      claimSpectacle(runtime, summon, { kind: 'summon', frame: () => null });
      scene.attach.mockClear();
      releaseSpectacle(runtime, battle);
      expect(scene.attach).not.toHaveBeenCalled();
      expect(ownsSpectacle(summon)).toBe(true);
      releaseSpectacle(runtime, summon);
      expect(ownsSpectacle(summon)).toBe(false);
      expect(scene.attach).toHaveBeenLastCalledWith(null);
      expect(scene.setClock).toHaveBeenLastCalledWith('battle');
      expect(runtime.host.style.visibility).toBe('hidden');
      expect(runtime.host.dataset.spectacleOwner).toBeUndefined();
    });
  });
});

describe('SpectacleScene clock (D-495 S1)', () => {
  afterEach(() => { vi.doUnmock('../presentation/battle-speed'); });

  async function clockScene() {
    vi.doMock('../presentation/battle-speed', () => ({ battleSpeed: () => 3 }));
    vi.doMock('phaser', () => ({ default: { BlendModes: { ADD: 1 },
      Scene: class { constructor(_config: unknown) {} },
      Renderer: { WebGL: { Pipelines: { PostFXPipeline: class {} } } } } }));
    const { SpectacleScene } = await import('./spectacle-scene');
    const instance = new SpectacleScene() as unknown as { time: { timeScale: number }; tweens: { timeScale: number };
      setClock(clock: 'battle' | 'ui'): void; setPaused(paused: boolean): void; freeze(ms: number): void };
    instance.time = { timeScale: 1 };
    instance.tweens = { timeScale: 1 };
    return instance;
  }

  it('follows battle speed on the battle clock and runs at 1 on the UI clock', async () => {
    const instance = await clockScene();
    instance.setPaused(false);
    expect(instance.time.timeScale).toBe(3);
    instance.setClock('ui');
    expect(instance.time.timeScale).toBe(1);
    expect(instance.tweens.timeScale).toBe(1);
    instance.setClock('battle');
    expect(instance.time.timeScale).toBe(3);
  });

  it('pauses on either clock', async () => {
    const instance = await clockScene();
    instance.setClock('ui');
    instance.setPaused(true);
    expect(instance.time.timeScale).toBe(0);
  });
});
