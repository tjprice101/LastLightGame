"""Reproduce the three pending Elemental War visual proposals; never runtime art."""
from pathlib import Path

from build_calamitic_art import CONDUIT_FOUNDATION, references
from build_elemental_war_art import RENDERER
from character_palette import REFERENCE_WEIGHT
from prompt_quality import (
    ARMOR_RULE, ICON_NO, ICON_RENDERER, OBJECT_ONLY,
    QUALITY_NO, SHARP,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Art" / "characters" / "Elemental War Phase 1.md"
RARITIES = ("Common", "Uncommon", "Rare", "Epic", "Legendary", "Omnic")
STYLE = f"{RENDERER}, rounded oversized head tiny torso short limbs, 2.5-3 heads tall"
PORTRAIT_OPEN = "full-body gacha JRPG unit illustration on a plain canvas, one compact character"
CRAFT = "intricate engraved trim, lustrous enamel and prismatic facets within the palette, impeccable layered craftsmanship"
NO = "text, lettering, watermark, cropping, photorealism, 3d render, glow, light bloom, aura, backsplash, background gradient, " + QUALITY_NO
MARGIN = "entire ensemble inside central70 percent, continuous empty15 percent border on every side and corner; every tip visible, nothing touches the frame"

DESIGNS = (
    dict(
        name="Caldrex", slug="caldrex", role="Infernic Tank",
        identity="male, short squared ash-white hair with shaved sides, amber eyes, one angular ochre cheek-paint stripe, no mouth nose or eyebrows",
        palette="obsidian black, dark brass, molten orange, amber, ash white",
        excluded="blue, cyan, green, purple, pink",
        key="green", hex="#00FF00",
        clothing="black quilted forge coat, burnt-orange sash, brass-riveted apron plates",
        weapon="two connected forge gauntlets with rectangular interlocking furnace-gate shields",
        signature="wingless silhouette crowned by sweeping furnace vanes and broad amber-orange flame ribbons, brass filigree and ash-white enamel",
        titles=("Kiln Warden", "Banked Fire", "The Furnace Holds", "Bearer of the Closed Gate", "No Flame Passes", "The Last Kiln"),
        forms=(
            "simple black forge coat, orange sash, modest brass gate gauntlets and sturdy boots; grounded watchful guard, a small ember curl at each wrist",
            "fitted obsidian breastplate, brass-edged shoulder guards and layered greaves; enlarged gauntlets with ash-white enamel jaws, narrow orange flames trace their edges, fists braced together",
            "sculpted furnace pauldrons, engraved brass gauntlets and overlapping black hip plates; forked brass crown, long orange-lined mantle and four swept furnace vanes, broad flame curls frame the open guard",
            "complete luxurious obsidian-and-ash-white plate regalia, high brass gorget, layered mantle and ornate gate gauntlets; six sweeping gilded furnace vanes and braided orange flame ribbons rise above the shoulders, commanding raised guard",
            "majestic black enamel armor with ash-white beveled insets, intricate brass filigree, monumental furnace pauldrons and cascading orange-lined mantle; immense interlocking gate gauntlets, eight crown-like furnace vanes and densely woven amber-orange flame arabesques, suspended bastion pose",
            "retain Legendary armor pauldrons mantle and gauntlets; elaborate prismatic brass gate jaws, triple-tier furnace crown and twelve swept enamel vanes, immense white-centered amber-orange flame ribbons curl through dense gilded tracery around the entire ensemble, luxurious celestial forge monarch, face and hands clear",
        ),
        icons=(
            ("Passive", "Banked Heat", "three amber rectangular heat cells held in a black brass-riveted gauntlet housing, orange pressure traces confined inside"),
            ("Skill 1", "Close the Kiln", "two floating black forge gauntlets locked into one brass-edged furnace-gate shield, three small attached orange shielding arcs"),
            ("Skill 2", "Cinder Discharge", "one floating open brass furnace gauntlet ejecting a compact fan of solid orange cutting wedges, three emptied amber heat cells"),
            ("Last Flare", "Nothing Beyond These Gates", "one immense closed black furnace gate shield, nested brass braces and orange heat channels curling around its rim, dense interlocking plate detail"),
        ),
        masters=(
            ("Banked-Sun Pressure Accumulator", "a squat black pressure engine, three amber crystal heat cartridges linked by brass piston manifolds, interlocking valve jaws, stepped radiator shutters", "Heat storage and Defense-per-Heat concept"),
            ("Counterstroke Recoil Foundry", "a wide black recoil engine, two opposing brass impact pistons feeding an orange crystal compression chamber, toothed return flywheels and armored heat sinks", "retaliation and Burn concept"),
            ("Cinderpulse Triage Converter", "a triangular black conversion engine, three orange crystal intake turbines feeding one ash-white output cartridge, brass capillary pumps and nested cooling vanes", "ally Burn-tick healing concept"),
        ),
        arena="an abandoned black-brass forge floor, orange kiln slits and closed furnace doors, overhead chain hoists, ash-white refractory tiles; broad clear left and right fighting lanes",
        header="a monumental closed black furnace gate with interlocking brass pressure jaws, orange channels and suspended chain hoists, a wingless gauntlet emblem centered over the gate",
    ),
    dict(
        name="Solenne", slug="solenne", role="Tranquilitic Tank",
        identity="female, ink-black hair in a blunt chin-length bob with one long silver-bound side braid, lilac eyes, two tiny gold temple-paint bars, no mouth nose or eyebrows",
        palette="moon silver, muted lilac, rose-ivory enamel, ink black, restrained gold",
        excluded="blue, cyan, green, scarlet, orange",
        key="green", hex="#00FF00",
        clothing="ink-black pleated robe, lilac lining, rose-ivory rectangular lamellar panels",
        weapon="one bronze-and-rose-ivory temple bell on two visible chains, held as a shield",
        signature="wingless; nested offset moon-gate hoops fastened to a shoulder yoke, opaque lilac vibration arcs attached to the bell",
        titles=("Moonbell Keeper", "Between Two Chimes", "The Patient Circle", "Keeper of the Unstruck Bell", "A Silence Held", "The Bell That Stayed"),
        forms=(
            "simple belted robe, small bell with two short chains and silver wrist guards; grounded listening pose, no hoop array",
            "fitted silver breastplate, rose-ivory wrist scales and lilac-lined robe; one crescent shoulder hoop, gold-trimmed bell held beside one knee, a narrow lilac sound ribbon",
            "sculpted crescent pauldrons, engraved lamellar overskirt and gold chain guides; twin offset silver moon-gates, long lilac sleeve ribbons and larger floral-engraved bell raised across torso",
            "complete moon-silver ceremonial armor, high rose-ivory collar, layered black-lilac mantle and crescent greaves; three ornate moon-gates and broad opaque lilac resonance ribbons, gold-filigree bell shield, poised floating guard",
            "majestic silver and rose-ivory regalia, gold-inlaid crescent pauldrons, cascading lilac mantle and articulated chain guards; five immense offset moon-gates with lace-like metal tracery, prismatic engraved bell shield and densely overlapping lilac resonance folds",
            "retain Legendary regalia mantle chain guards and bell; colossal lotus-bell shield, engraved skirts, crescent pauldrons, cascading brocade trains, prismatic moon-silver crown; seven gold-filigree moon-gates interlock into a vast asymmetric mandala; opaque lilac bell-resonance spirals encircle feet torso and crown in interwoven rising helices; razor-defined silver-edged sound rings envelop dense crescent tracery without hiding face hands or bell, airborne guard",
        ),
        icons=(
            ("Passive", "Held Stillness", "four flat rose-ivory silence plates nested inside a silver crescent clamp, one unstruck bell clapper suspended at center"),
            ("Skill 1", "Answer the Bell", "one floating bronze-and-rose-ivory bell with two chain grips, three solid lilac vibration arcs converging on its rim"),
            ("Skill 2", "Circle of Repose", "three overlapping silver crescent shield plates enclosing a rose-ivory bell clapper, an opaque lilac ribbon fastening the circle"),
            ("Last Flare", "The Last Reverberation", "one ornate bell shield inside seven overlapping silver mechanical hoops, four rose-ivory silence plates unfolding into dense lilac vibration arcs"),
        ),
        masters=(
            ("Stillpoint Inertial Governor", "a low silver gyroscopic engine, four flat rose-ivory damping plates around a lilac crystal flywheel, gold counterweight gears and black articulated stabilizers", "Stillness mitigation concept"),
            ("Quiet-Arc Shelter Projector", "a crescent silver shielding engine, three rose-ivory shutter jaws around a lilac crystal lens, gold rack drives and overlapping flat defensive emitter plates", "lowest-Health ally shielding concept"),
            ("Cadence Differential Drive", "a compact silver differential engine, four interlocked gold escapement wheels linked to lilac crystal timing rails, rose-ivory piston housings and black drive belts", "Stillness-spend Gauge concept"),
        ),
        arena="a moon-silver open court, shallow dry concentric grooves, ink-black paving, muted lilac hanging cloth and rose-ivory bell supports; broad clear left and right fighting lanes",
        header="seven offset moon-silver gate rings crossing an ink-black courtyard, a suspended rose-ivory bell and lilac cloth ribbons, gold hinges and quiet reflected moonlight",
    ),
    dict(
        name="Myrthen", slug="myrthen", role="Botanic Attacker",
        identity="female, bark-brown hair in a high jagged ponytail with a short side braid and amber leaf clasp, jade eyes, one pale blossom-pink diagonal cheek-paint slash, no mouth nose or eyebrows",
        palette="jade green, bark brown, blossom pink, autumn amber, frost white",
        excluded="blue, cyan, purple, scarlet",
        key="blue", hex="#0000FF",
        clothing="short bark-brown split hunting coat, jade fitted leggings, blossom-pink shoulder lining",
        weapon="exactly two curved sickles joined by one visible chain, two readable grips",
        signature="four botanical wing-fans: pink petals, jade leaves, amber husks, white rime-coated bare twigs; no feather or glass wings",
        titles=("Season Reaper", "First Turning", "Bough and Blade", "Harvest in Motion", "The Orchard Remembers", "When All Seasons Meet"),
        forms=(
            "simple hunting coat and boots, modest sickles with a short slack chain, one jade leaf clasp; no wings yet, low dueling stance",
            "fitted jade forearm plates, amber-edged leather shoulders and white-lined coat; paired leaf fans, polished hooked sickles held apart and a narrow pink petal ribbon",
            "engraved jade breastplate, blossom-shaped pauldrons and amber knee guards; four distinct seasonal botanical fans, layered hunting mantle and ornamented sickles, chain sweeps through open foreground",
            "complete jade enamel armor with amber filigree, sculpted blossom pauldrons and white-edged greaves; four broad seasonal wings and cascading pink-lined mantle, large hooked sickles with thorn guards, twisting airborne harvest stance",
            "majestic jade-and-amber regalia, engraved growth-ring breastplate, sweeping blossom pauldrons and cascading bark-brown mantle; four immense layered seasonal wings, ornate amber sickle guards, jade thorn-chain and segmented orchard crown, dense botanical scrollwork",
            "retain Legendary armor mantle sickles chain and crown; three luxuriant botanical tiers per wing interweave around an immense orchard diadem, prismatic sickle blades and curling seasonal ribbons, sovereign harvest duelist with clear face and grips",
        ),
        icons=(
            ("Passive", "Turning Season", "one triangular growth-ring medallion with three distinct sectors: jade sprout, pink blossom and amber grain head, a white edge marking the return"),
            ("Skill 1", "Reaper's Claim", "two floating jade sickles linked by one brown chain enclosing an amber seed-shaped target notch, one pink petal caught on a blade"),
            ("Skill 2", "Turn the Bough", "one jade sprout curling through a pink blossom into an amber grain sickle, three interlocked flat botanical segments"),
            ("Last Flare", "All That Ripens", "two floating ornate jade sickles crossing around a dense amber harvest knot, pink petals and white rime twigs bound inside a three-part growth-ring frame"),
        ),
        masters=(
            ("Seasonwheel Harvest Transmission", "a jade three-lobed transmission engine, pink crystal germination cartridge and amber harvest rotor connected by bark-brown planetary gears, white faceted timing teeth", "Harvest strength and retained-season concept"),
            ("Seedtrace Pursuit Distributor", "a long jade targeting machine, one amber crystal indexing drum feeding three articulated pink-tipped relay arms, brown rack rails and white tracking apertures", "mark transfer concept"),
            ("Reaping-Tide Recovery Dynamo", "a broad jade recovery engine, paired amber sickle-shaped rotors feeding a pink crystal regeneration cartridge, white pump housings and brown geared Gauge flywheels", "kill healing and Gauge concept"),
        ),
        arena="a terraced orchard dueling floor, jade root rails and bark-brown paving, separate pink blossom amber harvest and white rime groves, no blue frost; broad clear left and right fighting lanes",
        header="four intertwined orchard boughs carrying pink blossoms jade leaves amber seed husks and white rime twigs, two crossed jade sickles joined by one brown chain, dark brown grove beyond",
    ),
)


def cutout(design, subject, portrait=False, evolution=1):
    head = f"{PORTRAIT_OPEN}, {STYLE}" if portrait else f"{ICON_RENDERER}, {OBJECT_ONLY}"
    excluded = ", ".join(color for color in design["excluded"].split(", ") if color != design["key"])
    negative = f"{NO}, {excluded}"
    if portrait:
        negative += ", feather wings, extra characters, mouth, nose, eyebrows, lumpy armor"
    else:
        negative += f", {ICON_NO}"
    prompt = (f"{head}. {subject}. Palette only {design['palette']}; prismatic means these colors only. "
              f"{SHARP}. {MARGIN}. Plain solid unlit {design['key']} background ({design['hex']}) "
              "fills every opening, no scenery or cast-shadow backdrop. --ar "
              f"{'4:3' if portrait else '1:1'} --niji 6 --s 100 --q 1 --no {negative}")
    if portrait:
        prompt += f" --sref {references()[evolution]} --sw {REFERENCE_WEIGHT}"
    return prompt


def blocks():
    rows = []
    for design in DESIGNS:
        slug = design["slug"]
        for index, (rarity, title, form) in enumerate(zip(RARITIES, design["titles"], design["forms"]), 1):
            signature = design["signature"] if index >= 3 else "restrained early-form equipment, no mature back array"
            if slug == "solenne" and index == 6:
                signature = "wingless"
            subject = (f"{design['identity']}; {design['clothing']}; {design['weapon']}. {form}. "
                       f"{signature}. {ARMOR_RULE}; "
                       + (f"{CRAFT}; " if index >= 3 else "")
                       + "body one third of canvas height, complete weapon and powers readable, plain background without a separate effect backdrop")
            rows.append((f"{slug}-{index}.png", f"{title}, {design['name']} / {rarity}", cutout(design, subject, True, index)))
        for index, (slot, name, symbol) in enumerate(design["icons"], 1):
            rows.append((f"{slug}-ability-{index}.png", f"{slot}: {name} (proposed label)", cutout(design, symbol)))
        for index, (name, machine, effect) in enumerate(design["masters"], 1):
            foundation = CONDUIT_FOUNDATION.replace(
                "vibrant saturated crimson crystal facets",
                f"vibrant crystal facets restricted to {design['palette']}")
            prompt = cutout(design, f"{machine}; {foundation}, not a building or musical instrument")
            prompt += ", building, cathedral, temple, tower, furniture, musical instrument"
            rows.append((f"master-{slug}-{index}.png", f"{name} / Omnic Master / {effect} (untuned)", prompt))
        for kind, ratio in (("header", "3:1"), ("arena", "16:9")):
            prompt = (f"{design[kind]}. Clean anime scenery, crisp cel shading, {SHARP}. "
                      f"Palette {design['palette']}, dramatic environmental lighting, full-bleed composition. "
                      f"No characters or interface. --ar {ratio} --no text, watermark, people, characters, {QUALITY_NO}")
            rows.append((f"{slug}-{kind}.png", f"{design['name']} trial {kind}", prompt))
    return rows


def document():
    lines = [
        "# Elemental War Phase 1: Caldrex, Solenne and Myrthen",
        "",
        "**45 copy-ready prompts; proposed visual details, not delivered artwork or playable content.**",
        "Approved names/roles/kit outlines are preserved. New form titles, ability labels,",
        "face paint, silhouettes and machine names are visual proposals for owner review.",
        "No runtime names, mechanics, acquisitions, counts or rarities change here.",
        "Each character has six portraits, four ability icons, three Omnic Master",
        "Conduits and a trial header/arena. Normal Attack and Defense use existing",
        "universal artwork; no duplicate basic-action requests.",
        "",
        "## Visual separation and generation contract",
        "",
        "- Same established character art style as the existing roster: original compact",
        "  gacha JRPG chibi renderer, precise anime contours, crisp cel shading, smooth",
        "  non-emissive painted highlights and jewel-like colors. Rounded oversized heads,",
        "  tiny torsos and short limbs stay consistent. Uniqueness means appearance,",
        "  costume, hair, palette, equipment and effects, never a different rendering style.",
        "- Infernis/Tizu are the direct progression reference: modest base, increasingly",
        "  ornate armor and signature weapon, then majestic luxurious prismatic regalia",
        "  with sweeping elemental powers. Not a literal accumulation of hardware parts.",
        "  Use their --niji 6 --s 100 --q 1 settings. Small anatomy never means timid",
        "  equipment or underdeveloped late forms; keep the whole ensemble magnificent.",
        "- Defining motifs persist in every form. Elemental energy grows from a visible",
        "  base-form trace into increasingly elaborate swirling powers, reaching an",
        "  enveloping late-form crescendo without hiding identity or crossing margins.",
        "  This pass changes only Solenne's Omnic prompt; other forms are not rewritten.",
        "- Caldrex: square wingless forge silhouette, ash-white squared hair, ochre cheek stripe,",
        "  black coat/orange sash, brass gate gauntlets and attached opaque heat loops.",
        "- Solenne: wingless off-axis hoop silhouette, black bob/side braid, gold temple bars,",
        "  black/lilac robes, silver plate armor and one chained bell shield.",
        "- Myrthen: jagged ponytail, pink cheek slash, split hunting coat, chained sickles;",
        "  late wings are four botanical materials, not shared feather/glass wings.",
        "- Face paint is the owner's requested graphic decoration, not realistic facial detail.",
        "  Eyes stay the only anatomical facial features. No universal wing requirement.",
        "- Complete15% empty borders; late forms increase interior density, not edge occupancy.",
        "  Sharp cel rendering, flat beveled armor, no key-colored aura or power backsplash.",
        "  Cutout radiance comes from painted facets/specular highlights, never generated bloom.",
        "- Portraits alone use exact evolution-matched guide references at the standard150.",
        "  Signed URLs may expire: obtain a refreshed owner URL rather than substitute.",
        "- Conduits follow Let/Rise's luxury cosmic machinery foundation, not architecture;",
        "  all nine have distinct integrated mechanisms, thematic palettes and no figures.",
        "- Form titles vary without a repeated Eternal/Seraph/Sovereign ladder. Proposed",
        "  display labels retain the existing Prefix, Name compatibility convention.",
        "- Ability labels are proposals, not evidence that exact combat rules are implemented.",
        "  Final image review must check margins, hands/grips, materials and palette over actual pixels.",
        "",
        "[Plan, kit concepts and remaining work](../../docs/phase-1-war-characters.md).",
        "Reproduce: `python tools/build_phase1_war_art.py`.",
        "",
    ]
    for filename, title, prompt in blocks():
        lines += [f"## {title}", "", f"Proposed export: `{filename}` (not a runtime URL).", "", "```text", prompt, "```", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(document(), encoding="utf-8")
    print(f"Wrote {len(blocks())} prompts: {OUTPUT.relative_to(ROOT)}")
