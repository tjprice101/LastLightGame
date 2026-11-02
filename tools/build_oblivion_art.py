"""Generate the Gates of Oblivion enemy, header and arena prompt pack (D-435)."""
from pathlib import Path

from art_library import art_path
from prompt_quality import SHARP, NO_BACKDROP, ARMOR_RULE, QUALITY_NO, BACKDROP_NO, ARMOR_NO

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = art_path("creatures", "Gates of Oblivion.md", root=ROOT)

# Element accents sit on top of the shared Rise palette (black/white metal, deep crimson).
ACCENTS = {
    "infernic": "molten ember orange",
    "oceanic": "deep sapphire",
    "atmospheric": "pale sky teal",
    "botanic": "living leaf green",
    "tranquilitic": "soft rose pearl",
    "chaotic": "violet",
}
SPREAD = (50, 55, 60, 65, 70, 70, 70, 70, 70, 70)
MARGINS = (25, 22, 20, 17, 15, 15, 15, 15, 15, 15)

# id, name, element, design, pose (order matches src/content/gates-of-oblivion.ts)
ENEMIES = (
    ("shardling-acolyte", "Shardling Acolyte", "infernic",
     "one small hooded Rise construct acolyte, rounded oversized helm head tiny torso short limbs, two crimson sensor eyes only, "
     "simple cracked black-and-white porcelain plating, one short blade assembled from fitted glass shards, "
     "a few ember-orange shard splinters orbiting its hand",
     "hovering right-facing cautious stance"),
    ("glassbound-sentry", "Glassbound Sentry", "tranquilitic",
     "one compact armored Rise sentinel construct with a tall arched glass pane shield, rounded helm head tiny torso short limbs, "
     "two crimson sensor eyes only, white enamel plates edged in black iron, rose-pearl stained glass panels set into its shield "
     "and shoulders, one short iron spear",
     "planted right-facing guarding stance"),
    ("oblivion-lantern-wraith", "Oblivion Lantern-Wraith", "atmospheric",
     "one floating hooded Rise lantern-wraith construct, rounded hood head with two crimson sensor eyes only, tattered layered "
     "black-and-white cloth mantle in opaque solid ribbons, one ornate iron lantern on a long hooked staff holding a solid pale teal "
     "crystal flame, wind-swept opaque teal ribbon trails",
     "drifting right-facing pose with lantern raised"),
    ("fracture-hound", "Fracture Hound", "chaotic",
     "one compact four-legged Rise hunting construct hound, rounded oversized armored head two crimson sensor eyes only, "
     "segmented black obsidian and white porcelain plating split by violet crack lines, jagged glass-shard spine crest and tail, "
     "violet fault-line fragments breaking away beneath its paws",
     "low right-facing pursuit crouch"),
    ("unmade-choir-drone", "Unmade Choir Drone", "oceanic",
     "one floating Rise choir construct, rounded white bell-shaped head with two crimson sensor eyes only, black iron organ-pipe "
     "body ringed with sapphire water-filled glass resonator tubes, two small folded white metal wings, opaque sapphire sound-wave "
     "rings and musical arcs around it",
     "hovering right-facing singing pose"),
    ("crimson-gearwyrm", "Crimson Gearwyrm", "botanic",
     "one coiled serpentine Rise construct wyrm, rounded oversized armored head two crimson sensor eyes only, long segmented body of "
     "interlocking black and white gears with deep crimson plating, living leaf-green roots and thorned vines threaded through its "
     "turning joints, small blossoming buds along the coils",
     "raised right-facing coiled strike pose"),
    ("husk-seraph-of-rise", "Husk-Seraph of Rise", "tranquilitic",
     "one hollow angelic Rise construct seraph, rounded faceless white porcelain helm with two crimson sensor eyes only, slender "
     "hollow armor shell of black filigree and white enamel with a blank nameplate on the chest, four layered white metal feather "
     "wings with rose-pearl glass inlays, broken halo ring of black iron",
     "airborne right-facing solemn hover with wings spread"),
    ("annihilation-colossus-fragment", "Annihilation Colossus Fragment", "infernic",
     "one massive broken fragment of a Rise colossus construct, rounded oversized armored head two crimson sensor eyes only, "
     "huge black and white siege-plate torso and one gigantic engraved fist, deep crimson furnace core exposed through cracked "
     "chest plating, ember-orange opaque sparks and slag ribbons, route-map engravings across its armor",
     "heavy right-facing advancing stance with fist raised"),
    ("fatebreaker-warden", "Fatebreaker Warden", "chaotic",
     "one ornate Rise warden construct, rounded oversized crowned helm two crimson sensor eyes only, elaborate black and white "
     "pearlescent armor with crimson filigree, layered robe-plates, one great severing glaive with a cracked glass blade, an open "
     "iron-bound register book chained at its hip, violet severed-thread ribbons and shattered glass fragments around it, "
     "six black and white mechanical blade wings",
     "airborne right-facing judgment pose with glaive raised"),
    ("gatekeeper-of-oblivion", "Gatekeeper of Oblivion", "oceanic",
     "one colossal majestic Rise gatekeeper construct, rounded oversized crowned helm two crimson sensor eyes only, monumental "
     "black and white pearlescent cathedral armor with deep crimson seams, a giant ornate key fused into a lock-shaped chest core, "
     "towering arched gate-door wings of black iron and white enamel with sapphire stained glass panels, heavy hinge pauldrons, "
     "sapphire flood-current ribbons and broken chain rings circling it, nested cracked halo crowns",
     "imposing right-facing guardian stance before an implied threshold"),
)

NEGATIVE = ("humans, nose, mouth, eyebrows, extra creatures, text, letters, numbers, runes, logo, watermark, interface, "
            "scenery, realistic anatomy, photorealism, 3d render, cropping, background gradient, textured background, "
            "background vignette, floor, cast shadow, glow, light bloom, haze, light spill")


def floors(index, stages=25):
    """Mirror oblivionConstructAtStage: final floor is the Gatekeeper, others spread evenly."""
    if index == len(ENEMIES) - 1:
        return f"floor {stages} (final boss)"
    held = [s for s in range(1, stages) if min(len(ENEMIES) - 2, (s - 1) * (len(ENEMIES) - 1) // (stages - 1)) == index]
    bosses = [s for s in held if s % 5 == 0]
    label = f"floors {held[0]}-{held[-1]}" if len(held) > 1 else f"floor {held[0]}"
    return label + (f" (boss floor {', '.join(map(str, bosses))})" if bosses else "")


def enemy_prompt(index, element, design, pose):
    accent = ACCENTS[element]
    return (
        "full-body gacha JRPG creature illustration, distant pulled-back view of the complete artwork with every wing weapon "
        "tail crown ribbon ring and fragment tip fully visible inside a continuous clear outer safety margin, "
        f"{design}, {pose}, armor and plating are {ARMOR_RULE}, {NO_BACKDROP}, compact body one third of canvas height, "
        f"complete artwork ensemble spans no more than {SPREAD[index]} percent of canvas width and height with at least "
        f"{MARGINS[index]} percent solid background-color margin on all four sides and corners, measured from the outermost "
        "ornament or effect rather than the body, nothing touches edges, pull back the entire ensemble uniformly without "
        "removing or shortening wings equipment powers or ornamentation, dense detailed interior contained within the central "
        f"footprint, {SHARP}, compact chibi creature rendering with clean precise anime contours crisp cel shading smooth non-emissive "
        f"painted highlights, jewel-like black white pearlescent ivory deep crimson and {accent} colors, authored creature colors "
        "control every plate wing ribbon and gem, complete silhouette fully visible with clear empty space beyond every tip, "
        "plain solid green background (#00FF00), completely solid single uniform background color with no shading no gradient "
        "no texture no floor no cast shadow no scenery, flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing "
        "visual effects, powers opaque solid-color hard-edged lines ribbons rings and shapes with non-emissive painted highlights "
        f"--ar 4:3 --niji 6 --s 100 --q 1 --no {NEGATIVE}, {QUALITY_NO}, {BACKDROP_NO}, {ARMOR_NO}"
    )


HEADER = (
    "full-bleed wide gacha JRPG environment illustration, a colossal sealed gate of black iron and white enamel standing alone in "
    "a vast void of shattered glass terraces, towering arched doors split by a glowing deep crimson fracture down the center, "
    "giant fused key and lock mechanism at the heart of the gate, cracked halo rings and floating pearlescent glass shards "
    "drifting around it, black starless sky streaked with crimson and white light, distant broken stairways rising toward the "
    "gate, ornate cathedral filigree and mechanical hinge architecture, no characters or reward portrait grid, strong central "
    "silhouette and quiet readable darker side areas for runtime title overlays, clean precise anime contours crisp cel shading "
    "smooth painted highlights jewel-like black white pearlescent and deep crimson colors, atmospheric full-bleed scenery "
    "lighting, no baked typography --ar 3:1 --niji 6 --s 100 --q 1 --no text, letters, numbers, runes, logo, watermark, "
    "interface, card border, photorealism, 3d render, gritty texture, portrait grid"
)

ARENA = (
    "full-bleed wide gacha JRPG battlefield environment illustration, a wide level floor of polished black glass and white "
    "marble tiles cracked by thin crimson fault lines in the foreground for opposing squads, a monumental sealed gate of black "
    "iron and white enamel centered deep in the background with a deep crimson fracture splitting its doors, broken cathedral "
    "arches and toppled pearlescent pillars along both sides, floating shattered glass panes and cracked halo rings suspended "
    "in a black starless void streaked with crimson and white light, brilliant distant center with a restrained readable dark "
    "combat foreground, no combatants or interface, clean precise anime contours crisp cel shading smooth painted highlights "
    "jewel-like saturated colors atmospheric scenery lighting, complete full-bleed landscape without border --ar 16:9 --niji 6 "
    "--s 100 --q 1 --no text, letters, numbers, runes, logo, watermark, interface, card border, photorealism, 3d render, "
    "gritty texture, portrait framing"
)


def document():
    parts = [
        "# Gates of Oblivion - enemies, header and arena\n",
        "Generated by `tools/build_oblivion_art.py`; do not edit by hand. **All 12 images are pending owner delivery**; "
        "the game shows neutral placeholders until reviewed art is installed.\n",
        "## Shared production contract\n",
        "Ten original Rise constructs (D-435), one form each, Lv.125-170 across 25 floors. Every construct shares the Rise "
        "palette - black and white metal, pearlescent ivory enamel and deep crimson seams - plus one accent for its combat "
        "element. Compact chibi creature rendering: rounded oversized heads, two crimson sensor eyes, no other facial features. "
        "Designs escalate from a small acolyte to the colossal Gatekeeper.\n",
        "Cutouts: completely solid flat green `#00FF00` background with no gradient, floor or shadow; opaque hard-edged powers, "
        "no glow. Edge clearance follows D-135/D-154: the whole ensemble spans at most 50/55/60/65/70% of the canvas with "
        "at least 25/22/20/17/15% empty margin on every side, measured from the outermost tip. Later constructs grow denser "
        "inside that footprint, not wider. Enemy prompts use no `--sref`/`--sw` (D-155); header and arena are full-bleed "
        "scenery.\n",
        "Intake: archive originals under `Art/source/oblivion`, review keys and facing offline, export enemy sprites to "
        "`public/assets/enemies/<art id>.png`, the header to `public/assets/banners/oblivion-banner.png` and the arena to "
        "`public/assets/backgrounds/oblivion-arena.png`. Supplied alpha is authoritative. Register only delivered, reviewed "
        "assets; never request missing PNGs at runtime.\n",
        "## Enemies - 4:3 cutouts\n",
    ]
    for index, (art_id, name, element, design, pose) in enumerate(ENEMIES):
        parts.append(f"### {name} / {floors(index)} / {element.capitalize()}\n")
        parts.append(f"Art ID: `{art_id}`.\n")
        parts.append(f"```text\n{enemy_prompt(index, element, design, pose)}\n```\n")
    parts.append("## Mode header - 3:1\n")
    parts.append("Art ID: `oblivion-banner`.\n")
    parts.append(f"```text\n{HEADER}\n```\n")
    parts.append("## Battle arena - 16:9\n")
    parts.append("Art ID: `oblivion-arena`.\n")
    parts.append(f"```text\n{ARENA}\n```\n")
    parts.append("Regenerate: `python tools\\build_oblivion_art.py`. "
                 "Validate: `python -m unittest discover -s tools -p test_oblivion_art.py`.\n")
    return "\n".join(parts)


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(document(), encoding="utf-8", newline="\n")
    print(OUTPUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
