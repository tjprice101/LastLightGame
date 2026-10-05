"""Install explicitly matched, owner-supplied RGBA cutouts without matte removal."""

import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

from prepare_art import ROOT, standardize_sprite
from review_art import sources
from prepare_icons import ICONS


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def intake(mapping, apply=False):
    known = sources()
    rows = json.loads(mapping.read_text(encoding="utf-8"))
    if not isinstance(rows, list) or not rows:
        raise ValueError("Mapping must be a nonempty list of reviewed image matches.")
    assets, incoming_names, planned = set(), set(), []
    for row in rows:
        asset, filename, category = row["asset"], row["incoming"], row["category"]
        if asset not in known or asset in assets or filename in incoming_names:
            raise ValueError(f"Unknown/duplicate mapping: {asset} / {filename}")
        expected = "abilities" if asset in ICONS.values() else known[asset].parent.name
        if category != expected or Path(filename).name != filename or not filename.endswith(".png"):
            raise ValueError(f"Invalid filename/category: {filename} / {category}")
        assets.add(asset)
        incoming_names.add(filename)
        incoming = ROOT / filename
        archived = ROOT / "Art" / "source" / "cutouts" / category / f"{asset}.png"
        runtime = ROOT / "public" / "assets" / category / f"{asset}.png"
        if archived.exists():
            raise FileExistsError(f"Cutout already exists; refusing to overwrite: {archived}")
        if not incoming.is_file() or not runtime.is_file():
            raise FileNotFoundError(f"Missing incoming or implemented asset: {incoming} / {runtime}")
        with Image.open(incoming) as image:
            if image.mode != "RGBA" or image.getextrema()[3][0] != 0 or not image.getbbox():
                raise ValueError(f"Replacement must be a nonempty transparent RGBA PNG: {incoming}")
            size, content = (256, 224) if category in ("materials", "abilities") else (960, 864)
            result = standardize_sprite(image, size, content)
        planned.append((incoming, archived, runtime, result, {
            "asset": asset, "category": category, "incoming": filename,
            "source": str(archived.relative_to(ROOT)),
            "source_sha256": digest(incoming),
            "legacy_source": str(known[asset].relative_to(ROOT)),
            "legacy_source_sha256": digest(known[asset]),
            "runtime": str(runtime.relative_to(ROOT)),
            "previous_runtime_sha256": digest(runtime),
            "processing": "supplied-alpha; trim, uniform resize and transparent padding only",
        }))
    manifest = ROOT / "Art" / "cutout-intake.json"
    if apply and manifest.exists():
        raise FileExistsError(f"Intake manifest already exists: {manifest}")
    for incoming, archived, runtime, result, record in planned:
        if apply:
            archived.parent.mkdir(parents=True, exist_ok=True)
            incoming.rename(archived)
            if digest(archived) != record["source_sha256"]:
                raise ValueError(f"Renamed source bytes changed: {archived}")
            result.save(runtime, optimize=True)
            record["runtime_sha256"] = digest(runtime)
        print(f"{incoming.name} -> {archived.relative_to(ROOT)} -> {runtime.relative_to(ROOT)}")
    if apply:
        manifest.write_text(json.dumps({"method": "Owner-supplied transparent replacements; no background removal",
                                        "assets": [record for *_, record in planned]}, indent=2) + "\n",
                            encoding="utf-8")
    print(f"{len(planned)} unique matches {'installed' if apply else 'validated (dry run)'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mapping", type=Path, required=True)
    parser.add_argument("--apply", action="store_true", help="Rename supplied originals and replace runtime exports.")
    args = parser.parse_args()
    intake(args.mapping, args.apply)
