import json
from pathlib import Path
import unittest
from tempfile import TemporaryDirectory

from PIL import Image

from intake_delivered_art import (
    Asset, GAP_SEEDS, KEY_SETTINGS, MANIFEST, ROOT, _settings, assets, clean_for_export,
    digest, plan, prepare,
)


class DeliveredArtIntakeTests(unittest.TestCase):
    def test_exact_mappings_and_per_source_review_settings_cover_all_deliveries(self):
        mapped = assets()
        self.assertEqual(len(mapped), 48)
        self.assertEqual(sum(asset.category == "conduits" for asset in mapped), 35)
        self.assertEqual(sum(asset.category == "characters" for asset in mapped), 13)
        self.assertEqual({asset.incoming for asset in mapped}, set(KEY_SETTINGS))
        self.assertEqual(len({asset.asset for asset in mapped}), 48)
        portrait_mappings = {asset.incoming: asset.asset for asset in mapped
                             if asset.category == "characters"}
        self.assertEqual(portrait_mappings["Stillplume Dancer, Bliss.png"], "bliss-evo-2")
        self.assertEqual(portrait_mappings["Quietwing Fencer, Bliss.png"], "bliss-evo-3")
        self.assertTrue(set(GAP_SEEDS) <= {asset.asset for asset in mapped})

    def test_installed_archives_previous_portraits_and_exports_match_provenance(self):
        rows, _ = plan()
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        records = {row["asset"]: row for row in manifest["assets"]}
        self.assertEqual(manifest["asset_count"], 48)
        self.assertEqual(len(rows), 48)
        for asset, _, incoming, _, record, _ in rows:
            with self.subTest(asset=asset.asset):
                self.assertFalse(incoming.exists())
                self.assertTrue(asset.source.is_file())
                self.assertTrue(asset.runtime.is_file())
                self.assertEqual(record, records[asset.asset])
                self.assertEqual(digest(asset.source), record["source_sha256"])
                self.assertEqual(digest(asset.runtime), record["runtime_sha256"])
                with Image.open(asset.runtime) as image:
                    self.assertEqual(image.mode, "RGBA")
                    self.assertEqual(image.size, (asset.canvas_size, asset.canvas_size))
                    self.assertEqual(image.getextrema()[3], (0, 255))
                    left, top, right, bottom = image.getchannel("A").getbbox()
                    padding = (asset.canvas_size - asset.content_size) // 2
                    self.assertGreaterEqual(min(left, top, asset.canvas_size - right,
                                                asset.canvas_size - bottom), padding)
                if asset.category == "characters":
                    previous = ROOT / Path(record["previous_runtime"].replace("\\", "/"))
                    self.assertTrue(previous.is_file())
                    self.assertEqual(digest(previous), record["previous_runtime_sha256"])

    def test_transparent_alpha_bypasses_all_rgb_key_settings(self):
        with TemporaryDirectory() as temporary:
            source = Path(temporary) / "authoritative-alpha.png"
            image = Image.new("RGBA", (20, 20), (12, 92, 84, 0))
            image.putpixel((10, 10), (12, 92, 84, 255))
            image.save(source)
            asset = Asset(
                "Quietwing Fencer, Bliss.png", "bliss-evo-3", "characters",
                source, Path(temporary) / "runtime.png", 960, 864, "front")
            output, metadata = prepare(source, asset)
            destination = Path(temporary) / "output.png"
            destination.write_bytes(output)
            with Image.open(destination) as result:
                self.assertEqual(result.mode, "RGBA")
                self.assertEqual(result.getpixel((480, 480)), (12, 92, 84, 255))
                self.assertEqual(result.getpixel((0, 0))[3], 0)
            self.assertEqual(metadata["processing"]["method"],
                             "supplied alpha; trim, resize, and pad only")

    def test_reviewed_d177_pockets_clear_and_palette_details_survive(self):
        by_id = {asset.asset: asset for asset in assets() if asset.category == "conduits"}
        for asset_id in (
            "chaotic-paradox-spindle", "execution-orrery",
            "nullsong-transmission", "prism-splinter-socket",
        ):
            asset = by_id[asset_id]
            settings = _settings(asset)
            with Image.open(asset.source) as source:
                cleaned = clean_for_export(source, settings, asset_id)
                for x, y in settings["background_seeds"]:
                    point = (round(x * source.width), round(y * source.height))
                    self.assertEqual(cleaned.getpixel(point), (0, 0, 0, 0), (asset_id, point))

        preserved = {
            "chaotic-paradox-spindle": [(512, 512), (500, 500)],
            "execution-orrery": [(512, 512), (512, 600)],
            "nullsong-transmission": [(512, 512), (512, 600)],
            "prism-splinter-socket": [(512, 400), (512, 512)],
        }
        for asset_id, points in preserved.items():
            asset = by_id[asset_id]
            with Image.open(asset.source) as source:
                cleaned = clean_for_export(source, _settings(asset), asset_id)
                for point in points:
                    with self.subTest(asset=asset_id, point=point):
                        self.assertEqual(cleaned.getpixel(point), (*source.getpixel(point), 255))

    def test_reviewed_source_border_strips_clear_only_blank_outer_pixels(self):
        by_id = {asset.asset: asset for asset in assets() if asset.category == "conduits"}
        meridian = by_id["meridian-inverter"]
        settings = _settings(meridian)
        with Image.open(meridian.source) as source:
            cleaned = clean_for_export(source, settings, meridian.asset)
            for x in range(source.width):
                self.assertEqual(cleaned.getpixel((x, 0))[3], 0)
                self.assertEqual(cleaned.getpixel((x, source.height - 1))[3], 0)
            self.assertEqual(cleaned.getpixel((source.width // 2, source.height // 2))[3], 255)
        paradox = by_id["chaotic-paradox-spindle"]
        with Image.open(paradox.source) as source:
            cleaned = clean_for_export(source, _settings(paradox), paradox.asset)
            self.assertTrue(all(cleaned.getpixel((x, 0))[3] == 0 for x in range(source.width)))
            self.assertTrue(all(cleaned.getpixel((x, source.height - 1))[3] == 0
                                for x in range(source.width)))


if __name__ == "__main__":
    unittest.main()
