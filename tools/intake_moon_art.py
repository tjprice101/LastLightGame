"""Archive and reproduce the delivered Moon portrait, icon and event sources."""
import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import re
import shutil

import numpy as np
from PIL import Image, ImageDraw

from build_moon_banner_art import CHARACTERS, STATUS_SYMBOLS, master_rows
from build_seasonal_event_art import FAMILIES, rows_for
from intake_character_refresh import clean
from prepare_art import ROOT, standardize_sprite

SETTINGS = ROOT / "Art" / "provenance" / "moon-art-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "moon-art-intake.json"
REVISIONS = ROOT / "src" / "content" / "moon-art-revisions.ts"
SCENERY = ("banners", "backgrounds")


def key(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())


def assets(root=ROOT):
    rows = []
    for character in CHARACTERS:
        slug, name = character["slug"], character["name"]
        rows.extend((f"{title}, {name}.png", "characters",
                     slug + (f"-evo-{stage}" if stage > 1 else ""))
                    for stage, title in enumerate(character["titles"], 1))
        rows.extend((f"{name} {label}.png", "abilities", f"{slug}-{action}")
                    for action, label, _ in character["icons"])
    rows.extend((f"{character['name']} {name}.png", "master-conduits", f"master-{character['slug']}-{slot}")
                for character, slot, name, _ in master_rows())
    rows.extend((f"{owner.title()} {label} status.png", "abilities/statuses",
                 f"moon-status-{owner}-{slug}") for owner, slug, label, _ in STATUS_SYMBOLS)
    enemies, materials = rows_for(FAMILIES[0])
    rows.extend((f"{name.strip()}.png", "enemies", f"moon-vesperwing-{stage}")
                for stage, (_, name, _) in enumerate(enemies, 1))
    rows.extend((f"{tier} of Moonwake.png", "materials", f"moonwake-{tier.lower()}")
                for tier, _ in materials)
    rows.extend((("Summoning banner event splash.png", "banners", "moon-banner"),
                 ("Moon Activity header.png", "banners", "moon-header"),
                 ("Moon Battle arena.png", "backgrounds", "moon-arena")))
    files = list(root.glob("*.png"))
    archived_files = list((root / "Art" / "source" / "moon").rglob("*.png"))
    result = []
    for expected, category, asset in rows:
        alternatives = {key(expected)}
        if category == "master-conduits":
            alternatives.add(key(expected.split(" ", 1)[1]))
        matches = [path for path in files + archived_files if key(path.name) in alternatives]
        matches = list(dict.fromkeys(matches))
        if not matches:
            raise FileNotFoundError(expected)
        names = {path.name for path in matches}
        if len(names) != 1:
            raise ValueError(f"Ambiguous source for {expected}: {names}")
        filename = matches[0].name
        result.append((filename, category, asset,
                       root / "Art" / "source" / "moon" / category / filename,
                       root / "public" / "assets" / category / f"{asset}.png"))
    if len(result) != 104 or len({row[2] for row in result}) != 104:
        raise ValueError("Moon intake must cover exactly104 distinct required images.")
    return result


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def initialize():
    if SETTINGS.exists():
        raise FileExistsError(SETTINGS)
    settings = {}
    for filename, category, asset, archived, _ in assets():
        source = ROOT / filename
        if not source.exists():
            source = archived
        with Image.open(source) as image:
            if category in SCENERY:
                settings[asset] = {"processing": "opaque original scenery", "review": ""}
            else:
                rgb = np.asarray(image.convert("RGB"))
                corners = np.concatenate([rgb[:4, :4].reshape(-1, 3), rgb[-4:, :4].reshape(-1, 3),
                                          rgb[:4, -4:].reshape(-1, 3), rgb[-4:, -4:].reshape(-1, 3)])
                settings[asset] = {
                    "keys": [np.median(corners, axis=0).astype(int).tolist()],
                    "row_gradient": False, "radius": 34, "border_only": True,
                    "background_seeds": [], "foreground_polygons": [],
                    "edge_cleanup": {"source_pixels": 1, "distance_ramp": 32}, "review": "",
                }
    SETTINGS.write_text(json.dumps(settings, indent=2) + "\n", encoding="utf-8")


def prepare(source, config, category, canvas_size=None, content_size=None):
    if category in SCENERY:
        with Image.open(source) as image:
            if image.convert("RGBA").getextrema()[3][0] < 255:
                raise ValueError(f"Scenery must be opaque: {source}")
        return source.read_bytes()
    with Image.open(source) as image:
        output = standardize_sprite(clean(image, config),
                                    canvas_size or (960 if category in ("characters", "enemies") else 256),
                                    content_size or (864 if category in ("characters", "enemies") else 224))
    buffer = BytesIO()
    output.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def preflight(require_review=True):
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    old = {row["asset"]: row for row in previous.get("assets", [])}
    rows = assets()
    if set(settings) != {row[2] for row in rows}:
        raise ValueError("Incomplete Moon settings.")
    planned = []
    for filename, category, asset, archive, runtime in rows:
        incoming = ROOT / filename
        source = incoming if incoming.exists() else archive
        source_hash = digest(source)
        if archive.exists() and digest(archive) != source_hash:
            raise FileExistsError(f"Archived original conflicts: {archive}")
        if asset in old and old[asset]["source_sha256"] != source_hash:
            raise ValueError(f"Source changed: {asset}")
        if runtime.exists() and (asset not in old or digest(runtime) != old[asset]["runtime_sha256"]):
            raise FileExistsError(f"Untracked/changed runtime: {runtime}")
        config = settings[asset]
        if require_review and not config.get("review"):
            raise ValueError(f"Visual review missing: {asset}")
        output = prepare(source, config, category)
        with Image.open(source) as image:
            record = {"incoming": filename, "category": category, "asset": asset,
                      "source": archive.relative_to(ROOT).as_posix(),
                      "source_sha256": source_hash, "source_dimensions": list(image.size),
                      "source_alpha_authoritative": image.convert("RGBA").getextrema()[3][0] < 255,
                      "runtime": runtime.relative_to(ROOT).as_posix(),
                      "runtime_sha256": sha256(output).hexdigest(), "settings": config}
        planned.append((source, archive, runtime, output, record))
    return planned


def review(directory):
    directory.mkdir(parents=True, exist_ok=True)
    planned = preflight(False)
    groups = {}
    for source, _, _, output, record in planned:
        (directory / f"{record['asset']}.png").write_bytes(output)
        group = record["asset"].split("-")[0] if record["category"] == "characters" else record["category"].replace("/", "-")
        groups.setdefault(group, []).append((output, record))
    for group, rows in groups.items():
        for offset in range(0, len(rows), 12):
            for label, color in (("dark", "#25252b"), ("light", "#eeeeee")):
                page = rows[offset:offset + 12]
                sheet = Image.new("RGB", (1440, ((len(page) + 3) // 4) * 330), color)
                draw = ImageDraw.Draw(sheet)
                for i, (output, record) in enumerate(page):
                    image = Image.open(BytesIO(output)).convert("RGBA")
                    image.thumbnail((350, 295))
                    x, y = i % 4 * 360, i // 4 * 330
                    sheet.paste(image, (x + (360 - image.width) // 2, y), image)
                    draw.text((x + 5, y + 298), record["asset"], fill="white" if label == "dark" else "black")
                sheet.save(directory / f"{group}-{offset}-{label}.jpg")


def install(remove=False):
    planned = preflight()
    for source, archive, runtime, output, _ in planned:
        archive.parent.mkdir(parents=True, exist_ok=True)
        if not archive.exists():
            shutil.copy2(source, archive)
        runtime.parent.mkdir(parents=True, exist_ok=True)
        runtime.write_bytes(output)
    for _, archive, runtime, _, record in planned:
        if digest(archive) != record["source_sha256"] or digest(runtime) != record["runtime_sha256"]:
            raise ValueError(f"Post-export verification failed: {record['asset']}")
    MANIFEST.write_text(json.dumps({"scope": "104 reviewed Moon sources; exact originals retained.",
                                    "assets": [row[-1] for row in planned]}, indent=2) + "\n", encoding="utf-8")
    lines = ["// Generated by tools/intake_moon_art.py from reviewed export bytes.",
             "export const moonArtRevisions: Readonly<Record<string, string>> = {"]
    lines.extend(f"  '{row[-1]['runtime'].removeprefix('public/assets/')}': '{row[-1]['runtime_sha256'][:16]}'," for row in planned)
    REVISIONS.write_text("\n".join([*lines, "};", ""]), encoding="utf-8")
    if remove:
        for _, _, _, _, record in planned:
            incoming = ROOT / record["incoming"]
            if incoming.exists():
                if digest(incoming) != record["source_sha256"]:
                    raise ValueError(f"Root source changed: {incoming}")
                incoming.unlink()
    print("Installed and verified104 Moon assets; original bytes archived.")


def reviewed_source(asset_id):
    if not MANIFEST.exists():
        return None
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    row = next((entry for entry in manifest["assets"] if entry["asset"] == asset_id), None)
    if not row:
        return None
    path = ROOT / row["source"]
    if not path.is_file():
        raise FileNotFoundError(f"Installed Moon original missing: {path}")
    return path, row["category"]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--initialize", action="store_true")
    parser.add_argument("--review", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    args = parser.parse_args()
    if args.initialize:
        initialize()
    if args.review:
        review(args.review)
    if args.remove_incoming and not args.apply:
        raise ValueError("Cleanup requires verified --apply.")
    if args.apply:
        install(args.remove_incoming)
