import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image
import numpy as np

from intake_roster_art import ROOT, ROSES, PHASES, SOURCE_FACING, digest, prepare, remove_exterior_outline, historical_runtime
from art_library import art_path


class RosterArtIntakeTests(unittest.TestCase):
    def test_roses_mapping_and_provenance_cover_every_supplied_asset(self):
        manifest = json.loads((art_path("roses-art-intake.json", root=ROOT)).read_text(encoding="utf-8"))
        self.assertEqual(manifest["asset_count"], 51)
        self.assertEqual(len(manifest["assets"]), 51)
        self.assertEqual(len({row[0] for row in ROSES}), 51)
        self.assertEqual(len({row[1:] for row in ROSES}), 51)
        for mapping, record in zip(ROSES, manifest["assets"]):
            with self.subTest(asset=record["asset"]):
                self.assertEqual(mapping, (record["incoming"], record["category"], record["asset"]))
                self.assertEqual(digest(ROOT / record["source"]), record["source_sha256"])
                runtime = historical_runtime(record["asset"], ROOT / record["runtime"])
                self.assertEqual(digest(runtime), record["runtime_sha256"])
                if record["category"] in ("banners", "backgrounds"):
                    self.assertEqual(record["source_sha256"], record["runtime_sha256"])
                    continue
                size, margin = (256, 16) if record["category"] in ("abilities", "materials") else (960, 48)
                with Image.open(runtime) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (size, size))
                    left, top, right, bottom = image.getbbox()
                    self.assertGreaterEqual(min(left, top, size - right, size - bottom), margin)
                    self.assertEqual(image.getextrema()[3][0], 0)

    def test_supplied_alpha_never_uses_color_key_or_white_frame_cleanup(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "supplied.png"
            image = Image.new("RGBA", (100, 100))
            for y in range(30, 70):
                for x in range(30, 70):
                    image.putpixel((x, y), (0, 255, 0, 255))
            image.save(source)
            data, processing = prepare(source, "abilities", "rosetta-skill1")
            self.assertEqual(processing["method"], "supplied-alpha; trim/resize/pad only")
            from io import BytesIO
            with Image.open(BytesIO(data)) as result:
                self.assertEqual(result.getpixel((128, 128)), (0, 255, 0, 255))

    def test_all_135_assets_have_verified_sources_transparent_exports_and_padding(self):
        total = 0
        for phase, mapping in PHASES.items():
            manifest = json.loads((art_path(f"{phase}-art-intake.json", root=ROOT)).read_text(encoding="utf-8"))
            self.assertEqual(manifest["asset_count"], len(mapping))
            self.assertEqual(len(manifest["assets"]), len(mapping))
            for expected, record in zip(mapping, manifest["assets"]):
                with self.subTest(phase=phase, asset=record["asset"]):
                    self.assertEqual(expected, (record["incoming"], record["category"], record["asset"]))
                    self.assertEqual(digest(ROOT / record["source"]), record["source_sha256"])
                    runtime = historical_runtime(record["asset"], ROOT / record["runtime"])
                    self.assertEqual(digest(runtime), record["runtime_sha256"])
                    if record["category"] in ("banners", "backgrounds"):
                        self.assertEqual(record["source_sha256"], record["runtime_sha256"])
                    else:
                        size, margin = (256, 16) if record["category"] in ("abilities", "materials") else (960, 48)
                        with Image.open(runtime) as image:
                            self.assertEqual(image.mode, "RGBA")
                            self.assertEqual(image.size, (size, size))
                            left, top, right, bottom = image.getbbox()
                            self.assertGreaterEqual(min(left, top, size - right, size - bottom), margin)
                            self.assertEqual(image.getextrema()[3][0], 0)
                    total += 1
        self.assertEqual(total, 135)

    def test_warm_bruno_skin_and_stone_and_pale_final_wings_are_retained(self):
        for asset in ("bruno", "bruno-evo-4", "bliss-evo-6", "aurora-evo-6"):
            runtime = historical_runtime(asset, ROOT / "public" / "assets" / "characters" / f"{asset}.png")
            with self.subTest(asset=asset), Image.open(runtime) as image:
                pixels = np.asarray(image, dtype=np.int32)
                r, g, b = pixels[:, :, :3].transpose(2, 0, 1)
                opaque = pixels[:, :, 3] >= 250
                if asset.startswith("bruno"):
                    warm = opaque & (r > g + 15) & (g > b + 10) & (r > 130) & (g > 65) & (g < 185)
                    stone = opaque & (r > 30) & (r < 130) & (g > 20) & (g < 100) & (b > 20) & (b < 100)
                    self.assertGreater(np.count_nonzero(warm), 35000)
                    self.assertGreater(np.count_nonzero(stone), 100000)
                else:
                    pale = opaque & (r > 200) & (g > 200) & (b > 200)
                    self.assertGreater(np.count_nonzero(pale), 90000)

    def test_exterior_outline_cleanup_preserves_disconnected_edge_tips_and_interior_frames(self):
        rgba = np.zeros((200, 200, 4), dtype=np.uint8)
        rgba[1, 1:199] = (25, 5, 15, 255)
        rgba[1:199, 1] = (25, 5, 15, 255)
        rgba[3:5, 80:84] = (255, 255, 255, 255)
        rgba[30, 30:170] = (255, 200, 100, 255)
        rgba[30:170, 30] = (255, 200, 100, 255)
        remove_exterior_outline(rgba, np.asarray(Image.fromarray(rgba).convert("HSV")))
        self.assertTrue(np.all(rgba[1, 1:199, 3] == 0))
        self.assertTrue(np.all(rgba[1:199, 1, 3] == 0))
        self.assertTrue(np.all(rgba[3:5, 80:84, 3] == 255))
        self.assertTrue(np.all(rgba[30, 30:170, 3] == 255))

    def test_facing_metadata_matches_reviewed_runtime_registration(self):
        text = (ROOT / "src" / "presentation" / "unit-facing.ts").read_text(encoding="utf-8")
        for asset, facing in SOURCE_FACING.items():
            runtime = ROOT / "public" / "assets" / "characters" / f"{asset}.png"
            if historical_runtime(asset, runtime) != runtime:
                continue
            with self.subTest(asset=asset):
                self.assertTrue(f"{asset}: '{facing}'" in text or f"'{asset}': '{facing}'" in text)


if __name__ == "__main__":
    unittest.main()
