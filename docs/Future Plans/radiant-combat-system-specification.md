# Radiant combat overhaul: system and starter review specification

## Owner revision: layered charge and shared Eternal readiness (2026-11-08)

**This section supersedes conflicting draft rules below**, especially
single-current-tier availability, temporary Ascendancy, third personal layer,
four-round timeout, personal reset on activation and finite/capped Shields.
The consolidated lower sections must be rewritten before implementation; no
old contradictory formula should become production behavior.

### Confirmed charge architecture

- Glowing Flare uses the first personal layer in the bearer's elemental color.
- Equivalent saved form4 unlocks Lustrous Flare and a second personal layer,
  visibly white-and-elemental, building over the first. Glowing remains castable
  while the second layer is incomplete.
- Each bearer has base personal cost `C`. Glowing is ready at `C`, Lustrous at
  `2C`. Maximum personal storage is `C` before form4 and `2C` afterward.
- **There is no third personal bar or3C threshold.** Eternal's third bar is the
  shared team **Overcharge Radiant Flare meter** (owner wording; final display
  terminology can be reviewed).
- The team meter starts building and appears only when the equipped frozen
  squad contains at least one final-form bearer. Ordinary final gate is Evo.6;
  Calamitic uses equivalent saved final form, despite displayed Evo.7.
- Only final-form bearers can cast **Eternal Radiant Flare**. It is ready when
  that bearer has both personal layers full AND the shared team meter is full.
- Automatically offer the **highest ready tier**; no manual lower-tier selector
  once a higher eligible tier is ready. Evo.4-5 cannot cast Eternal, even with
  a full team meter.
- Glowing spends `C`; Lustrous and Eternal spend `2C`. Keep unspent personal
  charge. At `1.5C`, Glowing leaves `0.5C`; full Lustrous/Eternal empties the two
  personal layers. Generic cast refunds remain separately specified.
- One Eternal cast consumes the shared meter atomically for the squad.
  Other members keep all their unspent personal charge and immediately lose
  Eternal readiness until the shared bar refills. Each must still have full
  personal layers when attempting the next Eternal cast.
- No separate activation, empty/refill mode, four-round expiry, timed empowered
  state or forced next-turn recovery. A full shared meter waits until used.
  Later-use shared fill escalation was selected earlier; exact threshold/cap
  remains a proposed reviewed formula, not an additional activation system.

The bearer/squad eligibility uses the frozen run loadout, not menu equipment
read mid-battle. Starting a run without final-form members creates no hidden
charge accumulation for future use. Settings/Continue preserve legal charge;
new entry/Retry reset follows the reviewed run policy.

**Readiness table** (`P` personal points, `S` shared readiness):

| Bearer form | Condition | Offered Flare |
| --- | --- | --- |
|1-3 |`P < C` |None |
|1-3 |`P >= C` |Glowing |
|4-5 |`C <= P < 2C` |Glowing |
|4-5 |`P >= 2C` |Lustrous |
|6 |`C <= P < 2C` |Glowing |
|6 |`P >= 2C`, shared not full |Lustrous |
|6 |`P >= 2C`, shared full |Eternal Radiant |

All forms remain below Glowing readiness at `P<C`. Personal overflow caps at
the unlocked maximum. Shared fullness cannot bypass a partially filled personal
bar. Authority validates/spends both ledgers in one action; stale client
readiness cannot authorize a second Eternal from the consumed team meter.

### Abilities and presentation

The tiers are direct enhancements of one signature, preserving its core
purpose. New targeting or utility must support that progression rather than
act as three unrelated skills. Old abilities can be entirely replaced or
folded into new passive/leader effects per character: do not force preservation
of Skill1/Skill2/Last Flare designs where a new kit works better.
Owned progression is not silently deleted; exact Imbue conversion remains a
reviewed mapping, not the earlier suggested automatic old-skill-to-tier match.

Expose tier/category names, exact current effect and cost. Render the two
personal layers in the same portrait Gauge footprint with unambiguous numbers
and accessible tier readiness. Team bar appears below the squad only when
eligible. White/elemental overcharge is a presentation cue, not another element.
Finite readiness glints/static Reduce motion states distinguish Glowing,
Lustrous and Eternal without hiding portraits or depending on color alone.
Actual spend/gains remain ordered at impact; no cosmetic-hit resource grants.

### Other confirmed changes

- **Keep current unlimited Shield stacking until broken**, balancing new
  offers. The draft50%-HP total cap and forced finite native refresh are rejected.
  Do not silently change owner/layer provenance, absorb order or authored expiry.
- **Remove random critical damage** and explicitly map related gear to
  deterministic effects in the four-core-stat model.
- Owner delegates per-character old-skill replacement/folding into passive,
  leader or Flare; this is not a mandate to preserve every previous skill.

### Numeric draft corrections required

Replace starter60/70/80-style separate tier costs with one base `C` per bearer.
Proposed review candidates: Infernis `C=30`, Tizu `C=25`, Flora `C=20`, giving
Lustrous/Eternal personal thresholds60/50/40 respectively. These numbers are
**proposals**, not owner-approved tuning. The earlier charge gains would fill
these rapidly; benchmark guaranteed/bonus cadence and revise coherently.

Rewrite Tizu's Flare Shield offers without the rejected cap. Align Infernis
and Flora tier targeting/effects as direct upgrades, then review output at
their new repeat cadence. The earlier exact starter tables are not approved
just because the resource architecture is now settled.

Required tests: readiness for each form/threshold; partial-overcharge spend;
shared gating with no eligible bearer, one/two eligible bearers and a full
meter; first Eternal disabling only shared readiness of others; two consecutive
attempts under stale revisions; no personal charge theft from other members;
buff/Shield/crit remaps; exact visual layers at charge/impact/Skip/Reduce motion.

## Status, precedence and scope

Draft2026-11-08. **Proposed exact specification for owner review, not implemented
mechanics or measured balance.** This is the next deliverable from the
[audit and owner decisions](character-combat-refresh-audit.md), not approval to
start the public overhaul. The owner requested approval of exact systems and
starter kits before implementation, followed by reviewed roster batches.

The latest Master-selected Equinox/subtype decision supersedes the audit's
older fixed innate/cosmetic subtype proposals. This document consolidates the
selected architecture instead of adding another system on top.

**Confirmed requirements:** four core stats; one passive, one first-member
leader ability and one current evolved Flare; Normal Attack/Defense retained;
bearer-only playable squads; Master-driven stat subtypes; two-step shared/
personal final Flare charge; four-round deadline; increasing later shared
costs; no forced recovery; hybrid guaranteed/capped random charge; actual
damage-budget currency; portrait-strip battle controls; impact-timed Gauge;
stronger finite accessible VFX. General menu redesign remains paused.

**Everything numerical below is a starting proposal.** Source inspection is
not a simulation, player test or clear-rate guarantee. All roster/gear values
must be reviewed before publication, not inferred from starter results.

## 1. Player-facing vocabulary

| Plain function | Proposed system wording | Usage |
| --- | --- | --- |
| Passive Ability | Radiant Signature | Both plain label and personal ability name remain visible. |
| Leader Ability | Luminary Covenant | One first-member benefit; not every member's passive. |
| Personal charge | Lustre Gauge | Exact current/required values, normalized visual fill. |
| Shared charge | Concord Gauge | One bar beneath the squad portraits. |
| Temporary final-Flare preparation | Radiant Ascendancy | Explicitly temporary; separate from permanent Stat Ascension. |
| Equipped Master profile | Attunement | Equinox, Corona, Aegis, Solstice or Prism. |
| Visual charge packets | Lustre Motes | Represents accepted mechanical charge; not collectibles to click. |
| First Flare category | Glowing Flare | Owner-selected. |
| Second Flare category | Lustrous Flare | Owner-selected. |
| Final Flare category | Eternal Radiant Flare | Owner-selected. |

Plain words HP, Attack, Defense, Recovery, Shield, Burn and Weaken stay literal.
All exact ability names below are original proposals. Tier names identify
categories; character-specific names share a progression family.
No new light combat element, random Type, paid reroll, battle item or affinity
damage advantage. Existing six elements and artwork retain their identities.

## 2. Four-stat model

### Definitions and proposed growth

Let `L` be saved level, `e` the saved six-form evolution index and
`G = 1 + 0.15L + 1.5(e - 1)`. Preserve the current linear growth foundation.
Calamitic displayed Evo.2-7 uses the same internal1-6 index.

| Stat | Meaning | Proposed unequipped growth |
| --- | --- | --- |
| HP | Maximum Health; no resurrection through stat changes | `baseHP * G` |
| Attack | Source magnitude for direct offensive attacks and authored Burn | `baseAttack * G` |
| Defense | Diminishing direct-hit mitigation and defensive ability scaling | `baseDefense * G^0.7` |
| Recovery | Source magnitude of authored healing delivered | `baseRecovery * G` |

Recovery is a **source stat**, not a multiplier on healing received. A skill
heals its coefficient times the caster's Recovery; cap at each living target's
missing HP. It does not create automatic regeneration or healing from pickups.
Fixed fractional maxHP heals in enemy mechanics retain their authored formula
until individually reviewed. Enemy self-healing does not require a new generic
Recovery curve simply because player stats change.

Proposed starter base values:

| Bearer | HP | Attack | Defense | Recovery |
| --- | --- | --- | --- | --- |
| Infernis |240 |60 |16 |28 |
| Tizu |300 |44 |22 |34 |
| Flora |220 |46 |14 |65 |

These are **new authored proposals**, not claims that old effective stats equal
these numbers. Old Attacker/Tank/Support stat bonuses and automatic role healing/
target weighting are removed from the proposed model. Defense/Recovery specials
come from explicit passive/leader/Flare contracts. Old native self-stat bonuses
are individually mapped, not inherited unnoticed.

At Lv.30/form1, `G=5.5`: Infernis HP1320/Attack330/Recovery154,
Tizu HP1650/Attack242/Recovery187, Flora HP1210/Attack253/Recovery357.5.
Defense remains fractional using `G^0.7`. This example is arithmetic, not proof
of surviving the current Lv.30 infusion encounters.

### Stat ordering and rounding

For each stat, define grown base `B`, owned compatible ordinary flat additions
`F`, additive ordinary percentage pool `O`, selected subtype multiplier `T`
and permanent stat-Ascension multiplier `A` (1 or1.5):

`permanentStat = (B + F) * (1 + O) * T * A`.

Existing weapon ranks retain their documented Attack-only contribution and
disabled spending. Place `0.02 * weaponRank` in the ordinary Attack percentage
pool; do not lose saved ranks or introduce weapon purchases.

Battle-only unconditional leader percentages and one strongest temporary stat
buff per stat apply to the permanent value in a **single additive battle pool**.
Debuffs use their separately bounded reduction. Conditional gear modifiers must
declare whether they affect stats, action output, mitigation or target
vulnerability; never ambiguously scale both the Attack stat and its packet.
No implicit multiplicative chain between multiple wearers' ordinary stat auras.

Maintain fractional stats throughout. Round once at actual damage/healing/
Shield grant boundaries; UI formatting never feeds calculations.
Reject invalid/overflow/nonfinite values explicitly. Subtype penalties do not
allow negative stats; proposed subtype multipliers below are strictly positive.

### Direct damage and defensive action

Preserve diminishing mitigation:

`damage = round(coefficient * A * A / (A + effectiveDefense) * outputModifiers)`.

`A` is the relevant source Attack, not coefficient-scaled Attack inside the
ratio. Defense ignore reduces effectiveDefense before the ratio, with a
proposed total pierce cap75%. Positive real direct impacts retain floor1.
Burn bypasses Defense but respects explicitly authored periodic mitigation;
shields/guard and damage-origin behavior must remain specified per packet.

Proposed Normal Attack is one mechanical direct hit at100% Attack. Animation
may depict extra trails but does not create additional impacts/charge rolls.
Defense consumes the bearer's ordinary action and reduces its incoming direct
damage by50% through the ensuing enemy phase. It gives no free extra action.
It does not reduce Burn or redirected loss unless explicitly stated.
Existing critical behavior is not silently inherited: see section10's review
gate for mapping old critical investments into four-stat-compatible effects.
Pilot baseline direct attacks have **no random critical multiplier** pending
that mapping; random bonus charge remains independent.

## 3. Master attunements

No equipped Master = **Equinox**. One compatible owned Master declares exactly
one profile plus one personal ability enhancement. No additional generic Master
stat package, aura, second profile, implicit role bonus or consumable.

| Attunement | Proposed permanent multipliers |
| --- | --- |
| Equinox |HP1 /Attack1 /Defense1 /Recovery1 |
| Corona |Attack1.25 /HP0.90; other stats1 |
| Aegis |Defense1.35 /Attack0.90; other stats1 |
| Solstice |HP1.25 /Attack0.90; other stats1 |
| Prism |Recovery1.30 /Defense0.90; other stats1 |

Numbers are review candidates; do not treat different stats as equal economic
value. Equinox is a functional baseline, not deliberately crippled to sell gear.
No Master is necessary for solo starter healing, survivability or basic offense.
Not every bearer needs every profile among its existing three Masters.

Use **"Attunes Tizu to Aegis. +35% Defense; -10% Attack."**, followed by the exact
personal enhancement. Subtype changes affect statistics, not element, rarity,
owned character identity or permanent evolution.

Switching/removing gear recomputes from base, never from modified stats. Save
once before selection feedback. Frozen encounter loadouts retain the subtype,
Master and selected enhancement throughout Settings/Continue, including after
a menu gear change. Owned unequipped Masters contribute nothing.

## 4. Personal charge and ordinary Flare rules

Personal charge uses points, not a growing hidden stat. Each bearer has a
documented required charge for its current Flare. Form progression can change
the requirement; the display shows exact current/required values.

### Guaranteed charge

| Accepted event | Personal charge |
| --- | --- |
| Normal Attack causing positive Health loss or Shield absorption |20 to actor, once per action |
| Defense |10 to actor |
| Round completion |5 to each living bearer after the enemy phase |
| Enemy direct attack causing Health loss or Shield absorption |8 to recipient, once per enemy action, not per packet |
| Ordinary Flare use |No generic personal refund; specific reviewed effects only |

Support Flare users receive round/defensive charge without having to fabricate
damage. Passive/Master/ordinary-gear grants declare their own bounded trigger.
No grant from clicking, animation contacts, overkill, corpse targets or
replayed events. Round grants occur only after a completed enemy phase, not
after ending a modal or revisiting Settings.

### Random bonus motes

For a qualifying manually initiated offensive action, roll independently for
each **actual direct hit** with positive Health loss/Shield absorption:
25% chance of +5 personal points to the attacker, with at most **two rolls and
two successful bonuses per action**. Total generic random bonus is at most10.
Normal has one eligible hit. For AoE, consider targets in stable field order
and only the first two qualifying target impacts. This deliberately caps AoE.

Burn, generated retaliation, detonation/follow-up packets and healed Health
alone do not roll. Such effects can still have explicit guaranteed charge
effects if a reviewed kit says so. One dedicated persisted bonus-charge seed
is separate from combat/reward/capture/encounter seeds. Full Gauge still consumes
the same eligible rolls; received charge caps honestly rather than changing
future RNG because of gear or current bar fullness.

When accepted as a full combat operation, all rolls, spend and gains advance
once with the action. Save failure advances none. No new server operation per
visual mote. Tests must verify exact count/order, not probability on five seeds.

### Spending and cast access

Ordinary forms1-5 cast their current Glowing/Lustrous Flare when the personal
bar is full. Consume the current required amount, then resolve authored effects.
No other selectable lower-tier Flare. No next-turn recovery and no cooldown
unless an exact later character specification requests a bounded exception.

For form6, **Eternal Radiant Flare requires temporary Radiant Ascendancy** as
well as full personal charge. Outside that mode, this draft gives final-form
bearers Normal Attack/Defense but no ordinary lower-tier Flare. This is the
strict reading of "only current tier" plus two-step final charge, and a major
progression-risk gate: it must be explicitly approved or revised before coding.
See section12; do not conceal a possible loss of support utility at evolution.

## 5. Shared Concord charge and final empowerment

Shared charge starts0 on new activity entry. Proposed first activation requires
100 points; activation `n` (zero-based previous activation count) requires
`100 + 25 * min(n, 4)`, capped200. Display actual points/threshold, not "100%"
when the real requirement has changed.

### Shared guaranteed contributions

Freeze squad normalization `N` to the encounter's starting bearer count1-3;
death cannot shrink the denominator for faster filling:

- Qualifying Normal Attack or Defense: `6/N` shared points per bearer action.
- Successful ordinary Glowing/Lustrous Flare: `12/N` shared points.
- Completed enemy phase:18 shared points if the encounter continues and at
  least one bearer lives.
- No generic additional shared gain from random bonus motes, extra hit count,
  Burn ticks, taking damage or generated effects.

Store exact sixth-point units for these increments (1/2/3-member divisors fit)
and format display separately. Reviewed named fill effects express exact shared
points; fractional effects need a defined representation before approval.
Do not use floating point equality for affordability.
Base all-Normal rounds earn24 shared points regardless of solo/duo/trio.
Four such rounds earn96; a fifth provides activation opportunity. Flare rounds
can reach readiness sooner. No claim that this timing is measured enjoyable.

### Activation state machine

1. In a legal player phase, shared charge is full and a living final-form
   bearer has not already acted. Choose **Prepare Eternal Radiant Flare** with
   button/keyboard support; gesture may be an additional shortcut.
2. One explicit confirmation warns that personal charge resets and the
   four-round deadline begins. No browser confirm or implicit gesture spend.
3. Consume the required shared points; cap prevents accumulated surplus.
   Increment activation count **even if the mode later expires**.
4. Set the chosen bearer's personal charge to0 and mark it empowered.
   Activation itself is a once-per-round strategic command, not its attack:
   that bearer can Normal Attack/Defense during the same round to refill.
5. Only **one empowered bearer squad-wide** at a time. Shared charge can
   continue accumulating, but cannot buy another mode until this one ends.
6. Cast its Eternal Radiant Flare when the personal bar is full, consuming
   that full bar and its ordinary action. Clear the mode after the cast.

If activated during round `r`, the valid casting rounds are `r,r+1,r+2,r+3`.
Expire after the enemy phase of `r+3`, not before the final player action.
Entering at the end of a turn is disallowed; UI states the final casting round.
No timer pauses because the bearer cannot act. Settings does not advance it.
Successful cast, empowered bearer defeat or window expiry ends the mode.
On expiry, **retain earned personal charge**, but it does not permit an
unempowered final Flare; no charge/shared-cost refund.

Proposed entry/reset policy: shared/personal charge and activation count carry
through Continue within the same activity run; timed empowerment ends at each
encounter boundary. No additional refill on Continue. Retry/new entry resets
all charge/counters; saved loot is untouched. Pending battle outcomes must not
grant a round fill after all enemies die. In-progress mode snapshots survive
Settings exactly. Final replay is a new run.

### Team viability issue to test

Solo final-form bearers can earn guaranteed personal points from Normal/
Defense/round completion inside the four-round window. Tizu's proposed passive
can help while protecting himself. But **all-final-form support squads lose
ordinary healing access outside empowerment** under this strict draft.
Run comparisons before accepting that cost of the single-current-tier model;
not solved by stronger particles, a shorter timer or silently retaining Skill2.

## 6. Common effects, clocks and stacking

- One ordinary action per living bearer per player round; no action from
  expired/defeated targets. No character automatically skips the next player
  round after casting.
- "For two enemy phases" counts the next two enemy phases after application,
  including the upcoming phase. "Next round start" means before choosing
  player actions, after expiry/defeat bookkeeping.
- Beneficial stat buffs of the same stat never add together. Keep a nondominated
  source ledger and apply only the strongest living/valid effect; a weaker
  longer buff may become active after the stronger one expires. Recasting the
  same source refreshes its clock but never weakens it. This avoids weak buffs
  erasing strong ones without losing genuine durations.
- Fixed leader effect exists only while that saved first bearer lives.
  No promoted leader. HP increases never heal; losing a maxHP effect clamps
  current HP to the lower maximum and does not revive or inflict a damage event.
- General direct damage reduction: strongest named reduction, plus separate
  Defense action reduction multiplicatively; proposed total reduction cap80%.
  Explicit invulnerability/lethal-protection exceptions need separate review.
- New native Shields: one layer per source bearer per target; refresh to
  `max(remaining, newOffer)`, not unlimited additive recasts. Finite source clocks.
  Different sources remain identifiable, consumed in earliest-expiry order
  then stable source-ID order. Propose a total shield cap of50% recipient maxHP.
  A capped-out refresh cannot delete an existing layer. This intentionally
  changes the old unbounded stacking contract and needs approval.
- Burn: one application per source bearer per enemy; refresh duration and keep
  stronger snapshot, no same-source additive stack. Independent sources remain.
  Triggered damage never counts as another player Attack Action.
- Weaken: strongest active reduction, no additive weakening; retain independent
  source/expiry provenance. Cleanse acts on actual debuffs, not display strings.
- Healing cannot revive. Shield generation is not healing, damage absorption
  or charge entitlement. No recursion from role effects: the hidden old generic
  Support heal/target-role weighting is removed.

## 7. Exact starter kit proposals

The following replaces, not appends to, current counters/skills. Targets/costs
and numbers are proposals; current authored art and stable bearer IDs remain.

### Infernis — offensive Burn and controlled ignition

**Radiant Signature — Banked Cinder**

When Infernis's Normal Attack deals direct Health damage to an enemy already
Burning from Infernis, deal an extra periodic-origin packet equal to10% of her
Attack. Once per Normal action; no charge rolls or new Burn application from
this packet. Shields alone do not satisfy the Health-damage condition.

**Luminary Covenant — Hearthbound Oath**

While Infernis is the living leader, all living squad members gain15% Attack.
Works on Infernis alone. No additional crit, elemental advantage or Burn aura.

| Category / exact proposed name | Personal cost | Effect |
| --- | --- | --- |
| Glowing Flare: Cinderwake |60 |Deal240% Attack to one enemy. Apply Burn dealing15% caster Attack after each of the next two enemy phases. |
| Lustrous Flare: Cinderwake Ascendant |70 |Deal260% Attack to all enemies. Apply20%-Attack Burn for two enemy phases to survivors. |
| Eternal Radiant Flare: Cinderwake Everlasting |80 while empowered |Before the direct strike, spend Infernis's existing Burn on each enemy for one periodic packet equal to its remaining scheduled damage. Then deal600% Attack to all enemies and apply25%-Attack Burn for three enemy phases to survivors. |

Detonation uses the existing Burn's snapshot and remaining phases; never adds
the freshly applied Burn. Direct and periodic packets have separate damage
events and real currency attribution, but only primary direct impacts roll
bonus motes. Dead enemies receive no new application.

### Tizu — barrier protection and safe counter-pressure

**Radiant Signature — Tideglass Return**

When Tizu's native Shield fully absorbs an enemy's direct attack against a
living ally, grant Tizu8 personal charge, once per enemy action and at most
once per enemy phase. A mixed shield-owner full block does not qualify; no
refund from merely granting or refreshing a Shield.

**Luminary Covenant — Harbor Covenant**

While Tizu is the living leader, all living squad members gain20% Defense.
No hidden role target weight; an explicit taunt would require its own kit clause.

| Category / exact proposed name | Personal cost | Effect |
| --- | --- | --- |
| Glowing Flare: Tideglass Shelter |50 |Shield each living ally for `1.8 * caster Defense + 12% recipient maxHP` through the next two enemy phases. |
| Lustrous Flare: Tideglass Dominion |60 |Shield each living ally for `2.4 * caster Defense + 16% recipient maxHP` through two enemy phases; reduce their incoming direct damage by20% during the next enemy phase. |
| Eternal Radiant Flare: Tideglass Eternity |70 while empowered |Shield each living ally for `3 * caster Defense + 22% recipient maxHP` through three enemy phases; reduce incoming direct damage by40% during the next two enemy phases. |

Tizu's signature has no fabricated offensive hit. Solo targeting includes self.
Shield cap and refresh rules still apply; no full-bar victory through repeated
uncapped shields. Incoming-hit grants and native block grants are separate
explicit events, even if both occur in the same enemy action.

### Flora — immediate recovery and visible delayed renewal

**Radiant Signature — Dawnseed**

After Flora's Normal Attack deals direct Health damage, plant one Seed on the
living ally with the largest missing-HP fraction (ties in saved squad order).
At the next player-round start, heal it for15% Flora's Recovery, using the
planting snapshot. One pending Seed per Flora per target; refresh never stacks.
Do not plant if all allies have full HP. Flora can receive her own Seed.

**Luminary Covenant — Garden Covenant**

While Flora is the living leader, all living squad members gain15% Recovery.
No automatic4%-HP role heal or unrelated Attack aura.

| Category / exact proposed name | Personal cost | Effect |
| --- | --- | --- |
| Glowing Flare: Dawnseed Renewal |40 |Heal each living ally for80% caster Recovery. Grant Renewal healing15% snapshot Recovery at each of the next two player-round starts. |
| Lustrous Flare: Dawnseed Flourishing |50 |Heal each living ally for110% caster Recovery. Grant Renewal healing20% snapshot Recovery at each of the next two player-round starts. |
| Eternal Radiant Flare: Dawnseed Perennial |60 while empowered |Heal each living ally for180% caster Recovery. Remove its strongest active Weaken effect, then grant Renewal healing30% snapshot Recovery at each of the next three player-round starts. |

Seed and Renewal are distinct sourced packets, not extra counters to collect.
Same-source Renewal refreshes duration and preserves the stronger remaining
snapshot; different casters never trigger each other's passives.
Full-HP casts remain legal but show expected effective healing0; there is no
fictional gain charge from wasted healing. No revive, Burn cleanse or hidden
Shield grant unless a reviewed Master explicitly supplies it.

### Proposed Ascension/Imbue consolidation

Permanent Stat Ascension retains its existing saved eligibility,25-Shard cost,
1.5 stat multiplier and Lv.115 cap.

Propose one new **Flare Imbue** with **three increments**, each25 Shards and each
adding10% of authored Flare numeric magnitude (maximum+30%, additive).
Existing saved Skill1/Skill2/Last Flare Imbue booleans each map to one increment,
preserving paid step count without creating free duplicate unlocks.
This does **not** preserve old numeric benefit; owner delegated effect redesign.
Keep historical flags readable/idempotently mappable, with a versioned save on
the next successful transaction only. Never spend shards during conversion.

The +10% per increment applies to authored damage/healing/Shield offers, not
durations, targets, costs, resource bonuses, mitigation percentages or source
conditions. It scales authored new Burn offers, not already-snapshotted Burn
detonation. A single increment applies across current Flare versions if somehow
valid progress changes; Imbue eligibility remains after Stat Ascension.
Proposed stable UI label is **Flare Imbue1/3**, not a new fourth Flare tier.

## 8. Nine starter Master remaps

Keep current IDs/names/art/ownership and matching-bearer one-slot restrictions.
Replace old stats/effects; no automatic chest reward or equip.
Each enhancement below works across the current Flare family unless stated.

| Stable ID / existing name | Attunement | One proposed personal enhancement |
| --- | --- | --- |
| `master-ember-1` Helios Pyre Cathedral |Corona |Infernis's Flare applies Burn for one additional enemy phase; new Burn application only. |
| `master-ember-2` Cinderstar Genesis Engine |Corona |Increase Infernis's Flare primary direct damage by15%; not Burn, detonation or generated damage. |
| `master-ember-3` Unbroken Sunforge Throne |Solstice |After Infernis's Flare, Shield herself for12% own maxHP through the next two enemy phases. |
| `master-tide-1` Abyssal Shelter Observatory |Aegis |Increase Tizu's Flare Shield offer by15% before rounding/caps. |
| `master-tide-2` Ocean Memory Worldpump |Solstice |Tizu's Flare Shields last one additional enemy phase; reductions do not gain duration. |
| `master-tide-3` Undertow Sovereign Harpoon |Corona |After Tizu's Flare, strike one selected living enemy for120% Attack as a generated packet; no bonus-charge roll. A valid selected enemy is required at confirmation. |
| `master-sprout-1` Worldseed Mercy Foundry |Prism |Increase Flora's Flare immediate healing by15%; not Seed or Renewal. |
| `master-sprout-2` Briar Constellation Loom |Corona |After Flora's Flare, strike one selected living enemy for100% Attack as a generated packet; no bonus-charge roll. |
| `master-sprout-3` Evergreen Continuance Crucible |Solstice |Flora's Flare Renewal lasts one additional player-round start; no additional Seed or revive. |

No four-role taxonomy is revived through these effects. A Tizu Corona build
trades weaker Normal damage protection stats for explicit offense; Flora
Corona trades HP for an offensive Master payoff without pretending to be a
primary attacker. Profile balance and overlap require tests, not naming alone.
Generated offensive effects can release remaining enemy currency based on real
HP loss, but do not grant generic action/shared charge or recursively proc.

Tooltip example:

> **Abyssal Shelter Observatory**
>
> Attunes Tizu to **Aegis**. +35% Defense; -10% Attack.
>
> **Tideglass Flares:** increase their Shield amount by15%. Existing Shield
> refresh rules and the total cap still apply.

Modifier order: authored offer plus separately listed flat additions, then
additive action magnitude increases (Master15% + Imbue increments), then
round/cap. Do not multiply Master15% by Imbue30% as an unexplained1.495 bonus.

## 9. Battle layout and motion specification

Reuse current arena/scenery and portrait-facing metadata; no new character art
or global menu mock-up rollout.

- Arena occupies the upper field. Beneath it: up to three character portraits,
  each with name, HP, current/required personal Gauge, Attunement and a compact
  status row. One Concord bar below the portraits.
- Selecting a portrait exposes Normal Attack, Defense and its current Flare
  as text controls. Show actual target/cost/readiness and empowerment deadline.
  Disabled actions provide an accessible reason, not just dim opacity.
- Empowerment is a separate strategic command with explicit confirmation.
  No swipe-only action; support keyboard, pointer and touch with44px targets.
- Status effects remain sourced/typed in state. Group repeated icons visually
  with exact counts/durations; full details accessible by tap/focus.
- Portrait frames change readiness by outline/status text plus animation, not
  color alone. Equinox is visibly a valid default.
- Accepted action presentation begins from the pre-action HP/Gauge ledger.
  Resolve actual gains/spend/impacts in order, not end-of-sequence snapping.
  Bar easing never changes action availability. Skip renders the exact final
  state; no repeated charge on reopen/Settings.

Proposed base maximum durations: Normal900ms, Glowing1800ms, Lustrous2400ms,
Eternal3200ms including any cut-in. Existing1x/2x/3x scales presentation only.
Do not add a cut-in outside that budget as a second uncounted delay.
Reduced motion uses a brief150-250ms readable transition/static result, no
flashes, traveling motes or forced camera shake.

| Bearer | Glowing | Lustrous | Eternal |
| --- | --- | --- | --- |
| Infernis |Curved emberblade trail and one sharp ignition |Layered flame crescents with structured radial impact |A greatsword-shaped solar furnace geometry; old Burn gathers inward, then a clearly timed outward crimson rupture |
| Tizu |Spear-drawn tidal rim, transparent protective field |Interlocking pressure arcs and refractive barrier ripples |An immense layered tideglass vault; two readable protective wavefronts, not a fake damage explosion |
| Flora |Seed filaments opening into healing petals |Branching botanical prism lattice and ordered renewal motes |A broad root-and-petal canopy, cascading recovery waves and a settled living constellation |

Shader candidates: thresholded bloom, bounded light rays, local UV distortion
and refraction. Share rendering lifecycle/materials before adding another
canvas/renderer. Keep text/HP/portraits above bloom and do not distort controls.
Fall back to precomposed gradients/trails without claiming missing GPU effects
ran. No full-screen strobe, lasting whiteout or animation-driven reward RNG.
Intensity grows through distinct geometry/composition, not only particle count.

Profile on a declared mid-range machine: target60fps; record actual frame-time
distribution, repeat-cast memory and quality settings. Set measured GPU/particle
budgets during implementation; do not promise a number based on this prose.

## 10. Full-roster and equipment conversion work

This starter table is not a complete114-Master or ordinary-Conduit mapping.
Publication requires every released bearer and owned compatible equipment entry
to have reviewed effects in the four-stat/single-Flare model.

| Old surface | Proposed mapping direction / required review |
| --- | --- |
| Health/Attack/Defense bonuses |Retain IDs/upgrades; review values against new base curves, additive pools and subtype multipliers. |
| Skill Power |Convert per effect to Recovery, explicit Flare damage or explicit Shield magnitude; never a hidden generic fifth stat. |
| Critical Rate/Multiplier |Replace gear effects with reviewed deterministic offensive bonuses; preserve historical identity where practical. Specify any retained critical event mechanic separately before implementation. |
| Skill Duration |Explicit bounded status-duration enhancement or another reviewed effect; no global unbounded stat. |
| Skill Efficiency |Exact personal charge requirement reduction, proposed floor60% of base cost; review refund loops. |
| Gauge Capacity |Remove capacity as growing core stat; convert to personal charge gain/storage effect explicitly. Fixed required-bar rules must remain coherent. |
| Gauge Gain |Reviewed charge grants/rate modifiers with explicit source eligibility, cap, integer representation and rounded boundaries. |
| Old personal counters |One passive/Flare hook; alternating-two-skill characters require a new legal Normal/Flare pattern, not impossible prerequisites. |
|114 Masters |Each selects one reviewed subtype plus one personal ability effect; hidden seasonal entries remain hidden. |
| Role stats/targeting/healing |Removed from new model; meaningful behavior belongs in explicit passive/leader/Flare entries. |
| Existing three Imbues |Proposed three paid increments of one Flare Imbue; see section7. |
| Captured teams/gear |Retain copies/locks/fodder; invalidate playable captured slots. No auto-replacement. Require manual valid bearer squad before entry. |

No live batch can leave unaffected gear referencing retired actions/stats.
Either keep a coherent old ruleset for the whole production run until full
conversion is ready, or implement an isolated non-account prototype. Do not
mix three new starters with old combat assumptions in an unversioned live engine.

Captured inventory/lock/sale/fodder and existing recipes stay unchanged. Remove
captured equipment controls and battle selection, not historical ownership.
Legacy invalid squads display an explicit selection-required status; read does
not write or auto-fill. The first confirmed valid squad/equipment transaction
normalizes illegal captured assignments, preserving owned unlocks/upgrades.
Server rejects captured combat entries even if an old client bypasses the UI.
Replaced old runs preserve frozen bearer investment metadata and saved rewards,
but cannot resume a now-ineligible captured formation; require explicit selection
for a new run. Never restart an all-captured run with an invented starter.

## 11. Economy, authority and acceptance tests

### Actual damage-based currency

Keep current per-enemy currency distributions and mode exceptions. Resolve
budget once on encounter initialization in the versioned authority. Track
lowest Health reached and already-paid amount. For budget `B`, starting maxHP
`H` and lowest actual Health `L`, earned total is
`floor(B * (H - L) / H)` with exact safe arithmetic.
New reward = earned total minus already paid; defeat releases remainder.

Healing, Shields, overkill, cosmetic hits and repeated depletion cannot mint
more than `B`. Authored maxHP transforms must preserve an explicit budget
baseline; no reset on phase transition. Periodic/generated HP loss counts
without charge-roll eligibility. Already-saved partial gains survive loss/quit.
Kill-only materials/premiums/captures/discovery/bonuses stay kill-only.
Remove already-paid currency from the kill receipt, not from existing balances.

Each accepted action commits state, charges/seeds, currency, discoveries/kill
rewards and receipt once through shared atomic foundations. No client pickup
transaction, reroll on duplicate request or claim before successful persistence.
Denied writes restore pre-action state and show the standard failure status.
Versioned source rolls occur earlier than today; describe that change honestly.

### Verification matrix before any release

1. Exact stat arithmetic, subtype switching/removal, Ascension/Imbue mapping,
   old weapon ranks and all conversion IDs.
2. Personal/shared charge:1/2/3-member normalization, stable hit order,
   full-bar RNG advancement, capped AoE, no periodic/generated recursion.
3. Empowerment: activation at every round boundary, fourth-round cast,
   fifth-round rejection, death, expiry, no refund, increasing cost, Continue/
   Retry/Settings, once-only strategic activation.
4. Shield owner/full-block/cap/refresh/expiry and strongest-wins buff fallback.
5. Recovery: actual effective heal, waste, Seed snapshot, Renewal refresh,
   delayed target death, no revive; solo Flora.
6. Currency budget exactness: healing/re-hit, phase change, simultaneous kills,
   Burn/generated hits, duplicate receipt, retry, denial/overflow; measured
   damage-and-quit income against clearing in each relevant mode.
7. Bearer-only boundary: captured leader/member/all-captured/gear legacy
   snapshots, manual repair, preserved copies/locks/sales/fodder and no grants.
8. Starter pressured runs at Lv.0/30/45/60/75/90/105/115, base and each Master,
   singleton and conditional owned trios. Late zero-Defense DPR is separate
   from healing, shield generation, actual absorption and survival.
9. Current authored gates/levels/rewards preserved; ordinary calibration excludes
   Calamitic paper ceilings. Compare current combat baseline and new pilot
   before adjusting enemies; propose required tuning for approval.
10. Motion samples at pre-impact/impact/post-impact/final, speed/Skip/reduced
    motion, GPU fallback, portrait readability, repeated casts/disposal.

Use the [non-Calamitic benchmark methods](../roster-capability-audit.md) and
[global calibration](../enemy-benchmark-calibration.md), rerun against current
content. A five-seed early-entry test is a useful regression, not a fresh global
clear-rate report. Maintain current farm/cost/fodder changes as a fixed baseline.
No numerical acceptance claims are established in this document.

## 12. Explicit owner review checklist

Review the proposed values/formulas and starter examples, with particular
attention to:

1. **Final-form ordinary utility:** approve the strict "Eternal only after shared
   activation" model, or allow a personal-only cast of the same current named
   Flare with a lesser effect, empowered into its full effect. This alternative
   still uses one button/name, but is not yet selected.
2. **Critical investments:** approve deterministic four-stat-compatible remaps,
   or explicitly retain a bounded separate critical mechanic. No hidden legacy
   critical layer should survive by accident.
3. **Shields:** approve finite per-source refresh and50%-HP total cap, which
   intentionally replaces current unlimited stacking.
4. **Imbues:** review three25-Shard/+10% increments and mapping of purchased old
   increments; do not equate it to preserved old potency.
5. **Charge/timing:** review100/125/150/175/200 shared thresholds, guarantee/
   random gain values, four-round timer and run carryover policy.
6. **Subtype/starter/Master values:** approve or revise the tables before coding.

After approval: implement an isolated exact starter study, publish its tests/
pressured measurements for review, then produce/approve full released-roster and
equipment matrices before a versioned production rollout. No general menu
redesign, Sunshade release, paid services or unrelated economy work is included.
