"""Export supplied Infernis icons independently of unit sprite sizing."""

import argparse

from PIL import Image

from prepare_art import ROOT, remove_matte

ICONS = {
    "Unbroken Ember.png": "infernis-unbroken-ember",
    "Cinder Cleave.png": "infernis-cinder-cleave",
    "Flame Arc.png": "infernis-flame-arc",
    "Last Flare, Dawnfire.png": "infernis-last-flare-dawnfire",
    "Light Attack.png": "infernis-light-attack",
    "Heavy Attack.png": "infernis-heavy-attack",
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--move-sources", action="store_true")
    args = parser.parse_args()
    for filename, asset_id in ICONS.items():
        source = ROOT / "Art" / "source" / "abilities" / "infernis" / filename
        if args.move_sources and (ROOT / filename).exists():
            if source.exists():
                raise FileExistsError(source)
            source.parent.mkdir(parents=True, exist_ok=True)
            (ROOT / filename).rename(source)
        with Image.open(source) as image:
            if image.size[0] != image.size[1]:
                raise ValueError(f"Ability icon source must be square: {source}")
            result = remove_matte(image, canvas_size=256, content_size=224)
        output = ROOT / "public" / "assets" / "abilities" / f"{asset_id}.png"
        output.parent.mkdir(parents=True, exist_ok=True)
        result.save(output, optimize=True)
        print(f"{output.relative_to(ROOT)}: 256x256 RGBA, 224px content, 16px padding")


if __name__ == "__main__":
    main()
