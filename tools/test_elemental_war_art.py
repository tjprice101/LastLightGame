import re
import unittest

from build_elemental_war_art import ART, ROOT, DESIGNS, RENDERER, CONTAIN, MARGIN, outputs, references

BLOCK = re.compile(r"```text\n(.*?)\n```", re.S)


class ElementalWarArtTests(unittest.TestCase):
    def test_generated_documents_match_authored_designs(self):
        for path, expected in outputs().items():
            self.assertEqual(path.read_text(encoding="utf-8"), expected, path.name)

    def test_complete_three_character_packs_and_family_header(self):
        self.assertEqual([design["gender"] for design in DESIGNS], ["female", "female", "male"])
        self.assertEqual({design["element"] for design in DESIGNS}, {"Aquatic", "Tectonic", "Voltaic"})
        for design in DESIGNS:
            text = (ART / f"{design['name']} Art.md").read_text(encoding="utf-8")
            self.assertEqual(len(BLOCK.findall(text)), 15)
            self.assertEqual(len(re.findall(r"Proposed asset ID:", text)), 15)
            for title in design["titles"]:
                self.assertIn(f"{title}, {design['name']}", text)
            for _, name, _, _ in design["icons"]:
                self.assertIn(name, text)
        self.assertEqual(len(BLOCK.findall((ART / "Elemental War.md").read_text())), 1)

    def test_exact_references_ratios_weights_and_single_flags(self):
        refs = references()
        for design in DESIGNS:
            blocks = BLOCK.findall((ART / f"{design['name']} Art.md").read_text())
            for index, prompt in enumerate(blocks):
                ratio = "4:3" if index < 6 else "1:1" if index < 12 else "3:2" if index == 12 else "3:1" if index == 13 else "16:9"
                if index < 6:
                    self.assertTrue(prompt.endswith(f"--sref {refs[index + 1]} --sw 400"))
                else:
                    self.assertNotIn("--sref", prompt)
                    self.assertNotIn("--sw", prompt)
                self.assertIn(f"--ar {ratio}", prompt)
                for flag in ("ar", "niji", "s", "q", "no"):
                    self.assertEqual(len(re.findall(rf"--{flag}(?=\s)", prompt)), 1)
                for flag in ("sref", "sw"):
                    self.assertEqual(len(re.findall(rf"--{flag}(?=\s)", prompt)), int(index < 6))
        banner = BLOCK.findall((ART / "Elemental War.md").read_text())[0]
        self.assertNotIn("--sref", banner)
        self.assertNotIn("--sw", banner)

    def test_renderer_identity_containment_and_positive_word_budget(self):
        for design in DESIGNS:
            blocks = BLOCK.findall((ART / f"{design['name']} Art.md").read_text())
            for index, prompt in enumerate(blocks):
                positive = prompt.split(" --ar", 1)[0]
                self.assertIn(RENDERER, positive)
                self.assertLessEqual(len(positive.split()), 380)
                if index < 13:
                    self.assertIn(CONTAIN, positive)
                    self.assertIn(MARGIN, positive)
                    self.assertIn(f"plain solid {design['key']} background ({design['hex']})", positive)
                    self.assertIn("flat unlit color edge to edge and through all openings", positive)
                    self.assertIn("no glows or glowing visual effects", positive)
                    no_glow = positive.replace("no glows or glowing visual effects", "").replace("non-emissive", "")
                    self.assertNotRegex(no_glow, r"\b(?:glow|glowing|luminous|translucent|emissive)\b")
                else:
                    self.assertIn("full-bleed", positive)
                    self.assertNotIn("plain solid", positive)
                if index < 6:
                    self.assertIn(design["identity"], positive)
                    self.assertIn("2.5-3 heads tall", positive)
                    self.assertIn("eyes only with no other facial features", positive)
                    self.assertIn(design["weapon"], positive)
                if index == 4:
                    self.assertIn("one quarter", positive)
                if index == 5:
                    self.assertIn("one fifth", positive)
                    self.assertIn("retain the Legendary", positive)

    def test_design_status_stage_endpoints_and_exact_recruitment_contract(self):
        spec = (ROOT / "docs" / "elemental-war.md").read_text(encoding="utf-8")
        for phrase in ("not implemented", "**1% chance**", "**base form as a playable character**",
                       "two female, one male", "existing currency", "Proposed currency tuning",
                       "No pity is proposed", "one validated", "receipt-deduplicated",
                       "stages1-9", "roll < .01", "Lv.0/Evo.1/weapon0"):
            self.assertIn(phrase, spec)
        rows = re.findall(r"^\| (\d+) \| (\d+) \| Evo\.(\d) \|", spec, re.M)
        self.assertEqual(len(rows), 10)
        self.assertEqual(rows[0], ("1", "90", "1"))
        self.assertEqual(rows[-1], ("10", "140", "6"))
        for stage, level, _ in rows:
            self.assertEqual(int(level), round(90 + 50 * (int(stage) - 1) / 9))
        self.assertEqual({form for _, _, form in rows}, set("123456"))


if __name__ == "__main__":
    unittest.main()
