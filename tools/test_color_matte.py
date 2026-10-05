import unittest
import numpy as np
from PIL import Image
from color_matte import remove_color_matte
from prepare_art import ROOT
from prepare_dungeons import TRANQUILITIC_ENEMIES, VOLTAIC_ENEMIES, prepare_dungeon_sprite
from review_art import sources
from prepare_infusions import prepare_infusion_sprite, remove_heart_matte


class ColorMatteTests(unittest.TestCase):
    def test_replacement_heart_removes_background_and_shadow_without_erasing_crystals(self):
        source = ROOT / "Art" / "source" / "materials" / "Heart of the Shattered Void.png"
        with Image.open(source) as image:
            cutout = remove_heart_matte(image)
            for point in ((0, 0), (230, 270), (700, 880), (460, 850), (670, 250), (500, 930)):
                self.assertEqual(cutout.getpixel(point)[3], 0)
            for point in ((450, 220), (800, 528), (320, 730), (460, 200), (500, 400), (100, 450)):
                self.assertEqual(cutout.getpixel(point), (*image.convert("RGB").getpixel(point), 255))
        exported = prepare_infusion_sprite(source, "abyss-heart-shattered-void", 256, 224)
        with Image.open(ROOT / "public" / "assets" / "materials" / "abyss-heart-shattered-void.png") as runtime:
            np.testing.assert_array_equal(np.asarray(exported), np.asarray(runtime))
            self.assertEqual(runtime.mode, "RGBA")
            self.assertEqual(runtime.size, (256, 256))
            bbox = runtime.getbbox()
            self.assertEqual(max(bbox[2] - bbox[0], bbox[3] - bbox[1]), 224)
            self.assertGreaterEqual(min(bbox[0], bbox[1], 256-bbox[2], 256-bbox[3]), 16)

    def test_key_removes_enclosed_openings_but_preserves_white_and_cyan(self):
        image = Image.new("RGB", (9, 9), (240, 60, 150))
        for y in range(2, 7):
            for x in range(2, 7):
                image.putpixel((x, y), (255, 255, 255))
        image.putpixel((4, 4), (240, 60, 150))
        image.putpixel((3, 4), (0, 220, 220))
        result = remove_color_matte(image, 330)
        self.assertEqual(result.getpixel((0, 0)), (0, 0, 0, 0))
        self.assertEqual(result.getpixel((4, 4))[3], 0)
        self.assertEqual(result.getpixel((2, 2)), (255, 255, 255, 255))
        self.assertEqual(result.getpixel((3, 4)), (0, 220, 220, 255))

    def test_border_only_protects_enclosed_matching_subject_colors(self):
        image = Image.new("RGB", (9, 9), (255, 183, 109))
        for y in range(2, 7):
            for x in range(2, 7):
                image.putpixel((x, y), (0, 200, 220))
        image.putpixel((4, 4), (255, 183, 109))
        result = remove_color_matte(image, 30, border_only=True)
        self.assertEqual(result.getpixel((0, 0))[3], 0)
        self.assertEqual(result.getpixel((4, 4))[3], 255)

    def test_rejects_bad_settings_and_unmatched_background(self):
        image = Image.new("RGB", (2, 2), "white")
        for options in ({"hue": -1}, {"hue": 360}, {"hue": 330, "tolerance": 0},
                        {"hue": 330, "saturation_min": 0}):
            with self.assertRaises(ValueError):
                remove_color_matte(image, **options)
        with self.assertRaises(ValueError):
            remove_color_matte(image, 330)

    def test_all_color_key_exports_have_correct_size_and_clear_margins(self):
        assets = [("enemies", key, 960, 864, 48)
                  for pack in (TRANQUILITIC_ENEMIES, VOLTAIC_ENEMIES) for key in pack.values()]
        assets += [("materials", element + "-" + key, 256, 224, 16)
                   for element in ("tranquilitic", "voltaic")
                   for key in ("seed", "bloom", "shard", "crest", "heart", "soul")]
        for category, key, size, content, margin in assets:
            with self.subTest(asset=key), Image.open(ROOT / "public" / "assets" / category / f"{key}.png") as image:
                self.assertEqual(image.mode, "RGBA")
                self.assertEqual(image.size, (size, size))
                alpha = np.asarray(image)[:, :, 3]
                self.assertFalse(alpha[0].any() or alpha[-1].any() or alpha[:, 0].any() or alpha[:, -1].any())
                self.assertTrue((alpha == 255).any())
                bbox = image.getbbox()
                self.assertEqual(max(bbox[2]-bbox[0], bbox[3]-bbox[1]), content)
                self.assertGreaterEqual(min(bbox[0], bbox[1], size-bbox[2], size-bbox[3]), margin)

    def test_landscapes_remain_byte_identical_to_archived_originals(self):
        for title, slug in (("City of Heaven", "city-of-heaven"), ("Galvanic Field", "galvanic-field")):
            for category, kind in (("banners", "Banner"), ("backgrounds", "Arena")):
                self.assertEqual((ROOT/"Art"/"source"/category/f"{title} {kind}.png").read_bytes(),
                                 (ROOT/"public"/"assets"/category/f"{slug}.png").read_bytes())

    def test_review_and_export_use_identical_processing(self):
        for key, source in sources().items():
            if (key not in TRANQUILITIC_ENEMIES.values() and key not in VOLTAIC_ENEMIES.values()
                    and not key.startswith(("tranquilitic-", "voltaic-"))):
                continue
            with self.subTest(asset=key):
                size, content = (256, 224) if source.parent.name == "materials" else (960, 864)
                regenerated = prepare_dungeon_sprite(source, key, size, content)
                with Image.open(ROOT/"public"/"assets"/source.parent.name/f"{key}.png") as runtime:
                    self.assertTrue(np.array_equal(np.asarray(regenerated), np.asarray(runtime)))

    def test_reviewed_shard_ribbon_and_crane_halo_survive(self):
        with Image.open(ROOT/"Art"/"source"/"materials"/"Shard of Tranquilitic.png") as image:
            result = remove_color_matte(image, 348, tolerance=5, saturation_min=.45, value_min=.85)
            for point in ((245, 205), (285, 430), (400, 260)):
                self.assertEqual(result.getpixel(point), (*image.getpixel(point), 255))
            self.assertEqual(result.getpixel((20, 20))[3], 0)
        with Image.open(ROOT/"Art"/"source"/"enemies"/"Porcelain Crane.png") as image:
            result = remove_color_matte(image, 328)
            self.assertEqual(result.getpixel((610, 86)), (*image.getpixel((610, 86)), 255))
            self.assertEqual(result.getpixel((610, 120))[3], 0)

    def test_foreground_mask_preserves_key_colored_painted_details(self):
        image = Image.new("RGB", (5, 5), (50, 200, 150))
        mask = Image.new("L", image.size)
        mask.putpixel((2, 2), 255)
        result = remove_color_matte(image, 160, foreground_mask=mask)
        self.assertEqual(result.getpixel((2, 2)), (50, 200, 150, 255))
        self.assertEqual(result.getpixel((0, 0))[3], 0)
        with self.assertRaises(ValueError):
            remove_color_matte(image, 160, foreground_mask=Image.new("L", (2, 2)))


if __name__ == "__main__":
    unittest.main()
