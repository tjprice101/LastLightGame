"""Export supplied alpha directly, or process reviewed legacy mattes."""

from collections import deque
from pathlib import Path
import argparse

import numpy as np
from PIL import Image, ImageDraw
from matte_regions import BACKGROUND_SEEDS, BACKGROUND_MINIMUMS

ROOT = Path(__file__).resolve().parents[1]
CANVAS_SIZE = 960
CONTENT_SIZE = 864
ASSETS = {
    "Infernis Beginner.png": ("characters", "infernis"),
    "Tizu Beginner.png": ("characters", "tizu"),
    "Flora Beginner.png": ("characters", "flora"),
    "Embersteel Knight, Infernis.png": ("characters", "infernis-evo-2"),
    "Phoenixflame Templar, Infernis.png": ("characters", "infernis-evo-3"),
    "Prismatic Dawn Ascendant, Infernis.png": ("characters", "infernis-evo-4"),
    "Seraph of the Heavenly Pyre, Infernis.png": ("characters", "infernis-evo-5"),
    "Eternal Heavenflame Sovereign, Infernis.png": ("characters", "infernis-evo-6"),
    "Pearlcurrent Guard, Tizu.png": ("characters", "tizu-evo-2"),
    "Tidalcrest Paladin, Tizu.png": ("characters", "tizu-evo-3"),
    "Prismatic Wave Ascendant, Tizu.png": ("characters", "tizu-evo-4"),
    "Seraph of the Celestial Tide, Tizu.png": ("characters", "tizu-evo-5"),
    "Eternal Heavenwater Sovereign, Tizu.png": ("characters", "tizu-evo-6"),
    "Leaflight Warden, Flora.png": ("characters", "flora-evo-2"),
    "Bloomcrest Paladin, Flora.png": ("characters", "flora-evo-3"),
    "Prismatic Garden Ascendant, Flora.png": ("characters", "flora-evo-4"),
    "Seraph of the Heavenly Bloom, Flora.png": ("characters", "flora-evo-5"),
    "Eternal Heavenbloom Sovereign, Flora.png": ("characters", "flora-evo-6"),
    "Goblin Enemy.png": ("enemies", "goblin"),
    "Imp Enemy.png": ("enemies", "imp"),
    "Rock Golem Enemy.png": ("enemies", "rock-golem"),
    "Ashling.png": ("enemies", "ashling"),
    "Coalcap Kobold.png": ("enemies", "coalcap-kobold"),
    "Emberhorn Faun.png": ("enemies", "emberhorn-faun"),
    "Furnace Salamander.png": ("enemies", "furnace-salamander"),
    "Cinderhide Cyclops.png": ("enemies", "cinderhide-cyclops"),
    "Obsidian Gargoyle.png": ("enemies", "obsidian-gargoyle"),
    "Brasshorn Minotaur.png": ("enemies", "brasshorn-minotaur"),
    "Pyrewing Harpy.png": ("enemies", "pyrewing-harpy"),
    "Magma Wyrm Knight.png": ("enemies", "magma-wyrm-knight"),
    "Ifrit of the Last Furnace.png": ("enemies", "last-furnace-ifrit"),
}
MATTE_MINIMUMS = {"infernis-evo-6": 215, "infernic-bloom": 215, "efflorescent-soul": 170}
MATTE_SPREADS = {"infernic-bloom": 50, "efflorescent-soul": 100}

PALE_ART_REGIONS = {
    "efflorescent-soul": [
        [(0.44, 0.135), (0.599, 0.24), (0.64, 0.17), (0.674, 0.157),
         (0.699, 0.252), (0.714, 0.327), (0.758, 0.3), (0.872, 0.326),
         (0.929, 0.291), (0.912, 0.44), (0.82, 0.54), (0.896, 0.498),
         (0.929, 0.487), (0.939, 0.537), (0.917, 0.625), (0.855, 0.7),
         (0.893, 0.765), (0.821, 0.786), (0.739, 0.752), (0.653, 0.801),
         (0.656, 0.874), (0.595, 0.934), (0.537, 0.902), (0.471, 0.834),
         (0.393, 0.893), (0.26, 0.907), (0.267, 0.938), (0.231, 0.94),
         (0.211, 0.915), (0.21, 0.877), (0.155, 0.878), (0.143, 0.84),
         (0.16, 0.752), (0.2, 0.711), (0.077, 0.678), (0.038, 0.574),
         (0.056, 0.534), (0.191, 0.549), (0.252, 0.556), (0.193, 0.475),
         (0.21, 0.421), (0.176, 0.354), (0.183, 0.297), (0.32, 0.335),
         (0.35, 0.361), (0.347, 0.3), (0.355, 0.249)],
        [(0.453, 0.042), (0.487, 0.071), (0.492, 0.139), (0.477, 0.132), (0.448, 0.098)],
        [(0.298, 0.167), (0.34, 0.167), (0.341, 0.204), (0.317, 0.251), (0.288, 0.212)],
        [(0.03, 0.35), (0.09, 0.38), (0.142, 0.41), (0.205, 0.471), (0.158, 0.474), (0.07, 0.439)],
    ],
    "infernis-evo-6": [
        [(0.1964, 0.1293), (0.2143, 0.1455), (0.2386, 0.1821),
         (0.2606, 0.235), (0.2646, 0.265), (0.2305, 0.2446),
         (0.2102, 0.2123), (0.1972, 0.1778)],
        [(0.8003, 0.1293), (0.7808, 0.1455), (0.7581, 0.1821),
         (0.7354, 0.235), (0.7297, 0.265), (0.7662, 0.2446),
         (0.7865, 0.2123), (0.7995, 0.1778)],
        [(0.355, 0.247), (0.345, 0.345), (0.335, 0.425), (0.3, 0.485),
         (0.25, 0.535), (0.175, 0.535), (0.125, 0.505), (0.175, 0.44),
         (0.19, 0.36), (0.235, 0.3)],
        [(0.645, 0.247), (0.655, 0.345), (0.665, 0.425), (0.7, 0.485),
         (0.75, 0.535), (0.825, 0.535), (0.875, 0.505), (0.825, 0.44),
         (0.81, 0.36), (0.765, 0.3)],
    ],
    "tizu-evo-5": [
        [(0.173, 0.224), (0.194, 0.222), (0.21, 0.25),
         (0.211, 0.294), (0.19, 0.3), (0.17, 0.269)],
    ],
    "flora-evo-6": [
        [(0.568, 0.817), (0.573, 0.788), (0.593, 0.756),
         (0.618, 0.737), (0.606, 0.773), (0.597, 0.801)],
    ],
}

PALE_ART_CUTOUTS = {
    "efflorescent-soul": [
        [(0.78, 0.552), (0.865, 0.509), (0.886, 0.523), (0.878, 0.556),
         (0.852, 0.594), (0.804, 0.63), (0.783, 0.611)],
        [(0.276, 0.879), (0.365, 0.843), (0.416, 0.82), (0.452, 0.846),
         (0.48, 0.842), (0.472, 0.864), (0.423, 0.891), (0.32, 0.903)],
    ],
}


def pale_art_mask(image, asset_id):
    regions = PALE_ART_REGIONS.get(asset_id)
    if not regions:
        return None
    mask = Image.new("L", image.size)
    draw = ImageDraw.Draw(mask)
    for points in regions:
        draw.polygon([(round(x * image.width), round(y * image.height)) for x, y in points], fill=255)
    for points in PALE_ART_CUTOUTS.get(asset_id, ()):
        draw.polygon([(round(x * image.width), round(y * image.height)) for x, y in points], fill=0)
    return mask


def standardize_sprite(image, canvas_size=CANVAS_SIZE, content_size=CONTENT_SIZE):
    rgba = image.convert("RGBA")
    bbox = rgba.getbbox()
    if not bbox:
        raise ValueError("Cannot standardize an empty sprite.")
    cropped = rgba.crop(bbox)
    scale = content_size / max(cropped.size)
    size = tuple(max(1, round(dimension * scale)) for dimension in cropped.size)
    resized = cropped.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (canvas_size, canvas_size))
    canvas.paste(resized, ((canvas_size - size[0]) // 2, (canvas_size - size[1]) // 2))
    return canvas


def supplied_cutout(asset_id):
    paths = [ROOT / "Art" / "source" / "cutouts" / category / f"{asset_id}.png"
             for category in ("characters", "enemies", "materials", "abilities")]
    matches = [path for path in paths if path.is_file()]
    if len(matches) > 1:
        raise ValueError(f"Duplicate supplied cutout for {asset_id}.")
    return matches[0] if matches else None


def prepare_sprite(source, asset_id, canvas_size=CANVAS_SIZE, content_size=CONTENT_SIZE, **matte_options):
    cutout = supplied_cutout(asset_id)
    with Image.open(cutout or source) as image:
        if cutout:
            if image.mode != "RGBA" or image.getextrema()[3][0] != 0 or not image.getbbox():
                raise ValueError(f"Supplied cutout must be nonempty RGBA with transparent pixels: {cutout}")
            return standardize_sprite(image, canvas_size, content_size)
        matte_options.setdefault("foreground_mask", pale_art_mask(image, asset_id))
        return remove_matte(image, canvas_size, content_size, **matte_options)


def connected_matte(eligible, starts):
    height, width = eligible.shape
    background = np.zeros((height, width), dtype=bool)
    queue = deque()
    for y, x in starts:
        if eligible[y, x] and not background[y, x]:
            background[y, x] = True
            queue.append((y, x))
    while queue:
        y, x = queue.popleft()
        for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= yy < height and 0 <= xx < width and eligible[yy, xx] and not background[yy, xx]:
                background[yy, xx] = True
                queue.append((yy, xx))
    return background


def remove_matte(image, canvas_size=CANVAS_SIZE, content_size=CONTENT_SIZE, matte_minimum=230, matte_spread=20, foreground_mask=None, background_seeds=(), background_minimum=230, standardize=True):
    if not isinstance(matte_minimum, int) or not 0 <= matte_minimum <= 255:
        raise ValueError("Matte minimum must be an integer from 0 to 255.")
    if not isinstance(matte_spread, int) or not 0 <= matte_spread <= 255:
        raise ValueError("Matte spread must be an integer from 0 to 255.")
    if not isinstance(background_minimum, int) or not 0 <= background_minimum <= 255:
        raise ValueError("Background minimum must be an integer from 0 to 255.")
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    low, high = rgb.min(axis=2), rgb.max(axis=2)
    eligible = (low >= matte_minimum) & (high - low <= matte_spread)
    if foreground_mask is not None:
        if foreground_mask.size != image.size:
            raise ValueError("Foreground mask must match source image size.")
        eligible &= np.asarray(foreground_mask.convert("L")) == 0
    height, width = eligible.shape
    border = [(0, x) for x in range(width)] + [(height - 1, x) for x in range(width)] + [
        (y, x) for y in range(height) for x in (0, width - 1)
    ]
    background = connected_matte(eligible, border)
    interior = (low >= background_minimum) & (high - low <= matte_spread)
    if foreground_mask is not None:
        interior &= np.asarray(foreground_mask.convert("L")) == 0
    seeds = []
    for point in background_seeds:
        if len(point) != 2 or any(not np.isfinite(value) or not 0 <= value < 1 for value in point):
            raise ValueError("Background seeds require normalized x/y coordinates in [0, 1).")
        x, y = int(point[0] * width), int(point[1] * height)
        if not interior[y, x]:
            raise ValueError(f"Background seed {point} is not eligible matte; review the source.")
        seeds.append((y, x))
    if seeds:
        background |= connected_matte(interior, seeds)

    alpha = np.where(background, 0.0, 1.0)
    # Recover anti-aliased edge pixels from their neighboring foreground color.
    for y, x in zip(*np.where(background & (low < 250))):
        neighbors = rgb[max(0, y - 1):y + 2, max(0, x - 1):x + 2]
        mask = background[max(0, y - 1):y + 2, max(0, x - 1):x + 2]
        foreground = neighbors[~mask]
        if not len(foreground):
            continue
        fg = foreground[np.argmin(foreground.min(axis=1))]
        channel = int(np.argmin(fg))
        coverage = (255 - rgb[y, x, channel]) / max(1, 255 - fg[channel])
        if 0.04 <= coverage < 1:
            alpha[y, x] = coverage
    partial = (alpha > 0) & (alpha < 1)
    rgb[partial] = np.clip(
        (rgb[partial] - 255 * (1 - alpha[partial, None])) / alpha[partial, None], 0, 255
    )
    rgb[alpha == 0] = 0
    rgba = np.dstack((rgb, alpha * 255)).astype(np.uint8)
    result = Image.fromarray(rgba)
    return standardize_sprite(result, canvas_size, content_size) if standardize else result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--move-sources", action="store_true")
    parser.add_argument("--assets", nargs="+", choices=[asset_id for _, asset_id in ASSETS.values()],
                        help="Process only the named asset IDs; omit to regenerate all unit art.")
    args = parser.parse_args()
    for filename, (category, asset_id) in ASSETS.items():
        if args.assets and asset_id not in args.assets:
            continue
        original = ROOT / "Art" / "source" / category / filename
        if args.move_sources and (ROOT / filename).exists():
            if original.exists():
                raise FileExistsError(original)
            original.parent.mkdir(parents=True, exist_ok=True)
            (ROOT / filename).rename(original)
        if not original.is_file():
            raise FileNotFoundError(original)
        output = ROOT / "public" / "assets" / category / f"{asset_id}.png"
        output.parent.mkdir(parents=True, exist_ok=True)
        result = prepare_sprite(original, asset_id, matte_minimum=MATTE_MINIMUMS.get(asset_id, 230),
                                background_seeds=BACKGROUND_SEEDS.get(asset_id, ()),
                                background_minimum=BACKGROUND_MINIMUMS.get(asset_id, 230))
        result.save(output, optimize=True)
        alpha = np.asarray(result)[:, :, 3]
        assert result.size == (CANVAS_SIZE, CANVAS_SIZE)
        bbox = result.getbbox()
        assert bbox and max(bbox[2] - bbox[0], bbox[3] - bbox[1]) == CONTENT_SIZE
        assert min(bbox[0], bbox[1], CANVAS_SIZE - bbox[2], CANVAS_SIZE - bbox[3]) >= 48
        assert (alpha == 0).any() and (alpha == 255).any()
        assert ((alpha > 0) & (alpha < 255)).any()
        assert not alpha[0].any() and not alpha[-1].any()
        assert not alpha[:, 0].any() and not alpha[:, -1].any()
        print(f"{output.relative_to(ROOT)}: {result.size}, transparent border, soft alpha edges")


if __name__ == "__main__":
    main()
