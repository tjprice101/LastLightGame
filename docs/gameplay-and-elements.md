# Gameplay, elements and farming framework

**Status:** Gameplay navigation/catalog, typed element/material/infusion definitions,
level formula and evolution-requirement previews implemented. Adventure is playable;
all ten material dungeons and both infusion modes are clearly disabled previews.
No inventory, farming drops, captures, infusion consumption or evolution transactions
have been enabled. No save schema or existing balances were changed.

## Activity organization

Gameplay is a new primary sanctuary tab alongside Home, Character Upgrades and
Events, superseding the earlier exactly-three-screen layout.
It groups **Adventure**, **Elemental material dungeons**, **Evolution infusion**,
**Story**, and **Events**, with category links to each section.
Home retains the compact Adventure shortcut and adds a Gameplay shortcut.
Adventure quit ends the run and returns to Gameplay; each new entry starts at wave 1.
Settings still retains an active run. Story returns to Gameplay.
Events remains a primary tab as well as a Gameplay category, with no active rewards.

## Canonical elements and dungeons

| Element | Affinity | Material dungeon | Infusable enemy source |
| --- | --- | --- | --- |
| Infernic | Fire | Flaming Depths | Soar into the Heavens |
| Aquatic | Water | Oceanic Valley | Soar into the Heavens |
| Tectonic | Earth | Precipice of the Earth | Soar into the Heavens |
| Efflorescent | Nature | Garden of Beauty | Soar into the Heavens |
| Voltaic | Electricity | Galvanic Field | Delve into the Abyss |
| Atmospheric | Wind | Sky-bound Rift | Soar into the Heavens |
| Luminous | Light | Lustrous River | Delve into the Abyss |
| Ominous | Shadow | Valley of Solitude | Delve into the Abyss |
| Tranquilitic | Peace | City of Heaven | Delve into the Abyss |
| Chaotic | Dark Matter/Energy | Ruins of Chaos | Delve into the Abyss |

Infernis is Infernic, Tizu Aquatic, Flores Efflorescent (formerly described as grass).
Existing starter IDs `ember`, `tide`, `sprout` and combat kits remain unchanged.
Each starter now has a canonical `elementId`; display names include the familiar
affinity. Element registration does not grant additional playable characters,
elemental damage bonuses, resistances, or revised battle balance.

## Material dungeon stages

- Exactly **50 stages** per elemental dungeon.
- Start at enemy **level 10**.
- Owner clarified: linear growth reaches **level 100 at Stage 45** and remains
  at 100 for Stages **45-50**.
- Formula: `round(10 + (min(stage,45)-1)*90/44)`.
- Examples: Stage 1 = 10, Stage 2 = 12, Stage 23 = 55, Stage 44 = 98,
  Stages 45-50 = 100. Invalid/fractional stages throw, never clamp silently.
- Tougher enemies replace earlier archetypes and gain stronger abilities as
  stages advance. Exact stage encounters, HP/ATK/DEF curves, skill schedules,
  replacement boundaries and late plateau difficulty remain balance decisions.
- Enemy levels are content metadata, not automatically character levels or a
  hidden damage multiplier. Keep Adventure's independent wave formula unchanged.

The earlier [Flaming Depths draft](flaming-depths-stages.md) is retained as a
historical encounter/ability proposal. **Its levels 6-55 and derived stats are
superseded**; do not implement them or claim the old numbers are approved.
Adapt its ten-enemy art/region ideas after approving new level/stat balance.
Wave reports and dungeon capture direction remain in
[Dungeons and captures](dungeons-and-captures.md).

## Material identities and drop rules

Every element has six authored material definitions:
**Common, Uncommon, Rare, Epic, Legendary, Omnic**.
There are 60 stable IDs such as `infernic-common` and `aquatic-omnic`.
These are definition records only, not owned material counts or granted items.

Confirmed: later/tougher encounters can drop higher rarities; higher rarities are
less likely than ordinary materials even against high-level enemies. Farming is
intended to take effort without making rare rewards impossible.

Still open: unlock stage for each rarity, exact nonzero odds, independent rolls
versus one weighted roll, number of drops, quantities, guarantees/pity, boss
tables, full inventory behavior and dungeon Fractalis amounts. No percentages,
rarity gates, or successful drop simulation are invented by this framework.
Do not conflate material rarity with character evolution or enemy tier.

## Evolution requirements

Most characters have **five evolution forms**, Evo.1 through Evo.5.
The owner resolved the conflicting Common+Rare example in favor of adjacent
rarities:

| Transition | Own-element materials |
| --- | --- |
| Evo.1 -> Evo.2 | Common |
| Evo.2 -> Evo.3 | Common + Uncommon |
| Evo.3 -> Evo.4 | Uncommon + Rare |
| Evo.4 -> Evo.5 | Rare + Epic |

Every transition also requires **Fractalis** and **special infusable enemies**
from the element's mapped infusion mode. "Common only" restricts the elemental
material rarities, not the other currencies/infusion requirement.
Legendary/Omnic still exist as dungeon rewards; their uses are unresolved rather
than inventing Evo.6/7. Exceptional characters with different chains need an
explicit definition override before implementation.

Quantities, costs, infusion counts/tiers, starting level and later level caps/
reset rules/stat bonuses are unresolved. Preserve the existing approved first
Fracture level-30 gate, Tier2 reset to 0, +10 Lycalis rule and Tier2 level-30 cap;
these remain previews, not payments. No later Fracture Lycalis rewards assumed.

## Two infusion modes

- **Soar into the Heavens:** Infernic, Aquatic, Tectonic, Efflorescent, Atmospheric.
  Enemies are angelic wisps of **Light energy**.
- **Delve into the Abyss:** Luminous, Voltaic, Ominous, Chaotic, Tranquilitic.
  Enemies are royal Shadow-bound wisps of **Chaotic energy**.
- Each has **25 stages**, starts at enemy **level 80**, and has **four enemy tiers**
  with approximately **5-6 unique enemies**.
- Later-stage level growth, tier boundaries, unique enemy definitions/abilities,
  acquisition mechanics/odds, quantities and reward retention remain open.
- Owner's phrase "Chaos mode" refers here to the named Abyss activity, not an
  invented third mode or the Chaotic elemental material dungeon.
- Special infusable wisps are evolution resources. They are not automatically
  the same as weaker captured dungeon enemies used as team fodder. Keep their
  definitions/ownership/consumption separate until explicit rules authorize overlap.

## Extension points and implementation gates

- [Definitions and rule helpers](../src/content/activities.ts): add/edit authored
  elements, material IDs, modes and validated recipe/level lookups here.
- [Gameplay presentation](../src/presentation/gameplay.ts): grouped catalog with
  explicit unavailable notices, no fake success or currency changes.
- [Framework tests](../src/content/activities.test.ts): exact mappings, all 50
  levels, all 60 materials, eligibility and adjacent recipes.
- [Character previews](../src/presentation/hub.ts) use the shared requirements.
- [Navigation](../src/main.ts) connects Gameplay, Adventure, Story and Events.

Before enabling farming/evolution: approve the open balance tables, add validated
owned inventory instances and migration, implement atomic reward/consumption
transactions, and test failure/retry paths with no duplicate drops or lost costs.
Mode configurations must share existing combat resolution rather than fork it.
Disabled mode cards should become launch buttons only after real encounters,
reports, persistence, acquisition and end conditions are implemented and tested.
