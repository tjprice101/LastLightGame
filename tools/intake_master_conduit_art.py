"""Archive and reproduce 50 reviewed Master Conduit cutouts."""
import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw

from intake_status_art import clean
from prepare_art import ROOT, standardize_sprite

SETTINGS = ROOT / "Art" / "provenance" / "master-conduit-art-settings.json"
MANIFEST = ROOT / "Art" / "provenance" / "master-conduit-art-intake.json"
ALTERNATE = "sacredtrevor_one_double-shuriken_execution_clock_segmented_ye_8f67ac60-d864-47df-a5c7-12c603e1f6d8_2.png"
ALTERNATE_ARCHIVE = ROOT / "Art" / "source" / "master-conduits" / "alternates" / ALTERNATE

# The delivery filename table is deliberately independent of runtime content/TypeScript.
SLOTS = {
    "ember": ("Infernis", ("Helios Pyre Cathedral", "Cinderstar Genesis Engine", "Unbroken Sunforge Throne")),
    "tide": ("Tizu", ("Abyssal Shelter Observatory", "Ocean Memory Worldpump", "Undertow Sovereign Harpoon")),
    "sprout": ("Flora", ("Worldseed Mercy Foundry", "Briar Constellation Loom", "Evergreen Continuance Crucible")),
    "atmoso": ("Atmoso", ("Sky Without End Turbine", "Horizon Cyclone Orrery", "Crosswind Imperial Drive")),
    "aurora": ("Aurora", ("Final Dawn Tribunal", "Prismseal Astral Judiciary", "Merciful Eclipse Regulator")),
    "bliss": ("Bliss", ("Thousandfeather Zenith Loom", "Stillplume Planetary Ballet", "Quiet Heaven Fanforge")),
    "bruno": ("Bruno", ("Living Worldwall Atlas", "Quarry Planet Gravitas", "Worldforge Hammer Dominion")),
    "disciple": ("Disciple", ("Unbound Mindcrown Synapse", "Concord Planet Thoughtforge", "Sovereign Will Amplifier")),
    "elise": ("Elise", ("Infinite Thunderwheel Arsenal", "Twin Star Planetary Ratchet", "Storm Empress Execution Clock")),
    "razor": ("Razor", ("Unbroken Midnight Bastion", "Eclipse Planet Watchtower", "Nightglass Counterblade Engine")),
    "rosetta": ("Rosetta", ("Rose Beyond the Sun Orrery", "Virtuous Planet Rosegarden", "Golden Thorn Judgment Loom")),
    "thornia": ("Thornia", ("Forbidden Garden Worldlock", "Thousand-Rose Planetary Aegis", "Shadow Rose Sovereign Foundry")),
    "crinso": ("Crinso", ("Twin-Rose Singularity Drive", "Duality Planet Flamewheel", "Crimson Beauty Pyre Requiem")),
    "nerithe": ("Nerithe", ("Shoreless Meridian Worldchart", "Folded Ocean Planetarium", "Abyssal Surveyor Crown")),
    "orvella": ("Orvella", ("Throne Beneath the World", "Deep Foundation Planetpress", "Keystone Sovereign Counterweight")),
    "vaelor": ("Vaelor", ("Final Chord Celestial Resonator", "Thunder Choir Planetary Fugue", "Broken Sky Imperial Metronome")),
}
EXTRAS = (("grand-master-chest", "Cosmic Grand Master Chest.png"),
          ("astral-reserve", "Astral Reserve — shared mechanic emblem.png"))


def assets(root=ROOT):
    rows = []
    for prefix, (character, names) in SLOTS.items():
        for number, name in enumerate(names, 1):
            asset = f"master-{prefix}-{number}"
            filename = f"{name} (Omnic  {character}).png"
            rows.append((asset, filename,
                         root / "Art" / "source" / "master-conduits" / filename,
                         root / "public" / "assets" / "master-conduits" / f"{asset}.png"))
    for asset, filename in EXTRAS:
        rows.append((asset, filename,
                     root / "Art" / "source" / "master-conduits" / filename,
                     root / "public" / "assets" / "master-conduits" / f"{asset}.png"))
    return rows


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def load_settings():
    settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
    expected = {row[0] for row in assets()}
    if set(settings) != expected or len(expected) != 50:
        raise ValueError("Settings must cover exactly 50 Master Conduit assets.")
    for asset, entry in settings.items():
        if entry.get("border_only") is not True or not entry.get("keys") or not entry.get("review"):
            raise ValueError(f"Missing reviewed connected background settings: {asset}")
        if entry.get("radius", 0) <= 0 or "edge_cleanup" not in entry:
            raise ValueError(f"Missing key radius or edge cleanup settings: {asset}")
    return settings


def prepare(source, settings):
    with Image.open(source) as image:
        image.load()
        alpha = image.convert("RGBA").getextrema()[3][0] < 255
        output = standardize_sprite(clean(image, settings), 256, 224)
        buffer = BytesIO()
        output.save(buffer, format="PNG", optimize=True)
        metadata = {
            "source_mode": image.mode, "source_dimensions": list(image.size),
            "source_alpha_authoritative": alpha,
            "processing": "supplied alpha; trim/resize/pad only" if alpha else
                          "reviewed border-connected RGB key and explicit enclosed gaps",
            "runtime_dimensions": list(output.size),
            "runtime_content_bbox": list(output.getbbox()),
            "runtime_pixel_sha256": sha256(output.tobytes()).hexdigest(),
        }
    return buffer.getvalue(), metadata


def preflight(root=ROOT):
    settings = load_settings()
    previous = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    old_records = {row["asset"]: row for row in previous.get("assets", [])}
    if old_records and set(old_records) != {row[0] for row in assets(root)}:
        raise ValueError("Existing Master Conduit manifest has conflicting coverage.")
    planned = []
    for asset, filename, archived, runtime in assets(root):
        incoming = root / filename
        source = incoming if incoming.exists() else archived
        if not source.is_file():
            raise FileNotFoundError(source)
        source_hash = digest(source)
        if archived.exists() and digest(archived) != source_hash:
            raise FileExistsError(f"Conflicting archived original: {archived}")
        old = old_records.get(asset)
        if old and old["source_sha256"] != source_hash:
            raise ValueError(f"Source bytes changed: {asset}")
        if runtime.exists() and (not old or digest(runtime) != old["runtime_sha256"]):
            raise FileExistsError(f"Untracked or changed runtime: {runtime}")
        output, metadata = prepare(source, settings[asset])
        record = {
            "asset": asset, "incoming": filename,
            "source": str(archived.relative_to(root)), "source_sha256": source_hash,
            "runtime": str(runtime.relative_to(root)), "runtime_sha256": sha256(output).hexdigest(),
            **metadata, "settings": settings[asset],
        }
        planned.append((source, archived, runtime, output, record))
    incoming_alternate = root / ALTERNATE
    alt_source = incoming_alternate if incoming_alternate.exists() else ALTERNATE_ARCHIVE
    if not alt_source.is_file():
        raise FileNotFoundError(alt_source)
    alt_hash = digest(alt_source)
    if ALTERNATE_ARCHIVE.exists() and digest(ALTERNATE_ARCHIVE) != alt_hash:
        raise FileExistsError(f"Conflicting archived alternate: {ALTERNATE_ARCHIVE}")
    if len(planned) != 50:
        raise ValueError(f"Expected 50 runtime assets, got {len(planned)}")
    return planned, (alt_source, incoming_alternate, ALTERNATE_ARCHIVE, alt_hash)


def review(directory):
    directory.mkdir(parents=True, exist_ok=True)
    planned, _ = preflight()
    for source, _, _, output, record in planned:
        with Image.open(source) as original:
            processed = clean(original, record["settings"])
            for label, color in (("dark", "#24242b"), ("light", "#f5f5f5")):
                sheet = Image.new("RGB", original.size, color)
                sheet.paste(processed, (0, 0), processed)
                sheet.save(directory / f"{record['asset']}-{label}.png")
    for start in range(0, 50, 5):
        batch = planned[start:start + 5]
        for label, color in (("dark", "#24242b"), ("light", "#f5f5f5")):
            sheet = Image.new("RGB", (1500, 330), color)
            draw = ImageDraw.Draw(sheet)
            for index, (_, _, _, output, record) in enumerate(batch):
                with Image.open(BytesIO(output)) as image:
                    sheet.paste(image, (index * 300 + 22, 0), image)
                draw.text((index * 300 + 5, 300), record["asset"],
                          fill="white" if label == "dark" else "black")
            sheet.save(directory / f"review-{start // 5 + 1:02d}-{label}.png")
    _write_gap_candidates(planned, directory)


def _write_gap_candidates(planned, directory):
    """Show disconnected key-color islands for deliberate visual seed selection."""
    import numpy as np
    from collections import deque
    from prepare_art import connected_matte
    panels = []
    for source, _, _, _, record in planned:
        settings = record["settings"]
        with Image.open(source) as original:
            rgb = np.asarray(original.convert("RGB"), dtype=np.float32)
            keys = np.asarray(settings["keys"], dtype=np.float32)
            if settings.get("row_gradient_samples"):
                samples = sorted(settings["row_gradient_samples"], key=lambda point: point[1])
                positions = [round(point[1] * (rgb.shape[0] - 1)) for point in samples]
                colors = np.asarray([rgb[round(y * (rgb.shape[0] - 1)), round(x * (rgb.shape[1] - 1))]
                                     for x, y in samples])
                key = np.stack([np.interp(np.arange(rgb.shape[0]), positions, colors[:, channel])
                                for channel in range(3)], axis=1)[:, None, :]
                distance = np.sqrt(((rgb - key) ** 2).sum(axis=2))
            elif settings.get("row_gradient"):
                border = np.concatenate((rgb[:, :4], rgb[:, -4:]), axis=1)
                key = np.median(border, axis=1)[:, None, :]
                distance = np.sqrt(((rgb - key) ** 2).sum(axis=2))
            else:
                distance = np.sqrt(((rgb[:, :, None, :] - keys[None, None, :, :]) ** 2).sum(axis=3)).min(axis=2)
            eligible = distance <= settings["radius"]
            protected = Image.new("L", original.size)
            draw = ImageDraw.Draw(protected)
            for polygon in settings.get("foreground_polygons", []):
                draw.polygon([(round(x * original.width), round(y * original.height)) for x, y in polygon], fill=255)
            eligible &= np.asarray(protected) == 0
            h, w = eligible.shape
            border = [(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)] + [(y, x) for y in range(h) for x in (0, w - 1)]
            connected = connected_matte(eligible, border)
            candidates = eligible & ~connected
            # Retain components >= 24 pixels and mark center coordinates for human review.
            seen = np.zeros_like(candidates, dtype=bool)
            centers = []
            for y, x in zip(*np.nonzero(candidates)):
                if seen[y, x]:
                    continue
                q = deque([(y, x)]); seen[y, x] = True; pts = []
                while q:
                    cy, cx = q.popleft(); pts.append((cy, cx))
                    for ny, nx in ((cy-1,cx),(cy+1,cx),(cy,cx-1),(cy,cx+1)):
                        if 0 <= ny < h and 0 <= nx < w and candidates[ny,nx] and not seen[ny,nx]:
                            seen[ny,nx] = True; q.append((ny,nx))
                if len(pts) >= 1800:
                    yy, xx = np.mean(pts, axis=0)
                    centers.append((float(xx / w), float(yy / h), len(pts), pts))
            centers.sort(key=lambda item: item[2], reverse=True)
            thumb = original.convert("RGB").resize((220, 220))
            overlay = Image.new("RGBA", thumb.size, (0,0,0,0)); od = ImageDraw.Draw(overlay)
            for rank,(x,y,size,pts) in enumerate(centers[:5],1):
                for py,px in pts:
                    tx,ty=round(px*thumb.width/w),round(py*thumb.height/h)
                    overlay.putpixel((tx,ty),(255,0,255,175))
                px,py=round(x*thumb.width),round(y*thumb.height)
                od.ellipse((px-5,py-5,px+5,py+5), fill=(255,0,255,255), outline=(255,255,255,255), width=1)
                od.text((px+5,py-5),str(rank),fill=(255,255,255,255),stroke_width=1,stroke_fill=(0,0,0,255))
            thumb=Image.alpha_composite(thumb.convert("RGBA"),overlay).convert("RGB")
            centers=[(x,y,size) for x,y,size,_ in centers]
            panels.append((thumb, record["asset"], centers))
    for start in range(0, len(panels), 10):
        batch=panels[start:start+10]
        sheet=Image.new("RGB",(1500,600),"#24242b"); draw=ImageDraw.Draw(sheet)
        for i,(im,name,centers) in enumerate(batch):
            x=(i%5)*300+40; y=(i//5)*300
            sheet.paste(im,(x,y))
            draw.text(((i%5)*300+5,y+222),f"{name} enclosed candidates:{len(centers)}",fill="white")
            for rank,(cx,cy,size) in enumerate(centers[:5],1):
                draw.text(((i%5)*300+5,y+238+rank*12),f"{rank}: {cx:.2f},{cy:.2f} ({size}px)",fill="#ffb7ff")
        sheet.save(directory/f"enclosed-gap-candidates-{start//10+1:02d}.png")


def intake(apply=False, remove_incoming=False, reviewed=False):
    if remove_incoming and not (apply and reviewed):
        raise ValueError("Root removal requires --apply --reviewed after visual verification.")
    planned, alternate = preflight()
    if apply:
        for source, archived, runtime, output, record in planned:
            archived.parent.mkdir(parents=True, exist_ok=True)
            runtime.parent.mkdir(parents=True, exist_ok=True)
            if not archived.exists():
                shutil.copyfile(source, archived)
            if digest(archived) != record["source_sha256"]:
                raise RuntimeError(f"Archive verification failed: {archived}")
            runtime.write_bytes(output)
            if digest(runtime) != record["runtime_sha256"]:
                raise RuntimeError(f"Runtime verification failed: {runtime}")
        alt_source, incoming_alt, archived_alt, alt_hash = alternate
        archived_alt.parent.mkdir(parents=True, exist_ok=True)
        if not archived_alt.exists():
            shutil.copyfile(alt_source, archived_alt)
        if digest(archived_alt) != alt_hash:
            raise RuntimeError(f"Alternate archive verification failed: {archived_alt}")
        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        MANIFEST.write_text(json.dumps({
            "asset_count": 50, "canvas": 256, "content_limit": 224,
            "assets": [row[-1] for row in planned],
            "alternates": [{"incoming": ALTERNATE,
                            "source": str(archived_alt.relative_to(ROOT)),
                            "source_sha256": alt_hash,
                            "runtime": None, "used": False}],
        }, indent=2) + "\n", encoding="utf-8")
        if remove_incoming:
            for _, archived, runtime, _, record in planned:
                incoming = ROOT / record["incoming"]
                if incoming.exists():
                    if digest(incoming) != digest(archived) or digest(runtime) != record["runtime_sha256"]:
                        raise RuntimeError(f"Root cleanup verification failed: {incoming}")
                    incoming.unlink()
            _, incoming_alt, archived_alt, alt_hash = alternate
            if incoming_alt.exists():
                if digest(incoming_alt) != alt_hash or digest(archived_alt) != alt_hash:
                    raise RuntimeError(f"Alternate cleanup verification failed: {incoming_alt}")
                incoming_alt.unlink()
    return planned


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--reviewed", action="store_true")
    parser.add_argument("--remove-incoming", action="store_true")
    parser.add_argument("--review-dir", type=Path)
    args = parser.parse_args()
    if args.review_dir:
        review(args.review_dir)
    else:
        print(f"{len(intake(args.apply, args.remove_incoming, args.reviewed))} Master Conduits verified"
              + (" and installed." if args.apply else "; dry run."))
