from pathlib import Path
import re
import unittest
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent


class ComponentArtPromptTests(unittest.TestCase):
    def test_shattered_omnic_currency_has_one_renderer_compliant_cutout_prompt(self):
        text = (art_path("Broken Mechanical Components.md", root=ROOT)).read_text(encoding="utf-8")
        blocks = re.findall(r"```text\n(.*?)\n```", text, re.S)
        self.assertEqual(len(blocks), 1)
        prompt = blocks[0]
        for required in ("shattered Omnic-tier machinery", "face-free", "ivory and platinum",
                         "splintered opal", "Thornia and Crinso", "clean precise anime contours",
                         "crisp cel shading", "non-emissive painted highlights", "two thirds",
                         "no glows or glowing visual effects", "plain solid green background (#00FF00)",
                         "flat unlit color edge to edge and through all openings",
                         "subject colors unchanged", "--ar 1:1", "--niji 6", "--s 100", "--q 1",
                         "background gradient", "textured background", "photorealism", "3d render"):
            self.assertIn(required, prompt)
        self.assertEqual(prompt.count("--no "), 1)
        self.assertNotIn("--sref", prompt)
        self.assertNotRegex(prompt.split("--ar")[0].replace("no glows or glowing visual effects", ""),
                            r"\b(?:glow|glowing|translucent|luminous)\b")
        self.assertIn("Art ID: `mechanical-components`", text)
        self.assertIn("Supplied artwork intake (D-137)", text)
        self.assertTrue((ROOT / "public" / "assets" / "currencies" / "mechanical-components.png").exists())


if __name__ == "__main__":
    unittest.main()
