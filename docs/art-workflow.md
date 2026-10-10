# Art and asset workflow

## Emberwake Story delivery (D-178)

Installed the five Infernic creatures and Emberwake March arena. All30 Story
creatures and six regional arenas are now delivered. Owner explicitly excludes
the new World Map.png from this intake; the installed D-171 map and
its source/hash remain unchanged.

Original six files are archived byte-for-byte under Art/source/story/infernic.
`tools/intake_story_art.py --element infernic` limits processing and root cleanup
to this region while preserving the other31 manifest records. Source-specific
keys, reviewed enclosed-gap seeds, moth ribbon spill regions and facing are in
Art/provenance/story-art-settings.json; hashes/reproduction records extend
story-art-intake.json. Keep genuine flames, pale claws, armor and painted shadows
(including the boar's teal ground shadow). No runtime keying.

Five transparent960px sprites have at least48px outer padding. The1456x816 arena
preserves every source pixel as opaque scenery. Shared Story registry/facing/
byte revisions cover encounters, battle art and discovery-gated galleries.
Reproduce with `python tools\intake_story_art.py --element infernic --apply`;
refresh `python tools\story_art_revisions.py --write`.

## Full installed Conduit cleanup review (D-177)

Owner reports background color remaining inside some icons and requests a review
of every Conduit artpiece. Review complete for all60 installed images; the25
undelivered reborn kit designs cannot be reviewed as pixels and remain pending.
Inspect authoritative source, dark/light composites and enclosed openings
individually; same-color gems/powers are not background merely because they match
the key. Preserve original bytes, pale metal, elemental detail and authored shadows.

Correct only reviewed per-source keys/gap seeds/edge masks in the owning exporter,
not global green/cyan removal or a disconnected runtime patch. Supplied original
alpha stays authoritative; do not re-key it. Preserve replaced runtime bytes and
record all60 verdicts plus before/after/source hashes and reproduction settings
in Art/provenance/conduit-cleanup-review.json. Refresh shared Conduit URL revisions
after verified exports. No mechanics, source art repainting or save changes.

Five corrected exports: Chaotic Paradox Spindle, Execution Orrery, Meridian
Inverter, Nullsong Transmission and Prism Splinter Socket. Reviewed enclosed
key islands and narrow source-border remnants were removed; genuine cyan/violet
facets, pale metal and authored shadows retained. Other55 needed no correction.
`tools/intake_delivered_art.py` owns updated seeds/keys/row-gradient/border-strip
settings; previous five exports archived under
Art/source/delivered-root-art/previous-runtime/conduits/D-177.
`python -m unittest discover -s tools -p test_conduit_cleanup_review.py`
verifies all60 source hashes, verdicts, prior/current exports and reproduction.
`python tools\conduit_art_revisions.py` validates current shared URLs.
Older root-intake suites can reject unrelated unmapped incoming PNGs; do not
delete or fold those into this Conduit-only review.

## Reborn Omnic kit Conduits (D-176)

All25 entries in [Kit Conduits.md](../Art/conduits/Kit%20Conduits.md) now match
the replacement runtime Omnics, not old5/8/6/6 tier widgets. Stable IDs are kept.
Written original Machines Omnic standard supplies renderer/presence: full reborn
protected central mechanism, monumental ivory/platinum armor, six immense
elemental fans, nested rings/crowns, counter-sweeping ribbons and dense rear
facets. Each identity remains distinct; no image reference, copied device or
unbounded rainbow palette. Clear outer margins, visible cores and offline/no-glow
generation remain. No installed art or historical source bytes are replaced.

Reproduce `python tools\build_kit_conduit_art.py`; validate25Omnic identities,
full reborn architecture/palette/key/margins/exact regeneration with
`python -m unittest discover -s tools -p test_kit_conduit_art.py`.
Future originals belong under Art/source/kit-conduits; all25 still undelivered.

## Delivered elemental status icons (D-175)

Owner delivers all nine named root PNGs and requests background removal, archival
and wiring. All nine are installed and verified. Byte-identical originals live under
Art/source/abilities/statuses; reviewed per-source keys/gaps/hash records under
Art/provenance/status-art-settings.json and status-art-intake.json. Supplied alpha
remains authoritative; preserve pale metal/ivory and real green subject pixels.
Export transparent256px squares with no more than224px subject content. Only
remove the nine exact root files after archive/hash/export/visual verification.

`tools/intake_status_art.py` owns archival and reviewed offline reproduction.
`tools/status_art_revisions.py --write` refreshes shared byte-derived URL revisions
after exports; without --write verifies them. Runtime registry uses stable
abilities/statuses/status-*.png IDs and Vite deployment-base paths.

Typed resource family/origin/kind resolves six shared icons and three exact Rose
resource signatures. Actual Burn gets the shared Infernic icon; actual Weaken
and Fracture get Chaotic Suppression, retaining precise labels/owners/clocks.
Native counters show icons next to exact0/3 values. Relevant equipment charges
share family art in full Battle reference, never merge with native counts.
Compact field retains its existing small native counter/enemy badge scope.
Unrelated non-elemental effects stay text, no arbitrary icon substitution.
Icons are decorative with empty alt/aria-hidden; real text stays accessible.
No combat math, effect/clock/ownership, rewards/RNG/account writes or new status.

## Consolidated elemental status artwork (D-173)

Owner reduces unnecessary special effects/counters and approves shared elemental
families with precise Rose signatures. [Battle Status Icons.md](../Art/ui/Battle%20Status%20Icons.md)
now has nine prompts, superseding the40-prompt checklist below: Burn, Ward, Bloom,
Tempest, Focus, Suppression, Rose Grace, Thorn Aegis and Rose Duality.
Share family art without merging actual mechanics/source/count/clocks. Basic
combat meters and non-elemental equipment feedback remain live text without
separate generated status images. No installed/source art changes.
Reproduce `python tools\build_status_art.py`; validate status prompt tests.

## Delivered Story art intake (D-171)

Owner supplies31 root PNGs:25 creature portraits, five regional arenas and
World Map.png. Oceanic/Atmospheric/Botanic/Tranquilitic/Chaotic are delivered;
Infernic's five creatures and arena are not. Do not request missing files or
substitute another element's art. Story IDs/stats/encounters/rewards are unchanged.

`tools/intake_story_art.py` owns exact filename mappings, reviewed source-specific
background keys/enclosed-gap settings, visual/export reproduction and hash-safe
archival. Originals live in Art/source/story/<element> and world-map; records in
Art/provenance. Root copies are removed only after archived bytes/hashes and
reviewed exports verify. Enemy sprites are960px transparent padded cutouts;
supplied alpha is authoritative. Source-clipped tips are not reconstructed.
Arenas/map stay opaque, preserving aspect ratio, never keyed like creatures.

`content/story-art.ts` registers actual delivered enemies and arena/map filenames.
`storyCreature` shares the same art with catalog/spawns; reviewed unit-facing
metadata covers field/cut-ins. Deployment-base shared URLs get byte-derived
revisions from `python tools\story_art_revisions.py --write` after reviewed
exports; running without --write validates the revisions are current. Gallery
silhouettes/discovery gates remain. Map shows the entire supplied scenery at its
natural aspect ratio, with six accessible region controls/stage locks below.
Do not infer terrain button coordinates or bake art text into unlock semantics.

Validate targeted intake tests, `src/content/story-art.test.ts`, Story/battle
chrome/facing/portrait/Collections tests, full suite/build and browser image decode/
field/map checks with no owner-save mutation. Prompt generation references in
Art/creatures/story remain intact; other missing art stays explicitly pending.


## Complete battle-status prompt pack (D-170 / D-172)

[Battle Status Icons.md](../Art/ui/Battle%20Status%20Icons.md) now contains40
copy-ready reference-free1:1 prompts: existing debuffs/native resources/team buffs,
new Standard/Rose/War resources, all actual equipment charges and generic shield,
Defense/recovery/Gauge/cooldown indicators. Explicitly distinguish instant cooldown
feedback from persistent charges; art does not create statuses or modify clocks.
All numerical counts/strengths/source owners remain real HTML, never baked text.

Reproduce using `python tools\build_status_art.py`; validate with
`python -m unittest discover -s tools -p test_status_art_prompts.py` and the shared
prompt-policy suite. Preserve old proposed status IDs; single cohesive symbols,
per-symbol palette locks/unwanted hues, solid green keys (magenta for green subjects),
no key-color negation, complete margins/no-glow compact anime/cel renderer.
Sources belong in Art/source/abilities/statuses, not root; export transparent256px
with224px content only after review, alpha-safe offline processing and shared
resolver integration. Currently prompt-only: no missing-image URLs or generated
art installed. See [kit rules](character-kit-rework.md).


## Story map, creatures and arenas (D-168)

Owner requests copy-ready Midjourney packs for the implemented world map,
regional enemies and battle arenas matching elemental dungeons. Organized
[Story packs](../Art/creatures/story/README.md) cover30 exact runtime identities,
six arenas and the [world map](../Art/ui/Story%20World%20Map.md),37 prompts total.
No new creature evolution/rarity/capture promise or gameplay change. D-171
installs the delivered25 creatures/five arenas/map; Infernic remains pending. Cutouts follow current keys/palette/no-glow/containment rules; arenas
use side-view empty equal-height standing lanes and scenery lighting; map is
overhead connected terrain with all functional text/controls overlaid in HTML.

All52 previous root deliveries are archived; repository root has no remaining
images. Future Story originals go under Art/source/story/<element> or world-map,
preserving bytes/hashes. Proposed runtime paths in packs are intake targets,
not image registrations. Review generated species/palette/tips/enclosed keys,
standing lanes and desktop/mobile framing before offline export/shared wiring.
Supplied alpha remains authoritative. Never background-remove scenery.

Run `python -m unittest discover -s tools -p test_story_art_prompts.py` for exact
runtime-name/ID coverage,37 prompts, renderer/flags/word budgets/keys, side-view
arenas and six ordered map terrains. Also run the shared prompt-policy suite;
historical Machines failures are separate from newly authored Story results.

## Organized physical Art library (D-160)

Owner approves the safe phased rework baseline. Physical filing now moves
77 documents/records into the [Art library](../Art/README.md):
37 formerly flat prompt documents,14 activity Markdown files and26 JSON records.
Character, creature, Conduit, item, UI/scenery and guide categories are distinct.
Mixed Starter Art stays with characters; activity packs retain enemies/materials/
scenery together under creatures. Existing dungeon/infusion subpacks are nested
under creatures. Experiments stay separate.

Records/settings/reviews move to `Art/provenance` **without byte changes**.
Recorded source/runtime paths and hashes stay unchanged. Supplied sources remain
under `Art/source`; runtime exports are untouched. Filing verified1237
source/runtime/provenance files byte-identical and did not rerun image processing.

Generators, intake/export/review tools and tests resolve paths through
[art_library.py](../tools/art_library.py). The explicit map accepts legacy
logical pack names without keeping duplicate physical files; already-canonical
paths are unchanged. New generated records belong under provenance. Markdown
links and source-referencing TypeScript fixtures point at the new destinations.
Do not use old flat paths or rebuild originals simply to organize the library.

Validate with `test_art_library.py`, existing prompt/reproduction/intake suites
and the three presentation tests reading Art source/metadata. The one-time
[filing tool](../tools/organize_art_library.py) fails preflight if old inputs are
missing or destinations exist; do not rerun it on the organized library.
No source deletion, combat/save change, palette regeneration or deployment.

## Character palette control (D-159, current policy)

Owner reports the warm Rosetta Legendary prompt succeeds with explicit
blue/navy/cyan negatives, subject-only palette remapping and reference weight150.
Apply this format to all16 authored character lines, not a global blue ban.
The224 canonical cutouts cover115 referenced portraits (including19 guide
templates/examples) and109 reference-free character-specific icons/weapons.
The two Rosetta experimental variants also follow150/current warm colors;
their earlier400/minimal-blue comparisons are superseded, not preserved controls.

- Preserve each exact signed reference URL, all flags/quality settings except
  weight150, identity, equipment, ornate silhouette, framing and solid key.
- List unwanted hues first in the single `--no` clause. Remove contradictory
  positive colors: warm reds replace Rose blue/violet facets; Infernis removes
  cyan/violet fringes; Tizu removes rose/violet water refractions; Flora removes
  aqua/violet and rainbow-string cues. Do not simplify the evolving regalia.
- Prismatic/opal remains geometric/material language, explicitly restricted to
  the allowed palette rather than rainbow colors. Retain authored blue on Tizu,
  Nerithe, Atmoso, Bliss and Vaelor; green on Flora/Elise; shadow/geode violet
  where designed. Neutral/material exceptions are explicit per character.
- The restriction affects the subject only. Do not negate the exact key hue in
  `--no`; the subject lock still forbids it when off-palette. This avoids fighting
  the solid blue/green/orange/magenta background instruction.
- Character-specific icons/weapons inherit palette controls without gaining
  references. Scenery, production enemies, universal icons, source/installed
  images, runtime behavior and saves are unchanged.

Shared rules: [character_palette.py](../tools/character_palette.py).
Idempotent canonical update: `python tools\update_character_palettes.py`.
War/experimental generators import the same policy; regenerate with
`python tools\build_elemental_war_art.py` and
`python tools\build_enemy_style_pilot.py`.
Validate coverage, forbidden positive colors, preserved references/keys,
single flags,450-word total ceiling and unchanged design-only budgets using
`test_character_palettes.py`, `test_character_style_references.py`,
`test_elemental_war_art.py`, `test_enemy_style_pilot.py` and `test_art_prompts.py`.
Passing text tests is not pixel acceptance: other characters still need owner
review of generated full-resolution palette, layering and tip containment.

## Reference-style versus palette pilot (D-158)

Owner wants the approved reference renderer, not borrowed costume/palette.
[Separate three-enemy pilot](../Art/experiments/Enemy%20Style%20Pilot.md)
preserves production species/details/framing and exact owner URLs while testing
weight10 in revision2 after the owner rejected weight50's palette transfer.
Material/color-placement clauses and individual exclusions retain legitimate
blue/fire/opal. No new reference artwork or grayscale intake required.
Production enemy packs remain reference-free; no global rollout or
enemy change until generated pale/blue/crimson comparisons are reviewed.
Character rollout is separately approved under D-159 above.
Low weight/text priority cannot guarantee Midjourney separation. Do not remove
legitimate blue or fire or simplify elaborate art to manufacture clear margins.
[Art library index](../Art/README.md) now reflects the implemented D-160 filing
pass above; source image paths remain unchanged.
Validate pilot generation with `test_enemy_style_pilot.py`; all broad prompt
tests recognize only this named experiment as a weight10 exception.

## Reference-free enemies (D-155, current policy)

Owner reports reference influence remains excessive and requests removal from
each enemy prompt. Removed both `--sref` and its paired `--sw` from all129
enemy generation blocks across18 packs: Machines, Treasury, Sanctuary, Crimson
Roses, Heaven/Abyss, ten elemental dungeons, historical ten-enemy Flaming Depths
and three Starter Art enemies. Character portraits retain their exact references
at150 under D-159, including the three starters sharing a file with enemy prompts.
Items/icons/scenery remain reference-free.

Written species/equipment/palettes/renderer/background/framing are preserved,
including the Machines whole-design70% maximum/15% minimum clearance pilot.
No references should be reappended from the historical enemy URL table.
D-155 supersedes D-132/D-153 and the reference-weight portion of D-154,
not its framing. Original sources and installed art are unchanged.
Reference-free text prompts still require full-resolution visual acceptance;
no generation or pixel-level palette/clearance success is claimed.

Validate with `test_enemy_style_references.py` (all129 reference-free enemies),
`test_machine_art_prompts.py`, `test_character_style_references.py`
(unchanged exact character URLs,150 weight), and `test_art_prompts.py`.

## Machine enemy framing/palette pilot (D-154)

Historical weight experiment: D-155 subsequently removes every enemy reference
pair. The framing and authored-palette instructions below remain applicable.

Owner reports edge contact and enemy reference palette bleed; chooses Machines
first rather than global character/enemy edits. Six prompt blocks now use
maximum50/60/70/70/70/70% full-ensemble footprints and minimum25/20/15/15/15/15%
outer margins, measured beyond every ornament/effect. Added early pulled-back
framing and final containment/palette reinforcement. Removed corner-reaching
direction, preserved all species/equipment/wings/authored colors/interior detail.
References remain exact D-153 URLs, but machine weight is100 instead of400.
Other character/enemy references remain400. Items/scenery remain reference-free.
[Pilot and image review](../Art/guides/cutout-background-contract.md#machine-enemy-pilot-explicit-outer-footprint-d-154).

Only prompt text/tests/docs changed;20 Conduit prompts and two scenery blocks
were byte-identical through the bounded rewrite. No new generation, installed
asset changes or pixel-level success claim. Require new full-resolution outputs
to verify both actual tip clearance and reduced palette transfer before rollout.
Validate with `test_machine_art_prompts.py`, `test_enemy_style_references.py`,
`test_character_style_references.py` and `test_art_prompts.py`.

## Six-form enemy style references (D-153)

Owner supplied six distinct enemy references and confirmed all six-form enemy
packs as scope. [Exact mapping](../Art/guides/midjourney-character-style-prompt.md#six-form-enemy-references-d-153)
applies Evo.1-6 to Awaken the Machines, Crownfall Treasury, Rosethorn Sanctuary,
Passion of Crimson Roses, Soar to Heaven and Delve into the Abyss.
All36 enemy portrait blocks end with one exact `--sref URL --sw 400`
(Machines subsequently reduced to100 under D-154);
retain full signed query strings. Evo.2/3 are distinct here.

Character portraits and basic/eight-/ten-enemy lineups keep their previous
references. D-147 still excludes all icons, Conduits, materials, weapons and
scenery. Only suffix URLs changed: original identities, palettes, equipment,
compact renderer, no-glow cutouts and framing remain intact. Reference images
are style guidance, not licensed game assets to copy. No installed art changed,
no images downloaded/generated, and no runtime/gameplay/save changes.
Expired signed URLs need owner replacements, never silent substitutions.

Validate exact owner URLs, all129 enemy suffixes, containment and non-portrait
exclusions with `python -m unittest discover -s tools -p test_enemy_style_references.py`.
Also run `test_character_style_references.py` to check the unchanged character
mapping and `test_art_prompts.py` for shared prompt contracts.

## Elemental War supplied cutouts (D-152)

Originally Orvella/Vaelor's24 cutouts; D-156 adds Nerithe's six portraits,
four ability icons and all six sub-mode headers/arenas. The40-asset manifest
covers18 portraits,16 icons and6 scenery images.
`tools/intake_elemental_war_art.py` preserves exact root originals under
`Art/source/elemental-war/{characters,abilities,banners,backgrounds}`, exports transparent960px
portraits/256px icons with864/224px content, verifies hashes before removing
only verified incoming files, and rejects source/runtime/provenance conflicts.
Headers1904x640 and arenas1456x816 are copied byte-for-byte, with no keying,
resizing or cropping. `Valor Activity Banner.png` is the supplied Vaelor header,
not a character rename. Nerithe Normal Attack/Defense icons were not supplied;
their actions remain text-only, with no missing-image requests.
`Art/provenance/elemental-war-settings.json` records per-source border-connected RGB
keys, individually selected enclosed gaps, reviewed gradient samples for
Orvella Omnic, bounded icon-frame cleanup and source-facing metadata.
No runtime keying, blanket color removal or reconstruction of source-clipped
tips. Painted powers, pale eyes, equipment and contact shadows are retained.
Any supplied alpha bypasses every key/gradient/frame correction.

`Art/provenance/elemental-war-intake.json` records all original/export hashes and exact
processing settings. Shared prepare_sprite prioritizes these reviewed sources,
and character-art revision URLs refresh portraits/locked silhouettes/boss
sprites/cut-ins without duplicate enemy PNGs. All three6-star characters and their
trials are live; Character Archives reveal only owned/reached forms, never
merely defeated boss forms. Family header and standalone weapons remain
pending. Original prompt concepts remain authored
as proposals where supplied equipment differs, not pixel-edit instructions.

Review: `python tools\intake_elemental_war_art.py --review <review-directory>`.
Install: `python tools\intake_elemental_war_art.py --apply --remove-incoming`.
Reviewed corrections: `python tools\intake_elemental_war_art.py --reprocess-reviewed --apply`.
This verifies installed original/runtime hashes before changes, archives replaced
exports under `Art/source/elemental-war/corrections`, retains manifest history
and refreshes portrait revisions. Review changed settings/outputs before applying;
never bypass provenance conflicts or silently overwrite externally changed art.
Validate: `python -m unittest discover -s tools -p test_elemental_war_intake.py`
and `test_elemental_war_art.py`; runtime:
`npm test -- src\game\elemental-war.test.ts`, then build/registry regressions.

## Revised universal action icons and coins (D-151/D-157)

[Two copy-ready prompts](../Art/ui/Universal%20Action%20Icons.md) author a
steel sword with a sweeping action arc for Normal Attack and a steel shield
for Defense. These supersede the earlier prismatic wing/shield concepts;
the older root PNGs are not the revised replacements.
Keep the current compact anime/cel renderer, opaque non-emissive cutout shapes,
clear complete margins and D-147's no-reference rule for non-portrait assets.

The supplied D-157 icons are reviewed and installed through the shared
ability resolver for every live Element-Bearer. Originals and runtime hashes
are recorded in [D-157 provenance](../Art/provenance/d157-root-art-intake.json);
superseded source art remains preserved. Passive/Skills/Last Flare stay
character-specific. [Phases and acceptance](conduit-expansion-plan.md#phase-5---asset-intake-and-implementation).

[Currency prompts](../Art/items/Currencies.md) request a white shimmering coin
and cracked black coin with red/white lightning. Use painted reflections,
opaque crisp sparkle marks/zigzags under the no-glow cutout contract. The
reviewed D-157 coin replacements now use the existing internal IDs; previous
runtime exports and historical originals/provenance remain preserved.
No balance or transaction changes.

## D-157 universal icons and currency replacement intake

The four approved root deliveries are installed: two shared ability icons
(Normal Attack and Defense) and two currency replacements (Prismatica and
Null-Prismatica). Exact incoming names map to the established universal icon
IDs and `fractalis`/`lycalis`; shared ability/currency URL resolvers include
byte-derived cache revisions. No reward, economy, combat, or save behavior
changed.

The RGB sources use individually sampled border-connected green keys and
bounded edge cleanup. One explicitly reviewed interior seed removes the
sword's enclosed background gap. The shield's pale metal and the coins' white
facets, red lightning, dark details and blue cast shadow remain opaque.
Light/dark contact sheets and representative small exports were inspected.
Original source bytes and runtime hashes are recorded in
[D-157 provenance](../Art/provenance/d157-root-art-intake.json). The former
D-142 currency runtime exports are separately preserved and hash-verified;
historical currency originals and provenance are retained.

Reproduce the intake with `python tools\intake_d157_root_art.py --apply`;
review candidates with `python tools\intake_d157_root_art.py --review <directory>`.
Validate using `python -m unittest discover -s tools -p test_d157_root_art_intake.py`,
`python -m unittest discover -s tools -p test_prism_currency_intake.py` and the focused
presentation icon/currency tests. Root cleanup is allowed only after archive
and installed-export hash verification.

[Status prompts](../Art/ui/Battle%20Status%20Icons.md) are generated reproducibly
by `python tools\build_status_art.py`. Each is a complete reference-free1:1
compact cel symbol with safe margins, opaque powers and solid green background
through gaps. Live debuffs/charges use accessible text until intake; counts,
strength and clocks remain real HTML, not baked into pictures. No invented
URLs. Validate with `python -m unittest discover -s tools -p test_status_art_prompts.py`.

## Individually reviewed portrait pockets (D-150)

Review every character line before choosing corrections. The current78-form
contact-sheet audit identifies13 affected portraits: Bruno base; Tizu Evo.3/5/6;
Bliss Evo.6; Razor Evo.6; Elise Evo.5/6; Aurora Evo.5; Flora Evo.4/6; Disciple
Evo.2/5. [Explicit source-coordinate corrections](../Art/provenance/portrait-pocket-corrections.json)
add78 reviewed gap seeds, not a global hue/white-removal pass. Two bounded
Elise Evo.5 hair-gap polygons accommodate locally different backdrop shades;
Bliss Evo.6 has its own bounded2-source-pixel black-edge cleanup. Existing
global thresholds and all other portraits stay unchanged.

Keep similar foreground colors: white eyes/feathers, black armor/cape,
gold equipment, elemental powers and intentionally painted contact shadows.
Selected foreground pixels are regression-tested against original RGB bytes.
Delivered alpha still bypasses all keying. Source originals, original intake
backups, facing, names, ownership and gameplay are unchanged.

Both refresh settings loaders include these source-specific corrections.
The strict original intake guards remain active. Use
`tools/reprocess_portrait_pockets.py` for subsequent reviewed revisions:

1. Change only explicitly reviewed source settings/coordinates.
2. `python tools\reprocess_portrait_pockets.py --assets <distinct-asset-IDs> --review <new-directory>`
   generates exact candidates, dark/light previews and a hashed plan; no install.
3. Inspect each candidate, including pale/dark foreground and nearby gaps.
4. Run the same command with `--apply`. It verifies source/current/historical
   hashes and rejects changed settings, provenance, plans or candidate bytes.
   Pre-correction PNGs are preserved under each source family's `corrections`
   folder; intake `processing_history` records hashes and old processing.
   Only selected runtime PNGs/manifests change; shared URL revisions regenerate.

Validation:
- Combined Python modules `test_portrait_pockets`, `test_character_refresh`,
  `test_starter_refresh`, `test_character_art_revisions`, `test_prepare_art`:
  **35 tests passed**, including all78 current exports,78 extra gap seeds,
  retained foreground, correction history, local-mask boundaries, conflict
  rejection, historical supplied-alpha compatibility and URL revisions.
- Final `python -m unittest discover -s tools -p test_portrait_pockets.py`:
  **6 passed**, after adding explicit source/runtime/backup-conflict preflight
  coverage and requiring correction history for every selected portrait.
- `python tools\intake_character_refresh.py` and
  `python tools\intake_starter_refresh.py`: strict dry runs pass (60/18 portraits).
- `npm test -- src\presentation\portrait.test.ts src\content\character-art.test.ts src\presentation\archives.test.ts src\presentation\battle-cutin.test.ts`:
  **4 files /48 tests passed**.
- **Build Last Light** (`npm run build`): TypeScript/Vite pass, existing
  large-chunk advisory only. All13 browser-fetched corrected images decode
  at960x960; shared helper URL revisions match fetched SHA-256 prefixes.

## Replacement starter portraits (D-149)

Owner delivers all18 starter forms: Beginner through Omnic for Infernis, Tizu
and Flora. New byte-preserved originals live in `Art/source/starter-refresh`;
the previous18 runtime exports live in its `previous-runtime` folder. Historical
originals and supplied-alpha files/manifests remain unchanged. New RGB artwork
does not replace or re-key those historical alpha sources.

[Intake provenance](../Art/provenance/starter-refresh-intake.json) records incoming names,
source/previous/runtime SHA-256 values and exact reviewed processing.
[Per-source settings](../Art/provenance/starter-refresh-settings.json) use border-connected
RGB keys, row-gradient samples for the three gradient backdrops and116 manually
reviewed enclosed-gap seeds. Bounded edge decontamination removes key spill;
Flora Omnic uses a wider6-source-pixel edge band while retaining pale feathers,
eyes, gold equipment, green power shapes and fine bow details. Intentional
painted contact shadows remain. No global hue/white removal or runtime keying.
Any delivered alpha bypasses keying entirely.

Exports are960px RGBA/864px content with48px+ margins, uniformly normalized.
Some delivered tips/feet already touch source edges; padding does not invent
missing artwork. Preserve supplied identities/designs instead of changing art
to match older prompt descriptions.

Stable `infernis`/`tizu`/`flora` and `-evo-2` through `-evo-6` asset IDs make the
new art available in starter selection, Home, Character, Squad, Summon,
Archive color/locked silhouettes, next-evolution previews, battle and cut-ins.
All18 source-facing values were re-reviewed; shared metadata mirrors only the
art. The shared content-revision map now versions the new bytes automatically.
No names, mechanics, stats, acquisition, ownership gates or saves change.

`prepare_sprite` prioritizes these reviewed replacement sources over historical
supplied alpha/legacy white masks. `review_art --cleaned` and future review
records use the new processing too; historical-source tests still audit their
original bytes and preserved previous exports. Do not rerun legacy masks on
new RGB images.

Commands:
- `python tools\intake_starter_refresh.py --review <review-directory>`:
  create candidate PNGs plus dark/light six-form sheets without installation.
- `python tools\intake_starter_refresh.py --apply --remove-incoming`:
  conflict preflight, preserve both generations, install/hash-verify all18,
  regenerate character URL revisions, then remove only matched incoming files.
- `python tools\intake_starter_refresh.py`: verify reproducibility/provenance.
- `python -m unittest discover -s tools -p test_starter_refresh.py`:
  all hashes/sizing/margins,116 gaps, pale-detail preservation, alpha bypass and
  shared exporter routing.
- `python -m unittest discover -s tools -p test_prepare_art.py` and
  `python -m unittest discover -s tools -p test_character_art_revisions.py`:
  historical/source-alpha compatibility and current cache identity.
- `npm test -- src\presentation\unit-facing.test.ts src\presentation\portrait.test.ts src\content\character-art.test.ts src\presentation\archives.test.ts src\presentation\battle-cutin.test.ts src\presentation\roster.test.ts src\presentation\banner-showcase.test.ts`:
  shared menu/gallery/showcase/battle integration.

## Portrait-only style references (D-147)

Only character/enemy portrait prompts use `--sref` and `--sw`, with their
existing exact approved evolution mapping and weight400. Items/currencies/
materials/Conduits, standalone weapons, ability/action icons, emblems, banners,
arenas and all other art use neither flag. Do not manually append a reference
after copying those prompts. This supersedes older non-portrait400/200
instructions, the D-133 currency exception and D-145 pack-local exceptions.
Keep the written renderer, palette, design, framing and other flags unchanged.
Supplied/source/runtime images and gameplay are unaffected.

Validate with `python -m unittest discover -s tools -p test_art_prompts.py`
and the focused character/enemy/currency/Elemental War reference tests.

## Elemental War proposal art (D-145)

Originally design-only; the [specification](elemental-war.md) now records all
three approved, implemented challengers (D-152/D-156).
[Art index](../Art/ui/Elemental%20War.md) links three15-prompt packs: Nerithe
(female/Aquatic), Orvella (female/Tectonic), Vaelor (male/Voltaic). Six portraits,
six ability/action icons, weapon, activity header and arena each; family header
makes46 prompts. All three names, kit identities and6-star ratings are
approved; numerical kits use documented tuning. Uninstalled art IDs remain proposals.
No summon-banner artwork/pool, material prompts or extra reward assets.

Exact Evo.1-6 approved references/400 for portraits only; icons, weapons and
scenery use no `--sref` or `--sw` (D-147). Cutouts retain renderer/identity,
opaque powers, two containment cues and continuous visible margin; body becomes
one quarter/one fifth at Legendary/Omnic, anatomy never changes. Dense distinct
sea-map/geode-foundation/resonator architecture, not generic angel wings.
Activity banners/arenas stay full-bleed. Approved signed URLs may expire;
never invent replacements or treat passing tests as generated-image approval.

`python tools\build_elemental_war_art.py` expands authored designs into complete
copy-ready documents. `python -m unittest discover -s tools -p test_elemental_war_art.py`
checks reproduction,46 blocks, references/flags/ratios, identity/framing/word
budget and confirmed-versus-proposed scope. Review generated images before any
future intake; no sources/exports/URLs are fabricated by this proposal.

## Current portrait URLs and locked silhouettes (D-140)

All78 character forms use content-versioned URLs from the shared `assetUrl`
resolver. `src/content/character-art-revisions.ts` contains SHA-256-derived
revisions of installed runtime PNGs; stable asset names and saves remain unchanged.
Every color portrait, banner showcase, next-evolution silhouette, locked Archive,
battle field and skill cut-in uses that resolver, so a replaced image no longer
shares its old cached URL. Locked Archive silhouettes remain black with a subtle
neutral outline for dark-background readability; no colors are revealed.

After reviewed portrait export, run `python tools\character_art_revisions.py --write`.
The D-134 intake refreshes revisions automatically on `--apply`.
`python tools\character_art_revisions.py` validates current revisions without writes.
Validate `python -m unittest discover -s tools -p test_character_art_revisions.py`
and `npm test -- src\presentation\portrait.test.ts src\presentation\battle-cutin.test.ts`.
Never change source alpha or grant ownership just to update silhouettes.
Infernis/Tizu/Flora still use their original supplied art: D-134 only delivered
the ten non-starter lines.

## Future edge-safe composition without lost detail (D-135)

Owner requests stronger edge-avoidance emphasis in all future evolutions,
without detracting from the artwork. Follow
[complete-silhouette framing](../Art/guides/cutout-background-contract.md#complete-silhouettes-and-edge-clearance-d-135)
and the [shared prompt guide](../Art/guides/midjourney-character-style-prompt.md#future-complete-design-framing-d-135):
explicit positive framing near subject and composition clauses, continuous
visible safety margin on all four sides/corners, every equipment/power tip
inside the canvas. Applies equally to base through Omnic and enemy forms.

Pull back the whole ensemble uniformly if necessary, not its detail or power.
Preserve armor, equipment, layered elemental architecture, identity, compact
anatomy, renderer and dense intimidating finales. Historical94%/96% occupancy
and3%/2% margins are not future hard targets; complete containment comes first.
Existing prompt blocks/assets remain unchanged; scenery remains full-bleed.

Review full-resolution generated outputs before intake: all outermost tips,
every side/corner, no cut-off anatomy, continuous visible background clearance,
and unchanged design richness. Also review thumbnails for impact/readability.
Reframe/regenerate clipped output with the same design; do not call runtime
padding or matte removal a repair for missing art. D-134 sources with existing
clipping remain preserved as delivered until replacements arrive.

The documentation now records D-129 references, D-131 portrait quality,
D-132 enemy references/containment, D-133 renamed currencies/prism prompts,
D-13460-image intake and this future framing refinement. These are distinct:
prompt readiness does not imply generated assets, while D-134 portraits are
actually installed. Currency crystal replacements are installed under D-142.

## Replacement character portraits (D-134)

Owner delivers60 root PNGs and requests relocation, wiring and background
removal. These replace all six forms of Atmoso, Aurora, Bliss, Bruno, Disciple,
Elise, Razor, Rosetta, Thornia and Crinso. Owner explicitly identifies the
unnamed hammer-wielder PNG as Quarry Sentinel, Bruno. Infernis/Tizu/Flora,
ability icons, weapons, creatures, currencies and scenery are unchanged.

New originals live byte-for-byte in `Art/source/character-refresh/<asset>.png`;
previous runtime portraits remain in its `previous-runtime` subdirectory.
All historical D-121 source originals and manifests remain intact. The new
[manifest](../Art/provenance/character-refresh-intake.json) records incoming filenames,
both generations' hashes and the active runtime paths. Historical roster
regeneration verifies the preserved previous exports, never overwrites these
replacements. Do not rerun legacy masks on new originals.

[Reviewed per-source settings](../Art/provenance/character-refresh-settings.json) handle
green/teal, orange, red, blue, gray, white, black and vertical-gradient backdrops.
Black/white/overlapping-color sources use border-connected keys and explicitly
reviewed enclosed-gap seeds; Bruno's white eyes and dark armor are retained.
Bounded source-pixel edge decontamination removes color spill, with wider
reviewed bands only for soft effects. No global white/hue removal and no runtime
keying. Existing supplied transparent sources bypass keying and cleanup.
Painted shadows, pale wings, weapons and elemental structures remain.

Exports are960px RGBA with864px content and at least48px clear outer margins.
Some incoming portraits already crop tips/body at source edges; padding cannot
reconstruct missing artwork, and no invented repair is included. The exported
visible silhouettes do not touch runtime frame edges.

Existing shared asset IDs/resolvers automatically serve the replacements in
Home, Character, Squad, both Summon showcases/results, Character Archive,
battle sprites and skill cut-ins. Reviewed new facing metadata is shared by
field/portrait/cut-in presentation. No forms, titles, stats, stars, acquisition,
ownership gates or save IDs change.

From the repository root:
- `python tools\intake_character_refresh.py --review <review-directory>`:
  reproduce cutouts and six-form dark contact sheets without installing.
- `python tools\intake_character_refresh.py --apply --remove-incoming` was the
  completed one-time D-134 install for all60. Its 13 later-replaced runtime
  files are preserved by the delivered-root-art intake below; do not rerun this
  older apply/preflight against the current runtime.
- `python -m unittest discover -s tools -p test_character_refresh.py`:
  hashes, exact regeneration, all margins, reviewed gaps, preserved eyes,
  supplied-alpha bypass and facing.
- `python -m unittest discover -s tools -p test_roster_art_intake.py`:
  original135-image historical provenance and remaining active art.
- `npm test -- src\content\character-art.test.ts src\presentation\unit-facing.test.ts src\presentation\archives.test.ts src\presentation\battle-cutin.test.ts src\presentation\roster.test.ts src\presentation\banner-showcase.test.ts`:
  shared menu/gallery/banner/battle integration.

## Prismatica and Null-Prismatica replacement prompts (D-133)

Visible currency names are Prismatica (main) and Null-Prismatica (premium).
Owner chooses bright faceted prism/dark obsidian-violet counterpart designs,
in [Currencies](../Art/items/Currencies.md). Under D-147 these item prompts use
no `--sref` or `--sw`, superseding the earlier Evo.3 reference exception.
Both are opaque crisp cel-shaded objects with contrasting flat green keys,
full silhouettes and clear outer margins; no source glow/scenery/lettering.

D-142 installs both supplied crystal images. Preserve historical sources
`Fractalis.png`/`Lycalis.png` and old exports under `currencies/previous-runtime`;
new originals retain owner names under `Art/source/currencies`. Runtime IDs
remain `fractalis`/`lycalis`, now transparent256px with224px content.
Reviewed border-connected teal keys/edge cleanup protect crystal colors,
sparkles and intentional shadow; no legacy brown masks or runtime keying.
[Provenance](../Art/provenance/prism-currency-intake.json) records both generations.
`python tools\intake_prism_currency_art.py --apply` regenerates exports/revisions;
regular currency exporter and review tool select active new sources.
Supplied alpha remains authoritative. No economy/save/asset-ID migration.
Validate `python -m unittest discover -s tools -p test_prism_currency_intake.py`.

Validate prompts with `python -m unittest discover -s tools -p test_currency_art_prompts.py`
and UI/compatibility with
`npm test -- src\presentation\ui-copy.test.ts src\presentation\currency-icon.test.ts`.
Inspect replacement output manually before intake.

## Enemy style references and edge containment (D-132)

Owner requests only reference suffixes for all enemies, then explicitly requires
all character/enemy art stay inside the frame without touching its edges.
Added129 exact `--sref URL --sw 400` suffixes: six-form lines1-6; eight-enemy
lineups1/2/2/3/4/5/5/6; ten-enemy lineups1/2/2/3/3/4/4/5/5/6; basic Adventure
enemies1. See [URLs](../Art/guides/midjourney-character-style-prompt.md#character-form-style-references).
Visual lineup mapping does not create creature evolutions or alter gameplay.
Suffixes are already in copy-ready blocks, superseding older placeholder
instructions for enemies. Do not append again.

All226 character/enemy full-body blocks now explicitly forbid edge contact;
109 missing clauses were added while preserving existing margins/designs.
Complete weapons/wings/tails/powers stay inside clear margins, even in Omnic.
No design rewrites, key changes, other parameter changes, materials/icons/
Conduit/weapon/scenery edits or supplied/runtime image replacements.

Validate with `python -m unittest discover -s tools -p test_enemy_style_references.py`
and `python -m unittest discover -s tools -p "test_character_*.py"`.
These check exact129 enemy suffixes,226 explicit edge instructions and retained
character contracts. Actual generated containment/style still needs review;
signed links may expire and require refreshed owner-supplied URLs.

## Character portrait quality (D-131)

Owner requests all thirteen character portrait lines meet Bliss and Rose-banner
quality, then selects evolution portraits only. All78 canonical portraits and
nine late guide examples now use the
[shared construction contract](../Art/guides/midjourney-character-style-prompt.md#portrait-quality-standard-d-131).
Base identities/early silhouettes remain; Epic layers rear powers, Legendary/
Omnic densely fill rear interior gaps with character-specific elemental
architecture. Canonical body scale1/3 ->1/4 ->1/5 shifts emphasis to powers/
armor/regalia without changing compact anatomy. Exact D-129 suffixes, reviewed
per-form keys, functional weapons and authored names/IDs are retained.

Portrait positive prose stays at most380 words, not unrestricted adjective
paragraphs. All six forms repeat each character's identity and renderer/palette.
Old per-character pause/body-scale/gap notes are explicitly superseded.
Icons, standalone weapon blocks, creatures/scenery, supplied assets/runtime
registrations and gameplay remain unchanged. No generation or replacement
art acceptance is claimed.

Validate with:
- `python -m unittest discover -s tools -p "test_character_*.py"` for78
  canonical forms, measured prompt lengths, exact framing/scale targets,
  repeated identity/renderer, per-form keys and97 reference suffixes.
- `python -m unittest discover -s tools -p test_art_prompts.py` for retained
  design/weapon/neutral-wording contracts. Broader unrelated pack contracts
  may require separate maintenance; do not rewrite those packs for this pass.

Review generated Epic/Legendary/Omnic at thumbnail and full size: actual
interior density, greater silhouette/armor/weapon authority, intact human
identity, correct fingers/grips/string and no clipped tips/background spill.
Text tests cannot verify the generator's resulting artwork or acceptance.

## Broken Mechanical Components (D-130)

[Currency prompt](../Art/items/Broken%20Mechanical%20Components.md) follows the
Thornia/Crinso compact anime/cel renderer: shattered Omnic-tier ivory/platinum
wing vanes, halo segments and prismatic opal reactor shards. Face-free cutout,
opaque accents/non-emissive highlights, no glow, solid unlit key through gaps.
Owner-supplied image is installed (D-137): original bytes preserved under
`Art/source/currencies`, reviewed offline teal key/edge cleanup, transparent
256px export with224px content. Dark/light reviews protect ivory machinery and
the colored core. [Provenance](../Art/provenance/component-art-intake.json) records hashes
and processing. Supplied alpha stays authoritative; no runtime keying.
Regenerate with `python tools\intake_component_art.py --apply`.
Validate `python -m unittest discover -s tools -p test_component_art_intake.py`.
Validate `python -m unittest discover -s tools -p test_component_art_prompt.py`.

## Character-form style references (D-129)

The [shared guide](../Art/guides/midjourney-character-style-prompt.md#character-form-style-references)
records all seven owner-supplied URLs. Existing Evo.1-6 use matching references;
starter base/Common uses Evo.1, Stage1-6 examples likewise. Evo.0 is for
explicit future Evo.0/generic templates, not a seventh gameplay form.
All97 character-form/template generation blocks include one trailing
`--sref URL --sw 400`. Older per-pack placeholder instructions are superseded
for portraits only; do not append duplicate flags. Other prompt types,
character designs, background keys and supplied/runtime assets are unchanged.
Use neutral non-explicit wording, not moderation evasion; output and service
acceptance still require review. Signed Discord URLs may expire; obtain an
owner-refreshed link rather than silently substituting.

Validation:
- `python -m unittest discover -s tools -p test_character_style_references.py`
  checks exact URLs/query parameters, evolution mapping,97 suffixes and scope.
- `python -m unittest discover -s tools -p test_art_prompts.py`
  checks existing renderer, wording, background and design contracts.

## Machine expansion art (D-124/D-128)

[Awaken the Machines](../Art/creatures/Awaken%20the%20Machines.md) has28 copy-ready
prompts:5 Rare/silver,5 Legendary/platinum and10 elemental Omnic Conduits,
six black/white-broken-to-angelic mythic machine creatures,3:1 header and16:9
arena. Scenery shows an element-scorched wasteland/giant white machine awakening.
Thornia/Crinso final compact renderer and elegant escalation is the new standard;
no changes to their prompts or existing supplied assets. Rosetta revert withdrawn.
All28 supplied RGB originals are archived byte-for-byte under
`Art/source/machines`:20 Conduits, six enemies, header and arena.
[Intake tool](../tools/intake_machine_art.py) exports256px icons (224px content)
and960px enemy cutouts (864px content). Scenery is copied unchanged.
[Manifest](../Art/provenance/machines-art-intake.json) records source/export hashes, explicit
per-image RGB keys, protected foreground ellipses and six reviewed facing values.
Keys cover enclosed gaps; bounded two-source-pixel edge cleanup removes color
spill. Worldtree's blue-channel constraint protects green foliage; ellipses
protect green eyes/cores and pale opal/cyan crystals. Thunderbird's reviewed
bottom two rows remove a disconnected source frame, not its painted shadow.
Future transparent sources bypass all key/frame cleanup: trim/resize/pad only.
No changes to other supplied alpha packs or runtime background removal.

From the repository root:
- `python tools\intake_machine_art.py` verifies the complete plan/conflicts.
- `python tools\intake_machine_art.py --review <review-directory>` generates
  cutouts and dark review sheets without installing or removing source files.
- `python tools\intake_machine_art.py --apply` installs or verifies/regenerates
  missing exports from archived originals; changed existing bytes are rejected.
- `python tools\intake_machine_art.py --apply --remove-incoming` removes only
  the28 exact mapped root copies after archive/export hash verification.
- `python -m unittest discover -s tools -p "test_machine_art*.py"` verifies all
 28 hashes, regeneration, alpha/padding, foreground preservation, conflict and
  cleanup guards plus prompt contracts.

Content registrations feed all stages/battle cut-ins/Creature gallery, Gameplay
header, Inventory/Conduit Archive/equipment and actual Conduit loot/results.
Export IDs/directories and reference/key/no-glow contracts are in the pack.
Validate wording with `python -m unittest discover -s tools -p test_machine_art_prompts.py`;
inspect actual output separately before registration.

## Neutral character prompt wording (D-104)

Owner requested a wording review across all character prompts to reduce
avoidable moderation ambiguity. Reviewed192 generation blocks in14 character/
starter packs and the shared guide;71 blocks needed neutral replacements.
Torso plates/panels, open hands/palms, geometric bands/tabs and partial-body
framing retain the same non-explicit visual intent. Removed unnecessary
explicit injury words from character-pack negative lists. Titles, asset IDs,
weapons, palettes, armor progression, keys and flags remain unchanged.

The [shared wording contract](../Art/guides/midjourney-character-style-prompt.md#neutral-character-wording-d-104)
and local regression cover positive prose and negative lists, not a claimed
service blacklist or guaranteed acceptance. Inspect any service rejection
and follow its rules; no evasion, altered reference images or generated-output
approval. No runtime/supplied asset changes. This wording-only pass does not
replace the individual design revisions: the current phase gate is listed below.
Validate with both art prompt unittest suites.

## Character-by-character correction (D-101)

**Current Rosetta Omnic density review (D-120):** owner clarifies late
evolutions should have prevalent detailing/energy behind the character and
very busy, chaotic compositions with almost no interior dead space. Applied
only to [Rosetta's Omnic](../Art/characters/Rosetta%20Art.md): overlapping rose mandalas,
branching thorn lattice, radial petal rays, counter-sweeping ribbons and
clustered prism fragments form a dense rear energy tapestry behind body/wings.
This is interior density, not just96% bounding spread or sparse outer sparks.
Keep compact eyes-only anatomy, anime/cel renderer, crimson/gold/chromatic
identity, retained main wing/pose/mantle/bow architecture and2% edge margins.
Narrow key channels plus a clear face/bow window preserve legibility; flat
green fills remaining openings. Opaque effects, no source glow or scenery.
Earlier five forms/icons/final bow/other packs unchanged. Owner identifies
the final three evolutions as the future density emphasis; this pass does
not automatically rewrite Epic/Legendary or other lines.
**Pause for Rosetta Omnic review.** Generated density still needs inspection.

**Current requested batch: Roselius/materials and Crinso (D-118/D-119).**
Owner requests Thornia's escalating style for the creature/material pack, then
explicitly adds Crinso to the same turn. Each pack was revised as its own line;
no automatic change to Rosetta/Thornia or their supplied/generated assets.

**Phase10, D-118:** [Roselius and Rosethorn](../Art/creatures/Passion%20of%20Crimson%20Roses.md)
revises12 cutouts: six fixed female Luminous rose-angel forms/six material icons.
Same ivory core/crimson crest/two eyes, compact anatomy/body1/3/renderer.
First plates -> segmented armor ->6/8/16 late wings, mantle/pauldrons/crown
and increasingly wild but elegant thorn fans/tilted rose-rings/ribbons/arches.
Omnic retains Legendary's main eight wings, airborne open-palm twist, mantle/
collar and three rings, expanding to auxiliary wings/four rings/nine roses.
Weaponless, right-facing; no character/creature terminology change or copy
evolution mechanic. Whole ensemble targets50/60/72/84/94/96% canvas with
25/20/14/8/3/2% margins; all tips/readable eyes/armor inside.
Materials retain distinct Seed/Bud/Bloom/Crest/Heart/Soul forms, face-free
two-thirds-square composition and small-icon readability. Soul expands
Heart's facets/armor/thorns/rings/ribbons with triple-tier petals/crown/extra
ring/open arches; no new drop tier. Header/arena/summoning prompts unchanged.

**Phase11, D-119:** [Crinso's13 blocks](../Art/characters/Crinso%20Art.md) now keep
compact eyes-only anatomy/hair/rose tie and charcoal/crimson/gold/ivory identity.
Plain knight -> segmented armor/mantle/winglets ->4/8/16 late wings with
opposed gold-flame/crimson-lightning petal vanes. Exactly one connected
double-ended two-edged sword retains central grip/two opposed blades/continuous
spine. Rose hub closed ->half-open ->open ->fully blossomed/nested; thorn rails
and weapon span grow1/1.25/1.5/2 body heights from Rare onward. Omnic expands
Legendary's main wings/airborne twisting sweep/mantle/collar/sword foundation.
Counter-sweeping ribbons/tilted rings/off-axis fans/petal shards/interwoven
arches fill the same progressive ensemble targets without touching edges.
Six icons/final weapon match and stay readable.

All25 cutouts keep flat green keys/open channels/no-glow powers, painted
chromatic facets, full silhouettes, headings/IDs and expanded text exclusions;
names remain outside prose. No runtime/capture/drop/sale/cost/banner changes.
**Pause for review of Roselius/materials and Crinso.** All requested rose
character/creature/material prompt lines now revised; output review/intake
remain pending. Percentages describe generation targets, not measured assets.
Earlier phase notes below are historical snapshots.

**Phase9: Thornia / escalating elegant chaos (D-117).** Owner calls Rosetta a
good start and requests future progressions become still wilder, more elegant
and spectacular; apply that knowledge to Thornia next, one character at a time.
[Thornia's13 blocks](../Art/characters/Thornia%20Art.md) now retain compact anatomy,
dark hair/crimson rose clasp/narrow eyes, shadow palette and identical renderer.
Plain knight -> first plates -> segmented thorn armor/mantle/winglets ->
four-wing eclipse guard -> eight-wing thorn court -> sixteen-wing rose empress.
Greatsword grows defined gold thorn spines, nested rose guard and2-body-height
final blade; substantial armor/seams/mantle/crown progress independently of wings.

Off-axis thorn fans, tilted broken eclipse rings, opposing ribbon sweeps,
rose fragments and interwoven open arches create increasingly wild but
deliberately arranged shadow-garden powers, not a featureless tangle or scenery.
Whole ensembles target50/60/72/84/94/96% width/height with25/20/14/8/3/2% margins.
Late structures spread toward all sides/corners without touching edges.
Omnic retains Legendary's airborne sword sweep/raised knee, main eight wing
arrangement, royal mantle/high collar/sword foundation and expands every layer.
Chromatic amethyst/rose-violet/warm opal facets complement charcoal/crimson/gold/
ivory. All keys/opaque no-glow effects/text exclusions/headings/IDs preserved.
Six icons remain readable symbols; final sword/Last Flare match final design.
Rosetta and other character prompt bodies unchanged, no runtime changes.
**Pause for Thornia review; Crinso is the only pending individual art pass.**
Future authored progressions should strengthen spatial/effect choreography and
elegance, not just count wings or change anatomy. Targets require visual review.
Earlier phase notes below are historical snapshots.

**Current Rosetta spread clarification (D-116):** owner emphasizes increasingly
resplendent art across the entire piece without touching edges. All six
complete ensembles now target50/60/72/84/94/96% of width/height with respective
25/20/14/8/3/2% per-side key margins. Late wings/mantle/thorn arches/ribbons
spread toward every side and corner; not a central cluster with sparse outliers.
Compact anatomy/body1/3/eyes-only renderer stay fixed. Chromatic facets,
identity, clear channels/no-glow and retained final architecture preserved.
These are generation targets requiring actual visual review, not measured
assets or painted-pixel percentages. **Pause for Rosetta review.**
D-115's earlier coverage numbers below are historical, superseded by D-116.

**Current Rosetta review (D-115):** owner requests more chromatic/resplendent
Legendary/Omnic and almost full-screen effects. Keep D-114's compact anatomy
and body one third of canvas. Complete wing/bow/effect ensemble spans90% of
width/height at Legendary,94% at Omnic, with5%/3% key margins and open channels;
never crop tips or obscure eyes/bow. Rose-violet/sapphire-blue/warm opal facets
enrich armor/wings/bow/rings while crimson/gold/ivory remain primary. Same
anime/cel renderer and opaque no-glow effects. Last Flare/final bow share
chromatic accents; other icons/early portraits and other characters unchanged.
**Pause for Rosetta review.** Coverage percentages are generation targets
requiring output inspection, not measured existing images.

**Current Phase8 restoration (D-114):** owner withdrew the less-chibi late
anatomy direction and requests compact Bliss/Bruno style with amplified
effects/splendor. [Rosetta](../Art/characters/Rosetta%20Art.md) now retains rounded head,
tiny torso/short limbs/2.5-3 heads and body one third of canvas across all forms.
Renderer/identity/eyes-only face stay fixed. Armor, mantle, ornate bow,4/8/16
wings and elemental architecture carry epicness around the same body.
Rare fragments grow into sweeping petal ribbons, gold thorn fans/open arches,
three orbital rings and nine rose marks at Omnic. Legendary's airborne draw,
main wings/mantle/collar and bow foundations remain expanded, not reset.
Icons/final bow unchanged. Six-star identities/1.1% banner/pity remain.
**Pause for Rosetta review; Thornia/Crinso pending under this compact rule.**
The D-113 anatomy notes below are superseded history, not current guidance.

**Phase8: Rosetta / six-star Roses (D-113).** Owner promotes all three Roses
EBs to6-star and selects the existing combined1.1% character rate split
equally; all three enter200/500 highest-star pity. Runtime pool/UI/metadata
updated without changing Standard, costs, kits, progression or saved counters.

Owner explicitly allows less-chibi late proportions and giant angel presence,
while insisting on eyes-only faces and the same anime/cel renderer.
This is a rose-EB-only exception to fixed compact anatomy, not realism or
monstrous bodies. Revise one at a time: [Rosetta's13 blocks](../Art/characters/Rosetta%20Art.md)
now progress2.5-3 ->3 ->3.5 ->4 ->4.5 ->5 heads tall, one-third ->two-fifths ->
half-canvas body framing. Identity/palette/renderer fixed. Plain archer grows
segmented crimson/gold rose armor, layered canopy pauldrons, divided mantle,
4/8/16 wings and celestial sun-rings. Action is an airborne twisting draw with
raised knee in late forms. Omnic retains Legendary's main eight wings'
arrangement (four pairs), draw/mantle/collar/bow foundations, expanding them
with auxiliary wings, crown/diadem, waterfall pennants and triple-arched
nested-lens bow. Cosmic regalia, not scenery/glow. Names outside prose,
green keys/text exclusions/padding and all headings/IDs preserved.
**Pause for Rosetta review; Thornia/Crinso art passes remain pending.**
Their metadata changes to6-star now; their copy bodies are untouched this phase.

**Phase7: Razor (D-112).** Owner requested the same stylized additions next.
Revised [Razor's13 prompts](../Art/characters/Razor%20Art.md): fixed compact anatomy,
silver forelock/violet eyes/black scarf, ink-black/graphite/violet/silver identity
and identical renderer. Plain tunic/night sword -> first plates -> segmented
bastion armor/mantle/winglets -> high collar/broken corona -> six-wing eclipse
bastion -> expanded twelve-wing night fortress. Tower pauldrons, substantial
gauntlets/greaves, fracture seams, divided mantle and crescent shield vanes
carry tank identity and Wraththorn-like impact without changing anatomy.

One opaque pure-night sword throughout. Legendary/Omnic retain braced elevated
guard, royal mantle, main three wing pairs, double crescent guard/three hilt
clasps and abstract eclipse ramparts. Omnic broadens armor/vanes, adds six
auxiliary wings/crown/double coronas and five blade ridges versus three;
blade span1.5 ->2 body heights. Last Flare/final weapon share final sword
construction; Defense remains a symbol, not new equipment. Headings/IDs and
all13 green keys/no-glow/padding/text exclusions preserved; names outside
copy prose. No other character prompt bodies changed. Dedicated tests cover
continuity/word bounds, armor/sword progression,2/6/12 wings and retained final
architecture. **Pause for Razor review.** Only Rosetta/Thornia/Crinso await this
individual pass. Earlier phase notes below are historical snapshots.

**Phase6: Elise (D-111).** Owner requested the same stylized additions next.
Revised [Elise's13 prompts](../Art/characters/Elise%20Art.md) with fixed compact anatomy,
black hair/side lock, lime eyes, mint wrist ribbons and charcoal identity.
Plain covered wrap outfit/stars -> first plates -> segmented armor/substantial
gauntlets/divided mantle -> high lightning collar/broken corona -> six-wing
circuit court -> expanded eight-wing thunderwheel court. Silver fracture seams,
charcoal joints, stepped shoulders, branching lightning vanes and mantle volume
translate Wraththorn impact without changing species, anatomy or renderer.

Exactly two four-point shuriken, one in each hand, retain functional central
openings. Legendary/Omnic share hover/throwing pivot, royal mantle, three main
wing pairs and separate circuit collars. Omnic adds wider vanes/regalia, crown,
double coronas and three-tier silver star arms, each star1.5 body heights
versus Legendary's1. Abstract no-injury electricity, no extra weapons/people.
Six icons remain readable symbols; final weapon/Last Flare match final stars.
All13 orange keys/no-glow/padding/text exclusions, headings/labels/IDs preserved.
No other character prompt bodies changed. Tests cover identity/renderer/
word bounds, armor/star engineering,2/6/8 wings, retained final architecture
and weapon/icon consistency. **Pause for Elise review.**
Razor and three event EBs await individual correction. Earlier notes are snapshots.

**Phase5: Disciple (D-110).** Owner requested the same stylized additions as
Bliss/Bruno. Revised [Disciple's13 prompts](../Art/characters/Disciple%20Art.md) with fixed
compact anatomy/identity/palette/renderer in every form. Plain tunic/flame grows
into segmented black-amethyst armor, charcoal joints/silver fracture seams,
substantial lattice shoulders/gauntlets, divided mantle, high collar, broken
coronas and skeletal psychic-flame wings. Omnic retains Legendary's six main
wings in three pairs, hover/open-palm pose, mantle and casting frames, adding
broader branching regalia, six auxiliary wings, seven-point crown, nested
three-tier frames and double coronas. Frames grow from body-height at Legendary
to1.5 body heights at Omnic, not a change in body/world scale.

Chaotic6-star male ally-buff identity stays empty-handed: linked upward flame
crests, no weapons/extra allies/enemy-binding imagery. All13 blue keys/no-glow/
padding/text exclusions remain; headings/icon labels/asset IDs preserved outside
copy prose. Six symbols and final standalone focus match the lattice/formation
identity. Other character prompt bodies unchanged. Tests verify anatomy,
renderer/keys/word bounds, armor/construct progression,2/6/12 wings, retained
final architecture and focus consistency. **Pause for Disciple review.**
Two flagships (Elise/Razor) and three event EBs await individual correction.
Earlier phase notes below are historical snapshots.

**Current Bruno rollback (D-109):** owner rejected Bruno's D-107/D-108 results,
likes Bliss and explicitly confirmed restoring compact Bliss-style anatomy.
Bruno's six portraits now retain rounded head/tiny torso/short limbs/2.5-3 heads,
hair/eyes/sash and body one third of canvas throughout. Progression changes
armor contour, hammer engineering, mantle, wing arrays and crown, not bodies,
world scale or late-body framing.13 blocks/IDs/labels/palette/keys/no-glow remain.
Icons/final weapon retained; Bliss and all other character prompt bodies unchanged.
Shared current anatomy guidance restored; D-107/D-108 below are superseded
historical experiments, not active permission. Tests require fixed anatomy plus
retained equipment/regalia progression. **Pause for Bruno review.**

**Current Bruno review clarification (D-108):** owner does not want monstrosities;
late forms should be majestic armored angels or armored gods of their element.
Refined Bruno Rare/Epic/Legendary/Omnic to sacred articulated mineral armor,
serene recognizable face, swept hair/diadem and balanced humanoid divine contour.
Removed geological-body replacement, pillar legs, rock fists and mountain torso.
Huge stature, ornate armor/mineral wings, crown, single citadel hammer and
retained final architecture remain. Same renderer, palette, keys, IDs, framing
and no-glow policy. Icons/weapon and other character packs unchanged this turn.
Tests now enforce dignified divine armor rather than monstrous mutation.
**Pause for Bruno review.** D-107 below is a superseded first-pass snapshot.

**Phase4: Bruno, elemental apotheosis (D-107).** Owner now explicitly permits
characters to lose human anatomy and become monstrous/godlike embodiments of
their element at massive implied scale, starting with Bruno only. This
supersedes prior universal fixed-human-body rules, not the shared anime/cel/
painted renderer. [Bruno's13 prompts](../Art/characters/Bruno%20Art.md) now progress human
quarry sentinel -> first forged armor -> mineral forearms/legs -> living-bedrock
avatar -> mountain titan -> worldwall deity. Hair becomes a swept umber mineral
crest; amber eyes/ochre sash-to-banner/basalt squares/bronze ribs/single
double-faced hammer retain identity. Late body is geology, not a human in armor.

Legendary/Omnic share colossal terraced torso, bastion fists/pillar legs, crown
segments, three principal mineral array pairs and wide hammer guard. Omnic
expands mountain strata, suspended keystone, crown spires/orbits and citadel
hammer, with two auxiliary arrays. Human beginner2.5-3-head anatomy remains
early only; Rare complete silhouette spans half, Epic+ complete subject/
equipment two thirds of4:3 while fully padded. Terrain-scale mass is implied
by body/weapon architecture, not scenery or scale-reference people.
No combat size/stats/camera changes. Five-star Tank/future Standard status,
six forms, names/IDs, magenta keys/no-glow/text exclusions remain.

All13 copy blocks revised including name-free abstract icons and matching final
hammer. Tests separately require shared renderer/identity and intentional
human-to-mineral body/scale changes; never assert late tiny human torsos.
Non-explicit stone transformation; no guaranteed moderation acceptance or
generated-output approval. **Pause for Bruno review.** Other character prompt
bodies, including Bliss, remain unchanged. Three other flagships
(Elise/Razor/Disciple) and three event EBs await individual correction.
Prior phase notes below are historical snapshots.

**Phase3 review revision: Bliss (D-106)** follows the owner's supplied
Wraththorn base/final images and explicit request to revise Bliss only.
The modest previous adjustment was not enough: use dramatic silhouette/armor
mass and colossal equipment, not copied purple, slime anatomy, tall realistic
proportions, glow or extra figures. Rare now has stepped shoulders, substantial
gauntlets and layered hip tassets; Epic adds a high feather collar, broad
pauldrons and flared feather mantle. Legendary/Omnic retain a swept armored
shoulder canopy, oversized gauntlets/heavy greaves and fan/hover stance.
Each opened fan's span progresses from body-height at Rare/Epic to1.5 body
heights at Legendary and2 at Omnic. Final three-tier fans, waterfall mantle,
expanded principal feather arrays and crown dominate around the fixed tiny body.

Only Bliss's four later portraits, Last Flare symbol and standalone final fan
changed in this review. Base/Uncommon, other five icons and every other character
pack are unchanged.13 blocks, identities/IDs/keys/no-glow/text exclusions and
fixed renderer retained. New checks require equipment scale and armor mass in
addition to retained wings, identity and word bounds. Visual acceptance compares
base/final at equal body height, including imagining the wings removed:
armor/mantle/fans must still transform the silhouette. Actual generation is
pending. **Pause for Bliss review.** D-105 below is the first-pass snapshot.

**Phase3 first pass: Bliss (D-105)** follows the owner's acceptance of Aurora and request
to move to Bliss with a slight stronger Wraththorn influence, not a renderer
overhaul. [Bliss's13 prompts](../Art/characters/Bliss%20Art.md) repeat fixed identity/anatomy/
palette/rendering clauses. Plain covered tunic/fans grow into segmented feather
plates with pale-blue joints/pearl fracture seams, split mantle, orbit fragments,
broken corona and open-ribbed feather wings. Omnic preserves Legendary's three
main wing pairs, hover/fan stance and royal mantle; broader branching vanes,
denser armor, three-tier fans, six auxiliary wings, crown and double coronas
amplify those features. Her ivory/rose feather-and-warfan identity stays distinct.

All13 blocks keep solid green key/no-glow/padding and expanded text exclusions,
with names outside image prose. Fully covered designs and abstract motion marks
in empty space avoid explicit injury/bound-figure imagery; words alone cannot
guarantee service acceptance. Six icon labels and13 asset IDs stay unchanged;
final standalone fan matches final portrait equipment. No supplied art/runtime
changes. Tests check fixed renderer,2/6/12 wings, retained final structures,
fans/keys/length and conservative wording. **Pause for Bliss review.**
Atmoso and Aurora directions are accepted; four remaining flagships
(Bruno/Elise/Razor/Disciple) and three event EBs still await individual revision.
The Phase1/2 notes below are historical snapshots, not current stop targets.

**Phase2: Aurora** follows the owner's acceptance of the Atmoso direction and
explicit request to move to her next. [Aurora's13 prompts](../Art/characters/Aurora%20Art.md)
now use identical portrait identity/anatomy/renderer/palette clauses, a plain
starter base and segmented ivory lens armor with obsidian eclipse seams,
divided mantle, pearl fragments and severe solar-lens prism wings.
Omnic retains Legendary's six main wings, angled hover/open palms, royal mantle
and gold crescent lens collars; it broadens main blades and regalia, then adds
six auxiliary wings, a two-layer crown, three-wheel verdict lenses and double
fractured coronas. Her6-star finale grows architecture, never adult anatomy.
Bare-hand Luminous casting and enemy-restraint imagery remain distinct from
Atmoso's staff, slime anatomy/weapons and Rosetta's crimson/gold rose bow.

All13 blocks explicitly use the solid contrasting magenta key, no proper
names/rarity labels in image prose and expanded lettering exclusions. Six icons
remain single small-readable symbols; standalone Verdict Lens matches one final
casting construct, never equipment. Tests check renderer continuity, weaponless
open palms,2/6/12 wings, retained Legendary architecture and matching focus.
No generated output, runtime content or supplied assets changed.
**Pause for Aurora review before another character.** Five other flagships and
Rosetta/Thornia/Crinso remain pending correction. Atmoso's direction was accepted;
that permission is not proof that every generated image passed visual review.

**Atmoso review follow-up:** owner found Omnic weaker and renderer drift between
forms, then narrowed this turn to Atmoso again. All six portraits now share an
identical staff-wielder identity/anatomy clause and palette/renderer clause.
Rare onward repeats dark navy joints, pearl fracture seams and segmented vane
reliefs; Epic introduces skeletal swept gale wings and a six-piece broken corona.
Legendary forms the severe six-wing regalia foundation. Omnic retains its
hovering pose, three principal wing pairs, divided mantle and crescent staff
collar, then broadens the blades with branching spines, densifies regalia,
adds two auxiliary wings, tall crown, nested staff wheel and double fractured
coronas/storm pearl. This translates Wraththorn's threat architecture into
Atmoso's cool wind identity, not slime anatomy/abyss palette/cleaver.
Final standalone staff matches the retained collar. Six icons remain unchanged.
Tests require retained Legendary motifs plus added final structures, not a
larger wing count alone. Actual generation and owner acceptance still pending.

Owner rejected style drift and weak visual differentiation in newer character
prompts, including Atmoso and event characters, and reported noncontrasting
backgrounds/unwanted text in generated output. The owner selected **Atmoso
first, then pause for review**. Do not bulk-rewrite the remaining nine lines
or treat D-099/D-100's previous prompt checks as output approval.

**Phase1 prompt revision:** [Atmoso](../Art/characters/Atmoso%20Art.md),13 blocks: six
portraits, six symbols and one matching final staff. Compare beginner anatomy/
renderer against supplied Infernis/Tizu/Flora; build threatening regalia using
Wraththorn/Dawnthorn's armor/mantle/wing/crown/orbit progression, not their
species/palette. Each form now has different staff construction, armor coverage
and pose: simple crook -> forged twin vanes -> mantle/arch/winglets -> hovering
two-wing turbine -> six-wing diadem -> eight-wing crowned nested skywheel.
Keep the small body and the same contour/cel/painted rendering throughout.

Only visual descriptions enter image prompts; titles, proper names, rarity
labels and asset IDs remain outside copy blocks. All13 blocks explicitly include
the same contrasting orange key, open-gap/padding requirements and exclusions
for text/lettering/captions/signatures. Ornate details are physical curved reliefs,
not inscriptions or pseudo-runes. Portraits include their exact mapped
`--sref` at400; icons and weapons use no `--sref` or `--sw` (D-147).

Run `python -m unittest discover -s tools -p test_art_prompts.py`.
Atmoso-specific checks cover exact shared renderer, bounded prompt length,
solid key placement, name-free image prose, text exclusions, stage-specific
construction and final staff consistency. These check wording, not outputs.
Generate/compare the beginner first, then a six-form sheet at equal body scale;
reject anatomy drift, text, nonflat key, hidden feet/eyes, incomplete staff or
same-looking late silhouettes. **Owner review is the gate before another
character's correction.** Current phase status above supersedes this Phase1
snapshot; runtime/art registrations are unchanged.

## Crimson Roses packs (D-100)

[Event specification](crimson-roses.md) owns playable rules and pending-art
registration. [Rosetta](../Art/characters/Rosetta%20Art.md),
[Thornia](../Art/characters/Thornia%20Art.md) and [Crinso](../Art/characters/Crinso%20Art.md) each have
six evolving portraits, six action/ability icons and one final weapon prompt.
[Passion of Crimson Roses](../Art/creatures/Passion%20of%20Crimson%20Roses.md) supplies six
female Roselius angel forms, six Rosethorn material icons,3:1 activity header,
16:9 arena and16:9 Omnic Roses Under Sunny Skies summoning scenery (54 total).
Identity palette is crimson/gold/pearlescent roses/thorns, not a new renderer.
Simple bases grow into full-body prismatic armor, wings, elaborate rose/thorn
structures and ornate weapons; Rosetta's6-star finale escalates further.
Crinso uses one dual-edged sword. Source cutouts remain opaque/non-emissive,
eyes-only and fully padded. Scenery is exempt from no-glow restrictions.

No images have been generated or intaken. Runtime characters show a neutral
labeled SVG; icons remain text-only and event creature/material/scenery art
stays pending. Register actual exports and reviewed facing during intake, never
invent PNG paths or substitute Sanctuary wisp/Heaven slime portraits.
Run `python -m unittest discover -s tools -p test_rose_art_prompts.py` alongside
the existing art suite. Prompt checks cannot replace manual output review.

## Seven flagship Element-Bearers (D-094)

### Full-body prism and elemental-wing escalation (D-099)

Owner requested stronger actual evolution prompts, not merely epic adjectives
or contract prose. All42 flagship portraits now explicitly progress from simple
starter clothing to forged equipment, complete armor/winglets, then full-body
prismatic suits with large layered elemental prism wings and swirling powers.
All7 final standalone equipment/focus prompts match the ornate final portraits.
The42 ability icons remain unchanged: readable shared-form symbols, not portraits.

Common6-star forms are still as simply equipped as Infernis/Tizu/Flora; their
finales, not their beginner gear, receive the wider/more layered escalation.
Epic starts with one pair of prism wings; Legendary has six; Omnic has eight
for5-star or twelve for6-star lines. Wing counts are generation direction, not
mechanics or required runtime bones. Each element has distinct wing geometry
and palette: mountain, lightning, solar lens, wind, crescent night, feather/fan
and psychic flame. Preserve character identities, genders and signature weapons.
Aurora/Disciple retain empty hands and ornate energy constructs instead of weapons.

Match late Dawnthorn/Wraththorn impact with the starter renderer. Radiant-looking
armor means saturated prism facets and non-emissive painted highlights under
the existing no-glow cutout contract. Do not alter supplied/runtime art, copy
slime anatomy/palettes or introduce realistic/full-frame splash framing.

Validate actual prompt bodies for every stage's armor coverage, wing geometry,
wing-count escalation, swirling powers, final equipment and padding; run
`python -m unittest discover -s tools -p test_art_prompts.py`.
Generated images still require manual side-by-side review at every evolution:
simple base, clearly escalating silhouette, unobstructed eyes/feet/weapons,
complete wing tips and no merged/cropped effects. No images were generated here.

[Flagship manifest](../Art/characters/Flagship%20Characters.md) links seven individual
copy-ready packs: Bruno/Tectonic hammer Tank, Elise/Voltaic shuriken DPS,
Aurora/Luminous light-energy enemy-debuff Support, Atmoso/Atmospheric wind-staff
DPS, Razor/Ominous pure-night sword Tank, Bliss/Tranquilitic feather/warfan DPS
and Disciple/Chaotic psychic-energy ally-buff Support.

Each pack contains six4:3 forms (base plus five evolutions), six1:1 icons
(Passive/Skill1/Skill2/Last Flare/Normal/Defense) and one3:2 weapon/focus cutout.
All seven finish in fully prismatic armor while preserving unique element
palettes/identity and the shared compact chibi renderer. The four6-star lines
have more elaborate final architectural silhouettes, not realistic anatomy.
Owner reaffirmed that these must match Infernis/Tizu's exact style guidelines:
only armor/weapon/elemental-structure complexity grows more extravagant with
rarity. All seven packs now include this explicit renderer lock.
Follow the existing no-glow/solid-key contract, portrait-only sref at400, open gaps
and generous silhouette padding. Review subject/key overlap especially in
late prismatic forms; alter the key swatch rather than the artwork.

Bruno/Elise/Atmoso are owner-approved future5-star Standard characters.
Aurora/Razor/Bliss/Disciple are6-star with banner assignment unspecified.
The original D-094 prompt pass did not add gameplay. D-121/D-122 subsequently
integrates supplied images and playable definitions in the
[flagship contract](flagship-characters.md). Numerical kits remain first-pass
developer tuning; role/element/weapon/gender/stars and Standard assignment are
owner-confirmed. Energy-focus concepts are not new caster equipment.

Future replacement intake must preserve originals and supplied alpha; register
assets only after visual approval. Run
`python -m unittest discover -s tools -p test_art_prompts.py`; tests cover the91
new prompts and existing packs but cannot validate generated image quality.

## Summoning banner artpieces

Summoning uses16:9 opaque full-bleed Omnic-tier artpieces that embody each real
banner's identity. Do not reuse3:1 dungeon headers or individual reward portraits.
The Standard prompt/intake path is in [Summoning Banners](../Art/ui/Summoning%20Banners.md).
The supplied Standard banner is now registered at
`public/assets/banners/summon-standard.png`. Drop-rate tables remain text-only:
name, awarded rarity/star value and exact rate; Omnic art is not an acquisition
promise. Follow this distinction for future banner and loot disclosures.

## Rosethorn Sanctuary

Phase10's [Sanctuary pack](../Art/creatures/Rosethorn%20Sanctuary.md) contains six
Tranquilitic Rosethorn Wisp cutouts,3:1 activity header and16:9 arena.
Keep limbless flame-shaped anatomy, ivory/rose/antique-gold identity, eyes-only
faces and opaque non-emissive flame ribbons. Common is restrained; Omnic
unfolds divine thorn-cathedral regalia/prismatic rose orbit rings.
The six supplied portraits, header and arena are registered; hostile and owned
copies share the same cutout files.
Standard's Omnic artpiece includes Sanctuary rosefire architecture, not another
banner, promised six-star EB or a portrait grid.

## Crownfall Treasury

Phase9's [Treasury pack](../Art/creatures/Crownfall%20Treasury.md) contains six progressively
regal Luminous slime cutouts (shared hostile/captured portraits), a3:1 activity
header and16:9 arena. The six supplied portraits, header and arena are registered;
hostile and owned copies share the same cutout files.
The Standard16:9 artpiece prompt now includes Treasury crown/amber architecture;
this is not another summon banner or a6-star EB promise. Preserve originals,
review keying/padding and register only approved exported images.

## Dungeon rarity direction

All ten elemental dungeon packs are now supplied and integrated.
The original escalation pass remains a guide for future artwork:
early designs remain restrained; later creatures and relics
gain species-specific formidable armor, deployed elemental structures and
majestic/prismatic final silhouettes, not cute wording or realistic anatomy.
See [pack direction and generation rules](../Art/creatures/dungeons/README.md#pending-art-rarity-escalation-pass).
Enemy lineup positions express art power, not assigned rarity or evolution;
material rarity labels remain authoritative. Existing palettes/key colors,
compact renderer, cutout padding/no-glow rules and scenery layouts are preserved.
Runtime encounters, drops and already supplied packs are unchanged.

## Lustrous River intake (D-085)

All16 owner-supplied root PNGs were moved without modification into
`Art/source/enemies`, `materials`, `banners` and `backgrounds`.
[Intake manifest](../Art/provenance/lustrous-river-intake.json) records source/runtime hashes
and per-image reviewed key hues plus normalized enclosed-background seeds.
Banner and arena exports preserve source bytes exactly. Eight enemy cutouts
export960px RGBA with864px content; six materials export256px RGBA with224px
content. Source colors vary across green/teal and yellow-green, so no global
white-matte operation or runtime keying is used.

`prepare_dungeons.py` removes only border-connected reviewed colors plus
explicitly reviewed holes in ribbons, limbs, filigree and rings. Matching
crystal/lantern facets, ivory armor/wings, opaque powers and painted shadows
are retained. Lanterncap's brighter cyan powers use a reviewed source-value
foreground mask so the overlapping teal background key does not erase them.
`review_art.py` recognizes this pack for future dark previews.
Regenerate only this pack with
`python tools\prepare_dungeons.py --elements luminous`; first intake additionally
used `--move-sources`. The exporter writes its own provenance manifest.

Review all14 dark cutouts and battle orientations. Guardian/Griffin/Oracle/Kirin
are authored left and mirror right; Glimmerkin/Brownie/Tortoise/Sovereign remain
right by gaze/weapon stance. `unit-facing.ts` supplies both field and cut-in
image transforms; never mirror the panels or alter originals.
Run `python -m unittest discover -s tools -p test_lustrous_art.py` for source
hashes, deterministic exports, transparent margins/reviewed holes and preserved
pale/gem pixels. TypeScript dungeon/facing tests cover all35 stages and eight
stable creature discovery entries. No captures or economy changes.

## Precipice of the Earth intake (D-086)

Moved16 owner-supplied root PNGs unchanged into `Art/source` by category.
The misspelled incoming `Flntback Armadiillo.png` is preserved verbatim;
runtime `flintback-armadillo.png` uses the canonical enemy name.
[Provenance](../Art/provenance/precipice-earth-intake.json) records source/runtime hashes,
per-source key settings, normalized enclosed-hole seeds and crystal masks.
Eight enemies export960px RGBA/864px content; six materials256px/224px.
Banner/arena copies preserve original bytes. Regenerate only this pack with
`python tools\prepare_dungeons.py --elements tectonic`; first intake additionally
used `--move-sources`.

Different cyan/blue/green backgrounds require reviewed per-image hues,
tolerances and value gates, not global white removal. Border/seed cleanup
clears genuine gaps between limbs, horns and rings. Atlas's cyan crown and
Soul's summit facets use tight source-coordinate polygons, not broad rectangles.
Gargoyle's bright-background value gate preserves darker mineral wings.
Bloom's wider hue tolerance removes its cyan gradient without erasing green
crystals. Preserve painted shadows, crystal highlights and unique subject colors.
`review_art.py` recognizes this pack.

Directional Pebblekin/Armadillo/Ram/Cyclops/Gargoyle mirror right in battle;
Kobold is already right, Atlas/Behemoth genuinely frontal and unchanged.
Field and cut-ins share image-only facing metadata.
Run `python -m unittest discover -s tools -p test_precipice_art.py` for hashes,
deterministic exports, transparent reviewed holes, protected subject pixels and
background points around protected crowns. Dungeon/facing tests cover all35
stages/eight stable creature IDs. No captures, spending or reward changes.

## Ruins of Chaos intake (D-087)

Moved all16 supplied root PNGs unchanged into `Art/source` by category.
[Intake manifest](../Art/provenance/ruins-chaos-intake.json) records source/runtime hashes
and individually reviewed key settings/enclosed-background seeds.
Eight enemy cutouts export960px RGBA/864px content; six materials256px/224px.
The banner/arena exports preserve original scenery bytes exactly.
Regenerate with `python tools\prepare_dungeons.py --elements chaotic`;
first intake additionally used `--move-sources`.
`review_art.py` recognizes all14 cutouts.

Actual backgrounds range from yellow-green to green/teal, so cleanup uses
per-source border keys and reviewed seeds in hat/staff openings, limb gaps,
horn arches, frame filigree and material rings. Cyan crystal facets, ivory
highlights, opaque effects and painted shadows remain artwork, not holes.
In particular, Gremlin's cyan hand effect and Drake's teal ring power are
intentional; do not remove them as if they were the flat background.
No source edits, global white removal or runtime keying.

Riftpip is authored right. Gremlin/Scarab/Sentinel/Drake/Chimera mirror right
when hostile. Behemoth/Sovereign are genuinely front-facing and unchanged.
Allies target left and enemies right through shared image-only
`unit-facing.ts` attributes in both field and skill cut-ins. Entrance, attack/
return and death presentation animate wrappers, never overwrite image facing
or mirror panels/text. Front-facing artwork cannot acquire a side gaze through
mirroring.

Run `python -m unittest discover -s tools -p test_chaos_art.py` for all16
hash/provenance records, deterministic exports, transparent reviewed holes,
preserved pale pixels and selected matching-hue prisms.
Dungeon/facing/cut-in tests cover all35 stages, eight stable discovery IDs,
all supplied portrait metadata and both attack-wrapper directions.
Runtime order/names, Rift Strike, stages, stats, loot/discovery and capture
eligibility are unchanged.

## Sky-bound Rift intake (D-088)

Moved16 supplied root PNGs unchanged into `Art/source` by category.
The incoming capitalization `Sky-bound RIft Arena.png` remains in source;
runtime banner/arena use canonical `sky-bound-rift.png`.
[Provenance](../Art/provenance/sky-bound-rift-intake.json) records hashes, key settings,
reviewed enclosed-hole seeds, source-coordinate foreground polygons and the
scoped lower-shadow key. Eight enemies export960px RGBA/864px content;
six materials256px/224px. Scenery copies preserve original bytes.
Regenerate with `python tools\prepare_dungeons.py --elements atmospheric`;
first intake additionally used `--move-sources`.
`review_art.py` recognizes every cutout.

Most images use individually reviewed pink/magenta backgrounds; Seed and
Drake instead use cyan. Remove reviewed border colors plus explicit holes in
cloud curls, horns, limbs, hats/staffs, rings, wings and filigree.
Seed's variable cyan gradient overlaps feather/ribbon colors, so tight
foreground polygons protect the curled feather, gem and separate ribbon arms.
Brightness/channel protection retains pale subject pixels without retaining
the bright cyan background; the enclosed ribbon loop has its own clear seed.
Drake uses a bright-background value gate and pale/cyan highlight protection
to retain its darker feather shading and solid wind arcs.
Floating material cast-background remnants are keyed separately where needed:
Soul's extra purple lower shadow key is restricted below91% source height and
unions transparency with the first pass. It never restores an opaque rectangle
or removes the upper violet ring. Preserve genuine painted enemy ground shadows.
No source edits, global white removal or runtime keying.

Puffling/Harpy/Ibex/Drake/Griffin/Regent are authored left and mirror right
when hostile. Sylph is authored right; genuinely frontal Roc stays unchanged.
Shared image-only facing is used by field and skill cut-ins throughout attacks
and returns; never flip panels/text or rewrite artwork. Allies still target left.
Registering the pack changes no enemy order/names,35-stage mechanics,
Gale Strike, stats, schedules, rewards, discovery IDs or capture eligibility.

Run `python -m unittest discover -s tools -p test_sky_art.py` for all16
provenance/deterministic exports, transparent margins, every reviewed seed,
pale pixel preservation and exact matching-cyan foreground/clear-gradient
points. Dungeon/facing tests cover all35 stages/eight stable discovery IDs;
shared cut-in regressions cover every supplied portrait.

## Valley of Solitude intake (D-089)

Moved all16 supplied root PNGs unchanged into `Art/source` by category.
[Provenance](../Art/provenance/valley-solitude-intake.json) records source/runtime hashes,
per-image key settings and normalized reviewed enclosed-background seeds.
Eight enemies export960px RGBA/864px content; six materials256px/224px.
Banner/arena runtime copies preserve original bytes.
Regenerate with `python tools\prepare_dungeons.py --elements ominous`;
first intake additionally used `--move-sources`.
`review_art.py` recognizes every cutout.

Different green/teal/yellow-green sources use individual hue keys with
border-connected removal and reviewed enclosed holes in limbs, hat curls,
staffs, antlers, wings, chains, ribbons, rings and filigree. Bloom/Heart have
low-saturation pale green backgrounds, requiring lower per-source saturation
thresholds and reviewed ring seeds, not global white removal. Retain Heart's
matching turquoise gem facets, Seed's teal chain/casing highlights, pale
horns/armor, purple powers, opaque ribbons and painted ground shadows.
No source edits, runtime keying or changes to supplied-alpha handling.

Duskmote/Cat are authored right. Imp/Sentinel/Gargoyle/Regent are authored left
and mirror right when hostile. Genuine frontal Weaver/Monarch stay unchanged.
Shared `unit-facing.ts` image-only metadata covers field and cut-ins; wrapper
animations preserve image facing through windup/return. Panels/text never flip;
allies still target left.
The registry wires all existing encounter/menu/material/discovery surfaces.
Names/order, Umbral Strike,35 stages, stats/schedules, loot/RNG, stable discovery
IDs and capture eligibility remain unchanged.

Run `python -m unittest discover -s tools -p test_valley_art.py` for all16
provenance/deterministic records, transparent margins, every reviewed gap,
pale pixel preservation and retained matching-hue gem/casing/armor points.
`test_root_art_intake.py` now passes: no incoming PNGs remain in root.
Dungeon/facing tests cover all35 stages/eight stable creature IDs. Future
pending-art fallbacks remain regression-tested using temporarily unavailable
registrations/mocked material art, not a missing real asset.

## Game-wide rarity art direction

Common-to-Omnic progression keeps the same established rendering style while
becoming progressively less cutesy and more epic, formidable, majestic and
awe-inspiring. This is a game-wide rule, not exclusive to Conduits. Higher-rarity
prompts should emphasize commanding designs and fully realized elemental
identity rather than adorable/babyish language. Keep compact proportions,
species identity, clean contours, cel shading and cutout requirements unchanged.

Use the [shared rarity tone ladder](../Art/guides/midjourney-character-style-prompt.md#game-wide-rarity-tone-common-to-omnic)
for new or revised prompts. Rarity and stars remain separate: a 5-star Common
starter is still visually a restrained base form. This direction does not
repaint delivered assets or change gameplay rarity/progression rules.

## Existing source of truth

### Phased roster/event delivery (D-121)

The owner supplied135 named RGB PNGs in the root and approved playable
implementation of all seven previously art-only flagships. Work proceeds in
verified sections; [handoff](handoff.md#current-task-phased-supplied-rosterevent-art-intake-d-121)
owns phase status. D-122 confirms all seven join Standard at their authored
star tiers: three new five-stars within1% total, four six-stars within0.1%
total, equally within each tier. Roses is unchanged. All seven are now playable;
see [flagship integration](flagship-characters.md).

Phase1 installs51 Roses assets through
[intake_roster_art.py](../tools/intake_roster_art.py) and records
[provenance](../Art/provenance/roses-art-intake.json). Source filenames `Gilded Rose,
Rosetta`/`Burdened by Thorns, Thornia` map to their existing base IDs; the
misspelled `Crisno` action files map to canonical `crinso` IDs without changing
saved IDs or authored display titles. All18 supplied action icons are wired,
including Defense. Creature/material/header/arena/summon art use the same
shared resolvers as all other packs.

```powershell
python tools\intake_roster_art.py --phase roses
python tools\intake_roster_art.py --phase roses --apply
python -m unittest discover -s tools -p test_roster_art_intake.py
# Only after dark/light visual review and integration validation:
python tools\intake_roster_art.py --phase roses --apply --remove-incoming
```

Originals are preserved under `Art/source/roster-intake/roses`; all archived
and runtime bytes are checked before targeted removal of root copies. The
tool refuses conflicts, supports regeneration after removal, and never
deletes broad directories. RGB deliveries need reviewed offline keying:
Roses backgrounds are muted green/teal, not literal pure green. Individual
recorded hue keys clear enclosed openings; only border-connected white
frames are removed. Omnic Roselius additionally uses a source-coordinate
warm-backdrop polygon. Do not reuse these settings for other packs.
Any transparent RGBA source bypasses all removal and uses trim/resize/pad
only. Existing owner-alpha replacements and historical sources stay intact.
Scenery is byte-identical. Dark/light review sheets are session artifacts,
not additional committed source copies.

The remaining84 files were reviewed and installed as seven12-image phases:
`atmoso`, `aurora`, `bliss`, `bruno`, `disciple`, `elise`, `razor`.
Each has its own `Art/<phase>-art-intake.json` and byte-identical archived
sources beneath `Art/source/roster-intake/<phase>`. The owner explicitly
requires varying-color background removal, not one universal key.
Warm keys use RGB-distance/border connectivity plus reviewed enclosed seeds;
Disciple/Razor use reviewed hue keys. Exterior accidental outline cleanup
uses long components in the outer2.5% band on explicit reviewed icons;
Bliss skill1/Bruno passive also have reviewed empty source-frame margins.
Authored gold passive frames, Bliss's teal skill2 panel and painted shadows
remain. Dark/light sheets were reviewed, including corrected exterior outlines.
Supplied alpha still bypasses every cleanup branch.42 facing entries are
registered without baked flips. No signature-weapon PNGs were delivered.

Run the same phase commands above with each named character. Only use
`--apply --remove-incoming` after integration validation; it checks archived,
runtime and incoming hashes and removes only that phase's mapped files.
Repeat dry runs from archives afterward. Art tests cover all135 assets,
foreground retention thresholds and authoritative-alpha/facing invariants.
D-122 separately authorizes actual playable kits and Standard assignments;
images alone must never authorize new odds or ownership.

### Currency artwork

Owner originals are preserved byte-for-byte under `Art/source/currencies`.
`tools/prepare_currencies.py` exports 256x256 transparent icons with 224px
content and at least 16px padding. Each delivery uses its actual brown hue,
not the requested prompt swatch. Border-connected keying preserves matching
interior facets. Prismatica additionally removes the exterior cast shadow using
reviewed source-coordinate masks, preserving the coin thickness and detached
residue. Null-Prismatica removes muted spill around the separate bright sparkle marks;
the glass petals, dark thorn and non-emissive painted highlights remain.
Do not reuse these image-specific masks for replacements without reviewing them.

```powershell
python tools\prepare_currencies.py --assets fractalis lycalis
python -m unittest discover -s tools -p test_prepare_currencies.py
python tools\review_art.py --cleaned --assets fractalis lycalis --output <review-folder>
```

After visually reviewing both dark and light previews, add `--record-review`
to the currency exporter to refresh only those assets' provenance in
`Art/provenance/matte-review.json`. Owner-supplied alpha overrides bypass color cleanup.
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
See [Galvanic Field](../Art/creatures/dungeons/Galvanic%20Field.md) for skills and actual
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
overrides still bypass every remover. See [City of Heaven](../Art/creatures/dungeons/City%20of%20Heaven.md)
for the implemented roster, skills, stages and drop gates.

### Owner-supplied transparent replacements (current policy)

All 96 timestamp-named PNGs supplied in the project root were individually
matched to existing assets, then renamed to their existing in-game filenames
under `Art/source/cutouts/{characters,enemies,materials,abilities}`. Those files
are byte-identical to the supplied PNGs and are now the authoritative sources.
[Intake manifest](../Art/provenance/cutout-intake.json) records original filenames, canonical
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
hashes are recorded in [root-art-intake.json](../Art/provenance/root-art-intake.json).

Enclosed background pockets use36 visually reviewed source-normalized seeds
across11 exports in `tools/intake_root_art.py`: Atmospheric/Infernic/Aquatic
emblem loops, Fracture Reservoir's two frame gaps, Treasury staff/ribbon/leg
openings and selected Rosethorn vine/halo gaps. Only key-matching pixels
connected to those points are removed. Unselected matching subject colors,
including pink flame surfaces, orange hardware and gemstone highlights, remain
opaque. Invalid/nonmatching seeds raise errors; never globally erase the key
color or apply these seeds to the96 supplied-alpha replacements.

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

For an approved correction to existing exports, preview and review the changed
cutouts on a dark background, then use:

```powershell
python tools\intake_root_art.py --regenerate
python tools\intake_root_art.py --regenerate --apply
python -m unittest discover -s tools
```

Regeneration first verifies every archived original and prior runtime export
against the existing manifest. Any unrecorded change rejects the whole plan
before writes. Only differing exports are replaced; originals remain intact.
The updated manifest records pocket seeds and new runtime hashes.

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

See the [mandatory cutout contract](../Art/guides/cutout-background-contract.md).
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

[Review manifest](../Art/provenance/matte-review.json) records every asset, source/runtime
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

[Heaven/Abyss mode packs](../Art/creatures/gamemodes/README.md) contain separate six-form
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

The [Midjourney character and weapon prompt guide](../Art/guides/midjourney-character-style-prompt.md)
owns the detailed prompt text and visual rules. Edit it when changing those rules;
do not maintain a second competing prompt library here.
Use the actual `Art` directory capitalization consistently.

[Starter Art](../Art/characters/Starter%20Art.md) extends that guide with three new base-form
Element-Bearers (female fire/greatsword, female grass/bow, male water/spear) and three
basic mythological enemy prompts (goblin, imp, golem). These are generation prompts,
not generated assets or changes to the playable roster.

[Battle Scenery](../Art/ui/Battle%20Scenery.md) contains the cutesy grassy-field
background prompt for the opening solo encounter. Scenery is opaque full-bleed
environment art, not a square transparent unit asset.

The [elemental dungeon art packs](../Art/creatures/dungeons/README.md) combine eight
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
  without humanoid faces or body rules. See [currency prompts](../Art/items/Currencies.md).
- Heaven/Abyss retain their severe palettes, same-slime identities and elaborate
  ornamentation; complexity does not permit realistic anatomy or a different renderer.
- Only character/enemy portraits use mapped references at `--sw 400`;
  all non-portrait art uses neither flag (D-147). Scenery retains full-bleed
  lighting/composition.
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

[Tizu Art](../Art/characters/Tizu%20Art.md) and [Flora Art](../Art/characters/Flora%20Art.md) each contain
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

All ten elemental dungeons have supplied art wired through
[the dungeon art manifest](../src/content/dungeon-art.ts).
The Gameplay dungeon cards show full-width banners and concise elemental material
descriptions, not enemy/reward catalogs or arena previews. Supplied arena/enemy
exports are used in all ten playable dungeons. Future unavailable packs should
retain named neutral visuals without loading missing images. Register approved
packs in the existing manifest without changing rewards
or progression. See [integration rules](gameplay-and-elements.md#pending-artwork-and-reward-integration).
Character evolution shows
only the next recipe's own-element supplied materials. Art intake itself grants
no inventory; actual material drops and spending come from validated gameplay
transactions. Elemental dungeons do not grant captures; see
[capture eligibility](dungeons-and-captures.md).

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

## Delivered Conduit icons and replacement portraits (D-167)

The reviewed delivery contains35 Conduit icons and13 replacement character
portraits. Exact incoming names resolve through the authored Conduit designs and
character roster; ambiguous or missing matches stop the intake. The batch
supersedes prior runtime art for Bliss forms1-6, Rosetta and Crinso forms5-6,
Aurora and Bruno form5, and Thornia form6. Existing form IDs and facing
metadata remain in use.

Original PNG bytes are archived under
`Art/source/delivered-root-art/{conduits,characters}` and SHA-256 recorded in
`Art/provenance/delivered-root-art-intake.json`. The replaced portrait exports
are separately preserved under `Art/source/delivered-root-art/previous-runtime`;
older character-refresh sources and manifests remain unchanged. The four
D-157 root PNGs were outside this 48-source batch and are separately reviewed
and installed under the D-157 intake section above.

All48 delivered sources are RGB. Each has an explicit reviewed key and radius;
the few enclosed background gaps use19 normalized source-coordinate seeds
across8 exports. Verdant Covenant's spatially varied backdrop uses three
reviewed RGB samples. Matte flood fill remains border-connected plus only the
named seeds, preserving matching subject colors and painted shadows. Supplied
alpha, if present in a later batch, remains authoritative and receives trim,
resize and pad only. No runtime background removal is used.

Conduit exports are256px RGBA with224px content; portrait exports are960px RGBA
with864px content. Shared `assetUrl()` versions character and Conduit images
from their runtime bytes, so Store, Inventory, Archive and loot surfaces share
cache invalidation without changing their content resolvers.

From the repository root, first reproduce and inspect the dark contact sheets,
then install and verify the named batch:

```powershell
python tools\intake_delivered_art.py --review C:\Temp\delivered-art-review
python tools\intake_delivered_art.py
python tools\intake_delivered_art.py --apply --remove-incoming
python tools\conduit_art_revisions.py
python -m unittest discover -s tools -p test_delivered_art_intake.py
python -m unittest discover -s tools -p test_conduit_art_revisions.py
python -m unittest discover -s tools -p test_character_refresh.py
python -m unittest discover -s tools -p test_root_art_intake.py
npm test -- src\presentation\machine-art.test.ts src\presentation\archives.test.ts src\game\machines.test.ts src\presentation\conduit-store.test.ts src\presentation\portrait.test.ts
```

Applying archives and verifies each source/export before removing only the48
named root copies. It also preserves the previous13 runtime portraits and
regenerates both portrait and Conduit cache revisions. The earlier
`intake_character_refresh.py --apply` batch predates these replacements; do not
use it to re-export the13 superseded forms. Its reproduction test checks their
older exports through the preserved `previous-runtime` archive.
