# Calamitic Conduits (D-324)

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
Exact prices, token quantities and effect coefficients below are editable
developer tuning, not owner-authored numbers.

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

All effects scale linearly across saved upgrade levels0 through5.
Percentages below show unupgraded -> +5. Generated strikes use ordinary
Attack/(Attack+effective Defense) mitigation, then shields and one rounded
damage outcome. They do not roll critical hits, grant native resources or
recursively activate other action effects.

| Stable ID | Creation | Complete effect |
| --- | --- | --- |
| `calamitic-world-eater-orrery` | World-Eater's Orrery | Store40% ->80% of actual direct enemy HP damage taken by living squad members, capped at400% ->800% wearer Attack. Defense empties the reserve into one generated strike against the healthiest living enemy. Shields, self-costs, routed/generated losses and deferred debt do not fill the reserve. Each living wearer has its own cap/reserve. |
| `calamitic-causality-funeral-engine` | Causality Funeral Engine | Defer40% ->60% of direct enemy damage remaining after shields, up to30% ->50% wearer maximum HP per enemy phase. Deferred amounts are whole units. Pay exact recorded debt before attacks in the next enemy phase. Debt bypasses shields/protection, can defeat its wearer and cannot be deferred again. Routed damage is excluded. Debt is consumed once; a fallen wearer does not transfer it to a revival. |
| `calamitic-horizon-cleaving-godpress` | Horizon-Cleaving Godpress |40% ->60% of native direct damage bypasses shields. Against an enemy with a shield, native direct damage also gains30% ->60%. Remaining damage spends shields normally. Applies to captured manual attacks too, not Burn or generated damage. |
| `calamitic-throne-borrowed-tomorrows` | Throne of Borrowed Tomorrows | Defense offers one further Normal Attack or available ordinary skill this player turn. Taking it grants10 ->30 Gauge after ordinary costs and makes the wearer unable to act next player turn. Next borrowing becomes available three turns after use. Declining the offer loses no turn. No borrowed Defense/Last Flare, missing-skill/recovery bypass or extra action beyond existing limits. |
| `calamitic-cathedral-final-equation` | Cathedral of the Final Equation | Three different manual action types in succession discharge120% ->240% Attack split equally among living enemies, then clear the sequence. Repeating any recorded type restarts with that repeated action. Normal Attack, Defense, Skill1, Skill2 and Last Flare are distinct types. Support/Defense actions count; automatic follow-ups do not. |

Defense-triggered lethal strikes run the same death, outcome and deduplicated
reward finalization as offensive actions. Real HP losses, remaining shields,
stored reserves, debts, due phases, borrowed turns and Equation counts remain
visible through existing ordered events and copied battle readouts.

The typed definitions live in `src/content/calamitic-conduits.ts`; runtime hooks
live in `src/game/calamitic-conduits.ts`. The original133-item redesign registry
and compatibility matrix still cover their historical85 ordinary/48 Masters.
The full catalog is now90 ordinary plus48 Masters; the five additions have
separate exhaustive equipped/unequipped tests at every upgrade level.

## Upgrades and persistence

Five account-wide upgrades use Broken Mechanical Components only:

| Target level | +1 | +2 | +3 | +4 | +5 | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Components |10,000|20,000|40,000|70,000|100,000|240,000|

The400x base-curve multiplier is twice Omnic's200x. Existing one-step and
Max Level previews, confirmation, stale-state checks and atomic transactions
apply. There are no flat passive stats or automatic equipment changes.

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
error as proof that the chest was not consumed. Wallet version5 and battle
rules4 are not network-response versions and must not be bumped for this.

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
