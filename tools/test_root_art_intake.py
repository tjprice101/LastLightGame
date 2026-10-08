import json
from hashlib import sha256
from pathlib import Path
import unittest
from tempfile import TemporaryDirectory
from unittest.mock import patch

from PIL import Image
import numpy as np

from intake_root_art import ASSETS, ROOT, BACKGROUND_SEEDS, Asset, _remove_rgb_matte, _prepare, intake, plan
from color_matte import remove_color_matte


class RootArtIntakeTests(unittest.TestCase):
    def test_all_root_pngs_are_explicitly_mapped(self):
        mapped = {asset.incoming for asset in ASSETS}
        root_pngs = {path.name for path in ROOT.glob("*.png")}
        self.assertTrue(root_pngs <= mapped, f"Unmapped root PNGs: {root_pngs - mapped}")
        for asset in ASSETS:
            self.assertTrue((ROOT / asset.incoming).is_file() or (ROOT / asset.source).is_file())
        self.assertEqual(len(ASSETS), 36)

    def test_intake_manifest_sources_and_runtime_exports_match(self):
        manifest = json.loads((ROOT / "Art" / "root-art-intake.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["asset_count"], len(ASSETS))
        self.assertEqual(len(manifest["assets"]), len(ASSETS))
        for asset, record in zip(ASSETS, manifest["assets"]):
            source = ROOT / Path(record["source"].replace("\\", "/"))
            runtime = ROOT / Path(record["runtime"].replace("\\", "/"))
            self.assertEqual(record["incoming"], asset.incoming)
            self.assertEqual(sha256(source.read_bytes()).hexdigest(), record["source_sha256"])
            self.assertEqual(sha256(runtime.read_bytes()).hexdigest(), record["runtime_sha256"])
            if asset.key is None:
                self.assertEqual(source.read_bytes(), runtime.read_bytes())
            else:
                with Image.open(runtime) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (asset.export_size, asset.export_size))
                    self.assertEqual(image.getchannel("A").getextrema(), (0, 255))
                    self.assertEqual(image.getpixel((0, 0))[3], 0)

    def test_rgb_key_only_removes_border_connected_matching_color(self):
        image = Image.new("RGB", (9, 9), (220, 30, 180))
        for y in range(3, 6):
            for x in range(3, 6):
                image.putpixel((x, y), (20, 40, 80))
        image.putpixel((4, 0), (20, 40, 80))
        keyed, _ = _remove_rgb_matte(image, 24, 8)
        self.assertEqual(keyed.getpixel((0, 0))[3], 0)
        self.assertEqual(keyed.getpixel((4, 4))[3], 255)
        self.assertEqual(keyed.getpixel((4, 0))[3], 255)

    def test_dry_run_plan_is_complete_and_idempotent(self):
        self.assertEqual(len(plan()), len(ASSETS))

    def test_rgb_seed_does_not_erase_other_matching_subject_colors(self):
        image = Image.new("RGB", (9, 9), (220, 30, 180))
        for y in range(2, 7):
            for x in range(2, 7):
                image.putpixel((x, y), (20, 40, 80))
        image.putpixel((3, 4), (220, 30, 180))
        image.putpixel((5, 4), (220, 30, 180))
        result, _ = _remove_rgb_matte(image, 24, 8, [(3/9, 4/9)])
        self.assertEqual(result.getpixel((3, 4)), (0, 0, 0, 0))
        self.assertEqual(result.getpixel((5, 4)), (220, 30, 180, 255))

    def test_reviewed_pockets_clear_without_changing_remaining_source_pixels(self):
        self.assertEqual(len(BACKGROUND_SEEDS), 11)
        for asset in ASSETS:
            seeds = BACKGROUND_SEEDS.get(asset.runtime)
            if not seeds:
                continue
            with self.subTest(asset=asset.runtime), Image.open(ROOT / asset.source) as source:
                method, items = asset.key
                parameters = dict(items)
                if method == "hue":
                    before = remove_color_matte(source, **parameters)
                    after = remove_color_matte(source, **parameters, background_seeds=seeds)
                else:
                    before, _ = _remove_rgb_matte(source, **parameters)
                    after, _ = _remove_rgb_matte(source, **parameters, background_seeds=seeds)
                old, new = np.asarray(before), np.asarray(after)
                self.assertGreater(np.count_nonzero(old[:, :, 3]), np.count_nonzero(new[:, :, 3]))
                np.testing.assert_array_equal(new[new[:, :, 3] > 0], old[new[:, :, 3] > 0])
                for x, y in seeds:
                    point = (round(x * source.width), round(y * source.height))
                    self.assertEqual(before.getpixel(point)[3], 255)
                    self.assertEqual(after.getpixel(point), (0, 0, 0, 0))
                output, _ = _prepare(asset, ROOT / asset.source)
                self.assertEqual(output, (ROOT / "public" / "assets" / asset.runtime).read_bytes())
                if asset.runtime == "conduits/fracture-reservoir.png":
                    for point in ((500, 400), (100, 570), (620, 190)):
                        self.assertEqual(after.getpixel(point), (*source.getpixel(point), 255))
                if asset.runtime == "elements/aquatic.png":
                    self.assertEqual(after.getpixel((701, 123)), (*source.getpixel((701, 123)), 255))

    def test_regeneration_rejects_unrecorded_changes_before_writing(self):
        with TemporaryDirectory() as temporary, patch("intake_root_art.ROOT", Path(temporary)), patch(
                "intake_root_art.ASSETS", (Asset("asset.png", "elements", "elements/asset.png"),)):
            root = Path(temporary)
            Image.new("RGB", (2, 2), "white").save(root / "asset.png")
            intake(apply=True)
            self.assertEqual(len(plan(regenerate=True)), 1)
            runtime = root / "public" / "assets" / "elements" / "asset.png"
            runtime.write_bytes(b"unrecorded change")
            with self.assertRaises(FileExistsError):
                intake(apply=True, regenerate=True)
            self.assertEqual(runtime.read_bytes(), b"unrecorded change")

if __name__ == "__main__":
    unittest.main()
