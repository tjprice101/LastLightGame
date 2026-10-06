# Art and asset workflow

## Summoning banner artpieces

Summoning uses16:9 opaque full-bleed Omnic-tier artpieces that embody each real
banner's identity. Do not reuse3:1 dungeon headers or individual reward portraits.
The Standard prompt/intake path is in [Summoning Banners](../Art/Summoning%20Banners.md).
The supplied Standard banner is now registered at
`public/assets/banners/summon-standard.png`. Drop-rate tables remain text-only:
name, awarded rarity/star value and exact rate; Omnic art is not an acquisition
promise. Follow this distinction for future banner and loot disclosures.

## Rosethorn Sanctuary

Phase10's [Sanctuary pack](../Art/Rosethorn%20Sanctuary.md) contains six
Tranquilitic Rosethorn Wisp cutouts,3:1 activity header and16:9 arena.
Keep limbless flame-shaped anatomy, ivory/rose/antique-gold identity, eyes-only
faces and opaque non-emissive flame ribbons. Common is restrained; Omnic
unfolds divine thorn-cathedral regalia/prismatic rose orbit rings.
The six supplied portraits, header and arena are registered; hostile and owned
copies share the same cutout files.
Standard's Omnic artpiece includes Sanctuary rosefire architecture, not another
banner, promised six-star EB or a portrait grid.

## Crownfall Treasury

Phase9's [Treasury pack](../Art/Crownfall%20Treasury.md) contains six progressively
regal Luminous slime cutouts (shared hostile/captured portraits), a3:1 activity
header and16:9 arena. The six supplied portraits, header and arena are registered;
hostile and owned copies share the same cutout files.
The Standard16:9 artpiece prompt now includes Treasury crown/amber architecture;
this is not another summon banner or a6-star EB promise. Preserve originals,
review keying/padding and register only approved exported images.

## Pending dungeon rarity direction

The five remaining art-pending dungeon packs (Earth, Wind, Light, Shadow and
Chaos) now apply the shared Common-to-Omnic tone inside all40 enemy and30
material prompts. Early designs remain restrained; later creatures and relics
gain species-specific formidable armor, deployed elemental structures and
majestic/prismatic final silhouettes, not cute wording or realistic anatomy.
See [pack direction and generation rules](../Art/dungeons/README.md#pending-art-rarity-escalation-pass).
Enemy lineup positions express art power, not assigned rarity or evolution;
material rarity labels remain authoritative. Existing palettes/key colors,
compact renderer, cutout padding/no-glow rules and scenery layouts are preserved.
Runtime encounters, drops and already supplied packs are unchanged.

## Game-wide rarity art direction

Common-to-Omnic progression keeps the same established rendering style while
becoming progressively less cutesy and more epic, formidable, majestic and
awe-inspiring. This is a game-wide rule, not exclusive to Conduits. Higher-rarity
prompts should emphasize commanding designs and fully realized elemental
identity rather than adorable/babyish language. Keep compact proportions,
species identity, clean contours, cel shading and cutout requirements unchanged.

Use the [shared rarity tone ladder](../Art/midjourney-character-style-prompt.md#game-wide-rarity-tone-common-to-omnic)
for new or revised prompts. Rarity and stars remain separate: a 5-star Common
starter is still visually a restrained base form. This direction does not
repaint delivered assets or change gameplay rarity/progression rules.

## Existing source of truth

### Currency artwork

Owner originals are preserved byte-for-byte under `Art/source/currencies`.
`tools/prepare_currencies.py` exports 256x256 transparent icons with 224px
content and at least 16px padding. Each delivery uses its actual brown hue,
not the requested prompt swatch. Border-connected keying preserves matching
interior facets. Fractalis additionally removes the exterior cast shadow using
reviewed source-coordinate masks, preserving the coin thickness and detached
residue. Lycalis removes muted spill around the separate bright sparkle marks;
the glass petals, dark thorn and non-emissive painted highlights remain.
Do not reuse these image-specific masks for replacements without reviewing them.

```powershell
python tools\prepare_currencies.py --assets fractalis lycalis
python -m unittest discover -s tools -p test_prepare_currencies.py
python tools\review_art.py --cleaned --assets fractalis lycalis --output <review-folder>
```

After visually reviewing both dark and light previews, add `--record-review`
to the currency exporter to refresh only those assets' provenance in
`Art/matte-review.json`. Owner-supplied alpha overrides bypass color cleanup.
Currency URLs come from `src/presentation/currency-icon.ts`; loot presentation
uses `lootArt` to distinguish currencies from materials. No runtime keying
or economy changes are involved.

### Galvanic Field color-background intake

All 16 Galvanic Field originals are archived byte-for-byte under
`Art/source/{enemies,materials,banners,backgrounds}`. Eight enemies and six
Voltaic materials export to canonical runtime names; opaque arena/banner
images remain unprocessed. Regenerate only this pack:

```powershell
python tools\prepare_dungeons.py --elements voltaic
python -m unittest discover -s tools -p test_color_matte.py
```

Reviewed keys vary per image across green/teal rather than assuming pure green.
The pale Heart key clears the spaces inside its gold filigree and ribbons.
Bloom, Seed and Soul use wider spill cleanup; source-coordinate foreground
masks protect Seed metal highlights and Soul crystal facets. Options/masks
live in `tools/prepare_dungeons.py`; `review_art.py --cleaned` uses the same
helper. Supplied-alpha overrides bypass cleanup, and no runtime keying exists.
See [Galvanic Field](../Art/dungeons/Galvanic%20Field.md) for skills and actual
stage/drop gates. Review new deliveries individually before reusing settings.

### City of Heaven color-background intake

The 16 delivered City of Heaven PNGs are archived byte-for-byte under
`Art/source/{enemies,materials,banners,backgrounds}` using their supplied names.
Eight enemies and six materials export to canonical runtime filenames; the
banner and arena are copied without processing. Regenerate this pack only:

```powershell
python tools\prepare_dungeons.py --elements tranquilitic
python -m unittest discover -s tools -p test_color_matte.py
```

`tools/color_matte.py` performs offline reviewed hue/saturation keying. Per-image
keys in `tools/prepare_dungeons.py` clear pink backgrounds and internal openings
without erasing ivory wings, halos or blue/jade effects. The orange Crest uses a
bright, saturated border-connected key to protect gold subject details. The
Shard has a narrow hue tolerance to preserve red ribbons; the Seed has a wider
key for its pale pink spill. New packs require visual review, not blanket reuse
of these values. No runtime removal is introduced. Authoritative supplied-alpha
overrides still bypass every remover. See [City of Heaven](../Art/dungeons/City%20of%20Heaven.md)
for the implemented roster, skills, stages and drop gates.

### Owner-supplied transparent replacements (current policy)

All 96 timestamp-named PNGs supplied in the project root were individually
matched to existing assets, then renamed to their existing in-game filenames
under `Art/source/cutouts/{characters,enemies,materials,abilities}`. Those files
are byte-identical to the supplied PNGs and are now the authoritative sources.
[Intake manifest](../Art/cutout-intake.json) records original filenames, canonical
paths, original/runtime hashes, and preserved historical source paths.

**Never remove backgrounds from these replacements.** All four exporters use
`prepare_art.prepare_sprite`, which selects a supplied cutout first and calls
only alpha-bounds trimming, uniform LANCZOS resizing and transparent padding.
No matte flood, white/chroma removal, interior seeds, protection masks or edge
decontamination runs on supplied cutouts. Retained white artwork and icon framing
must remain as supplied. Units retain 960/864/48px sizing and icons/materials
256/224/16px; no pose flipping is baked into the files.

The shared runtime asset URLs serve every screen: Home/Character, starter and
evolution displays, battles, portrait cut-ins, inventory/materials, ability icons
and the Creature Glossary. There is no runtime background-removal pass. Existing
drop shadows, image-only facing transforms and intentionally undiscovered black
silhouettes are presentation effects, not background removal.

Base `flora`, base `tizu`, and the archived `infernis-heavy-attack` icon had no
supplied replacement and remain unchanged. Historical originals are preserved
separately; their earlier matte policy below applies only when no supplied
cutout exists. This section supersedes historical cleanup instructions for the
96 replacements, including the three complex-character corrections.

Regeneration commands remain the same. `review_art.py --cleaned` also honors
supplied alpha; `--record-review` records the authoritative cutout rather than
misattributing its output to a historical matte source. `--pockets` explicitly
rejects supplied-alpha assets rather than displaying outdated matte cleanup.

For future root-file deliveries, prepare a visually reviewed JSON list with
`incoming`, `asset`, and `category` fields for existing catalog entries. Then:

```powershell
python tools\intake_cutouts.py --mapping C:\Temp\reviewed-matches.json
python tools\intake_cutouts.py --mapping C:\Temp\reviewed-matches.json --apply
python tools\test_prepare_art.py
```

The first command validates every mapping without changes; applying refuses
existing cutout destinations or an existing intake manifest. Subsequent batches
need an explicitly reviewed manifest-update workflow, not an overwrite of this
intake. Tests assert all 96 source hashes, pixel-exact normalized exports and
regeneration with the matte remover disabled.

### Owner-supplied opaque RGB art intake (36 images)

The 36 supplied images are preserved byte-for-byte under `Art/source`. At the
owner's request, redundant root-level copies were removed after verifying their
archived and runtime hashes. Ten element medallions, five Conduit icons and twelve Treasury /
Rosethorn creature portraits are opaque RGB cutouts/icons. Their runtime
exports use explicitly reviewed, border-connected per-image color keys: hue /
saturation keys for medallions and Conduits, RGB border-swatch distance keys
for creatures. The exact settings, canonical source/runtime paths and SHA-256
hashes are recorded in [root-art-intake.json](../Art/root-art-intake.json).

Only those 27 cutouts/icons have their backgrounds keyed and transparent
padding/size normalized. The seven scenery banners and two arenas are copied
byte-for-byte; they remain full-bleed opaque artwork. This is a distinct RGB
intake path and does not change the supplied-alpha policy above: the existing
96 authoritative-alpha cutouts are never background-removed. Runtime images
are registered through existing content/presentation systems and use
base-aware `assetUrl()` paths.

The intake is explicit and repeatable, using archived sources when root inputs
are absent. Review the plan before applying it, then
run the focused provenance/export tests:

```powershell
python tools\intake_root_art.py
python tools\intake_root_art.py --apply
python -m unittest discover -s tools -p test_root_art_intake.py
```

### New-generation solid key-color backgrounds

All 230 cutout prompts are subject-first: preserve identity, equipment, elemental
palette, evolution details and rendering style before specifying the background.
The earlier long background-first prefix and instruction to make subject colors
clash are removed. Each prompt ends with a short plain solid-color, flat unlit
background instruction. No glows or glowing visual effects are allowed in
cutout generations, including eyes, cores, gems, weapons and elemental powers.
Powers use opaque solid-color lines, ribbons, rings and shapes with crisp edges.
Painted highlights and normal cel shading stay non-emissive; translucent effect
edges, bloom, haze and light spill are prohibited. Complexity still grows through
larger shapes, layering and ornamentation. Existing names, palettes, silhouettes,
weapons and evolution motifs remain intact. One background color fills outer
space and all internal openings. Arenas/banners are exempt from the no-glow rule.

Swatch choices remain green, blue, magenta or orange, including green `#00FF00`
for all nine Abyss cutouts. Color names no longer suggest neon lighting.
Templates use `[BACKGROUND COLOR]` and `[BACKGROUND HEX]`. Change the background
choice if it conflicts with the subject; never redesign the subject palette.
The single exclusion list retains subject-specific bans and adds concise
background bans plus glow/glowing effects/light bloom/soft aura/haze/light spill.
Use "light bloom," not "bloom," to preserve flowers and material identities.
Aspect ratios, model/stylization/quality flags and reference guidance are unchanged.

Inspect actual output: Midjourney cannot guarantee flat pixels from text.
If the subject is correct but the background has a gradient, preserve the
subject and edit only the backdrop using a reviewed mask and flat fill. Do not
add more competing background clauses. If powers themselves are glowing, they
also need regeneration or a reviewed redraw as hard-edged solid-color shapes.
This prompt policy does not strip existing supplied PNGs or disable animated
in-game combat effects.

See the [mandatory cutout contract](../Art/cutout-background-contract.md).
The owner confirmed that arenas and banners remain illustrated scenery; all27
environment prompt blocks are unchanged. This supersedes historical white-canvas
generation guidance below, **not** the processing history of supplied originals.
Existing PNGs/runtime art were not recolored or regenerated by this change.

Current tools remove legacy white/ivory mattes, not arbitrary chroma keys.
When new keyed images arrive, add explicit per-asset key-color/alpha-mask support
and test preservation of pale/colorful artwork before exporting. Never run new
green/magenta/blue/orange art through the legacy white-removal path unchanged.

### Complex-character follow-up

The screenshot-driven follow-up compared original-resolution artwork and dark
cutouts, rather than treating a small contact sheet as sufficient approval.
Three runtime sprites received targeted corrections:

- Infernis Evo6: preserve both pale upper feather tips; clear the enclosed halo,
  hair-loop and sword-impact ring openings while retaining the blade and flames.
- Tizu Evo5: preserve the bright left-wing highlight and clear the cyan halo's
  enclosed background; white spear/feather details remain artwork.
- Flora Evo6: clear the enclosed halo and adjoining gap above the shoulder;
  protect the pale lower floating feather that the border flood had eroded.

These are source-coordinate foreground polygons and background seed points in
the existing tooling, not a global threshold increase or hand-edited runtime
PNG. Only these three exports were regenerated; source PNGs remain untouched.
The refreshed review manifest now includes protection polygons as well as
cleanup seeds and hashes. Treat the earlier all-asset contact audit below as
review history, not a guarantee that every complex edge is perfect.

Regenerate and validate:

```powershell
python tools\prepare_art.py --assets infernis-evo-6 tizu-evo-5 flora-evo-6
python tools\test_prepare_art.py
```

Regression checks at original resolution assert transparent loop interiors and
exact source RGB/opaque alpha for restored feathers, pale highlights, blade,
armor and colored flames. Always compare before/after at full resolution on a
dark background; do not classify all near-white pixels as background.

### Per-image enclosed-background review

The 2026-10-04 audit reviewed all99 runtime cutouts individually on labeled dark
backgrounds:18 characters,41 enemies,24 materials and16 ability icons. It updates
32 exports; the other67 retain their existing pixels. Banners and arenas remain
opaque scenery, not cutouts. Source PNGs are never edited.

[Review manifest](../Art/matte-review.json) records every asset, source/runtime
SHA-256, and whether it was retained or received targeted cleanup.
[Authored pocket points](../tools/matte_regions.py) identify confirmed background
between legs, bowstrings, crown thorns, ribbons and enclosed elemental loops.
Each point is normalized to the **original source**, not the padded runtime PNG.
It seeds another connected flood fill; it does not remove every enclosed white
component. Unmarked white clothes, wings, highlights, shadows and icon frames
remain untouched. Invalid, colored or protected seed points fail explicitly.
The same points are used by all four existing export scripts.

Infernis Evo6 uses a stricter235 interior threshold independently of its215
outer matte threshold and retains pale wing protection. Infernic Bloom has a
215/50 warm-matte override. Efflorescent Soul has a170/100 tinted-backdrop override
with explicit foreground polygons protecting the crystal, leaves and pale facets;
reviewed mask openings clear the gaps inside its gold loop.

Review tooling (keep generated previews outside the project):

```powershell
python tools\review_art.py --output C:\Temp\last-light-review
python tools\review_art.py --pockets tizu-evo-2 --output C:\Temp\last-light-pockets
python tools\review_art.py --cleaned --assets tizu-evo-2 --output C:\Temp\last-light-cleaned
```

Numbered candidates are **review aids, not automatic background classifications**.
Inspect the original at full resolution before adding points, then compare dark
previews for lost pale artwork. `--cleaned` regenerates only reviewed assets into
the requested output directory. After approved exports, regenerate provenance
with `--record-review --output C:\Temp\last-light-review`. Tests verify selected
holes, unselected white interiors, protected pale pixels, original-resolution
seed eligibility and canvas/padding contracts.

Infernis Evo6's warm background connects into pale wing feathers, so its export
now uses authored normalized foreground protection regions in
tools/prepare_art.py (PALE_ART_REGIONS). This preserves the selected wing interior
without disabling flood-fill transparency or lowering thresholds globally.
Regenerate with `python tools/prepare_art.py --assets infernis-evo-6`.
Original PNGs remain unchanged; canvas/content/margins and enclosed white details
retain the existing export contract. Foreground masks must match source size.

[Heaven/Abyss mode packs](../Art/gamemodes/README.md) contain separate six-form
slime evolution trees, three specialty material icons per mode, and banners/
arenas. Their epic thorned enemies supersede earlier wisp art direction but are
now supplied assets and implemented encounters. Heaven: white/black/red/gold;
Abyss: black/white/deep purple/hot pink. Specialty material purposes and affinity
groups are documented separately from any-element Epic+ supplemental drops.
Late-leveling material applies throughout character Evolution5/6.

All22 mode PNG originals are preserved under Art/source (12enemies,6materials,
4landscapes), verified byte-identical at intake. Run
`python tools/prepare_infusions.py` to regenerate just these runtime exports.
Enemies use960px RGBA/864px content/48px margin; materials256/224/16.
Landscapes are opaque byte-identical copies. Facing metadata was reviewed from
the supplied art; front poses stay unmirrored. Export contracts are covered by
`python -m unittest discover -s tools -p test_prepare_art.py`.
The supplied chalice has warm ivory matte; its explicit minimum215/spread50
override removes connected background, preserving enclosed white cup details
and authored decorative framing. Other mode assets use the default230/20 with
reviewed interior pocket points where needed.

The owner replaced Heart of the Shattered Void on2026-10-05. Its new original
is `Art/source/materials/Heart of the Shattered Void.png`; former RGB and owner-alpha
versions are archived under `Art/source/replaced/heart-shattered-void-2026-10-05`.
`prepare_infusions.py` removes its mint background and teal ground shadow with
a reviewed hue144/tolerance22/saturation0.20 key. Three small foreground masks
preserve cyan crystal facets; white highlights, pink fragments and dark rings
remain intact. Export just this icon with
`python tools\prepare_infusions.py --assets abyss-heart-shattered-void`.
The review tool uses the same helper; no runtime background removal is involved.
The stable `abyss-evolution` material and `abyss-heart-shattered-void` art IDs
continue to serve rewards, Inventory, recipes and Creature Glossary.

The [Midjourney character and weapon prompt guide](../Art/midjourney-character-style-prompt.md)
owns the detailed prompt text and visual rules. Edit it when changing those rules;
do not maintain a second competing prompt library here.
Use the actual `Art` directory capitalization consistently.

[Starter Art](../Art/Starter%20Art.md) extends that guide with three new base-form
Element-Bearers (female fire/greatsword, female grass/bow, male water/spear) and three
basic mythological enemy prompts (goblin, imp, golem). These are generation prompts,
not generated assets or changes to the playable roster.

[Battle Scenery](../Art/Battle%20Scenery.md) contains the cutesy grassy-field
background prompt for the opening solo encounter. Scenery is opaque full-bleed
environment art, not a square transparent unit asset.

The [elemental dungeon art packs](../Art/dungeons/README.md) combine eight
ascending-power monster prompts, six 1:1 Seed-to-Soul material icons, one 3:1
banner and one 16:9 battle arena per dungeon. They preserve the existing chibi
style and separate sprite/item white canvases from opaque environment art.
These are generation prompts, not supplied or integrated images. Flaming Depths
reuses eight existing designs without removing its other two supplied enemies.
Suggested drop pools and stage bands are art proposals, not runtime balance.

The supplied [Grassy Field original](../Art/source/backgrounds/Grassy%20Field.png)
has been moved out of the project root. Its byte-identical
[runtime copy](../public/assets/backgrounds/grassy-field.png) is used behind the
full Adventure viewport, resolved through Vite's deployment base. The 1456 x 816 RGB PNG
is not alpha-processed, cropped, resized, or passed through the unit-art pipeline.
Display uses aspect-preserving `object-fit: cover`, centered and fixed to the
viewport; narrow screens crop the sides. Detached dark readouts keep stats readable
while the sprite artwork has no enclosing blue card or border.
The supplied image includes two tiny painted figures; these are background details,
not targetable combatants. The original is preserved without retouching.

## Current visual direction

- Compact chibi characters, approximately 2.5-3 heads tall; eyes-only faces.
- Complete weapon and composition within a flat solid-color key background and outer margin.
- Crisp contours, cel shading, painted highlights, and saturated colors.
- Character illustrations use 4:3; 1:1 is allowed for specifically needed square assets.
- Fire emphasizes elemental vestments, water readable spear action, and grass
  wings/aura. Each line preserves recognizable identity across its six art stages.
- Standalone weapon concepts retain3:2 framing and readable floating silhouettes,
  but now use the original clean chibi rendering, not splotchy ink showcases.
- Currency and material icons adapt that renderer to chunky faceted objects at1:1,
  without humanoid faces or body rules. See [currency prompts](../Art/Currencies.md).
- Heaven/Abyss retain their severe palettes, same-slime identities and elaborate
  ornamentation; complexity does not permit realistic anatomy or a different renderer.
- Every cutout uses the same approved chibi style reference at`--sw 400`;
  scenery uses that reference at200, retaining full-bleed lighting/composition.
- Run `python -m unittest discover -s tools -p test_art_prompts.py` after editing
  prompt blocks to check rendering anchors, ratios, flags and cutout contracts.

The prompt guide's Midjourney style-reference image/URL is still not present.
The owner has supplied the six initial unit illustrations, ten Flaming Depths
enemy illustrations, and grassy-field scenery for runtime use. They are
used as provided apart from background processing, not repainted to enforce the
prompt guide's facial-feature rules.

## Supplied character and enemy art

Original RGB images are preserved without recompression under `Art/source`.
Transparent runtime copies are exported under `public/assets`; the files were
moved out of the project root.

| Asset | Original | Runtime |
| --- | --- | --- |
| Infernis | [Source](../Art/source/characters/Infernis%20Beginner.png) | [Transparent PNG](../public/assets/characters/infernis.png) |
| Tizu | [Source](../Art/source/characters/Tizu%20Beginner.png) | [Transparent PNG](../public/assets/characters/tizu.png) |
| Flora | [Source](../Art/source/characters/Flora%20Beginner.png) | [Transparent PNG](../public/assets/characters/flora.png) |
| Goblin | [Source](../Art/source/enemies/Goblin%20Enemy.png) | [Transparent PNG](../public/assets/enemies/goblin.png) |
| Imp | [Source](../Art/source/enemies/Imp%20Enemy.png) | [Transparent PNG](../public/assets/enemies/imp.png) |
| Rock Golem | [Source](../Art/source/enemies/Rock%20Golem%20Enemy.png) | [Transparent PNG](../public/assets/enemies/rock-golem.png) |

### Supplied starter evolution portraits

All 15 post-base portraits are preserved byte-for-byte under
`Art/source/characters`, with their original `Title, Character.png` names.
Runtime exports are `public/assets/characters/{infernis,tizu,flora}-evo-{2..6}.png`.
The base portraits remain unchanged. Every export uses the same 960px RGBA,
864px content, 48px padding and border-connected matte-removal contract.
Infernis Evo.6's ivory source background needs a per-asset minimum of 215 instead
of the usual 230; chroma tolerance stays 20. This removes the outer corner patches
without globally changing other exports. Enclosed pale details remain preserved;
the original is untouched. The override is recorded in `MATTE_MINIMUMS` and tested.

[The shared art resolver](../src/content/character-art.ts) maps each starter/form
to its supplied title and runtime ID. Home, Character, Squad and battle use the
owned form; selection uses beginner art. Evolution updates the existing Character
image's src/alt; switching tabs does not reload/reanimate the same image.
These are now six gameplay forms approved by D-033, not alternate art or new rarities.
See [progression](units-and-progression.md) for the Lv.105 cap and final recipe.

After a saved level/evolution upgrade, `upgrade-celebration.ts` adds temporary
element-colored rings/sparks and a success label over the existing owned portrait.
Evolution animates the new current artwork after `updateCharacterTab`; next-form
silhouette assets are not revealed early. Image `transform` animation preserves
the separate facing `scale` property. No new illustration assets are required;
reduced motion shows only static feedback. Menu portraits now include an inner
`character-idle` span with a slow 2.5% size pulse; upgrade effects still animate
the image inside it, keeping facing, idle and celebration transforms independent.

Regenerate just the evolved assets with `--assets` and their IDs, for example:

```sh
python tools/prepare_art.py --assets tizu-evo-2 tizu-evo-3 tizu-evo-4 tizu-evo-5 tizu-evo-6
```

### Tizu and Flora ability icon prompts

[Tizu Art](../Art/Tizu%20Art.md) and [Flora Art](../Art/Flora%20Art.md) each contain
six generation-ready 1:1 prompts: Passive, Skill1, Skill2, Last Flare, Normal and
Defense. Their stated mechanics match the base resolved kits; no new effects,
summons or retired Heavy action are introduced.
Symbols use the Infernis chibi-inspired icon style, pure-white background,
two-thirds symbol scale, white gaps and margins, niji6/s100/q1 and one --no.
Append the owner's approved style-reference URL before generation.
Ten supplied Tizu/Flora images now cover Passive, Skill1, Skill2, Last Flare and
Normal for both characters. Originals are preserved byte-for-byte under
`Art/source/abilities/tizu` and `Art/source/abilities/flora`; SHA-256 checks
verified intake. Runtime exports use 256px RGBA/224px content/16px padding.
Defense images remain unsupplied and text-only; do not substitute shield skills
for the Defense action. Supplied painted framing/details are preserved.

| Character | Passive | Skill1 | Skill2 | Last Flare | Normal |
| --- | --- | --- | --- | --- | --- |
| Tizu | `tizu-stillwater-guard` | `tizu-undertow-thrust` | `tizu-tidal-shelter` | `tizu-last-flare-ocean-memory` | `tizu-normal-attack` |
| Flora | `flora-root-of-hope` | `flora-briar-shot` | `flora-verdant-renewal` | `flora-last-flare-worldseed` | `flora-normal-attack` |

IDs resolve to `public/assets/abilities/<id>.png` through the shared icon helper.
Regenerate with `python tools/prepare_icons.py`; use `--assets` followed by IDs
to process only selected icons. Root intake uses `--move-sources` once and refuses
to overwrite originals.

The [processing script](../tools/prepare_art.py) floods border-connected near-white
backgrounds, preserving enclosed white clothing/highlights. It reconstructs partial
edge alpha and removes white contamination, crops transparent excess, and fits
the complete silhouette into the standardized canvas below. Colored ground shadows are retained as supplied
art, not treated as white background.

With [Python image dependencies](../tools/requirements.txt) installed, regenerate:

```sh
python tools/prepare_art.py
python tools/test_prepare_art.py
```

The one-time `--move-sources` option organizes root files, refuses to overwrite
existing originals, and is not needed for ordinary regeneration.
Normal game builds do not require Python. Inspect regenerated assets over both
dark and light backgrounds; automatic segmentation is not a manual artistic mask.
All six exports were reviewed over the dark game palette and checked for fully
transparent borders, opaque interiors, and partial-alpha edges.

### Flaming Depths enemy art

Ten RGB 1232x928 originals were moved from the root without recompression;
SHA-256 hashes were compared before/after the move. All exports use the same
960x960 RGBA / 864px occupied dimension / 48px minimum padding contract.
These assets are ready for future dungeon wiring, not registered as Adventure
enemies or captured units. Stage balance lives in
[the 50-stage proposal](flaming-depths-stages.md).

| Enemy | Original | Runtime |
| --- | --- | --- |
| Ashling | [Source](../Art/source/enemies/Ashling.png) | [PNG](../public/assets/enemies/ashling.png) |
| Coalcap Kobold | [Source](../Art/source/enemies/Coalcap%20Kobold.png) | [PNG](../public/assets/enemies/coalcap-kobold.png) |
| Emberhorn Faun | [Source](../Art/source/enemies/Emberhorn%20Faun.png) | [PNG](../public/assets/enemies/emberhorn-faun.png) |
| Furnace Salamander | [Source](../Art/source/enemies/Furnace%20Salamander.png) | [PNG](../public/assets/enemies/furnace-salamander.png) |
| Cinderhide Cyclops | [Source](../Art/source/enemies/Cinderhide%20Cyclops.png) | [PNG](../public/assets/enemies/cinderhide-cyclops.png) |
| Obsidian Gargoyle | [Source](../Art/source/enemies/Obsidian%20Gargoyle.png) | [PNG](../public/assets/enemies/obsidian-gargoyle.png) |
| Brasshorn Minotaur | [Source](../Art/source/enemies/Brasshorn%20Minotaur.png) | [PNG](../public/assets/enemies/brasshorn-minotaur.png) |
| Pyrewing Harpy | [Source](../Art/source/enemies/Pyrewing%20Harpy.png) | [PNG](../public/assets/enemies/pyrewing-harpy.png) |
| Magma Wyrm Knight | [Source](../Art/source/enemies/Magma%20Wyrm%20Knight.png) | [PNG](../public/assets/enemies/magma-wyrm-knight.png) |
| Ifrit of the Last Furnace | [Source](../Art/source/enemies/Ifrit%20of%20the%20Last%20Furnace.png) | [PNG](../public/assets/enemies/last-furnace-ifrit.png) |

Target only selected IDs with the processor's optional `--assets` flag:

```sh
python tools/prepare_art.py --assets ashling coalcap-kobold emberhorn-faun furnace-salamander cinderhide-cyclops obsidian-gargoyle brasshorn-minotaur pyrewing-harpy magma-wyrm-knight last-furnace-ifrit
python tools/test_prepare_art.py
```

Add `--move-sources` only for first intake from the root. Unknown IDs are rejected
by the CLI. Omitting `--assets` regenerates all registered unit exports as before.
Dark-background review preserves complete silhouettes, weapons, and effects.
The flood algorithm intentionally retains enclosed whites, including some light
islands inside complex wings/aura and pale ground strokes. Those are not manually
masked or repainted; future artistic cleanup should use a separately approved mask.
Source art differs from some prompt details; no faces/weapons have been redesigned.

The [portrait helper](../src/presentation/portrait.ts) resolves assets with Vite's
deployment base. Selection, Element-Bearer panels, and Adventure use the
runtime images. Originals are not shipped in the game build.

## Supplied elemental dungeon packs

Flaming Depths (Infernic), Oceanic Valley (Aquatic) and Garden of Beauty
(Efflorescent) now have supplied dungeon
art wired through [the dungeon art manifest](../src/content/dungeon-art.ts).
The Gameplay dungeon cards show full-width banners and concise elemental material
descriptions, not enemy/reward catalogs or arena previews. Supplied arena/enemy
exports are now used in those three dungeons; all ten dungeons are playable.
The remaining seven use their prompt-pack enemy names, neutral combat shapes and
element-accented arenas without loading missing images. Register future approved
packs in the existing manifest to replace these visuals without changing rewards
or progression. See [integration rules](gameplay-and-elements.md#pending-artwork-and-reward-integration).
Character evolution shows
only the next recipe's own-element supplied materials. Art intake itself grants
no inventory; actual material drops and spending come from validated gameplay
transactions. Captures remain deferred.

| Pack | Banner | Arena | Enemy art | Material art |
| --- | --- | --- | --- | --- |
| Flaming Depths | `public/assets/banners/flaming-depths.png` | `public/assets/backgrounds/flaming-depths.png` | Ten existing Infernic exports | `public/assets/materials/infernic-{seed,bloom,shard,crest,heart,soul}.png` |
| Oceanic Valley | `public/assets/banners/oceanic-valley.png` | `public/assets/backgrounds/oceanic-valley.png` | Pebblefin Sprig, Shellcap Kappa, Brineclaw Sentinel, Coralcrest Nereid, Glasswake Kelpie, Abyssbell Oracle, Pearlscale Leviathan, Sovereign of the Endless Tide | `public/assets/materials/aquatic-{seed,bloom,shard,crest,heart,soul}.png` |
| Garden of Beauty | `public/assets/banners/garden-of-beauty.png` | `public/assets/backgrounds/garden-of-beauty.png` | Budling, Mosscap Brownie, Thornshell Beetle, Petalhorn Satyr, Orchid Mantis, Moonbloom Dryad, Verdant Antler Regent, Empress of the Thousand Blooms | `public/assets/materials/efflorescent-{seed,bloom,shard,crest,heart,soul}.png` |

Originals are preserved under `Art/source/enemies`, `Art/source/materials`,
`Art/source/banners` and `Art/source/backgrounds`. The ten duplicate root Infernic
enemy files were hash-identical to existing originals and are preserved separately
in `Art/source/intake-duplicates`; existing Infernic runtime exports were untouched.
Different existing source bytes cause an explicit collision error.

- Enemy exports: 960x960 RGBA, 864px longest visible extent, minimum 48px padding.
- Material exports: 256x256 RGBA, 224px extent, minimum 16px padding.
- Both reuse border-connected white-matte removal, retaining enclosed pale details.
- Banners: original 1904x640; arenas: original 1456x816. Copy original bytes without
  matte removal, square normalization or repainting. Layout preserves aspect ratio.
- Material visual names: Seed, Bloom, Shard, Crest, Heart, Soul of the element,
  corresponding to Common, Uncommon, Rare, Epic, Legendary, Omnic in order.
  Stable gameplay IDs remain unchanged. First-pass drop/cost rules are owned by
  [Gameplay](gameplay-and-elements.md) and [progression](units-and-progression.md).

Regenerate after intake:

```sh
python tools/prepare_dungeons.py
python tools/test_prepare_art.py
```

Use `--move-sources` only for intentional root intake. `--elements efflorescent`
limits processing to Garden of Beauty; omitted selector regenerates all three
packs. Newly supplied character-evolution PNGs were not processed in this pass.
Asset URLs use the Vite
deployment base; previews lazy-load images. Tests cover file existence, exact
export sizing/transparent borders, byte-identical landscapes and duplicate archives.

## Infernis ability icons

All six 1024x1024 RGB originals were moved byte-for-byte into
`Art/source/abilities/infernis`. Source hashes were verified after the move.
Runtime exports use a **256x256 RGBA** canvas, longest visible dimension **224px**,
centered with at least **16px transparent padding** on every side.
They reuse border-connected white-matte removal but have a separate sizing contract.
Enclosed pale highlights remain preserved; no supplied symbol was repainted.

| Action | Original | Runtime |
| --- | --- | --- |
| Passive | [Unbroken Ember](../Art/source/abilities/infernis/Unbroken%20Ember.png) | [PNG](../public/assets/abilities/infernis-unbroken-ember.png) |
| Ability 1 | [Cinder Cleave](../Art/source/abilities/infernis/Cinder%20Cleave.png) | [PNG](../public/assets/abilities/infernis-cinder-cleave.png) |
| Ability 2 | [Flame Arc](../Art/source/abilities/infernis/Flame%20Arc.png) | [PNG](../public/assets/abilities/infernis-flame-arc.png) |
| Last Flare | [Dawnfire](../Art/source/abilities/infernis/Last%20Flare,%20Dawnfire.png) | [PNG](../public/assets/abilities/infernis-last-flare-dawnfire.png) |
| Normal (original Light icon) | [Light Attack](../Art/source/abilities/infernis/Light%20Attack.png) | [PNG](../public/assets/abilities/infernis-light-attack.png) |
| Retired Heavy (archive only, not referenced by runtime) | [Heavy Attack](../Art/source/abilities/infernis/Heavy%20Attack.png) | [PNG](../public/assets/abilities/infernis-heavy-attack.png) |

Regenerate with `python tools/prepare_icons.py`, then `python tools/test_prepare_art.py`.
Use `--move-sources` only for first root intake; existing source collisions fail.
The [shared icon helper](../src/presentation/ability-icon.ts) supplies
deployment-base URLs to Character overview/individual ability areas,
and Adventure's action buttons/passive help. Icons are decorative companions to
visible text, not replacements for labels, costs or hotkeys. All three starters
use their own supplied icons, including the four-direction hold guide.
Tab changes still preserve the character portrait DOM.
Icon sizing is 32px in battle and 40px in character/passive panels, contain-fit.
The [icon tests](../src/presentation/ability-icon.test.ts) verify all fifteen active mappings,
dimensions/RGBA, menu/gesture use and absence of Defense substitution.
The sixth supplied Heavy icon is retained only as an archive/export.

## Standard character and enemy sizing

Every runtime character/enemy PNG uses a **960 x 960 transparent RGBA canvas**.
Trim transparent excess, scale uniformly so the longest content dimension is
**864px**, then center it with at least **48px transparent padding on every side**.
Never stretch the art or crop weapons/effects to fill the square. Smaller source
images are upscaled to this same occupancy; use high-resolution originals to
avoid softness. This standardizes complete silhouettes, not anatomical head/body
height: a wide greatsword still needs more horizontal space than an unarmed creature.

This runtime export standard does not change the 4:3 Midjourney source-art guide.
Currency icons, interface symbols, backgrounds, and other non-unit assets have
their own usage-specific dimensions and are **not** processed with this sprite rule.

Selection portraits use a square slot up to 250 CSS pixels. The mock-up-inspired
hub showcase uses a standardized square slot up to 380px on Character Upgrades
(240px desktop / 220px mobile on the compact Home screen)
so the Element-Bearer is a focal point; all three characters use identical sizing.
Battle sprites share square slots up to 185px (100px on mobile).
Slots shrink to their container width and images use `object-fit: contain`.

### Unit facing

Characters face left and enemies right in battle and character menus. Authored
direction is registered per runtime art ID in
[unit-facing metadata](../src/presentation/unit-facing.ts). Opposite-facing PNGs
are mirrored with image-only CSS `scale: -1 1`; already-correct and frontal art
is retained. Frontal poses cannot become true side views through mirroring;
directional replacements require new art, not stretching or repainting originals.
Add facing metadata when integrating future enemy/character art. Missing
metadata throws explicitly, so new art cannot silently face the wrong direction.
Selection, Home, thumbnails, Character, Squad, evolution silhouettes and battle
share this rule. Evolution refreshes metadata without replacing the portrait DOM.
Battle attacks animate a sprite wrapper, preserving image orientation and also
supporting the neutral art-pending enemies. Icons/materials/scenery/text are not
mirrored; source/runtime PNG bytes are unchanged.
An individual review of all59 supplied combat sprites (18 character forms,
41 enemies) corrected17 metadata entries. For frontal faces with directional
weapons, bow aim/spear point/blade stance determines combat orientation; truly
neutral frontal artwork stays unchanged. The reviewed source directions are:

| Runtime art IDs | Source direction |
| --- | --- |
| tizu-evo-2, flora-evo-4, flora-evo-5, shellcap-kappa, heavens-dawn-without-mercy | Right |
| tizu-evo-4, tizu-evo-6, cinderhide-cyclops, obsidian-gargoyle, petalhorn-satyr, orchid-mantis, verdant-antler-regent | Left |
| heavens-thorns-first-light, heavens-crimson-reckoning, abyss-hunger-beyond-veil, abyss-worldfall-reverie, abyss-night-without-end | Left |

Skill/ultimate portrait cut-ins use the same metadata and image-only mirroring
as battlefield art. Cut-in panel/portrait motion and attack-wrapper transforms
never override the image's `scale`; labels and overlays are never flipped.
Regression tests cover every supplied file and the reviewed directional overrides.
Battle sprite wrappers contain a separate idle wrapper for a slow five-second
1x->1.025x pulse. This affects only living units, not labels, target rings or
gesture overlays; reduced-motion settings disable it. Do not apply the idle
transform to the attack wrapper or mirrored image directly.
Thus each surface has consistent sizing without forcing large portrait dimensions
onto compact battle cards. All incoming unit art must use the same export pipeline:
place the original in `Art/source/characters` or `Art/source/enemies`, add its
filename/category/ID to `ASSETS` in the processing script, regenerate, and run the
image tests. Runtime exports are checked for size, alpha, content occupancy, padding,
and centering. Register the resulting path in the starter/enemy definitions.
The [unit-art contract test](../src/presentation/art.test.ts) also checks every
PNG in those two runtime folders during `npm test` and deployment, rejecting
non-960px or non-RGBA assets. Other asset categories are deliberately excluded.

## Proposed asset intake

1. Identify unit/form/asset IDs and intended UI or battle usage.
2. Use the existing guide; record prompt, tool/model, parameters, seed where available,
   reference provenance, generation date, and approval state.
3. Inspect full-resolution and thumbnail readability against the guide.
4. Obtain owner approval before marking a concept production-ready.
5. Preserve the source and create separate runtime exports.
6. Register the export in the eventual asset manifest and verify it in-game.

Suggested basename: `ember-stage-01-character-v001`; use the correct extension.
Static character/enemy layout and dimensions are specified above. Animation
formats/pivots and non-unit asset dimensions remain usage-specific future decisions.

## Source versus runtime art

The pure-white background is a concept/source requirement. Runtime character/enemy
sprites use transparent square exports as specified above.
Do not overwrite originals during conversion. Document export settings and
inspect edges, effects, scaling, and cropping in the actual UI.

Illustration stages are not automatically battle sprites or animation frames.
Weapon concept art does not establish an equipment system.

## Asset record template

```text
Asset ID:
Unit/form or other usage:
Source path:
Runtime export path:
Creator/tool/model:
Prompt/parameters/seed:
Reference sources and usage rights:
Approval status and approver:
Dimensions/aspect ratio:
Export settings:
Known issues:
```

## Review checklist

- Identity, proportions, eyes-only face, palette, and evolution motif match.
- Complete weapon/effects stay inside the required outer margin.
- Composition reads at expected display size, not just enlarged.
- Source and reference usage rights are documented; no copied franchise assets.
- Runtime export meets the selected importer and rendering requirements.
