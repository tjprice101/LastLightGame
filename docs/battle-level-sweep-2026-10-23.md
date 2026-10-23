# Enemy level80 through Calamity EX+3: ten-level sweep

Historical **pre-D-384** measurements. The owner subsequently authorized
stronger enemy Health, Attack and Defense; see the
[current formula/stats](combat.md#progressive-late-enemy-resistance-d-384)
and [post-tuning evidence](handoff.md#progressive-enemy-resistance-d-384).
The recorded baseline outcomes below are intentionally preserved.

## Scope

Owner requests measurements at every ten levels from80 through Calamity EX+3.
This means **enemy levels**, with player squads fixed at **Lv.105/Evo.6,
weapon rank0**. No player levels above the legal105 cap are invented.

Tested levels: **80,90,100,110,120,130,140,145,150,160,170,180,185**.
145/160/185 are included as the exact native Calamity EX+1/2/3 milestones.
**No balance changes, buffs, nerfs, reward changes or account writes.**

The [preceding survey](battle-survey-2026-10-23.md) owns the exact eight squads,
eight equipment profiles, ten seeds and pilot limitations. All current
production stat factors are used, including the existing shared1.05 enemy
strength multiplier. Combat source is
`83f1555e1882c01b9e9f769f0722367e8dae81fd`; the added code is offline tooling.

### Native encounters versus controlled probes

**112,640 encounter resolutions**:

- **99,840 Calamity-pattern probes:**13 levels x12 identities x8 squads
  x8 builds x10 seeds.
- **4,480 standard-boss probes:**seven levels80-140 x8 squads x8 builds
  x10 seeds.
- **8,320 supported character probes:**13 levels x16 characters x
  four subject-Master choices (none/1/2/3) x10 seeds.

Calamity probes preserve each identity's authored timing, targeting,
multi-hits, healing and Shields, and use the exact shared boss stats at the
requested level. They are controlled sensitivity tests, **not playable
Calamity encounters at levels80-140/150/170/180**.

Calamity145/160/185 are unchanged native encounters. Standard probes use
Machines through120 and Roses at130/140, with the real level-dependent
primary/ultimate skill schedules. Standard120/140 are native final bosses;
other standard levels are controlled probes. No Machines enemy above120 is
passed to its native reward resolver, and no ordinary boss above140 is invented.
The first incomplete run caught that reward-range restriction; it was
corrected and the entire matrix rerun before certification.

Every fight is a fresh full-Health entry with natural opening Gauge. No
continuous-run sustain claim is made here. The native heuristic pilot and
100-round/1,800-decision horizon are unchanged. Legal loadout checks apply to
every fixture. Higher-rarity builds **replace** equipment, not add bonuses
on top of the lower-rarity profile.

## 1. Full ten-level curve, with all12 Calamity patterns

Each cell is wins out of960 (eight squads x12 identities x10 seeds),
shown as a percentage. Timeouts remain in the denominator but are not defeats.

|Enemy level|None|Common+0|Mixed+0|Mixed+5|Four Omnic+0|Four Omnic+5|Omnic+5/Master|Calamitic/Omnic+5/Master|
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
|80|71.7%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|90|18.0%|99.9%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|100|0.5%|89.2%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|110|0.0%|78.3%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|120|0.0%|46.0%|100.0%|100.0%|99.3%|100.0%|100.0%|100.0%|
|130|0.0%|9.4%|99.1%|100.0%|93.6%|100.0%|100.0%|100.0%|
|140|0.0%|0.4%|91.6%|100.0%|88.8%|99.7%|100.0%|100.0%|
|145:EX+1|0.0%|0.0%|86.5%|99.9%|82.1%|99.0%|99.7%|100.0%|
|150|0.0%|0.0%|80.6%|99.1%|73.2%|97.8%|98.8%|100.0%|
|160:EX+2|0.0%|0.0%|50.7%|95.1%|49.6%|94.1%|96.1%|93.5%|
|170|0.0%|0.0%|26.5%|82.9%|23.9%|72.2%|87.1%|90.9%|
|180|0.0%|0.0%|5.1%|66.7%|8.2%|51.9%|66.7%|64.1%|
|185:EX+3|0.0%|0.0%|3.2%|52.1%|3.2%|34.6%|57.7%|52.6%|

### What that means

- **80-100:** unequipped squads lose their level-advantage cushion quickly.
  Common equipment keeps most tested squads competitive.
- **110-130:** Common candidates meet their main wall, falling from78.3%
  to9.4%; equipped mixed candidates remain almost universally successful.
- **140-150:** upgraded developed candidates still dominate. First Master-build
  losses already occur at145, but overall success remains above98%.
- **160:** clear differentiation appears in +0 builds, which win about half
  their trials. Upgraded candidates still win above93%.
- **170-185:** the main developed-build wall. At185, mixed+5, default Master
  and Calamitic candidates win52.1%,57.7% and52.6%, respectively.

This does not establish that four Omnics or Calamitics are intrinsically worse
than mixed equipment. The profiles swap different stats/conditional mechanics;
the +5 mixed profile includes strong Health/Glassroot and other synergies.

### Winning fight lengths

Medians include only wins, not failed runs or timeouts. Survivorship can hide
how severely the unsuccessful squads struggle.

|Enemy level|Mixed+5|Four Omnic+5|Omnic+5/Master|Calamitic/Omnic+5/Master|
| --- | ---: | ---: | ---: | ---: |
|80|2|2|1|1|
|90|2|2|2|1|
|100|2|2|2|1|
|110|2|2|2|1|
|120|2|2|2|1|
|130|2|3|2|1.5|
|140|2|3|3|2|
|145|2|3|3|2|
|150|2|3|3|2|
|160|2|4|3|2|
|170|3|5|3|2|
|180|3|5|3|2|
|185|3|6|4|3|

Strong builds still win quickly even when weaker ones lose. The difficulty
curve is therefore not simply a steadily increasing time-to-kill curve.

## 2. Ordinary boss comparison, without Calamity patterns

Each cell pools eight squads x10 seeds,80 runs. These are separate results;
do not present the previous table's lower-level Calamity-pattern percentages
as ordinary-stage win rates.

|Enemy level|None|Common+0|Mixed+0|Mixed+5|Four Omnic+0|Four Omnic+5|Omnic+5/Master|Calamitic/Omnic+5/Master|
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
|80|71.2%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|90|12.5%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|100|0.0%|87.5%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|110|0.0%|75.0%|100.0%|100.0%|100.0%|100.0%|100.0%|100.0%|
|120:native Machines|0.0%|37.5%|100.0%|100.0%|97.5%|100.0%|100.0%|100.0%|
|130|0.0%|3.8%|98.8%|100.0%|92.5%|100.0%|100.0%|100.0%|
|140:native Roses|0.0%|0.0%|87.5%|100.0%|86.2%|98.8%|98.8%|100.0%|

## 3. Where each squad's default Master build starts to fail

Wins out of120 at each sampled enemy level across all12 Calamity identities.
All eight squads clear120/120 through140. The names/rosters below match the
preceding survey exactly.

|Squad|145|150|160|170|180|185|
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
|Infernis / Tizu / Flora|120|120|120|120|120|118|
|Rosetta / Thornia / Flora|120|120|120|120|112|92|
|Crinso / Rosetta / Disciple|120|120|120|119|116|89|
|Nerithe / Orvella / Vaelor|120|120|116|94|49|33|
|Elise / Bruno / Flora|120|120|119|97|23|12|
|Bliss / Razor / Aurora|120|120|120|120|120|118|
|Infernis / Crinso|120|120|120|80|15|7|
|Atmoso / Elise|117|108|88|86|85|85|

The last row demonstrates a useful pattern distinction: raising level hurts
some identities/builds much more than others. Equal185 results do not imply
that enemy stats stopped growing or that every pattern is equally dangerous.

## 4. Every character and all48 Masters

The separate character sweep tests each subject with the same two
nonduplicate starter supports as the preceding survey, natural Gauge and the
four-Omnic+5 profile. Support Masters remain equipped; subject variants are
none/1/2/3. Each choice receives ten seeds per level against the Machines
Calamity pattern.

**All16 subjects, all three Master variants and all no-subject-Master controls
clear10/10 at every tested level through180.** At185, only these cells lose:

|Subject|Subject Master|Wins /10|
| --- | --- | ---: |
|Infernis|None|9|
|Nerithe|None|9|
|Nerithe|Variant1|9|
|Nerithe|Variant2|9|
|Nerithe|Variant3|9|
|Orvella|Variant1|9|

All other185 character-sweep cells clear10/10. Overall:8,314 wins and six
defeats across8,320 supported character runs.

This is evidence of capable **supported builds**, not solo capability or a
universal character/Master tier list. Supports/formation/equipment synergies
make this test easier than some of the eight fixed squads, and it covers only
the Machines pattern. Win-rate saturation still prevents meaningful ranking
of most Master choices. No conclusion that a support is redundant is justified.

## 5. Timeouts

13 runs reach the original100-round measurement horizon, all with the
starter squad:

|Build|Identity|Enemy level|Timeout count|
| --- | --- | ---: | ---: |
|Mixed+0|Heavens|160|2|
|Mixed+0|Atmospheric|160|1|
|Mixed+0|Heavens|170|2|
|Mixed+0|Heavens|180|3|
|Mixed+0|Atmospheric|180|2|
|Mixed+0|Atmospheric|185|1|
|Mixed+5|Atmospheric|185|2|

These remain unresolved at this measurement horizon, not victories or
silently counted defeats. The native160/185 cases are the same controls
already examined with the longer horizon in the preceding report; that
follow-up is not rerun or double-counted here. New170/180 cases are not proven
engine softlocks or infinite loops.

## Conclusions and remaining decisions

The ten-level data strengthens the preceding conclusion: **do not nerf
characters/Conduits or blindly increase all enemy damage.**

- A more challenging developed-build experience would primarily need attention
  to140-170 encounters, where upgraded candidates still clear almost everything
  quickly. This is a measured area for review, not approval of a buff.
- Under-equipped squads already meet severe walls at100-130.
- EX+3 remains strongly squad/build-dependent, from7/120 to118/120 clears.
- No production enemy changes were selected. Exact difficulty targets,
  acquisition expectations and any enemy-side changes remain owner decisions.

## Reproduction and verification

```powershell
npx vitest run tools\battle-survey.test.ts src\game\calamity.test.ts --maxWorkers=2
npx tsc --noEmit --target es2022 --module esnext --moduleResolution bundler --skipLibCheck tools\battle-survey.ts tools\battle-survey.test.ts
node --check tools\run_battle_survey.mjs
node --check tools\summarize_battle_survey.mjs
node tools\run_battle_survey.mjs "$env:TEMP\battle-level-sweep.jsonl" levels
node tools\summarize_battle_survey.mjs "$env:TEMP\battle-level-summary.json" "$env:TEMP\battle-level-sweep.jsonl"
```

Targeted validation: **108 tests/two files passed** (11 harness integrity and
97 existing Calamity tests). Type and Node syntax checks passed.
All36 native Calamity encounters and the native standard bosses have exact
fixture-parity tests. **26,240 native-encounter control results** also match
the preceding raw survey exactly: outcome, rounds, decisions, survivors,
remaining Health/enemy HP, observed first KO and source contributions.

Final dataset:112,640 records,80,486 wins,32,141 defeats,13 timeouts,
509.768 seconds of simulation time. These are matched seeded comparisons,
not112,640 independent random-player observations. The incomplete first
attempt is excluded from all totals.

Original JSONL SHA-256:
`31f4116912fdc0e19b4b33c43dee146c15b0f542e11c42377926362e90069fd9`.
Run metadata includes timestamps, so file hashes differ on rerun even when
seeded outcomes match. The original raw file
`battle-level-sweep-verified-2026-10-23.jsonl` and grouped
`battle-level-sweep-summary.json` remain in the originating session's `files`
directory. The [runner](../tools/run_battle_survey.mjs) and
[summarizer](../tools/summarize_battle_survey.mjs) reproduce them without
accounts, network or persistent gameplay writes.
