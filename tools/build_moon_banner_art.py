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

CHARACTERS = (
    dict(name="Maerion", slug="maerion", gender="male",
         titles=("Ferry-Token Keeper", "Crescent Field Medic", "Ribs of the Returning Tide",
                 "Steward of Unfinished Voyages", "Harbor for the Unreturned", "Every Name Carried Home"),
         weapon="one crescent polearm with a long dark shaft and blunt inward silver curve",
         motif="white surgeon coat over black segmented armor; three small unlettered ferry tokens on the left-belt clasp; water forms hull ribs, never feathers",
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


def blocks():
    rows = []
    approved = approved_sections()
    for character in CHARACTERS:
        fixed, forms = approved[character["slug"]]
        for stage, (title, rarity, form) in enumerate(zip(character["titles"], RARITIES, forms), 1):
            subject = (f"full-body gacha JRPG unit illustration, one compact {character['gender']}; "
                       f"{character['weapon']}; {fixed} {form} {character['motif']}")
            rows.append((f"{character['slug']}-{stage}.png", f"{title}, {character['name']} / {rarity}",
                         cutout(subject, "4:3", True, stage), form))
        for action, name, symbol in character["icons"]:
            identity = character.get("icon_identity", "")
            rows.append((f"{character['slug']}-{action}.png", f"{character['name']} / {name}",
                         cutout(f"one standalone ability pictogram: {symbol}"
                                + (f"; character-design details: {identity}" if identity else "")),
                         "Recognizable equipment, costume-detail and power motifs; no figure."
                         if identity else "New symbolic composition; no figure."))
        rows.append((f"{character['slug']}-weapon.png", f"{character['name']} / Signature equipment",
                     cutout(f"one standalone equipment illustration: {character['weapon']}; exquisitely crafted silver-black metal; no hands"),
                     "Optional showcase export; not replacement Normal Attack/Defense art."))
    foundation = ("cosmic ornate resplendent mechanical masterpiece, one integrated luxury-scale chassis, "
                  "precision gears, nested engraved platework and vast connected gantries, "
                  "black-white polished enamel and silver faceted cores, crisp painted specular reflections; "
                  "architecture words describe a mechanism, not buildings")
    for character, slot, name, design in master_rows():
        prompt = cutout(f"one standalone Omnic personal Master: {design} {foundation}")
        prompt = prompt.replace(" --no ", " --no buildings, cathedral buildings, towers, houses, furniture, musical instrument, ", 1)
        rows.append((f"master-{character['slug']}-{slot}.png", f"{character['name']} / {name}", prompt,
                     "Mechanical art proposal; kit coefficients unchanged."))
    for owner, slug, label, symbol in STATUS_SYMBOLS:
        rows.append((f"moon-status-{owner}-{slug}.png", f"{owner.title()} / {label} status",
                     cutout(f"one bold small-scale status pictogram: {symbol}; simple readable silhouette"),
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
        "All36 portraits preserve exact fixed features and approved stage rows. Adjacent change notes are "
        "intentional costume/power evolution, never hair/eye/skin transformations. "
        "Common/Uncommon remain simple even for6-stars. Legendary architecture grows into Omnic; "
        "wing counts/materials differ by character. Titles are display prefixes outside image prose, "
        "not banner names, combat mode names or written lettering.",
        "Same original Infernis/Tizu compact anime/cel renderer, natural authored skin tones and strict "
        "black-white-silver costume/equipment/power palette. Eyes are the only anatomical facial features. "
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
