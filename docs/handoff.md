# Current state and handoff

## Current:150-stage Story / retained Training implemented (D-164)

Updated by Copilot after the owner asks to defer remaining intrinsic character
redesign and continue the next major phase.
[Campaign contract/catalog/validation](story-and-training.md).

**Confirmed requirements:** D-160's six25-stage linear elemental regions,
globalLv1-55, four ordinary identities and regional boss25 each, Common/
Uncommon matching materials only, existing endless Adventure retained as
Training, first regional bonus1,000 Prismatica /50 Null-Prismatica growing15%.
No new owner decisions were needed; lore/names/easier stats/drop curves are
developer tuning within the scope.

**Changes and implemented behavior:**

- Home opens the Story world map. Six connected region controls, one25-stage
  panel at a time, locked-stage gating, exact level/cleared/current labels,
  first-clear rewards and retained prologue. Gameplay defaults to Story and
  offers endless Training separately. Training keeps old engine/art/discovery
  IDs and the `#gameplay-adventure` category alias.
-150 stages, canonical order,30 original creatures registered in discovery
  Collections. Two independently uniformly sampled ordinary enemies per
  stage; one regional boss every25. Independent continuing encounter RNG;
  shared enemy growth/skill helpers with easier Story stat envelope.
  Story creatures/scenery are neutral art-pending, not borrowed/missing PNGs.
- Guaranteed Common materials; Uncommon starts at enemyLv23. No higher
  materials/specialties/captures/Conduits/components/recruitments in Story.
  Ordinary per-kill currency remains level-scaled.
- Optional walletv4 storyCompleted0-150 defaults0 read-only. Validated
  discovery/kill materials/currency/receipts/unlock save together. Partial
  kills retain rewards; full clear needs all enemy receipts. First regional
  bonuses use that last kill's atomic write and exact compound15% whole-unit
  rounding:1,000/1,150/1,323/1,521/1,749/2,011 Prismatica and
  50/58/66/76/87/101 premium. Replay never repeats premium.
  Actual events are decorated only after successful save; failed writes/
  overflow preserve raw wallet and bonus eligibility.
- Continue crosses regions manually with full HP and independent Gauges,
  frozen mixed/all-captured squads/progress/gear/upgrades/kits. Retry preserves
  snapshots with fresh run receipt IDs; Settings keeps the run; stage150 has
  no Continue. Results/loot show actual saved bonuses, never extra claims.

**Verification and outcomes:**

- `npm test -- --maxWorkers=2`:88 files /1,316 tests passed. New campaign
  tests clear all150 stages with exactly150 writes /294 kill receipts,
  six bonuses totaling8,754 bonus Prismatica /438 premium, plus independent
  source/pool/overflow/retry/replay/read-only/snapshot/UI checks.
- Targeted Story/discovery/results/navigation/copy run:
  `npm test -- src\game\story.test.ts src\content\creatures.test.ts src\presentation\battle-results.test.ts src\presentation\sanctuary.test.ts src\presentation\activity-banner.test.ts src\presentation\ui-copy.test.ts --maxWorkers=2`
  passed6 files /45 tests before the final full-campaign test addition.
- Build Last Light task (`npm run build`): TypeScript/Vite passed;
  existing >500kB bundle advisory remains. Edited Story/core files have no
  editor diagnostics.
- Final constant/source-of-truth cleanup:
  `npm test -- src\game\story.test.ts src\presentation\hub.test.ts src\presentation\battle-chrome.test.ts --maxWorkers=2`
  passed3 files /70 tests; production build passed again.
  `git diff --check`: passed.
- Disposable browser contexts: six map regions/150 controls/149 initially
  disabled; actual first ordinary kill saved currency/materials before clear;
  final kill set completed1, manual Continue entered2. First regional boss
  changed100->1,106 Prismatica and0->50 premium; replay changed1,106->1,112
  and retained50 premium, with actual results showing only6 ordinary currency.
  Continue entered Oceanic/Glasswater stage26; reload reopened Oceanic with26
  enabled. Training still starts wave1. Zero page errors in successful checks;
  finite presentation animations were finished explicitly by the harness.
  All disposable contexts closed; owner wallet compared byte-identical.
- No art prompts/images changed, so Python art suites were not rerun.
  Existing28 Machines prompt-policy baseline failures remain historical.

**Adjacent kit scope correction (D-163):** owner clarifies buffs/debuffs/stacks
mean intrinsic passives/abilities, selects full roster in starter-first batches.
Before the redirect, implemented Infernis dual Ember spenders/ultimate Burn,
Tizu absorption-built Tide with Weaken/shield choices, Flora healing-built Bloom
with offensive/healing choices and Renewal team buff. Three-stack caps,
no equipment prerequisite, field counters/resolved descriptions and tests.
`npm test -- src\game\starter-kits.test.ts src\game\kit-pilots.test.ts src\game\kit-conduits.test.ts src\game\machines.test.ts src\presentation\unit-readout.test.ts src\presentation\ui-copy.test.ts src\content\combat.test.ts --maxWorkers=2`
passed7 files /116 tests; final full suite also covers them.
[Intrinsic kit specification](character-kit-rework.md).
Remaining roster redesign is explicitly paused, not completed. Existing
25 Conduits remain separate and do not fulfill this corrected request.

**Remaining implementation / next work:** broader desktop contextual
navigation/animation overhaul; remaining intrinsic roster kits later per owner.
Story art,25 Conduit icons and universal action/currency replacement images
await reviewed delivery. Physical archival/removal of unused retired exports
remains pending; original bytes/merged enemies are preserved. Previous isolated
Conduit purchase/equip browser check remains incomplete. No commit/deployment.

## Previous milestone:25 kit-focused Conduits implemented (D-160/D-162)

Updated by Copilot after the owner's continuation. Current phase: approved
Conduit expansion implemented and regression/build verified.
[Catalog, timing and validation](kit-conduits.md) /
[Approved phase table](six-element-rework.md).

**Confirmed requirements:**25 further kit-focused designs, distributed
5 Common /8 Rare /6 Legendary /6 Omnic, including one Omnic per canonical
element. Individual prices/coefficients are developer tuning within the
approved scope. No further owner decisions were needed.

**Changes and implemented behavior:**

- Catalog now85:15 Common /23 Rare /21 Legendary /26 Omnic. Five new
  Common purchases reuse the existing confirmation/atomic Store path.
  Machine totals remain8%/3.5%/1%, with the existing stage75 Omnic gate;
  names split each successful tier equally. The original five Legendary
  banner-bonus names remain the only eligible names.
- Typed shared kit rules enhance authored damage/healing/shields/Burn/Weaken,
  Gauge and cooldowns with explicit caps, actual-event triggers and no new
  RNG. Conditional bonuses inspect pre-hit statuses; healing/shield procs
  require real increases. No missing abilities, revival or recovery bypass.
  Equipment is snapshotted; Graft/Storm transient guards reset per encounter.
  Upgrades scale stats only, not fixed kit rules.
- Character details and Battle reference list equipped fixed rules and explain
  authored-base descriptions. Pending Graft appears in detailed allied
  reference, not the compact field. Shared ownership, gear, upgrades and
  atomic reward paths recognize every registered ID without free grants.
- Added25 original art designs and reproducible reference-free, individually
  palette-controlled [icon prompts](../Art/conduits/Kit%20Conduits.md).
  All25 icons remain pending; no source/runtime imagery was replaced and
  no nonexistent asset URLs are requested.

**Verification and outcomes:**

- `npm test -- --maxWorkers=2`:86 files /1,282 tests passed, including the
  final captured-skill and rejected-action boundary tests.
- `npm test -- src\game\kit-conduits.test.ts --maxWorkers=2`:38 dedicated
  tests passed. Captured skills receive supported bonuses without inventing
  slots/statuses; rejected Gauge/cooldown actions preserve input and charges.
- Build Last Light task (`npm run build`): TypeScript/Vite passed; existing
  >500kB bundle advisory remains.
- `python tools\build_kit_conduit_art.py`: generated the25-prompt pack.
  `python -m unittest discover -s tools -p test_kit_conduit_art.py`:2 passed.
  `python -m unittest discover -s tools -p test_conduit_expansion_art.py`:1 passed.
  `python -m unittest discover -s tools -p test_art_prompts.py`:28 pre-existing
  Machines prompt failures remain; the shared art suite is not green.
- Disposable Playwright context verified15 Store purchase entries, new
  effect text/neutral artwork and the Pulse Trigger Pawl confirmation.
  End-to-end purchase/equip/action verification remains incomplete: isolated
  context pointer/confirmation automation did not finish. Do not claim a
  successful browser transaction or21-Gauge action from these attempts.
  All disposable contexts closed; the owner's storage was not modified.
- `git diff --check`: passed; ordinary line-ending advisories only.

**Remaining implementation / next work:**150-stage Story/retained Training,
then desktop flow/animation overhaul. Complete the isolated browser
purchase/equip/action check when dialog automation is available. New Conduit
icons, universal action/currency replacement imagery await reviewed delivery.
Physical archival/removal of unused retired emblem/material/scenery exports
remains pending; originals and merged enemies are preserved.
No commit or deployment performed.

## Previous milestone: six-element runtime migration complete (D-160/D-161)

Updated by Copilot after the owner's continuation. Current phase: six-element
content/save/encounter migration and dungeon entry rebalance verified.
[Approved phase table and exact contract](six-element-rework.md).

**Confirmed requirements:** resume the approved phases; preserve original
art/copies/progress/gear/discoveries, merge materials/unlocks safely, retain
related enemy diversity, use six canonical elements and dungeonLv38-120.
No additional owner decisions were required for this phase.

**Changes and implemented behavior:**

- Infernic/Oceanic/Atmospheric/Botanic/Tranquilitic/Chaotic throughout characters,
  creatures,36 materials, Conduit eligibility, recipes/fodder, labels/Archives
  and six dungeon entries. Heaven has4 affinities; Abyss2; total rarity odds
  unchanged. Rose EBs retain their event recipe override.
- Walletv4 normalizesv1/v2/v3 read-only. Legacy material balances sum with
  overflow/corrupt-key rejection before writes; merged dungeon unlocks use the
  highest equivalent completed level, preserving initial/final floors.
  Only a successful ordinary transaction persists once. Retry cannot
  double-merge; captured UUIDs, stable IDs, gear/ranks, pity and receipts survive.
-35 dungeon floors nowLv38-120; final stats/material gates/drop endpoints
  unchanged. All82 original dungeon forms retain their old discovery IDs/art.
  Related same-tier families are chosen uniformly per enemy with a separate
  encounter RNG stream that continues across stages independently of combat
  rolls. No new loot/captures/premium grants or damage multipliers.
- Added [migration regression tests](../src/game/element-migration.test.ts);
  corrected affected fixtures to select original Conduit/character identities
  explicitly rather than ambiguous first matches after element merges.

**Verification and outcomes:**

- `npx tsc --noEmit`: passed. Edited core files also have no editor diagnostics.
- `npm test -- --maxWorkers=2`:85 files /1,194 tests passed.
- Final affected run after canonical currency/event eyebrow cleanup:
  `npm test -- src\content\activities.test.ts src\content\dungeons.test.ts src\content\dungeon-art.test.ts src\content\creatures.test.ts src\content\infusions.test.ts src\game\element-migration.test.ts src\game\account.test.ts src\game\machines.test.ts src\game\integrated-economy.test.ts src\presentation\archives.test.ts src\presentation\sanctuary.test.ts src\game\crimson-roses.test.ts --maxWorkers=2`
  passed12 files /242 tests.
- Build Last Light task (`npm run build`): TypeScript/Vite passed; existing
  >500kB bundle advisory remains.
- Isolated Playwright browser context: all six dungeon entries appeared;
  menu visits left the legacyv3 wallet byte-identical. Entering Garden of Beauty
  spawned retained Pebblekin art/identity atLv38 with Botanic typing and wrotev4
  discovery plus normalized materials (7 nature +9 earth =16 Botanic) together.
  Zero page errors; disposable context closed; owner's storage untouched.
- `git diff --check`: passed; ordinary line-ending advisories only.
  No art prompts/images changed in this runtime phase, so Python art suites
  were not rerun; their previously recorded baseline failures remain historical.

**Remaining implementation / next work:**25 kit-focused Conduits (5/8/6/6),
150-stage Story/Training split with first-clear regional bosses, then desktop
flow/animation overhaul. Physical archival/removal of unused retired
emblem/material/scenery exports remains pending; original source bytes and all
enemy artwork are intentionally preserved. Universal action/currency replacement
images still await delivery. No commit or deployment performed.

## Previous milestone: approved rework; physical Art organization complete (D-160)

Updated2026-10-08 by Copilot. Current phase: physical Art filing complete;
six-element transaction/content migration is next.

**Confirmed requirements used:** owner asks to resume the larger additions and
explicitly selects **Approve this baseline and implement in phases**. The safe
archival/material-unlock migration, six-element mapping, infusion pools,
25-Conduit split/acquisition,150-stage Story with retained endless Training,
first-clear regional bonuses, dungeon Lv38-120 and desktop contextual-navigation
baseline are now approved, not still waiting for the old questionnaire.
[Approved rules and phase table](six-element-rework.md).

**Changes and implemented behavior:** physically moved77 files:37 flat prompt
packs into character/creature/Conduit/item/UI/guide categories,14 dungeon/infusion
Markdown files under creatures,26 byte-preserved JSON provenance/settings/reviews
under `Art/provenance`. Complete mixed packs stay intact. Only README remains at
the Art root; experiments/source collections stay separate.
[Art library](../Art/README.md) /
[filing/path helper](../tools/art_library.py) /
[filing regression tests](../tools/test_art_library.py).

Updated Markdown links, generators, intake/export/review callers, prompt tests
and three TypeScript metadata fixtures. Generators reproduce the moved packs,
not obsolete root copies. Caller-root arguments preserve temporary-root
isolation; apply-only provenance writes create their new parent directories.
No load writes, image processing, source deletion or runtime UI/combat changes.
The one-time filing tool verified1237 source/runtime/provenance files
byte-identical; source/runtime paths and recorded hashes were not rewritten.

**Validation:**

- `python tools\organize_art_library.py`:77 files moved,117 text files updated;
 1237 source/runtime/provenance files verified byte-identical. One-time tool
 now fails preflight instead of overwriting an already-organized tree.
- `python tools\build_elemental_war_art.py`,
  `python tools\build_conduit_expansion_art.py`,
  `python tools\build_status_art.py`: regenerated moved outputs successfully.
- `$env:PYTHONPATH='tools'; python -m unittest test_art_library test_character_palettes test_character_style_references test_elemental_war_art test_enemy_style_pilot test_enemy_style_references test_conduit_expansion_art test_status_art_prompts test_currency_art_prompts test_universal_action_prompts`:
  **32 tests passed**, including every Art-local link, exact portrait references,
  palette coverage, reproduction, no flat duplicates and caller-root isolation.
- `$env:PYTHONPATH='tools'; python -m unittest test_art_library test_root_art_intake.RootArtIntakeTests.test_regeneration_rejects_unrecorded_changes_before_writing test_machine_art_intake.MachineArtIntakeTests.test_cleanup_requires_apply_and_refuses_conflicts_before_any_changes test_elemental_war_intake`:
  **14 tests passed**, including temporary-root first-time writes/conflict
  rejection and actual Elemental War source/export hash verification.
- `npm test -- src\presentation\art.test.ts src\presentation\machine-art.test.ts src\presentation\unit-facing.test.ts --maxWorkers=2`:
  **3 files/89 tests passed**. Editor test discovery returned no tests, so the
  established Vitest CLI was used.
- VS Code **Build Last Light** task (`npm run build`): TypeScript/Vite passed;
  existing large-bundle warning remains.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 tests run,28 unchanged Machines subtest failures**; no new filing or
  character failures. Earlier broad Python discovery was stopped while correcting
  caller-root isolation; targeted reruns above passed, no full-suite claim.
- `git -c core.safecrlf=false --no-pager diff --check`: passed. Editor diagnostics
  for library/refactor/intake helpers and changed TypeScript fixtures: no errors.
- Final combined rerun of the32 filing/prompt tests plus the two temporary-root
  root/machine conflict tests: **34 passed**; `python -m compileall -q tools`
  passed. Temporary test logs removed; no runtime/source images generated.

**Still unimplemented / next concrete action:** implement the six-element
migration as one coherent runtime phase: canonical types/emblems, material
balances/unlocks, recipes/fodder/Conduit restrictions, characters/captures,
Archives/drop tables, randomized retained dungeon enemies and every run/menu
surface. Test old/new/corrupt/overflow/failed-write accounts and no load writes.
Current live game remains ten-element/old Adventure until that phase passes.
Then implement25 additional kit Conduits, Story/dungeon rebalance, and desktop UI.
Character palette image acceptance/new action/status/Conduit/currency image
intake still needs supplied reviewed assets. Earlier35-Conduit/pilot runtime
expansion is already complete and must not be counted as this new25 batch.
No further baseline approval needed; no commit/deployment.

## Previous phase: all-character palette-control overhaul (D-159)

Updated contributor: Copilot. Current phase: approved character art prompt
overhaul complete; generated-image review pending.

**Requirements used:** owner reports a successful Rosetta prompt using explicit
blue/navy/cyan negatives, a subject-only palette lock and150 weight, then asks
for every character art prompt to receive individual color controls while
retaining the same reference images. This is not approval of the unrelated
six-element/save/Story/UI baseline.

**Changes / implemented behavior:** all16 character lines;224 canonical
cutouts =115 referenced portraits (including19 guide examples/template) +
109 reference-free character-specific icons/weapons. Added tailored allowed
palettes, leading unwanted-color negatives and reference-color remapping.
Removed positive contradictions in the Rose lines and starter late forms,
including Thornia's standalone weapon. Preserved exact signed URLs at150,
equipment, silhouettes, renderer, framing, key colors and quality flags.
Prismatic/opal is explicitly bounded faceting, not rainbow permission.
Blue/green/shadow violet/fire remains where deliberately authored. Key hues are
not negated, avoiding a conflict with the mandatory solid background.

Shared [palette helper](../tools/character_palette.py),
[idempotent updater](../tools/update_character_palettes.py) and
[coverage tests](../tools/test_character_palettes.py) wire the manual packs,
shared guide and War generator. Both Rosetta experiment blocks inherit corrected
current production/150; older400/minimal-blue comparisons below are historical,
not still-active controls. Three enemy experiments remain at10.
[Workflow and validation](art-workflow.md#character-palette-control-d-159-current-policy).

**Validation commands/outcomes:**

- `python tools\update_character_palettes.py`:224 canonical cutouts selected;
  repeated run byte-identical. `python tools\build_elemental_war_art.py` and
  `python tools\build_enemy_style_pilot.py`: reproduced authored outputs.
- `$env:PYTHONPATH='tools'; python -m unittest test_character_palettes test_character_style_references test_elemental_war_art test_enemy_style_pilot test_enemy_style_references`:
  **21 tests passed**. Exact reference queries,115/109 coverage, positive-color
  conflicts, reference-free icons/weapons, single flags,450-word total ceiling
  and idempotence validated. Existing design-only word budgets remain intact.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 tests run,28 existing Machines subtest failures**, unchanged missing
  key-clause wording/scenery contracts; no new character failures.
- `$env:PYTHONPATH='tools'; python -m unittest test_rose_art_prompts`:
  **13 tests run,21 preserved-design assertion failures**. Older tests still
  expect body-one-third everywhere, old readable-bow/rear-tapestry/corner-spread
  phrases and older sword counts/budget. A read-only in-memory diagnostic
  removing every new palette clause reproduces the same21 failures/zero errors.
  Coupled reference/changed-color expectations updated; unrelated old design
  expectations not rewritten to manufacture a green suite.
- `git --no-pager diff --check`: passed (existing CRLF notices only).
  Editor diagnostics for five palette/generator source files: no errors.
  No runtime build required for this prompt/tooling/documentation-only change.

**Limitations / next action:** installed/source images, scenery, production enemy
prompts, runtime behavior and saves were not changed. Owner-reported Rosetta
success is not verified pixel compliance for every character; generate/review
per-character palettes, full tips, readable equipment and solid key gaps.
Existing style URLs may expire; never invent replacements.

Earlier35-Conduit expansion/richer pilots are complete (D-157). Physical art
relocation, additional25 Conduits, six-element migrations, Story and desktop UI
rework remain unimplemented, with unanswered baseline decisions in the
[rework plan](six-element-rework.md). No commit/deployment.

## Rework intake and approved enemy reference pilot (D-158)

Strict Rosetta correction after supplied four-result grid: all outputs retain
blue/lavender. Fifth variant no longer retains contradictory sapphire-blue/
rose-violet facet requests or broad prismatic armor/wing cues; uses warm
ruby/scarlet/champagne/ivory facets. Same URL/weight400 isolates text conflict
removal. Fourth minimal test and other prompts remain intact. Palette outcome
unverified; high-weight reference may still transfer blue. Prior override-only
variant was not a clean test of reference transfer.

Additional Rosetta variant: owner requests a copy immediately below the minimal
test with strong subject-only palette enforcement. Fifth block preserves fourth
block and adds ONLY crimson/scarlet/deep-red gradient plus white/ivory/black/
gold/platinum, remapping all reference colors and overriding earlier blue/violet/
rainbow wording. Explicitly excludes key background from palette restriction.
Existing tests/reference400/production unchanged; no actual output guarantee.

Latest Rosetta test supersedes the previous warm-palette rewrite: owner requests
exact production Legendary prompt plus one simple no-contrasting-colors clause.
Generator copies production verbatim and inserts only "do not incorporate
contrasting colors into the overall subject art design" before key-background
clause. Weight400/exact URL, blue-violet facets,94% footprint/3% margins retained.
Test asserts removing that single insertion reproduces production byte-for-byte.
Other three alternatives and production/runtime assets unchanged.

Rosetta Legendary follow-up: owner requests fourth alternative in the same
experiment file for Evo5 Sovereign of Passion. Inspection found production
prompt explicitly requests sapphire-blue/rose-violet facets in addition to
blue-heavy10016 reference. Test removes both cool facet request and rainbow
material ambiguity, maps warm colors to specific surfaces, adds scoped blue/
violet/fire exclusions and uses existing exact Legendary URL at10 versus400.
Preserves identity/eight wings/longbow/regalia, pulls ensemble back to70%/
15% margins rather than production94%/3%. Production file/pixels untouched.
Recommend palette-compatible approved-style reference if transfer persists,
but no new reference selected/invented or original external image modified.
Validation: generator reproduced all four alternatives; combined pilot,
production-enemy and character-reference suites **11 passed**; shared suite
retains28 baseline Machines failures and no new experimental failures.

Revision3: owner requests Phoenix with Omnic enemy-level written prompt and
Omnic reference. Phoenix alternative now uses exact Enemy Evo6 URL at10,
fully reborn layered armor/twelve tiered mechanical wings/triple sun crown/
expanded opaque flame and opal regalia, preserving crimson identity and
70% ensemble/15% safety margin. Removed sapphire from its test palette to
avoid conflict with blue-armor exclusions. Kirin/Leviathan unchanged.
This tests both complexity and reference, not isolated URL influence.
Production Legendary Phoenix, art, stage/rarity/reward rules unchanged.
Revision3 validation: `test_enemy_style_pilot.py` **3 passed**;
`test_enemy_style_references.py` **4 passed**. Shared suite retains28 existing
Machines failures, no experimental prompt failures. Generator reproduced file.

Revision2: owner supplied Kirin before/after and rejects weight50 palette
transfer. Authorizes changes to the same three alternatives and retry; does not
want new reference generation requirements. Generator now uses existing exact
URLs at10, explicit per-material color placement, individual unwanted-color
exclusions and removes repeated style-only meta instructions. Pale rose remains
Kirin accent; Leviathan retains blue; Phoenix retains fire/prismatic insets.
No grayscale copy, original/reference/installed-image change or global rollout.
Revision2 validation: generator reproduced the three blocks; combined pilot/
production-enemy/character-reference tests **9 passed**. Shared prompt suite
still reports **28 existing Machines failures**, none in the revised pilot.
Generated-image palette/style success remains unverified until owner retry.

Owner requests art organization, palette/framing corrections,25 additional
kit/skill Conduits, six-element consolidation,150-stage linear Story and
desktop-first lively unified UI. A consolidated baseline was presented;
owner corrected enemy reference interpretation, then selected preserving
reference style in a few low-weight tests before broader rollout. The rest
of the baseline remains unanswered; do not infer approval of migrations,
deleting originals, replay premium income or proposed rarity/infusion splits.
[Confirmed versus open scope](six-element-rework.md).

Added Art/README.md as a categorized navigable library; existing intake/source
paths retained. **Physical reorganization is not completed.** No root incoming
PNG files were present in the inspected listing. Originals/runtime imagery
unchanged. New experiment sits separately under Art/experiments.

Three copy-ready pilot prompts: Ivory Kirin (pale), Celestial Leviathan (blue),
Crowned Phoenix (crimson/fire), exact owner evolution reference URLs at50.
Preserve production design text and containment, normalize background contract,
put authored palette/identity first. Production enemy packs remain reference-
free; character references remain400. No global fire/blue exclusion. Generate
matched reference-free comparisons and inspect actual outputs with owner before
global rollout. Midjourney palette/style separation is not guaranteed by tests.

Validation:
- `python tools\build_enemy_style_pilot.py`: generated reproducible pilot.
- Combined `test_enemy_style_pilot`, `test_enemy_style_references`,
  `test_character_style_references`: **8 passed**; preserved production policy/
  exact URLs/design baseline, paired50 flags and character references.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 tests/28 existing Machines failures**, no new pilot failures after scoped
  background-clause correction. No runtime build needed for this prompt/doc batch.

Next: owner-generated pilot results; resolve consolidated baseline open choices
before full physical relocation, content/save migration or economy/UI rollout.
No images generated/intaken, saves modified, commit or deployment.

## Completed runtime: six-phase Conduit/kit expansion (D-157); art intake gated

Owner requests all phases implemented, selects Common Store-only, unchanged
8%/3.5%/1% machine totals/equal expanded pools/stage75 Omnic, original five
Legendary banner bonus only, usefulness pricing, and modest Bliss Skill2
healing for her restorative pilot without replacing attacker identity.
[Rules/status](conduit-expansion-plan.md) /
[exact pilot clocks/caps](units-and-progression.md#richer-kit-pilots-and-status-display-d-151d-157).

Prompt phase completed: revised steel sword sweep/shield and white/black
lightning coin prompts,35 reproducible new Conduit icon prompts and16
reproducible status/charge icon prompts. All are reference-free, margin-safe,
opaque/no-glow cutouts. Installed artwork unchanged. Older prismatic universal
PNGs in root are not the revised steel replacements; no reviewed new coin,
Conduit or status images supplied. Preserve them and wait for correct delivery.

Runtime completed: all35 additions bring catalog to60
(10 Common/15 Rare/15 Legendary/20 Omnic). Utility-priced Common purchases,
expanded equal machine pools, original-five-only banner bonus, all ten new
bounded Omnic mechanics and existing atomic purchase/upgrade/equipment/
reward paths are integrated. New art stays neutral/pending on shared surfaces.
Original25 artwork, modifiers and mechanics are preserved.

Four playable pilots connected: Infernis personal Burn seals/Skill2 spender;
Tizu surviving-shield protection; Aurora owner-specific Verdict Marks/Precision;
Bliss retains offensive Skill2 with modest healing/charges/Last Flare shield.
Exact coefficients/clocks/caps in units-and-progression. Kit flags live in
snapshotted definitions, no captured-kit identity guessing. Personal and
Conduit seals are separate. Pilot state persists through Settings/deep clones
but resets on new encounter/Adventure Continue/replay. Existing Conduit charges
carry staged Continue as before; target-owned marks clear with encounter/death.

Burn/Weaken/Fracture/Verdict badges now show actual magnitude/clocks/owners
beside enemy HP and in the menu. Typed detached status/damage snapshots update
in presentation/impact order, with expired/dead effects removed, no message
parsing/final-state leakage. Allied pending charges and Precision are readable
in Combatants. No missing status PNG URLs or icon-only/color-only meanings.
No commits, deployment, auto-grants or wallet migrations.

Validation:
- Focused Python action/currency/status/Conduit expansion modules: **5 passed**.
- `npm test -- src\game\kit-pilots.test.ts src\presentation\unit-readout.test.ts src\content\combat.test.ts`:
  **3 files/22 passed** at helper stage; expanded engine tests added afterward.
- `npm test -- src\game\kit-pilots.test.ts src\presentation\battle-impact.test.ts src\presentation\battle-status.test.ts`:
  **3 files/15 passed**, real Skill/Burn/heal/shield/mark events, spend timing,
  AoE caps, recovery, rejected-action immutability, Continue reset, owned clocks,
  detached status snapshots and HP/debuff impact grouping.
- Catalog/acquisition/equipment/upgrade/Archive/Store/loot focused agent batch:
  **9 files/249 passed** before parent integration, plus snapshot regressions.
- `npm test`: **1213 passed/1 timed out** under default concurrency alongside
  build; same existing500-draw economy test also timed out before integration.
  No assertion failures or unhandled errors remained.
- `npm test -- --maxWorkers=2`: **84 files/1215 passed** final full regression,
  including independent personal/Conduit Ember Seals and additive combined
  damage. Corrected the new test fixture to canonical element-prefixed ID;
  all Omnic art prompts now use the same canonical prefixed IDs.
  no timeout increase or test weakening. Bounded workers avoid shared CPU pressure.
- `python -m unittest discover -s tools -p test_art_prompts.py`: **28 tests,
  28 pre-existing Machines prompt failures**, none from new packs. Updated
  old prism-identity assertion for owner-approved coin direction.
- `npm run build` via Build Last Light: TypeScript/Vite passed, existing
  large-chunk advisory only. Edited engine/helper/readout editor diagnostics:
  no errors.
- Browser read-only preview at390px CSS viewport:1,183,360 HP and99999.25 Burn,
  all four effects/owners wrap in173px readout without horizontal overflow.
  Menu shows same actual effects. Ordered snapshot decrement/expiry works
  independently of message text; wallet byte-identical. Temporary BattleView,
  preview DOM/styles disposed/restored. Actual battle-screen wrapper and
  nested battle-root match application CSS.
- `git --no-pager diff --check`: passed; existing line-ending advisories only.

Remaining: revised steel action icons, white/black coins,35 Conduit icons and
status/charge icons require supplied originals and individual reviewed intake.
Keep installed art and older incoming prismatic concepts unchanged. Shared
art suite's28 Machines failures are pre-existing concurrent prompt-pack issues,
not silently fixed here. No owner gameplay decision outstanding for this batch.

## Completed: Nerithe and all Elemental War scenery (D-156)

Updated:2026-10-08, Copilot. Phase: approved implementation and reviewed intake.
Owner supplied Nerithe art and all boss-trial headers/arenas, then explicitly
approved playable Nerithe and her trial using the existing six-star progression,
currency/recruitment baseline and developer-tuned aquatic kit.
[Specification](elemental-war.md) / [workflow](art-workflow.md#elemental-war-supplied-cutouts-d-152).

Installed16 additional assets: six Nerithe portraits, four ability icons,
three activity headers and three arenas. Individually reviewed orange/white
background keys, enclosed gaps and passive-icon corners; pale foam, equipment,
gold, eyes and painted shadows retained. Corrected one icon's residual backdrop
via guarded reprocessing with previous export/history preserved.
All40 originals/exports have hashes/settings in `Art/provenance/elemental-war-intake.json`.
The original24 assets/provenance are retained. Scenery remains byte-identical,
1904x640 headers and1456x816 arenas, without background removal/cropping.
Verified incoming originals moved out of root only after successful archival.
`Valor Activity Banner.png` is mapped to Vaelor, not a character rename.

Nerithe is a6-star Aquatic tactical attacker with six forms and a free,
independently unlocked ten-stage trial90-140. The same final-only1% recruitment,
100 Null-Prismatica owned-result conversion, atomic receipt/unlock/currency
transaction and separate RNG apply. No summon-pool additions or auto-grants.
Normal Attack gains fixed5 extra Gauge from her snapshot passive, only for
herself and capped normally. Supported damage/Weaken kits and ordinary recovery
use documented tuning; no new status engine. All three trials now display their
actual headers/arenas. Shared portraits cover locked Archives, playable menus,
field sprites and cut-ins; boss encounters still do not reveal unowned forms.

Validation:
- `python tools\intake_elemental_war_art.py --apply --remove-incoming`:
  **40 installed**,16 new sources preserved; verified incoming files removed.
- `python tools\intake_elemental_war_art.py --reprocess-reviewed --apply`:
  **40 installed/validated**, scoped skill2 correction backed up.
- `python -m unittest discover -s tools -p test_elemental_war_intake.py`:
  **6 passed**, all40 hashes/reproduction, exact content bounds, reviewed gaps/
  foreground, shared exporters, supplied-alpha bypass and conflict preflight.
- `python -m unittest discover -s tools -p test_elemental_war_art.py`:
  **5 passed**; generated statuses/installed IDs reproduce all46 prompt blocks.
- `python -m unittest discover -s tools -p test_character_art_revisions.py`:
  **1 passed**.
- `npm test`: **82 files,1113 passed**. Initial full run exposed old roster/
  header counts, updated precisely; economy test timed out once under concurrent
  image processing, then passed targeted and final full runs without timeout changes.
- `npm run build` via Build Last Light: TypeScript/Vite passed; existing
  large-chunk advisory only. Editor diagnostics: no errors.
- Browser: all16 new images fetched/decoded at expected dimensions.
  Gameplay markup exposes all three entries and supplied header URLs.
  Read-only final-stage Nerithe BattleView visually reviewed with actual Omnic
  art and aquatic arena, Lv140/1,183,360 HP. At390px CSS viewport both portraits
  stay inside bounds; root/readouts have no horizontal overflow. Temporary
  previews removed/disposed and wallet stayed byte-identical.
- `git --no-pager diff --check`: passed, line-ending advisories only.

Remaining: family header, standalone weapons and Nerithe Normal Attack/Defense
icons were not supplied in this batch; her two actions remain text-only.
Universal action images subsequently appeared in root and were left untouched
for the separate D-151 intake. No owner decision blocks this completed batch.
Concurrent enemy-prompt work preserved. No dependency changes, commit or deployment.

## Completed: remove every enemy reference pair (D-155)

Owner reports persistent reference influence and requests removal from each
enemy prompt. Removed both `--sref` and `--sw` from all129 enemy blocks across18
packs: Machines/Treasury/Sanctuary/Crimson Roses/Heaven/Abyss, ten elemental
dungeons, historical ten-enemy Flaming Depths and three Starter Art enemies.
Bounded rewrite preflight verified per-pack counts and equality of all bytes
outside removed suffixes, preserving the three character prompts in Starter Art.
Character mappings/400 weights unchanged, as are every species, palette,
equipment, renderer, background instruction and framing constraint.
D-154 machine whole-design margins retained; references no longer influence
these prompts. No promise that reference-free generation guarantees results.

Updated current guide/pack introductions/policy/index/decision/agent guidance
and regression tests. Historical six enemy URLs preserved as provenance only;
do not reappend. No source/runtime artwork, gameplay, saves, generation,
commit or deployment changes. Unrelated dirty contributor work preserved.

Validation:
- `python -m unittest discover -s tools -p test_enemy_style_references.py`:
  **4 passed**, all129 enemies reference-free,244 unit containment blocks and
  non-portrait exclusion; historical URLs preserved.
- `python -m unittest discover -s tools -p test_machine_art_prompts.py`:
  **3 passed**, reference-free28-block pack, exact inventory and six retained
  framing/palette/escalation requirements.
- `python -m unittest discover -s tools -p test_character_style_references.py`:
  **3 passed**, unchanged character mapping/flags.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 methods,28 known baseline failures**, all in Machines background-wording
  and scenery-renderer assertions; no new failures.
- Scoped `git --no-pager diff --check`: passed, CRLF advisories only.
  Temporary bulk helpers removed. No runtime build needed for prompt/docs/tests.

Remaining: owner generation/full-resolution palette and silhouette review.
No further character reference removals authorized.

## Completed prompt pilot: machine enemy clearance and palette (D-154)

Owner reports character/enemy edge contact and enemy reference palette
influence, supplies example, and chooses Machines first rather than global
revision. Updated all six enemy prompts in
[Awaken the Machines](../Art/creatures/Awaken%20the%20Machines.md).
Late prompts previously demanded94/96% coverage with3/2% margins.
Now full-ensemble maximum50/60/70/70/70/70%, minimum25/20/15/15/15/15% margin
from outermost tip, explicit early distant pullback and final containment,
no corner-reaching language. Complete wings/equipment/powers retained; rich
interior density preserved rather than simplifying or shortening the design.

Machine reference weight400->100, exact D-153 URLs unchanged. Authored
creature palette controls body/plates/wings/ribbons/gems; reference supplies
rendering/proportions, not color/costume/composition. No global purple/gold
ban since those colors are legitimately authored in some creatures.
Other enemy/character packs stay unchanged at400. Bounded rewrite verified
all20 Conduit and both scenery prompt blocks byte-identical.
Updated shared policy/index/decision/agent guidance and exact tests, including
tightly related old machine tests that incorrectly prohibited enemy references.
Temporary edit helper removed. No runtime/image/save edits or generation.

Validation:
- `python -m unittest discover -s tools -p test_machine_art_prompts.py`:
  **3 passed**, six whole-design footprint/margin targets, two framing clauses,
  authored palette priority,100 weight, unchanged28 inventory IDs/escalation.
- `python -m unittest discover -s tools -p test_enemy_style_references.py`:
  **4 passed**, all129 enemy reference mappings (Machines-only100 exception),
 244 contained unit prompts and reference-free non-portraits.
- `python -m unittest discover -s tools -p test_character_style_references.py`:
  **3 passed**, unchanged character URLs/weights.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 methods,28 known baseline failures**, only existing Machines cutout
  background-wording checks and two scenery renderer checks; no new failures.
- Scoped `git --no-pager diff --check`: passed, CRLF advisories only.
  No runtime build needed for prompt/docs/tests-only work.

Remaining: actual generation review. Prompt assertions do not prove image
clearance or eliminate palette bleed; require new full-resolution machine
outputs before wider character/enemy rollout. No generated-image success
claim, commit or deployment. Six-element consolidation remains discussion,
not implemented/approved by this pilot.

## Completed: six-form enemy reference update (D-153)

Owner supplies six distinct Evo.1-6 enemy style URLs and confirms scope as
all six-form enemy prompt packs. Updated36 portrait suffixes, one per form
at existing400 weight, across Machines, Treasury, Sanctuary, Crimson Roses,
Heaven and Abyss. [Exact mapping](../Art/guides/midjourney-character-style-prompt.md#six-form-enemy-references-d-153)
and [workflow](art-workflow.md#six-form-enemy-style-references-d-153).

Separate enemy table preserves complete owner URLs/query parameters and
distinct Evo.2/3. Character/basic/eight-/ten-enemy mappings unchanged;
icons (including pending universal actions), weapons, materials, Conduits,
banners/arenas remain reference-free. Bounded bulk replacement preflight
verified exactly six portraits per pack and byte equality outside reference
URLs. Preserve original creature identities, equipment/palettes, compact
renderer, powers and frame containment. No downloads/generation, runtime
art/gameplay/save edits, commit or deployment. Other contributors' dirty
Elemental War/art work preserved. Temporary bulk-edit helper removed.

Verification:
- `python -m unittest discover -s tools -p test_enemy_style_references.py`:
  **4 passed**, exact six owner URLs/query strings, all129 enemy suffixes,
  all244 unit containment blocks and non-portrait reference exclusion.
- `python -m unittest discover -s tools -p test_character_style_references.py`:
  **3 passed**, unchanged character references.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 methods,28 existing failures**, only Machines renderer/cutout assertions
  in unchanged written prompt bodies; no new failures.
- `git --no-pager diff --check`: passed, existing CRLF advisories only.
  No runtime build required for this prompt/documentation/test-only change.

Remaining: no image generation/intake requested. Signed Discord URLs may
expire; request refreshed owner links if inaccessible, never substitute.

## Completed: Orvella/Vaelor artwork and playable Elemental War (D-152)

Updated:2026-10-08, Copilot. Current phase: approved two-character implementation.
Task: preserve, individually clean and install supplied Orvella/Vaelor artwork,
then implement their playable characters and trials after explicit owner approval.
See [specification](elemental-war.md), [intake workflow](art-workflow.md#elemental-war-supplied-cutouts-d-152)
and [decision](decisions.md).

Installed24 transparent assets:12 six-form portraits and12 ability/action icons.
Exact RGB originals are preserved in `Art/source/elemental-war`; only verified
incoming counterparts were removed. Reviewed enclosed gaps, Orvella Omnic's
gradient and icon frames individually; preserved pale foreground, painted
powers, equipment, shadows and original source-clipped tips. Two faint backdrop
corners required guarded reprocessing; previous exports and processing histories
are retained. Shared exporters use the same settings; supplied alpha bypasses
all keying. Revision URLs update portraits and locked silhouettes consistently.
Actual supplied equipment differs from retained prompt concepts; no repainting
or inferred palette/element changes.

Both6-star Element-Bearers are playable through their independent free-entry
trials:10 sequential stages, Lv90-140, six forms, one human boss per encounter.
Saved mixed squads, gear/copy snapshots, individual Gauge, Continue/replay,
named skills/cut-ins and final-stage controls use existing run patterns.
Separate RNG streams resolve guaranteed Prismatica, optional Null-Prismatica
and final-stage1% recruitment. Currency, Lv0/Evo1 unequipped acquisition or
100 Null-Prismatica owned-result conversion, unlocks and receipt save atomically.
No materials, creature captures, extra clear rewards, summon-pool changes or
recruitment pity. Boss defeats do not reveal playable Archive forms.
Supported kits use documented first-pass tuning, not new counter/stun engines.

Validation:
- `python tools\intake_elemental_war_art.py --apply --remove-incoming`:
 24 originals preserved and exports installed; verified incoming files removed.
- `python tools\intake_elemental_war_art.py --reprocess-reviewed --apply`:
 24 validated, only two exports changed; backups/history retained.
- `python -m unittest discover -s tools -p test_elemental_war_intake.py`:
  **6 passed**.
- `python -m unittest discover -s tools -p test_elemental_war_art.py`:
  **5 passed**.
- Combined Python regression runner: **47 passed** across
  `test_elemental_war_art`, `test_elemental_war_intake`, `test_portrait_pockets`,
  `test_character_refresh`, `test_starter_refresh`,
  `test_character_art_revisions` and `test_prepare_art`.
- `npm test`: **82 files,1103 passed**; exact stage/recruitment boundaries,
  atomic failures/overflow/dedup, legacy saves, squads, summon exclusions,
  Archive gates and actual boss art/cut-in URLs covered.
- `npm run build` through Build Last Light: TypeScript/Vite passed; existing
  chunk-size advisory only. Editor diagnostics: no errors.
- Browser:24/24 images fetched/decoded at960px/256px, character revision
  hashes matched; both trials' first/final forms used actual character art
  at Lv90/140. Desktop final-stage portrait/readouts visually reviewed.
  At390x844 CSS viewport, both portraits were within bounds and root/readouts
  had no horizontal overflow with1,183,360 boss HP. Temporary read-only preview
  destroyed/removed; wallet remained byte-identical.
- `git --no-pager diff --check`: passed, line-ending advisories only.

Limitations/next action: Nerithe remains unimplemented; standalone weapons and
family header remain pending. Additional Nerithe portraits/icons and the three
activity headers/arenas appeared in the root during this task and were left
untouched for separate reviewed intake. Current trials intentionally use neutral
pending scenery, not those unreviewed files. Nerithe still needs kit/balance
approval before runtime implementation. No decision blocks the delivered two
characters. No dependencies, commit or deployment; concurrent D-151/D-153/D-154
work and prior pocket corrections preserved.

## Completed planning:35 Conduits, richer kits and universal icons (D-151)

Owner requests phased planning for35 additional unique Conduits across tiers
and Omnic elements, allows more expressive5/6-star abilities, and requests
shared prismatic winged Normal Attack/prismatic shield Defense art prompts.
This turn is design/documentation/prompts, not live content implementation.

[Plan](conduit-expansion-plan.md) contains exactly35 named devices:
5 Common,10 Rare,10 Legendary and10 Omnic (one per canonical element).
Each has a distinct effect/pair/tradeoff or bounded mechanic plus visual
silhouette. All names, distribution, values and mechanics remain proposals.
Current25 would become60 if approved/implemented. Rare pairs and Legendary
directed tradeoffs avoid existing roles; Omnic triggers differ from live devices.
Existing five-step3.5x modifiers/penalties and expensive rarity costs retained
as the future upgrade foundation, not changed now.

Phases: unique catalog; acquisition/balance review; character-kit pilots;
two universal prompts; image intake and separately approved runtime batches.
Machine Rare/Legendary/Omnic tier odds and stage75 gate proposed unchanged;
Common10% machine tier and keeping new Legendary items out of banners are
explicit approval gates. Notes identify live fixed5/5/10 loot divisors and
shared banner rarity filter that must be changed coherently, not silently
inflate total odds when adding catalog rows. No missing PNG requests/loot grants.

Richer ability permission is recorded with proposed Infernis/Tizu/Aurora/Bliss
pilots and exact timing/owner/cap/consumption/snapshot acceptance requirements.
No wholesale kit rewrite or automatic elemental-affinity multiplier.
Captured creature kits and all live combat/economy/saves remain unchanged.

[Universal Action Icons](../Art/ui/Universal%20Action%20Icons.md) contains two
copy-ready1:1 prompts: Prismatic Winged Strike and Prismatic Aegis.
Compact chibi anime/cel icon renderer, jewel-like spectrum, opaque crisp powers,
full margins/plain green key, no text/interface and no non-portrait reference
flags. Radiant Light is thematic, not generated glow or Luminous restriction.
Images not delivered: retain current character-specific actions until both
are reviewed/exported, then shared ability resolver replaces every live EB's
Normal Attack/Defense only. Preserve old sources/provenance/archived runtime;
Passive/Skills/Last Flare remain character-specific. Resolver includes newer
Orvella/Vaelor entries from other work; future intake must audit the real roster,
not assume the old13-entry count.

Validation:
- `python -m unittest discover -s tools -p test_universal_action_prompts.py`:
  **2 passed**, exact35/distinct names/all ten elements/no live-name collisions,
  two different square reference-free prompts/renderer/key/negative flags.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 methods,28 existing subtest failures**, all in unchanged Awaken the
  Machines prompts across the two known aggregate checks; no new-pack failures.
  Initial new prompts used150 stylization/omitted the chibi keyword; aligned
  them with shared100/chibi icon wording and reran. Existing unrelated pack
  assertions were not weakened or fixed.
- Scoped `git --no-pager diff --check`: passed, line-ending advisories only.
  No runtime tests/build needed: this turn changed no runtime files/assets.

Remaining: owner review of proposed catalog/distribution, Common machine
acquisition and new Legendary banner eligibility; choice/approval of character
pilot; delivery of both universal icons.35 new Conduit art prompts/images are
not requested/authored here. No new runtime definitions, migrations, balance
changes, generated images, deletion of current icons, commit or deployment.

## Completed: individual character background pockets (D-150)

Reviewed all13 six-form runtime sheets (78 portraits), then source-resolution
candidate components individually. Corrected13 portraits: Bruno base;
Tizu Evo.3/5/6; Bliss Evo.6; Razor Evo.6; Elise Evo.5/6; Aurora Evo.5;
Flora Evo.4/6; Disciple Evo.2/5. Includes Bruno's white inter-leg pocket and
Tizu's red/orange enclosed gaps.78 explicit normalized seeds, two bounded
Elise hair-gap shade regions, Bliss-specific2px black-edge cleanup; no blanket
threshold increases or global color removal. Similar eyes, feathers, gold,
black armor/cape, powers and intentional painted contact shadows retained.
65 other current portraits unchanged; sources/facing/saves/gameplay unchanged.

Art/provenance/portrait-pocket-corrections.json supplements both current refresh loaders.
tools/reprocess_portrait_pockets.py generates exact per-asset dark/light review
and plan, checks all original/current/backup hashes before installing, rejects
stale review settings/bytes, preserves pre-correction exports in source-family
corrections folders and appends processing_history to intake records.
Original strict intake guards still validate60/18 portraits.
Shared character URL hashes regenerated; all portrait/silhouette surfaces use
the updated bytes without new IDs or ownership changes.

Validation:
- Review/apply command:
  `python tools\reprocess_portrait_pockets.py --assets bruno tizu-evo-3 tizu-evo-5 tizu-evo-6 bliss-evo-6 razor-evo-6 elise-evo-5 elise-evo-6 aurora-evo-5 flora-evo-4 flora-evo-6 disciple-evo-2 disciple-evo-5 --review <session-review-directory>`,
  then the same command with `--apply`: **13 installed**, old exports/hash
  history preserved. Revised Elise candidates until both hair gaps cleared.
- Combined unittest runner with `tools` on sys.path and modules
  `test_portrait_pockets`, `test_character_refresh`, `test_starter_refresh`,
  `test_character_art_revisions`, `test_prepare_art`: **35 passed**.
  Exact78 new gap pixels plus nearby unchanged foreground, all78 current
  exports, historical alpha, correction reproduction/conflicts and margins.
  Initial preservation check picked an already edge-decontaminated Disciple
  pixel; verified it was unchanged from previous processing and selected an
  opaque interior foreground pixel instead. Final checks pass.
- Final `python -m unittest discover -s tools -p test_portrait_pockets.py`:
  **6 passed**, including added source/runtime/backup-conflict preflight and
  complete selected-portrait history assertions.
- `python tools\intake_character_refresh.py` /
  `python tools\intake_starter_refresh.py`: **60/18 validated dry runs**.
- VS Code test tool found no registered tests; CLI
  `npm test -- src\presentation\portrait.test.ts src\content\character-art.test.ts src\presentation\archives.test.ts src\presentation\battle-cutin.test.ts`:
  **4 files /48 passed**.
- **Build Last Light** (`npm run build`): TypeScript/Vite passed, existing
  large-chunk advisory only. Changed-file diagnostics and `git diff --check`
  clean. `python tools\character_art_revisions.py`: current hashes match.
- Browser shared-helper fetch/decode, without DOM/save writes:
  **13/13 corrected images960x960**, URL versions match fetched SHA-256 prefixes.

No commit/deployment. No owner decision or known confirmed pocket fix remains.
Intentional shadows and ambiguous similarly colored painted details are not
erased; future replacements still require individual visual review.

## Completed: all18 replacement starter portraits (D-149)

Owner's root delivery includes Beginner through Omnic for Infernis/Tizu/Flora.
All18 originals are preserved byte-for-byte under Art/source/starter-refresh,
previous runtime exports in its previous-runtime folder, current transparent
960px/864px-content PNGs under stable public/assets/characters IDs. Only
hash-verified incoming root files were removed after successful installation.
Historical source/supplied-alpha files and manifests remain untouched.

Per-source reviewed border-connected RGB keys, three row gradients,116
explicitly reviewed enclosed-gap seeds and bounded edge decontamination remove
opaque backgrounds without globally deleting foreground colors or pale details.
Reviewed all six forms per character against dark/light backgrounds. Preserve
intentional contact shadows/source powers, gold equipment, eyes, pale feathers/
cloth and bowstrings. Some source tips/feet are already clipped; normalization
does not reconstruct them. Runtime silhouettes have at least48px clear padding.

Updated18 individually reviewed source-facing entries and shared character-art
revision hashes. Stable IDs automatically serve starter selection, Home,
Character/Squad/Summon/Archive color and locked silhouettes, evolution previews,
battle sprites and cut-ins. No names, forms, stats, skills, ownership or saves
change. No new resources or characters granted.

tools/intake_starter_refresh.py / Art/provenance/starter-refresh-settings.json /
Art/provenance/starter-refresh-intake.json provide reproducible review/export/provenance.
Shared prepare_sprite and review_art prioritize current starter replacements;
legacy supplied-alpha tests audit their preserved previous-runtime images
without re-keying historical alpha. Future delivered alpha still bypasses keying.
Updated docs/index/vision/art packs/agent entry and D-149 decision.

Validation:
- `python tools\intake_starter_refresh.py --review <session-review-directory>`:
  generated/reviewed18 candidates and six dark/light sheets;116 enclosed
  background gaps corrected before installation.
- `python tools\intake_starter_refresh.py --apply --remove-incoming`:
  installed18; original/previous/runtime SHA-256 verified, revisions regenerated,
  exactly18 matched root originals removed.
- `python -m unittest discover -s tools -p test_starter_refresh.py`:
  **4 passed** (all hashes/reproduction/alpha/margins/gaps/pale details/routing).
- Combined `test_prepare_art` / `test_character_art_revisions` runner:
  **20 passed**, including historical supplied-alpha/protected legacy detail tests.
- `python tools\character_art_revisions.py`: runtime bytes match current revisions.
- `python tools\review_art.py --cleaned --assets infernis tizu-evo-6 flora-evo-6 --output <session-review-directory>`:
  all3 shared review-tool exports match installed bytes; Python compile checks passed.
- VS Code test runner found no registered tests; existing CLI
  `npm test -- src\presentation\unit-facing.test.ts src\presentation\portrait.test.ts src\content\character-art.test.ts src\presentation\archives.test.ts src\presentation\battle-cutin.test.ts src\presentation\roster.test.ts src\presentation\banner-showcase.test.ts`:
  **7 files /149 passed**.
- **Build Last Light** (`npm run build`): TypeScript/Vite passed, existing
  large-chunk warning only. Changed TypeScript diagnostics clean.
- Browser no-storage preview using actual shared portrait helper: all18 decoded
  at960x960 with versioned URLs; all18 fetched SHA-256 hashes match intake.
  Desktop screenshot reviewed; shared-page navigation subsequently removed the
  temporary preview. Preview never changed saves.
- `git diff --check`: passed.

No commit/deployment. No remaining intake or owner decision needed; already
clipped source tips require a future owner replacement if restoration is desired.

## Completed: game-native confirmations and acquisition reveals (D-148)

Owner requires zero OS/browser popups and a special summon animation with a
proper reward screen as a common game foundation. All former browser-confirm
paths now await `presentation/game-dialog.ts`: save recovery, purchase,
creature sale/leveling, character level/evolution, summon, Conduit restoration
and battle restart/replay. Styled HTML dialogs stay inside the game, use
Cancel/named actions, explicit Escape, modal input isolation, single-dialog
guard and focus restoration. No Notification permissions or OS APIs.
Existing HTML Information/Settings/Max Level/battle panels remain game-native.

Shared `reward-screen.ts`/`game-dialog.css` provide a2400ms elemental Light
portal, actual-art fade reveal, saved receipt and fixed reachable Continue
footer. Skip/Escape during animation reveal, rather than lose, the result.
Reduced motion skips animation; live motion changes reveal immediately.
Tracked animations/listeners/modal nodes clean up on dismissal. Image failures
show an explicit saved-reward warning. The renderer never saves, claims or rolls.

`summon-presentation.ts` maps the exact saved new EB, ordinary creature or
duplicate-converted copy, with current base/fixed form art, rating, element,
level, spending, human-readable guarantee and separately saved Legendary bonus.
Duplicates show actual awarded creature, not false character acquisition.
`conduit-presentation.ts` shares the receipt for purchases/restoration with
actual icon/meter/modifiers/copies/cost. Existing character growth celebrations
and battle loot/results remain their activity-specific animation/results.
Post-save presentation errors explicitly distinguish saved rewards from rejected
transactions. No cost/odds/pity/RNG/save schema/gear/acquisition changes.

Validation:
- VS Code test tool has no registered tests; used existing Vitest CLI.
- `npm test -- src\presentation\game-dialog.test.ts src\presentation\summon-presentation.test.ts src\presentation\conduit-upgrade.test.ts`:
  initial **3 files /17 passed** before additional receipt/error/keyboard checks.
- Final `npm test`: **81 files /1075 passed**. A full run concurrent with
  production build hit the existing5000ms integrated-economy test timeout;
  `npm test -- src\game\integrated-economy.test.ts` passed **4/4** independently,
  then full suite passed without concurrent build. No timeout/config changes.
  Earlier incomplete partial module mock caused two upgrade-test failures;
  fixed the mock to preserve the real escaping helper, not runtime behavior.
- **Build Last Light** (`npm run build`): TypeScript/Vite passed; existing
  large-chunk advisory only. Changed-file diagnostics clean.
  `git --no-pager diff --check`: passed, line-ending advisories only.
- Tests cover dialog wait/cancel/Escape/re-entry/opening failure/focus cleanup,
  source-wide browser/OS popup API prohibition, actual new/creature/conversion/
  bonus/pity shapes, purchase/restoration receipts, immutability, rejected/
  stale upgrades and post-save presentation error wording.
- Isolated browser: real paid new6-star Aurora plus Legendary bonus; actual
  Standard duplicate conversion into Omnic Treasury copy at Lv.50; ordinary
  Dawnthorn Slime at Lv.80. Verified one10-currency debit, portal running
  before art/details reveal, Skip, natural completion, reduced-motion immediate
  receipt, Continue/focus, double activation producing one confirmation,
  Escape cancellation and failed-write/no-award/no-receipt behavior.
- Real Conduit purchase/restoration:1000 Prismatica debit, two owned copies;
 25-component upgrade, unchanged copies, +1/+7.5% Health receipt. Battle
  restart opens in-game confirmation over Battle menu; Escape keeps the run/
  menu and restores prior focus. No browser message-box event occurred.
- Actual1280/390/320 CSS-pixel reward checks: no horizontal overflow, dialog
  inside viewport, Continue visible with44px+ dimensions. Desktop receipt
  screenshot reviewed; footer refactored to stay reachable independently of
  long bonus details. Background host required focus emulation and occasional
  re-entry after concurrent Vite reloads; no pixel-diff claim.
- Native owner-storage before/after strings matched through preserved native
  getter. All deliberate draws/purchases/failure tests used realm-local
  in-memory storage; original shared game page/server retained.

Remaining: no owner decision or popup/summon foundation implementation needed.
Future acquisitions should reuse these helpers; existing battle/growth
presentation is not replaced with this modal. No new art/audio, dependency,
backend, commit or deployment.

## Completed: portrait-only style references game-wide (D-147)

Owner explicitly confirms only character/enemy portraits should use
`--sref`/`--sw`. Items/currencies/materials/Conduits, standalone weapons,
ability/action icons, emblems, banners, arenas and all other art use neither.
This supersedes the earlier D-133 currency and D-145 non-portrait exceptions,
plus older cutout400/scenery200 append instructions.

Removed both flags from30 generation blocks (two currencies and28 Elemental
War non-portraits). Audited all515 blocks:244 portraits retain exact mapped
references/400,271 non-portraits have neither flag. No designs, positive image
prose, palettes, ratios, other flags or supplied/runtime images were changed.
Updated the Elemental War generator and regenerated all four packs; future
generation no longer reintroduces icon/weapon/scenery references.

Updated active per-pack copy instructions, shared guide, workflow, specification,
economy/vision/index/agent guidance and decision log. Historical decision entries
remain historical; this section/current policy supersedes their old instructions.
Currency tests and global reference checks no longer exempt currencies.
Elemental War tests require references on its18 portraits and none on its28
other blocks. Shared prompt checks validate actual flags instead of merely
looking for reference instructions elsewhere in a document.
Enemy containment tests include the18 proposed portraits and equivalent
"nothing touches or crosses" wording without altering their prompts.
Concurrent copy cleanup occupies D-146 and remains untouched; this policy is D-147.

Validation:
- `python tools\build_elemental_war_art.py`: four documents regenerated.
- Focused unittest runner loading `test_character_style_references`,
  `test_enemy_style_references`, `test_currency_art_prompts`,
  `test_elemental_war_art`, `test_component_art_prompt`: **13 passed**.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 methods /28 existing Machine-pack assertion failures**, confined to the
  two previously known aggregate methods. No new policy/pack failures.
- Combined runner with those five focused modules and the26 unaffected shared
  methods (excluding the two known Machine aggregate methods): **39 passed**.
- `git diff --check`: passed.

No runtime build required for prompt/docs-only changes. No image generation,
asset intake, save/gameplay changes, dependencies, commit or deployment.
Remaining: separate Elemental War design approvals/implementation and known
unrelated Machine prompt mismatches; no further reference-policy decision needed.

## Completed: primary-screen information cleanup (D-146)

Owner reports irrelevant tidbits across screens, with Inventory as the example.
Removed redundant Inventory introductions/acquisition paragraphs/currency
suffixes, prototype header subtitle, unrelated Menu footnotes, repeated Squad
instructions, generic affordable-purchase/draw reminders, Conduit card drive/lore
paragraphs and the machine component formula repeated on the activity card.
Story no-reward boilerplate is removed. Character skill panels now show actual
effects without a nonfunctional independent-upgrade card/button or repeated
category eyebrow. Detailed rules remain in Help/Information, including skill
growth and component drops. Prices, balances, stats, odds/pity, requirements,
shortage/protection warnings, feedback, real navigation and all transactions
remain intact. Archives, Settings, event/capture eligibility, meaningful lore
and battle retain relevant information.

Inventory's Upgrade and Information controls now share one action row instead
of an empty introductory row plus a full-width upgrade button. Empty states
retain headings and useful destination actions. No CSS, art, content balance,
storage schema, acquisition, save or combat changes.

Validation:
- VS Code test runner found no registered tests; used the existing Vitest CLI.
- `npm test -- src\presentation\ui-copy.test.ts src\presentation\inventory.test.ts src\presentation\hub.test.ts src\presentation\conduit-upgrade.test.ts src\presentation\conduit-store.test.ts src\presentation\roster.test.ts src\presentation\sanctuary.test.ts src\presentation\activity-banner.test.ts`:
  **8 files /83 passed**. Initial run:82 passed/1 obsolete assertion expecting
  a removed drive-type label; updated that assertion, retained price/buff checks.
  New regression strips closed dialogs when checking primary copy, separately
  confirms detailed rules remain, and verifies no account mutations.
- **Build Last Light** (`npm run build`): TypeScript/Vite passed; existing
  large-chunk advisory only. Changed-file diagnostics: clean.
  `git --no-pager diff --check`: passed, line-ending advisories only.
- Isolated in-memory browser fixture: Inventory empty/owned tabs, Information
  open/close, Store, Upgrade, Team skill detail, Summon and Machines verified.
  Actual skill effects, upgrade shortages, costs, pity and machine tier odds
  remain; fixture data unchanged after navigation. Initial incomplete fixture
  correctly reported invalid save; replaced with `emptyAccount()`-based data,
  without writing owner storage.
- Inventory measured at actual1280/390/320 CSS pixels: no horizontal overflow;
  visible action-row buttons retain48px heights and wrap on narrow screens.
  Detailed screenshot/pixel-diff claims are not made.

Remaining: no implementation or owner decision needed for this cleanup.
No commit/deployment or new dependency. Existing localhost server retained.

## Completed: Elemental War specification and46 art prompts (D-145)

Owner requests new endgame family with character-specific activity banners,
six evolution forms across10 stages90-140, final highest boss1% base-form
playable EB recruitment and only existing currencies. Explicit follow-ups
choose **design/specification first**, guaranteed Prismatica/independently
chance-based Null-Prismatica, owned recruitment converting into existing currency,
and activity-header banners only, not summon banners.

[Specification](elemental-war.md) distinguishes confirmed requirements from
proposed names/kits/6-star ratings/stage mapping/free entry/replay/no pity,
currency amounts/duplicate payout and progression recipes. Nothing registered,
playable, granted or written to saves. Proposed roster:
- Nerithe, female/Aquatic: tide-cartographer, survey trident, folded-ocean/
  nautilus/meridian architecture; The Sea Without a Shore.
- Orvella, female/Tectonic: faultline architect, suspended-keystone scepter,
  tessellated stone/geode/foundation vaults; The Throne Beneath the World.
- Vaelor, male/Voltaic: thunder-conductor, tuning-fork polearm, resonator
  combs/capacitor drums/lightning staves; The Sky's Final Chord.

[Art index](../Art/ui/Elemental%20War.md) links all three15-prompt packs: six
portraits, six ability/action icons, signature weapon, activity header and arena.
Family banner adds one,46 total. Exact approved Evo.1-6/400 portrait references;
Originally pack-local Evo.3/400 icons, Evo.6/400 weapons and Evo.6/200 scenery;
these non-portrait exceptions are now removed by D-147 above.
Consistent compact2.5-3-head/eyes-only renderer, opaque non-emissive cutouts,
contrasting plain keys and two strong complete-containment cues. Bodies stay
compact, becoming one quarter/one fifth at Legendary/Omnic while dense elemental
architecture dominates. Full-bleed scenery stays exempt. No images generated.

Authored data/generator `tools/build_elemental_war_art.py` reproduces copy-ready
Markdown; proposed IDs are not runtime URLs. Updated index/vision/art workflow/
agent entry/decision log. Concurrent menu work occupied D-144, preserved;
Elemental War uses D-145 instead.

Validation:
- `python tools\build_elemental_war_art.py`: four art documents generated.
- `python -m unittest discover -s tools -p test_elemental_war_art.py`:
  **5 passed**: exact reproduction/46-block inventory, reference/flag/ratio
  mapping, identities/word limits/containment and stage/recruitment/design scope.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 methods;28 existing assertion failures**, all in Awaken the Machines,
  confined to the two previously known aggregate checks. No new-pack failures.
- Focused shared ArtPromptTests runner excluding those two aggregate methods:
  **26 passed**, including neutral wording and all added prompt documents.
- `git diff --check`: passed. No runtime build needed for design-only deliverable.

Remaining: owner review of proposed roster/art/kits/ratings and tuning/mapping/
entry/progression/duplicate amounts before implementation. Real output requires
generation, edge/style/alpha/facing review and byte-preserving intake.
No gameplay changes, dependencies, commit or deployment.

## Completed: intentional Rosetta/Thornia base titles (D-143)

Owner confirms delivered Evo.1 artpiece filenames intentionally rename forms:
**Gilded Rose, Rosetta** and **Burdened by Thorns, Thornia**.
Updated canonical form-title resolver, both prompt headings, rose specification
and focused assertions. Shared naming propagates into menus/accessible portraits,
Squad, Archive, banner showcases/rates/results and battle. Other forms, Crinso's
Rosebound Page, character/art/save IDs and historical intake provenance unchanged.
Search finds no remaining old exact Rosetta/Thornia titles.

Validation:
- `npm test -- src\content\character-art.test.ts -t owner-delivered`:
  **1 passed /16 skipped**; exact approved titles/stable IDs/unchanged second
  forms/Crinso verified.
- `npm test -- src\presentation\portrait.test.ts src\presentation\banner-showcase.test.ts src\game\crimson-roses.test.ts`:
  **3 files /89 passed**.
- `python -m unittest tools.test_rose_art_prompts.RoseArtPromptTests.test_form_headings_match_owner_delivered_titles`:
  **1 passed**, all six headings for each rose character match canonical titles.
- **Build Last Light** (`npm run build`): passed TypeScript/Vite; existing
  large-chunk warning only. Changed-file diagnostics and whitespace passed.
- Broader UI runs encountered concurrent Home heading/route markup assertion
  failures, unrelated to this rename. Full rose prompt suite has45 existing
  assertions against superseded references/design wording; not rewritten here.

Remaining: no naming implementation/owner decision needed. Concurrent UI/prompt
baseline failures not addressed. No source image edits, commit or deployment.

## Completed: both supplied prism currency images (D-142)

Owner delivers root Prismatica/Null-Prismatica images. Archived original bytes
under `Art/source/currencies` with owner filenames; previous coin/rose exports
preserved under `previous-runtime`. Historical originals/provenance untouched.
Both RGB deliveries use reviewed border-connected source-specific teal keys and
bounded edge cleanup, preserving pale/cyan facets, obsidian rims, painted
sparkles and Null-Prismatica's intentional painted shadow. Dark/light256px
reviews passed. Transparent256px/224px-content runtime exports keep legacy
`fractalis.png`/`lycalis.png`; root copies removed after hash verification.
[Manifest](../Art/provenance/prism-currency-intake.json) records both generations/settings.

Shared `currencyArt` now adds byte-derived revisions, updating all existing
balances/costs/rewards/showcases/loot/results without stale coin/rose URLs.
The regular currency exporter and art-review source resolver select active new
sources, never apply historical brown masks to these images. Reproduce with
`python tools\intake_prism_currency_art.py --apply`. No balance/save/RNG/economy
changes. Updated art/specification/index/agent/current-status documentation.

Validation:
- `python -m unittest discover -s tools -p test_prism_currency_intake.py`:
  **3 passed**; `-p test_prepare_currencies.py`: **5 passed**;
  `-p test_currency_art_prompts.py`: **1 passed**.
  Includes hashes/originals/previous exports, exact regeneration, alpha bypass,
  subject retention, margins and active regular-exporter routing.
- `npm test -- src\presentation\currency-icon.test.ts src\presentation\item-showcase.test.ts src\presentation\battle-loot.test.ts src\presentation\battle-results.test.ts src\presentation\ui-copy.test.ts`:
  **5 files /28 tests passed**, including live-byte URL revisions and legacy saves.
- Broader initial7-file run:44 passed/1 failed, existing Inventory Menu route
  assertion during concurrent navigation edits; this task did not alter navigation.
- `python tools\intake_prism_currency_art.py`: idempotent dry-run passed.
- Final **Build Last Light** (`npm run build`): passed TypeScript/Vite,
  existing large-chunk warning only. Initial concurrent roster type error resolved
  by other work; no unrelated correction made here.
- Changed TypeScript diagnostics and `git diff --check`: passed.
- Served Prismatica256px PNG opened successfully in browser. Full helper preview
  attempts were interrupted by concurrent page navigation/HMR; no successful
  all-surface browser review claimed. Offline dark/light image review completed.

Remaining: no currency-art installation/owner decision required; broader
concurrent Menu test failure not addressed here. No commit/deployment.

## Completed: Conduit Archive ownership silhouettes (D-141)

Owner requests Conduit Archive art silhouettes. All25 entries now use ownership
classes: positive copy count reveals full color; zero/missing counts and
unavailable saves show black silhouettes from actual supplied art, with a subtle
neutral outline. CSS filters only the artwork, not upgrade squares/rarity/text.
Existing accessible names, counts, errors, effects and other Conduit surfaces
are preserved. No grants/save changes.

Validation:
- `npm test -- src\presentation\archives.test.ts src\presentation\conduit-upgrade.test.ts src\presentation\conduit-store.test.ts`:
  **3 files /17 tests passed**, covering owned/unowned/zero/unavailable cases
  and no account mutations.
- Browser DOM-only fixture: all25 images loaded, one owned color/24 silhouettes;
  owned filter `none`, locked black/outline filter, upgrade meter filter `none`.
  No storage writes; temporary preview removed.
- Changed-file diagnostics: no errors. `git diff --check`: passed.
- **Build Last Light** (`npm run build`): TypeScript passed; Vite blocked by
  concurrent `src/main.ts` import of missing `src/sanctuary-reference.css`.
  This task did not alter either path; do not remove another contributor's import.

Remaining: full build requires the concurrent stylesheet work to finish.
No owner decision or remaining silhouette implementation; no commit/deployment.

## Completed: refreshed character URLs and matching silhouettes (D-140)

Owner reports new character art not rendering everywhere and requests updating
unlocked/locked silhouettes. All60 D-134 installed images hash-match their
reviewed manifest; sampled live unversioned responses also match. No stale image
was reproduced on this browser, but canonical URLs previously stayed identical
across replacement. Shared `assetUrl` now appends SHA-256-derived revisions for
all78 installed character portraits, invalidating old cache identities everywhere:
Home/Character/Squad, banner showcases, Archives, evolution silhouettes,
battle fields and cut-ins. Stable names/IDs and saves remain unchanged.
Locked Archive silhouettes use the current alpha plus a subtle neutral outline;
remain black, with no ownership/form-discovery or reveal-rule changes.

`tools/character_art_revisions.py --write` generates the compact runtime revision
map; no-write invocation verifies it against every PNG. D-134 intake updates it
automatically on installation. No source/runtime image edits, new grants or
combat/economy changes. Infernis/Tizu/Flora retain original art without supplied
replacements; other ten lines have all six new forms.

Validation:
- `npm test -- src\presentation\portrait.test.ts src\content\character-art.test.ts src\presentation\hub.test.ts src\presentation\archives.test.ts src\presentation\roster.test.ts src\presentation\banner-showcase.test.ts src\presentation\battle-cutin.test.ts`:
  **7 files /100 tests passed**. Every form's revision equals its actual bytes;
  current/locked/next-form/menu/field/cut-in/showcase URLs verified.
- `python -m unittest discover -s tools -p test_character_art_revisions.py`:
  **1 passed**; `-p test_character_refresh.py`: **6 passed**.
- `python tools\character_art_revisions.py`: current runtime revisions verified.
- **Build Last Light** (`npm run build`): TypeScript/Vite passed; existing
  large-chunk warning only.
- Browser decoded all78 current versioned portraits at960x960, zero invalid
  URLs/images. Matching Rosetta color/black-outline silhouettes use identical
  new URLs; screenshot/containment reviewed using actual helpers.
  Preview is DOM-only, no storage writes; removed afterward.

Remaining: owner-reported old rendering was not reproduced locally, so prior
cache state cannot be confirmed. Content-versioned routing is now enforced and
tested everywhere. No new starter delivery, commit or deployment.

## Completed:100-stage Machines and long-term Omnic restoration (D-139)

Updated date/contributor:2026-10-08 ~ Copilot.
Owner requests100 machine stages, much larger later BMC drops and extremely
expensive Omnic max upgrades. Follow-ups approve Lv.10-120 spread across100
and moving Omnic acquisition to stage75. Exact BMC/cost numbers are editable
developer tuning, not extra owner-authored numeric requirements.

Implemented:
- [Mode definition](../src/content/activities.ts) now has100 stages.
  Shared mode-specific validation replaces accidental elemental35-stage
  validation in both Conduit/component loot APIs. Level curve10->120,
  bosses every5; six supplied forms cover1-17/18-34/35-50/51-67/68-84/85-100.
  Stage100 remains400000-HP final boss. Other modes/level caps are unchanged.
- [BMC](../src/content/mechanical-components.ts): one independent per-kill
  roll with `t=(stage-1)/99`, chance `.25+.75*t`, quantity
  `round(1+99*t*t)`. Stage1:25% for1;100:guaranteed100. Boss/ordinary match.
  Existing atomic save/source/quantity/overflow/dedup protections retained.
- [Omnic costs](../src/content/conduits.ts):
  5000 ~ 10000 ~ 20000 ~ 35000 ~ 50000 (120000 total,200x Common curve).
  Common/Rare/Legendary costs unchanged; same shared resolver drives preview,
  funds checks, confirmation/success and atomic spending. At stage100 this is
  1200 kills to fund a new Omnic name from zero before other spending.
  Upgrade stats/penalties/unique mechanics/equipment constraints stay intact.
- Omnic tier remains1% total/equal names but eligible only from75; Rare8%,
  Legendary3.5%, banner bonuses unchanged. Actual drops, discovery tables,
  Gameplay/selectors/rules and battle-entry text use current definitions.
  [Specification](awaken-the-machines.md), [economy](conduit-upgrades.md),
  index/decision/catalog/framework/roadmap and art-pack stage headings updated.
  Art generation blocks/assets and concurrent D-137/D-138 work preserved.
- Saves retain exact existing unlock numbers and upgrade levels without
  migration/load writes/retroactive charges/refunds. Stage35 is now nonfinal;
 99 advances100; final results hide Continue and saved stage cap is100.
  Current run stat snapshots remain; next encounters use current definitions.

Validation:
- `npm test -- src\content\activities.test.ts src\game\machines.test.ts src\game\conduit-upgrades.test.ts src\presentation\conduit-upgrade.test.ts src\presentation\machine-art.test.ts src\presentation\battle-results.test.ts`:
  final **119 tests across6 files passed**, including exact100 stage levels/
  form ranges/BMC thresholds, real per-kill atomic saves/receipt replay at every
  stage,75 acquisition boundary,120000 total Omnic spending, legacy ownership/
  level retention,35/99/100 Continue/unlocks and unchanged other-mode limits.
- `npm test`: **1038 tests across77 files passed**. Earlier full run exposed
  stale expected count of35-stage activity labels; fixed to ten elemental modes
  plus the explicit100-stage machine label before the successful full rerun.
- `npm run build` via Build Last Light: final **TypeScript/Vite passed**;
  existing large-chunk advisory only. Changed TypeScript diagnostics: no errors.
- Scoped `git --no-pager diff --check`: **passed**, LF/CRLF advisories only.
- Browser in-memory fixture verified100 selector options/selected100, real
  final Lv120/400000HP/Ouroboros art, guaranteed100 BMC, no final Continue,
 49999 insufficient/50000 sufficient for +5 and actual native50000 confirmation.
  Accepted confirmation saves +5 with zero remaining components and focuses
  final status. Owner wallet was never funded or written.
  Responsive recheck interrupted by concurrent shared-browser/HMR activity,
  including a transient unrelated art-revision import while its file was being
  added; no claim of new320/390/1280 layout validation. Our named fixtures removed,
  viewport restored;373-byte owner storage hash2915462111 unchanged. Initial
  feature fixture had exact byte equality; second cleanup also verified equality.

Remaining: production farming-pacing playtests; exact numbers stay tunable.
No further owner decision, dependency, commit, push or deployment required.
Supplied component art is already installed (D-137), not pending.

## Completed: five-square Conduit upgrade meters (D-138)

Owner requests shiny white level squares and prismatic glow/shimmer at full
upgrade. Shared `conduit-upgrade-meter.ts`/CSS replaces numeric icon badges
across Store, Inventory, Archives, equipment, upgrades, discovery loot and
results. Battle pickup meters use snapshotted levels through the same square
states and styling. Exactly five squares, one white filled square per level;
charcoal empty squares, +5 prismatic gradient/glow/color sweep/shimmer.
Exact accessible name/+level of5 remains, as do numeric upgrade controls/costs.
Both in-game/device reduced motion stop animations, preserving static colors.
No economy/save/combat changes or art regeneration.

Validation:
- `npm test -- src\presentation\conduit-upgrade-meter.test.ts src\presentation\conduit-upgrade.test.ts src\presentation\conduit-store.test.ts src\presentation\battle-loot.test.ts src\presentation\battle-results.test.ts src\presentation\inventory.test.ts src\presentation\archives.test.ts`:
  **7 files /44 tests passed**, including all0-5 levels, invalid levels,
  accessible labels and snapshotted loot meters.
- **Build Last Light** (`npm run build`): TypeScript/Vite passed;
  existing large-chunk warning only.
- Browser DOM-only preview/screenshot reviewed for all six levels: five squares
  each, correct fills, +5-only animation. Meter widths62px/34px fit200px/40px
  icons. A280px-wide preview has no horizontal overflow. Both app/device
  reduced motion show no square/shimmer animations with static gradient retained.
  No storage writes; temporary preview removed and motion emulation restored.

Remaining: no implementation or owner decision needed. No commit/deployment.

## Completed: supplied Broken Mechanical Components artwork (D-137)

Owner requests moving and wiring the root component image. Archived original
bytes under `Art/source/currencies/Broken Mechanical Components.png`; reviewed
offline teal-background/gap removal and bounded edge cleanup preserve pale
machinery, gears and colored core. Dark/light256px review and live browser
80px helper/showcase review passed. Transparent256px/224px-content runtime icon
is `public/assets/currencies/mechanical-components.png`.
[Manifest](../Art/provenance/component-art-intake.json) records source/runtime hashes and
processing. Incoming root copy removed only after verifying both installed files.

Shared currency/component/loot resolvers now show supplied art in Inventory,
Conduit Upgrade balances, machine reward showcases, discovery-gated Creature
loot, battle pickups and results. Updated specifications/index/workflow/agent
guidance; source-specific intake is reproducible and bypasses keying for supplied
alpha. No economy/save/RNG changes; concurrent D-136 cost work preserved.

Validation:
- `python -m unittest discover -s tools -p 'test_component_art*.py'`:
  **4 passed**, including hashes/exact regeneration, alpha bypass, pale
  foreground retention, transparency/margins and prompt contract.
- `npm test -- src\presentation\conduit-upgrade.test.ts src\presentation\item-showcase.test.ts src\presentation\currency-icon.test.ts src\presentation\battle-loot.test.ts src\presentation\battle-results.test.ts src\presentation\inventory.test.ts src\game\conduit-upgrades.test.ts src\game\machines.test.ts`:
  **8 files /129 tests passed**.
- VS Code **Build Last Light** (`npm run build`): **passed** TypeScript/Vite;
  existing large-chunk warning only. Changed TypeScript diagnostics: no errors.
- Browser imported actual helpers into a temporary DOM-only preview: both images
  decoded at256px and displayed at80px using deployment-base URLs; screenshot
  reviewed. No account/storage writes; preview removed afterward.
- `git diff --check`: passed.

Remaining: no component-art work or owner decision required. Prismatica and
Null-Prismatica replacement crystal images remain separately pending.
No commit, deployment, currency grants or gameplay changes.

## Completed: rarity-scaled Conduit upgrade costs (D-136)

Updated date/contributor:2026-10-08 ~ Copilot. Owner requires upgrade costs to
scale with rarity. Implemented editable developer multipliers: Common1x,
Rare2x, Legendary4x, Omnic8x on25/50/100/175/250 base component costs.
Five-upgrade totals are600/1200/2400/4800 respectively.
[Specification and table](conduit-upgrades.md) persist the exact contract.

The shared [cost resolver](../src/content/conduits.ts) now requires the Conduit
and level; [atomic spending](../src/game/account.ts) and
[menu/confirmation](../src/presentation/conduit-upgrade.ts) use the same price.
Rules disclosure derives all four rows from tuning constants, not duplicate
hardcoded costs. Existing upgrade levels remain untouched: no load writes,
retroactive charges or refunds. Stat scaling/penalties/Omnic mechanics, drops,
copies, run snapshots and all other currencies are unchanged.

Validation:
- `npm test -- src\game\conduit-upgrades.test.ts src\presentation\conduit-upgrade.test.ts`:
  **83 tests across2 files passed**. Every25-name/five-step exact rarity price,
  one-component-short rejection without writes, exact-funds one-write spending,
  cap/legacy retention and Legendary preview/confirmation/success pricing tested.
- `npm run build` via Build Last Light: **TypeScript/Vite passed**, existing
  large-bundle advisory only. Changed TypeScript files have no IDE errors.
- Scoped `git --no-pager diff --check` covering changed runtime/tests/docs:
  **passed**, existing LF/CRLF advisories only.

Remaining: component currency art delivery still pending, unrelated to pricing.
No owner-save edits, dependencies, commit, push or deployment. No new owner
decision needed; exact numeric multipliers remain developer balance tuning.

## Completed: stronger future edge-clearance guidance and documentation (D-135)

Owner requests more emphasis on avoiding all image edges at every evolution,
without retracting from the actual art, and consolidation of prior discussion
and completed work. Future character/enemy prompts now require explicit positive
complete-design framing near subject and composition guidance: all tips visible,
continuous clear solid-background margins on all four sides/corners, no
touching/crossing/disappearing beyond frame. Pull back the whole ensemble
uniformly; never delete/simplify armor, equipment, powers, layers or ornamentation.
Dense imposing late-form interiors, compact renderer, identity/palette and
exact style references remain. Containment overrides historical near-edge
occupancy/margin targets for future prompts; no new numerical quota invented.
Existing prompt blocks/assets are unchanged; scenery remains full-bleed.

Updated the [cutout contract](../Art/guides/cutout-background-contract.md#complete-silhouettes-and-edge-clearance-d-135),
[shared guide](../Art/guides/midjourney-character-style-prompt.md#future-complete-design-framing-d-135),
[flagship art index](../Art/characters/Flagship%20Characters.md), agent entry point, game
vision, decision log, documentation index, root README and
[review workflow](art-workflow.md#future-edge-safe-composition-without-lost-detail-d-135).
Guide's obsolete "not live" flagship statement now reflects D-121/D-122/D-134.
Root README's older prototype overview is explicitly labeled superseded and
points to this handoff/index rather than presenting obsolete scope as current.
D-129 through D-135 are distinguished: prompt/reference improvements,
currency rename with crystal artwork pending, completed60-image intake and
future framing. Existing D-134 flagship/Roses specifications and provenance
already record the actual installed art and preserved generations.

Validation:
- `python -m unittest discover -s tools -p test_character_style_references.py`:
  **3 passed**; `-p test_character_portrait_quality.py`: **4 passed**;
  `-p test_enemy_style_references.py`: **3 passed**;
  `-p test_currency_art_prompts.py`: **1 passed**.
- Focused `tools.test_art_prompts.ArtPromptTests` runner excluding the two
  known Machine-conflicting aggregate methods: **26 passed**.
- `git diff --check`: **passed**. Documentation-only change; no build or
  gameplay test rerun needed. Existing generation blocks unchanged.

Remaining: actual generated-image edge clearance requires full-resolution
visual review; prompt wording cannot guarantee it. Already-clipped D-134 inputs
need owner replacement images to restore missing tips, not extra runtime
padding/background removal. No new images, runtime/save/economy changes or
commit/deployment. No additional owner decision required for this guidance.

## Completed:60 replacement character portraits (D-134)

Owner requests relocation/wiring and reviewed background removal for all new
root character art; explicitly confirms unnamed hammer-wielder as Bruno base.
Installed six forms each for Atmoso, Aurora, Bliss, Bruno, Disciple, Elise,
Razor, Rosetta, Thornia and Crinso. No starter delivery, so Infernis/Tizu/Flora
remain unchanged, as do icons, weapons, enemies, currencies and scenery.

All60 original PNGs are hash-preserved under `Art/source/character-refresh`;
all60 previous exports are preserved in `previous-runtime`. Historical D-121
originals/manifests are untouched. Canonical960px RGBA exports live under
`public/assets/characters` with864px content/48px minimum margins.
Root originals were removed only after source/runtime hash verification.
[Manifest](../Art/provenance/character-refresh-intake.json) and
[settings](../Art/provenance/character-refresh-settings.json) record every mapping/hash/
per-source key/gradient/gap/spill/facing setting.

Visually reviewed all ten six-form source and dark-background export sheets.
Green/teal, orange, red, blue, gray, white, black and gradient backgrounds use
source-specific cleanup. Difficult enclosed gaps received reviewed seeds;
dark armor, pale wings, Bruno's eyes and painted shadows remain. Bounded edge
decontamination removes backing-color spill; supplied alpha bypasses cleanup.
Some inputs already source-clip tips/body; no invented reconstruction.

Existing shared asset IDs wire new portraits into Home, Character, Squad,
Character Archive, both banner showcases/results, battle field and skill
cut-ins. Updated shared facing metadata handles new gaze/weapon poses.
No names/forms/stars/stats/economy/ownership/save changes. Historical roster
exporter verifies the preserved previous exports, not the active replacements.
[Workflow and validation](art-workflow.md#replacement-character-portraits-d-134).

Verification:
- `python tools\intake_character_refresh.py`: **60 validated** before intake.
- `python tools\intake_character_refresh.py --apply --remove-incoming`:
  **60 installed**, originals and historical exports verified/archived,
  all60 named root copies relocated; no remaining root PNGs.
- `python -m unittest discover -s tools -p test_character_refresh.py`:
  **6 passed**, exact reproduction of all60 archives/exports, historical
  source/export hashes, RGBA margins, reviewed holes, eye/alpha preservation
  and facing metadata.
- `python -m unittest discover -s tools -p test_roster_art_intake.py`:
  **6 passed**, original135-image historical provenance and unaffected assets.
- Post-cleanup `python tools\intake_character_refresh.py`: **60 validated**
  from archived sources; `python tools\intake_roster_art.py --phase bruno`:
  **12 historical assets validated**, no overwrite of replacements.
- `npm test -- src\content\character-art.test.ts src\presentation\unit-facing.test.ts src\presentation\archives.test.ts src\presentation\battle-cutin.test.ts src\presentation\roster.test.ts src\presentation\banner-showcase.test.ts`:
  **6 files /130 tests passed**, including all six-form resolver surfaces
  and60 refreshed facing values. IDE test runner had no registered tests;
  repository Vitest supplied these results.
- Existing **Build Last Light** task (`npm run build`): TypeScript/Vite
  **passed**, existing chunk-size advisory only. Edited TS/Python diagnostics:
  **no errors**. `git diff --check`: **passed**, LF/CRLF advisories only.
- Browser renderer preview decoded12 base/Omnic portraits for Rosetta,
  Thornia, Crinso, Bruno, Bliss and Disciple with960px dimensions, correct
  deployment-base URLs and reviewed mirror flags. A separate60-image preview
  tab became unavailable before its deferred result returned; no all60-browser
  success is claimed. Source/hash/regeneration tests cover all60. No test
  preview writes to local storage.

Remaining: source-clipped details require owner replacement images if desired,
not further background keying. No new gameplay, save migration, commit/push or
deployment. Other contributors' work retained.

## Completed: currency names and prism replacement prompts (D-133)

Owner confirms the premium spelling means the existing Lycalis currency and
chooses visible rename only, keeping internal keys/filenames. Main currency is
now **Prismatica**; premium is **Null-Prismatica** in UI, accessibility, errors,
reward messages and documentation. Includes uppercase currency-farm headings.
Legacy `fractalis`/`lycalis` fields/IDs/assets/functions/RNG remain. No migration,
economic math, balances, quantities, prices, odds, pity or transactions change.
Existing wallet versions still load without writes.

[Currency prompts](../Art/items/Currencies.md) are redesigned as bright ivory/silver/
chromatic prism and dark obsidian/violet counterpart, both with exact Evo.3
reference/weight400, contrasting flat green, opaque facets/no glow and complete
margins. Existing supplied coin/rose images remain; replacements were not
generated/intaken. Historical originals/provenance are untouched. New green-key
sources require reviewed supported intake, not the old source-specific brown
masks. [Compatibility](summoning-and-economy.md#currency-names-and-legacy-compatibility-d-133)
and [workflow](art-workflow.md#prismatica-and-null-prismatica-replacement-prompts-d-133)
record scope and validation.

Validation:
- `npm test -- src\presentation\ui-copy.test.ts src\presentation\currency-icon.test.ts src\presentation\inventory.test.ts src\presentation\hub.test.ts src\presentation\roster.test.ts src\presentation\battle-results.test.ts src\presentation\battle-loot.test.ts src\presentation\item-showcase.test.ts src\presentation\sanctuary.test.ts src\presentation\conduit-store.test.ts src\game\wallet.test.ts src\game\account.test.ts src\game\banner-and-lycalis.test.ts src\game\treasury.test.ts src\game\rosethorn-sanctuary.test.ts src\content\progression.test.ts`:
  **16 files /158 tests passed**. New tests verify renamed reward names with
  legacy IDs/amounts, exact maximum-safe balances, retained icons/DOM IDs,
  no load writes and insufficient-premium draw rejection without writes.
- `python -m unittest discover -s tools -p test_currency_art_prompts.py`:
  **1 passed**; `-p 'test_character_*.py'`: **7 passed**;
  `-p test_enemy_style_references.py`: **3 passed**.
- `python -m unittest tools.test_art_prompts.ArtPromptTests.test_currency_identities_remain_unique_objects`:
  **1 passed**. Focused aggregate suite excluding the two already-known
  machine-conflicting methods: **26 passed**.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 methods /28 pre-existing machine-pack assertion failures**, same baseline.
- Existing **Build Last Light** task (`npm run build`): TypeScript/Vite passed,
  existing large-chunk warning only. IDE diagnostics for new/edited tests and
  currency-farm renderer: no errors. `git diff --check`: passed.
- Snapshot comparison: **34 source/test files** contain only approved display
  substitutions (including uppercase farm headings); new tests audited separately.
- Nonpersistent browser summon/header preview: both names and exact
  `9007199254740991` balances present, legacy IDs retained, no horizontal
  overflow or currency-text clipping at381/450px CSS widths. No storage changes;
  preview removed by reload. Automated test interface found no registered tests,
  so the repository Vitest runner supplied the results above.

Remaining: owner-supplied replacement crystal artwork and reviewed intake.
No commit/push/deployment or new currency income. Other concurrent work preserved.

## Completed: enemy references and unit edge containment (D-132)

Owner requests style-reference suffixes only for all enemies, selects ascending
mapping, and adds a universal character/enemy no-edge-contact requirement.
All129 enemy generation blocks now end with one exact owner URL/`--sw 400`:
six-form lines1-6; eight-enemy lineups1/2/2/3/4/5/5/6; ten-enemy lineups
1/2/2/3/3/4/4/5/5/6; basic Adventure enemies1. No creature evolution/rarity/
stat/level metadata changes. Every one of226 character/enemy full-body blocks
explicitly prohibits touching the frame edges;109 missing clauses were added.
Existing margins, designs, backgrounds and other flags/negatives remain intact.

[Mapping](../Art/guides/midjourney-character-style-prompt.md#character-form-style-references)
and [workflow](art-workflow.md#enemy-style-references-and-edge-containment-d-132)
persist the rule. This extends D-129's original character-only scope to enemies,
not materials/icons/Conduits/weapons/scenery. Do not duplicate suffixes.

Validation:
- `python -m unittest discover -s tools -p test_enemy_style_references.py`:
  **3 passed**, exact129 enemy mappings/suffixes,226 full-body edge/margin/
  single-flag contracts and exclusion of non-unit prompt types.
- `python -m unittest discover -s tools -p "test_character_*.py"`:
  **7 passed**, retained character style/quality/reference contracts.
- Focused existing art-contract unittest runner excluding the two cross-pack
  aggregate methods: **26 passed**.
- Full art suite: **28 tests run,28 pre-existing assertion failures in
  Awaken the Machines,0 errors**; no new failure locations.
- Pre-edit snapshot verification: all134 changed generation blocks differ
  only by approved suffix/edge additions;149 other blocks in edited packs
  remain byte-identical. No design or background edits.
- `git --no-pager diff --check -- Art AGENTS.md docs\README.md docs\decisions.md docs\art-workflow.md docs\handoff.md tools\test_character_style_references.py`:
  passed with existing LF/CRLF advisories. Both affected Python tests have
  no IDE errors.

Remaining: generated-image containment/style requires visual review; signed
URLs may need refreshed owner links on expiry. No generation, supplied/runtime
asset replacement, gameplay/save changes, dependencies, commit or deployment.

## Completed: all Element-Bearer portrait quality (D-131)

Owner requests all character art meet Bliss/Rosetta/Rose-banner quality, then
chooses evolution portraits only. Revised all78 canonical portraits across
thirteen lines, plus nine late-form examples in the shared guide. Base identities
and early equipment remain; staged armor/regalia and character-specific rear
architecture become dense, vast and intimidating without realism/robot anatomy.
Legendary body scale is1/4 of canvas height, Omnic1/5; earlier forms1/3.
Whole ensemble targets50/60/72/84/94/96%, margins25/20/14/8/3/2%, with narrow
late key channels and clear eyes/hands/functional equipment. These are prompt
targets, not measured generated artwork.

All six forms repeat identity/anatomy/renderer/palette within each line.
Starter clauses are now normalized as well. Retained exact D-129 suffixes,
reviewed per-form keys, authored titles/asset IDs and weapon identities.
Canonical positive prose is211-377 words, below the380-word contract.
Per-pack D-131 precedence notes supersede historical pause/body-scale/sparse-gap
instructions. [Shared contract](../Art/guides/midjourney-character-style-prompt.md#portrait-quality-standard-d-131)
and [workflow](art-workflow.md#character-portrait-quality-d-131) persist future rules.

Validation:
- `python -m unittest discover -s tools -p "test_character_*.py"`:
  **7 tests passed**,78 complete canonical forms, exact progressive scale/
  spread/margins, bounded lengths, repeated identities/renderers/palettes,
  retained per-form keys, own-element rear density and97 exact reference suffixes.
- Focused Python unittest runner selecting the existing art suite except its
  two cross-pack aggregate methods: **26 tests passed**, including existing
  weapon/armor continuity, icon contracts and neutral wording checks.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 tests run;28 assertion failures, all in unchanged Awaken the Machines
  cutout/scenery blocks**, no errors. Portrait assertions updated only for
  intentional D-131 body/framing/coverage wording. Bruno's revised Rare armor
  and late guard now also satisfy its previously mismatched authored contract.
- Snapshot comparison: all78 canonical parameter/negative/reference suffixes
  and background keys retained; **91 nonportrait blocks byte-identical** in
  touched packs. Guide references continue passing their exact checks.
- `git --no-pager diff --check -- AGENTS.md Art\guides\midjourney-character-style-prompt.md "Art\characters\Starter Art.md" "Art\characters\Infernis Art.md" "Art\characters\Tizu Art.md" "Art\characters\Flora Art.md" tools\test_art_prompts.py docs\README.md docs\decisions.md docs\art-workflow.md docs\handoff.md`:
  passed; Git reports existing LF/CRLF conversion advisories only.
- Both edited Python test files have no IDE errors. No runtime build required
  for prompt/document/test-only changes.

Remaining: generated-image quality, actual canvas density and service
acceptance require visual review. No images generated or replaced, no runtime/
gameplay/save changes, dependencies, commit, push or deployment. Icons,
standalone weapons, creatures and scenery remain outside this pass.

## Completed: Broken Mechanical Components and Conduit upgrades (D-130)

Updated date and contributor:2026-10-08 ~ Copilot.
Current phase: implementation and validation complete; currency image pending.
Task/goal: stage-growing machine currency drops, five Conduit upgrades, icon
indicators, dedicated menu and shattered Omnic-machine currency prompt.

Confirmed requirements used: owner chooses account-wide levels per name,
preserving shared unlock/copy ownership; five +50%-of-original steps ending
at3.5x original modifiers (+250%). Owner explicitly confirms penalties grow
too. Omnic unique mechanics stay unchanged. Art workflow is prompt plus neutral
pending icon, not generated/custom SVG art.

Changes made and implemented behavior:
- [Specification](conduit-upgrades.md), D-130/index and directly related
  Conduit/machine/menu/art documents updated. Preserve concurrent D-129/D-131.
- [Currency/drop API](../src/content/mechanical-components.ts): every machine
  kill independently rolls25% for1 at stage1, linearly rising to85% for5 at35;
  rounded stage quantity, identical bosses/ordinary. This and costs are editable
  first-pass developer balance, not additional owner-authored numeric decisions.
- [Account](../src/game/account.ts): optional v3 `mechanicalComponents` and
  `conduitUpgrades`, no load writes/grants. Rewards/discovery/receipt commit
  together. Exact source/quantity/overflow checks and receipt dedup remain.
  `upgradeConduit` rereads ownership/expected level/cap/funds; one write spends
  only components and increments level. D-136 supersedes the original flat
  pricing with rarity-scaled costs; see the current specification.
  Copies/equipment/all other balances survive; rejected/failed actions spend0.
  Fixed validation so missing inventory cannot silently discard upgrade fields.
- [Modifiers](../src/content/conduits.ts) apply to both starter/captured stats,
  current-form stats, gear and upgrade/Max Level previews. All activities clone
  levels at entry; Continue/replay/Settings retain them. Drops/results use their
  actual event-level snapshots. Existing eight slots/four matching Omnic,
  critical cap/fractional stats and special mechanics remain unchanged.
- [Upgrade menu](../src/presentation/conduit-upgrade.ts): current/next values,
  stronger drawbacks, exact balance/cost, confirmation, cap/funds guards and
  explicit errors/focus. Menu/Inventory/Store/Archives/equipment/Gameplay
  navigation wired, farming link targets machine activity. Shared +0-5
  accessible markers across icons. Inventory third currency, discovery tables,
  showcase, actual loot/results show components with honest pending artwork.
  Fixed coupled glossary Conduit lookup incorrectly requesting material art.
- [Art prompt](../Art/items/Broken%20Mechanical%20Components.md): face-free shattered
  ivory/platinum vanes/halo/gears and prismatic opal core, compact Thornia/Crinso
  anime/cel renderer, no-glow solid-key contract. No missing runtime URL.

Validation: exact commands/checks and outcomes:
- `npm test`: final **993 tests across76 files passed**. Includes new
  [model](../src/game/conduit-upgrades.test.ts) and
  [presentation](../src/presentation/conduit-upgrade.test.ts) coverage:
  all35 thresholds/one-roll/RNG isolation, atomic failure/replay/source/overflow,
  all25 names/+0-5 modifiers/penalties, true critical-cap threshold,
  malformed/missing-inventory legacy saves without writes, shared ownership,
  five-step cost/cap/stale guards and all17 activity snapshots.
  Corrected related stale banner/showcase counts16/17. An initial saved-pity
  test timed out during concurrent build; `npm test -- src\game\integrated-economy.test.ts`
  then passed4/4, and both subsequent full runs passed993/993.
- `npm run build` via Build Last Light: **TypeScript/Vite passed** after final
  changes; only existing >500kB bundle advisory.
- `python -m unittest discover -s tools -p test_component_art_prompt.py`:
  **1 passed**, exact renderer/key/flags/no-glow/pending-art contract.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  latest **28 run,28 assertion failures across two aggregate methods**, all
  existing machine prompt/scenery blocks; no component prompt failures/errors.
  Concurrent D-131 resolves earlier character assertion mismatches. Unrelated
  machine prompt changes remain out of this feature.
- `git --no-pager diff --check`: **passed**, LF/CRLF advisories only. Changed
  runtime/new tests and component Python test have no IDE errors.
- Browser actual Menu -> Upgrade -> Earn components routing verified.
  In-memory storage exercises native cancellation/accepted confirmation, all
  five writes/balances575/525/425/250/0, exact +297.5% Attack/-35% Health,
  cap/insufficient controls, next-button/final-status focus, failed writes and
  stale clicks without partial save.25-name Upgrade/Inventory/Archive and both
  equipment surfaces have correct +5 labels, preserved80px gear artwork and no
  horizontal overflow at measured320/390/1280px; maximum-safe component balance
  remains full text. Wait for normal select enhancement before measuring.
  Fixtures removed, original1545x980 measured viewport/media restored, title
  reloaded. Owner storage unchanged:373 bytes/hash2915462111. Stable-click
  automation is unreliable in this shared browser; DOM clicks and native
  dialogs were used, not a claim of new screenshot validation.

Known issues and limitations: no component source image supplied/generated;
placeholder is intentional. Existing general machine prompt failures and large
bundle advisory remain. Local saves are still single-tab/non-authoritative.
No Conduit sales/evolution, copy consumption, additional acquisition sources,
artwork upgrades or economy exchanges added.
Open decisions/blockers: none for implemented gameplay; currency art delivery
is the next prerequisite.
Next concrete action: owner generates/supplies the prompt image; archive hash,
review alpha/offline key, export256px currency icon and register it. No
dependencies, owner-save changes, commit, push or deployment in this task.

## Completed: character-form style references (D-129)

Owner supplied evolution-specific style URLs, then clarified existing
base/Common uses Evo.1 and subsequent forms match Evo.2-6 directly.
Evo.0 is retained for explicitly numbered future forms/generic templates.
Owner narrowed scope to character forms only. All97 portrait/template blocks
across15 prompt files now end with one exact `--sref URL --sw 400`.
Fixed the missing space before the first link's weight flag; query strings
are otherwise preserved, including the intentional Evo.2/Evo.3 shared URL.
Icons, weapons, creatures, scenery, designs, key backgrounds, supplied assets,
runtime behavior and saves are unchanged.

[Shared mapping](../Art/guides/midjourney-character-style-prompt.md#character-form-style-references),
per-pack precedence notes and agent/workflow instructions persist the rule for
future prompts. Neutral wording is required, not moderation evasion or a claim
of guaranteed service acceptance. Signed Discord links may expire; request
owner-refreshed links rather than silently changing references.

Validation:
- `python -m unittest discover -s tools -p test_character_style_references.py`:
  **3 tests passed**, exact URLs/query parameters,97 mapped suffixes, renderer/
  single flags and excluded prompt types.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **28 tests run,29 assertion failures across3 test methods** from existing
  Bruno wording and machine cutout/scenery contracts. In-memory removal of only
  the new suffixes produces identical failure IDs/messages and no errors;
  these unrelated contracts were not changed.
- `python -m unittest tools.test_art_prompts.ArtPromptTests.test_character_prompts_use_neutral_non_explicit_wording`:
  **1 test passed** across existing character-pack generation blocks.
- New reference test has no IDE errors. No runtime build needed for prompt/
  documentation-only changes.

Remaining: generated-image style/acceptance still needs visual review; no
external generation or link availability verification was performed.
No gameplay changes, dependencies, commit, push or deployment.

## Current task: supplied machine artwork intake (D-128)

Completed the owner's28-image Awaken the Machines delivery. Archived every
original RGB PNG byte-for-byte under `Art/source/machines`; installed20 transparent
256px Conduit icons and six transparent960px enemy sprites. Supplied header/arena
are copied unchanged. All28 exact root duplicates are removed only after
source/export hash verification; no unrelated files removed.

[Intake tool](../tools/intake_machine_art.py) and
[manifest](../Art/provenance/machines-art-intake.json) preserve original/export hashes,
explicit source-specific RGB keys, protected foreground ellipses, bounded
two-source-pixel spill cleanup and reviewed facing. Manual dark/light review
preserves pale wings/armor, green Worldtree foliage/core and Watcher eyes,
cyan/opal crystals and intentional painted shadows. Thunderbird's disconnected
bottom source-frame line is removed specifically; supplied alpha bypasses all
key/frame processing on future intake.

Shared registrations wire all35 machine stages, arena/skill cut-ins, Gameplay
header, Creature discovery gallery, Inventory/Conduit Archive/equipment and
actual Conduit loot/results. Art pack metadata matches the six runtime IDs.
Gameplay, RNG, odds, economy, ownership and saves are unchanged.

Validation:
- `npm test -- src\game\machines.test.ts src\game\conduit-equipment.test.ts src\game\conduits.test.ts src\presentation\archives.test.ts src\presentation\art.test.ts src\presentation\machine-art.test.ts src\presentation\battle-loot.test.ts src\presentation\unit-facing.test.ts src\presentation\conduit-store.test.ts src\presentation\battle-cutin.test.ts`:
  **167 tests across10 files passed**. Initial runs exposed stale pending-art
  expectations and a wrong new-test import; corrected. Build then identified
  one unreachable null-art test branch; corrected exact current-art expectations
  and reran `npm test -- src\presentation\archives.test.ts`: **5 passed**.
  Final rerun after cleanup: **167 tests across10 files passed**.
- `python -m unittest discover -s tools -p test_machine_art*.py`: **8 passed**,
  including all28 source/export hashes, archived regeneration, transparency/
  padding, pale/green foreground preservation, alpha bypass and conflict/
  cleanup safety. Repeated after root cleanup: **8 passed**.
- `python tools\intake_machine_art.py --apply --remove-incoming`: installed/
  verified28 and removed only mapped copies. Subsequent
  `python tools\intake_machine_art.py`: **verified28 from archives**.
  Exact-path check confirms28 archived originals/28 exports/zero mapped root
  copies. Scoped `git diff --check` passed.
- `npm run build` via Build Last Light: **TypeScript/Vite passed**, existing
  large-bundle advisory remains. Edited runtime/test files have no IDE errors.
- Browser in-memory fixtures verify all28 asset loads/natural dimensions,
  header, six forms at stages1/7/13/19/25/31 plus final35, correct image-only
  facing/arena, actual high-level ultimate portrait, equipped icons and receipt
  loot icons. Gameplay/Inventory/Archive/equipment/battle DOM has no horizontal
  overflow at measured320/390/1280px. Fixtures do not fund accounts or persist
  battles; byte-identical373-byte storage checksum2915462111 is unchanged.
  Fixtures/listeners removed, viewport/motion restored, reload returns title.
  Integrated-browser async decode/clock/stability and screenshot paint were
  unreliable; load/dimension/DOM checks and offline cutout reviews are verified,
  not a claim of reliable new UI screenshot inspection.

Remaining: none for this art request. Wider Common drop locations remain the
existing deferred design question, unrelated to intake. No owner decision,
dependency changes, commit, push or deployment.

## Current task: visible separators and copy spacing (D-127)

Owner confirms all visible UI separators should use spaced ` ~ `, not slashes.
Updated authored display literals throughout menus, activities, banner/showcase
headings, element/role labels, gear/economy text, rules, combat logs and HP/Gauge
current-maximum readouts. Corrected joined words/numbers and punctuation spacing.
The cited event caption is now **35 stages ~ Enemy levels 80-140**.
No post-render text replacement; source copy is corrected. Syntax-aware bulk
editing touched literals, not arithmetic/paths/markup/save keys. Related tests
retain exact values with the new separators.

Validation:
- `npm test`: **933 tests across 73 files passed**, including new
  [rendered-copy contracts](../src/presentation/ui-copy.test.ts).
  Initial run identified two stale regex/impact expectations; updated exact
  tilde expectations. New contract caught remaining "3+/4+/5+" prose; corrected.
- `npm test -- src\presentation\ui-copy.test.ts`: **2 passed**.
- `npm run build` through Build Last Light: TypeScript/Vite passed; existing
  large-bundle advisory remains. Edited caption/new test have no IDE errors.
- Browser nonpersistent Gameplay preview at measured 320/390/1280px verifies
  the exact event caption, no visible slashes, natural wrapping and no horizontal
  caption/page overflow. Browser navigation automation retains its existing
  artwork timeout caveat; no transitions changed. Preview removed, viewport/
  motion restored, reload returns title and storage is byte-identical.

Remaining: none for this request. No dependencies/commit/push/deployment.

## Completed: base-form banner Showcase (D-126)

Owner explicitly chose Showcase buttons/base-form gallery rather than inline
final-evolution thumbnails. Both Home promotions and the selected Summon panel
now open a shared responsive native gallery dialog. Standard lists its10 real
5/6-star Element-Bearers, Roses its3, derived from actual banner pools. Each
card has canonical base-form color portrait/facing/name,48px element medallion/
label and awarded stars. Ownership/current evolution never hides or substitutes
art. No creatures, extra summon controls or save changes. Existing banner
artwork, text-only availability strip/rate table and special tile route remain.

Implementation: [shared renderer](../src/presentation/banner-showcase.ts),
[scoped gallery CSS](../src/presentation/banner-showcase.css) and
[tests](../src/presentation/banner-showcase.test.ts). Reuses existing native
Information dialog binding for focus containment/Close/Escape/focus return.

Validation:
- `npm test -- src\presentation\banner-showcase.test.ts src\presentation\hub.test.ts src\presentation\roster.test.ts src\presentation\menu-information.test.ts`:
  **59 tests across4 files passed**. Updated old first-dialog/text-strip boundary
  assertions to refer explicitly to Rates dialog and availability section.
- `npm run build` via Build Last Light: TypeScript/Vite passed; existing
  >500kB advisory remains. New renderer/test/CSS have no IDE diagnostics.
- Both galleries at measured320/390/1280px: all real portrait/emblem images
  decoded, no dialog horizontal overflow,197px minimum measured phone portrait,
  48px element medallions. Standard10/Roses3 base names confirmed.
- Actual Home/Summon controls open correct galleries. Native focus containment,
  Close return and dispatched Escape return verified. Existing automation
  transition artwork timeout remains; full animated traversal is not claimed.
  Initial focus test during inert loading was repeated after loading ended and
  passed. No transition changes/workarounds in application code.
- Browser storage byte-identical; no draw/resources granted. Media/viewport
  restored and reload returns title, removing transient gallery state.

Remaining: none for this request. No commit/push/deployment.

## Completed: Home special banner promotion (D-125)

Replaced Home's text-only Passion activity tile with the supplied Roses Under
Sunny Skies summon artwork, same center/cover crop and responsive height as
Standard. Shows the real banner name and exact **Special Limited Time Banner!**
copy. Reuses existing `data-rose-banner` navigation to open Summon with Roses
selected. No artwork/source changes, spending, odds, scheduled expiry or
availability changes; the Passion activity remains in Gameplay/Menu.

Validation:
- `npm test -- src\presentation\hub.test.ts src\presentation\roster.test.ts src\presentation\menu-history.test.ts`:
  **54 passed across3 files**.
- `npm run build` via Build Last Light: TypeScript/Vite passed, existing
  >500kB advisory only. Edited files have no IDE errors; `git diff --check` passed.
- Browser measured320/390/1280px: both tiles have matching heights, center/cover
  artwork and fitting text with no horizontal page overflow. DOM click opens
  the real Roses Summon panel (`aria-current=page`) with supplied art loaded.
  Native automation click stalled on stability; DOM click verified the actual
  registered handler instead. Save remained byte-identical; reload returns
  title and reduced-motion emulation restored. No draw performed.

Remaining: none for this request. No commit/push/deployment.

## Completed: Awaken the Machines and earned Conduits (D-124)

Owner approved the35-stage Lv.10-120 machine mode, bosses every5, Omnic
eligibility from stage26, independent per-kill8% Rare/3.5% Legendary/1% Omnic
rolls, and an extra0.5% Legendary bonus on each real banner. "Uncommon" means
Rare/silver, not a new tier. Owner canceled the Rosetta revert: her prompts
and supplied images remain unchanged. See [specification](awaken-the-machines.md)
and [28 complete art prompts](../Art/creatures/Awaken%20the%20Machines.md).

### Implemented phases

- Catalog: preserves five Common purchases; adds five Rare two-stat buffs,
  five Legendary85% buff/-10% penalty designs and ten element-specific Omnic
  three-stat designs, each with a working combat mechanic. Max four Omnic per
  character, matching combat element, enforced for starter/captured gear at
  UI/save/transaction/fighter boundaries. Shared unlocks/eight slots remain.
- Gameplay: six machine Creature forms, real skills/shared growth, stage
  selection/unlocks, discovery, sessions/Continue/replay/Settings. Ordinary
  Prismatica, no captures/materials/Null-Prismatica/clear bonus. Dedicated Conduit RNG
  leaves other streams unchanged. Per-kill currency/items/discovery/receipt
  save together, rejecting invalid rewards/overflow without partial writes.
- Summon: normal outcome/odds/pity/conversion stay unchanged. Both banners
  roll the additional item separately and save cost/main reward/bonus/pity
  atomically. Failed/unaffordable/overflow draws never charge or advance;
  no automatic gear changes. The extra roll uses the supplied random callback,
  not a separately persisted banner seed.
- Presentation: machine activity/rules, real Conduit loot/results, Inventory/
  Archives pending-art cards, bronze/silver/platinum/prismatic badges, sparkle
  respecting both reduced-motion preferences, disabled invalid gear choices,
  banner bonus status/disclosure and exact pending combat charges in Battle
  menu. Store remains Common-only. No new missing-image URLs.
- Art:20 item icons, six escalating mechanical creatures,3:1 header and16:9
  arena prompts in the final Thornia/Crinso compact/cel style. Element-scorched
  wasteland/awakening central white machine scenery; keyed, opaque/no-glow
  cutouts. No image service was used and no new PNG generation is claimed.
- Documentation: updated decision/index/specification, Conduit/economy/
  gameplay/art guidance and this persistent handoff. Wallet stays version3;
  no load writes or retroactive grants.

### Verification

- `npm test`: **928 tests across71 files passed**, including exact Crit/
  momentum/Defense-pierce values, nonstacking shields, acquisition boundaries,
  separate reward RNG, atomic bonus failures, all ten mechanics and gear rules.
  Earlier full run exposed two stale activity counts and a concurrent economy
  timeout; counts updated, economy passed isolated, final full reruns passed
  without changing timeouts. Updated Inventory Information assertion for new
  acquisition wording; final full run passes.
- `npm test -- src\game\machines.test.ts`: **20 passed**, including bonus
  overflow/no random roll on unaffordable draws.
- `python -m unittest discover -s tools -p test_machine_art_prompts.py`:
  **3 passed**, validates all28 prompt IDs/formats/escalation/scenery.
- `npm run build` via Build Last Light: TypeScript/Vite passed; existing
  >500kB advisory remains. Edited test/readout files have no IDE diagnostics.
- Browser actual Gameplay machine panel shows35 stages/Lv.10-120/exact odds/
  stage26 gate. Nonpersistent BattleView fixtures render real machine enemy
  state and final-stage victory with actual Duplex Heart reward, no Continue
  or missing machine-art requests. At measured CSS widths320/390/1280,
  endgame HP/reward readouts fit without horizontal page overflow.
- In-memory Inventory with all25 entries/maximum-safe counts displays20 honest
  pending-art cards and exact quantities; no count/page overflow at320/390/1280.
  Omnic sparkle disables under reduced motion.
- Existing automation clock/artwork decoding again triggered an activity
  transition timeout; full animated traversal is not claimed. No transition
  code changed to accommodate the harness. Browser fixtures are destroyed,
  media/viewport restored, reload returns title, localStorage SHA-256 remains
  unchanged; no test funding or persistent synthetic battle.

Remaining: generate/review/intake the28 artwork exports. Wider Common drop
locations intentionally deferred by owner approval; purchases are unchanged.
Balance/mechanics are editable first-pass developer tuning, not new owner
decisions. No new dependencies, commit, push or deployment. Prior intake and
Inventory work remains completed below; unrelated Bruno prompt-test caveat stays.

## Completed: Inventory and right-side Menu revamp (D-123)

Implemented the owner's Sanctuary HTML/Markdown Inventory and second-image
Menu composition with the game's neutral charcoal/ivory palette, Georgia text
and real artwork. See [contract](menus-and-inventory.md#inventory-and-right-side-menu-revamp-d-123).

- Inventory now has large Prismatica/Null-Prismatica cards, accessible Materials/Conduits
  pill tabs and positive-holdings artwork grids. Counts mean distinct owned
  types; fourteen empty slots are decorative. Exact numbers, empty CTAs and
  explicit unavailable-save errors are preserved.
- Tab binding changes only panels/focus/transient selection. Settings rerenders
  preserve selection; menu snapshots restore it on Back. Title resets Materials.
  No wallet fields, balance changes, item grants or transaction changes.
- Native Menu is a scrollable right-edge full-height drawer with featured
  Inventory/Collections and Conduit Store/Opening Story/Settings/title utilities.
  Remaining destinations stay in a compact grid because Last Light has no dock.
  Close/Escape/backdrop/current-route dismissal, native focus containment/return,
  >=44px controls and both reduced-motion preferences remain.
- Removed obsolete global Inventory container styling that competed with the
  new layout. Selecting the current Conduit Store now closes Menu consistently
  before the existing early return.
- Added [Inventory/drawer tests](../src/presentation/inventory.test.ts); updated
  three old assertions to allow the intentionally approved empty Store shortcut.

Verification:
- `npm test -- src\presentation\inventory.test.ts src\presentation\hub.test.ts src\presentation\sanctuary.test.ts src\presentation\conduit-store.test.ts src\presentation\menu-information.test.ts src\presentation\menu-history.test.ts src\presentation\currency-icon.test.ts`:
  **64 tests across7 files passed**.
- `npm test`: **907 tests across70 files passed**.
- `npm run build` through Build Last Light: TypeScript/Vite passed; existing
  >500kB bundle advisory remains. Edited TypeScript has no IDE diagnostics.
- Browser in-memory empty/populated previews and actual Inventory bindings:
  full maximum-safe counts, all8 preview images decoded, no horizontal page/
  count overflow at measured CSS widths320/390/769/1280. Currency cards stack
  on phones; drawer is390px wide at390px viewport and scrolls its longer content.
  All drawer buttons meet44px minimum.
- Dispatched Left/Right/Home/End browser keyboard events verify selected tab,
  visible panel and focus, including wrapping. Native modal rejects outside
  focus; Close/Escape/outside-click return focus, interior clicks stay open,
  current Inventory closes Menu, Settings never stacks with Menu and closing
  Settings preserves Conduits selection/returns Menu focus.
- Browser automation's native key injection did not deliver these keys, so
  keyboard handlers were exercised with DOM events. Paused animation timing
  also caused an existing activity-transition artwork timeout during automation;
  full animated traversal was not claimed as a successful browser check.
  No transition implementation was changed to work around the harness.
- Browser fixtures/tab/dialog interactions left localStorage byte-identical
  before preview removal. Reload removed previews and returned to title;
  SHA-256 comparison confirms the save is still unchanged afterward.
  No account funding or save rewrites.

Remaining: no requested UI features deferred and no owner decision needed.
No commit, push or deployment. Prior135-image intake/flagship implementation
remains completed below; its unrelated prompt-test caveat remains unchanged.

## Current task: phased supplied roster/event art intake (D-121)

Owner supplied135 opaque RGB PNGs in the repository root and requests section-
by-section intake, removal of loose root originals, and correct character
implementation. Clarified that the seven art-only flagships must become playable
too, not merely archived. D-122 confirms authored Standard assignments: Atmoso/Bruno/
Elise join its existing1% total five-star tier; Aurora/Bliss/Disciple/Razor
join its planned0.1% total six-star tier. Equal entries within each tier;
Roses is unchanged. All seven are now playable, with reviewed supplied art.
The earlier Bliss/Bruno reversal was a documentation transcription error;
their authored stars were not changed.

### Phase 1: Roses characters and event — implemented

[Intake tool](../tools/intake_roster_art.py) maps51 sources explicitly:
18 Rosetta/Thornia/Crinso portraits,18 ability icons (including Defense),
six Roselius forms, six Rosethorn materials, event header/arena/summon art.
Byte-identical originals live under `Art/source/roster-intake/roses`;
[manifest](../Art/provenance/roses-art-intake.json) records source/runtime hashes,
per-source key settings and reviewed facing metadata. Historical sources
and existing replacement manifests are untouched.

Reviewed all48 cutouts on dark/light sheets. Source-specific muted green/
teal keys clear enclosed openings; exterior white frames are removed only
at the exterior. Omnic Roselius has an additional reviewed warm-backdrop
polygon; ivory wings/hair, gold rings, red roses and painted effects remain.
Transparent supplied-alpha sources bypass all cleanup. Scenery is copied
byte-for-byte. No runtime keying.

Registered all six forms in the shared character resolver, portraits/cut-ins,
facing metadata, battle/catalog/captured Roselius, material resolver/loot/
inventory/recipes, event header/arena and summon panel. Rose ability icons now
include supplied Defense; original starters still keep text-only Defense.
No kits, odds, pity, costs, ownership, saves, rewards or unlock changes.
Root cleanup removes only byte/hash-verified copies after archival/review/tests.

Validation:
- `python -m unittest discover -s tools -p test_roster_art_intake.py`:
  3 passed (51 hashes/exports, alpha bypass, facing).
- `npm test -- src\content\rose-art.test.ts src\content\character-art.test.ts src\game\crimson-roses.test.ts src\presentation\ability-icon.test.ts src\presentation\unit-facing.test.ts src\content\summon-banners.test.ts`:
  180 passed. First run identified two outdated art-pending expectations;
  corrected to delivered-art assertions.
- `npm run build` via Build Last Light task: TypeScript/Vite passed;
  existing >500kB bundle advisory remains.
- IDE test discovery found no tests; used repository Vitest runner.
- `npm test`: all833 tests across68 files passed. The full-suite first run
  exposed the old14-banner assertion; now verifies all15 supplied activity
  panels and specifically the Roses header.
- `python -m unittest discover -s tools -p test_rose_art_prompts.py`:
  12 passed, including the earlier Omnic density revision.
- Browser synthetic previews load the actual Roses summon/event panels,
  all six material icons and Rosetta Omnic/ability art without save writes.
- `python tools\intake_roster_art.py --phase roses --apply --remove-incoming`:
  verified all source/runtime hashes before removing51 root copies.
  Repeated intake tests passed;84 root PNGs remain for Phase2.

### Phase 2: seven flagship art packs - implemented

Atmoso, Aurora, Bliss, Bruno, Disciple, Elise and Razor each have12 installed
assets, their own `Art/<character>-art-intake.json` and byte-identical originals
under `Art/source/roster-intake/<character>`.135 total delivered assets are now
archived and installed across all eight phases.

Owner explicitly reminded that every opaque PNG needs its varying-color
background removed. Reviewed every flagship on dark/light sheets. Warm and
overlapping palettes use border-connected RGB-distance keys and individually
reviewed enclosed-background seeds, not unsafe global hue erasure of skin,
gold or basalt. Disciple/Razor use reviewed hue cleanup. Selected accidental
thin exterior icon frames have source-specific removal; preserved authored
gold passive frames, Bliss's teal skill2 backplate, pale feathers/gems and
painted effects/shadows. Supplied alpha always bypasses cleanup.
Registered42 source-facing entries; no baked flips or runtime keying.

Each pack was installed separately, validated, then its12 incoming copies
removed only after archive/runtime/incoming hash verification.
All135 root copies are removed; historical sources remain untouched.
Regeneration uses archives, not deleted incoming files.

### Phase 3: playable flagships and Standard - implemented

[Flagship contract](flagship-characters.md) and
[catalog](../src/content/flagships.ts) own identities, exact six titles,
first-pass original narrative/stats/kits and six-action icon maps.
Shared roster validation now recognizes all13 EBs; only Infernis/Tizu/Flora
remain opening choices. Ordinary elemental progression/fodder, squads,
equipment, Archives, all activities, battle/cut-ins and snapshots reuse
existing helpers. Archive now has78 EB forms plus30 captured forms,108 total.

Standard has22 outcomes: six five-star EBs share1% total, four six-star EBs
share0.1%, twelve creatures share98.9% with50:30:17 weights.
All tiers split equally within entries; Roses remains unchanged.
Current Standard highest-star pity is six-star, preserving existing counters
without load writes/reset. Five-star results advance both counters.
Cost remains10 Null-Prismatica; owned EBs still convert to Lv.50 Treasury Omnic copies.
No grants, save replacement, new income, equipment or retroactive spending.

Disciple's real ally attack boosts are bounded/temporary/nonstacking, affect
all living squad members, and persist in cloned encounter state/Settings.
Thoughtspark also deals actual single-target damage; other skills shield/buff.
Status events and Battle-menu details show the applied increase/expiry.
Separate stage entry resets it; Adventure Continue advances its lifetime.
Normal engine recovery, independent RNG and atomic rewards remain unchanged.
Numerical kits/lore are developer first-pass tuning, not owner-approved final
balance. A nine-fixture solo boss trace informed role-preserving Support
tuning without changing enemy endpoints or weakening clear requirements.

### Phase 4: final validation

- `npm test`: **903 tests across69 files passed**. Initial runs caught a
  type-import cycle, stale15-outcome/66-form/pity expectations and insufficient
  solo Support tuning; fixed those causes and retained all original clear tests.
- Build Last Light task (`npm run build`): TypeScript/Vite passed;
  existing >500kB chunk advisory remains.
- `python -m unittest discover -s tools -p test_roster_art_intake.py`:
  **6 passed**. Covers all135 hashes, alpha/padding, warm skin/stone and pale
  wings, disconnected edge-tip/interior-frame preservation and reviewed facing.
- `python -m unittest discover -s tools -p test_rose_art_prompts.py`:
  **12 passed**.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
  **27 passed,1 existing failure**. Bruno Rare's unchanged prompt says
  "ornate basalt and pale opal segmented plates"; the earlier D-109 test
  requires the different literal "segmented basalt plates" in that block.
  Intake changed no prompt bodies. Updated only newly obsolete art-only/
  unspecified-banner status checks; did not rewrite unrelated prompt content.
- For each flagship phase:
  `python tools\intake_roster_art.py --phase <character> --apply --remove-incoming`.
  All seven archive/runtime/incoming checks pass before targeted root removal.
  For every phase, repeat `python tools\intake_roster_art.py --phase <phase>`;
  archived source output/provenance must match installed bytes.
- Browser synthetic previews: all84 flagship asset URLs return200;
  actual Bliss Omnic/action images load; maximum-safe-integer balances retain
  exact text and narrow layout has no horizontal page overflow.
  Standard disclosure has22 rows, six-star highest pity and98.9% creature
  remainder. Synthetic render reports localStorage unchanged.
  No real summons/upgrades or player save edits were performed.
- Scoped `git --no-pager diff --check -- <task files>` passed; only the
  repository's ordinary LF-to-CRLF advisories were emitted.

### Remaining / owner decisions

No requested art intake or playable acquisition surface remains pending.
Production balance playtests and optional owner review of first-pass kits/
narrative remain. Seven standalone weapon/focus PNGs were not supplied; their
prompts are not equipment mechanics and no missing URLs were added.
The unrelated Bruno literal prompt-test mismatch above remains visible.
No new owner decision is needed to use this roster; any final balance/lore
changes should be explicitly requested rather than inferred from symbols.

No commit, push or deploy. Browser checks use synthetic preview data without
writing or replacing the player's save; preview removed by reload afterward.
Browser checks are presentation/asset/save-invariance checks, not a full
manual gameplay end-to-end claim.

## Latest: Rosetta Omnic rear-effect density (D-120)

Owner clarifies late forms should be very busy/chaotic with detailing/energy
behind characters and almost no dead space, final three evolutions especially.
Requested [Rosetta's Omnic](../Art/characters/Rosetta%20Art.md) only now.
That prompt now builds dense overlapping rose mandalas, branching thorn
lattice, radial petal rays, counter-sweeping ribbons and clustered prism
fragments behind her body/wings. Explicit interior density/no large empty
patches, not only wide bounding span. Narrow key channels/clear face-bow window
keep eyes/weapon readable and remaining background flat green.
Compact2.5-3-head anatomy/body1/3/eyes-only anime-cel renderer, chromatic
crimson/gold/ivory identity, main wing/pose/mantle/bow foundations,96% span/
2% edge margins and no-glow powers unchanged.

Earlier five portraits, icons/final bow and other packs untouched.
Prompt compressed to maintain the existing350-word bound without removing
core identity/continuity. Added exact density/readability/scope regression;
shared guidance records final-three density emphasis but no automatic rewrites.
Runtime/economy/scenery/assets unchanged. **Pause for Rosetta Omnic review.**
No images generated/replaced, commit/push/deploy. Actual visual density
and service acceptance still require generated-output review.

## Latest: Roselius/materials and Crinso art progression (D-118/D-119)

Owner requests Thornia-style progression for Roselius and its drops, then
explicitly adds Crinso in the same turn. Revised each pack separately:

- [Passion of Crimson Roses](../Art/creatures/Passion%20of%20Crimson%20Roses.md):12 cutouts,
  six fixed female Luminous Roselius forms and Seed/Bud/Bloom/Crest/Heart/Soul.
  Fixed ivory core/crimson crest/two eyes/compact2.5-3-head anatomy/body1/3/
  anime-cel renderer. Weaponless right-facing open-palm casting,6/8/16 late
  wings; armor/seams/pauldrons/mantle/crown and rose/thorn structures strengthen.
  Omnic retains main eight wings/airborne twist/mantle/collar/three rings and
  expands with auxiliary wings/fourth ring/nine roses/interwoven arches.
  Face-free materials remain distinct two-thirds-square collectibles with
  small-icon readability; Soul retains Heart's core/petal armor/thorns/two
  rings/six ribbons, adding layered petals/crown/ring/ribbons. Same rose
  palette/painted chromatic facets. Three scenery prompts unchanged.
- [Crinso Art](../Art/characters/Crinso%20Art.md):13 blocks, six portraits/six icons/final
  weapon. Fixed hair/rose tie/eyes/compact anatomy/body1/3/renderer/palette.
  Full armor/mantle/crown and4/8/16 wings, opposed gold-flame/crimson-lightning
  petal vanes/counter-sweeping ribbons/tilted rings/off-axis thorn fans.
  Exactly one connected double-ended two-edged sword with central grip/two
  opposed blades/continuous spine. Rose hub closed->half-open->open->fully
  blossomed/nested; rails and span grow1/1.25/1.5/2 body heights from Rare.
  Omnic retains Legendary's main wings/airborne twisting sweep/mantle/collar/
  sword architecture and expands each; icons/final sword match.

Portrait ensembles in both packs target50/60/72/84/94/96% width/height with
25/20/14/8/3/2% key margins; late structures spread toward all sides/corners.
Full tips/readable faces/equipment/open channels/flat green keys/opaque no-glow
powers retained. Proper names/rarities outside cutout prose; headings/asset IDs
unchanged. Tests cover exact structure/identity/margins/word limits and retained
final creature/material/weapon architecture. Rosetta/Thornia untouched.
All requested rose art lines individually revised; **pause for latest pack
review**. Outputs/style/coverage still need generation/visual review/intake.
No runtime/capture/drop/sale/cost/banner/save changes, images replaced,
commit/push/deploy. Creature visual progression does not enable copy evolution.

Verification: `python -m unittest discover -s tools -p 'test*art_prompts.py'`
ran39 tests:38 passed, only the documented pre-existing Bruno wording
assertion failed. Inline discovery excluding that exact known test ID
passed38/38, including four new creature/material/Crinso regressions.
`python -m unittest discover -s tools -p test_rose_art_prompts.py` passed11/11.
All25 revised cutout positive blocks<=350 words (Roselius maximum312,
materials181, Crinso328). Bulk revisions asserted unchanged headings/IDs
and byte-equivalent normalized scenery section before adding acceptance docs.
501 relative file links resolved; both revised packs' whitespace clean.
Scoped `git diff --check` passed with line-ending advisories only; Python
editor diagnostics clear. No game build needed for art/docs/test-only edits.
Generated visuals/moderation acceptance remain unverified.

## Latest: Thornia elegant thorn-storm progression (D-117)

Owner calls Rosetta a good start, asks future art become increasingly chaotic,
elegant and spectacular, and moves next to Thornia.
Revised [Thornia's13 blocks](../Art/characters/Thornia%20Art.md), Phase9: six portraits/
six icons/final greatsword. Fixed dark hair/crimson rose clasp/narrow eyes,
compact2.5-3-head anatomy/body1/3 and identical anime/cel/palette clauses.
Plain knight -> first plates -> segmented thorn armor/mantle/winglets ->
four-wing eclipse guard -> eight-wing thorn court -> sixteen-wing rose empress.
Charcoal/crimson/gold/ivory plus late amethyst/rose-violet/warm opal facets;
greatsword progresses to triple gold thorn spine/nested rose guard/2-body blade.

Tilted broken eclipse rings, offset spiral thorn fans, opposing ribbon sweeps,
ivory roses and interwoven open arches grow wild but deliberately elegant,
never a featureless tangle. Whole ensembles target50/60/72/84/94/96% canvas
width/height with25/20/14/8/3/2% per-side key margins. Omnic retains Legendary's
main eight wings/airborne twisting sword sweep/raised knee/royal mantle/high
collar/sword foundations and expands each. Complete eyes/feet/blade/guard/grip/
wing tips/open channels/green key/no-glow/text exclusions preserved.
Names outside prose; headings/IDs match runtime. Icons remain readable symbols;
final sword/Last Flare match thorn/eclipses. No mechanics/asset changes.

Dedicated tests replace old Thornia template assertions with continuity,
exact spread/margins, staged armor/sword/effect growth and retained final
architecture/icon/weapon checks. Shared future direction and phase docs updated.
Rosetta/other prompt bodies untouched. **Pause for Thornia review; Crinso pending.**
Targets need generated-output review; no generated/replaced images,
commit/push/deploy or runtime/economy changes.

Verification: `python -m unittest discover -s tools -p 'test*art_prompts.py'`
ran35 tests:34 passed, only the documented pre-existing Bruno wording
assertion failed. Inline discovery excluding that exact known test ID
passed34/34, including both new Thornia regressions. All13 Thornia positive
blocks<=350 words (Legendary316/Omnic338).487 relative file links resolved,
Thornia whitespace clean; scoped `git diff --check` passed with line-ending
advisories only, Python editor diagnostics clear. No game build needed for
art/docs/test-only changes. Generated appearance/coverage still needs review.

## Latest: Progressive whole-artwork Rosetta spread (D-116)

Owner clarifies increasingly resplendent designs should spread over the entire
art piece, never touch the screen edges. [Rosetta](../Art/characters/Rosetta%20Art.md)
six portraits now target complete ensemble spans50/60/72/84/94/96% width/height,
with25/20/14/8/3/2% per-side solid key margins. Legendary/Omnic explicitly spread
wings/mantle/thorn arches/ribbons toward every side and corner, not an isolated
central cluster. Same compact anatomy/body1/3/eyes-only renderer, chromatic
identity, open channels, full tips/face/bow and no-glow remain.
Icons/weapon/other characters/runtime/economy unchanged.
Regression checks all six exact spans/margins and late directional spread.
**Pause for Rosetta review.** These are generation targets, not measured images;
complete-ensemble bounding spread is not painted-pixel coverage.
No generated/replaced images, commit/push/deploy.

Verification: inline unittest discovery `pattern='test*art_prompts.py'`
excluding only the documented pre-existing Bruno assertion passed32/32.
All13 positive blocks<=350 words (Legendary325/Omnic348).
Scoped `git diff --check` passed, line-ending advisories only; Python editor
diagnostics clear. No game build needed for art/docs/test-only changes.

## Latest: Rosetta chromatic / near-full-canvas late forms (D-115)

Owner requests more chromatic/resplendent Legendary/Omnic and almost full-screen
effects. Revised [Rosetta](../Art/characters/Rosetta%20Art.md) late portraits with
rose-violet/sapphire-blue/warm opal facets across armor/wings/bow/rings while
crimson/gold/ivory remain primary. Legendary complete ensemble targets90% of
canvas width/height with5% key margin; Omnic94% with3%. Compact2.5-3-head
anatomy/body one third unchanged. Effects/regalia fill surrounding space,
not larger bodies, scenery or cropped tips. Face/bow/open channels/no-glow/
renderer/Legendary->Omnic architecture preserved. Last Flare/final bow share
facet accents; early portraits, other icons and other character packs untouched.

Dedicated regression checks exact coverage/margins, unchanged anatomy and
readability clauses, chromatic accents/retained core, word limits and limited
scope. **Pause for Rosetta review.** Runtime/banner/economy untouched.
These percentages are prompt targets, not measured generated coverage.
No images generated/replaced, commits or deployment.

Verification: inline unittest discovery with `pattern='test*art_prompts.py'`
excluding only the documented pre-existing Bruno assertion passed32/32.
Legendary314/Omnic337 positive words; all13 blocks<=350. Scoped
`git diff --check` passed with line-ending advisories only; changed Python
editor diagnostics clear. Art/docs/tests only, no game build needed.
Actual visual coverage/resplendence needs generated-output review.

## Latest: Compact Rosetta restoration / amplified splendor (D-114)

Owner withdrew the less-chibi late proportions and requests the previous
Bliss/Bruno style with stronger effects/splendor through Omnic.
[Rosetta](../Art/characters/Rosetta%20Art.md) now retains identical rounded oversized
head/tiny torso/short limbs/2.5-3-head proportions and body one third of canvas
in all six portraits. Eyes-only identity/palette/anime-cel renderer unchanged.
No elongated limbs, larger body framing or giant anatomy.
Retains ornate armor/bow/mantle,4/8/16 wings and Legendary->Omnic architecture;
amplifies staged rose fragments, sweeping crimson petal ribbons, gold thorn
fans/open arches and final orbital rings/nine ivory roses.
Icons/final bow/headings/IDs/keys/no-glow/padding unchanged.

D-113 six-star metadata/1.1% equal character tier and pity remain intact.
No runtime/economy/save changes this phase. Shared current guidance/tests
restore compact anatomy; D-113 anatomy notes below are superseded history.
Thornia/Crinso copy bodies untouched, next revisions follow this restored rule.
**Pause for Rosetta review.** No images generated/replaced, commits or deployment.

Verification: inline unittest discovery with `pattern='test*art_prompts.py'`
excluding only the documented pre-existing Bruno assertion ID passed31/31.
All13 Rosetta positive blocks<=350 words (maximum320); regression enforces
identical compact anatomy/framing and staged effect splendor.
Scoped `git diff --check` passed with line-ending advisories only; changed
Python editor diagnostics clear. No game build needed: this phase only changes
art prompts/documentation/tests, not the already-verified six-star runtime.

## Latest: Six-star Roses / Rosetta angel progression (D-113)

Owner promotes all three Roses EBs to6-star and explicitly chooses1.1% total
character chance equally split. Thornia/Crinso metadata now6; rose pool uses
its own approved1.1% rate, with unchanged98.9% creature weights. All three
eligible for200/500 pity through the shared resolver; disclosure updated.
No migration/load writes/retroactive pity resets, refunds or awards. Existing
IDs/progress/gear/counters/kits/costs/caps and Standard remain unchanged.

Owner approves less-chibi late forms and giant angel presence, but explicitly
requires only detailed eyes (no mouths/noses/eyebrows/other facial features)
and the same anime/cel/painted art style. Roses-only exception to D-109;
no realism/monstrous anatomy/combat scale changes. Revised
[Rosetta's13 prompts](../Art/characters/Rosetta%20Art.md), Phase8: tiny2.5-3-head starter ->
3/3.5/4/4.5/5-head stylized anime angel; body1/3 ->2/5 ->1/2 canvas.
Fixed crimson bob/ivory rose clip/crimson eyes and crimson/gold/ivory palette.
Segmented armor/fracture seams, canopy pauldrons, divided mantle and4/8/16
wings progress into cosmic rose regalia. Omnic retains Legendary's airborne
twisting draw/raised knee, main eight wings, mantle/collar and rose-lens bow,
expanding them with auxiliary wings, waterfall pennants, crown/diadem,
three orbital sun-rings and triple-arched nested-lens2-body-height bow.
Names outside copy prose, keys/no-glow/padding/expanded lettering exclusions
preserved; headings/IDs unchanged. Six icons/final bow match.
Thornia/Crinso identity metadata corrected but their art copy bodies untouched.
**Pause for Rosetta review before Thornia.** No generated/supplied images
changed, missing-art paths, commits, push or deployment.

Verification:
- `npm test -- src\game\crimson-roses.test.ts src\game\banner-pity.test.ts
  src\game\banner-and-lycalis.test.ts src\content\summon-banners.test.ts`
  passed95/95 across4 files. Tests cover exact1.1%/equal6-star outcomes,
  natural/new/duplicate resets, equally eligible200/unowned500/all-owned
  guarantees, independent counters and atomic failed draws, UI/no missing art,
  and unchanged Standard. IDE test discovery found no registered tests, so
  the repository Vitest runner was used.
- `npm run build` via Build Last Light task passed TypeScript/Vite; existing
  >500kB chunk-size advisory remains. Initial tuple-type error was corrected
  with a typed literal tuple; no unsafe casts.
- `python -m unittest discover -s tools -p 'test*art_prompts.py'` ran32:
 31 passed, only the documented pre-existing Bruno wording assertion failed.
  Inline discovery excluding that exact known test ID passed31/31.
  Rosetta's13 positive blocks max301 words, all<=350. Dedicated regressions
  cover staged proportions, eyes-only faces, renderer, retained final
  architecture, keys/padding/lettering and icon/weapon consistency.
- Scoped `git diff --check` passed with line-ending advisories only;530
  relative file links resolved. Changed TS/Python editor diagnostics clear.

Prompt checks do not certify generated appearance or moderation acceptance.
Actual visual review/intake remains pending.

## Latest: Razor compact stylized art phase (D-112)

Owner requested the same stylized additions to Razor next.
Revised [Razor's13 prompts](../Art/characters/Razor%20Art.md): six forms, six symbols and
matching final Midnight Bastion Sword. Fixed silver forelock/violet eyes/black
scarf/graphite identity, compact anatomy/body one third of canvas and identical
palette/renderer clauses. Plain tunic/night sword -> first plates -> segmented
bastion armor/mantle/winglets -> high collar/broken corona -> six-wing eclipse
bastion -> expanded twelve-wing night fortress.

Graphite joints/silver fracture seams, tower pauldrons, substantial gauntlets/
greaves, divided mantle and crescent shield vanes strengthen his tank identity.
One opaque pure-night sword throughout, never a katana or second weapon.
Omnic retains Legendary's braced elevated guard, royal mantle, six main wing
arrangement, double crescent guard/three hilt clasps and eclipse ramparts;
broader armor/vanes, six auxiliary wings, crown/double coronas and five blade
ridges expand that architecture. Blade span1.5 ->2 body heights, same body.
Last Flare/final weapon match final sword; Defense remains a symbol only.
Male Ominous6-star Tank/banners unspecified stays art-only.
Headings/labels/IDs,13 green keys/no-glow/padding/expanded text exclusions
preserved; names outside copy prose. Other character prompt bodies untouched.

Dedicated continuity/renderer/anatomy/key/word-bound and progression/
retained-final-architecture tests replace the last old flagship-template check.
Shared phase status updated; **pause for Razor review**.
All seven flagships individually revised; Rosetta/Thornia/Crinso pending.
No generated images/intake/runtime/save changes, commit/push/deploy.

Verification: `python -m unittest discover -s tools -p 'test*art_prompts.py'`
ran31 tests:30 passed, the documented pre-existing Bruno assertion mismatch
failed (`test_bruno_restores_compact_anatomy_and_equipment_progression`
expects `segmented basalt plates`; current prompt says `basalt and pale opal
segmented plates`). Bruno and that assertion were not changed.
An inline unittest discovery run using the same pattern and excluding only
that exact test ID passed30/30 after the final early-form wording cleanup,
including both Razor regressions, both Elise regressions and event checks.
All13 Razor positive blocks <=350 words (maximum324).
Scoped `git diff --check` passed with line-ending advisories only;450 relative
file links resolved and Razor whitespace clean. Changed Python editor
diagnostics clear. No game build needed for art/docs/test-only changes.
Generated visuals still need review; no moderation acceptance guarantee.

## Latest: Elise compact stylized art phase (D-111)

Owner requested the same stylized additions for Elise next.
Revised [Elise's13 prompts](../Art/characters/Elise%20Art.md): six forms, six symbols and
matching final thunderwheel shuriken. Fixed black hair/side lock/lime eyes/mint
wrist ribbons/charcoal underlayers, compact anatomy/body one third of canvas
and identical palette/renderer clauses. Plain tunic/stars -> first plates ->
segmented armor/mantle/winglets -> high collar/broken corona -> six-wing circuit
court -> expanded eight-wing thunderwheel court.

Charcoal joints/silver fracture seams, stepped pauldrons/gauntlets, divided
mantle and branching lightning vanes amplify her unique electrical identity.
Exactly two four-point shuriken with open central grips, one in each hand.
Omnic retains Legendary hover/throwing pivot, mantle, six main wing arrangement
and circuit collars, then expands armor, principal vanes/crown/coronas and
three-tier silver arm plates; star span1 ->1.5 body heights. No changed anatomy,
extra weapons/people or depicted injury. Icon/final weapon geometry matches.
Female Voltaic5-star DPS/future Standard direction remains art-only.
Labels/headings/IDs,13 orange keys/no-glow/padding/expanded text exclusions
retained; names outside copy prose. Other character prompts untouched.

Dedicated identity/renderer/anatomy/star/key/wording and retained-final-
architecture/weapon tests replace old Elise template checks. Shared phase
status updated; **pause for Elise review**. Razor/three event EBs pending.
No generated images/intake/runtime/save changes, commit/push/deploy.

## Latest: Disciple compact stylized art phase (D-110)

Owner requested the same stylized additions developed for Bliss/Bruno.
Revised [Disciple's13 prompts](../Art/characters/Disciple%20Art.md): six forms, six symbols,
matching standalone Mindcrown Focus. Fixed upward plum-black hair/violet eyes/
scarlet shoulder cord/charcoal identity, tiny torso/short limbs/2.5-3 heads/
one-third body framing and identical palette/renderer clauses throughout.
Plain tunic/flame -> first plates/frames -> substantial segmented lattice armor/
mantle/winglets -> high collar/broken corona -> six-wing psychic court ->
expanded twelve-wing court with seven-point crown and nested casting frames.

Charcoal joints/silver fracture seams, branching pauldrons/psychic vanes,
divided mantle and orbit fragments strengthen regalia without altering anatomy.
Omnic retains Legendary main wing arrangement, hover/open-palms, royal mantle/
frames and expands armor/frames with auxiliary wings, double coronas, amethyst
prism and three lattice tiers. Frames grow1 ->1.5 body heights. Chaotic male
6-star ally-buff identity remains weaponless; upward linked crests in empty
space, no extra people/binding imagery. Names/headings/labels/IDs preserved
outside prose, all13 blue keys/no-glow/padding/expanded text exclusions intact.
Other character prompts, including current Bruno/Bliss, unchanged.

Added dedicated renderer/anatomy/key/wording and retained-final-architecture/
focus regressions, replacing old Disciple template checks. Shared phase status
updated; **pause for Disciple review**. Two flagships/three event EBs pending.
No generated images/intake/runtime/save changes, commit/push/deploy.

Verification: `python -m unittest discover -s tools -p 'test*art_prompts.py'`
ran28 tests:27 passed, one pre-existing Bruno assertion mismatch failed
(`test_bruno_restores_compact_anatomy_and_equipment_progression` expects
`segmented basalt plates`; current Bruno says `basalt and pale opal segmented
plates`). Current Bruno had changed before this phase; it was not overwritten
or its test weakened. An inline unittest discovery run excluding only that
known test passed27/27, including both new Disciple regressions and3 event tests.
All13 Disciple positive blocks <=350 words (Omnic335);437 relative link targets
resolved, Disciple whitespace clean, scoped `git diff --check` passed with
line-ending advisories only and changed Python editor diagnostics clear.
No game build needed for art/docs/test-only edits. Generated visuals still pending.

## Latest: Bruno compact-style restoration (D-109)

Owner rejected Bruno's recent results, likes Bliss, and explicitly confirmed
the rollback target: compact Bliss-style anatomy throughout, not the first
rock-bodied version. Restored Bruno's six portraits to rounded oversized head,
tiny torso/short limbs/2.5-3 heads, hair/amber eyes/ochre sash and body one third
of4:3 canvas in every form. Armor contour/mass, hammer engineering, mantle,
mineral arrays/crown and abstract earth powers carry epic progression.
No nonhuman/divine-body or changed in-world scale/late-body framing.

This restores the earlier approach, not a byte-for-byte historical file.
13 blocks/IDs/headings/labels/palette/keys/no-glow remain; icons/final weapon
retained. Bliss and other character prompt bodies unchanged. Updated tests and
current shared guidance; D-107/D-108 notes below are superseded history.
**Pause for Bruno review.** No images/runtime/save changes, commit/push/deploy.
Generated results and moderation acceptance still need actual review.

Verification: `python -m unittest discover -s tools -p 'test*art_prompts.py'`
passed26 tests, including all-form compact-anatomy and equipment-progression
checks. Scoped `git diff --check` passed with line-ending advisories only;
changed Python editor diagnostics clear. No game build needed.

## Latest: Bruno armored-god clarification (D-108)

Owner clarified late forms should be majestic armored angels/gods, not
monstrosities. Refined Bruno's Rare through Omnic portraits: sacred articulated
basalt gauntlets/greaves, balanced humanoid divine contour, serene readable
face, swept hair/umber diadem, sculpted torso plate and powerful armored limbs.
Removed living-bedrock replacement, mountain torso, pillar legs and rock fists.
Massive implied stature, elaborate mineral armor/wings, suspended crown,
single citadel hammer and retained Omnic architecture remain. Shared anime/cel/
painted renderer, palette, keys, framing, names/IDs and no-glow unchanged.
Base/Uncommon, icons/final weapon and every other character prompt unchanged.

Updated current shared guidance, vision, index, manifest, decision log and
agent entry point; D-107 below is a superseded first-pass snapshot.
Updated tests to require dignified armored divinity and reject old mutation
anchors. **Pause for Bruno review.** No images, runtime/save changes, commit,
push or deployment; actual output/moderation acceptance still untested.

Verification: `python -m unittest discover -s tools -p 'test*art_prompts.py'`
passed26 tests. Scoped `git diff --check` passed with line-ending advisories
only; changed Python editor diagnostics clear. Prompt length/key/renderer/
identity/armor and retained-final tests pass. No game build needed.

## Latest: Bruno elemental-apotheosis phase (D-107)

Owner permits late characters to lose humanity and become monstrous/godlike
elemental beings with massive implied scale, explicitly starting with Bruno.
This supersedes prior mandatory fixed-human anatomy/small-body framing, not the
shared anime/cel/painted renderer. Rebuilt [Bruno's13 prompts](../Art/characters/Bruno%20Art.md):
six forms, six abstract ability/action icons and matching final hammer.
Human sentinel -> first armor -> mineral forearms/lower legs -> living-bedrock
avatar -> mountain titan -> worldwall deity. Late body is geological mass,
not a human underneath ornate armor. Amber eyes, umber hair-to-mineral crest,
ochre sash-to-banner, square basalt/bronze/amber motifs and one double-faced
hammer retain identity.

Legendary/Omnic share colossal terraced torso, bastion fists/pillar legs, crown
segments, three main mineral arrays and hammer guard. Omnic expands mountain
ranges around suspended keystone, crown spires/coronas, citadel hammer and adds
two auxiliary arrays. Early bodies1/3 canvas; Rare complete silhouette1/2;
Epic+ complete subject/equipment2/3 with full padding. Implied terrain-scale
stature, no scenery/bystanders/cropped art or realistic rendering. No gameplay
size/camera/hitbox changes. Six forms/5-star Tank/future Standard status, all
existing headings/labels/IDs remain. Magenta keys/no-glow/name-free prose/
lettering exclusions and non-explicit solid mineral transformation throughout.

Updated shared art contract/manifest/game vision/decision/index/agent entry
point to separate renderer continuity from human anatomy. Dedicated tests
replace Bruno's old human-template checks and verify actual body transformation,
scale/framing progression, retained final architecture and matching weapon.
**Pause for Bruno review.** Three flagship and three event lines await individual
correction. Bliss and all other character prompt bodies unchanged. No generated
images/intake/runtime/save changes, commit, push or deployment.

Verification: `python -m unittest discover -s tools -p 'test*art_prompts.py'`
passed26 tests (23 shared,3 event). All13 positive Bruno blocks below350 words;
final portrait330. Actual generated visual impact/moderation acceptance untested.
Scoped `git diff --check` passed with line-ending advisories only;433 relative
documentation link targets resolved, Bruno whitespace clean and changed Python
editor diagnostics clear. No game build needed for prompt/docs/test-only edits.

## Latest: Bliss dramatic silhouette review revision (D-106)

Owner supplied Wraththorn base/final images to clarify the required exaggeration,
not copied purple/palette/anatomy, and explicitly requested Bliss only.
Revised four later [Bliss portraits](../Art/characters/Bliss%20Art.md), Last Flare symbol
and matching final standalone fan. Base/Uncommon and other five icons unchanged.
No other character prompts touched. Six forms/13 blocks/headings/labels/IDs
remain. Fixed tiny anatomy/eyes-only face/identity/palette/renderer, green key,
no-glow/text exclusions and non-explicit imagery retained.

Rare has stepped shoulders, substantial gauntlets and hip tassets; Epic adds
high feather collar/broad pauldrons/flared feather mantle. Legendary/Omnic retain
an armored shoulder canopy, oversized gauntlets, heavy fluted greaves and
hover/fan stance. Fan span grows1 body height at Rare/Epic ->1.5 Legendary ->
2 Omnic. Final broad armor, waterfall mantle, three-tier colossal fans, crown
and expanded principal feather arrays dominate around the unchanged tiny body.
No adult anatomy, copied slime weapons/colors/glow or extra figures.

Added explicit armor-mass/fan-scale regression and base/final visual acceptance
guidance: even imagining the wings removed, armor/mantle/fans must substantially
transform the silhouette. Prompt checks do not certify generated visual impact.
**Pause for Bliss review.** No images generated/intaken, runtime/save edits,
commit/push/deployment. Earlier notes below are historical snapshots.

Verification: `python -m unittest discover -s tools -p 'test*art_prompts.py'`
passed24 tests (21 shared,3 event). All13 Bliss positive prompts stay within
350 words; final portrait348. Scoped `git diff --check` passed with line-ending
advisories only;425 relative documentation links resolved, Bliss whitespace
clean and changed Python editor diagnostics clear. No game build required for
prompt/docs/test-only edits. No Midjourney requests or generated-output review.

## Latest: Bliss individual prompt phase (D-105)

Owner accepted Aurora and requested Bliss next, with non-explicit imagery and
a slight stronger Wraththorn structural influence without changing the renderer.
Revised [Bliss's13 prompts](../Art/characters/Bliss%20Art.md): six forms, six icons and one
final fan. Fixed ivory buns/side locks/pale-blue eyes/rose ribbon/pearl identity,
tiny proportions and identical renderer/palette clauses in all portraits.
Plain tunic/fans -> first plates -> segmented mantle/winglets/fragments ->
hovering broken corona -> six-wing fan court -> expanded crowned12-wing court.

Pale-blue joints/pearl fracture seams, divided mantle, open branching feather
ribs, orbit fragments and denser fan architecture translate Wraththorn's
progression without its anatomy, abyss palette or cleaver. Omnic retains three
Legendary main wing pairs, fan/hover stance and royal mantle, broadening blades/
regalia and adding auxiliary wings, seven-feather crown, three-tier fans and
double coronas. Final standalone fan matches. Existing headings/labels/IDs
preserved; names removed from image prose. All13 green keys/text exclusions/
padding/no-glow retained. Fully covered characters and abstract motion in empty
space; no moderation acceptance guarantee.

Added focused renderer/identity/fan/key/length/wording and retained-final-
architecture regressions, replacing Bliss's old template assertions.
**Pause for Bliss review.** Four flagships and three event EBs remain pending.
Aurora prompts unchanged. No images generated/intaken, runtime/save edits,
commit, push or deployment. Earlier phase notes below are historical snapshots.

Verification: `python -m unittest discover -s tools -p 'test*art_prompts.py'`
passed all23 tests (20 shared,3 event). Scoped `git diff --check` passed with
line-ending advisories only.423 relative documentation link targets resolved,
Bliss whitespace clean and changed Python editor diagnostics clear.
First run caught Omnic at355 positive words; removed redundant framing to meet
the350-word bound without dropping architectural features. No game build needed
for prompt/docs/test-only changes; actual generated visual review remains pending.

## Latest: Neutral character prompt wording (D-104)

Owner requested reviewing every character prompt for wording that could cause
Midjourney moderation issues. Reviewed192 generation blocks across14 character/
starter packs and shared guide examples;71 blocks changed. Replaced ambiguous
armor/anatomy terms with torso plates/panels, open hands/palms and partial-body
framing, and abstract restraint descriptions with geometric bands/tabs.
Removed unnecessary explicit injury terms from negative lists.

Preserved names/headings/IDs, weapons, palettes, rendering, evolution structures,
backgrounds and generation flags. Added a regression over every scoped copy
block, including negatives, and documented conservative wording guidance.
No verified service blacklist or acceptance guarantee; actual generation and
service moderation remain untested. No runtime/save/supplied image changes.
Aurora still awaits owner review; other characters' phased design revisions
remain pending. No commit, push or deployment.

Verification: `python -m unittest discover -s tools -p 'test*art_prompts.py'`
passed all21 tests (18 shared,3 event). Scoped `git diff --check` passed with
line-ending advisories only; changed Python editor diagnostics clear.
Prompt/docs-only changes need no game build. No Midjourney requests submitted.

## Latest: Aurora individual prompt phase (D-103)

Owner accepted the Atmoso direction and requested Aurora next. Rebuilt
[Aurora's13 prompts](../Art/characters/Aurora%20Art.md) only: six portraits, six icons and
one final Verdict Lens focus. Identical identity/anatomy/palette/renderer clauses
in every portrait preserve compact starter proportions, eyes-only face,
pearl-white bob/side locks, amber eyes, ivory neck ribbon and obsidian underlayers.
Plain beginner -> first plates -> segmented lens armor/divided mantle/winglets
-> hovering broken corona -> six-wing lens court -> expanded12-wing solar court.

Wraththorn threat architecture is translated into ivory/gold lens ribs, obsidian
eclipse seams, angular amber restraint bands and skeletal solar-lens feathers.
No copied slime species/cleaver, Atmoso staff/palette or Rosetta roses/bow.
Weaponless bare-hand casting remains explicit. Full armor uses fingerless guards
so palms remain open. Omnic retains Legendary's six principal wing arrangement,
mantle, hovering hands and paired gold crescent lens collars, broadening its
main blades/regalia and adding six auxiliary wings, layered crown, nested
three-wheel verdict lenses and double fractured coronas. Standalone focus
matches one lens, never equipment.

All13 blocks specify solid contrasting magenta through openings, names/titles
outside image prose, explicit no-lettering exclusions, same actual approved
sref400 and source-cutout no-glow policy. Added tests for exact renderer/identity,
keys/padding/bounded length, no weapon/healing imagery, stage construction,
2/6/12 wings, retained Legendary architecture and final focus consistency.
**Pause for Aurora review.** Five other flagships plus three event EBs remain
pending; no new images/generated-output approval/runtime/save changes.
No commit, push or deployment. Historical phase notes below are snapshots.

Verification: `python -m unittest discover -s tools -p test_art_prompts.py`:
17 passed; `python -m unittest discover -s tools -p test_rose_art_prompts.py`:
3 passed. Scoped `git diff --check` passed (Windows line-ending advisories);
415 local relative link targets resolved, Aurora whitespace clean and changed
Python editor diagnostics clear. Art/docs/test-only change: no game build needed.
Prompt validation does not certify generated visual style or absence of text.

## Latest: Atmoso Wraththorn-style review revision (D-102)

Owner found the prior Omnic weaker than earlier forms and too much style drift.
After discussing scope, owner explicitly requested **Atmoso again**, translating
Wraththorn's intimidating progression without losing unique character identity.
Only Atmoso's six portrait prompts and matching final staff changed; six ability
icons and every other character pack remain unchanged this turn.

All six portraits now have identical staff-wielder identity/anatomy and
palette/renderer clauses. Early forged pointed plates grow into segmented
vane armor with navy joints/pearl fracture seams, divided mantle, orbit fragments,
skeletal swept gale wings and broken wind coronas. Legendary and Omnic retain
the same angled hover/staff pose and royal mantle. Omnic keeps the six principal
wings and crescent staff collar, expanding them with wider branching blades,
denser armor, auxiliary wing pair, tall crown, nested wheel and double fractured
coronas with a storm pearl. No adult knight/slime anatomy, copied abyss colors,
cleaver, backdrop glow or text. Same solid orange key and no-lettering contract.

Added regression for identical renderer/identity across all six, recurring
armor motifs, Legendary features retained in Omnic, exclusive final additions
and final staff collar consistency. Prompt checks are not image review.
Actual generated results and owner acceptance remain pending; pause before
another character. No assets/runtime/saves/commit/deployment changes.

Verification: `python -m unittest discover -s tools -p test_art_prompts.py`:
15 passed; `python -m unittest discover -s tools -p test_rose_art_prompts.py`:
3 passed. Scoped `git diff --check` passed (line-ending advisories only);
291 relative link targets resolved, Atmoso whitespace clean, changed Python
test editor diagnostics clear. Documentation/prompt-only changes need no build.

## Latest: Atmoso-only prompt correction, paused for review (D-101)

### Owner direction and completed phase

Owner reported that newer character prompts drift from Infernis/Tizu/Flora,
produce similar-looking later forms, omit contrasting backdrops in generated
results and produce text. Requested one carefully completed character at a
time, combining original starter renderer and intimidating Wraththorn/Dawnthorn
progression, including the three event EBs. Owner explicitly selected **Atmoso
first, then pause for review**, not automatic sequential rewriting.

Rebuilt [Atmoso's13 prompts](../Art/characters/Atmoso%20Art.md): six portraits, six
icons and matching final staff. Beginner is plain tunic/crook/one wind curl;
later forms introduce forged gear, complete vane armor/mantle/winglets,
hovering two-wing prism armor, six-wing diadem and eight-wing crown/nested
skywheel with orbital wind bands. Armor, staff construction, pose and silhouette
change together; original tiny body/eyes-only/contour/cel rendering remains.
Every block has a solid orange contrasting key/open gaps/padding and explicit
text/lettering exclusions. Proper names/titles/rarity labels remain outside
copyable image prose; physical reliefs replace inscription-like detail.
Actual approved style-reference URL must be appended by the owner, never
fabricated or left as a placeholder. "Evo.0" beginner maps to existing Evo.1;
no indexing/gameplay change.

Added Atmoso-specific tests for exact renderer/key suffix, name-free positive
prose, text exclusions, prompt-length limit, distinct stage construction,
2/6/8 wing progression and portrait/standalone staff consistency. The existing
generic tests still cover other lines; their passing is not image validation.

### Verification and remaining work

- `python -m unittest discover -s tools -p test_art_prompts.py`:14 passed.
- `python -m unittest discover -s tools -p test_rose_art_prompts.py`:3 passed.
  Scoped `git diff --check` passed;408 local link targets resolved and the
  D-101 review-workflow anchor was checked. Atmoso has no trailing whitespace;
  editor diagnostics for the changed Python tests are clear.
- No runtime code, supplied PNGs, saves or another character pack changed.
  Documentation/art-prompt-only correction; no game build needed.
- **Pause here.** Atmoso generated-output comparison and owner approval remain
  pending. No new images were generated, so matching output/style/background/
  absence of text cannot be claimed.
- Other six flagship characters and Rosetta/Thornia/Crinso are still pending
  individual correction. Next character/order follows owner review, not an
  assumed bulk template. Earlier D-099/D-100 prompt readiness is not approval
  of those generated outputs. Runtime D-100 expansion below remains unchanged.
- No commit, push or deployment.

## Latest: playable Crimson Roses expansion (D-100)

### Implemented

- [Complete specification/edit points](crimson-roses.md) records owner-confirmed
  scope separately from first-pass tuning and pending artwork/scheduling.
  Rosetta6-star Luminous bow, Thornia5-star Ominous greatsword and Crinso5-star
  Chaotic single dual-edged sword have six real forms/kits. Only the original
  three remain opening choices; no automatic grants/equipment/save rewrites.
- Roses Under Sunny Skies is a second real10-Null-Prismatica banner:0.1% Rosetta,
  1% shared Thornia/Crinso,98.9% first-three Roselius using50:30:17. Independent
  200/500 highest6-star pity and associated-mode duplicates: Omnic Roselius
  Lv.80/Stage29 kit with exact provenance. Standard's fifteen outcomes,
  odds and Treasury Lv.50 conversion are unchanged.
- Passion of Crimson Roses:35 stages80-140, six female Luminous Roselius,
  every-fifth boss, per-kill Prismatica/six Rosethorn materials, no Null-Prismatica or
  clear bonus.20% independent captures only at actual enemy levels<=120.
  Stage23/Lv119 is the last capturable mission stage; fixed copies still cap120.
  Legendary starts22, allowing late fodder before the ceiling.
- Shared120 stat targets remain unchanged. Event-only post120 quadratic
  extension reaches591,680 ordinary /1,183,360 bossHP at140, instead of
  runaway exponential extrapolation. Original/rose/mixed maximum-level squads
  each cleared the final boss across three seeds without gear (10-22 rounds).
  This is a feasibility check, not final balance approval.
- Event EB costs replace ordinary materials with Rosethorn tiers; unchanged
  Prismatica/caps/max-level evolution gate. Explicit Roselius late fodder uses
  existing1/2/3 and form3+/4+/5+, with lock/squad/any-Conduit protection.
  Previews, confirmations, Max Level and transactions share character-aware costs.
- Roselius sell for1/2/3/4/5/6 own-tier materials only. Exact UUID reread,
  protection/overflow/save-failure checks and balances/removal commit together.
  Captures, materials, currency, discovery, unlocks and receipts remain atomic.
- Home/Gameplay/Events, banner selector and caller-based event->banner->Back,
  roster/copy controls, Squad, Character/upgrade, Archives and all shared battle
  surfaces are wired. Character Archive is66 forms (36 EB +30 fixed creature).
  New art uses neutral honest placeholders, never nonexistent PNGs.
- Crinso burn now retains the actual caster ID across enemy phases rather than
  requiring Infernis. RNG-independence, burn-source and final-boss feasibility
  regressions supplement the event transaction/source/progression coverage.
- **54 Midjourney prompts**: [Rosetta](../Art/characters/Rosetta%20Art.md),
  [Thornia](../Art/characters/Thornia%20Art.md), [Crinso](../Art/characters/Crinso%20Art.md) and
  [event/enemies/materials/scenery/banner](../Art/creatures/Passion%20of%20Crimson%20Roses.md).
  Simple bases progress into full-body crimson/gold/pearl prism armor, large
  wings and ornate powers/weapons within the established compact renderer.

### Verification

- `npm test -- --maxWorkers=2`: **825 tests /67 files passed**.
  Default full parallelism twice timed out only the existing500-draw integration
  test at its5-second limit on this shared machine; bounded workers pass every
  assertion without modifying test timeouts. Earlier full819-test run passed.
  Final rose integration has72 tests.
- Build Last Light (`npm run build`): TypeScript/Vite passed,97 modules;
  existing>500KB bundle advisory only. Editor Problems: no errors.
- `python -m unittest discover -s tools -p test_art_prompts.py`:11 passed;
  `python -m unittest discover -s tools -p test_rose_art_prompts.py`:3 passed.
- Scoped `git diff --check`: passed (Windows line-ending advisories only).
  Local link/whitespace checker resolved all targets in related documents and
  found no trailing whitespace in new event/runtime/art/test files.
- Read-only DOM fixtures for event Stage35, special banner, Rosetta evolution,
  final duplicate sale,66-form gallery and140 battle at actual
  **320/390/768/1280px**: no horizontal overflow, no undersized visible controls,
  exact maximum-safe balances, pending portraits/no invented image URLs.
  Browser viewport requests need a1.25 scaling adjustment; assert `innerWidth`,
  not only requested dimensions.320px battle showed exact
  `HP 1183360/1183360`; final victory has no Continue.
- Actual Home->Events->Roses banner->Back Events DOM routing verified.
  The integrated browser page is hidden/inactive: `img.decode()` waits timed out
  during loading smoke checks despite complete256px currency images.
  **Fully animated loading/entrance remains to be checked in a visible tab**;
  standard explicit error handling was retained, not bypassed for the harness.
- Browser fixtures never funded storage, restored original nodes/listeners/
  viewport/media settings, and ended on title. SHA256 of all localStorage
  key/value pairs still matches the pre-navigation value
  `22f8fc9f3244a069aaf802ebb9ff2f9a6cab9cf971a82ca984084de3aecc7b6d`.

### Remaining and owner decisions

- Actual image generation/intake/manual facing/output review is pending.
  All prompt packs and playable neutral-art surfaces exist; no new PNGs supplied.
- Production balance/playtesting and optional event dates remain future work.
  Continuous availability and first-pass tuning were approved; no additional
  blocking owner decision is needed for this agreed scope.
- Unrelated seven-element flagship characters remain art-only. Do not add them
  to Standard based on their prompt packs.
- No commit, push or deployment was performed for this expansion. Preserve the
  broader pre-existing dirty worktree and owner source images.

## Latest: Stronger flagship evolution artwork prompts (D-099)

Owner requested much stronger concrete evolution designs: simple original
starter-style bases progressing toward complete prismatic armor, elemental
prism wings, swirling powers and increasingly defined/ornate signature
weapons, with the impact of late Dawnthorn/Wraththorn slimes and the starter
renderer. Rewrote the actual42 flagship portrait bodies and7 final standalone
weapon/focus bodies, not just their introductory directions.

All seven retain identity/palette/weapon, six forms, fixed stars and Prefix,
Name headings. Common forms now explicitly have simple clothing/plain
equipment, including6-star lines. Uncommon introduces forged gear; Rare has
complete battle armor and first crystal winglets. Epic/Legendary/Omnic specify
prism armor over torso/shoulders/arms/hands/hips/thighs/knees/shins/feet and
large element-specific wings. Wing silhouette expands2->6->8 for5-star and
2->6->12 for6-star; latter finales add a secondary prism crown.

Earth mountain-feather buttresses, lightning-crystal feathers, solar-lens
feathers, swept wind feathers, crescent-night feathers, feather/fan blades and
psychic-flame lattice feathers keep each line distinct. Elemental ribbons,
shards/open rings swirl outside faces/body and around complete weapons/foci.
Final equipment includes worldwall hammer, thunderwheel shuriken, solar verdict
lens engine, skywheel staff, layered night sword, tiered warfans and psychic
mindcrown engine. Aurora/Disciple remain empty-handed casters; standalone foci
are energy symbols, not new equipment.42 ability icons remain unchanged.

Radiant impact means saturated prismatic facets and crisp painted highlights,
not source-cutout glow; retain opaque effects, original compact/eyes-only
renderer, small body, complete wing/weapon tips and generous padding.
Updated every pack's escalation/review contract, shared guide/manifest,
art workflow/index/decisions/agent guidance. No original/runtime art, content,
combat, banner, economy, saves or generated images changed.

Verification:
- `python -m unittest discover -s tools -p test_art_prompts.py`:11 tests passed.
  New structural regression checks actual42 portrait bodies: simple bases,
  forged gear, full coverage, winglets, distinct elemental wings/powers,
  exact progressive wing arrays, final equipment, renderer and padding.
  Existing checks retain13 prompts per pack,91 total, ratios, identity/stars,
  names and all existing art-pack/no-glow/flag rules.
- Initial new padding assertion exposed that standalone prompts did not
  explicitly say nothing touches the frame; added that requirement to all7,
  then11 tests passed. No generated-image quality claims.
- Scoped whitespace check passed; temporary bulk-edit script removed.
- Documentation/prompt-only changes; no runtime test/build necessary.

No commit, push or deployment. Generation and manual side-by-side output
review remain required; prompts cannot guarantee model output quality.
Future flagship runtime/kits/banners remain unimplemented as before.

## Previous: Evolution-specific character display names (D-098)

Owner follow-up reaffirmed max-level-only evolution. Existing menu/transaction
enforcement already matches; Character Information now says it explicitly.
Added five transaction and five menu boundary checks (below cap/at cap),
including unchanged rejected saves and retained successful levels.
`npx vitest run src\game\account.test.ts src\presentation\hub.test.ts`:67 tests
passed; Build Last Light (`npm run build`) passed with existing chunk advisory.
No balance, save or evolution-mechanics changes.

Owner established Prefix, Character name as the global convention and chose
each evolution's existing title as prefix. Added `characterName` in
`content/character-art.ts`. All18 live forms use their exact title plus identity,
e.g. Beginner, Infernis -> Embersteel Knight, Infernis.

Wired selection, Home, Character/Conduits, rosters/protection headings, Squad,
Archives, banner base-form rows/results, portrait alt text, confirmation/
success text, Max Level, upgrade celebration and battle snapshots. Battle logs/
readouts/cut-ins inherit the snapshot name; no combat math changes.
Evolution updates the name heading, progression heading, protection heading
and roster label while preserving portrait DOM and direction metadata.
Removed duplicate standalone form-title text now included in the name.
Unreached next-form alt text uses the current named character, not hidden titles.

All42 flagship form headings and15 evolved starter art headings now use
Prefix, Name; Starter Art headings and base-form references follow it too.
Shared guide/manifest, vision, progression contract, index, decisions and
agent guidance document the convention. Short identity names in lore/prompt
subject prose/filenames, creature names and stable asset/save IDs remain.
Flagship art is still generation-only, not playable content or pool expansion.

Verification:
- `npm test`:724 tests passed across66 files after all runtime changes.
  Initial passes found old wording/markup assertions from this and D-096/097;
  updated those assertions to preserve their intended checks, then full suite passed.
- `python -m unittest discover -s tools -p test_art_prompts.py`:10 tests passed,
  including exactly42 prefix-comma-name flagship headings.
- Build Last Light (`npm run build`): TypeScript/Vite passed; existing >500KB
  advisory only. Scoped editor Problems clear.
- Tests verify all18 names, invalid evolution rejection and matching Home/
  Character/portrait/battle form names.
- Browser fixture verified evolution heading update, unchanged portrait DOM,
  matching Home/roster/Squad/Archive/banner/battle names and unchanged wallet.
-20 long-name fixtures across Home/Character/Squad/Collections/Summon at
  measured320/390/768/1280px: no page overflow, all starters Lv105/Evo6.
  Original browser DOM/viewport restored. No owner save writes.
- Scoped `git diff --check`: passed; temporary bulk-edit script removed.

No commit, push or deployment. No decisions needed for naming. Future flagship
generation/intake/kits/acquisition banners remain unimplemented.

## Previous: Semantic green/red stat emphasis (D-097)

Owner requested dynamic green/red stat screens and approved meaningful
information colors. Added shared `presentation/stat-change.ts`/CSS and tests.
Level/evolution and Max Level previews (starter/captured) show next-value gains
in green, losses in red and equal values neutral. Compare raw stats before
formatting; tiny gains can display the same rounded number. Existing exact
formatStat output, units and before/after arrows remain; accessible next-value
labels describe Increased to/Decreased to/Unchanged at.

Current Conduit-modified stats use the same gain/loss colors and keep their
Before Conduits references; unaffected stats remain neutral. Upgrade Owned/
Required counts are green when sufficient and red when missing, with existing
numbers, missing outline, disabled controls and rejection text preserved.
No math, save, transaction or palette-identity changes. No extra animations.
Updated menu specification, index, decision log and agent guidance.

Verification:
- `npx vitest run src\presentation\stat-change.test.ts src\presentation\hub.test.ts src\game\max-level.test.ts src\presentation\archives.test.ts src\game\captures.test.ts`:
  71 tests passed across5 files. First run had one obsolete contiguous-HTML
  assertion; updated it to compare visible fractional text without tags.
- Build Last Light (`npm run build`): TypeScript/Vite passed; existing >500KB
  chunk advisory only.
- Shared tests cover gain/loss/equal/zero, percentage/multiplier formatting and
  sub-precision fractional changes. Renderer tests cover upgrade/evolution,
  Conduit differences, resource affordability and capped neutral Max Level.
- Browser computed styles: green rgb(142,230,172), red rgb(255,156,156),
  neutral rgb(245,245,245); both affordability paths and all7 Max Level values.
- Eight level/Max Level fixtures at measured320/390/768/1280px with Lv104/Evo6
  and maximum-safe holdings:7 stat comparisons retained, correct green values,
  no page overflow. Wallet unchanged, original DOM/viewport restored.
- Scoped editor Problems and `git diff --check`: clear/passed.

No commit, push or deployment. No owner decisions needed for this emphasis.
Actual current content has no stat-reducing upgrades; red direction is verified
with an explicit lower-value fixture, not invented negative game content.

## Previous: Concise player-facing status wording (D-096)

Owner requested removing "/ Silhouette" and similarly obvious or unclear menu
wording. Updated Character Archive status labels to Not owned, Reached form,
Evolution not reached and Current form/level. Unavailable ownership remains an
explicit error state; removed redundant Art locked/revealed suffixes.
Noncurrent stats retain Level 0 preview; shared Collections Information still
explains no-Conduit previews, equipped current stats and reveal rules.

Creature cards now use Encountered/Defeated without Loot locked/revealed.
Undiscovered creature headings no longer repeat Not encountered below them.
Loot remains hidden until defeat. Captured Home/Squad/Character summaries omit
Fixed form and retain level/copy identity. Cannot-evolve and level-cap rules
remain in Information. Missing-art notices, costs, protection reasons, stats,
silhouette rendering and filters are unchanged. No save/gameplay changes.

Updated menu/archive specs, index and decision log, plus regression assertions.
Verification:
- `npx vitest run src\presentation\archives.test.ts src\content\creatures.test.ts src\game\captures.test.ts src\presentation\hub.test.ts src\presentation\roster.test.ts`:
  69 tests passed across5 files. Editor test integration found no registered
  tests, so used the existing Vitest runner.
- Build Last Light (`npm run build`): TypeScript/Vite passed; existing >500KB
  chunk advisory only.
- Read-only browser fixture:36 Not owned labels, expected Current/Reached/
  Unreached labels, no rendering suffixes, two revealed starter forms, Encountered
  without loot and Defeated with loot. Original DOM restored; wallet unchanged.
- Scoped editor Problems and `git diff --check`: clear/passed.

No commit, push or deployment. No owner decisions or deferred implementation
for this wording cleanup; future flagship content remains as previously noted.

## Previous: Dynamic screen backgrounds (D-095) and flagship renderer lock

Owner requested unique, animated patterned backgrounds across all screens.
Added `src/presentation/ambient-background.ts`, its14-theme regression tests and
`src/ambient-background.css`; central `frame()` supplies each opening/menu screen
with its theme and maps legacy Archives/Glossary/Conduit Store aliases.

Distinct neutral rays, grids, contours, diamond/triangular weaves and rings
preserve the existing black/white/gray palette and associated element accents.
Slow100-second rotating rings and28-second drifting particles/soft light bands
use transform-only animation. Static modal textures cover Information, selection,
Settings, Battle menu and results. Device and saved reduced motion disable
animation while retaining patterned backgrounds. Layers are aria-hidden,
pointer-transparent, viewport-clipped and paint-contained. No added listeners,
timers, images, gameplay randomness, combat timing or save fields.

Battle preserves supplied scenery beneath sparse motes; geometric rings/patterns
are hidden there. Modal selector specificity preserves static textures against
the existing shared/later battle styles. No controls/content removed.

The owner's art clarification is also complete: all seven flagship packs and
their manifest explicitly lock to Infernis/Tizu's renderer and framing. Rarity
raises armor, signature weapon/energy structure and ornament complexity only,
never realism or a different renderer. Added regression assertions for the lock.
This does not add generated images, live characters or banner changes.

Verification:
- `npx vitest run src\presentation\ambient-background.test.ts src\presentation\sanctuary.test.ts src\presentation\hub.test.ts src\presentation\roster.test.ts`:
  65 tests passed. VS Code's test tool found no registered tests, so used Vitest.
- `npm test`:718 tests passed across65 files.
- Build Last Light (`npm run build`): TypeScript/Vite passed; existing >500KB
  chunk advisory only. Scoped editor Problems clear.
- `python -m unittest discover -s tools -p test_art_prompts.py`:10 tests passed,
  including all seven exact renderer-lock assertions and91 flagship prompts.
-56 decorative-theme browser fixtures at measured320/390/768/1280px: no page
  overflow, all layers aria-hidden/pointer-transparent,13 distinct menu patterns,
  two menu animations/one battle animation. Seeking the actual drift animation
  from0 to14000ms changed its transform. System and saved reduced-motion paths
  independently disabled animation.
-12 Home/Inventory/Character fixtures at the same widths, maximum-safe balances
  and Lv105/Evo6: no page overflow, exact full balances and visible patterns.
  Five modal surface fixtures retained their static background images.
- Four actual1400x850 screenshots in an isolated headless Edge profile:
  title/Home/Inventory and a battle scenery layering fixture. Visible artwork
  decoded within bounded timeout; actual animation objects present and controls
  remained hit-testable. Inspected title/Home/scenery; arena art stayed visible.
  This is not a full cinematic battle-flow test.
- Browser wallet unchanged; original DOM, viewport and emulated motion restored.
  Isolated profile/processes removed; screenshots remain session artifacts.
- Scoped `git diff --check`: passed. Temporary screenshot script removed.

No commit, push or deployment. No owner decisions needed for backgrounds.
Future flagship image generation/intake, real kits/pool integration and the four
6-star acquisition-banner decisions remain unimplemented (O-014).

## Previous: Seven flagship Midjourney art packs (D-094)

Owner requested flagship Element-Bearer prompts for every element besides
Fire/Water/Grass, with six forms matching the starters, character/ability art
and fully prismatic-armored final designs. Created Art/characters/Flagship Characters.md
plus Bruno Art.md, Elise Art.md, Aurora Art.md, Atmoso Art.md, Razor Art.md,
Bliss Art.md and Disciple Art.md. Every pack contains13 fully expanded
copy-ready prompts: six4:3 character forms, six1:1 icons (Passive/Skill1/Skill2/
Last Flare/Normal/Defense) and one3:2 signature weapon/focus.91 prompts total.

Confirmed:
- Bruno: male Tectonic/Earth massive hammer Tank,5-star future Standard.
- Elise: female Voltaic/Electricity shuriken DPS,5-star future Standard.
- Atmoso: male Atmospheric/Wind energy-staff DPS,5-star future Standard.
- Aurora: female Luminous/Light bare-hand energy Support/debuff enemies,6-star.
- Razor: male Ominous/Shadow sword of pure night Tank,6-star.
- Bliss: female Tranquilitic/Peace feathers/warfans DPS,6-star.
- Disciple: male Chaotic/Dark Matter/Energy blazing psychic energy
  Support/buff allies,6-star.

All lines progress Common->Omnic with complete final prismatic armor while
preserving signature palettes/identities and the compact chibi/cel renderer.
The four6-star lines have particularly elaborate architectural final silhouettes,
not a seventh form or different anatomy. Original hair/palette/armor details,
form titles, skill names and symbols are proposed creative designs, not approved
lore or numerical kits. The owner supplied names/genders/roles/weapons/elements/
stars/acquisition direction. Aurora/Disciple focus cutouts do not invent gear.

Shared approved-sref400 instructions, eyes-only faces, small body/complete
weapon margins, opaque crisp effects, non-emissive highlights and final solid
background clauses are retained. Prismatic-key overlap requires visual review;
change background choice rather than erasing/recoloring subject facets.
No reference URL was invented and no generated images were claimed.

Updated art guide/workflow, documentation index, units/economy future-content
boundaries, decision log and agent guidance. Added O-014 for unspecified6-star
banner placement/future integration; no decision is needed to use these prompts.

Verification:
- `python -m unittest discover -s tools -p test_art_prompts.py`:10 tests passed,
  including all seven exact13-prompt packs, six form rarities, six icon slots,
  ratios, fixed stars/roles, signature anchors, final prism armor, unique asset
  suggestions, shared renderer/flags/background rules and existing packs.
- Scoped `git diff --check`: passed (normal LF/CRLF notices only).
- New-pack whitespace checked by the added test, including untracked files.
- Documentation-only art/content work; no TypeScript/build/gameplay rerun needed.
  The last runtime suite/build passed for D-093.
- Temporary bulk-authoring script removed; no source/runtime art was modified.

Unimplemented: image generation/intake, playable characters/kits/stat balance/
save ownership integration, expanded Standard pool and all6-star banner content.
Current odds, costs, pity and duplicate conversion remain untouched. Future
integration must define real content before altering those systems.
No commit, push or deployment.

## Previous: Screenshot-based Sanctuary refinement (D-093)

Owner supplied nine mock-up screenshots and requested sharp formatting
resemblance using Last Light's current systems/activities. Refined
`src/sanctuary-layout.css` and moved Character's owned roster after its stage
in `src/main.ts`:
- Compact brand/currency/Menu row; left Gameplay page heading. Redundant visible
  Home/Character/Summon/Squad title rows are visually hidden but accessible.
- Larger scenery-backed Adventure hero beside the activity rail.
- Wider Character portrait/narrower framed control panel, underline section
  tabs, full row-based upgrade stat deltas and desktop detail scrolling.
- Full-width Master Conduit plus four-by-two desktop slots/two columns mobile.
  The duplicate secondary Conduits navigation button is hidden; its stable ID
  remains and the primary Conduits section tab performs the same action.
- Approximately two-to-one Summon artwork/sidebar and large three-card Squad
  formation with wider leader/dashed member frames.

Preserved neutral/element colors, Georgia everywhere, supplied art, no bottom
bar, actual-caller Back and modal rates/Information. Character protection/capture
management stays in current categories/controls, rather than inventing a fourth
mock-only tab. All eight gear slots, exact costs/deltas, Max Level, ability
selectors, roster selection and activities remain. No gameplay/economy/save/
combat/art changes.

Verification:
- `npx vitest run src\presentation\hub.test.ts src\presentation\roster.test.ts src\presentation\sanctuary.test.ts src\presentation\menu-information.test.ts`:
  56 tests passed.
- `npm test`:704 tests passed across64 files.
- Build Last Light (`npm run build`): TypeScript/Vite passed with the existing
  >500KB chunk advisory; scoped editor Problems clear.
-28 read-only responsive checks: Home/Gameplay/Character/Growth/Conduits/Summon/
  Squad at measured320/390/768/1280px, maximum-safe balances and Lv105/Evo6 stats.
  Zero page overflow or visible targets below44px; all eight gear slots retained.
- Seven actual1400x800 screenshots generated in a separate headless Edge
  profile with decoded visible artwork. Manually inspected Character/Growth/
  Conduits/Squad/Home/Gameplay/Summon proportions and iterated header/grid rules.
  Outputs are session artifacts, not runtime assets.
- Integrated browser screenshots still returned stale/inactive frames; isolated
  headless rendering avoided that limitation. First screenshot attempt met an
  OS port-file lock/stale port; a later wait included hidden lazy artwork and was
  stopped. Retried with visible-only decoding and explicit10-second timeout;
  all seven final screenshots succeeded. No runtime loader changes.
- Wallet string unchanged; browser fixtures removed, viewport/emulated motion
  restored. Isolated screenshot processes/profile and temporary script cleaned.
- Scoped `git diff --check`: passed.

No commit, push or deployment. No owner decisions needed for this refinement.
Full cinematic battle/transition flows were not retested; this pass changes
menu presentation only. Future event-banner content remains unapproved.

## Previous: Caller-based Back and larger Conduit art (D-092)

Owner requested removing fixed Home shortcuts in favor of traversable Back,
then bigger Conduit icons without the repeated "Recovered mechanism" wording.
Implemented in-memory menu history in `presentation/menu-history.ts` and
`main.ts`: Back returns to the actual caller with valid Character tab/category/
owned selection, banner, gallery/filters, Gameplay category/activity/stage,
unsaved Squad selections and scroll. Equipment selectors are deliberately
excluded from snapshots so they always show current saved gear without stale
restoration or transaction dispatch. Same-page refreshes are not entries.
Home remains inside Menu and shows Back only when it has a caller. Battle Leave/
result Quit return to the entry screen and clear the run; Settings/Information
remain dialogs. Return to title clears history. No browser URL history or
persistent history is added.

Conduit Inventory/equipment icons increased48 ->80px, Store/Archive hero art
increased90/100 -> responsive up to200px. Removed the repeated artwork recovery
labels while retaining catalog names, effects, prices, counts, unique lore,
purchase/equipment controls and all gameplay content. No art/economy/save changes.

Verification:
- Focused history/header/store/archive run found two obsolete fixed-parent-link
  assertions; replaced them with history-aware Back assertions.
- `npm test`:704 tests passed across64 files. Initial concurrent build/test run
  had a5-second integrated-economy timeout (703 passed); rerun without the build
  passed, no timeout/config/economy changes.
- Build Last Light (`npm run build`): TypeScript/Vite passed; existing >500KB
  chunk advisory only. Scoped editor Problems clear.
- Browser: real Home -> Character/Conduits -> Store -> Back restored Character's
  equipment tab; next Back returned initial Home without Back. Store had five
  art images and no repeated recovery label.
- Read-only browser fixtures:16 layout checks, Store/Conduit Archive/Inventory/
  equipped Character at measured320/390/768/1280px, maximum-safe holdings.
  Hero icons measured200px; ordinary icons80px. No horizontal page overflow;
  repeated labels absent. Wallet unchanged; fixtures removed, viewport/motion
  emulation restored.
- Scoped `git diff --check`: passed, normal LF/CRLF notices only.

Browser limitation: inactive integrated-page artwork `decode()` waits hit the
existing12-second transition timeout. Caller DOM/tab restoration was verified,
but successful cinematic completion and every battle-exit path were not
independently browser-verified. No transition behavior was altered to hide this.
History unit tests cover caller chains, same-page/battle exclusion and clearing.

No commit, push or deployment. No new owner decision required.

## Previous: Global Georgia typography (D-091)

Owner requested the earlier fancy/bold font for all text and explicitly selected
Georgia over the mock-up's Fraunces. `src/interface.css` now defines the shared
Georgia/Times New Roman/serif stack, weight600 ordinary text/controls and700
headings/emphasis. High-specificity shared rules override legacy font
shorthands across menus, opening screens, numbers, Information/Settings,
battle HTML/SVG and selection panels appended outside `#app`.
This supersedes only the previous sans-serif preference, not D-090 composition.
No font download, content, mechanics, assets, transactions or save changes.
Browser-native confirmation dialogs retain system typography; they cannot be
styled by game CSS.

Verification:
- `npm run build` via Build Last Light: TypeScript/Vite passed, existing
  >500KB chunk advisory only. Editor Problems: no CSS errors.
- Browser fixtures:28 checks across seven menu renderers at measured
  320/390/768/1280 CSS pixels, Lv105/Evo6 stats and maximum-safe balances/
  material holdings. All text-bearing elements used Georgia; no horizontal
  page overflow; visible button/link targets >=44px in both dimensions.
- Additional computed-style fixtures confirmed Georgia600/700 on battle
  headings/numbers/Defense/SVG damage text, title text, Information and
  body-appended selection dialogs. All temporary fixtures removed; viewport
  restored, wallet unchanged.
- Scoped `git diff --check`: passed. No gameplay logic changed; the700-test
  suite last passed for D-090 and was not rerun for this CSS-only change.

No commit, push or deployment. No further font decision needed.

## Previous: Sanctuary mock-up composition (D-090)

Owner supplied Sanctuary HTML/Markdown references and clarified that they define
the main screen/button structure; existing game content populates them.
Implemented reference-style composition without copying its obsolete mechanics,
serif fonts, arbitrary currency/navigation colors or bottom dock:
- Home: left Standard/event banners, central saved leader/Information,
  three right-side squad slots and Adventure. Standard uses authored banner
  art/name/cost; empty slots link to Squad.
- Shared header Menu: all current destinations plus Settings and Return to title.
  Non-Home menus retain a visible Home button. Settings closes Menu before
  opening; closing Settings focuses the visible Menu trigger. Choosing the
  current destination closes Menu without a transition.
- Gameplay: left category rail/right selected category and detail. Named
  choices show one staged activity at a time, retaining all ten elemental
  dungeons, Heaven/Abyss, Treasury/Sanctuary and ordinary Adventure/Story/Events.
  Selection persists in memory across rerenders, not in saves. Stage values,
  unlocks, entry handlers, reward PNGs and rules remain unchanged.
- Character: left portrait/right Details-Growth-Conduits control panel.
  All eight selectors remain with stable IDs; sections/tabs update only the
  detail and active navigation state. Captured copies use matching portrait/
  controls columns with UUID, lock, level, Max Level, kit, sale and gear intact.
- Summon: artwork/real high-star entries on the left, draw/cost/result/pity/
  Rates & Information on the right; mobile places the sidebar first.
  Existing banner selection and atomic single draws are untouched.
- Squad: heading Save/count, three large formation cards, owned roster.
  The same form fields now preview selected art/identity/count immediately,
  without writing until explicit Save.
- Collections: gallery selectors/banner/filter/status/portrait-card hierarchy
  with existing discovery, silhouettes, Conduit effects and exact loot.
- Linked unmocked Inventory/Stores/Conduit Store/Opening Story/Events retain
  destinations and content with shared spacing/panels/Information. Inventory
  remains holdings-only. No modes or functions were dropped.

Composition is scoped in `src/sanctuary-layout.css`; existing dialog/selection,
number containment and battle styles remain separate. Updated renderer tests,
including capture-leader stats inside the relocated Home Information dialog,
primary Character sections and the externally associated Squad Save button.
No combat/economy/RNG/save/asset changes. Title/starter selection, battle/results
and Settings content were not restructured. No new event pool or mock feature.

Verification:
- `npx vitest run src\presentation\hub.test.ts src\presentation\roster.test.ts src\presentation\sanctuary.test.ts src\presentation\menu-information.test.ts src\content\dungeon-art.test.ts src\presentation\item-showcase.test.ts`:
  69 passed before additional section/header/Information regressions were added.
- `npm test`: final700 passed across63 files. Earlier failures were old
  composition expectations, the moved captured-leader dialog selector and a
  new test's nested-header slice; corrected the specific assertions without
  removing coverage.
- `npm run build` via Build Last Light: TypeScript/Vite passed; existing
  >500KB chunk advisory remains. Scoped editor Problems found no errors.
- Scoped `git diff --check`: passed (normal repository LF/CRLF notices only).
- Browser read-only renderer fixtures:36 layout checks across nine surfaces at
  measured320/390/768/1280 CSS pixels, maximum-safe currency/material counts,
  all Lv105/Evo6 starters and a captured copy. Zero horizontal page overflow;
  visible button/link targets at least44px in both dimensions.
- All14 staged activity choices showed exactly one correct detail/entry/stage
  control. Selected Sanctuary survived a Gameplay rerender.
- All eight Character selectors preserved exact portrait/nav DOM and selected
  the proper section; Growth primary opens Character level.
- Squad removal preview updated the count to2/3 and preserved empty `slot-2`
  FormData without changing the account.
- Information Close restored focus; Menu exposed all ten route destinations.
  Five mobile Information dialogs stayed within the viewport (Home's internal
  scroll-width measurement had a1px fractional rounding difference, no content
  outside its bounds). Real app Menu -> Settings -> Close verified no stacked
  dialogs and restored Menu focus.
- Browser wallet strings were unchanged; fixtures removed, viewport and
  emulated motion restored. No account funding, draw, purchase or upgrade.

Browser automation limitations: the inactive integrated page retained stale
CSS/render frames and `Image.decode()` waits timed out during a navigation
attempt, including already-loaded currency icons. Refreshed the current
stylesheet explicitly for layout measurements and used read-only DOM fixtures.
Loading/transition code was not changed; full cinematic transition timing was
not independently reverified in this pass.

No commit, push or deployment. No owner placement decision is needed after
the clarification; linked screens retain their routes until future bespoke
mock-ups arrive. Future event-banner content/rules remain open as before.
See [layout contract](menus-and-inventory.md#sanctuary-mock-up-composition-d-090).

## Previous: Valley of Solitude intake (D-089)

Moved all16 supplied Valley root PNGs unchanged into `Art/source` by category.
Copied banner/arena byte-for-byte and exported eight960px enemy/six256px
material RGBA cutouts. `Art/provenance/valley-solitude-intake.json` records hashes,
reviewed per-source hue/saturation settings and enclosed-background seeds.
`prepare_dungeons.py --elements ominous` regenerates the pack;
`review_art.py` recognizes every cutout.

Reviewed all14 exports on dark backgrounds plus source-coordinate pocket
previews. Different green/teal/yellow-green backgrounds use individual keys.
Bloom/Heart's pale low-saturation green required lower saturation thresholds;
follow-up review cleared Bloom's four enclosed ribbon/ring regions and Heart's
small suspension-ring gap. Other reviewed seeds clear limbs, antlers, hat
curls, staffs, wings, chains and filigree. Preserved matching Heart gem facets,
Seed casing/chain highlights, pale armor/horns, opaque powers and painted
ground shadows. No source edits, runtime keying or global white removal.

Registered the ordered Ominous enemy pack/slug in `dungeon-art.ts`.
Existing resolvers wire field/arena, skill cut-ins, Collections, material
loot/inventory/costs and activity rewards. Names/order, Umbral Strike,35 stages,
stats/schedules, RNG/drop rules, stable discovery IDs and capture eligibility
are unchanged. Imp/Sentinel/Gargoyle/Regent mirror right when hostile;
Duskmote/Cat already right, genuinely frontal Weaver/Monarch unchanged.
Field/cut-ins share image-only facing; attack wrappers preserve it.

All ten elemental dungeon art packs are now integrated. Updated supplied-art
assertions and discovery fixtures; kept future missing-art regression coverage
using a temporarily unavailable registration and a scoped material-art mock.
No real pack is artificially left pending to satisfy old tests.

Verification:
- `python tools\prepare_dungeons.py --elements ominous --move-sources`:
  all16 originals moved/exported. Subsequent `--elements ominous`
  regeneration finalized reviewed ring gaps and provenance.
- `python -m unittest discover -s tools -p test_valley_art.py`:2 passed
  across16 provenance/deterministic exports, transparent margins, every
  reviewed seed, pale-pixel preservation and retained matching-hue gem/
  casing/armor points.
- `python -m unittest discover -s tools -p test_root_art_intake.py`:
  all7 passed. No incoming/root PNGs remain; existing coverage not weakened.
- `python -m unittest discover -s tools -p test_color_matte.py`:10 passed.
  `python -m unittest discover -s tools -p test_art_prompts.py`:9 passed.
- `npx vitest run src\content\dungeon-art.test.ts src\content\creatures.test.ts src\presentation\unit-facing.test.ts src\presentation\battle-cutin.test.ts src\presentation\item-showcase.test.ts`:
  123 passed across5 files. `npm test`:690 passed across63 files.
- `npm run build` through Build Last Light task: TypeScript/Vite passed;
  existing >500KB chunk advisory remains. Scoped editor Problems found no
  errors; final scoped `git diff --check` passed.
- Browser fixtures rendered all eight actual tier portraits, confirmed
  matching field/cut-in computed CSS scale/facing and unchanged allied left
  facing. Paused actual WAAPI windup/return midway for every enemy:
  16 orientation checks passed.
- Gameplay card uses Valley banner/all six material PNGs; all16 new runtime
  URLs returnedHTTP200. Browser fixtures removed/motion preferences restored;
  no account funding or save writes.

No elemental art pack remains unintegrated. No owner decision needed for
Valley. No commit, push or deployment.
See [workflow](art-workflow.md#valley-of-solitude-intake-d-089).

## Previous: Sky-bound Rift intake (D-088)

Moved all16 supplied Sky-bound Rift root PNGs unchanged into `Art/source` by
category. Incoming `Sky-bound RIft Arena.png` spelling/capitalization remains
in source; both runtime scenery files use canonical `sky-bound-rift.png`.
Copied scenery byte-for-byte and exported eight960px enemy/six256px material
RGBA cutouts. `Art/provenance/sky-bound-rift-intake.json` stores source/runtime hashes,
reviewed per-image key settings, enclosed-hole seeds and foreground polygons.
Exporter/review tools recognize Atmospheric.

Reviewed all14 exports on dark backgrounds, refining actual source colors
rather than applying the prompt's nominal key. Most use magenta/pink; Seed
and Drake use cyan overlapping subject art. Removed enclosed cloud/horn/
limb/hat/staff/wing/ring/filigree background gaps. Seed's variable cyan gradient
uses a wider key with tight curled-feather/gem/ribbon polygons and pale-channel
protection; its enclosed ribbon loop remains clear. Drake retains dark feather
shading, bright cyan powers and ground shadow through a value gate/highlight
mask. Material background-shadow remnants use reviewed tolerances and Soul's
extra lower-only key; both passes union alpha rather than restore an opaque
rectangle. Original art and supplied-alpha handling remain untouched.

Registered Atmospheric enemy order/slug in `dungeon-art.ts`. Shared resolvers
wire arena/enemies, cut-ins, Collections, materials/loot/inventory/costs and
activity card rewards. Gale Strike,35 stages, enemy stats/schedules, RNG/drop
rules, discovery IDs and capture eligibility unchanged.
Puffling/Harpy/Ibex/Drake/Griffin/Regent mirror right when hostile; Sylph already
faces right, genuine frontal Roc stays unchanged. Field and cut-ins use the
same image-only metadata; attack wrappers do not overwrite it.
Updated art-pending tests to remaining Ominous rather than supplied Atmospheric.

Verification:
- `python tools\prepare_dungeons.py --elements atmospheric --move-sources`:
  all16 sources moved/exported; subsequent `--elements atmospheric`
  regenerations finalized cleanup. One early Drake seed was rejected because
  the trial highlight mask protected it; reviewed its source color and refined
  the mask/true background seeds rather than suppressing the error.
- `python -m unittest discover -s tools -p test_sky_art.py`:3 tests passed
  across16 hashes/deterministic records, all transparent margins, every reviewed
  hole seed, pale pixel preservation, cyan foreground points, clear gradients
  and lower material-shadow removal. Tightened one feather polygon after its
  exact background-point regression caught a retained patch.
- `python -m unittest discover -s tools -p test_color_matte.py`:10 passed.
- `python -m unittest discover -s tools -p test_root_art_intake.py`:
  6 passed/1 failed solely for16 newly supplied Valley of Solitude/Ominous root
  PNGs. Those are outside this request and remain untouched. No Sky-bound Rift
  originals remain in root; the existing all-root coverage test was not weakened.
- `npx vitest run src\content\dungeon-art.test.ts src\content\creatures.test.ts src\presentation\unit-facing.test.ts src\presentation\battle-cutin.test.ts src\presentation\item-showcase.test.ts`:
  111 passed across5 files. `npm test`:679 passed across63 files.
- `npm run build` through Build Last Light task: TypeScript/Vite passed;
  existing >500KB chunk advisory remains. Scoped editor Problems and
  `git diff --check` found no errors.
- Browser rendered all eight representative enemy-tier stages and matching
  field/cut-in CSS scale/facing. Six directional sources mirror, Sylph and
  frontal Roc remain unmirrored. Paused actual WAAPI windup/return animations
  midway for every enemy:16 orientation checks passed. Allied facing unchanged.
- Gameplay card uses Sky-bound banner/all six material PNGs; all16 new runtime
  URLs returnedHTTP200. Browser fixtures removed/motion preferences restored;
  no owner account funding or save writes.

One elemental pack remains unintegrated: Ominous/Valley of Solitude. Its incoming
root art awaits separate intake. No owner decision needed for Sky-bound Rift.
No commit, push or deployment.
See [workflow](art-workflow.md#sky-bound-rift-intake-d-088).

## Previous: Ruins of Chaos intake and battle facing (D-087)

Moved all16 supplied Chaos root PNGs unchanged into `Art/source` by category.
Copied banner/arena byte-for-byte; exported eight960px enemy cutouts and
six256px material cutouts. `Art/provenance/ruins-chaos-intake.json` records hashes,
per-source key hues and reviewed enclosed-hole seeds.
`prepare_dungeons.py --elements chaotic` regenerates the pack;
`review_art.py` recognizes every cutout.

Reviewed all14 exports on dark backgrounds and inspected original pockets.
Individually keyed green/teal/yellow-green backgrounds and removed enclosed
hat/staff/limb/horn/filigree/ring gaps. Retained matching cyan prism facets,
Gremlin's cyan hand effect, Drake's teal ring power, pale highlights and
painted shadows. No source edits, runtime keying or global white removal.

Registered the ordered Chaotic pack/slug in `dungeon-art.ts`. Shared helpers
wire encounters, arena, cut-ins, Collections, material loot/inventory/costs
and activity previews. Enemy names/order,35 stages, Rift Strike, stats,
schedules, discovery IDs, reward RNG and capture eligibility are unchanged.

Hostile Riftpip remains right; Gremlin/Scarab/Sentinel/Drake/Chimera mirror
right. Genuine frontal Behemoth/Sovereign remain unchanged. Reviewed all111
supplied character/enemy sprites using current side transforms. Existing
facing metadata remains valid; no unrelated flips. Shared field/cut-in image
attributes target enemies right/allies left, including captured allies.
Entrance/death/attack wrappers preserve image-only facing; added regressions
for both attack/return sides and every supplied portrait's cut-in metadata.

Verification:
- `python tools\prepare_dungeons.py --elements chaotic --move-sources`:
  all16 originals moved/exported; subsequent `--elements chaotic` regeneration
  finalized reviewed enclosed gaps and provenance.
- `python -m unittest discover -s tools -p test_chaos_art.py`:2 passed
  across16 provenance records, deterministic exports, transparent holes,
  preserved pale pixels and selected matching-hue prism points.
- `python -m unittest discover -s tools -p test_color_matte.py`:10 passed.
  `python -m unittest discover -s tools -p test_art_prompts.py`:9 passed.
- `python -m unittest discover -s tools -p test_root_art_intake.py`:
  6 passed/1 failed solely for16 incoming Sky-bound Rift/Atmospheric root PNGs.
  They are outside this request and remain untouched; no Chaos files remain
  in root. The existing all-root coverage test was not weakened.
- `npx vitest run src\content\dungeon-art.test.ts src\presentation\unit-facing.test.ts src\presentation\battle-cutin.test.ts`:
  90 passed across3 files. `npm test`:670 passed across63 files.
- `npm run build` through Build Last Light task: TypeScript/Vite passed,
  existing >500KB chunk advisory remains. Initial build caught a boolean
  capture mock; replaced it with a typed copy fixture before the passing build.
  Scoped editor Problems and `git diff --check` found no errors.
- Browser fixtures confirmed all eight Chaos tier portraits and matching
  field/cut-in computed CSS scale; all16 runtime assets returnedHTTP200.
  Gameplay card uses the banner/six material PNGs.
- Browser facing fixtures covered all15 activity destinations, all18 starter
  forms and a captured leader. Paused actual WAAPI animations midway through
  both sides' skill cut-in, windup and return preserved `scale: -1 1` on
  mirrored images. Fixtures removed/preferences restored; no save writes.

Two elemental packs remain unintegrated: Atmospheric/Sky-bound Rift and
Ominous/Valley of Solitude. Incoming Sky-bound Rift art awaits separate intake.
No owner decision needed for Chaos. No commit, push or deployment.
See [workflow](art-workflow.md#ruins-of-chaos-intake-d-087).

## Previous: Precipice of the Earth intake (D-086)

Moved all16 supplied Precipice root PNGs unchanged into Art/source by category.
Copied scenery byte-for-byte and exported eight960px enemy/six256px material
RGBA cutouts. Art/provenance/precipice-earth-intake.json stores hashes, per-image keys,
reviewed enclosed-hole seeds and protected foreground polygons.
The typo Flntback Armadiillo.png is preserved in source; runtime uses canonical
Flintback Armadillo. Export/review tools recognize Tectonic.

Reviewed all14 on dark backgrounds; refined Atlas/Soul crystal masks from
broad trial regions to tight silhouettes, removed Bloom's cyan gradient with
a wider per-source tolerance, and retained Gargoyle mineral wings using a
bright-background value gate. Genuine limb/horn/ring gaps are transparent;
colored facets, robe/scarf/stone shading, pale highlights and shadows survive.
No source edits, runtime keying or global white removal.

Registered the ordered Tectonic pack/slug in dungeon-art.ts; existing resolvers
wire arena, enemies, cut-ins, Collections, loot/inventory/progression and
activity material previews. Stats,35 stages, strike schedules, drop odds and
stable discovery IDs unchanged. Directional Pebblekin/Armadillo/Ram/Cyclops/
Gargoyle mirror right, Kobold already right; genuine frontal Atlas/Behemoth
remain unmirrored. Shared image-only facing avoids flipping panels/text.

Verification:
- `python tools\prepare_dungeons.py --elements tectonic --move-sources` moved
  all16; subsequent `--elements tectonic` regenerations finalized cleanup.
- `python -m unittest discover -s tools -p test_precipice_art.py`:2 tests passed
  across16 provenance/export records, deterministic output, clear holes,
  protected crystal/wings/scarf points and clear background around masks.
- `python -m unittest discover -s tools -p test_art_prompts.py`:9 passed.
  `python -m unittest discover -s tools -p test_color_matte.py`:10 passed.
- `python -m unittest discover -s tools -p test_root_art_intake.py`:6 passed/
  1 failed because16 new Ruins of Chaos root PNGs are unmapped. Those are
  outside this request and left untouched; Precipice roots are fully moved.
- Final `npm test`:658 tests/63 files passed. Updated pending-art fixtures
  from now-supplied Tectonic to still-pending Atmospheric.
- `npm run build`: TypeScript/Vite passed with existing >500KB advisory.
  Editor Problems found no errors in content/facing modules.
- Browser render fixtures confirmed all eight actual Tectonic enemy PNGs at
  representative stages and correct computed mirroring, plus new card banner
  and six material PNGs. All16 runtime URLs returnedHTTP200.
  Fixtures removed; no account funding/save writes.

Three elemental packs remain art-pending; newly arrived Ruins of Chaos files
are unprocessed. No owner decision needed for Precipice. No commit/push/deploy.
See [workflow](art-workflow.md#precipice-of-the-earth-intake-d-086).

## Previous: Lustrous River art intake (D-085)

Owner supplied16 root PNGs and requested moving/wiring/proper background
removal plus right-facing enemies. Moved all16 unchanged to `Art/source` by
category; originals are preserved. Exported eight960px enemy RGBA cutouts,
six256px Luminous materials and unchanged-byte header/arena scenery.
`Art/provenance/lustrous-river-intake.json` records source/runtime hashes and reviewed
processing. `prepare_dungeons.py --elements luminous` regenerates only this
pack; `review_art.py` recognizes its originals.

Different green/teal/yellow-green key colors use per-source border-connected
removal plus explicit normalized seeds for enclosed ribbon/limb/filigree gaps.
Reviewed all14 on dark backgrounds; retained ivory, opal/cyan facets, powers
and painted shadows. A follow-up Lanterncap review added a source-specific
brightness foreground mask to preserve cyan powers that overlap the teal key;
regenerated and reran all3 Lustrous tests successfully.
No runtime keying, global white removal or source edits.
Registered the Luminous slug/enemy order in dungeon-art.ts: battle arenas,
portraits/cut-ins, Creature gallery, material loot/inventory/upgrade costs and
activity reward PNGs resolve through existing shared helpers.
Guardian/Griffin/Oracle/Kirin mirror right; Glimmerkin/Brownie/Tortoise/Sovereign
retain right gaze/weapon stance. Reviewed all eight battle-oriented cutouts.
No stage, stats, strikes, loot odds, save IDs, discovery or captures changes.

Verification:
- `python tools\prepare_dungeons.py --elements luminous --move-sources`:
 16 sources moved/exported; scenery source/runtime bytes match.
- `python -m unittest discover -s tools -p test_lustrous_art.py`:3 tests passed
  covering all16 hashes, deterministic exports, transparency/reviewed holes,
  pale subject preservation and matching-color crystal/lantern preservation.
- `python -m unittest discover -s tools -p 'test_*.py'`:52 passed/1 failed
  (53 total). During work a separate16-file Precipice/Tectonic intake appeared
  in the root. Existing root-intake test rejects those unmapped PNGs; unrelated
  files left untouched. This failure is not Lustrous cleanup.
- `npm test`: final649 tests across63 files passed. The first run overlapped
  CPU-heavy Python image tests and hit the existing500-pull economy test's5s
  timeout; rerun after image tests finished passed without timeout changes.
- `npm run build`: TypeScript/Vite passed, existing >500KB advisory remains.
  Scoped `git diff --check` passed.
- Browser battle renderer fixtures across eight representative stages confirmed
  all eight actual enemy PNGs/data-facing=right; Guardian/Griffin/Oracle/Kirin
  have computed CSS scale=-1 1, others none. All16 runtime URLs returnedHTTP200.
  Gameplay Luminous card uses the new banner/all six material PNGs.
  Fixtures removed; no account funding/save writes.

Four elemental packs remain art-pending. New Precipice/Tectonic root files are
outside this request and unprocessed. No owner decision needed for Lustrous;
no commit, push or deployment. See [workflow](art-workflow.md#lustrous-river-intake-d-085).

## Previous: Associated item artwork (D-084)

Owner requested actual associated item PNGs to make activities and submenus
visually stand out rather than only naming currencies. Added shared
`src/presentation/item-showcase.ts`/`.css`: framed80px PNGs, neutral spotlight
surfaces, item names and full exact quantities. Adventure shows Prismatica;
elemental cards show Prismatica/own-element six materials across stages;
Heaven/Abyss show both currencies/their own specialty trio; Treasury shows
Prismatica, Sanctuary both currencies. Art-pending materials remain named neutral
tiles. No guaranteed-drop claims or unrelated/missing images.

Captured level costs/sale values, revealed Creature sale values and Max Level
costs use the shared showcase. Home Adventure and Stores entry get Prismatica
PNG icons; currency-reward icons are64px. Existing Inventory, upgrade, Conduit
Store and Summon artwork remains. Removed the duplicate plain Creature sale
paragraph when adding its visual values. Stage loot/discovery gating, exact
amounts, costs, reward RNG and atomic persistence are unchanged. No source art
or exported images modified.

Verification:
- `npm test`:640 tests across63 files passed, including four new item artwork
  tests checking associations, pending fallbacks, maximum-safe quantities and
  existence of every referenced activity showcase PNG. Updated obsolete
  dungeon assertions that prohibited material images.
- Final `npm test -- src\presentation\item-showcase.test.ts
  src\game\rosethorn-sanctuary.test.ts src\game\max-level.test.ts`:29 tests passed
  after removing the duplicated Creature sale paragraph.
- `npm run build`: final TypeScript/Vite passed; existing >500KB advisory remains.
  Editor Problems found no errors in the new renderer/styles/test or touched
  Max Level/Creature/main files.
- Browser renderer fixtures: measured320/390/768/1280px, all four reward-bearing
  activity categories,80px images, no page/showcase overflow, including
  maximum-safe sale quantities. Currency images returnedHTTP200 and decoded
  at256px natural width. Hidden-tab screenshots were stale; validation relies
  on actual DOM geometry/loading checks, not an exhaustive screenshot audit.

Browser fixtures removed by reload; no account funding/save writes.
No owner decision needed. Future event content and historical Game Screenshots
coverage remain pending; no commit, push or deployment.
See [artwork contract](menus-and-inventory.md#associated-item-artwork-d-084).

## Previous: Selection panels and shared Information (D-083)

Owner selected replacing native dropdowns and expandable descriptions, keeping
centered Information dialogs rather than separate pages. Added the shared
`src/presentation/selection-panel.ts` enhancement:48px labeled triggers/choices,
selected state, disabled option/group/source guards, preserved backing selects
and exactly-once input/change dispatch. Native modal focus, Close/Escape,
reset/rerender updates, stale-option errors and complete disposal/rebinding are
implemented. Detached controls restore their original select/label markup.

Character, Gameplay and Collections now have one shared rules panel each.
Removed repeated generic card descriptions and starter descriptions repeated
across evolutions; retained unique kits, costs, stat previews, loot, sale prices
and protection/rejection reasons. Captured abilities/equipment and revealed
creature loot are sections. Archive form Combat kits use centered dialogs.
Summon rules have no nested disclosure. Battle reference/log and result summary
are sections inside their existing surfaces, with actions/timing unchanged.
No runtime renderer has expandable descriptions. Save/economy/combat math are
unchanged. See [menu contract](menus-and-inventory.md#selection-and-shared-information-d-083).

Verification:
- `npm test`:636 tests across62 files passed, including four new shared
  Information regression tests. Updated obsolete markup/copy assertions;
  summon art restrictions are asserted on the text-only rate table, not the
  separately approved featured-character strip.
- `npm run build`: TypeScript/Vite passed; existing >500KB chunk advisory remains.
- Editor Problems: no errors in the new selection module/regression tests.
- Browser selection fixtures verified disabled options/groups/sources, one
  input/change pair, FormData, reset, modal focus, Close/Escape, removed-source
  closure, stale-option error, restored labels/selects on disposal and one
  trigger on rebind. Collections element filtering/reset updated both cards
  (6/42 then42/42) and the visible selected label.
- Gameplay/Collections/equipment renderer fixtures at measured320/390/768/1280px
  had no horizontal overflow, no visible native selects/details and48px visible
  selection triggers/options. Endgame character progress and maximum-safe
  balances were in-memory fixtures, not saved account changes.

Fixtures/isolated context removed; owner's account was not funded or changed.
A hidden-tab navigation attempt hit the existing artwork-loading timeout, so
responsive coverage used render fixtures; no exhaustive live-route/transaction
E2E claim. No owner decision needed for this scope. Future event banner still
needs approved content/policy; historical Game Screenshots coverage remains
incomplete. No commit, push or deployment.

## Previous: Summon banner selector (D-082)

Owner requested switching among summon banners; Standard exists now and a
special event is planned. Added a visible wrapping banner selector above Summon,
with Standard as its only real entry. Central `src/content/summon-banners.ts`
registry drives the selected name/art/cost/pool/featured characters and per-ID
pity. Selection is transient, preserved across in-session menu/Settings/draw
refreshes. Confirm passes the captured selected ID to `summonCharacter`;
unknown IDs reject before RNG/spending/writes. Standard defaults preserve old
callers, cost, pool, duplicate conversion, atomic save and pity behavior.

Verification: `npm test -- src\content\summon-banners.test.ts
src\presentation\roster.test.ts src\game\banner-pity.test.ts
src\game\banner-and-lycalis.test.ts` passed35 tests across4 files.
Build Last Light (`npm run build`) passed TypeScript/Vite with existing
bundle advisory. Browser fixtures at measured320/390/768/1280px show the selected
Standard button at48px height without overflow, with15 unchanged rate rows.
An initial hidden-tab audit used stale CSS; reloaded and rechecked actual styles.
Fixtures removed; no save funding or draws in the owner's browser.

The special event is NOT implemented or advertised as drawable. Before adding
it, approve pool/awarded forms, cost, duplicate rules, pity, dates/eligibility and
art; author its Information disclosures and validate independent save counters.
Current reward/disclosure definitions still encode Standard's approved policy.
Two-entry selector rendering is tested with non-runtime fixtures; no real
second-banner E2E claim. No commit, push or deployment.
See [banner selection](summoning-and-economy.md#banner-selection-d-082).

## Previous: Banner character identity strip (D-081)

Owner approved showing element emblems, rarity and names for5/6-star characters
obtainable from each banner. Added Available Element-Bearers below banner art,
derived from actual character outcomes. Standard lists Infernis, Tizu and Flora
with their element emblems,5 stars and awarded Common/Evo1 rarity, independent
of owned evolution. No6-star placeholders, creature duplicate conversions,
portraits, boosted-rate claims or new rewards. The15-row modal rate table remains
text-only; draw cost, odds, pity, saves and banner artwork are unchanged.

Verification: `npm test -- src\presentation\roster.test.ts` passed12 tests;
`npm test -- src\game\banner-pity.test.ts src\game\banner-and-lycalis.test.ts`
passed19 tests. Build Last Light (`npm run build`) passed TypeScript/Vite with
the existing bundle advisory. Browser renderer fixtures at measured
320/390/768/1280px retained all three names/emblems and15 rate rows without
horizontal overflow; fixtures removed without save writes.
No owner decision needed. Future new characters require registered definitions
and awarded-form metadata; no6-star character content was invented.
No commit, push or deployment.

## Previous: Menu organization and Max Level (D-080)

Owner answered16 UI preference questions and supplied Sanctuary HTML/Markdown
references. Implemented the approved direction: Inventory is holdings only,
Stores contains Conduit Store, Collections contains the three existing galleries,
and Character separates selectable Element-Bearer/captured-creature rosters.
Selected captured UUIDs retain their leveling, locks, sale and Conduit controls;
removing a selected copy falls back to the next owned copy. No bottom bar.
Home remains portrait-first with grouped destinations, level/form identity,
compact squad/Adventure panels and optional stats/lore.

Shared centered native Information dialogs now hold optional rules/instructions;
costs, eligibility, errors, selectors and confirmations remain visible.
Summon rates/rules are in Rates & Information with all15 exact text-only outcomes;
cost/action/pity remain visible. Gameplay cards are concise. Removed repetitive
save reminders and decorative non-lore prompts. All UI, including Settings,
opening screens and battle text, uses the same sans-serif stack.
`src/interface.css` owns final overrides; numeric containment is unchanged.
Menu transitions are short; decorative title/star loops are removed, character
idle remains. Combat math/RNG, cut-in timing, rewards and art are unchanged.

Max Level uses pure `maxLevelPlan` and `levelCharacterToMaximum` in
`src/game/account.ts`. Preview shows highest currently affordable level within
the current cap, total ordinary Prismatica/material costs and all seven equipped
stat changes. Confirm rereads and rejects changed target/cost/progress/equipment,
then updates the exact owned ID with one validated write. Captures normalize
legacy stage/kit only when explicitly upgraded. No evolution, fodder consumption
or Null-Prismatica spending; locks, UUIDs, gear, squad, ranks and receipts survive.
Starter Max Level updates the existing portrait/detail DOM before celebration.

### Verification

- `npm test`:626 tests across60 files pass. New Max Level tests cover exact
  cumulative thresholds, material/currency/specialty limits, caps, pure preview,
  one-write persistence, unrelated-data retention, legacy captures, stale
  resources/progress/equipment, unowned requests and storage failure.
- VS Code Build Last Light (`npm run build`): TypeScript/Vite pass; existing
  >500kB bundle advisory remains. Editor reports no errors.
- `git diff --check`: passes; only existing Windows line-ending notices.
- Isolated browser save: Infernis Lv0->2 consumed26 Prismatica/2 Common;
  Treasury copy Lv65->67 consumed286 Prismatica/6 Common. Both confirmation
  flows persisted the displayed target and exact costs. Starter portrait node
  remained the same. The isolated context was closed; owner's save untouched.
- Disposable real-renderer fixtures at measured320/390/768/1280px: ten surfaces
  (Home, Character, captured details, Gameplay, Inventory, Conduit Store,
  Collections, Squad, Summon and Max Level) had no horizontal overflow,
  no visible buttons below44px, and consistent computed sans-serif fonts.
  Fixtures included maximum-safe balances/material counts and Lv105/Evo6 stats.
  Summon dialogs retained15 rows and had no internal horizontal overflow.
- Live Stores route and Information Close/Escape-key-event handling verified;
  closing restores opener focus. Native focus containment comes from showModal.
  Integrated-browser keyboard injection did not deliver Escape reliably, so
  the browser check dispatched a bubbling Escape key event to the focused
  dialog control. Some long navigation/image-decode audits stalled in hidden
  tabs and were aborted; do not claim exhaustive image/E2E coverage from them.
  Temporary fixtures were removed and isolated browser contexts closed.

### Remaining work and decisions

No further owner decision is required for this request. No new stores,
completion system, tutorial popups or skill-upgrade mechanics were added.
Earlier exhaustive Game Screenshots coverage is still incomplete/unverified.
No commit, push or deployment. See
[current menu contract](menus-and-inventory.md#current-navigation-and-presentation-d-080)
and [progression](units-and-progression.md#max-level-d-080).

## Previous: Enclosed RGB background pockets

Owner reported retained contrast-key colors inside cutout holes and supplied
the Fracture Reservoir example. Border-only keying left its two enclosed green
frame gaps opaque. Reviewed the27 new RGB cutouts and applied36 explicit
source-normalized background seeds across11 exports: three emblem loops,
Fracture Reservoir, three Treasury creatures and four Rosethorn forms.
Only key-matching connected pockets clear; painted pink/orange details remain.

Added shared validated seed support for hue/RGB floods and a hash-guarded
`--regenerate` path in `tools/intake_root_art.py`. Reviewed candidate exports
on dark backgrounds before applying. Updated the existing intake manifest's
processing parameters/runtime hashes. Exactly11 exports changed; all36 archived
originals and other25 exports were verified unchanged. The96 authoritative-alpha
assets, scenery, facing, UI and game rules are untouched.

Validation: `python tools\intake_root_art.py --regenerate` passed the pre-write
plan; `python tools\intake_root_art.py --regenerate --apply` installed reviewed
outputs. `python -m unittest discover -s tools` passes50 tests, including
selective pocket removal, retained RGB pixels, invalid seeds, regeneration
tamper rejection, provenance/idempotence and supplied-alpha preservation.
Browser decoded the served256px Fracture Reservoir and confirmed both gap
pixels have alpha0 while its central crystal has alpha255. Source/candidate
review sheets are session artifacts, not runtime assets.

Future RGB deliveries still require individual review; intentional matching
subject colors are not background. No commit, push or deployment.
See [RGB workflow](art-workflow.md#owner-supplied-opaque-rgb-art-intake-36-images).

## Previous: Cinematic sanctuary menu polish (D-078)

### Bottom bar removal (D-079)

Owner requested removal of the bottom navigation bar. Removed its renderer and
runtime call; Home cards remain the main destination directory. All other
sanctuary headers expose a labeled Home button. Contextual Inventory/Character
routes and battle navigation are unchanged. Status offsets no longer reserve
space above the former bar. Validation: focused sanctuary/Archives/store/Home
tests pass37 tests across4 files; `npm run build` passes with the existing
chunk-size advisory.

Owner selected the charcoal/ivory direction after requesting clearer categories,
prominent navigation and a polished gacha-like presentation across menus.

- Replaced Home's narrow scrolling shortcut rail with nine cards in three
  labeled groups. Preserved portrait bounds, actual squad/stats/lore and
  Adventure entry.
- Enlarged all seven main navigation destinations; added explicit Inventory
  submenu and Character growth/copy-management/squad routes.
- Added descriptive Gameplay category tiles and heading focus/scroll. Small-screen
  Character tab selection reveals its detail without replacing portrait DOM
  or altering saved-upgrade celebration behavior.
- Moved the single summon action beside its cost, before the outcome table.
  Preserved pity, exact fifteen text-only outcomes, confirmation and atomic draws.
- Shared textured neutral framing, spacing, typography, focus, hover feedback
  and reduced-motion-aware panel entrances cover collections, store, squad,
  story, Events, Settings and opening screens. Battle retains existing isolated
  field-first layout/chrome. No assets, rewards, rules or saved balances changed.
- Final composition lives in `src/sanctuary-polish.css`; numeric containment
  remains in `src/numeric-layout.css`. Use normal page scrolling, not hidden
  nested Home/detail scrollboxes. See [menu contract](menus-and-inventory.md).

Validation: `npm test` passes609 tests across59 files; `npm run build` passes
TypeScript/Vite with the existing >500kB advisory. An initial full-suite run
timed out on the pre-existing500-pull economy test during a concurrent build;
its focused rerun passed4 tests, then the complete suite passed without a
concurrent build. Actual browser
rendering of Home, Character, Gameplay, Inventory, Squad, Summon, Archives and
Conduit Store at measured320/768/1280px widths found no horizontal overflow,
escaped controls or navigation targets below44px. All eight Character selectors
preserved the portrait DOM at each width. Live Home/Gameplay and Character at390px
loaded artwork and showed no errors; device reduced motion produced no animations.
The browser fixture audit renders real saved state without writing account data.
Separate disposable rendering fixtures at320/1280px retained exact
9007199254740991 balances/material counts and100787.57 endgame HP on Home and
Character without horizontal overflow. These values were never written to saves.
The integrated browser sometimes stalls hidden-page timers/screenshots; a timed
navigation wait expired once, then the next check found the completed destination
with no loading curtain or error. Do not treat fixture rendering as a complete
end-to-end transaction walkthrough.

No commit, push or deployment. Events, independent skill upgrades and missing
dungeon artwork remain deferred as before. No further owner decision is needed
for this approved visual direction.

## Previous: Phase12 owner-supplied art intake and runtime integration

### Root image cleanup

At the owner's request, removed the36 redundant root PNGs after verifying each
against its archived source and recorded source/runtime SHA-256 hashes.
Originals remain intact under `Art/source` and runtime assets are unchanged.
The intake tool now supports archived-only inputs; coverage tests permit absent
root copies while requiring every mapped original to remain available.
Validation after cleanup: `python tools\intake_root_art.py` validates all36
archived inputs/exports; `python -m unittest discover -s tools -p
test_root_art_intake.py` passes4 tests. No root PNGs remain.

Follow-up missing currency images were caused by the stopped local Vite server:
browser requests to port5173 failed with `ERR_CONNECTION_REFUSED`, not missing
files. Restarted the existing `Run Last Light` VS Code task and reloaded Home
without modifying saves. Both currency PNGs returned HTTP200 (`image/png`) and
decoded at256x256 in the browser; both Home portraits also loaded. A PowerShell
HTTP sweep of all180 runtime images returned200 with image content types and
zero failures. No runtime code or asset changes were needed.

### Squad setup recovery

Removed battle-squad validation from general menu rendering so it cannot block
access to Squad setup. When squad state is absent or unusable in memory, the
editor presents the first owned character as a proposed leader; it persists only
after Save squad. Home falls back to the saved starter without requiring battle
readiness. Battle entry still validates one to three distinct owned members.
An account with no owned members displays an explicit empty state.
See [Squad rules](menus-and-inventory.md).

Validation: `npx vitest run src/presentation/roster.test.ts
src/game/squad.test.ts src/game/flow.test.ts` —46 tests passed;
`npm test` —606 tests passed across59 files; `npm run build` passed with the
existing chunk-size advisory. Browser flow from new profile to Home to Squad
confirmed the editor is reachable and the owned Infernis is selectable as
leader. Test profile/wallet data was removed afterward.

### Home portrait sizing follow-up

Reduced the Home centerpiece art maximum from720px to480px on desktop, from
620px to360px on tablet, and to280px on phones. Width remains bounded by its
available container; portrait crop/facing and Character-screen art are unchanged.
See [Home layout](menus-and-inventory.md).
Validation: `npx vitest run src/presentation/hub.test.ts
src/presentation/character-rating.test.ts` passes42 tests; `npm run build`
passes with the existing Vite chunk-size advisory. Browser check at the available
1290x852 viewport confirmed the Home portrait box is480x480px with no horizontal
page overflow. Smaller requested browser widths are clamped by this harness and
were not directly measured.

The owner supplied36 opaque RGB PNGs in the repository root and requested
appropriate background removal, copies in the art source tree, and wiring into
the game. All originals were copied byte-for-byte to `Art/source`; redundant
root copies were subsequently removed at the owner's request. The source/runtime SHA-256 hashes and per-image settings are in
[root-art-intake.json](../Art/provenance/root-art-intake.json).

- Ten elemental medallions and five Common Conduit icons use explicit,
  border-connected hue/saturation keys.
- Twelve Treasury/Rosethorn creature portraits use border-swatch RGB-distance
  keys and transparent normalized exports. Their battle sprites now have
  reviewed right-facing metadata.
- Seven scenery banners and two arenas are copied byte-for-byte; they are not
  background-removed.
- Runtime wiring covers all ten element labels, five Conduit icons and store
  banner, three Archive banners, Standard Banner artwork, Treasury/Sanctuary
  activity headers, six portraits per mode, and both arenas. Existing
  `assetUrl()` base-aware paths are retained. Existing supplied-alpha assets
  were not modified.
- Updated affected art/economy specs and regressions. Remaining five elemental
  dungeon art packs (Earth, Wind, Light, Shadow and Chaos) are still pending;
  no unrelated/missing image was substituted.

### Phase12 validation

- `python tools/intake_root_art.py` — all36 mappings validate in dry-run mode;
  preserved originals and prior outputs match the recorded hashes.
- `python -m unittest discover -s tools -p test_root_art_intake.py` —4 tests pass.
- `python -m unittest discover -s tools` —46 tests pass.
- `npx vitest run src/presentation/archives.test.ts src/presentation/conduit-store.test.ts src/presentation/roster.test.ts src/content/infusions.test.ts src/presentation/unit-facing.test.ts src/game/treasury.test.ts src/game/rosethorn-sanctuary.test.ts` —87 tests pass.
- `npm test` —604 tests pass across59 files.
- `npm run build` — TypeScript and production build pass; Vite reports the existing >500kB chunk advisory.
- Browser smoke check fetched13 representative element, Conduit, portrait, banner and arena URLs under `/LastLightGame/assets/`; all returned HTTP200. The isolated test profile created for opening-flow access was removed; no profile remains.
- No commit, push or deployment.

No further owner decisions are needed for this approved intake. Future RGB
deliveries still need per-image review; do not apply this keying to supplied
alpha sources or the five unprovided dungeon packs. See [art workflow](art-workflow.md#owner-supplied-opaque-rgb-art-intake-36-images)
and [Phase12](roadmap.md).

## Previous: Phase11 Integrated validation and cross-system verification

Phase11 adds comprehensive testing of economy lifecycle, combat continuity, save persistence and UI consistency across all implemented features.

New [integrated-economy.test.ts](<C:/Users/creat/Downloads/Coding/Projects/Last Light/src/game/integrated-economy.test.ts>) exercises four critical scenarios:

1. **Both farms → exact-copy dual sale → draw with duplicate conversion → Conduit equipping → protection → unequipping → full resale**
   - Treasury and Rosethorn missions award captured creatures and Prismatica+Null-Prismatica independently.
   - Owned copies sell for exact form-based prices, protect other saves and remove exact instances.
   - Draw costs 10 Null-Prismatica atomically when funds available; fails safely without charging if insufficient.
   - Duplicate EB result grants Treasury Omnic Lv50 copy with `acquisition:banner-duplicate` provenance.
   - Conduit equipping prevents sale; unequipping enables it. Sale atomicity protects both currencies.

2. **200/500 actual pity milestones with reload persistence**
   - Pull 200 triggers highest-star guarantee; pull 500 triggers unowned-highest-star or all-owned fallback.
   - Sale and reload transactions never reset pity counters.
   - Expected counts match exact pulls with independent RNG per creature mode.

3. **Independent leveling/equipment snapshots across all 15 activity destinations and Continue**
   - Rosethorn capture levels independently to 65, retains learned stats and equipped Conduits.
   - Squad protection prevents sale; Conduit protection prevents sale; manual locks prevent sale.
   - Adventure plus all ten elemental dungeons and Heaven, Abyss, Treasury and Rosethorn Sanctuary preserve instance IDs, levels, equipment and Gauge across waves/stages.

4. **Legacy v2 wallet compatibility**
   - Old 12k Prismatica, 10 Null-Prismatica, materials, characters, stages, receipts load read-only.
   - First new transaction converts v2→v3 atomically, migrates stages to 35-floor equivalents, keeps everything intact.
   - Historical fields missing from v2 are added as empty/defaults on first save.

**590 tests** across 59 files pass. The integrated mixed-squad test now creates each of the 15 playable activity destinations and verifies roster IDs, captured level, equipment and Continue state. Production build has no typecheck errors. All transaction types preserve exact state, persist correctly, enforce protections and roll back safely on failure. Character Archive displays all 42 EB evolutions and captured creature forms with owned/unowned reconciliation.

### Phase11 validation record

- `npm test` — 590 tests passed across 59 test files.
- `npx vitest run src/game/integrated-economy.test.ts` — 4 tests passed after expanding the activity matrix to all15 destinations.
- `npm run build` — TypeScript check and Vite production build passed; Vite still reports the existing >500kB bundle-chunk advisory.
- `python -m unittest discover -s tools -p test_art_prompts.py` — 9 prompt-contract checks passed.
- Browser smoke test — title → starter selection → Home worked; Home had no horizontal overflow at the browser harness's available viewport widths of400,488 and1600px. The harness clamps requested320,390 and1280px widths to those available dimensions, so those exact breakpoints were not re-measured in this session. Existing prior responsive checks are listed in the historical handoff below.
- Browser state began with empty local storage; the profile key created for the smoke test was removed after validation.
- No new art assets were generated or added by Phase11. Art-prompt validation does not indicate generated art is ready.
- No commit/push/deploy.

## Previous: Phase10 Rosethorn Sanctuary and dual-currency wisp sales

Owner renamed the mode to Rosethorn Sanctuary. Stable internal ID `sanctuary`
and creature/save IDs are unchanged; Rosethorn Wisp remains the species name.

Owner selected Rosethorn Sanctuary, revised the shorter-mode proposal to match
Treasury's25 stages65-120, and requested chance-based roughly1->5 Null-Prismatica per
kill plus sales granting both currencies with less Prismatica than Treasury.
Developer tuning:50% chance of1 at65 ->80% chance of5 at120; linear chance,
rounded linear quantity, same boss/ordinary. Ordinary Prismatica remains7-14
at65 ->15-30 at120; no materials/clear bonus. Every fifth stage is a boss.

Six Tranquilitic divine/regal Rosethorn Wisp forms share hostile/captured
definitions.20% mission captures retain actual level/stage/kit, independent
RNG and existing leveling/equipment/mixed squads/snapshots/Continue/replay.
Sanctuary cannot satisfy Heaven/Abyss evolution recipes. No new save version
or load writes; optional infusionStages.sanctuary capped25. Legacyv2 stage
migration applies only to Heaven/Abyss, not currency modes.

Common->Omnic sales grant100/300/1k/3k/10k/30k Prismatica plus1/2/3/5/7/10
Null-Prismatica. Shared creatureSaleOffer/sellCurrencyCreature reread exact UUID and
locked/squad/any-Conduit protection, save both balances/removal in one write,
retain discoveries/pity/other copies. Treasury-only wrappers preserve prior
callers. Confirmation names exact copy and both currencies; cancel unchanged.
Either-balance overflow/storage failure preserves persisted copy and balances.
Owner subsequently capped sale Null-Prismatica at1-10; mission drops and Prismatica
values are unchanged. The historical browser sale below used the former20 cap.

Standard now15 outcomes:3 EBs + first3 forms from each of4 creature modes.
Creature tier weights50:30:17 within99% remain, now equally split four ways.
Cost10,1% five-star tier,200/500 pity and Treasury Omnic Lv50 duplicate reward
unchanged. Character Archive now42 entries (18 EB evolutions +24 creatures).
Currency activity cards/battle chrome/glossary/results and per-copy sales wired.

Art/creatures/Rosethorn Sanctuary.md contains six cutouts +3:1 header +16:9 arena;
Standard Omnic16:9 art prompt includes Sanctuary rosefire architecture. At the
time of this Phase10 handoff, art remained pending with neutral visuals and no
borrowed/missing assets; Phase12 later records the supplied art integration.
See [authoritative rules/edit points](rosethorn-sanctuary.md).

Verification at the time:586 tests across58 files,9 art checks and production build/typecheck
passed. Existing Vite large-chunk warning remains. Isolated browser:
real Stage1 combat saved14 Prismatica,1 Null-Prismatica,two Lv65 captures,unlocked2 and
two receipts; reload preserved it. Omnic sale canceled unchanged, then granted
30k Prismatica +20 Null-Prismatica/removing exact copy. Currency menu/mobile contained,
no isolated page errors. Requested320 layout verified15 text-only rate rows
with zero table art, Stage25/25 entry and contained battle geometry, no missing
assets. Owner storage untouched; isolated contexts closed.
No commit/push/deploy. At this historical handoff point Phase11 integrated
validation was complete and Phase12 had no approved scope; the owner later
approved the art-intake scope documented at the top of this handoff. Do not
invent another mode as a replacement for an unapproved phase.

## Previous: Phase9 Crownfall Treasury, slime sales and active Standard Banner

Owner approved Crownfall Treasury:25 stages (revised from15), hostile levels
65-120, Luminous six-form gemstone-crowned slime line, same boss/ordinary
currency100-200 at65 to1,000-2,000 at120, quadratic range growth.
Every fifth floor boss; no materials/Null-Prismatica/extra ordinary currency/clear bonus.
20% mission captures keep defeated level/stage/kit and existing independent
leveling/Conduits/mixed squads/Continue/replay/Settings/Archive behavior.
Per-mode stage count now drives25-floor validation/unlocks/completion/Continue.

Standard activated at10 Null-Prismatica. First three Treasury forms join Heaven/Abyss
and three EBs for12 real entries, unchanged1%5-star tier/creature weights/pity.
Ordinary banner creature starting level is its form's first authored stage.
Owner revised duplicate reward twice; FINAL rule is Omnic Treasury final slime
at **Lv50 flat**, not its first hostile stage or highest account level.
Validated acquisition=banner-duplicate only for infusion:treasury:5 permits
below-stage initial level and retains Stage22 kit. Mission captures unaffected.
New EBs start Common/Evo1/Lv0; everything unequipped. Draws reread account and
save cost/reward/independent200/500 pity in one atomic write, with confirmation
and text-only saved result. No draw grant on invalid input/failed write.

Character copy management sells Treasury only:1k/3k/10k/30k/100k/300k by fixed
Common->Omnic form, independent of source or level. Exact UUID/name/price and
permanent confirmation; locked/squad/any-Conduit protection reread. Currency/
removal save together; obsolete empty loadout removed, discoveries retained.
All18 creature forms in Character Archive; total36 character/form entries.
Currency-farm category, clean mission loot/glossary and pending battle/art
surfaces wired. Six cutouts +3:1 activity banner +16:9 arena prompt pack in
Art/creatures/Crownfall Treasury.md; Standard16:9 Omnic prompt adds Treasury architecture.
No images supplied/generated or missing PNG requests.

Verification:577 tests across57 files and8 art-prompt checks passed;
production build/type-check passed after final presentation refinements.
Isolated real stage1 combat saved201 Prismatica/two Lv65 captures/unlocked2,
retained across reload; simulated failed save preserved action/account then
retry worked. UI verified draw/sale cancellation,500 all-owned conversion at50,
10 currency cost/reset pity and300k exact-copy sale. Stage25 entry/completion
chrome, requested320/390/1280 layouts, no isolated page errors/missing assets.
Owner storage untouched. Existing bundle-size warning remains.

Next: Phase10 shorter Tranquilitic divine/regal flaming-wisp Null-Prismatica farm.
Confirm its name/stages/levels/payout/capture and any sale policy before coding.
No commit/push/deployment performed. See [Treasury rules/tests](crownfall-treasury.md).

## Previous: Omnic summoning artpieces and clean drop tables

Owner specified16:9 full-bleed Omnic-tier banner art embodying each banner's
identity, with no individual outcome art in the drop-rate table. Standard now
uses a reserved16:9 artwork panel and nine text-only Name / Rarity and stars /
Rate rows, ordered highest stars first. Rarity is the actual awarded form
(base Common EBs and Common/Uncommon/Rare creatures), not banner art direction
or current owned progress. No roles, stats, lore, portraits or rating medallions
in outcome rows. Compact pity progress stays visible; verbose reward/pity/tier
rules move into an accessible collapsed disclosure.

Art/ui/Summoning Banners.md includes the Omnic Standard convergence prompt and
1920x1080 export/intake contract. Typed artwork.path stays null until supplied
approved art arrives; honest neutral pending panel, no invented asset requests.
Existing dungeon/archive art formats remain unchanged. No images generated.

Validation:571 gameplay tests and7 art-prompt checks passed; production build/
type-check passed. Isolated browser verified nine exact names/rarities/stars/rates,
no media inside the table, exact16:9 panel ratio and contained layouts at
requested320/390/1280 widths. Disclosure expands, draw gate unchanged, no
isolated page errors. Owner storage untouched; no commit/push/deployment.

## Previous: revised banner rates and independent pity

Owner raised5-star base tier to1% TOTAL (equal across three EBs), leaving future
6-star at0.1% total only once authored. Current creature tiers share99%50:30:17.
Independent200 highest-star /500 unowned-highest-star counters approved.
Highest-star results reset200; new highest-star resets both.500 takes priority;
if all highest-tier EBs owned, normal highest-star duplicate conversion and reset
both counters. Equal eligible guarantee odds. Highest tier follows real pool.

Pure resolveBannerPull handles base/guaranteed selection and counter transitions.
Optional walletv3 bannerPity.standard validates/preserves counters; legacy absence
reads as0 without writes. Preview shows progress/rules and updated rates.
Draws/backend remain unavailable until Phase9 defines crowned-slime conversion.
Activation must save result/cost/pity in one transaction, never separate writes.
See [pity rules/tests](summoning-and-economy.md#independent-banner-pity) and D-070.
Validation:570 tests across56 files passed; production build/type-check passed.
Isolated browser confirmed1% five-star tier,0.333333% per EB,199/200 and499/500
saved progress, independent resets/500 priority/all-owned fallback and unchanged
wallet after gated click. Requested320/390/1280 layouts contained; isolated page
reported no errors. Owner storage unchanged; no commit/push/deployment.

## Previous: Phase8 Null-Prismatica rewards and gated Standard Banner

Heaven/Abyss kills independently roll0/1/2/3 Null-Prismatica. Owner-approved linear odds:
Lv80=90/8/1.5/0.5%, Lv120=75/10/10/5%, same ordinary/boss.
Separate lycalisSeed preserves prior combat/material/capture RNG. Premium awards
validate eligible dead source/stage/amount and commit with existing rewards,
captures, discovery/unlocks and receipts; failure/retry/dedup/overflow checked.
Loot/results/glossary use real Null-Prismatica art and discrete nonuniform probabilities;
battle wallet updates both currencies. No Adventure/material-dungeon drops.

One Standard catalog/preview publishes nine real entries: first three Heaven/
Abyss forms plus Infernis/Tizu/Flora.5-star tier was0.1% TOTAL (now1%, see above);
creature tiers now split99%50:30:17/equal per tier. No4/6-star placeholders;
future6-star EB tier gets0.1% only once authored. Ownership never changes rates.
Old unowned-only draws removed. Draws are disabled in UI and backend:
owner explicitly requires Phase9's highest-rarity crowned Prismatica slime for
an already-owned EB. No substitute/cost/grant while missing. Existing saves
preserved. Creature banner starting progression remains a decision for activation.
See [economy/source/tests](summoning-and-economy.md) and D-069.

Validation:560 tests across55 files passed; production build/type-check passed.
Isolated browser verified
Lv120 boss grants3 Null-Prismatica, persists/reloads/deduplicates, all nine preview entries,
precise EB odds/stars and unavailable draw/forced-click rejection without spending.
Responsive requested320/390/1280 viewports contained; no missing images/page errors.
Owner storage untouched. Existing bundle-size warning remains.

Next: Phase9 Prismatica mode definitions, crowned final slime and then complete
Standard activation/duplicate transactions. Ask the pending mode/balance/
banner-starting-progression choices individually; do not invent content.
No commit/push/deployment performed.

## Previous: rarity escalation in all remaining dungeon art packs

Reviewed the five packs absent from `dungeonArt`: Precipice of the Earth,
Sky-bound Rift, Lustrous River, Valley of Solitude and Ruins of Chaos.
Gameplay already works; these are the five awaiting supplied art.
Revised all40 enemy and30 material copy-ready prompts with escalating
species-specific armor/weapons, articulated structures and prismatic final
designs; removed high-tier cute language. Common remains restrained.
Same compact anime/cel renderer, names/palettes/keys/padding/no-emission and
all ten scenery prompts preserved. No runtime balance/rarity assignments changed;
supplied dungeon packs untouched. Enemy visual tiers are not evolution forms.
See [art handoff](../Art/creatures/dungeons/README.md#pending-art-rarity-escalation-pass).
All6 Python art checks passed, including the new five-pack tone/signature test.
No new images generated, runtime changes, commit/push/deployment performed.

## Previous: Phase7 protected-safe evolution creature infusion

Owner confirmed creatures supplement existing material/Prismatica costs:
Evo3->4 consumes1 form3+,4->5 consumes2 form4+,5->6 consumes3 form5+.
Use the Element-Bearer's five-element Heaven/Abyss mapping, not the creature's
combat element. Locked/current-squad/any-Conduit-equipped copies protected.
Owner also clarified only characters are Element-Bearers; captured units remain
creatures. UI/capture labels and future-agent rules corrected accordingly.

Evolution screen lists every copy with eligibility reasons, portrait, form
rating and level. Explicit selections only; exact count required; permanent
confirmation names each copy. Authoritative save rereads current ownership,
progression/protection/funds before one atomic evolution/cost/removal write.
Cancel/failure preserves saves; consumed empty loadouts removed, remaining
copies/discovery/receipts and legacy progress preserved. No load-time charges.
Character copy management refreshes immediately after consumption.
See [full spec/tests](evolution-fodder.md).

Validation:556 tests passed; production build/type-check passed. Isolated browser
verified exact-copy confirmation/cancel, protected/wrong-mode/low-form rows,
1-versus2 selection, exact saved costs/removals and reload, failed-write retry
and changed-lock rejection.320/390/1280px layouts contained, no page errors or
missing assets. Owner storage unchanged; existing bundle-size warning remains.

Historical next step was Phase8; delivered rewards/preview described above.
No commit/push/deployment performed.

## Historical terminology correction (clarified above)

Owner established **Element-Bearer / Element-Bearers / Owned Element-Bearers**
as canonical character language, replacing companion wording across opening,
Home, Squad, Summon, captures, Archives, accessibility/errors and documentation.
Legacy internal identifiers/CSS hooks/save keys remain stable; no gameplay or
save-schema change. Apply this terminology to future features and character art.

## Historical: Phase6 captures and playable creatures

Heaven/Abyss kills now automatically roll exactly20% capture chance, including
boss/burn/AOE kills. Separate capture RNG preserves existing material rolls.
Capture level/stage/skills, rewards, discovery and receipt save atomically before
combat advances. Failed writes reject visibly; repeat receipts do not duplicate.
Quitting/defeat retains previously saved captures.

Owner approved defeated level, independent levels through120, **no evolution**,
ordinary/nonboss growth times fixed `.65 + .35*tier/5` form strength, shared-Gauge
manual retained skills with enemy intervals as cooldowns, and captured later-form
stars1-6. Higher forms stay stronger at equal levels; boss kits keep ultimates
but lose hostile boss stat bonuses. Level costs/curve remain editable first-pass.

Mixed/all-captured squads, captured leaders, Home showcase, manual actions,
eight Conduits, independent levels/locks, loot/results, cut-ins, Settings,
Continue/replay and30-entry Character Archive are wired by instance ID.
Captured portraits/stars reveal by owning that fixed form, not merely discovering
the Creature. Existing enemy art is reused; no new assets or missing PNG URLs.
Metadata-free Phase5 records resolve to their form's first authored stage without
load-time writes; legacy starter IDs/progress/equipment remain unchanged.

Validation:544 regression tests and production build; existing Vite chunk-size
warning remains. Isolated browser acquired two real80-level creatures in one
Heaven clear and displayed both in saved loot; separate copy leveling/gear,
duplicate all-captured squads, mobile containment, retained attacks, Settings
and replay checked without page errors/missing assets. Owner storage unchanged.
No commit/push/deployment performed.

Next: **Phase7**, explicitly selected protected-safe evolution fodder. Confirm
counts/tiers, material supplement/replacement and equipped-copy protection first.
Phases8-10 still own banner/Null-Prismatica changes and the two new currency farms.
See [capture rules](dungeons-and-captures.md), [instances](character-instances.md)
and [active roadmap](roadmap.md#active-owner-requested-expansion-phases).

## Historical: Phase5 ownership and protection foundation

Owner approved uncapped character storage, captures unlocked by default,
manual locks plus automatic squad protection, and allowing duplicate species
in future squads when copies have distinct instance IDs (max3 members).
Explicitly approved moving playable mixed squads into Phase6 alongside retained
enemy kits, rather than inventing captured starting stats/actions in Phase5.

Added `character-instances.ts`: independent `capture:<UUID>` identities and
registered eligible Heaven/Abyss definitions, pure append/validation helpers.
Optional walletv3 `capturedCharacters` and `characterLocks` preserve existing
starter progress, squad IDs, equipment, profile and legacy saves without load
writes. Character menu shows copy management and independent lock controls.
No capture reward or playable captured kit is active; no characters granted.
See [instance spec](character-instances.md).

Verification: full regression suite passed531 tests before the added500-copy
capacity test; final focused instance suite/build rerun recorded in completion
response. Isolated browser confirmed two independently saved copies, locking
only one, lock persistence after reload, unlocked starter squad protection,
unchanged balances/level/evolution/weapon rank and320px containment.
No owner storage modified, commit/push/deployment performed.

Next Phase6 needs captured initial level/stat/progression and ability timing
decisions, then atomic20% capture rewards, instance-based mixed squads,
Conduits, Character/Archives and battle/replay/Continue integration.

### Character Archive correction

Owner requested all character evolutions as individual visible entries and
filters. Confirmed each form reveals in color only after that evolution is
reached. All18 starter forms are present; unowned/unreached artwork uses black
silhouettes with the same dark card/radial backdrop as undiscovered enemies.
Shared CSS keeps the silhouette appearance consistent. Filters combine element, rarity,
character ownership, form discovery and stars, with counts/empty state/reset.
Current forms retain equipped stats, others clearly preview level0 without
equipment. This supersedes Phase4's three current-form/base-preview cards.

## Latest completed expansion: Phase4 / Archives and enemy elements

Unified Archives is live from Home, Inventory and Character, containing
Character, Conduit and the existing discovery-gated Creature galleries, each
with a banner header. Gallery switching preserves filters and focuses the
selected heading. Old internal glossary route selects the Creature panel.
Common Conduit schematics and CSS headers remain honest placeholders.

Owner confirmed Adventure Goblin=Efflorescent, Imp=Infernic, Golem=Tectonic;
explicitly chose all Dawnthorn forms=Tranquilitic and all Wraththorn
forms=Chaotic. Elemental dungeon enemies match their dungeon. Every combatant
and creature now has combat typing. Enemy field nameplates, battle-menu intel,
revealed glossary cards and infusion entry cards show readable element names.
`Creature.dungeonElement` routes dungeon materials separately from combat
typing, preserving Heaven/Abyss's original five-element pools, Adventure-only
Prismatica and all stage/chance/quantity rules. No affinity damage modifiers.

Added [Archives spec](archives-and-elements.md),
[three banner prompts](../Art/ui/Archives.md) and
[ten medallion prompts](../Art/ui/Element%20Emblems.md).

Verification: **524 tests across51 files**, **5 Python art-prompt checks**,
production TypeScript/Vite build and editor diagnostics passed. The existing
large-bundle warning remains. Isolated browser checks verified3 character/
5 Conduit/97 creature entries, gallery selection/focus,3 Adventure-filter
results, filter retention, store navigation and new discoveries without loot
unlock. Archive geometry fits320/390/1280px; battle enemy labels and modal
labels were checked in Adventure, Flaming Depths and final Heaven/Abyss stages,
including narrow320px geometry with no horizontal overflow in label containers.
Browser screenshot capture unexpectedly resets emulation to desktop; use
computed layout geometry for responsive checks, not cropped screenshots.
No owner browser storage was seeded. No commit/push/deployment performed.

**Next: Phase5**, instance-based ownership for separate captured duplicates.
Resolve consequential protection/capacity UX before implementing. Captures,
fodder, banner replacement and currency modes remain future phases.

### Game-wide rarity tone

Owner extended the Common-to-Omnic visual direction to the whole game:
progressively less cutesy, more epic, formidable, majestic and incredible,
while preserving the same art style. Shared prompt guide now contains the
[rarity tone ladder](../Art/guides/midjourney-character-style-prompt.md#game-wide-rarity-tone-common-to-omnic);
art workflow and AGENTS carry the rule. Applies to future/revised prompts,
not a bulk repaint or gameplay change. Stars remain distinct from rarity.

### Future Conduit rarity art direction

Owner clarified the five current designs are Common only. Higher rarities
progressively unfold into restored/reborn elemental machines with increasingly
epic construction and swirling prismatic energy; Omnic is a fully completed
elemental masterpiece. Recorded in [Conduit art](../Art/conduits/Conduits.md#future-rarity-art-direction),
[spec](conduits.md#confirmed-future-rarity-presentation) and AGENTS.
No current prompts, buffs, prices or equipment mechanics changed.

## Current expansion: Phase3 complete - Conduit equipment

Owner approved one copy unlocking every character, each named Conduit once per
character, eight ordinary slots only, Master reserved. Character equipment
selectors save immediately with owned-ID/slot/uniqueness validation; no copies
or currency consumed. Shared resolveFighter applies +5% HP/Attack/DEF after
growth/legacy weapon bonuses, +2pp crit capped100%, +5 capacity.
Home/overview/equipment/upgrade previews display effective stats; changed values
show before-Conduit baselines. Battle menu lists equipped names. Full squads in
all modes clone gear at entry; Continue/nextWave/replay/Settings preserve it.
Store/inventory wording no longer claims inactive buffs. Extra purchased copies
provide no extra equipment advantage and are disclosed as such.

518 tests across50 files and production build passed before final verification.
Isolated browser equipped all five on Infernis plus the same single-owned Vigil
Core on Tizu, removed/re-equipped, reloaded and verified exact effective health,
attack, critical rate, DEF and capacity. Duplicate options disabled; owned counts/
currency unchanged. Settings/replay preserved gear/stats, selectors readable at
320/390/1280px without horizontal overflow. Fixed a browser-found event listener
placement bug before completion. Owner storage untouched.

Next: Phase4 unified Archives, explicit enemy elements and elemental medallion
prompts; ask about ambiguous enemy affinities before assigning them.

## Current expansion: Phase2 complete - Conduits

Owner renamed Artifacts to Conduits and approved the proposed prices/buffs:
Vigil Core1,000/+5%HP, Siegebound Drive1,200/+5%Attack,
Bastion Lock1,000/+5%DEF, Parallax Relay1,500/+2pp critical rate,
Fracture Reservoir1,200/+5 Gauge capacity. Common ancient-war mechanisms;
Vigil/Parallax/Reservoir are powered by Elemental Light, the source of elemental
powers. No named ancient faction/war or element restriction invented.

Store accessible from Home, Inventory and Character's Conduits / Equipment tab
(including dynamically changed tabs). Seven bottom destinations preserved.
Optional wallet.conduits map holds safe-integer owned counts; each confirmed
purchase atomically saves one copy/cost. Reject insufficient balance, invalid
IDs/saves/overflow and storage failure; no writes on read. Other account data
and legacy purchased weapon bonuses unchanged. Inventory lists quantities.
Runtime art is explicitly labeled recovered SVG schematics pending supplied
images; [six prompts](../Art/conduits/Conduits.md) cover icons and store banner.

501 tests across49 files and production build passed; known bundle warning
remains. Four Python prompt tests passed. Isolated browser bought all five plus
a duplicate, verified cancellation leaves wallet unchanged, exact6,900 total
spend, retained unrelated state, reload inventory and320/390/1280px horizontal
containment. Owner storage untouched.

**Next: Phase3**, Conduit equip/unequip and actual stat effects. Purchases do
NOT currently buff characters. Confirm duplicate stacking, slot eligibility
and Master Conduit rules before applying bonuses. [Full spec](conduits.md).

## Active expansion: Phase1

Rating polish: shared character-rating renderer now uses physical beveled stars
(copper/silver/gold/violet/white/prismatic tiers1-6) and framed rarity medallions.
Character overview adds classification beside stats; all existing rating surfaces
inherit the same badges. Reduced motion disables reflective sweeps, not static
glow; screen readers receive explicit star/rarity labels.61 focused tests/build
passed; isolated320px browser verified exact star counts, tier colors, medallions,
reduced-motion suppression and horizontal containment. No gameplay/odds changes.

Owner approved the phase-by-phase expansion in [roadmap](roadmap.md).
Weapon upgrade UI and spending removed; existing ranks/Attack bonuses/materials
preserved. Stable passive/skill tab IDs unchanged. Starter summon ratings5-star;
derived rarity Common->Omnic follows Evo1-6 across selection, Home, Character,
roster, Squad, summon/reveal and Battle menu. No new stat or summon odds changes.
Next phase: five Common artifacts and Artifact Store; confirm prices/buffs.
Only one Standard Banner planned. Its low-star enemy pool is described in
the roadmap; no captures/new modes/banner expansion implemented yet.

Phase1 verified:470 tests across47 files and TypeScript/Vite production build
passed; existing bundle-size warning remains. Isolated mobile browser evolved
Infernis Common->Uncommon while retaining5-star and weaponRank4, verified live
roster/showcase/Squad/Battle menu labels, eight character tabs with no weapon
controls and no horizontal overflow. No owner storage was seeded or modified.

**Last updated:** Moderated loot stack growth.

### Moderate loot quantities (supersedes oversized 35-floor payouts below)

Owner requested only roughly2-3x usual loot gains. All elemental and infusion
material stacks now scale from1-2 to2-4 to3-6 per successful per-enemy drop.
Prismatica scales5-10 to15-30 byLv120 across every mode. Unlock levels, rising
rarity odds, five-element infusion pools,35 floors and enemy power stay intact.
Costs and previously saved holdings are unchanged. Gameplay help, glossary,
actual reward rolls and save validation share the revised quantity definitions.
Earlier large-stack figures in this handoff are historical, not current rules.

### Large numeric displays

numeric-layout.css gives Home and Character stat grids adaptive 145px-minimum
cards instead of fixed four-column cells. Card-relative type sizing and wrapping
preserve exact displayed values; no K/M rounding or economy changes. Upgrade
comparisons, material counts/costs, balances, results and glossary ranges also
wrap inside their containers instead of overlapping neighboring content.

### Field-first combat and Settings

Battle focus styling removes the three edge disclosures and framed header
panels. One Battle menu opens a modal with accessible actions, full combatant
readouts, rules and log. Field name/level, HP and allied Gauge remain; Defense
and role metadata no longer compete with the artwork. Leave/speed/Settings
stay in a compact toolbar; the live Prismatica balance is inside Settings.
Shared settings-panel.ts/CSS serves both Sanctuary and battle with a proper
close button, presentation speed, motion and grouped selection keys.
Both speed selectors share persistence and stay synchronized.

teamCanAct/advanceUnavailableTurns use actual action eligibility, advancing
enemy phases until someone can act or combat ends. Last Flare recovery remains
a real enemy turn, not a skipped penalty; it is simply automatic now. Continue
with carried recovery and reopening an exhausted session use the same rule.
Reward commits precede presentation, and result Continue stays explicit.

### Supplied currency icons

Both root originals moved intact to Art/source/currencies. Custom offline
background, cast-shadow and localized sparkle-spill cleanup exports transparent
256x256 icons to public/assets/currencies. Source-specific processing and
targeted regeneration live in tools/prepare_currencies.py; review_art.py uses
the same helper. Provenance is recorded in Art/provenance/matte-review.json.
Shared currency-icon presentation covers every Sanctuary wallet, inventory,
level/evolution/weapon costs and the existing First Fracture reward preview.
Prismatica also appears in the battle wallet, kill-loot burst, result summary
and revealed glossary drop pools. Existing balance IDs and accessible names
remain; currency counts, saving and drop mechanics are unchanged. Null-Prismatica is
not added to enemy reward pools or the unavailable summoning system.

### Art-prompt style consistency

Audited259 Midjourney prompt blocks across the Art library against the original
character renderer. Currency prompts already match. Filled missing jewel-like
palette anchors in older examples/materials/scenery, restored explicit compact
proportions in the original example characters and evolved Heaven/Abyss slimes,
and replaced standalone weapon splotchy ink rendering with clean contours,
cel shading and painted highlights. Weapon anatomy, motifs, colors and3:2
framing remain. Mode scenery retains severe atmosphere, restricted palettes
and lighting; removed cinematic renderer wording. Abyss hourglass glass now
uses opaque painted facets, not background-visible transparency.
Names, species, equipment, evolution features, ratios and existing supplied
artwork are preserved. Same approved style reference400 for cutouts/200 for
scenery; actual URL is still unavailable. Shared style lock is documented in
Art/guides/midjourney-character-style-prompt.md; regression checks in
tools/test_art_prompts.py cover every prompt plus currency/mode identity locks.

### Replacement Heart of the Shattered Void

New root image moved to Art/source/materials; former RGB and owner-alpha copies
archived under Art/source/replaced/heart-shattered-void-2026-10-05.
Canonical abyss-heart-shattered-void icon replaced without changing material IDs.
Offline mint/teal key removes background, openings and ground shadow; three
reviewed masks preserve cyan crystal facets. Targeted prepare_infusions.py
--assets export and review_art.py use the same helper. Original96-image intake
records retain the superseded copy's byte hashes; all other cutouts unchanged.
All28 Python art tests pass, including exact foreground/background samples,
padding/dimensions and reproducible exports.

### Infusion element restriction and cut-in timing

Owner corrected infusion bonus eligibility: Heaven only drops Infernic, Aquatic,
Tectonic, Efflorescent and Atmospheric Epic+ materials; Abyss only drops Voltaic,
Luminous, Ominous, Tranquilitic and Chaotic Epic+ materials. Shared
infusionElements(mode) drives both actual rolls and glossary eligibility.
Successful rarity rolls choose one of five equally; final per-element odds
are17%/13%/8%. Rarity success odds, stack sizes, unlock levels, specialty
materials and existing inventory remain unchanged. Earlier all-element claims
below are superseded.
All portrait cut-ins now3500ms at1x, with stationary12%-90% reading hold and
final10% fade in place instead of slide/scale exit. Speed1/2/3x still applies;
ornate ultimate framing remains.

### 35-floor dungeons and loot scaling

All ten elemental dungeons and both infusion modes have35 floors. Adventure
remains endless. Linear enemy levels reach the sameLv120 final stat/ability
endpoints at35; material unlock enemy levels, upgrade costs and affinities remain.
Shared content/loot-random.ts curves drive actual rewards and Creature Glossary.
Elemental final per-enemy stacks: Seed80-160 guaranteed, Bloom40-80 at98%,
Shard20-40 at90%, Crest12-24 at80%, Heart6-12 at60%, Soul3-6 at35%.
Infusion final specialty stacks80-160/40-80/24-48; supplemental rarity odds
85%/65%/40%, stacks12-24/6-12/3-6, one random mode-associated element per successful rarity.
Currency scales5-10 atLv1 to100-200 atLv120 across every mode. Rare types remain
chance-based, not guaranteed all-pool drops.
Walletv3 migrates v2 stage unlocks approximately by enemy-level progress,
retaining balances, materials, character progress, receipts and discoveries.
Load does not write; savingv3 never remaps again. Quit/replay/reload reset Gauge;
Continue retains it. See gameplay-and-elements.md for exact curves and gates.
Older handoff entries below are historical; their50/25-floor and flat-loot
descriptions are superseded by this section.

Validation: all411 tests across42 files and production build/typecheck pass.
Isolated browser verified all12 selectors end at35, actual Stage35 Voltaic
saved rewards (100 Prismatica plus80/40/20/12/6/3 material minima with forced
successful rolls), final completion, glossary odds/ranges, v2 read-only migration,
v3 persistence and reload. No page errors; owner's save untouched.

### Shatter Gauge within-run carry

Owner chose carry through turns/waves/next stages in the current run only.
Turns and Adventure waves already preserved Gauge. New game/battle.ts nextStage
now carries the same character's Gauge into elemental/infusion stage continuation
(bounded by capacity), retaining full-health/fresh-cooldown encounter behavior.
BattleView Continue routes through this helper; results/announcements explain carry.
Quit, mode switch, retry/replay and reload still reset Gauge; no save schema change.
114 focused tests and build pass. Isolated browser Continue retained65.5 Gauge
and full HP at Stage2 in both Galvanic Field and Abyss.

### Galvanic Field

Archived all16 original root PNGs; exported eight enemies and six Voltaic icons,
and copied the opaque banner/arena unchanged. Pack now drives all50 stages,
Gameplay banner, combat/cut-ins, loot, Inventory and Creature Glossary.
Individual reviewed green/teal keys clear backgrounds/internal openings.
Bloom/Seed/Soul wider cleanup removes spill; source-coordinate masks protect
Seed painted green metal highlights and Soul crystal facets.
Re-export: `python tools\prepare_dungeons.py --elements voltaic`.
Review tooling shares the same processing; authoritative owner-alpha bypass
and previous City settings remain unchanged.

Each enemy has a distinct named strike in dungeon-art.ts. Shared level50
Overdrive/heavy boss Last Ruin rules and stage/drop balance remain unchanged.
City integration tests were generalized to supplied-dungeon-integration.test.ts
and now cover both packs, all50 stages, final ultimates and glossary drop gates.
Facing metadata reflects reviewed gaze/weapon direction; only presentation flips.

Validation:107 targeted TypeScript tests,27 Python art tests and production
build pass (existing chunk warning). Browser decoded all16 assets and rendered
all eight enemy tiers with the correct arena and skill labels. Isolated live UI
cleared Stage1, displayed exact saved Voltaic Seed/Prismatica rewards, recorded
Sparkpip defeat, unlocked/continued to Stage2 and retained identical account
data after quitting/reload. Inventory's six icons and Glossary's eight portraits
decode and fit at actual320/390/1280px with no horizontal overflow.
Owner saves were not modified; hidden-tab harness finished finite animations.

### City of Heaven

Moved all16 root PNGs into Art/source, preserving original bytes. Eight enemies
and six Tranquilitic materials now use canonical runtime filenames; banner/arena
are byte-identical landscape copies. Registered pack drives Gameplay, all50
stages, cut-ins, loot bursts, Inventory and Creature Glossary without save changes.
Every enemy has a unique named strike; shared level50 second-skill/boss-ultimate
rules, stage growth, boss cadence and existing per-enemy drop chances remain.

Reviewed pink color keys remove outer/interior backgrounds. Crest uses an
orange border-connected key to protect gold; Shard narrow hue preserves ribbons;
Seed wider hue clears pale pink glow spill. Alpha-supplied assets remain exempt.
Re-export: `python tools\prepare_dungeons.py --elements tranquilitic`.
Tests cover all50 encounters, skill names/counts, real Sovereign ultimate,
glossary drop gates/material icons, sprite margins and original landscapes.
Validation:98 targeted TypeScript tests and production build pass (existing
chunk warning);26 Python art tests cover original owner-alpha and City keying.
Review tooling regenerates City sprites with the same exporter helper.
Browser decoded all16 assets and rendered every enemy tier without missing
images/errors. Isolated live UI cleared Stage1, displayed Victory and exact saved
Seed/Prismatica stacks, unlocked/continued to Stage2, recorded Hushbud defeat and
retained identical account data after quitting/reload. Hidden-tab test harness
finished finite animations only; owner saves were not modified.
Inventory displays all six material images and Glossary all eight portraits;
both decode and fit at actual320/390/1280px without horizontal overflow.

### Readable menu artwork

Character rail art grew24->52px (20->48px small phones); detail ability art34->
80px (72px small phones); character upgrade materials32->64px, inventory48->
64px, glossary loot28->56px. Menu/navigation SVGs now32-34px, bottom navigation
30px on mobile. Desktop character rail220px; minimum68px buttons and two-column
groups on small phones preserve labels instead of squeezing larger icons.
Stat grids auto-fit110px cells so the wider rail does not split large numbers.
Character portrait, gameplay mechanics and battle icon sizes unchanged.

Validation:31 menu/icon tests and build pass (existing chunk warning). Browser
checked all nine character tabs, Home and Inventory at actual320/390/780/1280/
1600px: no horizontal overflow, rail art48/52px and detail art72/80px measured.

### Readable elemental cut-ins

Owner chose longer base timing while retaining1x/2x/3x scaling. Skills now last
4000-4400ms and ultimates5600-6000ms at1x, based on existing visual power. Entry12%,
stationary reading hold78%, exit10%; removed copy drift/zoom during the hold.
At3x, even base skills hold1040ms; max-power ultimates hold1560ms.

Ribbon now has unit-element gradients, diagonal energy bands, engraved rings,
diamond crests and bright edge rails. Ability name is large serif centerpiece;
caster and action tier are subordinate, with explicit Enemy Skill/Boss Ultimate.
Ultimate framing is richer; enemy layout remains mirrored. Adjusted portrait
framing to retain recognizable faces rather than magnifying only the torso.
Removed battle-ui.css's plain rectangular copy backing/neutral ribbon override.
No battle math, reward, speed-storage or reduced-motion changes; impact still
waits until reveal ends. Runtime VFX are not subject to cutout prompt no-glow rules.

Validation:39 focused tests pass; production build passes with existing chunk
warning. Browser checked150 character/boss/ability layouts over actual320/390/
780/1280/1600px with no copy clipping/overflow. Live ultimate at1/2/3x measured
6000ms base duration, playback rates1/2/3, holds4680/2340/1560ms; no damage numbers
before reveal, Victory after completion, zero leftover effects. Isolated contexts.

### No-glow cutout generation

Owner confirmed cutout art only; arenas and banners retain their scenery effects.
All 230 character/enemy/item/icon/weapon prompts explicitly prohibit glows and
glowing visual effects. Positive emissive wording was replaced, not just masked
by a negative list. Powers now use opaque solid-color lines/ribbons/rings/shapes
with crisp edges; luminous eyes/cores/blades and translucent fins/wings/effects
use painted color instead. Normal cel shading and painted highlights remain
non-emissive. Bigger effects and ornamentation still communicate higher power.

Names (including Luminous element/materials), colors, weapons, evolution motifs,
background swatches and generation flags remain. One exclusion list includes
glow/glowing effects/light bloom/soft aura/haze/light spill. "Bloom" flower names
and open halo geometry remain; never ban flowers or all rings indiscriminately.
The shared contract and pack prose supersede earlier permission for subject glow.
Existing PNGs, export tooling and in-game combat VFX are unchanged.
Audit passed: all 230 cutouts contain the explicit no-glow/solid-effect rule,
with no remaining positive glow/luminous/radiant/translucent/mist/neon wording.
Names, swatches and generation flags are preserved; all27 scenery prompt blocks
remain byte-identical. Whitespace checks pass; no code/build change required.

### Sanctuary-matched battle UI

The shared `presentation/battle-ui.css` now gives all battle scenes the main
menu's serif hierarchy, framed charcoal surfaces, white controls and restrained
unit-element accents. Toolbar has a Last Light diamond/wordmark and grouped
controls; encounter headings label Adventure/dungeon/infusion alongside progress
and a high-contrast turn button. Names/readouts are joined compact cards, with
320px maximum width instead of unbacked full-unit-width HP bars. Damage numbers,
turn cues, ability controls, results and cut-in copy follow the same typography.

BattleView markup and main toolbar are shared by all 13 battle types. No math,
rewards, animation timing, art sizes/facing, gestures or save behavior changes.
No bottom action bar. Strong field selectors intentionally override the older
transparent-readout rules; continue edits in the scoped battle stylesheet.

Validation: 46 focused presentation tests pass, including new shared-chrome
checks for Adventure, ten dungeons, Heaven/Abyss, victory and defeat. Build passes
with the existing nonfatal chunk warning. Browser checked all 13 modes at actual
320/390/780/1280/1600px: no horizontal overflow/off-screen cards; End turn remains
at least44px. Settings and expanded Combat/rules/log/results fit mobile.
Browser uses isolated contexts; owner save untouched.

### Owner-transparent art intake

Matched all 96 root timestamp PNGs uniquely to existing assets and visually
checked all matches. Renamed them to canonical in-game filenames under
`Art/source/cutouts/{characters,enemies,materials,abilities}`; archived PNG bytes
are unchanged. Replaced the matching runtime exports, keeping existing asset IDs,
URLs, portrait helpers and facing metadata. [Intake manifest](../Art/provenance/cutout-intake.json)
records names, sources and SHA-256; [review manifest](../Art/provenance/matte-review.json)
now identifies owner-supplied alpha sources.

All four exporters and cleaned review previews prefer these sources and do
only alpha-bounds trim, uniform sizing and transparent padding. **Do not run any
background removal or historical pocket/foreground masks on supplied cutouts.**
No screen uses runtime background removal; intentional silhouettes, shadows
and facing effects remain. Historical originals are preserved, but the earlier
complex-character cleanup below is superseded for replaced art.

Base Flora, base Tizu and the archived Infernis Heavy Attack icon were not supplied
and remain unchanged. No timestamp PNGs from this batch remain in the root.
See [current art policy](art-workflow.md#owner-supplied-transparent-replacements-current-policy).

Validation: 19 Python art tests pass, including all 96 archived source hashes,
pixel-exact runtime normalization and regeneration with matte removal disabled.
All four exporter commands also regenerated the 96 replacements with the matte
remover disabled, retaining identical runtime hashes. 47 focused TypeScript art/
icon/facing tests and the production build pass (existing chunk-size warning).
Browser decoded all 96 assets: 16 characters, 41 enemies, 24 materials, 15 icons.
Isolated Home/Character/Inventory/Glossary/battle/cut-in checks loaded the shared
art, retained Evo6 where appropriate, and reported no artwork masks/blending or
runtime errors. Tests used isolated browser saves, not the owner's save.

### Prompt background contract

All 230 character/enemy/material/icon/standalone-weapon prompts now start with
the actual subject instead of the lengthy background-first specification.
Removed "choose subject colors that visibly clash" and the requirement to
reserve a hue by changing foreground highlights/prismatic accents. Identity,
weapons, palette, evolution features and style remain primary and unchanged.
Each prompt ends with one short plain solid-color, flat unlit backdrop clause;
magic now uses non-glowing solid-color shapes as required above. Background-scoped exclusions
are concise rather than repeated. Existing swatches remain; all nine Abyss
cutouts use green #00FF00, without describing it as neon lighting.
Generic templates use `[BACKGROUND COLOR]` / `[BACKGROUND HEX]`.
Every prompt pack links to
[the shared contract](../Art/guides/cutout-background-contract.md).
Owner confirmed cutouts only:27 scenery prompt blocks remain byte-identical.
Generation flags and one exclusion list per prompt remain preserved.
If a generated subject is correct but the backdrop has a gradient, edit only
the backdrop with a reviewed mask and flat fill rather than compromising the
subject. Prompt wording cannot guarantee generator compliance.
Prompt audit passed: 230 subject-first cutouts, nine unchanged Abyss green
swatches, 27 byte-identical scenery prompts, preserved subject descriptions/
exclusions and generation flags, one background clause and one exclusion list.
Originals/runtime PNGs are untouched. Existing white-matte exporters do NOT
support these new keys automatically; implement explicit per-asset chroma
processing or a reviewed alpha mask when new art arrives. Do not blindly erase
white highlights or assume a generator guarantees exact flat hex pixels.

### Complex artwork follow-up

The supplied Infernis Evo6 screenshot exposed erased pale feather tips and
opaque enclosed halo/hair/ground-ring patches. Corrected source-normalized
foreground protection and interior seed points, without changing global matte
thresholds. Also checked high-complexity character originals and corrected
Tizu Evo5's lost wing highlight/halo hole and Flora Evo6's halo-adjacent gaps
and eroded lower pale feather. Regenerated only these three runtime PNGs;
originals remain untouched. Art/provenance/matte-review.json now records protection
polygons alongside seeds/hashes. Do not treat prior small contact-sheet review
as proof every complex edge is perfect; compare source and dark cutout at
original resolution. See [workflow](art-workflow.md#complex-character-follow-up).

Validation:18 Python art tests pass, including precise source-resolution
transparent-hole/preserved-RGB assertions and all sprite sizing/padding
contracts. Browser decoded all three updated960px exports through their normal
portrait helper and localhost URLs.

### Battle speed

The toolbar now includes a native 1x/2x/3x Speed selector available during
presentation. `presentation/battle-speed.ts` validates/persists the separate raw
`last-light.battle-speed` key; absent defaults1x, invalid/read/write failures are
visible and failed writes preserve the previous rate. Root metadata/CSS and a
live event update tracked BattleView animation playback rates. Disposal removes
the listener. Entrances, portraits, attack motion/effects, numbers, death/loot,
turn cues, HP transitions and result reveals scale together. Idle/readiness and
menu/loading transitions do not. Reduced motion still disables movement.
No engine/reward/RNG/cooldown changes; completion gates still await presentation.
See [speed contract](free-battle.md#battle-animation-speed).

Validation:40 focused speed/presentation tests and production build pass.
Browser checks at actual320/390/780/1280/1600px show a44px speed target and no
overflow. Choice persists across Settings/reload. At1/2/3x, a900ms animation has
900/450/300ms effective duration; ultimate CSS particles810/405/270ms and
stagger72/36/24ms. Identically seeded ultimates yield identical HP/enemyHP/RNG
state, show portrait/attack/number/loot phases and leave zero temporary nodes.
Reduced motion still omits portraits/impacts; a simulated storage-write failure
keeps the previous3x selection/rate and displays an explicit error.

### Neutral battle UI polish

Battle-specific final styling lives in `presentation/battle-ui.css`, imported
after cinematic/cut-in styles. Quit and Settings now have compact icon/label
controls instead of plain underlined text. The currency pill, turn button,
Combat/rules/log disclosures, action availability, result actions, gesture
labels and portrait copy use crisp neutral typography and consistent charcoal
surfaces. Settings uses rounded preference cards, readable native selects,
full-width save buttons and explicit focus/saved feedback, not legacy blue/gold.
Small-screen toolbar wraps without restoring a bottom bar. Unit readouts stay
floating and art scale/formations remain unchanged.

BattleView exposes `aria-busy` for entrance/presentation, alongside its existing
input gating. No combat math, loot, storage, retired hotkeys or reduced-motion
behavior changes. Continue editing this scoped stylesheet rather than adding
more overrides to the legacy global theme.

Validation: 28 targeted presentation/selection-key tests and production build
pass. Isolated browser checks at actual 320/390/780/1280/1600 CSS pixels found
no horizontal overflow in open Combat/rules/log panels, Settings or Victory.
Toolbar/disclosure/Settings controls are at least 44px. Saved selection keys
and closing Settings preserve the field's HP/gauges. A live Evo6 ultimate
disables battle controls, displays readable cut-in labels and then a Victory
sheet; finite effects clean up with zero runtime errors. Owner save untouched.

### Rechecked combat artwork orientation

Reviewed all18 character forms and41 enemy images individually using dark
contact sheets and full-size checks for ambiguous poses. Corrected17 authored
directions in unit-facing.ts: directional spear/bow poses, Kappa/Regent/
Satyr/Cyclops/Gargoyle/Mantis, Heaven spear/sword poses and later Abyss blades.
Allies face left, enemies right; neutral frontal art stays unchanged rather
than inventing side-facing artwork. Field/cut-in images share metadata; image-only
scale survives wrapper attacks, entrance, idle and portrait motion.
Source/export PNGs untouched. Reviewed overrides documented in art-workflow.md.

### Portrait skill cut-ins and boss ultimates

Characters pop in their current-form portrait/name/ability before skills, including
heals/shields; high-level enemies(Lv50+) get mirrored cut-ins. Ultimates use taller
ornate sigils/portraits and longer reveal. No dismissal/pointer interception, no
extra damage or reward randomness. Reduced motion bypasses; tracked WAAPI plus
finally/disposal cleanup. Customize battle-cutin.ts/.css.

Every real enemy has1 skill below50 and2 from50. Shared enemy-skills.ts:
primary every3 ordinary/2 boss; ordinary second Overdrive every5 at1.25x primary;
boss second Last Ruin ultimate every6 atmax(2.6,primary*1.65). Secondary/ultimate
has priority on schedule collisions, never executes an extra attack. Adventure
now has authored primaries too; early dungeon enemies no longer lack skills.
Typed enemySkills replaces singular enemyAbility. Attack events carry actual
skill action/abilityName and enhancedAttack; rendering/ultimate effects consume
metadata instead of parsing names. Collapsed rules show live enemy schedules.
All three starters still pass3-seed solo final dungeon/Heaven/Abyss boss clears.
Validation:331 game tests, production build, editor diagnostics and whitespace
checks pass. Isolated browser verified all three starter skill/support/ultimate
cut-ins use Evo6 art and actual names, both mode bosses show ultimate cut-ins,
no temporary nodes remain after playback/disposal, no runtime errors.
Long boss names fit320/390/780/1280/1600px without overflow. Reduced-motion
boss ultimate resolves real damage/next turn with zero portrait cut-ins.

### Victory/Defeat results and nonblocking turn cues

Owner clarified Victory is only for cleared encounters, not ordinary turns.
Raised nonmodal sheet shows actual per-kill currency/material totals, Continue/
Quit; final Stage25/50 returns Gameplay, defeat Retry/Restart/Quit.
Display follows final loot presentation; focus heading, View battlefield to
dismiss, header View victory/results to reopen. Occupies separate layout space
instead of covering field readouts. Plain drop-text feed and old report removed.
BattleSession.stageEvents tracks every activity (including Adventure), resets on
next encounter, independent of truncated log; summaries group materialID and
deduplicate reward source. No storage writes/loot rerolls/extra awards.
Settings preserves transient dismissal and summary. Reload ends run as before.
Brief Enemy/Your turn indicators use tracked WAAPI with static reduced motion,
ignore pointers and remove on disposal. Quit callback uses existing navigation/
loading; restart and continue retain gameplay/save contracts.
Customize presentation/battle-results.ts and battle-results.css.
Validation:323 tests and production build passed. Isolated real UI cleared
Adventure, verified no Victory on ordinary turns and captured Enemy/Your turn
cues; reward totals matched wallet and Continue granted nothing extra.
Dungeon Stage1 showed exact Prismatica/Seed totals, unlocked Stage2, retained
summary through Settings and Quit returned Gameplay without modifying rewards.
Result layout never overlaps arena and has no horizontal overflow at320/390/
780/1280/1600px. Final-mode/defeat fixtures verified return/retry options.

### Progression-scaled attack cinematics and minimalist battle UI

Attack flair now derives from actual combatant level/form, independently of combat.
Final Normal:20 sparks/4 rings/6 rays; Last Flare32/5/12 at2.25x effect size.
Starter elements and Heaven/Abyss have distinct layers/trails; skills and scheduled
enemy abilities intensify. Bounded work, two-axis lunges, reduced motion bypass,
tracked WAAPI cleanup and temporary effect-node removal; rewards still commit first.
Tune presentation/battle-effects.ts and battle-cinematic.css.

Bottom action bar removed. Character drag/right-click primary; collapsed Combat
menu supports touch/keyboard Defense and all actions. Small header End turn/
continue, collapsed rules/replay/log. No attack/Defense/ability or global Space
shortcut. Selection-only settings preserve legacy custom C/T equivalents, ignore
retired action fields without rewriting. Space cannot be assigned.
Mirrored staggered triangular formations on desktop, edge-staggered stacks mobile;
boss/solo scale preserved. Historical bar/hotkey notes below are superseded.
Validation:319 game tests and production build passed. Isolated live UI checks
confirmed former attack keys/Space do not advance a turn, touch Defense and drag
still act, no action bar/kbd badges, no horizontal overflow at320-1600px.
Animated fixtures verified all starter/Heaven/Abyss effects and zero leftover
effects/trails/numbers/loot; reduced motion creates no attack effects.

### Endgame curves and Creature Glossary

Owner approved ~100k characterHP,200k ordinary enemyHP and400k bossHP.
CoreG=(1+.03*level)^3*1.45^(evo-1); HP/Attack/Elemental useG, DefenseG^0.7.
Percentage/coefficients useP=1+.003*level+.05*(evo-1), with bounds; flat
shield/heal usesG. Saved progress resolves immediately, no migration/cost changes.
All enemy activities accelerate from twice former initial growth toward shared
Lv120 endpoints; max Attack4k ordinary/6k boss, Defense1500/2250. Three starters
tested against final elemental/Heaven/Abyss bosses across three seeds without gear.
Adventure levels plateau120 while waves continue.

Home Creature Glossary catalogs every form with unseen black silhouettes,
seen color/name, defeated per-stage loot disclosure and activity filter.
Missing enemy art uses explicit neutral placeholders. Walletv2 creatures records
seen on entry and defeated atomically with kill rewards. Old saves default empty;
prior encounters are not inferred or invented. Stages/gates/chances unchanged.
Infusion odds display per-element chance plus overall rarity draw explanation.
Customize content/creatures.ts, stat-growth.ts and progression.ts.
Validation:316 game tests, production build and editor diagnostics pass.
Isolated browser checks confirmed all97 fresh entries silhouette/lock, entry-only
discoveries, real UI kill unlock, reload persistence, filter/stage selection,
and opened long infusion pools without overflow at320/390/780/1280/1600px.
No owner saves changed. Historical additive/linear growth notes below are
superseded by D-052; retain historical caps/costs/migration decisions.

### Per-image cutout audit

Reviewed all99 cutouts (18character/41enemy/24material/16ability) on dark sheets
and inspected suspected pockets against sources.32 targeted exports clear leg,
bow, thorn, ribbon and effect-loop background without globally erasing whites.
tools/matte_regions.py owns normalized pocket seeds, shared by all export paths.
Infernis Evo6 preserves pale wings with235 interior threshold; Infernic Bloom
uses215/50 warm matte; Efflorescent Soul uses170/100 plus foreground protection
for its tinted backdrop. All99 source hashes unchanged; other67 exports unchanged.
Art/provenance/matte-review.json records the completed audit and hashes. review_art.py can
generate sheets, numbered candidates and isolated cleaned previews. Candidate
whiteness is never an automatic background classification.

### Uncluttered Home centerpiece

Home removes the entire upgrade dock/caption and decorative ring, retaining
character identity, all seven stats, team/lore/activity links. Team entry now opens
Squad rather than an upgrade. No Home data-character-tab controls remain; upgrades
live in Character. The original wider central column allowed720px desktop art and
620px tablet; the later Home portrait sizing follow-up at the top supersedes these
limits. Verified1600/1280/780/390/320px with no horizontal overflow, no ring/
upgrade controls and all seven stats retained.

### Cinematic Character Upgrades

character-screen.css now uses navigation / large central character / detail
panel instead of thumbnail/sidebar plus oversized data panel. Elemental aura,
halo/stage light, current evolution title, name/role/progress emphasize identity.
Desktop up to600px artwork is viewport-height bounded; details independently
scroll. Tablet/mobile reflow with portrait first; all nine selectors and atomic
upgrades/celebrations remain, preserving the portrait DOM.
The former compact100px mobile identity layout (D-044) is intentionally superseded
on this screen by the owner's cinematic direction.
Validation:45 targeted hub/celebration/form/infusion tests and production build
passed. Isolated browser checks covered all3 characters across5tabs at actual
1600/1280/780/390/320px: no horizontal overflow, stable portrait DOM, >=44px
navigation targets and updated Evo6 title after a form change.

### Larger art, protected wings and enemy-death loot

Supersedes previous sizing below: Home500px desktop/400px mobile, battlefield
Evo6/form6 scale2.7x and final bosses3.1x. Lane maximum580px, short desktop
base155px. Actual rendering at1280x750: final boss480.5px, Evo6 ally418.5px;
small mobile remains lane-bounded with no horizontal overflow.
Infernis Evo6 source-aligned pale wing masks prevent connected white feathers
from being removed; original unchanged, runtime regenerated and reviewed.

battle-loot.ts renders only actual reward events. Enemies fade280ms, disappear,
then show quantity/icon/rarity beams at their feet and auto-collect independently
over850-1849ms per stack, with75-135% sizes and randomized scatter.
Approved plentiful balance: guaranteed Seeds/specialties roll base..2*base;
successful higher-rarity stacks roll1-2. Existing rarity gates/odds and Prismatica
are unchanged. Quantity draws use reward RNG after eligibility/element draws;
cosmetic randomness never changes saved rewards.
Reduced motion uses a static650ms receipt. Rewards still save at kill resolution
before visuals; no new wave reward, collection transaction or click requirement.
Disposal/animation cancellation cleans transient loot. Isolated browser checks
confirmed exact specialty/bonus drops, hidden corpses, cleanup and responsive sizing.
Validation:301 Vitest tests across31 files,12 Python art tests, production
build/typecheck, editor diagnostics and whitespace checks passed. Browser checks
used isolated contexts and did not modify the owner's wallet.

### Battlefield visual progression

Battle art now scales1x->1.9x by character evolution/enemy form, with0.25x
extra for bosses (final2.15x). Enemy formations use actual unit count; a boss
no longer sits in one of three small columns. Shared battle-scale helper reuses
validated encounter tier metadata. PNGs and combat stats are unchanged.
At1600px final Abyss boss artwork measures398px and Evo6 character352px;
mobile sizes are lane-bounded. Verified isolated rendering at1600/780/390/320px
without horizontal overflow;69 targeted tests and build passed.

## Playable Heaven/Abyss (D-050)

- All22 supplied originals preserved byte-identically; runtime enemies/items
  processed by tools/prepare_infusions.py, landscapes copied unchanged.
- content/infusions.ts owns six forms,25 stages80->120, bosses every5,
  stats/strikes, specialty definitions and deterministic loot.
- Stage selectors/entry/arena/next/replay/final-clear/report all use the existing
  battle, activity curtain and entrance machinery. Old elemental/Adventure paths
  remain; no captured creatures or automatically evolved enemies.
- Walletv2 accepts six specialty IDs, optional infusionStages (old saves default
  empty), optional character weaponRank (default0); atomic transactions preserve
  rank and guard stale upgrades. Stage25 is the cap.
- Weapon ranks1-10 cost100R Prismatica/5R matching weapon items, +2% grown Attack
  per rank. Evo4->5 adds5 evolution items;5->6 adds10. All Evo5/6 levels add1
  specialty leveling item, including preserved levels below80.
- Specialty yield1+floor((stage-1)/8), weapon/evolution/level from1/9/13.
  Epic15%/Legendary6%/Omnic2% from1/13/22, independent any-element rolls.
  All current starters are Heaven-affiliated; Abyss spending mapping covers future
  Voltaic/Luminous/Ominous/Tranquilitic/Chaotic characters, not newly granted units.
- Historical D-048 disabled/proposed notes below are superseded by D-050.
- Validation:282 Vitest tests passed across29 files;10 Python art tests passed.
  Build/typecheck, editor diagnostics and whitespace checks passed. Original22
  PNG hashes verified at intake; enemy/material contact sheets reviewed.
  Chalice uses an explicit warm-ivory matte tolerance while preserving enclosed
  white art and supplied decorative framing; other exports retain default tolerance.
  Localhost responds at http://127.0.0.1:5173/LastLightGame/; all22 new mode
  runtime assets return HTTP200.
  Browser title loaded, but intermittent page-handle failures blocked isolated
  live gameplay verification; no end-to-end browser playthrough is claimed.

### Slime identity clarification

Heaven/Abyss art tables, headings and all evolved enemy prompts retain the
permanent name after the form title: "<title>, Dawnthorn Slime" or
"<title>, Wraththorn Slime". These are stronger forms of the same named slime
across stage/level progression, not separately named enemies. Suggested asset
IDs, six-form counts, material/environment prompts and runtime gates unchanged.

Latest naming clarification supersedes the earlier rank ladder: prefixes are
poetic form titles, not Knight/Templar/Ascendant/Seraph/Sovereign enemy classes.
Abyss: Starless Murmur, Ruin's Awakening, Hunger Beyond the Veil, Worldfall
Reverie, The Night Without End. Heaven: Scarlet Benediction, Gilded Reproach,
Thorns of the First Light, Crimson Reckoning, The Dawn Without Mercy.
Each retains ", Wraththorn Slime" or ", Dawnthorn Slime". Proposed enemy asset
IDs now match these titles and the supplied runtime assets.

## Minimal allied battle readouts (D-049)

- unitReadout now shows allies only HP/Defense/Shatter Gauge throughout combat;
  enemies stay HP/Defense only. Names/roles remain separate from stat readouts.
- Removed attack/crit/elemental/shield/status labels; full menu stats, action
  availability, Defense/ultimate visual cues, floating effects and log retained.
- Impact HP updates no longer append a Shield suffix. Presentation shield ledger
  removed because no shield readout is rendered; authoritative shields unchanged.
  Damage event shieldRemaining metadata retained for compatibility.

## Heaven/Abyss mode art packs (D-048)

- Art/gamemodes contains a shared index plus Soar to Heaven and Delve into the
  Abyss packs. Each has six total forms (slime base + five evolutions), three
  specialty material prompts, one3:1 banner and one16:9 arena:22 prompts total.
- Preserve chibi/eyes-only style but escalate intricate thorn regalia, weaponry,
  halos/wings and threatening stance. Heaven white/black/red/gold; Abyss
  black/white/purple/hot pink. New slime lines supersede older wisp concepts.
- Specialty material purposes: weapon, evolution, late-form leveling, retaining
  existing five-element affinity splits. Owner explicitly selected leveling
  materials throughout Evolution5/6 rather than only characterLv81+.
  Both modes can additionally drop any-element Epic/Legendary/Omnic materials.
- Stage allocation/drop unlocks are marked proposals. No rates, quantities,
  recipes, maximum enemy level or weapon stats approved. Runtime modes remain
  disabled with historical wisp/four-tier metadata; no live costs/save IDs changed.
  Creature consumption remains deferred. Art naming is not player fodder evolution.
- Heaven art-pack display title uses owner's "Soar to Heaven"; existing disabled
  runtime label "Soar into the Heavens" and stable heavens ID remain unchanged.

## Home and shared idle portrait pulse (D-047)

- Home no longer displays passive summaries or Passive/Ability1/Ability2/Last
  Flare shortcuts. Five identity/growth/equipment shortcuts remain, repositioned
  around the showcase. All seven stats, roles, lore and activity links remain.
- Shared portrait markup wraps all menu art in character-idle (5s, 1->1.025->1).
  Selection/Home/team/Character/Squad and next-form silhouettes pulse, while
  nearby labels stay stationary. Team50px and Squad220px sizing is preserved.
- Upgrade celebration CSS now targets the nested image; idle wrapper movement,
  image facing scale and celebration transform remain separate. Existing
  battlefield idle behavior is retained. Device/game reduced motion disables
  every pulse; silhouettes remain black and bounded.
- Earlier Home passive/icon notes are superseded. Live browser verification was
  attempted but blocked by the recurring page-handle connection issue.
- Validation: 49 targeted hub/icon/character-art/facing/celebration tests passed,
  build/typecheck passed, editor diagnostics and whitespace checks clean. Tests
  verify no Home ability images/shortcuts, five retained shortcuts, preserved
  Character ability mappings and shared idle markup for all eighteen forms.

## Activity loading and fight entrances (D-046)

- activity-transition.ts mounts a black overlay outside #app, with bottom-right
  Loading!/preparation progress. Cover/render/decode/reveal, input inert, explicit
  artwork errors/12s timeout, cleanup and heading focus. Concurrent triggers share
  the active promise. Device/game reduced motion skips fades and uses static text.
- Main navigation, dungeon entry and cross-page Character shortcuts use it.
  Character tabs and Gameplay category filters remain instant; unavailable
  activities remain unchanged.
- BattleSession.entrancePending is transient. Newly created sessions, next waves/
  stages and replays wait for the curtain, slide full enemy units from the left
  and allied units from the right, then unlock controls. Positions start beyond
  viewport bounds, duration650ms plus70ms per unit. Existing facing/idle/impact
  wrappers stay independent. No turn, damage, reward or save mechanics changed.
- Busy/pending guards cover hotkeys, buttons and gestures; completed entrances
  do not replay on settings reconstruction. Destroy cancels tracked animation;
  animation errors report explicitly and retain encounter state.
- Browser verification attempted in isolated context but page handles remain
  unavailable. No live visual timing verification is claimed.
- Validation: targeted loading/entrance/impact/auto-turn tests passed, including
  cover-before-render, decode gating, duplicate triggers, rejected entries,
  artwork failure/timeout cleanup, viewport-edge starts, control locking through
  all slides, reduced motion, disposal and animation errors. Build/typecheck and
  editor diagnostics passed; existing bundle-size warning remains nonfatal.

## Saved upgrade celebrations (D-045)

- Upgrade handler calls celebrateUpgrade only after upgradeCharacter commits,
  updateCharacterTab refreshes the owned form, and wallet labels update.
  Level: short pulse/ring/six sparks. Evolution: longer reveal/ring/twelve sparks,
  both using the selected character's elemental color and a destination label.
- Temporary overlays do not intercept input or rebuild portraits. A per-portrait
  cleanup replaces previous effects and clears all classes/timers after 1.8/2.4s.
  Device/game reduced motion shows static success text; CSS also handles a motion
  preference change during playback. Existing facing scale remains intact.
- Finished level/evolution panels now retain upgrade-result so reaching a cap/
  final form reports successful saves normally, not through the error surface.
- Validation: 50 targeted celebration/hub/account tests passed and build/typecheck
  passed. Tests cover all three identities, distinct effects, repeat/cleanup,
  reduced-motion labels and explicit missing-portrait errors; existing account
  tests preserve rejected-save/transaction behavior. Live browser validation was
  attempted in an isolated context but blocked by the page-handle connection issue.

## Compact Character screen (D-044)

- Two-column desktop layout: compact owned identity/grouped navigation, broad
  details. Character/Growth/Combat group all nine original destinations.
- Overview groups Survival/Offense/Resource stats and uses a two-column
  passive/ability grid. Level/evolution separate benefits from resource/payment
  information; all seven deltas, real costs, gating and silhouette are preserved.
- Equipment separates Master/eight artifact slots. Unimplemented weapon/ability
  upgrades show current effects and explicit availability, not placeholder
  comparisons. No new upgrade mechanics, transactions or save changes.
- character-screen.css is imported after the shared styles and scoped to the
  Character hub. Phone identity is 100px; grouped navigation and responsive cards
  keep all information accessible without nested scrolling or fixed-height cuts.
- Browser access briefly recovered: isolated checks for all three starters,
  five representative tabs and actual 1280/780/390/320px widths reported no
  horizontal overflow, stable portrait DOM, 44px navigation targets and no page
  errors. At 1280px, each checked hub was 538px high with a 966px detail column.
  Final narrow-screen stat arrangement was compacted afterward; subsequent
  browser calls lost their handles again, so screenshots/before-after scroll
  measurements and that final visual refinement are not browser-verified.
- Final validation: 35 targeted hub/icon/role tests passed, build/typecheck passed,
  editor diagnostics and whitespace checks clean. Tests cover grouped navigation,
  all four combat cards, seven upgrade deltas, resource labels and unavailable
  upgrade states alongside existing costs, silhouettes and equipment contracts.

## Supplied Tizu/Flora ability icons (D-043)

- Ten root PNGs moved byte-identically into Art/source/abilities/tizu and flora.
  Runtime 256px RGBA exports use 224px content/16px padding via prepare_icons.py.
  The exporter now derives character source folders from IDs and supports --assets.
- Shared abilityIcons maps five active icons per starter; all existing Home,
  Character tabs/overview, battle controls/passive and hold guide consumers now
  use Tizu/Flora artwork. Defense is still text-only; no effects or balance changed.
- Earlier "icons not supplied" notes below are historical and superseded here.
- Validation: 30 targeted icon/gesture/hub tests and eight Python art tests
  passed; build/typecheck and editor diagnostics passed. All ten source hashes
  match intake. Reviewed all ten exports together over dark backing; supplied
  framing and enclosed white details remain preserved. Live browser inspection
  remains unavailable due the existing page-handle connection failure.

## Character role medals (D-042)

- Starter metadata owns role labels: Infernis Attacker, Tizu Tank, Flora
  Healer/Support. Shared character-role.ts renders decorative sword/heart/shield
  medals with readable text in selection, Home/team, Character, Squad and battles.
- Neutral, compact, transparent styling preserves the uncluttered battlefield;
  enemies retain only name/HP/Defense. No combat or save format change.
- Validation: 25 targeted role/hub/readout tests passed, build/typecheck passed,
  editor diagnostics and whitespace checks clean. Shared browser page still
  returns "Page not found", so live visual validation remains unavailable.

## Hit timing and health-bar easing (D-041)

- battle-health.ts snapshots pre-action HP, groups an attack's damage/heal/shield
  events and applies event-level health changes. BattleView updates HP text/bar
  targets at impact (normal180ms / ultimate360ms), not after the full turn.
- AoE hits update all targets together; burn/passive heal update at their event.
  Health bars ease width420ms; numbers appear immediately then pop/rise850ms.
- Damage events carry shieldRemaining; shield gains/absorption update correctly.
  Fractional HP, zero-HP fallen state, reward commits, auto-turns and saves remain.
  Reduced motion/error/disposal paths retain authoritative resolved state.
- Validation: the full regression suite and build/typecheck passed. Presentation
  timing test holds wind-up unresolved, confirms old HP, then releases
  impact and confirms updated HP/bar/number before return animations finish.
  Periodic burn metadata prevents same-source ticks being grouped into a skill's
  impact; a regression test covers the automatically advanced enemy phase.
  Browser page handle remains unavailable, so rendered easing was not verified.

## Field labels and combat feedback (D-040)

- Enemy labels show name, HP and Defense only. Enemy levels, attack/crit/elemental
  stats, shields, statuses and pending-art text are absent from field labels.
  Enemy mechanics/events remain unchanged; allies retain their readouts.
- Shared unit-readout.ts separates enemy/ally markup and formats fractional stats.
- Damage/healing/shield numbers use larger bright glow, critical emphasis and
  an 850ms gentle pop/hold/rise/fade. No opaque background.
- Inner unit-idle wrappers pulse living sprites 1x->1.025x over five seconds,
  staggered; fallen units and reduced-motion preferences disable idle animation.
  Attack wrapper and image mirroring remain independent.
- Validation: 11 targeted readout/guide/auto-turn tests passed, build/typecheck,
  diagnostics and whitespace checks passed. Browser tools continued returning
  "Page not found" even for a newly opened page, so visual validation remains
  unavailable; do not claim rendered animation checks passed.

## Ornate battle guide and field text (D-039)

- Holding left-click/touch on an available character opens a four-arm ornamental
  compass with arrows, skill labels, real gauge costs, dim unavailable actions,
  highlighted chosen direction and explicit reason/release status.
  Position clamps to viewport; all existing cancel/release/capture cleanup remains.
- Field labels, readouts, floating amounts, top/toolbar/reward/HUD/log text have
  transparent backgrounds and soft black blurred shadows. Controls retain
  faint translucent surfaces; sanctuary/Settings/report panels unchanged.
- No new icons/assets: Infernis uses supplied icons; other starters keep labels.
  Gesture thresholds, action legality, turns, rewards and saves unchanged.
- Validation: 20 targeted guide/gesture/automatic-turn tests passed; final
  build/typecheck, diagnostics and whitespace checks passed. Browser hold
  confirmed four arms and unavailable skills; computed field-label background
  is transparent with blurred shadows and no box shadow. Responsive pointer
  checks and guide screenshot were interrupted when browser page handles became
  unavailable; do not claim those checks passed. Owner wallet unchanged.

## Turn completion and visual direction (D-038)

- actAndAdvanceTurn resolves one player action plus one enemy phase when all
  living, non-recovering allies are spent. Support/Defense count; dead/recovering
  allies do not block. No retaliation after clear, no auto-stage advance and no
  repeated recovery skipping. Manual end-turn remains available.
- Combined ordered events/rewards commit atomically before presentation; low-level
  act stays single-action for existing tests. Burn rewards are included.
- Selected enemy glow has brighter layered white/element halos and readout borders.
- Per-art unit-facing.ts metadata mirrors opposing sprite directions only:
  characters left, enemies right, frontal poses unchanged. Applies to all portrait
  surfaces and evolution silhouettes; PNG originals/exports unchanged.
- Attacks animate a battle-sprite wrapper rather than overriding image mirroring.
  This also fixes animation of art-pending enemies without img nodes.
- Validation: 229 tests across 20 files passed, build/typecheck, diagnostics and
  whitespace checks passed. Browser confirmed auto-turns after Normal/Defense
  in Adventure and art-pending dungeon, matching reward saves and manual stage
  advance on clear. All supplied sprites have facing metadata. A real Tizu
  Evo3->4 transaction updated mirror direction while preserving portrait DOM.
  Animated browser checks finished finite animations explicitly because hidden
  tabs suspend their timelines; no animation/console errors occurred.
  Owner profile/wallet were not changed; localhost refreshed.

## Inventory and character equipment (D-037)

- Global Inventory lists only positive-count saved materials, with explicit
  empty/unavailable states. No artifact slots or item acquisition preview there.
- Character > Artifacts / Equipment (tab ID equipment) owns that character's
  eight regular slots plus one Master Artifact. Home shortcuts open this menu.
  Owned portrait/rail remain mounted across tab changes.
- Artifacts are intended to buff the equipped character's stats. Slots are
  empty; acquisition, equip persistence, bonus amounts and stacking remain
  undefined. No fabricated bonuses, item grants, costs or save migration.
- "Master Artifact" supersedes "master relic" in current UI/documentation.
- Validation: 23 targeted hub/navigation tests passed, build/typecheck,
  diagnostics and whitespace checks passed. Browser confirmed materials-only
  Inventory, eight regular slots plus Master Artifact on the selected character,
  preserved portrait DOM across tabs and no wallet changes. Localhost refreshed.

## Remaining elemental dungeons (D-036)

- Enabled Tectonic, Voltaic, Atmospheric, Luminous, Ominous, Tranquilitic and
  Chaotic: 50 stages each, shared Lv10->120 curve, own-element material drops
  and Prismatica, independent persisted stage unlocks/replay/reports.
- content/dungeon-enemies.ts lists each existing prompt pack's eight named enemies
  in ascending order and direct-damage strike names. Existing three supplied
  packs retain their exact lineups, assets, stats and rewards.
- Art availability no longer gates gameplay. Missing enemy/arena art is explicit:
  neutral shape and element-accented scenery, no borrowed art or broken URLs.
  Material inventory retains real names/counts without requiring images.
  Future packs register in content/dungeon-art.ts; gameplay automatically uses
  their ordered enemy art, banner, arena and recipe icons.
- Account version2 unchanged; absent dungeon unlocks mean Stage1. No new starters,
  infusion modes, captures, affinity restrictions, materials grants or costs.
- Validation: all 213 tests across 18 files passed, build/typecheck and diagnostics
  passed. Coverage checks all 500 encounters, eight prompt-matching species per
  new dungeon, opening/final clears, own-element drop IDs, reward deduplication,
  saved unlocks and existing supplied assets. Isolated browser cleared Stage1
  in all seven new dungeons, received two matching Seeds and 10-20 Prismatica,
  advanced to Stage2, preserved rewards after reload, and loaded each named
  Stage50 boss at Lv120 without failed asset requests. Owner storage untouched.
- Corrected dungeon-entry listener registration in main.ts: it was nested inside
  the menu-button loop and ran repeatedly after the first successful entry.
  Fresh browser entered/exited all ten dungeons with zero console/page errors
  and no wallet writes from entry/exit alone. Build/typecheck passed afterward.

## Fractional growth correction (D-035)

- Removed integer rounding from all resolved character stats and flat shield/heal
  potency. Each level adds 1% original base; each evolution adds 10% original
  base. Effective defense includes scaled passive defense. Zero bases remain zero.
- Home, Character, upgrade previews, weapon detail, battle HUD, floating amounts,
  logs and stage reports share up-to-two-decimal display formatting only.
- Adventure and all starter dungeons consume the same fractional fighter kit.
  Existing attack/burn/Defense/percentage-heal outcome rounding is unchanged;
  rounded hit damage need not increase on every level.
- Saves store level/form rather than derived stats, so no migration, free items
  or repurchase is needed. Active battles retain their entry snapshot.
- Validation: all 177 tests across 18 files passed, plus build/typecheck and
  diagnostics. Tests cover every valid level through all six forms for all
  starters, fractional combat inputs, shields/heals and wave persistence.
  Isolated browser checks confirmed matching Lv.1 stats on Home, upgrade
  previews, Adventure and all three starter dungeons; owner storage untouched.

Character evolution now previews its next form as a black silhouette on a neutral
light backing, with a generic accessible label instead of the unrevealed title.
Current owned art stays colored; successful evolution reveals it normally.
Evo.6 has no next preview. Level/other tabs do not display the silhouette.
The preview is bounded to 150px with contained proportions and shrinkable comparison
columns. Its HTML dimensions also reserve only 150px, not the source image's 960px.
The owner's open tab had stale CSS despite receiving the new markup; reload picks
up the silhouette styling without changing saved progression.
Validation: 21 targeted tests, build/typecheck, diagnostics and whitespace checks
passed. Screenshot confirms a solid black silhouette in the refreshed owner tab;
isolated browser checks at 1280/390/320px confirm contained art without horizontal
overflow. Owner currencies and progression were not modified.

## Dungeon difficulty update (D-034)

- All elemental dungeon definitions now reach Lv120 at Stage45 and remain120
  through Stage50. Character caps remain unchanged through Lv105/Evo6.
- Shared interpolation uses `round(10+(min(stage,45)-1)*110/44)`.
  Level-derived enemy HP/attack/defense/crit increase; lineups/ability schedules,
  material gates/odds/amounts, Prismatica and upgrade costs remain unchanged.
- Gameplay and battle help read the shared maximum instead of hard-coding100.
- Validation: 27 targeted dungeon/framework/account tests passed; build/typecheck,
  diagnostics and whitespace checks passed. Isolated browser verified all ten
  catalog ranges, updated battle help and Stage50 Ifrit at Lv120 with HP295,
  ATK35, DEF11 and crit16%. Opening stages and Lv105/Evo6 final-stage clears
  passed for all three starters; material tables and upgrade totals unchanged.

## Six-form evolution update (D-033)

- Owner explicitly expanded gameplay to six forms to use all 15 supplied images.
  Evo.1-5 behavior remains identical. Evo.5->6 preserves Lv.90 and adds 10% base,
  costs 4800 Prismatica, 25 Epic Crests and 10 Legendary Hearts. Cap105;
  Lv.105/Evo.6 growth factor2.55. Omnic remains a collectible without a recipe.
- Original `Title, Character.png` files moved to Art/source/characters without
  recompression; tools/prepare_art.py exports all fifteen 960px RGBA portraits
  using the existing padding/matte algorithm.
- src/content/character-art.ts owns form titles/art IDs. Home, team thumbnail,
  Character, Squad and battle resolve the owned form. Selection remains base.
  Evolution updates the existing image src/alt; unrelated tabs keep it unchanged.
- Account version2 and stable starter IDs remain unchanged. Existing saves remain
  valid; no auto-evolution or inventory grant. Six forms use the same transactions.
- Art/characters/Tizu Art.md and Art/characters/Flora Art.md each include six new 1:1 icon prompts:
  Passive, Skill1, Skill2, Last Flare, Normal, Defense. Mechanics match the base
  kit. No icon images supplied yet; no invented runtime URLs or Heavy prompts.
- All currently supplied dungeon materials were already integrated in the prior
  pass. No new loose dungeon material PNGs were present in this intake.

Flora is the nature starter's name. All active
character references and source/runtime art filenames use Flora/`flora`.
Her stable save/combat ID remains `sprout`, so existing saves still load.

## First-pass progression handoff

- Owner requires Prismatica plus smaller matching-element material amounts for
  leveling. Evolution currently omits creatures with explicit owner approval;
  long-term wisp requirements/acquisition remain deferred.
- All ten elemental 50-stage dungeons are playable (expanded by D-036).
  Full-stage clear reports, saved stage unlocks,
  replay, growing levels/stats/periodic strikes and real material drops work.
  Garden uses its newly found supplied eight enemies, banner, arena and materials.
- Lv.0/Evo.1 preserves the old base kit. Caps and additive growth are unchanged.
  Costs: `10 + 2*destination level` Prismatica and `ceil(level/30)` Seeds per level.
  Evolution costs/rarity quantities live in src/content/progression.ts.
  All the way to Lv.105/Evo.6 costs 21,480 Prismatica, 280 Seeds, 35 Blooms,
  35 Shards, 35 Crests, 10 Hearts. These are editable first-pass tuning defaults.
- src/game/account.ts owns version2 of last-light.wallet: both currencies,
  material stacks, starter progress, first-Fracture flag, stage unlocks and
  reward receipts. Version1 wallet balances migrate without changing value;
  reads do not overwrite storage. No retroactive material grant or free upgrade.
- One storage write commits costs/progress and first account Fracture +10 Null-Prismatica.
  Receipt-deduplicated rewards commit before battle state. Failed writes reject
  the action, retain all balances/progress and allow retry. Single-tab prototype;
  no cross-tab lock, backend, cloud account or Null-Prismatica spending.
- Compact upgrade panels show current/next stats, owned/needed resources and
  confirmation. Home/Character/battle use saved scaled kits. Portrait and rail
  remain mounted through tab changes and successful upgrades.
- See [progression](units-and-progression.md), [dungeon rules](gameplay-and-elements.md),
  [schema](technical-architecture.md#persistence-contract), D-032 and new account/dungeon tests.

## Starter evolution art handoff

- Art/characters/Infernis Art.md now includes five new 4:3 character prompts before its
  existing 1:1 ability icons. Greatsword ignition/ornamentation and armor grow
  toward six-winged heavenflame regalia.
- Art/characters/Tizu Art.md and Art/characters/Flora Art.md contain five prompts each: ornate tidal
  spear/celestial wave wings and living bow/angelic leaf wings respectively.
- Initially art-only; now all five post-base images are supplied and integrated
  as six gameplay forms by D-033. Female Infernis, male Tizu and female Flora
  identities are preserved. No new characters or skill mechanics were added.
- Prompts preserve the approved compact chibi/eyes-only/pure-white style,
  complete weapons, 4:3 ratio, whitespace, one --no and shared style-reference
  instructions. Actual approved reference URL still must be supplied by owner.

## Latest local verification

- `npm test`: 167 tests passed across 18 files. Python art suite: 8 tests passed,
  including all three supplied dungeon packs.
- Evolution browser checks in isolated contexts: Infernis/Tizu/Flora each show
  Evo5 art on Home, spend 4800 Prismatica and 25 Epic/10 Legendary to become Evo6
  while preserving Lv90 and the existing portrait node, retain art through tab
  changes, and show Evo6 on Squad/battle. All fifteen exports decode successfully;
  no page errors. Owner save/wallet unchanged.
- Prompt validation: six square icon prompts per Tizu/Flora file, five preserved
  4:3 unit prompts each, shared style reference, exact niji6/s100/q1 parameters,
  one --no per prompt and valid links. No loose PNGs remain in project root.
- Reviewed all fifteen evolved exports together over dark backing. Infernis Evo6
  had an ivory source background; a per-asset matte-minimum215 override removes
  corner patches while preserving enclosed pale details. Other exports keep230.
  Original bytes remain unchanged; the override has a dedicated Python test.
- Build task: TypeScript and Vite passed; existing large-bundle warning remains.
- Editor diagnostics and `git diff --check`: no errors.
- Local browser checks: four release directions, selected Imp targeting, single
  committed action per gesture, short cancellation, denied ultimate, right-click
  Defense, pointer cancellation/lost capture, ready shimmer and reduced-motion
  steady glow. Progressed capacity 140 still becomes ultimate-ready at cost 100.
- Recent changes are local; no new GitHub Pages deployment is implied.
- Earlier UI checks (before progression implementation): all seven destinations; real currency/owned Element-Bearer; eight
  artifact slots and one relic; ten disabled dungeon cards/two disabled infusion
  cards; one visible activity group; stable portrait/rail across upgrade tabs;
  Settings open/close; Adventure entry and restored run, without sanctuary nav
  or Heavy. Responsive 1280/390/320px checks found no horizontal overflow after
  correcting narrow-page body sizing. Home Adventure fits above bottom nav at
  1280x720. Existing saves/wallet were not changed by UI checks.
- Earlier art checks: both banners/arenas, 18 enemy illustrations and 12 materials
  loaded without broken images; Infernic/Aquatic accents resolved orange/blue.
  Evolution preview contains six own-element material references and keeps the
  character portrait mounted. Neutral HUD/normal/Defense remain in Adventure.
  New 1280/390/320px checks pass with expanded galleries and larger buttons.
- Latest isolated-browser checks: real Stage1 clear grants 2 Seeds and unlocks
  Stage2; purchase deducts exactly 12 Prismatica/1 Seed; cancel retains the save;
  reload retains Lv.1. Evo.1->2 preserves Lv.30, spends 300 Prismatica/15 Seeds,
  awards 10 Null-Prismatica and produces HP308 in Adventure. Portrait stays mounted.
  Upgrade panel has no horizontal overflow at actual 1280/390/320px. No page
  errors; isolated contexts are closed and the owner's profile/wallet untouched.
- Garden Stage50 browser check: dedicated arena/final-boss art loads, clear
  report includes real damage/HP/rewards, 3 Seeds plus rolled rarity rewards are
  saved, highest unlock remains 50 and the continue control is disabled.

## Dungeon art and neutral-theme handoff

- Primary chrome is black/white/gray, superseding earlier blue/gold/rainbow
  styling. `src/neutral-theme.css` owns final palette rules; layout remains in
  existing stylesheets. Ambient backdrop is neutral; elemental art stays colored.
- Home/action-category banners minimum 76px; Adventure launch minimum 128px.
  Dungeon banners reserve 3:1 areas; unsupplied banners show a neutral placeholder.
- `src/content/dungeon-art.ts` owns ten element accents, two supplied dungeon
  packs (now three) and material visual-name order. Gameplay cards show banners and concise
  matching-element enhancement material descriptions; no artwork disclosures or
  enemy/reward catalogs. Arena/enemy exports remain preserved for future combat.
  Character evolution shows own-element supplied
  material art. Only required recipe icons appear; playable dungeons now grant
  actual material stacks using the first-pass tables.
- `tools/prepare_dungeons.py` intakes eight Aquatic enemies, twelve materials and
  four landscapes. Original files live in Art/source by category. Hash-identical
  root Infernic enemies are archived under Art/source/intake-duplicates; existing
  originals and runtime enemy exports remain intact. No root PNG intake remains.
- Sprite/icon sizing and byte-identical landscape contracts are tested by the
  extended art suite. Regenerate with `python tools/prepare_dungeons.py`; first
  intake only uses `--move-sources`. No dependencies added.

## Project state

- Phase: browser prototype; opening flow implemented.
- Confirmed goal: a cinematic gacha game inspired by Brave Frontier.
- Existing design asset: [character and weapon prompt guide](../Art/guides/midjourney-character-style-prompt.md).
- Documentation entry points: [root README](../README.md),
  [documentation hub](README.md), and [AI instructions](../AGENTS.md).
- Stack: TypeScript, Phaser 3.90, Vite 7, Vitest 4; Node 22.12+.
- Implemented: animated title, fire/water/grass starter choice, explicit confirmation,
  local starter save, opening menu, saved-session continuation, save-error handling.
- Starter selection now includes bounded elemental reveals and original lore;
  first confirmation plays an Element-Bearer awakening. Lore stays readable in the menu.
- Implemented bottom destinations: Home, Character Upgrades, Gameplay, Events,
  Inventory, Squad and Summon. The last two are honest future-system previews.
  Inventory now lists materials only; D-037 moves the equipment preview to Character.
  Adventure and Story are Home subactivities. Settings opens in a modal side drawer.
  Story displays the saved starter's lore/prologue; Events is a future placeholder. Motion settings
  save separately and update both canvas/CSS motion. Prismatica shows a persistent
  local balance; Null-Prismatica is saved and first Fracture awards 10. Level/evolution
  work; equipment and separate skill/weapon purchases remain previews.
- Gameplay groups Adventure, elemental material dungeons, evolution infusion,
  Story and Events. Adventure/Story return here; Home keeps direct Adventure
  and adds Gameplay entry. Colored category rail selects one activity group
  without granting resources; category hashes survive Settings.
- Removed the redundant global ability strip. Matching Infernis PNGs now replace
  numbered symbols in existing Home shortcuts and Character area selectors for
  Passive/Ability1/Ability2/Last Flare. Existing passive/detail panels keep their
  art; no second set of ability cards is added. Other starters retain numbered
  symbols until their own icons are supplied.
  `src/content/activities.ts` owns ten canonical element/dungeon mappings, 60
  distinct material IDs, two exact infusion eligibility groups and recipe helpers.
  Starters keep save IDs but display Infernic/Aquatic/Efflorescent affinities.
  Dungeon levels 10->120 linearly by Stage45, then plateau to Stage50; tested for
  all stages. Seven dungeon cards and two infusion cards remain disabled.
  Heavens/Abyss start Lv80, 25 stages, four tiers, 5-6 enemy concepts each;
  later growth/rates/encounters remain open. Starter characters now have six forms,
  approved recipes Common; Common+Uncommon; Uncommon+Rare; Rare+Epic; Epic+Legendary, plus
  Prismatica; mapped infusable enemies are deferred for this first pass.
  Quantities, material ownership and transactions now work.
  [Owning specification](gameplay-and-elements.md).
- Home now follows the full UI concept's colorful utility rail / central orbit
  character with hexagonal shortcuts / right current-team/stat-passive panel and
  Adventure launch. Seven-destination bottom nav supersedes earlier screen limits.
  Character Upgrades has an area rail, central Element-Bearer, and focused detail panel
  for Overview, seven upgrade paths, and Inventory / Equipment. Home shortcuts
  select these directly; Settings preserves the selected area. All content uses
  the saved starter. Tizu's effective defense is 24, not base 16.
  Render helpers live in `src/presentation/hub.ts`, `sanctuary.ts` and
  `gameplay.ts`; scoped styling in `src/sanctuary.css`. No external fonts/dependencies
  or mock-up scripts were imported. Provided mock-up files remain untouched.
- Home uses a bounded portrait and internal desktop scrolling; orbit shortcuts
  turn into a wrapping dock on smaller screens. Adventure is above stats and
  utility shortcuts on mobile. Within
  Character Upgrades, tabs replace only the detail panel, preserving the exact
  showcase/image/rail/dialog DOM nodes without replaying entry animation.
  Detail focus uses preventScroll; a desktop minimum panel height limits jumps.
- All valid version-1 starter saves continue unchanged, including water/grass.
  The earlier forced fire re-selection policy is superseded.
- Implemented: solo Adventure using only the saved Infernis/Tizu/Flora, enemy waves,
  health/defense/damage/crit, one action per turn, ultimate-only recovery, all
  passives/skills/Last Flares, elemental effects, and persistent remappable hotkeys.
  See [rules and kit values](free-battle.md).
- Battle text now has opaque dark backing, stats/gauge/details at least 14px,
  instructions/logs 16px, readable disabled controls and defeated labels, and
  prominent keyboard focus. Only defeated artwork fades.
- Adventure uses a dedicated full-viewport field screen, without sanctuary
  chrome/nav. Unit sprites have no enclosing blue cards; name/stat readouts remain
  dark and readable. The compact HUD retains actions/hotkeys, end turn, restart,
  disclosures for full descriptions/log, and Settings. Quit Battle returns Home
  while retaining Prismatica but ending the run. Every entry starts at wave 1;
  Settings preserves the active run. Small screens scroll vertically as needed.
- Adventure supersedes Free Battle's name/session-resume policy. Enemies display
  level = wave. HP/attack add 12% of base per wave (rounded), defense adds 1 each
  wave; growth is linear, never compounded. Saved starter progress now scales kits.
- Owner chose documentation/art first for Flaming Depths: one separate future
  dungeon with higher-level waves, wave-end reports, and chance-based captures.
  Captures are separate weaker/squishier fodder with Normal only after Heavy removal and level
  upgrades only, never evolution. Captures/team editing remain unimplemented.
  [Ten ascending-power art prompts](../Art/creatures/Flaming%20Depths.md) are ready to generate;
  [dungeon/capture contract](dungeons-and-captures.md) lists open balance/storage rules.
- Owner supplied all ten dungeon illustrations and explicitly selected a
  design-first pass through Stage 50. Originals moved byte-for-byte into
  `Art/source/enemies`; 960x960 transparent exports are in `public/assets/enemies`.
  All ten were reviewed together over dark backing; enclosed pale regions remain
  intentionally preserved by the existing matte algorithm, not manually retouched.
  `tools/prepare_art.py --assets <ids>` now supports targeted regeneration; default
  all-asset behavior remains unchanged.
- [Full 50-stage proposal](flaming-depths-stages.md): ten five-stage regions,
  three-enemy regular waves and solo elite milestones every fifth stage;
  historical levels 6-55 (now superseded by the new Lv10-120 rule), five skill ranks,
  exact hostile skill effects/schedules, report boundaries and final completion.
  Numbers remain proposed; hostile skills never transfer to captured fodder.
  That older design is not the current encounter table. Three starter dungeons
  now have combat, reports/rewards and progression transactions; captures/team
  edits remain deferred.
- Each ally has Shatter Gauge: starts 0, caps 100 at base, Normal +20,
  incoming enemy hit +10 (including shields). Skills cost 25/40 and Last Flare
  costs 100; skills no longer generate resource. Battle meters/buttons and the
  character kit show gauge/costs. No persistent-save schema change is needed.
- Six supplied images moved to Art/source; transparent runtime exports are in
  public/assets. Portraits use the new names but retain old save IDs.
- Six Infernis icons are preserved under `Art/source/abilities/infernis`, with
  separate 256px RGBA / 224px content exports in `public/assets/abilities`.
  `tools/prepare_icons.py` reuses matte removal without applying unit dimensions.
  Adventure buttons use Normal/Ability 1/2/Last Flare icons; archived Heavy art
  is preserved but no longer mapped to a runtime action. Home passive,
  Character overview/individual passive-skill areas and battle passive help use
  the matching art. Text/hotkeys/costs remain visible; water/grass remain text-only.
  Browser checks confirm all mappings, decoded icons, 32px square battle sizing,
  stable character portraits through skill tabs, working Light gauge gain, and
  all five controls/no horizontal overflow at narrow widths for every starter.
  Five Python tests now cover both unit and independent ability-icon exports.
- Grassy Field moved to `Art/source/backgrounds`, with a byte-identical landscape
  PNG in `public/assets/backgrounds`. It is wired behind the Adventure arena;
  no unit-art alpha removal or square normalization is applied.
- Character drag input executes on release: Up Last Flare, Left Skill1, Right
  Skill2, Down Normal. 32px threshold; short drags/cancellation/exact diagonal
  ties do nothing. Selected enemy remains target. Right-click uses Defense:
  consumes action, no gauge cost/gain, -10% incoming damage after defense and
  before shields until next player turn; one-damage floor and incoming +10 remain.
  Buttons/hotkeys are alternatives for touch/accessibility. Ultimate white
  shimmer/glow appears only while legally usable; reduced motion keeps static
  glow and readiness text. Pointer capture prevents losing a drag outside unit;
  cancel/lost capture/navigation/Settings must not execute a pending gesture.
  Old saved Heavy hotkey migrates in memory to Defense without overwriting
  corrupt settings or changing other remapped keys.
- Not implemented: rewarded quests, squad editing, summoning, equipment and
  separate skill/weapon purchases, captured creatures, Null-Prismatica spending,
  accounts, cloud saves, backend, payments.
- Character growth now uses +1% original base per level and +10% per completed
  evolution, added rather than compounded. Six forms cap at 30/45/60/75/90/105;
  evolution preserves level, superseding the old reset-to-0 rule. First Fracture
  still grants +10 Null-Prismatica. Seven stats include Shatter capacity, HP, DEF, Attack
  Damage, critical rate, critical multiplier and elemental damage. Numeric
  skill/passive potency scales too; timing/thresholds/costs/gauge gains stay fixed.
  Resolved kits drive battle effects and descriptions, including grown critical
  multipliers, per-character gauge limits and elemental burn.
  The old preview-only gate is superseded by D-032. Runtime uses saved progression;
  wallet version2 stores currencies, materials, progress and first-Fracture reward.
- Every newly defeated enemy grants 5-10 Prismatica, including burn kills.
  `last-light.wallet` version2 stores the economy/progression together.
  Wallet writes precede battle-state commit; failures visibly reject the action.
  Currency survives exit/restart/reload; corrupt wallets are never overwritten.
- Repository: [tjprice101/LastLightGame](https://github.com/tjprice101/LastLightGame).
- Deployment: [GitHub Pages](https://tjprice101.github.io/LastLightGame/),
  configured for the [Actions workflow](../.github/workflows/deploy.yml).
- Local Git preserves the remote's initial `main` commit.

Inspect the workspace again when resuming; this snapshot is not proof that
later contributors have made no changes.

## Original foundation handoff (historical)

The following captured the initial prototype state and is superseded by the
Phase10/Phase11 status above. See [opening flow](opening-flow.md) for current
behavior and source references.
The original art guide is preserved; supplied PNG art replaces SVG placeholders.
Adventure grants Prismatica enemy drops but no permanent roster grants. Broader design documents
still label unapproved production mechanics as proposed.

## Next recommended action

Phase12 owner-supplied art integration is complete. Review
[open decisions](decisions.md#open-decisions) or obtain owner approval for a
specific new feature before adding another phase; do not treat a proposal or
historical backlog item as approval.

## Known gaps

- Prototype combat values were delegated and implemented; production balance,
  summon rates/prices, rewards, and squad editing rules remain open.
- Midjourney style-reference URL is absent; supplied runtime art is available.
- No confirmed story, target devices, runtime asset pipeline, or commercial plan.
- Phaser contributes most of the 1.2 MB uncompressed production bundle; Vite
  reports a chunk-size warning. Target-device performance has not been profiled.

## Verification

- Dungeon intake: SHA-256 checks preserve all ten originals, Python's four
  image-processing tests pass across all 16 registered unit assets, and runtime
  PNG contract tests cover the new exports. A stage-table arithmetic check verifies
  exactly 50 sequential rows, ten known archetypes, levels 6-55, five rank bands,
  three-enemy regular lineups and exact stats for all ten elite milestones.
- Immersive field checks passed at 1280x720, 390x844, 320x640, and 844x390:
  scenery fills the viewport, sanctuary chrome/cards are absent, all five actions
  and full descriptions remain available, no horizontal overflow, and quit/re-entry
  retains earnings without leaking hotkeys. The old session-resume policy is
  superseded: Adventure re-entry starts a new run. Settings suspends input.
  Water/grass defeat screens retain the selected character and allow restart.
  Desktop/mobile screenshots reviewed; narrow/short screens scroll as needed.
- `npm test`: 115 passing tests for all three starter transitions and saved continuations,
  failed storage writes, lore/reveal budget, currency/slot/upgrade definitions,
  motion settings, combat formulas, all kits/passives, exact recovery/cooldown
  boundaries, status durations,   shield/heal caps, waves/defeat, hotkey validation, and every runtime unit PNG's
  960 x 960 RGBA export contract.
- Framework tests cover ten exact dungeon mappings, sixty unique materials, every
  stage level/plateau, rejected invalid inputs, exact infusion eligibility and
  adjacent evolution requirements for every element; unavailable modes stay gated.
- Browser checks for all three starters verify ten dungeon/two infusion cards,
  twelve disabled launch controls, Gameplay Settings restoration, playable
  Adventure launch/quit to Gameplay, Story parent navigation, correct own-element
  recipes and stable character art. Gameplay has no horizontal overflow at
  1280x720, 390x844 and 320x640. Profiles were preserved and test storage restored.
- Adventure tests verify wave-1 starts, enemy levels, and exact base-relative HP/
  attack and +1 defense across 20 waves; no compounded growth or invented ally level.
- Browser checks cleared wave 1 through real actions and reached wave 2 with Goblin
  HP 123, DEF 6, DMG 26 and every enemy showing level 2. Settings kept that wave/
  enemy state; quit/re-entry reset to wave 1/full HP while retaining three enemy
  payouts. All three starters retained their identities, spent actions through
  Settings, and reset actions/gauges on re-entry. Test storage was restored.
- Hub content tests cover all three real character kits, all nine areas, exact
  ability costs, effective defense, Fracture preview, and eight artifacts/master
  relic. Browser checks for each starter verify dock/rail selection, focus,
  unavailable upgrades, Settings tab preservation, battle/quit entry, and unchanged
  profile/wallet. Home/Character layout checks pass at 1280x900, 390x844, 320x640,
  and 844x390 with square contain-fit art and no horizontal overflow.
- Compact Home checks: at 1425x768 the full page fits without scrolling; at
  1280x720 Adventure and the dock are visible, with only a small footer scroll.
  Browser tab checks preserve exact image/showcase/rail/root/dialog nodes across
  all nine areas, with no showcase mutations and correct focus/selected state.
  Independent detail-render tests cover every starter/area with no portrait/nav markup.
- Reward tests cover all six integer payouts 5-10, repeatable independent reward
  randomness, ultimate multi-kills, burn kills, no repeated dead-enemy/ally payouts,
  wallet persistence, corrupt-save preservation, overflow and write failures.
  Headless Edge verified immediate payout/display, failed-write rollback/retry,
  no duplicate after navigation/Settings, restart/reload retention, and visible
  unavailable/error state for corrupt wallets.
- Solo browser checks passed for each starter: new selection/confirmation, saved
  reload, matching lore, exactly one ally, Heavy/skill resource changes, Settings
  state preservation, and restart retaining the chosen character. Existing saves
  continue without replacement. Desktop 1280px and mobile 320px text checks
  measured at least 14px for battle details and >=4.5:1 contrast, including
  unavailable controls; no overflow or overlapping battle sides. Screenshots reviewed.
- Growth tests verify caps 30/45/60/75/90, preserved-level preview, additive
  factors, all seven stats, scaled skills/passives, fixed costs/timing and first
  +10 Null-Prismatica rule. Live local browser checks cover base kits for all starters,
  progressed-kit battle presentation and no horizontal overflow at 1280/390/320px.
  Earlier production-preview headless Edge
  checks verify visible rules, seven upgrade areas, no enabled transactions,
  unchanged version-1 save, and 320px layout without overflow.
- Scenery tests verify the runtime PNG equals the preserved source and retains
  1456 x 816 RGB dimensions. Headless Edge decoded the image at 1280px and 320px,
  checked full arena coverage, aspect-preserving cover sizing, enemy-left/ally-right
  layout, and working attacks; screenshots were reviewed for readable battle cards.
- Shatter tests cover zero-start/independent gauges, exact costs for every starter
  ability (including support), insufficient-resource rejection without mutation,
  attack/incoming-hit gains and cap, shielded/lethal hits, no passive/burn gain,
  wave carryover, and ultimate-only recovery boundaries.
- Local headless Edge verified real battle UI: zero-start meters and disabled
  skills, Heavy +30, incoming-hit gains, 25/40 skill spending, next-turn availability,
  gauge cap, Last Flare cost/recovery/expiry, and 320px layout without overflow.
  Used a separate browser profile because the shared browser connection was unavailable.
- `npm run build`: strict type-check and production build pass; bundle warning above.
- `npm audit`: zero known dependency vulnerabilities after updating Vitest.
- `npm ci`: clean lockfile restore passes with npm 10 after stopping the
  project's development server to release Windows' esbuild executable lock.
- Earlier browser checks: all three original starters selected/saved/reloaded before
  the fire-only restriction; keyboard title entry; explicit
  selection gate; 390px layout without horizontal overflow; pointer completion;
  corrupt saves preserved with visible errors; failed writes do not advance;
  reduced-motion CSS verified.
- Browser test save changes were restored to the previous local value.
- Development server returned HTTP 200 at `/LastLightGame/`.
- [First deployment workflow](https://github.com/tjprice101/LastLightGame/actions/runs/37174431784)
  completed successfully. The public page returned HTTP 200, and a live browser
  check verified canvas/assets, starter selection, and saved reload with no
  uncaught browser errors.
- npm 10 hit a resolver error when upgrading Vitest; `npx npm@11.6.0 install`
  resolved it. The committed lockfile is used by `npm ci`.
- Reveal browser checks used DOM-triggered clicks because the shared browser tab
  was hidden and native input/animation actionability stalled. Verified all three
  lore/reveal variants, focus preservation, 12-mote limit, no preview save,
  first-arrival-only awakening, saved lore, reduced-motion styles, and 390px layout.
  Visual playback in a visible tab remains a manual check.
- Earlier menu checks: fire-only entry, preserved legacy save until confirmation,
  Prismatica/Null-Prismatica labels, exactly eight artifacts plus one
  master relic, seven upgrade paths, readable story, future events, settings
  persistence and 390px layouts. DOM-triggered input was used for the hidden tab.
- Three-screen browser checks: exactly Home/Character Upgrades/Events navigation,
  Home Squad/Summon buttons, seven upgrade areas and integrated inventory, drawer
  motion persistence/focus return on every screen, battle input suspension/resumption,
  and no horizontal overflow at 320px. Storage and viewport were restored.
- Earlier Free Battle browser checks (before Shatter Gauge): all nine starter
  skills/ultimates, original heavy recovery, all six decoded assets, enemy-left/team-right mobile layout, hotkey
  remap/display/persistence/guards, duplicate rejection, listener cleanup on repeated
  navigation, and first-action-only resolution. Animation tests created all three
  ultimate variants and explicitly finished Web Animations to verify cleanup in the
  hidden shared tab; navigation cancellation preserves the resolved state.
- Alpha exports checked for transparent borders, partial-alpha edges, opaque
  interiors; a dark-background contact sheet was visually reviewed.
- [Free Battle deployment](https://github.com/tjprice101/LastLightGame/actions/runs/37176473879)
  passed. All six public PNGs returned HTTP 200; live browser checks verified
  decoded art, Cinder Cleave, Tidal Shelter, keyed Worldseed, enemy phase, and
  recovery without uncaught errors. Browser test storage was restored afterward.
- All 167 local documentation links/anchors across 19 Markdown documents resolved.
- Unit art standardized to centered 960 x 960 canvases, longest content dimension
  864px and minimum 48px padding. Source originals remain unchanged. Four Python
  image tests check aspect preservation, white-interior preservation, export
  occupancy/centering/padding, and empty-image rejection.
- Browser sizing verified at 1280px, 390px, and 320px across selection, sanctuary,
  character, and battle: equal battle slots, square images, contain fit, correct
  natural sizes, and no horizontal overflow.

For setup and deployment commands, use the [development guide](development-guide.md).

## Handoff update template

## Current: owned roster, summons and squads

Character now selects all owned Element-Bearers and upgrades them independently.
Squad saves an ordered leader plus up to two Element-Bearers; starter can be removed,
duplicates/unowned/empty squads rejected. All modes use the equipped team with
per-member progress and controls. Continue/replay preserve the run snapshot and
per-member Gauge; Settings does not replace the team.

Summoning costs10 Null-Prismatica, draws equally only from unowned existing characters,
and atomically saves deduction/acquisition before revealing. Newly summoned
characters are unequipped. Completed pool and insufficient currency disable
the action. First Fracture still grants10 Null-Prismatica only once; acquiring both
remaining Element-Bearers naturally needs an owner-approved future earning source.

Version3 wallet progress-record presence establishes ownership. Reads add the
profile starter/default squad in memory only, preserving existing progress and
stage migration. Optional squad extends existing saves; no forced reset or
schema-version churn. See [D-059](decisions.md), [economy](summoning-and-economy.md),
[roster](units-and-progression.md#implemented-roster-and-squad-behavior) and
[regression tests](../src/game/squad.test.ts). update template

Verification: 462 tests across46 files passed; production TypeScript/Vite build
passed (existing large-bundle warning remains). Isolated browser checks summoned
both remaining characters using test-only funds, upgraded Tizu independently,
saved/reloaded the ordered squad and controlled all three allies through a full
turn. Every elemental dungeon and both infusion modes spawned the same team.
Stage Continue and Settings retained each Gauge; replay retained the roster and
reset Gauge. Full-team/roster art decoded at320/390/1280px with no horizontal
overflow. Very small320x700 endgame layouts remain vertically scrollable;
390x844 and desktop fit the full allied formation. Owner storage was untouched. update template

Replace the current-state sections with the latest truthful snapshot; preserve
important decision history in the decision log instead of accumulating conflicting
snapshots here.

```text
Updated date and contributor:
Current phase:
Task/goal:
Confirmed requirements used:
Changes made and file links:
Implemented behavior:
Validation: exact commands/checks and outcomes:
Known issues and limitations:
Open decisions/blockers:
Next concrete action and prerequisites:
```
