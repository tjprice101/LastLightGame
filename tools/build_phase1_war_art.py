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
EVOLUTION_NOTES = {
    "solenne": (
        "Quiet shrine attendant: simple wrap dress, crescent sash clasp and small bell. One ankle-level moonlight trace; no gate array.",
        "Poised bell keeper: adds scalloped cuffs and a pleated silk overskirt, not armor. Larger bell and paired knee/waist ribbons.",
        "Ritual guardian: embroidered bellflower sleeves and petal-fold skirts, two moon-gates and torso spirals. Silver thread replaces plate ornament.",
        "Moonlit procession: broad sleeve trains, opaque petal-tier dress and three gates. Crown-height ribbons, still below late-form density.",
        "Solemn lunar sovereign: cascading brocade and restrained opalescent fabric within her palette, five gates and full-silhouette resonance.",
        "Unyielding lunar sanctuary: retains Legendary dress and expands its bellflower folds, colossal bell, seven-gate mandala and enveloping resonance. No metal bodysuit.",
    ),
    "myrthen": (
        "Nimble orchard scout: short split coat, practical leggings and modest sickles. Four-season blade traces, no wings.",
        "Budding reaper: leaf-stitched cuffs, seed-toggle sash and petal lining; paired fans and calf-level energy. No armor suit.",
        "Season weaver: asymmetrical leaf-cut coat tails and seed-fringe belt; four botanical fans emerge, energy braids around torso.",
        "Harvest dancer: tiered botanical coat-dress and sweeping sleeve streamers preserve leg movement; broad wings and crown-height ribbons.",
        "Orchard regent: lavish leaf-jacquard tails and harvest-knot embroidery, monumental sickles and full-silhouette energy; not triple-tier Omnic wings yet.",
        "All seasons in motion: retains Legendary coat-dress, develops a woven orchard canopy and triple-tier botanical wings around colossal sickles. Blade-sourced seasonal helices culminate the line.",
    ),
}
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
        clothing="opaque ink-black wrap dress, lilac pleats, rose-ivory bellflower folds and crescent sash clasp",
        weapon="one bronze-and-rose-ivory temple bell on two visible chains, held as a shield",
        signature="wingless; bellflower silk folds, silver-thread crescents and opaque lilac bell-resonance ribbons",
        titles=("Moonbell Keeper", "Between Two Chimes", "The Patient Circle", "Keeper of the Unstruck Bell", "A Silence Held", "The Bell That Stayed"),
        forms=(
            "simple opaque black wrap dress with lilac pleats, rose-ivory collar and crescent sash clasp; small bell shield on two short chains, visible clapper; one slender spectral moonlight ribbon curls around her ankles, quiet planted guard",
            "opaque black-lilac silk dress, scalloped bellflower cuffs and pleated overskirt, silver-thread crescent hem; larger bell shield on two chains; paired spectral moonlight ribbons coil from its rim around knees and waist, composed forward guard",
            "layered bellflower dress, rose-ivory petal-fold skirts and long black sleeves embroidered with silver crescents; broad lotus-bell shield on two chains; twin moon-gates and spectral moonlight ribbons spiral around torso and shoulders, steady interception stance",
            "opaque ceremonial silk dress with three lilac petal tiers, broad rose-ivory sleeve trains and silver-thread bellflower embroidery; immense lotus-bell shield on two chains; three crescent moon-gates, spectral moonlight ribbons sweep around feet torso and crown, airborne protective guard",
            "majestic opaque black-lilac bellflower gown, opalescent rose-ivory folds, silver-thread crescent embroidery and cascading brocade trains; monumental bell shield on two chains braced forward; five moon-gates and dense spectral moonlight ribbons encircle the full silhouette, serene unyielding guardian",
            "A colossal lotus-bell shield on two visible chains commands the foreground, engraved rose-ivory petals, visible clapper and taut chain grips; spectral moonlight ribbons strictly silver lilac and rose-ivory unfurl from its ringing rim around feet torso and crown in interwoven rising helices. retain Legendary bellflower gown, expand cascading brocade trains into nested opaque silk petals, silver-thread crescents and prismatic moon-silver diadem; seven moon-gates form a vast asymmetric mandala. Silver-edged sound rings envelop her without hiding face hands or bell; bell braced forward to intercept a strike",
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
        clothing="bark-brown split hunting coat, jade fitted leggings, blossom-pink lining and knotted seed sash",
        weapon="exactly two curved sickles joined by one visible chain, two readable grips",
        signature="four botanical wing-fans: pink petals, jade leaves, amber husks, white rime-coated bare twigs; no feather or glass wings",
        titles=("Season Reaper", "First Turning", "Bough and Blade", "Harvest in Motion", "The Orchard Remembers", "When All Seasons Meet"),
        forms=(
            "simple short split hunting coat, jade leggings, pink lining and seed sash; two modest hooked sickles joined by one chain; four-season energy traces curl beside the blades, no wings yet, low dueling guard",
            "leaf-stitched coat cuffs, amber seed toggles and pink petal lining over jade leggings; larger leaf-guard sickles joined by one chain; paired budding fans and four-season energy ribbons coil around calves and blades, advancing orchard duelist",
            "asymmetrical leaf-cut coat tails, seed-fringe sash and pink embroidered sleeve wraps over jade leggings; long thorn-guard sickles joined by one chain; four botanical fans unfold, four-season energy ribbons braid around waist and shoulders, turning harvest strike",
            "tiered botanical coat-dress, jade leaf-jacquard tails, pink sleeve streamers and amber harvest knots over fitted leggings; immense sickles joined by one thorn-link chain; four seasonal wings and four-season energy ribbons sweep around feet torso and crown, airborne harvest dancer",
            "majestic leaf-jacquard coat-dress, cascading bark-brown tails, pink blossom embroidery and white rime-lace cuffs; monumental prismatic sickles joined by one jade chain; four luxuriant botanical wings, woven orchard crown and four-season energy ribbons surround the full silhouette",
            "retain Legendary coat-dress tails embroidery and rime lace; colossal prismatic sickles with thorn guards joined by one sweeping chain dominate the foreground; four triple-tier botanical wings and woven orchard diadem frame asymmetric living boughs, vast four-season energy ribbons spiral from blades around feet torso and crown, interwoven pink petals jade leaves amber husks and white rime, commanding airborne harvest dancer",
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
    if portrait and design["slug"] in ("solenne", "myrthen"):
        negative = negative.replace(", aura, backsplash", "")
        if design["slug"] == "solenne":
            negative += ", red, yellow, amber"
        negative += ", fire, flames"
        negative += ", glow on edges"
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
            subject = (f"{design['identity']}; {design['clothing']}; {design['weapon']}. {form}. "
                       f"{signature}. {ARMOR_RULE}; "
                       + (f"{CRAFT}; " if index >= 3 else "")
                       + "body one third of canvas height, complete weapon and powers readable, plain background without a separate effect backdrop")
            if slug == "solenne":
                subject = (
                    f"{form}. {design['identity']}; wingless. "
                    "Spectral energy strictly silver lilac and rose-ivory; gold only on metal trim, never in the energy. "
                    "Visible bell/crescent motif, hands control chains; serene protective resolve. "
                    "Body one third of canvas height; opaque silk, crisp embroidered folds, sharp energy, face hands and bell unobscured"
                )
            elif slug == "myrthen":
                subject = (
                    f"{form}. {design['identity']}; {design['clothing']}. "
                    "Four-season energy strictly pink jade amber and white, never blue ice or fire. "
                    + ("Wing materials: pink petals, jade leaves, amber husks, white rime-coated bare twigs; no feather or glass wings. "
                       if index >= 3 else "")
                    + "Body one third of canvas height; razor-defined opaque ribbons, "
                    "crisp woven textile folds, face hands both sickle grips and complete chain unobscured"
                )
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
        "  expressive costume and signature weapon, then majestic luxurious regalia",
        "  with sweeping elemental powers. Not a literal accumulation of hardware parts.",
        "  Use their --niji 6 --s 100 --q 1 settings. Small anatomy never means timid",
        "  equipment or underdeveloped late forms; keep the whole ensemble magnificent.",
        "- Defining motifs persist in every form. Elemental energy grows from a visible",
        "  base-form trace into increasingly elaborate swirling powers, reaching an",
        "  enveloping late-form crescendo without hiding identity or crossing margins.",
        "  Solenne's earlier forms now lead into her lunar-gown Omnic; Myrthen's full",
        "  line follows the same weapon-led, identity-specific power crescendo.",
        "  Caldrex remains unchanged. Solenne/Myrthen now use character-specific",
        "  textile couture, not a mandatory armor/prismatic-armor progression.",
        "  Solenne feels like an unyielding lunar sanctuary; Myrthen like seasons",
        "  moving through a nimble harvest dancer. Power follows those identities.",
        "  Opalescence means bounded fabric sheen in the authored palette, not rainbow hues.",
        "- Solenne/Myrthen negative prompts explicitly exclude glow on edges, not",
        "  their sharply defined authored spectral/seasonal energy or painted highlights.",
        "- Fixed identity applies to every form: no hair/eye/paint color or hairstyle",
        "  transformations are intended. Adjacent notes explain purposeful progression.",
        "- Caldrex: square wingless forge silhouette, ash-white squared hair, ochre cheek stripe,",
        "  black coat/orange sash, brass gate gauntlets and attached opaque heat loops.",
        "- Solenne: wingless off-axis hoop silhouette, black bob/side braid, gold temple bars,",
        "  opaque black/lilac bellflower silk, silver-thread crescents and chained bell shield.",
        "- Myrthen: jagged ponytail, pink cheek slash, leaf-jacquard split coat-dress, chained sickles;",
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
        lines += [f"## {title}", "", f"Proposed export: `{filename}` (not a runtime URL).", ""]
        for design in DESIGNS:
            if design["slug"] not in EVOLUTION_NOTES:
                continue
            for index, note in enumerate(EVOLUTION_NOTES[design["slug"]], 1):
                if filename == f"{design['slug']}-{index}.png":
                    lines += [
                        f"**Fixed identity (all six forms):** {design['identity']}.",
                        f"**Costume/weapon continuity:** {design['clothing']}; {design['weapon']}. "
                        "Later textiles develop this costume; weapon size/ornament changes, not weapon identity.",
                        f"**Intentional evolution changes:** {note} No hair, eye or paint changes.",
                        "",
                    ]
        lines += ["```text", prompt, "```", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(document(), encoding="utf-8")
    print(f"Wrote {len(blocks())} prompts: {OUTPUT.relative_to(ROOT)}")
