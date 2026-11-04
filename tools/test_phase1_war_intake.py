from io import BytesIO
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from PIL import Image

import intake_phase1_war_art as intake
from prepare_art import prepare_sprite


class Phase1WarIntakeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.settings = json.loads(intake.SETTINGS.read_text(encoding="utf-8"))
        cls.records = json.loads(intake.MANIFEST.read_text(encoding="utf-8"))["assets"]

    def test_exact_delivery_and_byte_preserved_originals(self):
        self.assertEqual(len(intake.assets()), 45)
        self.assertEqual(len(self.records), 45)
        self.assertEqual(len({row["incoming"] for row in self.records}), 45)
        self.assertEqual(set(self.settings), {row["asset"] for row in self.records})
        for category, count in (("characters", 18), ("abilities", 12),
                                ("master-conduits", 9), ("banners", 3), ("backgrounds", 3)):
            self.assertEqual(sum(row["category"] == category for row in self.records), count)
        for row in self.records:
            with self.subTest(asset=row["asset"]):
                self.assertFalse((intake.ROOT / row["incoming"]).exists())
                for field in ("source", "runtime"):
                    self.assertEqual(intake.digest(intake.ROOT / row[field]), row[f"{field}_sha256"])
                self.assertTrue(row["settings"]["review"])
                self.assertEqual(row["settings"], self.settings[row["asset"]])

    def test_all_exports_reproduce_and_have_transparent_margins(self):
        for row in self.records:
            with self.subTest(asset=row["asset"]):
                source, runtime = (intake.ROOT / row[field] for field in ("source", "runtime"))
                output = intake.prepare(source, self.settings[row["asset"]], row["category"])
                self.assertEqual(output, runtime.read_bytes())
                if row["category"] in intake.SCENERY:
                    self.assertEqual(output, source.read_bytes())
                    continue
                image = Image.open(BytesIO(output))
                size, content = (960, 864) if row["category"] == "characters" else (256, 224)
                self.assertEqual(image.mode, "RGBA")
                self.assertEqual(image.size, (size, size))
                x0, y0, x1, y1 = image.getbbox()
                self.assertEqual(max(x1-x0, y1-y0), content)
                self.assertGreaterEqual(min(x0, y0, size-x1, size-y1), (size-content)//2)

    def test_reviewed_gap_seeds_are_transparent(self):
        for row in self.records:
            if row["category"] in intake.SCENERY:
                continue
            with self.subTest(asset=row["asset"]), Image.open(intake.ROOT / row["source"]) as image:
                output = intake.clean_source(image, self.settings[row["asset"]])
                for x, y in self.settings[row["asset"]]["background_seeds"]:
                    self.assertEqual(output.getpixel((round(x*image.width), round(y*image.height)))[3], 0)

    def test_authored_colored_powers_and_shadow_survive(self):
        checks = {
            "myrthen-skill1": [(0.9, 0.42), (0.91, 0.5)],
            "master-myrthen-2": [(0.5, 0.8), (0.5, 0.5)],
            "caldrex-evo-6": [(0.48, 0.48)],
            "master-solenne-3": [(0.5, 0.1)],
        }
        for asset, points in checks.items():
            row = next(row for row in self.records if row["asset"] == asset)
            with Image.open(intake.ROOT / row["source"]) as image:
                output = intake.clean_source(image, self.settings[asset])
                for x, y in points:
                    point = (round(x*image.width), round(y*image.height))
                    self.assertEqual(output.getpixel(point), (*image.convert("RGB").getpixel(point), 255),
                                     (asset, point))

    def test_supplied_alpha_bypasses_keys_gaps_and_frame_removal(self):
        image = Image.new("RGBA", (30, 30))
        image.paste((0, 255, 0, 123), (8, 8, 22, 22))
        config = {"keys": [[0, 255, 0]], "radius": 255,
                  "discarded_frame_regions": [[[0, 0], [1, 0], [1, 1], [0, 1]]]}
        np.testing.assert_array_equal(np.asarray(intake.clean_source(image, config)), np.asarray(image))

    def test_shared_exporter_uses_reviewed_original_and_dimensions(self):
        row = next(row for row in self.records if row["asset"] == "solenne")
        expected = Image.open(BytesIO(intake.prepare(intake.ROOT / row["source"],
                                  self.settings["solenne"], "characters", 120, 108)))
        output = prepare_sprite(Path("not-an-original.png"), "solenne", 120, 108,
                                background_seeds=[(-1, -1)], matte_minimum=-1)
        np.testing.assert_array_equal(np.asarray(output), np.asarray(expected))

    def test_revision_map_matches_every_installed_byte(self):
        self.assertEqual(intake.REVISIONS.read_text(encoding="utf-8"), intake.revision_source())
        for row in self.records:
            self.assertIn(f"'{row['category']}/{row['asset']}.png': '{row['runtime_sha256'][:16]}'",
                          intake.revision_source())

    def test_conflict_rejected_before_any_archive_or_cleanup(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            filename, category, asset, archived, runtime = intake.assets(root)[0]
            source = root / filename
            source.write_bytes(b"untouched original")
            runtime.parent.mkdir(parents=True)
            runtime.write_bytes(b"other contributor")
            with self.assertRaises(FileExistsError):
                intake.preflight(root, intake.SETTINGS, root / "no-manifest.json")
            self.assertFalse(archived.exists())
            self.assertEqual(source.read_bytes(), b"untouched original")
            self.assertEqual(runtime.read_bytes(), b"other contributor")

    def test_missing_installed_original_fails_explicitly(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(intake, "ROOT", Path(directory)):
            with self.assertRaisesRegex(FileNotFoundError, "source is missing"):
                intake.reviewed_source("caldrex")
            self.assertIsNone(intake.reviewed_source("not-a-phase1-asset"))


if __name__ == "__main__":
    unittest.main()
