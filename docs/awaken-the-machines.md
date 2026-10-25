# Awaken the Machines and expanded Conduits

## Linear stage drop rates (D-402)

Each eligible rarity rolls independently for every defeated Machine:

| Rarity | First eligible stage | Starting chance | Stage35 chance |
|---|---:|---:|---:|
| Rare | 1 | 5% | 35% |
| Legendary | 1 | 5% | 20% |
| Omnic | 26 | 5% | 15% |

For stage `s`, use `0.05 + (finalChance - 0.05) *
(s - firstStage) / (35 - firstStage)`, without rounding intermediate rates.
Omnic is unavailable before26. Bosses and ordinary enemies use the same
stage-dependent rarity chances. One kill can award one Conduit of each
eligible rarity together; there is no shared one-Conduit cap.

The final stage35 boss independently rolls **50%** for one Machine's
Master Chest (renamed from Cosmic Grand Master Chest in D-405). Earlier bosses and non-boss enemies cannot drop it. This is
separate from all three ordinary rarity rolls, so the final boss can award
three Conduits and a Master Chest together. Calamity chest contents and the
0.5% banner bonus remain unchanged.

The same stage-rate helper drives actual rewards and baseline loot tables.
Baseline per-name rates divide the current stage's rarity chance by its
full pool, still ignoring ownership/focus. Actual rewards retain unowned-only
selection, saved focus, no completed-tier compensation, independent RNG
streams/draw counts and atomic, receipt-deduplicated persistence.
No migration, retroactive reward or combat-rule restart is introduced.

Supersedes D-400's fixed rarity/chest rates below. Validate all35 stages,
exact first/final endpoints and roll boundaries, gate25/26, independent
multi-rarity kills, final-only chest source, focus/ownership and UI table
parity. Rebundle/type-check the shared authority and run
`node tools\smoke_server_game.mjs --machines-layout` before coordinated release.

## Current drop rates and baseline loot tables (D-400)

Historical D-400 rates, superseded by D-402 above:
per-enemy independent Conduit rolls are **Rare8%, Legendary5.5%, Omnic3%**.
Legendary and Omnic each gain two percentage points; Rare and the0.5% banner
bonus are unchanged. Omnic still starts at stage26; boss/ordinary Conduit
odds match. The final stage35 boss independently drops one Cosmic Grand
Master Chest at **5%**, replacing1%. Guaranteed Calamity chest contents and
all other activities' drops are unchanged.

Collections' View Loot always shows the enemy's baseline per-name rate:
the tier chance divided by its full pool, ignoring ownership and Focus Loot
on initial render and stage changes. Stage-picker loot lists likewise keep
the complete baseline pool. These are reference tables, not personalized
forecasts. Actual rewards still honor unowned-only selection and Focus Loot;
owned tiers drop nothing, focus clears only on acquisition, and RNG stream
draw counts, atomic rewards and receipt deduplication remain unchanged.

This supersedes earlier rate and account-specific table statements below,
not their35-stage layout, migration, unlock or focus-persistence contracts.
Client and shared authority must be deployed together after tests, build,
authority rebundle/type-check and hosted reward parity checks.

## Current35-stage layout (D-380)

Machines has **35 stages**, still starting at enemy Lv.10 and ending at
Lv.120. Intermediate levels use `round(10 + (stage-1)*110/34)`, preserving
the existing stat and ability curves at those levels. Six enemy forms span
the shorter activity, and every fifth stage remains a boss. Normal enemy
Prismatica still uses the same level-based payout; final-boss quantities
retain their5x multiplier. Components are guaranteed:
`round(3 + (stage-1)*122/34)`, then5x at stage35, preserving3 initially,
125 final base and625 on the final boss.

- **Rare8% and Legendary3.5% on every stage.**
- **Omnic1% on stage26 and every stage afterward**, through stage35.
  The new threshold is `floor(56/75*35)`. No tier rates, pools, source
  activities, independent roll draws or Focus Loot rules change.
- The final-boss-only Cosmic Grand Master Chest stays at1%, now at stage35.

Walletv9 marks the new layout. Every v7-v8 saved Machines stage maps to
`max(1, floor(oldStage/75*35))`:1->1,35->16,56->26,75->35. Pre-v7
100-stage saves first use their established100->75 conversion, then this
new remap. Loading never writes; the first successful transaction savesv9.
Currentv9 progress never remaps again, and invalid stages reject without
overwriting raw data. Other activities, currencies, gear, ownership, upgrades,
Focus Loot, receipts and recorded Calamity access remain intact. Proven old
final-boss UUID receipts preserve earned Machines Calamity access, but merely
having unlocked the final stage does not grant a victory.

Pre-v9 online Machines encounters are discarded before validating their old
stage numbers; already saved rewards remain. Re-enter from the remapped
unlocked stage. Other currentv8 activity runs are not discarded.

Validation: `npx vitest run src\game\machines-layout.test.ts
src\game\machines.test.ts src\game\account.test.ts --maxWorkers=2`.
The layout suite checks every current stage, every old75-stage unlock,
pre-v7 chaining, failed writes, no repeated migration, final-clear proof,
old run handling and Omnic availability on all stages26-35. Hosted check:
`node tools\smoke_server_game.mjs --machines-layout`, using disposable users.
This section supersedes the historical stage counts/gates below.

## Focus Loot (D-379)

The Machines activity's **Focus Loot** button opens saved Rare, Legendary and
Omnic selections with a separate focus for each rarity. Select or replace any
unowned name, or clear a rarity to restore its general unowned pool. Owned
names remain visible with **Details** but cannot be focused. Common,
Calamitic and Master Conduits are not focus options.

A successful rarity roll awards that tier's selected name. Independent8%/
3.5%/1% rates, the current stage26-and-afterward Omnic gate, boss parity, completed-tier
behavior and RNG draw counts are unchanged. An unsuccessful roll does not
consume focus. Obtaining a selected name from **any source**, including a
banner bonus, clears only that tier in the same atomic account save. Other
focuses persist across entries, Continue, Replay, Settings and sign-in.
Banner bonuses themselves are not redirected.

Legacy accounts without the optional `machineLootFocus` field load without
writes or migration. Malformed tiers/IDs and owned selections are rejected;
failed saves preserve both inventory and focus. Receipt retries do not grant
again or consume another focus. Multiple kills in one action consume a
selection once before returning to the ordinary unowned pool. Collections'
View Loot reflects focus-specific per-name chances and retains Details.

Validation: `npx vitest run src\game\machine-loot-focus.test.ts
src\presentation\machine-loot-focus.test.ts --maxWorkers=2`; full suite/build,
authority bundle/type-check, and `node tools\smoke_server_game.mjs --focus-loot`
for disposable hosted persistence, three-tier drops and idempotent retries.
Client and authority must be published together.

## Unowned-only enemy Conduit drops (D-312)

Machines now choose uniformly among **unowned ordinary Conduit names within
each successful rarity roll**. Rare8%, Legendary3.5%, Omnic1% on stage26 and every stage afterward,
independent tier rolls and equal boss/ordinary odds remain unchanged. Once
every name in a rarity is owned, that roll grants no Conduit, compensation,
cross-tier reroll or replacement reward. One kill can still grant different
rarities together. Common entries remain Store-only.

Eligibility uses current account ownership, not equipped gear. New awards
become ineligible immediately for later kills, including multiple kills in one
action. Continue, Replay, Settings and historical online-run resumes retain or
refresh this information without changing frozen fighter stats/equipment.
Reward persistence also rejects already-owned names atomically; receipt
retries remain idempotent. Old duplicate counts and upgrades are untouched.
The rarity-selection RNG draw is still consumed on successful completed-tier
rolls, preserving stream alignment; combat/currency/components/Master-chest
RNG are unchanged.

View Loot shows current account-specific per-name chances, including0% for
owned entries. The remaining names share their unchanged tier total.
The separate banner bonus and final-boss Cosmic Grand Master Chest remain
unchanged; duplicate protection here applies to ordinary enemy Conduit drops,
not chest items or banner bonuses.

Validation: `npm test -- src\game\machines.test.ts
src\online\server-game.test.ts src\presentation\creature-loot-dialog.test.ts
src\game\kit-conduits.test.ts src\game\loot-table-parity.test.ts --maxWorkers=2`.
Regenerate the shared server bundle and coordinate website/server deployment;
this change does not publish itself.

**D-293 death-loot presentation:** every awarded Conduit appears in the
defeated Machine's actual-receipt loot burst, with its supplied icon, exact
quantity, rarity/palette beam, bright core/base glare and snapshotted upgrade
meter. All dropped stacks across activities are50% larger, including currency,
components and captured-creature portraits in capturable modes. Responsive
rows preserve viewport fit. Pickup timing, reduced motion, rewards/RNG and
atomic saves are unchanged. [Visual contract](free-battle.md#larger-death-loot-and-machine-conduit-beams-d-293).

**D-269 origin:** Machines are destroyed prototypes from when Let and Rise
worked together, not Rise's ordinary Elemental-Devourer creations. Damaged
mechanisms awaken amid the ruins of their collaboration. Activity, Glossary
and Conduit origins use [the shared canon](world-lore.md); forms, art, combat,
drop pools, independent RNG and no-capture rules are unchanged.

**D-201 final-boss chest:** stage 100 / Lv.120 boss independently has a 1% chance
to drop one Cosmic Grand Master Chest. Open in Inventory for an unowned Master
of your choice, including future characters. [48 Masters and exact rules](master-conduits.md).
No ordinary tier-pool, component, currency or banner chance changes.

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

**D-346:** now **75 stages**. Lv.10-120 spreads across all75 and the Omnic gate
moves to stage56 (`1+round(74*74/99)`), the same enemy level as old stage75.
Saved v3-v6 unlocks map proportionally (100->75, rounding up) read-only; v7
persists on the first transaction. Component growth follows stage progress.

Originally35 stages (D-124), then **100 stages** (D-139) after the owner's
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

BMC is guaranteed on every kill (D-290):3 per enemy at stage1, scaling
linearly to a base125 at stage100 with whole-unit rounding. D-294 multiplies
the final boss's currency/component quantities by5:625 BMC and75-150
Prismatica on every final clear/replay. Earlier bosses/ordinary use the
same stage quantity; no additional clear payout. The independent component
RNG draw is retained for compatibility, not drop chance.
[Upgrade economy](conduit-upgrades.md) owns the formula/cost table;
Omnic restoration is5000/10000/20000/35000/50000 BMC (120000 total).
The owner sets the3/125 base endpoints and5x final-boss boost; upgrade costs
remain unchanged developer tuning. Conduit/chest chances and one-per-roll
quantities are unchanged.

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
