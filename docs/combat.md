# Combat specification

**Status:** [Adventure](free-battle.md) is implemented with prototype formulas,
starter kits, waves, and hotkeys. This page retains broader production questions.

## Current Defense balance (D-165)

All direct allied/enemy attacks use attack-relative diminishing Defense, not
flat subtraction. See [exact formula and modifier order](free-battle.md#stats-and-formulas).
The owner approves this correction afterLv13 enemies hit unequippedLv0 starters
for1. Story now has16/24 opening Attack and the shared .12 early growth at half
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
late endpoints. Stronger progression reduces relative incoming damage; there
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
