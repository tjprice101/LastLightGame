"""Review and archive the delivered Conduit icons and replacement portraits."""

import argparse
from dataclasses import dataclass
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import re
import shutil

import numpy as np
from PIL import Image, ImageDraw

from art_library import art_path
from build_conduit_expansion_art import designs as conduit_designs
from intake_character_refresh import ASSETS as ROSTER_ASSETS, clean, load_settings
from prepare_art import ROOT, standardize_sprite


MANIFEST = art_path("delivered-root-art-intake.json", root=ROOT)
SOURCE_ROOT = ROOT / "Art" / "source" / "delivered-root-art"
CHARACTER_IDS = {
    "bliss", "bliss-evo-2", "bliss-evo-3", "bliss-evo-4", "bliss-evo-5",
    "bliss-evo-6", "rosetta-evo-5", "rosetta-evo-6", "crinso-evo-5",
    "crinso-evo-6", "aurora-evo-5", "bruno-evo-5", "thornia-evo-6",
}
KEY_SETTINGS = {
    "Breach Pendulum (Rare).png": {"keys": [[132, 196, 180]], "radius": 12},
    "Cinder Testament (Omnic  Infernic).png": {"keys": [[132, 244, 180]], "radius": 16},
    "Coilfeed Ratchet (Rare).png": {"keys": [[140, 244, 132]], "radius": 12},
    "Crosspin Governor (Common).png": {"keys": [[124, 204, 164]], "radius": 12},
    "Dawn Witness Array (Omnic  Luminous).png": {"keys": [[164, 212, 172]], "radius": 16},
    "Dawncourt Sovereign, Aurora.png": {"row_gradient": True, "radius": 10},
    "Execution Orrery (Legendary).png": {"keys": [[60, 132, 124]], "radius": 12},
    "Faultkeeper Loom (Omnic  Tectonic).png": {"keys": [[124, 180, 148]], "radius": 16},
    "Featherstep Duelist, Bliss.png": {"keys": [[44, 100, 84]], "radius": 16},
    "Fieldbrace Coupler (Common).png": {"keys": [[140, 252, 196]], "radius": 12},
    "Glassroot Gimbal (Rare).png": {"keys": [[124, 252, 212]], "radius": 12},
    "Granite Hourglass (Legendary).png": {"keys": [[140, 196, 164]], "radius": 16},
    "Hammerbalance Link (Rare).png": {"keys": [[140, 252, 220]], "radius": 12},
    "Horizon Heartcase (Legendary).png": {"keys": [[100, 204, 180]], "radius": 16},
    "Lifeline Flywheel (Rare).png": {"keys": [[60, 244, 196]], "radius": 12},
    "Meridian Inverter (Legendary).png": {"keys": [[100, 164, 156]], "radius": 12},
    "Nightglass Archive (Omnic  Ominous).png": {"keys": [[172, 236, 124]], "radius": 12},
    "Nullsong Transmission (Legendary).png": {"keys": [[116, 204, 188]], "radius": 16},
    "Opal Indexer (Rare).png": {"keys": [[140, 236, 180]], "radius": 12},
    "Pale Bulwark Diadem (Legendary).png": {"keys": [[84, 212, 180]], "radius": 16},
    "Paradox Spindle (Omnic  Chaotic).png": {"keys": [[28, 228, 188]], "radius": 16},
    "Precision Escapement (Common).png": {"keys": [[132, 236, 196]], "radius": 12},
    "Prism Splinter Socket (Common).png": {"keys": [[60, 140, 124]], "radius": 12},
    "Prismatic Mountain Regent, Bruno.png": {"keys": [[252, 252, 252]], "radius": 16},
    "Prismplume Arbiter, Bliss.png": {"keys": [[44, 44, 44]], "radius": 16},
    "Quietwing Fencer, Bliss.png": {"keys": [[12, 92, 84]], "radius": 16},
    "Reserve Torque Crank (Common).png": {"keys": [[132, 204, 164]], "radius": 16},
    "Resonance Crucible (Rare).png": {"keys": [[164, 236, 172]], "radius": 12},
    "Sentinel Aperture (Rare).png": {"keys": [[124, 228, 188]], "radius": 16},
    "Serene Tempest Empress, Bliss.png": {"keys": [[20, 20, 20]], "radius": 16},
    "Siege Cantilever (Legendary).png": {"keys": [[180, 188, 156]], "radius": 12},
    "Skythread Rudder (Omnic  Atmospheric).png": {"keys": [[148, 204, 180]], "radius": 12},
    "Sovereign of Beautiful Ruin, Crinso.png": {"keys": [[4, 4, 4]], "radius": 16},
    "Sovereign of Passion, Rosetta.png": {"keys": [[252, 252, 252]], "radius": 16},
    "Starvein Conductor (Legendary).png": {"keys": [[116, 156, 140]], "radius": 12},
    "Stasis Reliquary (Legendary).png": {"keys": [[44, 172, 156]], "radius": 16},
    "Stillhour Carillon (Omnic  Tranquilitic).png": {"keys": [[76, 196, 188]], "radius": 16},
    "Stillplume Dancer, Bliss.png": {"keys": [[4, 116, 92]], "radius": 16},
    "Stormstep Dynamo (Omnic  Voltaic).png": {"keys": [[108, 220, 180]], "radius": 16},
    "The Rose Beyond Duality, Crinso.png": {"keys": [[108, 108, 108]], "radius": 16},
    "The Rose Beyond the Sun, Rosetta.png": {"keys": [[44, 44, 44]], "radius": 16},
    "The Thousand-Rose Empress, Thornia.png": {"keys": [[140, 140, 140]], "radius": 16},
    "The Thousandfeather Stillness, Bliss.png": {"keys": [[68, 60, 60]], "radius": 16},
    "Twinpulse Bellows (Rare).png": {"keys": [[60, 228, 180]], "radius": 16},
    "Undertide Chronometer (Omnic  Aquatic).png": {"keys": [[4, 236, 188]], "radius": 12},
    "Verdant Covenant (Omnic  Efflorescent).png": {
        "keys": [[92, 212, 148], [103, 226, 159], [100, 223, 157]], "radius": 16},
    "Verdict Caliper (Legendary).png": {"keys": [[140, 196, 164]], "radius": 16},
    "Wardglass Transformer (Rare).png": {"keys": [[84, 252, 172]], "radius": 16},
}
GAP_SEEDS: dict[str, list[list[float]]] = {
    "breach-pendulum": [[0.43, 0.275]],
    "chaotic-paradox-spindle": [
        [0.402, 0.601], [0.619, 0.579], [0.364258, 0.423828],
    ],
    "execution-orrery": [
        [0.456055, 0.234375], [0.594727, 0.279297], [0.420898, 0.441406],
        [0.560547, 0.442383], [0.555664, 0.780273], [0.389648, 0.876953],
        [0.606445, 0.875977], [0.589844, 0.370117], [0.40918, 0.366211],
        [0.640625, 0.370117], [0.358398, 0.365234], [0.241211, 0.939453],
        [0.75, 0.938477],
    ],
    "nullsong-transmission": [
        [0.350586, 0.361328], [0.619141, 0.334961], [0.663086, 0.692383],
        [0.334961, 0.691406], [0.537109, 0.702148], [0.706055, 0.55957],
    ],
    "prism-splinter-socket": [
        [0.487305, 0.245117], [0.198242, 0.756836], [0.333984, 0.412109],
    ],
    "efflorescent-verdant-covenant": [[0.5, 0.7]],
    "opal-indexer": [
        [0.17, 0.498], [0.256, 0.712], [0.474, 0.728], [0.594, 0.591], [0.457, 0.296],
    ],
    "sentinel-aperture": [[0.258, 0.395]],
    "bliss-evo-2": [[0.36068, 0.44444], [0.33306, 0.31715]],
    "bliss-evo-3": [[0.311, 0.37628], [0.34836, 0.06846], [0.36703, 0.30943]],
    "tranquilitic-stillhour-carillon": [
        [0.394, 0.456], [0.607, 0.456], [0.26, 0.459], [0.742, 0.46],
    ],
}

KEY_SETTINGS["Meridian Inverter (Legendary).png"]["row_gradient"] = True
KEY_SETTINGS["Meridian Inverter (Legendary).png"]["background_border_strips"] = {
    "top": 2, "right": 2, "bottom": 2, "left": 2,
}
KEY_SETTINGS["Paradox Spindle (Omnic  Chaotic).png"]["background_border_strips"] = {
    "top": 2, "bottom": 2,
}
EDGE_CLEANUP = {"source_pixels": 2, "distance_ramp": 60}


@dataclass(frozen=True)
class Asset:
    incoming: str
    asset: str
    category: str
    source: Path
    runtime: Path
    canvas_size: int
    content_size: int
    source_facing: str | None = None


def digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def _conduit_catalog() -> dict[str, list[str]]:
    text = (ROOT / "src" / "content" / "conduits.ts").read_text(encoding="utf-8")
    entries: dict[str, list[str]] = {}
    for conduit_id, name in re.findall(r"\bid:\s*'([^']+)',\s*name:\s*'([^']+)'", text):
        entries.setdefault(name, []).append(conduit_id)
    return entries


def assets() -> list[Asset]:
    result = []
    catalog = _conduit_catalog()
    for _, rarity, name, element, _ in conduit_designs():
        matches = catalog.get(name, [])
        if len(matches) != 1:
            raise ValueError(f"Expected one exact Conduit catalog match for {name!r}; found {len(matches)}.")
        conduit_id = matches[0]
        incoming = (f"{name} (Omnic  {element}).png" if element else f"{name} ({rarity}).png")
        result.append(Asset(
            incoming, conduit_id, "conduits",
            SOURCE_ROOT / "conduits" / f"{conduit_id}.png",
            ROOT / "public" / "assets" / "conduits" / f"{conduit_id}.png", 256, 224))

    roster = {filename: asset_id for filename, asset_id in ROSTER_ASSETS}
    refresh_settings = load_settings()
    selected = [(filename, asset_id) for filename, asset_id in roster.items()
                if asset_id in CHARACTER_IDS]
    if {asset_id for _, asset_id in selected} != CHARACTER_IDS:
        missing = CHARACTER_IDS - {asset_id for _, asset_id in selected}
        raise ValueError(f"Replacement portrait names do not map uniquely to the roster: {sorted(missing)}.")
    for incoming, asset_id in selected:
        result.append(Asset(
            incoming, asset_id, "characters",
            SOURCE_ROOT / "characters" / f"{asset_id}.png",
            ROOT / "public" / "assets" / "characters" / f"{asset_id}.png", 960, 864,
            refresh_settings[asset_id]["source_facing"]))

    if len(result) != 48 or len({row.incoming for row in result}) != len(result) or \
            len({row.asset for row in result}) != len(result):
        raise ValueError("Expected48 distinct, unambiguous Conduit and portrait mappings.")
    if set(KEY_SETTINGS) != {row.incoming for row in result}:
        raise ValueError("Per-source RGB key settings must cover exactly the48 delivered PNGs.")
    return sorted(result, key=lambda row: (row.category, row.asset))


def _settings(asset: Asset) -> dict[str, object]:
    values = dict(KEY_SETTINGS[asset.incoming])
    values.setdefault("border_only", True)
    values["edge_cleanup"] = dict(EDGE_CLEANUP)
    if asset.asset in GAP_SEEDS:
        values["background_seeds"] = GAP_SEEDS[asset.asset]
    return values


def clean_for_export(image: Image.Image, settings: dict[str, object], asset_id: str) -> Image.Image:
    processed = clean(image, settings)
    for side, depth in settings.get("background_border_strips", {}).items():
        if not isinstance(depth, int) or depth <= 0:
            raise ValueError(f"Invalid reviewed border-strip depth for {asset_id}: {side}")
        pixels = np.asarray(processed).copy()
        if side == "top":
            pixels[:depth, :, :] = 0
        elif side == "right":
            pixels[:, -depth:, :] = 0
        elif side == "bottom":
            pixels[-depth:, :, :] = 0
        elif side == "left":
            pixels[:, :depth, :] = 0
        else:
            raise ValueError(f"Invalid reviewed background border side: {side}")
        processed = Image.fromarray(pixels)
    return processed


def prepare(source: Path, asset: Asset) -> tuple[bytes, dict[str, object]]:
    settings = _settings(asset)
    with Image.open(source) as image:
        width, height = image.size
        source_mode = image.mode
        has_alpha = "A" in image.getbands() and image.getchannel("A").getextrema()[0] < 255
        if has_alpha:
            processed = image.convert("RGBA")
            method = "supplied alpha; trim, resize, and pad only"
            processing: dict[str, object] = {"method": method}
        else:
            if image.mode != "RGB":
                raise ValueError(f"Expected RGB or transparent-alpha PNG: {source}")
            processed = clean_for_export(image, settings, asset.asset)
            method = "individual border-connected RGB key"
            processing = {"method": method, **settings}
        output_image = standardize_sprite(processed, asset.canvas_size, asset.content_size)
        buffer = BytesIO()
        output_image.save(buffer, format="PNG", optimize=True)
        output = buffer.getvalue()
    metadata: dict[str, object] = {
        "source_mode": source_mode,
        "source_dimensions": [width, height],
        "processing": processing,
    }
    if asset.source_facing is not None:
        metadata["source_facing"] = asset.source_facing
    return output, metadata


def plan(regenerate: bool = False):
    rows = []
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else None
    old_records = {row["asset"]: row for row in previous["assets"]} if previous else {}
    planned_assets = assets()
    if previous and (previous.get("asset_count") != len(planned_assets) or
                     set(old_records) != {asset.asset for asset in planned_assets}):
        raise ValueError("Existing delivered-art manifest does not match the reviewed asset map.")

    for asset in planned_assets:
        incoming = ROOT / asset.incoming
        source = asset.source
        if incoming.exists() and source.exists() and digest(incoming) != digest(source):
            raise FileExistsError(f"Incoming source differs from its preserved archive: {incoming}")
        if source.is_file():
            input_path = source
        elif incoming.is_file():
            input_path = incoming
        else:
            raise FileNotFoundError(f"Missing incoming and archived art: {incoming}, {source}")
        output, metadata = prepare(input_path, asset)
        source_hash = digest(input_path)
        old = old_records.get(asset.asset)
        if old and (old["source_sha256"] != source_hash or
                    old["source"] != str(asset.source.relative_to(ROOT)).replace("/", "\\")):
            raise FileExistsError(f"Preserved source changed since intake: {source}")

        record: dict[str, object] = {
            "incoming": asset.incoming,
            "asset": asset.asset,
            "category": asset.category,
            "source": str(asset.source.relative_to(ROOT)).replace("/", "\\"),
            "source_sha256": source_hash,
            "runtime": str(asset.runtime.relative_to(ROOT)).replace("/", "\\"),
            "runtime_sha256": sha256(output).hexdigest(),
            **metadata,
        }
        previous_bytes = None
        if asset.category == "characters":
            historical = (ROOT / old["previous_runtime"].replace("\\", "/")
                          if old else SOURCE_ROOT / "previous-runtime" / f"{asset.asset}.png")
            if old:
                previous_hash = old["previous_runtime_sha256"]
                if not historical.is_file() or digest(historical) != previous_hash:
                    raise FileExistsError(f"Preserved previous portrait export is missing or changed: {historical}")
            else:
                if not asset.runtime.is_file():
                    raise FileNotFoundError(f"Previous character export is missing: {asset.runtime}")
                previous_bytes = asset.runtime.read_bytes()
                previous_hash = sha256(previous_bytes).hexdigest()
            record["previous_runtime"] = str(historical.relative_to(ROOT)).replace("/", "\\")
            record["previous_runtime_sha256"] = previous_hash
        elif asset.runtime.exists():
            if not old:
                raise FileExistsError(f"Refusing to overwrite an unrecorded Conduit export: {asset.runtime}")
            actual_runtime_hash = digest(asset.runtime)
            old_runtime_hash = old["runtime_sha256"]
            output_hash = sha256(output).hexdigest()
            if actual_runtime_hash not in {old_runtime_hash, output_hash}:
                raise FileExistsError(f"Runtime export differs from both recorded and reviewed bytes: {asset.runtime}")
            if actual_runtime_hash != old_runtime_hash and not regenerate:
                raise FileExistsError(f"Runtime export changed since intake: {asset.runtime}")
            historical = (ROOT / old["previous_runtime"].replace("\\", "/")
                          if old.get("previous_runtime") else None)
            if old.get("previous_runtime"):
                if historical is None or not historical.is_file() or \
                        digest(historical) != old["previous_runtime_sha256"]:
                    raise FileExistsError(f"Preserved previous Conduit export is missing or changed: {historical}")
            if old_runtime_hash != output_hash:
                if not regenerate:
                    raise FileExistsError(f"Reviewed Conduit settings changed; use --regenerate: {asset.asset}")
                if historical is None:
                    historical = (SOURCE_ROOT / "previous-runtime" / "conduits" / "D-177" /
                                  f"{asset.asset}.png")
                    previous_bytes = asset.runtime.read_bytes()
                record["previous_runtime"] = str(historical.relative_to(ROOT)).replace("/", "\\")
                record["previous_runtime_sha256"] = (
                    old["previous_runtime_sha256"] if old.get("previous_runtime")
                    else sha256(previous_bytes).hexdigest())
            elif historical is not None:
                record["previous_runtime"] = str(historical.relative_to(ROOT)).replace("/", "\\")
                record["previous_runtime_sha256"] = old["previous_runtime_sha256"]

        if old:
            if asset.runtime.is_file() and digest(asset.runtime) != old["runtime_sha256"] and not regenerate:
                raise FileExistsError(f"Runtime export changed since intake: {asset.runtime}")
            if old != record and not regenerate:
                raise FileExistsError(f"Delivery provenance/settings changed since intake: {asset.asset}")
        rows.append((asset, input_path, incoming, output, record, previous_bytes))

    text = json.dumps({"asset_count": len(rows), "assets": [row[4] for row in rows]},
                      indent=2, ensure_ascii=False) + "\n"
    if previous and MANIFEST.read_text(encoding="utf-8") != text and not regenerate:
        raise FileExistsError(f"Existing delivery manifest differs from the planned intake: {MANIFEST}")
    return rows, text


def review(directory: Path) -> None:
    rows, _ = plan()
    directory.mkdir(parents=True, exist_ok=True)
    for asset, source, _, output, _, _ in rows:
        (directory / f"{asset.asset}.png").write_bytes(output)
    for category, columns, cell_width, cell_height in (
            ("conduits", 5, 300, 310), ("characters", 4, 360, 300)):
        selected = [row for row in rows if row[0].category == category]
        sheet = Image.new(
            "RGB", (columns * cell_width, ((len(selected) + columns - 1) // columns) * cell_height),
            "#202027")
        draw = ImageDraw.Draw(sheet)
        for index, (asset, _, _, _, _, _) in enumerate(selected):
            with Image.open(directory / f"{asset.asset}.png") as image:
                image.thumbnail((cell_width - 18, cell_height - 48), Image.Resampling.LANCZOS)
                x = index % columns * cell_width + (cell_width - image.width) // 2
                y = index // columns * cell_height + 4
                sheet.paste(image, (x, y), image)
            draw.text((index % columns * cell_width + 8,
                       index // columns * cell_height + cell_height - 36),
                      asset.asset, fill="white")
        sheet.save(directory / f"review-{category}-dark.png")
    print(f"{len(rows)} reviewed-parameter exports prepared in {directory}.")


def intake(apply: bool = False, remove_incoming: bool = False, regenerate: bool = False) -> None:
    if remove_incoming and not apply:
        raise ValueError("Moving root originals requires --apply.")
    rows, text = plan(regenerate)
    for asset, source, incoming, output, record, previous_bytes in rows:
        if apply:
            asset.source.parent.mkdir(parents=True, exist_ok=True)
            if not asset.source.exists():
                shutil.copyfile(source, asset.source)
            if asset.category == "characters":
                historical = ROOT / record["previous_runtime"].replace("\\", "/")
                historical.parent.mkdir(parents=True, exist_ok=True)
                if not historical.exists():
                    historical.write_bytes(previous_bytes)
                if digest(historical) != record["previous_runtime_sha256"]:
                    raise ValueError(f"Previous character export differs from provenance: {historical}")
            elif previous_bytes is not None:
                historical = ROOT / record["previous_runtime"].replace("\\", "/")
                historical.parent.mkdir(parents=True, exist_ok=True)
                if historical.exists() and digest(historical) != record["previous_runtime_sha256"]:
                    raise FileExistsError(f"Conflicting previous Conduit export: {historical}")
                if not historical.exists():
                    historical.write_bytes(previous_bytes)
                if digest(historical) != record["previous_runtime_sha256"]:
                    raise ValueError(f"Previous Conduit export differs from provenance: {historical}")
            asset.runtime.parent.mkdir(parents=True, exist_ok=True)
            if not asset.runtime.exists() or asset.runtime.read_bytes() != output:
                asset.runtime.write_bytes(output)
            if digest(asset.source) != record["source_sha256"] or \
                    digest(asset.runtime) != record["runtime_sha256"]:
                raise ValueError(f"Installed art differs from its planned provenance: {asset.runtime}")
        print(f"{asset.incoming} -> {record['source']} -> {record['runtime']}")

    if apply:
        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST.write_text(text, encoding="utf-8")
        from character_art_revisions import write_revisions as write_character_revisions
        from conduit_art_revisions import write_revisions as write_conduit_revisions

        write_character_revisions()
        write_conduit_revisions()
        for asset, _, incoming, _, record, _ in rows:
            if remove_incoming and incoming.exists():
                if digest(incoming) != record["source_sha256"] or \
                        digest(asset.source) != record["source_sha256"]:
                    raise ValueError(f"Root original changed before removal: {incoming}")
                incoming.unlink()
    print(f"{len(rows)} assets {'installed' if apply else 'validated (dry run)'}"
          f"{' and moved from root' if apply and remove_incoming else ''}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Archive sources and install reviewed exports.")
    parser.add_argument("--remove-incoming", action="store_true", help="Remove root copies after verified archival.")
    parser.add_argument("--regenerate", action="store_true",
                        help="Install a revised, reviewed export while archiving the prior Conduit bytes.")
    parser.add_argument("--review", type=Path, help="Write dark contact sheets and individual review exports.")
    args = parser.parse_args()
    if args.review:
        if args.regenerate:
            parser.error("Review does not install or revise assets.")
        review(args.review)
    else:
        intake(args.apply, args.remove_incoming, args.regenerate)
