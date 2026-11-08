# Radiant combat overhaul: system and starter review specification

## Fresh-entry economy and retry measurements (2026-11-08)

The reward/lifecycle bridge now has a reproducible **read-only actual-authority
economy experiment**, not just unit-tested ledger arithmetic. No gameplay RNG,
currency curves, rates, entry caps or production deployment changed.
[Study](../../tools/radiant-economy-study.ts) executes the current
`resolveRadiantRun` start/action/exit operations with actual authored rewards
and frozen loadouts. It screens every paying nonterminal prefix of its bounded
chosen action sequence, verifies partial/full exits preserve banked rewards,
and replays the strongest identical prefix via quit/Retry three times.

Reproduce with `node tools\run_radiant_economy.mjs <new-report.jsonl>`.
Output exclusively creates a new file, includes source-commit/bundleSHA256/
start time, explicit metadata, every measured or denied fixture and independently
checkable cohort summaries. No network/database/account funding or new tooling
dependencies. Scratch bundle has an individually allocated temporary directory
and is cleaned up; existing report files are never overwritten.

**Metric:** actual saved Prismatica per accepted authority operation, counting
start + player actions + exit. The existing SQL limit is120 attempted operations
in a60-second server-time window anchored to the first request; retries/rejections
also consume attempts. Enemy phases resolved inside one player operation do
not become fictional extra requests. These rates are **not real-time income**:
no animation/speed/latency/GPU/browser or production database execution is
measured. Multiplying by120 is only an idealized sustained request ceiling,
not an observed player rate or a claim about window-edge bursts.

Final cohort:61 early/final anchors, seeds1/1729/104729,9 account/policy cohorts,
**411 measured encounters +1236 explicit access denials** across30 exercised
families. Calamity's zero-Prismatica bosses and ownership-gated Oblivion are
excluded; inactive Sunshade remains denied, never certified accessible.
Training fresh entry is wave1 only, not the high-wave pressure fixture.
Maximum300 player actions and120 stagnant actions; timeout/stalemate explicit.

| Conditional account / policy | Measured | Victory | Defeat | Stalemate | Denied | Paying partial faster than same-encounter victory |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| One free Infernis Lv0, balanced |6|6|0|0|177|0|
| One free Tizu Lv0, balanced |6|3|0|3|177|0|
| One free Flora Lv0, balanced |6|6|0|0|177|3|
| One free Infernis Lv0, Normal-only |6|6|0|0|177|0|
| One free Tizu Lv0, Normal-only |6|6|0|0|177|3|
| One free Flora Lv0, Normal-only |6|6|0|0|177|3|
| Owned Infernis Lv30, no gear |93|30|63|0|90|0|
| Acquired starter trio Lv60, Common+0 |105|72|33|0|78|15|
| Acquired ordinary six Lv105, farmed gear/Masters |177|177|0|0|6|108|

Free controls are **separate one-starter accounts**, not three granted starters.
They contain no precleared stages; only initial Story/Training are accessible.
First Story results166 Prismatica/2 Null-Prismatica include150/2 first-clear
bonuses and are marked `firstClearSensitive`, not repeatable premium income.
Developed fixtures assume the reported acquired progress/gear/Masters and
authored stage prerequisites. Their Story was precleared to exclude first-clear
premium/regional bonuses from repeat farming. They are not average accounts.

Free Tizu's conservative balanced policy stagnated on Training; **Normal-only
cleared all three seeds**, earning15 Prismatica in9 actions. Infernis/Flora
Normal-only likewise clear, in6/9 actions respectively. This demonstrates a
policy artifact, not inability of the starter or approval to retune him.
No character/gear/enemy stats changed to hide that result.

**Invariants:**366 strongest-prefix sequences replayed1098 times,17703 additional
accepted resolver operations: **zero extra Prismatica and zero extra kill loot**.
All411 measured final exits retained banked rewards and disposed the study with
zero new reward events. Primary complete/bounded cycles used7437 operations.
These are direct reducer/virtual-wallet tests, not SQL transaction proof.

**Observed incentive:** among victorious developed fixtures, best partial
prefix rate exceeded the same-seed full fresh-cycle rate in15/72 Common-trio
and108/177 farmed-six samples. Maximum ratios1.111111 and1.101852 respectively.
The strongest farmed-six Treasury-final partial sample pays28709/45 requests
(637.98 per request), versus full30000/49 (612.24): about4.2% higher rate while
forgoing that boss's kill/capture outcome. This is not a duplicated reward or
a global optimal strategy. Rounding, overkill, action ordering and fresh-reset
overhead produce modest prefix-efficiency differences; no claim all strategies
or roster permutations were exhaustively searched.

Do not impose a hidden forfeiture, timed cap, stamina charge, nonlinear damage
payment or artificial animation delay from this experiment. Preserve requested
partial rewards and linear lowest-HP accounting. Final economy tuning still
needs network/presentation duration and access/cadence comparisons; these
request rates alone cannot establish an acceptable income/minute target.

Validation:135 tests across four focused economy/run/progression/dispatch
files and `npx tsc --noEmit` pass. Report cohort counts independently
recomputed from every JSONL sample/denial; zero-repeat/exit invariants checked.
Recorded verified report SHA256:
`9fdac97bd9d5fb74efbecff30db171fb1a0192dd69ab4270e1ef35a7a4bc31e7`;
study bundleSHA256:
`6eef4ffdeec08ea62023f022e3a13ebbb2838cfb778282762ee229f9c926ac72`,
based on `d023153c` plus this isolated study code. A later reproduction includes
its own source metadata, not an invented matching hash.
The publication report independently reproduces every prior verified sample/
denial after making free-starter profile identity consistent. This tooling-only
stage does not rebuild/deploy the client or shared authority.

## Authored kill rewards and progression bridge (2026-11-08)

The gated authority now connects real Radiant actions to the existing authored
kill loot/account validation, discovery, stage unlocks and first-clear rewards.
This supersedes the prior **partial-currency-only/no-progression** study
limitation. It does not enable/deploy the overhaul or settle final balance/UI.

[Reward bridge](../../src/online/radiant-rewards.ts) reconstructs the exact
authored enemy source, not legacy combat. Shared `awardDefeats` retains material,
capture, premium, Conduit/component/Master chest and War recruitment rolls.
`saveDamagePaidAccountRewards` validates original reward ranges and atomically
updates the account as before, but suppresses only base enemy Prismatica: the
lowest-HP ledger has already paid it. The fixed-minimum study budget remains
experimental, not the final published economy calibration. First Story
stage/regional bonuses, Calamity chests/shards/recruitment and ordinary final
clear evidence remain real authored grants, never replacement rolled loot.

Frozen study **schema2** adds a saved per-enemy defeat ledger, independent reward
RNG streams and an actual-victory completion flag. Retry restores physical
combat but retains paid HP, kill loot, reward seeds and completion. A kill from
a prior quit attempt cannot prematurely clear the current attempt; a later
actual victory still awards its not-yet-paid stage clear without rerolling old
kills. No duplicate currency/material/chest/capture/recruitment on Retry.
This isolated aggregate has never been enabled/deployed: old schema1 study
fixtures are explicitly rejected, not silently upgraded or erased. Existing
production wallets/legacy battle schemas and ordinary reward paths unchanged.

The authenticated HMAC request UUID additionally namespaces captures (stable
enemy index XOR in its last32 bits, retaining UUID bits); denied commits retry
the identical capture identity/outcome without extra gameplay RNG. Existing
non-study callers keep their ordinary UUID generation. Capture holdings/fodder
and old raw gear/progress/locks/loadouts are retained; only actual reward
deltas are merged into raw holdings. Captures remain ineligible for study teams.

Responses now contain ordered typed **`rewards: BattleEvent[]`** alongside
combat `events`; validate both before presentation. Kill reward `amount` is
only actual additional Prismatica (normally0; Story bonuses remain positive),
not the obsolete sampled kill payout. Messages name saved loot and explain
damage-paid currency; recruitment/clear decorations follow successful virtual
account resolution and the response is only returned after the aggregate CAS.
No production UI caller/presentation has been connected yet.

Continue uses newly saved unlocks, carries independent reward seeds and frozen
loadouts, and increments real Training waves instead of restarting wave1.
Final staged encounters and single-boss Calamity deny Continue. `quit` retains
the study for Retry; new explicit **`exit`** disposes it while returning the
banked final receipt. A subsequent authorized fresh entry is allowed; duplicate
exit requests still return their saved response. Fresh-entry farming throughput
and final economy access/duration comparisons remain release gates.

Validation:
```
npx vitest run src\online\radiant-rewards.test.ts src\online\radiant-run-progression.test.ts src\online\radiant-run.test.ts src\online\radiant-dispatch.test.ts src\online\radiant-transport.test.ts src\game\account.test.ts src\game\story.test.ts src\game\calamity-account.test.ts src\game\gates-of-oblivion.test.ts src\game\machines.test.ts src\game\elemental-war.test.ts --maxWorkers=2 --testTimeout=60000
npx vitest run --exclude src/radiant-ui.test.ts --exclude src/ui-design-lab.test.ts --maxWorkers=2 --testTimeout=60000
node tools\bundle_server_game.mjs
npx tsc --project supabase\functions\game-operation\tsconfig.json
npm run build
```
All284 authored anchors have exact non-Prismatica loot/progression parity tests,
not combat clear-rate claims. Additional checks cover first/replay Story
bonuses, partial-kill Retry completion, favourable new/duplicate War and
Calamity recruitment fixtures, overflow, real action-to-Story unlock/Training
Continue, deterministic denied-capture CAS, exit and malformed saved rewards.
Late final-boundary checks use synthetic victory fixtures, not solo clear claims.
Full-suite/build outcomes are recorded in the handoff. No actual Radiant DB
execution or hosted release proof; authority remains disabled/undeployed.

Verified693 focused tests across11 files; full suite266 files/9883 tests passed
(351.37s), excluding only the two preserved unpublished mock-up test files.
Final focused rerun covers the final message/validation changes. Matching
server bundle regenerated; client/authority typechecks and build passed with
the existing large-chunk warning.

## Gated authenticated authority dispatch (2026-11-08)

The account/run API is now wired into the actual authenticated
`game-operation` handler via a dedicated `{ radiantStudy: RadiantRunRequest }`
body. It remains **disabled by default and undeployed**. This supersedes the
earlier absence of dispatch/entropy integration, not the incomplete reward/
progression/UI migration or actual database verification gates.

[Handler](../../supabase/functions/game-operation/handler.ts) preserves legacy
routes and authorization; [study dispatch](../../supabase/functions/game-operation/radiant-dispatch.ts)
enforces unknown-JSON validation, rate limiting, saved account access and
server-owned calibration. The thin Deno entrypoint imports the regenerated
shared bundle, preserving the existing client/server resolver foundation.

`RADIANT_STUDY_ENABLED` must equal `true`; otherwise503 without study DB commit.
`RADIANT_STUDY_SECRET` must have at least32 UTF-8 bytes, remain server-only and
stable across retries. Domain-separated HMAC-SHA256 of authenticated user/
request ID derives UUIDv4 and independent encounter/charge/target seeds.
No client seed/outcome/HP/budget authority or missing-secret random fallback.
`RADIANT_STUDY_CALIBRATION` defaults `authored-control`; experimental
`radiant-pressure-v2` requires explicit server opt-in. Never infer tuning
approval from that available capability.

Typed [radiant transport](../../src/online/radiant-transport.ts) validates
requests/responses and surfaces server denial/stale/connection errors. It has
no menu/battle callers or auto-enable behavior. Existing ordinary account
operations preserve frozen `radiantStudy`; legacy entry cannot overwrite it.
Stored frozen runs/responses and actual saved account snapshots are validated.
Rose study entry also preserves the actual timed-event gate.

Existing service-role `find_game_request`/`load_game_account`/
`commit_game_operation` RPCs carry complete account/run/revision/receipt
aggregates atomically; no new SQL schema migration. Tests now exercise the
real HTTP handler with mocked Supabase Auth/RPC—not only the repository API.
Actual hosted/local Radiant DB execution is still **unverified**; local
Supabase/Docker/Deno unavailable. Legacy disposable-account hosted smoke does
not prove this new route's persistence or justify enabling it.

Validation:
```
npx vitest run src\online\radiant-dispatch.test.ts src\online\radiant-transport.test.ts src\online\radiant-run.test.ts src\online\server-game.test.ts src\game\radiant-combat.test.ts src\game\radiant-conduits.test.ts src\game\radiant-gauge.test.ts src\game\radiant-pressure.test.ts --maxWorkers=2 --testTimeout=60000
npx tsc --project supabase\functions\game-operation\tsconfig.json
node tools\bundle_server_game.mjs
npm run build
```
1302 tests across eight parent-selected files pass. Client/authority types and
build pass with existing chunk warning. Gate-off/Auth/fail-closed entropy,
different-user seeds, calibration denial, invalid input, duplicates/CAS,
quit/retry/frozen gear and aggregate preservation are tested. The generated
bundle includes dispatch; it has not been deployed or activated.

Remaining: actual DB verification; completed kill/material/chest/recruitment/
unlock rewards, all-mode Continue and production frozen-run/manual captured
selection migration; fresh-run lifecycle and farming measurements; final
pressure/access tuning;174 portrait crops and real cinematic Home/Battle
Gauge/status/finite shader VFX. Final art brief remains provisional.

## Account-derived runs and atomic receipt boundary (2026-11-08)

[radiant-run.ts](../../src/online/radiant-run.ts) now implements the real saved
account-to-run boundary and an adapter to the existing server transaction RPC.
This is **not mounted in production dispatch**: no live account migration,
database execution, gameplay release or final difficulty activation is claimed.
It supersedes the earlier absence of an account-derived/persistence contract,
not the remaining dispatch/entropy/database validation requirements.

### Actual saved loadouts and manual compatibility

`radiantAccountLoadouts(account)` derives frozen1-6 distinct canonical bearers
from actual saved squad/progress. It uses existing level/evolution, weapon and
binary ascension flags, owned ordinary Conduits/global ranks/equipment and
Masters through the read-only gear adapter. It does not accept a client-written
battle outcome as proof of ownership.

Captured, missing, unreleased or duplicate squad members return explicit
manual-selection errors. No automatic starter/team grant or silent squad
repair; captured copies, fodder and all other holdings remain in the raw
account. The gear adapter now accepts actual saved Master holdings correctly.
Freeze occurs at successful authorized entry; later menu gear/progress edits
do not change the run's combatants.

### Atomic operation contract

`resolveRadiantRun` validates and recomputes a requested player action from the
prior trusted frozen state, resolves scheduled enemy actions/phase completion,
and returns the new account/run/revision/events as one aggregate.
`executeRadiantRun` performs receipt lookup and delegates atomic compare-and-
swap commit to `RadiantRunRepository`. Request fingerprint conflicts and stale
account/run/encounter revisions are explicit failures.

`radiantRpcRepository` adapts the existing service-role
`find_game_request`/`commit_game_operation` functions. The existing RPC locks
and commits the whole server aggregate plus immutable response receipt;
wallet and run are **not** written separately. No new wallet store or SQL
migration is added: optional server aggregate `radiantStudy` version1 contains
the frozen run, whose combat state uses schema3.

Repository atomicity is required by the interface and exercised through a
transaction-contract mock, **not yet verified against an actual hosted DB**.
The future gated authority dispatch must supply trusted authenticated load,
the existing service-role transaction client and server-generated stable entry
entropy; the caller cannot choose run IDs/seeds/budgets/HP or resolved events.

Partial damage payouts use the actual enemy budget/lowestHP ledger generated
from authored encounter snapshots. Integer currency progress and the account
receipt update enter the same aggregate commit as run/charge/target seeds and
revision. Denied writes, overflow and stale CAS return no partial award.
Duplicate request IDs return the same saved response rather than reapplying
combat or charging/earning again.

### Quit, Retry, Continue and economic limits

Quit retains already saved partial currency. Retry uses the same encounter's
banked lowestHP/paid ledgers while restoring frozen initial combat state;
re-damaging healed/reset HP cannot mint that budget twice. Defeat also retains
saved progress. Separate charge and target seeds persist independently.

Continue is allowed only after victory into an existing accessible next stage
and preserves frozen initial loadouts. Final/locked stages are denied. This
boundary does not fabricate stage unlocks, kill materials, chest/recruitment
rolls or other live rewards. Training Continue and complete all-mode reward/
progression transitions still require live integration.

Fresh starts use explicit server-authorized run identity/entropy. This contract
does **not** impose a new global farming lock or prove repeated fresh-entry
partial farming is balanced. Server entry authorization/entropy and actual
quit/retry farming measurements remain release gates.

### Validation

```
npx vitest run src\online\radiant-run.test.ts src\game\radiant-combat.test.ts src\game\radiant-conduits.test.ts src\game\radiant-gauge.test.ts src\game\radiant-pressure.test.ts src\game\account.test.ts src\online\server-game.test.ts --maxWorkers=2 --testTimeout=60000
npx tsc --project supabase\functions\game-operation\tsconfig.json
npm run build
```

Parent validation:1259 tests across seven files pass. Client/authority types
and build pass; existing chunk warning retained. Coverage includes actual
account/captured preservation, frozen gear, retry/quit/receipt idempotence,
recomputed actions, budget/HP/Shield boundaries, overflow/denied commit and
mock atomic concurrency/CAS. Earlier agent validation used a broader selector;
1259 is the exact parent command's result, not a new full-suite count.

Remaining: gated dispatch and stable server-entry entropy, actual DB transaction
verification, all real reward/progression/run migrations, final enemy/access
tuning, remaining174 portraits and real cinematic Home/Battle Gauge/status/
finite radiant VFX. Single art brief remains provisional; no live deployment.

## Actual pressured encounters: experimental calibration (2026-11-08)

The new [encounter adapter](../../src/game/radiant-pressure-encounters.ts),
[action-driven runner](../../src/game/radiant-pressure.ts) and
[enemy factor declaration](../../src/content/radiant-enemy-calibration.ts)
now exercise the radiant roster/gear against **actual authored spawn data**.
They remain isolated study tools, not live enemy changes or approved tuning.
Levels, entry gates, authored ability schedules and saved progression stay
unchanged. This supersedes the earlier status that no pressure study exists,
not the requirement for a coherent authority/UI migration.

The adapter covers44 current activity families,284 representative anchors and
245 authored enemy species/forms. It includes ordinary/boss and existing
seasonal/endgame activity definitions instead of only the historical activity
list. Every currently authored live-spawn species/form is represented, **not
every possible floor/level combination or all future content**. Actual access
errors remain explicit; inactive/ownership-gated scenarios are laboratory
coverage, not claims an ordinary account can enter them.

### Reproducible experiment

The harness resolves real player actions, progressive personal/shared Flares,
enemy attacks/healing/Shields and authored mechanical hit packets through the
pure engine. It records actual HP damage, effective healing, Shield creation
and absorption separately, personal/shared charge, currency progress, death,
rounds and surviving members. Atomic enemy multi-hit/heal/Shield actions were
added to support schedules; invalid actions preserve the input snapshot.
Cosmetic hits do not become bonus-mote rolls.

Three main seeds:1/1729/104729; maximum100 rounds; explicit20-round stagnation
bound. Species-completion and bounded Master screening use one seed each.
Timeout and stalemate are separate outcomes, never success-shaped clears.
Minimum team HP and maximum Shield are sampled at action boundaries, not
within every split packet. No GPU or cinematic performance experiment.

One starter is free. Every trio/six, developed progression, gear and Master
configuration is **conditional acquired laboratory access**, not an observed
average account or a free grant. Ordinary scenarios exclude Calamitic bearers/
gear. A separately screened six-member Calamitic scenario does not determine
ordinary enemy targets.

Study-only multiplicative factors interpolate the current authored level:

| Enemy level | HP | Attack | Defense |
| --- | --- | --- | --- |
|1 |1 |1 |1 |
|30 |.70 |.75 |1 |
|60 |.50 |.50 |.90 |
|80 |.40 |.40 |.80 |
|120 |.25 |.20 |.60 |
|140 |.18 |.12 |.50 |
|170 |.12 |.07 |.40 |
|185 |.12 |.07 |.40 |

Ordinary/boss category factors are1; Calamity additionally uses HP1.5,
Attack3 and Defense1.1. These explicitly large experimental reductions convert
the old combat scale for this study. They are **not a silently deployed balance
decision**, and the winning developed-team sample below is not sufficient
evidence to accept them as the final difficulty ladder.

### Observed outcomes, not population estimates

Parent reproduced the tuned run:2001 encounters plus13 Master-screening samples.

| Scenario | Wins | Defeats | Timeouts | Stalemates |
| --- | --- | --- | --- | --- |
| Conditional solo progression |212 |402 |0 |0 |
| Conditional Common trio |501 |111 |2 |0 |
| Conditional developed ordinary six |614 |0 |0 |0 |
| Common six late-wall control |5 |17 |7 |10 |
| Separate screened Calamitic six |108 |0 |0 |0 |
| Free starter opening tests, three seeds each |9 |0 |0 |0 |
| Support-only control |0 |0 |0 |3 |

The Common late-wall control demonstrates that sustained survival can still
fail to clear; three support-only runs correctly terminate as stalemates.
The developed ordinary six's614/614 and screened Calamitic108/108 successes
are **not proof of balanced late content**. They establish functioning clears
under the selected loadouts/policy, and require tougher comparative pressure/
duration/access analysis before approving final factors.

For a representative screened Calamitic result, the six survived47 completed
rounds; minimum sampled teamHP122521 and maximum sampled Shield643493.
This is a sourced sustained-defense result, not equivalent to packet survival,
healing efficiency or zero-Defense DPR. The screened party includes
Ozriel/Ilvaris/Kaelith/Tizu/Flora/Disciple at owned final-form105 with matching
Masters and gear; it is neither a free squad nor an ordinary account.

Ordinary study currency uses fixed minimum budgets; Calamity partial-currency
budget is zero. Chest/recruitment/random reward tables are not rolled.
Authority receipt persistence, quit/retry farming and live save safety remain
separate pending work; pressure tooling makes no economic deployment claim.

### Commands and release blockers

```
node tools\run_radiant_pressure.mjs <new-report.jsonl> --tuned-only
npx vitest run src\game\radiant-pressure.test.ts src\game\radiant-combat.test.ts src\game\radiant-conduits.test.ts src\game\radiant-gauge.test.ts --maxWorkers=2 --testTimeout=60000
npx tsc --project supabase\functions\game-operation\tsconfig.json
npm run build
```

The CLI writes a new machine-readable report with source commit/bundle hash
and refuses overwriting an existing report; its temporary compiled helper is
removed on completion. Omit `--tuned-only` to include baseline comparisons.
1080 tests across four files pass; client/authority typechecks/build pass,
existing chunk warning retained. Parent reproduced the2001/13 aggregate.
Full encounter records remain study artifacts, not thousands of committed
balance snapshots or an invented public clear-rate estimate.

Before release: settle final enemy factors against stronger comparative
pressure and realistic acquisition distributions; preserve actual stage/gate/
reward contracts; wire authority-backed partial damage receipts and frozen
run/saved-loadout/captured-manual-selection compatibility; finish remaining
portrait intake and real Home/Battle layered Gauge/status/VFX presentation.
No hosted overhaul release or mandatory new art commission is claimed.

## Ordinary Conduit conversion and frozen gear study (2026-11-08)

This is the latest operative isolated implementation status. The complete
**99-ID ordinary catalog** now has an explicit typed conversion matrix in
[radiant-conduits.ts](../../src/content/radiant-conduits.ts), integrated into
[four-stat loadout resolution](../../src/content/radiant-combat.ts) and the
[study engine](../../src/game/radiant-combat.ts). The96 fixed released personal
Masters remain separate and unchanged. No items, artwork, ownership, prices,
drop rates, gates or paid upgrade recipes were added or removed.

Catalog verified against the current actual acquisition definitions:

| Ordinary rarity | IDs |
| --- | --- |
| Common |10 |
| Rare |15 |
| Legendary |15 |
| Omnic |45 |
| Calamitic |14 |
| Total |99 |

The historical85-ID catalog is not the current conversion target. Each stable
ID declares one main effect and, where useful, one related secondary effect.
No hash/index-based arbitrary effect assignment or retired critical/Skill Power/
Gauge Capacity stat remains in the new gear model. Existing names/art keep
their identity; elemental eligibility still comes from the actual catalog.

### Magnitudes, ranks and useful progression

`radiantConduits` is the exhaustive base-rank matrix;
`radiantConduitPrimitives` and `radiantGearAmount` resolve the exact frozen
rank-adjusted effects. Ordinary ranks remain0-5 and use the existing upgrade
validation/costs. Every listed magnitude scales by `1 + .1 * rank`: rank5 is
1.5 times its base effect, not an extra proc, activation mode or probability.
Integer personal charge is resolved through the tested bounded charge path;
shared-normal amounts use exact60-unit shared charge.

Representative same-purpose base-rank comparisons:

| Purpose | Common | Rare | Legendary | Omnic | Calamitic |
| --- | --- | --- | --- | --- | --- |
| Normal amplification |Precision Escapement10% |Falcon Sight18% |Execution Orrery40% |Chaotic Fault Verdict60% |Comparable Calamitic design100% |
| Defense amplification |Bastion Lock15% |Aegis Capacitor25% |Granite Hourglass40% |Tectonic Atlas Bastion50% |Monolith of the Unmoved Star80% |

Related secondary effects and eligibility matter: this is not a claim that
every higher-tier item dominates every lower-tier item in an unrelated job,
nor that an optimized six-member Calamitic build is ordinary progression.
Final pressured rarity/upgrade value and affordable early access still need
measurement before release.

### Implemented combat domains

- HP/Attack/Defense/Recovery and deterministic Normal/Flare amplification,
  Defense piercing, guarding and direct resilience.
- Effective healing/sustain, source-owned unlimited-until-broken Shields,
  guard/round/Flare/actual-HP-loss Shield creation.
- Guaranteed personal Normal/guard gains, healing/absorption returns,
  cooperating team grants and exact shared Normal contributions.
- Source-owned Burn, Weaken, exposure, helpful Attack effects and status-linked
  defensive payoffs; first-member leader/cooperation/next-unacted-ally utility.
- Actual absorbed damage reflection and leech, bounded at their source/action
  boundary. Generated output cannot recursively feed native/gear triggers.

Gear is frozen per bearer. Processing distinguishes direct/mechanical hits,
generated packets, effective HP restoration, actual absorption and Shield
creation. Multi-target casts and six wearers have bounded source-owned
action/round trigger ledgers and living-owner predicates. No added gameplay
RNG, currency multipliers, reward rerolls, revival or extra turns.
Personal cap remains C/2C; gear does not invent Gauge Capacity or a third bar.
Shared gains require the frozen final-form eligibility and Eternal cannot
fund its own shared meter.

### Eligibility and read-only account boundary

[adaptRadiantLoadouts](../../src/game/radiant-loadout.ts) returns an explicit
`{ ok: true, loadouts }` or `{ ok: false, errors }` result. It reads supplied
ownership, saved upgrade ranks/equipment and Masters, validates each equipped
ID and freezes a cloned loadout. It performs **no account write, removal,
auto-selection or acquisition grant**. Captured IDs require manual selection
of an acquired Element-Bearer instead of a fabricated replacement.

The caller must supply actual acquired canonical bearer IDs and actual saved
progress. This typed study boundary is not an untrusted authority request
parser or proof that caller-supplied ownership is genuine.

`validateRadiantGear` retains eight ordinary slots, unique IDs per bearer,
owned equipped IDs, at most four matching-element Omnic items and the existing
five-universal-Calamitic restriction. Cross-bearer unlock sharing and existing
saved global upgrade ranks are preserved. Personal Master ownership and
matching-bearer validation remain separate from ordinary ranks.

`RadiantLoadout.gear` is optional for existing zero-gear study callers; absent
gear means no ordinary effects, not accepting malformed supplied gear.
Study schema advances to **version3** for frozen gear and effect ledgers.
Old isolated snapshots fail explicitly and require study restart; production
run restart, reward retention and saved-loadout UI compatibility are still
future migration work. No live saved account was rewritten by this study.

### Verification and remaining release gates

```
npx vitest run src\game\radiant-conduits.test.ts src\game\radiant-combat.test.ts src\game\radiant-gauge.test.ts src\game\conduit-equipment.test.ts src\content\phase-zero-conduit-upgrades.test.ts --maxWorkers=2 --testTimeout=60000
npx tsc --project supabase\functions\game-operation\tsconfig.json
npm run build
```

**1633 tests across five files pass**, including229 new gear tests and the
existing459 radiant core tests. Coverage includes exact catalog/ranks,
comparable-purpose progression, actual domain effects, source/loop boundaries,
six-wearer cases, gear eligibility, immutable frozen results and read-only
adapter errors. Authority typecheck passes; build includes successful client
typecheck and retains the existing large-chunk warning. Existing live conduit
equipment/upgrade tests remain passing.

Still no live deployment: next measure actual pressured1/3/6-member encounters,
charge/sustain/Shield loops and all-activity authored enemy anchors. Then
implement authority-backed partial damage receipt persistence, captured/manual
selection and existing saved-loadout/frozen-run migration plus cinematic Home/
Battle statuses/Gauges/VFX. Other174 face crops and final single art-intake
confirmation remain outstanding. Mechanical tests are not enemy clear-rate,
GPU performance or release verification.

## Released-roster combat study: operative expansion (2026-11-08)

This section supersedes the starter-only scope below. The isolated study now
implements **32 released canonical Element-Bearers,96 progressive Flare offers
and96 matching fixed personal Masters**. Sunshade's six bearers and18 Masters
are excluded. It is still **not connected to account/authority/live battles**;
ordinary gear, actual ownership adapters, migration, UI and pressured enemy
calibration remain release prerequisites.

### Complete kit and Master coverage

[Content definitions](../../src/content/radiant-combat.ts) define each released
bearer's four base stats, personal cost, precise passive rule, first-member
leader and signature. [Engine](../../src/game/radiant-combat.ts) executes every
passive, not the old native skill tooltip. Native skill text/counters are not
silently left attached to an unrelated new implementation.

| Identity | Signature family | Passive purpose | Master1 /2 /3 attunements |
| --- | --- | --- | --- |
| Infernis |Cinderwake |Normal ignition against own Burn. |Corona /Corona /Solstice |
| Tizu |Tideglass |Actual full native Shield absorption charge, once per phase. |Aegis /Solstice /Corona |
| Flora |Dawnseed |Normal HP damage plants delayed Recovery Seed. |Prism /Corona /Solstice |
| Rosetta |Rose Meridian |Normal hit exposes enemy. |Corona /Corona /Prism |
| Thornia |Thorn Aegis |Guard protects wounded ally. |Aegis /Solstice /Corona |
| Crinso |Blossoming Edge |Normal follow-up against Burn. |Corona /Solstice /Prism |
| Atmoso |Sky Without End |Normal hit empowers next unacted ally. |Corona /Prism /Solstice |
| Aurora |Final Dawn |Flare cleanses strongest allied Weaken. |Prism /Solstice /Aegis |
| Bliss |Thousandfeather |Later Normal heals wounded ally. |Prism /Corona /Solstice |
| Bruno |Worldwall Mantle |After actual HP loss, self-Shield once per round. |Aegis /Solstice /Corona |
| Disciple |Mindcrown Resolve |Guard empowers next unacted ally. |Prism /Corona /Solstice |
| Elise |Thunderwheel Recall |Normal follow-up against exposure. |Corona /Corona /Aegis |
| Razor |Unbroken Midnight |Guard Weakens strongest attacking enemy. |Aegis /Corona /Solstice |
| Maerion |Unreturned Voyage |Effective Flare healing returns personal charge. |Prism /Solstice /Aegis |
| Caevren |Meridian Counterweight |Actual absorbed Shield damage enables self-heal once per round. |Aegis /Solstice /Prism |
| Vespera |Beacon Signal |Normal applies short source-owned Burn. |Corona /Prism /Solstice |
| Ilyss |Severance Mercy |Guard cleanses strongest allied Weaken. |Prism /Solstice /Aegis |
| Asteriel |Moonflower Promise |Normal plants two-round Recovery Seed. |Prism /Prism /Solstice |
| Serapha |Sanctuary Interval |After HP loss, maxHP self-Shield once per round. |Solstice /Aegis /Prism |
| Nerithe |Ocean Beyond the Map |Normal-only fixed additional personal charge. |Corona /Corona /Prism |
| Orvella |Faultline Foundation |Guard builds own Defense Shield. |Aegis /Solstice /Corona |
| Vaelor |Final Chord |Normal against exposure returns personal charge. |Corona /Corona /Solstice |
| Caldrex |Closed Kiln |Actual own-Shield absorption applies retaliatory Burn once per round. |Aegis /Solstice /Corona |
| Solenne |Last Reverberation |Guard adds next-phase mitigation. |Aegis /Solstice /Prism |
| Myrthen |All That Ripens |Normal against Burn restores own HP. |Corona /Corona /Prism |
| Neralis |No Crossing Left Empty |Effective Flare healing also grants one wounded ally a Shield. |Prism /Solstice /Aegis |
| Varkhel |Bridge Holds |Normal hit protects next unacted ally. |Aegis /Solstice /Corona |
| Seravelle |Road Belongs to Everyone |Guard protects wounded ally with Recovery Shield. |Prism /Corona /Solstice |
| Velmira |Leave the Doorway Standing |Normal against Weaken exposes enemy. |Corona /Corona /Aegis |
| Ozriel |Unbroken Refusal |Actual low-HP damage enables self-Shield once per round; no revival. |Solstice /Aegis /Corona |
| Ilvaris |Fate-seared Hymn |Normal plants sourced Recovery Renewal. |Prism /Solstice /Corona |
| Kaelith |Glass Meridian |Normal follow-up against enemies starting above half HP. |Corona /Corona /Aegis |

Every signature keeps its authored target set across all three tiers. Starter
names/numerical Flare offers remain as in the previous study. Other families
advance with Ascendant/Everlasting suffixes,1.35/1.8 direct-damage scaling and
1.25/1.55 support scaling. Exact base coefficients/clocks are in typed content.
These are delegated **study values**, not measured ordinary/enemy difficulty.

Equinox remains the unequipped default. Every equipped matching Master now
actually attunes to Corona/Aegis/Solstice/Prism; none falsely remains Equinox.
The nine starter Masters retain their specific prior payoffs, including
additional Burn/Renewal clock, specific Shield/healing boosts, personal Shield,
and explicit selected-enemy generated strike. Generated strikes never roll
bonus motes or recursively trigger native packets.

Other bearers' Master1 enhances that bearer's named passive by15%; Master2
enhances its signature by15%; Master3 adds five percentage points to its living
first-member leader. Cleanse passives instead gain15% Recovery healing per
actually cleansed recipient under Master1. Fixed values, no Master ranks,
new items or acquisition changes. Source predicates, exact effective healing
and once-per-round absorption/HP-loss limits prevent success-shaped fake procs.
Removing the Master restores neutral stats and removes its personal modifier.

### Frozen compatibility and source semantics

Loadouts use canonical IDs (`ember`/`tide`/`sprout`, not display names) plus a
distinct encounter instance ID. `validateRadiantParty` rejects duplicate
bearer identities and sizes outside1-6. The pure study constructor remains
available for synthetic duplicate-owner stress tests; the eventual account
adapter **must** use that eligibility validator and actual saved ownership.
No claim that this pure validator itself establishes account ownership.

Saved `CharacterAscension` flags replace the initial invented aggregate Imbue
counter: `stats` retains the1.5 stat multiplier and actual cap; `skill1` maps
to passive potency +50%; `skill2` maps to leader potency +50%; `lastFlare` maps
to signature magnitude +50%. Binary cleanse `skill1` adds50% Recovery healing
on an actual cleanse. Saved weapon rank uses existing0-10/+2% Attack rules.
No conversion write or new cost/paid upgrade is implemented here.

Only the frozen first living leader applies its aura; death does not promote
another. Defensive leader bonuses use Defense, not an HP aura that increases
the displayed maximum without a corresponding current-HP ledger. No hidden
generic role bonuses. Strongest-source Weaken/exposure/Attack/mitigation effects
are separate clocks; unlimited Shields remain independent ordered sources.
Generated follow-ups, retaliation and periodic packets are not mechanical bonus
mote hits. HP-loss passives do not trigger on fully Shielded Normals.

Study schema advances to **version2** for new timed/source/guard-trigger ledgers
and canonical loadouts. Prior isolated version1 snapshots explicitly fail and
must restart; there are no persisted live-study accounts to migrate or saved
rewards to discard. Production encounter restart/receipt handling is still
unimplemented and must preserve actual saved rewards.

### Validation and next gates

```
npx vitest run src\game\radiant-combat.test.ts src\game\radiant-gauge.test.ts src\game\squad.test.ts src\game\saved-loadouts.test.ts src\presentation\compact-portrait.test.ts src\presentation\image-format.test.ts --maxWorkers=2 --testTimeout=60000
npx tsc --noEmit
npx tsc --project supabase\functions\game-operation\tsconfig.json
npm run build
```

508 tests across six files pass, including all96 actual Flare executions,
all32 executed passives,96 Master compatibility/stat mappings and29
non-starter passive-Master interaction cases. Client/authority typechecks pass;
build passes with the existing chunk warning. Initial interrupted draft issues
(readiness assertion, Equinox-only Masters, unwired native passive descriptions)
were corrected before publication.

These are deterministic mechanics/compatibility checks, **not pressured clear
rates or a proof of a calibrated96-Master power ladder**. Next implement the
ordinary-Conduit conversion/upgrade matrix and full loadout adapter, run actual
1/3/6-member progression pressure checks, then coherent account/authority/
captured-ineligible migration and presentation. No VFX/hosted overhaul release,
new face intake or final commissioned-art list is claimed by this stage.

## Current implemented starter study and portrait intake (2026-11-08)

This is the **operative implementation status**. The numbered initial draft
under [Historical initial numerical draft](#historical-initial-numerical-draft)
is retained solely as decision history, not a second rules authority. The
owner delegates design/calibration; no further generic approval gate applies.
Publication still requires the complete coherent migration and measured
enemy/gear/roster coverage, not just passing starter tests.

### Isolated combat study

[Starter definitions](../../src/content/radiant-combat.ts) and
[pure combat engine](../../src/game/radiant-combat.ts) are now implemented on
`overhaul/radiant-foundation`, **not connected to the live account or authority**.
They support up to six frozen starter-study instances, not a claim of six
distinct released kits, an ordinary acquired six-member team or measured balance.
Released roster IDs/ownership will be connected during the full conversion.

- Four stats: HP, Attack, Defense, Recovery. Fractional stat growth is preserved.
  Damage uses deterministic diminishing Defense mitigation; no random critical.
- Normal Attack, Defense, passive, frozen first-member leader and progressively
  stronger signature. Leader death stops the first leader's effect, without
  promoting another member. No forced Flare recovery.
- Native Shields stack with source ownership until genuinely absorbed/broken;
  no percentage-of-HP cap or expiry extension. Healing and absorption events
  retain actual effective amounts and source snapshots.
- Existing layered-charge module supplies personal and shared spending/grants;
  charge RNG is separate. No third personal layer, empowerment mode or timer.
- Each enemy has a persistable fixed currency budget and lowest-health ledger.
  Exact integer proportional depletion pays only new lowest-health progress;
  defeat pays the remainder. Overkill or enemy healing cannot mint a second
  budget. Returned events/state are atomic pure results, **not a persisted
  transaction**. Authority receipt validation, retry/quit persistence and real
  farming measurements remain required.

Implemented starter table (study values, subject to pressured calibration):

| Bearer | Base HP / Attack / Defense / Recovery | Base cost C | Leader |
| --- | --- | --- | --- |
| Infernis |240 /60 /16 /28 |30 |Hearthbound Oath: Attack +15% while first member lives. |
| Tizu |300 /44 /22 /34 |25 |Harbor Covenant: Defense +20% while first member lives. |
| Flora |220 /46 /14 /65 |20 |Garden Covenant: Recovery +15% while first member lives. |

Infernis's Cinderwake family is offensive Burn; Tizu's Tideglass family protects
the same squad at every tier; Flora's Dawnseed family heals/renews the same squad
at every tier. Signature names follow a recognizable advancement family:

| Bearer | Glowing | Lustrous | Eternal Radiant |
| --- | --- | --- | --- |
| Infernis |Cinderwake |Cinderwake Ascendant |Cinderwake Everlasting |
| Tizu |Tideglass Shelter |Tideglass Dominion |Tideglass Eternity |
| Flora |Dawnseed Renewal |Dawnseed Flourishing |Dawnseed Perennial |

Personal cap C at forms1-3;2C at forms4-6. Glowing spends C; Lustrous spends2C.
Eternal needs saved form6, full2C and the shared meter and spends both; others
keep their personal charge. Shared threshold starts100 points and increases
25 per Eternal cast up to200; the exact60-unit representation normalizes1-6
members. These cadence values are study implementation, not calibrated live
enemy targets.

Nine existing starter Master IDs map to fixed matching-bearer attunements and
personal enhancements. Equinox is neutral without a Master. Corona: Attack
+25%/HP -10%; Aegis: Defense +35%/Attack -10%; Solstice: HP +25%/Attack -10%;
Prism: Recovery +30%/Defense -10%. This is not a second random innate subtype.
`master-tide-2` adds8% recipient maxHP to its native Shield instead of the
obsolete duration-extension proposal. All other Masters/ordinary gear are
still pending conversion; existing owned IDs/ranks must be preserved.

### Reviewed portrait pilot

[Offline exporter](../../tools/build_compact_portraits.py) now derives18
starter face/upper-body crops, six forms each, from the unchanged canonical
transparent artwork. Every form has its own source-bound eye anchor and square
crop,512px output and45% nominal eye line. No generic runtime center-crop,
key cleanup, mirroring or invented facial detail.

[Settings](../../Art/provenance/compact-portrait-settings.json) bind each anchor
to exact source SHA256; changed sources fail until re-reviewed. Generated
intake records source/output hashes, dimensions and exact rectangles; generated
revisions feed [shared compact helper](../../src/presentation/compact-portrait.ts)
through existing deployment-base AVIF/PNG fallback. Facing is applied once.
Explicit unreached silhouettes remain available. Missing crop/hidden Sunshade
forms resolve to a named neutral pending panel, never guessed asset URLs.

All18 crops were inspected at48/96/512px against dark/light backgrounds.
Small late-form source faces can be softer at512px; this preserves actual source
resolution, not new detail generation. The other174 released-form crops and
production compact-context wiring remain pending. Full-art Team/field/Home
assets are unchanged; this pilot does not roll out a rejected menu mock-up.

Validation:
```
python -W error::ResourceWarning -m unittest discover -s tools -p test_compact_portraits.py
python tools\build_compact_portraits.py --check
node tools\build_avif.mjs
npx vitest run src\presentation\compact-portrait.test.ts src\presentation\portrait.test.ts src\presentation\image-format.test.ts src\game\radiant-combat.test.ts src\game\radiant-gauge.test.ts --maxWorkers=2 --testTimeout=60000
npm run build
```
Five Python tests and132 focused Vitest tests pass. Build/typecheck passes with
the existing chunk-size warning. The first image-format run correctly rejected
18 unencoded crops; generating matching AVIF siblings fixed it. No VFX motion,
full-roster/gear power ladder, pressured enemy clear rate or hosted release is
claimed by these results.

## Delegated implementation and first foundation (2026-11-08)

Owner delegates remaining design decisions **and implementation**, with
validated staged releases and one final consolidated art request. This
supersedes the old requirement to await specification approval before coding.
It does not authorize shipping an incoherent partially converted combat engine.

First implementation is isolated on the overhaul branch:
- Shared six-member limit across account/equipped-squad/loadout validation,
  server request/response validation, battle roster construction and current
  squad/Home/Team/Profile lists; old1-3-member accounts remain valid.
- Pure staged layered-charge module with form-based personal layers, highest
  ready tier, retained partial charge, one shared Eternal spend, exact1-6-member
  normalized grants and bounded attacker bonus rolls. Not wired into the
  current battle engine, not a live Flare rewrite.
- Matching authority bundle regenerated. No authority deployment yet.

Validation:244 targeted existing-path tests;21 charge-foundation tests;
full tracked production suite257 files/8401 tests; client and authority
TypeScript checks; production build. Build retains its existing chunk warning.
No new VFX/portrait visual-performance claim from these tests.

[Single consolidated art brief](../../Art/ui/Radiant%20Combat%20Overhaul.md)
separates192 available released-form crop candidates, reused art, optional
scenery and unresolved future kit art. It is provisional until the complete
roster/status conversion fixes the final intake list; no mandatory new images
are currently established by the inspected foundation. Do not label that as
the final completed overhaul art inventory.

Remaining implementation: four-stat/native/gear/Master conversion; captured
ineligibility/manual-selection compatibility; actual damage-payout ledger;
face crop exports/wiring; six-member cinematic Home/Battle UI; shader Flare VFX;
all-activity pressured enemy calibration and coherent hosted rollout.
Captured playability intentionally remains in the old engine until its
reviewed compatibility path lands; no false claim that bearer-only squads ship.

## Global Conduit direction and rarity progression (2026-11-08)

Owner requires the catalog **as a whole** to change/amplify the breadth of
battle and team composition, with creative but understandable effects.
**Ordinary Conduits remain upgradeable; personal Masters remain fixed**,
confirmed separately. Higher-tier ordinary Conduits should provide stronger
or broader useful effects than lower tiers, not merely more complicated text.
No new catalog counts, upgrade costs/caps or acquisition rates selected here.

### Proposed coverage matrix for the complete catalog review

| Domain | Simple effect direction / illustrative name, not approved item |
| --- | --- |
| Normal offense |Prismedge Relay: strengthen Normal damage or a clear Defense-piercing opportunity. |
| Flare offense |Corona Lens: amplify one named Flare tier or a readable full-charge payoff. |
| Durability |Halo Bulwark: improve Defense or reduce a specified first incoming hit. |
| Defense action |Vesper Brace: convert deliberate guarding into a modest Shield or charge grant. |
| Healing |Dawnwell Manifold: improve Recovery or the effective healing of one clear action type. |
| Shields |Facet Reservoir: improve generated Shields or reward genuine absorption, never count generation as absorption. |
| Personal charge |Lustre Capacitor: improve a defined guaranteed gain or retain a bounded amount on cast. |
| Shared Eternal charge |Concord Dynamo: one bounded shared-fill contribution from a clear manual-action trigger. |
| Status application |Cinder Aperture: strengthen authored Burn without inventing missing Burn on every bearer. |
| Status resilience |Argent Filter: shorten or remove a precisely named harmful effect under an explicit condition. |
| Squad cooperation |Aureole Link: reward two different bearers acting on one target, at most once per round. |
| Formation/leadership |Meridian Standard: enhance a defined leader contribution or first-member action, without granting another leader. |
| Focus/area utility |Refraction Array: choose stronger single-target output or a bounded area follow-up, not unlimited hit-count procs. |
| Sustain |Afterglow Engine: recover after an actual qualifying event with a clear per-round limit. |

These are effect families and vocabulary examples, not additional approved
Conduits, exact mechanics or a commitment to rename installed artwork.
Across the catalog cover all selected combat domains; each individual item
does **not** need to affect every system. Economy drops, new elements, revival,
extra turns and bypassing eligibility are not automatically included.

### Simplicity budget

One primary job per ordinary Conduit. Prefer an unconditional stat bonus or
one obvious trigger plus one payoff; higher tiers may add one closely related
secondary effect. Keep short descriptions to two meaningful clauses where
possible. Name actual target, amount and clock; put shared stacking/source
definitions in the glossary instead of repeating implementation commentary.
No item needs a bespoke hidden counter unless a visible simple mechanic
genuinely cannot express its purpose.

Test combinations, not only individual tooltips: six wearers' shared-charge/
healing auras, shield absorption grants, multi-hit/AoE and generated follow-ups
must not recursively feed their own triggers. Effects declare whether they
modify stats, actual action magnitude, guaranteed charge or a separate packet.
Maintain current eligibility/ownership/slot restrictions unless explicitly
changed in the reviewed conversion table.

### Rarity and upgrade review policy

Use the actual acquisition catalog's Common/Rare/Legendary/Omnic/Calamitic
tiers; do not invent an Epic ordinary tier from the character rarity ladder.

- Common: reliable accessible fundamentals, still useful before higher gear.
- Rare: stronger fundamentals or a simple action-linked benefit.
- Legendary: substantial specialization or a clear two-part synergy.
- Omnic: powerful eligible elemental/build-defining benefits.
- Calamitic: strongest specialized endgame scope, calibrated separately from
  ordinary progression rather than assumed early-account access.
- Personal Master: fixed matching-bearer attunement plus one unique personal
  enhancement, not another upgradeable ordinary rarity step.

Higher rarity must demonstrate greater benefit in **comparable purpose and
eligibility**, not beat every unrelated item in every situation. A max-upgraded
lower item versus a base higher item requires an explicit benchmark rather than
an assumed universal ordering. Keep costs/access honest. Upgrade growth should
strengthen the existing identity; propose magnitude increases before proc odds,
duration, trigger count or resource-loop changes. Penalties/conditions do not
silently disappear. List exact per-rank values and retain owned upgrade ranks
under the approved migration.

Before release, provide a full stable-ID conversion matrix with domain, rarity,
eligibility, effect/clock/source, per-rank values and six-member stacking behavior.
Measure same-purpose rarity progression, early acquisition usefulness,
overcharge/charge economy, pressured survival and exploit-loop bounds.
No claim of completed catalog redesign or validated power ladder in this section.

## Expanded scope: six-bearer progression and integrated UI (2026-11-08)

Latest owner revision **supersedes all three/five-member maximums**:

- Allow **1-6 owned distinct Element-Bearers** in every activity; size is not
  an entry requirement. No free team or captured combat members.
- Progressive difficulty should increasingly demand more bearers and better
  Conduits. Calamity-tier encounters are calibrated for optimized six-member
  squads, not against a solo starter or an assumed average six-member account.
- Audit/rebalance **all activities' enemy stats/mechanics at existing authored
  levels/gates**. Escalating/exponential difficulty is a design goal, not an
  approved arbitrary new multiplier. Propose level/gate changes separately.
- Rework all ordinary Conduits, all Masters and squad/equipment loadouts to
  match four stats, six members, shared charge and attunements. Each equipped
  bearer's investment and actual tactical contribution must matter.
- Owner rejects the previous alternate menu mock-up/design. Retire it as an
  active design authority; do not copy its composition or resume its rollout.
  Retain local files/history rather than interpreting "scrap planning" as
  permission for broad deletion. Replace only UI needed for this overhaul.
- Home presents the **actual complete equipped squad's full-body evolution
  art** in a cinematic formation. Compact shared face portraits serve controls;
  no demo team, auto-grants or unwanted bottom navigation bar.
- Battle's compact portrait strip can slightly overlap art frames, but focus
  outlines, controls, names, HP/Gauge and status information must not overlap
  or become occluded. Adapt layout to six members and small viewports.
- Loadouts mean the existing squad/equipment setup reworked for these systems.
  Following clarification, **no separate named-preset feature is selected**.
  The intermediate preset form choice is not sufficient approval after the
  owner rejected/queried that feature.

### Required coherent surfaces

Squad save/validation, all battle formations/target selection, action and
reward events, Team/equipment/Collections references, Home composition, compact
portrait controls, authority requests, legacy accounts, frozen snapshots and
Continue/Retry must share the same1-6 eligibility. No old three-slot path may
truncate members. Leader is first; each instance acts once per round.
Ordinary eight-slot and one matching Master remain unless separately revised.

Shared charge normalization must cover starting counts1-6. The earlier
sixth-point proposal only represented divisors1/2/3: propose **sixtieth-point
units** (divisible by1/2/3/4/5/6) or another exact rational representation.
Benchmark whether equal normalized round charge across squad sizes remains
appropriate when larger formations have more actions, healing and buff coverage.
No formula is approved solely by extending a divisor.

Difficulty calibration must model **access and ownership** alongside mechanics:
one starter is free; bigger tested squads require acquired bearers. Track
ordinary progression distributions, obtainable gear, expected team size and
time-to-build. Do not use an optimized six-unit paper ceiling as the target for
ordinary early/midgame enemies. Exponential curves need inspected level anchors,
packet survival, encounter duration and resistance/burst limits; not just DPR.
Preserve saved unlocks/rewards and published gates during this calibration.

### Updated review/implementation sequence

1. Consolidate the specification: remove superseded mode/timer, single-tier,
   Shield-cap and old squad-size clauses from operative formulas.
2. Present exact starter kits/subtypes/Masters and representative1/3/6-member
   pressured benchmark plans for owner approval.
3. Implement isolated non-account combat study with six-member-capable shared
   rules, portrait controls and measured charge/VFX.
4. Review full released roster/all gear effects plus all-activity enemy
   calibration. Include separate Calamity expectations and real ownership gates.
5. Implement approved coherent client/authority/squad/equipment migration and
   necessary Home/Team/Battle surfaces. No unrelated global menu redesign.
6. Validate old1-3-member accounts, six-member save/reload/gear restrictions,
   captured-ineligible manual selection, frozen run transition and atomic
   payouts; deploy matching client/authority and verify hosted behavior.

Nothing in this expanded planning section claims implemented six-member
combat, completed portrait exports, new loadout saves or measured enemy curves.

## Owner-selected shared evolution portraits (2026-11-08)

Battle portrait controls use a dedicated **face/upper-body portrait derived
from each existing evolution artwork**, not a full-body image squeezed into a
small tile. Every form has its own individually reviewed framing. The same
derived portrait and framing are reused wherever a compact character portrait
is needed across the game; no independently improvised per-screen crops.
Team/details/showcases and battle-field units can retain full artwork.

### Proposed asset and presentation contract

- Use canonical bearer ID plus saved six-form evolution index. Calamitic
  displayed Evo.2-7 maps to existing saved forms, not invented source images.
- Reuse [character form resolution](../../src/content/character-art.ts) and
  [portrait/asset helpers](../../src/presentation/portrait.ts); distinguish an
  explicit compact-face variant from the existing full-art helper.
- Proposed reproducible512px square derived exports with reviewed normalized
  crop rectangles/face anchors and a common eye-line/face-size target. Exact
  dimensions are an implementation choice subject to small-screen review.
- Anchor on face/hair/head ornament and enough shoulder context to recognize
  the form; do not use one center-crop or percentage zoom for all sprites.
  Especially inspect small late-form bodies surrounded by large powers.
- Preserve source/export originals, transparency, colors and actual facial
  detail. Derived cropping never overwrites full-art assets, recolors portraits,
  invents missing faces or claims to reconstruct source-clipped detail.
- Record source hashes, crop/anchor settings and output hashes in provenance;
  reproduce through a scoped offline exporter. No runtime background keying.
- Crop coordinates belong to unmirrored source artwork. Define facing in the
  shared compact variant once; never apply a screen-specific second mirror.
  Animate the wrapper, not the image's facing transform.
- Keep consistent frame geometry, face scale and alignment across forms while
  preserving authored differences. Do not distort/widen faces to force uniformity.
  Shared battle UI rim/glow/status layers sit outside the cropped asset.
- Shared deployment-base URLs, format fallback and byte-derived revisions
  cover every consumer. No guessed/missing PNG path for undelivered forms.
- Discovery/ownership silhouettes and unreleased content gates remain intact.
  Compact exports must not reveal a locked form or hidden Sunshade identity.
- Names/alt text retain canonical evolved identity; redundant portrait buttons
  have a useful accessible character/action label. Gauges/statuses remain HTML.
- Ascension and Master attunement do not select a different face unless existing
  artwork explicitly provides one; these states are UI metadata, not new art.

### Coverage and review

Inventory all released bearer forms (currently32 *6 =192) before export;
verify actual source availability individually. Unreleased forms are excluded
from player-facing coverage. Only portrait contexts receive the compact
variant; no automatic replacement of full-body roster art, arenas or cut-ins.

Review side-by-side contact sheets at native/96px/48px sizes on dark/light
backgrounds, including every form transition, frontal/directional poses and
late ornaments. Test one canonical compact URL/framing per ID/form across
consumers, full-art unchanged, silhouette/accessibility gates, base-path/cache
revisions and evolution refresh without stale portraits.
This records the requirement, not192 completed exports or visual approvals.

## Owner revision: layered charge and shared Eternal readiness (2026-11-08)

**This section supersedes conflicting draft rules below**, especially
single-current-tier availability, temporary Ascendancy, third personal layer,
four-round timeout, personal reset on activation and finite/capped Shields.
The consolidated lower sections must be rewritten before implementation; no
old contradictory formula should become production behavior.

### Confirmed charge architecture

- Glowing Flare uses the first personal layer in the bearer's elemental color.
- Equivalent saved form4 unlocks Lustrous Flare and a second personal layer,
  visibly white-and-elemental, building over the first. Glowing remains castable
  while the second layer is incomplete.
- Each bearer has base personal cost `C`. Glowing is ready at `C`, Lustrous at
  `2C`. Maximum personal storage is `C` before form4 and `2C` afterward.
- **There is no third personal bar or3C threshold.** Eternal's third bar is the
  shared team **Overcharge Radiant Flare meter** (owner wording; final display
  terminology can be reviewed).
- The team meter starts building and appears only when the equipped frozen
  squad contains at least one final-form bearer. Ordinary final gate is Evo.6;
  Calamitic uses equivalent saved final form, despite displayed Evo.7.
- Only final-form bearers can cast **Eternal Radiant Flare**. It is ready when
  that bearer has both personal layers full AND the shared team meter is full.
- Automatically offer the **highest ready tier**; no manual lower-tier selector
  once a higher eligible tier is ready. Evo.4-5 cannot cast Eternal, even with
  a full team meter.
- Glowing spends `C`; Lustrous and Eternal spend `2C`. Keep unspent personal
  charge. At `1.5C`, Glowing leaves `0.5C`; full Lustrous/Eternal empties the two
  personal layers. Generic cast refunds remain separately specified.
- One Eternal cast consumes the shared meter atomically for the squad.
  Other members keep all their unspent personal charge and immediately lose
  Eternal readiness until the shared bar refills. Each must still have full
  personal layers when attempting the next Eternal cast.
- No separate activation, empty/refill mode, four-round expiry, timed empowered
  state or forced next-turn recovery. A full shared meter waits until used.
  Later-use shared fill escalation was selected earlier; exact threshold/cap
  remains a proposed reviewed formula, not an additional activation system.

The bearer/squad eligibility uses the frozen run loadout, not menu equipment
read mid-battle. Starting a run without final-form members creates no hidden
charge accumulation for future use. Settings/Continue preserve legal charge;
new entry/Retry reset follows the reviewed run policy.

**Readiness table** (`P` personal points, `S` shared readiness):

| Bearer form | Condition | Offered Flare |
| --- | --- | --- |
|1-3 |`P < C` |None |
|1-3 |`P >= C` |Glowing |
|4-5 |`C <= P < 2C` |Glowing |
|4-5 |`P >= 2C` |Lustrous |
|6 |`C <= P < 2C` |Glowing |
|6 |`P >= 2C`, shared not full |Lustrous |
|6 |`P >= 2C`, shared full |Eternal Radiant |

All forms remain below Glowing readiness at `P<C`. Personal overflow caps at
the unlocked maximum. Shared fullness cannot bypass a partially filled personal
bar. Authority validates/spends both ledgers in one action; stale client
readiness cannot authorize a second Eternal from the consumed team meter.

### Abilities and presentation

The tiers are direct enhancements of one signature, preserving its core
purpose. New targeting or utility must support that progression rather than
act as three unrelated skills. Old abilities can be entirely replaced or
folded into new passive/leader effects per character: do not force preservation
of Skill1/Skill2/Last Flare designs where a new kit works better.
Owned progression is not silently deleted; exact Imbue conversion remains a
reviewed mapping, not the earlier suggested automatic old-skill-to-tier match.

Expose tier/category names, exact current effect and cost. Render the two
personal layers in the same portrait Gauge footprint with unambiguous numbers
and accessible tier readiness. Team bar appears below the squad only when
eligible. White/elemental overcharge is a presentation cue, not another element.
Finite readiness glints/static Reduce motion states distinguish Glowing,
Lustrous and Eternal without hiding portraits or depending on color alone.
Actual spend/gains remain ordered at impact; no cosmetic-hit resource grants.

### Other confirmed changes

- **Keep current unlimited Shield stacking until broken**, balancing new
  offers. The draft50%-HP total cap and forced finite native refresh are rejected.
  Do not silently change owner/layer provenance, absorb order or authored expiry.
- **Remove random critical damage** and explicitly map related gear to
  deterministic effects in the four-core-stat model.
- Owner delegates per-character old-skill replacement/folding into passive,
  leader or Flare; this is not a mandate to preserve every previous skill.

### Numeric draft corrections required

Replace starter60/70/80-style separate tier costs with one base `C` per bearer.
Proposed review candidates: Infernis `C=30`, Tizu `C=25`, Flora `C=20`, giving
Lustrous/Eternal personal thresholds60/50/40 respectively. These numbers are
**proposals**, not owner-approved tuning. The earlier charge gains would fill
these rapidly; benchmark guaranteed/bonus cadence and revise coherently.

Rewrite Tizu's Flare Shield offers without the rejected cap. Align Infernis
and Flora tier targeting/effects as direct upgrades, then review output at
their new repeat cadence. The earlier exact starter tables are not approved
just because the resource architecture is now settled.

Required tests: readiness for each form/threshold; partial-overcharge spend;
shared gating with no eligible bearer, one/two eligible bearers and a full
meter; first Eternal disabling only shared readiness of others; two consecutive
attempts under stale revisions; no personal charge theft from other members;
buff/Shield/crit remaps; exact visual layers at charge/impact/Skip/Reduce motion.

## Historical initial numerical draft

**Everything below this heading is archived initial proposal material, not
operative rules or an implementation checklist.** Retained for traceable
decision history. In particular its single-tier cast gates, three-member
normalization, temporary Ascendancy/refill/four-round timer, finite Shield cap,
expiry-related Master proposal and additional pre-coding approval requirement
are obsolete. Do not implement or test those as current requirements.

Use the current implemented study at the top, the latest owner-selected
personal/shared architecture and the full-conversion release gates instead.
No paper draft, source inspection or starter test establishes real encounter
balance, account eligibility, farming safety or complete-roster coverage.

## 1. Player-facing vocabulary

| Plain function | Proposed system wording | Usage |
| --- | --- | --- |
| Passive Ability | Radiant Signature | Both plain label and personal ability name remain visible. |
| Leader Ability | Luminary Covenant | One first-member benefit; not every member's passive. |
| Personal charge | Lustre Gauge | Exact current/required values, normalized visual fill. |
| Shared charge | Concord Gauge | One bar beneath the squad portraits. |
| Temporary final-Flare preparation | Radiant Ascendancy | Explicitly temporary; separate from permanent Stat Ascension. |
| Equipped Master profile | Attunement | Equinox, Corona, Aegis, Solstice or Prism. |
| Visual charge packets | Lustre Motes | Represents accepted mechanical charge; not collectibles to click. |
| First Flare category | Glowing Flare | Owner-selected. |
| Second Flare category | Lustrous Flare | Owner-selected. |
| Final Flare category | Eternal Radiant Flare | Owner-selected. |

Plain words HP, Attack, Defense, Recovery, Shield, Burn and Weaken stay literal.
All exact ability names below are original proposals. Tier names identify
categories; character-specific names share a progression family.
No new light combat element, random Type, paid reroll, battle item or affinity
damage advantage. Existing six elements and artwork retain their identities.

## 2. Four-stat model

### Definitions and proposed growth

Let `L` be saved level, `e` the saved six-form evolution index and
`G = 1 + 0.15L + 1.5(e - 1)`. Preserve the current linear growth foundation.
Calamitic displayed Evo.2-7 uses the same internal1-6 index.

| Stat | Meaning | Proposed unequipped growth |
| --- | --- | --- |
| HP | Maximum Health; no resurrection through stat changes | `baseHP * G` |
| Attack | Source magnitude for direct offensive attacks and authored Burn | `baseAttack * G` |
| Defense | Diminishing direct-hit mitigation and defensive ability scaling | `baseDefense * G^0.7` |
| Recovery | Source magnitude of authored healing delivered | `baseRecovery * G` |

Recovery is a **source stat**, not a multiplier on healing received. A skill
heals its coefficient times the caster's Recovery; cap at each living target's
missing HP. It does not create automatic regeneration or healing from pickups.
Fixed fractional maxHP heals in enemy mechanics retain their authored formula
until individually reviewed. Enemy self-healing does not require a new generic
Recovery curve simply because player stats change.

Proposed starter base values:

| Bearer | HP | Attack | Defense | Recovery |
| --- | --- | --- | --- | --- |
| Infernis |240 |60 |16 |28 |
| Tizu |300 |44 |22 |34 |
| Flora |220 |46 |14 |65 |

These are **new authored proposals**, not claims that old effective stats equal
these numbers. Old Attacker/Tank/Support stat bonuses and automatic role healing/
target weighting are removed from the proposed model. Defense/Recovery specials
come from explicit passive/leader/Flare contracts. Old native self-stat bonuses
are individually mapped, not inherited unnoticed.

At Lv.30/form1, `G=5.5`: Infernis HP1320/Attack330/Recovery154,
Tizu HP1650/Attack242/Recovery187, Flora HP1210/Attack253/Recovery357.5.
Defense remains fractional using `G^0.7`. This example is arithmetic, not proof
of surviving the current Lv.30 infusion encounters.

### Stat ordering and rounding

For each stat, define grown base `B`, owned compatible ordinary flat additions
`F`, additive ordinary percentage pool `O`, selected subtype multiplier `T`
and permanent stat-Ascension multiplier `A` (1 or1.5):

`permanentStat = (B + F) * (1 + O) * T * A`.

Existing weapon ranks retain their documented Attack-only contribution and
disabled spending. Place `0.02 * weaponRank` in the ordinary Attack percentage
pool; do not lose saved ranks or introduce weapon purchases.

Battle-only unconditional leader percentages and one strongest temporary stat
buff per stat apply to the permanent value in a **single additive battle pool**.
Debuffs use their separately bounded reduction. Conditional gear modifiers must
declare whether they affect stats, action output, mitigation or target
vulnerability; never ambiguously scale both the Attack stat and its packet.
No implicit multiplicative chain between multiple wearers' ordinary stat auras.

Maintain fractional stats throughout. Round once at actual damage/healing/
Shield grant boundaries; UI formatting never feeds calculations.
Reject invalid/overflow/nonfinite values explicitly. Subtype penalties do not
allow negative stats; proposed subtype multipliers below are strictly positive.

### Direct damage and defensive action

Preserve diminishing mitigation:

`damage = round(coefficient * A * A / (A + effectiveDefense) * outputModifiers)`.

`A` is the relevant source Attack, not coefficient-scaled Attack inside the
ratio. Defense ignore reduces effectiveDefense before the ratio, with a
proposed total pierce cap75%. Positive real direct impacts retain floor1.
Burn bypasses Defense but respects explicitly authored periodic mitigation;
shields/guard and damage-origin behavior must remain specified per packet.

Proposed Normal Attack is one mechanical direct hit at100% Attack. Animation
may depict extra trails but does not create additional impacts/charge rolls.
Defense consumes the bearer's ordinary action and reduces its incoming direct
damage by50% through the ensuing enemy phase. It gives no free extra action.
It does not reduce Burn or redirected loss unless explicitly stated.
Existing critical behavior is not silently inherited: see section10's review
gate for mapping old critical investments into four-stat-compatible effects.
Pilot baseline direct attacks have **no random critical multiplier** pending
that mapping; random bonus charge remains independent.

## 3. Master attunements

No equipped Master = **Equinox**. One compatible owned Master declares exactly
one profile plus one personal ability enhancement. No additional generic Master
stat package, aura, second profile, implicit role bonus or consumable.

| Attunement | Proposed permanent multipliers |
| --- | --- |
| Equinox |HP1 /Attack1 /Defense1 /Recovery1 |
| Corona |Attack1.25 /HP0.90; other stats1 |
| Aegis |Defense1.35 /Attack0.90; other stats1 |
| Solstice |HP1.25 /Attack0.90; other stats1 |
| Prism |Recovery1.30 /Defense0.90; other stats1 |

Numbers are review candidates; do not treat different stats as equal economic
value. Equinox is a functional baseline, not deliberately crippled to sell gear.
No Master is necessary for solo starter healing, survivability or basic offense.
Not every bearer needs every profile among its existing three Masters.

Use **"Attunes Tizu to Aegis. +35% Defense; -10% Attack."**, followed by the exact
personal enhancement. Subtype changes affect statistics, not element, rarity,
owned character identity or permanent evolution.

Switching/removing gear recomputes from base, never from modified stats. Save
once before selection feedback. Frozen encounter loadouts retain the subtype,
Master and selected enhancement throughout Settings/Continue, including after
a menu gear change. Owned unequipped Masters contribute nothing.

## 4. Personal charge and ordinary Flare rules

Personal charge uses points, not a growing hidden stat. Each bearer has a
documented required charge for its current Flare. Form progression can change
the requirement; the display shows exact current/required values.

### Guaranteed charge

| Accepted event | Personal charge |
| --- | --- |
| Normal Attack causing positive Health loss or Shield absorption |20 to actor, once per action |
| Defense |10 to actor |
| Round completion |5 to each living bearer after the enemy phase |
| Enemy direct attack causing Health loss or Shield absorption |8 to recipient, once per enemy action, not per packet |
| Ordinary Flare use |No generic personal refund; specific reviewed effects only |

Support Flare users receive round/defensive charge without having to fabricate
damage. Passive/Master/ordinary-gear grants declare their own bounded trigger.
No grant from clicking, animation contacts, overkill, corpse targets or
replayed events. Round grants occur only after a completed enemy phase, not
after ending a modal or revisiting Settings.

### Random bonus motes

For a qualifying manually initiated offensive action, roll independently for
each **actual direct hit** with positive Health loss/Shield absorption:
25% chance of +5 personal points to the attacker, with at most **two rolls and
two successful bonuses per action**. Total generic random bonus is at most10.
Normal has one eligible hit. For AoE, consider targets in stable field order
and only the first two qualifying target impacts. This deliberately caps AoE.

Burn, generated retaliation, detonation/follow-up packets and healed Health
alone do not roll. Such effects can still have explicit guaranteed charge
effects if a reviewed kit says so. One dedicated persisted bonus-charge seed
is separate from combat/reward/capture/encounter seeds. Full Gauge still consumes
the same eligible rolls; received charge caps honestly rather than changing
future RNG because of gear or current bar fullness.

When accepted as a full combat operation, all rolls, spend and gains advance
once with the action. Save failure advances none. No new server operation per
visual mote. Tests must verify exact count/order, not probability on five seeds.

### Spending and cast access

Ordinary forms1-5 cast their current Glowing/Lustrous Flare when the personal
bar is full. Consume the current required amount, then resolve authored effects.
No other selectable lower-tier Flare. No next-turn recovery and no cooldown
unless an exact later character specification requests a bounded exception.

For form6, **Eternal Radiant Flare requires temporary Radiant Ascendancy** as
well as full personal charge. Outside that mode, this draft gives final-form
bearers Normal Attack/Defense but no ordinary lower-tier Flare. This is the
strict reading of "only current tier" plus two-step final charge, and a major
progression-risk gate: it must be explicitly approved or revised before coding.
See section12; do not conceal a possible loss of support utility at evolution.

## 5. Shared Concord charge and final empowerment

Shared charge starts0 on new activity entry. Proposed first activation requires
100 points; activation `n` (zero-based previous activation count) requires
`100 + 25 * min(n, 4)`, capped200. Display actual points/threshold, not "100%"
when the real requirement has changed.

### Shared guaranteed contributions

Freeze squad normalization `N` to the encounter's starting bearer count1-3;
death cannot shrink the denominator for faster filling:

- Qualifying Normal Attack or Defense: `6/N` shared points per bearer action.
- Successful ordinary Glowing/Lustrous Flare: `12/N` shared points.
- Completed enemy phase:18 shared points if the encounter continues and at
  least one bearer lives.
- No generic additional shared gain from random bonus motes, extra hit count,
  Burn ticks, taking damage or generated effects.

Store exact sixth-point units for these increments (1/2/3-member divisors fit)
and format display separately. Reviewed named fill effects express exact shared
points; fractional effects need a defined representation before approval.
Do not use floating point equality for affordability.
Base all-Normal rounds earn24 shared points regardless of solo/duo/trio.
Four such rounds earn96; a fifth provides activation opportunity. Flare rounds
can reach readiness sooner. No claim that this timing is measured enjoyable.

### Activation state machine

1. In a legal player phase, shared charge is full and a living final-form
   bearer has not already acted. Choose **Prepare Eternal Radiant Flare** with
   button/keyboard support; gesture may be an additional shortcut.
2. One explicit confirmation warns that personal charge resets and the
   four-round deadline begins. No browser confirm or implicit gesture spend.
3. Consume the required shared points; cap prevents accumulated surplus.
   Increment activation count **even if the mode later expires**.
4. Set the chosen bearer's personal charge to0 and mark it empowered.
   Activation itself is a once-per-round strategic command, not its attack:
   that bearer can Normal Attack/Defense during the same round to refill.
5. Only **one empowered bearer squad-wide** at a time. Shared charge can
   continue accumulating, but cannot buy another mode until this one ends.
6. Cast its Eternal Radiant Flare when the personal bar is full, consuming
   that full bar and its ordinary action. Clear the mode after the cast.

If activated during round `r`, the valid casting rounds are `r,r+1,r+2,r+3`.
Expire after the enemy phase of `r+3`, not before the final player action.
Entering at the end of a turn is disallowed; UI states the final casting round.
No timer pauses because the bearer cannot act. Settings does not advance it.
Successful cast, empowered bearer defeat or window expiry ends the mode.
On expiry, **retain earned personal charge**, but it does not permit an
unempowered final Flare; no charge/shared-cost refund.

Proposed entry/reset policy: shared/personal charge and activation count carry
through Continue within the same activity run; timed empowerment ends at each
encounter boundary. No additional refill on Continue. Retry/new entry resets
all charge/counters; saved loot is untouched. Pending battle outcomes must not
grant a round fill after all enemies die. In-progress mode snapshots survive
Settings exactly. Final replay is a new run.

### Team viability issue to test

Solo final-form bearers can earn guaranteed personal points from Normal/
Defense/round completion inside the four-round window. Tizu's proposed passive
can help while protecting himself. But **all-final-form support squads lose
ordinary healing access outside empowerment** under this strict draft.
Run comparisons before accepting that cost of the single-current-tier model;
not solved by stronger particles, a shorter timer or silently retaining Skill2.

## 6. Common effects, clocks and stacking

- One ordinary action per living bearer per player round; no action from
  expired/defeated targets. No character automatically skips the next player
  round after casting.
- "For two enemy phases" counts the next two enemy phases after application,
  including the upcoming phase. "Next round start" means before choosing
  player actions, after expiry/defeat bookkeeping.
- Beneficial stat buffs of the same stat never add together. Keep a nondominated
  source ledger and apply only the strongest living/valid effect; a weaker
  longer buff may become active after the stronger one expires. Recasting the
  same source refreshes its clock but never weakens it. This avoids weak buffs
  erasing strong ones without losing genuine durations.
- Fixed leader effect exists only while that saved first bearer lives.
  No promoted leader. HP increases never heal; losing a maxHP effect clamps
  current HP to the lower maximum and does not revive or inflict a damage event.
- General direct damage reduction: strongest named reduction, plus separate
  Defense action reduction multiplicatively; proposed total reduction cap80%.
  Explicit invulnerability/lethal-protection exceptions need separate review.
- New native Shields: one layer per source bearer per target; refresh to
  `max(remaining, newOffer)`, not unlimited additive recasts. Finite source clocks.
  Different sources remain identifiable, consumed in earliest-expiry order
  then stable source-ID order. Propose a total shield cap of50% recipient maxHP.
  A capped-out refresh cannot delete an existing layer. This intentionally
  changes the old unbounded stacking contract and needs approval.
- Burn: one application per source bearer per enemy; refresh duration and keep
  stronger snapshot, no same-source additive stack. Independent sources remain.
  Triggered damage never counts as another player Attack Action.
- Weaken: strongest active reduction, no additive weakening; retain independent
  source/expiry provenance. Cleanse acts on actual debuffs, not display strings.
- Healing cannot revive. Shield generation is not healing, damage absorption
  or charge entitlement. No recursion from role effects: the hidden old generic
  Support heal/target-role weighting is removed.

## 7. Exact starter kit proposals

The following replaces, not appends to, current counters/skills. Targets/costs
and numbers are proposals; current authored art and stable bearer IDs remain.

### Infernis — offensive Burn and controlled ignition

**Radiant Signature — Banked Cinder**

When Infernis's Normal Attack deals direct Health damage to an enemy already
Burning from Infernis, deal an extra periodic-origin packet equal to10% of her
Attack. Once per Normal action; no charge rolls or new Burn application from
this packet. Shields alone do not satisfy the Health-damage condition.

**Luminary Covenant — Hearthbound Oath**

While Infernis is the living leader, all living squad members gain15% Attack.
Works on Infernis alone. No additional crit, elemental advantage or Burn aura.

| Category / exact proposed name | Personal cost | Effect |
| --- | --- | --- |
| Glowing Flare: Cinderwake |60 |Deal240% Attack to one enemy. Apply Burn dealing15% caster Attack after each of the next two enemy phases. |
| Lustrous Flare: Cinderwake Ascendant |70 |Deal260% Attack to all enemies. Apply20%-Attack Burn for two enemy phases to survivors. |
| Eternal Radiant Flare: Cinderwake Everlasting |80 while empowered |Before the direct strike, spend Infernis's existing Burn on each enemy for one periodic packet equal to its remaining scheduled damage. Then deal600% Attack to all enemies and apply25%-Attack Burn for three enemy phases to survivors. |

Detonation uses the existing Burn's snapshot and remaining phases; never adds
the freshly applied Burn. Direct and periodic packets have separate damage
events and real currency attribution, but only primary direct impacts roll
bonus motes. Dead enemies receive no new application.

### Tizu — barrier protection and safe counter-pressure

**Radiant Signature — Tideglass Return**

When Tizu's native Shield fully absorbs an enemy's direct attack against a
living ally, grant Tizu8 personal charge, once per enemy action and at most
once per enemy phase. A mixed shield-owner full block does not qualify; no
refund from merely granting or refreshing a Shield.

**Luminary Covenant — Harbor Covenant**

While Tizu is the living leader, all living squad members gain20% Defense.
No hidden role target weight; an explicit taunt would require its own kit clause.

| Category / exact proposed name | Personal cost | Effect |
| --- | --- | --- |
| Glowing Flare: Tideglass Shelter |50 |Shield each living ally for `1.8 * caster Defense + 12% recipient maxHP` through the next two enemy phases. |
| Lustrous Flare: Tideglass Dominion |60 |Shield each living ally for `2.4 * caster Defense + 16% recipient maxHP` through two enemy phases; reduce their incoming direct damage by20% during the next enemy phase. |
| Eternal Radiant Flare: Tideglass Eternity |70 while empowered |Shield each living ally for `3 * caster Defense + 22% recipient maxHP` through three enemy phases; reduce incoming direct damage by40% during the next two enemy phases. |

Tizu's signature has no fabricated offensive hit. Solo targeting includes self.
Shield cap and refresh rules still apply; no full-bar victory through repeated
uncapped shields. Incoming-hit grants and native block grants are separate
explicit events, even if both occur in the same enemy action.

### Flora — immediate recovery and visible delayed renewal

**Radiant Signature — Dawnseed**

After Flora's Normal Attack deals direct Health damage, plant one Seed on the
living ally with the largest missing-HP fraction (ties in saved squad order).
At the next player-round start, heal it for15% Flora's Recovery, using the
planting snapshot. One pending Seed per Flora per target; refresh never stacks.
Do not plant if all allies have full HP. Flora can receive her own Seed.

**Luminary Covenant — Garden Covenant**

While Flora is the living leader, all living squad members gain15% Recovery.
No automatic4%-HP role heal or unrelated Attack aura.

| Category / exact proposed name | Personal cost | Effect |
| --- | --- | --- |
| Glowing Flare: Dawnseed Renewal |40 |Heal each living ally for80% caster Recovery. Grant Renewal healing15% snapshot Recovery at each of the next two player-round starts. |
| Lustrous Flare: Dawnseed Flourishing |50 |Heal each living ally for110% caster Recovery. Grant Renewal healing20% snapshot Recovery at each of the next two player-round starts. |
| Eternal Radiant Flare: Dawnseed Perennial |60 while empowered |Heal each living ally for180% caster Recovery. Remove its strongest active Weaken effect, then grant Renewal healing30% snapshot Recovery at each of the next three player-round starts. |

Seed and Renewal are distinct sourced packets, not extra counters to collect.
Same-source Renewal refreshes duration and preserves the stronger remaining
snapshot; different casters never trigger each other's passives.
Full-HP casts remain legal but show expected effective healing0; there is no
fictional gain charge from wasted healing. No revive, Burn cleanse or hidden
Shield grant unless a reviewed Master explicitly supplies it.

### Proposed Ascension/Imbue consolidation

Permanent Stat Ascension retains its existing saved eligibility,25-Shard cost,
1.5 stat multiplier and Lv.115 cap.

Propose one new **Flare Imbue** with **three increments**, each25 Shards and each
adding10% of authored Flare numeric magnitude (maximum+30%, additive).
Existing saved Skill1/Skill2/Last Flare Imbue booleans each map to one increment,
preserving paid step count without creating free duplicate unlocks.
This does **not** preserve old numeric benefit; owner delegated effect redesign.
Keep historical flags readable/idempotently mappable, with a versioned save on
the next successful transaction only. Never spend shards during conversion.

The +10% per increment applies to authored damage/healing/Shield offers, not
durations, targets, costs, resource bonuses, mitigation percentages or source
conditions. It scales authored new Burn offers, not already-snapshotted Burn
detonation. A single increment applies across current Flare versions if somehow
valid progress changes; Imbue eligibility remains after Stat Ascension.
Proposed stable UI label is **Flare Imbue1/3**, not a new fourth Flare tier.

## 8. Nine starter Master remaps

Keep current IDs/names/art/ownership and matching-bearer one-slot restrictions.
Replace old stats/effects; no automatic chest reward or equip.
Each enhancement below works across the current Flare family unless stated.

| Stable ID / existing name | Attunement | One proposed personal enhancement |
| --- | --- | --- |
| `master-ember-1` Helios Pyre Cathedral |Corona |Infernis's Flare applies Burn for one additional enemy phase; new Burn application only. |
| `master-ember-2` Cinderstar Genesis Engine |Corona |Increase Infernis's Flare primary direct damage by15%; not Burn, detonation or generated damage. |
| `master-ember-3` Unbroken Sunforge Throne |Solstice |After Infernis's Flare, Shield herself for12% own maxHP through the next two enemy phases. |
| `master-tide-1` Abyssal Shelter Observatory |Aegis |Increase Tizu's Flare Shield offer by15% before rounding/caps. |
| `master-tide-2` Ocean Memory Worldpump |Solstice |Tizu's Flare Shields last one additional enemy phase; reductions do not gain duration. |
| `master-tide-3` Undertow Sovereign Harpoon |Corona |After Tizu's Flare, strike one selected living enemy for120% Attack as a generated packet; no bonus-charge roll. A valid selected enemy is required at confirmation. |
| `master-sprout-1` Worldseed Mercy Foundry |Prism |Increase Flora's Flare immediate healing by15%; not Seed or Renewal. |
| `master-sprout-2` Briar Constellation Loom |Corona |After Flora's Flare, strike one selected living enemy for100% Attack as a generated packet; no bonus-charge roll. |
| `master-sprout-3` Evergreen Continuance Crucible |Solstice |Flora's Flare Renewal lasts one additional player-round start; no additional Seed or revive. |

No four-role taxonomy is revived through these effects. A Tizu Corona build
trades weaker Normal damage protection stats for explicit offense; Flora
Corona trades HP for an offensive Master payoff without pretending to be a
primary attacker. Profile balance and overlap require tests, not naming alone.
Generated offensive effects can release remaining enemy currency based on real
HP loss, but do not grant generic action/shared charge or recursively proc.

Tooltip example:

> **Abyssal Shelter Observatory**
>
> Attunes Tizu to **Aegis**. +35% Defense; -10% Attack.
>
> **Tideglass Flares:** increase their Shield amount by15%. Existing Shield
> refresh rules and the total cap still apply.

Modifier order: authored offer plus separately listed flat additions, then
additive action magnitude increases (Master15% + Imbue increments), then
round/cap. Do not multiply Master15% by Imbue30% as an unexplained1.495 bonus.

## 9. Battle layout and motion specification

Reuse current arena/scenery and portrait-facing metadata; no new character art
or global menu mock-up rollout.

- Arena occupies the upper field. Beneath it: up to three character portraits,
  each with name, HP, current/required personal Gauge, Attunement and a compact
  status row. One Concord bar below the portraits.
- Selecting a portrait exposes Normal Attack, Defense and its current Flare
  as text controls. Show actual target/cost/readiness and empowerment deadline.
  Disabled actions provide an accessible reason, not just dim opacity.
- Empowerment is a separate strategic command with explicit confirmation.
  No swipe-only action; support keyboard, pointer and touch with44px targets.
- Status effects remain sourced/typed in state. Group repeated icons visually
  with exact counts/durations; full details accessible by tap/focus.
- Portrait frames change readiness by outline/status text plus animation, not
  color alone. Equinox is visibly a valid default.
- Accepted action presentation begins from the pre-action HP/Gauge ledger.
  Resolve actual gains/spend/impacts in order, not end-of-sequence snapping.
  Bar easing never changes action availability. Skip renders the exact final
  state; no repeated charge on reopen/Settings.

Proposed base maximum durations: Normal900ms, Glowing1800ms, Lustrous2400ms,
Eternal3200ms including any cut-in. Existing1x/2x/3x scales presentation only.
Do not add a cut-in outside that budget as a second uncounted delay.
Reduced motion uses a brief150-250ms readable transition/static result, no
flashes, traveling motes or forced camera shake.

| Bearer | Glowing | Lustrous | Eternal |
| --- | --- | --- | --- |
| Infernis |Curved emberblade trail and one sharp ignition |Layered flame crescents with structured radial impact |A greatsword-shaped solar furnace geometry; old Burn gathers inward, then a clearly timed outward crimson rupture |
| Tizu |Spear-drawn tidal rim, transparent protective field |Interlocking pressure arcs and refractive barrier ripples |An immense layered tideglass vault; two readable protective wavefronts, not a fake damage explosion |
| Flora |Seed filaments opening into healing petals |Branching botanical prism lattice and ordered renewal motes |A broad root-and-petal canopy, cascading recovery waves and a settled living constellation |

Shader candidates: thresholded bloom, bounded light rays, local UV distortion
and refraction. Share rendering lifecycle/materials before adding another
canvas/renderer. Keep text/HP/portraits above bloom and do not distort controls.
Fall back to precomposed gradients/trails without claiming missing GPU effects
ran. No full-screen strobe, lasting whiteout or animation-driven reward RNG.
Intensity grows through distinct geometry/composition, not only particle count.

Profile on a declared mid-range machine: target60fps; record actual frame-time
distribution, repeat-cast memory and quality settings. Set measured GPU/particle
budgets during implementation; do not promise a number based on this prose.

## 10. Full-roster and equipment conversion work

This starter table is not a complete114-Master or ordinary-Conduit mapping.
Publication requires every released bearer and owned compatible equipment entry
to have reviewed effects in the four-stat/single-Flare model.

| Old surface | Proposed mapping direction / required review |
| --- | --- |
| Health/Attack/Defense bonuses |Retain IDs/upgrades; review values against new base curves, additive pools and subtype multipliers. |
| Skill Power |Convert per effect to Recovery, explicit Flare damage or explicit Shield magnitude; never a hidden generic fifth stat. |
| Critical Rate/Multiplier |Replace gear effects with reviewed deterministic offensive bonuses; preserve historical identity where practical. Specify any retained critical event mechanic separately before implementation. |
| Skill Duration |Explicit bounded status-duration enhancement or another reviewed effect; no global unbounded stat. |
| Skill Efficiency |Exact personal charge requirement reduction, proposed floor60% of base cost; review refund loops. |
| Gauge Capacity |Remove capacity as growing core stat; convert to personal charge gain/storage effect explicitly. Fixed required-bar rules must remain coherent. |
| Gauge Gain |Reviewed charge grants/rate modifiers with explicit source eligibility, cap, integer representation and rounded boundaries. |
| Old personal counters |One passive/Flare hook; alternating-two-skill characters require a new legal Normal/Flare pattern, not impossible prerequisites. |
|114 Masters |Each selects one reviewed subtype plus one personal ability effect; hidden seasonal entries remain hidden. |
| Role stats/targeting/healing |Removed from new model; meaningful behavior belongs in explicit passive/leader/Flare entries. |
| Existing three Imbues |Proposed three paid increments of one Flare Imbue; see section7. |
| Captured teams/gear |Retain copies/locks/fodder; invalidate playable captured slots. No auto-replacement. Require manual valid bearer squad before entry. |

No live batch can leave unaffected gear referencing retired actions/stats.
Either keep a coherent old ruleset for the whole production run until full
conversion is ready, or implement an isolated non-account prototype. Do not
mix three new starters with old combat assumptions in an unversioned live engine.

Captured inventory/lock/sale/fodder and existing recipes stay unchanged. Remove
captured equipment controls and battle selection, not historical ownership.
Legacy invalid squads display an explicit selection-required status; read does
not write or auto-fill. The first confirmed valid squad/equipment transaction
normalizes illegal captured assignments, preserving owned unlocks/upgrades.
Server rejects captured combat entries even if an old client bypasses the UI.
Replaced old runs preserve frozen bearer investment metadata and saved rewards,
but cannot resume a now-ineligible captured formation; require explicit selection
for a new run. Never restart an all-captured run with an invented starter.

## 11. Economy, authority and acceptance tests

### Actual damage-based currency

Keep current per-enemy currency distributions and mode exceptions. Resolve
budget once on encounter initialization in the versioned authority. Track
lowest Health reached and already-paid amount. For budget `B`, starting maxHP
`H` and lowest actual Health `L`, earned total is
`floor(B * (H - L) / H)` with exact safe arithmetic.
New reward = earned total minus already paid; defeat releases remainder.

Healing, Shields, overkill, cosmetic hits and repeated depletion cannot mint
more than `B`. Authored maxHP transforms must preserve an explicit budget
baseline; no reset on phase transition. Periodic/generated HP loss counts
without charge-roll eligibility. Already-saved partial gains survive loss/quit.
Kill-only materials/premiums/captures/discovery/bonuses stay kill-only.
Remove already-paid currency from the kill receipt, not from existing balances.

Each accepted action commits state, charges/seeds, currency, discoveries/kill
rewards and receipt once through shared atomic foundations. No client pickup
transaction, reroll on duplicate request or claim before successful persistence.
Denied writes restore pre-action state and show the standard failure status.
Versioned source rolls occur earlier than today; describe that change honestly.

### Verification matrix before any release

1. Exact stat arithmetic, subtype switching/removal, Ascension/Imbue mapping,
   old weapon ranks and all conversion IDs.
2. Personal/shared charge:1/2/3-member normalization, stable hit order,
   full-bar RNG advancement, capped AoE, no periodic/generated recursion.
3. Empowerment: activation at every round boundary, fourth-round cast,
   fifth-round rejection, death, expiry, no refund, increasing cost, Continue/
   Retry/Settings, once-only strategic activation.
4. Shield owner/full-block/cap/refresh/expiry and strongest-wins buff fallback.
5. Recovery: actual effective heal, waste, Seed snapshot, Renewal refresh,
   delayed target death, no revive; solo Flora.
6. Currency budget exactness: healing/re-hit, phase change, simultaneous kills,
   Burn/generated hits, duplicate receipt, retry, denial/overflow; measured
   damage-and-quit income against clearing in each relevant mode.
7. Bearer-only boundary: captured leader/member/all-captured/gear legacy
   snapshots, manual repair, preserved copies/locks/sales/fodder and no grants.
8. Starter pressured runs at Lv.0/30/45/60/75/90/105/115, base and each Master,
   singleton and conditional owned trios. Late zero-Defense DPR is separate
   from healing, shield generation, actual absorption and survival.
9. Current authored gates/levels/rewards preserved; ordinary calibration excludes
   Calamitic paper ceilings. Compare current combat baseline and new pilot
   before adjusting enemies; propose required tuning for approval.
10. Motion samples at pre-impact/impact/post-impact/final, speed/Skip/reduced
    motion, GPU fallback, portrait readability, repeated casts/disposal.

Use the [non-Calamitic benchmark methods](../roster-capability-audit.md) and
[global calibration](../enemy-benchmark-calibration.md), rerun against current
content. A five-seed early-entry test is a useful regression, not a fresh global
clear-rate report. Maintain current farm/cost/fodder changes as a fixed baseline.
No numerical acceptance claims are established in this document.

## 12. Explicit owner review checklist

Review the proposed values/formulas and starter examples, with particular
attention to:

1. **Final-form ordinary utility:** approve the strict "Eternal only after shared
   activation" model, or allow a personal-only cast of the same current named
   Flare with a lesser effect, empowered into its full effect. This alternative
   still uses one button/name, but is not yet selected.
2. **Critical investments:** approve deterministic four-stat-compatible remaps,
   or explicitly retain a bounded separate critical mechanic. No hidden legacy
   critical layer should survive by accident.
3. **Shields:** approve finite per-source refresh and50%-HP total cap, which
   intentionally replaces current unlimited stacking.
4. **Imbues:** review three25-Shard/+10% increments and mapping of purchased old
   increments; do not equate it to preserved old potency.
5. **Charge/timing:** review100/125/150/175/200 shared thresholds, guarantee/
   random gain values, four-round timer and run carryover policy.
6. **Subtype/starter/Master values:** approve or revise the tables before coding.

After approval: implement an isolated exact starter study, publish its tests/
pressured measurements for review, then produce/approve full released-roster and
equipment matrices before a versioned production rollout. No general menu
redesign, Sunshade release, paid services or unrelated economy work is included.
