"""Reproduce the approved visual foundations and draft scenes, never runtime art."""
from pathlib import Path

from prompt_quality import SHARP, QUALITY_NO, BACKDROP_NO, NO_BACKDROP, PORTRAIT_FRAME

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "Future Plans" / "Chapters 2-3 Draft.md"

# Five identities per region: four ordinary enemies and a separate regional boss.
REGIONS = [
    ("chapter-2", "arrival-of-brass", "Arrival of Brass", "predominantly polished black metal, dark bronze workings and restrained teal insets",
     "a shuttered civic arrival concourse, interlocking bronze road locks, ivory transit platforms, teal route inlays",
     [
         ("Latchwheel Runner", "one low black oval clockwork body on two toothed dark bronze wheels, black hinged noseplate and two small teal signal lenses, a rear ratchet tail"),
         ("Ticketjaw Clamp", "a walking four-legged black turnstile machine, paired flat black clamp jaws, exposed dark bronze rack gears and one rectangular teal inspection lens"),
         ("Rivetcrown Skitter", "a six-legged black maintenance machine, low hexagonal black shell, three upright dark bronze flat rivet fins and articulated teal-tipped feelers"),
         ("Gatebell Hauler", "a squat black wheeled load machine, suspended black bell-shaped counterweight enclosed by a square dark bronze cage, two jointed lifting arms"),
         ("Turnkey Processional Engine", "a colossal low eight-wheeled black gate machine, three intermeshing dark bronze flywheels, segmented black shutter breastplate, one giant horizontal key-shaped piston and teal recessed control tracks"),
     ]),
    ("chapter-2", "glasswater-circuit", "Glasswater Circuit", "predominantly black enamel, gunmetal workings and restrained cyan glass",
     "a flooded precision waterworks avenue, silver sluice gates, navy tiled channels, cyan glass pressure conduits",
     [
         ("Sluicefin Glider", "a black torpedo-shaped aquatic machine, two broad gunmetal hinged fins, small cyan glass pressure chamber and a forked mechanical tail"),
         ("Valveback Crawler", "a four-legged black pipe-inspection machine, black cylindrical back tank, two offset cyan gauges and gunmetal hooked flat gripping feet"),
         ("Pressurecoil Eel", "a serpentine segmented black machine, gunmetal compression bellows along its body, one narrow cyan glass spinal tube and a blunt bifurcated head"),
         ("Prismgill Siphon", "a small radial black aquatic machine, five gunmetal intake fins surrounding a black pressure drum, narrow cyan glass gills and three articulated stabilizer feet"),
         ("Undertide Pressure Regent", "an immense manta-shaped black pressure machine, broad layered gunmetal fin plates, twin black cylindrical bellows, a central small cyan glass regulator and two forked sluice claws"),
     ]),
    ("chapter-2", "suspended-mile", "Suspended Mile", "predominantly black enamel, dark silver workings and restrained amber glass",
     "a high aerial transit mile, suspended silver tracks and counterweights, indigo station platforms, amber glass signal housings",
     [
         ("Railwing Kite", "a diamond-bodied black aerial machine, two folding dark silver rail fins, black enamel breastplate, amber rectangular eye and paired hooked landing legs"),
         ("Pendulum Talon", "a compact black three-clawed hanging machine, one black spherical bearing inside an angular dark silver yoke, small amber side gauges and a long flat pendulum tail"),
         ("Cablehorn Rammer", "a compact black quadrupedal transit machine, two curved dark silver cable-spool horns, black shield panels and amber angular eye slits"),
         ("Gyrovane Strider", "a two-legged black balancing machine, three offset dark silver gyroscopic rings around its waist and one narrow upright amber vane, no humanoid hands or face"),
         ("Zenith Counterweight Tyrant", "a huge condor-shaped black transit machine, black ribbed torso, six flat dark silver wing spars carrying black counterweights with amber insets, two enormous articulated hook feet and a rear vertical stabilizer"),
     ]),
    ("chapter-2", "garden-of-returning-cogs", "Garden of Returning Cogs", "predominantly black enamel, dark copper workings and restrained jade insets",
     "overgrown civic maintenance terraces, copper recirculation channels, jade mechanical planters, ivory paving, botanical growth threaded through machines",
     [
         ("Seedgear Roller", "a small black spherical maintenance machine divided into six flat shell panels, dark copper wheel rim, two black seed-shaped grippers and narrow jade insets"),
         ("Tendrilpump Mantis", "a slender six-legged black irrigation machine, long black cutting forearms, dark copper pump abdomen, small jade inspection slots and two curled mechanical hose feelers"),
         ("Copperleaf Grazer", "a broad black quadrupedal pruning machine, black angular shell, dark copper leaf-shaped side blades, black wedge muzzle, small jade insets and short segmented tail"),
         ("Irrigation Loom", "a low eight-legged black machine, dark copper shuttle mechanism between black support rails, tightly coiled water hoses and a small jade diamond pressure lens"),
         ("Verdant Recirculation Heart", "an enormous squat black irrigation machine, four black articulated support legs, exposed dark copper triple pump chambers, small jade inspection insets and large flat black leaf-shaped valve plates surrounding a central mechanical heart drum"),
     ]),
    ("chapter-2", "unanswered-terminal", "The Unanswered Terminal", "predominantly black metal, dark plum inset plates and restrained pale gold workings",
     "a silent subterranean dispatch terminal, plum rail beds, black metal routing wheels, pale gold conduit seams, a narrow descending transit aperture",
     [
         ("Signalspine Courier", "a sleek four-legged black dispatch machine, narrow pale gold antenna comb along its back, dark plum inset snout plates and a sealed black rectangular cargo case"),
         ("Mutegear Auditor", "a hovering black hexagonal inspection machine, three offset black shutter plates with dark plum insets, a narrow pale gold mechanical iris and two folding caliper arms"),
         ("Routejaw Hound", "a low black quadrupedal machine, black segmented flank guards with dark plum insets, narrow pale gold jaw hinges and a flat bifurcated cable tail"),
         ("Terminal Threader", "an elongated black rail machine, six small black wheels, narrow pale gold threading needles enclosed inside a rectangular black mechanical shroud with dark plum insets"),
         ("Silent Dispatch Sovereign", "a massive black routing machine, radial black switching arms with narrow pale gold joints around a horizontal drum, six tracked support pods and a central closed black shutter with dark plum insets, unmistakably machinery not a building"),
     ]),
    ("intermission", "faultline-stair", "Faultline Stair", "charcoal, copper and amber",
     "broken transit access shafts descending through natural strata, charcoal rock ledges, abandoned copper rails and amber mineral seams",
     [
         ("Cleftback Burrower", "a low charcoal plated badger-like Devourer, copper chisel claws, amber eyes and a single angled dorsal seam, no machinery"),
         ("Amberhook Bat", "a compact charcoal bat Devourer, copper membrane ribs, amber hooked ears and two short gripping feet"),
         ("Copperfang Scuttler", "a six-legged charcoal cave arthropod, long copper flat mandibles, amber joint scales and two rear feelers"),
         ("Stratahorn Tortoise", "a broad squat charcoal tortoise Devourer, layered flat copper shell ridges, amber horn tips and heavy short forelegs"),
         ("Shaftjaw Excavator", "an enormous low charcoal mole-lizard Devourer, broad copper chisel foreclaws, armored flat dorsal plates, amber sensory eyes and an open shovel-shaped jaw, compact powerful anatomy"),
     ]),
    ("intermission", "buried-confluence", "The Buried Confluence", "slate blue, pale ice blue and silver",
     "a cavern where subterranean rivers converge, slate terraces, pale blue water, silver mineral ribs and distant dry crossing shelves",
     [
         ("Runnelglass Newt", "a low slate blue cave newt Devourer, silver dorsal scutes, pale blue flat tail fin and tiny clear-cut eye ridges"),
         ("Siltveil Skimmer", "a compact slate blue winged cave ray Devourer, pale blue broad fins, silver edge scales and a short forked tail"),
         ("Blindcurrent Crab", "a slate blue cave crab Devourer, two mismatched silver pincers, pale blue shell seams and six short jointed legs"),
         ("Rillhorn Otter", "a compact slate blue otter Devourer, two flat silver swept horns, pale blue neck fur and a broad paddle tail"),
         ("Confluence Abyssal Stag", "a majestic compact slate blue amphibious stag Devourer, broad branching silver antlers shaped like converging river forks, pale blue plated chest and long webbed hooves"),
     ]),
    ("intermission", "last-threshold", "The Last Threshold", "obsidian black, violet and ivory",
     "an immense natural fault boundary, obsidian shelves, violet mineral bridges and ivory binding traces extending into a deep silent opening",
     [
         ("Veilcrest Moth", "a compact obsidian cave moth Devourer, four violet wings divided by ivory angular veins, ivory curled antennae and a short rounded body"),
         ("Hollowstep Lynx", "a compact obsidian lynx Devourer, violet layered mane, ivory ear blades and two flat ivory tail fins"),
         ("Riftmantle Gecko", "a low obsidian gecko Devourer, violet ribbed side membranes, ivory gripping toe plates and a curled flat tail"),
         ("Paleshard Viper", "a coiled violet viper Devourer, obsidian flat scale bands, an ivory bladed head crest and two small angular violet cheek fins"),
         ("Threshold Veilmaw", "a vast compact obsidian six-legged feline Devourer, violet overlapping mantle plates, an ivory split jaw crest and four attached crescent spine blades, full body and all six feet visible"),
     ]),
    ("chapter-3", "bound-expanse", "The Bound Expanse", "pearl gray, black and violet",
     "a deep open chamber with pearl-gray suspended strata, black binding loops threaded through rock and restrained violet mineral pools",
     [
         ("Loopback Beetle", "a compact black beetle Devourer, pearl-gray split wing cases, one attached violet loop-shaped dorsal horn and six angular legs"),
         ("Violetbind Serpent", "a coiled pearl-gray serpent Devourer, black segmented scale bands and paired violet clasp-shaped jaw fins"),
         ("Claspwing Raven", "a compact black raven Devourer, pearl-gray layered wing plates, violet beak crest and two broad talons"),
         ("Sealhide Bison", "a compact pearl-gray bison Devourer, black flat shoulder plates, two violet crescent horns and a short braided tail"),
         ("Binding Crown Leviathan", "an immense compact black salamander Devourer, pearl-gray beveled dorsal plates, a crown of attached violet clasp horns and a broad segmented tail curling around its four visible feet"),
     ]),
    ("chapter-3", "witness-hollow", "Witness Hollow", "midnight blue, ivory and restrained crimson",
     "a deep mineral archive hollow, midnight blue layered walls, ivory reflective facets and narrow restrained crimson cracks, no readable records",
     [
         ("Mirrorhide Hare", "a compact midnight blue hare Devourer, ivory flat mirror plates on its flanks, two crimson ear tips and large short hindfeet"),
         ("Traceglass Spider", "a midnight blue eight-legged Devourer, ivory faceted abdomen plates, crimson angular eyes and flat pointed feet"),
         ("Echoquill Porcupine", "a compact midnight blue porcupine Devourer, broad ivory flat quills with restrained crimson tips and a low rounded muzzle"),
         ("Paleface Owl", "a compact midnight blue owl Devourer, an ivory angular face disc, crimson beak and layered flat ivory primary feathers"),
         ("Witness Mirror Chimera", "a single-headed compact midnight blue lion Devourer with an ivory antler crown, two layered ivory feather wings, restrained crimson neck seams and a long segmented feline tail, no extra heads"),
     ]),
    ("chapter-3", "souls-quiet", "The Soul's Quiet", "black, ivory and pale rose",
     "a silent deepest sanctuary of smooth black stone, ivory binding arches and pale rose mineral planes, one distant empty circular focus, no depicted deity or soul",
     [
         ("Hushpetal Wisp", "a small black teardrop-bodied Devourer enclosed by five attached ivory petal plates, pale rose angular eyes and two curled ivory streamers, opaque solid body"),
         ("Quietfang Doe", "a compact black doe Devourer, ivory neck armor scales, pale rose forehead crest and slender ivory split hooves"),
         ("Paleveil Ray", "a compact black floating ray Devourer, broad ivory fin panels, pale rose edging and one short forked tail, opaque painted materials"),
         ("Stillbound Hound", "a compact black hound Devourer, ivory collar-like natural plates, pale rose rib seams and two swept ivory cheek horns"),
         ("Hushbound Sentinel", "a colossal compact black stag-lion Devourer with one feline head, broad ivory fan-shaped antlers, pale rose shoulder facets, four ivory armored feet and a long curled tail, guardian creature not a person"),
     ]),
]

PARTS = [
    ("chapter-2", "Chapter 2: Explore the Metropolis",
     "a sprawling precision-built metropolis seen from above, five connected districts: bronze arrival locks, navy waterworks, silver suspended transit, jade maintenance gardens and a plum underground terminal entrance",
     "a shattered bronze and ivory machine of unknown internal purpose in a quiet roadside recess, a blank inset message plate and a tiny distant neutral-white guiding wisp, no readable writing and no person"),
    ("intermission", "Intermission: The Descent",
     "a cutaway journey descending through three vast natural underground regions: copper transit shafts, slate subterranean river confluence and an obsidian violet threshold",
     "small distant creature silhouettes following a broken copper transit line down into a slate cavern, view from behind and above, a deep violet threshold far below, no fight or human figure"),
    ("chapter-3", "Chapter 3: At the Brink",
     "a vast underground realm seen as connected terrain, three regions: pearl-gray bound strata, midnight-blue reflective mineral hollow and a black ivory pale-rose quiet sanctuary",
     "an empty smooth black and ivory chamber with restrained pale rose mineral reflections, converging binding loops around an unoccupied central focus, anticipation and uncertainty, no person deity or represented soul"),
]


def blocks():
    result = []
    for part, slug, name, palette, terrain, enemies in REGIONS:
        for index, (enemy, design) in enumerate(enemies):
            boss = index == 4
            presence = "formidable majestic regional boss, dense layered subject detail" if boss else "distinct readable ordinary creature or machine, compact anatomy"
            machine_mood = ("Ominous imposing machine, predominantly black armored chassis, narrow recessed inspection slits, "
                            "precise dark metal workings with crisp edge highlights so every mechanism remains readable, "
                            "district colors confined to small insets, no large bright colored panels. ") if part == "chapter-2" else ""
            prompt = (
                f"{PORTRAIT_FRAME}, complete design inside a continuous empty safety margin at least 15 percent on every side and corner. "
                f"{design}. {machine_mood}Subject palette strictly {palette}. {presence}; side-facing three-quarter view facing right, all feet fins horns cables and tips fully visible. "
                "Compact anime game unit rendering, clean precise contours, crisp cel shading, opaque materials, smooth non-emissive painted highlights; "
                f"{SHARP}. {NO_BACKDROP}. Entire ensemble contained inside central 70 percent; pull back uniformly, never crop or remove details. "
                "Plain flat unlit solid #00FF00 background, same green in all empty gaps. "
                f"--ar 4:3 --no text, letters, watermark, scenery, glow, haze, {QUALITY_NO}, {BACKDROP_NO}"
            )
            result.append((f"{part}-{slug}-{'boss' if boss else index + 1}.png", f"{name} / {enemy}", prompt))
        arena = (
            f"Wide battle arena: {terrain}. Palette {palette}. Original compact anime JRPG environment, crisp cel-shaded surfaces, "
            f"precise mechanical or geological construction, {SHARP}. Full-bleed natural-aspect scenery, broad clear lower third for two opposing formations, "
            "large landmarks confined to rear and sides, readable ground, detailed depth without blur, environmental lighting permitted, no combatants. "
            f"--ar 16:9 --no people, characters, enemies, text, letters, interface, watermark, {QUALITY_NO}"
        )
        result.append((f"{part}-{slug}-arena.png", f"{name} / Battle arena", arena))
    for part, title, terrain, transition in PARTS:
        result.extend([
            (f"{part}-map.png", f"{title} / Map",
             f"Original anime JRPG world map illustration, {terrain}. Oblique elevated overview, distinct terrain-linked routes and generous readable landmark separation, "
             f"crisp clean cel-shaded detail, {SHARP}, full-bleed scenery with coherent geography, no UI labels; leave all labels for HTML overlays. "
             f"--ar 16:9 --no text, letters, numbers, icons, people, watermark, {QUALITY_NO}"),
            (f"{part}-banner.png", f"{title} / Chapter banner",
             f"Original anime JRPG panoramic environment banner: {terrain}. One coherent vista, not collage panels, awe-inspiring architectural or geological scale, "
             f"precise clean cel shading, {SHARP}, full-bleed cinematic environmental lighting, readable middle-distance landmark, no title embedded. "
             f"--ar 3:1 --no text, letters, people, figures, watermark, {QUALITY_NO}"),
            (f"{part}-transition.png", f"{title} / Transition concept",
             f"Original anime JRPG story illustration: {transition}. Environment-first composition, clear foreground focal object, "
             f"clean precise contours and crisp cel shading, {SHARP}, full-bleed scenery, atmospheric lighting without smudged edges. "
             f"--ar 16:9 --no text, letters, human, humanoid, portrait, watermark, {QUALITY_NO}"),
        ])
    return result


def document():
    header = """# Chapters 2-3 and intermission: proposed Midjourney art pack

**D-450 / DRAFT FOR OWNER APPROVAL. Not implemented, not delivered artwork.**

Companion design: [chapter design and approval boundaries](chapters-2-3-design.md).
These75 copy-ready prompts cover55 unique enemy/boss cutouts,11 arenas,
three maps, three chapter/part banners and three transition concepts.
Region/enemy identities and provisional125/75/75 stage structure are approved
foundations under D-451. Nyrasma machines are new creations of Rise and
predominantly black/ominous, with restrained district accents, not bright panels.
Exact scenes and generated images still require review; no gameplay is authorized.
No Rise/Let portrait or confirmed soul depiction is included. The wisp really
is Let's fragment, but transition images do not disclose that to the party.

Generate only the desired fenced prompt, not the heading/filename.
Filenames identify future intake candidates, not current runtime URLs.
Enemy cutouts are reference-free, right-facing, sharp and fully contained.
Scenery is full-bleed. Background green is a removable key, never subject energy.
Review actual pixels and outer clearance after generation; wording cannot
guarantee margins. Archive originals before reviewed offline cleanup/export.
Use individual subject palettes; do not globally erase legitimate colors.

Reproduce: `python tools/build_future_story_art.py`.
Validate: `python -m unittest discover -s tools -p test_future_story_art.py`.
No runtime assets, save rules or unlocks are generated by this tool.
"""
    return header + "".join(
        f"\n## {title}\n\nProposed output: `{filename}`\n\n```text\n{prompt}\n```\n"
        for filename, title, prompt in blocks()
    )


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(document(), encoding="utf-8")
    print(f"Wrote {len(blocks())} draft prompts: {OUTPUT.relative_to(ROOT)}")
