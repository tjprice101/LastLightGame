from art_library import art_documents
import re
import unittest
from character_palette import PALETTES, apply_palette, palette_clause, design_prose
from update_character_palettes import ART, BLOCK, portrait_name, rewrite


class CharacterPaletteTests(unittest.TestCase):
    def test_every_character_cutout_has_tailored_palette_without_positive_conflicts(self):
        portraits = icons_weapons = 0
        characters = set()
        for path in art_documents():
            text = path.read_text(encoding="utf-8")
            for match in BLOCK.finditer(text):
                prompt = match.group(1)
                if "strict subject palette lock:" not in prompt:
                    continue
                name = portrait_name(path, text[:match.start()])
                with self.subTest(file=path.name, character=name):
                    self.assertEqual(prompt.count(palette_clause(name)), 1)
                    self.assertEqual(prompt.count("--no "), 1)
                    positive = prompt.split(" --ar ", 1)[0]
                    design = design_prose(positive).split(", plain solid", 1)[0]
                    key = re.search(r"plain solid (.+?) background", prompt).group(1)
                    negatives = prompt.split(" --no ", 1)[1].split(" --sref ", 1)[0]
                    for color in PALETTES[name][1].split(", "):
                        if name == "Template":
                            continue
                        self.assertNotRegex(design, rf"\b{re.escape(color)}\b")
                        if color != key:
                            self.assertIn(color, negatives.split(", text,", 1)[0])
                    self.assertNotIn(f"--no {key},", prompt)
                    self.assertIn("subject ONLY not the key background", positive)
                    self.assertLessEqual(len(positive.split()), 450)
                    self.assertIn("--q 1", prompt)
                    self.assertEqual(apply_palette(prompt, name), prompt)
                    if "--sref" in prompt:
                        self.assertTrue(prompt.endswith("--sw 150"))
                        portraits += 1
                    else:
                        self.assertNotIn("--sw", prompt)
                        icons_weapons += 1
                    characters.add(name)
        self.assertEqual(portraits, 115)
        self.assertEqual(icons_weapons, 109)
        self.assertEqual(characters, set(PALETTES))

    def test_authoritative_blue_green_and_shadow_palettes_are_not_globally_banned(self):
        for name, allowed in (("Tizu", "blue"), ("Flora", "green"),
                              ("Nerithe", "blue"), ("Razor", "violet"),
                              ("Elise", "violet"), ("Bliss", "blue"),
                              ("Vaelor", "violet")):
            self.assertNotRegex(PALETTES[name][1], rf"\b{allowed}\b")
        for name in ("Infernis", "Crinso", "Disciple"):
            self.assertTrue(PALETTES[name][2])

    def test_codemod_is_idempotent_and_does_not_select_enemy_or_scenery_packs(self):
        for path in art_documents():
            expected, _ = rewrite(path)
            self.assertEqual(path.read_text(encoding="utf-8"), expected, path.name)

    def test_unmapped_input_and_scenery_fail_explicitly(self):
        with self.assertRaises(ValueError):
            apply_palette("--ar 4:3", "Missing")
        with self.assertRaises(ValueError):
            apply_palette("full-bleed --ar 16:9", "Rosetta")


if __name__ == "__main__":
    unittest.main()
