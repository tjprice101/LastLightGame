"""Preserve and install reviewed replacement starter portraits, never legacy masks."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw

from prepare_art import ROOT, ASSETS as LEGACY_ASSETS, standardize_sprite
from intake_character_refresh import clean

MANIFEST = ROOT / "Art" / "starter-refresh-intake.json"
SETTINGS = ROOT / "Art" / "starter-refresh-settings.json"
ASSETS = [(filename.replace(f"{name} Beginner", f"Beginner, {name}"), asset)
          for filename, (category, asset) in LEGACY_ASSETS.items()
          for name in ("Infernis", "Tizu", "Flora")
          if category == "characters" and name in filename]


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def source_path(asset):
    return ROOT / "Art" / "source" / "starter-refresh" / f"{asset}.png"


def load_settings():
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    if len(ASSETS) != 18 or set(settings) != {asset for _, asset in ASSETS}:
        raise ValueError("Reviewed settings must cover exactly18 starter forms.")
    for row in settings.values():
        row.setdefault("edge_cleanup", {"source_pixels": 2, "distance_ramp": 40})
    return settings


def prepare(source, settings, size=960, content=864):
    with Image.open(source) as image:
        return standardize_sprite(clean(image, settings), size, content)


def intake(apply=False, remove_incoming=False, review=None):
    if remove_incoming and not apply:
        raise ValueError("Root cleanup requires verified installation.")
    settings = load_settings()
    old = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else None
    old_records = {row["asset"]: row for row in old["assets"]} if old else {}
    planned = []
    for filename, asset in ASSETS:
        incoming = ROOT / filename
        archived = source_path(asset)
        source = incoming if incoming.exists() else archived
        runtime = ROOT / "public" / "assets" / "characters" / f"{asset}.png"
        historical = archived.parent / "previous-runtime" / f"{asset}.png"
        image = prepare(source, settings[asset])
        buffer = BytesIO()
        image.save(buffer, format="PNG", optimize=True)
        output = buffer.getvalue()
        previous_hash = old_records[asset]["previous_runtime_sha256"] if old else digest(runtime)
        for path, expected in ((archived, digest(source)), (historical, previous_hash),
                               (runtime, old_records[asset]["runtime_sha256"] if old else previous_hash)):
            if path.exists() and digest(path) != expected:
                raise FileExistsError(f"Conflicting starter artwork: {path}")
        if old and not historical.exists():
            raise FileNotFoundError(historical)
        record = {"incoming": filename, "asset": asset, "source": str(archived.relative_to(ROOT)),
                  "source_sha256": digest(source), "runtime": str(runtime.relative_to(ROOT)),
                  "runtime_sha256": sha256(output).hexdigest(),
                  "previous_runtime": str(historical.relative_to(ROOT)),
                  "previous_runtime_sha256": previous_hash, "processing": settings[asset]}
        planned.append((incoming, source, archived, runtime, historical, image, output, record))
    records = {"asset_count": 18, "assets": [row[-1] for row in planned]}
    if old and old != records:
        raise FileExistsError("Starter provenance changed; review before replacement.")
    if review:
        review.mkdir(parents=True, exist_ok=True)
        for row in planned:
            row[5].save(review / f"{row[-1]['asset']}.png")
        for name in ("infernis", "tizu", "flora"):
            rows = [row for row in planned if row[-1]["asset"].split("-")[0] == name]
            for background, label in (("#24242b", "dark"), ("#eeeeee", "light")):
                sheet = Image.new("RGB", (1440, 1000), background)
                draw = ImageDraw.Draw(sheet)
                for i, row in enumerate(rows):
                    image = row[5].copy()
                    image.thumbnail((480, 450))
                    x, y = i % 3 * 480, i // 3 * 500
                    sheet.paste(image, (x, y), image)
                    draw.text((x + 8, y + 462), row[-1]["asset"], fill="#999999")
                sheet.save(review / f"{name}-{label}.png")
        return
    if apply:
        for _, source, archived, runtime, historical, _, output, record in planned:
            archived.parent.mkdir(parents=True, exist_ok=True)
            historical.parent.mkdir(parents=True, exist_ok=True)
            if not archived.exists():
                shutil.copyfile(source, archived)
            if not historical.exists():
                shutil.copyfile(runtime, historical)
            runtime.write_bytes(output)
            if digest(archived) != record["source_sha256"] or digest(runtime) != record["runtime_sha256"]:
                raise ValueError(f"Installed starter bytes differ: {record['asset']}")
        MANIFEST.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
        from character_art_revisions import write_revisions
        write_revisions()
        if remove_incoming:
            for incoming, _, archived, _, _, _, _, record in planned:
                if incoming.exists():
                    if digest(incoming) != digest(archived):
                        raise ValueError(f"Incoming original changed: {incoming}")
                    if digest(ROOT / record["runtime"]) != record["runtime_sha256"]:
                        raise ValueError(f"Runtime changed before cleanup: {record['asset']}")
                    incoming.unlink()
    print(f"18 starter portraits {'installed' if apply else 'validated (dry run)'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    parser.add_argument("--review", type=Path)
    args = parser.parse_args()
    intake(args.apply, args.remove_incoming, args.review)
