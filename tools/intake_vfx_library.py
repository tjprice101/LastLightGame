"""Preserve and export the owner's MagnumOpus VFX texture library for battle effects.

The owner authored these textures for their own MagnumOpus mod and approved
reusing them in Last Light (2026-11-18, D-482). Originals are copied once,
renamed, into Art/source/vfx; runtime exports are downscaled copies in
public/assets/vfx. Textures are grayscale light on black for additive
blending and are tinted per element at runtime. Supplied alpha is preserved
(resize only); nothing is keyed or background-removed.

Usage:
  python tools/intake_vfx_library.py            # dry run (validates)
  python tools/intake_vfx_library.py --apply    # install sources, exports, manifest
  python tools/intake_vfx_library.py --from <MagnumOpus root> --apply
"""

import argparse
from hashlib import sha256
from io import BytesIO
import json
import os
from pathlib import Path
import shutil

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = ROOT / "Art" / "source" / "vfx"
RUNTIME_ROOT = ROOT / "public" / "assets" / "vfx"
MANIFEST = ROOT / "Art" / "provenance" / "vfx-library-intake.json"
DEFAULT_ORIGIN = Path.home() / "Documents" / "My Games" / "Terraria" / "tModLoader" / "ModSources" / "MagnumOpus"

LIB = "Assets/VFX Asset Library/"
THEME = LIB + "Theme Specific/"
PARTICLES = "Assets/Particles Asset Library/"

# Longest runtime edge per category (pixels). Additive glows tolerate upscaling.
SIZES = {"particles": 128, "glow": 256, "flares": 256, "projectiles": 256,
         "impacts": 512, "beams": 512, "slashes": 512, "trails": 512,
         "smoke": 512, "noise": 256}

# runtime name -> original path relative to the MagnumOpus root.
LIBRARY = {
    "particles": {
        "star-hard": PARTICLES + "Stars/4PointedStarHard.png",
        "star-soft": PARTICLES + "Stars/4PointedStarSoft.png",
        "star-thin": PARTICLES + "Stars/ThinTall4PointedStar.png",
        "ember-drop": THEME + "Eroica/Particles/ER Rising Ember.png",
        "rock-shard": THEME + "Dies Irae/Particles/DI Ash Flake.png",
        "chain-link": THEME + "Dies Irae/Particles/DI Judgment Chain Link.png",
        "petal": THEME + "Eroica/Particles/ER Sakura Petal (Unique to Eroica).png",
        "leaf-sprig": THEME + "Eroica/Particles/ER Laurel Leaf.png",
        "rose-bloom": THEME + "Ode to Joy/Projectiles/OJ Rose Petal.png",
        "thorn": THEME + "Ode to Joy/Particles/OJ Thorn Fragment.png",
        "crystal-shard": THEME + "Swan Lake/Particles/SL Crystal Shard.png",
        "crescent": THEME + "Moonlight Sonata/Particles/MS Crescent Moon.png",
        "mist-wisp": THEME + "Moonlight Sonata/Particles/MS Tidal Mist Wisp.png",
        "gear-fragment": THEME + "Clair de Lune/Particles/CL Clock Gear Fragment.png",
        "gear-shard": THEME + "Clair de Lune/Particles/CL Clock Face Shard.png",
    },
    "glow": {
        "glow-orb": LIB + "GlowAndBloom/GlowOrb.png",
        "lens-flare": LIB + "GlowAndBloom/LensFlare.png",
        "point-bloom": LIB + "GlowAndBloom/PointBloom.png",
        "soft-glow": LIB + "GlowAndBloom/SoftGlow.png",
        "soft-glow-core": LIB + "GlowAndBloom/SoftGlowBrightAndLargerMiddle.png",
        "radial-bloom": LIB + "GlowAndBloom/SoftRadialBloom.png",
        "star-flare": LIB + "GlowAndBloom/StarFlare.png",
        "halo-bloom": THEME + "Moonlight Sonata/Glow and Bloom/MS Glow Orb.png",
        "crescent-flare": THEME + "Moonlight Sonata/Glow and Bloom/MS Star Flare.png",
    },
    "flares": {
        "star-4point": LIB + "Projectiles/4PointStarShiningProjectile.png",
        "starburst-8point": LIB + "Projectiles/8-Point Starburst Flare.png",
        "star-bright-a": LIB + "Projectiles/BrightStarProjectile1.png",
        "star-bright-b": LIB + "Projectiles/BrightStarProjectile2.png",
        "star-spiked": THEME + "Dies Irae/Projectiles/DI Star Flare.png",
        "star-sparkle-cross": THEME + "Eroica/Impact Effects/ER Radial Slash Star Impact.png",
        "star-wisp": THEME + "La Campanella/Impact Effects/LC Radial Slash Star Impact.png",
        "supernova": THEME + "Fate/Particles/FA Supernova Core.png",
        "star-glint": THEME + "Nachtmusik/Particles/NK Lens Flare.png",
        "star-sharp": THEME + "Nachtmusik/Impact Effects/NK Comet.png",
    },
    "projectiles": {
        "gyre-orb": LIB + "Projectiles/Gyratory Orb.png",
        "orbit-sphere": LIB + "Projectiles/Orbiting Energy Sphere.png",
    },
    "impacts": {
        "flare-burst": LIB + "ImpactEffects/BeamLensFlareExplosionImpact.png",
        "shatter-burst": LIB + "ImpactEffects/Crumbling Shatter Burst.png",
        "resonance-wave": LIB + "ImpactEffects/Harmonic Resonance Wave Impact.png",
        "impact-ellipse": LIB + "ImpactEffects/ImpactEllipse.png",
        "power-ring": LIB + "ImpactEffects/PowerEffectRing.png",
        "slash-star": LIB + "ImpactEffects/Radial Slash Star Impact.png",
        "x-cross": LIB + "ImpactEffects/X-ShapedImpactCross.png",
        "radial-streaks-fade": LIB + "BeamTextures/RadialBurstFadeStreaksLensFlare.png",
        "radial-streaks-heavy": LIB + "BeamTextures/RadialBurstHeavyStreaksLensFlare.png",
        "ring-fire": LIB + "BeamTextures/InfernalBeamRing.png",
        "radial-spikes": THEME + "Eroica/Beam Textures/ER Radial Burst Heavy Streaks.png",
        "shatter-web": THEME + "Eroica/Impact Effects/ER Crumbling Shatter Burst.png",
        "ring-flare": THEME + "Eroica/Impact Effects/ER Harmonic Resonance Wave Impact.png",
        "ring-thorned": THEME + "Eroica/Impact Effects/ER Power Effect Ring.png",
        "ring-runic": THEME + "Enigma/Impact Effects/EN Power Effect Ring.png",
        "ring-solar": THEME + "La Campanella/Impact Effects/LC Power Effect Ring.png",
        "ring-dripping": THEME + "La Campanella/Beam Textures/LC Infernal Beam Ring.png",
        "ring-eclipse": THEME + "La Campanella/Projectiles/LC Bright Star Projectile 2.png",
        "ring-concentric": THEME + "Moonlight Sonata/Impacts/MS Harmonic Resonance Wave Impact.png",
        "ring-crescent": THEME + "Moonlight Sonata/Impacts/MS Power Effect Ring.png",
        "ring-sparkle": THEME + "Nachtmusik/Particles/NK Power Effect Ring.png",
        "ring-stone": THEME + "Dies Irae/Impact Effects/DI Power Effect Ring.png",
        "ground-ripple": THEME + "Dies Irae/Impact Effects/DI Harmonic Resonance Wave Impact.png",
        "crack-burst": THEME + "Dies Irae/Impact Effects/DI Radial Slash Star Impact.png",
        "sigil-circle": THEME + "Fate/Particles/FA Celestial Glyph.png",
        "petal-burst-a": THEME + "Ode to Joy/Impact Effects/OJ Harmonic Resonance Beam Surge Impact.png",
        "petal-burst-b": THEME + "Ode to Joy/Impact Effects/OJ Harmonic Resonance Wave Impact 2 (Floral).png",
        "petal-burst-c": THEME + "Ode to Joy/Impact Effects/OJ Harmonic Resonance Wave Impact.png",
        "bloom-flower": THEME + "Ode to Joy/Particles/OJ Blossom Sparkle.png",
        "dust-ring": THEME + "Ode to Joy/Impact Effects/OJ Power Effect Ring.png",
        "vortex-rings": THEME + "Swan Lake/Impact Effects/SL Harmonic Resonance Wave Impact.png",
        "ring-feathered": THEME + "Swan Lake/Impact Effects/SL Power Effect Ring.png",
        "ring-cosmic": THEME + "Fate/Beam Textures/FA Power Effect Ring.png",
    },
    "beams": {
        "helix": LIB + "BeamTextures/Braided Energy Helix Beam.png",
        "fissure": LIB + "BeamTextures/Cracking Energy Fissure Beam.png",
        "energy-motion": LIB + "BeamTextures/EnergyMotion.png",
        "surge": LIB + "BeamTextures/EnergySurgeBeam.png",
        "streak": LIB + "BeamTextures/HorizontalBeamStreakSegment.png",
        "wave": LIB + "BeamTextures/Oscillating Frequency Wave Beam.png",
        "linear-glow": LIB + "BeamTextures/ThinLinearGlow.png",
        "plasma-core": LIB + "BeamTextures/Turbulent Plasma Core Segment.png",
        "lightning": LIB + "Lightning/LightningSurge.png",
        "chain": THEME + "Dies Irae/Beam Textures/DI Braided Energy Helix Beam (Chain-link).png",
        "rubble": THEME + "Dies Irae/Trails and Ribbons/DI Rocky Hell Trail.png",
        "storm": THEME + "Enigma/Beam Textures/EN Energy Motion Beam.png",
        "glyph-stream": THEME + "Enigma/Beam Textures/EN Energy Surge Beam.png",
        "flare-line": THEME + "Eroica/Beam Textures/ER Energy Surge Beam.png",
        "smoke-stream": THEME + "Eroica/Beam Textures/ER Energy Motion Beam.png",
        "petal-stream": THEME + "Ode to Joy/Beam Textures/OJ Energy Motion Beam.png",
        "bloom-lance": THEME + "Ode to Joy/Beam Textures/OJ Energy Surge Beam.png",
        "tide": THEME + "Swan Lake/Beam Textures/SL Energy Surge Beam.png",
    },
    "slashes": {
        "arc-flame": LIB + "SlashArcs/FlamingSwordArcSmear.png",
        "arc-flame-thin": LIB + "SlashArcs/FlamingSwordArcSmear2.png",
        "arc-full-circle": LIB + "SlashArcs/FullCircleSwordArcSlash.png",
        "arc-smear": LIB + "SlashArcs/SwordArcSmear.png",
    },
    "trails": {
        "trail-basic": LIB + "TrailsAndRibbons/BasicTrail.png",
        "ribbon-standing-wave": LIB + "TrailsAndRibbons/Harmonic Standing Wave Ribbon.png",
        "vortex-strip": LIB + "TrailsAndRibbons/Spiraling Vortex Energy Strip.png",
        "sparkle-spray": THEME + "Clair de Lune/Trails and Ribbons/CL Basic Trail.png",
        "dust-streak": THEME + "Fate/Trails and Ribbons/FA Basic Trail.png",
        "petal-spray": THEME + "Ode to Joy/Trails and Ribbons/OJ Basic Trail.png",
        "ribbon-weave": THEME + "Moonlight Sonata/Trails and Ribbons/MS Harmonic Standing Wave Ribbon.png",
        "ribbon-silk": THEME + "Swan Lake/Trails and Ribbons/SL Basic Trail.png",
        "wave-thread": THEME + "La Campanella/Trails and Ribbons/LC Basic Trail.png",
    },
    "smoke": {
        "smoke-puff": LIB + "SmokePuffCloud.png",
        "smoke-sheet": LIB + "SmokeRender3x6GRID.png",
    },
    "noise": {
        "maelstrom": LIB + "NoiseTextures/Churning Maelstrom Turbulence.png",
        "vortex": LIB + "NoiseTextures/CosmicEnergyVortex.png",
        "nebula": LIB + "NoiseTextures/CosmicNebulaClouds.png",
        "thread-web": LIB + "NoiseTextures/DestinyThreadPattern.png",
        "wisp": LIB + "NoiseTextures/NebulaWispNoise.png",
        "smoke": LIB + "NoiseTextures/NoiseSmoke.png",
        "perlin": LIB + "NoiseTextures/PerlinNoise.png",
        "crack": LIB + "NoiseTextures/RealityCrackPattern.png",
        "caustics": LIB + "NoiseTextures/SoftCircularCaustics.png",
        "starfield": LIB + "NoiseTextures/StarFieldScatter.png",
        "fbm": LIB + "NoiseTextures/TileableFBMNoise.png",
        "marble": LIB + "NoiseTextures/TileableMarbleNoise.png",
        "uv-distortion": LIB + "NoiseTextures/UVDistortionMap.png",
        "radial-flow": LIB + "NoiseTextures/UniversalRadialFlowNoise.png",
        "voronoi-edge": LIB + "NoiseTextures/VornoiEdgeNoise.png",
        "cracked-earth": THEME + "Dies Irae/Noise/DI Unique Theme Noise — Cracked Earth Pattern.png",
        "constellation": THEME + "Nachtmusik/Noise/NK Constellation Fragment Noise.png",
        "spiral": THEME + "La Campanella/Noise Textures/LC Cosmic Energy Vortex.png",
        "petal-scatter": THEME + "Ode to Joy/Noise/OJ Unique Theme Noise — Petal Scatter Pattern.png",
    },
}


def digest(data):
    return sha256(data).hexdigest()


def export(source_bytes, category):
    """Downscale only; keep supplied alpha; store grayscale as L to save bytes."""
    with Image.open(BytesIO(source_bytes)) as image:
        image.load()
        has_alpha = image.mode in ("RGBA", "LA") or "transparency" in image.info
        image = image.convert("RGBA" if has_alpha else "RGB")
        limit = SIZES[category]
        if max(image.size) > limit:
            scale = limit / max(image.size)
            size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
            image = image.resize(size, Image.LANCZOS)
        rgb = image.convert("RGB")
        r, g, b = rgb.split()
        spread = max(ImageChops.difference(r, g).getextrema()[1],
                     ImageChops.difference(g, b).getextrema()[1])
        grayscale = spread <= 12
        if has_alpha:
            output = image.convert("LA") if grayscale else image
        else:
            output = rgb.convert("L") if grayscale else rgb
        buffer = BytesIO()
        output.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue(), {"size": list(output.size), "mode": output.mode}


def intake(origin, apply=False):
    records = []
    for category, entries in LIBRARY.items():
        for name, relative in entries.items():
            source = SOURCE_ROOT / category / f"{name}.png"
            original = origin / relative
            if original.exists():
                data = original.read_bytes()
            elif source.exists():
                data = source.read_bytes()
            else:
                raise FileNotFoundError(f"Missing original for {category}/{name}: {relative}")
            if source.exists() and digest(source.read_bytes()) != digest(data):
                raise FileExistsError(f"Conflicting source artwork: {source}")
            runtime_bytes, info = export(data, category)
            runtime = RUNTIME_ROOT / category / f"{name}.png"
            records.append({
                "asset": f"{category}/{name}",
                "origin": f"MagnumOpus/{relative}",
                "source": source.relative_to(ROOT).as_posix(),
                "source_sha256": digest(data),
                "runtime": runtime.relative_to(ROOT).as_posix(),
                "runtime_sha256": digest(runtime_bytes),
                "runtime_size": info["size"], "runtime_mode": info["mode"],
            })
            if apply:
                source.parent.mkdir(parents=True, exist_ok=True)
                if not source.exists():
                    source.write_bytes(data)
                runtime.parent.mkdir(parents=True, exist_ok=True)
                runtime.write_bytes(runtime_bytes)
    manifest = {
        "library": "MagnumOpus VFX texture library (owner-authored)",
        "approval": "D-482 (2026-11-18): owner approved copying and renaming for Last Light battle effects",
        "policy": "grayscale additive textures tinted at runtime; resize only; supplied alpha preserved",
        "sizes": SIZES,
        "assets": records,
    }
    if apply:
        MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    elif MANIFEST.exists() and json.loads(MANIFEST.read_text(encoding="utf-8")) != manifest:
        raise FileExistsError("VFX library provenance changed; rerun with --apply after review.")
    total = sum(len(e) for e in LIBRARY.values())
    print(f"VFX library: {total} textures {'installed' if apply else 'validated (dry run)'}.")
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--from", dest="origin", type=Path,
                        default=Path(os.environ.get("MAGNUM_OPUS_ROOT", DEFAULT_ORIGIN)))
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    intake(args.origin, args.apply)
