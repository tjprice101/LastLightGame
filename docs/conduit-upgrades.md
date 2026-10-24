# Conduit upgrades and Broken Mechanical Components

## Current effect scaling (D-368 / D-382 / D-383 / D-390)

All90 ordinary entries use the [approved catalog](conduit-catalog.txt).
Beneficial percentages increase10% of their base per saved level, reaching
150% of base at+5. Penalties, trigger thresholds, proc odds, durations and
extra-action counts stay fixed, except Stasis's explicitly approved chance.
Stasis grows10/12/14/16/18/20% at +0..+5; a successful Shield-breaking hit
blocks only its own Health spillover, then schedules the unchanged next-turn
25% damage-taken penalty and cooldown. Failed rolls do not schedule either.
For Nullsong, positive75% becomes112.5%;
the negative75% and50/50 roll stay fixed. Glassroot's per450 Health coefficient
upgrades; its complete-Health-step calculation is uncapped. Masters never
upgrade. Skill Duration no longer has a global equipment cap; per-status
safety caps and Skill Efficiency50%/1-or70-Gauge floors remain.
Details/previews/receipts and frozen combat use the same exact policies.
Prices, saved levels, holdings and art are unchanged. Older scaling and
increasing-penalty statements below describe history, not current behavior.

D-383 extends the same10%-of-base rule to every added Omnic personal/squad
stat and revised beneficial percentage. Clearwater35% becomes52.5% per other
Oceanic member; Phoenix8% becomes12% per eligible tick; Dawn200% becomes300%
for its next Attack Action. Kirin's50%-recipient-Health cap stays fixed.
All48 Masters remain fixed. Explicit percentage-position policies are
verified against every upgraded description and all93 refreshed stat packages.

## Historical effect scaling (D-313)

All85 ordinary Conduits now upgrade their complete
[approved effects](conduit-redesign.md), not only generic stat bundles.
Continuous endpoints interpolate at `level / 5`; discrete counts/durations
change at+3. Listed passive stats and penalties keep `1 + .5 * level`.
Fixed numbers, trigger restrictions and Masters never secretly scale.
Current/next/+5 Details, single/Max confirmations, receipts and frozen battle
references use the same level-resolved descriptions. Costs and saved levels
are unchanged. The stat-only descriptions below are historical where they
conflict with D-313. Implemented locally, awaiting coordinated publication.

## Max Level (D-306)

The selected ordinary Conduit's upgrade screen offers **Max Level** beside
the existing one-step upgrade. Like character Max Level, it reaches the highest
affordable upgrade, not necessarily the cap. It sums each existing rarity-aware
step from the current level through at most+5; partial progress never skips
a step or changes its cost. For example, a Common at+0 with829 components
reaches+5 for600 total, leaving229; with174 it reaches+2 for75, leaving99.
Masters remain non-upgradeable.

The button displays the affordable target and total cost and is disabled at+5
or if the next step is unaffordable. A game-native confirmation previews the
current/target effects (with fixed penalties) and exact total spending.
`conduitMaxLevelPlan` is shared by UI and authoritative transactions;
`upgradeConduitToMaximum` rereads ownership, level and resources and rejects
changed/forged previews before one atomic component/upgrade write. No sequence
of per-level requests or saves is used. Online `maxConduit` validates the same
preview and never falls back to offline spending.

Cancellation, missing ownership/profile, stale previews, insufficient funds,
the cap and persistence failures spend nothing. Copies, other resources,
other names' upgrades/equipment and frozen active combat snapshots survive.
One post-save receipt presents the actual target level and total spending;
filters/page/selection remain, focus returns to the action or cap status.
Single and Max Level share a pending guard against overlapping clicks.

Validation: `conduit-max-level.test.ts` in game/presentation covers exact
affordability boundaries for all85 ordinary names/rarities/current levels,
partial/full upgrades, one-write persistence, no-op/stale/failed-save rejection,
strict online requests and frozen combat snapshots, confirmation/cancel/errors,
duplicate binding/clicks, authoritative routing and saved-receipt behavior.
Publish the regenerated game-operation bundle together with the client.

**D-302 review is approved and implemented under D-313 above.**
Master upgrades remain excluded; costs and saved levels are preserved.

## Confirmed scope (D-130)

Owner requests stage-increasing per-enemy component drops in Awaken the Machines,
a new Conduit Upgrade menu, five upgrades per Conduit and icon-level indicators.
Follow-ups confirm **one account-wide level per Conduit name**, preserving shared
unlocks, and **+250% over the original stat modifiers**: final modifiers are
3.5 times the originals. Owner explicitly clarifies **penalties grow too**.
Omnic unique mechanics remain unchanged. All85 Common/Rare/Legendary/Omnic
Conduits can be upgraded; neither rarity nor artwork evolves.
The35 D-157 additions reuse the same five levels/cost multipliers and
account-wide snapshots; special mechanic caps/coefficients do not upgrade.
The25 [kit-focused additions](kit-conduits.md) reuse these paths too. Account
upgrades multiply their stat descriptors, never kit potency bonuses, proc
quantities, cooldown reductions or caps.

Owner chooses a Midjourney prompt and neutral pending-art icon, not authored
SVG art. [Broken Mechanical Components prompt](../Art/items/Broken%20Mechanical%20Components.md)
depicts a shattered Omnic-tier ivory/platinum mechanism with prismatic opal
facets. This is visual direction, not the currency's acquisition rarity.
The owner-supplied image is now installed (D-137), with original bytes/hashes
preserved and reviewed offline teal-background removal. See the prompt document
for export provenance and regeneration.

## Implemented editable first-pass balance

Saved Conduit upgrade/acquisition dialogs use compact artwork capped at120px
and16% of viewport height, rather than the shared400px portrait stage.
Compact receipt spacing keeps the name, rarity, upgrade/owned counts, effect,
actual spending and equipment note together. Long receipts retain scrolling;
Continue remains outside the scroll area. Other Conduit surfaces and summon
portrait sizing are unchanged.

Exact drop odds, quantities and costs below are developer tuning under the
existing delegated balance direction, not additional owner-authored numbers.

- D-290: every defeated **Awaken the Machines** enemy guarantees components,
  every stage and form. D-294 gives the final boss5x quantities.
- Stage1 gives3 per enemy; stage35's base125 becomes a guaranteed625 (D-380).
  This supersedes D-139's chance-based/quadratic drop curve and D-290's final
  payout only. Earlier bosses keep the ordinary stage quantity.
- With `t = (stage - 1) / 34`, quantity is `round(3 + 122*t)`.
  Base quantity grows linearly with whole-unit rounding; chance is always100%.
  Multiply by5 only at stage35; no extra RNG call or clear grant.
- Each kill retains one independent component RNG draw using `componentSeed`
  for stream compatibility; its value cannot change the guaranteed quantity.
  Combat, Conduit, Prismatica, material, capture and Null-Prismatica RNG are unchanged.
- No components from other activities, banners, clears, stores, sales or
  retroactive grants. Components are a currency, not evolution materials.
- Only this currency pays for upgrades. Costs increase with rarity (D-136);
  copies are not consumed.

| Rarity | +1 | +2 | +3 | +4 | +5 | Total |
| --- | --- | --- | --- | --- | --- | --- |
| Common |25 |50 |100 |175 |250 |600 |
| Rare |50 |100 |200 |350 |500 |1200 |
| Legendary |100 |200 |400 |700 |1000 |2400 |
| Omnic |5000 |10000 |20000 |35000 |50000 |120000 |
| Calamitic |10000 |20000 |40000 |70000 |100000 |240000 |

D-324 adds [five universal Calamitic creations](calamitic-conduits.md) with the
same five account-wide upgrades at400x the base curve, twice Omnic. Their
separate typed effects scale linearly through+5; no copies or tokens are spent
on upgrades. The owner approves greater-than-Omnic costs, not these exact numbers.

Owner requires rarity scaling and extremely expensive Omnic max upgrades
(D-139); these exact1x/2x/4x/200x multipliers are editable
developer tuning. They multiply the existing five-step Common cost curve.
Common/Rare/Legendary costs are unchanged. One Omnic name costs120000 total;
its final step alone costs50000. At stage100's guaranteed625 per enemy,
funding all five steps from zero takes192 kills, before spending elsewhere.
This is a long-term late-stage farm rather than a quick upgrade.
Already-saved levels stay intact: no retroactive charge, refund or load write.
The shared rarity-aware cost resolver controls affordability, displayed cost,
confirmation, saved-success text and transaction spending.

[Drop definition](../src/content/mechanical-components.ts) and
[upgrade definition](../src/content/conduits.ts) are the editable sources of truth.
Creature loot tables use the same drop API, revealed only after defeating that
creature at a valid stage.

| Machine stage | Chance | BMC per defeated enemy |
| --- | --- | --- |
|1 |100% |3 |
|25 |100% |33 |
|50 |100% |63 |
|75 |100% |94 |
|100 |100% |625 (base125 times5) |

Quantities use the same whole-unit rounding as the runtime formula.
Owner confirms Lv.10-120 spread across100 stages and Omnic drops from75.
Existing saved unlock numbers stay unchanged, not rescaled; newly entered
encounters use the longer level/form curve. Saved ownership/discovery IDs and
all upgrade levels survive, with no load writes or retroactive charges/refunds.
Already-running battles retain their fighter/stat snapshots; new Continue
encounters use current stage definitions. See [machine specification](awaken-the-machines.md).

## Modifier semantics

| Upgrade | Original modifier scale | Worldbreaker Attack | Worldbreaker Health |
| --- | --- | --- | --- |
| +0 |1x | +85% | -10% |
| +1 |1.5x | +127.5% | -15% |
| +2 |2x | +170% | -20% |
| +3 |2.5x | +212.5% | -25% |
| +4 |3x | +255% | -30% |
| +5 |3.5x | +297.5% | -35% |

Scale **modifier amounts**, not the character's total resulting stats.
Percentage multipliers apply after character growth as before; percentage-point
and flat additions also scale. Keep fractional values until presentation.
Critical Rate is still capped at100%; zero-base multiplicative stats stay zero.
Unique Omnic triggers, charge behavior, cooldowns and fixed mechanic coefficients
are unchanged. Mechanic effects tied to maximum HP naturally use upgraded HP.
Element matching, max four Omnic, unique names/eight slots/Master reservation,
shared one-copy unlocks and original acquisition rules remain unchanged.

## Saves and transactions

Wallet stays version3 with optional `mechanicalComponents` (nonnegative safe
integer) and `conduitUpgrades` (registered owned IDs -> integer0-5).
Missing legacy values behave as0/+0 without load writes or retroactive grants.
Malformed, unknown or unowned upgrade entries are rejected, not silently dropped.
Other account fields and stable IDs are preserved on every transaction.

`upgradeConduit` rereads storage, validates profile/ownership/current expected
level/cap/funds, then saves balance deduction and level increment in one write.
Stale confirmations, rejected/failed writes and invalid input spend nothing.
Purchase/drop/banner duplicates retain that name's existing level.
Per-kill rewards validate component mode/source/stage/quantity/overflow and
save components with Prismatica/Conduits/discovery/receipt in one transaction.
Receipt replay never grants components twice; results only summarize events.
Single-tab local storage remains non-authoritative/not cross-tab locked.

Both starter and captured fighters use the same scaled modifier resolver.
Every activity clones upgrade levels at entry. Continue, Adventure next wave,
replay/retry and Settings keep that snapshot; menu upgrades affect only new runs.
Legacy sessions without level metadata use +0. Max Level previews include the
current levels and invalidate stale confirmations if upgrade levels change.

## Menu and presentation

**Conduit Upgrade** is reachable through Menu, Inventory, Conduit Store,
Conduit Archive, Gameplay's machine activity and both starter/captured equipment.
History-aware Back returns to the actual caller. The upgrade screen shows owned
names, current +level, current and next modifier values including drawbacks,
exact cost/balance, disabled unaffordable/final controls and a confirmation.
Success restores focus to the next button or final-cap status; errors are explicit.
Its farming shortcut opens the machine activity, not Adventure.

Shared Conduit icons use a five-square upgrade meter (D-138), replacing numeric
icon badges. Unfilled squares stay charcoal; each earned level fills one square
with shiny white. At +5 all squares glow prismatically with a slow color sweep
and shimmer. Both device and in-game reduced motion disable animation, retaining
the static prismatic finish. Icon accessible names still give exact +level/5;
numeric costs, upgrade buttons and current/next values remain unchanged.
Inventory, Store, Archives, equipment,
discovery loot tables and Conduit receipts/results reflect the right level.
Battle receipts use run-snapshotted levels, never menu rereads.
Primary balances/controls retain the neutral palette; existing rarity colors
remain rarity cues, not arbitrary currency accents.

Components appear as a third Inventory currency card, upgrade balance/cost,
machine reward showcase, actual loot and results. The shared component helper
and currency resolver use the supplied transparent256px icon, including
discovery-gated creature loot. No substituted material artwork.
Existing Prismatica/Null-Prismatica IDs are unchanged.

## Validation

- `npm test -- src\game\conduit-upgrades.test.ts src\game\machines.test.ts src\game\conduit-equipment.test.ts src\presentation\conduit-upgrade.test.ts src\presentation\inventory.test.ts src\presentation\archives.test.ts src\presentation\battle-loot.test.ts src\presentation\battle-results.test.ts src\presentation\conduit-store.test.ts`
- `npm test` and `npm run build` cover shared stat/reward/navigation surfaces.
- `python -m unittest discover -s tools -p test_component_art_prompt.py`
- `python -m unittest discover -s tools -p test_component_art_intake.py`
- `npm test -- src\presentation\conduit-upgrade-meter.test.ts src\presentation\conduit-upgrade.test.ts src\presentation\conduit-store.test.ts src\presentation\battle-loot.test.ts src\presentation\battle-results.test.ts src\presentation\inventory.test.ts src\presentation\archives.test.ts`
- Verify five squares at every level0-5, exactly level filled squares, +5-only
  animation and screen-reader labels. Browser-review large80/200px icons and
  compact40px result icons; both reduced-motion settings retain static colors.
- `python -m unittest discover -s tools -p test_art_prompts.py` for established
  art contracts; record pre-existing failures without editing unrelated prompts.
- Verify all100 exact drop boundaries, every modifier/+0-5, negative penalties,
  flat/percentage-point buffs and critical cap. Verify all60 names' exact five
  rarity costs, one-component-short rejection, exact-funds spending and final cap.
  Test legacy loads without writes,
  duplicate retention, one-write upgrades/rewards, replay dedup, source/quantity
  rejection, storage failure/overflow, stale/cancelled confirmations and all
  activities' starter/captured snapshots.
- Verify old stage35 remains unlocked but is no longer final;99 continues to100,
  final100 hides Continue, saved unlock cap is100, six art/forms cover every
  stage and other activities retain their stage/level limits. Omnic odds are
  absent at74, present at75; test120000 total Omnic spending.
- Browser-check320/390/1280px, max-safe balances, exact next/current values,
  markers, cap/focus/error states, keyboard/touch upgrade controls and farming/
  Back navigation. Use in-memory fixtures; never fund or overwrite owner saves.

Artwork intake is complete. No component
exchange, Conduit-copy consumption, Conduit sales or artwork evolution.
