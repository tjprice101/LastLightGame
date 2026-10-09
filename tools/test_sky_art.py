import hashlib
import json
import unittest

import numpy as np
from PIL import Image

from prepare_art import ROOT
from prepare_dungeons import SKY_KEYS, prepare_dungeon_sprite, prepare_sky_cutout
from review_art import sources
from art_library import art_path


class SkyArtTests(unittest.TestCase):
    def test_provenance_and_deterministic_exports(self):
        manifest = json.loads((art_path("sky-bound-rift-intake.json", root=ROOT)).read_text(encoding="utf-8"))
        self.assertEqual(manifest["asset_count"], 16)
        self.assertEqual(len(manifest["assets"]), 16)
        self.assertIn("Sky-bound RIft Arena.png", [entry["incoming"] for entry in manifest["assets"]])
        for record in manifest["assets"]:
            with self.subTest(asset=record["asset"]):
                source, runtime = ROOT / record["source"], ROOT / record["runtime"]
                self.assertFalse((ROOT / record["incoming"]).exists())
                self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(), record["source_sha256"])
                self.assertEqual(hashlib.sha256(runtime.read_bytes()).hexdigest(), record["runtime_sha256"])
                if record["asset"] == "sky-bound-rift":
                    self.assertEqual(source.read_bytes(), runtime.read_bytes())
                else:
                    asset = record["asset"]
                    self.assertEqual(sources()[asset], source)
                    size, content = (256, 224) if asset.startswith("atmospheric-") else (960, 864)
                    with Image.open(runtime) as exported:
                        self.assertEqual(exported.mode, "RGBA")
                        self.assertEqual(exported.size, (size, size))
                        np.testing.assert_array_equal(np.asarray(exported), np.asarray(prepare_dungeon_sprite(source, asset, size, content)))
                        alpha = np.asarray(exported)[:, :, 3]
                        self.assertFalse(alpha[0].any())
                        self.assertFalse(alpha[-1].any())
                        self.assertFalse(alpha[:, 0].any())
                        self.assertFalse(alpha[:, -1].any())

    def test_reviewed_holes_and_pale_art(self):
        for asset, settings in SKY_KEYS.items():
            with self.subTest(asset=asset), Image.open(sources()[asset]) as source:
                result = prepare_sky_cutout(source, asset)
                alpha = np.asarray(result)[:, :, 3]
                for x, y in settings["background_seeds"]:
                    self.assertEqual(alpha[round(y * source.height), round(x * source.width)], 0)
                self.assertGreater(int((alpha == 0).sum()), source.width * source.height // 4)
                rgb = np.asarray(source.convert("RGB"))
                pale = (rgb.min(axis=2) >= 220) & (rgb.max(axis=2) - rgb.min(axis=2) < 20)
                self.assertTrue((alpha[pale] == 255).all())

    def test_cyan_foreground_and_gradients(self):
        protected = {
            "atmospheric-seed": [(.61, .17), (.69, .24), (.35, .7), (.3, .42), (.72, .83), (.6, .5)],
            "zephyrcoil-drake": [(.438312, .43319), (.449675, .738147), (.854708, .726293)],
        }
        clear = {
            "atmospheric-seed": [(.5, .3), (.48, .35), (.72, .5), (.5, .75), (.48, .25), (.2, .63)],
            "atmospheric-soul": [(.5, .939), (.3, .94)],
            "atmospheric-crest": [(.509, .166)],
        }
        for expected, groups in [(255, protected), (0, clear)]:
            for asset, points in groups.items():
                with self.subTest(asset=asset, alpha=expected), Image.open(sources()[asset]) as source:
                    result = prepare_sky_cutout(source, asset)
                    for x, y in points:
                        self.assertEqual(result.getpixel((round(x * source.width), round(y * source.height)))[3], expected, (asset, x, y))


if __name__ == "__main__":
    unittest.main()
