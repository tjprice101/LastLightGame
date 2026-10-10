"""Export reviewed currency cutouts, preserving original artwork."""
import argparse
import hashlib
import json
import numpy as np
from PIL import Image, ImageDraw
from prepare_art import ROOT, supplied_cutout, prepare_sprite, standardize_sprite, connected_matte
from prepare_dungeons import source_file
from color_matte import remove_color_matte
from art_library import art_path

CURRENCIES = {"Fractalis": "fractalis", "Lycalis": "lycalis"}


def current_currency_source(name, asset):
    from intake_d157_root_art import assets as delivered_assets
    delivered = next(row for row in delivered_assets()
                     if row.asset == asset and row.category == "currencies")
    if delivered.source.is_file():
        return delivered.source
    if (ROOT / delivered.incoming).is_file():
        return ROOT / delivered.incoming
    from intake_prism_currency_art import ASSETS, source_path
    prism_name = next(name for name, identity in ASSETS.items() if identity == asset)
    prism = source_path(prism_name)
    return prism if prism.exists() else source_file(f"{name}.png", "currencies", True)


def remove_currency_matte(image, asset):
    options = ({"hue": 20, "tolerance": 12, "saturation_min": .25}
               if asset == "fractalis" else
               {"hue": 14, "tolerance": 12, "saturation_min": .20})
    result = remove_color_matte(image, border_only=True, **options)
    rgba = np.array(result)
    hsv = np.asarray(image.convert("RGB").convert("HSV"), dtype=float)
    hue, saturation, value = hsv[:, :, 0] * 360 / 255, hsv[:, :, 1] / 255, hsv[:, :, 2] / 255
    y, x = np.indices(hue.shape)
    if asset == "fractalis":
        eligible = ((hue >= 325) & (hue <= 352) & (saturation >= .18) &
                    (saturation <= .40) & (value <= .60))
        eligible &= (x >= image.width * .43) & (y >= image.height * .55)
        shadow = connected_matte(eligible, [(round(image.height * .664), round(image.width * .942)),
                                            (round(image.height * .898), round(image.width * .635))])
        rgba[shadow] = 0
        outside_rim = Image.new("L", image.size)
        ImageDraw.Draw(outside_rim).polygon([
            (round(px * image.width), round(py * image.height)) for px, py in [
                (.938, .500), (.929, .550), (.920, .600), (.909, .650), (.880, .715),
                (.842, .766), (.794, .812), (.740, .850), (.684, .858),
                (.635, .876), (.586, .884), (.537, .890), (.489, .888),
                (.440, .887), (.410, .877), (.380, .866), (.380, 1), (1, 1), (1, .50),
            ]
        ], fill=255)
        ImageDraw.Draw(outside_rim).polygon([
            (round(px * image.width), round(py * image.height)) for px, py in [
                (.478, .915), (.491, .894), (.510, .910), (.526, .928),
                (.518, .940), (.494, .943), (.480, .930),
            ]
        ], fill=0)
        rgba[np.asarray(outside_rim) != 0] = 0
    else:
        sparkle_regions = (((x >= image.width * .27) & (x <= image.width * .45) &
                            (y >= image.height * .05) & (y <= image.height * .27) &
                            (x + y < image.width * .65)) |
                           ((x >= image.width * .76) & (x <= image.width * .91) &
                            (y >= image.height * .07) & (y <= image.height * .30)))
        spill = sparkle_regions & (saturation < .35) & (value < .70)
        rgba[spill] = 0
    return Image.fromarray(rgba)


def prepare_currency_sprite(source, asset, size=256, content=224):
    if asset not in CURRENCIES.values():
        raise ValueError(f"Unknown currency artwork: {asset}")
    from intake_prism_currency_art import ASSETS, prepare
    if source.stem in ASSETS:
        if ASSETS[source.stem] != asset:
            raise ValueError("Currency source does not match artwork identity.")
        return prepare(source, asset, size, content)
    if supplied_cutout(asset):
        return prepare_sprite(source, asset, size, content)
    with Image.open(source) as image:
        return standardize_sprite(remove_currency_matte(image, asset), size, content)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--assets", nargs="+", choices=list(CURRENCIES.values()))
    parser.add_argument("--record-review", action="store_true",
                        help="Record hashes after manually reviewing the exported cutouts.")
    args = parser.parse_args()
    records = []
    for name, asset in CURRENCIES.items():
        if args.assets and asset not in args.assets:
            continue
        source = current_currency_source(name, asset)
        output = ROOT / "public" / "assets" / "currencies" / f"{asset}.png"
        output.parent.mkdir(parents=True, exist_ok=True)
        prepare_currency_sprite(source, asset).save(output, optimize=True)
        print(output.relative_to(ROOT))
        records.append({
            "asset": asset, "source": str(source.relative_to(ROOT)),
            "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
            "runtime": str(output.relative_to(ROOT)),
            "runtime_sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
            "review": "owner-supplied-alpha" if supplied_cutout(asset) else "reviewed-color-key",
            "processing": "reviewed prism source-specific border-connected teal key and bounded edge cleanup; supplied alpha trim/resize/pad only" if source.stem in ("Prismatica", "Null-Prismatica") else "per-currency border-connected brown key; Fractalis reviewed exterior shadow mask preserving detached residue; Lycalis localized muted sparkle spill removal; trim, uniform resize, transparent padding",
        })
    if args.record_review:
        manifest = art_path("matte-review.json", root=ROOT)
        data = json.loads(manifest.read_text(encoding="utf-8"))
        updated = {record["asset"] for record in records}
        data["assets"] = [record for record in data["assets"] if record["asset"] not in updated] + records
        manifest.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
