"""Validate shared action prompt contracts, not generated image quality."""
from pathlib import Path
import re
import unittest
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent


class UniversalActionPromptTests(unittest.TestCase):
    def test_two_distinct_reference_free_square_cutouts(self):
        text = (art_path("Universal Action Icons.md", root=ROOT)).read_text(encoding="utf-8")
        blocks = re.findall(r"```text\n(.*?)\n```", text, re.S)
        self.assertEqual(len(blocks), 2)
        self.assertIn("steel sword sweep normal attack", blocks[0])
        self.assertIn("diagonal upward-right", blocks[0])
        self.assertIn("steel shield defense", blocks[1])
        self.assertIn("broad upright silver steel kite shield", blocks[1])
        self.assertNotIn("sword", blocks[0].split(" --no ", 1)[1].split(", "))
        self.assertNotIn("shield", blocks[1].split(" --no ", 1)[1].split(", "))
        for body in blocks:
            with self.subTest(prompt=body[:70]):
                self.assertNotIn("--sref", body)
                self.assertNotIn("--sw", body)
                self.assertEqual(body.count("--no "), 1)
                self.assertIn("--ar 1:1 --niji 6", body)
                self.assertIn("crisp cel shading", body)
                self.assertIn("continuous clear safety margin on all four sides and corners", body)
                self.assertIn("pull back the whole design rather than crop or simplify it", body)
                self.assertIn("non-emissive painted highlights --ar", body)
                positive, negative = body.split(" --no ", 1)
                self.assertLess(len(positive.split()), 300)
                self.assertNotIn("green", negative)
                for exclusion in ("cropping", "background gradient", "background color spill",
                                  "glow", "glowing effects", "light bloom", "text", "interface"):
                    self.assertIn(exclusion, negative.split(", "))

    def test_plan_has_exactly_35_distinct_designs_and_all_omnic_elements(self):
        text = (ROOT / "docs" / "conduit-expansion-plan.md").read_text(encoding="utf-8")
        rows = re.findall(r"^\| (\d{2}) \| (.+?) \|", text, re.M)
        self.assertEqual([number for number, _ in rows], [f"{n:02d}" for n in range(1, 36)])
        names = [name.split(" / ")[-1] for _, name in rows]
        self.assertEqual(len(set(names)), 35)
        expected = {"Infernic", "Aquatic", "Tectonic", "Efflorescent", "Voltaic",
                    "Atmospheric", "Luminous", "Ominous", "Tranquilitic", "Chaotic"}
        self.assertEqual({name.split(" / ")[0] for _, name in rows[25:]}, expected)
        live = (ROOT / "src" / "content" / "conduits.ts").read_text(encoding="utf-8")
        for name in names:
            self.assertIn(f"name: '{name}'", live)
        self.assertIn("5 Common + 10 Rare + 10 Legendary + 10 Omnic = 35", text)
        self.assertIn("Common is Store-only", text)
        self.assertIn("Phase 6 - Revised currency coin prompts", text)
        self.assertIn("until both new", text)


if __name__ == "__main__":
    unittest.main()
