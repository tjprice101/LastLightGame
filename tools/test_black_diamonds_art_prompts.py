"""Focused structure checks for the Black Diamonds Against The Light event and character art packs."""
from pathlib import Path
import re
import unittest
import sys

TOOLS_DIR = Path(__file__).resolve().parent
if str(TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(TOOLS_DIR))

from character_palette import design_prose
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "Art"
BLOCK = re.compile(r"```(?:text)?\n(.*?)\n```", re.S)

CHARACTERS = {
    "Dravok": {
        "gender": "male", "element": "fire-element", "weapon": "greatcleaver",
        "stars": "6-star",
        "titles": (
            "Ashen Initiate", "Cleaved Obsidian", "Pyre Vanguard",
            "Dread-Facet Warlord", "Sovereign of the Dark Crucible",
            "The Diamond Beyond the Flame",
        ),
        "skills": (
            "Ashen Carving", "Obsidian Cleave", "Dark Flare Eruption",
            "Cataclysm of Black Fire",
        ),
    },
    "Vespera": {
        "gender": "female", "element": "fire-element", "weapon": "chakrams",
        "stars": "5-star",
        "titles": (
            "Cinder Weaver", "Flame-Facet Dancer", "Ember Herald",
            "Lady of the Crimson Facet", "Sovereign of the Smoldering Core",
            "The Pyre Beyond the Eclipse",
        ),
        "skills": (
            "Ember Etching", "Orbiting Cinders", "Ashen Refraction",
            "Pyre of Thousand Facets",
        ),
    },
    "Talise": {
        "gender": "female", "element": "water-element", "weapon": "estoc",
        "stars": "6-star",
        "titles": (
            "Abyssal Sentinel", "Glacial Guard", "Tide-Crest Knight",
            "Warden of Deep Prisms", "Sovereign of Oceanic Pressure",
            "The Trench Beyond the Light",
        ),
        "skills": (
            "Unyielding Prism", "Glacial Needle", "Abyssal Diamond Bulwark",
            "Deep Sea Monolith",
        ),
    },
    "Malakor": {
        "gender": "male", "element": "dark-element", "weapon": "scythe",
        "stars": "6-star",
        "titles": (
            "Void Sculptor", "Rift Cleaver", "Knight of the Fractured Star",
            "Dread-Matter Sovereign", "Sovereign of the Dark Singularity",
            "The Void Beyond the Diamond",
        ),
        "skills": (
            "Fracture of Void", "Umbral Cleave", "Event Horizon",
            "Annihilation of the Black Sun",
        ),
    },
    "Theron": {
        "gender": "male", "element": "nature-element", "weapon": "glaive",
        "stars": "5-star",
        "titles": (
            "Petrified Bloom", "Brier Carver", "Keeper of the Fossil Grove",
            "Warden of Black Carbon", "Sovereign of the Petrified Heart",
            "The Grove Beyond the Eclipse",
        ),
        "skills": (
            "Petrified Root", "Brier Thrust", "Bloom of the Black Diamond",
            "Forest of Eternal Carbon",
        ),
    },
    "Selene": {
        "gender": "female", "element": "light-element", "weapon": "scepter",
        "stars": "5-star",
        "titles": (
            "Diamond Stargazer", "Prismatic Acolyte", "Mirror of the Clear Heavens",
            "Priestess of the Polished Void", "Sovereign of the Diamond Firmament",
            "The Starlight Beyond the Prism",
        ),
        "skills": (
            "Diamond Equilibrium", "Piercing Luminescence", "Prism of Serenity",
            "Judgment of the Obsidian Dawn",
        ),
    },
}

KHARONITE_FORMS = (
    "Kharonite",
    "Facet of the Dark Sun, Kharonite",
    "Knight of the Cleaved Diamond, Kharonite",
    "Colossus of the Obsidian Core, Kharonite",
    "Monarch of the Black Prism, Kharonite",
    "The Sovereign Beyond the Diamond Light, Kharonite",
)

BLACK_DIAMOND_MATERIALS = (
    "Shard of Black Diamond",
    "Facet of Black Diamond",
    "Cluster of Black Diamond",
    "Brilliant of Black Diamond",
    "Heart of Black Diamond",
    "Matrix of Black Diamond",
)


def prompts(path):
    text = path.read_text(encoding="utf-8")
    return text, [body for body in BLOCK.findall(text) if "--niji" in body]


class BlackDiamondsArtPromptTests(unittest.TestCase):
    def test_all_character_packs_exist_and_have_exact_prompts(self):
        for name, spec in CHARACTERS.items():
            with self.subTest(character=name):
                path = art_path("characters", f"{name} Art.md", root=ROOT)
                self.assertTrue(path.exists(), f"{path} should exist")
                text, bodies = prompts(path)
                self.assertEqual(len(bodies), 13, f"{name} should have 13 prompts")
                self.assertEqual(len(re.findall(r"Suggested asset ID: `[^`]+`", text)), 13)
                self.assertIn(f"**{spec['stars']} Element-Bearer**", " ".join(text.split()))

                headings = re.findall(r"^### Evo\.\d / \w+ - (.+)$", text, re.M)
                self.assertEqual(len(headings), 6)
                self.assertEqual(
                    [heading.split(", ", 1)[0] for heading in headings],
                    list(spec["titles"]),
                )

                # Character forms check
                expected_ensemble_pcts = ["50 percent", "60 percent", "72 percent", "84 percent", "94 percent", "96 percent"]
                expected_margin_pcts = ["25 percent", "20 percent", "14 percent", "8 percent", "3 percent", "2 percent"]

                for index, body in enumerate(bodies[:6]):
                    positive = body.split(" --", 1)[0]
                    self.assertIn(spec["element"], positive)
                    self.assertIn(spec["gender"], positive)
                    self.assertIn("pale white skin", positive)
                    self.assertIn("etchings", positive)
                    self.assertIn("eyes only with no other facial features", positive)
                    self.assertIn("facing left", positive)
                    self.assertIn("margin", positive)
                    self.assertIn(spec["weapon"], positive)
                    self.assertEqual(re.search(r"--ar (\S+)", body).group(1), "4:3")
                    self.assertRegex(body, r" --sref https://\S+ --sw 150$")

                    # D-131 Spacing and D-135 containment
                    self.assertIn(expected_ensemble_pcts[index], positive)
                    self.assertIn(expected_margin_pcts[index], positive)
                    self.assertIn(
                        "continuous visible solid-background safety margin on all four sides and corners",
                        positive,
                    )
                    self.assertIn("nothing touches crosses or disappears beyond the frame edges", positive)
                    self.assertIn("open gaps separate limbs weapon and powers without crossing the eyes or hiding equipment", positive)
                    self.assertIn("preserve readable layers", positive)

                    # Ensure purposeful chaos wording is removed in favor of clean Rose style
                    self.assertNotIn("purposeful chaos", positive)
                    self.assertNotIn("purposeful design", positive)

                    # Body height scaling
                    if index < 4:
                        self.assertIn("body one third of canvas height", positive)
                    elif index == 4:
                        self.assertIn("one quarter of canvas height", positive)
                    else:
                        self.assertIn("one fifth of canvas height", positive)

                    # Natural Rose-style structural progression
                    if index == 4:  # Legendary
                        self.assertIn("metal armor", positive)
                        self.assertIn("8 floating black diamond gemstones circling the character", positive)
                        self.assertIn("overlapping powers fill rear interior gaps", positive)
                    elif index == 5:  # Omnic final form
                        self.assertIn("metal armor", positive)
                        self.assertIn("black and white and red", positive)
                        self.assertIn("twelve elemental black diamond gemstones floating and circling", positive)
                        self.assertIn("full-view", positive)
                        self.assertIn("densely occupying nearly all interior space behind character and wings while leaving clear face hands and full weapon windows", positive)

                # Icons check
                icon_headings = re.findall(r"^### (?:Passive|Skill 1|Skill 2|Last Flare) - (.+)$", text, re.M)
                self.assertEqual(icon_headings, list(spec["skills"]))
                for body in bodies[6:12]:
                    self.assertIn("--ar 1:1", body)
                    self.assertIn("two thirds", body)
                    self.assertNotIn("--sref", body)

                # Signature weapon check
                self.assertIn("--ar 3:2", bodies[12])
                self.assertIn(spec["weapon"], bodies[12])
                self.assertNotIn("--sref", bodies[12])

    def test_creatures_materials_and_scenery_pack(self):
        path = art_path("creatures", "Black Diamonds Against The Light.md", root=ROOT)
        self.assertTrue(path.exists(), "Black Diamonds Against The Light.md must exist")
        text, bodies = prompts(path)
        self.assertEqual(len(bodies), 15, "Event pack should have 15 prompts")

        # 6 Kharonite creature forms
        for form, body in zip(KHARONITE_FORMS, bodies[:6]):
            with self.subTest(form=form):
                self.assertIn(form, text)
                self.assertIn("facing right", body)
                self.assertIn("chibi diamond crystal creature", body)
                self.assertIn("two clear crimson eyes only with no other facial features", body)
                self.assertIn("one third of canvas height", body)
                self.assertIn("--ar 4:3", body)
                self.assertNotIn("--sref", body)

        # 6 Black diamond materials
        for name, body in zip(BLACK_DIAMOND_MATERIALS, bodies[6:12]):
            with self.subTest(material=name):
                self.assertIn(f"### {name}", text)
                self.assertIn("--ar 1:1", body)
                self.assertIn("two thirds", body)
                self.assertIn("face-free", body)
                self.assertNotIn("--sref", body)

        # 3 Scenery pieces
        self.assertIn("--ar 3:1", bodies[12])  # Header
        self.assertIn("--ar 16:9", bodies[13])  # Arena
        self.assertIn("--ar 16:9", bodies[14])  # Summoning banner
        self.assertIn("full-bleed", bodies[12])
        self.assertIn("full-bleed", bodies[13])
        self.assertIn("full-bleed", bodies[14])
        for body in bodies[12:]:
            self.assertNotIn("--sref", body)
            self.assertNotIn("plain solid green", body)


if __name__ == "__main__":
    unittest.main()
