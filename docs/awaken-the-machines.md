# Awaken the Machines and expanded Conduits

**D-176 current pool:** same25 kitConduit IDs converted to unique Omnics,
yielding15Rare/15Legendary/45Omnic pool entries with unchanged8%/3.5%/1%
total chances, stage75Omnic gate and independent RNG stream. Equal entry chance
within tiers; original-five Legendary banner pool unchanged. Converted Common
Store entries no longer sold. [Current catalog/compatibility](kit-conduits.md#current-approved-omnic-replacement-d-176)
supersedes historical pool counts below. and expanded Conduits

## Current kit expansion (D-160/D-162)

The approved25 further kit-focused additions are implemented after six-element
migration. [Exact catalog, trigger/cap rules and validation](kit-conduits.md).
Live total85:15 Common /23 Rare /21 Legendary /26 Omnic. Machine tier totals,
100 stages, stage75 Omnic gate and original five Legendary banner pool remain.
Only stat buffs/penalties scale with upgrades; kit rules do not.

## Phased second expansion (D-151/D-157)

[35 new designs and phases](conduit-expansion-plan.md) add5 Common,
10 Rare,10 Legendary and one additional Omnic per ten combat elements.
Expansion implements60 live entries. Common additions are explicitly Store-only;
only the original five Legendary devices remain eligible for banner bonuses.
Implementation must replace fixed tier-pool divisors together with RNG/catalog/
glossary validation; never accidentally increase total odds by only adding rows.

## Confirmed scope (D-124)

Owner requests a new mode and five Rare, five Legendary and one Omnic Conduit
for each of ten elements. Follow-up confirms "uncommon" means the **Rare/silver**
tier, not a new rarity. "Omni" uses the existing canonical **Omnic** name.
Leave Rosetta's Omnic prompt unchanged: owner withdrew the revert request.

Originally35 stages (D-124), now **100 stages** (D-139) after the owner's
expansion. Owner confirms spreading Lv.10-120 across all100 and moving
upper-tier Omnic drops to stage75; bosses remain every fifth stage and tier
rolls stay independent. Machines are **non-capturable**;
ordinary Prismatica accompanies Conduits, no evolution materials/Null-Prismatica/clear bonus.
D-130 adds [Broken Mechanical Components](conduit-upgrades.md): stage-growing
per-kill currency drops for five account-wide Conduit upgrades. This supersedes
the previous no-additional-currency scope, not the other reward restrictions.
Original Common purchases remain unchanged; D-157 adds five Store-only names,
without machine Common drops. Existing activities receive no new tier rolls.
Both real banners have a separately approved0.5% Legendary bonus per successful
paid draw, including pity draws. Character/creature odds, cost and pity stay
unchanged; the Conduit is additional and never auto-equipped.

## Implemented content and editable first-pass balance

[Catalog](../src/content/conduits.ts) owns all85 entries:

| Tier | Presentation | New entries | Acquisition |
| --- | --- | --- | --- |
| Common | Bronze | Fifteen; original five plus ten | Store-only; no machine rolls |
| Rare | Silver | Twenty-three |8% total per machine kill;8%/23 per name |
| Legendary | Platinum/white | Twenty-one |3.5% total per kill;3.5%/21 per name; original five only banner bonus0.5% total/0.1% per name |
| Omnic | Prismatic within subject palette | Twenty-six; three Infernic/Oceanic and five each other canonical type |1% total per kill at stages75-100;1%/26 per name |

Rare entries improve exactly two distinct stats. Legendary entries increase one
stat85% and reduce another10%; Worldbreaker is the owner's +85% Attack/-10% HP
example. Judgment Lens increases the Critical Damage **multiplier**85%, not
critical chance. Omnic entries improve three distinct stats60/50/40% plus one
mechanic. D-162 adds explicit fixed kit rules without upgrading their coefficients.
Percent modifiers multiply after ordinary growth/passives/weapon
bonuses, following existing Conduit semantics; percentage points and flat
Gauge additions remain separate. Stat/skill text uses effective values.
Exact effects/numerical tuning are developer-authored first-pass designs,
not additional owner promises. There is no Conduit evolution system.

### Omnic mechanisms

| Element / device | Trigger and effect |
| --- | --- |
| Infernic / Phoenix Reactor | Inflict Burn on a surviving enemy: next offensive activation gains5 percentage points Crit, capped100%. No same-activation benefit. |
| Aquatic / Leviathan Pump | An ability increases ally shield: restore caster HP by5% maximum, once per activation; cannot revive. |
| Tectonic / Atlas Bastion | Defense grants caster shield worth10% maximum HP. |
| Efflorescent / Worldtree Heart | New player turn restores caster HP by2% maximum; not at entry, no revival. |
| Voltaic / Thunderbird Coil | An activation critically hits: +5 Gauge once, not per target. |
| Atmospheric / Griffin Turbine | Normal Attack primes next offensive skill for10% extra outgoing damage; normal attacks/support do not consume it. |
| Luminous / Seraph Mirror | Offensive activation defeats an enemy: +5 Gauge once, not per kill; Burn ticks excluded. |
| Ominous / Eclipse Mantle | Inflict Weaken: next offensive activation ignores20% target Defense; enemy stat is not mutated. |
| Tranquilitic / Kirin Cradle | Defense restores caster HP by5% maximum; no revival. |
| Chaotic / Ouroboros Core | Last Flare grants caster shield worth15% maximum HP; ordinary recovery still applies. |

Charges refresh rather than stack. Offensive activation means one Normal
Attack/damaging skill/Last Flare, including all its AoE targets; consumed before
processing new triggers. Support and Defense never consume offensive charges.
Shields refresh to the larger value, never add; HP/Gauge respect current caps.
Pending charges and gear carry through staged Continue, while HP/cooldowns reset
as before; replay creates fresh charges from the snapshotted gear.
Effects require the caster's matching equipped Conduit and produce actual
status/heal/shield events. No new RNG or status save fields.

D-157 adds ten bounded elemental mechanics in
[the phase1 table](conduit-expansion-plan.md#omnic---one-for-each-element).
Keep existing mechanics above unchanged. Charges and target-owned Fracture
Marks use snapshotted run state, not account fields; fixed caps/coefficients
do not grow with upgrades. Independent named sources do not recursively
trigger. Per-activation AoE costs/bonuses/charges resolve once, not per target.
Owner-specific marks show beside enemy HP with stacks and readable owners.
Exact engine/event tests own consumed-before-prime and once-per-turn behavior.

### Encounters and exact drops

Six distinct machines: Fractured Watcher(stages1-17/Tectonic), Ashwing Harrier
(18-34/Atmospheric), Ivory Kirin(35-50/Tranquilitic), Celestial Leviathan
(51-67/Aquatic), Crowned Phoenix(68-84/Infernic), Ouroboros of the First Dawn
(85-100/Chaotic). These are not captured-character forms or banner outcomes.
Enemy level is `round(10 + (stage - 1) * 110 / 99)`. Stage100 is the final
Lv.120 boss; no Continue there. Every other cleared stage continues manually.
Enemy skills share the existing level50 second-skill/boss ultimate scheduler.
Shared stat curves preserve200k ordinary/400k boss HP at120.

Rare, Legendary and eligible Omnic rolls are **independent per enemy**, with
one equally chosen name per successful tier. Multiple tiers may drop together.
Each awards one copy. Bosses have identical odds, never extra rolls or clear
grants. Stage75 is the exact Omnic unlock, not level-derived. Source-of-truth:
[machines.ts](../src/content/machines.ts); Creature gallery uses its per-entry
odds only after defeat discovery, at the selected real stage.

BMC has one separate roll per kill: chance25%->100% linearly across100 stages,
successful quantity1->100 quadratically (rounded). Bosses/ordinary use the
same odds. [Upgrade economy](conduit-upgrades.md) owns the formula/cost table;
Omnic restoration is5000/10000/20000/35000/50000 BMC (120000 total).
Exact quantities/costs are developer balance, not extra owner-authored numbers.

## Saves, equipment and atomicity

Wallet remains version3. Existing optional `conduits` map accepts the20 new
stable IDs; `infusionStages.machines` tracks ordinary staged unlocks. Missing
legacy fields read empty/first stage without writes. No retroactive awards.
Existing machine unlock numbers retain their exact values (including35);
no load migration/rescaling. Higher floors unlock normally up to100. Existing
Conduits/upgrades/discovery IDs and other activities' stage limits are preserved.

One owned copy unlocks its name for all owned characters, without consumption.
Eight ordinary slots/no duplicate names; Master reserved. At most four Omnic
Conduits, all matching that character's combat element (including captured
creatures, not their infusion material pool). UI disables invalid choices;
save validation, transactions and fighter resolution independently enforce
the restrictions. Drop-only entries cannot be purchased through hidden callers.
Owning duplicates adds counts, not stronger equipment bonuses.

Per-kill Conduit RNG uses independent `conduitSeed`, leaving combat/material/
currency/capture RNG unchanged. Actual reward events carry IDs/counts; ordinary
Prismatica, Conduits, discovery and receipt commit in one validated write before
presentation. Reject invalid mode/stage/source/tier/quantity/multiple-same-tier
awards or overflow. Receipt replay grants nothing twice.

Banner bonus roll occurs after resolving the normal draw, so it cannot replace
that outcome or alter that draw's pity. Bonus, cost, reward and pity save together.
Rejected/failed/overflow writes leave all wallet data unchanged. No auto-equip.
Local storage remains single-tab, not an authoritative economy/cross-tab lock.

## Art, menus and integration

[28 copy-ready prompts](../Art/creatures/Awaken%20the%20Machines.md):20 Conduits, six
enemy cutouts,3:1 mode header and16:9 arena. Thornia/Crinso's final compact
anime/cel style and elegant escalating architecture are the new standard:
broken black/white futuristic machines become majestic mythological mechanized
creations with wild late wings/rings/regalia. Scenery is element-scorched
wasteland with one giant white machine awakening centrally.

All28 owner-supplied RGB images are installed (D-128). Originals remain
byte-identical under `Art/source/machines`; [manifest](../Art/provenance/machines-art-intake.json)
records source/export hashes, reviewed RGB keys/foreground protections and facing.
The20 transparent Conduit icons are256px; six enemy cutouts are960px, with pale
wings/armor, green cores/eyes and intended shadows preserved. Header and arena
are copied byte-for-byte, not background-removed. Shared art resolvers wire
all35 stages, battle/cut-ins, discovery-gated Creature gallery, Gameplay header,
Inventory/Conduit Archive/equipment and real Conduit loot/results. No save,
ownership, combat or reward changes.
See [reproduction and review workflow](art-workflow.md#machine-expansion-art-d-124d-128).
Prompt keys/no-glow rules apply only to cutouts; scenery may glow.

Gameplay has a real machine category/selector/entry; all existing navigation
and activities remain. Inventory/Character/captured equipment/Conduit Archive
show names/effects/rarities/counts and availability; Store sells only Common.
Combat loot and results summarize the actual Conduit events without rerolls.
Summon disclosure/status include the bonus and transaction semantics.

## Validation guidance

- `npm test -- src\game\machines.test.ts src\game\conduit-equipment.test.ts src\game\conduits.test.ts src\presentation\archives.test.ts src\presentation\conduit-store.test.ts`
- `python -m unittest discover -s tools -p test_machine_art_prompts.py`
- `python -m unittest discover -s tools -p test_machine_art_intake.py`
- `npm test -- src\presentation\machine-art.test.ts src\presentation\art.test.ts src\presentation\unit-facing.test.ts src\presentation\battle-loot.test.ts`
- `npm test` and `npm run build` for all existing activities/acquisition flows.
- Test exact8/3.5/1/0.5% boundaries, equally chosen names, stage25 vs26,
  simultaneous tier success, all ten mechanics, cap/element guards, actual
  Legendary penalties, locked/squad captured safety, receipt replay, failed
  storage/overflow, legacy loads without writes and gear snapshots.
- Browser-check mode navigation, missing-art behavior, actual reward receipts,
  bonus result text/disclosure, keyboard equipment, full balances at phone sizes
  and neutral UI/rarity-specific accents. Never rewrite the owner's wallet.

Remaining: wider Common drop locations and supplied component currency art.
The28 machine assets are installed; [component prompt](../Art/items/Broken%20Mechanical%20Components.md)
and neutral pending-art UI are ready. No extra banners or capture rules.
