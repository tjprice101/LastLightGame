# Art and asset workflow

## Existing source of truth

The [Midjourney character and weapon prompt guide](../Art/midjourney-character-style-prompt.md)
owns the detailed prompt text and visual rules. Edit it when changing those rules;
do not maintain a second competing prompt library here.
Use the actual `Art` directory capitalization consistently.

[Starter Art](../Art/Starter%20Art.md) extends that guide with three new base-form
companions (female fire/greatsword, female grass/bow, male water/spear) and three
basic mythological enemy prompts (goblin, imp, golem). These are generation prompts,
not generated assets or changes to the playable roster.

[Battle Scenery](../Art/Battle%20Scenery.md) contains the cutesy grassy-field
background prompt for the opening solo encounter. Scenery is opaque full-bleed
environment art, not a square transparent unit asset.

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
- Complete weapon and composition within a pure-white background and outer margin.
- Crisp contours, cel shading, painted highlights, and saturated colors.
- Character illustrations use 4:3; 1:1 is allowed for specifically needed square assets.
- Fire emphasizes elemental vestments, water readable spear action, and grass
  wings/aura. Each line preserves recognizable identity across its six art stages.
- Standalone weapon concepts use 3:2 and an inky, readable floating showcase style.

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
| Flores | [Source](../Art/source/characters/Flores%20Beginner.png) | [Transparent PNG](../public/assets/characters/flores.png) |
| Goblin | [Source](../Art/source/enemies/Goblin%20Enemy.png) | [Transparent PNG](../public/assets/enemies/goblin.png) |
| Imp | [Source](../Art/source/enemies/Imp%20Enemy.png) | [Transparent PNG](../public/assets/enemies/imp.png) |
| Rock Golem | [Source](../Art/source/enemies/Rock%20Golem%20Enemy.png) | [Transparent PNG](../public/assets/enemies/rock-golem.png) |

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
deployment base. Selection, companion/character panels, and Adventure use the
runtime images. Originals are not shipped in the game build.

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
| Light | [Light Attack](../Art/source/abilities/infernis/Light%20Attack.png) | [PNG](../public/assets/abilities/infernis-light-attack.png) |
| Heavy | [Heavy Attack](../Art/source/abilities/infernis/Heavy%20Attack.png) | [PNG](../public/assets/abilities/infernis-heavy-attack.png) |

Regenerate with `python tools/prepare_icons.py`, then `python tools/test_prepare_art.py`.
Use `--move-sources` only for first root intake; existing source collisions fail.
The [shared icon helper](../src/presentation/ability-icon.ts) supplies
deployment-base URLs to Home passive, Character overview/individual ability areas,
and Adventure's action buttons/passive help. Icons are decorative companions to
visible text, not replacements for labels, costs or hotkeys. Water/grass have no
supplied icons and retain their text controls without using Infernis artwork.
Tab changes still preserve the character portrait DOM.
Icon sizing is 32px in battle and 40px in character/passive panels, contain-fit.
The [icon tests](../src/presentation/ability-icon.test.ts) verify all six mappings,
dimensions/RGBA and absence of inappropriate water/grass substitution.

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
so the companion is a focal point; all three characters use identical sizing.
Battle sprites share square slots up to 185px (100px on mobile).
Slots shrink to their container width and images use `object-fit: contain`.
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
