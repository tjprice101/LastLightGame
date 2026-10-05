import unittest
import hashlib
import numpy as np
import json
from unittest.mock import patch

from PIL import Image, ImageDraw

from prepare_art import ASSETS, CANVAS_SIZE, CONTENT_SIZE, ROOT, remove_matte, standardize_sprite, pale_art_mask, prepare_sprite, supplied_cutout
from prepare_icons import ICONS
from prepare_dungeons import AQUATIC_ENEMIES, EFFLORESCENT_ENEMIES, LANDSCAPES
from prepare_infusions import ENEMIES as INFUSION_ENEMIES, MATERIALS as INFUSION_MATERIALS, LANDSCAPES as INFUSION_LANDSCAPES
from matte_regions import BACKGROUND_SEEDS, BACKGROUND_MINIMUMS
from prepare_art import MATTE_MINIMUMS, MATTE_SPREADS
from review_art import sources


class SpriteSizingTests(unittest.TestCase):
    def test_supplied_cutouts_preserve_original_bytes_and_bypass_matte_removal(self):
        manifest = json.loads((ROOT / "Art" / "cutout-intake.json").read_text(encoding="utf-8"))
        records = manifest["assets"]
        self.assertEqual(len(records), 96)
        self.assertEqual(len({row["asset"] for row in records}), 96)
        with patch("prepare_art.remove_matte", side_effect=AssertionError("Supplied alpha must never be matte-removed")), \
                patch("prepare_art.pale_art_mask", side_effect=AssertionError("Supplied alpha must never receive a protection mask")):
            for record in records:
                with self.subTest(asset=record["asset"]):
                    source = ROOT / record["source"]
                    legacy = ROOT / record["legacy_source"]
                    runtime = ROOT / record["runtime"]
                    self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(), record["source_sha256"])
                    self.assertEqual(hashlib.sha256(legacy.read_bytes()).hexdigest(), record["legacy_source_sha256"])
                    if record.get("superseded"):
                        self.assertIsNone(supplied_cutout(record["asset"]))
                        continue
                    self.assertEqual(supplied_cutout(record["asset"]), source)
                    self.assertEqual(hashlib.sha256(runtime.read_bytes()).hexdigest(), record["runtime_sha256"])
                    self.assertFalse((ROOT / record["incoming"]).exists())
                    size, content = (256, 224) if record["category"] in ("abilities", "materials") else (960, 864)
                    result = prepare_sprite(legacy, record["asset"], size, content,
                                            background_seeds=[(-1, -1)], matte_minimum=-1)
                    with Image.open(source) as original, Image.open(runtime) as exported:
                        expected = standardize_sprite(original, size, content)
                        np.testing.assert_array_equal(np.asarray(result), np.asarray(expected))
                        np.testing.assert_array_equal(np.asarray(exported), np.asarray(expected))
        self.assertIsNone(supplied_cutout("flora"))
        self.assertIsNone(supplied_cutout("tizu"))
        self.assertIsNone(supplied_cutout("infernis-heavy-attack"))

    def test_complex_character_holes_and_pale_details_at_source_resolution(self):
        cases = {
            "infernis-evo-6": {
                "holes": [(600, 62), (620, 120), (690, 844), (552, 843)],
                "details": [(255, 165), (973, 165), (325, 340), (615, 800), (375, 755)],
            },
            "tizu-evo-5": {
                "holes": [(425, 91)],
                "details": [(225, 224), (795, 385), (735, 465), (535, 640)],
            },
            "flora-evo-6": {
                "holes": [(620, 110), (480, 200)],
                "details": [(718, 723), (550, 96), (398, 312), (606, 590)],
            },
        }
        for asset, points in cases.items():
            with self.subTest(asset=asset), Image.open(sources()[asset]) as image:
                result = remove_matte(image, matte_minimum=MATTE_MINIMUMS.get(asset, 230),
                                      foreground_mask=pale_art_mask(image, asset),
                                      background_seeds=BACKGROUND_SEEDS[asset],
                                      background_minimum=BACKGROUND_MINIMUMS.get(asset, 230),
                                      standardize=False)
                for point in points["holes"]:
                    self.assertEqual(result.getpixel(point)[3], 0, (asset, point))
                for point in points["details"]:
                    self.assertEqual(result.getpixel(point), (*image.convert("RGB").getpixel(point), 255),
                                     (asset, point))

    def test_reviewed_seed_removes_only_the_selected_enclosed_pocket(self):
        source = Image.new("RGB", (100, 100), "white")
        draw = ImageDraw.Draw(source)
        draw.rectangle((10, 10, 89, 89), fill=(100, 40, 20))
        draw.rectangle((20, 20, 39, 39), fill="white")
        draw.rectangle((60, 60, 79, 79), fill="white")
        result = remove_matte(source, background_seeds=[(.3, .3)], standardize=False)
        self.assertEqual(result.getpixel((30, 30))[3], 0)
        self.assertEqual(result.getpixel((70, 70)), (255, 255, 255, 255))
        self.assertEqual(result.getpixel((50, 50)), (100, 40, 20, 255))

    def test_seed_validation_does_not_silently_erase_colored_or_protected_art(self):
        source = Image.new("RGB", (10, 10), (100, 40, 20))
        for point in [(-.1, .5), (1, .5), (float("nan"), .5), (.5,), (.5, .5)]:
            with self.subTest(point=point), self.assertRaises(ValueError):
                remove_matte(source, background_seeds=[point])
        source = Image.new("RGB", (10, 10), "white")
        mask = Image.new("L", source.size, 255)
        with self.assertRaisesRegex(ValueError, "not eligible"):
            remove_matte(source, foreground_mask=mask, background_seeds=[(.5, .5)])

    def test_stricter_interior_threshold_preserves_connected_pale_art(self):
        source = Image.new("RGB", (100, 100), "white")
        draw = ImageDraw.Draw(source)
        draw.rectangle((10, 10, 89, 89), fill=(100, 40, 20))
        draw.rectangle((20, 20, 39, 39), fill="white")
        draw.rectangle((40, 20, 59, 39), fill=(235, 235, 235))
        result = remove_matte(source, background_seeds=[(.3, .3)], background_minimum=245, standardize=False)
        self.assertEqual(result.getpixel((30, 30))[3], 0)
        self.assertEqual(result.getpixel((50, 30)), (235, 235, 235, 255))

    def test_tinted_soul_background_removes_only_unprotected_backdrop(self):
        path = sources()["efflorescent-soul"]
        with Image.open(path) as image:
            mask = pale_art_mask(image, "efflorescent-soul")
            result = remove_matte(image, matte_minimum=MATTE_MINIMUMS["efflorescent-soul"],
                                  matte_spread=MATTE_SPREADS["efflorescent-soul"],
                                  foreground_mask=mask,
                                  background_seeds=BACKGROUND_SEEDS["efflorescent-soul"],
                                  background_minimum=BACKGROUND_MINIMUMS["efflorescent-soul"], standardize=False)
            original = np.asarray(image.convert("RGB"))
            exported = np.asarray(result)
            protected = np.asarray(mask) > 0
            self.assertTrue(np.all(exported[protected, :3] == original[protected]))
            self.assertTrue(np.all(exported[protected, 3] == 255))
            self.assertEqual(result.getpixel((950, 50))[3], 0)
            self.assertEqual(result.getpixel((850, 570))[3], 0)

    def test_all_authored_points_clear_at_original_resolution_without_erasing_colored_art(self):
        paths = sources()
        for asset, points in BACKGROUND_SEEDS.items():
            with self.subTest(asset=asset), Image.open(paths[asset]) as image:
                result = remove_matte(image, matte_minimum=MATTE_MINIMUMS.get(asset, 230),
                                      matte_spread=MATTE_SPREADS.get(asset, 20),
                                      foreground_mask=pale_art_mask(image, asset),
                                      background_seeds=points,
                                      background_minimum=BACKGROUND_MINIMUMS.get(asset, 230), standardize=False)
                for x, y in points:
                    self.assertLess(result.getpixel((int(x * image.width), int(y * image.height)))[3], 255)
                original = np.asarray(image.convert("RGB"))
                exported = np.asarray(result)
                colored = original.min(axis=2) < min(200, MATTE_MINIMUMS.get(asset, 230), BACKGROUND_MINIMUMS.get(asset, 230))
                self.assertTrue(np.all(exported[colored, :3] == original[colored]))
                self.assertTrue(np.all(exported[colored, 3] == 255))

    def test_foreground_protection_keeps_border_connected_pale_art(self):
        source = Image.new("RGB", (100, 100), (240, 235, 230))
        draw = ImageDraw.Draw(source)
        draw.rectangle((20, 20, 79, 79), fill=(100, 40, 20))
        draw.rectangle((40, 10, 59, 40), fill=(240, 235, 230))
        mask = Image.new("L", source.size)
        ImageDraw.Draw(mask).rectangle((40, 10, 59, 40), fill=255)
        result = remove_matte(source, foreground_mask=mask)
        self.assertEqual(result.getpixel((480, 110))[3], 255)
        self.assertEqual(result.getpixel((0, 0))[3], 0)
        with self.assertRaisesRegex(ValueError, "match source"):
            remove_matte(source, foreground_mask=Image.new("L", (1, 1)))

    def test_infernis_final_form_has_explicit_pale_wing_protection(self):
        source = Image.new("RGB", (1232, 928))
        mask = pale_art_mask(source, "infernis-evo-6")
        self.assertEqual(mask.getpixel((int(0.27 * source.width), int(0.38 * source.height))), 255)
        self.assertEqual(mask.getpixel((int(0.73 * source.width), int(0.38 * source.height))), 255)
        self.assertEqual(mask.getpixel((0, 0)), 0)
        self.assertIsNone(pale_art_mask(source, "tizu"))
    def test_dungeon_enemy_and_material_exports_meet_their_sizing_contracts(self):
        exports = [("enemies", asset_id, 960, 864)
                   for pack in (AQUATIC_ENEMIES, EFFLORESCENT_ENEMIES)
                   for asset_id in pack.values()]
        exports += [("materials", f"{element}-{name}", 256, 224)
                    for element in ("infernic", "aquatic", "efflorescent")
                    for name in ("seed", "bloom", "shard", "crest", "heart", "soul")]
        exports += [("enemies", asset_id, 960, 864) for asset_id in INFUSION_ENEMIES.values()]
        exports += [("materials", asset_id, 256, 224) for asset_id in INFUSION_MATERIALS.values()]
        for category, asset_id, size, content in exports:
            with self.subTest(asset=asset_id):
                with Image.open(ROOT / "public" / "assets" / category / f"{asset_id}.png") as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (size, size))
                    left, top, right, bottom = image.getbbox()
                    self.assertEqual(max(right - left, bottom - top), content)
                    self.assertGreaterEqual(min(left, top, size - right, size - bottom), (size - content) // 2)
                    self.assertLessEqual(abs(left - (size - right)), 1)
                    self.assertLessEqual(abs(top - (size - bottom)), 1)
                    self.assertEqual(image.getpixel((0, 0))[3], 0)

    def test_dungeon_landscapes_and_duplicate_intake_preserve_original_bytes(self):
        for filename, (category, asset_id) in LANDSCAPES.items():
            source = ROOT / "Art" / "source" / category / filename
            output = ROOT / "public" / "assets" / category / f"{asset_id}.png"
            self.assertEqual(hashlib.sha256(source.read_bytes()).digest(), hashlib.sha256(output.read_bytes()).digest())
        for duplicate in (ROOT / "Art" / "source" / "intake-duplicates").glob("*.png"):
            source = ROOT / "Art" / "source" / "enemies" / duplicate.name
            self.assertEqual(hashlib.sha256(source.read_bytes()).digest(), hashlib.sha256(duplicate.read_bytes()).digest())

    def test_all_aspect_ratios_share_canvas_and_content_limit(self):
        for width, height in [(800, 400), (400, 800), (600, 600), (40, 20)]:
            with self.subTest(size=(width, height)):
                source = Image.new("RGBA", (width + 80, height + 80))
                ImageDraw.Draw(source).rectangle((40, 40, width + 39, height + 39), fill=(120, 50, 20, 255))
                result = standardize_sprite(source)
                self.assertEqual(result.size, (CANVAS_SIZE, CANVAS_SIZE))
                left, top, right, bottom = result.getbbox()
                self.assertEqual(max(right - left, bottom - top), CONTENT_SIZE)
                self.assertGreaterEqual(min(left, top, CANVAS_SIZE - right, CANVAS_SIZE - bottom), 48)
                self.assertLessEqual(abs((right - left) / (bottom - top) - width / height), 0.01)
                self.assertLessEqual(abs(left - (CANVAS_SIZE - right)), 1)
                self.assertLessEqual(abs(top - (CANVAS_SIZE - bottom)), 1)

    def test_infusion_landscapes_preserve_original_bytes(self):
        for name, (category, asset_id) in INFUSION_LANDSCAPES.items():
            source = ROOT / "Art" / "source" / category / f"{name}.png"
            output = ROOT / "public" / "assets" / category / f"{asset_id}.png"
            self.assertEqual(hashlib.sha256(source.read_bytes()).digest(), hashlib.sha256(output.read_bytes()).digest())

    def test_empty_sprites_fail_explicitly(self):
        with self.assertRaisesRegex(ValueError, "empty sprite"):
            standardize_sprite(Image.new("RGBA", (100, 100)))

    def test_ability_icons_have_their_own_square_export_contract(self):
        for asset_id in ICONS.values():
            with self.subTest(asset=asset_id):
                with Image.open(ROOT / "public" / "assets" / "abilities" / f"{asset_id}.png") as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (256, 256))
                    left, top, right, bottom = image.getbbox()
                    self.assertEqual(max(right - left, bottom - top), 224)
                    self.assertGreaterEqual(min(left, top, 256 - right, 256 - bottom), 16)
                    self.assertLessEqual(abs(left - (256 - right)), 1)
                    self.assertLessEqual(abs(top - (256 - bottom)), 1)

    def test_white_background_is_removed_but_enclosed_white_is_preserved(self):
        source = Image.new("RGB", (100, 100), "white")
        draw = ImageDraw.Draw(source)
        draw.rectangle((20, 20, 79, 79), fill=(100, 40, 20))
        draw.rectangle((35, 35, 64, 64), fill="white")
        result = remove_matte(source)
        self.assertEqual(result.getpixel((0, 0))[3], 0)
        self.assertEqual(result.getpixel((480, 480)), (255, 255, 255, 255))

    def test_ivory_matte_override_removes_corners_without_erasing_enclosed_pale_details(self):
        source = Image.new("RGB", (100, 100), (230, 224, 218))
        draw = ImageDraw.Draw(source)
        draw.rectangle((20, 20, 79, 79), fill=(100, 40, 20))
        draw.rectangle((35, 35, 64, 64), fill=(245, 240, 235))
        result = remove_matte(source, matte_minimum=215)
        self.assertEqual(result.getpixel((0, 0))[3], 0)
        self.assertEqual(result.getpixel((480, 480)), (245, 240, 235, 255))
        for invalid in (-1, 256, 0.5):
            with self.assertRaises(ValueError):
                remove_matte(source, matte_minimum=invalid)

    def test_every_runtime_character_and_enemy_meets_the_contract(self):
        for category, asset_id in ASSETS.values():
            with self.subTest(asset=asset_id):
                with Image.open(ROOT / "public" / "assets" / category / f"{asset_id}.png") as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (CANVAS_SIZE, CANVAS_SIZE))
                    left, top, right, bottom = image.getbbox()
                    self.assertEqual(max(right - left, bottom - top), CONTENT_SIZE)
                    self.assertGreaterEqual(min(left, top, CANVAS_SIZE - right, CANVAS_SIZE - bottom), 48)
                    self.assertLessEqual(abs(left - (CANVAS_SIZE - right)), 1)
                    self.assertLessEqual(abs(top - (CANVAS_SIZE - bottom)), 1)

    def test_warm_ivory_matte_override_preserves_enclosed_white_art(self):
        source = Image.new("RGB", (100, 100), (241, 223, 209))
        draw = ImageDraw.Draw(source)
        draw.rectangle((20, 20, 79, 79), fill=(100, 40, 20))
        draw.rectangle((35, 35, 64, 64), fill="white")
        result = remove_matte(source, matte_minimum=200, matte_spread=50)
        self.assertEqual(result.getpixel((0, 0))[3], 0)
        self.assertEqual(result.getpixel((480, 480)), (255, 255, 255, 255))
        for invalid in (-1, 256, 0.5):
            with self.assertRaisesRegex(ValueError, "Matte spread"):
                remove_matte(source, matte_spread=invalid)


if __name__ == "__main__":
    unittest.main()
