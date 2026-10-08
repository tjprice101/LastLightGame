"""Preserve and export the reviewed component currency delivery."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image

from prepare_art import ROOT, standardize_sprite
from intake_character_refresh import clean

INCOMING = ROOT / "Broken Mechanical Components.png"
SOURCE = ROOT / "Art" / "source" / "currencies" / INCOMING.name
RUNTIME = ROOT / "public" / "assets" / "currencies" / "mechanical-components.png"
MANIFEST = ROOT / "Art" / "component-art-intake.json"
SETTINGS = {"keys": [[6, 246, 220]], "radius": 65,
            "edge_cleanup": {"source_pixels": 2, "distance_ramp": 60}}


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def prepare(source):
    with Image.open(source) as image:
        output = standardize_sprite(clean(image, SETTINGS), 256, 224)
    buffer = BytesIO()
    output.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def intake(apply=False, remove_incoming=False, review=None):
    if remove_incoming and not apply:
        raise ValueError("Root cleanup requires verified installation.")
    source = INCOMING if INCOMING.exists() else SOURCE
    output = prepare(source)
    if review:
        review.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(BytesIO(output)) as image:
            sheet = Image.new("RGB", (512, 256), "#242429")
            sheet.paste(image, (0, 0), image)
            pale = Image.new("RGB", (256, 256), "#eee")
            pale.paste(image, (0, 0), image)
            sheet.paste(pale, (256, 0))
            sheet.save(review)
        return
    record = {"asset": "mechanical-components", "source": str(SOURCE.relative_to(ROOT)),
              "source_sha256": digest(source), "runtime": str(RUNTIME.relative_to(ROOT)),
              "runtime_sha256": sha256(output).hexdigest(), "processing": SETTINGS,
              "supplied_alpha_policy": "trim/resize/pad only"}
    for path, hash_key in ((SOURCE, "source_sha256"), (RUNTIME, "runtime_sha256")):
        if path.exists() and digest(path) != record[hash_key]:
            raise FileExistsError(f"Conflicting artwork: {path}")
    if MANIFEST.exists() and json.loads(MANIFEST.read_text(encoding="utf-8")) != record:
        raise FileExistsError("Component provenance changed.")
    if apply:
        SOURCE.parent.mkdir(parents=True, exist_ok=True)
        if not SOURCE.exists():
            shutil.copyfile(source, SOURCE)
        RUNTIME.parent.mkdir(parents=True, exist_ok=True)
        RUNTIME.write_bytes(output)
        if digest(SOURCE) != record["source_sha256"] or digest(RUNTIME) != record["runtime_sha256"]:
            raise ValueError("Installed component bytes differ.")
        MANIFEST.write_text(json.dumps(record, indent=2) + "\n", encoding="utf-8")
        if remove_incoming and INCOMING.exists():
            if digest(INCOMING) != digest(SOURCE):
                raise ValueError("Incoming original changed.")
            INCOMING.unlink()
    print(f"Component artwork {'installed' if apply else 'validated (dry run)'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    parser.add_argument("--review", type=Path)
    args = parser.parse_args()
    intake(args.apply, args.remove_incoming, args.review)
