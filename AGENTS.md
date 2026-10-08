# Last Light: AI agent entry point

## Replacement starter artwork (D-149)

All18 Infernis/Tizu/Flora replacement forms are installed under stable asset IDs.
New RGB originals are preserved in Art/source/starter-refresh; previous exports
in its previous-runtime folder. Use tools/intake_starter_refresh.py and reviewed
Art/starter-refresh-settings.json, not historical alpha files/white masks.
prepare_sprite routes current sources first; shared portrait revisions/facing
cover menus, locked silhouettes, fields and cut-ins. Existing historical supplied
alpha remains authoritative for that historical generation; never re-key it.
See docs/art-workflow.md#replacement-starter-portraits-d-149 and intake provenance.

## In-game confirmations and reward presentation (D-148)

Never use browser alert/confirm/prompt or OS Notification APIs. All confirmations
use presentation/game-dialog.ts (styled HTML dialogs, not browser message boxes).
Acquisitions use the shared reward-screen.ts reveal/receipt foundation; summoning
uses summon-presentation.ts, purchases/restoration use conduit-presentation.ts.
Save exactly once before animation; results present that saved outcome, never
reroll or claim. Keep Skip, explicit Continue, Escape, focus restoration,
reduced motion, actual duplicate conversion/bonus art and post-save error wording.
Existing battle results and character upgrade celebrations remain game-native.
See docs/menus-and-inventory.md and docs/summoning-and-economy.md.

## Current Sanctuary navigation (D-144)

Owner explicitly approves the supplied mock-up's persistent Home/Team/Summon/
Play dock and combined Team areas: Squad, Element-Bearers, Captured Creatures.
This supersedes older no-bottom-bar/separate Character/Squad rules below for
menus only. Keep Georgia and neutral/element palette. Legacy routes alias Team;
history retains area/selected IDs/tabs. Title/selection/combat remain dock-free.
Use real activities, holdings, rates/pity and transactions, not mock demo actions.
Final composition: src/sanctuary-reference.css, imported last. Preserve portrait
DOM, exact numbers,44px targets and native Help/Menu/modal focus. See
docs/menus-and-inventory.md#connected-sanctuary-reference-d-144.

## Future art edge clearance (D-135)

Every future character evolution/enemy form must explicitly frame its complete
design inside a continuous visible solid-background safety margin on every
side/corner. Reinforce near subject and composition clauses: no weapon/wing/
hair/armor/effect tips touch/cross/disappear beyond edges. Pull back the entire
ensemble uniformly, never delete/simplify details or diminish powers/late-form
presence. Keep compact renderer/identity, dense interiors and exact references.
Containment overrides historical near-edge94%/96% occupancy/3%/2% margins
for future prompts; existing blocks/runtime exports remain unchanged.
Scenery stays full-bleed. Inspect actual generated pixels, not just runtime
padding. See Art/cutout-background-contract.md and shared prompt guide.

## Current character artwork (D-134)

All60 portraits for Atmoso/Aurora/Bliss/Bruno/Disciple/Elise/Razor/Rosetta/
Thornia/Crinso use the replacement delivery. Owner confirms unnamed hammer
wielder as Bruno base. Art/source/character-refresh preserves new originals
and previous-runtime exports; historical D-121 originals/manifests stay intact.
tools/intake_character_refresh.py plus Art/character-refresh-settings.json
reproduce reviewed RGB/gradient/gap/spill cleanup; transparent supplied alpha
bypasses cleanup. Never apply historical roster masks to new sources.
Canonical runtime IDs and reviewed unit-facing.ts metadata cover all existing
menus/archives/showcases/battle/cut-ins; no save/stats/acquisition changes.
See docs/art-workflow.md#replacement-character-portraits-d-134. Some delivered
tips are already source-clipped; do not claim padding reconstructs them.

## Currency naming and replacement prompts (D-133)

Visible currency names are Prismatica (main) and Null-Prismatica (premium).
Keep legacy `fractalis`/`lycalis` fields/IDs/functions/save keys/RNG/asset filenames.
No migration, new income/costs or altered atomic transactions. Existing balances
stay intact. D-142 installs supplied Prismatica/Null-Prismatica crystal icons;
historical coin/rose originals and exports are preserved. Use
tools/intake_prism_currency_art.py to reproduce reviewed teal cleanup and URL
revisions; shared currency resolver owns active versioned URLs.
Art/Currencies.md now proposes bright prism/dark obsidian-violet prism icons,
both without `--sref`/`--sw` under D-147, with contrasting green
keys and complete outer margins. Old source-specific brown masks cannot be
reused on replacement keyed sources without explicit review/tool support.
See docs/summoning-and-economy.md and docs/art-workflow.md; use the new display
names in all future prose/UI/errors/accessibility text.

## Enemy references and unit edge containment (D-132)

All enemy prompt blocks end with the exact D-129 URL and `--sw 400`.
Six-form lines map directly1-6; eight-enemy lineups use1/2/2/3/4/5/5/6;
ten-enemy lineups use1/2/2/3/3/4/4/5/5/6; basic Adventure enemies use1.
This supersedes earlier character-only scope for enemies, not icons/materials/
weapons/Conduits/scenery. Mapping is visual position, not gameplay evolution.
Every character/enemy full-body prompt explicitly keeps the complete silhouette
inside a clear margin: never touch/cross the image edges, even in Omnic forms.
Do not append duplicate reference flags. Enemy designs/parameters/backgrounds
and supplied/runtime art remain unchanged.
See [mapping](Art/midjourney-character-style-prompt.md#character-form-style-references).
Validate with `python -m unittest discover -s tools -p test_enemy_style_references.py`.

## Character portrait quality (D-131)

All thirteen Element-Bearer portrait lines follow Bliss/Rose-banner construction:
same identity/compact anatomy/renderer/palette/weapon and exact D-129 reference,
plain base -> layered armor -> monumental regalia and dense elemental architecture.
Body canvas height is1/3 through Epic,1/4 Legendary,1/5 Omnic; proportions stay
2.5-3 heads tall. Ensemble spread50/60/72/84/94/96%, margins25/20/14/8/3/2%.
Late powers dominate and fill rear interior gaps, not just outer tips. Preserve
clear faces/hands/weapons, narrow key channels, complete tips and contrasting
reviewed per-form backgrounds. Canonical positive prose cap380 words.
Icons/weapons/creatures/scenery and supplied/runtime images are unchanged.
See [shared contract](Art/midjourney-character-style-prompt.md#portrait-quality-standard-d-131).
Historical per-character pause/body-scale/sparse-gap instructions are superseded.
Validate with `python -m unittest discover -s tools -p "test_character_*.py"`.

## Character-form style references (D-129)

Future and existing character-form prompts end with the exact evolution-matched
`--sref URL --sw 400` from
[the shared mapping](Art/midjourney-character-style-prompt.md#character-form-style-references).
Existing base/Common uses Evo.1; Evo.2-6 match directly. Evo.0 is reserved for
explicit future Evo.0 forms/generic templates, not a gameplay indexing change.
Do not duplicate flags or apply these references to icons, weapons, creatures
or scenery. Preserve compact anime/cel rendering, contrasting solid keys and
neutral non-explicit wording; no moderation/style guarantee or evasion.
Signed links may expire: request a refreshed owner URL, never substitute silently.
Validate with `python -m unittest discover -s tools -p test_character_style_references.py`
and `python -m unittest discover -s tools -p test_art_prompts.py`.

## Awaken the Machines (D-124)

35-stage Lv10-120 Conduit activity, bosses every5; no captures/materials/Null-Prismatica.
Independent per-kill8% Rare/3.5% Legendary/1% Omnic from stage26, equal entries
within5/5/10 pools, ordinary Prismatica, one atomic discovery/receipt/reward write.
Independent conduitSeed never changes other RNG. Both real banners separately
roll0.5% Legendary bonus saved with draw cost/reward/pity; no auto-equip.
Common Store catalog/prices and all existing modes unchanged.25 Conduits total.
Omnic requires matching combat element (also captured copies), max4 of8 ordinary
slots; enforce at UI/transaction/save/fighter boundaries. Master reserved.
Thornia/Crinso final compact/cel art escalation is the new standard.
28 prompts in Art/Awaken the Machines.md, no generated images yet; use neutral
pending states, no nonexistent PNGs. Rosetta revert was withdrawn; leave unchanged.
See docs/awaken-the-machines.md and docs/conduits.md for exact mechanics/tests.

## Current phased intake (D-121/D-122)

Owner supplied135 root PNGs and requests all seven art-only flagships become
playable as well. Phase1 completes51 Roses assets: preserved/hash-recorded
sources in `Art/source/roster-intake/roses`, runtime art and all shared
character/ability/creature/material/event/banner surfaces. Supplied rose
Defense icons are wired; original starter Defense remains text-only.
Tool `tools/intake_roster_art.py`/manifest `Art/roses-art-intake.json`;
root originals removed only after archival/review/verification.84 flagship
images are now individually reviewed/archived/installed with source-specific
keys and42 facing entries. Never apply color removal to supplied-alpha sources.

Owner confirms Standard assignments: Atmoso/Bruno/Elise within existing1%
five-star total; Aurora/Bliss/Disciple/Razor within0.1% six-star total,
equal within tiers. All seven are playable; Standard has22 outcomes and
highest-star pity now targets six-stars, preserving existing counters.
Roses unchanged. See docs/flagship-characters.md for first-pass kits and real
Disciple ally attack buffs. Preserve identities, opening three-choice starters,
ownership/progress/gear/settings/saves. Continue one section at a time; full
phase state and validation live in docs/handoff.md.

## Read first

1. [Documentation index](docs/README.md).
2. [Current state and handoff](docs/handoff.md).
3. [Game vision](docs/game-vision.md) and [decision log](docs/decisions.md).
4. The system document relevant to the task.
5. [Art workflow](docs/art-workflow.md) and the existing
   [prompt guide](Art/midjourney-character-style-prompt.md) before changing art.

## Project rules

- D-145 Elemental War is specification/art only, not implemented. Owner chose
  design-first:10 stages90-140/six forms per sub-mode,1% final-boss base EB
  recruitment, guaranteed Prismatica plus separate Null-Prismatica chance,
  owned-result existing-currency conversion, activity-header banners only.
  Nerithe/Orvella/Vaelor names/kits/6-star ratings/payouts/mapping are proposals.
  See docs/elemental-war.md and Art/Elemental War.md; never register/grant them
  from this proposal.46 prompts reproduce via tools/build_elemental_war_art.py;
  validate with python -m unittest discover -s tools -p test_elemental_war_art.py.

- D-137 component icon is installed: `Art/source/currencies/Broken Mechanical
  Components.png` is the preserved original; `public/assets/currencies/mechanical-components.png`
  is the reviewed transparent export. Reproduce with `tools/intake_component_art.py`;
  do not apply legacy currency brown masks. Shared component/currency/loot
  resolvers own URLs; economy/save/RNG unchanged. Supplied alpha stays authoritative.

- D-101: owner rejected renderer drift, same-looking evolved forms, missing
  contrasting backgrounds and unwanted lettering in newer character outputs.
  Correct one character at a time with original starter rendering and
  Wraththorn/Dawnthorn structural progression. Owner selected Atmoso first,
  then STOP for review. Owner subsequently accepted Atmoso direction and
  requested Aurora, then accepted her direction and requested Bliss.
  Bliss's13 prompts are Phase3. D-106 supplied
  base/final examples supersede the slight adjustment: dramatic armor contour/
  mass, shoulder canopy/gauntlets/greaves, waterfall feather mantle and colossal
  fans (1 body height Rare/Epic,1.5 Legendary,2 Omnic), not just more wings.
  Preserve her ivory/rose identity and Legendary foundation; no
  copied purple/slime anatomy/glow/extra figures.
  D-109 supersedes rejected D-107/D-108 body/scale changes. Bruno is Phase4,
  STOP for his review, restored to compact Bliss-style anatomy throughout.
  Rounded head/tiny torso/short limbs/2.5-3 heads and body1/3 canvas in all forms.
  Epicness comes from armor/hammer/mantle/wings/crown around the same body,
  not geological limbs or godlike body scale. Amber eyes/hair/ochre sash/basalt/
  bronze/single hammer retain identity; no gameplay scale changes.
  Bruno only this phase; Bliss/other prompt bodies unchanged.
  D-110 next revises Disciple only, Phase5: STOP for his review. Same compact
  anatomy/renderer, stronger black-amethyst lattice armor/seams/mantle/coronas/
  psychic wings and open-palm mindcrown frames, no weapons or body-scale shift.
  Omnic retains Legendary architecture and grows three-tier frames to1.5 body
  heights; upward linked flames express ally empowerment. Bruno/Bliss unchanged.
  D-111 next revises Elise only, Phase6: STOP for her review. Fixed compact
  anatomy/renderer, stronger lightning armor/seams/mantle/coronas/branching
  wings and exactly two four-point shuriken with open central grips.
  Omnic retains Legendary hover/mantle/main wings/circuit collars and grows
  three-tier star arms to1.5 body heights; no extra weapons/body transformation.
  D-112 next revises Razor only, Phase7: STOP for his review. Same compact
  identity/renderer; segmented obsidian bastion armor/tower shoulders/mantle/
  crescent shield wings and one pure-night sword. Omnic retains Legendary's
  braced guard/main wings/mantle/double crescent guard/three hilt clasps, then
  broadens architecture with five blade ridges and2-body-height blade.
  D-113 next revises Rosetta only, Phase8: STOP for her review; Thornia/Crinso
  art passes pending. D-114 supersedes the less-chibi anatomy exception:
  compact Bliss/Bruno proportions throughout (2.5-3 heads, body1/3 canvas).
  Only eyes detailed, no mouth/nose/eyebrows/other facial features throughout.
  Same anime contours/cel/painted renderer, covered armor, opaque powers.
 4/8/16 late wings, retained airborne draw/mantle/main wings and expanded rose
  armor/bow/cosmic rings/thorn fans/petal ribbons, no anatomy scaling,
  realism/monstrous anatomy/source glow. Six-star banner changes remain.
  D-116 refines D-115 Rosetta only: whole ensemble spans50/60/72/84/94/96%
  canvas width/height; Legendary/Omnic3%/2% key margins, same compact body1/3.
  Wings/mantle/thorn arches/ribbons spread toward all sides/corners.
  Rose-violet/sapphire-blue/warm
  opal facets enrich crimson/gold/ivory. Complete wings/bow/effects and clear
  eyes/open channels, no crops/glow/scenery. STOP for review; other packs unchanged.
  D-117 next revises Thornia only, Phase9: STOP for her review; Crinso pending.
  Future evolutions become increasingly wild yet elegant via off-axis thorn
  fans/tilted eclipse rings/opposing ribbons/interwoven open arches, not anatomy.
  Same compact eyes-only renderer/identity,50/60/72/84/94/96% ensembles,
 25/20/14/8/3/2% margins.4/8/16 wings, ornate thorn armor/greatsword; Omnic
  retains Legendary airborne sweep/main wings/mantle/collar and expands them.
  Rosetta's prompt bodies unchanged; no runtime changes.
  D-118/D-119: owner requests same style for Roselius/six Rosethorn materials
  then adds Crinso. Phases10/11 now revised; STOP for their review.
  Compact eyes-only identities/renderer, progressively wild/elegant thorn/
  ring/ribbon/arch geometry; portrait ensemble50/60/72/84/94/96%, margins
 25/20/14/8/3/2%, no edge contact/glow. Roselius weaponless/right-facing/
  Luminous,6/8/16 late wings, same fixed forms/capture rules. Materials face-free/
  two-thirds square/readable, Seed->Soul architecture; no new tiers.
  Crinso4/8/16 wings/gold-flame/crimson-lightning duality, exactly one connected
  double-ended two-edged sword/central grip/opposed blades; nested blossomed
  rose hub/triple thorn rails, retained Legendary architecture. All requested
  rose lines individually revised, outputs pending. Rosetta/Thornia/scenery
  prompt bodies/runtime unchanged.
  D-120 Rosetta Omnic only: owner emphasizes very busy late-form rear effects
  and almost no interior dead space, especially final three evolutions.
  Dense layered rose mandalas/thorn lattice/radial petals/counter-sweeping
  ribbons/prism fragments behind body/wings, not merely wide outer span.
  Preserve compact eyes-only renderer/identity,96% spread/2% edge margin,
  narrow green key channels/clear face-bow window, opaque no-glow effects.
  No scenery or automatic Epic/Legendary/other-line rewrites. STOP for review.
  Maintain non-explicit imagery and neutral copy across future phases:
  covered human designs or solid elemental bodies, abstract motion,
  no injury/bound figures. No claimed
  Midjourney acceptance guarantee or moderation bypass. See D-104 through D-109.
  Aurora retains weaponless Luminous lens casting, not healing or rose bow;
  Omnic expands Legendary's main wings/hover/mantle/lens collars without reset.
  Names/titles stay outside image prose;
  explicit solid contrasting key, open gaps, full silhouettes and text
  exclusions in every block. Same actual approved sref400; never invent URL.
  Prompt tests are not visual approval. See docs/art-workflow.md D-101.

- D-100: Roses Under Sunny Skies (`roses`) and Passion of Crimson Roses are live.
  D-113 makes all three6-star: Rosetta Luminous bow, Thornia Ominous greatsword, Crinso
  Chaotic single dual-edged sword have six forms/real kits. Only original three
  are selectable starters.35 event stages80->140; shared120 growth anchored
  then quadratic event-only extension.20% captures ONLY enemy levels<=120;
  captured cap120 and EB caps unchanged. Six Rosethorn materials replace these
  EBs' ordinary materials; character-aware cost/requirement helpers must drive
  every preview/Max Level/confirmation/transaction. Late fodder uses Roselius
 1/2/3 form3+/4+/5+, full protections. Rose banner10 cost,1.1% total6-star
  equally split across three EBs,98.9% first-three Roselius50:30:17; separate
 200/500 highest6-star pity includes all three. Existing counters/progress
  preserved with no retroactive reset/award. Duplicates grant Omnic Roselius Lv80/Stage29 kit with
  validated banner-duplicate provenance. Standard remains unchanged.
  Roselius sell atomically for1/2/3/4/5/6 own-tier materials, no currencies;
  locks/squad/any-Conduit and overflow/write failures preserve copies/balances.
  Art pending: no missing PNG URLs or unrelated substitutions.54 prompts in
  new character/event packs; see docs/crimson-roses.md and rose art tests.

- D-099 flagship prompts: base forms stay simply equipped like initial starters,
  including6-star bases. Later forms explicitly gain complete prismatic body
  armor, layered element-specific prism wings, swirling elemental structures
  and more ornate signature weapons/foci, matching late Heaven/Abyss slime
  impact with the starter renderer. Radiant presence uses painted facets, not
  source-cutout glow. Aurora/Disciple stay empty-handed casters. Do not repaint
  supplied art or apply humanoid prism wings to unrelated creature/item packs.

- D-098: Element-Bearer display names are Prefix, Character name, using each
  evolution's existing title. Use content/character-art.characterName for live
  menus/art alt text/rosters/banners/battle snapshots. Banner awards are base-form
  names; owned displays use saved evolution; Archives use the indexed form.
  Keep identity names in prose and stable IDs/assets/saves/creature names.
  Evolving must refresh headings/roster labels while preserving portrait DOM.

- D-097 permits semantic green/red information emphasis: stat gains/losses and
  sufficient/missing upgrade resources. Shared stat-change.ts/CSS compares raw
  stats and preserves formatting, arrows/accessibility labels and neutral equal
  values. Conduit stat differences retain Before Conduits references. Do not
  turn navigation into arbitrary rainbow colors or change math to fit displays.

- D-095: ambient-background.ts/CSS owns unique neutral geometric screen patterns,
  slow ring/particle transforms and static modal textures. Both reduced-motion
  settings disable animation; decorations stay aria-hidden/pointer-transparent
  and viewport-clipped. Battle preserves supplied scenery with sparse motes only.
  No gameplay RNG, camera movement or changes to battle-speed/combat timing.

- D-094: seven future flagship Element-Bearers have generation-only art packs
  linked in Art/Flagship Characters.md. Bruno/Tectonic hammer Tank,
  Elise/Voltaic shuriken DPS, Atmoso/Atmospheric wind-staff DPS are5-star planned
  for Standard. Aurora/Luminous light-energy enemy-debuff Support, Razor/Ominous
  night-sword Tank, Bliss/Tranquilitic feather/warfan DPS, Disciple/Chaotic psychic
  ally-buff Support are6-star, banner unspecified. Six forms each, fully prismatic
  final armor, same compact renderer/no-glow cutout contract. Creative titles/
  symbols are proposals, not numeric kits. No live pool/odds/assets/save changes.

- D-093 refines D-090 using the owner's nine screenshots: compact top row, left
  Gameplay heading, large activity hero, wider Character portrait/narrow control
  panel with underline tabs and row-based stat deltas, four-by-two desktop
  Conduits plus full-width Master, large Squad cards and two-to-one Summon split.
  Owned Character roster follows the stage. Desktop detail panels scroll;
  mobile stacks without clipping. Retain real systems, palette, Georgia, Back,
  no bottom dock and modal rates/Information. See docs/menus-and-inventory.md.

- D-123: Inventory uses real currency cards, Materials/Conduits tabs and positive
  holdings artwork grids with exact counts. Counts are distinct owned types;
  fourteen empty slots are decorative, not storage caps. Tab selection is
  transient and history-aware, never a wallet field. Menu is a native right-side
  full-height drawer with Inventory/Collections tiles and utilities; retain all
  other destinations in its compact grid because there is no bottom dock.
  Close/Escape/backdrop/current-page dismiss, Settings closes Menu first.
  Preserve focus, reduced motion, neutral palette, Georgia and real artwork.
  See docs/menus-and-inventory.md.

- D-092: menus use caller-based Back, not fixed Home shortcuts. Home remains
  inside Menu. In-memory history restores valid tab/category/banner/gallery/
  activity/stage/filter/Squad choices without account writes; battle exits return
  to the caller and discard the run. Title clears history; dialogs are not entries.
  Conduit ordinary icons80px, Store/Archive hero art up to200px; omit repeated
  recovery labels, preserving names/effects/prices/counts/lore/controls.

- D-091 supersedes prior sans-serif preferences: ALL game text uses the earlier
  Georgia font stack via interface.css --ui-font, weight600 ordinary/control
  text and700 headings/emphasis. Include opening screens, menus, dialogs,
  selection panels, numbers and battle text. No external font downloads.

- D-090: the owner-provided Sanctuary mock-up defines menu composition, not
  mechanics/style. `sanctuary-layout.css` scopes current screen formatting.
  Home: left banners/central leader/right squad; Gameplay: category rail/selected
  activity; Character: portrait-left, Details/Growth/Conduits-right (all eight
  IDs retained); Summon: artwork-left/draw-pity-right; Squad: heading Save/three
  cards; Collections: gallery/banner/filter/grid. Header Menu contains all
  destinations, Settings and title; no bottom bar. Retain existing neutral/
  element palettes, sans-serif, Information, all modes and transactions.
  Linked unmocked menus keep destinations/functions and shared formatting.
  Title/selection/battle/results/Settings content are not redesigned here.
  See docs/menus-and-inventory.md. Never fund browser saves for layout tests.

- D-080 supersedes old navigation/serif UI guidance: Inventory is holdings only;
  Conduit Store belongs to Stores; the three existing Archives galleries belong
  to Collections. Home has grouped destinations and no bottom bar. Character
  has Element-Bearers/Captured Creatures categories with selected owned IDs;
  capture leveling, locks, Conduits and sales remain there. UI is consistently
  sans-serif, with short factual labels and optional centered Information dialogs.
  No automatic tutorials; keep costs/eligibility/errors visible. Summon rates
  and rules live in Rates & Information; cost/action/pity remain visible.
  Max Level previews target/cost/seven stat deltas for either character type,
  then rereads and validates before one confirmed atomic save. No evolution,
  fodder or Null-Prismatica spending. Preserve starter portrait DOM after leveling.
  D-083 replaces native dropdowns with shared centered selection panels.
  Keep hidden backing selects and their transaction/form hooks; no duplicate
  events or writes. Shared menu Information owns generic rules; unique kits,
  costs, loot and rejection reasons remain available. No expandable descriptions.
  D-084 uses item-showcase.ts for associated currency/material PNGs on activity
  cards and cost/sale previews. Preserve labels, exact amounts and stage gates;
  pending materials remain named neutral tiles. No unrelated/missing PNGs.
  See docs/menus-and-inventory.md and src/game/max-level.test.ts.

- Canonical character terminology: **Element-Bearer**, **Element-Bearers** and
  **Owned Element-Bearers** for the player's collection. Never call characters
  companions in UI, accessibility text, errors, documentation or character art
  prompts. Only characters are Element-Bearers; captured enemies remain creatures.
  Use squad member for mixed teams. Internal legacy names,
  CSS hooks and save keys may remain unchanged for compatibility.

- Phase5/6: optional wallet.capturedCharacters stores distinct
  capture:<UUID> IDs/creatureId/locked/level/capturedStage/skills; characterLocks protects starter IDs.
  Storage uncapped, copies start unlocked, manual locks plus squad protection.
  Keep legacy starter IDs/progress/gear untouched.20% Heaven/Abyss per-kill
  captures commit with ordinary rewards/discovery/receipt in one write, using
  separate RNG. Treasury/Sanctuary also grant20% captures. No Adventure/elemental-dungeon captures. Captures retain defeated
  level/skills, can independently level to120, never evolve, and use ordinary
  stats times .65+.35*tier/5, never boss stats. Manual shared-Gauge skills retain
  enemy intervals as cooldowns; missing slots unavailable. Mixed/all-captured
  squads allow duplicate species, distinct IDs/max3; all run surfaces snapshot
  copies/gear. Fixed-form stars1-6 supersede the old rare-character reservation.
  Legacy metadata-free copies use first authored form stage without load writes.
  See docs/character-instances.md and docs/dungeons-and-captures.md.

- Phase4 Archives groups Character, Conduit and discovery-gated Creature
  galleries. Character Archive lists every evolution individually; unreached
  forms/unowned characters are silhouettes, reached forms reveal in color.
  Filters combine element/rarity/ownership/form discovery/stars.
  Starter current form shows actual equipped stats; others are level0 previews.
  Character gallery has18 starter evolutions plus24 fixed captured forms.
  Captured portraits reveal only on owning that form, not Creature discovery.
  Galleries live under Collections; old glossary page is a Creature-gallery alias.
  Every combatant/creature has a canonical combat element. Adventure:
  Goblin Efflorescent, Imp Infernic, Golem Tectonic. Dawnthorn Tranquilitic,
  Wraththorn Chaotic; elemental dungeon enemies match their dungeon.
  Creature.dungeonElement, not combat element, routes material loot.
  Infusion five-element pools remain unchanged. No new affinity multipliers.
  See docs/archives-and-elements.md and Art/Element Emblems.md.
- Game-wide rarity art: Common->Omnic becomes less cutesy and more epic,
  formidable, majestic and awe-inspiring in design and prompt language.
  Keep the shared compact anime/cel renderer and species identity; do not
  substitute realism or cinematic splash framing. Rarity is separate from
  stars. Follow the shared prompt guide's rarity tone ladder for future art.
- Last Light is an original gacha game inspired by Brave Frontier. Do not copy
  its characters, assets, story, code, names, or proprietary content.
- Separate confirmed requirements, proposed designs, open questions, and
  implemented behavior. A written proposal is not owner approval.
- The owner delegated stack selection: TypeScript, Phaser 3, Vite, and Vitest
  power the browser prototype. Keep accessible menus in HTML over the canvas.
  Ask before changing engines or adding paid services, backends, or payments.
- Inspect the workspace before trusting handoff status. Opening flow and
  [Adventure](docs/free-battle.md), all ten elemental material dungeons and
  [level/evolution transactions](docs/units-and-progression.md) are implemented.
- Starter selection offers fire, water, and grass. Adventure uses the saved
  squad, including captured leaders; do not auto-grant a team or replace saves.
- Each Adventure entry starts at wave 1; Settings retains the run, quitting does not.
  Enemy level follows wave up to120; stats accelerate from double prior initial
  growth. All enemy curves use src/content/stat-growth.ts with200k ordinary/
  400k bossHP at120. Character G=(1+.03*level)^3*1.45^(evo-1);
  percentages/coefficients use separate boundedP, not HP-scale growth.
  [Captures](docs/dungeons-and-captures.md) are playable in every activity,
  acquired in Heaven/Abyss/Crownfall Treasury/Rosethorn Sanctuary; banner awards also create copies.
- [Gameplay/element framework](docs/gameplay-and-elements.md) is now the activity entry
  point: all ten elemental dungeons and both infusion modes are playable (D-050).
  All ten elemental dungeon packs are supplied and integrated. Future art-pending
  content uses named neutral visuals; never request missing PNGs or reuse another element's art.
  Register supplied packs in content/dungeon-art.ts when they arrive. Shared dungeon levels
  10->120 across35 floors; Heaven/Abyss likewise35 floors80->120. Preserve final
  enemy stats/ability strength and material unlock levels. Shared loot-random.ts
  scales quantities quadratically and chances by level; dungeon/infusion loot APIs
  are the source of truth for rewards and glossary. Costs are unchanged.
  The old Flaming Depths Lv6-55 proposal is
  superseded. Editable first-pass drops/costs live in content/dungeons.ts and
  content/progression.ts. Phase7 creature infusion supplements existing costs:
  Evo3->4 consumes1 form3+,4->5 consumes2 form4+,5->6 consumes3 form5+ copies
  from the element's infusion mode, NOT the creature's combat element.
  Explicit selections only; locked/squad/any-Conduit-equipped copies protected.
  Shared evolutionFodderOptions and upgradeCharacter reread/validate copies,
  then commit evolution/costs/removal in one write. No retroactive save charges.
  See docs/evolution-fodder.md.
- Phase8: Heaven/Abyss per-kill Null-Prismatica probabilities linearly interpolate
  Lv80 none/1/2/3 =90/8/1.5/0.5% to Lv120 =75/10/10/5%, same ordinary/boss.
  Independent lycalisSeed preserves other RNG; premium rewards save atomically
  with materials/captures/receipts. No Adventure/elemental-dungeon premium drops.
  Standard Banner has22 real outcomes: first three Heaven/Abyss/Treasury/Sanctuary
  forms, six5-star EBs and four6-star flagships.5-star tier1% TOTAL,
  six-star tier0.1% TOTAL/equal entries; creatures split98.9%50:30:17.
  No4-star placeholders. Authored highest tier is now6.
  Phase9 activates10-Null-Prismatica draws: one atomic write for cost/reward/pity.
  Owned EB result grants infusion:treasury:5 at Lv50 flat, acquisition
  banner-duplicate, Stage22 kit; ordinary creature rewards use first authored
  form stage level. No automatic equipping. See docs/summoning-and-economy.md.
- Banner pity: independent per-banner200 highest-star /500 unowned-highest-star
  counters. Natural highest-star resets200; new highest-star resets both.
  Duplicate does not reset500 except its due all-owned fallback.500 takes
  priority if both due; equal eligible guarantee odds. All-owned500 awards
  ordinary highest-star duplicate conversion and resets both. Current highest6
  for both real banners. Optional wallet.bannerPity.standard validated;
  missing legacy values read as0 without writes/retroactive counts.
  resolveBannerPull is pure: summonCharacter atomically saves cost,
  reward/duplicate conversion and counters together; failed/rejected draws
  never advance.
- Summoning visual contract:16:9 full-bleed Omnic-tier artpiece per real banner,
  overall theme/identity, no reward portrait grid. Art/Summoning Banners.md
  contains Standard prompt/export/intake; null artwork means neutral pending
  panel, never unrelated images/missing PNG requests. Drop-rate rows only
  name, awarded rarity/star value and rate. No unit art/roles/stats/lore.
  Omnic art is not an acquisition rarity promise. Detailed rules stay in an
  accessible disclosure; preserve exact odds/pity and atomic draw behavior.
- Phase9 Crownfall Treasury:25 stages65->120, Luminous crowned gemstone slimes,
  six fixed forms, every fifth stage boss. Currency-only mission loot per kill
 100-200 at65 to1,000-2,000 at120 using quadratic minimum, same boss/ordinary.
  No ordinary second Prismatica roll/material/Null-Prismatica/clear bonus.20% captures
  retain defeated level/kit; separate RNG. Use per-mode stage counts everywhere.
  Sale prices Common->Omnic1k/3k/10k/30k/100k/300k, independent of level/source.
  sellTreasuryCreature rereads exact UUID and rejects locked/squad/Conduit
  protection, commits currency/removal together. Treasury and Sanctuary copies sell.
  Final duplicate reward at50 has explicit validated provenance permitting
  below-mission level; do not lower real captures or use highest-account level.
  Art is pending: six cutouts/mode header/arena prompts in Art/Crownfall Treasury.md.
  No missing PNGs/unrelated art; see docs/crownfall-treasury.md.
- Phase10 Rosethorn Sanctuary:25 stages65->120, six Tranquilitic divine/regal
  flaming-wisp forms, every fifth stage boss,20% captures. One independent
  Null-Prismatica roll:50% chance of1 at65 ->80% chance of5 at120; chance linear,
  quantity round(1+4*(level-65)/55). Ordinary Prismatica, no materials/clear bonus.
  Boss/ordinary payouts match. Sanctuary Common->Omnic sales give both
  Fractalis100/300/1k/3k/10k/30k and Lycalis1/2/3/5/7/10; fixed form, not level.
  Exact odds/prices are developer tuning under owner-delegated balance.
  creatureSaleOffer/sellCurrencyCreature share locked/squad/Conduit protections
  with Treasury; both balances/removal save in one validated write, no partial
  award on failure/overflow. Treasury-only wrappers preserve old callers.
  Sanctuary copies cannot satisfy Heaven/Abyss evolution fodder. Only Treasury
  final duplicate-EB copies allow acquisition=banner-duplicate/Lv50.
  First three wisps join Standard's equally split creature tiers; pity,10 cost,
  1% five-star EB tier and duplicate reward unchanged. See docs/rosethorn-sanctuary.md.
  Art/Rosethorn Sanctuary.md has six cutouts/3:1 header/16:9 arena prompts.
- Conduit Store is a submenu under Stores, reachable from Home/Stores/
  Character equipment. Artifacts are renamed Conduits: ancient-war mechanisms,
  some powered by Elemental Light. Catalog in content/conduits.ts; optional
  wallet.conduits holds saved copy counts. Purchases commit funds/copy in one
  write. Phase3 equips eight ordinary slots per owned character; one copy unlocks
  all characters, one name per character, no consumption. Master reserved.
  Optional wallet.conduitEquipment uses exactly8 IDs/nulls; reject duplicates/
  unowned content. resolveFighter applies effective stats; run snapshots preserve
  equipment through Continue/replay/Settings. Never reread menu gear mid-run.
  Current five designs are Common only. Higher rarities progressively unfold/
  restore into elemental masterpieces, Omnic fully completed/reborn with
  prismatic swirling energy and shine. Preserve core identity/chibi renderer;
  bounded opaque energy in cutouts, reviewed runtime glow separate from matte.
  Art direction does not establish Conduit evolution mechanics or balance.
- Sanctuary destinations: Home, Character, Gameplay, Events, Inventory, Stores,
  Collections, Squad and Summon. No bottom bar. Character selects owned IDs;
  Squad saves 1-3 distinct owned IDs, leader first, starter removable. Summon
  costs10 Null-Prismatica, equal odds among unowned existing IDs, disabled when complete.
  New Element-Bearers start Lv0/Evo1/weapon0 and unequipped. Do not invent extra
  Null-Prismatica income: First Fracture still pays10 once globally.
  Keep sanctuary CSS isolated from title/selection and immersive battle. Preserve
  character portrait/rail DOM when changing upgrade tabs.
- UI primary colors are neutral black/white/gray; accents follow the associated
  element, not arbitrary rainbow navigation or gold currency styling. Keep
  banner-ready button sizes. Supplied Infernic/Aquatic dungeon art is wired to
  dungeon battles and recipe icons, alongside the supplied Garden of Beauty and
  City of Heaven, Galvanic Field and Lustrous River packs. City/Galvanic enemies
  have per-enemy ability names; Lustrous retains the existing Luminous strike.
  Lustrous originals/provenance are in Art/source and Art/lustrous-river-intake.json.
  prepare_dungeons.py --elements luminous uses per-source border keys/reviewed
  hole seeds, retaining pale subject/gem colors. Guardian/Griffin/Oracle/Kirin
  mirror right in battle via unit-facing.ts; the other four remain right.
  Precipice/Tectonic is also supplied: tools/prepare_dungeons.py --elements
  tectonic regenerates reviewed keyed cutouts; Art/precipice-earth-intake.json
  records provenance, hole seeds and tight crystal masks. Preserve the typo
  Flntback Armadiillo.png in source, canonical Flintback Armadillo in runtime.
  Keep genuine frontal Atlas/Behemoth unchanged; directional sprites face right.
  Chaos is supplied: prepare_dungeons.py --elements chaotic regenerates
  reviewed per-source keyed cutouts/enclosed gaps; Art/ruins-chaos-intake.json
  preserves hashes/settings. Retain matching cyan prisms/powers and pale pixels.
  Shared unit-facing.ts keeps enemies right/allies left in field and cut-ins;
  animate wrappers, never overwrite image facing or mirror panels/text.
  Genuine frontal Crownvoid/Sovereign remain unchanged. No capture changes.
  Sky-bound Rift is supplied: prepare_dungeons.py --elements atmospheric,
  Art/sky-bound-rift-intake.json. Preserve original arena capitalization.
  Reviewed magenta/cyan keys and enclosed seeds preserve pale feathers;
  Seed uses tight feather/ribbon polygons and bright-channel protection,
  Drake a value gate/highlight mask. Soul's lower shadow key unions alpha
  without restoring keyed backgrounds. Hostile directional units face right;
  genuine frontal Roc stays unchanged. Gale Strike/discovery/captures unchanged.
  Valley of Solitude completes the ten packs: prepare_dungeons.py --elements
  ominous, Art/valley-solitude-intake.json. Reviewed green/teal keys include
  low-saturation Bloom/Heart backgrounds and enclosed ring/chain/limb gaps;
  preserve matching gem/casing highlights, pale artwork and painted shadows.
  Imp/Sentinel/Gargoyle/Regent mirror right; Duskmote/Cat already right,
  genuine frontal Weaver/Monarch unchanged. Umbral Strike/discovery/captures unchanged.
  City source RGB images use reviewed offline color keys in prepare_dungeons.py;
  protect ivory halos/wings, Shard ribbons and Crest gold. No runtime keying.
  Galvanic green/teal keys are reviewed per image; wider Bloom/Seed/Soul cleanup
  protects Seed painted highlights and Soul facets with foreground masks.
  Do not auto-grant materials or extend capture eligibility without approval.
- Art prompts share the original compact chibi renderer: clean anime contours,
  crisp cel shading, painted non-emissive highlights and jewel-like subject colors.
  Preserve identities/palettes/equipment/species; Heaven/Abyss may escalate
  ornamentation, never switch to realistic anatomy or a different renderer.
  Standalone weapons now follow this renderer, not earlier splotchy ink concepts.
  Cutouts retain solid key backgrounds/no glow; scenery keeps full-bleed lighting.
  D-147: only character/enemy portraits use mapped --sref at400; all items,
  weapons, ability icons, banners, arenas and other art use no --sref/--sw.
  Never invent a portrait reference URL.
  Validate prompt changes with python -m unittest discover -s tools -p test_art_prompts.py.
- Economy/progress share last-light.wallet version3; migrate version2 stage unlocks
  to35-floor equivalent level progress exactly once, and legacy version1
  Prismatica without losing currency. Loading must not write. Retain all account
  data, receipts and stable discovery IDs. Use game/account.ts for atomic upgrades and
  receipt-deduplicated rewards, summons and squad saves. Progress-record presence
  establishes ownership; normalize the profile starter/default squad on read,
  without writes or loss of existing progress. All battle modes snapshot the
  full squad's independent progress; Continue/replay preserve it and each Gauge.
  Preserve starter identity, settings and hotkey keys.
  Battle attack/Defense/ability/Space shortcuts are disabled (D-053); only selection
  keys remain and legacy action fields are ignored without rewriting saves.
  Gestures primary, modal Battle menu accessible, explicit result Continue.
  Cosmetic battle-effects.ts scales bounded rings/rays/sparks by level/evolution;
  scheduled enemy abilities use enhancedAttack events. No combat/RNG changes.
  battle-cinematic.css staggers mirrored formations, never crosses sides.
  battle-ui.css is the final sanctuary-themed combat chrome/Settings layer:
  sans-serif activity/unit names, charcoal framed toolbar and compact320px readout
  cards, unit-element HP accents, white turn controls. Shared by all13 modes.
  Strong #battle-root selectors supersede old transparent-readout rules.
  Use it for controls/readability rather than extending legacy glow overrides.
  Preserve 44px targets, visible focus, collapsed utilities and no bottom bar.
  BattleView's aria-busy tracks entrance/action presentation, not engine phases.
  D-056: toolbar speed1x/2x/3x is presentation-only, persisted separately by
  battle-speed.ts. Update tracked WAAPI playback rates live and scale CSS effect
  duration/delays; do not change combat math, RNG, rewards or reduced motion.
  Remove speed listeners on disposal; preserve Settings/reload selection.
  Field-first layout lives in battle-focus.css. Keep the three former edge
  disclosures inside the modal Battle menu, retaining keyboard/touch actions.
  Field readouts show names/levels, HP and allied Gauge; full DEF/reference
  stays in the menu. Settings uses shared settings-panel.ts/CSS in both contexts.
  Live battle Prismatica is inside Settings, not the toolbar; retain its ID.
  numeric-layout.css owns large-number containment: adaptive stat card columns,
  card-relative type size and full-value wrapping for counts/costs/rewards.
  Preserve exact numeric text; do not abbreviate balances or change stat math
  to fit the UI. Check endgame HP and maximum-safe-integer holdings on mobile.
  teamCanAct/advanceUnavailableTurns resolve blocked player turns automatically
  until an ally can act or combat ends. Recovery is a real enemy phase, never a
  free skip. Continue remains manual; rewards and presentation must retain every
  resolved event across recovery and resumed sessions.
  Owner-supplied alpha in Art/source/cutouts is authoritative for96 assets.
  All exporters use prepare_art.prepare_sprite: trim/resize/pad ONLY for these
  sources. Never apply background removal, seeds, foreground masks or edge
  decontamination to them. Art/cutout-intake.json records originalbyte hashes and
  canonicalnames. Historical originals remain preserved; older Infernis6/Tizu5/
  Flora6 corrections apply only to legacy sources, not supplied cutouts.
  BaseFlora/BaseTizu/archivedHeavy have no suppliedreplacement and stay unchanged.
  Currency originals live in Art/source/currencies; transparent 256px runtime
  icons live in public/assets/currencies. prepare_currencies.py and review_art.py
  share source-specific brown/spill/shadow cleanup. Review replacements before
  reusing masks; --record-review updates only selected currency provenance.
  Use presentation/currency-icon.ts and battle-loot.lootArt, not material URLs
  or letter tokens. Keep both balance IDs, accessible labels and economy rules;
  Null-Prismatica is not enemy loot. Confirmations use styled in-game dialogs.
  New cutout prompts follow Art/cutout-background-contract.md: subject identity,
  equipment, palette and style first; short plain solid unlit background clause
  last. Never force subject colors to clash or redesign them for keying.
  No glows in cutout generation: powers are opaque solid-color lines/ribbons/
  rings/shapes with crisp edges; painted highlights are non-emissive.
  Remove positive luminous/glowing/translucent effect wording, preserve names
  like Luminous and Bloom, and exclude "light bloom" rather than flowers.
  Existing supplied PNGs and runtime battle VFX are not changed by this rule.
  Same solid background fills rings/gaps; no-glow excludes scenery prompts.
  Abyss uses green #00FF00, not neon lighting. Banners/arenas
  remain scenery. Legacy white-matte tools need explicit chroma-key support
  before processing newly generated keyed originals; never erase pale artwork.
  D-054 results sheets appear only after full clear/defeat presentation;
  normal turn cues are brief/nonblocking. battle-results.ts aggregates actual
  kill events, no rerolls/claims. stageEvents includes Adventure and resets per
  encounter; never derive reward totals from the truncated log. Continue/Quit/
  Retry use existing transitions; final stages have no Continue. Dismiss/reopen
  stays transient in the session and preserves totals across Settings.
  D-055: every real enemy has1 skill below50,2 at50+ via enemy-skills.ts.
  Boss second skill is a heavy ultimate every6 turns, replacing due primary.
  Attack events carry actual skill action/abilityName; do not infer from message.
  Character skills and50+ enemy skills have portrait-cut-ins with actual form art;
  battle-cutin.css owns elemental charged ribbons/crests/rails, no boxed copy.
  All skill/ultimate cut-ins3500ms base, stationary12%-90% reading hold;
  final10% fades opacity in place, never slides/scales away.
  Retain1/2/3x scaling per owner choice (910ms stationary hold at3x).
  Ability is large sans-serif title, caster/tier subordinate. Runtime VFX may glow;
  no-glow generation policy applies only to art prompts, not cut-in UI.
  Ultimates use richer ribbons. Track WAAPI/cleanup, skip reduced motion, impact
  after cut-in. Optional skill fields only support legacy mocks, not real spawns.
  Start Lv.0/Evo.1, no retroactive items, no Null-Prismatica spending. Play in one tab;
  local storage is not an authoritative or cross-tab-locked economy.
- Preserve source images under Art/source; shared prepare_sprite prefers
  Art/source/cutouts and must keep suppliedalpha. No runtime background removal.
  Preserve intentional drop shadows, facing transforms and undiscovered
  silhouettes. Images use Vite's deployment base, not root-relative paths.
- Preserve the established art direction. The owner now approved six gameplay
  forms (D-033), mapped to base plus all five supplied evolved portraits for each
  starter. Caps 30/45/60/75/90/105; Evo5->6 costs 4800 Prismatica and 25 Epic/10
  Legendary materials plus10 matching specialty evolution items. Omnic has no spending recipe yet. Save IDs are
  unchanged. Use content/character-art.ts everywhere, not hard-coded base art.
- Tizu/Flora art files include six icon prompts each (Passive, Skill1/2,
  Last Flare, Normal, Defense). Five icons per character are supplied and wired
  through presentation/ability-icon.ts; Defense remains text-only. Originals
  live in Art/source/abilities/{tizu,flora}; prepare_icons.py supports --assets.
  Do not add Heavy or substitute another character's icons.
- Keep gameplay rules and content definitions separate from presentation where
  the selected stack permits it. Reuse existing patterns once code exists.
- Character screen categories/layout live in presentation/hub.ts and the scoped
  character-screen.css. Cinematic central portrait with navigation/details around
  it uses220px desktop rail,52px nav art/80px ability detail art (48/72px phones),
  64px materials. Do not shrink menu art back to20-34px. Phone navigation groups
  use two columns with68px buttons; stat cells auto-fit110px for readable numbers.
  it supersedes D-044's small identity column; mobile also leads with large art.
  Keep all nine selectors and portrait-preserving
  updateCharacterTab behavior. Costs, eligibility and stat deltas must remain
  visible; do not trade reduced scrolling for clipped data or smaller targets.
- Upgrade celebrations (presentation/upgrade-celebration.ts, D-045) run only
  after saved upgrades/updateCharacterTab. Preserve reduced motion, repeat cleanup,
  nonblocking overlays, facing scale and final-cap upgrade-result status.
- Activity loading/entrance (D-046): use activity-transition.ts for destination
  changes and entrancePending for new encounters. Never enable combat while
  loading/sliding, replay finished entrances on settings close, or delay reward
  persistence. Keep reduced motion, artwork timeout/error reporting and disposal.
- Home omits abilities/passive/ability shortcuts (D-047); full kits remain in
  Character/battle. Shared portrait character-idle wrapper pulses menu art only.
  Home also omits the upgrade dock and orbit ring; large centerpiece art has no
  upgrade controls around it. All upgrades remain in Character.
- Cutout cleanup uses reviewed original-normalized seeds in tools/matte_regions.py
   across all exporters; do not globally remove enclosed white pixels.
   Art/matte-review.json records all99 assets and32 targeted fixes. Use
   tools/review_art.py for dark previews and inspect candidates manually.
   Pale wing/crystal protection and per-asset thresholds must survive regeneration.
- Creature Glossary opens from Home. Content catalog assigns stable IDs to each
  authored form across all activities; neutral tokens explicitly denote missing art.
  Walletv2 creatures defaults{} for old saves without rewriting on read.
  Entry records seen before combat, rewards atomically record first defeat.
  Never reveal loot until defeated; use live drop tables and per-stage gates.
  Infusion bonus pools must use infusionElements(mode), matching the five
  associated affinities; per-element probabilities are rarityChance/5.
  Preserve image DOM, thumbnail bounds, facing and nested celebration selectors;
  honor reduced motion. Battle pulse lives separately on unit-idle.
- Heaven/Abyss art direction lives in Art/gamemodes (D-048/D-050): six-form slime
  lines supersede wisps; three specialty items per mode plus mode-associated Epic+
  drops. Late leveling item applies throughout Evo5/6, not just aboveLv80.
  Both modes are live:35 stages80->120, bosses every5. Specialty unlock levels
  80/93/100 (floors1/12/18) are unchanged. Final specialty stacks3-6 each.
  Elemental final stacks3-6 per rarity with
  guaranteed/98%/90%/80%/60%/35% odds; unlock levels10/23/48/73/98/120.
  Rare types remain chance-based. Currency scales5-10 atLv1 to15-30 atLv120,
  including endless Adventure; reward RNG stays separate from combat RNG.
  Visual stacks independently vary size75-135%, scatter and850-1849ms pickup.
  Any-element Epic/Legendary/Omnic unlock80/100/115 (floors1/18/31), odds grow
  15->85%/6->65%/2->40%, final stacks3-6 each. Each success chooses one
  of the mode's five elements uniformly, never from the other mode. Saved infusionStages defaults
  empty on oldv2 wallets; weaponRank defaults0 and must survive all transactions.
  Existing costs plus5/10 specialty items for4->5/5->6 and1 per Evo5/6 level.
  Weapon upgrading is disabled in menus and transactions. Preserve existing
  ranks and their +2% grown Attack per rank; no refunds/new spending. Stable
  character tab IDs skip upgrade-2, never shift passive/skill IDs.
  Starters are fixed5-star; derive Evo1-6 rarity Common->Omnic from progression.
  Follow docs/roadmap.md active expansion phases, one Standard Banner only.
  See content/infusions.ts/progression.ts. Never auto-grant resources.
- Preserve fractional growth for all seven character stats and skill/passive
  potency in content/combat.ts. Use formatStat only at presentation boundaries,
  never to calculate stats. Keep established combat-outcome rounding separate.
  Zero-base stats stay zero; see docs/units-and-progression.md (D-035).
- Global Inventory separates owned materials and Conduit unlock counts.
  Character > Conduits / Equipment has eight ordinary slots plus a reserved
  Master slot. Equipping saved unlocks applies catalog bonuses to that character,
  no duplicate names per character or consumption. Use shared resolveFighter;
  preserve gear snapshots across battle Continue/replay.
- Battle input uses actAndAdvanceTurn: resolve enemy phases while no living ally
  can legally act; support/Defense count. Recovery retains enemy attacks and all
  effects. Never auto-advance stages. Source art directions live in presentation/
  unit-facing.ts; characters left/enemies right, front poses unchanged.
  Mirror images only and animate sprite wrappers so orientation survives attacks.
  All59 combat sprites were manually re-reviewed;17 directional metadata fixes
  include Tizu2/4/6, Flora4/5, Kappa/Regent and Heaven/Abyss sword/spear stances.
  Cut-ins must share unitFacingAttributes with field art, never flip panels/text.
  Use directional weapon stance for frontal faces, retain truly neutral front art.
- Enemy field labels show name, HP and Defense only (D-040); keep detailed
  mechanics in state/logs, not enemy readouts. Living-unit idle pulse belongs
  on the inner unit-idle wrapper and must respect both reduced-motion settings.
- Visible HP/damage updates occur at impact, not at final turn render (D-041).
  Preserve pre-action HP/shield presentation ledgers and ordered events; all AoE
  targets update together. Health-bar easing is visual only and respects reduced
  motion. Rewards still commit before applying resolved session state.
- Enemy death rewards (D-051) remain atomic per kill, before presentation.
  battle-loot.ts shows only the reward event's actual item stacks/quantity/beams,
  then auto-collects visually. Never add wave-clear grants or a second collection
  transaction. Fade/hide defeated units, keep reduced-motion static receipts,
  action locking and disposal cleanup. Source-aligned pale art masks in
  prepare_art.py preserve Infernis Evo6 feathers without global matte weakening.
- Never invent working commands, test results, credentials, or completed features.
- Do not change unrelated files or overwrite another contributor's work.
- When adding a feature, update its specification, validation guidance, and the
  handoff. Add new documents to the index.
- Record approved consequential decisions in the decision log; unresolved
  questions belong there as open items, not as accepted decisions.

## Completion report

Report what changed, what was verified, what remains unimplemented, and any
owner decisions needed. Include exact commands and outcomes when commands exist.
Use the [handoff template](docs/handoff.md#handoff-update-template) for persistent
state; do not create a second competing status document.
