"""Review/export the 24 reclaimed War portraits; archive originals before cleanup."""
import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from build_phase2_war_art import source_rows
from intake_character_refresh import clean
from prepare_art import ROOT, standardize_sprite

SETTINGS = ROOT / "Art" / "provenance" / "phase2-war-art-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "phase2-war-art-intake.json"


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def assets(root=ROOT):
    return [
        (row, row["slug"] + (f"-evo-{row['stage']}" if row["stage"] > 1 else ""),
         root / row["archive"],
         root / "public" / "assets" / "characters" /
         (row["slug"] + (f"-evo-{row['stage']}" if row["stage"] > 1 else "") + ".png"))
        for row in source_rows()
    ]


def initialize_settings():
    if SETTINGS.exists():
        raise FileExistsError(SETTINGS)
    settings = {}
    for _, asset, source, _ in assets():
        with Image.open(source) as image:
            rgb = np.asarray(image.convert("RGB"))
            corners = np.concatenate([
                rgb[:4, :4].reshape(-1, 3), rgb[-4:, :4].reshape(-1, 3),
                rgb[:4, -4:].reshape(-1, 3), rgb[-4:, -4:].reshape(-1, 3),
            ])
            settings[asset] = {
                "keys": [np.median(corners, axis=0).astype(int).tolist()],
                "row_gradient": False, "radius": 34, "border_only": True,
                "background_seeds": [], "foreground_polygons": [],
                "edge_cleanup": {"source_pixels": 1, "distance_ramp": 32},
                "review": "",
            }
    SETTINGS.parent.mkdir(parents=True, exist_ok=True)
    SETTINGS.write_text(json.dumps(settings, indent=2) + "\n", encoding="utf-8")


def prepare(source, settings, canvas_size=960, content_size=864):
    with Image.open(source) as image:
        output = standardize_sprite(clean(image, settings), canvas_size, content_size)
    buffer = BytesIO()
    output.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def record_reviews(seed_path):
    seeds = json.loads(seed_path.read_text(encoding="utf-8"))
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    if set(seeds) != set(settings):
        raise ValueError("Reviewed seeds must cover exactly all portrait assets.")
    for asset, points in seeds.items():
        if not all(len(point) == 2 and all(0 <= value <= 1 for value in point) for point in points):
            raise ValueError(f"Invalid reviewed gap point: {asset}")
        settings[asset]["background_seeds"] = points
        settings[asset]["review"] = (
            "Original/full six-form sheet and numbered eligible-component overlay inspected. "
            "Fixed per-source teal/green key avoids tip-contaminated row-strip artifacts. "
            "Reviewed enclosed gaps only; preserve pale armor, feathers, hair, dark chains, "
            "painted shadows and authored cyan water/orange flame/violet/gold/green-yellow "
            "power detail. Existing source clipping/hairstyle/weapon drift retained."
        )
    SETTINGS.write_text(json.dumps(settings, indent=2) + "\n", encoding="utf-8")


def reviewed_source(asset):
    row = next((row for row in assets() if row[1] == asset), None)
    if row is None:
        return None
    if row[2].is_file():
        return row[2]
    if MANIFEST.exists():
        raise FileNotFoundError(f"Installed Phase 2 source is missing: {row[2]}")
    return None


def preflight(root=ROOT, settings_path=SETTINGS, manifest_path=MANIFEST, require_review=True):
    settings = json.loads(settings_path.read_text(encoding="utf-8"))
    rows = assets(root)
    if len(rows) != 24 or set(settings) != {row[1] for row in rows}:
        raise ValueError("Settings must cover exactly 24 Phase 2 portraits.")
    previous = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    old = {row["asset"]: row for row in previous.get("assets", [])}
    if old and set(old) != set(settings):
        raise ValueError("Installed portrait coverage changed.")
    planned = []
    for mapping, asset, source, runtime in rows:
        if not source.is_file():
            raise FileNotFoundError(source)
        incoming = root / mapping["original_filename"]
        source_hash = digest(source)
        if incoming.exists() and digest(incoming) != source_hash:
            raise FileExistsError(f"Root original differs from archive: {incoming}")
        prior = old.get(asset)
        if prior and prior["source_sha256"] != source_hash:
            raise ValueError(f"Archived source changed: {asset}")
        if runtime.exists() and (not prior or prior["runtime_sha256"] != digest(runtime)):
            raise FileExistsError(f"Untracked or changed runtime export: {runtime}")
        config = settings[asset]
        if require_review and not config.get("review"):
            raise ValueError(f"Missing visual review: {asset}")
        if not config.get("keys") or not config.get("border_only"):
            raise ValueError(f"Missing connected reviewed key: {asset}")
        output = prepare(source, config)
        with Image.open(source) as image:
            record = {
                "asset": asset, "character": mapping["character"],
                "stage": mapping["stage"], "incoming": mapping["original_filename"],
                "source": source.relative_to(root).as_posix(),
                "source_sha256": source_hash, "source_dimensions": list(image.size),
                "source_alpha_authoritative": image.convert("RGBA").getextrema()[3][0] < 255,
                "runtime": runtime.relative_to(root).as_posix(),
                "runtime_sha256": sha256(output).hexdigest(), "settings": config,
            }
        planned.append((source, runtime, output, record))
    return planned


def review(directory, planned):
    directory.mkdir(parents=True, exist_ok=True)
    for _, _, output, record in planned:
        (directory / f"{record['asset']}.png").write_bytes(output)
    for slug in ("neralis", "varkhel", "seravelle", "velmira"):
        rows = [row for row in planned if row[3]["asset"].startswith(slug)]
        for label, color in (("dark", "#25252b"), ("light", "#eeeeee")):
            sheet = Image.new("RGB", (1440, 1000), color)
            draw = ImageDraw.Draw(sheet)
            for index, (_, _, output, record) in enumerate(rows):
                image = Image.open(BytesIO(output)).convert("RGBA")
                image.thumbnail((475, 460))
                x, y = index % 3 * 480, index // 3 * 500
                sheet.paste(image, (x + (480 - image.width) // 2, y), image)
                draw.text((x + 8, y + 466), record["asset"],
                          fill="white" if label == "dark" else "black")
            sheet.save(directory / f"review-{slug}-{label}.jpg")


def intake(apply=False, remove_incoming=False):
    if remove_incoming and not apply:
        raise ValueError("Root cleanup requires --apply and verified exports.")
    planned = preflight()
    if not apply:
        return planned
    for _, runtime, output, _ in planned:
        runtime.parent.mkdir(parents=True, exist_ok=True)
        runtime.write_bytes(output)
    for source, runtime, _, record in planned:
        if digest(source) != record["source_sha256"] or digest(runtime) != record["runtime_sha256"]:
            raise ValueError(f"Source/export verification failed: {record['asset']}")
    MANIFEST.write_text(json.dumps({
        "scope": "24 approved reclaimed War portraits; source bytes retained.",
        "assets": [row[3] for row in planned],
    }, indent=2) + "\n", encoding="utf-8")
    if remove_incoming:
        for _, _, _, record in planned:
            incoming = ROOT / record["incoming"]
            if incoming.exists():
                if digest(incoming) != record["source_sha256"]:
                    raise ValueError(f"Root copy changed before cleanup: {incoming}")
                incoming.unlink()
    return planned


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--initialize-settings", action="store_true")
    parser.add_argument("--review", type=Path)
    parser.add_argument("--record-reviewed-seeds", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    args = parser.parse_args()
    if args.initialize_settings:
        initialize_settings()
    if args.record_reviewed_seeds:
        record_reviews(args.record_reviewed_seeds)
    if args.review:
        review(args.review, preflight(require_review=False))
    if args.apply or args.remove_incoming:
        rows = intake(args.apply, args.remove_incoming)
        print(f"Installed and verified {len(rows)} portraits; original archived bytes retained.")
