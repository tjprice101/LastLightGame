"""Export supplied starter icons independently of unit sprite sizing."""

import argparse

from PIL import Image

from prepare_art import ROOT, prepare_sprite
from matte_regions import BACKGROUND_SEEDS, BACKGROUND_MINIMUMS

ICONS = {
    "Unbroken Ember.png": "infernis-unbroken-ember",
    "Cinder Cleave.png": "infernis-cinder-cleave",
    "Flame Arc.png": "infernis-flame-arc",
    "Last Flare, Dawnfire.png": "infernis-last-flare-dawnfire",
    "Light Attack.png": "infernis-light-attack",
    "Heavy Attack.png": "infernis-heavy-attack",
    "Stillwater Guard.png": "tizu-stillwater-guard",
    "Undertow Thrust.png": "tizu-undertow-thrust",
    "Tidal Shelter.png": "tizu-tidal-shelter",
    "Last Flare, Ocean Memory.png": "tizu-last-flare-ocean-memory",
    "Normal Attack Tizu.png": "tizu-normal-attack",
    "Root of Hope.png": "flora-root-of-hope",
    "Briar Shot.png": "flora-briar-shot",
    "Verdant Renewal.png": "flora-verdant-renewal",
    "Last Flare, Worldseed.png": "flora-last-flare-worldseed",
    "Normal Attack - Basic Action Flora.png": "flora-normal-attack",
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--move-sources", action="store_true")
    parser.add_argument("--assets", nargs="+", choices=list(ICONS.values()),
                        help="Process only the named asset IDs; omit to regenerate all icons.")
    args = parser.parse_args()
    for filename, asset_id in ICONS.items():
        if args.assets and asset_id not in args.assets:
            continue
        character = asset_id.split("-", 1)[0]
        source = ROOT / "Art" / "source" / "abilities" / character / filename
        if args.move_sources and (ROOT / filename).exists():
            if source.exists():
                raise FileExistsError(source)
            source.parent.mkdir(parents=True, exist_ok=True)
            (ROOT / filename).rename(source)
        with Image.open(source) as image:
            if image.size[0] != image.size[1]:
                raise ValueError(f"Ability icon source must be square: {source}")
        result = prepare_sprite(source, asset_id, 256, 224,
                                background_seeds=BACKGROUND_SEEDS.get(asset_id, ()),
                                background_minimum=BACKGROUND_MINIMUMS.get(asset_id, 230))
        output = ROOT / "public" / "assets" / "abilities" / f"{asset_id}.png"
        output.parent.mkdir(parents=True, exist_ok=True)
        result.save(output, optimize=True)
        print(f"{output.relative_to(ROOT)}: 256x256 RGBA, 224px content, 16px padding")


if __name__ == "__main__":
    main()
