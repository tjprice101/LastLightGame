# Documentation hub

This folder is the shared reference for the owner, developers, and AI agents.
It is intended to make features easy to locate, extend, and hand off.

## Status vocabulary

**Defense rebalance (D-165):** direct attacks now use attack-relative diminishing
Defense, not flat subtraction. Early Story/Machines/staged Attack corrected;
level120/140 endpoints and rewards/RNG preserved.
[Formula and validation](combat.md#current-defense-balance-d-165).

**Desktop contextual pass (D-166):** actual Back targets, secondary-only Menu,
Title only in Settings with battle confirmation, menu state retained on Settings
close, page scrolling instead of nested desktop panels and reduced-motion-aware
button feedback. [Navigation rules](menus-and-inventory.md#contextual-desktop-navigation-d-166).

**Story and Training (D-164):**150 playable linear stages across six elemental
regions, Lv1-55, four original ordinary identities plus one regional boss each.
Common/Uncommon materials only; exact one-time boss bonuses save atomically
with kills/progression. Existing endless Adventure survives as Training.
Home opens the world map; Story scenery/30 creatures remain neutral art-pending.
[Rules, catalog and validation](story-and-training.md).

**Intrinsic character kits (D-163):** owner clarifies buffs/debuffs/stacks belong
in abilities, not special equipment. Full-roster phased redesign approved;
Infernis/Tizu/Flora now have intrinsic three-stack setup/payoff loops.
Remaining roster redesign is pending; Conduit additions are a separate feature.
[Mechanics, rollout and validation](character-kit-rework.md).

**Phased rework approved (D-160):** safe six-element migration,25 additional
kit Conduits,150-stage Story/retained Training, dungeon Lv38-120 and desktop UI
baseline now approved. Physical Art filing implemented first:77 prompt/record
files relocated, tooling/links updated,1237 source/runtime/provenance files
verified byte-identical. Six-element migration is now live:36 canonical materials,
walletv4 read-only legacy migration, retained randomized enemy families and
dungeonsLv38-120.25 kit-focused Conduits are also live (D-162), for85 total;
Story/Training is now live (D-164); desktop contextual navigation is implemented (D-166).
[Approved baseline and phase status](six-element-rework.md) /
[Organized Art library](../Art/README.md).

**Kit Conduits (D-162):**25 implemented entries (5/8/6/6), fixed modifiers to
attacks/heals/shields/Burn/Weaken/Gauge/cooldowns with exact triggers and bounds.
Existing machine tier totals, stage75 Omnic gate and original five Legendary
banner eligibility remain. All25 icons pending reviewed delivery.
[Catalog/rules/validation](kit-conduits.md) /
[25 copy-ready prompts](../Art/conduits/Kit%20Conduits.md).

**Character palette overhaul (D-159):** all16 lines,115 canonical portraits
and109 character-specific icons/weapons now have individual palette locks and
unwanted-color negatives; exact portrait references retained at150.
No installed-image/gameplay changes. Owner reports Rosetta success; other
generated outputs still need review.
[Policy/validation](art-workflow.md#character-palette-control-d-159-current-policy).

**Rework intake (D-158):** owner wants reference renderer without borrowed
colors/design. Three low-weight enemy alternatives are approved for testing,
not global enemy prompt rollout. D-160 now approves the previously pending
six-element/Story/UI baseline. [Rework plan](six-element-rework.md) /
[Art library](../Art/README.md) / [Pilot](../Art/experiments/Enemy%20Style%20Pilot.md).

**Reference-free enemies (D-155):** both reference URL and weight flags removed
from all129 enemy prompts across18 packs. Written designs/framing and installed
art unchanged; character references retained.
[Current policy](art-workflow.md#reference-free-enemies-d-155-current-policy).

**Machine prompt pilot (D-154):** six enemies receive stronger whole-design
clearance (at most70% footprint/at least15% margins) and lower100 style weight
with authored-palette priority. Other portraits unchanged; generated-image
validation pending. [Workflow](art-workflow.md#machine-enemy-framingpalette-pilot-d-154).

**Six-form enemy references (D-153):**36 portrait prompts across six packs
now use distinct owner-provided Evo.1-6 URLs at400. Character/other enemy
references, non-portrait art, written designs and installed images unchanged.
[Scope and validation](art-workflow.md#six-form-enemy-style-references-d-153).

**Phased expansion (D-151/D-157):**35 new Conduits (5 Common,
10 Rare,10 Legendary,10 Omnic, one new Omnic per element), machine acquisition
rules, four bounded kit pilots and actual debuff labels beside enemy HP.
Common additions are Store-only/usefulness-priced; Rare8%/Legendary3.5%/
Omnic1% tier totals stay fixed and new Legendary entries stay out of banners.
Steel sword sweep/shield and white/black coin prompts are ready; installed
art remains until revised replacements arrive. Runtime batch completion and
exact validation live in the handoff, not a promise made by the prompt packs.
[Phases/catalog](conduit-expansion-plan.md) /
[Universal Action Icons](../Art/ui/Universal%20Action%20Icons.md) /
[Status Icons](../Art/ui/Battle%20Status%20Icons.md) /
[35 Conduit Icons](../Art/conduits/Conduit%20Expansion.md) /
[Currency Coins](../Art/items/Currencies.md).

**Portrait pocket cleanup (D-150):** reviewed all78 character forms; installed
13 individually corrected portraits with78 explicit gap seeds, two bounded
local hair-gap regions and source-specific edge cleanup. No global deletion.
Originals/pre-correction exports and processing history retained; shared URL
revisions refresh color portraits and locked silhouettes.
[Workflow and validation](art-workflow.md#individually-reviewed-portrait-pockets-d-150).

**Starter portraits (D-149):** all18 replacement forms for Infernis, Tizu and
Flora are installed. New originals/previous exports preserved, backgrounds
cleaned offline per source, shared facing/cache identity updated; locked
silhouettes and every shared portrait surface use the replacements. No saves
or gameplay changed.
[Workflow/provenance/validation](art-workflow.md#replacement-starter-portraits-d-149).

**Game-native presentation (D-148):** all browser confirmation boxes replaced
with styled in-game dialogs. Summons, Conduit purchases and restoration now
use a shared animated reveal and saved reward receipt; Skip/Continue/reduced
motion preserve atomic rewards. No OS notifications.
[Foundation](menus-and-inventory.md#in-game-dialogs-and-reward-foundation-d-148) /
[summon flow](summoning-and-economy.md#animated-saved-summon-reveal-d-148).

**Art references (D-147):** only character/enemy portrait prompts retain
`--sref`/`--sw` at400 with the approved evolution mapping. Items, weapons,
ability icons, banners, arenas and all other art use neither flag. Written
design/style and installed images are unchanged.
[Current workflow](art-workflow.md#portrait-only-style-references-d-147).

**Primary-screen copy (D-146):** redundant summaries, prototype labels,
formula dumps and nonfunctional skill-upgrade cards removed from menus.
Decision-critical data stays visible; detailed rules remain in Help/Information.
[Scope and validation](menus-and-inventory.md#primary-screen-copy-cleanup-d-146).

**Elemental War (D-152/D-156): all three challengers playable.** Approved6-star
Nerithe/Orvella/Vaelor have supplied six-form art and16 action/ability icons; three free
ten-stage trials run Lv.90-140, with final-only1% base-form recruitment or
100 Null-Prismatica duplicate conversion. Independent currencies, unlocks and
receipt save atomically. Existing squad/gear/Gauge/progression and summon pools
are preserved. All three headers/arenas are installed; family header, standalone
weapons and Nerithe Normal Attack/Defense icons remain pending.
[Specification](elemental-war.md) / [art packs](../Art/ui/Elemental%20War.md).

**Connected Sanctuary (D-144):** the supplied reference now drives the real
four-item Home/Team/Summon/Play dock, combined Team management, portrait/banner
composition, categorized activity details, live filtered rates/pity, Inventory,
Collections and contextual right-side Help/Menu. Georgia/neutral palette and
all existing saves/actions are retained. This supersedes older no-dock directions,
not battle chrome. [Current contract and validation](menus-and-inventory.md#connected-sanctuary-reference-d-144).

**Portrait rendering (D-140):** all78 character forms use content-versioned
URLs across color portraits, unlock showcases, locked Archives/evolution previews,
field sprites and cut-ins. Locked Archive contours are readable on dark panels.
Stable IDs/ownership unchanged; no new starter artwork delivered.
[Workflow and validation](art-workflow.md#current-portrait-urls-and-locked-silhouettes-d-140).

**Machine endgame (D-139):** [Awaken the Machines](awaken-the-machines.md) now
has100 stages spread across Lv.10-120, Omnic drops from75 and sharply increasing
BMC drops (25% for1 -> guaranteed100 per enemy). Maxing one Omnic Conduit
costs120000 BMC; [cost/drop table](conduit-upgrades.md). Existing saves retained.

**Conduit meters (D-138):** shared five-square icon meters fill shiny white
one level at a time; +5 glows prismatically and shimmers. Reduced motion keeps
a static prismatic finish. Accessible exact levels and mechanics unchanged.
[Presentation and validation](conduit-upgrades.md#menu-and-presentation).

**Component art (D-137):** Broken Mechanical Components supplied icon is
installed across Inventory/upgrades/showcases/loot/results. Original preserved,
teal background removed offline and source/runtime hashes recorded.
[Intake and validation](../Art/items/Broken%20Mechanical%20Components.md#supplied-artwork-intake-d-137).

**Conduit costs (D-136):** [upgrade costs](conduit-upgrades.md) now scale by rarity:
Common1x, Rare2x, Legendary4x, Omnic200x after D-139. Shared pricing covers menus/confirmations/
spending; existing upgrades are preserved without retroactive charges.

**Future framing (D-135):** all character evolutions/enemy forms require
strong explicit complete-design containment and continuous visible margins
on every side/corner. Pull back composition, never simplify the art or reduce
its powers/detail. Containment overrides historical near-edge targets for
future prompts; existing blocks/assets and full-bleed scenery are unchanged.
[Framing contract](../Art/guides/cutout-background-contract.md#complete-silhouettes-and-edge-clearance-d-135) /
[review workflow](art-workflow.md#future-edge-safe-composition-without-lost-detail-d-135).

**Current character art (D-134):**60 replacement portraits installed for all
six forms of ten non-starter Element-Bearers. Per-source background cleanup,
new facing and shared runtime IDs serve every existing portrait surface.
New originals and previous exports preserved; root copies relocated only after
hash verification. Starters and other asset types unchanged.
[Workflow and validation](art-workflow.md#replacement-character-portraits-d-134) /
[provenance](../Art/provenance/character-refresh-intake.json).

**Currency names (D-133):** main **Prismatica**, premium **Null-Prismatica**
across visible UI/errors/accessibility/rewards/docs. Legacy keys/filenames,
balances and economics unchanged. New bright/dark prism prompts use Evo.3;
both supplied crystal replacements are now installed/reviewed (D-142).
[Economy compatibility](summoning-and-economy.md#currency-names-and-legacy-compatibility-d-133) /
[art prompts](../Art/items/Currencies.md).

**Enemy references (D-132):**129 enemy prompts include owner-supplied mapped
style suffixes; all226 character/enemy full-body blocks explicitly prohibit
edge contact. No enemy design/background/runtime changes.
[Mapping](../Art/guides/midjourney-character-style-prompt.md#character-form-style-references) /
[workflow](art-workflow.md#enemy-style-references-and-edge-containment-d-132).

**Portrait prompts (D-131):** all78 canonical Element-Bearer evolution prompts
now share Bliss/Rose-banner construction, progressive ensemble spread and
dense power-first finales around unchanged compact anatomy. Nine late-form
guide examples also align. Supplied artwork/gameplay and other prompt types
are unchanged; generated output still requires visual review.
[Contract](../Art/guides/midjourney-character-style-prompt.md#portrait-quality-standard-d-131) /
[workflow](art-workflow.md#character-portrait-quality-d-131).

**Conduit upgrades (D-130):** [five-step account-wide restoration](conduit-upgrades.md)
uses new Broken Mechanical Components from stage-scaled machine drops. Stat
modifiers and penalties end at3.5x; Omnic mechanics unchanged. Menu, icon levels,
atomic saves and run snapshots are integrated. [Currency prompt](../Art/items/Broken%20Mechanical%20Components.md)
is ready; runtime honestly marks its artwork pending.

**Character prompts (D-129):**97 character-form/template blocks now include
exact owner-supplied evolution-specific `--sref`/`--sw 400` suffixes.
Other prompt types and supplied/runtime art are unchanged.
[Mapping and validation](../Art/guides/midjourney-character-style-prompt.md#character-form-style-references) /
[workflow](art-workflow.md#character-form-style-references-d-129).

**Current art (D-128):** all28 supplied Awaken the Machines images installed:
20 transparent Conduit icons, six transparent enemies and untouched header/arena.
Originals archived with reviewed keys/facing and reproducible hashes.
[Contract](awaken-the-machines.md#art-menus-and-integration) /
[workflow](art-workflow.md#machine-expansion-art-d-124d-128) /
[provenance](../Art/provenance/machines-art-intake.json).

**Completed UI (D-127):** game-wide visible separators use spaced ` ~ `; joined
words/numbers corrected, including "35 stages ~ Enemy levels 80-140".
[Contract](menus-and-inventory.md#visible-separators-and-spacing-d-127) /
[handoff](handoff.md#current-task-visible-separators-and-copy-spacing-d-127).

**Completed UI (D-126):** each Home banner/selected Summon panel has a Showcase
button opening real5/6-star base-form portraits, names and element medallions.
[Contract](menus-and-inventory.md#current-navigation-and-presentation-d-080) /
[handoff](handoff.md#current-task-base-form-banner-showcase-d-126).

**Completed UI (D-125):** Home's special tile uses the Roses Under Sunny Skies
artwork/name and "Special Limited Time Banner!" copy, opening that summon banner
directly. [Contract](menus-and-inventory.md#current-navigation-and-presentation-d-080)
/ [handoff](handoff.md#current-task-home-special-banner-promotion-d-125).

**Completed (D-124):** [Awaken the Machines](awaken-the-machines.md), expanded
Conduits and [28 art prompts](../Art/creatures/Awaken%20the%20Machines.md). Now100 stages (D-139),
five Rare/five Legendary/ten element-matched Omnic items, real combat mechanics,
independent enemy loot and atomic Legendary banner bonuses. Supplied art installed
under D-128.
Rosetta stays unchanged at the owner's follow-up request.

**Completed UI (D-123):** Sanctuary-reference Inventory and right-side Menu revamp,
using neutral colors, real artwork, exact holdings and all existing destinations.
See [UI contract and validation](menus-and-inventory.md#inventory-and-right-side-menu-revamp-d-123)
and [handoff](handoff.md#current-task-inventory-and-right-side-menu-revamp-d-123).

**Completed intake (D-121):** phased135-image roster/event intake. Phase1 installs
51 Roses assets and84 flagship images are installed with archived originals;
all seven flagships are playable through approved Standard tiers.
See [flagship specification and validation](flagship-characters.md),
[phase handoff](handoff.md#current-task-phased-supplied-rosterevent-art-intake-d-121),
[intake workflow](art-workflow.md#phased-rosterevent-delivery-d-121) and
[Roses provenance](../Art/provenance/roses-art-intake.json). All eight phases now cover135
assets; the handoff records final validation and the existing prompt-test caveat.

- **Confirmed:** explicitly requested by the owner or present in existing source material.
- **Proposed:** a starting design for review; not approval to implement it.
- **Open:** a decision is still needed.
- **Implemented:** present in code and verified; include implementation and test links.

The title, fire/water/grass selection, local save, navigation, readable prologue, motion/
hotkey settings, and Adventure with the saved squad are implemented.
All ten elemental material dungeons, saved material inventory, leveling, evolution,
Prismatica spending and a one-time +10 Null-Prismatica first-Fracture reward are implemented.
Owned rosters and three-member mixed squads are implemented. Phase8 adds
Heaven/Abyss Null-Prismatica drops. Phase9 adds Crownfall Treasury, protected-safe slime
sales and active10-Null-Prismatica Standard draws with200/500 pity and Lv50 Omnic
duplicate-EB slime rewards. See [Treasury](crownfall-treasury.md).
Phase10 adds [Rosethorn Sanctuary](rosethorn-sanctuary.md):25 floors65-120,
Null-Prismatica farming, six divine wisp forms and protected-safe dual-currency sales.
Its first three forms expand Standard to15 real outcomes; Character Archive
contains42 EB evolution/creature form entries.
Phase11 verifies cross-system economy and save behavior and run snapshots across
all15 activity destinations. Phase12 completes integration of36 owner-supplied
root images:27 keyed RGB cutouts/icons and nine scenery images copied unchanged.
See the [roadmap](roadmap.md), [art workflow](art-workflow.md),
[intake manifest](../Art/provenance/root-art-intake.json) and [handoff](handoff.md) for
provenance, registration and validation.
The owner-approved sanctuary revision separates Inventory holdings, Stores and
Collections, adds selectable Character categories and uses consistent sans-serif
UI with optional centered Information dialogs. Max Level previews cumulative
affordable leveling and commits only after confirmation. Summon has a banner
selector backed by authored registrations; only Standard is available today.
D-083 replaces native dropdowns with styled centered choice panels and moves
repeated rules into shared menu Information; unique costs, kits and loot remain.
D-084 adds actual associated currency/material PNG showcases to activity cards
and cost/sale previews; no reward, discovery or transaction changes.
D-085 integrates the16 supplied Lustrous River images: preserved originals,
reviewed cutout cleanup, six Luminous materials and right-facing battle sprites.
See [Lustrous intake](art-workflow.md#lustrous-river-intake-d-085).
D-086 integrates all16 Precipice of the Earth images with reviewed backgrounds,
protected mineral/crystal artwork and shared Tectonic content registration.
See [Precipice intake](art-workflow.md#precipice-of-the-earth-intake-d-086).
D-087 integrates all16 Ruins of Chaos images with reviewed enclosed-gap cleanup,
preserved prism colors and shared field/skill-cut-in facing.
See [Chaos intake](art-workflow.md#ruins-of-chaos-intake-d-087).
D-088 integrates all16 Sky-bound Rift images with reviewed magenta/cyan
background cleanup, protected feather/ribbon artwork and battle-facing metadata.
See [Sky-bound intake](art-workflow.md#sky-bound-rift-intake-d-088).
D-089 integrates all16 Valley of Solitude images with reviewed green/teal
background cleanup, clear enclosed gaps and shared battle/cut-in facing.
See [Valley intake](art-workflow.md#valley-of-solitude-intake-d-089).
D-090 follows the owner's Sanctuary mock-up screen composition with current
content: side-banner/portrait/squad Home, rail/detail Gameplay, portrait/control
Character, artwork/draw Summon, heading-save Squad and gallery/banner/grid
Collections. Linked menus retain all functions and Information access; the
current palette, sans-serif typography and no-bottom-bar preference remain.
D-091 subsequently restores the owner's selected Georgia font globally, with
bolder ordinary text/controls and bold headings, including battle and dialogs.
D-092 replaces fixed Home shortcuts with caller-based Back, retaining valid
menu selections; battle exits return to their entry screen. Conduit icons are
larger and omit repeated recovery labels, retaining catalog details and controls.
See [traversal contract](menus-and-inventory.md#traversal-and-conduit-artwork-d-092).
D-093 tightens desktop proportions, heading placement, Character control panels,
Conduit slot grid, activity hero and Squad/Summon layouts using the owner's nine
screenshots, without adopting mock-only mechanics or restoring the bottom dock.
See [screenshot layout](menus-and-inventory.md#screenshot-layout-refinement-d-093).
D-095 adds unique neutral geometric background patterns, slow rings/particle
motion and static dialog textures. Battle keeps its arena with sparse motes;
both reduced-motion settings disable ambient animation.
See [dynamic backgrounds](menus-and-inventory.md#dynamic-screen-backgrounds-d-095).
D-096 removes redundant Silhouette/Art/Loot rendering suffixes and repeated
Fixed form copy labels; ownership, discovery, preview and error states remain.
See [concise wording](menus-and-inventory.md#concise-status-wording-d-096).
D-097 adds semantic green/red stat-change and resource-affordability emphasis
while retaining exact numbers and non-color cues.
See [stat colors](menus-and-inventory.md#semantic-stat-and-resource-colors-d-097).
See [layout contract](menus-and-inventory.md#sanctuary-mock-up-composition-d-090).
See [banner selection](summoning-and-economy.md#banner-selection-d-082) and
[menu layout and validation](menus-and-inventory.md#current-navigation-and-presentation-d-080).
The Conduit Store sells five Common ancient-war mechanisms; per-character
equipment applies their buffs across every battle mode. Weapon spending is
disabled; existing bonuses persist.
Heaven/Abyss20% captures, retained kits, mixed/all-captured squads, independent
copy levels/Conduits and protection are implemented. Phase7 protected-safe
creature infusion supplements evolution costs. Separate skill upgrades and
further currency modes remain deferred.
Unified Archives contain Character, Conduit and discovery-gated Creature
galleries. All existing enemies have explicit visible elemental typing.
All ten elemental dungeon art packs are supplied and integrated.
Both infusion modes are playable.

## Find the right document

[Neutral character wording](art-workflow.md#neutral-character-prompt-wording-d-104)
covers all character packs/shared generation examples, including negative lists.
Local wording checks reduce avoidable ambiguity; they cannot guarantee service
acceptance and do not advance individual visual-review phases.

[Character-by-character correction](art-workflow.md#character-by-character-correction-d-101)
tracks the owner's D-101 review gate: Atmoso and Aurora directions accepted,
Bliss's pack strengthened after the owner's base/final comparison. Owner then
rejected Bruno's subsequent body/scale transformation and restored the compact
Bliss-style approach (D-109), superseding D-107/D-108. Bruno keeps the same
anatomy throughout, with epic armor/hammer/wings/regalia. Owner next requested
Disciple's matching stylized progression (D-110); his13 prompts are revised
with psychic armor/mantle/wings/nested frames. Owner next requested Elise
(D-111):13 prompts revised with lightning armor, circuit-collared four-point
stars and retained final architecture. Owner next requested Razor (D-112):
13 prompts revised with bastion armor, crescent shield vanes and one pure-night
sword, retaining and expanding Legendary's architecture. D-113 next promotes
all three Roses EBs to6-star, equally sharing1.1% total; all three enter pity.
Rosetta's13 prompts are Phase8, restored under D-114 to compact Bliss/Bruno
anatomy throughout, eyes-only anime rendering and amplified multi-winged rose
regalia/effects. Pause for Rosetta review.
D-115 makes her Legendary/Omnic chromatically richer near-full-canvas
wing/bow/effect ensembles, not larger anatomy; keyed margins remain.
D-117 next revises Thornia's13 prompts with compact anatomy, escalating elegant
thorn/eclipses, ornate greatsword/armor and near-full-canvas late compositions.
Thornia was the Phase9 review target.
D-118/D-119 subsequently revise Roselius/six Rosethorn materials and Crinso:
distinct rose-angel/collectible/flame-lightning designs, same compact renderer
and increasingly wild/elegant architecture. Pause for those latest packs'
review; all requested rose lines now revised. Scenery/gameplay unchanged.
D-120 next refines Rosetta Omnic's dense rear energy/rose-thorn tapestry,
not just its outer span, preserving readable face/bow and the renderer.
Pause for Rosetta Omnic review; other prompts/gameplay unchanged.
Structural checks do not mean generated artwork is approved.

[Crimson Roses](crimson-roses.md) is the D-100 playable event/special banner:
35 stages80-140, capturable Roselius only through enemy Lv.120, six Rosethorn
materials, protected material sales and Rosetta/Thornia/Crinso's real six-form
kits. Separate10-Null-Prismatica special draws,6-star pity and Lv.80 Omnic Roselius
duplicates preserve Standard's pool and conversion. Its54 art prompts are
generation-ready; supplied artwork remains pending.

D-099 strengthens all42 flagship character prompts and7 final weapon/focus
prompts: simple bases, full-body prism armor, layered elemental wings, swirling
powers and ornate equipment. See the
[escalation workflow](art-workflow.md#full-body-prism-and-elemental-wing-escalation-d-099).

D-098 establishes evolution-specific **Prefix, Character name** across character
displays and art form headings; stable identities/IDs and creature names remain.
See [character naming](units-and-progression.md#global-character-display-names-d-098).

| Document | Use it for |
| --- | --- |
| [Game vision](game-vision.md) | Product direction, design pillars, scope boundaries |
| [Opening flow](opening-flow.md) | Title, starter selection, menu, local save, placeholder art |
| [Menus and inventory](menus-and-inventory.md) | Fire-only roster, currencies, upgrades, 8+1 equipment, settings/story/events |
| [Combat](combat.md) | Battle flow, actions, damage, effects, combat tests |
| [Adventure](free-battle.md) | Fresh wave-1 runs, linear enemy levels/stats, all starter kits, recovery, hotkeys |
| [Gameplay and elements](gameplay-and-elements.md) | Grouped activity tab, ten elements/dungeons, level 10-120 curve, materials, infusion modes and evolution recipes |
| [Dungeons and captures](dungeons-and-captures.md) | Mode eligibility,20% atomic captures, retained kits, fixed-form stats/ratings and art reuse |
| [Flaming Depths stages](flaming-depths-stages.md) | Historical Stage 1-50 encounter/skill proposal; old levels/stats superseded by elemental framework |
| [Units and progression](units-and-progression.md) | Unit identity, roster, leveling, evolution, duplicates |
| [Character instances](character-instances.md) | Independent copies, locks, levels/Conduits, run snapshots and legacy save compatibility |
| [Evolution creature infusion](evolution-fodder.md) | Exact fodder counts/forms/mode mapping, protected-copy selection and atomic consumption |
| [Conduits and store](conduits.md) | Ancient-war mechanisms, catalog, Prismatica purchases, ownership and equipment scope |
| [Archives and enemy elements](archives-and-elements.md) | Unified galleries, discovery locks, confirmed enemy typing and separate loot routing |
| [Summoning and economy](summoning-and-economy.md) | Banners, odds, pity, currencies, reward transactions |
| [Crimson Roses event and special banner](crimson-roses.md) | Lv.80-140 Roselius, capture ceiling, materials/sales, three EBs, banner odds/pity and art |
| [Content guide](content-guide.md) | Adding units, skills, enemies, quests, and banners |
| [Technical architecture](technical-architecture.md) | Stack decisions, module boundaries, saves, online services |
| [Art workflow](art-workflow.md) | Existing visual direction, asset intake, provenance |
| [Development guide](development-guide.md) | Setup status, feature workflow, testing, definition of done |
| [Roadmap](roadmap.md) | Proposed implementation sequence and completion gates |
| [Decisions](decisions.md) | Confirmed direction, pending choices, decision template |
| [Handoff](handoff.md) | Current workspace state, next action, contributor handoff |

Also see the root [AI instructions](../AGENTS.md) and the existing
[art prompt guide](../Art/guides/midjourney-character-style-prompt.md).
The [Archive banner prompts](../Art/ui/Archives.md) and
[element medallions](../Art/ui/Element%20Emblems.md) cover Phase4 galleries and
all ten canonical elements; supplied images are registered and tracked in the
[root art manifest](../Art/provenance/root-art-intake.json).
The [Starter Art prompts](../Art/characters/Starter%20Art.md) cover the new base-form trio
and three basic mythological enemies in the same style.
The [flagship manifest](../Art/characters/Flagship%20Characters.md) links the seven other
elements' new packs: [Bruno](../Art/characters/Bruno%20Art.md),
[Elise](../Art/characters/Elise%20Art.md), [Aurora](../Art/characters/Aurora%20Art.md),
[Atmoso](../Art/characters/Atmoso%20Art.md), [Razor](../Art/characters/Razor%20Art.md),
[Bliss](../Art/characters/Bliss%20Art.md) and [Disciple](../Art/characters/Disciple%20Art.md).
Each has six forms, six ability/action icons and one weapon/focus prompt.
All finish fully prismatic-armored; four6-star lines have exceptional final
silhouettes. These91 prompts do not add live characters or change banner odds.
The [Battle Scenery prompt](../Art/ui/Battle%20Scenery.md) covers a cutesy grassy
field for the intended solo opening battle.
The [Flaming Depths prompts](../Art/creatures/Flaming%20Depths.md) cover ten dungeon enemies
in ascending visual power, from a soot sprite to a flame sovereign.
The [Infernis Art prompts](../Art/characters/Infernis%20Art.md) include five new greatsword
evolution stages with increasingly chromatic heavenly flames and ornate armor,
plus 1:1 ability icons (Heavy is archived).
The [Tizu Art prompts](../Art/characters/Tizu%20Art.md) and
[Flora Art prompts](../Art/characters/Flora%20Art.md) provide five new stages each:
celestial tidal spear armor and angelic leaf-wing bow regalia. Both files also
include six 1:1 ability/action icon prompts: Passive, Skill1, Skill2, Last Flare,
Normal and Defense. Those icons have not been generated or supplied yet.
All 15 evolved portraits are supplied and integrated into six gameplay forms,
with caps 30 / 45 / 60 / 75 / 90 / 105. See D-033.
The [Flaming Depths Scenery prompts](../Art/ui/Flaming%20Depths%20Scenery.md) cover
a 3:1 selection banner and 16:9 battle background with destination-specific framing.
The [elemental dungeon art packs](../Art/creatures/dungeons/README.md) provide a separate
file for each of the ten dungeons: eight ascending-power monsters, six material
icons from Seed to Soul of its element, a 3:1 banner and a 16:9 arena background.
Suggested encounter bands and drop pools are art proposals, not implemented rules.

## Common tasks

- **Add a character:** [content guide](content-guide.md#adding-a-unit) ->
  [units](units-and-progression.md) -> [art](art-workflow.md).
- **Add a skill or combat mechanic:** [combat](combat.md) ->
  [content guide](content-guide.md#adding-a-skill-or-effect).
- **Add a summon banner:** [economy](summoning-and-economy.md) ->
  [content guide](content-guide.md#adding-a-banner).
- **Pick up development:** [handoff](handoff.md) ->
  [roadmap](roadmap.md) -> [development guide](development-guide.md).
- **Change an important rule:** [decisions](decisions.md), then the affected
  system specification and its tests.

## Documentation maintenance

Keep each rule in one owning document and link to it elsewhere. Update documents
in the same change as related implementation. Replace open questions with approved
rules and decision references rather than leaving conflicting alternatives.
When code exists, add exact file, symbol, schema, and test links to these pages.
Do not invent those links ahead of implementation.
