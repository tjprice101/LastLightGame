"""The VFX texture library manifest matches installed runtime exports."""
from hashlib import sha256
import json
from pathlib import Path
import unittest

from PIL import Image

from intake_vfx_library import LIBRARY, MANIFEST, ROOT, SIZES


class VfxLibraryTest(unittest.TestCase):
    def setUp(self):
        self.manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_manifest_covers_library(self):
        expected = {f"{c}/{n}" for c, entries in LIBRARY.items() for n in entries}
        self.assertEqual(expected, {a["asset"] for a in self.manifest["assets"]})

    def test_no_duplicate_origins(self):
        origins = [a["origin"] for a in self.manifest["assets"]]
        self.assertEqual(len(origins), len(set(origins)))

    def test_runtime_exports_match_and_stay_small(self):
        for asset in self.manifest["assets"]:
            runtime = ROOT / asset["runtime"]
            self.assertEqual(sha256(runtime.read_bytes()).hexdigest(), asset["runtime_sha256"], runtime)
            self.assertTrue((ROOT / asset["source"]).exists(), asset["source"])
            with Image.open(runtime) as image:
                self.assertLessEqual(max(image.size), SIZES[asset["asset"].split("/")[0]])

    def test_no_music_theme_names_ship(self):
        for asset in self.manifest["assets"]:
            self.assertNotRegex(Path(asset["runtime"]).stem, r"(?i)music|note|eroica|fate|sonata|campanella")


if __name__ == "__main__":
    unittest.main()
