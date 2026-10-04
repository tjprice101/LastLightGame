# Menus and inventory

## Confirmed requirements

- Only fire is available in the current playable build.
- **Fractalis** is the main currency; **Lycalis** is the premium currency.
- Characters support evolution, levels, weapon upgrades, and independent upgrades
  for the unique passive, ability 1, ability 2, and ultimate.
- Ultimate names always follow `Last Flare: <character-specific name>`.
- Each character has eight unique artifact slots and one separate special
  **master relic** slot: nine equipment slots total.
- Inventory, settings, and story-mode menus are needed; events come later.

## Implemented surfaces

The sanctuary navigation opens Character, Inventory, Story mode, Events, and
Settings. Both currencies appear with explicit "Balance not implemented" labels;
there are no invented starting balances, rewards, purchases, or spending operations.

Character shows all seven upgrade paths. They are non-interactive previews until
rules, costs, caps, and ability definitions are approved.
Character and Inventory show exactly eight numbered artifact slots and one master
relic above them. All are empty previews; no items have been granted and no equip,
unequip, ownership, or stat calculation operation exists yet.

Inventory has an honest empty collection state. Story mode contains a readable
original fire prologue, not playable battles or a chapter progression system.
Events is a reserved tab with no active events or timers.

Settings supports a persisted motion preference: follow device settings or reduce
motion. Device reduced motion cannot be overridden. The setting updates both
Phaser ambient movement and CSS reveals immediately. Failed reads/writes are
reported; storage uses the separate `last-light.settings` key.

## Legacy companion saves

Water/grass definitions remain available for reading version-1 saves and for
future art work, but cannot be selected in this build. After title entry, those
players see a fire re-selection notice. The original save stays intact until
explicit fire confirmation succeeds. A failed write preserves the previous save.
This policy was selected by the owner, not an automatic conversion.

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
