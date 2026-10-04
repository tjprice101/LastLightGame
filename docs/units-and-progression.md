# Units and progression

**Status:** opening starter identity/selection/local save implemented; confirmed
Fracture rules are displayed as previews, not executable transactions.
See [opening flow](opening-flow.md). Later-form art concepts do not define gameplay tiers.

## Confirmed progression and equipment structure

The owner confirmed evolution, character levels, weapon upgrades, and separate
upgrades for the unique passive, ability 1, ability 2, and ultimate.
Ultimate display names must use `Last Flare: <character-specific name>`.
Adventure's initial names, effects, stats, and formulas were delegated for the
prototype and are documented separately. Upgrade costs, materials, and exact
stat-growth/Fracture bonuses remain open. The first two tiers' level cap is confirmed.

### Confirmed level and Fracture rules

- Tier 1 characters level up to **30** before needing to **Fracture** (evolve)
  into Tier 2.
- Fracture grants major stat improvements; exact values are not yet defined.
- Fracture resets the character to **level 0** in Tier 2 and grants **+10 Lycalis**.
- Tier 2 levels from 0 to **30** again, using different upgrade resources.
- Upgrade materials will be defined later. Starting Tier 1 level, XP thresholds,
  costs, later tiers, subsequent Fractures, and skill/equipment carryover remain open.

The Character Upgrades screen shows these rules and labels them preview-only.
The owner chose to defer transactions until materials and stats are defined:
no free leveling, invented materials/bonuses, Lycalis balance or Fracture reward grant,
or saved level/tier has been added. See [editable rules](../src/content/progression.ts).

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
| Level | Progress within a tier; cap 30 in Tier 1/2, reset to 0 on the first Fracture |

Definitions should use stable IDs rather than display names. An owned instance
references its definition/form and records only mutable player state.

## Existing art concepts

The [prompt guide](../Art/midjourney-character-style-prompt.md) describes six art
stages each for Ember Swordsman, Tide Spearbearer, and Sprout Archer.
Hair, eyes, signature clothing, and weapon type remain recognizable across stages.
Fire, water, or grass can be chosen as the permanent starter. All three have implemented
prototype combat kits in [Adventure](free-battle.md), which uses only the saved starter.
They are not summonable, and their later forms are not implemented.
The supplied art uses the names Infernis, Tizu, and Flores; stable save IDs remain
`ember`, `tide`, and `sprout` so old profiles still load.

## Proposed roster and squad behavior

Confirmed future exception: dungeon captures are separate from actual characters,
have Normal/Heavy attacks only, weaker/squishier stats, and character-level upgrades
only. They never evolve/Fracture or receive the seven character upgrade paths.
Capture/team storage and leveling remain unimplemented; see
[Dungeons and captures](dungeons-and-captures.md) for requirements and open decisions.

- The roster owns instances; squads reference those instances.
- A squad has ordered slots and, if approved, a leader assignment.
- Validate ownership and eligibility before entering battle.
- Clarify whether duplicate archetypes can share a squad.
- Prevent consuming, selling, or removing a unit currently protected or assigned
  without an explicit, safe resolution policy.

Party size, roster limits, leader bonuses, and locking are open.
Equipment slot count/types are confirmed above; detailed equip rules remain open.

## Progression decisions

Specify XP thresholds, stat growth, material costs, and additional unlock conditions.
Preserve the confirmed level-30 caps, Tier 1 -> Tier 2 reset to 0, and +10 Lycalis reward.
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
- First Fracture requires level 30 in Tier 1, reaches Tier 2 at level 0, and grants
  exactly 10 Lycalis once. Retrying cannot duplicate the reward.
- Successful evolution charges once and preserves the approved carryover fields.
- Locked/assigned-unit restrictions apply to every destructive operation.
- Unknown definition IDs in a save trigger a defined migration/recovery policy.

## Extension points

Use the [content guide](content-guide.md#adding-a-unit) for new definitions.
Add links to roster storage, squad validation, progression tables, and tests
when those surfaces exist.
