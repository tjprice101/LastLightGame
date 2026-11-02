"""Reviewed replacement intake for the owner-delivered cosmic Master chest (D-442).

The historical D-226 chest original/runtime stay reproducible through
intake_master_conduit_art.py; this tool archives the replacement original and
the previous runtime export, then owns the current runtime chest.
"""
import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image

from intake_status_art import clean
from prepare_art import ROOT, standardize_sprite

FILENAME = "Cosmic Grand Master Chest.png"
INCOMING = ROOT / FILENAME
ARCHIVE = ROOT / "Art" / "source" / "master-conduits" / "refresh" / FILENAME
PREVIOUS = ROOT / "Art" / "source" / "master-conduits" / "previous-runtime" / "grand-master-chest.png"
RUNTIME = ROOT / "public" / "assets" / "master-conduits" / "grand-master-chest.png"
SETTINGS = ROOT / "Art" / "provenance" / "master-chest-refresh-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "master-chest-refresh-intake.json"


def digest(data):
    return sha256(data).hexdigest()


def load_settings():
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    if settings.get("border_only") is not True or not settings.get("keys") or not settings.get("review"):
        raise ValueError("Missing reviewed border-connected chest key settings.")
    return settings


def prepare(source, settings):
    with Image.open(source) as image:
        image.load()
        output = standardize_sprite(clean(image, settings), 256, 224)
        buffer = BytesIO()
        output.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue(), {
            "source_mode": image.mode, "source_dimensions": list(image.size),
            "processing": "reviewed border-connected RGB key (background and green-tinted cast shadow)",
            "runtime_dimensions": list(output.size),
            "runtime_content_bbox": list(output.getbbox()),
        }


def intake(apply=False, review=None):
    settings = load_settings()
    source = INCOMING if INCOMING.exists() else ARCHIVE
    if not source.is_file():
        raise FileNotFoundError(source)
    source_bytes = source.read_bytes()
    if ARCHIVE.exists() and ARCHIVE.read_bytes() != source_bytes:
        raise FileExistsError(f"Conflicting archived replacement: {ARCHIVE}")
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else None
    if previous and previous["source_sha256"] != digest(source_bytes):
        raise ValueError("Replacement source bytes changed; review a new delivery explicitly.")
    output, metadata = prepare(source, settings)
    if review:
        review = Path(review)
        review.mkdir(parents=True, exist_ok=True)
        cutout = Image.open(BytesIO(output)).convert("RGBA")
        for name, color in (("dark", (18, 18, 24)), ("light", (238, 238, 238)), ("magenta", (255, 0, 255))):
            canvas = Image.new("RGBA", cutout.size, color + (255,))
            canvas.alpha_composite(cutout)
            canvas.resize((768, 768), Image.NEAREST).save(review / f"chest-{name}.png")
    if not apply:
        print(json.dumps(metadata, indent=2))
        return
    if not previous:
        if not RUNTIME.exists():
            raise FileNotFoundError(RUNTIME)
        PREVIOUS.parent.mkdir(parents=True, exist_ok=True)
        if not PREVIOUS.exists():
            shutil.copyfile(RUNTIME, PREVIOUS)
    ARCHIVE.parent.mkdir(parents=True, exist_ok=True)
    if not ARCHIVE.exists():
        ARCHIVE.write_bytes(source_bytes)
    RUNTIME.write_bytes(output)
    MANIFEST.write_text(json.dumps({
        "decision": "D-442", "asset": "grand-master-chest", "incoming": FILENAME,
        "source": ARCHIVE.relative_to(ROOT).as_posix(), "source_sha256": digest(source_bytes),
        "previous_runtime": PREVIOUS.relative_to(ROOT).as_posix(), "previous_runtime_sha256": digest(PREVIOUS.read_bytes()),
        "runtime": RUNTIME.relative_to(ROOT).as_posix(), "runtime_sha256": digest(output),
        **metadata, "settings": settings,
    }, indent=2) + "\n", encoding="utf-8")
    if INCOMING.exists():
        INCOMING.unlink()
    print(f"Installed {RUNTIME.relative_to(ROOT)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--review", help="Write dark/light/magenta previews to this folder.")
    args = parser.parse_args()
    intake(args.apply, args.review)
