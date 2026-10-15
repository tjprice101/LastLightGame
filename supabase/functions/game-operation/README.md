# Authoritative game operation

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
