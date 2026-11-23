/**
 * Battle Spectacle shader kit state (D-494). Phaser-free: holds the live light
 * overlays, advances them on the scene's scaled clock (battle speed, hit-stop,
 * Settings pause) and packs them into the composite shader's uniforms
 * (glsl.ts). Presentation only: finite, no gameplay value, no gameplay RNG.
 *
 * Points and radii are field-relative pixels (the scene's world space); `pack`
 * converts them to canvas pixels each frame, so overlays follow the field.
 */
import type { FlashGovernor } from '../spectacle-timing';
import type { ElementPalette } from '../element-styles';

export type FxQuality = 'high' | 'low';
/** Simultaneous overlays per kind; must match the array sizes in glsl.ts. */
export const fxSlots = { edge: 2, rays: 1, crit: 3, veil: 4 } as const;
/** Order is the shader's mode index. */
export const veilModes = ['infernic', 'oceanic', 'atmospheric', 'botanic', 'tranquilitic', 'chaotic'] as const;
export type VeilMode = (typeof veilModes)[number];
export function veilMode(elementId: string | null | undefined): VeilMode | null {
  return veilModes.includes(elementId as VeilMode) ? elementId as VeilMode : null;
}

export interface BloomSettings {
  /** Brightness where bloom starts, and the width of the soft knee above it. */
  threshold: number; knee: number;
  strength: number;
  /** One horizontal + vertical blur pair per entry, at this texel spread. */
  spreads: readonly number[];
  /** Noise octaves for the overlays. */
  octaves: number;
}
/** R7: low quality is cheaper (one blur pair, two octaves), not a different look. */
export const bloomSettings: Readonly<Record<FxQuality, BloomSettings>> = {
  high: { threshold: .55, knee: .35, strength: .7, spreads: [1, 2.4], octaves: 4 },
  low: { threshold: .55, knee: .35, strength: .7, spreads: [1.8], octaves: 2 },
};
/** How much each kind of light also covers the page (alpha), so its color holds on bright backgrounds
 * instead of washing out to white: edge bloom, god rays, critical ring, element veil. */
export const lightBody: readonly [number, number, number, number] = [.75, .55, .3, .4];

/** Software WebGL (no GPU acceleration) runs the post pass at a few frames a second; the kit stays off there. */
export function softwareRenderer(name: string | null | undefined): boolean {
  return /swiftshader|llvmpipe|software|basic render/i.test(name ?? '');
}
/** Runtime guard: this many slow frames (net of fast ones) with the kit on turns it off for the session. */
export const kitSlowFrameMs = 50;
export const kitSlowFrameLimit = 12;

export interface FxPoint { x: number; y: number }
export type EdgeStrength = 'soft' | 'full';
const edgePresets: Record<EdgeStrength, { intensity: number; reach: number; rim: number }> = {
  soft: { intensity: .5, reach: .16, rim: .2 },
  full: { intensity: 1, reach: .26, rim: .5 },
};

export interface EdgeBloomOptions {
  color: number;
  /** `full` counts as a full flash and passes the WCAG governor; refused requests play as `soft`. */
  strength: EdgeStrength;
  /** The battlefield (default) or the whole canvas (Ultimate takeover). */
  area?: 'field' | 'screen';
  /** Multiplies the preset's intensity (0 to 1.5). */
  intensity?: number;
  /** How far light reaches in, as a fraction of the area's smaller side. */
  reach?: number;
  /** 0 = an even frame of light, 1 = strongly streaked along each edge. */
  streaks?: number;
  attackMs?: number; holdMs?: number; decayMs?: number;
}
export interface GodRaysOptions {
  at: FxPoint; color: number;
  /** Shaft length in px. */
  radius: number;
  intensity?: number;
  /** Shaft count scale, turn speed in radians per second, and core brightness. */
  density?: number; spin?: number; core?: number;
  attackMs?: number; holdMs?: number; decayMs?: number;
}
export interface CritFlashOptions {
  at: FxPoint; color: number;
  /** Final ring radius in px. */
  radius: number;
  ms?: number; intensity?: number;
}
export interface VeilOptions {
  at: FxPoint; radius: number; mode: VeilMode; palette: ElementPalette;
  ms?: number; intensity?: number;
}

interface Live { elapsed: number; life: number; seed: number }
interface Edge extends Live { color: number; screen: boolean; intensity: number; reach: number; streaks: number; rim: number;
  attack: number; hold: number; decay: number }
interface Rays extends Live { at: FxPoint; color: number; radius: number; intensity: number; density: number; spin: number;
  core: number; attack: number; hold: number; decay: number }
interface Crit extends Live { at: FxPoint; color: number; radius: number; intensity: number }
interface Veil extends Live { at: FxPoint; radius: number; mode: number; palette: ElementPalette; intensity: number }

/** Where the field sits on the canvas this frame (canvas px, top-left origin). */
export interface FxView { fieldLeft: number; fieldTop: number; fieldWidth: number; fieldHeight: number; width: number; height: number }
export interface FxUniforms {
  time: number;
  edgeRect: Float32Array; edgeColor: Float32Array; edgeShape: Float32Array;
  rayA: Float32Array; rayB: Float32Array; rayColor: Float32Array;
  critA: Float32Array; critB: Float32Array; critColor: Float32Array;
  veilA: Float32Array; veilB: Float32Array; veilCore: Float32Array; veilMain: Float32Array; veilEdge: Float32Array;
}

/** Fast rise (ease-out), hold, then an ease-in fall; 0 outside its life. */
export function envelope(elapsed: number, attack: number, hold: number, decay: number): number {
  if (elapsed < 0) return 0;
  if (elapsed < attack) { const t = 1 - elapsed / attack; return 1 - t * t; }
  if (elapsed < attack + hold) return 1;
  const t = 1 - (elapsed - attack - hold) / Math.max(1, decay);
  return t <= 0 ? 0 : t * t;
}
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
function rgb(target: Float32Array, offset: number, color: number, alpha: number): void {
  target[offset] = ((color >> 16) & 255) / 255;
  target[offset + 1] = ((color >> 8) & 255) / 255;
  target[offset + 2] = (color & 255) / 255;
  target[offset + 3] = alpha;
}

export class SpectacleFxState {
  quality: FxQuality = 'high';
  /** Shared with the flat flashes so both stay within three full flashes a second (R6). */
  governor: FlashGovernor | null = null;
  /** Called once for every overlay that finishes or is displaced (not on `clear`). */
  onEnd: (() => void) | null = null;
  private edges: Edge[] = [];
  private rays: Rays[] = [];
  private crits: Crit[] = [];
  private veils: Veil[] = [];
  private seconds = 0;
  private readonly uniforms: FxUniforms = {
    time: 0,
    edgeRect: new Float32Array(fxSlots.edge * 4), edgeColor: new Float32Array(fxSlots.edge * 4),
    edgeShape: new Float32Array(fxSlots.edge * 4),
    rayA: new Float32Array(4), rayB: new Float32Array(4), rayColor: new Float32Array(4),
    critA: new Float32Array(fxSlots.crit * 4), critB: new Float32Array(fxSlots.crit * 4),
    critColor: new Float32Array(fxSlots.crit * 4),
    veilA: new Float32Array(fxSlots.veil * 4), veilB: new Float32Array(fxSlots.veil * 4),
    veilCore: new Float32Array(fxSlots.veil * 4), veilMain: new Float32Array(fxSlots.veil * 4),
    veilEdge: new Float32Array(fxSlots.veil * 4),
  };

  constructor(private readonly random: () => number = Math.random,
    private readonly now: () => number = () => performance.now()) {}

  get active(): boolean { return this.count > 0; }
  get count(): number { return this.edges.length + this.rays.length + this.crits.length + this.veils.length; }

  /** Adds to a slot list; when it is full, the overlay nearest its end gives way. */
  private push<T extends Live>(list: T[], limit: number, effect: T): void {
    if (list.length >= limit) {
      let oldest = 0;
      list.forEach((item, index) => { if (item.elapsed / item.life > list[oldest].elapsed / list[oldest].life) oldest = index; });
      list.splice(oldest, 1);
      this.onEnd?.();
    }
    list.push(effect);
  }
  private seed(): number { return this.random() * 40; }

  /** Light pours in from the edges of the field or screen. Returns the strength actually played. */
  edgeBloom(options: EdgeBloomOptions): EdgeStrength | null {
    const scale = clamp(options.intensity ?? 1, 0, 1.5);
    if (scale <= 0) return null;
    const strength: EdgeStrength = options.strength === 'full' && this.governor
      && this.governor.request('full', this.now()) !== 'full' ? 'soft' : options.strength;
    const preset = edgePresets[strength];
    const attack = Math.max(0, options.attackMs ?? 70), hold = Math.max(0, options.holdMs ?? 60);
    const decay = Math.max(1, options.decayMs ?? (strength === 'full' ? 420 : 300));
    this.push(this.edges, fxSlots.edge, {
      elapsed: 0, life: attack + hold + decay, seed: this.seed(), color: options.color, screen: options.area === 'screen',
      intensity: preset.intensity * scale, reach: clamp(options.reach ?? preset.reach, .04, .5),
      streaks: clamp(options.streaks ?? .8, 0, 1), rim: preset.rim, attack, hold, decay,
    });
    return strength;
  }
  /** Turning light shafts from a point (the Convergent Light gather). */
  godRays(options: GodRaysOptions): boolean {
    const intensity = clamp(options.intensity ?? 1, 0, 1.5);
    if (intensity <= 0 || options.radius <= 0) return false;
    const attack = Math.max(0, options.attackMs ?? 140), hold = Math.max(0, options.holdMs ?? 200);
    const decay = Math.max(1, options.decayMs ?? 280);
    this.push(this.rays, fxSlots.rays, {
      elapsed: 0, life: attack + hold + decay, seed: this.seed(), at: { ...options.at }, color: options.color,
      radius: options.radius, intensity, density: clamp(options.density ?? 3.2, .5, 6), spin: options.spin ?? .5,
      core: clamp(options.core ?? 1, 0, 2), attack, hold, decay,
    });
    return true;
  }
  /** A fast chromatic shock ring at a critical hit. */
  critFlash(options: CritFlashOptions): boolean {
    const intensity = clamp(options.intensity ?? 1, 0, 1.5);
    if (intensity <= 0 || options.radius <= 0) return false;
    this.push(this.crits, fxSlots.crit, {
      elapsed: 0, life: Math.max(1, options.ms ?? 320), seed: this.seed(), at: { ...options.at }, color: options.color,
      radius: options.radius, intensity,
    });
    return true;
  }
  /** The element's own light language in a soft disc around a point. */
  veil(options: VeilOptions): boolean {
    const intensity = clamp(options.intensity ?? 1, 0, 1.5);
    if (intensity <= 0 || options.radius <= 0) return false;
    this.push(this.veils, fxSlots.veil, {
      elapsed: 0, life: Math.max(1, options.ms ?? 520), seed: this.seed(), at: { ...options.at }, radius: options.radius,
      mode: veilModes.indexOf(options.mode), palette: options.palette, intensity,
    });
    return true;
  }

  /** Moves every overlay forward by scaled milliseconds and retires the finished ones. */
  advance(deltaMs: number): void {
    if (deltaMs <= 0 || !this.active) return;
    this.seconds = (this.seconds + deltaMs / 1000) % 600;
    for (const list of [this.edges, this.rays, this.crits, this.veils] as Live[][]) {
      for (let index = list.length - 1; index >= 0; index--) {
        list[index].elapsed += deltaMs;
        if (list[index].elapsed < list[index].life) continue;
        list.splice(index, 1);
        this.onEnd?.();
      }
    }
  }
  /** Skip, Exit, Retry: every overlay stops now. The owner resets its own bookkeeping. */
  clear(): void {
    this.edges.length = 0; this.rays.length = 0; this.crits.length = 0; this.veils.length = 0;
  }

  /** Uniform values for this frame. The returned arrays are reused between calls. */
  pack(view: FxView): FxUniforms {
    const u = this.uniforms;
    u.time = this.seconds;
    for (const array of [u.edgeRect, u.edgeColor, u.edgeShape, u.rayA, u.rayB, u.rayColor, u.critA, u.critB, u.critColor,
      u.veilA, u.veilB, u.veilCore, u.veilMain, u.veilEdge]) array.fill(0);
    const x = (point: FxPoint) => point.x + view.fieldLeft, y = (point: FxPoint) => point.y + view.fieldTop;
    this.edges.forEach((edge, index) => {
      const at = index * 4;
      const [left, top, width, height] = edge.screen ? [0, 0, view.width, view.height]
        : [view.fieldLeft, view.fieldTop, view.fieldWidth, view.fieldHeight];
      u.edgeRect.set([left, top, width, height], at);
      rgb(u.edgeColor, at, edge.color, edge.intensity * envelope(edge.elapsed, edge.attack, edge.hold, edge.decay));
      u.edgeShape.set([edge.reach * Math.min(width, height), edge.streaks, edge.seed, edge.rim], at);
    });
    const rays = this.rays[0];
    if (rays) {
      const level = envelope(rays.elapsed, rays.attack, rays.hold, rays.decay);
      // Shafts lengthen as they rise.
      u.rayA.set([x(rays.at), y(rays.at), rays.radius * (.7 + .3 * level), rays.intensity * level]);
      u.rayB.set([rays.density, rays.spin, rays.seed, rays.core]);
      rgb(u.rayColor, 0, rays.color, 1);
    }
    this.crits.forEach((crit, index) => {
      const at = index * 4, t = clamp(crit.elapsed / crit.life, 0, 1);
      const out = 1 - (1 - t) ** 3;
      u.critA.set([x(crit.at), y(crit.at), crit.radius * (.15 + .85 * out), crit.intensity * (1 - t) ** 1.5], at);
      // The ring thickens and its color split widens as it expands; the centre flash dies first.
      u.critB.set([crit.radius * (.05 + .05 * out), crit.radius * (.03 + .05 * out), crit.seed, Math.max(0, 1 - t * 3)], at);
      rgb(u.critColor, at, crit.color, 1);
    });
    this.veils.forEach((veil, index) => {
      const at = index * 4, t = clamp(veil.elapsed / veil.life, 0, 1);
      const level = Math.min(1, t / .15) * (1 - clamp((t - .55) / .45, 0, 1) ** 2);
      u.veilA.set([x(veil.at), y(veil.at), veil.radius * (.8 + .2 * Math.min(1, t * 3)), veil.intensity * level], at);
      u.veilB.set([veil.mode, t, veil.seed, 0], at);
      rgb(u.veilCore, at, veil.palette.core, 1); rgb(u.veilMain, at, veil.palette.main, 1); rgb(u.veilEdge, at, veil.palette.edge, 1);
    });
    return u;
  }
}
