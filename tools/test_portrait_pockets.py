"""Regression pixels and conflict-safe reviewed portrait correction installs."""

from copy import deepcopy
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from PIL import Image, ImageDraw

import intake_character_refresh as characters
import intake_starter_refresh as starters
import intake_delivered_art as delivered
import intake_elemental_war_art as war
from portrait_pocket_settings import load_corrections
import reprocess_portrait_pockets as correction


class PortraitPocketTests(unittest.TestCase):
    def test_local_keys_do_not_widen_the_original_black_matte_or_touch_other_regions(self):
        image = Image.new("RGB", (100, 100), "black")
        draw = ImageDraw.Draw(image)
        draw.rectangle((10, 10, 90, 90), fill=(20, 20, 20))
        draw.rectangle((20, 20, 30, 30), fill=(45, 110, 35))
        draw.rectangle((60, 60, 70, 70), fill=(45, 110, 35))
        settings = {
            "keys": [[0, 0, 0]], "radius": 10, "border_only": True,
            "background_regions": [{
                "polygon": [[.1, .1], [.4, .1], [.4, .4], [.1, .4]],
                "keys": [[45, 110, 35]], "radius": 40,
            }],
            "background_seeds": [[.25, .25]],
        }
        result = characters.clean(image, settings)
        self.assertEqual(result.getpixel((25, 25))[3], 0)
        self.assertEqual(result.getpixel((65, 65)), (45, 110, 35, 255))
        self.assertEqual(result.getpixel((15, 15)), (20, 20, 20, 255))

    def test_latest_delivered_source_takes_priority_over_historical_refresh(self):
        with patch.object(characters, "prepare", side_effect=AssertionError("Superseded source")), \
                patch.object(delivered, "prepare", return_value=(
                    b"new-candidate", {"processing": {"method": "reviewed current source"}})):
            planned, _ = correction.plan(["rosetta-evo-6"])
        self.assertEqual(len(planned), 1)
        self.assertEqual(planned[0][0]["manifest"], str(delivered.MANIFEST.relative_to(correction.ROOT)))
        self.assertIn("delivered-root-art", planned[0][0]["before"]["source"])

    def test_current_delivery_and_war_holes_clear_without_erasing_subject_details(self):
        preserved = {
            "rosetta-evo-6": [(600, 365), (100, 100), (500, 455)],
            "thornia-evo-6": [(560, 391), (820, 370), (572, 565)],
            "crinso-evo-6": [(600, 375), (601, 251), (562, 510)],
            "crinso-evo-5": [(575, 340), (571, 180), (600, 530)],
            "bliss-evo-2": [(572, 143), (628, 377), (620, 550)],
            "bliss-evo-3": [(1090, 370), (1190, 800), (700, 1150)],
            "bliss-evo-6": [(623, 370), (540, 267), (350, 559)],
            "orvella-evo-6": [(590, 345), (366, 211), (557, 695), (580, 868)],
        }
        current = {asset.asset: (asset.source, delivered._settings(asset))
                   for asset in delivered.assets() if asset.asset in preserved}
        war_settings = war.load_settings()
        current["orvella-evo-6"] = (
            characters.ROOT / "Art" / "source" / "elemental-war" / "characters" / "orvella-evo-6.png",
            war_settings["orvella-evo-6"])
        for asset, (path, settings) in current.items():
            with self.subTest(asset=asset), Image.open(path) as source:
                result = characters.clean(source, settings)
                for x, y in settings["background_seeds"]:
                    point = (round(x * source.width), round(y * source.height))
                    self.assertEqual(result.getpixel(point)[3], 0, (asset, point))
                for point in preserved[asset]:
                    self.assertEqual(result.getpixel(point), (*source.getpixel(point), 255),
                                     (asset, point))

    def test_latest_correction_histories_reproduce_and_keep_original_sources(self):
        for module in (delivered, war):
            document = json.loads(module.MANIFEST.read_text())
            for row in document["assets"]:
                if row.get("category") != "characters":
                    continue
                self.assertEqual(characters.digest(characters.ROOT / row["source"]), row["source_sha256"])
                for previous in row.get("processing_history", []):
                    path = characters.ROOT / previous.get("runtime", previous.get("previous_runtime"))
                    self.assertEqual(characters.digest(path), previous["runtime_sha256"])
                    with Image.open(characters.ROOT / row["source"]) as source:
                        image = characters.standardize_sprite(
                            characters.clean(source, previous["processing"]), 960, 864)
                        buffer = BytesIO()
                        image.save(buffer, format="PNG", optimize=True)
                        self.assertEqual(buffer.getvalue(), path.read_bytes())

    def test_local_radius_never_expands_cleanup_outside_reviewed_polygon(self):
        image = Image.new("RGB", (100, 100), "white")
        draw = ImageDraw.Draw(image)
        draw.rectangle((10, 10, 90, 90), fill="black")
        draw.rectangle((20, 20, 30, 30), fill=(235, 235, 235))
        draw.rectangle((60, 60, 70, 70), fill=(235, 235, 235))
        settings = {"keys": [[255, 255, 255]], "radius": 10, "border_only": True,
                    "background_regions": [{"polygon": [[.19, .19], [.31, .19], [.31, .31], [.19, .31]],
                                            "radius": 40}],
                    "background_seeds": [[.25, .25]]}
        result = characters.clean(image, settings)
        self.assertEqual(result.getpixel((25, 25))[3], 0)
        self.assertEqual(result.getpixel((65, 65)), (235, 235, 235, 255))

    def test_each_reviewed_hole_clears_and_selected_foreground_is_unchanged(self):
        records = {}
        settings = {}
        for module in (characters, starters):
            records.update({row["asset"]: row for row in json.loads(module.MANIFEST.read_text())["assets"]})
            settings.update(module.load_settings())
        for asset, row in load_corrections().items():
            with self.subTest(asset=asset), Image.open(characters.ROOT / records[asset]["source"]) as source:
                result = characters.clean(source, settings[asset])
                for x, y in row["background_seeds"]:
                    point = (round(x * source.width), round(y * source.height))
                    self.assertEqual(result.getpixel(point)[3], 0, (asset, point))
                for point in row["preserved_points"]:
                    self.assertEqual(result.getpixel(tuple(point)), (*source.getpixel(tuple(point)), 255),
                                     (asset, point))

    def test_correction_history_preserves_pre_cleanup_exports_and_processing(self):
        corrected = set()
        for module in (characters, starters):
            for row in json.loads(module.MANIFEST.read_text())["assets"]:
                for previous in row.get("processing_history", []):
                    corrected.add(row["asset"])
                    self.assertEqual(characters.digest(characters.ROOT / previous["runtime"]),
                                     previous["runtime_sha256"])
                    with Image.open(characters.ROOT / row["source"]) as source:
                        image = characters.standardize_sprite(
                            characters.clean(source, previous["processing"]), 960, 864)
                        buffer = BytesIO()
                        image.save(buffer, format="PNG", optimize=True)
                        self.assertEqual(buffer.getvalue(),
                                         (characters.ROOT / previous["runtime"]).read_bytes())
        self.assertEqual(corrected, set(load_corrections()))

    def test_review_plan_and_candidate_conflicts_prevent_any_writes(self):
        with TemporaryDirectory() as directory:
            review = Path(directory)
            record = {"asset": "sample", "processing": {"radius": 1}}
            planned = [(record, b"reviewed")]
            with patch.object(correction, "plan", return_value=(planned, {})):
                (review / "plan.json").write_text(json.dumps([record]))
                (review / "sample.png").write_bytes(b"changed")
                with self.assertRaisesRegex(FileExistsError, "candidate changed"):
                    correction.reprocess(["sample"], review, apply=True)
                stale = deepcopy(record)
                stale["processing"]["radius"] = 2
                (review / "plan.json").write_text(json.dumps([stale]))
                with self.assertRaisesRegex(FileExistsError, "changed after review"):
                    correction.reprocess(["sample"], review, apply=True)
                with self.assertRaisesRegex(FileExistsError, "new review directory"):
                    correction.reprocess(["sample"], review)

    def test_changed_runtime_or_source_or_backup_fails_preflight(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            before = {}
            for key in ("source", "runtime", "previous_runtime"):
                (root / f"{key}.png").write_bytes(key.encode())
                before[key] = f"{key}.png"
                before[f"{key}_sha256"] = sha256(key.encode()).hexdigest()
            before["asset"] = "sample"
            before["processing"] = {"radius": 1}
            manifest = root / "characters.json"
            manifest.write_text(json.dumps({"assets": [before]}))
            other = root / "starters.json"
            other.write_text(json.dumps({"assets": []}))
            with patch.object(correction, "ROOT", root), \
                    patch.object(characters, "MANIFEST", manifest), \
                    patch.object(starters, "MANIFEST", other), \
                    patch.object(characters, "load_settings", return_value={"sample": {"radius": 2}}), \
                    patch.object(starters, "load_settings", return_value={}), \
                    patch.object(characters, "prepare", return_value=b"corrected"):
                self.assertEqual(len(correction.plan(["sample"])[0]), 1)
                for key in ("source", "runtime", "previous_runtime"):
                    path = root / before[key]
                    path.write_bytes(b"changed")
                    with self.assertRaisesRegex(FileExistsError, "changed since intake"):
                        correction.plan(["sample"])
                    path.write_bytes(key.encode())
                self.assertEqual((root / "runtime.png").read_bytes(), b"runtime")

    def test_selection_must_be_explicit_and_distinct(self):
        for assets in ([], ["bruno", "bruno"]):
            with self.assertRaisesRegex(ValueError, "distinct"):
                correction.plan(assets)
        with self.assertRaisesRegex(ValueError, "Unknown"):
            correction.plan(["not-a-character"])


if __name__ == "__main__":
    unittest.main()
