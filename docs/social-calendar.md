# Online attendance, gifts and mailbox

## Implemented contract

`supabase/migrations/20261105000000_social_calendar.sql` adds the actual
authenticated `social_calendar` RPC and server-private attendance, daily-send,
mail, publication, explicit read-state and idempotency tables. The client never
supplies a clock, attachment amount, wallet or another account's identity.

- Attendance is a manual next-ordinal claim once per New York **8:00 PM reset
  day**. Its month is that reset day's month, not the browser's calendar date.
  Missing days retain monthly cumulative attendance but break the consecutive
  streak. Streaks carry across months. Real month lengths bound the ladder;
  no catch-up is available.
- The owner-approved31-attendance ladder totals **263,500 Prismatica and
  230 Null-Prismatica**. An unbroken31-day streak additionally gives
  **70 Null-Prismatica** at days7/14/21/28. Every seventh consecutive day grants
  10, every14th grants20 instead, every28th grants30 instead; only actual
  successful attendance advances the streak.
- One free **send per account per reset day**, to one currently accepted,
  unblocked friend:1,000 Prismatica,10 Null-Prismatica or10 chosen base Seeds.
  The sender spends no inventory. Receiving has no daily limit. Six ordinary
  Seed types are always eligible. Rose Seeds are eligible only in the
  authoritative Rose window. Moon/Sunshade have no installed gift windows and
  are therefore ineligible before an explicitly approved launch.
- Authorized gift attachments remain valid after event closure, friendship
  removal or sender deletion. Mail never expires. Explicit reading persists
  independently from claiming. Individual and claim-all save the actual
  attachments once; already-claimed mail is harmless. Claim-all overflow rolls
  back **all** wallet changes and mail flags, retaining eligibility.
- Attendance and mail awards lock `private.game_accounts`, change its wallet
  and increment the same authoritative revision used by `game-operation`.
  Frozen runs/profile/gear are preserved. Unique request IDs cache the command
  and response transactionally; altered reuse is rejected. Cached retries do
  not apply awards or consume another gift allowance.
- Calendar/mail and mailbox unread fields live outside the account aggregate.
  Friend-profile projection and profile-reference RPCs are unchanged; no mail,
  calendar or private unread metadata is included in friend responses.
- Merely opening attendance, gifts or mailbox is a read-only RPC. Patch notes
  are projected from persistent publications; loading them does not insert
  read-state rows or auto-claim anything.

Player info exposes **Attendance**, **Mailbox** and **Free gift** controls.
Accessible shared in-game dialogs retain Escape, Close, focus restoration and
44px controls. Mail bodies and sender names are escaped plain text. Gift
confirmation is inside the existing shared modal, never a browser confirmation.
Saved awards dispose that modal before using the shared reward receipt.
If the player already dismissed the calendar during the save, completion gives
static saved-result feedback instead of reopening a celebration.
Close and Escape release the shared dialog immediately, including rejected or
pending operations; late saved outcomes cannot close a newly opened modal.
Successful sends use finite shared rarity feedback; explicit Reduce motion
retains static success text. Failed/cancelled actions never celebrate.
An uncertain network result retains its exact request ID for a retry.

## Ordinary material shop

All36 ordinary material types are available for browsing. Per-unit prices:
Seed80, Bud470, Bloom2,750, Crest16,100, Heart94,100, Soul550,000 Prismatica.
The respective tiers require any **owned Element-Bearer** at current
level0/30/45/60/75/90. Captured Elemental-Devourers and archive previews do not
unlock them. The shared transaction helper enforces these same rules online
and offline, with existing1/5/10 quantities, unlimited purchases and atomic
balance/material-capacity validation. Legacy ordinary Seed purchase IDs remain
valid. Event prices and event-material restrictions are unchanged.

## Publication and launch operations

These changes are not live until the parent/operator applies the migration and
publishes the matching client/authority. No production migration was applied by
this implementation task.

After the normal approved project deployment checks:

```powershell
npx supabase db push --linked
node tools\bundle_server_game.mjs
npx supabase functions deploy game-operation --no-verify-jwt
npm run build
```

The deployment operator must use the project's existing hosted-client release
workflow and verify the hosted account, not infer a live release from a build.
The material shop requires the refreshed authority bundle. Social/calendar uses
the authenticated database RPC directly, not a client-only wallet.

After deployment, the opt-in hosted smoke command is:

```powershell
node tools\smoke_social_calendar.mjs --execute
```

Without `--execute` it prints usage and performs no hosted operation. It obtains
the existing project's credentials in memory, creates four disposable unfunded
identities, verifies authenticated access, accepted-friend eligibility, all
three free gift choices and the account-wide daily cap, persistent patch/gift
reading, idempotent claim-all, manual current-reset attendance, private marker
acknowledgements and frozen-run revision safety, then deletes those identities.
Only actual gifts and attendance award resources to these disposable accounts;
there are no direct grants, owner-save changes, event publication or injected
dates. Raw errors/private response bodies/secrets are never printed.
The full monthly budget, missed-day/streak boundaries and overflow are verified
by local SQL, not falsely claimed as multi-day hosted observations. A run
crossing the reset must be repeated with fresh identities.

Service-role-only administrative RPCs:

- `publish_game_patch(p_key, p_title, p_body)` publishes persistent informational
  mail to all accounts, including accounts created later. Repeating identical
  content/key is safe; changed content with the same key is rejected.
- `schedule_gift_event(p_family, p_opens_at, p_closes_at)` adds an approved gift
  eligibility window (`rosethorn`, `moonwake` or `dawnforge`, matching the actual
  material-ID family). The runtime event schedule and database window must be
  deployed together. Never publish Moon/Sunshade windows before launch approval.

## Validation

Implementation files:

- `src/content/social-calendar.ts`: display-only approved ladder.
- `src/online/social-calendar.ts`: authenticated RPC transport/validation and
  definitive-versus-uncertain error handling.
- `src/presentation/social-calendar.ts` and `.css`: real modal attendance,
  mailbox, gift confirmation and post-save receipts.
- `src/main.ts`: online-only binding, mutation serialization and authoritative
  wallet refresh without replacing a frozen run.
- `src/presentation/online-store-profile.ts`: Player info entry points and
  material-shop unlock/buy controls.
- `src/content/material-exchange.ts` and `src/game/account.ts`: ordinary tiers
  and the shared atomic purchase gate.
- `supabase/migrations/20261105000000_social_calendar.sql`,
  `supabase/tests/social_calendar.sql`, `tools/test_social_calendar_sql.mjs`:
  durable authority, actual PostgreSQL assertions and isolated local harness.
- Focused tests: `src/online/social-calendar.test.ts`,
  `src/online/social-calendar-privacy.test.ts`,
  `src/presentation/social-calendar.test.ts`,
  `src/online/material-shop-server.test.ts`,
  `src/game/material-exchange.test.ts`,
  `src/presentation/online-store-profile.test.ts`.

```powershell
npx vitest run src\online\social-calendar.test.ts src\online\social-calendar-privacy.test.ts src\presentation\social-calendar.test.ts src\game\material-exchange.test.ts src\online\material-shop-server.test.ts src\presentation\online-store-profile.test.ts
npx tsc --noEmit
npm install --prefix .social-sql-validation --no-save --package-lock=false @electric-sql/pglite
node tools\test_social_calendar_sql.mjs
Remove-Item -Recurse -Force .social-sql-validation
```

The isolated PostgreSQL/WASM harness applies all project migrations locally,
then runs the actual SQL assertions transactionally. It never contacts or
changes the hosted database. Tests cover reset/month/DST boundaries, exact
budgets, streak resets/carry, no load writes, accepted-friend eligibility,
send limits, cached retries, read/claim independence, all-or-nothing overflow,
private permissions and unchanged frozen runs.

## First-ever acquisition markers

Implemented in the owner-requested follow-up:

- `Account.acquisitionMarkers` stores lifetime `kind:id -> seen` metadata,
  covering characters, **captured creature forms** (not individual copies),
  materials, ordinary Conduits and Masters. It is optional for old saves.
  Existing positive legacy holdings are projected as seen **without load
  writes**. The first successful account transaction persists the baseline
  alongside any genuinely new acquisitions, in the same existing single save.
  Spent/sold items retain history. Later duplicates/reacquisition never reopen a
  seen marker.
- `src/game/acquisition-markers.ts` is shared by the local transaction boundary.
  `supabase/migrations/20261105010000_acquisition_markers.sql` installs the
  authoritative aggregate trigger and authenticated own-user
  `acquisition_markers` RPC. The trigger catches every successful authority
  acquisition, including mail, banners, captures, stores and chests; rejected
  or rolled-back operations produce no marker. Imports seed legacy holdings
  seen while preserving existing imported unread history.
- Hover, keyboard focus or tap on an actual item acknowledges that exact item,
  after persistence. Duplicate captured copies share one form marker. No
  optimistic clear occurs on a failed/uncertain save; interacting again safely
  retries the idempotent acknowledgement.
- `src/presentation/acquisition-markers.ts` decorates the actual Inventory
  material/Conduit/Master cards, Team grids/details/rosters/copies, material and
  Conduit stores, Conduit loadouts/upgrades, and Collections character/Conduit/
  Master/enemy-form cards. Their relevant Team/Inventory/Collections/Stores,
  category and equipment controls carry ancestor indicators. Merely opening
  a route, hovering a route button or opening an unrelated page clears nothing.
  Acknowledging an item removes only the ancestors whose unread set is empty.
- Markers are small red pointer-transparent corner dots with accessible
  descriptions and keyboard-focusable non-button items. They subtly pulse
  three finite cycles, then remain static until seen. Explicit in-game Reduce
  motion makes them static, following the game's shared motion preference.
- `src/main.ts` binds all relevant sanctuary surfaces, syncs own-user metadata
  on entry/focus and every20seconds, and merges seen states monotonically.
  Sync preserves existing corner dots rather than restarting their finite pulse;
  disposal removes decorations, observers and interaction listeners.
  Online acknowledgements use the aggregate lock but do not change gameplay
  revision, balances or frozen runs. The trigger preserves already-seen keys
  across racing stale wallet commits, so immediate gameplay controls remain
  usable without a new revision conflict. Offline acknowledgements reread and
  save the current wallet once. Friend-profile redaction excludes this private
  history; viewing another player never binds the marker surfaces.

Deploy **both** SQL migrations, regenerate `engine.bundle.js`, deploy the
matching authority and publish the client before claiming this is live.
Additional focused tests:

```powershell
npx vitest run src\game\acquisition-markers.test.ts src\online\acquisition-markers.test.ts src\presentation\acquisition-markers.test.ts src\presentation\acquisition-surfaces.test.ts
node tools\test_social_calendar_sql.mjs
```

The local PostgreSQL harness now also executes
`supabase/tests/acquisition_markers.sql`, covering real legacy-read/no-write
baselines, each acquisition category, captured-form deduplication, cached
retries, acknowledgements, stale-commit monotonicity, reacquisition and mail.
The existing artwork and other event/runtime work remain owned by the parallel
implementation tasks.
