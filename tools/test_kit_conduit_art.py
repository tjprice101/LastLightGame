from collections import Counter
import re
import unittest
from art_library import art_path
from build_kit_conduit_art import ROOT, PALETTES, designs, document


class KitConduitArtTests(unittest.TestCase):
    def test_catalog_and_exact_reproduction(self):
        rows = designs()
        self.assertEqual(Counter(row[2] for row in rows), {"Common": 5, "Rare": 8, "Legendary": 6, "Omnic": 6})
        self.assertEqual({row[3] for row in rows if row[2] == "Omnic"}, set(PALETTES))
        self.assertEqual(art_path("conduits", "Kit Conduits.md", root=ROOT).read_text(encoding="utf-8"), document())

    def test_individual_palette_renderer_key_and_framing(self):
        blocks = re.findall(r"```text\n(.*?)\n```", document(), re.S)
        self.assertEqual(len(blocks), 25)
        for row, prompt in zip(designs(), blocks):
            palette, negatives = PALETTES[row[3]]
            self.assertIn(row[4], prompt)
            self.assertIn(palette, prompt)
            self.assertIn("--no " + negatives, prompt)
            self.assertNotIn("green", negatives)
            self.assertNotIn("--sref", prompt)
            self.assertNotIn("--sw", prompt)
            self.assertEqual(prompt.count("--no "), 1)
            self.assertIn("--ar 1:1 --niji 6 --s 100", prompt)
            self.assertIn("continuous safety margin on all four sides and corners", prompt)
            self.assertIn("flat unlit color edge to edge and through all openings", prompt)
            self.assertIn("strict subject palette lock", prompt)
            self.assertIn("no glows or glowing visual effects", prompt)
            self.assertLess(len(prompt.split(" --ar ")[0].split()), 285)


if __name__ == "__main__":
    unittest.main()
