import unittest

from PIL import Image, ImageDraw

from prepare_art import ASSETS, CANVAS_SIZE, CONTENT_SIZE, ROOT, remove_matte, standardize_sprite


class SpriteSizingTests(unittest.TestCase):
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

    def test_empty_sprites_fail_explicitly(self):
        with self.assertRaisesRegex(ValueError, "empty sprite"):
            standardize_sprite(Image.new("RGBA", (100, 100)))

    def test_white_background_is_removed_but_enclosed_white_is_preserved(self):
        source = Image.new("RGB", (100, 100), "white")
        draw = ImageDraw.Draw(source)
        draw.rectangle((20, 20, 79, 79), fill=(100, 40, 20))
        draw.rectangle((35, 35, 64, 64), fill="white")
        result = remove_matte(source)
        self.assertEqual(result.getpixel((0, 0))[3], 0)
        self.assertEqual(result.getpixel((480, 480)), (255, 255, 255, 255))

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


if __name__ == "__main__":
    unittest.main()
