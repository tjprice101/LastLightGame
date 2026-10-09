"""Bounded portrait quality contracts; generated images still require review."""
from pathlib import Path
import re
import unittest
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
BLOCK = re.compile(r"```(?:text)?\n(.*?)\n```", re.S)
NAMES = ("Infernis", "Tizu", "Flora", "Atmoso", "Aurora", "Bliss", "Bruno",
         "Disciple", "Elise", "Razor", "Rosetta", "Thornia", "Crinso")
SPANS = (50, 60, 72, 84, 94, 96)
MARGINS = (25, 20, 14, 8, 3, 2)
FRACTIONS = ("one third",) * 4 + ("one quarter", "one fifth")
MOTIFS = {
    "Infernis": ("phoenix-feather arches", "scarlet fire ribbons"),
    "Tizu": ("shell arches", "sapphire water ribbons"),
    "Flora": ("blossom mandalas", "emerald leaf ribbons"),
    "Atmoso": ("gale spirals", "sky-blue wind ribbons"),
    "Aurora": ("solar lenses", "amber geometric bands"),
    "Bliss": ("feather mandalas", "pale-blue rose ribbons"),
    "Bruno": ("mineral fans", "ochre faultline ribbons"),
    "Disciple": ("mindcrown lattices", "scarlet mindflame ribbons"),
    "Elise": ("circuit mandalas", "mint-lime lightning ribbons"),
    "Razor": ("eclipse crescents", "deep-violet night ribbons"),
    "Rosetta": ("rose mandalas", "crimson petal ribbons"),
    "Thornia": ("shadow-rose mandalas", "crimson night ribbons"),
    "Crinso": ("rose mandalas", "gold-flame crimson-lightning ribbons"),
}


def portraits():
    entries = {name: {} for name in NAMES}
    for name in NAMES:
        path = art_path(f"{name} Art.md", root=ROOT)
        text = path.read_text(encoding="utf-8")
        for match in BLOCK.finditer(text):
            heading = re.findall(r"^#{1,6} (.+)$", text[:match.start()], re.M)[-1]
            stage = re.search(r"(?:Evo\.|Art Stage )([1-6])", heading)
            if stage and "--sref " in match.group(1):
                entries[name][int(stage.group(1))] = match.group(1)
    starter = (art_path("Starter Art.md", root=ROOT)).read_text(encoding="utf-8")
    for match in BLOCK.finditer(starter):
        heading = re.findall(r"^#{1,6} (.+)$", starter[:match.start()], re.M)[-1]
        for name in NAMES[:3]:
            if f"Beginner, {name}" in heading:
                entries[name][1] = match.group(1)
    return entries


class CharacterPortraitQualityTests(unittest.TestCase):
    def test_all_thirteen_lines_have_six_bounded_complete_portraits(self):
        entries = portraits()
        self.assertEqual(sum(len(forms) for forms in entries.values()), 78)
        for name, forms in entries.items():
            self.assertEqual(set(forms), set(range(1, 7)))
            for stage, body in forms.items():
                with self.subTest(character=name, stage=stage):
                    positive = body.split(" --", 1)[0]
                    self.assertLessEqual(len(positive.split()), 380)
                    self.assertIn("2.5 to 3 heads tall", positive)
                    self.assertIn("eyes only with no other facial features", positive)
                    self.assertIn("nothing touches the frame edges", positive)
                    self.assertIn("complete ", positive)
                    self.assertIn("facing left both eyes and feet visible", positive)
                    self.assertNotRegex(
                        positive, r"\b(?:realistic|photorealistic|cinematic|robot)\b")

    def test_progressive_ensemble_spread_body_scale_and_actual_margins(self):
        for name, forms in portraits().items():
            for stage, body in forms.items():
                with self.subTest(character=name, stage=stage):
                    positive = body.split(" --", 1)[0]
                    self.assertEqual(len(re.findall(
                        r"body one (?:third|quarter|fifth) of canvas height", positive)), 1)
                    self.assertIn(
                        f"body {FRACTIONS[stage-1]} of canvas height", positive)
                    self.assertIn(
                        f"ensemble spans {SPANS[stage-1]} percent of canvas width and height",
                        positive)
                    self.assertIn(
                        f"{MARGINS[stage-1]} percent solid background-color margin on all four sides",
                        positive)
                    if stage >= 4:
                        self.assertIn("narrow background-color channels", positive)
                        self.assertNotIn("generous", positive)
                    if stage >= 5:
                        self.assertIn("elemental powers dominate the small human figure", positive)
                        self.assertNotIn("one third of canvas", positive)

    def test_repeated_identity_renderer_palette_and_key_within_each_line(self):
        for name, forms in portraits().items():
            identities = []
            renderers = []
            keys = []
            for _, body in sorted(forms.items()):
                identity = body.split(", one ", 1)[1].split("2.5 to 3 heads tall", 1)[0]
                identities.append(identity)
                rendering = body.split("clean precise anime contours", 1)[1]
                renderers.append(rendering.split("plain solid ", 1)[0])
                keys.append(re.search(r"plain solid (\w+) background \((#[0-9A-F]+)\)",
                                      rendering).groups())
            with self.subTest(character=name):
                self.assertEqual(len(set(identities)), 1)
                self.assertEqual(len(set(renderers)), 1)
                if name == "Tizu":
                    expected = [("green", "#00FF00")] + [("magenta", "#FF00FF")] * 2 + [("orange", "#FF6600")] * 3
                elif name == "Flora":
                    expected = [("blue", "#0000FF")] * 3 + [("orange", "#FF6600")] * 3
                else:
                    expected = [keys[0]] * 6
                self.assertEqual(keys, expected)

    def test_late_density_uses_each_characters_own_elemental_architecture(self):
        for name, forms in portraits().items():
            for stage in (4, 5, 6):
                positive = forms[stage].split(" --", 1)[0]
                with self.subTest(character=name, stage=stage):
                    for motif in MOTIFS[name]:
                        self.assertIn(motif, positive)
                    self.assertNotRegex(positive, r"\b(?:sparse|empty backdrop)\b")
                    if stage >= 5:
                        self.assertIn("overlapping powers fill rear interior gaps", positive)
                    if stage == 6:
                        self.assertIn("vast intimidating rear elemental tapestry", positive)
                        self.assertIn("full wing tips visible", positive)


if __name__ == "__main__":
    unittest.main()
