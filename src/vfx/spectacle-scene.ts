/**
 * Battle Spectacle GPU layer (D-484): one transparent Phaser WebGL scene over
 * the battle field. Additive, tinted sprites and pooled particle emitters built
 * from the VFX texture library. Presentation only: finite, pointer-transparent
 * (the canvas host ignores pointers), disposable, and never reads gameplay RNG.
 *
 * World origin is the top-left corner of `.radiant-field`; the camera follows
 * the field every frame, so effects stay put when the page scrolls or the
 * field shakes.
 */
import Phaser from 'phaser';
import { spectacleTextures, spectacleTextureUrl, textureEdge, type SpectacleTexture } from './vfx-textures';
import { toneColor, type BurstKind, type ElementStyle, type SparkPreset, type Travel } from './element-styles';
import { battleSpeed } from '../presentation/battle-speed';
import type { FlashGovernor } from './spectacle-timing';
import { kitSlowFrameLimit, kitSlowFrameMs, softwareRenderer, SpectacleFxState, type CritFlashOptions, type EdgeBloomOptions, type EdgeStrength, type FxView,
  type GodRaysOptions, type VeilOptions } from './shaders/spectacle-fx';
import { SpectacleFxPipeline, spectaclePipelineKey } from './shaders/spectacle-pipeline';

export interface Point { x: number; y: number }
export type { BurstKind } from './element-styles';
export type Quality = 'high' | 'low';
/** R7: live particle cap; low quality scales counts, never the look. */
export const particleCaps: Record<Quality, number> = { high: 700, low: 300 };
const lowQualityFactor = .45;

/** Particle rotation that tumbles once over a particle's life from a random start (petals, rock, crescents). */
const spinStart = new WeakMap<object, number>();
const tumble = {
  onEmit: (particle?: Phaser.GameObjects.Particles.Particle) => {
    const start = Math.random() * 360;
    if (particle) spinStart.set(particle, start);
    return start;
  },
  onUpdate: (particle: Phaser.GameObjects.Particles.Particle, _key: string, t: number) => (spinStart.get(particle) ?? 0) + 360 * t,
};
/** Custom "glow" blend (registered in create): colors add, alpha composites normally, so light
 * brightens the page under the transparent canvas instead of painting black. */
let add: number = Phaser.BlendModes.ADD;

export interface SpectacleStats {
  quality: Quality;
  cap: number;
  peakParticles: number;
  activeFrames: number;
  averageFrameMs: number;
  maximumFrameMs: number;
  slowFrames: number;
  liveObjects: number;
  /** D-494: false on software WebGL, after a start failure, or once the slow-frame guard turned the kit off. */
  shaderKit: boolean;
}

export class SpectacleScene extends Phaser.Scene {
  quality: Quality;
  ready = false;
  onReady: (() => void) | null = null;
  /** Called with true when an effect starts on an idle scene, false shortly after the last one ends. */
  onActivity: ((active: boolean) => void) | null = null;
  private failed: SpectacleTexture[] = [];
  private field: (() => HTMLElement | null) | null = null;
  private fieldBox = { left: 0, top: 0, width: 0, height: 0 };
  private emitters = new Map<string, Phaser.GameObjects.Particles.ParticleEmitter>();
  private live = new Set<Phaser.GameObjects.GameObject>();
  private tweensLive = new Set<Phaser.Tweens.Tween>();
  private timers = new Set<Phaser.Time.TimerEvent>();
  private waits = new Set<() => void>();
  private idleWaiters: (() => void)[] = [];
  private pending = 0;
  private active = false;
  private paused = false;
  private frozenUntil = 0;
  private dimRect!: Phaser.GameObjects.Rectangle;
  private flashRect!: Phaser.GameObjects.Rectangle;
  /** D-490: the extra dim that deepens through a Convergent Light gather. */
  private focusRect!: Phaser.GameObjects.Rectangle;
  private focusTween: Phaser.Tweens.BaseTween | null = null;
  private dimTween: Phaser.Tweens.BaseTween | null = null;
  private flashTween: Phaser.Tweens.BaseTween | null = null;
  private frameSamples: number[] = [];
  /** Shader kit (D-494): bloom and light overlays drawn by one camera post pass. */
  private readonly fx = new SpectacleFxState();
  private shaderKit = false;
  private kitSlowFrames = 0;
  readonly stats: SpectacleStats;
  private readonly speedChange = () => this.applyTimeScale();

  constructor() {
    super({ key: 'spectacle', active: true });
    const navigatorInfo = navigator as Navigator & { deviceMemory?: number };
    this.quality = (navigator.hardwareConcurrency || 8) <= 4 || (navigatorInfo.deviceMemory ?? 8) <= 4 ? 'low' : 'high';
    this.stats = { quality: this.quality, cap: particleCaps[this.quality], peakParticles: 0, activeFrames: 0,
      averageFrameMs: 0, maximumFrameMs: 0, slowFrames: 0, liveObjects: 0,
      shaderKit: false };
  }
  preload(): void {
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.failed.push(file.key as SpectacleTexture);
    });
    for (const key of spectacleTextures) this.load.image(key, spectacleTextureUrl(key));
  }
  create(): void {
    const renderer = this.renderer;
    if (renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
      const gl = renderer.gl;
      add = renderer.addBlendMode([gl.ONE, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA], gl.FUNC_ADD);
      this.attachShaderKit(renderer);
    }
    this.dimRect = this.add.rectangle(0, 0, 1, 1, 0x05060c, 1).setOrigin(0).setDepth(-10).setAlpha(0);
    this.flashRect = this.add.rectangle(0, 0, 1, 1, 0xffffff, 1).setOrigin(0).setDepth(100).setBlendMode(add).setAlpha(0);
    this.focusRect = this.add.rectangle(0, 0, 1, 1, 0x05060c, 1).setOrigin(0).setDepth(-9).setAlpha(0);
    window.addEventListener('last-light-battle-speed-change', this.speedChange);
    this.events.once(Phaser.Scenes.Events.DESTROY, () => window.removeEventListener('last-light-battle-speed-change', this.speedChange));
    const finish = () => {
      this.alphaFromLuminance();
      // Burst emitters are created per element and tier on first use (emitterFor).
      this.warmUp(() => { this.ready = true; this.applyTimeScale(); this.onReady?.(); });
    };
    if (!this.failed.length) { finish(); return; }
    // One PNG retry for any texture whose preferred format failed to decode.
    const retry = this.failed.splice(0);
    for (const key of retry) this.load.image(key, spectacleTextureUrl(key, 'png'));
    this.load.once(Phaser.Loader.Events.COMPLETE, finish);
    this.load.start();
  }
  /** Shader kit (D-494). If the pipeline cannot start, the layer keeps its pre-shader look. */
  private attachShaderKit(renderer: Phaser.Renderer.WebGL.WebGLRenderer): void {
    try {
      const info = renderer.gl.getExtension('WEBGL_debug_renderer_info');
      if (softwareRenderer(info ? String(renderer.gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : null)) return;
      if (!renderer.pipelines.postPipelineClasses.has(spectaclePipelineKey))
        renderer.pipelines.addPostPipeline(spectaclePipelineKey, SpectacleFxPipeline);
      const camera = this.cameras.main;
      camera.setPostPipeline(SpectacleFxPipeline);
      const found = camera.getPostPipeline(SpectacleFxPipeline);
      const pipeline = (Array.isArray(found) ? found[0] : found) as unknown as SpectacleFxPipeline | undefined;
      if (!pipeline) return;
      pipeline.fx = this.fx;
      pipeline.fxView = () => this.fxView();
      this.fx.onEnd = () => this.end();
      this.shaderKit = true; this.stats.shaderKit = true;
    } catch (error) {
      console.error('Battle effects could not start the shader kit; effects play without bloom.', error);
      this.cameras.main.resetPostPipeline();
    }
  }
  /** Slow-frame guard: the battle returns to its pre-shader look for the rest of the session. */
  private dropShaderKit(): void {
    if (!this.shaderKit) return;
    this.shaderKit = false; this.stats.shaderKit = false;
    const live = this.fx.count;
    this.fx.clear();
    this.cameras.main.resetPostPipeline();
    for (let index = 0; index < live; index++) this.end();
  }
  private fxView(): FxView {
    const { left, top, width, height } = this.fieldBox;
    return { fieldLeft: left, fieldTop: top, fieldWidth: width, fieldHeight: height,
      width: this.scale.width, height: this.scale.height };
  }
  /** Draws every texture once, nearly invisible, so first-use GPU uploads happen at boot, not on the first hit. */
  private warmUp(done: () => void): void {
    const images = spectacleTextures.filter(key => this.textures.exists(key))
      .map(key => this.add.image(2, 2, key).setBlendMode(add).setAlpha(.004).setScale(.05));
    let frames = 0;
    const tick = () => {
      if (++frames < 3) return;
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, tick);
      for (const image of images) image.destroy();
      done();
    };
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, tick);
  }
  /** The library is light on black: rebuild each texture as white with alpha = brightness. */
  private alphaFromLuminance(): void {
    for (const key of spectacleTextures) {
      if (!this.textures.exists(key)) continue;
      const source = this.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      const canvas = document.createElement('canvas');
      canvas.width = source.width; canvas.height = source.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) continue;
      context.drawImage(source, 0, 0);
      const image = context.getImageData(0, 0, canvas.width, canvas.height), pixels = image.data;
      for (let index = 0; index < pixels.length; index += 4) {
        const light = Math.max(pixels[index], pixels[index + 1], pixels[index + 2]);
        pixels[index + 3] = Math.round(light * pixels[index + 3] / 255);
        pixels[index] = pixels[index + 1] = pixels[index + 2] = 255;
      }
      context.putImageData(image, 0, 0);
      this.textures.remove(key);
      this.textures.addCanvas(key, canvas);
    }
  }
  attach(field: (() => HTMLElement | null) | null): void { this.field = field; }
  setPaused(paused: boolean): void { this.paused = paused; this.applyTimeScale(); }
  /** Hit-stop (R2): freezes every GPU clock; overlapping requests take the longest, never the sum. */
  freeze(ms: number): void {
    if (ms <= 0) return;
    this.frozenUntil = Math.max(this.frozenUntil, performance.now() + ms / battleSpeed());
    this.applyTimeScale();
  }
  private applyTimeScale(): void {
    const scale = this.paused || performance.now() < this.frozenUntil ? 0 : battleSpeed();
    this.time.timeScale = scale;
    this.tweens.timeScale = scale;
    for (const emitter of this.emitters.values()) emitter.timeScale = scale;
  }
  update(_time: number, delta: number): void {
    const element = this.field?.();
    if (element) {
      const box = element.getBoundingClientRect();
      this.fieldBox = { left: box.left, top: box.top, width: box.width, height: box.height };
      this.cameras.main.setScroll(-box.left, -box.top);
      this.dimRect.setSize(box.width, box.height);
      this.flashRect.setSize(box.width, box.height);
      this.focusRect.setSize(box.width, box.height);
    }
    if (this.frozenUntil && performance.now() >= this.frozenUntil) { this.frozenUntil = 0; this.applyTimeScale(); }
    this.fx.quality = this.quality;
    // The first frame after the loop wakes reports the whole sleep as its delta; overlays start from a normal frame.
    this.fx.advance((delta > 250 ? 1000 / 60 : delta) * this.time.timeScale);
    if (!this.active) return;
    this.recordFrame(delta);
  }
  private recordFrame(delta: number): void {
    const alive = this.aliveParticles();
    const stats = this.stats;
    stats.peakParticles = Math.max(stats.peakParticles, alive);
    stats.liveObjects = this.live.size;
    if (this.shaderKit && delta > 0) {
      this.kitSlowFrames = delta > kitSlowFrameMs ? this.kitSlowFrames + 1 : Math.max(0, this.kitSlowFrames - 1);
      if (this.kitSlowFrames >= kitSlowFrameLimit) this.dropShaderKit();
    }
    if (delta <= 0 || delta > 250) return;
    stats.activeFrames++;
    stats.maximumFrameMs = Math.max(stats.maximumFrameMs, delta);
    stats.averageFrameMs += (delta - stats.averageFrameMs) / stats.activeFrames;
    if (delta > 22) stats.slowFrames++;
    this.frameSamples.push(delta);
    if (this.frameSamples.length > 60) this.frameSamples.shift();
    // Sustained slow frames (one second over 22 ms on average) step down to low quality for the session.
    if (this.quality === 'high' && this.frameSamples.length === 60 &&
        this.frameSamples.reduce((sum, value) => sum + value, 0) / 60 > 22) {
      this.quality = 'low'; stats.quality = 'low'; stats.cap = particleCaps.low;
    }
  }
  private aliveParticles(): number {
    let alive = 0;
    for (const emitter of this.emitters.values()) alive += emitter.getAliveParticleCount();
    return alive;
  }
  /** Screen (viewport) coordinates to world coordinates (field-relative). */
  toWorld(point: Point): Point {
    const element = this.field?.();
    if (element) {
      const box = element.getBoundingClientRect();
      this.fieldBox = { left: box.left, top: box.top, width: box.width, height: box.height };
    }
    return { x: point.x - this.fieldBox.left, y: point.y - this.fieldBox.top };
  }

  // ---- lifetime bookkeeping -------------------------------------------------
  private begin(): void {
    this.pending++;
    if (!this.active) { this.active = true; this.onActivity?.(true); this.updateFieldNow(); }
  }
  private end(): void {
    this.pending = Math.max(0, this.pending - 1);
    if (this.pending) return;
    for (const resolve of this.idleWaiters.splice(0)) resolve();
    this.scheduleSleep();
  }
  /** Renders a few empty frames before sleeping so the transparent canvas is cleared. */
  private scheduleSleep(): void {
    window.setTimeout(() => {
      if (this.pending || !this.active) return;
      this.active = false; this.onActivity?.(false);
    }, 120);
  }
  private updateFieldNow(): void {
    const element = this.field?.();
    if (!element) return;
    const box = element.getBoundingClientRect();
    this.fieldBox = { left: box.left, top: box.top, width: box.width, height: box.height };
    this.cameras.main.setScroll(-box.left, -box.top);
    this.dimRect.setSize(box.width, box.height); this.flashRect.setSize(box.width, box.height);
    this.focusRect.setSize(box.width, box.height);
  }
  /** Keeps the scene awake for `ms` of scaled time, then runs `done`. */
  private hold(ms: number, done?: () => void): void {
    this.begin();
    const timer = this.time.delayedCall(ms, () => { this.timers.delete(timer); done?.(); this.end(); });
    this.timers.add(timer);
  }
  /** Resolves after `ms` of GPU time (scaled by battle speed, frozen by hit-stop and Settings). */
  wait(ms: number): Promise<void> {
    return new Promise(resolve => {
      let settled = false;
      const finish = () => { if (settled) return; settled = true; this.waits.delete(finish); resolve(); };
      this.waits.add(finish);
      this.hold(Math.max(0, ms), finish);
    });
  }
  idle(): Promise<void> {
    if (!this.pending) return Promise.resolve();
    return new Promise(resolve => this.idleWaiters.push(resolve));
  }
  private sprite(key: SpectacleTexture, at: Point, tint: number | null, depth = 10): Phaser.GameObjects.Image | null {
    if (!this.textures.exists(key)) return null;
    const image = this.add.image(at.x, at.y, key).setBlendMode(add).setDepth(depth);
    if (tint !== null) image.setTint(tint);
    this.live.add(image);
    return image;
  }
  /** Runs a tween that keeps the scene awake; `done(completed)` is false when Skip/Exit stopped it. */
  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig, done?: (completed: boolean) => void): void {
    this.begin();
    let finished = false;
    const finish = (completed: boolean) => {
      if (finished) return;
      finished = true; this.tweensLive.delete(tween); done?.(completed); this.end();
    };
    const tween = this.tweens.add({ ...config, onComplete: () => finish(true) });
    this.tweensLive.add(tween);
    tween.once(Phaser.Tweens.Events.TWEEN_STOP, () => finish(false));
  }
  private destroyLater(image: Phaser.GameObjects.Image): () => void {
    return () => { this.live.delete(image); image.destroy(); };
  }
  /** Pooled burst emitter for one element, tier and particle layer; created on first use. */
  private emitterFor(style: ElementStyle, kind: BurstKind, index: number, preset: SparkPreset):
    Phaser.GameObjects.Particles.ParticleEmitter | null {
    const key = `${style.id}:${kind}:${index}`;
    const existing = this.emitters.get(key);
    if (existing) return existing;
    if (!this.textures.exists(preset.texture)) return null;
    const { core, main, edge } = style.palette;
    const config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
      emitting: false, blendMode: add,
      angle: { min: preset.angle?.[0] ?? 0, max: preset.angle?.[1] ?? 360 },
      speed: { min: preset.speed[0], max: preset.speed[1] },
      lifespan: { min: preset.life[0], max: preset.life[1] },
      scale: { start: preset.scale[0], end: preset.scale[1] },
      alpha: { start: 1, end: 0 }, gravityY: preset.gravity ?? 0,
      rotate: preset.rotate === 'random' ? { min: 0, max: 360 } : preset.rotate === 'spin' ? tumble : 0,
      ...(style.ramp ? { color: [core, main, edge], colorEase: 'Quad.easeOut' } : {}),
    };
    const emitter = this.add.particles(0, 0, preset.texture, config).setDepth(20);
    emitter.timeScale = this.time.timeScale;
    this.emitters.set(key, emitter);
    return emitter;
  }
  private particles(kind: BurstKind, at: Point, style: ElementStyle, scale = 1): void {
    const factor = this.quality === 'low' ? lowQualityFactor : 1;
    let allowance = particleCaps[this.quality] - this.aliveParticles();
    let longest = 0;
    style.sparks[kind].forEach((preset, index) => {
      if (allowance <= 0) return;
      const emitter = this.emitterFor(style, kind, index, preset);
      if (!emitter) return;
      const count = Math.min(allowance, Math.max(1, Math.round(preset.count * factor * Math.min(1.6, Math.max(.6, scale)))));
      allowance -= count;
      if (!style.ramp) emitter.setParticleTint(style.palette.main);
      emitter.explode(count, at.x, at.y);
      longest = Math.max(longest, preset.life[1]);
    });
    if (longest) this.hold(longest);
    this.stats.peakParticles = Math.max(this.stats.peakParticles, this.aliveParticles());
  }

  // ---- primitives -------------------------------------------------------------
  /** Layered impact burst in the element's shapes at a screen point; `size` is the target's smaller side in px.
   * `intensity` (D-490) grows Convergent Light hits through the run; 1 elsewhere. */
  burst(screen: Point, kind: BurstKind, style: ElementStyle, size: number, intensity = 1): void {
    if (!this.ready) return;
    const at = this.toWorld(screen);
    const extent = Math.min(260, Math.max(70, size)) * Math.min(1.4, Math.max(.6, intensity));
    for (const layer of style.layers[kind]) {
      const image = this.sprite(layer.texture, at, toneColor(style, layer.tone));
      if (!image) continue;
      const target = extent * layer.size / textureEdge(layer.texture);
      const start = layer.spin ? Math.random() * Math.PI * 2 : 0;
      image.setScale(target * layer.from).setAlpha(layer.alpha).setRotation(start);
      if (layer.delay) image.setAlpha(0);
      this.tween({ targets: image, scale: target, alpha: { from: layer.alpha, to: 0 },
        rotation: start + (layer.spin ?? 0),
        delay: layer.delay ?? 0, duration: layer.life, ease: 'Cubic.easeOut' }, this.destroyLater(image));
    }
    this.particles(kind, at, style, extent / 160);
  }
  /** Wind-up (R1): the element's motes gather into the caster while a glow swells; skills turn a sigil underneath. */
  chargeAura(screen: Point, ms: number, style: ElementStyle, power: number): void {
    if (!this.ready || ms <= 0) return;
    const at = this.toWorld(screen);
    const { core: coreTone, main } = style.palette;
    const core = this.sprite('glow/point-bloom', at, coreTone, 6);
    if (core) {
      const size = (40 + 60 * power) / 256;
      core.setScale(size * .2).setAlpha(0);
      this.tween({ targets: core, scale: size, alpha: { from: .3, to: 1 }, duration: ms, ease: 'Quad.easeIn' },
        completed => {
          if (!completed) { this.destroyLater(core)(); return; }
          this.tween({ targets: core, alpha: 0, scale: size * 1.6, duration: 120, ease: 'Cubic.easeOut' }, this.destroyLater(core));
        });
    }
    const glow = this.sprite('glow/radial-bloom', at, main, 5);
    if (glow) {
      const size = (130 + 150 * power) / 256;
      glow.setScale(size * .3).setAlpha(0);
      this.tween({ targets: glow, scale: size, alpha: { from: .35, to: 1 }, duration: ms, ease: 'Sine.easeIn' },
        completed => {
          if (!completed) { this.destroyLater(glow)(); return; }
          // Release the glow quickly once the wind-up ends.
          this.tween({ targets: glow, alpha: 0, scale: size * 1.25, duration: 140, ease: 'Cubic.easeOut' }, this.destroyLater(glow));
        });
    }
    const sigil = style.sigil && power > 0 ? this.sprite(style.sigil, at, main, 4) : null;
    if (sigil && style.sigil) {
      const size = (110 + 90 * power) / textureEdge(style.sigil);
      const start = Math.random() * Math.PI * 2;
      sigil.setScale(size * .55).setAlpha(0).setRotation(start);
      this.tween({ targets: sigil, scale: size, alpha: { from: 0, to: .85 }, rotation: start + 1.2, duration: ms, ease: 'Sine.easeOut' },
        completed => {
          if (!completed) { this.destroyLater(sigil)(); return; }
          this.tween({ targets: sigil, alpha: 0, scale: size * 1.15, duration: 160, ease: 'Cubic.easeOut' }, this.destroyLater(sigil));
        });
    }
    const motes = Math.round((6 + 14 * power) * (this.quality === 'low' ? lowQualityFactor : 1));
    for (let index = 0; index < motes; index++) {
      const angle = (index / motes) * Math.PI * 2 + Math.random() * .4;
      const radius = 70 + 70 * power + Math.random() * 30;
      const kind = style.motes[index % 3 ? 0 : 1];
      const mote = this.sprite(kind.texture, { x: at.x + Math.cos(angle) * radius, y: at.y + Math.sin(angle) * radius }, main, 6);
      if (!mote) continue;
      mote.setScale(kind.px * (1 + Math.random()) / textureEdge(kind.texture)).setAlpha(0).setRotation(Math.random() * Math.PI * 2);
      const delay = Math.random() * ms * .35;
      this.tween({ targets: mote, x: at.x, y: at.y, alpha: { from: 1, to: .2 }, scale: mote.scale * .33,
        delay, duration: Math.max(60, ms - delay), ease: 'Quad.easeIn' }, this.destroyLater(mote));
    }
  }
  /** Travel (R1, ranged): the element's orb flies to the target, or its beam reaches across. */
  projectile(fromScreen: Point, toScreen: Point, ms: number, style: ElementStyle, power: number): void {
    if (!this.ready || ms <= 0) return;
    const from = this.toWorld(fromScreen), to = this.toWorld(toScreen);
    if (style.travel.kind === 'beam') { this.beam(from, to, ms, style, style.travel, power); return; }
    const travel = style.travel;
    const orb = this.sprite(travel.texture, from, style.palette.main, 15);
    const core = this.sprite('glow/point-bloom', from, style.palette.core, 16);
    const px = travel.px * (1 + power);
    const trailKey = `trail:${Math.random()}`;
    let trail: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    if (this.textures.exists(travel.trail)) {
      const { core: c, main, edge } = style.palette;
      trail = this.add.particles(0, 0, travel.trail, {
        frequency: 14, quantity: this.quality === 'low' ? 1 : 2, blendMode: add,
        ...(style.ramp ? { color: [c, main, edge] } : { tint: main }),
        lifespan: { min: 120, max: 220 }, speed: { min: 0, max: 40 },
        scale: { start: travel.trailPx * (1 + power * .66) / textureEdge(travel.trail), end: 0 },
        alpha: { start: .9, end: 0 }, rotate: { min: 0, max: 360 },
      }).setDepth(14);
      this.emitters.set(trailKey, trail);
      trail.timeScale = this.time.timeScale;
    }
    const followers = [orb, core].filter((image): image is Phaser.GameObjects.Image => !!image);
    const heading = Math.atan2(to.y - from.y, to.x - from.x);
    orb?.setScale(px / textureEdge(travel.texture)).setRotation(heading);
    core?.setScale(px * .8 / 256);
    if (trail && orb) trail.startFollow(orb);
    const arc = -Math.min(60, Math.abs(to.x - from.x) * .12);
    const state = { t: 0 };
    this.tween({ targets: state, t: 1, duration: ms, ease: 'Quad.easeIn',
      onUpdate: () => {
        const x = from.x + (to.x - from.x) * state.t, y = from.y + (to.y - from.y) * state.t + arc * Math.sin(Math.PI * state.t);
        for (const image of followers) image.setPosition(x, y);
        if (orb && travel.spin) orb.setRotation(heading + travel.spin * state.t);
      } }, completed => {
      for (const image of followers) this.destroyLater(image)();
      if (trail && !completed) { this.emitters.delete(trailKey); trail.destroy(); return; }
      if (trail) {
        trail.stopFollow(); trail.stop();
        // Let the trail's last sparks fade, then release the emitter.
        this.hold(240, () => { this.emitters.delete(trailKey); trail!.destroy(); });
      }
    });
  }
  /** Beam travel: reaches from caster to target within `grow` of the beat, holds (flickering for bolts), then fades. */
  private beam(from: Point, to: Point, ms: number, style: ElementStyle, travel: Extract<Travel, { kind: 'beam' }>, power: number): void {
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const thickness = travel.thickness * (1 + power * .6);
    // A thin white-hot line runs inside the element's beam (the streak texture is too tall for a core).
    const parts = ([[travel.texture, style.palette.main, 15, thickness], ['trails/trail-basic', style.palette.core, 16, 4 + 3 * power]] as const)
      .map(([key, tint, depth, thick]) => {
        const image = this.sprite(key, from, tint, depth);
        return image ? { image, scaleY: thick / 128 } : null;
      }).filter((part): part is { image: Phaser.GameObjects.Image; scaleY: number } => !!part);
    const full = length / 512;
    for (const { image, scaleY } of parts) image.setOrigin(0, .5).setRotation(angle).setScale(.001, scaleY);
    const state = { t: 0 };
    const grow = Math.max(.05, travel.grow);
    this.tween({ targets: state, t: 1, duration: ms,
      onUpdate: () => {
        const reach = Math.min(1, state.t / grow);
        const eased = 1 - Math.pow(1 - reach, 3);
        const alpha = travel.flicker ? .55 + .45 * Math.random() : 1;
        for (const { image } of parts) image.setScale(Math.max(.001, full * eased), image.scaleY).setAlpha(alpha);
      } }, completed => {
      for (const { image, scaleY } of parts) {
        if (!completed) { this.destroyLater(image)(); continue; }
        this.tween({ targets: image, alpha: 0, scaleY: scaleY * .3, duration: 140, ease: 'Quad.easeIn' }, this.destroyLater(image));
      }
    });
  }
  /** Travel (R1, melee): a bright cut sweeps across the target with the element's overlay along it. */
  slash(toScreen: Point, fromScreen: Point, ms: number, style: ElementStyle, power: number, size: number): void {
    if (!this.ready || ms <= 0) return;
    const to = this.toWorld(toScreen), from = this.toWorld(fromScreen);
    // One quick cut (two crossing cuts from Skill 2 up), drawn across the target and gone within the travel beat.
    const base = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 5 + (Math.random() - .5) * .5;
    const length = Math.min(240, Math.max(90, size * (.75 + power * .35)));
    const cuts = power >= .6 ? [base, base - Math.PI / 2.4] : [base];
    const strokes: [SpectacleTexture, number, number, number][] = [
      ...(style.overlay ? [[style.overlay, style.palette.main, 14, (30 + 24 * power) / 128] as [SpectacleTexture, number, number, number]] : []),
      ['beams/streak', style.palette.main, 15, (14 + 12 * power) / 128],
      ['trails/trail-basic', style.palette.core, 16, 5 / 128],
    ];
    cuts.forEach((angle, cut) => {
      const delay = cut * ms * .3;
      for (const [key, tint, depth, scaleY] of strokes) {
        const streak = this.sprite(key, to, tint, depth);
        if (!streak) continue;
        streak.setRotation(angle).setScale(.02, scaleY).setAlpha(0);
        this.tween({ targets: streak, scaleX: length / 512, alpha: { from: 1, to: 1 }, delay, duration: ms * .4,
          ease: 'Expo.easeOut' }, completed => {
          if (!completed) { this.destroyLater(streak)(); return; }
          this.tween({ targets: streak, alpha: 0, scaleY: scaleY * .2, duration: Math.max(60, ms * .45), ease: 'Quad.easeIn' },
            this.destroyLater(streak));
        });
      }
    });
  }
  /** Travel (R1, support): the element's ring pulses outward from the caster. */
  pulse(screen: Point, ms: number, style: ElementStyle, power: number): void {
    if (!this.ready || ms <= 0) return;
    const at = this.toWorld(screen);
    const ring = this.sprite(style.pulse, at, style.palette.main, 8);
    const glow = this.sprite('glow/soft-glow', at, style.palette.main, 7);
    const size = 240 + 160 * power;
    for (const image of [ring, glow]) {
      if (!image) continue;
      const end = (image === glow ? size * 1.4 / 512 : size / textureEdge(style.pulse));
      image.setScale(end * .2).setAlpha(1);
      this.tween({ targets: image, scale: end, alpha: 0, duration: ms + 160, ease: 'Cubic.easeOut' }, this.destroyLater(image));
    }
  }
  /** D-490 gather: light pulls inward onto a target just before the finisher (a reversed vortex plus the
   * wind-up aura at the target). */
  converge(screen: Point, ms: number, style: ElementStyle, power: number, size: number): void {
    if (!this.ready || ms <= 0) return;
    this.chargeAura(screen, ms, style, power);
    const at = this.toWorld(screen);
    const vortex = this.sprite('impacts/vortex-rings', at, style.palette.main, 9);
    if (!vortex) return;
    const end = Math.min(220, Math.max(80, size)) * .6 / 512;
    const start = Math.random() * Math.PI * 2;
    vortex.setScale(end * 2.6).setAlpha(0).setRotation(start);
    this.tween({ targets: vortex, scale: end, alpha: { from: .2, to: .95 }, rotation: start - 2.4, duration: ms, ease: 'Quad.easeIn' },
      completed => {
        if (!completed) { this.destroyLater(vortex)(); return; }
        this.tween({ targets: vortex, alpha: 0, scale: end * .4, duration: 90, ease: 'Quad.easeIn' }, this.destroyLater(vortex));
      });
  }
  /** D-490 finisher pillar: a column of light lands on the target with a ground flare at its base.
   * Built from soft glows stretched tall, so the column has no hard ends. */
  pillar(screen: Point, style: ElementStyle, power: number, size: number): void {
    if (!this.ready) return;
    const at = this.toWorld(screen);
    const extent = Math.min(260, Math.max(90, size));
    const height = Math.max(this.fieldBox.height, extent * 3) * 1.2;
    const base = { x: at.x, y: at.y + extent * .38 };
    const columns: [SpectacleTexture, number, number, number][] = [
      ['glow/soft-glow', style.palette.main, extent * (.7 + .3 * power), .95],
      ['glow/point-bloom', style.palette.core, extent * (.22 + .1 * power), 1],
    ];
    for (const [key, tint, width, alpha] of columns) {
      const column = this.sprite(key, { x: at.x, y: base.y - height / 2 }, tint, 18);
      if (!column) continue;
      const sx = width / textureEdge(key), sy = height / textureEdge(key);
      column.setScale(sx * .3, sy).setAlpha(alpha);
      this.tween({ targets: column, scaleX: sx, duration: 90, ease: 'Expo.easeOut' }, completed => {
        if (!completed) { this.destroyLater(column)(); return; }
        this.tween({ targets: column, scaleX: sx * .15, alpha: 0, duration: 380 + 180 * power, ease: 'Quad.easeIn' },
          this.destroyLater(column));
      });
    }
    const ground = this.sprite('impacts/impact-ellipse', base, style.palette.core, 19);
    if (ground) {
      const end = extent * (2 + power) / 512;
      ground.setScale(end * .3, end * .6).setAlpha(1);
      this.tween({ targets: ground, scaleX: end, scaleY: end, alpha: 0, duration: 520, ease: 'Cubic.easeOut' }, this.destroyLater(ground));
    }
  }
  /** D-490 finisher shockwave: one ring that races across the field from the struck point. */
  shockwave(screen: Point, style: ElementStyle, power: number): void {
    if (!this.ready) return;
    const at = this.toWorld(screen);
    const reach = Math.max(this.fieldBox.width, this.fieldBox.height, 400) * (.8 + .4 * power);
    const rings: [SpectacleTexture, number, number, number, number][] = [
      ['impacts/ring-concentric', style.palette.main, 12, .9, 560],
      ['impacts/ring-flare', style.palette.core, 13, .7, 420],
    ];
    for (const [key, tint, depth, alpha, life] of rings) {
      const ring = this.sprite(key, at, tint, depth);
      if (!ring) continue;
      const end = reach / textureEdge(key);
      ring.setScale(end * .08).setAlpha(alpha);
      this.tween({ targets: ring, scale: end, alpha: 0, duration: life + 160 * power, ease: 'Cubic.easeOut' }, this.destroyLater(ring));
    }
  }
  /** D-490 finisher lens flare: an anamorphic streak and a star glint over the struck point. */
  lensFlare(screen: Point, style: ElementStyle, power: number, size: number): void {
    if (!this.ready) return;
    const at = this.toWorld(screen);
    const extent = Math.min(260, Math.max(90, size));
    const parts: [SpectacleTexture, number, number, number, number][] = [
      ['glow/lens-flare', style.palette.core, extent * (3.2 + 1.6 * power), 520, 0],
      ['glow/star-flare', style.palette.main, extent * (1.4 + .6 * power), 440, .5],
    ];
    for (const [key, tint, width, life, spin] of parts) {
      const image = this.sprite(key, at, tint, 30);
      if (!image) continue;
      const end = width / textureEdge(key);
      image.setScale(end * .4).setAlpha(1);
      this.tween({ targets: image, scale: end, alpha: 0, rotation: spin, duration: life + 160 * power, ease: 'Cubic.easeOut' },
        this.destroyLater(image));
    }
  }
  /** D-490: deepens the field dim by `alpha` over `inMs`, then lifts over `outMs`. */
  focus(alpha: number, inMs: number, outMs: number): void {
    if (!this.ready || alpha <= 0) return;
    this.focusTween?.stop();
    this.begin();
    let done = false;
    const finish = () => { if (done) return; done = true; this.focusRect.setAlpha(0); this.end(); };
    this.focusTween = this.tweens.chain({ targets: this.focusRect, tweens: [
      { alpha, duration: Math.max(1, inMs), ease: 'Sine.easeIn' },
      { alpha: 0, duration: Math.max(1, outMs), ease: 'Sine.easeOut' },
    ], onComplete: finish });
    this.focusTween.once(Phaser.Tweens.Events.TWEEN_STOP, finish);
  }
  /** Full-field flash (R2): soft for Skill 2, full on a Convergent Light finisher. */
  flash(kind: 'soft' | 'full', ms: number): void {
    if (!this.ready) return;
    this.flashTween?.stop();
    // D-494 step 4: with the shader kit the edge bloom carries the impact (and bloom lifts this flat white),
    // so the full flash drops to keep damage numbers readable; without the kit it keeps its D-490 weight.
    this.flashRect.setAlpha(kind === 'full' ? (this.shaderKit ? .3 : .55) : .2);
    this.begin();
    let done = false;
    const finish = () => { if (done) return; done = true; this.flashRect.setAlpha(0); this.end(); };
    this.flashTween = this.tweens.add({ targets: this.flashRect, alpha: 0, duration: ms, ease: 'Quad.easeOut', onComplete: finish });
    this.flashTween.once(Phaser.Tweens.Events.TWEEN_STOP, finish);
  }
  /** Field dim (R2, Convergent Light): fades in, holds, fades out. */
  dim(alpha: number, inMs: number, holdMs: number, outMs: number): void {
    if (!this.ready || alpha <= 0) return;
    this.dimTween?.stop();
    this.begin();
    let done = false;
    const finish = () => { if (done) return; done = true; this.dimRect.setAlpha(0); this.end(); };
    this.dimTween = this.tweens.chain({ targets: this.dimRect, tweens: [
      { alpha, duration: inMs, ease: 'Sine.easeOut' },
      { alpha, duration: holdMs },
      { alpha: 0, duration: outMs, ease: 'Sine.easeIn' },
    ], onComplete: finish });
    this.dimTween.once(Phaser.Tweens.Events.TWEEN_STOP, finish);
  }

  // ---- shader kit overlays (D-494) --------------------------------------------
  /** Flat flashes and full edge blooms share one WCAG budget (R6). */
  shareFlashGovernor(governor: FlashGovernor): void { this.fx.governor = governor; }
  /** Light pours in from the field's (or screen's) edges. Returns the strength played; a refused `full` plays `soft`. */
  edgeBloom(options: EdgeBloomOptions): EdgeStrength | null {
    if (!this.ready || !this.shaderKit) return null;
    // Begin first: a displaced overlay ends inside the call and must not make the scene look idle.
    this.begin();
    const played = this.fx.edgeBloom(options);
    if (!played) this.end();
    return played;
  }
  private overlay(added: () => boolean): void {
    if (!this.ready || !this.shaderKit) return;
    this.begin();
    if (!added()) this.end();
  }
  /** Turning light shafts from a screen point. */
  godRays(options: GodRaysOptions): void {
    this.overlay(() => this.fx.godRays({ ...options, at: this.toWorld(options.at) }));
  }
  /** Chromatic shock ring at a screen point (critical hits). */
  critFlash(options: CritFlashOptions): void {
    this.overlay(() => this.fx.critFlash({ ...options, at: this.toWorld(options.at) }));
  }
  /** The element's light language in a soft disc around a screen point. */
  veil(options: VeilOptions): void {
    this.overlay(() => this.fx.veil({ ...options, at: this.toWorld(options.at) }));
  }

  /** Ends every live effect now (Skip, Exit, Retry). Pending waits resolve. */
  cancelAll(): void {
    this.fx.clear();
    for (const tween of [...this.tweensLive]) tween.stop();
    this.tweensLive.clear();
    this.dimTween?.stop(); this.flashTween?.stop(); this.focusTween?.stop();
    this.dimTween = null; this.flashTween = null; this.focusTween = null;
    this.dimRect?.setAlpha(0); this.flashRect?.setAlpha(0); this.focusRect?.setAlpha(0);
    for (const timer of [...this.timers]) timer.remove(false);
    this.timers.clear();
    for (const [key, emitter] of [...this.emitters]) {
      emitter.killAll();
      if (key.startsWith('trail:')) { emitter.destroy(); this.emitters.delete(key); }
    }
    for (const object of [...this.live]) object.destroy();
    this.live.clear();
    for (const finish of [...this.waits]) finish();
    this.waits.clear();
    this.frozenUntil = 0;
    this.pending = 0;
    for (const resolve of this.idleWaiters.splice(0)) resolve();
    this.applyTimeScale();
    if (this.active) this.scheduleSleep();
  }
}
