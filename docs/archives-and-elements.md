# Archives and enemy elements

## Implemented Phases4/6

Home's **Archives** shortcut opens one submenu containing three gallery choices,
each with its own banner header:

- **Character Archive:** all16 authored Element-Bearers with separate cards for
  every evolution (96 forms), plus30 fixed Heaven/Abyss/Treasury/Sanctuary/Roselius
  captured forms (126 total),
  including names, stars, rarity and combat kits.
  Unowned characters and unreached evolutions use the same solid black
  silhouettes, dark card background and subtle radial backdrop as undiscovered
  enemies. Each form unlocks in color only once that character
  reaches it; earlier forms stay revealed. Current forms show saved effective
  stats with Conduits; other forms explicitly preview level 0 without equipment.
  Filter by element, rarity, character ownership, reached/unreached form and
  stars; filters combine, report result counts/empty matches and can be reset.
  Gallery switching preserves filters. Unavailable saves keep all portraits
  locked without falsely classifying characters as unowned. Browsing never
  grants ownership.
  Portrait areas scale as full-width squares rather than fixed240px boxes,
  letting wide cards display larger evolution art while retaining the complete
  supplied silhouette, weapons, effects and transparent padding.
  Captured forms reveal only when at least one instance of that exact form is
  owned; Creature discovery alone does not unlock them. Their stars1-6 and rarity
  are fixed by acquired form, not level/evolution. Cards display owned-copy
  counts and explicitly labeled reference-level stats/kits, not a pretend
  aggregate of independently leveled/equipped copies.
- **Conduit Archive:** all60 Common/Rare/Legendary/Omnic mechanisms, saved copy
  counts, effects, lore, power source and acquisition information. Owned names
  show their supplied art in color; unowned/zero-count names use black silhouettes
  with a subtle neutral outline (D-141). Unavailable saves keep artwork
  silhouetted and explicitly report unavailable ownership. Only the artwork is
  darkened: rarity badges, names/effects and five-square upgrade meters remain
  readable. Store/equipment/reward artwork is unchanged; browsing grants nothing.
  The35 D-157 additions use honest neutral pending-art panels until reviewed
  images arrive, not another device's art or invented missing URLs. Acquisition
  labels distinguish Store-only Common, equal15/15/20 machine tier pools,
  stage75 Omnic and original-five-only Legendary banner eligibility.
- **Creature Glossary:** the existing discovery-gated gallery, activity filter
  and stage-specific loot tables. Unseen creatures retain hidden names, elements
  and silhouettes; encounter reveals identity/element, defeat reveals loot.

Home's Collections destination contains these three galleries (D-080).
Inventory contains holdings only; there is no bottom navigation bar.
The old internal `glossary` page still opens Archives on the Creature gallery.
Changing galleries preserves the current activity/loot selections.
Missing/corrupt saves explicitly report unavailable ownership/discoveries;
public character and Conduit definitions remain previews, not an empty save.

The three supplied opaque scenery banners and ten keyed medallions are wired.
Copy-ready [gallery banner prompts](../Art/ui/Archives.md) and
[ten element medallion prompts](../Art/ui/Element%20Emblems.md) describe their
direction; original hashes and intake settings are in
[root-art-intake.json](../Art/provenance/root-art-intake.json). Medallions remain neutral
element identifiers; rarity tone applies to unit/item designs, not changing the
meaning or shape of an element.

## Confirmed enemy assignments

| Enemy group | Combat element |
| --- | --- |
| Adventure Goblin | Botanic / Nature |
| Adventure Imp | Infernic / Fire |
| Adventure Rock Golem | Botanic / Nature |
| Each elemental dungeon's enemies | That dungeon's canonical element |
| All Dawnthorn Slime forms / Soar to Heaven | Tranquilitic / Peace |
| All Wraththorn Slime forms / Delve into the Abyss | Chaotic / Dark Matter/Energy |

Crownfall Treasury slimes and Rosethorn Sanctuary wisps are Tranquilitic.
All82 legacy dungeon discovery IDs remain stable in their six merged routes;
Archives lists all retained forms with canonical labels/filters (D-160).

Enemy nameplates show the canonical name and affinity in a compact second line.
Battle-menu combatant references also show elements, including allied units.
Text remains accessible without relying on emblem artwork.
Typing is descriptive: no unapproved resistance/weakness/damage multipliers
are introduced.

**Do not confuse combat typing with loot routing.** Heaven's Tranquilitic enemies
still drop materials from Heaven's four-affinity pool; Abyss uses its two-affinity
pool. `Creature.element` now always identifies combat typing,
while optional `dungeonElement` selects a dungeon loot table.
Adventure still drops only Prismatica. Stage gates, chances and amounts are
unchanged by elemental typing. Heaven/Abyss/Treasury/Sanctuary grant20% captures.
Heaven/Abyss and Sanctuary award independent Null-Prismatica drops; Treasury only
awards mission Prismatica. Sanctuary shares Tranquilitic combat typing but not
Heaven's evolution-material/fodder routing. See [capture rules](dungeons-and-captures.md).

## Code and extension points

D-096 keeps card status text concise: Not owned, Reached form, Evolution not
reached, Current form/level, Encountered or Defeated. Rendering descriptions
(Silhouette, Art locked/revealed, Loot locked/revealed) are not card suffixes.
Other-form stats still say Level 0 preview; shared Information explains gear
and reveal rules. All silhouette styling, filters, unavailable-save reporting
and loot gating remain unchanged. See
[wording contract](menus-and-inventory.md#concise-status-wording-d-096).

- `src/presentation/archives.ts` / `.css`: unified gallery presentation/bindings.
- `src/presentation/element-label.ts` / `.css`: accessible common element label.
- `src/content/combat.ts`: Adventure elements.
- `src/content/infusions.ts`: explicit `infusionEnemyElements`.
- `src/content/creatures.ts`: complete typed catalog and separate loot routing.
- `src/game/battle.ts`: required combatant element at every spawn.
- `src/presentation/battle-view.ts`: enemy nameplate and menu labels.
- Tests: `src/presentation/archives.test.ts`, `src/content/creatures.test.ts`,
  existing infusion/material/integration tests and `tools/test_art_prompts.py`.

Add new galleries to the central Archives gallery list rather than proliferating
Home shortcuts. New enemy definitions must assign a canonical `ElementId`;
clarify ambiguous identities with the owner rather than deriving from artwork
or from the material pool.
