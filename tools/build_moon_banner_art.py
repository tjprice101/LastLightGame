"""Build the Moon review pack from approved appearances; never install artwork."""
from pathlib import Path
import re

from build_calamitic_art import references
from build_elemental_war_art import RENDERER
from character_palette import REFERENCE_WEIGHT
from prompt_quality import ICON_NO, ICON_RENDERER, OBJECT_ONLY, QUALITY_NO, SHARP

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Art" / "characters" / "Glow of the Moon's Light.md"
DESIGN = ROOT / "docs" / "moon-sunshade-character-design.md"
KITS = ROOT / "docs" / "moon-sunshade-kit-specification.md"
RARITIES = ("Common", "Uncommon", "Rare", "Epic", "Legendary", "Omnic")
MARGIN = ("entire ensemble inside central70 percent, continuous empty15 percent border on every side and corner; "
          "uninterrupted solid-background safety margin, every weapon wing hair armor and effect tip fully visible, "
          "nothing touches or crosses the frame")
PALETTE = ("costume equipment and powers only black white silver and charcoal; "
           "natural authored skin tones are exempt, no rainbow metal or extra elemental hues")
NO = ("text, lettering, numbers, runes, watermark, cropping, photorealism, 3d render, "
      "glow on edges, glow, light bloom, haze, aura, backsplash, background gradient, textured background, " + QUALITY_NO)
COLOR_NO = "blue effects, cyan effects, green clothing, green effects, purple effects, pink effects, orange effects, gold metal"
MOON_RENDERER = RENDERER.replace("jewel-like saturated colors",
                               "jewel-like precision of edges within the authored palette")

CHARACTERS = (
    dict(name="Maerion", slug="maerion", gender="male",
         titles=("Ferry-Token Keeper", "Crescent Field Medic", "Ribs of the Returning Tide",
                 "Steward of Unfinished Voyages", "Harbor for the Unreturned", "Every Name Carried Home"),
         weapon="one crescent polearm with a long dark shaft and blunt inward silver curve",
         motif="white surgeon coat over black segmented armor; three small unlettered ferry tokens on the left-belt clasp; water forms hull ribs, never feathers",
         icon_identity="white field-coat panel folds over black segmented plate insets, three unlettered silver ferry tokens and blunt crescent polearm relief; silver-black water forms curved hull ribs, never feathers",
         icons=(
             ("passive", "Names Still Carried", "three unlettered ferry tokens beside a crescent reservoir with one measured silver water band"),
             ("skill1", "Crescent Triage", "one crescent polearm tip beside a precise inward water stitch and a small shelter rib"),
             ("skill2", "A Place on the Ferry", "a silver-black water reservoir pouring one bounded ribbon into a protective crescent hull"),
             ("ultimate", "Bring Every Name Home", "three ferry tokens inside a magnificent silver ribbed hull, three equal outward water channels"),
         )),
    dict(name="Caevren", slug="caevren", gender="male",
         titles=("Observatory Sentinel", "Keeper of the Counterweight", "The Meridian Holds",
                 "Brace Beneath the Falling Sky", "Anchor of the Unfinished Night", "No Star Falls Unheld"),
         weapon="one counterweight flail, short silver handle, one articulated chain, one dark spherical weight inside a white meridian cage",
         motif="black observatory coat under white squared platework; attached calibrated wind vanes, never feathers",
         icon_identity="white squared plate edges and silver meridian cage ribs matching the observatory yoke; black padded-coat inset texture, stepped rectangular wind vanes; no feathers",
         icons=(
             ("passive", "Weight of the Watch", "one dark spherical flail counterweight inside its white meridian cage, seated in three squared observatory-yoke load brackets, two compressed wind struts"),
             ("skill1", "Hold the Meridian", "a single caged flail weight held on a taut mechanical chain beside a firm white wind brace"),
             ("skill2", "Counterweight Covenant", "one meridian-caged flail counterweight connected by its articulated silver chain to a smaller white squared armor-yoke plate, stepped wind vanes visibly bracing the protected plate"),
             ("ultimate", "The Night Shall Not Fall", "a massive meridian-caged counterweight, three surrounding load-transfer arcs and a broad white protective brace"),
         )),
    dict(name="Vespera", slug="vespera", gender="female",
         titles=("Last-Beacon Watch", "Whitefire Messenger", "Standard of the Night Road",
                 "Marshal of Unextinguished Signals", "Procession Beyond the Walls", "None Left in the Dark"),
         weapon="one tall bladed standard with one silver spear tip and one physical white swallowtail pennant",
         motif="black signal-officer coat with white facing and a diagonal silver signal cord; one white high braid bound with black ribbon; stage-specified silver-white flames originate at the standard crest, no orange fire",
         icon_identity="single silver spear-tip standard crest and white swallowtail pennant, black-white coat-facing folds and diagonal silver signal-cord trim; serrated silver-white flame ribbons with charcoal cuts originate at the crest",
         icons=(
             ("passive", "Someone Still Beyond the Walls", "three small silver-white beacon cells linked to one white swallowtail pennant"),
             ("skill1", "Whitefire Dispatch", "one silver spear tip emitting a sharp whiteflame curl with charcoal interior cuts"),
             ("skill2", "Keep the Last Beacon", "one white pennant crest delivering a single serrated whiteflame ribbon through a silver relay"),
             ("ultimate", "None Left in the Dark", "a majestic silver standard crest with tiered whiteflame pennant fans and three outward relay paths"),
         )),
    dict(name="Ilyss", slug="ilyss", gender="female",
         titles=("Memorial Restorer", "Tender of the Broken Link", "Crescent Unbinder",
                 "Mercy Between the Severed Threads", "Release Without Oblivion", "What Harm Cannot Hold"),
         weapon="one connected pair of severance shears, two crescent blades joined at a visible pivot, one handle in each hand",
         motif="white pleated dress over black armor and opaque leggings; stage-specified power geometry uses separated crescent links, no bound figures",
         icon_identity="connected silver shear-pivot relief and separated crescent-link tracery matching the equipment; sharply folded white dress pleats against black bodice-like plate insets; cascading spaced links, never feathers or souls",
         icons=(
             ("passive", "What Need Not Remain", "three cleanly separated silver crescent links beside one intact protective loop"),
             ("skill1", "Cut the Harmful Thread", "one connected shear pivot and two crescent blades cutting a charcoal ribbon into two separated ends"),
             ("skill2", "Unbind the Living", "open connected silver shears beside a repaired white band and one removed dark link"),
             ("ultimate", "No Promise of Resurrection", "a magnificent separated-link canopy above an intact white crescent, no souls or resurrection symbols"),
         )),
    dict(name="Asteriel", slug="asteriel", gender="male",
         titles=("Night-Seed Librarian", "Lender of Moonflowers", "Cultivator of Quiet Orbits",
                 "Keeper of the Open Conservatory", "Garden of Unhoarded Stars", "Every Orbit Bears a Future"),
         weapon="one palm-held seed-orrery focus, one closed central seed capsule and only the stage-specified satellite capsules",
         motif="silver low hair knot and two curling forelocks; black scholar tunic and white petal coat, no green botanical colors",
         icon_identity="closed central seed capsule with silver seed-orrery ribs, white petal-coat folds and silver leaf-vein trim against black scholar-cloth insets; cultivated moonflower branches, not generic stars",
         icons=(
             ("passive", "Futures Given Freely", "one closed silver seed capsule branching toward a shelter leaf and an outward flowering path"),
             ("skill1", "Lend the Quiet Seed", "one closed moonflower seed unfolding two opaque white protective petal ribs"),
             ("skill2", "Open the Night Library", "an open silver petal vault releasing three tiny closed seed capsules along precise growth paths"),
             ("ultimate", "Every Orbit Bears a Future", "a magnificent silver seedworld with nested moonflower petals and distinct outward cultivation orbits"),
         )),
    dict(name="Serapha", slug="serapha", gender="female",
         titles=("Ceasefire Escort", "Bearer of the Unstruck Verdict", "Adjudicator of Open Arcs",
                 "Mantle of the Merciful Passage", "Sanctuary Without Surrender", "Let Them Leave Alive"),
         weapon="one mercy scepter, two short opposing blades around an open central oval, not a bell or lens",
         motif="charcoal hair in two rolled side coils and a short low tail; white judicial coat, hinged silver mantle, deliberately open lunar arcs",
         icon_identity="split-oval mercy-scepter crest with two short opposing blade tips, articulated silver mantle hinges and straight black-lined white judicial-coat pleats; open lunar arcs preserve a clear passage, no bells or lenses",
         icons=(
             ("passive", "An Interval Without Surrender", "three silver timing notches along an open lunar arc with a deliberate clear passage"),
             ("skill1", "Terms of Mercy", "a split-oval scepter head beside one shortened charcoal attack stroke and an open silver arc"),
             ("skill2", "A Passage Left Open", "two articulated silver fan leaves shielding an intact white crescent with an open exit"),
             ("ultimate", "Let Them Leave Alive", "a magnificent hinged silver fan sanctuary, five nested open arcs and a clear central passage"),
         )),
)
STATUS_SYMBOLS = (
    ("maerion", "unreturned", "Unreturned", "one silver ferry token over a partially filled black crescent water reservoir"),
    ("caevren", "load", "Load", "one meridian-caged counterweight over three stepped white supporting brackets"),
    ("vespera", "beacon", "Beacon", "one white flame pennant above three silver beacon cells"),
    ("vespera", "signal", "Signal", "one serrated whiteflame ribbon passing through a silver dispatch clasp"),
    ("ilyss", "severance", "Severance", "one cleanly separated silver crescent link with two distinct open ends"),
    ("asteriel", "promise", "Promise", "three closed silver seed capsules gathered around one open sharing clasp"),
    ("asteriel", "shelter", "Shelter", "a closed seed capsule under two opaque white protective petal ribs"),
    ("asteriel", "flourish", "Flourish", "a silver seed capsule opening into a sharply branching white moonflower"),
    ("asteriel", "moonflower", "Moonflower", "one silver moonflower bud pointing along a single outward growth path"),
    ("serapha", "interval", "Interval", "three silver clock notches along one intentionally open crescent"),
    ("serapha", "ceasefire", "Ceasefire", "two hinged white fan leaves stopping one charcoal attack stroke"),
)
SCENES = (
    ("moon-banner.png", "Summoning banner / event splash", "16:9",
     "one monumental black-white lunar harbor observatory, a silver moon reflected in still dark water, "
     "interwoven ship-rib arches counterweight vanes whiteflame pennant sculptures separated-link tracery "
     "moonflower conservatory roofs and articulated open fan gates; six distinct motifs form one composition, "
     "no character reward grid, no figures, royal celestial scale with subtle moonlight glare and scenery bloom"),
    ("moon-header.png", "Activity header", "3:1",
     "a panoramic silver lunar harbor gateway with a clear open passage, black-white mirrored metal ribs, "
     "a central unlettered crescent token emblem, distant observatory meridian silhouettes and moonflower terraces; "
     "quiet regal night, no people, no text, moonlit scenery reflections"),
    ("moon-arena.png", "Battle arena", "16:9",
     "an empty black-white lunar harbor observatory terrace, silver ribbed railings below a distant moon, "
     "still dark water and restrained moonflower architecture, broad uncluttered left and right fighting lanes, "
     "clear central floor, scenery depth stays behind combatants, no people or enemies, subtle reflected moonlight"),
)


def clean(value):
    return re.sub(r"\s+", " ", value.replace("**", "")).strip()


def approved_sections(characters=CHARACTERS):
    source = DESIGN.read_text(encoding="utf-8")
    result = {}
    for character in characters:
        match = re.search(rf"^### {character['name']} .*?(?=^### |^## Banner #3:|^## Review|^## Next|\Z)", source, re.M | re.S)
        if not match:
            raise ValueError(f"Missing approved appearance: {character['name']}")
        section = match.group()
        fixed = re.search(r"\*\*Fixed features:\*\* (.*?)\*\*Costume identity:\*\*", section, re.S)
        forms = re.findall(r"^\| (Common|Uncommon|Rare|Epic|Legendary|Omnic) \| (.+) \|$", section, re.M)
        if not fixed or tuple(rarity for rarity, _ in forms) != RARITIES:
            raise ValueError(f"Incomplete approved forms: {character['name']}")
        result[character["slug"]] = (clean(fixed.group(1)), tuple(clean(row) for _, row in forms))
    return result


def master_rows(characters=CHARACTERS):
    source = KITS.read_text(encoding="utf-8")
    rows = []
    for character in characters:
        found = re.findall(rf"^\| {character['name']} \| ([^|]+) \| ([^|]+) \|$", source, re.M)
        if len(found) != 3:
            raise ValueError(f"Expected three Masters: {character['name']}")
        rows.extend((character, slot, clean(name), clean(design))
                    for slot, (name, design) in enumerate(found, 1))
    return rows


def cutout(subject, aspect="1:1", portrait=False, stage=1, *, palette=PALETTE, color_no=COLOR_NO):
    if portrait:
        craft = ("restrained early-form craft, no mature wing array" if stage < 3 else
                 "increasingly exquisite stage-appropriate craft" if stage < 5 else
                 "majestic dense engraved regalia and crisply interwoven rear powers; clear face hands and weapon")
        body = "one third" if stage <= 4 else "one quarter" if stage == 5 else "one fifth"
        style = (f"{RENDERER}, rounded oversized head tiny torso short limbs, 2.5-3 heads tall; "
                 f"body {body} of canvas height without changing anatomy. {craft}")
        suffix = f" --sref {references()[stage]} --sw {REFERENCE_WEIGHT}"
        negatives = NO + ", " + color_no + ", mouth, nose, eyebrows, face paint, extra characters"
    else:
        style = f"{ICON_RENDERER}; {OBJECT_ONLY}, isolated subject with no cast-shadow backdrop"
        suffix = ""
        negatives = NO + ", " + color_no + ", " + ICON_NO
    return (f"{subject}. {style}. {palette}. Opaque sharply bounded non-emissive powers; "
            f"painted metal reflections only. {SHARP}. {MARGIN}. "
            "plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, "
            "subject colors unchanged, no glows or glowing visual effects, no scenery. "
            f"--ar {aspect} --niji 6 --s 100 --q 1 --no {negatives}{suffix}")


def vespera_cutout(subject, aspect="1:1", portrait=False, stage=1):
    if portrait:
        body = "one third" if stage <= 4 else "one quarter" if stage == 5 else "one fifth"
        style = (f"{RENDERER}; rounded oversized head, tiny torso, short limbs, 2.5-3 heads tall; "
                 f"body {body} of canvas height, unchanged anatomy")
        suffix = f" --sref {references()[stage]} --sw {REFERENCE_WEIGHT}"
        exclusions = ", mouth, nose, eyebrows, face paint, extra characters"
    else:
        style = f"{ICON_RENDERER}; {OBJECT_ONLY}"
        suffix = ""
        exclusions = ", " + ICON_NO
    return (f"{subject}. {style}. Black-white-silver costume, equipment and powers; "
            "natural authored skin tones are exempt. Polished mirror-metal planes and opaque silver-white "
            "flame ribbons with charcoal cuts, crisp non-emissive edges. "
            "Entire ensemble inside central70 percent, continuous empty15 percent border on every side "
            "and corner; uninterrupted safety margin, all tips visible. "
            "plain solid green background (#00FF00), flat unlit color through every opening. "
            f"--ar {aspect} --niji 6 --s 100 --q 1 --no text, lettering, numbers, runes, watermark, "
            "cropping, photorealism, 3d render, glow on edges, glow, light bloom, haze, aura, backsplash, "
            "background gradient, textured background, scenery, cast-shadow backdrop, blur, watercolor, "
            f"depth of field, noise, {COLOR_NO}{exclusions}{suffix}")


def character_object(character, subject, *, palette=PALETTE, color_no=COLOR_NO):
    identity = character["icon_identity"]
    construction = ""
    if character["slug"] == "caevren":
        construction = (
            "The weight is a smooth dark sphere held inside white meridian cage ribs, not a cut gemstone; "
            "short silver handle, articulated chain, squared white yoke plates and stepped rectangular "
            "wind vanes; blunt engineered edges, no mace spikes or crystal clusters. ")
    prompt = cutout(
        f"{subject}. Owner construction: {identity}. {construction}"
        "Match these costume materials as object inlays and relief only, never a miniature wearer. "
        "Keep the depicted action readable; status symbols stay simple, weapons retain their authored "
        "outline, Masters alone use dense connected mechanical assemblies",
        palette=palette, color_no=color_no)
    prompt = prompt.replace(
        "smooth non-emissive painted highlights and jewel-like saturated colors",
        "non-emissive painted highlights; jewel-like precision of edges, not colored gemstones")
    prompt = prompt.replace(
        ". " + palette + ".",
        ". " + palette + "; these colors apply to every plate, core, reflection and power ribbon, "
        "not just the outer casing. Neutral white reflections stay neutral; no iridescent metal. "
        "The green key is background only, no reflected green or background-colored subject edges.")
    if character["slug"] == "caevren":
        prompt = prompt.replace(" --no ", " --no mace spikes, crystal clusters, gemstone weight, ", 1)
    return prompt


LUNAR_IDENTITY = {
    "maerion": "silver ferry-token clasps, white coat-panel relief and black hull ribs; deep-blue water and purple lunar phase medallions",
    "caevren": "smooth dark spherical counterweight, white meridian cage and squared yokes, silver chain and rectangular wind vanes; deep-blue wind bands and purple phase dials",
    "vespera": "silver spear-tip crest, white swallowtail pennant and black signal-coat folds; silver-white flame ribbons tipped vivid purple above deep-blue moon discs",
    "ilyss": "connected silver shear pivot, black gown pleats with white interiors, separated deep-blue crescent links and bright-purple lunar ribbons",
    "asteriel": "central seed capsule and silver leaf-vein ribs, black petal-coat relief with white interiors, deep-blue branches and bright-purple moonflowers",
    "serapha": "split-oval scepter relief and articulated silver fan hinges, black judicial panel folds with white interiors, deep-blue open arcs and bright-purple lunar phases",
}
LUNAR_ABILITIES = {
    "maerion": (
        "three silver ferry tokens hang beneath a vividly painted purple quarter-moon; deep-blue water curls into a sheltered boat-rib cradle",
        "a silver crescent polearm tip draws a deep-blue water stitch across a black hull plate beneath a purple half-moon",
        "a ribbed black-white lunar vessel pours one deep-blue water ribbon through a purple crescent portal into a silver receiving cradle",
        "a great silver-black ship-rib canopy carries a richly colored violet moon; three blue water channels sweep outward beneath a procession of purple moon phases",
    ),
    "caevren": (
        "a dark spherical counterweight inside white meridian ribs balances three squared yokes; blue wind ribbons orbit a violet moon dial",
        "a short silver handle and taut chain hold one smooth caged weight against a broad deep-blue wind brace; purple half-moon plates mark its meridian",
        "a white yoke plate connects to a caged dark counterweight by an articulated chain; rectangular vanes sweep blue wind beneath a vivid purple crescent",
        "a massive white meridian cage anchors a cratered violet-blue moon sphere; three squared load rails and layered blue wind wings fan outward",
    ),
    "vespera": (
        "three silver beacon cells rise beneath a white swallowtail pennant; purple-tipped white flames curl around a deep-blue lunar phase disc",
        "one silver spear-tip crest sends a sharply curling silver-white flame with vivid purple tips across a blue half-moon dispatch plate",
        "one white pennant crest relays a purple-tipped white flame through a silver signal clasp; a deep-blue crescent supports the ribbon",
        "one great silver standard crest unfolds serrated purple-white flame pennants around a richly colored blue-violet moon; three outward blue relay paths remain distinct",
    ),
    "ilyss": (
        "three separated deep-blue crescent links arc around a bright-purple moon sliver above sharply folded black-white gown relief",
        "connected silver crescent shears part a deep-blue ribbon into two ends; a vividly colored purple half-moon remains intact behind the pivot",
        "open connected shears lift one dark link from a blue protective loop; purple lunar ribbons flow through the open cut beneath a phase moon",
        "ten cascading blue crescent-link sprays frame a vivid violet-blue full moon above a silver shear pivot; four purple open crescents flow outward over black-white pleat relief",
    ),
    "asteriel": (
        "a closed silver seed capsule branches into vivid purple moonflowers around a deep-blue quarter-moon orbit and black-white petal relief",
        "one silver seed unfolds two blue petal ribs beneath a vividly colored purple crescent, protected by white-inlaid black calyx plates",
        "a black-white petal vault opens around a violet half-moon; three closed silver seeds follow separate deep-blue branching paths",
        "a huge richly colored violet-blue moon rises from a silver seed-orrery; twelve purple moonflower sprays and four blue seed orbits form a dense flowering mechanical garden",
    ),
    "serapha": (
        "three purple moon-phase plates rest on silver fan hinges above an intentionally open deep-blue crescent passage",
        "one split-oval silver scepter head shortens a dark attack stroke beneath a purple half-moon; a deep-blue open arc keeps the exit clear",
        "two black-white articulated fan leaves shelter a vivid violet crescent; bright-purple ribbons follow blue open arcs without closing the passage",
        "twelve layered silver fan sprays carry purple moon phases around a vivid violet-blue moon; five deep-blue open arcs form a sweeping sanctuary with a clear central opening",
    ),
}
def lunar_cutout(subject, portrait=False, stage=1):
    body = "one third" if stage <= 4 else "one quarter" if stage == 5 else "one fifth"
    style = (f"{MOON_RENDERER}; rounded head, tiny torso, short limbs, 2.5-3 heads tall, body {body} of canvas"
             if portrait else f"{ICON_RENDERER.replace('jewel-like saturated colors', 'jewel-like crisp facets')}; {OBJECT_ONLY}")
    suffix = f" --sref {references()[stage]} --sw {REFERENCE_WEIGHT}" if portrait else ""
    return (f"{subject}. {style}. Black primary surfaces, white accents and silver mechanics; "
            "deep-blue and bright vibrant purple elemental energy, vividly colored crater-faceted moons "
            "and lunar phases. Natural authored skin tones are exempt; preserve authored skin, hair and eyes. "
            "Opaque flowing ribbons, crisp painted highlights, non-emissive edges. "
            "entire ensemble inside central70 percent, continuous empty15 percent border on every side "
            "and corner; uninterrupted safety margin, all tips visible. "
            "plain solid green background (#00FF00), flat unlit through all openings; green key is background only. "
            f"--ar {'4:3' if portrait else '1:1'} --niji 6 --s 100 --q 1 --no text, lettering, numbers, "
            "watermark, cropping, photorealism, 3d render, glow on edges, light bloom, haze, "
            "background gradient, scenery, green effects, gold metal, orange effects, "
            f"{'mouth, nose, eyebrows, face paint, extra characters' if portrait else ICON_NO}{suffix}")


def blocks():
    rows = []
    approved = approved_sections()
    for character in CHARACTERS:
        fixed, forms = approved[character["slug"]]
        render = vespera_cutout if character["slug"] == "vespera" else cutout
        for stage, (title, rarity, form) in enumerate(zip(character["titles"], RARITIES, forms), 1):
            subject = (f"full-body gacha JRPG unit illustration, one compact {character['gender']}; "
                       f"{character['weapon']}; {fixed} {form} {character['motif']}")
            if character["slug"] == "vespera":
                subject = (f"full-body gacha JRPG unit illustration, one compact female; {fixed} "
                           f"{character['weapon']}. {form} Black signal-officer coat with white facing "
                           "and a diagonal silver signal cord. All flame ribbons originate at the standard "
                           "crest; one physical pennant, no additional held flags")
            prompt = render(subject, "4:3", True, stage).replace(RENDERER, MOON_RENDERER).replace(
                             " --ar ",
                             " Palette lock covers costume, equipment, powers and their reflections: "
                             "black, white, silver and charcoal only; preserve authored skin, hair and eyes. "
                             "Neutral metal reflections, no iridescent tint. Green key is background only, "
                             "never reflected onto the subject. --ar ", 1)
            if character["slug"] in ("ilyss", "asteriel", "serapha"):
                prompt = lunar_cutout(
                    f"full-body gacha JRPG unit illustration, one compact {character['gender']}; "
                    f"{fixed} {character['weapon']}. {form}", True, stage)
            rows.append((f"{character['slug']}-{stage}.png", f"{title}, {character['name']} / {rarity}", prompt, form))
        for index, (action, name, symbol) in enumerate(character["icons"]):
            rows.append((f"{character['slug']}-{action}.png", f"{character['name']} / {name}",
                         lunar_cutout(f"one standalone ability emblem: {LUNAR_ABILITIES[character['slug']][index]}; "
                                      f"Owner construction: {LUNAR_IDENTITY[character['slug']]}"),
                         "Owner-specific equipment, costume materials and power geometry; no figure."))
        rows.append((f"{character['slug']}-weapon.png", f"{character['name']} / Signature equipment",
                     lunar_cutout(f"one standalone equipment illustration: {character['weapon']}; "
                                  f"Owner construction: {LUNAR_IDENTITY[character['slug']]}"),
                     "Optional showcase export; not replacement Normal Attack/Defense art."))
    for character, slot, name, design in master_rows():
        prompt = lunar_cutout(
            f"one immense cosmic mechanical sculpture: {design}; "
            f"Owner construction: {LUNAR_IDENTITY[character['slug']]}; precision gears, nested engraved "
            "plates and articulated energy paths, one integrated mechanism, not buildings")
        prompt = prompt.replace(" --no ", " --no buildings, cathedral buildings, towers, houses, furniture, musical instrument, ", 1)
        rows.append((f"master-{character['slug']}-{slot}.png", f"{character['name']} / {name}", prompt,
                     "Mechanical art proposal; kit coefficients unchanged."))
    for owner, slug, label, symbol in STATUS_SYMBOLS:
        character = next(entry for entry in CHARACTERS if entry["slug"] == owner)
        rows.append((f"moon-status-{owner}-{slug}.png", f"{owner.title()} / {label} status",
                     lunar_cutout(f"one bold small-scale status pictogram: {symbol}; simple readable silhouette; "
                                  f"Owner construction: {LUNAR_IDENTITY[owner]}"),
                     "Symbol only; numeric counters and clocks remain HTML."))
    for asset, label, aspect, subject in SCENES:
        prompt = (f"{subject}; original compact anime game scenery renderer, crisp contours, cel shading, "
                  "painted highlights and jewel-like metal detail in richly layered architecture; "
                  "palette black white silver charcoal, full-bleed scenery, uncluttered "
                  "composition, scenery lighting permitted. "
                  f"--ar {aspect} --niji 6 --s 100 --q 1 --no text, lettering, watermark, people, "
                  "character portraits, reward grid, photorealism, 3d render, blur, rainbow colors")
        rows.append((asset, label, prompt, "Proposed shared location, not an approved Story chapter or event rule."))
    return rows


def document():
    parts = [
        "# Glow of the Moon's Light: character and associated art review pack",
        "**98 copy-ready prompt proposals; no delivered or installed images.**",
        "Owner authorizes Moon-first titles, art inventory and prompts. Approved appearances are retained; "
        "new titles, icon compositions and shared scene proposals require review. Flagged kit values remain unchanged.",
        "[Approved appearances](../../docs/moon-sunshade-character-design.md) | "
        "[Kits and strength flags](../../docs/moon-sunshade-kit-specification.md)",
        "Reproduce: `python tools/build_moon_banner_art.py`. Do not edit generated blocks by hand.",
        "**Current celestial redesign:** Ilyss/Asteriel/Serapha now wear black-primary, white-accent "
        "couture with deep-blue and bright-purple flowing energy, vivid cratered moons and phase motifs. "
        "Maerion/Caevren/Vespera portraits are unchanged. Every character-linked ability, weapon, Master "
        "and status carries individual colorful lunar construction. Masters are immense cosmic mechanical "
        "sculptures, not generic monochrome chassis. Green key remains background only. "
        "Names/kits/references remain; generated pixels still require review.",
        "## Vespera visual-language pilot\n\n"
        "Vespera's six portraits retain the shorter subject-first pilot: fixed identity and pose, "
        "approved stage costume/powers, renderer, palette, then containment/key and parameters. "
        "Six portraits, four abilities, one optional weapon, three Masters and two status icons are covered. "
        "Full approved design/change notes remain beside portraits; no appearance or kit changes. "
        "The later owner-material correction extends object identity checks across both banners; "
        "other portraits and shared event scenery are not part of this pilot.\n\n"
        "Generate Common and Omnic plus one ability icon first; inspect identity, single standard/pennant, "
        "flame origins, silhouette clearance and crisp rendering before spending on the remaining set. "
        "Use Draft only if the selected model supports it; these prompts retain `--niji 6`, not an "
        "untested model switch or automatic `--draft` addition. No personalization or Omni Reference "
        "is silently enabled. Upscale only accepted sources needing more resolution. "
        "Prompt checks validate written constraints, not generated pixels or guaranteed results.",
        "## Inventory and boundaries",
        "| Category | Count | Scope |\n|---|---:|---|\n"
        "| Portraits |36|Six forms for each of six characters|\n"
        "| Ability icons |24|Passive, Skill1, Skill2 and Last Flare per character|\n"
        "| Personal Masters |18|Three distinct Omnic mechanical alternatives per character|\n"
        "| Signature equipment |6|Optional standalone showcase art; does not replace shared actions|\n"
        "| Native status pictograms |11|Unreturned, Load, Beacon, Signal, Severance, Promise, Shelter, Flourish, Moonflower, Interval, Ceasefire|\n"
        "| Banner/event splash |1|Shared16:9 theme piece, not a reward portrait grid|\n"
        "| Activity header |1|Shared3:1 lunar gateway|\n"
        "| Battle arena |1|Shared16:9 empty combat scenery|\n"
        "| Total currently specifiable |98|All proposed export labels, never working asset URLs|",
        "Normal Attack/Defense and Burn/Weaken retain existing universal/shared art. No duplicate requests. "
        "Banner/splash is one proposed shared source; derivative crops can be reviewed after delivery.",
        "**Foundational ability-art standard:** every future character-specific ability image must "
        "express its effect through recognizable approved equipment construction, costume material/trim "
        "and power geometry, not merely a generic symbol in the character's palette. "
        "Caevren through Serapha now carry these details explicitly in all20 ability prompts. "
        "Cloth/plate fragments are object ornament, never a miniature character, face, hands or worn outfit. "
        "Shared universal actions remain shared; this pass does not rewrite Maerion or installed artwork.",
        "**Event extension:** six Vesperwing forms and six Moonwake materials have their own "
        "[signature activity pack](../creatures/Moon%20and%20Sunshade%20Events.md), not duplicate entries "
        "in this98-image pack. No separate boss portrait or specialty item chain is required. "
        "See the [complete checklist](../../docs/remaining-expansion-art.md) for combined totals. "
        "Historical event counts were TBD, not zero; the event specification now supplies them.",
        "## Identity, complexity and reference contract",
        "All36 portraits preserve fixed features and current owner-directed stage rows. Adjacent change notes are "
        "intentional costume/power evolution, never hair/eye/skin transformations. "
        "Common/Uncommon remain simple even for6-stars. Legendary architecture grows into Omnic; "
        "wing counts/materials differ by character. Titles are display prefixes outside image prose, "
        "not banner names, combat mode names or written lettering.",
        "Same original Infernis/Tizu compact anime/cel renderer and natural authored skin tones. "
        "New lunar designs use black-white-silver costume with deep-blue/bright-purple energy, not a "
        "grayscale-only power restriction. Eyes are the only anatomical facial features. "
        "Entire ensemble stays inside70% with15% uninterrupted key margin on every edge; "
        "no cropped tips, haze, soft bloom or glow on edges. Painted metallic reflections remain.",
        "Portraits alone use the guide's exact evolution-matched signed URLs at150. "
        "They are preserved verbatim, not verified perpetually available; if expired, stop generation and "
        "obtain renewed owner URLs. Icons/equipment/Masters/scenery use no reference flags. "
        "Scenery is full-bleed and may have moonlight glare/bloom; no scenery key/background removal.",
        "## Proposed evolution titles",
    ]
    title_table = ["| Character | Common | Uncommon | Rare | Epic | Legendary | Omnic |",
                   "|---|---|---|---|---|---|---|"]
    title_table.extend("| " + " | ".join((character["name"], *character["titles"])) + " |"
                       for character in CHARACTERS)
    parts.append("\n".join(title_table))
    for asset, title, prompt, note in blocks():
        parts.extend((f"## {title}", f"Proposed export: `{asset}` (not a runtime URL).",
                      f"**Intentional design / change note:** {note}\n"
                      "No hair, eye or skin changes." if re.fullmatch(r"[a-z]+-[1-6]\.png", asset) else
                      f"**Design note:** {note}",
                      f"```text\n{prompt}\n```"))
    return "\n\n".join(parts).rstrip() + "\n"


if __name__ == "__main__":
    OUTPUT.write_text(document(), encoding="utf-8")
    print(f"Wrote {len(blocks())} Moon prompt proposals to {OUTPUT}")
