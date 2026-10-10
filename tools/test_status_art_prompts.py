import re
import unittest
from build_status_art import ROOT, STATUSES, document
from art_library import art_path


class StatusArtTests(unittest.TestCase):
    def test_all_current_resource_and_charge_ids_are_available(self):
        ids = {row[1] for row in STATUSES}
        required = {"burn", "ward", "bloom", "tempest", "focus", "suppression",
                    "rose-grace", "thorn-aegis", "rose-duality"}
        self.assertEqual(ids, required)
        for asset in required:
            self.assertIn(f"status-{asset}.png", document())

    def test_exact_reproduction_and_distinct_status_symbols(self):
        text = (art_path("Battle Status Icons.md", root=ROOT)).read_text(encoding="utf-8")
        self.assertEqual(text, document())
        self.assertEqual(len(STATUSES), 9)
        self.assertEqual(len({row[1] for row in STATUSES}), 9)
        blocks = re.findall(r"```text\n(.*?)\n```", text, re.S)
        self.assertEqual(len(blocks), 9)
        for block in blocks:
            self.assertNotIn("one one", block)
            self.assertIn("strict subject palette lock", block)
            self.assertIn("nothing touches the frame edges", block)
            key = re.search(r"plain solid (\w+) background", block).group(1)
            excluded = [word.strip() for word in block.split("--no ", 1)[1].split(",")]
            self.assertNotIn(key, excluded)
            self.assertNotIn("--sref", block)
            self.assertNotIn("--sw", block)
            self.assertEqual(block.count("--no "), 1)
            self.assertIn("--ar 1:1 --niji 6 --s 100", block)
            self.assertIn("continuous clear safety margin", block)
            self.assertIn("flat unlit color edge to edge and through all openings", block)
            self.assertIn("non-emissive painted highlights", block)
            self.assertLess(len(block.split(" --ar ")[0].split()), 250)
        self.assertIn("No icons are installed", text)


if __name__ == "__main__":
    unittest.main()
