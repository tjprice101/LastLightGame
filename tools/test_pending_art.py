import re
import unittest

from build_pending_art import (
    ARENAS, BOSSES, CHESTS, STATUSES, CALAMITY_PATH, NATIVE_PATH,
    calamity_document, native_document,
)


class PendingArtTests(unittest.TestCase):
    def test_exact_reproduction(self):
        self.assertEqual(CALAMITY_PATH.read_text(encoding="utf-8"), calamity_document())
        self.assertEqual(NATIVE_PATH.read_text(encoding="utf-8"), native_document())

    def test_complete_scope_and_unique_filenames(self):
        self.assertEqual(len(BOSSES), 12)
        self.assertEqual(len(CHESTS), 3)
        self.assertEqual(len(ARENAS), 3)
        self.assertEqual(len(STATUSES), 27)
        source = (CALAMITY_PATH.parents[2] / "src" / "content" / "calamity.ts").read_text(encoding="utf-8")
        for activity, boss, _, _ in BOSSES:
            self.assertIn(f"id: '{activity}'", source)
            self.assertIn(f"boss: '{boss}'", source)
        text = calamity_document() + native_document()
        names = re.findall(r"Filename: `([^`]+)`", text)
        self.assertEqual(len(names), 45)
        self.assertEqual(len(set(names)), 45)

    def test_cutout_and_scenery_contracts(self):
        blocks = re.findall(r"```text\n(.*?)\n```", calamity_document() + native_document(), re.S)
        self.assertEqual(len(blocks), 45)
        for prompt in blocks:
            self.assertNotIn("--sref", prompt)
            self.assertNotIn("--sw", prompt)
            self.assertEqual(prompt.count("--no "), 1)
            self.assertLess(len(prompt.split(" --ar ")[0].split()), 300)
            if "--ar 16:9" in prompt:
                self.assertIn("full-bleed", prompt)
                self.assertIn("open left and right", prompt)
                self.assertNotIn("plain solid", prompt)
            else:
                self.assertIn("non-emissive painted highlights", prompt)
                self.assertIn("continuous clear safety margin", prompt)
                self.assertIn("nothing touches or crosses", prompt)
                key = re.search(r"plain solid (\w+) background", prompt).group(1)
                negatives = [word.strip() for word in prompt.split("--no ")[1].split(",")]
                self.assertNotIn(key, negatives)

    def test_every_native_symbol_has_an_ability_picture_frame_not_a_trophy(self):
        blocks = re.findall(r"```text\n(.*?)\n```", native_document(), re.S)
        self.assertEqual(len(blocks), 27)
        for (_, _, _, design), prompt in zip(STATUSES, blocks):
            with self.subTest(design=design):
                self.assertIn(design, prompt)
                positive, negative = prompt.split("--no ")
                self.assertIn("square ornamental ability-icon picture frame viewed straight on", positive)
                self.assertIn("continuous beveled rim surrounding a recessed opaque inset panel", positive)
                self.assertIn("subdued frame and inset in the same character palette", positive)
                self.assertIn("dominant unobscured symbol", prompt)
                self.assertIn("fully contained within the inner opening", positive)
                for word in ("trophy", "pedestal", "plinth", "award", "crest"):
                    self.assertNotIn(word, positive)
                for word in ("trophy", "pedestal", "plinth", "supporting base"):
                    self.assertIn(word, negative)
                self.assertNotIn("card border", negative)
                self.assertIn("plain solid", prompt)


if __name__ == "__main__":
    unittest.main()
