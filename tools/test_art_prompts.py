"""Regression checks for copy-ready prompts; output still needs visual review."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parent.parent
BLOCK = re.compile(r"```(?:text)?\n(.*?)\n```", re.S)


def prompts():
    for path in sorted((ROOT / "Art").rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        for index, body in enumerate(BLOCK.findall(text), 1):
            if "--niji" in body:
                yield path, index, body


class ArtPromptTests(unittest.TestCase):
    def test_every_prompt_retains_shared_rendering_and_valid_single_flags(self):
        entries = list(prompts())
        self.assertGreaterEqual(len(entries), 259)
        for path, index, body in entries:
            with self.subTest(file=str(path.relative_to(ROOT)), block=index):
                positive = body.split(" --", 1)[0]
                for anchor in ("contours", "cel shading", "painted highlights", "jewel-like"):
                    self.assertIn(anchor, positive)
                self.assertNotRegex(positive, r"\b(?:cinematic|splotchy|ink.paint|broken brush)\b")
                for flag in ("--ar", "--niji", "--s", "--q", "--no"):
                    self.assertEqual(len(re.findall(re.escape(flag) + r"\s", body)), 1)
                self.assertIn("--niji 6", body)
                self.assertIn("--s 100", body)
                self.assertIn("--q 1", body)
                self.assertNotIn("--style ", body)
                negatives = body.split("--no ", 1)[1].split(" --", 1)[0]
                self.assertIn("photorealism", negatives)
                self.assertIn("3d render", negatives)
                contract = path.read_text(encoding="utf-8")
                if path.parent.name in ("dungeons", "gamemodes"):
                    contract += (path.parent / "README.md").read_text(encoding="utf-8")
                self.assertTrue("--sref" in contract, "Missing approved style-reference instructions.")

    def test_cutout_rules_and_destination_ratios_are_preserved(self):
        for path, index, body in prompts():
            with self.subTest(file=str(path.relative_to(ROOT)), block=index):
                ratio = re.search(r"--ar (\S+)", body).group(1)
                self.assertIn(ratio, ("4:3", "1:1", "3:2", "3:1", "16:9"))
                positive = body.split(" --", 1)[0]
                if ratio in ("3:1", "16:9"):
                    self.assertIn("full-bleed", positive)
                    continue
                self.assertIn("plain solid ", positive)
                self.assertIn("flat unlit color edge to edge and through all openings", positive)
                self.assertIn("subject colors unchanged", positive)
                self.assertIn("no glows or glowing visual effects", positive)
                self.assertIn("non-emissive painted highlights", positive)
                self.assertRegex(positive, r"margin|padding")
                self.assertRegex(positive, r"chibi|oversized.{0,30}head")
                self.assertNotIn("white gap", positive)
                for exclusion in ("background gradient", "textured background", "glow", "light bloom"):
                    self.assertIn(exclusion, body.split("--no ", 1)[1])
                if "full-body" in positive:
                    self.assertEqual(ratio, "4:3")
                if "item icon" in positive or "currency icon" in positive:
                    self.assertEqual(ratio, "1:1")

    def test_heaven_and_abyss_keep_distinct_species_palettes_and_escalation(self):
        for filename, identity, colors, weapon in (
            ("Soar to Heaven.md", "Dawnthorn Slime", ("white", "scarlet", "gold"), "halberd"),
            ("Delve into the Abyss.md", "Wraththorn Slime", ("black", "purple", "pink"), "cleaver"),
        ):
            path = ROOT / "Art" / "gamemodes" / filename
            bodies = [body for body in BLOCK.findall(path.read_text(encoding="utf-8")) if "--niji" in body]
            self.assertEqual(len(bodies), 11)
            for index, body in enumerate(bodies[:6]):
                with self.subTest(mode=filename, form=index + 1):
                    positive = body.split(" --", 1)[0]
                    self.assertIn(identity, positive)
                    self.assertIn("facing right", positive)
                    self.assertIn("one third", positive)
                    self.assertIn("chibi", positive)
                    for color in colors:
                        self.assertIn(color, positive)
                    if index == 0:
                        self.assertIn("limbs", body.split("--no ", 1)[1])
                    else:
                        self.assertIn("2.5", positive)
            self.assertIn(weapon, bodies[5])
            self.assertIn("wings", bodies[5])
            self.assertRegex(bodies[5], r"crown|halo")
        abyss = (ROOT / "Art" / "gamemodes" / "Delve into the Abyss.md").read_text(encoding="utf-8")
        self.assertIn("opaque painted glass facets", abyss)
        self.assertNotIn("two transparent amethyst", abyss)

    def test_currency_identities_remain_unique_objects(self):
        path = ROOT / "Art" / "Currencies.md"
        bodies = [body for body in BLOCK.findall(path.read_text(encoding="utf-8")) if "--niji" in body]
        self.assertEqual(len(bodies), 2)
        self.assertIn("one Fractalis thick polished silver coin", bodies[0])
        self.assertIn("prismatic crystal residue", bodies[0])
        self.assertIn("one Lycalis sculptural glass rose", bodies[1])
        self.assertIn("single prominent chromatic thorn protruding", bodies[1])
        self.assertIn("opaque painted crystal facets", bodies[1])
        for body in bodies:
            self.assertIn("--ar 1:1", body)
            self.assertIn("roughly two thirds", body)


if __name__ == "__main__":
    unittest.main()
