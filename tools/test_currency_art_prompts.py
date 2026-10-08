"""Prism currency designs retain renderer and matte without portrait references."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parent.parent
BLOCK = re.compile(r"```text\n(.*?)\n```", re.S)


class CurrencyArtPromptTests(unittest.TestCase):
    def test_both_currency_icons_have_no_style_reference_flags(self):
        text = (ROOT / "Art" / "Currencies.md").read_text(encoding="utf-8")
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
        self.assertIn("one bright precious prism crystal", bodies[0])
        self.assertIn("one dark precious prism crystal", bodies[1])


if __name__ == "__main__":
    unittest.main()
