"""Profile generation contracts; no network, images or runtime changes."""
from pathlib import Path
import re
import unittest

from character_palette import PALETTES

ROOT = Path(__file__).resolve().parent.parent
PACK = ROOT / "Art" / "characters" / "Element-Bearer Profile Pictures.md"
GUIDE = ROOT / "Art" / "guides" / "midjourney-character-style-prompt.md"
BLOCK = re.compile(
    r"^### (\w+) — (Base|Omnic) · `(profile:[a-z]+:(?:base|omnic))`"
    r"\n\n```text\n(.*?)\n```", re.M | re.S
)
CHARACTERS = {
    "Infernis": ("ember", "green", "#00FF00"),
    "Tizu": ("tide", "magenta", "#FF00FF"),
    "Flora": ("sprout", "blue", "#0000FF"),
    "Rosetta": ("rosetta", "green", "#00FF00"),
    "Thornia": ("thornia", "green", "#00FF00"),
    "Crinso": ("crinso", "green", "#00FF00"),
    "Atmoso": ("atmoso", "orange", "#FF8000"),
    "Aurora": ("aurora", "magenta", "#FF00FF"),
    "Bliss": ("bliss", "green", "#00FF00"),
    "Bruno": ("bruno", "magenta", "#FF00FF"),
    "Disciple": ("disciple", "blue", "#0000FF"),
    "Elise": ("elise", "orange", "#FF8000"),
    "Razor": ("razor", "green", "#00FF00"),
    "Nerithe": ("nerithe", "orange", "#FF8000"),
    "Orvella": ("orvella", "green", "#00FF00"),
    "Vaelor": ("vaelor", "orange", "#FF8000"),
}
SIGNATURES = {
    "Infernis": ("copper-red", "amber eyes only", "greatsword", "red scarf"),
    "Tizu": ("short blue hair", "blue eyes only", "spear", "blue sash"),
    "Flora": ("moss-green", "green eyes only", "bow", "green neckerchief"),
    "Rosetta": ("deep-crimson bob", "ivory rose clip", "crimson eyes only", "longbow"),
    "Thornia": ("dark hair", "crimson rose clasp", "crimson eyes only", "greatsword"),
    "Crinso": ("tousled dark hair", "crimson eyes only", "single central grip",
               "two opposed", "continuous rose-gold spine"),
    "Atmoso": ("silver-gray hair", "teal eyes only", "sky-blue", "staff"),
    "Aurora": ("pearl-white chin-length bob", "amber eyes only", "ivory neck ribbon",
               "empty open palms", "lens"),
    "Bliss": ("ivory hair", "two low swept buns", "pale-blue eyes only",
              "rose neck ribbon", "exactly two", "warfan"),
    "Bruno": ("dark-brown swept-back hair", "amber eyes only", "ochre",
              "double-faced", "hammer"),
    "Disciple": ("plum-black hair swept upward", "violet eyes only",
                 "scarlet shoulder cord", "empty open palms"),
    "Elise": ("short black hair", "lime-green eyes only", "mint wrist ribbons",
              "exactly two", "four-point", "shuriken", "open central grip"),
    "Razor": ("ink-black hair", "silver forelock", "violet eyes only",
              "black neck scarf", "sword of pure night", "opaque ink-black blade"),
    "Nerithe": ("ink-blue", "amber eyes only", "tide-compass",
                "surveyor trident", "circular measuring guard", "separated tines"),
    "Orvella": ("cropped obsidian hair", "copper eyes only", "plumbline scepter",
                "physical hanging keystone", "triangular head"),
    "Vaelor": ("swept silver hair", "navy streak", "violet eyes only",
               "tuning-fork polearm", "two equal prongs", "clear crossbrace"),
}
OMNIC = {
    "Infernis": ("six layered flame-feather wings", "seraph-wing crossguard", "phoenix"),
    "Tizu": ("six opalescent wave-fin wings", "shell", "tidal crescents"),
    "Flora": ("six layered leaf-feather wings", "worldbloom", "floral halos"),
    "Rosetta": ("sixteen", "nine-petal crown", "thorn lattice", "rose mandalas"),
    "Thornia": ("sixteen", "nine-rose crown", "thorn diadem", "eclipse rings"),
    "Crinso": ("sixteen", "gold-flame crimson-lightning", "nested rose hub"),
    "Atmoso": ("eight wind-crystal wings", "seven-vane crown", "skywheel", "twelve"),
    "Aurora": ("twelve solar-lens wings", "seven-point lens crown", "solar verdict"),
    "Bliss": ("twelve wings", "seven-feather crown", "three tiered", "waterfall"),
    "Bruno": ("eight mineral wings", "seven-spire crown", "worldwall", "citadel head"),
    "Disciple": ("twelve psychic-flame wings", "seven-point mindcrown",
                 "three violet lattice tiers", "ally empowerment"),
    "Elise": ("eight lightning-crystal wings", "seven-point lightning crown",
              "thunderwheel", "three nested", "circuit collars"),
    "Razor": ("twelve crescent shield wings", "seven-point eclipse crown",
              "five stepped ridges", "three amethyst hilt clasps"),
    "Nerithe": ("three nested folded-ocean crowns", "twelve overlapping",
                "nautilus", "sea-map engine"),
    "Orvella": ("three nested foundation crowns", "twelve offset buttress columns",
                "geode vault", "tessellated"),
    "Vaelor": ("three overlapping resonator crowns", "twelve off-axis fork arrays",
               "eight drum capacitors", "storm-orchestra"),
}


class ProfilePictureArtTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = PACK.read_text(encoding="utf-8")
        cls.blocks = BLOCK.findall(cls.text)

    def test_exact_roster_pairs_metadata_and_live_starter_ids(self):
        live = {}
        for filename in ("starters.ts", "flagships.ts", "war-characters.ts"):
            content = (ROOT / "src" / "content" / filename).read_text(encoding="utf-8")
            live.update(re.findall(r"id: '([^']+)',\s*stars: \d+,\s*name: '([^']+)'",
                                   content))
        self.assertEqual({value[0]: name for name, value in CHARACTERS.items()}, live)
        self.assertEqual(len(self.blocks), 32)
        self.assertEqual(self.text.count("```text\n"), 32)
        expected = {f"profile:{identity}:{form}" for identity, _, _ in
                    CHARACTERS.values() for form in ("base", "omnic")}
        self.assertEqual({key for _, _, key, _ in self.blocks}, expected)
        self.assertEqual(len({key for _, _, key, _ in self.blocks}), 32)
        for name, (identity, color, hex_color) in CHARACTERS.items():
            self.assertIn(f"| {name} | {identity} | profile:{identity}:base | "
                          f"profile:{identity}:omnic |", self.text)
            self.assertIn(f"| {color} {hex_color} |", self.text)
            self.assertEqual(sum(bearer == name for bearer, _, _, _ in self.blocks), 2)

    def test_exact_mapped_references_square_flags_and_word_budget(self):
        references = dict(re.findall(r"^\| ([16]) \| (https://\S+) \|$",
                                     GUIDE.read_text(encoding="utf-8"), re.M))
        for name, form, key, prompt in self.blocks:
            with self.subTest(profile=key):
                self.assertTrue(prompt.endswith(
                    f" --sref {references['1' if form == 'Base' else '6']} --sw 150"))
                for flag in ("ar", "niji", "s", "q", "no", "sref", "sw"):
                    self.assertEqual(len(re.findall(rf"--{flag}\s", prompt)), 1)
                self.assertIn("--ar 1:1 --niji 6 --s 100 --q 1", prompt)
                self.assertLessEqual(len(prompt.split(" --", 1)[0].split()), 380)
                self.assertEqual(key, f"profile:{CHARACTERS[name][0]}:{form.lower()}")

    def test_portrait_renderer_coverage_margins_and_no_glow(self):
        anchors = ("head-and-shoulders profile portrait", "fully covered human",
                   "eyes only", "no other facial features", "rounded oversized head",
                   "compact chibi shoulders", "clean precise contours", "crisp cel shading",
                   "non-emissive painted highlights", "jewel-like colors",
                   "face unobstructed", "inside clear safety margins", "central 80 percent",
                   "continuous visible 10 percent solid-key margin",
                   "all sides and corners", "nothing touches crosses or disappears beyond edges",
                   "flat unlit color edge to edge and through all openings",
                   "subject colors unchanged", "no glows or glowing visual effects",
                   "opaque hard-edged powers")
        for _, _, key, prompt in self.blocks:
            with self.subTest(profile=key):
                for anchor in anchors:
                    self.assertIn(anchor, prompt)
                positive, negatives = prompt.split(" --no ", 1)
                for exclusion in ("nose", "mouth", "eyebrows", "realism", "text",
                                  "letters", "logo", "watermark", "scenery",
                                  "gradient", "background gradient", "textured background",
                                  "photorealism", "3d render", "glow", "light bloom",
                                  "haze", "cropped tips"):
                    self.assertIn(exclusion, negatives.split(" --sref ", 1)[0].split(", "))
                design = positive.split(", plain solid", 1)[0]
                self.assertNotRegex(design, r"\b(?:glowing|realistic|photorealistic)\b")

    def test_palette_specific_key_exemption_and_reference_color_remapping(self):
        for name, _, key, prompt in self.blocks:
            with self.subTest(profile=key):
                color, hex_color = CHARACTERS[name][1:]
                self.assertIn(f"plain solid {color} background ({hex_color})", prompt)
                positive = prompt.split(" --ar ", 1)[0]
                self.assertIn(f"subject palette ONLY {PALETTES[name][0]}", positive)
                self.assertIn("remap reference colors", positive)
                design = positive.split(", plain solid", 1)[0]
                negative_colors = prompt.split(" --no ", 1)[1].split(", text,", 1)[0]
                for unwanted in PALETTES[name][1].split(", "):
                    self.assertNotRegex(design, rf"\b{re.escape(unwanted)}\b")
                    if unwanted != color:
                        self.assertIn(unwanted, negative_colors.split(", "))
                self.assertNotIn(color, negative_colors.split(", "))

    def test_base_identity_and_authored_omnic_architecture(self):
        for name, form, key, prompt in self.blocks:
            with self.subTest(profile=key):
                for anchor in SIGNATURES[name]:
                    self.assertIn(anchor, prompt)
                if form == "Base":
                    self.assertIn("no evolved armor", prompt)
                    self.assertNotRegex(prompt, r"\b(?:supreme|monumental|prismatic armor)\b")
                else:
                    self.assertIn("supreme", prompt)
                    for anchor in OMNIC[name]:
                        self.assertIn(anchor, prompt)

    def test_generation_only_and_reference_expiry_contract(self):
        for anchor in ("No images are generated", "planned profile identifiers",
                       "links may expire", "refreshed owner-supplied URLs",
                       "never invent or silently substitute", "cannot guarantee model compliance"):
            self.assertIn(anchor, self.text)
        self.assertNotIn("public/assets", self.text)
        self.assertNotIn("--ar 4:3", self.text)


if __name__ == "__main__":
    unittest.main()
