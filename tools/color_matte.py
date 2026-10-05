"""Offline removal of reviewed contrasting color backgrounds, including openings."""

import numpy as np
from PIL import Image
from prepare_art import connected_matte


def remove_color_matte(image, hue, tolerance=14, saturation_min=.30, value_min=.10,
                       border_only=False, foreground_mask=None):
    if not (0 <= hue < 360 and 0 < tolerance < 180 and
            0 < saturation_min < 1 and 0 <= value_min < 1):
        raise ValueError("Invalid reviewed color-matte settings.")
    rgb = np.asarray(image.convert("RGB"))
    hsv = np.asarray(image.convert("RGB").convert("HSV"), dtype=np.float32)
    delta = np.abs((hsv[:, :, 0] * 360 / 255 - hue + 180) % 360 - 180)
    saturation, value = hsv[:, :, 1] / 255, hsv[:, :, 2] / 255
    eligible = (delta <= tolerance) & (saturation >= saturation_min) & (value >= value_min)
    if foreground_mask is not None:
        if foreground_mask.size != image.size:
            raise ValueError("Foreground mask must match source image size.")
        eligible &= np.asarray(foreground_mask.convert("L")) == 0
    if border_only:
        height, width = eligible.shape
        border = [(0, x) for x in range(width)] + [(height - 1, x) for x in range(width)]
        border += [(y, x) for y in range(height) for x in (0, width - 1)]
        eligible = connected_matte(eligible, border)
    if not eligible.any():
        raise ValueError("Reviewed color did not match any background pixels.")
    rgba = np.dstack((rgb, np.where(eligible, 0, 255).astype(np.uint8)))
    rgba[eligible, :3] = 0
    return Image.fromarray(rgba)
