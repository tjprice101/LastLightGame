import re
import unittest

import build_oblivion_art as pack

BLOCK = re.compile(r"```text\n(.*?)\n```", re.S)


class OblivionArtTests(unittest.TestCase):
    def setUp(self):
        self.text = pack.OUTPUT.read_text(encoding="utf-8")
        self.blocks = BLOCK.findall(self.text)

    def test_document_is_reproducible(self):
        self.assertEqual(self.text, pack.document())

    def test_counts_and_aspect_ratios(self):
        self.assertEqual(len(pack.ENEMIES), 10)
        self.assertEqual(len(self.blocks), 12)
        self.assertEqual(sum("--ar 4:3" in block for block in self.blocks), 10)
        self.assertEqual(sum("--ar 3:1" in block for block in self.blocks), 1)
        self.assertEqual(sum("--ar 16:9" in block for block in self.blocks), 1)

    def test_art_ids_match_live_roster_slugs(self):
        source = (pack.ROOT / "src" / "content" / "gates-of-oblivion.ts").read_text(encoding="utf-8")
        live = re.findall(r"id: 'oblivion:([a-z-]+)'", source)
        self.assertEqual(sorted(live), sorted(enemy[0] for enemy in pack.ENEMIES))
        for art_id in live + ["oblivion-banner", "oblivion-arena"]:
            self.assertIn(f"Art ID: `{art_id}`.", self.text)

    def test_floor_labels_follow_live_stage_assignment(self):
        self.assertIn("### Shardling Acolyte / floors 1-3 / Infernic", self.text)
        self.assertIn("### Fracture Hound / floors 9-11 (boss floor 10) / Chaotic", self.text)
        self.assertIn("### Fatebreaker Warden / floors 23-24 / Chaotic", self.text)
        self.assertIn("### Gatekeeper of Oblivion / floor 25 (final boss) / Oceanic", self.text)

    def test_all_prompts_are_reference_free(self):
        for block in self.blocks:
            self.assertNotIn("--sref", block)
            self.assertNotIn("--sw", block)

    def test_enemy_cutouts_keep_solid_backgrounds_and_clearance(self):
        for block in self.blocks[:10]:
            positive = block.split("--ar")[0]
            self.assertIn("plain solid green background (#00FF00)", positive)
            self.assertIn("completely solid single uniform background color", positive)
            self.assertIn("flat unlit color edge to edge and through all openings", positive)
            self.assertIn("nothing touches edges", positive)
            self.assertRegex(positive, r"no more than (50|55|60|65|70) percent")
            self.assertRegex(positive, r"at least (15|17|20|22|25) percent solid background-color margin")
            self.assertIn("no glows", positive)
            self.assertNotIn("full-bleed", positive)

    def test_names_never_appear_in_image_prose(self):
        for (_, name, *_), block in zip(pack.ENEMIES, self.blocks):
            self.assertNotIn(name.lower(), block.lower())
        for block in self.blocks:
            self.assertNotIn("Oblivion", block)

    def test_scenery_is_full_bleed(self):
        for block in self.blocks[10:]:
            self.assertIn("full-bleed", block)
            self.assertNotIn("#00FF00", block)


if __name__ == "__main__":
    unittest.main()
