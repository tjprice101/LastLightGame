# Combat specification

## Allied effect presentation (D-211)

The shared HP readout displays actual remaining Shield, timed outgoing Damage
buffs, Defense, one-hit protection and recovery. Optional typed BattleEvent
buff snapshots preserve event-time values for character and equipment sources;
presentation tracks pre-action snapshots and applies them at impact without
reading future final state. Legacy shield events remain supported. This changes
presentation metadata only, not combat math, effects, clocks or RNG.
[Full UI/copy contract](menus-and-inventory.md#active-allied-effects-and-clear-ability-copy-d-211).

## Enemy progression rebalance (D-192)

The owner approves stronger real enemy stats and level-based activity access,
not a hidden damage penalty for level gaps. Character stats, skills, costs,
cooldowns, Defense mitigation, RNG and ordinary reward amounts are unchanged.
All hostile spawns share `enemyCombatStats`; Training retains each species'
opening stats and converges on the shared endpoints.

Ordinary normal-hit targets for unequipped Infernis are **2-4 hits at the same
level, 3-5 at +5, and 5-8 at +8/+10**. Tests cover Lv.0/10/30/45/60/75/90/105
at their pre-evolution caps, using actual noncritical attack events. Tizu/Flora
retain lower normal Attack and their shield/healing roles; their upper hit-count
allowance is 1.5 times the damage-starter target. None of the three can one-shot
these higher-level enemies even with a critical Normal Attack.

Growth combines cubic level growth, smooth increasing evolution-scale pressure,
and extra late acceleration above Lv.110. Each stat is anchored to its opening
value and exact Lv.120 endpoint; Defense uses a gentler exponent. Beyond120,
the event-only extension is `(1 + .018 * (level-120))^2`, through140.

| Lv.120 stat | Ordinary | Boss |
| --- | --- | --- |
| Health | 200,000 | 500,000 |
| Attack | 40,000 | 50,000 |
| Defense | 6,000 | 8,000 |

Story uses 90% shared HP and 75% shared Attack, with shared Defense. It remains
easier than corresponding material encounters. All starters clear the first
Story encounter at Lv.0 without gear across three seeds. Accessible Common
Store loadouts support the opening material dungeon, Rare materials at the
Lv.45 cap and form3 infusion at the Lv.60 cap. Built max-level squads clear
the Lv.140 Rose boss; unbuilt solo final-boss clears are no longer required.
This deliberately supersedes D-165's fixed late endpoints/old hostile curves
and the historical all-roster unequipped solo-clear contract.

Captured creatures **do not inherit hostile buffs**. Their playable
HP/Attack/Defense use the original ordinary curve and fixed-form multiplier;
all saved levels, skills and UUIDs remain. New Heaven/Abyss runs use the
[cap-aligned schedule](gameplay-and-elements.md#two-infusion-modes).
Existing runs without a schedule marker retain the old levels and loot across
Continue/Retry; new entry locks never invalidate a frozen active run.

Validation: `npm test -- src\game\enemy-progression.test.ts
src\game\activity-access.test.ts src\game\defense-balance.test.ts
src\content\stat-growth.test.ts src\game\crimson-roses.test.ts
src\game\captures.test.ts src\online\server-game.test.ts --maxWorkers=2`.
Run the full suite and regenerate the server bundle whenever these rules change.

## Progressive character choreography (D-191)

All battle activities and authoritative responses use the same BattleView
entrance, cast, impact, portrait-banner and readiness-glow paths. Full animation
is still default; only explicit in-game Reduce motion disables it. Normal
attacks, both skills and Last Flare keep their actual names, effects and timing
of HP updates at impact. Combat, Gauge/costs/cooldowns, RNG and rewards are not
changed. Presentation-only speed remains 1x/2x/3x.

Each of the 16 Element-Bearers has a typed visual signature and weapon/caster
pose, rather than most of the roster falling back to generic force rings:

| Character | Signature / choreography |
| --- | --- |
| Infernis | Flame greatsword cleave / sweeping slash |
| Tizu | Three-pronged current / forward thrust |
| Flora | Unfolding petals / bow draw |
| Atmoso | Cyclone spirals / elevated staff cast |
| Aurora | Intersecting prism lenses / stationary cast |
| Bliss | Paired feather fans / twin sweep |
| Bruno | Faultline ridges / hammer windup |
| Disciple | Linked mindcrown / elevated psychic cast |
| Elise | Four-point star lattice / twin sweep |
| Razor | Eclipse bastion / braced guard strike |
| Rosetta | Rose mandala / bow draw |
| Thornia | Thorn battlements / braced guard strike |
| Crinso | Opposing connected blade geometry / twin sweep |
| Nerithe | Meridian current grid / trident thrust |
| Orvella | Citadel foundations / mace windup |
| Vaelor | Branching resonance / blade slash |

Independent bounded level and evolution factors prevent level 140 from
flattening all evolution tiers to the same intensity. Each successive evolution
increases power, scale and windup; ornament counts increase in discrete tiers.
Omnic Last Flare has up to six signature layers, eight sweeping arcs, five
shock rings, twelve rays and 32 sparks. Cast geometry appears around the source
before the impact ensemble; portrait banners retain their 3500ms base duration
and stationary 12%-90% reading hold, adding the same signature architecture.
Animate sprite wrappers, never portrait-facing images. Authored unit colors
drive highlights; no source artwork is changed or requested.

Captured creatures/enemies retain their real progression and use
element/family-derived geometry, without borrowing an Element-Bearer's personal
signature. Support casts remain at their caster rather than lunging at allies.

Development preview: [animation-preview.html](../animation-preview.html), served
at `/LastLightGame/animation-preview.html` by the existing Vite dev server.
Choose any of the 16 characters, six evolutions, actions, speed and activity;
Play animation resets its in-memory fixture; Replay entrance shows the real
slide-in. Real BattleView and pure combat resolution are used, but there is no
storage, account, server or reward persistence. The preview is not a production
build entry. Hidden-browser timing fixtures advance finite timelines explicitly;
those checks are not claims of natural wall-clock playback or owner approval.

**Battle presentation (D-187):** all battle animations play by default regardless
of device motion preferences; only the in-game Reduce motion selection disables
them. Entrances, attack movement/effects, skill banners and Last Flare shine are
preserved. [Motion and captured-skill contract](menus-and-inventory.md#explicit-motion-preference-d-187).
Ordinary Votive Roselius retains Skill 1/2 at 25/40 Gauge, not a Last Flare;
its saved kit, cooldowns and Gauge requirements are unchanged.

**Current D-173 direction:** owner approves shared elemental families/fewer
personal counters and precise Rose signatures. [Current contract](character-kit-rework.md#current-consolidation-contract-d-173)
supersedes the all16 bespoke-resource goal below. Preserve essential healing,
Shield, Weaken, crit/attack buffs, Gauge, cooldowns/recovery and owned equipment;
family labels do not replace actual status predicates or combat elements.

**Status:** [Adventure](free-battle.md) is implemented with prototype formulas,
starter kits, waves, and hotkeys. This page retains broader production questions.

## Resumed intrinsic kits (D-170 / D-172)

The seven Standard flagships and remaining Rose/War batches receive typed capped setup/payoff choices using
existing attack/shield/buff/event clocks. No equipment prerequisite or new RNG,
reward/save writes or recovery bypass. [Exact loops and rollout](character-kit-rework.md)
own the current contract; [status icon prompts](../Art/ui/Battle%20Status%20Icons.md)
remain generation-only with text indicators until reviewed delivery.

## Defense mitigation foundation (D-165; hostile tuning superseded by D-192)

All direct allied/enemy attacks use attack-relative diminishing Defense, not
flat subtraction. See [exact formula and modifier order](free-battle.md#stats-and-formulas).
The owner approves this correction afterLv13 enemies hit unequippedLv0 starters
for1. The original correction gave Story16/24 opening Attack and .12 early growth at half
the staged curve; Machines/material/infusion/currency modes use32/48 atLv10.
Existing HP/Defense curves, level120 endpoints and Rose level140 endpoints,
rewards/RNG/saves/ability schedules are unchanged. Existing runs retain snapshots;
start a new encounter to receive the new enemy stats.

Validate `npm test -- src\game\defense-balance.test.ts src\game\battle.test.ts
src\game\defense.test.ts src\game\story.test.ts src\content\stat-growth.test.ts
src\game\crimson-roses.test.ts --maxWorkers=2`.
Acceptance includes real noncriticalLv13 Story/Machines hits of at least9% of
every unequippedLv0 starter's maximumHP, diminishing returns, precision,
critical/skill multipliers, guarded/shielded hits, monotonic growth and unchanged
late endpoints for that historical tuning. D-192 now owns enemy stats. Stronger progression reduces relative incoming damage; there
is no forced level-gap multiplier or Conduit requirement.

## Open rules

The battle starts with only the saved starter and player/enemy turns. Each ally acts at
most once, building an individual Shatter Gauge from normal attacks and
incoming hits to pay for abilities. Only Last Flare forces full next-turn recovery.
Directional drags execute on release; right-click Defense uses the action and
reduces incoming damage by 10% until next player turn. Heavy Attack is removed.
Whenever no living teammate has a legal action, enemy phases resolve until
someone can act or combat ends. Support/Defense count; Last Flare recovery still
incurs a real enemy phase, automatically. Manual passing remains inside Battle
menu for voluntarily forfeiting actions. Clear/defeat and manual stage
advancement remain distinct; D-057 supersedes the one-phase rule in D-038.
See [current rules](free-battle.md) for exact costs, targeting, order, and effects.
Production squad size, advanced timing controls, and elemental relationships are open.
Fire, water, and grass exist as art themes; no damage advantage chart is confirmed.
Do not assume Brave Frontier's exact formulas or skill names.

## Proposed battle state

- Encounter ID, content version, battle phase, and deterministic random state.
- Ally and enemy combatants with instance IDs, current/max HP, stats, and effects.
- Pending actions, skill resources, turn/round counters, and outcome.
- Ordered events for presentation and debugging.

Battle state is separate from persistent owned-unit data. Temporary HP and effects
must not accidentally overwrite roster progression.

## Proposed flow

1. Validate encounter, squad, skills, and referenced content.
2. Initialize derived stats and combat resources.
3. Accept only legal actions for the current phase.
4. Resolve actions in the approved ordering.
5. Apply damage, healing, resource changes, and effects in a defined order.
6. Check defeat/victory and transition or start the next phase.
7. Produce one reward request for a completed encounter.

Presentation consumes battle events; animation completion should not determine
damage outcomes. Reward application belongs to the
[economy boundary](summoning-and-economy.md#transaction-requirements).

## Formula specification checklist

Before coding damage, document:

- Base stat inputs and skill coefficients.
- Defense handling, elemental modifiers, critical hits, and random variance.
- Modifier order, rounding points, minimum/maximum values, and overflow behavior.
- Shield/HP interaction, healing caps, and whether zero-damage hits trigger effects.

The owner authorized a prototype balance set. Current formulas and worked tests
are linked in [Adventure](free-battle.md#stats-and-formulas); production tuning
is still open.

## Skill and effect rules

Every skill needs target rules, cost, trigger, effect sequence, and failure behavior.
Every timed effect needs duration units, tick timing, stacking/refresh behavior,
removal conditions, and immunity rules.

Explicitly define simultaneous knockouts, dead-target retargeting, revival,
summoned combatants if supported, and when an action consumes its cost.

## Validation cases

- Illegal targets and insufficient resources cannot resolve actions.
- Same initial state, action sequence, content version, and seed give the same outcome.
- HP, resources, and turn transitions obey their bounds.
- Effect expiration and stacking match exact documented examples.
- A final action causing simultaneous knockouts follows the selected outcome rule.
- Pausing, skipping animations, or changing display speed does not change results.
- Victory grants rewards once; defeat follows an explicit reward policy.

## Implementation references

Implemented: [engine](../src/game/battle.ts), [kit definitions](../src/content/combat.ts),
[exact tests](../src/game/battle.test.ts), and [event presentation](../src/presentation/battle-view.ts).
Practice battle state is isolated from roster saves, upgrades, and economy.

## Elemental Crits (D-223)

Critical Rate is no longer capped at 100% by Conduit bonuses. For each direct
hit, the chance is Critical Rate plus that hit's bonuses. At or below 100% the
original single roll decides a normal crit. Above 100% the hit always crits and
one extra seeded roll with chance (rate - 100%), capped at 100%, upgrades it to
an Elemental Crit: the critical multiplier is multiplied by 1.5. Elemental Crits
show a rainbow ELEMENTAL CRIT damage number. Enemy crits are unchanged.
