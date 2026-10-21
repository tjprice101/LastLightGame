# Conduit redesign: approved roster and runtime (D-313)

## Equipped-effect verification (D-359)

The current catalog is 90 ordinary-slot Conduits (including five Calamitic)
and 48 named Masters. Existing all-catalog effect/absence tests and upgrade
coverage are supplemented by real-action regressions in
`src/game/conduit-integration.test.ts`; conditional effects still require
their stated action, owner, element, target and timing predicates.

- Critical Rate bonuses and penalties sum before their zero floor, so moving
  Citadel Spine before Astral Prism cannot erase part of the penalty.
- Skythread Rudder spends every accumulated Tailwind when Skill 1/2 uses
  their combined discount.
- Iris extensions and Tempered Strike consumption update Infernis's stored
  Burn as well as its visible snapshot. Accepted weaker Burn refreshes reset
  Cinder Testament's streak even when retaining the stronger tick damage.
- Owner confirms Eclipse Mantle includes Normal Attack. Nerithe's Charted
  follow-up also accepts another ally's single-target Normal Attack.
- Razor's Midnight Bastion parries the first scheduled skill only per Enemy
  Turn, covering all impacts of that skill, not later activations.
- Owner selects Quarry Planet Gravitas as a Shield repair, not a new strike:
  Last Flare grants max(200% effective Defense, 20% maximum HP); Cover unchanged.
- Owner retains Disciple's recipient-based Sovereign Will assist, including
  applicable Attack buffs, and Unbound Mindcrown's two EXTRA expiration rounds
  with next-action consumption. Descriptions now match these mechanics.
- Falcon Sight's actual Normal Attack critical damage already worked on
  native and captured fighters; regression coverage confirms it.
- Atmoso's all-enemy Master Normal Attack is verified at exactly 70% damage
  per target with only one Gauge gain, locally and on the hosted server. The
  hosted Master smoke no longer expects his retired critical-proc effect.

No ownership, upgrade costs, saved gear, acquisition, RNG or artwork changes.
Frozen equipment/upgrade and named-Master boundaries retain their existing tests.
Historical status statements below do not supersede this current audit.

**Scope boundary:** the owner approved implementing this entire equipment
roster after its D-302 review. The separate
[D-311 character identity proposal](character-identity-redesign.md) remains
unimplemented. These effects enhance the current native character kits;
they do not silently implement that proposal or Calamity Mode.

## Status and owner direction

**Implemented locally; not yet published.** All85 ordinary identities and48
Masters now use the complete effects below. This document supersedes the older
combat bundles in [ordinary rules](conduits.md),
[upgrades](conduit-upgrades.md) and [Master rules](master-conduits.md).
Acquisition, costs, ownership, rarity, artwork and saved upgrade levels remain
unchanged. Coordinated client/server publication still requires approval.

Confirmed direction:

- Rework all **133** existing identities: 10 Common, 15 Rare, 15 Legendary,
  45 ordinary Omnic and 48 character-specific Masters.
- Give each a distinct mechanical purpose. The collection should cover the
  character's whole kit, not repeat large interchangeable stat packages.
- Creative changes may affect any mechanic; resurrection, action economy and
  other major changes are not categorically excluded.
- Ordinary upgrades should improve special abilities as well as stat modifiers,
  with explicit per-effect caps.
- Preserve owned IDs, upgrade levels, artwork and acquisition rules.
- The owner subsequently requests implementation of every reviewed row,
  including the flagged resurrection, action-economy, routing and kit changes.
- Historical active encounters restart under the new rules with their frozen
  squad/loadout and already saved rewards retained; no mixed old/new combat.

Stable IDs below reference [ordinary definitions](../src/content/conduits.ts),
[converted Omnics](../src/content/kit-conduits.ts) and
[Masters](../src/content/master-conduits.ts).

## Design goals

Common supplies affordable, focused building blocks. Rare supplies useful
specialist utilities that remain worth an ordinary slot at endgame.
Legendary introduces sharp trade-offs and build commitments. Omnic introduces
element-appropriate engines, transformations and unusual interactions rather
than an automatic three-stat windfall. Each Master's three alternatives should
produce three recognizably different ways to play that named Element-Bearer.

**Every row is the entire effect**, not an addition to the retired
85%/-10% or 60%/50%/40% bundles. Unlisted passive stat bonuses are removed.
This is consequently a substantial balance change, not a free universal buff.
Endgame verification uses legal, role-specific upgraded builds and Masters,
not the retired generic stat windfalls or weaker bosses. Rarity alone should
not make eight Omnics preferable;
the four-ordinary-Omnic limit remains.

Overlap in a useful domain is intentional: multiple items can help healing.
The trigger, recipient, cost, timing or conversion must make their decisions
different. An identical rule with another name/element is not sufficient.
No ordinary-skill cooldown reduction survives: those skills have no cooldown.

## Reading the roster

### Active-run compatibility and accessible controls

The approved rules use `BattleState.conduitRulesVersion = 2`. A historical
active encounter with a missing or different marker restarts its **current**
stage or Training wave, not the entire activity. Keep its frozen squad,
progression, captures, ordinary equipment/upgrades and Masters; never replace
these with later account-menu choices. Reset HP, Gauge, round, recovery, status,
per-encounter resources, entrance and result presentation from fresh constructors.
Create a fresh run receipt ID and clear only the encounter's event list. Saved
account rewards, receipts, discoveries and unlocks remain untouched.

The battle log and an accessible visible status explain that the encounter
restarted under updated rules and previously saved rewards were kept. An action,
end-turn, Continue or Retry submitted against the historical encounter returns
the replacement session **without executing that stale command**; the player
must choose again. Quit still exits normally. Online read/checkpoint must commit
the compatibility restart through the authoritative operation path before
returning the new session. Offline Settings reconstruction checks the same marker
before rendering or saving discoveries.

The HTTP handler preserves the normal read/checkpoint fast path for current
sessions. Historical reads commit against the revision actually loaded (a read
does not require the caller to know that revision); historical checkpoints first
validate the requested revision. Both use the existing request fingerprint/cache
and atomic commit RPC, so retrying an acknowledged request returns the same fresh
run ID. A failed/conflicting commit never exposes an unpersisted replacement.

Conduit protection/control readouts use copied runtime dictionaries and real
owner names: Windveil, Critical Seal, Rootbind, Silence, Stasis protection/skip,
Accord, Quiet Feather, active taunts, shared-damage links, Guardian and shield
plates. Gauge links explicitly say linked Gauge income, not shared damage.
Text states actual effects and timing without invented status-art URLs.
The character identity rollout replaces retired Bloom capacity with Graft's
explicit planted-Seed healing modifier. No equipment recreates retired charges.
Retired pre-redesign charge descriptions are not displayed for current runtime
states.

Character and battle equipped-rule panels list the complete effects of all
ordinary equipment at the actual account/frozen upgrade levels. They never
discard a first sentence or describe special abilities as non-scaling. Master
references retain their complete transformation, cost and resource rules and
state their individual trigger limits instead of claiming every Master recurs.
Loadout Details and next-level labels also use complete level-specific effects;
conditional-damage Conduits do not invent permanent Attack bonuses in the total
stat strip. Effect prose alternatives use spaced slashes at presentation
boundaries. Numeric ratios and the approved literal mitigation formula remain
unchanged.

Focused validation:
`npx vitest run src/presentation/conduit-compatibility.test.ts src/presentation/conduit-status.test.ts src/presentation/battle-authority.test.ts src/presentation/unit-readout.test.ts`.
HTTP persistence and full-rule coverage:
`npx vitest run src/presentation/conduit-http-compatibility.test.ts src/presentation/conduit-rules.test.ts src/presentation/status-icon.test.ts src/presentation/inventory.test.ts`.

- `x -> y` means +0 value to +5 value. Continuous values interpolate linearly:
  `x + (y - x) * level / 5`. Stat-modifier endpoints retain today's
  `1 + 0.5 * level` rule, including listed penalties.
- Integer duration/count thresholds explicitly shown as `1 -> 2`, `3 -> 2`,
  or `+1 -> +2` use the first value at +0/+1/+2 and the second at +3/+4/+5.
  A fixed number without an arrow does not scale. Upgrades never secretly
  increase trigger frequency or remove a stated restriction.
- `H`, `A`, `D` mean the owner's resolved maximum HP, Attack and Defense,
  after frozen equipment/progression but before temporary outgoing-damage
  multipliers. `R` means the recipient's maximum HP. These are not base Lv0 stats.
- HP, Attack and Defense modifiers are percentages of the existing grown stat,
  not percentage-point additions. `pp` means percentage points of Critical Rate
  or Weaken. Critical Damage refers to the existing critical multiplier.
- Skill 1/2 damage bonuses affect only existing direct damage, not healing,
  shields or Burn; a support-only skill does not acquire an attack. Last Flare
  bonuses likewise affect only its direct damage unless explicitly stated.
- "Native" means an authored action/passive and its authored outcomes.
  Equipment may modify a native calculation without creating another native
  trigger. An explicitly generated strike, heal, shield, copied status or
  assist is Conduit-origin and does not trigger equipment or native resources.
- Ordinary effects are available to matching captured Elemental-Devourers too,
  provided the required action/status actually exists. Masters remain exclusive
  to their named Element-Bearer. No item silently grants an unavailable skill.
- Masters remain **fixed and non-upgradeable**, preserving their separate chest
  acquisition and lack of an upgrade transaction. The requested special-effect
  scaling applies to the 85 upgradeable ordinary Conduits; adding Master
  upgrades would be a separate economy decision.

### Approved major-change categories

The owner approved all flagged rows under D-313. These markers identify their
consequential implementation and regression-test requirements:

| Flag | Approved change |
| --- | --- |
| **R** | Resurrection or lethal-hit prevention; changes defeat handling. |
| **T** | Extra/manual actions, free Defense or Last Flare recovery changes. |
| **G** | Aggro, interception, shared damage or shield routing. |
| **K** | Authored targeting/resource/skill transformation, enemy scheduling or new control state. |

They are not remaining approval gates or permission to expand beyond the
specific effects and safeguards in each approved row.

## Ordinary roster: Common (10)

All ten retain their current Store prices and shared unlocks.

| # | Identity and stable ID | Complete effect (+0 -> +5) | Build role |
| --- | --- | --- | --- |
| C01 | Vigil Core `vigil-core` | +6% -> +21% maximum HP. | Simple HP foundation; no proc requirement. |
| C02 | Siegebound Drive `siegebound-drive` | +8% -> +16% Normal Attack direct damage. | Reliable basic-action offense. |
| C03 | Bastion Lock `bastion-lock` | +10% -> +35% Defense. | Pure mitigation foundation. |
| C04 | Parallax Relay `parallax-relay` | The first offensive activation each encounter has +15 -> +30 pp Critical Rate, capped at 100%. Consume once even if it hits several enemies. | Opening burst rather than permanent critical scaling. |
| C05 | Fracture Reservoir `fracture-reservoir` | +10 -> +35 Gauge capacity; enter a fresh encounter with 5 -> 10 Gauge, capped by that capacity. Not reapplied by Settings or round changes. | Reserve storage and faster opening, not recurring income. |
| C06 | Prism Splinter Socket `prism-splinter-socket` | +10% -> +20% Skill 1 direct damage. | Skill 1 specialization. |
| C07 | Precision Escapement `precision-escapement` | +10% -> +35% Critical Damage multiplier. No Critical Rate increase. | Existing critical-build payoff. |
| C08 | Fieldbrace Coupler `fieldbrace-coupler` | Take 4% -> 8% less direct enemy damage while you have any shield immediately before impact. Applies to the whole hit even if it breaks the shield. | Maintaining shields as armor. |
| C09 | Reserve Torque Crank `reserve-torque-crank` | Normal Attack grants an additional 3 -> 6 Gauge (D-336; formerly Defense). | Deliberate non-offensive Gauge generation. |
| C10 | Crosspin Governor `crosspin-governor` | +10% -> +20% Skill 2 direct damage. | Skill 2 specialization, not a second Skill 1 item. |

## Ordinary roster: Rare (15)

| # | Identity and stable ID | Complete effect (+0 -> +5) | Build role |
| --- | --- | --- | --- |
| R01 | Duplex Heart `duplex-heart` | After the first direct enemy hit each phase that actually removes your HP, heal the most injured other living ally for 5% -> 10% H. Cannot heal yourself or revive. | Tank-to-support conversion, not self-lifesteal. |
| R02 | Spearwheel Engine `spearwheel-engine` | Skill 1 ignores 15% -> 30% enemy Defense. Does not bypass shields. | Single-slot armor penetration. |
| R03 | Falcon Sight `falcon-sight` | Two consecutive noncritical offensive activations prime your next offensive activation to critically hit. That activation also gains +10% -> +20% Critical Damage multiplier. A native critical clears the count; AoE counts once and the primed activation uses one consumed charge for all its targets. No additional RNG roll. | Deterministic critical reliability after droughts. |
| R04 | Aegis Capacitor `aegis-capacitor` | When any shield on you absorbs positive direct enemy damage, gain 4 -> 8 Gauge once per enemy phase. Full-block and partial-block hits qualify; no HP loss is required. | Self-contained shield battery, independent of who cast it. |
| R05 | Springwell Pump `springwell-pump` | +20% -> +40% native active-ability healing offered before missing-HP clipping. Does not improve passive or Conduit healing. | Active healer potency. |
| R06 | Twinpulse Bellows `twinpulse-bellows` | Your second consecutive Normal Attack gains +25% -> +50% direct damage. The sequence then resets; any other manual action resets it too. A target change does not reset it. | A two-beat basic-attack rotation. |
| R07 | Glassroot Gimbal `glassroot-gimbal` | Gain Critical Rate proportional to missing HP: up to +12 -> +24 pp at 75% missing HP, capped there. Snapshot before the offensive activation. | Low-HP critical risk. |
| R08 | Lifeline Flywheel `lifeline-flywheel` | After a native offensive activation, heal yourself for 8% -> 16% of its actual direct HP damage, capped at 4% -> 8% H per activation. Does not count overkill, shields, Burn or generated strikes. | Direct-damage lifesteal. |
| R09 | Sentinel Aperture `sentinel-aperture` | Reduce the final direct damage of enemy critical hits against you by 25% -> 50%. Ordinary noncritical hits are unchanged. | Anti-critical defense without altering enemy RNG. |
| R10 | Wardglass Transformer `wardglass-transformer` | +20% -> +40% native shield amount offered before refresh comparison. Generated shields are unchanged. | Stronger authored shielding. |
| R11 | Hammerbalance Link `hammerbalance-link` | +12% -> +42% Attack; -4% -> -14% Defense. | Straight glass-cannon trade-off. |
| R12 | Breach Pendulum `breach-pendulum` | After a native offensive activation, offer yourself a refresh-only shield equal to 8% -> 16% of its total actual direct HP damage, capped at 5% -> 10% H. No shield from Burn, overkill, absorbed damage or generated strikes. | Direct damage converted into personal protection. |
| R13 | Coilfeed Ratchet `coilfeed-ratchet` | Skill 2 costs 3 -> 6 less Gauge, minimum 1 after all ordinary-skill discounts. Does not change Last Flare or grant Gauge. | Sustained Skill 2 use. |
| R14 | Opal Indexer `opal-indexer` | Your native Weaken applications last +1 -> +2 enemy phases, maximum 6 remaining phases. Reapplication refreshes rather than adds durations. Does not grant Weaken to a kit without it. | Long-lived suppression rather than stronger suppression. |
| R15 | Resonance Crucible `resonance-crucible` | +20% -> +40% damage to Burn natively applied by you. Snapshot potency at application; no duration change or new Burn. | Unconditional native damage-over-time potency. |

## Ordinary roster: Legendary (15)

| # | Identity and stable ID | Complete effect (+0 -> +5) | Build role |
| --- | --- | --- | --- |
| L01 | Worldbreaker Drive `worldbreaker-drive` | +35% -> +70% Last Flare direct damage; -6% -> -21% maximum HP. Recovery remains. | Ultimate glass cannon. |
| L02 | Immortal Vessel `immortal-vessel` | +25% -> +87.5% maximum HP; -6% -> -21% Attack. No resurrection or healing proc. | Extreme HP investment with a real offensive cost. |
| L03 | Citadel Spine `citadel-spine` | +25% -> +87.5% Defense; -6% -> -21% Elemental Damage. Native shield offers additionally include 10% -> 20% D. | Defense-to-shield construction; cannot manufacture a shield ability. |
| L04 | Astral Prism `astral-prism` | +25% -> +87.5% Elemental Damage; -6% -> -21% Defense. A zero native Elemental Damage stat remains zero. | Pure elemental-stat specialization. |
| L05 | Judgment Lens `judgment-lens` | Native skill/Last Flare critical damage is +40% -> +80%; your Normal Attacks cannot critically hit. Last Flare/native critical resources still follow their normal eligibility. | Spend critical power on abilities, give up critical basics. |
| L06 | Siege Cantilever `siege-cantilever` | Your natively all-enemy abilities gain +60% -> +120% direct damage when exactly one enemy is alive at activation start. Does not improve originally single-target abilities or support outcomes. | Converts area specialists into isolated-boss specialists. |
| L07 | Nullsong Transmission `nullsong-transmission` | +40% -> +80% Normal Attack direct damage; -12% -> -24% Skill 1/Skill 2 direct damage. Last Flare is unchanged. | Deliberate basic-attack commitment. |
| L08 | Horizon Heartcase `horizon-heartcase` | +20% -> +70% maximum HP; -4% -> -14% Defense. At the start of your forced Last Flare recovery turn, restore 15% -> 30% of missing HP once. | Recovery as a restorative window, not a skipped cost. |
| L09 | Stasis Reliquary `stasis-reliquary` | Once per encounter, a lethal direct hit leaves you at 1 HP and prevents further direct HP loss for that enemy phase. Next player turn you cannot manually act, even if otherwise ready. Duration and skip do not scale; at that turn's start gain a shield of 10% -> 20% H. Burn can still defeat you. | **R/T**: lethal insurance paid with a lost action, not revival. |
| L10 | Granite Hourglass `granite-hourglass` | At the next player-turn start, gain a refresh-only shield equal to 30% -> 60% of actual direct HP damage you lost in the preceding enemy phase, capped at 10% -> 20% H. Clear the ledger after settlement; no effect while fallen. | Deferred damage recycling rather than immediate healing. |
| L11 | Pale Bulwark Diadem `pale-bulwark-diadem` | While you are above 75% HP, take 15% -> 30% less direct damage. Below or at 75% HP, native shields you cast on yourself are 25% -> 50% stronger instead. Snapshot each hit/offer separately. | High-HP prevention that changes role under pressure. |
| L12 | Starvein Conductor `starvein-conductor` | Before an ability that natively applies Burn, pay 5% H, leaving at least 1 HP. If the full cost cannot be paid, the bonus does not apply. That activation's Burn deals +40% -> +80% damage. Self-payment is not damage taken, cannot trigger effects and does not affect direct damage. | HP-funded Burn investment. |
| L13 | Meridian Inverter `meridian-inverter` | Your native shield abilities restore living allies' HP instead of offering their authored shields, at 75% -> 150% of the final native shield offer. They no longer create native shield growth/absorption resources. Existing unrelated shields remain. | **K**: shield-to-healing role conversion. |
| L14 | Execution Orrery `execution-orrery` | Native direct damage gains +50% -> +100% against a target at or below 25% HP immediately before that target's hit. No instant execution, extra action or kill reward. | Finishing wounded targets, including bosses. |
| L15 | Verdict Caliper `verdict-caliper` | Your offensive activations cannot crit, but gain +35% -> +70% direct damage. Burn is unchanged; no critical-trigger effects can fire from these activations. | Deterministic noncritical build that explicitly conflicts with crit gear. |

## Ordinary roster: original Omnic identities (20)

Existing matching-element requirements remain. Legacy ID spellings do not
reintroduce retired combat elements.

| # | Identity and stable ID | Element | Complete effect (+0 -> +5) | Build role |
| --- | --- | --- | --- | --- |
| O01 | Phoenix Reactor `infernic-phoenix-reactor` | Infernic | Once per encounter, after a hostile lethal hit/tick, revive yourself at 25% -> 50% H after that hit resolves. Gauge becomes 0; keep spent/recovery dates and cannot act until a later legal turn. The charge is consumed before restoration. | **R**: actual phoenix resurrection, not a renamed stat boost. |
| O02 | Leviathan Pump `aquatic-leviathan-pump` | Oceanic | Total actual absorption during an enemy phase by your native shields becomes a healing pool equal to 30% -> 60% of the blocked damage, capped at 10% -> 20% H. At next player-turn start, divide the pool equally among living injured allies, clipping each share without redistribution. Requires you alive at settlement. | Team repair funded by proven shield work. |
| O03 | Atlas Bastion `tectonic-atlas-bastion` | Botanic | Defense taunts all living enemies for that enemy phase and reduces direct damage to you by 10% -> 20%. Only one squad taunt can be active; latest legal taunt wins. | **G**: intentional tank targeting, not random protection. |
| O04 | Worldtree Heart `efflorescent-worldtree-heart` | Botanic | Your native active-ability overhealing plants a seed on that recipient worth 50% -> 100% of the wasted heal, capped at 10% -> 20% H. At next player-turn start, the seed heals that living recipient once; stronger seed refreshes, never stacks. | Delayed restoration instead of wasted healing. |
| O05 | Thunderbird Coil `voltaic-thunderbird-coil` | Atmospheric | Once per offensive activation with a native critical HP hit, arc to the healthiest other living enemy for 30% -> 60% of that first critical's actual HP damage, capped at 50% -> 100% A. No other enemy means no arc. | Critical chain lightning with a genuinely different target. |
| O06 | Griffin Turbine `atmospheric-griffin-turbine` | Atmospheric | After your Normal Attack deals direct HP damage, each other living ally gains Gauge equal to 15% -> 30% of that damage as a share of your Attack (rounded, up to 25 each; D-355), once per activation. No return to you and no gain on shield-only damage. | A basic-attacking team battery. |
| O07 | Seraph Mirror `luminous-seraph-mirror` | Tranquilitic | A native critical activation heals each living ally for 8% -> 16% of its total direct HP damage, capped at 3% -> 6% H per ally per activation. | Team lifesteal, not self-sustain or shield conversion. |
| O08 | Eclipse Mantle `ominous-eclipse-mantle` | Chaotic | When an Attack Action, including Normal Attack, hits your already-Weakened target, consume one remaining phase of your Weaken after impact to ignore 40% -> 60% of that target's Defense for this hit. One consumption per target per activation; never consume another owner's Weaken. | Spend control duration for penetration. |
| O09 | Kirin Cradle `tranquilitic-kirin-cradle` | Tranquilitic | Defense heals the lowest-HP-ratio living ally for 50% -> 100% D, capped at 10% -> 20% H. Self is eligible; no shield or Gauge is granted. | Defense-stat healer, including non-healer kits. |
| O10 | Ouroboros Core `chaotic-ouroboros-core` | Chaotic | On Last Flare, convert only Gauge above its actual paid cost into a refresh-only self shield: 0.3% -> 0.6% H per excess Gauge, capped at 15% -> 30% H. Consume that excess Gauge, even if a stronger shield makes the offer redundant; normal recovery remains. | Turn capacity/overflow investment into an ultimate barrier. |
| O11 | Cinder Testament `infernic-cinder-testament` | Infernic | Each consecutive damaging tick of your Burn on the same enemy adds +20% -> +40% Burn damage per preceding tick, capped at +60% -> +120%. Reapplying Burn resets this item's tick streak on that target. | Let flames mature rather than constantly refresh them. |
| O12 | Undertide Chronometer `aquatic-undertide-chronometer` | Oceanic | Your first native Weaken application to each enemy postpones its next scheduled skill by 1 -> 2 enemy phases; it uses Normal Attack when postponed. Later schedule intervals shift by the same amount. Once per enemy per encounter, including bosses. | **K**: real enemy timing control replacing dead allied cooldown reduction. |
| O13 | Faultkeeper Loom `tectonic-faultkeeper-loom` | Botanic | After the owner's Normal Attack that player turn (D-336; formerly while defending), intercept 30% -> 60% of each other ally's incoming post-mitigation direct damage, up to 20% -> 40% H routed total per phase. Your shield then absorbs routed damage; it is not mitigated a second time. | **G**: bounded damage sharing, not another team shield. |
| O14 | Verdant Covenant `efflorescent-verdant-covenant` | Botanic | Your effective native active heal of another ally primes +20% -> +40% direct damage for that recipient's next Skill 1 or Skill 2, consumed once for the entire activation. Stronger refresh wins; Last Flare/Normal do not consume it. | Healer-to-damage-dealer setup. |
| O15 | Stormstep Dynamo `voltaic-stormstep-dynamo` | Atmospheric | Switching directly between Skill 1 and Skill 2 gives the new action +25% -> +50% direct damage. Repeating a slot, using Normal/Defense/Last Flare, or a non-damaging new action breaks the chain. First action receives no bonus. | Alternating-skill rotation, no generic reserve bank. |
| O16 | Skythread Rudder `atmospheric-skythread-rudder` | Atmospheric | Each Normal Attack grants a Tailwind. Each Tailwind reduces your next Skill 1 or Skill 2 cost by 10 -> 20 Elemental Gauge, minimum 1 after discounts. That skill spends all accumulated Tailwinds on legal activation. | Accumulate discounts through Normal Attacks. |
| O17 | Dawn Witness Array `luminous-dawn-witness-array` | Tranquilitic | Each noncritical Normal Attack stores a Witness, maximum 3. Your next native critical activation consumes all Witnesses, adding 15% -> 30% A per Witness as one generated strike to its primary target, after native damage. No strike if that target has fallen. | Save failed basics for a later precision payoff, unlike Falcon's forced crit. |
| O18 | Nightglass Archive `ominous-nightglass-archive` | Chaotic | A native damaging skill places one personal Fracture on each surviving target, maximum 3 per owner/target. Your Normal Attack consumes them for +10% -> +20% direct damage each. Marks are placed after impact; the current skill never consumes them by default. | Skill-to-Normal mark rotation. |
| O19 | Stillhour Carillon `tranquilitic-stillhour-carillon` | Tranquilitic | At the start of your forced Last Flare recovery turn, gain 15 -> 30 Gauge once and give the lowest-Gauge other living ally the same amount. No gain on an ordinary unspent turn, stasis skip or missing action slot. | Productive recovery that still costs the action. |
| O20 | Paradox Spindle `chaotic-paradox-spindle` | Chaotic | During forced Last Flare recovery, permit one manual Normal Attack at 50% -> 75% normal direct damage. No skills/Defense; Normal costs/gains and native triggers remain. The recovery date is not shortened and no second action is allowed. | **T**: a limited recovery exception rather than erasing recovery. |

## Ordinary roster: converted Omnic identities (25)

The existing IDs and elements remain, including names whose IDs predate their
Omnic conversion. These are not an additional 25 unlocks.

| # | Identity and stable ID | Element | Complete effect (+0 -> +5) | Build role |
| --- | --- | --- | --- | --- |
| O21 | Phoenix Temper Dominion `tempered-strike-link` | Infernic | A Normal Attack against your existing Burn consumes one remaining Burn phase after native impact and adds one generated strike equal to 80% -> 160% of that Burn's current next-tick damage, capped at 80% -> 160% A. One detonation per activation; if native damage kills the target, do not consume or strike. | Exchange future Burn for immediate basic-action burst. |
| O22 | Worldroot Sap Cathedral `mending-valve` | Botanic | A native direct kill heals the most injured living ally for 8% -> 16% H, once per activation regardless of kills. Self is eligible. | Offensive triage rather than requiring an existing heal kit. |
| O23 | Leviathan Ward Loom `ward-stitch-spool` | Oceanic | Each native shield offer additionally stitches 25% -> 50% of that offer onto that recipient's surviving shield, after normal refresh, capped at 30% -> 60% R total shield. If already above the cap, do not reduce it. This added layer is Conduit-origin. | **K**: explicit bounded shield accumulation, unlike universal refresh. |
| O24 | Eternal Cinder Observatory `cinder-metering-nozzle` | Infernic | When an enemy carrying your native Burn dies with phases remaining, copy that remaining Burn to the healthiest living enemy at 25% -> 50% tick potency. A stronger existing Burn is not overwritten. Copied Burn cannot spread again or trigger any Conduit/native resource. | One-generation Burn propagation, not more duration on one victim. |
| O25 | Sky Sovereign Escapement `pulse-trigger-pawl` | Atmospheric | A Skill 1/Skill 2 activation that deals native critical HP damage refunds 8 -> 16 Gauge once, capped at that action's actual paid cost. No refund on Normal, Last Flare or generated hits. | Critical skill efficiency replacing obsolete cooldown reduction. |
| O26 | Firstlight Concordance `firstlight-cam` | Tranquilitic | After a native damaging Normal Attack, donate up to 8 -> 16 of your remaining Gauge to the lowest-Gauge other living ally, capped by their free capacity. Debit and credit the same amount; no recipient means no cost. | A conserved Gauge transfer, not free team generation. |
| O27 | Secondbeat Rupture Throne `secondbeat-rack` | Chaotic | If an enemy carrying your native Weaken dies, transfer its remaining duration and reduction to the highest-Attack living enemy. Transfer potency is 60% -> 100% of the old reduction, duration at most 3. Stronger existing Weaken wins; transferred Weaken cannot transfer again or generate resources. | Suppression inheritance on kills. |
| O28 | Flare Focusing Iris `flare-focusing-iris` | Infernic | For each Burn phase consumed by Flame Arc, your remaining Burn on each enemy lasts +1 -> +2 Enemy Turns longer. | Spending stored Burn prolongs the remaining flame field. |
| O29 | Abyssal Clearwater Parliament `clearwater-manifold` | Oceanic | Native Gauge gain that would exceed your capacity instead gives the lowest-Gauge other living ally 50% -> 100% of that overflow, capped at 20 -> 40 Gauge per player round including its enemy phase. Never routes Conduit-origin Gauge or relays another overflow. | Rescue wasted income rather than increase your capacity. |
| O30 | Aegis Covenant Crown `aegis-return-spring` | Tranquilitic | Native shield growth on another ally primes one Critical Seal on them. Their next enemy critical direct hit is resolved with multiplier 1 instead of the rolled critical multiplier, then the seal is consumed. Grant at most 1 -> 2 seals total across the team per round; each recipient holds one. Critical RNG/result identity is otherwise unchanged. | Anti-critical support for someone else, not a self-defense duplicate. |
| O31 | Phoenix Lifeforge `emberlife-kiln` | Infernic | Actual HP damage from your native Burn heals you for 20% -> 40% of that damage, capped at 6% -> 12% H total per enemy phase. No healing from propagated Burn or generated echoes. | Damage-over-time self-sustain, distinct from direct lifesteal. |
| O32 | Fractured Mercy Governor `tension-governor` | Chaotic | Native Weaken you apply is +5 -> +10 pp stronger, capped at 60% total reduction. Duration is unchanged; does not create Weaken. | Suppression potency rather than length or penetration. |
| O33 | Worldgrove Covercharge Heart `covercharge-drum` | Botanic | After a native active team heal, redirect 40% -> 80% of the total overheal to the most injured other living ally, capped at 10% -> 20% H per activation. This is immediate generated healing, not another native heal or a saved seed. | Redistribute wasted team-heal output now rather than later. |
| O34 | Sootwake Phoenix Mirror `sootwake-crucible` | Infernic | Your damaging native Burn tick primes one Sootwake on that enemy. The next other ally's native direct hit against it gains +20% -> +40% damage and consumes the Sootwake. Expires at the end of the following player round; refresh one mark, never stack. Cannot be consumed by you or generated damage. | Turn your Burn into another ally's attack opening. |
| O35 | Leviathan Mercy Reflector `tidebound-reflector` | Oceanic | Once per enemy phase, the first direct hit absorbed by any shield on you reflects 20% -> 40% of actual blocked damage to its attacker, capped at 30% -> 60% A. No second Defense reduction on this echo; no reflection of reflected/routed damage. | Shield-funded retaliation. |
| O36 | Tempest Shelter Sovereign `pressurecrest-governor` | Atmospheric | Every 3 -> 2 offensive activations with native critical HP damage earn one Windveil, maximum one held. Windveil completely avoids the next enemy Normal Attack against you, then is consumed; scheduled skills cannot be avoided. Avoided hits provide no incoming-hit Gauge or absorption trigger. | **K**: deterministic evasion, not an added dodge RNG stream. |
| O37 | Worldroot Triage Sanctuary `rootbound-triage-vault` | Botanic | When your native active heal leaves a living recipient below 20% -> 40% R, automatically spend 15 of your remaining Gauge, if available, to heal them toward that threshold, limited to 10% -> 20% H extra. Once per activation; choose the lowest-HP-ratio eligible recipient after the native team heal. No useful restoration means no payment. | A paid emergency top-up, not revival or cooldown reduction. |
| O38 | Solace Witness Monolith `solace-anchor` | Tranquilitic | Once per encounter, permit Defense as a free manual preparation before your normal action, costing 10 Gauge. Gain 10% -> 20% additional direct-damage reduction for the current enemy phase. Not allowed while spent/recovering; the charge is consumed before applying Defense and no second free Defense is possible. | **T**: a bounded free-guard decision with an explicit cost. |
| O39 | Ruinselect Fracture Parliament `ruinselect-prism` | Chaotic | Skill 1 may consume your existing personal Fractures as well as Normal Attack, for +15% -> +30% Skill 1 direct damage per mark, maximum 3. Grants no marks, consumes before impact and never consumes another owner's marks. | Redirect the Fracture payoff into Skill 1; needs a separate mark source. |
| O40 | Pyre Census Requiem `infernic-pyre-census` | Infernic | Every third damaging native Burn tick on a given enemy becomes a Census tick for +75% -> +150% damage. Track damaging ticks across native refreshes; reset when Burn expires or changes owner. Generated/propagated Burn does not count. No critical roll or cooldown effect. | A deterministic ticking cadence, unlike Cinder's refresh-sensitive ramp. |
| O41 | Shared Tide Lifesea Engine `oceanic-shared-tide-pump` | Oceanic | When an ally protected by your native shield is hit, other living allies' shields from you may absorb up to 30% -> 60% of the post-mitigation hit before the target's own shield. Draw from other shields in squad order; never spend HP or apply mitigation twice. | **G**: a team shield network rather than independent bubbles. |
| O42 | Tempest Return Chronarch `atmospheric-storm-clock` | Atmospheric | Three native critical offensive activations prime one Storm Clock. Your next Last Flare costs 15 -> 30 less Gauge, minimum 70 after all Last Flare discounts; consuming it resets the counter. No recharge from Last Flare itself. Captured ultimate intervals/recovery remain. | Save critical tempo for a cheaper ultimate. |
| O43 | Worldroot Graft Coronation `botanic-graft-covenant` | Botanic | Flora's newly planted native Seeds store +20% -> +40% healing. Apply once when planted, including empowered Seeds; refresh rather than stack. No new resource or Seed for another kit. | **K**: strengthens Flora's delayed-healing identity, replacing retired Bloom capacity. |
| O44 | Accord Seraph Sanctuary `tranquilitic-accord-bastion` | Tranquilitic | Your first effective native support of another ally per encounter grants that ally one Accord. Their next lethal direct hit instead leaves 1 HP, consumes Accord and gives a refresh-only shield of 10% -> 20% H after the hit. Only one Accord granted per bearer per encounter, no revival and no immunity to later hits. | **R**: one designated ally's life insurance. |
| O45 | Rosefault Precision Sovereign `chaotic-fault-verdict` | Chaotic | After the first native critical HP hit of an offensive activation, if its target survives, consume up to 10% H of your current shield to add 50% -> 100% of the shield actually spent as generated damage to that target, capped at 50% -> 100% A. Once per activation; a fallen target means no payment and no search for a different critical target. | Spend defense for critical offense, independent of Rose-only resources. |

## Master roster (48)

Masters retain their exact names, character assignments and artwork. No repeated
"bank three Astral Reserve, then press a different skill" template is retained.
Use native resources where meaningful; introduce only named, bounded state
needed by the individual design.

These have **no upgrade endpoints**. Percentages are fixed approved values.
They stay equipped/active throughout battle. A written once-per-encounter,
per-activation or phase limit restricts that particular payoff, not whether
the Master itself is enabled.

### Infernis: flame upkeep / focused siege / charge economy

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M01 | Helios Pyre Cathedral `master-ember-1` | When Infernis's native Burn would expire from ticking, pay 3% H to keep it for one further phase, only if Infernis is above 50% HP and can pay while remaining above 1 HP. At most two paid extensions per native application per target. Paid extensions are generated clock changes and cannot create more extension allowances. | HP-supported flame upkeep; no revival or infinite Burn. |
| M02 | Cinderstar Genesis Engine `master-ember-2` | Flame Arc becomes a single-target siege strike with double its native direct-damage coefficient. Only the selected target's owned Burn can detonate. It retains its cost; Last Flare remains all-enemy. | **K**: area-to-duelist transformation. |
| M03 | Unbroken Sunforge Throne `master-ember-3` | Flame Arc detonates at most one remaining owned Burn tick per target for twice that tick's damage, consuming only one tick. No owned Burn means no detonation. Last Flare still applies its ordinary Burn. | **K**: conserve the native Burn clock rather than retired charges. |

### Tizu: shield-break insurance / concentrated shelter / control tank

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M04 | Abyssal Shelter Observatory `master-tide-1` | The first direct enemy hit per ally per encounter that completely breaks Tizu's native shield cannot spill damage into that ally's HP. The shield must absorb positive damage and be exhausted by this hit. No protection on an unshielded target or later shield breaks. | **R**: shield-break overflow prevention, not a general resurrection. |
| M05 | Ocean Memory Worldpump `master-tide-2` | Tidal Shelter gives the explicitly selected living ally three times its native shield offer, with the same one-phase expiry. Other allies and Ocean Memory remain unchanged. Stillwater Gauge requires a full hit absorbed by Tizu's own native shield. | **K**: selected concentrated rescue. |
| M06 | Undertow Sovereign Harpoon `master-tide-3` | An enemy carrying Tizu's native Weaken targets Tizu with single-target hostile actions while he lives. Attacks retain the enemy's ordinary critical roll, Weaken and damage calculation. Newest active forced-target effect wins; area attacks are unchanged. | **G**: suppression becomes threat control. |

### Flora: responsive passive / botanical control / resurrection healer

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M07 | Worldseed Mercy Foundry `master-sprout-1` | Add a 2% R team heal after each living ally's first native ordinary-skill activation that round, including Flora's. Maximum three pulses per round; no pulse from Last Flare, assists, Conduit effects or a fallen Flora. Seeds remain unchanged; no retired Bloom is earned. | **K**: skill-responsive support alongside delayed healing. |
| M08 | Briar Constellation Loom `master-sprout-2` | A damaging Skill 1 adds Rootbind to its surviving target. Its next scheduled skill is replaced by Normal Attack, then Rootbind ends. Each enemy can be Rootbound once per encounter; normal attacks do not consume it. Skill 1's direct damage and Seed remain. | **K**: one-shot botanical control, including bosses. |
| M09 | Evergreen Continuance Crucible `master-sprout-3` | Once per encounter, Worldseed also revives fallen other allies at 30% R after its ordinary damage/healing resolves. They return with 0 Gauge, spent until next player turn, and unchanged recovery dates; no native healing/resource triggers from resurrection. Flora must live to cast it and still pays/recover normally. | **R**: a real resurrection-healer option; no repeat resurrection loop. |

### Atmoso: sweeping basics / counterwind / critical overflow

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M10 | Sky Without End Turbine `master-atmoso-1` | Normal Attack becomes all-enemy at 70% of its usual direct coefficient per target. Gauge gain, action cost and action-based triggers happen once per activation, not once per enemy. It does not charge Atmoso's own Cyclone. | **K**: normal-action crowd pressure. |
| M11 | Horizon Cyclone Orrery `master-atmoso-2` | Cyclone Weave gives Atmoso a Counterwind until his next action. Each direct enemy hit he survives adds 15% outgoing damage to that action, up to 45%; shield absorption qualifies. Clear on the next manual action even if it has no direct damage. No extra counterattack or critical roll. | Take pressure before releasing a stronger gust. |
| M12 | Crosswind Imperial Drive `master-atmoso-3` | Critical Rate above 100%, computed before the ordinary cap, becomes bonus native direct damage at 1% per excess pp, maximum +50%. Actual critical chance still caps at 100%; no benefit from noncritical-only Verdict Caliper. | **K**: overflow stat conversion, not another conditional critical proc. |

### Aurora: exposure / critical suppression / reparative judgment

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M13 | Final Dawn Tribunal `master-aurora-1` | Enemies carrying Aurora's unconsumed native Seal have 15% less effective Defense against allied native direct attacks. Exposure ends when the Seal is consumed or expires; no stacking stat mutation. | Team vulnerability tied to predictive control. |
| M14 | Prismseal Astral Judiciary `master-aurora-2` | Aurora's Last Flare adds a Judgment Seal to each surviving enemy for two enemy phases. Sealed enemies cannot critically hit, though the ordinary critical RNG draw is still consumed. Recasting refreshes the seal; does not cancel a scheduled skill. | **K**: proactive enemy critical denial. |
| M15 | Merciful Eclipse Regulator `master-aurora-3` | After an enemy carrying Aurora's unconsumed native Seal removes an ally's HP with a direct hit, heal the most injured other living ally for 50% of that HP loss, capped at 10% H per enemy phase. No revival or routed-damage trigger; a special that consumes the Seal no longer qualifies. | Restore another ally while awaiting the sealed special. |

### Bliss: sacrificial grace / twin cut / ally efficiency

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M16 | Thousandfeather Zenith Loom `master-bliss-1` | Before Skill 2, automatically pay 10% H if Bliss can remain at 1 HP or more. Divide that paid HP equally as additional native healing for the other living allies, in any posture. Her ordinary posture effects remain. No other living ally means no payment; no retired Bloom is created. | HP-for-team-healing alongside order-based play. |
| M17 | Stillplume Planetary Ballet `master-bliss-2` | Warfeather Cut becomes two impacts against the same selected target, each at 70% of the original final direct damage. Reuse one critical result; costs, native resource spending/earning and equipment triggers resolve once for the activation's combined actual HP damage. Stop if the first hit kills; never retarget the second. | **K**: a true twin-cut presentation/calculation without double proc income. |
| M18 | Quiet Heaven Fanforge `master-bliss-3` | Once per encounter, Bliss's Last Flare gives the lowest-Gauge other living ally one Quiet Feather. Their next legal Skill 1 costs no Gauge; consume before activation. It grants no action, missing skill, cooldown bypass or recovery bypass. Other discounts cannot turn the zero cost into a refund. | Sponsor one ally's skill rather than grant another generic Attack buff. |

### Bruno: hit limiter / defensive artillery / permanent quarry

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M19 | Living Worldwall Atlas `master-bruno-1` | The first direct enemy hit against Bruno each enemy phase cannot remove more than 20% H after shield absorption. It still spends his shield normally. Later hits, Burn and routed damage are uncapped by this Master. | One heavy-hit limiter, not universal damage immunity. |
| M20 | Quarry Planet Gravitas `master-bruno-2` | Bruno's Last Flare grants himself a Shield equal to max(200% effective Defense, 20% maximum HP). Cover is unchanged; this adds no attack. | **K**: a defense-scaling Shield build. |
| M21 | Worldforge Hammer Dominion `master-bruno-3` | Each damaging Skill 1 permanently removes 15% of the target's encounter-entry Defense, capped at 30% total per enemy. In exchange, Skill 2 Cover redirects 35% rather than 50%. Reset excavation on a fresh encounter; no Weaken or stat recursion. | **K**: trade Cover strength for armor excavation. |

### Disciple: lasting empowerment / linked Gauge / psychic assist

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M22 | Unbound Mindcrown Synapse `master-disciple-1` | Disciple's native Instructions expire two player rounds later. They still enhance only the recipient's next native action and retain the single ordinary Instruction limit. No generated buff or extra action. | Instruction stewardship. |
| M23 | Concord Planet Thoughtforge `master-disciple-2` | After Last Flare, link living allies through the end of the next two player rounds. Native positive Gauge gains to a linked ally are split equally among currently living linked allies; clip full recipients without redistribution. Total offered Gauge is conserved, costs/refunds/generated income are not shared, and the link ends if Disciple falls. | **K**: a temporary team economy rewrite, not free Gauge multiplication. |
| M24 | Sovereign Will Amplifier `master-disciple-3` | After Strike Instruction, its explicitly selected living recipient makes one generated assist at 40% of their own Attack, including applicable Attack buffs, against the first living enemy in formation order. No extra RNG, critical, Gauge, resources, action spend, Instruction consumption or recursive equipment triggers. Once per Disciple activation. | **K**: support-triggered ally assist. |

### Elise: armor-cutting precision / four-point storm / execution reset

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M25 | Infinite Thunderwheel Arsenal `master-elise-1` | Elise's native critical direct hits ignore 50% enemy Defense, but their final critical multiplier is fixed at 1.5, including elemental criticals, regardless of Critical Damage modifiers. Noncritical hits retain ordinary mitigation; shields remain shield-first. | **K**: trade critical-multiplier scaling for reliable armor-cutting precision. |
| M26 | Twin Star Planetary Ratchet `master-elise-2` | Last Flare resolves four impacts per original target, each 30% of the original final damage. Reuse the native critical result per target; costs, recovery and Conduit/native resource triggers happen once per activation using combined HP damage. Never retarget impacts from fallen enemies. | **K**: four-point ultimate rhythm, not four independent ultimates. |
| M27 | Storm Empress Execution Clock `master-elise-3` | Once per encounter, Elise's native direct kill clears her spent flag so she may choose one additional legal action that same player turn. Keep Gauge, readiness and recovery dates unchanged; a kill during Last Flare cannot bypass its recovery. Consume permission before clearing spent. | **T**: an explicit execution action reset with no refund loop. |

### Razor: parry / shield sacrifice / silence

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M28 | Unbroken Midnight Bastion `master-razor-1` | After Razor's Normal Attack that player turn (D-336; formerly while defending), Razor parries the first scheduled enemy skill targeting him each enemy phase: reduce that hit's direct damage by 50%, then reflect 50% of the prevented damage to the surviving attacker, capped at 100% A. Normal Attacks do not consume the parry. Reflection is generated and cannot reflect again. | A skill-specific parry rather than generic Defense healing. |
| M29 | Eclipse Planet Watchtower `master-razor-2` | Before Last Flare, consume Razor's entire existing shield to add +2% direct damage per 1% H actually spent, maximum +60%. Last Flare's new native shields are offered afterward and cannot fund that same cast. No preexisting shield means no bonus. | Sacrifice yesterday's protection for today's ultimate. |
| M30 | Nightglass Counterblade Engine `master-razor-3` | Razor's first Skill 1 hit on each surviving enemy Silences it once per encounter: its next scheduled skill becomes Normal Attack, then Silence ends. Normal Attacks do not consume Silence. No Weaken or additional Wounds are granted. | **K**: one-use silence without retired suppression. |

### Rosetta: focused grace / thorn ricochet / consumable openings

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M31 | Rose Beyond the Sun Orrery `master-rosetta-1` | Replace the two-contributor Quarry shield payout with one 48% R shield on the lowest-HP-ratio living ally, including a non-contributor. The same once-per-turn contribution gate remains; no passive heal or retired Grace. | **K**: concentrated coordinated rescue. |
| M32 | Virtuous Planet Rosegarden `master-rosetta-2` | After Skill 2 hits the Quarry, send up to two generated ricochets, one per distinct other contributor this turn, to different other living enemies in descending HP order. Each deals 25% of the primary hit's actual direct HP damage. Unused ricochets vanish. | Quarry teamwork becomes selective side pressure. |
| M33 | Golden Thorn Judgment Loom `master-rosetta-3` | Last Flare primes one Golden Opening on the surviving Quarry. The next other ally's native direct hit consumes it for +40% damage. One Opening per enemy; no stacking, expiry extension, or benefit to Rosetta herself. | Coordinated team setup without retired Weaken. |

### Thornia: shattering thorns / full-Aegis cleave / guardian covenant

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M34 | Forbidden Garden Worldlock `master-thornia-1` | Replace a trap's ordinary hostile-activation retaliation with one generated 40% A strike against every living enemy. Consume one trap charge as usual; no response to harmless activations or a fallen Thornia. | **K**: distributed retaliation instead of focused thorns. |
| M35 | Thousand-Rose Planetary Aegis `master-thornia-2` | Skill 2 against a target with three native trap charges strikes all living enemies at its native direct coefficient, applying generated 15% Weaken for one phase to secondary survivors. Consume its ordinary selected-target trap charge once; aggregate equipment triggers once. | **K**: intact traps unlock a wider cleave. |
| M36 | Shadow Rose Sovereign Foundry `master-thornia-3` | Gilded Thorn Guard links its living other recipients to Thornia until next player-turn start. On the first otherwise-lethal direct hit to a linked ally that phase, route up to 20% H of the would-be HP loss into Thornia's shield/HP; preserve the ally only if this removes the full lethal excess. Once total per enemy phase; Thornia can fall and does not self-resurrect. | **R/G**: bounded guardian sacrifice, not unconditional team immortality. |

### Crinso: critical flame imprint / shield-fed Burn / alternating duality

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M37 | Twin-Rose Singularity Drive `master-crinso-1` | A native critical Gold Skill 1 stores its actual critical multiplier minus one, capped at +50% outgoing damage for the next Crimson Skill 2. One refresh-only imprint, consumed once on activation; no Burn or extra critical roll. | Critical Gold precision carried into Crimson. |
| M38 | Duality Planet Flamewheel `master-crinso-2` | Before Crimson Skill 2, consume up to 10% H of current shield. After its direct hit, deal one generated strike at 50% of shield actually spent, capped at 50% A. No paid shield means no strike; no Burn, new RNG or generated resource hooks. | Shield-fed Crimson follow-up, not Infernis's Burn. |
| M39 | Crimson Beauty Pyre Requiem `master-crinso-3` | Native offensive activations alternate Gold and Crimson, starting Gold. Gold gives +30% direct damage; Crimson heals Crinso for 20% of actual direct HP damage, capped at 10% H. Last Flare gets both and resets the next activation to Gold. Defense does not advance polarity; no extra personal resource bank. | **K**: explicit dual-aspect rotation, not another critical proc bundle. |

### Nerithe: charted follow-up / support conversion / light ultimate

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M40 | Shoreless Meridian Worldchart `master-nerithe-1` | Nerithe's Normal Attack marks its surviving target as Charted. One other ally's next single-target Attack Action, including Normal Attack, copies a generated 40%-damage echo to each different Charted enemy, then clears all Charts. No echo to the original target; Charts neither generate Gauge nor replace her fixed Normal-only +5 passive. | Team target preparation without copying her passive. |
| M41 | Folded Ocean Planetarium `master-nerithe-2` | Fold the Sea becomes a pure team support skill: no direct damage or Weaken. It gives each living ally 15 native Gauge and 15% next-direct-hit protection. Retain its Skill 2 Gauge cost and one-action use; effects cannot exceed actual capacity or stack protection. | **K**: an explicit offensive-to-support skill replacement. |
| M42 | Abyssal Surveyor Crown `master-nerithe-3` | Ocean Beyond the Map deals 50% less direct damage but no longer imposes next-turn recovery. Its 100 Gauge base cost, native Weaken and one-action limit remain; it does not grant another action on the cast turn. | **T**: a lighter ultimate with a real recovery trade-off. |

### Orvella: layered foundations / shield redistribution / fortress growth

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M43 | Throne Beneath the World `master-orvella-1` | Foundation starts with half its usual shared durability. On creation each living ally also receives a generated plate equal to 5% H, capped at 15% R. Plates refresh without stacking, absorb as Conduit shields and grant no native shield resource. | **K**: shared durability traded for personal plates. |
| M44 | Deep Foundation Planetpress `master-orvella-2` | After Foundation creation, spend its durability as equal healing shares for living injured allies. Total paid/healed is the minimum of 25% of remaining durability, 5% H and eligible ally count times their smallest missing-HP amount. Debit exactly actual restoration; no injured ally means no payment. | Conserved shared durability becomes HP. |
| M45 | Keystone Sovereign Counterweight `master-orvella-3` | Orvella gains +20% of her encounter-entry D per living ally protected by any positive shield or her active positive shared Foundation, maximum +60%. Count each ally once. Recalculate before each hit/offer without mutating entry Defense or HP. | Foundation-network Defense stance. |

### Vaelor: self-straining finale / charge conversion / conductor's turn

| # | Identity and stable ID | Proposed complete effect | Review |
| --- | --- | --- | --- |
| M46 | Final Chord Celestial Resonator `master-vaelor-1` | Last Chord of the Sky pays 20% of Vaelor's current HP immediately before impact, leaving at least 1 HP, for +75% direct damage. This payment is mandatory while equipped, is not hostile damage and grants no incoming-hit effects. Gauge cost and next-turn recovery remain. | An unmistakable high-risk finale, not generic low-HP lifesteal. |
| M47 | Thunder Choir Planetary Fugue `master-vaelor-2` | Skill 2 cast during Rise also applies generated Weaken of 15% for one enemy phase to surviving direct-hit targets. No retired Tempest spending, native resource hooks, or overwrite of stronger Weaken. Tune/Crescendo and Last Flare are unchanged. | **K**: beat-timed team safety. |
| M48 | Broken Sky Imperial Metronome `master-vaelor-3` | Once per encounter, Vaelor's Defense may clear the spent flag of the highest-Gauge other living spent ally who is not recovering. Vaelor spends his own action; the recipient still pays their next action's full costs and follows readiness/recovery. No eligible ally means the permission is retained. | **T**: donate an action to a teammate, not generate an unlimited turn. |

## Shared interaction contract

### Damage, clipping and ordering

1. Legal target/action checks happen before any charge, HP, shield or Gauge cost.
   Compute action cost once, consume permissions before granting their payoff,
   and snapshot pre-activation HP/critical conditions as specified.
2. For each target, calculate native direct damage using existing diminishing
   mitigation, native coefficients, applicable modifiers and one existing
   critical draw. Add bonuses within their named outgoing bucket, not as a
   chain of multiplicative item procs. Pierce combines additively, capped at
   75% enemy Defense ignored. Final direct-damage rounding remains once per
   resolved hit and floor 1 for positive hostile damage.
3. Scalar damage bonuses for the same action add; any native-direct Conduit
   bonus bucket caps at +300%. Native and authored character modifiers remain
   separate from this equipment cap. A forbidden critical takes precedence
   over guaranteed critical, and prevents all critical-dependent triggers.
4. Generated fixed strikes use `A * coefficient * A/(A + target Defense)`.
   A specified actual-damage echo is already mitigated and is not mitigated
   again. Generated damage never crits or creates another native action.
   Every generated hit can make an ordinary defeat/reward event exactly once.
5. "Actual damage" is positive HP removed, clipped to the victim's HP before
   the hit. No shield absorption, overkill, HP payment, reflected/routed damage
   or other generated strike contributes to ordinary lifesteal/critical
   conversion. Sum native AoE HP loss once, then apply the per-activation cap.
6. Multi-impact Masters divide the computed hit without independent critical
   rolls. Allocate integer remainder deterministically to the final impact;
   combined offered damage matches the promised total exactly. Damage-dependent
   triggers see one activation aggregate, not four chances for income.
7. Resolve native damage/status/support first; generated post-hit effects follow
   in ordinary slot order, then Master effects. Snapshot each effect's eligible
   actual native amounts before generated effects run. Apply death prevention
   at the lethal hit, then resurrection, then defeat/outcome evaluation.
   Do not end combat before an approved rescue for that hit is resolved.
8. Burn snapshots potency at native application. Streak/cadence item state is
   owner/target specific and uses the reset conditions in its row. Durations
   from extensions cap at six remaining enemy phases unless a row says less.
   A fresh application refreshes to the stronger final offer, never adds
   durations. It never steals a stronger status from another owner.

### Healing, shields, Gauge and targeting

- Healing clips at actual missing HP and normally requires a living target.
  Only rows explicitly marked as resurrection restore a fallen member.
  Healing/shield offered multipliers add in their respective bucket, capped
  at +200% over the native offer before explicit skill-shape transformations.
- Shields refresh the greater existing total unless an approved row explicitly
  adds a layer. Store origin/owner for every layer; never erase native
  attribution because a smaller generated shield was offered. Consume ordinary
  layers oldest-first with deterministic same-time slot ordering, then any
  specifically post-shield plate. Only the actual native layer absorption can
  earn authored shield resources. Total additive ordinary layers cap at 60% R;
  larger native refresh shields are not reduced to that cap.
- All damage reductions combine multiplicatively after normal mitigation,
  capped at 75% total direct reduction. Defense and Weaken remain their own
  existing calculation stages; HP-loss limits, parry prevention and lethal
  prevention are explicit later stages, not additive reductions.
- Ordinary skill discounts add, minimum cost 1 except the explicit Quiet
  Feather permission. Last Flare discounts add but cannot bring cost below 70.
  No refund exceeds actual paid cost. No generic skill discount affects
  Last Flare. No negative cost, double refund or payment on a rejected action.
- Gauge remains fractional internally and clips at actual capacity. Capacity
  modifiers do not themselves refill Gauge. Native overflow is computed before
  linked-income distribution, then routed once; generated distribution never
  creates overflow/links again. Suppressed/avoided hits grant no incoming Gauge.
- "Most injured" means lowest current HP/max-HP ratio among eligible living
  recipients; "lowest Gauge" uses current Gauge, not percentage capacity.
  Ties use frozen squad order. Highest-HP/Attack enemies use current resolved
  values and frozen enemy order for ties. Reuse one chosen recipient for all
  parts of a single payoff. "Other" always excludes the owner.
- No valid recipient or no effective payoff consumes no bank/payment unless
  the row explicitly pays on use (such as Ouroboros excess). Opening offensive
  charges/rotation state consume on legal activation even if shields prevent
  HP damage; HP-damage-triggered effects still require actual HP loss.

### Routing, control and rescue precedence

- Forced targets resolve before the existing random target selection, but
  consume the same target RNG draw for stream compatibility. Latest legal
  forced-target application wins; same activation ties use squad order.
  Fallen or unavailable protectors cannot attract attacks.
- Prevent evaded hits first. Calculate the original target's native mitigation,
  critical and direct reductions, then perform one routing pass. Shared Tide
  spends other native shield layers before the target's; Faultkeeper intercepts
  only what remains afterward, subject to its phase budget. Intercepted damage
  does not pass through another interceptor or trigger native hit effects.
- Guardian lethal interception occurs only after ordinary routing/shields and
  HP-loss limits. Route only enough to remove lethal excess, within its cap.
  The destination cannot redirect the redirected damage again. A protector
  may be defeated, but no recursively intercepted hit can trigger resurrection
  chains on other protectors.
- If still lethal: consume a preexisting Accord first, then Stasis if present.
  Do not spend both on the same hit. Phoenix resurrection applies only if HP
  actually reaches zero afterward. Each permission is consumed before changing
  HP; no permission resets merely because the owner was resurrected.
- Stasis and forced Last Flare recovery overlap rather than queue extra skips.
  Explicit recovery exceptions cannot bypass Stasis or ordinary action spend.
  A donated/reset action cannot clear recovery, Stasis or a second-action cap.
  Across all equipped effects, a member may take at most two manual actions
  per player round; free Solace Defense is a preparation, usable only once
  per encounter, not a third offensive/manual spend.
- Rootbind and Silence consume together on a due skill and replace it with
  exactly one Normal Attack, not two lost scheduled attacks. Undertide's
  explicit schedule shift resolves first. A phase with no due skill consumes
  neither control charge. No item silently changes boss skill intervals forever.
- No new random proc rolls are added. Existing critical draws are reused,
  not skipped by crit guarantees/denials. Additional deterministic targets,
  resurrections and control replacements must not consume reward/capture RNG.

### Persistence and published-game parity

Ownership, prices, rarities, ordinary eight-slot/four-Omnic limits, elemental
requirements, Master assignments, chest/drop odds and upgrade costs are unchanged.
No retroactive refund, component grant, extra copy or rarity conversion.
No equipment sale or new currency is included.

The approved rules/coefficients and effective upgrade levels must be frozen
with the battle loadout, not looked up from changing menu gear mid-run.
New per-effect clocks, routing attribution, revive permissions and extra-action
limits belong to battle state, not the account wallet. Keep them through
Settings, disconnect/retry and authoritative request replay; fresh encounter
initialization resets them once. Re-entering/replaying cannot replay a receipt
or award a second kill for the same defeated identity.

The owner chose the communicated current-encounter restart described above.
Existing frozen runs must not silently receive a mixture of old stat bundles
and new proc rules. No load-time account-wallet write.

The signed-in server imports a generated shared engine. Local catalog/UI
changes alone cannot publish these mechanics. Regenerate and type-check the
server bundle, deploy only with publication approval, and verify hosted parity
before calling the redesign live.

## Coverage and duplication review

| Character feature / build choice | Examples in the approved roster |
| --- | --- |
| Normal, Skill 1, Skill 2 and Last Flare specialization | C02, C06, C10, L01; each slot is separately addressable. |
| Area, isolated boss, armor and damage-funded shields | L06, R02, R12, M02, M25. |
| Critical rate, multiplier, reliability, overflow and noncritical builds | C04/C07, R03/R07, M12, L15. |
| Maximum HP, Defense, Attack and elemental trade-offs | C01/C03, R11, L02-L04, L08. |
| Active healing, passive healing, overheal, delayed healing and emergency repair | R05, M07/M31, O04/O33, O37. |
| Self/team lifesteal, Burn sustain, shield generation, shield stacking and reflection | R08, O07/O31, R10, O23/O35. |
| Gauge generation, storage, transfer, overflow, cost reductions and ultimate funding | C05/C09, O06/O26/O29/O42, R13. |
| Burn upkeep, cadence, propagation, detonation and HP investment | O11/O24/O40/O21, M01, L12. |
| Weaken strength, duration, inheritance, penetration trade and allied openings | O32, R14, O27/O08, M33. |
| Fracture setup and alternative spending | O18/O39. |
| Defense, threat, interception, critical denial and avoidance | O03/O13/O30/O36, M06/M14/M28. |
| Resurrection, lethal insurance, recovery and manual-action economy | O01/O44, L09, O19/O20/O38, M09/M27/M42/M48. |
| Intrinsic resource capacity, selective spend and ability transformation | O43, M03/M35/M47, M05/M41. |
| Captured-unit usefulness without inventing missing native effects | Universal ordinary roles such as C02/C03/C09, R08/R13, L06, O06/O09/O19. |

Explicitly excluded from this implementation despite the broad creative permission:
bonus currencies/drop rates, paid services, permanent account stat growth,
new acquisition pools, item evolution, new player skill cooldowns and new
random proc streams. These would expand the economy/content scope rather
than distinguish the existing equipment.

## Release acceptance checks

1. Owner approval covers the complete roster, all R/T/G/K rows, stat-bundle
   reductions, ordinary scaling endpoints and current-encounter restart.
   Master upgrades are not included.
2. Add typed effect descriptors/resolvers with explicit upgrade functions;
   one shared description source must print actual +0/current/next/+5 values.
   Remove dead cooldown behavior and obsolete fixed-stat assumptions from
   runtime, UI and validation together. No text-only "unique" rework.
3. Wire ordinary and Master effects through native damage, shield attribution,
   heals, costs, targeting, enemy control, death prevention and round advancement.
   Update availability/turn-advance logic for real donated/recovery actions.
   Render new shields/control/rescue state accessibly; no missing icon URLs.
4. Cover every identity with executable qualification/nonqualification tests.
   Check structural mechanic signatures, not just unique prose. Test exact
   coefficients at all six ordinary levels and threshold transitions; fixed
   Master values must ignore ordinary upgrade maps.
5. Verify zero damage, shield-only damage, overkill, AoE, multi-hit rounding,
   owner death, multiple protectors, mixed native/generated layers, capped
   recipients, disallowed actions, no eligible teammate, resource attribution,
   failed persistence and request idempotency. Rejected actions must leave
   state/permissions/Gauge/HP and RNG unchanged.
6. Test resurrection before all-fallen defeat, double-rescue priority, enemy
   phase continuation, no same-turn resurrection actions, no infinite turn loop
   and accurate per-kill rewards from generated damage. Repeat through Settings,
   authoritative resume, Continue and Replay stage.
7. Re-run starter/early material/endgame equipped-squad difficulty benchmarks,
   comparing actual hit/clear outcomes rather than total displayed Attack.
   Investigate newly mandatory items or effectively immortal/looping builds
   before shipping. Publish measured results, not an assumed balance guarantee.
8. Audit Character/equipment totals, Upgrade/confirmation/receipts, Inventory,
   Collections/View Details, loot dialogs and Battle references against the same
   level-resolved effect data. Pure mechanics should not show invented stat
   deltas, and the new caps/penalties must remain visible on phone layouts.
9. Run focused Conduit/combat/account/online/presentation suites, then full
   suite, client production build and server TypeScript. Regenerate the shared
   server bundle. Deploy client/server coherently only after approval; hosted
   disposable-account smoke must prove matching outcomes and intact accounts.

## Implementation verification

`tools/build_conduit_redesign.mjs` reproduces the shared133-row description
and coefficient registry from these tables. Both catalogs expose only current
effects and listed passive stats; the old executable reserve resolver is removed.
Its small historical snapshot type remains solely for compatibility restarts.

`conduit-roster.test.ts` executes every ordinary identity at all six upgrade
levels, equipped and unequipped (1,020 cases), plus all48 Masters equipped and
unequipped (96 cases). Interaction coverage includes accepted versus rejected
native status applications, owner-specific mixed shield layers, independent
Foundation refreshes, actual taunt application order/expiry, Crinso Defense,
native assist coefficients, same-round revived action restrictions, rescue
precedence, action caps, exact multi-impact totals and generated provenance.
Endgame checks retain authored boss curves and prove starter, Rose and mixed
specialist squads can clear their final bosses with real legal equipment.
See [handoff](handoff.md#complete-conduit-redesign-d-313) for final commands,
outcomes and any unrelated baseline failures.

### Historical D-302 design-only verification

An inline `node --input-type=module` audit using the existing TypeScript parser
passed against the actual catalogs: exactly 85 ordinary and 48 Master rows,
all 133 stable IDs/names unique and matched, ordinary rarity counts 10/15/15/45,
all 45 elemental assignments matched, complete row numbering and distinct
effect text. All proposal file-link targets resolve. This checks coverage and
identity, not executable mechanic uniqueness or balance.

`git diff --check` passed in that original documentation-only phase. It required no gameplay
build/test run and makes no claim that the proposed effects have executable
coverage yet. No runtime, account, artwork or deployment change was made.
