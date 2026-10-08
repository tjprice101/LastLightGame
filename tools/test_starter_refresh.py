"""Replacement starter provenance, cleanup, shared export routing and facing."""

from io import BytesIO
import json
import unittest

import numpy as np
from PIL import Image

from intake_starter_refresh import ASSETS, MANIFEST, ROOT, clean, digest, load_settings, prepare
from prepare_art import prepare_sprite


class StarterRefreshTests(unittest.TestCase):
    def test_all18_originals_previous_exports_and_current_exports_are_verified(self):
        records = json.loads(MANIFEST.read_text(encoding="utf-8"))
        settings = load_settings()
        self.assertEqual(records["asset_count"], 18)
        self.assertEqual(len(records["assets"]), 18)
        self.assertEqual({row["asset"] for row in records["assets"]}, set(settings))
        for row in records["assets"]:
            with self.subTest(asset=row["asset"]):
                self.assertFalse((ROOT / row["incoming"]).exists())
                self.assertEqual(row["processing"], settings[row["asset"]])
                for key, hash_key in (("source", "source_sha256"), ("runtime", "runtime_sha256"),
                                      ("previous_runtime", "previous_runtime_sha256")):
                    self.assertEqual(digest(ROOT / row[key]), row[hash_key])
                output = prepare(ROOT / row["source"], settings[row["asset"]])
                buffer = BytesIO()
                output.save(buffer, format="PNG", optimize=True)
                self.assertEqual(buffer.getvalue(), (ROOT / row["runtime"]).read_bytes())
                self.assertEqual(output.mode, "RGBA")
                self.assertEqual(output.size, (960, 960))
                left, top, right, bottom = output.getbbox()
                self.assertEqual(max(right - left, bottom - top), 864)
                self.assertGreaterEqual(min(left, top, 960 - right, 960 - bottom), 48)

    def test_reviewed_background_holes_are_clear_and_pale_foreground_survives(self):
        settings = load_settings()
        for _, asset in ASSETS:
            with self.subTest(asset=asset), Image.open(
                    ROOT / "Art" / "source" / "starter-refresh" / f"{asset}.png") as source:
                result = clean(source, settings[asset])
                self.assertEqual(result.getpixel((0, 0))[3], 0)
                for x, y in settings[asset].get("background_seeds", []):
                    self.assertEqual(result.getpixel((round(x * source.width), round(y * source.height)))[3], 0)
        for asset, points in {
            "flora-evo-6": [(310, 250), (700, 680)],
            "tizu-evo-4": [(850, 170), (630, 370)],
            "infernis-evo-6": [(530, 470), (710, 530)],
        }.items():
            with Image.open(ROOT / "Art" / "source" / "starter-refresh" / f"{asset}.png") as source:
                result = clean(source, settings[asset])
                for point in points:
                    self.assertEqual(result.getpixel(point), (*source.getpixel(point), 255), (asset, point))

    def test_legacy_exporters_use_current_sources_not_previous_alpha_or_white_masks(self):
        settings = load_settings()
        for filename, asset in ASSETS:
            with self.subTest(asset=asset):
                source = ROOT / "Art" / "source" / "starter-refresh" / f"{asset}.png"
                expected = prepare(source, settings[asset], 120, 108)
                actual = prepare_sprite(ROOT / filename, asset, 120, 108,
                                        background_seeds=[(-1, -1)], matte_minimum=-1)
                np.testing.assert_array_equal(np.asarray(actual), np.asarray(expected))

    def test_supplied_alpha_never_receives_background_removal(self):
        source = Image.new("RGBA", (20, 20))
        source.putpixel((10, 10), (0, 255, 0, 123))
        np.testing.assert_array_equal(np.asarray(clean(source, {})), np.asarray(source))


if __name__ == "__main__":
    unittest.main()
