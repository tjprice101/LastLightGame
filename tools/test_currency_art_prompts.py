"""Prism currency designs retain renderer and matte without portrait references."""
from pathlib import Path
import re
import unittest
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
BLOCK = re.compile(r"```text\n(.*?)\n```", re.S)


class CurrencyArtPromptTests(unittest.TestCase):
    def test_both_currency_icons_have_no_style_reference_flags(self):
        text = (art_path("Currencies.md", root=ROOT)).read_text(encoding="utf-8")
        bodies = BLOCK.findall(text)
        self.assertEqual(len(bodies), 2)
        self.assertIn("Prismatica - Main currency", text)
        self.assertIn("Null-Prismatica - Premium currency", text)
        for body in bodies:
            positive = body.split(" --", 1)[0]
            self.assertNotIn("--sref", body)
            self.assertNotIn("--sw", body)
            for flag in ("ar", "niji", "s", "q", "no"):
                self.assertEqual(len(re.findall(rf"--{flag}\s", body)), 1)
            for anchor in ("contours", "cel shading", "painted highlights", "jewel-like",
                           "roughly two thirds", "nothing touches the frame edges",
                           "plain solid green background (#00FF00)",
                           "flat unlit color edge to edge and through all openings",
                           "subject colors unchanged", "non-emissive painted highlights"):
                self.assertIn(anchor, positive)
            self.assertIn("--ar 1:1 --niji 6 --s 100 --q 1", body)
            self.assertNotRegex(positive, r"\b(?:Fractalis|Lycalis|Prismatica|blood|gore|nude|bust)\b")
        self.assertIn("one white precious coin", bodies[0])
        self.assertIn("shimmering light conveyed by crisp painted", bodies[0])
        self.assertIn("one cracked black precious coin", bodies[1])
        self.assertIn("red and white lightning bolts emerging directly from the cracks", bodies[1])
        for body in bodies:
            self.assertNotIn("coin", body.split(" --no ", 1)[1].split(", "))


if __name__ == "__main__":
    unittest.main()
