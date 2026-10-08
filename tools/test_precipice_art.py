import hashlib
import json
import unittest

import numpy as np
from PIL import Image

from prepare_art import ROOT
from prepare_dungeons import PRECIPICE_KEYS, prepare_dungeon_sprite, prepare_precipice_cutout
from review_art import sources


class PrecipiceArtTests(unittest.TestCase):
    def test_provenance_and_deterministic_exports(self):
        manifest = json.loads((ROOT / "Art" / "precipice-earth-intake.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["asset_count"], 16)
        self.assertEqual(len(manifest["assets"]), 16)
        for record in manifest["assets"]:
            with self.subTest(asset=record["asset"]):
                source, runtime = ROOT / record["source"], ROOT / record["runtime"]
                self.assertFalse((ROOT / record["incoming"]).exists())
                self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(), record["source_sha256"])
                self.assertEqual(hashlib.sha256(runtime.read_bytes()).hexdigest(), record["runtime_sha256"])
                if record["asset"] == "precipice-of-the-earth":
                    self.assertEqual(source.read_bytes(), runtime.read_bytes())
                else:
                    asset = record["asset"]
                    self.assertEqual(sources()[asset], source)
                    size, content = (256, 224) if asset.startswith("tectonic-") else (960, 864)
                    with Image.open(runtime) as exported:
                        self.assertEqual(exported.mode, "RGBA")
                        self.assertEqual(exported.size, (size, size))
                        np.testing.assert_array_equal(np.asarray(exported), np.asarray(prepare_dungeon_sprite(source, asset, size, content)))
                        self.assertEqual(exported.getpixel((0, 0))[3], 0)

    def test_reviewed_holes_and_foreground_protection(self):
        for asset, settings in PRECIPICE_KEYS.items():
            with self.subTest(asset=asset), Image.open(sources()[asset]) as source:
                result = prepare_precipice_cutout(source, asset)
                alpha = np.asarray(result)[:, :, 3]
                for x, y in settings["background_seeds"]:
                    self.assertEqual(alpha[round(y * source.height), round(x * source.width)], 0)
                self.assertGreater(int((alpha == 0).sum()), source.width * source.height // 4)
        for asset, point in {
            "atlas-of-the-crystal-summit": (.484, .20),
            "pillarwing-gargoyle": (.80, .45),
            "tectonic-crest": (.516602, .506836),
            "tectonic-heart": (.40918, .582031),
            "tectonic-soul": (.50, .20),
            "claycap-kobold": (.521104, .481681),
        }.items():
            with self.subTest(protected=asset), Image.open(sources()[asset]) as source:
                result = prepare_precipice_cutout(source, asset)
                self.assertEqual(result.getpixel((round(point[0] * source.width), round(point[1] * source.height)))[3], 255)
        for asset in ("atlas-of-the-crystal-summit", "tectonic-soul"):
            with Image.open(sources()[asset]) as source:
                result = prepare_precipice_cutout(source, asset)
                self.assertEqual(result.getpixel((round(.40 * source.width), round(.06 * source.height)))[3], 0)


if __name__ == "__main__":
    unittest.main()
