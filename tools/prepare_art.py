"""Remove border-connected white mattes without erasing enclosed white clothing."""

from collections import deque
from pathlib import Path
import argparse

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = {
    "Infernis Beginner.png": ("characters", "infernis"),
    "Tizu Beginner.png": ("characters", "tizu"),
    "Flores Beginner.png": ("characters", "flores"),
    "Goblin Enemy.png": ("enemies", "goblin"),
    "Imp Enemy.png": ("enemies", "imp"),
    "Rock Golem Enemy.png": ("enemies", "rock-golem"),
}


def remove_matte(image):
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    low, high = rgb.min(axis=2), rgb.max(axis=2)
    eligible = (low >= 230) & (high - low <= 20)
    height, width = eligible.shape
    background = np.zeros((height, width), dtype=bool)
    queue = deque()
    for y, x in [(0, x) for x in range(width)] + [(height - 1, x) for x in range(width)] + [
        (y, x) for y in range(height) for x in (0, width - 1)
    ]:
        if eligible[y, x] and not background[y, x]:
            background[y, x] = True
            queue.append((y, x))
    while queue:
        y, x = queue.popleft()
        for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= yy < height and 0 <= xx < width and eligible[yy, xx] and not background[yy, xx]:
                background[yy, xx] = True
                queue.append((yy, xx))

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
    bbox = result.getbbox()
    if not bbox:
        raise ValueError("Matte removal produced an empty image.")
    cropped = result.crop(bbox)
    padded = Image.new("RGBA", (cropped.width + 32, cropped.height + 32))
    padded.paste(cropped, (16, 16))
    padded.thumbnail((960, 960), Image.Resampling.LANCZOS)
    return padded


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--move-sources", action="store_true")
    args = parser.parse_args()
    for filename, (category, asset_id) in ASSETS.items():
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
        with Image.open(original) as image:
            result = remove_matte(image)
            result.save(output, optimize=True)
        alpha = np.asarray(result)[:, :, 3]
        assert (alpha == 0).any() and (alpha == 255).any()
        assert ((alpha > 0) & (alpha < 255)).any()
        assert not alpha[0].any() and not alpha[-1].any()
        assert not alpha[:, 0].any() and not alpha[:, -1].any()
        print(f"{output.relative_to(ROOT)}: {result.size}, transparent border, soft alpha edges")


if __name__ == "__main__":
    main()
