# Progressive enemy resistance and accepted EX+1 approach

## Current stronger approach (D-385)

Owner accepts EX+1 difficulty and requests stronger preceding levels with a
gradual approach from80. Only81-144 changes;1-80 and145+ remain numerically
identical to D-384. Characters, Conduits, playable captures, actual enemy
levels, skills, rewards, rates and stage schedules are unchanged.

[Current formula and ordinary/boss stats](combat.md#smooth-approach-to-accepted-calamity-ex1-d-385):
evaluate the existing D-384 stats at `E=L+160*t*t*(1-t)*(1-t)`,
`t=(L-80)/65`, only inside80<L<145. The maximum stat-only advance is ten levels,
with zero value/slope at the80/145 anchors. Actual reward and skill logic uses
L, never E. One final rounding step remains. Growth is monotonic, stays below
EX+1 until145 and never reaches7.2% per level; the145 join preserves its slope.

|Actual enemy level|Boss Health|Boss Attack|Boss Defense|
| --- | ---: | ---: | ---: |
|80|25,856|1,731|329|
|90|47,170|2,665|518|
|100|92,565|4,306|856|
|110|164,798|6,474|1,311|
|120|248,758|8,652|1,774|
|130|327,316|10,493|2,168|
|140|424,325|12,589|2,620|
|144|490,622|13,938|2,912|
|145:EX+1 unchanged|512,313|14,367|3,005|
|160:EX+2 unchanged|1,003,175|22,992|4,892|
|185:EX+3 unchanged|3,059,413|50,059|10,938|

Rules9 restarts old snapshots through the existing frozen-investment/
saved-reward-safe compatibility path. Full regression6,471 tests/206 files,
focused201 tests/five files, client/authority builds, explicit tool TypeScript
and smoke syntax passed. Hosted rules9 native/Calamity, Phase0 and early-balance
smokes passed new120/140 and unchanged145/185/60/64 stats, exact action parity,
explicit ally targets, actual rewards, persistence and idempotent retries.
Disposable identities/cascading records were removed; owner accounts unchanged.

### D-385 matched battle results

Reran the complete112,640-fixture matrix in581.325 seconds with the same
Lv105/Evo6 squads, legal equipment, seeds, pilot and100-round/1,800-decision
horizon. All keys are unique and match the previous matrix exactly.
All58,880 rows at80 or145+ match their D-384 counterparts **exactly**, including
outcomes, rounds, survivors, enemy remaining Health, first KO and contributions.
All53,760 intermediate result rows change with stronger stats.

Total56,534 wins/56,054 defeats/52 unresolved horizon timeouts. Categories remain
99,840 Calamity-pattern,4,480 standard boss and8,320 supported character trials.
Timeouts are neither silent wins nor silently relabeled defeats.

Each Calamity-pattern cell below contains960 trials across12 authored patterns,
eight squads and ten seeds. Only145/160/185 are playable native Calamity
milestones; earlier levels are controlled offline probes, not new stages.

|Enemy level|Common+0|Mixed+0|Mixed+5|Four Omnic+0|Four Omnic+5|Omnic+5/Master|Calamitic/Omnic+5/Master|
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
|80|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|90|90.5%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|100|51.3%|100.0%|100.0%|99.8%|100.0%|100.0%|100.0%|
|110|4.6%|94.3%|100.0%|90.0%|100.0%|100.0%|100.0%|
|120|0.0%|78.1%|98.6%|70.8%|98.6%|99.1%|97.9%|
|130|0.0%|49.3%|92.6%|54.8%|94.2%|97.4%|94.8%|
|140|0.0%|25.6%|84.6%|34.8%|81.1%|92.3%|81.3%|
|145:EX+1 unchanged|0.0%|10.0%|76.5%|21.4%|61.6%|81.8%|74.8%|

Percentages use one-decimal half-up presentation. Higher rarities replace
other bonuses; these fixed candidate profiles are not optimized best-in-slot.
For default-Master candidates, winning rounds now rise1/2/2/3/3/4/5/5
at80/90/100/110/120/130/140/145. The old110/130 medians were2/3 respectively.
Win rates are not the only difficulty metric: strongest builds remain highly
successful below130 but take longer and face stronger pressure.

Native Machines120 Master candidates now win78/80 (97.5%, previously80/80);
native Roses140 win69/80 (86.3%, previously73/80). Standard probes130 win77/80.
Supported-character trials still have6,730 wins/1,590 defeats; their higher
fight lengths demonstrate changed pressure despite equal overall outcomes.
Every higher Calamity wall in the D-384 results below is unchanged.
This is numerical growth and measured heuristic difficulty, not a guarantee
that every squad's win rate/fight length changes monotonically at every level.
Authored patterns, character mechanics, RNG and fixed level-based skills remain.

Reproduction uses the same `levels` command documented below. Current raw
session evidence: `battle-ex1-approach-2026-10-23.jsonl`, summary
`battle-ex1-approach-summary.json`. Raw SHA256:
`dec72fa24ec5fc6df88151dbb3107f9f96017b977b3c7df267761d086e38aa81`.
Runner metadata records parentf931193 plus the exact approach constants; the
run includes the D-385 changes published with this section. As-executed
`stat-growth.ts` SHA256:
`ccb7d9c4fd1941b6000b20e5fd61d15941e5078ebdea2a602488e85b99780ca4`.

## Historical first-pass direction (D-384)

The remainder records the earlier D-384 run, not current81-144 balance.

Owner asks for significant resistance gains80-140, explicitly selects stronger
Health, Defense and Attack, and delegates a harder first pass for later tuning.
No characters, Conduits, playable captures, rewards or level schedules change.

The [combat specification](combat.md#progressive-late-enemy-resistance-d-384)
contains every exact ordinary/boss stat and the formula. Relative to the previous
curve, multiply unrounded Health/Attack/Defense by `3/1.5/2` respectively raised
to `max(0,enemyLevel-80)/60`. Round once. Opening1-80 is unchanged; continue
compounding through185, not a plateau after140.

|Enemy level|Boss Health|Boss Attack|Boss Defense|
| --- | ---: | ---: | ---: |
|80|25,856|1,731|329|
|90|41,539|2,433|471|
|100|66,220|3,394|668|
|110|104,967|4,707|940|
|120|165,684|6,498|1,316|
|130|260,694|8,942|1,836|
|140|409,204|12,273|2,551|
|145:EX+1|512,313|14,367|3,005|
|150|641,150|16,811|3,537|
|160:EX+2|1,003,175|22,992|4,892|
|170|1,567,959|31,407|6,756|
|180|2,448,728|42,863|9,318|
|185:EX+3|3,059,413|50,059|10,938|

These are base stats, not final damage per hit. Authored skills, criticals,
Defense mitigation, Shields, patterns and equipped battle modifiers still apply.
Probe levels do not introduce new playable stages.

## Complete matched rerun

**112,640 unique encounter fixtures**, using the same squads, builds, seeds,
native heuristic pilot and100-round/1,800-decision horizon as the
[historical ten-level baseline](battle-level-sweep-2026-10-23.md):

- 99,840 Calamity-pattern probes:13 levels x12 patterns x8 squads x8 builds
  x10 seeds.
- 4,480 ordinary boss probes:seven levels80-140 x8 squads x8 builds x10 seeds.
- 8,320 supported character trials:13 levels x16 subjects x4 subject-Master
  choices x10 seeds, including all48 Masters and no-subject-Master controls.
- All8,960 level80 result rows exactly match the baseline, including outcomes,
  rounds, Health, first-KO observations and source contributions.
- Total58,507 wins,54,083 defeats and50 unresolved fixed-horizon timeouts.
  Timeouts stay in win-rate denominators, not silently counted as defeats.

Calamity145/160/185 and standard120/140 are native encounters. Other levels are
controlled probes using the actual shared stats; Calamity patterns retain
their authored timing/targeting/healing/Shields. Standard probes use Machines
through120 and Roses at130/140 with real level-dependent skill schedules.
Players remain105/Evo.6/weapon0; no illegal higher player levels are invented.
Fresh-entry results do not establish continuous-run sustain or optimal play.

### Calamity-pattern win rates

Each cell pools960 encounters. These are fixed legal candidate builds,
not exhaustive best-in-slot loadouts. Higher rarities replace other bonuses.

|Enemy level|None|Common+0|Mixed+0|Mixed+5|Four Omnic+0|Four Omnic+5|Omnic+5/Master|Calamitic/Omnic+5/Master|
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
|80|71.7%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|90|5.6%|96.9%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|100|0.1%|79.7%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|110|0.0%|31.4%|100.0%|100.0%|98.4%|100.0%|100.0%|100.0%|
|120|0.0%|3.6%|94.3%|100.0%|89.9%|100.0%|100.0%|100.0%|
|130|0.0%|0.0%|72.6%|97.9%|67.5%|98.3%|98.8%|97.9%|
|140|0.0%|0.0%|28.3%|86.6%|37.9%|82.6%|94.0%|83.0%|
|145:EX+1|0.0%|0.0%|10.0%|76.5%|21.4%|61.6%|81.8%|74.8%|
|150|0.0%|0.0%|3.6%|57.8%|11.1%|49.5%|60.1%|65.1%|
|160:EX+2|0.0%|0.0%|0.1%|22.8%|2.0%|24.4%|37.5%|31.9%|
|170|0.0%|0.0%|0.0%|0.4%|0.0%|5.7%|14.4%|11.5%|
|180|0.0%|0.0%|0.0%|0.0%|0.0%|0.0%|0.3%|0.0%|
|185:EX+3|0.0%|0.0%|0.0%|0.0%|0.0%|0.0%|0.0%|0.0%|

At140, mixed+5 wins fall100%->86.6%; four-Omnic+5 fall99.7%->82.6%;
default-Master candidates fall100%->94.0%. Median winning rounds rise2->3,
3->6 and3->5 respectively. These are winning-fight medians, not all-run medians.
At160, default-Master wins fall96.1%->37.5%. At185 they fall57.7%->0%.

### Native ordinary-boss comparison

Only120/140 rows are actual native finals; intermediate rows are standard
single-boss probes. Each cell contains80 encounters.

|Level|Mixed+5|Four Omnic+5|Omnic+5/Master|Calamitic/Omnic+5/Master|
| --- | ---: | ---: | ---: | ---: |
|80|100.0%|100.0%|100.0%|100.0%|
|90|100.0%|100.0%|100.0%|100.0%|
|100|100.0%|100.0%|100.0%|100.0%|
|110|100.0%|100.0%|100.0%|100.0%|
|120:Machines final|100.0%|100.0%|100.0%|100.0%|
|130|97.5%|97.5%|97.5%|97.5%|
|140:Roses final|81.3%|78.8%|91.3%|81.3%|

Percentages round to one decimal with half-up display (65/80=81.25%).
The ordinary140 pooled Master candidate win rate is not a claim that every
squad wins91.3% of its own seeds; this pools all eight different squads.

### Supported character/Master trials

All640 trials per level win through150. At160,630/640 win;170,308/640;
180,26/640;185,6/640. Subjects have two fixed starter supports (usually
Infernis/Tizu), so this is not a solo ranking or proof of equivalent Masters.
The few185 wins also mean the eight representative-squad zero-clear result
does **not** prove mathematical impossibility for every legal squad/loadout.

## Interpretation and limitations

The desired stronger80-140 progression is measurable without nerfing players.
Developed squads still overwhelm early encounters; substantial differentiation
now starts around130-140, not only170+. Common+0 is much more constrained.

**This first pass makes upper Calamity extremely severe.** The eight
representative candidates have no EX+3 clears; only six supported-character
fixtures clear it. This is explicitly a hard-wall tuning result for owner
review, not a claim of final balance or a concealed test failure. No subsequent
unrequested easing, player buffs, new mechanics or reward changes are included.
The50 timeouts remain unresolved potential sustain/pilot stalemates.

## Reproduction and provenance

```text
node tools\run_battle_survey.mjs <new-output.jsonl> levels
node tools\summarize_battle_survey.mjs <summary.json> <new-output.jsonl>
```

Evidence is retained in session files, not committed as multi-megabyte raw data:
`battle-resistance-ramp-2026-10-23.jsonl` and
`battle-resistance-ramp-summary.json`. Complete633.697-second run SHA256:
`2171ccceadcf093f1a63434f189c23b594ffcf92f6325b55513737fb453e70b7`.
The runner records parent commit7965b44 because execution preceded publication;
the actual source includes the D-384 changes published with this report.
Metadata records the exact resistance factors. As-executed stat source SHA256:
`042cdd3a5cd545af227e6a010bdaf14626a8f883b80068dbfd6b0452631ccea7`.
Independent checks certify all112,640 unique keys, expected per-level/category
counts and8,960 exact unchanged80 controls.

Full regression:6,466 tests/206 files passed. Focused changed numerical,
Calamity, reward-stream, authority and offline-compatibility suites:205 tests
passed. Authority/client builds, explicit tool TypeScript and syntax checks
passed. Hosted rules8 native/Calamity smoke checks newly spawned exact120/140/
145/185 stats, rewards, idempotency and persisted holdings; Phase0 smoke checks
unchanged equipment/action parity. Early-balance smoke confirms unchanged
Lv60 Training/material and Lv64 Heaven stats/skills/persistence against the
current native stage schedule. Disposable accounts/records are removed.
