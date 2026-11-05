"""Reproduce Sunshade prompts from the approved appearances and Master designs."""
from pathlib import Path

from build_moon_banner_art import RARITIES, approved_sections, cutout, master_rows

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Art" / "characters" / "The Angel-blazened Sunshade.md"
PALETTE = (
    "costume and equipment black and warm gold, sharply bounded orange-black ignition; "
    "natural authored skin hair and eye colors exempt; small authored elemental accents only, "
    "no rainbow metal"
)
COLOR_NO = "rainbow clothing, rainbow effects, pink effects, purple clothing, cyan armor"

CHARACTERS = (
    dict(name="Rhaziel", slug="rhaziel", gender="male",
         titles=("Field-Forge Mender", "Keeper of Remembered Dents", "Seams That Hold",
                 "Armorer Beyond the Court", "Return Through the Fire", "A Defense Worth Returning To"),
         weapon="one long needle-shaped casting rod in the right hand and one oversized left anvil-gauntlet; never a hammer",
         icon_identity="black-gold beveled anvil-gauntlet plates, split smith-apron folds and purposeful gold repair joins; sharply bounded orange-black stitching paths",
         icons=(
             ("passive", "Record the Repaired Join", "one beveled anvil plate receiving three measured repair threads from an intact gold-rimmed shield seam"),
             ("skill1", "Mend Before the Break", "one forge-needle point stitching an opaque gold protective plate across a clean black seam"),
             ("skill2", "Leave the Dents Remembered", "three dented black-gold shield plates joined by precise orange-black repair ribbons, dents remain visible"),
             ("ultimate", "A Defense Worth Returning To", "one magnificent pleated forge-fold shield, central anvil plate and three branching needle-stitched repair paths"),
         )),
    dict(name="Oryn", slug="oryn", gender="male",
         titles=("Bearer of the Unstruck Seal", "Mediator at the Open Gate", "An Exit in the Accord",
                 "Keeper of Unforced Terms", "Authority Without a Sentence", "No Victory Requires This"),
         weapon="one long polehammer with one broad square seal head, abstract inset square relief and no written script",
         icon_identity="square seal-head construction, black ceremonial tabard folds with nested gold borders, flat shoulder-tablet plate fragments and open square-cornered orange-black oath arcs",
         icons=(
             ("passive", "Terms Both Sides Can Leave", "one unstruck square seal connected to one allied protective tablet through a visibly open agreement path"),
             ("skill1", "The Seal Remains Unstruck", "one square polehammer head beside a bounded downward oath line and one open square target bracket"),
             ("skill2", "An Exit in the Agreement", "one flat black-gold tablet shield inside an open square-cornered oath arc with a deliberate clear exit"),
             ("ultimate", "No Victory Requires This", "three ornate tablet shields linked beneath a monumental unstruck square seal, open exits on each side"),
         )),
    dict(name="Thessara", slug="thessara", gender="female",
         titles=("Reservoir Route Captain", "Keeper of the Empty Channel", "Water Delivered in Full",
                 "Promises Beyond the Procession", "The Unomitted Reservoir", "No Village Omitted"),
         weapon="one glaive with one curved blade above exactly two vessel chambers integrated into its neck; not two weapons",
         icon_identity="paired vessel chambers and single glaive blade, gold ribbed aqueduct channels and black split vessel-plate ornament; bounded steel-blue water distinct from orange-black outer-seam ignition",
         icons=(
             ("passive", "Promises Measured in Water", "two glaive-neck vessel chambers joined by a measured steel-blue water band, four small reservoir notches"),
             ("skill1", "Follow the Empty Channel", "one curved glaive tip with a precise steel-blue cutting band through two gold vessel ribs"),
             ("skill2", "Deliver What Was Promised", "paired black-gold vessels release one measured steel-blue healing channel toward a single protective receiving cup"),
             ("ultimate", "No Village Omitted", "one magnificent paired-vessel manifold distributing three equal steel-blue channels through ornate gold aqueduct fins"),
         )),
    dict(name="Elaris", slug="elaris", gender="female",
         titles=("Outrider at the Firebreak", "Seedpod Pathfinder", "A Branch Through the Walls",
                 "Rider of the Open Grove", "Spear-Grove Passage", "A Grove Beyond the Burning Walls"),
         weapon="one branching javelin with one main spear point and two short fixed side tines; rear growth-lances are powers not held weapons",
         icon_identity="three-point branching javelin and hinged gold seedpod plate ornament, pointed black riding-overskirt folds; narrow muted olive growth-lances and orange-black seam ignition",
         icons=(
             ("passive", "A Way Through the Grove", "one gold seedpod clasp opening three narrow olive branches around a single javelin point"),
             ("skill1", "Mark the Firebreak", "one three-point javelin tip tracing one sharp muted olive branch mark inside a gold pod bracket"),
             ("skill2", "Branching Escape", "three outward branching lance-leaf paths break an open black-gold defensive rim, central javelin stays readable"),
             ("ultimate", "A Grove Beyond the Burning Walls", "one monumental three-point javelin crest through dense gold seedpod ribs and six sweeping olive-tipped lance-leaf sprays"),
         )),
    dict(name="Veyr", slug="veyr", gender="male",
         titles=("Refuge-Sparing Dismantler", "Reader of the Load Path", "The Fault Laid Bare",
                 "Unmaker of Occupied Engines", "Precision Beyond Conquest", "What Remains Standing"),
         weapon="one articulated demolition lance with one terminal wedge and exactly three hinged collar braces; never a sword drill or gun",
         icon_identity="single wedge lance tip with three nested gold collar braces, black segmented siege-plate fragments and asymmetric mantle folds; controlled orange-black fracture paths end at deliberate joints",
         icons=(
             ("passive", "Only What Must Fall", "three gold load-path braces around one controlled orange-black fault seam, intact protected center"),
             ("skill1", "Find the Load-Bearing Lie", "one terminal wedge lance tip exposes a precise fracture node between three gold collar braces"),
             ("skill2", "Dismantle the Occupied Engine", "three wedge braces open an outer mechanical rim along deliberate fracture paths, protected central compartment remains intact"),
             ("ultimate", "What Remains Standing", "one magnificent wedge crest with four offset fracture rings and gold load rails, outer plates separate while an intact central refuge plate remains"),
         )),
    dict(name="Aureth", slug="aureth", gender="female",
         titles=("Corridor Rescue Captain", "Bearer of the Keystone", "A Route Beneath the Ashwind",
                 "Command of the Moving Shelter", "Walking Eclipse Guardian", "Hold the Burning Sky Open"),
         weapon="one broad fan-shaped shield in the left hand, one short straight command blade in the right, one small carried gold upper-back keystone plate",
         icon_identity="gold fan-rib shield and carried keystone relief, black split command-cape folds and hooked gold plate guards; broad opaque white-gray convection fans with orange-black ignition only on outer ribs",
         icons=(
             ("passive", "Carry the Corridor Forward", "one carried keystone plate moves a protective fan bracket between three route notches, white-gray convection beneath"),
             ("skill1", "Take the Sheltered Route", "one gold fan shield curves over a clear open route, a small short-blade crest marks its leading edge"),
             ("skill2", "Turn the Ashwind Aside", "one fan shield and short command-blade crest sweep three opaque white-gray wind bands outward from a gold keystone"),
             ("ultimate", "Hold the Burning Sky Open", "one immense gold-ribbed fan shelter opens a clear corridor through twelve segmented convection leaves, central keystone and short-blade crest remain readable"),
         )),
)

STATUS_SYMBOLS = (
    ("rhaziel", "repair", "Repair", "one remembered dent stitched by three gold forge-needle threads"),
    ("oryn", "terms", "Terms", "one unstruck square seal with two open target brackets"),
    ("oryn", "accord", "Accord", "one black-gold protective tablet beside a clearly open square oath arc"),
    ("thessara", "reserve", "Reserve", "two small vessel chambers linked by one measured steel-blue water band"),
    ("elaris", "branch", "Branch", "one seedpod knot splitting into three muted olive spear-point branches"),
    ("elaris", "open-route", "Open Route", "two gold seedpod brackets parting around an outward olive arrow path"),
    ("veyr", "fault", "Fault", "one deliberate orange-black fault seam between three gold load braces"),
    ("veyr", "aftershock", "Aftershock", "one wedge fault node with a smaller delayed concentric fracture band"),
    ("aureth", "lead", "Lead", "one gold fan-shield bracket above an open white-gray route"),
    ("aureth", "momentum", "Momentum", "one carried keystone plate with three forward convection strokes"),
)
SCENES = (
    ("sunshade-banner.png", "Summoning banner / event splash", "16:9",
     "one regal shattered black-gold solar canopy over a vast rescue terrace; gilded fan ribs, measured reservoir channels, seedpod buttresses, controlled fracture seams and unstruck square-seal sculptures; sharply designed orange-black flames frame the architecture; one coherent theme piece, no reward portrait grid"),
    ("sunshade-header.png", "Activity header", "3:1",
     "a panoramic broken black-gold solar canopy with one clearly reopened rescue route and central unlettered gold keystone emblem; distant solar vents and nested fan arches; original regal architecture not a character title"),
    ("sunshade-arena.png", "Battle arena", "16:9",
     "one empty black-gold rescue terrace beneath a shattered solar canopy; distant orange-lit vents, gilded fan buttresses and reservoir channels; broad empty left and right fighting lanes, clear center floor, scenery stays behind combatants"),
)


def sun_cutout(subject, aspect="1:1", portrait=False, stage=1):
    return cutout(subject, aspect, portrait, stage, palette=PALETTE, color_no=COLOR_NO)


def blocks():
    rows = []
    approved = approved_sections(CHARACTERS)
    for character in CHARACTERS:
        fixed, forms = approved[character["slug"]]
        for stage, (title, rarity, form) in enumerate(zip(character["titles"], RARITIES, forms), 1):
            subject = (f"full-body gacha JRPG unit illustration, one compact {character['gender']}; "
                       f"{character['weapon']}; {fixed} {form} "
                       "sparse bounded orange-black ignition at authored exterior armor seams")
            rows.append((f"{character['slug']}-{stage}.png", f"{title}, {character['name']} / {rarity}",
                         sun_cutout(subject, "4:3", True, stage), form))
        for action, name, symbol in character["icons"]:
            rows.append((f"{character['slug']}-{action}.png", f"{character['name']} / {name}",
                         sun_cutout(f"one standalone ability pictogram: {symbol}; character-design details: {character['icon_identity']}"),
                         "Recognizable signature-equipment, costume-detail and power geometry; no figure."))
        rows.append((f"{character['slug']}-weapon.png", f"{character['name']} / Signature equipment",
                     sun_cutout(f"one standalone equipment illustration: {character['weapon']}; black-gold craftsmanship; no hands"),
                     "Optional showcase; shared Normal Attack/Defense remain unchanged."))
    foundation = ("one integrated luxury-scale mechanical chassis, precision gears, crystal reactor, pistons, "
                  "articulated wing assemblies and dense nested engraved platework; polished black-gold metal "
                  "with sharply bounded orange-black energy paths, magnificent Omnic craftsmanship, not buildings")
    for character, slot, name, design in master_rows(CHARACTERS):
        prompt = sun_cutout(f"one standalone personal Master: {design} {foundation}")
        prompt = prompt.replace(" --no ", " --no buildings, towers, houses, furniture, musical instrument, ", 1)
        rows.append((f"master-{character['slug']}-{slot}.png", f"{character['name']} / {name}", prompt,
                     "Mechanical personal Master; no reference flags or implied new mechanics."))
    for owner, slug, label, symbol in STATUS_SYMBOLS:
        rows.append((f"sunshade-status-{owner}-{slug}.png", f"{owner.title()} / {label} status",
                     sun_cutout(f"one bold small-scale status pictogram: {symbol}; simple readable silhouette"),
                     "Symbol only; actual owners, numeric values and clocks stay HTML."))
    for asset, label, aspect, subject in SCENES:
        prompt = (f"{subject}; original compact anime game scenery renderer, clean contours, crisp cel shading, "
                  "painted highlights and jewel-like metal detail; black warm gold and orange palette, "
                  "full-bleed scenery with restrained scenery glare and bloom, no figures. "
                  f"--ar {aspect} --niji 6 --s 100 --q 1 --no text, lettering, watermark, people, "
                  "character portraits, reward grid, photorealism, 3d render, blur, rainbow colors")
        rows.append((asset, label, prompt, "Shared scene source; no source-key background or background removal."))
    return rows


def document():
    parts = [
        "# The Angel-blazened Sunshade: complete character art pack",
        "**97 copy-ready prompts; all source images pending. Six six-star Element-Bearers, three male and three female.**",
        "[Approved appearances](../../docs/moon-sunshade-character-design.md) | "
        "[Kits/Masters](../../docs/moon-sunshade-kit-specification.md) | "
        "[Signature activities](../../docs/moon-sunshade-events.md) | "
        "[Complete missing-art checklist](../../docs/remaining-expansion-art.md)",
        "Reproduce: `python tools/build_sunshade_banner_art.py`. Do not hand-edit generated blocks.",
        "## Inventory",
        "| Category | Images |\n|---|---:|\n| Six-form portraits |36|\n| Passive/Skill1/Skill2/Last Flare |24|\n"
        "| Personal Masters |18|\n| Native/Master status pictograms |10|\n| Banner/splash, header, arena |3|\n"
        "| Optional signature-equipment showcases |6|\n| Total |97|",
        "Six Solcarapace portraits and six Dawnforge materials are in the separate event pack, "
        "not duplicated here. Universal Normal Attack/Defense and shared Burn/Weaken icons remain shared. "
        "No separate bosses, specialty items, event maps, chests or profile portraits are required.",
        "## Foundations",
        "All fixed features and six appearance rows are reproduced from the approved document, not "
        "inferred from a kit. Eyes only anatomical facial features; no hair, eye or skin changes. "
        "Compact original Infernis/Tizu anime/cel renderer; simple Common, increasingly epic late forms. "
        "At least15% uninterrupted solid green-key margin on all edges, entire design contained, "
        "opaque non-emissive cutout powers and painted reflections. Authored natural features and "
        "small elemental accents are exempt from the black-gold costume lock.",
        "All24 ability pictograms explicitly preserve equipment construction, costume trim/folds and "
        "distinct power geometry. Object-only, never a miniature wearer, hand or face. "
        "Only portraits use exact evolution-matched guide references at150; other art is reference-free. "
        "If signed references expire, request refreshed owner URLs; do not silently substitute.",
        "Banner and activity names differ from identity names and every Omnic title, while their "
        "shared symbols make the event recognizable. Names/titles stay outside image prose.",
        "## Proposed evolution titles",
        "| Character | Common | Uncommon | Rare | Epic | Legendary | Omnic |\n|---|---|---|---|---|---|---|\n"
        + "\n".join("| " + " | ".join((c["name"], *c["titles"])) + " |" for c in CHARACTERS),
    ]
    for asset, title, prompt, note in blocks():
        parts.extend((f"## {title}", f"Proposed export: `{asset}` (not a runtime URL).",
                      f"**Design / intentional change note:** {note}", f"```text\n{prompt}\n```"))
    return "\n\n".join(parts).rstrip() + "\n"


if __name__ == "__main__":
    OUTPUT.write_text(document(), encoding="utf-8")
    print(f"Wrote {len(blocks())} Sunshade prompt proposals to {OUTPUT}")
