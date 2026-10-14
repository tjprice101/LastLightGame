/**
 * Wisping Flame Attack VFX Engine
 * AAA-inspired particle physics, fluid ribbon paths, procedural flame tongues,
 * multi-tier bloom, anamorphic lens flares, dynamic ground lighting, and shockwaves.
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
  inner: ColorStop;       // High-temperature inner mantle (e.g. golden yellow)
  mid: ColorStop;         // Main flame body (e.g. fiery orange)
  outer: ColorStop;       // Outer flame envelope (e.g. deep crimson)
  spectral: ColorStop;    // Ghost / wisp base halo (e.g. ethereal violet or deep blue)
  smoke: ColorStop;        // Cooling smoke / ash
  groundGlow: string;
}

export const PALETTES: Record<string, VFXPalette> = {
  infernal: {
    name: 'Infernal Blaze',
    id: 'infernal',
    core: { r: 255, g: 255, b: 255, a: 1.0 },
    inner: { r: 255, g: 220, b: 90, a: 0.95 },
    mid: { r: 255, g: 110, b: 15, a: 0.9 },
    outer: { r: 220, g: 30, b: 5, a: 0.75 },
    spectral: { r: 140, g: 25, b: 170, a: 0.5 },
    smoke: { r: 45, g: 35, b: 40, a: 0.4 },
    groundGlow: 'rgba(255, 100, 20, 0.35)',
  },
  soulfire: {
    name: 'Soulfire Spirit',
    id: 'soulfire',
    core: { r: 240, g: 255, b: 255, a: 1.0 },
    inner: { r: 120, g: 245, b: 255, a: 0.95 },
    mid: { r: 20, g: 170, b: 255, a: 0.9 },
    outer: { r: 10, g: 60, b: 220, a: 0.75 },
    spectral: { r: 110, g: 20, b: 200, a: 0.5 },
    smoke: { r: 20, g: 30, b: 45, a: 0.4 },
    groundGlow: 'rgba(30, 180, 255, 0.35)',
  },
  abyssal: {
    name: 'Abyssal Voidflame',
    id: 'abyssal',
    core: { r: 255, g: 245, b: 255, a: 1.0 },
    inner: { r: 235, g: 140, b: 255, a: 0.95 },
    mid: { r: 170, g: 40, b: 240, a: 0.9 },
    outer: { r: 90, g: 10, b: 160, a: 0.75 },
    spectral: { r: 220, g: 30, b: 120, a: 0.5 },
    smoke: { r: 30, g: 18, b: 35, a: 0.4 },
    groundGlow: 'rgba(180, 50, 255, 0.35)',
  },
  solar: {
    name: 'Solar Radiance',
    id: 'solar',
    core: { r: 255, g: 255, b: 255, a: 1.0 },
    inner: { r: 255, g: 245, b: 160, a: 0.95 },
    mid: { r: 255, g: 190, b: 40, a: 0.9 },
    outer: { r: 255, g: 110, b: 10, a: 0.75 },
    spectral: { r: 255, g: 70, b: 140, a: 0.45 },
    smoke: { r: 50, g: 45, b: 35, a: 0.4 },
    groundGlow: 'rgba(255, 200, 50, 0.4)',
  },
  verdant: {
    name: 'Verdant Will-o-Wisp',
    id: 'verdant',
    core: { r: 255, g: 255, b: 240, a: 1.0 },
    inner: { r: 180, g: 255, b: 130, a: 0.95 },
    mid: { r: 50, g: 220, b: 70, a: 0.9 },
    outer: { r: 10, g: 140, b: 60, a: 0.75 },
    spectral: { r: 20, g: 200, b: 190, a: 0.5 },
    smoke: { r: 20, g: 40, b: 30, a: 0.4 },
    groundGlow: 'rgba(60, 220, 90, 0.35)',
  },
  ember: {
    name: 'Infernis · Searing Flame',
    id: 'ember',
    core: { r: 255, g: 255, b: 255, a: 1.0 },
    inner: { r: 255, g: 200, b: 70, a: 0.95 },
    mid: { r: 255, g: 90, b: 15, a: 0.9 },
    outer: { r: 210, g: 25, b: 5, a: 0.75 },
    spectral: { r: 160, g: 30, b: 180, a: 0.5 },
    smoke: { r: 45, g: 30, b: 35, a: 0.4 },
    groundGlow: 'rgba(255, 90, 15, 0.38)',
  },
  tide: {
    name: 'Tizu · Oceanic Hydro',
    id: 'tide',
    core: { r: 240, g: 255, b: 255, a: 1.0 },
    inner: { r: 100, g: 235, b: 255, a: 0.95 },
    mid: { r: 15, g: 150, b: 255, a: 0.9 },
    outer: { r: 5, g: 60, b: 210, a: 0.75 },
    spectral: { r: 80, g: 220, b: 240, a: 0.5 },
    smoke: { r: 20, g: 35, b: 50, a: 0.4 },
    groundGlow: 'rgba(20, 160, 255, 0.38)',
  },
  sprout: {
    name: 'Flora · Botanic Verdance',
    id: 'sprout',
    core: { r: 255, g: 255, b: 235, a: 1.0 },
    inner: { r: 175, g: 255, b: 120, a: 0.95 },
    mid: { r: 50, g: 210, b: 70, a: 0.9 },
    outer: { r: 15, g: 130, b: 55, a: 0.75 },
    spectral: { r: 230, g: 100, b: 160, a: 0.5 },
    smoke: { r: 25, g: 45, b: 30, a: 0.4 },
    groundGlow: 'rgba(60, 220, 80, 0.38)',
  },
  atmoso: {
    name: 'Atmoso · Tempest Gale',
    id: 'atmoso',
    core: { r: 255, g: 255, b: 255, a: 1.0 },
    inner: { r: 180, g: 245, b: 230, a: 0.95 },
    mid: { r: 80, g: 215, b: 180, a: 0.9 },
    outer: { r: 20, g: 150, b: 120, a: 0.75 },
    spectral: { r: 140, g: 210, b: 255, a: 0.5 },
    smoke: { r: 35, g: 45, b: 45, a: 0.4 },
    groundGlow: 'rgba(70, 220, 180, 0.38)',
  },
  aurora: {
    name: 'Aurora · Prismatic Dawn',
    id: 'aurora',
    core: { r: 255, g: 255, b: 255, a: 1.0 },
    inner: { r: 255, g: 245, b: 170, a: 0.95 },
    mid: { r: 255, g: 200, b: 50, a: 0.9 },
    outer: { r: 230, g: 130, b: 20, a: 0.75 },
    spectral: { r: 255, g: 80, b: 180, a: 0.5 },
    smoke: { r: 45, g: 40, b: 35, a: 0.4 },
    groundGlow: 'rgba(255, 210, 60, 0.4)',
  },
  bliss: {
    name: 'Bliss · Seraphic Feather',
    id: 'bliss',
    core: { r: 255, g: 255, b: 250, a: 1.0 },
    inner: { r: 255, g: 240, b: 180, a: 0.95 },
    mid: { r: 245, g: 195, b: 65, a: 0.9 },
    outer: { r: 200, g: 145, b: 25, a: 0.75 },
    spectral: { r: 255, g: 140, b: 210, a: 0.5 },
    smoke: { r: 45, g: 40, b: 30, a: 0.4 },
    groundGlow: 'rgba(250, 205, 75, 0.4)',
  },
  bruno: {
    name: 'Bruno · Tectonic Fault',
    id: 'bruno',
    core: { r: 255, g: 250, b: 220, a: 1.0 },
    inner: { r: 255, g: 190, b: 60, a: 0.95 },
    mid: { r: 210, g: 110, b: 20, a: 0.9 },
    outer: { r: 130, g: 60, b: 10, a: 0.8 },
    spectral: { r: 180, g: 75, b: 25, a: 0.5 },
    smoke: { r: 50, g: 40, b: 30, a: 0.45 },
    groundGlow: 'rgba(220, 120, 25, 0.4)',
  },
  disciple: {
    name: 'Disciple · Astral Mind',
    id: 'disciple',
    core: { r: 255, g: 240, b: 255, a: 1.0 },
    inner: { r: 220, g: 140, b: 255, a: 0.95 },
    mid: { r: 160, g: 45, b: 245, a: 0.9 },
    outer: { r: 90, g: 10, b: 180, a: 0.75 },
    spectral: { r: 240, g: 40, b: 150, a: 0.55 },
    smoke: { r: 35, g: 20, b: 40, a: 0.4 },
    groundGlow: 'rgba(170, 50, 255, 0.38)',
  },
  elise: {
    name: 'Elise · High-Voltage Blitz',
    id: 'elise',
    core: { r: 245, g: 255, b: 255, a: 1.0 },
    inner: { r: 140, g: 235, b: 255, a: 0.95 },
    mid: { r: 30, g: 170, b: 255, a: 0.9 },
    outer: { r: 10, g: 90, b: 220, a: 0.75 },
    spectral: { r: 200, g: 70, b: 255, a: 0.5 },
    smoke: { r: 20, g: 30, b: 45, a: 0.4 },
    groundGlow: 'rgba(40, 180, 255, 0.4)',
  },
  razor: {
    name: 'Razor · Eclipse Void',
    id: 'razor',
    core: { r: 245, g: 235, b: 255, a: 1.0 },
    inner: { r: 195, g: 110, b: 255, a: 0.95 },
    mid: { r: 130, g: 30, b: 220, a: 0.9 },
    outer: { r: 65, g: 5, b: 130, a: 0.8 },
    spectral: { r: 210, g: 20, b: 100, a: 0.5 },
    smoke: { r: 25, g: 15, b: 35, a: 0.45 },
    groundGlow: 'rgba(140, 35, 230, 0.38)',
  },
  rosetta: {
    name: 'Rosetta · Solar Rose',
    id: 'rosetta',
    core: { r: 255, g: 250, b: 240, a: 1.0 },
    inner: { r: 255, g: 180, b: 140, a: 0.95 },
    mid: { r: 245, g: 70, b: 100, a: 0.9 },
    outer: { r: 190, g: 20, b: 60, a: 0.75 },
    spectral: { r: 255, g: 200, b: 60, a: 0.55 },
    smoke: { r: 45, g: 30, b: 35, a: 0.4 },
    groundGlow: 'rgba(250, 75, 110, 0.38)',
  },
  thornia: {
    name: 'Thornia · Twilight Bramble',
    id: 'thornia',
    core: { r: 255, g: 240, b: 250, a: 1.0 },
    inner: { r: 240, g: 110, b: 170, a: 0.95 },
    mid: { r: 195, g: 25, b: 110, a: 0.9 },
    outer: { r: 120, g: 10, b: 70, a: 0.8 },
    spectral: { r: 160, g: 35, b: 210, a: 0.5 },
    smoke: { r: 35, g: 20, b: 30, a: 0.4 },
    groundGlow: 'rgba(200, 30, 115, 0.38)',
  },
  crinso: {
    name: 'Crinso · Dual Flame-Lightning',
    id: 'crinso',
    core: { r: 255, g: 255, b: 255, a: 1.0 },
    inner: { r: 255, g: 210, b: 80, a: 0.95 },
    mid: { r: 250, g: 90, b: 25, a: 0.9 },
    outer: { r: 210, g: 20, b: 40, a: 0.75 },
    spectral: { r: 255, g: 190, b: 20, a: 0.6 },
    smoke: { r: 45, g: 30, b: 35, a: 0.4 },
    groundGlow: 'rgba(255, 110, 30, 0.4)',
  },
  nerithe: {
    name: 'Nerithe · Abyssal Tidal',
    id: 'nerithe',
    core: { r: 235, g: 255, b: 255, a: 1.0 },
    inner: { r: 80, g: 230, b: 250, a: 0.95 },
    mid: { r: 10, g: 160, b: 220, a: 0.9 },
    outer: { r: 5, g: 80, b: 160, a: 0.8 },
    spectral: { r: 40, g: 210, b: 190, a: 0.5 },
    smoke: { r: 18, g: 32, b: 48, a: 0.4 },
    groundGlow: 'rgba(15, 175, 230, 0.38)',
  },
  orvella: {
    name: 'Orvella · Living Citadel',
    id: 'orvella',
    core: { r: 250, g: 255, b: 240, a: 1.0 },
    inner: { r: 170, g: 245, b: 130, a: 0.95 },
    mid: { r: 60, g: 190, b: 75, a: 0.9 },
    outer: { r: 25, g: 115, b: 45, a: 0.8 },
    spectral: { r: 210, g: 230, b: 100, a: 0.5 },
    smoke: { r: 30, g: 45, b: 30, a: 0.4 },
    groundGlow: 'rgba(70, 200, 85, 0.38)',
  },
  vaelor: {
    name: 'Vaelor · Harmonic Resonance',
    id: 'vaelor',
    core: { r: 245, g: 255, b: 250, a: 1.0 },
    inner: { r: 140, g: 245, b: 215, a: 0.95 },
    mid: { r: 35, g: 195, b: 160, a: 0.9 },
    outer: { r: 10, g: 135, b: 105, a: 0.8 },
    spectral: { r: 100, g: 220, b: 255, a: 0.55 },
    smoke: { r: 25, g: 42, b: 40, a: 0.4 },
    groundGlow: 'rgba(40, 205, 170, 0.38)',
  },
};

export type MotionStyle = 'wave' | 'laser' | 'zigzag' | 'arc' | 'vortex' | 'spiral';
export type AbilityTier = 'light' | 'skill1' | 'skill2' | 'ultimate';

export interface AbilityVFXConfig {
  name: string;
  ribbonWidth: number;
  particleDensity: number;
  bloomScale: number;
  streakScale: number;
  speed: number;
}

export interface CharacterPreset {
  id: string;
  name: string;
  element: string;
  motionStyle: MotionStyle;
  abilities: Record<AbilityTier, AbilityVFXConfig>;
}

export const CHARACTER_PRESETS: Record<string, CharacterPreset> = {
  ember: {
    id: 'ember', name: 'Infernis', element: 'Infernic', motionStyle: 'wave',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 16, particleDensity: 0.6, bloomScale: 0.8, streakScale: 0.8, speed: 1.1 },
      skill1: { name: 'Cinder Cleave', ribbonWidth: 26, particleDensity: 1.0, bloomScale: 1.2, streakScale: 1.2, speed: 1.0 },
      skill2: { name: 'Flame Arc', ribbonWidth: 32, particleDensity: 1.4, bloomScale: 1.4, streakScale: 1.4, speed: 0.95 },
      ultimate: { name: 'Last Flare: Dawnfire', ribbonWidth: 44, particleDensity: 2.2, bloomScale: 2.2, streakScale: 2.4, speed: 0.9 },
    },
  },
  tide: {
    id: 'tide', name: 'Tizu', element: 'Oceanic', motionStyle: 'spiral',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 14, particleDensity: 0.6, bloomScale: 0.8, streakScale: 0.8, speed: 1.2 },
      skill1: { name: 'Torrent Thrust', ribbonWidth: 24, particleDensity: 1.0, bloomScale: 1.1, streakScale: 1.2, speed: 1.1 },
      skill2: { name: 'Ocean Wall', ribbonWidth: 30, particleDensity: 1.3, bloomScale: 1.3, streakScale: 1.3, speed: 0.9 },
      ultimate: { name: 'Last Flare: Leviathan', ribbonWidth: 42, particleDensity: 2.0, bloomScale: 2.0, streakScale: 2.2, speed: 0.85 },
    },
  },
  sprout: {
    id: 'sprout', name: 'Flora', element: 'Botanic', motionStyle: 'arc',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 12, particleDensity: 0.5, bloomScale: 0.7, streakScale: 0.7, speed: 1.2 },
      skill1: { name: 'Petal Shot', ribbonWidth: 22, particleDensity: 1.0, bloomScale: 1.1, streakScale: 1.1, speed: 1.1 },
      skill2: { name: 'Verdant Briar', ribbonWidth: 28, particleDensity: 1.4, bloomScale: 1.3, streakScale: 1.2, speed: 0.95 },
      ultimate: { name: 'Last Flare: World Tree', ribbonWidth: 40, particleDensity: 2.1, bloomScale: 2.1, streakScale: 2.2, speed: 0.85 },
    },
  },
  atmoso: {
    id: 'atmoso', name: 'Atmoso', element: 'Atmospheric', motionStyle: 'vortex',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 14, particleDensity: 0.6, bloomScale: 0.8, streakScale: 0.9, speed: 1.3 },
      skill1: { name: 'Zephyr Gale', ribbonWidth: 24, particleDensity: 1.1, bloomScale: 1.2, streakScale: 1.3, speed: 1.15 },
      skill2: { name: 'Vortex Burst', ribbonWidth: 32, particleDensity: 1.5, bloomScale: 1.5, streakScale: 1.5, speed: 1.0 },
      ultimate: { name: 'Last Flare: Tempest', ribbonWidth: 46, particleDensity: 2.4, bloomScale: 2.3, streakScale: 2.5, speed: 0.95 },
    },
  },
  aurora: {
    id: 'aurora', name: 'Aurora', element: 'Tranquilitic', motionStyle: 'laser',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 10, particleDensity: 0.5, bloomScale: 0.9, streakScale: 1.2, speed: 1.4 },
      skill1: { name: 'Prismatic Ray', ribbonWidth: 20, particleDensity: 0.9, bloomScale: 1.4, streakScale: 1.8, speed: 1.3 },
      skill2: { name: 'Dawn Barrier', ribbonWidth: 28, particleDensity: 1.3, bloomScale: 1.7, streakScale: 2.0, speed: 1.0 },
      ultimate: { name: 'Last Flare: Supernova', ribbonWidth: 38, particleDensity: 2.0, bloomScale: 2.8, streakScale: 3.0, speed: 1.1 },
    },
  },
  bliss: {
    id: 'bliss', name: 'Bliss', element: 'Tranquilitic', motionStyle: 'wave',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 14, particleDensity: 0.6, bloomScale: 0.8, streakScale: 0.8, speed: 1.15 },
      skill1: { name: 'Seraph Feather', ribbonWidth: 24, particleDensity: 1.1, bloomScale: 1.3, streakScale: 1.3, speed: 1.05 },
      skill2: { name: 'Divine Chorus', ribbonWidth: 30, particleDensity: 1.5, bloomScale: 1.6, streakScale: 1.5, speed: 0.95 },
      ultimate: { name: 'Last Flare: Ascension', ribbonWidth: 44, particleDensity: 2.3, bloomScale: 2.4, streakScale: 2.4, speed: 0.9 },
    },
  },
  bruno: {
    id: 'bruno', name: 'Bruno', element: 'Botanic', motionStyle: 'arc',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 18, particleDensity: 0.6, bloomScale: 0.8, streakScale: 0.7, speed: 1.0 },
      skill1: { name: 'Seismic Bash', ribbonWidth: 28, particleDensity: 1.2, bloomScale: 1.2, streakScale: 1.0, speed: 0.95 },
      skill2: { name: 'Earth Wall', ribbonWidth: 34, particleDensity: 1.5, bloomScale: 1.4, streakScale: 1.1, speed: 0.9 },
      ultimate: { name: 'Last Flare: Tectonic Rupture', ribbonWidth: 48, particleDensity: 2.5, bloomScale: 2.2, streakScale: 1.8, speed: 0.85 },
    },
  },
  disciple: {
    id: 'disciple', name: 'Disciple', element: 'Chaotic', motionStyle: 'spiral',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 12, particleDensity: 0.5, bloomScale: 0.9, streakScale: 0.9, speed: 1.2 },
      skill1: { name: 'Mind Lance', ribbonWidth: 22, particleDensity: 1.0, bloomScale: 1.3, streakScale: 1.4, speed: 1.1 },
      skill2: { name: 'Astral Singularity', ribbonWidth: 32, particleDensity: 1.6, bloomScale: 1.7, streakScale: 1.8, speed: 0.95 },
      ultimate: { name: 'Last Flare: Cosmic Transcendence', ribbonWidth: 46, particleDensity: 2.4, bloomScale: 2.6, streakScale: 2.6, speed: 0.9 },
    },
  },
  elise: {
    id: 'elise', name: 'Elise', element: 'Atmospheric', motionStyle: 'zigzag',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 10, particleDensity: 0.7, bloomScale: 0.9, streakScale: 1.2, speed: 1.5 },
      skill1: { name: 'Blitz Shuriken', ribbonWidth: 20, particleDensity: 1.2, bloomScale: 1.4, streakScale: 1.7, speed: 1.35 },
      skill2: { name: 'Plasma Storm', ribbonWidth: 28, particleDensity: 1.7, bloomScale: 1.8, streakScale: 2.1, speed: 1.15 },
      ultimate: { name: 'Last Flare: Thunder God', ribbonWidth: 42, particleDensity: 2.6, bloomScale: 2.7, streakScale: 3.0, speed: 1.1 },
    },
  },
  razor: {
    id: 'razor', name: 'Razor', element: 'Chaotic', motionStyle: 'spiral',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 16, particleDensity: 0.5, bloomScale: 0.8, streakScale: 0.8, speed: 1.1 },
      skill1: { name: 'Shadow Cleave', ribbonWidth: 26, particleDensity: 1.0, bloomScale: 1.2, streakScale: 1.2, speed: 1.05 },
      skill2: { name: 'Eclipse Barrier', ribbonWidth: 32, particleDensity: 1.5, bloomScale: 1.6, streakScale: 1.5, speed: 0.9 },
      ultimate: { name: 'Last Flare: Event Horizon', ribbonWidth: 46, particleDensity: 2.3, bloomScale: 2.5, streakScale: 2.5, speed: 0.85 },
    },
  },
  rosetta: {
    id: 'rosetta', name: 'Rosetta', element: 'Tranquilitic', motionStyle: 'arc',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 12, particleDensity: 0.5, bloomScale: 0.8, streakScale: 0.9, speed: 1.25 },
      skill1: { name: 'Solar Arrow', ribbonWidth: 22, particleDensity: 1.0, bloomScale: 1.3, streakScale: 1.4, speed: 1.2 },
      skill2: { name: 'Thorn Mandala', ribbonWidth: 30, particleDensity: 1.5, bloomScale: 1.6, streakScale: 1.6, speed: 1.0 },
      ultimate: { name: 'Last Flare: Crimson Blossom', ribbonWidth: 44, particleDensity: 2.3, bloomScale: 2.4, streakScale: 2.6, speed: 0.9 },
    },
  },
  thornia: {
    id: 'thornia', name: 'Thornia', element: 'Chaotic', motionStyle: 'wave',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 16, particleDensity: 0.6, bloomScale: 0.8, streakScale: 0.8, speed: 1.1 },
      skill1: { name: 'Bramble Slash', ribbonWidth: 26, particleDensity: 1.1, bloomScale: 1.2, streakScale: 1.2, speed: 1.0 },
      skill2: { name: 'Twilight Ward', ribbonWidth: 32, particleDensity: 1.5, bloomScale: 1.5, streakScale: 1.4, speed: 0.9 },
      ultimate: { name: 'Last Flare: Thorn Cataclysm', ribbonWidth: 46, particleDensity: 2.4, bloomScale: 2.3, streakScale: 2.3, speed: 0.85 },
    },
  },
  crinso: {
    id: 'crinso', name: 'Crinso', element: 'Infernic', motionStyle: 'zigzag',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 14, particleDensity: 0.6, bloomScale: 0.8, streakScale: 0.9, speed: 1.2 },
      skill1: { name: 'Twin Blade', ribbonWidth: 24, particleDensity: 1.1, bloomScale: 1.3, streakScale: 1.4, speed: 1.1 },
      skill2: { name: 'Flame & Thunder', ribbonWidth: 32, particleDensity: 1.6, bloomScale: 1.7, streakScale: 1.8, speed: 1.0 },
      ultimate: { name: 'Last Flare: Dual Chaos', ribbonWidth: 46, particleDensity: 2.5, bloomScale: 2.6, streakScale: 2.8, speed: 0.9 },
    },
  },
  nerithe: {
    id: 'nerithe', name: 'Nerithe', element: 'Oceanic', motionStyle: 'vortex',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 14, particleDensity: 0.6, bloomScale: 0.8, streakScale: 0.8, speed: 1.15 },
      skill1: { name: 'Abyssal Spear', ribbonWidth: 24, particleDensity: 1.1, bloomScale: 1.2, streakScale: 1.3, speed: 1.1 },
      skill2: { name: 'Oceanic Pressure', ribbonWidth: 32, particleDensity: 1.5, bloomScale: 1.5, streakScale: 1.5, speed: 0.95 },
      ultimate: { name: 'Last Flare: Maelstrom', ribbonWidth: 46, particleDensity: 2.4, bloomScale: 2.3, streakScale: 2.5, speed: 0.85 },
    },
  },
  orvella: {
    id: 'orvella', name: 'Orvella', element: 'Botanic', motionStyle: 'arc',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 18, particleDensity: 0.6, bloomScale: 0.8, streakScale: 0.7, speed: 1.0 },
      skill1: { name: 'Fortress Slam', ribbonWidth: 28, particleDensity: 1.2, bloomScale: 1.2, streakScale: 1.1, speed: 0.95 },
      skill2: { name: 'Adamantine Bastion', ribbonWidth: 34, particleDensity: 1.6, bloomScale: 1.5, streakScale: 1.3, speed: 0.9 },
      ultimate: { name: 'Last Flare: Living Citadel', ribbonWidth: 48, particleDensity: 2.5, bloomScale: 2.2, streakScale: 2.0, speed: 0.85 },
    },
  },
  vaelor: {
    id: 'vaelor', name: 'Vaelor', element: 'Atmospheric', motionStyle: 'laser',
    abilities: {
      light: { name: 'Normal Attack', ribbonWidth: 12, particleDensity: 0.6, bloomScale: 0.9, streakScale: 1.2, speed: 1.35 },
      skill1: { name: 'Sonic Blade', ribbonWidth: 22, particleDensity: 1.1, bloomScale: 1.3, streakScale: 1.6, speed: 1.25 },
      skill2: { name: 'Chime Wave', ribbonWidth: 30, particleDensity: 1.5, bloomScale: 1.7, streakScale: 2.0, speed: 1.05 },
      ultimate: { name: 'Last Flare: Resonance Cascade', ribbonWidth: 44, particleDensity: 2.4, bloomScale: 2.6, streakScale: 2.8, speed: 0.95 },
    },
  },
};

export interface VFXLayers {
  core: boolean;
  ribbon: boolean;
  wisps: boolean;
  embers: boolean;
  bloom: boolean;
  anamorphicGlare: boolean;
  shockwave: boolean;
  groundGlow: boolean;
  cameraShake: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  maxSize: number;
  color: ColorStop;
  endColor: ColorStop;
  drag: number;
  buoyancy: number; // upward thermal lift
  curlFrequency: number;
  curlMagnitude: number;
  flickerOffset: number;
  type: 'ember' | 'spark' | 'smoke' | 'burst' | 'suction';
}

export interface RibbonPoint {
  x: number;
  y: number;
  time: number;
  width: number;
  angle: number;
}

export interface WispSubTendril {
  phase: number;
  frequency: number;
  amplitude: number;
  length: number;
  offsetAngle: number;
}

export class WispingFlameSimulation {
  // Arena geometry
  width = 960;
  height = 540;

  // Key positions
  casterX = 180;
  casterY = 320;
  targetX = 760;
  targetY = 320;

  // Timeline
  duration = 3.2; // total attack duration in seconds
  currentTime = 0;
  playbackSpeed = 1.0;
  isPlaying = true;
  isLooping = true;

  // Current visual phase
  // 0.0 - 0.75s: Charge / Gathering
  // 0.75 - 1.55s: Projectile Flight
  // 1.55 - 3.2s: Impact & Decay
  chargeEndTime = 0.75;
  impactStartTime = 1.55;

  // Projectile state
  projX = 0;
  projY = 0;
  projAngle = 0;
  projSpeed = 0;

  // Ribbon history
  ribbonPoints: RibbonPoint[] = [];
  maxRibbonLength = 36;

  // Active particle pools
  particles: Particle[] = [];

  // Impact tendril arcs
  impactWisps: { angle: number; speed: number; curl: number; life: number; maxLife: number; radius: number }[] = [];

  // Camera shake state
  shakeMagnitude = 0;
  shakeX = 0;
  shakeY = 0;

  // Ground scorch marks
  scorchAlpha = 0;

  // Settings
  palette: VFXPalette = PALETTES.infernal;
  activeCharacter = 'ember';
  activeAbility: AbilityTier = 'ultimate';
  layers: VFXLayers = {
    core: true,
    ribbon: true,
    wisps: true,
    embers: true,
    bloom: true,
    anamorphicGlare: true,
    shockwave: true,
    groundGlow: true,
    cameraShake: true,
  };

  setCharacter(charId: string): void {
    if (CHARACTER_PRESETS[charId]) {
      this.activeCharacter = charId;
      this.palette = PALETTES[charId] ?? PALETTES.infernal;
      this.reset();
    }
  }

  setAbility(tier: AbilityTier): void {
    this.activeAbility = tier;
    this.reset();
  }

  // Performance telemetry
  fps = 60;
  frameTimeMs = 0;
  private frameCount = 0;
  private fpsAccumulator = 0;

  // Tendrils branching off the main wisp
  private subTendrils: WispSubTendril[] = [
    { phase: 0, frequency: 18, amplitude: 14, length: 22, offsetAngle: 0.4 },
    { phase: Math.PI * 0.7, frequency: 22, amplitude: 18, length: 28, offsetAngle: -0.4 },
    { phase: Math.PI * 1.3, frequency: 15, amplitude: 12, length: 18, offsetAngle: 0.7 },
  ];

  constructor(width = 960, height = 540) {
    this.resize(width, height);
    this.reset();
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    if (width < height) {
      // Portrait layout: travel diagonally across the stage
      this.casterX = width * 0.22;
      this.casterY = height * 0.68;
      this.targetX = width * 0.78;
      this.targetY = height * 0.32;
    } else {
      // Landscape layout: horizontal battle flight
      this.casterX = width * 0.18;
      this.casterY = height * 0.62;
      this.targetX = width * 0.78;
      this.targetY = height * 0.62;
    }
  }

  reset(): void {
    this.currentTime = 0;
    this.particles = [];
    this.ribbonPoints = [];
    this.impactWisps = [];
    this.shakeMagnitude = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.scorchAlpha = 0;
    this.projX = this.casterX;
    this.projY = this.casterY;
  }

  setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  setCaster(x: number, y: number): void {
    this.casterX = x;
    this.casterY = y;
  }

  seek(timeInSeconds: number): void {
    const targetTime = Math.max(0, Math.min(this.duration, timeInSeconds));
    this.reset();
    const dt = 0.02;
    const oldSpeed = this.playbackSpeed;
    this.playbackSpeed = 1.0;
    while (this.currentTime + dt <= targetTime) {
      this.update(dt);
    }
    const rem = targetTime - this.currentTime;
    if (rem > 0.001) {
      this.update(rem);
    }
    this.playbackSpeed = oldSpeed;
  }

  update(deltaSeconds: number): void {
    const startPerf = performance.now();
    const effectiveDt = deltaSeconds * this.playbackSpeed;

    if (this.isPlaying) {
      this.currentTime += effectiveDt;
      if (this.currentTime >= this.duration) {
        if (this.isLooping) {
          this.reset();
        } else {
          this.currentTime = this.duration;
          this.isPlaying = false;
        }
      }
    }

    const t = this.currentTime;

    // --- PHASE 1: CHARGE & GATHERING ---
    if (t < this.chargeEndTime) {
      const chargeProgress = t / this.chargeEndTime;
      this.projX = this.casterX;
      this.projY = this.casterY;

      // Spawn suction embers swirling inward
      if (this.layers.embers && Math.random() < 0.65) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 90 * (1 - chargeProgress * 0.5);
        const speed = 120 + Math.random() * 100;
        this.particles.push({
          x: this.casterX + Math.cos(angle) * dist,
          y: this.casterY + Math.sin(angle) * dist,
          vx: -Math.cos(angle + 0.35) * speed,
          vy: -Math.sin(angle + 0.35) * speed,
          life: 0,
          maxLife: 0.4 + Math.random() * 0.3,
          size: 2 + Math.random() * 3,
          maxSize: 4,
          color: this.palette.inner,
          endColor: this.palette.core,
          drag: 0.96,
          buoyancy: -20,
          curlFrequency: 6,
          curlMagnitude: 12,
          flickerOffset: Math.random() * 10,
          type: 'suction',
        });
      }
    }

    // --- PHASE 2: FLIGHT ---
    else if (t >= this.chargeEndTime && t < this.impactStartTime) {
      const flightProgress = (t - this.chargeEndTime) / (this.impactStartTime - this.chargeEndTime);

      // Smooth ease-in-out trajectory + procedural undulation
      const easedT = flightProgress * flightProgress * (3 - 2 * flightProgress);

      const dx = this.targetX - this.casterX;
      const dy = this.targetY - this.casterY;
      const straightX = this.casterX + dx * easedT;
      const straightY = this.casterY + dy * easedT;

      const preset = CHARACTER_PRESETS[this.activeCharacter] ?? CHARACTER_PRESETS.ember;
      const ability = preset.abilities[this.activeAbility] ?? preset.abilities.ultimate;

      let arch = -Math.sin(flightProgress * Math.PI) * (this.height * 0.22);
      let lateralWave = 0;

      if (preset.motionStyle === 'laser') {
        arch = 0;
        lateralWave = 0;
      } else if (preset.motionStyle === 'arc') {
        arch = -Math.sin(flightProgress * Math.PI) * (this.height * 0.38);
        lateralWave = Math.sin(flightProgress * 8) * 6;
      } else if (preset.motionStyle === 'zigzag') {
        arch = -Math.sin(flightProgress * Math.PI) * (this.height * 0.14);
        lateralWave = ((Math.floor(flightProgress * 24) % 2 === 0) ? 1 : -1) * 26 * Math.sin(flightProgress * Math.PI);
      } else if (preset.motionStyle === 'vortex') {
        arch = -Math.sin(flightProgress * Math.PI) * (this.height * 0.2);
        lateralWave = Math.sin(flightProgress * 30) * 32 * Math.sin(flightProgress * Math.PI);
      } else if (preset.motionStyle === 'spiral') {
        arch = -Math.sin(flightProgress * Math.PI) * (this.height * 0.25);
        lateralWave = Math.sin(flightProgress * 22) * 28;
      } else {
        // Serpentine undulation: dynamic s-curve that arches upward and weaves like living fire
        arch = -Math.sin(flightProgress * Math.PI) * (this.height * 0.22);
        const waveFreq = 16;
        const waveAmp = Math.sin(flightProgress * Math.PI) * 22;
        lateralWave = Math.sin(flightProgress * waveFreq) * waveAmp;
      }

      const prevX = this.projX;
      const prevY = this.projY;

      this.projX = straightX;
      this.projY = straightY + arch + lateralWave;

      this.projAngle = Math.atan2(this.projY - prevY, this.projX - prevX);

      // Record ribbon trail
      if (this.layers.ribbon) {
        this.ribbonPoints.unshift({
          x: this.projX,
          y: this.projY,
          time: t,
          width: ability.ribbonWidth + Math.sin(t * 24) * 4,
          angle: this.projAngle,
        });
        if (this.ribbonPoints.length > this.maxRibbonLength) {
          this.ribbonPoints.pop();
        }
      }

      // Spawn trailing sparks and embers
      if (this.layers.embers) {
        const spawnCount = Math.round((2 + Math.floor(Math.random() * 3)) * ability.particleDensity);
        for (let i = 0; i < spawnCount; i++) {
          const spreadAngle = this.projAngle + Math.PI + (Math.random() - 0.5) * 1.2;
          const speed = 40 + Math.random() * 120;
          this.particles.push({
            x: this.projX + (Math.random() - 0.5) * 8,
            y: this.projY + (Math.random() - 0.5) * 8,
            vx: Math.cos(spreadAngle) * speed,
            vy: Math.sin(spreadAngle) * speed,
            life: 0,
            maxLife: 0.35 + Math.random() * 0.45,
            size: 2.5 + Math.random() * 3.5,
            maxSize: 5,
            color: this.palette.inner,
            endColor: Math.random() < 0.4 ? this.palette.smoke : this.palette.outer,
            drag: 0.92,
            buoyancy: -35 - Math.random() * 25,
            curlFrequency: 8 + Math.random() * 4,
            curlMagnitude: 18,
            flickerOffset: Math.random() * 10,
            type: 'ember',
          });
        }
      }
    }

    // --- PHASE 3: IMPACT & DETONATION ---
    else {
      const impactTime = t - this.impactStartTime;

      // On first frame of impact
      if (this.ribbonPoints.length > 0) {
        this.ribbonPoints = []; // consume projectile head
        this.scorchAlpha = 1.0;

        // Trigger camera shake
        if (this.layers.cameraShake) {
          this.shakeMagnitude = this.activeAbility === 'ultimate' ? 26 : this.activeAbility === 'skill2' ? 18 : this.activeAbility === 'skill1' ? 14 : 8;
        }

        // Spawn explosive burst sparks
        if (this.layers.embers) {
          const preset = CHARACTER_PRESETS[this.activeCharacter] ?? CHARACTER_PRESETS.ember;
          const ability = preset.abilities[this.activeAbility] ?? preset.abilities.ultimate;
          const burstSparks = Math.round(75 * ability.particleDensity);
          for (let i = 0; i < burstSparks; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 120 + Math.random() * 380;
            this.particles.push({
              x: this.targetX,
              y: this.targetY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed * 0.7 - 50,
              life: 0,
              maxLife: 0.4 + Math.random() * 0.7,
              size: 2 + Math.random() * 4,
              maxSize: 6,
              color: Math.random() < 0.3 ? this.palette.core : this.palette.inner,
              endColor: this.palette.outer,
              drag: 0.94,
              buoyancy: 80, // gravity for sparks
              curlFrequency: 4,
              curlMagnitude: 8,
              flickerOffset: Math.random() * 10,
              type: 'spark',
            });
          }
        }

        // Initialize expanding fiery tendrils
        if (this.layers.wisps) {
          this.impactWisps = [];
          const numWisps = 10;
          for (let i = 0; i < numWisps; i++) {
            const angle = (i / numWisps) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            this.impactWisps.push({
              angle,
              speed: 180 + Math.random() * 160,
              curl: (Math.random() - 0.5) * 5.0,
              life: 0,
              maxLife: 0.65 + Math.random() * 0.35,
              radius: 0,
            });
          }
        }
      }

      // Update impact wisps
      for (const wisp of this.impactWisps) {
        wisp.life += effectiveDt;
        wisp.radius += wisp.speed * effectiveDt;
        wisp.angle += wisp.curl * effectiveDt;
        wisp.speed *= 0.92;

        // Spawn trailing smoke and embers along expanding wisp arcs
        if (this.layers.embers && Math.random() < 0.35 && wisp.life < wisp.maxLife * 0.7) {
          const wx = this.targetX + Math.cos(wisp.angle) * wisp.radius;
          const wy = this.targetY + Math.sin(wisp.angle) * wisp.radius * 0.7;
          this.particles.push({
            x: wx,
            y: wy,
            vx: (Math.random() - 0.5) * 30,
            vy: -20 - Math.random() * 30,
            life: 0,
            maxLife: 0.5 + Math.random() * 0.4,
            size: 3 + Math.random() * 3,
            maxSize: 5,
            color: this.palette.mid,
            endColor: this.palette.smoke,
            drag: 0.95,
            buoyancy: -25,
            curlFrequency: 5,
            curlMagnitude: 10,
            flickerOffset: Math.random() * 5,
            type: 'ember',
          });
        }
      }

      // Fade scorch mark
      this.scorchAlpha = Math.max(0, 1.0 - impactTime / 1.5);
    }

    // --- UPDATE PARTICLES ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += effectiveDt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Drag
      p.vx *= p.drag;
      p.vy *= p.drag;

      // Buoyancy / Gravity
      p.vy += p.buoyancy * effectiveDt;

      // Curl noise simulation (sinusoidal turbulence)
      const curl = Math.sin(p.life * p.curlFrequency + p.flickerOffset) * p.curlMagnitude;
      p.x += (p.vx + curl) * effectiveDt;
      p.y += p.vy * effectiveDt;

      // Bounce on ground if spark
      if (p.type === 'spark' && p.y > this.targetY + 45) {
        p.y = this.targetY + 45;
        p.vy = -p.vy * 0.45;
        p.vx *= 0.8;
      }
    }

    // --- CAMERA SHAKE DECAY ---
    if (this.shakeMagnitude > 0.1) {
      this.shakeMagnitude *= Math.pow(0.08, effectiveDt);
      this.shakeX = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
      this.shakeY = (Math.random() - 0.5) * 2 * this.shakeMagnitude;
    } else {
      this.shakeMagnitude = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Telemetry
    this.frameTimeMs = performance.now() - startPerf;
    this.frameCount++;
    this.fpsAccumulator += deltaSeconds;
    if (this.fpsAccumulator >= 0.5) {
      this.fps = Math.round(this.frameCount / this.fpsAccumulator);
      this.frameCount = 0;
      this.fpsAccumulator = 0;
    }
  }

  // --- RENDER PASSES ---
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Camera shake offset
    ctx.translate(this.shakeX, this.shakeY);

    // 1. Dynamic ground lighting & scorch marks
    if (this.layers.groundGlow) {
      this.renderGround(ctx);
    }

    // 2. Optical Shockwave distortion ring
    if (this.layers.shockwave) {
      this.renderShockwave(ctx);
    }

    // 3. Fluid Ribbon Trail
    if (this.layers.ribbon && this.currentTime >= this.chargeEndTime && this.currentTime < this.impactStartTime) {
      this.renderRibbon(ctx);
    }

    // 4. Trailing Wisps & Tendrils
    if (this.layers.wisps) {
      this.renderWisps(ctx);
    }

    // 5. Particles (Embers, Sparks, Smoke)
    if (this.layers.embers) {
      this.renderParticles(ctx);
    }

    // 6. Projectile Head & Core Plasma
    if (this.layers.core) {
      this.renderCore(ctx);
    }

    // 7. Unity-level Optical Stack: Multi-tier Bloom & Anamorphic Lens Flare
    if (this.layers.bloom || this.layers.anamorphicGlare) {
      this.renderOpticalStack(ctx);
    }

    ctx.restore();
  }

  private renderGround(ctx: CanvasRenderingContext2D): void {
    const t = this.currentTime;

    // Caster charge glow
    if (t < this.chargeEndTime) {
      const chargeScale = t / this.chargeEndTime;
      const radiusX = 70 * chargeScale;
      const radiusY = 22 * chargeScale;
      const grad = ctx.createRadialGradient(
        this.casterX, this.casterY + 35, 0,
        this.casterX, this.casterY + 35, radiusX
      );
      grad.addColorStop(0, this.palette.groundGlow);
      grad.addColorStop(0.5, 'rgba(255, 120, 20, 0.15)');
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(this.casterX, this.casterY + 35, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Projectile flight casting light on floor
    if (t >= this.chargeEndTime && t < this.impactStartTime) {
      const floorY = this.casterY + (this.targetY - this.casterY) * ((this.projX - this.casterX) / (this.targetX - this.casterX)) + 40;
      const grad = ctx.createRadialGradient(
        this.projX, floorY, 0,
        this.projX, floorY, 110
      );
      grad.addColorStop(0, this.palette.groundGlow);
      grad.addColorStop(0.6, 'rgba(255, 140, 40, 0.12)');
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(this.projX, floorY, 110, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Impact molten crater & residual scorch
    if (this.scorchAlpha > 0.01) {
      ctx.save();
      const radiusX = 140 * Math.min(1.0, (t - this.impactStartTime) * 4);
      const radiusY = 44 * Math.min(1.0, (t - this.impactStartTime) * 4);

      // Outer scorch
      const scorchGrad = ctx.createRadialGradient(
        this.targetX, this.targetY + 40, 0,
        this.targetX, this.targetY + 40, radiusX
      );
      scorchGrad.addColorStop(0, `rgba(255, 180, 50, ${this.scorchAlpha * 0.7})`);
      scorchGrad.addColorStop(0.3, `rgba(220, 60, 10, ${this.scorchAlpha * 0.5})`);
      scorchGrad.addColorStop(0.7, `rgba(20, 10, 15, ${this.scorchAlpha * 0.8})`);
      scorchGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = scorchGrad;
      ctx.beginPath();
      ctx.ellipse(this.targetX, this.targetY + 40, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Molten core cracks
      if (this.scorchAlpha > 0.3) {
        ctx.strokeStyle = `rgba(255, 240, 160, ${this.scorchAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const ang = (a / 6) * Math.PI * 2;
          ctx.moveTo(this.targetX, this.targetY + 40);
          const cx1 = this.targetX + Math.cos(ang) * (radiusX * 0.3);
          const cy1 = this.targetY + 40 + Math.sin(ang) * (radiusY * 0.3);
          const cx2 = this.targetX + Math.cos(ang + 0.2) * (radiusX * 0.6);
          const cy2 = this.targetY + 40 + Math.sin(ang + 0.2) * (radiusY * 0.6);
          ctx.quadraticCurveTo(cx1, cy1, cx2, cy2);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private renderShockwave(ctx: CanvasRenderingContext2D): void {
    const t = this.currentTime;
    if (t < this.impactStartTime) return;

    const impactAge = t - this.impactStartTime;
    if (impactAge > 0.85) return;

    const shockProgress = impactAge / 0.85;
    const maxRadius = Math.max(this.width, this.height) * 0.45;
    const currentRadius = maxRadius * Math.pow(shockProgress, 0.6);
    const alpha = (1 - shockProgress) * (1 - shockProgress);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Primary refractive crest
    ctx.lineWidth = 6 * (1 - shockProgress * 0.7);
    ctx.strokeStyle = `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, ${alpha * 0.9})`;
    ctx.beginPath();
    ctx.arc(this.targetX, this.targetY, currentRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary chromatic fringe ring (red/violet shift)
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(${this.palette.spectral.r}, ${this.palette.spectral.g}, ${this.palette.spectral.b}, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(this.targetX, this.targetY, currentRadius + 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private renderRibbon(ctx: CanvasRenderingContext2D): void {
    if (this.ribbonPoints.length < 3) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Outer plasma ribbon
    ctx.beginPath();
    for (let i = 0; i < this.ribbonPoints.length; i++) {
      const pt = this.ribbonPoints[i];
      const progress = i / this.ribbonPoints.length;
      const width = pt.width * (1 - progress * 0.9);
      const normalX = Math.cos(pt.angle + Math.PI / 2) * width;
      const normalY = Math.sin(pt.angle + Math.PI / 2) * width;

      if (i === 0) {
        ctx.moveTo(pt.x + normalX, pt.y + normalY);
      } else {
        ctx.lineTo(pt.x + normalX, pt.y + normalY);
      }
    }

    for (let i = this.ribbonPoints.length - 1; i >= 0; i--) {
      const pt = this.ribbonPoints[i];
      const progress = i / this.ribbonPoints.length;
      const width = pt.width * (1 - progress * 0.9);
      const normalX = -Math.cos(pt.angle + Math.PI / 2) * width;
      const normalY = -Math.sin(pt.angle + Math.PI / 2) * width;
      ctx.lineTo(pt.x + normalX, pt.y + normalY);
    }
    ctx.closePath();

    const headPt = this.ribbonPoints[0];
    const tailPt = this.ribbonPoints[this.ribbonPoints.length - 1];
    const ribbonGrad = ctx.createLinearGradient(headPt.x, headPt.y, tailPt.x, tailPt.y);
    ribbonGrad.addColorStop(0, `rgba(${this.palette.core.r}, ${this.palette.core.g}, ${this.palette.core.b}, 0.95)`);
    ribbonGrad.addColorStop(0.2, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, 0.85)`);
    ribbonGrad.addColorStop(0.6, `rgba(${this.palette.mid.r}, ${this.palette.mid.g}, ${this.palette.mid.b}, 0.6)`);
    ribbonGrad.addColorStop(1, `rgba(${this.palette.outer.r}, ${this.palette.outer.g}, ${this.palette.outer.b}, 0)`);

    ctx.fillStyle = ribbonGrad;
    ctx.fill();

    // Inner searing filament (thin, intense white core)
    ctx.beginPath();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = `rgba(255, 255, 255, 0.9)`;
    for (let i = 0; i < Math.floor(this.ribbonPoints.length * 0.6); i++) {
      const pt = this.ribbonPoints[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    ctx.restore();
  }

  private renderWisps(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const t = this.currentTime;

    // Sub-tendrils trailing the flying projectile head
    if (t >= this.chargeEndTime && t < this.impactStartTime) {
      for (const tendril of this.subTendrils) {
        ctx.beginPath();
        const baseAngle = this.projAngle + Math.PI + tendril.offsetAngle;
        const wave = Math.sin(t * tendril.frequency + tendril.phase) * tendril.amplitude;

        const startX = this.projX;
        const startY = this.projY;
        const midX = startX + Math.cos(baseAngle) * (tendril.length * 0.5) + Math.cos(baseAngle + Math.PI / 2) * wave;
        const midY = startY + Math.sin(baseAngle) * (tendril.length * 0.5) + Math.sin(baseAngle + Math.PI / 2) * wave;
        const endX = startX + Math.cos(baseAngle) * tendril.length;
        const endY = startY + Math.sin(baseAngle) * tendril.length;

        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(midX, midY, endX, endY);

        ctx.strokeStyle = `rgba(${this.palette.mid.r}, ${this.palette.mid.g}, ${this.palette.mid.b}, 0.75)`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Impact fiery burst tendrils
    if (t >= this.impactStartTime) {
      for (const wisp of this.impactWisps) {
        const progress = wisp.life / wisp.maxLife;
        if (progress >= 1.0) continue;

        const alpha = (1 - progress) * 0.85;
        const wx = this.targetX + Math.cos(wisp.angle) * wisp.radius;
        const wy = this.targetY + Math.sin(wisp.angle) * wisp.radius * 0.7;

        ctx.beginPath();
        const tailX = this.targetX + Math.cos(wisp.angle - wisp.curl * 0.2) * (wisp.radius * 0.6);
        const tailY = this.targetY + Math.sin(wisp.angle - wisp.curl * 0.2) * (wisp.radius * 0.6) * 0.7;

        ctx.moveTo(tailX, tailY);
        ctx.quadraticCurveTo(
          (tailX + wx) * 0.5 + Math.sin(wisp.angle) * 16,
          (tailY + wy) * 0.5 - Math.cos(wisp.angle) * 16,
          wx, wy
        );

        ctx.lineWidth = 5 * (1 - progress);
        ctx.strokeStyle = `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, ${alpha})`;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(wx, wy, 2.5 * (1 - progress), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const p of this.particles) {
      const progress = p.life / p.maxLife;
      const alpha = (1 - progress);
      const currentSize = p.size * (1 - progress * 0.6);

      const r = Math.round(p.color.r + (p.endColor.r - p.color.r) * progress);
      const g = Math.round(p.color.g + (p.endColor.g - p.color.g) * progress);
      const b = Math.round(p.color.b + (p.endColor.b - p.color.b) * progress);

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.beginPath();

      if (p.type === 'spark') {
        const speed = Math.hypot(p.vx, p.vy);
        const angle = Math.atan2(p.vy, p.vx);
        const length = Math.min(16, speed * 0.04 + currentSize);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.ellipse(0, 0, length, currentSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderCore(ctx: CanvasRenderingContext2D): void {
    const t = this.currentTime;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // 1. Charge Stage Core
    if (t < this.chargeEndTime) {
      const charge = t / this.chargeEndTime;
      const pulse = 1 + Math.sin(t * 30) * 0.15;
      const radius = (18 + charge * 24) * pulse;

      // Outer aura
      const gradOuter = ctx.createRadialGradient(
        this.casterX, this.casterY, 0,
        this.casterX, this.casterY, radius * 2.2
      );
      gradOuter.addColorStop(0, `rgba(${this.palette.mid.r}, ${this.palette.mid.g}, ${this.palette.mid.b}, 0.7)`);
      gradOuter.addColorStop(0.5, `rgba(${this.palette.outer.r}, ${this.palette.outer.g}, ${this.palette.outer.b}, 0.4)`);
      gradOuter.addColorStop(1, 'transparent');
      ctx.fillStyle = gradOuter;
      ctx.beginPath();
      ctx.arc(this.casterX, this.casterY, radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Inner white-hot nucleus
      const gradInner = ctx.createRadialGradient(
        this.casterX, this.casterY, 0,
        this.casterX, this.casterY, radius * 0.7
      );
      gradInner.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradInner.addColorStop(0.5, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, 0.9)`);
      gradInner.addColorStop(1, 'transparent');
      ctx.fillStyle = gradInner;
      ctx.beginPath();
      ctx.arc(this.casterX, this.casterY, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Flight Stage Core Head
    else if (t >= this.chargeEndTime && t < this.impactStartTime) {
      const pulse = 1 + Math.sin(t * 35) * 0.12;
      const headRadius = 24 * pulse;

      // Dynamic licking flame tongues trailing off projectile head
      ctx.save();
      ctx.translate(this.projX, this.projY);
      ctx.rotate(this.projAngle + Math.PI); // trailing behind flight direction

      const tongueCount = 5;
      for (let i = 0; i < tongueCount; i++) {
        const tonguePhase = t * 26 + (i * Math.PI * 2) / tongueCount;
        const tongueLen = 30 + Math.sin(tonguePhase) * 16;
        const tongueSpread = (i - (tongueCount - 1) / 2) * 0.4;
        const wave = Math.sin(tonguePhase * 1.6) * 9;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(tongueLen * 0.45, tongueSpread * 22 + wave, tongueLen, tongueSpread * 8);
        ctx.quadraticCurveTo(tongueLen * 0.45, tongueSpread * 22 - wave, 0, 0);

        const tongueGrad = ctx.createLinearGradient(0, 0, tongueLen, 0);
        tongueGrad.addColorStop(0, `rgba(${this.palette.core.r}, ${this.palette.core.g}, ${this.palette.core.b}, 0.9)`);
        tongueGrad.addColorStop(0.4, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, 0.75)`);
        tongueGrad.addColorStop(1, `rgba(${this.palette.outer.r}, ${this.palette.outer.g}, ${this.palette.outer.b}, 0)`);
        ctx.fillStyle = tongueGrad;
        ctx.fill();
      }
      ctx.restore();

      // Satellite Orbiting Flame Wisps (Double-Helix 3D motion)
      if (this.layers.wisps) {
        const orbitSpeed = 15;
        const orbitRadius = 20;
        for (let s = 0; s < 2; s++) {
          const orbitPhase = t * orbitSpeed + s * Math.PI;
          const normalAngle = this.projAngle + Math.PI / 2;
          const ox = this.projX + Math.cos(normalAngle) * Math.sin(orbitPhase) * orbitRadius - Math.cos(this.projAngle) * (s * 10 + 6);
          const oy = this.projY + Math.sin(normalAngle) * Math.sin(orbitPhase) * orbitRadius - Math.sin(this.projAngle) * (s * 10 + 6);
          const depthScale = 0.65 + (Math.cos(orbitPhase) + 1) * 0.35; // 0.65 to 1.35 depth scale

          const satGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, 14 * depthScale);
          satGrad.addColorStop(0, '#ffffff');
          satGrad.addColorStop(0.35, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, 0.95)`);
          satGrad.addColorStop(0.7, `rgba(${this.palette.mid.r}, ${this.palette.mid.g}, ${this.palette.mid.b}, 0.6)`);
          satGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = satGrad;
          ctx.beginPath();
          ctx.arc(ox, oy, 14 * depthScale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Outer flame envelope
      const gradOuter = ctx.createRadialGradient(
        this.projX, this.projY, 0,
        this.projX, this.projY, headRadius * 2.4
      );
      gradOuter.addColorStop(0, `rgba(${this.palette.mid.r}, ${this.palette.mid.g}, ${this.palette.mid.b}, 0.8)`);
      gradOuter.addColorStop(0.4, `rgba(${this.palette.outer.r}, ${this.palette.outer.g}, ${this.palette.outer.b}, 0.5)`);
      gradOuter.addColorStop(0.8, `rgba(${this.palette.spectral.r}, ${this.palette.spectral.g}, ${this.palette.spectral.b}, 0.25)`);
      gradOuter.addColorStop(1, 'transparent');
      ctx.fillStyle = gradOuter;
      ctx.beginPath();
      ctx.arc(this.projX, this.projY, headRadius * 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Searing core
      const gradCore = ctx.createRadialGradient(
        this.projX, this.projY, 0,
        this.projX, this.projY, headRadius * 0.8
      );
      gradCore.addColorStop(0, '#ffffff');
      gradCore.addColorStop(0.5, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, 0.95)`);
      gradCore.addColorStop(1, 'transparent');
      ctx.fillStyle = gradCore;
      ctx.beginPath();
      ctx.arc(this.projX, this.projY, headRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Impact Flash & Detonation Core
    else {
      const impactAge = t - this.impactStartTime;
      if (impactAge < 0.6) {
        const flashAlpha = Math.max(0, 1.0 - impactAge / 0.45);
        const radius = (60 + impactAge * 140);

        const grad = ctx.createRadialGradient(
          this.targetX, this.targetY, 0,
          this.targetX, this.targetY, radius
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
        grad.addColorStop(0.3, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, ${flashAlpha * 0.8})`);
        grad.addColorStop(0.7, `rgba(${this.palette.mid.r}, ${this.palette.mid.g}, ${this.palette.mid.b}, ${flashAlpha * 0.4})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.targetX, this.targetY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderOpticalStack(ctx: CanvasRenderingContext2D): void {
    const t = this.currentTime;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    let originX = this.projX;
    let originY = this.projY;
    let intensity = 1.0;

    if (t < this.chargeEndTime) {
      originX = this.casterX;
      originY = this.casterY;
      intensity = 0.4 + (t / this.chargeEndTime) * 0.6;
    } else if (t >= this.impactStartTime) {
      originX = this.targetX;
      originY = this.targetY;
      const impactAge = t - this.impactStartTime;
      intensity = Math.max(0, 1.8 * (1.0 - impactAge / 0.5));
    }

    if (intensity <= 0.02) {
      ctx.restore();
      return;
    }

    const preset = CHARACTER_PRESETS[this.activeCharacter] ?? CHARACTER_PRESETS.ember;
    const ability = preset.abilities[this.activeAbility] ?? preset.abilities.ultimate;
    const bloomScale = ability.bloomScale;
    const streakScale = ability.streakScale;

    // A. Multi-tier Bloom (tight, medium, and wide aura halos)
    if (this.layers.bloom) {
      // Tight intense bloom
      const tightGrad = ctx.createRadialGradient(originX, originY, 0, originX, originY, 50 * intensity * bloomScale);
      tightGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * intensity})`);
      tightGrad.addColorStop(0.4, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, ${0.6 * intensity})`);
      tightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = tightGrad;
      ctx.beginPath();
      ctx.arc(originX, originY, 50 * intensity * bloomScale, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric wide bloom
      const wideGrad = ctx.createRadialGradient(originX, originY, 0, originX, originY, 180 * intensity * bloomScale);
      wideGrad.addColorStop(0, `rgba(${this.palette.mid.r}, ${this.palette.mid.g}, ${this.palette.mid.b}, ${0.35 * intensity})`);
      wideGrad.addColorStop(0.6, `rgba(${this.palette.outer.r}, ${this.palette.outer.g}, ${this.palette.outer.b}, ${0.12 * intensity})`);
      wideGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = wideGrad;
      ctx.beginPath();
      ctx.arc(originX, originY, 180 * intensity * bloomScale, 0, Math.PI * 2);
      ctx.fill();
    }

    // B. Anamorphic Lens Flare & Diffraction Starburst
    if (this.layers.anamorphicGlare) {
      ctx.save();
      ctx.translate(originX, originY);

      // Horizontal anamorphic light streak
      const streakWidth = Math.min(this.width * 0.95, 600 * intensity * streakScale);
      const streakHeight = 4.5 * intensity * streakScale;

      const streakGrad = ctx.createLinearGradient(-streakWidth * 0.5, 0, streakWidth * 0.5, 0);
      streakGrad.addColorStop(0, 'transparent');
      streakGrad.addColorStop(0.25, `rgba(${this.palette.spectral.r}, ${this.palette.spectral.g}, ${this.palette.spectral.b}, ${0.2 * intensity})`);
      streakGrad.addColorStop(0.46, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, ${0.7 * intensity})`);
      streakGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.95 * intensity})`);
      streakGrad.addColorStop(0.54, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, ${0.7 * intensity})`);
      streakGrad.addColorStop(0.75, `rgba(${this.palette.spectral.r}, ${this.palette.spectral.g}, ${this.palette.spectral.b}, ${0.2 * intensity})`);
      streakGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = streakGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, streakWidth * 0.5, streakHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4-Point High-End Optical Starburst (delicate, needle-sharp, soft gradient falloff)
      if (intensity > 0.65) {
        const starPoints = 4;
        const spikeLength = 75 * intensity * streakScale;
        for (let i = 0; i < starPoints; i++) {
          const angle = (i / starPoints) * Math.PI * 2 + (t * 0.2);
          const endX = Math.cos(angle) * spikeLength;
          const endY = Math.sin(angle) * spikeLength;

          const spikeGrad = ctx.createLinearGradient(0, 0, endX, endY);
          spikeGrad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * intensity})`);
          spikeGrad.addColorStop(0.35, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, ${0.45 * intensity})`);
          spikeGrad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.strokeStyle = spikeGrad;
          ctx.lineWidth = 1.2;
          ctx.moveTo(0, 0);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      ctx.restore();

      // Optical Iris Lens Ghosts (subtle anamorphic lens flare reflections)
      if (intensity > 0.45) {
        ctx.save();
        const centerX = this.width * 0.5;
        const centerY = this.height * 0.5;
        const axisDx = centerX - originX;
        const axisDy = centerY - originY;

        const ghostFactors = [0.4, 0.75, 1.25, 1.6];
        for (let g = 0; g < ghostFactors.length; g++) {
          const factor = ghostFactors[g];
          const gx = originX + axisDx * factor;
          const gy = originY + axisDy * factor;
          const gRadius = (16 + g * 8) * intensity;
          const gAlpha = (0.12 / (g + 1)) * intensity;

          const ghostGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gRadius);
          ghostGrad.addColorStop(0, `rgba(${this.palette.spectral.r}, ${this.palette.spectral.g}, ${this.palette.spectral.b}, ${gAlpha * 1.5})`);
          ghostGrad.addColorStop(0.6, `rgba(${this.palette.inner.r}, ${this.palette.inner.g}, ${this.palette.inner.b}, ${gAlpha})`);
          ghostGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = ghostGrad;
          ctx.beginPath();
          ctx.arc(gx, gy, gRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    ctx.restore();
  }
}
