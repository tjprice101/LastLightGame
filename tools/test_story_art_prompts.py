"""Story prompt coverage and generation contracts; pixel review remains separate."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parent.parent
PACKS = ROOT / "Art" / "creatures" / "story"
BLOCK = re.compile(r"```text\n(.*?)\n```", re.S)
REGIONS = (
    ("infernic", "Emberwake March"),
    ("oceanic", "Glasswater Reach"),
    ("atmospheric", "Stormspan Heights"),
    ("botanic", "Rootstone Wilds"),
    ("tranquilitic", "Stillhalo Vale"),
    ("chaotic", "Riftbound Frontier"),
)


class StoryArtPromptTests(unittest.TestCase):
    def test_complete_runtime_region_and_creature_coverage(self):
        source = (ROOT / "src" / "content" / "story.ts").read_text(encoding="utf-8")
        records = re.findall(
            r"element: '([^']+)', name: '([^']+)'.*?enemies: \[(.*?)\], boss: '([^']+)'",
            source, re.S,
        )
        self.assertEqual([(element, name) for element, name, _, _ in records], list(REGIONS))
        for element, name, enemies, boss in records:
            text = (PACKS / f"{name}.md").read_text(encoding="utf-8")
            names = re.findall(r"'([^']+)'", enemies) + [boss]
            self.assertEqual(len(names), 5)
            self.assertEqual(len(BLOCK.findall(text)), 6)
            for index, creature in enumerate(names):
                with self.subTest(region=name, creature=creature):
                    self.assertIn(creature, text)
                    self.assertIn(f"story:{element}:{index if index < 4 else 'boss'}", text)
            self.assertIn("pending", text.lower())

    def test_all_prompts_have_single_reference_free_renderer_flags(self):
        paths = [PACKS / f"{name}.md" for _, name in REGIONS]
        paths.append(ROOT / "Art" / "ui" / "Story World Map.md")
        count = 0
        for path in paths:
            for body in BLOCK.findall(path.read_text(encoding="utf-8")):
                count += 1
                with self.subTest(file=path.name, prompt=count):
                    for flag in ("ar", "niji", "s", "q", "no"):
                        self.assertEqual(len(re.findall(rf"--{flag}\s", body)), 1)
                    for text in ("--niji 6", "--s 100", "--q 1", "contours",
                                 "cel shading", "painted highlights", "jewel-like"):
                        self.assertIn(text, body)
                    self.assertNotRegex(body, r"--(?:sref|sw|style)\s")
                    self.assertLessEqual(len(body.split()), 450)
                    self.assertIn("photorealism", body.split(" --no ", 1)[1])
                    self.assertIn("3d render", body.split(" --no ", 1)[1])
        self.assertEqual(count, 37)

    def test_cutouts_keep_keys_palettes_no_glow_and_complete_silhouettes(self):
        for _, name in REGIONS:
            bodies = BLOCK.findall((PACKS / f"{name}.md").read_text(encoding="utf-8"))
            for body in bodies[:5]:
                with self.subTest(region=name, prompt=body[:80]):
                    positive, negatives = body.split(" --no ", 1)
                    self.assertIn("--ar 4:3", positive)
                    for anchor in ("chibi", "margin", "plain solid ",
                                   "flat unlit color edge to edge and through all openings",
                                   "subject colors unchanged", "no glows or glowing visual effects",
                                   "non-emissive painted highlights"):
                        self.assertIn(anchor, positive)
                    self.assertRegex(positive.lower(), r"palette")
                    self.assertRegex(positive.lower(), r"nothing touches|nothing touching")
                    key = re.search(r"plain solid (\w+) background", positive).group(1)
                    self.assertNotIn(key, [entry.strip() for entry in negatives.split(",")])
                    for text in ("glow", "light bloom", "background gradient", "textured background"):
                        self.assertIn(text, negatives)

    def test_arenas_match_side_view_standing_lanes_not_map_framing(self):
        for _, name in REGIONS:
            body = BLOCK.findall((PACKS / f"{name}.md").read_text(encoding="utf-8"))[-1]
            positive, negatives = body.split(" --no ", 1)
            with self.subTest(region=name):
                for text in ("--ar 16:9", "side-view", "left", "right", "full-bleed"):
                    self.assertIn(text, positive)
                self.assertRegex(positive, r"same (?:ground )?height|equal.height")
                self.assertNotIn("plain solid ", positive)
                self.assertNotIn("no glows", positive)
                for text in ("characters", "monsters", "text", "interface"):
                    self.assertIn(text, negatives)

    def test_map_keeps_six_ordered_terrains_and_overlay_only_controls(self):
        text = (ROOT / "Art" / "ui" / "Story World Map.md").read_text(encoding="utf-8")
        bodies = BLOCK.findall(text)
        self.assertEqual(len(bodies), 1)
        body = bodies[0]
        self.assertIn("--ar 16:9", body)
        self.assertIn("full-bleed", body)
        self.assertIn("overhead", body)
        self.assertNotIn("plain solid ", body)
        positions = [body.index(word) for word in
                     ("cinder march", "glasswater coast", "stormspan heights",
                      "rootstone wilderness", "stillhalo vale", "riftbound frontier")]
        self.assertEqual(positions, sorted(positions))
        self.assertIn("150 miniature nodes", text)
        self.assertIn("accessible HTML", text)
        self.assertIn("stage nodes", body.split(" --no ", 1)[1])
        self.assertIn("do **not** background-remove", text)


if __name__ == "__main__":
    unittest.main()
