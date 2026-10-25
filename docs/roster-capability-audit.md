# Roster capability audit: levels 0-105

> **D-415 measurement boundary:** the numerical report below predates critical
> eligibility for native Burn and triggered kit damage, plus the corrected
> Cinder Testament/Rosegarden effects. Its methods, non-Calamitic equipment
> constraints and acquisition declarations remain useful; its numerical
> rankings/output are historical, not a newly verified current ceiling or
> clear recommendation. The complete roster report has not been remeasured
> under rules13. Current bounded seeded Calamity results are recorded in
> [enemy benchmark calibration](enemy-benchmark-calibration.md#rules13-critical-damage-remeasurement-d-415).

Canonical non-Calamitic character capability reference (D-404). Personal Omnic Masters are included. Laboratory capabilities inform enemy calibration, but are not themselves clear rates or observed player averages.

Use with the [global benchmark declaration and enemy calibration](enemy-benchmark-calibration.md), which supplies modeled P10/median/P90 progression bands, actual pressured encounters, access limitations and current hostile stat tables. Historical Calamitic-inclusive ceilings are not the tuning target.

## At a glance

The table contrasts learnable Common +0 play with developed-account equipment ceilings. The teams are conditional on ownership, not a claim that every account can field them at that level. DPR means damage per complete round against zero Defense, including delayed damage; it is not real-time DPS.

| Level | Planned best solo DPR | Planned best duo DPR | Planned best trio DPR | Ceiling best trio DPR |
|---:|---|---|---|---|
| 0 | Infernis: 311.8 | Infernis / Bliss: 556.7 | Infernis / Bliss / Vaelor: 829.1 | Rosetta / Disciple / Vaelor: 67,176.7 |
| 20 | Infernis: 1,548.6 | Infernis / Vaelor: 2,604.1 | Infernis / Bliss / Vaelor: 3,726.4 | Rosetta / Thornia / Disciple: 339,893.7 |
| 40 | Infernis: 3,969.6 | Infernis / Vaelor: 6,389 | Infernis / Nerithe / Vaelor: 9,191 | Rosetta / Crinso / Disciple: 1,866,626.4 |
| 60 | Infernis: 7,110.7 | Infernis / Vaelor: 11,113.7 | Infernis / Nerithe / Vaelor: 15,865.1 | Rosetta / Crinso / Disciple: 5,265,402 |
| 80 | Infernis: 12,002 | Infernis / Vaelor: 18,964.9 | Infernis / Crinso / Vaelor: 27,036.8 | Rosetta / Crinso / Disciple: 15,422,888.6 |
| 100 | Infernis: 16,722.8 | Infernis / Vaelor: 26,000.8 | Infernis / Bliss / Vaelor: 36,936.6 | Rosetta / Bliss / Disciple: 15,309,608.9 |
| 105 | Infernis: 17,711.2 | Infernis / Vaelor: 27,368.9 | Infernis / Rosetta / Vaelor: 38,981.1 | Rosetta / Bliss / Disciple: 16,754,038.8 |

### Starting with an ordinary roster

Only ONE starter is guaranteed. The table below restricts candidates to the six Standard five-stars and therefore excludes rare six-star and War dependencies, but the additional bearers still require pulls. It is a roster-restricted output sample, not a guaranteed free team or an enemy-safe team. A useful healer/protector can be preferable to the top damage-only combination.

| Level | Best five-star-only Common solo / duo / trio | Free-starter options: Infernis / Tizu / Flora DPR |
|---:|---|---|
| 0 | Infernis: 311.8<br>Infernis / Atmoso: 513.4<br>Infernis / Atmoso / Bruno: 696.7 | 311.8 / 126.6 / 127.7 |
| 20 | Infernis: 1,548.6<br>Infernis / Atmoso: 2,463<br>Infernis / Atmoso / Bruno: 3,154.4 | 1,548.6 / 520 / 524.2 |
| 40 | Infernis: 3,969.6<br>Infernis / Atmoso: 6,055.5<br>Infernis / Atmoso / Bruno: 7,915.9 | 3,969.6 / 1,158.4 / 1,168.4 |
| 60 | Infernis: 7,110.7<br>Infernis / Atmoso: 10,518.8<br>Infernis / Atmoso / Bruno: 13,800.3 | 7,110.7 / 1,855.3 / 1,890.4 |
| 80 | Infernis: 12,002<br>Infernis / Atmoso: 17,494.9<br>Infernis / Atmoso / Bruno: 22,865.2 | 12,002 / 2,887.9 / 2,948.9 |
| 100 | Infernis: 16,722.8<br>Infernis / Atmoso: 23,918.9<br>Infernis / Flora / Atmoso: 31,257.7 | 16,722.8 / 3,722 / 3,989.1 |
| 105 | Infernis: 17,711.2<br>Infernis / Atmoso: 25,531.7<br>Infernis / Flora / Atmoso: 33,188.6 | 17,711.2 / 3,861.8 / 4,142 |

## Reproduction and scope

- Source base commit: `bc4ba6deffc1a60e5fd70102e2f158c9c7db1e12`; bundled simulation SHA-256: `be720d2b8755fcd887cb61ff2d1aec2bc60dc990afdf2c26b6daddd7f10b0bf1`.
- Levels: 0, 20, 40, 60, 80, 100, 105. All16 Element-Bearers; all16 solos,120 duos and560 trios at every checkpoint/profile.
- 175,392 main seeded measurements; 58,464 aggregates; 1344 gear/Master candidates screened.
- 18 complete player/phase cycles; discard first9 and average last9 for the main sustained-output window. This is not a guarantee every loop has reached steady state; see the90-cycle checks. Seeds: 1, 1729, 104729.
- 180 additional seeded90-cycle output measurements validate selected Lv.105 leaders and controlled item removal; ten seeds, final45 cycles measured.
- Fresh runs start at zero Gauge. Precharged burst and defensive capacity are separate explicitly funded probes.
- Real `act` resolves costs, cooldowns, recovery, crits, native and Conduit effects. The tool-only boundary calls production Burn/phase/turn/shield hooks without hostile actions.
- One effectively inexhaustible zero-Defense, unshielded neutral measuring target. No elemental matchup multiplier, foe levels, boss kit, loot, incoming Gauge or damage-fed resources.
- This measures damage per action/round, NOT seconds-based DPS. Speed settings are presentation only.
- All targets remain alive; execute/on-defeat benefits are absent. AoE is measured per one target; three-target results are NOT safely obtained by multiplying every effect by three.
- Output mode starts healthy, with no artificial damage. Support mode resets living HP to10% before actions and phase healing to expose actual effective-heal throughput; these deficits are NOT damage suffered, and do not feed damage-taken resources.
- Healing is actual restored HP, not offered healing or overheal. Shields count newly granted layers/refresh increments, NOT absorbed damage or stackable permanent EHP. No fabricated shield consumption.
- Recovery/extra actions and delayed damage continue through full cycles. Incoming-trigger tanks/counters are deliberately underrepresented. Do not call a tank weak from this damage leaderboard.
- Three crit seeds are a spread, not an exact expectation or95% confidence interval. Rankings are best MEASURED within this bounded candidate/pilot search, not a proof of global optimal play.
- Distinct team sets are exhaustive; actor-order permutations, all90-Conduit combinations, all mixed per-character level distributions and every rotation are not. Masters are screened solo; a team-specific Master can beat the selected one.
- This measurement tool does not change accounts or gameplay. Enemy calibration is documented separately; no laboratory damage number is used as a substitute for real pressured battle validation.

## Progression and luck assumptions

| Profile | Equipment and play | Interpretation |
|---|---|---|
| floor | Empty slots; Normal only | Deliberately bottom-of-barrel control; not a recommendation. |
| unlucky | Eight Store Commons +0; Normal only | Farmable gear without rare drops; separates poor play from empty slots. |
| planned | Same Commons +0; native-aware skills | Learnable no-rare-luck baseline; Store resources still have to be earned. |
| farmed | Fixed eight-piece Rare/Legendary package +0 | Long-farm target, not an average inventory guaranteed by level. Focus reduces name lottery. |
| lucky | Four matching Omnics, four ordinary stat pieces +0 and screened personal Master | Conditional high-roll/late-account package, NOT a realistic fresh Lv.0/20 expectation. |
| ceiling | Best sampled non-Calamitic stat, HP/Glassroot/Stasis or hybrid package +5; four matching Omnics; screened Master | Developed-account ceiling, not the average-player target. No Calamitic equipment, legacy weapon ranks or early-account access claims. |

Main progression uses the least evolved form that admits the checkpoint: Evo1/1/2/3/5/6/6. Ceiling can evolve immediately at the current cap: Evo1/1/2/4/5/6/6. An early alternate bearer can use account-wide gear only if a stronger account already earned it.

| Same-account highest level | Actual access facts, not assumed clears |
|---|---|
| 0 | One chosen Infernis/Tizu/Flora is free. The other two are NOT free teammates. Lucky banner pulls may recruit other bearers, but gear remains acquisition-limited. |
| 20 | Machines gate is highest Lv.10 AND Story region1 clear. Gate access does not prove final-boss or stage26 farming. Dungeons are still locked below30. |
| 40 | Material dungeons open30; Heaven/Abyss remain locked until50. No assumed Master/Omnic pipeline merely from being40. |
| 60 | Heaven/Abyss50, Treasury/Sanctuary60. Evo3->4 needs explicit form3+ fodder. Build/mat farming now matters; level alone grants nothing. |
| 80 | Rose event opens75; War still locked until85. Evo4->5 also consumes two form4+ fodder copies; gear/roster can dominate20 extra levels. |
| 100 / 105 | All level gates met, not all clears. Evo5->6 consumes three form5+ copies. Masters can be chosen from the Normal final Machines boss; no Calamity reward is needed for these builds. |

All roster combinations below are conditional on ownership. For a fresh account whose highest bearer is below85, War bearers are unavailable; low-level War rows are developed-account alternate-character ceilings, not early progression suggestions. Captured Elemental-Devourers cap60 and are outside this16-bearer audit.

## Acquisition/work, using current live rates

- D-402 focused unowned Rare/Legendary/Omnic name at final stage35:2.86 /5 /6.67 kills on average (35% /20% /15%). Each rarity starts at5% on its first eligible stage:1 /1 /26; rates interpolate linearly. Earlier-stage farming is slower. These are geometric means, not guarantees or proof of clearability.
- Master Chest:50% at final stage35 only; mean2 final clears, median1,90th percentile4 for one chest. Choose an unowned Master; alternatives require additional chests. No random Master-name lottery or required Calamity clear.
- Rare15 / Legendary15 / Omnic45 full pools. Independent tiers can succeed together. Name unlocks and upgrades are account-wide: one copy can serve several bearers; four-Omnic cap and element matching still apply per member.
- A named5-star Standard bearer has1% divided across six names:0.1667% natural rate (mean600 pulls without pity). A named6-star Standard bearer has0.1% divided across four:0.025% natural (mean4000 without pity). Highest-tier pity changes those means drastically; the no-pity numbers must NOT be used as real six-star expected cost.
- Current pity is80 highest-star /150 unowned-highest-star. From a fresh roster, at most600 Standard pulls guarantee all four highest6-stars, at most450 Rose pulls all three highest Roses (ignoring other income/availability). No target5-star guarantee: unlucky tails remain. Costs are10 Null-Prismatica per pull.
- Do not equate lower stars with easier targeted acquisition: a specific five-star lacks the highest-tier ownership guarantee. A five-star-only lineup can still be harder to finish than a lucky/pity-built six-star lineup. The free chosen starter is the only guaranteed no-pull bearer.
- Rose natural character tier1.1% split three:0.3667% per name. D-414 makes War recruitment guaranteed on the first eligible final clear per name; repeat clears grant100 Null-Prismatica. These are acquisition rules only, not simulated battle wins.
- No paid spending, session length, income-per-hour, capture fodder grind or activity clear feasibility is invented here.

### Gear acquisition bills for leading Lv.105 configurations

Counts deduplicate account-wide ordinary names. Per-tier means are focused eligible kills for those names; independent rarity rolls can overlap, so do NOT add the three columns as a total kill requirement. Master means count final-boss clears for the required chosen chests. Store prices, upgrades and Calamitic tokens are separate bills; neither entry access nor these averages establishes clearability.

| Profile / slots | Team | Store Prismatica | Components | Calamitic tokens | Rare / Legendary / Omnic eligible-kill means | Masters / mean final clears |
|---|---|---:|---:|---:|---|---|
| floor /1 | Vaelor | 0 | 0 | 0 | 0 /0 /0 | 0 /0 |
| floor /2 | Bliss / Vaelor | 0 | 0 | 0 | 0 /0 /0 | 0 /0 |
| floor /3 | Crinso / Bliss / Vaelor | 0 | 0 | 0 | 0 /0 /0 | 0 /0 |
| unlucky /1 | Bliss | 10,700 | 0 | 0 | 0 /0 /0 | 0 /0 |
| unlucky /2 | Bliss / Vaelor | 10,700 | 0 | 0 | 0 /0 /0 | 0 /0 |
| unlucky /3 | Crinso / Bliss / Vaelor | 10,700 | 0 | 0 | 0 /0 /0 | 0 /0 |
| planned /1 | Infernis | 10,700 | 0 | 0 | 0 /0 /0 | 0 /0 |
| planned /2 | Infernis / Vaelor | 10,700 | 0 | 0 | 0 /0 /0 | 0 /0 |
| planned /3 | Infernis / Rosetta / Vaelor | 10,700 | 0 | 0 | 0 /0 /0 | 0 /0 |
| farmed /1 | Infernis | 1,000 | 0 | 0 | 5.7 /25 /0 | 0 /0 |
| farmed /2 | Infernis / Bliss | 1,000 | 0 | 0 | 5.7 /25 /0 | 0 /0 |
| farmed /3 | Infernis / Bliss / Nerithe | 1,000 | 0 | 0 | 5.7 /25 /0 | 0 /0 |
| lucky /1 | Infernis | 1,000 | 0 | 0 | 0 /15 /26.7 | 1 /2 |
| lucky /2 | Infernis / Rosetta | 1,000 | 0 | 0 | 0 /15 /53.3 | 2 /4 |
| lucky /3 | Rosetta / Disciple / Vaelor | 1,000 | 0 | 0 | 0 /15 /80 | 3 /6 |
| ceiling /1 | Rosetta | 0 | 488,400 | 0 | 2.9 /15 /26.7 | 1 /2 |
| ceiling /2 | Rosetta / Disciple | 0 | 970,800 | 0 | 2.9 /20 /53.3 | 2 /4 |
| ceiling /3 | Rosetta / Bliss / Disciple | 0 | 970,800 | 0 | 2.9 /20 /53.3 | 3 /6 |

| Bearer | Role | Source / natural chance per attempt |
|---|---|---|
| Infernis | Persistent fire specialist | One may be your free starter; otherwise Standard 16.7/10,000 pulls |
| Tizu | Precise barrier protector | One may be your free starter; otherwise Standard 16.7/10,000 pulls |
| Flora | Delayed recovery gardener | One may be your free starter; otherwise Standard 16.7/10,000 pulls |
| Rosetta | Coordinated quarry hunter | Rose 36.7/10,000 pulls |
| Thornia | Enemy-action thorn trapper | Rose 36.7/10,000 pulls |
| Crinso | Alternating-edge combo duelist | Rose 36.7/10,000 pulls |
| Atmoso | Delayed wind-field attacker | Standard 16.7/10,000 pulls |
| Aurora | Hostile skill forecaster | Standard 2.5/10,000 pulls |
| Bliss | Action-order dancer | Standard 2.5/10,000 pulls |
| Bruno | Deliberate damage interceptor | Standard 16.7/10,000 pulls |
| Disciple | Conditional ally instructor | Standard 2.5/10,000 pulls |
| Elise | Two-shuriken placement duelist | Standard 16.7/10,000 pulls |
| Razor | Wounds-powered revenge duelist | Standard 2.5/10,000 pulls |
| Nerithe | Survey and precision-pierce attacker | War final recruitment: guaranteed per eligible clear; highest account Lv.85 gate |
| Orvella | Finite-durability team architect | War final recruitment: guaranteed per eligible clear; highest account Lv.85 gate |
| Vaelor | Deterministic three-beat burst attacker | War final recruitment: guaranteed per eligible clear; highest account Lv.85 gate |

## Exact cumulative leveling/evolution spending

Costs below are per bearer from Lv.0/Evo1, minimum evolution. They exclude separately consumed evolution fodder, ownership recruitment and gear. The ordinary and Rose paths use their actual cost APIs; material IDs/quantities are preserved in the result data.

| Level | Evo | Prismatica per bearer | Ordinary materials (Infernis example) | Rose materials |
|---:|---:|---:|---|---|
| 0 | 1 | 0 | None | None |
| 20 | 1 | 620 | infernic-common:20 | rosethorn-common:20 |
| 40 | 2 | 2,340 | infernic-common:65; infernic-uncommon:10 | rosethorn-common:65; rosethorn-uncommon:10 |
| 60 | 3 | 5,160 | infernic-common:130; infernic-uncommon:40; infernic-rare:15 | rosethorn-common:130; rosethorn-uncommon:40; rosethorn-rare:15 |
| 80 | 5 | 11,780 | infernic-common:190; infernic-uncommon:85; infernic-rare:70; infernic-epic:30; heavens-evolution:5; infernic-legendary:5; heavens-level:5 | rosethorn-common:190; rosethorn-uncommon:85; rosethorn-rare:70; rosethorn-epic:30; rosethorn-legendary:5 |
| 100 | 6 | 20,400 | infernic-common:260; infernic-uncommon:105; infernic-rare:90; infernic-epic:75; heavens-evolution:15; infernic-legendary:35; heavens-level:25; infernic-omnic:10 | rosethorn-common:260; rosethorn-uncommon:105; rosethorn-rare:90; rosethorn-epic:75; rosethorn-legendary:35; rosethorn-omnic:10 |
| 105 | 6 | 21,480 | infernic-common:280; infernic-uncommon:110; infernic-rare:95; infernic-epic:80; heavens-evolution:15; infernic-legendary:40; heavens-level:30; infernic-omnic:15 | rosethorn-common:280; rosethorn-uncommon:110; rosethorn-rare:95; rosethorn-epic:80; rosethorn-legendary:40; rosethorn-omnic:15 |

## All-character numerical checkpoints

Naked core stats; minimum evolution; no legacy weapon ranks. Crit is percentage points, crit multiplier is a multiplier. Planned/lucky/ceiling columns are damage per sustained round from fresh zero-Gauge starts after ramp-up.

### Level 0

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 220 | 38 | 10 | 15% /1.5x | 100 | 311.8 | 1,127 | 1,387.3 | ultimate: 6,706.3 /8,255 |
| Tizu | 260 | 30 | 16 | 10% /1.5x | 100 | 126.6 | 318.4 | 492.8 | skill1: 856.7 /1,102 |
| Flora | 190 | 32 | 8 | 20% /1.5x | 100 | 127.7 | 286.7 | 401.2 | skill1: 603.3 /679 |
| Rosetta | 225 | 43 | 11 | 20% /1.6x | 100 | 221.3 | 776.8 | 1,425.9 | ultimate: 11,632 /11,632 |
| Thornia | 280 | 31 | 17 | 10% /1.5x | 100 | 93.2 | 292.7 | 506.5 | ultimate: 4,216.3 /5,190 |
| Crinso | 205 | 41 | 9 | 25% /1.7x | 100 | 199.3 | 746.5 | 1,043 | ultimate: 13,767 /13,767 |
| Atmoso | 205 | 39 | 9 | 20% /1.6x | 100 | 197.1 | 398.1 | 369.2 | ultimate: 15,718 /15,718 |
| Aurora | 215 | 32 | 10 | 12% /1.5x | 100 | 24.8 | 87.2 | 158.1 | skill2: 568 /705 |
| Bliss | 210 | 42 | 10 | 25% /1.7x | 100 | 242.9 | 751.2 | 1,115 | ultimate: 12,954.7 /16,656 |
| Bruno | 285 | 29 | 18 | 8% /1.5x | 100 | 145.3 | 300.6 | 414.2 | skill1: 638 /820 |
| Disciple | 240 | 36 | 11 | 12% /1.5x | 100 | 41.8 | 190 | 201.5 | light: 256.7 /313 |
| Elise | 195 | 40 | 8 | 25% /1.7x | 100 | 136.2 | 664.7 | 1,145 | ultimate: 22,816 /22,816 |
| Razor | 290 | 32 | 19 | 10% /1.5x | 100 | 142.1 | 441.6 | 641.3 | ultimate: 6,195.3 /7,626 |
| Nerithe | 235 | 40 | 13 | 18% /1.6x | 100 | 206.9 | 563.9 | 989.7 | ultimate: 11,590.7 /14,429 |
| Orvella | 300 | 32 | 20 | 10% /1.5x | 100 | 71.1 | 125.1 | 223.1 | ultimate: 2,056.7 /2,644 |
| Vaelor | 210 | 45 | 11 | 22% /1.6x | 100 | 238.4 | 945.9 | 1,666.1 | ultimate: 25,091 /25,091 |

### Level 20

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 880 | 152 | 26.4 | 15.9% /1.6x | 106 | 1,548.6 | 5,053.3 | 7,232 | ultimate: 22,833.3 /26,056 |
| Tizu | 1,040 | 120 | 42.2 | 10.6% /1.6x | 106 | 520 | 1,289.1 | 2,253.8 | skill1: 4,032.7 /5,358 |
| Flora | 760 | 128 | 21.1 | 21.2% /1.6x | 106 | 524.2 | 1,176.6 | 1,877.5 | skill1: 3,056.3 /3,488 |
| Rosetta | 900 | 172 | 29 | 21.2% /1.7x | 106 | 918.9 | 4,028.9 | 5,404.3 | ultimate: 38,620 /48,917 |
| Thornia | 1,120 | 124 | 44.9 | 10.6% /1.6x | 106 | 383.8 | 1,196.6 | 2,650.8 | ultimate: 13,925.7 /18,503 |
| Crinso | 820 | 164 | 23.8 | 26.5% /1.8x | 106 | 820.1 | 3,066 | 4,970.1 | ultimate: 38,635 /45,365 |
| Atmoso | 820 | 156 | 23.8 | 21.2% /1.7x | 106 | 811.2 | 1,649.3 | 1,589.7 | ultimate: 44,684.3 /56,995 |
| Aurora | 860 | 128 | 26.4 | 12.7% /1.6x | 106 | 103.3 | 355.5 | 793.9 | skill2: 3,047 /3,820 |
| Bliss | 840 | 168 | 26.4 | 26.5% /1.8x | 106 | 1,015.9 | 3,160.7 | 6,295.1 | ultimate: 48,418 /48,418 |
| Bruno | 1,140 | 116 | 47.5 | 8.5% /1.6x | 106 | 595.5 | 1,219.5 | 2,542.3 | skill1: 4,082 /5,424 |
| Disciple | 960 | 144 | 29 | 12.7% /1.6x | 106 | 173.7 | 795.9 | 955.4 | light: 1,077.3 /1,328 |
| Elise | 780 | 160 | 21.1 | 26.5% /1.8x | 106 | 562.1 | 2,729.6 | 5,204.1 | ultimate: 64,493.3 /82,992 |
| Razor | 1,160 | 128 | 50.1 | 10.6% /1.6x | 106 | 584.9 | 1,790.1 | 3,429.9 | ultimate: 21,553.3 /28,638 |
| Nerithe | 940 | 160 | 34.3 | 19.1% /1.7x | 106 | 852.7 | 2,306.7 | 4,445.6 | ultimate: 38,407.7 /44,494 |
| Orvella | 1,200 | 128 | 52.8 | 10.6% /1.6x | 106 | 292.4 | 530.4 | 1,335.2 | ultimate: 12,889.3 /17,126 |
| Vaelor | 840 | 180 | 29 | 23.3% /1.7x | 106 | 989.6 | 3,960.9 | 7,678.7 | ultimate: 71,460.3 /91,563 |

### Level 40

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 1,870 | 323 | 44.7 | 17.6% /1.8x | 117 | 3,969.6 | 12,179.7 | 23,173 | ultimate: 65,873.3 /76,901 |
| Tizu | 2,210 | 255 | 71.6 | 11.7% /1.8x | 117 | 1,158.4 | 2,796.4 | 6,348.2 | skill1: 14,352.3 /16,755 |
| Flora | 1,615 | 272 | 35.8 | 23.4% /1.8x | 117 | 1,168.4 | 2,602.3 | 5,684.5 | skill1: 8,807.7 /10,282 |
| Rosetta | 1,912.5 | 365.5 | 49.2 | 23.4% /1.9x | 117 | 2,084.6 | 12,153 | 24,755.5 | ultimate: 126,395.3 /162,471 |
| Thornia | 2,380 | 263.5 | 76 | 11.7% /1.8x | 117 | 860.4 | 2,611.1 | 8,104 | ultimate: 53,547.7 /62,512 |
| Crinso | 1,742.5 | 348.5 | 40.3 | 29.3% /2x | 117 | 1,830.8 | 6,876.7 | 15,526.5 | ultimate: 152,321.7 /199,784 |
| Atmoso | 1,742.5 | 331.5 | 40.3 | 23.4% /1.9x | 117 | 1,810.8 | 3,729.1 | 4,049.4 | ultimate: 141,138 /182,591 |
| Aurora | 1,827.5 | 272 | 44.7 | 14% /1.8x | 117 | 234.9 | 879.6 | 2,383 | skill2: 9,789.7 /12,465 |
| Bliss | 1,785 | 357 | 44.7 | 29.3% /2x | 117 | 2,490.2 | 7,609.8 | 22,256.6 | ultimate: 168,321 /168,321 |
| Bruno | 2,422.5 | 246.5 | 80.5 | 9.4% /1.8x | 117 | 1,317.7 | 2,654.6 | 8,266.4 | skill1: 13,866 /19,442 |
| Disciple | 2,040 | 306 | 49.2 | 14% /1.8x | 117 | 395.5 | 1,832.3 | 2,595.6 | light: 2,484.7 /3,115 |
| Elise | 1,657.5 | 340 | 35.8 | 29.3% /2x | 117 | 1,263.1 | 6,201.5 | 15,115.5 | ultimate: 199,621.7 /260,358 |
| Razor | 2,465 | 272 | 85 | 11.7% /1.8x | 117 | 1,303.2 | 3,896.2 | 10,681.9 | ultimate: 84,094 /98,172 |
| Nerithe | 1,997.5 | 340 | 58.1 | 21.1% /1.9x | 117 | 1,912.4 | 5,279 | 13,280.4 | ultimate: 116,701 /138,152 |
| Orvella | 2,550 | 272 | 89.5 | 11.7% /1.8x | 117 | 653.2 | 1,164.6 | 4,274.1 | ultimate: 51,927 /60,620 |
| Vaelor | 1,785 | 382.5 | 49.2 | 25.7% /1.9x | 117 | 2,342.4 | 9,532.7 | 26,555.3 | ultimate: 228,896.3 /297,364 |

### Level 60

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 2,860 | 494 | 60.2 | 19.2% /1.9x | 128 | 7,110.7 | 21,178.3 | 60,526.9 | ultimate: 159,668.3 /191,506 |
| Tizu | 3,380 | 390 | 96.4 | 12.8% /1.9x | 128 | 1,855.3 | 4,365 | 14,303.5 | skill1: 35,425.3 /42,489 |
| Flora | 2,470 | 416 | 48.2 | 25.6% /1.9x | 128 | 1,890.4 | 4,290.8 | 14,895.8 | skill1: 23,511.7 /28,200 |
| Rosetta | 2,925 | 559 | 66.2 | 25.6% /2x | 128 | 3,419.4 | 14,836.5 | 103,329 | ultimate: 334,008.3 /436,859 |
| Thornia | 3,640 | 403 | 102.4 | 12.8% /1.9x | 128 | 1,383.9 | 4,097.3 | 19,870.2 | ultimate: 141,623.3 /169,863 |
| Crinso | 2,665 | 533 | 54.2 | 32% /2.2x | 128 | 3,067.3 | 11,097.5 | 40,000.6 | ultimate: 418,012.7 /556,674 |
| Atmoso | 2,665 | 507 | 54.2 | 25.6% /2x | 128 | 2,928.5 | 6,046.7 | 8,439.4 | ultimate: 362,886.7 /477,367 |
| Aurora | 2,795 | 416 | 60.2 | 15.4% /1.9x | 128 | 383.6 | 1,456.1 | 6,655.5 | skill2: 25,628 /33,236 |
| Bliss | 2,730 | 546 | 60.2 | 32% /2.2x | 128 | 4,119 | 12,634.9 | 59,903.8 | ultimate: 539,089.7 /693,115 |
| Bruno | 3,705 | 377 | 108.4 | 10.2% /1.9x | 128 | 2,183.6 | 4,156.9 | 21,034 | skill1: 36,994 /55,422 |
| Disciple | 3,120 | 468 | 66.2 | 15.4% /1.9x | 128 | 645.3 | 3,018.4 | 5,943.6 | light: 4,722.7 /6,040 |
| Elise | 2,535 | 520 | 48.2 | 32% /2.2x | 128 | 2,067.1 | 9,936.8 | 35,672.9 | ultimate: 509,216.3 /674,742 |
| Razor | 3,770 | 416 | 114.4 | 12.8% /1.9x | 128 | 2,086.5 | 6,100 | 26,667 | ultimate: 227,641.7 /273,033 |
| Nerithe | 3,055 | 520 | 78.3 | 23% /2x | 128 | 3,078.5 | 8,379.8 | 30,702.8 | ultimate: 288,679 /350,633 |
| Orvella | 3,900 | 416 | 120.4 | 12.8% /1.9x | 128 | 1,048.7 | 1,838.4 | 10,851.9 | ultimate: 143,274.3 /171,843 |
| Vaelor | 2,730 | 585 | 66.2 | 28.2% /2.1x | 128 | 3,829.1 | 15,442.6 | 67,536.9 | ultimate: 606,551 /800,886 |

### Level 80

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 4,180 | 722 | 78.5 | 21.6% /2.2x | 144 | 12,002 | 35,846 | 105,623.3 | ultimate: 258,709.7 /315,120 |
| Tizu | 4,940 | 570 | 125.7 | 14.4% /2.2x | 144 | 2,887.9 | 6,640.8 | 22,631.4 | skill1: 58,950 /71,804 |
| Flora | 3,610 | 608 | 62.8 | 28.8% /2.2x | 144 | 2,948.9 | 6,947.5 | 25,739.9 | skill1: 40,159.3 /48,916 |
| Rosetta | 4,275 | 817 | 86.4 | 28.8% /2.3x | 144 | 5,436.3 | 23,428.4 | 87,858.6 | ultimate: 469,444 /469,444 |
| Thornia | 5,320 | 589 | 133.5 | 14.4% /2.2x | 144 | 2,167.3 | 6,304.3 | 32,551.6 | ultimate: 241,015 /293,567 |
| Crinso | 3,895 | 779 | 70.7 | 36% /2.4x | 144 | 4,813.4 | 19,397.7 | 67,719.6 | ultimate: 981,868 /981,868 |
| Atmoso | 3,895 | 741 | 70.7 | 28.8% /2.3x | 144 | 4,571.7 | 9,877.9 | 12,558.6 | ultimate: 611,320.3 /811,803 |
| Aurora | 4,085 | 608 | 78.5 | 17.3% /2.2x | 144 | 611.7 | 2,280.9 | 10,894.9 | skill2: 43,478.7 /56,975 |
| Bliss | 3,990 | 798 | 78.5 | 36% /2.4x | 144 | 6,940.1 | 20,583.9 | 103,482.1 | ultimate: 940,561 /1,209,293 |
| Bruno | 5,415 | 551 | 141.4 | 11.5% /2.2x | 144 | 3,396.7 | 6,280.6 | 34,466 | skill1: 79,729.3 /97,114 |
| Disciple | 4,560 | 684 | 86.4 | 17.3% /2.2x | 144 | 1,028.7 | 4,870.8 | 9,380.4 | light: 6,624.7 /8,569 |
| Elise | 3,705 | 760 | 62.8 | 36% /2.4x | 144 | 3,254.1 | 15,855.8 | 58,661.6 | ultimate: 1,158,096 /1,158,096 |
| Razor | 5,510 | 608 | 149.2 | 14.4% /2.2x | 144 | 3,247.4 | 9,314 | 45,729.4 | ultimate: 408,460.3 /497,523 |
| Nerithe | 4,465 | 760 | 102.1 | 25.9% /2.3x | 144 | 5,060.8 | 13,642.7 | 52,240.2 | ultimate: 485,229 /598,057 |
| Orvella | 5,700 | 608 | 157.1 | 14.4% /2.2x | 144 | 1,637.8 | 2,854 | 19,430 | ultimate: 249,643.3 /304,077 |
| Vaelor | 3,990 | 855 | 86.4 | 31.7% /2.4x | 144 | 6,119.6 | 25,247.6 | 112,190.6 | ultimate: 1,023,186 /1,363,479 |

### Level 100

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 5,170 | 893 | 91.1 | 23.3% /2.3x | 155 | 16,722.8 | 49,925.4 | 167,717.5 | ultimate: 386,663.3 /477,341 |
| Tizu | 6,110 | 705 | 145.8 | 15.5% /2.3x | 155 | 3,722 | 8,385.3 | 32,527.9 | skill1: 88,906.3 /109,756 |
| Flora | 4,465 | 752 | 72.9 | 31% /2.3x | 155 | 3,989.1 | 8,975.4 | 38,870.9 | skill1: 61,852.7 /76,358 |
| Rosetta | 5,287.5 | 1,010.5 | 100.3 | 31% /2.5x | 155 | 7,171.5 | 24,389.4 | 285,501.7 | ultimate: 886,503.3 /1,180,946 |
| Thornia | 6,580 | 728.5 | 155 | 15.5% /2.3x | 155 | 2,803.3 | 8,755.7 | 53,704.4 | ultimate: 380,378.3 /469,582 |
| Crinso | 4,817.5 | 963.5 | 82 | 38.8% /2.6x | 155 | 6,646.3 | 25,454.5 | 102,208 | ultimate: 1,541,624 /1,541,624 |
| Atmoso | 4,817.5 | 916.5 | 82 | 31% /2.5x | 155 | 6,224.7 | 12,879.5 | 17,248.8 | ultimate: 927,657.7 /1,241,993 |
| Aurora | 5,052.5 | 752 | 91.1 | 18.6% /2.3x | 155 | 799.8 | 2,950.7 | 16,329.7 | skill2: 67,076 /88,693 |
| Bliss | 4,935 | 987 | 91.1 | 38.8% /2.6x | 155 | 9,267.3 | 28,696.8 | 169,279 | ultimate: 1,473,166.3 /1,894,071 |
| Bruno | 6,697.5 | 681.5 | 164.1 | 12.4% /2.3x | 155 | 4,376.1 | 7,943.3 | 51,751.1 | skill1: 125,463 /154,886 |
| Disciple | 5,640 | 846 | 100.3 | 18.6% /2.3x | 155 | 1,345.4 | 6,414.7 | 13,739.9 | light: 8,733.3 /11,408 |
| Elise | 4,582.5 | 940 | 72.9 | 38.8% /2.6x | 155 | 4,375.8 | 20,477.3 | 86,439.3 | ultimate: 1,782,427 /1,782,427 |
| Razor | 6,815 | 752 | 173.2 | 15.5% /2.3x | 155 | 4,184.4 | 11,793.1 | 69,315.9 | ultimate: 645,762.3 /797,202 |
| Nerithe | 5,522.5 | 940 | 118.5 | 27.9% /2.5x | 155 | 6,575.7 | 17,551.4 | 76,922.9 | ultimate: 736,177.7 /918,987 |
| Orvella | 7,050 | 752 | 182.3 | 15.5% /2.3x | 155 | 2,114.7 | 4,024.3 | 32,038.3 | ultimate: 392,929 /485,076 |
| Vaelor | 4,935 | 1,057.5 | 100.3 | 34.1% /2.6x | 155 | 8,014.4 | 33,864.2 | 169,747.2 | ultimate: 1,576,635.3 /2,117,770 |

### Level 105

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 5,335 | 921.5 | 93.2 | 23.5% /2.3x | 156.5 | 17,711.2 | 52,873.4 | 181,120.1 | ultimate: 409,675.3 /506,609 |
| Tizu | 6,305 | 727.5 | 149.1 | 15.7% /2.3x | 156.5 | 3,861.8 | 8,677.6 | 34,340.9 | skill1: 94,463 /116,814 |
| Flora | 4,607.5 | 776 | 74.5 | 31.3% /2.3x | 156.5 | 4,142 | 9,316 | 41,643 | skill1: 66,438.7 /82,159 |
| Rosetta | 5,456.3 | 1,042.8 | 102.5 | 31.3% /2.5x | 156.5 | 7,454.5 | 25,331.6 | 303,478.8 | ultimate: 944,227 /1,259,193 |
| Thornia | 6,790 | 751.8 | 158.4 | 15.7% /2.3x | 156.5 | 2,910.2 | 9,077.1 | 57,200.1 | ultimate: 406,702.7 /502,933 |
| Crinso | 4,971.3 | 994.3 | 83.9 | 39.1% /2.7x | 156.5 | 6,904.7 | 26,472.6 | 108,851.5 | ultimate: 1,650,632 /1,650,632 |
| Atmoso | 4,971.3 | 945.8 | 83.9 | 31.3% /2.5x | 156.5 | 6,463.7 | 13,383.6 | 18,152.1 | ultimate: 993,384.3 /1,331,362 |
| Aurora | 5,213.8 | 776 | 93.2 | 18.8% /2.3x | 156.5 | 831.6 | 3,063 | 17,337.8 | skill2: 71,491.7 /94,639 |
| Bliss | 5,092.5 | 1,018.5 | 93.2 | 39.1% /2.7x | 156.5 | 9,649.6 | 29,885.6 | 180,884 | ultimate: 1,575,522.7 /2,025,672 |
| Bruno | 6,911.3 | 703.3 | 167.7 | 12.5% /2.3x | 156.5 | 4,540.1 | 8,221.1 | 54,860.1 | skill1: 133,815.7 /165,478 |
| Disciple | 5,820 | 873 | 102.5 | 18.8% /2.3x | 156.5 | 1,398.6 | 6,674.5 | 14,502.1 | light: 9,088 /11,886 |
| Elise | 4,728.8 | 970 | 74.5 | 39.1% /2.7x | 156.5 | 4,546.1 | 21,252.6 | 90,944.6 | ultimate: 1,884,970 /1,884,970 |
| Razor | 7,032.5 | 776 | 177 | 15.7% /2.3x | 156.5 | 4,341.9 | 12,207.4 | 73,619.5 | ultimate: 689,617 /852,788 |
| Nerithe | 5,698.8 | 970 | 121.1 | 28.2% /2.5x | 156.5 | 6,830.5 | 18,206.7 | 81,635.3 | ultimate: 784,393.3 /980,753 |
| Orvella | 7,275 | 776 | 186.3 | 15.7% /2.3x | 156.5 | 2,194.9 | 4,175.1 | 34,126.1 | ultimate: 419,968 /519,337 |
| Vaelor | 5,092.5 | 1,091.3 | 102.5 | 34.4% /2.6x | 156.5 | 8,333 | 35,243.2 | 178,835.8 | ultimate: 2,238,028 /2,238,028 |

## Ranked solo, duo and trio configurations at every checkpoint

Each cell lists the top3 measured configurations for its metric within that profile. DPR is the final9-round mean. HPR is effective healing per complete cycle under reset deficits; SPR is newly created shielding per complete cycle, not absorption. The support rotation may differ from the damage rotation: these maxima are NOT simultaneously available.
Roster ownership/source remains a separate constraint; read the acquisition table before treating any trio as practical.

### Lv.0 - floor

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **52.5** (51.4-54.7)<br>Bliss: **50.6** (48.4-51.7)<br>Crinso: **49.6** (47.4-50.7) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **102** (93.4-106.3)<br>Rosetta / Vaelor: **101.1** (94.1-106.3)<br>Crinso / Vaelor: **101** (92.4-105.3) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Rosetta / Bliss / Vaelor: **156** (149-160.9)<br>Crinso / Bliss / Vaelor: **155.9** (150.6-160.2)<br>Rosetta / Crinso / Bliss: **155.2** (148.2-160.1) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":0,"calamiticTokens":0,"rarities":{},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.0 - unlucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **76.9** (74-78.3)<br>Bliss: **74.3** (70-78.7)<br>Crinso: **72.3** (68-76.7) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **154.1** (139.7-161.3)<br>Crinso / Vaelor: **152.1** (137.7-159.3)<br>Rosetta / Vaelor: **151.4** (139.8-159.2) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **239.4** (233.7-251)<br>Bliss / Elise / Vaelor: **237.9** (232.1-249.4)<br>Rosetta / Bliss / Vaelor: **237.6** (230.6-247.9) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.0 - planned

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **311.8** (291.1-335)<br>Bliss: **242.9** (234.8-259)<br>Vaelor: **238.4** (226.8-246.4) | Flora: 152.4<br>Infernis: 0<br>Tizu: 0 | Tizu: 187.7<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Bliss: **556.7** (541.9-573.3)<br>Infernis / Vaelor: **547.9** (509.2-571.1)<br>Infernis / Rosetta: **524.6** (495.6-556.7) | Flora / Orvella: 393<br>Flora / Razor: 385<br>Flora / Bruno: 381 | Tizu / Disciple: 253.4<br>Tizu / Flora: 187.7<br>Tizu / Thornia: 187.7 |
| 3 | Infernis / Bliss / Vaelor: **829.1** (810.2-866.3)<br>Infernis / Rosetta / Vaelor: **826.3** (803.2-852.2)<br>Infernis / Nerithe / Vaelor: **817.6** (791-842.6) | Flora / Disciple / Orvella: 638.8<br>Flora / Disciple / Razor: 630<br>Flora / Bruno / Disciple: 625.6 | Tizu / Flora / Disciple: 253.4<br>Tizu / Thornia / Disciple: 253.4<br>Tizu / Crinso / Disciple: 253.4 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.0 - farmed

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **1,127** (940.7-1,455.9)<br>Bliss: **572.1** (539.8-636.9)<br>Crinso: **571.9** (567.8-580.2) | Flora: 277.7<br>Infernis: 0<br>Tizu: 0 | Tizu: 259.7<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Bliss: **1,671.8** (1,483.7-1,972.2)<br>Infernis / Crinso: **1,551** (1,507-1,607.2)<br>Infernis / Nerithe: **1,544.5** (1,475.8-1,608.9) | Flora / Razor: 701.5<br>Flora / Thornia: 686.9<br>Tizu / Flora: 657.7 | Tizu / Disciple: 347.3<br>Tizu / Thornia: 259.7<br>Tizu / Crinso: 259.7 |
| 3 | Infernis / Crinso / Bliss: **2,622.3** (2,225.3-2,917.1)<br>Infernis / Bliss / Nerithe: **2,581.1** (2,180.2-2,803.4)<br>Infernis / Bliss / Vaelor: **2,477.3** (2,133.2-2,657.3) | Tizu / Flora / Razor: 1,081.5<br>Tizu / Flora / Thornia: 1,066.9<br>Flora / Razor / Nerithe: 1,045 | Tizu / Atmoso / Disciple: 347.3<br>Tizu / Aurora / Disciple: 347.3<br>Tizu / Bliss / Disciple: 347.3 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":5,"Common":1,"Rare":2},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.0 - lucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **1,127** (803-1,292.4)<br>Vaelor: **945.9** (856.2-1,094.6)<br>Rosetta: **776.8** (734-798.2) | Flora: 593.8<br>Infernis: 78.9<br>Crinso: 35 | Tizu: 362<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Disciple: **6,688.9** (5,094.8-7,674.4)<br>Rosetta / Crinso: **6,334.6** (5,937.6-7,026.6)<br>Rosetta / Bliss: **5,816.7** (5,289.2-6,264.6) | Flora / Rosetta: 1,929.1<br>Flora / Bruno: 1,512.9<br>Flora / Aurora: 1,374.4 | Tizu / Orvella: 708.6<br>Tizu / Rosetta: 625.9<br>Tizu / Bliss: 619.7 |
| 3 | Rosetta / Bliss / Disciple: **34,183.5** (26,862-37,844.7)<br>Rosetta / Crinso / Disciple: **22,864.2** (18,132.8-26,956.3)<br>Infernis / Rosetta / Crinso: **21,173.5** (18,274-23,990.6) | Flora / Rosetta / Orvella: 4,125<br>Flora / Rosetta / Bruno: 3,616<br>Infernis / Flora / Rosetta: 3,590.5 | Tizu / Rosetta / Disciple: 1,626.2<br>Tizu / Rosetta / Razor: 1,103<br>Infernis / Tizu / Rosetta: 1,099 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":3,"Common":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.0 - ceiling

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **1,666.1** (1,469.2-1,997)<br>Rosetta: **1,425.9** (1,044.6-1,941)<br>Infernis: **1,387.3** (1,208.4-1,713.7) | Flora: 843.1<br>Infernis: 155.4<br>Crinso: 48 | Tizu: 753.3<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Razor: **15,016.1** (12,842.3-16,147.9)<br>Rosetta / Vaelor: **12,991.4** (12,078.4-13,905.1)<br>Rosetta / Crinso: **12,654.2** (10,818.3-13,695.9) | Flora / Rosetta: 3,080.9<br>Flora / Orvella: 2,309.1<br>Flora / Bliss: 2,283.2 | Tizu / Orvella: 1,143.9<br>Tizu / Disciple: 1,095.9<br>Tizu / Flora: 974.1 |
| 3 | Rosetta / Disciple / Vaelor: **67,176.7** (62,852.2-70,388.6)<br>Rosetta / Crinso / Disciple: **66,509.1** (65,299.3-67,181.1)<br>Rosetta / Bliss / Disciple: **66,013.4** (65,086.4-67,867.4) | Flora / Rosetta / Aurora: 5,776.3<br>Flora / Rosetta / Orvella: 5,760.6<br>Flora / Rosetta / Bruno: 5,598.8 | Tizu / Rosetta / Bruno: 2,001.1<br>Tizu / Disciple / Orvella: 1,582.2<br>Tizu / Flora / Rosetta: 1,551.3 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":487800,"calamiticTokens":0,"rarities":{"Legendary":3,"Common":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.20 - floor

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **215** (210-225)<br>Bliss: **208** (198-213)<br>Crinso: **203.1** (193.3-208) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **423** (378-453)<br>Crinso / Vaelor: **418** (373.7-447.3)<br>Rosetta / Vaelor: **417.6** (380.3-437) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **656** (631.3-675.7)<br>Rosetta / Bliss / Vaelor: **655.6** (623.3-678.3)<br>Bliss / Elise / Vaelor: **650.7** (626.4-669.9) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":0,"calamiticTokens":0,"rarities":{},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.20 - unlucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **317.1** (303.7-323.9)<br>Bliss: **307.9** (287.7-328.1)<br>Crinso: **300.1** (280.3-319.9) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **638.5** (571.1-672.2)<br>Rosetta / Vaelor: **631.7** (571.7-661.7)<br>Crinso / Vaelor: **630.1** (564.2-663.1) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **998.9** (971.9-1,052.8)<br>Bliss / Elise / Vaelor: **991.1** (964.1-1,045)<br>Rosetta / Bliss / Vaelor: **989** (956-1,036.9) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.20 - planned

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **1,548.6** (1,450.6-1,658.1)<br>Bliss: **1,015.9** (978.9-1,089.8)<br>Vaelor: **989.6** (935.9-1,026.6) | Flora: 609.6<br>Infernis: 0<br>Tizu: 0 | Tizu: 750.8<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Vaelor: **2,604.1** (2,348.8-2,866)<br>Infernis / Bliss: **2,571.2** (2,502.9-2,647.3)<br>Infernis / Rosetta: **2,502.7** (2,284.6-2,656.3) | Flora / Orvella: 1,572.1<br>Flora / Razor: 1,540<br>Flora / Bruno: 1,524 | Tizu / Disciple: 1,013.5<br>Tizu / Flora: 750.8<br>Tizu / Thornia: 750.8 |
| 3 | Infernis / Bliss / Vaelor: **3,726.4** (3,630.7-3,915.1)<br>Infernis / Rosetta / Vaelor: **3,700.1** (3,583.4-3,815)<br>Infernis / Nerithe / Vaelor: **3,672.6** (3,550.7-3,789.6) | Flora / Disciple / Orvella: 2,555<br>Flora / Disciple / Razor: 2,520<br>Flora / Bruno / Disciple: 2,502.5 | Tizu / Flora / Disciple: 1,013.5<br>Tizu / Thornia / Disciple: 1,013.5<br>Tizu / Crinso / Disciple: 1,013.5 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.20 - farmed

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **6,135.9** (5,180.2-7,801.2)<br>Nerithe: **2,831** (2,743.9-3,005.3)<br>Bliss: **2,726.6** (2,542.6-3,094.8) | Flora: 1,265.4<br>Infernis: 0<br>Tizu: 0 | Tizu: 1,269.8<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Bliss: **8,925.9** (8,184.8-10,192)<br>Infernis / Nerithe: **8,178.1** (7,804.1-8,532.1)<br>Infernis / Crinso: **8,106.7** (7,899.6-8,377.2) | Flora / Razor: 3,196.8<br>Flora / Thornia: 3,130.2<br>Tizu / Flora: 2,997 | Tizu / Disciple: 1,700.8<br>Tizu / Thornia: 1,269.8<br>Tizu / Crinso: 1,269.8 |
| 3 | Infernis / Bliss / Nerithe: **13,550.4** (11,246.1-14,775.2)<br>Infernis / Crinso / Bliss: **13,526.5** (11,415.6-14,939)<br>Infernis / Bliss / Vaelor: **12,764.7** (10,958.1-13,817) | Tizu / Flora / Razor: 4,928.4<br>Tizu / Flora / Thornia: 4,861.8<br>Flora / Razor / Nerithe: 4,761.9 | Tizu / Atmoso / Disciple: 1,700.8<br>Tizu / Aurora / Disciple: 1,700.8<br>Tizu / Bliss / Disciple: 1,700.8 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":5,"Common":1,"Rare":2},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.20 - lucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **5,053.3** (3,603.1-5,794.6)<br>Rosetta: **4,028.9** (3,333.3-5,419.9)<br>Vaelor: **3,960.9** (3,565.2-4,617.2) | Flora: 2,375<br>Infernis: 315.6<br>Crinso: 139.5 | Tizu: 1,447.8<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Bliss: **24,540.3** (21,506.4-26,343)<br>Rosetta / Elise: **22,602.1** (17,541.7-25,132.3)<br>Rosetta / Disciple: **22,384.6** (17,112.4-26,667.9) | Flora / Rosetta: 8,488.3<br>Flora / Bruno: 6,051.5<br>Flora / Elise: 5,727 | Tizu / Orvella: 2,834.3<br>Tizu / Rosetta: 2,621.3<br>Tizu / Bliss: 2,478.7 |
| 3 | Rosetta / Bliss / Disciple: **133,276.6** (126,295.3-139,557.8)<br>Infernis / Rosetta / Bliss: **81,433.7** (75,760.6-85,501.2)<br>Infernis / Rosetta / Thornia: **80,096.4** (73,486.3-84,096.6) | Flora / Rosetta / Orvella: 16,477.4<br>Flora / Rosetta / Thornia: 14,660.6<br>Flora / Rosetta / Bruno: 14,027.1 | Tizu / Rosetta / Disciple: 5,294.6<br>Infernis / Tizu / Rosetta: 4,861.8<br>Tizu / Rosetta / Bruno: 4,368.7 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":3,"Common":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.20 - ceiling

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **7,678.7** (6,705.1-9,350.7)<br>Infernis: **7,232** (6,830.6-7,852.7)<br>Bliss: **6,295.1** (4,506.2-7,587.9) | Flora: 3,372.5<br>Infernis: 593.1<br>Crinso: 183 | Tizu: 3,251.1<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Rosetta: **52,809.7** (46,277.6-59,763.7)<br>Rosetta / Crinso: **49,558.6** (35,240.6-56,832.7)<br>Rosetta / Razor: **45,330.4** (31,809.7-52,174.2) | Flora / Rosetta: 12,834<br>Flora / Orvella: 9,236.5<br>Flora / Bliss: 9,184 | Tizu / Disciple: 5,153<br>Tizu / Orvella: 4,981.5<br>Tizu / Flora: 4,081.7 |
| 3 | Rosetta / Thornia / Disciple: **339,893.7** (291,713.9-381,397.2)<br>Rosetta / Disciple / Vaelor: **325,102.4** (268,389.4-374,705.4)<br>Rosetta / Bliss / Disciple: **307,895** (291,853.3-321,784.2) | Flora / Rosetta / Orvella: 24,425.4<br>Flora / Rosetta / Aurora: 23,328.6<br>Infernis / Flora / Rosetta: 21,327.8 | Tizu / Rosetta / Bruno: 8,027<br>Infernis / Tizu / Bruno: 7,650.8<br>Tizu / Thornia / Bruno: 7,650.8 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":488400,"calamiticTokens":0,"rarities":{"Legendary":3,"Rare":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.40 - floor

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **488.2** (461.9-501.3)<br>Bliss: **474.7** (474.7-474.7)<br>Crinso: **463.7** (463.7-463.7) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **936.6** (818.7-1,015)<br>Crinso / Vaelor: **925.6** (809.7-1,002)<br>Rosetta / Vaelor: **922.1** (823.8-973.3) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **1,491.6** (1,478.9-1,516.9)<br>Bliss / Elise / Vaelor: **1,479.7** (1,467.2-1,504.3)<br>Rosetta / Bliss / Vaelor: **1,475.4** (1,416.8-1,522.3) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":0,"calamiticTokens":0,"rarities":{},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.40 - unlucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **729.8** (676.3-783.2)<br>Bliss: **694** (641-747)<br>Crinso: **677.1** (625.3-728.9) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **1,476.5** (1,264.3-1,635.8)<br>Crinso / Bliss: **1,459.4** (1,265.1-1,634.9)<br>Crinso / Vaelor: **1,457.6** (1,249.9-1,614) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **2,294.3** (2,205.2-2,471.6)<br>Rosetta / Bliss / Vaelor: **2,281.9** (2,208.8-2,427.2)<br>Rosetta / Crinso / Bliss: **2,279.9** (2,155.3-2,423) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.40 - planned

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **3,969.6** (3,702.9-4,267.1)<br>Bliss: **2,490.2** (2,234.9-2,710.2)<br>Vaelor: **2,342.4** (2,156.2-2,582.1) | Flora: 1,295.4<br>Infernis: 0<br>Tizu: 0 | Tizu: 1,595.3<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Vaelor: **6,389** (5,711.8-7,088.9)<br>Infernis / Bliss: **6,325** (6,167.2-6,514.6)<br>Infernis / Crinso: **6,142.9** (5,813.2-6,712.9) | Flora / Orvella: 3,340.7<br>Flora / Razor: 3,272.5<br>Flora / Bruno: 3,238.4 | Tizu / Disciple: 2,153.7<br>Tizu / Flora: 1,595.3<br>Tizu / Thornia: 1,595.3 |
| 3 | Infernis / Nerithe / Vaelor: **9,191** (8,801.7-9,520.4)<br>Infernis / Crinso / Vaelor: **9,172.5** (8,926.4-9,469.1)<br>Infernis / Atmoso / Vaelor: **9,152.3** (8,966.3-9,520.8) | Flora / Disciple / Orvella: 5,429.4<br>Flora / Disciple / Razor: 5,355<br>Flora / Bruno / Disciple: 5,317.8 | Tizu / Flora / Disciple: 2,153.7<br>Tizu / Thornia / Disciple: 2,153.7<br>Tizu / Crinso / Disciple: 2,153.7 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.40 - farmed

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **17,825** (14,989.6-22,693.3)<br>Nerithe: **7,885.1** (7,517.4-8,433.7)<br>Crinso: **7,597.7** (7,135.2-8,522.7) | Flora: 2,689<br>Infernis: 0<br>Tizu: 0 | Tizu: 3,516.1<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Bliss: **25,876** (24,158.3-28,935.7)<br>Infernis / Nerithe: **23,401** (22,193.4-24,556.2)<br>Infernis / Crinso: **23,018.6** (22,451-23,783.2) | Flora / Razor: 6,793.2<br>Flora / Thornia: 6,651.7<br>Tizu / Flora: 6,368.6 | Tizu / Disciple: 4,689.5<br>Tizu / Flora: 3,516.1<br>Tizu / Thornia: 3,516.1 |
| 3 | Infernis / Bliss / Nerithe: **38,819.1** (31,923.8-42,545.2)<br>Infernis / Crinso / Bliss: **38,656.1** (32,617.4-42,883.2)<br>Infernis / Bliss / Vaelor: **36,346.7** (31,364.1-39,368.6) | Tizu / Flora / Razor: 10,472.9<br>Tizu / Flora / Thornia: 10,331.3<br>Flora / Bliss / Razor: 10,153.6 | Tizu / Flora / Disciple: 4,689.5<br>Tizu / Atmoso / Disciple: 4,689.5<br>Tizu / Aurora / Disciple: 4,689.5 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":5,"Common":1,"Rare":2},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.40 - lucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **12,179.7** (8,497.2-14,064.9)<br>Rosetta: **12,153** (11,638.4-12,467.9)<br>Vaelor: **9,532.7** (8,315.9-10,988.1) | Flora: 5,046.9<br>Infernis: 669.5<br>Crinso: 296 | Tizu: 3,076.6<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Bliss: **59,663.7** (46,047-72,754)<br>Infernis / Rosetta: **53,617.4** (47,824.2-56,931.8)<br>Rosetta / Vaelor: **51,533** (30,102.1-70,493.3) | Flora / Rosetta: 17,470.7<br>Flora / Orvella: 14,416<br>Flora / Atmoso: 13,232.8 | Tizu / Rosetta: 6,904.5<br>Tizu / Orvella: 6,022.9<br>Tizu / Flora: 5,008.4 |
| 3 | Rosetta / Bliss / Disciple: **321,497.9** (294,017.3-344,246.3)<br>Infernis / Rosetta / Crinso: **252,648.4** (215,520.7-290,987.3)<br>Infernis / Rosetta / Razor: **220,175.6** (178,985.9-250,025.8) | Flora / Rosetta / Orvella: 35,985<br>Flora / Rosetta / Thornia: 31,666.7<br>Flora / Rosetta / Razor: 31,449.2 | Tizu / Rosetta / Disciple: 10,677.9<br>Infernis / Tizu / Rosetta: 9,218.6<br>Tizu / Rosetta / Nerithe: 7,945.8 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":3,"Common":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.40 - ceiling

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **26,555.3** (20,600.4-29,871.3)<br>Rosetta: **24,755.5** (20,747.1-32,772.3)<br>Infernis: **23,173** (21,762.6-25,296.9) | Flora: 9,559.2<br>Infernis: 1,260.8<br>Rosetta: 212.9 | Tizu: 9,211.6<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Disciple: **201,567.9** (156,878.3-243,065.3)<br>Infernis / Rosetta: **201,149.8** (173,366-215,041.7)<br>Rosetta / Crinso: **181,742.4** (132,750.8-214,148.6) | Flora / Rosetta: 28,923.9<br>Flora / Orvella: 24,512.4<br>Flora / Bliss: 22,683.3 | Tizu / Disciple: 15,087.5<br>Tizu / Orvella: 13,352.8<br>Rosetta / Bruno: 13,105.2 |
| 3 | Rosetta / Crinso / Disciple: **1,866,626.4** (1,608,101.7-2,075,188.4)<br>Infernis / Rosetta / Disciple: **1,615,149.4** (1,293,267.7-1,846,603)<br>Rosetta / Disciple / Vaelor: **1,406,788.1** (1,376,354.3-1,467,655.6) | Infernis / Flora / Rosetta: 54,509.3<br>Flora / Rosetta / Aurora: 53,235.7<br>Flora / Rosetta / Orvella: 52,087.7 | Tizu / Rosetta / Disciple: 23,939.9<br>Rosetta / Crinso / Bruno: 22,444.5<br>Tizu / Rosetta / Bruno: 20,865.7 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":488400,"calamiticTokens":0,"rarities":{"Legendary":3,"Rare":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.60 - floor

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Bliss: **783.8** (760-831.3)<br>Vaelor: **777.9** (729.7-802)<br>Crinso: **765.2** (742-811.7) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **1,489.7** (1,274.7-1,632.3)<br>Rosetta / Vaelor: **1,484** (1,281.4-1,614.2)<br>Crinso / Vaelor: **1,471.7** (1,260-1,611) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **2,398.6** (2,375.3-2,444)<br>Rosetta / Bliss / Vaelor: **2,387.7** (2,323.6-2,451.8)<br>Bliss / Elise / Vaelor: **2,380** (2,357.3-2,424.3) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":0,"calamiticTokens":0,"rarities":{},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.60 - unlucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **1,180.2** (1,082.7-1,277.8)<br>Bliss: **1,154.4** (1,122.3-1,218.7)<br>Crinso: **1,127.3** (1,096-1,190) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **2,526.9** (2,206.2-2,687.9)<br>Crinso / Bliss: **2,506.6** (2,216-2,697.7)<br>Crinso / Vaelor: **2,494.4** (2,182.2-2,652.2) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **3,973.9** (3,684.1-4,266.9)<br>Bliss / Elise / Vaelor: **3,942.6** (3,652.8-4,237.8)<br>Crinso / Elise / Vaelor: **3,910.8** (3,626.4-4,199.8) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.60 - planned

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **7,110.7** (6,613.6-7,665.2)<br>Bliss: **4,119** (3,654.7-4,519.1)<br>Vaelor: **3,829.1** (3,488.7-4,267.1) | Flora: 1,981.1<br>Infernis: 0<br>Tizu: 0 | Tizu: 2,439.9<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Vaelor: **11,113.7** (9,840.8-12,467.9)<br>Infernis / Crinso: **11,066.5** (10,662.4-11,718.4)<br>Infernis / Bliss: **11,041.7** (10,784.1-11,420.7) | Flora / Orvella: 5,109.3<br>Flora / Razor: 5,005<br>Flora / Bruno: 4,952.9 | Tizu / Disciple: 3,293.9<br>Tizu / Flora: 2,439.9<br>Tizu / Thornia: 2,439.9 |
| 3 | Infernis / Nerithe / Vaelor: **15,865.1** (15,171.4-16,409.7)<br>Infernis / Bliss / Vaelor: **15,856.3** (15,457.4-16,375.3)<br>Infernis / Crinso / Vaelor: **15,836** (15,326.3-16,503.8) | Flora / Disciple / Orvella: 8,303.8<br>Flora / Disciple / Razor: 8,190<br>Flora / Bruno / Disciple: 8,133.1 | Tizu / Flora / Disciple: 3,293.9<br>Tizu / Thornia / Disciple: 3,293.9<br>Tizu / Crinso / Disciple: 3,293.9 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.60 - farmed

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **35,714.7** (29,936.9-45,522.6)<br>Bliss: **15,139.6** (12,640.1-17,639)<br>Nerithe: **15,012.3** (14,206.1-16,288.8) | Flora: 4,112.6<br>Infernis: 0<br>Tizu: 0 | Tizu: 6,503.1<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Bliss: **51,999.2** (48,648.1-56,877.3)<br>Infernis / Nerithe: **46,182.3** (43,574.1-48,695.7)<br>Infernis / Rosetta: **45,259.2** (40,822.9-50,662.3) | Flora / Razor: 10,389.6<br>Flora / Thornia: 10,173.2<br>Tizu / Flora: 9,740.3 | Tizu / Disciple: 8,691.7<br>Tizu / Flora: 6,503.1<br>Tizu / Thornia: 6,503.1 |
| 3 | Infernis / Bliss / Nerithe: **76,733** (62,599.2-84,465.3)<br>Infernis / Crinso / Bliss: **75,893** (63,768.7-84,568.9)<br>Infernis / Bliss / Vaelor: **71,499.6** (61,669-77,629.8) | Tizu / Flora / Razor: 16,017.3<br>Tizu / Flora / Thornia: 15,800.9<br>Flora / Bliss / Razor: 15,650.9 | Tizu / Flora / Disciple: 8,691.7<br>Tizu / Atmoso / Disciple: 8,691.7<br>Tizu / Aurora / Disciple: 8,691.7 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":5,"Common":1,"Rare":2},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.60 - lucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **21,178.3** (18,960.1-24,314.8)<br>Vaelor: **15,442.6** (13,309.3-17,994.1)<br>Rosetta: **14,836.5** (11,248.3-20,348.4) | Flora: 7,718.8<br>Infernis: 970.2<br>Rosetta: 158.6 | Tizu: 4,705.4<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Vaelor: **92,424.9** (76,153.1-100,846.8)<br>Rosetta / Bliss: **90,948.1** (81,848-100,048.2)<br>Rosetta / Elise: **88,999.2** (66,496-104,161.4) | Flora / Rosetta: 26,713.4<br>Flora / Orvella: 22,048<br>Flora / Atmoso: 21,503.3 | Tizu / Orvella: 9,211.6<br>Tizu / Bruno: 8,991.3<br>Tizu / Flora: 7,659.9 |
| 3 | Rosetta / Bliss / Disciple: **534,511.9** (507,607.3-563,036.8)<br>Rosetta / Thornia / Disciple: **437,603.1** (383,334.6-475,063.9)<br>Rosetta / Disciple / Elise: **429,009.9** (419,512.2-435,324.3) | Flora / Rosetta / Orvella: 56,808.1<br>Flora / Rosetta / Aurora: 50,210.5<br>Flora / Rosetta / Thornia: 47,464.8 | Tizu / Rosetta / Crinso: 14,380.7<br>Infernis / Tizu / Rosetta: 13,369.2<br>Tizu / Rosetta / Disciple: 12,646.1 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":3,"Common":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.60 - ceiling

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Rosetta: **103,329** (87,058.1-120,987.7)<br>Vaelor: **67,536.9** (50,096.6-76,949.1)<br>Infernis: **60,526.9** (55,421-65,715.2) | Flora: 16,306.8<br>Infernis: 2,151.4<br>Rosetta: 544.8 | Tizu: 20,548.9<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Disciple: **1,139,029.9** (1,035,028.4-1,222,668.7)<br>Infernis / Rosetta: **497,432.3** (471,358.2-510,469.3)<br>Rosetta / Crinso: **471,421.1** (425,200.7-517,641.6) | Flora / Rosetta: 48,978<br>Flora / Orvella: 42,341.6<br>Flora / Bliss: 40,414 | Rosetta / Bruno: 37,978.8<br>Tizu / Disciple: 34,835<br>Tizu / Razor: 29,669.9 |
| 3 | Rosetta / Crinso / Disciple: **5,265,402** (4,449,252.1-5,673,477)<br>Rosetta / Disciple / Vaelor: **4,825,532.3** (4,658,197.8-4,953,308)<br>Infernis / Rosetta / Disciple: **4,648,356.1** (4,020,239.6-4,962,414.4) | Flora / Rosetta / Orvella: 110,252.8<br>Flora / Rosetta / Aurora: 92,678.5<br>Flora / Rosetta / Bruno: 85,182.2 | Tizu / Rosetta / Bruno: 64,639.9<br>Rosetta / Bruno / Disciple: 56,779.1<br>Rosetta / Crinso / Bruno: 54,973.2 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":488400,"calamiticTokens":0,"rarities":{"Legendary":3,"Rare":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.80 - floor

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **1,290.6** (1,247-1,377.7)<br>Bliss: **1,269** (1,183.3-1,311.8)<br>Crinso: **1,238.6** (1,155-1,280.3) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **2,428.1** (1,912.1-2,813.4)<br>Crinso / Bliss: **2,425** (2,081.4-2,726.8)<br>Bliss / Elise: **2,397.7** (2,053.1-2,701.6) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **3,966.5** (3,841.3-4,092.9)<br>Bliss / Elise / Vaelor: **3,934** (3,809.9-4,058.3)<br>Crinso / Bliss / Elise: **3,927.7** (3,834.8-3,975.7) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":0,"calamiticTokens":0,"rarities":{},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.80 - unlucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **1,918.6** (1,859.8-2,036.2)<br>Bliss: **1,828.1** (1,770.3-1,943.7)<br>Crinso: **1,784.8** (1,728.4-1,897.6) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **4,208.9** (3,806.6-4,499.9)<br>Crinso / Vaelor: **4,154.4** (3,764.7-4,441.1)<br>Elise / Vaelor: **4,100.4** (3,722.7-4,383.1) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **6,511.9** (6,049.7-6,923.7)<br>Bliss / Elise / Vaelor: **6,461.9** (5,999.7-6,877.7)<br>Crinso / Elise / Vaelor: **6,408.7** (5,957.8-6,814.7) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.80 - planned

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **12,002** (11,086-13,023.9)<br>Bliss: **6,940.1** (5,845.1-7,574.2)<br>Vaelor: **6,119.6** (5,504-6,911.6) | Flora: 2,895.5<br>Infernis: 0<br>Tizu: 0 | Tizu: 3,566.1<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Vaelor: **18,964.9** (17,713.8-20,903.9)<br>Infernis / Bliss: **18,632.7** (17,863-19,017.6)<br>Infernis / Crinso: **18,415.4** (17,681.8-19,611.4) | Flora / Orvella: 7,467.4<br>Flora / Razor: 7,315<br>Flora / Bruno: 7,238.8 | Tizu / Disciple: 4,814.2<br>Tizu / Flora: 3,566.1<br>Tizu / Thornia: 3,566.1 |
| 3 | Infernis / Crinso / Vaelor: **27,036.8** (26,148.2-27,488.2)<br>Infernis / Nerithe / Vaelor: **26,851.1** (25,854.2-28,103.3)<br>Infernis / Bliss / Vaelor: **26,774.8** (26,028.6-28,006.7) | Flora / Disciple / Orvella: 12,136.3<br>Flora / Disciple / Razor: 11,970<br>Flora / Bruno / Disciple: 11,886.9 | Tizu / Flora / Disciple: 4,814.2<br>Tizu / Thornia / Disciple: 4,814.2<br>Tizu / Crinso / Disciple: 4,814.2 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.80 - farmed

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **69,518.7** (57,568.3-89,562.4)<br>Nerithe: **29,525.9** (26,624-31,275.7)<br>Crinso: **28,923.9** (24,006.2-31,382.8) | Flora: 6,010.7<br>Infernis: 0<br>Tizu: 0 | Tizu: 11,880.7<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Bliss: **100,747.4** (93,927.4-109,545.6)<br>Infernis / Crinso: **91,099.2** (84,122.7-96,490.9)<br>Infernis / Nerithe: **89,912.7** (82,573.1-98,831.9) | Flora / Razor: 15,184.8<br>Flora / Thornia: 14,868.4<br>Tizu / Flora: 14,235.8 | Tizu / Disciple: 15,847<br>Tizu / Flora: 11,880.7<br>Tizu / Thornia: 11,880.7 |
| 3 | Infernis / Bliss / Nerithe: **150,596.7** (124,708.7-165,464.1)<br>Infernis / Crinso / Bliss: **150,431.9** (129,988.8-166,616.4)<br>Infernis / Bliss / Vaelor: **138,315.1** (118,454.6-150,601.1) | Tizu / Flora / Razor: 23,409.9<br>Flora / Bliss / Razor: 23,097.1<br>Tizu / Flora / Thornia: 23,093.5 | Tizu / Flora / Disciple: 15,847<br>Tizu / Atmoso / Disciple: 15,847<br>Tizu / Aurora / Disciple: 15,847 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":5,"Common":1,"Rare":2},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.80 - lucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **35,846** (32,168-41,187.9)<br>Vaelor: **25,247.6** (20,708.4-28,826.4)<br>Rosetta: **23,428.4** (17,613.6-30,320.3) | Flora: 11,281.3<br>Infernis: 1,417.7<br>Rosetta: 231.8 | Tizu: 6,877.1<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Rosetta: **198,288.2** (183,050.9-215,938.1)<br>Rosetta / Vaelor: **186,886.2** (101,061-241,522.7)<br>Rosetta / Elise: **183,948.3** (142,802.3-219,892.3) | Flora / Rosetta: 41,517.4<br>Flora / Atmoso: 33,276.6<br>Flora / Orvella: 32,224 | Tizu / Orvella: 13,463<br>Tizu / Flora: 11,195.3<br>Tizu / Bruno: 10,281.4 |
| 3 | Rosetta / Bliss / Disciple: **906,264.4** (873,220.4-922,786.3)<br>Rosetta / Disciple / Elise: **870,729.1** (775,141.7-967,789.6)<br>Rosetta / Disciple / Vaelor: **758,383.9** (638,052.1-900,282.1) | Flora / Rosetta / Orvella: 80,619.9<br>Flora / Rosetta / Aurora: 74,836.6<br>Flora / Atmoso / Orvella: 72,901.6 | Tizu / Rosetta / Orvella: 27,636.5<br>Tizu / Rosetta / Bruno: 18,734.2<br>Tizu / Flora / Rosetta: 17,598.3 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":3,"Common":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.80 - ceiling

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **112,190.6** (80,574.3-127,998.8)<br>Infernis: **105,623.3** (96,823-114,654)<br>Bliss: **103,482.1** (63,674.2-123,386.1) | Flora: 21,367.6<br>Infernis: 2,819.2<br>Rosetta: 493 | Tizu: 32,073.7<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Disciple: **1,435,435.5** (1,314,644.8-1,575,059.3)<br>Rosetta / Crinso: **1,069,081.9** (812,062.7-1,388,064)<br>Infernis / Rosetta: **991,071.9** (863,814.6-1,166,711.9) | Flora / Rosetta: 65,204<br>Flora / Orvella: 55,482.1<br>Flora / Bliss: 54,719.1 | Rosetta / Bruno: 61,785.5<br>Bruno / Vaelor: 58,170.4<br>Tizu / Disciple: 54,894.2 |
| 3 | Rosetta / Crinso / Disciple: **15,422,888.6** (15,422,888.6-15,422,888.6)<br>Rosetta / Disciple / Razor: **15,184,504.3** (13,416,938.7-17,053,839.1)<br>Infernis / Rosetta / Disciple: **13,245,706.2** (12,769,563.3-13,748,818.1) | Flora / Rosetta / Razor: 134,364.4<br>Infernis / Flora / Rosetta: 124,944<br>Flora / Rosetta / Aurora: 123,580.3 | Tizu / Rosetta / Bruno: 90,343.8<br>Rosetta / Crinso / Bruno: 87,994.1<br>Rosetta / Bruno / Disciple: 84,412.1 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":488400,"calamiticTokens":0,"rarities":{"Legendary":3,"Rare":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.100 - floor

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **1,668** (1,607-1,790)<br>Bliss: **1,644.6** (1,525-1,704.3)<br>Crinso: **1,605.7** (1,489-1,664) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Crinso / Bliss: **3,193.3** (2,655.3-3,731.3)<br>Bliss / Vaelor: **3,189.3** (2,590.3-3,666.3)<br>Bliss / Elise: **3,156.7** (2,618.7-3,694.7) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **5,214.2** (5,151-5,329.7)<br>Bliss / Elise / Vaelor: **5,171.9** (5,110.1-5,284.6)<br>Crinso / Bliss / Elise: **5,169.3** (4,982.9-5,350.1) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":0,"calamiticTokens":0,"rarities":{},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.100 - unlucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Bliss: **2,542.6** (2,300.4-2,784.7)<br>Vaelor: **2,498.3** (2,416-2,663)<br>Crinso: **2,482.1** (2,245.9-2,718.3) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **5,525.1** (4,963.4-5,931.9)<br>Crinso / Vaelor: **5,452.9** (4,908.9-5,853.8)<br>Elise / Vaelor: **5,381.2** (4,854.2-5,776.4) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **8,653.1** (8,165-9,150.1)<br>Bliss / Elise / Vaelor: **8,585.3** (8,093.3-9,089.8)<br>Crinso / Elise / Vaelor: **8,515** (8,038.8-9,005.8) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.100 - planned

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **16,722.8** (15,428.8-18,166.3)<br>Bliss: **9,267.3** (7,657.4-10,072.2)<br>Vaelor: **8,014.4** (7,152.7-9,123.2) | Flora: 3,581.3<br>Infernis: 0<br>Tizu: 0 | Tizu: 4,410.7<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Vaelor: **26,000.8** (24,163.2-28,645.3)<br>Infernis / Bliss: **25,469** (24,389.9-26,008.6)<br>Infernis / Crinso: **25,192.7** (24,163.3-26,878.8) | Flora / Orvella: 9,236<br>Flora / Razor: 9,047.5<br>Flora / Bruno: 8,953.3 | Tizu / Disciple: 5,954.4<br>Tizu / Flora: 4,410.7<br>Tizu / Thornia: 4,410.7 |
| 3 | Infernis / Bliss / Vaelor: **36,936.6** (35,279.3-39,155.6)<br>Infernis / Crinso / Vaelor: **36,732.9** (35,494.6-37,361.3)<br>Infernis / Rosetta / Vaelor: **36,702.6** (35,408.2-38,119.8) | Flora / Disciple / Orvella: 15,010.6<br>Flora / Disciple / Razor: 14,805<br>Flora / Bruno / Disciple: 14,702.2 | Tizu / Flora / Disciple: 5,954.4<br>Tizu / Thornia / Disciple: 5,954.4<br>Tizu / Crinso / Disciple: 5,954.4 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.100 - farmed

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **105,840.5** (87,537-136,337.4)<br>Bliss: **44,607.5** (41,474.6-49,918.2)<br>Nerithe: **43,214.4** (38,467.8-46,002.6) | Flora: 7,434.2<br>Infernis: 0<br>Tizu: 0 | Tizu: 16,955.3<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Bliss: **151,988.9** (141,897.6-164,440.4)<br>Infernis / Crinso: **136,429.6** (125,799.8-144,586.7)<br>Infernis / Nerithe: **135,377.8** (123,750.1-149,556.2) | Flora / Razor: 18,781.2<br>Flora / Thornia: 18,389.9<br>Tizu / Flora: 17,607.4 | Tizu / Disciple: 22,573.1<br>Tizu / Thornia: 18,259.5<br>Tizu / Flora: 16,955.3 |
| 3 | Infernis / Bliss / Nerithe: **229,507.5** (195,514-249,582.4)<br>Infernis / Crinso / Bliss: **225,536.1** (194,780.7-250,283.8)<br>Infernis / Bliss / Vaelor: **207,729.6** (177,944.8-226,535.3) | Flora / Thornia / Bliss: 29,244.2<br>Tizu / Flora / Razor: 28,954.4<br>Flora / Bliss / Razor: 28,787.7 | Tizu / Flora / Disciple: 22,573.1<br>Tizu / Atmoso / Disciple: 22,573.1<br>Tizu / Aurora / Disciple: 22,573.1 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":5,"Common":1,"Rare":2},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.100 - lucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **49,925.4** (44,834.1-57,262.7)<br>Vaelor: **33,864.2** (27,717.1-40,011.3)<br>Bliss: **28,696.8** (23,714.1-31,571.6) | Flora: 13,953.1<br>Infernis: 1,753<br>Rosetta: 143.3 | Tizu: 8,505.9<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Rosetta: **253,684.3** (241,184-272,759.2)<br>Rosetta / Crinso: **235,325** (187,913.2-295,240.3)<br>Rosetta / Vaelor: **234,246.8** (210,748.6-256,627.4) | Flora / Rosetta: 51,350.5<br>Flora / Orvella: 39,856<br>Flora / Atmoso: 38,871.4 | Tizu / Orvella: 16,651.7<br>Tizu / Bruno: 16,253.6<br>Tizu / Flora: 13,846.8 |
| 3 | Rosetta / Disciple / Vaelor: **1,257,522.9** (1,200,505.1-1,308,813.6)<br>Rosetta / Bliss / Disciple: **1,246,797.1** (1,226,277.9-1,287,835.4)<br>Infernis / Rosetta / Disciple: **1,163,945.7** (1,119,764.8-1,218,991.8) | Flora / Rosetta / Orvella: 108,780.6<br>Flora / Rosetta / Aurora: 92,561.3<br>Flora / Rosetta / Bruno: 87,993.7 | Tizu / Rosetta / Orvella: 25,546.1<br>Tizu / Rosetta / Bruno: 24,000.5<br>Tizu / Rosetta / Disciple: 22,158.2 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":3,"Common":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.100 - ceiling

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Rosetta: **285,501.7** (259,820-336,156.9)<br>Vaelor: **169,747.2** (119,164.9-195,038.3)<br>Bliss: **169,279** (121,111.7-193,887.3) | Flora: 26,428.3<br>Infernis: 3,485.9<br>Rosetta: 1,177.3 | Tizu: 45,547.2<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Disciple: **4,995,165.7** (4,907,133.7-5,159,551.6)<br>Rosetta / Crinso: **1,868,783.1** (1,614,708-2,128,862.7)<br>Disciple / Vaelor: **1,409,181.6** (1,142,845.4-1,662,943.3) | Flora / Rosetta: 78,496.2<br>Flora / Bliss: 69,738.1<br>Flora / Orvella: 68,622.6 | Tizu / Disciple: 78,759.6<br>Bruno / Elise: 61,050.2<br>Tizu / Thornia: 59,781 |
| 3 | Rosetta / Bliss / Disciple: **15,309,608.9** (14,826,915.2-16,274,996.1)<br>Rosetta / Crinso / Disciple: **14,768,686.6** (12,078,414.8-16,138,402.1)<br>Aurora / Bliss / Disciple: **10,087,671** (9,315,228.8-10,900,361.1) | Flora / Bliss / Orvella: 135,132.1<br>Flora / Rosetta / Razor: 134,868.9<br>Flora / Rosetta / Orvella: 131,306.8 | Rosetta / Bruno / Vaelor: 106,698.6<br>Rosetta / Atmoso / Bruno: 105,507.3<br>Rosetta / Bruno / Elise: 105,502.3 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":488400,"calamiticTokens":0,"rarities":{"Legendary":3,"Rare":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.105 - floor

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Vaelor: **1,730.6** (1,666.7-1,858.6)<br>Bliss: **1,707.9** (1,582.7-1,770.6)<br>Crinso: **1,666.6** (1,544.3-1,727.8) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **3,373.3** (2,873.6-3,809)<br>Crinso / Vaelor: **3,330.5** (2,844.1-3,752.9)<br>Crinso / Bliss: **3,314.9** (2,751.2-3,878.6) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **5,415.4** (5,348.9-5,536.3)<br>Bliss / Elise / Vaelor: **5,372.1** (5,307.1-5,490.1)<br>Crinso / Bliss / Elise: **5,370.7** (5,175.4-5,560.1) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":0,"calamiticTokens":0,"rarities":{},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.105 - unlucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Bliss: **2,643.3** (2,389.7-2,897)<br>Vaelor: **2,595.3** (2,509-2,768)<br>Crinso: **2,580.3** (2,332.7-2,828) | Infernis: 0<br>Tizu: 0<br>Flora: 0 | Infernis: 0<br>Tizu: 0<br>Flora: 0 |
| 2 | Bliss / Vaelor: **5,746** (5,157.7-6,172.3)<br>Crinso / Vaelor: **5,671** (5,100.7-6,091.3)<br>Elise / Vaelor: **5,596.2** (5,044.2-6,010.4) | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 | Infernis / Tizu: 0<br>Infernis / Flora: 0<br>Infernis / Rosetta: 0 |
| 3 | Crinso / Bliss / Vaelor: **9,003.7** (8,492.3-9,524.3)<br>Bliss / Elise / Vaelor: **8,933** (8,417.6-9,461.8)<br>Crinso / Elise / Vaelor: **8,860** (8,360.6-9,374.8) | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 | Infernis / Tizu / Flora: 0<br>Infernis / Tizu / Rosetta: 0<br>Infernis / Tizu / Thornia: 0 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.105 - planned

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **17,711.2** (16,353.2-19,226.1)<br>Bliss: **9,649.6** (7,962.4-10,493.2)<br>Vaelor: **8,333** (7,429.7-9,495.3) | Flora: 3,695.6<br>Infernis: 0<br>Tizu: 0 | Tizu: 4,551.4<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Vaelor: **27,368.9** (25,442.1-30,142.8)<br>Infernis / Bliss: **26,813.8** (25,682.3-27,379.6)<br>Infernis / Crinso: **26,527.3** (25,447.7-28,296.3) | Flora / Orvella: 9,530.8<br>Flora / Razor: 9,336.3<br>Flora / Bruno: 9,239 | Tizu / Disciple: 6,144.4<br>Tizu / Flora: 4,551.4<br>Tizu / Thornia: 4,551.4 |
| 3 | Infernis / Rosetta / Vaelor: **38,981.1** (37,158.4-40,001.1)<br>Infernis / Bliss / Vaelor: **38,768.1** (37,030.4-41,096.3)<br>Infernis / Crinso / Vaelor: **38,559.3** (37,261.8-39,217.7) | Flora / Disciple / Orvella: 15,489.7<br>Flora / Disciple / Razor: 15,277.5<br>Flora / Bruno / Disciple: 15,171.4 | Tizu / Flora / Disciple: 6,144.4<br>Tizu / Thornia / Disciple: 6,144.4<br>Tizu / Crinso / Disciple: 6,144.4 |

Top solo gear budget (distinct account unlocks): {"prismatica":10700,"components":0,"calamiticTokens":0,"rarities":{"Common":8},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.105 - farmed

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **113,136.1** (93,744.3-145,421.8)<br>Bliss: **47,005.1** (43,680.1-52,655.2)<br>Nerithe: **45,428.3** (40,373.9-48,390.1) | Flora: 7,671.5<br>Infernis: 0<br>Tizu: 0 | Tizu: 17,729.7<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Bliss: **161,799.8** (151,151.1-174,868.6)<br>Infernis / Crinso: **145,321** (134,047.2-153,964.2)<br>Infernis / Nerithe: **144,100.8** (131,756-159,158.6) | Flora / Razor: 19,380.6<br>Flora / Thornia: 18,976.8<br>Tizu / Flora: 18,169.3 | Tizu / Disciple: 23,608.4<br>Tizu / Flora: 17,729.7<br>Tizu / Thornia: 17,729.7 |
| 3 | Infernis / Bliss / Nerithe: **243,610.6** (207,647.2-264,861.8)<br>Infernis / Crinso / Bliss: **239,486.6** (206,958.9-265,729.2)<br>Infernis / Bliss / Vaelor: **222,784.4** (189,141-247,033.8) | Tizu / Flora / Razor: 29,878.4<br>Flora / Bliss / Razor: 29,734.9<br>Tizu / Flora / Thornia: 29,474.7 | Tizu / Flora / Disciple: 23,608.4<br>Tizu / Atmoso / Disciple: 23,608.4<br>Tizu / Aurora / Disciple: 23,608.4 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":5,"Common":1,"Rare":2},"masters":0}. Does not include leveling, fodder or recruitment.

### Lv.105 - lucky

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Infernis: **52,873.4** (47,543.1-60,547.6)<br>Vaelor: **35,243.2** (28,816-41,670.4)<br>Bliss: **29,885.6** (24,675.7-32,891.3) | Flora: 14,398.4<br>Infernis: 1,809.5<br>Rosetta: 147.9 | Tizu: 8,777.3<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Rosetta: **266,511.8** (253,406.3-286,446.8)<br>Rosetta / Crinso: **254,630.9** (195,216-307,361.1)<br>Rosetta / Vaelor: **243,931** (219,376.3-267,317) | Flora / Rosetta: 52,989.4<br>Flora / Orvella: 41,128<br>Flora / Atmoso: 40,111.9 | Tizu / Orvella: 17,183.1<br>Tizu / Flora: 14,288.7<br>Tizu / Bruno: 13,122.3 |
| 3 | Rosetta / Disciple / Vaelor: **1,310,894** (1,176,005.4-1,395,425.4)<br>Rosetta / Bliss / Disciple: **1,298,843.4** (1,277,366.4-1,341,797.4)<br>Infernis / Rosetta / Disciple: **1,212,947.6** (1,178,999.6-1,257,865.4) | Flora / Rosetta / Orvella: 112,252.4<br>Flora / Rosetta / Aurora: 95,515.5<br>Flora / Rosetta / Bruno: 90,724.4 | Tizu / Rosetta / Bruno: 29,206.9<br>Tizu / Rosetta / Orvella: 27,786.7<br>Tizu / Rosetta / Disciple: 22,865.3 |

Top solo gear budget (distinct account unlocks): {"prismatica":1000,"components":0,"calamiticTokens":0,"rarities":{"Legendary":3,"Common":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

### Lv.105 - ceiling

| Slots | Top sustained output (DPR; seed range) | Top healing (HPR) | Top shield creation (SPR) |
|---:|---|---|---|
| 1 | Rosetta: **303,478.8** (276,012.8-357,670.6)<br>Infernis: **181,120.1** (165,807-196,676.4)<br>Bliss: **180,884** (129,206.6-207,270.9) | Flora: 27,271.8<br>Infernis: 3,597.4<br>Rosetta: 1,214.9 | Tizu: 48,011.6<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Disciple: **5,428,844.8** (5,335,243.6-5,606,798.6)<br>Rosetta / Crinso: **1,999,058.8** (1,726,632.8-2,278,192.7)<br>Disciple / Vaelor: **1,525,250.6** (1,236,249.1-1,800,959) | Flora / Rosetta: 81,001.1<br>Flora / Bliss: 72,338.8<br>Flora / Orvella: 70,812.7 | Tizu / Disciple: 83,467.9<br>Tizu / Aurora: 66,008<br>Bruno / Elise: 64,532 |
| 3 | Rosetta / Bliss / Disciple: **16,754,038.8** (16,223,072.9-17,815,970.6)<br>Rosetta / Crinso / Disciple: **16,070,187.6** (13,142,230.8-17,560,473.9)<br>Aurora / Bliss / Disciple: **10,970,535.4** (10,129,047.4-11,855,590.6) | Flora / Bliss / Orvella: 140,330<br>Flora / Rosetta / Razor: 139,173.2<br>Flora / Rosetta / Orvella: 135,497.2 | Atmoso / Aurora / Bruno: 114,637.5<br>Aurora / Bruno / Vaelor: 114,637.5<br>Rosetta / Bruno / Vaelor: 112,864 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":488400,"calamiticTokens":0,"rarities":{"Legendary":3,"Rare":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

## Additional equipped stats at level105

Core stat tables above are naked. These are the actual sampled ceiling loadouts, before situational combat buffs. The four additional Phase0 stats start at Skill Power100%, Duration0 extra turns, Efficiency0%, Gauge Gain100% and do not scale with level; equipment changes them. Efficiency remains subject to the live50% cap and action-specific Gauge floors.

| Element-Bearer | Equipped HP / ATK / DEF | Skill Power | Duration | Efficiency | Gauge gain |
|---|---|---:|---:|---:|---:|
| Infernis | 31,743.3 /2,741.5 /198 | 790% | 0 | 0% | 145.5% |
| Tizu | 29,948.8 /2,910 /737.9 | 712.5% | 0 | 45% | 110.5% |
| Flora | 45,453 /1,649 /225.5 | 947.5% | 0 | 30% | 213% |
| Rosetta | 45,559.7 /2,215.8 /417.7 | 985% | 0 | 30% | 230.5% |
| Thornia | 43,965.3 /3,852.7 /514.8 | 827.5% | 0 | 50% | 110.5% |
| Crinso | 27,714.7 /5,095.5 /222.2 | 557.5% | 0 | 50% | 110.5% |
| Atmoso | 23,613.4 /6,180.5 /178.2 | 535% | 0 | 37.5% | 163% |
| Aurora | 47,445.1 /1,649 /440.3 | 955% | 0 | 30% | 230.5% |
| Bliss | 42,522.4 /3,030 /379.7 | 872.5% | 0 | 30% | 230.5% |
| Bruno | 61,337.3 /1,916.4 /649.9 | 1,210% | 0 | 30% | 148% |
| Disciple | 34,192.5 /3,492 /271.6 | 722.5% | 0 | 50% | 100% |
| Elise | 22,461.6 /6,678.4 /158.4 | 507.5% | 0 | 37.5% | 163% |
| Razor | 46,238.7 /3,977 /469.1 | 865% | 0 | 50% | 140.5% |
| Nerithe | 27,069.1 /4,607.5 /484.5 | 632.5% | 0 | 45% | 110.5% |
| Orvella | 72,568.1 /1,649 /563.7 | 1,397.5% | 0 | 30% | 148% |
| Vaelor | 24,189.4 /7,786.1 /217.8 | 532.5% | 0 | 37.5% | 163% |

## Role-composed squads, not only damage winners

These are contrasting team designs to inspect on paper, not validated enemy-clear recommendations. Team slots matter: support provides action economy or mitigation that a zero-pressure damage ranking does not value. HPR/SPR use the separate support rotation and cannot be promised alongside the listed output DPR.

- **Infernis / Tizu / Flora:** Damage / barrier / delayed healing; two additional starter pulls required.
- **Infernis / Atmoso / Elise:** Five-star damage-and-delayed-output squad; little native sustain.
- **Tizu / Flora / Razor:** Barrier / delayed healing / revenge tank; Wounds are NOT fed in this lab.
- **Infernis / Bliss / Disciple:** Persistent damage / action-order hybrid / next-action amplification.
- **Rosetta / Thornia / Crinso:** Rose coordination / traps / alternating combo; trap pressure absent.
- **Rosetta / Bliss / Disciple:** Quarry hit/Gauge feedback plus order-sensitive offense/support.

| Level / build | Team | Output DPR | Support HPR / SPR | Combined maximum HP |
|---|---|---:|---|---:|
| 0 /planned | Infernis / Tizu / Flora | 598.1 | 537.4 /158.8 | 1,675 |
| 0 /planned | Infernis / Atmoso / Elise | 629.7 | 0 /0 | 1,550 |
| 0 /planned | Tizu / Flora / Razor | 409.3 | 593.5 /187.7 | 1,850 |
| 0 /planned | Infernis / Bliss / Disciple | 685.2 | 24.2 /0 | 1,675 |
| 0 /planned | Rosetta / Thornia / Crinso | 569 | 0 /7.9 | 1,775 |
| 0 /planned | Rosetta / Bliss / Disciple | 552.1 | 27.8 /7.5 | 1,687.5 |
| 0 /ceiling | Infernis / Tizu / Flora | 4,243.2 | 2,590.6 /1,014.7 | 4,745.5 |
| 0 /ceiling | Infernis / Atmoso / Elise | 9,557.9 | 417.7 /0 | 3,725 |
| 0 /ceiling | Tizu / Flora / Razor | 2,547.7 | 2,537.1 /1,133.2 | 5,074.3 |
| 0 /ceiling | Infernis / Bliss / Disciple | 9,730.7 | 818.4 /0 | 5,327.5 |
| 0 /ceiling | Rosetta / Thornia / Crinso | 35,703.2 | 661.3 /24.7 | 5,567 |
| 0 /ceiling | Rosetta / Bliss / Disciple | 66,013.4 | 669.2 /18.3 | 5,531.6 |
| 20 /planned | Infernis / Tizu / Flora | 2,747.1 | 2,149.6 /635.3 | 6,700 |
| 20 /planned | Infernis / Atmoso / Elise | 2,867.6 | 0 /0 | 6,200 |
| 20 /planned | Tizu / Flora / Razor | 1,696.6 | 2,374.2 /750.8 | 7,400 |
| 20 /planned | Infernis / Bliss / Disciple | 3,112.9 | 96.8 /0 | 6,700 |
| 20 /planned | Rosetta / Thornia / Crinso | 2,401.3 | 0 /31.6 | 7,100 |
| 20 /planned | Rosetta / Bliss / Disciple | 2,336.6 | 111.4 /30 | 6,750 |
| 20 /ceiling | Infernis / Tizu / Flora | 21,718.1 | 9,264.5 /3,884.5 | 18,406 |
| 20 /ceiling | Infernis / Atmoso / Elise | 50,278.7 | 1,604.6 /0 | 14,156 |
| 20 /ceiling | Tizu / Flora / Razor | 12,556.1 | 8,836.6 /4,986.3 | 19,637 |
| 20 /ceiling | Infernis / Bliss / Disciple | 60,932.1 | 3,606.1 /0 | 20,794 |
| 20 /ceiling | Rosetta / Thornia / Crinso | 127,527.8 | 3,754.7 /95.2 | 21,416 |
| 20 /ceiling | Rosetta / Bliss / Disciple | 307,895 | 2,758.6 /71 | 21,604.5 |
| 40 /planned | Infernis / Tizu / Flora | 6,966.7 | 4,567.9 /1,349.9 | 14,237.5 |
| 40 /planned | Infernis / Atmoso / Elise | 7,010.7 | 0 /0 | 13,175 |
| 40 /planned | Tizu / Flora / Razor | 3,862.3 | 5,045.1 /1,595.3 | 15,725 |
| 40 /planned | Infernis / Bliss / Disciple | 7,698.5 | 205.7 /0 | 14,237.5 |
| 40 /planned | Rosetta / Thornia / Crinso | 5,560.5 | 0 /67.1 | 15,087.5 |
| 40 /planned | Rosetta / Bliss / Disciple | 5,312.2 | 236.7 /63.8 | 14,343.8 |
| 40 /ceiling | Infernis / Tizu / Flora | 67,297.6 | 22,255.5 /11,682.8 | 40,711.6 |
| 40 /ceiling | Infernis / Atmoso / Elise | 151,553.1 | 3,409.4 /0 | 30,081.5 |
| 40 /ceiling | Tizu / Flora / Razor | 37,134.6 | 21,663.7 /13,098.5 | 43,327.5 |
| 40 /ceiling | Infernis / Bliss / Disciple | 233,058.1 | 9,755.6 /0 | 44,187.3 |
| 40 /ceiling | Rosetta / Thornia / Crinso | 402,613.4 | 15,290 /202.3 | 45,509 |
| 40 /ceiling | Rosetta / Bliss / Disciple | 1,255,381.9 | 6,317.1 /150.8 | 45,909.6 |
| 60 /planned | Infernis / Tizu / Flora | 12,176.4 | 6,986.1 /2,064.6 | 21,775 |
| 60 /planned | Infernis / Atmoso / Elise | 12,199.8 | 0 /0 | 20,150 |
| 60 /planned | Tizu / Flora / Razor | 6,264.9 | 7,716 /2,439.9 | 24,050 |
| 60 /planned | Infernis / Bliss / Disciple | 13,734.4 | 314.6 /0 | 21,775 |
| 60 /planned | Rosetta / Thornia / Crinso | 9,311.7 | 0 /102.6 | 23,075 |
| 60 /planned | Rosetta / Bliss / Disciple | 9,399.7 | 362 /97.5 | 21,937.5 |
| 60 /ceiling | Infernis / Tizu / Flora | 169,404.3 | 37,965.6 /26,015.1 | 69,449.2 |
| 60 /ceiling | Infernis / Atmoso / Elise | 358,696.1 | 5,816.8 /0 | 51,315.5 |
| 60 /ceiling | Tizu / Flora / Razor | 94,182.1 | 36,955.8 /29,669.9 | 73,911.6 |
| 60 /ceiling | Infernis / Bliss / Disciple | 720,001.6 | 18,576.5 /0 | 75,378.3 |
| 60 /ceiling | Rosetta / Thornia / Crinso | 1,111,210 | 26,099.2 /345 | 77,633 |
| 60 /ceiling | Rosetta / Bliss / Disciple | 4,257,163.4 | 29,591.7 /257.2 | 78,316.3 |
| 80 /planned | Infernis / Tizu / Flora | 20,437 | 10,210.5 /3,017.4 | 31,825 |
| 80 /planned | Infernis / Atmoso / Elise | 20,219 | 0 /0 | 29,450 |
| 80 /planned | Tizu / Flora / Razor | 9,881.7 | 11,277.3 /3,566.1 | 35,150 |
| 80 /planned | Infernis / Bliss / Disciple | 22,853.7 | 459.8 /0 | 31,825 |
| 80 /planned | Rosetta / Thornia / Crinso | 15,270.2 | 0 /149.9 | 33,725 |
| 80 /planned | Rosetta / Bliss / Disciple | 15,640.3 | 529 /142.5 | 32,062.5 |
| 80 /ceiling | Infernis / Tizu / Flora | 291,285.9 | 57,635.1 /42,188.6 | 91,002.4 |
| 80 /ceiling | Infernis / Atmoso / Elise | 673,489.8 | 7,621.7 /0 | 67,241 |
| 80 /ceiling | Tizu / Flora / Razor | 161,072.4 | 51,179.8 /45,080.4 | 102,359.6 |
| 80 /ceiling | Infernis / Bliss / Disciple | 1,370,612.9 | 27,432.3 /0 | 98,771.5 |
| 80 /ceiling | Rosetta / Thornia / Crinso | 2,097,298.3 | 35,039.8 /479.1 | 107,796.5 |
| 80 /ceiling | Rosetta / Bliss / Disciple | 9,765,951.6 | 39,789.6 /342.7 | 103,903.9 |
| 100 /planned | Infernis / Tizu / Flora | 27,970.3 | 12,628.8 /3,732.1 | 39,362.5 |
| 100 /planned | Infernis / Atmoso / Elise | 27,772.1 | 0 /0 | 36,425 |
| 100 /planned | Tizu / Flora / Razor | 13,098.7 | 13,948.2 /4,410.7 | 43,475 |
| 100 /planned | Infernis / Bliss / Disciple | 31,112 | 568.7 /0 | 39,362.5 |
| 100 /planned | Rosetta / Thornia / Crinso | 20,097.7 | 0 /185.4 | 41,712.5 |
| 100 /planned | Rosetta / Bliss / Disciple | 21,068.7 | 654.3 /176.3 | 39,656.3 |
| 100 /ceiling | Infernis / Tizu / Flora | 451,513.9 | 61,530.5 /53,986.4 | 112,555.6 |
| 100 /ceiling | Infernis / Atmoso / Elise | 923,142.1 | 9,425.6 /0 | 83,166.5 |
| 100 /ceiling | Tizu / Flora / Razor | 243,778.1 | 63,301.4 /63,804.7 | 126,602.7 |
| 100 /ceiling | Infernis / Bliss / Disciple | 2,351,752.6 | 37,753.1 /0 | 122,164.8 |
| 100 /ceiling | Rosetta / Thornia / Crinso | 3,540,568.1 | 15,145.6 /585.5 | 131,741 |
| 100 /ceiling | Rosetta / Bliss / Disciple | 15,309,608.9 | 19,269.9 /564.1 | 126,926.4 |
| 105 /planned | Infernis / Tizu / Flora | 29,619.3 | 13,031.8 /3,851.2 | 40,618.8 |
| 105 /planned | Infernis / Atmoso / Elise | 29,191.1 | 0 /0 | 37,587.5 |
| 105 /planned | Tizu / Flora / Razor | 13,801.4 | 14,393.4 /4,551.4 | 44,862.5 |
| 105 /planned | Infernis / Bliss / Disciple | 32,696.1 | 586.9 /0 | 40,618.8 |
| 105 /planned | Rosetta / Thornia / Crinso | 20,978.9 | 0 /191.3 | 43,043.8 |
| 105 /planned | Rosetta / Bliss / Disciple | 22,040.6 | 675.2 /181.9 | 40,921.9 |
| 105 /ceiling | Infernis / Tizu / Flora | 484,935.8 | 63,494.2 /57,316.4 | 116,147.8 |
| 105 /ceiling | Infernis / Atmoso / Elise | 987,787.8 | 9,726.8 /0 | 85,820.8 |
| 105 /ceiling | Tizu / Flora / Razor | 259,122 | 65,321.6 /67,620.5 | 130,643.2 |
| 105 /ceiling | Infernis / Bliss / Disciple | 2,567,228.3 | 39,708.5 /0 | 126,063.6 |
| 105 /ceiling | Rosetta / Thornia / Crinso | 4,099,054.3 | 10,422.6 /604.2 | 135,945.5 |
| 105 /ceiling | Rosetta / Bliss / Disciple | 16,754,038.8 | 20,074.5 /582.1 | 130,977.3 |

## Tanking and support capacity by character

Tank probe: full HP before a fully funded single action (or none), choosing the action that survives the largest scheduled noncritical post-Defense packet through real incoming hooks. Live stat changes do not grant free healing. No opponent Attack/level is selected. Defense is listed separately; do NOT add it as HP or compare these packets with pre-Defense damage. It is not sustained tanking, and cooldown-based rescue/deferral can inflate one-hit results. Equipment is the sampled output build, not an exhaustive defensive-build search.
The packet uses a fixed non-proc first roll (0.7769), so Stasis is not credited with a lucky save. No test of sustained incoming pressure, enemy Normal evasion or incoming-crit support is implied.

| Lv | Bearer | Planned HPR / SPR | Ceiling HPR / SPR | Ceiling HP / DEF | Precharged shield | One-hit post-DEF packet survived |
|---:|---|---|---|---|---:|---:|
| 0 | Infernis | 0 /0 | 155.4 /0 | 1,375 /26.5 | 0 | none: >=137,500 |
| 0 | Tizu | 0 /187.7 | 0 /753.3 | 1,313 /90 | 1,757.8 | ultimate: 5,582.7 |
| 0 | Flora | 152.4 /0 | 843.1 /0 | 1,686.3 /24.2 | 0 | none: 1,686.5 |
| 0 | Rosetta | 0 /0 | 26 /0 | 1,946.3 /52.3 | 0 | ultimate: 1,946.5 |
| 0 | Thornia | 0 /0 | 0 /0 | 1,645 /59.9 | 0 | ultimate: 1,644.5 |
| 0 | Crinso | 0 /0 | 48 /0 | 1,204.4 /29.9 | 0 | ultimate: 1,204.5 |
| 0 | Atmoso | 0 /0 | 0 /0 | 973.8 /23.8 | 0 | light: 973.5 |
| 0 | Aurora | 0 /0 | 0 /0 | 1,859.8 /50 | 0 | ultimate: 9,297.5 |
| 0 | Bliss | 0 /0 | 0 /0 | 1,816.5 /47.5 | 0 | ultimate: 1,816.5 |
| 0 | Bruno | 0 /0 | 0 /0 | 2,529.4 /79.2 | 0 | skill2: 4,641.3 |
| 0 | Disciple | 0 /0 | 0 /0 | 1,410 /30.8 | 0 | ultimate: 1,409.5 |
| 0 | Elise | 0 /0 | 0 /0 | 926.3 /21.2 | 0 | light: 926.5 |
| 0 | Razor | 0 /0 | 0 /0 | 1,616.8 /60.3 | 0 | skill2: 3,826 |
| 0 | Nerithe | 0 /0 | 0 /0 | 1,186.8 /67.9 | 0 | ultimate: 1,186.5 |
| 0 | Orvella | 0 /0 | 0 /0 | 2,827.5 /60.5 | 0 | skill2: 3,534.5 |
| 0 | Vaelor | 0 /0 | 0 /0 | 997.5 /29.1 | 0 | light: 997.5 |
| 20 | Infernis | 0 /0 | 593.1 /0 | 5,236 /56.1 | 0 | none: >=523,600 |
| 20 | Tizu | 0 /750.8 | 0 /3,251.1 | 4,940 /209 | 7,586 | ultimate: 22,773.6 |
| 20 | Flora | 609.6 /0 | 3,372.5 /0 | 6,745 /63.9 | 0 | none: 6,744.5 |
| 20 | Rosetta | 0 /0 | 50.1 /0 | 7,515 /118.3 | 0 | none: 7,514.5 |
| 20 | Thornia | 0 /0 | 0 /0 | 6,244 /127.9 | 0 | none: 6,243.5 |
| 20 | Crinso | 0 /0 | 183 /0 | 4,571.5 /62.9 | 0 | none: 4,571.5 |
| 20 | Atmoso | 0 /0 | 0 /0 | 3,895 /50.5 | 0 | none: 3,894.5 |
| 20 | Aurora | 0 /0 | 0 /0 | 7,181 /114.1 | 0 | skill1: 35,902.5 |
| 20 | Bliss | 0 /0 | 0 /0 | 7,014 /107.5 | 0 | none: 7,013.5 |
| 20 | Bruno | 0 /0 | 0 /0 | 10,117.5 /184.1 | 0 | skill2: 34,887.9 |
| 20 | Disciple | 0 /0 | 0 /0 | 5,640 /81.3 | 0 | ultimate: 5,639.5 |
| 20 | Elise | 0 /0 | 0 /0 | 3,705 /44.9 | 0 | none: 3,704.5 |
| 20 | Razor | 0 /0 | 0 /0 | 6,467 /132.9 | 0 | skill2: 29,393.2 |
| 20 | Nerithe | 0 /0 | 0 /0 | 4,465 /156.1 | 0 | none: 4,464.5 |
| 20 | Orvella | 0 /0 | 0 /0 | 11,310 /159.7 | 0 | skill2: 14,137.5 |
| 20 | Vaelor | 0 /0 | 0 /0 | 3,990 /61.7 | 0 | none: 3,989.5 |
| 40 | Infernis | 0 /0 | 1,260.8 /0 | 11,126.5 /95.1 | 0 | none: >=1,112,650 |
| 40 | Tizu | 0 /1,595.3 | 0 /9,211.6 | 10,497.5 /354.3 | 21,493.6 | ultimate: 58,166.4 |
| 40 | Flora | 1,295.4 /0 | 9,559.2 /0 | 15,932 /108.2 | 0 | none: 15,931.5 |
| 40 | Rosetta | 0 /0 | 212.9 /0 | 15,969.4 /200.5 | 0 | none: 15,969.5 |
| 40 | Thornia | 0 /0 | 0 /0 | 13,268.5 /216.7 | 0 | none: 13,268.5 |
| 40 | Crinso | 0 /0 | 0 /0 | 9,714.4 /106.7 | 0 | none: 9,714.5 |
| 40 | Atmoso | 0 /0 | 0 /0 | 8,276.9 /85.5 | 0 | none: 8,276.5 |
| 40 | Aurora | 0 /0 | 0 /0 | 15,259.6 /193.5 | 0 | skill1: 76,297.5 |
| 40 | Bliss | 0 /0 | 0 /0 | 14,904.8 /182.3 | 0 | none: 14,904.5 |
| 40 | Bruno | 0 /0 | 0 /0 | 21,499.7 /312 | 0 | skill2: 107,497.5 |
| 40 | Disciple | 0 /0 | 0 /0 | 11,985 /137.8 | 0 | ultimate: 11,984.5 |
| 40 | Elise | 0 /0 | 0 /0 | 7,873.1 /76 | 0 | none: 7,873.5 |
| 40 | Razor | 0 /0 | 0 /0 | 13,742.4 /225.2 | 0 | skill2: 68,712.5 |
| 40 | Nerithe | 0 /0 | 0 /0 | 9,488.1 /232.6 | 0 | none: 9,488.5 |
| 40 | Orvella | 0 /0 | 0 /0 | 24,033.8 /270.6 | 0 | skill2: 30,042.5 |
| 40 | Vaelor | 0 /0 | 0 /0 | 8,478.8 /104.6 | 0 | none: 8,478.5 |
| 60 | Infernis | 0 /0 | 2,151.4 /0 | 18,980.5 /138.1 | 0 | none: >=1,898,050 |
| 60 | Tizu | 0 /2,439.9 | 0 /20,548.9 | 17,907.5 /514.9 | 47,947.3 | ultimate: 119,735.5 |
| 60 | Flora | 1,981.1 /0 | 16,306.8 /0 | 27,178.1 /157.3 | 0 | none: 27,178.5 |
| 60 | Rosetta | 0 /0 | 544.8 /0 | 27,241.9 /291.4 | 0 | none: 27,241.5 |
| 60 | Thornia | 0 /0 | 0 /0 | 22,634.5 /315 | 0 | none: 22,634.5 |
| 60 | Crinso | 0 /0 | 0 /0 | 16,571.7 /155 | 0 | none: 16,571.5 |
| 60 | Atmoso | 0 /0 | 0 /0 | 14,119.4 /124.3 | 0 | none: 14,119.5 |
| 60 | Aurora | 0 /0 | 0 /0 | 26,031.1 /281.2 | 0 | skill1: 130,157.5 |
| 60 | Bliss | 0 /0 | 0 /0 | 25,425.8 /264.9 | 0 | none: 25,425.5 |
| 60 | Bruno | 0 /0 | 0 /0 | 36,675.9 /453.4 | 0 | skill2: 183,377.5 |
| 60 | Disciple | 0 /0 | 0 /0 | 20,445 /200.2 | 0 | ultimate: 20,444.5 |
| 60 | Elise | 0 /0 | 0 /0 | 13,430.6 /110.5 | 0 | none: 13,430.5 |
| 60 | Razor | 0 /0 | 0 /0 | 23,442.9 /327.3 | 0 | skill2: 117,212.5 |
| 60 | Nerithe | 0 /0 | 0 /0 | 16,185.6 /338 | 0 | none: 16,185.5 |
| 60 | Orvella | 0 /0 | 0 /0 | 43,391.3 /393.3 | 0 | skill2: 54,239.5 |
| 60 | Vaelor | 0 /0 | 0 /0 | 14,463.8 /152 | 0 | none: 14,463.5 |
| 80 | Infernis | 0 /0 | 2,819.2 /0 | 24,871 /166.9 | 0 | none: >=2,487,100 |
| 80 | Tizu | 0 /3,566.1 | 0 /32,073.7 | 23,465 /622.1 | 74,838.7 | ultimate: 178,733.6 |
| 80 | Flora | 2,895.5 /0 | 21,367.6 /0 | 35,612.7 /190.1 | 0 | none: 35,612.5 |
| 80 | Rosetta | 0 /0 | 493 /0 | 35,696.3 /352.1 | 0 | light: 35,696.5 |
| 80 | Thornia | 0 /0 | 0 /0 | 34,447 /434 | 0 | none: 34,446.5 |
| 80 | Crinso | 0 /0 | 0 /0 | 21,714.6 /187.3 | 0 | none: 21,714.5 |
| 80 | Atmoso | 0 /0 | 0 /0 | 18,501.3 /150.2 | 0 | none: 18,501.5 |
| 80 | Aurora | 0 /0 | 0 /0 | 35,131 /320.1 | 0 | skill1: 175,652.5 |
| 80 | Bliss | 0 /0 | 0 /0 | 33,316.5 /320.1 | 0 | none: 33,316.5 |
| 80 | Bruno | 0 /0 | 0 /0 | 48,058.1 /547.9 | 0 | skill2: 240,292.5 |
| 80 | Disciple | 0 /0 | 0 /0 | 26,790 /229 | 0 | none: 25,421.5 |
| 80 | Elise | 0 /0 | 0 /0 | 17,598.8 /133.5 | 0 | none: 17,598.5 |
| 80 | Razor | 0 /0 | 0 /0 | 36,228.3 /395.5 | 0 | skill2: 181,142.5 |
| 80 | Nerithe | 0 /0 | 0 /0 | 21,208.8 /408.4 | 0 | none: 21,208.5 |
| 80 | Orvella | 0 /0 | 0 /0 | 56,857.5 /475.2 | 0 | skill2: 71,071.5 |
| 80 | Vaelor | 0 /0 | 0 /0 | 18,952.5 /183.6 | 0 | none: 18,952.5 |
| 100 | Infernis | 0 /0 | 3,485.9 /0 | 30,761.5 /193.7 | 0 | none: >=3,076,150 |
| 100 | Tizu | 0 /4,410.7 | 0 /45,547.2 | 29,022.5 /721.9 | 106,276.8 | ultimate: 245,999.1 |
| 100 | Flora | 3,581.3 /0 | 26,428.3 /0 | 44,047.2 /220.6 | 0 | none: 44,047.5 |
| 100 | Rosetta | 0 /0 | 1,177.3 /0 | 44,150.6 /408.6 | 0 | none: 44,150.5 |
| 100 | Thornia | 0 /0 | 0 /0 | 42,605.5 /503.6 | 0 | none: 42,605.5 |
| 100 | Crinso | 0 /0 | 0 /0 | 26,857.6 /217.4 | 0 | none: 26,857.5 |
| 100 | Atmoso | 0 /0 | 0 /0 | 22,883.1 /174.3 | 0 | none: 22,883.5 |
| 100 | Aurora | 0 /0 | 0 /0 | 45,977.8 /430.7 | 0 | skill1: 229,887.5 |
| 100 | Bliss | 0 /0 | 0 /0 | 41,207.3 /371.4 | 0 | none: 41,207.5 |
| 100 | Bruno | 0 /0 | 0 /0 | 59,440.3 /635.8 | 0 | skill2: 297,202.5 |
| 100 | Disciple | 0 /0 | 0 /0 | 33,135 /265.7 | 0 | none: 31,442.5 |
| 100 | Elise | 0 /0 | 0 /0 | 21,766.9 /155 | 0 | none: 21,766.5 |
| 100 | Razor | 0 /0 | 0 /0 | 44,808.6 /458.9 | 0 | skill2: 224,042.5 |
| 100 | Nerithe | 0 /0 | 0 /0 | 26,231.9 /474 | 0 | none: 26,231.5 |
| 100 | Orvella | 0 /0 | 0 /0 | 70,323.8 /551.4 | 0 | skill2: 87,904.5 |
| 100 | Vaelor | 0 /0 | 0 /0 | 23,441.3 /213.1 | 0 | none: 23,441.5 |
| 105 | Infernis | 0 /0 | 3,597.4 /0 | 31,743.3 /198 | 0 | none: >=3,174,325 |
| 105 | Tizu | 0 /4,551.4 | 0 /48,011.6 | 29,948.8 /737.9 | 112,027 | ultimate: 258,137.3 |
| 105 | Flora | 3,695.6 /0 | 27,271.8 /0 | 45,453 /225.5 | 0 | none: 45,452.5 |
| 105 | Rosetta | 0 /0 | 1,214.9 /0 | 45,559.7 /417.7 | 0 | none: 45,559.5 |
| 105 | Thornia | 0 /0 | 0 /0 | 43,965.3 /514.8 | 0 | none: 43,965.5 |
| 105 | Crinso | 0 /0 | 0 /0 | 27,714.7 /222.2 | 0 | none: 27,714.5 |
| 105 | Atmoso | 0 /0 | 0 /0 | 23,613.4 /178.2 | 0 | none: 23,613.5 |
| 105 | Aurora | 0 /0 | 0 /0 | 47,445.1 /440.3 | 0 | skill1: 237,227.5 |
| 105 | Bliss | 0 /0 | 0 /0 | 42,522.4 /379.7 | 0 | none: 42,522.5 |
| 105 | Bruno | 0 /0 | 0 /0 | 61,337.3 /649.9 | 0 | skill2: 306,687.5 |
| 105 | Disciple | 0 /0 | 0 /0 | 34,192.5 /271.6 | 0 | none: 32,446.5 |
| 105 | Elise | 0 /0 | 0 /0 | 22,461.6 /158.4 | 0 | none: 22,461.5 |
| 105 | Razor | 0 /0 | 0 /0 | 46,238.7 /469.1 | 0 | skill2: 231,192.5 |
| 105 | Nerithe | 0 /0 | 0 /0 | 27,069.1 /484.5 | 0 | none: 27,069.5 |
| 105 | Orvella | 0 /0 | 0 /0 | 72,568.1 /563.7 | 0 | skill2: 90,710.5 |
| 105 | Vaelor | 0 /0 | 0 /0 | 24,189.4 /217.8 | 0 | none: 24,189.5 |

## Exact sampled loadouts and alternatives

Every member has eight ordinary slots. Upgrades are +0 except ceiling (+5); Masters never upgrade. For lucky/ceiling, all three personal Masters were screened, plus three ceiling ordinary packages. Screening is solo sustained offense, not a global team optimum. Other-role alternatives appear below.

### floor gear
- **Infernis:** Empty.
- **Tizu:** Empty.
- **Flora:** Empty.
- **Rosetta:** Empty.
- **Thornia:** Empty.
- **Crinso:** Empty.
- **Atmoso:** Empty.
- **Aurora:** Empty.
- **Bliss:** Empty.
- **Bruno:** Empty.
- **Disciple:** Empty.
- **Elise:** Empty.
- **Razor:** Empty.
- **Nerithe:** Empty.
- **Orvella:** Empty.
- **Vaelor:** Empty.

### unlucky gear
- **Infernis:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Tizu:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Flora:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Rosetta:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Thornia:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Crinso:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Atmoso:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Aurora:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Bliss:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Bruno:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Disciple:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Elise:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Razor:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Nerithe:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Orvella:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Vaelor:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.

### planned gear
- **Infernis:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Tizu:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Flora:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Rosetta:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Thornia:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Crinso:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Atmoso:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Aurora:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Bliss:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Bruno:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Disciple:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Elise:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Razor:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Nerithe:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Orvella:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.
- **Vaelor:** Vigil Core; Bastion Lock; Parallax Relay; Crosspin Governor; Fieldbrace Coupler; Siegebound Drive; Reserve Torque Crank; Prism Splinter Socket.

### farmed gear
- **Infernis:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Tizu:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Flora:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Springwell Pump; Starvein Conductor; Coilfeed Ratchet.
- **Rosetta:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Thornia:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Crinso:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Atmoso:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Aurora:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Bliss:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Bruno:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Disciple:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Elise:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Razor:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Nerithe:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Orvella:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.
- **Vaelor:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Glassroot Gimbal; Hammerbalance Link; Starvein Conductor; Worldbreaker Drive.

### lucky gear
- **Infernis:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Cinder Testament; Phoenix Lifeforge; Phoenix Reactor; Pyre Census Requiem; Master: master-ember-3.
- **Tizu:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Undertide Chronometer; Leviathan Ward Loom; Abyssal Clearwater Parliament; Leviathan Mercy Reflector; Master: master-tide-3.
- **Flora:** Immortal Vessel; Citadel Spine; Springwell Pump; Coilfeed Ratchet; Verdant Covenant; Worldgrove Covercharge Heart; Worldroot Triage Sanctuary; Worldroot Graft Coronation; Master: master-sprout-1.
- **Rosetta:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Stillhour Carillon; Firstlight Concordance; Aegis Covenant Crown; Accord Seraph Sanctuary; Master: master-rosetta-1.
- **Thornia:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-thornia-3.
- **Crinso:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-crinso-1.
- **Atmoso:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Griffin Turbine; Skythread Rudder; Stormstep Dynamo; Thunderbird Coil; Master: master-atmoso-3.
- **Aurora:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Stillhour Carillon; Firstlight Concordance; Aegis Covenant Crown; Accord Seraph Sanctuary; Master: master-aurora-2.
- **Bliss:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Stillhour Carillon; Firstlight Concordance; Aegis Covenant Crown; Accord Seraph Sanctuary; Master: master-bliss-2.
- **Bruno:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Verdant Covenant; Worldgrove Covercharge Heart; Worldroot Triage Sanctuary; Worldroot Graft Coronation; Master: master-bruno-3.
- **Disciple:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-disciple-3.
- **Elise:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Griffin Turbine; Skythread Rudder; Stormstep Dynamo; Thunderbird Coil; Master: master-elise-2.
- **Razor:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-razor-3.
- **Nerithe:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Undertide Chronometer; Leviathan Ward Loom; Abyssal Clearwater Parliament; Leviathan Mercy Reflector; Master: master-nerithe-2.
- **Orvella:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Verdant Covenant; Worldgrove Covercharge Heart; Worldroot Triage Sanctuary; Worldroot Graft Coronation; Master: master-orvella-2.
- **Vaelor:** Immortal Vessel; Citadel Spine; Bastion Lock; Horizon Heartcase; Griffin Turbine; Skythread Rudder; Stormstep Dynamo; Thunderbird Coil; Master: master-vaelor-3.

### ceiling gear
- **Infernis:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Cinder Testament; Phoenix Lifeforge; Phoenix Reactor; Pyre Census Requiem; Master: master-ember-3.
- **Tizu:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Undertide Chronometer; Leviathan Ward Loom; Abyssal Clearwater Parliament; Leviathan Mercy Reflector; Master: master-tide-3.
- **Flora:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Verdant Covenant; Worldgrove Covercharge Heart; Worldroot Triage Sanctuary; Worldroot Graft Coronation; Master: master-sprout-3.
- **Rosetta:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Stillhour Carillon; Firstlight Concordance; Aegis Covenant Crown; Accord Seraph Sanctuary; Master: master-rosetta-3.
- **Thornia:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-thornia-2.
- **Crinso:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-crinso-1.
- **Atmoso:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Griffin Turbine; Skythread Rudder; Stormstep Dynamo; Thunderbird Coil; Master: master-atmoso-3.
- **Aurora:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Stillhour Carillon; Firstlight Concordance; Aegis Covenant Crown; Accord Seraph Sanctuary; Master: master-aurora-1.
- **Bliss:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Stillhour Carillon; Firstlight Concordance; Aegis Covenant Crown; Accord Seraph Sanctuary; Master: master-bliss-2.
- **Bruno:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Verdant Covenant; Worldgrove Covercharge Heart; Worldroot Triage Sanctuary; Worldroot Graft Coronation; Master: master-bruno-3.
- **Disciple:** Immortal Vessel; Horizon Heartcase; Glassroot Gimbal; Stasis Reliquary; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-disciple-3.
- **Elise:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Griffin Turbine; Skythread Rudder; Stormstep Dynamo; Thunderbird Coil; Master: master-elise-2.
- **Razor:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-razor-1.
- **Nerithe:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Undertide Chronometer; Leviathan Ward Loom; Abyssal Clearwater Parliament; Leviathan Mercy Reflector; Master: master-nerithe-1.
- **Orvella:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Verdant Covenant; Worldgrove Covercharge Heart; Worldroot Triage Sanctuary; Worldroot Graft Coronation; Master: master-orvella-1.
- **Vaelor:** Citadel Spine; Immortal Vessel; Glassroot Gimbal; Stasis Reliquary; Griffin Turbine; Skythread Rudder; Stormstep Dynamo; Thunderbird Coil; Master: master-vaelor-1.

### Ceiling Master/package selection at each level

| Lv | Bearer | Output choice (variant / Master) | Highest measured healing alternative | Largest-HP alternative |
|---:|---|---|---|---|
| 0 | Infernis | standard /master-ember-3 | standard /master-ember-1: 195.7 HPR | standard /master-ember-1: 1,507 HP |
| 0 | Tizu | standard /master-tide-3 | standard /master-tide-3: 0 HPR | standard /master-tide-3: 1,313 HP |
| 0 | Flora | standard /master-sprout-1 | glassroot /master-sprout-3: 1,158.8 HPR | glassroot /master-sprout-3: 1,931.3 HP |
| 0 | Rosetta | standard /master-rosetta-1 | standard /master-rosetta-1: 26 HPR | standard /master-rosetta-2: 2,126.3 HP |
| 0 | Thornia | standard /master-thornia-1 | standard /master-thornia-1: 0 HPR | standard /master-thornia-2: 1,897 HP |
| 0 | Crinso | standard /master-crinso-3 | standard /master-crinso-3: 48 HPR | standard /master-crinso-3: 1,204.4 HP |
| 0 | Atmoso | standard /master-atmoso-3 | standard /master-atmoso-3: 0 HPR | standard /master-atmoso-2: 1,148 HP |
| 0 | Aurora | standard /master-aurora-2 | standard /master-aurora-2: 0 HPR | standard /master-aurora-1: 2,021 HP |
| 0 | Bliss | standard /master-bliss-2 | standard /master-bliss-2: 0 HPR | standard /master-bliss-2: 1,816.5 HP |
| 0 | Bruno | standard /master-bruno-3 | standard /master-bruno-3: 0 HPR | standard /master-bruno-2: 2,800.1 HP |
| 0 | Disciple | glassroot /master-disciple-3 | glassroot /master-disciple-3: 0 HPR | glassroot /master-disciple-1: 1,590 HP |
| 0 | Elise | standard /master-elise-2 | standard /master-elise-2: 0 HPR | standard /master-elise-1: 1,072.5 HP |
| 0 | Razor | standard /master-razor-3 | standard /master-razor-3: 0 HPR | standard /master-razor-1: 1,993.8 HP |
| 0 | Nerithe | standard /master-nerithe-2 | standard /master-nerithe-2: 0 HPR | standard /master-nerithe-2: 1,186.8 HP |
| 0 | Orvella | hybrid /master-orvella-2 | hybrid /master-orvella-2: 0 HPR | standard /master-orvella-1: 3,082.5 HP |
| 0 | Vaelor | standard /master-vaelor-1 | standard /master-vaelor-1: 0 HPR | standard /master-vaelor-1: 1,060.5 HP |
| 20 | Infernis | hybrid /master-ember-3 | standard /master-ember-1: 900.9 HPR | standard /master-ember-1: 6,028 HP |
| 20 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | standard /master-tide-3: 5,252 HP |
| 20 | Flora | hybrid /master-sprout-1 | glassroot /master-sprout-3: 4,635.2 HPR | glassroot /master-sprout-3: 7,725.4 HP |
| 20 | Rosetta | hybrid /master-rosetta-1 | glassroot /master-rosetta-3: 103.8 HPR | standard /master-rosetta-2: 8,505 HP |
| 20 | Thornia | hybrid /master-thornia-1 | hybrid /master-thornia-1: 0 HPR | standard /master-thornia-2: 7,588 HP |
| 20 | Crinso | hybrid /master-crinso-3 | standard /master-crinso-3: 192.5 HPR | standard /master-crinso-3: 4,817.5 HP |
| 20 | Atmoso | hybrid /master-atmoso-3 | hybrid /master-atmoso-3: 0 HPR | standard /master-atmoso-2: 4,592 HP |
| 20 | Aurora | hybrid /master-aurora-2 | hybrid /master-aurora-2: 0 HPR | standard /master-aurora-1: 8,084 HP |
| 20 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | standard /master-bliss-2: 7,266 HP |
| 20 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | standard /master-bruno-2: 11,200.5 HP |
| 20 | Disciple | glassroot /master-disciple-3 | glassroot /master-disciple-3: 0 HPR | glassroot /master-disciple-1: 6,360 HP |
| 20 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | standard /master-elise-1: 4,290 HP |
| 20 | Razor | hybrid /master-razor-3 | hybrid /master-razor-3: 0 HPR | glassroot /master-razor-1: 7,975 HP |
| 20 | Nerithe | hybrid /master-nerithe-2 | hybrid /master-nerithe-2: 0 HPR | standard /master-nerithe-2: 4,747 HP |
| 20 | Orvella | hybrid /master-orvella-2 | hybrid /master-orvella-2: 0 HPR | standard /master-orvella-1: 12,330 HP |
| 20 | Vaelor | hybrid /master-vaelor-1 | hybrid /master-vaelor-1: 0 HPR | standard /master-vaelor-1: 4,242 HP |
| 40 | Infernis | hybrid /master-ember-3 | hybrid /master-ember-1: 1,991.4 HPR | standard /master-ember-1: 12,809.5 HP |
| 40 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | glassroot /master-tide-3: 11,160.5 HP |
| 40 | Flora | hybrid /master-sprout-3 | glassroot /master-sprout-3: 9,849.9 HPR | glassroot /master-sprout-3: 16,416.5 HP |
| 40 | Rosetta | hybrid /master-rosetta-1 | standard /master-rosetta-1: 220.6 HPR | glassroot /master-rosetta-2: 18,073.1 HP |
| 40 | Thornia | hybrid /master-thornia-1 | hybrid /master-thornia-1: 0 HPR | glassroot /master-thornia-2: 16,124.5 HP |
| 40 | Crinso | hybrid /master-crinso-1 | standard /master-crinso-3: 409.5 HPR | glassroot /master-crinso-1: 10,237.2 HP |
| 40 | Atmoso | hybrid /master-atmoso-3 | hybrid /master-atmoso-3: 0 HPR | glassroot /master-atmoso-2: 9,758 HP |
| 40 | Aurora | hybrid /master-aurora-2 | hybrid /master-aurora-2: 0 HPR | glassroot /master-aurora-1: 17,178.5 HP |
| 40 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | glassroot /master-bliss-2: 15,440.3 HP |
| 40 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | glassroot /master-bruno-2: 23,801.1 HP |
| 40 | Disciple | glassroot /master-disciple-3 | glassroot /master-disciple-3: 0 HPR | glassroot /master-disciple-1: 13,515 HP |
| 40 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | glassroot /master-elise-1: 9,116.3 HP |
| 40 | Razor | hybrid /master-razor-3 | hybrid /master-razor-3: 0 HPR | glassroot /master-razor-1: 16,946.9 HP |
| 40 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | glassroot /master-nerithe-1: 10,087.4 HP |
| 40 | Orvella | hybrid /master-orvella-2 | hybrid /master-orvella-2: 0 HPR | glassroot /master-orvella-1: 26,201.3 HP |
| 40 | Vaelor | hybrid /master-vaelor-1 | hybrid /master-vaelor-1: 0 HPR | glassroot /master-vaelor-1: 9,014.3 HP |
| 60 | Infernis | hybrid /master-ember-3 | hybrid /master-ember-1: 3,687.9 HPR | standard /master-ember-1: 21,851.5 HP |
| 60 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | glassroot /master-tide-3: 19,038.5 HP |
| 60 | Flora | hybrid /master-sprout-3 | glassroot /master-sprout-3: 16,802.7 HPR | glassroot /master-sprout-3: 28,004.6 HP |
| 60 | Rosetta | hybrid /master-rosetta-1 | glassroot /master-rosetta-1: 564.3 HPR | glassroot /master-rosetta-2: 30,830.6 HP |
| 60 | Thornia | hybrid /master-thornia-1 | hybrid /master-thornia-1: 0 HPR | glassroot /master-thornia-2: 27,506.5 HP |
| 60 | Crinso | hybrid /master-crinso-1 | standard /master-crinso-3: 698.5 HPR | glassroot /master-crinso-1: 17,463.4 HP |
| 60 | Atmoso | hybrid /master-atmoso-3 | hybrid /master-atmoso-3: 0 HPR | glassroot /master-atmoso-2: 16,646 HP |
| 60 | Aurora | hybrid /master-aurora-2 | hybrid /master-aurora-2: 0 HPR | glassroot /master-aurora-1: 29,304.5 HP |
| 60 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | glassroot /master-bliss-2: 26,339.3 HP |
| 60 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | glassroot /master-bruno-2: 40,601.8 HP |
| 60 | Disciple | glassroot /master-disciple-3 | glassroot /master-disciple-3: 0 HPR | glassroot /master-disciple-1: 23,055 HP |
| 60 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | glassroot /master-elise-1: 15,551.3 HP |
| 60 | Razor | hybrid /master-razor-3 | hybrid /master-razor-3: 0 HPR | glassroot /master-razor-1: 28,909.4 HP |
| 60 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | glassroot /master-nerithe-1: 17,207.9 HP |
| 60 | Orvella | hybrid /master-orvella-1 | hybrid /master-orvella-1: 0 HPR | glassroot /master-orvella-1: 44,696.3 HP |
| 60 | Vaelor | hybrid /master-vaelor-1 | hybrid /master-vaelor-1: 0 HPR | glassroot /master-vaelor-1: 15,377.3 HP |
| 80 | Infernis | hybrid /master-ember-3 | hybrid /master-ember-1: 5,239.2 HPR | standard /master-ember-1: 28,633 HP |
| 80 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | glassroot /master-tide-3: 24,947 HP |
| 80 | Flora | hybrid /master-sprout-3 | glassroot /master-sprout-3: 22,017.4 HPR | glassroot /master-sprout-3: 36,695.7 HP |
| 80 | Rosetta | glassroot /master-rosetta-1 | glassroot /master-rosetta-1: 493 HPR | glassroot /master-rosetta-2: 40,398.8 HP |
| 80 | Thornia | hybrid /master-thornia-2 | hybrid /master-thornia-2: 0 HPR | glassroot /master-thornia-2: 36,043 HP |
| 80 | Crinso | hybrid /master-crinso-1 | standard /master-crinso-3: 915.5 HPR | glassroot /master-crinso-1: 22,883.1 HP |
| 80 | Atmoso | hybrid /master-atmoso-3 | hybrid /master-atmoso-3: 0 HPR | glassroot /master-atmoso-2: 21,812 HP |
| 80 | Aurora | hybrid /master-aurora-3 | hybrid /master-aurora-3: 0 HPR | glassroot /master-aurora-1: 38,399 HP |
| 80 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | glassroot /master-bliss-2: 34,513.5 HP |
| 80 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | glassroot /master-bruno-2: 53,202.4 HP |
| 80 | Disciple | glassroot /master-disciple-3 | glassroot /master-disciple-3: 0 HPR | glassroot /master-disciple-1: 30,210 HP |
| 80 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | glassroot /master-elise-1: 20,377.5 HP |
| 80 | Razor | hybrid /master-razor-1 | hybrid /master-razor-1: 0 HPR | glassroot /master-razor-1: 37,881.3 HP |
| 80 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | glassroot /master-nerithe-1: 22,548.3 HP |
| 80 | Orvella | hybrid /master-orvella-1 | hybrid /master-orvella-1: 0 HPR | glassroot /master-orvella-1: 58,567.5 HP |
| 80 | Vaelor | hybrid /master-vaelor-1 | hybrid /master-vaelor-1: 0 HPR | glassroot /master-vaelor-3: 20,149.5 HP |
| 100 | Infernis | hybrid /master-ember-3 | hybrid /master-ember-1: 6,773 HPR | standard /master-ember-1: 35,414.5 HP |
| 100 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | glassroot /master-tide-3: 30,855.5 HP |
| 100 | Flora | hybrid /master-sprout-3 | glassroot /master-sprout-3: 27,232 HPR | glassroot /master-sprout-3: 45,386.7 HP |
| 100 | Rosetta | hybrid /master-rosetta-3 | standard /master-rosetta-3: 1,219.6 HPR | glassroot /master-rosetta-2: 49,966.9 HP |
| 100 | Thornia | hybrid /master-thornia-2 | hybrid /master-thornia-2: 0 HPR | glassroot /master-thornia-2: 44,579.5 HP |
| 100 | Crinso | hybrid /master-crinso-1 | standard /master-crinso-3: 1,132 HPR | glassroot /master-crinso-1: 28,302.8 HP |
| 100 | Atmoso | hybrid /master-atmoso-3 | hybrid /master-atmoso-3: 0 HPR | glassroot /master-atmoso-2: 26,978 HP |
| 100 | Aurora | hybrid /master-aurora-1 | hybrid /master-aurora-1: 0 HPR | glassroot /master-aurora-1: 47,493.5 HP |
| 100 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | glassroot /master-bliss-2: 42,687.8 HP |
| 100 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | glassroot /master-bruno-2: 65,802.9 HP |
| 100 | Disciple | glassroot /master-disciple-3 | glassroot /master-disciple-3: 0 HPR | glassroot /master-disciple-1: 37,365 HP |
| 100 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | glassroot /master-elise-1: 25,203.8 HP |
| 100 | Razor | hybrid /master-razor-1 | hybrid /master-razor-1: 0 HPR | glassroot /master-razor-1: 46,853.1 HP |
| 100 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | glassroot /master-nerithe-1: 27,888.6 HP |
| 100 | Orvella | hybrid /master-orvella-1 | hybrid /master-orvella-1: 0 HPR | glassroot /master-orvella-1: 72,438.8 HP |
| 100 | Vaelor | hybrid /master-vaelor-1 | hybrid /master-vaelor-1: 0 HPR | glassroot /master-vaelor-3: 24,921.8 HP |
| 105 | Infernis | hybrid /master-ember-3 | hybrid /master-ember-1: 6,988.6 HPR | standard /master-ember-1: 36,544.8 HP |
| 105 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | glassroot /master-tide-3: 31,840.3 HP |
| 105 | Flora | hybrid /master-sprout-3 | glassroot /master-sprout-3: 28,101.1 HPR | glassroot /master-sprout-3: 46,835.2 HP |
| 105 | Rosetta | hybrid /master-rosetta-3 | glassroot /master-rosetta-3: 2,517.3 HPR | glassroot /master-rosetta-2: 51,561.6 HP |
| 105 | Thornia | hybrid /master-thornia-2 | hybrid /master-thornia-2: 0 HPR | glassroot /master-thornia-2: 46,002.3 HP |
| 105 | Crinso | hybrid /master-crinso-1 | standard /master-crinso-3: 1,168 HPR | glassroot /master-crinso-1: 29,206.1 HP |
| 105 | Atmoso | hybrid /master-atmoso-3 | hybrid /master-atmoso-3: 0 HPR | glassroot /master-atmoso-2: 27,839 HP |
| 105 | Aurora | hybrid /master-aurora-1 | hybrid /master-aurora-1: 0 HPR | glassroot /master-aurora-1: 49,009.3 HP |
| 105 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | glassroot /master-bliss-2: 44,050.1 HP |
| 105 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | glassroot /master-bruno-2: 67,903 HP |
| 105 | Disciple | glassroot /master-disciple-3 | glassroot /master-disciple-3: 0 HPR | glassroot /master-disciple-1: 38,557.5 HP |
| 105 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | glassroot /master-elise-1: 26,008.1 HP |
| 105 | Razor | hybrid /master-razor-1 | hybrid /master-razor-1: 0 HPR | glassroot /master-razor-1: 48,348.4 HP |
| 105 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | glassroot /master-nerithe-1: 28,778.7 HP |
| 105 | Orvella | hybrid /master-orvella-1 | hybrid /master-orvella-1: 0 HPR | glassroot /master-orvella-1: 74,750.6 HP |
| 105 | Vaelor | hybrid /master-vaelor-1 | hybrid /master-vaelor-1: 0 HPR | glassroot /master-vaelor-3: 25,717.1 HP |

## Automated outlier flags (investigate, not nerf verdicts)

Ratios compare real sampled builds, not isolated causal effects. Shared gear, native loops, Gauge costs and role/pilot can all change together. A large ratio is a reason for a controlled follow-up, not proof of a bug.
- Lv.0: Vaelor leads sampled ceiling solo output at **1,666.1 DPR**, 2.9x roster ceiling median and 7x its own planned build. Seed spread 1,469.2-1,997. 18 mean actions/18 cycles; 0 mean Last Flares.
- Lv.20: Vaelor leads sampled ceiling solo output at **7,678.7 DPR**, 2.5x roster ceiling median and 7.8x its own planned build. Seed spread 6,705.1-9,350.7. 18 mean actions/18 cycles; 0 mean Last Flares.
- Lv.40: Vaelor leads sampled ceiling solo output at **26,555.3 DPR**, 2.8x roster ceiling median and 11.3x its own planned build. Seed spread 20,600.4-29,871.3. 18 mean actions/18 cycles; 0 mean Last Flares.
- Lv.60: Rosetta leads sampled ceiling solo output at **103,329 DPR**, 4.3x roster ceiling median and 30.2x its own planned build. Seed spread 87,058.1-120,987.7. 16 mean actions/18 cycles; 3 mean Last Flares.
- Lv.80: Vaelor leads sampled ceiling solo output at **112,190.6 DPR**, 2.8x roster ceiling median and 18.3x its own planned build. Seed spread 80,574.3-127,998.8. 18 mean actions/18 cycles; 0 mean Last Flares.
- Lv.100: Rosetta leads sampled ceiling solo output at **285,501.7 DPR**, 4.6x roster ceiling median and 39.8x its own planned build. Seed spread 259,820-336,156.9. 15 mean actions/18 cycles; 4 mean Last Flares.
- Lv.105: Rosetta leads sampled ceiling solo output at **303,478.8 DPR**, 4.6x roster ceiling median and 40.7x its own planned build. Seed spread 276,012.8-357,670.6. 15 mean actions/18 cycles; 4 mean Last Flares.

### Longer-run consistency checks

The leading measured solo, duo and trio in each of planned/ceiling were rerun for90 cycles across ten seeds. These test duration/crit consistency, not all possible rotations. The90-cycle metric uses only the final45 cycles.

| Profile | Team | 18-cycle DPR | 90-cycle DPR mean / seed range |
|---|---|---:|---|
| planned | Infernis | 17,711.2 | 18,835.3 /17,791.1-19,924.6 |
| planned | Infernis / Vaelor | 27,368.9 | 27,014.4 /25,177.3-28,517.8 |
| planned | Infernis / Rosetta / Vaelor | 38,981.1 | 35,585.6 /34,160-37,386 |
| ceiling | Rosetta | 303,478.8 | 313,923.1 /265,628.3-391,614.7 |
| ceiling | Rosetta / Disciple | 5,428,844.8 | 7,047,827.1 /6,692,608.6-7,575,443.3 |
| ceiling | Rosetta / Bliss / Disciple | 16,754,038.8 | 17,329,910 /16,302,501.1-17,935,170.6 |

### Controlled item-removal checks

Same selected Lv.105 solo/trio, pilot, ninety cycles and ten seeds. Remove the named item from every wearer (or every Master); leave those slots empty, do not substitute gear. Negative loss means the removal improved this particular rotation. This is a marginal effect in the tested package, not a universal item tier list.

| Team | Removed | Full-build DPR | Without DPR | Output lost |
|---|---|---:|---:|---:|
| Rosetta | glassroot-gimbal | 313,923.1 | 72,505.1 | 76.9% |
| Rosetta | immortal-vessel | 313,923.1 | 203,970.4 | 35% |
| Rosetta | firstlight-cam | 313,923.1 | 66,275.4 | 78.9% |
| Rosetta | masters | 313,923.1 | 115,605.4 | 63.2% |
| Rosetta / Bliss / Disciple | glassroot-gimbal | 17,329,910 | 1,732,283.4 | 90% |
| Rosetta / Bliss / Disciple | immortal-vessel | 17,329,910 | 7,174,487.4 | 58.6% |
| Rosetta / Bliss / Disciple | horizon-heartcase | 17,329,910 | 17,329,910 | 0% |
| Rosetta / Bliss / Disciple | firstlight-cam | 17,329,910 | 1,344,980.7 | 92.2% |
| Rosetta / Bliss / Disciple | masters | 17,329,910 | 8,190,591.2 | 52.7% |
| Rosetta / Bliss / Disciple | master-rosetta-3 | 17,329,910 | 16,894,895 | 2.5% |
| Rosetta / Bliss / Disciple | master-bliss-2 | 17,329,910 | 15,101,171.4 | 12.9% |
| Rosetta / Bliss / Disciple | master-disciple-3 | 17,329,910 | 10,241,894.4 | 40.9% |

### Assessment: what is actually worth reviewing

- **High-priority package outlier:** Rosetta / Bliss / Disciple reaches 17,329,910 DPR over the final45 of90 cycles, versus 35,585.6 for the selected Common-build trio: 487x. This is not a like-for-like character comparison, but the magnitude warrants a focused balance review rather than dismissing it as merely a lucky crit.
- **Measured levers:** firstlight-cam: 92.2% output lost on removal; glassroot-gimbal: 90% output lost on removal; immortal-vessel: 58.6% output lost on removal. Removing shared Health-to-Skill-Power scaling or the Quarry Master/Gauge loop is more informative than blindly reducing every member's base stats. These marginal losses overlap and must not be added.
- **Not free or casually guaranteed:** the selected package requires no Calamitic Conduits, 970,800 upgrade components, 3 chosen Masters and the listed unique Omnics, plus recruitment/leveling. Names/upgrades are shared account unlocks. Do not balance ordinary progression against this extreme package.
- **Balance interpretation:** inspect equipment/Gauge feedback before blanket character nerfs. The owner authorizes enemy calibration against practical progression and strong non-Calamitic endgame teams, not against the highest damage-only outlier.
- **Ramp matters:** the Rosetta/Disciple duo changes materially between the18- and90-cycle windows. The full matrix is a finite-window comparison, not an exhaustive steady-state ranking. No infinite action loop was found; very high finite damage is a separate concern.
- **Lower-cost progression:** Infernis leads every sampled Common solo checkpoint. That is meaningful offensive value, but this zero-pressure test favors persistent Burn and cannot price tanking, enemy control or rescue. Flora/Tizu/Razor/Bruno require their healing/mitigation columns and role mechanics, not a damage-only verdict.

### Interpretation safeguards and next-stage questions

- No result here establishes an automatic game break, invulnerability, an infinite action loop or a necessary nerf. Per-round action guards and finite-value checks passed for the completed matrix; expensive ceilings are conditional account power.
- Zero incoming damage removes Razor Wounds, Bruno interception, Orvella hit resistance, Thornia attack-trigger traps, Tizu absorption Gauge, Seal prevention, incoming-driven Omnics and Stasis value. Those need later standardized pressure/matchup tests; do not nerf or buff them from this chart alone.
- Glassroot/HP packages and Gauge feedback remain candidate systemic outliers. Calamitic equipment is excluded from every current measured loadout and is never a prerequisite for balance targets.
- A three-member squad adds independent actions, targets for support and coordinated native triggers, but also three recruitment/progression bills. Solo is cheaper, not automatically stronger per account-hour; no account-hour model was run.
- Flora delayed healing and Bliss Closing bonuses need ordering/headroom; a solo Bliss cannot use Closing. Rosetta needs distinct allied direct hitters; Disciple buffs can waste an action if the recipient uses a mismatched next action.
- Precharged bursts, artificial healing headroom, shield creation and one-hit packet survival are separate experiments and cannot be added into a single sustainable “DPS+tank+heal” score.
- Investigate suspected nerfs with an ablation (remove one item), longer horizons, more seeds and realistic acquisition restrictions, then actual pressure/encounters only if the owner requests that phase.

Full aggregate rows, per-source contribution, Master candidates, exact gear and budgets are in the companion JSONL result file produced by the reproduction command. This report is generated by the checked-in runner, not manually transcribed numbers. The longer-run checks are deterministically recomputed when rendering; `--render` requires the original complete, source-matching JSONL.

Reproduce: `node tools\run_roster_capability.mjs <new-results.jsonl> docs\roster-capability-audit.md`.
