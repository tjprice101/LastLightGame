"""Reviewed Elemental War cutouts; preserve originals before root cleanup."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw

from build_elemental_war_art import DESIGNS
from intake_character_refresh import clean, digest
from prepare_art import ROOT, standardize_sprite
from art_library import art_path

SETTINGS = art_path("elemental-war-settings.json", root=ROOT)
MANIFEST = art_path("elemental-war-intake.json", root=ROOT)
ASSETS = []
for design in DESIGNS:
    for index, title in enumerate(design["titles"]):
        asset = design["id"] + (f"-evo-{index + 1}" if index else "")
        ASSETS.append((f"{title}, {design['name']}.png", "characters", asset))
    for (heading, title, _, _), action in zip(design["icons"], ("passive", "skill1", "skill2", "ultimate", "light", "defend")):
        if design["id"] == "nerithe" and action in ("light", "defend"):
            continue
        ASSETS.append((f"{heading} - {title}.png", "abilities", f"{design['id']}-{action}"))
ASSETS.extend([
    ("Activity banner Nerithe.png", "banners", "elemental-war-nerithe-banner"),
    ("Activity banner Orvella.png", "banners", "elemental-war-orvella-banner"),
    ("Valor Activity Banner.png", "banners", "elemental-war-vaelor-banner"),
    ("Nerithe Battle arena.png", "backgrounds", "elemental-war-nerithe-arena"),
    ("Battle arena Orvella.png", "backgrounds", "elemental-war-orvella-arena"),
    ("Vaelor Battle Arena.png", "backgrounds", "elemental-war-vaelor-arena"),
])


def load_settings():
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    if set(settings) != {asset for _, _, asset in ASSETS}:
        raise ValueError("Settings must cover every delivered Elemental War asset.")
    return settings


def prepare(source, settings, category, canvas_size=None, content_size=None):
    with Image.open(source) as image:
        if category in ("banners", "backgrounds"):
            expected = (1904, 640) if category == "banners" else (1456, 816)
            if image.size != expected:
                raise ValueError(f"Unexpected scenery dimensions: {source}")
            return image.copy()
        cleaned = clean(image, settings)
        if image.convert("RGBA").getextrema()[3][0] == 255:
            draw = ImageDraw.Draw(cleaned)
            for polygon in settings.get("discarded_frame_regions", []):
                draw.polygon([(round(x * image.width), round(y * image.height)) for x, y in polygon],
                             fill=(0, 0, 0, 0))
        return standardize_sprite(cleaned, canvas_size or (960 if category == "characters" else 256),
                                  content_size or (864 if category == "characters" else 224))


def reviewed_source(asset):
    row = next((entry for entry in ASSETS if entry[2] == asset), None)
    if row is None or row[1] in ("banners", "backgrounds"):
        return None
    source = ROOT / "Art" / "source" / "elemental-war" / row[1] / f"{asset}.png"
    if source.is_file():
        return source, row[1]
    if MANIFEST.exists() and any(entry["asset"] == asset for entry in json.loads(MANIFEST.read_text(encoding="utf-8"))["assets"]):
        raise FileNotFoundError(f"Installed Elemental War source is missing: {source}")
    return None


def intake(review=None, apply=False, remove_incoming=False, reprocess_reviewed=False):
    if remove_incoming and not apply:
        raise ValueError("Root cleanup requires verified installation.")
    settings = load_settings()
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else None
    if reprocess_reviewed and not previous:
        raise ValueError("Reviewed reprocessing requires installed provenance.")
    prior_assets = {row["asset"]: row for row in previous["assets"]} if previous else {}
    planned = []
    backups = []
    for filename, category, asset in ASSETS:
        incoming = ROOT / filename
        archived = ROOT / "Art" / "source" / "elemental-war" / category / f"{asset}.png"
        source = incoming if incoming.exists() else archived
        prior = prior_assets.get(asset)
        if prior and digest(source) != prior["source_sha256"]:
            raise FileExistsError(f"Installed original changed: {source}")
        if archived.exists() and digest(archived) != digest(source):
            raise FileExistsError(f"Conflicting source: {archived}")
        image = prepare(source, settings[asset], category)
        buffer = BytesIO()
        image.save(buffer, format="PNG", optimize=True)
        output = source.read_bytes() if category in ("banners", "backgrounds") else buffer.getvalue()
        runtime = ROOT / "public" / "assets" / category / f"{asset}.png"
        record = {"incoming": filename, "asset": asset, "category": category,
                  "source": str(archived.relative_to(ROOT)), "source_sha256": digest(source),
                  "runtime": str(runtime.relative_to(ROOT)), "runtime_sha256": sha256(output).hexdigest(),
                  "processing": settings[asset]}
        if prior and "processing_history" in prior:
            record["processing_history"] = list(prior["processing_history"])
        if prior and (not runtime.exists() or digest(runtime) != prior["runtime_sha256"]):
            raise FileExistsError(f"Installed runtime changed: {runtime}")
        if runtime.exists() and digest(runtime) != record["runtime_sha256"]:
            if not reprocess_reviewed or not prior:
                raise FileExistsError(f"Conflicting runtime: {runtime}")
            backup = ROOT / "Art" / "source" / "elemental-war" / "corrections" / f"{asset}-{prior['runtime_sha256'][:12]}.png"
            if backup.exists() and digest(backup) != prior["runtime_sha256"]:
                raise FileExistsError(f"Conflicting previous export: {backup}")
            backups.append((runtime, backup))
            record.setdefault("processing_history", []).append({
                "processing": prior["processing"], "runtime_sha256": prior["runtime_sha256"],
                "previous_runtime": str(backup.relative_to(ROOT)),
            })
        planned.append((incoming, archived, source, runtime, image, output, record))
    document = {"asset_count": len(planned), "assets": [entry[-1] for entry in planned]}
    if previous and not reprocess_reviewed:
        next_assets = {row["asset"]: row for row in document["assets"]}
        if any(next_assets.get(asset) != row for asset, row in prior_assets.items()):
            raise FileExistsError("Elemental War provenance changed; review before replacement.")
    if review:
        review.mkdir(parents=True, exist_ok=True)
        for _, _, _, _, image, _, row in planned:
            image.save(review / f"{row['asset']}.png")
        for character in ("nerithe", "orvella", "vaelor"):
            for category in ("characters", "abilities"):
                rows = [entry for entry in planned if entry[-1]["asset"].startswith(character)
                        and entry[-1]["category"] == category]
                for color, label in (("#292934", "dark"), ("#eeeeee", "light")):
                    sheet = Image.new("RGB", (1500, 1000), color)
                    draw = ImageDraw.Draw(sheet)
                    for index, entry in enumerate(rows):
                        image = entry[4].copy()
                        image.thumbnail((480, 450))
                        x, y = index % 3 * 500, index // 3 * 500
                        sheet.paste(image, (x, y), image)
                        draw.text((x + 8, y + 465), entry[-1]["asset"], fill="#999999")
                    sheet.save(review / f"{character}-{category}-{label}.png")
        print(f"{len(planned)} asset candidates generated; nothing installed.")
        return
    if apply:
        for runtime, backup in backups:
            backup.parent.mkdir(parents=True, exist_ok=True)
            if not backup.exists():
                shutil.copyfile(runtime, backup)
        for _, archived, source, runtime, _, output, row in planned:
            archived.parent.mkdir(parents=True, exist_ok=True)
            runtime.parent.mkdir(parents=True, exist_ok=True)
            if not archived.exists():
                shutil.copyfile(source, archived)
            runtime.write_bytes(output)
            if digest(archived) != row["source_sha256"] or digest(runtime) != row["runtime_sha256"]:
                raise ValueError(f"Installed bytes differ: {row['asset']}")
        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")
        from character_art_revisions import write_revisions
        write_revisions()
        if remove_incoming:
            for incoming, archived, _, runtime, _, _, row in planned:
                if incoming.exists():
                    if digest(incoming) != digest(archived) or digest(runtime) != row["runtime_sha256"]:
                        raise ValueError(f"Changed before root cleanup: {incoming}")
                    incoming.unlink()
    print(f"{len(planned)} assets {'installed' if apply else 'validated (dry run)'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--review", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    parser.add_argument("--reprocess-reviewed", action="store_true")
    args = parser.parse_args()
    intake(args.review, args.apply, args.remove_incoming, args.reprocess_reviewed)
