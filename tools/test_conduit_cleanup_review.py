import unittest

from conduit_cleanup_review import CHANGED_NOTES, ROOT, _asset_sources, review_document, verify_review
from intake_delivered_art import assets, _settings, clean_for_export
from intake_master_conduit_art import assets as master_assets, clean as clean_master, load_settings as load_master_settings
from PIL import Image


class ConduitCleanupReviewTests(unittest.TestCase):
    def test_followup_openings_are_transparent_and_authored_shadows_stay_opaque(self):
        samples = {
            "fieldbrace-coupler": ([(.29, .73), (.75, .76), (.49, .71)], (.35, .82)),
            "reserve-torque-crank": ([(.35, .52), (.65, .52), (.50, .87)], (.50, .94)),
            "horizon-heartcase": ([(.28, .78), (.70, .79), (.47, .82)], (.70, .93)),
            "luminous-dawn-witness-array": ([(.43, .70), (.58, .78)], (.25, .91)),
        }
        for asset in assets():
            if asset.asset not in samples:
                continue
            with self.subTest(asset=asset.asset), Image.open(asset.source) as original:
                result = clean_for_export(original, _settings(asset), asset.asset)
                gaps, shadow = samples[asset.asset]
                for x, y in gaps:
                    self.assertEqual(result.getpixel((round(x * original.width), round(y * original.height)))[3], 0)
                point = (round(shadow[0] * original.width), round(shadow[1] * original.height))
                self.assertEqual(result.getpixel(point), (*original.convert("RGB").getpixel(point), 255))

    def test_all_installed_icons_have_reproducible_manual_review_records(self):
        verify_review()
        review = review_document()
        self.assertEqual(review["asset_count"], 135)
        self.assertEqual(review["ordinary_conduit_count"], 85)
        self.assertEqual(review["kit_conduit_count"], 25)
        self.assertEqual(review["master_conduit_count"], 50)
        self.assertEqual(review["master_character_icon_count"], 48)
        self.assertEqual(review["master_related_asset_count"], 2)
        self.assertEqual(review["changed_count"], 31)
        self.assertEqual(review["undelivered_kit_icon_count"], 0)
        self.assertTrue(review["kit_icons_reviewed"])
        records = {record["asset"]: record for record in review["assets"]}
        self.assertEqual(set(records), set(_asset_sources()))
        for asset_id, record in records.items():
            with self.subTest(asset=asset_id):
                self.assertEqual(len(record["source_sha256"]), 64)
                self.assertEqual(len(record["before_sha256"]), 64)
                self.assertEqual(len(record["after_sha256"]), 64)
                self.assertEqual(record["manual_review"]["source"], "full-resolution original")
                self.assertEqual(record["manual_review"]["runtime_backgrounds"], ["dark", "light"])
                self.assertTrue(record["manual_review"]["magnified_candidates"])
                if asset_id in CHANGED_NOTES:
                    self.assertEqual(record["verdict"], "corrected")
                    self.assertNotEqual(record["before_sha256"], record["after_sha256"])
                    previous = ROOT / record["previous_runtime"].replace("\\", "/")
                    self.assertTrue(previous.is_file())
                    self.assertEqual(record["previous_runtime_sha256"], record["before_sha256"])
                else:
                    self.assertEqual(record["verdict"], "no-change")
                    self.assertIsNone(record["previous_runtime"])

    def test_master_gap_seeds_remove_backdrop_without_erasing_ground_shadows(self):
        settings = load_master_settings()
        samples = {
            "master-bliss-1": [(0.3335, 0.2349)],
            "master-tide-3": [(0.5699, 0.2498)],
            "master-aurora-2": [(0.5, 0.95)],
            "master-thornia-3": [(0.4812, 0.8968)],
            "master-vaelor-3": [(0.3181, 0.8682)],
        }
        for asset, _, source, _ in master_assets():
            if asset not in samples:
                continue
            with self.subTest(asset=asset), Image.open(source) as original:
                result = clean_master(original, settings[asset])
                expected_alpha = 0 if asset in {"master-bliss-1", "master-tide-3"} else 255
                for x, y in samples[asset]:
                    point = (round(x * original.width), round(y * original.height))
                    self.assertEqual(result.getpixel(point)[3], expected_alpha)


if __name__ == "__main__":
    unittest.main()
