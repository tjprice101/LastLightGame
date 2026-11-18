/**
 * Textures from the owner's VFX library (D-482) used by the battle GPU layer
 * (D-484). All are grayscale (L/LA) light on black, drawn additively and
 * tinted per element at runtime. Keys are paths under public/assets/vfx.
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
  'glow/glow-orb',
  'flares/starburst-8point',
  'flares/supernova',
  'impacts/ring-concentric',
  'impacts/ring-flare',
  'impacts/impact-ellipse',
  'impacts/radial-streaks-fade',
  'impacts/radial-spikes',
  'impacts/flare-burst',
  'impacts/shatter-burst',
  'beams/streak',
  'trails/trail-basic',
  'projectiles/gyre-orb',
] as const;
export type SpectacleTexture = (typeof spectacleTextures)[number];

export function spectacleTextureUrl(key: SpectacleTexture, format: 'avif' | 'png' = avifPreferred() ? 'avif' : 'png'): string {
  return `${import.meta.env.BASE_URL}assets/vfx/${key}.${format}`;
}
