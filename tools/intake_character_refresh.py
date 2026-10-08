"""Reviewed, reproducible replacement portraits; preserve both generations."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from prepare_art import ROOT, connected_matte, standardize_sprite
from color_matte import reviewed_background_starts
from intake_roster_art import PHASES, remove_exterior_outline


MANIFEST = ROOT / "Art" / "character-refresh-intake.json"
SETTINGS = ROOT / "Art" / "character-refresh-settings.json"
BRUNO_INCOMING = "sacredtrevor_Full_body_gacha_JRPG_chibi_unit_illustration_on__d7561af2-093b-40e1-ad72-4b48314d7186_1.png"
ASSETS = [(BRUNO_INCOMING if asset == "bruno" else filename, asset)
          for rows in PHASES.values() for filename, category, asset in rows if category == "characters"]


def load_settings():
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    for row in settings.values():
        row.setdefault("edge_cleanup", {"source_pixels": 2, "distance_ramp": 60})
    return settings


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def source_path(filename, asset):
    incoming = ROOT / filename
    archived = ROOT / "Art" / "source" / "character-refresh" / f"{asset}.png"
    return incoming if incoming.is_file() else archived


def clean(image, settings):
    supplied = image.convert("RGBA")
    if supplied.getextrema()[3][0] < 255:
        return supplied
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    height, width = rgb.shape[:2]
    radius = settings["radius"]
    if settings.get("row_gradient"):
        # Reviewed empty strips on each side sample the generated vertical backdrop.
        border = np.concatenate((rgb[:, :4], rgb[:, -4:]), axis=1)
        key = np.median(border, axis=1)[:, None, :]
        distance = np.sqrt(np.sum((rgb - key) ** 2, axis=2))
    else:
        keys = np.asarray(settings["keys"], dtype=np.float32)
        distances = np.asarray([np.sqrt(np.sum((rgb - color) ** 2, axis=2)) for color in keys])
        nearest = distances.argmin(axis=0)
        key = keys[nearest]
        distance = distances.min(axis=0)
    eligible = distance <= radius
    protected = Image.new("L", image.size)
    draw = ImageDraw.Draw(protected)
    for polygon in settings.get("foreground_polygons", []):
        draw.polygon([(round(x * width), round(y * height)) for x, y in polygon], fill=255)
    eligible &= np.asarray(protected) == 0
    if settings.get("border_only"):
        starts = ([(0, x) for x in range(width)] + [(height - 1, x) for x in range(width)]
                  + [(y, x) for y in range(height) for x in (0, width - 1)])
        starts += reviewed_background_starts(eligible, settings.get("background_seeds", []))
        matte = connected_matte(eligible, starts)
    else:
        matte = eligible
    if not matte.any():
        raise ValueError("Reviewed background settings matched no pixels.")
    rgba = np.dstack((rgb.astype(np.uint8), np.where(matte, 0, 255).astype(np.uint8)))
    rgba[matte] = 0
    if settings.get("edge_cleanup"):
        ramp = settings["edge_cleanup"]["distance_ramp"]
        pixels = settings["edge_cleanup"]["source_pixels"]
        adjacent = np.asarray(Image.fromarray(matte.astype(np.uint8) * 255)
                              .filter(ImageFilter.MaxFilter(2 * pixels + 1))) > 0
        edge = adjacent & ~matte & (np.asarray(protected) == 0) & (distance < radius + ramp)
        alpha = np.clip((distance[edge] - radius) / ramp, .01, 1)
        colors = np.broadcast_to(key, rgb.shape)[edge]
        rgba[edge, :3] = np.clip(
            (rgb[edge] - (1 - alpha[:, None]) * colors) / alpha[:, None], 0, 255).astype(np.uint8)
        rgba[edge, 3] = np.round(alpha * 255).astype(np.uint8)
    if settings.get("exterior_frame"):
        remove_exterior_outline(rgba, np.asarray(image.convert("RGB").convert("HSV")))
    return Image.fromarray(rgba)


def prepare(source, settings):
    with Image.open(source) as image:
        output = standardize_sprite(clean(image, settings), 960, 864)
    buffer = BytesIO()
    output.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def review(directory):
    settings = load_settings()
    directory.mkdir(parents=True, exist_ok=True)
    for filename, asset in ASSETS:
        output = prepare(source_path(filename, asset), settings[asset])
        (directory / f"{asset}.png").write_bytes(output)
    for start in range(0, len(ASSETS), 6):
        sheet = Image.new("RGB", (1500, 980), "#25252b")
        draw = ImageDraw.Draw(sheet)
        for index, (_, asset) in enumerate(ASSETS[start:start + 6]):
            with Image.open(directory / f"{asset}.png") as image:
                image.thumbnail((480, 440))
                x, y = index % 3 * 500, index // 3 * 490
                sheet.paste(image, (x + (500 - image.width) // 2, y), image)
                draw.text((x + 8, y + 450), asset, fill="white")
        sheet.save(directory / f"review-{start // 6 + 1:02}.png")


def intake(apply=False, remove_incoming=False):
    if remove_incoming and not apply:
        raise ValueError("Root cleanup requires --apply and verified archives.")
    settings = load_settings()
    if set(settings) != {asset for _, asset in ASSETS} or len(ASSETS) != 60:
        raise ValueError("Settings must cover exactly all 60 replacement portraits.")
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else None
    previous_records = {row["asset"]: row for row in previous["assets"]} if previous else {}
    planned = []
    for filename, asset in ASSETS:
        source = source_path(filename, asset)
        archived = ROOT / "Art" / "source" / "character-refresh" / f"{asset}.png"
        runtime = ROOT / "public" / "assets" / "characters" / f"{asset}.png"
        historical = ROOT / "Art" / "source" / "character-refresh" / "previous-runtime" / f"{asset}.png"
        output = prepare(source, settings[asset])
        if archived.exists() and digest(archived) != digest(source):
            raise FileExistsError(f"Conflicting replacement source: {archived}")
        old = previous_records.get(asset)
        historical_hash = old["previous_runtime_sha256"] if old else digest(runtime)
        if old and not historical.exists():
            raise FileNotFoundError(f"Historical export is missing: {historical}")
        if historical.exists() and digest(historical) != historical_hash:
            raise FileExistsError(f"Conflicting historical export: {historical}")
        if old and runtime.exists() and digest(runtime) != old["runtime_sha256"]:
            raise FileExistsError(f"Runtime changed since intake: {runtime}")
        record = {"incoming": filename, "asset": asset, "category": "characters",
                  "source": str(archived.relative_to(ROOT)), "source_sha256": digest(source),
                  "runtime": str(runtime.relative_to(ROOT)), "runtime_sha256": sha256(output).hexdigest(),
                  "previous_runtime": str(historical.relative_to(ROOT)),
                  "previous_runtime_sha256": historical_hash, "processing": settings[asset]}
        planned.append((source, archived, runtime, historical, output, record))
    text = json.dumps({"asset_count": len(planned), "assets": [row[-1] for row in planned]}, indent=2) + "\n"
    if previous and previous != json.loads(text):
        raise FileExistsError("Intake provenance changed; review before modifying installed art.")
    if apply:
        for source, archived, runtime, historical, output, record in planned:
            archived.parent.mkdir(parents=True, exist_ok=True)
            historical.parent.mkdir(parents=True, exist_ok=True)
            if not archived.exists():
                shutil.copyfile(source, archived)
            if not historical.exists():
                shutil.copyfile(runtime, historical)
            runtime.write_bytes(output)
            if digest(archived) != record["source_sha256"] or digest(runtime) != record["runtime_sha256"]:
                raise ValueError(f"Installed bytes differ: {runtime}")
        MANIFEST.write_text(text, encoding="utf-8")
        from character_art_revisions import write_revisions
        write_revisions()
        if remove_incoming:
            for _, archived, runtime, _, _, record in planned:
                incoming = ROOT / record["incoming"]
                if incoming.exists():
                    if digest(incoming) != digest(archived) or digest(runtime) != record["runtime_sha256"]:
                        raise ValueError(f"Root original changed: {incoming}")
                    incoming.unlink()
    print(f"{len(planned)} portraits {'installed' if apply else 'validated (dry run)'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--review", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    args = parser.parse_args()
    if args.review:
        review(args.review)
    else:
        intake(args.apply, args.remove_incoming)
