"""Verify installed profile art, provenance and subject-preserving composition."""
import json
from io import BytesIO
import unittest
from tempfile import TemporaryDirectory
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from intake_profile_picture_art import (
    ROOT, SETTINGS, MANIFEST, assets, digest, mosaic, render,
)


class ProfilePictureIntakeTests(unittest.TestCase):
    def test_every_export_reproduces_and_preserves_archived_sources(self):
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
        self.assertEqual(manifest["asset_count"], 32)
        self.assertEqual({row["asset"] for row in manifest["assets"]},
                         {asset for _, asset, _ in assets()})
        for row in manifest["assets"]:
            with self.subTest(asset=row["asset"]):
                source = ROOT / row["source"]
                runtime = ROOT / row["runtime"]
                self.assertEqual(digest(source.read_bytes()), row["source_sha256"])
                self.assertEqual(digest(runtime.read_bytes()), row["runtime_sha256"])
                output, cutout = render(source, settings[row["asset"]], row["element"])
                self.assertEqual(output, runtime.read_bytes())
                self.assertEqual(Image.open(BytesIO(output)).size, (1024, 1024))
                if cutout is None:
                    self.assertEqual(row["asset"], "sprout-omnic")
                    self.assertEqual(output, source.read_bytes())
                else:
                    rgba = np.asarray(cutout)
                    original = np.asarray(Image.open(source).convert("RGB"))
                    installed = np.asarray(Image.open(BytesIO(output)).convert("RGB"))
                    matte = Image.fromarray(np.uint8(rgba[:, :, 3] == 0) * 255)
                    interior = (rgba[:, :, 3] == 255) & (
                        np.asarray(matte.filter(ImageFilter.MaxFilter(3))) == 0)
                    self.assertTrue(np.array_equal(installed[interior], original[interior]))
                    opaque = rgba[:, :, 3] == 255
                    self.assertGreater(np.count_nonzero(opaque), 1024 * 1024 * .2)
                    self.assertGreater(np.count_nonzero(rgba[:, :, 3] == 0), 1024 * 1024 * .05)

    def test_mosaics_are_deterministic_vibrant_and_element_distinct(self):
        from intake_profile_picture_art import PALETTES
        hashes = set()
        for element in PALETTES:
            image = mosaic(element, 128)
            self.assertEqual(image.tobytes(), mosaic(element, 128).tobytes())
            colors = np.asarray(image)[:, :, :3]
            self.assertGreater(len(np.unique(colors.reshape(-1, 3), axis=0)), 1000)
            hashes.add(digest(image.tobytes()))
        self.assertEqual(len(hashes), 6)

    def test_supplied_alpha_bypasses_keying_and_invalid_size_rejects(self):
        with TemporaryDirectory() as directory:
            source = Path(directory) / "alpha.png"
            image = Image.new("RGBA", (1024, 1024), (10, 20, 30, 128))
            image.save(source)
            _, cutout = render(source, {}, "botanic")
            self.assertEqual(cutout.tobytes(), image.tobytes())
            Image.new("RGB", (100, 100)).save(source)
            with self.assertRaisesRegex(ValueError, "square 1024px"):
                render(source, {}, "botanic")


if __name__ == "__main__":
    unittest.main()
