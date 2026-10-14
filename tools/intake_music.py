"""Preserve owner-delivered MP3s and install byte-identical runtime copies."""

import hashlib
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
DELIVERIES = {
    "main-theme": "Last Light OST - Main Menu Theme, Celestial Pilgrimage.mp3",
    "infernic": "Last Light OST [Emberwake and Flaming Depths Battle Theme] -Volcanic Wrath.mp3",
    "oceanic": "Last Light OST [Glasswater and Oceanic Valley Battle Theme] - Oceanic Sorrow.mp3",
    "atmospheric": "Last Light OST [Stormspan and Sky-bound Rift] - Storm-Sky Resolve.mp3",
    "botanic": "Last Light OST [Rootstone and Garden of Beauty Battle Theme] - Forest Majesty.mp3",
    "tranquilitic": "Last Light OST [Stillhalo Vale and City of Heaven Battle Theme] - Defending the Serene.mp3",
    "chaotic": "Last Light OST [Riftbound Frontier and Ruins of Chaos] - Fractured Frontier.mp3",
}


def install():
    records = []
    copies = []
    manifest = ROOT / "Music" / "source" / "manifest.json"
    previous = {
        record["cue"]: record for record in
        (json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else [])
    }
    for cue, filename in DELIVERIES.items():
        archive = ROOT / "Music" / "source" / cue / filename
        delivery = ROOT / filename
        source = delivery if delivery.exists() else archive
        runtime = ROOT / "public" / "assets" / "music" / f"{cue}.mp3"
        data = source.read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        if cue in previous and digest != previous[cue]["sha256"]:
            raise ValueError(f"Audio does not match recorded source hash: {source}")
        for target in (archive, runtime):
            if target.exists() and target.read_bytes() != data:
                raise ValueError(f"Refusing to overwrite different audio: {target}")
            if source != target:
                copies.append((source, target, digest))
        records.append({
            "cue": cue, "delivery": filename,
            "source": archive.relative_to(ROOT).as_posix(),
            "runtime": runtime.relative_to(ROOT).as_posix(),
            "sha256": digest, "bytes": len(data),
        })
    for source, target, digest in copies:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        if hashlib.sha256(target.read_bytes()).hexdigest() != digest:
            raise ValueError(f"Audio copy verification failed: {target}")
    manifest.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    print(f"Preserved and verified {len(records)} original MP3s and runtime copies.")


if __name__ == "__main__":
    install()
