import hashlib
import json
import unittest

import numpy as np
from PIL import Image

from prepare_art import ROOT
from prepare_dungeons import VALLEY_KEYS, prepare_dungeon_sprite, prepare_valley_cutout
from review_art import sources


class ValleyArtTests(unittest.TestCase):
    def test_provenance_and_deterministic_exports(self):
        manifest = json.loads((ROOT / "Art" / "valley-solitude-intake.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["asset_count"], 16)
        self.assertEqual(len(manifest["assets"]), 16)
        for record in manifest["assets"]:
            with self.subTest(asset=record["asset"]):
                source, runtime = ROOT / record["source"], ROOT / record["runtime"]
                self.assertFalse((ROOT / record["incoming"]).exists())
                self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(), record["source_sha256"])
                self.assertEqual(hashlib.sha256(runtime.read_bytes()).hexdigest(), record["runtime_sha256"])
                if record["asset"] == "valley-of-solitude":
                    self.assertEqual(source.read_bytes(), runtime.read_bytes())
                else:
                    asset = record["asset"]
                    self.assertEqual(sources()[asset], source)
                    size, content = (256, 224) if asset.startswith("ominous-") else (960, 864)
                    with Image.open(runtime) as exported:
                        self.assertEqual(exported.mode, "RGBA")
                        self.assertEqual(exported.size, (size, size))
                        np.testing.assert_array_equal(np.asarray(exported), np.asarray(prepare_dungeon_sprite(source, asset, size, content)))
                        alpha = np.asarray(exported)[:, :, 3]
                        self.assertFalse(alpha[0].any())
                        self.assertFalse(alpha[-1].any())
                        self.assertFalse(alpha[:, 0].any())
                        self.assertFalse(alpha[:, -1].any())

    def test_reviewed_holes_and_preserved_subject_colors(self):
        for asset, settings in VALLEY_KEYS.items():
            with self.subTest(asset=asset), Image.open(sources()[asset]) as source:
                result = prepare_valley_cutout(source, asset)
                alpha = np.asarray(result)[:, :, 3]
                for x, y in settings["background_seeds"]:
                    self.assertEqual(alpha[round(y * source.height), round(x * source.width)], 0)
                self.assertGreater(int((alpha == 0).sum()), source.width * source.height // 4)
                rgb = np.asarray(source.convert("RGB"))
                pale = (rgb.min(axis=2) >= 220) & (rgb.max(axis=2) - rgb.min(axis=2) < 20)
                self.assertTrue((alpha[pale] == 255).all())
        for asset, points in {
            "ominous-heart": [(.658203, .474609), (.426758, .473633)],
            "ominous-seed": [(.696289, .507812)],
            "gloomtail-cat": [(.642045, .367457), (.49513, .301724)],
            "moonless-gargoyle": [(.441558, .565733), (.426948, .591595)],
        }.items():
            with self.subTest(protected=asset), Image.open(sources()[asset]) as source:
                result = prepare_valley_cutout(source, asset)
                for x, y in points:
                    self.assertEqual(result.getpixel((round(x * source.width), round(y * source.height)))[3], 255)


if __name__ == "__main__":
    unittest.main()
