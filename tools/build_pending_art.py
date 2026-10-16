"""Build the current Calamity and native-identity generation queue."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CALAMITY_PATH = ROOT / "Art" / "creatures" / "Calamity.md"
NATIVE_PATH = ROOT / "Art" / "ui" / "Native Identity Status Icons.md"

BOSSES = [
    ("treasury", "Crown of the Ruined Vault", "Crownfall Treasury",
     "a massive crowned gemstone slime vault sovereign, compact rounded black faceted body, ivory crown buttresses, enormous openwork treasury crown, locked breastplate vault door, symmetrical stacks of cut prism ingots, scarlet and white crystalline fracture ribbons orbiting its throne-like lower body"),
    ("sanctuary", "White Pyre Hierophant", "Rosethorn Sanctuary",
     "a regal floating flame-wisp hierophant with a face-free white flame body held inside black reliquary armor, an immense thorn mitre, layered ivory rose-petal mantle, six branching white-pyre wings with scarlet veins, hanging black censer bells and a complete rose-root pedestal"),
    ("heavens", "Heavenfall Seraph", "Soar to Heaven",
     "a majestic compact celestial slime seraph, pearl-white faceted central body, black cathedral breastplate, six broad articulated feather-and-prism wings, three nested broken halo rings, suspended ivory spear fins and scarlet triple comet trails, a clear original nonhuman silhouette"),
    ("abyss", "Abyssal Nullmaw", "Delve into the Abyss",
     "a formidable compact abyssal slime predator, black obsidian droplet body and enormous empty geometric maw framed by ivory fangs, broad hooked tail, paired white horn arches, interlocking scarlet hunting rings and short heavy claw limbs, no gore or humanoid anatomy"),
    ("machines", "Catastrophe Prime", "Awaken the Machines",
     "an ancient-war autonomous siege mechanism, compact heavy black-and-white armored chassis, colossal articulated shoulder turbines, six radial ivory cannon petals around a scarlet faceted reactor, planted black mechanical feet, exposed gear bridges and opaque white discharge rails, machinery rather than a living person"),
    ("roses", "The Last Scarlet Bloom", "Passion of Crimson Roses",
     "a divine nonhuman rose-flame sovereign, black thorn-wrapped compact wisp body within a huge ivory rose corolla, twelve sweeping thorn-petal wings, nested scarlet rose mandalas, white root ribbons and a complete black root-crown base, intricate organic geometry distinct from the hierophant"),
    ("infernic", "Ashcrown Cataclysm", "Flaming Depths",
     "a compact volcanic drake sovereign, black basalt plated body, ivory furnace jaw and ash crown, massive curled tail, two broad segmented flame wings, complete clawed feet, layered scarlet magma plates and opaque white eruption tongues, stout stylized anatomy rather than realistic reptile proportions"),
    ("oceanic", "Leviathan of the White Wake", "Oceanic Valley",
     "a compact coiled leviathan with a complete looping black pearl-armored body, ivory nautilus crest and broad fin sails, clearly visible head and tail, layered white wave shields and scarlet tidal fracture ribbons following the coil, floating low over a small integral wave curl rather than scenery"),
    ("atmospheric", "Riftstorm Harbinger", "Sky-bound Rift",
     "a formidable compact storm raptor with black plated breast, ivory hooked beak and crown, four broad articulated wing fans, complete tucked talons and long fully visible tail streamers, four scarlet wind scythes and opaque white pressure rings, dense feather architecture without realistic anatomy"),
    ("botanic", "Pallid Root Sovereign", "Garden of Beauty",
     "a compact ancient root guardian with black bark torso, ivory flower-mask face without human features, a great branching canopy crown, broad root-arm shields and complete intertwined root feet, scarlet sap facets and white leaf spirals arranged as a dense living cathedral"),
    ("tranquilitic", "Silent Meridian", "City of Heaven",
     "a compact nonhuman floating guardian built from black porcelain and ivory nested meridian rings, a faceless central pearl prism, four symmetrical orbital shield petals, a tall complete tuning-spire crown and scarlet alignment rails, serene monumental precision distinct from a winged seraph"),
    ("chaotic", "The Scarlet Unmaking", "Ruins of Chaos",
     "a compact hovering nonhuman fractal sovereign, black angular core held inside interleaved ivory polyhedral armor, offset segmented crown, six dislocated but visibly connected blade-ring arms, scarlet tessellated fracture ribbons and white geometric shard fans, coherent readable silhouette rather than random debris"),
]

CHESTS = [
    ("slayer", "Slayer",
     "a substantial closed black-and-white coffer, broad ivory beveled lid, black armored belly, single large scarlet diamond clasp, paired angular corner guards and a restrained crown of red and white fractal crystal fins"),
    ("master", "Master",
     "a majestic closed black-and-white reliquary chest, retain a recognizable broad coffer silhouette, double stepped ivory lid, layered black buttresses, a scarlet double-diamond clasp, interlocking white mechanical ribs and two sweeping red-and-white fractal wing arches"),
    ("omnipotent", "Omnipotent",
     "a monumental closed black-and-white cosmic coffer, broad triple-tier ivory lid on an obsidian vault body, nested scarlet prism heart clasp, dense articulated corner towers, layered red-and-white fractal wing fans, interwoven ivory orbital crown rings and a complete small armored base"),
]

ARENAS = [
    ("1", "EX+1",
     "a vast broken black basalt causeway crossing a white mineral basin, huge distant ivory fracture arches, scarlet energy streams cutting through the rear horizon, sparse floating black monoliths and a clean central combat clearing, dangerous first threshold with strong readable silhouettes"),
    ("2", "EX+2",
     "an immense suspended black-and-white geometric citadel terrace above a fractured ivory abyss, towering interlocked buttress rings in the distance, scarlet energy waterfalls and white lightning converging behind the terrace, more elaborate layered architecture than the first threshold"),
    ("3", "EX+3",
     "the final cosmic fracture amphitheater, a broad obsidian and ivory arena inside colossal nested shattered world-rings, red and white elemental storms colliding across a deep black celestial horizon, distant impossible stepped cathedrals and tightly controlled bright fracture seams, overwhelming scale without cluttering combat space"),
]

# Each row is a distinct pictogram, not a screenshot of a numerical widget.
STATUSES = [
    ("flora-seed", "Flora Seed", "Flora", "a single closed emerald seed held by two moss leaves above a small ivory root curl"),
    ("flora-empowered-seed", "Empowered Seed", "Flora", "a large faceted emerald seed within three concentric leaf petals and a pale-rose crown, visibly more layered than the ordinary seed"),
    ("atmoso-cyclone", "Cyclone and Gusts", "Atmoso", "one compact three-tier navy and silver wind spiral enclosing four clearly separated teal feather vanes"),
    ("elise-held-blade", "Held Shuriken", "Elise", "one complete four-point silver shuriken with an open central grip, electric-lime inlays and a charcoal resting cradle"),
    ("elise-lodged-blade", "Lodged Shuriken", "Elise", "one complete four-point silver shuriken lodged into a small faceless charcoal target prism, two mint directional chevrons pointing inward"),
    ("bliss-opening", "Opening Posture", "Bliss", "one closed ivory warfan beginning to unfold, soft-rose feathers sweeping forward from a single antique-gold hinge"),
    ("bliss-passing", "Passing Posture", "Bliss", "one half-open ivory warfan crossed by a soft-rose feather ribbon forming a balanced sideways S"),
    ("bliss-closing", "Closing Posture", "Bliss", "one fully opened ivory warfan enclosing a small pearl shield, soft-rose feather tips returning toward the hinge"),
    ("disciple-strike", "Strike Instruction", "Disciple", "one sharp silver psychic chevron inside an open amethyst mindcrown, three plum planes pointing forward"),
    ("disciple-shelter", "Shelter Instruction", "Disciple", "one rounded silver psychic shield inside an open amethyst mindcrown, three plum planes closing protectively around it"),
    ("disciple-resolve", "Resolve Instruction", "Disciple", "one interlocked silver chevron and rounded shield inside an open amethyst mindcrown, clearly readable paired offensive and protective forms"),
    ("aurora-seal", "Special-Skill Seal", "Aurora", "one ivory concentric lens encircling a restrained amber prism, an obsidian shutter bar crossing its center without letters or runes"),
    ("aurora-ultimate-ward", "Ultimate Ward", "Aurora", "one pearl umbrella-like lens shield beneath a large antique-gold crown arc, an obsidian descending spear stopped above the shield"),
    ("razor-wounds", "Stored Wounds", "Razor", "one intact graphite armor plate with three deep-violet fracture inlays held in a silver reservoir frame, symbolic stored pressure without blood or injury"),
    ("razor-bastion", "Bastion", "Razor", "one broad ink-black shield enclosed by two deep-violet crescent wings and a complete silver lower brace"),
    ("rosetta-quarry", "Quarry and Contributors", "Rosetta", "one crimson rose within an ivory open bow-shaped target ring, three separate pearl arrowhead petals converging toward its center"),
    ("thornia-trap", "Thorn Trap", "Thornia", "one open charcoal thorn rose with exactly three large inward-curving scarlet hooks around a pearlescent center"),
    ("thornia-empowered-trap", "Empowered Thorn Trap", "Thornia", "one double-corolla charcoal thorn rose with exactly three large paired scarlet hook branches and a strong pearlescent crown"),
    ("crinso-gold-edge", "Gold Edge", "Crinso", "one connected double-ended sword with a central grip and opposed blades, one dominant amber blade and a restrained charcoal opposing blade, ivory rose-shaped hilt"),
    ("crinso-crimson-edge", "Crimson Edge", "Crinso", "one connected double-ended sword with a central grip and opposed blades, one dominant scarlet blade and a restrained charcoal opposing blade, ivory rose-shaped hilt"),
    ("crinso-combo", "Alternating Combo", "Crinso", "three interlocked broad chain links alternating amber scarlet amber, a small ivory rose hub, no numbers or detached extra links"),
    ("nerithe-survey", "Survey", "Nerithe", "one ivory trident pointer crossing an ink-blue circular sea chart with exactly three brass navigation studs and a turquoise folded current"),
    ("orvella-foundation", "Shared Foundation", "Orvella", "one broad slate foundation keystone supporting three ivory piers linked by copper braces, a violet geode inset within the central load-bearing block"),
    ("vaelor-tune", "Tune Beat", "Vaelor", "one ivory tuning fork above a single small cobalt resonance arc, copper collar and one restrained cyan facet"),
    ("vaelor-rise", "Rise Beat", "Vaelor", "one ivory tuning fork above two ascending cobalt resonance arcs, copper collar and two restrained cyan facets"),
    ("vaelor-crescendo", "Crescendo Beat", "Vaelor", "one ivory tuning fork inside three broad nested cobalt resonance arcs, copper crown and a strong cyan central facet"),
    ("bruno-cover", "Cover", "Bruno", "one broad basalt shield in front of a smaller ochre shield, a single bronze bridge redirecting a faceted amber arrow into the larger shield"),
]

PALETTES = {
    "Flora": ("moss emerald lime beige brown pearl and pale rose", "blue"),
    "Atmoso": ("navy sky blue teal silver and pearl", "magenta"),
    "Elise": ("charcoal electric lime mint silver and restrained violet", "magenta"),
    "Bliss": ("ivory pearl soft rose antique gold and pale blue", "green"),
    "Disciple": ("plum black deep violet scarlet magenta silver and amethyst", "green"),
    "Aurora": ("ivory pearl amber antique gold and obsidian", "blue"),
    "Razor": ("ink black graphite deep violet silver and restrained amethyst", "green"),
    "Rosetta": ("crimson scarlet deep red rose and pearlescent ivory", "green"),
    "Thornia": ("charcoal deep crimson scarlet rose and pearlescent ivory", "green"),
    "Crinso": ("charcoal deep crimson scarlet amber rose and pearlescent ivory", "green"),
    "Nerithe": ("ink blue turquoise ivory brass amber restrained coral and violet facets", "green"),
    "Orvella": ("slate charcoal ivory copper jasper red and violet geode facets", "green"),
    "Vaelor": ("cobalt navy ivory copper violet and electric cyan", "green"),
    "Bruno": ("basalt gray warm umber ochre bronze amber and brown", "magenta"),
}

STYLE = ("original compact chibi gacha JRPG anime illustration, clean precise contours, "
         "crisp cel shading, jewel-like faceting and smooth non-emissive painted highlights")
MARGIN = ("entire design including every wing weapon ribbon and shard tip fully visible, "
          "whole ensemble occupies at most 70 percent of canvas width and height, "
          "continuous clear safety margin of at least 15 percent on all four sides and corners, "
          "nothing touches or crosses the frame edges")
NEGATIVE = ("text, letters, words, numbers, runes, logo, watermark, interface, card border, "
            "cropping, photorealism, 3d render, gritty texture, background gradient, textured background, "
            "glow, light bloom, soft aura, haze, light spill")


def cutout(subject, ratio="1:1", key="green", palette=None, negative=NEGATIVE):
    colors = palette or "scarlet red pure white ivory black obsidian and neutral gray only"
    return (
        f"{subject}, complete design fully inside the canvas with all outer tips visible, "
        f"{STYLE}, strict subject palette lock: {colors}; the background key is exempt, "
        "power effects are opaque hard-edged shapes, no emitted light or translucent fringes, "
        f"{MARGIN}, preserve intricate interior detail by pulling the whole composition back "
        "rather than deleting ornaments, "
        f"plain solid {key} background, flat unlit color edge to edge and through all openings, "
        "subject colors unchanged, no glows or glowing visual effects "
        f"--ar {ratio} --niji 6 --s 100 --q 1 --no {negative}"
    )


def block(title, filename, use, prompt):
    return f"### {title}\n\nFilename: `{filename}`. {use}\n\n```text\n{prompt}\n```\n\n"


def calamity_document():
    text = """# Calamity: remaining production artwork

Owner's current sharing direction: **12 boss images + 3 chest images + 3 arena
images = 18 images**. All prompts below are complete and copy-ready.
All eighteen originals are now delivered and installed: twelve bosses, all
three chests and all three arenas, including **The Last Scarlet Bloom**.
Retain these prompts as generation provenance, not replacement requests.
See [the current contract](../../docs/calamity-mode.md).

## Delivery rules

- Each activity has one original boss image, reused at levels145/160/185.
- One Slayer, one Master and one Omnipotent chest image are shared across all
  twelve activities. Full activity/tier names stay in HTML, never in the image.
- One arena per EX tier is shared across all twelve activities. No twelve-way
  arena set, activity banner set or new menu-background set is needed.
- Boss/chest cutouts use red/white elemental shapes against black/white materials,
  not the ordinary activity's palette. Their combat elements do not change.
- Bosses:4:3; chests:1:1. Supply original high-resolution PNGs. Preserve the
  flat green key and complete outer margins; do not manually erase pale art.
  Transparent supplied alpha is also accepted and remains authoritative.
- Arenas:16:9 full-bleed scenery. Environmental glow/bloom is allowed here,
  never in cutout generation. Keep both combat sides and the lower foreground
  readable. No lettering, UI, creatures, reward objects or fake controls.
- Enemy/item/scenery prompts use no style-reference flags. Review actual
  generated pixels; prompts do not guarantee margins, palette or compliance.
- Shared chest/arena resolvers and every presentation surface will be connected
  after reviewed delivery. Do not create missing-image URLs in advance.

## Twelve bosses

"""
    for activity, name, area, design in BOSSES:
        text += block(
            name, f"calamity-boss-{activity}.png",
            f"{area}; all three EX tiers. Proposed nonhuman design, not a renamed ordinary enemy.",
            cutout(f"one original endgame Calamity boss, {design}, formidable majestic presence, "
                   "dense layered regalia surrounding a compact readable central body, "
                   "directional stance facing to the right with the complete silhouette visible",
                   ratio="4:3"))
    text += "## Three shared chest images\n\n"
    for slug, name, design in CHESTS:
        text += block(
            f"EX+{name} Chest", f"calamity-chest-{slug}.png",
            "Shared by every activity at this reward tier; one object, no loot spilling out.",
            cutout(f"one original endgame Calamity treasure chest, {design}, "
                   "three-quarter front view with a readable lid body clasp and feet, "
                   "fractal energy expressed as opaque scarlet and white geometric ribbons"))
    text += "## Three shared arena screens\n\n"
    for tier, name, design in ARENAS:
        prompt = (
            f"original full-bleed gacha JRPG Calamity battle arena, {design}, "
            "strict environmental palette of scarlet red pure white ivory black obsidian "
            "and neutral gray, matching clean anime contours and crisp cel-shaded painted "
            "fantasy scenery, dramatic environmental lighting with bounded red-white bloom "
            "on distant energy only, wide eye-level side-battle camera, open left and right "
            "unit staging areas, level unobstructed lower combat floor, distant architecture "
            "frames the action without crossing the foreground, no creatures or characters, "
            "illustration reaches every edge without a matte margin "
            "--ar 16:9 --niji 6 --s 100 --q 1 --no text, letters, words, numbers, runes, "
            "logo, watermark, interface, buttons, card border, characters, creatures, "
            "treasure chest, photorealism, 3d render"
        )
        text += block(name, f"calamity-arena-ex-{tier}.png",
                      "One shared arena for this encounter tier, across all activities.", prompt)
    return text.rstrip() + "\n"


def native_document():
    text = f"""# Native identity status symbols

**{len(STATUSES)} delivered pictograms**, not new ability portraits or UI screenshots.
These cover the D-316 native states alongside their accurate live text.
Existing character-specific passive/Skill1/Skill2/Last Flare images remain
installed; all Normal/Defense actions already use the two universal images.
Do not regenerate64 ability images just because mechanics changed.

## Delivery and mapping

All27 originals are archived under `Art/source/abilities/native-statuses`.
Reviewed256px transparent exports are installed under
`public/assets/abilities/statuses` with the filenames below (D-323).
Use the owner's character palettes, not a universal rainbow status palette.
Keep counts, recipient/owner, turn/phase expiry, blade location and enemy-skill
forecast as accessible HTML. The symbol never replaces those exact values.
One image represents a state; do not generate one image per stack/recipient.

## Ability-icon picture frame

Every mechanic symbol sits inside a square ornamental ability-icon frame,
like a small picture frame viewed straight on. A continuous beveled rim
surrounds a recessed opaque inset panel with the symbol centered within it.
The frame and inset use subdued shades of the character's palette; the symbol
stays dominant, unobscured and readable. Preserve each state's distinct
geometry, including paired variants. Keep the same square frame construction
across the set, with restrained character-specific corner accents.
This supersedes the earlier trophy interpretation: no award crest, trophy cup,
pedestal, plinth or supporting base. The frame is part of the illustrated icon,
not a surrounding interface screenshot. The complete framed tile stays inside
the existing safety margin. Flat key color surrounds the tile; the recessed
panel inside the frame is authored artwork, not background to remove.

Infernis Burn and ordinary Tizu/personal shields reuse delivered Burn/Ward art.
Existing9 family/Rose icons stay archived and available for independent effects;
none is deleted or silently repurposed into a new native mechanic.
Aurora's forecast is exact enemy-skill text, not a separate illustrated screen.
Quarry/Survey share one symbol each across targets; numeric progress stays text.

All prompts are reference-free, opaque/no-glow cutouts with continuous margins.
Background keys are exempt from subject palette locks. Current VFX remain
procedural animations; these PNGs are status symbols, not animation sprite sheets.
All27 are reviewed and wired through typed native-state metadata and the shared
status resolver. Reproduce with `python tools\\intake_native_status_art.py --apply`
and `python tools\\status_art_revisions.py --write`. The prompts below remain
the generation reference; do not regenerate or repaint the delivered originals.

"""
    for slug, label, owner, design in STATUSES:
        palette, key = PALETTES[owner]
        text += block(
            f"{owner}: {label}", f"status-native-{slug}.png",
            "One face-free mechanic symbol inside an ability-icon picture frame; no text, numbers or surrounding interface.",
            cutout(f"one square gacha JRPG native-status pictogram, {design}, "
                   "mechanic symbol centered inside a square ornamental ability-icon picture frame viewed straight on, "
                   "continuous beveled rim surrounding a recessed opaque inset panel, restrained corner accents, "
                   "subdued frame and inset in the same character palette, dominant unobscured symbol fully contained within the inner opening, "
                   "one integrated framed icon tile with a continuous square outer silhouette, "
                   "large readable central geometry with restrained interior detail "
                   "and strong silhouette at small display sizes",
                   key=key, palette=palette,
                   negative=NEGATIVE.replace("card border, ", "") + ", trophy, award cup, pedestal, plinth, supporting base"))
    return text.rstrip() + "\n"


def main():
    CALAMITY_PATH.write_text(calamity_document(), encoding="utf-8")
    NATIVE_PATH.write_text(native_document(), encoding="utf-8")
    print(f"Built {len(BOSSES) + len(CHESTS) + len(ARENAS)} Calamity and {len(STATUSES)} native-status prompts.")


if __name__ == "__main__":
    main()
