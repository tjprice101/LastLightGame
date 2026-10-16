"""Native status archive safety, alpha authority and exact export reproduction."""

from hashlib import sha256
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

import numpy as np
from PIL import Image, ImageDraw

import intake_native_status_art as native
from intake_status_art import clean, pixel_digest, prepare
import status_art_revisions


class NativeStatusArtTests(unittest.TestCase):
    def test_exact_mapping_and_existing_family_assets_remain_independent(self):
        rows = native.assets()
        self.assertEqual(len(rows), 27)
        self.assertEqual(len({row[0] for row in rows}), 27)
        self.assertEqual(len({row[1] for row in rows}), 27)
        for asset, incoming, archive, runtime in rows:
            self.assertEqual(archive.parent.name, "native-statuses")
            self.assertEqual(runtime.name, f"{asset}.png")
            self.assertEqual(runtime.parent.name, "statuses")
            self.assertEqual(archive.name, incoming)
        self.assertEqual(status_art_revisions.OUTPUT.read_text(encoding="utf-8"),
                         status_art_revisions.revision_source())
        self.assertEqual(len(status_art_revisions.ASSETS), 36)

    def test_every_archive_and_export_matches_manifest_and_reproduces_without_root(self):
        manifest = json.loads(native.MANIFEST.read_text(encoding="utf-8"))
        self.assertEqual(manifest["asset_count"], 27)
        records = {row["asset"]: row for row in manifest["assets"]}
        settings = native.load_settings()
        for asset, _, archive, runtime in native.assets():
            with self.subTest(asset=asset):
                record = records[asset]
                self.assertEqual(native.digest(archive), record["source_sha256"])
                self.assertEqual(native.digest(runtime), record["runtime_sha256"])
                output, metadata = prepare(archive, settings[asset])
                self.assertEqual(output, runtime.read_bytes())
                self.assertEqual(record["settings"], settings[asset])
                self.assertEqual(metadata["runtime_pixel_sha256"], record["runtime_pixel_sha256"])
                with Image.open(archive) as image:
                    self.assertEqual(pixel_digest(image), record["source_pixel_sha256"])
                    self.assertEqual(image.size, (1024, 1024))
                    self.assertEqual(image.mode, "RGB")

    def test_transparent_safety_margin_and_preserved_authored_insets(self):
        settings = native.load_settings()
        for asset, _, archive, runtime in native.assets():
            with self.subTest(asset=asset), Image.open(archive) as original, Image.open(runtime) as output:
                processed = clean(original, settings[asset])
                self.assertEqual(output.mode, "RGBA")
                self.assertEqual(output.size, (256, 256))
                alpha = np.array(output.getchannel("A"))
                for border in (alpha[:16], alpha[-16:], alpha[:, :16], alpha[:, -16:]):
                    self.assertEqual(int(border.max()), 0)
                self.assertGreater(np.count_nonzero(alpha), 10000)
                self.assertLessEqual(output.getbbox()[2] - output.getbbox()[0], 224)
                self.assertLessEqual(output.getbbox()[3] - output.getbbox()[1], 224)
                for x, y in ((.5, .5), (.5, .65)):
                    xy = (round(x * original.width), round(y * original.height))
                    self.assertEqual(processed.getpixel(xy), (*original.getpixel(xy), 255))
                for x, y in settings[asset]["background_seeds"]:
                    self.assertEqual(processed.getpixel((round(x * original.width), round(y * original.height)))[3], 0)
                self.assertEqual(processed.getpixel((0, 0))[3], 0)

    def test_supplied_alpha_stays_authoritative(self):
        original = Image.new("RGBA", (32, 32), (0, 255, 0, 0))
        ImageDraw.Draw(original).rectangle((4, 4, 27, 27), fill=(0, 255, 0, 173))
        self.assertEqual(clean(original, {
            "border_only": True, "keys": [[0, 255, 0]], "radius": 255,
            "background_seeds": [[.5, .5]],
        }).tobytes(), original.tobytes())

    def test_preflight_conflicts_and_verified_root_cleanup(self):
        with TemporaryDirectory(prefix="last-light-native-status-") as directory:
            root = Path(directory)
            incoming = root / "Example.png"
            archive = root / "archive" / "Example.png"
            runtime = root / "runtime" / "status-native-example.png"
            settings = root / "settings.json"
            manifest = root / "manifest.json"
            image = Image.new("RGB", (32, 32), (0, 255, 0))
            ImageDraw.Draw(image).rectangle((5, 5, 26, 26), fill="white")
            image.save(incoming)
            original_hash = native.digest(incoming)
            settings.write_text(json.dumps({"status-native-example": {
                "border_only": True, "keys": [[0, 255, 0]], "radius": 12,
                "background_seeds": [], "review": "Fixture",
            }}), encoding="utf-8")
            row = ("status-native-example", "Example.png", archive, runtime)
            with patch.object(native, "assets", return_value=[row]):
                kwargs = {"root": root, "settings_path": settings, "manifest_path": manifest}
                with self.assertRaisesRegex(ValueError, "--reviewed"):
                    native.intake(apply=True, remove_incoming=True, **kwargs)
                native.intake(apply=True, **kwargs)
                self.assertEqual(native.digest(archive), original_hash)
                runtime.write_bytes(b"changed export")
                with self.assertRaisesRegex(FileExistsError, "changed native status runtime"):
                    native.intake(apply=True, remove_incoming=True, reviewed=True, **kwargs)
                self.assertTrue(incoming.exists())
                runtime.write_bytes(prepare(archive, native.load_settings(settings)["status-native-example"])[0])
                archive.write_bytes(b"changed archive")
                with self.assertRaisesRegex(FileExistsError, "Conflicting native status archive"):
                    native.intake(apply=True, **kwargs)
                archive.write_bytes(incoming.read_bytes())
                native.intake(apply=True, remove_incoming=True, reviewed=True, **kwargs)
                self.assertFalse(incoming.exists())
                self.assertEqual(native.digest(archive), original_hash)
                native.preflight(**kwargs)
                self.assertEqual(sha256(runtime.read_bytes()).hexdigest(),
                                 json.loads(manifest.read_text())["assets"][0]["runtime_sha256"])


if __name__ == "__main__":
    unittest.main()
