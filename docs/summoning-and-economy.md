# Summoning and economy

## Animated saved summon reveal (D-148)

Paid draws use an in-game confirmation, never a browser/OS message box.
The existing `summonCharacter` atomically commits cost, outcome, copy/
conversion, bonus and pity before a shared 2400ms Light-portal animation.
The result sheet shows actual awarded art, name, rarity/stars, element, level,
spending and any pity/Legendary bonus; duplicates show the converted creature.
Skip/Escape during animation reveal the saved receipt; explicit Continue
dismisses. Reduced motion reveals immediately. No Claim, reroll, second write
or changed odds. Failed saves never launch a success reveal; presentation errors
after saving explicitly say the reward is saved. Summon focus returns on dismissal.
[Shared contract](menus-and-inventory.md#in-game-dialogs-and-reward-foundation-d-148).

## Currency names and legacy compatibility (D-133)

Main currency is **Prismatica**; premium currency is **Null-Prismatica**.
All visible labels, accessibility text, errors, reward messages and documentation
use these names. This is a naming/art-direction change only: earning, costs,
odds, pity, balances and atomic save behavior remain unchanged.

Legacy `fractalis`/`lycalis` identifiers, account fields, DOM balance IDs, RNG
names and asset/source filenames remain for compatibility. No save migration
or load writes are introduced; existing version1/2/3 balances remain intact.
Historical source originals/provenance are not renamed or repainted.

Owner chose bright faceted prism and dark obsidian/violet counterpart prompts,
now without `--sref` or `--sw` under D-147, superseding the Evo.3 exception. See
[replacement currency prompts and intake](../Art/Currencies.md). D-142 installs
both supplied crystal icons with reviewed offline cleanup, original/previous
exports preserved and content-versioned shared URLs. Economy/save fields unchanged.

## Additional Legendary Conduit bonus (D-124)

Both real banners separately roll0.5% total per successful paid draw, including
pity draws, for one of five Legendary Conduits equally (0.1% each). This is an
extra item, not a banner-pool entry or replacement character/creature outcome.
Normal odds,10-Null-Prismatica cost, duplicate conversions and independent pity remain
unchanged. No auto-equipping. Cost/main reward/bonus/pity commit together in one
validated write; rejected/failed/overflow draws neither charge nor advance.
Rules/status and [machine contract](awaken-the-machines.md) expose exact odds.

## Roses Under Sunny Skies (D-100)

The second real banner `roses` is now playable. D-113 makes Rosetta/Thornia/Crinso
all6-star, equally sharing1.1% total (1.1% /3 each); first three Roselius
split98.9% with50:30:17 weights.10 Null-Prismatica, separate200/500 highest-star
counters (all three eligible;500 equally selects unowned, all-owned fallback),
usual500 priority/all-owned reset, one atomic cost/reward/pity save.
Owned event EBs convert to an Omnic Roselius at Lv.80 with Stage29 kit and
explicit duplicate provenance, usable or saleable for6 Soul of Rosethorn.
Roses does not alter Standard's separate pool or Lv.50 Treasury conversion;
D-122 subsequently expands Standard with the seven approved flagships.
No event Null-Prismatica drops or gifts; availability has no scheduled expiry.
See [complete event/banner/material contract](crimson-roses.md).

**Phase9 status:** Heaven/Abyss Null-Prismatica drops, Crownfall Treasury Prismatica
farming/sales and the one Standard Banner are implemented. Draws are active:
the final crowned slime duplicate reward now exists.
The former unowned-only starter draw has been removed, including its backend.
Existing ownership, progress and balances are preserved without refunds/rekeying.
Purchases and monetization remain unapproved.

## Null-Prismatica income

Null-Prismatica starts at0. First Fracture grants10 once per account, atomically with
evolution. Every newly defeated Heaven/Abyss enemy also performs one separate
Null-Prismatica roll, including ordinary/boss, burn and area-attack kills.

| Defeated level | None |1 Null-Prismatica |2 Null-Prismatica |3 Null-Prismatica |
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
existing combat/Prismatica/material/capture random streams do not shift.
Reward events carry optional `lycalis:1|2|3`; absent means no premium award.
[Account rewards](../src/game/account.ts) validate mode/stage/defeated source and
integer amount, then save premium currency, other rewards, captures, discovery,
unlocks and receipt in one wallet write. Failed writes reject the action visibly;
retrying an already-committed receipt cannot duplicate rewards. Results and loot
bursts reuse actual currency artwork and do not grant an additional reward.

## Rosethorn Sanctuary income

[Rosethorn Sanctuary](rosethorn-sanctuary.md) is the dedicated25-floor65-120
Null-Prismatica farm. A single independent per-kill roll rises from50% chance of1 at65
to80% chance of5 at120:linear chance, rounded linear successful amount.
Boss and ordinary payouts match; ordinary Prismatica also drops, no materials.
Captured wisps sell for both currencies in one protected-safe atomic write:
Common->Omnic100/300/1k/3k/10k/30k Prismatica plus1/2/3/5/7/10 Null-Prismatica.
Prices are fixed by form, never level. Locks/squad/any-Conduit protect copies;
sale cancellation/failure/overflow changes neither balance nor ownership/pity.
Exact curve/prices are developer tuning under owner-delegated balance.

## Standard Banner

### Implemented flagship direction (D-094/D-121/D-122)

Bruno (Tectonic Tank), Elise (Voltaic DPS) and Atmoso (Atmospheric DPS) are
owner-approved5-star Standard Banner Element-Bearers.
Aurora/Razor/Bliss/Disciple are approved6-star Standard identities.
All seven now have actual six-form content, supplied artwork and playable kits.
See [flagship contract](flagship-characters.md). Standard's six five-stars split
1% total, four six-stars split0.1%, and twelve creatures split98.9%.
Existing saved pity is preserved; highest-star pity now targets six-stars,
and five-star awards advance both counters. Cost and duplicate conversion remain.

### Banner selection (D-082)

Summon exposes a labeled banner selector above the current panel. Standard and
Roses Under Sunny Skies are real playable registrations. The latter's pool,
cost, duplicate/pity rules and continuous availability were approved in D-100;
supplied banner images are integrated; no event expiry has been scheduled.

`src/content/summon-banners.ts` registers real banners and their pool providers.
Selection is transient UI state, retained through menu navigation, Settings and
draw-result refreshes, not written to the wallet. The selected registration
supplies name, art, price, featured characters, rates and per-ID pity. Confirm
captures that ID and `summonCharacter` validates it before RNG/spending, saving
cost, reward and that banner's pity together. Existing callers default to Standard.
Unknown IDs fail explicitly; selection itself never spends or advances pity.

Before registering another event, approve its full pool/awarded forms, duplicate
rules, price, pity policy, eligibility/dates and artwork. Author matching
Information disclosures and confirmation, and validate save compatibility and
independent counters; the current disclosure/reward types describe Standard's
approved rules, not an invented universal event policy. Do not remove registered
IDs with saved pity without a preservation/migration plan. Test banner selection
at mobile widths, keyboard focus, selection retention and rejection without writes.

Source: [standard-banner](../src/content/standard-banner.ts).
Stable ID `standard`, single cost **10 Null-Prismatica**, availability **true**.
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
duplicate and income rules remain accessible in the centered **Rates & Information**
dialog (D-080). The complete text-only rate table is also inside that dialog;
cost, draw action, eligibility, result and pity progress stay on the main screen.

D-081 adds a compact **Available Element-Bearers** strip below the banner art.
It lists only real character outcomes in that banner's5/6-star tiers: element
emblem/name, character name, outcome stars and awarded-form rarity. Standard
lists all ten real Standard EBs at their fixed5/6 stars and Common (Evo1),
independent of owned evolution. No placeholders or duplicate-conversion creatures.
It does not advertise boosted rates or add portraits, roles, stats or lore.
The separate Rates & Information table remains text-only and unchanged.
D-083 shows its rules as a normal section inside the centered dialog, without
a second expandable disclosure. Odds, pity and draw transactions are unchanged.
Future characters must have registered definitions and awarded-form metadata
before joining a banner; the current catalog only supports Evo1 starter awards.

Current twenty-two outcomes:

| Star tier | Authored entries | Total probability | Per entry |
| --- | --- | --- | --- |
|1 | Heaven/Abyss/Treasury/Sanctuary form1 (four) |98.9% *50/97 | Tier total /4 |
|2 | Heaven/Abyss/Treasury/Sanctuary form2 (four) |98.9% *30/97 | Tier total /4 |
|3 | Heaven/Abyss/Treasury/Sanctuary form3 (four) |98.9% *17/97 | Tier total /4 |
|5 | Infernis, Tizu, Flora, Atmoso, Bruno, Elise (six EBs) |**1% total** |1% /6 (~0.166667%) |
|6 | Aurora, Bliss, Disciple, Razor (four EBs) |**0.1% total** |0.025% |

The remaining98.9% uses50:30:17 creature-tier weights; each tier splits equally
among its real entries. The five-star rule is **1% per tier, not per EB**.
The UI shows six decimal places, trimming trailing zeros; mathematical tier
totals/fractions above are authoritative, not sums of rounded display labels.

No four-star EB entries exist. They have no placeholder weight. The four
authored six-star EBs share **0.1% total**, not0.1% each. Treasury and Rosethorn
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
and commits10 Null-Prismatica, ownership/copy and pity in one wallet write. Errors and
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
- Highest tier is6 in both current banners. Five-star Standard results do not
  reset highest-tier counters. Pool changes do not
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

**Prismatica** is the main currency and starts at0. Every defeated enemy grants
a uniform integer5-10 at Lv.1, scaling to15-30 at Lv.120, including burn kills,
outside Crownfall Treasury. Treasury is the approved high-payout exception:
100-200 at65, quadratically rising to1,000-2,000 at120 per kill, with no additional
ordinary Prismatica roll/material/Null-Prismatica/clear bonus. Captured Treasury slimes
sell for1,000/3,000/10,000/30,000/100,000/300,000 by fixed-form rarity, never
by level. Sales are exact-copy/protected-safe/atomic.
See [Treasury rules](crownfall-treasury.md).
Dungeon materials and progression costs are documented in
[gameplay](gameplay-and-elements.md) and [progression](units-and-progression.md).
**Null-Prismatica** is premium currency; this does not authorize real-money purchases.

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
real twenty-two-entry banner. [Squad tests](../src/game/squad.test.ts) preserve old
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
