# Special-banner lifecycle and event shops

## Confirmed Phase1 scope (2026-11-04)

The owner authorizes both the shared foundations and activation of the Rose
closing schedule. This supersedes the earlier roadmap's no-activation gate
for Roses only; Moon/Sunshade remain unimplemented target windows.

- Daily reset:8 PM `America/New_York`, following DST.
- Weekly reset:Sunday8 PM in the same timezone.
- Roses Under Sunny Skies and Passion of Crimson Roses close together on
  **November30,2026 at8 PM New York**, exactly `2026-12-01T01:00:00Z`.
- Timed draws and event entry require the online authority. Offline browsing
  remains available; Standard and unrelated offline activities remain.
- An encounter underway can finish after closure and save its actual rewards.
  New entries, Continue and Retry are rejected after closure; Quit remains
  available. No in-progress rewards are deleted.
- Retain pity, ownership, items, event unlocks and progress across closure and
  explicitly scheduled reruns. No automatic rerun or reset.
- Event Elemental-Devourer purchases are disabled while the event is active,
  including any explicitly scheduled rerun. Materials remain available.

## Special Banner Archive

Reach **Special Banner Archive** from Summon or the Rose activity card.
It is a browse-only preserved event record, including the current event before
closure. Reuse actual banner roster/art, rates, pity, cost, conversion/bonus
rules and associated event/progression information; do not copy a divergent
pool or remove content after its scheduled close.

There are no draw buttons in the archive. Closed banners remain inspectable
but cannot be drawn through their ordinary Summon page either. Owned characters
still level, evolve, equip and fight in other eligible activities.
Future implemented special banners belong in this archive too; unimplemented
Moon/Sunshade placeholders are not summonable catalogs.

## Permanent event material access

The existing Material Exchange keeps all six Rosethorn products permanently,
before and after closure. Prices and1/5/10 quantities remain unchanged:
2,500 /7,500 /25,000 /75,000 /250,000 /750,000 Prismatica each.
The category is **Event Materials**, not a claim that the shop expires.

If the account owns none of Rosetta/Thornia/Crinso, always show the existing
event-only material warning when attempting to purchase. The saved
"Do not show again" preference does not bypass this no-owner warning.
Accounts with an associated Element-Bearer retain the existing optional warning
preference. Warning cancellation never purchases anything.

## Event Elemental-Devourers shop

New Stores submenu: **Event Elemental-Devourers**. All six Roselius forms are
visible; purchases require online authority and an ended event.

| Form | Prismatica per copy |
|---|---:|
| Common |10,000 |
| Uncommon |30,000 |
| Rare |100,000 |
| Epic |350,000 |
| Legendary |1,500,000 |
| Omnic |5,000,000 |

These are the owner's approved fixed prices, not summon rates. Unlimited
repeat purchases are allowed; discovery is not required.
Each transaction deducts the price and appends exactly one distinct unlocked,
unequipped copy atomically. Use ordinary authored first-form-stage acquisition
and skills, respecting the existing playable captured cap (currently60);
never grant hostile stats or a special low-level duplicate provenance.
No automatic squad change. Existing lock/squad/equipment protections and
sale/fodder rules continue to apply.

For an account with no associated event Element-Bearer, always show an
**Event warning** before purchase, without a hide option. Explain accurately:
Roselius can fight, but their material/fodder uses are specific to those
event Element-Bearers. Do not incorrectly say the creatures have no other use.
Re-read eligibility and funds on the authority, not from a displayed price.
Only after persistence show the shared rarity-aware reward receipt with
actual art, Skip/Continue, focus restoration and reduced-motion behavior.

## Shared clock and authority

`src/content/event-schedule.ts` owns reset day/week keys and explicit windows.
Day keys use the local date of the most recent8 PM boundary; week keys use
the preceding inclusive Sunday boundary. Use calendar dates, not24-hour
subtraction across DST. No login/gift rewards are implemented by this helper.

The authority uses its own clock for draws, entry/Continue/Retry and post-event
purchases. Requests cannot supply timestamps or prices. Responses include
server time for advisory client display; the client advances that snapshot
with monotonic elapsed time. The server rechecks every transaction even if a
menu was left open or the device clock changed.

`roseEventWindows` currently has only the original window. Reruns require
explicitly adding approved windows and deploying matching client/authority;
there is no automatic seasonal recurrence. No wallet/rules version bump,
load-time migration, account grants or frozen-loadout replacement.

## Validation and release

- `npx vitest run src\online\event-lifecycle.test.ts
  src\online\server-game.test.ts src\game\material-exchange.test.ts
  src\presentation\online-store-profile.test.ts
  src\presentation\summon-layout.test.ts --maxWorkers=3`
- `npm test -- --testTimeout=200000 --maxWorkers=3`
- `npm run build`
- `node tools\bundle_server_game.mjs`
- `npx tsc --noEmit -p supabase\functions\game-operation\tsconfig.json`
- `npx --yes deno check supabase\functions\game-operation\index.ts`
- Deploy matching authority, then `node tools\smoke_server_game.mjs
  --event-lifecycle` while the original event is active.

Injected-clock tests exercise exact closure, DST/day/week/month/year boundaries,
explicit rerun windows, retained-run finishing, blocked new encounters, permanent
materials, all six purchase prices/copies, repeated purchases, invalid requests,
denied saves and read-only archive/UI states. Hosted smoke checks the actual
server clock, active-event purchase denial, forged timestamp/price rejection,
idempotency and unchanged account using a disposable identity. It does not
pretend that the future closure has occurred on the production server.

See [handoff](handoff.md) for actual validation/publication evidence and
[remaining expansion](Future%20Plans/remaining-expansion-phases.md) for later phases.
