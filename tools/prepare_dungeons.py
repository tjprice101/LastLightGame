"""Intake supplied dungeon art; preserve sources and reuse established matte removal."""

import argparse
import hashlib
import shutil


from prepare_art import ROOT, ASSETS, MATTE_MINIMUMS, MATTE_SPREADS, prepare_sprite
from matte_regions import BACKGROUND_SEEDS, BACKGROUND_MINIMUMS
from color_matte import remove_color_matte
from prepare_art import supplied_cutout, standardize_sprite
from PIL import Image, ImageDraw

VOLTAIC_ENEMIES = {
    "Sparkpip": "sparkpip", "Coppercap Gremlin": "coppercap-gremlin",
    "Coilback Scarab": "coilback-scarab", "Stormhorn Faun": "stormhorn-faun",
    "Thunderclaw Raiju": "thunderclaw-raiju", "Tempestwing Roc": "tempestwing-roc",
    "Crowncoil Kirin": "crowncoil-kirin",
    "Sovereign of the Living Storm": "sovereign-of-the-living-storm",
}

GALVANIC_COLOR_MATTES = {
    "sparkpip": 171, "coppercap-gremlin": 163, "coilback-scarab": 157,
    "stormhorn-faun": 158, "thunderclaw-raiju": 135, "tempestwing-roc": 157,
    "crowncoil-kirin": 108, "sovereign-of-the-living-storm": 156,
    "voltaic-seed": 165, "voltaic-bloom": 111, "voltaic-shard": 166,
    "voltaic-crest": 158, "voltaic-heart": 127, "voltaic-soul": 156,
}

GALVANIC_KEY_OPTIONS = {
    "voltaic-bloom": {"hue": 100, "tolerance": 27},
    "voltaic-seed": {"hue": 145, "tolerance": 36},
    "voltaic-soul": {"hue": 132, "tolerance": 44},
}

GALVANIC_FOREGROUND_REGIONS = {
    "voltaic-seed": [
        [(.45, .256), (.65, .246), (.71, .255), (.69, .266), (.53, .274), (.45, .268)],
        [(.185, .596), (.243, .594), (.305, .704), (.313, .767),
         (.282, .751), (.23, .711), (.198, .643)],
        [(.428, .357), (.482, .349), (.510, .362), (.499, .377), (.470, .385)],
        [(.504, .42), (.587, .415), (.618, .435), (.584, .464), (.542, .451)],
    ],
    "voltaic-soul": [
        [(.05, .03), (.39, .43), (.28, .46), (.17, .25)],
        [(.08, .33), (.31, .39), (.44, .52), (.30, .48)],
        [(.20, .57), (.32, .56), (.43, .66), (.28, .65)],
        [(.27, .74), (.35, .64), (.46, .75), (.36, .81)],
    ],
}

TRANQUILITIC_ENEMIES = {
    "Hushbud": "hushbud", "Bellcap Keeper": "bellcap-keeper",
    "Lotusback Tortoise": "lotusback-tortoise", "Porcelain Crane": "porcelain-crane",
    "Concord Lion": "concord-lion", "Stillbell Oracle": "stillbell-oracle",
    "Harmonywing Kirin": "harmonywing-kirin",
    "Sovereign of the Unbroken Accord": "sovereign-of-the-unbroken-accord",
}

CITY_COLOR_MATTES = {
    "hushbud": 330, "bellcap-keeper": 328, "lotusback-tortoise": 324,
    "porcelain-crane": 328, "concord-lion": 330, "stillbell-oracle": 330,
    "harmonywing-kirin": 339, "sovereign-of-the-unbroken-accord": 338,
    "tranquilitic-seed": 339, "tranquilitic-bloom": 334, "tranquilitic-shard": 348,
    "tranquilitic-heart": 337, "tranquilitic-soul": 331,
}

AQUATIC_ENEMIES = {
    "Pebblefin Sprig": "pebblefin-sprig",
    "Shellcap Kappa": "shellcap-kappa",
    "Brineclaw Sentinel": "brineclaw-sentinel",
    "Coralcrest Nereid": "coralcrest-nereid",
    "Glasswake Kelpie": "glasswake-kelpie",
    "Abyssbell Oracle": "abyssbell-oracle",
    "Pearlscale Leviathan": "pearlscale-leviathan",
    "Sovereign of the Endless Tide": "sovereign-of-the-endless-tide",
}
EFFLORESCENT_ENEMIES = {
    "Budling": "budling",
    "Mosscap Brownie": "mosscap-brownie",
    "Thornshell Beetle": "thornshell-beetle",
    "Petalhorn Satyr": "petalhorn-satyr",
    "Orchid Mantis": "orchid-mantis",
    "Moonbloom Dryad": "moonbloom-dryad",
    "Verdant Antler Regent": "verdant-antler-regent",
    "Empress of the Thousand Blooms": "empress-of-the-thousand-blooms",
}
LANDSCAPES = {
    "Galvanic Field Banner.png": ("banners", "galvanic-field"),
    "Galvanic Field Arena.png": ("backgrounds", "galvanic-field"),
    "City of Heaven Banner.png": ("banners", "city-of-heaven"),
    "City of Heaven Arena.png": ("backgrounds", "city-of-heaven"),
    "Flaming Depths Banner.png": ("banners", "flaming-depths"),
    "Flaming Depths Battlefield.png": ("backgrounds", "flaming-depths"),
    "Oceanic Valley Banner.png": ("banners", "oceanic-valley"),
    "Oceanic Valley Arena.png": ("backgrounds", "oceanic-valley"),
    "Garden of Beauty Banner.png": ("banners", "garden-of-beauty"),
    "Garden of Beauty Arena.png": ("backgrounds", "garden-of-beauty"),
}


def source_file(filename, category, move):
    source = ROOT / "Art" / "source" / category / filename
    incoming = ROOT / filename
    if move and incoming.exists():
        if source.exists():
            if hashlib.sha256(source.read_bytes()).digest() != hashlib.sha256(incoming.read_bytes()).digest():
                raise FileExistsError(f"Different source already exists: {source}")
            archive = ROOT / "Art" / "source" / "intake-duplicates" / filename
            if archive.exists():
                raise FileExistsError(archive)
            archive.parent.mkdir(parents=True, exist_ok=True)
            incoming.rename(archive)
            print(f"Archived identical intake: {archive.relative_to(ROOT)}")
        else:
            source.parent.mkdir(parents=True, exist_ok=True)
            incoming.rename(source)
    if not source.is_file():
        raise FileNotFoundError(source)
    return source


def has_color_matte(asset_id):
    return asset_id in CITY_COLOR_MATTES or asset_id == "tranquilitic-crest" or asset_id in GALVANIC_COLOR_MATTES


def prepare_dungeon_sprite(source, asset_id, size, content):
    if asset_id in GALVANIC_COLOR_MATTES and not supplied_cutout(asset_id):
        with Image.open(source) as image:
            mask = None
            if asset_id in GALVANIC_FOREGROUND_REGIONS:
                mask = Image.new("L", image.size)
                draw = ImageDraw.Draw(mask)
                for points in GALVANIC_FOREGROUND_REGIONS[asset_id]:
                    draw.polygon([(round(x * image.width), round(y * image.height)) for x, y in points], fill=255)
            options = {"hue": GALVANIC_COLOR_MATTES[asset_id], "tolerance": 9,
                       "saturation_min": .12 if asset_id == "voltaic-heart" else .25}
            options.update(GALVANIC_KEY_OPTIONS.get(asset_id, {}))
            return standardize_sprite(remove_color_matte(
                image, foreground_mask=mask, **options), size, content)
    if (asset_id in CITY_COLOR_MATTES or asset_id == "tranquilitic-crest") and not supplied_cutout(asset_id):
        with Image.open(source) as image:
            options = {"hue": CITY_COLOR_MATTES.get(asset_id, 30)}
            if asset_id == "tranquilitic-crest":
                options.update(tolerance=6, saturation_min=.50, value_min=.86, border_only=True)
            elif asset_id == "tranquilitic-shard":
                options.update(tolerance=5, saturation_min=.45, value_min=.85)
            elif asset_id == "tranquilitic-seed":
                options.update(tolerance=30, saturation_min=.05)
            return standardize_sprite(remove_color_matte(image, **options), size, content)
    return prepare_sprite(source, asset_id, size, content,
                          matte_minimum=MATTE_MINIMUMS.get(asset_id, 230),
                          matte_spread=MATTE_SPREADS.get(asset_id, 20),
                          background_seeds=BACKGROUND_SEEDS.get(asset_id, ()),
                          background_minimum=BACKGROUND_MINIMUMS.get(asset_id, 230))


def export_sprite(filename, category, asset_id, move, size, content):
    source = source_file(filename, category, move)
    result = prepare_dungeon_sprite(source, asset_id, size, content)
    output = ROOT / "public" / "assets" / category / f"{asset_id}.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output, optimize=True)
    print(f"{output.relative_to(ROOT)}: {size}px RGBA")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--move-sources", action="store_true")
    parser.add_argument("--elements", nargs="+", choices=["infernic", "aquatic", "efflorescent", "tranquilitic", "voltaic"],
                        default=["infernic", "aquatic", "efflorescent", "tranquilitic", "voltaic"])
    args = parser.parse_args()
    # Existing Infernic exports remain unchanged; archive duplicate intake only.
    if "infernic" in args.elements:
        for filename, (category, _) in ASSETS.items():
            if (ROOT / filename).is_file() and category == "enemies":
                source_file(filename, category, args.move_sources)
    for element, pack in (("aquatic", AQUATIC_ENEMIES), ("efflorescent", EFFLORESCENT_ENEMIES),
                          ("tranquilitic", TRANQUILITIC_ENEMIES), ("voltaic", VOLTAIC_ENEMIES)):
        if element in args.elements:
            for name, asset_id in pack.items():
                export_sprite(f"{name}.png", "enemies", asset_id, args.move_sources, 960, 864)
    for element_id in args.elements:
        element = element_id.capitalize()
        for name in ("Seed", "Bloom", "Shard", "Crest", "Heart", "Soul"):
            export_sprite(f"{name} of {element}.png", "materials",
                          f"{element.lower()}-{name.lower()}", args.move_sources, 256, 224)
    for filename, (category, asset_id) in LANDSCAPES.items():
        element = {"flaming-depths": "infernic", "oceanic-valley": "aquatic",
                   "garden-of-beauty": "efflorescent", "city-of-heaven": "tranquilitic",
                   "galvanic-field": "voltaic"}[asset_id]
        if element not in args.elements:
            continue
        source = source_file(filename, category, args.move_sources)
        output = ROOT / "public" / "assets" / category / f"{asset_id}.png"
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, output)
        print(f"{output.relative_to(ROOT)}: original landscape bytes preserved")


if __name__ == "__main__":
    main()
