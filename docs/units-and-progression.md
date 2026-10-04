# Units and progression

**Status:** opening starter identity/selection/local save implemented; progression
below remains proposed. See [opening flow](opening-flow.md). Evolution names
are art concepts, not implemented upgrade paths.

## Confirmed progression and equipment structure

The owner confirmed evolution, character levels, weapon upgrades, and separate
upgrades for the unique passive, ability 1, ability 2, and ultimate.
Ultimate display names must use `Last Flare: <character-specific name>`.
Specific names, effects, costs, materials, caps, and formulas remain unapproved.

Each character has **eight unique artifacts** and **one master relic** equipped
at most: nine slots, with the special master relic displayed above the artifacts.
The uniqueness definition, item eligibility, and cross-character sharing rules
still need clarification. See [menu/equipment requirements](menus-and-inventory.md).
UI previews exist; upgrades and equipment transactions are not implemented.

## Separate these identities

| Concept | Meaning |
| --- | --- |
| Unit definition | Authored archetype shared by all copies |
| Owned unit instance | One player's copy with a unique instance ID |
| Evolution form | A form within a character's evolution line |
| Rarity | Acquisition or balance classification; not automatically an evolution stage |
| Level | Progress within a form or unit; exact model is open |

Definitions should use stable IDs rather than display names. An owned instance
references its definition/form and records only mutable player state.

## Existing art concepts

The [prompt guide](../Art/midjourney-character-style-prompt.md) describes six art
stages each for Ember Swordsman, Tide Spearbearer, and Sprout Archer.
Hair, eyes, signature clothing, and weapon type remain recognizable across stages.
Only the fire starter is currently playable; the others remain concepts/legacy IDs.
They are not yet balanced,
summonable combat units, and their later forms are not implemented.

## Proposed roster and squad behavior

- The roster owns instances; squads reference those instances.
- A squad has ordered slots and, if approved, a leader assignment.
- Validate ownership and eligibility before entering battle.
- Clarify whether duplicate archetypes can share a squad.
- Prevent consuming, selling, or removing a unit currently protected or assigned
  without an explicit, safe resolution policy.

Party size, roster limits, leader bonuses, and locking are open.
Equipment slot count/types are confirmed above; detailed equip rules remain open.

## Progression decisions

Specify XP thresholds, level caps, stat growth, material costs, and unlock conditions.
Evolution must define source form, destination form, prerequisites, and how
level/XP/skills/equipment transfer. Do not silently reset invested progress.

Duplicates may remain separate instances, contribute to upgrades, convert to
materials, or use another owner-approved rule. No consumption policy is confirmed.

## Proposed operation contract

Preview costs and results -> validate current state -> atomically consume costs
and apply changes -> persist -> display the committed result.

Canceling a preview must change nothing. A failed operation must not remove
materials. Show explicit reasons for unavailable actions.

## Validation cases

- Multiple copies remain distinct through saving, loading, and squad assignment.
- XP boundary behavior and caps match documented tables.
- Evolution rejects missing prerequisites and invalid form transitions.
- Successful evolution charges once and preserves the selected carryover fields.
- Locked/assigned-unit restrictions apply to every destructive operation.
- Unknown definition IDs in a save trigger a defined migration/recovery policy.

## Extension points

Use the [content guide](content-guide.md#adding-a-unit) for new definitions.
Add links to roster storage, squad validation, progression tables, and tests
when those surfaces exist.
