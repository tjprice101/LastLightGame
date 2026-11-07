import json
from pathlib import Path
from io import BytesIO
import unittest

import numpy as np
from PIL import Image, ImageDraw

from intake_moon_art import MANIFEST, REVISIONS, ROOT, assets, digest, preflight, prepare
from prepare_art import prepare_sprite


class MoonArtIntakeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.planned = preflight()
        cls.manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_exact104_required_sources_are_archived_and_reproducible(self):
        self.assertEqual(len(self.planned), 104)
        self.assertEqual(len(assets()), 104)
        counts = {}
        revisions = REVISIONS.read_text(encoding="utf-8")
        for source, archive, runtime, output, row in self.planned:
            counts[row["category"]] = counts.get(row["category"], 0) + 1
            self.assertEqual(digest(archive), row["source_sha256"])
            self.assertEqual(runtime.read_bytes(), output)
            self.assertTrue(row["settings"]["review"])
            self.assertFalse((ROOT / row["incoming"]).exists())
            relative = row["runtime"].removeprefix("public/assets/")
            self.assertIn(f"'{relative}': '{row['runtime_sha256'][:16]}'", revisions)
            self.assertIn("/moon/", row["source"])
        self.assertEqual(counts, {"characters": 36, "abilities": 24, "master-conduits": 18,
                                  "abilities/statuses": 11, "enemies": 6, "materials": 6,
                                  "banners": 2, "backgrounds": 1})

    def test_cutouts_have_transparent_padding_and_scenery_is_byte_exact(self):
        for source, archive, runtime, output, row in self.planned:
            with self.subTest(asset=row["asset"]), Image.open(BytesIO(output)) as image:
                if row["category"] in ("banners", "backgrounds"):
                    self.assertEqual(output, archive.read_bytes())
                    self.assertEqual(image.convert("RGBA").getextrema()[3], (255, 255))
                    self.assertEqual(list(image.size), row["source_dimensions"])
                    continue
                size = 960 if row["category"] in ("characters", "enemies") else 256
                self.assertEqual(image.size, (size, size))
                self.assertEqual(image.mode, "RGBA")
                left, top, right, bottom = image.getbbox()
                margin = (size - (864 if size == 960 else 224)) // 2
                self.assertGreaterEqual(min(left, top, size - right, size - bottom), margin)
                self.assertGreater(np.count_nonzero(np.asarray(image)[:, :, 3]), 100)
                self.assertEqual(image.getextrema()[3], (0, 255))

    def test_supplied_alpha_bypasses_key_and_frame_cleanup(self):
        image = Image.new("RGBA", (48, 48), (0, 255, 0, 0))
        ImageDraw.Draw(image).rectangle((12, 12, 35, 35), fill=(0, 255, 0, 255))
        ImageDraw.Draw(image).rectangle((18, 18, 29, 29), fill=(220, 230, 255, 180))
        import tempfile
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "alpha.png"
            image.save(source)
            output = prepare(source, {"keys": [[0, 255, 0]], "radius": 255, "exterior_frame": True},
                             "abilities", 48, 24)
            with Image.open(BytesIO(output)) as result:
                self.assertEqual(result.getpixel((12, 12)), (0, 255, 0, 255))
                self.assertEqual(result.getpixel((23, 23)), (220, 230, 255, 180))

    def test_shared_sprite_preparation_uses_installed_moon_authority(self):
        rows = {row[-1]["asset"]: row for row in self.planned}
        for asset in ("maerion-evo-6", "moon-vesperwing-3", "moonwake-bloom"):
            source, _, runtime, _, record = rows[asset]
            size, content = (960, 864) if record["category"] in ("characters", "enemies") else (256, 224)
            expected = Image.open(runtime).convert("RGBA")
            actual = prepare_sprite(source, asset, size, content)
            self.assertEqual(actual.tobytes(), expected.tobytes())


if __name__ == "__main__":
    unittest.main()
