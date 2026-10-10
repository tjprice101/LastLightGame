"""Story source authority, reproducibility, scenery and preflight regressions."""

from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import shutil
import unittest
from unittest.mock import patch
from uuid import uuid4

import numpy as np
from PIL import Image, ImageDraw

import intake_story_art as story
from intake_character_refresh import clean
from prepare_art import ROOT, standardize_sprite


class StoryImageTests(unittest.TestCase):
    def test_exact_catalog_and_paths(self):
        rows = story.assets()
        self.assertEqual(len(rows), 37)
        self.assertEqual(len({row.asset for row in rows}), 37)
        self.assertEqual(len({row.incoming for row in rows}), 37)
        self.assertEqual(sum(row.category == "enemies" for row in rows), 30)
        self.assertEqual(sum(row.asset.endswith("-arena") for row in rows), 6)
        self.assertEqual(sum(row.asset == "story-world-map" for row in rows), 1)
        self.assertEqual(sum("infernic" in row.asset for row in rows), 5)
        for element, region, _ in story.REGIONS:
            self.assertEqual({row.asset for row in rows if row.asset.startswith(f"story-{element}-")},
                             {f"story-{element}-{suffix}" for suffix in ("0", "1", "2", "3", "boss")})
            self.assertIn(f"story-{region.lower().replace(' ', '-')}-arena",
                          {row.asset for row in rows})
        for row in rows:
            self.assertTrue(row.source.is_relative_to(ROOT / "Art" / "source" / "story"))
            self.assertEqual(row.runtime.parent.name, row.category)

    def test_settings_are_source_specific_connected_and_have_facing(self):
        settings = story.load_settings()
        self.assertEqual(len(settings), 37)
        for row in story.assets():
            entry = settings[row.asset]
            if row.category == "enemies":
                self.assertTrue(entry["border_only"])
                self.assertEqual(len(entry["keys"][0]), 3)
                self.assertGreater(entry["radius"], 0)
                self.assertIn(entry["source_facing"], ("left", "right", "front"))
            else:
                self.assertEqual(entry, {"processing": "opaque-original-size"})

    def test_supplied_alpha_is_not_keyed_recolored_or_gap_cleaned(self):
        image = Image.new("RGBA", (24, 24), (0, 255, 0, 0))
        ImageDraw.Draw(image).rectangle((4, 4, 19, 19), fill=(0, 255, 0, 173))
        result = clean(image, {"keys": [[0, 255, 0]], "radius": 100,
                               "border_only": True, "background_seeds": [[.5, .5]],
                               "foreground_polygons": [], "edge_cleanup": {
                                   "source_pixels": 2, "distance_ramp": 60}})
        self.assertEqual(result.tobytes(), image.tobytes())
        self.assertEqual(standardize_sprite(result).getbbox(),
                         standardize_sprite(image).getbbox())

    def test_key_matching_enclosed_subject_is_kept_until_explicit_seed(self):
        image = Image.new("RGB", (32, 32), (0, 255, 0))
        draw = ImageDraw.Draw(image)
        draw.rectangle((4, 4, 27, 27), fill=(240, 30, 200))
        draw.rectangle((12, 12, 19, 19), fill=(0, 255, 0))
        settings = {"keys": [[0, 255, 0]], "radius": 10, "border_only": True}
        result = clean(image, settings)
        self.assertEqual(result.getpixel((0, 0))[3], 0)
        self.assertEqual(result.getpixel((15, 15)), (0, 255, 0, 255))
        result = clean(image, dict(settings, background_seeds=[[.5, .5]]))
        self.assertEqual(result.getpixel((15, 15))[3], 0)
        self.assertEqual(result.getpixel((5, 5)), (240, 30, 200, 255))

    def test_foreground_polygon_protects_matching_color(self):
        image = Image.new("RGB", (32, 32), (0, 255, 0))
        settings = {"keys": [[0, 255, 0]], "radius": 10, "border_only": True,
                    "foreground_polygons": [[[.25, .25], [.75, .25], [.75, .75], [.25, .75]]]}
        result = clean(image, settings)
        self.assertEqual(result.getpixel((16, 16)), (0, 255, 0, 255))
        self.assertEqual(result.getpixel((0, 0))[3], 0)

    def test_invalid_gap_seed_rejected(self):
        image = Image.new("RGB", (32, 32), (0, 255, 0))
        ImageDraw.Draw(image).rectangle((8, 8, 23, 23), fill=(255, 0, 255))
        with self.assertRaisesRegex(ValueError, "does not match the key"):
            clean(image, {"keys": [[0, 255, 0]], "radius": 10,
                          "border_only": True, "background_seeds": [[.5, .5]]})

    def test_pixel_revision_includes_dimensions(self):
        self.assertNotEqual(story.pixel_digest(Image.new("RGB", (2, 6), "red")),
                            story.pixel_digest(Image.new("RGB", (3, 4), "red")))
        self.assertEqual(story.pixel_digest(Image.new("RGB", (3, 4), "red")),
                         story.pixel_digest(Image.new("RGBA", (3, 4), "red")))


class StoryPreflightTests(unittest.TestCase):
    def setUp(self):
        self.root = ROOT / f".story-art-test-fixture-{uuid4().hex}"
        self.root.mkdir()
        self.manifest = self.root / "manifest.json"
        self.settings_path = self.root / "settings.json"
        self.row = story.Asset("incoming.png", "fixture", "enemies",
                               self.root / "Art" / "source" / "story" / "fixture.png",
                               self.root / "public" / "assets" / "enemies" / "fixture.png")
        self.settings = {"fixture": {"keys": [[0, 255, 0]], "radius": 10,
                                     "border_only": True, "source_facing": "front"}}
        image = Image.new("RGB", (64, 48), (0, 255, 0))
        ImageDraw.Draw(image).rectangle((10, 10, 50, 40), fill=(255, 0, 255))
        image.save(self.root / self.row.incoming)
        self.patch_assets = patch.object(story, "assets", return_value=[self.row])
        self.patch_settings = patch.object(story, "load_settings", return_value=self.settings)
        self.patch_assets.start()
        self.patch_settings.start()

    def tearDown(self):
        self.patch_settings.stop()
        self.patch_assets.stop()
        shutil.rmtree(self.root)

    def intake(self, **arguments):
        return story.intake(root=self.root, settings_path=self.settings_path,
                            manifest_path=self.manifest, **arguments)

    def test_dry_run_has_no_writes(self):
        result = self.intake()
        self.assertEqual(len(result["assets"]), 1)
        self.assertFalse(self.row.source.exists())
        self.assertFalse(self.row.runtime.exists())
        self.assertFalse(self.manifest.exists())
        self.assertTrue((self.root / self.row.incoming).exists())

    def test_byte_identical_archive_idempotence_and_verified_cleanup(self):
        original = (self.root / self.row.incoming).read_bytes()
        first = self.intake(apply=True, reviewed=True)
        self.assertEqual(self.row.source.read_bytes(), original)
        output = self.row.runtime.read_bytes()
        second = self.intake(apply=True, reviewed=True, remove_incoming=True)
        self.assertEqual(first, second)
        self.assertFalse((self.root / self.row.incoming).exists())
        third = self.intake(apply=True)
        self.assertEqual(second, third)
        self.assertEqual(self.row.runtime.read_bytes(), output)
        self.assertEqual(first["assets"][0]["source_sha256"], sha256(original).hexdigest())

    def test_unapproved_cleanup_rejected_before_writes(self):
        for arguments in ({"remove_incoming": True}, {"apply": True, "remove_incoming": True}):
            with self.assertRaisesRegex(ValueError, "Root cleanup requires"):
                self.intake(**arguments)
        self.assertFalse(self.row.source.exists())

    def test_archive_conflict_rejected_before_writes(self):
        self.row.source.parent.mkdir(parents=True)
        self.row.source.write_bytes(b"conflict")
        with self.assertRaisesRegex(FileExistsError, "Conflicting Story archive"):
            self.intake(apply=True)
        self.assertFalse(self.row.runtime.exists())
        self.assertFalse(self.manifest.exists())

    def test_untracked_and_changed_runtime_rejected(self):
        self.row.runtime.parent.mkdir(parents=True)
        self.row.runtime.write_bytes(b"untracked")
        with self.assertRaisesRegex(FileExistsError, "Untracked or changed"):
            self.intake(apply=True)
        self.row.runtime.unlink()
        self.intake(apply=True)
        self.row.runtime.write_bytes(b"changed")
        with self.assertRaisesRegex(FileExistsError, "Untracked or changed"):
            self.intake(apply=True)

    def test_changed_source_rejected(self):
        self.intake(apply=True)
        (self.root / self.row.incoming).write_bytes(b"changed")
        with self.assertRaisesRegex(FileExistsError, "Conflicting Story archive"):
            self.intake(apply=True)

    def test_missing_source_rejected_before_writes(self):
        (self.root / self.row.incoming).unlink()
        with self.assertRaisesRegex(FileNotFoundError, "Story source is missing"):
            self.intake(apply=True)
        self.assertFalse(self.manifest.exists())

    def test_preflight_all_assets_before_any_write(self):
        missing = story.Asset("missing.png", "missing", "enemies",
                              self.root / "missing-archive.png", self.root / "missing-export.png")
        with patch.object(story, "assets", return_value=[self.row, missing]):
            with self.assertRaises(FileNotFoundError):
                self.intake(apply=True)
        self.assertFalse(self.row.source.exists())
        self.assertFalse(self.row.runtime.exists())

    def test_region_intake_preserves_other_records_and_ignores_replacement_map(self):
        regional = story.Asset(self.row.incoming, "fixture", "enemies",
                               self.root / "Art" / "source" / "story" / "infernic" / "fixture.png",
                               self.row.runtime)
        map_row = story.Asset("World Map.png", "story-world-map", "backgrounds",
                              self.root / "Art" / "source" / "story" / "world-map" / "World Map.png",
                              self.root / "public" / "assets" / "backgrounds" / "story-world-map.png")
        map_row.source.parent.mkdir(parents=True)
        map_row.runtime.parent.mkdir(parents=True)
        Image.new("RGB", (17, 9), "blue").save(map_row.source)
        output, dimensions, runtime_dimensions, pixels, alpha = story.prepare(
            map_row.source, {}, "backgrounds")
        map_row.runtime.write_bytes(output)
        old = {"asset": map_row.asset, "category": "backgrounds",
               "source_sha256": story.digest(map_row.source),
               "runtime_sha256": story.digest(map_row.runtime)}
        self.manifest.write_text(json.dumps({"visual_review": "approved", "assets": [old]}))
        replacement = b"unrelated replacement map"
        (self.root / map_row.incoming).write_bytes(replacement)
        with patch.object(story, "assets", return_value=[regional, map_row]):
            result = self.intake(apply=True, reviewed=True, remove_incoming=True, element="infernic")
        self.assertEqual(result["assets"][1], old)
        self.assertEqual(result["counts"], {"enemies": 1, "arenas": 0, "world_maps": 1})
        self.assertEqual(map_row.runtime.read_bytes(), output)
        self.assertEqual((self.root / map_row.incoming).read_bytes(), replacement)
        self.assertFalse((self.root / regional.incoming).exists())

    def test_unknown_region_rejected_before_writes(self):
        with self.assertRaisesRegex(ValueError, "Unknown Story element"):
            self.intake(apply=True, element="invalid")
        self.assertFalse(self.row.source.exists())

    def test_scenery_preserves_every_pixel_and_original_aspect(self):
        source = self.root / "scenery.png"
        pixels = np.arange(17 * 9 * 3, dtype=np.uint8).reshape((9, 17, 3))
        Image.fromarray(pixels).save(source)
        output, dimensions, runtime_dimensions, revision, supplied = story.prepare(
            source, {"processing": "opaque-original-size"}, "backgrounds")
        with Image.open(BytesIO(output)) as exported:
            self.assertEqual(exported.size, (17, 9))
            self.assertEqual(exported.mode, "RGB")
            self.assertEqual(exported.tobytes(), pixels.tobytes())
            self.assertEqual(story.pixel_digest(exported), revision)
        self.assertEqual(dimensions, runtime_dimensions)
        self.assertFalse(supplied)

    def test_transparent_scenery_is_not_silently_flattened(self):
        source = self.root / "scenery.png"
        Image.new("RGBA", (17, 9), (0, 255, 0, 100)).save(source)
        with self.assertRaisesRegex(ValueError, "refusing to discard source alpha"):
            story.prepare(source, {"processing": "opaque-original-size"}, "backgrounds")


class InstalledStoryTests(unittest.TestCase):
    def test_archived_sources_and_runtime_exports_match_manifest(self):
        self.assertTrue(story.MANIFEST.is_file(), "Run reviewed Story intake first.")
        manifest = json.loads(story.MANIFEST.read_text(encoding="utf-8"))
        settings = story.load_settings()
        self.assertEqual(manifest["counts"], {"enemies": 30, "arenas": 6, "world_maps": 1})
        self.assertEqual(manifest["visual_review"], "approved")
        self.assertEqual({entry["asset"] for entry in manifest["assets"]},
                         {row.asset for row in story.assets()})
        for entry in manifest["assets"]:
            with self.subTest(asset=entry["asset"]):
                source = ROOT / entry["source"]
                runtime = ROOT / entry["runtime"]
                self.assertEqual(story.digest(source), entry["source_sha256"])
                self.assertEqual(story.digest(runtime), entry["runtime_sha256"])
                self.assertEqual(entry["settings"], settings[entry["asset"]])
                output, dimensions, runtime_dimensions, revision, supplied = story.prepare(
                    source, settings[entry["asset"]], entry["category"])
                self.assertEqual(output, runtime.read_bytes())
                self.assertEqual(dimensions, entry["source_dimensions"])
                self.assertEqual(runtime_dimensions, entry["runtime_dimensions"])
                self.assertEqual(revision, entry["runtime_pixel_sha256"])
                self.assertEqual(supplied, entry["source_alpha_authoritative"])
                with Image.open(runtime) as image:
                    if entry["category"] == "enemies":
                        self.assertEqual(image.size, (960, 960))
                        self.assertEqual(image.mode, "RGBA")
                        left, top, right, bottom = image.getbbox()
                        self.assertGreaterEqual(min(left, top, 960 - right, 960 - bottom), 48)
                    else:
                        self.assertEqual(image.mode, "RGB")
                        self.assertEqual(image.size, (1456, 816))
                        with Image.open(source) as original:
                            self.assertEqual(image.tobytes(), original.convert("RGB").tobytes())


if __name__ == "__main__":
    unittest.main()
