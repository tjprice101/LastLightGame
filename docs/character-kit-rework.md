# Intrinsic character kit rework (D-163 / D-170 / D-172)

**Delivered status artwork (D-175):** all nine named PNGs supplied; reviewed
offline intake/wiring complete. [Workflow](art-workflow.md#delivered-elemental-status-icons-d-175)
owns original/alpha/hash/URL policy. Shared icons decorate real status/counter/
equipment text, not new effects; Rose resource signatures resolve their own art.
This supersedes older prompt-only status statements.

## Current display names (D-174)

Owner requests thematic names only, with D-173 mechanics unchanged:

| Stable family ID | Display name | Stable personal resource ID |
| --- | --- | --- |
| burn | Infernic Embers | ember |
| ward | Oceanic Protection | ward |
| bloom | Botanic Renewal | bloom |
| tempest | Atmospheric Charge | tempest |
| focus | Tranquilitic Focus | No native resource |
| suppression | Chaotic Suppression | No native resource |

These names cover family labels, applicable shared personal counters, ability
descriptions, events and the nine-icon generation checklist. Precise actual
debuff names such as Burn, Weaken and Fracture Mark stay precise; equipment
names/charges and authored ability names stay unchanged. Rose Grace, Thorn Aegis
and Rose Duality retain their names. No new effect, element restriction, combat
math, trigger, cost, cooldown, cap, RNG, save/asset ID or provenance change.
Older short-family wording below refers to the same stable IDs.

## Current consolidation contract (D-173)

Owner approves live consolidation, not only icon renaming: fewer shared elemental
effects, no obligation for every Element-Bearer to have a special counter, and
precise unique signatures reserved for the Rose banner trio. This supersedes
the all16-signature-kit direction and historical D-163/D-170/D-172 tables below.
Implementation is complete; historical verification below describes earlier
contracts. D-173 validation: `npm test -- --maxWorkers=2`,93 files /1,343 passed;
`npm run build`, TypeScript/Vite137 modules passed (existing chunk advisory).
Browser verified all16 readouts, six retired counters absent and shared critical
Tempest gains on Atmoso/Elise/Vaelor without storage mutation.

### Broad family, precise effect, actual source

| Family | Elemental theme | Shared effects and native applications |
| --- | --- | --- |
| Burn | Infernic | Actual Burn, personal Ember (Infernis), equipment Ember Seals; Rose Duality is a Rose specialization |
| Ward | Oceanic | Authored Shield/direct-hit protection; Tizu earns personal Ward from actual sourced shield absorption; Thorn Aegis is a Rose specialization |
| Bloom | Botanic | Effective authored healing; Flora and Bliss share a Bloom resource; Rose Grace is a Rose specialization |
| Tempest | Atmospheric | Atmoso, Elise and Vaelor share one critical-activation resource; wind/storm equipment remains precise independent effects |
| Focus | Tranquilitic | Existing critical precision/focus effects, not a mandatory personal stack |
| Suppression | Chaotic | Actual Weaken, Fracture Mark and pierce are distinct precise effects, not an interchangeable universal debuff |

Families describe interactions, not new affinity multipliers or changes to the
holder's canonical element. A future Omnic can target a broad family or a precise
effect with an origin/source restriction. This phase adds no future Conduits.
Native, Rose and equipment owners/counts/clocks never merge simply because their
family or icon matches. In particular, Fracture is not Burn or Weaken, shielding
is not healing, and a bonus against actual Burn still requires actual Burn.

### Simplified native loops

- Infernis: personal Ember, cap3, own effective Burn once/enemy phase; existing
  Skill2 +8% outgoing each versus Last Flare +12% each remains.
- Tizu: personal Ward, cap3, actual direct absorption by her own authored shields
  once/enemy phase; Skill1 +5pp Weaken each (combined60%) versus ultimate shield
  +5% caster maxHP each. Remove the separate surviving-shield Shelter Charge.
- Flora and Bliss: personal Bloom, cap3, effective authored healing once/round,
  including passive where authored. Flora allows self-healing; Bliss still
  requires another living ally. Flora spends Skill1 +10% damage or ultimate
  +15% healing each; Bliss spends Skill1 +8% damage or ultimate5% caster maxHP
  shield each. Keep Bliss's modest heal and authored healing Gauge.
- Atmoso, Elise and Vaelor: personal Tempest, cap3, effective critical Normal or
  ordinary skill activation, at most one across all targets. Existing critical
  outcomes only, no extra rolls; ultimate cannot earn. Skill1 for Atmoso/Elise,
  Skill2 for Vaelor spends +8% damage each; ultimate +12% each. Spend before
  earning a possible new stack. Retire alternating-skill bookkeeping.
- Rosetta/Thornia/Crinso: retain precise Rose Grace/Thorn Aegis/Rose Duality
  signatures and existing D-172 triggers/spenders as specialized Bloom/Ward/Burn.
- Aurora, Bruno, Disciple, Razor, Nerithe and Orvella: no bespoke personal
  counters. Retire native Verdict marks/mark-driven Precision, Bedrock, Concord,
  Night Resolve, Charted Current and Foundation. Preserve authored Weaken,
  shields, attack buffs, low-health passives and Nerithe's fixed5 Normal-only
  Gauge. Removal is an intentional reduction of additional stack bonuses.

Keep actual combat basics: healing, Shield, Weaken, critical buffs, attack buffs,
Defense, Gauge, cooldowns and recovery. Removing unnecessary special mechanics
does not remove necessary non-elemental combat rules. Existing owned Conduits
retain all effects/charges, including non-elemental ones; no deletion, repricing,
grants or save migrations. New encounter reset/Settings clones, alive source/
provenance, effective-damage/overheal guards and capture boundaries still apply.

### Artwork scope

[Battle Status Icons.md](../Art/ui/Battle%20Status%20Icons.md) now requests only
**nine** symbols: six shared families plus three Rose signatures. Replace the
40-icon generation checklist; no installed art is removed. State/count/value/
owner/duration always remain precise readable HTML. Attack Boost, Defense,
Gauge, cooldown and recovery need no separately generated status icons.
Instant equipment cooldown feedback stays feedback, not a new elemental status.
Reproduce and validate with the existing status-art generator/tests.

## Owner direction and rollout

The owner clarifies that richer buffs, debuffs and stacks mean **reworking
Element-Bearers' own passives and abilities**, not special per-character
Conduits. The owner selects the full roster in phased batches, starting with
the three starters. Equipment is never a prerequisite for these mechanics.
The separate Conduit additions do not fulfill this request and are retained
without deleting owned copies or changing saves.

Keep one readable signature resource/loop per character, with a short setup,
clear payoff choice and bounded stacks. Preserve identities, authored skill
names, targeting, ordinary Gauge costs, cooldowns and Last Flare recovery.
Numerical coefficients are developer tuning, not owner-specified numbers.

| Batch | Status |
| --- | --- |
| Infernis / Tizu / Flora | Implemented; validation below |
| Seven Standard flagships: Atmoso / Aurora / Bliss / Bruno / Disciple / Elise / Razor | Implemented (D-170); validation below |
| Rose trio: Rosetta / Thornia / Crinso | Implemented (D-172); validation below |
| Elemental War trio: Nerithe / Orvella / Vaelor | Implemented after Roses (D-172); validation below |

The owner resumes this work after the completed Story/Training, contextual desktop
and delivered-art phases (D-170). Continue the approved phased full-roster rollout;
the starter batch remains unchanged. Do not treat richer equipment as intrinsic kits.

## Starter loops

All resources cap at3 and belong to the character, not their equipment.
Normal Attack and Defense preserve them. Ordinary action validation happens
before cloning/preparing effects, so rejected actions never spend resources.

### Infernis: ignite, bank, detonate

- Keep the low-health damage passive and Cinder Cleave's two-phase Burn.
- Effective damage from her own Burn grants one personal Ember Seal per enemy
  phase. Multiple Burning enemies cannot multiply that phase's resource gain;
  the source must be living.
- Flame Arc spends all seals for8% additive outgoing damage per seal,
  maximum24%, once for the whole AoE.
- Dawnfire instead spends all seals for12% additive outgoing damage per seal,
  maximum36%, once for the whole AoE. It now ignites surviving enemies for
  two phases using0.75 times effective Elemental Damage, with ordinary potency
  scaling and existing Burn rounding/source snapshots.
- Decision: spend early on ordinary AoE or bank for the stronger Last Flare
  payoff/recovery. No free Gauge, new turn or cooldown bypass.

### Tizu: protect, absorb, redirect

- Keep effective Defense and authored team shields. A surviving Tizu-authored
  shield still primes the existing refresh-only Shelter Charge: next direct
  enemy hit deals10% less damage, before absorption. Burn does not consume it.
- Direct enemy damage actually absorbed by her authored shields grants Tizu
  one Tide stack per enemy phase across all recipients. No absorption, no stack.
  The source must be living. Fully consumed shields still count; unrelated
  shield replacement cannot retain Tizu provenance. Periodic Burn grants none.
- Undertow Thrust spends all Tide stacks for5 percentage points extra Weaken
  per stack, maximum15pp. Combined authored/stack/gear Weaken caps at60%;
  retain the existing two-enemy-attack clock.
- Ocean Memory instead spends all Tide stacks to add5% caster effective max
  HP per stack, maximum15%, to its authored team shield. Compute the new offer
  before refresh; it never adds to existing shield totals. Existing gear shield
  potency applies to the combined authored shield offer.
- Decision: turn successful protection into stronger enemy suppression or
  bank it for a larger team shield.

### Flora: nurture, bloom, choose offense or recovery

- Keep passive team healing. Any effective authored Flora healing, including
  passive healing/self-healing, grants one Bloom per round across all recipients.
  Overhealing, another source's healing and dead sources grant none.
  Conduit self-heals are not Flora-authored healing.
- Briar Shot spends all Blooms for10% additive outgoing damage per Bloom,
  maximum30%, retaining its existing critical chance.
- Verdant Renewal retains team healing and grants living allies10% authored
  outgoing attack damage this and the next player turn. This uses ordinary
  bounded potency growth (maximum50%), refreshes instead of stacking, keeps a
  stronger already-active buff and cannot revive.
- Worldseed instead spends all Blooms for15% extra authored healing per Bloom,
  maximum45%, applied once to the entire team-healing operation. Retain
  fractional healing and actual missing-HP caps; no extra damage bonus.
- Spend before healing. Worldseed can earn one new Bloom if no Flora healing
  has already earned one that round, but never one per healed target or a
  second in the same round.
- Decision: spend nurturing on an offensive shot or save for emergency
  recovery; Renewal provides a team-support setup without extra skill slots.

## Standard flagship loops (D-170)

All five new personal resources cap at3. Fixed stack payoffs do not scale with
level, evolution or Conduit account upgrades. Their effective base stats/skill
strengths retain existing fractional growth. No extra RNG or rewards.

| Character | Setup | Spend now | Bank for Last Flare |
| --- | --- | --- | --- |
| Atmoso | Effective Normal Attack or Cyclone Weave damage grants one Gale Cadence per activation, not per target | Razor Gale consumes Cadence for +8% outgoing damage each | Sky Without End consumes for +12% each, maximum36%, one spend for the whole AoE |
| Aurora | Gleamseal retains owner-specific Verdict Marks, cap2 per surviving target, two enemy phases | Eclipse Mandate spends own marks for existing team Precision (+5pp Critical Rate each, maximum10pp, current/next player turn) | Final Dawn Verdict consumes own marks separately on each living target for +12% outgoing damage per mark, maximum24% on that target |
| Bliss | Quietstorm Flourish retains modest authored healing; effective healing of another living ally grants one Restorative Charge per activation, cap3 | Warfeather Cut consumes all charges for +8% outgoing damage each | Thousandfeather Stillness consumes all charges for team shield5% caster maximumHP each, maximum15%, refresh/nonstack |
| Bruno | Effective direct enemy absorption by his own authored shields grants one Bedrock per enemy phase across recipients; living shield owner required | Seismic Hammerfall consumes for +5pp Weaken each; combined reduction cap60% | Worldwall Ascendant consumes to add5% caster maximumHP per stack to its authored shield offer, maximum15%, before refresh |
| Disciple | Effective authored direct attack damage by a living ally using his active sourced attack buff grants one Concord per round; living Disciple required | Concord of Chaos consumes for +4pp authored attack buff each | Unbound Mindcrown consumes for +6pp each; combined outgoing attack buff cap65%, refresh/nonstack |
| Elise | Alternating effective Voltstar Cut/Crosscurrent Volley activations grant one Storm Rhythm each; first ordinary skill establishes rhythm without a stack | Voltstar Cut consumes existing Rhythm for +8% outgoing damage each, before earning a new alternating stack | Infinite Thunderwheel consumes for +12% each, maximum36%, once across its AoE |
| Razor | Each legal Defense grants one Night Resolve | Nightcleave consumes for +5pp Weaken each, combined reduction cap60% | Unbroken Midnight consumes for +12% outgoing damage each, maximum36%, once across its AoE |

Normal/Defense do not spend these resources; Elise also retains her last ordinary
skill across them. Rejected/unavailable actions neither spend nor establish rhythm.
Shield provenance belongs to the actual refreshed shield, not the most recent
cast: an ineffective weaker offer cannot steal it. Unrelated stronger authored or
Conduit shield replacements cannot credit Bruno. Periodic Burn cannot generate
Bedrock or Concord. Effective damage includes actual shield absorption, not a
nominal pre-mitigation hit; no per-target multiplication of activation resources.

Disciple's existing attack-buff clock/helper is reused. Stronger active buffs
retain their actual source when a weaker refresh extends them; a different
source's stronger buff takes ownership. Dead sources cannot earn Concord. Damage
is computed using the active pre-attack buff, not a newly applied buff afterward.
No revival or bypass of Gauge, cooldown or mandatory Last Flare recovery.

All personal counters/reset guards/rhythm/provenance stay typed in battle state,
clone with action/Settings snapshots and reset between encounters. Enemy Verdict
remains owner-specific with actual ordered snapshots. The field shows one small
personal counter, including0/3, when applicable; exact choices are in Character
and Battle reference. Conduit resources remain separate and unchanged.

## Rose and Elemental War loops (D-172)

Owner resumes both remaining batches in order: Roses, then Elemental War.
The following bounded numbers are developer tuning, not owner-specified values.
All six resources cap at3 and work without equipment; existing passives, base
stats, targeting, damage/Burn/shield coefficients, costs and cooldowns remain.

| Character | Setup | Ordinary skill choice | Last Flare choice |
| --- | --- | --- | --- |
| Rosetta | Effective own authored healing, including Virtuous Bloom, grants one Rose Grace per round | Golden Thorn Volley consumes for +5pp Weaken each, combined cap60% | Rose Beyond the Sun consumes for +10% outgoing damage each, maximum30% |
| Thornia | Effective direct absorption by her authored shields grants one Thorn Aegis per enemy phase across recipients; living source required | Shadow Rose Cleave consumes for +5pp Weaken each, combined cap60% | Thousand-Rose Dominion consumes to add5% caster maximumHP shield each, maximum15%, to the authored shield offer before potency and refresh |
| Crinso | Effective own authored Burn grants one Rose Duality per enemy phase; living source required | Golden Edge consumes for +8% outgoing damage each, maximum24% | Blossoming Cataclysm consumes for +12% outgoing damage each, maximum36%, once across AoE |
| Nerithe | Effective Normal Attack grants one Charted Current per activation | Meridian Break consumes for +5pp Weaken each, combined cap60% | Ocean Beyond the Map consumes for +10% outgoing damage each, maximum30%, once across AoE |
| Orvella | Each legal Defense grants one Foundation | Keystone Reversal consumes for +5pp Weaken each, combined cap60% | Worldweight Citadel consumes to add5% caster maximumHP shield each, maximum15%, to the authored shield offer before potency and refresh |
| Vaelor | Effective critical Normal Attack or ordinary skill grants one Resonance per activation, not per target; Last Flare cannot generate it | Resonance Cascade consumes for +8% outgoing damage each, maximum24%, before any new earned stack | Last Chord of the Sky consumes for +12% outgoing damage each, maximum36%, once across AoE |

Nerithe retains the exact fixed5 additional Gauge on her own Normal Attack only;
Current is a separate personal resource, not Gauge income on skills or allies.
Crinso retains Rose Duality's existing low-health damage bonus and Burn snapshots;
personal stacks and Conduit Ember Seals remain independent. Vaelor uses the
existing critical outcome without new rolls; zero effective damage grants none.

Rosetta healing must actually restore HP; overhealing, equipment healing and dead
sources cannot generate Grace. Thornia absorption belongs to the actual authored
shield source: ineffective weaker refreshes cannot steal provenance, unrelated
replacements cannot credit her and Burn cannot generate Aegis. Captured recipients
can benefit, but captured combatants never acquire these Element-Bearer kits.

Only listed skills spend; other actions preserve stacks except their explicit
generation triggers. Rejected actions never spend or generate. New encounters,
Continue and Retry reset personal resources/guards; action/Settings snapshots
clone them. Shield payoffs augment offers, not already active shields; refresh
remains nonstacking. All Last Flares retain mandatory recovery and ordinary costs.
Small0/3 field counters plus exact Character/Battle references expose each choice.
No new RNG streams, rewards, wallet fields, load-time writes or art substitutions.

## Complete status artwork checklist (D-172)

[Battle Status Icons.md](../Art/ui/Battle%20Status%20Icons.md) is the one copy-ready
Midjourney file for all40 current symbols: old/new native resources, enemy debuffs,
team buffs, equipment charges, Shield/Defense, Last Flare Recovery, Shatter Gauge
and skill cooldown. One symbol per effect, no generated count/percentage variants.
Distinct descriptions and individual allowed palettes/unwanted-color exclusions;
reference-free1:1 compact cel-rendered cutouts, complete outer margins and solid
unlit keys. Green subjects use magenta keys rather than erasing green artwork.
Instant Undertide Reprise/Storm Clock feedback is explicitly not a lingering buff.
The six additions are Rose Grace, Thorn Aegis, Rose Duality, Charted Current,
Foundation and Resonance. Existing34 symbols retain their prompts and IDs.

No icons installed or asset URLs invented. Preserve readable live text, actual
owners/counts/clocks and source bytes until reviewed delivery/offline intake.
Reproduce with `python tools\build_status_art.py`; validate with
`python -m unittest discover -s tools -p test_status_art_prompts.py`.

## State, UI and compatibility

- Reuse the existing per-encounter typed kit-state helpers. Internal `pilot`
  naming is retained; these are playable intrinsic kits, not equipment pilots.
  Settings/action snapshots deep-clone them. New encounters and Continue reset
  stacks/phase guards. Staged battles rebuild kits/gear from run snapshots.
- Existing attack buffs use their shared player-round expiry; no second buff
  implementation. Burn/Weaken use their existing actual event snapshots and
  enemy HP-side badges. No extra RNG, reward, account migration or load writes.
- Field readouts show one short intrinsic resource counter, including0/3.
  Detailed Battle reference explains current spending choices. Character
  passive/skill panels show resolved strengths, caps and trigger descriptions;
  existing Battle menu shows active team attack buffs.
- Existing Conduit bonuses remain separate. Personal Ember Seals and Conduit
  Ember Seals have independent state/spenders. Flora's native damage bonus adds
  in the existing outgoing bucket; Graft's equipment factor still multiplies
  afterward. Existing captured kits are not replaced by starter kits.
- New prompt-only status artwork checklist; no missing status-icon URLs.
  Supplied ability art remains unchanged.

## Validation

- `src/game/rose-war-intrinsic-kits.test.ts`:50 regressions for all six base/grown
  loops, exact ordinary/ultimate effects, once-per-activation AoE, effective
  triggers, source ownership/death/zero/overheal, shield refresh/potency,
  independent equipment, rejection/RNG/clone/Continue boundaries and counters.
- D-172 full suite: `npm test -- --maxWorkers=2`,93 files /1,391 passed.
  `npm run build`: TypeScript/Vite136 modules passed, existing chunk advisory.
  Browser verified all six rendered3/3 counters and ordinary spending to0,
  plus Nerithe Normal25 Gauge/one Current, without storage changes.

- `src/game/flagship-intrinsic-kits.test.ts`: seven no-equipment flagship loops,
  exact spending outcomes, caps/once gates, source provenance, refresh clocks,
  rejected actions and snapshot/encounter resets.
- `src/game/flagships.test.ts` / `src/game/kit-pilots.test.ts`: preserved authored
  base kits, Aurora per-target marks and both Bliss damage/shield choices.
- `src/presentation/unit-readout.test.ts`: new small personal counters and
  detailed current payoffs, existing starter/equipment references preserved.

- `src/game/starter-kits.test.ts`: no-equipment loops, exact AoE damage/heals,
  ownership, caps, once-per-phase/round gates, actual shield absorption,
  refresh/Weaken bounds, buff expiry, rejected actions and Continue reset.
- `src/game/kit-pilots.test.ts`: prior Aurora/Bliss/Shelter behavior and
  independent equipment/personal resources.
- `src/content/combat.test.ts`: base definitions, fractional growth and
  resolved descriptions.
- `src/game/kit-conduits.test.ts`: gear interaction, including native Bloom/
  Renewal plus Graft Covenant.
- `src/presentation/unit-readout.test.ts`: visible counters, detailed choices,
  defeated-resource hiding and compact field containment.

Run those files together using `npm test -- <paths> --maxWorkers=2`, then
`npm test -- --maxWorkers=2` and `npm run build`. Browser checks must use a
disposable account, never the owner's local storage.

### D-170 verification outcome

Final `npm test -- --maxWorkers=2`:91 files /1,336 tests passed. Build Last Light
(`npm run build`) passes TypeScript/Vite,134 modules, existing large-chunk advisory
only. Focused Machines/intrinsic pass:2 files /41 tests; source/readout/Python
editor diagnostics clear and whitespace check passes. Icon regeneration suite:
2 tests pass; all Art-document local links resolve. Shared art suite still has
28 historical Machines failures and no new status-icon failures.
Browser runtime-module/readout probes confirm six personal0/3 counters, exact
Atmoso0/1/2/0 and Elise0/0/1/1 sequences and accurate resolved Skill1 descriptions,
with stored data unchanged. This is not a claim of mobile visual acceptance.
