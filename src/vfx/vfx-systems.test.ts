// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CHARACTER_PROFILES, VFX_SYSTEMS, createVFXSystem, getVFXProfileForCombatant } from './vfx-registry';
import { MasterVFXEngine } from './master-vfx-engine';
import { BattleVFXRunner } from './battle-vfx-runner';
import type { VFXArchetype, AbilityTier, VFXContext } from './types';
import { SlashVFXSystem } from './systems/slash-vfx';
import { MandalaVFXSystem } from './systems/mandala-vfx';
import { VFXRenderer } from './vfx-renderer';
import { advanceVFX, effectOpacity, releaseEnvelope } from './vfx-motion';

describe('VFX Registry & Character Profiles', () => {
  const expectedCharacters = [
    'ember', 'tide', 'sprout', 'atmoso',
    'aurora', 'bliss', 'bruno', 'disciple',
    'elise', 'razor', 'rosetta', 'thornia',
    'crinso', 'nerithe', 'orvella', 'vaelor',
  ];

  it('contains all 16 Element-Bearers with complete metadata', () => {
    for (const charId of expectedCharacters) {
      const profile = CHARACTER_PROFILES[charId];
      expect(profile, `Missing character profile for ${charId}`).toBeDefined();
      expect(profile.characterName).toBeTruthy();
      expect(profile.element).toBeTruthy();
      expect(profile.weapon).toBeTruthy();
      expect(profile.signature).toBeTruthy();
    }
  });

  it('has 4 unique, authored abilities for every single character (64 total)', () => {
    const tiers: AbilityTier[] = ['light', 'skill1', 'skill2', 'ultimate'];
    const archetypeCounts: Record<VFXArchetype, number> = {
      slash: 0,
      beam: 0,
      mandala: 0,
      slam: 0,
      vortex: 0,
      volley: 0,
      cataclysm: 0,
    };

    let totalAbilities = 0;

    for (const charId of expectedCharacters) {
      const profile = CHARACTER_PROFILES[charId];
      for (const tier of tiers) {
        const ability = profile.abilities[tier];
        expect(ability, `Missing ${tier} for ${charId}`).toBeDefined();
        expect(ability.name).toBeTruthy();
        expect(ability.description).toBeTruthy();
        expect(ability.archetype).toBeTruthy();
        expect(ability.duration).toBeGreaterThan(0);
        expect(ability.chargeDuration).toBeGreaterThan(0);
        expect(ability.impactDuration).toBeGreaterThan(0);
        expect(ability.palette).toBeDefined();
        expect(ability.palette.core).toBeDefined();

        archetypeCounts[ability.archetype]++;
        totalAbilities++;
      }
    }

    expect(totalAbilities).toBe(64);
    // Every archetype must be utilized across the roster!
    for (const [arch, count] of Object.entries(archetypeCounts)) {
      expect(count, `Archetype ${arch} should be used by multiple abilities`).toBeGreaterThan(0);
    }
    // All 16 Ultimates must use the cataclysm archetype
    expect(archetypeCounts.cataclysm).toBe(16);
  });

  it('provides working singleton systems for all 7 archetypes', () => {
    const archetypes: VFXArchetype[] = ['slash', 'beam', 'mandala', 'slam', 'vortex', 'volley', 'cataclysm'];
    for (const arch of archetypes) {
      const system = VFX_SYSTEMS[arch];
      expect(system).toBeDefined();
      expect(system.id).toBe(arch);
      expect(typeof system.reset).toBe('function');
      expect(typeof system.update).toBe('function');
      expect(typeof system.render).toBe('function');
    }
  });
});

function createMockContext2D(): CanvasRenderingContext2D {
  const dummyGrad = {
    addColorStop: vi.fn(),
  };

  return {
    save: vi.fn(),
    restore: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    strokeRect: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    setLineDash: vi.fn(),
    createLinearGradient: vi.fn(() => dummyGrad),
    createRadialGradient: vi.fn(() => dummyGrad),
    drawImage: vi.fn(),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    shadowBlur: 0,
    shadowColor: 'transparent',
    filter: 'none',
  } as unknown as CanvasRenderingContext2D;
}

describe('MasterVFXEngine Orchestration', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;

    vi.spyOn(canvas, 'getContext').mockImplementation(() => createMockContext2D());
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => createMockContext2D());
  });
  afterEach(() => vi.restoreAllMocks());

  it('initializes cleanly with any character and ability', () => {
    const engine = new MasterVFXEngine(canvas, 'ember', 'skill1');
    expect(engine.getProfile().characterName).toBe('Infernis');
    expect(engine.getAbility().name).toBe('Cinder Cleave');
    expect(engine.getArchetype()).toBe('slash');
    engine.destroy();
  });

  it('swaps systems dynamically when changing character or ability tier', () => {
    const engine = new MasterVFXEngine(canvas, 'aurora', 'skill1');
    expect(engine.getArchetype()).toBe('beam');

    // Switch to Last Flare -> Cataclysm
    engine.setAbility('ultimate');
    expect(engine.getArchetype()).toBe('cataclysm');

    // Switch to Bruno -> Slam
    engine.setCharacter('bruno');
    engine.setAbility('skill1');
    expect(engine.getProfile().characterName).toBe('Bruno');
    expect(engine.getArchetype()).toBe('slam');

    // Switch to Rosetta Skill 2 -> Mandala
    engine.setCharacter('rosetta');
    engine.setAbility('skill2');
    expect(engine.getProfile().characterName).toBe('Rosetta');
    expect(engine.getArchetype()).toBe('mandala');

    // Switch to Atmoso Skill 2 -> Vortex
    engine.setCharacter('atmoso');
    engine.setAbility('skill2');
    expect(engine.getArchetype()).toBe('vortex');

    // Switch to Elise Skill 1 -> Volley
    engine.setCharacter('elise');
    engine.setAbility('skill1');
    expect(engine.getArchetype()).toBe('volley');

    engine.destroy();
  });

  it('supports scrubbing, playback controls, and config toggles', () => {
    const engine = new MasterVFXEngine(canvas, 'ember', 'ultimate');
    expect(engine.togglePlay()).toBe(false); // was playing -> paused
    expect(engine.togglePlay()).toBe(true);  // was paused -> playing

    engine.scrub(0.5); // scrub to 50%
    engine.config.playbackSpeed = 0.5;
    engine.config.enableOpticalFlares = false;
    engine.config.enableFloorReflections = false;
    expect(engine.config.playbackSpeed).toBe(0.5);

    engine.destroy();
  });
});

describe('BattleVFXRunner Integration', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let frame: FrameRequestCallback;
  let timestamp: number;
  const anchors = {
    sourceArtRect: new DOMRect(700, 300, 80, 80),
    targets: [{ artRect: new DOMRect(200, 300, 80, 80), support: false }],
  };
  const advance = () => { timestamp += 100; frame(timestamp); };

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;

    ctx = createMockContext2D();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => createMockContext2D());
    vi.spyOn(canvas, 'getContext').mockImplementation(() => ctx);
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 150, 960, 540));
    timestamp = performance.now();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frame = callback; return 1; });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  describe('shared bloom and motion', () => {
    afterEach(() => vi.restoreAllMocks());

    it('composites two soft emission passes and crisp geometry, with a working bloom toggle', () => {
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => createMockContext2D());
      const output = createMockContext2D();
      const renderer = new VFXRenderer(output);
      renderer.begin(960, 540, 2);
      renderer.composite(960, 540, { enabled: true, intensity: 1, radius: 24 });
      expect(output.drawImage).toHaveBeenCalledTimes(3);
      vi.mocked(output.drawImage).mockClear();
      renderer.composite(960, 540, { enabled: false, intensity: 1, radius: 24 });
      expect(output.drawImage).toHaveBeenCalledTimes(1);
      expect(output.save).toHaveBeenCalledTimes(vi.mocked(output.restore).mock.calls.length);
    });

    it('has continuous activation, impact and release envelopes with zero opacity at completion', () => {
      expect(effectOpacity(0, 2)).toBe(0);
      expect(effectOpacity(1, 2)).toBe(1);
      expect(effectOpacity(2, 2)).toBe(0);
      expect(effectOpacity(1.999, 2)).toBeLessThan(.001);
      expect(releaseEnvelope(0, .6)).toBe(0);
      expect(releaseEnvelope(.045, .6)).toBeGreaterThan(.8);
      expect(releaseEnvelope(.6, .6)).toBe(0);
    });

    it('advances simulation at bounded, real-time steps rather than once per rendered frame', () => {
      const ability = CHARACTER_PROFILES.ember.abilities.skill1;
      const context = { ctx: createMockContext2D(), t: 0, dt: 0, progress: 0,
        width: 960, height: 540, scale: 1, casterX: 700, casterY: 300, targetX: 200,
        targetY: 300, definition: ability, palette: ability.palette, shakeCallback: vi.fn() };
      const update = vi.fn();
      const system = { id: 'test', reset: vi.fn(), update, render: vi.fn() };
      advanceVFX(system, context, .3);
      expect(update).toHaveBeenCalledTimes(36);
      expect(context.t).toBeCloseTo(.3);
      expect(context.dt).toBeLessThanOrEqual(1 / 120);
      advanceVFX(system, context, .3);
      expect(update).toHaveBeenCalledTimes(36);
    });

    it('rewinds scrubbed particle simulations and keeps separate studio instances independent', () => {
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => createMockContext2D());
      const render = vi.spyOn(SlashVFXSystem.prototype, 'render');
      const canvas = document.createElement('canvas');
      const first = new MasterVFXEngine(canvas, 'ember', 'skill1');
      const second = new MasterVFXEngine(canvas, 'ember', 'skill1');
      first.scrub(.7);
      first.scrub(.1);
      second.scrub(.3);
      expect(render.mock.calls.map(([context]) => context.t)).toEqual([
        expect.closeTo(1.68), expect.closeTo(.24), expect.closeTo(.72),
      ]);
      expect(render.mock.instances[0]).toBe(render.mock.instances[1]);
      expect(render.mock.instances[2]).not.toBe(render.mock.instances[0]);
      first.destroy();
      second.destroy();
    });

    it.each([
      ['ember', 'skill1'], ['sprout', 'skill1'], ['bruno', 'skill1'], ['atmoso', 'skill2'],
    ] as const)('keeps %s %s particle geometry consistent at 30Hz and 120Hz', (id, tier) => {
      vi.spyOn(Math, 'random').mockReturnValue(.5);
      const ability = CHARACTER_PROFILES[id].abilities[tier];
      function simulate(fps: number) {
        const ctx = createMockContext2D();
        const context: VFXContext = { ctx, t: 0, dt: 0, progress: 0, width: 960, height: 540,
          scale: 1, casterX: 700, casterY: 300, targetX: 200, targetY: 300,
          definition: ability, palette: ability.palette, shakeCallback: vi.fn() };
        const system = createVFXSystem(ability.archetype);
        for (let frame = 1; frame <= fps; frame++) advanceVFX(system, context, frame / fps);
        system.render(context);
        return [ctx.arc, ctx.translate, ctx.moveTo, ctx.lineTo].map(method =>
          vi.mocked(method).mock.calls.map(args => args.map(value =>
            typeof value === 'number' ? Math.round(value * 1000) / 1000 : value)));
      }
      expect(simulate(30)).toEqual(simulate(120));
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('resolves correct profile and fallback for combatants by ID or element', () => {
    expect(getVFXProfileForCombatant('ember').characterName).toBe('Infernis');
    expect(getVFXProfileForCombatant('aurora').characterName).toBe('Aurora');
    expect(getVFXProfileForCombatant('nerithe').characterName).toBe('Nerithe');

    // Unknown/enemy combatant element fallback
    expect(getVFXProfileForCombatant('goblin', 'botanic').characterName).toBe('Flora');
    expect(getVFXProfileForCombatant('imp', 'infernic').characterName).toBe('Infernis');
    expect(getVFXProfileForCombatant('kraken', 'oceanic').characterName).toBe('Tizu');
    expect(getVFXProfileForCombatant('wyvern', 'atmospheric').characterName).toBe('Atmoso');
  });

  it('runs playAttackVFX and clears cleanly', async () => {
    const runner = new BattleVFXRunner(canvas);
    const sourceArt = { left: 100, top: 200, width: 80, height: 80 } as DOMRect;
    const targetArt = { left: 400, top: 200, width: 80, height: 80 } as DOMRect;

    const impact = vi.fn();
    const vfxPromise = runner.playAttackVFX({
      combatantId: 'ember',
      action: 'skill1',
      sourceArtRect: sourceArt,
      targets: [{ artRect: targetArt, support: false }],
      speedMultiplier: 10, // Fast for test
      onImpact: impact,
    });

    // Advance frame or abort
    runner.clear();
    await vfxPromise;
    expect(impact).not.toHaveBeenCalled();
    runner.destroy();
  });

  it('uses canvas-relative anchors and fires impact once at the authored charge time', async () => {
    const runner = new BattleVFXRunner(canvas);
    const render = vi.spyOn(SlashVFXSystem.prototype, 'render');
    const impact = vi.fn();
    const pending = runner.playAttackVFX({ combatantId: 'ember', action: 'skill1', ...anchors, onImpact: impact });
    advance();
    expect(impact).not.toHaveBeenCalled();
    expect(render.mock.calls[0][0]).toMatchObject({ casterX: 640, casterY: 190, targetX: 140, targetY: 190 });
    for (let i = 0; i < 40; i++) advance();
    await pending;
    expect(impact).toHaveBeenCalledTimes(1);
    expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(ctx.save).toHaveBeenCalledTimes(vi.mocked(ctx.restore).mock.calls.length);
  });

  it('rejects frame errors instead of leaving combat waiting indefinitely', async () => {
    vi.spyOn(SlashVFXSystem.prototype, 'render').mockImplementation(() => { throw new Error('Render failed'); });
    const runner = new BattleVFXRunner(canvas);
    const pending = runner.playAttackVFX({ combatantId: 'ember', action: 'skill1', ...anchors });
    const rejected = expect(pending).rejects.toThrow('Render failed');
    advance();
    await rejected;
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('rejects asynchronous impact failures', async () => {
    const runner = new BattleVFXRunner(canvas);
    const pending = runner.playAttackVFX({ combatantId: 'ember', action: 'skill1', ...anchors,
      speedMultiplier: 10, onImpact: async () => { throw new Error('Impact failed'); } });
    const rejected = expect(pending).rejects.toThrow('Impact failed');
    advance();
    await rejected;
  });

  it('finishes a delayed frame without stretching playback or rendering an expired effect', async () => {
    const render = vi.spyOn(SlashVFXSystem.prototype, 'render');
    const update = vi.spyOn(SlashVFXSystem.prototype, 'update');
    const impact = vi.fn();
    const runner = new BattleVFXRunner(canvas);
    const pending = runner.playAttackVFX({ combatantId: 'ember', action: 'skill1', ...anchors, onImpact: impact });
    timestamp += 10_000;
    frame(timestamp);
    await pending;
    expect(impact).toHaveBeenCalledOnce();
    expect(render).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    runner.destroy();
  });

  it.each([1, 2, 3])('finishes sparse frames at the authored duration at %ix', async speedMultiplier => {
    const runner = new BattleVFXRunner(canvas);
    const duration = CHARACTER_PROFILES.ember.abilities.skill1.duration;
    const impact = vi.fn();
    let settled = false;
    const pending = runner.playAttackVFX({ combatantId: 'ember', action: 'skill1', ...anchors,
      speedMultiplier, onImpact: impact }).then(() => { settled = true; });
    timestamp += (duration / speedMultiplier - .1) * 1000;
    frame(timestamp);
    await Promise.resolve();
    expect(settled).toBe(false);
    timestamp += 101;
    frame(timestamp);
    await pending;
    expect(impact).toHaveBeenCalledOnce();
    runner.destroy();
  });

  it('applies live speed changes without restarting or duplicating impact', async () => {
    let speed = 1;
    const render = vi.spyOn(SlashVFXSystem.prototype, 'render');
    const impact = vi.fn();
    const runner = new BattleVFXRunner(canvas);
    const pending = runner.playAttackVFX({ combatantId: 'ember', action: 'skill1', ...anchors,
      speedMultiplier: () => speed, onImpact: impact });
    advance();
    expect(render.mock.calls.at(-1)?.[0].t).toBeCloseTo(.1);
    speed = 3;
    advance();
    expect(render.mock.calls.at(-1)?.[0].t).toBeCloseTo(.4);
    for (let i = 0; i < 15; i++) advance();
    await pending;
    expect(impact).toHaveBeenCalledOnce();
    runner.destroy();
  });

  it('settles cancellation even after the VFX ends while impact presentation is still pending', async () => {
    const runner = new BattleVFXRunner(canvas);
    const pending = runner.playAttackVFX({ combatantId: 'ember', action: 'skill1', ...anchors,
      onImpact: () => new Promise<void>(() => {}) });
    timestamp += 10_000;
    frame(timestamp);
    runner.clear();
    await pending;
    runner.destroy();
  });

  it('rejects invisible anchors rather than drawing at invented positions', () => {
    const runner = new BattleVFXRunner(canvas);
    expect(() => runner.playAttackVFX({ combatantId: 'ember', action: 'skill1', ...anchors,
      sourceArtRect: new DOMRect() })).toThrow('anchors');
  });

  it('renders every enemy simultaneously with independent simulation state and a single impact', async () => {
    const render = vi.spyOn(SlashVFXSystem.prototype, 'render');
    const impact = vi.fn();
    const runner = new BattleVFXRunner(canvas);
    const pending = runner.playAttackVFX({ combatantId: 'ember', action: 'skill2', ...anchors,
      targets: [200, 350, 500].map(left => ({ artRect: new DOMRect(left, 300, 80, 80), support: false })),
      onImpact: impact });
    advance();
    expect(render.mock.calls.map(([context]) => context.targetX)).toEqual([140, 290, 440]);
    expect(render.mock.calls.map(([context]) => context.secondaryTarget)).toEqual([false, true, true]);
    expect(new Set(render.mock.instances).size).toBe(3);
    for (let i = 0; i < 40; i++) advance();
    await pending;
    expect(impact).toHaveBeenCalledTimes(1);
  });

  it('anchors support casts on each recipient instead of projecting them from the caster', async () => {
    const render = vi.spyOn(MandalaVFXSystem.prototype, 'render');
    const runner = new BattleVFXRunner(canvas);
    const pending = runner.playAttackVFX({ combatantId: 'sprout', action: 'skill2', ...anchors,
      targets: [200, 350, 500].map(left => ({ artRect: new DOMRect(left, 300, 80, 80), support: true })) });
    advance();
    for (const [context] of render.mock.calls) {
      expect(context.casterX).toBe(context.targetX);
      expect(context.casterY).toBe(context.targetY);
    }
    runner.clear();
    await pending;
    const frames = render.mock.calls.length;
    advance();
    expect(render).toHaveBeenCalledTimes(frames);
  });
});
