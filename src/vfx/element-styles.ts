/**
 * Element base sets for the Battle Spectacle (D-485, Spectacle step 3; rule R3
 * of D-483). Each element has a three-tone palette (white-hot core, its HUD
 * color, a deeper edge), a shape grammar drawn from the grayscale VFX library,
 * and a particle motion. `neutral` (no element) keeps the D-484 interim look.
 *
 * Tiers escalate by adding layers, size and particles; the element decides the
 * shapes. Presentation data only: no gameplay value or RNG lives here.
 */
import type { ElementId } from '../content/activities';
import { elementTints, neutralTint } from './spectacle-timing';
import { textureEdge, type SpectacleTexture } from './vfx-textures';

export type BurstKind = 'normal' | 'skill1' | 'skill2' | 'flare' | 'finisher' | 'support' | 'enemy' | 'status';
export const burstKinds: readonly BurstKind[] = ['normal', 'skill1', 'skill2', 'flare', 'finisher', 'support', 'enemy', 'status'];
export type Tone = 'core' | 'main' | 'edge';
export interface ElementPalette { core: number; main: number; edge: number }

/** One sprite in an impact burst. */
export interface Layer {
  texture: SpectacleTexture;
  /** Final size as a fraction of the target's smaller side. */
  size: number;
  /** Starting scale as a fraction of the final size. */
  from: number;
  alpha: number;
  life: number;
  /** Palette tone; defaults to `main`. */
  tone?: Tone;
  /** Random start angle, then turns this many radians over its life. */
  spin?: number;
  delay?: number;
}
/** One particle layer in an impact burst (world px and ms at battle speed 1). */
export interface SparkPreset {
  texture: SpectacleTexture;
  count: number;
  speed: [number, number];
  life: [number, number];
  /** Phaser scale at birth and death (texture-relative). */
  scale: [number, number];
  gravity?: number;
  /** Emission cone in degrees (screen space, 270 = up); full circle by default. */
  angle?: [number, number];
  /** `random`: fixed random angle; `spin`: tumbles once over its life. */
  rotate?: 'random' | 'spin';
}
/** Travel beat for ranged kits: a flying orb with a trail, or a beam that reaches the target. */
export type Travel =
  | { kind: 'orb'; texture: SpectacleTexture; px: number; spin: number; trail: SpectacleTexture; trailPx: number }
  | { kind: 'beam'; texture: SpectacleTexture; thickness: number; grow: number; flicker: boolean };
export interface Mote { texture: SpectacleTexture; px: number }

export interface ElementStyle {
  id: ElementId | 'neutral';
  palette: ElementPalette;
  /** Particles fade core, then main, then edge over their life; neutral tints them flat. */
  ramp: boolean;
  layers: Record<BurstKind, Layer[]>;
  sparks: Record<BurstKind, SparkPreset[]>;
  travel: Travel;
  /** Melee: drawn along each cut, under the white streak. */
  overlay: SpectacleTexture | null;
  /** Support: the ring that pulses from the caster and each ally. */
  pulse: SpectacleTexture;
  /** Wind-up: motes gather in (every third uses the second mote); a sigil turns under skill wind-ups. */
  motes: [Mote, Mote];
  sigil: SpectacleTexture | null;
}

/** D-484 interim look, unchanged: used when a unit has no element. */
const neutral: ElementStyle = {
  id: 'neutral',
  palette: { core: 0xffffff, main: neutralTint, edge: neutralTint },
  ramp: false,
  layers: {
    normal: [
      { texture: 'glow/point-bloom', size: .9, from: .2, alpha: 1, life: 200, tone: 'core' },
      { texture: 'impacts/ring-concentric', size: .8, from: .15, alpha: .8, life: 240 },
    ],
    skill1: [
      { texture: 'glow/point-bloom', size: 1.2, from: .2, alpha: 1, life: 260, tone: 'core' },
      { texture: 'impacts/radial-streaks-fade', size: 1.3, from: .3, alpha: .9, life: 320, spin: .6 },
      { texture: 'impacts/ring-concentric', size: 1.1, from: .15, alpha: .85, life: 380 },
    ],
    skill2: [
      { texture: 'glow/radial-bloom', size: 1.8, from: .3, alpha: .75, life: 420 },
      { texture: 'glow/point-bloom', size: 1.4, from: .2, alpha: 1, life: 300, tone: 'core' },
      { texture: 'impacts/flare-burst', size: 1.6, from: .3, alpha: .95, life: 420, spin: .6 },
      { texture: 'impacts/ring-flare', size: 1.5, from: .2, alpha: .9, life: 500 },
      { texture: 'impacts/ring-concentric', size: 1.9, from: .3, alpha: .6, life: 560, delay: 80 },
    ],
    flare: [
      { texture: 'glow/radial-bloom', size: 1.9, from: .4, alpha: .7, life: 320 },
      { texture: 'glow/point-bloom', size: 1.5, from: .3, alpha: 1, life: 240, tone: 'core' },
      { texture: 'impacts/radial-spikes', size: 1.9, from: .4, alpha: .9, life: 300, spin: .6 },
      { texture: 'impacts/ring-concentric', size: 1.7, from: .3, alpha: .7, life: 360 },
    ],
    finisher: [
      { texture: 'glow/radial-bloom', size: 2.8, from: .4, alpha: .9, life: 620 },
      { texture: 'flares/starburst-8point', size: 2.4, from: .3, alpha: 1, life: 420, tone: 'core', spin: .6 },
      { texture: 'impacts/shatter-burst', size: 2.2, from: .4, alpha: .95, life: 560, spin: .6 },
      { texture: 'flares/supernova', size: 2.6, from: .3, alpha: .9, life: 640 },
      { texture: 'impacts/ring-concentric', size: 3.4, from: .4, alpha: .7, life: 700, delay: 60 },
    ],
    support: [
      { texture: 'glow/soft-glow', size: 1.3, from: .6, alpha: .7, life: 520 },
      { texture: 'impacts/ring-flare', size: 1.1, from: .5, alpha: .7, life: 520 },
    ],
    enemy: [
      { texture: 'glow/point-bloom', size: 1, from: .2, alpha: .9, life: 220, tone: 'core' },
      { texture: 'impacts/radial-streaks-fade', size: 1.1, from: .3, alpha: .7, life: 280, spin: .6 },
    ],
    status: [{ texture: 'glow/soft-glow', size: .8, from: .5, alpha: .55, life: 380 }],
  },
  sparks: {
    normal: [{ texture: 'particles/star-hard', count: 10, speed: [140, 320], life: [160, 260], scale: [.9, 0] }],
    skill1: [
      { texture: 'particles/star-hard', count: 18, speed: [180, 420], life: [220, 380], scale: [1.1, 0] },
      { texture: 'particles/star-thin', count: 8, speed: [260, 520], life: [180, 300], scale: [1.6, 0] },
    ],
    skill2: [
      { texture: 'particles/star-hard', count: 30, speed: [220, 520], life: [260, 480], scale: [1.3, 0] },
      { texture: 'particles/star-thin', count: 12, speed: [320, 640], life: [220, 360], scale: [2, 0] },
      { texture: 'particles/crystal-shard', count: 8, speed: [160, 360], life: [320, 520], scale: [.35, 0], gravity: 420, rotate: 'random' },
    ],
    flare: [
      { texture: 'particles/star-hard', count: 16, speed: [200, 460], life: [200, 340], scale: [1.2, 0] },
      { texture: 'particles/star-thin', count: 6, speed: [300, 560], life: [160, 280], scale: [1.8, 0] },
    ],
    finisher: [
      { texture: 'particles/star-hard', count: 60, speed: [260, 760], life: [320, 620], scale: [1.5, 0] },
      { texture: 'particles/star-thin', count: 20, speed: [420, 900], life: [260, 440], scale: [2.4, 0] },
      { texture: 'particles/crystal-shard', count: 14, speed: [220, 520], life: [420, 680], scale: [.45, 0], gravity: 520, rotate: 'random' },
    ],
    support: [{ texture: 'particles/star-soft', count: 14, speed: [40, 120], life: [360, 560], scale: [1.4, 0], gravity: -220 }],
    enemy: [{ texture: 'particles/star-hard', count: 12, speed: [140, 340], life: [180, 300], scale: [1, 0] }],
    status: [{ texture: 'particles/star-soft', count: 6, speed: [30, 90], life: [260, 400], scale: [1.1, 0], gravity: -160 }],
  },
  travel: { kind: 'orb', texture: 'projectiles/gyre-orb', px: 26, spin: 0, trail: 'particles/star-soft', trailPx: 29 },
  overlay: null,
  pulse: 'impacts/ring-flare',
  motes: [{ texture: 'particles/star-soft', px: 29 }, { texture: 'particles/star-hard', px: 29 }],
  sigil: null,
};

/** A particle kind within a grammar: texture, birth size in px, and how it moves. */
interface Particle {
  texture: SpectacleTexture;
  px: number;
  gravity: number;
  speed: number;
  life: number;
  angle?: [number, number];
  rotate?: 'random' | 'spin';
}
interface Grammar {
  id: ElementId;
  palette: Omit<ElementPalette, 'main'>;
  /** Tier ring (every tier), burst (Skill 1+), heavy (Skill 2+), accent (finisher core). */
  ring: SpectacleTexture;
  burst: SpectacleTexture;
  heavy: SpectacleTexture;
  accent: SpectacleTexture;
  /** Extra lingering layer on Skill 2+ hits (Chaotic smoke). */
  haze?: SpectacleTexture;
  /** Layer turn in radians (0 for shapes with a fixed up, like splashes). */
  spin: number;
  /** Life multiplier for non-core layers (calm elements linger, sharp ones snap). */
  linger: number;
  spark: Particle;
  flake: Particle;
  shard: Particle;
  travel: Travel;
  overlay: SpectacleTexture;
  pulse: SpectacleTexture;
  motes: [Mote, Mote];
  sigil: SpectacleTexture;
}

const range = (base: [number, number], factor: number): [number, number] =>
  [Math.round(base[0] * factor), Math.round(base[1] * factor)];
function spark(particle: Particle, count: number, speed: [number, number], life: [number, number], px: number,
  gravity = particle.gravity): SparkPreset {
  return {
    texture: particle.texture, count, speed: range(speed, particle.speed), life: range(life, particle.life),
    scale: [+(px / textureEdge(particle.texture)).toFixed(3), 0], gravity,
    ...(particle.angle ? { angle: particle.angle } : {}), ...(particle.rotate ? { rotate: particle.rotate } : {}),
  };
}
/** Builds an element's tier layers and particles from its grammar; sizes and counts follow the neutral escalation. */
function build(grammar: Grammar): ElementStyle {
  const { ring, burst, heavy, accent, spin, linger, spark: s, flake: f, shard: h } = grammar;
  const life = (ms: number) => Math.round(ms * linger);
  const haze = (size: number): Layer[] => grammar.haze
    ? [{ texture: grammar.haze, size, from: .5, alpha: .45, life: life(900), spin: .4 }] : [];
  const layers: Record<BurstKind, Layer[]> = {
    normal: [
      { texture: 'glow/point-bloom', size: .9, from: .2, alpha: 1, life: 200, tone: 'core' },
      { texture: ring, size: .8, from: .15, alpha: .8, life: life(240), spin },
    ],
    skill1: [
      { texture: 'glow/point-bloom', size: 1.2, from: .2, alpha: 1, life: 260, tone: 'core' },
      { texture: burst, size: 1.3, from: .3, alpha: .9, life: life(320), spin },
      { texture: ring, size: 1.1, from: .15, alpha: .85, life: life(380), spin },
    ],
    skill2: [
      { texture: 'glow/radial-bloom', size: 1.8, from: .3, alpha: .75, life: life(420), tone: 'edge' },
      { texture: 'glow/point-bloom', size: 1.4, from: .2, alpha: 1, life: 300, tone: 'core' },
      { texture: heavy, size: 1.6, from: .3, alpha: .95, life: life(420), spin },
      { texture: ring, size: 1.5, from: .2, alpha: .9, life: life(500), spin },
      { texture: burst, size: 1.9, from: .3, alpha: .6, life: life(560), spin, delay: 80, tone: 'edge' },
      ...haze(1.8),
    ],
    flare: [
      { texture: 'glow/radial-bloom', size: 1.9, from: .4, alpha: .7, life: life(320), tone: 'edge' },
      { texture: 'glow/point-bloom', size: 1.5, from: .3, alpha: 1, life: 240, tone: 'core' },
      { texture: heavy, size: 1.9, from: .4, alpha: .9, life: life(300), spin },
      { texture: ring, size: 1.7, from: .3, alpha: .7, life: life(360), spin },
      ...haze(2),
    ],
    finisher: [
      { texture: 'glow/radial-bloom', size: 2.8, from: .4, alpha: .9, life: life(620), tone: 'edge' },
      { texture: accent, size: 2.4, from: .3, alpha: 1, life: 420, tone: 'core', spin: .6 },
      { texture: heavy, size: 2.2, from: .4, alpha: .95, life: life(560), spin },
      { texture: 'flares/supernova', size: 2.6, from: .3, alpha: .8, life: life(640) },
      { texture: burst, size: 2.9, from: .3, alpha: .8, life: life(680), spin, delay: 40, tone: 'edge' },
      { texture: ring, size: 3.4, from: .4, alpha: .7, life: life(700), spin, delay: 60 },
      ...haze(3),
    ],
    support: [
      { texture: 'glow/soft-glow', size: 1.3, from: .6, alpha: .7, life: life(520) },
      { texture: grammar.pulse, size: 1.1, from: .5, alpha: .75, life: life(520), spin: spin / 2 },
    ],
    enemy: [
      { texture: 'glow/point-bloom', size: 1, from: .2, alpha: .9, life: 220, tone: 'core' },
      { texture: burst, size: 1, from: .3, alpha: .6, life: life(260), spin },
      { texture: ring, size: .9, from: .2, alpha: .75, life: life(280), spin },
    ],
    status: [{ texture: 'glow/soft-glow', size: .8, from: .5, alpha: .55, life: 380 }],
  };
  const sparks: Record<BurstKind, SparkPreset[]> = {
    normal: [spark(s, 10, [140, 320], [160, 260], 29)],
    skill1: [spark(s, 18, [180, 420], [220, 380], 35), spark(f, 8, [140, 360], [260, 420], f.px)],
    skill2: [spark(s, 30, [220, 520], [260, 480], 42), spark(f, 12, [160, 420], [300, 520], f.px * 1.1),
      spark(h, 8, [160, 360], [320, 520], h.px)],
    flare: [spark(s, 16, [200, 460], [200, 340], 38), spark(f, 6, [180, 420], [220, 360], f.px)],
    finisher: [spark(s, 60, [260, 760], [320, 620], 48), spark(f, 20, [300, 700], [300, 520], f.px * 1.3),
      spark(h, 14, [220, 520], [420, 680], h.px * 1.2)],
    // Healing and buffs always lift, whatever the element's weight.
    support: [spark(s, 10, [40, 120], [360, 560], 45, -220), spark(f, 4, [30, 100], [420, 620], f.px, -160)],
    enemy: [spark(s, 12, [140, 340], [180, 300], 32), spark(f, 4, [120, 300], [220, 360], f.px * .8)],
    status: [spark(s, 6, [30, 90], [260, 400], 35, -160)],
  };
  return {
    id: grammar.id, palette: { core: grammar.palette.core, main: elementTints[grammar.id], edge: grammar.palette.edge },
    ramp: true, layers, sparks, travel: grammar.travel, overlay: grammar.overlay, pulse: grammar.pulse,
    motes: grammar.motes, sigil: grammar.sigil,
  };
}

const mote = (texture: SpectacleTexture, px: number): Mote => ({ texture, px });

/** Six element grammars (owner-approved table, D-485). Main tones are the HUD accents (`elementTints`). */
export const elementStyles: Readonly<Record<ElementId | 'neutral', ElementStyle>> = {
  neutral,
  // Embers and flame tongues: rising cinders, a spinning fireball, a flame tongue along melee cuts.
  infernic: build({
    id: 'infernic', palette: { core: 0xfff1c2, edge: 0xc8261a },
    ring: 'impacts/ring-solar', burst: 'impacts/radial-spikes', heavy: 'impacts/flare-burst', accent: 'flares/starburst-8point',
    spin: .6, linger: 1,
    spark: { texture: 'particles/star-hard', px: 29, gravity: -260, speed: 1, life: 1.15 },
    flake: { texture: 'flares/star-wisp', px: 46, gravity: -340, speed: .8, life: 1.1, angle: [215, 325], rotate: 'random' },
    shard: { texture: 'particles/star-soft', px: 34, gravity: -180, speed: .7, life: 1.3 },
    travel: { kind: 'orb', texture: 'flares/star-wisp', px: 64, spin: 9, trail: 'particles/star-hard', trailPx: 26 },
    overlay: 'beams/plasma-core', pulse: 'impacts/ring-solar',
    motes: [mote('particles/star-hard', 26), mote('flares/star-wisp', 30)], sigil: 'impacts/ring-solar',
  }),
  // Arcs and spray: a tide that sweeps to the target, falling droplets, mist and dripping rings.
  oceanic: build({
    id: 'oceanic', palette: { core: 0xeefbff, edge: 0x1f4fb8 },
    ring: 'impacts/ring-dripping', burst: 'impacts/ring-concentric', heavy: 'impacts/ground-ripple', accent: 'flares/star-sharp',
    spin: 0, linger: 1.1,
    spark: { texture: 'particles/star-soft', px: 29, gravity: 720, speed: 1.15, life: 1.05, angle: [200, 340] },
    flake: { texture: 'particles/mist-wisp', px: 60, gravity: 160, speed: .7, life: 1.2, rotate: 'random' },
    shard: { texture: 'particles/star-hard', px: 30, gravity: 900, speed: 1.2, life: 1, angle: [210, 330] },
    travel: { kind: 'beam', texture: 'beams/tide', thickness: 74, grow: .7, flicker: false },
    overlay: 'trails/ribbon-standing-wave', pulse: 'impacts/ring-dripping',
    motes: [mote('particles/star-soft', 29), mote('particles/mist-wisp', 34)], sigil: 'impacts/ring-dripping',
  }),
  // Bolts and streaks: an instant flickering bolt, crossed glints, fast short-lived streaks.
  atmospheric: build({
    id: 'atmospheric', palette: { core: 0xffffff, edge: 0x5b63ff },
    ring: 'impacts/ring-sparkle', burst: 'impacts/x-cross', heavy: 'impacts/radial-streaks-fade', accent: 'flares/star-sharp',
    spin: .9, linger: .8,
    spark: { texture: 'particles/star-thin', px: 40, gravity: 0, speed: 1.6, life: .6 },
    flake: { texture: 'particles/star-hard', px: 26, gravity: 0, speed: 1.4, life: .7 },
    shard: { texture: 'flares/star-sharp', px: 40, gravity: 0, speed: .9, life: .7, rotate: 'random' },
    travel: { kind: 'beam', texture: 'beams/storm', thickness: 34, grow: .15, flicker: true },
    overlay: 'beams/storm', pulse: 'impacts/ring-sparkle',
    motes: [mote('particles/star-thin', 34), mote('particles/star-hard', 26)], sigil: 'impacts/ring-sparkle',
  }),
  // Petals and vines: a spinning bloom, drifting petals, thorns and a thorned ring.
  botanic: build({
    id: 'botanic', palette: { core: 0xfaf6c8, edge: 0x2c7a3a },
    ring: 'impacts/ring-thorned', burst: 'impacts/petal-burst-b', heavy: 'impacts/petal-burst-a', accent: 'flares/starburst-8point',
    spin: .5, linger: 1.15,
    spark: { texture: 'particles/star-soft', px: 26, gravity: -60, speed: .7, life: 1.3 },
    flake: { texture: 'particles/petal', px: 22, gravity: 140, speed: .8, life: 1.5, rotate: 'spin' },
    shard: { texture: 'particles/thorn', px: 42, gravity: 320, speed: 1, life: 1.1, rotate: 'random' },
    travel: { kind: 'orb', texture: 'impacts/petal-burst-b', px: 84, spin: 7, trail: 'particles/petal', trailPx: 14 },
    overlay: 'trails/petal-spray', pulse: 'impacts/petal-burst-a',
    motes: [mote('particles/petal', 16), mote('particles/star-soft', 26)], sigil: 'impacts/ring-thorned',
  }),
  // Rings and glyphs: a turning runic orb, calm expanding sigils, crescents that float.
  tranquilitic: build({
    id: 'tranquilitic', palette: { core: 0xfff4fa, edge: 0x6a3fb0 },
    ring: 'impacts/ring-runic', burst: 'impacts/sigil-circle', heavy: 'impacts/ring-cosmic', accent: 'flares/starburst-8point',
    spin: .35, linger: 1.3,
    spark: { texture: 'particles/star-soft', px: 29, gravity: -40, speed: .6, life: 1.35 },
    flake: { texture: 'particles/crescent', px: 24, gravity: -30, speed: .7, life: 1.4, rotate: 'spin' },
    shard: { texture: 'particles/star-hard', px: 30, gravity: 0, speed: .8, life: 1.2 },
    travel: { kind: 'orb', texture: 'impacts/ring-runic', px: 92, spin: 4, trail: 'particles/star-soft', trailPx: 26 },
    overlay: 'beams/glyph-stream', pulse: 'impacts/sigil-circle',
    motes: [mote('particles/star-soft', 29), mote('particles/crescent', 18)], sigil: 'impacts/sigil-circle',
  }),
  // Fractures and smoke: a fissure lance, a shattering web, tumbling rock and lingering smoke.
  chaotic: build({
    id: 'chaotic', palette: { core: 0xf0dcff, edge: 0x4a1478 },
    ring: 'impacts/shatter-web', burst: 'impacts/crack-burst', heavy: 'impacts/shatter-burst', accent: 'flares/starburst-8point',
    haze: 'beams/smoke-stream', spin: .8, linger: 1.15,
    spark: { texture: 'particles/star-hard', px: 29, gravity: 0, speed: 1.3, life: .8 },
    flake: { texture: 'particles/rock-shard', px: 30, gravity: 520, speed: 1.1, life: 1.1, rotate: 'spin' },
    shard: { texture: 'particles/crystal-shard', px: 44, gravity: 620, speed: 1.1, life: 1.1, rotate: 'random' },
    travel: { kind: 'beam', texture: 'beams/fissure', thickness: 44, grow: .3, flicker: false },
    overlay: 'beams/fissure', pulse: 'impacts/ring-concentric',
    motes: [mote('particles/star-hard', 26), mote('particles/rock-shard', 18)], sigil: 'impacts/crack-burst',
  }),
};

export function elementStyle(elementId: string | null | undefined): ElementStyle {
  return elementId && Object.hasOwn(elementStyles, elementId) ? elementStyles[elementId as ElementId] : neutral;
}
export function toneColor(style: ElementStyle, tone: Tone = 'main'): number {
  return style.palette[tone];
}
