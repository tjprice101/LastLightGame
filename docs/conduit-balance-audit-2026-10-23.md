# Read-only Conduit balance audit — 2026-10-23

## Scope and conclusion

This audit changes **no gameplay, equipment effects, stats, save rules or production
flags**. It adds reproducible offline tools and tests. The current source has
`phaseZeroStatsReady = true`; the combat runtime uses **rules9** and the current
D-385 enemy curve. Old, disabled-Phase-0 accounting files are not evidence for
this audit.

**All138 current catalog IDs were simulated:90 ordinary and48 named Masters.**
Every ordinary entry was tested at+0 and its legal maximum,+5. Masters were
tested only at their fixed, non-upgradeable level. No item was silently skipped.

The strongest demonstrated risks are **approved-effect synergies**, not a
demonstrated implementation exploit:

1. **Razor's first Master + Glassroot + Wounds:** a native Atmospheric EX+3
   boss with3,059,413HP dies on round3 in an exact, event-replayed fixture.
2. **Glassroot Gimbal plus maximum-Health investment:** its explicitly uncapped
   Health-to-Power conversion produces double-digit Skill Power and changes
   EX+2 results dramatically.
3. **Gauge support against multi-impact bosses:** Twinpulse/Atlas/Griffin/
   Firstlight enable additional EX+3 wins by sustaining real authored kits.
4. **Nightglass Archive's duplicate living-wearer squad aura:** three legal
   wearers provide+900% raw-base Direct Attack at+5, making an otherwise
   fragile Chaotic team substantially stronger.
5. **Firstlight Cam:** one copy's squad Defense/Gauge support can outperform
   three copies under this pilot. Strong power does not imply monotonic wins.
6. **Stasis Reliquary plus Granite Hourglass and sustain:** repeated protection
   is real, including48 activations in a100-round native battle. Its next-turn
   penalty/cooldown also works. Some combinations produce long stalemates, not
   wins. There is **no evidence here of permanent every-turn immunity**.

The primary matrix contains **18 EX+3 wins, across six focal IDs**, all in the
supported all-pattern pass and all against Heaven/Atmospheric multi-impact
bosses. Their18 controls have14 defeats and4 timeouts. All18 on/off outcomes
were replayed with complete event traces and verified against the primary run.
The focused duplicate-aura and Stasis matrices have no EX+3 wins. These are
bounded empirical results, not proof that other combinations are safe.
No nerfs are implemented or implicitly authorized by this report.

## Method and controls

### Executed matrix

The primary run contains **86,904 unique matched on/off fixtures**:

- **62,280 wearer-matrix pairs:** every eligible wearer of every catalog ID,
  each legal upgrade endpoint, two equipment contexts, six native endpoints
  and three fixed seeds.
- **24,624 additional all-pattern pairs:** every ID/upgrade endpoint, its first
  eligible wearer and all36 native Calamity encounters:12 activities times
  EX+1/EX+2/EX+3.
- **6,912 enhanced Stasis pairs**, plus two synthetic packet probes.
- **864 additional stacked-synergy pairs**.
- Total retained final datasets: **94,680 matched pairs**, representing189,360
  on/off outcome observations. Identical primary controls are memoized; this
  is an observation count, not a claim of189,360 independent engine executions.
  An earlier2,304-pair Stasis pilot is preserved but superseded and not added
  to these totals.
- The18 EX+3 pairs were independently replayed for provenance verification,
  not counted as new unique fixtures.

Seeds are always **1729,54321,104729**. Native endpoints are Machines35
(enemy120), Roses35 and Vaelor War10 (enemy140), plus Machines Calamity
EX+1/EX+2/EX+3 (enemy145/160/185). The extended pass additionally uses every
authored Calamity pattern at its real tier level. No synthetic enemy stat
increases or hidden level adjustments are used in these combat matrices.

All Element-Bearers are legal **Lv105/Evo6**, with no weapon-rank investment.
Entry Gauge, cooldowns, Recovery, enemy targeting, RNG, deaths and skill effects
come directly from the actual constructors and `actAndAdvanceTurn`.
No browser, storage, economy operation or account mutation is involved.

Each primary roster is the tested wearer first, then the first two distinct
members of Infernis/Tizu/Flora. This covers all16 Element-Bearers, but is not an
optimized squad for every wearer. Additional focused teams are
Thornia/Crinso/Disciple and Rosetta/Bliss/Aurora.

### Equipment isolation and legality

- **Isolated context:** no background gear or Masters; only the focal item
  differs. This means a bare squad, not a solo combatant.
- **Supported ordinary context:** the existing survey's Mixed+5 profile is
  retained on supports. The tested wearer retains up to seven non-focal pieces
  and gets the candidate in slot8; the matched control leaves that slot empty.
  If the candidate was already in the profile, it is removed before constructing
  both sides. This is a slot-addition comparison, not a claim of best-in-slot
  superiority over the item that would otherwise occupy that slot.
- **Supported Master context:** the same full Mixed+5 ordinary gear on both
  sides; only the named wearer's separate Master slot differs. Other squad
  members do not receive Masters in the primary matrix.
- **Account-wide upgrades are respected.** A focal+0 ordinary level also
  applies to any copies of that same name retained on support members, on both
  sides. Therefore different upgrade strata can have different control win
  rates; do not infer that upgrading an item is harmful from aggregate lifts.
- Eight ordinary slots, no duplicate names per wearer, at most four ordinary
  Omnics, actual elemental restrictions and named-Master restrictions are
  validated. Suggested thematic elements are not invented restrictions.
- Coverage metadata explicitly lists all889 eligible ID/wearer pairs and
  all1,319 ineligible pairs with their element/named-owner rejection reasons.
  Every ID has at least one eligible tested wearer.

### Pilot, bounds and outcome definitions

The native pilot uses `native-benchmark-pilot.ts`: deterministic character-specific
priorities, first living enemy, lowest-health eligible support target, and the
existing Rosetta contributor ordering. It is not a search optimizer. It can
miss deliberate debuff timing, targeted shielding, stored-action setup or a
better action order.

The primary bound is100 rounds/1,800 decisions. Bounds are checked between
engine decisions; an indivisible `actAndAdvanceTurn` can resolve intervening
Recovery phases past the boundary, as seen in some round102 timeout states.
**Wins, defeats and unresolved
timeouts are separate.** A surviving team at the horizon is never called a win.
Ordered actual damage/healing/shield events are measured by the existing
`battle-survey.ts` collector; no combat-message parsing selects actions.
Stasis traces additionally retain actor/action, HP and Shield values at each
decision and the runtime's actual protection/penalty clocks.

## Ranked measured findings

### Highest-severity burst: Razor/Glassroot/Wounds kills native EX+3 on round3

Exact fixture: `master-razor-1`, Razor/Infernis/Tizu, supported context, fixed
Master level0, Atmospheric EX+3, seed104729. The boss has**3,059,413HP**.
The Master contributes its approved+100% raw-base Health/+30% Gauge Gain,
plus its sourced Wounds-spend ally healing. No ordinary loadout differs.

|Razor entry stat|Without Master|With Master|
|---|---:|---:|
|Maximum Health|35,514.125|42,546.625|
|Skill Power, including existing Glassroot|14.650|17.275|
|Gauge Gain|1.105|1.405|

On the second Enemy Turn, four critical packets deal9,294HP each to Razor.
The control dies on the fourth; the Master version survives at5,370.625HP.
Its round3 Last Flare deals**824,146 primary damage**, followed by
**2,074,432 sourced native Revenge damage**. Earlier real damage accounts for
the rest of the boss's HP; final enemy HP is exactly0 and phase is `cleared`.

The replay traces `native-kits.ts`'s actual HP-loss Wounds accounting,
spending, one Skill-Power application, Last-Flare coefficient and Defense
mitigation. It does **not** show the Master directly generating millions of
damage, duplicate hit recording or a forged clear. This is a severe
**encounter-specific cross-system burst/survival breakpoint**, not demonstrated
catalog noncompliance. Only one of the tested first-Master EX+3 fixtures shows
this round3 result; do not promote it to a universal guaranteed strategy.

### Gauge support can unlock EX+3 without being a damage item

All primary EX+3 wins, including upgrade variants:

|Focal ID|Winning rows|Native EX+3 patterns|What the event replay establishes|
|---|---:|---|---|
|`twinpulse-bellows`|4|Heaven, Atmospheric|Infernis's actual authored Burn supplies2,148,826 damage in the selected14-round replay|
|`tectonic-atlas-bastion`|4|Atmospheric|Flora's taunt/Gauge changes sustain Infernis/Tizu; selected10-round win includes1,554,884 Burn|
|`atmospheric-griffin-turbine`|6|Heaven, Atmospheric|Ally Gauge enables Infernis damage/Burn; selected10-round replay includes1,526,628 Burn|
|`firstlight-cam`|2|Atmospheric|Support Defense/Gauge sustains the same native pressure; selected10-round replay includes1,554,884 Burn|
|`master-atmoso-3`|1|Atmospheric|Selected23-round win is mostly Atmoso's own native damage, including183,155 Cyclone damage|
|`master-razor-1`|1|Atmospheric|The round3 Revenge burst detailed above|

Heaven and Atmospheric split attacks into three and four impacts. Actual
incoming-hit Gauge, native defenses, higher Gauge support and large
Glassroot-enhanced support skills change which ally survives and whether
powerful skills are available. These traces establish **pattern-specific
synergies and large native-kit scaling**, not an equipment RNG/cost bypass.
The universal Rare Twinpulse is therefore worth reviewing even though it
does not advertise a direct damage bonus.

### 1. Glassroot Gimbal: large, explicitly uncapped Health conversion

The catalog grants+5% Skill Power per complete200 maximum Health, including
equipment; at+5 this is+7.5%. The runtime uses complete Health steps and no
equipment-wide cap. This is an authored design, not accidental recursive
stat feedback.

With Infernis/Tizu/Flora, Mixed+5 gear and each character's first Master held
constant, one+5 Glassroot on Infernis changes his initial Skill Power from
**1.925 to13.175**. Giving it to all three yields
**13.175/15.175/11.895**, versus **1.925/1.825/2.145** without the focal copies.
This is additive Power, not a claim that all final damage is multiplied by
the displayed ratio; ability coefficients and Defense still apply.

Across the12 native EX+2 patterns and three seeds:

|Glassroot copies|Control wins|Equipped wins|Equipped defeats|Equipped timeouts|
|---|---:|---:|---:|---:|
|1|2/36|22/36|14|0|
|3|2/36|22/36|13|1|

Both copy counts win36/36 EX+1 and0/36 EX+3. The common Health investment
also improves survival and feeds skill-created Shields/healing; this is a
high-priority **cross-stat scaling/design risk**, not evidence of an overflow
or infinite calculation.

### 2. Nightglass Archive: approved duplicate aura stacking

Thornia/Crinso/Disciple all legally equip this Chaotic Omnic. At+5 each living
wearer contributes+300% of each recipient's raw-base Direct Attack. Three
copies therefore contribute+900% in the additive raw-base pool, not three
independent multiplicative bonuses. Masters and the seven non-focal ordinary
slots remain identical in the matched controls.

Initial Direct Attack with three copies is approximately
**9,321.7/12,328.7/10,825.2**, versus **2,555.9/3,380.4/2,968.2** without them.
The final ratio is below tenfold because the control already has other
additive Attack investment.

|Tier|Control wins/36|One-copy wins/36|Three-copy wins/36|
|---|---:|---:|---:|
|EX+1|12|17|35|
|EX+2|0|4|14|
|EX+3|0|0|0|

**Classification:** high-impact approved squad synergy. Duplicate living-source
stacking is explicitly current behavior; the observed result is not evidence
of a duplicate-equip validation bypass.

### 3. Firstlight Cam: broad support value and pilot sensitivity

On Rosetta/Bliss/Aurora, with their first Masters held constant, one+5 copy
raises native EX+2 wins from**14/36 to33/36**. Three copies win**26/36**.
Both configurations retain36/36 EX+1 wins and0/36 EX+3 wins.

Additional Gauge changes subsequent legal action choices and enemy phases.
Consequently more copies or higher raw stats do not guarantee more wins under
a fixed greedy pilot. **Classification:** strong approved aura; this is also
direct evidence against interpreting a single win-rate row as universal ranking.

### 4. Stasis Reliquary: genuine repeatable survival loop, not permanent immunity

The exact catalog says: enemy Shield break prevents the breaking hit's
spillover and all further damage that Enemy Turn; the following Enemy Turn
takes25% more enemy attack damage and cannot activate protection. It becomes
available again after that penalty turn. Stasis has no upgraded percentage
benefit, so+0 and+5 are mechanically identical.

The eight-turn **synthetic packet probe** deliberately isolates that contract:
1,000,000HP, zero Defense, a fresh1-point native Shield each turn, and two
100-damage enemy packets per turn. It is not counted as a native encounter win.

|Turns|Protection|Damage taken per turn|Reason|
|---|---|---:|---|
|1,3,5,7|Active|0|Breaking spillover and next packet prevented|
|2,4,6,8|Unavailable|249|Two125-damage packets, minus1 Shield|

Base and maximum upgrade outputs are identical. Reapplication cannot reset
the penalty into immunity. This reproduces the actual Shield-consumption,
incoming-damage and persisted runtime-clock code, rather than an arithmetic
estimate.

The enhanced native matrix uses six wearers
(Tizu/Bruno/Thornia/Razor/Infernis/Flora), two gear contexts, two upgrade endpoints,
native and shield-first policies, all six endpoints and all three seeds.
Each is tested with eight matched companion-piece packages:

1. None.
2. Pale Bulwark Diadem.
3. Lifeline Flywheel.
4. Pale Bulwark Diadem + Lifeline Flywheel.
5. Granite Hourglass.
6. Granite Hourglass + Pale Bulwark Diadem.
7. Granite Hourglass + Verdict Caliper + Fieldbrace Coupler.
8. The preceding package + Immortal Vessel.

Granite converts prior enemy direct HP loss into next-turn Shields. Verdict
provides critical-action healing; Fieldbrace improves critical chance.
All packages fit within eight ordinary slots and preserve the same non-Stasis
pieces in their paired controls. The shield-first pilot prefers Tizu's
Last Flare/Skill2/Normal in that order; it does not inject Gauge or skip costs.

**Measured native results:**6,912 pairs; Stasis activates in740 and activates
at least twice in196. Equipped outcomes are**2,182 wins /4,567 defeats /
163 timeouts**; controls are**2,172 wins /4,582 defeats /158 timeouts**.
There are14 gained wins and4 lost wins, rather than ten uniformly improved
fixtures. Every gained/lost win and every repeated activation in this enhanced
matrix occurs in a package containing Granite.

Concrete reproducible loop:

- Tizu lead, isolated context, native Machines35, seed1729, Stasis+0,
  Granite/Verdict/Fieldbrace/Immortal, shield-first policy.
- Control is defeated on round4; with Stasis the fight reaches the100-round
  horizon, with **48 protection activations on rounds4,6,...,98**.
- Enemy still has **91.5649% HP**. This is a sustained defensive stall,
  emphatically **not a win**.
- The upgraded version likewise produces48 activations against Roses35
  and Vaelor War10, seed1729, with95.9887% enemy HP remaining.
- A different native example, Razor/Machines35 with that package, reaches
  **22 activations and a win**, where its matched control loses.
- The benefit is not confined to weak enemies: Thornia, supported context,
  Stasis+0 + Granite, native Machines EX+2, seed1729/native policy, wins
  on round5 where the matched no-Stasis control loses. Bruno+5 with
  Granite/Pale, EX+2 seed104729/native policy, wins on round14 versus defeat.

**Classification:** demonstrated recurring Shield/sustain synergy and
stall/encounter-trivialization risk at some native endpoints. Cooldown,
penalty and upgrade behavior match the approved effect. No adjacent-turn
protection bypass, permanent invulnerability or EX+3 clear was observed.
Finite simulations cannot prove an infinite loop;100-round results stay
timeouts and are not promoted to “infinite” claims.

### Additional sanity check: Health aura plus Glassroot

Three+5 Ouroboros Core wearers on the Chaotic team change native EX+1 results
from12/36 to35/36, but still win0/36 EX+2 and EX+3. The supported profile
already contains Glassroot, so increased squad Health also increases Power.
This is another concrete authored cross-stat synergy, not solely an HP effect.

## Coverage and primary-matrix results

The machine-checked summary verifies138 unique IDs,889 eligible ID/wearer pairs,
all legal endpoints, all36 Calamity encounters, and every expected
category/ID/wearer/level/context/encounter/seed key. Missing, duplicate, unexpected
or incomplete fixture sets fail summarization.

Primary totals: equipped **34,530 wins /52,170 defeats /204 timeouts**;
controls **33,373 wins /53,313 defeats /218 timeouts**. There are1,258 gained
wins and101 lost wins. Complete-file validation found no missing, duplicate
or unexpected matrix keys.

Largest supported wearer-matrix lifts are shown with their actual denominator:

|Candidate|Level|Pairs|Control wins|Equipped wins|Net lift|
|---|---:|---:|---:|---:|---:|
|Immortal Vessel|0|288|123|173|+17.36pp|
|Rosetta Master1|Fixed|18|12|14|+11.11pp|
|Nightglass Archive|5|72|50|57|+9.72pp|
|Griffin Turbine|5|54|37|42|+9.26pp|
|Twinpulse Bellows|5|288|204|227|+7.99pp|
|Kirin Cradle|5|54|38|42|+7.41pp|
|Firstlight Cam|5|54|38|42|+7.41pp|
|Immortal Vessel|5|288|194|212|+6.25pp|
|Glassroot Gimbal|5|288|196|212|+5.56pp|

Rosetta's two extra wins are a small-denominator signal, not a more severe
result than the traced native EX+3 burst. Immortal's different base/max control
rates reflect the account-wide-level rule described above. No nerf ranking
should be inferred by comparing these heterogeneous percentages.

Per-ID results below pool different eligibility counts and
contexts; they are coverage evidence, **not a rarity-normalized power ranking**.

Columns: matched pairs; equipped/control wins; equipped/control timeouts.
Remaining outcomes are defeats. Every ordinary row includes both+0/+5; every
Master row is fixed-level. All per-character ineligible reasons remain in the
JSONL header and summary metadata rather than being hidden as skipped tests.

|Stable ID|Pairs|Wins on/off|Timeouts on/off|
|---|---:|---:|---:|
|`vigil-core`|1368|533/504|1/2|
|`siegebound-drive`|1368|513/504|2/2|
|`bastion-lock`|1368|530/530|2/2|
|`parallax-relay`|1368|515/504|2/2|
|`fracture-reservoir`|1368|504/504|2/2|
|`prism-splinter-socket`|1368|502/504|2/2|
|`precision-escapement`|1368|504/504|2/2|
|`fieldbrace-coupler`|1368|518/504|2/2|
|`reserve-torque-crank`|1368|507/504|2/2|
|`crosspin-governor`|1368|506/504|2/2|
|`duplex-heart`|1368|504/504|2/2|
|`spearwheel-engine`|1368|505/504|2/2|
|`falcon-sight`|1368|527/504|2/2|
|`aegis-capacitor`|1368|524/504|2/2|
|`springwell-pump`|1368|504/504|2/2|
|`worldbreaker-drive`|1368|525/498|2/2|
|`immortal-vessel`|1368|462/360|4/7|
|`citadel-spine`|1368|524/497|1/1|
|`astral-prism`|1368|533/504|2/2|
|`judgment-lens`|1368|507/504|2/2|
|`twinpulse-bellows`|1368|555/504|1/2|
|`glassroot-gimbal`|1368|509/451|2/4|
|`lifeline-flywheel`|1368|510/504|2/2|
|`sentinel-aperture`|1368|506/504|2/2|
|`wardglass-transformer`|1368|506/504|2/2|
|`hammerbalance-link`|1368|521/499|2/2|
|`breach-pendulum`|1368|506/504|2/2|
|`coilfeed-ratchet`|1368|504/504|2/2|
|`opal-indexer`|1368|508/504|2/2|
|`resonance-crucible`|1368|517/504|2/2|
|`siege-cantilever`|1368|505/504|2/2|
|`nullsong-transmission`|1368|518/504|2/2|
|`horizon-heartcase`|1368|530/528|2/2|
|`stasis-reliquary`|1368|504/504|2/2|
|`granite-hourglass`|1368|516/504|2/2|
|`pale-bulwark-diadem`|1368|504/504|2/2|
|`starvein-conductor`|1368|518/478|2/2|
|`meridian-inverter`|1368|504/504|2/2|
|`execution-orrery`|1368|504/504|2/2|
|`verdict-caliper`|1368|506/504|2/2|
|`infernic-phoenix-reactor`|288|148/122|0/2|
|`aquatic-leviathan-pump`|360|154/154|1/0|
|`tectonic-atlas-bastion`|432|200/194|0/0|
|`efflorescent-worldtree-heart`|432|208/194|0/0|
|`voltaic-thunderbird-coil`|432|180/178|4/4|
|`atmospheric-griffin-turbine`|432|212/178|0/4|
|`luminous-seraph-mirror`|432|176/168|0/0|
|`ominous-eclipse-mantle`|504|206/204|6/6|
|`tranquilitic-kirin-cradle`|432|197/168|0/0|
|`chaotic-ouroboros-core`|504|220/204|4/6|
|`infernic-cinder-testament`|288|122/122|2/2|
|`aquatic-undertide-chronometer`|360|156/154|2/0|
|`tectonic-faultkeeper-loom`|432|194/194|0/0|
|`efflorescent-verdant-covenant`|432|197/194|0/0|
|`voltaic-stormstep-dynamo`|432|179/178|4/4|
|`atmospheric-skythread-rudder`|432|182/178|4/4|
|`luminous-dawn-witness-array`|432|190/168|0/0|
|`ominous-nightglass-archive`|504|229/204|4/6|
|`tranquilitic-stillhour-carillon`|432|178/168|0/0|
|`chaotic-paradox-spindle`|504|204/204|6/6|
|`tempered-strike-link`|288|134/122|2/2|
|`mending-valve`|432|194/194|0/0|
|`ward-stitch-spool`|360|156/154|0/0|
|`cinder-metering-nozzle`|288|136/122|2/2|
|`pulse-trigger-pawl`|432|186/178|4/4|
|`firstlight-cam`|432|210/168|0/0|
|`secondbeat-rack`|504|214/204|4/6|
|`flare-focusing-iris`|288|136/122|2/2|
|`clearwater-manifold`|360|154/154|0/0|
|`aegis-return-spring`|432|170/168|0/0|
|`emberlife-kiln`|288|141/122|2/2|
|`tension-governor`|504|220/204|4/6|
|`covercharge-drum`|432|194/194|0/0|
|`sootwake-crucible`|288|125/122|2/2|
|`tidebound-reflector`|360|156/154|0/0|
|`pressurecrest-governor`|432|179/178|4/4|
|`rootbound-triage-vault`|432|198/194|0/0|
|`solace-anchor`|432|172/168|0/0|
|`ruinselect-prism`|504|204/204|6/6|
|`infernic-pyre-census`|288|133/122|2/2|
|`oceanic-shared-tide-pump`|360|169/154|2/0|
|`atmospheric-storm-clock`|432|179/178|4/4|
|`botanic-graft-covenant`|432|203/194|0/0|
|`tranquilitic-accord-bastion`|432|208/168|0/0|
|`chaotic-fault-verdict`|504|208/204|6/6|
|`calamitic-world-eater-orrery`|1368|511/504|2/2|
|`calamitic-causality-funeral-engine`|1368|516/504|2/2|
|`calamitic-horizon-cleaving-godpress`|1368|525/504|2/2|
|`calamitic-throne-borrowed-tomorrows`|1368|511/504|2/2|
|`calamitic-cathedral-final-equation`|1368|531/504|4/2|
|`master-ember-1`|144|72/67|1/1|
|`master-ember-2`|144|69/67|1/1|
|`master-ember-3`|144|70/67|1/1|
|`master-tide-1`|144|67/67|0/0|
|`master-tide-2`|144|71/67|0/0|
|`master-tide-3`|144|72/67|0/0|
|`master-sprout-1`|144|71/71|0/0|
|`master-sprout-2`|144|71/71|0/0|
|`master-sprout-3`|144|70/71|2/0|
|`master-atmoso-1`|144|73/65|2/2|
|`master-atmoso-2`|144|68/65|2/2|
|`master-atmoso-3`|144|66/65|1/2|
|`master-aurora-1`|144|76/75|1/1|
|`master-aurora-2`|144|75/75|1/1|
|`master-aurora-3`|144|75/75|1/1|
|`master-bliss-1`|144|75/74|0/0|
|`master-bliss-2`|144|76/74|0/0|
|`master-bliss-3`|144|67/74|0/0|
|`master-bruno-1`|144|69/69|0/0|
|`master-bruno-2`|144|73/69|1/0|
|`master-bruno-3`|144|69/69|0/0|
|`master-disciple-1`|144|65/63|2/2|
|`master-disciple-2`|144|63/63|2/2|
|`master-disciple-3`|144|66/63|2/2|
|`master-elise-1`|144|58/59|0/0|
|`master-elise-2`|144|63/59|0/0|
|`master-elise-3`|144|64/59|0/0|
|`master-razor-1`|144|86/85|0/0|
|`master-razor-2`|144|85/85|0/0|
|`master-razor-3`|144|85/85|0/0|
|`master-rosetta-1`|144|76/58|0/0|
|`master-rosetta-2`|144|64/58|0/0|
|`master-rosetta-3`|144|58/58|0/0|
|`master-thornia-1`|144|66/66|2/2|
|`master-thornia-2`|144|67/66|2/2|
|`master-thornia-3`|144|70/66|2/2|
|`master-crinso-1`|144|75/66|0/0|
|`master-crinso-2`|144|66/66|0/0|
|`master-crinso-3`|144|73/66|0/0|
|`master-nerithe-1`|144|48/48|0/0|
|`master-nerithe-2`|144|48/48|0/0|
|`master-nerithe-3`|144|48/48|0/0|
|`master-orvella-1`|144|72/71|1/2|
|`master-orvella-2`|144|77/71|1/2|
|`master-orvella-3`|144|71/71|2/2|
|`master-vaelor-1`|144|69/66|0/0|
|`master-vaelor-2`|144|75/66|0/0|
|`master-vaelor-3`|144|74/66|0/0|

## Functionality versus power

The focused numerical suites were executed against the actual current source:
static bonuses, ordinary ability replacements, all48 Master behavior cases,
upgrade description/policy, refreshed Omnics/Masters and routed/persisted Stasis
protection. **1,722 tests in9 files passed** with zero failed/pending files.
The audit's own tests validate all catalog IDs, every eligible loadout,
one-focal-slot controls, native levels, determinism, timeout separation,
fixed Stasis cooldown damage, multi-piece synergy control equality and the
exact native round3 EX+3 replay.

Those tests and these battle outcomes establish the reported scenarios; they
do not prove every possible generated/native interaction. This audit found
**no newly demonstrated catalog/runtime correctness defect requiring a
gameplay change**. In particular, large Glassroot conversion, duplicate
living-source auras and Stasis's alternating recurrence are current approved
effects. Calling them implementation bugs would conflate design with behavior.

## Limitations and unimplemented work

- No Conduit balance changes, proposed numeric nerfs, flag changes, migrations,
  commits, deployment or account writes are part of this audit.
- Three seeds are deterministic coverage, not a confidence interval or exact
  probability estimate. Equal initial seeds do not imply identical subsequent
  RNG consumption when gear changes actions or trigger rolls.
- The primary matrix tests all eligible Element-Bearers, not all captured
  Elemental-Devourer forms, all progression levels or every eight-slot
  permutation. Named Masters cannot equip to captured units.
- Base and maximum upgrades are simulated, not every intermediate upgrade in
  full battles. The numerical contract suites additionally cover absent and
  +0..+5 ordinary effects.
- All36 Calamity patterns are covered per ID, but only the first eligible
  wearer is used in that extended pass. The all-wearer pass uses Machines'
  three native tiers. Do not claim every wearer/pattern cross product.
- No altered enemy stats, optimistic full entry Gauge or hand-injected battle
  buffs are used to manufacture native wins.
- There is no exhaustive best-play search, adversarial PvP test, hosted
  client/authority replay, long Training-chain test or browser performance
  measurement. Runtime/presentation changes outside this task are not audited.
- Stronger sustained-defense outcomes can depend on survivor selection and
  shields that never break. Lack of a Stasis activation in one fixture is not
  evidence that its effect is absent.
- Owner judgment remains needed on whether the measured uncapped conversion,
  duplicate auras or100-round defensive stalls are desirable. This report
  does not silently interpret that judgment as approval to change them.

## Reproduction and evidence

Run from the repository root. `$evidence` below denotes the existing session
files directory, not a browser save or game data directory:

```powershell
$evidence = 'C:\Users\creat\.copilot\session-state\9dbe0ba4-9905-4756-a23a-0899afe57f0a\files'
node tools\run_conduit_balance_audit.mjs "$evidence\conduit-balance-audit-matrix-2026-10-23.jsonl" matrix
node tools\run_conduit_balance_audit.mjs "$evidence\conduit-balance-audit-stasis-enhanced-2026-10-23.jsonl" stasis
node tools\run_conduit_balance_audit.mjs "$evidence\conduit-balance-audit-synergy-2026-10-23.jsonl" synergy
node tools\summarize_conduit_balance_audit.mjs "$evidence\conduit-balance-audit-matrix-2026-10-23.jsonl" "$evidence\conduit-balance-audit-summary-2026-10-23.json" "$evidence\conduit-balance-audit-stasis-enhanced-2026-10-23.jsonl" "$evidence\conduit-balance-audit-synergy-2026-10-23.jsonl"
node tools\run_conduit_balance_audit.mjs "$evidence\conduit-balance-audit-ex3-replays-2026-10-23.jsonl" outliers "$evidence\conduit-balance-audit-summary-2026-10-23.json"
```

The runners use exclusive output creation: choose new filenames for a rerun;
they will not overwrite existing evidence. Generated bundle directories are
workspace-local and removed in `finally`; raw JSONL remains in session files.
No OS temporary directory is used by the added tools.

Exact focused validation:

```powershell
npx vitest run src\content\phase-zero-conduit-stats.test.ts src\content\phase-zero-conduit-upgrades.test.ts src\game\phase-zero-remaining-effects.test.ts src\game\phase-zero-replacement-effects.test.ts src\game\phase-zero-master-matrix.test.ts src\game\omnic-refresh.test.ts src\game\conduit-rework.test.ts tools\conduit-balance-audit.test.ts tools\battle-survey.test.ts
```

Result: **9 files /1,722 tests passed**.

```powershell
npx tsc --noEmit --target ES2022 --lib ES2022,DOM --module ESNext --moduleResolution Bundler --strict --skipLibCheck --types vite/client,node tools\conduit-balance-audit.ts tools\conduit-balance-audit.test.ts
node --check tools\run_conduit_balance_audit.mjs
node --check tools\summarize_conduit_balance_audit.mjs
```

Result: **all passed, exit0**. The explicit tool typecheck is necessary because
the ordinary application TypeScript configuration includes `src`, not `tools`.
No full application build is claimed as audit validation.

Each JSONL header records seeds, limits, catalog eligibility/rejections, starting
commit and SHA256 hashes of the live combat/content sources. The primary run
started before the independent UI publication; its archived as-executed ESM
bundle preserves the exact engine and initial primary-matrix tooling.
Focused Stasis/synergy scopes were expanded afterward without changing the
primary simulation algorithm or any runtime source.

Completed runner results:

|Scope|Completed records|Elapsed seconds|Outcome|
|---|---:|---:|---|
|Primary matrix|86,904 pairs|679.198|Exit0; every expected key verified|
|Enhanced Stasis|6,912 pairs +2 packet probes|73.757|Exit0|
|Stacked synergy|864 pairs|13.412|Exit0|
|EX+3 exact replay|18 previously counted pairs|1.185|Exit0; all on/off outcomes match|
|Summary/coverage verification|138 IDs /86,904 primary pairs|Bounded stream pass|Exit0|

All source files under `src` recorded in the three main run headers have
identical hashes across those runs. This includes the true production gate
file, whose SHA256 is
`85540bdf9a236b2e9a6ff10627576f85432cc3f707a5c360e194de64402b24a4`.
The durable138-row appendix was separately compared against the verified
summary: every ID, pair count, win count and timeout count matches exactly.
No generated `.conduit-audit-work*` directories remain.

SHA256 evidence, all under the session files directory shown above:

|File|SHA256|
|---|---|
|`conduit-balance-audit-matrix-2026-10-23.jsonl`|`ecb0b317f563a97ab7fe2c046bf9d43de5194ec4b5a6d128f591a3d54ba0e925`|
|`conduit-balance-audit-stasis-enhanced-2026-10-23.jsonl`|`1ed90ae96fb549338c44eb923ccf4c6020b292b123dc181f42f82b2ec73d5b25`|
|`conduit-balance-audit-synergy-2026-10-23.jsonl`|`70b24faa40df501e2af4ed8a247758e665e617be266ea1ec8e569a78566647df`|
|`conduit-balance-audit-ex3-replays-2026-10-23.jsonl`|`5271aafda5ecf50f638ee5591c6a3ab9a2ddc16b95d385f048a90e921d377351`|
|`conduit-balance-audit-summary-2026-10-23.json`|`253adcd0798a48c6f53d9713ad556006f48dee8d76e21fe218f7ebab2b897999`|
|`conduit-balance-audit-matrix-as-executed.mjs`|`cd889b7b3e521e1953bab65b3d1265ebaacb2af35fa0063c0a5abe2dda3fd7bf`|
