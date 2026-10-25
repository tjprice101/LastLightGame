# Authoritative game operation

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
