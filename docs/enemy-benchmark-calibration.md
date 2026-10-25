# Global character benchmarks and enemy calibration (D-404)

## Usage declaration

The [non-Calamitic roster capability audit](roster-capability-audit.md) is the canonical paper-performance reference; this document is its pressured-encounter calibration companion. Together they supersede Calamitic-inclusive historical ceilings as enemy-tuning targets. Personal Masters remain eligible. Calamitic Conduits remain usable in the game but are excluded from every benchmark here.

**These are modeled progression bands, not observed player averages.** There is no ownership/play telemetry. Neither character level nor this report grants a roster, equipment, upgrades or a Master. Never scale enemies to the best paper team or assume three recruited bearers are a free starting squad. Paper DPR against zero Defense is not damage against these enemies, a win probability or real-time DPS.

### Ordinary performance distribution

Common +0 gear, native-aware play, minimum legal evolution, all six Standard five-stars, every distinct owned solo/duo/trio. Cells are P10 / median / P90 damage per round, equally weighting candidate teams, not weighting accounts by recruitment probability. A tank/healer-heavy team can be useful below these offensive medians. Healing, shielding, incoming-dependent passives and burst remain separate tables in the capability report.

| Character level | Solo DPR | Duo DPR | Trio DPR |
|---:|---:|---:|---:|
| 0 | 127.1 / 140.8 / 254.5 | 255.9 / 324 / 440.1 | 429.7 / 529.3 / 672.6 |
| 20 | 522.1 / 578.8 / 1,179.9 | 1,073.6 / 1,362.1 / 2,148 | 1,779.2 / 2,322.5 / 3,056.8 |
| 40 | 1,163.4 / 1,290.4 / 2,890.2 | 2,410 / 3,061.1 / 5,315.9 | 4,019.1 / 5,527.7 / 7,702.4 |
| 60 | 1,872.9 / 2,125.3 / 5,019.6 | 3,923 / 5,003.6 / 9,334.1 | 6,648.9 / 9,428.3 / 13,439.2 |
| 80 | 2,918.4 / 3,325.4 / 8,286.9 | 6,269.3 / 8,123.7 / 15,619.4 | 10,773.4 / 15,531.5 / 22,574.8 |
| 100 | 3,855.6 / 4,375.9 / 11,473.7 | 8,288.4 / 10,609.6 / 21,435.2 | 14,070.6 / 20,965.9 / 30,797.5 |
| 105 | 4,001.9 / 4,543.1 / 12,087.4 | 8,608.8 / 11,019.2 / 22,684.7 | 14,623.7 / 21,953.9 / 32,671.2 |

### Access and preparation assumptions

- Only one chosen starter is free. Additional Standard five-stars have 1% total natural probability split six ways (one named bearer: 1/600 per ordinary pull); acquisition is never guaranteed by a level checkpoint. First Story clears supply 240 Null-Prismatica across120 stages:24 draws, not a guaranteed three-bearer roster.
- Captured Elemental-Devourers are a separate accessible filler route after activity access. The access probe uses a single starter plus zero/one/two distinct Common Heaven copies from stage1, retained at their actual capture level. It does not secretly level these copies to105, grant Masters to copies, or credit rare captures. Two successful independent20% capture rolls require10 eligible kills on average, with no fixed kill guarantee.
- Ordinary native-encounter calibration conditionally owns one of six five-star trios: Infernis/Tizu/Flora; Infernis/Atmoso/Flora; Elise/Bruno/Flora; Infernis/Tizu/Atmoso; Atmoso/Bruno/Flora; Elise/Tizu/Flora.
- Player level is max(0, enemy level-1), capped105; minimum legal evolution. Gear bands: through40 Store Common +0;41-80 mixed Rare/Legendary +0;81-105 mixed +5;106-120 four matching Omnics +5;121+ developed matching Omnics +5 with personal Masters. These are preparation targets, not ownership or upgrade-cost forecasts. Exact fixed packages are in `tools/battle-survey.ts:loadout`; optimized endgame replaces two ordinary slots with Glassroot Gimbal and Stasis Reliquary.
- Calamity tests Lv.105/Evo.6 teams: starter trio; Rosetta/Thornia/Flora; Crinso/Rosetta/Disciple; Nerithe/Orvella/Vaelor; Elise/Bruno/Flora; Bliss/Razor/Aurora. Only the starter/Standard trios avoid six-star recruitment; even all three starters require recruitment.
- Balanced pilot preserves actual costs, recovery, shields, healing, Gauge and all boss patterns. It avoids wasting Tizu Gauge on a shield-only Flare while healthy; at below half HP it permits that protection. A second Flare-first pilot tests optimized Calamity. Rotation is bounded rather than globally optimal.

## Tuning contract

Levels1-80 are unchanged. Above80, apply the following factors to the unrounded D-385 shared hostile curve, then round ONCE. Smoothstep between adjacent authored-level anchors: t²(3-2t). These factors are not applied to playable/captured growth. The existing smooth effective-level approach and resistance ramp remain separate.

| Enemy level | Health factor | Attack factor | Defense factor |
|---:|---:|---:|---:|
|80|1|1|1|
|100|1.2|0.95|1|
|120|1.4|0.9|0.95|
|140|1.5|0.82|0.9|
|145|1.5|0.8|0.9|
|160|1.5|0.7|0.875|
|170|1.5|0.6|0.85|
|185|1.5|0.6|0.85|

Health buys time for actual healing, protection and boss patterns; reduced Attack burst and Defense avoid requiring Calamitic offense or a lucky survival proc. Absolute Health/Attack/Defense still increase monotonically at every level through185. Post80 adjacent stat growth stays below9%; late adjacent log-growth changes through the approach stay below0.008. EX+1/2/3 retain levels145/160/170 and existing1.03/0.98/1 encounter multipliers. No gates, rewards, drop rates, skills, character stats, Conduit effects or account data change.

Combat rules11 restart historical in-progress encounters through existing client/server compatibility logic, retaining frozen squad/equipment and already-saved rewards. No load-time account migration or retroactive grants.

## Matched actual encounter measurements

Every current Story/dungeon/infusion/War/Calamity stage plus Training levels1-120; three seeds1/1729/104729;12,348 battles per curve. Same teams, gear and balanced pilot before/after. Baseline reconstructs exact D-403 hostile stats before starting a fresh fight, preserving all native boss mechanics. Each encounter starts fresh: this is not a whole-run attrition or economy simulation. Training above120 is deliberately rejected rather than silently mislabeled.

| Activity / enemy band | Battles | Before wins | After wins | Before / after mean rounds | After mean remaining allied HP |
|---|---:|---:|---:|---:|---:|
| story Lv.1-20 | 774 | 774 | 774 | 2.2 / 2.2 | 96.8% |
| story Lv.21-40 | 810 | 810 | 810 | 2.6 / 2.6 | 95.4% |
| story Lv.41-60 | 576 | 576 | 576 | 2 / 2 | 97.6% |
| dungeon Lv.21-40 | 216 | 216 | 216 | 2.6 / 2.6 | 95.2% |
| dungeon Lv.41-60 | 864 | 864 | 864 | 2 / 2 | 97.4% |
| dungeon Lv.61-80 | 864 | 864 | 864 | 2 / 2 | 96.6% |
| dungeon Lv.81-100 | 864 | 864 | 864 | 2.1 / 2.1 | 95.8% |
| dungeon Lv.101-120 | 972 | 972 | 972 | 4 / 4.6 | 93.8% |
| infusion Lv.1-20 | 72 | 72 | 72 | 2.3 / 2.3 | 95.6% |
| infusion Lv.21-40 | 108 | 108 | 108 | 2.7 / 2.7 | 95.8% |
| infusion Lv.41-60 | 324 | 324 | 324 | 2 / 2 | 97.3% |
| infusion Lv.61-80 | 738 | 738 | 738 | 2 / 2 | 96.5% |
| infusion Lv.81-100 | 810 | 810 | 810 | 2.1 / 2.1 | 95.7% |
| infusion Lv.101-120 | 792 | 792 | 792 | 4.1 / 4.6 | 93.7% |
| infusion Lv.121-140 | 216 | 216 | 215 | 5.5 / 6.8 | 93.7% |
| war Lv.81-100 | 108 | 108 | 108 | 2 / 2.1 | 95.7% |
| war Lv.101-120 | 216 | 216 | 216 | 4.1 / 4.8 | 96.2% |
| war Lv.121-140 | 216 | 216 | 213 | 5.8 / 7.3 | 94% |
| Calamity EX+1 | 216 | 193 | 197 | 7.9 / 10.1 | 78.9% |
| Calamity EX+2 | 216 | 86 | 139 | 8.4 / 15.3 | 58.5% |
| Calamity EX+3 | 216 | 37 | 114 | 7.7 / 13.6 | 43.4% |
| training Lv.1-20 | 360 | 360 | 360 | 2.8 / 2.8 | 95.9% |
| training Lv.21-40 | 360 | 360 | 360 | 3.8 / 3.8 | 95.2% |
| training Lv.41-60 | 360 | 360 | 360 | 2.4 / 2.4 | 95% |
| training Lv.61-80 | 360 | 360 | 360 | 2.5 / 2.5 | 93.7% |
| training Lv.81-100 | 360 | 360 | 360 | 2.6 / 2.6 | 93.4% |
| training Lv.101-120 | 360 | 360 | 360 | 4.7 / 5.2 | 91.4% |

Round/HP means include defeats and100-round censored timeouts; they are not means only over winners. A surviving but stalled team does not count as a win. Seeds are a reproducible spread, not a statistical confidence interval. Not every legal team must win, and an optimized high-investment team may still defeat early content quickly.

Regression acceptance: every non-Calamity activity/20-level band has at least95% wins with its declared preparation and no timeouts; all sampled outcomes/rounds/remaining HP at levels1-80 match the old curve exactly. The fixed practical Calamity set must reach at least80%/50%/30% for EX+1/2/3 with strictly descending clear rates. Optimized EX+3 additionally needs the per-boss repeatability coverage below. These are modeled-sample guardrails, not player-population success promises.

### EX+3 repeatable solutions

Six squads ×12 bosses ×three tiers ×three seeds ×two rotations =1,296 optimized non-Calamitic fights. “Repeatable team” below means one fixed rotation wins all three seeds; policies do not count as extra teams. Acceptance requires at least two distinct repeatable teams for EVERY EX+3 boss, not just one favorable Machines example.

| EX+3 boss | Repeatable distinct teams | Example team / rotation | Mean rounds |
|---|---:|---|---:|
| treasury | 4 | ember/tide/sprout / balanced | 12.7 |
| sanctuary | 2 | ember/tide/sprout / balanced | 13.3 |
| heavens | 4 | ember/tide/sprout / balanced | 8 |
| abyss | 3 | ember/tide/sprout / balanced | 13.3 |
| machines | 3 | ember/tide/sprout / balanced | 12.7 |
| roses | 2 | ember/tide/sprout / balanced | 12.7 |
| infernic | 2 | ember/tide/sprout / balanced | 12.7 |
| oceanic | 4 | ember/tide/sprout / balanced | 13.7 |
| atmospheric | 4 | ember/tide/sprout / balanced | 7.7 |
| botanic | 4 | ember/tide/sprout / balanced | 13.3 |
| tranquilitic | 3 | ember/tide/sprout / balanced | 13.3 |
| chaotic | 4 | ember/tide/sprout / balanced | 9.7 |

### Accessible capture-filler control

405 fights: three starters ×five Training levels ×one/two/three slots ×three gear bands ×three seeds. Copies are conditional on farming/access, not free. These Common copies are deliberately not an optimized captured roster. This control exposes the gap between a merely filled team and recruited/evolved endgame synergy; it must not be described as the average three-bearer account.

| Training enemy level | Slots | Common +0 wins /9 | Mixed +0 wins /9 | Mixed +5 wins /9 |
|---:|---:|---:|---:|---:|
| 50 | 1 | 7 | 9 | 9 |
| 50 | 2 | 9 | 9 | 9 |
| 50 | 3 | 9 | 9 | 9 |
| 60 | 1 | 3 | 9 | 9 |
| 60 | 2 | 6 | 9 | 9 |
| 60 | 3 | 9 | 9 | 9 |
| 80 | 1 | 0 | 9 | 9 |
| 80 | 2 | 2 | 9 | 9 |
| 80 | 3 | 1 | 9 | 9 |
| 100 | 1 | 0 | 1 | 3 |
| 100 | 2 | 0 | 1 | 9 |
| 100 | 3 | 0 | 1 | 8 |
| 120 | 1 | 0 | 0 | 0 |
| 120 | 2 | 0 | 0 | 0 |
| 120 | 3 | 0 | 0 | 0 |

Each cell has9 attempts (three starters ×three seeds); the whole level/slot group has27. No account-average inference follows from these counts.

## Exact shared hostile stats at every level

Calamity applies its tier multiplier after these shared boss values. Story and other modes retain their authored level/rank assignment.

| Level | Ordinary HP | ATK | DEF | Boss HP | ATK | DEF |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 87 | 23 | 4 | 218 | 29 | 6 |
| 2 | 127 | 29 | 5 | 317 | 36 | 7 |
| 3 | 168 | 35 | 7 | 419 | 44 | 9 |
| 4 | 210 | 41 | 8 | 524 | 51 | 11 |
| 5 | 252 | 47 | 9 | 631 | 59 | 13 |
| 6 | 297 | 54 | 11 | 741 | 67 | 14 |
| 7 | 342 | 60 | 12 | 855 | 75 | 16 |
| 8 | 388 | 67 | 14 | 971 | 84 | 18 |
| 9 | 436 | 74 | 15 | 1090 | 93 | 20 |
| 10 | 485 | 81 | 17 | 1212 | 101 | 22 |
| 11 | 535 | 88 | 18 | 1338 | 110 | 24 |
| 12 | 587 | 96 | 20 | 1466 | 120 | 26 |
| 13 | 639 | 103 | 21 | 1599 | 129 | 28 |
| 14 | 694 | 111 | 23 | 1734 | 139 | 31 |
| 15 | 749 | 119 | 25 | 1874 | 149 | 33 |
| 16 | 807 | 127 | 26 | 2017 | 159 | 35 |
| 17 | 865 | 136 | 28 | 2163 | 170 | 37 |
| 18 | 926 | 144 | 30 | 2314 | 180 | 40 |
| 19 | 987 | 153 | 31 | 2468 | 191 | 42 |
| 20 | 1051 | 162 | 33 | 2627 | 203 | 44 |
| 21 | 1116 | 171 | 35 | 2790 | 214 | 47 |
| 22 | 1183 | 181 | 37 | 2957 | 226 | 49 |
| 23 | 1251 | 190 | 39 | 3128 | 238 | 52 |
| 24 | 1322 | 200 | 41 | 3304 | 250 | 55 |
| 25 | 1394 | 211 | 43 | 3485 | 263 | 57 |
| 26 | 1468 | 221 | 45 | 3670 | 276 | 60 |
| 27 | 1544 | 232 | 47 | 3861 | 289 | 63 |
| 28 | 1622 | 242 | 49 | 4056 | 303 | 66 |
| 29 | 1703 | 254 | 51 | 4256 | 317 | 69 |
| 30 | 1785 | 265 | 54 | 4462 | 331 | 72 |
| 31 | 1869 | 277 | 56 | 4673 | 346 | 75 |
| 32 | 1956 | 289 | 58 | 4890 | 361 | 78 |
| 33 | 2045 | 301 | 61 | 5112 | 376 | 81 |
| 34 | 2136 | 314 | 63 | 5340 | 392 | 84 |
| 35 | 2230 | 327 | 66 | 5575 | 408 | 87 |
| 36 | 2326 | 340 | 68 | 5815 | 425 | 91 |
| 37 | 2425 | 353 | 71 | 6062 | 442 | 94 |
| 38 | 2526 | 367 | 73 | 6315 | 459 | 98 |
| 39 | 2630 | 381 | 76 | 6575 | 477 | 101 |
| 40 | 2737 | 396 | 79 | 6842 | 495 | 105 |
| 41 | 2846 | 411 | 81 | 7116 | 514 | 109 |
| 42 | 2959 | 426 | 84 | 7397 | 533 | 112 |
| 43 | 3074 | 442 | 87 | 7685 | 552 | 116 |
| 44 | 3192 | 458 | 90 | 7981 | 572 | 120 |
| 45 | 3314 | 474 | 93 | 8285 | 593 | 124 |
| 46 | 3439 | 491 | 96 | 8597 | 614 | 128 |
| 47 | 3567 | 508 | 99 | 8917 | 635 | 132 |
| 48 | 3698 | 526 | 102 | 9245 | 657 | 137 |
| 49 | 3833 | 544 | 106 | 9582 | 680 | 141 |
| 50 | 3971 | 562 | 109 | 9928 | 703 | 145 |
| 51 | 4113 | 581 | 112 | 10284 | 727 | 150 |
| 52 | 4259 | 601 | 116 | 10648 | 751 | 155 |
| 53 | 4409 | 621 | 119 | 11022 | 776 | 159 |
| 54 | 4562 | 641 | 123 | 11406 | 801 | 164 |
| 55 | 4720 | 662 | 127 | 11800 | 827 | 169 |
| 56 | 4882 | 683 | 130 | 12204 | 854 | 174 |
| 57 | 5048 | 705 | 134 | 12620 | 881 | 179 |
| 58 | 5218 | 728 | 138 | 13046 | 909 | 184 |
| 59 | 5393 | 750 | 142 | 13483 | 938 | 190 |
| 60 | 5573 | 774 | 146 | 13932 | 967 | 195 |
| 61 | 5757 | 798 | 150 | 14392 | 998 | 200 |
| 62 | 5946 | 823 | 155 | 14865 | 1028 | 206 |
| 63 | 6140 | 848 | 159 | 15350 | 1060 | 212 |
| 64 | 6339 | 874 | 163 | 15848 | 1092 | 218 |
| 65 | 6544 | 900 | 168 | 16359 | 1126 | 224 |
| 66 | 6753 | 928 | 172 | 16883 | 1159 | 230 |
| 67 | 6969 | 955 | 177 | 17422 | 1194 | 236 |
| 68 | 7190 | 984 | 182 | 17974 | 1230 | 242 |
| 69 | 7416 | 1013 | 187 | 18541 | 1266 | 249 |
| 70 | 7649 | 1043 | 192 | 19123 | 1304 | 255 |
| 71 | 7888 | 1074 | 197 | 19721 | 1342 | 262 |
| 72 | 8133 | 1105 | 202 | 20334 | 1381 | 269 |
| 73 | 8385 | 1137 | 207 | 20963 | 1421 | 276 |
| 74 | 8643 | 1170 | 212 | 21609 | 1462 | 283 |
| 75 | 8909 | 1204 | 218 | 22271 | 1505 | 291 |
| 76 | 9181 | 1238 | 224 | 22952 | 1548 | 298 |
| 77 | 9460 | 1274 | 229 | 23650 | 1592 | 306 |
| 78 | 9746 | 1310 | 235 | 24366 | 1637 | 313 |
| 79 | 10041 | 1347 | 241 | 25102 | 1684 | 321 |
| 80 | 10343 | 1385 | 247 | 25856 | 1731 | 329 |
| 81 | 10884 | 1435 | 257 | 27210 | 1793 | 342 |
| 82 | 11521 | 1489 | 267 | 28803 | 1861 | 356 |
| 83 | 12259 | 1547 | 278 | 30648 | 1934 | 371 |
| 84 | 13104 | 1609 | 291 | 32760 | 2012 | 388 |
| 85 | 14061 | 1676 | 304 | 35153 | 2095 | 406 |
| 86 | 15137 | 1748 | 319 | 37843 | 2184 | 425 |
| 87 | 16339 | 1823 | 335 | 40847 | 2279 | 446 |
| 88 | 17672 | 1904 | 352 | 44180 | 2380 | 469 |
| 89 | 19142 | 1989 | 370 | 47856 | 2486 | 493 |
| 90 | 20755 | 2079 | 389 | 51886 | 2598 | 518 |
| 91 | 22513 | 2173 | 409 | 56282 | 2717 | 545 |
| 92 | 24419 | 2273 | 430 | 61048 | 2842 | 574 |
| 93 | 26474 | 2378 | 453 | 66184 | 2973 | 604 |
| 94 | 28675 | 2489 | 477 | 71688 | 3111 | 636 |
| 95 | 31018 | 2604 | 502 | 77545 | 3255 | 669 |
| 96 | 33495 | 2726 | 528 | 83736 | 3407 | 703 |
| 97 | 36093 | 2853 | 555 | 90232 | 3566 | 740 |
| 98 | 38797 | 2986 | 583 | 96992 | 3733 | 777 |
| 99 | 41585 | 3126 | 612 | 103962 | 3908 | 816 |
| 100 | 44431 | 3272 | 642 | 111078 | 4090 | 856 |
| 101 | 47422 | 3423 | 673 | 118556 | 4278 | 898 |
| 102 | 50669 | 3574 | 705 | 126673 | 4468 | 939 |
| 103 | 54176 | 3727 | 736 | 135440 | 4659 | 981 |
| 104 | 57945 | 3880 | 768 | 144863 | 4850 | 1024 |
| 105 | 61975 | 4033 | 800 | 154937 | 5042 | 1066 |
| 106 | 66259 | 4186 | 832 | 165649 | 5233 | 1109 |
| 107 | 70790 | 4339 | 864 | 176975 | 5424 | 1152 |
| 108 | 75552 | 4491 | 896 | 188881 | 5613 | 1194 |
| 109 | 80529 | 4641 | 927 | 201321 | 5802 | 1236 |
| 110 | 85695 | 4791 | 959 | 214237 | 5988 | 1278 |
| 111 | 91023 | 4939 | 990 | 227558 | 6173 | 1320 |
| 112 | 96480 | 5085 | 1021 | 241200 | 6357 | 1361 |
| 113 | 102027 | 5231 | 1052 | 255069 | 6538 | 1402 |
| 114 | 107623 | 5374 | 1082 | 269056 | 6718 | 1443 |
| 115 | 113218 | 5517 | 1113 | 283046 | 6897 | 1484 |
| 116 | 118764 | 5659 | 1143 | 296909 | 7074 | 1524 |
| 117 | 124204 | 5801 | 1173 | 310509 | 7252 | 1564 |
| 118 | 129481 | 5943 | 1203 | 323702 | 7429 | 1604 |
| 119 | 134535 | 6086 | 1233 | 336338 | 7607 | 1644 |
| 120 | 139304 | 6230 | 1264 | 348261 | 7787 | 1685 |
| 121 | 143959 | 6369 | 1294 | 359897 | 7961 | 1725 |
| 122 | 148708 | 6497 | 1322 | 371769 | 8121 | 1762 |
| 123 | 153547 | 6615 | 1348 | 383868 | 8268 | 1798 |
| 124 | 158474 | 6723 | 1374 | 396185 | 8403 | 1832 |
| 125 | 163485 | 6821 | 1398 | 408713 | 8527 | 1864 |
| 126 | 168580 | 6912 | 1420 | 421450 | 8640 | 1894 |
| 127 | 173759 | 6996 | 1442 | 434398 | 8745 | 1923 |
| 128 | 179025 | 7074 | 1463 | 447563 | 8842 | 1951 |
| 129 | 184384 | 7148 | 1484 | 460960 | 8935 | 1978 |
| 130 | 189843 | 7219 | 1504 | 474609 | 9024 | 2005 |
| 131 | 195415 | 7290 | 1524 | 488537 | 9112 | 2032 |
| 132 | 201113 | 7361 | 1545 | 502783 | 9202 | 2059 |
| 133 | 206958 | 7436 | 1566 | 517395 | 9295 | 2087 |
| 134 | 212972 | 7516 | 1588 | 532430 | 9395 | 2117 |
| 135 | 219184 | 7604 | 1611 | 547959 | 9505 | 2148 |
| 136 | 225627 | 7702 | 1637 | 564067 | 9628 | 2182 |
| 137 | 232340 | 7813 | 1665 | 580851 | 9767 | 2220 |
| 138 | 239370 | 7941 | 1695 | 598425 | 9926 | 2261 |
| 139 | 246768 | 8088 | 1730 | 616921 | 10110 | 2306 |
| 140 | 254595 | 8259 | 1768 | 636488 | 10323 | 2358 |
| 141 | 263055 | 8429 | 1811 | 657637 | 10536 | 2414 |
| 142 | 272399 | 8585 | 1857 | 680997 | 10731 | 2477 |
| 143 | 282779 | 8749 | 1909 | 706948 | 10936 | 2545 |
| 144 | 294373 | 8944 | 1965 | 735933 | 11179 | 2620 |
| 145 | 307388 | 9195 | 2028 | 768470 | 11494 | 2704 |
| 146 | 321503 | 9474 | 2095 | 803757 | 11842 | 2793 |
| 147 | 336260 | 9732 | 2162 | 840651 | 12165 | 2883 |
| 148 | 351690 | 9973 | 2230 | 879225 | 12466 | 2974 |
| 149 | 367823 | 10198 | 2299 | 919557 | 12748 | 3066 |
| 150 | 384690 | 10410 | 2370 | 961724 | 13013 | 3160 |
| 151 | 402325 | 10614 | 2442 | 1005812 | 13267 | 3256 |
| 152 | 420763 | 10811 | 2516 | 1051906 | 13514 | 3354 |
| 153 | 440040 | 11008 | 2592 | 1100099 | 13760 | 3455 |
| 154 | 460194 | 11209 | 2670 | 1150485 | 14011 | 3560 |
| 155 | 481265 | 11419 | 2751 | 1203164 | 14274 | 3667 |
| 156 | 503296 | 11646 | 2835 | 1258239 | 14558 | 3779 |
| 157 | 526328 | 11897 | 2922 | 1315821 | 14871 | 3896 |
| 158 | 550409 | 12179 | 3013 | 1376022 | 15224 | 4018 |
| 159 | 575584 | 12502 | 3109 | 1438961 | 15628 | 4146 |
| 160 | 601905 | 12876 | 3211 | 1504763 | 16094 | 4281 |
| 161 | 629423 | 13231 | 3314 | 1573557 | 16539 | 4418 |
| 162 | 658192 | 13502 | 3415 | 1645480 | 16877 | 4553 |
| 163 | 688269 | 13704 | 3516 | 1720672 | 17130 | 4688 |
| 164 | 719713 | 13855 | 3617 | 1799284 | 17318 | 4823 |
| 165 | 752587 | 13975 | 3720 | 1881469 | 17469 | 4960 |
| 166 | 786956 | 14090 | 3825 | 1967389 | 17612 | 5100 |
| 167 | 822886 | 14225 | 3935 | 2057216 | 17781 | 5247 |
| 168 | 860450 | 14411 | 4051 | 2151124 | 18013 | 5401 |
| 169 | 899720 | 14682 | 4174 | 2249300 | 18352 | 5565 |
| 170 | 940775 | 15076 | 4307 | 2351938 | 18844 | 5743 |
| 171 | 983696 | 15552 | 4448 | 2459239 | 19440 | 5931 |
| 172 | 1028566 | 16044 | 4594 | 2571416 | 20055 | 6125 |
| 173 | 1075475 | 16551 | 4744 | 2688688 | 20689 | 6325 |
| 174 | 1124515 | 17074 | 4899 | 2811288 | 21343 | 6532 |
| 175 | 1175783 | 17613 | 5059 | 2939458 | 22017 | 6745 |
| 176 | 1229379 | 18170 | 5224 | 3073448 | 22712 | 6966 |
| 177 | 1285410 | 18743 | 5395 | 3213525 | 23429 | 7193 |
| 178 | 1343985 | 19335 | 5571 | 3359963 | 24169 | 7428 |
| 179 | 1405221 | 19945 | 5753 | 3513052 | 24931 | 7670 |
| 180 | 1469237 | 20574 | 5940 | 3673092 | 25718 | 7920 |
| 181 | 1536160 | 21223 | 6134 | 3840400 | 26529 | 8178 |
| 182 | 1606121 | 21892 | 6334 | 4015304 | 27366 | 8445 |
| 183 | 1679260 | 22583 | 6540 | 4198149 | 28228 | 8720 |
| 184 | 1755718 | 23294 | 6753 | 4389295 | 29118 | 9004 |
| 185 | 1835648 | 24028 | 6973 | 4589119 | 30036 | 9297 |

## Reproduction, provenance and limitations

`node tools\run_roster_capability.mjs <new-capabilities.jsonl> docs\roster-capability-audit.md`

`node tools\run_progression_balance.mjs <new-results.jsonl> baseline` (repeat with `verify`, `optimized`, `access`).

`node tools\render_progression_balance.mjs <baseline.jsonl> <current.jsonl> <optimized.jsonl> <access.jsonl> <capabilities.jsonl> docs\enemy-benchmark-calibration.md`

Paired calibration bundle SHA-256: `ba6f38a48ceb1ca3d80dd7e42e45120b1cac101f70ae89651449758623d0557b`. Capability evidence bundle SHA-256: `be720d2b8755fcd887cb61ff2d1aec2bc60dc990afdf2c26b6daddd7f10b0bf1`. The latter was compiled before the hostile-only tuning/rules increment; its dummy-target experiment does not use hostile stats. These are separate experiments, not a combined measurement source hash.

The capability runner retains complete acquisition costs and separate effective healing/shield/defensive probes. Global balance authority applies only to the measured rules/content; rerun when character kits, gear, caps or enemy mechanics change. No assertion covers all possible builds, actor orders, mixed-level squads, save histories or human strategies. Common capture fillers failing late content is reported rather than hidden; recruiting/evolving a better roster or choosing stronger captures is a progression requirement, not an automatic reward.
