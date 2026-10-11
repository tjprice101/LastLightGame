"""Archive and reproduce the 25 reviewed Omnic kit-Conduit cutouts."""
import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw

from build_kit_conduit_art import designs
from intake_status_art import clean
from prepare_art import ROOT, standardize_sprite

SETTINGS = ROOT / "Art" / "provenance" / "kit-conduit-art-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "kit-conduit-art-intake.json"


def assets(root=ROOT):
    return [(asset, f"{name} (Omnic  {theme.title()}).png",
             root / "Art" / "source" / "kit-conduits" / f"{name} (Omnic  {theme.title()}).png",
             root / "public" / "assets" / "conduits" / f"{asset}.png")
            for asset, name, _, theme, _ in designs()]


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def load_settings():
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    if set(settings) != {row[0] for row in assets()}:
        raise ValueError("Settings must cover exactly 25 kit-Conduits.")
    for asset, entry in settings.items():
        if not entry.get("border_only") or not entry.get("keys") or not entry.get("review"):
            raise ValueError(f"Missing reviewed connected background settings: {asset}")
    return settings


def prepare(source, settings):
    with Image.open(source) as image:
        image.load()
        alpha = image.convert("RGBA").getextrema()[3][0] < 255
        output = standardize_sprite(clean(image, settings), 256, 224)
        buffer = BytesIO()
        output.save(buffer, format="PNG", optimize=True)
        metadata = {
            "source_mode": image.mode, "source_dimensions": list(image.size),
            "source_alpha_authoritative": alpha,
            "processing": "supplied alpha; trim/resize/pad only" if alpha else
                          "reviewed border-connected RGB key and explicit enclosed gaps",
            "runtime_dimensions": list(output.size),
            "runtime_content_bbox": list(output.getbbox()),
            "runtime_pixel_sha256": sha256(output.tobytes()).hexdigest(),
        }
    return buffer.getvalue(), metadata


def preflight(root=ROOT):
    settings = load_settings()
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    old_records = {row["asset"]: row for row in previous.get("assets", [])}
    if old_records and set(old_records) != {row[0] for row in assets(root)}:
        raise ValueError("Existing kit-Conduit manifest has conflicting coverage.")
    planned = []
    for asset, filename, archived, runtime in assets(root):
        incoming = root / filename
        source = incoming if incoming.exists() else archived
        if not source.is_file():
            raise FileNotFoundError(source)
        source_hash = digest(source)
        if archived.exists() and digest(archived) != source_hash:
            raise FileExistsError(f"Conflicting archived original: {archived}")
        old = old_records.get(asset)
        if old and old["source_sha256"] != source_hash:
            raise ValueError(f"Source bytes changed: {asset}")
        if runtime.exists() and (not old or digest(runtime) != old["runtime_sha256"]):
            raise FileExistsError(f"Untracked or changed runtime: {runtime}")
        output, metadata = prepare(source, settings[asset])
        record = {
            "asset": asset, "incoming": filename,
            "source": str(archived.relative_to(root)), "source_sha256": source_hash,
            "runtime": str(runtime.relative_to(root)), "runtime_sha256": sha256(output).hexdigest(),
            **metadata, "settings": settings[asset],
        }
        planned.append((source, archived, runtime, output, record))
    return planned


def review(directory):
    directory.mkdir(parents=True, exist_ok=True)
    planned = preflight()
    for source, _, _, output, record in planned:
        (directory / f"{record['asset']}.png").write_bytes(output)
        with Image.open(source) as original:
            processed = clean(original, record["settings"])
            for label, color in (("dark", "#24242b"), ("light", "#f5f5f5")):
                sheet = Image.new("RGB", (1024, 1024), color)
                sheet.paste(processed, (0, 0), processed)
                sheet.save(directory / f"{record['asset']}-{label}-source.png")
    for start in range(0, 25, 5):
        for label, color in (("dark", "#24242b"), ("light", "#f5f5f5")):
            sheet = Image.new("RGB", (1500, 300), color)
            draw = ImageDraw.Draw(sheet)
            for index, (_, _, _, output, record) in enumerate(planned[start:start + 5]):
                with Image.open(BytesIO(output)) as image:
                    sheet.paste(image, (index * 300 + 22, 0), image)
                draw.text((index * 300 + 5, 265), record["asset"],
                          fill="white" if label == "dark" else "black")
            sheet.save(directory / f"review-{start // 5 + 1}-{label}.png")


def intake(apply=False, remove_incoming=False, reviewed=False):
    if remove_incoming and not (apply and reviewed):
        raise ValueError("Root removal requires --apply --reviewed after visual verification.")
    planned = preflight()
    if apply:
        for source, archived, runtime, output, record in planned:
            archived.parent.mkdir(parents=True, exist_ok=True)
            runtime.parent.mkdir(parents=True, exist_ok=True)
            if not archived.exists():
                shutil.copyfile(source, archived)
            if digest(archived) != record["source_sha256"]:
                raise RuntimeError(f"Archive verification failed: {archived}")
            runtime.write_bytes(output)
            if digest(runtime) != record["runtime_sha256"]:
                raise RuntimeError(f"Runtime verification failed: {runtime}")
        MANIFEST.write_text(json.dumps({
            "asset_count": 25, "canvas": 256, "content_limit": 224,
            "assets": [row[-1] for row in planned],
        }, indent=2) + "\n", encoding="utf-8")
        if remove_incoming:
            for _, archived, runtime, _, record in planned:
                incoming = ROOT / record["incoming"]
                if incoming.exists():
                    if digest(incoming) != digest(archived) or digest(runtime) != record["runtime_sha256"]:
                        raise RuntimeError(f"Root cleanup verification failed: {incoming}")
                    incoming.unlink()
    return planned


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--reviewed", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    parser.add_argument("--review-dir", type=Path)
    args = parser.parse_args()
    if args.review_dir:
        review(args.review_dir)
    else:
        print(f"{len(intake(args.apply, args.remove_incoming, args.reviewed))} kit-Conduits verified"
              + (" and installed." if args.apply else "; dry run."))
