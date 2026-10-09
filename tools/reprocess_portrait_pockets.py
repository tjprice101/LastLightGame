"""Review then explicitly install scoped corrections with hash-verified history."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path

from PIL import Image

import intake_character_refresh as characters
import intake_starter_refresh as starters
from prepare_art import ROOT


def plan(assets):
    if not assets or len(set(assets)) != len(assets):
        raise ValueError("Select distinct portrait IDs explicitly.")
    planned = []
    manifests = {}
    for module in (characters, starters):
        document = json.loads(module.MANIFEST.read_text(encoding="utf-8"))
        settings = module.load_settings()
        manifests[module.MANIFEST] = document
        for row in document["assets"]:
            asset = row["asset"]
            if asset not in assets:
                continue
            for key in ("source", "runtime", "previous_runtime"):
                if characters.digest(ROOT / row[key]) != row[f"{key}_sha256"]:
                    raise FileExistsError(f"Portrait changed since intake: {row[key]}")
            for previous in row.get("processing_history", []):
                if characters.digest(ROOT / previous["runtime"]) != previous["runtime_sha256"]:
                    raise FileExistsError(f"Correction history changed: {previous['runtime']}")
            output = module.prepare(ROOT / row["source"], settings[asset])
            if isinstance(output, Image.Image):
                buffer = BytesIO()
                output.save(buffer, format="PNG", optimize=True)
                output = buffer.getvalue()
            output_hash = sha256(output).hexdigest()
            if output_hash == row["runtime_sha256"]:
                raise ValueError(f"No image correction to review: {asset}")
            backup = (ROOT / row["source"]).parent / "corrections" / f"{asset}-{row['runtime_sha256']}.png"
            if backup.exists() and characters.digest(backup) != row["runtime_sha256"]:
                raise FileExistsError(f"Conflicting correction backup: {backup}")
            record = {"asset": asset, "manifest": str(module.MANIFEST.relative_to(ROOT)),
                      "before": row, "processing": settings[asset], "runtime_sha256": output_hash,
                      "backup": str(backup.relative_to(ROOT))}
            planned.append((record, output))
    if {row["asset"] for row, _ in planned} != set(assets):
        raise ValueError("Unknown portrait ID in correction selection.")
    planned.sort(key=lambda entry: entry[0]["asset"])
    return planned, manifests


def reprocess(assets, review, apply=False):
    planned, manifests = plan(assets)
    records = [row for row, _ in planned]
    review_plan = review / "plan.json"
    if not apply:
        if review_plan.exists():
            raise FileExistsError("Use a new review directory; do not overwrite an approved plan.")
        review.mkdir(parents=True, exist_ok=True)
        for row, output in planned:
            (review / f"{row['asset']}.png").write_bytes(output)
            with Image.open(BytesIO(output)) as image:
                for color, label in (("#292934", "dark"), ("#eeeeee", "light")):
                    preview = Image.new("RGBA", image.size, color)
                    preview.alpha_composite(image)
                    preview.convert("RGB").save(review / f"{row['asset']}-{label}.png")
        review_plan.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
        print(f"{len(records)} correction candidates ready for visual review; nothing installed.")
        return
    if json.loads(review_plan.read_text(encoding="utf-8")) != records:
        raise FileExistsError("Source, runtime, settings or provenance changed after review.")
    for row, output in planned:
        if (review / f"{row['asset']}.png").read_bytes() != output:
            raise FileExistsError(f"Reviewed candidate changed: {row['asset']}")
    for row, output in planned:
        before = row["before"]
        runtime = ROOT / before["runtime"]
        backup = ROOT / row["backup"]
        backup.parent.mkdir(parents=True, exist_ok=True)
        if not backup.exists():
            backup.write_bytes(runtime.read_bytes())
        runtime.write_bytes(output)
        if characters.digest(runtime) != row["runtime_sha256"]:
            raise ValueError(f"Installed correction differs: {row['asset']}")
        document = manifests[ROOT / row["manifest"]]
        record = next(entry for entry in document["assets"] if entry["asset"] == row["asset"])
        record.setdefault("processing_history", []).append({
            "runtime": row["backup"], "runtime_sha256": before["runtime_sha256"],
            "processing": before["processing"]})
        record["processing"] = row["processing"]
        record["runtime_sha256"] = row["runtime_sha256"]
    for path, document in manifests.items():
        if any(row["manifest"] == str(path.relative_to(ROOT)) for row in records):
            path.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")
    from character_art_revisions import write_revisions
    write_revisions()
    print(f"{len(records)} reviewed corrections installed; prior exports preserved and URLs revised.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--assets", nargs="+", required=True)
    parser.add_argument("--review", type=Path, required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    reprocess(args.assets, args.review, args.apply)
