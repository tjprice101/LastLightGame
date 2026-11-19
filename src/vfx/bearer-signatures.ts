/**
 * Per-bearer signature layers for the Battle Spectacle (D-486, Spectacle step 4).
 * A signature sits on top of the bearer's element base set (D-485): it may swap
 * the melee cut, travel, wind-up sigil, support pulse and motes, and it appends
 * layers and particles from Skill 1 up. Normal Attack always keeps the element
 * base so it stays brisk (D-483 R2). Bearers without an entry use the base.
 *
 * Presentation data only: no gameplay value or RNG lives here. Shapes follow
 * each bearer's weapon and `characterChoreography` signature.
 */
import { elementStyle, type BurstKind, type ElementStyle, type Layer, type Mote, type SparkPreset, type Travel } from './element-styles';
import { textureEdge, type SpectacleTexture } from './vfx-textures';

export type SignatureKind = Extract<BurstKind, 'skill1' | 'skill2' | 'flare' | 'finisher' | 'support'>;
export interface BearerSignature {
  overlay?: SpectacleTexture;
  travel?: Travel;
  sigil?: SpectacleTexture;
  pulse?: SpectacleTexture;
  motes?: [Mote, Mote];
  /** Appended after the element's layers (never replaces them). */
  layers?: Partial<Record<SignatureKind, Layer[]>>;
  sparks?: Partial<Record<SignatureKind, SparkPreset[]>>;
}

/** Signature particles may add at most this share of the element base's count for the same kind. */
export const signatureParticleShare = .25;

const layer = (texture: SpectacleTexture, size: number, life: number, extra: Partial<Layer> = {}): Layer =>
  ({ texture, size, from: .3, alpha: .85, life, ...extra });
const spark = (texture: SpectacleTexture, count: number, speed: [number, number], life: [number, number], px: number,
  extra: Partial<SparkPreset> = {}): SparkPreset =>
  ({ texture, count, speed, life, scale: [+(px / textureEdge(texture)).toFixed(3), 0], ...extra });

export const bearerSignatures: Readonly<Record<string, BearerSignature>> = {
  // Greatsword cleave: crescent arcs sweep across the target, riding embers lift behind.
  ember: {
    layers: {
      skill1: [layer('particles/crescent', 2.2, 340, { spin: .9, tone: 'core', alpha: 1 })],
      skill2: [layer('particles/crescent', 2.8, 420, { spin: 1.1, tone: 'core', alpha: 1 }), layer('particles/crescent', 2.2, 400, { spin: -1, delay: 90, alpha: 1 })],
      flare: [layer('particles/crescent', 3, 380, { spin: 1.2, tone: 'core', alpha: 1 })],
      finisher: [layer('particles/crescent', 3.8, 560, { spin: 1.2, tone: 'core', alpha: 1 }), layer('particles/crescent', 3, 540, { spin: -1.2, delay: 70, alpha: 1 })],
    },
    sparks: {
      skill1: [spark('flares/star-wisp', 4, [160, 380], [260, 420], 40, { gravity: -300, rotate: 'random' })],
      skill2: [spark('flares/star-wisp', 6, [180, 460], [300, 500], 46, { gravity: -320, rotate: 'random' })],
      flare: [spark('flares/star-wisp', 3, [180, 420], [260, 420], 40, { gravity: -300, rotate: 'random' })],
      finisher: [spark('flares/star-wisp', 14, [220, 640], [340, 620], 52, { gravity: -340, rotate: 'random' })],
    },
  },
  // Trident thrust: a narrow piercing lance and one ripple per prong.
  tide: {
    overlay: 'beams/tide',
    layers: {
      skill1: [layer('impacts/ring-dripping', .55, 320, { from: .15 }), layer('impacts/ring-dripping', .55, 320, { from: .15, delay: 70 })],
      skill2: [0, 70, 140].map(delay => layer('impacts/ring-dripping', .7, 380, { from: .15, delay })),
      flare: [0, 70, 140].map(delay => layer('impacts/ring-dripping', .8, 340, { from: .15, delay })),
      finisher: [0, 70, 140].map(delay => layer('impacts/ring-dripping', 1, 560, { from: .15, delay })).concat(
        layer('impacts/ground-ripple', 3.2, 700, { from: .3, delay: 120, tone: 'edge' })),
    },
  },
  // Petal-fletched arrow; healing blooms where the support pulse lands.
  sprout: {
    travel: { kind: 'orb', texture: 'beams/streak', px: 70, spin: 0, trail: 'particles/petal', trailPx: 16 },
    layers: {
      skill1: [layer('impacts/petal-burst-b', 1.2, 340, { spin: .5 })],
      skill2: [layer('impacts/petal-burst-a', 1.6, 420, { spin: .5 }), layer('impacts/ring-thorned', 1.3, 460, { spin: .4, delay: 70 })],
      flare: [layer('impacts/petal-burst-a', 2, 380, { spin: .5 })],
      finisher: [layer('impacts/petal-burst-b', 3, 640, { spin: .5 }), layer('impacts/petal-burst-a', 2.3, 600, { spin: -.5, delay: 60, tone: 'edge' })],
      support: [layer('impacts/petal-burst-b', 1.4, 520, { spin: .5 })],
    },
    sparks: {
      skill1: [spark('particles/petal', 5, [100, 260], [320, 520], 24, { gravity: 120, rotate: 'spin' })],
      skill2: [spark('particles/petal', 10, [120, 320], [360, 600], 26, { gravity: 120, rotate: 'spin' })],
      flare: [spark('particles/petal', 5, [120, 300], [320, 520], 24, { gravity: 120, rotate: 'spin' })],
      finisher: [spark('particles/petal', 22, [160, 480], [420, 760], 28, { gravity: 120, rotate: 'spin' })],
      support: [spark('particles/petal', 3, [30, 100], [420, 640], 20, { gravity: -120, rotate: 'spin' })],
    },
  },
  // Cyclone: counter-turning streak wheels.
  atmoso: {
    layers: {
      skill1: [layer('impacts/radial-streaks-fade', 1.3, 340, { spin: 3.2 })],
      skill2: [layer('impacts/radial-streaks-fade', 1.7, 420, { spin: 3.6 }), layer('impacts/radial-streaks-fade', 1.3, 400, { spin: -3, delay: 60 })],
      flare: [layer('impacts/radial-streaks-fade', 2, 360, { spin: 3.6 }), layer('impacts/radial-streaks-fade', 1.5, 340, { spin: -3, delay: 40 })],
      finisher: [layer('impacts/radial-streaks-fade', 2.6, 560, { spin: 4 }), layer('impacts/radial-streaks-fade', 1.8, 520, { spin: -4, delay: 50 })],
    },
    sparks: {
      skill2: [spark('particles/star-thin', 6, [320, 700], [200, 340], 40)],
      finisher: [spark('particles/star-thin', 16, [440, 940], [260, 440], 44)],
    },
  },
  // Rose bow: a turning rose arrow and double petal wheels.
  rosetta: {
    travel: { kind: 'orb', texture: 'impacts/petal-burst-a', px: 70, spin: 6, trail: 'particles/crescent', trailPx: 18 },
    layers: {
      skill1: [layer('impacts/petal-burst-a', 1.2, 340, { spin: .5 })],
      skill2: [layer('impacts/petal-burst-a', 1.5, 420, { spin: .6 }), layer('impacts/petal-burst-b', 1.9, 460, { spin: -.6, delay: 60, tone: 'edge' })],
      flare: [layer('impacts/ring-thorned', 1.8, 380, { spin: .5 }), layer('impacts/petal-burst-a', 2, 380, { spin: .6 })],
      finisher: [layer('impacts/petal-burst-a', 2.8, 640, { spin: .7 }), layer('impacts/petal-burst-b', 2.2, 600, { spin: -.7, delay: 40, tone: 'edge' })],
    },
  },
  // Mind-fracture crown: spikes ring the target above a turning sigil.
  disciple: {
    layers: {
      skill1: [layer('impacts/radial-spikes', 1.2, 320, { spin: .4, tone: 'edge' })],
      skill2: [layer('impacts/radial-spikes', 1.5, 420, { spin: .4, tone: 'edge' }), layer('impacts/sigil-circle', 1.3, 480, { spin: .6, delay: 60 })],
      flare: [layer('impacts/radial-spikes', 1.9, 360, { spin: .4, tone: 'edge' }), layer('impacts/sigil-circle', 1.5, 400, { spin: .6 })],
      finisher: [layer('impacts/radial-spikes', 2.6, 560, { spin: .4, tone: 'edge' }), layer('impacts/sigil-circle', 2.2, 620, { spin: .6, delay: 50 }),
        layer('impacts/shatter-web', 2.8, 680, { delay: 90, alpha: .6 })],
      support: [layer('impacts/sigil-circle', 1.2, 520, { spin: .5 })],
    },
    sparks: {
      skill2: [spark('particles/crystal-shard', 5, [160, 360], [300, 480], 36, { gravity: 200, angle: [230, 310], rotate: 'random' })],
      finisher: [spark('particles/crystal-shard', 12, [220, 520], [380, 620], 40, { gravity: 220, angle: [230, 310], rotate: 'random' })],
    },
  },
  // Twin feathers: a pair of wisps fans out in opposite turns, soft down drifts.
  bliss: {
    layers: {
      skill1: [layer('flares/star-wisp', 1.4, 320, { spin: .9 })],
      skill2: [layer('flares/star-wisp', 1.7, 400, { spin: .9 }), layer('flares/star-wisp', 1.7, 400, { spin: -.9 })],
      flare: [layer('flares/star-wisp', 2, 360, { spin: .9 }), layer('flares/star-wisp', 2, 360, { spin: -.9 })],
      finisher: [layer('flares/star-wisp', 2.7, 560, { spin: .9 }), layer('flares/star-wisp', 2.7, 560, { spin: -.9 }),
        layer('impacts/ring-sparkle', 2.4, 600, { delay: 70 })],
    },
    sparks: {
      skill2: [spark('particles/mist-wisp', 4, [60, 160], [420, 640], 50, { gravity: 60, rotate: 'random' })],
      finisher: [spark('particles/mist-wisp', 10, [80, 240], [480, 760], 56, { gravity: 60, rotate: 'random' })],
    },
  },
  // Hammer slam: a ground ring and a crack burst, rock thrown from the blow.
  bruno: {
    layers: {
      skill1: [layer('impacts/ring-concentric', 1.6, 360, { from: .2, alpha: .8 })],
      skill2: [layer('impacts/crack-burst', 1.6, 420), layer('impacts/ring-concentric', 2.2, 480, { from: .2, delay: 80 })],
      flare: [layer('impacts/crack-burst', 2, 380), layer('impacts/ring-concentric', 2.4, 420, { from: .2 })],
      finisher: [layer('impacts/crack-burst', 3, 620), layer('impacts/ring-concentric', 3.6, 720, { from: .2, delay: 90 }),
        layer('impacts/shatter-burst', 2.4, 560, { delay: 40, alpha: .6 })],
    },
    sparks: {
      skill1: [spark('particles/rock-shard', 4, [140, 320], [300, 480], 28, { gravity: 520, rotate: 'spin' })],
      skill2: [spark('particles/rock-shard', 8, [180, 420], [340, 560], 30, { gravity: 520, rotate: 'spin' })],
      flare: [spark('particles/rock-shard', 4, [160, 360], [300, 480], 28, { gravity: 520, rotate: 'spin' })],
      finisher: [spark('particles/rock-shard', 18, [220, 560], [380, 680], 34, { gravity: 520, rotate: 'spin' })],
    },
  },
  // Empty-hand lens: a focusing sigil and a bright ring gather light onto the target.
  aurora: {
    layers: {
      skill1: [layer('impacts/ring-sparkle', 1.3, 340, { from: .2 })],
      skill2: [layer('impacts/sigil-circle', 1.5, 440, { spin: .5 }), layer('impacts/ring-sparkle', 1.8, 420, { from: .2, delay: 60 })],
      flare: [layer('impacts/sigil-circle', 1.8, 380, { spin: .5 }), layer('impacts/ring-sparkle', 2, 380, { from: .2 })],
      finisher: [layer('impacts/sigil-circle', 2.6, 620, { spin: .5 }), layer('impacts/ring-sparkle', 3, 600, { from: .2, delay: 60 }),
        layer('flares/star-wisp', 2.4, 560, { delay: 90, tone: 'core' })],
      support: [layer('impacts/ring-sparkle', 1.5, 520, { from: .2 })],
    },
    sparks: {
      skill2: [spark('particles/star-soft', 5, [80, 220], [320, 520], 30, { gravity: -80 })],
      finisher: [spark('particles/star-soft', 12, [100, 320], [380, 640], 34, { gravity: -80 })],
    },
  },
  // Twin four-point shuriken: crossing blades and thin star points thrown outward.
  elise: {
    layers: {
      skill1: [layer('impacts/x-cross', 1.3, 320, { spin: 1.4 })],
      skill2: [layer('impacts/x-cross', 1.6, 400, { spin: 1.6 }), layer('impacts/x-cross', 1.3, 380, { spin: -1.6, delay: 60 })],
      flare: [layer('impacts/x-cross', 1.9, 360, { spin: 1.6 }), layer('impacts/x-cross', 1.5, 340, { spin: -1.6, delay: 40 })],
      finisher: [layer('impacts/x-cross', 2.6, 560, { spin: 1.8 }), layer('impacts/x-cross', 2, 520, { spin: -1.8, delay: 50 })],
    },
    sparks: {
      skill2: [spark('flares/star-sharp', 4, [300, 640], [200, 340], 36, { rotate: 'spin' })],
      finisher: [spark('flares/star-sharp', 10, [400, 860], [240, 420], 40, { rotate: 'spin' })],
    },
  },
  // Night sword guard: an eclipse ring closes over the target, shadow wisps trail off.
  razor: {
    layers: {
      skill1: [layer('impacts/ring-cosmic', 1.4, 360, { spin: .3 })],
      skill2: [layer('impacts/ring-cosmic', 1.8, 460, { spin: .3 }), layer('particles/crescent', 2.2, 420, { spin: -.8, delay: 70, tone: 'core', alpha: 1 })],
      flare: [layer('impacts/ring-cosmic', 2, 400, { spin: .3 }), layer('particles/crescent', 2.4, 380, { spin: -.8, tone: 'core', alpha: 1 })],
      finisher: [layer('impacts/ring-cosmic', 3, 640, { spin: .3 }), layer('particles/crescent', 3.4, 600, { spin: -.9, delay: 60, tone: 'core', alpha: 1 })],
    },
    sparks: {
      skill2: [spark('particles/mist-wisp', 4, [60, 160], [420, 640], 48, { gravity: -40, rotate: 'random' })],
      finisher: [spark('particles/mist-wisp', 10, [80, 240], [480, 760], 54, { gravity: -40, rotate: 'random' })],
    },
  },
  // Greatsword garden gate: thorned rings and thorn shards thrown from the blow.
  thornia: {
    layers: {
      skill1: [layer('impacts/ring-thorned', 1.4, 360, { spin: .4 })],
      skill2: [layer('impacts/ring-thorned', 1.8, 460, { spin: .4 }), layer('impacts/radial-spikes', 1.6, 420, { spin: -.4, delay: 70, tone: 'edge' })],
      flare: [layer('impacts/ring-thorned', 2.1, 400, { spin: .4 }), layer('impacts/radial-spikes', 1.9, 380, { spin: -.4, tone: 'edge' })],
      finisher: [layer('impacts/ring-thorned', 3, 640, { spin: .4 }), layer('impacts/radial-spikes', 2.8, 600, { spin: -.4, delay: 60, tone: 'edge' })],
    },
    sparks: {
      skill1: [spark('particles/thorn', 3, [160, 340], [300, 460], 26, { gravity: 300, rotate: 'random' })],
      skill2: [spark('particles/thorn', 6, [200, 440], [340, 540], 28, { gravity: 300, rotate: 'random' })],
      finisher: [spark('particles/thorn', 14, [240, 580], [380, 660], 32, { gravity: 300, rotate: 'random' })],
    },
  },
  // Dual-edged sword: two opposed crescents, one bright and one deep, cross the target.
  crinso: {
    layers: {
      skill1: [layer('particles/crescent', 2, 320, { spin: .9, tone: 'core', alpha: 1 }), layer('particles/crescent', 2, 320, { spin: -.9, tone: 'edge', alpha: 1 })],
      skill2: [layer('particles/crescent', 2.6, 400, { spin: 1, tone: 'core', alpha: 1 }), layer('particles/crescent', 2.6, 400, { spin: -1, tone: 'edge', alpha: 1, delay: 60 })],
      flare: [layer('particles/crescent', 2.8, 360, { spin: 1.1, tone: 'core', alpha: 1 }), layer('particles/crescent', 2.8, 360, { spin: -1.1, tone: 'edge', alpha: 1, delay: 40 })],
      finisher: [layer('particles/crescent', 3.6, 560, { spin: 1.2, tone: 'core', alpha: 1 }), layer('particles/crescent', 3.6, 560, { spin: -1.2, tone: 'edge', alpha: 1, delay: 60 })],
    },
  },
  // Cathedral shield and glass halberd: a citadel ring holds, glass shards fall away.
  ozriel: {
    layers: {
      skill1: [layer('impacts/ring-runic', 1.4, 380, { spin: .2 })],
      skill2: [layer('impacts/ring-runic', 1.8, 480, { spin: .2 }), layer('impacts/shatter-web', 1.8, 440, { delay: 70, alpha: .6 })],
      flare: [layer('impacts/ring-runic', 2.1, 420, { spin: .2 }), layer('impacts/shatter-web', 2.1, 400, { alpha: .6 })],
      finisher: [layer('impacts/ring-runic', 3, 660, { spin: .2 }), layer('impacts/shatter-web', 3, 640, { delay: 60, alpha: .6 })],
      support: [layer('impacts/ring-runic', 1.5, 540, { spin: .2 })],
    },
    sparks: {
      skill2: [spark('particles/crystal-shard', 4, [140, 320], [300, 480], 34, { gravity: 260, rotate: 'random' })],
      finisher: [spark('particles/crystal-shard', 10, [200, 480], [380, 620], 38, { gravity: 260, rotate: 'random' })],
    },
  },
  // Glass halo-lyre: ring after ring of resonance with a ringing sparkle.
  ilvaris: {
    layers: {
      skill1: [layer('impacts/ring-sparkle', 1.3, 340, { from: .15 })],
      skill2: [0, 80, 160].map(delay => layer('impacts/ring-sparkle', 1.7, 400, { from: .15, delay })),
      flare: [0, 80].map(delay => layer('impacts/ring-sparkle', 2, 360, { from: .15, delay })),
      finisher: [0, 80, 160].map(delay => layer('impacts/ring-sparkle', 2.8, 580, { from: .15, delay })),
      support: [layer('impacts/ring-sparkle', 1.5, 520, { from: .15 })],
    },
    sparks: {
      skill2: [spark('particles/star-thin', 5, [200, 460], [260, 420], 38)],
      finisher: [spark('particles/star-thin', 12, [280, 640], [300, 520], 42)],
    },
  },
  // Shatterglass greatscythe: a wide scythe arc and a fault line splitting the target.
  kaelith: {
    layers: {
      skill1: [layer('particles/crescent', 2.6, 340, { spin: .7, tone: 'core', alpha: 1 })],
      skill2: [layer('particles/crescent', 3.2, 440, { spin: .8, tone: 'core', alpha: 1 }), layer('impacts/crack-burst', 1.8, 420, { delay: 80 })],
      flare: [layer('particles/crescent', 3.4, 380, { spin: .9, tone: 'core', alpha: 1 }), layer('impacts/crack-burst', 2, 380)],
      finisher: [layer('particles/crescent', 4.4, 600, { spin: 1, tone: 'core', alpha: 1 }), layer('impacts/crack-burst', 3.2, 620, { delay: 70 }),
        layer('impacts/shatter-web', 2.8, 640, { delay: 110, alpha: .6 })],
    },
    sparks: {
      skill2: [spark('particles/crystal-shard', 4, [200, 420], [300, 480], 34, { gravity: 240, rotate: 'random' })],
      finisher: [spark('particles/crystal-shard', 12, [260, 560], [380, 620], 38, { gravity: 240, rotate: 'random' })],
    },
  },
  // Surveyor trident: a charting grid of crossing marks and survey rings closes on the target.
  nerithe: {
    overlay: 'beams/tide',
    layers: {
      skill1: [layer('impacts/x-cross', 1.2, 320, { spin: .3 }), layer('impacts/ring-concentric', 1.5, 340, { from: .2, alpha: .7 })],
      skill2: [layer('impacts/x-cross', 1.5, 400, { spin: .3 }), layer('impacts/ring-concentric', 1.9, 420, { from: .2, delay: 60, alpha: .7 }), layer('impacts/ring-dripping', .8, 360, { from: .15, delay: 120 })],
      flare: [layer('impacts/x-cross', 1.8, 360, { spin: .3 }), layer('impacts/ring-concentric', 2.2, 380, { from: .2, alpha: .7 }), layer('impacts/ring-dripping', .9, 340, { from: .15, delay: 80 })],
      finisher: [layer('impacts/x-cross', 2.6, 560, { spin: .3 }), layer('impacts/ring-concentric', 3.2, 600, { from: .2, delay: 60, alpha: .7 }), layer('impacts/ground-ripple', 3.2, 700, { from: .3, delay: 120, tone: 'edge' })],
    },
  },
  // Crescent polearm: a wide tide-crescent sweep and rings that roll outward behind it.
  neralis: {
    layers: {
      skill1: [layer('particles/crescent', 2.4, 340, { spin: .8, tone: 'core', alpha: 1 })],
      skill2: [layer('particles/crescent', 3, 420, { spin: .9, tone: 'core', alpha: 1 }), layer('impacts/ring-dripping', 1.2, 420, { from: .15, delay: 80 })],
      flare: [layer('particles/crescent', 3.2, 380, { spin: 1, tone: 'core', alpha: 1 }), layer('impacts/ring-dripping', 1.4, 380, { from: .15, delay: 60 })],
      finisher: [layer('particles/crescent', 4, 580, { spin: 1.1, tone: 'core', alpha: 1 }), layer('impacts/ring-dripping', 2, 600, { from: .15, delay: 70 }), layer('impacts/ground-ripple', 3, 680, { from: .3, delay: 130, tone: 'edge' })],
      support: [layer('impacts/ring-dripping', 1.3, 520, { from: .15 })],
    },
  },
  // Crystal mace: a thorned guard ring, then a crack as the mace lands, crystal thrown clear.
  orvella: {
    layers: {
      skill1: [layer('impacts/ring-thorned', 1.4, 360, { spin: .2 })],
      skill2: [layer('impacts/ring-thorned', 1.8, 460, { spin: .2 }), layer('impacts/crack-burst', 1.6, 420, { delay: 80 })],
      flare: [layer('impacts/ring-thorned', 2.1, 400, { spin: .2 }), layer('impacts/crack-burst', 1.9, 380)],
      finisher: [layer('impacts/ring-thorned', 3, 640, { spin: .2 }), layer('impacts/crack-burst', 3, 620, { delay: 70 }), layer('impacts/shatter-burst', 2.4, 560, { delay: 110, alpha: .6 })],
      support: [layer('impacts/ring-thorned', 1.5, 540, { spin: .2 })],
    },
    sparks: {
      skill2: [spark('particles/crystal-shard', 4, [160, 360], [300, 480], 32, { gravity: 300, rotate: 'random' })],
      finisher: [spark('particles/crystal-shard', 12, [220, 540], [380, 640], 36, { gravity: 300, rotate: 'random' })],
    },
  },
  // Chained sickles: two crescents sweep in opposite turns, petals and thorns shaken loose.
  myrthen: {
    layers: {
      skill1: [layer('particles/crescent', 2, 320, { spin: 1, tone: 'core', alpha: 1 }), layer('particles/crescent', 2, 320, { spin: -1, delay: 40, alpha: 1 })],
      skill2: [layer('particles/crescent', 2.6, 400, { spin: 1.1, tone: 'core', alpha: 1 }), layer('particles/crescent', 2.6, 400, { spin: -1.1, delay: 60, alpha: 1 })],
      flare: [layer('particles/crescent', 2.8, 360, { spin: 1.2, tone: 'core', alpha: 1 }), layer('particles/crescent', 2.8, 360, { spin: -1.2, delay: 40, alpha: 1 })],
      finisher: [layer('particles/crescent', 3.6, 560, { spin: 1.3, tone: 'core', alpha: 1 }), layer('particles/crescent', 3.6, 560, { spin: -1.3, delay: 50, alpha: 1 }), layer('impacts/petal-burst-a', 2.4, 580, { delay: 90, spin: .5 })],
    },
    sparks: {
      skill2: [spark('particles/thorn', 5, [180, 400], [320, 520], 26, { gravity: 260, rotate: 'random' })],
      finisher: [spark('particles/petal', 14, [180, 520], [420, 720], 26, { gravity: 140, rotate: 'spin' })],
    },
  },
  // Resonance blade: a struck ring rings out again and again, wind streaks turn through it.
  vaelor: {
    layers: {
      skill1: [layer('impacts/ring-sparkle', 1.3, 340, { from: .15 })],
      skill2: [layer('impacts/ring-sparkle', 1.6, 400, { from: .15 }), layer('impacts/radial-streaks-fade', 1.6, 400, { spin: 3, delay: 60 })],
      flare: [layer('impacts/ring-sparkle', 1.9, 360, { from: .15 }), layer('impacts/radial-streaks-fade', 1.9, 360, { spin: 3.4, delay: 40 })],
      finisher: [layer('impacts/ring-sparkle', 2.6, 580, { from: .15 }), layer('impacts/ring-sparkle', 2, 560, { from: .15, delay: 80 }), layer('impacts/radial-streaks-fade', 2.6, 560, { spin: 3.8, delay: 50 })],
    },
    sparks: {
      skill2: [spark('particles/star-thin', 5, [260, 600], [220, 380], 38)],
      finisher: [spark('particles/star-thin', 14, [380, 880], [260, 460], 42)],
    },
  },
  // Forge gauntlets: an anvil ring and a crack as the fist lands, embers drift up from the strike.
  caldrex: {
    layers: {
      skill1: [layer('impacts/ring-concentric', 1.5, 360, { from: .2, alpha: .8 })],
      skill2: [layer('impacts/ring-concentric', 2, 460, { from: .2, alpha: .8 }), layer('impacts/crack-burst', 1.6, 420, { delay: 70 })],
      flare: [layer('impacts/ring-concentric', 2.3, 400, { from: .2, alpha: .8 }), layer('impacts/crack-burst', 2, 380)],
      finisher: [layer('impacts/ring-concentric', 3.4, 680, { from: .2, alpha: .8 }), layer('impacts/crack-burst', 3, 620, { delay: 70 }), layer('impacts/ring-solar', 2.6, 600, { delay: 110, alpha: .6 })],
    },
    sparks: {
      skill2: [spark('particles/star-soft', 5, [120, 320], [360, 560], 30, { gravity: -260 })],
      finisher: [spark('particles/star-soft', 12, [160, 460], [420, 700], 34, { gravity: -260 })],
    },
  },
  // Chained counterweight: a wide swung wheel of streaks, then the weight drops with a solar ring.
  varkhel: {
    layers: {
      skill1: [layer('impacts/radial-streaks-fade', 1.6, 340, { spin: 2, tone: 'core' })],
      skill2: [layer('impacts/radial-streaks-fade', 2, 420, { spin: 2.2, tone: 'core' }), layer('impacts/ring-solar', 1.6, 440, { from: .2, delay: 100, alpha: .8 })],
      flare: [layer('impacts/radial-streaks-fade', 2.3, 380, { spin: 2.4, tone: 'core' }), layer('impacts/ring-solar', 1.9, 400, { from: .2, delay: 80, alpha: .8 })],
      finisher: [layer('impacts/radial-streaks-fade', 3, 580, { spin: 2.6, tone: 'core' }), layer('impacts/ring-solar', 3, 640, { from: .2, delay: 100, alpha: .8 }), layer('impacts/crack-burst', 2.6, 600, { delay: 120 })],
    },
    sparks: {
      skill2: [spark('particles/rock-shard', 4, [160, 380], [320, 520], 28, { gravity: 500, rotate: 'spin' })],
      finisher: [spark('particles/rock-shard', 12, [200, 520], [380, 660], 32, { gravity: 500, rotate: 'spin' })],
    },
  },
  // Temple bell shield: a runic ring tolls, a sigil answers, soft chimes ring out on support.
  solenne: {
    layers: {
      skill1: [layer('impacts/ring-runic', 1.3, 380, { spin: .2 })],
      skill2: [layer('impacts/ring-runic', 1.7, 480, { spin: .2 }), layer('impacts/sigil-circle', 1.4, 460, { spin: -.4, delay: 80 })],
      flare: [layer('impacts/ring-runic', 2, 420, { spin: .2 }), layer('impacts/sigil-circle', 1.7, 420, { spin: -.4, delay: 50 })],
      finisher: [layer('impacts/ring-runic', 2.9, 660, { spin: .2 }), layer('impacts/sigil-circle', 2.4, 640, { spin: -.4, delay: 70 }), layer('impacts/ring-sparkle', 3, 620, { from: .15, delay: 130 })],
      support: [layer('impacts/ring-runic', 1.5, 540, { spin: .2 }), layer('impacts/ring-sparkle', 1.5, 520, { from: .15, delay: 80 })],
    },
    sparks: {
      skill2: [spark('particles/star-soft', 4, [80, 200], [320, 520], 30, { gravity: -80 })],
      finisher: [spark('particles/star-soft', 10, [100, 300], [380, 620], 34, { gravity: -80 })],
    },
  },
  // Ferry lantern: rings of drifting water roll out one after another, soft mist trails behind the cast.
  maerion: {
    layers: {
      skill1: [layer('impacts/ring-dripping', 1.1, 360, { from: .15 })],
      skill2: [0, 90, 180].map(delay => layer('impacts/ring-dripping', 1.4, 420, { from: .15, delay })),
      flare: [0, 90].map(delay => layer('impacts/ring-dripping', 1.7, 380, { from: .15, delay })).concat(layer('impacts/ring-sparkle', 1.8, 400, { from: .15, delay: 160 })),
      finisher: [0, 90, 180].map(delay => layer('impacts/ring-dripping', 2.4, 600, { from: .15, delay })).concat(layer('impacts/ground-ripple', 3.2, 700, { from: .3, delay: 140, tone: 'edge' })),
      support: [layer('impacts/ring-dripping', 1.4, 540, { from: .15 })],
    },
    sparks: {
      skill2: [spark('particles/mist-wisp', 4, [50, 140], [440, 660], 48, { gravity: -50, rotate: 'random' })],
      finisher: [spark('particles/mist-wisp', 10, [70, 220], [500, 780], 54, { gravity: -50, rotate: 'random' })],
    },
  },
  // Watch counterweight: a heavy ring drops, a crack follows, rock thrown from the weight.
  caevren: {
    layers: {
      skill1: [layer('impacts/ring-concentric', 1.5, 380, { from: .2, alpha: .8 })],
      skill2: [layer('impacts/ring-concentric', 2, 480, { from: .2, alpha: .8 }), layer('impacts/crack-burst', 1.6, 420, { delay: 90 })],
      flare: [layer('impacts/ring-concentric', 2.3, 420, { from: .2, alpha: .8 }), layer('impacts/crack-burst', 2, 380, { delay: 40 })],
      finisher: [layer('impacts/ring-concentric', 3.4, 700, { from: .2, alpha: .8 }), layer('impacts/crack-burst', 3, 640, { delay: 80 }), layer('impacts/ring-runic', 2.8, 620, { spin: .2, delay: 130, alpha: .7 })],
      support: [layer('impacts/ring-runic', 1.5, 540, { spin: .2 })],
    },
    sparks: {
      skill2: [spark('particles/rock-shard', 4, [140, 320], [320, 500], 30, { gravity: 520, rotate: 'spin' })],
      finisher: [spark('particles/rock-shard', 12, [200, 500], [380, 660], 34, { gravity: 520, rotate: 'spin' })],
    },
  },
  // Beacon flame: a signal sigil kindles above a solar ring, embers lift like sparks off a brazier.
  vespera: {
    layers: {
      skill1: [layer('impacts/ring-solar', 1.3, 360, { from: .2 })],
      skill2: [layer('impacts/ring-solar', 1.7, 460, { from: .2 }), layer('impacts/sigil-circle', 1.4, 460, { spin: .5, delay: 70 })],
      flare: [layer('impacts/ring-solar', 2, 400, { from: .2 }), layer('impacts/sigil-circle', 1.7, 420, { spin: .5, delay: 50 })],
      finisher: [layer('impacts/ring-solar', 3, 640, { from: .2 }), layer('impacts/sigil-circle', 2.4, 640, { spin: .5, delay: 60 }), layer('flares/star-wisp', 2.6, 600, { delay: 110, tone: 'core' })],
      support: [layer('impacts/ring-solar', 1.5, 540, { from: .2 })],
    },
    sparks: {
      skill2: [spark('flares/star-wisp', 4, [100, 280], [340, 540], 36, { gravity: -280, rotate: 'random' })],
      finisher: [spark('flares/star-wisp', 10, [140, 420], [400, 680], 40, { gravity: -280, rotate: 'random' })],
    },
  },
  // Twin severing blades: two crossing cuts, a fault line, shadow wisps cut loose.
  ilyss: {
    layers: {
      skill1: [layer('impacts/x-cross', 1.3, 320, { spin: .2, tone: 'edge' })],
      skill2: [layer('impacts/x-cross', 1.6, 400, { spin: .2, tone: 'edge' }), layer('particles/crescent', 2.2, 400, { spin: -.9, delay: 60, tone: 'core', alpha: 1 })],
      flare: [layer('impacts/x-cross', 1.9, 360, { spin: .2, tone: 'edge' }), layer('particles/crescent', 2.4, 360, { spin: -.9, tone: 'core', alpha: 1 })],
      finisher: [layer('impacts/x-cross', 2.6, 560, { spin: .2, tone: 'edge' }), layer('particles/crescent', 3.4, 580, { spin: -1, delay: 50, tone: 'core', alpha: 1 }), layer('impacts/crack-burst', 2.6, 600, { delay: 100 })],
      support: [layer('impacts/ring-cosmic', 1.3, 520, { spin: .3 })],
    },
    sparks: {
      skill2: [spark('particles/mist-wisp', 4, [60, 160], [420, 640], 46, { gravity: -40, rotate: 'random' })],
      finisher: [spark('particles/mist-wisp', 10, [80, 240], [480, 760], 52, { gravity: -40, rotate: 'random' })],
    },
  },
  // Orbit staff: a ring of petals circles the target, a second ring turns the other way.
  asteriel: {
    layers: {
      skill1: [layer('impacts/petal-burst-b', 1.2, 340, { spin: .8 })],
      skill2: [layer('impacts/petal-burst-b', 1.5, 440, { spin: .8 }), layer('impacts/ring-thorned', 1.7, 460, { spin: -.6, delay: 70 })],
      flare: [layer('impacts/petal-burst-a', 1.9, 400, { spin: .8 }), layer('impacts/ring-thorned', 2, 420, { spin: -.6, delay: 50 })],
      finisher: [layer('impacts/petal-burst-a', 2.8, 640, { spin: .9 }), layer('impacts/ring-thorned', 3, 640, { spin: -.7, delay: 60 }), layer('impacts/ring-sparkle', 3, 620, { from: .15, delay: 120 })],
      support: [layer('impacts/petal-burst-b', 1.4, 520, { spin: .6 })],
    },
    sparks: {
      skill2: [spark('particles/petal', 5, [60, 180], [400, 640], 24, { gravity: -60, rotate: 'spin' })],
      finisher: [spark('particles/petal', 12, [80, 260], [460, 760], 26, { gravity: -60, rotate: 'spin' })],
    },
  },
  // Interval shield: a runic ring holds, a bright ring answers after a beat, chimes drift upward.
  serapha: {
    layers: {
      skill1: [layer('impacts/ring-runic', 1.3, 380, { spin: .2 })],
      skill2: [layer('impacts/ring-runic', 1.7, 480, { spin: .2 }), layer('impacts/ring-sparkle', 1.6, 440, { from: .15, delay: 140 })],
      flare: [layer('impacts/ring-runic', 2, 420, { spin: .2 }), layer('impacts/ring-sparkle', 1.9, 400, { from: .15, delay: 120 })],
      finisher: [layer('impacts/ring-runic', 2.9, 660, { spin: .2 }), layer('impacts/ring-sparkle', 2.6, 620, { from: .15, delay: 120 }), layer('impacts/ring-sparkle', 3.2, 640, { from: .15, delay: 240 })],
      support: [layer('impacts/ring-runic', 1.5, 540, { spin: .2 }), layer('impacts/ring-sparkle', 1.4, 520, { from: .15, delay: 140 })],
    },
    sparks: {
      skill2: [spark('particles/star-soft', 4, [70, 190], [340, 540], 30, { gravity: -80 })],
      finisher: [spark('particles/star-soft', 10, [90, 280], [400, 640], 34, { gravity: -80 })],
    },
  },
  // Convoy lance: a narrow thrust beam and a ring per cadence beat, embers kicked back along the line.
  seravelle: {
    travel: { kind: 'orb', texture: 'beams/streak', px: 72, spin: 0, trail: 'flares/star-wisp', trailPx: 16 },
    layers: {
      skill1: [layer('impacts/ring-solar', 1.2, 340, { from: .2 })],
      skill2: [0, 70].map(delay => layer('impacts/ring-solar', 1.5, 400, { from: .2, delay })),
      flare: [0, 70, 140].map(delay => layer('impacts/ring-solar', 1.6, 360, { from: .2, delay })),
      finisher: [0, 70, 140].map(delay => layer('impacts/ring-solar', 2.4, 580, { from: .2, delay })).concat(layer('impacts/radial-streaks-fade', 2.6, 560, { spin: 2, delay: 110, tone: 'core' })),
      support: [layer('impacts/ring-solar', 1.4, 520, { from: .2 })],
    },
    sparks: {
      skill2: [spark('flares/star-wisp', 4, [140, 340], [300, 480], 36, { gravity: -220, rotate: 'random' })],
      finisher: [spark('flares/star-wisp', 10, [200, 520], [360, 600], 40, { gravity: -220, rotate: 'random' })],
    },
  },
  // Unfastened court blades: two crescents cross in opposite turns, then a cut line splits the target.
  velmira: {
    layers: {
      skill1: [layer('particles/crescent', 2, 320, { spin: 1, tone: 'core', alpha: 1 }), layer('particles/crescent', 2, 320, { spin: -1, delay: 40, tone: 'edge', alpha: 1 })],
      skill2: [layer('particles/crescent', 2.6, 400, { spin: 1.1, tone: 'core', alpha: 1 }), layer('particles/crescent', 2.6, 400, { spin: -1.1, delay: 60, tone: 'edge', alpha: 1 })],
      flare: [layer('particles/crescent', 2.8, 360, { spin: 1.2, tone: 'core', alpha: 1 }), layer('particles/crescent', 2.8, 360, { spin: -1.2, delay: 40, tone: 'edge', alpha: 1 })],
      finisher: [layer('particles/crescent', 3.6, 560, { spin: 1.3, tone: 'core', alpha: 1 }), layer('particles/crescent', 3.6, 560, { spin: -1.3, delay: 50, tone: 'edge', alpha: 1 }), layer('impacts/shatter-web', 2.8, 640, { delay: 100, alpha: .6 })],
    },
    sparks: {
      skill2: [spark('particles/mist-wisp', 4, [60, 160], [420, 640], 46, { gravity: -40, rotate: 'random' })],
      finisher: [spark('particles/mist-wisp', 10, [80, 240], [480, 760], 52, { gravity: -40, rotate: 'random' })],
    },
  },
};

const cache = new Map<string, ElementStyle>();
/** The bearer's element base with its signature on top; the base itself when it has none. */
export function bearerElementStyle(starterId: string | null | undefined, elementId: string | null | undefined): ElementStyle {
  const base = elementStyle(elementId);
  const signature = starterId && Object.hasOwn(bearerSignatures, starterId) ? bearerSignatures[starterId] : null;
  if (!signature) return base;
  const key = `${starterId}:${base.id}`;
  let merged = cache.get(key);
  if (!merged) {
    const append = <T>(own: Record<BurstKind, T[]>, extra: Partial<Record<SignatureKind, T[]>> | undefined): Record<BurstKind, T[]> => {
      const next = { ...own };
      for (const kind of Object.keys(extra ?? {}) as SignatureKind[]) next[kind] = [...own[kind], ...extra![kind]!];
      return next;
    };
    merged = {
      ...base,
      layers: append(base.layers, signature.layers),
      sparks: append(base.sparks, signature.sparks),
      travel: signature.travel ?? base.travel,
      overlay: signature.overlay ?? base.overlay,
      sigil: signature.sigil ?? base.sigil,
      pulse: signature.pulse ?? base.pulse,
      motes: signature.motes ?? base.motes,
    };
    cache.set(key, merged);
  }
  return merged;
}
