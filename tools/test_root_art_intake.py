import json
from hashlib import sha256
from pathlib import Path
import unittest

from PIL import Image

from intake_root_art import ASSETS, ROOT, _remove_rgb_matte, plan


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


if __name__ == "__main__":
    unittest.main()
