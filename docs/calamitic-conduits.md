# Calamitic Conduits (D-324 / current D-382)

## Confirmed scope

Calamitic is an equipment rarity above Omnic, not a new material tier,
character form or combat element. The owner requests five unique universal
creations by Rise alone: colossal, nearly cosmic annihilation machinery in
black/white metals, vibrant crimson accents and enveloping white/red chaos.
They are not collaborative Let/Rise prototypes.

The owner explicitly chooses chest tokens rather than direct Conduit drops,
no additional Calamitic equipment limit, five component-funded upgrades more
expensive than Omnic, and full implementation. All six delivered artwork
exports are installed under D-325.
Prices and token quantities remain developer tuning. D-382 replaces the five
effects below with owner-authored values; older effect designs are superseded.

## Acquisition and sealed shop

- Every Calamity chest grants guaranteed Calamitic Tokens: EX+1 gives1,
  EX+2 gives3 and EX+3 gives8. All36 variants keep their other contents and
  exact previous random draws. Existing unopened chests use the current table;
  previously opened chests receive no retrospective award.
- Victory still grants just its sealed chest. Tokens arrive only when that
  chest is opened and saved, never as a separate battle grant or visual claim.
- Market and ordinary Conduit Store always expose **Calamitic Conduits**.
  Until any actual saved Calamity clear at EX+1 or higher, its large locked
  panel displays exactly:

  > Rise deems you UNWORTHY of her most prized creations.

  No requirements, hints, balances, products or Information dialog appear
  behind the lock. An existing legitimate EX clear qualifies read-only.
  Ordinary final-stage access, chest possession and ordinary clear evidence
  do not qualify. Unowned Calamitic entries stay out of Collections until
  the shop is unlocked.
- Each creation costs100 Calamitic Tokens, purchased once account-wide through
  the existing confirmed Conduit purchase operation. Copies are never consumed.
  No Machines, banner, Master chest or random Calamity bundle directly drops
  one of these five devices.
- All elements and captured Elemental-Devourers may equip them. Each uses one
  of the existing eight ordinary slots, with no duplicate name per member.
  There is no separate Calamitic limit. The four matching-Omnic maximum
  remains unchanged; Calamitic items do not count toward that maximum.

## Five effects

Beneficial percentages grow10% of base per saved upgrade level0 through5.
Below, unupgraded -> +5 means1x ->1.5x the listed benefit. Fixed durations,
extra-action counts, restrictions and cost caps never upgrade. These are
wearer effects, not Cathedral's former squad aura or Orrery's former healing.

| Stable ID | Creation | Complete effect |
| --- | --- | --- |
| `calamitic-world-eater-orrery` | World-Eater's Orrery | +3 [Skill Duration]; +125% ->187.5% [Skill Power] for [Debuff] potency only, including [Burn], [Weaken] and Aurora seals. No direct damage/healing/[Shield] bonus or former generated healing. Individual status safety caps remain. |
| `calamitic-causality-funeral-engine` | Causality Funeral Engine | +100% ->150% [Skill Efficiency]; [Last Flare] has no cooldown or recovery and gains +125% ->187.5% damage. Efficiency still caps at50% reduction; [Skill 1]/[Skill 2] cost at least1 [Elemental Gauge], [Last Flare] at least70. One ordinary action remains spent. |
| `calamitic-horizon-cleaving-godpress` | Horizon-Cleaving Godpress | Damaging [Skills] ignore55% ->82.5% enemy [Defense], subject to the existing combined75% skill-ignore cap; +75% ->112.5% [Defense]. No [Shield] bypass. |
| `calamitic-throne-borrowed-tomorrows` | Throne of Borrowed Tomorrows | Activating [Last Flare] lets each other living ally who has already acted activate one additional [Skill 1] or [Skill 2] that [Player Turn]. Each ally receives this at most once per turn; allies in [Last Flare] recovery are ineligible. Missing actions, cooldowns and Gauge costs still apply. +45% ->67.5% [Health] and [Defense]. |
| `calamitic-cathedral-final-equation` | Cathedral of the Final Equation | Wearer's [Attack Actions] gain +250% ->375% [Critical Rate] and +120% ->180% [Critical Damage Multiplier]; +65% ->97.5% [Skill Efficiency], subject to existing caps/floors. No squad-wide benefit. |

The [owner catalog](conduit-catalog.txt) owns exact current text. Static bonuses
live in `src/content/phase-zero-conduit-stats.ts`; current hooks live in
`src/game/conduit-runtime.ts` and `src/game/calamitic-conduits.ts`. Historical
typed effect coefficients remain only for explicitly disabled legacy tests.
The [current compatibility matrix](character-conduit-compatibility.md) covers
all90 ordinary plus48 Masters. No current reserve, debt, borrowed Defense
action, Equation counter or squad healing survives these replacements.

## Upgrades and persistence

Five account-wide upgrades use Broken Mechanical Components only:

| Target level | +1 | +2 | +3 | +4 | +5 | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Components |10,000|20,000|40,000|70,000|100,000|240,000|

The400x base-curve multiplier is twice Omnic's200x. Existing one-step and
Max Level previews, confirmation, stale-state checks and atomic transactions
apply. Only listed replacement stats apply; no automatic equipment changes.

`Account.calamiticTokens` is optional, nonnegative and safe-integer validated.
Missing legacy balances read as0 without writing or resetting any account
data. No wallet version bump or grant is needed. Chest opening commits token
balance, all other rewards, chest decrement and existing RNG seed in one write.
Purchase commits tokens and ownership together. Overflow, denied persistence,
locked access, stale requests and duplicate ownership preserve the raw wallet.

The authoritative operation uses the same catalog, unlock predicate, price
and reward resolver. Exact chest responses include the required tier token
amount; client validation rejects extra/forged fields and wrong amounts.
Existing authority locking and request idempotency remain unchanged.

This adds a receipt field without a wire-protocol negotiation mechanism.
Publish the matching client/authority together and reload already-open tabs
before opening chests. An old client can reject the new response after the
server saved the reward; its same-request retry is idempotent, not another
opening. Refresh/read the saved account rather than treating that response
error as proof that the chest was not consumed. Wallet and battle rules
versions are not network-response versions; this receipt field alone does
not require bumping either. D-382 independently uses combat rules6.

Encounters freeze equipment and upgrade levels. Calamitic state lives in the
existing copied Conduit runtime numbers, survives Settings/resume, and resets
on a new encounter. No load-time writes, new RNG stream or native-kit changes.

## Artwork and validation

[Six generation prompts](../Art/conduits/Calamitic%20Conduits.md) cover the five
devices and Calamitic Tokens. All six delivered originals are archived and
their reviewed transparent exports are installed (D-325). Shared revisioned
resolvers cover the five catalog devices and token across menus, equipment,
previews and saved receipts. The sealed shop still reveals only its exact
message. [Source authority, reproduction and validation](art-workflow.md#delivered-calamitic-artwork-d-325).

Focused validation:

```powershell
npm test -- src\game\calamitic-conduits.test.ts src\presentation\calamitic-conduits.test.ts src\game\calamity-account.test.ts src\game\calamity.test.ts src\online\calamity-server.test.ts src\online\calamity-http.test.ts --maxWorkers=2
node tools\build_conduit_redesign.mjs
node tools\bundle_server_game.mjs
npx tsc --project supabase\functions\game-operation\tsconfig.json
npm run build
```

Browser checks cover exact sealed text, no product leak, five unlocked devices,
balance refresh, rarity filters and maximum-safe-integer balances at desktop
and320px. Do not fund or mutate a real account for these checks.
