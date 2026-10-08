"""Exact character-form reference contracts; no network/generation required."""
from pathlib import Path
import re
import unittest
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
GUIDE = ROOT / "Art" / "midjourney-character-style-prompt.md"
BLOCK = re.compile(r"```(?:text)?\n(.*?)\n```", re.S)
PACKS = ("Atmoso", "Aurora", "Bliss", "Bruno", "Crinso", "Disciple",
         "Elise", "Razor", "Rosetta", "Thornia")


class CharacterStyleReferenceTests(unittest.TestCase):
    def setUp(self):
        self.references = {
            int(stage): url for stage, url in re.findall(
                r"^\| ([0-6]) \| (https://\S+) \|$",
                GUIDE.read_text(encoding="utf-8"), re.M)
        }

    def test_owner_reference_mapping_and_query_parameters(self):
        self.assertEqual(set(self.references), set(range(7)))
        expected = (
            ("10011", "1557598571459518555", "927", "723",
             "342fcaf73a6540d793e059bf4df865696feb1d5d1b210727b1230418fe8bcd14"),
            ("10013", "1557599871546949782", "1123", "778",
             "ad01070e9a0cdbe9241bb98a758ed8329911ae4bb5b04629c636c13421e2fd73"),
            ("10014", "1557599871962447964", "1022", "778",
             "99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5"),
            ("10014", "1557599871962447964", "1022", "778",
             "99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5"),
            ("10015", "1557599872381624371", "950", "778",
             "461c4602b0b28386e1373a9e4eaf081bb56cc69163fed126952c4065e45aa3c7"),
            ("10016", "1557599872771686440", "956", "778",
             "47e8c081f934e035f43da638a09d14991a90521cbfd7d4794d113c7bdf3891f7"),
            ("10017", "1557598570910060564", "817", "778",
             "a25734b8c781314dc6db6923c2449ecf97638d2bfa73032b17862cfa75932654"),
        )
        for stage, (unit, attachment, width, height, signature) in enumerate(expected):
            with self.subTest(stage=stage):
                early = stage in (0, 6)
                expected_url = (
                    "https://media.discordapp.net/attachments/1006667219217952879/"
                    f"{attachment}/Unit_ills_full_{unit}.webp?"
                    f"ex={'6ac86236' if early else '6ac8636c'}"
                    f"&is={'6ac710b6' if early else '6ac711ec'}"
                    f"&hm={signature}&=&format=webp&width={width}&height={height}"
                )
                self.assertEqual(self.references[stage], expected_url)
                parsed = urlparse(self.references[stage])
                self.assertEqual(parse_qs(parsed.query)["format"], ["webp"])
        self.assertEqual(self.references[2], self.references[3])

    def test_every_character_form_has_one_exact_trailing_suffix(self):
        expected = {
            **{f"{name} Art.md": list(range(1, 7)) for name in PACKS},
            **{f"{name} Art.md": list(range(2, 7))
               for name in ("Infernis", "Flora", "Tizu")},
            "Starter Art.md": [1, 1, 1],
            GUIDE.name: [0] + list(range(1, 7)) * 3,
        }
        count = 0
        for filename, stages in expected.items():
            text = (ROOT / "Art" / filename).read_text(encoding="utf-8")
            bodies = []
            others = []
            for match in BLOCK.finditer(text):
                body = match.group(1)
                if "--niji" not in body:
                    continue
                heading = re.findall(r"^#{1,6} (.+)$",
                                     text[:match.start()], re.M)[-1]
                is_form = (
                    re.search(r"(?:Evo\.|Art Stage |^Stage )[1-6]", heading)
                    or heading == "Core Master Prompt (copy/paste base)"
                    or (filename == "Starter Art.md" and "Beginner," in heading)
                )
                (bodies if is_form else others).append(body)
            self.assertEqual(len(bodies), len(stages))
            for index, stage in enumerate(stages):
                with self.subTest(file=filename, block=index + 1):
                    body = bodies[index]
                    self.assertTrue(body.endswith(
                        f" --sref {self.references[stage]} --sw 400"))
                    self.assertEqual(body.count("--sref "), 1)
                    self.assertEqual(body.count("--sw "), 1)
                    self.assertNotIn("<approved_reference", body)
                    self.assertIn("--niji 6", body)
                    positive = body.split(" --", 1)[0]
                    for anchor in ("contours", "cel shading", "painted highlights",
                                   "jewel-like", "plain solid ", "flat unlit"):
                        self.assertIn(anchor, positive)
                    for flag in ("ar", "niji", "s", "q", "no", "sref", "sw"):
                        self.assertEqual(len(re.findall(
                            rf"--{flag}\s", body)), 1)
                    self.assertIn("--s 100", body)
                    self.assertIn("--q 1", body)
                    self.assertNotIn("--style ", body)
                    count += 1
            for body in others:
                if filename == "Starter Art.md" and "--ar 4:3" in body:
                    continue
                self.assertNotIn("--sref ", body)
                self.assertNotIn("--sw ", body)
        self.assertEqual(count, 97)

    def test_other_prompt_packs_have_no_new_character_reference_flags(self):
        character_paths = {f"{name} Art.md" for name in
                           (*PACKS, "Infernis", "Flora", "Tizu")}
        character_paths.update(("Starter Art.md", GUIDE.name))
        for path in (ROOT / "Art").rglob("*.md"):
            if path.name in character_paths:
                continue
            for body in BLOCK.findall(path.read_text(encoding="utf-8")):
                if "--niji" in body:
                    with self.subTest(file=str(path.relative_to(ROOT))):
                        if "--ar 4:3" in body:
                            continue
                        self.assertNotIn("--sref ", body)
                        self.assertNotIn("--sw ", body)


if __name__ == "__main__":
    unittest.main()
