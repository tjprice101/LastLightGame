# Conduits and Conduit Store

**Status:** Phase2/3 implemented. Purchasing, per-character equipment and
actual combat stat buffs are active.

## Identity

Conduits replace Artifact terminology. They are mechanisms hidden long ago
during an ancient war. Some are powered by **Elemental Light**, the source that
gave every being their element and elemental powers. Mechanical devices remain
distinct from Light-powered ones. No war name, faction or elemental equipment
restriction has been invented.

## Confirmed future rarity presentation

The current five mechanisms are **Common** designs. Higher rarities must become
progressively more epic: unfold and restore their machinery through Uncommon,
Rare, Epic and Legendary, culminating in Omnic as fully completed/reborn
elemental masterpieces with brilliant shine and swirling prismatic elemental
energy. Keep recognizable machine identities and the established chibi/cel
renderer, rather than simple palette swaps.

See the [rarity art direction](../Art/Conduits.md#future-rarity-art-direction)
for the visual ladder and cutout/effect separation. This does not approve a
Conduit evolution/upgrade system, higher-rarity prices/buffs or drop rates.
Only the Common catalog is implemented.

## Initial Common catalog

| Conduit | Fractalis | Buff when equipped | Power |
| --- | --- | --- | --- |
| Vigil Core |1,000 | +5% Health | Elemental Light |
| Siegebound Drive |1,200 | +5% Attack | Mechanical |
| Bastion Lock |1,000 | +5% Defense | Mechanical |
| Parallax Relay |1,500 | +2 percentage points Critical Rate | Elemental Light |
| Fracture Reservoir |1,200 | +5 Shatter Capacity | Elemental Light |

Prices and stats are owner-approved editable first-pass balance.
Definitions: [conduits.ts](../src/content/conduits.ts). Buff descriptors
distinguish percentage multipliers, percentage-point additions and flat bonuses;
percentage buffs apply after character growth and existing weapon bonuses.
Critical rate adds0.02 (two percentage points), capped at100%; Gauge capacity
adds5. These do not change skill coefficients, cooldowns or Shatter gain rates.

## Navigation and transactions

Home has a Conduit Store shortcut. Inventory lists saved copies and links to the
store. Character's Conduits tab links to the store; eight ordinary
ordinary slots are active; the Master Conduit slot is reserved/unavailable.
The store is a submenu under Inventory, not an eighth bottom-navigation item.

Each confirmed purchase buys one copy. Owned copies stack by catalog ID; repeat
purchases are allowed but extra copies provide no additional equipment benefit.
**Owning one copy unlocks that name for every owned character.** Equipping does
not consume or reserve copies. Each character can equip a named Conduit only
once across its eight ordinary slots. Different characters may share the unlock.
There are no random rates, sales, refunds, limited stock or loot drops yet.
Owned but unequipped Conduits give no bonuses.

`last-light.wallet` version3 gains an optional `conduits` map of registered IDs
to nonnegative safe-integer counts. Old saves need no rewriting on load.
Purchases re-read storage, validate profile/catalog/funds/capacity, then save
the Fractalis deduction and copy together in one write. Failed writes and
rejected purchases do not change the persistent wallet. Other currencies,
materials, progress, squad, stages, discoveries and receipts are preserved.
As with existing transactions, play in one tab: there is no cross-tab lock.

## Artwork

[Copy-ready prompts](../Art/Conduits.md) cover five icons and the store banner.
The five supplied Common icons and store banner are registered; RGB source
provenance and per-image background-key settings are in
[root-art-intake.json](../Art/root-art-intake.json). Higher rarities remain
future art direction, not current catalog content.
Cutouts use the original chibi/cel renderer and contrasting solid backgrounds,
with opaque non-emissive core highlights even on Light-powered devices.

## Tests and next phase

### Equipment persistence and run snapshots

Optional `conduitEquipment` maps owned character IDs to exactly eight ordered
Conduit IDs/nulls. Reject malformed slots, duplicates, unknown/unowned Conduits
or unowned characters without overwriting saves. Old saves have no equipment.
Every equip/replace/remove rereads ownership and saves atomically. Failure
leaves the previous equipment unchanged; no currency/copy consumption.

Character equipment shows eight selectors, selected effects and effective stats.
Home, overview and upgrade previews use the same `resolveFighter` derived stats;
changed values show their before-Conduits baseline. Battle details list the
run's Conduits. Adventure, ten dungeons and both infusion modes clone equipment
at entry. Continue, replay, next wave and Settings preserve that snapshot;
later menu changes only affect a new run. Max HP uses the Health buff, actions
use effective Attack/Crit and incoming damage uses effective Defense.
No equipment changes occur mid-run or heal an ongoing character for free.

[Transaction tests](../src/game/conduits.test.ts) cover exact prices, repeat
purchases, one-write commits, insufficient funds, failed storage, malformed saves,
legacy migration and overflow. [UI tests](../src/presentation/conduit-store.test.ts)
cover navigation, catalog, inventory and honest inactive-buff states.

[Equipment tests](../src/game/conduit-equipment.test.ts) verify shared unlocks,
duplicate rejection, removals, failure safety, exact effective stats and all-mode
Continue/replay snapshots. Next phase: unified Archives, enemy elements and
elemental medallion prompts. Master Conduit behavior remains deferred.
