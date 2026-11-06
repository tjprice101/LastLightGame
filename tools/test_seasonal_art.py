import re
import unittest

from build_calamitic_art import references
import build_moon_banner_art as moon
import build_sunshade_banner_art as sun
import build_seasonal_event_art as events


class SeasonalArtTests(unittest.TestCase):
    def test_reproduction_and_exact_inventory(self):
        for pack, count in ((moon, 98), (sun, 97), (events, 24)):
            with self.subTest(pack=pack.__name__):
                self.assertEqual(len(pack.blocks()), count)
                self.assertEqual(pack.OUTPUT.read_text(encoding="utf-8"), pack.document())
        rows = moon.blocks() + sun.blocks() + events.blocks()
        self.assertEqual(len(rows), 219)
        self.assertEqual(len({row[0] for row in rows}), 219)
        required = [row for row in rows if not row[0].endswith("-weapon.png")]
        self.assertEqual(len(required), 207)
        checklist = (moon.ROOT / "docs" / "remaining-expansion-art.md").read_text(encoding="utf-8")
        self.assertRegex(checklist, r"## Total images needed\n\n\*\*207 required images\.\*\*")
        self.assertTrue(checklist.rstrip().endswith("**219 images including every optional illustration.**"))

    def test_sun_approved_features_and_ability_identity(self):
        approved = moon.approved_sections(sun.CHARACTERS)
        prompts = {asset: prompt for asset, _, prompt, _ in sun.blocks()}
        for character in sun.CHARACTERS:
            fixed, forms = approved[character["slug"]]
            for stage, form in enumerate(forms, 1):
                prompt = prompts[f"{character['slug']}-{stage}.png"]
                self.assertIn(fixed, prompt)
                self.assertIn(form, prompt)
                self.assertIn(character["weapon"], prompt)
                self.assertTrue(prompt.endswith(f"--sref {references()[stage]} --sw 150"))
            for action, _, symbol in character["icons"]:
                prompt = prompts[f"{character['slug']}-{action}.png"]
                self.assertIn(symbol, prompt)
                self.assertIn(character["icon_identity"], prompt)
                self.assertIn("object-only", prompt)
                self.assertNotIn("--sref", prompt)

    def test_names_are_distinct_and_symbolic(self):
        names = {c["name"].casefold() for c in moon.CHARACTERS + sun.CHARACTERS}
        titles = [title for c in moon.CHARACTERS + sun.CHARACTERS for title in c["titles"]]
        self.assertEqual(len(titles), len(set(titles)))
        banner_modes = ("Glow of the Moon's Light", "The Angel-blazened Sunshade",
                        "The Harbor of Unreturned Names", "Beneath the Borrowed Dawn")
        for label in banner_modes:
            self.assertNotIn(label.casefold(), names)
            self.assertNotIn(label, titles)
        self.assertIn("harbor", events.FAMILIES[0]["identity"])
        self.assertIn("solar", events.FAMILIES[1]["identity"])

    def test_reference_scope_clearance_and_word_limit(self):
        for asset, _, prompt, _ in moon.blocks() + sun.blocks() + events.blocks():
            with self.subTest(asset=asset):
                self.assertLessEqual(len(prompt.split(" --ar")[0].split()), 380)
                portrait = re.fullmatch(r"(?:maerion|caevren|vespera|ilyss|asteriel|serapha|rhaziel|oryn|thessara|elaris|veyr|aureth)-[1-6]\.png", asset)
                if not portrait:
                    self.assertNotIn("--sref", prompt)
                    self.assertNotIn("--sw", prompt)
                if "--ar 1:1" in prompt or "--ar 4:3" in prompt:
                    self.assertIn("continuous empty15 percent border", prompt)
                    self.assertIn("safety margin", prompt)
                    self.assertIn("plain solid green background (#00FF00)", prompt)
                    self.assertIn("glow on edges", prompt.split(" --no ", 1)[1])
                    self.assertNotIn("green", prompt.split(" --no ", 1)[1].split(", "))
                else:
                    self.assertIn("full-bleed", prompt)

    def test_event_species_and_material_chain(self):
        rows = events.blocks()
        for family in events.FAMILIES:
            enemies, materials = events.rows_for(family)
            self.assertEqual(tuple(row[0] for row in enemies), moon.RARITIES)
            self.assertEqual(tuple(row[0] for row in materials), events.TIERS)
            for asset, _, prompt, _ in rows:
                if asset.startswith(family["slug"] + "-"):
                    self.assertIn(family["identity"], prompt)
                    self.assertNotIn("object-only", prompt)
                    self.assertNotIn("--sref", prompt)

    def test_every_character_object_inherits_its_own_materials_and_power_shapes(self):
        count = 0
        for pack in (moon, sun):
            rows = pack.blocks()
            for character in pack.CHARACTERS:
                slug = character["slug"]
                owned = [prompt for asset, _, prompt, _ in rows
                         if "--ar 1:1" in prompt and (
                             asset.startswith((slug + "-", "master-" + slug + "-"))
                             or asset.startswith(("moon-status-" + slug + "-", "sunshade-status-" + slug + "-")))]
                self.assertGreaterEqual(len(owned), 8)
                for prompt in owned:
                    count += 1
                    with self.subTest(owner=slug, prompt=prompt[:65]):
                        lunar = pack is moon and slug in moon.LUNAR_OWNERS
                        identity = moon.LUNAR_IDENTITY[slug] if lunar else character["icon_identity"]
                        self.assertIn(identity, prompt)
                        self.assertIn("green key is background only", prompt.lower())
                        if lunar:
                            self.assertIn("deep-blue and bright vibrant purple", prompt)
                            self.assertNotIn("purple effects", prompt.split(" --no ", 1)[1])
                        self.assertNotIn("jewel-like saturated colors", prompt)
                        self.assertNotIn("silver faceted cores", prompt)
                        self.assertNotIn("crystal reactor", prompt)
                        self.assertNotIn("--sref", prompt)
                        self.assertIn("object-only", prompt)
                        if slug == "caevren":
                            self.assertIn("smooth dark spherical counterweight", prompt)
        self.assertEqual(count, 117)

    def test_owner_approved_celestial_colors_are_not_excluded(self):
        for pack, colors in ((moon, ("deep-blue", "purple")), (sun, ("deep-orange", "pearlescent"))):
            for asset, _, prompt, _ in pack.blocks():
                if pack is moon and not any(
                    asset.startswith((owner + "-", "master-" + owner + "-", "moon-status-" + owner + "-"))
                    for owner in moon.LUNAR_OWNERS):
                    continue
                with self.subTest(asset=asset):
                    positive, negative = prompt.split(" --no ", 1)
                    for color in colors:
                        self.assertIn(color, positive.lower())
                    self.assertNotIn("pink effects", negative)
                    if pack is moon:
                        self.assertNotIn("purple effects", negative)
                        self.assertNotIn("blue effects", negative)
                    self.assertNotIn("personal Master", positive)
                    self.assertNotIn("Conduit", positive)
                    if asset.startswith("master-"):
                        self.assertIn("mechanical", positive)
                        self.assertRegex(positive.lower(), r"gear|rotor|piston|axle")

    def test_reworked_moon_trio_keep_individual_moon_architecture(self):
        prompts = {asset: prompt for asset, _, prompt, _ in moon.blocks()}
        for owner, signature in (("ilyss", "shear"), ("asteriel", "seed"), ("serapha", "scepter")):
            for stage in range(1, 7):
                prompt = prompts[f"{owner}-{stage}.png"]
                self.assertIn(signature, prompt)
                self.assertIn("moon", prompt.lower())
                self.assertIn("Black primary", prompt)
            self.assertIn("huge", prompts[f"{owner}-6.png"].lower())


if __name__ == "__main__":
    unittest.main()
