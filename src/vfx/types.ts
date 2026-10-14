/**
 * Comprehensive VFX System Types & Interfaces
 * Powers AAA-inspired particle physics, optical bloom, anamorphic flares,
 * and completely unique VFX architectures for every character and ability.
 */

export interface ColorStop {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface VFXPalette {
  name: string;
  id: string;
  core: ColorStop;        // White-hot plasma core
  inner: ColorStop;       // High-temperature inner mantle
  mid: ColorStop;         // Primary body
  outer: ColorStop;       // Outer aura / fringe
  spectral: ColorStop;    // Ethereal / secondary highlight
  smoke: ColorStop;        // Cooling residue / shadow
  groundGlow: string;
}

export type AbilityTier = 'light' | 'skill1' | 'skill2' | 'ultimate';

export type VFXArchetype =
  | 'slash'           // Greatsword cleaves, dual blade crosses, curved slash waves
  | 'beam'            // Prismatic lasers, photon beams, acoustic harmonic lances
  | 'mandala'         // Sacred geometry, blooming flowers, rotating feather quills
  | 'slam'            // Hammer impacts, seismic ground fissures, basalt spire eruptions
  | 'vortex'          // Tornadoes, air blades, black hole singularities, whirlpools
  | 'volley'          // Multi-projectile flurries, bouncing shurikens, rapid thrusts
  | 'cataclysm';       // Full-screen cinematic Last Flare ultimates

export interface AbilityVFXDefinition {
  name: string;
  tier: AbilityTier;
  archetype: VFXArchetype;
  description: string;
  palette: VFXPalette;
  duration: number; // in seconds
  chargeDuration: number;
  impactDuration: number;
}

export interface CharacterVFXProfile {
  characterId: string;
  characterName: string;
  element: string;
  elementId: string;
  signature: string;
  weapon: string;
  abilities: Record<AbilityTier, AbilityVFXDefinition>;
}

export interface VFXContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  casterX: number;
  casterY: number;
  targetX: number;
  targetY: number;
  t: number;               // Normalized or absolute time in seconds
  dt: number;              // Delta time
  progress: number;        // Normalized progress (0 to 1)
  scale: number;           // Rendering scale
  palette: VFXPalette;
  definition: AbilityVFXDefinition;
  secondaryTarget?: boolean;
  shakeCallback: (magnitude: number) => void;
}

export interface BaseVFXSystem {
  readonly id: string;
  reset(): void;
  update(ctx: VFXContext): void;
  renderBackground?(ctx: VFXContext): void;
  render(ctx: VFXContext): void;
  renderOptical?(ctx: VFXContext): void;
}
