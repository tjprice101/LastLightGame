from hashlib import sha256
from io import BytesIO
import json
import unittest

import numpy as np
from PIL import Image

from intake_calamity_phase0_art import ROOT, SETTINGS, MANIFEST, clean, prepare


class OblivionArtworkTests(unittest.TestCase):
    def test_acolyte_cleanup_preserves_source_and_reproduces_export(self):
        key = "enemies/oblivion-shardling-acolyte.png"
        settings = json.loads(SETTINGS.read_text(encoding="utf-8"))[key]
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        row = next(row for row in manifest["assets"] if row["runtime"] == f"public/assets/{key}")
        source = ROOT / row["source"]
        self.assertEqual(sha256(source.read_bytes()).hexdigest(), row["source_sha256"])
        output, _ = prepare(source, "enemies", settings)
        self.assertEqual(output, (ROOT / "public/assets" / key).read_bytes())
        self.assertEqual(sha256(output).hexdigest(), row["runtime_sha256"])
        with Image.open(source) as image:
            baseline = clean(image, {k: v for k, v in settings.items() if k != "erase"})
            corrected = clean(image, settings)
        before, after = np.array(baseline), np.array(corrected)
        self.assertGreater(np.count_nonzero(before[:, :, 3] != after[:, :, 3]), 100)
        # Cleanup stays below the toe and in the reviewed detached scribble region.
        height, width = after.shape[:2]
        self.assertFalse(after[round(height * .96):, :, 3].any())
        self.assertTrue(np.array_equal(before[:round(height * .48)], after[:round(height * .48)]))
        with Image.open(BytesIO(output)) as image:
            self.assertEqual(image.mode, "RGBA")
            self.assertEqual(image.size, (960, 960))
        revisions = (ROOT / "src/content/calamity-art-revisions.ts").read_text(encoding="utf-8")
        self.assertIn(f"'{key}': '{sha256(output).hexdigest()[:12]}'", revisions)


if __name__ == "__main__":
    unittest.main()
