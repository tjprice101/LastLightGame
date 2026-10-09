"""Reviewed offline intake of the 28 supplied machine-mode assets."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from prepare_art import ROOT, standardize_sprite
from intake_roster_art import remove_exterior_outline
from art_library import art_path


ASSETS = [
    ("Duplex Heart.png", "conduits", "duplex-heart", (38, 244, 187)),
    ("Spearwheel Engine.png", "conduits", "spearwheel-engine", (83, 236, 183)),
    ("Falcon Sight.png", "conduits", "falcon-sight", (160, 216, 185)),
    ("Aegis Capacitor.png", "conduits", "aegis-capacitor", (24, 242, 202)),
    ("Springwell Pump.png", "conduits", "springwell-pump", (104, 249, 191)),
    ("Worldbreaker Drive.png", "conduits", "worldbreaker-drive", (153, 202, 179)),
    ("Immortal Vessel.png", "conduits", "immortal-vessel", (91, 187, 174)),
    ("Citadel Spine.png", "conduits", "citadel-spine", (129, 164, 139)),
    ("Astral Prism.png", "conduits", "astral-prism", (158, 201, 180)),
    ("Judgment Lens.png", "conduits", "judgment-lens", (46, 252, 225)),
    ("Infernic - Phoenix Reactor.png", "conduits", "infernic-phoenix-reactor", (63, 189, 157)),
    ("Aquatic - Leviathan Pump.png", "conduits", "aquatic-leviathan-pump", (110, 226, 191)),
    ("Tectonic - Atlas Bastion.png", "conduits", "tectonic-atlas-bastion", (69, 236, 197)),
    ("Efflorescent - Worldtree Heart.png", "conduits", "efflorescent-worldtree-heart", (162, 220, 167)),
    ("Voltaic - Thunderbird Coil.png", "conduits", "voltaic-thunderbird-coil", (78, 234, 193)),
    ("Atmospheric - Griffin Turbine.png", "conduits", "atmospheric-griffin-turbine", (69, 231, 217)),
    ("Luminous - Seraph Mirror.png", "conduits", "luminous-seraph-mirror", (174, 229, 188)),
    ("Ominous - Eclipse Mantle.png", "conduits", "ominous-eclipse-mantle", (77, 133, 102)),
    ("Tranquilitic - Kirin Cradle.png", "conduits", "tranquilitic-kirin-cradle", (110, 203, 177)),
    ("Chaotic - Ouroboros Core.png", "conduits", "chaotic-ouroboros-core", (100, 171, 136)),
    ("Fractured Watcher.png", "enemies", "fractured-watcher", (172, 211, 70)),
    ("Ashwing Harrier.png", "enemies", "ashwing-harrier", (33, 179, 165)),
    ("Ivory Kirin.png", "enemies", "ivory-kirin", (105, 177, 152)),
    ("Celestial Leviathan.png", "enemies", "celestial-leviathan", (91, 120, 99)),
    ("Crowned Phoenix.png", "enemies", "crowned-phoenix", (104, 137, 118)),
    ("Ouroboros of the First Dawn.png", "enemies", "ouroboros-first-dawn", (61, 152, 145)),
    ("Machine Mode header.png", "banners", "machines-banner", None),
    ("Machine Mode Battle Arena.png", "backgrounds", "machines-arena", None),
]
SOURCE_FACING = {
    "fractured-watcher": "left",
    "ashwing-harrier": "right",
    "ivory-kirin": "left",
    "celestial-leviathan": "right",
    "crowned-phoenix": "front",
    "ouroboros-first-dawn": "left",
}
KEY_RADII = {"efflorescent-worldtree-heart": 60}
FOREGROUND_REGIONS = {
    "fractured-watcher": [(0.34, 0.24, 0.50, 0.39)],
    "springwell-pump": [(0.25, 0.40, 0.67, 0.77)],
    "judgment-lens": [(0.37, 0.40, 0.64, 0.63)],
    "tranquilitic-kirin-cradle": [(0.39, 0.46, 0.63, 0.70)],
    "efflorescent-worldtree-heart": [(0.28, 0.32, 0.72, 0.65)],
}


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def source_path(filename, category):
    incoming = ROOT / filename
    archived = ROOT / "Art" / "source" / "machines" / category / filename
    return incoming if incoming.is_file() else archived


def prepare(source, category, asset, key):
    if category in ("banners", "backgrounds"):
        return source.read_bytes(), {"method": "scenery copied byte-for-byte"}
    with Image.open(source) as image:
        size, content = (256, 224) if category == "conduits" else (960, 864)
        if image.mode == "RGBA" and image.getextrema()[3][0] < 255:
            cleaned = image.copy()
            processing = {"method": "supplied-alpha; trim/resize/pad only"}
        else:
            rgb = np.asarray(image.convert("RGB"), dtype=np.int32)
            radius = KEY_RADII.get(asset, 30)
            eligible = np.sum((rgb - key) ** 2, axis=2) <= radius ** 2
            height, width = eligible.shape
            if asset == "efflorescent-worldtree-heart":
                eligible &= rgb[:, :, 2] >= 145
            protected = np.zeros(eligible.shape, dtype=bool)
            for left, top, right, bottom in FOREGROUND_REGIONS.get(asset, ()):
                mask = Image.new("L", image.size)
                ImageDraw.Draw(mask).ellipse(
                    (round(left * width), round(top * height), round(right * width), round(bottom * height)),
                    fill=255)
                protected |= np.asarray(mask) > 0
            eligible &= ~protected
            matte = eligible
            if not matte.any():
                raise ValueError(f"Reviewed background did not match: {source}")
            rgba = np.dstack((rgb.astype(np.uint8), np.where(matte, 0, 255).astype(np.uint8)))
            rgba[matte] = 0
            adjacent = np.asarray(Image.fromarray(matte.astype(np.uint8) * 255)
                                  .filter(ImageFilter.MaxFilter(5))) > 0
            distance = np.sqrt(np.sum((rgb - key) ** 2, axis=2))
            edge = adjacent & ~matte & ~protected & (distance < radius + 50)
            alpha = np.clip((distance[edge] - radius) / 50, .01, 1)
            rgba[edge, :3] = np.clip(
                (rgb[edge] - (1 - alpha[:, None]) * key) / alpha[:, None], 0, 255).astype(np.uint8)
            rgba[edge, 3] = np.round(alpha * 255).astype(np.uint8)
            remove_exterior_outline(rgba, np.asarray(image.convert("RGB").convert("HSV")))
            if asset == "voltaic-thunderbird-coil":
                rgba[-2:] = 0
            cleaned = Image.fromarray(rgba)
            processing = {"method": "reviewed RGB key including enclosed openings; protected foreground; exterior frame only",
                          "key_rgb": key, "radius": radius,
                          "foreground_ellipses": FOREGROUND_REGIONS.get(asset, ()),
                          "edge_cleanup": {"adjacent_source_pixels": 2, "distance_ramp": 50}}
            if asset == "efflorescent-worldtree-heart":
                processing["minimum_background_blue"] = 145
            if asset == "voltaic-thunderbird-coil":
                processing["reviewed_bottom_frame_rows"] = 2
        output = standardize_sprite(cleaned, size, content)
        buffer = BytesIO()
        output.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue(), processing


def review(directory):
    directory.mkdir(parents=True, exist_ok=True)
    for filename, category, asset, key in ASSETS:
        output, _ = prepare(source_path(filename, category), category, asset, key)
        (directory / f"{asset}.png").write_bytes(output)
    cutouts = [row for row in ASSETS if row[3] is not None]
    for start in range(0, len(cutouts), 13):
        sheet = Image.new("RGB", (1560, 720), "#202027")
        draw = ImageDraw.Draw(sheet)
        for index, (_, _, asset, _) in enumerate(cutouts[start:start + 13]):
            with Image.open(directory / f"{asset}.png") as image:
                image.thumbnail((210, 260))
                x, y = (index % 7) * 222, (index // 7) * 360
                sheet.paste(image, (x + (220 - image.width) // 2, y), image)
                draw.text((x + 4, y + 270), asset[:29], fill="white")
        sheet.save(directory / f"review-{start // 13 + 1}.png")


def intake(apply=False, remove_incoming=False):
    if remove_incoming and not apply:
        raise ValueError("Root cleanup requires --apply.")
    planned = []
    for filename, category, asset, key in ASSETS:
        incoming = ROOT / filename
        archived = ROOT / "Art" / "source" / "machines" / category / filename
        source = source_path(filename, category)
        if archived.exists() and digest(archived) != digest(source):
            raise FileExistsError(f"Conflicting archived source: {archived}")
        output, processing = prepare(source, category, asset, key)
        runtime = ROOT / "public" / "assets" / category / f"{asset}.png"
        if runtime.exists() and runtime.read_bytes() != output:
            raise FileExistsError(f"Conflicting runtime artwork: {runtime}")
        record = {"incoming": filename, "asset": asset, "category": category,
                  "source": str(archived.relative_to(ROOT)), "source_sha256": digest(source),
                  "runtime": str(runtime.relative_to(ROOT)), "runtime_sha256": sha256(output).hexdigest(),
                  "processing": processing}
        if asset in SOURCE_FACING:
            record["source_facing"] = SOURCE_FACING[asset]
        planned.append((incoming, archived, runtime, output, record))
    manifest = art_path("machines-art-intake.json", root=ROOT)
    document = {"asset_count": len(planned), "assets": [row[-1] for row in planned]}
    if manifest.exists() and json.loads(manifest.read_text(encoding="utf-8")) != json.loads(json.dumps(document)):
        raise FileExistsError(f"Conflicting provenance: {manifest}")
    if apply:
        for incoming, archived, runtime, output, record in planned:
            archived.parent.mkdir(parents=True, exist_ok=True)
            if not archived.exists():
                shutil.copyfile(incoming, archived)
            runtime.parent.mkdir(parents=True, exist_ok=True)
            if not runtime.exists():
                runtime.write_bytes(output)
            if digest(archived) != record["source_sha256"] or digest(runtime) != record["runtime_sha256"]:
                raise ValueError(f"Installed bytes differ: {runtime}")
        manifest.parent.mkdir(parents=True, exist_ok=True)
        manifest.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")
        if remove_incoming:
            for incoming, archived, runtime, _, record in planned:
                if incoming.exists():
                    if digest(incoming) != record["source_sha256"] or digest(archived) != record["source_sha256"]:
                        raise ValueError(f"Root source changed; refusing cleanup: {incoming}")
                    if digest(runtime) != record["runtime_sha256"]:
                        raise ValueError(f"Runtime changed; refusing cleanup: {runtime}")
                    incoming.unlink()
    print(f"{'Installed' if apply else 'Verified plan for'} {len(planned)} machine assets.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    parser.add_argument("--review", type=Path)
    args = parser.parse_args()
    if args.review:
        if args.apply or args.remove_incoming:
            parser.error("Review does not install or remove files.")
        review(args.review)
    else:
        intake(args.apply, args.remove_incoming)
