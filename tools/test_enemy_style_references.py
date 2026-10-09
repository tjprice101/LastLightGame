"""Reference-free enemies, historical URLs and shared silhouette contracts."""
from pathlib import Path
import re
import unittest
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "Art"
BLOCK = re.compile(r"```(?:text)?\n(.*?)\n```", re.S)
SIX_FORM_PACKS = (
    "Awaken the Machines.md", "Crownfall Treasury.md",
    "Rosethorn Sanctuary.md", "Passion of Crimson Roses.md",
    r"gamemodes\Soar to Heaven.md", r"gamemodes\Delve into the Abyss.md",
)


class EnemyStyleReferenceTests(unittest.TestCase):
    def test_six_form_enemy_references_match_exact_owner_urls(self):
        guide = (art_path("midjourney-character-style-prompt.md", root=ROOT)).read_text(encoding="utf-8")
        references = {int(stage): url for stage, url in re.findall(
            r"^\| Enemy Evo ([1-6]) \| (https://\S+) \|$", guide, re.M)}
        expected = (
            ("1557769894110560307", "60011", "987", "cc07e201ecc260aedc39bc59eb1159f063ec34844e73e5bdb8cfb954140d66b1"),
            ("1557769891648508094", "60012", "935", "195a759e5ded4ee0961545bf305842796e5a852f2cb01d13928b3904a3418d87"),
            ("1557769893485477899", "60013", "989", "c591e1e43764c13c32f4fa5fa6f0388148af21f80f98b7e13ab32d5370318d86"),
            ("1557769893091221564", "60014", "1084", "c1c22c7eb09b473a816e5e0fcb0153060e7bca15b35b5694a1546aa1f26ba57d"),
            ("1557769892646756553", "60015", "1097", "605ee13d3deb83177cf6c6a5837b1bfdd80973637542bcb2f83f3cb24b9fe89e"),
            ("1557769892206346280", "60016", "1148", "3fe66f34ed63fa6103c5c04a10a8f9292342deadae465f8ee98a31d994028d7c"),
        )
        self.assertEqual(set(references), set(range(1, 7)))
        for stage, (attachment, unit, width, signature) in enumerate(expected, 1):
            with self.subTest(stage=stage):
                self.assertEqual(references[stage], (
                    "https://media.discordapp.net/attachments/1006667219217952879/"
                    f"{attachment}/Unit_ills_full_{unit}.webp?ex=6ac901c4"
                    f"&is=6ac7b044&hm={signature}&=&format=webp&width={width}&height=778"))
        self.assertEqual(len(set(references.values())), 6)

    def test_all_enemy_lineups_are_reference_free(self):
        paths = {art_path(name, root=ROOT): 6 for name in SIX_FORM_PACKS}
        dungeons = sorted((art_path("dungeons", root=ROOT)).glob("*.md"))
        self.assertEqual(len([p for p in dungeons if p.name != "README.md"]), 10)
        paths.update({path: 8 for path in dungeons if path.name != "README.md"})
        paths[art_path("Flaming Depths.md", root=ROOT)] = 10
        paths[art_path("Starter Art.md", root=ROOT)] = 3
        total = 0
        for path, expected_count in paths.items():
            bodies = [body for body in BLOCK.findall(path.read_text(encoding="utf-8"))
                      if "--niji" in body and "--ar 4:3" in body]
            if path.name == "Starter Art.md":
                bodies = bodies[3:]
            self.assertEqual(len(bodies), expected_count)
            for index, body in enumerate(bodies):
                with self.subTest(file=str(path.relative_to(ROOT)), block=index + 1):
                    self.assertNotIn("--sref", body)
                    self.assertNotIn("--sw", body)
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
                    for flag in ("ar", "niji", "s", "q", "no"):
                        self.assertEqual(len(re.findall(rf"--{flag}\s", body)), 1)
                    self.assertIn(body.count("--sref "), (0, 1))
                    self.assertEqual(body.count("--sw "), body.count("--sref "))
                    count += 1
        self.assertEqual(count, 249)

    def test_non_unit_generation_blocks_do_not_receive_enemy_references(self):
        for path in ART.rglob("*.md"):
            for body in BLOCK.findall(path.read_text(encoding="utf-8")):
                if "--niji" in body and "--ar 4:3" not in body:
                    with self.subTest(file=str(path.relative_to(ROOT))):
                        self.assertNotIn("--sref ", body)
                        self.assertNotIn("--sw ", body)


if __name__ == "__main__":
    unittest.main()
