"""Review and install the four approved D-157 root art deliveries."""

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


MANIFEST = art_path("d157-root-art-intake.json", root=ROOT)
CURRENCY_MANIFEST = art_path("prism-currency-intake.json", root=ROOT)
SOURCE_ROOT = ROOT / "Art" / "source"
ASSET_SETTINGS = {
    "universal-normal-attack": {
        "keys": [
            [183, 227, 15], [182, 227, 12], [210, 237, 65], [209, 236, 64],
            [189, 212, 51], [215, 205, 85], [185, 206, 54], [216, 223, 102],
            [180, 222, 13], [152, 202, 9], [175, 218, 19], [153, 200, 10],
            [165, 212, 7], [166, 213, 6], [179, 219, 46],
            [183, 218, 26], [181, 206, 54], [182, 226, 15], [210, 236, 65],
        ],
        "radius": 12,
        "border_only": True,
        "background_seeds": [[0.597, 0.13]],
        "edge_cleanup": {"source_pixels": 2, "distance_ramp": 60},
    },
    "universal-defense": {
        "keys": [[143, 198, 173]],
        "radius": 12,
        "border_only": True,
        "edge_cleanup": {"source_pixels": 2, "distance_ramp": 60},
    },
    "fractalis": {
        "keys": [
            [73, 219, 129], [86, 206, 143], [95, 197, 142], [96, 203, 144],
            [94, 202, 139], [70, 220, 131], [66, 213, 123],
            [93, 219, 132], [87, 220, 130], [111, 217, 126], [118, 221, 131],
            [106, 217, 121], [108, 225, 144], [104, 217, 124], [107, 226, 144],
            [100, 224, 146], [95, 224, 140],
        ],
        "radius": 12,
        "border_only": True,
        "edge_cleanup": {"source_pixels": 2, "distance_ramp": 60},
    },
    "lycalis": {
        "keys": [
            [153, 228, 175], [161, 223, 181], [169, 222, 182], [167, 224, 183],
            [152, 228, 176], [154, 229, 174],
        ],
        "radius": 12,
        "border_only": True,
        "edge_cleanup": {"source_pixels": 2, "distance_ramp": 60},
    },
}


@dataclass(frozen=True)
class Asset:
    incoming: str
    asset: str
    category: str
    source: Path
    runtime: Path
    previous_runtime: Path | None = None


def digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest()


def assets() -> list[Asset]:
    mappings = [
        Asset(
            "Normal Attack - Steel Sword Sweep.png", "universal-normal-attack", "abilities",
            SOURCE_ROOT / "abilities" / "universal" / "D-157" / "normal-attack.png",
            ROOT / "public" / "assets" / "abilities" / "universal-normal-attack.png",
        ),
        Asset(
            "Defense - Steel Shield.png", "universal-defense", "abilities",
            SOURCE_ROOT / "abilities" / "universal" / "D-157" / "defense.png",
            ROOT / "public" / "assets" / "abilities" / "universal-defense.png",
        ),
        Asset(
            "Prismatica - Main currency.png", "fractalis", "currencies",
            SOURCE_ROOT / "currencies" / "D-157" / "Prismatica.png",
            ROOT / "public" / "assets" / "currencies" / "fractalis.png",
            SOURCE_ROOT / "currencies" / "previous-runtime" / "D-157" / "fractalis.png",
        ),
        Asset(
            "Null-Prismatica - Premium currencyNull-Prismatica - Premium currency.png",
            "lycalis", "currencies",
            SOURCE_ROOT / "currencies" / "D-157" / "Null-Prismatica.png",
            ROOT / "public" / "assets" / "currencies" / "lycalis.png",
            SOURCE_ROOT / "currencies" / "previous-runtime" / "D-157" / "lycalis.png",
        ),
    ]
    if len({asset.incoming for asset in mappings}) != 4 or \
            len({asset.asset for asset in mappings}) != 4 or set(ASSET_SETTINGS) != {
                asset.asset for asset in mappings}:
        raise ValueError("D-157 source names and reviewed settings must map exactly four unique assets.")
    return mappings


def source_for(asset: Asset) -> Path:
    incoming = ROOT / asset.incoming
    if incoming.is_file():
        if asset.source.is_file() and digest(incoming) != digest(asset.source):
            raise FileExistsError(f"Incoming image conflicts with its archived original: {asset.source}")
        return incoming
    if asset.source.is_file():
        return asset.source
    raise FileNotFoundError(f"Missing D-157 source: {incoming}")


def prepare(source: Path, asset: Asset, size: int = 256, content: int = 224) -> tuple[bytes, dict[str, object]]:
    settings = ASSET_SETTINGS[asset.asset]
    with Image.open(source) as image:
        mode = image.mode
        dimensions = list(image.size)
        supplied_alpha = "A" in image.getbands() and image.getchannel("A").getextrema()[0] < 255
        if supplied_alpha:
            processed = image.convert("RGBA")
            processing = {"method": "supplied alpha; trim, resize, and pad only"}
        else:
            if image.mode != "RGB":
                raise ValueError(f"Expected RGB or transparent-alpha PNG: {source}")
            processed = clean(image, settings)
            processing = {"method": "individually reviewed border-connected RGB key", **settings}
        output = standardize_sprite(processed, size, content)
        buffer = BytesIO()
        output.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue(), {
        "source_mode": mode,
        "source_dimensions": dimensions,
        "processing": processing,
    }


def _old_currency_records() -> tuple[dict, dict[str, dict]]:
    if not CURRENCY_MANIFEST.is_file():
        raise FileNotFoundError(f"Existing D-142 currency provenance is missing: {CURRENCY_MANIFEST}")
    old = json.loads(CURRENCY_MANIFEST.read_text(encoding="utf-8"))
    records = {record["asset"]: record for record in old["assets"]}
    if set(records) != {"fractalis", "lycalis"}:
        raise ValueError("Existing currency provenance does not contain both historical currency records.")
    return old, records


def plan():
    old_intake, old_currency = _old_currency_records()
    existing = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else None
    old_records = {record["asset"]: record for record in existing["assets"]} if existing else {}
    if existing and (existing.get("asset_count") != 4 or set(old_records) != set(ASSET_SETTINGS)):
        raise ValueError("Existing D-157 provenance does not match the four reviewed source mappings.")
    rows = []
    updated_currency = json.loads(json.dumps(old_intake))
    updated_by_id = {record["asset"]: record for record in updated_currency["assets"]}

    for asset in assets():
        source = source_for(asset)
        output, metadata = prepare(source, asset)
        source_hash = digest(source)
        old_record = old_records.get(asset.asset)
        if old_record and old_record["source_sha256"] != source_hash:
            raise FileExistsError(f"Archived D-157 source changed: {asset.source}")
        if asset.category == "currencies":
            previous = asset.previous_runtime
            if previous is None:
                raise ValueError("Currency replacement must preserve the previous runtime export.")
            previous_record = old_currency[asset.asset]
            previous_hash = previous_record["runtime_sha256"]
            if not previous.is_file() and not old_record and not asset.runtime.is_file():
                raise FileNotFoundError(f"Previous currency runtime is missing: {asset.runtime}")
            if previous.is_file() and digest(previous) != previous_hash:
                raise FileExistsError(f"Preserved D-142 currency export differs: {previous}")
            if old_record:
                if old_record["previous_runtime_sha256"] != previous_hash:
                    raise FileExistsError(f"Recorded prior currency export changed: {asset.asset}")
                if asset.runtime.is_file() and digest(asset.runtime) != old_record["runtime_sha256"]:
                    raise FileExistsError(f"Current currency export changed since D-157 intake: {asset.runtime}")
            elif asset.runtime.is_file() and digest(asset.runtime) != previous_hash:
                raise FileExistsError(f"Unrecorded currency runtime differs from D-142: {asset.runtime}")
            previous_path = str(previous.relative_to(ROOT)).replace("/", "\\")
            prior_record = updated_by_id[asset.asset]
            if old_record:
                if prior_record["runtime"] != previous_path:
                    raise FileExistsError(f"D-142 provenance was modified after D-157 intake: {asset.asset}")
            elif prior_record["runtime_sha256"] != previous_hash:
                raise FileExistsError(f"D-142 runtime hash changed before D-157 intake: {asset.asset}")
            prior_record["runtime"] = previous_path
            record = {
                "incoming": asset.incoming,
                "asset": asset.asset,
                "category": asset.category,
                "source": str(asset.source.relative_to(ROOT)).replace("/", "\\"),
                "source_sha256": source_hash,
                "runtime": str(asset.runtime.relative_to(ROOT)).replace("/", "\\"),
                "runtime_sha256": sha256(output).hexdigest(),
                "previous_runtime": previous_path,
                "previous_runtime_sha256": previous_hash,
                **metadata,
            }
        else:
            if old_record:
                if asset.runtime.is_file() and digest(asset.runtime) != old_record["runtime_sha256"]:
                    raise FileExistsError(f"Universal ability export changed since D-157 intake: {asset.runtime}")
            elif asset.runtime.exists():
                raise FileExistsError(f"Refusing to overwrite an unrecorded universal ability icon: {asset.runtime}")
            record = {
                "incoming": asset.incoming,
                "asset": asset.asset,
                "category": asset.category,
                "source": str(asset.source.relative_to(ROOT)).replace("/", "\\"),
                "source_sha256": source_hash,
                "runtime": str(asset.runtime.relative_to(ROOT)).replace("/", "\\"),
                "runtime_sha256": sha256(output).hexdigest(),
                "previous_runtime": None,
                "previous_runtime_sha256": None,
                **metadata,
            }
        if old_record and old_record != record:
            raise FileExistsError(f"Recorded D-157 source or processing settings changed: {asset.asset}")
        rows.append((asset, source, output, record))

    manifest_data = {"decision": "D-157", "asset_count": len(rows),
                     "assets": [row[3] for row in rows]}
    manifest_text = json.dumps(manifest_data, indent=2, ensure_ascii=False) + "\n"
    old_currency_text = json.dumps(updated_currency, indent=2, ensure_ascii=False) + "\n"
    if existing and MANIFEST.read_text(encoding="utf-8") != manifest_text:
        raise FileExistsError("D-157 provenance differs from the existing reviewed intake.")
    return rows, manifest_text, old_currency_text


def review(directory: Path) -> None:
    rows, _, _ = plan()
    directory.mkdir(parents=True, exist_ok=True)
    dark = Image.new("RGB", (512, 512), "#222229")
    light = Image.new("RGB", (512, 512), "#eeeeee")
    draw_dark, draw_light = ImageDraw.Draw(dark), ImageDraw.Draw(light)
    for index, (asset, _, output, _) in enumerate(rows):
        path = directory / f"{asset.asset}.png"
        path.write_bytes(output)
        with Image.open(path) as image:
            dark.paste(image, (index % 2 * 256, index // 2 * 256), image)
            light.paste(image, (index % 2 * 256, index // 2 * 256), image)
        x, y = index % 2 * 256 + 6, index // 2 * 256 + 6
        draw_dark.text((x, y), asset.asset, fill="white", stroke_width=2, stroke_fill="#222229")
        draw_light.text((x, y), asset.asset, fill="black", stroke_width=2, stroke_fill="#eeeeee")
    dark.save(directory / "review-dark.png")
    light.save(directory / "review-light.png")
    print(f"{len(rows)} reviewed-parameter D-157 exports prepared in {directory}.")


def intake(apply: bool = False, remove_incoming: bool = False) -> None:
    if remove_incoming and not apply:
        raise ValueError("Moving root originals requires --apply after reviewed installation.")
    rows, manifest_text, old_currency_text = plan()
    if apply:
        for asset, source, output, record in rows:
            asset.source.parent.mkdir(parents=True, exist_ok=True)
            if not asset.source.exists():
                shutil.copyfile(source, asset.source)
            if digest(asset.source) != record["source_sha256"]:
                raise ValueError(f"Archived source bytes differ: {asset.source}")
            if asset.previous_runtime and not asset.previous_runtime.exists():
                asset.previous_runtime.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(asset.runtime, asset.previous_runtime)
            if asset.previous_runtime and digest(asset.previous_runtime) != record["previous_runtime_sha256"]:
                raise ValueError(f"Preserved previous runtime differs: {asset.previous_runtime}")
            asset.runtime.parent.mkdir(parents=True, exist_ok=True)
            asset.runtime.write_bytes(output)
            if digest(asset.runtime) != record["runtime_sha256"]:
                raise ValueError(f"Installed D-157 export differs: {asset.runtime}")

        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST.write_text(manifest_text, encoding="utf-8")
        CURRENCY_MANIFEST.write_text(old_currency_text, encoding="utf-8")

        from ability_art_revisions import write_revisions as write_ability_revisions
        write_ability_revisions()
        from intake_prism_currency_art import write_revisions as write_currency_revisions
        write_currency_revisions()

        for asset, _, _, record in rows:
            if digest(asset.source) != record["source_sha256"] or \
                    digest(asset.runtime) != record["runtime_sha256"]:
                raise ValueError(f"Final D-157 verification failed: {asset.asset}")
        if remove_incoming:
            for asset, _, _, record in rows:
                incoming = ROOT / asset.incoming
                if incoming.exists():
                    if digest(incoming) != record["source_sha256"] or \
                            digest(asset.source) != record["source_sha256"]:
                        raise ValueError(f"Root original changed before removal: {incoming}")
                    incoming.unlink()
    for asset, _, _, record in rows:
        print(f"{asset.incoming} -> {record['source']} -> {record['runtime']}")
    print(f"{len(rows)} D-157 assets {'installed' if apply else 'validated (dry run)'}"
          f"{' and moved from root' if apply and remove_incoming else ''}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Archive originals and install reviewed exports.")
    parser.add_argument("--remove-incoming", action="store_true", help="Remove only verified root originals.")
    parser.add_argument("--review", type=Path, help="Write four exports and light/dark contact sheets.")
    args = parser.parse_args()
    if args.review:
        review(args.review)
    else:
        intake(args.apply, args.remove_incoming)
