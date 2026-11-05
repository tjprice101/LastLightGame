import unittest

from build_calamitic_art import references
from build_elemental_war_art import RENDERER
from build_moon_banner_art import (
    CHARACTERS, OUTPUT, RARITIES, STATUS_SYMBOLS, approved_sections, blocks, document,
)


class MoonBannerArtTests(unittest.TestCase):
    def test_inventory_and_reproduction(self):
        rows = blocks()
        self.assertEqual(len(rows), 98)
        self.assertEqual(len({asset for asset, _, _, _ in rows}), 98)
        self.assertEqual(OUTPUT.read_text(encoding="utf-8"), document())
        self.assertEqual(sum("--ar 4:3" in prompt for _, _, prompt, _ in rows), 36)
        self.assertEqual(sum("--ar 1:1" in prompt for _, _, prompt, _ in rows), 59)
        self.assertEqual(sum("--ar 3:1" in prompt for _, _, prompt, _ in rows), 1)
        self.assertEqual(sum("--ar 16:9" in prompt for _, _, prompt, _ in rows), 2)
        self.assertEqual(len(STATUS_SYMBOLS), 11)

    def test_approved_features_forms_and_exact_references(self):
        approved = approved_sections()
        portraits = {asset: prompt for asset, _, prompt, _ in blocks() if "--ar 4:3" in prompt}
        refs = references()
        titles = []
        for character in CHARACTERS:
            fixed, forms = approved[character["slug"]]
            self.assertEqual(len(character["titles"]), 6)
            titles.extend(character["titles"])
            for stage, (rarity, form) in enumerate(zip(RARITIES, forms), 1):
                with self.subTest(character=character["name"], rarity=rarity):
                    prompt = portraits[f"{character['slug']}-{stage}.png"]
                    self.assertIn(fixed, prompt)
                    self.assertIn(form, prompt)
                    self.assertIn(character["weapon"], prompt)
                    self.assertIn(RENDERER, prompt)
                    self.assertTrue(prompt.endswith(f"--sref {refs[stage]} --sw 150"))
                    self.assertNotIn(character["titles"][stage - 1], prompt)
                    self.assertIn("glow on edges", prompt.split(" --no ", 1)[1])
                    self.assertIn("natural authored skin tones are exempt", prompt)
                    self.assertNotIn("gold metal", prompt.split(" --no ", 1)[0])
        self.assertEqual(len(titles), len(set(titles)))
        self.assertNotIn("Glow of the Moon's Light", titles)

    def test_cutout_clearance_and_nonportrait_reference_scope(self):
        for asset, _, prompt, _ in blocks():
            with self.subTest(asset=asset):
                self.assertLessEqual(len(prompt.split(" --ar")[0].split()), 380)
                for anchor in ("contours", "cel shading", "painted highlights", "jewel-like"):
                    self.assertIn(anchor, prompt.split(" --ar")[0])
                if "--ar 4:3" not in prompt:
                    self.assertNotIn("--sref", prompt)
                    self.assertNotIn("--sw", prompt)
                if "--ar 4:3" in prompt or "--ar 1:1" in prompt:
                    self.assertIn("continuous empty15 percent border", prompt)
                    self.assertIn("safety margin", prompt)
                    self.assertIn("plain solid green background (#00FF00)", prompt)
                    self.assertIn("glow on edges", prompt)
                    negatives = prompt.split(" --no ", 1)[1].split(" --sref", 1)[0].split(", ")
                    self.assertNotIn("green", negatives)
                    self.assertIn("--niji 6 --s 100 --q 1", prompt)
                if "--ar 1:1" in prompt:
                    self.assertIn("object-only", prompt)
                    self.assertIn("no wielder", prompt)
                    self.assertIn("tiny character", prompt)
                if asset.startswith("master-"):
                    self.assertIn("one integrated luxury-scale chassis", prompt)
                    self.assertIn("precision gears", prompt)
                    self.assertIn("not buildings", prompt)

    def test_early_forms_and_distinct_omnic_counts(self):
        forms = approved_sections()
        expected = {
            "maerion": "Eight", "caevren": "Six", "vespera": "Fourteen",
            "ilyss": "Ten", "asteriel": "Twelve", "serapha": "Twelve",
        }
        for slug, (_, rows) in forms.items():
            self.assertIn("no wings", rows[0].lower())
            self.assertIn("no wings", rows[1].lower())
            self.assertIn(expected[slug], rows[-1])
        content = document()
        self.assertEqual(content.count("No hair, eye or skin changes."), 36)
        self.assertIn("Counts remain TBD, not zero", content)
        self.assertIn("Flagged kit values remain unchanged", content)
        self.assertNotRegex(content, r"/assets/.*\.png")


if __name__ == "__main__":
    unittest.main()
