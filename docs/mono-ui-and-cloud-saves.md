# Monochrome UI and cloud-save rollout

## Player Info owns save-data management (D-202)

Owner moves **all save-file controls and information to Player info only**,
explicitly including the backup warning and new-account Import/Start fresh
choice. Title, registration, menu Settings and battle Settings no longer contain
save panels or destructive save-recovery buttons. Settings still owns device
preferences, not game-save management.

Title and starter selection link to Player info, so Load/Delete remain reachable
before a starter exists or when an offline save is unreadable. Offline Profile
now renders Player info with the same real React save-data panel. Online Profile
mounts it only in the Player info tab, never Friends. The pre-game Player info
screen uses the same component; there is no second save implementation.

Save / Export Save File / Load Save File / Delete Save Data retain their existing
validated offline transactions, confirmation and error handling. They are clearly
labelled offline even during online play. Managing that browser save does not
switch modes, replace online progress or discard an online session. Offline menu
loads end the old offline run and return to Player info; deletion remains there
on the pre-game screen. Automatic reward/progression saves are unchanged.

Account sign-in/registration/recovery now handles access only. New unstarted
online accounts land in Player info before starter selection. Import a full
file there or confirm Start fresh; closing returns to the title without starting
the account. Existing accounts cannot be replaced. Player info hosts the backup
warning before opening account setup, reports online status and provides refresh.
Selected legacy registration imports still restore for the matching username
with the same idempotency request ID through email verification. New registrations
no longer stage/import saves inside the account dialog. Failed/uncertain imports
retain the chosen file and request ID for retry; cancelling spends/writes nothing.

`src/ui/player-save-data.tsx` owns save presentation; `ll-player-save-data`
bridges retained Profile HTML and React with lifecycle cleanup and explicit
offline-change/online-ready events. No schema, online import eligibility,
server authority, save payload, economy or reward changes.

Validation: opening/mount/Profile/Settings/file/account tests, production
TypeScript/Vite build and isolated desktop/phone Player info geometry. This
supersedes D-196/D-197's earlier title/Settings/registration save placement below.

## React UI migration (D-197)

Owner rejects the visual quality of newly added raw save controls and explicitly
requests React-based menus/modals, following the other game's component-oriented
stack. Owner selects a complete migration in verified batches, starting with
shared components and title/account/save screens, rather than an unplayable
whole-UI replacement. The existing reference remains the visual target; React
alone is not a polish guarantee or owner acceptance.

React19/react-dom now own the title, opening starter selection (D-207),
Player info save-data panels and pre-game
screen, and account sign-in/registration/recovery dialog. Import lives only in
Player info under D-202.
Starter selection uses keyed portrait cards, local choice/pending state and a
native optional story disclosure; the main Journey/server helpers still perform
actual selection and persistence. Only shared rating/decorative reveal HTML is
reused inside the JSX, not whole-screen HTML or event handlers.
These are real JSX components with React-managed controls/state, not generated
HTML passed to `dangerouslySetInnerHTML`. Shared Button/Panel/Status/Dialog and
inline SVG live in `src/ui`; scoped hand-written CSS in `src/styles/ui.css`
defines surfaces, typography, spacing, borders, hover/focus/disabled/destructive
states and46px minimum controls (52px title entry actions). Leader accent
variables flow into these components without changing entity colors.

Zustand5 with Immer is reserved for transient UI state only; the initial opening
recovery store is unused after D-202 moves recovery into Player info.
Do not copy authoritative online balances into an editable client game store.
Existing typed account transactions, read-only migrations and server operation
engine remain the source of truth. TypeScript5.9/Vite7 are retained rather than
downgraded to the other project's5.7/6 versions. Vite's JSX transform uses
`react-jsx`; React Fast Refresh is not configured in this first batch.

The account dialog separates sign-in, registration and recovery views while
retaining all actions, email verification staging, export warning, import/fresh
choice, exact import request IDs, sign-out and password recovery. Uploads lock
actions until validation finishes; unmounted screens ignore late results.
Native HTML dialog focus containment/Escape remains underneath the React Dialog;
no browser alert/confirm/prompt APIs. Existing transaction confirmations still
use the retained game-dialog foundation and will convert in a later batch.

The title root explicitly unmounts before a retained screen replaces its host.
Retained Profile Player info markup inserts a `ll-player-save-data` mounting element:
connected/disconnected lifecycle mounts/disposes the real React panel, forwarding
successful load/delete events into the existing run/navigation reset. This is
a temporary integration boundary, not a migrated full Profile screen.

| Batch | State |
| --- | --- |
| Shared React primitives, title, offline save panels, account onboarding | Implemented; interaction/build and desktop/mobile checks required for every change |
| Selection, navigation/sheets, Home and Team | Pending |
| Play/Story, Summon, Inventory/Collections/Stores, Profile/Friends | Pending |
| Shared confirmation/reward/upgrade dialogs and battle menu/chrome | Pending; preserve existing animations/impact timing/transactions |

All future new UI should be a typed React component using the shared design
primitives, not another raw HTML append or unstyled button. Existing legacy
renderers remain only until their scheduled conversion. Validate actual content,
minimum44px targets, keyboard focus and desktop/mobile geometry, plus interaction
tests and the preserved gameplay suites. Do not infer visual approval from tests
alone; show the delivered result for owner review.

## Play Online / Play Offline and save files (D-196)

Owner replaces the player-facing "Legacy Mode" terminology with Play Offline.
Play Online uses server storage; Play Offline uses existing browser profile/wallet
keys without a destructive migration. All ordinary offline rewards/upgrades
still save automatically. Player info alone exposes Save, Export Save
File, Load Save File and Delete Save Data. Save explicitly persists the current
validated browser progress. JSON exports contain the complete normalized wallet
and original starter profile; they exclude auth tokens, passwords, device
preferences and transient battles. Loading validates the entire file before
replacement, confirms overwrite and ends the offline run. Failed writes restore
prior values or explicitly report restoration failure. Deletion confirms and
removes only offline profile/wallet/export metadata, never online account/auth or
device settings. Keep a downloaded backup; download initiation cannot guarantee
the user kept the file. Uploads/imports are limited to4MB.

Player info offers Import Save File or Start fresh for unstarted online accounts.
If current offline progress
differs from the last export, prompt for a backup, then require explicit consent
to continue without one when opening account setup from Player info. Offline data
remains on the browser regardless of choice. Previously staged registration
imports are restored under the matching username through email verification.
After signing in, confirm and atomically import in Player info; another device
can select the exported file there instead.
Confirming Start fresh in Player info clears an older staged import. File
validation disables account actions until the selected upload finishes.
An unstarted signed-in account exposes the same choice. Once a starter or any
online operation has been committed, the account cannot be replaced.

Owner explicitly approves full currencies/progression/characters/copies/materials/
equipment/pity/receipts/discoveries transfer despite offline files being editable.
This deliberately supersedes D-180's prohibition on unverified offline holdings.
It is not proof of legitimate earnings or an anti-cheat import. `importSave`
validates existing save schema and ownership on the server and requires revision0,
no starter/owned bearers/run. CAS/idempotent atomic commit permits exactly one
first operation under concurrent requests. Import preserves online identity and
does not import auth, friends, cosmetics, invented draw statistics or a run.
All subsequent battles/purchases/rewards remain server-authoritative.

## Approved direction (D-179)

Owner supplies `C:\Users\creat\Downloads\last-light-mono.html` as the new overall
UI reference and requests faithful layout/interaction wiring to real game data.
The standalone file contains sample data and transaction stubs, not authoritative
combat, progression, odds or economy rules. Preserve existing saves, content,
artwork, accessible controls, reduced motion and atomic transactions.

Owner explicitly approves implementing the new stores and profile, with rules
clarified first rather than treating mock products/statistics as live data.

D-181 subsequently supplies `C:\Users\creat\Downloads\Last Light.html` as the
expanded primary reference, including campaign/battle/profile composition.
The accompanying `Last Light.md` contains branding only, not additional game
rules. Real artwork, rosters, balances, stages, drops, costs and pity replace
the reference's demonstration data.

## Reference structure replacement (D-183)

Owner rejected the initial implementation as a recolored inherited interface.
The latest HTML and owner screenshots govern the entire UI, not only Home or
the five screenshot examples. Historical layout/font/scroll decisions below
are superseded where they conflict with this reference.

The replacement now connects:

| Reference surface | Current implementation |
| --- | --- |
| Home/header | Leader/Story/Market-Inventory composition; Squad panel removed under D-198; no promoted banners; real central header navigation; actual wallet and saved leader |
| Team detail | Persistent 17.5rem Squad/Collection sidebar, compact identity/progress header, simultaneous Stats/Skills/Growth/Conduits panels |
| Team collections | Owned-only element-filtered/sorted bearer cards and independent captured UUID cards with actual locks; captured detail removes nested roster and uses selected portrait/controls/equipment; formation/detail links preserve transactions |
| Summon | Left banners/pity, central installed artwork/identity, right single draw, bottom complete tier-grouped rate tables; existing rules/showcase dialogs |
| Play/Story | Activity/location/detail columns, compact five-column stage grid, actual activities/stages/loot; six clickable world-map beacons and five completion-aware roads; locked-region inspection never permits entry |
| Inventory | Both Materials and Conduits holdings panels visible together; two wallet cards; real components alongside Conduits |
| Collections | Compact filter/gallery grids and detail dialogs; reached/owned/discovery gates and drag protection retained |
| Conduit Store | Rarity rail, real catalog selection and one selected purchase detail |
| Conduit Upgrade | Owned-selection rail, selected current/next and +0 through +5 progression, actual component-only resource/action panel |
| Market | Material/frame catalog cards and selected product detail with exact approved prices, quantities, permanent ownership and online-only transactions |
| Profile/Friends | Owned-icon radio grid, live bio counter, automatic field-change saves, Player info/Friends views, real squad, username copying, friend search/request actions and minimal public-profile dialogs |
| Battle (D-184) | One header with preserved toolbar and one-click speeds; adjacent nameplates, viewport arena and compact footer; five accessible actions/Pass in a bounded three-column menu; centered results; existing ability cut-ins, impact effects and readiness glows preserved |
| Shared UI | Self-hosted Sora via Fontsource, polished controls/title entry/Showcase, right-side Help/Menu/Settings sheets, visible status presentation, existing native game confirmations and reward receipts |

`reference-layout.css` is imported last and owns the replacement structures.
The inherited stylesheet layers remain for title/combat and legacy helper
content; new `ref-*` layout hooks are explicit. No Google-font request is needed.
Native sorting/material-quantity controls opt out of legacy selection dialogs;
equipment selections retain the shared accessible picker.

Profile edits save on field change (text fields on finishing editing, icons on
selection), without replacing the editor DOM. Concurrent changes queue behind
the current save. An ambiguous/failed update retains its exact previous fields;
retry confirms that update before newer edits. Errors remain visible and expose
a Retry button; no success is reported before the server confirms it. The bio
counter updates while typing. Saving does not write a browser wallet.

The D-184 polish pass includes battle, shared sheets/controls and a nineteen-view
desktop/mobile geometry sweep. See the permanent
[polish/preservation contract](menus-and-inventory.md#permanent-polish-and-preservation-standard-d-184).
This is not a claim of complete pixel-perfect owner acceptance or an authenticated
click-through of every operation.
A persisted recent-activity timeline is not implemented (explicitly unavailable,
never fictional). Sample
playtime, past events, costumes, paid products and alternative game mathematics
are not silently implemented. The existing approved server/store rules remain.

Validation uses structural tests, all existing gameplay/economy suites and
disposable browser renderer fixtures; no funded browser save or owner starter
selection is used. Check both geometry and real behavior before marking the
entire reference overhaul complete.

Latest validation:

- `npm test -- --maxWorkers=2`: 100 files / 1,431 tests pass.
- `npm run build`: TypeScript and Vite pass, 199 modules; existing bundle-size
  advisory remains.
- Targeted battle chrome/cut-in/reference/Archives/menu-information run:
  5 files / 48 tests pass before the two additional full-suite regressions.
- D-184 browser sweep: nineteen Home/Team/Summon/Play/Inventory/Collections/
  Store/Upgrade/Market/Profile/Friends variants at 1440 x 900 and 390 x 844,
  with maximum-safe-integer balances, have no horizontal page/content/panel
  overflow; desktop content requires no outer page scroll.
- 221 information dialogs fit 390 x 844 after their entrance animations finish.
  Confirmation cancellation, Settings containment and reward Skip/Continue/
  disposal pass in disposable fixtures without account transactions.
- Battle: 1440 x 900 menu sections stretch into their tracks, all five actions
  and Pass fit, and the same toolbar survives rerenders. Squads fit 1280 x 720
  and 390 x 844; final-stage results fit both and omit Continue.
- Normal-motion fixture observes the actual Dawnfire cut-in, portrait
  drop-shadow, impact, trail and 32 sparks, then complete cleanup. The integrated
  browser is hidden and freezes animation clocks, so finite animation timelines
  were advanced explicitly; this does not establish natural wall-clock playback.
  Reduced-motion fixture retains a steady white readiness glow.
- Browser at 1440 x 900: all eight Play categories fit without outer overflow;
  all six map nodes and five roads exist; locked-region entry remains disabled.
- Browser at 390 x 844 with maximum-safe-integer header balances: Home, Team
  detail, capture detail, formation and Play/map have no horizontal page, content
  or header overflow. Fixtures leave local storage unchanged.
- Profile editor browser fixture: failed first payload retried identically,
  newer name/bio then saved, 13-character bio counter correct, error shown,
  Retry hidden only after success; local storage unchanged.
- These fixtures validate renderers and bound interactions, not authenticated
  owner click-through or comprehensive pixel equality.

### Online profile and friends (D-182)

- Username is immutable. Display name is limited to16 characters and bio to120.
- Profile icon is neutral Last Light or an owned Element-Bearer. Frames are the
  same permanently owned CSS-only cosmetics described below.
- Statistics use actual online Story progress, owned types/copies, creation date
  and summons recorded from this rollout onward. Never invent legacy history.
- Owner explicitly approves real friends and requests. Requests use an exact
  username and require recipient acceptance; accept/decline/cancel/remove are
  authenticated server operations, not local mock actions.
- Only involved players receive usernames, display names and selected icons/
  frames. Emails, balances, wallet contents and passwords are never exposed.
  There is no public directory or anonymous profile search.

### Material Exchange

- Exactly the six canonical Common elemental materials.
- 80 Prismatica per unit; purchase quantities 1, 5 or 10.
- Identical prices across elements; no bulk discount, selling or daily limit.
- No rarer materials, Rosethorn materials, specialty items or Mechanical
  Components. Preserve existing progression recipes.

### Cosmetic Store

- Free default profile frame.
- Thin Outline, Double Outline and Corner Brackets: 10 Null-Prismatica each.
- CSS-only monochrome designs, permanent ownership and free switching.
- No stat effects or outfit products without delivered artwork.

### Supabase and authentication

Owner requests a new Supabase project for saving/loading and has an account.
Use Free plan and US East. Owner created project `ohtfgwomdfteaxubndww` and
provided its publishable client key. Local Vite configuration is stored in
ignored `.env.local`; `.env.example` contains placeholders only. CLI project
linking, identity/gameplay/social migrations, username authentication and game
operation endpoints are deployed and connected to the browser.
Username/password login is approved; registration also collects email for
verification/recovery. Supabase password auth uses email internally: resolve
username privately on the server, never expose an email lookup directory or
put service-role/secret keys in the browser.

Approved username rules: 3-16 ASCII letters, numbers or underscores, unique
case-insensitively, immutable initially. Passwords require at least12 characters.
The server profile trigger enforces normalized uniqueness even for direct Auth
signup requests. Client reads are limited by RLS to the signed-in user's profile;
anonymous reads and all browser profile writes are denied.

The `account-auth` Edge Function accepts anonymous registration/login/recovery
requests intentionally (`verify_jwt=false`); it authenticates passwords through
Supabase Auth and returns tokens only after successful verified login. Private
server lookup resolves username to email without a client directory. Atomic
database rate limits apply per username and source IP (10/30 attempts per15min).
Errors are explicit and never log passwords, emails or session tokens.

Title offers Play online and explicitly labelled Play legacy mode. Account
dialog provides register/sign-in/recovery/sign-out and recovery-link password
updates, focus restoration, Escape and44px controls. Sessions use only
`last-light.online-auth`, never legacy wallet/profile keys. The signed-in
Play online action loads the server account and resumes its saved run or opens
fresh starter selection; online purchases do not touch legacy saves.

Email confirmation/recovery return URLs cover localhost and the existing GitHub
Pages base. Default Supabase email delivery is still in use; actual signup email,
verification, successful login and recovery require owner end-to-end validation.
Configure production SMTP before promising delivery to arbitrary players.

Owner chooses mandatory online accounts with server-authoritative progression
and purchases, not local-first cloud backup. Online accounts start fresh; existing
browser saves remain untouched in a separate legacy mode. No import of unverified
browser balances/progress into online accounts.

The server must own combat outcomes/reward eligibility, RNG, progression, summon
results, purchase costs and balances; accepting client-submitted wallets or victory
claims does not meet this requirement. Use authenticated operations, per-user
access controls, transactional updates and retry-safe request IDs. Never report
an online transaction as successful until the server commits it. Client display
and animations are not authoritative. Legacy and online storage must not mix.

Profile persistence/statistics proposal was superseded by the cloud-save request,
not independently approved in full. Do not invent account history, dates,
playtime, draws or activities.
No credentials should be committed. Project URL/publishable client key are
configuration; server secrets belong only in the hosted secret store.

## Client authority boundary

Online mode reads the server account, never a browser wallet. Starter selection,
all purchases/progression/equipment/squad/locks/summons/sales and battle entry/
actions/end-turn/Continue/Retry/Quit use typed authenticated operations.
Legacy mode explicitly retains the old local transactions; preferences such as
motion, speed and hotkeys remain local in either mode.

Battle presentation waits for the committed server result. The server owns
combat/reward RNG, snapshots and stage eligibility. Client animations and
transient results/entrance flags must not advance simulation or award loot.
Account revisions reject stale operations; conflicts reload current state.
Ambiguous transport/5xx failures retain the same request ID and payload, with an
explicit Retry pending operation control rather than a second charge/roll.

Zustand was optional, not a required toast library. Existing TypeScript state,
game dialogs and reward receipts serve the integration without another runtime
dependency. Sora is now self-hosted with `@fontsource/sora` (400/500/600/700);
no external font request or paid service.

## Status

Online rollout implemented following the identity foundation. The initially
claimed UI completion was rejected by the owner; D-183 replacement remains under
validation, with the explicit parity gaps above. Supabase and self-hosted Sora
are runtime dependencies; no Zustand/toast dependency added.
Client integrates online operations, store/profile/Friends screens and separate
legacy mode. Hosted gameplay/social migrations and endpoint are deployed.

Rollout validation:
- `npm test -- --maxWorkers=2`:99 files/1,417 tests pass.
- Build Last Light (`npm run build`):passes;192 modules, existing bundle advisory.
- `node tools\test_server_game_sql.mjs`:deployed gameplay/social SQL passes in
  rollback (ACL, per-user isolation, idempotency, stale CAS, recipient ownership).
- `npx --yes deno check supabase\functions\game-operation\index.ts`:passes.
- Hosted authenticated gameplay/social smoke passes actual combat rewards,
  retry/CAS and friend workflows; isolated test identities/records removed.
- Browser actual legacy Home/Story/Stores:150 stage hooks, six disabled
  online-only material controls, unchanged legacy storage during navigation.
  Material/cosmetic/profile renderers fit390px and desktop1440px.

Owner verification remains: real registration/email confirmation/password
recovery, successful login, and visual approval against the supplied reference.
The hidden integrated browser stalled some decode/animation promises despite
loaded artwork, so those full click-through flows are not claimed verified.
Default hosted mail remains configured; production SMTP is not included.

Identity-foundation deployment/validation (historical baseline):
- `npx supabase db push --yes`
- `npx supabase functions deploy account-auth --project-ref ohtfgwomdfteaxubndww`
- `npx supabase config push --project-ref ohtfgwomdfteaxubndww --yes` changes only
  declared auth URLs/password length; unrelated hosted settings remain intact.
- `npx supabase db query --linked --file supabase\tests\online_identity.sql`:
  trigger normalization/uniqueness, invalid usernames, limiter threshold,
  permissions and per-user RLS assertions pass inside a rolled-back transaction.
- `npx --yes deno check supabase\functions\account-auth\index.ts`: passes.
- `npm test -- --maxWorkers=2`:95 files/1,392 tests pass.
- Build Last Light (`npm run build`): passes; existing500kB bundle advisory.
- Browser: anonymous profile/RPC reads denied; invalid sign-in visibly rejected,
 390px modal fits, Close removes modal/restores focus synchronously; legacy
 storage unchanged. No test accounts or gameplay grants created.
