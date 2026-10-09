import json
import unittest

import numpy as np
from PIL import Image, ImageDraw

from intake_character_refresh import ASSETS, MANIFEST, clean, digest, load_settings, prepare, ROOT
from intake_roster_art import PHASES, historical_runtime
from art_library import art_path


class CharacterRefreshTests(unittest.TestCase):
    def test_all_ten_six_form_lines_have_verified_archives_and_runtime_exports(self):
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        settings = load_settings()
        self.assertEqual(manifest["asset_count"], 60)
        self.assertEqual(len(ASSETS), len(set(asset for _, asset in ASSETS)))
        self.assertEqual({row["asset"] for row in manifest["assets"]}, set(settings))
        for (incoming, asset), record in zip(ASSETS, manifest["assets"]):
            with self.subTest(asset=asset):
                self.assertEqual(record["incoming"], incoming)
                self.assertEqual(record["asset"], asset)
                self.assertEqual(record["processing"], settings[asset])
                self.assertFalse((ROOT / incoming).exists())
                for path, hash_key in (("source", "source_sha256"), ("runtime", "runtime_sha256"),
                                       ("previous_runtime", "previous_runtime_sha256")):
                    self.assertEqual(digest(ROOT / record[path]), record[hash_key])
                self.assertEqual(prepare(ROOT / record["source"], settings[asset]),
                                 (ROOT / record["runtime"]).read_bytes())
                with Image.open(ROOT / record["runtime"]) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (960, 960))
                    left, top, right, bottom = image.getbbox()
                    self.assertGreaterEqual(min(left, top, 960 - right, 960 - bottom), 48)
                    self.assertEqual(image.getextrema()[3][0], 0)

    def test_historical_portraits_and_original_sources_remain_hash_verified(self):
        for phase in PHASES:
            manifest = json.loads((art_path(f"{phase}-art-intake.json", root=ROOT)).read_text(encoding="utf-8"))
            for record in manifest["assets"]:
                if record["category"] != "characters":
                    continue
                with self.subTest(asset=record["asset"]):
                    self.assertEqual(digest(ROOT / record["source"]), record["source_sha256"])
                    self.assertEqual(digest(historical_runtime(record["asset"], ROOT / record["runtime"])),
                                     record["runtime_sha256"])

    def test_supplied_alpha_bypasses_all_key_and_edge_processing(self):
        image = Image.new("RGBA", (20, 20))
        image.putpixel((10, 10), (0, 255, 0, 123))
        np.testing.assert_array_equal(np.asarray(clean(image, {})), np.asarray(image))

    def test_white_eyes_and_protected_foreground_are_not_global_keyed(self):
        image = Image.new("RGB", (100, 100), "white")
        draw = ImageDraw.Draw(image)
        draw.rectangle((20, 20, 80, 80), fill=(40, 20, 20))
        draw.rectangle((30, 30, 35, 35), fill="white")
        draw.rectangle((60, 60, 65, 65), fill="white")
        settings = {"keys": [[255, 255, 255]], "radius": 12, "border_only": True,
                    "background_seeds": [[.63, .63]]}
        result = clean(image, settings)
        self.assertEqual(result.getpixel((0, 0))[3], 0)
        self.assertEqual(result.getpixel((32, 32)), (255, 255, 255, 255))
        self.assertEqual(result.getpixel((63, 63))[3], 0)
        settings["border_only"] = False
        settings.pop("background_seeds")
        settings["foreground_polygons"] = [[[.30, .30], [.36, .30], [.36, .36], [.30, .36]]]
        self.assertEqual(clean(image, settings).getpixel((32, 32)), (255, 255, 255, 255))

    def test_reviewed_background_holes_clear_while_bruno_eyes_remain_opaque(self):
        settings = load_settings()
        records = {row["asset"]: row for row in json.loads(MANIFEST.read_text(encoding="utf-8"))["assets"]}
        for asset, row in settings.items():
            if not row.get("background_seeds"):
                continue
            with Image.open(ROOT / records[asset]["source"]) as source:
                result = clean(source, row)
                for x, y in row["background_seeds"]:
                    self.assertEqual(result.getpixel((round(x * source.width), round(y * source.height)))[3],
                                     0, (asset, x, y))
        with Image.open(ROOT / records["bruno"]["source"]) as source:
            result = clean(source, settings["bruno"])
            for x, y in ((.5908, .3545), (.4883, .3838)):
                self.assertEqual(result.getpixel((round(x * source.width), round(y * source.height)))[3], 255)

    def test_new_facing_values_match_the_shared_runtime_registration(self):
        text = (ROOT / "src" / "presentation" / "unit-facing.ts").read_text(encoding="utf-8")
        for asset, settings in load_settings().items():
            facing = settings["source_facing"]
            self.assertIn(facing, ("left", "right", "front"))
            self.assertTrue(f"{asset}: '{facing}'" in text or f"'{asset}': '{facing}'" in text, asset)


if __name__ == "__main__":
    unittest.main()
