"""Validate the exact pending Calamitic queue without touching runtime content."""
import re
import unittest
from unittest.mock import Mock, patch

from build_calamitic_art import (
    DESIGNS, STATUSES, MATERIALS, CONDUITS, PALETTE, PALETTE_LOCK, MARGINS,
    outputs, references, write_preserving_endings,
)

BLOCK = re.compile(r"```text\n(.*?)\n```", re.S)


class CalamiticArtTests(unittest.TestCase):
    def test_shared_global_prompt_rules_add_no_failures(self):
        import test_art_prompts

        entries = list(test_art_prompts.prompts())
        new_paths = set(outputs())
        baseline = [entry for entry in entries if entry[0] not in new_paths]
        names = ("test_cutout_rules_and_destination_ratios_are_preserved",
                 "test_every_prompt_retains_shared_rendering_and_valid_single_flags")

        def failures_for(selected):
            result = unittest.TestResult()
            with patch.object(test_art_prompts, "prompts", lambda: iter(selected)):
                for name in names:
                    test_art_prompts.ArtPromptTests(name).run(result)
            self.assertFalse(result.errors)
            return {str(test) for test, _ in result.failures}

        # Historical packs have known failures; this queue must add none.
        self.assertEqual(failures_for(entries), failures_for(baseline))

    def test_regeneration_preserves_existing_line_endings(self):
        for newline in (b"\n", b"\r\n"):
            path = Mock()
            path.exists.return_value = True
            path.read_bytes.return_value = b"original" + newline
            write_preserving_endings(path, "updated\nsecond line\n")
            path.write_bytes.assert_called_once_with(b"updated" + newline + b"second line" + newline)

    def test_generated_packs_match_reproducible_sources(self):
        generated = outputs()
        self.assertEqual([len(BLOCK.findall(text)) for text in generated.values()], [33, 10, 1, 9, 9])
        for path, expected in generated.items():
            self.assertEqual(path.read_text(encoding="utf-8"), expected, path.name)
            self.assertIn("All artwork pending owner delivery", expected)
            blocks = BLOCK.findall(expected)
            self.assertEqual(expected.count("Target runtime asset ID:"), len(blocks))
            self.assertEqual(expected.count("Target export:"), len(blocks))
            self.assertEqual(expected.count("Filename:"), len(blocks))

    def test_complete_roster_titles_abilities_and_materials(self):
        self.assertEqual([d["name"] for d in DESIGNS], ["Ozriel", "Ilvaris", "Kaelith"])
        self.assertEqual([d["gender"] for d in DESIGNS], ["male", "female", "female"])
        self.assertEqual([d["element"] for d in DESIGNS], ["Tranquilitic", "Atmospheric", "Chaotic"])
        self.assertEqual([d["role"] for d in DESIGNS], ["Tank", "Support", "Attacker"])
        text = next(iter(outputs().values()))
        for design in DESIGNS:
            for title in design["titles"]:
                self.assertIn(f"{title}, {design['name']}", text)
            for _, name, _ in design["icons"]:
                self.assertIn(name, text)
            for action in ("passive", "skill1", "skill2", "ultimate"):
                self.assertIn(f"`{design['id']}-{action}`", text)
            for evolution in range(1, 7):
                asset = design["id"] if evolution == 1 else f"{design['id']}-evo-{evolution}"
                self.assertIn(f"`{asset}`", text)
        self.assertEqual(len(STATUSES), 3)
        self.assertEqual(len(MATERIALS), 10)
        self.assertEqual(len(CONDUITS), 9)
        ids = re.findall(r"Target runtime asset ID: `([^`]+)`", "\n".join(outputs().values()))
        self.assertEqual(len(ids), len(set(ids)))
        for name, _, _ in MATERIALS:
            self.assertIn(name, "\n".join(outputs().values()))
        for name, _ in CONDUITS:
            self.assertIn(name, "\n".join(outputs().values()))

    def test_exact_evolution_references_and_one_flag_each(self):
        refs = references()
        self.assertEqual(set(refs), set(range(7)))
        counts = [0, 0]
        for text in outputs().values():
            for prompt in BLOCK.findall(text):
                portrait = "--ar 4:3" in prompt
                for flag in ("ar", "niji", "s", "q", "no"):
                    self.assertEqual(len(re.findall(rf"--{flag}(?=\s)", prompt)), 1)
                for flag in ("sref", "sw"):
                    self.assertEqual(len(re.findall(rf"--{flag}(?=\s)", prompt)), int(portrait))
                self.assertIn("--niji 6 --s 100 --q 1", prompt)
                if portrait:
                    stage = counts[0] % 6 + 1
                    self.assertTrue(prompt.endswith(f" --sref {refs[stage]} --sw 400"))
                    counts[0] += 1
                else:
                    self.assertIn("--ar 1:1", prompt)
                    self.assertNotIn("--sref", prompt)
                    self.assertNotIn("--sw", prompt)
                    counts[1] += 1
        self.assertEqual(counts, [18, 44])

    def test_compact_palette_key_quality_and_safety(self):
        for text in outputs().values():
            for prompt in BLOCK.findall(text):
                positive = prompt.split(" --ar", 1)[0]
                negatives = prompt.split(" --no ", 1)[1].split(" --sref", 1)[0].split(", ")
                design = positive.split(", plain solid", 1)[0]
                self.assertEqual(positive.count(PALETTE_LOCK), 1)
                for color in PALETTE[1].split(", "):
                    self.assertNotRegex(design, rf"\b{color}\b")
                    if color != "green":
                        self.assertIn(color, negatives)
                self.assertNotIn("green", negatives)
                for phrase in ("plain solid green background (#00FF00)", "flat unlit color edge to edge and through all openings",
                               "subject colors unchanged", "no glows or glowing visual effects", "non-emissive painted highlights",
                               "sharp clean lineart", "percent empty margin on every side"):
                    self.assertIn(phrase, positive)
                for word in ("aura", "backsplash", "blur", "smudged", "glow", "light bloom", "background gradient"):
                    self.assertIn(word, negatives)
                # Owner (D-440): prompts must stay short.
                self.assertLessEqual(len(positive.split()), 230)
                self.assertNotRegex(design.replace("no glows or glowing visual effects", "").replace("non-emissive", ""),
                                    r"\b(?:glow|glowing|luminous|translucent|emissive)\b")
                self.assertNotRegex(design.lower(), r"\b(?:blood|gore|nude|naked|sexy|bust|breastplate|child|injury|wound)\b")

    def test_portrait_architecture_anatomy_and_names_outside_prose(self):
        portraits = [p for p in BLOCK.findall(next(iter(outputs().values()))) if "--sref" in p]
        for design, prompts in zip(DESIGNS, (portraits[:6], portraits[6:12], portraits[12:])):
            for index, prompt in enumerate(prompts):
                positive = prompt.split(" --ar", 1)[0]
                self.assertTrue(positive.startswith(f"zoomed-out full-body view, small centered character, {MARGINS[index]} percent"))
                self.assertGreaterEqual(MARGINS[index], 15)
                for phrase in (design["weapon"], design["armor"], "2.5-3 heads tall", "never pearls or rock",
                               "nothing behind it", "eyes only"):
                    self.assertIn(phrase, positive)
                body = "one third" if index < 3 else "one quarter" if index == 3 else "one fifth"
                self.assertIn(f"body {body} of canvas height", positive)
                for name in [design["name"], *design["titles"]]:
                    self.assertNotIn(name.lower(), positive.lower())
                for word in ("pearls", "orbs", "rocks", "lumpy armor"):
                    self.assertIn(word, prompt.split(" --no ", 1)[1])
                if index >= 3:
                    for phrase in ("wings", "crimson", "lattice"):
                        self.assertIn(phrase, positive)
                if index >= 4:
                    self.assertIn("retain", positive)
        for prompt in BLOCK.findall("\n".join(outputs().values())):
            if "--ar 1:1" in prompt:
                self.assertIn("object-only emblem with no people", prompt)
                self.assertIn("15 percent empty margin on every side", prompt)
                self.assertNotIn("chibi anime", prompt)
                for word in ("person", "figure", "chibi"):
                    self.assertIn(word, prompt.split(" --no ", 1)[1])


if __name__ == "__main__":
    unittest.main()
