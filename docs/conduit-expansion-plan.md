# Conduit and ability expansion phases (D-151/D-157)

**Current ability direction (D-163):** the owner clarifies buffs/debuffs/stacks
must be intrinsic character abilities, not equipment. Full-roster batches are
approved; the [three-starter redesign](character-kit-rework.md) is implemented.
Earlier pilot details below remain history; starter rules are superseded by
that specification. The25-Conduit additions are separate, not kit completion.

**Subsequent implemented expansion (D-162):** this document retains the original
35-entry design/history. The separate [25 kit-focused additions](kit-conduits.md)
are now live, for85 total. Do not reinterpret this table as the complete current
catalog or expand the original five Legendary banner pool.

## Scope and approval status

**Confirmed:** plan 35 additional, individually distinct Conduits across the
existing rarity tiers; Omnic entries cover different elements. They may drop
from similar enemies in Awaken the Machines (the Mechanism mode). The owner
also permits more expressive buffs, debuffs, stacks and elemental effects for
5-star and 6-star Element-Bearers. Normal Attack and Defense will eventually
share two universal icons, installed when the owner supplies their images.

**Approved phased implementation (D-157):** owner requests the whole expansion
in phases and selects Store-only acquisition for the five new Common entries.
Rare/Legendary/Omnic machine tier totals stay8%/3.5%/1%, with larger equal pools
and stage75 Omnic gate. Only the original five Legendary entries join the
existing banner bonus. Price Common devices by usefulness, not rarity alone.
Numerical kit/mechanic coefficients are developer tuning, not owner-authored
numbers. Each batch still requires implementation tests and clear status.
No automatic grants, save rewrites or replacement art before reviewed delivery.

Baseline catalog: 25 Conduits (5 Common, 5 Rare, 5 Legendary, 10 Omnic).
Approved additions: **5 Common + 10 Rare + 10 Legendary + 10 Omnic = 35**.
Expansion target: 60 total
(10 Common, 15 Rare, 15 Legendary, 20 Omnic).
[All35 copy-ready device prompts](../Art/conduits/Conduit%20Expansion.md) preserve these
distinct silhouettes, tier materials and Omnic element palettes. Reference-free,
safe-margin cutouts; proposals are not registered artwork URLs.
Rarity is independent of character stars. No new Uncommon/Epic Conduit tier.

## Phase 1 - Unique catalog design

Status: **35 designs implemented and validated**. Values are acquisition-level +0.
HP means Health; ATK means Attack; DEF means Defense; ED means Elemental Damage;
CD means the Critical Damage multiplier; CR is Critical Rate in percentage
points; SC is flat Shatter Capacity. Percentages are stat modifiers, not
percentages of final damage. Preserve zero-base stats and existing CR caps.

Each row has a different stat combination/tradeoff or trigger-and-payoff,
plus a recognizable device silhouette. No recolored copies of existing devices.
Common/Rare/Legendary are element-neutral; only Omnic is element-restricted.

### Common - bronze, compact recovered mechanisms

| # | Name | Base effect | Visual identity |
| --- | --- | --- | --- |
| 01 | Prism Splinter Socket | +5% ED | Bronze triangular clamp holding one split crystal |
| 02 | Precision Escapement | +8% CD | Small clock escapement with offset toothed sight disc |
| 03 | Fieldbrace Coupler | +3% HP ~ +3% DEF | Paired bronze braces clasped around a ceramic cushion |
| 04 | Reserve Torque Crank | +3% ATK ~ +3% HP | Folded hand-crank with a sealed reserve cylinder |
| 05 | Crosspin Governor | +3% ATK ~ +3% DEF | Cross-shaped governor balancing two armored counterweights |

These fill the two missing single-stat specialties and three small hybrid
roles, rather than renaming the five live Common items.

### Rare - silver, exactly two distinct stats

| # | Name | Base effect | Visual identity |
| --- | --- | --- | --- |
| 06 | Twinpulse Bellows | +15% HP ~ +12% ATK | Double silver bellows around a piston |
| 07 | Glassroot Gimbal | +15% HP ~ +15% CD | Spherical gimbal suspending a faceted life reservoir |
| 08 | Lifeline Flywheel | +15% HP ~ +15 SC | Open flywheel with braided reservoir channels |
| 09 | Sentinel Aperture | +15% DEF ~ +4 pp CR | Shutter iris set into an armored silver disc |
| 10 | Wardglass Transformer | +15% DEF ~ +12% ED | Stepped transformer with two crystal-insulated towers |
| 11 | Hammerbalance Link | +15% ATK ~ +12% DEF | Hinged counterweight beam with a central impact joint |
| 12 | Breach Pendulum | +15% ATK ~ +15% CD | Silver pendulum blade in an open fork frame |
| 13 | Coilfeed Ratchet | +15% ATK ~ +15 SC | Toothed ratchet feeding a coiled accumulator |
| 14 | Opal Indexer | +12% ED ~ +4 pp CR | Silver indexing wheel with five inset opal lenses |
| 15 | Resonance Crucible | +15% ED ~ +15% CD | Two-chamber silver crucible joined by a crystal bridge |

None duplicates the live HP/DEF, ATK/ED, CR/ATK, DEF/SC or HP/ED pair.
These are intentionally role alternatives, not strictly superior replacements.

### Legendary - platinum/white, one major gain and one drawback

| # | Name | Base effect | Visual identity |
| --- | --- | --- | --- |
| 16 | Siege Cantilever | +85% ATK ~ -10% DEF | Ivory siege arm projecting from a narrow platinum pivot |
| 17 | Nullsong Transmission | +85% ATK ~ -10% ED | Platinum gear train enclosed by silent crystal baffles |
| 18 | Horizon Heartcase | +85% HP ~ -10% DEF | White radial life chamber with retracted ward plates |
| 19 | Stasis Reliquary | +85% HP ~ -10% CD | Platinum preservation capsule and locked targeting rings |
| 20 | Granite Hourglass | +85% DEF ~ -10% ATK | Twin armored cones connected by a throttled drive |
| 21 | Pale Bulwark Diadem | +85% DEF ~ -10% HP | Crown-shaped fortress lattice with a narrow reserve core |
| 22 | Starvein Conductor | +85% ED ~ -10% HP | White conductor branches around a drained life vessel |
| 23 | Meridian Inverter | +85% ED ~ -10% CD | Platinum reversing prism with displaced precision lenses |
| 24 | Execution Orrery | +85% CD ~ -10% DEF | Asymmetric celestial targeting orrery with folded armor |
| 25 | Verdict Caliper | +85% CD ~ -10% ED | White precision jaws surrounding a throttled elemental core |

Each directed gain/penalty pair differs from all five live Legendary entries
and the other ten proposals. Drawbacks must remain visible in previews and
confirmations; no penalty-free max upgrade.

### Omnic - one new device per canonical combat element

All ten use **three distinct percent-stat bonuses at +60/+50/+40** and a new
bounded mechanic. None reproduces the live device's trigger/payoff.
All are prismatic restored ancient mechanisms, not realistic modern electronics.

| # | Element / name | Base stats | Proposed unique mechanic | Visual identity |
| --- | --- | --- | --- | --- |
| 26 | Infernic / Cinder Testament | +60% ED ~ +50% ATK ~ +40% DEF | When your Burn damages an enemy, gain one Ember Seal, at most one per enemy phase and three total. Your next damaging skill consumes all seals for +5% outgoing damage per seal. | Prismatic furnace-scroll drum with articulated ember clasps |
| 27 | Aquatic / Undertide Chronometer | +60% DEF ~ +50% HP ~ +40% ED | Your damaging skill hitting a Weakened enemy reduces your other ordinary skill's remaining cooldown by one, at most once per player turn; never reduces Last Flare recovery. | Sapphire tide-clock with opposing fin-shaped escapements |
| 28 | Tectonic / Faultkeeper Loom | +60% HP ~ +50% DEF ~ +40% ED | The first direct enemy hit after each Defense deals 15% less damage to you; consumes the ward even if shield absorbs the hit. No retaliation loop. | Crystal-stone shuttle threading suspended armor slabs |
| 29 | Efflorescent / Verdant Covenant | +60% ED ~ +50% HP ~ +40% ATK | When your healing restores another living ally's HP, give that ally +10% outgoing Normal Attack damage for its next Normal Attack; refresh, no stacking. | Branching opal graft loom with three leaf-shaped clasp arms |
| 30 | Voltaic / Stormstep Dynamo | +60% ATK ~ +50% DEF ~ +40% ED | Skill 1 primes +10% outgoing damage for Skill 2; Skill 2 primes the same for Skill 1. One charge per slot; consume old charge before priming, no same-activation benefit. | Two alternating lightning-shaped turbine rotors |
| 31 | Atmospheric / Skythread Rudder | +60% DEF ~ +50% ATK ~ +40% HP | Defense grants one Tailwind charge. Your next ordinary skill costs five less Gauge, minimum one; consumed on legal activation only, refresh rather than stack. | Feather-ribbed steering vane around a suspended opal keel |
| 32 | Luminous / Dawn Witness Array | +60% HP ~ +50% ED ~ +40% DEF | A noncritical Normal Attack grants +3 pp CR for your next offensive activation, maximum three charges; critical activation clears them after using the bonus. | Prismatic witness lenses orbiting a white sundial tripod |
| 33 | Ominous / Nightglass Archive | +60% ED ~ +50% DEF ~ +40% ATK | Your damaging skill applies one Fracture Mark to surviving targets, maximum two. Your next Normal Attack on a marked target consumes its marks for +8% outgoing damage each. | Obsidian-opal memory vault with two hinged eclipse drawers |
| 34 | Tranquilitic / Stillhour Carillon | +60% HP ~ +50% ATK ~ +40% DEF | After your Defense, the first direct enemy hit you survive grants +8 Gauge once; shield-absorbed hits qualify, damage-over-time does not. | Opal bell cage with three floating ivory tuning forks |
| 35 | Chaotic / Paradox Spindle | +60% ATK ~ +50% ED ~ +40% HP | After Last Flare, prime +15% outgoing damage for your first offensive activation once normal recovery ends. No bonus during that Last Flare, no recovery bypass. | Split-axis prismatic spindle through a broken geometric knot |

### Mechanic resolution requirements

Shared implementation rules:
- Each device can trigger only for its equipped living bearer. No automatic
  revival, extra free actions, infinite cooldown loops or automatic stage entry.
- AoE is one activation; once-per-activation effects do not multiply by targets.
  Trigger chains cannot recursively trigger themselves.
- Each named charge/mark has a cap, owner and consumption event. Enemy marks
  belong to their applying bearer, not a team-global stack. Marks clear when
  their enemy dies or the encounter ends. Bearer charges persist through
  Continue only if explicitly supported in the combat snapshot.
- Skill/charge bonuses are proposed as an additive outgoing-bonus bucket;
  keep stat modifiers separate. Test combined live/new Omnic equipment.
- Upgrade stat modifiers and penalties using the existing five-step 3.5x
  curve and rarity costs; mechanics/charge caps do not upgrade.
- Maintain eight ordinary slots, one name per character, maximum four Omnic,
  matching combat element, account-wide unlocks and no copy consumption.

## Phase 2 - Acquisition and balance approval

Status: **implemented and validated with the catalog batch**.

Machine acquisition retains the six current enemy families rather
than inventing more encounters. Rare/Legendary additions share existing tier
pools across stages1-100; Omnic joins its existing pool only at stages75-100.
All enemies in a tier's eligible range can drop its names, independent of
their own combat element. This makes every new Omnic element obtainable.

Preserve total tier odds: Rare8%, Legendary3.5%, Omnic1%, with independent
rolls and one equally chosen item per successful tier. Proposed larger pools
give Rare8%/15 and Legendary3.5%/15 per name; Omnic1%/20 =0.05% per name.
Do not retain hard-coded divisors5/5/10: live `machineConduitLoot` currently
has them, while `rollTier` uses actual pool length. Update both together when
implementing; glossary and reward validation must agree with the new pools.

**Common is Store-only, explicitly selected by the owner.** No Common machine
roll or machine probability. Keep original five Store prices. Developer-tuned
new prices: Prism Splinter Socket1600, Precision Escapement1800,
Fieldbrace Coupler1400, Reserve Torque Crank1500, Crosspin Governor1500
Prismatica. Critical precision has the strongest general offensive leverage;
hybrids charge a modest premium for breadth; Elemental Damage is conditional
on nonzero base ED. These are usefulness-based initial prices, not a guarantee
that every device benefits every character. Display effective stat deltas.
No sale conversion or new spending currency.

**Banner pool approval:** keep the existing five
Legendary banner bonuses at0.5% total rather than silently expanding them.
Machine and banner eligible pools must then be explicit instead of one shared
rarity filter. No new summon main outcomes or changed pity.

BMC/drop curves, stage count/levels, boss odds, captures and other activities
remain unchanged. No Conduit drop pity or extra clear grants proposed.

## Phase 3 - Broader character kit design

Status: **four bounded pilots implemented and validated; other kits unchanged**.

Existing combat already supports Burn, Weaken, shields, healing, crit bonuses
and outgoing attack boosts. More damage is not the default solution.
Design around character role/element, not stars alone; captured enemy kits
remain as defeated and are not automatically upgraded into EB kits.

First four pilots, implemented individually with developer-tuned rules:
- **Infernis (5-star):** an Ember Seal spender: controlled Burn application
  builds up to three personal seals; Skill 2 spends them for a short offensive
  benefit rather than merely increasing its damage coefficient.
- **Tizu (5-star):** shelter/undertow support: a surviving shield can prime one
  ally protection charge; Weaken remains a distinct enemy debuff.
- **Aurora (6-star):** two bounded Verdict Marks, followed by a skill spender
  offering a team precision buff. Marks are not permanent enemy stat reductions.
- **Bliss (6-star):** restorative charges: effective healing (not overheal)
  builds up to three, spent on a bounded team shield by an authored skill.

Before any kit ships, specify: trigger timing, living targets, owner, caps,
duration clock, refresh/stack rules, consumption, cooldown/Gauge interactions,
growth vs bounded potency, zero-base behavior, and encounter/Continue/replay
reset semantics. Elemental debuffs are authored statuses, **not automatic
element-match damage multipliers** or a new affinity system.

Share status/charge helpers with Conduits where semantics truly match; do not
implement the same effect twice under different names. Descriptions must derive
from actual effective values. Show meaningful stacks/durations in battle
reference/status UI and actual events, not decorative VFX alone.

Implement one pilot at a time, test with mixed/all-captured squads,
then expand. Preserve manual Continue, Last Flare recovery, event ordering,
per-kill saves and RNG independence. Do not rewrite the other live kits.

### Status display and icon contract

Every active enemy debuff belongs beside that enemy's HP, including Burn,
Weaken and owned marks. Burn counts enemy phases; Weaken counts attacks
(including boss ultimates), not player turns. Show actual strength and remaining
duration/stacks; distinguish owner-specific marks. Hide expired/dead-target
effects, retain them across Settings, and never infer effects from message text.
Use compact wrapping text badges until icons are delivered; no missing PNG URLs,
color-only identification, clipped long counts or added affinity multipliers.
Updates follow resolved effect events in presentation order; reduced motion
shows final resolved effects without animation.
[Status icon prompts](../Art/ui/Battle%20Status%20Icons.md) cover existing debuffs,
new marks/charges and supported Conduit statuses; generated art is not acceptance.

## Phase 4 - Universal action icon art

Status: **revised steel prompts ready; revised images not delivered**.
See [Universal Action Icons](../Art/ui/Universal%20Action%20Icons.md).
Normal Attack: one steel sword with a sweeping action arc.
Defense: one solid steel shield. Element-neutral metallic painted reflections,
not prismatic wings/crystal cores. No reference flags on these icons.
Earlier supplied Prismatic Winged Strike/Aegis images are archived concepts
pending separate intake, not the revised replacements; do not install them.

Keep installed character-specific Normal Attack/Defense images until both new
images arrive. The user authorizes their replacement/removal, not broken URLs
while assets are absent. Do not replace Passive, Skill1/2 or Last Flare icons.

## Phase 5 - Asset intake and implementation

Status: **runtime batches implemented; revised image delivery still pending**.

1. Archive both supplied originals byte-for-byte; review alpha/key/background
   and inner gaps independently. Export shared256px transparent icons with
   readable central silhouettes and clear margins. Never apply destructive
   keying to authoritative supplied alpha.
2. Add shared Normal Attack/Defense mapping in `presentation/ability-icon.ts`
   for every real Element-Bearer, including the elemental-war roster if live.
   Audit battle action controls/gesture guide and character ability panels.
   Keep labels/accessibility and captured creatures' missing skill slots.
3. Archive old runtime action icons before removing obsolete runtime copies;
   preserve historical originals, intake provenance and historical prompts.
   Remove live character-specific action mapping fields only after references
   and exporters/tests have migrated. No art asset URLs before files exist.
4. Implement approved Conduits/mechanics in separate reviewed batches:
   static Common/Rare, Legendary tradeoffs, then two Omnic elements per batch.
   Wire catalog/Archive/Inventory/equipment/upgrades/snapshots/rewards/loot
   receipts/glossary/save validation together. Pending Conduit art uses existing
   neutral handling, never another device's art.
5. Character pilots follow focused battle regressions and the phase3 rules.
   Save schemas change only if persistence is genuinely needed; loading never
   writes or grants new content.

## Phase 6 - Revised currency coin prompts

Status: **prompts ready; installed prism artwork unchanged**.
[Currencies](../Art/items/Currencies.md): Prismatica is a white coin that shimmers
with light; Null-Prismatica is a cracked black coin with red/white lightning.
Under the cutout contract shimmer uses crisp painted reflections and opaque
sparkle marks, lightning uses hard-edged solid zigzags without glow/spill.
No item style references. Keep internal currency/save keys, balances, costs,
eligible income and all existing atomic transactions unchanged. Preserve old
prism sources/exports until reviewed replacement delivery.

## Validation and acceptance gates

- Verify35 additions, no duplicate IDs/names/stat-pair roles, exact5/10/10/10
  distribution and all ten distinct Omnic elements. Compare with live25.
- Check base/+5 modifiers and growing Legendary penalties, CR cap and zeros,
  Omnic equipment/protection rules and all existing-save compatibility.
- Sum live loot rows to their tier totals at stages1/74/75/100; exercise boss/
  ordinary drops, independent RNG, banner exclusion, atomic reward receipts
  and overflow/failed-write rejection.
- Every mechanic: exact trigger and cap, AoE once semantics, multi-device
  interactions, dead target handling, shields, cooldowns, support vs offense,
  recovery, Continue/replay/Settings and ordered reward events.
- Universal icons: all actual roster IDs resolve the same two files, all
  existing non-action icons remain unchanged, no old runtime references or
  missing requests, base-aware URLs,44px controls and reduced-motion behavior.
- Art prompts: `python -m unittest discover -s tools -p test_universal_action_prompts.py`
  and `python -m unittest discover -s tools -p test_art_prompts.py`.
  Generated PNGs still require visual review; passing prose tests is not art intake.
- Runtime batches use existing focused Vitest tests and `npm run build`;
  this planning/prompt phase does not require a runtime build.

**Remaining art prerequisites:** supply revised steel action icons, both coin
images, new Conduit/status art; review every source before URLs/replacements.
No additional acquisition choice is required: Common is Store-only and new
Legendary entries are excluded from banner bonuses. Implement/test runtime
batches before recording them as completed in the handoff.
