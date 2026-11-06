"""Reproduce the approved black-white solar redesign; never install artwork."""
from dataclasses import dataclass
from pathlib import Path

from build_moon_banner_art import RARITIES, approved_sections, cutout, master_rows

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Art" / "characters" / "The Angel-blazened Sunshade.md"
PALETTE = (
    "costume and equipment primary black secondary white, neutral painted metal reflections; "
    "elemental energy deep-orange and pearlescent-pink only, pink-white facets not rainbow iridescence; "
    "natural authored skin hair and eye colors exempt"
)
COLOR_NO = ("gold metal, gold trim, bronze, yellow effects, blue effects, cyan effects, "
            "green effects, purple effects, rainbow clothing, rainbow effects")


@dataclass(frozen=True)
class VisualSpec:
    costume: str
    sculpture: str


VISUALS: dict[str, VisualSpec] = {
    "rhaziel": VisualSpec(
        "white split smith apron over matte-black armor; stepped anvil cuffs and beveled boots",
        "pleated anvil-and-needle silhouette, stitched folding metal and recorded dents"),
    "oryn": VisualSpec(
        "straight white-faced black tabard, flat white shoulder tablets and square cuff seals",
        "open square-seal silhouette, stepped tablet shelves and rectangular delivery rails"),
    "thessara": VisualSpec(
        "black reservoir armor, white fluted channels, white enclosed scarf and split vessel hip plates",
        "paired fluted-vessel silhouette, curved glaive-neck braces and slotted aqueduct fins"),
    "elaris": VisualSpec(
        "black segmented riding armor, white hinged seedpods and pointed split riding skirt",
        "branching three-point spear silhouette, hinged seedpod shutters and serrated lance-leaf rotors"),
    "veyr": VisualSpec(
        "black siege plates, white load seams, asymmetric segmented mantle and angular layered boots",
        "single terminal wedge and three-brace silhouette, offset fracture rotors and intact central chamber"),
    "aureth": VisualSpec(
        "black rescue armor, white fan-rib shoulders, split command cape and hooked white boot guards",
        "carried-keystone fan silhouette, hinged canopy leaves and an open shelter corridor"),
}

CHARACTERS = (
    dict(name="Rhaziel", slug="rhaziel", gender="male",
         titles=("Field-Forge Mender", "Keeper of Remembered Dents", "Seams That Hold",
                 "Armorer Beyond the Court", "Return Through the Fire", "A Defense Worth Returning To"),
         weapon="one long needle-shaped casting rod in the right hand and one oversized left anvil-gauntlet; never a hammer",
         icon_identity="black-white beveled anvil-gauntlet plates, white split smith-apron folds and recorded repair joins; orange stitching paths and pink faceted repair clasps",
         icons=(
             ("passive", "Record the Repaired Join", "one white beveled anvil plate receiving three orange repair threads with pink clasps from an intact black-white shield seam"),
             ("skill1", "Mend Before the Break", "one forge-needle point stitching a white protective plate across a black seam with one orange thread and pink stitch"),
             ("skill2", "Leave the Dents Remembered", "three dented black-white shield plates joined by precise orange repair ribbons and pink stitch facets, dents remain visible"),
             ("ultimate", "A Defense Worth Returning To", "one magnificent black-white pleated solar forge-fold shield, central anvil plate and three branching orange needle-stitched paths with pink joining facets"),
         )),
    dict(name="Oryn", slug="oryn", gender="male",
         titles=("Bearer of the Unstruck Seal", "Mediator at the Open Gate", "An Exit in the Accord",
                 "Keeper of Unforced Terms", "Authority Without a Sentence", "No Victory Requires This"),
         weapon="one long polehammer with one broad square seal head, abstract inset square relief and no written script",
         icon_identity="square seal head, black tabard folds with nested white borders, flat white shoulder-tablet relief and open orange square-cornered oath arcs with pink corner facets",
         icons=(
             ("passive", "Terms Both Sides Can Leave", "one unstruck white square seal linked to one black-white protective tablet by an orange path with pink corners and a clear exit"),
             ("skill1", "The Seal Remains Unstruck", "one square polehammer head beside a downward orange oath line and one open square pink target bracket"),
             ("skill2", "An Exit in the Agreement", "one flat black-white tablet shield inside an open orange square-cornered oath arc, pink stepped corners and a deliberate clear exit"),
             ("ultimate", "No Victory Requires This", "three ornate black-white tablet shields beneath a monumental unstruck square seal, orange paths and pink corner facets with open exits on each side"),
         )),
    dict(name="Thessara", slug="thessara", gender="female",
         titles=("Reservoir Route Captain", "Keeper of the Empty Channel", "Water Delivered in Full",
                 "Promises Beyond the Procession", "The Unomitted Reservoir", "No Village Omitted"),
         weapon="one glaive with one curved blade above exactly two vessel chambers integrated into its neck; not two weapons",
         icon_identity="exactly two vessel chambers and one curved glaive blade, white fluted aqueduct ribs and black split vessel plates; measured pink water bands inside orange-lined channels",
         icons=(
             ("passive", "Promises Measured in Water", "two glaive-neck vessel chambers joined by one measured pink water band on an orange lower edge, four reservoir notches"),
             ("skill1", "Follow the Empty Channel", "one curved glaive tip with a precise pink water cutting band through two white vessel ribs, orange channel underside"),
             ("skill2", "Deliver What Was Promised", "paired black-white vessels release one measured pink restoration stream on an orange lower edge toward one receiving cup"),
             ("ultimate", "No Village Omitted", "one magnificent black-white paired-vessel manifold distributing three equal pink water streams through orange-lined fluted aqueduct fins"),
         )),
    dict(name="Elaris", slug="elaris", gender="female",
         titles=("Outrider at the Firebreak", "Seedpod Pathfinder", "A Branch Through the Walls",
                 "Rider of the Open Grove", "Spear-Grove Passage", "A Grove Beyond the Burning Walls"),
         weapon="one branching javelin with one main spear point and two short fixed side tines; rear growth-lances are powers not held weapons",
         icon_identity="three-point branching javelin and hinged white seedpod ornament, pointed black-white riding-panel folds; orange growth-lance spines and pink faceted leaves",
         icons=(
             ("passive", "A Way Through the Grove", "one white seedpod clasp opening three narrow orange branches with pink seed tips around a single javelin point"),
             ("skill1", "Mark the Firebreak", "one three-point javelin tip tracing a sharp orange branch mark with a pink seed facet inside a white pod bracket"),
             ("skill2", "Branching Escape", "three orange branching lance-leaf paths with pink leaf blades part an open black-white defensive rim, central javelin readable"),
             ("ultimate", "A Grove Beyond the Burning Walls", "one monumental three-point javelin crest through dense black-white seedpod ribs and six sweeping orange-spined pink lance-leaf sprays"),
         )),
    dict(name="Veyr", slug="veyr", gender="male",
         titles=("Refuge-Sparing Dismantler", "Reader of the Load Path", "The Fault Laid Bare",
                 "Unmaker of Occupied Engines", "Precision Beyond Conquest", "What Remains Standing"),
         weapon="one articulated demolition lance with one terminal wedge and exactly three hinged collar braces; never a sword drill or gun",
         icon_identity="single wedge lance tip with exactly three white collar braces, black siege plates and asymmetric black-white mantle folds; orange fault paths end at pink release joints",
         icons=(
             ("passive", "Only What Must Fall", "three white load-path braces around one orange fault seam with a pink release node, intact black protected center"),
             ("skill1", "Find the Load-Bearing Lie", "one terminal wedge lance exposes one pink fracture node on an orange seam between exactly three white collar braces"),
             ("skill2", "Dismantle the Occupied Engine", "three black-white wedge braces open an outer mechanical rim along orange paths with pink release joints, central compartment intact"),
             ("ultimate", "What Remains Standing", "one magnificent black-white wedge crest with four offset orange fracture rings and pink release nodes, outer plates separate around an intact central refuge plate"),
         )),
    dict(name="Aureth", slug="aureth", gender="female",
         titles=("Corridor Rescue Captain", "Bearer of the Keystone", "A Route Beneath the Ashwind",
                 "Command of the Moving Shelter", "Walking Eclipse Guardian", "Hold the Burning Sky Open"),
         weapon="one broad fan-shaped shield in the left hand, one short straight command blade in the right, one small carried white upper-back keystone plate",
         icon_identity="white fan-rib shield and carried keystone relief, black-white split command-cape folds and hooked white guards; broad pink pressure leaves along orange fan spines",
         icons=(
             ("passive", "Carry the Corridor Forward", "one white carried-keystone plate moves a protective fan bracket between three route notches, pink convection leaf on an orange spine beneath"),
             ("skill1", "Take the Sheltered Route", "one black-white fan shield curves over a clear orange/pink route, one small short-blade crest at its leading edge"),
             ("skill2", "Turn the Ashwind Aside", "one fan shield and short command-blade crest sweep three pink wind bands on orange lower edges outward from a white keystone"),
             ("ultimate", "Hold the Burning Sky Open", "one immense black-white ribbed fan shelter opens a clear corridor through twelve pink convection leaves with orange spines, central keystone and short-blade crest readable"),
         )),
)

STATUS_SYMBOLS = (
    ("rhaziel", "repair", "Repair", "one recorded dent stitched by three orange forge-needle threads with pink stitch clasps"),
    ("oryn", "terms", "Terms", "one unstruck white square seal with two open orange target brackets and pink corners"),
    ("oryn", "accord", "Accord", "one black-white tablet beside a clearly open orange square oath arc with a pink corner"),
    ("thessara", "reserve", "Reserve", "exactly two small vessel chambers linked by one measured pink water band on an orange underside"),
    ("elaris", "branch", "Branch", "one white seedpod knot splitting into three orange spear-point branches with pink seed tips"),
    ("elaris", "open-route", "Open Route", "two white seedpod brackets parting around an outward orange branch path with a pink leaf tip"),
    ("veyr", "fault", "Fault", "one orange fault seam ending at a pink release node between three white load braces"),
    ("veyr", "aftershock", "Aftershock", "one pink wedge fault node on an orange seam with a smaller delayed orange fracture band"),
    ("aureth", "lead", "Lead", "one white fan-shield bracket above an open pink pressure leaf with an orange lower edge"),
    ("aureth", "momentum", "Momentum", "one white carried-keystone plate with three forward pink convection strokes on orange spines"),
)
SCENES = (
    ("sunshade-banner.png", "Summoning banner / event splash", "16:9",
     "one magnificent shattered black-white solar canopy above a vast rescue terrace; a huge deep-orange sun with pearlescent-pink corona beyond tiered white fan ribs; pleated repair bridges, measured pink reservoir channels, serrated seedpod buttresses, controlled orange fracture seams and open square-seal sculptures; dense distinct celestial architecture, one coherent theme piece, no reward portrait grid"),
    ("sunshade-header.png", "Activity header", "3:1",
     "panoramic black-white shattered solar canopy, a clearly reopened rescue route and one unlettered white keystone emblem; distant deep-orange sun with a pink corona, nested fan arches, square open thresholds, pink water channels and branching pod buttresses; majestic original rescue architecture"),
    ("sunshade-arena.png", "Battle arena", "16:9",
     "one empty black-white rescue terrace beneath a shattered solar canopy; distant deep-orange sun and pearlescent-pink corona, white fan buttresses, open square thresholds and pink reservoir channels with orange undersides; broad empty left and right fighting lanes, clear center floor, celestial detail stays behind combatants"),
)


def sun_cutout(subject, aspect="1:1", portrait=False, stage=1):
    return cutout(
        subject, aspect, portrait, stage, palette=PALETTE, color_no=COLOR_NO
    ).replace(
        "jewel-like saturated colors", "jewel-like precision within the authored palette"
    )


def sun_object(character, subject):
    return sun_cutout(
        f"{subject}; Owner construction: {character['icon_identity']}; "
        "costume details appear as mechanical inlays and folded plate relief, no wearer; "
        "every core reflection and ribbon follows the palette, green key is background only"
    )


def blocks():
    rows = []
    approved = approved_sections(CHARACTERS)
    for character in CHARACTERS:
        fixed, forms = approved[character["slug"]]
        for stage, (title, rarity, form) in enumerate(zip(character["titles"], RARITIES, forms), 1):
            subject = (f"full-body gacha JRPG unit illustration, one compact {character['gender']}; "
                       f"{character['weapon']}; {fixed} {VISUALS[character['slug']].costume}. {form}")
            rows.append((f"{character['slug']}-{stage}.png", f"{title}, {character['name']} / {rarity}",
                         sun_cutout(subject, "4:3", True, stage), form))
        for action, name, symbol in character["icons"]:
            rows.append((f"{character['slug']}-{action}.png", f"{character['name']} / {name}",
                         sun_object(character, f"one standalone ability pictogram: {symbol}"),
                         "Recognizable signature-equipment, costume-detail and power geometry; no figure."))
        rows.append((f"{character['slug']}-weapon.png", f"{character['name']} / Signature equipment",
                     sun_object(character, f"one standalone equipment illustration: {character['weapon']}; no hands"),
                     "Optional showcase; shared Normal Attack/Defense remain unchanged."))
    foundation = ("one integrated magnificent celestial mechanical sculpture, connected precision gears, rotors, "
                  "pistons and densely nested plate relief; enormous owner-shaped silhouette, "
                  "polished black-white metal and sharply bounded deep-orange pearlescent-pink energy; not buildings")
    for character, slot, name, design in master_rows(CHARACTERS):
        prompt = sun_object(
            character, f"one standalone mechanical sculpture: {design} "
            f"{VISUALS[character['slug']].sculpture}; {foundation}"
        )
        prompt = prompt.replace(" --no ", " --no buildings, towers, houses, furniture, musical instrument, ", 1)
        rows.append((f"master-{character['slug']}-{slot}.png", f"{character['name']} / {name}", prompt,
                     "Mechanical personal Master; no reference flags or implied new mechanics."))
    for owner, slug, label, symbol in STATUS_SYMBOLS:
        character = next(entry for entry in CHARACTERS if entry["slug"] == owner)
        rows.append((f"sunshade-status-{owner}-{slug}.png", f"{owner.title()} / {label} status",
                     sun_object(character, f"one bold small-scale status pictogram: {symbol}; simple readable silhouette"),
                     "Symbol only; actual owners, numeric values and clocks stay HTML."))
    for asset, label, aspect, subject in SCENES:
        prompt = (f"{subject}; original compact anime game scenery renderer, clean contours, crisp cel shading, "
                  "painted highlights and jewel-like metal detail; black-white architecture, "
                  "deep-orange and pearlescent-pink celestial energy, no gold; "
                  "full-bleed scenery with restrained scenery glare and bloom, no figures. "
                  f"--ar {aspect} --niji 6 --s 100 --q 1 --no text, lettering, watermark, people, "
                  "character portraits, reward grid, photorealism, 3d render, blur, rainbow colors, "
                  "gold metal, bronze, blue lighting, green lighting, purple lighting")
        rows.append((asset, label, prompt, "Shared scene source; no source-key background or background removal."))
    return rows


def document():
    parts = [
        "# The Angel-blazened Sunshade: complete character art pack",
        "**97 copy-ready prompts; all source images pending. Six six-star Element-Bearers, three male and three female.**",
        "[Approved appearances](../../docs/moon-sunshade-character-design.md) | "
        "[Kits/Masters](../../docs/moon-sunshade-kit-specification.md) | "
        "[Signature activities](../../docs/moon-sunshade-events.md) | "
        "[Complete missing-art checklist](../../docs/Future%20Plans/remaining-expansion-art.md)",
        "Reproduce: `python tools/build_sunshade_banner_art.py`. Do not hand-edit generated blocks.",
        "**Owner-approved aesthetic redesign (2026-11-05):** black and white are the primary/secondary "
        "costume and equipment colors, not gold. Deep orange and pearlescent pink are the only elemental "
        "energy colors; pink-white painted facets, never rainbow iridescence. This supersedes the former "
        "gold/blue/olive direction. Natural skin/hair/eyes, identities, lore, roles, equipment seeds, "
        "all36 form rows and their exact wing/ring/arc counts stay intact. Every owner has a distinct "
        "solar/celestial silhouette and integrated mechanical sculpture, not a repeated generic chassis. "
        "Cores/reflections inherit the palette; green key is background only. Designs/prompts complete, "
        "all actual generated artwork still pending; no gameplay change.",
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
        "opaque non-emissive cutout powers and painted reflections. Natural skin/hair/eyes are exempt; "
        "elemental shapes retain water/growth/repair/fault/convection identities in deep orange and pink. "
        "Only full-bleed scenery permits bloom. Simple Common develops into massive magnificent Omnic "
        "regalia without changing compact anatomy, exact references150, niji6 or aspect ratios.",
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
