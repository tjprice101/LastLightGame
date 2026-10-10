"""Reproduce reviewed Story cutouts and intact scenery from archived originals."""

import argparse
from dataclasses import dataclass
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw

from art_library import art_path
from intake_character_refresh import clean
from prepare_art import ROOT, standardize_sprite


SETTINGS = art_path("story-art-settings.json", root=ROOT)
MANIFEST = art_path("story-art-intake.json", root=ROOT)
REGIONS = (
    ("infernic", "Emberwake March", ("Cinderling", "Ashback Boar", "Coalcrest Moth",
                                    "Furnace Jackal", "Kilnheart Warden")),
    ("oceanic", "Glasswater Reach", ("Tideglass Crab", "Foamfin Drake", "Pearlshell Turtle",
                                    "Current Ray", "Deepbell Leviathan")),
    ("atmospheric", "Stormspan Heights", ("Cloudhorn Ram", "Staticwing Kite", "Gusttail Lynx",
                                         "Thundercoil Serpent", "Tempest Crown Roc")),
    ("botanic", "Rootstone Wilds", ("Mossplate Beetle", "Briarback Stag", "Loamjaw Mole",
                                  "Fernmantle Basilisk", "Heartwood Colossus")),
    ("tranquilitic", "Stillhalo Vale", ("Ivoryveil Moth", "Dewhalo Hart", "Vowcrest Crane",
                                      "Opalward Lion", "Serene Oathkeeper")),
    ("chaotic", "Riftbound Frontier", ("Riftfang Hound", "Splinterhide Lizard", "Voidcrest Raven",
                                     "Faultcoil Wyrm", "Fracture Sovereign")),
)


@dataclass(frozen=True)
class Asset:
    incoming: str
    asset: str
    category: str
    source: Path
    runtime: Path


def assets(root=ROOT):
    rows = []
    for element, region, names in REGIONS:
        for index, name in enumerate(names):
            suffix = "boss" if index == 4 else str(index)
            incoming = name + (" — regional boss" if index == 4 else "") + ".png"
            asset = f"story-{element}-{suffix}"
            rows.append(Asset(incoming, asset, "enemies",
                              root / "Art" / "source" / "story" / element / incoming,
                              root / "public" / "assets" / "enemies" / f"{asset}.png"))
        incoming = f"{region} — empty regional arena.png"
        asset = f"story-{region.lower().replace(' ', '-')}-arena"
        rows.append(Asset(incoming, asset, "backgrounds",
                          root / "Art" / "source" / "story" / element / incoming,
                          root / "public" / "assets" / "backgrounds" / f"{asset}.png"))
    rows.append(Asset("World Map.png", "story-world-map", "backgrounds",
                      root / "Art" / "source" / "story" / "world-map" / "World Map.png",
                      root / "public" / "assets" / "backgrounds" / "story-world-map.png"))
    return rows


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def pixel_digest(image):
    rgba = image.convert("RGBA")
    return sha256(f"{rgba.width}x{rgba.height}:RGBA:".encode() + rgba.tobytes()).hexdigest()


def load_settings(path=SETTINGS):
    settings = json.loads(path.read_text(encoding="utf-8"))
    if set(settings) != {row.asset for row in assets()}:
        raise ValueError("Settings must cover exactly 30 Story enemies, six arenas and one map.")
    for row in assets():
        entry = settings[row.asset]
        if row.category == "enemies":
            if entry.get("source_facing") not in ("left", "right", "front"):
                raise ValueError(f"Missing reviewed facing: {row.asset}")
            if entry.get("border_only") is not True or not entry.get("keys"):
                raise ValueError(f"Missing source-specific connected matte: {row.asset}")
        elif entry != {"processing": "opaque-original-size"}:
            raise ValueError(f"Scenery must remain intact and opaque: {row.asset}")
    return settings


def prepare(source, settings, category):
    with Image.open(source) as image:
        image.load()
        dimensions = list(image.size)
        alpha_authoritative = image.convert("RGBA").getextrema()[3][0] < 255
        if category == "enemies":
            output = standardize_sprite(clean(image, settings), 960, 864)
            if not output.getbbox():
                raise ValueError(f"Empty Story cutout: {source}")
        else:
            if alpha_authoritative:
                raise ValueError(f"Expected opaque scenery, refusing to discard source alpha: {source}")
            output = image.convert("RGB")
        buffer = BytesIO()
        output.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue(), dimensions, list(output.size), pixel_digest(output), alpha_authoritative


def preflight(root=ROOT, settings_path=SETTINGS, manifest_path=MANIFEST, element=None):
    settings = load_settings(settings_path)
    previous = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    old_records = {row["asset"]: row for row in previous.get("assets", [])}
    rows = assets(root)
    if not set(old_records).issubset({row.asset for row in rows}):
        raise ValueError("Existing Story manifest has conflicting asset coverage.")
    if element is not None:
        if element not in {region[0] for region in REGIONS}:
            raise ValueError(f"Unknown Story element: {element}")
        rows = [row for row in rows if row.source.parent.name == element]
    planned = []
    for row in rows:
        incoming = root / row.incoming
        source = incoming if incoming.is_file() else row.source
        if not source.is_file():
            raise FileNotFoundError(f"Story source is missing: {row.incoming}")
        source_hash = digest(source)
        if row.source.exists() and digest(row.source) != source_hash:
            raise FileExistsError(f"Conflicting Story archive: {row.source}")
        old = old_records.get(row.asset)
        if old and old["source_sha256"] != source_hash:
            raise FileExistsError(f"Source changed since Story intake: {source}")
        if row.runtime.exists() and (not old or digest(row.runtime) != old["runtime_sha256"]):
            raise FileExistsError(f"Untracked or changed Story runtime export: {row.runtime}")
        output, dimensions, runtime_dimensions, pixels, supplied_alpha = prepare(
            source, settings[row.asset], row.category)
        record = {
            "incoming": row.incoming, "asset": row.asset, "category": row.category,
            "source": str(row.source.relative_to(root)), "source_sha256": source_hash,
            "source_dimensions": dimensions, "source_alpha_authoritative": supplied_alpha,
            "runtime": str(row.runtime.relative_to(root)), "runtime_sha256": sha256(output).hexdigest(),
            "runtime_dimensions": runtime_dimensions, "runtime_pixel_sha256": pixels,
            "settings": settings[row.asset],
        }
        planned.append((row, source, output, record))
    return planned


def review(directory, root=ROOT, settings_path=SETTINGS, manifest_path=MANIFEST, element=None):
    planned = preflight(root, settings_path, manifest_path, element)
    directory.mkdir(parents=True, exist_ok=True)
    enemies = []
    for row, _, output, _ in planned:
        (directory / f"{row.asset}.png").write_bytes(output)
        if row.category == "enemies":
            enemies.append(row)
    for background, color in (("dark", "#24242b"), ("light", "#f5f5f5")):
        for start in range(0, len(enemies), 5):
            sheet = Image.new("RGB", (1600, 380), color)
            draw = ImageDraw.Draw(sheet)
            for index, row in enumerate(enemies[start:start + 5]):
                with Image.open(directory / f"{row.asset}.png") as image:
                    image.thumbnail((315, 330))
                    sheet.paste(image, (index * 320, 0), image)
                draw.text((index * 320 + 4, 340), row.asset,
                          fill="white" if background == "dark" else "black")
            sheet.save(directory / f"review-{background}-{start // 5 + 1}.png")
    return planned


def intake(apply=False, remove_incoming=False, reviewed=False, root=ROOT,
           settings_path=SETTINGS, manifest_path=MANIFEST, element=None):
    if remove_incoming and not (apply and reviewed):
        raise ValueError("Root cleanup requires --apply --reviewed after visual review.")
    planned = preflight(root, settings_path, manifest_path, element)
    previous = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    records_by_id = {record["asset"]: record for record in previous.get("assets", [])}
    records_by_id.update({record["asset"]: record for _, _, _, record in planned})
    records = [records_by_id[row.asset] for row in assets(root) if row.asset in records_by_id]
    unchanged = previous.get("assets") == records
    manifest = {"version": 1, "counts": {
                    "enemies": sum(record["category"] == "enemies" for record in records),
                    "arenas": sum(record["asset"].endswith("-arena") for record in records),
                    "world_maps": sum(record["asset"] == "story-world-map" for record in records)},
                "visual_review": "approved" if reviewed or
                (unchanged and previous.get("visual_review") == "approved") else "pending",
                "assets": records}
    if apply:
        for row, source, output, record in planned:
            row.source.parent.mkdir(parents=True, exist_ok=True)
            if not row.source.exists():
                shutil.copyfile(source, row.source)
            if digest(row.source) != record["source_sha256"]:
                raise ValueError(f"Story archive verification failed: {row.source}")
            row.runtime.parent.mkdir(parents=True, exist_ok=True)
            row.runtime.write_bytes(output)
            if digest(row.runtime) != record["runtime_sha256"]:
                raise ValueError(f"Story export verification failed: {row.runtime}")
            with Image.open(row.runtime) as image:
                if pixel_digest(image) != record["runtime_pixel_sha256"]:
                    raise ValueError(f"Story export pixel verification failed: {row.runtime}")
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
                                 encoding="utf-8")
        if remove_incoming:
            for row, _, _, record in planned:
                incoming = root / row.incoming
                if incoming.exists():
                    if digest(incoming) != record["source_sha256"] or \
                            digest(row.source) != record["source_sha256"] or \
                            digest(row.runtime) != record["runtime_sha256"]:
                        raise ValueError(f"Story cleanup verification failed: {incoming}")
            for row, _, _, _ in planned:
                (root / row.incoming).unlink(missing_ok=True)
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--review", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--reviewed", action="store_true", help="Confirm actual light/dark/source visual review.")
    parser.add_argument("--remove-incoming", action="store_true")
    parser.add_argument("--element", choices=[region[0] for region in REGIONS],
                        help="Intake only one region; preserve all other manifest records and sources.")
    arguments = parser.parse_args()
    if arguments.review:
        review(arguments.review, element=arguments.element)
    result = intake(arguments.apply, arguments.remove_incoming, arguments.reviewed,
                    element=arguments.element)
    print(f"Story intake: {len(result['assets'])} recorded assets; "
          f"{'installed' if arguments.apply else 'preflight only'}.")


if __name__ == "__main__":
    main()
