"""Archive and reproduce reviewed Calamity cutouts and intact tier arenas."""
import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw

from intake_status_art import clean
from prepare_art import ROOT, standardize_sprite

SETTINGS = ROOT / "Art" / "provenance" / "calamity-art-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "calamity-art-intake.json"
REVISIONS = ROOT / "src" / "content" / "calamity-art-revisions.ts"
BOSSES = (
    ("treasury", "Crown of the Ruined Vault"),
    ("sanctuary", "White Pyre Hierophant"),
    ("heavens", "Heavenfall Seraph"),
    ("abyss", "Abyssal Nullmaw"),
    ("machines", "Catastrophe Prime"),
    ("roses", "The Last Scarlet Bloom"),
    ("infernic", "Ashcrown Cataclysm"),
    ("oceanic", "Leviathan of the White Wake"),
    ("atmospheric", "Riftstorm Harbinger"),
    ("botanic", "Pallid Root Sovereign"),
    ("tranquilitic", "Silent Meridian"),
    ("chaotic", "The Scarlet Unmaking"),
)
REPLACEMENTS = {"calamity-boss-sanctuary", "calamity-boss-heavens"}


def assets(root=ROOT):
    rows = [(f"calamity-boss-{activity}", f"{name}.png", "enemies") for activity, name in BOSSES]
    rows += [(f"calamity-chest-{tier.lower()}", f"EX+{tier} Chest.png", "items")
             for tier in ("Slayer", "Master", "Omnipotent")]
    rows += [(f"calamity-arena-ex-{tier}", f"EX+{tier} Battle Arena.png", "backgrounds")
             for tier in (1, 2, 3)]
    return [(asset, incoming, category, root / "Art" / "source" / "calamity" /
             (Path("replacements") / incoming if asset in REPLACEMENTS else Path(incoming)),
             root / "public" / "assets" / category / f"{asset}.png")
            for asset, incoming, category in rows]


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def prepare(source, settings, category):
    with Image.open(source) as image:
        image.load()
        alpha = image.convert("RGBA").getextrema()[3][0] < 255
        if category == "backgrounds":
            if alpha:
                raise ValueError(f"Arena has unexpected transparency: {source}")
            output = image.convert("RGB")
        else:
            output = standardize_sprite(clean(image, settings), 960 if category == "enemies" else 256,
                                        864 if category == "enemies" else 224)
            if not output.getbbox():
                raise ValueError(f"Empty Calamity export: {source}")
        buffer = BytesIO()
        output.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue(), {
            "source_mode": image.mode, "source_dimensions": list(image.size),
            "source_alpha_authoritative": alpha,
            "processing": "opaque original-size scenery" if category == "backgrounds" else
                          "supplied alpha; trim/resize/pad only" if alpha else
                          "reviewed connected row-gradient key, enclosed seeds and edge decontamination",
            "runtime_dimensions": list(output.size), "runtime_content_bbox": list(output.getbbox()),
            "runtime_pixel_sha256": sha256(output.tobytes()).hexdigest(),
        }


def preflight(root=ROOT, replacements=()):
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    rows = assets(root)
    if set(settings) != {row[0] for row in rows}:
        raise ValueError(f"Settings must cover exactly the {len(rows)} delivered Calamity assets.")
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    old_records = {row["asset"]: row for row in previous.get("assets", [])}
    planned = []
    for asset, incoming, category, archived, runtime in rows:
        source = root / incoming if (root / incoming).is_file() else archived
        if not source.is_file():
            raise FileNotFoundError(source)
        source_hash = digest(source)
        if archived.exists() and digest(archived) != source_hash:
            raise FileExistsError(f"Conflicting archived original: {archived}")
        old = old_records.get(asset)
        replacing = bool(old and old["source_sha256"] != source_hash)
        if replacing and asset not in replacements:
            raise FileExistsError(f"Calamity source changed: {asset}")
        if replacing and (not runtime.is_file() or digest(root / old["source"]) != old["source_sha256"]):
            raise FileExistsError(f"Missing or changed previous Calamity source/export: {asset}")
        if runtime.exists() and (not old or digest(runtime) != old["runtime_sha256"]):
            raise FileExistsError(f"Untracked or changed runtime: {runtime}")
        entry = settings[asset]
        if category != "backgrounds" and not (entry.get("review") and entry.get("border_only")
                                               and "background_seeds" in entry):
            raise ValueError(f"Missing reviewed cutout settings: {asset}")
        output, metadata = prepare(source, entry, category)
        record = {"asset": asset, "incoming": incoming, "category": category,
                  "source": str(archived.relative_to(root)), "source_sha256": source_hash,
                  "runtime": str(runtime.relative_to(root)), "runtime_sha256": sha256(output).hexdigest(),
                  **metadata, "settings": entry}
        if old and old.get("previous_exports"):
            record["previous_exports"] = old["previous_exports"]
        if replacing:
            historical = dict(old)
            historical.pop("previous_exports", None)
            historical["runtime"] = str(
                Path("Art") / "source" / "calamity" / "previous-runtime" /
                f"{asset}-{old['runtime_sha256'][:12]}.png")
            history_path = root / historical["runtime"]
            if history_path.exists() and digest(history_path) != old["runtime_sha256"]:
                raise FileExistsError(f"Conflicting previous Calamity export: {history_path}")
            record["previous_exports"] = [*record.get("previous_exports", []), historical]
        planned.append((source, archived, runtime, output, record))
    return planned


def review(directory, replacements=()):
    directory.mkdir(parents=True, exist_ok=True)
    planned = preflight(replacements=replacements)
    cutouts = [row for row in planned if row[-1]["category"] != "backgrounds"]
    for background, color in (("dark", "#24242b"), ("light", "#f5f5f5")):
        for start in range(0, len(cutouts), 6):
            sheet = Image.new("RGB", (1500, 1020), color)
            draw = ImageDraw.Draw(sheet)
            for index, (source, _, _, output, record) in enumerate(cutouts[start:start + 6]):
                with Image.open(BytesIO(output)) as image:
                    image.thumbnail((480, 460))
                    x, y = index % 3 * 500, index // 3 * 510
                    sheet.paste(image, (x + (500 - image.width) // 2, y), image)
                    draw.text((x + 6, y + 475), record["asset"],
                              fill="white" if background == "dark" else "black")
                with Image.open(source) as original:
                    processed = clean(original, record["settings"])
                    composite = Image.new("RGB", original.size, color)
                    composite.paste(processed, (0, 0), processed)
                    composite.save(directory / f"{record['asset']}-{background}-source.png")
            sheet.save(directory / f"review-{background}-{start // 6 + 1}.png")


def write_revisions(planned):
    lines = ["// Generated by tools/intake_calamity_art.py from installed PNG bytes.",
             "export const calamityArtRevisions: Readonly<Record<string, string>> = {"]
    for _, _, _, output, record in planned:
        path = f"{record['category']}/{record['asset']}.png"
        lines.append(f"  '{path}': '{sha256(output).hexdigest()[:12]}',")
    REVISIONS.write_text("\n".join([*lines, "};", ""]), encoding="utf-8")


def intake(apply=False, replacements=()):
    planned = preflight(replacements=replacements)
    if apply:
        for source, archived, runtime, output, record in planned:
            for historical in record.get("previous_exports", []):
                history_path = ROOT / historical["runtime"]
                if not history_path.exists():
                    if digest(runtime) != historical["runtime_sha256"]:
                        raise ValueError(f"Previous export verification failed: {runtime}")
                    history_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(runtime, history_path)
                if digest(history_path) != historical["runtime_sha256"]:
                    raise ValueError(f"Previous export archive changed: {history_path}")
            archived.parent.mkdir(parents=True, exist_ok=True)
            runtime.parent.mkdir(parents=True, exist_ok=True)
            if not archived.exists():
                shutil.copyfile(source, archived)
            if digest(archived) != record["source_sha256"]:
                raise ValueError(f"Archive verification failed: {archived}")
            runtime.write_bytes(output)
            if digest(runtime) != record["runtime_sha256"]:
                raise ValueError(f"Export verification failed: {runtime}")
        MANIFEST.write_text(json.dumps({
            "asset_count": len(planned), "missing_bosses": [],
            "assets": [row[-1] for row in planned],
        }, indent=2) + "\n", encoding="utf-8")
        write_revisions(planned)
    print(f"{len(planned)} Calamity assets {'installed' if apply else 'validated (dry run)'}. Archived originals preserved; intake does not delete root copies.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--review", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--replace", nargs="+", choices=sorted(REPLACEMENTS), default=[])
    args = parser.parse_args()
    if args.review:
        review(args.review, args.replace)
    else:
        intake(args.apply, args.replace)
