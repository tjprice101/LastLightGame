"""Reproduce nine reviewed battle-status cutouts from byte-preserved originals."""

import argparse
from dataclasses import dataclass
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw

from intake_character_refresh import clean as clean_source
from prepare_art import ROOT, standardize_sprite


SETTINGS = ROOT / "Art" / "provenance" / "status-art-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "status-art-intake.json"
MAPPINGS = (
    ("Atmospheric Charge", "tempest"),
    ("Botanic Renewal", "bloom"),
    ("Chaotic Suppression", "suppression"),
    ("Infernic Embers", "burn"),
    ("Oceanic Protection", "ward"),
    ("Rose Duality", "rose-duality"),
    ("Rose Grace", "rose-grace"),
    ("Thorn Aegis", "thorn-aegis"),
    ("Tranquilitic Focus", "focus"),
)


@dataclass(frozen=True)
class Asset:
    incoming: str
    asset: str
    source: Path
    runtime: Path


def assets(root=ROOT):
    return [Asset(f"{name}.png", f"status-{suffix}",
                  root / "Art" / "source" / "abilities" / "statuses" / f"{name}.png",
                  root / "public" / "assets" / "abilities" / "statuses" / f"status-{suffix}.png")
            for name, suffix in MAPPINGS]


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def pixel_digest(image):
    rgba = image.convert("RGBA")
    return sha256(f"{rgba.width}x{rgba.height}:RGBA:".encode() + rgba.tobytes()).hexdigest()


def clean(image, settings):
    border = settings.get("empty_border")
    if not border:
        return clean_source(image, settings)
    x = border["pixels"] / image.width
    y = border["pixels"] / image.height
    regions = [
        [[0, 0], [1, 0], [1, y], [0, y]],
        [[0, 1 - y], [1, 1 - y], [1, 1], [0, 1]],
        [[0, 0], [x, 0], [x, 1], [0, 1]],
        [[1 - x, 0], [1, 0], [1, 1], [1 - x, 1]],
    ]
    expanded = dict(settings, background_regions=settings.get("background_regions", []) + [
        {"polygon": polygon, "radius": border["radius"]} for polygon in regions])
    return clean_source(image, expanded)


def load_settings(path=SETTINGS):
    settings = json.loads(path.read_text(encoding="utf-8"))
    if set(settings) != {row.asset for row in assets()}:
        raise ValueError("Settings must cover exactly nine status icons.")
    for asset, entry in settings.items():
        if entry.get("border_only") is not True or not entry.get("keys") or entry.get("radius", 0) <= 0:
            raise ValueError(f"Missing reviewed source-specific connected key: {asset}")
        if "background_seeds" not in entry or not entry.get("review"):
            raise ValueError(f"Missing gap/visual review: {asset}")
    return settings


def prepare(source, settings):
    with Image.open(source) as image:
        image.load()
        supplied_alpha = image.convert("RGBA").getextrema()[3][0] < 255
        processed = clean(image, settings)
        output = standardize_sprite(processed, 256, 224)
        buffer = BytesIO()
        output.save(buffer, format="PNG", optimize=True)
        metadata = {
            "source_mode": image.mode,
            "source_dimensions": list(image.size),
            "source_pixel_sha256": pixel_digest(image),
            "source_alpha_authoritative": supplied_alpha,
            "processing": "supplied alpha; trim/resize/pad only" if supplied_alpha
                          else "reviewed border-connected RGB key and explicit enclosed gaps",
            "runtime_dimensions": list(output.size),
            "runtime_pixel_sha256": pixel_digest(output),
            "runtime_content_bbox": list(output.getbbox()),
        }
    return buffer.getvalue(), metadata


def preflight(root=ROOT, settings_path=SETTINGS, manifest_path=MANIFEST):
    settings = load_settings(settings_path)
    previous = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    old_records = {row["asset"]: row for row in previous.get("assets", [])}
    rows = assets(root)
    if old_records and set(old_records) != {row.asset for row in rows}:
        raise ValueError("Existing status manifest has conflicting coverage.")
    planned = []
    for row in rows:
        incoming = root / row.incoming
        source = incoming if incoming.is_file() else row.source
        if not source.is_file():
            raise FileNotFoundError(f"Missing status original: {row.incoming}")
        source_hash = digest(source)
        if row.source.exists() and digest(row.source) != source_hash:
            raise FileExistsError(f"Conflicting status archive: {row.source}")
        old = old_records.get(row.asset)
        if old and old["source_sha256"] != source_hash:
            raise FileExistsError(f"Status source changed: {source}")
        if row.runtime.exists() and (not old or digest(row.runtime) != old["runtime_sha256"]):
            raise FileExistsError(f"Untracked or changed status runtime: {row.runtime}")
        output, metadata = prepare(source, settings[row.asset])
        record = {
            "incoming": row.incoming, "asset": row.asset,
            "source": str(row.source.relative_to(root)), "source_sha256": source_hash,
            "runtime": str(row.runtime.relative_to(root)), "runtime_sha256": sha256(output).hexdigest(),
            **metadata, "settings": settings[row.asset],
        }
        planned.append((row, source, output, record))
    return planned


def review(directory, root=ROOT, settings_path=SETTINGS, manifest_path=MANIFEST):
    planned = preflight(root, settings_path, manifest_path)
    directory.mkdir(parents=True, exist_ok=True)
    for row, source, output, _ in planned:
        (directory / f"{row.asset}.png").write_bytes(output)
        with Image.open(source) as original:
            processed = clean(original, load_settings(settings_path)[row.asset])
            for background, color in (("dark", "#24242b"), ("light", "#f5f5f5")):
                sheet = Image.new("RGB", (1280, 700), color)
                draw = ImageDraw.Draw(sheet)
                for x, image in ((0, original.copy()), (640, processed.copy())):
                    image.thumbnail((640, 640))
                    if image.mode == "RGBA":
                        sheet.paste(image, (x, 0), image)
                    else:
                        sheet.paste(image, (x, 0))
                draw.text((5, 660), row.incoming + " / source-resolution cleanup",
                          fill="white" if background == "dark" else "black")
                sheet.save(directory / f"{row.asset}-{background}-source.png")
    for background, color in (("dark", "#24242b"), ("light", "#f5f5f5")):
        sheet = Image.new("RGB", (900, 900), color)
        draw = ImageDraw.Draw(sheet)
        for index, (row, _, output, _) in enumerate(planned):
            with Image.open(BytesIO(output)) as image:
                x, y = index % 3 * 300, index // 3 * 300
                sheet.paste(image, (x + 22, y), image)
                draw.text((x + 5, y + 265), row.asset,
                          fill="white" if background == "dark" else "black")
        sheet.save(directory / f"review-{background}.png")


def intake(apply=False, remove_incoming=False, reviewed=False, root=ROOT,
           settings_path=SETTINGS, manifest_path=MANIFEST):
    if remove_incoming and not (apply and reviewed):
        raise ValueError("Root cleanup requires --apply --reviewed after visual review.")
    planned = preflight(root, settings_path, manifest_path)
    manifest = {"asset_count": len(planned), "canvas": 256, "content_limit": 224,
                "assets": [record for _, _, _, record in planned]}
    if apply:
        for row, source, output, record in planned:
            row.source.parent.mkdir(parents=True, exist_ok=True)
            if not row.source.exists():
                shutil.copyfile(source, row.source)
            if digest(row.source) != record["source_sha256"]:
                raise RuntimeError(f"Archived bytes failed verification: {row.source}")
            row.runtime.parent.mkdir(parents=True, exist_ok=True)
            row.runtime.write_bytes(output)
            if digest(row.runtime) != record["runtime_sha256"]:
                raise RuntimeError(f"Runtime bytes failed verification: {row.runtime}")
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        if json.loads(manifest_path.read_text(encoding="utf-8")) != manifest:
            raise RuntimeError("Status provenance failed verification.")
        if remove_incoming:
            for row, _, _, record in planned:
                incoming = root / row.incoming
                if incoming.is_file():
                    if digest(incoming) != record["source_sha256"] or \
                            digest(row.source) != record["source_sha256"] or \
                            digest(row.runtime) != record["runtime_sha256"]:
                        raise RuntimeError(f"Refusing changed original cleanup: {incoming}")
                    incoming.unlink()
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    parser.add_argument("--reviewed", action="store_true")
    parser.add_argument("--review-dir", type=Path)
    arguments = parser.parse_args()
    if arguments.review_dir:
        review(arguments.review_dir)
    else:
        result = intake(arguments.apply, arguments.remove_incoming, arguments.reviewed)
        print(f"Verified {result['asset_count']} status icons" +
              ("; archived and installed." if arguments.apply else "; dry run, no writes."))
