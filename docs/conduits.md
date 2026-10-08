# Conduits and Conduit Store

**Status:** purchasing/per-character equipment/stat buffs remain active. D-124
adds [Awaken the Machines](awaken-the-machines.md),20 earned Conduits, unique
Omnic mechanics and an additional Legendary banner bonus.25 total entries.
D-130 adds [five account-wide upgrades](conduit-upgrades.md) using new machine
currency only. Modifiers/penalties end at3.5x; special mechanics unchanged.
D-136/D-139 scale component costs by rarity: Common1x, Rare2x, Legendary4x,
Omnic200x (120000 BMC total for all five upgrades). Components grow sharply
through the100-stage machine mode; Omnic acquisition begins at stage75.
Existing saved upgrades remain unchanged, with no retroactive charge/refund.

## Identity

Conduits replace Artifact terminology. They are mechanisms hidden long ago
during an ancient war. Some are powered by **Elemental Light**, the source that
gave every being their element and elemental powers. Mechanical devices remain
distinct from Light-powered ones. No war name or faction has been invented.
Owner-approved Omnic equipment requires a matching combat element.

## Rarity presentation and expansion (D-124)

Five existing **Common/bronze** designs remain small stat unlocks. Five
**Rare/silver** entries improve two distinct stats; five **Legendary/platinum-
white** entries provide85% to one stat and -10% to another. Ten
**Omnic/prismatic** elemental masterpieces provide three60/50/40% stat buffs
plus unique combat mechanics. Higher rarity unfolds/restores more ambitious
machinery in the final Thornia/Crinso compact anime/cel renderer, not palette
swaps/realism. "Uncommon" in this request was clarified to mean Rare.

See the [rarity art direction](../Art/Conduits.md#future-rarity-art-direction)
for historical direction and cutout/effect separation, and
[current catalog/mechanics](awaken-the-machines.md) for the implemented rules.
No Uncommon/Epic Conduit catalog or Conduit evolution system. D-130 upgrades
stat modifiers without changing rarity, identity or artwork.

## Initial Common catalog

| Conduit | Prismatica | Buff when equipped | Power |
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

Home's Stores destination contains Conduit Store. Inventory lists owned copies
only. Character's Conduits tab retains its contextual store link; eight ordinary
slots are active and Master remains reserved. No bottom-navigation bar.
History-aware Back returns from the Store to its actual caller, including the
selected Character Conduits tab or Stores (D-092), rather than a fixed Home link.
D-093 arranges equipment as a full-width reserved Master block above a
four-by-two ordinary-slot grid on desktop, two columns on phones. The detail
panel scrolls on desktop; every gear selector/effect remains available.

Each confirmed purchase buys one copy. Owned copies stack by catalog ID; repeat
purchases are allowed but extra copies provide no additional equipment benefit.
**Owning one copy unlocks that name for every owned character.** Equipping does
not consume or reserve copies. Each character can equip a named Conduit only
once across its eight ordinary slots. Different characters may share the unlock.
Common purchase rules/prices are unchanged. Drop-only Rare/Legendary/Omnic
cannot be purchased, including through transaction calls. No Conduit sales,
refunds or limited stock. Machine per-kill independent8%/3.5%/eligible1%
tier rolls and successful banner0.5% Legendary bonus are active (D-124).
Owned but unequipped Conduits give no bonuses.

`last-light.wallet` version3 gains an optional `conduits` map of registered IDs
to nonnegative safe-integer counts. Old saves need no rewriting on load.
Purchases re-read storage, validate profile/catalog/funds/capacity, then save
the Prismatica deduction and copy together in one write. Failed writes and
rejected purchases do not change the persistent wallet. Other currencies,
materials, progress, squad, stages, discoveries and receipts are preserved.
As with existing transactions, play in one tab: there is no cross-tab lock.

## Artwork

[Copy-ready prompts](../Art/Conduits.md) cover five icons and the store banner.
The five supplied Common icons and store banner are registered; RGB source
provenance and per-image background-key settings are in
[root-art-intake.json](../Art/root-art-intake.json). The20 new catalog entries
have [copy-ready prompts](../Art/Awaken%20the%20Machines.md) and installed,
reviewed256px transparent icons (D-128). Original bytes, per-image keys and
foreground protections are recorded in [machine provenance](../Art/machines-art-intake.json).
All shared Inventory/Archive/equipment/loot/results resolvers use the catalog IDs.
Ordinary Inventory/equipment icons are80px; Store and Conduit Archive hero art
is responsive up to200px. Repeated "Recovered mechanism" artwork labels are
removed; unique lore, names, effects, prices and counts remain (D-092).
Cutouts use the original chibi/cel renderer and contrasting solid backgrounds,
with opaque non-emissive core highlights even on Light-powered devices.

## Validation and run snapshots

### Equipment persistence and run snapshots

Optional `conduitEquipment` maps owned character IDs to exactly eight ordered
Conduit IDs/nulls. Reject malformed slots, duplicates, unknown/unowned Conduits,
more than four Omnic, mismatched Omnic elements or unowned characters without
overwriting saves. Old saves have no equipment.
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
Upgrade levels also snapshot at entry and persist through Continue/replay/
Settings. Shared `conduitEffect` and fighter resolution use those levels,
including Legendary drawbacks; new runs use current account levels.

[Transaction tests](../src/game/conduits.test.ts) cover exact prices, repeat
purchases, one-write commits, insufficient funds, failed storage, malformed saves,
legacy migration and overflow. [UI tests](../src/presentation/conduit-store.test.ts)
cover navigation, catalog, inventory and honest inactive-buff states.

[Machine expansion tests](../src/game/machines.test.ts) verify new drops,
banner atomicity, element/cap restrictions and all ten unique Omnic mechanics.
[Equipment tests](../src/game/conduit-equipment.test.ts) verify shared unlocks,
duplicate rejection, removals, failure safety, exact effective stats and all-mode
Continue/replay snapshots. Archives and elemental emblems already exist.
Generated machine artwork/Common drop locations and Master behavior remain deferred.
