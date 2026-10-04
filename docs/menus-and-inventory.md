# Menus and inventory

## Confirmed requirements

- Fire, water, and grass are available as first companions; choose one.
  Free Battle uses only that saved character.
- **Fractalis** is the main currency; **Lycalis** is the premium currency.
- Characters support evolution, levels, weapon upgrades, and independent upgrades
  for the unique passive, ability 1, ability 2, and ultimate.
- Ultimate names always follow `Last Flare: <character-specific name>`.
- Each character has eight unique artifact slots and one separate special
  **master relic** slot: nine equipment slots total.
- Inventory, settings, and story-mode menus are needed; events come later.
- Three primary sanctuary screens: Home, Character Upgrades, and Events.
  Home shows the character with Squad and Summon buttons; Settings sits to the side.
- The starting experience and Free Battle are solo; no starting squad is granted.

## Implemented surfaces

The sanctuary navigation opens Home, Character Upgrades, and Events. Settings is
a modal right-side drawer available from every sanctuary screen, with close/Escape
support and focus returned to its trigger. Both currencies appear with explicit "Balance not implemented" labels;
there are no invented starting balances, rewards, purchases, or spending operations.

Home displays the saved companion and Squad/Summon buttons. These buttons announce
their coming-later status without granting units or spending currency.
[Free Battle](free-battle.md) and Story are Home subactivities with Back to Home
controls, not additional primary tabs. Free Battle remains an endless-wave
practice mode with the saved starter and supplied scenery/art. Character Upgrades shows
the saved companion's working combat kit and illustration.
Character shows all seven upgrade paths. They are non-interactive previews until
rules, costs, caps, and ability definitions are approved.
The level/Fracture preview now specifies Tier 1's level-30 cap, Fracture into Tier 2
with major stat improvements, reset to level 0, and +10 Lycalis. Tier 2 levels to 30
using different resources. Materials, costs, and exact bonuses are pending.
No current level/tier is displayed as saved progress, and no reward is awarded.
The integrated Inventory section shows exactly eight numbered artifact slots and one master
relic above them. All are empty previews; no items have been granted and no equip,
unequip, ownership, or stat calculation operation exists yet.

Inventory has an honest empty collection state. Story mode contains a readable
original fire prologue, not playable battles or a chapter progression system.
Events is a reserved tab with no active events or timers.

Settings supports persisted, validated battle hotkeys and a motion preference: follow device settings or reduce
motion. Device reduced motion cannot be overridden. The setting updates both
Phaser ambient movement and CSS reveals immediately. Failed reads/writes are
reported; storage uses the separate `last-light.settings` key.
Opening Settings suspends battle presentation and detaches its hotkeys. Closing
restores the already-resolved battle state and uses the latest saved key bindings.

## Legacy companion saves

All three version-1 starter IDs continue to the menu normally. The previous
fire-only re-selection policy is superseded: water/grass saves are not overwritten,
and Free Battle uses their saved companion. New saves still require explicit
selection and a successful write before entering the menu.

## Equipment implementation requirements

Before enabling equipping:

- Define item instance IDs separately from artifact/relic definitions.
- Enforce eight distinct artifacts per character across all equip entry points.
  Clarify whether uniqueness means distinct item instances or distinct artifact
  definitions, and whether copies can be shared between different characters.
- Restrict the special ninth slot to master relics; it is not an extra artifact slot.
- Specify ownership, slot eligibility, swapping, locking, unequipping, and save migration.
- Define stat/passive interactions and exact validation tests.

None of these unresolved rules should be implemented through silent defaults.

## Implementation references

- [Menu renderer](../src/main.ts)
- [Currency, slot, and upgrade definitions](../src/content/progression.ts)
- [Available starters](../src/content/starters.ts)
- [Motion persistence](../src/presentation/settings.ts)
- [Opening/save transitions](../src/game/flow.ts)
- [Foundation tests](../src/content/progression.test.ts)
- [Legacy-save tests](../src/game/flow.test.ts)

See [units and progression](units-and-progression.md) and
[economy](summoning-and-economy.md) for the owning gameplay contracts.
