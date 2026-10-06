# Summoning and economy

**Phase9 status:** Heaven/Abyss Lycalis drops, Crownfall Treasury Fractalis
farming/sales and the one Standard Banner are implemented. Draws are active:
the final crowned slime duplicate reward now exists.
The former unowned-only starter draw has been removed, including its backend.
Existing ownership, progress and balances are preserved without refunds/rekeying.
Purchases and monetization remain unapproved.

## Lycalis income

Lycalis starts at0. First Fracture grants10 once per account, atomically with
evolution. Every newly defeated Heaven/Abyss enemy also performs one separate
Lycalis roll, including ordinary/boss, burn and area-attack kills.

| Defeated level | None |1 Lycalis |2 Lycalis |3 Lycalis |
| --- | --- | --- | --- | --- |
|80 |90% |8% |1.5% |0.5% |
|120 |75% |10% |10% |5% |

All four probabilities interpolate linearly with `(level-80)/40`. Ordinary
enemies and bosses use identical probabilities. Amounts are mutually exclusive,
not a uniform1-3 range; the stage-specific Creature Glossary lists each amount
separately. No Adventure/elemental-dungeon premium drops or stage-clear bonus.

`infusionLycalisOdds` and `rollInfusionLycalis` in
[loot-random](../src/content/loot-random.ts) are the shared authoritative formulas.
[Battle rewards](../src/game/battle.ts) use independent `lycalisSeed` xorshift RNG;
existing combat/Fractalis/material/capture random streams do not shift.
Reward events carry optional `lycalis:1|2|3`; absent means no premium award.
[Account rewards](../src/game/account.ts) validate mode/stage/defeated source and
integer amount, then save premium currency, other rewards, captures, discovery,
unlocks and receipt in one wallet write. Failed writes reject the action visibly;
retrying an already-committed receipt cannot duplicate rewards. Results and loot
bursts reuse actual currency artwork and do not grant an additional reward.

## Rosethorn Sanctuary income

[Rosethorn Sanctuary](rosethorn-sanctuary.md) is the dedicated25-floor65-120
Lycalis farm. A single independent per-kill roll rises from50% chance of1 at65
to80% chance of5 at120:linear chance, rounded linear successful amount.
Boss and ordinary payouts match; ordinary Fractalis also drops, no materials.
Captured wisps sell for both currencies in one protected-safe atomic write:
Common->Omnic100/300/1k/3k/10k/30k Fractalis plus1/2/3/5/7/10 Lycalis.
Prices are fixed by form, never level. Locks/squad/any-Conduit protect copies;
sale cancellation/failure/overflow changes neither balance nor ownership/pity.
Exact curve/prices are developer tuning under owner-delegated balance.

## Standard Banner

Source: [standard-banner](../src/content/standard-banner.ts).
Stable ID `standard`, single cost **10 Lycalis**, availability **true**.
Ownership never changes published pool probabilities.

### Banner art and clean disclosures

All summoning banners use **16:9 full-bleed Omnic-tier artpieces** reflecting
their overall identity, not individual reward portraits. Art direction does not
change acquisition rarity or odds. The supplied Standard artwork is registered
at `banners/summon-standard.png`; its original and provenance are recorded in
[root-art-intake.json](../Art/root-art-intake.json). See
[copy-ready art prompt/intake](../Art/Summoning%20Banners.md).

The drop-rate table has only **Name / Rarity and stars / Rate**, one row per
actual outcome. No unit art, roles, stats, lore, decorative rating medallions
or reward cards. Rarity uses the awarded form (Evo1 Common for starter EBs;
Common/Uncommon/Rare for the three fixed creature forms), never current owned
progress or the banner's Omnic visual direction. Highest-star entries appear
first. Pity progress stays compact; detailed pity, aggregate tier totals,
duplicate and income rules remain accessible in a collapsed disclosure.

Current fifteen outcomes:

| Star tier | Authored entries | Total probability | Per entry |
| --- | --- | --- | --- |
|1 | Heaven/Abyss/Treasury/Sanctuary form1 (four) |99% *50/97 | Tier total /4 |
|2 | Heaven/Abyss/Treasury/Sanctuary form2 (four) |99% *30/97 | Tier total /4 |
|3 | Heaven/Abyss/Treasury/Sanctuary form3 (four) |99% *17/97 | Tier total /4 |
|5 | Infernis, Tizu, Flora (three EBs) |**1% total** |1% /3 (~0.333333%) |

The remaining99% uses50:30:17 creature-tier weights; each tier splits equally
among its real entries. The five-star rule is **1% per tier, not per EB**.
The UI shows six decimal places, trimming trailing zeros; mathematical tier
totals/fractions above are authoritative, not sums of rounded display labels.

No four/six-star EB entries exist. They have no placeholder weight. Future
six-star EBs receive their own **0.1% total tier**, equally split once authored;
creature weights then normalize into the remainder. Treasury and Rosethorn
Sanctuary forms are now included. Captured fourth-sixth forms are not
banner entries.

An already-owned EB awards **The Crown Beyond Dawn, Gleamstone Slime**, the
Omnic6-star final Treasury form, at **level50 flat**. This replaces both the
earlier first-form-stage and highest-account-level proposals for duplicates.
It is a separate unlocked playable creature copy, not a duplicate EB or a6-star
EB entry. Optional acquisition=`banner-duplicate` permits only this form to start
below its mission stage level; retained skills come from its first authored
final-form stage22. Its stats use ordinary Treasury growth at its actual level.

Ordinary creature draws start at their form's first authored stage level with
that stage's kit; EBs start Common/Evo1/Lv0/weapon-rank0. Rewards are unequipped.
Each draw rereads funds/ownership/pity, resolves one outcome, converts duplicates
and commits10 Lycalis, ownership/copy and pity in one wallet write. Errors and
failed writes preserve the previous save. Confirmation cancellation does nothing.
The saved result is announced as text; no reward art enters the rate table.
Pity is approved as below. No multi-draw, featured pool or payments
have been approved. There are no extra banner placeholders.

## Independent banner pity

Owner approved two independent per-banner counters, counting completed draws
since the last qualifying result:

- **200:** guarantees a character of the highest star tier currently in the
  real pool on the200th draw without such a result. Any highest-star character,
  including a duplicate, resets this counter.
- **500:** guarantees an **unowned character of that same highest star tier**
  on the500th draw without a new highest-star character. A natural or guaranteed
  new highest-star character resets this counter (and also the200 counter).
- A duplicate highest-star result does not reset500 unless500 pity itself is
  due and all highest-tier characters are owned. In that case award a normal
  highest-star duplicate result through the crowned-slime conversion, resetting
  both counters. Do not downgrade the guarantee to an unowned lower-tier EB.
- When both guarantees are due,500 takes priority. Eligible guaranteed
  characters split equally. No soft-pity rate ramp is approved.
- Highest tier means5 today,6 only once real6-star characters join the banner.
  Five-star results then do not reset highest-tier counters. Pool changes do not
  reset accumulated counters. Counters are banner-specific, not shared.

[Resolver](../src/content/standard-banner.ts) implements exact selection and
counter transitions as a pure function, without grants/spending. Optional
walletv3 `bannerPity.standard` stores `{highestStar,unownedHighestStar}`, each
nonnegative integer below200/500. Missing legacy data reads as zero only for
display/resolution; no load write or retroactive count. Invalid counters fail
explicitly. The menu displays current saved progress and rules.

The active draw transaction rereads ownership/pity/funds, resolves once,
convert duplicates, and save result, cost and new counters in the **same write**.
Only successfully persisted draws count; cancellations, rejected draws, failed
saves and menu visits never advance pity. Never save counters separately.

Published tier probabilities above are **base rates outside guaranteed pulls**.
On200 pity the highest-tier character probability is100%; on500 pity it is100%
within the eligible unowned subset (or all highest-tier characters if all owned).
Tests cover exact199/200 and499/500 thresholds, independent natural resets,
simultaneous priority, all-owned fallback, invalid inputs, future6-star fixtures,
saved progress and failed writes. Phase9 transaction tests cover actual rewards.
See [pity tests](../src/game/banner-pity.test.ts).

## Other currency and persistence rules

**Fractalis** is the main currency and starts at0. Every defeated enemy grants
a uniform integer5-10 at Lv.1, scaling to15-30 at Lv.120, including burn kills,
outside Crownfall Treasury. Treasury is the approved high-payout exception:
100-200 at65, quadratically rising to1,000-2,000 at120 per kill, with no additional
ordinary Fractalis roll/material/Lycalis/clear bonus. Captured Treasury slimes
sell for1,000/3,000/10,000/30,000/100,000/300,000 by fixed-form rarity, never
by level. Sales are exact-copy/protected-safe/atomic.
See [Treasury rules](crownfall-treasury.md).
Dungeon materials and progression costs are documented in
[gameplay](gameplay-and-elements.md) and [progression](units-and-progression.md).
**Lycalis** is premium currency; this does not authorize real-money purchases.

The wallet remains `last-light.wallet` version3. Balances must be nonnegative safe
integers; overflow/corruption/storage failures are explicit errors, never silent
fallbacks. Loading grants nothing and writes nothing. Existing legacy balances
and starter IDs remain intact. Local storage is single-tab prototype persistence,
not an authoritative online account or cross-tab transactional service. Clearing
site data removes saved progress.

Active draws reread ownership/funds, validate every content outcome,
and commit cost plus actual result in one write. Interrupted operations must
recover to old or fully committed state. Future network operations require
idempotent operation IDs and server authority; never trust client-supplied draws.

## Validation and activation handoff

[Phase8 tests](../src/game/banner-and-lycalis.test.ts) cover all80-120 probability
boundaries, unchanged other RNG, burn/AOE/boss awards, atomic failures/retries,
deduplication, overflow/forged amounts/modes, glossary/results and the exact
real fifteen-entry banner. [Squad tests](../src/game/squad.test.ts) preserve old
owned starters and verify unaffordable draws never charge/grant.
[Treasury/activation tests](../src/game/treasury.test.ts) exercise all25 stages,
captures/mission payouts, first-stage creature draws, exact Lv50 duplicate
provenance, pity/cost/reward atomicity, failure/retry and protected-safe sale.
[Sanctuary tests](../src/game/rosethorn-sanctuary.test.ts) cover all25 floors,
exact1-5 premium curve, dual-currency sales, both balance overflows, retained
copies, stage migration and equally weighted first-three-form Standard awards.
Do not advertise additional guarantees. Payments and market-specific
store/legal safeguards require separate approval and review.

See [roadmap](roadmap.md), [decisions](decisions.md) and
[banner authoring checklist](content-guide.md#adding-a-banner).
