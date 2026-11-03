# Elemental War Phase 1: complete kit and Master Conduit proposal

**Design deliverable, 2026-11-03. Not implemented or balance-approved.**
The owner requested fully specified kits for Caldrex, Solenne and Myrthen.
Their names, elements, roles and broad identities were approved previously.
All new numbers, precise triggers and nine Master packages below are proposed
for review and encounter testing, not claims about the live roster.

One new owner decision is confirmed: **Circle of Repose builds Solenne's
Stillness**, replacing the outline's unavailable Defense-action trigger.
Keep the current four actions; do not introduce a fifth Defense action.

This specification supersedes the older incomplete kit outlines for these
three characters only. It does not change current characters, installed art,
existing Conduits, acquisition rewards or the paused Story project.

## 1. Design at a glance

| Character | Role | Decision loop | Contribution to allies |
| --- | --- | --- | --- |
| Caldrex | Infernic Tank | Receive pressure, bank Heat, choose immediate Burn or a defensive Last Flare | Shields, attention control, allied Burn amplification |
| Solenne | Tranquilitic Tank | Deliberately prepare Stillness, let it absorb pressure or preserve it for a resonant release | Shields, Weaken, attention control |
| Myrthen | Botanic Attacker | Prepare Sprout and Bloom, mark a target, choose a focused or area Harvest | A shared damage window; Master-dependent sustain |

These are complete native kits without equipment requirements. Masters offer
three alternative builds per character; only **one** can be equipped.
No hidden same-element restriction applies. Mixed squads and captured living
allies receive the explicitly squad-wide benefits too.

## 2. Shared numerical and timing contract

### Base attributes, before equipment and role bonuses

All values are Lv.0/Evo.1. Use existing character growth, evolution caps,
upgrade costs and stat normalization, not new growth curves.

| Attribute | Caldrex | Solenne | Myrthen |
| --- | --- | --- | --- |
| Health | 300 | 285 | 220 |
| Defense | 20 | 19 | 11 |
| Direct Attack | 32 | 30 | 44 |
| Critical Rate | 10% | 12% | 22% |
| Critical Damage Multiplier | 1.50x | 1.50x | 1.65x |
| Elemental Gauge Capacity | 100 | 100 | 100 |
| Skill Power | 100% | 100% | 100% |
| Skill Duration | 0 | 0 | 0 |
| Skill Efficiency | 0% | 0% | 0% |
| Elemental Gauge Gain | 100% | 100% | 100% |
| Legacy Elemental Damage field | 0 | 0 | 0 |

Do not add another permanent native stat passive on top of these bases.
The existing role perks apply once through the additive pre-equipment pool:

- Caldrex/Solenne: +50% Defense, 1.25x ordinary random-target weight.
  At base without gear this gives 30 and 28.5 Defense respectively.
- Myrthen: +100% Direct Attack (the current meaning of unconditional
  "+100% Direct Damage"), +50 percentage points Skill Power.
  At base without gear this gives 88 Attack and 150% Skill Power.
- No Support role perk applies to any of these three.
- Existing Element Resonance remains +15% squad Health for two matching
  Element-Bearers, or +25% Health/+5 percentage points Skill Power for three.
  Captured members benefit but do not count toward activating Resonance.

### Formulas and action economy

- `A`: caster's effective Direct Attack for this activation, including role,
  equipment and applicable action modifiers, resolved by the shared pipeline.
- `S`: effective Skill Power multiplier for the relevant native skill packet.
- `H`: each recipient's effective maximum Health at the shield/heal offer.
  These percentages use the recipient, never the caster, unless stated.
- `D`: caster's effective Defense, including personal Master/Heat effects.
- `G`: recipient's current maximum Elemental Gauge Capacity.
- `h` / `s`: Heat / Stillness captured and spent once at cast acceptance.
- A coefficient such as 240% A uses the existing direct-damage pipeline,
  including Skill Power once, Defense, eligible critical outcome, vulnerability,
  mitigation floor, Shield absorption and final damage rounding.
- Every coefficient below is **final authored potency**, including the current
  native 1.6 skill tuning and 3x Last Flare damage/1.5x support tuning.
  Do not multiply those tuning factors again. Do not apply generic legacy
  potency growth to native coefficients; progression already grows resolved
  attributes. Normal Attack remains the standard 100% A basic action.
- Skill 1: base 25 Gauge. Skill 2: base 40 Gauge. Last Flare: base 100 Gauge.
  Use existing Skill Efficiency/cost floors, Gauge availability and action
  restrictions. All authored cooldowns are 0. A successful Last Flare imposes
  the existing full next-player-turn recovery; Masters here never remove it.
- Standard Normal Attack and incoming-hit Gauge gains remain unchanged.
  No new action, free cast, repeat hit or per-target Gauge reward is implied.
- An invalid/rejected action spends nothing and triggers no passive/Master.
  One committed manual action can earn each "per cast" effect only once,
  including area attacks. Finishing the battle stops further combat payouts.

### Status clocks, snapshots and stacking

- One player turn plus its following enemy phase is one round. The "next
  enemy phase" is the first enemy phase after application; skipped/stunned
  enemies do not freeze that phase clock.
- Burn: base 3 enemy-phase ticks, beginning at the next standard native Burn
  tick boundary. Add effective Skill Duration once, capped at 6 total ticks.
  Use the existing native tick order, not a second private tick scheduler.
- Weaken: base 1 enemy phase plus Skill Duration, maximum 3 phases.
  Reduces outgoing enemy direct damage, not Burn or other periodic packets.
  Concurrent Weaken uses the strongest active value; weaker refreshes cannot
  erase a stronger active source. Preserve existing source/expiry bookkeeping.
- Taunt: exactly the next enemy phase, not duration-scaled. Forces eligible
  random single-target enemy actions to the living caster. It does not turn
  an area action into single-target or override authored scripted targeting.
  Competing eligible taunts use the most recently applied one; dead/ineligible
  casters fall back to the shared legal target resolver, not an extra RNG roll.
- Ordinary temporary buffs/debuffs refresh rather than add duplicate same-ID
  stacks. Explicit personal resources and source-owned Mark/Burn are exceptions.
- Native Shield offer = listed fraction x H x S, rounded once at grant.
  Shields are source-attributed, last until broken and stack as actual layers.
  They do not gain extra duration, crit, heal HP or revive. Keep existing
  finite-number/overflow rejection; never silently truncate a failed grant.
- Native percentage healing uses its listed fraction x H x S once, rounded
  and capped by missing HP. The Masters below deliberately use **fixed**
  percentages without S; label them as such.
- Newly granted Shields keep their saved amount through later stat changes.
  Native Burn stores its potency/level snapshot once; it is not rescaled from
  changing Attack or Skill Power each tick. Use the existing source-level
  damage-over-time multiplier `1 + sourceLevel / 30` once.
- Native direct and periodic damage can crit under existing rules; each
  eligible damage packet gets its ordinary combat critical roll. No new
  random proc chances, random recruitment rolls or reward RNG are introduced.
- Heat, Stillness, seasons, marks and counters are battle state, not wallet
  holdings. They begin fresh per encounter, persist exactly across Settings/
  resume, and reset on new stage/retry. Frozen gear stays frozen.
- Existing granted Shields follow normal expiry/death rules; no Master
  removal or caster death retroactively deletes a saved Shield layer. Buffs,
  Burn and Mark that require a living owner become inactive when that owner
  dies. Defeat cannot revive the owner or resolve queued generated benefits.

## 3. Caldrex, Kiln Warden

**Feel:** pressure meets a closed furnace gate. He is a protective forge
guardian, not another Infernis detonation kit.

### Intrinsic passive: Banked Heat

- Start at 0 Heat; cap 3.
- Gain 1 Heat after the first enemy-origin direct impact in an enemy phase
  that removes positive Caldrex Health **or** absorbs positive Caldrex Shield.
  Cap passive generation at 1 per enemy phase, not per enemy/hit/packet.
- Fully negated hits, periodic damage, self-costs, allied effects and damage
  redirected from another ally do not generate Heat. An impact that kills him
  generates nothing; he must still be alive.
- Heat has no expiry and gives no baseline stats. Spending it is optional
  through the appropriate chosen action, not an automatic passive discharge.

### Normal Attack

Standard 100% A single-target attack and standard Gauge gain. Forge-gauntlet
presentation only; no automatic Heat generation, Burn or second damage hit.

### Skill 1: Close the Kiln

**25 Gauge; no cooldown; all living allies / self attention control.**

1. Grant each living ally a Shield worth **12% H x S**.
2. Taunt eligible enemy attacks to Caldrex for the next enemy phase.
3. Does not spend or generate Heat. Does not deal damage.

### Skill 2: Cinder Discharge

**40 Gauge; no cooldown; all living enemies.**

1. Spend all current Heat once; snapshot `h`.
2. Deal **(176 + 24h)% A** direct damage to each enemy.
3. Apply source-owned Caldrex Burn to survivors: **(20 + 10h)% A x S**
   per tick, with the shared source-level multiplier and Burn clock.
4. His Burn is independent of Infernis/other owners. Reapplication refreshes
   this source's duration and retains its stronger stored pre-critical tick.
   Never merge or consume another bearer's Burn.

| Heat spent | Direct coefficient | Burn / tick before source-level factor |
| --- | --- | --- |
| 0 | 176% A | 20% A x S |
| 1 | 200% A | 30% A x S |
| 2 | 224% A | 40% A x S |
| 3 | 248% A | 50% A x S |

Burn bypasses Defense through the existing native Burn resolver; Shields and
critical handling retain their existing rules. It is not direct damage.

### Last Flare: Nothing Beyond These Gates

**100 Gauge; no cooldown; mandatory recovery.**

1. Spend all Heat once; snapshot `h`.
2. Grant every living ally **(24 + 6h)% H x S** Shield:
   24/30/36/42% at 0/1/2/3 Heat.
3. Taunt eligible enemy attacks for the next enemy phase.
4. Grant **Stoked Embers** for the next **2 enemy phases**, fixed duration:
   allied **native Burn ticks** deal **25% more final Burn damage** while
   Caldrex lives. Recast refreshes, never stacks with itself.

Stoked Embers affects existing and newly applied allied native Burn at the
tick, once, without rewriting stored potency or claiming ownership. It does
not amplify detonation/accelerated-tick strikes, ordinary Conduit damage,
all periodic damage, or recursively its own derived effects. This is a new,
explicit runtime Burn amplifier, separate from application-time snapshots.
No direct damage is dealt by this Last Flare.

### Decisions and counterplay

Use Close the Kiln to protect/setup; use Cinder Discharge to spread pressure;
save Heat for the stronger defensive Last Flare when survival matters.
Heat generation is intentionally slow and bounded. He cannot force scripted
boss targeting, prevent area damage or make damage-over-time teams immortal.

## 4. Solenne, Moonbell Keeper

**Feel:** a sanctuary that refuses to yield. Her deliberate bell preparation
stores Stillness; hits spend that reserve before she can turn it into a release.
Her silk/brocade appearance is not an armor requirement or a stat formula.

### Intrinsic passive: Held Stillness

- Start at 0 Stillness; cap 4.
- Each committed **Circle of Repose** grants **2 Stillness**, up to cap.
  It is the only baseline source. Normal Attack, taunt, damage received,
  other shields, Master-generated shields and recovery grant none.
- Before an enemy direct impact against Solenne, if she has Stillness, spend
  **1** to reduce that hit's incoming direct damage by **20%**.
  Spend at most 1 per individual resolved primary impact, even on a critical.
- Apply this as a non-Defense reduction in the shared mitigation pipeline;
  multiply with other reductions and retain the shared 20% damage floor.
  Shields absorb afterward. A Shield-covered impact can spend Stillness;
  canceled attacks, periodic damage and redirected ally damage cannot.
- If an earlier gate completely cancels the hit, no Stillness is spent.
  Simultaneous/area impacts keep stable event order and spend separately.
  A multi-hit attack only spends on hits that the engine actually resolves
  as separate direct impacts, not on cosmetic animation contacts.
- Stillness has no expiry. It is not the shared Tranquilitic Focus resource.

### Normal Attack

Standard 100% A single-target bell strike and standard Gauge gain.
Does not spend/generate Stillness or activate a "bell cast" Master.

### Skill 1: Answer the Bell

**25 Gauge; no cooldown; selected enemy, then attention control.**

1. Deal **240% A** direct damage to the selected enemy.
2. Apply **25% Weaken** to that survivor for the shared Weaken clock.
3. Taunt eligible enemy attacks to Solenne for the next enemy phase.
4. Does not generate or voluntarily spend Stillness.

### Skill 2: Circle of Repose

**40 Gauge; no cooldown; all living allies / personal setup.**

1. Grant **2 Stillness**, capped at 4.
2. Grant each living ally **16% H x S** Shield.
3. No damage, Weaken or taunt. Allies do not gain Stillness.

It remains legal at full Stillness; excess charges are discarded, not converted
to another reward. No Gauge refund. Choosing setup instead of taunt is deliberate.

### Last Flare: The Last Reverberation

**100 Gauge; no cooldown; all enemies/allies; mandatory recovery.**

1. Spend all Stillness once; snapshot `s` before any effects.
2. Deal **(720 + 72s)% A** direct damage to every living enemy.
3. Grant every living ally **(24 + 4.5s)% H x S** Shield.
4. No automatic taunt, Weaken, new Stillness or delayed damage.

| Stillness spent | Area damage | Shield / recipient before Skill Power |
| --- | --- | --- |
| 0 | 720% A | 24% H |
| 1 | 792% A | 28.5% H |
| 2 | 864% A | 33% H |
| 3 | 936% A | 37.5% H |
| 4 | 1,008% A | 42% H |

### Decisions and counterplay

Circle of Repose prepares a strong release, but taunting can let enemies spend
her stored reduction first. Answer the Bell debuffs one foe, not the whole wave.
Her Last Flare is never locked behind owning a specific ally or Master.

## 5. Myrthen, Season Reaper

**Feel:** the orchard changes season in one turning step. Her sickle-chain
creates a target window; her next choice determines the Harvest payoff.
Four seasonal art materials do not add a fourth gameplay state.

### Intrinsic passive: Turning Season

- Begin in **Sprout**.
- A committed Skill 1 or Skill 2 in Sprout resolves normally, then advances
  to **Bloom**. A committed ordinary Skill in Bloom resolves normally, then
  advances to **Harvest**.
- If an ordinary Skill begins in Harvest, snapshot Harvest, resolve that
  cast's empowered effects, then return to Sprout. That cast does not also
  advance again. "Advance" is once per cast, not once per target/hit.
- Last Flare uses Harvest if it begins there, then returns to Sprout.
  A Last Flare outside Harvest leaves her existing season unchanged.
- Normal Attack, incoming hits, generated attacks/heals, Mark transfer,
  recovery and ally actions never advance the cycle.
- A successful cast that kills the final enemy still follows its committed
  season transition; rejection never advances or consumes a season.

### Reaper's Claim: native Mark rules

- Skill 1 applies **Reaper's Claim**, a source-owned Mark. An enemy with her
  active Claim takes **12% more native direct damage from all squad members**,
  including her. Not Burn, periodic damage or generated Conduit damage.
- Base duration **2 enemy phases**, plus Skill Duration, maximum 4.
  Application also benefits later actions in the current player turn.
- At most **one living marked enemy per Myrthen owner**. Applying it to
  another enemy removes her old Claim, not another character's marks.
  Reapplying refreshes; never stacks itself.
- It is a typed Mark for existing equipment predicates, not an inferred word
  in an action message, and not a shared global "all marks" conversion.
- Different vulnerability IDs use the existing shared damage-taken rules;
  this proposal does not add their percentages into a new private multiplier.
  Her Claim contributes 1.12x exactly once where that pipeline permits it.
- Mark application follows her Skill 1 damage: the opening application does
  not amplify the hit that creates it. A pre-existing Claim can amplify that hit.
  It becomes inactive when Myrthen dies; no persistent corpse aura.

### Normal Attack

One standard 100% A single-target activation and ordinary Gauge gain.
Two sickles are a visual identity, not two automatic damage/critical rolls.
May benefit from an existing Claim but never applies one or changes season.

### Skill 1: Reaper's Claim

**25 Gauge; no cooldown; selected enemy.**

1. Deal **272% A** direct damage.
2. If cast from Harvest: multiply this cast's direct damage by **1.35**
   and add **20 percentage points Defense ignore** for its primary impact.
3. Apply/refresh Claim on the survivor; then perform the season transition.

Harvest Skill 1 has **367.2% A** equivalent direct coefficient before other
bonuses. Native plus equipment Defense ignore uses the shared **75% cap**,
not additive post-mitigation true damage.

### Skill 2: Turn the Bough

**40 Gauge; no cooldown; every living enemy.**

1. Deal **192% A** direct damage to each enemy.
2. From Harvest: x1.35 direct damage and +20 pp Defense ignore to every
   primary impact (equivalent **259.2% A** per enemy).
3. Perform the season transition. This action never applies or spreads Claim
   on its own; its value is area coverage versus Skill 1's focused team window.

### Last Flare: All That Ripens

**100 Gauge; no cooldown; selected enemy; mandatory recovery.**

1. Deal **1,248% A** direct damage to the selected enemy.
2. From Harvest: x1.35 direct damage and **30 pp Defense ignore**
   (equivalent **1,684.8% A**). Otherwise no native Defense ignore.
3. Perform the Last Flare season rule. It neither applies nor consumes Claim.

### Decisions and counterplay

Skill 1 sets up ally damage; Skill 2 handles waves; Harvest can be spent cheaply
now or saved for Last Flare. A target killed before setup may deny the Mark.
Enemy pressure and mandatory recovery remain meaningful. No automatic
infinite Harvest, guaranteed crit, revival or extra turn.

## 6. Nine fixed Omnic Master Conduits

All nine are personal matching-bearer Masters in the existing separate slot.
Fixed stats/effects, no upgrades; none consumes an ordinary Omnic slot.
Proposed IDs follow `master-caldrex-1..3`, `master-solenne-1..3`,
`master-myrthen-1..3`. Names match the existing art proposal.
Never add them to ordinary Machine rolls, a summon banner or a Store.

Proposed future acquisition: add them to the existing Machine's Master Chest
unowned-choice catalog when the character batch is implemented. Choosing one
for an unowned character unlocks only the Master. No auto-equip/grant, duplicate
conversion or chest-rate/reward change. Existing 57 Masters remain unchanged;
this batch would bring the catalog to 66, not imply it is already expanded.

### Shared Master execution rules

- Listed personal percentages add to the existing raw-base stat pools with
  role/equipment, never multiply finished equipped stats. "+Skill Power" is
  percentage points. No unlisted squad aura, hidden stat or penalty.
- Generated damage/heals/Shields/Gauge do not earn native resources, start
  new attack actions, repeat role perks or recursively activate Conduits.
  Explicit named native modifications below are the only exceptions.
- Generated damage here is **non-critical**; native skills/Burn keep native
  critical rules. Use typed origin/source IDs so the difference is testable.
- Fixed heal/Shield offers use recipient H and **no Skill Power**. Gauge
  grants are fixed percent of G, capped by capacity, **no Gauge Gain scaling**.
  Never resurrect or convert overheal/capped Gauge into another benefit.
- "Lowest Health" means lowest current HP/max-HP fraction, stable earlier
  squad position breaks ties. Use living targets only.
- Guards are encounter-local and serialized; one Master equipped at a time
  prevents combining alternatives' personal mechanics.

### Caldrex 1: Banked-Sun Pressure Accumulator

**Personal stats:** +60% Health, +50% Defense.

- Replace Heat cap 3 with **4**; generation remains 1 per enemy phase.
- While alive, gain **+10% base-grown Defense per current Heat**, in the
  same additive stat pool, not compounded per refresh. Cap +40%.
- Native spending formulas extend unchanged: at 4 Heat Cinder Discharge is
  **272% A** direct + **60% A x S** Burn/tick; Last Flare Shield is **48% H x S**.
- Spending immediately removes its conditional Defense. It neither heals
  nor retroactively rescales granted Shields or stored Burn.

**Build:** bank pressure for a larger defensive payoff, with real loss of
conditional Defense when choosing to spend.

### Caldrex 2: Counterstroke Recoil Foundry

**Personal stats:** +50% Health, +40% Direct Attack, +25 pp Skill Power.

- The first eligible taunt-forced enemy direct impact per enemy phase that
  removes positive Caldrex HP/Shield triggers one retaliation at its attacker.
  Requires that the resolver actually selected Caldrex because of his taunt,
  not random targeting, scripted targeting, an area hit or redirected damage.
- Resolve after the entire original impact and its native Heat gain, only if
  both Caldrex and attacker still live. Death discards the queued retaliation.
- Deal **80% A** non-critical generated direct damage using current Attack
  and the normal Defense resolver, **no Skill Power** or native skill tuning.
- Apply a separate generated **Recoil Scorch** to that survivor: **15% A**
  per tick for **2 fixed enemy phases**, no Skill Power/level multiplier/crit.
  Bypass Defense, use ordinary Shield absorption; refresh same source rather
  than stack, retain stronger potency. Requires living Caldrex for later ticks.
- Recoil Scorch is classified Burn for inspection but is **Conduit-origin**:
  no Stoked Embers, native Burn gains or generated-effect recursion.

**Build:** return some forced pressure; not a new native Burn engine.

### Caldrex 3: Cinderpulse Triage Converter

**Personal stats:** +75% Health, +30 pp Skill Power.

- After the first allied **native Burn tick** in an enemy phase that deals
  positive Health/Shield damage to an enemy, heal the living squad member
  with lowest Health percentage for a fixed **4% H**.
- Once per enemy phase across all allies/enemies. Caldrex must live.
  The selected full-HP target may receive zero effective healing; do not bank
  a future heal or transfer unused healing. Record the opportunity as spent.
- No triggers from Burn application, early detonations, Recoil Scorch,
  ordinary Conduit damage or a zero-damage tick. The qualifying native tick
  may be Caldrex's or another ally's and may occur during his recovery.

**Build:** bounded Burn-team sustain; useful without owning Infernis.

### Solenne 1: Stillpoint Inertial Governor

**Personal stats:** +50% Health, +75% Defense.

- Held Stillness reduces its qualifying hit by **30% instead of 20%**.
  Still spends exactly one charge; shared mitigation floor remains.
- Circle still grants 2, cap remains 4. No extra generation or Last Flare
  multiplier. Extra mitigation cannot create free Stillness from Shielding.

**Build:** preserve allies by making the guardian harder to burst, trading
away the alternate Masters' additional shield/Gauge benefits.

### Solenne 2: Quiet-Arc Shelter Projector

**Personal stats:** +75% Health, +25 pp Skill Power.

- After each successful manual Skill 1, Skill 2 or Last Flare, grant the
  living ally with lowest Health percentage a fixed **8% H Shield**.
- Exactly one recipient/offer per cast, including self. Selection occurs
  after native damage/Shields and before remaining generic post-cast hooks.
- This is a generated Shield: no S scaling, Stillness gain/spend or second
  bell activation. Normal Attack and cosmetic bell motion do not count.

**Build:** focus extra protection on the weakest current member.

### Solenne 3: Cadence Differential Drive

**Personal stats:** +40% Health, +30 pp Skill Power, +15 pp Skill Efficiency.

- When Held Stillness actually consumes a charge against an enemy hit,
  grant each living ally a fixed **4% G**, at most **once per enemy phase**.
- When Last Flare spends one or more Stillness, after its native effects grant
  each **other** living ally **3% G per charge spent**, maximum **12% G**.
  No refund to Solenne; this is a separate once-per-cast trigger.
- Merely gaining Stillness, overflowing the cap, a zero-charge Last Flare
  and generated effects never trigger. Granting Gauge cannot bypass recovery.

**Build:** convert deliberate defense into ally rotation support.

### Myrthen 1: Seasonwheel Harvest Transmission

**Personal stats:** +60% Direct Attack, +35 pp Skill Power.

- Harvest's direct-damage multiplier becomes **1.50 instead of 1.35**.
  Defense ignore stays 20 pp ordinary/30 pp Last Flare.
- After a Harvest-consuming ordinary Skill or Last Flare, finish in **Bloom**
  instead of Sprout. This replaces the reset, not an extra advance.
- Non-Harvest casts keep baseline transitions. No consecutive Harvest casts:
  the next ordinary Skill from Bloom is unempowered and only prepares Harvest.
- Empowered coefficients: Skill 1 **408% A**, Skill 2 **288% A per enemy**,
  Last Flare **1,872% A**.

**Build:** more frequent Harvest windows, never permanent empowerment.

### Myrthen 2: Seedtrace Pursuit Distributor

**Personal stats:** +45% Direct Attack, +25 pp Critical Rate.

- If the enemy carrying her Claim dies while Myrthen lives, transfer that
  Claim to the living enemy with lowest Health percentage, stable spawn order
  for ties. No manual target or RNG.
- Once per round and **once per Claim lineage**. A transferred Claim cannot
  jump again, even in a later round. A new successful Skill 1 application
  starts a new lineage; refreshing the same target counts as a new application.
- Keep remaining duration and original 12% vulnerability; do not refresh,
  strengthen, replay the killing hit or deal transfer damage.
- If no target or no remaining duration exists, discard Claim. Resolve after
  the triggering activation's entire direct target batch so a transferred Mark
  cannot retroactively amplify another impact from that same area activation.
  Future immediate follow-up activations use the now-current board.

**Build:** preserve an earned team window through a wave, without chain clearing.

### Myrthen 3: Reaping-Tide Recovery Dynamo

**Personal stats:** +40% Direct Attack, +50% Health, +20 pp Skill Power.

- After a manual Myrthen Normal Attack, Skill or Last Flare directly kills
  at least one enemy, heal each living ally a fixed **6% H** and grant each
  **other** living ally a fixed **5% G**.
- Once per round and at most once per activation, regardless of kill count.
  Resolve after the full native activation and season transition. She must live.
- No payout from ally kills, delayed/periodic damage, transferred Mark,
  equipment-generated damage or scripted despawns. No self Gauge refund.
- The final killing activation still ends the encounter normally; no extra
  heal/Gauge payout after victory or carryover reward is created.

**Build:** stabilize multi-enemy encounters; intentionally no boss-kill sustain
before the boss dies.

## 7. Exact reference examples (not balance results)

Use Lv.0/Evo.1, no equipment/Resonance, no crit/Defense/action modifiers:

- Caldrex has A=32, S=1. His 3-Heat Skill 2 offers 79.36 raw direct potency
  per target and stores 16 Burn potency per tick before ordinary rounding.
  Last Flare offers 126 Shield on himself (300 x .42).
- Solenne has A=30, S=1. Her 4-Stillness Last Flare offers 302.4 raw direct
  potency per target and 119.7 Shield on herself, rounded to 120.
- Myrthen has A=88 and S=1.5 **after role perks**. An unmarked Harvest Skill 1
  offers 484.704 raw potency (88 x 2.72 x 1.35 x 1.5), not the lower result
  from forgetting her role. The shared Defense/crit pipeline still follows.
- With Seasonwheel and no other gear she instead has A=114.4 and S=1.85.
  Harvest Skill 1 offers 863.4912 raw potency before Defense/crit/Mark.
  These are arithmetic checks, not zero-Defense DPR or encounter clear claims.

## 8. Implementation and acceptance checklist

This deliverable authorizes **no implementation by itself**. Before coding,
review the proposed potency, native resource rules and Master packages.

1. Register three stable identities and six-form progressions; keep 6-star,
   Common-Omnic art and existing Elemental War stage/recruitment conventions.
   No summon-pool entries or automatic ownership.
2. Implement typed native resource/Mark/Burn/taunt state, action preview and
   cost validation shared by client and authority. Reuse source-owned status
   storage; do not parse combat prose or overload another bearer's resource.
3. Add nine Masters to matching equipment/chest choice, descriptions,
   loadouts/configurations, Collections and frozen run snapshots. Current
   ownership is preserved. No new Master upgrade/sale/drop system.
4. Resolve all skills once per activation; validate miss/negation, full Shield
   coverage, zero effective damage, lethal hits, area batches, redirected
   damage, strongest Weaken, conflicting taunts and scripted boss targeting.
5. Test exact bounds: Heat 0/3/4, one gain per phase; Stillness 0/4, two per
   Circle, one per real impact; Sprout/Bloom/Harvest transitions, rejection
   and each Master replacement, including a non-Harvest Last Flare.
6. Test all nine personal stat packages without compounding, immutable Shield/
   Burn snapshots, same/different-source refresh and owner death. Confirm
   generated damage cannot crit, gain resources or recursively trigger procs.
7. Test Skill Power applied once, native fixed coefficients not retuned again,
   Skill Duration caps, Skill Efficiency floors, standard Gauge and mandatory
   recovery. Test Mark predicates with actual Calamitic equipment, not names.
8. Test per-round/per-phase/per-lineage Master guards across Settings, retry,
   historical-rule restart and authority checkpoint failure. Frozen run
   equipment must not reread menu changes. No partial rewards or load writes.
9. Run D-404 non-Calamitic paper and actual pressured encounters: unequipped,
   ordinary progression and optimized Master packages, conditional ownership
   stated. Include mixed teams, solo, all three together and real same-element
   allies. Separate damage, effective healing, Shield absorption, packet
   survival and clear rate. Do not tune against strongest paper outliers.
10. Review real art deliveries; preserve originals and exact shared URLs.
    No missing PNG requests. Keep established character style and distinct
    wardrobe/weapon/energy identities. Native status icons stay named neutral
    text until corresponding images are delivered and reviewed.
11. Present action/resource changes at the actual impact. Saved recruitment
    rewards precede finite shared feedback; preserve Skip, Reduce motion,
    focus and disposal. No celebration for failed/cancelled saves.
12. Run targeted kit/Conduit/save/UI tests, full suite/build and matching
    authority checks before publication; verify hosted runtime and actual
    deterministic scenarios. None of that gameplay validation is completed
    merely by this written proposal.

## Related references

- [Approved outlines, art direction and remaining work](phase-1-war-characters.md)
- [45-prompt visual proposal](../Art/characters/Elemental%20War%20Phase%201.md)
- [Existing native kit tuning](character-identity-redesign.md)
- [Combat rules](combat.md)
- [Current Master system](master-conduits.md)
- [Elemental War acquisition/trials](elemental-war.md)
