"""D-441: archive, key and install the delivered Phase 0 Calamity artwork.

Covers the Calamitic Element-Bearer portraits, ability/status icons, Phase 0
Calamitic Conduits, Calamitic materials, the Rise-blessed emblem and the Gates
of Oblivion enemies/header/arena. Originals are preserved byte-for-byte under
Art/source/calamity-phase0; reviewed per-image key settings live in
Art/provenance/calamity-phase0-settings.json. Nothing is keyed at runtime.
"""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

from prepare_art import ROOT, standardize_sprite

SOURCE_DIR = ROOT / "Art" / "source" / "calamity-phase0"
SETTINGS = ROOT / "Art" / "provenance" / "calamity-phase0-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "calamity-phase0-intake.json"
DASH = "\u2014"

CHARACTERS = {
    "ozriel": ("Ozriel", ["Unbroken Pane", "Warden of the Glass Nave", "Bastion of Refused Endings",
                          "Seraph of the Shattered Cathedral", "Sovereign of the Unfallen Wall",
                          "The Ending That Was Denied"],
               [f"Passive {DASH} Refusal", f"Skill 1 {DASH} Pane of Absolution",
                f"Skill 2 {DASH} Cathedral of Shards", f"Last Flare {DASH} The World Refuses"]),
    "ilvaris": ("Ilvaris", ["First Unsung Note", "Cantor of Cracked Heavens", "Choir-Seraph of the Glass Vault",
                            "Herald of the Unwritten Hymn", "Sovereign of the Severed Prophecy",
                            "The Song That Defied Fate"],
                ["Severed Prophecy", f"Skill 1 {DASH} Unwritten Verse",
                 f"Skill 2 {DASH} Hymn of Broken Glass", f"Last Flare {DASH} Tomorrow, Unwritten"]),
    "kaelith": ("Kaelith", ["Hairline Fracture", "Glass-Edged Herald", "Reaper of Written Endings",
                            "Seraph of the Broken Thread", "Sovereign of Shattered Fate",
                            "The Fate That Was Never Written"],
                [f"Passive {DASH} Reality Fault", f"Skill 1 {DASH} Shatterfall",
                 f"Skill 2 {DASH} Glass Meridian", f"Last Flare {DASH} Denial of Fate"]),
}
CONDUITS = {
    "Bulwark of the Last Horizon": "calamitic-bulwark-of-the-last-horizon",
    "Reliquary of Unending Mercy": "calamitic-reliquary-of-unending-mercy",
    "Aegis-Engine of Severed Fate": "calamitic-aegis-engine-of-severed-fate",
    "Monolith of the Unmoved Star": "calamitic-monolith-of-the-unmoved-star",
    "Heartforge of the Sunless Dawn": "calamitic-heartforge-of-the-sunless-dawn",
    "Ruinmark Censer": "calamitic-ruinmark-censer",
    "Choir-Array of Branded Stars": "calamitic-choir-array-of-branded-stars",
    "Throne of the Lone Apostate": "calamitic-throne-of-the-lone-apostate",
    "Worldbreaker Cannonade": "calamitic-worldbreaker-cannonade",
}
MATERIALS = {
    "Seed of Calamity": "calamity-common", "Bud of Calamity": "calamity-uncommon",
    "Bloom of Calamity": "calamity-rare", "Crest of Calamity": "calamity-epic",
    "Heart of Calamity": "calamity-legendary", "Soul of Calamity": "calamity-omnic",
    "Fragment of Rise": "fragment-of-rise", "Feather of the Severed Dawn": "feather-severed-dawn",
    "Splinter of the Unmade Night": "splinter-unmade-night", "Shard of Calamity": "shard-of-calamity",
}
STATUSES = {"Fault": "calamitic-fault", "Fate-seared Mark": "calamitic-fate-mark", "Refusal": "calamitic-refusal"}
ENEMIES = ("Shardling Acolyte", "Glassbound Sentry", "Oblivion Lantern-Wraith", "Fracture Hound",
           "Unmade Choir Drone", "Crimson Gearwyrm", "Husk-Seraph of Rise",
           "Annihilation Colossus Fragment", "Fatebreaker Warden", "Gatekeeper of Oblivion")


def slug(name):
    return "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-").replace("--", "-")


def assets():
    rows = []
    for asset_id, (name, titles, icons) in CHARACTERS.items():
        for index, title in enumerate(titles):
            asset = asset_id + (f"-evo-{index + 1}" if index else "")
            rows.append((f"{title}, {name}.png", "characters", f"characters/{asset}.png"))
        for incoming, action in zip(icons, ("passive", "skill1", "skill2", "ultimate")):
            rows.append((f"{incoming}.png", "icons", f"abilities/{asset_id}-{action}.png"))
    rows += [(f"{name}.png", "icons", f"abilities/statuses/status-{asset}.png") for name, asset in STATUSES.items()]
    rows += [(f"{name}.png", "icons", f"conduits/{asset}.png") for name, asset in CONDUITS.items()]
    rows += [(f"{name}.png", "icons", f"materials/{asset}.png") for name, asset in MATERIALS.items()]
    rows.append(("Rise-blessed Emblem.png", "icons", "items/rise-blessed-emblem.png"))
    rows += [(f"{name}.png", "enemies", f"enemies/oblivion-{slug(name)}.png") for name in ENEMIES]
    rows.append(("Mode header - 31.png", "banner", "banners/oblivion-banner.png"))
    rows.append(("Battle arena - 169.png", "arena", "backgrounds/oblivion-arena.png"))
    return rows


def digest(path):
    return sha256(Path(path).read_bytes()).hexdigest()


def default_settings(category):
    return {"crop": 4, "radius": 46, "ramp": 34, "enclosed_radius": 30, "enclosed_min_area": 0.0004,
            "despill": True, "seeds": [], "protect": []} if category in ("characters", "icons", "enemies") else {}


def background_key(rgb, strip):
    """Per-pixel key interpolated between the left and right border strips of each row."""
    border = np.concatenate((rgb[:strip].reshape(-1, 3), rgb[-strip:].reshape(-1, 3),
                             rgb[:, :strip].reshape(-1, 3), rgb[:, -strip:].reshape(-1, 3)))
    overall = np.median(border, axis=0)
    left = np.median(rgb[:, :strip], axis=1)
    right = np.median(rgb[:, -strip:], axis=1)
    # Rows where subject detail touches a side strip fall back to the overall border colour.
    for side in (left, right):
        side[np.sqrt(((side - overall) ** 2).sum(axis=1)) > 60] = overall
    t = np.linspace(0, 1, rgb.shape[1], dtype=np.float32)[None, :, None]
    return left[:, None, :] * (1 - t) + right[:, None, :] * t


def clean(image, settings):
    crop = settings.get("crop", 0)
    # Generated originals often carry a 1-2px off-color frame; trim it before keying.
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    if crop:
        rgb = rgb[crop:-crop, crop:-crop]
    height, width = rgb.shape[:2]
    key = background_key(rgb, settings.get("strip", 6))
    distance = np.sqrt(((rgb - key) ** 2).sum(axis=2))
    protect = Image.new("L", (width, height))
    draw = ImageDraw.Draw(protect)
    for polygon in settings.get("protect", []):
        draw.polygon([(x * width, y * height) for x, y in polygon], fill=255)
    protected = np.asarray(protect) > 0
    greenness = rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2])
    if settings.get("chroma"):
        # Very dark green/black keys sit too close to black armor for RGB distance; key by
        # green dominance (plus near-black vignette corners) instead.
        chroma = settings["chroma"]
        distance = np.where(greenness > chroma["min"], 0.0,
                            np.where(rgb.max(axis=2) < chroma["dark"], 0.0, 255.0))
        distance = np.where((distance > 0) & (greenness > 0),
                            settings["radius"] + settings["ramp"] * (1 - greenness / chroma["min"]), distance)
    eligible = (distance <= settings["radius"]) & ~protected
    labels, _ = ndimage.label(eligible)
    border = np.unique(np.concatenate((labels[0], labels[-1], labels[:, 0], labels[:, -1])))
    seeded = [labels[min(height - 1, round(y * height)), min(width - 1, round(x * width))]
              for x, y in settings.get("seeds", [])]
    matte = np.isin(labels, [label for label in [*border, *seeded] if label])
    enclosed = (distance <= settings["enclosed_radius"]) & ~protected & ~matte
    if settings.get("chroma"):
        enclosed &= greenness > settings["chroma"]["min"]
    hole_labels, count = ndimage.label(enclosed)
    if count:
        sizes = ndimage.sum(enclosed, hole_labels, range(1, count + 1))
        keep = np.flatnonzero(sizes >= settings["enclosed_min_area"] * width * height) + 1
        matte |= np.isin(hole_labels, keep)
    if settings.get("green_shadow"):
        # Reviewed only: generated cast shadows tinted by the green key read as a green blob.
        green = (rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2]) > settings["green_shadow"]) & ~protected
        shadow_labels, _ = ndimage.label(green | matte)
        matte |= green & np.isin(shadow_labels, np.unique(shadow_labels[matte]))
    alpha = np.where(matte, 0.0, 1.0)
    near = ndimage.binary_dilation(matte, iterations=3) & ~matte & ~protected
    soft = near & (distance < settings["radius"] + settings["ramp"])
    alpha[soft] = np.clip((distance[soft] - settings["radius"]) / settings["ramp"], 0.0, 1.0)
    out = rgb.copy()
    unmix = soft & (alpha > 0.02)
    a = alpha[unmix][:, None]
    out[unmix] = np.clip((rgb[unmix] - (1 - a) * key[unmix]) / a, 0, 255)
    if settings.get("despill"):
        rim = ndimage.binary_dilation(matte, iterations=6) & ~matte & ~protected
        green_key = key[..., 1] > np.maximum(key[..., 0], key[..., 2])
        spill = rim & green_key & (out[..., 1] > np.maximum(out[..., 0], out[..., 2]))
        out[spill, 1] = np.maximum(out[spill, 0], out[spill, 2])
    alpha[alpha < 0.03] = 0
    erase = Image.new("L", (width, height))
    for polygon in settings.get("erase", []):
        ImageDraw.Draw(erase).polygon([(x * width, y * height) for x, y in polygon], fill=255)
    alpha[np.asarray(erase) > 0] = 0
    rgba = np.dstack((out, alpha * 255)).round().astype(np.uint8)
    rgba[alpha == 0, :3] = 0
    return Image.fromarray(rgba, "RGBA")


def prepare(source, category, settings):
    with Image.open(source) as image:
        if category == "banner":
            if image.size != (1904, 640):
                raise ValueError(f"Unexpected header size: {source}")
            return Path(source).read_bytes(), None
        if category == "arena":
            if image.size != (1456, 816):
                raise ValueError(f"Unexpected arena size: {source}")
            return Path(source).read_bytes(), None
        cleaned = clean(image, settings)
    large = category in ("characters", "enemies")
    sprite = standardize_sprite(cleaned, 960 if large else 256, 864 if large else 224)
    buffer = BytesIO()
    sprite.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue(), sprite


def load_settings(rows):
    stored = json.loads(SETTINGS.read_text(encoding="utf-8")) if SETTINGS.exists() else {}
    merged = {runtime: {**default_settings(category), **stored.get(runtime, {})} for _, category, runtime in rows}
    return merged


def plan():
    rows = assets()
    settings = load_settings(rows)
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {"assets": []}
    prior = {row["runtime"]: row for row in previous["assets"]}
    planned = []
    for incoming, category, runtime in rows:
        archive = SOURCE_DIR / incoming
        source = ROOT / incoming if (ROOT / incoming).is_file() else archive
        if not source.is_file():
            raise FileNotFoundError(f"Missing delivered artwork: {incoming}")
        source_hash = digest(source)
        if archive.exists() and digest(archive) != source_hash:
            raise FileExistsError(f"Conflicting archived original: {archive}")
        old = prior.get(f"public/assets/{runtime}")
        if old and old["source_sha256"] != source_hash:
            raise FileExistsError(f"Delivered original changed after intake: {incoming}")
        output, sprite = prepare(source, category, settings[runtime])
        planned.append({"incoming": incoming, "category": category, "archive": archive, "source": source,
                        "runtime": ROOT / "public" / "assets" / runtime, "output": output, "sprite": sprite,
                        "record": {"incoming": incoming, "category": category,
                                   "source": archive.relative_to(ROOT).as_posix(), "source_sha256": source_hash,
                                   "runtime": f"public/assets/{runtime}",
                                   "runtime_sha256": sha256(output).hexdigest(),
                                   "settings": settings[runtime]}})
    return planned, settings


def review(directory):
    directory.mkdir(parents=True, exist_ok=True)
    planned, _ = plan()
    groups = {}
    for row in planned:
        if row["sprite"] is not None:
            groups.setdefault(row["record"]["runtime"].split("/")[2], []).append(row)
    for group, rows in groups.items():
        for label, color in (("dark", "#202028"), ("light", "#f2f2f2"), ("magenta", "#ff00ff")):
            columns = 6 if group != "characters" else 6
            cell = 300 if group in ("characters", "enemies") else 200
            sheet = Image.new("RGB", (columns * cell, (len(rows) + columns - 1) // columns * (cell + 18)), color)
            draw = ImageDraw.Draw(sheet)
            for index, row in enumerate(rows):
                image = row["sprite"].copy()
                image.thumbnail((cell, cell))
                x, y = index % columns * cell, index // columns * (cell + 18)
                sheet.paste(image, (x, y), image)
                draw.text((x + 4, y + cell + 2), Path(row["record"]["runtime"]).stem[:34],
                          fill="black" if label == "light" else "white")
            sheet.save(directory / f"{group}-{label}.png")
    print(f"Review sheets written for {sum(len(rows) for rows in groups.values())} cutouts.")


def install(remove_incoming=False):
    planned, settings = plan()
    for row in planned:
        row["archive"].parent.mkdir(parents=True, exist_ok=True)
        if not row["archive"].exists():
            shutil.copyfile(row["source"], row["archive"])
        if digest(row["archive"]) != row["record"]["source_sha256"]:
            raise RuntimeError(f"Archive verification failed: {row['archive']}")
        row["runtime"].parent.mkdir(parents=True, exist_ok=True)
        row["runtime"].write_bytes(row["output"])
        if digest(row["runtime"]) != row["record"]["runtime_sha256"]:
            raise RuntimeError(f"Export verification failed: {row['runtime']}")
    SETTINGS.write_text(json.dumps({row["record"]["runtime"].removeprefix("public/assets/"): settings[
        row["record"]["runtime"].removeprefix("public/assets/")] for row in planned}, indent=2) + "\n", encoding="utf-8")
    MANIFEST.write_text(json.dumps({"decision": "D-441", "asset_count": len(planned),
                                    "assets": [row["record"] for row in planned]}, indent=2) + "\n", encoding="utf-8")
    from intake_calamity_art import preflight, write_revisions
    write_revisions(preflight())
    if remove_incoming:
        for row in planned:
            incoming = ROOT / row["incoming"]
            if incoming.exists():
                if digest(incoming) != digest(row["archive"]):
                    raise RuntimeError(f"Refusing root cleanup after changed bytes: {incoming}")
                incoming.unlink()
    print(f"Installed {len(planned)} Phase 0 Calamity images.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--review", type=Path)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    args = parser.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    if args.review:
        review(args.review)
    elif args.apply:
        install(args.remove_incoming)
    else:
        planned, _ = plan()
        print(f"Verified {len(planned)} delivered images (dry run).")
