"""Expand authored Elemental War designs into complete copy-ready prompt packs."""

from pathlib import Path
import re
from character_palette import apply_palette, REFERENCE_WEIGHT
from art_library import art_path

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "Art"
RENDERER = ("original compact gacha JRPG chibi anime renderer, clean precise anime contours, "
            "crisp cel shading, smooth non-emissive painted highlights and jewel-like saturated colors")
CONTAIN = ("complete artwork fully inside the canvas, every weapon ornament and elemental-effect tip visible")
MARGIN = ("continuous clear solid-background safety margin on all four sides and corners, nothing touches or crosses "
          "the frame edges, pull back the whole ensemble uniformly without simplifying armor equipment or powers")
NO = ("text, letters, words, numbers, runes, logo, watermark, interface, card border, cropping, "
      "photorealism, 3d render, gritty texture, realistic anatomy")
CUTOUT_NO = NO + (", scenery, horizon, ground plane, motion blur, background gradient, textured background, "
                  "background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill, "
                  "nose, mouth, eyebrows, facial markings, multiple characters")
RARITIES = ("Common", "Uncommon", "Rare", "Epic", "Legendary", "Omnic")

DESIGNS = (
    {
        "name": "Nerithe", "id": "nerithe", "gender": "female", "element": "Aquatic", "affinity": "water",
        "mode": "The Sea Without a Shore", "key": "orange", "hex": "#FF8000",
        "identity": "ink-blue hair gathered into a side coil, amber eyes, ivory survey coat with brass tide-compass motifs",
        "palette": "ink blue turquoise pearlescent ivory brass and restrained coral",
        "weapon": "one connected surveyor trident with a circular measuring guard three clearly separated tines and visible grip",
        "weapon_final": "one ornate surveyor trident with ivory shell-edged tines brass circular measuring guard ink-blue shaft and inset turquoise coral violet facets, complete functional grip and three clear tines",
        "titles": ("Uncharted Tide", "Current Surveyor", "Keeper of the Spiral Sea", "Admiral of the Folded Ocean",
                   "Sovereign of the Abyssal Meridian", "The Sea Without a Shore"),
        "forms": (
            "simple belted survey coat short boots one small brass compass disk and modest trident, firm planted scout stance, two short opaque turquoise current strokes beside her feet, modest clean silhouette",
            "fitted ivory tide torso plates brass wrist plates asymmetrical ink-blue chart cape and fin boots, broad measuring guard on trident, angled forward surveying stance, paired opaque current arcs curling behind shoulders",
            "spiraled nautilus left pauldron layered ivory hip plates fin greaves and double chart mantle, trident with shell-edged tines, pivoting sideways with complete feet visible, three overlapping rigid spiral tide fans behind the armor",
            "broad articulated sea-chart shoulder armor segmented brass gauntlets crescent greaves and layered ivory chart cape, trident guard becomes a nested compass wheel, airborne diagonal surveying pose, four enormous folding sea-map panels behind her with turquoise contour bands and two off-axis pressure-dial arches",
            "monumental nautilus pauldrons shell-vault collar overlapping chart-plate skirt and heavy crescent greaves, chromatic trident with a nested brass meridian guard, centered suspended admiral pose, two massive spiraled nautilus vaults and six interlocked opaque tide terraces fill the rear interior with dense ivory turquoise brass coral and violet construction",
            "retain the Legendary nautilus pauldrons shell-vault collar chart-plate skirt crescent greaves chromatic trident and suspended admiral pose, expand the two nautilus vaults into three nested folded-ocean crowns and twelve overlapping opaque tide terraces, immense spiraled shell buttresses interwoven pressure walls and brass meridian ribs dominate the entire ensemble, dense offset turquoise current fans overlap behind her without hiding eyes hands or functional trident, formidable compact human at the heart of a vast sea-map engine",
        ),
        "icons": (
            ("Passive", "Uncharted Current", "one brass compass wheel holding a tightly folded turquoise current spiral", "Proposed Gauge-flow identity; coefficients unapproved."),
            ("Skill 1", "Meridian Break", "one ivory trident head splitting a thick turquoise pressure wedge with a brass measuring arc", "Proposed single-target pressure strike."),
            ("Skill 2", "Fold the Sea", "three interlocking folded turquoise wave plates around one ivory spiral shell", "Proposed area tide attack."),
            ("Last Flare", "Ocean Beyond the Map", "one crowned nautilus shell inside three offset brass meridian arcs and dense turquoise tide bands", "Proposed area finishing skill."),
            ("Normal Attack", "Surveyor's Thrust", "one diagonal survey trident with three ivory tines and one short turquoise strike stroke", "Standard attack identity."),
            ("Defense", "Charted Shelter", "one ivory shell shield backed by two folded turquoise chart plates", "Defense identity."),
        ),
        "arena": "an immense dry ivory surveying platform suspended above a folded turquoise ocean, spiraled shell pylons brass meridian bridges and distant vertical wave terraces, readable flat fighting ledges at left and right with a clear central interval, ink-blue depths and coral marker stones",
        "header": "a monumental ivory nautilus observatory above interlocked turquoise seas, brass meridian arcs cross the horizon and six folded tidal terraces rise behind a tiny distant cartographer silhouette, pressure and navigational grandeur rather than a generic underwater palace",
    },
    {
        "name": "Orvella", "id": "orvella", "gender": "female", "element": "Tectonic", "affinity": "earth",
        "mode": "The Throne Beneath the World", "key": "green", "hex": "#00FF00",
        "identity": "cropped obsidian hair, copper eyes, slate builder mantle with ivory foundation plates and red-jasper seam motifs",
        "palette": "slate charcoal ivory copper jasper red and violet geode facets",
        "weapon": "one connected plumbline scepter with a physical hanging keystone inside its open triangular head and a visible grip",
        "weapon_final": "one monumental plumbline scepter with copper triangular head ivory beveled braces a physical suspended red-jasper keystone violet geode inlays and a connected slate shaft, complete visible grip",
        "titles": ("First Foundation", "Mason of the Faultline", "Keeper of the Buried Vault",
                   "Architect of the Moving Citadel", "Sovereign of the Deep Foundations", "The Throne Beneath the World"),
        "forms": (
            "simple slate builder mantle ivory wrist guard short work boots and modest triangular keystone scepter, firmly planted surveying stance, one small suspended jasper masonry wedge beside her, calm precise structural silhouette",
            "fitted segmented ivory foundation torso plates wedge-shaped copper shoulder plates slate apron and reinforced boots, larger open triangular scepter head, braced quarter-turn stance, two thick suspended masonry slabs and short red fault seams behind her",
            "geode pauldrons tessellated ivory apron armor copper gauntlets and stepped stone greaves, scepter with a suspended jasper keystone and violet facets, poised structural inspection stance, five interlocking stone fan plates behind her with clear copper joints",
            "layered buttress shoulders vaulted ivory collar interlocked foundation skirt and heavy wedge boots, copper triangular scepter gains nested physical braces, elevated centered stance, three split geode vault arches and six ordered keystone satellites assemble dense architectural armor behind her",
            "monumental stepped pauldrons geode vault collar tessellated ivory copper foundation mantle and heavy column greaves, suspended keystone scepter with thick copper head and jasper core, commanding compact seated-in-air stance without a chair, immense split violet geode vault behind her flanked by six stepped fault columns and layered foundation terraces",
            "retain the Legendary stepped pauldrons geode vault collar tessellated foundation mantle column greaves suspended scepter and commanding stance, expand the split geode vault into three nested foundation crowns with twelve offset buttress columns and overlapping tessellated stone walls, copper joints jasper seams and violet crystal planes form an immense coherent load-bearing throne silhouette around a small human anchor, densely layered weight and pressure without scenery or literal ground",
        ),
        "icons": (
            ("Passive", "Load-Bearing Will", "one ivory keystone supporting two copper-braced slate arches", "Proposed sustained-defense identity."),
            ("Skill 1", "Keystone Reversal", "one red-jasper wedge rebounding between two thick ivory shield plates", "Proposed guarded retaliation; counter rules unapproved."),
            ("Skill 2", "Raise the Faultline", "one split slate wall with red seam rising behind a compact ivory shield", "Proposed protection plus focused strike."),
            ("Last Flare", "Worldweight Citadel", "one violet geode vault crowned by three stepped ivory copper foundation arches", "Proposed protective area finishing skill."),
            ("Normal Attack", "Plumbline Strike", "one triangular copper scepter head with suspended red-jasper keystone and a short angular impact stroke", "Standard attack identity."),
            ("Defense", "Foundation Brace", "one tessellated slate shield seated in an ivory copper buttress", "Defense identity."),
        ),
        "arena": "a colossal subterranean geode vault with a broad dry ivory masonry bridge across a deep violet fissure, copper load-bearing braces stepped slate buttresses and jasper fault seams, readable flat combat platforms on the left and right and a clear central lane, distant foundation crowns layered in the background",
        "header": "an impossible buried citadel assembled from nested ivory foundation arches slate stepped columns and violet geode vaults, copper joints and red-jasper fault seams, one tiny distant architect on a central masonry bridge, immense precise structural power rather than a generic mountain vista",
    },
    {
        "name": "Vaelor", "id": "vaelor", "gender": "male", "element": "Voltaic", "affinity": "electric",
        "mode": "The Sky's Final Chord", "key": "orange", "hex": "#FF8000",
        "identity": "swept silver hair with one navy streak, violet eyes, cobalt conductor coat with copper braces and fork-shaped clasps",
        "palette": "cobalt navy ivory copper violet and sharply bounded electric cyan",
        "weapon": "one connected long tuning-fork polearm with two equal prongs a clear crossbrace and a visible grip",
        "weapon_final": "one elaborate tuning-fork polearm with two equal ivory copper prongs navy resonator spine cobalt grip violet ceramic insulators and inset cyan facets, complete connected shaft and functional crossbrace",
        "titles": ("Quiet Voltage", "Keeper of the Stormbeat", "Marshal of the Thunder Choir",
                   "Conductor of the Broken Sky", "Sovereign of the Final Frequency", "The Sky's Final Chord"),
        "forms": (
            "simple short cobalt coat copper wrist brace modest fork polearm and one small resonator disk, balanced ready stance, two short opaque cyan zigzag strokes, restrained precise conductor silhouette",
            "fitted ivory capacitor cuffs copper shoulder brackets split cobalt coat tails and insulated boots, taller equal-prong polearm, angled conducting stance with complete feet visible, paired rigid cyan lightning strokes and two compact resonator disks",
            "layered resonator pauldrons fork-clasp torso plates armored boots and pleated cobalt conductor mantle, polearm with violet insulators, pivoting conducting stance, broad five-prong fork-comb fan behind shoulders with opaque cyan angular staves",
            "massive capacitor shoulders stacked copper braces ivory collar and segmented cobalt mantle, tuning-fork polearm gains articulated crossbrace, suspended conducting pose, four giant resonator combs eight staggered lightning staves and two drum-shaped capacitors build dense asymmetrical rear architecture",
            "towering fork pauldrons ivory resonator crown layered cobalt mantle copper capacitor gauntlets and heavy insulated greaves, chromatic equal-prong polearm with violet insulators, commanding suspended conducting pose, six immense fork arrays four drum capacitors and a diagonal cyan thunder-stave lattice fill the rear interior",
            "retain the Legendary fork pauldrons resonator crown cobalt mantle copper gauntlets insulated greaves chromatic polearm and conducting pose, expand into three overlapping resonator crowns twelve off-axis fork arrays eight drum capacitors and densely interwoven jagged cyan thunder staves, giant ivory copper comb teeth and violet ceramic braces assemble an immense intimidating storm orchestra around the same small human, clear face hand and polearm window through layered electric architecture",
        ),
        "icons": (
            ("Passive", "Standing Thunder", "one copper drum capacitor clasped by two ivory tuning-fork prongs and a cyan zigzag", "Proposed stored-resonance identity; mechanics unapproved."),
            ("Skill 1", "Forked Cadence", "one twin-prong ivory fork producing two separate solid cyan angular impact wedges", "Proposed focused double impact."),
            ("Skill 2", "Resonance Cascade", "three staggered copper resonator teeth linked by a single sharp cyan lightning stave", "Proposed area electrical sequence."),
            ("Last Flare", "Last Chord of the Sky", "one crowned ivory resonator comb around a copper drum and three overlapping cyan thunder staves", "Proposed burst finishing skill."),
            ("Normal Attack", "Tuning Strike", "one diagonal ivory copper tuning-fork polearm head with a short cyan strike wedge", "Standard attack identity."),
            ("Defense", "Insulated Stance", "one cobalt shield with thick ivory ceramic rim and copper fork clasp", "Defense identity."),
        ),
        "arena": "a vast cobalt resonator causeway suspended between storm towers, copper drum capacitors ivory tuning-fork pylons and violet ceramic bridges, cyan lightning patterns remain behind the fighting platform, readable dry left and right combat ledges with a clear center, dramatic storm depth without obscuring combatants",
        "header": "a colossal skyborne thunder orchestra of ivory tuning-fork towers copper capacitor drums cobalt bridges and violet ceramic resonator crowns, branching cyan lightning crosses the distant sky behind a tiny conductor silhouette, monumental engineered rhythm rather than generic angel wings",
    },
)


def references():
    text = (art_path("midjourney-character-style-prompt.md", root=ROOT)).read_text(encoding="utf-8")
    found = dict((int(evo), url) for evo, url in re.findall(r"^\| ([0-6]) \| (\S+) \|$", text, re.M))
    if set(found) != set(range(7)):
        raise ValueError("Approved reference table must contain Evo.0-6.")
    return found


def flags(ratio, reference=None, scenery=False):
    exclusions = NO + ", character portrait grid, text panels, interface framing" if scenery else CUTOUT_NO
    return (f" --ar {ratio} --niji 6 --s 100 --q 1 --no {exclusions}"
            + (f" --sref {reference} --sw {REFERENCE_WEIGHT}" if reference is not None else ""))


def background(design):
    return (f"plain solid {design['key']} background ({design['hex']}), flat unlit color edge to edge "
            "and through all openings, subject colors unchanged, no glows or glowing visual effects")


def block(heading, asset, prompt, registered=False):
    status = "Runtime asset ID" if registered else "Proposed asset ID"
    note = "supplied and installed" if registered else "not registered"
    return f"### {heading}\n\n{status}: `{asset}` ({note}).\n\n```text\n{prompt}\n```\n"


def pack(design, refs):
    name, identity = design["name"], design["id"]
    installed = True
    status = (
        f"**Implemented and supplied (D-152/D-156):** six portraits and {'four ability' if identity == 'nerithe' else 'six action'} icons installed; "
        "playable character and ten-stage trial registered, with supplied activity header and arena. "
        "Standalone weapon remains pending; Nerithe Normal Attack/Defense icons are not supplied. "
        "Original prompt concepts below are retained; supplied weapon/identity details "
        "are authoritative and are not redesigned to match the proposal. "
        if installed else "**Design proposal only (D-145):** no supplied images, playable registration, "
        "approved kit numbers or banner acquisition. Owner review required. "
    )
    text = [
        f"# {name} Art - Elemental War",
        status + "[Mode/specification](../../docs/elemental-war.md).",
        f"{'Approved' if installed else 'Proposed'} {design['gender']}6-star **{design['element']} Element-Bearer**. "
        f"Sub-mode: **{design['mode']}**. All forms retain the same human identity. "
        "Character and boss share these portraits; review facing for both sides during intake.",
        "## Form line",
        "\n".join(["| Evo. | Rarity | Canonical proposed name |", "| --- | --- | --- |",
                   *[f"| {i} | {rarity} | {title}, {name} |"
                     for i, (rarity, title) in enumerate(zip(RARITIES, design["titles"]), 1)]]),
        "## Generation contract",
        "Six portraits use exact matching Evo.1-6 approved references/weight150. "
        "Each uses a tailored subject palette lock and unwanted-color exclusions (D-159). "
        "Only character portraits use --sref/--sw; production enemies remain reference-free (D-155). "
        "Icons, weapons, items, banners, arenas and all other art use no style-reference flags. "
        "Keep portrait references and the shared renderer fixed during design testing; signed URLs may expire. "
        "Never use proper names, titles or ability lettering as image prose.",
        "Every cutout has two positive containment cues, a contrasting solid unlit key, "
        "non-emissive painted highlights and opaque powers. "
        "Late dense armor/element architecture takes focus without enlarging anatomy. "
        "No old94%/96% near-edge targets; complete containment wins. "
        "Scenery stays full-bleed and may use environmental lighting.",
        "## Six character/boss portraits",
    ]
    for evolution, (rarity, title, form) in enumerate(zip(RARITIES, design["titles"], design["forms"]), 1):
        body = "one third" if evolution < 5 else "one quarter" if evolution == 5 else "one fifth"
        prompt = (
            f"full-body gacha JRPG {design['affinity']}-element unit illustration, one human {design['gender']} "
            f"with {design['identity']}, {CONTAIN}, rounded oversized head tiny torso short limbs "
            f"2.5-3 heads tall, eyes only with no other facial features, fully covered practical clothing and armor, "
            f"{design['weapon']}, {form}, left-facing three-quarter weapon stance with face readable, "
            f"compact human body occupies {body} of canvas height while equipment and elemental structures spread "
            f"around it, opaque solid-color {design['affinity']} powers with crisp hard edges, "
            f"{RENDERER}, consistent {design['palette']} palette, {MARGIN}, {background(design)}"
            + flags("4:3", refs[evolution])
        )
        prompt = apply_palette(prompt, design["name"])
        asset = identity if evolution == 1 else f"{identity}-evo-{evolution}"
        text.append(block(f"Evo.{evolution} / {rarity} - {title}, {name}", asset, prompt, installed))
    text.append("## Six ability and action icons")
    for index, (kind, name, symbol, purpose) in enumerate(design["icons"]):
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        prompt = (f"square gacha JRPG {design['affinity']}-element ability icon, {symbol}, {CONTAIN}, "
                  "one cohesive chunky symbol readable at small button size, broad separated shapes and open key channels, "
                  f"{RENDERER}, consistent {design['palette']} palette, {MARGIN}, {background(design)}"
                  + flags("1:1"))
        prompt = apply_palette(prompt, design["name"])
        action = ("passive", "skill1", "skill2", "ultimate", "light", "defend")[index]
        supplied = identity != "nerithe" or action not in ("light", "defend")
        text.append(block(f"{kind} - {name}", f"{identity}-{action if installed else slug}", prompt, supplied) + f"\n{purpose}\n")
    prompt = (f"standalone gacha JRPG weapon cutout, {design['weapon_final']}, {CONTAIN}, "
              "single object diagonal arrangement minimal foreshortening, complete weapon and every tip inside the image, "
              f"{RENDERER}, consistent {design['palette']} palette, {MARGIN}, {background(design)}"
              + flags("3:2"))
    prompt = apply_palette(prompt, design["name"])
    text.extend(["## Signature weapon", block("Final-form weapon reference", f"{identity}-weapon", prompt)])
    text.append("## Sub-mode scenery")
    for heading, suffix, description, ratio in (
        ("Activity banner", "banner", design["header"], "3:1"),
        ("Battle arena", "arena", design["arena"], "16:9"),
    ):
        prompt = (f"full-bleed gacha JRPG illustrated {heading.lower()}, {description}, "
                  f"{RENDERER}, consistent {design['palette']} palette, painterly environmental lighting "
                  "and deep layered scenery in the same anime style, no unit portrait grid, no lettering, "
                  "scenery reaches every edge, no cutout matte or decorative frame"
                  + flags(ratio, scenery=True))
        text.append(block(heading, f"elemental-war-{identity}-{suffix}", prompt, True))
    text.extend([
        "## Export and visual review",
        "- Portraits: transparent960px canvas, reviewed uniform trim/resize/pad; preserve supplied alpha. "
        "Icons: transparent256px/224px content. Weapon: transparent cutout retaining the complete tip/grip.",
        ("- Installed originals are byte-preserved under Art/source/elemental-war. "
         "Art/provenance/elemental-war-intake.json records all40 source/export hashes; "
         "Art/provenance/elemental-war-settings.json records individual keys, gaps, gradient samples and facing. "
         "Scenery is copied byte-for-byte; missing weapon/action IDs remain proposals, never requested URLs."
         if installed else "- Source images remain byte-preserved under Art/source only after owner delivery. "
         "Do not request these proposed runtime filenames before actual intake."),
        "- Inspect all six at equal body height and thumbnail size: distinct gear/poses, growing dense elemental "
        "architecture, eyes and weapon grip readable; Omnic retains Legendary foundations.",
        "- Inspect every edge/corner and enclosed key gap; never recover margin by deleting detail or clipping tips. "
        "No generated glow/realism/lettering. Scenery is exempt from cutout no-glow/edge-margin rules.",
        "- No source artwork is approved by passing prompt tests; generate and visually review first.",
    ])
    note = ("**Palette control (D-159):** every portrait retains its exact reference URL at150, "
            "with identity-specific subject palette locks and unwanted-color exclusions. "
            "Prismatic/opal describes faceting inside that palette, not extra hues. "
            "Character-specific icons/weapons share the palette without reference flags. "
            "Solid keys, scenery and installed images unchanged.")
    text.insert(1, note)
    return "\n\n".join(text) + "\n"


def family():
    prompt = (
        "full-bleed gacha JRPG endgame activity family banner, three vast interlocking domains arranged as a coherent "
        "triangular horizon, ivory nautilus observatories and folded turquoise seas on the left, stepped slate "
        "foundation citadels and violet geode vaults below, ivory tuning-fork storm towers copper drums and cobalt "
        "sky bridges on the right, three tiny distant fully clothed human challengers provide scale without portrait "
        "panels, monumental elemental rivalry with clear distinct water earth and electrical architecture, "
        f"{RENDERER}, dramatic environmental lighting and deep layered original fantasy scenery, full-bleed "
        "art reaches every edge, no unit reward grid no lettering no interface no cutout matte"
        + flags("3:1", scenery=True)
    )
    return (
        "# Elemental War Art\n\n**All three characters and trials implemented (D-152/D-156).** "
        "Six portraits each, all three activity headers/arenas and16 action/ability icons are installed. "
        "The family header, standalone weapons and Nerithe Normal Attack/Defense icons remain pending. "
        "[Specification and remaining scope](../../docs/elemental-war.md).\n\n"
        "Three original challengers, each with a15-prompt pack: "
        "[Nerithe](../characters/Nerithe%20Art.md), [Orvella](../characters/Orvella%20Art.md), "
        "[Vaelor](../characters/Vaelor%20Art.md). Six portraits, six ability/action icons, weapon, "
        "activity header and arena per character. This family header makes46 total prompts.\n\n"
        "Activity banners are not summon banners or new acquisition pools. "
        "Only character/enemy portraits use --sref/--sw (D-147); icons, weapons and scenery do not. "
        "Names/titles belong in HTML/headings, never in generated art. "
        "Complete-design containment applies to all cutouts, not full-bleed scenery.\n\n"
        + block("Elemental War family banner", "elemental-war-banner", prompt)
        + "\nRegenerate these authored prompt documents with "
        "`python tools\\build_elemental_war_art.py`; validate with "
        "`python -m unittest discover -s tools -p test_elemental_war_art.py`. "
        "Generated pack contents are original authored designs, not scraped artwork. "
        "Keep supplied sources and matte/facing review separate from prompt generation.\n"
    )


def outputs():
    refs = references()
    return {**{art_path(f"{design['name']} Art.md", root=ROOT): pack(design, refs) for design in DESIGNS},
            art_path("Elemental War.md", root=ROOT): family()}


if __name__ == "__main__":
    for path, text in outputs().items():
        path.write_text(text, encoding="utf-8")
        print(path.name)
