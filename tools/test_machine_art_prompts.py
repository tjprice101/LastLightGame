"""Machine expansion prompt contracts, not generated-image acceptance checks."""
from pathlib import Path
import re
import unittest
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
ART = art_path("Awaken the Machines.md", root=ROOT)


class MachineArtPrompts(unittest.TestCase):
    def test_exact_inventory_and_unique_runtime_ids(self):
        text = ART.read_text(encoding="utf-8")
        blocks = re.findall(r"```text\n(.*?)\n```", text, re.S)
        ids = re.findall(r"Art ID: `([^`]+)`", text)
        self.assertEqual(len(blocks), 28)
        self.assertEqual(len(ids), 28)
        self.assertEqual(len(set(ids)), 28)
        catalog = (ROOT / "src" / "content" / "conduits.ts").read_text(encoding="utf-8")
        authored = re.findall(r"id: '([^']+)'", catalog)
        self.assertEqual(set(ids[:20]), set(authored[5:]))
        self.assertEqual(ids[-2:], ["machines-banner", "machines-arena"])

    def test_cutout_renderer_keys_and_flags(self):
        blocks = re.findall(r"```text\n(.*?)\n```", ART.read_text(encoding="utf-8"), re.S)
        for index, prompt in enumerate(blocks):
            with self.subTest(index=index):
                self.assertEqual(prompt.count("--no "), 1)
                self.assertIn("--niji 6", prompt)
                self.assertIn("--q 1", prompt)
                self.assertNotIn("--style", prompt)
                self.assertNotIn("--sref", prompt)
                self.assertNotIn("--sw", prompt)
                self.assertIn("clean precise anime contours", prompt)
                self.assertIn("crisp cel shading", prompt)
                if index < 26:
                    self.assertIn("plain solid green background (#00FF00)", prompt)
                    self.assertIn("flat unlit color edge to edge through all openings", prompt)
                    self.assertIn("no glows or glowing visual effects", prompt)
                    self.assertIn("non-emissive painted highlights", prompt)
                    self.assertNotRegex(prompt.split("--ar")[0].replace("no glows or glowing visual effects", ""), r"\b(?:glow|glowing|translucent|luminous)\b")
                if index < 20:
                    self.assertIn("face-free", prompt)
                    self.assertIn("two thirds of canvas", prompt)
                    self.assertIn("--ar 1:1", prompt)

    def test_enemy_escalation_and_scorched_wasteland(self):
        blocks = re.findall(r"```text\n(.*?)\n```", ART.read_text(encoding="utf-8"), re.S)
        for index, (coverage, margin) in enumerate([(50, 25), (60, 20)] + [(70, 15)] * 4):
            prompt = blocks[20 + index]
            self.assertIn(f"spans no more than {coverage} percent", prompt)
            self.assertIn(f"at least {margin} percent solid background-color margin", prompt)
            self.assertIn("measured from the outermost ornament or effect rather than the body", prompt)
            self.assertIn("distant pulled-back view", prompt)
            self.assertIn("without removing or shortening wings equipment powers or ornamentation", prompt)
            self.assertIn("authored creature colors control", prompt)
            self.assertIn("not its palette costume or composition", prompt)
            self.assertNotIn("spread toward every corner", prompt)
            self.assertIn("only with no other facial features", prompt)
            self.assertIn("right-facing", prompt)
            self.assertIn("--ar 4:3", prompt)
            self.assertIn("nothing touches edges", prompt)
        self.assertIn("black-and-white", blocks[20])
        self.assertIn("black-and-white", blocks[21])
        self.assertIn("sixteen", blocks[25])
        for prompt in blocks[26:]:
            self.assertIn("element-scorched wasteland", prompt)
            self.assertIn("white machine", prompt)
            self.assertIn("awakening", prompt)
            self.assertIn("full-bleed", prompt)
        self.assertIn("--ar 3:1", blocks[26])
        self.assertIn("--ar 16:9", blocks[27])


if __name__ == "__main__":
    unittest.main()
