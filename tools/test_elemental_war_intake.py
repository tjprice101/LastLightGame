from io import BytesIO
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from PIL import Image

import intake_elemental_war_art as intake
from intake_character_refresh import clean, digest
from prepare_art import prepare_sprite


class ElementalWarIntakeTests(unittest.TestCase):
    def test40_originals_exports_settings_and_reproduction(self):
        document = json.loads(intake.MANIFEST.read_text(encoding="utf-8"))
        settings = intake.load_settings()
        self.assertEqual(document["asset_count"], 40)
        self.assertEqual(len(document["assets"]), 40)
        self.assertEqual({row["asset"] for row in document["assets"]}, set(settings))
        for row in document["assets"]:
            with self.subTest(asset=row["asset"]):
                self.assertFalse((intake.ROOT / row["incoming"]).exists())
                self.assertEqual(row["processing"], settings[row["asset"]])
                for field in ("source", "runtime"):
                    self.assertEqual(digest(intake.ROOT / row[field]), row[f"{field}_sha256"])
                if row["category"] in ("banners", "backgrounds"):
                    self.assertEqual((intake.ROOT / row["source"]).read_bytes(),
                                     (intake.ROOT / row["runtime"]).read_bytes())
                    self.assertEqual(intake.prepare(intake.ROOT / row["source"], {}, row["category"]).size,
                                     (1904, 640) if row["category"] == "banners" else (1456, 816))
                    continue
                output = intake.prepare(intake.ROOT / row["source"], settings[row["asset"]], row["category"])
                buffer = BytesIO()
                output.save(buffer, format="PNG", optimize=True)
                self.assertEqual(buffer.getvalue(), (intake.ROOT / row["runtime"]).read_bytes())
                size, content = (960, 864) if row["category"] == "characters" else (256, 224)
                self.assertEqual(output.mode, "RGBA")
                self.assertEqual(output.size, (size, size))
                left, top, right, bottom = output.getbbox()
                self.assertEqual(max(right-left, bottom-top), content)
                self.assertGreaterEqual(min(left, top, size-right, size-bottom), (size-content)//2)

    def test_reviewed_gaps_clear_without_erasing_painted_foreground(self):
        settings = intake.load_settings()
        for _, category, asset in intake.ASSETS:
            if category in ("banners", "backgrounds"):
                continue
            with self.subTest(asset=asset), Image.open(
                    intake.ROOT / "Art" / "source" / "elemental-war" / category / f"{asset}.png") as source:
                output = clean(source, settings[asset])
                self.assertEqual(output.getpixel((0, 0))[3], 0)
                for x, y in settings[asset].get("background_seeds", []):
                    self.assertEqual(output.getpixel((round(x*source.width), round(y*source.height)))[3], 0)
        for asset, points in {
            "orvella-evo-6": [(100, 475), (620, 326), (600, 675), (306, 192)],
            "vaelor-evo-4": [(680, 319), (780, 687)],
            "vaelor-evo-2": [(852, 570), (700, 63)],
            "nerithe": [(640, 345), (720, 345), (620, 255)],
            "nerithe-evo-6": [(340, 135), (615, 255), (625, 650)],
        }.items():
            with Image.open(intake.ROOT / "Art" / "source" / "elemental-war" / "characters" / f"{asset}.png") as source:
                output = clean(source, settings[asset])
                for point in points:
                    self.assertEqual(output.getpixel(point), (*source.getpixel(point), 255), (asset, point))

    def test_shared_exporter_prioritizes_reviewed_sources_and_custom_sizes(self):
        settings = intake.load_settings()
        for _, category, asset in intake.ASSETS:
            if category in ("banners", "backgrounds"):
                continue
            with self.subTest(asset=asset):
                source = intake.ROOT / "Art" / "source" / "elemental-war" / category / f"{asset}.png"
                expected = intake.prepare(source, settings[asset], category, 120, 108)
                actual = prepare_sprite(Path("not-the-original.png"), asset, 120, 108,
                                        background_seeds=[(-1, -1)], matte_minimum=-1)
                np.testing.assert_array_equal(np.asarray(actual), np.asarray(expected))

    def test_supplied_alpha_bypasses_keys_gradients_and_frame_masks(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "alpha.png"
            image = Image.new("RGBA", (30, 30))
            image.putpixel((10, 10), (0, 255, 0, 123))
            image.save(source)
            output = intake.prepare(source, {"discarded_frame_regions": [[[0, 0], [1, 0], [1, 1], [0, 1]]]},
                                    "abilities", 30, 1)
            self.assertEqual(output.getpixel((14, 14)), (0, 255, 0, 123))

    def test_exact40_mappings_and_missing_installed_source_rejection(self):
        self.assertEqual(len(intake.ASSETS), 40)
        self.assertEqual(len({asset for _, _, asset in intake.ASSETS}), 40)
        self.assertEqual(len({filename for filename, _, _ in intake.ASSETS}), 40)
        self.assertEqual(sum(category == "characters" for _, category, _ in intake.ASSETS), 18)
        self.assertEqual(sum(category == "abilities" for _, category, _ in intake.ASSETS), 16)
        self.assertEqual(sum(category in ("banners", "backgrounds") for _, category, _ in intake.ASSETS), 6)
        with tempfile.TemporaryDirectory() as directory, patch.object(intake, "ROOT", Path(directory)):
            with self.assertRaisesRegex(FileNotFoundError, "source is missing"):
                intake.reviewed_source("vaelor")
            with self.assertRaisesRegex(FileNotFoundError, "source is missing"):
                intake.reviewed_source("nerithe")
            self.assertIsNone(intake.reviewed_source("elemental-war-nerithe-arena"))
            self.assertIsNone(intake.reviewed_source("nerithe-light"))

    def test_preflight_conflicts_never_change_sources_or_install_more_assets(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            runtime = root / "public" / "assets" / "characters" / "orvella.png"
            runtime.parent.mkdir(parents=True)
            runtime.write_bytes(b"conflict")
            source = root / "original.png"
            source.write_bytes(b"original")
            with patch.object(intake, "ROOT", root), patch.object(intake, "MANIFEST", root / "manifest.json"), \
                    patch.object(intake, "ASSETS", [("original.png", "characters", "orvella")]), \
                    patch.object(intake, "load_settings", return_value={"orvella": {}}), \
                    patch.object(intake, "prepare", return_value=Image.new("RGBA", (20, 20))):
                with self.assertRaises(FileExistsError):
                    intake.intake(apply=True, remove_incoming=True)
            self.assertEqual(source.read_bytes(), b"original")
            self.assertEqual(runtime.read_bytes(), b"conflict")
            self.assertFalse((root / "Art" / "source").exists())


if __name__ == "__main__":
    unittest.main()
