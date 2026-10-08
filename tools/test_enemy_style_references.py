"""Enemy reference mapping and shared complete-silhouette contracts."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "Art"
BLOCK = re.compile(r"```(?:text)?\n(.*?)\n```", re.S)
SIX_FORM_PACKS = (
    "Awaken the Machines.md", "Crownfall Treasury.md",
    "Rosethorn Sanctuary.md", "Passion of Crimson Roses.md",
    r"gamemodes\Soar to Heaven.md", r"gamemodes\Delve into the Abyss.md",
)
MAPPING = {
    3: (1, 1, 1),
    6: (1, 2, 3, 4, 5, 6),
    8: (1, 2, 2, 3, 4, 5, 5, 6),
    10: (1, 2, 2, 3, 3, 4, 4, 5, 5, 6),
}


class EnemyStyleReferenceTests(unittest.TestCase):
    def test_all_enemy_lineups_have_exact_mapped_suffixes(self):
        guide = (ART / "midjourney-character-style-prompt.md").read_text(encoding="utf-8")
        references = {int(stage): url for stage, url in re.findall(
            r"^\| ([0-6]) \| (https://\S+) \|$", guide, re.M)}
        paths = {ART / name: 6 for name in SIX_FORM_PACKS}
        dungeons = sorted((ART / "dungeons").glob("*.md"))
        self.assertEqual(len([p for p in dungeons if p.name != "README.md"]), 10)
        paths.update({path: 8 for path in dungeons if path.name != "README.md"})
        paths[ART / "Flaming Depths.md"] = 10
        paths[ART / "Starter Art.md"] = 3
        total = 0
        for path, expected_count in paths.items():
            bodies = [body for body in BLOCK.findall(path.read_text(encoding="utf-8"))
                      if "--niji" in body and "--ar 4:3" in body]
            if path.name == "Starter Art.md":
                bodies = bodies[3:]
            self.assertEqual(len(bodies), expected_count)
            for index, (body, stage) in enumerate(zip(bodies, MAPPING[expected_count])):
                with self.subTest(file=str(path.relative_to(ROOT)), block=index + 1):
                    self.assertTrue(body.endswith(
                        f" --sref {references[stage]} --sw 400"))
                    self.assertEqual(body.count("--sref "), 1)
                    self.assertEqual(body.count("--sw "), 1)
                    total += 1
        self.assertEqual(total, 129)

    def test_all_character_and_enemy_full_body_prompts_stay_inside_edges(self):
        count = 0
        for path in ART.rglob("*.md"):
            for index, body in enumerate(BLOCK.findall(path.read_text(encoding="utf-8"))):
                if "--niji" not in body or "--ar 4:3" not in body:
                    continue
                with self.subTest(file=str(path.relative_to(ROOT)), block=index + 1):
                    positive = body.split(" --", 1)[0]
                    self.assertRegex(positive, r"nothing touches (?:or crosses )?(?:the )?(?:frame )?edges")
                    self.assertRegex(positive, r"margin|padding")
                    self.assertNotIn("full-bleed", positive)
                    for flag in ("ar", "niji", "s", "q", "no", "sref", "sw"):
                        self.assertEqual(len(re.findall(rf"--{flag}\s", body)), 1)
                    count += 1
        self.assertEqual(count, 244)

    def test_non_unit_generation_blocks_do_not_receive_enemy_references(self):
        for path in ART.rglob("*.md"):
            for body in BLOCK.findall(path.read_text(encoding="utf-8")):
                if "--niji" in body and "--ar 4:3" not in body:
                    with self.subTest(file=str(path.relative_to(ROOT))):
                        self.assertNotIn("--sref ", body)
                        self.assertNotIn("--sw ", body)


if __name__ == "__main__":
    unittest.main()
