"""Phase-scoped intake of reviewed character/event deliveries; originals stay intact."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

import numpy as np
from PIL import Image, ImageDraw

from color_matte import remove_color_matte
from color_matte import reviewed_background_starts
from prepare_art import ROOT, connected_matte, standardize_sprite
from art_library import art_path


def portraits(character, names):
    return [(name + ".png", "characters", character if index == 0 else f"{character}-evo-{index + 1}")
            for index, name in enumerate(names)]


def icons(character, names):
    return [(name + ".png", "abilities", f"{character}-{action}")
            for action, name in zip(("passive", "skill1", "skill2", "ultimate", "light", "defend"), names)]


ROSES = [
    *portraits("rosetta", ["Gilded Rose, Rosetta", "Gilded Vow, Rosetta", "Daybreak Archer, Rosetta",
                         "Seraph of Virtue, Rosetta", "Sovereign of Passion, Rosetta", "The Rose Beyond the Sun, Rosetta"]),
    *portraits("thornia", ["Burdened by Thorns, Thornia", "Gilded Squire, Thornia", "Forbidden Rose Knight, Thornia",
                         "Warden of the Shadow Garden, Thornia", "Queen of Golden Shadows, Thornia", "The Thousand-Rose Empress, Thornia"]),
    *portraits("crinso", ["Rosebound Page, Crinso", "Duality Initiate, Crinso", "Crimson-Gold Knight, Crinso",
                        "Storm of the Twin Rose, Crinso", "Sovereign of Beautiful Ruin, Crinso", "The Rose Beyond Duality, Crinso"]),
    *icons("rosetta", ["Virtuous Bloom", "Golden Thorn Volley", "Crimson Skyfall", "Last Flare - Rose Beyond the Sun",
                      "Normal Attack - Rosetta", "Defense - Rosetta"]),
    *icons("thornia", ["Passive - Forbidden Garden", "Skill 1 - Gilded Thorn Guard", "Skill 2 - Shadow Rose Cleave",
                      "Last Flare - Thousand-Rose Dominion", "Normal Attack - Thornia", "Defense - Thornia"]),
    *icons("crinso", ["Passive - Rose Duality", "Skill 1 - Golden Edge", "Skill 2 - Crimson Rupture",
                     "Last Flare - Blossoming Cataclysm", "Normal Attack - Crisno", "Defense - Crisno"]),
    ("Roselius.png", "enemies", "roselius"),
    ("Votive of Golden Thorns, Roselius.png", "enemies", "roselius-golden-thorns"),
    ("Knight of the Crimson Bloom, Roselius.png", "enemies", "roselius-crimson-bloom"),
    ("Seraph of Passion, Roselius.png", "enemies", "roselius-seraph-passion"),
    ("Sovereign of the Living Rose, Roselius.png", "enemies", "roselius-living-rose"),
    ("The Garden Beyond Eternity, Roselius.png", "enemies", "roselius-garden-eternity"),
    *[(f"{name} of Rosethorn.png", "materials", f"rosethorn-{rarity}")
      for name, rarity in zip(("Seed", "Bud", "Bloom", "Crest", "Heart", "Soul"),
                             ("common", "uncommon", "rare", "epic", "legendary", "omnic"))],
    ("Passion of Crimson Roses Event Activity Banner.png", "banners", "roses-banner"),
    ("Rosethorn event arena.png", "backgrounds", "roses-arena"),
    ("Omnic summoning artpiece - Roses Under Sunny Skies.png", "banners", "summon-roses"),
]
PHASES = {
    "roses": ROSES,
    "atmoso": [
        *portraits("atmoso", ["Gale Wayfarer, Atmoso", "Crosswind Adept, Atmoso", "Skyspoke Invoker, Atmoso",
                             "Tempest Loom, Atmoso", "Crown of the High Gale, Atmoso", "The Sky Without End, Atmoso"]),
        *icons("atmoso", ["Gale Cadence - Passive", "Razor Gale - Skill 1", "Cyclone Weave - Skill 2",
                         "Last Flare Sky Without End - Last Flare", "Wind Pulse - Normal Attack", "Windward Brace - Defense"]),
    ],
    "aurora": [
        *portraits("aurora", ["Daybreak Arbiter, Aurora", "Gleamveil Adjudicator, Aurora", "Solar Verdict Oracle, Aurora",
                             "Prismseal Seraph, Aurora", "Dawncourt Sovereign, Aurora", "The Dawn Beyond Judgment, Aurora"]),
        *icons("aurora", ["Lens of Diminishment - Passive", "Gleamseal - Skill 1", "Eclipse Mandate - Skill 2",
                         "Final Dawn Verdict - Last Flare", "Light Lance - Normal Attack", "Prism Brace - Defense"]),
    ],
    "bliss": [
        *portraits("bliss", ["Featherstep Duelist, Bliss", "Stillplume Dancer, Bliss", "Quietwing Fencer, Bliss",
                            "Prismplume Arbiter, Bliss", "Serene Tempest Empress, Bliss", "The Thousandfeather Stillness, Bliss"]),
        *icons("bliss", ["Stillfeather Tempo - Passive", "Warfeather Cut - Skill 1", "Quietstorm Flourish - Skill 2",
                        "Thousandfeather Stillness - Last Flare", "Fan Strike - Normal Attack", "Folded Plume Guard - Defense"]),
    ],
    "bruno": [
        *portraits("bruno", ["Quarry Sentinel, Bruno", "Faultline Bulwark, Bruno", "Bedrock Citadel, Bruno",
                            "Worldforge Bastion, Bruno", "Prismatic Mountain Regent, Bruno", "The Living Worldwall, Bruno"]),
        *icons("bruno", ["Faultbound Resolve - Passive", "Seismic Hammerfall - Skill 1", "Citadel Mantle - Skill 2",
                        "Worldwall Ascendant - Last Flare", "Hammer Strike - Normal Attack", "Bedrock Brace - Defense"]),
    ],
    "disciple": [
        *portraits("disciple", ["Mindflame Initiate, Disciple", "Thoughtforge Adept, Disciple", "Ascendant Mindbinder, Disciple",
                               "Prismthought Hierophant, Disciple", "Mindflame Exarch, Disciple", "The Unbound Mindcrown, Disciple"]),
        *icons("disciple", ["Shared Mindflame - Passive", "Thoughtspark Benediction - Skill 1", "Concord of Chaos - Skill 2",
                           "Unbound Mindcrown - Last Flare", "Psychic Spark - Normal Attack", "Mindward - Defense"]),
    ],
    "elise": [
        *portraits("elise", ["Sparkstep Shinobi, Elise", "Voltweave Skirmisher, Elise", "Stormwheel Striker, Elise",
                            "Thunderlace Executioner, Elise", "Prismatic Storm Empress, Elise", "The Infinite Thunderwheel, Elise"]),
        *icons("elise", ["Stormwheel Rhythm - Passive", "Voltstar Cut - Skill 1", "Crosscurrent Volley - Skill 2",
                        "Infinite Thunderwheel - Last Flare", "Shuriken Throw - Normal Attack", "Grounded Star - Defense"]),
    ],
    "razor": [
        *portraits("razor", ["Nightwatch Bastion, Razor", "Duskplate Sentinel, Razor", "Eclipse Rampart, Razor",
                            "Nightglass Bulwark, Razor", "Prismatic Eclipse Regent, Razor", "The Unbroken Midnight, Razor"]),
        *icons("razor", ["Unbroken Night - Passive", "Nightcleave - Skill 1", "Eclipse Bastion - Skill 2",
                        "Unbroken Midnight - Last Flare", "Night Sword Strike - Normal Attack", "Nightglass Guard - Defense"]),
    ],
}
KEY_OVERRIDES = {
    "roselius-garden-eternity": {"hue": 130, "tolerance": 58},
}
RGB_KEY_POINTS = {
    "bliss-passive": (.30, .20),
    "bliss-skill2": (.02, .50),
}
RGB_KEY_RADII = {
    "aurora-evo-4": 24,
    "bruno-evo-4": 26,
    "bliss-passive": 18,
    "bliss-skill2": 24,
}
EXTERIOR_KEY_POINTS = {
    "bliss-passive": (.02, .50),
    "bliss-skill2": (.02, .50),
}
RGB_BACKGROUND_SEEDS = {
    "elise": [(0.487013, 0.868534)],
    "elise-evo-2": [(0.334416, 0.859914)],
    "elise-evo-3": [(0.211039, 0.450431), (0.49513, 0.836207)],
    "elise-evo-4": [(0.443182, 0.846983), (0.595779, 0.424569)],
    "elise-evo-5": [(0.162338, 0.797414), (0.25, 0.226293), (0.875, 0.69181),
                   (0.584416, 0.1875), (0.116883, 0.704741)],
    "elise-evo-6": [(0.38474, 0.474138), (0.435065, 0.594828)],
    "elise-skill1": [(0.623047, 0.755859)],
    "elise-light": [(0.375, 0.15625), (0.160156, 0.582031)],
    "atmoso": [(0.519481, 0.868534), (0.725649, 0.359914)],
    "atmoso-evo-2": [(0.461039, 0.877155), (0.798701, 0.450431), (0.410714, 0.086207),
                     (0.868506, 0.586207), (0.314935, 0.290948)],
    "atmoso-evo-3": [(0.5, 0.881466), (0.066558, 0.726293), (0.342532, 0.096983),
                     (0.295455, 0.327586), (0.88961, 0.465517)],
    "atmoso-evo-4": [(0.321429, 0.627155), (0.496753, 0.859914), (0.771104, 0.506466), (0.813312, 0.461207)],
    "atmoso-evo-5": [(0.878247, 0.353448), (0.13961, 0.737069), (0.813312, 0.767241),
                     (0.737013, 0.178879), (0.287338, 0.228448)],
    "atmoso-evo-6": [(0.743506, 0.581897), (0.261364, 0.596983), (0.855519, 0.581897)],
    "atmoso-skill1": [(0.388672, 0.525391), (0.472656, 0.730469)],
    "atmoso-light": [(0.74707, 0.188477)],
    "atmoso-defend": [(0.767578, 0.318359)],
    "aurora": [(0.521104, 0.851293)],
    "aurora-evo-2": [(0.512987, 0.894397), (0.850649, 0.396552), (0.168831, 0.443966)],
    "aurora-evo-3": [(0.503247, 0.875)],
    "aurora-evo-4": [(0.167208, 0.568966)],
    "aurora-evo-5": [(0.456169, 0.163793), (0.324675, 0.56681), (0.459416, 0.116379),
                    (0.267857, 0.717672), (0.748377, 0.737069), (0.176948, 0.711207), (0.152597, 0.741379)],
    "aurora-evo-6": [(0.149351, 0.517241), (0.116883, 0.415948)],
    "aurora-skill1": [(0.466797, 0.675781)],
    "aurora-skill2": [(0.632812, 0.529297)],
    "aurora-ultimate": [(0.642578, 0.792969), (0.355469, 0.792969), (0.794922, 0.330078), (0.341797, 0.238281)],
    "bliss": [(0.641234, 0.849138), (0.683442, 0.25)],
    "bliss-evo-2": [(0.49513, 0.890086)],
    "bliss-evo-3": [(0.550325, 0.491379)],
    "bliss-evo-4": [(0.621753, 0.325431), (0.362013, 0.362069), (0.704545, 0.62069)],
    "bliss-evo-5": [(0.238636, 0.644397), (0.837662, 0.368534), (0.157468, 0.439655),
                   (0.746753, 0.521552), (0.25974, 0.80819)],
    "bliss-passive": [(.30, .20), (0.671875, 0.689453), (0.300781, 0.310547)],
    "bliss-skill1": [(0.482422, 0.486328), (0.568359, 0.324219), (0.507812, 0.394531),
                    (0.490234, 0.439453), (0.53125, 0.355469), (0.494141, 0.53125),
                    (0.611328, 0.300781), (0.658203, 0.287109), (0.697266, 0.306641)],
    "bruno": [(0.607143, 0.872845)],
    "bruno-evo-2": [(0.511364, 0.840517)],
    "bruno-evo-3": [(0.503247, 0.864224)],
    "bruno-evo-4": [(0.418831, 0.855603), (0.910714, 0.258621), (0.537338, 0.159483),
                   (0.92776, 0.320043), (0.582792, 0.079741)],
    "bruno-evo-5": [(0.698052, 0.821121), (0.477273, 0.821121), (0.836039, 0.892241), (0.917208, 0.926724)],
    "bruno-evo-6": [(0.524351, 0.844828), (0.353896, 0.702586)],
}
HUE_PHASES = {"disciple", "razor"}
EXTERIOR_FRAME_ASSETS = {
    "atmoso-skill1", "atmoso-defend", "aurora-skill1", "aurora-skill2",
    "bliss-skill1", "bruno-passive", "disciple-light", "razor-skill1",
}
EMPTY_FRAME_MARGINS = {"bliss-skill1": 24, "bruno-passive": 32}
WARM_BACKDROP_REGIONS = {
    "roselius-garden-eternity": [
        (.35, .06), (.65, .06), (.65, .30), (.63, .39), (.69, .49),
        (.56, .51), (.54, .34), (.40, .34), (.41, .52), (.32, .50), (.35, .36),
    ],
}

# The delivery uses muted green/teal backgrounds, not the prompt's pure-green key.
# This phase's green/teal regions were reviewed as background, including enclosed openings.
SOURCE_FACING = {
    "atmoso": "left", "atmoso-evo-2": "right", "atmoso-evo-3": "right",
    "atmoso-evo-4": "front", "atmoso-evo-5": "front", "atmoso-evo-6": "left",
    "aurora": "front", "aurora-evo-2": "front", "aurora-evo-3": "front",
    "aurora-evo-4": "front", "aurora-evo-5": "front", "aurora-evo-6": "front",
    "bliss": "front", "bliss-evo-2": "front", "bliss-evo-3": "front",
    "bliss-evo-4": "front", "bliss-evo-5": "front", "bliss-evo-6": "front",
    "bruno": "left", "bruno-evo-2": "left", "bruno-evo-3": "front",
    "bruno-evo-4": "right", "bruno-evo-5": "left", "bruno-evo-6": "left",
    "disciple": "left", "disciple-evo-2": "front", "disciple-evo-3": "front",
    "disciple-evo-4": "front", "disciple-evo-5": "front", "disciple-evo-6": "front",
    "elise": "front", "elise-evo-2": "right", "elise-evo-3": "front",
    "elise-evo-4": "right", "elise-evo-5": "front", "elise-evo-6": "front",
    "razor": "left", "razor-evo-2": "left", "razor-evo-3": "right",
    "razor-evo-4": "left", "razor-evo-5": "left", "razor-evo-6": "left",
    "rosetta": "right", "rosetta-evo-2": "left", "rosetta-evo-3": "left",
    "rosetta-evo-4": "left", "rosetta-evo-5": "front", "rosetta-evo-6": "front",
    "thornia": "left", "thornia-evo-2": "left", "thornia-evo-3": "left",
    "thornia-evo-4": "front", "thornia-evo-5": "front", "thornia-evo-6": "front",
    "crinso": "left", "crinso-evo-2": "left", "crinso-evo-3": "left",
    "crinso-evo-4": "left", "crinso-evo-5": "left", "crinso-evo-6": "left",
    "roselius": "right", "roselius-golden-thorns": "front", "roselius-crimson-bloom": "front",
    "roselius-seraph-passion": "front", "roselius-living-rose": "front", "roselius-garden-eternity": "front",
}


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def historical_runtime(asset, runtime):
    manifest = art_path("character-refresh-intake.json", root=ROOT)
    if manifest.exists():
        refresh = json.loads(manifest.read_text(encoding="utf-8"))
        for record in refresh["assets"]:
            if record["asset"] == asset:
                return ROOT / record["previous_runtime"]
    return runtime


def remove_exterior_outline(rgba, hsv):
    height, width = hsv.shape[:2]
    y, x = np.indices((height, width))
    band = (x < width * .025) | (x >= width * .975) | (y < height * .025) | (y >= height * .975)
    remaining = band & (rgba[:, :, 3] > 0)
    ys, xs = np.nonzero(remaining)
    for row, column in zip(ys, xs):
        if not remaining[row, column]:
            continue
        component = connected_matte(remaining, [(row, column)])
        remaining[component] = False
        cy, cx = np.nonzero(component)
        if cx.max() - cx.min() >= width * .75 or cy.max() - cy.min() >= height * .75:
            rgba[component] = 0


def prepare(path, category, asset):
    with Image.open(path) as image:
        if category in ("banners", "backgrounds"):
            return path.read_bytes(), {"method": "scenery copied byte-for-byte"}
        size, content = (256, 224) if category in ("abilities", "materials") else (960, 864)
        if image.mode == "RGBA" and image.getextrema()[3][0] < 255:
            cleaned = image.copy()
            processing = {"method": "supplied-alpha; trim/resize/pad only"}
        else:
            rgb = np.asarray(image.convert("RGB"))
            # Some square icons have a white outer frame; trim only complete white rows/columns.
            nonwhite = np.any(rgb < 245, axis=2)
            ys, xs = np.nonzero(nonwhite)
            if not len(xs):
                raise ValueError(f"Empty artwork: {path}")
            box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
            image = image.crop(box)
            hsv = np.asarray(image.convert("RGB").convert("HSV"), dtype=float)
            inset = 16 if category == "abilities" else 2
            border = np.concatenate((hsv[inset, inset:-inset], hsv[-inset - 1, inset:-inset],
                                     hsv[inset:-inset, inset], hsv[inset:-inset, -inset - 1]))
            candidates = border[(border[:, 1] > 20) & (border[:, 2] > 40)]
            if not len(candidates):
                raise ValueError(f"No reviewed green/teal key at border: {path}")
            hue = int(np.median(candidates[:, 0]) * 360 / 255)
            if asset in {row[2] for row in ROSES} and not 75 <= hue <= 185:
                raise ValueError(f"Unexpected key hue {hue}: {path}")
            settings = {"hue": hue, "tolerance": 18, "saturation_min": .08, "value_min": .12,
                        "border_only": False}
            if asset not in {row[2] for row in ROSES}:
                settings.update(tolerance=12, saturation_min=max(.08, float(np.median(candidates[:, 1]) / 255 * .45)),
                                border_only=True)
            settings.update(KEY_OVERRIDES.get(asset, {}))
            hue_phase = asset.split("-", 1)[0] in HUE_PHASES
            if hue_phase:
                settings.update(tolerance=18, border_only=False)
            if asset in {row[2] for row in ROSES} or hue_phase:
                cleaned = remove_color_matte(image, **settings)
            else:
                rgb = np.asarray(image.convert("RGB"), dtype=np.int32)
                samples = np.concatenate((rgb[inset, inset:-inset], rgb[-inset - 1, inset:-inset],
                                          rgb[inset:-inset, inset], rgb[inset:-inset, -inset - 1]))
                bins, counts = np.unique(samples // 16, axis=0, return_counts=True)
                dominant = bins[counts.argmax()]
                background = np.median(samples[np.all(samples // 16 == dominant, axis=1)], axis=0)
                if asset in RGB_KEY_POINTS:
                    x, y = RGB_KEY_POINTS[asset]
                    background = rgb[round(y * image.height), round(x * image.width)]
                radius = RGB_KEY_RADII.get(asset, 32)
                distance = np.sum((rgb - background) ** 2, axis=2)
                eligible = distance <= radius ** 2
                if not eligible.any():
                    raise ValueError(f"Reviewed RGB key did not match: {path}")
                height, width = eligible.shape
                starts = ([(0, x) for x in range(width)] + [(height - 1, x) for x in range(width)]
                          + [(y, x) for y in range(height) for x in (0, width - 1)])
                near_border = [(inset, x) for x in range(inset, width - inset) if eligible[inset, x]]
                if near_border:
                    starts.append(near_border[len(near_border) // 2])
                starts += reviewed_background_starts(eligible, RGB_BACKGROUND_SEEDS.get(asset, ()))
                matte = connected_matte(eligible, starts)
                if not matte.any():
                    raise ValueError(f"Reviewed RGB key is not reachable: {path}")
                rgba = np.dstack((rgb.astype(np.uint8), np.where(matte, 0, 255).astype(np.uint8)))
                rgba[matte] = 0
                cleaned = Image.fromarray(rgba)
                settings = {"derived_background_rgb": list(map(int, background)),
                            "radius": radius, "border_connected": True,
                            "background_seeds": RGB_BACKGROUND_SEEDS.get(asset, ())}
            pale = (hsv[:, :, 1] < 20) & (hsv[:, :, 2] > 230)
            height, width = pale.shape
            starts = ([(0, x) for x in range(width)] + [(height - 1, x) for x in range(width)]
                      + [(y, x) for y in range(height) for x in (0, width - 1)])
            exterior_frame = connected_matte(pale, starts)
            rgba = np.asarray(cleaned).copy()
            rgba[exterior_frame] = 0
            if asset in EXTERIOR_FRAME_ASSETS:
                remove_exterior_outline(rgba, hsv)
            if asset in EMPTY_FRAME_MARGINS:
                margin = EMPTY_FRAME_MARGINS[asset]
                rgba[:margin] = 0
                rgba[-margin:] = 0
                rgba[:, :margin] = 0
                rgba[:, -margin:] = 0
            if asset in EXTERIOR_KEY_POINTS:
                x, y = EXTERIOR_KEY_POINTS[asset]
                outer = rgb[round(y * height), round(x * width)].astype(float)
                exterior = connected_matte(np.sum((rgb - outer) ** 2, axis=2) <= 32 ** 2, starts)
                rgba[exterior] = 0
            if asset in WARM_BACKDROP_REGIONS:
                region = Image.new("L", image.size)
                ImageDraw.Draw(region).polygon(
                    [(round(x * width), round(y * height)) for x, y in WARM_BACKDROP_REGIONS[asset]], fill=255)
                warm = ((hsv[:, :, 0] * 360 / 255 < 85) & (hsv[:, :, 1] < 130)
                        & (hsv[:, :, 2] < 210) & (np.asarray(region) > 0))
                rgba[warm] = 0
            cleaned = Image.fromarray(rgba)
            method = ("reviewed green/teal hue key including enclosed openings; exterior white frame only"
                      if asset in {row[2] for row in ROSES} else
                      "reviewed hue key including enclosed openings; exterior white frame only" if hue_phase else
                      "reviewed border-connected RGB-distance key; exterior white frame only")
            processing = {"method": method,
                          "outer_white_frame_crop": box, **settings}
            if asset in WARM_BACKDROP_REGIONS:
                processing["reviewed_warm_backdrop_polygon"] = WARM_BACKDROP_REGIONS[asset]
            if asset in EXTERIOR_KEY_POINTS:
                processing["reviewed_exterior_key_point"] = EXTERIOR_KEY_POINTS[asset]
            if asset in EXTERIOR_FRAME_ASSETS:
                processing["reviewed_exterior_frame"] = {
                    "outer_band": .025, "minimum_span": .75,
                }
            if asset in EMPTY_FRAME_MARGINS:
                processing["reviewed_empty_frame_margin"] = EMPTY_FRAME_MARGINS[asset]
        result = standardize_sprite(cleaned, size, content)
        buffer = BytesIO()
        result.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue(), processing


def intake(phase, apply=False, remove_incoming=False):
    if remove_incoming and not apply:
        raise ValueError("Removing verified root copies requires --apply.")
    mapping = PHASES[phase]
    if len({row[0] for row in mapping}) != len(mapping) or len({row[1:] for row in mapping}) != len(mapping):
        raise ValueError("Duplicate intake mapping.")
    manifest = art_path(f"{phase}-art-intake.json", root=ROOT)
    previous = json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else None
    planned = []
    for filename, category, asset in mapping:
        incoming = ROOT / filename
        source = ROOT / "Art" / "source" / "roster-intake" / phase / category / filename
        path = incoming if incoming.is_file() else source
        if source.exists() and digest(source) != digest(path):
            raise FileExistsError(f"Conflicting archived source: {source}")
        canonical_runtime = ROOT / "public" / "assets" / category / f"{asset}.png"
        runtime = historical_runtime(asset, canonical_runtime)
        output, processing = prepare(path, category, asset)
        if runtime.exists() and runtime.read_bytes() != output:
            raise FileExistsError(f"Conflicting runtime artwork: {runtime}")
        record = {"incoming": filename, "asset": asset, "category": category,
                  "source": str(source.relative_to(ROOT)), "source_sha256": digest(path),
                  "runtime": str(canonical_runtime.relative_to(ROOT)), "runtime_sha256": sha256(output).hexdigest(),
                  "processing": processing}
        if asset in SOURCE_FACING:
            record["source_facing"] = SOURCE_FACING[asset]
        planned.append((incoming, source, runtime, output, record))
    text = json.dumps({"phase": phase, "asset_count": len(planned),
                       "assets": [row[-1] for row in planned]}, indent=2) + "\n"
    if previous is not None and previous != json.loads(text):
        raise FileExistsError(f"Intake provenance changed: {manifest}")
    if apply:
        for incoming, source, runtime, output, record in planned:
            source.parent.mkdir(parents=True, exist_ok=True)
            if not source.exists():
                shutil.copyfile(incoming, source)
            runtime.parent.mkdir(parents=True, exist_ok=True)
            if not runtime.exists():
                runtime.write_bytes(output)
            if digest(source) != record["source_sha256"] or digest(runtime) != record["runtime_sha256"]:
                raise ValueError(f"Installed bytes differ: {source}")
        manifest.parent.mkdir(parents=True, exist_ok=True)
        manifest.write_text(text, encoding="utf-8")
        if remove_incoming:
            for incoming, source, _, _, record in planned:
                if incoming.exists():
                    if digest(incoming) != digest(source):
                        raise ValueError(f"Root original changed: {incoming}")
                    incoming.unlink()
    print(f"{phase}: {len(planned)} assets {'installed' if apply else 'validated (dry run)'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", choices=PHASES, required=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true",
                        help="After visual review, remove only hash-verified archived root copies.")
    args = parser.parse_args()
    intake(args.phase, args.apply, args.remove_incoming)
