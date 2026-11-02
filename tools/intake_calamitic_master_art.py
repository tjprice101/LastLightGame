"""Archive and reproduce the nine owner-delivered Calamitic Master icons (D-448)."""
import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw

from build_calamitic_art import MASTERS
from intake_master_conduit_art import prepare
from master_conduit_art_revisions import OUTPUT, revision_source
from prepare_art import ROOT

SETTINGS = ROOT / "Art" / "provenance" / "calamitic-master-art-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "calamitic-master-art-intake.json"


def assets(root=ROOT):
    return [(asset, f"{name}.png",
             root / "Art" / "source" / "master-conduits" / "calamitic" / f"{name}.png",
             root / "public" / "assets" / "master-conduits" / f"{asset}.png")
            for asset, name, _, _ in MASTERS]


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def preflight(root=ROOT):
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    if set(settings) != {asset for asset, *_ in assets(root)}:
        raise ValueError("Settings must cover exactly nine Calamitic Masters.")
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else None
    records = {row["asset"]: row for row in previous["assets"]} if previous else {}
    if previous and set(records) != set(settings):
        raise ValueError("Existing manifest coverage differs from this delivery.")
    planned = []
    for asset, filename, archived, runtime in assets(root):
        config = settings[asset]
        if not config.get("review") or not config.get("keys") or config.get("border_only") is not True:
            raise ValueError(f"Unreviewed source settings: {asset}")
        incoming = root / filename
        source = incoming if incoming.is_file() else archived
        if not source.is_file():
            raise FileNotFoundError(source)
        source_hash = digest(source)
        if archived.exists() and digest(archived) != source_hash:
            raise FileExistsError(f"Conflicting archived original: {archived}")
        old = records.get(asset)
        if old and old["source_sha256"] != source_hash:
            raise ValueError(f"Source bytes changed: {asset}")
        if runtime.exists() and (not old or digest(runtime) != old["runtime_sha256"]):
            raise FileExistsError(f"Untracked or changed runtime: {runtime}")
        output, metadata = prepare(source, config)
        record = {"asset": asset, "incoming": filename,
                  "source": archived.relative_to(root).as_posix(), "source_sha256": source_hash,
                  "runtime": runtime.relative_to(root).as_posix(),
                  "runtime_sha256": sha256(output).hexdigest(), **metadata, "settings": config}
        planned.append((source, archived, runtime, output, record))
    return planned


def review(directory, planned):
    directory.mkdir(parents=True, exist_ok=True)
    for background, color in (("dark", "#24242b"), ("light", "#eeeeee")):
        sheet = Image.new("RGB", (900, 930), color)
        draw = ImageDraw.Draw(sheet)
        for index, (_, _, _, output, record) in enumerate(planned):
            cutout = Image.open(BytesIO(output)).convert("RGBA")
            x, y = index % 3 * 300, index // 3 * 310
            sheet.paste(cutout, (x + 22, y), cutout)
            draw.text((x + 8, y + 270), record["asset"], fill="white" if background == "dark" else "black")
            enlarged = Image.new("RGBA", (256, 256), color)
            enlarged.alpha_composite(cutout)
            enlarged.resize((768, 768)).convert("RGB").save(directory / f"{record['asset']}-{background}.png")
        sheet.save(directory / f"review-{background}.png")


def intake(apply=False, reviewed=False, directory=None):
    planned = preflight()
    if directory:
        review(directory, planned)
    if not apply:
        print(f"Prepared {len(planned)} Calamitic Master cutouts for review.")
        return
    if not reviewed:
        raise ValueError("Installation requires --reviewed after dark/light inspection.")
    for source, archived, runtime, output, record in planned:
        archived.parent.mkdir(parents=True, exist_ok=True)
        if not archived.exists():
            shutil.copyfile(source, archived)
        if digest(archived) != record["source_sha256"]:
            raise RuntimeError(f"Archive verification failed: {archived}")
        runtime.write_bytes(output)
    MANIFEST.write_text(json.dumps({"decision": "D-448", "asset_count": 9,
                                   "assets": [row[-1] for row in planned]}, indent=2) + "\n", encoding="utf-8")
    OUTPUT.write_text(revision_source(), encoding="utf-8")
    for _, archived, runtime, _, record in planned:
        if digest(archived) != record["source_sha256"] or digest(runtime) != record["runtime_sha256"]:
            raise RuntimeError("Archive/export verification failed; root originals retained.")
    for _, _, _, _, record in planned:
        incoming = ROOT / record["incoming"]
        if incoming.exists():
            incoming.unlink()
    print("Installed nine Calamitic Masters; verified archives, exports and shared revisions.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--reviewed", action="store_true")
    parser.add_argument("--review", type=Path)
    args = parser.parse_args()
    intake(args.apply, args.reviewed, args.review)
