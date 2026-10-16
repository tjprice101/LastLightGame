from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil
import tempfile
import unittest

import numpy as np
from PIL import Image
from scipy.ndimage import binary_erosion

from intake_calamitic_art import MAPPINGS, MANIFEST, SETTINGS, ROOT, intake, preflight
from intake_status_art import clean


class CalamiticArtTests(unittest.TestCase):
    def test_all_six_reproduce_from_archived_bytes_with_transparent_margins(self):
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        self.assertEqual(manifest["asset_count"], 6)
        self.assertEqual(len(MAPPINGS), 6)
        self.assertEqual(sum(row[2] == "conduits" for row in MAPPINGS), 5)
        for source, archive, runtime, output, record in preflight():
            with self.subTest(asset=record["asset"]):
                self.assertEqual(source, archive)
                self.assertEqual(sha256(archive.read_bytes()).hexdigest(), record["source_sha256"])
                self.assertEqual(output, runtime.read_bytes())
                self.assertEqual(record, next(row for row in manifest["assets"] if row["asset"] == record["asset"]))
                self.assertFalse((ROOT / record["incoming"]).exists())
                with Image.open(BytesIO(output)) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (256, 256))
                    alpha = np.asarray(image)[:, :, 3]
                    self.assertFalse(alpha[:12].any())
                    self.assertFalse(alpha[-12:].any())
                    self.assertFalse(alpha[:, :12].any())
                    self.assertFalse(alpha[:, -12:].any())
                    x1, y1, x2, y2 = image.getbbox()
                    self.assertLessEqual(max(x2 - x1, y2 - y1), 224)

    def test_reviewed_gaps_are_transparent_and_actual_white_red_dark_pixels_survive(self):
        settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
        for name, asset, _ in MAPPINGS:
            with self.subTest(asset=asset):
                with Image.open(ROOT / "Art" / "source" / "calamitic" / name) as image:
                    original = np.asarray(image)
                    processed = np.asarray(clean(image, settings[asset]))
                for x, y in settings[asset]["background_seeds"]:
                    self.assertEqual(processed[round(y * 1024), round(x * 1024), 3], 0)
                r, g, b = original.astype(int).transpose(2, 0, 1)
                for selected in ((r > 210) & (g > 210) & (b > 210),
                                 (r > 175) & (r > g * 1.8) & (r > b * 1.3),
                                 (r < 40) & (g < 40) & (b < 40)):
                    self.assertGreater(selected.sum(), 20)
                    self.assertGreater((processed[:, :, 3][selected] > 0).mean(), .99)
                    opaque = selected & (processed[:, :, 3] == 255)
                    self.assertGreater(opaque.sum(), 20)
                    np.testing.assert_allclose(processed[:, :, :3][opaque], original[opaque], atol=1)
                    interior = binary_erosion(selected, structure=np.ones((7, 7), dtype=bool))
                    self.assertTrue((processed[:, :, 3][interior] == 255).all())
                    np.testing.assert_allclose(processed[:, :, :3][interior], original[interior], atol=1)
        throne = Image.open(ROOT / "Art" / "source" / "calamitic" / "Throne of Borrowed Tomorrows.png")
        shadow = np.asarray(clean(throne, settings["calamitic-throne-borrowed-tomorrows"]))
        self.assertEqual(shadow[965, 500, 3], 255)

    def test_supplied_alpha_is_authoritative(self):
        image = Image.new("RGBA", (64, 64), (120, 230, 50, 255))
        image.putpixel((0, 0), (10, 20, 30, 0))
        settings = json.loads(SETTINGS.read_text(encoding="utf-8"))["calamitic-tokens"]
        self.assertEqual(clean(image, settings).tobytes(), image.tobytes())

    def test_cleanup_requires_apply_and_review(self):
        for args in ((False, True, False), (True, True, False), (False, True, True)):
            with self.assertRaisesRegex(ValueError, "--apply --reviewed"):
                intake(*args)

    def test_conflicts_fail_before_writing_and_only_verified_root_duplicates_are_removed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            archive = root / "Art" / "source" / "calamitic"
            shutil.copytree(ROOT / "Art" / "source" / "calamitic", archive)
            settings = root / "settings.json"
            shutil.copyfile(SETTINGS, settings)
            manifest = root / "manifest.json"
            sentinel = root / "unrelated.png"
            sentinel.write_bytes(b"untouched")
            first = MAPPINGS[0]
            incoming = root / first[0]
            incoming.write_bytes(b"wrong source")
            with self.assertRaisesRegex(FileExistsError, "Conflicting"):
                preflight(root, settings, manifest)
            self.assertFalse((root / "public").exists())
            shutil.copyfile(archive / first[0], incoming)
            intake(True, True, True, root, settings, manifest)
            self.assertFalse(incoming.exists())
            self.assertEqual(sentinel.read_bytes(), b"untouched")
            runtime = root / "public" / "assets" / first[2] / f"{first[1]}.png"
            runtime.write_bytes(b"changed export")
            with self.assertRaisesRegex(FileExistsError, "Changed or untracked"):
                preflight(root, settings, manifest)


if __name__ == "__main__":
    unittest.main()
