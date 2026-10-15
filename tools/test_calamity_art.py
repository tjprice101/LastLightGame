from hashlib import sha256
from io import BytesIO
import json
import unittest

from PIL import Image

from intake_calamity_art import MANIFEST, SETTINGS, assets, digest, prepare
from intake_status_art import clean


class CalamityArtTests(unittest.TestCase):
    def test_archival_export_reproduction_and_scenery_pixels(self):
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
        records = {row["asset"]: row for row in manifest["assets"]}
        self.assertEqual(manifest["asset_count"], 17)
        self.assertEqual(manifest["missing_bosses"], ["roses"])
        for asset, incoming, category, source, runtime in assets():
            with self.subTest(asset=asset):
                record = records[asset]
                self.assertEqual(digest(source), record["source_sha256"])
                root_original = source.parents[3] / incoming
                if root_original.exists():
                    self.assertEqual(digest(root_original), digest(source))
                output, metadata = prepare(source, settings[asset], category)
                self.assertEqual(output, runtime.read_bytes())
                self.assertEqual(sha256(output).hexdigest(), record["runtime_sha256"])
                self.assertEqual(metadata["runtime_pixel_sha256"], record["runtime_pixel_sha256"])
                with Image.open(source) as original, Image.open(BytesIO(output)) as installed:
                    if category == "backgrounds":
                        self.assertEqual(installed.mode, "RGB")
                        self.assertEqual(installed.size, original.size)
                        self.assertEqual(installed.tobytes(), original.convert("RGB").tobytes())
                    else:
                        self.assertEqual(installed.mode, "RGBA")
                        self.assertEqual(installed.size, (960, 960) if category == "enemies" else (256, 256))
                        self.assertEqual(installed.getpixel((0, 0))[3], 0)
                        self.assertEqual(installed.getpixel((installed.width - 1, installed.height - 1))[3], 0)
                        alpha = clean(original, settings[asset]).getchannel("A")
                        for x, y in settings[asset]["background_seeds"]:
                            self.assertEqual(alpha.getpixel((round(x * alpha.width), round(y * alpha.height))), 0)

    def test_supplied_alpha_bypasses_keying(self):
        image = Image.new("RGBA", (10, 10), (70, 180, 150, 255))
        image.putpixel((0, 0), (70, 180, 150, 0))
        self.assertEqual(clean(image, {"keys": [[70, 180, 150]], "radius": 100}).tobytes(), image.tobytes())

    def test_preserves_authored_eye_and_shadows(self):
        rows = {asset: source for asset, _, _, source, _ in assets()}
        settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
        samples = {
            "calamity-boss-oceanic": [(645, 350)],
            "calamity-boss-treasury": [(90, 875)],
            "calamity-chest-slayer": [(500, 900)],
        }
        for asset, points in samples.items():
            with Image.open(rows[asset]) as original:
                processed = clean(original, settings[asset])
                for point in points:
                    with self.subTest(asset=asset, point=point):
                        self.assertEqual(processed.getpixel(point), (*original.getpixel(point), 255))


if __name__ == "__main__":
    unittest.main()
