# Conduits and Conduit Store

## Description copy (D-397)

All138 current ordinary/Master abilities were audited;21 descriptions were
tightened in the [authoritative catalog](conduit-catalog.txt). Show current
values, triggers and meaningful limits, not upgrade formulas, repeated global
stat rules, implementation terms such as "frozen Squad", or redundant passive
labels. Leave already concise entries alone.

Stasis shows only its current10-20% chance, single-hit Shield spillover
protection, next-Enemy-Turn25% damage penalty and cooldown. Its unchanged
2-percentage-point upgrade progression belongs in the contract, not appended
to each level's ability. Master reference footers name the eligible bearer
and state that upgrading is unavailable, without restating that triggers and
limits are in the description.

Preserve specific caps, stacking/refresh rules, ownership, timings and
exceptions. No mechanics, stat values, upgrades, costs, eligibility or saves
change. Regenerate the shared catalog and compatibility matrix with
`node tools/build_phase_zero_conduit_catalog.mjs`; validate
`phase-zero-conduit-upgrades.test.ts`, `conduit-rules.test.ts`, Conduit runtime,
upgrade catalog and keyword tests, then build. Shared effect APIs propagate
the same copy to equipment, Collections, Stores and upgrade previews.

**Current D-383 refresh:** all45 ordinary Omnics and48 Masters use the
[current catalog](conduit-catalog.txt):55 owner-supplied baselines and38
unique completions retaining their native/elemental mechanics with stronger,
tailored stat packages. Omnic/Master squad auras add per living wearer,
including duplicate names; losing a source removes only its contribution.
Personal Master stats share the ordinary raw-base pools, respecting existing
caps. Changing maximum Health clamps held Health but never heals or revives;
initial full-health entry and explicit stage resets retain their intended fill.
Personal menu previews include permanent Master stats, excluding conditional
battle effects and squad auras. Gear, costs, IDs, art, ownership, acquisition
and restrictions are unchanged. Rules7 restarts historical encounters while
preserving frozen investment and saved rewards.

**D-382 preserved replacement:** the owner replaces all10 Common,15 Rare,
15 Legendary and five Calamitic abilities in the [catalog](conduit-catalog.txt).
Its statement that Omnics/Masters were unchanged is superseded by D-383.
Equipment Skill Duration no longer has a global cap. Beneficial
percentages grow10% of base per upgrade; penalties, conditions, proc chances,
durations and extra-action counts stay fixed. Existing Skill Efficiency caps
and Gauge floors remain. All names, IDs, art, ownership, saved levels, costs,
acquisition and equip restrictions are preserved. The
[current compatibility matrix](character-conduit-compatibility.md) covers138
entries. Earlier effect descriptions below are historical, not additive.

**D-379 Focus Loot:** [Machines](awaken-the-machines.md#focus-loot-d-379)
supports one saved unowned selection per Rare/Legendary/Omnic rarity. The
next successful roll of that rarity awards it without changing drop rates.
Obtaining it from any source atomically clears that tier's focus. Details
remain available; Master/Common/Calamitic Conduits cannot be focused.

**D-368/D-370 verified and activated for publication:** the approved
[Phase 0 catalog](conduit-catalog.txt) specifies all138 replacement abilities
and the new stat contract. Preserve IDs, ownership, equipment restrictions,
artwork, saved upgrades and costs. Rules7 and the shared client/authority
gate are enabled; hosted publication status is in the handoff.
The [138-entry behavior matrix](conduit-behavior-matrix.md) records
individual numerical checks and upgrade coverage. Historical
mechanics below are historical where they conflict; never combine old
passive bonuses with the replacement static calculator.

**D-324:** [five Calamitic creations](calamitic-conduits.md) extend the catalog
to90 ordinary plus48 Masters. Universal, token-purchased and above Omnic,
they retain eight ordinary slots/unique names with no extra Calamitic cap.
The existing four-Omnic maximum is separate. Rise alone built these devices;
the earlier collaborative-prototype lore still applies to the original85.

**Historical D-316 native compatibility:** the approved sixteen-character replacement is
implemented locally alongside explicitly adapted dependent effects. The
[133-item matrix](character-conduit-compatibility.md) and
[current exact roster](conduit-redesign.md) supersede retired resource/slot
references. IDs, holdings, upgrades, art and acquisition remain unchanged.
Shared rules version3 restarts historical current encounters only; frozen
investments and already saved rewards are preserved. No automatic unequips,
refunds, account migration or publication.

**Historical D-313 combat contract:** the owner approved and all133 reviewed
effects are implemented locally: [85 ordinary and48 Masters](conduit-redesign.md).
Each row replaces its old bundles; unlisted passive stats are removed.
Ordinary effects scale through+5 using their exact endpoints and thresholds;
Masters remain fixed. Only listed passive stats enter permanent stat totals.
IDs, art, prices, rarity, acquisition, ownership and saved upgrades are unchanged.
Historical combat/stat tables below are superseded by that roster, not additive.
This earlier D-313 publication status is superseded by D-370 above.

**D-312:** Machines enemy drops exclude already-owned ordinary names, choosing
equally among the remaining names in each unchanged rarity roll. A completed
rarity grants nothing and has no replacement reward. Preserve historical
duplicate counts/upgrades, banner bonuses and Master-chest drops.
[Exact eligibility and persistence rules](awaken-the-machines.md#unowned-only-enemy-conduit-drops-d-312).

**D-304:** The full loadout offers Unequip All for the currently viewed owned
member, clearing eight ordinary slots plus their Master in one atomic operation.
Captured Elemental-Devourers clear only ordinary gear. Ownership, upgrades,
other members' equipment and frozen battle loadouts are preserved. See the
[equipment screen contract](menus-and-inventory.md#dedicated-conduit-loadout-page-d-238).

**D-302 review completed by D-313:** the comprehensive equipment redesign
is approved and replaces historical combat rules below, not acquisition.

**D-201 current Master slot:** [48 character Masters](master-conduits.md) now
equip in one separate matching slot, superseding historical reserved-Master
statements. Final Machines boss has an independent 1% choice-chest drop.
The ordinary catalogue remains 85; Masters do not enter its pools/upgrades.

**Current D-176 conversion:** same25 kitConduit IDs become new Omnics, keeping
ownership/upgrades. Catalog85 tiers10Common/15Rare/15Legendary/45Omnic;
converted entries no longer sold or lower-tier drops, stage75+1%Omnic total.
Walletv5 is the read-only legacy conversion marker; remove only incompatible/
excess converted equipped slots in order, then persist on ordinary success.
Currentv5 gear is strictly validated. [Exact rules/compatibility](kit-conduits.md#current-approved-omnic-replacement-d-176)
supersede earlier25 kitConduit tier/rule totals, not other60 designs. and Conduit Store

**Status:** purchasing/per-character equipment/stat buffs remain active. D-124
adds [Awaken the Machines](awaken-the-machines.md),20 earned Conduits, unique
Omnic mechanics and an additional Legendary banner bonus. D-157 expands
to60 entries:10 Common/15 Rare/15 Legendary/20 Omnic, with35 added devices.
D-162 implements25 more [kit-focused Conduits](kit-conduits.md), bringing the
live catalog to85 (15/23/21/26); machine tier totals and banner eligibility stay.
D-130 adds [five account-wide upgrades](conduit-upgrades.md) using new machine
currency only. Modifiers/penalties end at3.5x; special mechanics unchanged.
D-136/D-139 scale component costs by rarity: Common1x, Rare2x, Legendary4x,
Omnic200x (120000 BMC total for all five upgrades). Components grow sharply
through the100-stage machine mode; Omnic acquisition begins at stage75.
Existing saved upgrades remain unchanged, with no retroactive charge/refund.

## Identity

Conduits replace Artifact terminology. Under [D-269 founding canon](world-lore.md),
they are surviving/restored mechanisms from Let and Rise's shared prototype
work, some hidden during the wars their later rivalry provoked. Some hold
**Elemental Light**, the term for their elemental energy, not the being or
source that created every faction's elements. Let gave his human bearers their
elements; Rise stole those powers for her Devourers. Mechanical devices remain
distinct from elemental-energy-powered ones; neither device grants a creator's soul.
Owner-approved Omnic equipment requires a matching combat element.

## Rarity presentation and expansion (D-124)

Fifteen **Common/bronze** designs remain small stat/kit unlocks. Twenty-three
**Rare/silver** entries improve two distinct stats; twenty-one **Legendary/platinum-
white** entries provide85% to one stat and -10% to another. Twenty-six
**Omnic/prismatic** elemental masterpieces provide three60/50/40% stat buffs
plus unique combat mechanics. D-162 adds fixed kit rules across all four tiers;
five Common prices and all25 exact rules are in the [kit catalog](kit-conduits.md).
Higher rarity unfolds/restores more ambitious
machinery in the final Thornia/Crinso compact anime/cel renderer, not palette
swaps/realism. "Uncommon" in this request was clarified to mean Rare.

See the [rarity art direction](../Art/conduits/Conduits.md#future-rarity-art-direction)
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
| Fracture Reservoir |1,200 | +5 Elemental Gauge Capacity | Elemental Light |
| Prism Splinter Socket |1,600 | +5% Elemental Damage | Elemental Light |
| Precision Escapement |1,800 | +8% Critical Damage multiplier | Mechanical |
| Fieldbrace Coupler |1,400 | +3% Health / +3% Defense | Mechanical |
| Reserve Torque Crank |1,500 | +3% Attack / +3% Health | Mechanical |
| Crosspin Governor |1,500 | +3% Attack / +3% Defense | Elemental Light |

Original five prices/stats are owner-approved first-pass balance; additional
five prices are developer tuning by usefulness under the owner's instruction.
Common is Store-only; no machine Common drop tier. Percent ED helps only a
nonzero base stat, never invents an affinity/status for a character with zero ED.
Definitions: [conduits.ts](../src/content/conduits.ts). Buff descriptors
distinguish percentage multipliers, percentage-point additions and flat bonuses;
percentage buffs apply after character growth and existing weapon bonuses.
Critical rate adds0.02 (two percentage points), capped at100%; Gauge capacity
adds5. These original stat-only designs do not change skill coefficients,
cooldowns or Shatter gain rates; D-162 kit-focused designs explicitly do.

## Navigation and transactions

Home's Stores destination contains Conduit Store. Inventory lists owned copies
only. Character's Conduits tab retains its contextual store link; eight ordinary
slots are active alongside one character-specific Master slot (D-201).
History-aware Back returns from the Store to its actual caller, including the
selected Character Conduits tab or Stores (D-092), rather than a fixed Home link.
D-093 arranges equipment as a full-width Master block above a
four-by-two ordinary-slot grid on desktop, two columns on phones. The detail
panel scrolls on desktop; every gear selector/effect remains available.

Each confirmed purchase buys one copy. Owned copies stack by catalog ID; repeat
purchases are allowed but extra copies provide no additional equipment benefit.
**Owning one copy unlocks that name for every owned character.** Equipping does
not consume or reserve copies. Each character can equip a named Conduit only
once across its eight ordinary slots. Different characters may share the unlock.
Original Common purchase prices/rules are unchanged; ten additions use the
same atomic purchase path and shared unlocks. Drop-only Rare/Legendary/Omnic
cannot be purchased, including through transaction calls. No Conduit sales,
refunds or limited stock. Machine per-kill independent8%/3.5%/eligible1%
tier rolls and successful banner0.5% Legendary bonus are active (D-124).
Owned but unequipped Conduits give no bonuses.

`last-light.wallet` version4 retains the optional `conduits` map of registered IDs
to nonnegative safe-integer counts. Old saves need no rewriting on load.
The six-element migration changes elemental eligibility, never stable Conduit
IDs/counts/upgrades/equipment. Former Earth/Nature, Wind/Electricity, Peace/Light
and Chaos/Shadow Omnic designs now share their merged canonical eligibility.
The25 further additions are live; machine tier totals remain unchanged.
Purchases re-read storage, validate profile/catalog/funds/capacity, then save
the Prismatica deduction and copy together in one write. Failed writes and
rejected purchases do not change the persistent wallet. Other currencies,
materials, progress, squad, stages, discoveries and receipts are preserved.
As with existing transactions, play in one tab: there is no cross-tab lock.

## Artwork

[Copy-ready prompts](../Art/conduits/Conduits.md) cover five icons and the store banner.
The five supplied Common icons and store banner are registered; RGB source
provenance and per-image background-key settings are in
[root-art-intake.json](../Art/provenance/root-art-intake.json). The20 new catalog entries
have [copy-ready prompts](../Art/creatures/Awaken%20the%20Machines.md) and installed,
reviewed256px transparent icons (D-128). Original bytes, per-image keys and
foreground protections are recorded in [machine provenance](../Art/provenance/machines-art-intake.json).
All shared Inventory/Archive/equipment/loot/results resolvers use the catalog IDs.
The35 D-157 additions are installed under D-167; D-199 installs the25 reborn
kit-Conduit icons with reviewed source-specific background cleanup and preserved
originals. All85 catalog entries now resolve real artwork, never unrelated icons.
[Approved catalog and phases](conduit-expansion-plan.md) records their identities.
[Kit catalog](kit-conduits.md) / [25 new icon prompts](../Art/conduits/Kit%20Conduits.md).
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
run's Conduits. Adventure, six dungeons and both infusion modes clone equipment
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
