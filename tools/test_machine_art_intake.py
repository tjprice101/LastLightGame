from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import numpy as np
from PIL import Image, ImageDraw

import intake_machine_art as intake
from prepare_art import standardize_sprite


class MachineArtIntakeTests(unittest.TestCase):
    def test_all_28_sources_exports_and_regeneration_match_provenance(self):
        manifest = json.loads((intake.ROOT / "Art" / "machines-art-intake.json").read_text())
        self.assertEqual(manifest["asset_count"], 28)
        self.assertEqual(len(manifest["assets"]), 28)
        self.assertEqual(len({row[0] for row in intake.ASSETS}), 28)
        self.assertEqual(len({row[2] for row in intake.ASSETS}), 28)
        for mapping, record in zip(intake.ASSETS, manifest["assets"]):
            filename, category, asset, key = mapping
            with self.subTest(asset=asset):
                self.assertEqual((filename, category, asset),
                                 (record["incoming"], record["category"], record["asset"]))
                source = intake.ROOT / record["source"]
                runtime = intake.ROOT / record["runtime"]
                self.assertEqual(intake.digest(source), record["source_sha256"])
                self.assertEqual(intake.digest(runtime), record["runtime_sha256"])
                regenerated, processing = intake.prepare(source, category, asset, key)
                self.assertEqual(sha256(regenerated).hexdigest(), record["runtime_sha256"])
                self.assertEqual(json.loads(json.dumps(processing)), record["processing"])
                if key is None:
                    self.assertEqual(source.read_bytes(), runtime.read_bytes())
                    continue
                size, margin = (256, 16) if category == "conduits" else (960, 48)
                with Image.open(runtime) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (size, size))
                    left, top, right, bottom = image.getbbox()
                    self.assertGreaterEqual(min(left, top, size - right, size - bottom), margin)
                    self.assertEqual(image.getextrema()[3][0], 0)
                if category == "enemies":
                    self.assertEqual(record["source_facing"], intake.SOURCE_FACING[asset])

    def test_supplied_alpha_is_authoritative_even_at_reviewed_frame_rows(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "alpha.png"
            image = Image.new("RGBA", (40, 40))
            ImageDraw.Draw(image).rectangle((10, 10, 25, 39), fill=(78, 234, 193, 255))
            image.putpixel((14, 20), (255, 255, 255, 128))
            image.save(source)
            data, processing = intake.prepare(source, "conduits", "voltaic-thunderbird-coil", (78, 234, 193))
            self.assertEqual(processing, {"method": "supplied-alpha; trim/resize/pad only"})
            with Image.open(BytesIO(data)) as result:
                self.assertEqual(result.tobytes(), standardize_sprite(image, 256, 224).tobytes())

    def test_rgb_key_removes_enclosed_gaps_but_preserves_pale_and_protected_core(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "rgb.png"
            key = (104, 249, 191)
            image = Image.new("RGB", (100, 100), key)
            draw = ImageDraw.Draw(image)
            draw.rectangle((15, 15, 85, 85), fill=(245, 245, 230))
            draw.rectangle((20, 20, 28, 28), fill=key)
            draw.rectangle((35, 45, 60, 65), fill=key)
            image.save(source)
            data, _ = intake.prepare(source, "conduits", "springwell-pump", key)
            with Image.open(BytesIO(data)) as result:
                pixels = np.asarray(result)
                self.assertEqual(result.getpixel((128, 128)), (*key, 255))
                pale = (pixels[:, :, 0] > 230) & (pixels[:, :, 1] > 230) & (pixels[:, :, 3] == 255)
                self.assertGreater(np.count_nonzero(pale), 30000)
                self.assertEqual(result.getpixel((44, 44))[3], 0)

    def test_actual_green_cores_and_pale_wings_survive(self):
        for asset, category, minimum in [
            ("efflorescent-worldtree-heart", "conduits", 3500),
            ("fractured-watcher", "enemies", 1000),
            ("ouroboros-first-dawn", "enemies", 80000),
        ]:
            with self.subTest(asset=asset), Image.open(intake.ROOT / "public" / "assets" / category / f"{asset}.png") as image:
                pixels = np.asarray(image, dtype=np.int32)
                r, g, b, alpha = pixels.transpose(2, 0, 1)
                color = ((g > r + 15) & (g > b + 15)) if asset != "ouroboros-first-dawn" else ((r > 200) & (g > 180) & (b > 180))
                self.assertGreater(np.count_nonzero(color & (alpha >= 250)), minimum)

    def test_cleanup_requires_apply_and_refuses_conflicts_before_any_changes(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(intake, "ROOT", Path(directory)):
            root = Path(directory)
            mappings = [("one.png", "conduits", "one", (0, 255, 0)),
                        ("two.png", "conduits", "two", (0, 255, 0))]
            for filename, _, _, _ in mappings:
                image = Image.new("RGB", (50, 50), (0, 255, 0))
                ImageDraw.Draw(image).rectangle((15, 15, 35, 35), fill="white")
                image.save(root / filename)
            unrelated = root / "unrelated.png"
            unrelated.write_bytes(b"untouched")
            with patch.object(intake, "ASSETS", mappings):
                with self.assertRaises(ValueError):
                    intake.intake(remove_incoming=True)
                runtime = root / "public" / "assets" / "conduits" / "two.png"
                runtime.parent.mkdir(parents=True)
                runtime.write_bytes(b"conflict")
                with self.assertRaises(FileExistsError):
                    intake.intake(apply=True, remove_incoming=True)
                self.assertFalse((root / "Art").exists())
                self.assertTrue((root / "one.png").exists())
                runtime.unlink()
                intake.intake(apply=True)
                manifest = root / "Art" / "machines-art-intake.json"
                original_manifest = manifest.read_bytes()
                (root / "two.png").write_bytes(b"changed source")
                with self.assertRaises(FileExistsError):
                    intake.intake(apply=True, remove_incoming=True)
                self.assertTrue((root / "one.png").exists())
                self.assertEqual(manifest.read_bytes(), original_manifest)
                (root / "two.png").write_bytes((root / "Art" / "source" / "machines" / "conduits" / "two.png").read_bytes())
                intake.intake(apply=True, remove_incoming=True)
                self.assertFalse((root / "one.png").exists())
                self.assertFalse((root / "two.png").exists())
                self.assertEqual(unrelated.read_bytes(), b"untouched")
                intake.intake()
                self.assertEqual(manifest.read_bytes(), original_manifest)


if __name__ == "__main__":
    unittest.main()
