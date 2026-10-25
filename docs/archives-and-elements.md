# Archives and enemy elements

## Direct enemy drops only (D-408)

Enemy **View Loot** lists only rewards from defeating that enemy: its actual
currencies, materials, components, Conduits, sealed chest and eligible playable
copy. Story first-clear bonuses belong to mission previews/results; sale
proceeds belong to copy management; chest contents belong to chest View Loot.
None is an additional direct enemy drop. This supersedes D-295's inclusion of
first-clear annotations and sale values in enemy tables.

Capture rows show the exact form and separate50% chance, including duplicates.
Heaven, Abyss, Treasury, Sanctuary and Roses are eligible. Under D-410 all
Rose levels qualify; copies join at Lv.60 with their actual form and skills.
The same shared eligibility/chance drives runtime captures and stage previews.
No odds, eligibility, RNG order, persistence or discovery gates changed.

Null-Prismatica rows are alternative amounts from one outcome per enemy,
independent of other drops: at most one listed amount is awarded, or none.
The table states the none chance; rows are not extra rolls. Final-boss quantity
multipliers remain reflected in real direct drops.

## Shared enemy artwork containment (D-296)

Owner reports late Machine silhouettes overlapping card names/descriptions.
The current Collections path already has the D-291 bounded artwork row;
containment now lives in shared glossary styles too, rather than depending
on the surrounding Archives class. Artwork uses a fixed-height row with
zero-minimum grid tracks and100% contain-fitted image/SVG dimensions.
The base glossary slot remains220px; Collections retains11rem.
Its overflow boundary prevents art from painting over later labels, without
cropping the contained source silhouette or changing any PNG/facing/discovery.

Native Chrome measures all151 enemy cards on both Collections and standalone
glossary surfaces at1280/953/390/320px: image/SVG bounds must remain inside
the art slot and above the name; no horizontal page overflow. Includes
undiscovered late Machine forms and seen/defeated entries. The owner's exact
overlap was not reproduced in the pre-change current Collections layout;
refresh an older client to receive current styles.

## Enemy loot and Conduit details dialogs (D-295)

Every enemy card has **View Loot** below identity/lore/artwork status. Loot is
no longer expanded inside the gallery card. Undiscovered or merely encountered
enemies retain a disabled button and explicit defeat-to-reveal message; only
defeated entries can open their exact loot table. No discovery/ownership grants.

View Loot opens a styled native Information dialog containing the existing
stage/Training-level selector, real item artwork, quantities, percentages,
one-time-bonus annotations and applicable captured-copy sale values.
Stage changes use the same runtime `creatureLoot` tables, including final5x
quantities, independent premium outcomes and Machine Omnic stage gates.
The dialog explicitly states that these are chances per defeated enemy at the
selected stage, not a promise that every listed item appears on each clear.
Only100% drops are guaranteed; one-time Story bonuses retain their annotations.
Repeated drop/tier-roll explanations appear once per distinct rule after
the table, not beneath every Conduit name. Amount/rate columns remain readable
at320px; only the intentional dialog contains scrolling.

Every Conduit row has **View Details**. It opens that Conduit's shared reference
inside a second native dialog: artwork/rarity, saved-upgrade current effect,
maximum +5 effect, lore, power and acquisition/banner eligibility.
The Conduit Archive uses the same content, retaining unowned-art silhouettes.
Details close/Escape returns focus to its loot button without closing the loot
dialog, resetting the selected stage or losing the list's scroll. Closing loot
returns focus to the enemy's View Loot button. Browsing never writes accounts.

Validation: `npm test -- src\presentation\creature-loot-dialog.test.ts
src\presentation\archives-controls.test.ts src\presentation\archives.test.ts
src\content\creatures.test.ts src\presentation\information-topics.test.ts
src\presentation\conduit-upgrade.test.ts src\presentation\ui-copy.test.ts
--maxWorkers=2`. The new catalog-wide tests cover discovery gates, every
enemy's first/last stage, all Conduit buttons, unique dialog IDs, dynamic
rebinding, nested Escape and unchanged accounts. Native Chrome at1280/390/320px
checks geometry, actual nested modals and browser focus restoration.

## Collections layout and controls (D-291)

Collections has one title/Information toolbar, three gallery choices and a
natural-height results area. Character filters sit above the cards in a compact
wrapping grid: one desktop row, two columns on ordinary phones and one column
when space is too narrow. Counts and the management shortcut sit between
filters and results. Keep44px controls, complete labels and page scrolling;
there are no separately scrolling filter or card panes.

Exactly one gallery is visible. Filtered character and activity cards stay
truly hidden despite later layout styles. All five character filters combine;
Reset restores both backing select values and visible selection-panel labels.
Switching galleries preserves controls and artwork DOM. The Collections page
scroller participates in the existing caller-history scroll snapshots without
wallet writes.

Character, Conduit and creature art use bounded11rem contain-fitted rows.
Creature images and pending-art SVGs cannot overflow into names or loot.
Cards use natural content flow rather than sharing incompatible subgrid rows;
names, effects, exact stats and Details remain readable and reachable.
Unowned captured portraits share the unreached-form silhouette treatment.
Information, Combat kit, Details, activity selection and stage loot retain
their existing dialogs, discovery gates and source tables.

Validation: archive catalog/DOM controls, selection-panel and menu-history
tests; actual Chrome at1858/1280/390/320px for visible galleries, selection
choices, Reset, stage loot, art containment, last-card reachability and no
horizontal overflow. Wait for the existing entrance animations to finish when
capturing screenshots; their temporary opacity is not a locked-card style.

## Implemented Phases4/6

Home's **Archives** shortcut opens one submenu containing three gallery choices:

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
  Portrait areas use full-width bounded11rem rows,
  retaining the complete
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
unchanged by elemental typing. Heaven/Abyss/Treasury/Sanctuary grant50% captures (D-377); Roses also grant50% through enemy Lv.120.
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
- Tests: `src/presentation/archives.test.ts`,
  `src/presentation/archives-controls.test.ts`, `src/content/creatures.test.ts`,
  existing infusion/material/integration tests and `tools/test_art_prompts.py`.

Add new galleries to the central Archives gallery list rather than proliferating
Home shortcuts. New enemy definitions must assign a canonical `ElementId`;
clarify ambiguous identities with the owner rather than deriving from artwork
or from the material pool.
