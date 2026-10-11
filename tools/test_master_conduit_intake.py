"""Regression coverage for the reviewed Master Conduit art intake."""
import hashlib
import json
import unittest
from pathlib import Path

from intake_master_conduit_art import ALTERNATE, ALTERNATE_ARCHIVE, MANIFEST, ROOT, SETTINGS, assets


class MasterConduitIntakeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
        cls.manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        cls.records = {row["asset"]: row for row in cls.manifest["assets"]}

    def test_settings_and_manifest_cover_exactly_fifty_assets(self):
        expected = {asset for asset, *_ in assets()}
        self.assertEqual(len(expected), 50)
        self.assertEqual(set(self.settings), expected)
        self.assertEqual(self.manifest["asset_count"], 50)
        self.assertEqual(set(self.records), expected)
        for asset, entry in self.settings.items():
            with self.subTest(asset=asset):
                self.assertIs(entry.get("border_only"), True)
                self.assertTrue(entry.get("keys"))
                self.assertGreater(entry.get("radius", 0), 0)
                self.assertIn("edge_cleanup", entry)
                self.assertTrue(entry.get("review"))

    def test_archived_sources_and_runtime_files_match_manifest_hashes(self):
        for asset, filename, archived, runtime in assets():
            record = self.records[asset]
            with self.subTest(asset=asset):
                self.assertEqual(record["source"], str(archived.relative_to(ROOT)))
                self.assertEqual(record["runtime"], str(runtime.relative_to(ROOT)))
                self.assertEqual(record["settings"], self.settings[asset])
                self.assertTrue(archived.is_file())
                self.assertTrue(runtime.is_file())
                self.assertEqual(hashlib.sha256(archived.read_bytes()).hexdigest(),
                                 record["source_sha256"])
                self.assertEqual(hashlib.sha256(runtime.read_bytes()).hexdigest(),
                                 record["runtime_sha256"])

    def test_runtime_cutouts_are_rgba_and_transparent_at_corners(self):
        from PIL import Image
        for asset, _, _, runtime in assets():
            with self.subTest(asset=asset):
                with Image.open(runtime) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (256, 256))
                    alpha = image.getchannel("A")
                    self.assertTrue(all(alpha.getpixel(point) == 0 for point in
                                        ((0, 0), (255, 0), (0, 255), (255, 255))))
                    extrema = alpha.getextrema()
                    self.assertEqual(extrema[1], 255, "cutout must contain opaque subject pixels")
                    self.assertLess(extrema[0], 255, "cutout must contain transparency")
                    self.assertIsNotNone(image.getbbox())

    def test_alternate_is_archived_but_not_installed(self):
        alternates = self.manifest.get("alternates", [])
        self.assertEqual(len(alternates), 1)
        alternate = alternates[0]
        self.assertEqual(alternate["incoming"], ALTERNATE)
        self.assertEqual(alternate["source"], str(ALTERNATE_ARCHIVE.relative_to(ROOT)))
        self.assertIsNone(alternate["runtime"])
        self.assertIs(alternate["used"], False)
        self.assertTrue(ALTERNATE_ARCHIVE.is_file())
        self.assertEqual(hashlib.sha256(ALTERNATE_ARCHIVE.read_bytes()).hexdigest(),
                         alternate["source_sha256"])
        runtime_dir = ROOT / "public" / "assets" / "master-conduits"
        self.assertFalse((runtime_dir / "master-elise-3-alternate.png").exists())
        self.assertFalse(any("alternate" in path.stem.lower()
                             for path in runtime_dir.glob("*.png")))


if __name__ == "__main__":
    unittest.main()
