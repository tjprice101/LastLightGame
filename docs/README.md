# Documentation hub

This folder is the shared reference for the owner, developers, and AI agents.
It is intended to make features easy to locate, extend, and hand off.

## Status vocabulary

- **Confirmed:** explicitly requested by the owner or present in existing source material.
- **Proposed:** a starting design for review; not approval to implement it.
- **Open:** a decision is still needed.
- **Implemented:** present in code and verified; include implementation and test links.

The title, fire/water/grass selection, local save, navigation, readable prologue, motion/
hotkey settings, and Adventure with the saved squad are implemented.
All ten elemental material dungeons, saved material inventory, leveling, evolution,
Fractalis spending and a one-time +10 Lycalis first-Fracture reward are implemented.
Owned rosters and three-member mixed squads are implemented. Phase8 adds
Heaven/Abyss Lycalis drops. Phase9 adds Crownfall Treasury, protected-safe slime
sales and active10-Lycalis Standard draws with200/500 pity and Lv50 Omnic
duplicate-EB slime rewards. See [Treasury](crownfall-treasury.md).
Phase10 adds [Rosethorn Sanctuary](rosethorn-sanctuary.md):25 floors65-120,
Lycalis farming, six divine wisp forms and protected-safe dual-currency sales.
Its first three forms expand Standard to15 real outcomes; Character Archive
contains42 EB evolution/creature form entries.
Phase11 verifies cross-system economy and save behavior and run snapshots across
all15 activity destinations. Phase12 completes integration of36 owner-supplied
root images:27 keyed RGB cutouts/icons and nine scenery images copied unchanged.
See the [roadmap](roadmap.md), [art workflow](art-workflow.md),
[intake manifest](../Art/root-art-intake.json) and [handoff](handoff.md) for
provenance, registration and validation.
The Conduit Store sells five Common ancient-war mechanisms; per-character
equipment applies their buffs across every battle mode. Weapon spending is
disabled; existing bonuses persist.
Heaven/Abyss20% captures, retained kits, mixed/all-captured squads, independent
copy levels/Conduits and protection are implemented. Phase7 protected-safe
creature infusion supplements evolution costs. Separate skill upgrades and
further currency modes remain deferred.
Unified Archives contain Character, Conduit and discovery-gated Creature
galleries. All existing enemies have explicit visible elemental typing.
Five dungeon packs await artwork; their named enemies, rewards and stage unlocks
work with neutral interim visuals. Both infusion modes are playable.

## Find the right document

| Document | Use it for |
| --- | --- |
| [Game vision](game-vision.md) | Product direction, design pillars, scope boundaries |
| [Opening flow](opening-flow.md) | Title, starter selection, menu, local save, placeholder art |
| [Menus and inventory](menus-and-inventory.md) | Fire-only roster, currencies, upgrades, 8+1 equipment, settings/story/events |
| [Combat](combat.md) | Battle flow, actions, damage, effects, combat tests |
| [Adventure](free-battle.md) | Fresh wave-1 runs, linear enemy levels/stats, all starter kits, recovery, hotkeys |
| [Gameplay and elements](gameplay-and-elements.md) | Grouped activity tab, ten elements/dungeons, level 10-120 curve, materials, infusion modes and evolution recipes |
| [Dungeons and captures](dungeons-and-captures.md) | Mode eligibility,20% atomic captures, retained kits, fixed-form stats/ratings and art reuse |
| [Flaming Depths stages](flaming-depths-stages.md) | Historical Stage 1-50 encounter/skill proposal; old levels/stats superseded by elemental framework |
| [Units and progression](units-and-progression.md) | Unit identity, roster, leveling, evolution, duplicates |
| [Character instances](character-instances.md) | Independent copies, locks, levels/Conduits, run snapshots and legacy save compatibility |
| [Evolution creature infusion](evolution-fodder.md) | Exact fodder counts/forms/mode mapping, protected-copy selection and atomic consumption |
| [Conduits and store](conduits.md) | Ancient-war mechanisms, catalog, Fractalis purchases, ownership and equipment scope |
| [Archives and enemy elements](archives-and-elements.md) | Unified galleries, discovery locks, confirmed enemy typing and separate loot routing |
| [Summoning and economy](summoning-and-economy.md) | Banners, odds, pity, currencies, reward transactions |
| [Content guide](content-guide.md) | Adding units, skills, enemies, quests, and banners |
| [Technical architecture](technical-architecture.md) | Stack decisions, module boundaries, saves, online services |
| [Art workflow](art-workflow.md) | Existing visual direction, asset intake, provenance |
| [Development guide](development-guide.md) | Setup status, feature workflow, testing, definition of done |
| [Roadmap](roadmap.md) | Proposed implementation sequence and completion gates |
| [Decisions](decisions.md) | Confirmed direction, pending choices, decision template |
| [Handoff](handoff.md) | Current workspace state, next action, contributor handoff |

Also see the root [AI instructions](../AGENTS.md) and the existing
[art prompt guide](../Art/midjourney-character-style-prompt.md).
The [Archive banner prompts](../Art/Archives.md) and
[element medallions](../Art/Element%20Emblems.md) cover Phase4 galleries and
all ten canonical elements; supplied images are registered and tracked in the
[root art manifest](../Art/root-art-intake.json).
The [Starter Art prompts](../Art/Starter%20Art.md) cover the new base-form trio
and three basic mythological enemies in the same style.
The [Battle Scenery prompt](../Art/Battle%20Scenery.md) covers a cutesy grassy
field for the intended solo opening battle.
The [Flaming Depths prompts](../Art/Flaming%20Depths.md) cover ten dungeon enemies
in ascending visual power, from a soot sprite to a flame sovereign.
The [Infernis Art prompts](../Art/Infernis%20Art.md) include five new greatsword
evolution stages with increasingly chromatic heavenly flames and ornate armor,
plus 1:1 ability icons (Heavy is archived).
The [Tizu Art prompts](../Art/Tizu%20Art.md) and
[Flora Art prompts](../Art/Flora%20Art.md) provide five new stages each:
celestial tidal spear armor and angelic leaf-wing bow regalia. Both files also
include six 1:1 ability/action icon prompts: Passive, Skill1, Skill2, Last Flare,
Normal and Defense. Those icons have not been generated or supplied yet.
All 15 evolved portraits are supplied and integrated into six gameplay forms,
with caps 30 / 45 / 60 / 75 / 90 / 105. See D-033.
The [Flaming Depths Scenery prompts](../Art/Flaming%20Depths%20Scenery.md) cover
a 3:1 selection banner and 16:9 battle background with destination-specific framing.
The [elemental dungeon art packs](../Art/dungeons/README.md) provide a separate
file for each of the ten dungeons: eight ascending-power monsters, six material
icons from Seed to Soul of its element, a 3:1 banner and a 16:9 arena background.
Suggested encounter bands and drop pools are art proposals, not implemented rules.

## Common tasks

- **Add a character:** [content guide](content-guide.md#adding-a-unit) ->
  [units](units-and-progression.md) -> [art](art-workflow.md).
- **Add a skill or combat mechanic:** [combat](combat.md) ->
  [content guide](content-guide.md#adding-a-skill-or-effect).
- **Add a summon banner:** [economy](summoning-and-economy.md) ->
  [content guide](content-guide.md#adding-a-banner).
- **Pick up development:** [handoff](handoff.md) ->
  [roadmap](roadmap.md) -> [development guide](development-guide.md).
- **Change an important rule:** [decisions](decisions.md), then the affected
  system specification and its tests.

## Documentation maintenance

Keep each rule in one owning document and link to it elsewhere. Update documents
in the same change as related implementation. Replace open questions with approved
rules and decision references rather than leaving conflicting alternatives.
When code exists, add exact file, symbol, schema, and test links to these pages.
Do not invent those links ahead of implementation.
