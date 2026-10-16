"""Archive and reproduce the six reviewed Calamitic cutouts."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw

from intake_status_art import clean, digest, prepare
from prepare_art import ROOT

SETTINGS = ROOT / "Art" / "provenance" / "calamitic-art-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "calamitic-art-intake.json"
MAPPINGS = (
    ("Calamitic Token.png", "calamitic-tokens", "currencies"),
    ("Cathedral of the Final Equation.png", "calamitic-cathedral-final-equation", "conduits"),
    ("Causality Funeral Engine.png", "calamitic-causality-funeral-engine", "conduits"),
    ("Horizon-Cleaving Godpress.png", "calamitic-horizon-cleaving-godpress", "conduits"),
    ("Throne of Borrowed Tomorrows.png", "calamitic-throne-borrowed-tomorrows", "conduits"),
    ("World-Eater's Orrery.png", "calamitic-world-eater-orrery", "conduits"),
)


def preflight(root=ROOT, settings_path=SETTINGS, manifest_path=MANIFEST):
    settings = json.loads(settings_path.read_text(encoding="utf-8"))
    if set(settings) != {asset for _, asset, _ in MAPPINGS}:
        raise ValueError("Settings must cover exactly six Calamitic images.")
    old = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    records = {row["asset"]: row for row in old.get("assets", [])}
    if records and set(records) != set(settings):
        raise ValueError("Conflicting Calamitic provenance coverage.")
    planned = []
    for incoming, asset, category in MAPPINGS:
        entry = settings[asset]
        if not (entry.get("border_only") and entry.get("row_gradient") and
                entry.get("radius", 0) > 0 and "background_seeds" in entry and entry.get("review")):
            raise ValueError(f"Missing reviewed connected cleanup settings: {asset}")
        archive = root / "Art" / "source" / "calamitic" / incoming
        runtime = root / "public" / "assets" / category / f"{asset}.png"
        source = root / incoming if (root / incoming).is_file() else archive
        if not source.is_file():
            raise FileNotFoundError(source)
        source_hash = digest(source)
        if archive.exists() and digest(archive) != source_hash:
            raise FileExistsError(f"Conflicting Calamitic archive: {archive}")
        previous = records.get(asset)
        if previous and previous["source_sha256"] != source_hash:
            raise FileExistsError(f"Changed Calamitic source: {source}")
        if runtime.exists() and (not previous or digest(runtime) != previous["runtime_sha256"]):
            raise FileExistsError(f"Changed or untracked Calamitic export: {runtime}")
        output, metadata = prepare(source, entry)
        with Image.open(BytesIO(output)) as image:
            if not image.getbbox():
                raise ValueError(f"Empty Calamitic export: {asset}")
        record = {
            "asset": asset, "incoming": incoming, "category": category,
            "source": archive.relative_to(root).as_posix(), "source_sha256": source_hash,
            "runtime": runtime.relative_to(root).as_posix(), "runtime_sha256": sha256(output).hexdigest(),
            **metadata, "settings": entry,
        }
        planned.append((source, archive, runtime, output, record))
    return planned


def review(directory):
    directory.mkdir(parents=True, exist_ok=True)
    planned = preflight()
    for background, color in (("dark", "#24242b"), ("light", "#f5f5f5")):
        sheet = Image.new("RGB", (1200, 840), color)
        draw = ImageDraw.Draw(sheet)
        for index, (source, _, _, output, record) in enumerate(planned):
            with Image.open(BytesIO(output)) as image:
                image = image.resize((380, 380))
                x, y = index % 3 * 400, index // 3 * 420
                sheet.paste(image, (x + 10, y), image)
                draw.text((x + 5, y + 385), record["asset"].removeprefix("calamitic-"),
                          fill="white" if background == "dark" else "black")
            with Image.open(source) as original:
                processed = clean(original, record["settings"])
                composite = Image.new("RGB", original.size, color)
                composite.paste(processed, (0, 0), processed)
                composite.save(directory / f"{record['asset']}-{background}-source.png")
        sheet.save(directory / f"review-{background}.png")


def intake(apply=False, remove_incoming=False, reviewed=False, root=ROOT,
           settings_path=SETTINGS, manifest_path=MANIFEST):
    if remove_incoming and not (apply and reviewed):
        raise ValueError("Root cleanup requires --apply --reviewed after visual review.")
    planned = preflight(root, settings_path, manifest_path)
    if apply:
        for source, archive, runtime, output, record in planned:
            archive.parent.mkdir(parents=True, exist_ok=True)
            if not archive.exists():
                shutil.copyfile(source, archive)
            if digest(archive) != record["source_sha256"]:
                raise RuntimeError(f"Archive verification failed: {archive}")
            runtime.parent.mkdir(parents=True, exist_ok=True)
            runtime.write_bytes(output)
            if digest(runtime) != record["runtime_sha256"]:
                raise RuntimeError(f"Export verification failed: {runtime}")
        manifest = {"asset_count": len(planned), "canvas": 256, "content_limit": 224,
                    "assets": [row[-1] for row in planned]}
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        if json.loads(manifest_path.read_text(encoding="utf-8")) != manifest:
            raise RuntimeError("Calamitic provenance verification failed.")
        if remove_incoming:
            for _, archive, runtime, _, record in planned:
                incoming = root / record["incoming"]
                if not incoming.exists():
                    continue
                if any(digest(path) != expected for path, expected in (
                    (incoming, record["source_sha256"]), (archive, record["source_sha256"]),
                    (runtime, record["runtime_sha256"]),
                )):
                    raise RuntimeError(f"Refusing cleanup after changed bytes: {incoming}")
                incoming.unlink()
    print(f"{'Installed' if apply else 'Verified'} {len(planned)} Calamitic images.")
    return planned


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    parser.add_argument("--reviewed", action="store_true")
    parser.add_argument("--review", type=Path)
    args = parser.parse_args()
    if args.review:
        review(args.review)
    else:
        intake(args.apply, args.remove_incoming, args.reviewed)
