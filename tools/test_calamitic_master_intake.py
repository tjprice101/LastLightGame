"""Reproduction and subject-preservation checks for the nine delivered Masters."""
from hashlib import sha256
from io import BytesIO
import json
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

from intake_calamitic_master_art import MANIFEST, ROOT, SETTINGS, assets, preflight
from intake_master_conduit_art import prepare
from intake_status_art import clean
from master_conduit_art_revisions import OUTPUT, revision_source
from prepare_art import standardize_sprite


class CalamiticMasterIntakeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
        cls.manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        cls.records = {row["asset"]: row for row in cls.manifest["assets"]}

    def test_exact_delivery_mapping_and_archived_bytes(self):
        expected = {f"master-{owner}-{slot}" for owner in ("ozriel", "ilvaris", "kaelith") for slot in (1, 2, 3)}
        self.assertEqual(set(self.settings), expected)
        self.assertEqual(set(self.records), expected)
        self.assertEqual(self.manifest["asset_count"], 9)
        for asset, filename, archived, runtime in assets():
            with self.subTest(asset=asset):
                row = self.records[asset]
                self.assertEqual(row["incoming"], filename)
                self.assertEqual(row["source"], archived.relative_to(ROOT).as_posix())
                self.assertEqual(row["runtime"], runtime.relative_to(ROOT).as_posix())
                self.assertEqual(sha256(archived.read_bytes()).hexdigest(), row["source_sha256"])
                self.assertEqual(sha256(runtime.read_bytes()).hexdigest(), row["runtime_sha256"])
                self.assertFalse((ROOT / filename).exists())
                self.assertFalse(row["source_alpha_authoritative"])
                self.assertEqual(row["settings"], self.settings[asset])

    def test_exports_reproduce_exactly_with_transparent_margins(self):
        for asset, _, archived, runtime in assets():
            with self.subTest(asset=asset):
                output, metadata = prepare(archived, self.settings[asset])
                self.assertEqual(output, runtime.read_bytes())
                self.assertEqual(metadata["runtime_pixel_sha256"], self.records[asset]["runtime_pixel_sha256"])
                with Image.open(BytesIO(output)) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (256, 256))
                    x0, y0, x1, y1 = image.getbbox()
                    self.assertGreaterEqual(min(x0, y0), 16)
                    self.assertLessEqual(max(x1, y1), 240)
                    self.assertEqual(image.getchannel("A").getextrema(), (0, 255))

    def test_reviewed_gaps_and_red_white_subject_details_survive(self):
        for asset, _, archived, _ in assets():
            with self.subTest(asset=asset), Image.open(archived) as image:
                cutout = clean(image, self.settings[asset])
                original = np.asarray(image).astype(float)
                rgba = np.asarray(cutout)
                red = ((original[:, :, 0] > 170) & (original[:, :, 0] > original[:, :, 1] * 1.8) &
                       (original[:, :, 0] > original[:, :, 2] * 1.2))
                white = np.min(original, axis=2) > 210
                self.assertGreater(np.count_nonzero(red), 100)
                self.assertGreater(np.count_nonzero(white), 100)
                self.assertGreater(np.mean(rgba[:, :, 3][red] / 255), .98)
                self.assertGreater(np.mean(rgba[:, :, 3][white] / 255), .98)
                for x, y in self.settings[asset]["background_seeds"]:
                    self.assertEqual(cutout.getpixel((round(x * image.width), round(y * image.height)))[3], 0)
                if asset == "master-kaelith-1":
                    for x, y in ((.3304, .3959), (.2884, .7175), (.7038, .8456)):
                        point = (round(x * image.width), round(y * image.height))
                        self.assertEqual(cutout.getpixel(point), (*image.getpixel(point), 255),
                                         "Muted metal reflections are subject, not a removable green gap.")

    def test_chronodrive_removes_backdrop_shadow_and_detached_lettering(self):
        row = next(row for row in assets() if row[0] == "master-ilvaris-3")
        with Image.open(row[2]) as image:
            cutout = clean(image, self.settings[row[0]])
            for x, y in ((.335, .735), (.52, .91), (.82, .733)):
                self.assertEqual(cutout.getpixel((round(x * image.width), round(y * image.height)))[3], 0)

    def test_supplied_alpha_bypasses_all_keying(self):
        image = Image.new("RGBA", (30, 30))
        image.paste((108, 250, 188, 255), (8, 8, 22, 22))
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "alpha.png"
            image.save(path)
            output, metadata = prepare(path, self.settings["master-ozriel-1"])
        expected = standardize_sprite(image, 256, 224)
        self.assertTrue(metadata["source_alpha_authoritative"])
        self.assertEqual(Image.open(BytesIO(output)).tobytes(), expected.tobytes())

    def test_preflight_is_read_only_and_all_fifty_nine_revisions_match(self):
        before = {path: path.read_bytes() for path in (MANIFEST, SETTINGS, OUTPUT)}
        self.assertEqual(len(preflight()), 9)
        for path, data in before.items():
            self.assertEqual(path.read_bytes(), data)
        self.assertEqual(OUTPUT.read_text(encoding="utf-8"), revision_source())
        self.assertEqual(len(list((ROOT / "public" / "assets" / "master-conduits").glob("*.png"))), 59)


if __name__ == "__main__":
    unittest.main()
