import unittest

from build_future_story_art import REGIONS, OUTPUT, blocks, document


class FutureStoryArtTests(unittest.TestCase):
    def test_exact_complete_pack_and_reproduction(self):
        self.assertEqual(len(REGIONS), 11)
        self.assertEqual(len(blocks()), 75)
        self.assertEqual(len({entry[0] for entry in blocks()}), 75)
        self.assertEqual(OUTPUT.read_text(encoding="utf-8"), document())

    def test_all_cutouts_are_unique_contained_and_reference_free(self):
        cutouts = [row for row in blocks() if "--ar 4:3" in row[2]]
        self.assertEqual(len(cutouts), 55)
        self.assertEqual(len({row[2] for row in cutouts}), 55)
        for filename, _, prompt in blocks():
            with self.subTest(filename=filename):
                self.assertNotIn("--sref", prompt)
                self.assertNotIn("--sw", prompt)
                self.assertIn("sharp", prompt)
                if "--ar 4:3" in prompt:
                    self.assertIn("15 percent", prompt)
                    self.assertIn("central 70 percent", prompt)
                    self.assertIn("facing right", prompt)
                    self.assertIn("#00FF00", prompt)
                    self.assertIn("all empty gaps", prompt)
                else:
                    self.assertNotIn("#00FF00", prompt)
                    self.assertIn("full-bleed", prompt.lower())

    def test_proposal_and_creator_boundaries_are_explicit(self):
        text = document()
        self.assertIn("DRAFT FOR OWNER APPROVAL", text)
        self.assertIn("No Rise/Let portrait", text)
        for name, _, _ in blocks():
            self.assertNotIn("rise-portrait", name)
            self.assertNotIn("let-portrait", name)

    def test_nyrasma_machines_are_black_readable_and_ominous(self):
        machines = [row for row in blocks() if row[0].startswith("chapter-2-") and "--ar 4:3" in row[2]]
        self.assertEqual(len(machines), 25)
        for filename, _, prompt in machines:
            with self.subTest(filename=filename):
                self.assertIn("predominantly black", prompt)
                self.assertIn("Ominous imposing machine", prompt)
                self.assertIn("no large bright colored panels", prompt)
                self.assertIn("crisp edge highlights", prompt)
                self.assertNotIn("ivory", prompt)


if __name__ == "__main__":
    unittest.main()
