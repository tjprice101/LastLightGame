"""Reproduce the three pending Elemental War visual proposals; never runtime art."""
from pathlib import Path

from build_calamitic_art import CONDUIT_FOUNDATION, references
from character_palette import REFERENCE_WEIGHT
from prompt_quality import (
    ARMOR_RULE, ICON_NO, ICON_RENDERER, OBJECT_ONLY, PORTRAIT_FRAME,
    QUALITY_NO, SHARP,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Art" / "characters" / "Elemental War Phase 1.md"
RARITIES = ("Common", "Uncommon", "Rare", "Epic", "Legendary", "Omnic")
STYLE = "compact anime gacha unit, rounded head tiny torso short limbs, 2.5-3 heads tall, crisp cel shading, non-emissive painted highlights"
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
        signature="wingless; shoulder-mounted exhaust shutters and anchored flat orange heat-ribbon loops, no floating buildings",
        titles=("Kiln Warden", "Banked Fire", "The Furnace Holds", "Bearer of the Closed Gate", "No Flame Passes", "The Last Kiln"),
        forms=(
            "simple coat, short gloves with modest gate plates, sturdy boots; square planted guard, no exhaust crown",
            "brass breastplate, overlapping wrist shutters and heel guards; one short exhaust stack on each shoulder, fists braced together",
            "black beveled shoulder housings, brass elbow pistons and orange inset greaves; four compact exhaust shutters, gauntlets opened sideways",
            "fully plated forge coat, stepped brass gorget and interlocking apron lamellae; six shoulder-mounted exhaust shutters, three flat orange heat loops anchored to gauntlets",
            "retain plated coat gorget and apron; massive asymmetrical furnace pauldrons, nested gauntlet gate jaws, eight rear-mounted exhaust shutters and dense interwoven orange heat loops, frontal locked guard",
            "retain Legendary pauldrons coat gorget apron and gate jaws; twelve articulated exhaust shutters in a compact horseshoe, double piston braces and nested brass pressure rails, dense attached orange heat loops fill interior gaps, fists seal a monumental furnace gate",
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
            "silver breastplate and rose-ivory wrist scales over robe; one small shoulder-yoke hoop, bell held beside one knee",
            "crescent silver pauldrons, flat lamellar overskirt and gold chain guides; two offset shoulder-mounted hoops, bell raised across torso",
            "layered silver collar, rectangular robe armor and crescent greaves; three interlocking yoke hoops, broad bell skirt and two attached lilac vibration arcs, leaning protective stance",
            "retain collar robe armor and greaves; five rose-ivory moon-gate hoops mounted on one silver shoulder yoke, layered chain guards and folded lilac cloth ribbons, bell shield held forward",
            "retain Legendary collar robe armor yoke chain guards and stance; seven off-axis moon-gate hoops with flat gold hinge joints, dense overlapping lilac vibration arcs bound to bell and hoops, elaborately engraved bell shield remains dominant",
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
        signature="four rigid botanical wing-fans rooted in a back harness: pink layered blossom petals, jade leaf blades, amber seed husks, white rime-coated bare twigs; no feather or glass wings",
        titles=("Season Reaper", "First Turning", "Bough and Blade", "Harvest in Motion", "The Orchard Remembers", "When All Seasons Meet"),
        forms=(
            "simple hunting coat and boots, modest sickles with a short slack chain, one jade leaf clasp; no wings yet, low dueling stance",
            "jade forearm plates and brown leather shoulder guards; two small living leaf fans on back harness, sickles held apart",
            "jade breastplate with flat growth-ring engraving, amber knee guards; four small distinct seasonal botanical fans, chain curves across open foreground",
            "layered jade shoulder blades, bark-brown coat armor and white-edged greaves; four broad seasonal fans with distinct materials, pink petal strips attached to harness, twisting two-sickle stance",
            "retain breastplate coat armor and greaves; four immense layered seasonal fans, asymmetrical amber sickle guards, jade thorn-chain links and harness-mounted segmented orchard crown, dense botanical interior",
            "retain Legendary four-material fans armor chain crown and stance; each fan gains three nested botanical tiers, layered pink petals jade leaves amber husks and white rime twigs interleave without recoloring, segmented orchard crown folds around harness, both sickles and chain fully readable",
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
    head = f"{PORTRAIT_FRAME}, {STYLE}" if portrait else f"{ICON_RENDERER}, {OBJECT_ONLY}"
    excluded = ", ".join(color for color in design["excluded"].split(", ") if color != design["key"])
    negative = f"{NO}, {excluded}"
    if portrait:
        negative += ", feather wings, extra characters, mouth, nose, eyebrows, lumpy armor"
    else:
        negative += f", {ICON_NO}"
    prompt = (f"{head}. {subject}. Palette only {design['palette']}; prismatic means these colors only. "
              f"{SHARP}. {MARGIN}. Plain solid unlit {design['key']} background ({design['hex']}) "
              "fills every opening, no scenery or cast-shadow backdrop. --ar "
              f"{'4:3' if portrait else '1:1'} --no {negative}")
    if portrait:
        prompt += f" --sref {references()[evolution]} --sw {REFERENCE_WEIGHT}"
    return prompt


def blocks():
    rows = []
    for design in DESIGNS:
        slug = design["slug"]
        for index, (rarity, title, form) in enumerate(zip(RARITIES, design["titles"], design["forms"]), 1):
            signature = design["signature"] if index >= 3 else "restrained early-form equipment, no mature back array"
            subject = (f"{design['identity']}; {design['clothing']}; {design['weapon']}. {form}. "
                       f"{signature}. {ARMOR_RULE}; powers attach to equipment, nothing behind but flat key")
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
