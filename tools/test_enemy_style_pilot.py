import unittest
import re
from build_enemy_style_pilot import ROOT, document, pilot_prompts, rosetta_pilot
from character_palette import palette_clause
from art_library import art_path


class EnemyStylePilotTests(unittest.TestCase):
    def test_exact_reproduction_and_unchanged_design_baselines(self):
        self.assertEqual((art_path("experiments", "Enemy Style Pilot.md", root=ROOT)).read_text(encoding="utf-8"), document())
        prompts = pilot_prompts()
        self.assertEqual(len(prompts), 3)
        for heading, baseline, prompt in prompts:
            with self.subTest(heading=heading):
                self.assertIn(baseline.split(" --ar ", 1)[0], prompt)
                self.assertNotIn("--sref", baseline)
                self.assertEqual(prompt.count("--sref "), 1)
                self.assertTrue(prompt.endswith("--sw 10"))
                self.assertIn("authored creature palette and identity first:", prompt)
                self.assertIn("nothing touches", prompt)
                self.assertIn("plain solid green background", prompt)
                for flag in ("ar", "niji", "s", "q", "no"):
                    self.assertEqual(prompt.count("--" + flag + " "), 1)

    def test_individual_palette_placement_without_global_color_or_fire_bans(self):
        kirin, leviathan, phoenix = [prompt for _, _, prompt in pilot_prompts()]
        self.assertIn("warm cream-ivory ceramic body plates", kirin)
        self.assertIn("pale blush rose limited to sensor eyes", kirin)
        self.assertIn("lavender metal", kirin.split("--no ", 1)[1])
        self.assertIn("sapphire and cobalt sea-dragon armor", leviathan)
        self.assertNotIn("blue armor", leviathan.split("--no ", 1)[1])
        self.assertIn("flames, fire", leviathan.split("--no ", 1)[1])
        self.assertIn("crimson primary phoenix armor", phoenix)
        self.assertIn("small prismatic opal insets", phoenix)
        self.assertNotIn("flames", phoenix.split("--no ", 1)[1])
        self.assertNotIn("style reference guides", kirin)

    def test_phoenix_uses_exact_omnic_reference_and_omnic_design_without_runtime_change(self):
        heading, _, prompt = pilot_prompts()[2]
        guide = (art_path("midjourney-character-style-prompt.md", root=ROOT)).read_text(encoding="utf-8")
        reference = re.search(r"^\| Enemy Evo 6 \| (https://\S+) \|$", guide, re.M).group(1)
        self.assertIn("Omnic design test", heading)
        self.assertTrue(prompt.endswith(f"--sref {reference} --sw 10"))
        self.assertIn("twelve articulated mechanical blade-feather wings", prompt)
        self.assertIn("triple interlocking gold sun crown", prompt)
        self.assertIn("at least 15 percent solid background-color margin", prompt)
        self.assertNotIn("platinum sapphire", prompt)
        production = (art_path("Awaken the Machines.md", root=ROOT)).read_text(encoding="utf-8")
        self.assertIn("eight elaborate mechanical blade-feather wings", production)
        self.assertNotIn("twelve articulated mechanical blade-feather wings", production)

    def test_rosetta_legendary_is_exact_production_prompt_plus_one_clause(self):
        heading, prompt = rosetta_pilot()
        self.assertIn("Sovereign of Passion, Rosetta", heading)
        production = (art_path("Rosetta Art.md", root=ROOT)).read_text(encoding="utf-8")
        section = production.split("### Evo.5 / Legendary", 1)[1]
        original = re.search(r"```text\n(.*?)\n```", section, re.S).group(1)
        clause = ", do not incorporate contrasting colors into the overall subject art design"
        self.assertEqual(prompt.count(clause), 1)
        self.assertEqual(prompt.replace(clause, "", 1), original)
        reference = re.search(r" --sref (https://\S+) --sw 150", section).group(1)
        self.assertTrue(prompt.endswith(f" --sref {reference} --sw 150"))
        for flag in ("ar", "niji", "s", "q", "no", "sref", "sw"):
            self.assertEqual(prompt.count("--" + flag + " "), 1)

    def test_additional_rosetta_variant_keeps_previous_test_and_locks_reference_colors(self):
        blocks = re.findall(r"```text\n(.*?)\n```", document(), re.S)
        self.assertEqual(len(blocks), 5)
        self.assertEqual(blocks[3], rosetta_pilot()[1])
        base, restricted = blocks[3:]
        clause = re.search(r"strict subject palette lock:.*?(?=, do not incorporate contrasting)", restricted).group(0)
        corrected = base.replace("fully prismatic armor", "fully faceted crimson-and-gold armor")
        corrected = corrected.replace("8 immense prismatic wings", "8 immense crimson gold and ivory wings")
        corrected = corrected.replace(
            "rose-violet sapphire-blue and warm opal chromatic facets on armor wings bow and rings",
            "ruby-red scarlet champagne-gold and ivory facets on armor wings bow and rings")
        self.assertEqual(restricted.replace(clause, palette_clause("Rosetta"), 1), corrected)
        self.assertNotRegex(restricted.split(" --ar ", 1)[0], r"sapphire|blue|violet")
        self.assertIn("ONLY Rosetta's main crimson-to-scarlet-to-deep-red", clause)
        self.assertIn("ONLY permitted exceptions are white ivory black gold and platinum", clause)
        self.assertIn("ALL colors borrowed from the style reference must be remapped", clause)
        self.assertIn("never changes the solid green key background", clause)
        self.assertTrue(restricted.endswith("--sw 150"))


if __name__ == "__main__":
    unittest.main()
