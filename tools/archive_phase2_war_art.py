"""Archive 24 owner-supplied portraits; preserve later reviewed intake status."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import shutil

from PIL import Image

from build_phase2_war_art import MANIFEST, ROOT, source_rows


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def archive(root=ROOT):
    manifest_path = root / MANIFEST.relative_to(ROOT)
    intake_path = root / "Art" / "provenance" / "phase2-war-art-intake.json"
    installed = json.loads(intake_path.read_text(encoding="utf-8")) if intake_path.exists() else None
    exports = {row["source"]: row for row in installed["assets"]} if installed else {}
    records = []
    pending = []
    for row in source_rows():
        original = root / row["original_filename"]
        archived = root / row["archive"]
        source = original if original.exists() else archived
        if not source.is_file():
            raise FileNotFoundError(f"Missing original and archive: {row['original_filename']}")
        source_hash = digest(source)
        if archived.exists() and digest(archived) != source_hash:
            raise ValueError(f"Archive differs from supplied original: {archived}")
        with Image.open(source) as image:
            width, height = image.size
            mode = image.mode
        export = exports.get(row["archive"])
        if export and export["source_sha256"] != source_hash:
            raise ValueError(f"Installed intake differs from archived source: {archived}")
        records.append({
            **row, "sha256": source_hash, "width": width, "height": height, "mode": mode,
            "processing": "Exact original bytes; no key removal, resize, color edits or re-encoding.",
            "intake_status": ("Reviewed runtime export installed; original bytes retained."
                              if export else "Source archived; no runtime export installed."),
            **({"runtime": export["runtime"], "runtime_sha256": export["runtime_sha256"]}
               if export else {}),
        })
        pending.append((source, archived, source_hash))
    for source, archived, source_hash in pending:
        if not archived.exists():
            archived.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, archived)
        if digest(archived) != source_hash:
            raise ValueError(f"Archive verification failed: {archived}")
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps({
        "scope": "Four reclaimed Elemental War identities, not Moon roster replacement.",
        "originals_retained": True, "runtime_exported": bool(installed),
        "root_originals_removed": all(not (root / row["original_filename"]).exists() for row in records),
        "portrait_count": len(records), "records": records,
    }, indent=2) + "\n", encoding="utf-8")
    return records


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", action="store_true", required=True,
                        help="Copy exact supplied source bytes and write verified provenance.")
    parser.parse_args()
    rows = archive()
    print(f"Archived and hash-verified {len(rows)} portraits; exact originals retained in source library.")
