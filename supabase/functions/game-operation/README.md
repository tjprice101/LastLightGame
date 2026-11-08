# Authoritative game operation

## Radiant authored rewards and run lifecycle (2026-11-08)

The disabled dedicated route now saves full authored kill loot, discovery,
unlocks/first Story clears and Calamity outcomes with the damage-paid account/
run/response receipt. Shared legacy roll/validation code is reused, not legacy
combat. Only base enemy Prismatica is suppressed after range validation;
actual damage and non-kill bonuses are not paid twice.

Study schema2 stores defeat/completion/RNG ledgers. Retry preserves old loot
and lowest-HP earnings; Continue carries reward seeds/frozen loadouts, permits
newly unlocked stages and real next Training wave. Final stages/Calamity end.
Dedicated `exit` disposes the aggregate but preserves the immutable banked
response and account; `quit` remains retryable. HMAC user/request entropy also
provides stable per-enemy capture UUIDs for failed-write retries. Production
wallets/legacy routes unchanged; no new SQL migration.

`RadiantRunResponse.rewards` is validated separately from combat events.
Actual HTTP mocked-RPC tests include newly unlocked Story Continue, exit retry
and fresh entry; denied capture writes reproduce the same UUID/outcome.
All284 authored anchors have loot/account parity checks—not clear-rate evidence.
[Detailed bridge and validation commands](../../../docs/Future%20Plans/radiant-combat-system-specification.md#authored-kill-rewards-and-progression-bridge-2026-11-08).

**Still disabled and undeployed.** Old undeployed schema1 study fixtures fail
explicitly, never silently erase/rewrite saved production data. Actual DB
verification, fresh-entry farming/economic tuning and production UI/manual
bearer-only migration remain gates. Do not enable based only on local tests.

## Disabled-by-default radiant study dispatch (2026-11-08)

The shared bundle now exports `createGameOperationHandler`; the thin Deno
entrypoint supplies the existing authenticated service client and optional
server study configuration. Legacy requests retain their normal routes.
Dedicated POST shape: `{ "radiantStudy": <RadiantRunRequest> }`.
No current menu/battle caller sends this shape.

- `RADIANT_STUDY_ENABLED`: only exact `true` enables the dedicated route;
  absent/other values return503 and do not load/commit the study account.
- `RADIANT_STUDY_SECRET`: server-only stable secret, at least32 UTF-8 bytes.
  Missing/short secrets fail closed. Never expose/log it or commit a value.
- `RADIANT_STUDY_CALIBRATION`: absent means `authored-control`; experimental
  `radiant-pressure-v2` requires explicit server configuration. Client choice
  alone cannot select a different enemy calibration.

**Do not enable/deploy this as the completed overhaul.** Full kill/material/
chest/recruitment/progression rewards and production run/UI migration remain
unfinished; this is an authenticated isolated study path with partial currency.

`radiant-dispatch.ts` validates the dedicated unknown-JSON body, authenticates
through the common handler, enforces rate limit/config/access, and derives
stable entry UUID/seeds via domain-separated HMAC-SHA256 of authenticated
user+request ID. Retries derive the same server identity; users/requests differ.
Client requests never contain raw loadouts/HP/budgets/outcomes/server seeds.
Missing entropy has no random success-shaped fallback.

`radiantRpcRepository` uses the existing `find_game_request`,
`load_game_account` and atomic `commit_game_operation` RPC contract. Complete
account/run/revision/receipt commit stays under one transaction. Existing
unrelated operations preserve the optional `radiantStudy` aggregate; legacy
battle entry refuses to overwrite a frozen study. No new SQL schema migration.
Dedicated typed client transport exists but is not connected to production UI.

Validation:
```
npx vitest run src\online\radiant-dispatch.test.ts src\online\radiant-transport.test.ts src\online\radiant-run.test.ts src\online\server-game.test.ts src\game\radiant-combat.test.ts src\game\radiant-conduits.test.ts src\game\radiant-gauge.test.ts src\game\radiant-pressure.test.ts --maxWorkers=2 --testTimeout=60000
npx tsc --project supabase\functions\game-operation\tsconfig.json
node tools\bundle_server_game.mjs
npm run build
```

1302 parent-selected tests pass; client/authority typechecks and build pass,
existing chunk warning. Tests exercise the real handler with mocked Auth/RPC,
including gate-off, missing entropy, calibration refusal, authentication,
idempotence/concurrent CAS, aggregate preservation and malformed input.
Actual Radiant database transaction execution remains **unverified**: no local
Supabase/Docker/Deno was available. Legacy hosted smoke is not Radiant DB proof.
No server flags enabled, authority deployed or hosted overhaul claimed.
See [current study contracts](../../../docs/Future%20Plans/radiant-combat-system-specification.md).

## Material reward quantities (2026-11-07)

Rebuild the shared engine for the matching client: ordinary future material
rewards are50% of the authored sampled amount, nearest whole/minimum1;
Calamity chest materials instead use85%, per material bundle. Material tables
retain source ranges so authority/client preserve quantity draws and probabilities
while exposing the actual reduced bounds. Story validation checks reachable
rounded post-boss amounts, not obsolete divisibility by5. Banner material
constants also drive strict response validation. No wallet migration/holdings
rewrite, currency/cost/chance/capture/recruitment change, new roll or receipt
change. Calamity encounter and all nonmaterial chest rewards remain unchanged.
New material summon/chest responses carry `materialRewardVersion:1`, allowing
strict reduced-quantity validation while unmarked historical cached receipts
remain readable at their original authored amounts. No receipt is rewritten.
See [economy contract](../../../docs/summoning-and-economy.md#future-material-reward-reduction-2026-11-07).
Bundle, type-check and deploy with the matching client in the publication pass;
local shared-source parity tests alone do not establish a hosted release.

## Four reclaimed War characters and5% recruitment (2026-11-06)

Deploy the matching rebuilt shared engine for Neralis/Varkhel/Seravelle/Velmira,
their native kits, personal Masters and four additional War trials.
All ten trials now roll5% recruitment per Stage10 final-boss clear and never
recruit on Stages1-9. Owned successful recruitment converts to100NP; unsuccessful
rolls grant no conversion. Client input cannot select a recruitment outcome.
Kill rewards/discovery/unlocks/recruitment/receipts remain one atomic authority
operation; retries preserve the saved roll. No summon-pool change, retroactive
grants or new material chain. Existing runs/progression remain frozen as authored;
validate shared local/hosted state/event/RNG parity before claiming release.
[Current contract](../../../docs/elemental-war.md) supersedes guaranteed-recruitment
historical paragraphs below.

`node tools\smoke_server_game.mjs --phase-two-war` passes all twelve personal
Master fixtures, all four native kits' skills/Normal/ultimate, exact event/state/
combat RNG parity, checkpoint, action/turn retries and Lv140 trial entries.
`--war-recruitment` passes40 hosted fixtures across all ten modes: new/owned
successful final recruitment, failed owned final rolls with no conversion,
zero Stage9 recruitment/RNG use, saved reads and idempotent retries.
Fixtures contain explicitly seen acquisition history and valid disposable
usernames; identities and cascading rows are removed in finally. These are
authority parity checks, not progression funding or clear-rate benchmarks.

## Timed special-event lifecycle (2026-11-04)

Server time closes Rose draws/new entry/Continue/Retry at
2026-12-01T01:00:00Z (November30,8 PM New York). An existing encounter may
finish and save rewards. Pity/progress remain; permanent material purchases
are unchanged. New `purchaseEventDevourer` accepts only an ID, checks the
ended event on the server, and atomically spends the approved Prismatica
price/appends an ordinary distinct Roselius copy. It rejects active events,
including explicitly scheduled reruns. Clients cannot supply time or price.
Responses include advisory `serverTime`; no rules/wallet bump or run restart.
Bundle/type-check/deploy the matching engine, then run `node
tools\smoke_server_game.mjs --event-lifecycle` while Roses is active.
Future closure and purchases use injected-clock local authority tests;
never change production time or real player data to simulate closure.
See [lifecycle contract](../../../docs/special-banner-lifecycle.md).

## Phase1 War characters and Masters (2026-11-03)

Regenerate/type-check/deploy the shared engine with the matching client.
Caldrex, Solenne and Myrthen add three playable War identities and nine fixed
Masters (22 characters/66 Masters total). Existing ten-stage War access,
guaranteed final recruitment,100 Null-Prismatica duplicate conversion and
atomic receipts remain. No automatic ownership, summon-pool change, wallet
migration, load-time writes or restart of unrelated frozen runs.

Claim affects native direct packets only. Stillness reduces direct/periodic
incoming damage before Shields, not a Health cost. Seedtrace's approved
chances consume combat RNG and retain normal Gauge eligibility/recovery.
Generated effects have no implicit Skill Power; preserve existing explicit
Master exceptions. Follow the [global tooltip standard](../../../docs/menus-and-inventory.md#in-game-description-standard-2026-11-03).

`node tools\smoke_server_game.mjs --phase-one-war` uses only disposable
identities and controlled fixtures. It checks all three native kits with
each set of personal Masters, exact local/hosted events and state, combat RNG
parity, action/turn retries, checkpoint persistence and all three Lv140 trial
entries. It removes its identities/records afterward. This is authority parity,
not a balance/clear-rate experiment; see the [separate bounded measurements](../../../docs/enemy-benchmark-calibration.md#bounded-phase1-war-checks-2026-11-03).

## Coordinated materials and later costs (D-429/D-430/D-431)

Regenerate/type-check/deploy the shared bundle with the client. Dungeon/Rose
final materials10-12/7-8/6-7/4-5/3-4/2-3 retain unlocks; Soar/Delve
evolution7-8 and leveling8-10. Matching Calamity evolution rows fixed9;
other chest contents unchanged. Selected9 is an owner-confirmed floor,
not a literal25% reduction from historical5-10.

Element-Bearer material costs double at level destinations61+ and final two
evolutions, including applicable specialties. Rose retains no specialties;
captured/early costs, Prismatica and fodder remain. No wallet/rules bump,
migration, load writes or retroactive charges. Existing holdings intentionally
buy fewer future late upgrades; current curves apply to future rewards/openings.
See [exact cost scope](../../../docs/units-and-progression.md#later-element-bearer-material-costs-d-431).

Hosted verification: `--infusion-rebalance` covers all activity currency/
material curves plus six Soar/Delve chest openings, persistence and retries;
`--evolution` and `--rose-progression` verify exact new material consumption
without changing fodder/currency, alongside existing local Max Level tests.

## Smooth Prismatica across ordinary activities (D-428)

[Current endpoints and scope](../../../docs/summoning-and-economy.md#smooth-prismatica-growth-across-activities-d-428)
supersede older Prismatica curves/5x statements below. Shared stage-linear
curves (Training by level) serve kills, Collections and atomic validation;
War uses the same helper. No Prismatica boss multiplier or multiples5 rule.
Existing non-Prismatica boosts, EX+, Story clear awards/one-time bonuses and
wallet/rules versions are unchanged. Future kills in retained runs use the
current curve; no account migration or grants.

Regenerate/type-check/deploy the bundle with the client. `node
tools\smoke_server_game.mjs --infusion-rebalance` passes54 disposable hosted
fixtures: early/mid/final stages in all activities, Story regional boundaries,
all War modes, Training levels1/60/120, old holdings/compatibility, exact
local/server parity, saved reads and idempotent retries. Fixtures are removed.

## Linear Rose materials (D-427)

Rose event kills now share the low linear dungeon material endpoints, starting
each tier at1-2 on existing unlocks (five at Stage1; Soul at10). No material
boss boost. Rose Prismatica including final5x, captures, summons, sales and EX+
are unchanged. No migration/version bump or run restart. Regenerate and deploy
the shared bundle with the client. `node tools\smoke_server_game.mjs
--infusion-rebalance` passes26 disposable hosted fixtures including Rose
Stages1/9/10/19/34/35, exact final quantities/currency, local/authority parity,
saved reads and idempotent retries, alongside existing dungeon/infusion cases.

## Linear dungeon materials and currency (D-426)

Elemental Dungeon materials and Prismatica now use rounded linear stage
curves with no boss multiplier. Each material starts1-2 on its unchanged
unlock stage, ending Seed8-9/Bloom5-6/Shard4-5/Crest2-3/Heart2/Soul1-2.
Prismatica grows5-10->15-30. This supersedes D-425's dungeon taper and
currency boost; Soar/Delve, other modes and EX+ remain unchanged.
No wallet/rules version bump, migration, grants or encounter restart.
Regenerate/type-check/deploy the shared authority with the client.
`node tools\smoke_server_game.mjs --infusion-rebalance` now checks20 hosted
fixtures, including every dungeon unlock boundary, penultimate stage and
all six finals, unchanged Soar/Delve and historical compatibility.

## Dungeon materials and15-stage Soar/Delve (D-425)

Regenerate/type-check/deploy the shared engine together with the client.
Walletv10 maps older infusion unlocks once/read-only and preserves exact
25-stage captured-copy provenance via `infusionLayout:25`. Obsolete Soar/
Delve encounters are discarded with all previously persisted rewards kept;
unrelated frozen runs retain their captured-copy markers. No SQL schema
change, new income, grants or load-time writes.

Dungeon materials taper10%->70%, after the final base boost. Soar/Delve
specialties use the15-stage linear1-2->11-23 curve, with no weapon drops
or additional final material boost. Currencies/captures/EX+ stay unchanged.
`node tools\smoke_server_game.mjs --infusion-rebalance` checks15 disposable
hosted fixtures: all six dungeon finals, opening rewards, both infusion
curves/endpoints, old holdings, wallet/capture/final-clear compatibility,
persisted reads, local/authority parity and idempotent retries.
[Full contract](../../../docs/dungeons-and-captures.md#material-reward-rebalance-and15-stage-infusion-d-425).

## Machines drop rates (D-400)

Shared enemy reward rules now use Rare8%, Legendary5.5%, Omnic3% (stage26+),
and a5% Cosmic Grand Master Chest chance on the final stage35 boss only.
Banner bonuses, Calamity chest contents, independent RNG draws and unowned/
focus handling are unchanged. No rules-version bump or run restart is needed;
future kills use the updated shared rates and saved receipts never reroll.
Regenerate/type-check/deploy with the client. Hosted
`node tools\smoke_server_game.mjs --machines-layout` now uses deterministic
rolls in the increased Legendary/Omnic/Master intervals, checking actual
rewards, gates, account persistence and receipt retries on disposable users.

## Calamity tier tuning (D-398)

Rules10 remains current. All36 Calamity entry/retry paths use shared
level145/160/170 definitions, with1.03x/0.98x/1x Health/Attack/Defense.
Existing encounters stay frozen on read; no forced restart, migration or
reward changes. Regenerate/type-check/deploy the bundle with the client.
`node tools\smoke_server_game.mjs --calamity-tuning` checks exact stats and
skills for all36 hosted encounters, entry/retry, persistent reads and
idempotent entry using only a disposable fixture identity.
[Balance evidence](../../../docs/calamity-mode.md#isolated-stats-and-measured-difficulty).
Earlier185 and unadjusted145 values below are historical.

## Accepted EX+1 approach (D-385)

Current rules9 strengthens only actual levels81-144 with the shared smooth
stat-only approach. Exact1-80 and145+ stats, players/equipment/captures,
actual levels, skill timing, rates and rewards remain unchanged.
[Formula and current stats](../../../docs/combat.md#smooth-approach-to-accepted-calamity-ex1-d-385).
Rules8/older snapshots restart through the established frozen-investment/
saved-reward-safe compatibility path. Regenerate/type-check/deploy matching
client/authority. Hosted native/Calamity smoke verifies new120/140 and unchanged
145/185 stats with persistence/idempotency; release evidence is in the handoff.

## Progressive enemy resistance (D-384)

Current shared combat rules8 adds the approved harder enemy direction:
the previous hostile stats gain additional Health3x/Attack1.5x/Defense2x
per60 levels after80, continuously through185, with one final rounding step.
Opening1-80, playable/captured stats, equipment, rewards and stage gates remain
unchanged. [Exact stats and scope](../../../docs/combat.md#progressive-late-enemy-resistance-d-384).
Older rules7 and earlier encounters use the existing safe restart, preserving
frozen squad investments and all saved rewards. Regenerate/type-check/deploy
the matching bundle with the client; hosted `--native-calamity` asserts the new
exact145 Health512313/Attack14367/Defense3005. Current publication evidence
belongs in the handoff; the older release sections below are historical.

## Phase 0 release (D-370)

The owner authorizes coordinated client/authority publication on2026-10-21.
The shared Phase 0 flag is enabled and the generated engine uses rules5.
All138 Conduits use the approved ten-stat contract; the behavior matrix and
current handoff record numerical coverage and hosted publication outcomes.
Historical encounters reconstruct with frozen squad investments and saved
holdings retained, without applying stale commands. No database migration or
resource grants are required. Earlier local-only/rules2/3 notices below are
historical, not the current release status.

The rules5 authority deployment passed `node tools\smoke_server_game.mjs
--phase-zero`: frozen Causality +5 gives2.2 Power,563 direct damage and55 Burn
at100 Attack/zero enemy Defense, with idempotent retries, unchanged holdings,
checkpoint persistence and current-menu gear on a fresh entry. All disposable
test identities and cascading gameplay records were removed.

## Native identities (D-316)

All sixteen Element-Bearers use the shared distinct native kits and combat
rules version3. Ally-targeted actions require an explicit living recipient;
hostile selection remains separate. Historical current encounters restart
with frozen teams/equipment and saved rewards retained. Current-version
encounters resume unchanged. All133 Conduits use the current compatibility
rules; no account migration, grants or automatic unequips are required.

The owner authorized coordinated publication of all pending client/server
changes on2026-10-15. Regenerate/type-check the bundle and deploy
`game-operation` alongside the Pages release. Historical local-only notices
below describe earlier implementation stages, not this publication approval.

The2026-10-15 function deployment succeeded. Hosted
`node tools\smoke_server_game.mjs --native-calamity` verifies rules3,
explicit ally recipients, a Lv185 EX3 chest-only victory, atomic opening
with two Master chests, idempotency and persisted holdings. All disposable
identities/cascading records are removed; no owner accounts are changed.

## Calamity

`enter` accepts `{kind:"calamity",activity,tier}` for the twelve authored
activities and tiers 1–3 only. The shared account gate requires a recorded
normal final clear for EX1, then the preceding Calamity tier. Historical stage
unlocks alone do not grant access: an exact current final-boss UUIDv4 receipt
paired with final-stage access also qualifies read-only. Otherwise the normal
final must be replayed. Each encounter is a single boss; `continue` rejects.
Retry/replay preserves frozen team progress, captures, Conduits,
upgrades and Masters, creates a fresh receipt namespace and never advances tier.
The client shows the authored warning before every entry and retry/replay.

Victory atomically saves one sealed chest, not its contents. Inventory sends
`{kind:"openCalamityChest",id,expectedCount}`. The shared transaction validates
the stack, consumes exactly one and saves all fixed/weighted contents and the
separate Calamity seed together. `calamityOpening` returns the actual saved
receipt. Existing request fingerprints/revisions/cache keep transport retries
idempotent; no second roll or client-supplied reward is accepted.

Bosses/chests use named neutral pending artwork. Bosses have their own
`calamity:activity` catalog discovery IDs, never capture or recruitment
identities. EX3 chests each contain two Master choice chests.
The coordinated content/account/battle implementation is local.
`node tools\bundle_server_game.mjs` regenerated `engine.bundle.js`, and
`npx tsc --project supabase\functions\game-operation\tsconfig.json` passed.
Publish client/server together only with explicit approval, then run hosted
parity smoke. No deployment is implied by the generated-bundle refresh.

## Complete Conduit redesign (D-313)

The shared engine uses all133 approved effects and rules version2. Historical
sessions restart their current encounter with frozen team/progression/equipment,
a fresh receipt namespace and visible saved-rewards notice. Action/end/Continue/
retry requests against the historical state return only that replacement;
the stale command is not executed. Current sessions retain their fast path.
Historical read/checkpoint requests commit the restart through the normal
revision/fingerprint/cache/RPC path before returning it. Retrying an acknowledged
request returns the same run ID; failed/conflicting commits expose no phantom
replacement or account grant.

Regenerate with `node tools\bundle_server_game.mjs`; validate with
`npx tsc --project supabase\functions\game-operation\tsconfig.json`.
Shared online and HTTP compatibility tests cover frozen gear, reward retention,
idempotency and failed persistence. The redesign is local, not hosted:
publish the server and client together only with explicit approval.

## Machines duplicate protection (D-312)

Machines rolls exclude already-owned ordinary Conduits within each rarity.
Completed rarities grant nothing; no compensation or alternate-tier roll.
Ownership refreshes from the authoritative account on entry, every battle
operation, old-run resume and retry, independently of frozen equipment.
Each resolved kill also reserves its new drops for later kills in that action.
Reward validation rejects duplicate names before persistence. Existing owned
counts/upgrades, rarity chances, banner bonuses and Master chests are unchanged.
Regenerate `engine.bundle.js` using `node tools\bundle_server_game.mjs` and
type-check with `npx tsc --project supabase\functions\game-operation\tsconfig.json`.
Coordinated client/server publication is still required; no deployment implied.

## Victory replay and loot parity (D-301)

`retry` accepts defeat or cleared non-Training stages, creates a fresh receipt
namespace and encounter, and keeps frozen run loadouts/progress. Holdings and
first-clear eligibility are not re-awarded on replay; new enemy identities
may add seen discoveries. Continue still advances, replay never does.

Hosted version12 predates D-297 and still gated Story Uncommon drops belowLv23.
Pages pushes do not deploy this function. Generate the engine bundle, type-check
and explicitly deploy the server whenever shared reward rules change.
`node tools\smoke_server_game.mjs --loot-parity` checks36 early/final activity
cases, exact client/server drop parity, early Story Uncommon reachability,
saved rewards and idempotent victory replay using disposable identities.
The owner-approved server deployment passed this hosted smoke on2026-10-14;
all disposable accounts/cascading records were removed. No database migration,
owner account edits or retroactive grants. This deployment also activates D-300.

## Successive-turn squad skills (D-300)

The shared engine removes Skill1/Skill2 cooldowns for Element-Bearers and
captured squad members, including old readiness dates in resumed snapshots.
Gauge costs, one action per turn, Last Flare recovery/ultimate cooldowns,
enemy schedules and saved capture intervals remain unchanged.
Regenerate with `node tools\bundle_server_game.mjs` and deploy the function
alongside the client for online parity. No database migration or load-time
account writes. Deployed with D-301; future source edits still require explicit
server publication rather than just a website push.

## Repeatable final-boss quantities (D-294)

The generated engine and deployed function include the shared5x terminal
currency/material/component quantity rule. Six Story regional bosses and all
other staged activity endpoints participate on every clear/replay; Training
and earlier bosses do not. Preserve sampled quantities/RNG, rare chances and
counts, separate first-clear bonuses and100 Null-Prismatica recruitment
conversions. Machine final BMC is625 (base125 times5), superseding D-290's
terminal payout only. No database migration or retroactive grants.

Validation: `node tools\bundle_server_game.mjs`, server TypeScript and
`npx --yes deno check supabase\functions\game-operation\index.ts`, then
`npx supabase functions deploy game-operation --project-ref
ohtfgwomdfteaxubndww --no-verify-jwt`.
`node tools\smoke_server_game.mjs --final-loot` passed all21 endpoints against
the deployed function, checking exact client/server rewards, separately
decorated Story first bonuses, atomic account persistence, unchanged rare
counts and request idempotency. All disposable accounts were removed.
`node tools\smoke_server_game.mjs --components` also passed real stage1/100
kills with exact3/625 components, atomic totals and idempotent retries.

## Friend chats (D-260)

Authenticated `chatOperation(operation, requestId)` sends `{requestId, chat}`
without expectedRevision. SQL authorizes/persists chat independently: no gameplay
account, session, RNG or revision changes. Reuse the exact UUID/payload on ambiguous
failures; changed-payload reuse rejects409. Separate limits are90 chat requests
and30 sends/minute. Storage failures return503. Text is raw plain text (trimmed
1-500 characters), never HTML; reject controls except newline/tab.

Accepted unblocked friends can open DMs. Invite-only groups hold10 members plus
pending invitations; owner invites accepted friends, invitees explicitly respond.
Owner departure transfers ownership to the earliest joined member, empty groups
delete. New members can read prior group history. Blocking removes friendship/
requests/pair invitations, hides blocked senders and prevents new requests/DMs.
Unblock does not restore friendship. Pin/mute preserve read state; newest reads
mark read, earlier30-message pages do not. Muted chats exclude aggregate unread.
No realtime push, message edit/delete or report endpoint.

Migration: `20261012030000_friend_chat.sql`. Validate with
`node tools\test_server_game_sql.mjs --predeploy-chat`, then the deployed SQL
runner and `node tools\smoke_server_game.mjs`. Smoke uses disposable accounts,
checks unchanged gameplay revisions and cleans all records. Profile updates also
validate32 earned picture IDs: owned acquisition/evolution6 Omnic, legacy icons
retained without load writes.

`src/online/server-game.ts` defines the exact client request/response. Invoke
`gameOperation(operation, expectedRevision, requestId)` only after authentication.
Online data never uses browser wallet/profile keys or imports local saves.

Read returns current account, profile, starter and active BattleSession-compatible
session. Bootstrap selects ember/tide/sprout exactly once. Every successful
mutation increments revision. Keep the same UUID, revision and payload on network
retry; the server returns the original committed response. HTTP409 means reload
and intentionally issue a new operation, not silently replay a purchase.

The browser gameplay transport sets a30-second function-request timeout.
An aborted connection leaves the server outcome ambiguous; it is not a server
rejection or rollback. The client retains the same request ID/revision/payload
and unlocks presentation with an explicit error so the player can retry that
operation. No automatic second attack or browser-computed result. Battle shows
"Waiting for the server to confirm this action..." while awaiting the response.
Validate timeout/abort and identical-envelope retries with
`npx vitest run src\online\server-game-transport.test.ts --maxWorkers=2`.

Battle entry snapshots squad, progress, captures, equipment and upgrades.
D-288 uses shared linear playable growth, including captured creatures.
D-289 strengthens hostile growth and unifies full stats and level-based skill
power across all activities at equal level/rank, with no Story discount.
The regenerated engine bundle must be
deployed alongside the client to keep online/menu stats consistent. No database
migration or account rewrite is needed; this source change does not deploy it.
Existing encounter snapshots and historical captured skills remain unchanged on read. Rebuilt staged
encounters/Retry use current curves with frozen progression/equipment.
`act`/`endTurn` return actual `result` events plus the committed session. Await this
response before animation; never compute or submit a client outcome. `continue`,
`retry` and `quit` require the active runId. Continue requires cleared; retry
requires defeat and replaces runId. Quit disposes the run without undoing rewards.
Reload/read resumes the saved run. Settings is purely client presentation.

D-292 client exit repair: results Quit delegates to toolbar Leave's shared
Back flow, which owns the one server quit. Resumed runs have no transient
caller history and return to Gameplay; normal entries retain the real caller.
Pending quit retries confirm the original response before navigating without
requiring the deleted session. No server contract/deployment or save migration
is required for this client repair.

D-192 entry locks use highest-level owned Element-Bearer, not squad/captured
levels. New Heaven/Abyss runs use the cap-aligned50-120 schedule; existing
marker-free runs retain legacy floor levels/loot. Continue/Retry preserves the
frozen team and does not reapply new entry locks. Regenerate the bundle when
changing these shared rules. Hosted smoke verifies fresh-account first-stage
locks and the stronger opening Story enemy without funding test accounts.
`node tools\smoke_server_game.mjs --balance` uses a separate disposable,
zero-currency progression fixture to verify actual hosted Lv60 Training/Heaven
ordinary parity, material boss stats, shared skill coefficients and unchanged
read snapshots. It never edits owner accounts and cleans its identity afterward.
D-289's bundle has been deployed and both hosted smoke commands passed;
existing encounters remain frozen until rebuilt or quit/re-entered.

D-290 guarantees per-kill Machine components,3 at stage1 through125 at stage100,
with rounded linear interpolation and exact atomic reward validation.
The updated bundle is deployed. `node tools\smoke_server_game.mjs --components`
passed hosted stage1 kills and a disposable near-defeated final-boss fixture,
checking exact3/125 quantities, account totals and idempotent reward retries.
The identity is cleaned afterward; no owner accounts or starting currency grants.

Only the Edge Function service role can call aggregate load/commit RPCs.
Authentication is verified through Auth.getUser. SQL serializes writes with
FOR UPDATE and revision CAS; receipts/idempotency/account/profile/run commit in
one transaction. Rate limit is120 requests/minute/user, including retries.
Seeds, summons and capture identifiers originate on the server.

Validation and deployment:

For a shared balance-only change, no database migration is required. Regenerate
the bundle, run TypeScript/Deno checks and combat/online regressions, then deploy
the function and run hosted smoke. The SQL commands below are for schema changes,
not prerequisites to redeploy unchanged schemas.

```powershell
npx vitest run src\online\server-game.test.ts --maxWorkers=2
npx tsc --project supabase\functions\game-operation\tsconfig.json --pretty false
node tools\bundle_server_game.mjs
npx --yes deno check supabase\functions\game-operation\index.ts
npx supabase db push --yes
npx supabase db query --linked --file supabase\tests\authoritative_game.sql
npx supabase db query --linked --file supabase\tests\authoritative_friends.sql
npx supabase functions deploy game-operation --project-ref ohtfgwomdfteaxubndww --no-verify-jwt
node tools\smoke_server_game.mjs
```

The checked-in browser-free JS bundle is generated from the existing TS
combat/account/content code; regenerate it whenever those rules change.
JWT gateway verification is disabled because publishable-key sessions use the
project's modern signing keys; the function itself always requires and validates
a Bearer access token. Never log credentials or put server keys in the client.

Friends use exact username requests and recipient approval, never a directory.
`social` returns only connected/requested users' userId/username/displayName/icon/
frame. Self/duplicate/wrong-recipient actions are rejected. Acceptance enforces
the30-friend cap for both players;
outbound requests are limited to20/hour plus the overall game limiter.
Social changes and the initiating user's revision/idempotency response commit
together. Incoming graph changes do not alter a recipient's gameplay revision;
read always refreshes their actual social graph.

The hosted smoke creates isolated verified test identities with fresh zero-balance
accounts and deletes them in finally (cascading game/social/request rows). It checks
real combat kills and rewards, no artificial balance grants or permanent accounts.
# One-time offline save import (D-196)

`importSave` accepts a validated Last Light save envelope only at revision0
before starter selection or other online operations. Existing accounts cannot
be replaced. Import preserves online identity and uses the normal atomic CAS/
idempotency commit; it never imports a run or auth. Owner explicitly accepts
editable offline holdings. Requests allow up to4MB plus envelope overhead only
for import; ordinary operations retain their8KB cap. Regenerate engine.bundle.js
and deploy game-operation after changes.
