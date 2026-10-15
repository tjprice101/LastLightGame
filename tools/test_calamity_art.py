from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from PIL import Image

from intake_calamity_art import MANIFEST, SETTINGS, ROOT, REPLACEMENTS, assets, digest, prepare, preflight
from intake_status_art import clean


class CalamityArtTests(unittest.TestCase):
    def test_archival_export_reproduction_and_scenery_pixels(self):
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        settings = json.loads(SETTINGS.read_text(encoding="utf-8"))
        records = {row["asset"]: row for row in manifest["assets"]}
        self.assertEqual(manifest["asset_count"], 18)
        self.assertEqual(manifest["missing_bosses"], [])
        for asset, incoming, category, source, runtime in assets():
            with self.subTest(asset=asset):
                record = records[asset]
                self.assertEqual(digest(source), record["source_sha256"])
                root_original = ROOT / incoming
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

    def test_replacements_preserve_and_reproduce_previous_sources_and_exports(self):
        records = json.loads(MANIFEST.read_text(encoding="utf-8"))["assets"]
        for asset in REPLACEMENTS:
            record = next(row for row in records if row["asset"] == asset)
            self.assertIn("replacements", Path(record["source"]).parts)
            self.assertEqual(len(record["previous_exports"]), 1)
            for old in record["previous_exports"]:
                source, runtime = ROOT / old["source"], ROOT / old["runtime"]
                self.assertEqual(digest(source), old["source_sha256"])
                self.assertEqual(digest(runtime), old["runtime_sha256"])
                self.assertNotEqual(old["source_sha256"], record["source_sha256"])
                self.assertNotEqual(old["runtime_sha256"], record["runtime_sha256"])
                output, _ = prepare(source, old["settings"], old["category"])
                self.assertEqual(output, runtime.read_bytes())

    def test_changed_source_requires_explicit_replacement_and_unchanged_runtime(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            incoming = root / "new.png"
            source = root / "original.png"
            runtime = root / "runtime.png"
            archive = root / "replacement.png"
            incoming.write_bytes(b"new")
            source.write_bytes(b"old source")
            runtime.write_bytes(b"old runtime")
            asset = "calamity-boss-heavens"
            settings = root / "settings.json"
            manifest = root / "manifest.json"
            settings.write_text(json.dumps({asset: {}}))
            manifest.write_text(json.dumps({"assets": [{
                "asset": asset, "source": source.name, "source_sha256": digest(source),
                "runtime_sha256": digest(runtime),
            }]}))
            with patch("intake_calamity_art.SETTINGS", settings), \
                    patch("intake_calamity_art.MANIFEST", manifest), \
                    patch("intake_calamity_art.assets", return_value=[
                        (asset, incoming.name, "enemies", archive, runtime)]):
                with self.assertRaisesRegex(FileExistsError, "source changed"):
                    preflight(root)
                runtime.write_bytes(b"unexpected contributor change")
                with self.assertRaisesRegex(FileExistsError, "Untracked or changed runtime"):
                    preflight(root, replacements=[asset])
                self.assertFalse(archive.exists())
                self.assertEqual(source.read_bytes(), b"old source")

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
            "calamity-boss-roses": [(600, 235), (600, 810), (530, 888)],
            "calamity-boss-heavens": [(608, 274), (230, 155), (486, 683), (580, 873)],
            "calamity-boss-sanctuary": [(625, 206), (920, 350), (586, 513), (590, 911)],
        }
        for asset, points in samples.items():
            with Image.open(rows[asset]) as original:
                processed = clean(original, settings[asset])
                for point in points:
                    with self.subTest(asset=asset, point=point):
                        self.assertEqual(processed.getpixel(point), (*original.getpixel(point), 255))


if __name__ == "__main__":
    unittest.main()
