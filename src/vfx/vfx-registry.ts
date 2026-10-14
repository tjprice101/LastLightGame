import type { CharacterVFXProfile, VFXPalette, BaseVFXSystem, VFXArchetype } from './types';
import { SlashVFXSystem } from './systems/slash-vfx';
import { BeamVFXSystem } from './systems/beam-vfx';
import { MandalaVFXSystem } from './systems/mandala-vfx';
import { SlamVFXSystem } from './systems/slam-vfx';
import { VortexVFXSystem } from './systems/vortex-vfx';
import { VolleyVFXSystem } from './systems/volley-vfx';
import { CataclysmVFXSystem } from './systems/cataclysm-vfx';

const systemConstructors = {
  slash: SlashVFXSystem,
  beam: BeamVFXSystem,
  mandala: MandalaVFXSystem,
  slam: SlamVFXSystem,
  vortex: VortexVFXSystem,
  volley: VolleyVFXSystem,
  cataclysm: CataclysmVFXSystem,
};

export function createVFXSystem(archetype: VFXArchetype): BaseVFXSystem {
  return new systemConstructors[archetype]();
}

export const VFX_SYSTEMS: Record<VFXArchetype, BaseVFXSystem> = {
  slash: createVFXSystem('slash'),
  beam: createVFXSystem('beam'),
  mandala: createVFXSystem('mandala'),
  slam: createVFXSystem('slam'),
  vortex: createVFXSystem('vortex'),
  volley: createVFXSystem('volley'),
  cataclysm: createVFXSystem('cataclysm'),
};

// Character Palettes
const P_EMBER: VFXPalette = {
  name: 'Infernis · Searing Flame', id: 'ember',
  core: { r: 255, g: 255, b: 255, a: 1.0 }, inner: { r: 255, g: 200, b: 70, a: 0.95 },
  mid: { r: 255, g: 90, b: 15, a: 0.9 }, outer: { r: 210, g: 25, b: 5, a: 0.75 },
  spectral: { r: 160, g: 30, b: 180, a: 0.5 }, smoke: { r: 45, g: 30, b: 35, a: 0.4 },
  groundGlow: 'rgba(255, 90, 15, 0.38)',
};

const P_TIDE: VFXPalette = {
  name: 'Tizu · Oceanic Hydro', id: 'tide',
  core: { r: 240, g: 255, b: 255, a: 1.0 }, inner: { r: 100, g: 235, b: 255, a: 0.95 },
  mid: { r: 15, g: 150, b: 255, a: 0.9 }, outer: { r: 5, g: 60, b: 210, a: 0.75 },
  spectral: { r: 80, g: 220, b: 240, a: 0.5 }, smoke: { r: 20, g: 35, b: 50, a: 0.4 },
  groundGlow: 'rgba(20, 160, 255, 0.38)',
};

const P_SPROUT: VFXPalette = {
  name: 'Flora · Botanic Verdance', id: 'sprout',
  core: { r: 255, g: 255, b: 235, a: 1.0 }, inner: { r: 175, g: 255, b: 120, a: 0.95 },
  mid: { r: 50, g: 210, b: 70, a: 0.9 }, outer: { r: 15, g: 130, b: 55, a: 0.75 },
  spectral: { r: 230, g: 100, b: 160, a: 0.5 }, smoke: { r: 25, g: 45, b: 30, a: 0.4 },
  groundGlow: 'rgba(60, 220, 80, 0.38)',
};

const P_ATMOSO: VFXPalette = {
  name: 'Atmoso · Tempest Gale', id: 'atmoso',
  core: { r: 255, g: 255, b: 255, a: 1.0 }, inner: { r: 180, g: 245, b: 230, a: 0.95 },
  mid: { r: 80, g: 215, b: 180, a: 0.9 }, outer: { r: 20, g: 150, b: 120, a: 0.75 },
  spectral: { r: 140, g: 210, b: 255, a: 0.5 }, smoke: { r: 35, g: 45, b: 45, a: 0.4 },
  groundGlow: 'rgba(70, 220, 180, 0.38)',
};

const P_AURORA: VFXPalette = {
  name: 'Aurora · Prismatic Dawn', id: 'aurora',
  core: { r: 255, g: 255, b: 255, a: 1.0 }, inner: { r: 255, g: 245, b: 170, a: 0.95 },
  mid: { r: 255, g: 200, b: 50, a: 0.9 }, outer: { r: 230, g: 130, b: 20, a: 0.75 },
  spectral: { r: 255, g: 80, b: 180, a: 0.5 }, smoke: { r: 45, g: 40, b: 35, a: 0.4 },
  groundGlow: 'rgba(255, 210, 60, 0.4)',
};

const P_BLISS: VFXPalette = {
  name: 'Bliss · Seraphic Feather', id: 'bliss',
  core: { r: 255, g: 255, b: 250, a: 1.0 }, inner: { r: 255, g: 240, b: 180, a: 0.95 },
  mid: { r: 245, g: 195, b: 65, a: 0.9 }, outer: { r: 200, g: 145, b: 25, a: 0.75 },
  spectral: { r: 255, g: 140, b: 210, a: 0.5 }, smoke: { r: 45, g: 40, b: 30, a: 0.4 },
  groundGlow: 'rgba(250, 205, 75, 0.4)',
};

const P_BRUNO: VFXPalette = {
  name: 'Bruno · Tectonic Fault', id: 'bruno',
  core: { r: 255, g: 250, b: 220, a: 1.0 }, inner: { r: 255, g: 190, b: 60, a: 0.95 },
  mid: { r: 210, g: 110, b: 20, a: 0.9 }, outer: { r: 130, g: 60, b: 10, a: 0.8 },
  spectral: { r: 180, g: 75, b: 25, a: 0.5 }, smoke: { r: 50, g: 40, b: 30, a: 0.45 },
  groundGlow: 'rgba(220, 120, 25, 0.4)',
};

const P_DISCIPLE: VFXPalette = {
  name: 'Disciple · Astral Mind', id: 'disciple',
  core: { r: 255, g: 240, b: 255, a: 1.0 }, inner: { r: 220, g: 140, b: 255, a: 0.95 },
  mid: { r: 160, g: 45, b: 245, a: 0.9 }, outer: { r: 90, g: 10, b: 180, a: 0.75 },
  spectral: { r: 240, g: 40, b: 150, a: 0.55 }, smoke: { r: 35, g: 20, b: 40, a: 0.4 },
  groundGlow: 'rgba(170, 50, 255, 0.38)',
};

const P_ELISE: VFXPalette = {
  name: 'Elise · High-Voltage Blitz', id: 'elise',
  core: { r: 245, g: 255, b: 255, a: 1.0 }, inner: { r: 140, g: 235, b: 255, a: 0.95 },
  mid: { r: 30, g: 170, b: 255, a: 0.9 }, outer: { r: 10, g: 90, b: 220, a: 0.75 },
  spectral: { r: 200, g: 70, b: 255, a: 0.5 }, smoke: { r: 20, g: 30, b: 45, a: 0.4 },
  groundGlow: 'rgba(40, 180, 255, 0.4)',
};

const P_RAZOR: VFXPalette = {
  name: 'Razor · Eclipse Void', id: 'razor',
  core: { r: 245, g: 235, b: 255, a: 1.0 }, inner: { r: 195, g: 110, b: 255, a: 0.95 },
  mid: { r: 130, g: 30, b: 220, a: 0.9 }, outer: { r: 65, g: 5, b: 130, a: 0.8 },
  spectral: { r: 210, g: 20, b: 100, a: 0.5 }, smoke: { r: 25, g: 15, b: 35, a: 0.45 },
  groundGlow: 'rgba(140, 35, 230, 0.38)',
};

const P_ROSETTA: VFXPalette = {
  name: 'Rosetta · Solar Rose', id: 'rosetta',
  core: { r: 255, g: 250, b: 240, a: 1.0 }, inner: { r: 255, g: 180, b: 140, a: 0.95 },
  mid: { r: 245, g: 70, b: 100, a: 0.9 }, outer: { r: 190, g: 20, b: 60, a: 0.75 },
  spectral: { r: 255, g: 200, b: 60, a: 0.55 }, smoke: { r: 45, g: 30, b: 35, a: 0.4 },
  groundGlow: 'rgba(250, 75, 110, 0.38)',
};

const P_THORNIA: VFXPalette = {
  name: 'Thornia · Twilight Bramble', id: 'thornia',
  core: { r: 255, g: 240, b: 250, a: 1.0 }, inner: { r: 240, g: 110, b: 170, a: 0.95 },
  mid: { r: 195, g: 25, b: 110, a: 0.9 }, outer: { r: 120, g: 10, b: 70, a: 0.8 },
  spectral: { r: 160, g: 35, b: 210, a: 0.5 }, smoke: { r: 35, g: 20, b: 30, a: 0.4 },
  groundGlow: 'rgba(200, 30, 115, 0.38)',
};

const P_CRINSO: VFXPalette = {
  name: 'Crinso · Dual Flame-Lightning', id: 'crinso',
  core: { r: 255, g: 255, b: 255, a: 1.0 }, inner: { r: 255, g: 210, b: 80, a: 0.95 },
  mid: { r: 250, g: 90, b: 25, a: 0.9 }, outer: { r: 210, g: 20, b: 40, a: 0.75 },
  spectral: { r: 255, g: 190, b: 20, a: 0.6 }, smoke: { r: 45, g: 30, b: 35, a: 0.4 },
  groundGlow: 'rgba(255, 110, 30, 0.4)',
};

const P_NERITHE: VFXPalette = {
  name: 'Nerithe · Abyssal Tidal', id: 'nerithe',
  core: { r: 235, g: 255, b: 255, a: 1.0 }, inner: { r: 80, g: 230, b: 250, a: 0.95 },
  mid: { r: 10, g: 160, b: 220, a: 0.9 }, outer: { r: 5, g: 80, b: 160, a: 0.8 },
  spectral: { r: 40, g: 210, b: 190, a: 0.5 }, smoke: { r: 18, g: 32, b: 48, a: 0.4 },
  groundGlow: 'rgba(15, 175, 230, 0.38)',
};

const P_ORVELLA: VFXPalette = {
  name: 'Orvella · Living Citadel', id: 'orvella',
  core: { r: 250, g: 255, b: 240, a: 1.0 }, inner: { r: 170, g: 245, b: 130, a: 0.95 },
  mid: { r: 60, g: 190, b: 75, a: 0.9 }, outer: { r: 25, g: 115, b: 45, a: 0.8 },
  spectral: { r: 210, g: 230, b: 100, a: 0.5 }, smoke: { r: 30, g: 45, b: 30, a: 0.4 },
  groundGlow: 'rgba(70, 200, 85, 0.38)',
};

const P_VAELOR: VFXPalette = {
  name: 'Vaelor · Harmonic Resonance', id: 'vaelor',
  core: { r: 245, g: 255, b: 250, a: 1.0 }, inner: { r: 140, g: 245, b: 215, a: 0.95 },
  mid: { r: 35, g: 195, b: 160, a: 0.9 }, outer: { r: 10, g: 135, b: 105, a: 0.8 },
  spectral: { r: 100, g: 220, b: 255, a: 0.55 }, smoke: { r: 25, g: 42, b: 40, a: 0.4 },
  groundGlow: 'rgba(40, 205, 170, 0.38)',
};

export const CHARACTER_PROFILES: Record<string, CharacterVFXProfile> = {
  ember: {
    characterId: 'ember', characterName: 'Infernis', element: 'Infernic', elementId: 'infernic', signature: 'cleave', weapon: 'Greatsword',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'slash', description: 'Single incandescent greatsword slash leaving fiery embers.', palette: P_EMBER, duration: 1.8, chargeDuration: 0.4, impactDuration: 0.5 },
      skill1: { name: 'Cinder Cleave', tier: 'skill1', archetype: 'slash', description: 'Vertical volcanic cleave plunging into the earth, erupting a burning magma fissure.', palette: P_EMBER, duration: 2.4, chargeDuration: 0.6, impactDuration: 0.8 },
      skill2: { name: 'Flame Arc', tier: 'skill2', archetype: 'slash', description: 'Horizontal 180° wildfire crescent wave cutting across all targets with dual flame filaments.', palette: P_EMBER, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Dawnfire', tier: 'ultimate', archetype: 'cataclysm', description: 'Solar eclipse caldera eruption with sky-piercing volcanic magma pillars and fiery shockwaves.', palette: P_EMBER, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
  tide: {
    characterId: 'tide', characterName: 'Tizu', element: 'Oceanic', elementId: 'oceanic', signature: 'trident', weapon: 'Spear',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'volley', description: 'Sharp hydro spear jab with splashing pressurized water droplets.', palette: P_TIDE, duration: 1.8, chargeDuration: 0.35, impactDuration: 0.5 },
      skill1: { name: 'Torrent Thrust', tier: 'skill1', archetype: 'volley', description: 'Rapid multi-thrust hydro trident strikes forming piercing water drills.', palette: P_TIDE, duration: 2.4, chargeDuration: 0.55, impactDuration: 0.8 },
      skill2: { name: 'Ocean Wall', tier: 'skill2', archetype: 'vortex', description: 'Rising water geysers and spinning tidal barrier shielding against incoming pressure.', palette: P_TIDE, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Leviathan', tier: 'ultimate', archetype: 'cataclysm', description: 'Colossal ocean tsunami deluge crashing down with foaming crests and vortex undertow.', palette: P_TIDE, duration: 3.4, chargeDuration: 1.1, impactDuration: 1.4 },
    },
  },
  sprout: {
    characterId: 'sprout', characterName: 'Flora', element: 'Botanic', elementId: 'botanic', signature: 'petal', weapon: 'Bow',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'volley', description: 'Wooden bow shot releasing a swift verdant arrow with leafy motes.', palette: P_SPROUT, duration: 1.8, chargeDuration: 0.4, impactDuration: 0.5 },
      skill1: { name: 'Petal Shot', tier: 'skill1', archetype: 'volley', description: 'Arcing volley of flower energy arrows raining downward into blooming blossoms.', palette: P_SPROUT, duration: 2.4, chargeDuration: 0.6, impactDuration: 0.8 },
      skill2: { name: 'Verdant Briar', tier: 'skill2', archetype: 'mandala', description: 'Sacred blossoming thorny vines bursting from the ground with restorative pollen spores.', palette: P_SPROUT, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: World Tree', tier: 'ultimate', archetype: 'cataclysm', description: 'Monumental Tree of Life rising with radiant roots and cascading emerald petals.', palette: P_SPROUT, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
  atmoso: {
    characterId: 'atmoso', characterName: 'Atmoso', element: 'Atmospheric', elementId: 'atmospheric', signature: 'cyclone', weapon: 'Staff',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'slash', description: 'Staff swipe releasing an aerodynamic jade breeze blade.', palette: P_ATMOSO, duration: 1.8, chargeDuration: 0.35, impactDuration: 0.5 },
      skill1: { name: 'Zephyr Gale', tier: 'skill1', archetype: 'vortex', description: 'Twin vacuum air-blade scythes crossing in high-speed wind shears.', palette: P_ATMOSO, duration: 2.4, chargeDuration: 0.55, impactDuration: 0.8 },
      skill2: { name: 'Vortex Burst', tier: 'skill2', archetype: 'vortex', description: 'Howling emerald whirlwind sucking in debris and detonating air currents.', palette: P_ATMOSO, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Tempest Rupture', tier: 'ultimate', archetype: 'cataclysm', description: 'Typhoon eye singularity drawing storm clouds into an apocalyptic hurricane burst.', palette: P_ATMOSO, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
  aurora: {
    characterId: 'aurora', characterName: 'Aurora', element: 'Tranquilitic', elementId: 'tranquilitic', signature: 'lens', weapon: 'Orbital Lenses',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'beam', description: 'Focused photon pulse with sparkling prismatic stardust.', palette: P_AURORA, duration: 1.8, chargeDuration: 0.35, impactDuration: 0.5 },
      skill1: { name: 'Prismatic Ray', tier: 'skill1', archetype: 'beam', description: 'Orbital crystal lenses aligning into a white-hot laser refracting into rainbow diffraction beams.', palette: P_AURORA, duration: 2.4, chargeDuration: 0.6, impactDuration: 0.8 },
      skill2: { name: 'Dawn Aurora', tier: 'skill2', archetype: 'beam', description: 'Cascading polar light curtains wafting across the field with blinding luminescence.', palette: P_AURORA, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Supernova', tier: 'ultimate', archetype: 'cataclysm', description: 'Celestial star cluster collapse into a blinding supernova with diamond shockwave rings.', palette: P_AURORA, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
  bliss: {
    characterId: 'bliss', characterName: 'Bliss', element: 'Tranquilitic', elementId: 'tranquilitic', signature: 'feather', weapon: 'Warfans',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'slash', description: 'Graceful warfan sweep launching golden feather daggers.', palette: P_BLISS, duration: 1.8, chargeDuration: 0.35, impactDuration: 0.5 },
      skill1: { name: 'Seraph Feather', tier: 'skill1', archetype: 'mandala', description: 'Fan of razor celestial quill needles curving with golden stardust trails.', palette: P_BLISS, duration: 2.4, chargeDuration: 0.55, impactDuration: 0.8 },
      skill2: { name: 'Divine Fanfare', tier: 'skill2', archetype: 'mandala', description: 'Synchronized twin fan dance generating concentric holy halos and golden light pillars.', palette: P_BLISS, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Ascension', tier: 'ultimate', archetype: 'cataclysm', description: 'Six-winged archangel apparition descending with raining sanctified light feathers.', palette: P_BLISS, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
  bruno: {
    characterId: 'bruno', characterName: 'Bruno', element: 'Botanic', elementId: 'botanic', signature: 'fault', weapon: 'Basalt Hammer',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'slam', description: 'Heavy basalt hammer strike with flying gravel debris.', palette: P_BRUNO, duration: 1.8, chargeDuration: 0.45, impactDuration: 0.5 },
      skill1: { name: 'Seismic Bash', tier: 'skill1', archetype: 'slam', description: 'Hammer crash fracturing the ground into radiating fault cracks and jagged stone spires.', palette: P_BRUNO, duration: 2.4, chargeDuration: 0.65, impactDuration: 0.8 },
      skill2: { name: 'Earth Bastion', tier: 'skill2', archetype: 'slam', description: 'Interlocking tectonic stone slabs rising with glowing amber magma runes.', palette: P_BRUNO, duration: 2.6, chargeDuration: 0.75, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Tectonic Rupture', tier: 'ultimate', archetype: 'cataclysm', description: 'Vaulting strato-hammer drop shattering the continental crust with flying boulders.', palette: P_BRUNO, duration: 3.4, chargeDuration: 1.3, impactDuration: 1.4 },
    },
  },
  disciple: {
    characterId: 'disciple', characterName: 'Disciple', element: 'Chaotic', elementId: 'chaotic', signature: 'mind', weapon: 'Mindcrown Focus',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'beam', description: 'Astral psychic dart with violet neural distortion ripples.', palette: P_DISCIPLE, duration: 1.8, chargeDuration: 0.35, impactDuration: 0.5 },
      skill1: { name: 'Mind Lance', tier: 'skill1', archetype: 'mandala', description: 'Psychic astral needle piercing through space with geometric neural diamonds.', palette: P_DISCIPLE, duration: 2.4, chargeDuration: 0.55, impactDuration: 0.8 },
      skill2: { name: 'Astral Singularity', tier: 'skill2', archetype: 'vortex', description: 'Gravitational psychic void orb distorting reality and pulling matter inward.', palette: P_DISCIPLE, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Cosmic Transcendence', tier: 'ultimate', archetype: 'cataclysm', description: 'Fabric of space cracking open to reveal an all-seeing astral mind eye and sacred lattice.', palette: P_DISCIPLE, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
  elise: {
    characterId: 'elise', characterName: 'Elise', element: 'Atmospheric', elementId: 'atmospheric', signature: 'star', weapon: 'Four-Point Shuriken',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'volley', description: 'Swift four-point electric shuriken throw with spark trail.', palette: P_ELISE, duration: 1.8, chargeDuration: 0.3, impactDuration: 0.5 },
      skill1: { name: 'Blitz Shuriken', tier: 'skill1', archetype: 'volley', description: 'Twin lightning shurikens bouncing and ricocheting with branching Tesla electric arcs.', palette: P_ELISE, duration: 2.4, chargeDuration: 0.5, impactDuration: 0.8 },
      skill2: { name: 'Plasma Storm', tier: 'skill2', archetype: 'beam', description: 'Hexagonal electric cage trapping targets in continuous megavolt discharges.', palette: P_ELISE, duration: 2.6, chargeDuration: 0.65, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Thunder God', tier: 'ultimate', archetype: 'cataclysm', description: 'Dark thunderclouds gather as six giant plasma shurikens summon a colossal lightning spear.', palette: P_ELISE, duration: 3.4, chargeDuration: 1.1, impactDuration: 1.4 },
    },
  },
  razor: {
    characterId: 'razor', characterName: 'Razor', element: 'Chaotic', elementId: 'chaotic', signature: 'eclipse', weapon: 'Pure Night Sword',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'slash', description: 'Night-blade thrust trailing dark void mist.', palette: P_RAZOR, duration: 1.8, chargeDuration: 0.4, impactDuration: 0.5 },
      skill1: { name: 'Shadow Cleave', tier: 'skill1', archetype: 'slash', description: 'Void blade slash tearing open a dimensional seam leaking dark matter gravity filaments.', palette: P_RAZOR, duration: 2.4, chargeDuration: 0.6, impactDuration: 0.8 },
      skill2: { name: 'Eclipse Barrier', tier: 'skill2', archetype: 'vortex', description: 'Crescent wings fold into an event horizon barrier deflecting energy.', palette: P_RAZOR, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Event Horizon', tier: 'ultimate', archetype: 'cataclysm', description: 'Black hole singularity with spinning accretion disk swallowing all light and matter.', palette: P_RAZOR, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
  rosetta: {
    characterId: 'rosetta', characterName: 'Rosetta', element: 'Tranquilitic', elementId: 'tranquilitic', signature: 'rose', weapon: 'Solar Rose Bow',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'volley', description: 'Single radiant golden rose arrow leaving red petal motes.', palette: P_ROSETTA, duration: 1.8, chargeDuration: 0.35, impactDuration: 0.5 },
      skill1: { name: 'Solar Arrow', tier: 'skill1', archetype: 'volley', description: 'Charged crimson-gold photon arrow leaving a spiral trail of blooming rose petals.', palette: P_ROSETTA, duration: 2.4, chargeDuration: 0.55, impactDuration: 0.8 },
      skill2: { name: 'Thorn Mandala', tier: 'skill2', archetype: 'mandala', description: 'Constellation of floating petals rotating into sacred geometric rose mandala before detonating.', palette: P_ROSETTA, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Crimson Bloom', tier: 'ultimate', archetype: 'cataclysm', description: 'Arrow fired into the sun, blooming into a titanic celestial rose raining solar thorn lances.', palette: P_ROSETTA, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
  thornia: {
    characterId: 'thornia', characterName: 'Thornia', element: 'Chaotic', elementId: 'chaotic', signature: 'thorn', weapon: 'Bramble Greatsword',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'slash', description: 'Jagged greatsword cut with amethyst thorn splinters.', palette: P_THORNIA, duration: 1.8, chargeDuration: 0.45, impactDuration: 0.5 },
      skill1: { name: 'Bramble Slash', tier: 'skill1', archetype: 'slash', description: 'Heavy diagonal cleave trailing hooked dark rose brambles that tear the air.', palette: P_THORNIA, duration: 2.4, chargeDuration: 0.65, impactDuration: 0.8 },
      skill2: { name: 'Twilight Ward', tier: 'skill2', archetype: 'mandala', description: 'Protective bramble cage of dark violet thorns absorbing enemy kinetic energy.', palette: P_THORNIA, duration: 2.6, chargeDuration: 0.75, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Thorn Cataclysm', tier: 'ultimate', archetype: 'cataclysm', description: 'Greatsword plunged into earth, erupting a colossal forest of jagged midnight-violet spikes.', palette: P_THORNIA, duration: 3.4, chargeDuration: 1.3, impactDuration: 1.4 },
    },
  },
  crinso: {
    characterId: 'crinso', characterName: 'Crinso', element: 'Infernic', elementId: 'infernic', signature: 'twin', weapon: 'Dual-Ended Sword',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'slash', description: 'Double-ended blade spin trailing gold and crimson fire.', palette: P_CRINSO, duration: 1.8, chargeDuration: 0.35, impactDuration: 0.5 },
      skill1: { name: 'Twin Blade', tier: 'skill1', archetype: 'slash', description: 'Spinning dual slash creating opposing arcs of golden flame and crimson lightning.', palette: P_CRINSO, duration: 2.4, chargeDuration: 0.55, impactDuration: 0.8 },
      skill2: { name: 'Flame & Thunder', tier: 'skill2', archetype: 'slash', description: 'Crossed blades releasing an explosive X-wave of intersecting fire and electric shockwaves.', palette: P_CRINSO, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Dual Chaos', tier: 'ultimate', archetype: 'cataclysm', description: 'Blazing sword wheel spinning into an apocalyptic Yin-Yang cyclone of fire and lightning.', palette: P_CRINSO, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
  nerithe: {
    characterId: 'nerithe', characterName: 'Nerithe', element: 'Oceanic', elementId: 'oceanic', signature: 'meridian', weapon: 'Tidal Spear',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'volley', description: 'Abyssal spear thrust trailing deep ocean bubbles.', palette: P_NERITHE, duration: 1.8, chargeDuration: 0.35, impactDuration: 0.5 },
      skill1: { name: 'Abyssal Spear', tier: 'skill1', archetype: 'volley', description: 'Pressurized oceanic cavitation drill spear thrust with crushing water vortex.', palette: P_NERITHE, duration: 2.4, chargeDuration: 0.55, impactDuration: 0.8 },
      skill2: { name: 'Oceanic Pressure', tier: 'skill2', archetype: 'vortex', description: 'Spinning tidal whirlpool shield crushing incoming projectiles with hydro pressure.', palette: P_NERITHE, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Maelstrom', tier: 'ultimate', archetype: 'cataclysm', description: 'Abyssal trench whirlpool pulling enemies into the dark depths with water spouts.', palette: P_NERITHE, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
  orvella: {
    characterId: 'orvella', characterName: 'Orvella', element: 'Botanic', elementId: 'botanic', signature: 'citadel', weapon: 'Tower Bastion',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'slam', description: 'Heavy bastion shield slam sending dust and stone fragments.', palette: P_ORVELLA, duration: 1.8, chargeDuration: 0.45, impactDuration: 0.5 },
      skill1: { name: 'Fortress Slam', tier: 'skill1', archetype: 'slam', description: 'Slamming bastion down, thrusting stone fortress ramparts and emerald earth shockwaves.', palette: P_ORVELLA, duration: 2.4, chargeDuration: 0.65, impactDuration: 0.8 },
      skill2: { name: 'Adamantine Bastion', tier: 'skill2', archetype: 'slam', description: 'Living petrified stone roots weaving into an impenetrable rampart bulwark.', palette: P_ORVELLA, duration: 2.6, chargeDuration: 0.75, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Living Citadel', tier: 'ultimate', archetype: 'cataclysm', description: 'Monumental ancient citadel rising with stone towers, glowing runic walls, and bastion dome.', palette: P_ORVELLA, duration: 3.4, chargeDuration: 1.3, impactDuration: 1.4 },
    },
  },
  vaelor: {
    characterId: 'vaelor', characterName: 'Vaelor', element: 'Atmospheric', elementId: 'atmospheric', signature: 'resonance', weapon: 'Harmonic Blade',
    abilities: {
      light: { name: 'Normal Attack', tier: 'light', archetype: 'slash', description: 'Acoustic blade strike sending high-frequency vibration rings.', palette: P_VAELOR, duration: 1.8, chargeDuration: 0.35, impactDuration: 0.5 },
      skill1: { name: 'Sonic Blade', tier: 'skill1', archetype: 'beam', description: 'Ultrasonic acoustic wave lance oscillating with high-speed concentric sound ripples.', palette: P_VAELOR, duration: 2.4, chargeDuration: 0.55, impactDuration: 0.8 },
      skill2: { name: 'Chime Wave', tier: 'skill2', archetype: 'mandala', description: 'Resonance tuning forks creating concentric harmonic ripples disrupting enemy rhythm.', palette: P_VAELOR, duration: 2.6, chargeDuration: 0.7, impactDuration: 0.9 },
      ultimate: { name: 'Last Flare: Resonance Cascade', tier: 'ultimate', archetype: 'cataclysm', description: 'Harmonic crystal blade strike shattering space with destructive acoustic glass ripples.', palette: P_VAELOR, duration: 3.4, chargeDuration: 1.2, impactDuration: 1.4 },
    },
  },
};

export function getVFXProfileForCombatant(combatantId: string, element?: string): CharacterVFXProfile {
  const normId = combatantId.toLowerCase();
  if (normId === 'infernis' || normId === 'ember') return CHARACTER_PROFILES.ember;
  if (normId === 'tizu' || normId === 'tide') return CHARACTER_PROFILES.tide;
  if (normId === 'flora' || normId === 'sprout') return CHARACTER_PROFILES.sprout;

  if (CHARACTER_PROFILES[normId]) {
    return CHARACTER_PROFILES[normId];
  }
  const normalizedEl = (element || '').toLowerCase();
  if (normalizedEl.includes('infernic') || normalizedEl.includes('fire')) return CHARACTER_PROFILES.ember;
  if (normalizedEl.includes('oceanic') || normalizedEl.includes('water') || normalizedEl.includes('aquatic')) return CHARACTER_PROFILES.tide;
  if (normalizedEl.includes('botanic') || normalizedEl.includes('grass') || normalizedEl.includes('nature') || normalizedEl.includes('earth') || normalizedEl.includes('tectonic')) return CHARACTER_PROFILES.sprout;
  if (normalizedEl.includes('atmospheric') || normalizedEl.includes('wind') || normalizedEl.includes('lightning') || normalizedEl.includes('voltaic')) return CHARACTER_PROFILES.atmoso;
  if (normalizedEl.includes('tranquilitic') || normalizedEl.includes('luminous') || normalizedEl.includes('light')) return CHARACTER_PROFILES.aurora;
  if (normalizedEl.includes('chaotic') || normalizedEl.includes('ominous') || normalizedEl.includes('dark')) return CHARACTER_PROFILES.disciple;
  return CHARACTER_PROFILES.ember;
}
