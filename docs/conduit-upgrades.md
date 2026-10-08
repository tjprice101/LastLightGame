# Conduit upgrades and Broken Mechanical Components

## Confirmed scope (D-130)

Owner requests stage-increasing per-enemy component drops in Awaken the Machines,
a new Conduit Upgrade menu, five upgrades per Conduit and icon-level indicators.
Follow-ups confirm **one account-wide level per Conduit name**, preserving shared
unlocks, and **+250% over the original stat modifiers**: final modifiers are
3.5 times the originals. Owner explicitly clarifies **penalties grow too**.
Omnic unique mechanics remain unchanged. All25 Common/Rare/Legendary/Omnic
Conduits can be upgraded; neither rarity nor artwork evolves.

Owner chooses a Midjourney prompt and neutral pending-art icon, not authored
SVG art. [Broken Mechanical Components prompt](../Art/Broken%20Mechanical%20Components.md)
depicts a shattered Omnic-tier ivory/platinum mechanism with prismatic opal
facets. This is visual direction, not the currency's acquisition rarity.
The owner-supplied image is now installed (D-137), with original bytes/hashes
preserved and reviewed offline teal-background removal. See the prompt document
for export provenance and regeneration.

## Implemented editable first-pass balance

Exact drop odds, quantities and costs below are developer tuning under the
existing delegated balance direction, not additional owner-authored numbers.

- Only defeated **Awaken the Machines** enemies roll components, every stage
  and form. Ordinary enemies and bosses use identical odds.
- D-139 expands the mode to100 stages. Stage1:25% chance of1;
  stage100:100% chance of100.
- With `t = (stage - 1) / 99`, chance is `.25 + .75*t`;
  quantity on success is `round(1 + 99*t*t)`. Quantity grows quadratically,
  while chance grows linearly. No separate quantity roll.
- Each kill makes one independent component roll using `componentSeed`.
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

Owner requires rarity scaling and extremely expensive Omnic max upgrades
(D-139); these exact1x/2x/4x/200x multipliers are editable
developer tuning. They multiply the existing five-step Common cost curve.
Common/Rare/Legendary costs are unchanged. One Omnic name costs120000 total;
its final step alone costs50000. At stage100's guaranteed100 per enemy,
funding all five steps from zero takes1200 kills, before spending elsewhere.
This is a long-term late-stage farm rather than a quick upgrade.
Already-saved levels stay intact: no retroactive charge, refund or load write.
The shared rarity-aware cost resolver controls affordability, displayed cost,
confirmation, saved-success text and transaction spending.

[Drop definition](../src/content/mechanical-components.ts) and
[upgrade definition](../src/content/conduits.ts) are the editable sources of truth.
Creature loot tables use the same drop API, revealed only after defeating that
creature at a valid stage.

| Machine stage | Chance | BMC per successful drop |
| --- | --- | --- |
|1 |25% |1 |
|25 |43.18% |7 |
|50 |62.12% |25 |
|75 |81.06% |56 |
|100 |100% |100 |

Chance examples round for this table only; runtime uses the exact formula.
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
  flat/percentage-point buffs and critical cap. Verify all25 names' exact five
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
