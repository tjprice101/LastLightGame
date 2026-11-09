import copy
import io
import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image

from build_compact_portraits import (
    ROOT, SETTINGS, SOURCE, OUTPUT, MANIFEST, REVISIONS,
    build, derive, digest, validate_settings,
)


class CompactPortraitTests(unittest.TestCase):
    def setUp(self):
        image = Image.new("RGBA", (100, 100), (32, 160, 220, 127))
        stream = io.BytesIO()
        image.save(stream, format="PNG")
        self.source = stream.getvalue()
        self.form = {"eye": [50, 45], "size": 80, "sourceHash": digest(self.source)}
        self.settings = {"version": 1, "outputSize": 512, "eyeLine": .45, "forms": {"infernis": self.form}}

    def test_crop_preserves_source_and_rgba(self):
        before = bytes(self.source)
        data, rectangle, dimensions = derive(self.source, self.form, 512, .45)
        self.assertEqual(rectangle, [10, 9, 80, 80])
        self.assertEqual(dimensions, [100, 100])
        image = Image.open(io.BytesIO(data))
        self.assertEqual(image.size, (512, 512))
        self.assertEqual(image.mode, "RGBA")
        self.assertEqual(image.getpixel((256, 256))[3], 127)
        self.assertEqual(self.source, before)

    def test_rejects_changed_source_empty_subject_and_outside_crop(self):
        with self.assertRaisesRegex(ValueError, "source changed"):
            derive(self.source + b"changed", self.form, 512, .45)
        for eye in ([0, 0], [99, 99]):
            with self.assertRaisesRegex(ValueError, "exceeds"):
                derive(self.source, {**self.form, "eye": eye}, 512, .45)
        stream = io.BytesIO()
        Image.new("RGBA", (100, 100)).save(stream, format="PNG")
        empty = stream.getvalue()
        with self.assertRaisesRegex(ValueError, "no subject"):
            derive(empty, {**self.form, "sourceHash": digest(empty)}, 512, .45)

    def test_rejects_unreviewed_paths_and_invalid_settings(self):
        for change in ({"version": 2}, {"outputSize": 0}, {"eyeLine": float("nan")},
                       {"forms": {}}, {"forms": {"../escape": self.form}}):
            with self.assertRaises(ValueError):
                validate_settings({**self.settings, **change})
        for change in ({"eye": [True, 1]}, {"size": 0}, {"sourceHash": "not-a-hash"}):
            with self.assertRaises(ValueError):
                validate_settings({**self.settings, "forms": {"infernis": {**self.form, **change}}})

    def test_reproduction_staleness_and_preflight_do_not_modify_originals(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / SETTINGS).parent.mkdir(parents=True)
            (root / SOURCE).mkdir(parents=True)
            (root / SOURCE / "infernis.png").write_bytes(self.source)
            (root / SETTINGS).write_text(json.dumps(self.settings))
            result = build(root)
            self.assertEqual(build(root, check=True), result)
            formatted = json.dumps(self.settings, indent=2) + "\n"
            (root / SETTINGS).write_bytes(formatted.replace("\n", "\r\n").encode())
            self.assertEqual(build(root, check=True), result)
            self.assertEqual((root / SOURCE / "infernis.png").read_bytes(), self.source)
            target = root / OUTPUT / "infernis.png"
            target.write_bytes(b"stale")
            with self.assertRaisesRegex(ValueError, "stale"):
                build(root, check=True)
            self.assertEqual(target.read_bytes(), b"stale")
            build(root)
            before = {path: (root / path).read_bytes() for path in (OUTPUT / "infernis.png", MANIFEST, REVISIONS)}
            settings = copy.deepcopy(self.settings)
            settings["forms"]["tizu"] = {**self.form, "sourceHash": "0" * 64}
            (root / SOURCE / "tizu.png").write_bytes(self.source)
            (root / SETTINGS).write_text(json.dumps(settings))
            with self.assertRaisesRegex(ValueError, "source changed"):
                build(root)
            for path, data in before.items():
                self.assertEqual((root / path).read_bytes(), data)
            self.assertFalse((root / OUTPUT / "tizu.png").exists())

    def test_all_released_forms_have_exact_source_bound_provenance(self):
        manifest = build(ROOT, check=True)
        released = {
            "asteriel", "atmoso", "aurora", "bliss", "bruno", "caevren",
            "caldrex", "crinso", "disciple", "elise", "ilvaris", "ilyss",
            "kaelith", "maerion", "myrthen", "neralis", "nerithe", "orvella",
            "ozriel", "razor", "rosetta", "serapha", "seravelle", "solenne",
            "thornia", "vaelor", "varkhel", "velmira", "vespera",
        }
        expected = {
            name if form == 1 else f"{name}-evo-{form}"
            for name in ("infernis", "tizu", "flora", *released)
            for form in range(1, 7)
        }
        self.assertEqual(set(manifest["files"]), expected)
        self.assertEqual(len(expected), 192)
        for entry in manifest["files"].values():
            self.assertEqual(digest((ROOT / entry["source"]).read_bytes()), entry["sourceHash"])
            self.assertEqual(digest((ROOT / entry["output"]).read_bytes()), entry["outputHash"])
            with Image.open(ROOT / entry["output"]) as image:
                self.assertEqual(image.size, (512, 512))
                self.assertEqual(image.mode, "RGBA")


if __name__ == "__main__":
    unittest.main()
