"""Preserve and export Heaven/Abyss artwork without modifying existing packs."""
import shutil
import argparse
from PIL import Image, ImageDraw
from prepare_art import ROOT, prepare_sprite, supplied_cutout, standardize_sprite
from prepare_dungeons import source_file
from matte_regions import BACKGROUND_SEEDS, BACKGROUND_MINIMUMS
from color_matte import remove_color_matte

ENEMIES = {
    "Dawnthorn Slime": "heavens-dawnthorn-slime",
    "Scarlet Benediction, Dawnthorn Slime": "heavens-scarlet-benediction",
    "Gilded Reproach, Dawnthorn Slime": "heavens-gilded-reproach",
    "Thorns of the First Light, Dawnthorn Slime": "heavens-thorns-first-light",
    "Crimson Reckoning, Dawnthorn Slime": "heavens-crimson-reckoning",
    "The Dawn Without Mercy, Dawnthorn Slime": "heavens-dawn-without-mercy",
    "Wraththorn Slime": "abyss-wraththorn-slime",
    "Starless Murmur, Wraththorn Slime": "abyss-starless-murmur",
    "Ruin's Awakening, Wraththorn Slime": "abyss-ruins-awakening",
    "Hunger Beyond the Veil, Wraththorn Slime": "abyss-hunger-beyond-veil",
    "Worldfall Reverie, Wraththorn Slime": "abyss-worldfall-reverie",
    "The Night Without End, Wraththorn Slime": "abyss-night-without-end",
}
MATERIALS = {
    "Dawnsteel of Judgment": "heavens-dawnsteel-of-judgment",
    "Crown of the Scarlet Oath": "heavens-crown-scarlet-oath",
    "Chalice of the Undying Dawn": "heavens-chalice-undying-dawn",
    "Voidfang of Ruin": "abyss-voidfang-of-ruin",
    "Heart of the Shattered Void": "abyss-heart-shattered-void",
    "Hourglass of Endless Wrath": "abyss-hourglass-endless-wrath",
}
LANDSCAPES = {
    "Selection banner - Gate of the Scarlet Firmament": ("banners", "heavens-banner"),
    "Selection banner - Gate of the Wrathbound Void": ("banners", "abyss-banner"),
    "Battle arena - Tribunal of the Crownthorn Dawn": ("backgrounds", "heavens-arena"),
    "Battle arena - Court of the Shattered Cosmos": ("backgrounds", "abyss-arena"),
}

def has_infusion_color_matte(asset):
    return asset == "abyss-heart-shattered-void"


def remove_heart_matte(image):
    mask = Image.new("L", image.size)
    draw = ImageDraw.Draw(mask)
    for points in (
        ((.744, .462), (.802, .507), (.746, .544)),
        ((.294, .655), (.352, .703), (.298, .730)),
        ((.438, .173), (.472, .208), (.421, .214)),
    ):
        draw.polygon([(round(x * image.width), round(y * image.height)) for x, y in points], fill=255)
    return remove_color_matte(image, hue=144, tolerance=22, saturation_min=.20,
                              foreground_mask=mask)


def prepare_infusion_sprite(source, asset, size, content):
    if has_infusion_color_matte(asset) and not supplied_cutout(asset):
        with Image.open(source) as image:
            return standardize_sprite(remove_heart_matte(image), size, content)
    ivory = asset == "heavens-chalice-undying-dawn"
    return prepare_sprite(source, asset, size, content, matte_minimum=215 if ivory else 230,
                          matte_spread=50 if ivory else 20,
                          background_seeds=BACKGROUND_SEEDS.get(asset, ()),
                          background_minimum=BACKGROUND_MINIMUMS.get(asset, 230))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--assets", nargs="+", choices=[*ENEMIES.values(), *MATERIALS.values(),
                                                       *(asset for _, asset in LANDSCAPES.values())])
    args = parser.parse_args()
    for category, entries, size, content in [("enemies", ENEMIES, 960, 864), ("materials", MATERIALS, 256, 224)]:
        for name, asset in entries.items():
            if args.assets and asset not in args.assets:
                continue
            source = source_file(f"{name}.png", category, True)
            output = ROOT / "public" / "assets" / category / f"{asset}.png"
            output.parent.mkdir(parents=True, exist_ok=True)
            prepare_infusion_sprite(source, asset, size, content).save(output, optimize=True)
            print(output.relative_to(ROOT))
    for name, (category, asset) in LANDSCAPES.items():
        if args.assets and asset not in args.assets:
            continue
        source = source_file(f"{name}.png", category, True)
        output = ROOT / "public" / "assets" / category / f"{asset}.png"
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, output)
        print(output.relative_to(ROOT))
