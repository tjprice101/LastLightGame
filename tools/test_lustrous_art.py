import hashlib
import json
import unittest

import numpy as np
from PIL import Image

from prepare_art import ROOT
from prepare_dungeons import LUMINOUS_ENEMIES, LUSTROUS_KEYS, prepare_dungeon_sprite, prepare_lustrous_cutout
from review_art import sources


class LustrousArtTests(unittest.TestCase):
    def test_sources_provenance_and_exports(self):
        manifest = json.loads((ROOT / "Art" / "lustrous-river-intake.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["asset_count"], 16)
        self.assertEqual(len(manifest["assets"]), 16)
        for record in manifest["assets"]:
            with self.subTest(asset=record["asset"]):
                source, runtime = ROOT / record["source"], ROOT / record["runtime"]
                self.assertFalse((ROOT / record["incoming"]).exists())
                self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(), record["source_sha256"])
                self.assertEqual(hashlib.sha256(runtime.read_bytes()).hexdigest(), record["runtime_sha256"])
                if record["asset"] == "lustrous-river":
                    self.assertEqual(source.read_bytes(), runtime.read_bytes())
                else:
                    asset = record["asset"]
                    self.assertEqual(sources()[asset], source)
                    size, content = (960, 864) if asset in LUMINOUS_ENEMIES.values() else (256, 224)
                    result = prepare_dungeon_sprite(source, asset, size, content)
                    with Image.open(runtime) as exported:
                        self.assertEqual(exported.mode, "RGBA")
                        self.assertEqual(exported.size, (size, size))
                        np.testing.assert_array_equal(np.asarray(result), np.asarray(exported))
                        self.assertEqual(exported.getpixel((0, 0))[3], 0)

    def test_reviewed_holes_clear_and_pale_subject_pixels_survive(self):
        paths = sources()
        for asset, settings in LUSTROUS_KEYS.items():
            with self.subTest(asset=asset), Image.open(paths[asset]) as source:
                result = prepare_lustrous_cutout(source, asset)
                pixels = np.asarray(source.convert("RGB"))
                alpha = np.asarray(result)[:, :, 3]
                for x, y in settings["background_seeds"]:
                    self.assertEqual(alpha[min(round(y * source.height), source.height - 1),
                                           min(round(x * source.width), source.width - 1)], 0)
                pale = (pixels.min(axis=2) >= 210) & (pixels.max(axis=2) - pixels.min(axis=2) < 25)
                self.assertGreater(int(pale.sum()), 100)
                self.assertTrue((alpha[pale] == 255).all())
                self.assertGreater(int((alpha == 0).sum()), source.width * source.height // 4)

    def test_gem_centers_are_not_erased_as_matching_background(self):
        points = {
            "luminous-bloom": (.549805, .37793),
            "luminous-crest": (.516602, .407227),
            "luminous-heart": (.472656, .395508),
            "luminous-shard": (.703125, .470703),
            "lanterncap-brownie": (.782468, .417026),
            "sunmirror-oracle": (.145292, .282328),
        }
        for asset, (x, y) in points.items():
            with self.subTest(asset=asset), Image.open(sources()[asset]) as source:
                result = prepare_lustrous_cutout(source, asset)
                self.assertEqual(result.getpixel((round(x * source.width), round(y * source.height)))[3], 255)
        with Image.open(sources()["lanterncap-brownie"]) as source:
            result = prepare_lustrous_cutout(source, "lanterncap-brownie")
            self.assertEqual(result.getpixel((round(.185 * source.width), round(.323 * source.height)))[3], 255)


if __name__ == "__main__":
    unittest.main()
