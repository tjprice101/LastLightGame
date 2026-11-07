from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from PIL import Image

import intake_phase2_war_art as intake
from intake_character_refresh import clean
from prepare_art import prepare_sprite


class Phase2WarIntakeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.settings = json.loads(intake.SETTINGS.read_text(encoding="utf-8"))
        cls.records = json.loads(intake.MANIFEST.read_text(encoding="utf-8"))["assets"]

    def test_complete_archival_export_and_root_cleanup(self):
        self.assertEqual(len(self.records), 24)
        self.assertEqual(set(self.settings), {row["asset"] for row in self.records})
        for row in self.records:
            with self.subTest(asset=row["asset"]):
                self.assertFalse((intake.ROOT / row["incoming"]).exists())
                for field in ("source", "runtime"):
                    self.assertEqual(intake.digest(intake.ROOT / row[field]), row[field + "_sha256"])
                self.assertTrue(row["settings"]["review"])

    def test_exports_reproduce_transparent_margins_and_source_gaps(self):
        for row in self.records:
            with self.subTest(asset=row["asset"]):
                source = intake.ROOT / row["source"]
                output = intake.prepare(source, self.settings[row["asset"]])
                self.assertEqual(sha256(output).hexdigest(), row["runtime_sha256"])
                with Image.open(BytesIO(output)) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (960, 960))
                    x0, y0, x1, y1 = image.getbbox()
                    self.assertGreaterEqual(min(x0, y0, 960 - x1, 960 - y1), 48)
                    self.assertEqual(max(x1 - x0, y1 - y0), 864)
                with Image.open(source) as image:
                    result = clean(image, self.settings[row["asset"]])
                    for x, y in self.settings[row["asset"]]["background_seeds"]:
                        self.assertEqual(result.getpixel((round(x * image.width),
                                                          round(y * image.height)))[3], 0)

    def test_colored_powers_are_preserved_not_global_green_deletion(self):
        checks = {
            "neralis-evo-2": [(0.16, 0.62)],
            "varkhel-evo-4": [(0.12, 0.37)],
            "seravelle-evo-6": [(0.695, 0.39)],
            "velmira-evo-5": [(0.31, 0.27), (0.674, 0.317), (0.685, 0.314)],
        }
        for row in self.records:
            if row["asset"] not in checks:
                continue
            with Image.open(intake.ROOT / row["source"]) as image:
                output = clean(image, self.settings[row["asset"]])
                for x, y in checks[row["asset"]]:
                    point = (round(x * image.width), round(y * image.height))
                    self.assertEqual(output.getpixel(point), (*image.getpixel(point), 255))
                if row["asset"] == "velmira-evo-5":
                    rgb = np.asarray(image.convert("RGB")).astype(int)
                    rgba = np.asarray(output)
                    vivid_green = (rgb[:, :, 1] > 210) & (rgb[:, :, 0] < 130) & (rgb[:, :, 2] < 100)
                    self.assertGreater(np.count_nonzero(vivid_green), 0)
                    np.testing.assert_array_equal(rgba[vivid_green, :3], rgb[vivid_green])
                    self.assertTrue(np.all(rgba[vivid_green, 3] == 255))

    def test_shared_prepare_sprite_uses_reviewed_original(self):
        row = self.records[0]
        expected = intake.prepare(intake.ROOT / row["source"], self.settings[row["asset"]], 120, 108)
        actual = prepare_sprite(Path("not-a-source.png"), row["asset"], 120, 108,
                                matte_minimum=-1, background_seeds=[(-1, -1)])
        np.testing.assert_array_equal(np.asarray(actual), np.asarray(Image.open(BytesIO(expected))))

    def test_supplied_alpha_bypasses_all_key_settings(self):
        source = Image.new("RGBA", (30, 30))
        source.paste((0, 255, 0, 123), (8, 8, 22, 22))
        actual = clean(source, {"keys": [[0, 255, 0]], "radius": 255, "border_only": False})
        np.testing.assert_array_equal(np.asarray(source), np.asarray(actual))

    def test_untracked_runtime_and_root_conflicts_prevent_all_writes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            row, asset, source, runtime = intake.assets(root)[0]
            source.parent.mkdir(parents=True)
            source.write_bytes(b"archived original")
            runtime.parent.mkdir(parents=True)
            runtime.write_bytes(b"another contributor")
            with self.assertRaisesRegex(FileExistsError, "Untracked or changed runtime"):
                intake.preflight(root, intake.SETTINGS, root / "no-manifest.json")
            self.assertEqual(runtime.read_bytes(), b"another contributor")
            (root / row["original_filename"]).write_bytes(b"conflicting root")
            with self.assertRaisesRegex(FileExistsError, "Root original differs"):
                intake.preflight(root, intake.SETTINGS, root / "no-manifest.json")

    def test_missing_installed_source_and_cleanup_without_apply_fail(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(intake, "assets") as rows:
            rows.return_value = [(None, "neralis", Path(directory) / "missing", None)]
            with patch.object(intake, "MANIFEST", intake.MANIFEST):
                with self.assertRaisesRegex(FileNotFoundError, "source is missing"):
                    intake.reviewed_source("neralis")
        with self.assertRaisesRegex(ValueError, "requires --apply"):
            intake.intake(remove_incoming=True)


if __name__ == "__main__":
    unittest.main()
