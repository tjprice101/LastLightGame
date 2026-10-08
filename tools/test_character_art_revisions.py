import unittest

from character_art_revisions import OUTPUT, revision_source


class CharacterArtRevisionTests(unittest.TestCase):
    def test_generated_revisions_match_every_installed_character_portrait(self):
        self.assertEqual(OUTPUT.read_text(encoding="utf-8"), revision_source())


if __name__ == "__main__":
    unittest.main()
