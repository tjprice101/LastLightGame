"""Preserve and export the reviewed art assets supplied in the project root."""

import argparse
from dataclasses import dataclass
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil

import numpy as np
from PIL import Image

from color_matte import remove_color_matte, reviewed_background_starts
from prepare_art import ROOT, connected_matte, standardize_sprite
from art_library import art_path


@dataclass(frozen=True)
class Asset:
    incoming: str
    source_category: str
    runtime: str
    export_size: int | None = None
    content_size: int | None = None
    key: tuple[str, tuple[tuple[str, int | float], ...]] | None = None

    @property
    def source(self) -> str:
        return f"Art/source/{self.source_category}/{self.incoming}"


def _hue(name: str, category: str, output: str, hue: int, tolerance: int,
         saturation_min: float, value_min: float = 0.1) -> Asset:
    return Asset(name, category, output, 256, 224, ("hue", (
        ("hue", hue), ("tolerance", tolerance), ("saturation_min", saturation_min),
        ("value_min", value_min), ("border_only", True),
    )))


def _rgb(name: str, category: str, output: str, radius: int = 35,
         size: int = 960, content: int = 864) -> Asset:
    return Asset(name, category, output, size, content,
                 ("edge-rgb", (("radius", radius), ("quantization", 8))))


def _copy(name: str, category: str, output: str) -> Asset:
    return Asset(name, category, output)


ASSETS = (
    _hue("Atmospheric.png", "elements", "elements/atmospheric.png", 344, 20, .20, .25),
    _hue("Chaotic.png", "elements", "elements/chaotic.png", 74, 18, .22, .18),
    _hue("Efflorescent.png", "elements", "elements/efflorescent.png", 190, 18, .20, .20),
    _hue("Infernic Fire Medal.png", "elements", "elements/infernic.png", 190, 18, .20, .20),
    _hue("Luminous.png", "elements", "elements/luminous.png", 187, 18, .20, .20),
    _hue("Oceanic.png", "elements", "elements/aquatic.png", 340, 20, .20, .25),
    _hue("Ominous.png", "elements", "elements/ominous.png", 184, 18, .20, .20),
    _hue("Tectonic.png", "elements", "elements/tectonic.png", 185, 18, .20, .20),
    _hue("Tranquilitic.png", "elements", "elements/tranquilitic.png", 74, 18, .22, .18),
    _hue("Voltaic.png", "elements", "elements/voltaic.png", 185, 18, .20, .20),
    _hue("Bastion Lock.png", "conduits", "conduits/bastion-lock.png", 25, 18, .25, .20),
    _hue("Fracture Reservoir.png", "conduits", "conduits/fracture-reservoir.png", 162, 18, .18, .20),
    _hue("Parallax Relay.png", "conduits", "conduits/parallax-relay.png", 0, 16, .25, .20),
    _hue("Siegebound Drive.png", "conduits", "conduits/siegebound-drive.png", 198, 18, .25, .20),
    _hue("Vigil Core.png", "conduits", "conduits/vigil-core.png", 140, 18, .12, .30),
    _rgb("Gleamstone Slime.png", "enemies", "enemies/gleamstone-slime.png"),
    _rgb("Diadem of Daybreak, Gleamstone Slime.png", "enemies", "enemies/diadem-of-daybreak-gleamstone-slime.png"),
    _rgb("Scepter of Radiance, Gleamstone Slime.png", "enemies", "enemies/scepter-of-radiance-gleamstone-slime.png"),
    _rgb("Regalia of the Sun, Gleamstone Slime.png", "enemies", "enemies/regalia-of-the-sun-gleamstone-slime.png"),
    _rgb("Sovereign of the Gilded Vault, Gleamstone Slime.png", "enemies", "enemies/sovereign-of-the-gilded-vault-gleamstone-slime.png"),
    _rgb("The Crown Beyond Dawn, Gleamstone Slime.png", "enemies", "enemies/the-crown-beyond-dawn-gleamstone-slime.png"),
    _rgb("Rosethorn Wisp.png", "enemies", "enemies/rosethorn-wisp.png"),
    _rgb("Votive of First Bloom, Rosethorn Wisp.png", "enemies", "enemies/votive-of-first-bloom-rosethorn-wisp.png"),
    _rgb("Laurel of the Sacred Flame. Rosethorn Wisp.png", "enemies", "enemies/laurel-of-the-sacred-flame-rosethorn-wisp.png"),
    _rgb("Seraph of the Rose Pyre, Rosethorn Wisp.png", "enemies", "enemies/seraph-of-the-rose-pyre-rosethorn-wisp.png"),
    _rgb("Sovereign of the Hallowed Garden, Rosethorn Wisp.png", "enemies", "enemies/sovereign-of-the-hallowed-garden-rosethorn-wisp.png"),
    _rgb("The Flame Beyond Eternity, Rosethorn Wisp.png", "enemies", "enemies/the-flame-beyond-eternity-rosethorn-wisp.png"),
    _copy("Character Archive Banner.png", "banners", "banners/archive-characters.png"),
    _copy("Conduit Archive Banner.png", "banners", "banners/archive-conduits.png"),
    _copy("Creature Archive Banner.png", "banners", "banners/archive-creatures.png"),
    _copy("Conduit Store banner.png", "banners", "banners/conduit-store.png"),
    _copy("Standard Character Banner.png", "banners", "banners/summon-standard.png"),
    _copy("Treasury mode banner.png", "banners", "banners/treasury-banner.png"),
    _copy("Activity header for Rosethorn Sanctuary.png", "banners", "banners/sanctuary-banner.png"),
    _copy("Treasury battle arena.png", "backgrounds", "backgrounds/treasury-arena.png"),
    _copy("Battle arena for Rosethorn Sanctuary.png", "backgrounds", "backgrounds/sanctuary-arena.png"),
)

BACKGROUND_SEEDS = {
    "elements/atmospheric.png": [(0.522461, 0.0625)],
    "elements/aquatic.png": [(0.639648, 0.144531), (0.808594, 0.244141)],
    "elements/infernic.png": [(0.542969, 0.144531)],
    "conduits/fracture-reservoir.png": [(0.68457, 0.407227), (0.393555, 0.643555)],
    "enemies/scepter-of-radiance-gleamstone-slime.png": [(0.733766, 0.355603), (0.879058, 0.417026)],
    "enemies/regalia-of-the-sun-gleamstone-slime.png": [(0.863636, 0.256466), (0.850649, 0.740302)],
    "enemies/the-crown-beyond-dawn-gleamstone-slime.png": [
        (0.222403, 0.246767), (0.154221, 0.284483), (0.142857, 0.365302),
        (0.176948, 0.394397), (0.185877, 0.515086), (0.237825, 0.55819),
        (0.271104, 0.594828), (0.647727, 0.682112), (0.412338, 0.686422),
        (0.143669, 0.778017), (0.712662, 0.783405), (0.839286, 0.796336),
        (0.521916, 0.865302), (0.847403, 0.84806), (0.340909, 0.891164),
    ],
    "enemies/rosethorn-wisp.png": [
        (0.508929, 0.676724), (0.409091, 0.715517), (0.69724, 0.737069), (0.553571, 0.731681),
    ],
    "enemies/laurel-of-the-sacred-flame-rosethorn-wisp.png": [
        (0.396916, 0.688578), (0.625, 0.689655), (0.298701, 0.673491), (0.588474, 0.817888),
    ],
    "enemies/sovereign-of-the-hallowed-garden-rosethorn-wisp.png": [(0.738636, 0.772629)],
    "enemies/the-flame-beyond-eternity-rosethorn-wisp.png": [(0.622565, 0.21875), (0.38961, 0.212284)],
}


def _remove_rgb_matte(image: Image.Image, radius: int, quantization: int,
                      background_seeds=()) -> tuple[Image.Image, tuple[int, int, int]]:
    if radius <= 0 or quantization <= 0:
        raise ValueError("RGB key radius and quantization must be positive.")
    rgb = np.asarray(image.convert("RGB"), dtype=np.int32)
    border = np.concatenate((rgb[0, :, :], rgb[-1, :, :], rgb[:, 0, :], rgb[:, -1, :]), axis=0)
    bins, counts = np.unique((border // quantization).astype(np.uint8), axis=0, return_counts=True)
    color = bins[counts.argmax()].astype(np.int32) * quantization + quantization // 2
    distance = rgb - color
    eligible = np.sum(distance * distance, axis=2, dtype=np.int64) <= radius * radius
    height, width = eligible.shape
    border_pixels = ([(0, x) for x in range(width)] + [(height - 1, x) for x in range(width)] +
                     [(y, 0) for y in range(height)] + [(y, width - 1) for y in range(height)])
    matte = connected_matte(eligible, border_pixels + reviewed_background_starts(eligible, background_seeds))
    if not matte.any():
        raise ValueError("RGB key did not match any border-connected background pixels.")
    rgba = np.dstack((rgb.astype(np.uint8), np.where(matte, 0, 255).astype(np.uint8)))
    rgba[matte, :3] = 0
    return Image.fromarray(rgba), tuple(int(channel) for channel in color)


def _prepare(asset: Asset, path: Path) -> tuple[bytes, dict[str, object]]:
    source_hash = sha256(path.read_bytes()).hexdigest()
    if asset.key is None:
        output = path.read_bytes()
        processing: dict[str, object] = {"method": "opaque scenery copied byte-for-byte"}
    else:
        with Image.open(path) as source:
            if source.mode != "RGB":
                raise ValueError(f"Expected opaque RGB input: {path}")
            method, items = asset.key
            parameters = dict(items)
            seeds = BACKGROUND_SEEDS.get(asset.runtime, ())
            if seeds:
                parameters["background_seeds"] = [list(point) for point in seeds]
            if method == "hue":
                keyed = remove_color_matte(source, **parameters)
                processing = {"method": "border-connected hue/saturation key", **parameters}
            elif method == "edge-rgb":
                keyed, color = _remove_rgb_matte(source, **parameters)
                processing = {"method": "border-connected RGB-distance key", **parameters, "derived_background_rgb": list(color)}
            else:
                raise ValueError(f"Unsupported matte method: {method}")
            standardized = standardize_sprite(keyed, asset.export_size, asset.content_size)
            buffer = BytesIO()
            standardized.save(buffer, format="PNG", optimize=True)
            output = buffer.getvalue()
    return output, {
        "incoming": asset.incoming,
        "source": asset.source.replace("/", "\\"),
        "source_sha256": source_hash,
        "runtime": f"public/assets/{asset.runtime}".replace("/", "\\"),
        "processing": processing,
        "runtime_sha256": sha256(output).hexdigest(),
    }


def plan(regenerate: bool = False) -> list[tuple[Asset, Path, Path, bytes, dict[str, object]]]:
    if len({asset.incoming for asset in ASSETS}) != len(ASSETS):
        raise ValueError("Duplicate incoming filename in art intake map.")
    if len({asset.runtime for asset in ASSETS}) != len(ASSETS):
        raise ValueError("Duplicate runtime destination in art intake map.")
    manifest = art_path("root-art-intake.json", root=ROOT)
    if regenerate:
        previous = json.loads(manifest.read_text(encoding="utf-8"))
        if previous["asset_count"] != len(ASSETS) or len(previous["assets"]) != len(ASSETS):
            raise ValueError("Existing intake manifest does not cover the complete asset map.")
        for asset, record in zip(ASSETS, previous["assets"]):
            if record["incoming"] != asset.incoming or record["source"] != asset.source.replace("/", "\\") or record["runtime"] != f"public/assets/{asset.runtime}".replace("/", "\\"):
                raise ValueError("Existing intake manifest mapping differs from the reviewed asset map.")
            for field in ("source", "runtime"):
                path = ROOT / record[field].replace("\\", "/")
                if sha256(path.read_bytes()).hexdigest() != record[f"{field}_sha256"]:
                    raise FileExistsError(f"Art changed outside the recorded intake: {path}")
    planned = []
    for asset in ASSETS:
        incoming = ROOT / asset.incoming
        source = ROOT / asset.source
        runtime = ROOT / "public" / "assets" / asset.runtime
        if not incoming.is_file():
            if not source.is_file():
                raise FileNotFoundError(f"Missing incoming and archived art asset: {incoming}, {source}")
            incoming = source
        if source.exists() and sha256(source.read_bytes()).hexdigest() != sha256(incoming.read_bytes()).hexdigest():
            raise FileExistsError(f"Different source already exists: {source}")
        output, record = _prepare(asset, incoming)
        if not regenerate and runtime.exists() and runtime.read_bytes() != output:
            raise FileExistsError(f"Different runtime asset already exists: {runtime}")
        planned.append((asset, incoming, source, output, record))
    manifest = art_path("root-art-intake.json", root=ROOT)
    manifest_text = json.dumps({"asset_count": len(planned), "assets": [record for *_, record in planned]},
                               indent=2, ensure_ascii=False) + "\n"
    if not regenerate and manifest.exists() and manifest.read_text(encoding="utf-8") != manifest_text:
        raise FileExistsError(f"Different art intake manifest already exists: {manifest}")
    return planned


def intake(apply: bool = False, regenerate: bool = False) -> None:
    planned = plan(regenerate)
    for asset, incoming, source, output, record in planned:
        if apply:
            source.parent.mkdir(parents=True, exist_ok=True)
            if not source.exists():
                shutil.copyfile(incoming, source)
            runtime = ROOT / "public" / "assets" / asset.runtime
            runtime.parent.mkdir(parents=True, exist_ok=True)
            if not runtime.exists() or (regenerate and runtime.read_bytes() != output):
                runtime.write_bytes(output)
        print(f"{asset.incoming} -> {asset.source} -> public/assets/{asset.runtime}")
    if apply:
        manifest = art_path("root-art-intake.json", root=ROOT)
        manifest.parent.mkdir(parents=True, exist_ok=True)
        manifest.write_text(json.dumps({"asset_count": len(planned), "assets": [record for *_, record in planned]},
                                       indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(planned)} assets {'installed' if apply else 'validated (dry run)'}; source originals remain unchanged.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Copy preserved sources and write runtime exports.")
    parser.add_argument("--regenerate", action="store_true", help="Verify recorded originals/exports before planning replacement exports.")
    args = parser.parse_args()
    intake(args.apply, args.regenerate)
