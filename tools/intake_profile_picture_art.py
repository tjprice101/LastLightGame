"""Offline, reviewed profile portrait keying and deterministic mosaic composition."""
import argparse
from collections import Counter
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

import numpy as np
from PIL import Image, ImageDraw

from intake_character_refresh import clean
from prepare_art import ROOT

SOURCE = ROOT / "Art" / "source" / "profile-pictures"
RUNTIME = ROOT / "public" / "assets" / "profile-pictures"
SETTINGS = ROOT / "Art" / "provenance" / "profile-picture-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "profile-picture-intake.json"
ROSTER = {
    "Infernis": ("ember", "infernic"), "Tizu": ("tide", "oceanic"),
    "Flora": ("sprout", "botanic"), "Atmoso": ("atmoso", "atmospheric"),
    "Aurora": ("aurora", "tranquilitic"), "Bliss": ("bliss", "tranquilitic"),
    "Bruno": ("bruno", "botanic"), "Crinso": ("crinso", "chaotic"),
    "Disciple": ("disciple", "chaotic"), "Elise": ("elise", "atmospheric"),
    "Nerithe": ("nerithe", "oceanic"), "Orvella": ("orvella", "botanic"),
    "Razor": ("razor", "chaotic"), "Rosetta": ("rosetta", "tranquilitic"),
    "Thornia": ("thornia", "chaotic"), "Vaelor": ("vaelor", "atmospheric"),
}
PALETTES = {
    "infernic": ((70, 12, 28), (244, 74, 29), (255, 184, 62)),
    "oceanic": ((9, 30, 87), (20, 143, 214), (88, 234, 242)),
    "botanic": ((10, 46, 30), (32, 154, 74), (172, 227, 82)),
    "atmospheric": ((24, 33, 91), (78, 119, 222), (140, 235, 250)),
    "tranquilitic": ((77, 29, 70), (207, 110, 152), (255, 218, 190)),
    "chaotic": ((29, 13, 60), (116, 46, 177), (222, 95, 211)),
}


def assets():
    for name, (identity, element) in ROSTER.items():
        for form in ("base", "omnic"):
            filename = f"{name} {'—' if name == 'Infernis' else '-'} {form.title()}.png"
            yield filename, f"{identity}-{form}", element


def source_path(filename, asset):
    incoming = ROOT / filename
    return incoming if incoming.exists() else SOURCE / f"{asset}.png"


def digest(data):
    return sha256(data).hexdigest()


def draft_settings():
    result = {}
    for filename, asset, _ in assets():
        if asset == "sprout-omnic":
            result[asset] = {"preserve_original": True}
            continue
        with Image.open(source_path(filename, asset)) as image:
            rgb = np.asarray(image.convert("RGB"))
        border = np.concatenate((rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]))
        bins = (border // 8 * 8 + 4).clip(0, 255)
        counts = Counter(map(tuple, bins.tolist()))
        keys = [list(color) for color, count in counts.most_common(8) if count > len(border) * .025]
        background = rgb[0, 0].astype(float)
        keys = [color for color in keys if np.linalg.norm(np.array(color) - background) < 60]
        if not keys:
            raise ValueError(f"No dominant background found for {asset}")
        result[asset] = {"keys": keys, "radius": 20,
                         "border_only": asset == "aurora-omnic",
                         "edge_cleanup": {"source_pixels": 1, "distance_ramp": 30}}
    SETTINGS.parent.mkdir(parents=True, exist_ok=True)
    if SETTINGS.exists():
        raise FileExistsError("Reviewed settings already exist; do not overwrite them.")
    SETTINGS.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")


def mosaic(element, size=1024):
    dark, middle, light = map(np.array, PALETTES[element])
    yy, xx = np.mgrid[0:size, 0:size] / (size - 1)
    glow = np.clip(1 - np.sqrt((xx - .48) ** 2 + (yy - .32) ** 2) / .8, 0, 1)
    strength = np.clip(glow * 1.5, 0, 1)
    gradient = dark + (middle - dark) * strength[..., None]
    highlight = np.clip((glow - .45) / .55, 0, 1) * .55
    gradient += (light - middle) * highlight[..., None]
    image = Image.fromarray(np.uint8(gradient))
    overlay = Image.new("RGBA", image.size)
    draw = ImageDraw.Draw(overlay)
    rng = np.random.default_rng(list(PALETTES).index(element) + 262)
    step = size // 8
    for y in range(-step, size, step):
        for x in range(-step, size, step):
            points = [(x, y), (x + step, y), (x + step, y + step), (x, y + step)]
            center = (x + int(rng.integers(step // 4, step * 3 // 4)),
                      y + int(rng.integers(step // 4, step * 3 // 4)))
            for i in range(4):
                color = light if rng.random() > .45 else dark
                draw.polygon([points[i], points[(i + 1) % 4], center],
                             fill=tuple(map(int, color)) + (int(rng.integers(12, 48)),))
    return Image.alpha_composite(image.convert("RGBA"), overlay)


def render(source, settings, element):
    data = source.read_bytes()
    if settings.get("preserve_original"):
        return data, None
    with Image.open(BytesIO(data)) as image:
        if image.size != (1024, 1024):
            raise ValueError("Profile source must be square 1024px; review any replacement.")
        cutout = clean(image, settings)
    output = Image.alpha_composite(mosaic(element), cutout)
    stream = BytesIO()
    output.convert("RGB").save(stream, "PNG", optimize=True)
    return stream.getvalue(), cutout


def intake(review=None, apply=False):
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    if set(settings) != {asset for _, asset, _ in assets()}:
        raise ValueError("Settings must cover exactly32 profile portraits.")
    if apply and MANIFEST.exists():
        previous = json.loads(MANIFEST.read_text(encoding="utf-8"))
        for record in previous["assets"]:
            if digest((ROOT / record["runtime"]).read_bytes()) != record["runtime_sha256"]:
                raise FileExistsError(f"Installed profile art changed outside intake: {record['asset']}")
    records, previews = [], []
    for filename, asset, element in assets():
        source = source_path(filename, asset)
        data, cutout = render(source, settings[asset], element)
        archived = SOURCE / f"{asset}.png"
        target = RUNTIME / f"{asset}.png"
        if archived.exists() and archived.read_bytes() != source.read_bytes():
            raise FileExistsError(f"Conflicting archived original: {asset}")
        records.append({"asset": asset, "incoming": filename, "element": element,
                        "source": str(archived.relative_to(ROOT)),
                        "source_sha256": digest(source.read_bytes()),
                        "runtime": str(target.relative_to(ROOT)), "runtime_sha256": digest(data),
                        "processing": settings[asset]})
        if review:
            review.mkdir(parents=True, exist_ok=True)
            (review / f"{asset}.png").write_bytes(data)
            if cutout:
                cutout.save(review / f"{asset}-cutout.png")
            previews.append((asset, data))
        if apply:
            SOURCE.mkdir(parents=True, exist_ok=True)
            RUNTIME.mkdir(parents=True, exist_ok=True)
            if not archived.exists():
                shutil.copyfile(source, archived)
            target.write_bytes(data)
    if review:
        for start in range(0, len(previews), 8):
            sheet = Image.new("RGB", (1200, 650), "#222222")
            draw = ImageDraw.Draw(sheet)
            for index, (asset, data) in enumerate(previews[start:start + 8]):
                image = Image.open(BytesIO(data))
                image.thumbnail((290, 290))
                x, y = index % 4 * 300, index // 4 * 325
                sheet.paste(image, (x, y))
                draw.text((x + 4, y + 296), asset, fill="white")
            sheet.save(review / f"review-{start // 8}.png")
    if apply:
        MANIFEST.write_text(json.dumps({"asset_count": 32, "assets": records}, indent=2) + "\n", encoding="utf-8")
        revisions = "\n".join(f"  '{r['asset']}': '{r['runtime_sha256'][:12]}'," for r in records)
        (ROOT / "src" / "content" / "profile-picture-art.ts").write_text(
            "// Generated by tools/intake_profile_picture_art.py.\n"
            f"export const profilePictureArt = {{\n{revisions}\n}} as const;\n", encoding="utf-8")
    print(f"32 profile portraits {'installed' if apply else 'reviewed'}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--draft-settings", action="store_true")
    parser.add_argument("--review", type=Path)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if args.draft_settings:
        draft_settings()
    else:
        intake(args.review, args.apply)
