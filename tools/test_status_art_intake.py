"""Status-only paths, alpha authority, reviewed detail and archive reproduction."""

from hashlib import sha256
from io import BytesIO
import json
import shutil
import unittest
from unittest.mock import patch
from uuid import uuid4

import numpy as np
from PIL import Image, ImageDraw

import intake_status_art as status
from intake_status_art import clean
from prepare_art import ROOT, standardize_sprite


class StatusImageTests(unittest.TestCase):
    def test_exact_nine_names_and_status_only_paths(self):
        expected = {
            "Atmospheric Charge.png": "status-tempest",
            "Botanic Renewal.png": "status-bloom",
            "Chaotic Suppression.png": "status-suppression",
            "Infernic Embers.png": "status-burn",
            "Oceanic Protection.png": "status-ward",
            "Rose Duality.png": "status-rose-duality",
            "Rose Grace.png": "status-rose-grace",
            "Thorn Aegis.png": "status-thorn-aegis",
            "Tranquilitic Focus.png": "status-focus",
        }
        rows = status.assets()
        self.assertEqual({row.incoming: row.asset for row in rows}, expected)
        self.assertEqual(len(rows), 9)
        for row in rows:
            self.assertEqual(row.source, ROOT / "Art" / "source" / "abilities" /
                             "statuses" / row.incoming)
            self.assertEqual(row.runtime, ROOT / "public" / "assets" / "abilities" /
                             "statuses" / f"{row.asset}.png")

    def test_source_specific_keys_and_gap_review(self):
        settings = status.load_settings()
        self.assertEqual(set(settings), {row.asset for row in status.assets()})
        for entry in settings.values():
            self.assertTrue(entry["border_only"])
            self.assertGreater(entry["radius"], 0)
            self.assertTrue(entry["review"])
            self.assertIn("background_seeds", entry)
        self.assertGreater(settings["status-bloom"]["keys"][0][0],
                           settings["status-bloom"]["keys"][0][1])
        self.assertIn("foreground_polygons", settings["status-tempest"])

    def test_supplied_alpha_bypasses_keys_gaps_and_cleanup(self):
        original = Image.new("RGBA", (32, 24), (0, 255, 0, 0))
        ImageDraw.Draw(original).rectangle((5, 4, 26, 19), fill=(0, 255, 0, 173))
        settings = {"keys": [[0, 255, 0]], "radius": 255, "border_only": True,
                    "background_seeds": [[.5, .5]],
                    "edge_cleanup": {"source_pixels": 2, "distance_ramp": 60}}
        self.assertEqual(clean(original, settings).tobytes(), original.tobytes())
        self.assertEqual(standardize_sprite(clean(original, settings), 256, 224).tobytes(),
                         standardize_sprite(original, 256, 224).tobytes())

    def test_unreviewed_enclosed_subject_stays_and_only_seeded_gap_is_removed(self):
        original = Image.new("RGB", (32, 32), (0, 255, 0))
        draw = ImageDraw.Draw(original)
        draw.rectangle((4, 4, 27, 27), fill=(240, 240, 235))
        draw.rectangle((12, 12, 19, 19), fill=(0, 255, 0))
        settings = {"keys": [[0, 255, 0]], "radius": 12, "border_only": True}
        result = clean(original, settings)
        self.assertEqual(result.getpixel((16, 16)), (0, 255, 0, 255))
        self.assertEqual(result.getpixel((5, 5)), (240, 240, 235, 255))
        result = clean(original, dict(settings, background_seeds=[[.5, .5]]))
        self.assertEqual(result.getpixel((16, 16))[3], 0)
        self.assertEqual(result.getpixel((5, 5)), (240, 240, 235, 255))

    def test_invalid_gap_seed_refuses_foreground_removal(self):
        original = Image.new("RGB", (32, 32), (0, 255, 0))
        ImageDraw.Draw(original).rectangle((8, 8, 23, 23), fill="white")
        with self.assertRaisesRegex(ValueError, "does not match the key"):
            clean(original, {"keys": [[0, 255, 0]], "radius": 12, "border_only": True,
                             "background_seeds": [[.5, .5]]})

    def test_pixel_hash_includes_dimensions(self):
        self.assertNotEqual(status.pixel_digest(Image.new("RGB", (2, 6), "white")),
                            status.pixel_digest(Image.new("RGB", (3, 4), "white")))


class InstalledStatusTests(unittest.TestCase):
    def test_archive_hashes_decoded_hashes_and_no_root_required_reproduction(self):
        manifest = json.loads(status.MANIFEST.read_text(encoding="utf-8"))
        self.assertEqual(manifest["asset_count"], 9)
        records = {record["asset"]: record for record in manifest["assets"]}
        self.assertEqual(set(records), {row.asset for row in status.assets()})
        settings = status.load_settings()
        for row in status.assets():
            with self.subTest(asset=row.asset):
                record = records[row.asset]
                self.assertEqual(status.digest(row.source), record["source_sha256"])
                self.assertEqual(status.digest(row.runtime), record["runtime_sha256"])
                with Image.open(row.source) as image:
                    self.assertEqual(status.pixel_digest(image), record["source_pixel_sha256"])
                    self.assertEqual(list(image.size), record["source_dimensions"])
                output, metadata = status.prepare(row.source, settings[row.asset])
                self.assertEqual(output, row.runtime.read_bytes())
                self.assertEqual(sha256(output).hexdigest(), record["runtime_sha256"])
                self.assertEqual(metadata["runtime_pixel_sha256"], record["runtime_pixel_sha256"])
                self.assertEqual(record["settings"], settings[row.asset])

    def test_transparent_canvas_not_full_scene_and_224_content(self):
        for row in status.assets():
            with self.subTest(asset=row.asset), Image.open(row.runtime) as image:
                self.assertEqual(image.mode, "RGBA")
                self.assertEqual(image.size, (256, 256))
                alpha = np.asarray(image.getchannel("A"))
                self.assertEqual(int(alpha[:16].max()), 0)
                self.assertEqual(int(alpha[-16:].max()), 0)
                self.assertEqual(int(alpha[:, :16].max()), 0)
                self.assertEqual(int(alpha[:, -16:].max()), 0)
                left, top, right, bottom = image.getbbox()
                self.assertLessEqual(right - left, 224)
                self.assertLessEqual(bottom - top, 224)
                self.assertGreater(np.count_nonzero(alpha), 2000)
                self.assertLess(np.count_nonzero(alpha), 40000)

    def test_reviewed_foreground_pale_green_and_shadow_pixels_unchanged(self):
        samples = {
            "status-tempest": [(.5, .25), (.47, .435)],
            "status-bloom": [(.4, .45), (.7, .25)],
            "status-suppression": [(.25, .25), (.5, .5)],
            "status-burn": [(.4, .5), (.5, .45), (.208, .601), (.134, .246)],
            "status-ward": [(.5, .35), (.2, .4)],
            "status-rose-duality": [(.23, .5), (.5, .34)],
            "status-rose-grace": [(.76, .36), (.2, .7)],
            "status-thorn-aegis": [(.5, .5), (.72, .17)],
            "status-focus": [(.5, .17), (.583, .395), (.69, .46)],
        }
        settings = status.load_settings()
        for row in status.assets():
            with self.subTest(asset=row.asset), Image.open(row.source) as original:
                result = clean(original, settings[row.asset])
                for x, y in samples[row.asset]:
                    pixel = (round(x * original.width), round(y * original.height))
                    self.assertEqual(result.getpixel(pixel), (*original.convert("RGB").getpixel(pixel), 255))
                for x, y in settings[row.asset]["background_seeds"]:
                    pixel = (round(x * original.width), round(y * original.height))
                    self.assertEqual(result.getpixel(pixel)[3], 0)
                self.assertEqual(result.getpixel((0, 0))[3], 0)


class StatusSafetyTests(unittest.TestCase):
    def setUp(self):
        self.root = ROOT / f".status-art-test-fixture-{uuid4().hex}"
        self.root.mkdir()
        self.manifest = self.root / "manifest.json"
        self.row = status.Asset("incoming.png", "fixture",
                                self.root / "Art" / "source" / "abilities" / "statuses" / "incoming.png",
                                self.root / "public" / "assets" / "abilities" / "statuses" / "fixture.png")
        original = Image.new("RGB", (64, 48), (0, 255, 0))
        ImageDraw.Draw(original).rectangle((10, 10, 50, 40), fill=(240, 240, 230))
        original.save(self.root / self.row.incoming)
        self.original = (self.root / self.row.incoming).read_bytes()
        self.settings = {"fixture": {"keys": [[0, 255, 0]], "radius": 12, "border_only": True}}
        self.patch_assets = patch.object(status, "assets", return_value=[self.row])
        self.patch_settings = patch.object(status, "load_settings", return_value=self.settings)
        self.patch_assets.start()
        self.patch_settings.start()

    def tearDown(self):
        self.patch_settings.stop()
        self.patch_assets.stop()
        shutil.rmtree(self.root)

    def intake(self, **arguments):
        return status.intake(root=self.root, manifest_path=self.manifest, **arguments)

    def test_dry_run_never_writes(self):
        self.intake()
        self.assertFalse(self.row.source.exists())
        self.assertFalse(self.row.runtime.exists())
        self.assertFalse(self.manifest.exists())

    def test_byte_identical_archive_idempotence_and_exact_cleanup(self):
        unrelated = self.root / "unrelated.png"
        unrelated.write_bytes(b"do not touch")
        first = self.intake(apply=True, reviewed=True)
        self.assertEqual(self.row.source.read_bytes(), self.original)
        output = self.row.runtime.read_bytes()
        self.assertEqual(self.intake(apply=True, reviewed=True, remove_incoming=True), first)
        self.assertFalse((self.root / self.row.incoming).exists())
        self.assertEqual(self.intake(apply=True), first)
        self.assertEqual(self.row.runtime.read_bytes(), output)
        self.assertEqual(unrelated.read_bytes(), b"do not touch")

    def test_cleanup_requires_review_before_any_writes(self):
        for arguments in ({"remove_incoming": True}, {"apply": True, "remove_incoming": True}):
            with self.assertRaisesRegex(ValueError, "Root cleanup requires"):
                self.intake(**arguments)
        self.assertFalse(self.row.source.exists())

    def test_conflicting_archive_prevents_export_or_delete(self):
        self.row.source.parent.mkdir(parents=True)
        self.row.source.write_bytes(b"conflict")
        with self.assertRaisesRegex(FileExistsError, "Conflicting status archive"):
            self.intake(apply=True, reviewed=True, remove_incoming=True)
        self.assertFalse(self.row.runtime.exists())
        self.assertTrue((self.root / self.row.incoming).exists())

    def test_unknown_runtime_preserved(self):
        self.row.runtime.parent.mkdir(parents=True)
        self.row.runtime.write_bytes(b"previous image")
        with self.assertRaisesRegex(FileExistsError, "Untracked or changed"):
            self.intake(apply=True)
        self.assertEqual(self.row.runtime.read_bytes(), b"previous image")
        self.assertFalse(self.row.source.exists())

    def test_changed_archived_source_refused(self):
        self.intake(apply=True)
        (self.root / self.row.incoming).unlink()
        self.row.source.write_bytes(b"changed source")
        with self.assertRaisesRegex(FileExistsError, "Status source changed"):
            self.intake(apply=True)


if __name__ == "__main__":
    unittest.main()
