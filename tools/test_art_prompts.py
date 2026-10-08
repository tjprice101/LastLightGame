"""Regression checks for copy-ready prompts; output still needs visual review."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parent.parent
BLOCK = re.compile(r"```(?:text)?\n(.*?)\n```", re.S)


def prompts():
    for path in sorted((ROOT / "Art").rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        for index, body in enumerate(BLOCK.findall(text), 1):
            if "--niji" in body:
                yield path, index, body


def portrait_body_fraction(index):
    return "one third" if index < 4 else "one quarter" if index == 4 else "one fifth"


class ArtPromptTests(unittest.TestCase):
    def test_character_prompts_use_neutral_non_explicit_wording(self):
        paths = set((ROOT / "Art").glob("*Art.md"))
        paths.add(ROOT / "Art" / "midjourney-character-style-prompt.md")
        checked = set()
        for path, index, body in prompts():
            if path not in paths:
                continue
            checked.add(path)
            with self.subTest(file=path.name, block=index):
                self.assertNotRegex(
                    body.lower(),
                    r"\b(?:bust|breastplate|chestplate|chestpiece|bare|restraint|"
                    r"blood|gore|nude|naked|sexy|seductive|sensual|cleavage|"
                    r"bondage|torture|nsfw)\b",
                )
        self.assertEqual(checked, paths)

    def test_razor_phase_keeps_compact_identity_renderer_key_and_single_night_sword(self):
        text = (ROOT / "Art" / "Razor Art.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        self.assertEqual(len(bodies), 13)
        identity = ("one tiny male shadow-element chibi sword guardian, cropped ink-black hair with one "
                    "silver forelock violet eyes only with no other facial features recognizable black "
                    "neck scarf and graphite underlayers, rounded oversized head tiny torso short limbs "
                    "2.5 to 3 heads tall")
        renderer = ("clean precise anime contours crisp cel shading smooth painted highlights jewel-like "
                    "saturated ink black graphite deep violet silver and restrained amethyst-opal colors")
        background = ("plain solid green background (#00FF00), flat unlit color edge to edge and through "
                      "all openings, subject colors unchanged, no glows or glowing visual effects, "
                      "elemental powers rendered as opaque solid-color lines ribbons rings and shapes "
                      "with crisp hard edges, non-emissive painted highlights")
        for index, body in enumerate(bodies):
            with self.subTest(block=index + 1):
                positive, negatives = body.split(" --no ", 1)
                positive = positive.split(" --", 1)[0]
                self.assertLessEqual(len(positive.split()), 380)
                self.assertIn(renderer, positive)
                self.assertTrue(positive.endswith(background))
                self.assertIn("solid background-color margin on all four sides", positive)
                self.assertNotRegex(positive, r"\b(?:Razor|Wraththorn|Common|Omnic|runes|six-star)\b")
                self.assertNotRegex(body.lower(), r"\b(?:injury|wound|exposed|flesh|skin|child)\b")
                self.assertNotIn("green", negatives)
                for exclusion in ("text", "letters", "lettering", "words", "numbers", "typography",
                                  "captions", "labels", "signatures", "runes", "logo", "watermark"):
                    self.assertIn(exclusion, negatives.split(", "))
                if index < 6:
                    for anchor in (identity, "one ", "sword of pure night", "opaque ink-black blade",
                                   "both eyes and feet visible", portrait_body_fraction(index),
                                   "sword held beside the body into open space"):
                        self.assertIn(anchor, positive)
                    self.assertEqual(positive.count("sword of pure night"), 1)
                    for exclusion in ("katana", "spear", "axe", "scythe", "smoke", "extra held weapons"):
                        self.assertIn(exclusion, negatives.split(", "))
                else:
                    self.assertIn("two thirds", positive)
        self.assertIn("Pause for owner review of Razor", text)

    def test_razor_phase_progresses_and_retains_final_eclipse_bastion_architecture(self):
        text = (ROOT / "Art" / "Razor Art.md").read_text(encoding="utf-8")
        bodies = [body.split(" --", 1)[0] for body in BLOCK.findall(text) if "--niji" in body]
        stages = (
            ("plain graphite long-sleeved tunic", "straight silver guard", "two small separate deep-violet crescent tabs"),
            ("first forged armor", "single crescent-bastion guard", "no full wings yet"),
            ("complete battle armor", "substantial stepped pauldrons", "squared gauntlets",
             "two short crystal winglets", "blade spanning one body height"),
            ("fully prismatic-armored", "broad stepped pauldrons", "one broken silver eclipse corona",
             "blade spanning one-and-a-quarter body heights"),
            ("fully prismatic-armored", "open three-point eclipse diadem", "three stepped ridges",
             "blade spanning one-and-a-half body heights", "four separated obsidian rampart segments"),
            ("fully prismatic-armored", "open seven-point eclipse crown", "five stepped ridges",
             "blade spanning two body heights", "six separated tiered obsidian rampart segments"),
        )
        for index, anchors in enumerate(stages):
            for anchor in anchors:
                self.assertIn(anchor, bodies[index])
            if index >= 1:
                for anchor in ("graphite joints", "silver fracture seams", "violet eclipse clasps"):
                    self.assertIn(anchor, bodies[index])
            if index >= 3:
                for anchor in ("covering the full body",
                               "high bastion collar", "swirling elemental powers",
                               "without crossing the eyes or hiding equipment"):
                    self.assertIn(anchor, bodies[index])
        self.assertNotIn("fully prismatic-armored", bodies[0])
        self.assertEqual([int(re.search(r"(\d+) immense prismatic wings", body).group(1))
                          for body in bodies[3:6]], [2, 6, 12])
        for body in bodies[4:6]:
            for retained in ("upper pair rising middle pair spreading lower pair sweeping down",
                             "divided royal black mantle lined violet", "braced elevated guard",
                             "double crescent-bastion guard", "three amethyst hilt clasps",
                             "crescent shield vanes", "deep-violet night ribbons"):
                self.assertIn(retained, body)
        for added in ("six principal wings in three expanded pairs", "six shorter auxiliary wings",
                      "wider crescent shield vanes with branching obsidian ribs",
                      "monumental branching tower pauldrons", "long forked pennants",
                      "double broken silver eclipse coronas", "faceted crown pommel"):
            self.assertIn(added, bodies[5])
            self.assertNotIn(added, bodies[4])
        sword = ("one broad sword of pure night with opaque ink-black blade five stepped ridges "
                 "silver-violet edge double crescent-bastion guard three amethyst hilt clasps "
                 "and faceted crown pommel")
        for index in (5, 9, 12):
            self.assertIn(sword, bodies[index])
        self.assertIn("two massive silver crescent buttresses", bodies[9])
        self.assertIn("one broad obsidian shield emblem", bodies[11])
        self.assertIn("no sword", bodies[11])
        self.assertIn("--ar 3:2", BLOCK.findall(text)[12])

    def test_flagship_packs_have_six_forms_six_icons_and_signature_cutout(self):
        expected = (
            ("Bruno", "male", "Tectonic", 5, "Tank", "hammer"),
            ("Elise", "female", "Voltaic", 5, "DPS", "shuriken"),
            ("Aurora", "female", "Luminous", 6, "Support - debuffing enemies", "lens"),
            ("Atmoso", "male", "Atmospheric", 5, "DPS", "staff"),
            ("Razor", "male", "Ominous", 6, "Tank", "sword"),
            ("Bliss", "female", "Tranquilitic", 6, "DPS", "warfan"),
            ("Disciple", "male", "Chaotic", 6, "Support - buffing allies", "psychic"),
        )
        manifest = (ROOT / "Art" / "Flagship Characters.md").read_text(encoding="utf-8")
        for name, gender, element, stars, role, signature in expected:
            with self.subTest(character=name):
                text = (ROOT / "Art" / f"{name} Art.md").read_text(encoding="utf-8")
                bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
                self.assertEqual(len(bodies), 13)
                assets = re.findall(r"Suggested asset ID: `([^`]+)`", text)
                self.assertEqual(len(assets), 13)
                self.assertEqual(len(set(assets)), 13)
                self.assertIn(f"**{stars}-star Element-Bearer**", text)
                self.assertIn(f"**{role}**", text)
                self.assertIn("archived/reviewed/integrated", text)
                self.assertIn("D-122", text)
                self.assertIn("Renderer lock", text)
                self.assertIn("match Infernis and Tizu", text)
                self.assertIn("design complexity, never realism", text)
                headings = re.findall(r"^### Evo\.\d / \w+ - (.+)$", text, re.M)
                self.assertEqual(len(headings), 6)
                for heading in headings:
                    self.assertTrue(heading.endswith(f", {name}"))
                    self.assertEqual(heading.count(", "), 1)
                self.assertNotIn("companion", text.lower())
                self.assertIn(f"({name}%20Art.md)", manifest)
                self.assertIn("Standard", text)
                self.assertNotIn("banner assignment has not been specified", text)
                for index, rarity in enumerate(("Common", "Uncommon", "Rare", "Epic", "Legendary", "Omnic")):
                    body = bodies[index]
                    self.assertIn(f"### Evo.{index + 1} / {rarity}", text)
                    corrected_elements = {"Atmoso": "wind-element", "Aurora": "light-element",
                                          "Bliss": "peace-element", "Bruno": "earth-element",
                                          "Disciple": "chaotic-element", "Elise": "electricity-element",
                                          "Razor": "shadow-element"}
                    identity = ((corrected_elements[name], "eyes only with no other facial features")
                                if name in corrected_elements else (name, element, "eyes are the only facial features", "facing left"))
                    framing = portrait_body_fraction(index)
                    for anchor in (*identity, gender, signature, framing, "--ar 4:3"):
                        self.assertIn(anchor, body)
                    if index >= 2:
                        self.assertNotRegex(body.split(" --", 1)[0], r"\b(?:cute|cutesy|adorable|baby|toy-like)\b")
                for anchor in ("supreme", "transcendent", "fully prismatic-armored", signature):
                    self.assertIn(anchor, bodies[5])
                for slot, body in zip(("Passive", "Skill 1", "Skill 2", "Last Flare", "Normal Attack", "Defense"), bodies[6:12]):
                    self.assertIn(f" - {slot}", text)
                    corrected_icons = {"Atmoso": "wind", "Aurora": "light", "Bliss": "peace",
                                       "Bruno": "earth", "Disciple": "chaotic", "Elise": "electricity",
                                       "Razor": "shadow"}
                    identity = (corrected_icons[name],) if name in corrected_icons else (name,)
                    for anchor in ("icon", *identity, "two thirds", "--ar 1:1", "small button"):
                        self.assertIn(anchor, body)
                self.assertIn("--ar 3:2", bodies[12])
                self.assertIn(signature, bodies[12])
                if name in ("Aurora", "Disciple"):
                    self.assertIn("no physical handheld weapon", text)
                for line in text.splitlines():
                    self.assertEqual(line, line.rstrip(), "Trailing whitespace in a flagship pack.")

    def test_atmoso_phase_keeps_starter_renderer_and_copy_ready_key_background(self):
        text = (ROOT / "Art" / "Atmoso Art.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        self.assertEqual(len(bodies), 13)
        background = ("plain solid orange background (#FF8000), flat unlit color edge to edge "
                      "and through all openings, subject colors unchanged, no glows or glowing visual effects, "
                      "elemental powers rendered as opaque solid-color lines ribbons rings and shapes "
                      "with crisp hard edges, non-emissive painted highlights")
        renderer = "clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated"
        for index, body in enumerate(bodies):
            with self.subTest(block=index + 1):
                positive = body.split(" --", 1)[0]
                self.assertTrue(positive.endswith(background))
                self.assertEqual(positive.count("plain solid orange background"), 1)
                self.assertIn(renderer, positive)
                self.assertIn("solid background-color margin on all four sides", positive)
                self.assertIn("nothing touches the frame edges", positive)
                self.assertLessEqual(len(positive.split()), 380)
                if index < 6:
                    for anchor in ("rounded oversized head tiny torso short limbs 2.5 to 3 heads tall",
                                   "eyes only with no other facial features", "silver-gray hair",
                                   "sky-blue shoulder sash", portrait_body_fraction(index), "complete staff"):
                        self.assertIn(anchor, positive)
                    self.assertTrue(body.startswith("full-body gacha JRPG unit illustration on a plain canvas"))
                else:
                    self.assertIn("two thirds", positive)
        self.assertIn("exact evolution-matched reference", text)
        self.assertIn("Icons and weapons use no `--sref` or `--sw`", text)
        self.assertIn("D-121 supplied six portraits and six", text)

    def test_atmoso_phase_uses_visibly_different_stage_constructions(self):
        text = (ROOT / "Art" / "Atmoso Art.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        stages = (
            ("plain navy long-sleeved tunic", "small open curved crook",
             "one small opaque sky-blue wind curl", "relaxed grounded standing pose"),
            ("fitted modest silver torso plate", "open forked spiral head",
             "two narrow separate sky-blue wind ribbons", "grounded stepping guard"),
            ("complete battle armor", "tall open arch", "short split navy mantle",
             "two short crystal winglets", "braced wide-footed casting stance"),
            ("fully prismatic-armored", "open four-vane wheel",
             "one broken circular gale corona", "hovering poised casting stance"),
            ("fully prismatic-armored", "open six-vane wheel", "small open three-vane diadem",
             "two separated orbit arcs", "angled hovering guardian pose"),
            ("fully prismatic-armored", "two nested open spiral wheels", "tall open seven-vane crown",
             "three separated orbital wind bands", "angled hovering guardian pose"),
        )
        for index, anchors in enumerate(stages):
            positive, negatives = bodies[index].split(" --no ", 1)
            with self.subTest(form=index + 1):
                for anchor in anchors:
                    self.assertIn(anchor, positive)
                if index < 2:
                    for anchor in ("wings", "crown", "halo"):
                        self.assertIn(anchor, negatives)
                if index >= 3:
                    for anchor in ("covering the full body",
                                   "wind-crystal feathers", "swirling elemental powers",
                                   "full wing tips", "without crossing the eyes or hiding equipment"):
                        self.assertIn(anchor, positive)
        self.assertEqual([int(re.search(r"(\d+) immense prismatic wings", body).group(1))
                          for body in bodies[3:6]], [2, 6, 8])
        final_staff = ("one colossal skywheel staff with two nested open spiral wheels twelve curved pearl vanes "
                       "a teal prism hub plated silver shaft navy grip and rounded butt")
        self.assertIn(final_staff, bodies[5])
        self.assertIn(final_staff, bodies[12])

    def test_atmoso_review_preserves_renderer_and_expands_legendary_into_omnic(self):
        text = (ROOT / "Art" / "Atmoso Art.md").read_text(encoding="utf-8")
        bodies = [body.split(" --", 1)[0] for body in BLOCK.findall(text) if "--niji" in body]
        identity = ("one tiny male wind-element chibi staff wielder, tousled silver-gray hair "
                    "teal eyes only with no other facial features recognizable sky-blue shoulder sash "
                    "and navy underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall")
        rendering = ("clean precise anime contours crisp cel shading smooth painted highlights "
                     "jewel-like saturated navy sky-blue teal silver and pearl colors")
        for body in bodies[:6]:
            self.assertIn(identity, body)
            self.assertIn(rendering, body)
            self.assertNotRegex(body, r"\b(?:slime|cleaver|obsidian|amethyst|pink|turbine|mechanical)\b")
        for body in bodies[2:6]:
            self.assertIn("pearl fracture seams", body)
            self.assertIn("navy mantle", body)
        for body in bodies[3:6]:
            self.assertIn("skeletal swept wind-crystal feathers", body)
        for body in bodies[4:6]:
            for retained in ("split royal navy mantle lined pearl", "separate silver crescent collar",
                             "angled hovering guardian pose", "staff held diagonally beside the body",
                             "severe regal command of a fractured gale"):
                self.assertIn(retained, body)
        for final_only in ("six principal wings in three expanded pairs", "two shorter auxiliary wings",
                           "each principal blade wider with branching gale spines",
                           "monumental pointed pauldrons", "long jagged tails",
                           "tall open seven-vane crown", "two fractured pearl coronas",
                           "suspended teal storm pearl", "two nested open spiral wheels"):
            self.assertIn(final_only, bodies[5])
            self.assertNotIn(final_only, bodies[4])
        self.assertIn("inside a separate silver crescent collar", bodies[12])
        self.assertIn("Reject any output", text)

    def test_atmoso_phase_keeps_names_outside_images_and_excludes_lettering(self):
        text = (ROOT / "Art" / "Atmoso Art.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        for index, body in enumerate(bodies):
            with self.subTest(block=index + 1):
                positive, negatives = body.split(" --no ", 1)
                self.assertNotRegex(positive, r"\b(?:Atmoso|Infernis|Tizu|Flora|Wraththorn|Dawnthorn)\b")
                self.assertNotRegex(positive, r"\b(?:Common|Uncommon|Rare|Epic|Legendary|Omnic|Evo)\b")
                self.assertNotRegex(positive, r"\b(?:runes|inscriptions|lettering|caption|typography|words|labels)\b")
                for exclusion in ("text", "letters", "lettering", "words", "numbers", "typography",
                                  "captions", "labels", "signatures", "logo", "watermark", "interface"):
                    self.assertIn(exclusion, negatives.split(", "))
                if index >= 2:
                    self.assertIn("runes", negatives.split(", "))
                self.assertNotIn("orange", negatives)
        self.assertIn("Copy **only the contents of one `text` block**", text)
        self.assertIn("no lettering anywhere", text)

    def test_aurora_phase_keeps_renderer_identity_key_and_weaponless_casting(self):
        text = (ROOT / "Art" / "Aurora Art.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        self.assertEqual(len(bodies), 13)
        identity = ("one tiny female light-element chibi open-hand caster, pearl-white chin-length bob "
                    "with two short side locks amber eyes only with no other facial features "
                    "recognizable ivory neck ribbon and obsidian underlayers, rounded oversized head "
                    "tiny torso short limbs 2.5 to 3 heads tall")
        renderer = ("clean precise anime contours crisp cel shading smooth painted highlights "
                    "jewel-like saturated ivory pearl amber antique gold and obsidian colors")
        background = ("plain solid magenta background (#FF00FF), flat unlit color edge to edge "
                      "and through all openings, subject colors unchanged, no glows or glowing visual effects, "
                      "elemental powers rendered as opaque solid-color lines ribbons rings and shapes "
                      "with crisp hard edges, non-emissive painted highlights")
        for index, body in enumerate(bodies):
            with self.subTest(block=index + 1):
                positive, negatives = body.split(" --no ", 1)
                positive = positive.split(" --", 1)[0]
                self.assertLessEqual(len(positive.split()), 380)
                self.assertIn(renderer, positive)
                self.assertTrue(positive.endswith(background))
                self.assertIn("solid background-color margin on all four sides", positive)
                self.assertNotRegex(positive, r"\b(?:Aurora|Atmoso|Wraththorn|Dawnthorn|Common|Omnic|runes|sigil)\b")
                self.assertNotIn("magenta", negatives)
                for exclusion in ("text", "letters", "lettering", "words", "numbers", "typography",
                                  "captions", "labels", "signatures", "runes", "logo", "watermark"):
                    self.assertIn(exclusion, negatives.split(", "))
                if index < 6:
                    self.assertIn(identity, positive)
                    self.assertIn("empty palm", positive)
                    self.assertIn(portrait_body_fraction(index), positive)
                    for exclusion in ("physical handheld weapon", "sword", "staff", "spear", "healing cross"):
                        self.assertIn(exclusion, negatives.split(", "))
                else:
                    self.assertIn("two thirds", positive)
        self.assertIn("Copy **only the contents of one `text` block**", text)
        self.assertIn("Icons and weapons use no `--sref` or `--sw`", text)

    def test_aurora_phase_progresses_and_retains_legendary_structures_in_omnic(self):
        text = (ROOT / "Art" / "Aurora Art.md").read_text(encoding="utf-8")
        bodies = [body.split(" --", 1)[0] for body in BLOCK.findall(text) if "--niji" in body]
        stage_anchors = (
            ("plain ivory long-sleeved tunic", "one small open ivory lens circle"),
            ("fitted modest ivory torso plate", "two small open ivory-gold lens circles"),
            ("complete battle armor", "two short crystal winglets", "three separated pearl fragments"),
            ("fully prismatic-armored", "one broken pearl corona in six separated pieces"),
            ("fully prismatic-armored", "small open three-point lens diadem", "twin open solar lens wheels"),
            ("fully prismatic-armored", "tall open seven-point lens crown", "twin nested solar verdict lenses"),
        )
        for index, anchors in enumerate(stage_anchors):
            for anchor in anchors:
                self.assertIn(anchor, bodies[index])
            if index >= 2:
                self.assertIn("obsidian eclipse seams", bodies[index])
            if index >= 3:
                for anchor in ("covering the full body",
                               "open-palmed fingerless guards", "skeletal solar-lens crystal feathers",
                               "swirling elemental powers", "full wing tips"):
                    self.assertIn(anchor, bodies[index])
        self.assertNotIn("fully prismatic-armored", bodies[0])
        self.assertEqual([int(re.search(r"(\d+) immense prismatic wings", body).group(1))
                          for body in bodies[3:6]], [2, 6, 12])
        for body in bodies[4:6]:
            for retained in ("split royal ivory mantle lined obsidian", "separate gold crescent collars",
                             "angled hovering judgment pose", "palms open beside the body",
                             "severe regal command of fractured solar geometry"):
                self.assertIn(retained, body)
        for addition in ("six principal wings in three expanded pairs", "six shorter auxiliary wings",
                         "each principal blade wider with branching lens spines",
                         "monumental layered lens pauldrons", "two fractured pearl coronas",
                         "suspended amber judgment facet", "long sharply divided tails"):
            self.assertIn(addition, bodies[5])
            self.assertNotIn(addition, bodies[4])
        shared_focus = "three open ivory wheels amber geometric tabs and obsidian notches"
        self.assertIn(shared_focus, bodies[5])
        self.assertIn(shared_focus, bodies[12])

    def test_bliss_phase_keeps_renderer_non_explicit_imagery_and_copy_contract(self):
        text = (ROOT / "Art" / "Bliss Art.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        self.assertEqual(len(bodies), 13)
        identity = ("one tiny female peace-element chibi warfan duelist, ivory hair in two low swept buns "
                    "with short feather-like side locks pale-blue eyes only with no other facial features "
                    "recognizable rose neck ribbon and pearl underlayers, rounded oversized head tiny torso "
                    "short limbs 2.5 to 3 heads tall")
        renderer = ("clean precise anime contours crisp cel shading smooth painted highlights "
                    "jewel-like saturated ivory pearl soft rose antique gold and pale blue colors")
        background = ("plain solid green background (#00FF00), flat unlit color edge to edge "
                      "and through all openings, subject colors unchanged, no glows or glowing visual effects, "
                      "elemental powers rendered as opaque solid-color lines ribbons rings and shapes "
                      "with crisp hard edges, non-emissive painted highlights")
        for index, body in enumerate(bodies):
            with self.subTest(block=index + 1):
                positive, negatives = body.split(" --no ", 1)
                positive = positive.split(" --", 1)[0]
                self.assertLessEqual(len(positive.split()), 380)
                self.assertIn(renderer, positive)
                self.assertTrue(positive.endswith(background))
                self.assertIn("solid background-color margin on all four sides", positive)
                self.assertNotRegex(positive, r"\b(?:Bliss|Wraththorn|Aurora|Atmoso|Common|Omnic|runes)\b")
                self.assertNotRegex(body.lower(), r"\b(?:bound|injury|wound|exposed|flesh|skin|girl|child)\b")
                self.assertNotIn("green", negatives)
                for exclusion in ("text", "letters", "lettering", "words", "numbers", "typography",
                                  "captions", "labels", "signatures", "runes", "logo", "watermark"):
                    self.assertIn(exclusion, negatives.split(", "))
                if index < 6:
                    self.assertIn(identity, positive)
                    self.assertIn("exactly two", positive)
                    self.assertIn("one in each hand", positive)
                    self.assertIn("facing left both eyes and feet visible", positive)
                    self.assertIn(portrait_body_fraction(index), positive)
                    for exclusion in ("bow", "sword", "staff", "extra held weapons", "summoned bird"):
                        self.assertIn(exclusion, negatives.split(", "))
                else:
                    self.assertIn("two thirds", positive)
        self.assertIn("fully covered", bodies[0])
        self.assertIn("Pause for owner review of Bliss", text)

    def test_bliss_phase_adds_feather_architecture_and_retains_legendary_in_omnic(self):
        text = (ROOT / "Art" / "Bliss Art.md").read_text(encoding="utf-8")
        bodies = [body.split(" --", 1)[0] for body in BLOCK.findall(text) if "--niji" in body]
        stages = (
            ("plain pearl long-sleeved tunic", "simple folding ivory warfans"),
            ("first forged armor", "no full wings yet", "rose hinges"),
            ("complete battle armor", "two short crystal winglets", "three separated pearl fragments"),
            ("fully prismatic-armored", "one broken pearl corona in six separated pieces"),
            ("fully prismatic-armored", "small open three-feather diadem", "two tiered ivory feather arrays"),
            ("fully prismatic-armored", "tall open seven-feather crown", "three tiered arrays"),
        )
        for index, anchors in enumerate(stages):
            for anchor in anchors:
                self.assertIn(anchor, bodies[index])
            if index >= 1:
                self.assertIn("pale-blue joints", bodies[index])
                self.assertIn("pearl fracture seams", bodies[index])
            if index >= 3:
                for anchor in ("covering the full body",
                               "open-ribbed feather-shaped prism blades", "swirling elemental powers",
                               "full wing tips", "without crossing the eyes or hiding equipment"):
                    self.assertIn(anchor, bodies[index])
        self.assertNotIn("fully prismatic-armored", bodies[0])
        self.assertEqual([int(re.search(r"(\d+) immense prismatic wings", body).group(1))
                          for body in bodies[3:6]], [2, 6, 12])
        for body in bodies[4:6]:
            for anchor in ("upper pair rising middle pair spreading lower pair sweeping down",
                           "split royal pearl mantle lined pale blue", "angled hovering duelist pose",
                           "fans spread beside the body",
                           "elemental powers dominate the small human figure"):
                self.assertIn(anchor, body)
        for anchor in ("six principal wings in three expanded pairs", "six shorter auxiliary wings",
                       "each principal vane wider with branching feather spines",
                       "monumental layered feather pauldrons", "long sharply divided tails",
                       "two fractured pearl coronas", "suspended rose prism"):
            self.assertIn(anchor, bodies[5])
            self.assertNotIn(anchor, bodies[4])
        final_fan = ("fully opened warfan", "three tiered arrays of ivory-opal feather blades",
                     "antique-gold branching ribs pale-blue tips and rose crown hinge")
        for anchor in final_fan:
            self.assertIn(anchor, bodies[5])
            self.assertIn(anchor, bodies[12])
        self.assertIn("functional pearl grip", bodies[12])

    def test_bliss_review_transforms_armor_mass_and_fan_scale_not_just_wing_count(self):
        text = (ROOT / "Art" / "Bliss Art.md").read_text(encoding="utf-8")
        bodies = [body.split(" --", 1)[0] for body in BLOCK.findall(text) if "--niji" in body]
        self.assertIn("plain pearl long-sleeved tunic", bodies[0])
        self.assertIn("simple folding ivory warfans", bodies[0])
        self.assertNotIn("colossal", bodies[0])
        self.assertNotIn("shoulder canopy", bodies[0])
        scales = (
            (2, "each spanning one body height"),
            (3, "each spanning one body height"),
            (4, "each spanning one-and-a-half body heights"),
            (5, "each spanning two body heights"),
        )
        for index, scale in scales:
            self.assertIn(scale, bodies[index])
        for anchor in ("stepped feather shoulder guards", "substantial layered gauntlets",
                       "overlapping hip tassets", "reshape the body contour"):
            self.assertIn(anchor, bodies[2])
        for body in bodies[3:6]:
            self.assertIn("high feather collar", body)
            self.assertIn("oversized fluted gauntlets", body)
        for body in bodies[4:6]:
            self.assertIn("swept armored shoulder canopy", body)
            self.assertIn("heavy fluted greaves", body)
        self.assertIn("waterfall feather pennants", bodies[5])
        self.assertNotIn("waterfall feather pennants", bodies[4])
        self.assertIn("three stepped tiers", bodies[9])
        self.assertIn("stepped cathedral-fan silhouette", bodies[12])
        self.assertIn("two-body-height target", text)
        for body in bodies[:6]:
            self.assertNotRegex(body, r"\b(?:purple|obsidian|slime|cleaver|realistic|giant anatomy)\b")

    def test_bruno_phase_retains_renderer_identity_key_and_neutral_copy(self):
        text = (ROOT / "Art" / "Bruno Art.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        self.assertEqual(len(bodies), 13)
        renderer = ("clean precise anime contours crisp cel shading smooth painted highlights "
                    "jewel-like saturated basalt gray warm umber ochre bronze and amber colors")
        background = ("plain solid magenta background (#FF00FF), flat unlit color edge to edge "
                      "and through all openings, subject colors unchanged, no glows or glowing visual effects, "
                      "elemental powers rendered as opaque solid-color lines ribbons rings and shapes "
                      "with crisp hard edges, non-emissive painted highlights")
        for index, body in enumerate(bodies):
            with self.subTest(block=index + 1):
                positive, negatives = body.split(" --no ", 1)
                positive = positive.split(" --", 1)[0]
                self.assertLessEqual(len(positive.split()), 380)
                self.assertIn(renderer, positive)
                self.assertTrue(positive.endswith(background))
                self.assertIn("solid background-color margin on all four sides", positive)
                self.assertNotRegex(positive, r"\b(?:Bruno|Wraththorn|Common|Omnic|purple|slime|cleaver)\b")
                self.assertNotRegex(body.lower(), r"\b(?:injury|wound|exposed|flesh|skin|child)\b")
                self.assertNotIn("magenta", negatives)
                for exclusion in ("text", "letters", "lettering", "words", "numbers", "typography",
                                  "captions", "labels", "signatures", "runes", "logo", "watermark"):
                    self.assertIn(exclusion, negatives.split(", "))
                if index < 6:
                    for anchor in ("male", "earth-element", "amber eyes only with no other facial features",
                                   "ochre waist", "square basalt motifs", "facing left both eyes",
                                   "one ", "double-faced", "rectangular striking faces", "haft", "grip", "butt"):
                        self.assertIn(anchor, positive)
                    for exclusion in ("axe", "mace", "sword", "extra held weapons", "multiple characters"):
                        self.assertIn(exclusion, negatives.split(", "))
                else:
                    self.assertIn("two thirds", positive)
        self.assertIn("Pause for owner review of Bruno", text)

    def test_bruno_restores_compact_anatomy_and_equipment_progression(self):
        text = (ROOT / "Art" / "Bruno Art.md").read_text(encoding="utf-8")
        bodies = [body.split(" --", 1)[0] for body in BLOCK.findall(text) if "--niji" in body]
        for index, body in enumerate(bodies[:6]):
            for anchor in ("short dark-brown swept-back hair", "tiny torso short limbs 2.5 to 3 heads tall",
                           portrait_body_fraction(index), "ochre waist sash"):
                self.assertIn(anchor, body)
            self.assertNotRegex(body, r"living-bedrock|pillar legs|stone face|bastion forearms|mountain torso|deity|seraph|divine|two thirds|half of canvas")
        for anchor in ("complete battle armor", "segmented basalt plates",
                       "two short crystal winglets", "short split ochre mantle"):
            self.assertIn(anchor, bodies[2])
        for body in bodies[3:6]:
            for anchor in ("covering the full body",
                           "swirling elemental powers",
                           "fully prismatic-armored", "without crossing the eyes or hiding equipment"):
                self.assertIn(anchor, body)
        self.assertEqual([int(re.search(r"(\d+) immense prismatic mineral wing arrays", body).group(1))
                          for body in bodies[3:6]], [2, 6, 8])
        for body in bodies[4:6]:
            for retained in ("split royal ochre mantle", "gauntlets",
                             "upper pair rising middle pair spreading lower pair sweeping down",
                             "body-height citadel head", "imposing wide guard"):
                self.assertIn(retained, body)
        for addition in ("tall open seven-spire crown", "two broken orbital coronas",
                         "six principal arrays in three expanded pairs", "two lower auxiliary arrays"):
            self.assertIn(addition, bodies[5])
            self.assertNotIn(addition, bodies[4])
        hammer = ("two broad rectangular striking faces three joined tiers of mineral buttresses "
                  "bronze faultline ribs amber keystone crowns thick prismatic haft visible grip and rounded butt")
        self.assertIn(hammer, bodies[5])
        self.assertIn(hammer, bodies[12])
        for anchor in ("three joined tiers", "bronze faultline ribs", "amber keystone crowns"):
            self.assertIn(anchor, bodies[9])
        self.assertIn("not combat hitbox/stats/camera changes", text)

    def test_disciple_phase_keeps_compact_identity_renderer_key_and_empty_palms(self):
        text = (ROOT / "Art" / "Disciple Art.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        self.assertEqual(len(bodies), 13)
        identity = ("one tiny male chaotic-element chibi psychic caster, short plum-black hair swept upward "
                    "violet eyes only with no other facial features recognizable scarlet shoulder cord "
                    "and charcoal underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall")
        renderer = ("clean precise anime contours crisp cel shading smooth painted highlights jewel-like "
                    "saturated plum black deep violet scarlet magenta silver and amethyst colors")
        background = ("plain solid blue background (#0000FF), flat unlit color edge to edge and through "
                      "all openings, subject colors unchanged, no glows or glowing visual effects, "
                      "elemental powers rendered as opaque solid-color lines ribbons rings and shapes "
                      "with crisp hard edges, non-emissive painted highlights")
        for index, body in enumerate(bodies):
            with self.subTest(block=index + 1):
                positive, negatives = body.split(" --no ", 1)
                positive = positive.split(" --", 1)[0]
                self.assertLessEqual(len(positive.split()), 380)
                self.assertIn(renderer, positive)
                self.assertTrue(positive.endswith(background))
                self.assertIn("solid background-color margin on all four sides", positive)
                self.assertNotRegex(positive, r"\b(?:Disciple|Wraththorn|Common|Omnic|sigils|runes)\b")
                self.assertNotRegex(body.lower(), r"\b(?:injury|wound|exposed|flesh|skin|bound|child)\b")
                self.assertNotIn("blue", negatives)
                for exclusion in ("text", "letters", "lettering", "words", "numbers", "typography",
                                  "captions", "labels", "signatures", "runes", "logo", "watermark"):
                    self.assertIn(exclusion, negatives.split(", "))
                if index < 6:
                    self.assertIn(identity, positive)
                    self.assertIn("empty palm", positive)
                    self.assertIn(portrait_body_fraction(index), positive)
                    self.assertIn("both eyes and feet visible", positive)
                    for exclusion in ("physical handheld weapon", "sword", "staff", "spear"):
                        self.assertIn(exclusion, negatives.split(", "))
                else:
                    self.assertIn("two thirds", positive)
        self.assertIn("Pause for owner review of Disciple", text)

    def test_disciple_phase_progresses_armor_and_retains_final_psychic_architecture(self):
        text = (ROOT / "Art" / "Disciple Art.md").read_text(encoding="utf-8")
        bodies = [body.split(" --", 1)[0] for body in BLOCK.findall(text) if "--niji" in body]
        stages = (
            ("plain charcoal long-sleeved tunic", "one small scarlet psychic flame"),
            ("first forged armor", "no full wings yet"),
            ("complete battle armor", "stepped lattice shoulders", "substantial gauntlets",
             "two short crystal winglets", "three separated silver fragments"),
            ("fully prismatic-armored", "broad pointed pauldrons", "one broken silver corona in six separated pieces"),
            ("fully prismatic-armored", "small open three-point mindcrown diadem", "each frame spanning one body height"),
            ("fully prismatic-armored", "tall open seven-point mindcrown", "each spanning one-and-a-half body heights"),
        )
        for index, anchors in enumerate(stages):
            for anchor in anchors:
                self.assertIn(anchor, bodies[index])
            if index >= 1:
                self.assertIn("silver fracture seams", bodies[index])
            if index >= 2:
                self.assertIn("open-palmed fingerless guards", bodies[index])
            if index >= 3:
                for anchor in ("covering the full body",
                               "high lattice collar", "swirling elemental powers",
                               "without crossing the eyes or hiding the hands"):
                    self.assertIn(anchor, bodies[index])
        self.assertNotIn("fully prismatic-armored", bodies[0])
        self.assertEqual([int(re.search(r"(\d+) immense prismatic wings", body).group(1))
                          for body in bodies[3:6]], [2, 6, 12])
        for body in bodies[4:6]:
            for retained in ("upper pair rising middle pair spreading lower pair sweeping down",
                             "split royal charcoal mantle lined violet", "calm angled hovering casting pose",
                             "palms raised apart beside the body", "poised command of shared psychic power"):
                self.assertIn(retained, body)
        for added in ("six principal wings in three expanded pairs", "six shorter auxiliary wings",
                      "each principal vane wider with branching flame spines",
                      "monumental branching pauldrons", "long divided pennants",
                      "two fractured silver coronas", "suspended amethyst prism"):
            self.assertIn(added, bodies[5])
            self.assertNotIn(added, bodies[4])
        focus = "three violet lattice tiers silver branching ribs and scarlet flame crests"
        self.assertIn(focus, bodies[5])
        self.assertIn(focus, bodies[12])
        self.assertIn("three-tier violet mindcrown frame", bodies[9])
        self.assertIn("three upward magenta flame crests", bodies[5])

    def test_elise_phase_keeps_renderer_anatomy_key_and_two_four_point_stars(self):
        text = (ROOT / "Art" / "Elise Art.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        self.assertEqual(len(bodies), 13)
        identity = ("one tiny female electricity-element chibi shuriken fighter, short black hair with one "
                    "swept side lock lime-green eyes only with no other facial features recognizable mint "
                    "wrist ribbons and charcoal underlayers, rounded oversized head tiny torso short limbs "
                    "2.5 to 3 heads tall")
        renderer = ("clean precise anime contours crisp cel shading smooth painted highlights "
                    "jewel-like saturated charcoal electric lime mint polished silver and violet colors")
        background = ("plain solid orange background (#FF8000), flat unlit color edge to edge and through "
                      "all openings, subject colors unchanged, no glows or glowing visual effects, "
                      "elemental powers rendered as opaque solid-color lines ribbons rings and shapes "
                      "with crisp hard edges, non-emissive painted highlights")
        for index, body in enumerate(bodies):
            with self.subTest(block=index + 1):
                positive, negatives = body.split(" --no ", 1)
                positive = positive.split(" --", 1)[0]
                self.assertLessEqual(len(positive.split()), 380)
                self.assertIn(renderer, positive)
                self.assertTrue(positive.endswith(background))
                self.assertIn("solid background-color margin on all four sides", positive)
                self.assertNotRegex(positive, r"\b(?:Elise|Wraththorn|Common|Omnic|runes)\b")
                self.assertNotRegex(body.lower(), r"\b(?:injury|wound|exposed|flesh|skin|child)\b")
                self.assertNotIn("orange", negatives)
                for exclusion in ("text", "letters", "lettering", "words", "numbers", "typography",
                                  "captions", "labels", "signatures", "runes", "logo", "watermark"):
                    self.assertIn(exclusion, negatives.split(", "))
                if index < 6:
                    for anchor in (identity, "exactly two", "four-point", "open central grips",
                                   "one in each hand", "both eyes and feet visible", portrait_body_fraction(index)):
                        self.assertIn(anchor, positive)
                    for exclusion in ("sword", "dagger", "kunai", "staff", "extra held weapons"):
                        self.assertIn(exclusion, negatives.split(", "))
                else:
                    self.assertIn("two thirds", positive)
        self.assertIn("Pause for owner review of Elise", text)

    def test_elise_phase_progresses_and_retains_legendary_thunderwheel_architecture(self):
        text = (ROOT / "Art" / "Elise Art.md").read_text(encoding="utf-8")
        bodies = [body.split(" --", 1)[0] for body in BLOCK.findall(text) if "--niji" in body]
        stages = (
            ("plain charcoal long-sleeved wrap tunic", "simple silver four-point shuriken"),
            ("first forged armor", "no full wings yet"),
            ("complete battle armor", "stepped shoulder guards", "substantial gauntlets",
             "two short crystal winglets", "three separate silver fragments"),
            ("fully prismatic-armored", "broad swept pauldrons", "one broken silver corona in six separated pieces"),
            ("fully prismatic-armored", "small open three-point star diadem", "each star spanning one body height"),
            ("fully prismatic-armored", "tall open seven-point lightning crown", "each spanning one-and-a-half body heights"),
        )
        for index, anchors in enumerate(stages):
            for anchor in anchors:
                self.assertIn(anchor, bodies[index])
            if index >= 1:
                self.assertIn("silver fracture seams", bodies[index])
            if index >= 3:
                for anchor in ("covering the full body",
                               "high lightning collar", "swirling elemental powers",
                               "without crossing the eyes or hiding equipment"):
                    self.assertIn(anchor, bodies[index])
        self.assertNotIn("fully prismatic-armored", bodies[0])
        self.assertEqual([int(re.search(r"(\d+) immense prismatic wings", body).group(1))
                          for body in bodies[3:6]], [2, 6, 8])
        for body in bodies[4:6]:
            for retained in ("upper pair rising middle pair spreading lower pair sweeping down",
                             "split royal charcoal mantle lined mint", "angled hovering throwing pivot",
                             "stars spread beside the body", "separate broken circuit collars",
                             "poised command of a fractured lightning wheel"):
                self.assertIn(retained, body)
        for added in ("six principal wings in three expanded pairs", "two shorter auxiliary wings",
                      "each principal vane wider with branching lightning spines",
                      "monumental branching pauldrons", "long divided pennants",
                      "two fractured silver coronas", "suspended violet prism"):
            self.assertIn(added, bodies[5])
            self.assertNotIn(added, bodies[4])
        for anchor in ("three nested silver arm plates", "lime corner clasps", "open central grip",
                       "four-point thunderwheel shuriken", "broken circuit collar"):
            for index in (5, 9, 12):
                self.assertIn(anchor, bodies[index])

    def test_sanctuary_has_six_divine_wisp_cutouts_and_two_scenery_prompts(self):
        text = (ROOT / "Art" / "Rosethorn Sanctuary.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        self.assertEqual(len(bodies), 8)
        for body in bodies[:6]:
            for anchor in ("Rosethorn Wisp", "limbless", "facing right", "chibi",
                           "one third", "rose", "ivory", "antique-gold", "--ar 4:3"):
                self.assertIn(anchor, body)
            self.assertIn("two eyes as its only facial features", body)
        for body in bodies[2:6]:
            self.assertNotRegex(body.split(" --", 1)[0], r"\b(?:cute|cutesy|adorable|baby)\b")
        for anchor in ("transcendent", "fully reborn", "prismatic", "orbit rings"):
            self.assertIn(anchor, bodies[5])
        self.assertIn("--ar 3:1", bodies[6])
        self.assertIn("--ar 16:9", bodies[7])

    def test_treasury_has_six_regal_capture_cutouts_and_two_scenery_prompts(self):
        text = (ROOT / "Art" / "Crownfall Treasury.md").read_text(encoding="utf-8")
        bodies = [body for body in BLOCK.findall(text) if "--niji" in body]
        self.assertEqual(len(bodies), 8)
        for body in bodies[:6]:
            for anchor in ("Gleamstone Slime", "limbless", "facing right",
                           "one third", "chibi", "ivory", "gold", "amber", "--ar 4:3"):
                self.assertIn(anchor, body)
        for body in bodies[2:6]:
            self.assertNotRegex(body.split(" --", 1)[0], r"\b(?:cute|cutesy|adorable|baby)\b")
        for anchor in ("transcendent", "prismatic", "fully reborn", "orbit rings"):
            self.assertIn(anchor, bodies[5])
        self.assertIn("--ar 3:1", bodies[6])
        self.assertIn("--ar 16:9", bodies[7])

    def test_summon_banner_is_omnic_wide_scenery_not_reward_cards(self):
        text = (ROOT / "Art" / "Summoning Banners.md").read_text(encoding="utf-8")
        scenes = [body for body in BLOCK.findall(text) if "--niji" in body]
        self.assertEqual(len(scenes), 1)
        body = scenes[0]
        for anchor in ("full-bleed", "Omnic masterpiece", "prismatic",
                       "greatsword emblem", "spear emblem", "bow emblem", "--ar 16:9"):
            self.assertIn(anchor, body)
        self.assertNotRegex(body.split(" --", 1)[0], r"\b(?:cute|cutesy|adorable|baby)\b")
        self.assertIn("portrait grid, reward cards", body.split("--no", 1)[1])

    def test_pending_dungeon_packs_escalate_design_without_changing_renderer(self):
        packs = (
            ("Precipice of the Earth.md", "mountain-spire armor", "mineral rings"),
            ("Sky-bound Rift.md", "silver flight fans", "cyclone rings"),
            ("Lustrous River.md", "opal solar blades", "solar rings"),
            ("Valley of Solitude.md", "eclipse vanes", "shadow rings"),
            ("Ruins of Chaos.md", "impossible lattice", "warped matter rings"),
        )
        enemy_tones = ("simple approachable", "capable", "commanding", "impressive",
                       "formidable", "magnificent", "majestic", "transcendent")
        material_tones = ("simple restrained", "distinctive crafted", "commanding",
                          "formidable", "majestic", "transcendent")
        for filename, enemy_signature, soul_signature in packs:
            path = ROOT / "Art" / "dungeons" / filename
            bodies = BLOCK.findall(path.read_text(encoding="utf-8"))
            self.assertEqual(len(bodies), 16)
            for index, tone in enumerate(enemy_tones):
                with self.subTest(pack=filename, enemy=index + 1):
                    positive = bodies[index].split(" --", 1)[0]
                    self.assertIn(tone, positive)
                    self.assertIn("body one third of canvas height", positive)
                    if index >= 2:
                        self.assertNotRegex(positive, r"\b(?:cute|cutesy|adorable|baby|playful|toy-like)\b")
            for index, tone in enumerate(material_tones):
                with self.subTest(pack=filename, material=index + 1):
                    positive = bodies[index + 8].split(" --", 1)[0]
                    self.assertIn(tone, positive)
                    self.assertIn("chibi", positive)
                    self.assertIn("two thirds of canvas", positive)
                    self.assertNotRegex(positive, r"\b(?:cute|cutesy|adorable|baby|playful|toy-like)\b")
            self.assertIn(enemy_signature, bodies[7])
            self.assertIn("prismatic", bodies[7])
            self.assertIn(soul_signature, bodies[13])
            self.assertIn("prismatic", bodies[13])
            for body, ratio in zip(bodies[14:], ("3:1", "16:9")):
                self.assertIn("full-bleed", body)
                self.assertIn(f"--ar {ratio}", body)

    def test_phase_four_has_ten_element_medallions_and_three_archive_banners(self):
        elements = (ROOT / "Art" / "Element Emblems.md").read_text(encoding="utf-8")
        emblems = [body for body in BLOCK.findall(elements) if "--niji" in body]
        self.assertEqual(len(emblems), 10)
        for element in ("infernic", "aquatic", "tectonic", "efflorescent", "voltaic",
                        "atmospheric", "luminous", "ominous", "tranquilitic", "chaotic"):
            self.assertIn(f"Art ID: `{element}`", elements)
        for body in emblems:
            self.assertIn("medallion", body)
            self.assertIn("centered", body)
            self.assertIn("opaque enamel inset", body)
            self.assertIn("--ar 1:1", body)
        banners = (ROOT / "Art" / "Archives.md").read_text(encoding="utf-8")
        scenes = [body for body in BLOCK.findall(banners) if "--niji" in body]
        self.assertEqual(len(scenes), 3)
        for body in scenes:
            self.assertIn("full-bleed", body)
            self.assertIn("--ar 3:1", body)

    def test_every_prompt_retains_shared_rendering_and_valid_single_flags(self):
        entries = list(prompts())
        self.assertGreaterEqual(len(entries), 259)
        for path, index, body in entries:
            with self.subTest(file=str(path.relative_to(ROOT)), block=index):
                positive = body.split(" --", 1)[0]
                for anchor in ("contours", "cel shading", "painted highlights", "jewel-like"):
                    self.assertIn(anchor, positive)
                self.assertNotRegex(positive, r"\b(?:cinematic|splotchy|ink.paint|broken brush)\b")
                for flag in ("--ar", "--niji", "--s", "--q", "--no"):
                    self.assertEqual(len(re.findall(re.escape(flag) + r"\s", body)), 1)
                self.assertIn("--niji 6", body)
                self.assertIn("--s 100", body)
                self.assertIn("--q 1", body)
                self.assertNotIn("--style ", body)
                negatives = body.split("--no ", 1)[1].split(" --", 1)[0]
                self.assertIn("photorealism", negatives)
                self.assertIn("3d render", negatives)
                if "--ar 4:3" in body:
                    self.assertRegex(body, r" --sref https://\S+ --sw 400$")
                else:
                    self.assertNotIn("--sref", body)
                    self.assertNotIn("--sw", body)

    def test_cutout_rules_and_destination_ratios_are_preserved(self):
        for path, index, body in prompts():
            with self.subTest(file=str(path.relative_to(ROOT)), block=index):
                ratio = re.search(r"--ar (\S+)", body).group(1)
                self.assertIn(ratio, ("4:3", "1:1", "3:2", "3:1", "16:9"))
                positive = body.split(" --", 1)[0]
                if ratio in ("3:1", "16:9"):
                    self.assertIn("full-bleed", positive)
                    continue
                self.assertIn("plain solid ", positive)
                self.assertIn("flat unlit color edge to edge and through all openings", positive)
                self.assertIn("subject colors unchanged", positive)
                self.assertIn("no glows or glowing visual effects", positive)
                self.assertIn("non-emissive painted highlights", positive)
                self.assertRegex(positive, r"margin|padding")
                self.assertRegex(positive, r"chibi|oversized.{0,30}head")
                self.assertNotIn("white gap", positive)
                for exclusion in ("background gradient", "textured background", "glow", "light bloom"):
                    self.assertIn(exclusion, body.split("--no ", 1)[1])
                if "full-body" in positive:
                    self.assertEqual(ratio, "4:3")
                if "item icon" in positive or "currency icon" in positive:
                    self.assertEqual(ratio, "1:1")

    def test_heaven_and_abyss_keep_distinct_species_palettes_and_escalation(self):
        for filename, identity, colors, weapon in (
            ("Soar to Heaven.md", "Dawnthorn Slime", ("white", "scarlet", "gold"), "halberd"),
            ("Delve into the Abyss.md", "Wraththorn Slime", ("black", "purple", "pink"), "cleaver"),
        ):
            path = ROOT / "Art" / "gamemodes" / filename
            bodies = [body for body in BLOCK.findall(path.read_text(encoding="utf-8")) if "--niji" in body]
            self.assertEqual(len(bodies), 11)
            for index, body in enumerate(bodies[:6]):
                with self.subTest(mode=filename, form=index + 1):
                    positive = body.split(" --", 1)[0]
                    self.assertIn(identity, positive)
                    self.assertIn("facing right", positive)
                    self.assertIn("one third", positive)
                    self.assertIn("chibi", positive)
                    for color in colors:
                        self.assertIn(color, positive)
                    if index == 0:
                        self.assertIn("limbs", body.split("--no ", 1)[1])
                    else:
                        self.assertIn("2.5", positive)
            self.assertIn(weapon, bodies[5])
            self.assertIn("wings", bodies[5])
            self.assertRegex(bodies[5], r"crown|halo")
        abyss = (ROOT / "Art" / "gamemodes" / "Delve into the Abyss.md").read_text(encoding="utf-8")
        self.assertIn("opaque painted glass facets", abyss)
        self.assertNotIn("two transparent amethyst", abyss)

    def test_currency_identities_remain_unique_objects(self):
        path = ROOT / "Art" / "Currencies.md"
        bodies = [body for body in BLOCK.findall(path.read_text(encoding="utf-8")) if "--niji" in body]
        self.assertEqual(len(bodies), 2)
        self.assertIn("one bright precious prism crystal", bodies[0])
        self.assertIn("pearlescent ivory central planes", bodies[0])
        self.assertIn("one dark precious prism crystal", bodies[1])
        self.assertIn("obsidian central planes", bodies[1])
        self.assertIn("same geometric construction", bodies[1])
        for body in bodies:
            self.assertIn("--ar 1:1", body)
            self.assertIn("roughly two thirds", body)


if __name__ == "__main__":
    unittest.main()
