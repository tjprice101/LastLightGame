import json
import unittest

from PIL import Image

from intake_component_art import INCOMING, SOURCE, RUNTIME, MANIFEST, SETTINGS, digest, prepare
from intake_character_refresh import clean


class ComponentArtIntakeTests(unittest.TestCase):
    def test_original_export_hashes_and_exact_regeneration(self):
        record = json.loads(MANIFEST.read_text(encoding="utf-8"))
        self.assertEqual(digest(SOURCE), record["source_sha256"])
        self.assertEqual(digest(RUNTIME), record["runtime_sha256"])
        self.assertEqual(record["processing"], SETTINGS)
        self.assertEqual(prepare(SOURCE), RUNTIME.read_bytes())
        self.assertFalse(INCOMING.exists())
        with Image.open(RUNTIME) as image:
            self.assertEqual(image.mode, "RGBA")
            self.assertEqual(image.size, (256, 256))
            left, top, right, bottom = image.getbbox()
            self.assertGreaterEqual(min(left, top, 256 - right, 256 - bottom), 16)
            self.assertEqual(image.getextrema()[3][0], 0)

    def test_key_removes_backdrop_but_retains_pale_machinery_and_colored_core(self):
        with Image.open(SOURCE) as source:
            result = clean(source, SETTINGS)
            self.assertEqual(result.getpixel((0, 0))[3], 0)
            opaque = result.getchannel("A").histogram()[255]
            self.assertGreater(opaque, 200000)
            self.assertLess(opaque, 700000)
            self.assertEqual(result.getpixel((500, 90))[3], 255)

    def test_supplied_alpha_bypasses_keying(self):
        image = Image.new("RGBA", (30, 30))
        image.putpixel((15, 15), (6, 246, 220, 125))
        self.assertEqual(clean(image, SETTINGS).tobytes(), image.tobytes())


if __name__ == "__main__":
    unittest.main()
