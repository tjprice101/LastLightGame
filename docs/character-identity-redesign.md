# Character identity redesign: sixteen native kits (D-311 / D-316)

## Status and direction

**Implemented locally under D-316; publication remains separate.** The owner
approved the complete sixteen-character redesign, dependent equipment
adaptation, historical-encounter restart and measured numeric tuning.

The request covers passive, both ordinary skills, Last Flare and the decisions
those actions create. New names, animations, percentages or differently colored
versions of the same rotation are not enough. Sharing an element must not mean
sharing a kit. Infernis and Crinso are the clearest required contrast.

This replaces the previous native kits rather than layering bonuses over them.
It supersedes the historical shared loops in
[the intrinsic kit specification](character-kit-rework.md), not shared status
definitions or independent equipment. The reviewed mechanic rationale below
retains first-pass numbers; the exact current tuning in this section takes
precedence.

## Current tuning and implementation

**D-415:** native ongoing/triggered damage can critically hit, including Burn,
detonations, Cyclones, recalled blades, Wounds, traps and Foundation strikes.
Thorn Trap type follows its authored empowered flag, not scaled damage.
[Exact resolution and compatibility rules](combat.md#all-character-kit-damage-can-crit-d-415)
supersede earlier no-critical/no-RNG statements.

**D-378 Last Flare tuning:** owner selects3x damage and1.5x other potency.
This multiplies the previously live Last Flare values, not Normal Attack or
Skill1/2. Damage includes Burn/traps, recalled blades, a released Cyclone and
Wounds/Foundation payoffs. Healing, shields, Critical Rate bonuses, Cover,
Instructions, ward reduction and Defense ignore gain1.5x. Resource counts,
targeting, costs, cooldowns, durations and recovery stay unchanged; existing
natural caps and actual missing-HP limits still apply. Independent generated
Conduit effects keep their own formulas. Bruno's native Shield replacement
also gains1.5x; its current Master formula is375% Defense or37.5% HP.
Already pending status packets keep their original snapshot; new casts use
the new potency. No account migration, grants or encounter reset.

Primary native **skill** direct coefficients use a fixed1.6 tuning factor over
the reviewed first pass. Normal Attack, critical fundamentals, fixed follow-ups,
Burn, pierce, buffs and mitigation do **not** receive that factor. Authored
coefficients do not receive the old additional generic potency multiplier.
`content/native-balance.ts`, `content/native-identities.ts` and
`game/native-kits.ts` implement these values.

| Bearer | Skill 1 direct | Skill 2 direct | Last Flare direct |
| --- | --- | --- | --- |
| Infernis | 256% A | 176% A all enemies | 960% A all enemies |
| Tizu | 240% A | None | None |
| Flora | 224% A | None | None |
| Atmoso | 288% A | None | 960% A all enemies |
| Elise | 176% A throw; 224% A with no held blade | 224% A only when no blade is lodged; otherwise fixed recall | 1248% A selected enemy after recall |
| Bliss | 272% A | 192% A all enemies | 1200% A all enemies |
| Bruno | 304% A | None | None |
| Disciple | None | None | None |
| Aurora | None | 160% A all enemies | None |
| Razor | 256% A plus fixed Wounds payoff | None | 1056% A plus tripled Wounds payoff |
| Rosetta | 256% A | Quarry320% A +40 pp per other contributor, cap400%; fallback256% A | 1440% A selected Quarry/enemy |
| Thornia | None | 272% A plus fixed trap consumption | 672% A all enemies |
| Crinso | 256% A | 320% A, or384% A after Gold | 1248% A +216 pp per Combo;1896% at Combo3 |
| Nerithe | 288% A | 208% A all enemies | 1344% A surveyed/selected enemy |
| Orvella | 224% A with Foundation; otherwise288% A | None | 960% A all enemies plus tripled finite demolition |
| Vaelor | 272% A | 192% A all enemies | 1248% A, or1632% A during Crescendo |

Flora's ordinary Seed stores50% R, empowered Seed97.5% R, and Last Flare's
immediate heal offers75% R. No automatic native passive heal remains. Tizu's
selected one-phase Shelter offers45% R; two-phase Ocean Memory offers52.5% R
to each living ally and first-hit45% reduction. Equipment and
Instructions modify these offers once under their explicit rules.

Ordinary skill/passive values remain: Infernis25% A Burn, Cyclone70% +30%
per Gust, Elise90% recalls/60% convergence, Bruno50% Cover, Instruction30%/35%,
native Quarry8% contributor shields, Thornia60% retaliation and Foundation30% H.
Last Flare now offers135% A Burn,3x Cyclone releases,270% recalls/180%
convergence,60% Cover/30% H self Shield,45%/52.5% Resolve bonuses,75% Aurora
ward,15% Rosetta/Closing Bliss healing,45 pp Opening Bliss Critical Rate,
270% trap retaliation and45% Crinso/22.5% per-point Nerithe Defense ignore. The
[133-item compatibility matrix](character-conduit-compatibility.md) documents
each retained/adapted item, including intentional transformations of these
values or targets.

The owner explicitly reconfirmed the old unequipped Lv38/Evo2 Infernis solo
dungeon clear; it is preserved. Final built-squad and Calamity victory
thresholds/seeds are not lowered. Pilots use actual ally targets, delayed Seeds,
taunt/barrier timing, Quarry contribution order and legal eight-slot +5 builds
suited to current kits, not obsolete Burn/Weaken/shield dependencies.

Rules version3 restarts only historical **current encounters**, preserving
frozen team/progress/gear/upgrades/captures and saved rewards. Current version3
Settings/resume does not restart. Authority read/checkpoint saves a restart
once before exposing it; stale input never executes against the new encounter.
No account migration, grants, refunds or automatic unequips.

## What the current audit found

Reviewed the actual sixteen definitions in `content/combat.ts`,
`content/flagships.ts` and `content/war-characters.ts`, plus the native-loop
contract and pending Conduit redesign.

- Infernis, Atmoso, Bliss, Disciple, Elise, Crinso and Vaelor have closely related
  low-health outgoing-damage passives.
- Tizu, Bruno, Razor and Orvella repeat flat defensive passives, team shielding
  and an area-damage-plus-shield Last Flare.
- Atmoso, Elise and Vaelor share critical-earned Tempest, skill spending and
  area burst. Different multipliers do not create different play.
- Aurora, Rosetta and Nerithe heavily repeat single-target Weaken, area Weaken
  and a larger area-Weaken Last Flare.
- Infernis and Crinso both lean on low-health damage, Burn/area attacks and
  a larger area finisher. Rose Duality does not sufficiently change their
  fundamental decision pattern.
- Shared mechanics have legitimate value, but too many complete action layouts
  are shared. The replacement must differ in decisions even with no Conduits.

## Boundaries and numeric conventions

Unless individually reviewed and approved otherwise:

- Keep all16 IDs, names, lore, weapons, elements, stars, six forms, acquisition,
  owned progress, artwork and invested resources. Role descriptions may become
  more specific; no rarity-based promise that one kit is simply stronger.
- Keep playable stat growth/caps, base stats, current damage/Defense math,
  critical chance/multiplier, Normal Attack and Defense fundamentals.
- Normal Attack retains its existing Gauge gain, including Nerithe's fixed
  additional5; Defense retains its existing action/mitigation behavior.
- Skill1 costs25 Gauge, Skill2 costs40, Last Flare costs100. Ordinary skills have
  no cooldown, including successive turns. Every action still spends the actor's
  turn; every Last Flare retains full next-turn recovery. Nothing below creates
  free turns, revives, captures or rewards.
- Each passive below **replaces** the old passive. Each listed action **replaces**
  that slot's native effects. Unlisted old Burn, Weaken, crit bonuses, shields,
  low-health bonuses and shared personal charge loops do not silently survive.
- `A` = caster's frozen equipment-adjusted Attack; `H` = caster maximum HP;
  `R` = recipient maximum HP. Direct coefficients such as160% are Attack-based
  attacks through existing Defense/Weaken/critical resolution. Direct damage
  rounds only at the existing outcome boundary.
- HP-fraction healing/shields do not receive another HP-growth multiplier.
  Fixed Attack-based native follow-ups are Defense-mitigated, can crit and
  generate no Gauge. Damage-over-time uses existing Burn bypass rules.
- First-pass percentages/thresholds below are fixed with level; scaling is through
  A/H/R. Do not also apply old generic potency growth unless explicitly retuned
  and documented. This avoids inadvertently making proposed caps meaningless.
- Timed effects specify enemy phases or player turns. Count durations at the
  named phase boundary, not once per hit. "Next player turn" means the next
  global player-turn start, not the next click by that actor.
- No random passive procs are proposed. D-415 adds per-packet combat critical
  rolls to native follow-ups without advancing unrelated reward RNG.

## Identity map

| Character | Exclusive primary play pattern | Main planning question |
| --- | --- | --- |
| Infernis | Persistent fire maintenance versus early detonation | Keep Burn ticking or cash out remaining ticks? |
| Tizu | Time a strong single-ally barrier for a known strike | Who needs protection before this enemy phase? |
| Flora | Plant delayed recovery, then choose growth or harvest | Can healing wait, or must it land now? |
| Atmoso | Spend friendly actions to charge a delayed wind field | Act early to gather wind or release before allies act? |
| Elise | Two-shuriken placement and recall across targets | Split blades for coverage or converge on one target? |
| Bliss | Position in the allied action sequence, not formation | Open the turn or close it for a different payoff? |
| Bruno | Redirect a chosen ally's damage onto himself | Whom can Bruno safely cover this phase? |
| Disciple | Give a chosen ally a conditional attack instruction | Which ally/action should receive the command? |
| Aurora | Forecast and damp a particular hostile skill | Which announced enemy ability must be contained? |
| Razor | Convert actual HP loss into a revenge strike | Retaliate now or hold bounded wounds for a finisher? |
| Rosetta | Coordinate different allies against a single quarry | Can distinct allies complete the hunt this phase? |
| Thornia | Punish repeated hostile attacks with planted thorns | Which attacker will trigger the most thorns? |
| Crinso | Alternate two blade edges for a four-step combination | Continue the combo or take the less efficient repeat? |
| Nerithe | Chart a target with Normal Attacks, then pierce it | Use Gauge now or survey once more? |
| Orvella | Build a finite-HP team structure, repair or expend it | Preserve the foundation or sacrifice it for pressure? |
| Vaelor | Three-turn repeating burst cadence | Spend on the right beat or wait with a Normal Attack? |

### Infernis versus Crinso, explicitly

Infernis is a patient damage-over-time specialist who decides whether to preserve
future fire damage or detonate it early. Crinso is a direct single-target combo
duelist who alternates sword edges and does **not** author Burn, fire charges or
a low-health passive. Infernis is rewarded for maintaining target effects across
enemy phases; Crinso is rewarded for ordered personal actions across turns.
Neither is the other's rotation with a different coefficient or palette.

## Reviewed mechanic designs (first-pass numbers; current tuning above)

All values are reviewable first-pass tuning, not verified balance.
Existing ability names are retained where their visual/weapon identity still fits.

### 1. Infernis - banked fire / detonation

- **Passive - Unbroken Ember:** Infernis-authored Burn lasts three enemy phases.
  Reapplying it refreshes remaining phases to3 and uses the stronger tick amount;
  it does not stack or tick immediately. No low-health damage bonus or Ember bank.
- **Skill1 - Cinder Cleave:**160% direct damage to one enemy; apply personal
  Burn at25% A per phase. Establishes a persistent damage investment.
- **Skill2 - Flame Arc:**110% direct damage to all enemies. On each survivor,
  consume up to two remaining phases of Infernis's Burn and immediately deal
  the exact stored tick damage for those phases. Remaining duration decreases
  accordingly; other owners' Burn is untouched. With no personal Burn it is
  only the110% area attack.
- **Last Flare - Dawnfire:**200% direct damage to all enemies; replace/refresh
  Infernis's Burn with a stronger45% A tick for three enemy phases. No immediate
  detonation. Fire continues during Infernis's mandatory recovery if she lives.
- **Play:** Cinder -> let fire work -> refresh or detonate before a target dies.
  Dawnfire sets up prolonged pressure rather than duplicating a bigger Flame Arc.
  Weak against very short fights; detonation trades future damage for immediacy.

### 2. Tizu - precise barrier timing

- **Passive - Stillwater Guard:** when Tizu's own ability shield fully absorbs
  an enemy's direct hit with zero HP loss, that recipient gains8 Gauge,
  once per recipient per enemy phase. No personal Ward bank or flat Defense bonus.
- **Skill1 - Undertow Thrust:**150% direct damage to one enemy; apply25% Weaken
  to its next one enemy-phase attack window. Cheap enemy-side pressure control.
- **Skill2 - Tidal Shelter:** select one living ally; refresh a shield worth
 24% R, expiring after the next enemy phase. No automatic team shield.
- **Last Flare - Ocean Memory:** all living allies receive a shield worth18% R
  through the next two enemy phases. Their first direct hit while this shield
  remains receives30% damage reduction before shield absorption. No direct attack.
- **Play:** inspect scheduled threats and choose a high-value barrier recipient.
  Strong against one predictable burst; short barriers punish mistiming.
  Ally-target selection is a new UI requirement, not automatic lowest-HP targeting.

### 3. Flora - delayed garden / emergency harvest

- **Passive - Root of Hope:** each living ally can hold one Flora Seed.
  At the next player-turn start, each Seed restores12% R and disappears.
  Seeds do not stack; replacing one resets its delivery time. No automatic
 5% team healing or healing-earned Bloom counter.
- **Skill1 - Briar Shot:**140% direct damage to one enemy; plant a Seed on
  the living ally with the lowest HP fraction (squad order breaks ties).
- **Skill2 - Verdant Renewal:** immediately harvest all existing Seeds for
  their12% R healing, then plant a new Seed on every living ally.
  No revive, outgoing-Attack buff or heal from an empty harvest.
- **Last Flare - Worldseed:** immediately heal all living allies by18% R,
  then plant an empowered Seed on each, restoring20% R at next player-turn start.
  No direct damage. A normal Seed never overwrites an empowered pending Seed.
- **Play:** prepare recovery before damage or harvest early during an emergency.
  Slower and less burst-protective than Tizu. Seeds require Flora alive when
  delivered and cannot revive a defeated recipient.

### 4. Atmoso - early-turn wind field / delayed release

- **Passive - Gale Cadence:** while Cyclone is active, each *other* living ally's
  completed native action adds one Gust, once per ally per player turn, cap4.
  No critical-earned Tempest or low-health bonus.
- **Skill1 - Razor Gale:**180% direct damage to one enemy; if a Cyclone exists,
  release it early against all living enemies and end the field.
- **Skill2 - Cyclone Weave:** create a Cyclone with zero Gusts for two enemy
  phases. When its second phase ends, release against all living enemies:
 70% A plus30% A per Gust, cap190% A, fixed native damage. Casting again while
  active releases the old field first, then creates a fresh empty field;
  never carries Gusts forward.
- **Last Flare - Sky Without End:** release any active Cyclone at its actual
  Gust value, then deal200% direct damage to all enemies. No field is created.
- **Play:** set wind before allies act; decide whether remaining ally actions
  justify waiting for a larger release. Solo remains usable but undercharged.
  The field needs Atmoso alive to release and cannot earn from its own damage.

### 5. Elise - place two shuriken / recall

- **Passive - Stormwheel Rhythm:** Elise has exactly two native shuriken,
  initially in hand. Each can be either held or lodged in one living enemy.
  Lodged blades return harmlessly when their target dies; no Tempest counter.
- **Skill1 - Voltstar Cut:** if a blade is held, throw one for110% direct damage
  to the chosen enemy and lodge it. With no held blade, perform a140% direct
  strike instead, without relocating blades. Both blades may lodge in one target.
- **Skill2 - Crosscurrent Volley:** recall all lodged blades. Each deals a
 90% A fixed native strike to its own target before returning; both lodged in
  one target add a single60% A convergence strike to that target. With both
  blades already held, deals one140% direct strike to the selected target.
- **Last Flare - Infinite Thunderwheel:** recall lodged blades using the same
  bounded rule, then throw both as one260% direct strike to the chosen enemy;
  both end held, regardless of survival. No area damage baseline.
- **Play:** spread blades across enemies or concentrate them for convergence.
  Setup persists without duration but competes with Gauge and immediate damage.
  Recall strikes are nonrecursive and each rolls its own critical outcome.

### 6. Bliss - opening dancer / closing dancer

- **Passive - Stillfeather Tempo:** each native action gains exactly one posture
  based on other living allies who have already acted this player turn:
  **Opening** if none; **Closing** if all; **Passing** otherwise.
  Solo always counts as Opening, not both. No healing-earned Bloom bank.
- **Skill1 - Warfeather Cut:**170% direct damage to one enemy. Opening adds25pp
  Critical Rate to this attack; Closing restores6% R to the most injured other
  living ally; Passing has neither bonus.
- **Skill2 - Quietstorm Flourish:**120% direct damage to all enemies.
  Opening grants living allies10% outgoing direct damage until this player turn
  ends; Closing refreshes a6% R team shield through the next enemy phase.
- **Last Flare - Thousandfeather Stillness:**250% direct damage to all enemies.
  Opening adds30pp Critical Rate to this attack; Closing restores10% R to other
  living allies. No Passing bonus, no full-healer replacement.
- **Play:** use her early for offense or reserve her action for modest team
  recovery/protection. Distinct from Vaelor's multi-turn clock and Atmoso's field:
  Bliss reads current allied action order, not stored actions or elapsed turns.

### 7. Bruno - deliberate interception

- **Passive - Faultbound Resolve:** reduce damage redirected to Bruno by25%.
  This affects only his interception, not every incoming attack. No flat Defense
  bonus, retaliation or absorbed-damage resource.
- **Skill1 - Seismic Hammerfall:**190% direct damage to one enemy. No Weaken.
- **Skill2 - Citadel Mantle:** choose another living ally to Cover through the
  next enemy phase. Redirect50% of that ally's post-mitigation direct incoming
  damage to Bruno; only one covered ally at a time. Recasting replaces the target.
  Solo fallback: Bruno instead receives20% direct-damage reduction for that phase.
- **Last Flare - Worldwall Ascendant:** Cover every other living ally for two
  enemy phases, redirecting40% per hit. Replaces the single-target Cover rather
  than adding to it. Bruno also receives a personal20% H shield for that duration.
- **Play:** protect a vulnerable damage dealer while managing Bruno's own HP.
  No damage payoff; careless area interception can defeat Bruno.
  Redirected damage cannot be redirected again and is never a new enemy attack.

### 8. Disciple - ally instruction / conditional empowerment

- **Passive - Shared Mindflame:** Disciple may maintain one Instruction on one
  chosen living ally, including self. It expires after that ally's next native
  action or at the end of the next player turn, whichever happens first.
  Replacing an Instruction discards the old one, not stacks it.
  New Instructions become active after their granting action finishes; that
  action cannot immediately consume or amplify its own new Instruction.
- **Skill1 - Thoughtspark Benediction:** give **Strike**: the recipient's next
  native damaging action gains30% outgoing direct damage. A support action
  consumes the Instruction without the damage bonus.
- **Skill2 - Concord of Chaos:** give **Shelter**: the recipient's next native
  heal or shield action gains35% native healing/shield amount; a purely damaging
  action consumes it without benefit. Does not amplify Conduit-generated outcomes.
- **Last Flare - Unbound Mindcrown:** give **Resolve** to all living allies:
  their next native action gets Strike and/or Shelter according to its actual
  effects. These replace any current Instruction, expire by the end of the
  next player turn and do not stack with an earlier Instruction.
- **Play:** Disciple must act before the ally and choose the correct action type.
  No direct damage, team-wide permanent Attack buff, Gauge refund or free turn.
  Hybrid actions can use both Resolve parts once, with no recursive amplification.

### 9. Aurora - hostile skill forecaster

- **Passive - Lens of Diminishment:** always display each living enemy's next
  scheduled special/ultimate and due enemy-phase number in her battle reference.
  Against an enemy with no scheduled special, show that explicitly. This does
  not create private information or change scheduling/RNG.
- **Skill1 - Gleamseal:** choose one enemy; its next scheduled special/ultimate
  within three enemy phases deals40% less direct damage. Seal is consumed by
  that activation only, does not affect Normal Attacks and cannot delay it.
- **Skill2 - Eclipse Mandate:**100% direct damage to all enemies; apply a25%
  special/ultimate reduction Seal with the same three-phase window to survivors.
  Per owner/target, refresh duration and retain stronger reduction; never stack.
- **Last Flare - Final Dawn Verdict:** for two enemy phases, all living allies
  take50% less direct damage from hostile ultimates specifically. No protection
  against normal/ordinary skills, no attack or Weaken.
- **Play:** spend on an imminent special rather than repeatedly weakening every
  enemy. Combine with ordinary mitigation under a shared cap; no stun/skip,
  effect cleansing or universal enemy-mechanic bypass is proposed.

### 10. Razor - wounds into vengeance

- **Passive - Unbroken Night:** bank actual direct enemy HP loss suffered by
  Razor as Wounds, cap30% H. No shield absorption, redirected damage, Burn,
  self-cost or generated effects contribute. Healing does not erase the bank.
- **Skill1 - Nightcleave:**160% direct damage to one enemy, then spend up to
 10% H Wounds for a fixed strike with Attack power equal to the amount spent,
  Defense-mitigated. No Wounds still permits the ordinary160% attack.
- **Skill2 - Eclipse Bastion:** reduce Razor's direct incoming damage by30%
  for the next enemy phase. At phase end, if Razor lost any direct HP that
  phase, refresh a personal shield equal to that loss, cap12% H, through the
  following enemy phase. No team shield or immediate revenge damage.
- **Last Flare - Unbroken Midnight:**220% direct damage to one enemy; spend
  all Wounds for a fixed strike using twice the amount spent, capped60% H power.
  Bank resets before the strike; no life steal or revive.
- **Play:** endure and retaliate, choosing small cashouts or a large single-target
  revenge. Unlike Bruno he does not protect others by redirecting their damage;
  unlike Thornia he must lose HP, then spend his own action to deal the payoff.

### 11. Rosetta - coordinated quarry hunt

- **Passive - Virtuous Bloom:** one personal Quarry may exist. Track which
  distinct living allies land a native direct hit on it this player turn.
  Once two different allies hit, refresh an8% R shield on those contributors,
  once per player turn total. No passive healing, Burn or Rose Grace healing bank.
- **Skill1 - Golden Thorn Volley:**160% direct damage to one enemy and designate
  it as Quarry until it dies or Rosetta marks another. The designating hit
  counts as Rosetta's contribution. Re-marking the same target preserves
  current-turn contributor history; changing target clears it.
- **Skill2 - Crimson Skyfall:**200% direct damage to the Quarry if living;
  otherwise160% to the selected enemy. For each distinct *other* ally who has
  hit the Quarry this turn, add25% coefficient, cap250%. Does not mark a target.
- **Last Flare - Rose Beyond the Sun:**300% direct damage to the Quarry or
  selected fallback. If the Quarry has at least two distinct contributors this
  turn, restore10% R to living contributors. Does not heal nonparticipants.
- **Play:** concentrate different members' actions and order Rosetta's cashout
  after allies hit. Solo keeps basic attacks but cannot earn the team condition.
  Unlike Aurora this is allied coordination, not stronger enemy Weaken.

### 12. Thornia - enemy-triggered thorn trap

- **Passive - Forbidden Garden:** one Thornia trap per enemy may exist, with up
  to three charges. When that enemy completes a direct damaging action against
  any ally, spend one charge and strike it for60% A fixed native damage.
  One charge per activation, not per hit or target; shielded attacks count,
  fully prevented/no-damage actions do not. No Thorn Aegis shield bank.
- **Skill1 - Gilded Thorn Guard:** place three trap charges on the selected
  enemy for three enemy phases. Refresh to three, never add; no direct damage.
- **Skill2 - Shadow Rose Cleave:**170% direct damage to one enemy. If it has
  a personal trap, consume one charge for an additional80% A fixed strike.
  The choice sacrifices a future retaliation for immediate damage.
- **Last Flare - Thousand-Rose Dominion:**140% direct damage to all enemies;
  place an empowered three-charge trap on each survivor,90% A retaliation,
  lasting three enemy phases. Stronger traps cannot be downgraded by Skill1.
- **Play:** seed the threatening attacker and punish its actions, or harvest a
  charge now. This is hostile-action-triggered damage, not team shielding,
  transferred damage, actual-HP-loss banking or Infernis's phase-based Burn.

### 13. Crinso - dual-edge combo duelist

- **Passive - Rose Duality:** ordinary skills use **Gold** or **Crimson** edge.
  Switching edges advances Combo by1, cap3; repeating an edge resets Combo to0.
  First edge establishes the stance at Combo0. No Burn, low-health bonus or
  fire-earned charges. Personal combo persists across turns until spent/reset.
- **Skill1 - Golden Edge:**160% direct single-target damage. If the previous
  ordinary skill used Crimson, ignore20% of effective Defense for this attack.
  Resolve this attack, then update previous edge/Combo to Gold.
- **Skill2 - Crimson Rupture:**200% direct single-target damage. If the previous
  ordinary skill used Gold, add40% coefficient (240% total). Resolve, then
  update previous edge/Combo to Crimson. No area damage or elemental Burn.
- **Last Flare - Blossoming Cataclysm:**260% direct damage to one
  enemy plus45% coefficient per stored Combo, cap395%. At Combo3 ignore30%
  effective Defense for this attack. Consume Combo and clear previous edge
  before damage, then recover next turn.
- **Play:** Gold -> Crimson -> Gold -> Crimson establishes a full combination,
  but Gauge/action costs may require Normal Attacks between edges; Normal and
  Defense neither build nor break it. Last Flare can cash out early.
  A repeated edge remains usable but gives up the combination payoff.

### 14. Nerithe - survey / precision pierce

- **Passive - Uncharted Current:** retain exactly+5 Normal-only Gauge.
  A Normal Attack also adds one personal Survey point to its target, cap3.
  One surveyed target at a time; surveying a different enemy removes old points.
- **Skill1 - Meridian Break:**180% direct damage to the surveyed target or
  selected fallback. Spend up to one Survey point to ignore25% effective
  Defense for this attack. No point means no pierce; no Weaken.
- **Skill2 - Fold the Sea:** move the current Survey designation/points to the
  selected living enemy, then deal130% direct damage to every enemy. If no
  Survey exists it remains an area attack; it does not create points.
- **Last Flare - Ocean Beyond the Map:**280% direct damage to the surveyed
  target or selected fallback; consume all points for15% Defense ignore each,
  cap45%. No added area attack or debuff.
- **Play:** Normal Attacks create precision and Gauge; decide whether to spend
  one point now, redirect the map, or save three for a boss finisher.
  Unlike Rosetta, allies never build Survey; unlike Crinso it is target investment,
  not alternation. Survey disappears if its target dies.

### 15. Orvella - construct / repair / demolition

- **Passive - Load-Bearing Will:** one Foundation may exist, with its own finite
  durability. For each direct incoming hit on a living ally, it absorbs up to
 20% of that hit's post-mitigation damage before personal shields, limited by
  remaining durability. It has no independent turn, targetability or creature ID.
- **Skill1 - Keystone Reversal:**140% direct damage to one enemy; repair an
  existing Foundation by8% H up to its original maximum. Without one, deal
 180% instead; this action never creates a Foundation.
- **Skill2 - Raise the Faultline:** create a Foundation with30% H durability,
  lasting three enemy phases. Recasting replaces it at full durability, not
  stacks or detonates it. No personal/team shield resource is granted.
- **Last Flare - Worldweight Citadel:**200% direct damage to all enemies.
  If a Foundation exists, consume it for an extra fixed strike against each
  enemy using remaining durability as Attack power, cap30% H. No new Foundation.
- **Play:** invest in team structure, repair it efficiently or sacrifice remaining
  defenses for a burst. Unlike Bruno it never transfers damage to the caster;
  unlike Tizu it is one shared destructible budget rather than per-ally barriers.

### 16. Vaelor - deterministic three-beat burst

- **Passive - Standing Thunder:** personal Beat follows the global player-turn
  cycle **Tune -> Rise -> Crescendo -> Tune**, beginning Tune at encounter entry.
  It advances once each turn even if Vaelor recovers or cannot act. No critical
  Tempest resource, low-health bonus or action-order condition.
- **Skill1 - Forked Cadence:**170% direct damage to one enemy; on Tune add30pp
  Critical Rate to that attack. Other beats retain the170% attack.
- **Skill2 - Resonance Cascade:**120% direct damage to all enemies; on Rise
  refresh20% outgoing direct damage on Vaelor through the end of his next
  player turn, not on the team. Recasting refreshes, never stacks.
- **Last Flare - Last Chord of the Sky:**260% direct damage to all enemies;
  on Crescendo use340% instead. No forced unusability on other beats.
  Normal Last Flare recovery still spends the following Tune turn.
- **Play:** use Rise to prepare a Crescendo finisher; Normal Attacks between
  skills build the required Gauge, so the ideal schedule is not always affordable.
  Distinct from Bliss: this is a multi-turn timing window, independent of which
  teammate acted first.

## Approved shared interaction rules

These mechanics are implemented alongside the current tuning above.

1. **Ally targeting:** Tizu, Bruno and Disciple need explicit ally selection.
   Keep enemy targeting independent. Holding their affected action should open
   an accessible living-ally picker before commitment; cancel spends nothing.
   Show target in Battle menu too. Never silently select the leader.
2. **Damage pipeline:** apply direct-hit mitigation to the original recipient,
   then resolve Bruno interception, Orvella Foundation, personal shields and HP
   in a documented order. Bruno's redirected share receives his25% interception
   reduction and personal shields, not another Defense roll. No redirection
   chains or duplicate crits. Publish exact events for both recipients.
   For simultaneous area hits, allocate finite Foundation absorption
   proportionally to each hit's eligible20% share before applying any HP changes,
   with stable squad-order remainder rounding. Do not let array iteration grant
   the first ally all protection or let redirected parts re-enter Foundation.
3. **Mitigation limits:** propose a shared60% cap on combined temporary direct
   percentage reductions (combine multiplicatively before cap), separate from
   Defense and finite shields. Scope existing Conduit compatibility explicitly:
   this cap is a proposed balance change, not permission to silently nerf live gear.
4. **Follow-up provenance:** native trap/recall/field/revenge/demolition outcomes
   have explicit origin kinds. Only the primary native action contributes to
   action-based earnings; secondary outcomes cannot create free recursive chains.
   Conduits may enhance a listed outcome only through an explicitly reviewed rule.
5. **Critical and multi-hit semantics:** primary direct attacks use existing
   crit rules; fixed follow-ups never crit. Elise recall does not become multiple
   crit rolls; effects advertised once per action remain once per action.
6. **Owners/deaths:** Burn/traps/seals/Survey/Quarry keep owner and target IDs.
   No cross-owner consumption or resource merging. New personal passives and
   delayed effects require their caster alive when paying out. No healing revives.
7. **Durations:** delayed Seeds resolve at next player-turn start before input;
   two-phase fields release after their second enemy phase. Stronger pending
   Seeds/traps/seals survive weaker refreshes; clocks and amounts remain explicit.
8. **Snapshots:** native state persists through Settings and online resume;
   fresh entries/retries/replays reset it. Continue uses existing encounter-reset
   semantics, with no hidden carryover of combo, blades, constructs or charges.
9. **Old runs:** restart the historical current encounter under rules version3,
   preserving frozen team/equipment/progress and previously saved rewards.
   Communicate the restart and issue a fresh receipt; never apply stale input.
   Current-version Settings/resume retains complete ongoing native state.

## Conduit and Master compatibility is a release prerequisite

The original [D-302 roster](conduit-redesign.md) was designed around the former
native loops. It cannot be implemented unchanged on top of this roster.
Examples: Crinso no longer authors Burn, the three Atmospheric characters no
longer share Tempest, and cooldown reduction does not help ordinary skills.

The generated [133-item compatibility matrix](character-conduit-compatibility.md)
and connected runtime tests cover:

- Which proposed character/action/outcome can actually trigger each item?
- Does it remain useful without inventing a missing native effect?
- Is it native versus generated, per hit versus per action, and single versus AoE?
- Does a personal Master support its bearer without repeating their passive?
- What replaces references to retired personal resources?

Preserve all owned Conduit IDs/counts/upgrades/Masters and their art. Any changed
effect must be explicitly documented/reviewed, not silently erased as "cleanup."
Do not auto-unequip items or mutate accounts as a shortcut for incompatible rules.
Coordinate the character and equipment redesigns before releasing either set
of changed dependencies.

## Presentation and VFX requirements

- Every header/reference explains role, one-sentence play loop and exact actions.
  No generic repeated "build three charges, spend on skill or ultimate" copy.
- Use status widgets only where state matters: Infernis's per-target Burn,
  Elise's two blade locations, Crinso edge/Combo, Vaelor Beat, Orvella durability,
  and other named state. Tizu/Bliss/Aurora do not acquire fake charge counters.
- Show target and timing in hold grids, ally selectors and Battle menu. Use
  readable text/icons, not color-only distinctions.
- VFX communicate mechanics: planted/recalling shuriken, Gold/Crimson edge
  switches, growing wind field, seed delivery, structure depletion and imminent
  Crescendo. Shared bloom rendering is fine; identical attack choreography is not.
- Reuse installed character-specific ability icons where truthful. New status
  art stays neutral pending reviewed delivery; do not invent URLs or claim art
  approval. Preserve element medals, facing, impact-aligned HP/shield ledgers,
  reduced motion, speed controls and action locking.
- One animation must not imply multiple actual actions or rewards. All combat
  resolves/persists once before presentation as required by current authority.

## Approved implementation sequence

1. Approve roster direction and major interaction changes; revise overlaps.
   Review concrete kits, not only theme descriptions.
2. Define typed native-state/effect primitives, ally targeting and exact
   event/provenance/pipeline rules; audit all133 equipment dependencies.
3. Build Infernis/Crinso as contrast pilots. Verify baseline solo usability,
   squad contribution, different turns/actions and no copied Burn setup.
4. Add defensive contrasts Tizu/Bruno/Razor/Orvella, validating mitigation order
   and direct/redirected/shield/HP semantics.
5. Add heal/support/hunt/trap characters Flora/Disciple/Aurora/Rosetta/Thornia.
6. Add timing/placement characters Atmoso/Elise/Bliss/Nerithe/Vaelor.
7. Finalize compatible Conduits/Masters, text, VFX and old-run compatibility.
8. Full roster balance/regression and coordinated client/server publication
   only with approval. No partial client deployment against unsupported authority.

The owner subsequently approved implementation, equipment adaptation,
historical-encounter restart and measured tuning. Publication remains separate.

## Acceptance tests: uniqueness and correctness

- **No-equipment identity:** each character's native loop functions with no
  Conduits/Master. Each of16 has a distinct passive, decision variable and
  principal payoff in actual combat, not just unique description strings.
- **Counterfactual choice:** for every character, test at least two legal
  choices where different timing/targets/state produce meaningfully different
  outcomes. A scripted ideal loop is illustrative, not a forced rotation.
- **Non-copy pairs:** Infernis/Crinso; Atmoso/Elise/Vaelor; Tizu/Bruno/Razor/
  Orvella; Aurora/Rosetta/Nerithe; Flora/Bliss must not share the same complete
  action/effect sequence with substituted numbers.
- **All contexts:** solo, one boss, multi-enemy waves, mixed/captured squads,
  allies acting in different orders, failed conditions, dead targets/casters,
  shields, overheal, overkill and empty resources.
- **All actions legal:** Skill1/2 repeat on successive turns when funded;
  one action per turn and Last Flare recovery unchanged; no free Gauge/action
  loops. Missing captured skills and captured level60 stay unchanged.
- **Exact outcomes:** caps, phase boundaries, owner identity, spend-before-payoff,
  independent critical rolls on native damage, no recursive native/equipment trigger chains and
  no duplicated death rewards.
- **Balance:** measure rounds, effective damage/healing/absorption and seeded
  win rates on the same progression/equipment budget. High rarity is not an
  excuse for strict kit superiority. Include early starter progression and
  several viable endgame squads and implemented Calamity benchmarks.
- **Parity:** descriptions, hold grid, Character, Collections, battle reference,
  events and online engine agree with actual mechanics. Tests inspect state
  and outcomes, not just matching names or snapshots of prose.
- **Reliability:** account saves unchanged, old-run snapshots respected,
  Settings/resume/replay state correct, failed operations atomic.
- Targeted tests for each kit and interaction, full regression, client build,
  server type-check/bundle, desktop/mobile UI/VFX and hosted parity verification
  are required during implementation. Actual local validation and outstanding
  hosted publication are recorded in the [handoff](handoff.md).

## Publication and limitations

The sixteen identities, explicit ally targeting, interception/Foundation,
Instructions, shared60% temporary-reduction ceiling and equipment adaptations
are approved. Base stats, enemy curves and investment budgets are unchanged.
Current hostile production attacks target one ally, including multi-impact
Calamity activations. Foundation's proportional finite-budget helper is tested
for simultaneous area shares; no new hostile AoE activity is implied.

Client/server publication and hosted verification still require authorization.
New mechanic cues reuse existing presentation; no new artwork delivery or
visual approval is claimed.

No ownership compensation, investment reset, new forms, extra characters,
new acquisition rates, cooldown restoration or premium spending is proposed.
