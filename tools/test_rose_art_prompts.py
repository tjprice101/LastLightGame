"""Focused structure checks for the crimson rose event and character art packs."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "Art"
BLOCK = re.compile(r"```(?:text)?\n(.*?)\n```", re.S)
FLAGS = ("--ar", "--niji", "--s", "--q", "--no")
SHARED_CUTOUT = (
    "clean precise anime contours",
    "crisp cel shading",
    "painted highlights",
    "plain solid ",
    "#00FF00",
    "flat unlit color edge to edge",
    "no glows or glowing visual effects",
    "non-emissive painted highlights",
)
CHARACTERS = {
    "Rosetta": {
        "gender": "female", "element": "Luminous", "weapon": "longbow",
        "stars": "6-star", "wings": ("4", "8", "16"),
        "titles": (
            "Gilded Rose", "Gilded Vow", "Daybreak Archer", "Seraph of Virtue",
            "Sovereign of Passion", "The Rose Beyond the Sun",
        ),
        "skills": (
            "Virtuous Bloom", "Golden Thorn Volley", "Crimson Skyfall",
            "Rose Beyond the Sun",
        ),
    },
    "Thornia": {
        "gender": "female", "element": "Ominous", "weapon": "greatsword",
        "stars": "6-star", "wings": ("4", "8", "16"),
        "titles": (
            "Burdened by Thorns", "Gilded Squire", "Forbidden Rose Knight",
            "Warden of the Shadow Garden", "Queen of Golden Shadows",
            "The Thousand-Rose Empress",
        ),
        "skills": (
            "Forbidden Garden", "Gilded Thorn Guard", "Shadow Rose Cleave",
            "Thousand-Rose Dominion",
        ),
    },
    "Crinso": {
        "gender": "male", "element": "Chaotic", "weapon": "double-ended",
        "stars": "6-star", "wings": ("4", "8", "16"),
        "titles": (
            "Rosebound Page", "Duality Initiate", "Crimson-Gold Knight",
            "Storm of the Twin Rose", "Sovereign of Beautiful Ruin",
            "The Rose Beyond Duality",
        ),
        "skills": (
            "Rose Duality", "Golden Edge", "Crimson Rupture",
            "Blossoming Cataclysm",
        ),
    },
}
ROSELIUS_FORMS = (
    "Roselius",
    "Votive of Golden Thorns, Roselius",
    "Knight of the Crimson Bloom, Roselius",
    "Seraph of Passion, Roselius",
    "Sovereign of the Living Rose, Roselius",
    "The Garden Beyond Eternity, Roselius",
)


def prompts(path):
    text = path.read_text(encoding="utf-8")
    return text, [body for body in BLOCK.findall(text) if "--niji" in body]


class RoseArtPromptTests(unittest.TestCase):
    def test_form_headings_match_owner_delivered_titles(self):
        for name, spec in CHARACTERS.items():
            text = (ART / f"{name} Art.md").read_text(encoding="utf-8")
            headings = re.findall(r"^### Evo\.\d / \w+ - (.+)$", text, re.M)
            self.assertEqual(headings, [f"{title}, {name}" for title in spec["titles"]])

    def test_character_packs_have_exact_forms_icons_and_weapons(self):
        for name, spec in CHARACTERS.items():
            with self.subTest(character=name):
                path = ART / f"{name} Art.md"
                text, bodies = prompts(path)
                self.assertEqual(len(bodies), 13)
                self.assertEqual(len(re.findall(r"Suggested asset ID: `[^`]+`", text)), 13)
                self.assertIn(
                    f"**{spec['stars']} Element-Bearer**",
                    " ".join(text.split()),
                )
                self.assertNotIn("--sref", "\n".join(bodies))
                self.assertIn("<approved_reference_image_url>", text)

                headings = re.findall(r"^### Evo\.\d / \w+ - (.+)$", text, re.M)
                self.assertEqual(len(headings), 6)
                self.assertEqual(
                    [heading.split(", ", 1)[0] for heading in headings],
                    list(spec["titles"]),
                )
                for index, body in enumerate(bodies[:6]):
                    positive = body.split(" --", 1)[0]
                    elements = {"Rosetta": "light-element", "Thornia": "shadow-element", "Crinso": "chaotic-element"}
                    identity = (elements[name], "eyes only with no other facial features", "one third")
                    for anchor in (*identity, spec["gender"], "margin"):
                        self.assertIn(anchor, positive)
                    self.assertTrue("facing left" in positive or "left-facing" in positive)
                    self.assertEqual(re.search(r"--ar (\S+)", body).group(1), "4:3")
                    self.assertIn(spec["weapon"], positive)
                    if index == 0:
                        self.assertIn("plain ivory long-sleeved tunic" if name == "Rosetta"
                                      else "plain charcoal long-sleeved tunic", positive)
                        self.assertNotIn("armor", positive)
                    if index == 1:
                        self.assertIn("first forged", positive)
                        self.assertIn("no full wings yet", positive)
                    if index == 2:
                        self.assertIn("complete battle armor", positive)
                        self.assertIn("two short crystal winglets", positive)
                    if index >= 3:
                        self.assertIn("fully prismatic armor", positive)
                    if index in (3, 4, 5):
                        count = spec["wings"][index - 3]
                        self.assertRegex(positive, rf"\b{count} immense\b")
                    if index == 5:
                        self.assertIn("supreme", positive)
                        self.assertIn("transcendent", positive)
                        self.assertIn("swirling", positive)
                        self.assertIn("full-body", positive)

                icon_headings = re.findall(r"^### (?:Passive|Skill 1|Skill 2|Last Flare) - (.+)$", text, re.M)
                self.assertEqual(icon_headings, list(spec["skills"]))
                for heading, body in zip(spec["skills"], bodies[6:10]):
                    self.assertIn(elements[name] + " ability icon", body)
                    self.assertIn("--ar 1:1", body)
                    self.assertIn("two thirds", body)
                for body in bodies[10:12]:
                    self.assertIn("--ar 1:1", body)
                self.assertIn("--ar 3:2", bodies[12])
                self.assertIn(spec["weapon"], bodies[12])
                if name == "Crinso":
                    for body in bodies[:6] + bodies[12:]:
                        positive = body.split(" --", 1)[0].lower()
                        self.assertIn("one", positive)
                        self.assertTrue("single" in positive or "exactly one" in positive)
                        self.assertIn("double-ended", positive)
                        self.assertIn("two-edged", positive)
                        self.assertNotIn("twin swords", positive)

    def test_rosetta_restores_compact_anatomy_and_amplifies_effect_splendor(self):
        text, bodies = prompts(ART / "Rosetta Art.md")
        renderer = ("clean precise anime contours crisp cel shading smooth painted highlights jewel-like "
                    "saturated deep crimson antique gold pearlescent ivory and rose colors")
        anatomy = ("compact chibi rounded oversized head tiny torso short limbs "
                   "2.5 to 3 heads tall, body one third of canvas height")
        for index, body in enumerate(bodies):
            positive, negatives = body.split(" --no ", 1)
            positive = positive.split(" --", 1)[0]
            with self.subTest(block=index + 1):
                self.assertLessEqual(len(positive.split()), 350)
                self.assertIn(renderer, positive)
                self.assertNotRegex(positive, r"\b(?:Rosetta|Common|Omnic|six-star|runes)\b")
                self.assertIn("through all openings", positive)
                self.assertIn("nothing touches the frame edges", positive)
                for word in ("text", "letters", "lettering", "words", "numbers", "typography",
                             "captions", "labels", "signatures", "runes", "logo", "watermark"):
                    self.assertIn(word, negatives.split(", "))
                if index < 6:
                    for anchor in (anatomy, "deep-crimson bob ivory rose clip",
                                   "crimson eyes only with no other facial features", "taut crimson string",
                                   "one nocked ivory arrow", "without crossing the eyes or hiding equipment"):
                        self.assertIn(anchor, positive)
                    self.assertNotRegex(positive, r"elongated|longer armored limbs|body half|two fifths")
                else:
                    self.assertIn("two thirds", positive)
        late = [body.split(" --", 1)[0] for body in bodies[4:6]]
        for body in late:
            for anchor in ("divided royal crimson mantle lined ivory", "airborne twisting draw with one knee raised",
                           "upper pair rising middle pairs spreading lower pair sweeping down",
                           "high petal collar", "rose-canopy pauldrons"):
                self.assertIn(anchor, body)
        for anchor in ("eight principal wings in four expanded pairs", "eight shorter auxiliary wings",
                       "waterfall petal pennants", "open nine-petal rose crown", "three broken gold orbital sun-rings",
                       "nine separated ivory roses", "six sweeping crimson petal ribbons",
                       "layered open arches",
                       "triple thorn limb arches", "nested open rose-lens sight", "spanning two body heights"):
            self.assertIn(anchor, late[1])
            self.assertNotIn(anchor, late[0])
        for anchor in ("triple thorn limb arches", "nested open rose-lens sight"):
            self.assertIn(anchor, bodies[12])
        self.assertIn("three broken gold orbital sun-rings", bodies[9])
        for index, anchor in ((2, "three ivory rose fragments"), (3, "two sweeping crimson petal ribbons"),
                              (4, "four sweeping crimson petal ribbons"),
                              (4, "broad gold thorn fans frame the wings")):
            self.assertIn(anchor, bodies[index])
        self.assertIn("Pause for owner review of Rosetta", text)

    def test_rosetta_late_resplendence_fills_canvas_without_changing_anatomy(self):
        _, bodies = prompts(ART / "Rosetta Art.md")
        chromatic = "rose-violet sapphire-blue and warm opal chromatic facets"
        for index, (coverage, margin) in enumerate(zip((50, 60, 72, 84, 94, 96), (25, 20, 14, 8, 3, 2))):
            positive = bodies[index].split(" --", 1)[0]
            for anchor in (
                f"complete artwork ensemble spans {coverage} percent of canvas width and height",
                f"{margin} percent solid background-color margin on all four sides",
                "compact chibi rounded oversized head tiny torso short limbs 2.5 to 3 heads tall",
                "body one third of canvas height",
                "both eyes feet full bow string arrow",
                "without crossing the eyes or hiding equipment",
                "deep crimson antique gold pearlescent ivory and rose colors",
                "nothing touches the frame edges",
            ):
                self.assertIn(anchor, positive)
            self.assertNotIn("generous solid background-color margin", positive)
            self.assertLessEqual(len(positive.split()), 350)
            if index >= 4:
                self.assertIn(chromatic + " on armor wings bow and rings", positive)
                self.assertIn("wings mantle thorn arches ribbons spread toward every side and corner", positive)
        for body in bodies[:4]:
            self.assertNotIn(chromatic, body)
        for index in (9, 12):
            self.assertIn(chromatic, bodies[index])

    def test_rosetta_omnic_adds_dense_rear_effects_without_losing_readability(self):
        _, bodies = prompts(ART / "Rosetta Art.md")
        positive = bodies[5].split(" --", 1)[0]
        for anchor in (
            "extremely busy rear energy tapestry behind character and wings",
            "overlapping rose mandalas branching thorn lattice radial petal rays",
            "counter-sweeping ribbons clustered prism fragments densely occupy nearly all interior space",
            "no large empty patches",
            "narrow key channels and clear face-bow window without crossing the eyes or hiding equipment",
            "body one third of canvas height",
            "2 percent solid background-color margin on all four sides",
            "flat unlit color edge to edge and through all openings",
            "no glows or glowing visual effects",
        ):
            self.assertIn(anchor, positive)
        self.assertLessEqual(len(positive.split()), 350)
        for body in bodies[:5] + bodies[6:]:
            self.assertNotIn("rear energy tapestry", body)

    def test_thornia_phase_retains_compact_identity_and_progressive_canvas_spread(self):
        text, bodies = prompts(ART / "Thornia Art.md")
        renderer = ("clean precise anime contours crisp cel shading smooth painted highlights jewel-like "
                    "saturated charcoal deep crimson antique gold pearlescent ivory and rose colors")
        for index, body in enumerate(bodies):
            positive, negatives = body.split(" --no ", 1)
            positive = positive.split(" --", 1)[0]
            with self.subTest(block=index + 1):
                self.assertLessEqual(len(positive.split()), 350)
                self.assertIn(renderer, positive)
                self.assertNotRegex(positive, r"\b(?:Thornia|Common|Omnic|six-star|runes)\b")
                self.assertIn("nothing touches the frame edges", positive)
                self.assertIn("flat unlit color edge to edge and through all openings", positive)
                self.assertIn("no glows or glowing visual effects", positive)
                self.assertNotIn("green", negatives)
                for word in ("text", "letters", "lettering", "words", "numbers", "typography",
                             "captions", "labels", "signatures", "runes", "logo", "watermark",
                             "nose", "mouth", "eyebrows", "facial markings", "extra weapons"):
                    self.assertIn(word, negatives.split(", "))
                if index < 6:
                    coverage, margin = (50, 60, 72, 84, 94, 96)[index], (25, 20, 14, 8, 3, 2)[index]
                    for anchor in (
                        "dark hair crimson rose clasp narrow crimson eyes only with no other facial features",
                        "compact chibi rounded oversized head tiny torso short limbs 2.5 to 3 heads tall",
                        "body one third of canvas height",
                        f"complete artwork ensemble spans {coverage} percent of canvas width and height",
                        f"{margin} percent solid background-color margin on all four sides",
                        "without crossing the eyes or hiding equipment", "visible grip and complete blade",
                    ):
                        self.assertIn(anchor, positive)
                    self.assertEqual(positive.count("greatsword"), 2)
                    self.assertNotRegex(positive, r"elongated|body half|two fifths")
                else:
                    self.assertIn("two thirds", positive)
        self.assertIn("Pause for owner review of Thornia", text)

    def test_thornia_phase_builds_elegant_shadow_storm_and_retains_final_architecture(self):
        _, bodies = prompts(ART / "Thornia Art.md")
        positive = [body.split(" --", 1)[0] for body in bodies]
        for index, anchors in enumerate((
            ("plain charcoal long-sleeved tunic", "one small dark-steel greatsword"),
            ("first forged armor", "no full wings yet"),
            ("complete battle armor", "two short crystal winglets", "substantial thorn pauldrons",
             "spanning one body height", "three separated thorn spirals"),
            ("4 immense prismatic wings", "one broken gold eclipse ring", "four crimson thorn ribbons"),
            ("8 immense prismatic wings", "two tilted broken gold eclipse rings", "six crimson thorn ribbons",
             "six ivory roses", "spanning one-and-a-half body heights"),
            ("16 immense prismatic wings", "three tilted broken gold eclipse rings", "nine crimson thorn ribbons",
             "nine ivory roses", "spanning two body heights"),
        )):
            for anchor in anchors:
                self.assertIn(anchor, positive[index])
        for body in positive[4:6]:
            for anchor in ("upper pair rising middle pairs spreading lower pair sweeping down",
                           "divided royal charcoal mantle lined crimson", "high thorn collar",
                           "airborne twisting sword sweep with one knee raised", "offset thorn fans",
                           "amethyst rose-violet and warm opal chromatic facets",
                           "wings mantle thorn arches ribbons spread toward every side and corner"):
                self.assertIn(anchor, body)
        for anchor in ("eight principal wings in four expanded pairs", "eight shorter auxiliary wings",
                       "waterfall thorn pennants", "open nine-rose crown", "floating thorn diadem",
                       "interwoven open arches", "monumental branching rose-canopy pauldrons",
                       "triple gold thorn spine nested rose guard"):
            self.assertIn(anchor, positive[5])
            self.assertNotIn(anchor, positive[4])
        self.assertIn("triple gold thorn spine nested rose guard", positive[12])
        for anchor in ("three tilted broken gold eclipse rings", "offset thorn fans"):
            self.assertIn(anchor, positive[9])
        for index in (2, 3, 4, 5):
            self.assertIn("gold fracture seams", positive[index])
        for body in positive[3:6]:
            self.assertIn("torso shoulders arms hands hips thighs knees shins and feet", body)

    def test_crinso_phase_keeps_compact_identity_connected_weapon_and_canvas_spread(self):
        text, bodies = prompts(ART / "Crinso Art.md")
        renderer = ("clean precise anime contours crisp cel shading smooth painted highlights jewel-like "
                    "saturated charcoal deep crimson antique gold pearlescent ivory and rose colors")
        weapon = ("exactly one connected double-ended two-edged sword with single central grip "
                  "two opposed blades and continuous rose-gold spine")
        for index, body in enumerate(bodies):
            positive, negatives = body.split(" --no ", 1)
            positive = positive.split(" --", 1)[0]
            with self.subTest(block=index + 1):
                self.assertLessEqual(len(positive.split()), 350)
                self.assertIn(renderer, positive)
                self.assertIn("nothing touches the frame edges", positive)
                self.assertIn("subject colors unchanged", positive)
                self.assertNotRegex(positive, r"\b(?:Crinso|Common|Omnic|six-star|runes)\b")
                self.assertNotIn("green", negatives.split(", "))
                for word in ("text", "letters", "lettering", "words", "numbers", "typography",
                             "captions", "labels", "signatures", "runes", "logo", "watermark",
                             "nose", "mouth", "eyebrows", "facial markings",
                             "two separate swords", "twin weapons", "extra weapons"):
                    self.assertIn(word, negatives.split(", "))
                if index < 6:
                    coverage, margin = (50, 60, 72, 84, 94, 96)[index], (25, 20, 14, 8, 3, 2)[index]
                    for anchor in (
                        "tousled dark hair crimson rose tie crimson eyes only with no other facial features",
                        "compact chibi rounded oversized head tiny torso short limbs 2.5 to 3 heads tall",
                        "body one third of canvas height", weapon,
                        "without crossing the eyes or hiding equipment",
                        f"complete artwork ensemble spans {coverage} percent of canvas width and height",
                        f"{margin} percent solid background-color margin on all four sides",
                    ):
                        self.assertIn(anchor, positive)
                    self.assertEqual(positive.count("exactly one connected double-ended"), 1)
                    self.assertNotRegex(positive, r"elongated|body half|two fifths")
                else:
                    self.assertIn("two thirds", positive)
        self.assertIn(weapon, bodies[12])
        self.assertIn("Pause for owner review of Crinso", text)

    def test_crinso_phase_escalates_duality_and_retains_final_rose_weapon_architecture(self):
        _, bodies = prompts(ART / "Crinso Art.md")
        positives = [body.split(" --", 1)[0] for body in bodies]
        for index, anchors in enumerate((
            ("plain charcoal long-sleeved tunic", "short simple blades", "gold flame tongue and crimson zigzag"),
            ("first forged armor", "contrasting gold and crimson edges", "no full wings yet"),
            ("complete battle armor", "gold fracture seams", "two short crystal winglets",
             "closed rose hub spanning one body height"),
            ("4 immense prismatic wings", "half-open rose hub", "one tilted broken rose-ring",
             "four counter-sweeping gold flame ribbons and crimson lightning zigzags"),
            ("8 immense prismatic wings", "open rose hub spanning one-and-a-half body heights",
             "two tilted broken rose-rings", "six counter-sweeping flame-lightning ribbons"),
            ("16 immense prismatic wings", "fully blossomed nested rose hub spanning two body heights",
             "three tilted broken rose-rings", "nine counter-sweeping flame-lightning ribbons"),
        )):
            for anchor in anchors:
                self.assertIn(anchor, positives[index])
        for body in positives[4:6]:
            for anchor in ("upper pair rising middle pairs spreading lower pair sweeping down",
                           "divided royal charcoal mantle lined crimson", "high petal collar",
                           "airborne twisting sword sweep one knee raised weapon beside body",
                           "opposed gold-flame and crimson-lightning petal vanes", "offset thorn fans",
                           "rose-violet sapphire-blue and warm opal facets",
                           "wings mantle thorn arches ribbons spread toward every side and corner"):
                self.assertIn(anchor, body)
        for anchor in ("eight principal wings in four expanded pairs", "eight auxiliary wings",
                       "waterfall petal pennants", "nine-petal crown", "floating thorn diadem",
                       "branching thorn pauldrons", "triple thorn rails", "interwoven open arches"):
            self.assertIn(anchor, positives[5])
            self.assertNotIn(anchor, positives[4])
        for anchor in ("triple thorn rails", "fully blossomed nested rose hub", "continuous rose-gold spine"):
            self.assertIn(anchor, positives[12])
        self.assertIn("fully blossomed nested rose hub", positives[9])
        self.assertIn("counter-sweeping gold flame and crimson lightning shapes", positives[9])
        for body in positives[3:6]:
            self.assertIn("torso shoulders arms hands hips thighs knees shins and feet", body)

    def test_roselius_pack_has_six_matching_creature_forms_and_six_materials(self):
        text, bodies = prompts(ART / "Passion of Crimson Roses.md")
        self.assertEqual(len(bodies), 15)
        character_prompt_count = sum(
            len(prompts(ART / f"{name} Art.md")[1]) for name in CHARACTERS
        )
        self.assertEqual(character_prompt_count + len(bodies), 54)
        self.assertIn("35 stages", text)
        self.assertIn("80 through 140", text)
        self.assertIn("only through level 120", text)
        self.assertIn("copies never evolve", text)
        self.assertIn("material of that form's rarity", " ".join(text.split()))
        for form, body in zip(ROSELIUS_FORMS, bodies[:6]):
            with self.subTest(form=form):
                self.assertIn(form, text)
                self.assertIn("facing right", body)
                self.assertIn("angel creature", body)
                self.assertRegex(body, r"two .{0,20}crimson eyes")
                self.assertIn("one third of canvas height", body)
                self.assertIn("--ar 4:3", body)
                if form == ROSELIUS_FORMS[0]:
                    self.assertIn("plain ivory tunic", body)
                    self.assertIn("two small rose-gold feather wings", body)
                if form == ROSELIUS_FORMS[-1]:
                    for anchor in ("supreme", "transcendent", "16 immense"):
                        self.assertIn(anchor, body)
        material_names = (
            "Seed of Rosethorn", "Bud of Rosethorn", "Bloom of Rosethorn",
            "Crest of Rosethorn", "Heart of Rosethorn", "Soul of Rosethorn",
        )
        for name, body in zip(material_names, bodies[6:12]):
            self.assertIn(f"### {name}", text)
            self.assertIn("--ar 1:1", body)
            self.assertIn("two thirds", body)
        self.assertIn("--ar 3:1", bodies[12])
        self.assertIn("--ar 16:9", bodies[13])
        self.assertIn("--ar 16:9", bodies[14])
        self.assertIn("Roses Under Sunny Skies", bodies[14])
        self.assertIn("full-bleed", bodies[12])
        self.assertIn("full-bleed", bodies[13])
        self.assertIn("full-bleed", bodies[14])
        self.assertIn("portrait grid", bodies[14].split("--no ", 1)[1])
        for body in bodies[:12]:
            self.assertIn("plain solid green background (#00FF00)", body)
            self.assertIn("no glows or glowing visual effects", body)
        for body in bodies[12:]:
            self.assertNotIn("plain solid", body)

    def test_roselius_revision_keeps_identity_and_progressive_whole_artwork_spread(self):
        text, bodies = prompts(ART / "Passion of Crimson Roses.md")
        renderer = ("clean precise anime contours crisp cel shading smooth painted highlights jewel-like "
                    "saturated deep crimson antique gold pearlescent ivory and rose colors")
        identity = ("one female light-element chibi angel creature, rounded pearlescent ivory core "
                    "crimson rose crest two clear crimson eyes only with no other facial features, "
                    "rounded oversized head tiny torso short covered limbs 2.5 to 3 heads tall, "
                    "body one third of canvas height")
        for index, body in enumerate(bodies[:12]):
            positive, negatives = body.split(" --no ", 1)
            positive = positive.split(" --", 1)[0]
            with self.subTest(cutout=index + 1):
                self.assertLessEqual(len(positive.split()), 350)
                self.assertIn(renderer, positive)
                self.assertNotRegex(positive, r"\b(?:Roselius|Rosethorn|Common|Uncommon|Rare|Epic|Legendary|Omnic)\b")
                self.assertIn("nothing touches the frame edges", positive)
                self.assertIn("subject colors unchanged", positive)
                self.assertNotIn("green", negatives.split(", "))
                for word in ("text", "letters", "lettering", "words", "numbers", "typography",
                             "captions", "labels", "signatures", "runes", "logo", "watermark",
                             "nose", "mouth", "eyebrows", "facial markings", "held weapons"):
                    self.assertIn(word, negatives.split(", "))
                if index < 6:
                    coverage, margin = (50, 60, 72, 84, 94, 96)[index], (25, 20, 14, 8, 3, 2)[index]
                    for anchor in (
                        identity, "facing right both eyes feet open palms and wing tips visible",
                        "without crossing the eyes or hiding armor",
                        f"complete artwork ensemble spans {coverage} percent of canvas width and height",
                        f"{margin} percent solid background-color margin on all four sides",
                    ):
                        self.assertIn(anchor, positive)
                    self.assertNotRegex(positive, r"elongated|body half|two fifths")
                else:
                    self.assertIn("one cohesive face-free collectible readable at small icon size", positive)
                    self.assertIn("complete object and ornamentation occupy roughly two thirds of canvas", positive)
                    self.assertIn("generous solid background-color margin on all four sides", positive)
                    self.assertNotIn("ensemble spans", positive)
        self.assertIn("copies never evolve", text)
        self.assertIn("Pause for owner review of Roselius and Rosethorn materials", text)

    def test_roselius_and_materials_progress_and_preserve_final_architecture(self):
        _, bodies = prompts(ART / "Passion of Crimson Roses.md")
        positives = [body.split(" --", 1)[0] for body in bodies[:12]]
        stages = (
            ("plain ivory tunic", "two small rose-gold feather wings", "one gold thorn curl"),
            ("first fitted gold torso plate", "two short gold-feather wings"),
            ("complete segmented rose-gold armor", "substantial petal pauldrons",
             "short divided crimson mantle", "two broad articulated feather wings"),
            ("6 immense prismatic wings", "four crimson thorn ribbons", "high petal collar"),
            ("8 immense prismatic wings", "three tilted broken gold rose-rings", "six crimson thorn ribbons"),
            ("16 immense prismatic wings", "four tilted broken gold rose-rings", "nine crimson thorn ribbons"),
        )
        for index, anchors in enumerate(stages):
            for anchor in anchors:
                self.assertIn(anchor, positives[index])
            if index >= 2:
                self.assertIn("gold fracture seams", positives[index])
            if index >= 3:
                self.assertIn("torso shoulders arms hands hips thighs knees shins and feet", positives[index])
        for body in positives[4:6]:
            for anchor in ("upper pair rising middle pairs spreading lower pair sweeping down",
                           "divided royal crimson mantle lined ivory", "high petal collar",
                           "airborne twisting casting stance one knee raised both open palms",
                           "offset thorn fans", "rose-violet sapphire-blue and warm opal chromatic facets",
                           "wings mantle thorn arches ribbons spread toward every side and corner"):
                self.assertIn(anchor, body)
        for anchor in ("eight principal wings in four expanded pairs", "eight shorter auxiliary wings",
                       "waterfall petal pennants", "open nine-rose crown", "floating thorn diadem",
                       "monumental branching thorn-canopy pauldrons", "interwoven open arches"):
            self.assertIn(anchor, positives[5])
            self.assertNotIn(anchor, positives[4])
        material_stages = (
            ("faceted crimson rose seed", "gold husk", "one ivory seam"),
            ("closed ivory rosebud", "two gold thorn sepals"),
            ("open crimson rose", "two tiers of ivory-edged petals", "gold thorn calyx"),
            ("gold thorn crest", "branching thorn brackets", "one tilted broken gold rose-ring"),
            ("faceted crimson rose-heart", "ivory petal armor", "two tilted broken gold rose-rings"),
            ("fully unfolded prismatic crimson rose jewel", "expanded triple-tier petals",
             "nested thorn crown", "third tilted broken rose-ring", "three additional petal ribbons"),
        )
        for index, anchors in enumerate(material_stages, 6):
            for anchor in anchors:
                self.assertIn(anchor, positives[index])
        for body in positives[10:12]:
            for anchor in ("ivory petal armor", "articulated gold thorns",
                           "two tilted broken gold rose-rings", "six attached crimson petal ribbons",
                           "offset thorn fans", "rose-violet sapphire-blue and warm opal chromatic facets"):
                self.assertIn(anchor, body)
        self.assertIn("interwoven open arches", positives[11])
        self.assertNotIn("interwoven open arches", positives[10])

    def test_all_cutouts_have_shared_style_contract_and_exactly_one_flag(self):
        files = tuple(ART / f"{name} Art.md" for name in CHARACTERS)
        files += (ART / "Passion of Crimson Roses.md",)
        for path in files:
            _, bodies = prompts(path)
            for index, body in enumerate(bodies):
                with self.subTest(file=path.name, prompt=index + 1):
                    self.assertNotIn("--sref", body)
                    for flag in FLAGS:
                        self.assertEqual(len(re.findall(re.escape(flag) + r"\s", body)), 1)
                    self.assertIn("--niji 6", body)
                    self.assertIn("--s 100", body)
                    self.assertIn("--q 1", body)
                    self.assertNotIn("--style ", body)
                    if re.search(r"--ar (?:3:1|16:9)\b", body):
                        self.assertIn("full-bleed", body)
                        continue
                    for anchor in SHARED_CUTOUT:
                        self.assertIn(anchor, body)
                    self.assertIn("background gradient", body.split("--no ", 1)[1])
                    self.assertIn("photorealism", body.split("--no ", 1)[1])
                    self.assertIn("3d render", body.split("--no ", 1)[1])

if __name__ == "__main__":
    unittest.main()
