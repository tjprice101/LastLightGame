import unittest

from conduit_cleanup_review import CHANGED_NOTES, NO_CHANGE_NOTES, ROOT, review_document, verify_review


class ConduitCleanupReviewTests(unittest.TestCase):
    def test_all_installed_icons_have_reproducible_manual_review_records(self):
        verify_review()
        review = review_document()
        self.assertEqual(review["asset_count"], 60)
        self.assertEqual(review["changed_count"], 5)
        self.assertEqual(review["undelivered_kit_icon_count"], 25)
        records = {record["asset"]: record for record in review["assets"]}
        self.assertEqual(set(records), set(CHANGED_NOTES) | set(NO_CHANGE_NOTES))
        for asset_id, record in records.items():
            with self.subTest(asset=asset_id):
                self.assertEqual(len(record["source_sha256"]), 64)
                self.assertEqual(len(record["before_sha256"]), 64)
                self.assertEqual(len(record["after_sha256"]), 64)
                self.assertEqual(record["manual_review"]["source"], "full-resolution original")
                self.assertEqual(record["manual_review"]["runtime_backgrounds"], ["dark", "light"])
                self.assertTrue(record["manual_review"]["magnified_candidates"])
                if asset_id in CHANGED_NOTES:
                    self.assertEqual(record["verdict"], "corrected")
                    self.assertNotEqual(record["before_sha256"], record["after_sha256"])
                    previous = ROOT / record["previous_runtime"].replace("\\", "/")
                    self.assertTrue(previous.is_file())
                    self.assertEqual(record["previous_runtime_sha256"], record["before_sha256"])
                else:
                    self.assertEqual(record["verdict"], "no-change")
                    self.assertIsNone(record["previous_runtime"])


if __name__ == "__main__":
    unittest.main()
