import json
import unittest
from PIL import Image

from intake_prism_currency_art import ROOT, ASSETS, SETTINGS, MANIFEST, REVISIONS, source_path, prepare, digest
from intake_character_refresh import clean
from prepare_currencies import current_currency_source, prepare_currency_sprite


class PrismCurrencyIntakeTests(unittest.TestCase):
    def test_original_export_history_and_exact_regeneration(self):
        records = json.loads(MANIFEST.read_text(encoding="utf-8"))["assets"]
        for name, asset in ASSETS.items():
            with self.subTest(asset=asset):
                record = next(row for row in records if row["asset"] == asset)
                for category in ("source", "runtime", "previous_runtime"):
                    self.assertEqual(digest(ROOT / record[category]), record[f"{category}_sha256"])
                self.assertFalse((ROOT / f"{name}.png").exists())
                self.assertIn(f"'{asset}': '{record['runtime_sha256'][:16]}'", REVISIONS.read_text())
                with Image.open(ROOT / record["runtime"]) as actual:
                    self.assertEqual(actual.mode, "RGBA")
                    self.assertEqual(actual.size, (256, 256))
                    self.assertEqual(actual.tobytes(), prepare(source_path(name), asset).tobytes())
                    left, top, right, bottom = actual.getbbox()
                    self.assertGreaterEqual(min(left, top, 256 - right, 256 - bottom), 16)
                    self.assertEqual(actual.getpixel((0, 0))[3], 0)

    def test_regular_exporter_selects_new_source_and_does_not_use_old_brown_masks(self):
        for name, asset in ASSETS.items():
            source = current_currency_source("Fractalis" if asset == "fractalis" else "Lycalis", asset)
            self.assertEqual(source, source_path(name))
            self.assertEqual(prepare_currency_sprite(source, asset).tobytes(), prepare(source, asset).tobytes())
            with Image.open(source) as image:
                result = clean(image, SETTINGS[asset])
                self.assertEqual(result.getpixel((0, 0))[3], 0)
                self.assertEqual(result.getpixel((512, 600))[3], 255)

    def test_supplied_alpha_and_subject_key_colors_are_preserved(self):
        for asset in ASSETS.values():
            image = Image.new("RGBA", (30, 30))
            image.putpixel((15, 15), (*SETTINGS[asset]["keys"][0], 128))
            self.assertEqual(clean(image, SETTINGS[asset]).tobytes(), image.tobytes())
