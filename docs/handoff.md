# Current state and handoff

## Machines Focus Loot (D-379; 2026-10-22)

- Owner confirms one saved focus per Rare/Legendary/Omnic tier simultaneously
  and clearing whenever its selected name is obtained from any source.
  Machines now has a Focus Loot modal with rarity tabs, unowned selection,
  replacement/clear controls and full Details for owned/unowned names.
  Master/Common/Calamitic options are excluded.
- Optional validated account focus persists without load-time writes.
  Shared account saves clear acquired names atomically across all reward/
  purchase paths. Machines overrides only successful tier identities; rarity
  rates, stage56 Omnic gate and independent RNG consumption remain unchanged.
  Multiple kills, Continue, Replay, historical reconstruction and Settings
  preserve the remaining focuses. Reward validation enforces selected names;
  failed writes and receipt retries cannot lose focus or grant twice.
- Matching online operation is strictly validated; authoritative entry/action/
  retry refresh current focus. Collections' live tables show focused odds.
  Dedicated model/combat/authority and presentation tests cover every75
  eligible name, rates/gates/RNG, persistence, malformed inputs, multi-kills,
  failed writes, banner acquisition, Details and UI error states.
- Validation: `npx vitest run --maxWorkers=2 --reporter=json` passed6,237
  tests/201 files; `npm run build`, `node tools\bundle_server_game.mjs`,
  `npx tsc --project supabase\functions\game-operation\tsconfig.json` and
  `git diff --check` passed. Updated the older Gameplay disclosure-count
  assertion to permit the requested Conduit Details lore. Existing mock-canvas
  warnings and Vite chunk-size advisory remain nonfatal. Refreshed the
  138-entry/726-scenario behavior-matrix evidence from the full passing report.
- Browser validation used an isolated in-memory fixture, not a real profile:
  desktop layout, rarity tabs, selection, nested Details and Escape/focus
  restoration checked; no account storage or hosted owner data changed.
  Temporary local UI server stopped after the check.
- Matching authority deployed using `npx supabase functions deploy
  game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`.
  `node tools\smoke_server_game.mjs --focus-loot` passed: simultaneous
  three-tier persistence, clear/reselect, all three focused awards, exact
  local/hosted parity, atomic clearing, saved readback, owned-name rejection
  and idempotent retries. Disposable identity/cascading data removed.
- Client release `1f98bc0` passed main-branch Pages workflow39737830452,
  including full tests, configured online build and deployment.
  Follow-up retry wording explicitly leaves network outcomes unconfirmed
  rather than claiming no save occurred;11 focused presentation tests and
  the production build passed again. Publish that client-only refinement
  through the same workflow and verify the hosted commit/assets.

## Last Flare potency (D-378; 2026-10-22)

- Owner selects3x damage/1.5x non-damage potency for all16 characters.
  Shared native action/direct and manual-packet paths cover main hits, Burn,
  traps, recalls, Cyclone releases and Wounds/Foundation. Non-damage changes
  include healing/Seeds, Shield/Cover, Resolve, ward, Critical Rate and pierce.
  Costs, recovery, clocks, counts, eligibility and pending snapshots unchanged.
  Independent generated equipment effects retain their formulas; Bruno's
  native Master Shield replacement is scaled and catalog copy refreshed.
- Added roster-wide numerical and conditional tests plus all16 authority
  parity/read tests. Hosted smoke `node tools/smoke_server_game.mjs
  --last-flare` exercises all16 with stored/conditional resources, exact local/
  hosted results, persistence, retry safety and unchanged costs/recovery using
  disposable identities only.
- Validation: full `npx vitest run --maxWorkers=2 --reporter=json` passed6,204
  tests/199 files. `npm run build` passed after adding the optional-layer guard
  to the new test (28 cases rerun); authority bundle/type-check and
  `git diff --check` passed. The138-entry/726-scenario Conduit matrix is
  refreshed and now hashes native tuning/identity definitions plus Last Flare
  numerical/authority tests. Existing Vite chunk-size advisory only.
- Matching authority deployed with `npx supabase functions deploy
  game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`.
  `node tools/smoke_server_game.mjs --last-flare` passed for all16:
  exact local/hosted effects, stored payoffs, persistent snapshots and
  idempotent retries. Disposable identities/cascading records removed;
  no owner accounts modified. Docker-not-running warning was nonfatal.
- Publishing client through main-branch Pages full tests/configured online
  build/deployment; verify hosted version after workflow completion.

## Publishing D-375 through D-377 (2026-10-22)

- Owner requests push/deploy now and by default for completed validated project
  changes; recorded the standing workflow in `AGENTS.md`.
- Matching authority deployed with `npx supabase functions deploy
  game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`.
  `node tools/smoke_server_game.mjs --capture-rate` passed11 hosted cases:
  ordinary/boss kills in all five eligible modes succeed on a roll between
  the old20% and new50% thresholds; Rose enemies above120 stay excluded.
  Client/server reward parity, cap60, persisted accounts and idempotent retries
  verified. Disposable users and cascading records removed; no owner accounts
  modified. Docker-not-running warning did not prevent remote deployment.
- Push publishes Global terminology, canonical keyword casing and50% captures.
  The main-branch Pages workflow runs the complete test suite and configured
  online build before release. Earlier local-only notes below are historical.

## Capture rate50% (D-377; 2026-10-22)

- Shared capture success threshold is now `[0, 0.5)` for all eligible kills
  in Soar, Delve, Treasury, Sanctuary and Roses, ordinary enemies and bosses.
  Roses still rejects actual enemy levels above120; owned cap60 unchanged.
  No other modes gain captures, no new RNG draws, and currency/material/
  recruitment rolls, saved copies and atomic persistence are unchanged.
- Updated Play, Collections, Rose event and battle guidance to50%.
  Boundary tests cover0.5 exclusion and added every-stage tests across all
  five eligible modes with rolls inside/outside the new threshold and
  unchanged non-capture RNG/rewards.
- Validation: `npx vitest run --maxWorkers=2 --reporter=json` passed6,160 tests
  across198 files. Build caught a nullable test-fixture level; added an explicit
  missing-level guard, then reran `npx vitest run src/game/captures.test.ts
  --maxWorkers=2 --reporter=dot` (21 passed) and `npm run build` (passed).
  `node tools/bundle_server_game.mjs` and
  `npx tsc --project supabase/functions/game-operation/tsconfig.json` passed;
  behavior matrix refreshed138 entries/726 scenarios. `git diff --check`
  passed. Existing Vite chunk-size advisory only.
- Local/unpublished. Authority bundle includes50% but has not been deployed;
  hosted signed-in play keeps its previously deployed capture rate until
  coordinated publication.

## Consistent keyword casing (D-376; 2026-10-22)

- Screenshot showed lowercase `[skills]`. Shared reference formatting now
  uses canonical keyword casing for both plain and already bracketed terms;
  exact bracketed aliases also resolve, including `[All-enemy]` to `[Global]`.
  Unknown brackets, ordinary prose, numbers, skipped HTML and attributes stay
  unchanged. No combat or save changes.
- Focused validation: `npx vitest run src/presentation/reference-text.test.ts
  src/presentation/conduit-keywords.test.ts src/presentation/conduit-rules.test.ts
  src/presentation/conduit-store.test.ts src/presentation/conduit-loadout.test.ts
  --maxWorkers=2 --reporter=dot` passed206 tests across5 files. Checks include
  all138 Conduits and ordinary upgrade levels. Updated lore assertions to
  compare complete canonically formatted prose rather than raw source casing.
- Final validation: `npx vitest run --maxWorkers=2 --reporter=json` passed6,155
  tests across198 files; `node tools/build_phase_zero_behavior_matrix.mjs
  <passing-report>` refreshed138 entries/726 numerical scenarios.
  `npm run build` passed with only the existing chunk-size advisory.
  Local/unpublished together with D-375.

## Global targeting keyword (D-375; 2026-10-22)

- Owner requests Global instead of All-enemy. Updated current/historical
  Conduit descriptions and canonical owner catalog; shared reference alias
  displays historical unbracketed wording as `[Global]`. Glossary defines
  all eligible targets on the effect's specified side, covering damage,
  healing and support without changing mechanics or internal targeting IDs.
- Validation: `npx vitest run --maxWorkers=2 --reporter=json` passed6,153
  tests across198 files after updating the glossary's exact-list expectation.
  `node tools/build_phase_zero_behavior_matrix.mjs <passing-report>` refreshed
  all138 entries/726 numerical scenarios. `npm run build`,
  `node tools/bundle_server_game.mjs` and
  `npx tsc --project supabase/functions/game-operation/tsconfig.json` passed.
  Only the existing Vite chunk-size advisory remains. Local/unpublished;
  regenerated authority bundle is not deployed.

## Publishing Rose progression correction (2026-10-22)

- Owner explicitly requests pushing/deploying D-374. Matching authority
  deployed with `npx supabase functions deploy game-operation --project-ref
  ohtfgwomdfteaxubndww --no-verify-jwt` after bundle/type-check validation.
- Added `node tools\smoke_server_game.mjs --rose-progression`: hosted
  Rosetta/Thornia/Crinso each evolve4->5 with the base Rosethorn recipe and
  level75->76 without Souls. Exact materials/Prismatica/fodder, idempotent
  retries and persisted account verified. Disposable identity and cascading
  records removed; no owner accounts touched.
- Client publication uses the main-branch Pages workflow's complete tests
  and configured production build. Earlier local-only labels below describe
  prepublication checkpoints.
- Initial release CI caught two historical leveling-material expectations
  that still asserted the removed Rose Soul surcharge. Updated expectations
  retain ordinary specialty coverage and require exactly one Soul at91.

## Rose progression parity (D-374; 2026-10-22)

- Owner explicitly approves removing extra Rose-only level/evolution
  surcharges. Rosetta/Thornia/Crinso retain Rosethorn event materials and use
  ordinary base rarity thresholds/amounts. No Soul below destination91;
  one Soul per level thereafter. Evo.4->5 costs25 Bloom/10 Crest, Evo.5->6
  costs25 Crest/10 Heart, without extra Heart/Soul items.
- Shared character-aware recipes drive UI, Max Level, single-level and
  online/offline transactions. Ordinary Heaven/Abyss specialty recipes,
  Prismatica, caps, Roselius fodder and saved progress remain unchanged.
  No retroactive refunds, migrations or grants.
- Targeted189 tests passed across progression, Crimson Roses, Max Level
  and authoritative server-game suites. Tests cover every valid level/form
  for all three Roses, exact75->90 Max Level without Souls, Soul91 gate,
  displayed recipes and atomic late evolutions/online leveling.
  `node tools\bundle_server_game.mjs`,
  `npx tsc --project supabase\functions\game-operation\tsconfig.json`,
  `npm run build` and `git diff --check` passed. The existing Vite
  chunk-size advisory remains nonfatal. Local/unpublished; the authority
  bundle is updated but not deployed.

## Publishing accumulated follow-ups (2026-10-21)

- Owner explicitly requests pushing and deploying all pending changes:
  D-371 keyword brackets, D-373 material rules (superseding D-372), and
  removal of the redundant Play Event details button.
- Authority deployed with `npx supabase functions deploy game-operation
  --project-ref ohtfgwomdfteaxubndww --no-verify-jwt` after rebundling and
  server type-checking. `node tools\smoke_server_game.mjs --final-loot`
  passed21 hosted client/server reward-parity cases, exact persisted
  outcomes and idempotent retries. `--phase-zero` passed rules5, frozen gear,
  exact563 damage/55 Burn, unchanged holdings and checkpoint persistence.
  Disposable smoke identities/cascading records were removed.
- Prepublication validation: full6,145-test/198-file sequential run and
  production build passed; the subsequent button-only change passed its
  20-test targeted suite. Publication uses the existing main-branch Pages
  workflow, which reruns the complete test suite and configured build.
  Earlier local/unpublished labels below describe prepublication checkpoints.
- Initial Pages run39719090370 caught an obsolete activities-test assertion
  for the removed Event details route. Updated it to require no extra Events
  link while retaining actual Roses entry; no runtime behavior changed.
- The next run exposed the known5-second kit-catalog test timeout. Removed
  repeated identical full-Archive/Store/Inventory renders inside its25-entry
  assertion loop; every entry assertion remains, without raising timeouts.

## Removing redundant event-details navigation (2026-10-21)

- Removed the extra Event details button beneath the Crimson Roses activity
  in Play at the owner's request. The activity card, stage/entry controls,
  banner link and existing Events route remain.
- Validation: `npx vitest run src\presentation\activity-banner.test.ts
  src\presentation\ui-copy.test.ts --maxWorkers=2` passed20 tests across2
  files; `git diff --check` passed. Local/unpublished.

## Special-activity material parity (D-373; 2026-10-21)

- Owner selects Crimson Roses for exact elemental-dungeon material parity.
  Shared level-bracket ranges now drive guaranteed Rosethorn drops. AtLv80
  Seed/Bud/Bloom/Crest/Heart give20-25/12-15/8-10/5-6/2-3; Soul opensLv95
  (Stage10), giving25-30/16-20/12-15/8-10/5-6/2-3. Highest bracket stays
  capped throughLv140. Final boss retains5x quantities, not a second reward.
- Owner clarifies Soar/Delve must award only their three unique materials.
  Removed remaining Legendary/Omnic elemental bonuses as well as Crests;
  unique-item unlocks/rates/quantity curves are unchanged for current/legacy
  schedules. Validation rejects elemental/cross-mode/out-of-range materials.
  Existing holdings, elemental dungeons, currencies and captures remain.
- Updated event/Play/battle guidance and shared discovery tables. A small
  dependency-light `content/material-drops.ts` owns the shared ranges,
  avoiding a dungeon-art/combat import cycle. Dungeon results stay unchanged.
- Validation: `npx vitest run --maxWorkers=1 --reporter=json` with a
  session-local `--outputFile` passed **6,145 tests across198 files**, zero
  failed/pending cases. The two-worker attempt hit the previously observed
  Archive timeout; sequential validation passed without changing timeouts.
  `node tools\build_phase_zero_behavior_matrix.mjs` refreshed138 entries/
  726 scenarios from that report. `npm run build`,
  `node tools\bundle_server_game.mjs` and
  `npx tsc --project supabase\functions\game-operation\tsconfig.json`
  passed (existing mock-canvas/chunk-size advisories only).
- In-memory `node --input-type=module` smoke against the compiled authority
  verified final Heaven/Abyss25 each award exactly three unique stacks of15
  at minimum rolls, and Roses35 awards125/80/60/40/25/10. No live profile,
  credentials, saves or resources were touched. `git diff --check` passed.
- D-373 supersedes D-372 below. Local/unpublished; matching client/authority
  publication is still required for hosted rewards to change.

## Removing infusion Crest drops (D-372; 2026-10-21)

- Owner confirms removing only elemental Crest drops from Soar/Delve with no
  replacement. Removed Epic elemental bonuses from the shared loot table;
  Legendary/Omnic bonuses, specialties, currencies and captures remain.
- Current/legacy schedules and discovery loot use that same table. Reward
  persistence explicitly rejects Crest injection on ordinary/final floors,
  preserving the complete wallet on rejection. Existing owned Crests and
  elemental dungeon Crest drops remain unchanged.
- Updated Play/battle guidance and material contracts. Rebuilt the shared
  authority bundle with `node tools\bundle_server_game.mjs`.
- Validation: targeted `npx vitest run` covering infusions, loot-random,
  creatures, banner-and-lycalis, final-boss-loot, account, creature-loot-dialog,
  ui-copy, activity-banner and phase-zero-authority with `--maxWorkers=2`
  passed **136 tests across10 files**. Tests cover every floor/current and
  legacy schedule, discovery lists, retained dungeon rewards, exact remaining
  bonus rates/quantities, wallet preservation and injected-reward rejection.
  `npx tsc --project supabase\functions\game-operation\tsconfig.json`,
  `npm run build` and `git diff --check` passed. Existing mock-canvas and
  build chunk-size warnings are nonfatal.
- Local only; matching client/authority publication remains required before
  hosted rewards change. No account migrations, removals or grants.

## Consistent Conduit keyword brackets (D-371; 2026-10-21)

- Expanded the shared reference vocabulary to all ten stat names, targeting/
  action keywords, glossary terms, clocks, statuses and native resources.
  Matching handles case variants, longest phrases, existing brackets and
  possessives without changing numbers or authored capitalization.
- Conduit effect presentation explicitly formats prose even inside containers
  otherwise reserved for plain labels (`dd`, `small`, `span`, buttons).
  Ordinary/Master gear, Store, Inventory, Collections, upgrades, loot Details,
  character/captured equipment, upgrade confirmations and acquisition receipts
  use the same rules. Plain-text confirmations omit element medal HTML.
  Raw owner ability values, mechanics, account data and authority stay unchanged.
- Added upgrade-level keyword checks for all90 ordinary entries at+0..+5
  and fixed-rule checks for all48 Masters, plus the reported Siege Cantilever
  sentence and shared-surface/idempotence regressions.
- Validation: `npx vitest run --maxWorkers=2 --reporter=json` with a
  session-local `--outputFile` passed **6,141 tests across198 files**.
  `npm run build` passed TypeScript and Vite (existing chunk-size advisory).
  `node tools\build_phase_zero_behavior_matrix.mjs` against that passing
  report refreshed138 entries/726 numerical scenarios. Catalog generation
  preserved all138 raw runtime abilities; `git diff --check` passed.
  A local browser check confirmed Siege Cantilever Details at+0/+5 display
  `[All-enemy]`, `[Skills]` and `[Skill Power]` with45%/67.5% unchanged.
  Temporary preview stopped; no account data was edited.
- No publication requested in this follow-up; changes remain local until an
  explicit push/deployment request.

## Phase 0 coordinated activation and publication (D-370; 2026-10-21)

- Owner explicitly authorizes activation, push and deployment after validation.
  Shared `phaseZeroStatsReady=true`; the generated authority uses rules5.
  This supersedes the closed-gate status below.
- Historical rules4 Conduit-specific regression suites explicitly mock the
  old gate; current native/transaction/UI suites run with the production flag
  enabled. All138 current behaviors retain their separate numerical matrix.
- Activation corrected stale stat-only loadout summaries, bracketed ability
  search and upgrade guidance (+10% base benefit per level, fixed penalties/
  thresholds/costs/Duration). Current UI tests assert ten stats rather than
  legacy seven-stat layouts and authored native support snapshots.
- Release validation: `npx vitest run --maxWorkers=4 --reporter=json` with a
  session-local `--outputFile` passed **5,982 tests across197 files**, zero
  failures/pending. `node tools\build_phase_zero_behavior_matrix.mjs` against
  that report regenerated138 entries/726 numerical scenarios.
  `npm run build`, `npx tsc --project supabase\functions\game-operation\tsconfig.json`,
  `node --check tools\smoke_server_game.mjs` and `git diff --check` passed.
- Actual production-bundle smoke (no enabled-gate mock) verified rules5,
  frozen Causality +5 Power2.2,563 Skill1 direct damage/55 Burn, immutable
  inputs and historical rules4 reconstruction without stale action or
  holdings loss. Existing jsdom canvas/Vite chunk-size warnings are nonfatal.
- Authority deployed successfully with `npx supabase functions deploy
  game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`.
  `node tools\smoke_server_game.mjs --phase-zero` passed against the hosted
  function: exact damage/Burn, frozen gear after menu removal, idempotent
  request retry, checkpoint persistence, unchanged holdings and fresh-entry
  equipment. Disposable identities/cascading records were removed.
- Matching client publication uses the existing `Deploy Last Light` workflow
  on the main-branch push. Require its build/deploy jobs to succeed and verify
  the hosted version/assets before reporting release completion.
  No database migration, owner-account edits, refunds or resource grants.

## Phase 0 runtime verified, release gate OFF (D-368; 2026-10-21)

- Supersedes the earlier incomplete-roster accounting below. The
  [138-entry behavior matrix](conduit-behavior-matrix.md) now links executed
  numerical behavior checks for every entry:90 ordinary-slot entries with
  absent/+0..+5 cases and48 named Masters with equipped/absent cases,
  totaling726 passing matrix scenarios. The generator rejects missing or
  failing behavior cases; identity/text-reference counts are not evidence.
- Added actual missing Triage, Stormstep, Cinder and source-Shield reflection
  behavior. Removed stale Flora healing, Leviathan pooled healing, Atlas
  mitigation, Aurora critical suppression and Nerithe recovery bypass.
  Fixed wrong-action Master payoffs (Bliss Last Flare, Rosetta Skill2, Razor
  Skill1/Last Flare and Nerithe Last Flare). Master Nerithe retains Fold's
  native damage; Rosetta retains Quarry's native Shields.
- Generated Atmoso/Aurora/Thornia/Razor/Crinso Master follow-up Shields now have
  generated provenance and finite clocks. Interaction tests equip competing
  native-Shield procs and verify no reflection, extra Gauge, Power or Defense
  chains. Original native Seeds/traps/Cyclones/Foundations keep their identity.
- Manual Recall/Revenge/trap packets receive action/target modifiers and enter
  the damage receipt once. Stored Burn/durability/release values are not
  Power-scaled again. Added direct cross-effect damage/healing assertions.
- Conditional Defense/Direct Attack/Critical Damage join their pre-equipment
  base pools. Enemy Defense reductions sum with a50% cap, followed by up to75%
  skill ignore. Duplicate auras use their strongest living instance; repeated
  Ward Gauge receipts and Foundation absorption do not multiply. Atlas and
  Leviathan count one enemy Attack Action, not its individual impacts, and
  rounded grants cannot exceed their upgraded per-turn Gauge budgets.
- All138 default descriptions preserve the complete owner-authored text.
  Fixed multiline intake truncation of Horizon Heartcase. All90 ordinary
  descriptions have explicit +0..+5 benefit policies; thresholds, costs,
  penalties, fixed caps and whole-turn Duration stay fixed. Calamitic APIs
  share this renderer; Masters reject positive upgrade levels.
- Target-dependent UI/payment/authority checks, frozen equipment, two-turn
  token clocks, native support snapshots, rescue/action limits and the20%
  non-Defense mitigation floor remain covered. Authority tests also check
  rules4-to5 encounter reconstruction without executing a stale action or
  rewriting saved holdings.
- Final validation: `npx vitest run --maxWorkers=4 --reporter=json` with a
  session-local `--outputFile` passed **5,982 tests across197 files**, with
  zero failures or pending tests. `node tools\build_phase_zero_behavior_matrix.mjs`
  against that report regenerated all138 entries and726 numerical scenarios.
  The matrix source hash identifies the exact tested runtime/test inputs.
- `npm run build` passed TypeScript checking and the317-module Vite build.
  `git diff --check` and `node --check` for the three Conduit generators
  passed. Existing jsdom canvas warnings, Git line-ending notices and the
  Vite large-chunk advisory are nonfatal.
- `node --input-type=module` compiled-authority smoke passed for both the
  actual rules4 bundle and an enabled rules5 bundle built only in memory:
  bootstrap, Training entry/action, immutable operation inputs and frozen
  equipment. Enabled Causality +5 retained2.2 Power after removing menu gear
  and dealt563 direct Skill1 damage at100 Attack/zero enemy Defense. A stale
  rules4 encounter rebuilt to rules5 without applying its action, changing
  saved holdings or losing frozen equipment. No release flag was changed.
- Release remains deliberately OFF (`phaseZeroStatsReady=false`, rules4).
  This completes the requested enabled-gate implementation/verification work,
  not publication or a claim of optimal squad balance. No commit, push,
  deployment, account migration, resource grant or save rewrite. A coordinated
  client/authority activation remains a separate release operation.

### Superseded implementation notes

The following intermediate results are historical, not current blockers.

- Owner authorizes full implementation of all138 current catalog abilities.
  Preserve account holdings/IDs/eligibility, existing upgrade levels/costs and
  existing growth for Health/Defense/Direct Attack/critical/capacity.
  New defaults: Skill Power1, Skill Duration0, Skill Efficiency0, Gauge Gain1;
  no level growth for these four. Upgrade scaling delegated to implementation.
- Found Pale's unfinished `______` while checking the actual current file.
  Owner requests rework; target now grants Shield recipients +25% Skill Power
  for damaging skills. Latest owner edits, including Cathedral's additional
  +30% squad Skill Power, remain authoritative over older summaries.
- Added `src/content/phase-zero-contract.test.ts`: each of the138 approved
  entries maps to a stable ordinary/Master identity and existing eligibility.
  Checks counts/order, completed effects, percentage Gauge convention and
  latest explicit revisions. These tests DO NOT verify runtime effects.
- Added isolated `src/content/phase-zero-conduit-stats.ts` static-bonus
  calculation for20 items, including all10 Commons. Add against base values,
  preserve fractional stats and critical overflow, validate slots/upgrades.
  Positive scalar benefits grow10% of base per upgrade; penalties and whole
  Duration turns stay fixed. `applyConduitBuffs` now selects this calculator
  only when `phaseZeroStatsReady=true`, replacing rather than adding legacy
  bonuses. The gate remains false, so current live equipment is unchanged.
  Conditional effects and squad auras must NOT be mistaken for static stats.
  Shared cost/Gauge helpers now cover additive Efficiency, one final upward
  cost rounding with50% cap/skill floors, and recipient-capacity percentage
  Gauge offers with one Gain multiplication/rounding. These are not live hooks.
- Added the gated ten-stat schema/readout foundation:
  `src/content/phase-zero-stats.ts`, resolved owned/captured/enemy types and
  shared `src/presentation/stat-preview.ts`. Team/Home/Archives, upgrades and
  equipment share the new readout formatting, but `phaseZeroStatsReady=false`
  preserves current legacy readouts and equipment math until activation.
  Legacy `elementalDamage` compatibility, growth, account data and costs remain.
  Foundation-only typecheck passed (`npx tsc --noEmit`); this predates the
  in-progress full Conduit runtime work and is not its validation.
- `npx vitest run src\content\phase-zero-contract.test.ts src\content\phase-zero-conduit-stats.test.ts --maxWorkers=2 --reporter=dot`
  passes262 tests across2 files (141 contract +121 static-stat/cost/Gauge checks).
- Combined foundation verification:
  `npx vitest run src\content\phase-zero-contract.test.ts src\content\phase-zero-conduit-stats.test.ts src\content\phase-zero-stats.test.ts src\presentation\phase-zero-readouts.test.ts --maxWorkers=2 --reporter=dot`
  passes286 tests across4 files. This still does not validate the unfinished
  dynamic Conduit replacement or authorize activation.
- Subsequent gated equipment integration verification:
  `npx vitest run src\content\phase-zero-contract.test.ts src\content\phase-zero-conduit-stats.test.ts src\content\phase-zero-equipment-integration.test.ts src\content\phase-zero-stats.test.ts src\presentation\phase-zero-readouts.test.ts src\presentation\phase-zero-release-gate.test.ts --maxWorkers=2 --reporter=dot`
  passes291 tests across6 files; `npx tsc --noEmit` passes. Adds enabled-gate
  tests proving replacement static math, saved-upgrade preservation and
  unequipped defaults without touching legacy Burn. Negative Efficiency stays
  negative rather than silently becoming a zero discount.
- Broader verification while runtime work is still incomplete:
  `npx vitest run --maxWorkers=2 --reporter=dot` passed4491/4498 tests in
  185/189 files. Two native snapshot regressions (Flora Seeds and Razor stance
  extra fields) require gate-safety correction; five presentation timeouts
  passed on the focused rerun
  `npx vitest run src\presentation\archives-controls.test.ts src\presentation\inventory.test.ts --maxWorkers=1 --reporter=dot`
  (19/19). `npm run build` passed TypeScript/Vite with the existing large-chunk
  advisory. None of these results establishes all138 runtime effects complete.
- Remaining before activation: all138 effect behavior checks (equipped/
  absent/+0..+5 where applicable), full dynamic/native hooks, duration/cost/
  Gauge receipt integration, release-version/session compatibility, UI and
  authoritative bundle parity, full regression/build and rollout validation.
  Existing live Conduit behavior is deliberately retained until complete.
  No deployment, schema migration, resource grant or save rewrite occurred.

- Aegis follow-up (2026-10-21): owner questions expiry-based effect and requests
  rework. Aegis now grants its bearer +25% Defense for the next Enemy Turn
  when Shielding another ally with a skill. No Shield-expiry prerequisite;
  no change to native Shield durations or live gameplay.
- Aegis wording clarified: the trigger is your skill giving another ally
  a Shield; the Defense bonus goes to you and ends after the next Enemy Turn.

- Latest empty-ability pass (2026-10-21): filled the seven owner-cleared entries
  Aegis, Duplex, Opal, Twinpulse, Execution, Meridian and Verdict with new
  proposals. Shield-expiry Gauge, healing self-sustain, debuff skill potency,
  paired Normal Attack Gauge, critical finishing, healing-to-Gauge and
  closing-action skill potency respectively. Percentage Gauge convention
  retained; other completed entries unchanged. Document-only.

- Latest Cathedral revision (2026-10-21): owner requests another redesign after
  clearing its ability. Proposed replacement: all living allies gain +25%
  Skill Efficiency while the bearer lives. Replaces the partner-link design;
  document-only, other owner edits and blank entries preserved.

## Percentage Gauge grants and final Calamitic edits (D-367; 2026-10-21)

- Owner accepts the designs with further explicit revisions: Causality gives
  +80% Skill Power and removes the bearer's Last Flare recovery. World-Eater
  gives +2 turns Skill Duration and heals each living ally for10% of total
  damage dealt by the bearer's damaging skill. Removed its previous8%-HP
  healing and once-per-turn restriction; no replacement cap invented.
- All positive flat Conduit Gauge grants become the same numeric percentage
  of each recipient's own maximum Gauge Capacity before Gauge Gain scaling.
  Converted Griffin's ratio and cap to capacity percentages as well.
  Existing owner-edited percentage grants remain intact. Zero Gauge on
  revival, costs and held-Gauge thresholds are not positive grants and stay.
- Catalog header defines the percentage convention. Still document-only;
  runtime effects, recovery, saves and economy are unchanged.

## Simpler Calamitic follow-up (D-366; 2026-10-21)

- Owner requests simpler Causality/World-Eater and replaces Throne's
  once-per-Battle restriction with once per player turn per character.
- Causality now grants living allies20% Direct Damage reduction while its
  bearer lives. World-Eater's damaging skills heal all living allies for8%
  of their own maximum HP, once per player turn. No debt or damage reserve.
- Throne's Last Flare grants an extra Skill1/2 to already-acted other allies,
  once per recipient per player turn; recovery and the shared no-extra-action
  chaining/one-granted-action-per-character-per-turn rules remain.
- Supersedes these three D-364 designs only. Still document-only proposals.

## Legendary usefulness follow-up (D-365; 2026-10-21)

- Owner permits reworking Legendary effects that are redundant or out of place.
  Reviewed all15; revised Citadel Spine (personal Defense plus protection for
  injured allies), Immortal Vessel (Health and shared effective healing),
  Pale Bulwark Diadem (Shield recipients gain Direct Attack while healthy)
  and Starvein Conductor (HP-paid damaging-skill power, no Burn prerequisite).
- Retained the other11 distinct build roles, including simple critical
  specialization, finishers, damage-to-Shield, boss AoE specialization,
  burst protection, rescue and noncritical Normal Attack builds.
- This supersedes D-364's preservation of these four Legendary entries only.
  Common/Rare and all other abilities, names, elements and order stay unchanged.
  No gameplay implementation or tested balance claim; new values await review.

## Squad-focused Conduit proposal revision (D-364; 2026-10-21)

- Owner clarifies these are new stats, not a request to retain old Conduit
  mechanics with renamed terms. Requests useful squad interactions and simpler
  Calamitics. Explicitly preserves Common and owner-edited Rare/Legendary
  effects; Masters stay character-specific with improved squad synergy.
- Preserved all40 latest Common/Rare/Legendary ability texts exactly, including
  owner edits to Spearwheel, Springwell, Citadel, Granite, Horizon, Judgment
  and Nullsong. Redesigned all45 ordinary Omnic,48 Masters and5 Calamitics.
  Names, rarity, order, elemental restrictions and bearer assignments unchanged.
- Masters checked against current `native-identities.ts`: Seeds, Cyclone/Gust,
  Shuriken, action-order bonuses, Cover, Instructions, Seal, Wounds, Quarry,
  traps, Combo, Survey, Foundation and Beat. No invented replacement kits.
  Ordinary effects cover offensive/support relays, varied-element squads,
  defensive builds, Gauge batteries, debuff setups, healing and recovery.
- Calamitics: skill-power/efficiency partner link, squad damage deferral,
  Defense/Shield penetration, once-per-Battle squad extra actions and a
  shared-damage retaliation reserve. No multi-step Equation puzzle, recurring
  turn loan or healing-stat side effect on debt.
- Shared proposal rules define token expiry, source/trigger exclusions,
  snapshot/cost timing, bounded Defense reductions/ignore, native Master
  identity, aura lifetimes, debt non-duplication and simultaneous Shields.
  Descriptions contain abilities rather than explanations of unchanged stats.
- Verified with read-only `node -` assertions against the pre-revision snapshot:
  all40 preserved ability texts identical; all98 remaining effects changed;
  all138 names/rarities/elements/order preserved; distinct, nonempty abilities;
  all98 new descriptions at most45 words. Additional structural checks and
  `git diff --check` cover final text. No gameplay tests or build for this
  document-only revision.
- All new values, practical usefulness and balance remain unverified proposals
  for owner review. No runtime, saves, upgrade scaling, deployment or economy
  changes; implementation requires separate approval.

## Phase 0 stat and Conduit design proposal (D-363; 2026-10-21)

- `docs/conduit-catalog.txt` now proposes base effects for all138 Conduits grouped
  Common10/Rare15/Legendary15/Omnic93/Calamitic5, alphabetically within each.
  Omnic includes45 ordinary plus48 named Masters, not a new Master rarity.
- Name, rarity, element and proposed ability text included. Ordinary abilities
  show only base (unupgraded) descriptions at the owner's request; Masters are fixed.
  Existing elements are authoritative; Masters use their bearer's element.
  Universal45 receive explicitly editorial thematic suggestions, never new
  equipment restrictions or approved content changes.
- Initially generated from live resolvers, then owner-edited and redesigned.
  DO NOT regenerate over the owner's edits. It is no longer a live-effect snapshot.
- Owner explicitly chooses design-only review before implementation and includes
  ordinary, Master and Calamitic entries. Preserve all owner-edited effects,
  fill the blank Breach Pendulum and redesign remaining entries; Common stats
  stay basic, higher rarities gain specialized interactions and trade-offs.
- Ten requested stats: Health, Defense, Direct Attack, Critical Damage Multiplier,
  Critical Rate, Skill Power, Skill Duration, Skill Efficiency, Elemental Gauge
  Capacity and Elemental Gauge Gain. Owner chooses Skill Power instead of
  Elemental Damage and delegates duration design with a whole-turn preference.
  Aegis's percentage duration becomes +1 Shield turn; other edited examples
  retain their numbers, with terminology normalized.
- Header defines proposed additive scaling, cost/duration limits, trigger clocks,
  no recursive procs, bounded actions and shared rescue limits.
  These interpretations, all new values and safeguards await owner review.
- Owner requests ability-only descriptions: removed explanatory asides about
  unchanged stats, ordinary scaling and build intent. Keep actual effects,
  conditions, costs and limits; shared design rules remain in the header.
- Owner subsequently emptied nine abilities and requests unique replacements:
  Breach Pendulum, Duplex Heart, Glassroot Gimbal, Opal Indexer, Sentinel
  Aperture, Twinpulse Bellows, Wardglass Transformer, Immortal Vessel and
  Meridian Inverter. Filled only those entries with new design proposals;
  removed the obsolete header interpretation of the previous Duplex effect.
- Follow-up: Breach now gives Normal Attack +40% Critical Damage Multiplier
  against enemies above75% HP. Twinpulse triggers on every Normal Attack;
  owner confirms each delayed pulse grants8% of maximum Gauge Capacity,
  rather than a flat8 Gauge. Still document-only proposals.
- Remaining: owner review, any revisions, then separately authorized runtime
  stat/schema/UI/combat/Conduit implementation and migration/upgrade design.
  No implementation, deployment, save, equipment, art or economy change here.
  Indexed from `docs/README.md`.
- Verified: read-only `node --input-type=module -` assertions passed138 complete
  unique entries, rarity totals, alphabetical order, all138 live names/rarities/
  elements,48 Master bearer restrictions,16 owner-example checks, base-only
  labels and proposed stat terminology. Vite SSR loaded metadata only; the
  historical exporter was not run. `git diff --check` passed. Gameplay tests/
  build are not applicable to this text-only pass.

## Online additive evolution request fix (D-362)

- Reported Infernis Evo.5->6 selection4+4+4+3 correctly totals15 Evolution
  Value. Server `validateRequest` mistakenly shared the squad's3-ID ceiling
  with `fodderIds`, rejecting before account validation.
- Split limits: squad `ids` stays3; evolution `fodderIds` accepts15, enough
  for the maximum valid recipe using all form1 copies. String type/length
  checks remain; account unique/owned/mode/protection/value/cost/stale-state
  checks and one-write atomicity are unchanged. No saves or recipes changed.
- Added authoritative request-to-transaction tests for exact reported mix,
  fifteen form1 Heaven/Abyss/Rose copies, exact spending/consumption/stale
  retry, squad4 rejection, fodder16 rejection and malformed IDs.
  Hosted `--evolution` smoke reproduces reported4-copy evolution on a
  disposable identity, exact spending, persistence and idempotent retry.
- Verified: `npx vitest run src\online\server-game.test.ts src\game\evolution-fodder.test.ts src\game\crimson-roses.test.ts --maxWorkers=4 --reporter=dot`
  passed177 tests across3 files. `npm run build` passed typecheck and production
  build (existing chunk-size warning). `node tools\bundle_server_game.mjs`
  regenerated matching request validation; `npx supabase functions deploy game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`
  succeeded. `node tools\smoke_server_game.mjs --evolution` passed the exact
  reported Infernis4+4+4+3 evolution online, spending4800 Prismatica/required
  materials and consuming four copies once, idempotent retry and persisted
  account. Fixture has prior First Fracture claimed, matching an evolved account;
  disposable identity and cascading records removed. Client assets are unchanged;
  normal Pages publication on push also validates the repository.

## Guaranteed Sanctuary income and linear premium sales (D-361)

- Owner chooses guaranteed1 Null-Prismatica per kill at Stage1/Lv65, rising
  by `round(1+4*(level-65)/55)` to5 at Lv120. Existing final-boss5x makes25
  guaranteed at Stage25. Premium RNG still draws once per kill; other seeds,
  ordinary Prismatica, capture chances and Soar/Delve/Treasury are unchanged.
- Sales Common->Omnic: Prismatica150/300/1000/3000/10000/30000 plus
  Null-Prismatica5/10/15/20/25/30, both in one protected atomic transaction.
  Owner explicitly preserves higher-tier Prismatica; D-0751-10 cap superseded.
- Shared `sanctuaryLycalisOdds`/`sanctuarySalePrices` feed rewards, validation,
  activity/loot/archive/sale displays and server. `saveAccountRewards` rejects
  omitted guaranteed Sanctuary premium. Activity/battle help copy updated.
- Tests cover all25 stages, both direct/Burn kills, every integer level's
  RNG boundaries and yield above Soar/Delve expectation, both RNG seed extremes,
  exact protected sales, missing/forged premium, atomic rewards/receipts,
  authoritative early/mid/final drops and all six sale tiers. No save migration
  or retroactive grant.
- Verified: `npx vitest run --maxWorkers=4 --reporter=dot` passed4147 tests
  across182 files; final focused server/Sanctuary/integrated-economy/menu-info
  run passed99 tests across4 files. `npm run build` passed typecheck and
  production build (existing chunk-size warning). `node tools\bundle_server_game.mjs`
  regenerated the server; `npx supabase functions deploy game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`
  succeeded. `node tools\smoke_server_game.mjs --final-loot` passed21 hosted
  activity/stage parity, persistence and idempotency cases including Sanctuary's
  final guaranteed25; disposable identities/records removed. Early farm
  payouts and all six sale tiers are tested through the local authoritative
  engine. Client publication uses the normal Pages workflow on push.

## Heart before Soul in Rose evolution (D-360)

- Owner confirms scope: Rosetta, Thornia and Crinso Evo.4->5 cost25 Bloom,
  10 Crest and5 Heart of Rosethorn (was5 Soul). Evo.5->6 stays25 Crest,
  10 Heart and10 Soul. Prismatica/fodder, all leveling costs, ordinary
  Heaven/Abyss specialty recipes, loot and saves remain unchanged.
- `characterEvolutionCost` selects the surcharge tier from the current
  evolution (4=Heart,5=Soul), shared by previews, confirmation and atomic
  offline/server transactions. No account migration or retroactive refund.
- Tests cover exact late-stage recipes for all three Roses, rendered
  Heart/no-Soul Evo.4->5 costs, exact one-write spending and fodder consumption,
  missing-material rejection with unchanged raw saves, authoritative parity,
  ordinary recipe preservation and unchanged leveling Soul surcharges.
- Verified: `npx vitest run src\game\crimson-roses.test.ts src\online\server-game.test.ts src\content\progression.test.ts src\game\evolution-fodder.test.ts src\game\max-level.test.ts --maxWorkers=4 --reporter=dot`
  passed183 tests across5 files. `npm run build` passed typecheck and production
  build (existing chunk-size warning). `node tools\bundle_server_game.mjs`
  refreshed the server recipe; `npx supabase functions deploy game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`
  succeeded. `node tools\smoke_server_game.mjs --native-calamity` passed and
  removed disposable records. Exact recipe transactions are covered locally
  through the authoritative engine; hosted smoke is general engine health.
  Client publication follows through the normal Pages workflow on push.

## Equipped Conduit verification (D-359)

- Audited90 ordinary-slot Conduits (85 plus5 Calamitic) and48 named Masters.
  Existing all-catalog positive/negative and snapshot tests are supplemented
  by31 real-action/stat regressions in `src/game/conduit-integration.test.ts`.
- Fixed Critical Rate slot-order clamping, full Tailwind spending, Iris/Tempered
  stored Burn duration, accepted weaker Burn refresh resetting Cinder streak,
  Charted accepting another ally's Normal Attack, and Razor parrying only the
  first scheduled skill per Enemy Turn (all its impacts, not later activations).
- Owner confirms Eclipse Mantle applies to Normal Attack. Bruno's inert
  Attack-to-Defense Master instead repairs his support-only Last Flare:
  Shield=max(200% effective Defense,20% maxHP), same40% Cover/two-phase duration.
- Disciple assist uses recipient Attack and applicable buffs, not Disciple's.
  Owner retains two EXTRA Instruction expiration rounds and next-action
  consumption. Corrected descriptions, no new mechanics for these two Masters.
- Falcon Sight already worked for actual native/captured Normal Attack
  criticals; tests confirm rather than change it. Ownership, upgrades, frozen
  equipment, RNG, rewards and saves remain unchanged.
- Replaced the hosted `--masters` smoke's retired Atmoso critical-proc fixture
  with his current all-enemy70% Normal Attack, exact one-time Gauge gain and
  no self-Cyclone. Keeps a second ready ally so automatic enemy hits cannot
  contaminate the action's Gauge measurement. Both equipped/unequipped local
  action tests also confirm the current Master effect.
- Verified: `npx tsc --noEmit -p .` passed;
  `npx vitest run --maxWorkers=4 --reporter=dot` passed4129 tests in182 files;
  `npm run build` passed (existing chunk-size warning).
  `node tools\bundle_server_game.mjs` regenerated the matching server bundle;
  `npx supabase functions deploy game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`
  deployed successfully. `node tools\smoke_server_game.mjs --native-calamity`
  and `node tools\smoke_server_game.mjs --masters` passed; disposable identities
  and cascading records were removed. Matching client publication uses the
  normal Pages workflow on push; no encounter-rules/save migration required.

## Collapsed Conduit lore (D-358)

- Shared `conduitLore` in `presentation/conduit-store.ts` puts lore behind a
  closed native Lore disclosure across Store, Upgrade, Archive and loadout
  Details, including Masters. Ability effects and restrictions stay visible.
- Preserves `.conduit-lore` for Archive search, keyboard interaction,44px
  targets and dialog Escape/focus behavior. No combat, rewards or save changes.
- Validation: all-catalog disclosure coverage in conduit-store, loadout dialog
  regression and existing Archive search/Master rules suites.
- Verified: `npx vitest run --maxWorkers=4 --reporter=dot` passed all4098
  tests across181 files; `npm run build` passed (existing chunk-size warning).
  Browser check confirmed hidden-by-default lore, expand/collapse and a44px
  summary with no horizontal overflow at the browser's488px narrow viewport.
  `node tools\bundle_server_game.mjs` left the server bundle unchanged, so
  no server redeploy or gameplay migration is needed.

## Elemental Gauge rename and X-5 material drop rule (D-357)

- All visible text/docs say [Elemental Gauge]; internal `shatter*` fields/IDs unchanged.
- `materialDropLevel` (activities.ts): rarity first needed at Lv0/30/45/60/75/90, dropped from enemy Lv+5.
  Dungeon `materialBrackets` derive first floors from it (1/1/6/12/19/25); Roses unlocks max(80, drop level).
  Leveling tiers in progression.ts derive from the same table. Owner scope: ONLY elemental dungeons and
  the Roses event. Heaven/Abyss bonus unlocks stay 80/100/115 and Story loot is unchanged;
  Calamity/Training/Machines unchanged.
- Validate: dungeons/loot-random/story/crimson-roses/auto-turn/battle-loot tests plus full suite.

## Elemental Gauge terminology and Conduit details (D-356)

- Conduit descriptions (redesign + Calamitic) bracket [Elemental Gauge], [Shield(s)], [Bonus Strike(s)]
  and [Elemental Crit]. Visible stat label is "Elemental Gauge capacity"; battle cards, gesture labels,
  tips and Conduit battle messages say Elemental Gauge. Information prose maps bare Gauge to [Elemental Gauge].
- Conduit loadout detail dialog drops Stat bonuses/Complete effect/Equipment rules/Origin headers:
  only "Conduit Ability" with the live rule, an Omnic restriction line and plain lore. Master dialog
  drops "Triggers and limits as stated above". Internal IDs/saves/mechanics unchanged.

## Griffin Turbine damage-scaled Gauge (D-355)

- Owner found flat 3 -> 6 ally Gauge too weak. Now: when your [Normal Attack] damages HP,
  each other ally gains round(15% -> 30% x HP damage / your Attack x 100) Gauge, up to 25 each.
  Measured late-benchmark Normal Attacks average ~0.43x Attack (crits ~0.85x), so typical
  gains are ~6 -> 13 Gauge (crits ~13 -> 25). The 25 limit stops stacked damage bonuses
  filling a team's Gauge from one hit.
- `conduit-runtime.ts` (`finishConduitAction`), `conduit-redesign.ts` description/range,
  roster test and Conduit docs updated.

## Conduit Archive search (D-354)

- `presentation/archives.ts`: `conduitArchive` adds a filter bar (Search, Search in
  scope, Rarity, Ownership, Reset, result count); `bindConduitFilters` indexes each card
  once from its name, current/+5 effects, bracketed ability terms and `.conduit-lore`.
- `conduit-store.ts` tags lore/power paragraphs `conduit-lore` (also used by Store/Upgrade
  details; no visual change). Styling in `archives.css`.
- Tests: `archives-controls.test.ts` covers every scope, rarity/ownership, Master and Reset.
  Headless screenshots at 1440px and 390px showed no overflow and 44px controls.

## Endgame Conduit trims (D-353)

- Method: the late benchmark squad (`enemy-progression.test.ts` loadout, +5, Lv105 Evo6)
  played 120 independent seeds against the Roses final stage and the War stage-10 bosses,
  with one Conduit swapped into a member's slot 6. The baseline loadout wins 11/120.
- Trimmed in `conduit-runtime.ts` and `conduit-redesign.ts`: Starvein Conductor [Burn]
  bonus 40->80% to 30->60% (24 -> 17 wins); Granite Hourglass shield 30->60% to 20->40%
  (44 -> 18); Coilfeed Ratchet discount 8->16% to 7->14% (10 -> 8, owner-requested slight trim).
- Unchanged: Reserve Torque (within noise). Worldbreaker Drive wins 26/120 regardless of its
  [Last Flare] bonus (also at zero), so its numbers are not the cause; flagged, not changed.
  Causality Funeral Engine (Calamitic, apex tier) was left alone.
- The benchmark's sprout slot uses Coilfeed again; walls stay unbeaten.
- Validation: targeted Conduit/progression suites, the full suite and the build.

## Machines Conduit overlap audit (D-352)

- Analysis and kept-pair reasons: [machines-conduit-audit.md](machines-conduit-audit.md).
- `conduit-runtime.ts`: Breach full-HP bonus in `conduitHitModifiers`; Stasis compresses
  the part of one hit above 20% max HP (no rescue/shield); Faultkeeper Defense aura in
  `effectiveDefense`; Pyre Census per-burning-enemy and Ruinselect missing-HP bonuses in
  `prepareConduitAction`; Iris extends own [Burn] per [Infernic Embers] spent; `solaceCost()`
  (10 -> 5, no damage reduction). Nightglass marks consumed by Normal Attack only.
- `conduits.ts`: Astral (+crit/-Defense, overflow to Elemental Crit), Citadel (-crit), Heartcase
  `buffs: []`. `native-kits.ts` Graft coefficient .5 -> 1.
- Balance: `enemy-progression.test.ts` late benchmark swaps Heartcase for Stasis Reliquary
  (Heartcase lost an undocumented +70% HP at +5); all clear/lose expectations unchanged.
- Validation: tsc, `npx vitest run --maxWorkers=4` (4096 pass), `npm run build`. Server redeployed.

## Ten replacement Conduit effects live (D-351)

- `conduit-runtime.ts`: Fieldbrace sets `fieldbraceRound` on Shield break and heals in
  `conduitTurnStart`; `nativeGauge` adds Reserve Torque (Conduit-sourced Gauge passes
  `conduit = true`); Twinpulse fills Gauge in `initializeConduits` and `battle.ts` `nextStage`;
  Coilfeed cuts every ability cost in `conduitActionCost`; Glassroot adds damage per 10 Gauge
  held in `prepareConduitAction`; Heartcase saves in `rescue()` with `heartcaseSaves` escalation;
  Ward Loom tags its Shield layers with `healBonus` read by `healingReceived`; Worldgrove's
  `allyFell` runs on ally death (direct and routed); Firstlight reduces damage while
  `firstlightRound` matches the first Enemy Turn.
- Resonance: `battle.ts` passes overkill to `recordConduitHit`; `finishConduitAction` strikes the
  healthiest other enemy. Descriptions/ranges edited directly in `conduit-redesign.ts` (do not
  rerun `build_conduit_redesign.mjs`; its markdown source is stale). Server bundle redeployed.
- Validation: `npx tsc --noEmit -p .`, `npx vitest run --maxWorkers=4`, `npm run build`.

## No-immortality Conduit audit and Master silhouettes (D-350)

- `conduit-runtime.ts`: `master-tide-1` zero-spill guarded per ally (`tideGuard:<id>`); Windveil
  (`pressurecrest-governor`) holds one (`windveil = 1`) and skips the Enemy Turn right after a
  dodge (`windveilRound`); Undertide (`undertide:<owner>`) and non-native Master Razor-3
  (`silenced:<owner>`) apply once per enemy. Descriptions updated in `conduit-redesign.ts`.
- Kept: Funeral Engine (debt still lands), Thornia-3 guardian (Thornia can fall), finite shields,
  native Rootbind/Razor guards, and the D-349 first-time-each-Battle death-cheat limits.
- `archives.ts`/`archives.css`: Master cards get `archive-conduit-locked` unless owned; the
  silhouette filter now also targets `.master-art`. Server bundle redeployed.
- Validation: `npx tsc --noEmit -p .`, `npx vitest run --maxWorkers=4`, `npm run build`.

## Death-cheat caps and Conduit replacement proposal (D-349)

- `conduit-runtime.ts` guards Stasis (`stasisUsed`), Phoenix (`phoenixUsed`), Accord
  (`accordGranted` on the recipient) and `master-sprout-3` (`worldseedRevived`, set only when
  someone was revived). Flags live in per-Battle `conduitRuntime`, so each stage/wave resets them.
  Descriptions say "The first time each Battle". Server bundle redeployed.
- `docs/conduit-replacements.md`: ten replacements for redundant effects (Gauge gain %,
  starting Gauge, ability cost %, Gauge-as-HP, Shield-break heal, overkill, healing received, ally
  death, opening Enemy Turn). Implemented in D-351.
- Validation: `npx tsc --noEmit -p .`, `npx vitest run --maxWorkers=4`, `npm run build`.

## Concise information panels with element medals (D-348)

- `bracketReferences` (reference-text.ts) adds the element medal + [Element] to element names
  in information prose and brackets medal labels already there; thematic status names (Infernic
  Embers etc.) stay whole. Inline medal sizing lives in element-label.css for
  `.information-content`, `.information-topic` and `.battle-help`.
- Rules/tutorial copy shortened across Gameplay topics, Help drawer, Inventory, Character,
  Collections, Squad, Summon rates, Conduit Store/Upgrade, Settings, Story, Roses, battle help
  and content rule constants (story, machines, masters, war, components, final-boss, Treasury).
  All numbers and restrictions retained; lore text unchanged. Server bundle regenerated/redeployed
  (text constants only).
- Validation: `npx tsc --noEmit -p .`, `npx vitest run --maxWorkers=4` (4087 pass), `npm run build`.

## 20-stage Story regions (D-347)

- `storyStageLayout` is 20/120 (previous 18/108, legacy 25/150); levels still Lv.1-55
  with unchanged per-region ranges, bosses every 20th stage. UI text derives from
  `storyRules`. Wallet v8: v6-v7 `storyCompleted` remaps via `migratePreviousStoryCompleted`
  (no clear lost; newly credited stages pay the first-clear 150/2 once); pre-v6 maps
  25 -> 20 directly with the D-340 credit. Read-only until the first save. Server
  discards pre-v8 runs; bundle redeployed. Smoke script stage values refreshed
  (also the D-346 Machines 75 / Heaven-Abyss 25 finals).
- Validation: `npx tsc --noEmit -p .`, `npx vitest run --maxWorkers=4` (4086 pass),
  `npm run build`.

## Shorter Machines/Heaven/Abyss and additive fodder (D-346)

- `content/activities.ts`: `machineStageCount` 75, `infusionModeStageCount` 25,
  `migrateLegacyActivityStage`; `evolutionRequirement().fodderValue` 3/8/15.
  `content/infusions.ts` samples the 35-stage level anchors proportionally;
  `machineRules.omnicStage` 56. Wallet v7 in `game/account.ts` migrates saved
  unlocks and (`character-instances.ts` `migrateLegacyCapturedCopies`) captured
  copies read-only. `fodderSelectionStatus` drives the value-based picker
  (`hub.ts`) and `upgradeCharacter`. Server discards pre-v7 runs; bundle redeployed.

## Large focal battle sprites (D-345)

- `presentation/battle-mono.css` sizes `.battle-art` from a larger arena-relative
  base with compressed per-artwork scale, no percentage width cap and vertical
  overlap; `battle-squad-art.test.ts` asserts it. `animation-preview.html` no
  longer overrides desktop art width. CSS only, no server redeploy.

## Evolution fodder picker wording (D-344)

- `presentation/hub.ts` evolution panel lists only captures from the required
  activity by name (no Copy/Form ids) and names accepted forms as [Name];
  reasons/errors in `game/account.ts` and the `main.ts` confirm use [Name]. Server
  bundle regenerated and redeployed.

## Story replay clear pays Prismatica only (D-343)

- `storyClearReward(firstClear)` in `content/story.ts`: first clear 150 Prismatica
  + 2 Null-Prismatica, replays 150 Prismatica. Used by `saveAccountRewards`,
  the Story stage detail and Detailed Loot. Server bundle regenerated and
  `game-operation` redeployed.

## Detailed Loot stage previews (D-342)

- `presentation/stage-loot.ts` builds per-stage loot from the live drop tables:
  per-enemy drops, captures (not Machines; Roses ≤Lv.120), War final
  recruitment, Story stage-clear and first-clear rewards. The modal is an
  unbiased overview: art and names only, grouped (Currencies, Materials,
  Conduits by rarity, Items, Elemental-Devourers, Element-Bearers, Stage clear,
  First clear). No rates, amounts or roll rules; the enemy codex covers those.
- Each option of `[data-dungeon-stage]`, `[data-infusion-stage]` and
  `[data-war-stage]` pickers gets its own sibling Detailed Loot button
  (`.selection-option-row`); `bindStageLoot` listens on `document` because the
  selection dialog lives on `body`. Drop-art strips and the standalone button
  beside each stage selector were removed (Story's stage detail keeps its own).
  The loot modal fills the whole viewport.
- Validate `npx vitest run src/presentation/stage-loot.test.ts`.

## Compressed art and quieter image loading (D-341)

- All 705 runtime PNGs have committed AVIF siblings (q90 4:4:4) plus 384px
  thumbnails for character/enemy/profile art: 322.6 MB -> 94.3 MB (+19 MB
  thumbs). `assetUrl` serves AVIF; PNGs remain canonical and the fallback.
- `artwork-loading.ts`: silent AVIF->PNG fallback, one automatic retry, then
  the Retry button; lazy portraits get a thumbnail `srcset`. The image-error
  toast in `main.ts` is removed.
- Art intakes must run `npm run art:avif` and commit outputs; the freshness
  test in `image-format.test.ts` enforces it. See
  [art workflow](art-workflow.md#compressed-avif-runtime-art-d-341).
- Verified: headless Chrome home screen loads 0 broken images with AVIF and
  with AVIF blocked (PNG fallback); 1.09 MB vs 3.6 MB transferred.

## Friend profiles, 18-stage Story and faster battles (D-340)

- Friends: `public.friend_profile` (migration 20261013000000) returns a friend's
  row only for accepted friends; the edge function's `friendProfile` route calls
  `friendProfileView`, which redacts via `game/friend-profile.ts`. Client
  `friendProfile()` + `friendProfileScreen()` reuse the Player info panels
  read-only (Back to friends, Message, Remove friend). Transient `viewedFriend`.
- Story: `storyStageLayout` 18/108; bosses every 18th stage. Ordinary enemies use
  `storyEnemyFractalisDrop` (+50%); each clear pays `storyCompletionReward`
  150/2 once per run receipt `:story-clear-N`, shown on the last reward event.
- Wallet v6: pre-v6 `storyCompleted` converts via `migrateLegacyStoryCompleted`
  and credits 150/2 per legacy stage, read-only until the first save. Engine
  drops pre-v6 Story runs.
- Player Info button hidden for online selection; empty `showError('')` clears
  the status toast (no "Notice" on speed changes).
- Edge function: `getClaims` auth, parallel `consume_game_attempt`/
  `find_game_request`/load, cached identity, parallel tracking/social on reads.
- Validation: `npx vitest run src/online/friend-profile.test.ts src/content/story.test.ts`,
  full suite, build, `node tools/smoke_server_game.mjs` (hosted).

## Native status display, kit wording and update prompt (D-339)

- `nativeMarkers`/`nativeMarkerReadout` put native statuses on the unit they
  affect (ally Seed/Cover/Foundation/Instruction; enemy Trap/Seal/Shuriken/
  Survey/Quarry). Owners still show their own resources in `.native-kit-slot`.
- `attachNativeView` snapshots every ally's native state onto the last event of
  each action/enemy phase/turn; `BattleView.updateNative` patches cards during
  playback. Enemy `status` events carry debuff snapshots so Burn updates live.
- `nativeAbilityStatuses` (ability-status.ts) lists each kit's statuses per
  ability; menus show them after generic families, deduplicated.
- Wording: Thornia recast keeps Empowered Trap; Nerithe Fold the Sea moves
  Survey only if one exists.
- `presentation/update-check.ts` + vite `version.json`/`__BUILD_ID__`
  (GITHUB_SHA in CI). Refresh-only dialog; deferred during battle.
- Validation: `npx vitest run src/presentation/native-markers.test.ts src/presentation/ability-status.test.ts src/presentation/update-check.test.ts`, full suite, build.

## Defend action removed (D-336)

- Actions: Normal Attack, Skill 1, Skill 2, Last Flare. Defense stat still mitigates.
- Defend-triggered Conduits now trigger on Normal Attack (per-round `normalRound`/
  `tauntRound` flags); Solace Anchor/Calamitic Throne free only the first Normal Attack each turn.
- Validation: `npx vitest run src/game/conduit-roster.test.ts src/game/conduit-redesign.test.ts src/game/defense.test.ts`, full suite, build.

## Fluid Conduit loadout (D-335)

- Rarity filters apply only from the filter buttons; clicking inside an owned row
  (Equip, Details, text) no longer selects that row's rarity.
- Equipment changes call `refreshConduitLoadout`, which morphs the existing loadout
  to the fresh render. Unchanged icons, search/filter/sort/page and scroll survive;
  it falls back to the previous full render only when no loadout is on screen.
- Validation: `npx vitest run src/presentation/conduit-loadout.test.ts`, full suite, build.

## Clear Conduit wording, uncapped stacks and overheal Shields (D-334)

- All Conduit descriptions use one glossary (`content/conduit-glossary.ts`):
  Attack Action, Bonus Strike, Direct Damage, Shield, Enemy Turn, Round, Battle.
  Inventory Information has a "Conduit terms" topic listing them.
- Removed: kit stack maximums (Razor Wounds, Combo, Gust, Survey, pilot charges),
  per-round/per-phase guards and Conduit trigger frequency limits.
- Unchanged by owner direction: character level caps per evolution, captured
  level60, Conduit upgrades +5 maximum, eight ordinary slots, four-Omnic limit.
- Healing above maximum HP (`nativeHeal`/`generatedHeal`) becomes a Shield equal
  to the excess, raising but never stacking onto the current Shield.
- Balance shift: old Roses build now clears the stage-140 boss; fully upgraded
  Calamity builds win some EX+1 runs (mixed squads some EX+2). EX+3 stays a wall.
- Validate: conduit-native-compatibility.test.ts, calamity.test.ts, full suite.

## Explicit abilities and [bracketed] references (D-333)

- Rewrote all16 kits in `content/native-identities.ts` to name and define every
  resource/state; Crinso Combo readout shows Last: Golden Edge / Crimson Rupture.
- All Conduit/Master/Calamitic descriptions bracket referenced names and expand
  shorthand. `bracketReferences` (presentation/reference-text.ts) wraps Information
  dialog content and the battle rules reference; headings/buttons/labels untouched.
- Validate: reference-text.test.ts, native-identities.test.ts, ui-copy.test.ts.

## Conduit rules only on Conduit screens (D-332)

- Removed the "Equipped kit rules" list and Master reference from Character ability
  views, the battle ability reference and the Archive combat kit; `kitConduitRules` was
  deleted. Conduit equipment/Inventory/Store/Archive Conduit views still show effects.

## Current-state descriptions only (D-331)

- Removed remnant clauses ("No Burn, low-health bonus or fire charges", "No Ember bank",
  "no retired Bloom", "no longer ...") from all 16 native kits and the redesigned
  Conduits. Mechanics and numbers unchanged; a regression test bans these phrases.

## Field cards show live values only

- Removed the white SVG "native mechanic cue" overlays (Banked fire, Burn
  detonation, Gold/Crimson edge, Cyclone, Shuriken recall, Thorn trap, Cover,
  etc.) that played over units on attacks and native damage. Attack animations,
  ability VFX, cut-ins and damage numbers are unchanged.
- Battlefield unit cards no longer print static rule sentences under native
  counters (Bliss Posture, Elise Shuriken, Crinso Combo, Vaelor Beat). Those
  explanations remain in the Battle menu unit reference and ability details.
  Live state text (targets, recipients, expiry turns) stays on the field.
  `NativeReadoutRow.rule` marks static text.

## Compact Normal activity panels (D-330)

- `src/presentation/activity-layout.ts`/`.css` wrap every Normal activity panel
  (dungeons, infusions, currency farms, Machines, Elemental War, Roses) in a
  two-column desktop grid; Training uses a side-by-side hero/details card.
  Short location pickers (infusion/currency/War) are a horizontal row; the
  ten-dungeon picker stays a column. Narrow screens reuse Calamity's compact
  header, horizontal activity rail (selected category scrolled into view) and
  unsplit dock labels.
- Verified in isolated Chrome with production CSS: all22 Normal cards fit
  1336×768/1280×720/1577×768/1920×1080 (max bottom686px) and have no
  horizontal overflow at390/320px. `npm run build` passes.

## Neutral guide-style player text (D-329)

- Removed prescriptive advice from player-facing text: Calamity's build
  guidance/"Rules & team requirements" (now "Calamity rules"), Story stage
  advice (now "Highest owned Element-Bearer: Lv.N"), Home Story card advice,
  Gameplay/Home/Story help, "Getting started"/"Tougher fights" topics (now
  "Unlocks") and rail headings "Start here"/"Grow your team" (now
  "Story"/"Progression"). All16 native character playstyle summaries are
  third-person mechanic descriptions rather than instructions.
- Internal Calamity balance targets remain in docs only. No mechanics, rewards,
  unlocks or saves changed. `npm run build` passes; full `npm test` passes
  4,032 tests/175 files.

## Nonblocking artwork and further Calamity corrections (D-328)

- **Released:** implementation `aaf0e67` is live. Pages run`38927892055`
  passed the full `npm test` suite (4,032 tests/175 files), configured online
  production build and deployment. All six hosted entry JS/CSS resources
  returned200 and matched the tested local production bytes exactly.
- Owner reports "Artwork loading timed out" on every live refresh. Root loader
  awaited all non-lazy img decodes in the entire rendered page, including
  hidden activity/tier panels and closed dialogs, then rejected successful
  navigation after12 seconds. This was not a missing-file deployment fix.
- Transition readiness now excludes hidden/closed/offscreen art, promotes only
  visible images to eager loading and caps the artwork hold at1500ms. Slow
  images continue loading after reveal, without a timeout error or repeating
  entry/account actions. Actual failures log errors; entry/render errors still
  reject and restore the previous inert state. Fades/entrance mechanics remain.
- Shared body-level artwork handling defaults menu img nodes to async/native
  lazy loading (explicit attributes and battle loading retained), logs actual
  failures and offers one per-image Retry outside existing action buttons.
  Success removes it. Same-origin retries retain path/revision; foreign signed
  URLs are unchanged. Calamity bosses keep their scene-specific Retry.
- Calamity boss framing is larger, reward rows are more readable, redundant
  chest copy is shorter and desktop dock labels no longer split. Narrow
  Calamity Gameplay navigation/header/dock are compact, instead of letting
  the activity rail occupy the first screen.44px actions and exact values
  remain; Normal composition is unchanged.
- `npm test -- src/presentation/activity-transition.test.ts
  src/presentation/artwork-loading.test.ts src/presentation/calamity.test.ts
  src/presentation/battle-entrance.test.ts src/presentation/menu-history.test.ts
  --maxWorkers=2` passes88 tests/5 files; `npm run build` passes with the existing
  chunk advisory. Tests cover hidden/offscreen skips, slow/failed/late images,
  actual error logs, lazy policies, retry identity, click isolation and disposal.
- Isolated Chrome verifies the actual Gameplay/Header composition with built
  CSS across36 tiers at five sizes (180 cases), no horizontal overflow and
  desktop panels within1280x720/1577x768. Hidden never-resolving image decodes
  are never invoked; an on-screen stalled decode still reveals/restores input
  in under3.4s including both800ms fades. Real blocked currency art does not
  abort navigation; its generic Retry restores the256px image. The Calamity
  Retry independently restores a blocked960px boss. All18 live Calamity images
  decode successfully. No account data/storage modifications.
- [Runtime specification](art-workflow.md#runtime-artwork-loading-and-recovery-d-328)
  and [Calamity presentation](calamity-mode.md#compact-tier-browser-d-327).

## Compact Calamity browser and artwork investigation (D-327)

- Replaced the three tall cards with accessible EX+1/2/3 tabs and one selected
  boss panel across all12 activities and standalone Roses Events. Desktop
  presents boss/arena, stats/scaling, aligned fixed chest contents and entry
  together. Horizontal activity choices apply only while Calamity is selected.
  Long abilities/build guidance use existing native dialogs; full loot remains
  exact. Token art is bounded22px, controls retain44px targets.
- Back snapshots restore each selected EX tier independently of difficulty and
  normal stage. Settings keeps the DOM. No mechanics, rewards, unlocks, artwork
  bytes, authority bundle or account persistence changes.
- Boss-image failures now show explicit error/Retry. Manual retry retains the
  canonical asset path and byte revision and bypasses a cached failed request;
  no guessed substitute, silent fallback or automatic retry loop.
- Live audit:705/705 PNGs return200/image/png with matching local file sizes.
  All18 Calamity downloads match local bytes/revisions, and all18 decode in
  isolated fresh Chrome. The reported existing-tab failure remains unconfirmed;
  no established root cause or claim that a broad missing-art bug was fixed.
- Validation: `npm test -- src/presentation/calamity.test.ts
  src/presentation/enemy-strength.test.ts src/content/calamity-art.test.ts
  src/presentation/menu-history.test.ts src/presentation/activity-banner.test.ts
  --maxWorkers=2` passes89 tests/5 files. `npm run build` passes with the existing
  chunk-size advisory. New coverage checks all12 independent tier browsers,
  keyboard wrap/Home/End, exact rewards, revision-preserving error/retry and
  history wiring.
- Isolated Chrome uses actual Gameplay/Header renderers with production CSS,
  no player-account writes. All36 entries checked at1577x768,1280x720,
  1920x1080,390x844 and320x780:180 cases, no horizontal overflow. Desktop panel
  bottoms stay below700px/696px at the two smaller desktop sizes. Mobile keeps
  scrolling rather than clipping. Screenshots reviewed; all non-lazy images in
  the328-image fixture decode locally. An actual blocked boss request displays the error; unblocking
  and pressing Retry restores the960px image and clears the error.
- [Contract and verification](calamity-mode.md#compact-tier-browser-d-327).
- Release `7c7f724` is live. Pages run `38925405406` passes the full
  `npm test` suite (4,027 tests/174 files), production build and deployment.
  All six hosted entry JS/CSS files return200 and match the tested local
  production bytes. No authority deployment is needed for this UI-only change.

## Phase3 hostile difficulty (D-326)

- Owner confirms5% higher hostile HP/Attack/Defense, not steeper exponential
  rates. One shared1.05 multiplier before rounding covers every fresh spawn
  across Training, Story, dungeons, infusions, currency modes, Machines,
  Roses, War and Calamity. Playable/captured growth, equipment, levels,
  mechanics, RNG and rewards remain unchanged.
- Existing same-level ordinary baseline is authoritative for all enemy
  identities. Boss rank changes HP/Attack/Defense; no further hidden activity
  multipliers currently exist. Actual spawn-stat comparisons now appear
  below enemy HP in compact and full readouts as well as stage previews.
  Red signed stat increases and blue signed reductions work independently.
  Standard enemies show neutral level text; temporary debuffs/damage/shields
  remain separate. No color-only meaning, zero rounding or clipped labels.
- Existing frozen runs survive Settings/resume unchanged. No wallet writes,
  rules restart or migration. Fresh client/authority encounters use the new
  curve; historical snapshot comparisons reflect their actual retained stats.
- The previous mixed four-Omnic+5 EX+1 pilot now loses36/36 cases, an
  intentional difficulty wall. No character buffs or enemy rollback added.
  [Detailed contract](combat.md#phase3-hostile-strength-and-visible-scaling-d-326).
- Validation: `npm test -- --maxWorkers=2` passes4,014 tests/174 files.
  Focused curve/progression/Defense/Calamity/readout/authority run passes280
  tests/7 files; final readout/toolbar run passes20 tests/3 files.
  Exact1.05 pre-round results are checked at every level1-185 and both ranks.
  Actual field/full readouts cover every activity and Calamity tier, mixed
  increase/reduction signs, tiny nonzero changes and unchanged temporary
  effects. The strengthened Lv13 hits retain the9% floor; the old upper
  regression bound intentionally changes50% to55%.
- `npm run build`, `node tools\bundle_server_game.mjs`,
  `npx tsc --project supabase\functions\game-operation\tsconfig.json`,
  `node --check tools\smoke_server_game.mjs`, editor diagnostics and
  `git diff --check` pass. Existing Vite chunk/canvas advisories remain.
- Actual BattleView fixture and responsive clones at320/390/1280px show
  signed stat labels below HP without document/label overflow. Computed red
  is rgb(255,146,146), blue rgb(134,197,255); button accessible names include
  the exact percentages. Fixtures/handlers are disposed without account
  changes, transactions or real battle actions.
- Matching authority deployed via `npx supabase functions deploy
  game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`.
  `node tools\smoke_server_game.mjs --balance` verifies exact Lv60 ordinary
  5573HP/774Attack/146Defense and boss13932/967/195 across live activities,
  unchanged skill schedules and frozen reads. `--native-calamity` verifies
  fresh EX+1 bosses155831HP/9260Attack/1418Defense plus unchanged targeting,
  atomic/idempotent chest rewards and persistence. Both hosted smoke
  identities/cascading records are removed after success; no real player
  data is modified.
- Release `e3f9202` is live. Pages run `38861459499` passes tests/build/deploy.
  All six hosted entry JS/CSS assets return200 and match the tested production
  bytes. Refresh already-open tabs for the new enemy labels; existing frozen
  encounters retain their snapshot stats until the next fresh encounter.

## Delivered Calamitic artwork (D-325)

- All six supplied root PNGs are archived byte-for-byte under
  `Art/source/calamitic`; five stable Conduit exports and the shared
  `calamitic-tokens` currency export are installed. All90 ordinary Conduits
  now have artwork. Exact original/export/pixel hashes and101 reviewed gap
  seeds live in the Calamitic provenance/settings records.
- Offline row-gradient connected cleanup, local base spill keys and edge
  decontamination preserve pale metalwork, red energy, floating fragments and
  the Throne's near-black shadow. Dark/light and source-resolution composites
  were reviewed. Cathedral's tip is source-edge limited, not reconstructed.
- Shared byte-derived URLs wire the store, Inventory, equipment, upgrades,
  Collections and receipts; token art also appears in Calamity loot previews
  and saved opening receipts. Locked shop stays exact-message-only with no
  products or images. Existing85 Conduit/currency exports and all combat,
  economy, save and RNG behavior are unchanged.
- Six verified root duplicates are removed only after byte-verified archival,
  export and manifest writes. Archive-only reproduction and conflict/cleanup
  safety tests are included. [Reproduction](art-workflow.md#delivered-calamitic-artwork-d-325).
- `python -m unittest discover -s tools -p test_calamitic_art.py -v`:5 pass.
  `test_conduit_art_revisions.py`:1 pass; `test_pending_art.py`:4 pass.
  Archive-only `python tools\intake_calamitic_art.py --apply` reproduces all
  six bytes exactly. All88 previously tracked Conduit/currency files remain
  byte-identical against the prior release.
- `npm test -- --run src\game\calamitic-conduits.test.ts
  src\presentation\calamitic-conduits.test.ts
  src\presentation\machine-art.test.ts --maxWorkers=2`:75 pass.
  Final `npm test -- --maxWorkers=2`:4,012 tests/174 files pass.
  `npm run build`, `node tools\bundle_server_game.mjs` and
  `npx tsc --project supabase\functions\game-operation\tsconfig.json` pass.
  Editor diagnostics and `git diff --check` are clean; existing canvas/chunk
  warnings remain.
- Broader `python -m unittest discover -s tools -p test_art_prompts.py -v`
  still has137 pre-existing failures across28 tests. Re-running its unchanged
  HEAD prompt contents through the same harness produces identical failure
  signatures, no new failures. Unrelated historical prompts are not rewritten.
- Isolated1280/320px browser fixtures load all five revised machine URLs and
  the token, zero broken images and no horizontal/product/detail overflow.
  No signed-in account is changed or transacted. Source-scale dark/light
  review additionally covers every complex gap and the preserved Throne shadow.
- Matching art-only authority metadata deployed successfully with
  `npx supabase functions deploy game-operation --project-ref
  ohtfgwomdfteaxubndww --no-verify-jwt`; the Docker warning is nonblocking.
- Release `b6fc46e` is live. Pages run `38857034237` passes tests/build/deploy.
  All six hosted PNG SHA-256 values match reviewed exports, and all six
  entry JavaScript/CSS files return200 and match the production build bytes.
  Reload an already-open game tab to pick up the new revisioned artwork.

## Calamitic Conduits (D-324)

- Owner approves full implementation now: five universal Rise-only devices
  above Omnic, chest tokens rather than direct device drops, no extra
  Calamitic equipment cap and five upgrades more expensive than Omnic.
  [Complete effects, prices and boundaries](calamitic-conduits.md).
- The90 ordinary/48 Master catalog preserves all original IDs/investments.
  New devices are World-Eater's Orrery, Causality Funeral Engine,
  Horizon-Cleaving Godpress, Throne of Borrowed Tomorrows and Cathedral of
  the Final Equation. Generated effects remain independent of native loops,
  critical RNG and rewards. Defense-triggered lethal discharges now finalize
  actual deaths/results/rewards through the ordinary shared path.
- Every EX+1/2/3 chest gives1/3/8 guaranteed Calamitic Tokens on opening,
  preserving its other contents and random draws. Each device costs100 tokens,
  once account-wide. Actual saved EX clears alone unlock the shop. Before that,
  its large locked screen contains exactly the requested quote, no products,
  balance, requirements or hints. Market always shows the destination.
- Inventory, Collections, acquisition/receipt text, equipment rarity sorting,
  Upgrade filters/Max Level and battle resource readouts are wired.
  Ordinary store controls/focus are preserved on in-place updates. Calamitic
  detail effects use full-width stacked labels rather than squeezed columns.
- Optional safe-integer token balances default0 read-only on legacy wallets.
  Open/purchase operations remain one-write atomic, overflow-safe, authority-
  validated and idempotent; existing opened chests receive no retrospective
  awards. No account/character buffs, load writes or wallet version bump.
- Upgrades cost10k/20k/40k/70k/100k Broken Mechanical Components,
  total240k, twice Omnic. All exact new prices/payouts/effect values are
  editable developer tuning, distinguished from owner-confirmed rules.
- [Six art prompts](../Art/conduits/Calamitic%20Conduits.md) cover all five
  machines and Calamitic Tokens; D-325 now installs all six exports. The original133-item matrix
  links to the separate new registry/tests; its generator remains reproducible.
- `npm test -- --maxWorkers=2`:4,012 tests/174 files pass. The focused
  new/coupled UI/runtime regression run passes169 tests/10 files.
  Runtime coverage checks every effect equipped/unequipped at all six levels,
  exact shield splitting, debt/cap/timing, borrowed-turn recovery, generated
  kills and universal/captured equipment with the separate four-Omnic rule.
- `npm run build` passes TypeScript and production build.
  `node tools\bundle_server_game.mjs` and
  `npx tsc --project supabase\functions\game-operation\tsconfig.json` pass.
  `python -m unittest discover -s tools -p test_pending_art.py -v`:4 pass.
  `node --check tools\smoke_server_game.mjs` and editor diagnostics pass.
  Existing jsdom canvas warnings and Vite large-chunk advisory remain.
- Isolated browser fixtures at1280/320px cover locked/unlocked shop,
  Inventory/Upgrade and maximum-safe-integer token/component balances:
  no horizontal/element overflow, exactly five unlocked products, zero locked
  products and exact lock text. Final shop detail hero stays144px and effect
  labels retain normal full-width text. No signed-in account is funded,
  mutated or transacted for these fixtures.
- Release `5c5cf2d` is live. Pages run `38855027224` passes build/tests/deploy.
  `npx supabase functions deploy game-operation --project-ref
  ohtfgwomdfteaxubndww --no-verify-jwt` deploys the matching generated engine.
  Its Docker-not-running notice does not prevent the successful hosted build.
- Hosted `node tools\smoke_server_game.mjs --native-calamity` passes rules4,
  explicit recipients, actual Lv185 EX3 chest-only victory, atomic opening/
  Master rewards, idempotency and current exponential stats/artwork.
  `node tools\smoke_server_game.mjs --loot-parity` passes all36 exact
  client/server reward/replay cases. Disposable identities and cascading records
  are removed; no owner accounts are modified.
- All six hosted JS/CSS entry assets return HTTP200 and match the tested
  production bytes. Shared chunks include the exact lock text, all five stable
  IDs and token field. Hosted `main-piOSghOr.js` SHA256:
  `d993bdf552d9f22dc50fa13570da036bc90d05607c2ba8be8e3214c62b780856`.
- Hosted `node tools\smoke_server_game.mjs --calamitic-economy` passes:
  legacy balances, exact1/3/8 receipts, chest/purchase idempotency, locked-shop
  rejection, actual-clear unlock,100-token spending and duplicate rejection.
  All disposable identities/cascading records are removed. Its initial3 vs4
  assertion was a smoke-fixture mistake: separate tier identities cannot
  accumulate each other's tokens. Only that assertion changed; the deployed
  economy needed no correction or redeployment. Script syntax check passes.
- Six newly arrived root PNGs (five device names and `Calamitic Token.png`)
  were observed after deployment verification and left untouched. Their
  archival, reviewed background cleanup and runtime installation are not part
  of this completed implementation; current exports remain pending.
- The receipt adds a required field. There is no existing wire-schema
  negotiation, so already-open old tabs must reload before opening chests.
  An old parser may reject a response after the server saved it; same-request
  retries are deduplicated and refreshing restores the authoritative balance.
  Save/battle versions are deliberately unchanged.

## Delivered native identity status icons (D-323)

- Owner requests moving/wiring all27 root native-status PNGs and removing their
  backgrounds. Originals are byte-preserved under
  `Art/source/abilities/native-statuses`;256px transparent exports are installed
  with224px content limits and hashes/settings in
  `Art/provenance/native-status-art-intake.json`.
- Reuse the existing offline connected row-gradient cleaner with per-source
  reviewed gap seeds and bounded Disciple Strike mint-pocket radii. Preserve
  the illustrated frame/inset, gems, feathers, powers and painted shadows.
  Dark/light contact sheets and indexed pocket review cover all27.
- Typed native readout metadata selects every paired/three-state variant from
  actual memory, with generic Burn/shield art retained. Field and Battle-menu
  readouts share decorative icons beside exact HTML text/values/owners/clocks.
  Added readout-only rows for active Bastion/Ultimate Ward; no effect changes.
- Shared status URL revisions cover all36 old/new icons. Generation references
  and current art queue now record both requested packs as complete.
- `python tools\intake_native_status_art.py --apply --remove-incoming --reviewed`
  verifies source/archive/export hashes before removing only the27 root copies.
  Root PNG count is0; all27 archives and27 exports remain. Archive-only
  reproduction passes after cleanup, including all original nine status icons.
- `npm test -- --maxWorkers=2` passes3,913 tests/172 files. After correcting
  the new test's captured fixture to use a real captured copy, the focused
  native-status/native-kit/status-icon suites pass76 tests/4 files.
  `npm run build` passes type-check and production build.
  `python -m unittest discover -s tools -p 'test_*status_art*.py' -v`
  passes22 tests; `python -m unittest discover -s tools -p test_pending_art.py -v`
  passes4. Existing jsdom canvas warnings and bundle advisory remain.
- Browser gallery and14 actual typed readouts load45 images, covering all27
  native assets with revisioned URLs. Native row icons render at28px.
  At1280px desktop and a real320px iframe viewport, there are no failed images,
  horizontal container overflow or overflowing native rows. Visual review
  confirms the illustrated frames remain visible. Fixtures are removed and
  localStorage remains empty; no account funding or transactions.
- Release `2e59c21` is live. Pages run `38850541522` passes build/tests/deploy.
  All27 hosted native PNGs return HTTP200 with SHA256 matching the installed
  exports. All six JS/CSS entry assets return HTTP200 and match the tested
  production bytes. Hosted `main-CFSOhxBa.js` contains all27 mappings and the
  accessible native readout markup; SHA256:
  `eeaed645a619df8eafb9c9ddad0f097b0e66622aee21fff01aacccda096838f2`.

## Visible level-based enemy strength (D-322)

- Owner clarifies that equal-level enemies should share a baseline, with tougher
  variants visibly explained. This supersedes the earlier strict activity-band
  interpretation. Existing factories already use shared exponential level/rank
  stats; no curve, schedule, combat, reward or save change was needed.
- Shared previews show actual selected enemy HP/Attack/Defense and percentage
  differences from a standard same-level enemy. Dungeon/infusion/currency/
  Machines/Roses/War stage changes refresh repeatedly; Back restoration
  dispatches the same change event. Story selection refreshes its detail;
  Training shows wave1. All36 Calamity tiers include actual boss stats beside
  their existing shield/heal/targeting/attack rules.
- Gameplay Information explains level/rank and special-pattern differences.
  Stat comparisons do not claim to predict damage or flat Defense mitigation.
- Dedicated tests cover exact values, modified-stat comparisons, all15 normal
  selectors, repeated changes, difficulty isolation, all36 tiers, Story selection
  and account immutability.
- `npm test -- --maxWorkers=2` passes3,910 tests/171 files; `npm run build`
  passes type-check and production build. Existing jsdom canvas warnings and
  bundle-size advisory remain. Editor diagnostics and `git diff --check` pass.
- Browser fixtures check56 visible previews per viewport at1000/650/320px,
  with no preview or container overflow. Repeated ordinary/boss Heaven stage
  changes match real factory stats. Story ordinary/regional-boss selections
  also match at320px. Training's preview was moved out of its horizontal summary
  after browser testing exposed squeezing. Fixtures removed; localStorage
  remains empty, with no account funding or transactions.
- This is client presentation only; the authority/curve remain rules4 and
  need no redeployment.
- Release `e5529ae` is live. Pages run `38809419156` completed successfully
  (build and deploy). All six JS/CSS assets referenced by the hosted entry
  return HTTP200 and match local production bytes. Hosted
  `main-CtvLwlt2.js` contains enemy-strength previews, same-level comparisons
  and the Training first-wave preview; SHA256:
  `0103ff28930b6e0cedf23a394b530b8b0452c071c3d64ed3b776daf769bae789`.
- The27 root native-status PNGs remain untouched.

## Clearer rewards, bosses and player-facing English (D-321)

- Owner requests aligned reward text/buttons, clearer boss images and short,
  useful English throughout activity/reward information.
- Calamity cards share grid rows through artwork, identity, mechanic text,
  reward/chest/counts and actions. Names/counts use separate aligned columns;
  tiers without Master chests omit that row. Shared item showcases align
  artwork/name/quantity rows even when names wrap.
- Square boss previews are larger, with dimmed/desaturated arena backdrops
  and a subtle contrasting edge. Calamity battle scenery is dimmed, and
  contrast edges cover field, ultimate cut-ins and discovered Collections.
  Undiscovered silhouettes and artwork pixels/facing are unchanged.
- Rewrote all12 boss descriptions, guidance, warnings, timing/loot/reference
  and opening text; retained actual skill names, schedules, hit counts,
  shields/healing and targeting. Shared content feeds entry/battle/Collections
  and authority. Removed implementation receipt wording from unlock hints
  without changing unlock validation.
- Plain-language pass covers Story, Training, dungeon/infusion/currency help,
  Machines/components/Masters, Roses, Inventory, summon bonus rules and battle
  results. Exact loot chances/quantities remain; loot dialogs show probabilities
  instead of raw weights. Removed repeated save assurances and irrelevant
  implementation/design commentary; real errors still report failure.
- Browser fixtures: all12 activities at1000/650/320 container widths pass36
  alignment/overflow checks, reward/entry/View Loot rows agree within1px.
  Measured320px viewport has no overflow and shared showcase count rows align.
  Fixtures leave localStorage empty; no account funding or transactions.
- Validation: `npm test -- --maxWorkers=2` passes3,907 tests/170 files
  (inherited jsdom canvas warnings). After the last loot-table label cleanup,
  `npm test -- src/presentation/calamity.test.ts --maxWorkers=2` passes49 tests.
  `npm run build` passes type-check/production build (inherited chunk advisory).
  `node tools\bundle_server_game.mjs` and
  `npx tsc -p supabase\functions\game-operation\tsconfig.json` pass.
  Editor diagnostics and `git diff --check` pass.
- Authority bundle includes shared description changes; combat rules stay4.
  No mechanics, rewards, RNG, save schema or compatibility restart change.
- Release `9231580` is live: Pages run `38806382699` passes the full suite,
  configured online build and deployment. Hosted
  `battle-mono-B3rJ1s3A.js` and `battle-mono-BT7dxM8O.css` return HTTP200
  and match local production bytes. Deployed assets contain aligned reward
  lists, plain chest-only text, boss contrast and dimmed scenery.
- `npx supabase functions deploy game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`
  succeeds (nonblocking Docker warning). Then
  `node tools\smoke_server_game.mjs --native-calamity` passes rules4,
  exact exponential spawn stats/art, explicit support recipients, chest-only
  victory/opening, idempotency and persisted holdings. Disposable identities
  and their records are removed. This is transaction verification, not a new
  difficulty/clearability benchmark.
- The27 delivered root native-status PNGs remain untouched and untracked.

## Separate Calamity difficulty tabs (D-320)

- Owner requests a separate clickable difficulty view instead of Calamity
  controls/rewards appended below normal missions. All twelve eligible
  activities and standalone Crimson Roses Events now share Normal / Calamity
  tabs, initially Normal.
- Each difficulty owns its mission display. Calamity shows activity name,
  three-tier boss levels, installed arenas/boss/chest art, chest-only victory
  drops, fixed chest currencies/Master chests/bundles and exact View Loot.
  Normal facts, reward showcases and stage entry controls are hidden, not
  destroyed. Unlock reasons, warnings and validated entry remain unchanged.
- Keyboard Left/Right wrap, Home/End, selected/tab-panel relationships and
  roving focus are wired. Back snapshots restore difficulty independently
  per activity alongside normal stages and activity choices. Settings preserves
  the menu DOM. No save writes, mechanics, rewards or authority changes.
- Validation: focused three-file difficulty/banner/history suite passes69
  tests. `npm test -- --maxWorkers=2` passes3,906 tests/170 files (inherited
  jsdom canvas warnings). `npm run build` passes (inherited chunk advisory).
- Unsaved desktop/narrow-browser fixture confirms Normal/Calamity content
  isolation, keyboard focus, all12 visible Calamity images loaded, and no
  horizontal overflow at measured1280/488/320 CSS widths. localStorage stays
  empty; no transactions or account funding. Fixture removed after review.
- Release `7ac60ec` published automatically by Pages run `38803717125`:
  full regression suite, configured online production build and deploy pass.
  Hosted gameplay bundle `battle-mono-B0Ya_3VP.js` returns HTTP200, matches
  local production bytes (SHA-256
  `7cd53c4f9e81158ab5913555137bdb3e287679b9a46a93cff35443634c2d9600`)
  and contains the difficulty controls and chest-only mission summary.
  No authority redeploy: this release changes presentation only.
- The27 untracked delivered native-status PNGs remain untouched; their art
  intake is separate work. No new artwork or authority deployment is needed.

## Exponential hostile pursuit and intentional walls (D-319)

- Owner requests game-wide exponential enemies without changing characters to
  keep pace. Explicit follow-ups preserve the four-Omnic cap and choose
  difficulty-only rather than a gear entry gate. Calamity's build target is a
  complementary fully developed squad, eight +5 ordinary pieces/member,
  including four relevant matching-element Omnic, and suitable Masters.
- All real hostile spawns now use
  `round(B*(1+S*expm1(R*(L-1))/R))` through185: HP S=.45/R=.026,
  Attack .25/.024, Defense .30/.020. Opening B remains83/22/4 ordinary and
  207.5/27.5/(16/3) boss, final rounding only. No25/120/140 curve splice;
  Calamity uses its actual145/160/185 levels, same12% Crit profile.
- Calamity boss HP/Attack/Defense:145=148411/8819/1350,
  160=220814/12753/1849,185=426076/23450/3097. Stats compound while characters
  and captures retain their existing playable growth/kits. Equipment effects,
  slots/upgrades, economy/rewards/RNG, unlocks and level schedules/caps unchanged.
- Existing shared compatibility restart advances to rules4: restart only the
  historical current encounter at its current stage/wave with frozen squad,
  progress/equipment/upgrades/Masters, retain saved rewards/account holdings,
  fresh receipt/run ID, stale-input rejection and explicit notice.
- Replaced easy-clear targets, not failures with character buffs.648 simulations:
  two squads (Infernis/Tizu/Flora, Rosetta/Thornia/Flora), three gear variants,
  all12 bosses/3tiers/3seeds. EX1 prior mixed+5 wins8/36 and16/36; four-Omnic+0
  both0/36; four-Omnic+5 candidates0/36 and1/36. Every tested EX2/EX3 case loses,
  no timeouts. Candidates are not exhaustive optimization; EX2/EX3 viability is
  not demonstrated. Walls are intentional; clever lower-rarity wins are allowed.
  Full reproducible report/fixtures: `docs/calamity-mode.md` and
  `src/game/calamity.test.ts` (`CALAMITY_DIFFICULTY_REPORT=1`).
- Early Story/Common regional checks remain; old solo material-entry and
  guaranteed Common-only fodder/final Rose/War clears are retired. Assertions
  now measure those walls while retaining shared spawn parity, unchanged
  character/capture growth and successful earlier team routes.
- Validation: `$env:CALAMITY_DIFFICULTY_REPORT='1'; npm test -- --maxWorkers=2`
  passes3,891 tests/170 files, including the648 measurements, per-level exact
  curve/compounding/safe-integer checks, all-mode spawned-stat parity,
  version3-to4 offline/authority restart and no-gear-admission regression.
  `npm run build` passes type-check/production build (inherited chunk advisory).
  `node tools\bundle_server_game.mjs` and
  `npx tsc -p supabase\functions\game-operation\tsconfig.json` pass.
  Editor diagnostics and `git diff --check` pass.
- Unsaved narrow-browser fixture verifies guidance in activity cards and
  styled confirmation, cancellation, gearless eligibility with normal-final
  unlock, exact120/140/145/160/185 boss stats and no horizontal fixture overflow.
  No localStorage changes; fixture/dialog removed after cancellation.
- Release `25e05a7` deployed: Pages run `38802116676` passes3,891 tests/170
  files, configured production build and publication. Hosted
  `main-D_eFtmX7.js` and its referenced `battle-mono-CITWpgdY.js` match local
  production SHA-256; the battle chunk contains the exponential curve and
  shared build guidance.
- After client publication,
  `npx supabase functions deploy game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`
  succeeds (Docker-not-running warning is nonblocking).
  `node tools\smoke_server_game.mjs --native-calamity` passes rules4,
  explicit recipients, fresh145 boss exact exponential stats across Treasury/
  Rose, chest-only rewards, atomic openings/two Masters, idempotency and saved
  holdings. Disposable identities/cascading test records removed.
  Its forced1-HP EX3 victory is a transaction test, not evidence of live-stat
  EX3 viability. No remaining publication work or owner decisions.

## Native-status frame clarification (D-317)

- Owner corrects the prior trophy interpretation: all27 symbols belong inside
  square ability-icon picture frames, with a continuous beveled rim, opaque
  recessed panel and dominant centered symbol. No award crest, trophy,
  pedestal or plinth; retain character palettes, distinct symbols, filenames
  and outer cutout margins. The panel is artwork, not removable backdrop.
- Updated generator, generated pack, checklist and art workflow. Native
  negatives no longer forbid the requested border and explicitly exclude
  trophies/bases; Calamity prompts remain unchanged.
- This supersedes trophy-backed descriptions in historical entries below.
  All27 images remain undelivered; no runtime artwork or gameplay changes.
- Validation: `python -m unittest discover -s tools -p test_pending_art.py -v`
  passes all4 tests, including all27 frame/exclusion checks and exact
  regeneration. Editor diagnostics and `git diff --check` pass.
  Broader `python -m unittest discover -s tools -p test_art_prompts.py -v`
  runs28 tests but reports131 existing subtest failures in unchanged Master
  Conduits (100), Machines (28) and Calamity (3) prompt blocks; no native
  frame failures. Those unrelated prompt contracts are not changed here.

## Calamity Seraph/Hierophant replacements (D-318 follow-up)

- Owner explicitly approves processing both new root sources. Updated
  Heavenfall Seraph/White Pyre Hierophant originals are archived under
  `Art/source/calamity/replacements`, while first-delivery sources and two
  former runtime exports remain preserved with settings/hashes in manifest
  `previous_exports`.18 active images,20 historical/current delivered originals.
- Reviewed all28 Seraph and24 Hierophant enclosed backdrop components, including
  magnified collar/hand/robe details, on dark/light source-resolution composites.
  Preserve pale wings/flame, red ribbons/gems, dark armor/thorns and shadows.
  Both stay frontal at existing boss scale; stable art IDs/shared revisions
  cover all tiers, previews, field/cut-ins and discovery/Collections.
- `tools/intake_calamity_art.py` now requires explicit `--replace` for changed
  sources, preserves prior runtime exports and supports reproduction from the
  new archive paths. Safety tests reject implicit replacement/modified runtime;
  historical sources/exports reproduce exactly from preserved settings.
- Both root duplicates removed only after matching archive/manifest SHA-256;
  all16 unaffected manifest records/runtime images match the prior release.
  Ordinary `python tools\intake_calamity_art.py --apply` reproduces all18 active
  images from archives alone and verifies both historical exports.
- Validation: `python -m unittest discover -s tools -p test_calamity_art.py -v`
  passes5 tests (current/historical reproduction, protected pixels, supplied
  alpha and replacement/runtime safety).
  `npm test -- src\content\calamity-art.test.ts src\presentation\calamity.test.ts src\presentation\battle-scale.test.ts --maxWorkers=2`
  passes64 tests/3 files; `npm run build` passes type-check/production build
  with the inherited chunk-size advisory. Editor diagnostics and
  `git diff --check` pass.
- Unsaved browser fixtures verify all6 replacement encounters: old snapshots
  resolve matching new revisioned field/cut-in URLs, front/unmirrored, no
  session/account writes. Both960px images load; narrow390px battlefield
  has390px scroll width and contains the boss. Fixture DOM/listeners removed.
- Release `5d31125` published successfully by Pages run `38789489665`:
  `npm test` passes3,871 tests/170 files; configured production build and
  deployment pass. All18 hosted Calamity PNG SHA-256 values match provenance,
  and hosted `main-BRLCg8Fp.js` contains both new byte revisions
  (`fd31e3fdfc94` Seraph / `44ecad9bc66e` Hierophant). Both hosted replacement
  images load at960x960 in-browser.
- No combat, RNG, reward, server-rule or account changes; no authority deployment
  required. All12 bosses remain complete; only27 native mechanic symbols are
  still undelivered. No remaining owner decisions for this replacement intake.

## Final Calamity boss delivered (D-318 follow-up)

- Owner delivers `The Last Scarlet Bloom.png` at root, completing twelve bosses
  and all18 Calamity images. Preserve original bytes under `Art/source/calamity`;
  remove only the verified duplicate root copy, as already requested.
- Reviewed the source and all22 indexed enclosed-key pockets on full-resolution
  dark/light composites. Per-source settings preserve ivory roses/feathers,
  scarlet petals, dark thorn rings, drapery and the painted ground shadow.
- Shared boss mapping now requires all twelve activities at compile time.
  Rose tiers1/2/3 share the new image across previews, field/cut-ins, catalog/
  Collections and old frozen snapshots. Genuine frontal pose,1.75 boss scale,
  revisioned deployment-base URL. No gameplay/account changes.
- Current outstanding art is27 trophy-backed native symbols only; all45
  original prompts remain as provenance. The generated Calamity pack's existing
  unsaved status-only edit was superseded by this actual complete-delivery status;
  no prompt design or parameters were changed.
- `python -m unittest discover -s tools -p test_calamity_art.py -v`:
  **3 passed** for all18 archives/exports, arena pixels, gap seeds, authoritative
  alpha and protected artwork pixels. `test_pending_art.py`: **4 passed**.
  Final `npm test -- --maxWorkers=2`: **3,869 passed in170 files**.
  **Build Last Light** (`npm run build`) passed (existing large-chunk advisory).
  Authority bundle regeneration/server TypeScript check passed.
- Unsaved browser fixtures verified the Rose boss across all three old-snapshot
  tiers with correct tier arenas, no mirroring/state changes/placeholders.
  All three960px images loaded;390px CSS viewport has no horizontal overflow.
  Fixture/listeners were disposed, real localStorage remained identical.
- The single verified Rose root duplicate is removed. During work, new root
  `Heavenfall Seraph.png` and `White Pyre Hierophant.png` appeared with different
  bytes from the installed archives. Left untouched and excluded from this
  Rose-only release; do not delete or silently replace archived originals.
  Intake correctly rejects those conflicts until a separate reviewed
  replacement is authorized.
- Release `71a5de2` is pushed and live:
  [Pages run38787434855](https://github.com/tjprice101/LastLightGame/actions/runs/38787434855)
  passed full regression, configured build and deployment. All18 hosted PNGs
  match local SHA-256 bytes, including `calamity-boss-roses`.
- After client/art availability, the authoritative `game-operation` deployment
  succeeded. `node tools\smoke_server_game.mjs --native-calamity` passed,
  including a fresh hosted Rose encounter with the exact installed art ID;
  recipient targeting, chest-only win, atomic opening, persistence/idempotency
  remain correct. Disposable identities/cascading records were removed.
- No Calamity artwork remains missing. The two newly different root images
  noted above are not part of this release and remain untouched.

## Calamity artwork installed (D-318)

- Owner requests background removal and full wiring of delivered root images.
  All17 originals are preserved byte-for-byte in `Art/source/calamity`; duplicate
  root copies were subsequently removed at the owner's request after matching
  source/archive hashes against provenance. Root image count is now zero.
  Eleven bosses and three tier chests have reviewed transparent
  exports; three shared EX arenas remain opaque and pixel-intact.
- Per-source row-gradient keys and individually reviewed enclosed-gap seeds
  preserve pale armor, gold/orange powers, cyan eye/water detail and painted
  shadows. Source-resolution overlays and dark/light composites were reviewed.
  Some source tips touch the original edges; padding does not recreate them.
- Shared mappings/revisions wire catalog/spawns, field/cut-ins, reviewed facing
  and size, tier cards/arenas, Inventory/loot references, drops/results and
  saved opening reveals. Old frozen snapshots acquire current art in display
  resolution only; no encounter restart, combat, RNG or account changes.
- The Last Scarlet Bloom was not delivered and remains neutral. All27 new
  trophy-backed mechanic icons remain prompt-only. Current remaining queue is
  **28** images; the original45 prompts are retained as generation provenance.
- Reproduce with `python tools\intake_calamity_art.py --apply`.
  `python -m unittest discover -s tools -p test_calamity_art.py -v`:
  **3 passed**, checking17 archived hashes/exact exports, arena pixels,
  all reviewed gap seeds, supplied alpha and protected eye/shadow pixels.
  `python -m unittest discover -s tools -p test_pending_art.py -v`:
  **4 passed** after regenerating accurate delivery status.
- Focused four-suite Vitest run: **169 passed**. Initial full regression
  exposed missing new-boss size metadata; wired all11 and added twelve
  cross-tier/pre-art size cases rather than bypassing the check.
  Final `npm test -- --maxWorkers=2`: **3,869 passed in170 files**.
  No skips or altered gameplay expectations.
- Production TypeScript/Vite build passed (existing large-chunk advisory).
  `node tools\bundle_server_game.mjs` and
  `npx tsc --project supabase\functions\game-operation\tsconfig.json` passed.
- Browser unsaved fixtures verified all36 old-snapshot encounters:33 show
  delivered bosses, three Rose tiers retain placeholders, every tier selects
  its arena, and all combat states remain unchanged. All17 asset URLs decoded.
  At390px CSS viewport the tier cards/Inventory have no horizontal overflow;
  the skippable saved EX+3 opening image stays within its art stage. Fixture,
  dialog and listeners were removed; real localStorage remained identical.
- Publication follows the owner's automatic-deployment direction: client first
  so new PNGs exist before the authority begins emitting their art IDs.
  Release `d3a6568` is pushed and deployed.
  [Pages run38785101423](https://github.com/tjprice101/LastLightGame/actions/runs/38785101423)
  passed full regression, configured build and deployment. Hosted
  `main-Ds6byOJX.js` returns200 and contains current boss/chest/arena mappings.
  All17 hosted PNGs match local SHA-256 bytes exactly.
- After the client/assets were live,
  `npx supabase functions deploy game-operation --project-ref
  ohtfgwomdfteaxubndww --no-verify-jwt` succeeded (harmless Docker warning).
  `node tools\smoke_server_game.mjs --native-calamity` passed: rules3,
  explicit recipients, Lv185 chest-only win, atomic opening/two Master chests,
  idempotency/persistence and a fresh server-spawned boss with installed art.
  Disposable identities and cascading records were removed.
- No owner decision is needed. Remaining work is delivery/review of the one
  Rose boss and27 native symbols, not further runtime wiring of delivered art.
  Old `conduit-list.txt` / `owned-tests.txt` diagnostics remain untracked and
  untouched; authoritative source archives are committed.

## Remaining-art prompts prepared (D-317)

- Owner requests missing-art prompts and clarifies3 shared chest images and3
  shared arena images, one per tier across all activities. Twelve bosses stay
  activity-specific and reuse each image across levels145/160/185.
- [Current45-image queue](../Art/Remaining%20Artwork.md) links18 Calamity
  prompts and27 native-state pictograms, each with a filename and complete
  copy-ready prompt. Cutouts use opaque powers, contrasting keys and15%
  continuous safety margins; full-bleed tier arenas allow environmental bloom.
- Owner's follow-up gives all27 mechanic icons a dominant raised symbol over
  a trophy-like crest with side flourishes and a short stepped pedestal.
  Character palettes, distinct symbols and flat cutout keys remain; backing
  is an ornamental object, not scenery or a generic gold cup. Reproduce from
  the updated generator rather than editing generated prompt blocks.
- Actual catalog/filesystem audit: all85 ordinary/48 Master Conduits, the Master
  chest/Astral Reserve and48 current material definitions have installed PNGs.
  Only12 Calamity identities lack art among163 catalog creatures. Retain
  installed ability portraits and universal Normal/Defense icons.
- Prompt generation uses `python tools\build_pending_art.py`; focused
  reproduction/scope/style validation uses
  `python -m unittest discover -s tools -p test_pending_art.py -v`.
  All4 focused tests pass, including checks of all27 trophy backings.
  The broader `test_art_prompts.py` run reports131
  existing assertions across older packs (28 test methods,0 errors);
  neither new pack has a failing assertion after matching the shared contracts.
  Existing unrelated prompt packs/tests were not rewritten to hide failures.
  These are prompts, not generated/reviewed artwork or a runtime deployment.
  Shared chest/arena art must be connected across every surface after delivery.
- Existing live client/server release remains unchanged. No account edits,
  image intake, automatic re-keying or missing-image URLs were introduced.

## Coordinated release deployed (2026-10-15)

- Owner explicitly requests deploying all pending work. This supersedes
  local-only publication restrictions in the historical implementation entries.
- Fixed the remaining release-blocking motion-policy regression: evolution
  fodder transitions follow the explicit in-game reduced-motion setting,
  rather than an independent device media query. No test was skipped.
- Final full `npm test -- --maxWorkers=2`: **3,843 passed,0 failed**.
  **Build Last Light** (`npm run build`) passed TypeScript/Vite with the
  existing large-chunk advisory. Authority bundle regenerated and
  `npx tsc --project supabase\functions\game-operation\tsconfig.json` passed.
- `npx supabase functions deploy game-operation --project-ref
  ohtfgwomdfteaxubndww --no-verify-jwt` succeeded. Docker-not-running warning
  did not prevent the hosted asset upload/deployment.
- `node tools\smoke_server_game.mjs --native-calamity` passed against the
  deployed server: rules3, explicit Tizu shield and Disciple Instruction
  recipients, Lv185 EX3 chest-only victory, atomic chest opening including
  two Master chests, action/opening idempotency and persisted holdings.
  Disposable identity and cascading records were removed; no owner data edited.
- Release commits `b712294` and `59c9ffb` are pushed to main. The first CI
  attempt exposed Windows-only fixture paths in four tests; corrected with
  `node:path.join`, with65 focused tests passing. No checks were bypassed.
- [Pages run38765260493](https://github.com/tjprice101/LastLightGame/actions/runs/38765260493)
  passed all **3,843 tests in169 files**, configured production build and
  deployment. [Hosted game](https://tjprice101.github.io/LastLightGame/)
  loads the current `main-C2dl8gGj.js` and
  `battle-mono-Bhdv3Oc6.js` bundles with HTTP200; the battle bundle contains
  current native identities/Instructions and Calamity. Hosted title and
  configured online sign-in dialog render without account edits.
- `node tools\smoke_server_game.mjs --loot-parity` also passed all36 live
  early/final activity cases, exact rewards, first-clear separation, atomic
  persistence, idempotency and victory replay. Disposable identities and
  cascading records were removed.
- Website and matching authority are live. Named neutral Calamity artwork
  remains intentional pending delivery; no deployment decision remains open.

## Sixteen distinct native identities implemented locally (D-316)

- Implements the approved [native identity redesign](character-identity-redesign.md)
  for all sixteen Element-Bearers, replacing historical shared rotations rather
  than layering more counters over them. Infernis uses owned Burn/detonation;
  Crinso uses alternating Gold/Crimson actions and Combo without native Burn.
  Other identities include delayed Seeds, Instructions, Cover, Cyclone,
  held/lodged blades, forecast Seals, Wounds, Quarry contributions, traps,
  Survey, shared Foundation and global-turn music.
- Explicit living-ally selection is wired through every member's hold grid
  and Battle menu, offline and online. Cancel/Escape preserves Gauge/turn and
  restores focus; the hostile target remains independent. Current references,
  owner/recipient/expiry readouts and resolved mechanic VFX replace retired
  shared resources. Captured source kits, missing slots and level60 cap remain.
- All133 existing Conduits retain IDs, holdings, upgrades, art and acquisition.
  Native-dependent effects are adapted to actual mechanics; independent
  equipment resources remain independent. The generated
  [full compatibility matrix](character-conduit-compatibility.md) records every
  item. Exhaustive ordinary effects across six upgrade levels and all48 Masters
  are tested with/without equipment. Delayed healing settles real effective
  healing/overheal once, not a second fictitious skill activation.
- Owner-approved tuning preserves base stats, Gauge costs, recovery and enemy
  strength. Primary native skill direct coefficients use1.6, not Normal Attack
  or fixed follow-ups; exact support tuning is in the current contract.
  The unequipped Lv38/Evo2 Infernis solo dungeon clear is preserved. Infernis
  did not previously heal; its balance repair is damage/Burn rotation, not
  replacement healing. Existing endgame seeds, victory thresholds and legal
  equipment budgets are retained with new-kit-aware targets/builds/rotations.
- Combat rules version3 restarts only historical current encounters, keeping
  frozen teams/equipment and previously saved rewards. Current-version resume
  remains intact; authority persists the restart before exposing it and rejects
  stale actions. No account migration, grants, refunds or automatic unequips.
  Production hostiles still select one ally per activation; simultaneous
  hostile AoE was not introduced. Foundation allocation has separate tests.
- Final focused assertion/matrix check passed **74 tests in4 files**:
  `npm test -- src\presentation\ally-buffs.test.ts src\presentation\conduit-compatibility.test.ts src\presentation\conduit-http-compatibility.test.ts src\game\conduit-redesign.test.ts --maxWorkers=2`.
  Final full `npm test -- --maxWorkers=2` passed **3,842 tests, with1 failure
  of3,843**. The sole failure is the inherited
  `src/presentation/settings.test.ts` reduced-motion CSS policy assertion
  against `src/character-screen.css`; it is not skipped, hidden or changed.
- Production TypeScript/Vite build passed (existing >500k chunk advisory).
  `node tools\bundle_server_game.mjs` regenerated the authority bundle;
  `npx tsc --project supabase\functions\game-operation\tsconfig.json` passed.
  Edited runtime/test diagnostics reported no errors.
- Unsaved browser checks verified cancellation with unchanged Gauge/state,
  Tizu's exact2214 shield on explicitly selected Disciple, and nonleader
  Disciple's25-Gauge Strike Instruction on Aurora without changing the enemy
  target. At390x800 CSS pixels the picker fit with no horizontal overflow;
  recipient buttons exceeded44px. Aurora's next-skill forecast and owned
  shield/Instruction expiry readouts were visible.
  The browser document remained hidden, preventing real-time WAAPI playback;
  checks used in-memory reduced motion and do not establish full animation
  visual approval. Fixture was destroyed, original motion restored, title
  retained and real localStorage verified unchanged.
- Local only: no commit, push, deployment or real-account writes. Coordinated
  client/server publication and a hosted smoke remain pending authorization.
  No owner decisions remain open for this approved scope.

## Calamity Mode implemented locally (D-315)

- Implements the approved [Calamity contract](calamity-mode.md): twelve
  eligible activities, each with three single-boss EX stages at145/160/185,
  sequential permanent unlocks, free entry, no defeat penalty and explicit
  entry/replay warnings. Story, Training and Elemental War remain excluded.
  This supersedes the historical D-308 planning-only status below.
- Twelve distinct boss patterns, scoped endgame stats, visible cadence/
  counterplay, neutral named placeholder bosses/chests and discovery-gated
  Collections are wired throughout. No borrowed/missing PNGs, new arenas,
  headers or audio; ordinary enemy levels, player caps and native kits remain.
- Every victory/replay atomically saves exactly one held chest, clear,
  discovery and receipt, with no ordinary drops/captures or extra first-clear
  grant. Inventory confirms one opening, saves fixed currencies plus3/5/7
  activity bundles, then reveals the saved outcome. EX+3 also grants two
  existing Cosmic Grand Master Chests, even when all Masters are owned.
- Optional walletv5 fields preserve old saves read-only. New normal-final
  victories establish access; historical access requires an exact current
  final-boss UUIDv4 receipt and matching final-stage access, otherwise replay
  the normal final. Dedicated opening RNG, safe-integer/stale-count checks,
  denied-write preservation and receipt deduplication share offline/server
  transactions. Strict online schemas and frozen replay/resume are connected;
  an unsupported Calamity descriptor never falls back to Training.
- Final targeted command passed **309 tests in7 files**:
  `npm test -- src\game\calamity.test.ts src\game\calamity-account.test.ts src\presentation\calamity.test.ts src\online\calamity-server.test.ts src\online\calamity-http.test.ts src\content\world-lore.test.ts src\game\conduit-equipment.test.ts --maxWorkers=2`.
  Coverage includes all36 encounters/chests, exact tables/rewards, schedules,
  measured legal squad difficulty, access/history, atomic failure paths,
  Inventory warnings/reveal, independent menu binding and HTTP idempotency.
- Final `npm test -- --maxWorkers=2`: **3,669 passed,1 failed of3,670;
  163 passing files of164**. The sole failure remains the inherited
  `src/presentation/settings.test.ts` CSS policy assertion against D-309's
  device-only reduced-motion query in `src/character-screen.css`; not hidden,
  disabled or changed. An earlier full run also hit the existing randomized
  Conduit-equipment critical-hit assertion; its targeted rerun and final full
  run passed.
- `npm run build` via **Build Last Light** passed TypeScript/Vite (existing
  >500k chunk advisory). `node tools\bundle_server_game.mjs` regenerated the
  authoritative bundle; `npx tsc --project supabase\functions\game-operation\tsconfig.json`
  passed. Edited-file diagnostics and `git diff --check` passed.
- Unsaved browser fixtures checked all36 cards, warning cancellation/entry,
  the Lv145 boss and neutral scenery. Inventory's76-row Machines loot dialog
  and saved reward reveal fit the narrow viewport without horizontal overflow;
  reveal also fit desktop, retained focus and supported Skip/Continue.
  One Map-backed EX+3 opening made exactly one write, consumed one chest and
  persisted100 base Null-Prismatica plus two Master chests. Real localStorage
  was unchanged; fixtures were discarded and the title restored.
- Local only: no commit, push, owner grants, database migration or deployment.
  Final boss/chest artwork remains pending; client and generated server need
  coordinated authorized publication and a hosted smoke. No owner decisions
  remain open for this approved scope.

## Nonblocking battle errors (D-314)

- Battle rejection/failure messages now float above the footer without affecting
  battlefield or footer geometry. Alerts wrap within the viewport, pass clicks
  through and never steal focus or introduce busy states.
- Three-second display plus250ms fade/clear; new errors restart the lifetime,
  reduced motion disables the transition, render/disposal cancel timers.
- Validation: four targeted presentation suites passed29 tests (toolbar,
  squad gestures, authority and exit). Browser fixtures confirmed unchanged
  arena height/footer position, viewport-contained alerts, pointer pass-through,
  fading/clearing and enabled Menu at desktop/mobile widths.
- `npm run build` passed (TypeScript and Vite; existing large-chunk advisory).
  Edited-file diagnostics and `git diff --check` passed. Reduced-motion browser
  check confirmed zero-duration transition; preview made no account writes.
- Local only; no account writes, combat/economy changes or deployment.

## Complete Conduit redesign (D-313)

- Owner approves implementing the entire [D-302 roster](conduit-redesign.md):
  **85 ordinary Conduits and48 character Masters**, including flagged
  resurrection/action-economy/routing/kit transformations. Unlisted old stat
  bundles and reserve rules are removed, not retained underneath new prose.
  Stable IDs, art, rarity, prices/acquisition, ownership, saved upgrades,
  component costs and native character kits are preserved. D-311 character
  redesign remains a proposal; Calamity is subsequently approved under D-315.
- `tools/build_conduit_redesign.mjs` generates all133 exact descriptions and
  coefficient ranges from the approved tables. Continuous ordinary effects
  interpolate through+5; integer counts/durations step at+3; listed stat
  modifiers/penalties retain1+.5*level. Masters are fixed. Catalog metadata
  exposes only current stats/effects; the old executable reserve resolver is
  retired, retaining only historical snapshot types.
- Shared typed combat resolves actual native HP loss, owner/origin shield
  layers, Burn/Weaken clocks, generated nonrecursive effects, enemy scheduling/
  forced targets, support conversions, resource transforms, recovery exceptions,
  rescues and at-most-two manual actions. Targeted fixes cover rejected weaker
  applications, foreign/generated shield preservation, Foundation refresh
  separation, latest still-active taunts, no Crinso Defense polarity advance,
  native assist passives/buffs, full-Gauge Quiet Feather eligibility and no
  donated action on the round a member is revived.
- All effect/upgrade/Details/reference surfaces share current level-specific
  descriptions. Permanent stat totals include only listed stats; accessible
  readouts show real controls/protections/plates and linked Gauge income, not
  shared damage or retired reserves.
- Owner chooses **restart the current historical encounter**, not mixed old/new
  combat. Rules version2 preserves frozen squad/progression/captures/loadouts/
  upgrades and saved rewards, reconstructs fresh encounter resources and receipt
  ID, and shows a visible notice. Offline/online resume, Settings and stale
  commands use the same policy. Authoritative historical read/checkpoint commits
  the restart atomically/idempotently before returning it; failed persistence
  cannot expose an unsaved replacement or execute the stale command.
- Executable roster coverage: all85 ordinary names at six levels, equipped/
  unequipped (**1,020 cases**), plus all48 Masters equipped/unequipped
  (**96 cases**), and focused interactions/provenance/clock/permission tests.
  Final120/140 activity/dungeon/War benchmarks retain actual enemy stats and
  unbuilt defeats. Legal role-specific+5 builds and matching Masters clear the
  tested starter, Rose and mixed-team final encounters across seeds1/1729/12345;
  no rejected giant generic buffs or boss nerfs were restored to pass them.
- Final full command `npm test -- --maxWorkers=2`:
  **3,375 passed,1 failed of3,376;158 passing files of159**.
  The sole remaining failure is the inherited unrelated
  `src/presentation/settings.test.ts` CSS policy assertion against the D-309
  device-only reduced-motion query in `src/character-screen.css`. It was not
  hidden, disabled or changed as part of this equipment work.
- `npm run build` via **Build Last Light** passed (existing >500k chunk
  advisory). `node tools\build_conduit_redesign.mjs` regenerated133 definitions;
  `node tools\bundle_server_game.mjs` regenerated the checked-in engine;
  `npx tsc --project supabase\functions\game-operation\tsconfig.json` passed.
  `python -m unittest discover -s tools -p test_kit_conduit_art.py`:2 passed.
  Editor diagnostics and `git diff --check` clean.
- Final specialized Rose/Crinso rotation and interaction recheck:
  `npm test -- src\game\crimson-roses.test.ts src\game\conduit-redesign.test.ts --maxWorkers=2`:
  **122 passed in2 files**.
- Browser smoke loads the local title and an in-memory, unsaved upgraded
  loadout, showing four paginated cards and no retired Omnic bundles. No owner
  account/storage was funded or changed. The browser stalled on a later
  viewport/frame check, so no completed mobile visual-validation claim.
- Local only: no commit, push, account grant, database migration or deployment.
  Publish the client and generated authoritative server together only after
  explicit approval; hosted parity smoke remains a release step.

## Machines unowned-only Conduit drops (D-312)

- Owner requests no duplicate enemy Conduit drops and confirms equal selection
  among unowned names in each rolled rarity. A completed rarity grants no
  Conduit, compensation or alternate-tier reroll. Rare8%/Legendary3.5%/Omnic1%
  from stage75 and independent boss/ordinary odds remain unchanged.
- Shared resolver filters account ownership; each resolved kill reserves its
  awards before later kills in the action. Battle state carries that inventory
  through Continue/replay; offline rendering refreshes from current holdings.
  Server entry/retry/actions refresh from the authoritative account, including
  historical run snapshots missing inventory. Frozen fighter loadouts remain
  untouched. Atomic reward validation rejects owned names, preserving receipts,
  write-failure retries and historical duplicate counts/upgrades.
- Account-specific View Loot initially and on stage changes shows owned names
  at0% and evenly divides the unchanged tier chance among remaining names.
  Activity/rules text explains completed tiers. Banner bonuses, final-boss
  Master chests, components, currencies and their RNG remain unchanged.
- Verified **328 tests in9 files passed**:
  `npm test -- src\game\machines.test.ts src\online\server-game.test.ts src\presentation\creature-loot-dialog.test.ts src\game\kit-conduits.test.ts src\game\loot-table-parity.test.ts src\game\master-conduits.test.ts src\game\account.test.ts src\game\banner-pity.test.ts src\presentation\battle-exit.test.ts --maxWorkers=2`.
  Covers exact tier boundaries, remaining-name probabilities, exhausted pools,
  two successful Rare rolls in one AoE awarding the last name once, unchanged
  RNG streams, invalid/failed writes, receipt retries, preserved investments,
  offline replay and authoritative entry/Continue/replay/historical resume.
- `npm run build` passed via Build Last Light task (existing >500k chunk
  advisory). `node tools\bundle_server_game.mjs` regenerated the checked-in
  engine; `npx tsc --project supabase\functions\game-operation\tsconfig.json`
  passed. Editor diagnostics clean; no current full-regression claim.
- [Exact specification](awaken-the-machines.md#unowned-only-enemy-conduit-drops-d-312),
  Conduits/index/decision log/server deployment notes updated. Local only:
  no commit, push or deployment. Website and server need coordinated
  publication; prior D-301 deployment permission is not blanket approval.

## Distinct character redesign review (D-311)

- Owner rejects copycat ability setups/play patterns across all16 bearers,
  specifically Infernis versus Crinso. Explicitly chooses complete16-character
  design review before implementation, not immediate combat edits.
- Audited actual combat/flagship/War definitions and current D-173 native loops:
  repeated low-HP passives, tank shield/AoE ultimates, Atmospheric crit-charge
  engines and Weaken ladders. [Complete proposal](character-identity-redesign.md)
  defines replacement passive/Skill1/Skill2/Last Flare, numeric first pass,
  decisions and trade-offs for every character.
- Proposed contrasts: Infernis Burn maintenance/detonation versus Crinso
  alternating direct duel combo; Tizu timed barrier, Bruno interception,
  Razor HP-loss revenge, Orvella finite shared structure; Atmoso delayed field,
  Elise two-blade placement/recall, Vaelor three-turn rhythm; Flora delayed
  Seeds, Bliss allied action order, Disciple ally instruction, Aurora hostile
  forecasts, Rosetta coordinated quarry, Thornia enemy-triggered trap,
  Nerithe Normal-earned Survey/pierce.
- New ally targeting/pipeline, caps, provenance, snapshot transition and numbers
  remain proposals needing approval. Preserve acquisition/owned investment,
  base stats/growth, costs, successive-turn ordinary skills, Last Flare recovery
  and captured cap60. D-302133-item equipment proposal needs compatibility
  review before either dependent redesign ships; no silent loss of owned effects.
- Documentation-only, no live mechanics/assets/account/server changes, tests
  or builds. Index/current kit spec/equipment proposal/decision log updated.
  Prior local features and deployment status preserved. Await owner roster
  review and implementation approval.

## Character-header element medals (D-310)

- Owner requests matching medal in the shown character detail header. Reused
  `elementLabel` for all16 bearers and captured detail headers,36px beside
  stars/role/rarity with readable element name. Captured copies use actual
  combat element, not infusion/fodder family. Removed duplicate plain element
  from prefix; upgrade refresh matches it and preserves medal image DOM.
- `npm test -- src\presentation\upgrade-reference.test.ts
  src\presentation\reference-ui.test.ts --maxWorkers=2`:86 tests in2 files passed.
  All16 headers, refresh identity and captured elements covered. Build Last Light
  (`npm run build`) passed with existing chunk advisory; edited TS diagnostics
  clean. In-memory Crinso fixture at1440/390px loads the correct Chaotic medal
  at36px without page overflow. No owner account/save changes.
- Presentation-only, local/not committed/pushed/deployed. Calamity remains
  planning-only; previous unrelated local work preserved.

## Expanded evolution copy picker (D-309)

- Owner screenshot targets captured-copy selection inside Evolution. Removed
  the64-96px compact list/40px portraits; organized detail now places the picker
  full-width below stat/resources, with96px desktop/72px mobile portraits,
  responsive cards and a tall bounded list for large holdings.
- Eligible-first ordering preserves saved copy numbers and every disabled
  protected copy/reason. Live selection updates progress, eligible total,
  ready/excess text, selected labels and viewed-bearer accent. Missing eligible
  copies get activity/form/protection guidance; irreversible consumption stays
  explicit. No eligibility, save, cost, confirmation or transaction changes.
- Shared `updateEvolutionSelection` replaces inline main-handler updates and
  retains explicit missing-control errors. New presentation tests cover
  full-width placement, sorting/protections, exact-count/over-selection,
  insufficient resources, meter/status updates and no account mutation.
- Validation: `npm test -- src\presentation\upgrade-reference.test.ts
  src\game\evolution-fodder.test.ts src\presentation\reference-ui.test.ts
  src\presentation\upgrade-result.test.ts --maxWorkers=2`:102 tests in4 files
  passed. Build Last Light (`npm run build`) passed with existing chunk advisory;
  edited-file diagnostics clean. Browser in-memory fixture verifies larger
  cards and live selection with no owner-save changes. Final fixtures at
  1440/390/320px show no page/card horizontal overflow,96/72px portraits,
  full-width picker and visible six-star ratings/reasons. Actual checkbox click
  updates the meter/status, accent border/background and Evolve readiness.
  Focused `git diff --check` passed; fixture cleared by page reload.
- Local only, not committed/pushed/deployed. Calamity remains planning-only.

## Calamity Mode planning only (D-308)

- Owner requests a plan, not implementation. Confirmed12 activities (six named
  farms/infusions/Machines/event plus six material dungeons),36 EX stages,
  single activity-specific boss at145/160/185, same identity across its tiers.
  Excludes Story, Training and all Elemental War activities.
- Clarifications confirmed: unlimited replay guarantees one matching chest per
  victory; normal final clear then sequential EX clears unlock permanently;
  chest replaces all normal kill drops/captures/recruitment; chest opens later
  from Inventory;3/5/7 independent curated activity loot bundles, not quantity
  multipliers; EX+3 grants two existing Cosmic Grand Master Chests.
- Fixed chest currencies:100k/250k/500k Prismatica and50/70/100
  Null-Prismatica. Red/white energy versus black/white materials and unique
  activity chest designs; explicit unforgiving entry warnings.
- [Full plan](calamity-mode.md) separates confirmed requirements from proposed
  boss roster, activity loot candidates, difficulty direction, UI/persistence/
  online rollout and required tests. Current stat helpers reject>140; isolate
  Calamity rather than altering ordinary tuning. Current direct Master-chest
  validator is Machines-final-only; add a separate validated opening source.
- Economy impact explicit:24 EX+3 openings yield48 selectable Master chests.
  No secret cap/entry price/drop chance is approved. Exact tables/mechanics,
  measurable difficulty, historical final-clear evidence, free-entry policy
  and optional arena/header/audio scope remain review items.
- Documentation-only: no gameplay, saves, assets, server changes or deployment.
  Tests/build not run for this planning-only task. Existing local D-303 through
  D-307 changes and publication status remain untouched.

## Per-member squad attack grid and leveling recheck (D-307)

- Reproduced the second member's guide off-screen at1440x1000: the staggered
  button's40px CSS translate establishes a fixed-position containing block,
  offsetting the already viewport-based guide coordinates a second time.
  The guide now mounts directly under the battle root, tracks the held actor,
  preserves their element accent and cleans up on cancellation/lost capture/
  disposal. All three slots retain the existing offline/online actor dispatch;
  no combat math, Gauge costs, cooldown rules, RNG or saves change.
- Added `src/presentation/battle-squad-gestures.test.ts`: own icons/availability,
  per-member status, all three positions' one-time offline/online dispatch,
  captured squad member, center cancellation, lost capture, disposal, pending
  pointers and unavailable actors.
- D-303 already routes single leveling, Max Level, previews and authoritative
  transactions through the cumulative31/46/61/76/91 recipe. Rechecked boundaries,
  all16 Element-Bearers, Rosethorn and additive specialty costs. Preserve D-305:
  captured copies stop at60 and therefore do not spend higher tiers above60.
- `npm test -- src\presentation\battle-squad-gestures.test.ts
  src\presentation\battle-shortcuts.test.ts src\presentation\battle-gesture.test.ts
  src\presentation\gesture-guide.test.ts src\game\leveling-materials.test.ts
  src\game\max-level.test.ts src\online\server-game.test.ts --maxWorkers=2`:
  all134 tests in7 files passed.
  Build Last Light (`npm run build`):passed with existing chunk-size advisory.
  `npx tsc --project supabase\functions\game-operation\tsconfig.json`:passed.
- In-memory browser fixtures at1440x1000 and390x844 confirm each member's
  guide stays inside the viewport, with its own actor/element and visible phone
  status. Pointer events were dispatched with fixture-only capture shims;
  native pointer capture was not browser-validated. No owner data modified.
  Fixture was disposed and page reloaded; edited-file diagnostics and focused
  `git diff --check` passed.
- Local only: no commit, push or deployment. D-303 through D-306 still need
  coordinated client/server publication; D-307 is client presentation only.

## Conduit Max Level (D-306)

- Owner requests Max Level on the existing Conduit upgrade screen, like
  character Max Level. Added alongside single-step upgrades: highest affordable
  target up to+5, exact sum of existing rarity costs, game-native confirmation
  with current/target effects and penalties, one component/upgrade save.
  Common+0 with829 reaches+5 for600 and leaves229; partial affordability
  advances only through fully funded sequential steps. Masters stay unchanged.
- Shared `conduitMaxLevelPlan`/`upgradeConduitToMaximum` validate ownership,
  expected level/target/cost and current funds; stale/forged/no-op requests or
  failed writes spend nothing. New strict authoritative `maxConduit` operation
  is wired to both menu binding paths; generated server bundle refreshed.
  Online never uses an offline fallback or repeated per-level requests.
- Both action types share a pending guard across refresh/rebind. Tests caught
  and fixed duplicate-click early returns releasing another action's guard.
  Actual saved final level/total drives one receipt; filters/selection/page,
  other holdings/upgrades/gear and frozen active battle snapshots survive.
- `npm test -- src\game\conduit-max-level.test.ts
  src\game\conduit-upgrades.test.ts
  src\presentation\conduit-max-level.test.ts
  src\presentation\conduit-upgrade.test.ts
  src\presentation\conduit-upgrade-catalog.test.ts
  src\presentation\conduit-menu-update.test.ts
  src\presentation\reference-ui.test.ts
  src\online\server-game.test.ts --maxWorkers=2`:all325 tests in8 files passed.
  Includes all85 ordinary names' exact affordability boundaries and all upgrade
  starting levels, UI click/confirmation/cancellation/errors and online atomicity.
  `node tools\bundle_server_game.mjs`:passed.
  `npx tsc --project supabase\functions\game-operation\tsconfig.json`:passed.
  Build Last Light (`npm run build`):passed, existing chunk-size advisory.
  Final focused rerun after Information text:29 tests in4 files passed.
  Edited-file diagnostics and `git diff --check`:passed.
- Browser in-memory fixture confirms+0->+5 for600 from829: exactly one write,
  remaining229, correct saved receipt and cap/status focus. Enabled Max Level
  fits at390px with a49px target. No owner save or account was modified;
  fixture and temporary presentation styling were cleared by reload.
- Local only: no commit, push or deployment. Coordinated client/game-operation
  publication remains needed for D-303 through D-306. D-302's Conduit redesign
  remains review-only; this convenience feature does not implement its effects.

## Captured Elemental-Devourer level60 ceiling (D-305)

- Owner requests all captured copies cap at60, with higher-level captures
  restored to60. Shared `capturedLevelCap` drives creation, validation,
  metadata-free progress, playable stats, single-level and Max Level, plus
  both captured detail layouts. Higher-level kill reward events and persisted
  copies agree on60; source stage, fixed form and exact hostile skills remain.
  Rose duplicate awards now join at60; Treasury duplicates remain50.
- Valid historical levels61-120 normalize without load-time writes or refunds.
  First successful transaction persists normalized data. Identity, locks,
  equipment, currencies, ownership, squads and skill provenance survive.
  Invalid metadata still rejects. Captured leveling uses Common/Uncommon/Rare
  through60; D-303's higher tiers still apply to Element-Bearers.
- Online read/public responses and resumed snapshots also cap existing copies.
  Snapshot HP/Attack/Defense scale on the existing linear playable curve,
  preserving HP/shield proportions and Gauge/spent/recovery/cooldown state;
  no menu-team refresh, healing, revival or RNG/reward changes. Enemy
  encounter levels and Rose enemy120 capture eligibility remain unchanged.
- Tests cover every authored capturable form, real capped rewards in all five
  modes, atomic/receipt-deduplicated saves, forged reward rejection, old-save
  read-only normalization, max/stale-level rejection and idempotent active-run
  adjustment. Updated older fixtures/assertions to the new approved ceiling.
- Build Last Light task (`npm run build`):passed, existing chunk-size advisory.
  `node tools\bundle_server_game.mjs`:passed.
  `npx tsc --project supabase\functions\game-operation\tsconfig.json`:passed.
  `npm test -- --maxWorkers=2`:all2,304 tests in149 files passed.
  Edited-file diagnostics and `git diff --check`:passed.
  Browser presentation-only fixture: a Lv120 source becomes Lv60, details show
  Level60/60 and Maximum level60 with no level-up action. No owner save changed.
- Local only; no commit/push/deployment. Coordinate client and authoritative
  game-operation publication, including pending D-303/D-304. No further owner
  design decision is needed; D-302 Conduit redesign remains review-only.

## Direct Unequip All control (D-304)

- Owner requests a button directly in the viewed member's Conduit screen and
  explicitly includes the Master. Loadout heading now offers Unequip All,
  disabled when neither ordinary nor Master gear is equipped. Captured
  Elemental-Devourers use the same control without a Master.
- Shared `unequipAllConduits` validates profile/current ownership, clears all
  eight slots and any equipped matching Master in one save. Strict online
  operation/dispatch and regenerated engine bundle use the same transaction.
  Ownership/upgrades, currencies, other members and frozen active runs remain.
  Existing click handler refreshes the full page/status and restores focus
  to Back; existing online busy/error handling applies.
- `node tools\bundle_server_game.mjs`:passed.
  `npm test -- src\game\conduit-equipment.test.ts
  src\presentation\conduit-loadout.test.ts
  src\online\server-game.test.ts --maxWorkers=2`:107 tests passed.
  `npm test -- --maxWorkers=2`:all2,297 tests in148 files passed.
  Build Last Light task (`npm run build`):passed, existing chunk-size advisory.
  `npx tsc --project supabase\functions\game-operation\tsconfig.json`:passed.
  Edited TypeScript diagnostics and `git diff --check`:passed.
- Browser presentation-only fixture verifies the direct button is enabled
  with gear, has a45.6px target and fits its heading at390px width; no owner
  save modified. Atomic persistence/captured/Master-only eligibility and frozen
  online-run preservation are covered by the tests above.
- Local only: no commit, push or server deployment. Publish client and
  authoritative game-operation together for online availability, including
  the pending D-303 leveling rules. D-302 redesign remains review-only.

## Cumulative higher-rarity leveling costs (D-303)

- Owner requests higher elemental rarities as levels rise, explicitly includes
  captured Elemental-Devourers and equivalent Rosethorn rarities for Roses,
  and selects cumulative destination thresholds31/46/61/76/91. Every level
  requires one of each unlocked Uncommon/Rare/Epic/Legendary/Omnic tier,
  plus unchanged `ceil(destination/30)` Common and Prismatica.
  [Exact recipe](units-and-progression.md#cumulative-leveling-rarities-d-303).
- Shared `levelingMaterials` drives all16 Element-Bearers and captured
  single-level/Max Level previews and transactions. Rose Element-Bearer
  Evo5/6 Soul surcharge is added, not overwritten: destination91+ costs
  two Souls, while captured Roselius cost one. Existing matching ordinary
  specialty items, evolution recipes, caps, saved levels and holdings remain.
  No migration, retroactive spending, new rewards or load-time writes.
- Character Information explains the cumulative schedule from the same typed
  thresholds. Existing Character/captured cost surfaces render the complete
  recipe automatically; Max Level stops before missing higher tiers.
  Authoritative single/bulk tests reject every missing material and stale
  Common-only previews without mutating inputs or spending partial costs.
- `node tools\bundle_server_game.mjs`:passed, shared engine regenerated.
  `npm test -- src\game\leveling-materials.test.ts
  src\game\max-level.test.ts src\game\account.test.ts
  src\game\captures.test.ts src\online\server-game.test.ts
  src\presentation\upgrade-reference.test.ts
  src\presentation\menu-information.test.ts --maxWorkers=2`:198 passed.
  Initial full-suite failures were old Common-only fixture budgets/expected
  recipes; updated them to fund/assert the approved cumulative tiers.
  Final `npm test -- --maxWorkers=2`:all2,293 tests in148 files passed.
  `npm run build`:passed, existing chunk-size advisory.
  `npx tsc --project supabase\functions\game-operation\tsconfig.json`:passed.
  Edited TypeScript diagnostics and `git diff --check`:passed.
- Local implementation/source/bundle only; not committed, pushed or deployed.
  D-301's already-hosted reward/replay correction remains live; D-303 requires
  coordinated website and game-operation publication for matching visible/
  authoritative leveling costs. Prior publication approval was D-301-specific.
  Prior dirty replay work and D-302 review proposal are preserved; Conduit
  mechanics remain unchanged and still await owner review.

## Complete Conduit redesign proposal (D-302)

- Owner requests genuinely distinct effects across every character feature,
  explicitly includes85 ordinary Conduits plus48 character Masters, authorizes
  creative proposals affecting any mechanic, and chooses upgrade-scaled special
  effects with explicit caps. Owner then selects a complete design roster for
  review before combat implementation.
- [Review deliverable](conduit-redesign.md) covers all133 existing IDs/names,
  rarity/element/character assignments, exact ordinary +0/+5 effects and
  interpolation/threshold rules,48 fixed Master designs, coverage categories,
  interaction precedence and implementation/validation gates.
  Removes repeated stat-bundle/Astral-Reserve templates in the proposal and
  replaces obsolete ordinary-skill cooldown reductions with useful roles.
- R/T/G/K flags call out resurrection/lethal prevention, action/recovery
  changes, routing/threat and skill/resource/control transformations for
  individual review. No new economy, acquisition or Master upgrade system
  proposed. Existing owned IDs/levels/art/prices/drop rules remain.
- Status: documentation-only design, not approved detailed mechanics, not
  implemented, not deployed. Live stat-only upgrades, existing Master rules
  and all account/combat behavior remain unchanged. Earlier D-301 dirty work
  is preserved; no commit or server/client publication performed here.
- Verification: inline `node --input-type=module` catalog/TypeScript-AST audit
  passed all133 unique exact IDs/names,10/15/15/45 ordinary rarity counts,
  all45 element assignments,48 Masters, complete row numbers, distinct effect
  text and proposal file-link targets. `git diff --check`:passed. These are
  coverage checks, not gameplay/balance tests; no build/suite needed for docs.
- Next: owner review of the roster and flagged mechanics, stat-bundle removal/
  scaling and active-run compatibility. Then implement all affected runtime,
  UI, shared server and tests coherently; do not activate descriptions without
  their mechanics or mix new rules with old frozen stat snapshots.

## Victory replay and hosted loot parity (D-301)

- Owner requests Replay stage and reports advertised rewards missing in the
  published online game. Confirmed live game-operation version12, last updated
  2026-10-14 06:20UTC, still used the oldLv23 Story Uncommon gate. Downloaded
  source to isolated session artifacts; hosted smoke reproduced missing early
  Uncommon drops while local/client tables expected them.
- Added Replay stage to every staged victory, including terminal stages.
  Reuses restart controls; online retry now permits cleared staged encounters
  as well as defeat. Fresh run/receipts/HP/Gauge, same frozen squad/loadouts,
  saved rewards/unlocks retained. No claim/bonus repeat; new enemies may add
  seen discoveries. Active/cleared Training retry restrictions remain.
  [Contract](free-battle.md#victory-stage-replay-and-online-loot-parity-d-301).
- View Loot now explicitly explains per-enemy chances versus guaranteed100%
  drops. No probability increases or retroactive grants. New local parity
  tests cover all120 Training levels,150 Story stages,210 dungeon stages,
  255 other activity stages and30 War bosses, actual rewards/guarantees and
  belowLv23 Uncommon reachability. Existing boundary tests retain exact odds.
- `npm test -- --maxWorkers=2`:all2,260 tests passed in147 files.
  `npm run build`:passed, existing chunk-size advisory.
  `node tools\bundle_server_game.mjs`, server TypeScript and smoke-script syntax
  check:passed. Edited diagnostics and `git diff --check`:passed.
  Browser fixture at1600x1000/488x1055/400x710 shows44px Replay controls,
  no horizontal overflow; shortest viewport scrolls to the reachable button.
- Owner explicitly approved live server publication. Ran
  `npx supabase functions deploy game-operation --project-ref
  ohtfgwomdfteaxubndww --no-verify-jwt`:succeeded.
  `node tools\smoke_server_game.mjs --loot-parity`:passed36 live early/final
  cases with exact local/server rewards, boosted final amounts, unchanged
  rare counts, separate first-clear bonuses, persisted accounts, idempotency,
  early Uncommon drops and victory replay. All disposable identities and
  cascading records removed; no owner account/session edits.
- Server fix is live and includes D-300 no-cooldown skills. Website Replay
  button/copy/tests/docs remain local for the next normal repository push;
  no commit or Pages publication performed here. Pages pushes do not deploy
  game-operation; shared-rule changes require explicit server deployment.

## Successive-turn squad skills (D-300)

- Owner requests no ability cooldowns except Last Flare and explicitly includes
  captured Elemental-Devourers. All16 Element-Bearers'32 ordinary skill fields
  are zero; captured Skill1/Skill2 resolve with no cooldown while retaining raw
  saved enemy intervals. Old readiness dates in resumed runs no longer block
  these skills. Updated Battle/Character/captured references accordingly.
  [Contract](combat.md#successive-turn-squad-abilities-d-300).
- Gauge costs, one action per turn, missing captured slots, enemy schedules,
  Last Flare100 Gauge/next-turn recovery and captured ultimate cooldowns remain.
  No account migration/load writes, auto-refills or Conduit redesign.
  More frequent skills now let the tested soloLv38/Evo2 Infernis clear early
  material stages; final unbuilt solo clears still fail. Updated that exact
  balance expectation rather than changing enemy stats.
- `node tools\bundle_server_game.mjs`:regenerated shared server artifact.
  `npx tsc --project supabase\functions\game-operation\tsconfig.json`:passed.
  `npm test -- --maxWorkers=2`:all2,223 tests passed in146 files, including
  all16 character repeat-skill cases, captured repeats, old snapshots,
  authoritative-operation repeats and retained Last Flare restrictions.
  `npm run build`:passed, existing chunk-size advisory only.
  Edited-source diagnostics and `git diff --check`:passed.
- Historical completion status (server subsequently deployed under D-301):
  local client/server source and bundle only. Both client and game-operation
  function must be published for hosted parity; neither deployed in this task.
  No owner accounts or live sessions modified.

## Battlefield sprite contrast

- Owner screenshot shows unselected green enemies blending into Botanic
  scenery. Shared battlefield sprite images now have an alpha-following dark
  edge, narrow pale rim and soft shadow, independent of selection. Both sides
  and captured copies share the treatment; colors, bytes, scale, facing,
  VFX, menus/cut-ins and gameplay/account behavior are unchanged.
  [Contract](combat.md#battlefield-silhouette-contrast).
- `npm test -- src\presentation\battle-squad-art.test.ts
  src\presentation\battle-scale.test.ts src\presentation\battle-impact.test.ts
  src\presentation\battle-cutin.test.ts --maxWorkers=2`:49 passed.
  `npm run build`:passed, existing chunk-size advisory only.
  Edited CSS/test diagnostics are clean.
- Presentation-only browser fixture reviewed with Loamjaw Mole/Mossplate Beetle
  against their real forest arena at1600x1000. At488x1055, verified every sprite
  receives the contour, image width is identical with/without it, selected glow
  and fallen grayscale/opacity remain intact, and no horizontal overflow.
  Preview screenshot stays in session artifacts; no owner save writes.
  Local changes only, not deployed.

## Artwork-led battle size consistency

- Owner reports small large-creature sprites and oversized characters, then
  clarifies all characters should be consistent while enemy artwork dictates
  small/large presence. Removed solo/side sizing bonuses, reduced common
  character ensemble inflation and reviewed151 enemy designs into six bounded
  artwork-keyed bands. Story now participates; captured copies, merged dungeon
  families and War character forms use their actual artwork identity.
  [Contract](combat.md#artwork-led-battlefield-sizes).
- Equal arena columns share one roster-aware responsive base. Mobile retains
  scale metadata, no longer flattening all designs to fixed viewport caps.
  No art bytes, facing, menus/cut-ins, combat math, saves or server changes.
-16 browser fixture/viewport combinations (stag pair, small creatures,
  colossus and full late-form squads at desktop/tablet/two phone settings)
  preserve measured scale ratios, keep artwork inside the arena, avoid own
  label overlap and have no horizontal overflow. Four additional short-wide
  fixtures checked: solo cases fit; a full squad at488px viewport height with
  200px reserved header/footer scrolls inside the arena. Verified the final
  allied card is reachable at the scroll endpoint, without footer overlap.
- Final validation: `npm test -- --maxWorkers=2` passed all2,185 tests in146
  files. `npm run build` passed TypeScript/Vite with the existing chunk-size
  advisory. Edited source diagnostics are clean. Changes are local only;
  no deployment, gameplay/account changes or owner save writes.
  Contact sheets and geometry report are session artifacts; no account writes.

## Prevent line-ending-only merge conflicts

- Four resolved merge conflicts contained identical fixes with LF locally
  and CRLF in GitHub API commits. No repository attributes previously existed;
  this computer's global Git `core.autocrlf=true` was the only policy.
- Added shared `.gitattributes`: auto-detected text uses LF in Git/checkout;
  Windows batch/command scripts use CRLF working copies, binary files retain
  their bytes. Workspace VS Code defaults new files to LF.
- [Contributor workflow](development-guide.md#line-endings-and-concurrent-changes)
  documents normalization, one-checkout publication and LF-only remote API
  edits. This does not suppress genuine conflicting changes.
- `git add --renormalize .`:no existing tracked content required conversion.
  Verified all four previously conflicted index blobs contain LF, LF/CRLF
  sample text hashes identically through Git's policy, a real PNG retains its
  unfiltered hash, VS Code configuration parses and `git diff --check` passes.
  Policy/settings/docs only; no gameplay tests required. Not committed/pushed.

## Compact Conduit reward dialogs

- Owner screenshot shows the upgraded Conduit image pushing saved details
  below the dialog fold. Shared Conduit receipts now use a compact120px/16dvh
  art stage and tighter text spacing. Purchases reuse the same receipt layout;
  catalog/equipment icons and summon portraits are unchanged.
  All exact effects, costs, ownership, meters and Continue/Skip remain.
  [Contract](conduit-upgrades.md#implemented-editable-first-pass-balance).
- `npm test -- src\presentation\summon-presentation.test.ts
  src\presentation\reward-screen.test.ts
  src\presentation\conduit-upgrade.test.ts --maxWorkers=2`:25 passed.
  Build Last Light (`npm run build`):passed, existing chunk advisory only.
  Edited-file diagnostics and `git diff --check`:passed.
- Local browser fixture uses the actual saved Prism Splinter Socket+1 markup
  and application CSS, with no transactions/save changes. At three desktop/
  mobile viewport settings, the complete receipt and Continue fit with zero
  content scrolling/horizontal overflow after reveal animations finish.
  Localhost5173 is responsive. Not published to GitHub Pages.

## Hide satisfied activity unlock requirements

- Owner requests removing completed unlock conditions. Dungeon, infusion,
  currency, Machines, War and Rose event entry footers now omit requirements
  and highest-level hints when unlocked. Locked entries retain their hints
  and disabled actions; stage choices and access validation are unchanged.
  [Contract](gameplay-and-elements.md#activity-organization).
- `npm test -- src\presentation\activity-banner.test.ts --maxWorkers=2`:
  13 passed, including9 account/threshold cases across all15 staged entries,
  the Machines regional-clear prerequisite and account immutability.
  Build Last Light (`npm run build`) passed with the existing chunk-size
  advisory; edited-file diagnostics and `git diff --check` passed.
  No save/server change or deployment.

## GitHub Pages online configuration repair

- Owner reports "Online accounts are not configured for this deployment"
  on the published game. The live main bundle checked on2026-10-14 contains
  the account client but neither the project URL nor a publishable key.
  Local ignored `.env.local` has valid settings; the committed Pages workflow
  did not pass either setting into its build. This error occurs before any
  authentication request and does not establish account loss or server failure.
- Pages build now receives `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY` from repository Actions variables, falling
  back to same-name secrets. An explicit guard rejects missing/invalid values
  and server secret keys before building/uploading. No keys are committed.
  [Setup and recovery](development-guide.md#online-account-configuration).
- Validation: exact workflow guard passed5 cases (valid local configuration,
  missing URL, missing key, server secret and placeholder URL);
  `npm test -- src\online\account-client.test.ts --maxWorkers=2`:9 passed;
  Build Last Light (`npm run build`):passed with existing chunk-size warning.
- Owner authorized GitHub access and publication, then approved fixing CI
  blockers. Both repository Actions variables are configured from local
  settings. Only the workflow, generated portrait revisions, offline-save
  regression test and deterministic VFX test clock were published; unrelated
  dirty game changes remain local.
- Previous two deployments failed before publication: stale portrait hashes
  and a Settings source assertion missing the existing music argument.
  Regenerated hashes without changing PNGs and updated the assertion.
  The next run exposed real-clock jitter in a synthetic-frame VFX test; its
  performance clock now follows the controlled frame timestamp, preserving
  timing/impact assertions and production behavior.
- Published commits: `a358e11` (workflow), `bc80f3a` (existing blockers),
  `1597d71` (deterministic test clock). Actions run38588307547 passed all2079
  tests, production build and Pages deployment on2026-10-14.
  Local targeted suites:22 portrait/offline-save tests and28 VFX tests passed.
  `git diff --check` for the four published files passed.
- Live `main-ZT8ggXca.js` verified to contain both account settings;
  Supabase public authentication settings and account-auth OPTIONS return200.
  No account/session/save resets or server changes. Actual owner credential
  login remains untested; no passwords requested. This does not publish the
  unrelated uncommitted balance/loot work in this workspace.

## Story uncommon consistency fix (D-297)

- Owner reports Story text says Common+Uncommon rewards while early Story
  fights only dropped Common. Story now always includes both tiers from the
  first encounter onward: Common stays guaranteed; Uncommon chance scales
  linearly from25% at Lv1 to80% at Lv55 with the same quantity curve.
- Applied in the shared Story source table, so combat rewards, Collections
  loot tables, stage-detail rewards and account validation stay consistent.
  Element IDs, quantities and first-clear bonuses are unchanged.
- Updated Story documentation to remove the outdated Lv23 unlock wording.
- Validation:
  `npm test -- src\game\story.test.ts src\content\creatures.test.ts
  src\game\account.test.ts src\presentation\story.test.ts
  src\presentation\gameplay.test.ts --maxWorkers=2` (52 passed),
  plus Build Last Light (`npm run build`) passed.

## Shared enemy art containment (D-296)

- Owner screenshot shows late undiscovered Machine portraits painting over
  card text. Current Collections already passes D-291 containment checks;
  exact screenshot overlap was not reproduced before this change.
- Promoted bounded art-row rules to shared glossary styles: fixed220px base
  slot, zero-minimum grid tracks,100% contain-fitted images/SVGs and an overflow
  boundary. Collections keeps its existing11rem slot. No source/runtime PNG,
  facing, silhouette/discovery, reward or save changes.
  [Contract](archives-and-elements.md#shared-enemy-artwork-containment-d-296).
- Native isolated Chrome verifies all151 cards at1280/953/390/320px on both
  Collections and standalone glossary: artwork inside its slot and above the
  name, no horizontal overflow. Includes the late Machine silhouettes in the
  supplied screenshot. Reports/screenshots/script in session artifacts;
  temporary profile and spawned browser cleaned; no owner save writes.
- `npm test -- src\presentation\archives-controls.test.ts
  src\presentation\archives.test.ts src\content\creatures.test.ts
  --maxWorkers=2`:21 passed across3 files. Build Last Light (`npm run build`):
  TypeScript/Vite passed with existing large-chunk advisory.
  `git diff --check`:passed. Client-only, no deployment/commit/new dependency.
  Localhost remains running; refresh an older client to pick up current styles.

## Enemy View Loot and Conduit View Details (D-295)

- Owner requests moving long enemy tables behind View Loot and opening each
  Conduit's information from its loot row. Every enemy card now has View Loot
  beneath identity/lore/artwork status; previously visible loot is contained in
  a native Information dialog. Undiscovered/encountered entries keep a disabled
  button plus defeat-to-reveal explanation. Existing discovery gates remain.
- Dialog retains live stage/Training-level amounts/percentages, bonus notes,
  sale previews and upgrade meters. Shared drop-roll explanations are deduped
  below the table instead of repeated in narrow rows. Amount/Chance headings
  remain separated and the table fits320px without horizontal scrolling.
- Each Conduit has View Details, with shared saved-upgrade/current/+5 effects,
  art/rarity/lore/power/acquisition/banner eligibility. Archive uses the same
  reference, retaining unowned-art silhouettes. Native nested close/Escape
  returns focus to the Conduit button; loot selection/scroll remains intact.
  Loot close returns to the original enemy button. Browsing writes nothing.
  [Current contract](archives-and-elements.md#enemy-loot-and-conduit-details-dialogs-d-295).
- `npm test -- src\presentation\creature-loot-dialog.test.ts
  src\presentation\archives-controls.test.ts src\presentation\archives.test.ts
  src\content\creatures.test.ts src\presentation\information-topics.test.ts
  src\presentation\conduit-upgrade.test.ts src\presentation\ui-copy.test.ts
  --maxWorkers=2`:43 passed across7 files. New5 tests exercise all enemies'
  first/last loot stages, every Conduit row/details, unique IDs, dynamic stage
  changes, nested Escape, silhouettes, upgrade levels and unchanged accounts.
- Build Last Light (`npm run build`):TypeScript/Vite passed with existing
  large-chunk advisory. Edited-file diagnostics and `git diff --check`:passed.
  Native isolated Chrome1280/390/320px verifies modal/table bounds, separated
  headings, actual upgrade-aware details, Escape/focus return and compact cards.
  Screenshots/report live in session artifacts; exact temporary browser profile
  and spawned process cleaned. No owner saves changed.
- Client-only: no server deployment, account/save/reward changes or new
  dependencies. Localhost remains running; no commit or unresolved decision.

## Repeatable final-boss rewards (D-294)

- Owner selects5x existing currency/material/component quantities, including
  every replay and all six Story regional bosses, and approves deploying the
  validated signed-in engine. Shared terminal classifier covers21 endpoints:
  six Story bosses25/50/75/100/125/150; six material dungeons35;
  Heaven/Abyss35, Treasury/Sanctuary25, Roses35, Machines100; three War modes10.
  Endless Training and earlier ordinary/boss encounters are unchanged.
- Sample the original quantity before multiplying by5, preserving every
  probability decision and RNG draw. Final ranges use the5-unit lattice.
  Conduit/chest counts remain1 per successful roll; capture/recruitment chances,
  owned-recruit conversion100 and separate Story first-clear bonuses are unchanged.
  No extra clear transaction, load write, retroactive reward or schema change.
- Exact examples: Machine final625 BMC; dungeon/infusion/Rose final successful
  materials15-30; Treasury24,300-48,600 Prismatica; War25,000-40,000 plus60%
  chance of25 Null-Prismatica. Sanctuary final80% chance of25; Heaven/Abyss
  final0/5/10/15 at75/10/10/5%. All save in the existing atomic kill receipt.
  [Current specification](free-battle.md#repeatable-final-boss-loot-d-294).
- Updated runtime tables, validator (including final quantity divisibility),
  Collections loot, Gameplay Information/Battle menu/event rules and related
  mode docs. New32-test endpoint suite covers all21 real kills, replay/dedupe,
  all regional first bonuses, unchanged rare counts, sample/RNG/premium parity,
  forged quantity rejection, overflow and denied persistence.
- `npm test -- --maxWorkers=2`:2,159 passed;5 existing unrelated failures across
 2 files (offline-save Settings source-regex, Rosetta/Thornia/Crinso/Bliss
  portrait-byte revisions). All reward, authoritative server and Information
  suites pass. An additional focused10-file economy/help run passed154 tests.
- `npm test -- src\game\final-boss-loot.test.ts --maxWorkers=2`:32 passed.
- Build Last Light (`npm run build`):TypeScript/Vite passed; existing large-chunk
  advisory only. `node tools\bundle_server_game.mjs`,
  `npx tsc --project supabase\functions\game-operation\tsconfig.json --pretty false`
  and `npx --yes deno check supabase\functions\game-operation\index.ts`:passed.
  Edited-file diagnostics, smoke syntax and `git diff --check`:passed.
- `npx supabase functions deploy game-operation --project-ref
  ohtfgwomdfteaxubndww --no-verify-jwt`:deployed successfully despite the existing
  Docker-not-running warning. `node tools\smoke_server_game.mjs --final-loot`:
  all21 real hosted endpoints passed exact local/server rewards, first bonuses,
  atomic persisted accounts and same-request idempotency. Smoke lattice checks
  subtract separately decorated Story bonuses before testing base5x loot.
  All disposable identities/cascading records removed; no owner account touched.
- `node tools\smoke_server_game.mjs --components`:hosted stage1/stage100 actual
  kills passed exact3/625 components, atomic totals and idempotent retries;
  all disposable identities/cascading records removed.
- Localhost remains responsive at the existing5173 URL. No commit made, payment
  implementation added or further owner decision required for this reward change.

## Larger death loot and Machine Conduit beams (D-293)

- Owner requests acquired Machine Conduits as visible beam loot and all dropped
  items50% larger, explicitly including captured creature copies.
  Existing actual reward events already include Conduits in the shared burst;
  strengthened their presentation with dedicated Conduit class/beam core/base
  glare, retaining real icon, name, exact quantity and snapshotted upgrade meter.
- Shared drop scale is exactly existing randomized size times1.5. All receipt
  categories participate: currencies, materials, components, chests/tokens,
  Conduits, recruitments and captures. Nominal artwork36->54px; randomized
  output40.5px to just under72.9px. Entire beam/quantity/meter scales too;
  no source PNG, menu/results icon, reward quantity or gameplay change.
- Shared layout spaces drops82px apart, wraps narrow views into rows and
  reserves beam/label bounds around the death anchor. Row gaps adapt to
  viewport height for larger receipts. Keep existing850-1849ms pickup timing,
  live battle speed, static reduced-motion dwell, cleanup and save-before-VFX.
  No extra rolls/claims or transactions.
- Six added regressions validate an actual seeded Machine kill's Conduit
  icon/beam, every non-Common catalog Conduit, exact1.5 multiplier for every
  receipt category and randomized endpoint, capture portrait and responsive
  bounds at320/390/1280px.
- `npm test -- src\presentation\battle-loot.test.ts
  src\presentation\battle-results.test.ts src\game\machines.test.ts
  --maxWorkers=2`:53 passed across3 files.
- Build Last Light task (`npm run build`):TypeScript/Vite passed with existing
  large-chunk advisory. Edited-file diagnostics and `git diff --check`:passed.
  Localhost HTTP200.
- Isolated real Chrome with actual Machine receipt and mixed fixture at
  1280x720/390x844/320x740 verifies maximum randomized enlarged dimensions,
  loaded Conduit/capture icons, visible in-bounds beams, Conduit base glare,
  viewport fit, unchanged receipt and collection cleanup. Screenshots/report
  are session-only artifacts; temporary Chrome processes/profiles cleaned.
- Localhost serves the client change. No server bundle/deployment, account
  edits, migration, commit or owner decision needed; no work remains.
  [Visual contract](free-battle.md#larger-death-loot-and-machine-conduit-beams-d-293).

## Battle Quit/Leave navigation repair (D-292)

- Owner reports Quit after defeat or during a battle fails to return and
  reports a missing session. Found connected client defects: `enterOnline`
  clears transient history when resuming, but Back required a previous entry;
  results Quit also deleted the server run before attempting that navigation.
  Subsequent results clicks then required the already-deleted local session.
- Results Quit now delegates only to the same Back callback as toolbar Leave.
  That flow owns the single online quit/confirmation. Removed unused quit
  from the combat-authority interface, its preview implementation and fixtures.
  Failed/ambiguous server exits still surface errors and preserve same-request
  retries; no catch-and-ignore or new server behavior.
- Back preserves actual caller snapshots when present. For a battle only,
  empty history returns to Gameplay with clean transient filters/panels/hash
  and top scroll. Ordinary menu Back still errors on missing history.
  A previously confirmed quit with null session can finish navigation.
  Settings title confirmation, rewards, run snapshots and account data remain.
- Added four real BattleView DOM regressions for cleared/defeated online
  results, offline caller restoration, rejected-exit retry and repeated-click
  suppression. History tests cover fallback versus actual callers and main
  wiring; authoritative tests confirm player/cleared/defeat quit returns null
  session without changing saved account/rewards/progress.
- `npm test -- src\presentation\battle-exit.test.ts
  src\presentation\battle-authority.test.ts
  src\presentation\menu-history.test.ts
  src\presentation\battle-toolbar.test.ts
  src\presentation\battle-shortcuts.test.ts
  src\presentation\battle-results.test.ts
  src\online\server-game.test.ts --maxWorkers=2`:62 passed across7 files.
  VS Code test discovery unavailable; used existing Vitest CLI. Existing
  jsdom canvas-not-implemented notices remain in neighboring toolbar tests.
- Build Last Light task (`npm run build`):TypeScript/Vite passed with existing
  large-chunk advisory. Edited-file diagnostics and `git diff --check`:passed.
  Localhost HTTP200. Shared browser CDP connection timed out, so no owner
  account/browser actions were performed or claimed.
- Client fix is served by running localhost; refresh/reconnect to load it.
  No server deployment, migration, account edits or commit. No owner decision
  or unimplemented work remains for this request.
  [Exit contract](free-battle.md#reliable-battle-exit-d-292).

## Collections layout and control repairs (D-291)

- Reorganized Collections into a title/Information toolbar, three gallery
  choices, compact top filters, result/management row and natural-height cards.
  Filters use one desktop row, two columns at390px and one at320px.
  Removed clipped/nested results scrolling and inherited160px filter growth.
- Fixed high-specificity layout rules overriding gallery/card `hidden` states.
  Reset now dispatches change for every backing filter so visible selection
  labels refresh. Initial filtering runs after binding. Gallery switches keep
  filter/card DOM. Marked the actual Collections page scroller for existing
  caller-history snapshots; no new account state or writes.
- Restored unowned captured-form silhouettes. Collections cards use flexible
  content flow rather than mismatched subgrid child counts; unrelated Team
  card layout remains unchanged. Larger readable names/status/effects and
  bounded11rem Character/Conduit/creature art keep content separate.
  Fixed creature images and pending SVGs overflowing their artwork row.
- `npm test -- src\presentation\archives.test.ts
  src\presentation\archives-controls.test.ts
  src\presentation\selection-panel.test.ts
  src\presentation\menu-history.test.ts --maxWorkers=2`:22 passed across4
  files. Earlier surrounding run including `sanctuary.test.ts`:31 passed
  across5 files. Five new DOM tests cover combined filters/empty/Reset,
  selection dialogs/focus, gallery preservation, Information/kit/Details,
  live activity/stage loot and captured reveal gating.
  VS Code test discovery did not find these files; used existing Vitest CLI.
- Build Last Light task (`npm run build`):TypeScript/Vite passed; existing
  large-chunk advisory only. Edited-file diagnostics:passed.
- Isolated real Chrome at1858x768/1280x720/390x844/320x740 passed:
  exactly one computed-visible gallery,126 initial forms,6 Infernic matches,
  actual selection choice/Reset labels, Machine activity filtering/stage loot,
  native kit dialog, art containment, last-card reachability and no horizontal
  overflow. Phone filter panel reduced from481px to261px at390px.
  Settled ancestor opacity is1; earlier dim screenshots captured the existing
  gallery entrance animation mid-flight. Preserved animations/reduced motion.
  Session-only verification artifacts remain outside the repo; isolated Chrome
  processes/profiles and the earlier stalled profile were cleaned up.
- Localhost serves the finished client changes. No server deployment, asset-byte
  change, account edits, commit or owner decision is needed. Nothing remains
  unimplemented for this request. [Contract](archives-and-elements.md#collections-layout-and-controls-d-291).

## Guaranteed linear Machine components (D-290)

- Owner requests guaranteed components from every defeated Machine enemy,
  starting at3 per enemy, with linear stage growth; selects about125 at the
  final stage. Implemented exactly `round(3+122*(stage-1)/99)` across100 stages:
  stages1/25/50/75/100 give3/33/63/94/125 each, including bosses.
- Shared drop API updates real battle rewards, Creature loot tables, activity
  and upgrade Information dialogs. Preserve one isolated component RNG draw per
  kill for compatibility; it no longer affects the guaranteed outcome.
  No changes to other RNG/drop rates, costs, currencies, gear or account schemas.
  No extra clear rewards or retroactive grants.
- Atomic reward validation now requires the exact current stage component
  quantity for Machine kills, rejecting omitted/forged amounts and overflow
  before any save. Existing receipt deduplication and one-write rewards remain.
  Historical already-presented/saved rewards are not re-awarded.
- All100 stages validate guaranteed RNG endpoints, every actual enemy's AoE
  reward, exact source-table parity, persisted totals and duplicate receipts.
  Authoritative engine tests cover1/25/50/75/100 with real activity gates.
  Updated the manually authored Master-chest reward fixture to include125
  required final-boss components without changing chest rules.
- `npm test -- src\game\conduit-upgrades.test.ts src\game\machines.test.ts
  src\presentation\conduit-upgrade.test.ts src\content\creatures.test.ts
  src\online\server-game.test.ts src\presentation\battle-results.test.ts
  src\game\account.test.ts src\game\master-conduits.test.ts --maxWorkers=2`:
  395 passed across8 files.
- Full `npm test -- --maxWorkers=2`:2,106 passed,6 failed across142 files.
  One coupled missing-component Master fixture was fixed and its full89-test
  file passed afterward. The other five are unchanged baseline portrait-byte/
  offline-save Settings source-regex failures. No unrelated fixes.
- Build Last Light task (`npm run build`):TypeScript/Vite passed with existing
  large-chunk advisory. `node tools\bundle_server_game.mjs`, Edge Function
  TypeScript and `npx --yes deno check
  supabase\functions\game-operation\index.ts`:passed. Edited-file diagnostics,
  hosted-smoke syntax and `git diff --check`:passed.
- Owner explicitly authorizes this online rollout.
  `npx supabase functions deploy game-operation --project-ref
  ohtfgwomdfteaxubndww --no-verify-jwt`:deployed successfully; no DB migration.
  `node tools\smoke_server_game.mjs --components`:passed hosted actual stage1
  kills and near-defeated stage100 boss fixture at3/125, exact account totals
  and idempotent kill retries. Disposable zero-starting-currency identity and
  cascading data removed; no owner-account edits. No commit.
- Guaranteed drops are live in signed-in combat and localhost. Upgrade costs
  remain unchanged. No owner decision or implementation remains for this request.
  [Current economy and table](conduit-upgrades.md#implemented-editable-first-pass-balance).

## Required-resource component artwork size

- Enlarged only the Broken Mechanical Components PNG in Conduit Upgrade's
  Required resources row by40% using a scoped image transform. Retained the44px
  layout slot, panel dimensions, balance/cost text and action positions.
  Other component-art surfaces and source/runtime PNG bytes are unchanged.
- `npm test -- src\presentation\conduit-upgrade.test.ts
  src\presentation\conduit-upgrade-catalog.test.ts --maxWorkers=2`:17 passed
  across2 files. Edited CSS diagnostics:passed.
- Isolated headless Chrome checked actual rendered menu markup at1440px and390px:
  image61.6px versus44px unscaled; resource panel and text rectangles identical
  with/without the transform, no artwork/text overlap. No account/save changes.
  Integrated browser connection timed out; isolated Chrome/profile cleaned up.
- Localhost serves this CSS immediately; no server/economy change or deployment
  is required. [Presentation contract](menus-and-inventory.md#conduit-panel-fit-and-in-place-updates-d-204).

## Consistent stronger enemies and hosted rollout (D-289)

- Owner reports the six Story regions remain too easy, requests equal-level
  enemy consistency everywhere and a struggle against higher-level foes.
  Owner confirms signed-in testing and explicitly approves deploying the
  validated battle-server update. Localhost previously served new menus while
  signed-in combat still used the older hosted rules.
- All hostile factories now use complete shared level/rank stats and
  `enemyAbilityMultiplier(level)`. Removed Story HP/Attack/Crit discounts,
  Training species opening/Crit overrides, dungeon stage/Crit differences,
  infusion stage coefficients and War playable-stat inheritance/fixed1.55.
  Preserve authored identities/art/elements/skill names and boss distinction.
  Encounter enemy count remains mode-specific; identical stats do not promise
  identical total encounter difficulty.
- Stronger shared opening rates HP/Attack/Defense=.45/.25/.30, with extra
  exponential acceleration above25. Ordinary120=9,000/1,200/400;
  boss120=35,000/3,000/600. The140 event extension is unchanged.
  Linear playable/capture growth, costs/caps, access, RNG streams, rewards,
  mitigation, ownership and equipment rules remain. No migration or grants.
- Actual Lv60 ordinary enemies:2,945 HP/428 Attack/108 Defense; bosses:
  8,665/691/151. Crit12%, critical multiplier1.5 for both. Unequipped Infernis19
  takes7 Normals to defeat enemy19 versus11 against enemy29; incoming
  ordinary Normals rise from12% to19% maximum HP. All16-character +10-level
  benchmarks validate actual hit counts, incoming pressure and availableSkill1
  direct hits, not just increasing raw stats.
- New regressions check all real factories/stages including legacy infusion
  schedules, three-seed six-regional-boss Common-equipped squad clears,
  first regional bonus solo atLv15/Common gear for all three initial starters,
  accessible material/fodder milestones and late built-versus-unbuilt squads.
  Updated unrelated arithmetic/presentation fixtures to control the enemy stats
  they depend on, without changing their underlying mechanic assertions.
- Preserve complete exact historical captured skill sets and metadata-free
  legacy defaults, while new captures retain the current hostile skills.
  Reject mixed/forged sets. Authoritative read preserves older active encounter
  snapshots; quit/re-enter rebuilds with current stats. No load-time rewrites.
- Final `npm test -- --maxWorkers=2`:2,100 passed,6 failed across142 files
  (139 passed). Five unchanged baseline failures: four portrait-byte assertions
  for Rosetta/Thornia/Crinso/Bliss and one offline-save Settings source regex.
  Sixth is an unrelated timing-sensitive VFX live-speed assertion; focused rerun
  passed. All combat, balance, capture and authoritative regressions passed.
- `npm test -- src\game\enemy-progression.test.ts
  src\online\server-game.test.ts src\vfx\vfx-systems.test.ts --maxWorkers=2`:
  125 passed across3 files, including the VFX timing rerun. Earlier focused
  enemy-progression/dungeons/battle run:143 passed across3 files.
- `npm run build` via Build Last Light task:TypeScript/Vite passed, existing
  >500kB chunk advisory only. `node tools\bundle_server_game.mjs` generated the
  final authoritative bundle. `npx tsc --project
  supabase\functions\game-operation\tsconfig.json --pretty false` and
  `npx --yes deno check supabase\functions\game-operation\index.ts`:passed.
  Editor diagnostics and `git diff --check`:passed.
- `npx supabase functions deploy game-operation --project-ref
  ohtfgwomdfteaxubndww --no-verify-jwt`:deployed successfully. CLI warned Docker
  was not running but asset upload/deployment succeeded. No database migration.
  `node tools\smoke_server_game.mjs`:passed hosted auth, gates, actual kills/
  rewards, idempotency/CAS, profile/social/chat and current first-Story stats.
  `node tools\smoke_server_game.mjs --balance`:passed actual hosted Lv60
  Training/Heaven ordinary parity, material boss stats, common skill coefficient,
  frozen reads and quit using a zero-currency disposable progression fixture.
  Both runs removed all disposable identities/cascading records.
- Localhost remains running: `http://127.0.0.1:5173/LastLightGame/` returnedHTTP200.
  Existing battles intentionally retain their frozen current encounter; quit
  and re-enter to test the new tuning. Server update is live; no static-client
  publication, owner-account edits or commit performed. No owner choice remains
  for this pass. Further playtesting remains useful.
  [Current contract](combat.md#consistent-level-and-rank-difficulty-d-289).

## Linear playable growth and progressive build reliance (D-288)

Historical completed phase; hostile coefficients, Story/species exceptions and
undeployed status below are superseded by D-289 above.

- Owner requests broad balance changes after reporting trivial same-level fights
  and explicitly confirms increasingly needing Conduits and a reliable team.
  All16 Element-Bearers now use `G=1+.15*level+1.5*(evolution-1)`, with
  unchanged bounded potency and Defense exponent.7. Flat healing/shields follow
  the same factor. Updated in-game growth descriptions and current system docs.
- Hostiles in Story, Training, all material dungeons, both infusions, currency
  activities, Machines, Roses and War use shared smooth accelerating growth.
  Ordinary120 HP/Attack/Defense=7,000/1,200/400;
  boss120=35,000/3,000/600. Preserve species openings, easier Story modifiers
  and the existing event140 extension. Numeric endpoints are developer tuning.
- Captures also become linear (220/38/16 reference bases, factor1+.15*level,
  fixed-form multiplier unchanged), avoiding a200k-HP capture loophole.
  No account/load writes, migration, grants, changed costs/caps/rewards/RNG or
  altered saved identity/level/skills/locks/equipment. Existing encounter stats
  stay frozen on read/Settings; rebuilt staged encounters/Retry use current
  curves from frozen progress/gear. Training retains allied snapshots on Continue.
- Measured Lv.19 base Infernis:847 HP against541 ordinary enemyHP, requiring5
  noncritical Normals. Across all16 base-form characters, Lv.19 critical Normals
  cannot one-shot ordinary/Story enemies; player/enemyHP ratio is below3.
  Lv.105 Infernis needs7 same-level Normals; against enemy120, unbuilt needs11,
  while the tested unupgraded late build needs at most6.
- Regression simulations across three seeds retain unbuilt first-Story clears
  and Common Store gear paths to early material/fodder milestones. Equipped
  starter squads clear all final material/staged/War bosses; the same unbuilt
  squad loses every tested final staged creature/Machine boss. Existing Rose/
  starter mixed-squad benchmarks remain. No universal-win promise.
- `npm test -- --maxWorkers=2`:2,074 passed,5 failed across142 files (140 passed).
  Remaining unrelated failures: four byte-revision assertions in
  `src/presentation/portrait.test.ts` for Rosetta/Thornia/Crinso/Bliss and one
  source-text Settings regex in `src/presentation/offline-save.test.ts`.
  All balance/gameplay/online regressions passed. An earlier full run also had
  one sparse-frame VFX timeout; it passed in the final full run.
- Final focused command: `npm test -- src\content\combat.test.ts
  src\content\progression.test.ts src\content\stat-growth.test.ts
  src\game\enemy-progression.test.ts src\game\defense-balance.test.ts
  src\game\battle.test.ts src\game\crimson-roses.test.ts
  src\game\captures.test.ts src\game\machines.test.ts
  src\game\rosethorn-sanctuary.test.ts src\game\elemental-war.test.ts
  src\presentation\archives.test.ts src\presentation\hub.test.ts
  src\presentation\unit-readout.test.ts --maxWorkers=2`:360 passed across14 files.
- `npm run build` through the existing Build Last Light task: TypeScript/Vite
  passed, existing >500kB chunk advisory only.
  `node tools\bundle_server_game.mjs`:generated authoritative bundle.
  `npx tsc --project supabase\functions\game-operation\tsconfig.json --pretty false`:
  passed. Edited-file diagnostics passed.
- Remaining: deploy matching client and regenerated `game-operation` bundle
  together before claiming online rollout. No hosted deployment, browser account
  changes or commit performed; the preview remains stopped. No further owner
  choice is required for this tuning pass; production playtesting remains useful.
  [Current numeric contract](combat.md#progressive-build-reliance-d-288).

## Right-click Normal Attack shortcut (D-287)

- Right-clicking an ally performs that ally's Normal Attack against the selected
  enemy through the same local/authoritative command path as drag-down and the
  modal Normal Attack button. Defense remains in Battle menu; no action math,
  Gauge gains, targeting, cooldowns or save fields changed.
- Updated field instructions, modal action hints, root README and current
  combat/input documentation. Historical Defense mapping entries are explicitly
  marked superseded rather than presenting them as current instructions.
- `npx vitest run src\presentation\battle-shortcuts.test.ts
  src\presentation\battle-chrome.test.ts src\presentation\battle-gesture.test.ts
  src\presentation\gesture-guide.test.ts src\presentation\battle-authority.test.ts
  src\presentation\battle-toolbar.test.ts --maxWorkers=2`:39 passed across6 files.
  New DOM tests dispatch real contextmenu events for local/online fixtures,
  selected enemy/right-clicked ally, exactly-one action, busy gating, enemy
  exclusion and retained modal Defense. Existing jsdom canvas notices in toolbar
  tests do not fail validation. `npm run build`:TypeScript/Vite passed with the
  existing large-chunk advisory.
- No remaining implementation or owner decision needed; no deployment/commit.
  [Current controls](free-battle.md).

## Future payments document and combat wait reliability (D-285/D-286)

- Added [future microtransactions design](microtransactions-design.md):
  PayPal Business settlement/withdrawals, fees/holds, Stripe and merchant-of-record
  alternatives, platform constraints, sandbox/live setup, server capture and
  verified webhooks, exactly-once atomic credit, paid/earned ledger, offline-import
  implications, refunds/disputes, randomized-summon eligibility and validation.
  Documentation only: no prices approved, credentials added or payments enabled.
- Owner clarified the apparent freeze was a crossed-out cursor, resolved itself,
  and requests fluid/optimized combat. Could not reproduce that exact incident.
  It is the disabled-control cursor during server/animation waits, not evidence
  identifying one cause. Found concrete lifecycle issues and corrected them:
  VFX elapsed time no longer caps at100ms per frame; expired effects skip costly
  simulation/bloom. Live speed changes now reach VFX. Reduce motion cancels both
  canvas and sprite layers. Cancellation also settles a runner waiting for
  impact presentation after its visual duration has elapsed.
- Gameplay requests use the existing SDK's30-second abort timeout with explicit
  error/unlock; battle displays server-confirmation status before effects start.
  Ambiguous timeout retains request ID/revision/payload in the existing pending
  operation path. No automatic attack retry, local server-result simulation,
  account/reward/RNG/kit changes or server deployment.
- `npx vitest run src\online\server-game-transport.test.ts
  src\online\server-game.test.ts src\vfx\vfx-systems.test.ts
  src\vfx\preview-dom.test.ts src\presentation\battle-authority.test.ts
  src\presentation\battle-speed.test.ts src\presentation\battle-animations.test.ts
  src\presentation\battle-impact.test.ts --maxWorkers=2`:99 passed across8 files.
  Tests include a real Supabase SDK abort with simulated stalled fetch and
  identical-envelope retry, sparse-frame1x/2x/3x timing, live VFX speed, late
  cancellation and mid-action motion changes. VS Code test discovery found no
  tests, so Vitest provided validation.
- `npm run build`:TypeScript/Vite passed with existing large-chunk advisory.
  Chrome actual BattleView:64 desktop actions and six phone/DPR2 multi-recipient
  cases completed, every recipient lit, correct banner gating, no errors and
  unchanged localStorage. Real canvas tests with250ms frame delivery covered
  all seven archetypes at3x:1.014-1.267s completion,
  one impact each and cancellation after duration settled; storage unchanged.
  Diagnostics and `git diff --check` passed. No claim of universal60fps or a proven cause of the
  owner's transient incident.
- Remaining decisions: payment provider/country eligibility, pack pricing,
  paid/earned spending rules, import treatment, taxes and refund/dispute policy
  before a separately approved implementation. Changes remain uncommitted.
  [Combat contract](combat.md#canvas-ability-previews-and-rendering-validation).

## Functional bloom and fluid ability motion (D-284)

- Shared emission/blur compositor now supplies real bloom in both studios and
  BattleView. Cached narrow/wide blur buffers preserve crisp cores without
  blooming portraits/scenery or multiplying arena dimming. Studio Bloom and
  Camera Shake switches work; scrubbing reconstructs fresh simulation state.
- All seven archetypes use smoother buildup/release and completion fades.
  Elapsed-time bounded stepping, time-based damping and analytic projectile
  tails reduce frame-rate-dependent motion. Volley hit bloom fades instead of
  lingering; ultimates use localized light instead of a full-screen white wash.
  Refined individual Last Flare geometry for flames, wind, lightning, psychic
  lenses, branches/leaves, spiral currents, dual ribbons and arched bastions.
- Fixed phone Three-allies preview overflow using compact controls/header and
  full-value readouts with portrait headers. Actual HP, Gauge, native resources,
  buffs/debuffs and44px controls remain. No gameplay layout redesign.
- Real Chrome: personally inspected16 character contact sheets (four actions
  at gather/release/decay); all64 studio bloom on/off comparisons gained lit
  pixels. All64 actual BattleView actions passed desktop and390x844/DPR2 checks:
  every dispatched recipient lit, no legacy overlays, ultimate-only banners,
  no runtime errors, settled busy locks and unchanged localStorage. Phone
  checks additionally verified complete nameplate/readout containment.
- `npx vitest run src\vfx\vfx-systems.test.ts src\vfx\preview-dom.test.ts
  src\presentation\battle-cutin.test.ts src\presentation\battle-health.test.ts
  src\presentation\battle-impact.test.ts src\presentation\battle-animations.test.ts
  src\presentation\battle-authority.test.ts src\presentation\battle-speed.test.ts
  src\game\battle.test.ts --maxWorkers=2`:164 passed across9 files.
  `npm run build`:TypeScript/Vite passed; existing large-chunk advisory remains.
  Diagnostics and `git diff --check` passed. VS Code test discovery returned no
  tests, so the repository's Vitest runner supplied validation.
- Shared ordinary-skill archetypes and historical unwired studio layer/reticle
  controls remain; this is not64 unique systems, a universal frame-rate promise
  or owner visual approval. No owner decision blocks this request. Combat math,
  targeting, RNG, account/reward persistence and supplied art are unchanged.
  Changes remain local/uncommitted; unrelated worktree changes preserved.
  [Contract](combat.md#canvas-ability-previews-and-rendering-validation).

## Last Flare-only ability banners (D-283)

- Shared portrait-cue dispatch now allows only ultimate/Last Flare actions.
  Normal Attack, Defense, Skill1/Skill2 and ordinary enemy skills skip banners
  in both gameplay and the battle preview. Battlefield VFX are unchanged.
- Last Flare and eligible enemy ultimate banners retain their3500ms base
  duration, stationary reading hold, speed scaling, reduced-motion skip,
  portrait facing and failure/disposal cleanup. No combat/save/RNG changes.
- `npx vitest run src\presentation\battle-cutin.test.ts
  src\presentation\battle-impact.test.ts src\presentation\battle-animations.test.ts
  src\presentation\battle-speed.test.ts --maxWorkers=2`:63 passed across4 files,
  including action eligibility for all16 characters and ultimate cleanup.
  `npm run build`:TypeScript/Vite passed with existing large-chunk advisory.
- No remaining implementation or owner decision needed for this request.
  [Contract](free-battle.md#skill-portrait-cut-ins-and-enemy-skill-kits).

## Multi-recipient ability VFX and legacy overlay removal (D-282)

- Ability effects now cover each actual enemy/ally recipient, with the caster
  included for team support. Full-health living allies still receive support
  visuals, fallen allies do not, and targets killed by the current hit retain
  their pre-impact anchors. Mixed Last Flares cover both sides.
- Each recipient has independent simulation state on a shared canvas timeline;
  allied support is centered on that ally. Deduplicated targets, one impact
  callback and primary-only arena dimming prevent cross-target interference.
- Removed field-only CSS impact blooms, signature stars/pentagrams and trails.
  Canvas VFX, sprite movement, portrait cut-ins, numbers and status readouts
  remain. Combat calculations, costs, RNG and atomic rewards are unchanged.
- Battle preview adds Solo/Three allies. Three allies start partially injured
  in memory only; choose Training to see attacks on three enemies. No saves,
  ownership/resource grants or account reward transactions occur.
- `npx vitest run src\vfx\vfx-systems.test.ts src\vfx\preview-dom.test.ts
  src\presentation\battle-health.test.ts src\presentation\battle-impact.test.ts
  src\presentation\battle-animations.test.ts src\presentation\battle-authority.test.ts
  src\presentation\battle-speed.test.ts src\game\battle.test.ts --maxWorkers=2`:
  129 passed across8 files. `npm run build`: passed TypeScript and Vite,
  with the existing large-chunk advisory.
- Real isolated Chrome: Flora/Tizu Skill2 and Disciple Last Flare dispatched
  to3 allies; Infernis Skill2 to3 enemies; Tizu/Flora Last Flare to all6;
  Infernis Skill1 to just1 enemy. Every dispatched anchor produced lit canvas
  pixels, all actions completed, legacy field overlays remained absent, no
  runtime errors and localStorage unchanged. Browser evidence is session-local.
- Shared ordinary-skill archetypes and historical optical studio controls
  remain as documented below; this change does not introduce new designs.
  Owner visual approval remains separate. Local changes are uncommitted;
  unrelated worktree changes preserved.

## Ability VFX rendering and preview containment verification

- Completed the pending preview-layout/runner corrections. Battle preview fills
  the space below its controls; arena-relative sprites and separate phone
  columns prevent offscreen/overlapping combatants. Optical canvas and transport
  shrink into the available viewport; sidebar scrolling remains contained.
- Canvas backing size follows the actual arena and DPR. Frames clear in
  physical pixels and isolate context state. Invalid anchors/speed report
  errors, cancellation settles pending playback, and asynchronous/frame errors
  cannot leave combat waiting indefinitely. BattleView reports initialization
  failures and presents actual HP/shield/healing at the VFX charge/impact point.
  No combat calculations, rewards, account transactions or source art changed.
- Real isolated Chrome validation (not mocked drawing): all64 studio presets
  produced lit pixels; all64 actions played through real BattleView with
  nonzero visible effect pixels, completed input locks and no runtime errors.
  Infernis Skill1 additionally played in all10 studio modes, including Story,
  Training, dungeons and War; localStorage was unchanged. Layouts measured at
  1280x720,960x540 and390x844; canvas/arena bounds matched and preview regions
  stayed within the viewport. Phone screenshots confirmed separated units.
- `npx vitest run src\vfx\vfx-systems.test.ts src\vfx\preview-dom.test.ts
  src\presentation\battle-animations.test.ts src\presentation\battle-authority.test.ts
  src\presentation\battle-impact.test.ts src\presentation\battle-speed.test.ts
  src\presentation\battle-squad-art.test.ts src\game\battle.test.ts --maxWorkers=2`:
  107 passed across8 files. `npm run build`:passed, including TypeScript and
  all3 HTML entries, with the existing large-chunk advisory. Diagnostics and
  `git diff --check`:passed.
- Integrated VS Code browser CDP still timed out; isolated Chrome provided
  actual pixel/layout evidence without using the owner's account. Rendering
  validation is not owner visual approval or proof of distinct ordinary-skill
  designs: shared archetypes remain. Several historical studio layer/reticle
  controls remain unwired and particle telemetry is illustrative, not measured.
  Battle studio remains development-only despite its bundled HTML entry.
  [Contract](combat.md#canvas-ability-previews-and-rendering-validation).
  Changes are local and uncommitted; unrelated worktree changes preserved.

## Root music cleanup

- Owner approved removal of redundant root MP3 deliveries. All seven original
  filenames/bytes remain under Music/source; runtime copies remain under
  public/assets/music. Verified each against its recorded SHA256 before removal.
- Intake now reproduces from archived sources when root deliveries are absent,
  skips copying a source over itself and rejects recorded-source hash changes.
  Manifest delivery names remain historical provenance. Playback is unchanged.
- Verification: `python tools\intake_music.py` passed after removal; all seven
  archive/runtime hashes match the unchanged manifest, and no delivered root
  MP3s remain. `git diff --check` passed. Local, uncommitted.

## Music crossfades and slower loading curtains (D-281)

- Replaced hard soundtrack swaps with1.6-second crossfades using at most two
  looping decks. Incoming playback must succeed before fading the old song.
  Undelivered modes fade to silence; same-track Settings/Continue/Retry still
  preserve playback. Volume scales both envelopes; mute/hidden/dispose clear
  timers and outgoing playback. Rapid swaps ignore stale play promises.
  Incoming failures surface errors and keep the outgoing song for retry.
- Activity transition curtains now ease to black over800ms and reveal over
  800ms (formerly220ms each). Existing artwork readiness/timeout, loading hold,
  input locks and focus restoration remain. Reduced motion skips visual fades;
  battle speed does not affect either music or curtain duration.
- Updated [Music contract](../Music/README.md), menu and encounter specs.
  No changes to assets, assignments, audio source bytes, combat, saves or RNG.
- `npx vitest run src\presentation\music.test.ts
  src\presentation\activity-transition.test.ts src\presentation\settings-panel.test.ts
  src\presentation\battle-entrance.test.ts src\presentation\battle-authority.test.ts
  src\presentation\battle-speed.test.ts --maxWorkers=2`:62 passed.
  `npm run build`:passed with existing large-chunk advisory. Diagnostics and
  `git diff --check` passed.
- Browser controlled-visibility fixture played actual MP3s: both decks were
  playing at approximately17.5% midpoint volume, then the outgoing source was
  released and incoming reached35%, with no errors. Because this integrated
  tab is hidden, visual WAAPI was checked by controlled seeking: opacity
  0/.5/1 for fade-in and1/.5/0 for reveal, each800ms. Curtain removed and input
  restored; fixtures cleaned, no account writes. Local, uncommitted.

## Delivered soundtrack wiring (D-280)

- Installed seven root MP3 deliveries: Celestial Pilgrimage for title/selection/
  nonbattle menus, and six tracks shared between each Story region and its
  matching material dungeon. [Music index](../Music/README.md) owns exact names.
  Training/infusions/currency farms/Roses/Machines/War remain silent without
  delivered tracks; no guessed substitutes or sound-effect integration.
- One looping player waits for interaction, changes tracks without overlap,
  pauses hidden tabs and retains position through same-track renders, Settings,
  Continue/Retry and mute/volume changes. BattleView's optional rendered-state
  callback covers offline/online Story boundaries and reconstructed sessions.
- Music volume/mute save independently on this device (default35%, unmuted),
  with labelled Settings controls and explicit storage/media failure notices.
  Browser autoplay denial waits for another interaction; tempo/combat unchanged.
- `python tools\intake_music.py` preserves originals under Music/source,
  installs byte-identical public/assets/music copies, and records seven SHA256
  hashes/sizes/paths. Root deliveries retained; no trimming/transcoding.
  No seamless-loop edits, other activity tracks or audio uploads.
- Verification: `npx vitest run src\presentation\music.test.ts
  src\presentation\settings-panel.test.ts src\presentation\battle-speed.test.ts
  src\presentation\battle-authority.test.ts src\presentation\battle-entrance.test.ts
  src\presentation\battle-results.test.ts --maxWorkers=2`:52 passed.
  `npm run build`:passed (existing large-chunk advisory).
  Intake rerun passed; root/archive/runtime/build copies match all seven hashes.
  Browser decoded all seven MP3s (about210-265 seconds) and a controlled
  visibility/interaction fixture confirmed real looping playback at35% and
  hidden-tab pause. Settings DOM fixture at320px had no horizontal overflow,
  with44px volume and50px mute targets. Fixtures cleared; no account writes.
  Editor diagnostics and `git diff --check` passed. Local, uncommitted.

## Shared crystal-power sound prompts (D-279)

- Replaced the per-character pack with five [shared action prompts](../Music/sound-effects/character-abilities.md):
  unchanged Normal Attack/Defense and new default Skill1, Skill2 and
  Ultimate/Last Flare. Concrete crystal fractures, shattering, rushing hiss,
  low pressure and brief glass resonance replace character-specific lore.
- The power cues target0.9/1.2/1.5 seconds, with immediate onset and increasing
  weight/texture, not volume or cinematic buildup. They are neutral releases,
  not damage/heal/shield outcomes. Passive accents are byte-for-byte unchanged.
  The former default-actions file links to the consolidated source.
- Supersedes the per-character pack described in D-276/D-278 below. Updated
  library/index references; documentation-only checks cover five cue blocks,
  durations, default text preservation, passive hash, links and whitespace.
  No generated audio, runtime integration, gameplay changes or deployment.

## Quick, powerful ultimate sound briefs (D-278)

- Revised all16 [ultimate prompts](../Music/sound-effects/character-abilities.md)
  to1.2-1.5-second targets including the tail: immediate sweep/pulse, one
  powerful event, short clean decay. Removed long gathering, rising and
  cinematic sequences; power comes from dense texture/weight, not volume.
- Preserved ability names, weapons and actual attack/support distinctions,
  including Disciple's buff/shield and mixed attack/protection/healing cues.
  Ordinary skills, passive accents and shared default actions are unchanged.
  [Shared effect contract](../Music/sound-effects/README.md) reflects the correction.
- Documentation-only validation checked all48 named ability blocks,16 short
  ultimate targets, onset/power/no-buildup constraints and relative links;
  `git diff --check` passed. No build/unit suite needed. No audio generated,
  runtime timing changed, commit or deployment performed.

## Remaining Story and activity music briefs (D-277)

- Added Stillhalo and Riftbound individual SUNO briefs plus a16-cue activity
  pack: Training, all six current material dungeons, Heaven/Abyss,
  Treasury/Sanctuary, Roses, Machines and Nerithe/Orvella/Vaelor War.
  [Music index](../Music/README.md) now covers23 cues including the original5.
- Every new style prompt retains170 BPM, expressive lead guitar as singer,
  no lead vocals/lyrics/speech, wordless choir, nocturne piano/pads, spacious
  verses, crushing orchestral refrains, celestial bridge and harmony finale.
  Distinct motifs separate similar elemental settings; Machines recalls
  shared prototype origins and War themes remain human challenges.
- Regional/mode themes, not one track per numbered encounter. Future chapters
  are not covered by this current-mode pack.
  No generated audio, runtime wiring, gameplay or future-story implementation.
- Documentation-only verification checked18 new style prompts under1000
  characters, required sound constraints,16 distinct activity cue IDs and
  relative index links; `git diff --check` passed. No build needed.
  Local only, uncommitted and unpublished.

## ElevenLabs character sound-effect prompts (D-276)

- Added [sound-effect library](../Music/sound-effects/README.md), shared default
  Attack/Defense,48 named skills/ultimates across all16 live humans, and16
  optional passive/charge accents. Includes individual copyable prompts,
  duration suggestions, looping-off workflow and original/export preservation.
- Read current base/Rose, flagship, War kits and consolidated charge rules.
  Prompts distinguish weaponless casting, attack/Weaken, Burn, healing,
  shielding and empowerment. Disciple's support-only skills do not imply
  damage; Aurora is not recast as a healer. Passive/charge candidates require
  actual eligible outcomes; constant Defense bonuses default to silence.
- No music/vocals/choir, new triggers, stats, gameplay, generated audio,
  service uploads, dependencies or runtime wiring. Enemies, creators and
  Conduits are outside the current16-human pack.
- Documentation-only validation compared all48 ability and16 passive names
  against current content, counted66 prompt blocks and checked library links/
  whitespace. No build/unit suite necessary. Local, uncommitted, unpublished.

## SUNO music briefs and future campaign documentation (D-274/D-275)

- Created [Music](../Music/README.md) with an index, shared170 BPM instrumental
  orchestral rock/metal direction, generation/review workflow and future source/
  export filing convention. Five individual briefs cover Main Theme, Emberwake,
  Glasswater, Stormspan and Rootstone, each with a copyable style prompt and
  distinct arrangement. Guitar is the melodic "singer"; no lead vocals/lyrics/
  speech, optional wordless choir only. No audio generated, installed or wired.
- Added [future story roadmap](story-roadmap.md): all seven chapters and
  intermission, Rise's papers, Let's message/wisp, Nyrasma, Brink of Oblivion,
  the moral reversal, survival/creator alliance and eventual reconciliation/
  Let acquisition. Chapter2 is5x25, intermission3x25; Chapter1 keeps6x25.
- All new story outcomes are documentation-only spoilers. Current story,
  dialogue, saves, rewards, creatures and Infinity/Nothingness mechanics remain
  unchanged. Exact scripts/placement, later regions/stage counts, machine
  lineage, creator stats/elements/kits and Rise's recruitment remain future
  authorship/implementation details, not invented approved gameplay.
- Linked Music/roadmap from documentation index, vision, founding canon and
  Story spec; recorded approved direction in decision log. Documentation-only:
  no build/unit suite needed. Local document checks verified five briefs and
  relative links; `git diff --check` passed. No commit, generation or deployment.

## Play activity bottom clearance (D-273)

- Shared activity groups now reserve4rem plus bottom safe-area inset after
  all content, including Event details outside its card. Matching scroll-padding
  helps keep scrolled/focused controls away from the edge. Specificity protects
  Training from its older zero-padding override. No text, artwork, mechanics,
  navigation or transaction changes.
- Browser checked all8 categories and all selectable sub-modes (17 views per
  viewport) at1367x640,1788x768,390x768 and320x640. At maximum page scroll,
  final visible text/controls had approximately64px or more clearance
  (smallest measured63.875px from subpixel rounding), no horizontal overflow.
  Locked-account DOM-only fixtures, no real saves; reloaded afterward.
- `npx vitest run src\presentation\reference-ui.test.ts
  src\presentation\information-topics.test.ts
  src\presentation\sanctuary.test.ts --maxWorkers=2`:47 passed.
  `npm run build`:passed with existing chunk advisory. CSS diagnostics clean;
  `git diff --check`:passed. Local only, uncommitted and unpublished.

## Broken Mechanical Components are resource items

- Moved positive component holdings from the Conduits balance line into the
  Resources grid as normal item cards: shared full-size art, complete name,
  exact Owned count and Details with actual upgrade use/drop rules.
  Renamed Materials' visible panel/empty/error labels to Resources, retaining
  stable internal section IDs. Counts include components as one resource type;
  zero holdings omit the tile and components-only accounts are not empty.
- Search/Components filter uses the same tile. No separate component stat,
  account schema, transaction, drop or upgrade changes.
- `npx vitest run src\presentation\inventory.test.ts
  src\presentation\ui-copy.test.ts src\presentation\hub.test.ts
  src\presentation\menu-information.test.ts
  src\presentation\conduit-upgrade.test.ts src\presentation\sanctuary.test.ts
  --maxWorkers=2`:80 passed. `npm run build`:passed, existing chunk advisory.
- Browser DOM-only fixture at1367x640,390x768 and320x640: component and
  adjacent material art dimensions identical, no horizontal overflow, Details
  fit and restored focus, including maximum-safe quantity. Reloaded afterward;
  no account writes. Local only, uncommitted and unpublished.

## Inventory search, filters and concise Information (D-271)

- Replaced the screenshot's long Information wall with four optional topics:
  Finding items, Materials, Conduits and Masters & chests. All source/equipment/
  activation rules remain available in short paragraphs and existing Details.
- Added live name search (including Master bearer names), combined item type/
  rarity/element filters, Clear and matching-positive-item-type status. Includes
  components and chests; balances remain visible. Actual metadata drives
  affinities, including matching Heaven/Abyss specialty recipes; no invented
  element/rarity for Rosethorn, unrestricted items or chests.
- Filtering preserves card/art/Details DOM and disclosure choices. Query and
  selections survive menu refresh/history in memory and reset at title.
  Explicit no-match states and unavailable-save errors remain. No economy,
  account, art, transaction or acquisition changes.
- `npx vitest run src\presentation\inventory.test.ts
  src\presentation\menu-information.test.ts
  src\presentation\information-topics.test.ts src\presentation\hub.test.ts
  src\presentation\menu-history.test.ts src\presentation\selection-panel.test.ts
  --maxWorkers=2`:65 passed. Search combination, metadata, escaped restoration,
  no-match/Clear, preserved cards/disclosures, unavailable saves and short topic
  paragraphs covered. Editor test discovery found no tests, so used existing CLI.
- Browser DOM-only fixture with171 positive types and maximum-safe material/
  component counts: no Inventory/tool horizontal overflow at1367x640,
  1788x768,390x768 and320x640. All four topics at every size fit horizontally
  and restored focus. Live name search returned only Vigil Core; the shared
  type selection panel fit320px and choosing Chests returned only its chest.
  No real account writes; fixture reloaded afterward.
- `npm run build`:passed with the existing chunk-size advisory.
  Edited Inventory/main diagnostics clean; `git diff --check`:passed.
  Local only, no commit/deployment. No remaining feature decisions.

## Let, Rise and the founding world canon (D-269)

- Implemented the owner's origin story in shared content: Let/Infinity,
  Rise/Nothingness (both destruction and binding), their coexistence and
  civilization wars, division among their worlds and the factions' competing
  search for their creator's soul. All six emotional themes are explicit.
  [world-lore.md](world-lore.md) owns the current narrative contract.
- Updated all16 playable human histories, including origins, stories, vows and
  awakenings while retaining identities and kits. Updated all creature origins,
  six Story introductions/conclusions, activity/event context and ordinary/
  Master Conduit lore. Machines are destroyed collaborative prototypes, not
  Rise's Devourer faction; their undiscovered labels also remain distinct.
- Shared history appears in Story Prologue, global Help and Gameplay Information.
  Optional Team Lore and individual Archive references expose human/captured
  histories without restoring the rejected roster biography wall. Glossary
  Lore is discovery-gated. Store, Inventory, Archives and Loadout share current
  Conduit origins. Summon explains squad recruitment, not soul acquisition.
- No stat, skill, combat, pool, reward, save, artwork or prompt changes for this
  lore work. Infinity/Nothingness are not playable elements. No soul item,
  creator recruitment or faction victory implemented; Story150 restores roads
  and leaves the soul search unresolved. Further outcomes await owner direction.
- Validation: focused17-file run passed338 tests. Final full regression command
  `npm test -- --maxWorkers=2 --reporter=json --outputFile=<session-report>`
  passed1931 tests. Reconciled stale Inventory-shortcut and shared silhouette
  assertions with earlier approved UI changes; updated new origin/topic labels.
  `npm run build` passed (existing large-chunk advisory only).
  `node tools\bundle_server_game.mjs` regenerated the local server bundle;
  no deployment. `git diff --check` passed; edited lore UI diagnostics clean.
- Browser checked19 representative Lore/Prologue dialogs per viewport at
  1367x640,1788x768,390x768 and320x640: bounds/focus restoration passed.
  All16 human Level screens still fit1367x640 without content scrolling or
  horizontal overflow. DOM-only fixtures, no real account writes; reloaded
  afterward. Local only, uncommitted and unpublished.

## Cleaner captured-copy sale confirmation

- Removed the internal capture UUID from sale confirmation text. Creature name,
  exact payout and permanent-removal warning remain. Exact-copy transaction IDs
  and protection checks are unchanged.
- `npm run build`:passed with existing chunk advisory; main.ts diagnostics clean.
  Local only, unpublished.

## Larger featured banner characters

- Doubled shared Summon lineup portrait slots from4.25rem to8.5rem, with
  larger names/ownership marks and full contain-fitted artwork. Phones wrap
  to two columns with headings above, shrinking only to available width.
  No banner pool, rate, transaction, save or source-art changes.
- Browser checked Standard's10 and Roses'3 characters at1367x640,1788x768,
  390x768 and320x640, including ownership marks. Actual slots136px (previous68px),
  reduced to115.5px at320px. No horizontal overflow or clipped card children.
  DOM-only fixture; reloaded afterward without account writes.
- `npx vitest run src\presentation\summon-layout.test.ts
  src\presentation\roster.test.ts --maxWorkers=2`:17 passed. CSS diagnostics
  clean. `npm run build`:passed with existing chunk-size advisory.
  Local only, unpublished.

## Collapsible Inventory and full Conduit background review (D-268)

- Master Conduits & Chests, Materials and ordinary Conduits now use independent
  native disclosures. All default open, with44px Expand/Collapse summaries.
  State survives menu refresh/history in memory and resets at title; no wallet
  writes. Existing currency, unavailable/empty states and chest opening remain.
- Compact item cards show full names, exact counts, art and optional Details.
  Full upgraded effects, fixed kit rules, lore, Master bearer rules, actual
  material uses and chest rules moved into native styled dialogs, not narrow
  text walls. Weapon specialty descriptions explicitly state their currently
  disabled use. Wider cards/subgrid rows align adjacent labels/counts/buttons.
- Browser geometry:182 populated cards at1367x640,1788x768,390x768 and320x640,
  including maximum-safe material/chest counts: zero horizontal overflow,
  clipped child text or misaligned name/count/Details rows. Seven representative
  Details dialogs at each viewport opened/closed, fit horizontally/vertically
  and restored focus. Native summary activation independently collapses/reopens
  without account writes;44px targets verified. Keyboard automation was
  inconclusive in the DOM-only title fixture, so no keyboard pass is claimed.
  Fixtures reloaded after verification; no real account changes.
- Art audit reviewed135 assets:85 ordinary,48 Masters, chest and reserve emblem.
  Corrected22 definite enclosed Master background fields, archived prior exports,
  retained original source hashes and refreshed shared byte-derived URLs.
  All135 provenance/reproduction records verified. Painted shadows and genuine
  matching colors remain. Ambiguous green overlapping Bliss's opal glass remains
  untouched rather than risking destructive removal; no claim of zero possible
  residual pixels. Full audit contract lives in art-workflow.md.
- `npx vitest run src\presentation\inventory.test.ts
  src\presentation\menu-information.test.ts src\presentation\ui-copy.test.ts
  src\presentation\hub.test.ts src\presentation\menu-history.test.ts
  src\game\master-conduits.test.ts --maxWorkers=2`:151 passed. Updated stale
  hub assertions for repeated exact counts and the previously implemented
  Collections-style silhouette/accessible next-form name.
- Art validation: `python -m unittest discover -s tools -p
  test_conduit_cleanup_review.py -q` (1 passed),
  `python -m unittest discover -s tools -p "test_master_conduit_*.py" -q`
  (7 passed), `python -m unittest discover -s tools -p
  test_conduit_art_revisions.py -q` (3 passed).
  `npm run build`:passed, existing chunk advisory only. Edited UI diagnostics
  clean. Local only; no commit, publish or deployment.

## Per-copy Quick Sell

- Added Quick Sell to sellable captured-copy collection cards. Shared native
  Information dialogs identify the copy and show the same actual payouts/
  choices as the Sale tab, with Sell actions and existing protection reasons.
- Reused saleControls and the existing exact-copy confirmation/transaction
  handler. Opening/closing does not navigate or write saves. Locked copies
  can inspect their offer; sale stays disabled. No new sale rules or payouts.
- Tests cover five acquisition families, duplicate-copy binding, exact shared
  offer markup, locked sale actions and unchanged accounts. Browser opened
  four distinct offer types at1367x640,390x768 and320x640: correct options,
  no dialog/page horizontal overflow, native focus restoration on close.
  Fixtures are DOM-only and reloaded after validation.
- `npx vitest run src\presentation\reference-ui.test.ts
  src\presentation\upgrade-reference.test.ts src\game\heaven-abyss-sale.test.ts
  --maxWorkers=2`:86 passed. `npm run build`:passed with existing chunk advisory.
  Editor diagnostics clean. Local only, unpublished.

## Compact Elemental-Devourer details (D-267)

- Replaced the all-at-once captured detail grid with compact Stats & Skills,
  Level, Sale and Conduits sub-menus. Removed duplicate collection/equipment
  links; kept squad and Lock copy controls. Long names and portraits have
  separate bounded header space; sale artwork uses compact slots.
- Level now previews all seven actual equipped stat deltas and exact
  owned/required costs. Retained skill/unavailable-slot dialogs, level120 cap,
  Max Level, every sale payout/protection and full-page loadouts.
- Tab switching preserves portrait/actions and records the existing in-memory
  Team tab for history and refresh. No save writes on navigation or mechanics
  changes. Regression tests cover five acquisition families, seven deltas,
  exact costs, DOM preservation, ownership/protection and loadout hooks.
- Browser checks covered all30 forms, three levels and three panels:
  270 cases per viewport at1367x640,1788x768,390x768 and320x640.
  Desktop panels fit without scrolling; no horizontal overflow. Final bounded
  portrait check repeated all30 forms/three panels at all four sizes: no
  portrait/text overlap or overflow. Read-only fixtures, no account writes.
- `npx vitest run src\presentation\reference-ui.test.ts
  src\presentation\upgrade-reference.test.ts src\game\max-level.test.ts
  src\game\character-instances.test.ts --maxWorkers=2`:101 passed.
  `npm run build`:passed with existing chunk advisory; editor diagnostics clean.
  Local only, unpublished.

## Inventory shortcut removal

- Removed Store/Upgrade, per-Master Equip in Team and empty-state dungeon/store
  shortcuts from Inventory holdings at owner request. Shared header navigation,
  Information, exact holdings and owned chest use remain unchanged.
- Updated regression expectations for empty/populated/unavailable inventories
  and the previously removed Collections biography list.
- `npx vitest run src\presentation\inventory.test.ts
  src\presentation\ui-copy.test.ts src\presentation\menu-information.test.ts
  --maxWorkers=2`:17 passed. `npm run build`:passed with existing chunk advisory.
  Inventory editor diagnostics clean. Local only, unpublished.

## Normal inventory chest tile

- Removed the permanent full-width Cosmic Grand Master Chest card and its
  labeled Open chest button. Positive chest stacks now occupy a normal slot
  alongside owned Masters, with artwork, name, concise use hint and exact count.
  Selecting the artwork retains the existing chooser/confirmation/opening flow.
- No chest tile at zero holdings or unavailable saves. All-owned accounts
  retain stacks with opening disabled. Drop rates, rewards and transactions
  unchanged; no fixture account writes.
- Browser geometry passed at1788x768,1367x640,390x768 and320x640, including
  maximum-safe chest count: normal grid sizing, no horizontal overflow,80px
  artwork click target. `npx vitest run src\presentation\inventory.test.ts
  src\game\master-conduits.test.ts --maxWorkers=2`:95 passed.
  `npm run build`:passed with existing chunk advisory; editor diagnostics clean.
  Local only, unpublished.

## Larger Summon banner artwork

- Raised the shared banner hero width cap from31rem to38.75rem (+25%),
  covering Standard, Roses and future banners using the same component.
  Artwork retains16:9 sizing and remains bounded by its column on phones.
- DOM-only browser checks measured496px to620px (+25%) for both banners
  at1842x768 and1367x640; no horizontal overflow at those sizes or
  390x768/320x640. No asset, summoning, cost, pity or save changes.
- `npx vitest run src\presentation\summon-layout.test.ts
  src\presentation\roster.test.ts --maxWorkers=2`:17 passed.
  `npm run build`:passed with existing chunk advisory. CSS diagnostics clean.
  Local only; no publication/deployment.

## Compact Character Level tab

- Leveling now shares the compact Evolution header, resource cards and
  three-column seven-stat grid through a common growth layout hook.
  Removed repeated progress/preview labels and placed Level up, Max Level
  and rejection text together. Other tabs restore their existing header.
- Preserved exact costs/stat deltas, caps, buttons, portrait DOM, confirmation
  flows and transactions. No gameplay, account writes or art changes.
- DOM-only browser fixtures checked all16 Element-Bearers across six forms
  at level0, one below cap and cap, with a full squad and maximum Prismatica:
  288 cases per viewport. No desktop scrolling at1367x640/1788x768; all
  previews/resources/actions inside the viewport. No horizontal overflow at
  390x768/320x640. Starter Level screen visually reviewed; fixtures reloaded.
- `npx vitest run src\presentation\upgrade-reference.test.ts
  src\presentation\reference-ui.test.ts src\game\max-level.test.ts
  --maxWorkers=2`:88 passed. `npm run build`:passed with existing chunk advisory.
  Editor diagnostics: no errors. Local only, unpublished.

## Collections Information cleanup

- Removed the roster-wide Element-Bearer identities/biographies section at
  owner request. Gallery rules and individual combat-kit references remain.
- Regression coverage checks the shared dialog retains ownership rules and
  contains no character biography list. No gameplay or save changes.
- `npx vitest run src\presentation\archives.test.ts --maxWorkers=2`:9 passed.
  `npm run build`:passed with existing chunk advisory.
  `git diff --check`:passed. Local only; no publication/deployment.

## Archives artwork containment

- Character and Conduit artwork now fits a dedicated7rem slot rather than
  escaping its row through square aspect ratios and intrinsic image sizing.
  Bounded wrappers/images use contain sizing; a small inset preserves portrait
  idle motion, and Conduit frames reserve upgrade-meter space.
- Shared card rows now include Character Archives so neighboring names align.
  No source artwork, facing, silhouette policy, ownership gates, account writes
  or gameplay changes.
- DOM-only browser checks across126 Character forms and133 ordinary/Master
  Conduit cards passed at1788x768,1367x640,390x768 and320x640:
  no image/meter overflow, artwork/name overlap, misaligned name rows or
  horizontal content overflow. Desktop Character gallery visually reviewed.
- `npx vitest run src\presentation\archives.test.ts
  src\presentation\reference-ui.test.ts src\presentation\upgrade-reference.test.ts
  --maxWorkers=2`:80 passed. `npm run build`:passed with existing chunk advisory.
  CSS editor diagnostics: no errors. Changes remain local, unpublished.

## Consistent item-card text rows

- Owner's Rosethorn Exchange screenshot showed wrapped ownership text pushing
  prices to different heights. Material/Cosmetic/Conduit Store cards now share
  naturally sized art/name/details/price rows using CSS subgrid, rather than
  independent vertical flex layouts. Inventory materials, ordinary Conduits,
  Masters and Conduit Collections use shared rows too.
- Long names, descriptions and maximum holdings remain fully visible and
  expand their shared row. No truncation, fixed text-height caps, smaller fonts,
  DOM measurement scripts, account writes or action/selection changes.
- DOM-only browser geometry checks passed all six surfaces at1788x768,
 1367x640,390x768 and320x640 with maximum-safe material holdings, all85 ordinary
  Conduits and48 Masters: matching child top coordinates for adjacent cards,
  no card/page horizontal overflow. At1788x768 all six Rosethorn name/details/
  price positions are identical. Mobile single-column cards remain readable.
- `npx vitest run src\presentation\reference-ui.test.ts
  src\presentation\online-store-profile.test.ts src\presentation\inventory.test.ts
  src\presentation\archives.test.ts src\presentation\conduit-menu-update.test.ts
  --maxWorkers=2`:68 passed. `npm run build`:passed with existing chunk advisory.
  CSS editor diagnostics: no errors. No publication/deployment/commits.

## Conduit enclosed-background follow-up

- Owner reports remaining backgrounds and explicitly chooses to preserve painted
  ground shadows. Corrected Fieldbrace Coupler, Reserve Torque Crank, Horizon
  Heartcase and Dawn Witness Array using reviewed source gap seeds, bounded
  gradient tolerance and an empty Fieldbrace source-edge strip.
  Precision Escapement's teal ground shadow stays unchanged.
- Reviewed full-resolution sources,35 delivered-icon contact sheet and four
  corrected dark/light composites. Cyan/green gems/lenses, pale metal, bronze
  hardware and ground shadows remain. No runtime keying or gameplay changes.
- Original hashes unchanged; prior four exports archived, intake and cumulative
 60-icon review records refreshed (9 corrections), shared byte-derived Conduit
  revisions updated on every surface. Only these four runtime icons changed.
- `python tools\intake_delivered_art.py --apply --regenerate` and
  `python tools\conduit_cleanup_review.py --write`:passed.
  `python -m unittest discover -s tools -p test_conduit_art_revisions.py -q`:
 1 passed. `npm run build`:passed with existing chunk advisory.
  `python -m unittest discover -s tools -p test_conduit_cleanup_review.py -q`:
 2 passed, including all60 reproduction records and gap/shadow pixel checks.
  Changes remain local; no publication/deployment/commits.

## Compact Evolution and shared Collections silhouettes (D-266)

- Evolution alone uses a compact desktop identity header, horizontal form
  comparison, three-column seven-stat preview, compact resource cards and
  adjacent action/rejection text. Removed repeated progress/preview headings
  already covered by the header. No clipped values, hidden costs or changed
  evolution rules; other tabs retain their existing portrait size.
- Evolution and unreached Collections art share `unreached-character-art`:
  same dark radial backing, black silhouette and subtle white outline/halo.
  Removed white preview slab; next-form alt text now names the actual next
  form. Asset revisions and facing remain shared. No art/source changes.
- Captured-copy list remains contained/scrollable because holdings are uncapped.
  Fixed its checkbox being stretched to full-row width by shared input rules;
  labels retain44px targets, all copy details/protection reasons remain.
- DOM-only browser checked all16 bearers/evolutions1-5 at1367x640:80/80 have
  zero page/horizontal overflow with full squads, maximum-safe currency/
  material holdings, first-clear notice and populated/protected fodder options.
  Computed silhouette background/filter exactly match Collections.
 1788x768:80/80 fit;390x768:80/80 no horizontal overflow, accessible page scroll.
  Fixtures never write accounts and are removed by reload.
- `npx vitest run src\presentation\upgrade-reference.test.ts
  src\presentation\archives.test.ts src\presentation\reference-ui.test.ts
  src\game\evolution-fodder.test.ts src\presentation\ui-copy.test.ts
  --maxWorkers=2`:97 passed, including all16 next-form asset/facing/style-hook
  regressions across five evolutions. `npm run build`:passed with existing
  chunk-size advisory. No publication, server deployment or commits.

## Clearer character kits and charge payoffs

- Owner requested all-character kit wording cleanup after Infernis's passive
  appeared to earn meaningless charges. All10 resource bearers now have explicit
  per-character spending explanations with skill, exact bonus, cap and zero-
  charge behavior. Passive explains earning once; charge explanation explains
  spending. Character, Collections and Battle references share this copy.
  Battle counter tooltips no longer say "No standalone effect."
- All16 generated kit descriptions avoid duplicated recovery, Burn duration
  and shield-refresh wording. Passive footer states automatic while alive,
  no action or Gauge cost. Gameplay numbers, triggers, costs, cooldowns,
  recovery, snapshots, equipment independence, saves and RNG unchanged.
- DOM-only browser fixtures checked all16 passive dialogs: correct charge
  sections for10 resource bearers, none for other6, no ambiguous empty-effect
  wording and no horizontal overflow. Infernis dialog explicitly shows Flame
  Arc +8% each/up to24%, Last Flare +12% each/up to36%, all-charge spending,
  and normal skill behavior at0. No account writes; fixture removed by reload.
- `npx vitest run src\presentation\ability-status.test.ts
  src\presentation\ally-buffs.test.ts src\content\combat.test.ts
  src\game\starter-kits.test.ts src\game\kit-pilots.test.ts
  src\presentation\ui-copy.test.ts --maxWorkers=2`:56 passed.
  `npm test -- --maxWorkers=2`:1857 passed across134 files.
  `node tools\bundle_server_game.mjs`:passed; server bundle refreshed locally.
  `npx tsc --project supabase\functions\game-operation\tsconfig.json --pretty false`:
  passed. `npm run build`:passed with existing chunk-size advisory.
- Wording/frontend changes remain local, not published or deployed. Previously
  authorized recurring Master combat remains live. No commits.

## Edge-filled circular navigation portrait

- Header Profile remains72px but now has zero padding,50% circular clipping
  and a100% size frame/cover-fitted portrait. Default portrait fills70x70 inner
  area up to the button's1px circular border, replacing inset rounded square.
  Selected thin/double/corner cosmetic frames remain; no picture/source/save
  changes or Profile-page sizing changes.
- DOM-only all four frame styles verified: default70px artwork, thin68px,
  double62px (actual borders), corner70px; all circular/zero padding.
  `npx vitest run src\presentation\profile-picture.test.ts
  src\presentation\online-store-profile.test.ts --maxWorkers=2`:15/15 passed.
  `npm run build`:passed with existing chunk advisory. No publication/commits.

## Profile space/readability pass

- Removed Profile Edit squad header button only; member links, Add a member,
  Team editing and saving unchanged. Larger112-144px desktop portrait at short
  heights (138px at768,115px at640; prior80px), up to176px on taller desktops.
  Squad thumbnails56-64px; headline numbers28-32px; clearer account/collection
  values. Balanced statistics rows use spare vertical space; desktop short
  layout tightens gaps/bio and removes duplicated Story region caption.
- DOM-only1367x640 and1788x768 fixtures: content scrollHeight equals clientHeight
  after existing entrance animations. Checked populated three-Omnic-member squad,
  five recent events,120-character bio, double-outline portrait and save widget
  at1367x640:546/546, editor474/474, recent221/221. Phone390x768 has no horizontal
  overflow and retains page scroll. Fixtures never write/fund account.
- `npx vitest run src\presentation\online-store-profile.test.ts
  src\presentation\profile-picture.test.ts src\presentation\reference-ui.test.ts
  --maxWorkers=2`:51/51 passed, including removed Edit squad/navigation regression.
  `npm run build`:passed with existing chunk advisory. No publication/commits.

## Larger header wallet and Profile controls

- Owner's header screenshot: currency cards now64px minimum/32px coin art,
  Help/Collections/Settings56px with26px glyphs. Profile72px with60px frame/
 56px actual portrait (previous36px frame); symmetric padding centers artwork.
  Generic unsigned profile icon36px. Exact balances, saved frame/picture,
  accessibility and navigation unchanged.
- DOM-only checks at320x640,390x768,1024x768 and1367x640 including maximum-safe
  currency balances: no horizontal overflow; Profile remains fully on screen.
  Actual desktop measured72px button/60px frame/56px art, utilities56px.
  Presentation-only fixtures cleaned up by reload; no account writes.
- `npx vitest run src\presentation\profile-picture.test.ts
  src\presentation\ui-copy.test.ts src\presentation\reference-ui.test.ts
  --maxWorkers=2`:43/43 passed. `npm run build`:passed with existing chunk advisory.
  No commits/publication.

## Full-suite UI assertion fixes

- Fixed all17 previously reported failures. Sixteen upgrade-reference cases
  expected obsolete collapsed `details`; now assert the approved always-visible
  Stat & form preview, all seven stat deltas and absence of collapsed details
  across all16 bearers/evolutions1-5 and both upgrade paths. No UI rollback.
- The visible-copy failure was caused by D-264's new `shield/buff` phrase, not
  unrelated older UI. Changed shared Master rules to `shield and buff`; generated
  server bundle refreshed. Combat behavior is unchanged.
- `npx vitest run src\presentation\upgrade-reference.test.ts
  src\presentation\ui-copy.test.ts --maxWorkers=2`:26/26 passed.
  `npm test -- --maxWorkers=2`:1855/1855 passed across134 files.
  `node tools\bundle_server_game.mjs`, server-source TypeScript check and
  `npm run build`:passed (existing chunk-size advisory only). This supersedes the
  historical17-failure note below. No commits/publication/deployment in this fix;
  previously deployed recurring Master combat remains live.

## Compact bearer detail (D-265)

- Removed redundant All Element-Bearers and Conduits/count header buttons.
  Sidebar collection and persistent Conduits tab remain; squad actions move into
  identity block. Captured lock/loadout controls unchanged.
- Desktop portrait scales11-16rem by viewport height; phone15rem remains.
  Reduced header/sidebar/panel gaps, stat-row padding/margins and skill button
  padding; removed redundant Skills instruction. Complete portraits, exact seven
  stats, four native ability dialogs, equipment/upgrades and44px targets retained.
- DOM-only browser1367x640: original panels extended below827px; now all seven
  stats/four skills fit through619px. Ordinary three-member sidebar and details
  have558/558 content height (no scroll); max-form three-member squad leaves25px
  sidebar scrolling, with stats/skills still fully visible. All16 Omnic detail
  previews checked, skill buttons48px minimum. Phone390x768 retains240px portrait,
 48px skill targets and zero horizontal overflow; vertical page scroll remains.
  No accounts/saves funded or modified; fixtures are presentation only.
- `npx vitest run src\presentation\reference-ui.test.ts
  src\presentation\conduit-loadout.test.ts src\game\master-conduits.test.ts
  --maxWorkers=2`:155/155 passed. Updated removed-count assertion and added three
  leader/member/nonmember compact-header cases. `npm run build`:passed with existing
  chunk-size advisory. No commits/deployment.

## Always-active complementary Masters (D-264)

- Owner selects bearer enhancements, not a mandatory squad-wide aura. All48
  Master rules and Astral Reserve earning now recur on every qualifying native
  outcome (including multiple targets in one round). Ordinary Conduit
  `usedRound`/`bankRound` limits and intrinsic kit gates are unchanged. Legacy
  Master clock stamps are ignored without load writes/save migration.
- Reviewed every Master against current intrinsic passives/resource loops.
  Removed native charge grants, Flora/Rosetta copied healing and Nerithe copied
  Normal Gauge; replaced with complementary shielding, protection, strikes or
  cooldown effects. Preserve all48 IDs/names/art/acquisition/equipment.
  Helios no longer extends Burn on every tick (otherwise Burn self-sustains);
  it echoes Burn and converts a bounded portion into healing.
- Rules stay globally enabled, but authored timed payoff durations/spend
  conditions remain. Existing shield/Attack/protection refresh and caps,
  no generated-source recursion, no revival, cooldown next-round floor, costs/
  recovery and independent RNG/rewards remain. Catalogue/shared reference text,
  Master doc table and generated art effect contracts updated; artwork unchanged.
- `npx vitest run src\game\master-conduits.test.ts src\game\kit-conduits.test.ts
  --maxWorkers=2`:161/161 passed. All48 tested for repeat effects with legacy
  clock stamps, all16 banks repeat in one round/cap3, real AoE criticals each
  trigger one strike, Burn expires, ordinary round gates remain. Existing
  frozen Settings/Continue/Retry and atomic reward tests pass.
- `python tools\build_master_conduit_art.py`; `python -m unittest discover -s tools
  -p test_master_conduit_art.py -q`:3/3 passed. `node tools\bundle_server_game.mjs`
  and server `npx tsc --project supabase\functions\game-operation\tsconfig.json
  --pretty false`:passed. `npm run build`:passed with existing bundle advisory.
  `git diff --check`:passed. No commits.
- Full `npm test -- --maxWorkers=2`:1835 passed /17 failed in134 files. Failures
  are unrelated presentation assertions:16 upgrade-reference expectations for
  missing `.upgrade-benefits details`, one UI-copy unspaced-slash check. No Master,
  ordinary Conduit, combat, reward or online test failures. Not changed here.
- Final focused `npx vitest run src\game\master-conduits.test.ts
  src\game\kit-conduits.test.ts src\online\server-game.test.ts
  src\presentation\conduit-loadout.test.ts --maxWorkers=2`:218/218 passed.
- Owner authorized online deployment. `npx supabase functions deploy
  game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`:deployed
  successfully (nonfatal Docker warning). `node tools\smoke_server_game.mjs
  --masters`:passed with3 distinct native critical payoffs in one round despite
  legacy stamps, no recursive strikes, frozen loadout, idempotent retry,
  persisted checkpoint and quit. Added reproducible focused hosted option.
  `node tools\smoke_server_game.mjs`:passed existing game/social/chat regression
  checks after correcting the runner's helper block scope. All disposable
  identities and cascading records cleaned up. Hosted combat is updated;
  frontend descriptions await separate publication. No commits/pushes.

## Centered Conduit control labels

- Removed shared leading-padding offset from loadout Details/Upgrade/Remove,
  slot targets and compact filter/member/pager controls via symmetric scoped
  inline padding and centered text/grid alignment. No action or layout changes.
- Browser DOM-only equipped fixture: Details/Upgrade/Remove text centers exactly
  match button centers (0px offset),6.4px padding on both sides.
- `npx vitest run src\presentation\conduit-loadout.test.ts --maxWorkers=2`:
  30/30 passed. `npm run build`:passed with existing chunk-size advisory.

## Larger character detail artwork

- Owner requests substantially larger character art in the supplied Stats/Skills
  detail header. Desktop portrait10rem→16rem; phone8rem→15rem with stacked header
  identity/actions rather than squeezed columns. Shared captured detail header
  follows the same sizing. Sources, contain/facing/idle DOM and gameplay unchanged.
- DOM-only browser1367x640:256px square portrait, header655/655 and page1367/1367.
  Phone390x768:240px square, header337/337 and page390/390; no horizontal overflow.
- `npx vitest run src\presentation\reference-ui.test.ts --maxWorkers=2`:33/33 passed.
  `npm run build`:TypeScript/Vite passed, existing bundle-size warning.

## Locked profile artwork preview correction

- Owner now requests real locked artwork behind Locked text: catalogue, selected
  hero and usage examples show grayscale/1.5px blur with subdued brightness.
  Overlay remains sharp with subtle dark text shadow. Only images receive filters.
  This supersedes earlier profile-specific no-art locked-preview statements.
  Unlock authorization, disabled Use and original installed PNGs are unchanged.
- `npx vitest run src\presentation\profile-picture-browser.test.ts
  src\presentation\online-store-profile.test.ts --maxWorkers=2`:17/17 passed.
  `npm run build`:TypeScript/Vite passed; existing chunk-size warning only.

## Reference-organized profile-picture selection (D-263)

- Near-full-viewport native dialog now follows collection/detail reference:
  breadcrumb/Back row, ownership ring, search/status/category filters, real
  Default/Characters groups, equal220px cards with100px square portraits.
  Preview has previous/next matching entry, rarity/form/In use badges, explicit
  unlock requirement and compact Profile/Chat/Friends usage examples. Full names
  remain visible; locked entries now show muted artwork per correction above. Already applied choice never
  resaves. Keyboard preview arrows retain focus; Escape/Back restore caller focus.
- Only real32 character pictures plus neutral default. Count includes default
  (33 total) and explicitly displays character count out of32. No sample data,
  fake New count, creature/achievement/event pictures or new account fields.
  Existing profile queue/stale-editor safeguards/unlock authorization unchanged.
- Browser DOM-only fixture1367x768: equal-top682px panels, no dialog overflow,
  all33 cards220px and zero overflowing text.1367x640:608px dialog client/scroll,
  aligned panels,308px collection viewport, Apply visible.390x768: no horizontal
  overflow (dialog345/345 inner width), stacked panels/contained collection and
  vertical dialog scrolling. No owner account/profile writes.
- `npx vitest run src\presentation\profile-picture-browser.test.ts
  src\presentation\online-store-profile.test.ts src\presentation\profile-picture.test.ts
  --maxWorkers=2`:18/18 passed, including category/search combinations, filtered
  preview navigation/focus, locked gating, in-use no-save and caller focus.
  `npm run build`:TypeScript/Vite passed with existing bundle-size warning.
  `git diff --check`:passed for touched docs; editor diagnostics clear.

Earlier72px uniform-tile sizing below is superseded by this reference layout.

## Consistent profile-picture catalogue tiles

- All33 modal choices (including neutral/locked) use aligned72px square artwork
  rows and equal220px card heights. Complete names and form labels remain visible.
  Scoped dialog selectors override shared44px button minimums.
- Browser1367x640 and390x768: all33 cards220px high, frames72x72, consistent9px
  top offset, zero overflowing cards. Unlock/filter/selection behavior unchanged.
- `npx vitest run src\presentation\profile-picture-browser.test.ts --maxWorkers=2`:
  2/2 passed. `npm run build`:passed with existing chunk-size warning.

## Installed vibrant profile portraits (D-262)

- All32 root deliveries archived and installed.31 reviewed background keys
  replaced with baked vibrant current-element gradient mosaics. Supplied subject
  positions/scale stay unchanged, no cropping/resizing. Omnic Flora is identical
  to the delivered bytes, including her original background, per owner choice.
  Root originals retained; SHA256 provenance and per-source settings preserved.
- `tools\intake_profile_picture_art.py --apply` reproduces exports and generated
  URL revisions. Shared Profile/header/Friends/Chats/collection resolver now uses
  square artwork, not combat portraits/mirrors; removed pending-art copy and
  corrected catalogue image sizing. Ownership/Omnic unlocks/saves unchanged.
  This supersedes all D-260 temporary-preview/pending-delivery status below.
- `python tools\intake_profile_picture_art.py --apply`:32 installed; subsequent
  rerun reproduced exactly. Python validation compares every archived/export
  hash and reproduced bytes, original interior foreground pixels, geometry,
  alpha bypass and six distinct deterministic mosaics.
- `python -m unittest discover -s tools -p test_profile_picture_intake.py -q`:
  3/3 passed. `npx vitest run src\presentation\profile-picture.test.ts
  src\presentation\profile-picture-browser.test.ts src\content\profile-pictures.test.ts
  src\presentation\online-store-profile.test.ts src\presentation\friend-chat.test.ts
  src\presentation\reference-ui.test.ts --maxWorkers=2`:55/55 passed.
  `npm run build`:TypeScript/Vite passed with existing chunk-size
  advisory. `git diff --check`:passed; editor diagnostics clear.
- Presentation-only browser: all36 rendered catalogue/preview images decoded at
  1024-square. Grid72x72, desktop preview144x144, usage42x42. Phone390x768:
  page390/390, dialog343/343 inner width,100x100 selected art, no horizontal
  overflow; dialog retains contained vertical scrolling.
- Real Profile/Friends markup plus header/chat presentation fixture: all square
  images fit frames (90/100,34/44,32/36 and38/38 pixels respectively). Fixtures
  modify DOM only and never persist a wallet/profile or unlock.
- No account writes, runtime keying, new unlock rules, commits or outstanding
  owner decisions. New profile pictures are installed, not pending.

## Full world-map framing and terrain alignment (D-261)

- Removed cover-cropped map framing. The native1456x816 contained canvas fits the
  available map area; roads/beacons share its coordinates, including letterboxing.
  Anchors now match orange western Infernic, northeastern blue Oceanic castle,
  northern Atmospheric mountain, southern green/gold Botanic woodland,
  southwestern ivory Tranquilitic mountain and southeastern Chaotic rift.
- Marker circles are44px; compact-height/mobile maps show numbers without
  overlapping name/status labels. Numbered sidebar retains names/progression and
  accessible button labels remain complete. Artwork/locks/navigation/saves unchanged.
- Browser presentation-only1367x640 fixture: main508/508, figure278/278 and
  canvas423.59x237.39 (native ratio), full map/caption visible.390x768: page390/390
  width, canvas304.63x170.72 native ratio, all six44x44 targets; no horizontal
  overflow. Owner saves untouched.
- `npx vitest run src\presentation\reference-ui.test.ts
  src\content\story-art.test.ts --maxWorkers=2`:37/37 passed.
  `npm run build`:TypeScript/Vite passed, existing chunk advisory.
  `git diff --check`:passed; editor diagnostics clear. No commits.

## Completed chats and earned profile pictures (D-260)

### Final backend and integration status

- Chat SQL, endpoint routing, independent rate limits, client validation and
  profile-picture authorization are deployed to the existing linked project.
  `20261012030000_friend_chat.sql` applied; `game-operation` redeployed. Private
  accepted-friend DMs, explicit invite-only groups/counting pending invitations,
  owner add/remove/transfer, unread/pin/mute/block and idempotent writes work.
  Chat never changes gameplay account/session/revisions/RNG.
- Backend agent verified `node tools\test_server_game_sql.mjs --predeploy-chat`
  after fixing pin/mute incorrectly marking read, then deployed SQL runner and
  `node tools\smoke_server_game.mjs` passed. Hosted smoke covers the full chat
  session and unchanged revisions for both players; disposable identities/rows
  cleaned and absence verified. Server bundle regenerated, function TypeScript/
  Deno checks passed. All32 profile-picture unlocks are server-validated.
- Main lifecycle/client transport is wired; View profile offers Message, block
  acknowledgement also removes the peer from cached friend/request lists.
  Retry IDs survive navigation until acknowledgement, account changes clear
  state, messages appear only after confirmation. Fixed earlier-page exhaustion
  being lost on newest-page polls and added its regression.
- `npx vitest run src\online\server-game.test.ts
  src\presentation\friend-chat.test.ts src\presentation\profile-picture-browser.test.ts
  src\content\profile-pictures.test.ts src\presentation\online-store-profile.test.ts
  src\presentation\reference-ui.test.ts --maxWorkers=2`:80/80 passed before the
  additional pagination regression. Final rerun:81/81 passed. `npm run build`:passed,
  existing chunk-size advisory only.
- Dedicated32 square illustrations remain generation-only, not delivered.
  Existing portraits are explicitly temporary previews.10-second polling is
  intentional, not realtime push. No message edit/delete/report system; new
  group members see earlier history and re-friending restores retained DM
  history. No commits or outstanding owner decisions.
- Final worktree inspection found32 new owner-named Base/Omnic PNGs at the root
  during backend work. These unexpected files were not modified, processed or
  installed in this task; their actual pixels/source/keys need review/intake.
  This supersedes the earlier assumption that no source images had arrived.
  Runtime still uses labelled canonical portrait previews.
- The following progress notes preserve implementation history; their
  contract-only/backend-pending statements are superseded by this final status.

### Latest client integration

- Backend agent returned the exact typed API, but **no chat SQL/routing/tests/
  deployment yet**, then was explicitly resumed to finish those end-to-end.
  Do not treat the contract-only response as a working backend.
- Main now binds/disposes Chats on render/auth changes and uses separate
  `chatOperation` without gameplay revisions. Adapter handles actual last-message
  objects/inviter peers, refreshes the selected thread after sidebar mutations.
  Account changes clear transient chats/drafts. Message action from View profile
  opens the friend's DM. Group member controls include Block plus owner Remove;
  pending invitations can be canceled and count toward10.
- Both message and non-message mutations retain the same request ID on ambiguous
  failure, with explicit retry. Definitive400/401/403/409 rejection unlocks
  corrections. No optimistic messages. Group pickers use real artwork/radio/
  checkbox selections, not a new native select. Muted chats are excluded from
  aggregate unread. Polling retains drafts/scroll/older messages and excludes
  blocked senders.
- `npm run build`:TypeScript/Vite passed with existing chunk-size advisory.
  Focused51-test run passed before two further chat tests; standalone
  `npx vitest run src\presentation\friend-chat.test.ts --maxWorkers=2`:4/4 passed
  including group retry IDs and definitive-message rejection.
- Fixed mobile CSS rule order/grid auto-row sizing after inspecting actual
  overlapping panels;390px now has no horizontal overflow and list/thread
  panels463/463 and656/656 client/scroll (page scrolling, messages contained).
  Desktop1367x640: layout500/500, both panels498/498, message viewport276px,
  details498/763 intentional scroll, composer ends at559px. Collection mobile
  dialog343/343 width, page390/390 and bottom752 within768px viewport.
  Fixtures mutate DOM only. Final validation still pending server completion.

- Owner clarified private and invite-only group text chats;500 characters,
  10 members, owner-controlled membership, unread/pin/mute/block. No sharing
  cards. Exactly32 profile pictures: acquisition/Omnic per16 bearers, plus
  neutral; no creatures or intermediate forms.
- Parent added typed picture catalogue/unlock rules, shared avatar resolver,
  Change/Browse game-native collection with search/filters/locked requirements,
  real usage previews and existing-save-queue selection. Legacy IDs map to
  acquisition pictures; no new account fields/grants/load writes. Async result
  rejects disconnected editors. Fixed an accidentally nested browse-click
  listener during this work. Special square art remains pending; existing
  character portraits are explicitly labelled temporary previews.
- `Art/characters/Element-Bearer Profile Pictures.md` now contains32 original
  1:1 portrait prompts.175-237 positive words each, exact Evo.1/6 references at
  150, identity/signature/palette locks and10% margins. Profile-specific square
  references are explicitly recognized by the general reference tests. No
  delivered art or runtime image changes.
- Parent's `friend-chat.ts`/CSS implements normalized presentation/controller:
  searchable lists, conversation/composer, details, explicit invitations/member
  controls, blocking, message escaping,10-second visible-only polling, draft/
  scroll retention, disposal guards and idempotent retry IDs. Separate client
  transport adapter and main lifecycle wiring are pending the delegated server
  API contract. Chats navigation exists but must not be reported complete yet.
- `npx vitest run src\presentation\friend-chat.test.ts
  src\presentation\profile-picture-browser.test.ts src\content\profile-pictures.test.ts
  src\presentation\online-store-profile.test.ts src\presentation\reference-ui.test.ts
  --maxWorkers=2`:51/51 passed.
  `python -m unittest discover -s tools -p test_profile_picture_art.py -q`:6 passed.
  `python -m unittest discover -s tools -p test_character_style_references.py -q`:3 passed.
  Agent's general art run has zero new-pack failures and128 unchanged failures
  (100 Master/28 Machines). `git diff --check` passed.
  Latest parent typecheck remained blocked by two profile-icon API type errors
  while the server agent was implementing its authoritative32-ID expansion.
- Presentation-only1367x640 fixture: collection dialog588/588 client/scroll,
  grid230/1298 intentional scroll. Chat fixture with32 groups/40 messages/
  10 members: document1367/1367 width; thread498/498, messages276/3248 and
  details498/739 intentional contained scrolling. Mobile/final integrated
  layout and full endpoint behavior still need verification. No owner data
  modified by fixtures; no commits.
- Running server agent `60f02109-2fd9-41da-b351-dbddeced071d` owns backend/client
  types, SQL migrations/tests, deployment and hosted smoke. Await its completion
  notification; consume report once, adapt normalized UI commands, wire main
  bind/dispose/auth lifecycle and finish tests/build/docs. Art agent
  `4b5e53ec-1d2c-4937-b7c6-59287cfb3916` completed its pack/test scope.

## Friends reference and real presence (D-259)

- Friends now shares the profile editor with a searchable accepted-friend
  center and Add friend/Requests sidebar. Received/Sent switch only requests,
  keep real count badges and survive refresh/actions/history. Actual artwork,
  public codes, incoming actions and outgoing cancellation remain wired.
  Remove friend is inside View profile with existing confirmation. No demo
  codes/badges, Beacon Seeker, direct messages or chat rooms.
- Owner approved real online/last-seen tracking. Only accepted friends receive
  server-persisted lastSeenAt and online (last accepted touch within90 seconds).
  Requests omit presence; old unavailable fields show unavailable, never fake
  offline/history. Checkpoint updates only presence text while preserving
  editor/search/tab DOM, caches current social response for future rendering.
  Approximate activity window, not instant connection/sign-out detection.
- `20261011090000_friend_presence.sql` deployed with
  `npx supabase db push --linked --yes`; no function deployment required.
  `node tools\test_server_game_sql.mjs --predeploy-presence`,
  `node tools\test_server_game_sql.mjs` and `node tools\smoke_server_game.mjs`:
  passed. Hosted tests cover accepted-friend privacy, never-seen status and
  checkpoint tracking/social ordering; disposable accounts removed.
- `npx vitest run src\presentation\online-store-profile.test.ts
  src\presentation\reference-ui.test.ts src\ui\mount.test.tsx
  src\online\server-game.test.ts --maxWorkers=2`:72/72 passed.
  `npm run build`:TypeScript/Vite passed, existing chunk advisory.
- Browser presentation-only30-friend/two-request fixture at1367x640:
  content558/558, profile510/510, center454/454, sidebar456/456 client/scroll
  heights; bounded lists keep all entries accessible and actions are44px.
  Request pane111px with257px scroll content, intentionally contained.
  Search/no-match and Sent tab event dispatch verified independently without
  hiding friends. At390px, document390px/content371px with no horizontal
  overflow and44px controls. Owner accounts/saves not mutated.
  No commits or remaining owner decisions.

## Starter Omnic alternate-skin prompt test

- Added `Art/experiments/Starter Omnic Alternate Skins.md` with Obsidian Phoenix
  Empress Infernis, Abyssal Pearl Emperor Tizu and Jade Blossom Empress Flora.
  Owner's original Omnic image URLs preserved verbatim; exact Evo.6 style
  reference retained at150. Identities/weapons/six wings unchanged, alternate
  outfits only. Central80% ensemble/10% empty margin per side and contrasting
  green/magenta/blue keys supersede old edge-fill wording in these tests only.
  No gameplay skins, image intake or production prompt changes.
- Indexed in Art/docs and workflow. Three copy-ready blocks validated with
 344/361/363 prose words (under380), one reference/negative list per block,
  original image URLs and explicit margins. `python -m unittest discover -s
  tools -p test_art_prompts.py`:28 tests ran,128 failures outside the new pack;
  no new-pack failures after matching shared background/no-light-bloom clauses.
  `git diff --check`:passed. Generated pixels and signed-link availability
  remain unverified; visual review needed. No commits.

## One-screen desktop profile (D-258)

- Removed the height-triggered two-column fallback that pushed Squad/Recent
  activity below the page on otherwise wide desktops. Compact desktop profile
  uses portrait beside Display name, tighter spacing and naturally sized rows.
  All six Story rows and five recent events remain visible; no panel overlap.
  Actions retain44px targets, text sizes and profile/save/gameplay behavior.
  Narrow screens still use page scrolling. Only redundant Auto-saves footer
  is hidden in the compact arrangement; editor keeps the Auto-saves label.
- Presentation-only fixture includes all16 bearers, three late-form squad
  members,120-character bio and five beacon events. At1367x640 and1838x640,
  content558/558, grid510/510 and every panel had matching client/scroll heights;
  all six Story rows fit within their article and buttons were at least44px.
  At1367x768, content686/686, grid638/638, zero overflowing statistics articles.
  At390px, document width390 and content/client widths371/371, no internal
  article overflow. Owner saves/accounts were not mutated.
- `npx vitest run src\presentation\online-store-profile.test.ts
  src\presentation\reference-ui.test.ts src\ui\mount.test.tsx --maxWorkers=2`:
  47/47 passed. `npm run build`:TypeScript/Vite passed, existing chunk advisory.
  No backend changes, commits or new owner decisions needed.

## Signed-in profile reference (D-257)

- Rebuilt the signed-in Player info screen around the owner's compact reference:
  portrait/editor and public identifiers, four summary cards, always-visible
  Story/Collection progress, account/pity/Save Data, and Squad/Recent activity.
  Preserved global navigation and real canonical names/artwork. Catalog totals
  are150 stages/six beacons,16 bearers,85 ordinary Conduits,30 capturable forms
  and126 Character Archive forms; captured copies remain uncapped.
- Meaningful missing reference features are approved: stable public friend code/
  Player ID (not auth UUID), username/code requests,30 accepted friends for both
  parties, forward-only online days/time and confirmed activity. No invented
  historical metrics/events, Beacon Seeker badge or demo controls.
- Compact Save now performs the guarded authoritative online checkpoint; timers
  and manual saves cannot overlap or replace an active battle snapshot. Returned
  metrics update only profile readouts. Copy/Load codes, Delete and File tools
  manage only the private offline browser envelope; they never replace online
  progress. Codes validate bounded UTF-8 envelopes and confirmed replacement
  retains rollback/error handling. New-account import safeguards are unchanged.
- Browser presentation-only fixtures at1367x768 included all16 bearers and the
  longest authored Omnic names: content686/686 and grid648/648 client/scroll
  heights, no nested profile scrolling, minimum44px buttons. At390px the page
  has no horizontal overflow or internal panel scrollers; final activity is
  reachable by page scrolling. No real save was funded or edited. Restored the
  desktop viewport and reloaded the real two-action title afterward.
- Focused validation:
  `npx vitest run src\presentation\online-store-profile.test.ts
  src\presentation\reference-ui.test.ts src\ui\opening.test.tsx
  src\ui\mount.test.tsx src\presentation\offline-save.test.ts
  src\presentation\selection-panel.test.ts src\presentation\autosave.test.ts
  src\presentation\settings.test.ts src\online\server-game.test.ts --maxWorkers=2`:
  113/113 passed. `npm run build`:passed TypeScript/Vite, existing chunk advisory.
  `npx vitest run --maxWorkers=2`:1796/1812 passed, only16 known D-253
  `upgrade-reference.test.ts` expectations of removed dropdowns remain unchanged.
  Editor diagnostics and `git diff --check` passed.
- `npx supabase db push --linked --yes` applied only
  `20261010100000_profile_references.sql`; `npx supabase functions deploy
  game-operation --project-ref ohtfgwomdfteaxubndww` deployed the regenerated
  endpoint. `node tools\test_server_game_sql.mjs`:passed against the deployed
  database. `node tools\smoke_server_game.mjs`:passed against the deployed service,
  including public codes/self-request rejection, forward-only metrics and
  concurrent acceptances with independent revisions competing for the30th
  friend. Exactly one succeeds; the other reports Friend limit reached, not a
  revision conflict. Disposable identities/records removed. Initial smoke failure
  was a self-code fixture error, corrected without backend changes.
  No commits, remaining D-257 implementation gaps or open owner decisions.

## Automatic online entry and minute autosave (D-256)

- Successful sign-in/authenticated dialog entry proceeds online and closes the
  dialog; failed connection offers Retry connection. Persisted sessions restore
  on reload; offline entry cannot override a signed-in account. Explicit sign-out
  retains its existing cleanup. Verification, recovery and new-account import/
  starter safeguards remain. Recovery enters only after password update.
- Initialized real gameplay starts a60-second nonoverlapping autosave timer.
  Offline uses validated rollback-capable `saveOfflineProgress`; online uses
  payload-free `checkpoint`, service-only row locking and re-saving of the
  authoritative aggregate. No revision/receipt/RNG/reward changes, client
  battle replacement, pending-request retries or debug/title writes.
  Account/mode changes and page exit clean up; browser restoration restarts.
- Separate polite "Your light endures. Progress saved." notice fades/removes
  after1.8 seconds; reduced motion remains static. It does not steal focus or
  replace existing errors. Save failures are explicit, with no success notice.
- `npx vitest run src\online\server-game.test.ts src\ui\opening.test.tsx
  src\presentation\autosave.test.ts src\online\account-client.test.ts
  src\presentation\offline-save.test.ts --maxWorkers=2`:61/61 passed.
  `npm run build`:passed, existing chunk advisory.
  `npx vitest run --maxWorkers=2`:1785/1801 passed;16 pre-existing
  `upgrade-reference.test.ts` assertions still expect the removed growth-preview
  details dropdown (D-253), unrelated to authentication/autosave. Not changed.
- `node tools\test_server_game_sql.mjs --predeploy-autosave`:passed in a
  rolled-back hosted transaction. `npx supabase db push --linked --yes` and
  `npx supabase functions deploy game-operation --project-ref ohtfgwomdfteaxubndww`:
  deployed the migration and regenerated endpoint. `node tools\test_server_game_sql.mjs`
  and `node tools\smoke_server_game.mjs`:passed against deployed service;
  disposable test identities/records removed. Browser verified1.8-second CSS
  and notice removal at1.9 seconds. No commits or new owner decisions needed.

## Simplified title entry (D-255)

- Removed title Player info and renamed title Play Online to
  Sign-in / Create Account. Removed unused title callback; preserved existing
  authentication/offline handlers and Player info elsewhere. Related title-entry
  instructions use the new label.
- Browser reload confirmed exactly the two requested title actions.
  `npx vitest run src\ui\opening.test.tsx src\ui\mount.test.tsx
  src\presentation\offline-save.test.ts --maxWorkers=2` passed27/27.
  `npm run build` passed with the existing chunk advisory. No commits.

## Larger equipped Master artwork (D-254)

- Increased equipped Master art/grid track64px ->112px, exactly75% larger.
  Browser confirmed112x112 art and no horizontal overflow at1367px.
  `npm run build` passed with the existing chunk advisory. CSS-only; sources
  and equipment behavior unchanged.

## Always-visible growth previews (D-253)

- Replaced growth preview details/summary with static containers/headings in
  `hub.ts`, including compact stat previews. Heading uses bordered gradient
  styling without a fake button/collapse action.
- Browser evolution fixture confirmed seven visible stats, form preview and
  styled heading with no details ancestor. `npx vitest run
  src\presentation\reference-ui.test.ts src\presentation\conduit-menu-update.test.ts
  src\presentation\menu-information.test.ts --maxWorkers=2` passed43/43.
  Updated obsolete empty-loadout global Upgrade expectation from D-251.
  `npm run build` passed with the existing chunk advisory.

## Matching Master artwork size (D-252)

- Increased equipped Master art and its grid track from44px to64px, matching
  ordinary Conduits. Browser1367x768 eight-filled-slot/Master fixture confirmed
  both at64px,686/686 content height and no horizontal overflow.
- `npm run build` passed with the existing chunk advisory. CSS-only change;
  no equipment transactions or artwork sources changed.

## Reduced Loadout cross-links (D-251)

- Removed duplicate Buy/global Upgrade links from the slot-panel heading.
  One Store link remains; equipped cards retain targeted Upgrade controls.
- `npx vitest run src\presentation\conduit-loadout.test.ts --maxWorkers=2`
  passed30/30, including exact navigation-link counts. `npm run build` passed
  with the existing chunk advisory; `git diff --check` passed.

## Master picker art and adjacent character tabs (D-250)

- Shared selection panels use canonical Master artwork for Master equipment
  options without modifying select/change hooks. Team detail portraits increase
  to160px desktop/128px phone; four tabs sit beside the gradient header on desktop.
  Squad formation art sizing is unchanged.
- Browser1367px confirmed160px portrait and tabs sharing the header's top edge;
  all three Master images loaded at64px from canonical URLs. At390px,128px
  portrait/four tabs had no horizontal overflow. No real account transactions.
- `npx vitest run src\presentation\selection-panel.test.ts
  src\presentation\reference-ui.test.ts src\presentation\conduit-menu-update.test.ts
  --maxWorkers=2` passed41/41, including Master art and one-change selection.
  `npm run build` passed with the existing chunk advisory; editor Problems clean.

## Readable Conduit cards and Details (D-249)

- `conduit-loadout.ts` gives every owned/equipped Conduit a Details action with
  current upgraded stats, full special mechanics and Omnic restrictions in the
  shared game dialog. Cards separate art/controls, identity and Upgrade/Remove
  instead of squeezing three actions and long effects into one row.
- `conduit-loadout.css` uses64px art,4px meter squares,16px names and14px
  metadata/actions, with unbroken button labels. Details uses112px contained art.
  Shared meter/assets and upgrade/equip transactions remain unchanged.
- Browser1367x768 eight-filled-slot fixture measured686/686 content height,
  no horizontal overflow and single-line Upgrade/Remove. At390px,64px art,
  button labels and modal had no horizontal overflow. Actual Omnic modal
  showed all three +5 buffs, full rule, element restriction and4-slot cap.
- Full `npx vitest run --maxWorkers=2 --reporter=json
  --outputFile="$env:TEMP\ll-d249-full.json"` passed1791/1791.
  After tightening the modal list-length assertion, `npx vitest run
  src\presentation\conduit-loadout.test.ts --maxWorkers=2` passed30/30.
  `npm run build` passed with the existing chunk advisory. No account writes
  or commits.

## Concise ability facts (D-248)

- Removed auto-appended charge tutorials and Gauge explanations from character
  ability copy. Shared resource references use compact factual labels with no
  questions. Status/critical/recovery explanations are short effect statements.
  All strengths/costs/cooldowns and frozen definitions remain unchanged.
- Browser module check confirmed Tizu Skill1 is39 words, retains damage,
  Weaken duration/scaling/cap and Defense distinction, and contains no resource
  acquisition paragraph. Full `npx vitest run --maxWorkers=2 --reporter=json
  --outputFile="$env:TEMP\ll-d248-full.json"` passed1790/1790.
  `npm run build` passed with the existing chunk advisory.

## Fresh Team entry resets to character detail (D-247)

- `visitMenu` now resets explicit Team entries to detail instead of retaining
  the last formation view. Explicit Squad routing and Back snapshot restoration
  are unchanged. No saves or selection resets.
- `npx vitest run src\presentation\menu-history.test.ts
  src\presentation\reference-ui.test.ts --maxWorkers=2` passed37/37 including
  the fresh-entry/Back regression. `npm run build` passed with the existing
  chunk advisory; `git diff --check` passed.

## Smaller squad formation portraits (D-246)

- `squad-formation.css` caps occupied/empty portrait frames at176px and trims
  card padding/gaps, retaining readable labels and44px controls.
- Browser1367x768 fixture measured176x176 art,415px cards and686/686 content
  client/scroll heights. No wallet writes. `npx vitest run
  src\presentation\roster.test.ts src\presentation\reference-ui.test.ts
  --maxWorkers=2` passed48/48; `npm run build` passed with the existing chunk
  advisory. `git diff --check` passed.

## Content-sized character portrait header (D-245)

- Corrected D-244's mistaken removal of the black gradient. Team detail headers
  now fit their content rather than spanning the page. Collection, Conduits and
  leader controls sit beneath identity beside the portrait; captured-copy
  headers share the correction. Portrait DOM/actions/stat sizing are unchanged.
- Browser fixture at1367px measured a660px header,112px portrait and adjacent
  controls; screenshot confirmed the grouping. At390px header/content had no
  horizontal overflow. Fixtures do not write account data.
- `npx vitest run src\presentation\reference-ui.test.ts
  src\presentation\conduit-menu-update.test.ts --maxWorkers=2` passed38/38.
  Existing `Build Last Light` task (`npm run build`) passed type-check/build
  with the existing chunk-size advisory. `git diff --check` passed; editor CSS
  Problems reported no errors. No commits or account writes.

## Compact Conduit and Team screens (D-244)

- Rebuilt Upgrade as a six-card paginated catalog beside current/next effects,
  horizontal levels and the real component footer. Rebuilt Equip with4x2
  slots, compact functional Master, net bonus strip, search/sort/filter controls
  and four owned rows per page. Root-delegated controls survive panel refreshes;
  title/account changes clear transient loadout state. Long rules use native
  game Information dialogs. No new spending, caps, rewards or save pathways.
- Team removes the duplicate lower equipment summary, adds Edit squad and
  unboxes/compacts its portrait header. Store icons have bounded frames and
  reserved meter space. Home/Market/global navigation are unchanged.
- Browser presentation-only fixtures at1367x768 verified actual Team loadout
  wrappers with empty and eight filled slots, long effects and net bonuses;
  content client/scroll height686/686 and no horizontal overflow. Final Upgrade
  long-effect fixture also measured686/686. No real wallet was funded.
  Narrow screens retain responsive page scrolling rather than hidden content.
- `npx vitest run --maxWorkers=2 --reporter=json
  --outputFile="$env:TEMP\ll-d244-full.json"` passed1789/1789 tests.
  Existing `Build Last Light` task (`npm run build`) passed type-check/build;
  the pre-existing large-chunk advisory remains. Editor Problems reported no
  errors; `git diff --check` passed. No commits.

## Global navigation restored (D-243)

- Restored pre-D-242 header markup/styles and removed its binder/state from
  `sanctuary.ts`/`main.ts`. Deleted the now-obsolete navigation-toggle test file;
  existing sanctuary tests explicitly reject Show/Hide controls and wrapper.
  Retained D-242's specificity-correct shell/content scrolling rules. Previous
  sizing, art containment and summon fixes are unchanged.
- `npx vitest run src\presentation\sanctuary.test.ts
  src\presentation\reference-ui.test.ts --maxWorkers=2` passed42/42.
  `npm run build` through the existing task passed including type-check,
  with the existing large-chunk advisory. `git diff --check` passed.
  Browser at1367/1024/390px confirmed four destinations, no toggle, auto content
  scrolling to the bottom and no horizontal overflow. No account transactions
  or commits. D-242's collapsible-bar details below are historical.

## Thin retractable global navigation (D-242)

- Owner clarified the global Home/Team/Summon/Play header, not the portrait
  header. `sanctuary.ts` adds an expandable controls region, slim page label
  and aria-linked toggle plus `bindSanctuaryNavigation`. `main.ts` keeps the
  expanded choice in memory across menu renders, starting expanded. Toggling
  preserves content DOM/forms/selections and never writes saves. All utilities,
  currencies and routes remain; page heading stays outside the hidden region.
- `reference-layout.css` adds compact44px controls and wrapping labels/balances.
  A specificity-correct viewport grid/content scroller also fixes the historical
  `.menu-screen.sanctuary-content` visible overflow and narrow block-shell rules
  that clipped lower content. No additional art/content font shrinking and no
  changes to title, selection, battle toolbar, gameplay or transactions.
- `sanctuary-navigation.test.ts` adds3 tests; an old negative string assertion
  now checks the exact retired nav class rather than matching the new toggle's
  name. Focused sanctuary/navigation/reference tests passed45/45.
  Final `npx vitest run --maxWorkers=2 --reporter=json
  --outputFile="$env:TEMP\ll-d242-full.json"` passed1779/1779 with0 failures
  (includes D-241 tests). `npm run build` via the existing task passed including
  type-check; existing large-chunk advisory remains. VS Code found no problems
  in changed main/navigation/CSS/test files; `git diff --check` passed.
- Browser isolated debug checks at1367/1024/390px: collapsed header53px;
  expanded60/111/162px with billion-unit balances and no clipped control labels.
  Team content scrolled to its bottom at every width (193/445/1419px offsets),
  without horizontal overflow. Collapse survives the Summon render; Show
  navigation restores all controls. Hidden controls have no visible boxes.
  Browser hidden-tab artwork transition delays remain a testing limitation;
  checks used test-only animation/decode acceleration, not runtime changes.
  No real account transactions or commits.

## Subdued summon rewards and unclipped art (D-241)

- `game-dialog.css` stops decorative halo/rays/ring/sparks at saved reveal and
  removes persistent art glow. Ten-pull art grids/children have zero intrinsic
  minimums, explicit bounds and4px clearance; material and character art fits.
  `reward-screen.ts` limits tier reveal to96-100% scale/1.15 brightness and
  a20%-opacity300/450ms flash. D-230 anticipation and tier borders remain.
  No artwork-source, receipt, transaction, odds, pity or save changes.
- `reward-screen.test.ts` adds both animated tier checks and cancellation.
  `npx vitest run src\presentation\reward-screen.test.ts
  src\presentation\summon-presentation.test.ts
  src\presentation\summon-layout.test.ts --maxWorkers=2` passed18/18.
  `npm run build` through the existing build task passed including type-check;
  only the existing large-chunk advisory remains. VS Code found no problems
  in the three changed source/test files.
- Browser presentation-only fixtures (no transactions) verified five-star
  material/duplicate results at1367/1024/390px and six-star portraits
  at1367/390px: all images/wrappers contained, revealed rays/halo hidden,
  whole-art filter/animation absent. Material images loaded successfully.
  Skip reveals and Continue disposes the test dialog. No commits created.

## Normal browser UI sizing and contained art (D-240)

- `reference-layout.css` replaces viewport-scaled root text with100%, keeps
  supporting labels at least14px, gives Team intrinsic/start-aligned rows and
  smaller bounded portraits, and constrains thumbnail/Inventory grid children.
  This supersedes D-237 and reduces D-235 art sizing without changing portrait
  identity/DOM. `conduit-upgrade.css` bounds52px icons/meters and the180px hero;
  laptops use a15rem owned column beside stacked details/resources.
- `interface.css` bounds selection dialogs to the viewport and makes choices
  visibly scrollable; `selection-panel.ts` labels/focus-enables the scroll region.
  `conduit-upgrade.ts` focus-enables its owned list; both Conduit list styles
  show scrollbars. Narrow upgrade lists cap at26rem. Backing selects, disabled
  choices, focus restoration, upgrades, equipment and atomic saves are unchanged.
  No art-source, economy, combat or online/account changes.
- Final validation after all CSS fixes: `npx vitest run --maxWorkers=2
  --reporter=json --outputFile="$env:TEMP\ll-d240-full.json"` passed1774/1774
  with0 failures. `npm run build` via the existing Build Last Light task passed,
  including `tsc --noEmit`; only the existing large-chunk advisory remains.
  VS Code reported no problems in the seven touched source/test files.
  `git diff --check` passed. The editor test runner did not discover tests;
  the existing Vitest CLI provided the full regression result.
- Browser navigation used the isolated memory-only debug profile: Home, Team,
  Summon, Gameplay and Inventory at actual1367/1024/390px all had16px root text,
  no horizontal overflow and no art exceeding tested container dimensions.
  Collections also had no overflow. Team headers ended before tabs at every
  width. Upgrade rows measured68px high;52px icons fit, lists scrolled to the
  final of85 owned entries. The ordinary picker retained85 Conduits plus the
  empty choice, scrolled to the final option at every width and restored focus
  on Escape; Settings fit390px without horizontal overflow.
  No real purchases/sales/upgrades were performed. No commits created.

## Conduit net bonus colors and search (D-239)

- `conduit-loadout.ts` splits Total bonuses into colored net change, white
  unequipped base and colored final value. Direction uses the actual before/after
  stats: green above base, red below base, unchanged rows omitted. Shared
  `stat-change.css` now includes `.loadout-bonuses`; the base has its own white
  class in `conduit-loadout.css`. No stat calculation or rounding changes.
- Your Conduits has a labeled search input, live result count and no-match message.
  `conduitMatchesSearch` matches all whitespace-separated keywords, ignoring
  case, across name/ID, canonical element, effect, stat labels, lore, rarity
  and power. `applyConduitSearch` hides owned rows only, preserving slot controls
  and row DOM. Main keeps the query in memory across render/member changes;
  `updateCharacterTab` retains it across Element-Bearer equip/Master refreshes.
  No storage writes, grants, eligibility or upgrade changes.
- Validation: focused loadout/stat-change/reference-UI tests passed 61/61 before
  the final split-color refinement. Final full regression command
  `npx vitest run --maxWorkers=2 --reporter=json
  --outputFile="$env:TEMP\ll-d239-full.json"` passed 1772/1772.
  `npm run build` passed including `tsc --noEmit` (existing large-chunk advisory).
  Browser verified actual white base/green result computed colors, description
  and combined element/effect searches, no matches, clearing, query retention
  after equip/member switching, and a 390px viewport without overflow.
  Earlier isolated debug checks verified red below-base computed color; tests
  cover the final split markup and net-positive/net-negative comparisons.

## Dedicated full-page Conduit loadout (D-238)

- `reference-team.ts` adds `conduits`/`capture-conduits` views without the Team
  sidebar, portrait header or growth tabs. `main.ts` routes the Conduits tab,
  summary links and squad pills there; Back returns to that member's detail.
  Captured details now show the shared Conduits summary instead of an embedded
  full loadout. Missing captured selections still fall back to the collection.
- `conduit-loadout.ts` supplies the member-specific Back control and loadout
  tabs. `conduit-loadout.css` provides the flat neutral full-width layout,
  outlined controls, white selected/equipped pills and responsive stacking.
  It explicitly overrides shared button gradients while preserving disabled gray.
- Mechanics, art, levels, Master selectors and atomic equip/upgrade operations
  are unchanged. The owner's reference remains read-only; temporary
  `public/__ref/mock.html` was removed.
- Validation: `npx vitest run src\presentation\conduit-loadout.test.ts
  src\presentation\reference-ui.test.ts --maxWorkers=2` passed 43/43;
  `npx vitest run --maxWorkers=2 --reporter=json
  --outputFile="$env:TEMP\ll-d238-full.json"` passed 1758/1758.
  `npm run build` passed, including `tsc --noEmit`, with the existing large-chunk
  advisory. Browser verified member switching, Back/reopen, captured-copy
  equip/unequip and return to the same copy; returning through Team after an
  Upgrade visit restores the loadout. Measured 700px/390px layouts have
  no horizontal overflow. Transactions were tested only in the isolated
  memory-only debug profile, not funded real saves.

## Viewport-scaled UI text (D-237)

Line 1 of src/presentation/reference-layout.css now scales the root font size with viewport width, bounded by height (22px cap). Audited Play/Team/Summon/Home at 1857x960, 1486x768 and 1280x960: no new horizontal overflow or clipping. Validated: full suite 1756/1756, npm run build OK.

## Squad formation redesign (D-236)

src/presentation/roster.ts squadHub/bindSquadPreview render three slot cards and a #squad-picker dialog (filters, search, slot tags, error line); styles in src/presentation/squad-formation.css (imported after roster.css). Picking writes the hidden slot selects and marks the draft; Save remains the only write. Browser-verified assign/swap/remove/leader guard/filter/search/close. Validated: focused squad suites 117/117, full suite 1756/1756, npm run build OK. Reduced motion follows the in-game data-motion setting.

## Large Team character art (D-235)

The D-235 block at the end of src/presentation/reference-layout.css makes the Team detail portrait about 307px square at 1280px (was ~74px), sidebar thumbs 4.2rem and collection card art 11rem, with <=960px/<=540px breakpoints. CSS only; portrait DOM preserved. Validated: reference-ui/upgrade-reference/roster tests 68/68, npm run build OK.

## Smaller summon banner splash (D-234)

- `reference-layout.css` caps `.ref-summon-hero` at `min(100%, 31rem)`, centered. Browser at
  1280px: art 669×375 → 494×277; phones keep full width. Featured lineup unchanged.

## Heaven/Abyss choice sales and Elemental-Devourer naming (D-233)

- Heaven/Abyss copies sell for a chosen payout: Null-Prismatica or one of the three mode
  items, 1-6 by form. `presentation/creature-sale.ts`/`.css` render shared single-payout or
  choose-one controls (Team capture detail and roster); `isSellableCreatureMode` gates
  heavens/abyss/treasury/sanctuary/roses. The Glossary loot table lists the four options.
  Online `sell-creature` forwards `saleOption`; `engine.bundle.js` regenerated.
- UI prose renames creatures to Elemental-Devourers (labels, aria, confirmations, errors,
  Information, Glossary). Stable IDs/hooks/saves untouched.
- Tests: `heaven-abyss-sale.test.ts`, updated `reference-ui`/`rosethorn-sanctuary` and renamed
  string expectations. Full suite 1756/1756; build OK. Browser save has no Heaven/Abyss copy,
  so the choice UI was verified by tests rather than funding the shared save.

## Status toasts and creature sale fix (D-232)

- Bug: selling worked, but `renderMenu()` re-rendered the sold copy's detail, `referenceTeam`
  threw "Choose an owned captured creature." and the catch reported "Creature was not sold";
  a second click on the stale view hit the currency-farm-only error. `main.ts` now returns to
  the creature list after selling the open copy and `menuContent()` falls back from a missing
  capture detail to the list.
- New `presentation/status-toast.ts`/`.css`: `showError` routes `#status` messages to a toned
  dismissible toast (in-dialog `#settings-error` stays plain text).
- Tests: `status-toast.test.ts` (tone inference, structure, dismissal). Browser-verified sale
  returns to the list with "Creature sold · +1 Seed of Rosethorn." and no error toast.

## Level-up result layout (D-231)

- `upgrade-result.ts` now renders an identity block (`.upgrade-result-level` badge +
  rating), changed-stat cards only and a compact `.upgrade-result-unchanged` list.
- `upgrade-result.css` bounds the portrait image to the stage (flex wrapper fixes a
  grid percentage-height overflow), sizes the halo to the stage, two-column phone cards.
- Tests: `upgrade-result.test.ts` counts cards per changed stat and the unchanged list.
- Validation: `npx tsc --noEmit`; full Vitest 1749/1749; `npm run build`.

## Tiered summon reveals (D-230)

- reward-screen.ts: optional `tier` (`summonRevealTier(stars)`: 5 -> five-star, 6 -> six-star) sets `data-reward-tier`, adds aria-hidden rays/ring/sparks/flash layers, tier label, longer portal (3.2s / 4.3s multi-spin) and a scale/brightness art reveal with flash. game-dialog.css holds the gold and prismatic themes plus 10-pull `is-five-star`/`is-six-star` tiles; all tier animation is disabled by both reduced-motion settings.
- summon-presentation.ts sets the tier from the pulled entry stars (duplicates keep their tier); 10-pull uses the highest. No odds/pity/save changes.
- Checked in a temporary harness (deleted): gold 5-star and prismatic 6-star screens, art/details revealed, no overflow. Tests in summon-presentation.test.ts.

## Conduit loadout page (D-229)

- New src/presentation/conduit-loadout.ts/.css render Team > Conduits like the owner mock-ups: header + squad tabs, Master card, 8 slot cards with art/pips/effect/level/next level and Upgrade/Unequip/swap, Total Bonuses, Your Conduits list with Equip. Overview has a Conduits summary card; header has a Conduits n/8 chip (`data-open-loadout`).
- main.ts: delegated `[data-loadout-equip]`/`[data-loadout-unequip]` (online performOnline or offline equipConduit), `[data-open-loadout]`, Upgrade links preselect the Conduit via `data-upgrade-target`, squad tabs keep the Conduits tab. Existing slot selects/ids/change handlers retained.
- Layout checked in a temporary harness at phone (stacked, no overflow, owned list contained) and wide desktop (two columns, 88px art). Tests: conduit-loadout.test.ts, reference-ui.test.ts; full suite 1745/1745, build OK.

## Plain Conduit wording (D-228)

- Removed player-facing "authored"/"non-authored"/"intrinsic"/"native" jargon from content/kit-conduits.ts, content/master-conduits.ts, the game/kit-conduits.ts battle message, the Conduit Store note and the Rose event note. Text only; no mechanics changed. Full suite 1737/1737.

## Larger squad battle art (D-227)

- src/presentation/battle-mono.css: a `@media (min-width: 761px)` block makes `.battle-arena` a size container; `.allies.squad .battle-art` uses `min(100%, 150px * --unit-scale, 38cqh, 24cqw)` with -5cqh unit overlap (first/last units keep their outer margin) and nameplates raised above neighbouring art. Mobile squad caps are now 17dvh (<=760px) and 16dvh (<=540px rows).
- Measured with the real BattleView (Evo6, three allies): 1530x780 -> 306px (was ~247px at a taller window), 1920x1080 -> 405px, 1280x720 -> 278px, 390x844 -> 146px; all art and nameplates stay inside the arena with no horizontal overflow. Solo/two-ally/enemy sizes unchanged.
- Test: src/presentation/battle-squad-art.test.ts checks the CSS rules.

## Unique Master Conduits and delivered art (D-226)

- content/master-conduits.ts: 36 rewritten Master rules/effect texts, 12 kept; per-character trigger and rule uniqueness are tested.
- Engine (game/kit-conduits.ts, content/conduit-kit.ts): `strike`, `charge`, `weaken-clock` outcomes; `all-allies`/`struck`/`attacker`/`all-enemies` recipients; `selfBelowHalf`. battle.ts passes `lethal`, the activation target and the shield attacker; Weaken no longer ticks on defeated enemies. Strike kills during endTurn are rewarded normally.
- Art: tools/intake_master_conduit_art.py (settings + manifest in Art/provenance), sources in Art/source/master-conduits (raw extra delivery in `alternates`, not wired), runtime in public/assets/master-conduits. Revisions: tools/master_conduit_art_revisions.py --write. Wired into equipment, Inventory chest, Archives, choice dialog, reward reveal and the Astral Reserve readout.
- Server bundle regenerated (node tools\bundle_server_game.mjs).
- Validation: master-conduits.test.ts, archives.test.ts, test_master_conduit_art.py, test_master_conduit_intake.py, full suite, build.

## Linear Story Prismatica and Treasury scaling (D-225)

- `storyFractalisDrop` (content/loot-random.ts) gives a linear Story curve, 5+2*(level-1) to double, used by battle rewards, Story validation and `storyLoot`.
- `treasuryFractalisDrop` now equals that line at Lv65 and multiplies it up to 20x at Lv120 (133-266 to 4,860-9,720). Gameplay/battle copy comes from `treasuryPrismaticaText`.
- Other modes still use `fractalisDrop`. Tests: loot-random.test.ts (linearity, Story stage tables, Treasury >= Story, accelerating steps), treasury.test.ts, menu-information.test.ts.

## Gray unavailable buttons (D-224)

- Final rule at the end of src/presentation/button-style.css grays every
  `:disabled`/`[aria-disabled="true"]` button outside `#battle-root`. Guarded by
  src/presentation/disabled-buttons.test.ts. Verified computed styles in browser.

## Elemental Crits (D-223)

- Critical Rate may exceed 100% through Conduits/one-hit bonuses. `rollCritical`
  in src/game/battle.ts: rate <= 100% uses the single original roll; above it,
  the hit always crits and a second seeded roll at (rate - 100%) makes it an
  Elemental Crit with critMultiplier x `elementalCritFactor` (1.5).
- `BattleEvent.elementalCritical`, log text "(Elemental Crit)", rainbow
  `.damage-number.elemental-critical` (battle-ui.css, static when reduced motion).
- Character stats show "Elemental Crit chance" above 100%; Conduit upgrade
  information no longer claims a 100% cap. Enemy crits unchanged.
- Validation: battle.test.ts, conduit-upgrades.test.ts, hub.test.ts; full suite/build.

## Character term explanations (D-222)

Every character-specific charge is defined wherever it appears. `kitPilotDescriptions[*].resource.summary` is the single source. `describeFighter` appends "What is X?" to each spending ability, adds a Burn rule (two enemy phases, ignores Defense, replaces older Burn) and adds a Gauge definition when a passive mentions Gauge. `kitResource` renders the summary under the resource chip, and the battle readout tooltip reuses it. Copy uses "charges", not "stacks". Validation: the `ability-status.test.ts` all-character term test plus the full suite.

## Offline-first accounts (D-221)

No gameplay or economy action requires an account. Play Offline covers every activity, summon, upgrade, the Material Exchange (offline `purchaseExchangeMaterial`) and the Conduit Store. Only friends, the public profile and profile frames stay account-gated, and the Cosmetic Store notice and errors now say they are online profile perks. Validation: `online-store-profile.test.ts` offline assertions, typecheck and the full suite.

## Gameplay information topics (D-220)

Gameplay information is a topic menu (10 topics) with one-topic detail and an
All topics back button, using shared `informationTopics`. Verified:
`information-topics.test.ts` 2/2; full suite 1,724/1,724; `npm run build` passes.
Not browser-checked because the shared tab was in active use.

## Banner featured characters (D-219)

Summon shows the banner's real 6★/5★ Element-Bearers in one compact strip under
the art (portrait, short name, Owned check), with no rates. Verified:
summon-layout/roster/reference-ui tests 50/50 pass, `npm run build` passes;
browser measurement at 2217px wide: one 126px-tall row, no horizontal scroll.

## Exchange categories, event materials and 10-pull (D-218)

Material Exchange now has Normal/Limited-time Event categories, Rose materials
(2,500-750,000 Prismatica each), Buy 1/5/10 buttons, offline purchases and a
three-choice Rose-only warning (Do not show again cancels the current purchase).
Banners add Summon 10-Pull (100 Null-Prismatica, ten sequential draws, one save;
server `summonTen`). Server bundle regenerated.

Verified:
- `npx tsc --noEmit`, `npm run build`: pass.
- `node tools\bundle_server_game.mjs`; `node tools\smoke_server_game.mjs`: hosted smoke passed.
- Targeted: material-exchange, server-game, online-store-profile, reference-ui,
  summon-presentation, roster, ui-copy tests: 7 files / 94 tests pass.
- `npx vitest run --maxWorkers=2`: 1,722/1,722 tests pass.
- Browser (debug profile): both categories, warning buttons, Purchase (+5,
  ∁E2,500) and no horizontal scroll at phone width. 10-pull browser check not
  completed (background tab stalls transitions); unit tests cover it.

## Isolated development debug profile (D-217)

Owner requests menu shortcut `Iamthelight`, explicitly chooses an isolated
development-only profile preserving real saves and max-level/evolution
characters with all gameplay ownership/stages/resources. New debug-profile
module builds/validates against live catalogs, including16 final-form EBs,
85 max-upgraded ordinary Conduits,48 Masters, every mode/Story/discovery and
90 Lv120 captured copies (three of each capturable form). Grants48 material
types at1m, currencies/components at1b and100 chests; gear starts empty.

Main routes its existing local account/profile/settings transactions through
DebugProfileStorage. Normal behavior delegates unchanged; active debug reads,
writes/removals use memory only, with no fallback to real storage. DEBUG/Exit
is visible even in battle/title. Exit reloads/discards memory. DEV-gated phrase
listener ignores fields/modifiers/repeats and is disabled in combat/dialogs/
Player info/pending online operations/transitions. Title's ordinary keyboard
account shortcut respects phrase-prefix prevented events.

Online operations/account opening and real Player info save management are
blocked while active, including the menu profile route/custom save component.
Server-only socials/cosmetics are not unlocked. No hosted change or real grants.

Verified:
- `npm test -- src\game\debug-profile.test.ts --maxWorkers=2`:4 tests pass.
  Catalog completeness/max progress, validated captures/materials/stages,
  ordinary storage forwarding, isolated actual squad/equip/summon/settings/
  removal transactions, unchanged raw saved data, reload restoration,
  production refusal and exact phrase/field/modifier/blocked-context gating.
- `npm test -- --maxWorkers=2 --reporter=json --outputFile="$env:TEMP\last-light-debug-final.json"`:
  full120 files /1712 tests pass.
- Build Last Light (`npm run build`):TypeScript/Vite pass,243 modules; existing
  large-chunk advisory only. Changed runtime/test diagnostics clear.
- Actual development app, synthetic DOM keyboard events: activation shows
  debug balance/Story clear/16 EBs/90 captures and105/105, Evo6/6. Player info
  has no real save component. Equipped ordinary Vigil Core and Infernis Master
  through actual UI change handlers; all86 slot options (empty+85) present.
  Raw browser storage unchanged throughout activation/equipment/Exit reload;
  Exit returns to normal Title with no debug marker. No real-account writes.
  Hidden-tab browser keyboard did not deliver events and activity image decode
  timed out on navigation; DOM key/change checks and completed menu markup
  were used rather than claiming normal animation/art-loading validation.
  Disposable preview returned to about:blank.
- `git diff --check`:pass with existing LF/CRLF advisories.

Debug progress intentionally disappears on reload and cannot be exported into
real saves. Production activation, online grants/social/cosmetic unlocks and
hosted rollout remain excluded. Pending art/React migration unchanged.
No commit/push requested.

## Organized Team sub-menus and ability dialogs (D-216)

Owner requests a dedicated Conduit equipment sub-menu with slots, clear compact
level/evolution material information and clickable detailed abilities. Owner
chooses equipment plus a Restore/Upgrade link, not a combined restoration
screen. Element-Bearer Team details now have Stats & Skills/Level/Evolution/
Conduits areas. Navigation updates the detail only and persists through the
existing transient history. Header/portrait/navigation survive updates.

Conduits uses the shared eight-slot responsive grid and separate Master,
Store/Upgrade links and optional effective stats. Delegated Master events work
after new detail markup and update in place. Fixed shared captured slot
controls accidentally using the Conduit selection instead of actual copy ID.
Growth shows canonical Owned / Required resource rows and visible actions;
optional stat/form preview reduces scrolling. Phone content/resources lead.
Skills/passive open existing native information dialogs with resolved
descriptions, costs/cooldowns/resources and equipment rules. Captured skills
also use dialogs with unavailable slots explicit. Rich trigger markup is
separate from plain escaped close accessibility labels.

Verified:
- `npm test -- src\presentation\hub.test.ts src\presentation\reference-ui.test.ts src\presentation\upgrade-reference.test.ts src\presentation\conduit-upgrade.test.ts src\presentation\conduit-menu-update.test.ts src\presentation\menu-information.test.ts src\game\conduit-equipment.test.ts src\game\master-conduits.test.ts --maxWorkers=2`:
  8 files /187 tests pass. Includes canonical resource names/amounts for all16
  EBs across five nonfinal forms, seven-stat previews, no input mutations,
  dialog opening/Escape, plain close label, retained header/portrait/navigation,
  actual captured copy equipment IDs and unchanged equipment/Master rules.
- Build Last Light (`npm run build`): TypeScript/Vite pass,241 modules; existing
  large-chunk advisory only. Changed runtime/test editor diagnostics clear.
- Isolated real renderers/full shared CSS and button classification:
  32 sub-menu checks (four areas x starter/populated late Rose fixtures x
  320/390/1024/1460px), no horizontal overflow, clipped control/resource widths
  or internally scrolling detail panels. Includes eight equipped Conduits,
  owned Master and maximum-safe balances/material counts.
- 16 native ability-dialog checks: all four abilities at those widths open,
  fit horizontally, close on Escape and restore trigger focus. Actual desktop
  overview/equipment screenshots inspected. No real account writes.
- `git diff --check`: pass with existing LF/CRLF advisories.

No combat/economy/reward/save-format changes or server rebundle needed.
Hosted engine rollout, pending Master/chest art and remaining React migration
stay separate. No commit/push requested.

## Inventory collapse correction (D-215)

Owner reports collapsed/overlapping Inventory. The old fixed fractional
three-row grid did not accommodate the added Master/chest panel. Inventory now
uses natural-height rows/page scroll, explicitly grouped currencies, a named
full-width Master section and visible non-scrolling holdings lists. Phone
currencies stack, icons do not shrink, heading actions wrap and decorative
empty slots stay compact. Materials/ordinary Conduits remain simultaneous.
No account writes, reward changes, new tabs or artwork changes.

Verified:
- `npm test -- src\presentation\inventory.test.ts src\presentation\reference-ui.test.ts src\game\master-conduits.test.ts --maxWorkers=2`:
  3 files /102 tests pass. Added owned Master/chest and simultaneous material/
  Conduit rendering plus immutable-input coverage.
- Build Last Light (`npm run build`): TypeScript/Vite pass,241 modules; existing
  large-chunk advisory only. Changed-file editor diagnostics clear.
- Isolated real Inventory renderer/shared CSS, four fixtures (empty,
  screenshot-like27/0 balances, populated all Masters/Conduits with maximum-safe
  balances/materials, unavailable) at320/390/1024/1460px:16 checks, no collapsed
  panels, intersecting panel rectangles, horizontal overflow or clipped control
  widths. Desktop screenshot inspected. No real account mutations.
- `git diff --check`: pass, existing LF/CRLF advisories only.

Hosted engine deployment and pending Master/chest art remain separate and
unchanged; this presentation correction needs no server rebundle. No commit
or push requested.

## Banner materials instead of new creatures (D-214)

Owner requests elemental/event materials instead of banner creatures, confirms
replacing duplicate conversions too, explicitly limits ALL material bundles
to Rare and approves retaining50:30:17 weights with tuned bundle quantities.
Common10/Uncommon6/Rare3; duplicates15 Rare. Standard has18 material outcomes
across six equally selected elements plus unchanged10 EBs. Roses has three
Rosethorn material outcomes plus unchanged3 EBs. Both keep98.9% non-character
chance, character tier odds,10 cost,80/150 pity and0.5% Legendary bonus.

Shared banner-materials content owns quantities/pools/duplicate resolution and
canonical validation. summonCharacter adds exact material stacks, cost, pity
and bonus in one validated save, never creates a new creature. Standard
duplicate family selection consumes one summon-only random roll; Roses needs
none. Existing creatures/copies/locks/gear/progress/discovery and historical
duplicate provenance remain unchanged, with no load writes/conversions.
Legacy saved server receipts still support their actual creature/copy result.
New material receipts reject wrong identities/quantities/rarities.

Rates & Information names material tiers/counts instead of creature/star rows,
saved reveals show shared real material art and quantities, inline result and
Inventory Help match. No new art requested or missing URLs. Updated historical
summon tests to preserve creature gameplay coverage through capture fixtures,
not new summons. Shared authoritative engine bundle regenerated locally.

Verified:
- `npm test -- --maxWorkers=2 --reporter=json --outputFile="$env:TEMP\last-light-material-final.json"`:
  119 files /1690 tests pass. Includes every material outcome at both exact
  probability boundaries, six-element/Rosethorn pools, Rare cap/quantities,
  pity/all-owned duplicates/bonus/one-save, raw-wallet overflow/write failure,
  old creature preservation, malformed material outcomes and server receipts.
- Build Last Light (`npm run build`):TypeScript/Vite pass,241 modules; existing
  large-chunk advisory only. Changed runtime file diagnostics clear.
- `node tools\bundle_server_game.mjs`:pass. `git diff --check`:pass with
  LF/CRLF conversion advisories only.
- Isolated real saved-reward renderer/shared CSS: Standard/Roses ordinary and
  duplicate material receipts at320/390/1024/1280px fit without horizontal
  dialog overflow or clipped Continue. Inspected actual Rosethorn Rare reveal
  screenshot and named quantity/accessibility. No owner wallet/account writes.
  Disposable preview returned to about:blank.

Hosted game-operation deployment remains pending (including prior pity/effect
updates); local server-bundle regeneration is not hosted rollout. No commit/
push requested. All requested local banner behavior is implemented; no further
owner balance choice needed.

## Readable War banners and shared menu clipping (D-213)

Owner screenshot shows a squeezed Locked button and dim trial identity. Root
cause: legacy sticky entry flex row did not wrap stage/action/100%-basis hint;
fixed card sizing and art-overlaid headings compounded readability.
Shared activity headings now sit below imagery on solid dark surfaces.
Entry rows explicitly wrap horizontally (overriding legacy phone column
direction), stage/action have useful flex bases and hints own a full row.
Activity cards/groups grow with page scrolling. Machines/Roses no longer
reserve empty picker columns. Fact definition rows consistently stack.

Shared text/filled buttons wrap; disabled menu buttons stay opaque/readable.
Quiet labels are brighter neutrals. Browser sweep also found narrow Team
level/evolution progress overflow and an inherited Home portrait size overriding
its button bounds; corrected both without changing image sources or behavior.
All stage gates, free War entries, recruitment, reward/save rules are untouched.

Verified:
- `npm test -- src\presentation\activity-banner.test.ts src\presentation\reference-ui.test.ts src\presentation\menu-information.test.ts src\presentation\ui-copy.test.ts --maxWorkers=2`:
  4 files /48 tests pass, including all three War final-stage/free-entry/
  immutable-progress regression. Initial test fixture used invalid Lv120
  starter; corrected to real Evo6 cap105, not a gameplay change.
- Final cross-menu run adds `src\presentation\sanctuary.test.ts` and
  `src\presentation\summon-layout.test.ts` to the command above:
  6 files /59 tests pass. `git diff --check` passes with LF/CRLF advisories only.
- Build Last Light (`npm run build`):TypeScript/Vite pass,240 modules; existing
  large-chunk advisory only. Changed-file diagnostics clear.
- Isolated real renderers/shared CSS/selection panels/button classification:
  all16 activity cards at320/390/1024/1280px in both locked and unlocked
  fixtures (128 card checks) have no page/card horizontal overflow or clipped
  button/title text. Home/Team/Inventory/Summon/Store/Upgrade pass text clipping
  and page overflow checks at those widths. War label contrast measured
  7.59-15.81:1 (title, identity, facts, disabled entry and unlock hint).
  No owner save or account writes. Hidden-tab requestAnimationFrame stalled
  the first browser sweep; reran synchronously with actual button classification.
- Local CSS/presentation only; no server rebundle, deployment or commit.

## Training panel polish (D-212)

Owner requests a cleaner Training panel. The actual Gameplay card now occupies
the full content column with a bounded grassy-field header, three readable facts,
compact Prismatica reward, concise run guidance and a separated entry footer.
Removed inherited empty picker column, full-card image/pseudo-header/padding and
internal card scrolling. Scoped fact overrides prevent inherited horizontal
definition rows from squeezing values into single-character phone columns.
Routes, entry bindings, squad/run rules, rewards and saves remain unchanged.

Verified: `npm test -- src\presentation\reference-ui.test.ts src\presentation\sanctuary.test.ts src\presentation\menu-information.test.ts --maxWorkers=2`
passes 3 files /47 tests. Build Last Light (`npm run build`) passes TypeScript/
Vite with only the existing large-chunk advisory. Isolated real renderer/shared
CSS at320/390/1024/1280px has no page or card horizontal overflow; inspected
desktop screenshot and exact fact/entry dimensions. No owner account writes.
Local presentation only; no commit, deployment or server bundle change needed.

## Applied allied effects and clear character abilities (D-211)

Owner requests real shields/effects on HP readouts and understandable ability
descriptions. Shared unitReadout now renders exact active Shield, Damage bonus/
last turn, Defense, one-hit protection and recovery with existing icons/text.
Inactive/dead effects hide; personal counters explicitly say charges and explain
their separation from applied effects. The full-width wrapping effect row avoids
the inherited two-column health grid collapsing HP; no new artwork required.

Added typed pure buffSnapshot and optional BattleEvent.buffs. Character events,
pilot events and Conduit/Master events record actual values when emitted.
BattleView snapshots pre-action buffs and updates them alongside HP at impact,
including remaining shield after absorption; legacy shield events use existing
deltas/shieldRemaining, never messages or final-state guesses. Other historical
effects still resolve correctly on final render. Existing combat math, triggers,
strengths, costs/cooldowns/recovery/RNG/account schemas and saves are unchanged.

All16 describeFighter outputs clarify shields (absorb before HP, higher amount
on refresh), Weaken versus Defense, one-attack critical bonuses and next-turn
caster recovery. Shared pilot triggers explain actual damage, shield absorption,
missing-HP healing, living owners and excluded Conduit sources. Bliss explicitly
requires another living ally. Existing thematic names and canonical kits remain.

Verified:
- `npm test -- --maxWorkers=2`:118 files /1679 tests pass, including four
  applied-effect tests and16 all-roster copy/immutable-strength cases.
- After final health-card grid/accessibility correction:
  `npm test -- src\presentation\ally-buffs.test.ts src\presentation\unit-readout.test.ts src\presentation\battle-impact.test.ts src\content\combat.test.ts --maxWorkers=2`:
  4 files /40 tests pass. Ordered team shield/buff snapshots, no future-state
  leakage, actual absorption, expiration/death, legacy events and target grouping.
- Build Last Light (`npm run build`):TypeScript/Vite pass,240 modules; existing
  large-chunk advisory only. Changed core/renderer diagnostics clear.
- `node tools\bundle_server_game.mjs`:pass; shared server bundle refreshed.
  `git diff --check`:pass, only LF/CRLF conversion advisories.
- Isolated actual BattleView/shared CSS, synthetic three-member squad with
  fractional shields and timed buffs:320/390/1024/1280px no horizontal overflow;
  effects fit their cards and HP retains nonzero/full row width. Desktop all3
  remain above feedback; phone labels wrap. Accessible unit names contain actual
  Shield/Damage text, not a generic replacement name. No owner saves/rewards;
  disposable view disposed and page cleaned.

Local only; hosted game-operation deployment is still needed for new event-time
buff metadata online. Legacy server shields/final state remain supported.
No commit/push/deployment. Remaining migration/artwork tasks unchanged.

## Battle speed no longer gets stuck disabled (D-210)

Owner reports intermittent speed lock. BattleView moves the existing toolbar
inside its host and retains it across renders, but blanket button locks during
entrance/local playback/online requests also disabled speed and retained utility
buttons. Exclude data-battle-speed-choice controls from those three locks.
On reattaching the toolbar, synchronize disabled state: speed stays enabled;
Leave/Settings lock only while busy and unlock when ready. Preserve actual
nodes/listeners, live playback rates, speed persistence and combat/save authority.

Verified:
- `npm test -- src\presentation\battle-toolbar.test.ts src\presentation\battle-speed.test.ts src\presentation\battle-chrome.test.ts src\presentation\battle-animations.test.ts src\presentation\battle-authority.test.ts --maxWorkers=2`:
  5 files /56 tests pass. Four new jsdom cases exercise actual retained toolbar
  through entrance/local/online playback and server rejection, live speed clicks,
  locked combat/utilities, restoration and original listeners/state preservation.
  Existing in-flight playback-rate/disposal and all-activity dispatch tests pass.
- Build Last Light (`npm run build`):TypeScript/Vite pass,238 modules; existing
  large-chunk advisory only. New test/renderer editor diagnostics clear.
- Isolated actual BattleView: speed3 works while entrance is busy; speed2 works
  during a local attack, and retained Settings unlocks after entrance. Hidden-tab
  animation timing stalled, so finite entrance animations were finished explicitly
  for this check; automated DOM tests verify completion paths deterministically.
  Synthetic session only, no owner saves/rewards written; preview disposed/cleaned.

Contract/index/decision log updated; local client correction, no server change,
commit/push or deployment. Unrelated pending work remains unchanged.

## Sidebar Menu removed (D-209)

Owner confirms removal of the screenshot's right-side Menu and top-bar trigger,
not a replacement dialog. Removed header markup, dedicated sidebar CSS/import
and obsolete main/information handling. Settings now opens directly from the
header gear using the existing handler, restoring focus there on close.
Collections has a direct book control; other destinations retain existing
Home/Inventory/Team/Store/Play routes. Help copy describes direct navigation.
Phone header uses four48px utility columns. Battle toolbar and Player info's
exclusive save-data controls are unchanged.

Verified targeted sanctuary/inventory/Conduit upgrade/Settings/Archives/menu
information tests:6 files /39 tests pass. Build Last Light (`npm run build`)
passes TypeScript/Vite,238 modules, existing large-chunk advisory only.
Changed renderer/main/information diagnostics clear. Isolated actual header
and shared CSS at320/390/1024/1280px: no page/header horizontal overflow, all
four utility controls48px, no Menu trigger/dialog and exactly one Settings
control. Synthetic balances only, no owner save writes. Disposable preview
cleaned. Contract/index/decision log updated; local only, no deployment/commit.

## Uncluttered banners and reduced pity (D-208)

Owner requests cleaner banner composition, rates only behind Rates & Information
and pity200/500 ->80/150. Owner explicitly approves honoring existing progress
on the next draw. Summon now keeps selection/pity, unobstructed artwork/title
and single-draw cost/action/result; no character/star cloud, separate Showcase
button or inline rate tiers. Home Showcase is unchanged. One centered dialog
starts with complete text-only outcome tables and filters, followed by rules.
Filters hide whole tiers; wrapping columns retain names/rarity/stars/full rates.
Removed inherited minimum artwork height so16:9 remains intact on phones too.

Shared resolver uses80/150 due-or-overdue checks with unowned priority.
Historical valid counters0-199/0-499 remain accepted and displayed exactly;
meters alone clamp. No account rewrite on read, retroactive grants or schema
change. Costs/base rates/RNG/independent banners/duplicate resets and one-write
saved transactions remain. Shared authoritative engine bundle refreshed locally.

Verified:
- `npm test -- --maxWorkers=2`:116 files /1655 tests pass. Includes exact79/80
  and149/150 thresholds, overdue read-only progress, failed writes,150 actual
  saved draws, authoritative Standard/Roses operations and both single-dialog
  outcome/filter contracts. Full suite rerun after rates-first adjustment.
- Build Last Light (`npm run build`):TypeScript/Vite pass,239 modules; existing
  large-chunk advisory only. Final build includes responsive artwork correction.
- `node tools\bundle_server_game.mjs`:pass.
- `git diff --check`:pass; only existing LF/CRLF conversion advisories.
  Changed core/renderer/new test/server-test editor diagnostics clear.
- Isolated actual renderer/shared CSS at390/1024/1280px, both real banners:
  no horizontal page/dialog/table overflow; artwork ratio16:9 at every size.
  Rates start the dialog, filters select complete tiers. Synthetic199/499
  progress shows199/80 and499/150 with Next draw guaranteed on both banners.
  No owner account/storage writes or real summons; disposable preview cleaned.

Contracts/index/decision log updated. Local only, no commit/push or hosted
deployment; hosted game-operation must be deployed to activate online80/150.
Remaining React migration, Master artwork and other pending rollout unchanged.

## Organized opening starter selection (D-207)

Owner's screenshot confirms opening Infernis/Tizu/Flora selection, requesting
better organization and less scrolling. Real React StarterSelection now groups
three compact cards beside the selected-character panel on desktop; phone/
tablet uses the same three-card row above details. Shared5-star/Common rating
appears once. Exact portraits/facing, canonical names, roles, weapons, character
colors and reveals remain. Begin precedes native Read story disclosure, with
all origin/awakening/story/vow text retained. No automatic selection/grants.

Main mounts/disposes it through the existing shared React root lifecycle.
Journey.select and original offline confirm/online bootstrap remain authoritative;
Begin locks repeated actions during save and existing explicit errors allow
retry. Player info remains reachable and choice/detail restore on return.
Keyed portraits preserve DOM/focus on selection; no whole-screen refresh.
Scoped starter-selection.css retains Georgia, current shared gradient controls,
44px+ targets and natural scrolling instead of clipped content.

Verified:
- `npm test -- src\ui\starter-selection.test.tsx src\ui\mount.test.tsx src\ui\opening.test.tsx src\game\flow.test.ts --maxWorkers=2`:
  4 files /42 tests pass: original choices/save flow, disabled initial Begin,
  selection/focus/portrait retention, optional lore reset, pending lock,
  selected restore/Player info and root disposal.
- Build Last Light (`npm run build`):TypeScript/Vite pass,239 modules; existing
  large-chunk advisory only. Changed-file editor diagnostics clear.
- Isolated actual component plus shared shell/current CSS:1024/1280 by768
  shows all cards and Begin without vertical/horizontal page overflow.
  390 by844 all three selected choices keep Begin above the bottom edge
  (about823px before shared button finish);320px has no horizontal overflow,
  46px minimum buttons and modest natural vertical scroll. Full story retained.
  Included D-206 gradient button classification; artwork cards stay exempt.
  No real account/storage writes; native pointer automation timed out in hidden
  tab, DOM click verification succeeded. No claim of hosted account mutation.

Contracts/index/decision log updated. Local only, no commit/push/deployment.
Other retained menus/battle React migration and Master artwork remain pending.

## Gradient buttons and off-center labels (D-206)

Owner requests gradients on background-less buttons and bold corner/stylish
labels across all screens. Added `src/presentation/button-style.ts` (DOM tagger,
installed in `main.ts`) and `button-style.css` (imported last). Artwork buttons
and battle units untouched; existing gradient fills keep their look.

Verified in an isolated browser tab (empty storage, offline save created for the
test and cleared afterwards): Title, starter select (portrait cards unchanged),
Home (Market/Inventory heading top-left, arrow bottom-right), Summon before/after,
Play, Team and Menu drawer. `npm run build` passes. `npx vitest run`: 1645/1646;
the one failure (`integrated-economy.test.ts` pity milestones) is a parallel-load
timeout and passes alone (4/4). Battle toolbar, Settings and dialogs inherit the
rule but were not individually screenshot-reviewed.

## Activity sidebar horizontal overflow corrected (D-205)

Owner reports sideways scroll in Activity navigation. reference-layout.css
explicitly resets inherited flex-wrap/fixed tab flex bases, stretches the rail
within its column, prevents section shrink and permits width-safe label wrapping.
Phones use responsive grid rows instead of a horizontal strip. Vertical scroll
and all category links remain; no hidden-overflow workaround or gameplay changes.

Verified isolated actual Gameplay renderer with all legacy/current CSS:
rail clientWidth/scrollWidth both216 at1280px, both208 at1024px/short height,
both321 at390px. All phone links fit, minimum height64px; no horizontal page
overflow at any checked width. Currency category selected without save writes.
Build Last Light (`npm run build`) passes TypeScript/Vite,235 modules, existing
large-chunk advisory only. Contract/index/decision log updated; local only.

## Conduit layout fit and retained menu interactions (D-204)

Owner reports Conduit layout mismatch and full-screen refresh on selection.
Corrected card flex sizing and bounded Store/Upgrade hero icon frames so
artwork/upgrade meters stay in their intended stage rather than overlapping
headings. No image/source changes or clipped-overflow workaround.

updateConduitStore/updateConduitUpgradeMenu now update relevant panels only.
Main selection handlers no longer call renderMenu; same-selected targets no-op.
Store catalog/cards/art survive selection and purchase; filter controls remain,
catalog entries replace only when changed. Upgrade owned rows survive, while
actual detail/actions/resources update; Earn components keeps its bound node.
Purchase/upgrade success rebinds new transaction buttons and updates header
balances, retaining atomic persistence, confirmations and saved reward reveals.
Other menu refreshes/remaining React migration are outside this correction.

Verified:
- `npm test -- src\presentation\conduit-menu-update.test.ts src\presentation\conduit-store.test.ts src\presentation\conduit-upgrade.test.ts src\presentation\reference-ui.test.ts --maxWorkers=2`:
  4 files /49 tests pass, including five new DOM regression cases for retained
  nodes/focus/scroll, selection, purchases, filters, upgrade levels/actions and
  explicit missing-panel errors.
- Build Last Light (`npm run build`):TypeScript/Vite pass,235 modules; existing
  large-chunk advisory only. Initial NodeList spread errors corrected using
  Array.from, consistent with this repository's DOM library configuration.
- Isolated actual-renderer Store at1280/390px: artwork fits card/hero before
  titles, no horizontal page overflow; selection retains header/catalog/card
  identity and focus. Upgrade390px retains header/list and selects real actions.
  Used synthetic in-memory holdings only, no owner account/save mutation.

Contract/index/decision log updated. No commit/push or hosted deployment.
Remaining React migration and Master artwork/deployment are unchanged.

## Menu header and content scale (D-203)

Owner requests a larger top bar with other menu UI slightly smaller. Shared
reference-layout.css now uses a5.15rem header minimum (previous4.5rem), larger
brand/currency/icons, 1.05rem dock labels and48px utilities. Main content uses
.95rem body copy and modestly reduced panel/card/heading spacing. No zoom,
root-font scaling, portrait resizing or gameplay/save changes. Georgia, leader
themes, full numbers,12px note floors and44px content targets remain.

Phone wallet grid places currencies above three48px utility buttons, preventing
legacy full-row wallet overrides and very narrow balance columns. Desktop
navigation/wallet remain separate. Title, pre-game Player info, dialogs and
battle are not globally scaled; save actions still live only in Player info.

Verified:
- `npm test -- src\presentation\reference-ui.test.ts src\presentation\sanctuary.test.ts src\presentation\leader-theme.test.ts src\presentation\online-store-profile.test.ts src\presentation\inventory.test.ts src\presentation\archives.test.ts src\presentation\conduit-store.test.ts src\ui\opening.test.tsx --maxWorkers=2`:
  8 files /107 tests pass.
- Build Last Light (`npm run build`):TypeScript/Vite pass,235 modules; existing
  large-chunk advisory only.
- Isolated actual-renderer browser checks across Home/Team/Play/Summon/
  Inventory/Collections/Conduit Store/Upgrade and mounted Player info at390,
  1024 and1280px: no header overlap/horizontal page overflow, content controls
  at least44px. Maximum-safe balances stay complete. Additional320px header
  stress check fits with48px utilities. Desktop dock type about17px versus
  content15-16px; normal1280 header about85px. No real account/storage writes.

[Contract](menus-and-inventory.md#menu-header-and-content-scale-d-203);
index/decision log updated. Local only, no commit/push/hosted publication.
Remaining React migration, Master artwork/deployment and owner visual review
remain pending.

## Save-data management in Player info only (D-202)

Owner requests all save-file information/actions in Player info alone and
explicitly confirms moving backup warnings and new-account Import/Start fresh
out of registration too. Removed title save panel/destructive recovery button,
both menu/battle Settings mounts and account-dialog import/export/staging logic.
Title has Play Online, Play Offline and Player info; selection also links there.

src/ui/player-save-data.tsx owns the real React save-data panel and pre-game
Player info screen. Retained offline Profile now has actual save controls;
online Profile mounts the same panel only in Player info, never Friends.
ll-player-save-data replaces the removed ll-offline-save boundary and retains
connected/disconnected cleanup and change events. Shared Georgia/polished
panels/actions are used; no extra save implementation or wallet schema.

Offline Save/Export/Load/Delete, limits, overwrite/deletion confirmations,
validation, rollback and automatic progression writes are unchanged. Unreadable
offline saves can be deleted or restored before starter selection. Offline menu
load discards only the old offline run and remains on Player info; deletion
remains in pre-game Player info. Offline management during online play never
changes modes, overwrites online progress or discards an online session.

Account dialog now handles access/recovery only. Unstarted online accounts land
in Player info to import or explicitly confirm fresh progress before selecting
a starter; closing returns to title. Player info provides account access, backup
warning and refreshable online status. Previously staged registration imports
restore only for the matching username with the same request ID. New selections/
imports happen there, preserve offline originals, and retain uncertain-request
IDs for retry. Cancelling either choice leaves data unchanged; established
accounts remain nonreplaceable. Auth changes clear stale in-memory choices;
failed online reads report errors rather than claim an established account.

Verified:
- `npm test -- src\ui\opening.test.tsx src\ui\mount.test.tsx src\presentation\offline-save.test.ts src\presentation\online-store-profile.test.ts src\presentation\settings-panel.test.ts src\game\save-file.test.ts src\online\account-client.test.ts src\presentation\reference-ui.test.ts src\presentation\sanctuary.test.ts src\presentation\ui-copy.test.ts --maxWorkers=2`:
  10 files /96 tests pass. Covers placement, pre-starter recovery, unchanged
  registration data, import cancellation/retry/staged IDs, wrong usernames,
  account switches, failed reads, late upload disposal and Profile/Friends.
- Build Last Light (`npm run build`):TypeScript/Vite pass,235 modules;
  existing large-chunk advisory only. Changed UI/main editor diagnostics clear.
- Isolated browser with empty in-memory storage/no main/Phaser/account writes:
  pre-game Player info fits390px/1280px with Georgia and46px buttons. Save without
  a starter reports its real error. Actual title exposes only three navigation
  actions/no file inputs. Actual offline/online Profile layouts fit both widths;
  four save actions remain44px+ (about57px phone/48px desktop). Friends has no
  save-data mount. Authentication/import behavior is covered by mocked
  component tests, not a hosted account mutation. Disposable preview cleaned.

[Contract](mono-ui-and-cloud-saves.md#player-info-owns-save-data-management-d-202),
menus/index/decision log updated. Supersedes historical title/Settings/
registration save placement. No engine/server/schema changes, commit/push or
hosted publication. Remaining React migration and Master artwork/deployment
work is unchanged.

## Character Masters and choice chests (D-201)

Owner requests three character-specific Omnic Masters for every Element-Bearer,
cosmic/planetary machinery art and a mechanically flaming locked choice chest
with a 1% final-Machines-boss drop. Follow-up approves choices for any unowned
Master, including future characters, and one matching Master per bearer.

Implemented 48 unique designs in src/content/master-conduits.ts, separate from
85 ordinary Conduits/pools/upgrades. Fixed effective-event-driven kit effects
include personal Burn extension, Fracture, shields/heals, Gauge, cooldowns,
refresh-only Attack/protection and 16 Astral Reserve designs (cap three).
No generated-effect recursion, revival, captures, auto-equip or ordinary-slot
consumption. Actual field counters/full references expose names, clocks/effects.
New encounter memory resets; Settings preserves it and Continue/Training/Retry
retain frozen Master equipment. Existing reward/combat streams are unchanged.

Final Machines stage100/Lv120 boss independently rolls one chest at1% on a
separate continuing stream. Strict source/stage/level/phase validation, safe
counts and receipt-deduplication commit it with kill rewards in one write.
Inventory opens a React choice dialog, then an in-game confirmation naming the
exact selected Master/effect. One chest/unlock save precedes reward presentation.
Future-character unlocks never grant characters; duplicates reject and all-owned
extra chests remain unopened. One separate matching Team slot, Inventory,
Collections, creature loot and Battle/Character references are wired.

Optional walletv5 masterChests/masterConduits/masterEquipment validate without
legacy load writes/grants. Save files retain them. Offline and authoritative
server operations share helpers; durable online Retry uses frozen equipment.
Server source/generated engine.bundle.js refreshed locally, not deployed.

Combined Art/conduits/Master Conduits.md has50 reproducible prompts:48 Masters,
chest and Astral Reserve. Densely layered cosmic machinery, character palettes,
opaque flames and complete outer margins; no references or generated PNG claims.
All new runtime visuals are explicitly pending, no guessed asset URLs.
[Feature specification](master-conduits.md); index, decisions, related menu/
Conduit/Machines/art documents and Art index updated.

Verified:
- `npm test -- --maxWorkers=2`:113 files /1632 tests pass. Includes64 Master
  engine/save/equipment/server cases and two React lifecycle/choice tests.
  Initial obsolete display assertions and test fixtures corrected. One full-run
  existing economy timeout under concurrent build load passed on the final
  isolated run; no unrelated timeout/configuration changes.
- Build Last Light (`npm run build`):TypeScript/Vite pass,240 modules;
  existing large-chunk advisory only. New-file editor diagnostics clear.
- `python tools\build_master_conduit_art.py` and
  `python -m unittest discover -s tools -p test_master_conduit_art.py`:50 prompts
  reproduced, three tests pass.
- `node tools\bundle_server_game.mjs`:successful bundle refresh.
  `git --no-pager diff --check`:pass (existing LF/CRLF advisory only).
- Isolated no-main/no-Phaser browser with synthetic in-memory holdings:
  React choice has16 character options/three exact cards, disables owned entries;
  future-character selection returns master-nerithe-2 without spending.
  Cancel restores opener focus and preserves chests. Dialog fits1280 desktop
  and390 phone with Georgia/no horizontal overflow,44px+ controls. Actual
  Team/Inventory renderer widths fit both sizes; bound Master selection trigger
  is44px desktop/54px phone. Event dispatch checks avoid hidden-browser pointer
  instability; screenshot cropping prevents claiming a visual gallery.
  No owner account writes; disposable preview cleaned to about:blank.

Remaining:48 Master/chest/emblem PNG delivery/intake, hosted function/frontend
publication and owner visual acceptance. Remaining whole-game React migration
batches are still pending. No commit/push/deployment.

## Shared menu polish (D-200)

Owner requests all menus polished with proper typography, suggesting Georgia.
Restored the shared Georgia stack in current reference styles, removed active
Sora imports/local face, and stopped desktop root/menu font shrinking. Shared
body/control/heading hierarchy, contrast, tabular numbers, panels/separators,
card/field spacing, focus/destructive states and React account/save copy refined.
Header intrinsic columns prevent nav/wallet overlap; full balances wrap rather
than abbreviate. Team identity loses its inherited decorative oval. Compact
desktop adjusts dense columns; phone growth/rates stack and equipment uses two
columns. Story-region labels and React title notes/kickers have12px floors;
Settings no longer retains explicit sans-serif field fonts.

Changed owning styles:src/presentation/reference-layout.css,
src/presentation/mono-reference.css, src/styles/ui.css and font imports in
src/main.ts. No new stylesheet, mechanics, transactions or animation changes.
Leader accents, contained detail lists/page scrolling, full values and existing
upgrade celebration hooks remain. Sora dependency remains unused in the manifest.

Verified:
- `npm test -- src\presentation\reference-ui.test.ts src\presentation\sanctuary.test.ts src\presentation\leader-theme.test.ts src\presentation\settings-panel.test.ts src\presentation\archives.test.ts src\presentation\conduit-store.test.ts src\presentation\conduit-upgrade.test.ts src\presentation\online-store-profile.test.ts src\presentation\inventory.test.ts src\presentation\roster.test.ts src\presentation\upgrade-reference.test.ts src\ui\opening.test.tsx src\ui\mount.test.tsx --maxWorkers=2`:
  13 files /130 tests pass.
- Build Last Light (`npm run build`):TypeScript/Vite pass,237 modules;
  no Sora font outputs, existing large-chunk advisory only. Editor diagnostics
  report no errors in the four changed code/style files.
- In-memory actual-renderer checks cover10 main menus at1280/1024 desktop
  and390px phone:page widths fit, desktop header has no overlap, tested buttons
  remain44px+. Synthetic online Profile also fits phone width.
- Separate no-main/no-Phaser preview checks all five Team views (bearer detail/
  collection, creature collection/detail, formation) plus bound Story navigation
  and real equipment selection triggers. No horizontal content overflow at1024px
  or390px, including maximum-safe currency balances. Computed font is Georgia.
  Mobile Story screenshot inspected; hidden-browser screenshot freshness is not
  reliable enough to claim a complete screenshot gallery.
- React title has52px play actions and46px save actions at390px. Actual account
  sign-in dialog fits354px at390px, uses Georgia and44px+ controls; no account
  submission. Settings/confirmation fit desktop with Georgia/no horizontal
  overflow. Confirmation cancellation resolves false without deleting data.
  No fixture transactions or owner account mutations.

Remaining:owner visual acceptance and approved later React conversion batches.
Not every modal/state has independent screenshot coverage; shared styles and
existing functional regressions are verified. No commit/push, server deployment
or hosted frontend publication.

## Delivered Omnic kit-Conduit intake (D-199)

Owner requests all25 root Omnic Conduit PNGs moved, background-removed and wired.
All25 exact filenames match existing reborn kit identities. Byte-identical originals
are archived in Art/source/kit-conduits; transparent256px/224px-content exports
use stable IDs in public/assets/conduits. Reviewed row-gradient/multi-shade keys,
connected enclosed openings and empty-border cleanup preserve ivory metal,
matching turquoise/green facets and painted shadows. Firstlight's brighter
interior backdrop has explicit reviewed shades and halo-opening seeds, not
blanket turquoise removal. Supplied alpha remains authoritative.

Dedicated tools/intake_kit_conduit_art.py and Art/provenance/kit-conduit-art-settings.json
reproduce all25; kit-conduit-art-intake.json records original/runtime/pixel hashes,
dimensions and settings. Only these25 verified root copies were removed after
archive/export verification. Historical60 sources, exports and D-177 review are
unchanged. Shared catalog art IDs and generated byte revisions cover Inventory,
Collections, equipment/showcases and battle reward/reference artwork. All85
catalog icons now resolve real assets. No new items, acquisition/rules/stats,
equipment migration, save writes, currency changes or gameplay RNG.

Verified:
- `python tools\intake_kit_conduit_art.py --apply --reviewed --remove-incoming`:
  25 installed with original/hash verification; final refined exports reproduced
  with `python tools\intake_kit_conduit_art.py --apply`.
- `python tools\conduit_art_revisions.py --write`:85 revisioned assets.
  `python tools\build_kit_conduit_art.py`:generated prompt/status authority updated.
- `python -m unittest discover -s tools -p 'test*conduit*.py'`:9 tests pass,
  including exact mapping/hashes/reproduction, dimensions/padding, supplied-alpha
  bypass, preserved green crystal/ivory/turquoise and cleared actual backdrop.
  Historical60-icon review and generated prompts/revisions still pass.
- `npm test -- src\presentation\machine-art.test.ts src\presentation\archives.test.ts src\game\machines.test.ts src\game\kit-conduits.test.ts src\presentation\conduit-store.test.ts src\presentation\item-showcase.test.ts --maxWorkers=2`:
  6 files /124 tests pass.
- Build Last Light (`npm run build`):TypeScript/Vite pass,241 modules;
  existing large-bundle advisory only. Editor diagnostics pass.
- Dark/light source/runtime composites inspected. Disposable browser grid uses
  the actual shared conduitIcon resolver; all25 images decode at256px with
  versioned URLs. No owner account mutation; preview page cleaned to about:blank.
  The final Firstlight cleanup is additionally verified at source resolution.

Documentation/index/decision log updated. No commit/push, server changes or
hosted frontend publication. No artwork remains pending in the Conduit catalog.
Remaining approved React migration batches are unrelated and still pending.

## Home Squad removal and upgrade animation repair (D-198)

Owner reports saved upgrades aborting with missing-portrait error and explicitly
removes the Squad panel from Home. Root cause:celebrateUpgrade still queried the
retired `.character-hub` ancestor; current Team uses `.hub-showcase`. Shared
showcase/portrait selector now matches both layouts, including level/evolution/
Max Level call sites. CSS portrait animations and reduced-motion rules match it;
current reference portrait positions the aura locally. Subsequent saved seven-stat
reward reveal is no longer skipped. Transactions/stats/costs/RNG are unchanged.

Home removes squad slots/Edit/Make leader; Team retains all squad management.
Current saved leader showcase (including captures), Story arena and Market/
Inventory remain. Desktop Story occupies the removed row; obsolete Home squad
CSS removed. No squad saves/order/theme/run snapshot changes.

Verified:
- `npm test -- src\presentation\upgrade-reference.test.ts src\presentation\upgrade-celebration.test.ts src\presentation\upgrade-result.test.ts src\presentation\reference-ui.test.ts src\presentation\hub.test.ts --maxWorkers=2`:5 files /98 tests pass.
  New DOM tests use actual referenceTeam markup (no `.character-hub`), preserve
  portrait DOM, play level/evolution aura/sparks then saved stat reveal, test
  cleanup/reduced motion. Home tests assert no Squad/formation/Make leader.
- Build Last Light (`npm run build`):TypeScript/Vite pass,241 modules; existing
  large-bundle advisory. Editor diagnostics and `git --no-pager diff --check`
  pass (CRLF advisory only). Final follow-up only removes obsolete Home CSS.
- Disposable in-memory actual main fixture levels Infernis12ↁE3 after normal
  confirmation, saves once and mounts the Level up reward reveal with actual
  553.4ↁE90.84 HP/+37.44 plus remaining stats. Browser reports portrait
  `upgrade-portrait-level` animation and `celebrating-level` class. Hidden-browser
  activity transition required manually finishing finite animations and produced
  an artwork-timeout status before entry; no missing-portrait error on upgrade.
  This verifies animation wiring, not natural hidden-browser playback.
- Home has no Squad panel on desktop1280x960/mobile390x844; leader/Story/shops
  remain and mobile panels fit351.5px without horizontal overflow.
  No owner data touched. Disposable page cleaned to about:blank.

No server changes/deployment, commit/push or hosted frontend publication.
Remaining React batches remain pending; this request does not claim to convert
Home/upgrade results to React. Owner visual acceptance is pending.

## React UI migration: first verified batch (D-197)

Owner explicitly requests React-based menus/modals and selects migrating all UI
in verified batches, starting with shared components/title/account/save screens.
Existing mock-up remains the visual target; React is not itself polish or owner
acceptance. First batch is implemented, not a claim of full-game conversion.

Changed:
- Added React19/react-dom, Zustand5/Immer and JSX typing. Keep current
  TypeScript5.9/Vite7 rather than downgrading. jsdom is development-only for
  real React DOM interaction tests; `npm install` reports0 vulnerabilities.
- Shared typed Button/Panel/Status/Dialog and inline SVG in `src/ui`;
  scoped hand-written `src/styles/ui.css` owns consistent surfaces, spacing,
  typography, hover/focus/disabled/destructive states and46px controls.
  Title entry actions are52px. Leader variables flow through shared theming.
- Title and all offline save panels are real React components, not raw appended
  buttons/HTML wrappers. Online sign-in/create/recovery/password-reset/import
  dialog is React, with separate account views and original transaction rules.
- Zustand/Immer is transient UI state only, currently unreadable-save recovery;
  no editable client copy of authoritative online holdings. Saves/server rules/
  schemas/RNG/rewards and battle renderer/animations are unchanged.
- Title root unmounts before retained screens replace the app. Temporary
  `ll-offline-save` connected/disconnected boundary mounts real React save
  panels inside legacy Settings, including battle Settings. DOM moves preserve
  the same root; removal cleans it up. Successful load/delete forwards into
  existing run/navigation reset. Uploads lock actions and late results after
  unmount cannot overwrite progress.
- Removed superseded raw title/save/account styling. Future new UI must use
  shared typed components; remaining legacy renderers exist only pending
  their scheduled migration. Contract/batches in
  [React migration](mono-ui-and-cloud-saves.md#react-ui-migration-d-197).

Verified:
- `npm test -- --maxWorkers=2`:110 files /1563 tests pass.
- Final `npm test -- src\ui\opening.test.tsx src\ui\mount.test.tsx src\presentation\offline-save.test.ts --maxWorkers=2`:3 files /18 tests pass,
  including subsequent root-preservation-on-DOM-move correction.
  Covers six actions, recovery, save/export, malformed/valid import, cancel/
  delete/auth isolation, late-upload rejection, backup/explicit opt-out, staged
  import/fresh registration, exact request ID, established-account gating,
  cleanup and React/legacy Settings boundary.
- Build Last Light (`npm run build`):TypeScript/Vite pass,241 modules.
  Existing large-bundle advisory remains; React increases frontend bundle size.
  Editor diagnostics and `git --no-pager diff --check` pass (CRLF advisory only).
- In-memory disposable browser:actual title fits1280x720 and390x844 without
  horizontal/outer vertical scrolling, including saved-status text on desktop;
  buttons52/46px, real surface colors/radii and title screenshots inspected.
  Mobile registration/import dialog stays within390px, no horizontal overflow,
  with contained scrolling for dense content. Account sign-in/create/import
  selection and Close work. Navigation into offline Home/Settings mounts one
  real React save panel; Save works, theme resolves Infernic#fa8d63. Returning
  to title mounts a fresh root. Scripted DOM clicks used for hidden browser;
  screenshot viewport buffer can include unused black area outside mobile size.
  No real registration/import or owner save mutation in browser checks.
  Disposable page navigated to about:blank.

Remaining:
- Selection, shared navigation/sheets, Home/Team, Play/Story, Summon, holdings/
  stores/profile and remaining confirmation/reward/upgrade/battle UI still
  require subsequent React batches. No animations or functionality were removed
  to facilitate this first batch. Existing transaction confirmations retain the
  game-dialog foundation for now.
- React Fast Refresh is not configured; Vite JSX works and HMR can reload pages.
- Hosted frontend publication, full migration and visual owner acceptance remain
  pending. No server deployment required for this presentation-only batch.
  No commit/push. Owner-approved next scope is continued verified UI migration.

## Play Offline save files and new-account transfer (D-196)

Owner rejects "Legacy Mode" and approves complete offline progress transfer once,
only into a brand-new online account. Title now offers Play Online / Play Offline.
Title and offline Settings expose Save, Export Save File, Load Save File and
Delete Save Data. Existing automatic saving remains. Files contain the complete
normalized wallet and original starter profile, excluding credentials, device
settings and active runs. Load validates before confirmed replacement; failed
multi-key writes restore prior values or report restoration failure explicitly.
Delete preserves online auth/account data and device settings.

Registration offers Import Save File / Start fresh, warns when current offline
progress has not been exported and requires confirmation to proceed without a
backup. Import selection stays locally staged through email verification; after
sign-in, Play Online confirms the transfer. Choosing fresh clears a previous
staged registration import. File reads disable actions until validation finishes,
and closing the account dialog discards late upload results. Offline originals
remain. Download initiation does not prove a file was retained.

Authenticated server import requires revision0 and no existing starter/run;
existing CAS/idempotent atomic commit handles concurrent first operations and
identical retries. Imported editable balances/progress are explicitly approved
by the owner, not verified earnings or an anti-cheat guarantee. Online identity,
social data and cosmetics remain server-owned. Upload/import cap is4MB.

Verified:
- `npm test -- src\game\save-file.test.ts src\presentation\offline-save.test.ts src\online\server-game.test.ts src\online\account-client.test.ts src\presentation\online-store-profile.test.ts src\presentation\settings-panel.test.ts --maxWorkers=2`:6 files /39 tests pass.
- `npm test -- --maxWorkers=2`:108 files /1548 tests pass.
- Build Last Light (`npm run build`):TypeScript/Vite pass,206 modules; existing
  large-bundle advisory. Editor diagnostics and `git --no-pager diff --check`
  pass (CRLF advisory only).
- `node tools\bundle_server_game.mjs`, `npx tsc --project supabase\functions\game-operation\tsconfig.json --pretty false`,
  `npx --yes deno check supabase\functions\game-operation\index.ts`:pass.
- `node tools\test_server_game_sql.mjs`:hosted rollback SQL passes.
- `npx supabase functions deploy game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt`:deployed.
- `node tools\smoke_server_game.mjs`:hosted complete-wallet import (>8KB),
  identical retry, repeated/started-account rejection and existing gameplay/
  social/CAS checks pass; disposable hosted identities removed.
- Disposable in-memory browser fixture:Save, export initiation, malformed upload
  rejection preserving500 Prismatica, confirmed valid load restoring900,
  Delete cancel preserving900 and confirmed Delete preserving auth/settings.
  Title fits1280x720 and390x844 without page overflow; all six buttons are at
  least44px high. Initial horizontal overflow came from a missing fixture
  backdrop container, not production markup; compact title spacing prevents
  the additional controls causing unnecessary vertical scrolling.
- Browser account checks use mocked services:backup warning and staged
  registration, signed-in import confirmation restoring1234 Prismatica,
  staging cleanup, fresh registration clearing old staging, and actions disabled
  during a deliberately delayed file read. No successful real registration in
  browser testing; an initial incorrectly mocked request was rejected. Scripted
  DOM clicks used for the hidden browser. Fixture navigated to about:blank;
  no owner storage was changed or test files added to the repository.

Server function is deployed; hosted frontend publication remains pending.
No commit or push. No owner decision is outstanding for this task.

## Full-screen gradient coverage correction

Owner reports the main-menu gradient does not stretch across the screen.
Removed the capped70vw/65vh bloom oval and mobile size override. Bloom now
overscans the viewport by50% on each edge with modest bounded drift; a faint
leader-tinted base gradient covers the full nonbattle background. Battle remains
lighter and scenery-preserving. No layout, account or gameplay changes.

`npm test -- src\presentation\ambient-background.test.ts src\presentation\leader-theme.test.ts --maxWorkers=2`:
2 files /39 tests pass. Editor diagnostics and `git --no-pager diff --check` pass.
Disposable browser fixture verifies background dimensions equal1280x720 and
390x844; bloom covers every edge at five sampled times across its38s drift,
matching Oceanic tint and no horizontal overflow. Fixture removed. These are
manual timeline samples, not hidden-browser natural playback. Hosted frontend
publication remains pending.

## Current captured creature Team parity (D-195)

Owner requests creature UI match Element-Bearers while retaining Sell and related
copy controls. Team captured details now use the same identity header and
Stats/Skills/Growth/Conduits four-panel composition, not the legacy oversized
portrait with one long control column. Shared stats include all seven values
and Before Conduits comparisons; shared equipment renders eight ordinary slots,
reserved Master and Store/Upgrade links with captured-copy transaction hooks.
Collection captions include actual stars/element/level and squad membership.
Header retains copy identity, cap120/fixed form, locks and leader/squad actions.
Actual retained skills/costs/cooldowns, Max Level, level costs, sale value and
protection reasons remain. No invented passive/evolution/ultimate, save changes,
server changes or gameplay/transaction changes. Leader tint covers sidebar
selection and progress bars too.

Verified:
- `npm test -- src\presentation\reference-ui.test.ts src\presentation\hub.test.ts src\presentation\roster.test.ts --maxWorkers=2`:3 files /85 tests pass.
  Covers independent copies, lock hooks, all eight slots, sale-enabled/blocked/
  unsupported modes, max120 and immutable rendering.
- Build Last Light (`npm run build`):TypeScript/Vite pass,204 modules; existing
  large-bundle advisory. Editor diagnostics and `git --no-pager diff --check`
  pass (CRLF advisory only).
- Disposable in-memory Votive RoseliusLv89 fixture: desktop1280x720 reference
  header/four bounded panels without outer page scrolling or horizontal overflow;
  mobile390x844 stacks all four panels/eight slots without horizontal overflow.
  Dense panels retain contained scrolling, as on the bearer layout.
  Shared slot selection dialog opens with the correct slot label; scripted DOM
  click used because hidden-browser stable-element waits timed out. No account
  writes or owner-page mutations. Fixture removed.

Frontend publication and visual owner acceptance remain pending. No server
redeployment is needed.

## Current squad leader theme and bloom (D-194)

Owner requests menu accents follow the chosen squad leader and all screens gain
a matching slowly drifting bloom puff. Shared leader-theme resolves all16
Element-Bearers and captured combat elements; frame applies root variables for
menus and body-mounted dialogs. Active navigation, primary actions, selected
controls, focus/hover and Story arrows use the canonical shared palette.
Battle uses its frozen first squad member even after actor/leader death or menu
changes. Before a leader is available, opening screens remain neutral.

Existing ambient backgrounds now include a bounded radial bloom animated with
CSS transforms; lighter battle overlay preserves supplied scenery, animations
and interaction. In-game Reduce motion stops drift. Dialog tint is static.
No account/save/RNG/combat/server changes or unrelated palette rewrites.

Verified:
- `npm test -- src\presentation\leader-theme.test.ts src\presentation\ambient-background.test.ts src\presentation\reference-ui.test.ts --maxWorkers=2`:3 files /65 tests pass.
- Build Last Light (`npm run build`):TypeScript/Vite pass,204 modules; existing
  large-bundle advisory remains. Editor diagnostics and `git --no-pager diff --check`
  pass (CRLF advisory only).
- Disposable in-memory browser fixtures verify all six actual navigation/dialog
  colors and matching bloom gradients, keyboard-visible Oceanic focus, no
  horizontal overflow at1280x720 and390x844, pointer-transparent layers and
  retained loaded battle scenery/unblocked Battle menu hit testing.
- Bloom transforms differ at0/19s manually sampled animation times; Reduce
  motion yields animation:none. Hidden browser playback is not visual owner
  acceptance. No owner account data was written; fixture removed.

Frontend publication and visual owner acceptance remain pending. No server
redeployment is needed.

## Current Home Story artwork correction

Owner requests the main-menu Continue Story button show the battle arena of the
Story location reached. Shared referenceHome now renders the next unlocked
stage's installed regional arena (final region after completion), with a
full-bleed cover image and dark contrast overlay. Region, progress, hints, arrow
and Story navigation remain; no save/server/combat changes. All six regional
boundaries and completion are covered by immutable renderer tests.

Validation: `npm test -- src\presentation\reference-ui.test.ts --maxWorkers=2`
passed 1 file / 27 tests. Build Last Light (`npm run build`) passed TypeScript
and Vite (202 modules; existing large-bundle advisory). Editor diagnostics and
`git --no-pager diff --check` passed. A disposable in-memory browser Home fixture
verified the Glasswater arena loads, covers its card and retains white readable
text, with no horizontal overflow at 1280px desktop and 390px mobile widths.
No owner account writes. Frontend publication and visual owner acceptance remain
pending; no server redeployment is needed for this presentation-only change.

## Current Story-first rebalance and activity access (D-192)

### What changed

Owner approves stronger enemy growth and normal-hit targets; explicitly selects
highest-level owned Element-Bearer for activity locks, excluding captured levels
and allowing bearers outside the squad. Shared hostile stats now grow throughout
the level range, with exact Lv120 ordinary/boss HP200k/500k, Attack40k/50k and
Defense6k/8k. Training preserves species opening stats. Story uses90% shared HP
and75% Attack. No hidden level-gap modifier or changed player stat/skill costs.
Captured playable stats remain on the original ordinary curve.

Story/Training are immediate; Machines requiresLv10 + Emberwake clear; material
dungeons30; Heaven/Abyss50; Treasury/Sanctuary60; Roses75; War85. Visible locked
controls and client/server assertions share the helper. Starter selection and
early online return open Story world map; an active online session resumes first.
Home/Story/Help/Play guidance is short, with exact rates retained in Information.

Owner separately approves preventing the infusion evolution deadlock. New floor
anchors are1/50,13/65,19/75,25/85,35/120. Form3/4/5 and75 evolution/level materials
align with60/75/90 caps. Premium remains zero below80;80-120 odds unchanged.
Old capture levels/skills/UUIDs and metadata-free inferred levels remain valid.
New infusion state has a caps schedule marker. Existing runs without one retain
legacy levels and loot through Continue/Retry; new entry locks never interrupt
active frozen runs. No load-time write, migration or resource grant.

### What was verified

- `npm test -- --maxWorkers=2`:105 files /1495 tests pass.
- Tests measure actual Normal Attack hits for all three starters at eight
  progression milestones. Infernis meets2-4/3-5/5-8 bands; lower-Attack tank/healer
  roles retain their separate strengths. Even critical normals cannot one-shot
  +5/+8/+10 ordinary enemies. Three seeds cover opening Story/no gear, accessible
  Common Store gear for opening dungeons/Rare/form3 access, and built Rose squads.
- Boundary gate tests cover client/server agreement, first-region requirement,
  outside-squad ownership, captured exclusion, rejection immutability and old
  durable-run read/Continue/Retry compatibility.
- Build Last Light (`npm run build`):TypeScript/Vite pass,202 modules; existing
  large-bundle advisory remains. Editor diagnostics clean.
- `node tools\bundle_server_game.mjs`,
  `npx tsc --project supabase\functions\game-operation\tsconfig.json --pretty false`,
  `npx --yes deno check supabase\functions\game-operation\index.ts`:pass.
- `node tools\test_server_game_sql.mjs`:deployed SQL isolation/atomicity assertions
  pass in rollback. No schema change.
- `npx supabase functions deploy game-operation --project-ref ohtfgwomdfteaxubndww
  --no-verify-jwt`:successful. Docker warning is nonfatal; API upload succeeds.
- `node tools\smoke_server_game.mjs`:hosted authenticated first-stage locks,
  unchanged revision/balance on rejection,75HP/4DEF opening Story enemy surviving
  the first Normal Attack, actual kills/rewards/Continue/Quit, idempotency/CAS and
  Friends privacy pass. Isolated identities/cascading records removed in finally.
- Browser real-renderer map/stage fixtures at1280x720 have no outer page scroll;
 390x844 has no horizontal overflow, with vertical stacked content scrolling.
  Six beacons/25 stages/Team/hints and six disabled infusion entries verified.
  Browser localStorage unchanged. Fixtures removed by reload; animation studio
  restored with no error. No owner account was modified.

### Remaining scope / owner review

No rebalance/access code remains pending. Hosted authoritative rules are updated;
the web client is built locally but has not been published to the hosted frontend
because these cumulative worktree changes have not been committed/pushed.
Owner playtesting/visual acceptance remain; tests establish bounded behavior,
not that every possible squad/gear/seed combination has ideal difficulty.
D-191 preview remains available; this rebalance preserves its renderer.
Player growth, ordinary costs/rewards, historical art and unrelated worktree
changes remain intact. See [combat contract](combat.md#enemy-progression-rebalance-d-192),
[access](story-and-training.md#story-first-progression-and-activity-access-d-192)
and [infusion](gameplay-and-elements.md#two-infusion-modes).

## Current animation overhaul (D-191)

Owner requests every battle preserve animations and each character's attacks/
casts grow more spectacular with evolution. Existing shared local/online renderer
already carries entrances/banners/readiness glow; most roster impact profiles
were generic. Added 16 typed, distinct weapon/caster signatures, seven pose types,
source cast geometry and tiered impact crowns/arcs alongside existing rings/
rays/sparks. Shared cut-in architecture preserves actual identity/action copy,
3500ms duration and stationary reading hold. Unit colors and facing preserved.
Separate clamped level/evolution factors keep late levels from saturating visual
progression before Omnic. No combat/cost/cooldown/RNG/reward/save/server changes.

Development-only `animation-preview.html` and `src/battle-animation-preview.ts`
provide all characters/forms/actions/speeds plus activity selection through real
BattleView with pure, in-memory authority fixtures. No persistence; preview is
not a production build entry. Dispose old views on resets; disposed presentation
cannot overwrite replacement host busy state. Owner visual approval remains.

Validation: `npm test -- src\presentation\battle-effects.test.ts
src\presentation\battle-animations.test.ts src\presentation\battle-cutin.test.ts
src\presentation\battle-entrance.test.ts src\presentation\battle-authority.test.ts
src\presentation\battle-chrome.test.ts src\presentation\battle-health.test.ts
src\presentation\settings.test.ts src\game\captures.test.ts --maxWorkers=2`:
9 files / 81 tests pass. Matrix covers all 17 concrete activity variants both
locally and through authoritative presentation, with simultaneous AoE impacts.
Build Last Light (`npm run build`): TypeScript/Vite pass, 201 modules; existing
large-bundle advisory. `git --no-pager diff --check`: pass; diagnostics clean.

Browser real-renderer fixtures cover 384 combinations (16 characters x six
evolutions x four actions): zero missing cast/impact ensembles or errors, 16
distinct signatures, no leftover effects and unchanged local storage. Additional
10 activity-category cases, playback rates 1/2/3 and explicit reduction checked.
Hidden browser clocks require explicit finite-animation completion and microtask
draining; checks verify scheduled frames/layers, not natural wall-clock playback.
Omnic Infernis banner preview shown; live studio remains available for review.
Phone preview at actual 390 x 844 has no horizontal page overflow and every
studio action/selector is at least 44px. Browser instrumentation was removed by
reload; preview remains at default full animation/1x for owner inspection.

## Current correction: remove redundant menu Back (D-190)

Owner confirms removing Back from all main-menu screens with persistent
navigation, keeping battle Leave and dialog Close/Cancel. Removed shared header
Back markup/history parameters and updated its caller/tests. Persistent
destinations/Menu, battle Leave handler and transient history/context restoration
remain unchanged. No account writes, battle rule change or server deployment.

Validation: `npm test -- src\presentation\sanctuary.test.ts
src\presentation\archives.test.ts src\presentation\conduit-store.test.ts
src\presentation\menu-history.test.ts src\presentation\game-dialog.test.ts
--maxWorkers=2`: 5 files / 31 tests pass. Build Last Light (`npm run build`):
TypeScript/Vite pass, 201 modules; existing bundle advisory.
`git --no-pager diff --check`: pass. Browser renderer checks all 16 menu routes:
zero Back buttons, four primary destinations and both Help/Menu close controls.

## Current correction: element/status naming consistency (D-189)

Owner reports inconsistent buffs/type names and Fire versus Infernic filters.
All Team/Archive filters already use canonical names from D-186; added an exact
six-name regression plus a presentation-source guard against `.affinity`.
Material Exchange now also uses canonical element names. Found/fixed stale
"Blooms" in Flora/Bliss spending descriptions and "one Infernic Embers stack"
grammar. Native resources/passive triggers/spending text derive from shared
family labels. Keep actual Burn/Weaken/Shield, Rose signatures and independent
Conduit names distinct; no new effects or changed mechanics.

Extracted pure describeFighter from the existing resolved-description builder.
Battle references regenerate current copy from frozen kit strengths, covering
old online snapshots without state/save/server mutations or reading menu gear.
Shared status badges include canonical family tooltips; Archive kits and Battle
ability references now use the same typed effects/icons as Team/action controls.

Browser renderer checks verify all six canonical Team/Archive filter names and
all six Material Exchange descriptions, native/Rose resource names, delivered
icons and grammatical stack copy; localStorage unchanged. No account transaction.
Targeted verification includes copy, status, Archives/Battle/readouts/stores,
starter/flagship kits, combat content and server game tests. No server deployment
needed for current display correction; owner visual acceptance remains.

Validation: `npm test -- src\presentation\ui-copy.test.ts
src\presentation\ability-status.test.ts src\presentation\archives.test.ts
src\presentation\battle-chrome.test.ts src\presentation\unit-readout.test.ts
src\presentation\online-store-profile.test.ts src\game\starter-kits.test.ts
src\game\flagship-intrinsic-kits.test.ts src\content\combat.test.ts
src\online\server-game.test.ts --maxWorkers=2`: 10 files / 88 tests pass.
Build Last Light (`npm run build`): TypeScript/Vite pass, 201 modules; existing
bundle advisory. `git --no-pager diff --check`: pass; editor diagnostics clean.

## Current correction: Play/Story screen organization (D-188)

Owner supplies current/desired screenshots. Replaced ungrouped activity cards,
bulky region cards and stacked scenic stage detail with grouped activity rail,
compact region sidebar/Prologue and one main regional panel: real heading,
progress and map tabs; five-by-five stages beside boss/first-clear rewards;
selected-stage summary, exact per-kill loot and Enter/Replay in bottom footer.
Removed conflicting legacy ID-specific flex rules and redundant Open world map
route button. Preserved inline map nodes/roads, all eight activities, canonical
element names, stage gates, transactions, loot and account data.

Browser fixtures use an in-memory account with 26 completed stages. At
1440 x 900 and 1280 x 720 all 25 stages, boss and entry fit with no main/rail
vertical scrolling or horizontal page overflow. Phone 390 x 844 uses compact
horizontal activities, two-column regions and stacked main content; no
horizontal page overflow/overlap, every stage >=44px and entry >=48px.
Verified selection updates, replay label, locked-region disabled entry, inline
map/region return and forwarding stage 27 entry to the existing hook. Fixtures
do not start a real battle or write the owner account.

Validation: `npm test -- src\game\story.test.ts
src\presentation\reference-ui.test.ts src\presentation\menu-history.test.ts
src\presentation\ui-copy.test.ts src\presentation\menu-information.test.ts
--maxWorkers=2`: 5 files / 46 tests pass. Build Last Light (`npm run build`):
TypeScript/Vite pass, 201 modules; existing bundle advisory. No server deployment
required. Owner visual acceptance remains; this correction does not claim
whole-game pixel-perfect approval.

## Current correction: explicit-only reduced motion (D-187)

Owner reports missing battle animations and inaccessible Votive Roselius skills.
Shared owner browser reported device reduced motion with no saved reduction;
both the motion helper and a global CSS media rule suppressed presentation.
Full animations now plays by default, ignoring device reduction. Only explicit
in-game Reduce motion suppresses JavaScript/CSS animations. Updated Settings
copy; preserved legacy system/reduced tokens without storage writes. Removed
device-based CSS animation gates across battle/menu/reward/upgrade surfaces.

Saved Votive copies still have Golden Thorn Benediction/Overdrive with 25/40
Gauge costs and 3/5-turn cooldowns; ordinary copies do not have Last Flare.
No kit, cost, combat, reward or server rule change. Regression tests and isolated
browser battles execute both skills and preserve their actual ability names.

Validation: `npm test -- src\presentation\settings.test.ts
src\presentation\settings-panel.test.ts src\game\captures.test.ts
src\presentation\battle-chrome.test.ts src\presentation\battle-authority.test.ts
src\presentation\battle-entrance.test.ts src\presentation\battle-effects.test.ts
src\presentation\battle-cutin.test.ts src\presentation\battle-gesture.test.ts
src\presentation\gesture-guide.test.ts src\presentation\reward-screen.test.ts
src\presentation\upgrade-result.test.ts --maxWorkers=2`: 12 files / 82 tests pass.
Build Last Light (`npm run build`): TypeScript/Vite pass, 201 modules; existing
large-bundle advisory. `git --no-pager diff --check`: pass.
Browser fixtures with device reduction active verify slide-in timelines, both
3500ms captured-skill banners, attack movement, impacts/trails/numbers, normal
idle animation and Last Flare shimmer/glow. Explicit reduction removes entrance
animation, idle motion and shimmer while retaining the static glow. Hidden-page
finite timelines were advanced explicitly, not claimed as natural playback.
No owner account writes; disposable fixture DOM and animation hooks removed.
No server deployment needed; broader UI acceptance/authentication checks remain.

## Current addition: canonical-only element labels (D-186)

Removed affinity parentheticals from shared element labels and all sixteen
character display definitions, including portrait accessibility text. Team
filters/cards, Archive element options and Play headings now use canonical names
without redundant affinity annotations. Internal affinity metadata, stable IDs,
combat, art and saves are unchanged; no server deployment required.

Validation: `npm test -- src\presentation\ui-copy.test.ts
src\presentation\archives.test.ts src\presentation\reference-ui.test.ts
src\presentation\battle-chrome.test.ts src\content\activities.test.ts
--maxWorkers=2`: 5 files / 45 tests pass. Build Last Light (`npm run build`):
TypeScript/Vite pass, 201 modules; existing bundle advisory. Cross-surface
regression covers all character names/portraits, shared labels, Home, Team,
Archives, Play, Squad and banners. No new owner decisions or remaining work
for this display change; broader pending items below remain unchanged.

## Current addition: animated upgrade stat results (D-185)

Owner requests game-style animations showing the boosted stats whenever a
character levels/upgrades. Single Element-Bearer levels, evolution, Max Level
and captured single/Max leveling now open a shared game-native result after the
transaction saves and the menu updates. The elemental reveal shows the saved
portrait, exact level/form change and seven staggered before/after stat cards
with signed boosts; unchanged values remain neutral and tiny boosts never
display "+0". Effective stats include actual equipment/upgrades. Existing
inline celebration and portrait-preserving updates remain.

Uses the reward foundation with "Upgrade saved", Skip, Continue, Escape, focus
restoration/disposal and immediate static reduced-motion results. No new
transaction, RNG, growth, cost or server change. Post-save presentation errors
explicitly report that the upgrade is saved. Mobile fixtures fit seven cards
and Continue at 390 x 844 without content scrolling.

Verification: `npm test -- --maxWorkers=2`: 101 files / 1,438 tests pass.
Build Last Light (`npm run build`): TypeScript/Vite pass, 201 modules; existing
bundle advisory. Targeted result/inline celebration/reward dismissal/Max Level:
4 files / 45 tests pass. Disposable browser fixtures verify evolved and captured
portraits, exact level changes, seven stats, green/tiny gains, neutral unchanged
stats, normal reveal/card animation, reduced motion and Skip/Continue cleanup.
Hidden-browser finite animations advanced explicitly; no owner save mutation.
Browser restored after checks. No commit/deployment or additional owner decision
needed; broader owner UI acceptance/auth/email and recent-history gaps below
remain unchanged. [Contract](units-and-progression.md#animated-upgrade-results-d-185).

## Current: Reference structures and battle/control polish (D-183/D-184)

Owner rejects the earlier claim of UI completion: the supplied screenshots are
desired targets for only some interfaces, and the full latest HTML governs
every screen/subview. Do not preserve superseded Georgia/tab-heavy character/
Home-promotion/desktop page-scroll composition.

Application now uses replacement Home and Team renderers, persistent Team
sidebar/detail/owned-grid/captured-grid/formation views, real leader/filter/sort
bindings and transient history. Growth preserves portrait DOM while refreshing
header progression/rarity/pips/sidebar art. Summon is left-pity/hero/right-draw/
bottom-tier-rates; Inventory shows both holdings panels. Play/Story, compact
Collections, selected Conduit Store/Upgrade, Material/Cosmetic Market and
Profile/Friends use the new structures and existing real operation hooks.
Story now has six selectable map beacons/five completion-aware roads and compact
five-column stage cards. Captured detail omits the inherited nested roster.
Profile has an owned-icon grid, live bio count and automatic field-change saves:
retry confirms an identical failed payload before sending newer queued edits.
Self-hosted Sora replaces the installed-font approximation. Help/Menu/Settings
are right-side sheets. No save/economy/odds/content changes or test grants.

Owner's permanent D-184 standard requires polished text/buttons/dialogs, minimal
scrolling/interaction and no functionality or effect removal. Battle now has
one header with a persistent toolbar and one-click speeds, adjacent nameplates,
compact footer, centered results and a bounded three-column reference menu.
All five actions/Pass remain there; the approved bottom strip is removed.
At 1440 x 900 the action panel fits without scrolling. Actual cut-ins, impact
rings/sparks/trails and normal/reduced-motion readiness glows remain.
Title/Information/Showcase controls, banner stars, visible Archive ownership/
rarity/effects, Prologue access and 44px profile icons are corrected.

Remaining: owner visual acceptance/authenticated whole-interface click-through;
persisted recent activity (explicitly unavailable,
never fabricated), owner authentication/email-delivery checks. Do not treat
structural geometry/regression tests as pixel-perfect owner acceptance.
[Current scope/status](mono-ui-and-cloud-saves.md#reference-structure-replacement-d-183).

Validation: `npm test -- --maxWorkers=2`: 100 files / 1,431 tests pass.
Build Last Light (`npm run build`): TypeScript/Vite pass, 199 modules, existing
bundle-size advisory. Targeted reference/roster/Story: 3 files / 47 tests pass.
Editor diagnostics: no errors in changed runtime TypeScript.
Browser 1440 x 900 and 390 x 844: nineteen menu/subview fixtures have no
horizontal page/content/panel overflow with maximum-safe-integer balances;
desktop needs no outer content scroll. All 221 information dialogs fit mobile
after entrance completion. Confirmation cancel, Settings bounds and reward
Skip/Continue/disposal pass without transactions. Battle squads fit 1280 x 720
and mobile; final results fit and omit Continue. Toolbar identity survives
rerenders. Normal-motion fixture observes Dawnfire, element portrait glow,
impact/trail/32 sparks and cleanup; hidden integrated browser freezes animation
clocks, so finite timelines were advanced explicitly, not timed wall-clock.
Reduced-motion fixture retains steady white readiness glow.
Earlier browser 1440 x 900: all eight Play categories fit; six map nodes/five roads,
locked-region entry disabled. Browser 390 x 844, maximum-safe-integer balances:
Home, Team detail/capture/formation and Play/map have no horizontal page/content/
header overflow. Profile fixture verifies failed-payload-first retry, newer
queued fields, live count and explicit success/error state. Fixture checks do
not mutate local storage or select an owner starter; browser restored afterward.
These are not owner pixel-perfect acceptance or a full authenticated click-through.
No new owner decisions are needed for this approved presentation pass; no commit
or server deployment is performed.

## Online rollout complete; initial UI claim superseded (D-181/D-182)

Owner requests completion using the expanded Last Light.html reference; the
provided Markdown contains branding only. Server gameplay/social migrations and
the game-operation endpoint are deployed. Initial UI integration/regression
results below are historical, not proof of the subsequently requested replacement.

Client operations now cover fresh online starter selection, real account reads,
all existing progression/equipment/squad/locks/sales/summons/Conduit purchases,
the clarified Material Exchange/Cosmetic Store and editable profile. Online
battle entry/actions/end-turn/Continue/Retry/Quit use authority transport; legacy
wallet/profile keys are not read or written by online gameplay. Local motion/
speed/hotkeys remain preferences. Ambiguous requests retain their original ID
and have an explicit pending-operation retry; stale revisions reload current
state. Owner additionally approves real Friends/requests; the profile UI and
typed server operations now include accept/decline/cancel/remove.

Validation: `npm test -- --maxWorkers=2`:99 files/1,417 tests pass.
Build Last Light (`npm run build`):192 modules, pass; existing500kB advisory.
`node tools\test_server_game_sql.mjs`: deployed game/social ACL, ownership,
idempotency and stale revision tests pass inside rollback.
`npx --yes deno check supabase\functions\game-operation\index.ts`:pass.
Hosted authenticated smoke passed actual combat rewards, retry/CAS competition
and friend workflows; isolated test identities/records removed.
Browser: actual legacy Home/Story/Stores,150 stage hooks, six correctly disabled
online-only material purchases and unchanged legacy storage during navigation.
Material/cosmetic/profile renders fit390px; desktop renders fit1440px.
Hidden integrated browser activity decode promises timed out despite loaded
images, so complete click-through/animation visual acceptance remains an owner
check rather than claimed pixel-perfect proof. Default email confirmation/
recovery delivery and successful owner account login still need owner testing.
No production SMTP or paid services added.25 missing Omnic kit artworks remain
neutral pending, not substituted.
Use [the rollout contract](mono-ui-and-cloud-saves.md), not the historical
identity-only status immediately below, when continuing this phase.

## Current: Online identity foundation (D-179/D-180)

Inspected owner reference at C:\Users\creat\Downloads\last-light-mono.html.
New stores and cloud accounts explicitly approved after initial clarification.
[Approved rules/open questions](mono-ui-and-cloud-saves.md) are authoritative.
Supabase project ohtfgwomdfteaxubndww supplied; publishable configuration stored
in Git-ignored .env.local with placeholder-only .env.example. Free plan,
US East, username/password with email verification/recovery selected.
Owner chooses mandatory online accounts/server-authoritative progression and
purchases. Online accounts start fresh; local saves remain separate legacy mode,
never imported as trusted progress. Project linked; identity SQL migration and
account-auth Edge Function deployed. Auth settings updated only for approved
URLs/12-character passwords. Username rules3-16 letters/numbers/underscores,
case-insensitive uniqueness, initially immutable; profile RLS restricts reads
to self and denies all client writes. Server-only rate-limit RPC; no email directory.

Title's Online account dialog supports register/sign-in/recovery/sign-out;
Play legacy mode remains explicit and separate. Tokens use last-light.online-auth.
Actual signup verification/recovery email and successful account login await
owner testing; default Supabase mail service, no production SMTP configured.
New overall UI/stores/profile customization/server combat/economy remain pending.
Do not enable browser-wallet writes as an approximation of server authority.

Validation:95 files/1,392 tests pass (`npm test -- --maxWorkers=2`); production
build passes (existing size advisory). Deno auth check passes. Hosted SQL tests
pass within rollback: normalized/unique/valid usernames, exact rate threshold,
ACL and RLS isolation. Anonymous profile/RPC reads denied in browser; login
rejection rendered explicitly,390px modal/focus/Close pass, legacy storage unchanged.
Fixed the stale undelivered-Infernic battle-chrome expectation from D-178.
Do not replace real content with sample mock data or expose server keys.

## Current: All60 installed Conduit cutouts reviewed (D-177)

Owner reports residual background color within icons and requests thorough
revisit. Reviewed all60 installed Conduit sprites against actual
authoritative original/light/dark views and magnified candidates. Correct only
reviewed source-specific enclosed gaps/spill; preserve gems/powers/pale metal/
shadows/original bytes and supplied alpha. Owning exporters must reproduce fixes,
prior runtime bytes preserved, all60 verdicts/source/before/after hashes recorded
Art/provenance/conduit-cleanup-review.json.25 missing kit images remain pending.

Five corrected: Chaotic Paradox Spindle, Execution Orrery, Meridian Inverter,
Nullsong Transmission and Prism Splinter Socket. Cleared reviewed enclosed
backdrop islands/narrow border remnants with per-image gap/row-gradient/strip
settings in owning intake_delivered_art exporter. Preserved violet/cyan gems,
pale metal/subject accents and cast shadows;55 other exports unchanged.
Original source hashes unchanged, five prior runtimes archived with hashes.

Shared URL revisions regenerated. `python -m unittest discover -s tools -p
test_conduit_cleanup_review.py`:1 passed, all60 reviewed source/hash/verdict/
prior-export/reproduction records verified. `python tools\conduit_art_revisions.py`
matches bytes; revision test1 passed. Intake/reproduction checks passed.
Two older root-art suites still fail because seven unrelated newly incoming
Story/world-map PNGs are unmapped; left them untouched and outside this task.
Browser: all five changed revisioned URLs return200/decode256px, fetchedSHA256
matches URLrevision; localStorage unchanged. `git diff --check` passed.
No gameplay code changed; no full game suite required for pixel/settings updates.
No mechanics, saves, account writes or new artwork generation requested.

## Current:25 kit Conduits replaced by new Omnics (D-176)

Owner requests all designs in Kit Conduits become unique Omnics with comparable
epicness/style to original elemental MachinesOmnics. Clarified replacement of
same25, not addition; preserve IDs/counts/upgrades. Owner approves unequipping
only converted wrong-element/excess-fourOmnic slots in order, read-only legacy
normalization with first successful ordinary save. Acquisition all25 move to
stage75+existing1%Omnic pool, leave Store/lower pools; banner unchanged.
Expected catalog85 tier totals10/15/15/45.

Implemented TS/engine/account migration/all gear/catalog/loot surfaces and tests.
New25 rules are distinct bounded actual elemental interactions preserving other60,
RNG/rewards/recovery. [Exact identities/stat triples/interaction table](kit-conduits.md#implemented-replacement-rules)
owns live details. Walletv5 is durable conversion marker: legacyv1-v4 reads do
not write, retain ownership/upgrades/currencies/progress/locks/squads and remove
only converted incompatible/excess slots in original order including final slots.
First ordinary successful transaction savesv5; invalidv5 equipment is rejected.
Generated Omnic healing/shields/support never retrigger authored native/gear loops.
Independent proc/reserve gates survive Settings/clones, reset new encounters.
Art generator now requires25Omnic and full reborn platinum/ivory elemental
architecture, six majestic fans/crowns/ribbons/dense interiors/visible device
core matching MachinesOmnic written standard without references/palette drift.
Regenerated from updated typed designs; existing25 art still undelivered.

**Verified:**

- `python tools\build_kit_conduit_art.py` regenerated all25Omnic prompts.
  `python -m unittest discover -s tools -p test_kit_conduit_art.py`:2 passed,
  exact reproduction/identities/palettes/renderer/dense architecture/margins.
- `npm test -- --maxWorkers=2`:94 files /1,382 tests passed. Includes all25
  exact distinct rules/caps/effective trigger/provenance/RNG/readout tests,
  strict gear/pool ratios and legacy/raw-preservation/denied/overflow migration.
  Agent's unbounded-worker full run had an integrated-economy timeout;
  established bounded-worker runs passed.
- Build Last Light (`npm run build`): TypeScript/Vite140 modules passed;
  existing >500kB chunk advisory only.
- Browser in-memory storage fixture: real catalog85 counts10/15/15/45, all25
  matchingOmnic/nullStorePrice; loadv4 zero writes retains owned counts,
  unequips wrong-element slot0 and preserves compatible slot1; one explicit
  test-storage save persistsv5. Real localStorage unchanged; no owner save edits.
- Art library links, `git diff --check` and final diagnostics checked below.

No dependencies, owner account writes/grants, commits or deployments.
Local game server remains running; new encounters use rebuilt equipment rules,
retained runs preserve their intended snapshot boundary. All25 icons still
neutral art-pending until reviewed image delivery. Infernic Story six art assets
also remain undelivered; all nine status icons are installed.

## Current: Delivered status icons installed (D-175)

Owner supplies nine root PNGs matching all six thematic family names and three
Rose signatures. Completed byte-identical archives, reviewed
per-source RGB/gap cleanup, transparent256px/224px-content exports and exact
hash-verified root removal. tools/intake_status_art.py and Art/provenance/
status-art-{settings,intake}.json own reproduction/provenance.

Runtime wiring added: content/status-art.ts stable nine-path registry and typed
family/Rose resource selection; presentation/status-icon.ts shared decorative
renderer using deployment-base assetUrl. Enemy Burn uses shared burn icon,
actual Weaken/Fracture shared suppression; precise source/text/clock intact.
Native counters get exact family or Rose art, counts unchanged. Applicable
equipment full readouts use family art while unrelated effects stay text and
compact field scope remains unchanged. CSS contains20px badge/24px counter icons.

tools/status_art_revisions.py prepared for byte-derived shared URL revisions;
generated and connected to shared assetUrl. New status-icon.test.ts verifies
nine real URLs/hashes/decorative accessibility, typed source mapping, actual
debuff snapshots and independent equipment/compact behavior.
Existing readout/status/kit focused suites:3 files /15 tests passed.
Prompt reproduction2 tests passed.

**Final verification:** `python -m unittest discover -s tools -p
test_status_art_intake.py`:15 passed; archive-only reproduction verified.
`python tools\status_art_revisions.py`: runtime byte revisions match.
`npm test -- --maxWorkers=2`:94 files /1,348 passed.
Build Last Light (`npm run build`): TypeScript/Vite140 modules passed; existing
large-chunk advisory only. All nine original hashes/runtime/decoded hashes and
reviewed keys/gaps recorded. Exact verified root copies removed.

Browser: all nine versioned assets returned200 and decoded256x256; real native
and Rose counters, equipment charges and Burn/Weaken/Fracture snapshots render
matching icons.17 fixture icons fully loaded at24px counters/20px enemy badges;
390px container had no horizontal overflow. Exact values/owners/labels and
empty-alt/aria-hidden accessibility retained; local storage unchanged.
Manual source/dark/light review preserved pale detail, green subjects and
intentional shadows; pale sparks naturally contrast less on white.
Remaining:25 kit-Conduit icons and Infernic Story five enemies/arena undelivered.
All nine status icons are now installed, superseding older pending statements.
No gameplay/save/RNG changes, dependencies, commit or deployment.

## Current: Thematic elemental display names (D-174)

Owner asks to keep all mechanics and rename generic effects to fit their
elements, specifically Ward to Oceanic Protection. Shared labels now:
Infernic Embers / Oceanic Protection / Botanic Renewal / Atmospheric Charge /
Tranquilitic Focus / Chaotic Suppression. Applicable native counters, descriptions
and status events follow these names. Precise Burn/Weaken/Fracture labels, authored
ability names, equipment charges and all three Rose signatures stay unchanged.
Family/resource/proposed image IDs, art prompt bodies, source provenance and
all mechanics/save/RNG remain unchanged. Art generator/checklist headings use
thematic labels, still nine symbols and no installed icons.

`npm test -- --maxWorkers=2`:93 files /1,344 tests passed, including new exact
family-name/unchanged resource-ID/readout/Rose checks and existing math regressions.
`npm run build`: TypeScript/Vite137 modules passed, existing chunk advisory only.
`python -m unittest discover -s tools -p test_status_art_prompts.py`:2 passed;
Art local-link test, editor diagnostics and `git diff --check` passed.
No dependencies, account writes, commits or deployments. Remaining artwork/
future Omnic scope unchanged from D-173.

## Current: Elemental consolidation complete (D-173)

Owner explicitly approves live consolidation rather than icon renaming:
Burn/Ward/Bloom/Tempest/Focus/Suppression families, fewer personal counters,
Rose-only precise signatures, no future Conduits in this phase.
[Current contract](character-kit-rework.md#current-consolidation-contract-d-173)
supersedes historical all16 bespoke-resource completion below.

Shared Ember/Ward/Bloom/Tempest native loops replace redundant resource labels.
Retire native Shelter Charge, Verdict marks/mark Precision, Bedrock, Concord,
Night Resolve, Charted Current and Foundation, while preserving base authored
abilities, essential combat rules and all owned equipment effects. Six EBs
Aurora/Bruno/Disciple/Razor/Nerithe/Orvella have no native stack mechanic.
Rose signatures stay precise independent Bloom/Ward/Burn specializations.
Tempest critical trigger is shared across Atmoso/Elise/Vaelor; Bloom earns
once/round, with Bliss other-only and Flora including self.

Status generation is reduced40 to nine prompts; exact reproduction/palette/
key/reference tests and Art local-link validation passed. No generated or
installed icons, save migrations, account grants or new RNG.

Removed Aurora's native pilot entirely rather than renaming its marks: no native
mark/Precision producers, snapshots, badge/readout entries or hooks remain.
Authored damage/Weaken and Conduit critical effects are preserved. Typed
family/kind/origin/source metadata is used by current resource descriptors,
readouts, status events and actual debuff snapshots; no speculative proc engine.

**Final verification:**

- `npm test -- --maxWorkers=2`:93 files /1,343 tests passed, including revised
  full-roster applicability, shared triggers/spend order/source/caps/RNG/snapshot
  regressions and existing Rose/equipment behavior.
- Build Last Light (`npm run build`): TypeScript/Vite137 modules passed;
  existing >500kB chunk advisory only.
- `python -m unittest discover -s tools -p test_status_art_prompts.py`:2 passed;
  nine exact symbols/reproduction/palette/keys/reference contract.
  Art local-link test and `git diff --check` passed.
- Browser after fresh reload: all16 actual field readouts match the contract,
  ten shared/Rose counters and six no-pilot/no-counter EBs. Atmoso/Elise/Vaelor
  each earn one Tempest on an effective critical Normal using the same trigger.
  Local storage unchanged. Initial probe used invalid identity `infernis` instead
  of stable `ember`; corrected by reading canonical registry and retesting.

**Remaining:** nine status images,25 kit-Conduit images and Infernic Story five
enemies/arena remain undelivered. Future Omnic family/specialization interactions
are explicitly future design, not new implemented gear. No dependency changes,
save writes/grants, commit or deployment.

## Current: Rose and War intrinsic batches complete (D-172)

**Owner request:** finish Rosetta/Thornia/Crinso, then Nerithe/Orvella/Vaelor.
All16 playable Element-Bearers now have bounded native setup/payoff loops;
Conduits are independent enhancements, not substitutes.

**Implemented changes:** six cap3 resources: Rose Grace from Rosetta effective
authored healing once/round; Thorn Aegis from her living authored shield source's
actual direct absorption once/enemy phase; Rose Duality from Crinso's living
own effective Burn once/phase; Charted Current from Nerithe effective Normal;
Foundation from Orvella legal Defense; Resonance from Vaelor effective critical
Normal/ordinary skills once/activation, using existing crit outcomes.
Ordinary/Last Flare spending choices, exact coefficients and constraints live in
[kit specification](character-kit-rework.md#rose-and-elemental-war-loops-d-172).

Shared typed resource/guard/shield-source helpers retain stronger actual shield
ownership on weaker refresh, count effective HP/shield direct critical hits,
and preserve snapshots and independent Conduit resources. Captured recipients
benefit normally; captured kits do not gain EB loops. New encounters reset
personal state; Rosetta can legitimately earn Grace from opening passive healing.
Preserve authored names/stats/targeting/coefficients/Gauge/cooldowns/recovery,
Nerithe fixed5 Normal-only Gauge, low-health passives and Burn snapshots.
One compact live0/3 field counter per living owner; exact Character/Battle
references use typed resolved descriptions. No new RNG/rewards/save schema/writes.

**Artwork:** [Battle Status Icons.md](../Art/ui/Battle%20Status%20Icons.md)
extends34 to40 prompts with six new symbols; existing IDs/prompts retained.
Reference-free individual palettes/negative hues, unlit keys and complete margins.
All40 remain prompt-only; no missing runtime URLs. Reproduce:
`python tools\build_status_art.py`.

**Verification:**

- `npx vitest run src\game\rose-war-intrinsic-kits.test.ts`:50 passed.
  Includes exact base/grown damage/Weaken/shield potency, AoE once, source/death/
  zero/overheal guards, caps, rejection/RNG immutability, gear independence,
  clone/Continue and readout references. Additional focused regressions passed.
- `npm test -- --maxWorkers=2`:93 files /1,391 tests passed.
- Build Last Light (`npm run build`): TypeScript/Vite136 modules passed;
  existing >500kB chunk advisory only.
- `python -m unittest discover -s tools -p test_status_art_prompts.py`:2 passed;
  exact40-prompt reproduction/coverage, palettes/keys and no-reference contract.
  Art-library local-links test passed; `git diff --check` passed.
- Browser in-memory fixtures: all six actual readout3/3 counters and ordinary
  spending to0 verified; Nerithe Normal earns25 Gauge and one Current.
  Local storage unchanged; no owner save funded/edited.

**Remaining:** no roster batch outstanding. Status-icon40 images,25 kit-Conduit
icons and Infernic Story five enemies/arena remain undelivered. Future balance
changes require actual play feedback; no new owner decision blocks this phase.
No dependency changes, commit or deployment.

## Current: Delivered Story images installed (D-171)

Owner asks to move root Story artwork, properly cut out enemies and wire the map.
Completed31 supplied PNGs:25 enemy cutouts, five regional arenas (Oceanic,
Atmospheric, Botanic, Tranquilitic, Chaotic) and World Map. Infernic's five enemies
and arena were not delivered and remain neutral pending without missing URLs.

**Changes and implemented behavior:**

- Every original archived byte-identically under Art/source/story/<element> or
  world-map; Art/provenance/story-art-intake.json and story-art-settings.json
  preserve original/runtime/decoded-pixel hashes, dimensions and reviewed settings.
  Verified root copies removed; root image count0. Reproduction uses
  `python tools\intake_story_art.py --apply --reviewed --remove-incoming`.
- Reviewed source-specific offline RGB keys/enclosed gaps produce960px transparent
  enemy sprites; supplied alpha bypasses cleanup. Light/dark/source visual reviews
  completed. Tiny source detached markings retained; clipped tips not reconstructed.
  Five arenas/map preserve original opaque1456x816 pixels, never background-keyed.
- content/story-art.ts registers only the actual25 sprites/five arena IDs/map.
  storyCreature supplies shared art to both discovery catalog and all Story spawns.
  Existing field/cut-ins/Collections therefore use the same IDs/images and retain
  discovery gates. Reviewed per-enemy unit-facing metadata mirrors only left poses,
  genuine frontal poses unchanged. Chaotic boss mirrors right in field and cut-in.
- tools/story_art_revisions.py generates byte-derived shared URL revisions for31
  actual exports; portrait.assetUrl includes these across enemies/backgrounds and
  uses Vite deployment base. No art paths guessed for Infernic.
- Map renders complete image at natural aspect ratio (width100%, height auto),
  never cover-cropped; six accessible region buttons/150 stage controls remain
  separate HTML below it. Stage locks/progress/bonuses and navigation unchanged.
  Pending copy applies only to Infernic. No combat math/RNG/reward/save changes.

**Verification and outcomes:**

- `python -m unittest discover -s tools -p test_story_art_intake.py`:
  **18 tests passed**, including source/hash/alpha/scenery/facing/archive-only
  reproduction. `python tools\story_art_revisions.py`: byte revisions match.
- `python -m unittest discover -s tools -p test_story_art_prompts.py`:
  **5 passed**; generation references retained.
- Targeted Story art/Story/battle chrome/facing/Archives: **5 files /126 passed**.
  New tests verify exact31 real exports/revisions, every150-stage spawn/catalog,
  Continue to regional boss, discovery-safe galleries, six controls/locks,
  uncropped map styles and undelivered Infernic field fallback.
- `npm test -- --maxWorkers=2`: **92 files /1,341 tests passed**.
- Build Last Light (`npm run build`): TypeScript/Vite passed,136 modules;
  existing >500kB bundle advisory only. `git diff --check` passed.
- Browser:31 versioned assets return200 and decode as25 960px sprites plus six
  1456x816 opaque scenery images. Map natural aspect preserved at desktop and
  within390px container (356x199.5px image, no crop). Six region controls and
  Oceanic preview worked while stage26 remained disabled for empty account.
  All five regional boss field renders use exact art/scenery/facing; stage150
  ultimate cut-in uses same mirrored Chaotic boss. Stored data unchanged during
  field/cut-in probes; no owner account funded or edited. Browser img.decode()
  render scheduling stalls were avoided with fetch/createImageBitmap checks.

**Remaining:** Infernic Story5 enemies/arena undelivered;34 status-icon images
and25 newer kit-Conduit icons pending; Rose/War intrinsic-kit batches remain next.
No commit/deployment/dependencies, account migration or grants.


## Current: Intrinsic Standard-flagship kits and complete status prompts (D-170)

Owner resumes native dynamic ability/buff/stack redesign after the completed
Story/art/navigation phases and requests one Midjourney file containing all old
and new status icons. Full-roster rollout remains phased, not a blanket equipment
rewrite. Seven Standard flagships implemented; original starter loops preserved.

**Changes and implemented behavior:**

- Atmoso: cap3 Gale Cadence from effective Normal/Skill2 activations; Skill1
  spends +8% outgoing damage each, Last Flare +12% each. Single activation gain/
  spend across AoE. Skill2 builds, never spends.
- Aurora: existing own Verdict Marks/Skill2 Precision retained; Last Flare instead
  consumes marks separately on each living target for +12% damage each (max24%).
- Bliss: modest Skill2 healing/Restorative Charges retained. Skill1 now offers
  +8% damage per charge; Last Flare retains its existing5% caster maxHP shield
  per charge. Both consume the same resource, cap3; shield refresh/nonstack.
- Bruno: actual direct absorption by his authored shields earns Bedrock once per
  enemy phase across recipients, cap3, living source/provenance required. Skill1
  spends +5pp Weaken each (combined cap60%); Last Flare adds5% caster maxHP each
  to authored shield offer before refresh.
- Disciple: effective direct attack under his actual sourced buff earns Concord
  once per round, cap3, living source required. Skill2 spends +4pp attack buff
  each, Last Flare +6pp each, combined cap65%, existing refresh/clock/nonstack.
- Elise: first effective ordinary skill establishes rhythm without gaining a
  stack; later alternating Skill1/Skill2 activations gain one Storm Rhythm, cap3.
  Normal/Defense preserve rhythm. Skill1 spends +8% damage per existing stack
  before possibly earning one new stack; Last Flare spends +12% each.
- Razor: Defense earns Night Resolve, cap3. Skill1 spends +5pp Weaken each
  (combined cap60%); Last Flare spends +12% outgoing damage each.
- Typed per-encounter resources/source provenance/round gates clone with actions
  and Settings and reset at new encounters. No new RNG/reward/save behavior,
  equipment prerequisite, cost/cooldown/recovery bypass or captured-kit rewrite.
  One short0/3 resource counter in the field; exact choices in resolved Character
  and Battle reference. Existing equipment charges remain independent.
- [One copy-ready Midjourney file](../Art/ui/Battle%20Status%20Icons.md) now holds
  all34 current old/new symbols with delivery IDs/filenames, individual palette
  locks/unwanted colors, reference-free1:1 keys/margins/no-glow. Green subjects
  use magenta keys. Generic Shield/Defense/Recovery/Gauge/cooldown plus all real
  intrinsic/equipment effects; instant feedback is not fabricated active status.
  Text only until actual reviewed images arrive. No generated image installed.

**Verification and outcomes:**

- `npm test -- --maxWorkers=2`: **91 files /1,336 tests passed** final run.
- `npm test -- src\game\machines.test.ts src\game\flagship-intrinsic-kits.test.ts --maxWorkers=2`:
  **2 files /41 tests passed**, including independent native/equipment damage
  bonuses and their separate consumption. Type-check `npx tsc --noEmit` passes.
- Build Last Light (`npm run build`): TypeScript/Vite passes,134 modules;
  existing >500kB bundle advisory only. Edited engine/readout/Python diagnostics
  clear; `git diff --check` passes.
- `python -m unittest discover -s tools -p test_status_art_prompts.py -v`:
  **2 tests pass**, all34 icons reproduce exactly with required coverage,
  palette/key/margin/no-reference rules and symbol word budgets.
- Shared art-prompt suite:28 tests run with28 historical failed subtests, all
  exclusively unchanged Awaken the Machines; no status-icon failures.
  Art library's all-document local-link check passes.
- Editor test runner reports no discovered tests; established CLI runner used.

- Browser pure-engine/resolved-readout checks on isolated validation-server
  origin: six personal counters exactly0/3, one counter each, no tilde or missing
  icon images; Aurora remains enemy-mark-owned. Exact Atmoso Normal->Skill2->
  Skill1 counts0/1/2/0 and Elise Skill1->Skill2->Skill1 counts0/0/1/1 confirmed.
  Stored data byte-unchanged during these checks. This did not fund or alter an
  owner account. New browser-context creation is restricted by storage affinity,
  so no claim of mobile visual acceptance is made.
- Initial verification found/fixed a pilot-test nullable-state compile issue,
  incorrect Atmoso spender/reference and first-skill Elise resource gain; exact
  sequence regressions now protect these. The related Conduit damage fixture now
  includes the newly authored Gale bonus and verifies independent charge checks.

**Remaining / next:** Rose trio Rosetta/Thornia/Crinso, then Elemental War trio
Nerithe/Orvella/Vaelor intrinsic redesigns are not yet implemented. Status images
need generation, reviewed alpha-safe offline intake and shared resolver wiring.
Story imagery and25 newer kit-Conduit images also remain pending. No commit or
deployment, dependencies, retroactive grants or account migration. No owner
question blocks the next already-approved phased kit batch.


## Current: Separator correction (D-169)

Owner asked to restore slashes for materials and replace every other tilde with a
separator that fits its meaning. Owned/required, current/maximum, squad, pity,
stage and tier values use ` / `. Labels use ` · `. Stat lists use commas, pairs
use `&`/and and ranges use en dashes. The broad replacement covered 66 source
files, including matching test literals. D-127's tilde contract is superseded.

**Verification:** `npm test -- --maxWorkers=2`: 90 files / 1,327 tests passed.
`npm run build` passed with the existing >500kB chunk advisory only.
`git diff --check` passed. `ui-copy.test.ts` now rejects tildes and unspaced
slashes in rendered surfaces, then checks Owned / Required and squad/level labels.
No values, IDs, saves, economy or combat behavior changed.

## Current: Story art prompt packs complete (D-168)

Owner requests a world-map prompt, every regional enemy and regional battle
arenas in the existing elemental dungeon style, with all art outside the main
folder. Scope is37 copy-ready prompts: one map,30 distinct runtime creatures
and six empty side-view arenas. No generated images or new runtime registration.

- [World map](../Art/ui/Story%20World%20Map.md) authored; six canonical terrains
  in journey order, overhead scenery, six beacon landmarks, overlay-only HTML
  labels/locks/stage controls. Full-bleed opaque export, never background-remove.
- [Story pack index](../Art/creatures/story/README.md) and focused coverage
  tests added. All six region files are complete: Emberwake March, Glasswater
  Reach, Stormspan Heights, Rootstone Wilds, Stillhalo Vale and Riftbound Frontier.
  Cutouts use individual palettes, unlit keys, complete silhouettes; arenas use
  clear equal-height left/right standing lanes and recessed dungeon-style detail.
- Related Story specification, Art library/workflow/docs index and D-168 updated.
  All52 previously delivered root images remain archived; root image count0.

**Verification and outcomes:**

- `python -m unittest discover -s tools -p test_story_art_prompts.py -v`:
  all5 tests pass, checking exact37 prompts, runtime regions/names/IDs, single
  reference-free flags/shared renderer/word budgets, palettes/keys/containment,
  side-view arenas and ordered world-map terrains.
- `python -m unittest discover -s tools -p test_art_prompts.py`:
 28 tests run;28 failed subtests exclusively in unchanged Awaken the Machines.
  No Story prompt failures. Historical policy failures remain unmodified.
- `python -m unittest discover -s tools -p test_art_library.py -v`:
 5/6 pass, including every Art document's local links. Existing provenance-count
  assertion expects26 but sees28 after the previous two intake manifests;
  unrelated to new prompt files and left unchanged.
- `git diff --check` passes; repository root image count remains0.
  No TypeScript/build run needed for prompt/documentation-only changes.

**Next:** generate/deliver the37 images using the indexed prompts.
Real Story artwork, review/offline export/runtime intake remain pending delivery.
Remaining intrinsic roster ability redesign stays paused; no new owner decision
is required for this prompt scope. No commit/deployment or save changes.

## Current: Defense rebalance and desktop contextual pass (D-165/D-166)

Owner approves the diminishing-return Defense correction, requests intake of
new root artwork and continuing the next approved phase. Artwork intake is
separate from the verified combat/navigation changes below.

**Changes and implemented behavior:**

- All direct allied/enemy hits use Attack/(Attack+Defense) mitigation, with
  action/critical/Weaken modifiers outside that ratio and integer final damage.
  Equal Attack/Defense halves damage rather than cancelling it. Full-precision
  stat inputs, pierce, Burn bypass, shields, guard, RNG and reward timing remain.
- Shared staged Attack now starts32/48 atLv10 with .12 early growth; Story
  starts16/24 atLv1 on half that curve. OrdinaryLv13 Story/Machines Attack40/44
  yields32/36 noncritical normal damage againstLv0 Infernis (220HP/10Defense).
  Every unequippedLv0 starter takes>=9% maxHP per real noncriticalLv13 hit.
  HP/Defense/Training curves, Lv120 endpoints and Rose140 Attack17,750 remain.
  Separating .036 post120 extension avoids unintentionally buffing final Roses.
  Existing snapshots retain old enemy stats; enter/retry a new encounter.
- Desktop Back identifies the real caller; Menu keeps secondary routes without
  duplicating the four-destination dock. Return to title appears only in Settings,
  with battle confirmation/disposal. Menu Settings close preserves current DOM,
  filters/unsaved selection/scroll instead of rebuilding. Battle reconstruction
  is retained. Removed nested desktop Gameplay/Character/Summon scroll caps;
  preserved modal/list scrolling, existing animations and reduced-motion-safe
  neutral button feedback. No account/schema/economy/ownership changes.

**Verification and outcomes:**

- `npm test -- --maxWorkers=2`: final90 files /1,327 tests passed.
- Targeted balance pass:4 files /94 tests; guarded/Rose/endgame pass:4 files /
  101 tests. Updated literal damage fixtures match the intended formula; the
  max-level support simulation now uses Disciple's actual shield skill rather
  than repeatedly choosing a non-damaging ultimate over it.
- `npm test -- src\presentation\sanctuary.test.ts src\presentation\inventory.test.ts src\presentation\settings-panel.test.ts src\presentation\menu-history.test.ts src\presentation\ui-copy.test.ts src\presentation\battle-chrome.test.ts --maxWorkers=2`:
  6 files /33 tests passed.
- Build Last Light (`npm run build`): TypeScript/Vite passed,132 modules;
  existing >500kB bundle advisory only. Edited engine/navigation editor
  diagnostics are clear; `git diff --check` passed.
- Disposable browser UI check: seven secondary Menu destinations; exact
  maximum-safe-integer balances; Machines stage2 and the same select DOM node
  survived Settings/Escape; Gameplay overflow visible/max-height none; Back
  restored Home; Title absent from Menu and worked through Settings. No page
  errors or save changes; owner wallet byte-identical. Native hidden selects
  use the game's selection dialog for automation, not selectOption.
- RealLv13 Story browser Defense turn: Infernis220->162HP from two guarded
  hits29 each; Gauge0->20. Battle title cancellation retained Settings/run;
  closing Settings retained the encounter; confirmation reached Title with
  saved wallet unchanged. Native dialog close events are render-scheduled and
  stalled the first browser attempt: explicit confirmation submit/Escape and
  reward Continue/Escape now settle immediately and dispose through the same
  existing cleanup. Added six delayed-close/invalid-submit/reward tests.
  Related modal pass:3 files /17 tests. No economy logic moved into presentation.
- Mobile DOM verification with true mobile emulation:390px layout/document
  width, contained358px portrait, exact maximum-safe balances, full100,787.57HP
  endgame stats,83.7x68px dock targets; Summon page scroll also had no horizontal
  overflow. Cached browser screenshot painting did not reliably track viewport
  changes, so responsive acceptance used actual DOM bounds/media queries.
- Previous blocked Conduit purchase/equip/action browser sequence is now
  complete: bought Tempered Strike Link for1,500 (100,000->98,500), one unlock,
  equipped one of eight slots; battle reference displayed its fixed Normal
  bonus, actual Normal saved one kill receipt/reward and completed presentation,
  then enemy retaliation left210HP/Gauge30 and aria-busy=false. Finite visual
  animations were explicitly finished by the harness; owner wallet unchanged.

**Artwork intake (D-167), first verified batch:**35 supplied Conduit icons and
13 replacement character portraits are installed through shared catalogs and
byte-derived URL revisions. All48 original bytes/SHA-256 hashes and13 previous
portrait exports are preserved in Art/source/delivered-root-art and its provenance
manifest. Every export received dark-background visual review; RGB backgrounds
use per-source keys and19 reviewed enclosed-gap seeds across8 exports, not
runtime keying or global pale removal. No in-scope source was rejected.

- `python tools\intake_delivered_art.py --apply --remove-incoming`:48 installed/
  archived named originals. Dry run and character/Conduit revision checks passed.
- Focused Python delivery/revisions/character/root/roster suites:20 tests passed.
- Focused machine-art/Archives/Machines/Store/portrait run:5 files /62 tests passed.
- Post48-image integration: `npm test -- --maxWorkers=2` passed90 files /
  1,327 tests; Build Last Light (`npm run build`) passed133 modules with the
  existing bundle advisory.

**Artwork intake complete (D-167):** the remaining two universal action icons
and two currency replacements are now installed:52 delivered PNGs total,
zero root PNGs remaining. All four added original/runtime hashes match
provenance; both prior D-142 currency exports are preserved and hash-verified.
Individual keys and one reviewed sword-gap seed retain pale shield steel,
coin detail and painted shadow. Shared Normal/Defense artwork now applies
across the roster, preserving character-specific skills/passives and old action
exports. Shared action/currency URLs use byte-derived cache revisions.

- `python -m unittest discover -s tools -p test_d157_root_art_intake.py -v`:
  4 passed. Related prism currency/preparation/root/universal prompt suites:
  5/3/4/7 passed. General prompt suite still has28 historical unchanged Machines
  wording failures; no unrelated prompt rewrites.
- Focused ability/currency/Rose/Crimson Roses/War validation:5 files /106 tests.
  Full integration initially exposed seven old flagship fixtures expecting
  character-specific basic icons; updated them to assert universal runtime
  icons while retaining existence checks for preserved historical exports.
- Final `npm test -- --maxWorkers=2`:90 files /1,327 tests passed.
  Build Last Light (`npm run build`):134 modules, TypeScript/Vite passed,
  existing bundle advisory. `git diff --check` passed; root PNG count0.
- Disposable browser decoded updated currencies, Bliss base/Omnic replacements
  and both universal battle action icons at deployment-base/revision URLs.
  No page errors; owner wallet unchanged. A stale shared-tab HMR overlay from
  the temporary generated-module creation order cleared on reload to Title.

**Remaining:**25 additional kit-Conduit images were not delivered and remain pending.
Remaining intrinsic roster redesign stays paused.
No commit/deployment or owner-save changes.

## Previous milestone:150-stage Story / retained Training implemented (D-164)

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
- Guaranteed Common materials; Uncommon rolls from enemyLv1 at25% chance
  and rises linearly to80% by Lv55. No higher
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

### Phase 1: Roses characters and event  Eimplemented

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
src/game/squad.test.ts src/game/flow.test.ts`  E6 tests passed;
`npm test`  E06 tests passed across59 files; `npm run build` passed with the
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

- `python tools/intake_root_art.py`  Eall36 mappings validate in dry-run mode;
  preserved originals and prior outputs match the recorded hashes.
- `python -m unittest discover -s tools -p test_root_art_intake.py`  E tests pass.
- `python -m unittest discover -s tools`  E6 tests pass.
- `npx vitest run src/presentation/archives.test.ts src/presentation/conduit-store.test.ts src/presentation/roster.test.ts src/content/infusions.test.ts src/presentation/unit-facing.test.ts src/game/treasury.test.ts src/game/rosethorn-sanctuary.test.ts`  E7 tests pass.
- `npm test`  E04 tests pass across59 files.
- `npm run build`  ETypeScript and production build pass; Vite reports the existing >500kB chunk advisory.
- Browser smoke check fetched13 representative element, Conduit, portrait, banner and arena URLs under `/LastLightGame/assets/`; all returned HTTP200. The isolated test profile created for opening-flow access was removed; no profile remains.
- No commit, push or deployment.

No further owner decisions are needed for this approved intake. Future RGB
deliveries still need per-image review; do not apply this keying to supplied
alpha sources or the five unprovided dungeon packs. See [art workflow](art-workflow.md#owner-supplied-opaque-rgb-art-intake-36-images)
and [Phase12](roadmap.md).

## Previous: Phase11 Integrated validation and cross-system verification

Phase11 adds comprehensive testing of economy lifecycle, combat continuity, save persistence and UI consistency across all implemented features.

New [integrated-economy.test.ts](<C:/Users/creat/Downloads/Coding/Projects/Last Light/src/game/integrated-economy.test.ts>) exercises four critical scenarios:

1. **Both farms ↁEexact-copy dual sale ↁEdraw with duplicate conversion ↁEConduit equipping ↁEprotection ↁEunequipping ↁEfull resale**
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

- `npm test`  E590 tests passed across 59 test files.
- `npx vitest run src/game/integrated-economy.test.ts`  E4 tests passed after expanding the activity matrix to all15 destinations.
- `npm run build`  ETypeScript check and Vite production build passed; Vite still reports the existing >500kB bundle-chunk advisory.
- `python -m unittest discover -s tools -p test_art_prompts.py`  E9 prompt-contract checks passed.
- Browser smoke test  Etitle ↁEstarter selection ↁEHome worked; Home had no horizontal overflow at the browser harness's available viewport widths of400,488 and1600px. The harness clamps requested320,390 and1280px widths to those available dimensions, so those exact breakpoints were not re-measured in this session. Existing prior responsive checks are listed in the historical handoff below.
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

### Elemental Gauge within-run carry

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

- unitReadout now shows allies only HP/Defense/Elemental Gauge throughout combat;
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
  Defense (historical mapping; superseded by D-287 Normal Attack), pointer cancellation/lost capture, ready shimmer and reduced-motion
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
- Each ally has Elemental Gauge: starts 0, caps 100 at base, Normal +20,
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
  ties do nothing. Selected enemy remains target. Historical right-click used
  Defense (D-287 now maps it to Normal Attack; Defense is in Battle menu):
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
  still grants +10 Null-Prismatica. Seven stats include Elemental Gauge capacity, HP, DEF, Attack
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
- Earlier Free Battle browser checks (before Elemental Gauge): all nine starter
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
# Silhouette drag correction

Native image dragging disabled in shared portrait/Conduit rendering and direct
gallery/evolution images, preventing colored drag ghosts from locked silhouettes.
Related renderer tests:65 passed across4 files with
`npm test -- src\presentation\archives.test.ts src\presentation\portrait.test.ts src\presentation\hub.test.ts src\presentation\conduit-store.test.ts --maxWorkers=2`.
`npx tsc --noEmit` passed. Browser fixture:211 gallery portrait/Conduit images
all have native draggable=false, without account writes.
# Emberwake delivery complete (D-178)

Installed Cinderling, Ashback Boar, Coalcrest Moth, Furnace Jackal and Kilnheart
Warden cutouts plus the intact Emberwake March arena. All30 Story creatures/
six arenas now delivered. Five RGB sources individually keyed with reviewed
enclosed gap seeds and moth ribbon spill regions; preserve pale flames/claws,
armor, genuine ground shadows and source bytes. Original six files archived in
Art/source/story/infernic; only these six root copies removed after verified
archive/export hashes. Shared registry/facing/revisions cover battles/Collections.

Owner explicitly excludes replacement World Map. This intake preserved all31
prior manifest records and exports and did not process/delete the incoming map.
The root map was subsequently observed absent outside this scoped intake;
do not infer it was installed by this work or restore another contributor's file.

Validation:
- `python tools\intake_story_art.py --element infernic --apply --reviewed --remove-incoming`: six installed,37 recorded.
- `python -m unittest discover -s tools -p test_story_art_intake.py`:20 passed; all37 reproduce, region isolation/replacement-map preservation tested.
- `npm test -- src\content\story-art.test.ts src\game\story.test.ts src\presentation\archives.test.ts --maxWorkers=2`:31 passed across3 files.
- `npx tsc --noEmit`, `python tools\story_art_revisions.py`, `git diff --check`: passed.
- Browser: six URLs HTTP200; five960px sprites and1456x816 arena decode.
  Stages1/25 select real Emberwake art; boar mirrors right; localStorage unchanged.

No combat, rewards, RNG, unlocks or save changes. Existing user-requested localhost
server remains running. Broad text-icon coverage/grammar request is not completed
by this art-only intake;25 reborn kit Conduit images remain undelivered.
