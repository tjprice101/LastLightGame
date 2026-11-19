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
