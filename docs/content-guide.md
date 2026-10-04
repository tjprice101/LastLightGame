# Content authoring guide

**Status:** broader contracts proposed. [Starter definitions](../src/content/starters.ts)
provide the implemented opening roster. No battle content schema, editor, or
loader exists. Field names below are illustrative, not a runtime format.
Choose gameplay serialization/validation when implementing those systems.

## Shared conventions

- Proposed IDs: lowercase namespaced identifiers such as `unit.ember`,
  `form.ember.01`, and `skill.ember.basic`. Do not use display names as references.
- IDs remain stable after release; renames require migrations or aliases.
- Keep display text separate from mechanics so localization can be added.
- Use schema/content versions and validate cross-references before loading.
- Keep balance values in authored data where practical, not UI code.
- Distinguish authoring errors from player errors; report the record and field.

## Candidate record map

| Record | Minimum concepts to specify |
| --- | --- |
| Unit | ID, name/text key, form IDs, theme/element, acquisition eligibility |
| Form | ID, unit ID, art ID, stats/growth, skill IDs, next-form requirements |
| Skill | ID, target rule, cost, effect list and order |
| Effect | ID/type, parameters, duration, stack/refresh rule |
| Enemy | ID, stat profile, skill IDs, behavior policy |
| Encounter | ID, waves/enemies, victory/defeat rules, reward-table reference |
| Quest | ID, unlock requirements, encounter references, first-clear/repeat rewards |
| Banner | ID/version, pool, weights, cost, availability, guarantee/pity policy |
| Reward table | ID, deterministic or random entries, amount ranges, claim policy |
| Asset | ID, source/export references, intended usage, provenance |

Do not fill missing required mechanics with silent defaults.

## Adding a unit

1. Define role, identity, and acquisition plan.
2. Allocate stable unit/form IDs; distinguish form stages from rarity.
3. Author stats, skills, and progression using approved rules.
4. Register assets following the [art workflow](art-workflow.md).
5. Add to intended acquisition pools explicitly; not every unit must be summonable.
6. Validate references, squad use, combat, progression, and save/load.
7. Update the roster/content catalog when one exists.

## Adding a skill or effect

1. Specify legal targets, cost timing, effect order, and interactions.
2. Reuse supported effect types; add a resolver only for genuinely new behavior.
3. Add exact-value tests for stacking, duration, immunity, and edge cases.
4. Verify presentation events explain what the resolver actually did.
5. Update [combat](combat.md) if the behavior changes shared rules.

## Adding an encounter or quest

Define enemies, waves, prerequisites, completion rules, and repeat/first-clear
rewards. Validate reachability, content references, and reward claims.
Playtest with both the intended squad and weaker/stronger boundary squads.

## Adding a banner

Use the [summoning specification](summoning-and-economy.md). Select explicit unit
IDs and weights, declare guarantees and cost, validate effective odds, and test
availability boundaries and transaction replay. Never assume a new unit belongs
in every existing banner.

## Content review gate

Schema valid -> references valid -> exact rule tests -> gameplay review ->
visual/text review -> approved version publication.

Once code exists, replace this section with exact schema paths, an example
validated record, content directories, and the validator command.
