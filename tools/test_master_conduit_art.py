from collections import Counter
import re
import unittest

from build_master_conduit_art import (
    CHARACTERS, OUTPUT, PALETTES, ROOT, catalogue, document, palette_design,
)


class MasterConduitArtTests(unittest.TestCase):
    def test_exact_catalogue_and_reproduction(self):
        rows, chest = catalogue()
        self.assertEqual(len(rows), 48)
        self.assertEqual(len({row.id for row in rows}), 48)
        self.assertEqual(len({row.name for row in rows}), 48)
        self.assertEqual(len({row.design for row in rows}), 48)
        self.assertEqual(Counter(row.rarity for row in rows), {"Omnic": 48})
        self.assertEqual(Counter(row.character for row in rows),
                         {name: 3 for name in CHARACTERS.values()})
        for character in CHARACTERS.values():
            self.assertEqual({row.slot for row in rows if row.character == character}, {1, 2, 3})
        self.assertEqual(chest["id"], "grand-master-chest")
        self.assertEqual(chest["name"], "Cosmic Grand Master Chest")
        self.assertEqual(OUTPUT.read_text(encoding="utf-8"), document())

    def test_parser_rejects_silent_catalogue_drift(self):
        text = (ROOT / "src" / "content" / "master-conduits.ts").read_text(encoding="utf-8")
        for modified in (
            text.replace("master('ember', 1,", "master('unknown', 1,", 1),
            text.replace("master('ember', 1,", "master('ember', 2,", 1),
            text.replace("rarity: 'Omnic'", "rarity: 'Legendary'", 1),
            text.replace("] as const;", "  unexpected(),\n] as const;", 1),
        ):
            with self.subTest(modified=modified[:30]), self.assertRaises(ValueError):
                catalogue(modified)

    def test_prompts_palette_architecture_and_effect_contracts(self):
        text = document()
        rows, chest = catalogue()
        blocks = re.findall(r"```text\n(.*?)\n```", text, re.S)
        self.assertEqual(len(blocks), 50)
        self.assertEqual(len(set(blocks)), 50)
        self.assertNotIn("--sref", text)
        self.assertNotIn("--sw", text)
        self.assertIn("Art delivered and installed (D-226)", text)
        for row, block in zip(rows, blocks):
            self.assertIn(f"Art ID: `{row.id}`", text)
            self.assertIn(f"Effect contract: {row.effect}", text)
            self.assertIn(f"Catalogue design: {row.design}", text)
            self.assertIn(palette_design(row), block)
            self.assertIn(PALETTES[row.character][0], block)
            self.assertIn("cosmic-level engineered architecture of planetary scale", block)
            self.assertIn("almost no dead space INSIDE the object", block)
            self.assertIn("protected readable central mechanism", block)
            self.assertIn("opaque mechanical flames", block)
            negatives = block.split(" --no ")[1].split(", ")
            key = "magenta" if row.character in {"Flora", "Elise"} else "green"
            self.assertNotIn(key, negatives)
            self.assertNotIn("flames", negatives)
            for unwanted in PALETTES[row.character][1].split(", "):
                if unwanted != key:
                    self.assertIn(unwanted, negatives)
        for block in blocks:
            self.assertEqual(block.count("--no "), 1)
            self.assertIn("--ar 1:1 --niji 6 --s 100", block)
            self.assertGreaterEqual(block.count("continuous safety margin on all four sides and corners"), 2)
            self.assertIn("at least 15% continuous outer clearance per side", block)
            self.assertIn("nothing touches or crosses the frame edges", block)
            self.assertIn("flat unlit color edge to edge and through all openings", block)
            self.assertIn("no glows or glowing visual effects", block)
            self.assertIn("non-emissive painted highlights", block)
            self.assertIn("crisp cel shading", block)
            self.assertLess(len(block.split(" --ar ")[0].split()), 380)
        self.assertIn(chest["description"], text)
        self.assertIn("planetary combination lock", blocks[48])
        self.assertIn("visibly locked not open", blocks[48])
        self.assertIn("small clean readable mechanic emblem", blocks[49])
        self.assertIn("no complex machine architecture", blocks[49])
        self.assertNotIn("cosmic-level engineered architecture", blocks[49])
        self.assertNotIn("opaque mechanical flames", blocks[49])
        headings = re.findall(r"^## .*", text, re.M)
        self.assertEqual(len(headings), 50)
        self.assertEqual(sum("Astral Reserve" in heading for heading in headings), 1)


if __name__ == "__main__":
    unittest.main()
