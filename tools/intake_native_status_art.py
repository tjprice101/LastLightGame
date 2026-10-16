"""Archive and reproduce the 27 delivered native identity status icons."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw

from build_pending_art import STATUSES
from intake_status_art import clean, digest, prepare
from prepare_art import ROOT

SETTINGS = ROOT / "Art" / "provenance" / "native-status-art-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "native-status-art-intake.json"


def assets(root=ROOT):
    return [(f"status-native-{suffix}", f"{character} {title}.png",
             root / "Art" / "source" / "abilities" / "native-statuses" / f"{character} {title}.png",
             root / "public" / "assets" / "abilities" / "statuses" / f"status-native-{suffix}.png")
            for suffix, title, character, _ in STATUSES]


def load_settings(path=SETTINGS):
    settings = json.loads(path.read_text(encoding="utf-8"))
    if set(settings) != {row[0] for row in assets()}:
        raise ValueError("Settings must cover exactly the 27 native status icons.")
    for asset, entry in settings.items():
        if not (entry.get("border_only") and entry.get("radius", 0) > 0
                and "background_seeds" in entry and entry.get("review")):
            raise ValueError(f"Missing reviewed connected background settings: {asset}")
    return settings


def preflight(root=ROOT, settings_path=SETTINGS, manifest_path=MANIFEST):
    settings = load_settings(settings_path)
    old = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    records = {row["asset"]: row for row in old.get("assets", [])}
    if records and set(records) != {row[0] for row in assets(root)}:
        raise ValueError("Conflicting native status manifest coverage.")
    planned = []
    for asset, incoming, archive, runtime in assets(root):
        source = root / incoming if (root / incoming).is_file() else archive
        if not source.is_file():
            raise FileNotFoundError(source)
        source_hash = digest(source)
        if archive.exists() and digest(archive) != source_hash:
            raise FileExistsError(f"Conflicting native status archive: {archive}")
        previous = records.get(asset)
        if previous and previous["source_sha256"] != source_hash:
            raise FileExistsError(f"Changed native status source: {source}")
        if runtime.exists() and (not previous or digest(runtime) != previous["runtime_sha256"]):
            raise FileExistsError(f"Untracked or changed native status runtime: {runtime}")
        output, metadata = prepare(source, settings[asset])
        with Image.open(BytesIO(output)) as image:
            if not image.getbbox():
                raise ValueError(f"Empty native status export: {asset}")
        record = {
            "asset": asset, "incoming": incoming,
            "source": str(archive.relative_to(root)), "source_sha256": source_hash,
            "runtime": str(runtime.relative_to(root)), "runtime_sha256": sha256(output).hexdigest(),
            **metadata, "settings": settings[asset],
        }
        planned.append((source, archive, runtime, output, record))
    return planned


def review(directory):
    directory.mkdir(parents=True, exist_ok=True)
    planned = preflight()
    for name, color in (("dark", "#24242b"), ("light", "#f5f5f5")):
        for start in range(0, len(planned), 9):
            sheet = Image.new("RGB", (1200, 1260), color)
            draw = ImageDraw.Draw(sheet)
            for index, (source, _, _, output, record) in enumerate(planned[start:start + 9]):
                with Image.open(BytesIO(output)) as image:
                    image = image.resize((380, 380))
                    x, y = index % 3 * 400, index // 3 * 420
                    sheet.paste(image, (x + 10, y), image)
                    draw.text((x + 5, y + 390), record["asset"].removeprefix("status-native-"),
                              fill="white" if name == "dark" else "black")
                with Image.open(source) as original:
                    processed = clean(original, record["settings"])
                    composite = Image.new("RGB", original.size, color)
                    composite.paste(processed, (0, 0), processed)
                    composite.save(directory / f"{record['asset']}-{name}-source.png")
            sheet.save(directory / f"review-{name}-{start // 9 + 1}.png")


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
                raise RuntimeError(f"Native status archive verification failed: {archive}")
            runtime.parent.mkdir(parents=True, exist_ok=True)
            runtime.write_bytes(output)
            if digest(runtime) != record["runtime_sha256"]:
                raise RuntimeError(f"Native status export verification failed: {runtime}")
        manifest = {"asset_count": len(planned), "canvas": 256, "content_limit": 224,
                    "assets": [row[-1] for row in planned]}
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        if json.loads(manifest_path.read_text(encoding="utf-8")) != manifest:
            raise RuntimeError("Native status provenance verification failed.")
        if remove_incoming:
            for _, archive, runtime, _, record in planned:
                incoming = root / record["incoming"]
                if not incoming.exists():
                    continue
                if any(digest(path) != expected for path, expected in (
                    (incoming, record["source_sha256"]), (archive, record["source_sha256"]),
                    (runtime, record["runtime_sha256"]),
                )):
                    raise RuntimeError(f"Refusing root cleanup after changed native status bytes: {incoming}")
                incoming.unlink()
    print(f"{'Installed' if apply else 'Verified'} {len(planned)} native status icons.")
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
