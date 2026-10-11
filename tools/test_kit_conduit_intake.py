from io import BytesIO
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from PIL import Image

from intake_kit_conduit_art import MANIFEST, ROOT, assets, digest, load_settings, prepare, preflight
from intake_status_art import clean
from prepare_art import standardize_sprite


class KitConduitIntakeTests(unittest.TestCase):
    def test_exact_original_mapping_hashes_and_reproduction(self):
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        planned = preflight()
        self.assertEqual(len(planned), 25)
        self.assertEqual(manifest["asset_count"], 25)
        records = {record["asset"]: record for record in manifest["assets"]}
        self.assertEqual(set(records), set(load_settings()))
        for source, archived, runtime, output, record in planned:
            with self.subTest(asset=record["asset"]):
                self.assertEqual(source, archived)
                self.assertFalse((ROOT / record["incoming"]).exists())
                self.assertEqual(digest(archived), record["source_sha256"])
                self.assertEqual(records[record["asset"]], record)
                self.assertEqual(runtime.read_bytes(), output)
                with Image.open(BytesIO(output)) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (256, 256))
                    left, top, right, bottom = image.getbbox()
                    self.assertLessEqual(max(right - left, bottom - top), 224)
                    self.assertGreaterEqual(min(left, top, 256 - right, 256 - bottom), 16)
                    self.assertEqual(image.getpixel((0, 0))[3], 0)

    def test_supplied_alpha_is_never_rekeyed(self):
        image = Image.new("RGBA", (40, 40), (0, 255, 0, 255))
        image.putpixel((0, 0), (0, 0, 0, 0))
        with TemporaryDirectory() as directory:
            source = Path(directory) / "alpha.png"
            image.save(source)
            output, metadata = prepare(source, next(iter(load_settings().values())))
        with Image.open(BytesIO(output)) as actual:
            self.assertEqual(actual.tobytes(), standardize_sprite(image, 256, 224).tobytes())
        self.assertTrue(metadata["source_alpha_authoritative"])

    def test_matching_green_crystal_is_preserved_and_reviewed_gap_removed(self):
        asset, _, source, _ = next(row for row in assets() if row[0] == "botanic-graft-covenant")
        with Image.open(source) as image:
            result = clean(image, load_settings()[asset])
        self.assertEqual(result.getpixel((550, 300))[3], 255)
        self.assertEqual(result.getpixel((300, 730))[3], 0)

    def test_firstlight_interior_backdrop_is_removed_without_erasing_white_or_turquoise(self):
        asset, _, source, _ = next(row for row in assets() if row[0] == "firstlight-cam")
        with Image.open(source) as image:
            result = clean(image, load_settings()[asset])
        self.assertEqual(result.getpixel((410, 184))[3], 0)
        self.assertEqual(result.getpixel((480, 177))[3], 0)
        self.assertEqual(result.getpixel((334, 435))[3], 255)
        self.assertEqual(result.getpixel((380, 780))[3], 255)


if __name__ == "__main__":
    unittest.main()
