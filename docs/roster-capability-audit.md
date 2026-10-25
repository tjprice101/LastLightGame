# Roster capability audit: levels 0-105

Read-only paper/laboratory audit, not an enemy-clear, progression-time or balance-change claim.

**Acquisition rates are a D-401 snapshot, not current farming odds.**
D-402 subsequently changes Machines to linear5%-35% Rare,5%-20% Legendary
and5%-15% Omnic, plus50% final Master Chests. See the
[current drop contract](awaken-the-machines.md#linear-stage-drop-rates-d-402).
Combat measurements below are unchanged; do not use the old acquisition
means as current farming requirements.

## At a glance

The table contrasts learnable Common +0 play with developed-account equipment ceilings. The teams are conditional on ownership, not a claim that every account can field them at that level. DPR means damage per complete round against zero Defense, including delayed damage; it is not real-time DPS.

| Level | Planned best solo DPR | Planned best duo DPR | Planned best trio DPR | Ceiling best trio DPR |
|---:|---|---|---|---|
| 0 | Infernis: 311.8 | Infernis / Bliss: 556.7 | Infernis / Bliss / Vaelor: 829.1 | Infernis / Rosetta / Crinso: 331,861.4 |
| 20 | Infernis: 1,548.6 | Infernis / Vaelor: 2,604.1 | Infernis / Bliss / Vaelor: 3,726.4 | Infernis / Rosetta / Disciple: 1,817,657.7 |
| 40 | Infernis: 3,969.6 | Infernis / Vaelor: 6,389 | Infernis / Nerithe / Vaelor: 9,191 | Infernis / Rosetta / Disciple: 6,524,288.3 |
| 60 | Infernis: 7,110.7 | Infernis / Vaelor: 11,113.7 | Infernis / Nerithe / Vaelor: 15,865.1 | Rosetta / Crinso / Disciple: 20,240,852.2 |
| 80 | Infernis: 12,002 | Infernis / Vaelor: 18,964.9 | Infernis / Crinso / Vaelor: 27,036.8 | Rosetta / Crinso / Disciple: 43,843,129.4 |
| 100 | Infernis: 16,722.8 | Infernis / Vaelor: 26,000.8 | Infernis / Bliss / Vaelor: 36,936.6 | Rosetta / Crinso / Disciple: 61,558,714.2 |
| 105 | Infernis: 17,711.2 | Infernis / Vaelor: 27,368.9 | Infernis / Rosetta / Vaelor: 38,981.1 | Rosetta / Crinso / Disciple: 67,152,728.9 |

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

- Source base commit: `55ae0e63b60d28ed865a628e1d3edb3643a6ffbf`; bundled simulation SHA-256: `125e9fb0f1877df6f71a0fef308a87142cadb0febaf0fd1111926b09bad5744a`.
- Levels: 0, 20, 40, 60, 80, 100, 105. All16 Element-Bearers; all16 solos,120 duos and560 trios at every checkpoint/profile.
- 175,392 main seeded measurements; 58,464 aggregates; 1344 gear/Master candidates screened.
- 18 complete player/phase cycles; discard first9 and average last9 for the main sustained-output window. This is not a guarantee every loop has reached steady state; see the90-cycle checks. Seeds: 1, 1729, 104729.
- 200 additional seeded90-cycle output measurements validate selected Lv.105 leaders and controlled item removal; ten seeds, final45 cycles measured.
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
- No game mechanics, rewards, saves, balance values or online accounts were changed. Report/tooling only.

## Progression and luck assumptions

| Profile | Equipment and play | Interpretation |
|---|---|---|
| floor | Empty slots; Normal only | Deliberately bottom-of-barrel control; not a recommendation. |
| unlucky | Eight Store Commons +0; Normal only | Farmable gear without rare drops; separates poor play from empty slots. |
| planned | Same Commons +0; native-aware skills | Learnable no-rare-luck baseline; Store resources still have to be earned. |
| farmed | Fixed eight-piece Rare/Legendary package +0 | Long-farm target, not an average inventory guaranteed by level. Focus reduces name lottery. |
| lucky | Four matching Omnics, four ordinary stat pieces +0 and screened personal Master | Conditional high-roll/late-account package, NOT a realistic fresh Lv.0/20 expectation. |
| ceiling | Best sampled Calamitic, HP/Glassroot/Stasis or hybrid package +5; four matching Omnics; screened Master | Legal equipment ceiling on a developed account; no legacy weapon ranks, no claim it is obtainable at that level on a fresh account. |

Main progression uses the least evolved form that admits the checkpoint: Evo1/1/2/3/5/6/6. Ceiling can evolve immediately at the current cap: Evo1/1/2/4/5/6/6. An early alternate bearer can use account-wide gear only if a stronger account already earned it.

| Same-account highest level | Actual access facts, not assumed clears |
|---|---|
| 0 | One chosen Infernis/Tizu/Flora is free. The other two are NOT free teammates. Lucky banner pulls may recruit other bearers, but gear remains acquisition-limited. |
| 20 | Machines gate is highest Lv.10 AND Story region1 clear. Gate access does not prove final-boss or stage26 farming. Dungeons are still locked below30. |
| 40 | Material dungeons open30; Heaven/Abyss remain locked until50. No assumed Master/Omnic pipeline merely from being40. |
| 60 | Heaven/Abyss50, Treasury/Sanctuary60. Evo3->4 needs explicit form3+ fodder. Build/mat farming now matters; level alone grants nothing. |
| 80 | Rose event opens75; War still locked until85. Evo4->5 also consumes two form4+ fodder copies; gear/roster can dominate20 extra levels. |
| 100 / 105 | All level gates met, not all clears. Evo5->6 consumes three form5+ copies. Calamitics require a Normal final clear, Calamity EX+1 clear,100 tokens per name, then upgrades. |

All roster combinations below are conditional on ownership. For a fresh account whose highest bearer is below85, War bearers are unavailable; low-level War rows are developed-account alternate-character ceilings, not early progression suggestions. Captured Elemental-Devourers cap60 and are outside this16-bearer audit.

## Acquisition/work, using current live rates

- Focused unowned Rare/Legendary/Omnic name:12.5 /18.18 /33.33 eligible kills on average. Omnic requires Machines stage26+. These are geometric means per selected name, NOT a guarantee or proof of clearability.
- Master Chest:5% at final stage35 only; mean20 final clears, median14,90th percentile45 for one chest. You choose an unowned Master; additional same-character alternatives require additional chests. No random Master-name lottery.
- Rare15 / Legendary15 / Omnic45 full pools. Independent tiers can succeed together. Name unlocks and upgrades are account-wide: one copy can serve several bearers; four-Omnic cap and element matching still apply per member.
- A named5-star Standard bearer has1% divided across six names:0.1667% natural rate (mean600 pulls without pity). A named6-star Standard bearer has0.1% divided across four:0.025% natural (mean4000 without pity). Highest-tier pity changes those means drastically; the no-pity numbers must NOT be used as real six-star expected cost.
- Current pity is80 highest-star /150 unowned-highest-star. From a fresh roster, at most600 Standard pulls guarantee all four highest6-stars, at most450 Rose pulls all three highest Roses (ignoring other income/availability). No target5-star guarantee: unlucky tails remain. Costs are10 Null-Prismatica per pull.
- Do not equate lower stars with easier targeted acquisition: a specific five-star lacks the highest-tier ownership guarantee. A five-star-only lineup can still be harder to finish than a lucky/pity-built six-star lineup. The free chosen starter is the only guaranteed no-pull bearer.
- Rose natural character tier1.1% split three:0.3667% per name. War recruitment1% per final clear, no pity: mean100 /median69 /90th percentile230 eligible clears per name. Those are acquisition odds only, not simulated battle wins.
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
| farmed /1 | Infernis | 1,000 | 0 | 0 | 25 /90.9 /0 | 0 /0 |
| farmed /2 | Infernis / Bliss | 1,000 | 0 | 0 | 25 /90.9 /0 | 0 /0 |
| farmed /3 | Infernis / Bliss / Nerithe | 1,000 | 0 | 0 | 25 /90.9 /0 | 0 /0 |
| lucky /1 | Infernis | 1,000 | 0 | 0 | 0 /54.5 /133.3 | 1 /20 |
| lucky /2 | Infernis / Rosetta | 1,000 | 0 | 0 | 0 /54.5 /266.7 | 2 /40 |
| lucky /3 | Rosetta / Disciple / Vaelor | 1,000 | 0 | 0 | 0 /54.5 /400 | 3 /60 |
| ceiling /1 | Vaelor | 0 | 963,600 | 200 | 12.5 /18.2 /133.3 | 1 /20 |
| ceiling /2 | Rosetta / Disciple | 0 | 1,443,600 | 200 | 12.5 /18.2 /266.7 | 2 /40 |
| ceiling /3 | Rosetta / Crinso / Disciple | 0 | 1,443,600 | 200 | 12.5 /18.2 /266.7 | 3 /60 |

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
| Nerithe | Survey and precision-pierce attacker | War final recruitment:1% per eligible clear; highest account Lv.85 gate |
| Orvella | Finite-durability team architect | War final recruitment:1% per eligible clear; highest account Lv.85 gate |
| Vaelor | Deterministic three-beat burst attacker | War final recruitment:1% per eligible clear; highest account Lv.85 gate |

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
| Infernis | 220 | 38 | 10 | 15% /1.5x | 100 | 311.8 | 1,127 | 19,668.2 | ultimate: 36,060 /36,060 |
| Tizu | 260 | 30 | 16 | 10% /1.5x | 100 | 126.6 | 318.4 | 1,980.2 | skill1: 3,130 /3,130 |
| Flora | 190 | 32 | 8 | 20% /1.5x | 100 | 127.7 | 286.7 | 1,000.7 | skill1: 1,287 /1,287 |
| Rosetta | 225 | 43 | 11 | 20% /1.6x | 100 | 221.3 | 776.8 | 18,112.1 | ultimate: 32,321 /32,321 |
| Thornia | 280 | 31 | 17 | 10% /1.5x | 100 | 93.2 | 292.7 | 1,502 | ultimate: 8,793 /8,793 |
| Crinso | 205 | 41 | 9 | 25% /1.7x | 100 | 199.3 | 746.5 | 3,648.3 | ultimate: 26,304 /26,304 |
| Atmoso | 205 | 39 | 9 | 20% /1.6x | 100 | 197.1 | 398.1 | 8,749.4 | ultimate: 70,421 /70,421 |
| Aurora | 215 | 32 | 10 | 12% /1.5x | 100 | 24.8 | 87.2 | 282.9 | skill2: 1,028 /1,028 |
| Bliss | 210 | 42 | 10 | 25% /1.7x | 100 | 242.9 | 751.2 | 2,964.6 | ultimate: 15,966 /15,966 |
| Bruno | 285 | 29 | 18 | 8% /1.5x | 100 | 145.3 | 300.6 | 1,489.3 | skill1: 2,088 /2,088 |
| Disciple | 240 | 36 | 11 | 12% /1.5x | 100 | 41.8 | 190 | 813.3 | light: 1,053 /1,053 |
| Elise | 195 | 40 | 8 | 25% /1.7x | 100 | 136.2 | 664.7 | 3,553.9 | ultimate: 39,493 /39,493 |
| Razor | 290 | 32 | 19 | 10% /1.5x | 100 | 142.1 | 441.6 | 2,479.9 | ultimate: 15,754 /15,754 |
| Nerithe | 235 | 40 | 13 | 18% /1.6x | 100 | 206.9 | 563.9 | 4,019.3 | ultimate: 25,864 /25,864 |
| Orvella | 300 | 32 | 20 | 10% /1.5x | 100 | 71.1 | 125.1 | 609.1 | ultimate: 5,225 /5,225 |
| Vaelor | 210 | 45 | 11 | 22% /1.6x | 100 | 238.4 | 945.9 | 6,892 | ultimate: 43,543 /43,543 |

### Level 20

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 880 | 152 | 26.4 | 15.9% /1.6x | 106 | 1,548.6 | 5,053.3 | 84,899.3 | ultimate: 152,895 /152,895 |
| Tizu | 1,040 | 120 | 42.2 | 10.6% /1.6x | 106 | 520 | 1,289.1 | 10,470.1 | skill1: 17,003 /17,003 |
| Flora | 760 | 128 | 21.1 | 21.2% /1.6x | 106 | 524.2 | 1,176.6 | 5,391 | skill1: 7,180 /7,180 |
| Rosetta | 900 | 172 | 29 | 21.2% /1.7x | 106 | 918.9 | 4,028.9 | 76,795.8 | ultimate: 137,042 /137,042 |
| Thornia | 1,120 | 124 | 44.9 | 10.6% /1.6x | 106 | 383.8 | 1,196.6 | 9,177.7 | ultimate: 57,316 /57,316 |
| Crinso | 820 | 164 | 23.8 | 26.5% /1.8x | 106 | 820.1 | 3,066 | 20,234.6 | ultimate: 153,355 /153,355 |
| Atmoso | 820 | 156 | 23.8 | 21.2% /1.7x | 106 | 811.2 | 1,649.3 | 37,063.6 | ultimate: 298,587 /298,587 |
| Aurora | 860 | 128 | 26.4 | 12.7% /1.6x | 106 | 103.3 | 355.5 | 1,559.3 | skill2: 5,979 /5,979 |
| Bliss | 840 | 168 | 26.4 | 26.5% /1.8x | 106 | 1,015.9 | 3,160.7 | 18,007.1 | ultimate: 98,543 /98,543 |
| Bruno | 1,140 | 116 | 47.5 | 8.5% /1.6x | 106 | 595.5 | 1,219.5 | 9,707 | skill1: 13,941 /13,941 |
| Disciple | 960 | 144 | 29 | 12.7% /1.6x | 106 | 173.7 | 795.9 | 3,950.2 | light: 4,465 /4,465 |
| Elise | 780 | 160 | 21.1 | 26.5% /1.8x | 106 | 562.1 | 2,729.6 | 18,828.4 | ultimate: 224,169 /224,169 |
| Razor | 1,160 | 128 | 50.1 | 10.6% /1.6x | 106 | 584.9 | 1,790.1 | 14,892.3 | ultimate: 99,292 /99,292 |
| Nerithe | 940 | 160 | 34.3 | 19.1% /1.7x | 106 | 852.7 | 2,306.7 | 22,397.7 | ultimate: 147,146 /147,146 |
| Orvella | 1,200 | 128 | 52.8 | 10.6% /1.6x | 106 | 292.4 | 530.4 | 3,859.2 | ultimate: 34,465 /34,465 |
| Vaelor | 840 | 180 | 29 | 23.3% /1.7x | 106 | 989.6 | 3,960.9 | 38,736.7 | ultimate: 210,019 /210,019 |

### Level 40

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 1,870 | 323 | 44.7 | 17.6% /1.8x | 117 | 3,969.6 | 12,179.7 | 201,737 | ultimate: 358,618 /358,618 |
| Tizu | 2,210 | 255 | 71.6 | 11.7% /1.8x | 117 | 1,158.4 | 2,796.4 | 32,122.9 | skill1: 53,498 /53,498 |
| Flora | 1,615 | 272 | 35.8 | 23.4% /1.8x | 117 | 1,168.4 | 2,602.3 | 16,775 | skill1: 20,995 /20,995 |
| Rosetta | 1,912.5 | 365.5 | 49.2 | 23.4% /1.9x | 117 | 2,084.6 | 12,153 | 118,962.8 | ultimate: 321,435 /321,435 |
| Thornia | 2,380 | 263.5 | 76 | 11.7% /1.8x | 117 | 860.4 | 2,611.1 | 31,340.3 | ultimate: 204,916 /204,916 |
| Crinso | 1,742.5 | 348.5 | 40.3 | 29.3% /2x | 117 | 1,830.8 | 6,876.7 | 66,997.6 | ultimate: 515,929 /515,929 |
| Atmoso | 1,742.5 | 331.5 | 40.3 | 23.4% /1.9x | 117 | 1,810.8 | 3,729.1 | 86,806.9 | ultimate: 700,341 /700,341 |
| Aurora | 1,827.5 | 272 | 44.7 | 14% /1.8x | 117 | 234.9 | 879.6 | 4,890.9 | skill2: 19,574 /19,574 |
| Bliss | 1,785 | 357 | 44.7 | 29.3% /2x | 117 | 2,490.2 | 7,609.8 | 62,434 | ultimate: 345,696 /345,696 |
| Bruno | 2,422.5 | 246.5 | 80.5 | 9.4% /1.8x | 117 | 1,317.7 | 2,654.6 | 34,699.7 | skill1: 50,596 /50,596 |
| Disciple | 2,040 | 306 | 49.2 | 14% /1.8x | 117 | 395.5 | 1,832.3 | 11,029.3 | light: 10,472 /10,472 |
| Elise | 1,657.5 | 340 | 35.8 | 29.3% /2x | 117 | 1,263.1 | 6,201.5 | 56,607.7 | ultimate: 715,839 /715,839 |
| Razor | 2,465 | 272 | 85 | 11.7% /1.8x | 117 | 1,303.2 | 3,896.2 | 56,394 | ultimate: 332,398 /332,398 |
| Nerithe | 1,997.5 | 340 | 58.1 | 21.1% /1.9x | 117 | 1,912.4 | 5,279 | 70,675.3 | ultimate: 472,117 /472,117 |
| Orvella | 2,550 | 272 | 89.5 | 11.7% /1.8x | 117 | 653.2 | 1,164.6 | 13,692.3 | ultimate: 125,588 /125,588 |
| Vaelor | 1,785 | 382.5 | 49.2 | 25.7% /1.9x | 117 | 2,342.4 | 9,532.7 | 127,338.2 | ultimate: 724,831 /724,831 |

### Level 60

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 2,860 | 494 | 60.2 | 19.2% /1.9x | 128 | 7,110.7 | 21,178.3 | 394,329.8 | ultimate: 695,419 /695,419 |
| Tizu | 3,380 | 390 | 96.4 | 12.8% /1.9x | 128 | 1,855.3 | 4,365 | 82,201.8 | skill1: 139,580 /139,580 |
| Flora | 2,470 | 416 | 48.2 | 25.6% /1.9x | 128 | 1,890.4 | 4,290.8 | 46,246.6 | skill1: 58,349 /58,349 |
| Rosetta | 2,925 | 559 | 66.2 | 25.6% /2x | 128 | 3,419.4 | 14,836.5 | 281,856.7 | ultimate: 691,830 /691,830 |
| Thornia | 3,640 | 403 | 102.4 | 12.8% /1.9x | 128 | 1,383.9 | 4,097.3 | 84,906 | ultimate: 572,005 /572,005 |
| Crinso | 2,665 | 533 | 54.2 | 32% /2.2x | 128 | 3,067.3 | 11,097.5 | 181,837 | ultimate: 1,456,043 /1,456,043 |
| Atmoso | 2,665 | 507 | 54.2 | 25.6% /2x | 128 | 2,928.5 | 6,046.7 | 168,049.9 | ultimate: 1,358,078 /1,358,078 |
| Aurora | 2,795 | 416 | 60.2 | 15.4% /1.9x | 128 | 383.6 | 1,456.1 | 12,757.1 | skill2: 52,686 /52,686 |
| Bliss | 2,730 | 546 | 60.2 | 32% /2.2x | 128 | 4,119 | 12,634.9 | 174,664 | ultimate: 974,364 /974,364 |
| Bruno | 3,705 | 377 | 108.4 | 10.2% /1.9x | 128 | 2,183.6 | 4,156.9 | 98,135.7 | skill1: 144,385 /144,385 |
| Disciple | 3,120 | 468 | 66.2 | 15.4% /1.9x | 128 | 645.3 | 3,018.4 | 25,948.4 | light: 20,307 /20,307 |
| Elise | 2,535 | 520 | 48.2 | 32% /2.2x | 128 | 2,067.1 | 9,936.8 | 145,681.7 | ultimate: 1,940,925 /1,940,925 |
| Razor | 3,770 | 416 | 114.4 | 12.8% /1.9x | 128 | 2,086.5 | 6,100 | 165,093.7 | ultimate: 989,444 /989,444 |
| Nerithe | 3,055 | 520 | 78.3 | 23% /2x | 128 | 3,078.5 | 8,379.8 | 183,052.3 | ultimate: 1,237,520 /1,237,520 |
| Orvella | 3,900 | 416 | 120.4 | 12.8% /1.9x | 128 | 1,048.7 | 1,838.4 | 38,260 | ultimate: 356,439 /356,439 |
| Vaelor | 2,730 | 585 | 66.2 | 28.2% /2.1x | 128 | 3,829.1 | 15,442.6 | 345,374.9 | ultimate: 2,019,650 /2,019,650 |

### Level 80

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 4,180 | 722 | 78.5 | 21.6% /2.2x | 144 | 12,002 | 35,846 | 564,376.6 | ultimate: 986,604 /986,604 |
| Tizu | 4,940 | 570 | 125.7 | 14.4% /2.2x | 144 | 2,887.9 | 6,640.8 | 137,434.8 | skill1: 235,489 /235,489 |
| Flora | 3,610 | 608 | 62.8 | 28.8% /2.2x | 144 | 2,948.9 | 6,947.5 | 80,025.6 | skill1: 101,314 /101,314 |
| Rosetta | 4,275 | 817 | 86.4 | 28.8% /2.3x | 144 | 5,436.3 | 23,428.4 | 412,035.3 | ultimate: 1,188,874 /1,188,874 |
| Thornia | 5,320 | 589 | 133.5 | 14.4% /2.2x | 144 | 2,167.3 | 6,304.3 | 145,673.3 | ultimate: 994,643 /994,643 |
| Crinso | 3,895 | 779 | 70.7 | 36% /2.4x | 144 | 4,813.4 | 19,397.7 | 314,300.3 | ultimate: 2,559,967 /2,559,967 |
| Atmoso | 3,895 | 741 | 70.7 | 28.8% /2.3x | 144 | 4,571.7 | 9,877.9 | 275,320.7 | ultimate: 2,264,703 /2,264,703 |
| Aurora | 4,085 | 608 | 78.5 | 17.3% /2.2x | 144 | 611.7 | 2,280.9 | 21,551.8 | skill2: 90,285 /90,285 |
| Bliss | 3,990 | 798 | 78.5 | 36% /2.4x | 144 | 6,940.1 | 20,583.9 | 303,362.9 | ultimate: 1,697,524 /1,697,524 |
| Bruno | 5,415 | 551 | 141.4 | 11.5% /2.2x | 144 | 3,396.7 | 6,280.6 | 172,050 | skill1: 254,076 /254,076 |
| Disciple | 4,560 | 684 | 86.4 | 17.3% /2.2x | 144 | 1,028.7 | 4,870.8 | 41,667.1 | light: 28,810 /28,810 |
| Elise | 3,705 | 760 | 62.8 | 36% /2.4x | 144 | 3,254.1 | 15,855.8 | 240,396.3 | ultimate: 3,276,469 /3,276,469 |
| Razor | 5,510 | 608 | 149.2 | 14.4% /2.2x | 144 | 3,247.4 | 9,314 | 293,527.7 | ultimate: 1,770,696 /1,770,696 |
| Nerithe | 4,465 | 760 | 102.1 | 25.9% /2.3x | 144 | 5,060.8 | 13,642.7 | 305,768 | ultimate: 2,078,168 /2,078,168 |
| Orvella | 5,700 | 608 | 157.1 | 14.4% /2.2x | 144 | 1,637.8 | 2,854 | 67,459.1 | ultimate: 632,770 /632,770 |
| Vaelor | 3,990 | 855 | 86.4 | 31.7% /2.4x | 144 | 6,119.6 | 25,247.6 | 604,055.6 | ultimate: 3,562,285 /3,562,285 |

### Level 100

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 5,170 | 893 | 91.1 | 23.3% /2.3x | 155 | 16,722.8 | 49,925.4 | 757,004.9 | ultimate: 1,313,489 /1,313,489 |
| Tizu | 6,110 | 705 | 145.8 | 15.5% /2.3x | 155 | 3,722 | 8,385.3 | 210,679.2 | skill1: 363,389 /363,389 |
| Flora | 4,465 | 752 | 72.9 | 31% /2.3x | 155 | 3,989.1 | 8,975.4 | 125,730.1 | skill1: 159,555 /159,555 |
| Rosetta | 5,287.5 | 1,010.5 | 100.3 | 31% /2.5x | 155 | 7,171.5 | 24,389.4 | 416,143 | ultimate: 1,872,643 /1,872,643 |
| Thornia | 6,580 | 728.5 | 155 | 15.5% /2.3x | 155 | 2,803.3 | 8,755.7 | 229,405.3 | ultimate: 1,582,337 /1,582,337 |
| Crinso | 4,817.5 | 963.5 | 82 | 38.8% /2.6x | 155 | 6,646.3 | 25,454.5 | 487,653.7 | ultimate: 4,015,536 /4,015,536 |
| Atmoso | 4,817.5 | 916.5 | 82 | 31% /2.5x | 155 | 6,224.7 | 12,879.5 | 429,086.2 | ultimate: 3,568,837 /3,568,837 |
| Aurora | 5,052.5 | 752 | 91.1 | 18.6% /2.3x | 155 | 799.8 | 2,950.7 | 33,448 | skill2: 141,599 /141,599 |
| Bliss | 4,935 | 987 | 91.1 | 38.8% /2.6x | 155 | 9,267.3 | 28,696.8 | 473,955.1 | ultimate: 2,657,469 /2,657,469 |
| Bruno | 6,697.5 | 681.5 | 164.1 | 12.4% /2.3x | 155 | 4,376.1 | 7,943.3 | 274,371.3 | skill1: 406,233 /406,233 |
| Disciple | 5,640 | 846 | 100.3 | 18.6% /2.3x | 155 | 1,345.4 | 6,414.7 | 61,934.2 | light: 38,356 /38,356 |
| Elise | 4,582.5 | 940 | 72.9 | 38.8% /2.6x | 155 | 4,375.8 | 20,477.3 | 369,332.3 | ultimate: 5,127,715 /5,127,715 |
| Razor | 6,815 | 752 | 173.2 | 15.5% /2.3x | 155 | 4,184.4 | 11,793.1 | 469,735 | ultimate: 2,845,903 /2,845,903 |
| Nerithe | 5,522.5 | 940 | 118.5 | 27.9% /2.5x | 155 | 6,575.7 | 17,551.4 | 473,517.7 | ultimate: 3,231,807 /3,231,807 |
| Orvella | 7,050 | 752 | 182.3 | 15.5% /2.3x | 155 | 2,114.7 | 4,024.3 | 107,355.2 | ultimate: 1,011,610 /1,011,610 |
| Vaelor | 4,935 | 1,057.5 | 100.3 | 34.1% /2.6x | 155 | 8,014.4 | 33,864.2 | 945,822 | ultimate: 5,593,119 /5,593,119 |

### Level 105

| Bearer | HP | ATK | DEF | Crit / multiplier | Gauge cap | Planned DPR | Lucky DPR | Ceiling DPR | Ceiling charged action mean / sampled max |
|---|---:|---:|---:|---|---:|---:|---:|---:|---|
| Infernis | 5,335 | 921.5 | 93.2 | 23.5% /2.3x | 156.5 | 17,711.2 | 52,873.4 | 790,600.9 | ultimate: 1,368,526 /1,368,526 |
| Tizu | 6,305 | 727.5 | 149.1 | 15.7% /2.3x | 156.5 | 3,861.8 | 8,677.6 | 225,693.7 | skill1: 389,751 /389,751 |
| Flora | 4,607.5 | 776 | 74.5 | 31.3% /2.3x | 156.5 | 4,142 | 9,316 | 133,997.1 | skill1: 170,096 /170,096 |
| Rosetta | 5,456.3 | 1,042.8 | 102.5 | 31.3% /2.5x | 156.5 | 7,454.5 | 25,331.6 | 443,168 | ultimate: 1,994,254 /1,994,254 |
| Thornia | 6,790 | 751.8 | 158.4 | 15.7% /2.3x | 156.5 | 2,910.2 | 9,077.1 | 245,182.3 | ultimate: 1,693,466 /1,693,466 |
| Crinso | 4,971.3 | 994.3 | 83.9 | 39.1% /2.7x | 156.5 | 6,904.7 | 26,472.6 | 526,116.8 | ultimate: 4,342,002 /4,342,002 |
| Atmoso | 4,971.3 | 945.8 | 83.9 | 31.3% /2.5x | 156.5 | 6,463.7 | 13,383.6 | 452,445.6 | ultimate: 3,766,458 /3,766,458 |
| Aurora | 5,213.8 | 776 | 93.2 | 18.8% /2.3x | 156.5 | 831.6 | 3,063 | 35,592.7 | skill2: 150,877 /150,877 |
| Bliss | 5,092.5 | 1,018.5 | 93.2 | 39.1% /2.7x | 156.5 | 9,649.6 | 29,885.6 | 510,039.9 | ultimate: 2,860,858 /2,860,858 |
| Bruno | 6,911.3 | 703.3 | 167.7 | 12.5% /2.3x | 156.5 | 4,540.1 | 8,221.1 | 292,612.7 | skill1: 433,372 /433,372 |
| Disciple | 5,820 | 873 | 102.5 | 18.8% /2.3x | 156.5 | 1,398.6 | 6,674.5 | 65,426.7 | light: 39,963 /39,963 |
| Elise | 4,728.8 | 970 | 74.5 | 39.1% /2.7x | 156.5 | 4,546.1 | 21,252.6 | 394,180.1 | ultimate: 5,487,620 /5,487,620 |
| Razor | 7,032.5 | 776 | 177 | 15.7% /2.3x | 156.5 | 4,341.9 | 12,207.4 | 505,086.7 | ultimate: 3,062,103 /3,062,103 |
| Nerithe | 5,698.8 | 970 | 121.1 | 28.2% /2.5x | 156.5 | 6,830.5 | 18,206.7 | 504,008.7 | ultimate: 3,441,774 /3,441,774 |
| Orvella | 7,275 | 776 | 186.3 | 15.7% /2.3x | 156.5 | 2,194.9 | 4,175.1 | 115,281.4 | ultimate: 1,087,050 /1,087,050 |
| Vaelor | 5,092.5 | 1,091.3 | 102.5 | 34.4% /2.6x | 156.5 | 8,333 | 35,243.2 | 1,012,542.6 | ultimate: 5,988,605 /5,988,605 |

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
| 1 | Infernis: **19,668.2** (19,668.2-19,668.2)<br>Rosetta: **18,112.1** (18,112.1-18,112.1)<br>Atmoso: **8,749.4** (8,749.4-8,749.4) | Flora: 907.2<br>Infernis: 71.8<br>Crinso: 45.8 | Tizu: 761.7<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Rosetta: **103,263.1** (103,263.1-103,263.1)<br>Rosetta / Disciple: **102,622.9** (102,622.9-102,622.9)<br>Infernis / Disciple: **66,723.1** (66,723.1-66,723.1) | Flora / Rosetta: 3,001.4<br>Flora / Orvella: 2,474.5<br>Flora / Bliss: 2,419.2 | Tizu / Orvella: 1,943<br>Tizu / Disciple: 1,111<br>Tizu / Flora: 998.8 |
| 3 | Infernis / Rosetta / Crinso: **331,861.4** (331,861.4-331,861.4)<br>Infernis / Rosetta / Disciple: **329,712.9** (329,712.9-329,712.9)<br>Infernis / Rosetta / Razor: **319,634.2** (319,634.2-319,634.2) | Flora / Rosetta / Bruno: 6,581.6<br>Flora / Rosetta / Orvella: 5,469<br>Flora / Bliss / Orvella: 4,808.1 | Tizu / Flora / Orvella: 2,094.5<br>Tizu / Bruno / Orvella: 1,943<br>Infernis / Tizu / Bruno: 1,907.2 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":1440000,"calamiticTokens":400,"rarities":{"Calamitic":4,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

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
| 1 | Infernis: **84,899.3** (84,899.3-84,899.3)<br>Rosetta: **76,795.8** (76,795.8-76,795.8)<br>Vaelor: **38,736.7** (38,736.7-38,736.7) | Flora: 3,629<br>Infernis: 287.1<br>Crinso: 182.2 | Tizu: 3,903.6<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Rosetta: **477,338.7** (477,338.7-477,338.7)<br>Rosetta / Disciple: **390,354.8** (390,354.8-390,354.8)<br>Infernis / Disciple: **333,162.4** (333,162.4-333,162.4) | Flora / Rosetta: 12,605.8<br>Flora / Bliss: 9,960<br>Flora / Orvella: 9,898 | Tizu / Orvella: 9,817.2<br>Tizu / Disciple: 6,034.6<br>Tizu / Flora: 4,852.1 |
| 3 | Infernis / Rosetta / Disciple: **1,817,657.7** (1,817,657.7-1,817,657.7)<br>Infernis / Rosetta / Thornia: **1,492,508.2** (1,492,508.2-1,492,508.2)<br>Infernis / Rosetta / Crinso: **1,450,926.2** (1,450,926.2-1,450,926.2) | Flora / Rosetta / Orvella: 21,875.9<br>Flora / Rosetta / Bruno: 21,747.9<br>Flora / Bliss / Orvella: 20,068.7 | Tizu / Flora / Orvella: 10,423.2<br>Tizu / Bruno / Orvella: 9,817.2<br>Infernis / Tizu / Bruno: 8,582.3 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":1440000,"calamiticTokens":400,"rarities":{"Calamitic":4,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

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
| 1 | Infernis: **201,737** (201,737-201,737)<br>Vaelor: **127,338.2** (127,338.2-127,338.2)<br>Rosetta: **118,962.8** (118,962.8-118,962.8) | Flora: 10,213.3<br>Infernis: 609.2<br>Tizu: 0 | Tizu: 11,127.5<br>Infernis: 0<br>Flora: 0 |
| 2 | Infernis / Rosetta: **1,285,777.7** (1,285,777.7-1,285,777.7)<br>Infernis / Disciple: **943,855.7** (943,855.7-943,855.7)<br>Rosetta / Crinso: **860,605.8** (860,605.8-860,605.8) | Flora / Orvella: 26,199.2<br>Flora / Rosetta: 24,399.5<br>Flora / Bruno: 24,094.2 | Tizu / Disciple: 17,776.7<br>Tizu / Orvella: 15,820.9<br>Bruno / Elise: 14,459.3 |
| 3 | Infernis / Rosetta / Disciple: **6,524,288.3** (6,524,288.3-6,524,288.3)<br>Rosetta / Bliss / Disciple: **4,905,648.1** (4,905,648.1-4,905,648.1)<br>Infernis / Rosetta / Crinso: **4,373,712.4** (4,373,712.4-4,373,712.4) | Flora / Rosetta / Orvella: 49,325.1<br>Flora / Rosetta / Bruno: 45,220.9<br>Flora / Bliss / Orvella: 44,008.1 | Rosetta / Crinso / Bruno: 24,322.6<br>Tizu / Disciple / Orvella: 23,770.5<br>Tizu / Bruno / Elise: 22,146.7 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":1440000,"calamiticTokens":400,"rarities":{"Calamitic":4,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

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
| 1 | Infernis: **394,329.8** (394,329.8-394,329.8)<br>Vaelor: **345,374.9** (345,374.9-345,374.9)<br>Rosetta: **281,856.7** (281,856.7-281,856.7) | Flora: 17,422.6<br>Infernis: 1,039.8<br>Rosetta: 588.8 | Tizu: 25,539.7<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Disciple: **3,515,111.3** (3,515,111.3-3,515,111.3)<br>Infernis / Rosetta: **2,809,125.6** (2,809,125.6-2,809,125.6)<br>Rosetta / Crinso: **2,573,673.3** (2,573,673.3-2,573,673.3) | Flora / Rosetta: 53,023.5<br>Flora / Orvella: 45,219.1<br>Flora / Bruno: 41,101.8 | Tizu / Orvella: 58,893.8<br>Tizu / Disciple: 41,855.8<br>Rosetta / Bruno: 33,249.6 |
| 3 | Rosetta / Crinso / Disciple: **20,240,852.2** (20,240,852.2-20,240,852.2)<br>Infernis / Rosetta / Disciple: **19,036,864.3** (19,036,864.3-19,036,864.3)<br>Rosetta / Disciple / Razor: **18,210,689.1** (18,210,689.1-18,210,689.1) | Flora / Rosetta / Razor: 109,900.7<br>Flora / Rosetta / Aurora: 99,848.9<br>Flora / Rosetta / Crinso: 94,380.4 | Rosetta / Crinso / Bruno: 65,073.4<br>Rosetta / Bruno / Disciple: 64,794.5<br>Tizu / Nerithe / Orvella: 64,366.3 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":1440000,"calamiticTokens":400,"rarities":{"Calamitic":4,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

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
| 1 | Vaelor: **604,055.6** (604,055.6-604,055.6)<br>Infernis: **564,376.6** (564,376.6-564,376.6)<br>Rosetta: **412,035.3** (412,035.3-412,035.3) | Flora: 22,829.6<br>Infernis: 1,361.9<br>Rosetta: 514.4 | Tizu: 39,797.3<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Disciple: **6,466,564** (6,466,564-6,466,564)<br>Rosetta / Crinso: **4,432,787.8** (4,432,787.8-4,432,787.8)<br>Infernis / Rosetta: **4,409,360.7** (4,409,360.7-4,409,360.7) | Flora / Rosetta: 68,968.1<br>Flora / Orvella: 59,252.6<br>Flora / Bliss: 54,512.2 | Tizu / Disciple: 65,917.2<br>Rosetta / Bruno: 54,040.3<br>Tizu / Thornia: 50,538.5 |
| 3 | Rosetta / Crinso / Disciple: **43,843,129.4** (43,843,129.4-43,843,129.4)<br>Rosetta / Disciple / Razor: **39,152,942.2** (39,152,942.2-39,152,942.2)<br>Infernis / Rosetta / Disciple: **34,840,347.2** (34,840,347.2-34,840,347.2) | Flora / Rosetta / Razor: 144,008.3<br>Flora / Rosetta / Aurora: 132,116.8<br>Flora / Rosetta / Crinso: 123,671.1 | Rosetta / Crinso / Bruno: 99,173.2<br>Tizu / Rosetta / Bruno: 97,182.9<br>Rosetta / Bruno / Disciple: 95,223.4 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":963600,"calamiticTokens":200,"rarities":{"Calamitic":2,"Legendary":1,"Rare":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

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
| 1 | Vaelor: **945,822** (945,822-945,822)<br>Infernis: **757,004.9** (757,004.9-757,004.9)<br>Crinso: **487,653.7** (487,653.7-487,653.7) | Flora: 28,236.7<br>Infernis: 1,684.9<br>Tizu: 0 | Tizu: 57,053.8<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Disciple: **6,212,095.6** (6,212,095.6-6,212,095.6)<br>Disciple / Vaelor: **5,629,604.1** (5,629,604.1-5,629,604.1)<br>Rosetta / Crinso: **5,530,992** (5,530,992-5,530,992) | Flora / Rosetta: 85,302.7<br>Flora / Orvella: 73,286.2<br>Flora / Bliss: 69,540.8 | Tizu / Disciple: 95,222.9<br>Rosetta / Bruno: 93,649.7<br>Atmoso / Bruno: 80,271.2 |
| 3 | Rosetta / Crinso / Disciple: **61,558,714.2** (61,558,714.2-61,558,714.2)<br>Rosetta / Disciple / Razor: **55,793,139.9** (55,793,139.9-55,793,139.9)<br>Infernis / Rosetta / Disciple: **51,848,842.2** (51,848,842.2-51,848,842.2) | Flora / Rosetta / Orvella: 193,857.3<br>Flora / Rosetta / Aurora: 163,406.7<br>Flora / Rosetta / Thornia: 143,471.7 | Rosetta / Crinso / Bruno: 146,113.4<br>Rosetta / Bruno / Disciple: 145,898.8<br>Tizu / Bruno / Vaelor: 130,845.3 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":963600,"calamiticTokens":200,"rarities":{"Calamitic":2,"Legendary":1,"Rare":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

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
| 1 | Vaelor: **1,012,542.6** (1,012,542.6-1,012,542.6)<br>Infernis: **790,600.9** (790,600.9-790,600.9)<br>Crinso: **526,116.8** (526,116.8-526,116.8) | Flora: 29,137.8<br>Infernis: 1,738.7<br>Tizu: 0 | Tizu: 60,606.3<br>Infernis: 0<br>Flora: 0 |
| 2 | Rosetta / Disciple: **6,740,638.4** (6,740,638.4-6,740,638.4)<br>Disciple / Vaelor: **6,091,912.1** (6,091,912.1-6,091,912.1)<br>Rosetta / Crinso: **5,935,332** (5,935,332-5,935,332) | Flora / Rosetta: 88,025.1<br>Flora / Orvella: 75,625.1<br>Flora / Bliss: 72,245.8 | Rosetta / Bruno: 113,084.2<br>Tizu / Disciple: 100,722.4<br>Tizu / Flora: 86,047.7 |
| 3 | Rosetta / Crinso / Disciple: **67,152,728.9** (67,152,728.9-67,152,728.9)<br>Rosetta / Disciple / Razor: **60,860,416.9** (60,860,416.9-60,860,416.9)<br>Infernis / Rosetta / Disciple: **55,970,095.8** (55,970,095.8-55,970,095.8) | Flora / Rosetta / Orvella: 200,044.4<br>Flora / Rosetta / Aurora: 180,312.8<br>Flora / Rosetta / Thornia: 148,050.8 | Tizu / Thornia / Orvella: 165,291.6<br>Tizu / Crinso / Orvella: 165,291.6<br>Tizu / Razor / Orvella: 165,291.6 |

Top solo gear budget (distinct account unlocks): {"prismatica":0,"components":963600,"calamiticTokens":200,"rarities":{"Calamitic":2,"Legendary":1,"Rare":1,"Omnic":4},"masters":1}. Does not include leveling, fodder or recruitment.

## Additional equipped stats at level105

Core stat tables above are naked. These are the actual sampled ceiling loadouts, before situational combat buffs. The four additional Phase0 stats start at Skill Power100%, Duration0 extra turns, Efficiency0%, Gauge Gain100% and do not scale with level; equipment changes them. Efficiency remains subject to the live50% cap and action-specific Gauge floors.

| Element-Bearer | Equipped HP / ATK / DEF | Skill Power | Duration | Efficiency | Gauge gain |
|---|---|---:|---:|---:|---:|
| Infernis | 15,338.1 /1,704.8 /260.9 | 265% | 0 | 50% | 135% |
| Tizu | 34,204.6 /2,091.6 /838.6 | 787.5% | 0 | 50% | 100% |
| Flora | 48,563 /776 /275.8 | 992.5% | 0 | 50% | 202.5% |
| Rosetta | 49,242.7 /1,042.8 /486.8 | 1,040% | 0 | 50% | 220% |
| Thornia | 42,437.5 /3,007 /526.7 | 850% | 0 | 50% | 135% |
| Crinso | 31,070.3 /3,977 /278.8 | 617.5% | 0 | 50% | 100% |
| Atmoso | 26,969 /5,116.5 /234.8 | 587.5% | 0 | 50% | 152.5% |
| Aurora | 50,964.4 /776 /503.1 | 1,015% | 0 | 50% | 220% |
| Bliss | 45,959.8 /1,884.2 /442.6 | 932.5% | 0 | 50% | 220% |
| Bruno | 66,002.4 /1,125.2 /763.1 | 1,285% | 0 | 50% | 137.5% |
| Disciple | 36,375 /3,492 /340.8 | 760% | 0 | 50% | 100% |
| Elise | 25,653.5 /5,587.2 /208.7 | 567.5% | 0 | 50% | 152.5% |
| Razor | 50,985.6 /3,104 /588.6 | 947.5% | 0 | 50% | 130% |
| Nerithe | 30,915.7 /3,516.3 /566.3 | 692.5% | 0 | 50% | 100% |
| Orvella | 77,478.7 /776 /689.5 | 1,480% | 0 | 50% | 137.5% |
| Vaelor | 27,626.8 /6,394.7 /287 | 557.5% | 0 | 50% | 152.5% |

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
| 0 /ceiling | Infernis / Tizu / Flora | 33,788.3 | 2,311.9 /439.6 | 4,228.8 |
| 0 /ceiling | Infernis / Atmoso / Elise | 49,648.4 | 205.1 /0 | 2,363.8 |
| 0 /ceiling | Tizu / Flora / Razor | 11,132.4 | 2,704.4 /1,150.7 | 5,408.8 |
| 0 /ceiling | Infernis / Bliss / Disciple | 87,793.1 | 754.3 /0 | 4,753.8 |
| 0 /ceiling | Rosetta / Thornia / Crinso | 147,449.3 | 935.9 /22.2 | 4,989.5 |
| 0 /ceiling | Rosetta / Bliss / Disciple | 218,143.1 | 329.7 /15.3 | 4,941 |
| 20 /planned | Infernis / Tizu / Flora | 2,747.1 | 2,149.6 /635.3 | 6,700 |
| 20 /planned | Infernis / Atmoso / Elise | 2,867.6 | 0 /0 | 6,200 |
| 20 /planned | Tizu / Flora / Razor | 1,696.6 | 2,374.2 /750.8 | 7,400 |
| 20 /planned | Infernis / Bliss / Disciple | 3,112.9 | 96.8 /0 | 6,700 |
| 20 /planned | Rosetta / Thornia / Crinso | 2,401.3 | 0 /31.6 | 7,100 |
| 20 /planned | Rosetta / Bliss / Disciple | 2,336.6 | 111.4 /30 | 6,750 |
| 20 /ceiling | Infernis / Tizu / Flora | 155,225 | 9,246.9 /1,962.3 | 16,915 |
| 20 /ceiling | Infernis / Atmoso / Elise | 289,879.3 | 819.7 /0 | 9,455 |
| 20 /ceiling | Tizu / Flora / Razor | 61,737.7 | 10,817.5 /5,809.4 | 21,635 |
| 20 /ceiling | Infernis / Bliss / Disciple | 467,083.1 | 3,505 /0 | 19,015 |
| 20 /ceiling | Rosetta / Thornia / Crinso | 696,930.2 | 2,230.4 /88.7 | 19,958 |
| 20 /ceiling | Rosetta / Bliss / Disciple | 1,195,427.4 | 1,459.7 /61.2 | 19,764 |
| 40 /planned | Infernis / Tizu / Flora | 6,966.7 | 4,567.9 /1,349.9 | 14,237.5 |
| 40 /planned | Infernis / Atmoso / Elise | 7,010.7 | 0 /0 | 13,175 |
| 40 /planned | Tizu / Flora / Razor | 3,862.3 | 5,045.1 /1,595.3 | 15,725 |
| 40 /planned | Infernis / Bliss / Disciple | 7,698.5 | 205.7 /0 | 14,237.5 |
| 40 /planned | Rosetta / Thornia / Crinso | 5,560.5 | 0 /67.1 | 15,087.5 |
| 40 /planned | Rosetta / Bliss / Disciple | 5,312.2 | 236.7 /63.8 | 14,343.8 |
| 40 /ceiling | Infernis / Tizu / Flora | 394,808.2 | 23,777.6 /5,352.7 | 37,543.2 |
| 40 /ceiling | Infernis / Atmoso / Elise | 701,720.7 | 1,607.3 /0 | 20,091.9 |
| 40 /ceiling | Tizu / Flora / Razor | 201,701.7 | 30,022.9 /15,383.7 | 50,038.2 |
| 40 /ceiling | Infernis / Bliss / Disciple | 1,507,612.4 | 9,741.5 /0 | 40,406.9 |
| 40 /ceiling | Rosetta / Thornia / Crinso | 2,337,225.1 | 5,280.9 /188.5 | 42,410.8 |
| 40 /ceiling | Rosetta / Bliss / Disciple | 4,905,648.1 | 3,550.3 /130 | 41,998.5 |
| 60 /planned | Infernis / Tizu / Flora | 12,176.4 | 6,986.1 /2,064.6 | 21,775 |
| 60 /planned | Infernis / Atmoso / Elise | 12,199.8 | 0 /0 | 20,150 |
| 60 /planned | Tizu / Flora / Razor | 6,264.9 | 7,716 /2,439.9 | 24,050 |
| 60 /planned | Infernis / Bliss / Disciple | 13,734.4 | 314.6 /0 | 21,775 |
| 60 /planned | Rosetta / Thornia / Crinso | 9,311.7 | 0 /102.6 | 23,075 |
| 60 /planned | Rosetta / Bliss / Disciple | 9,399.7 | 362 /97.5 | 21,937.5 |
| 60 /ceiling | Infernis / Tizu / Flora | 861,514.9 | 40,561.6 /12,536 | 64,044.3 |
| 60 /ceiling | Infernis / Atmoso / Elise | 2,132,129.9 | 2,285.6 /0 | 34,274.4 |
| 60 /ceiling | Tizu / Flora / Razor | 552,907.1 | 51,215.6 /34,990.3 | 85,359.3 |
| 60 /ceiling | Infernis / Bliss / Disciple | 4,251,052.7 | 18,979.4 /0 | 68,929.4 |
| 60 /ceiling | Rosetta / Thornia / Crinso | 4,859,257.3 | 28,290.4 /375.9 | 84,582.1 |
| 60 /ceiling | Rosetta / Bliss / Disciple | 11,394,090.3 | 31,690.9 /276.1 | 83,878.9 |
| 80 /planned | Infernis / Tizu / Flora | 20,437 | 10,210.5 /3,017.4 | 31,825 |
| 80 /planned | Infernis / Atmoso / Elise | 20,219 | 0 /0 | 29,450 |
| 80 /planned | Tizu / Flora / Razor | 9,881.7 | 11,277.3 /3,566.1 | 35,150 |
| 80 /planned | Infernis / Bliss / Disciple | 22,853.7 | 459.8 /0 | 31,825 |
| 80 /planned | Rosetta / Thornia / Crinso | 15,270.2 | 0 /149.9 | 33,725 |
| 80 /planned | Rosetta / Bliss / Disciple | 15,640.3 | 529 /142.5 | 32,062.5 |
| 80 /ceiling | Infernis / Tizu / Flora | 1,327,129.7 | 53,149.3 /19,671.1 | 83,920.1 |
| 80 /ceiling | Infernis / Atmoso / Elise | 3,906,502.2 | 3,967.8 /0 | 59,517.5 |
| 80 /ceiling | Tizu / Flora / Razor | 955,756.7 | 67,110.1 /54,185.6 | 111,850.1 |
| 80 /ceiling | Infernis / Bliss / Disciple | 7,759,323.8 | 30,980.3 /0 | 90,321.3 |
| 80 /ceiling | Rosetta / Thornia / Crinso | 8,321,092.2 | 37,070.2 /492.6 | 110,831.8 |
| 80 /ceiling | Rosetta / Bliss / Disciple | 22,539,360.9 | 41,897 /361.8 | 109,910.3 |
| 100 /planned | Infernis / Tizu / Flora | 27,970.3 | 12,628.8 /3,732.1 | 39,362.5 |
| 100 /planned | Infernis / Atmoso / Elise | 27,772.1 | 0 /0 | 36,425 |
| 100 /planned | Tizu / Flora / Razor | 13,098.7 | 13,948.2 /4,410.7 | 43,475 |
| 100 /planned | Infernis / Bliss / Disciple | 31,112 | 568.7 /0 | 39,362.5 |
| 100 /planned | Rosetta / Thornia / Crinso | 20,097.7 | 0 /185.4 | 41,712.5 |
| 100 /planned | Rosetta / Bliss / Disciple | 21,068.7 | 654.3 /176.3 | 39,656.3 |
| 100 /ceiling | Infernis / Tizu / Flora | 1,901,284 | 65,737.6 /28,343.3 | 103,796 |
| 100 /ceiling | Infernis / Atmoso / Elise | 5,569,492.4 | 4,417 /0 | 73,613.8 |
| 100 /ceiling | Tizu / Flora / Razor | 1,496,689.3 | 83,004.6 /77,329.7 | 138,341 |
| 100 /ceiling | Infernis / Bliss / Disciple | 13,065,206.9 | 39,391.9 /0 | 111,713.1 |
| 100 /ceiling | Rosetta / Thornia / Crinso | 12,938,719.1 | 45,849.5 /609.3 | 137,081.4 |
| 100 /ceiling | Rosetta / Bliss / Disciple | 39,868,762.9 | 52,278.8 /447.5 | 135,941.6 |
| 105 /planned | Infernis / Tizu / Flora | 29,619.3 | 13,031.8 /3,851.2 | 40,618.8 |
| 105 /planned | Infernis / Atmoso / Elise | 29,191.1 | 0 /0 | 37,587.5 |
| 105 /planned | Tizu / Flora / Razor | 13,801.4 | 14,393.4 /4,551.4 | 44,862.5 |
| 105 /planned | Infernis / Bliss / Disciple | 32,696.1 | 586.9 /0 | 40,618.8 |
| 105 /planned | Rosetta / Thornia / Crinso | 20,978.9 | 0 /191.3 | 43,043.8 |
| 105 /planned | Rosetta / Bliss / Disciple | 22,040.6 | 675.2 /181.9 | 40,921.9 |
| 105 /ceiling | Infernis / Tizu / Flora | 2,009,137 | 67,835.7 /30,024.4 | 107,108.6 |
| 105 /ceiling | Infernis / Atmoso / Elise | 6,065,407.3 | 5,064.4 /0 | 75,963.1 |
| 105 /ceiling | Tizu / Flora / Razor | 1,603,709.8 | 85,653.7 /81,792.6 | 142,756.1 |
| 105 /ceiling | Infernis / Bliss / Disciple | 14,073,898.1 | 41,243.2 /0 | 115,278.4 |
| 105 /ceiling | Rosetta / Thornia / Crinso | 13,826,472.9 | 47,313.2 /628.7 | 141,456.3 |
| 105 /ceiling | Rosetta / Bliss / Disciple | 43,185,382 | 54,014.3 /461.8 | 140,280.2 |

## Tanking and support capacity by character

Tank probe: full HP before a fully funded single action (or none), choosing the action that survives the largest scheduled noncritical post-Defense packet through real incoming hooks. Live stat changes do not grant free healing. No opponent Attack/level is selected. Defense is listed separately; do NOT add it as HP or compare these packets with pre-Defense damage. It is not sustained tanking, and cooldown-based rescue/deferral can inflate one-hit results. Equipment is the sampled output build, not an exhaustive defensive-build search.
The packet uses a fixed non-proc first roll (0.7769), so Stasis is not credited with a lucky save. No test of sustained incoming pressure, enemy Normal evasion or incoming-crit support is implied.

| Lv | Bearer | Planned HPR / SPR | Ceiling HPR / SPR | Ceiling HP / DEF | Precharged shield | One-hit post-DEF packet survived |
|---:|---|---|---|---|---:|---:|
| 0 | Infernis | 0 /0 | 71.8 /0 | 632.5 /28 | 0 | none: >=63,250 |
| 0 | Tizu | 0 /187.7 | 0 /761.7 | 1,410.5 /90 | 1,777.2 | ultimate: 5,795.5 |
| 0 | Flora | 152.4 /0 | 907.2 /0 | 1,814.5 /29.6 | 0 | none: 1,814.5 |
| 0 | Rosetta | 0 /0 | 0 /0 | 1,186.9 /52.3 | 0 | none: 1,186.5 |
| 0 | Thornia | 0 /0 | 0 /0 | 1,750 /56.5 | 0 | none: 1,749.5 |
| 0 | Crinso | 0 /0 | 45.8 /0 | 1,281.3 /29.9 | 0 | none: 1,281.5 |
| 0 | Atmoso | 0 /0 | 0 /0 | 343.4 /25.2 | 0 | none: 343.5 |
| 0 | Aurora | 0 /0 | 0 /0 | 1,940.4 /50 | 0 | skill1: 9,702.5 |
| 0 | Bliss | 0 /0 | 0 /0 | 1,895.3 /47.5 | 0 | none: 1,895.5 |
| 0 | Bruno | 0 /0 | 0 /0 | 2,721.7 /81.9 | 0 | skill2: 5,134.9 |
| 0 | Disciple | 0 /0 | 0 /0 | 1,500 /36.6 | 0 | none: 1,499.5 |
| 0 | Elise | 0 /0 | 0 /0 | 1,057.9 /22.4 | 0 | none: 1,057.5 |
| 0 | Razor | 0 /0 | 0 /0 | 1,812.5 /63.2 | 0 | skill2: 4,073 |
| 0 | Nerithe | 0 /0 | 0 /0 | 1,274.9 /60.8 | 0 | none: 1,274.5 |
| 0 | Orvella | 0 /0 | 0 /0 | 3,030 /74 | 0 | skill2: 3,787.5 |
| 0 | Vaelor | 0 /0 | 0 /0 | 1,139.3 /30.8 | 0 | none: 1,139.5 |
| 20 | Infernis | 0 /0 | 287.1 /0 | 2,530 /73.9 | 0 | none: >=253,000 |
| 20 | Tizu | 0 /750.8 | 0 /3,903.6 | 5,642 /237.5 | 9,108.3 | ultimate: 26,819.1 |
| 20 | Flora | 609.6 /0 | 3,629 /0 | 7,258 /78.1 | 0 | none: 7,257.5 |
| 20 | Rosetta | 0 /0 | 0 /0 | 4,747.5 /137.9 | 0 | none: 4,747.5 |
| 20 | Thornia | 0 /0 | 0 /0 | 7,000 /149.2 | 0 | none: 6,999.5 |
| 20 | Crinso | 0 /0 | 182.2 /0 | 5,125 /79 | 0 | none: 5,124.5 |
| 20 | Atmoso | 0 /0 | 0 /0 | 1,373.5 /66.5 | 0 | none: 1,373.5 |
| 20 | Aurora | 0 /0 | 0 /0 | 7,761.5 /132 | 0 | skill1: 38,807.5 |
| 20 | Bliss | 0 /0 | 0 /0 | 7,581 /125.4 | 0 | none: 7,580.5 |
| 20 | Bruno | 0 /0 | 0 /0 | 10,887 /216.1 | 0 | skill2: 41,871.2 |
| 20 | Disciple | 0 /0 | 0 /0 | 6,000 /96.5 | 0 | none: 5,999.5 |
| 20 | Elise | 0 /0 | 0 /0 | 4,231.5 /59.1 | 0 | none: 4,231.5 |
| 20 | Razor | 0 /0 | 0 /0 | 7,250 /166.7 | 0 | skill2: 36,247.5 |
| 20 | Nerithe | 0 /0 | 0 /0 | 5,099.5 /160.4 | 0 | none: 5,099.5 |
| 20 | Orvella | 0 /0 | 0 /0 | 12,120 /195.3 | 0 | skill2: 15,149.5 |
| 20 | Vaelor | 0 /0 | 0 /0 | 4,557 /81.3 | 0 | none: 4,556.5 |
| 40 | Infernis | 0 /0 | 609.2 /0 | 5,376.3 /125.2 | 0 | none: >=537,625 |
| 40 | Tizu | 0 /1,595.3 | 0 /11,127.5 | 11,989.3 /402.6 | 25,964.2 | ultimate: 69,006.4 |
| 40 | Flora | 1,295.4 /0 | 10,213.3 /0 | 17,022.1 /132.4 | 0 | none: 17,022.5 |
| 40 | Rosetta | 0 /0 | 0 /0 | 10,088.4 /233.7 | 0 | none: 10,088.5 |
| 40 | Thornia | 0 /0 | 0 /0 | 14,875 /252.8 | 0 | none: 14,874.5 |
| 40 | Crinso | 0 /0 | 0 /0 | 10,890.6 /133.9 | 0 | none: 10,890.5 |
| 40 | Atmoso | 0 /0 | 0 /0 | 2,918.7 /112.7 | 0 | none: 2,918.5 |
| 40 | Aurora | 0 /0 | 0 /0 | 16,493.2 /223.6 | 0 | skill1: 82,467.5 |
| 40 | Bliss | 0 /0 | 0 /0 | 16,109.6 /212.5 | 0 | none: 16,109.5 |
| 40 | Bruno | 0 /0 | 0 /0 | 23,134.9 /366.3 | 0 | skill2: 115,672.5 |
| 40 | Disciple | 0 /0 | 0 /0 | 12,750 /163.6 | 0 | none: 12,749.5 |
| 40 | Elise | 0 /0 | 0 /0 | 8,991.9 /100.2 | 0 | none: 8,991.5 |
| 40 | Razor | 0 /0 | 0 /0 | 17,871.3 /282.6 | 0 | skill2: 89,357.5 |
| 40 | Nerithe | 0 /0 | 0 /0 | 10,836.4 /271.8 | 0 | none: 10,836.5 |
| 40 | Orvella | 0 /0 | 0 /0 | 25,755 /331 | 0 | skill2: 32,193.5 |
| 40 | Vaelor | 0 /0 | 0 /0 | 9,683.6 /137.8 | 0 | none: 9,683.5 |
| 60 | Infernis | 0 /0 | 1,039.8 /0 | 9,171.3 /182 | 0 | none: >=917,125 |
| 60 | Tizu | 0 /2,439.9 | 0 /25,539.7 | 20,452.3 /585.1 | 59,592.7 | ultimate: 145,535.5 |
| 60 | Flora | 1,981.1 /0 | 17,422.6 /0 | 29,037.7 /192.4 | 0 | none: 29,037.5 |
| 60 | Rosetta | 0 /0 | 588.8 /0 | 29,444.1 /339.7 | 0 | none: 29,444.5 |
| 60 | Thornia | 0 /0 | 0 /0 | 25,375 /367.4 | 0 | none: 25,374.5 |
| 60 | Crinso | 0 /0 | 0 /0 | 18,578.1 /194.5 | 0 | none: 18,578.5 |
| 60 | Atmoso | 0 /0 | 0 /0 | 4,978.9 /163.8 | 0 | none: 4,978.5 |
| 60 | Aurora | 0 /0 | 0 /0 | 28,135.4 /325 | 0 | skill1: 140,677.5 |
| 60 | Bliss | 0 /0 | 0 /0 | 27,481.1 /308.8 | 0 | none: 27,481.5 |
| 60 | Bruno | 0 /0 | 0 /0 | 39,465.4 /532.4 | 0 | skill2: 197,327.5 |
| 60 | Disciple | 0 /0 | 0 /0 | 21,750 /237.8 | 0 | none: 21,749.5 |
| 60 | Elise | 0 /0 | 0 /0 | 15,339.2 /145.6 | 0 | none: 15,339.5 |
| 60 | Razor | 0 /0 | 0 /0 | 30,486.3 /410.7 | 0 | skill2: 152,432.5 |
| 60 | Nerithe | 0 /0 | 0 /0 | 18,485.7 /395.1 | 0 | none: 18,485.5 |
| 60 | Orvella | 0 /0 | 0 /0 | 46,327.5 /481 | 0 | skill2: 57,909.5 |
| 60 | Vaelor | 0 /0 | 0 /0 | 16,519.1 /200.2 | 0 | none: 16,519.5 |
| 80 | Infernis | 0 /0 | 1,361.9 /0 | 12,017.5 /219.9 | 0 | none: >=1,201,750 |
| 80 | Tizu | 0 /3,566.1 | 0 /39,797.3 | 26,799.5 /706.9 | 92,860.3 | ultimate: 217,562.7 |
| 80 | Flora | 2,895.5 /0 | 22,829.6 /0 | 38,049.4 /232.5 | 0 | none: 38,049.5 |
| 80 | Rosetta | 0 /0 | 514.4 /0 | 38,581.9 /410.4 | 0 | none: 38,581.5 |
| 80 | Thornia | 0 /0 | 0 /0 | 33,250 /444 | 0 | none: 33,249.5 |
| 80 | Crinso | 0 /0 | 0 /0 | 24,343.8 /235.1 | 0 | none: 24,343.5 |
| 80 | Atmoso | 0 /0 | 0 /0 | 21,130.4 /197.9 | 0 | none: 21,130.5 |
| 80 | Aurora | 0 /0 | 0 /0 | 37,888.4 /373.1 | 0 | skill1: 189,442.5 |
| 80 | Bliss | 0 /0 | 0 /0 | 36,009.8 /373.1 | 0 | none: 36,009.5 |
| 80 | Bruno | 0 /0 | 0 /0 | 51,713.2 /643.3 | 0 | skill2: 258,567.5 |
| 80 | Disciple | 0 /0 | 0 /0 | 28,500 /287.3 | 0 | none: 28,499.5 |
| 80 | Elise | 0 /0 | 0 /0 | 20,099.6 /175.9 | 0 | none: 20,099.5 |
| 80 | Razor | 0 /0 | 0 /0 | 39,947.5 /496.2 | 0 | skill2: 199,737.5 |
| 80 | Nerithe | 0 /0 | 0 /0 | 24,222.6 /477.4 | 0 | none: 24,222.5 |
| 80 | Orvella | 0 /0 | 0 /0 | 60,705 /581.2 | 0 | skill2: 75,881.5 |
| 80 | Vaelor | 0 /0 | 0 /0 | 21,645.8 /241.9 | 0 | none: 21,645.5 |
| 100 | Infernis | 0 /0 | 1,684.9 /0 | 14,863.7 /255.2 | 0 | none: >=1,486,375 |
| 100 | Tizu | 0 /4,410.7 | 0 /57,053.8 | 33,146.8 /820.3 | 133,125.6 | ultimate: 302,313.6 |
| 100 | Flora | 3,581.3 /0 | 28,236.7 /0 | 47,061.1 /269.8 | 0 | none: 47,061.5 |
| 100 | Rosetta | 0 /0 | 0 /0 | 47,719.7 /476.2 | 0 | none: 47,719.5 |
| 100 | Thornia | 0 /0 | 0 /0 | 41,125 /515.2 | 0 | none: 41,124.5 |
| 100 | Crinso | 0 /0 | 0 /0 | 30,109.4 /272.8 | 0 | none: 30,109.5 |
| 100 | Atmoso | 0 /0 | 0 /0 | 26,134.9 /229.7 | 0 | none: 26,134.5 |
| 100 | Aurora | 0 /0 | 0 /0 | 46,861.9 /433 | 0 | skill1: 234,307.5 |
| 100 | Bliss | 0 /0 | 0 /0 | 44,538.4 /433 | 0 | none: 44,538.5 |
| 100 | Bruno | 0 /0 | 0 /0 | 63,961.1 /746.5 | 0 | skill2: 319,807.5 |
| 100 | Disciple | 0 /0 | 0 /0 | 35,250 /333.4 | 0 | none: 35,249.5 |
| 100 | Elise | 0 /0 | 0 /0 | 24,860.1 /204.2 | 0 | none: 24,860.5 |
| 100 | Razor | 0 /0 | 0 /0 | 49,408.8 /575.8 | 0 | skill2: 247,042.5 |
| 100 | Nerithe | 0 /0 | 0 /0 | 29,959.6 /554 | 0 | none: 29,959.5 |
| 100 | Orvella | 0 /0 | 0 /0 | 75,082.5 /674.5 | 0 | skill2: 93,853.5 |
| 100 | Vaelor | 0 /0 | 0 /0 | 26,772.4 /280.7 | 0 | none: 26,772.5 |
| 105 | Infernis | 0 /0 | 1,738.7 /0 | 15,338.1 /260.9 | 0 | none: >=1,533,812.5 |
| 105 | Tizu | 0 /4,551.4 | 0 /60,606.3 | 34,204.6 /838.6 | 141,414.7 | ultimate: 319,308.2 |
| 105 | Flora | 3,695.6 /0 | 29,137.8 /0 | 48,563 /275.8 | 0 | none: 48,563.5 |
| 105 | Rosetta | 0 /0 | 0 /0 | 49,242.7 /486.8 | 0 | none: 49,242.5 |
| 105 | Thornia | 0 /0 | 0 /0 | 42,437.5 /526.7 | 0 | none: 42,437.5 |
| 105 | Crinso | 0 /0 | 0 /0 | 31,070.3 /278.8 | 0 | none: 31,070.5 |
| 105 | Atmoso | 0 /0 | 0 /0 | 26,969 /234.8 | 0 | none: 26,969.5 |
| 105 | Aurora | 0 /0 | 0 /0 | 50,964.4 /503.1 | 0 | skill1: 254,822.5 |
| 105 | Bliss | 0 /0 | 0 /0 | 45,959.8 /442.6 | 0 | none: 45,959.5 |
| 105 | Bruno | 0 /0 | 0 /0 | 66,002.4 /763.1 | 0 | skill2: 330,012.5 |
| 105 | Disciple | 0 /0 | 0 /0 | 36,375 /340.8 | 0 | none: 36,374.5 |
| 105 | Elise | 0 /0 | 0 /0 | 25,653.5 /208.7 | 0 | none: 25,653.5 |
| 105 | Razor | 0 /0 | 0 /0 | 50,985.6 /588.6 | 0 | skill2: 254,927.5 |
| 105 | Nerithe | 0 /0 | 0 /0 | 30,915.7 /566.3 | 0 | none: 30,915.5 |
| 105 | Orvella | 0 /0 | 0 /0 | 77,478.7 /689.5 | 0 | skill2: 96,848.5 |
| 105 | Vaelor | 0 /0 | 0 /0 | 27,626.8 /287 | 0 | none: 27,626.5 |

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
- **Infernis:** Cathedral of the Final Equation; Causality Funeral Engine; Horizon-Cleaving Godpress; Throne of Borrowed Tomorrows; Cinder Testament; Phoenix Lifeforge; Phoenix Reactor; Pyre Census Requiem; Master: master-ember-3.
- **Tizu:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Undertide Chronometer; Leviathan Ward Loom; Abyssal Clearwater Parliament; Leviathan Mercy Reflector; Master: master-tide-3.
- **Flora:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Verdant Covenant; Worldgrove Covercharge Heart; Worldroot Triage Sanctuary; Worldroot Graft Coronation; Master: master-sprout-3.
- **Rosetta:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Stillhour Carillon; Firstlight Concordance; Aegis Covenant Crown; Accord Seraph Sanctuary; Master: master-rosetta-1.
- **Thornia:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-thornia-3.
- **Crinso:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-crinso-1.
- **Atmoso:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Griffin Turbine; Skythread Rudder; Stormstep Dynamo; Thunderbird Coil; Master: master-atmoso-3.
- **Aurora:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Stillhour Carillon; Firstlight Concordance; Aegis Covenant Crown; Accord Seraph Sanctuary; Master: master-aurora-1.
- **Bliss:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Stillhour Carillon; Firstlight Concordance; Aegis Covenant Crown; Accord Seraph Sanctuary; Master: master-bliss-2.
- **Bruno:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Verdant Covenant; Worldgrove Covercharge Heart; Worldroot Triage Sanctuary; Worldroot Graft Coronation; Master: master-bruno-3.
- **Disciple:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-disciple-3.
- **Elise:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Griffin Turbine; Skythread Rudder; Stormstep Dynamo; Thunderbird Coil; Master: master-elise-2.
- **Razor:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Paradox Spindle; Fractured Mercy Governor; Ruinselect Fracture Parliament; Nightglass Archive; Master: master-razor-1.
- **Nerithe:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Undertide Chronometer; Leviathan Ward Loom; Abyssal Clearwater Parliament; Leviathan Mercy Reflector; Master: master-nerithe-1.
- **Orvella:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Verdant Covenant; Worldgrove Covercharge Heart; Worldroot Triage Sanctuary; Worldroot Graft Coronation; Master: master-orvella-1.
- **Vaelor:** Cathedral of the Final Equation; Immortal Vessel; Glassroot Gimbal; Throne of Borrowed Tomorrows; Griffin Turbine; Skythread Rudder; Stormstep Dynamo; Thunderbird Coil; Master: master-vaelor-2.

### Ceiling Master/package selection at each level

| Lv | Bearer | Output choice (variant / Master) | Highest measured healing alternative | Largest-HP alternative |
|---:|---|---|---|---|
| 0 | Infernis | standard /master-ember-3 | hybrid /master-ember-1: 212.7 HPR | hybrid /master-ember-1: 1,589.5 HP |
| 0 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | hybrid /master-tide-3: 1,410.5 HP |
| 0 | Flora | hybrid /master-sprout-1 | hybrid /master-sprout-3: 1,201.6 HPR | hybrid /master-sprout-3: 2,002.6 HP |
| 0 | Rosetta | standard /master-rosetta-1 | hybrid /master-rosetta-1: 27.1 HPR | hybrid /master-rosetta-2: 2,210.6 HP |
| 0 | Thornia | hybrid /master-thornia-3 | hybrid /master-thornia-3: 0 HPR | hybrid /master-thornia-2: 2,002 HP |
| 0 | Crinso | hybrid /master-crinso-3 | hybrid /master-crinso-3: 45.8 HPR | hybrid /master-crinso-3: 1,281.3 HP |
| 0 | Atmoso | standard /master-atmoso-3 | standard /master-atmoso-3: 0 HPR | hybrid /master-atmoso-2: 1,224.9 HP |
| 0 | Aurora | hybrid /master-aurora-2 | hybrid /master-aurora-2: 0 HPR | hybrid /master-aurora-1: 2,101.6 HP |
| 0 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | hybrid /master-bliss-2: 1,895.3 HP |
| 0 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | hybrid /master-bruno-2: 2,907 HP |
| 0 | Disciple | hybrid /master-disciple-3 | hybrid /master-disciple-3: 0 HPR | hybrid /master-disciple-1: 1,680 HP |
| 0 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | hybrid /master-elise-1: 1,145.6 HP |
| 0 | Razor | hybrid /master-razor-3 | hybrid /master-razor-3: 0 HPR | hybrid /master-razor-1: 2,102.5 HP |
| 0 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | hybrid /master-nerithe-1: 1,274.9 HP |
| 0 | Orvella | hybrid /master-orvella-2 | hybrid /master-orvella-2: 0 HPR | hybrid /master-orvella-1: 3,195 HP |
| 0 | Vaelor | hybrid /master-vaelor-1 | hybrid /master-vaelor-1: 0 HPR | hybrid /master-vaelor-1: 1,139.3 HP |
| 20 | Infernis | standard /master-ember-3 | hybrid /master-ember-1: 982.3 HPR | hybrid /master-ember-1: 6,358 HP |
| 20 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | hybrid /master-tide-3: 5,642 HP |
| 20 | Flora | hybrid /master-sprout-1 | hybrid /master-sprout-3: 4,806.2 HPR | hybrid /master-sprout-3: 8,010.4 HP |
| 20 | Rosetta | standard /master-rosetta-1 | hybrid /master-rosetta-1: 108.3 HPR | hybrid /master-rosetta-2: 8,842.5 HP |
| 20 | Thornia | hybrid /master-thornia-3 | hybrid /master-thornia-3: 0 HPR | hybrid /master-thornia-2: 8,008 HP |
| 20 | Crinso | hybrid /master-crinso-3 | hybrid /master-crinso-3: 182.2 HPR | hybrid /master-crinso-3: 5,125 HP |
| 20 | Atmoso | standard /master-atmoso-3 | standard /master-atmoso-3: 0 HPR | hybrid /master-atmoso-2: 4,899.5 HP |
| 20 | Aurora | hybrid /master-aurora-2 | hybrid /master-aurora-2: 0 HPR | hybrid /master-aurora-1: 8,406.5 HP |
| 20 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | hybrid /master-bliss-2: 7,581 HP |
| 20 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | hybrid /master-bruno-2: 11,628 HP |
| 20 | Disciple | hybrid /master-disciple-3 | hybrid /master-disciple-3: 0 HPR | hybrid /master-disciple-1: 6,720 HP |
| 20 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | hybrid /master-elise-1: 4,582.5 HP |
| 20 | Razor | hybrid /master-razor-3 | hybrid /master-razor-3: 0 HPR | hybrid /master-razor-1: 8,410 HP |
| 20 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | hybrid /master-nerithe-1: 5,099.5 HP |
| 20 | Orvella | hybrid /master-orvella-2 | hybrid /master-orvella-2: 0 HPR | hybrid /master-orvella-1: 12,780 HP |
| 20 | Vaelor | hybrid /master-vaelor-2 | hybrid /master-vaelor-2: 0 HPR | hybrid /master-vaelor-2: 4,557 HP |
| 40 | Infernis | standard /master-ember-3 | hybrid /master-ember-1: 2,515.3 HPR | hybrid /master-ember-1: 13,510.8 HP |
| 40 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | hybrid /master-tide-3: 11,989.3 HP |
| 40 | Flora | hybrid /master-sprout-3 | hybrid /master-sprout-3: 10,213.3 HPR | hybrid /master-sprout-3: 17,022.1 HP |
| 40 | Rosetta | standard /master-rosetta-1 | hybrid /master-rosetta-1: 115.1 HPR | hybrid /master-rosetta-2: 18,790.3 HP |
| 40 | Thornia | hybrid /master-thornia-3 | hybrid /master-thornia-3: 0 HPR | hybrid /master-thornia-2: 17,017 HP |
| 40 | Crinso | hybrid /master-crinso-1 | hybrid /master-crinso-3: 387.1 HPR | hybrid /master-crinso-1: 10,890.6 HP |
| 40 | Atmoso | standard /master-atmoso-3 | standard /master-atmoso-3: 0 HPR | hybrid /master-atmoso-2: 10,411.4 HP |
| 40 | Aurora | hybrid /master-aurora-2 | hybrid /master-aurora-2: 0 HPR | hybrid /master-aurora-1: 17,863.8 HP |
| 40 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | hybrid /master-bliss-2: 16,109.6 HP |
| 40 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | hybrid /master-bruno-2: 24,709.5 HP |
| 40 | Disciple | hybrid /master-disciple-3 | hybrid /master-disciple-3: 0 HPR | hybrid /master-disciple-1: 14,280 HP |
| 40 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | hybrid /master-elise-1: 9,737.8 HP |
| 40 | Razor | hybrid /master-razor-1 | hybrid /master-razor-1: 0 HPR | hybrid /master-razor-1: 17,871.3 HP |
| 40 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | hybrid /master-nerithe-1: 10,836.4 HP |
| 40 | Orvella | hybrid /master-orvella-2 | hybrid /master-orvella-2: 0 HPR | hybrid /master-orvella-1: 27,157.5 HP |
| 40 | Vaelor | hybrid /master-vaelor-2 | hybrid /master-vaelor-2: 0 HPR | hybrid /master-vaelor-2: 9,683.6 HP |
| 60 | Infernis | standard /master-ember-3 | hybrid /master-ember-1: 4,554.8 HPR | hybrid /master-ember-1: 23,047.8 HP |
| 60 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | hybrid /master-tide-3: 20,452.3 HP |
| 60 | Flora | hybrid /master-sprout-3 | hybrid /master-sprout-3: 17,422.6 HPR | hybrid /master-sprout-3: 29,037.7 HP |
| 60 | Rosetta | hybrid /master-rosetta-1 | hybrid /master-rosetta-1: 588.8 HPR | hybrid /master-rosetta-2: 32,054.1 HP |
| 60 | Thornia | hybrid /master-thornia-3 | hybrid /master-thornia-3: 0 HPR | hybrid /master-thornia-2: 29,029 HP |
| 60 | Crinso | hybrid /master-crinso-1 | hybrid /master-crinso-3: 660.4 HPR | hybrid /master-crinso-1: 18,578.1 HP |
| 60 | Atmoso | standard /master-atmoso-3 | standard /master-atmoso-3: 0 HPR | hybrid /master-atmoso-2: 17,760.7 HP |
| 60 | Aurora | hybrid /master-aurora-2 | hybrid /master-aurora-2: 0 HPR | hybrid /master-aurora-1: 30,473.6 HP |
| 60 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | hybrid /master-bliss-2: 27,481.1 HP |
| 60 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | hybrid /master-bruno-2: 42,151.5 HP |
| 60 | Disciple | hybrid /master-disciple-3 | hybrid /master-disciple-3: 0 HPR | hybrid /master-disciple-1: 24,360 HP |
| 60 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | hybrid /master-elise-1: 16,611.6 HP |
| 60 | Razor | hybrid /master-razor-1 | hybrid /master-razor-1: 0 HPR | hybrid /master-razor-1: 30,486.3 HP |
| 60 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | hybrid /master-nerithe-1: 18,485.7 HP |
| 60 | Orvella | hybrid /master-orvella-1 | hybrid /master-orvella-1: 0 HPR | hybrid /master-orvella-1: 46,327.5 HP |
| 60 | Vaelor | hybrid /master-vaelor-2 | hybrid /master-vaelor-2: 0 HPR | hybrid /master-vaelor-2: 16,519.1 HP |
| 80 | Infernis | standard /master-ember-3 | hybrid /master-ember-1: 6,107.7 HPR | hybrid /master-ember-1: 30,200.5 HP |
| 80 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | hybrid /master-tide-3: 26,799.5 HP |
| 80 | Flora | hybrid /master-sprout-3 | hybrid /master-sprout-3: 22,829.6 HPR | hybrid /master-sprout-3: 38,049.4 HP |
| 80 | Rosetta | hybrid /master-rosetta-1 | hybrid /master-rosetta-1: 514.4 HPR | hybrid /master-rosetta-2: 42,001.9 HP |
| 80 | Thornia | hybrid /master-thornia-3 | hybrid /master-thornia-3: 0 HPR | hybrid /master-thornia-2: 38,038 HP |
| 80 | Crinso | hybrid /master-crinso-1 | hybrid /master-crinso-3: 865.8 HPR | hybrid /master-crinso-1: 24,343.8 HP |
| 80 | Atmoso | hybrid /master-atmoso-3 | hybrid /master-atmoso-3: 0 HPR | hybrid /master-atmoso-2: 23,272.6 HP |
| 80 | Aurora | hybrid /master-aurora-3 | hybrid /master-aurora-3: 0 HPR | hybrid /master-aurora-1: 39,930.9 HP |
| 80 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | hybrid /master-bliss-2: 36,009.8 HP |
| 80 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | hybrid /master-bruno-2: 55,233 HP |
| 80 | Disciple | hybrid /master-disciple-3 | hybrid /master-disciple-3: 0 HPR | hybrid /master-disciple-1: 31,920 HP |
| 80 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | hybrid /master-elise-1: 21,766.9 HP |
| 80 | Razor | hybrid /master-razor-1 | hybrid /master-razor-1: 0 HPR | hybrid /master-razor-1: 39,947.5 HP |
| 80 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | hybrid /master-nerithe-1: 24,222.6 HP |
| 80 | Orvella | hybrid /master-orvella-1 | hybrid /master-orvella-1: 0 HPR | hybrid /master-orvella-1: 60,705 HP |
| 80 | Vaelor | hybrid /master-vaelor-2 | hybrid /master-vaelor-2: 0 HPR | hybrid /master-vaelor-2: 21,645.8 HP |
| 100 | Infernis | standard /master-ember-3 | hybrid /master-ember-1: 7,756.2 HPR | hybrid /master-ember-1: 37,353.3 HP |
| 100 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | hybrid /master-tide-3: 33,146.8 HP |
| 100 | Flora | hybrid /master-sprout-3 | hybrid /master-sprout-3: 28,236.7 HPR | hybrid /master-sprout-3: 47,061.1 HP |
| 100 | Rosetta | hybrid /master-rosetta-1 | glassroot /master-rosetta-3: 304.9 HPR | hybrid /master-rosetta-2: 51,949.7 HP |
| 100 | Thornia | hybrid /master-thornia-3 | hybrid /master-thornia-3: 0 HPR | hybrid /master-thornia-2: 47,047 HP |
| 100 | Crinso | hybrid /master-crinso-1 | hybrid /master-crinso-3: 1,070.7 HPR | hybrid /master-crinso-1: 30,109.4 HP |
| 100 | Atmoso | hybrid /master-atmoso-3 | hybrid /master-atmoso-3: 0 HPR | hybrid /master-atmoso-2: 28,784.6 HP |
| 100 | Aurora | hybrid /master-aurora-3 | hybrid /master-aurora-3: 0 HPR | hybrid /master-aurora-1: 49,388.2 HP |
| 100 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | hybrid /master-bliss-2: 44,538.4 HP |
| 100 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | hybrid /master-bruno-2: 68,314.5 HP |
| 100 | Disciple | hybrid /master-disciple-3 | hybrid /master-disciple-3: 0 HPR | hybrid /master-disciple-1: 39,480 HP |
| 100 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | hybrid /master-elise-1: 26,922.2 HP |
| 100 | Razor | hybrid /master-razor-1 | hybrid /master-razor-1: 0 HPR | hybrid /master-razor-1: 49,408.8 HP |
| 100 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | hybrid /master-nerithe-1: 29,959.6 HP |
| 100 | Orvella | hybrid /master-orvella-1 | hybrid /master-orvella-1: 0 HPR | hybrid /master-orvella-1: 75,082.5 HP |
| 100 | Vaelor | hybrid /master-vaelor-2 | hybrid /master-vaelor-2: 0 HPR | hybrid /master-vaelor-2: 26,772.4 HP |
| 105 | Infernis | standard /master-ember-3 | hybrid /master-ember-1: 8,047.7 HPR | hybrid /master-ember-1: 38,545.4 HP |
| 105 | Tizu | hybrid /master-tide-3 | hybrid /master-tide-3: 0 HPR | hybrid /master-tide-3: 34,204.6 HP |
| 105 | Flora | hybrid /master-sprout-3 | hybrid /master-sprout-3: 29,137.8 HPR | hybrid /master-sprout-3: 48,563 HP |
| 105 | Rosetta | hybrid /master-rosetta-1 | glassroot /master-rosetta-3: 2,517.3 HPR | hybrid /master-rosetta-2: 53,607.7 HP |
| 105 | Thornia | hybrid /master-thornia-3 | hybrid /master-thornia-3: 0 HPR | hybrid /master-thornia-2: 48,548.5 HP |
| 105 | Crinso | hybrid /master-crinso-1 | hybrid /master-crinso-3: 1,104.9 HPR | hybrid /master-crinso-1: 31,070.3 HP |
| 105 | Atmoso | hybrid /master-atmoso-3 | hybrid /master-atmoso-3: 0 HPR | hybrid /master-atmoso-2: 29,703.2 HP |
| 105 | Aurora | hybrid /master-aurora-1 | hybrid /master-aurora-1: 0 HPR | hybrid /master-aurora-1: 50,964.4 HP |
| 105 | Bliss | hybrid /master-bliss-2 | hybrid /master-bliss-2: 0 HPR | hybrid /master-bliss-2: 45,959.8 HP |
| 105 | Bruno | hybrid /master-bruno-3 | hybrid /master-bruno-3: 0 HPR | hybrid /master-bruno-2: 70,494.7 HP |
| 105 | Disciple | hybrid /master-disciple-3 | hybrid /master-disciple-3: 0 HPR | hybrid /master-disciple-1: 40,740 HP |
| 105 | Elise | hybrid /master-elise-2 | hybrid /master-elise-2: 0 HPR | hybrid /master-elise-1: 27,781.4 HP |
| 105 | Razor | hybrid /master-razor-1 | hybrid /master-razor-1: 0 HPR | hybrid /master-razor-1: 50,985.6 HP |
| 105 | Nerithe | hybrid /master-nerithe-1 | hybrid /master-nerithe-1: 0 HPR | hybrid /master-nerithe-1: 30,915.7 HP |
| 105 | Orvella | hybrid /master-orvella-1 | hybrid /master-orvella-1: 0 HPR | hybrid /master-orvella-1: 77,478.7 HP |
| 105 | Vaelor | hybrid /master-vaelor-2 | hybrid /master-vaelor-2: 0 HPR | hybrid /master-vaelor-2: 27,626.8 HP |

## Automated outlier flags (investigate, not nerf verdicts)

Ratios compare real sampled builds, not isolated causal effects. Shared gear, native loops, Gauge costs and role/pilot can all change together. A large ratio is a reason for a controlled follow-up, not proof of a bug.
- Lv.0: Infernis leads sampled ceiling solo output at **19,668.2 DPR**, 7.2x roster ceiling median and 63.1x its own planned build. Seed spread 19,668.2-19,668.2. 18 mean actions/18 cycles; 3 mean Last Flares.
- Lv.20: Infernis leads sampled ceiling solo output at **84,899.3 DPR**, 5.2x roster ceiling median and 54.8x its own planned build. Seed spread 84,899.3-84,899.3. 18 mean actions/18 cycles; 3 mean Last Flares.
- Lv.40: Infernis leads sampled ceiling solo output at **201,737 DPR**, 3.6x roster ceiling median and 50.8x its own planned build. Seed spread 201,737-201,737. 18 mean actions/18 cycles; 3 mean Last Flares.
- Lv.60: Infernis leads sampled ceiling solo output at **394,329.8 DPR**, 2.5x roster ceiling median and 55.5x its own planned build. Seed spread 394,329.8-394,329.8. 18 mean actions/18 cycles; 3 mean Last Flares.
- Lv.80: Vaelor leads sampled ceiling solo output at **604,055.6 DPR**, 2.3x roster ceiling median and 98.7x its own planned build. Seed spread 604,055.6-604,055.6. 18 mean actions/18 cycles; 0 mean Last Flares.
- Lv.100: Vaelor leads sampled ceiling solo output at **945,822 DPR**, 2.4x roster ceiling median and 118x its own planned build. Seed spread 945,822-945,822. 18 mean actions/18 cycles; 0 mean Last Flares.
- Lv.105: Vaelor leads sampled ceiling solo output at **1,012,542.6 DPR**, 2.4x roster ceiling median and 121.5x its own planned build. Seed spread 1,012,542.6-1,012,542.6. 18 mean actions/18 cycles; 0 mean Last Flares.

### Longer-run consistency checks

The leading measured solo, duo and trio in each of planned/ceiling were rerun for90 cycles across ten seeds. These test duration/crit consistency, not all possible rotations. The90-cycle metric uses only the final45 cycles.

| Profile | Team | 18-cycle DPR | 90-cycle DPR mean / seed range |
|---|---|---:|---|
| planned | Infernis | 17,711.2 | 18,835.3 /17,791.1-19,924.6 |
| planned | Infernis / Vaelor | 27,368.9 | 27,014.4 /25,177.3-28,517.8 |
| planned | Infernis / Rosetta / Vaelor | 38,981.1 | 35,585.6 /34,160-37,386 |
| ceiling | Vaelor | 1,012,542.6 | 884,023.8 /884,023.8-884,023.8 |
| ceiling | Rosetta / Disciple | 6,740,638.4 | 18,014,155.4 /18,014,155.4-18,014,155.4 |
| ceiling | Rosetta / Crinso / Disciple | 67,152,728.9 | 73,868,001.8 /73,868,001.8-73,868,001.8 |

### Controlled item-removal checks

Same selected Lv.105 solo/trio, pilot, ninety cycles and ten seeds. Remove the named item from every wearer (or every Master); leave those slots empty, do not substitute gear. Negative loss means the removal improved this particular rotation. This is a marginal effect in the tested package, not a universal item tier list.

| Team | Removed | Full-build DPR | Without DPR | Output lost |
|---|---|---:|---:|---:|
| Vaelor | glassroot-gimbal | 884,023.8 | 200,500.6 | 77.3% |
| Vaelor | immortal-vessel | 884,023.8 | 396,011.5 | 55.2% |
| Vaelor | calamitic-cathedral-final-equation | 884,023.8 | 155,194.5 | 82.4% |
| Vaelor | calamitic-throne-borrowed-tomorrows | 884,023.8 | 790,993.6 | 10.5% |
| Vaelor | masters | 884,023.8 | 701,071.2 | 20.7% |
| Rosetta / Crinso / Disciple | glassroot-gimbal | 73,868,001.8 | 7,130,184.4 | 90.3% |
| Rosetta / Crinso / Disciple | immortal-vessel | 73,868,001.8 | 34,260,872.8 | 53.6% |
| Rosetta / Crinso / Disciple | calamitic-cathedral-final-equation | 73,868,001.8 | 24,697,227.8 | 66.6% |
| Rosetta / Crinso / Disciple | calamitic-throne-borrowed-tomorrows | 73,868,001.8 | 65,430,511.4 | 11.4% |
| Rosetta / Crinso / Disciple | firstlight-cam | 73,868,001.8 | 33,988,931.1 | 54% |
| Rosetta / Crinso / Disciple | masters | 73,868,001.8 | 8,482,377 | 88.5% |
| Rosetta / Crinso / Disciple | master-rosetta-1 | 73,868,001.8 | 9,975,394.6 | 86.5% |
| Rosetta / Crinso / Disciple | master-crinso-1 | 73,868,001.8 | 66,270,553.3 | 10.3% |
| Rosetta / Crinso / Disciple | master-disciple-3 | 73,868,001.8 | 62,662,132.1 | 15.2% |

### Assessment: what is actually worth reviewing

- **High-priority package outlier:** Rosetta / Crinso / Disciple reaches 73,868,001.8 DPR over the final45 of90 cycles, versus 35,585.6 for the selected Common-build trio: 2,075.8x. This is not a like-for-like character comparison, but the magnitude warrants a focused balance review rather than dismissing it as merely a lucky crit.
- **Measured levers:** glassroot-gimbal: 90.3% output lost on removal; masters: 88.5% output lost on removal; master-rosetta-1: 86.5% output lost on removal. Removing shared Health-to-Skill-Power scaling or the Quarry Master/Gauge loop is more informative than blindly reducing every member's base stats. These marginal losses overlap and must not be added.
- **Not free or casually guaranteed:** the selected package requires 200 Calamitic tokens, 1,443,600 upgrade components, 3 chosen Masters and the listed unique Omnics, plus roster recruitment/leveling. The ordinary names/upgrades are shared account unlocks, not three separate copies. A large grind is a real access restriction, but not by itself evidence that a >1000x output gap is healthy.
- **Nerf recommendation:** prioritize reviewing this equipment/Gauge feedback package if comparable late-account builds are intended to compete. Do not apply a blanket Rosetta, Crinso, Disciple or Infernis nerf from this opponent-free chart. No balance adjustment is implemented or approved here.
- **Ramp matters:** the Rosetta/Disciple duo changes materially between the18- and90-cycle windows. The full matrix is a finite-window comparison, not an exhaustive steady-state ranking. No infinite action loop was found; very high finite damage is a separate concern.
- **Lower-cost progression:** Infernis leads every sampled Common solo checkpoint. That is meaningful offensive value, but this zero-pressure test favors persistent Burn and cannot price tanking, enemy control or rescue. Flora/Tizu/Razor/Bruno require their healing/mitigation columns and role mechanics, not a damage-only verdict.

### Interpretation safeguards and next-stage questions

- No result here establishes an automatic game break, invulnerability, an infinite action loop or a necessary nerf. Per-round action guards and finite-value checks passed for the completed matrix; expensive ceilings are conditional account power.
- Zero incoming damage removes Razor Wounds, Bruno interception, Orvella hit resistance, Thornia attack-trigger traps, Tizu absorption Gauge, Seal prevention, incoming-driven Omnics and Stasis value. Those need later standardized pressure/matchup tests; do not nerf or buff them from this chart alone.
- Glassroot/HP packages, Calamitic extra actions and cost reduction are candidate systemic outliers. Inspect the measured multipliers/rotation frequency and account-wide acquisition cost before touching individual characters.
- A three-member squad adds independent actions, targets for support and coordinated native triggers, but also three recruitment/progression bills. Solo is cheaper, not automatically stronger per account-hour; no account-hour model was run.
- Flora delayed healing and Bliss Closing bonuses need ordering/headroom; a solo Bliss cannot use Closing. Rosetta needs distinct allied direct hitters; Disciple buffs can waste an action if the recipient uses a mismatched next action.
- Precharged bursts, artificial healing headroom, shield creation and one-hit packet survival are separate experiments and cannot be added into a single sustainable “DPS+tank+heal” score.
- Investigate suspected nerfs with an ablation (remove one item), longer horizons, more seeds and realistic acquisition restrictions, then actual pressure/encounters only if the owner requests that phase.

Full aggregate rows, per-source contribution, Master candidates, exact gear and budgets are in the companion JSONL result file produced by the reproduction command. This report is generated by the checked-in runner, not manually transcribed numbers. The longer-run checks are deterministically recomputed when rendering; `--render` requires the original complete, source-matching JSONL.

Reproduce: `node tools\run_roster_capability.mjs <new-results.jsonl> docs\roster-capability-audit.md`.
