import unittest
import hashlib
import json
from PIL import Image
from prepare_art import ROOT
from prepare_currencies import CURRENCIES, prepare_currency_sprite, remove_currency_matte
from art_library import art_path


class CurrencyArtTests(unittest.TestCase):
    def test_reproducible_transparent_padded_exports(self):
        for name, asset in CURRENCIES.items():
            with self.subTest(asset=asset):
                source = ROOT / "Art" / "source" / "currencies" / f"{name}.png"
                historical = ROOT / "Art" / "source" / "currencies" / "previous-runtime" / f"{asset}.png"
                actual = Image.open(historical if historical.exists() else ROOT / "public" / "assets" / "currencies" / f"{asset}.png")
                expected = prepare_currency_sprite(source, asset)
                self.assertEqual(actual.mode, "RGBA")
                self.assertEqual(actual.size, (256, 256))
                self.assertEqual(actual.tobytes(), expected.tobytes())
                left, top, right, bottom = actual.getbbox()
                self.assertGreaterEqual(min(left, top, 256 - right, 256 - bottom), 16)
                self.assertGreater(max(right - left, bottom - top), 220)
                self.assertEqual(actual.getpixel((0, 0))[3], 0)

    def test_coin_residue_and_rim_survive_without_cast_shadow(self):
        image = Image.open(ROOT / "Art" / "source" / "currencies" / "Fractalis.png")
        result = remove_currency_matte(image, "fractalis")
        for point in [(512, 420), (260, 400), (380, 210), (700, 760), (510, 935), (150, 810)]:
            self.assertEqual(result.getpixel(point), (*image.convert("RGB").getpixel(point), 255))
        for point in [(0, 0), (965, 680), (650, 920), (920, 760), (780, 900)]:
            self.assertEqual(result.getpixel(point)[3], 0)

    def test_rose_thorn_and_highlights_survive_without_sparkle_spill(self):
        image = Image.open(ROOT / "Art" / "source" / "currencies" / "Lycalis.png")
        result = remove_currency_matte(image, "lycalis")
        for point in [(512, 410), (600, 290), (435, 590), (320, 800), (500, 680), (384, 140)]:
            self.assertEqual(result.getpixel(point), (*image.convert("RGB").getpixel(point), 255))
        for point in [(0, 0), (380, 100), (360, 150), (800, 215)]:
            self.assertEqual(result.getpixel(point)[3], 0)

    def test_unknown_asset_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "Unknown currency"):
            prepare_currency_sprite(ROOT / "missing.png", "unknown")

    def test_review_records_match_preserved_sources_and_runtime_files(self):
        records = json.loads((art_path("matte-review.json", root=ROOT)).read_text(encoding="utf-8"))["assets"]
        for asset in CURRENCIES.values():
            record = next(entry for entry in records if entry["asset"] == asset)
            for category in ("source", "runtime"):
                path = ROOT / record[category]
                historical = ROOT / "Art" / "source" / "currencies" / "previous-runtime" / f"{asset}.png"
                if category == "runtime" and historical.exists():
                    path = historical
                self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), record[f"{category}_sha256"])


if __name__ == "__main__":
    unittest.main()
