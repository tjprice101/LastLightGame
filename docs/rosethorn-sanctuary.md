# Rosethorn Sanctuary

## Direction and balance

Phase10's Tranquilitic Lycalis farm. Owner selected the name and **25 stages,
levels65-120**, matching Crownfall Treasury rather than the earlier shorter-mode
proposal. Creatures are divine, increasingly regal flaming wisps. The owner
requested roughly1 Lycalis on a chance at the beginning and roughly5 at the
highest level, and sales granting **both Fractalis and Lycalis together** with
less Fractalis than equivalent Gleamstone Slimes.

The owner subsequently capped sale Lycalis at1-10 per copy. The exact
intermediate sale values and mission chance curve are developer-selected tuning:

- Level65: **50% none /50% one Lycalis** per kill.
- Level120: **20% none /80% five Lycalis** per kill.
- For growth `g=(level-65)/55`, chance is `0.5+0.3*g` and the successful
  quantity is `round(1+4*g)`. This is one roll, not five independent rolls.
- Ordinary enemies and bosses use identical payouts. No clear bonus.
- Ordinary Fractalis remains the shared level-scaled range:7-14 at65,
  15-30 at120. No material drops or infusion specialties.
- Independent20% capture chance per defeated enemy. Lycalis, ordinary currency,
  capture and combat RNG remain separate.

## Content

Level at stage `s` is `round(65+(s-1)*55/24)`; every fifth stage is a boss.
Ordinary stages have two enemies, bosses one. Enemy ability: Hallowed Rosefire,
with the shared staged enemy skills/multiplier curve.

| Fixed form | Stages | Name | Rarity / Stars | Fractalis sale | Lycalis sale |
| --- | --- | --- | --- | --- | --- |
|1 |1-5 |Rosethorn Wisp |Common /1 |100 |1 |
|2 |6-9 |Votive of First Bloom, Rosethorn Wisp |Uncommon /2 |300 |2 |
|3 |10-13 |Laurel of the Sacred Flame, Rosethorn Wisp |Rare /3 |1,000 |3 |
|4 |14-17 |Seraph of the Rose Pyre, Rosethorn Wisp |Epic /4 |3,000 |5 |
|5 |18-21 |Sovereign of the Hallowed Garden, Rosethorn Wisp |Legendary /5 |10,000 |7 |
|6 |22-25 |The Flame Beyond Eternity, Rosethorn Wisp |Omnic /6 |30,000 |10 |

Stable IDs: `infusion:sanctuary:0` through `infusion:sanctuary:5`.
These are creatures, not Element-Bearers. They never evolve. Enemy and captured
portraits share one definition. The six supplied portraits,3:1 header and16:9
arena are registered; RGB source hashes and per-image key settings are recorded
in [root-art-intake.json](../Art/root-art-intake.json).

## Captures and saved progression

Use the existing optional walletv3 captured-copy records and `infusionStages`
with mode ID `sanctuary`; no new currency/save version or load-time write.
Real captures retain defeated level, stage and kit; ordinary Standard awards
start at their fixed form's first stage. No Sanctuary Lv50 duplicate exception:
the existing duplicate-EB Treasury reward remains unchanged.

Copies can level independently to120, equip ordinary Conduits and participate
in mixed/all-creature squads across every mode. Captured stats are ordinary
enemy stats times `.65+.35*tier/5`; never boss stats. Continue/replay/Settings
retain per-instance run snapshots. Sanctuary's stage cap25 drives validation,
unlocks and completion. Legacyv2 Heaven/Abyss migration is unchanged and does
not rescale either new currency farm.

Sanctuary copies **cannot** satisfy Heaven/Abyss evolution fodder recipes,
even though their combat element is Tranquilitic.

## Atomic rewards and sales

`saveAccountRewards` validates defeated source, mode/form/stage/level, ordinary
currency range and exact successful Lycalis quantity from that level's odds.
Currency-farm material awards reject. Premium currency, Fractalis, captures,
discovery, receipts and stage unlock commit in one validated write. Failed
writes preserve persistent state; receipt replay cannot duplicate awards.

Shared `creatureSaleOffer` and `sellCurrencyCreature` support Treasury and
Sanctuary. They reread the exact owned UUID and current lock/squad/any-Conduit
protection. A single write credits **both balances**, removes only that copy
and its empty equipment map. Invalid input, overflow in either balance or a
failed write preserves persistent currencies and copy. Discovery and pity
remain unchanged. UI confirmation includes full name, UUID, both prices and
permanent removal; cancel performs no transaction.

Sale value uses fixed form, not level, capture/banner origin or owned rarity
progress. Treasury-only API wrappers remain for compatibility and reject
Sanctuary copies. Heaven/Abyss creatures and EBs remain unsellable.

## Standard and presentation

The first three wisps join matching1/2/3-star tiers: **15 real outcomes** total,
three5-star EBs plus12 creatures. Five-star tier remains1% total; creature tiers
still split99% with50:30:17 weights, each now divided equally across four modes.
Cost10, independent200/500 pity and Lv50 Omnic Treasury duplicate conversion
are unchanged. Sales do not reset or advance pity.

Currency farms, battle chrome/log/rules/results, Character sales and both
Archive galleries use authored content and shared helpers. Character Archive
now has42 entries:18 EB evolutions plus24 captured forms. Loot/rate tables
remain specific, compact and text-only where required.

## Edit points and validation

- [Mode/stages](../src/content/activities.ts).
- [Forms, skills, stats and prices](../src/content/infusions.ts).
- [Lycalis odds](../src/content/loot-random.ts).
- [Standard pool](../src/content/standard-banner.ts).
- [Atomic account transactions](../src/game/account.ts).
- [All-floor/economy/presentation regressions](../src/game/rosethorn-sanctuary.test.ts).
- [Eight copy-ready art prompts and intake](../Art/Rosethorn%20Sanctuary.md).

Tests cover all25 floors,65-120 odds/boundaries, direct/burn kills, independent
RNG, capture/source validation, write failures/receipts, stage caps/migration,
retained copies/leveling/squads/Continue, all six dual sale prices, protections,
overflow in either currency, Standard rewards and pending-art presentation.
Balance remains local-prototype tuning; no server economy or paid purchases.
