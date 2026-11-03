import unittest

from build_phase1_war_art import DESIGNS, OUTPUT, blocks, document
from build_elemental_war_art import RENDERER


class PhaseOneWarArtTests(unittest.TestCase):
    def test_exact_delivery_shape_and_reproduction(self):
        rows = blocks()
        self.assertEqual(len(rows), 45)
        self.assertEqual(len({name for name, _, _ in rows}), 45)
        self.assertEqual(OUTPUT.read_text(encoding="utf-8"), document())
        self.assertEqual(sum("--ar 4:3" in p for _, _, p in rows), 18)
        self.assertEqual(sum("--ar 1:1" in p for _, _, p in rows), 21)
        self.assertEqual(sum("--ar 3:1" in p for _, _, p in rows), 3)
        self.assertEqual(sum("--ar 16:9" in p for _, _, p in rows), 3)

    def test_concise_clear_cutouts_and_reference_scope(self):
        for name, _, prompt in blocks():
            with self.subTest(name=name):
                positive = prompt.split(" --ar")[0]
                self.assertLessEqual(len(positive.split()), 260)
                if "--ar 4:3" in prompt:
                    self.assertIn(RENDERER, prompt)
                    self.assertIn("rounded oversized head tiny torso short limbs", prompt)
                    self.assertIn("body one third of canvas height", prompt)
                    self.assertNotIn("small centered character", prompt)
                    self.assertIn("--sref https://", prompt)
                    self.assertIn("--sw 150", prompt)
                    self.assertIn("no mouth nose or eyebrows", prompt)
                else:
                    self.assertNotIn("--sref", prompt)
                    self.assertNotIn("--sw", prompt)
                if "--ar 4:3" in prompt or "--ar 1:1" in prompt:
                    self.assertIn("--niji 6 --s 100 --q 1", prompt)
                if "--ar 4:3" in prompt or "--ar 1:1" in prompt:
                    self.assertIn("empty15 percent border", prompt)
                    self.assertIn("Plain solid unlit", prompt)
                    self.assertIn("sharp crisp focus", prompt)
                    self.assertIn("backsplash", prompt)
                    design = next(d for d in DESIGNS if d["slug"] in name)
                    negatives = prompt.split(" --no ", 1)[1].split(" --sref", 1)[0].split(", ")
                    self.assertNotIn(design["key"], negatives)
                if "--ar 1:1" in prompt:
                    self.assertIn("object-only", prompt)
                    self.assertIn("no wielder", prompt)
                    self.assertIn("tiny character", prompt)

    def test_distinct_identities_and_mechanical_masters(self):
        for design in DESIGNS:
            self.assertEqual(len(set(design["titles"])), 6)
            self.assertNotIn("Seraph", " ".join(design["titles"]))
            self.assertNotIn("Eternal", " ".join(design["titles"]))
            self.assertIn("hair", design["identity"])
            self.assertIn("paint", design["identity"])
            self.assertIn("retain Legendary", design["forms"][-1])
            self.assertIn("prismatic", design["forms"][-1])
            self.assertTrue(any(word in design["forms"][-2] for word in ("majestic", "Majestic")))
        self.assertIn("wingless", DESIGNS[0]["signature"])
        self.assertIn("wingless", DESIGNS[1]["signature"])
        self.assertIn("white rime-coated bare twigs", DESIGNS[2]["signature"])
        masters = [(name, prompt) for name, _, prompt in blocks() if name.startswith("master-")]
        self.assertEqual(len(masters), 9)
        self.assertEqual(len({prompt for _, prompt in masters}), 9)
        for name, prompt in masters:
            self.assertIn("one integrated luxury-scale chassis", prompt)
            self.assertIn("precision gears", prompt)
            self.assertIn("musical instrument", prompt)
            if not name.startswith("master-caldrex"):
                self.assertNotIn("crimson", prompt)

    def test_solenne_omnic_enveloping_power_keeps_identity(self):
        prompt = next(p for name, _, p in blocks() if name == "solenne-6.png")
        for clause in ("bell-resonance spirals", "feet torso and crown",
                       "interwoven rising helices", "sound rings envelop",
                       "without hiding face hands or bell",
                       "vast asymmetric mandala", "cascading brocade trains",
                       "razor-defined", "colossal lotus-bell shield"):
            self.assertIn(clause, prompt)
        self.assertIn(RENDERER, prompt)
        self.assertIn("one bronze-and-rose-ivory temple bell", prompt)


if __name__ == "__main__":
    unittest.main()
