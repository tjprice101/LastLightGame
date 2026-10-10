import json
import unittest

from PIL import Image

from ability_art_revisions import OUTPUT as ABILITY_REVISIONS, revision_source as ability_revision_source
from intake_d157_root_art import (
    ASSET_SETTINGS, MANIFEST, ROOT, assets, digest, plan, prepare, source_for,
)
from intake_prism_currency_art import REVISIONS as CURRENCY_REVISIONS
from intake_character_refresh import clean
from prepare_currencies import current_currency_source, prepare_currency_sprite


class D157RootArtIntakeTests(unittest.TestCase):
    def test_exact_incoming_mappings_and_individual_processing(self):
        mapped = assets()
        self.assertEqual(len(mapped), 4)
        self.assertEqual({asset.asset for asset in mapped}, set(ASSET_SETTINGS))
        self.assertEqual(sum(asset.category == "abilities" for asset in mapped), 2)
        self.assertEqual(sum(asset.category == "currencies" for asset in mapped), 2)
        self.assertEqual(len({asset.incoming for asset in mapped}), 4)

    def test_source_hashes_current_exports_and_preserved_currency_exports(self):
        planned, _, _ = plan()
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        records = {row["asset"]: row for row in manifest["assets"]}
        self.assertEqual(manifest["decision"], "D-157")
        self.assertEqual(manifest["asset_count"], 4)
        self.assertEqual(len(planned), 4)
        self.assertFalse(list(ROOT.glob("*.png")), "Root-level PNG deliveries remain unintaken.")
        for asset, _, _, record in planned:
            with self.subTest(asset=asset.asset):
                self.assertFalse((ROOT / asset.incoming).exists())
                self.assertEqual(record, records[asset.asset])
                self.assertEqual(digest(asset.source), record["source_sha256"])
                self.assertEqual(digest(asset.runtime), record["runtime_sha256"])
                output, _ = prepare(asset.source, asset)
                self.assertEqual(output, asset.runtime.read_bytes())
                with Image.open(asset.runtime) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (256, 256))
                    self.assertEqual(image.getextrema()[3], (0, 255))
                    self.assertEqual(image.getpixel((0, 0))[3], 0)
                    alpha_box = image.getchannel("A").getbbox()
                    self.assertGreaterEqual(min(alpha_box[0], alpha_box[1],
                                                256 - alpha_box[2], 256 - alpha_box[3]), 16)
                if asset.previous_runtime:
                    self.assertEqual(digest(asset.previous_runtime), record["previous_runtime_sha256"])

    def test_runtime_exporters_use_approved_currency_sources(self):
        for asset in (item for item in assets() if item.category == "currencies"):
            with self.subTest(asset=asset.asset):
                self.assertEqual(current_currency_source(
                    "Fractalis" if asset.asset == "fractalis" else "Lycalis", asset.asset), asset.source)
                with Image.open(asset.runtime) as runtime:
                    self.assertEqual(prepare_currency_sprite(asset.source, asset.asset).tobytes(),
                                     runtime.convert("RGBA").tobytes())
        self.assertEqual(ABILITY_REVISIONS.read_text(encoding="utf-8"), ability_revision_source())
        currency_records = {row["asset"]: row for row in json.loads(
            MANIFEST.read_text(encoding="utf-8"))["assets"] if row["category"] == "currencies"}
        revisions = CURRENCY_REVISIONS.read_text(encoding="utf-8")
        for record in currency_records.values():
            self.assertIn(f"'{record['asset']}': '{record['runtime_sha256'][:16]}'",
                          revisions)

    def test_reviewed_keys_remove_frame_and_preserve_pale_and_dark_subjects(self):
        subject_points = {
            "universal-normal-attack": [(512, 512), (400, 600)],
            "universal-defense": [(512, 64), (130, 512)],
            "fractalis": [(512, 512), (300, 800)],
            "lycalis": [(512, 512), (512, 250)],
        }
        for asset in assets():
            with self.subTest(asset=asset.asset):
                with Image.open(source_for(asset)) as image:
                    result = clean(image, ASSET_SETTINGS[asset.asset])
                for point in ((0, 0), (1023, 0), (0, 1023), (1023, 1023)):
                    self.assertEqual(result.getpixel(point)[3], 0)
                for point in subject_points[asset.asset]:
                    self.assertEqual(result.getpixel(point)[3], 255, point)


if __name__ == "__main__":
    unittest.main()
