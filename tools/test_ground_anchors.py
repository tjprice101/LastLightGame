import json
import unittest

from build_ground_anchors import OUTPUT, build_manifest


class RadiantGroundAnchorsTests(unittest.TestCase):
    def test_manifest_matches_each_current_full_form_art_alpha_bound(self):
        expected = build_manifest()
        actual = json.loads(OUTPUT.read_text(encoding="utf-8"))
        self.assertEqual(actual, expected)
        self.assertEqual(actual["alphaThreshold"], 16)
        self.assertGreaterEqual(len(actual["anchors"]), 300)
        self.assertTrue(all(0 <= gap < 0.25 for gap in actual["anchors"].values()))


if __name__ == "__main__":
    unittest.main()
