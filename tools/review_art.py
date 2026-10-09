"""Create dark-background contact sheets for manual cutout review."""

import argparse
import json
import hashlib
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from prepare_art import ROOT, ASSETS, MATTE_MINIMUMS, MATTE_SPREADS, PALE_ART_REGIONS, PALE_ART_CUTOUTS, pale_art_mask, remove_matte, supplied_cutout, starter_refresh_source
from prepare_dungeons import AQUATIC_ENEMIES, EFFLORESCENT_ENEMIES, TRANQUILITIC_ENEMIES, VOLTAIC_ENEMIES, LUMINOUS_ENEMIES, TECTONIC_ENEMIES, CHAOTIC_ENEMIES, ATMOSPHERIC_ENEMIES, OMINOUS_ENEMIES, has_color_matte, prepare_dungeon_sprite
from prepare_infusions import ENEMIES, MATERIALS, has_infusion_color_matte, prepare_infusion_sprite
from prepare_icons import ICONS
from prepare_currencies import CURRENCIES, prepare_currency_sprite, current_currency_source
from matte_regions import BACKGROUND_SEEDS
from art_library import art_path


def sources():
    entries = {asset: ROOT / "Art" / "source" / category / filename
               for filename, (category, asset) in ASSETS.items()}
    for pack in (AQUATIC_ENEMIES, EFFLORESCENT_ENEMIES, TRANQUILITIC_ENEMIES, VOLTAIC_ENEMIES, LUMINOUS_ENEMIES, TECTONIC_ENEMIES, CHAOTIC_ENEMIES, ATMOSPHERIC_ENEMIES, OMINOUS_ENEMIES, ENEMIES):
        entries.update({asset: ROOT / "Art" / "source" / "enemies" / f"{name}.png" for name, asset in pack.items()})
    entries.update({asset: ROOT / "Art" / "source" / "materials" / f"{name}.png" for name, asset in MATERIALS.items()})
    for element in ("infernic", "aquatic", "efflorescent", "tranquilitic", "voltaic", "luminous", "tectonic", "chaotic", "atmospheric", "ominous"):
        for name in ("seed", "bloom", "shard", "crest", "heart", "soul"):
            entries[f"{element}-{name}"] = ROOT / "Art" / "source" / "materials" / f"{name.capitalize()} of {element.capitalize()}.png"
    entries.update({asset: ROOT / "Art" / "source" / "abilities" / asset.split("-")[0] / filename for filename, asset in ICONS.items()})
    entries.update({asset: current_currency_source(name, asset) for name, asset in CURRENCIES.items()})
    return entries


def pockets(image):
    pixels = np.asarray(image)
    rgb = pixels[:, :, :3].astype(int)
    eligible = (rgb.min(axis=2) >= 230) & (rgb.max(axis=2) - rgb.min(axis=2) <= 20) & (pixels[:, :, 3] == 255)
    height, width = eligible.shape
    result = []
    for y, x in zip(*np.where(eligible)):
        if not eligible[y, x]:
            continue
        queue = deque([(y, x)])
        eligible[y, x] = False
        points = []
        while queue:
            yy, xx = queue.popleft()
            points.append((yy, xx))
            for ny, nx in ((yy - 1, xx), (yy + 1, xx), (yy, xx - 1), (yy, xx + 1)):
                if 0 <= ny < height and 0 <= nx < width and eligible[ny, nx]:
                    eligible[ny, nx] = False
                    queue.append((ny, nx))
        if len(points) < 35:
            continue
        cy, cx = np.mean(points, axis=0)
        sy, sx = min(points, key=lambda point: (point[0] - cy)**2 + (point[1] - cx)**2)
        result.append((sx / width, sy / height, len(points)))
    return sorted(result, key=lambda point: -point[2])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--pockets", nargs="+", choices=list(sources()), help="Render numbered source-coordinate candidates for these asset IDs.")
    parser.add_argument("--cleaned", action="store_true", help="Preview reviewed cleanup at full export resolution.")
    parser.add_argument("--assets", nargs="+", choices=list(sources()), help="Limit cleaned exports to these IDs.")
    parser.add_argument("--record-review", action="store_true", help="Record the completed manual audit in Art/provenance/matte-review.json.")
    parser.add_argument("--input", type=Path, default=ROOT / "public" / "assets", help="Cutouts to display on contact sheets.")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    if args.record_review:
        entries = []
        for asset, source in sorted(sources().items()):
            category = "abilities" if asset in ICONS.values() else source.parent.name
            runtime = ROOT / "public" / "assets" / category / f"{asset}.png"
            legacy_source = source
            replacement = starter_refresh_source(asset)
            cutout = None if replacement else supplied_cutout(asset)
            source = replacement or cutout or source
            if replacement:
                from intake_starter_refresh import load_settings
                processing = load_settings()[asset]
            entries.append({
                "asset": asset,
                "source": str(source.relative_to(ROOT)),
                "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                "runtime": str(runtime.relative_to(ROOT)),
                "runtime_sha256": hashlib.sha256(runtime.read_bytes()).hexdigest(),
                "review": "reviewed-starter-replacement" if replacement else "owner-supplied-alpha" if cutout else "reviewed-color-key" if has_color_matte(asset) or has_infusion_color_matte(asset) or asset in CURRENCIES.values() else "targeted-cleanup" if asset in BACKGROUND_SEEDS or asset in MATTE_SPREADS or asset in PALE_ART_REGIONS else "retained",
                "background_seeds": processing.get("background_seeds", []) if replacement else [] if cutout else BACKGROUND_SEEDS.get(asset, []),
                **({"processing": processing} if replacement else {}),
                **({"legacy_source": str(legacy_source.relative_to(ROOT)),
                    "processing": "supplied-alpha; trim, uniform resize and transparent padding only"} if cutout else {}),
                **({"foreground_regions": PALE_ART_REGIONS[asset],
                    "foreground_cutouts": PALE_ART_CUTOUTS.get(asset, [])} if not replacement and not cutout and asset in PALE_ART_REGIONS else {}),
            })
        review_path = art_path("matte-review.json", root=ROOT)
        review_path.parent.mkdir(parents=True, exist_ok=True)
        review_path.write_text(json.dumps({
            "reviewed": "2026-10-04",
            "method": "Owner-supplied RGBA cutouts take precedence without background removal; legacy originals retain earlier reviewed processing.",
            "assets": entries,
        }, indent=2) + "\n", encoding="utf-8")
        return
    if args.cleaned:
        paths = sources()
        for asset in sorted(paths):
            if args.assets and asset not in args.assets:
                continue
            if not args.assets and not starter_refresh_source(asset) and not supplied_cutout(asset) and asset not in BACKGROUND_SEEDS and asset not in MATTE_SPREADS and not has_color_matte(asset) and not has_infusion_color_matte(asset) and asset not in CURRENCIES.values():
                continue
            path = paths[asset]
            category = "abilities" if asset in ICONS.values() else path.parent.name
            size, content = (256, 224) if category in ("materials", "abilities", "currencies") else (960, 864)
            prepare = prepare_currency_sprite if asset in CURRENCIES.values() else prepare_infusion_sprite if asset in (*ENEMIES.values(), *MATERIALS.values()) else prepare_dungeon_sprite
            result = prepare(path, asset, size, content)
            destination = args.output / category / f"{asset}.png"
            destination.parent.mkdir(parents=True, exist_ok=True)
            result.save(destination, optimize=True)
            print(asset)
        return
    if args.pockets:
        manifest = {}
        paths = sources()
        for asset in args.pockets:
            if supplied_cutout(asset):
                raise ValueError(f"{asset} has authoritative supplied alpha; legacy matte pocket review is disabled.")
            if has_color_matte(asset) or has_infusion_color_matte(asset) or asset in CURRENCIES.values():
                raise ValueError(f"{asset} uses a reviewed color key; white-matte pocket review is not applicable.")
        for asset in args.pockets:
            with Image.open(paths[asset]) as original:
                image = original.copy()
                image.thumbnail((600, 450))
                ivory = asset == "heavens-chalice-undying-dawn"
                cutout = remove_matte(image, matte_minimum=215 if ivory else MATTE_MINIMUMS.get(asset, 230),
                                     matte_spread=50 if ivory else 20, foreground_mask=pale_art_mask(image, asset),
                                     standardize=False)
            candidates = pockets(cutout)
            manifest[asset] = candidates
            preview = Image.new("RGB", cutout.size, "#14141c")
            preview.paste(cutout, (0, 0), cutout)
            draw = ImageDraw.Draw(preview)
            for index, (x, y, _) in enumerate(candidates):
                draw.text((round(x * image.width), round(y * image.height)), str(index + 1), fill="#ff0000", stroke_width=1, stroke_fill="white")
            preview.save(args.output / f"{asset}.jpg", quality=95)
        (args.output / "pockets.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        return
    for category in ("characters", "enemies", "materials", "abilities"):
        files = sorted((args.input / category).glob("*.png"))
        for start in range(0, len(files), 12):
            sheet = Image.new("RGB", (1080, 1440), "#14141c")
            draw = ImageDraw.Draw(sheet)
            for index, path in enumerate(files[start:start + 12]):
                x, y = (index % 3) * 360, (index // 3) * 360
                with Image.open(path) as image:
                    sprite = image.convert("RGBA")
                    sprite.thumbnail((350, 325))
                    sheet.paste(sprite, (x + (360 - sprite.width) // 2, y), sprite)
                draw.text((x + 5, y + 330), path.stem, fill="white")
            sheet.save(args.output / f"{category}-{start // 12 + 1}.jpg", quality=95)


if __name__ == "__main__":
    main()
