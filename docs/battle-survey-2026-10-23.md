# Post-refresh battle survey: 2026-10-23

Historical **pre-D-384** evidence and recommendations. The owner subsequently
authorized a harder progressive Health/Attack/Defense curve after80; that
decision supersedes the no-Attack-increase recommendation below, not these
recorded results. [Current tuning](combat.md#progressive-late-enemy-resistance-d-384).

## Verdict

**Do not nerf characters or Conduits. Do not apply a blanket enemy Attack
increase.** Developed equipment already overwhelms many ordinary bosses, but
under-equipped squads and sustained runs remain substantially harder. The
strongest case for tougher enemies is upper-end boss durability/challenge
design, not more damage across the entire progression curve.

This is measured evidence and proposed direction, **not approval or
implementation of a balance change**. Production combat, enemy curves,
characters, equipment, rewards and saves are unchanged.

## Scope and reproducibility

Combat source: `948b4f7a935cd5ef3d5a8a8e6c744680d0ce89ab` (rules7).
The offline harness imports the actual battle constructors, action resolution,
native-kit pilot, equipment validation and next-wave transition. No accounts,
network services or saved wallets are used.

**78,893 encounter resolutions:** 66,727 main-survey fights, 12,160 follow-up
fights and six extended timeout retries. These include repeated controls and
matched seeds, not 78,893 statistically independent encounters.

| Measurement | Encounter resolutions |
| --- | ---: |
| All120 Story stages, eight character levels, three equipment profiles, three seeds |8,640|
| Six staged activity families, sampled progression stages |2,880|
| Six material dungeons, nine sampled floors |3,888|
| Eight squads, eight builds, 51 final/challenge encounters, ten seeds |32,640|
| All16 characters, all48 Masters and no-subject-Master controls, two policies |7,680|
| All16 characters solo, three builds, six encounters, ten seeds |2,880|
|96 continuous Training runs, up to wave125 |8,119|
| Machines late-curve bosses, two character levels, eight squads, four builds |2,560|
| Isolated hypothetical enemy-only increases |9,600|
| Extended retries of the six original timeouts |6|

Main seeds: `1, 1729, 12345, 54321, 104729, 65537, 314159, 271828,
8675309, 4294967295`. Progression and continuous Training use the first three.
Levels:0/15/30/45/60/75/90/105, minimum legal evolution at each level, weapon
rank0. Endgame and character comparisons use Lv.105/Evo.6.

Standalone fights enter at full Health with the engine's natural opening
Gauge. Training starts at wave1 and carries actual Health, Gauge, Shields,
recovery and surviving members through `nextWave`; nobody is restored between
Training waves. The125-wave limit is a measurement ceiling, not the game's cap.

The native policy reuses the existing character-specific priority and targeting
helpers. The second policy puts a legal Last Flare ahead of those priorities.
Neither is an optimal player, exhaustive strategy search or tier-list proof.
All loadouts are validated for eight slots, unique names, matching Omnic
elements and the four-Omnic cap. Exact equipment is emitted in each run's
metadata by [the harness](../tools/battle-survey.ts).

| Build | Meaning |
| --- | --- |
|bare|No Conduits or Master|
|common0|Eight universal Common Conduits at+0|
|mixed0 / mixed5|Eight Common/Rare/Legendary pieces at+0/+5, including Immortal Vessel, Citadel Spine and Glassroot Gimbal; no Omnic/Master|
|omnic0 / omnic5|Four ordinary pieces plus four matching Omnics at+0/+5; no Master|
|master5|The four-Omnic+5 build plus the default native Master|
|calamitic5|Four Calamitics+5 replace the four lower-rarity pieces, retaining the four Omnics and Master|

Flora receives healing-oriented substitutes. Default Master is variant1,
except Tizu/Thornia variant3. These are candidate builds, not optimized
best-in-slot sets. Moving to another row replaces equipment: it is **not**
an additive or necessarily stronger upgrade. Shared-health conversions and
living-source auras deliberately retain their approved uncapped/stacking rules.

## 1. Difficulty is primarily an investment divide

Win percentages below pool eight squads and ten seeds. Lv.120 combines
ordinary activity finals and all six material finals; Roses/War uses their
Lv.140 finals. Each Calamity column covers all12 identities,120 runs per squad.
Timeouts remain in denominators and are not counted as defeats.

| Equipment |Lv.120 finals|Roses/War140|EX+1|EX+2|EX+3|
| --- | ---: | ---: | ---: | ---: | ---: |
|None|0%|0%|0%|0%|0%|
|Common+0|37.5%|0%|0%|0%|0%|
|Mixed+0|100%|87.5%|86.5%|50.7%|3.2%|
|Mixed+5|100%|100%|99.9%|95.1%|52.1%|
|Four Omnic+0|97.5%|86.2%|82.1%|49.6%|3.2%|
|Four Omnic+5|100%|98.8%|99.0%|94.1%|34.6%|
|Four Omnic+5 and Master|100%|98.8%|99.7%|96.1%|57.7%|
|Four Calamitic+5, four Omnic+5 and Master|100%|100%|100%|93.5%|52.6%|

The winning mixed+5 and Master+5 groups both have a median of **two rounds**
on Lv.120 finals. Calamitic candidates have a median of **one round**.
Meanwhile, Common+0 winners take a median of **eight rounds**. Higher-rarity
candidate sets are not automatically superior: replacing Health/Defense or
Glassroot with mechanics changes the build rather than upgrading it in place.

### EX+3 is not equally hard for every squad

For the default four-Omnic+5/Master builds, wins out of120:

| Squad | Composition |EX+3 wins|
| --- | --- | ---: |
|Starters|Infernis / Tizu / Flora|118|
|Rose balanced|Rosetta / Thornia / Flora|92|
|Rose offense|Crinso / Rosetta / Disciple|89|
|War trio|Nerithe / Orvella / Vaelor|33|
|Standard balanced|Elise / Bruno / Flora|12|
|Control|Bliss / Razor / Aurora|118|
|Two DPS: fire/Rose|Infernis / Crinso|7|
|Two DPS: wind|Atmoso / Elise|85|

These are exact tested build/pilot results, not intrinsic character rankings.
The two wind attackers can burst favorable fresh-entry challenges despite
having poor long-run sustain. Strong starter/control builds already trivialize
much of EX+3, while other legal builds still meet severe walls.

## 2. The late curve is manageable with equipment, not naked level advantage

Machines boss stages20/25/30/35 are actual levels71/88/104/120. Each cell is
wins out of10 at character Lv.105. No synthetic enemy level was substituted.

| Squad / equipment |Lv.71|Lv.88|Lv.104|Lv.120|
| --- | ---: | ---: | ---: | ---: |
|Starters / none|10|4|0|0|
|Starters / Common+0|10|10|10|10|
|Starters / mixed+5, no Omnic|10|10|10|10|
|Infernis+Crinso / none|9|0|0|0|
|Infernis+Crinso / Common+0|10|10|7|0|
|Infernis+Crinso / mixed+5, no Omnic|10|10|10|10|
|Atmoso+Elise / none|3|0|0|0|
|Atmoso+Elise / Common+0|10|10|0|0|
|Atmoso+Elise / mixed+5, no Omnic|10|10|10|10|

The earlier two-person-DPS concern therefore still has a build-dependent
explanation: a level advantage alone does not offset missing survival and
damage equipment. Omnics are **not** required for the tested two-DPS teams to
beat these finals; the mixed+5 sets clear all ten seeds.

## 3. Story becomes comfortable well before max level

This table is the longest contiguous set of fresh-entry stages that all three
seeds clear, not proof of a resource-funded account progression route.

|Character level|No equipment|Common+0|Mixed+0|
| --- | ---: | ---: | ---: |
|0|13|41|74|
|15|48|96|120|
|30|72|120|120|
|45|103|120|120|
|60|120|120|120|
|75 /90 /105|120|120|120|

This is evidence of substantial equipment power, not a recommendation to make
early Story harder: these fixtures grant complete candidate inventories and
do not simulate the acquisition economy or stage-unlock journey.

## 4. Sustain matters much more in continuous Training

Highest cleared wave range across three seeds. `125+` means all runs hit the
survey ceiling without losing; actual enemies stop leveling at120.

| Squad |None|Common+0|Mixed+5|Master+5|
| --- | --- | --- | --- | --- |
|Starters|62-71|91-106|125+|125+|
|Rose balanced|60-70|94-104|125+|125+|
|Rose offense|42-45|60-64|91-95|101-106|
|War trio|46-48|64-69|101-103|96-99|
|Standard balanced|60-65|95-98|125+|125+|
|Control|44-46|65-67|95-98|125+|
|Infernis+Crinso|36-38|56-58|87-91|93-99|
|Atmoso+Elise|34-35|48-49|71-72|58-60|

Fresh-entry boss wins must not be mistaken for sustainable farming performance.
The control team's jump with the changed Omnic/Master package is meaningful;
the War/wind declines also show why equipment rarity alone is not a monotonic
performance measure. This survey does not isolate every individual swap.

## 5. What each character can demonstrably do

Solo results use the default four-Omnic+5/Master candidate at Lv.105. Each
column is wins out of10; EX+1 here is **Machines only**, not every Calamity.
All16 solo candidates lose all ten Machines EX+3 trials.

|Character|Machines120|Roses140|Machines EX+1|
| --- | ---: | ---: | ---: |
|Infernis|10|7|5|
|Tizu|10|10|10|
|Flora|10|10|10|
|Rosetta|10|8|8|
|Thornia|2|0|0|
|Crinso|9|2|2|
|Atmoso|0|0|0|
|Aurora|0|0|0|
|Bliss|10|10|10|
|Bruno|9|0|0|
|Disciple|0|0|0|
|Elise|10|2|2|
|Razor|10|0|0|
|Nerithe|10|1|0|
|Orvella|0|0|0|
|Vaelor|10|3|3|

Solo failure does not measure a support's team value. The separate supported
trials place each subject first, then take the first two nonduplicate members
of Infernis/Tizu/Flora. Most subjects therefore have Infernis+Tizu, not a
healer; starter subjects use the other two starters. Support Masters remain
equipped while the subject cycles through none/variant1/variant2/variant3.

Across six probes and ten seeds under the native policy, **every subject's
default Master1 team clears at least59/60**, and fourteen clear60/60.
Nerithe and Orvella are59/60. Most no-subject-Master controls also clear60/60.
This saturates win-rate comparisons: it does **not** establish equal Master
quality. Both policies/all48 Masters are exercised, but longer fights and
role-specific objectives are needed for a trustworthy Master tier list.

Illustrative subject-attributed effective HP damage per resolved round in
the Master1 support tests: Vaelor35.4k, Bliss29.6k, Elise28.5k, Nerithe26.7k,
Rosetta24.3k, Crinso21.7k and Infernis19.5k. Infernis gets approximately48%
of that damage from periodic Burn. Tizu also creates approximately4.7k Shields/
round and Flora emits approximately4.7k healing/round. Generated equipment
effects are included under their source owner; ally buff value is not credited
back to the support. These are **not** normalized personal DPS rankings.

Many short victories end before the pilot uses a Last Flare. For example,
Infernis averages only0.22 Last Flare casts per six-probe support encounter
with Master1. Lack of casts is not evidence of weak Last Flare potency.
Created Shields are not absorbed damage, and healing is not overhealing value.

## 6. Enemy-only sensitivity tests: stronger is not uniformly better

These are cloned, isolated fixtures, **not live changes or a production curve
proposal**. Only enemies already at level100+ are changed; Health/Attack
multipliers are rounded once. Allies, Defense, patterns and all lower-level
enemies remain unchanged.

Machines120 results pool eight squads and ten seeds:

|Hypothetical enemies|Common+0 wins /80|Mixed+5 wins /80|Master+5 wins /80|Master+5 median winning rounds|
| --- | ---: | ---: | ---: | ---: |
|Live stats|30|80|80|2|
|Health x1.25|22|80|80|2|
|Health x1.50|12|80|80|2|
|Health x1.50, Attack x1.10|8|80|80|2|
|Health x2.00|9|80|80|3|

Simply doubling ordinary boss Health barely slows developed builds, while
further squeezing Common builds. The different surviving subset also explains
why conditional median winner Health can increase when difficulty increases.

Machines EX+3 is more sensitive: Master+5 wins change from46/80 at live stats
to31/80 at Health x1.50 and28/80 when Attack also rises10%. The same HP+Attack
proposal leaves Machines120 at80/80. These figures cover the Machines pattern
only, not all twelve Calamity identities.

**Recommended next design discussion, not an implemented change:**

1. Preserve sub100 accessibility and the character/Conduit power fantasy.
2. Prefer upper-end boss durability or separately tuned challenge encounters
   over a game-wide Attack increase. Test smooth level-dependent changes, not
   the sensitivity fixture's hard100-level gate.
3. For strong challenge builds, investigate telegraphed mechanics that survive
   a one/two-round burst window. Do not silently add immunity or invalidate
   Burn, criticals, Shields, healing or the owner's new equipment effects.
4. Review build acquisition cost/access alongside difficulty. A single stat
   multiplier cannot reconcile Common eight-round fights with prestige
   one-round fights without disproportionately hurting one group.
5. Target Calamity by identity/tier rather than assuming every EX+3 squad
   already wins. The measured57.7% overall Master-build result hides7/120 and
   118/120 extremes.

## 7. Timeouts and limits

Six baseline Calamity runs hit the100-round measurement horizon. Retrying the
same initial fixtures to at least1,000 rounds yields one defeat at round105
and five still unresolved: two Soar EX+2, one Atmospheric EX+2 and two
Atmospheric EX+3, all with the starter squad/mixed gear.
Some action calls automatically advance multiple recovery rounds, so the final
record can slightly exceed the requested round horizon.

These are potential sustain/pilot stalemates, **not proven engine softlocks**.
No timeout is promoted to a victory or silently counted as a defeat. The tables
retain the original fixed-horizon baseline; extended retries are separate
evidence rather than double-counted fixes to baseline rates.

Other limitations: fixed deterministic seeds, heuristic action priorities and
formation order, no exhaustive Conduit optimization, no captured
Elemental-Devourer capability ranking, no acquisition/economy simulation, and
no human reaction/UX evaluation. Many ordinary finales share the same stat
curve; their pooled records are not independent evidence of different curves.
This is not a complete ranking of every ability, Conduit or possible squad.

## Validation and rerun

[Integrity tests](../tools/battle-survey.test.ts) cover all16 legal loadouts,
entry-stat preservation, deterministic replay, effective HP-damage accounting,
no mutation of source fixtures, explicit timeout classification, Master controls
and isolation of hypothetical increases.

Executed successfully:

```powershell
npx vitest run tools\battle-survey.test.ts src\game\calamity.test.ts --maxWorkers=2
npx tsc --noEmit --target es2022 --module esnext --moduleResolution bundler --skipLibCheck tools\battle-survey.ts tools\battle-survey.test.ts
node --check tools\run_battle_survey.mjs
node --check tools\summarize_battle_survey.mjs
```

Targeted validation:104 tests /two files passed (seven survey integrity tests
and97 existing Calamity tests). All1,920 hypothetical-run live controls exactly
match their original endgame fixtures: outcomes, rounds, decisions, survivors,
Health, remaining enemy HP, observed first KO and source contributions.
Original record counts and all three evidence hashes were checked.
No runtime combat changes were made.

Reproduce the datasets with [the runner](../tools/run_battle_survey.mjs),
which refuses to overwrite existing evidence and cleans its temporary bundle:

```powershell
node tools\run_battle_survey.mjs "$env:TEMP\battle-survey-main.jsonl"
node tools\run_battle_survey.mjs "$env:TEMP\battle-survey-focused.jsonl" focused
node tools\run_battle_survey.mjs "$env:TEMP\battle-survey-timeouts.jsonl" timeouts "$env:TEMP\battle-survey-main.jsonl"
node tools\summarize_battle_survey.mjs "$env:TEMP\battle-survey-summary.json" "$env:TEMP\battle-survey-main.jsonl" "$env:TEMP\battle-survey-focused.jsonl" "$env:TEMP\battle-survey-timeouts.jsonl"
```

Original raw JSONL SHA-256 digests (metadata timestamps make rerun file
digests differ; seeded encounter outcomes remain reproducible):

- Main: `d431a4acbcb8f073241410efc4ea8639c1b4fd0cc191712c2c8d4d90e4820a64`
- Focused: `6bc669dcd43dd574f50b0cd69714840083372aabc9a90522800b56ab9d34c2a9`
- Extended: `f400ccb885239704bd1d5c0352084dad90bb26dd6ab80ca99c12ce95169292b3`

Raw evidence and the full grouped JSON summary are retained in the originating
session's `files` directory, named `battle-survey-2026-10-23.jsonl`,
`battle-survey-focused-2026-10-23.jsonl`,
`battle-survey-timeouts-2026-10-23.jsonl` and
`battle-survey-complete-summary.json`. No account data is present.
