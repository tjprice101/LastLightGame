import collections
import re
import unittest
from build_conduit_expansion_art import ROOT, designs, document
from art_library import art_path


class ConduitExpansionArtTests(unittest.TestCase):
    def test_catalog_distribution_identities_and_reproduction(self):
        rows = designs()
        self.assertEqual(collections.Counter(row[1] for row in rows), {"Common": 5, "Rare": 10, "Legendary": 10, "Omnic": 10})
        self.assertEqual(len({row[2] for row in rows}), 35)
        self.assertEqual(len({row[3] for row in rows if row[1] == "Omnic"}), 10)
        text = (art_path("Conduit Expansion.md", root=ROOT)).read_text(encoding="utf-8")
        self.assertEqual(text, document())
        self.assertIn("All35 delivered images are installed", text)
        self.assertTrue((ROOT / "Art" / "source" / "delivered-root-art" / "conduits").is_dir())
        blocks = re.findall(r"```text\n(.*?)\n```", text, re.S)
        self.assertEqual(len(blocks), 35)
        for row, block in zip(rows, blocks):
            self.assertIn(row[-1].lower(), block)
            self.assertNotIn("--sref", block)
            self.assertNotIn("--sw", block)
            self.assertEqual(block.count("--no "), 1)
            self.assertIn("--ar 1:1 --niji 6 --s 100", block)
            self.assertIn("continuous safety margin on all four sides and corners", block)
            self.assertIn("flat unlit color edge to edge and through all openings", block)
            self.assertLess(len(block.split(" --ar ")[0].split()), 250)
        self.assertIn("not URLs", text)
        for asset in re.findall(r"Proposed art ID: `([^`]+)`", text):
            self.assertTrue((ROOT / "public" / "assets" / "conduits" / f"{asset}.png").is_file(), asset)


if __name__ == "__main__":
    unittest.main()
