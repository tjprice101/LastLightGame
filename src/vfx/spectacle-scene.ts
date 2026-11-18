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
import { spectacleTextures, spectacleTextureUrl, type SpectacleTexture } from './vfx-textures';
import { battleSpeed } from '../presentation/battle-speed';

export interface Point { x: number; y: number }
export type BurstKind = 'normal' | 'skill1' | 'skill2' | 'flare' | 'finisher' | 'support' | 'enemy' | 'status';
export type Quality = 'high' | 'low';
/** R7: live particle cap; low quality scales counts, never the look. */
export const particleCaps: Record<Quality, number> = { high: 700, low: 300 };
const lowQualityFactor = .45;

interface SparkPreset {
  texture: SpectacleTexture;
  count: number;
  speed: [number, number];
  life: [number, number];
  scale: [number, number];
  gravity?: number;
}
/** Spark layers per burst kind (world px and ms at speed 1). */
const sparkPresets: Record<BurstKind, SparkPreset[]> = {
  normal: [{ texture: 'particles/star-hard', count: 10, speed: [140, 320], life: [160, 260], scale: [.9, 0] }],
  skill1: [
    { texture: 'particles/star-hard', count: 18, speed: [180, 420], life: [220, 380], scale: [1.1, 0] },
    { texture: 'particles/star-thin', count: 8, speed: [260, 520], life: [180, 300], scale: [1.6, 0] },
  ],
  skill2: [
    { texture: 'particles/star-hard', count: 30, speed: [220, 520], life: [260, 480], scale: [1.3, 0] },
    { texture: 'particles/star-thin', count: 12, speed: [320, 640], life: [220, 360], scale: [2, 0] },
    { texture: 'particles/crystal-shard', count: 8, speed: [160, 360], life: [320, 520], scale: [.35, 0], gravity: 420 },
  ],
  flare: [
    { texture: 'particles/star-hard', count: 16, speed: [200, 460], life: [200, 340], scale: [1.2, 0] },
    { texture: 'particles/star-thin', count: 6, speed: [300, 560], life: [160, 280], scale: [1.8, 0] },
  ],
  finisher: [
    { texture: 'particles/star-hard', count: 60, speed: [260, 760], life: [320, 620], scale: [1.5, 0] },
    { texture: 'particles/star-thin', count: 20, speed: [420, 900], life: [260, 440], scale: [2.4, 0] },
    { texture: 'particles/crystal-shard', count: 14, speed: [220, 520], life: [420, 680], scale: [.45, 0], gravity: 520 },
  ],
  support: [{ texture: 'particles/star-soft', count: 14, speed: [40, 120], life: [360, 560], scale: [1.4, 0], gravity: -220 }],
  enemy: [{ texture: 'particles/star-hard', count: 12, speed: [140, 340], life: [180, 300], scale: [1, 0] }],
  status: [{ texture: 'particles/star-soft', count: 6, speed: [30, 90], life: [260, 400], scale: [1.1, 0], gravity: -160 }],
};
interface Layer {
  texture: SpectacleTexture;
  /** Final size as a fraction of the target's smaller side. */
  size: number;
  from: number;
  alpha: number;
  life: number;
  white?: boolean;
  spin?: boolean;
  delay?: number;
}
/** Sprite layers per burst kind: a white-hot core plus tinted rings, streaks and bursts. */
const burstLayers: Record<BurstKind, Layer[]> = {
  normal: [
    { texture: 'glow/point-bloom', size: .9, from: .2, alpha: 1, life: 200, white: true },
    { texture: 'impacts/ring-concentric', size: .8, from: .15, alpha: .8, life: 240 },
  ],
  skill1: [
    { texture: 'glow/point-bloom', size: 1.2, from: .2, alpha: 1, life: 260, white: true },
    { texture: 'impacts/radial-streaks-fade', size: 1.3, from: .3, alpha: .9, life: 320, spin: true },
    { texture: 'impacts/ring-concentric', size: 1.1, from: .15, alpha: .85, life: 380 },
  ],
  skill2: [
    { texture: 'glow/radial-bloom', size: 1.8, from: .3, alpha: .75, life: 420 },
    { texture: 'glow/point-bloom', size: 1.4, from: .2, alpha: 1, life: 300, white: true },
    { texture: 'impacts/flare-burst', size: 1.6, from: .3, alpha: .95, life: 420, spin: true },
    { texture: 'impacts/ring-flare', size: 1.5, from: .2, alpha: .9, life: 500 },
    { texture: 'impacts/ring-concentric', size: 1.9, from: .3, alpha: .6, life: 560, delay: 80 },
  ],
  // Each Convergent Light hit is at least Skill 2 sized; the finisher escalates past it.
  flare: [
    { texture: 'glow/radial-bloom', size: 1.9, from: .4, alpha: .7, life: 320 },
    { texture: 'glow/point-bloom', size: 1.5, from: .3, alpha: 1, life: 240, white: true },
    { texture: 'impacts/radial-spikes', size: 1.9, from: .4, alpha: .9, life: 300, spin: true },
    { texture: 'impacts/ring-concentric', size: 1.7, from: .3, alpha: .7, life: 360 },
  ],
  finisher: [
    { texture: 'glow/radial-bloom', size: 2.8, from: .4, alpha: .9, life: 620 },
    { texture: 'flares/starburst-8point', size: 2.4, from: .3, alpha: 1, life: 420, white: true, spin: true },
    { texture: 'impacts/shatter-burst', size: 2.2, from: .4, alpha: .95, life: 560, spin: true },
    { texture: 'flares/supernova', size: 2.6, from: .3, alpha: .9, life: 640 },
    { texture: 'impacts/ring-concentric', size: 3.4, from: .4, alpha: .7, life: 700, delay: 60 },
  ],
  support: [
    { texture: 'glow/soft-glow', size: 1.3, from: .6, alpha: .7, life: 520 },
    { texture: 'impacts/ring-flare', size: 1.1, from: .5, alpha: .7, life: 520 },
  ],
  enemy: [
    { texture: 'glow/point-bloom', size: 1, from: .2, alpha: .9, life: 220, white: true },
    { texture: 'impacts/radial-streaks-fade', size: 1.1, from: .3, alpha: .7, life: 280, spin: true },
  ],
  status: [{ texture: 'glow/soft-glow', size: .8, from: .5, alpha: .55, life: 380 }],
};
/** Pixel sizes of the textures' longest edge (tools/intake_vfx_library.py). */
function textureEdge(key: SpectacleTexture): number {
  if (key === 'particles/star-hard' || key === 'particles/star-soft' || key === 'particles/star-thin') return 32;
  const category = key.split('/')[0];
  return category === 'particles' ? 128 : category === 'glow' || category === 'flares' || category === 'projectiles' ? 256 : 512;
}
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
  private dimTween: Phaser.Tweens.BaseTween | null = null;
  private flashTween: Phaser.Tweens.BaseTween | null = null;
  private frameSamples: number[] = [];
  readonly stats: SpectacleStats;
  private readonly speedChange = () => this.applyTimeScale();

  constructor() {
    super({ key: 'spectacle', active: true });
    const navigatorInfo = navigator as Navigator & { deviceMemory?: number };
    this.quality = (navigator.hardwareConcurrency || 8) <= 4 || (navigatorInfo.deviceMemory ?? 8) <= 4 ? 'low' : 'high';
    this.stats = { quality: this.quality, cap: particleCaps[this.quality], peakParticles: 0, activeFrames: 0,
      averageFrameMs: 0, maximumFrameMs: 0, slowFrames: 0, liveObjects: 0 };
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
    }
    this.dimRect = this.add.rectangle(0, 0, 1, 1, 0x05060c, 1).setOrigin(0).setDepth(-10).setAlpha(0);
    this.flashRect = this.add.rectangle(0, 0, 1, 1, 0xffffff, 1).setOrigin(0).setDepth(100).setBlendMode(add).setAlpha(0);
    window.addEventListener('last-light-battle-speed-change', this.speedChange);
    this.events.once(Phaser.Scenes.Events.DESTROY, () => window.removeEventListener('last-light-battle-speed-change', this.speedChange));
    const finish = () => {
      this.alphaFromLuminance();
      for (const [preset, layers] of Object.entries(sparkPresets)) layers.forEach((layer, index) => {
        if (!this.textures.exists(layer.texture)) return;
        const emitter = this.add.particles(0, 0, layer.texture, {
          emitting: false, blendMode: add, angle: { min: 0, max: 360 },
          speed: { min: layer.speed[0], max: layer.speed[1] },
          lifespan: { min: layer.life[0], max: layer.life[1] },
          scale: { start: layer.scale[0], end: layer.scale[1] },
          alpha: { start: 1, end: 0 }, gravityY: layer.gravity ?? 0,
          rotate: layer.texture === 'particles/crystal-shard' ? { min: 0, max: 360 } : 0,
        }).setDepth(20);
        this.emitters.set(`${preset}:${index}`, emitter);
      });
      this.warmUp(() => { this.ready = true; this.applyTimeScale(); this.onReady?.(); });
    };
    if (!this.failed.length) { finish(); return; }
    // One PNG retry for any texture whose preferred format failed to decode.
    const retry = this.failed.splice(0);
    for (const key of retry) this.load.image(key, spectacleTextureUrl(key, 'png'));
    this.load.once(Phaser.Loader.Events.COMPLETE, finish);
    this.load.start();
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
    }
    if (this.frozenUntil && performance.now() >= this.frozenUntil) { this.frozenUntil = 0; this.applyTimeScale(); }
    if (!this.active) return;
    this.recordFrame(delta);
  }
  private recordFrame(delta: number): void {
    const alive = this.aliveParticles();
    const stats = this.stats;
    stats.peakParticles = Math.max(stats.peakParticles, alive);
    stats.liveObjects = this.live.size;
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
  private particles(kind: BurstKind, at: Point, tint: number, scale = 1): void {
    const factor = this.quality === 'low' ? lowQualityFactor : 1;
    let allowance = particleCaps[this.quality] - this.aliveParticles();
    let longest = 0;
    sparkPresets[kind].forEach((preset, index) => {
      const emitter = this.emitters.get(`${kind}:${index}`);
      if (!emitter || allowance <= 0) return;
      const count = Math.min(allowance, Math.max(1, Math.round(preset.count * factor * Math.min(1.6, Math.max(.6, scale)))));
      allowance -= count;
      emitter.setParticleTint(tint);
      emitter.explode(count, at.x, at.y);
      longest = Math.max(longest, preset.life[1]);
    });
    if (longest) this.hold(longest);
    this.stats.peakParticles = Math.max(this.stats.peakParticles, this.aliveParticles());
  }

  // ---- primitives -------------------------------------------------------------
  /** Layered impact burst at a screen point; `size` is the target's smaller side in px. */
  burst(screen: Point, kind: BurstKind, tint: number, size: number): void {
    if (!this.ready) return;
    const at = this.toWorld(screen);
    const extent = Math.min(260, Math.max(70, size));
    for (const layer of burstLayers[kind]) {
      const image = this.sprite(layer.texture, at, layer.white ? 0xffffff : tint);
      if (!image) continue;
      const target = extent * layer.size / textureEdge(layer.texture);
      image.setScale(target * layer.from).setAlpha(layer.alpha).setRotation(layer.spin ? Math.random() * Math.PI * 2 : 0);
      if (layer.delay) image.setAlpha(0);
      this.tween({ targets: image, scale: target, alpha: { from: layer.alpha, to: 0 },
        rotation: layer.spin ? image.rotation + .6 : image.rotation,
        delay: layer.delay ?? 0, duration: layer.life, ease: 'Cubic.easeOut' }, this.destroyLater(image));
    }
    this.particles(kind, at, tint, extent / 160);
  }
  /** Wind-up (R1): particles gather into the caster while a glow swells. */
  chargeAura(screen: Point, ms: number, tint: number, power: number): void {
    if (!this.ready || ms <= 0) return;
    const at = this.toWorld(screen);
    const core = this.sprite('glow/point-bloom', at, 0xffffff, 6);
    if (core) {
      const size = (40 + 60 * power) / 256;
      core.setScale(size * .2).setAlpha(0);
      this.tween({ targets: core, scale: size, alpha: { from: .3, to: 1 }, duration: ms, ease: 'Quad.easeIn' },
        completed => {
          if (!completed) { this.destroyLater(core)(); return; }
          this.tween({ targets: core, alpha: 0, scale: size * 1.6, duration: 120, ease: 'Cubic.easeOut' }, this.destroyLater(core));
        });
    }
    const glow = this.sprite('glow/radial-bloom', at, tint, 5);
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
    const motes = Math.round((6 + 14 * power) * (this.quality === 'low' ? lowQualityFactor : 1));
    for (let index = 0; index < motes; index++) {
      const angle = (index / motes) * Math.PI * 2 + Math.random() * .4;
      const radius = 70 + 70 * power + Math.random() * 30;
      const mote = this.sprite(index % 3 ? 'particles/star-soft' : 'particles/star-hard',
        { x: at.x + Math.cos(angle) * radius, y: at.y + Math.sin(angle) * radius }, tint, 6);
      if (!mote) continue;
      mote.setScale(.9 + Math.random() * .9).setAlpha(0);
      const delay = Math.random() * ms * .35;
      this.tween({ targets: mote, x: at.x, y: at.y, alpha: { from: 1, to: .2 }, scale: .3,
        delay, duration: Math.max(60, ms - delay), ease: 'Quad.easeIn' }, this.destroyLater(mote));
    }
  }
  /** Travel (R1, ranged): a glowing orb with a spark trail flies from caster to target. */
  projectile(fromScreen: Point, toScreen: Point, ms: number, tint: number, power: number): void {
    if (!this.ready || ms <= 0) return;
    const from = this.toWorld(fromScreen), to = this.toWorld(toScreen);
    const orb = this.sprite('projectiles/gyre-orb', from, tint, 15);
    const core = this.sprite('glow/point-bloom', from, 0xffffff, 16);
    const size = (26 + 26 * power) / 256;
    const trailKey = `trail:${Math.random()}`;
    let trail: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    if (this.textures.exists('particles/star-soft')) {
      trail = this.add.particles(0, 0, 'particles/star-soft', {
        frequency: 14, quantity: this.quality === 'low' ? 1 : 2, blendMode: add, tint,
        lifespan: { min: 120, max: 220 }, speed: { min: 0, max: 40 }, scale: { start: .9 + power * .6, end: 0 },
        alpha: { start: .9, end: 0 },
      }).setDepth(14);
      this.emitters.set(trailKey, trail);
      trail.timeScale = this.time.timeScale;
    }
    const followers = [orb, core].filter((image): image is Phaser.GameObjects.Image => !!image);
    orb?.setScale(size).setRotation(Math.atan2(to.y - from.y, to.x - from.x));
    core?.setScale(size * .8);
    if (trail && orb) trail.startFollow(orb);
    const arc = -Math.min(60, Math.abs(to.x - from.x) * .12);
    const state = { t: 0 };
    this.tween({ targets: state, t: 1, duration: ms, ease: 'Quad.easeIn',
      onUpdate: () => {
        const x = from.x + (to.x - from.x) * state.t, y = from.y + (to.y - from.y) * state.t + arc * Math.sin(Math.PI * state.t);
        for (const image of followers) image.setPosition(x, y);
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
  /** Travel (R1, melee): a bright slash streak sweeps across the target. */
  slash(toScreen: Point, fromScreen: Point, ms: number, tint: number, power: number, size: number): void {
    if (!this.ready || ms <= 0) return;
    const to = this.toWorld(toScreen), from = this.toWorld(fromScreen);
    // One quick cut (two crossing cuts from Skill 2 up), drawn across the target and gone within the travel beat.
    const base = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 5 + (Math.random() - .5) * .5;
    const length = Math.min(240, Math.max(90, size * (.75 + power * .35)));
    const cuts = power >= .6 ? [base, base - Math.PI / 2.4] : [base];
    cuts.forEach((angle, cut) => {
      const delay = cut * ms * .3;
      for (const [key, white, depth] of [['beams/streak', false, 15], ['trails/trail-basic', true, 16]] as const) {
        const streak = this.sprite(key, to, white ? 0xffffff : tint, depth);
        if (!streak) continue;
        const scaleY = (white ? 5 : 14 + 12 * power) / 128;
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
  /** Travel (R1, support): a soft pulse rings outward from the caster. */
  pulse(screen: Point, ms: number, tint: number, power: number): void {
    if (!this.ready || ms <= 0) return;
    const at = this.toWorld(screen);
    const ring = this.sprite('impacts/ring-flare', at, tint, 8);
    const glow = this.sprite('glow/soft-glow', at, tint, 7);
    const size = (160 + 120 * power) / 512;
    for (const image of [ring, glow]) {
      if (!image) continue;
      const end = image === glow ? size * 1.4 : size;
      image.setScale(end * .2).setAlpha(.9);
      this.tween({ targets: image, scale: end, alpha: 0, duration: ms + 160, ease: 'Cubic.easeOut' }, this.destroyLater(image));
    }
  }
  /** Full-field flash (R2): soft for Skill 2, full on a Convergent Light finisher. */
  flash(kind: 'soft' | 'full', ms: number): void {
    if (!this.ready) return;
    this.flashTween?.stop();
    this.flashRect.setAlpha(kind === 'full' ? .55 : .2);
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
  /** Ends every live effect now (Skip, Exit, Retry). Pending waits resolve. */
  cancelAll(): void {
    for (const tween of [...this.tweensLive]) tween.stop();
    this.tweensLive.clear();
    this.dimTween?.stop(); this.flashTween?.stop();
    this.dimTween = null; this.flashTween = null;
    this.dimRect?.setAlpha(0); this.flashRect?.setAlpha(0);
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
