from hashlib import sha256
import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image

import build_phase2_war_art as pack
from archive_phase2_war_art import archive


class Phase2WarArtTests(unittest.TestCase):
    def test_complete_reproduction_and_exact_inventory(self):
        self.assertEqual(pack.OUTPUT.read_text(encoding="utf-8"), pack.document())
        self.assertEqual(pack.SPEC.read_text(encoding="utf-8"), pack.specification())
        rows = pack.blocks()
        self.assertEqual(len(rows), 44)
        self.assertEqual(len({asset for asset, _, _ in rows}), 44)
        self.assertEqual(len(pack.source_rows()), 24)
        self.assertEqual(sum("-trial-" in asset for asset, _, _ in rows), 8)
        self.assertEqual(sum(asset.startswith("war-status-") for asset, _, _ in rows), 8)
        self.assertEqual(sum(asset.startswith("master-") for asset, _, _ in rows), 12)
        self.assertIn("5% recruitment chance", pack.SPEC.read_text(encoding="utf-8"))

    def test_all_four_identities_are_distinct_from_source_names(self):
        self.assertEqual(len(pack.DESIGNS), 4)
        names = [entry["name"] for entry in pack.DESIGNS]
        self.assertEqual(len(set(names)), 4)
        titles = [title for entry in pack.DESIGNS for title in entry["titles"]]
        self.assertEqual(len(titles), len(set(titles)))
        for entry in pack.DESIGNS:
            self.assertNotIn(entry["name"].lower(), ("maerion", "caevren", "vespera", "ilyss"))
            self.assertEqual(len(entry["forms"]), 6)
            self.assertEqual(len(entry["skills"]), 3)
            self.assertEqual(len(entry["masters"]), 3)
            self.assertEqual(len(entry["statuses"]), 2)
            self.assertNotIn(entry["trial"], titles + names)
            self.assertIn("Let", entry["lore"])
            self.assertTrue(entry["strengths"])
            self.assertTrue(entry["limits"])
            self.assertEqual(len(entry["stats"]), 7)

    def test_actual_owner_construction_and_color_in_every_object(self):
        for entry in pack.DESIGNS:
            slug = entry["slug"]
            owned = [(asset, prompt) for asset, _, prompt in pack.blocks()
                     if asset.startswith((slug + "-", "master-" + slug + "-", "war-status-" + slug + "-"))]
            self.assertEqual(len(owned), 11)
            for asset, prompt in owned:
                positive, negative = prompt.split(" --no ", 1)
                with self.subTest(asset=asset):
                    self.assertIn(entry["palette"], positive)
                    self.assertIn(entry["energy"], positive)
                    self.assertNotIn("purple effects", negative if slug in ("varkhel", "velmira") else "")
                    if "--ar 1:1" in prompt:
                        self.assertIn(entry["identity"], positive)
                        self.assertIn("object-only", positive)
                        self.assertIn("no wielder", positive)
                        self.assertIn("continuous empty15 percent border", positive)
                        self.assertIn("green key is background only", positive)
                        self.assertIn("glow on edges", negative)
                    if asset.startswith("master-"):
                        self.assertIn("cosmic mechanical sculpture", positive)
                        self.assertIn("precision gears", positive)
                        self.assertIn("articulated pistons", positive)
                    self.assertNotIn("--sref", prompt)
                    self.assertNotIn("--sw", prompt)
                    self.assertIn("--niji 6 --s 100 --q 1", prompt)
                    self.assertLessEqual(len(positive.split(" --ar")[0].split()), 380)
                    self.assertNotIn("Master Conduit", positive)

    def test_no_duplicate_portrait_requests_and_kit_names_match(self):
        prompts = pack.document()
        for entry in pack.DESIGNS:
            self.assertIn(entry["passive"][0], prompts)
            for _, name, cost, effect, _ in entry["skills"]:
                self.assertIn(name, prompts)
                self.assertIn(cost, pack.specification())
                self.assertIn(effect, pack.specification())
            for name, stats, effect, _ in entry["masters"]:
                self.assertIn(name, prompts)
                self.assertIn(stats, pack.specification())
                self.assertIn(effect, pack.specification())
        self.assertTrue(prompts.rstrip().endswith(
            "**44 new images. 24 original portrait images reused. 68 images in the complete four-character package.**"))
        self.assertNotIn("--ar 4:3", prompts)

    def test_preserved_sources_and_provenance(self):
        manifest = json.loads(pack.MANIFEST.read_text(encoding="utf-8"))
        self.assertTrue(manifest["runtime_exported"])
        self.assertTrue(manifest["root_originals_removed"])
        self.assertEqual(manifest["portrait_count"], 24)
        rows = manifest["records"]
        self.assertEqual(len({row["archive"] for row in rows}), 24)
        for row in rows:
            archived = pack.ROOT / row["archive"]
            self.assertEqual(sha256(archived.read_bytes()).hexdigest(), row["sha256"])
            original = pack.ROOT / row["original_filename"]
            if original.exists():
                self.assertEqual(original.read_bytes(), archived.read_bytes())
            with Image.open(archived) as image:
                self.assertEqual(image.size, (row["width"], row["height"]))
                self.assertEqual(image.mode, row["mode"])
        self.assertEqual({row["new_name"] for row in rows},
                         {row["new_name"] for row in pack.source_rows()})

    def test_archival_is_idempotent_and_does_not_overwrite_or_remove(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for row in pack.source_rows():
                Image.new("RGB", (8, 6), (22, 70, 120)).save(root / row["original_filename"])
            first = archive(root)
            self.assertEqual(first, archive(root))
            self.assertTrue(all((root / row["original_filename"]).exists() for row in first))
            target = root / first[0]["archive"]
            target.write_bytes(b"pre-existing different original")
            with self.assertRaisesRegex(ValueError, "Archive differs"):
                archive(root)
            self.assertEqual(target.read_bytes(), b"pre-existing different original")

    def test_missing_source_fails_before_any_archival(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            first = pack.source_rows()[0]
            Image.new("RGB", (8, 6)).save(root / first["original_filename"])
            with self.assertRaises(FileNotFoundError):
                archive(root)
            self.assertFalse((root / pack.ARCHIVE).exists())


if __name__ == "__main__":
    unittest.main()
