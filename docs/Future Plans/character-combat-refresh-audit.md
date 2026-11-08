# Character combat refresh: audit and proposed direction

## Latest owner charge correction (2026-11-08)

[Layered personal/shared contract](radiant-combat-system-specification.md#owner-revision-layered-charge-and-shared-eternal-readiness-2026-11-08)
supersedes single-current-tier replacement and temporary empowerment.
Two personal layers: Glowing at base cost, Lustrous at twice base; retain excess
charge and offer highest ready tier. Evo.4 unlocks the second layer.
Eternal uses a full shared team meter plus both personal layers, final-form
bearers only; shared meter builds/displays only with a final-form squad member.
One cast consumes team charge; others retain personal charge. No third personal
bar, reset/refill mode or timer. Keep unlimited Shields; remove random crit.
Old abilities may be replaced/folded per character rather than forced to survive.
Exact costs/gains/starter/equipment mappings need revision/review before coding.

## Consolidated exact review draft (2026-11-08)

[System and three-starter specification](radiant-combat-system-specification.md)
is the next review deliverable: four-stat formulas, subtype values, charge/
empowerment state machine, three complete starter kits, nine existing Master
remaps, Imbue proposal and validation/migration gates. Numerical values are
unmeasured proposals. Review final-form support access, critical remapping,
Shield cap/refresh and paid Imbue conversion before implementation.
The historical audit and owner decisions below remain provenance.

## Master-selected sub-types: owner revision (2026-11-08)

**This replaces fixed innate subtype assignment.** Every Element-Bearer defaults
to **Equinox**. Equipping a compatible personal Master Conduit changes its
sub-type to the Master's declared profile and grants one character-specific
ability enhancement. Changing or removing that Master changes the profile;
no Master means Equinox. No permanent conversion, random Type or reroll.

Use the existing one matching-bearer Master slot and owned-equipment transaction
foundation, not another subtype menu, consumable or progression tree.
The requested subtype vocabulary is Equinox / Corona / Aegis / Solstice / Prism.
Exact stat bonuses/penalties, Master assignments and ability enhancements remain
subject to the system/starter review before implementation.

### Proposed player wording

**"Attunes Tizu to Aegis."** Then list the actual stat changes and the actual
ability enhancement. A generic template is:

> Attunes this Element-Bearer to [sub-type].
> [Exact stat bonuses and penalties.]
> [Named ability]: [exact enhancement, scope, condition and duration].

Do not say "turns into" as though the character's identity, element, rarity or
evolution changes. "Attunement" is the proposed equipment-selected build concept,
not a new combat buff or extra resource. Keep subtype names consistent across
characters; poetic Master names and unique ability effects provide variety.

### Mechanical boundaries for the exact specification

- Equinox provides no subtype bonus/penalty. Baseline characters retain distinct
  authored stats, passive, leader ability and Flare despite sharing Equinox.
- Each Master selects exactly one profile plus one clearly scoped personal
  enhancement. Its subtype modifiers are the Master's stat package, not extra
  bonuses layered over another hidden personal Master stat package.
- Replace old role stat bonuses. Reconcile ordinary gear, Ascension, subtype
  percentages and conditional/leader effects through one documented stat order.
- Prism must use the selected four-stat architecture: **higher Recovery / lower
  Defense** is the proposed replacement for the earlier Skill Power profile.
  Review numbers against real healing; don't retain a hidden fifth core stat.
- One profile at a time; no profile stacks, owned-but-unequipped bonuses or
  permanent residue after switching. No automatic unlock or equipment grant.
- Existing three Master alternatives per character should offer meaningful
  choices among selected profiles/enhancements; not every bearer needs every
  subtype. Present the complete per-Master review table before implementation.
- Clarify an enhancement's behavior across all three evolved Flare versions;
  a final-tier-only effect must say so and remain a deliberate later-game choice.
  No references to removed Skill1/Skill2 buttons.
- Freeze the selected Master, subtype and enhancement in the encounter loadout.
  Settings/resume/Continue never rereads a changed menu Master mid-run.
- Gear switching in menus recomputes previews from base progress, not previously
  modified stats. A temporary maxHP change never heals or revives a battle unit.
- Preserve Master IDs/ownership and reviewed compatibility migration. Captured
  Devourers are not playable/equippable and receive no new subtype system.
- Accepted equipment selection must save before success effects; removal and
  failed/stale saves must not celebrate a change that did not occur.

The master-driven profile is the approved direction; these exact formula,
wording and mapping details are specification proposals, not implemented behavior.

## Implementation questionnaire: owner decisions (2026-11-08)

This section supersedes conflicting earlier recommendations. **Exact system
and three-starter kits require owner approval before implementation**, followed
by reviewed roster batches. No production mechanics change in this planning pass.

### Selected scope

- Replace visible combat stat architecture with **HP, Attack, Defense, Recovery**,
  with explicit old-stat/equipment mappings. Recovery's delivered/received
  healing formula still needs an exact specification.
- Equinox by default; one equipped personal Master selects the mechanical
  sub-type and a character-specific ability enhancement. See the latest owner
  revision above. Percentages/assignments need a **review table before implementation**.
- Normal Attack and Defense remain; only the current evolved Flare is selectable.
- Passive Ability and one first-member Leader Ability remain. Leader effect
  works solo and stops while the leader is defeated; no automatic replacement.
- Owner permits removing DPS/Tank/Support roles to avoid duplication with
  sub-types. Keep a consistent simple architecture, not old role stat/perk
  layers secretly stacked behind the four-stat model.
- Ordinary tiers remain forms1-3 /4-5 /6. Calamitic tiers use **equivalent saved
  forms1-3 /4-5 /6**, despite displayed Evo.2-7. Ascension enhances final tier.
- **Elemental-Devourers are no longer equippable as playable squad members.**
  Preserve capture inventories/fodder unless separately directed; exact legacy
  squad/gear repair, capture UI and future capture rules remain to specify.
- Owner delegates redesign of old skill Imbues/Conduits/Masters rather than
  requiring preserved numerical investment value. Do not infer permission to
  delete owned assets, balances, upgrades or progress. Publish an explicit
  compatibility table with the reviewed specification.
- Partial damage-based Prismatica remains saved on defeat/quit. Fixed per-enemy
  budgets and repeat-entry farming tests remain mandatory; safeguards require
  approval rather than silently forfeiting already-earned currency.
- Flare spectacle is bounded, speed-scaled, skippable and Reduce-motion-aware.
  Real-time Gauge presentation and the selected three Flare names remain.

### Shared/personal charge reference supplied by owner

**Follow-up decisions confirmed2026-11-08:**
- Use the two-step final Flare model: spend full shared charge to empower one
  eligible bearer, empty its personal bar, recharge and cast within **four squad
  rounds**. Subsequent activations in a fight require more team charge.
- **Remove forced next-turn recovery for every Flare tier.** Balance exact
  costs, gain cadence and output; no inherited free power increase.
- Hybrid charge: guaranteed action/round gains plus **capped random bonus motes
  from real attack hits to the attacker**. No random squad allocation, no
  cosmetic-hit rolls and no uncapped multi-hit advantage. Passive/leader/gear
  fill effects remain reviewed. No new consumables or elemental advantage.
- Retain captured copies and fodder, but require **manual bearer squad selection
  before battle** when a legacy squad is invalid. No automatic team repair or
  new bearer grants. Preserve gear ownership/upgrades; define how captured
  equipment is cleared in the compatibility transaction.

The exact guarantee/bonus amounts, chances/caps, timer counting, mode expiry,
death/carryover and escalating shared thresholds require the specification.
Use a dedicated persisted charge RNG stream so cosmetic, combat-critical,
reward and capture randomness are not repurposed. Accepted combat state,
charge rolls and outcomes commit atomically; failure advances none.
Available healthy/non-damaging support actions need useful guaranteed charge
paths so the new model does not force every healer to deal damage.
These decisions resolve the corresponding questions below; the supplied
reference remains explanatory history, not a broader import approval.

Owner selects **personal Gauge plus a shared squad resource for Eternal Radiant
Flare**, and describes the reference's two-step climax: fill team charge,
activate one eligible bearer, empty/recharge its personal bar, then cast within
a four-turn window. Subsequent activations become more expensive.

Translate this into original terminology and shared definitions rather than
copying names, item designs or a proprietary implementation. Candidate team
resource **Concord Gauge**, activation **Radiant Ascendancy** and charge motes
**Lustre Motes** remain proposals, not approved final strings. Combat Ascendancy
is temporary and must be distinguished from permanent Stat Ascension.

The reference also describes per-hit/random crystal drops, elemental advantage,
fill gear, consumables and stacked personal bars. These are not all implicitly
approved as features. Clarify exact two-step behavior, resource sources and
scope before specifying them. The reference's dual lower-tier bar conflicts
with the selected one-current-Flare control model if lower tiers are selectable.
Prefer one current-tier bar unless the owner revises that selection.

The original recovery answer explained charging rather than skipping; the
follow-up above explicitly removes the forced skip for all Flare tiers.
Likewise, a four-turn mode timer requires a clock, expiry rules, death handling,
retry/reset/Continue behavior and accessible confirmation/controls.

Common beneficial stat buffs should follow a simple strongest-wins, no-additive
stacking contract if selected. Exact refresh/duration behavior still matters:
do not let a weak short buff erase a stronger long buff, or imply a single rule
for independent damage-over-time sources and owned Shields.

### Remaining review gates

1. Specify selected two-step climax/timer/escalation with no forced recovery.
2. Specify guaranteed base and capped attacker-only random bonus charge.
   Cosmetic hit counts cannot become mechanical grants.
3. Review fill effects; new items and elemental advantage are out of scope.
4. Specify manual invalid-squad selection and retained capture/fodder inventory.
5. Review four-stat scaling, subtype table and three exact starter kits.
6. Review full gear/Imbue/status/leader rules, currency ledger and save/rules
   migration before a public release.

## Owner-selected direction (2026-11-07, follow-up)

The owner selects a simpler full-roster architecture:

- One **Passive Ability**, one **Leader Ability**, and one evolution-upgraded
  signature active, replacing the previous two-skill-plus-Last-Flare proposal.
- System names and ability language should express **Light and Lustre** while
  preserving each character's element, thematic role and original identity.
- Signature tier1 below ordinary Evo.4, tier2 at Evo.4-5, tier3 at ordinary
  Evo.6 **without Ascension**. Ascension enhances the final version further.
- Actual Prismatica is earned as enemy Health is depleted, from a **fixed
  per-enemy budget**; the unpaid remainder is awarded on defeat.

These selections supersede the conflicting recommendations and open choices
in the original audit below. They approve the design direction, not unreviewed
coefficients, migration policy, resource formulas, copied terminology or an
immediate production release. The all-screen UI mock-up remains paused;
the requested battle layout is part of this new combat specification.

### Selected Flare names and proposed supporting vocabulary

| Layer | Wording | Intended meaning |
| --- | --- | --- |
| Personal passive | Radiant Signature | Automatic character identity; active irrespective of leader position. Display with the plain label "Passive Ability". |
| Leader ability | Luminary Covenant | One explicitly leader-only squad benefit. Display with the plain label "Leader Ability". |
| Tier1 signature | Glowing Flare | Selected name; dependable expression of the character's role. |
| Tier2 signature | Lustrous Flare | Selected name; enhanced version with a meaningful tactical improvement. |
| Tier3 signature | Eternal Radiant Flare | Selected name; final-form climax; Ascension strengthens it. |
| Personal charge | Lustre Gauge | Candidate replacement display name for Elemental Gauge, if personal charge is retained. |

The three Flare tier names are **owner-selected**. Passive/leader/Gauge names
remain proposals. Authored skill names can
remain character-specific within these common categories. Light-themed system
language does not convert Infernic/Oceanic/Botanic/Atmospheric/Tranquilitic/
Chaotic characters into a single combat element.

### Corrected sub-type contract: innate stat profiles (owner clarification)

Owner clarifies that sub-types mean **mechanical stat strengths and trade-offs**,
like higher Attack/lower Health, not unique poetic tactical labels alone.
Owner initially selected **fixed assignment by character identity and combat role** and
**replacement of current role stat bonuses** with the new profiles. Existing
Tank targeting and Support role healing need separate review; neither is
implicitly removed or retained.

The later Master-selected revision above supersedes fixed assignment: players
change profiles through equipment. No random acquisition Type, reroll or lottery.
The individual Discipline titles below are historical tactical-name proposals,
not the selected mechanical subtype system. They may remain optional identity
descriptors only if useful; no extra modifier layer is implied.

| Proposed subtype | Innate stat direction | Intended use |
| --- | --- | --- |
| Corona | Higher Direct Attack, lower Health | Aggressive damage dealer. |
| Aegis | Higher Defense, lower Direct Attack | Defensive protector. |
| Solstice | Higher Health, lower Direct Attack | Endurance specialist. |
| Prism | Higher Skill Power, lower Defense | Ability-focused attacker or support. |
| Equinox | Balanced stats, no bonus or penalty | Generalist. |

These names, profile count and directions are proposals; no numerical
coefficients or per-character assignments are approved yet. Test each profile
against actual native stats, skills, level growth and gear before fixing values.
An increased Attack stat need not offset reduced HP in value or survival.
Avoid multiplying current Attacker/Tank/Support stat bonuses by these modifiers.
Document the shared raw-stat pool, scaling order and menu/battle parity.
Stat penalties must preserve viable solo starters and useful support identities.
The later bearer-only squad decision removes captured subtype assignment.

**Naming rule:** light-themed terminology should be varied across unrelated
systems, but direct advancements may share a coherent wording family.
Do not invent a new unrelated noun for each evolved version of the same idea.
Glowing Flare / Lustrous Flare / Eternal Radiant Flare stay owner-selected.
No evolving subtype bonuses or new subtype tiers are implied by this rule.

The previous broad implementation questionnaire was interrupted. None of its
defaults constitutes approval; charge, recovery, controls/stats, leader death,
Calamitic/captured mapping and investment policy still need decisions.

### Historical tactical labels: proposed Radiant Disciplines

The initial interpretation proposed unique tactical labels and light-themed systems/philosophy
without repetitive "Light this / Light that" naming. **Radiant Discipline** is
the proposed name for a fixed tactical sub-type beneath the familiar role.
The owner requests the draft; the individual names and mechanics below remain
proposals pending review.

Keep distinct layers:
- **Element:** existing canonical elemental identity; unchanged.
- **Role:** readable Attacker, Tank or Support classification.
- **Discipline:** what makes this character's approach distinctive.
- **Radiant Signature:** its personal passive, not another separate passive slot.
- **Luminary Covenant:** its leader ability, not an additional equipment aura.
- **Flare:** its single evolution-upgraded active.

Disciplines are not random Types, growth modifiers, rarity ranks or another
unlock tree. A summon cannot roll a worse Discipline. No new RNG, saved subtype
field, equipment restriction or matching bonus is proposed. Each character's
catalog identity determines the label, which remains through evolution.
Roles and exact perks must be reconciled in the kit specification; a Discipline
does not automatically award new bonuses.

The plain-English tactical explanation must accompany the poetic name.
For example: **Tizu — Tank / Tideglass Custodian: shields allies against direct
pressure.** Do not replace useful role/status/cost labels with unexplained lore.

| Character | Proposed unique Discipline | Tactical identity to preserve in the single-active redesign |
| --- | --- | --- |
| Infernis | Cinderwake Vanguard | Offensive Burn pressure; a deliberate detonation payoff, not multiple ember counters. |
| Tizu | Tideglass Custodian | Chosen-ally barrier protection with useful solo defense. |
| Flora | Dawnseed Tender | Delayed healing that blossoms into timely recovery. |
| Atmoso | Halozephyr Conductor | A gathering wind formation and a readable release. |
| Elise | Fulgar Prismblade | Placed twin blades converge in a focused recall strike. |
| Bliss | Opaline Virtuoso | Graceful action-order support woven into offense. |
| Bruno | Ambermantle Bastion | Deliberately intercept damage intended for allies. |
| Disciple | Mindstar Preceptor | Prepare an ally's next action for a clear damage or support payoff. |
| Aurora | Horizon Augur | Forecast dangerous enemy skills and blunt their arrival. |
| Razor | Eclipse Reprisal | Survive direct pressure and return stored Wounds as revenge. |
| Rosetta | Aureole Huntress | Coordinate the squad against one designated quarry. |
| Thornia | Gloamthorn Sentinel | Punish enemy actions through a visible retaliatory trap. |
| Crinso | Twinflare Duelist | Preserve opposed-edge combo identity through passive/Normal/Flare interplay; do not require two removed skill buttons. |
| Nerithe | Meridian Pathfinder | Survey a target with Normal Attacks, then exploit its defenses. |
| Orvella | Facetbed Architect | Maintain a finite shared Foundation and convert its durability deliberately. |
| Vaelor | Zenith Resonator | A readable rhythmic window for enhanced attacks. |
| Ozriel | Cathedral Aegis | Emergency squad survival and powerful shielding, not automatic revival. |
| Ilvaris | Starveil Cantor | Mark a priority enemy while sustaining the squad. |
| Kaelith | Fracture Seraph | Build a bounded incision and release a precise rupture. |
| Caldrex | Kilnstar Bulwark | Bank hostile pressure to fortify the squad or discharge Heat. |
| Solenne | Vesperbell Warden | Spend finite Stillness carefully between defense and retaliation. |
| Myrthen | Solstice Reaper | One seasonal cycle culminating in a Harvest window. |
| Neralis | Afterglow Ferryman | Build Current through useful actions and rescue wounded allies. |
| Varkhel | Faultsun Anchor | Hold enemy pressure, then release a piercing Tension payoff. |
| Seravelle | Emberchorus Herald | Reward coordinated squad Normal Attacks with convoy momentum. |
| Velmira | Parallax Fencer | Alternating attack cadence and precision piercing; distinguish it from Crinso's combo climax. |
| Maerion | Moonwake Reclaimer | Gather actual lost Health into a clearly bounded recovery pool. |
| Caevren | Penumbral Loadbearer | Intercept for allies and turn carried pressure into protection; explicitly differentiate from Bruno. |
| Vespera | Beacon Cantor | Signal an ally and convert cooperation into an offensive support payoff. |
| Ilyss | Argent Absolver | Cleanse harmful effects and restore allies without prerequisite stacks. |
| Asteriel | Moonflower Paragon | Choose a protective or offensive support path with one visible state. |
| Serapha | Eventide Arbiter | Use weakening to create a predictable protective window. |

These32 entries cover the released roster, not the hidden six Sunshade bearers.
Before final kit approval, verify each remaining owned mechanic against current
runtime and map its investments. In particular, alternating-skill identities
must be genuinely redesigned around the selected single active, not left with
an impossible two-skill prerequisite.

Captured Elemental-Devourers remain legal mixed-team members. Their subtype
policy needs a separate fixed-family design, not32 copied bearer labels or
automatic new abilities. Do not remove existing captured actions/ownership
without a reviewed parity and migration contract.

### Radiant design philosophy and vocabulary discipline

| Principle | Design meaning / acceptance consequence |
| --- | --- |
| Lucidity | Every poetic label has a clear tactical explanation; target, cost, effect and duration remain literal. |
| Refraction | One shared system expresses many elemental identities; no universal gold recolor or copied kit. |
| Convergence | Passive, leader ability and Flare reinforce one identifiable play pattern without recursive trigger chains. |
| Resonance | Squad cooperation creates deliberate choices, not mandatory rare-character ownership or subtype-matching bonuses. |
| Radiance | Each Flare tier escalates silhouette, choreography and impact; power and clarity are not replaced by particle density. |
| Afterglow | Finite effects settle into readable exact outcomes; no lingering glare obscures controls or repeats a saved grant. |
| Continuity | Evolution deepens the same Discipline and preserves ownership, art and mapped investments. |

Use related words deliberately: lustre, aureole, facet, prism, halo, dawn,
zenith, glimmer, eclipse, corona, refraction and afterglow. Darker radiant terms
belong to moon/night/Chaotic identities, not a newly introduced combat element.
Do not rename Health, Defense, Burn, Weaken, costs or currency just to make
every noun poetic. Existing Prismatica/Null-Prismatica terminology stays.
Reserve "Eternal" for the selected final Flare category rather than every title.
No new shared resource or mechanic is implied by naming a design principle.

### Revised functional model

Preserve Normal Attack as a free, dependable baseline in the proposed design.
The owner selected one signature active, not a new skill button for each tier:
evolution replaces its current version. Whether lower versions remain manually
selectable is not approved. Defense and target controls need an explicit
retained/removed decision in the complete input specification.

Each signature must function as an attacker, tank or support action as
appropriate. "Attack ability" must not force every healer to become a damage
dealer. Exact targeting, Gauge spend/gain, recovery, leader-death behavior,
passive/role-perk consolidation and captured-unit parity remain to be specified.
No additional shared Overdrive-like resource is selected by this follow-up.

Ordinary Evo.1-3/4-5/6 gates are selected. Calamitic characters display Evo.2-7
from six saved forms: recommend equivalent form gates, with the final tier at
their Calamitic final form, but obtain an explicit mapping before coding.
Current stat Ascension and three separate25-Shard Imbues cannot simply be
discarded or combined for free. Provide an approved mapping for all invested
Skill1, Skill2 and Last Flare enhancements and their equipment references.

### Damage-based currency contract to specify

Keep each enemy's existing total currency distribution and activity exceptions.
Resolve its budget once using the authority's reward stream; never reroll on
each hit. Paying earlier changes when the reward stream is consumed, so this
must be reviewed and versioned rather than described as an unchanged RNG path.

Recommended integer payout model for budget `B` and maximum Health `H`:

1. Track the lowest actual Health reached, `L`, initially `H`.
2. Earned total is `floor(B * (H - L) / H)` using safe exact arithmetic.
3. Pay only earned total minus the already-paid amount.
4. On defeat, pay exactly the remaining budget once.

Only actual Health depletion advances entitlement; damage numbers, overkill,
Shield absorption, animation hit counts and repeat damage after enemy healing
cannot expand the budget. An enemy with no eligible budget pays nothing.
Ordinary damage and periodic effects need an explicit common eligibility rule;
the recommended shared Health-depletion ledger avoids packet-count advantages.
Enemy maxHP changes, scripted transformations and reinforcements require
well-defined budget/Health baselines rather than resetting payout eligibility.

All HP changes, payout-ledger changes, currency, reward-stream advances and
other resolved outcomes save atomically through the accepted combat operation.
On failure, none advance and no effect claims earned currency. Existing
kill-only materials, captures, discoveries, premiums and first-clear bonuses
remain kill-only unless separately approved. No extra reward on visual pickup.
The final kill receipt must exclude currency already paid during combat.

Defeat/quit retains already-saved currency; Retry creates a new encounter budget.
This intentionally permits partial-encounter earnings. Before release, compare
damage-and-quit farming against normal clears, especially Treasury, long bosses
and repeated entry, without silently adding entry costs or forfeiting earnings.
Separate prospective pacing decisions from preserving original per-enemy totals.

### Requested battle presentation

- Portrait-based squad controls beneath the arena, using existing artwork.
- Visible HP/charge and compact ally buffs/debuffs with accessible full details.
- Text commands for the signature active; no dedicated new ability icons.
- Reuse existing status icons where semantics match. Historical ability art
  may become a status asset only after per-icon meaning/readability review.
- Standard descriptions: target, exact effect/value, condition, duration and
  real cost/consequence. Do not hide multipliers behind "powerful" or "massive".
- Distinguish real mechanically counted hits from cosmetic VFX. Neither grants
  new crystals/resources without an approved mechanic.
- Preserve current three-member formation, keyboard/focus, impact-ledger timing,
  existing scenery, finite VFX and static Reduce motion feedback.

### Next deliverable

Create an exact original-system specification and starter kit examples for
review, then a full-roster plan and equipment/investment mapping. Update the
pilot to compare the old four-action structure with the selected single-active
structure, not merely rename the current skills. No live rework is implemented
by this document update.

### Owner-selected live Gauge feedback and enhanced Flare VFX

Owner additionally requires Gauge to visibly increase during attack
presentation, rather than snapping to its final value after the sequence, and
substantially stronger signature animation with enhanced shaders and VFX.
This is a new combat-presentation acceptance requirement, not completed work.

**Impact-timed Gauge ledger:**
- Present the accepted action's ordered, actual Gauge events at their relevant
  attack impacts/trigger beats alongside HP, Shield and status updates.
- Start from pre-action Gauge; include spend, refunds, incoming-hit gains and
  other genuine source events; finish at the exact authoritative value.
- Do not increase at every cosmetic strike unless that strike has a real
  corresponding grant. Multi-hit/AoE animations must not multiply resources.
- A short eased fill may connect the exact values; affordability still follows
  engine action availability, never the interpolated bar or particles.
- Gain and spend remain legible even within one sequence. Show caps/overflow
  honestly, including grants that cannot fit; don't imply extra stored charge.
- Skip reaches the exact final ledger; Settings/resume, battle speed changes
  and disposal never replay a grant or duplicate a transaction.
- Under Reduce motion, update values at the same logical beats without
  traveling particles, pulsing blooms or animated fills.

**Proposed radiant escalation:**

| Tier | Proposed presentation character |
| --- | --- |
| Glowing Flare | Distinct elemental charge, luminous core, readable attack trail, concentrated impact bloom and a finite dispersal. |
| Lustrous Flare | Layered refractive trails, shaped light geometry, richer secondary impacts, broader bloom and a character-specific field response. |
| Eternal Radiant Flare | Signature elemental light architecture, shader-enhanced radiance/distortion, layered rays and a multi-beat climax with a clear final impact and dissipation. |
| Ascended enhancement | Refine and intensify the final tier's established motif, not another unapproved tier or permanent full-screen glare. |

All characters need distinct motion/silhouettes and elemental expression, not
the same particle explosion recolored. Tank/healing Flare VFX express protection
and restoration; new damage is not added to justify spectacle.
Reuse installed portraits/scenery and existing VFX/impact/cut-in foundations,
including [battle effects](../../src/presentation/battle-effects.ts) and
[cut-ins](../../src/presentation/battle-cutin.ts), before introducing another
renderer. Evaluate GPU bloom, distortion and light-ray passes against the
existing rendering lifecycle; no engine change is selected.

Preserve authored artwork/facing and keep portrait controls, HP/Gauge, statuses
and action text readable above effects. Use finite pointer-transparent overlays.
Do not achieve intensity through rapid full-screen flashes/strobing, sustained
whiteouts or mandatory camera shake. Keep explicit in-game Reduce motion,
immediate Skip where supported, playback-speed scaling and complete cleanup.
Cosmetic randomness stays separate from gameplay/reward RNG. No new delay to
reward persistence or artificial transaction wait.

**Required validation before declaring this delivered:**
- Sample pre-impact/impact/post-impact/final Gauge against ordered real events,
  including spend+refund, capped gains, AoE, periodic and defensive triggers.
- Observe all three tiers over time, not just screenshots; verify distinct
  charge, readable impact and dissipation.
- Profile sustained and repeated Flare casts on a declared mid-range laptop;
  target60fps with bounded particle/overdraw/GPU cost, adaptive quality and no
  growing memory/listener counts. Record actual measurements, not a guarantee.
- Exercise reduced motion, low-quality/GPU fallback, unsupported shaders,
  Skip,1x/2x/3x, Settings interruption and repeated disposal.
- The strongest tier must remain visually impressive at reduced quality,
  without covering actionable/readable battle information.

## Status and decision boundary

Original audit requested2026-11-07. **The original recommendations below are
historical where superseded by the owner-selected direction above. No exact
kit, stat, Gauge, equipment, progression or save migration is approved here.**
Audited against implementation release `d82015ba` and its rules18 authority.
The paused UI redesign and Story work remain paused.

The Brave Frontier description and screenshot supplied by the owner are a
reference for understandable combat layers and presentation priorities, not
an independently verified history of every version of that game. Use general
design principles; do not copy its characters, artwork, skill names, terminology,
logos, prose, exact kits or proprietary implementation.

**Core finding:** Last Light already has a comparable special-attack skeleton.
Its largest readability problem is not the number of skill buttons. It is the
number of interacting rules behind each choice: personal state, role perks,
equipment exceptions, variable Gauge, packet scaling and different clocks.
Adding every reference system on top would make that problem worse.

**Recommended direction:** keep character identities and the three-member
formation; standardize the combat grammar; make each character understandable
as one role, one personal hook and a clear basic/core/advanced/climax choice.
Prototype a shared climax resource only after the simpler baseline is measured.
Do not launch random summon Types, Recovery, skill-level grinding and a new
enhancement tree simultaneously.

## 1. What actually exists

Primary evidence is runtime code, not older retained specification paragraphs:

- [Stats and fighter resolution](../../src/content/combat.ts),
  [current stat labels/defaults](../../src/content/phase-zero-stats.ts).
- [Current native identities](../../src/content/native-identities.ts),
  [seasonal identities](../../src/content/moon-sunshade-native-identities.ts),
  [native runtime](../../src/game/native-kits.ts).
- [Actions, turns and recovery](../../src/game/battle.ts),
  [Gauge, effects and equipment integration](../../src/game/conduit-runtime.ts).
- [Intrinsic roles](../../src/content/role-perks.ts),
  [Masters](../../src/content/master-conduits.ts),
  [ordinary Conduits](../../src/content/conduits.ts).
- [Progression](../../src/content/progression.ts),
  [captured instances](../../src/game/character-instances.ts),
  [atomic account transactions](../../src/game/account.ts),
  [authority](../../supabase/functions/game-operation/engine.ts).

### Current structure

| Layer | Implemented behavior | Important distinction |
| --- | --- | --- |
| Roster |38 authored bearers:32 released identities plus six unreleased Sunshade identities | Sunshade must remain hidden; being defined internally does not make it acquirable. |
| Squad |1-3 owned distinct instances, mixed bearers/Devourers, leader first | Only one starter is free. A tested trio is conditional on ownership. |
| Main stats | Health, Direct Attack, Defense | No Recovery stat or Heart Crystal system exists. |
| Advanced stats | Critical Rate, Critical Damage Multiplier, Skill Power, Skill Duration, Skill Efficiency, Elemental Gauge Capacity, Elemental Gauge Gain | Ten current labeled stat keys total, not just the historical seven-field model. Internal fields are not all current player-facing mechanics. |
| Actions | Normal Attack, Skill1, Skill2, Last Flare | All three actives are defined for base-form bearers; captured forms may lack some slots. |
| Personal Gauge | Starts0; base capacity100; Normal Attack offers20, incoming direct hits offer10 | Effective gains/capacity depend on progress, gear and native rules. |
| Base spend | Normal0, Skill1=25, Skill2=40, Last Flare=100 | Equipment/Skill Efficiency can alter costs; these are not universal effective prices. |
| Last Flare | A powerful third active; normally skips the caster's next player turn | Recovery and ready-round/equipment exceptions are part of its price. |
| Personal passive | Each bearer has an automatic native identity | Some passives affect allies, but they are not leader-only skills. |
| Role perk | Tank: Defense/targeting; Attacker: Direct Attack/Skill Power; Support: Health/Skill Power and4% squad healing after skills | Fixed by character identity, not a randomized summon Type. Role healing is a separate source from the named skill. |
| Equipment | Eight ordinary slots plus one matching personal Master; three Master alternatives per authored bearer | Masters overlap the customization role of extra passives/enhancements; they are owned equipment, not an SP tree. |
| High-end progression | Evolution, leveling, stat Ascension and three ability Imbues |25-Shard steps; no BB-level10 unlock or free-form skill tree. |
| Leader | First member drives composition/identity and relevant presentation | No dedicated leader-skill layer, guest mercenary slot or squad Overdrive resource found in the inspected implementation. |

The live native identity replaces historical skill/passive text. For example,
Tizu is now a targeted barrier protector, not the older fixed-shield/AoE-damage
kit; Flora uses Seeds, not the old shared Bloom-charge kit. Designing against
the obsolete tables would produce a second inconsistent rework.

### Gauge example: why capacity is not the same as readiness

At base stats, five Normal Attacks offer100 Gauge. Spending25 after two
Normals leaves15, not a partially upgraded stronger skill. Skill1 and Skill2
are independent tactical moves, not automatically BB and SBB tiers of one move.
Capacity increases with character potency and equipment, while the base Last
Flare spend remains100 before modifiers. A visually full bar therefore need
not mean "this is the first instant Last Flare became affordable."

Healing, taunt, shields, incoming hits and Gauge gear can change the cadence.
There are no mechanically collectible Battle Crystals today. Reward pickup
animation is not combat-resource collection.

## 2. Comparison with the owner's reference

| Reference concept | Last Light analogue | Gap | Recommendation |
| --- | --- | --- | --- |
| HP / ATK / DEF | Health / Direct Attack / Defense | Names are longer; advanced layers obscure the core | Present the three core stats first; retain advanced values in a clear secondary reference. |
| REC | Skill Power and current healing rules cover part of its design space | Healing often depends on recipient maxHP, source Skill Power and effect-specific rules | Test a Recovery model separately; do not add it merely to reach four stats. |
| Random Type | Fixed Tank/Attacker/Support role | No random growth identity per summon | Prefer chosen, reversible specializations later; avoid reroll pressure. |
| Leader Skill | First squad position, plus some always-on squad effects | No exclusive leader passive | Add a small, explicit leader bonus as a later independent pilot, not a complete role rewrite. |
| Extra Skill | Personal passive and personal Master effect | Identity already exists; gear adds substantial complexity | Keep a simple innate passive; let one equipped Master provide the advanced build direction. |
| BB | Skill1 | Skill1 is not always offensive and may participate in a complex loop | A character's dependable core technique, not a compulsory damage button. |
| SBB | Skill2 | Often a different utility move, not a stronger Skill1 | Advanced technique with a clear situational purpose; never force all supports into attack ladders. |
| UBB / OD | Last Flare | Personal Gauge plus recovery, no team OD | Compare current individual climax against a replacement team resource in an isolated prototype. |
| SP | Master alternatives and Ascension/Imbues | Already two investment systems; no point allocation | Use Master choices first. A separate tree is lower priority and must replace overlap, not stack on it. |
| Crystal drops | Deterministic action/incoming-hit Gauge | No BC/HC distribution decisions | Cosmetic wisps can communicate actual resolved gains; do not turn them into a second collection transaction. |

The reference's advantage is a recognizable vocabulary and repeated decision
pattern, not proof that every historic subsystem is beginner-friendly.
The screenshot's unit cards, visible HP/Gauge and central climax bar suggest
information priority. Its dense battlefield and six-unit layout are not a
requirement to enlarge this game's squad or restart the paused UI overhaul.

## 3. Complexity and enjoyment audit

Severity here means design risk, not a proven gameplay defect. No player
telemetry or fresh population playtest was collected in this audit.

| Finding | Evidence | Risk | Recommended response |
| --- | --- | --- | --- |
| Multiplicative rule burden | Personal passive + role perk + eight Conduits + Master + advanced stats | High: players cannot predict what their chosen action actually does | Standardize triggers/scaling and isolate one advanced build hook. |
| Similar-looking actions, different meanings | Two25/40-cost skills can mean attack, stored-state spend, trap, cleanse, cover or stance | High: learning a new character means learning a new grammar | Consistent effect order and clear role labels, while preserving utility choice. |
| Multiple clocks | Player turns, enemy phases, next action, per hit, per owner and encounter resets | High: wrong timing is hard to diagnose | Use one shared duration convention wherever mechanics permit; name exceptions explicitly. |
| Layered amplification | Direct Attack, Skill Power, crit, pierce, native modifiers, role bonuses and gear | High: large numbers mask whether a synergy is skillful or accidental | Measure packet paths; provide a compact action-preview explanation. |
| Recovery + Gauge + conditional resources | Last Flare spend and next-turn skip; bespoke prerequisites | High: a climax can feel like lost agency | Test cost alternatives, rather than removing recovery and keeping power unchanged. |
| Unbounded shield accumulation | Shields persist until broken and repeated casts stack | High: stall/snowball tuning and complex ownership receipts | Compare bounded/refresh alternatives in a simulation; do not silently change the current owner-approved rule. |
| Passive role healing outside the skill | Support skills also heal4% maxHP per living ally | Medium: skill text may not match perceived output | Attribute role contribution separately; retain or fold it into a future role contract deliberately. |
| Random Type addition | Would add another acquisition-quality variable | High: duplicate disappointment and optimization pressure | Not recommended for first refresh. |
| Duplicate customization systems | A new ES unlock/SP tree on top of Masters/Imbues | High: more menus and mandatory chores | Choose one build-choice owner before adding any tree. |
| Progression rewards versus ability access | Expensive evolutions now consume protected Devourers | High: hiding essential healing until later can make starters nonviable | Keep basic role functionality at base form; evolution improves mastery, not permission to function. |
| Rarity versus stars | Acquisition stars are separate from evolving rarity | Medium: a6-star base is not automatically Omnic | If unlocks are introduced, use evolution explicitly, never assumed star mappings. |

### Proposed combat grammar

Every short ability explanation should answer, in this order:

1. **Target:** one enemy, all enemies, one ally or all living allies.
2. **Immediate effect:** damage, healing, shielding or a named buff/debuff.
3. **One signature interaction:** a bonus from the character's personal hook.
4. **Cost and consequence:** Gauge, duration and recovery when relevant.

Shared glossary entries own Burn, Weaken, Shield, cleanse, taunt and intercept.
Do not repeat implementation provenance in every sentence. Exact source,
stacking and clock rules remain available in the detailed reference.
Do not hide information that is necessary to select a target or judge survival.

**Proposed budgets, subject to review:**
- One visible personal resource/state per character, beyond HP/Gauge.
- One primary job and one secondary utility job.
- One setup/payoff interaction per ordinary skill; a climax may summarize the hook.
- No more than three effect clauses in the short description.
- A fully functional zero-stack/no-mark outcome, unless setup is the explicit
  purpose of the move and the interface says so before selection.
- At most one special exception exposed by the selected Master in the core loop.
- A new character should not require reading unrelated characters' kits to act.

These are design targets, not a reason to erase source ownership or genuine
combat safety rules from the engine.

## 4. Roster disposition: preserve identity, reduce rules

This table is a first-pass design audit of all32 released identities. It is not
a replacement numeric kit specification. "Risk" describes cognitive burden,
not strength, rarity or a clear-rate ranking. Older identities receive the same
clarity goals as Moon/War; no universal buff is proposed.

| Character | Keep as recognizable hook | Complexity risk / proposed simplification |
| --- | --- | --- |
| Infernis | Apply Burn, choose when to detonate | Medium: one Burn ownership rule; show remaining detonatable damage, not another counter. |
| Tizu | Protect one ally, stronger team barrier | Medium: unify block-to-Gauge wording; basic protection must work when solo. |
| Flora | Plant delayed healing, harvest when needed | Medium: one Seed state per target; remove unnecessary normal/empowered timing exceptions from the core move. |
| Atmoso | Build a Cyclone, release early or wait | High: display one charge/timer; define one release trigger, no competing automatic/skill-reset surprises. |
| Elise | Place and recall two shuriken | High: visual held/lodged state; one recall rule, optional convergence payoff. |
| Bliss | Reward thoughtful action order | High: reduce opening/passing/closing branches to one clearly signaled timing bonus. |
| Bruno | Intercept damage for another ally | Medium: shared intercept contract and explicit solo fallback; one-step prediction of transferred damage. |
| Disciple | Empower an ally's next action | High: one Empower buff with a readable damage/support result rather than three names for nearly one intention. |
| Aurora | Anticipate and suppress dangerous enemy skills | Medium: show forecasts in battle itself; consistent skill-suppression behavior, no normal-attack ambiguity. |
| Razor | Endure hits, turn Wounds into revenge | High: bounded visible stored amount; simplify which losses count; avoid a tank who needs unsafe HP loss to function. |
| Rosetta | Coordinate attacks on a marked target | High: one focus mark and a single squad-completion payoff; no repeated per-hit contributor grants. |
| Thornia | Set a retaliating thorn trap | Medium: one trap state; normal/empowered distinction should be recognizable without reading damage values. |
| Crinso | Alternate edges to earn a finisher | High: cap visible combo; repeating a move should lose a bonus, not obscure core functionality. |
| Nerithe | Survey with Normal Attack, pierce with skills | Medium: preserve fixed Normal-only bonus; one survey target and clear spend rule. |
| Orvella | Establish a defensive Foundation | High: unify its finite protection/payoff explanation; avoid multiple independent foundation clocks. |
| Vaelor | Time attacks with a three-step Beat | High: passive advances without action; show the next Beat, or test an action-driven rhythm. |
| Ozriel | Team shields and once-per-encounter lethal protection | Medium: preserve survival-not-revival distinction; don't split essential protection across new meters. |
| Ilvaris | Mark enemies and support allies | High: Mark plus Hymn plus stat amplification; choose one signature mark hook and simpler support buff. |
| Kaelith | Build incisions, spend on a focused strike | Medium: distinguish pre-hit stacks from newly earned stacks; cap and communicate the spend. |
| Caldrex | Bank Heat from pressure, defend or discharge | Medium: one Heat gain/spend rule; shared taunt and shielding semantics. |
| Solenne | Hold charges that soften hits | High: defensive charges also power offense; make the risk of spending all clearly predictable. |
| Myrthen | Seasonal build-up and Harvest payoff | High: phase and mark both demand tracking; keep a single season indicator with a clear empowered next move. |
| Neralis | Attack/heal to build Current, rescue the team | Medium: earning back a stack after spend is unintuitive; prototype spend-before-earn with an explicit post-action result. |
| Varkhel | Build Tension through tanking, release it | Medium: unify personal versus redirected hits; Master refund must not obscure recovery cost. |
| Seravelle | Squad Normal Attacks build team momentum | Medium: one per-round contribution cue; isolate Gauge donation from the spend loop. |
| Velmira | Alternate attacks, build Crosscut | High: overlaps Crinso; retain a different tactical payoff, not just different reset rules. |
| Maerion | Recover allies' lost Health through Unreturned | High: borrowed HP amount plus exclusions; one stored recovery pool and clear chosen/team spend. |
| Caevren | Intercept damage and build Load | High: overlaps Bruno/Caldrex/Varkhel; distinguish an intercept specialist without another generic tank stack loop. |
| Vespera | Signal an ally, earn a team-offense payoff | High: Signal plus Beacon plus next-damaging-skill expiry; simplify to one linked setup/payoff state. |
| Ilyss | Cleanse and heal | Medium: cleanse should work without Severance; explicit choice only when both harmful effects exist. |
| Asteriel | Choose protection or offensive support | High: two paths + Promise + Moonflower; preserve stance choice, fold the bonus into one path indicator. |
| Serapha | Create safe windows through weakening | High: Weaken ownership + Interval + Ceasefire; one protective-window hook instead of three counters. |

Unreleased Sunshade's six authored kits also need this grammar audit before a
future release, but remain internal. Do not reveal their identities in live
menus, produce acquisition guidance or interpret this plan as launch approval.
Captured Devourers need a separate limited-kit audit: preserve fixed forms,
owned UUIDs and unavailable skills; never invent a missing active slot.

### Differentiation priorities

The tank cluster should represent different readable jobs, not "gain a stack,
spend it on a shield" eight times:
- Tizu: direct barrier protection.
- Bruno/Caevren: single-ally versus team interception, with a deliberate
  differentiator agreed before replacement.
- Caldrex/Varkhel: team defense versus retaliation; avoid duplicate stack loops.
- Solenne: timing of finite defensive charges.
- Ozriel: emergency lethal protection, not automatic revival.

Likewise, Crinso/Velmira, Flora/Neralis/Maerion/Ilyss/Serapha, and
Disciple/Vespera/Asteriel need distinct tactical purposes. Simplification
should reduce rule differences while increasing meaningful role differences.

## 5. Recommended system architecture

### A. Stats: simple front, complete reference

**First pilot:** keep current math. Core row = HP / Attack / Defense; advanced
row = crit, Skill Power and Gauge properties. Use consistent visible names,
but keep saved/internal IDs stable. Do not recalculate stats to fit the labels.
Any actual presentation implementation waits for an approved bounded scope;
this is not permission to resume the all-screen redesign.

**Optional Recovery experiment:** if the owner specifically wants a fourth
main stat, compare:
- Source Recovery increases healing delivered, while recipient Health remains
  the basis for survival and missing-HP caps.
- Recipient Recovery increases healing received, affecting many balance paths
  and potentially making tank/healer synergies harder to understand.

Source Recovery is the clearer candidate, but it overlaps existing Skill Power
for healing. Before adoption, decide which stat owns healing, what shields use,
how Seeds/Unreturned/role healing/Conduit healing scale, and how every old healing
investment maps. Never multiply old healing by both full Skill Power and a new
Recovery bonus without an explicit rebalance. No coefficients are approved.

### B. Abilities: consistent layers without stripping utility

**Recommended first model:**

| Action | Purpose | Availability proposal |
| --- | --- | --- |
| Normal Attack | Free dependable action and Gauge building | Always. |
| Core Technique (Skill1) | Character's essential role action | Base form; healing/protection need not deal damage. |
| Advanced Technique (Skill2) | Alternative utility or signature payoff | Keep currently owned access; future unlock policy requires separate approval. |
| Last Flare | Character's climactic role expression | Existing access preserved in the first pilot; cost model tested separately. |

"Core" and "Advanced" describe function, not proposed literal in-game names.
Keep the actual authored ability names and artwork. Do not force Skill2 to be
a strict stronger version of Skill1: that removes target/utility choices and
can make optimal play simply "always press the highest affordable tier."

Compare a strict upgrade ladder only for attack-focused pilot characters.
Measure whether it improves understanding enough to justify removing a move.
No fifth action, healing crystal mechanic or three nested charge bars in phase1.

### C. Gauge: first make the existing bar understandable

Before a team resource:
- Clearly show each move's actual affordable threshold and cost.
- Separate stored Gauge from maximum capacity; use percentage and exact values
  consistently in tooltips, refunds and UI.
- Compare fixed100-cost versus capacity-relative Last Flare as different
  experiments. Normalizing percentages changes capacity gear's value.
- Record gains from Normal, incoming hit, personal passive and gear separately.
- Skills/refunds must not create recursive action/Gauge loops.
- No visual particle count or cosmetic collision controls the actual grant.

**Climax experiment, not initial rollout:** prototype one shared squad resource
that replaces Last Flare's personal-Gauge spend rather than adding a second
cost on top. Personal Gauge still pays for the two techniques.

Candidate shape: actions by living squad members contribute a bounded fraction
of one complete squad round; compare readiness after4/6/8 equivalent rounds.
Normalize for legal1/2/3-member squads and define falling-member behavior.
This is a measurement design, not a selected formula. Exclude generated hits,
Burn ticks, animation hit counts, purchases and damage magnitude from earning
the resource. Otherwise multi-hit/AoE/gear outliers dominate fill.

Only one bearer uses the shared climax opportunity; choosing healer, protector
or attacker makes the squad decision meaningful. No simultaneous automatic
three-Last-Flare chain. Prototype these alternatives separately:
1. Personal cost plus current recovery: baseline.
2. Team cost plus current recovery: tests resource change alone.
3. Team cost with no next-turn skip but reduced output/other measured limit:
   tests more immediate agency, not a free power increase.

Decide starting/reset/carryover rules for stages, retry, Settings, defeat and
final-stage replay. A support climax must compete fairly with damage.
Do not adopt75-100% universal mitigation or revival just because the reference
listed it: these can negate authored danger and compound existing shields.

### D. Leader bonus: later, small and legible

Add at most one always-on squad bonus from the first member; no friend-slot
stacking or second leader. Make it work with a solo starter and mixed squads.
Candidate categories: durable protection, steady offense or reliable healing.
Prefer one understandable benefit over element-restricted collections of buffs.
No numbers selected; benchmark against existing role/Master auras first.

Keep personal passives on every member. Define whether the leader bonus stops
on death and how replacements/reordering affect a frozen run. New leaders
cannot be selected mid-battle from current menu state.
No ally revives/heals when a maxHP aura appears. If captured leaders are legal,
they need an explicit usable leader contract, not an accidental disadvantage.

### E. Types and enhancements: not first

**Random Types: defer/reject for the first refresh.** Roles already provide
identity. A bad random defensive roll would be especially unwelcome after
expensive summons and the newly increased material/fodder investments.

If specialization is later desired, offer a manually chosen reversible
orientation with no paid rerolls, random permanent penalties or duplicate-only
unlock. Preserve a balanced default on legacy accounts without load writes.

**Enhancement tree: defer.** Masters already offer three character-specific
directions, and Ascension/Imbues already provide late growth.
The simplest near-term model is one selected Master and a readable innate
passive. If an evolution mastery tree is later approved, let it replace redundant
customization rather than add mandatory SP farming. Use a small mutually
exclusive choice; never require a Master/fully-leveled skill to unlock the
character's essential healer/tank role. Preserve/refund affected paid-in-game
investments only under an owner-approved migration contract.

## 6. Starter pilots: concrete functional sketches

These describe intended play, not new coefficients or approved kits.

| Pilot | Core technique | Advanced technique | Climax | One hook |
| --- | --- | --- | --- | --- |
| Infernis | Strike one enemy and apply Burn | Area strike; optionally cash out own Burn | Strong area Burn attack | Burn remaining damage and deliberate detonation. |
| Tizu | Place a useful barrier on a chosen ally, including self | Strike/weaken to reduce next pressure | Team barrier against a dangerous phase | Successful protection reinforces readiness; no separate Tide minigame. |
| Flora | Heal a wounded ally or plant useful team regeneration | Attack while reinforcing regeneration, or harvest as a deliberate rescue | Team recovery | One clearly visible delayed-heal state. |

Tizu's core/advanced ordering is intentionally different from today's slots.
That is an option to test, not a rename-only change: every Skill1/Skill2-bound
Conduit, icon, target rule and saved snapshot would need a reviewed mapping.
A lower-risk alternative keeps slots but labels their purposes explicitly.

For all three:
- Base form works solo, not only after acquiring a support trio.
- No zero-resource "do nothing" turn forced by the pilot redesign.
- A later evolution strengthens the same understandable role.
- Reuse all installed art and relevant VFX; do not repaint portraits to justify
  new mechanics. Motion communicates action/impact, not a new wait or RNG draw.
- Exact new copy, costs and values are presented for approval after benchmarks.

## 7. Compatibility and investment audit before implementation

An accepted new kit is incomplete until all relevant surfaces agree:

| Surface | Required work |
| --- | --- |
| Native catalog/runtime | Per-action targets, scaling, source/owner, caps, clocks, resets, death behavior and once-per-turn guards. |
| Normal/advanced stats | Old-to-new mapping, cost/gain floors, critical eligibility, pierce, healing and Shield ownership. |
| Ordinary Conduits | Audit all live entries for action-specific references, native counters, Gauge/capacity, role and trigger expectations. |
|114 authored Masters | All three alternatives per character; distinguish released from internal seasonal content. No blanket text replacement. |
| Ascension/Imbues | Preserve state/costs or obtain a precise conversion/refund decision. Skill1/Skill2 swapping must not silently move invested upgrades. |
| Captured copies | Keep UUID, level/form, locks, kit snapshot, lack of unavailable skills and mixed-squad viability. |
| Frozen runs | Rules-version restart with original frozen roster/gear/investments; saved rewards retained; stale actions do not execute on a replacement encounter. |
| Authority/client | Pure shared definitions and matching deployment; historical idempotent receipts retain actual saved outcomes. |
| Presentation | Character, Collections, Team, Battle menu, field statuses, cost preview, target preview, VFX/impact timing and accessibility. |
| Saves/acquisition | No load-time writes, no auto-granted team, no inventory deductions for historical evolutions, no new banner rarity claim. |
| Activities | Solo opening Story/Training and Lv.30 infusion; ordinary progression; optimized non-Calamitic late groups; Calamity separate. |

Some generated compatibility documents show historical catalog counts. Inventory
the current runtime catalogs when implementing; do not assume the older177-entry
matrix fully includes current114 Masters and all newer ordinary effects.

The just-released economy remains a fixed baseline for the first combat
experiment: additional farm reduction,1.5x rounded upgrade materials and
Value1/2/3/8/15 evolution fodder. Do not change costs simultaneously to make
clear-rate comparisons look better. Measure pacing separately.

## 8. Phased plan with review stops

### Phase0: evidence and owner decision

Deliver this audit, a current catalog inventory, and approval of the proposed
direction. No implementation. Settle the decisions in section10.
Current full-roster rankings are historical after newer mechanics/rosters;
reuse the [non-Calamitic methods](../roster-capability-audit.md), not stale ceilings.

### Phase1: controlled three-starter prototype

Build an isolated gameplay simulation/playable study for Infernis/Tizu/Flora,
using actual owned-like loadouts and the existing combat presentation foundation.
Do not connect it to real-account mutations or resume the all-screen UI mock-up.
Test consistent grammar first, keeping baseline stats/Gauge/economy.
Compare readability-only and functional kit simplification separately.
Owner reviews exact kits before a public migration.

### Phase2: Gauge/climax A/B

Only after phase1, compare the three cost/recovery alternatives above.
Report first-use timing, defensive opportunity cost and repeat cadence across
solo/duo/trio, base gear and advanced builds. Select one architecture.
Do not include random Types, REC, leader bonuses or trees in this experiment.

### Phase3: leader/passive/Master consolidation

Pilot one leader bonus per starter if separately approved. Assign each passive
and Master one clear responsibility. Audit all affected equipment and invested
progress. Stop if support identity or solo viability depends on owning another
rare character.

### Phase4: released roster batches

Rework by tactical clusters, not all32 at once:
1. Accessible starters and Standard roster.
2. Rose/War coordinated attackers and tanks.
3. Released Moon healers/supports.
4. Calamitic high-end rules, reviewed separately.

Each batch requires identity sketches, exact approved kits, full gear matrix,
readability review and pressured encounter results. Character art is reused.
Sunshade remains an internal pre-launch audit; no marketing/availability changes.
Overlapping tank/healer/alternation groups need explicit differentiation sign-off.

### Phase5: optional progression features

Only if players still need more build choice, compare a small mastery choice
against existing Masters. Recovery, reversible specializations and consumables
are independent proposals with their own tests; adding all is not the goal.
New guest/friend combat features and squad-size expansion are out of scope.

### Phase6: controlled release and observation

Publish shared client/authority only after acceptance, with exact rules migration,
historical receipt checks and hosted verification. Record which kits changed.
Monitor ordinary progression/frustration and unintended loops before the next
batch. Owner rollback policy must preserve new saved acquisitions and progress;
never revert wallet data just to return to old combat rules.

## 9. Validation and proposed acceptance gates

These are proposed targets, not claims that testing has already occurred.

### Comprehension/playtest

Recruit5-8 consenting participants mixing new and experienced players; do not
invent population averages from this small sample.
- After60 seconds with a character reference, at least80% identify its job,
  basic setup/payoff and defensive limitation without facilitator coaching.
- At least80% predict the target/effect/cost of representative legal actions.
- Track misclicks, misunderstood duration, wrong-resource waits and time spent
  reopening references; aim for fewer than the same participants' baseline.
- Ask whether a climax feels worth its cost and whether an ordinary turn offers
  a meaningful choice. Record qualitative findings, not just damage output.
- Keyboard/touch/Reduce motion users receive the same actionable state.

### Simulation/mechanics

- Separate zero-Defense DPR, realistic-Defense damage, effective healing,
  Shield creation, actual absorbed damage and packet survival.
- Compare1/2/3-member legal squads; only the single selected starter is free.
- Cover Lv.0/30/45/60/75/90/105, applicable Calamitic110/Ascended115 and
  captured60. Test no gear, ordinary progression and conditional optimized gear.
- Use multiple fixed seeds and pressured encounters. The current five-seed
  Lv.30 entry check is a regression baseline, not a complete clear-rate study.
- Preserve native/Conduit origin distinctions, no recursion, no duplicated
  Gauge from AoE/multi-hit/periodic packets and no heal-on-aura gain.
- Check first/second evolution access against the current fodder requirements.
- Test frozen-run resume/restart, Settings, Continue, Retry, defeat and final
  replay; every saved reward remains exactly once.

### Equipment and migration

- Every released Conduit/Master gets a compatible mapped effect or an explicit
  owner-approved conversion path; no hidden dead equipment.
- Retain owned IDs/counts/upgrades/configurations/locks and skill investments.
- Validate malformed/stale requests, overflow, denied saves and concurrent
  revision conflicts through the authority.
- Test unmarked historical receipts and new receipts without rewriting outcomes.
- Never balance ordinary enemies against a strongest paper outlier or merge
  Calamitic ceilings into ordinary expectations.

### Presentation

- Clear actual cost/target/readiness, one personal indicator and concise effect
  feedback; detailed source/math remains reachable.
- Measured animations over time, impact-aligned HP updates, immediate Skip,
  pointer-transparent/disposable effects and static Reduce motion feedback.
- No art/VFX flashes claim success before the save/accepted battle transaction.
- Any prototype's performance is measured; no60fps guarantee from screenshots.

## 10. Owner decisions before coding

1. **Direction:** standardize/simplify the current four actions, or prototype a
   strict two-tier upgrade ladder for selected characters?
2. **Climax:** retain personal Last Flare or test a team resource replacing its
   personal cost? Retain recovery in the first comparison?
3. **Stats:** simplify display of existing stats first, or specifically explore
   a true fourth Recovery stat and its investment conversion?
4. **Leader:** add one small leader bonus later, or leave positional leadership
   cosmetic and keep team influence in existing passives/Masters?
5. **Unlocks:** keep every currently owned active usable, or approve staged
   evolution unlocks with an explicit no-loss/compensation policy?
6. **Customization:** Masters as the main choice, or a replacement mastery
   system? Random summon Types are not recommended.
7. **Pilot scope:** three starters only, with an isolated no-account prototype
   and a review stop before roster rollout?
8. **Complexity budget:** approve one main personal hook/indicator and a common
   timing/scaling glossary, including a deliberate review of shield stacking?

**Recommended approval package:** phase1 starter-only prototype, current core
stats, no random Types/REC/tree/unlock loss, existing individual Gauge baseline,
one-hook grammar and a later separately reviewed team-climax experiment.
Do not begin all-roster implementation from a general preference for the reference.

## 11. Audit conclusion

Last Light does not need to become a clone or accumulate every historic system
to feel more intuitive. It already has normal attacks, personal Gauge, two
techniques, a climax, passives and deep equipment choices.

The refresh should make a player say **"I know what this character is for, I
know why this move is ready, and I know when to use it"**. Shared vocabulary,
distinct roles, fewer simultaneous counters and a measured climax choice are
more likely to achieve that than random Types and several new progression bars.
This plan changes no live mechanics until the owner selects and approves a phase.
