/**
 * Textures from the owner's VFX library (D-482) used by the battle GPU layer
 * (D-484). All are grayscale (L/LA) light on black, drawn additively and
 * tinted per element at runtime. Keys are paths under public/assets/vfx.
 * The second group carries the six element shape grammars (D-485).
 */
import { avifPreferred } from '../presentation/image-format';

export const spectacleTextures = [
  'particles/star-hard',
  'particles/star-soft',
  'particles/star-thin',
  'particles/crystal-shard',
  'glow/point-bloom',
  'glow/radial-bloom',
  'glow/soft-glow',
  'flares/starburst-8point',
  'flares/supernova',
  'impacts/ring-concentric',
  'impacts/ring-flare',
  'impacts/radial-streaks-fade',
  'impacts/radial-spikes',
  'impacts/flare-burst',
  'impacts/shatter-burst',
  'beams/streak',
  'trails/trail-basic',
  'projectiles/gyre-orb',
  // Element grammars (D-485).
  'impacts/ring-solar', 'flares/star-wisp', 'beams/plasma-core',
  'beams/tide', 'impacts/ring-dripping', 'impacts/ground-ripple', 'trails/ribbon-standing-wave', 'particles/mist-wisp',
  'beams/storm', 'impacts/x-cross', 'flares/star-sharp', 'impacts/ring-sparkle',
  'impacts/petal-burst-a', 'impacts/petal-burst-b', 'impacts/ring-thorned', 'particles/petal', 'particles/thorn',
  'trails/petal-spray',
  'impacts/sigil-circle', 'impacts/ring-runic', 'impacts/ring-cosmic', 'particles/crescent', 'beams/glyph-stream',
  'impacts/shatter-web', 'impacts/crack-burst', 'beams/fissure', 'particles/rock-shard', 'beams/smoke-stream',
] as const;
export type SpectacleTexture = (typeof spectacleTextures)[number];

export function spectacleTextureUrl(key: SpectacleTexture, format: 'avif' | 'png' = avifPreferred() ? 'avif' : 'png'): string {
  return `${import.meta.env.BASE_URL}assets/vfx/${key}.${format}`;
}
/** Pixel size of a texture's longest edge (tools/intake_vfx_library.py). */
export function textureEdge(key: SpectacleTexture): number {
  if (key === 'particles/star-hard' || key === 'particles/star-soft' || key === 'particles/star-thin') return 32;
  const category = key.split('/')[0];
  return category === 'particles' ? 128 : category === 'glow' || category === 'flares' || category === 'projectiles' ? 256 : 512;
}
