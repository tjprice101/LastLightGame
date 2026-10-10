import json
import unittest
from PIL import Image

from intake_prism_currency_art import ROOT, ASSETS, SETTINGS, MANIFEST, source_path, prepare, digest
from intake_character_refresh import clean
from prepare_currencies import current_currency_source, prepare_currency_sprite
from intake_d157_root_art import ASSET_SETTINGS as D157_SETTINGS, assets as delivered_assets
from intake_d157_root_art import prepare as prepare_delivered


class PrismCurrencyIntakeTests(unittest.TestCase):
    def test_original_export_history_and_exact_regeneration(self):
        records = json.loads(MANIFEST.read_text(encoding="utf-8"))["assets"]
        delivered_records = {row["asset"]: row for row in json.loads(
            (ROOT / "Art" / "provenance" / "d157-root-art-intake.json")
            .read_text(encoding="utf-8"))["assets"]}
        delivered_assets_by_id = {row.asset: row for row in delivered_assets()}
        for name, asset in ASSETS.items():
            with self.subTest(asset=asset):
                record = next(row for row in records if row["asset"] == asset)
                self.assertEqual(digest(ROOT / record["source"]), record["source_sha256"])
                self.assertEqual(digest(ROOT / record["runtime"]), record["runtime_sha256"])
                self.assertEqual(digest(ROOT / record["previous_runtime"]), record["previous_runtime_sha256"])
                prior_export = ROOT / delivered_records[asset]["previous_runtime"]
                self.assertEqual(record["runtime"], delivered_records[asset]["previous_runtime"])
                self.assertEqual(digest(prior_export), record["runtime_sha256"])
                self.assertFalse((ROOT / f"{name}.png").exists())
                delivered = delivered_assets_by_id[asset]
                new_source = delivered.source
                new_output, _ = prepare_delivered(new_source, delivered)
                with Image.open(prior_export) as actual:
                    self.assertEqual(actual.mode, "RGBA")
                    self.assertEqual(actual.size, (256, 256))
                    self.assertEqual(actual.tobytes(), prepare(source_path(name), asset).tobytes())
                    left, top, right, bottom = actual.getbbox()
                    self.assertGreaterEqual(min(left, top, 256 - right, 256 - bottom), 16)
                    self.assertEqual(actual.getpixel((0, 0))[3], 0)
                self.assertEqual(new_output, delivered.runtime.read_bytes())

    def test_regular_exporter_selects_new_source_and_does_not_use_old_brown_masks(self):
        for name, asset in ASSETS.items():
            source = current_currency_source("Fractalis" if asset == "fractalis" else "Lycalis", asset)
            delivered = next(row for row in delivered_assets() if row.asset == asset)
            self.assertEqual(source, delivered.source)
            with Image.open(delivered.runtime) as runtime:
                self.assertEqual(prepare_currency_sprite(source, asset).tobytes(),
                                 runtime.convert("RGBA").tobytes())
            with Image.open(source) as image:
                result = clean(image, D157_SETTINGS[asset])
                self.assertEqual(result.getpixel((0, 0))[3], 0)
                self.assertEqual(result.getpixel((512, 512))[3], 255)

    def test_supplied_alpha_and_subject_key_colors_are_preserved(self):
        for asset in ASSETS.values():
            image = Image.new("RGBA", (30, 30))
            image.putpixel((15, 15), (*SETTINGS[asset]["keys"][0], 128))
            self.assertEqual(clean(image, SETTINGS[asset]).tobytes(), image.tobytes())
