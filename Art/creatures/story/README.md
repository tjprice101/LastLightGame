# Story region art packs

**Status:**37 copy-ready Midjourney prompts:30 enemy cutouts, six battle arenas
and one [world map](../../ui/Story%20World%20Map.md). D-171 delivers/installs25
creatures, five arenas and the map; Infernic creatures/arena remain pending.
These prompt files themselves do not generate images. [Runtime catalog and rules](../../../docs/story-and-training.md).

| Element | Region pack | Global stages | Creature discovery prefix |
| --- | --- | --- | --- |
| Infernic | [Emberwake March](Emberwake%20March.md) |1-25 | `story:infernic:` |
| Oceanic | [Glasswater Reach](Glasswater%20Reach.md) |26-50 | `story:oceanic:` |
| Atmospheric | [Stormspan Heights](Stormspan%20Heights.md) |51-75 | `story:atmospheric:` |
| Botanic | [Rootstone Wilds](Rootstone%20Wilds.md) |76-100 | `story:botanic:` |
| Tranquilitic | [Stillhalo Vale](Stillhalo%20Vale.md) |101-125 | `story:tranquilitic:` |
| Chaotic | [Riftbound Frontier](Riftbound%20Frontier.md) |126-150 | `story:chaotic:` |

Each pack has four distinct ordinary creatures and one regional boss, plus one
empty16:9 arena. They are **not** an evolution chain: all four ordinary identities
are sampled throughout their region's ordinary stages; only local stage25 uses
the boss. Art grandeur is not a new rarity/star/capture promise. Story grants
only its implemented Common/Uncommon material loot and account-first boss bonus.

## Shared generation contract

- Use the exact runtime creature names/IDs. Enemy portraits are reference-free
  under D-155, with individual subject palettes and unwanted-color exclusions.
  Compact chibi species anatomy, clean anime contours, crisp cel shading and
  painted highlights match the existing elemental dungeon enemies.
- Creature cutouts use4:3, plain solid unlit keys, opaque non-emissive powers,
  complete silhouettes and uniform clear outer margins. Do not sacrifice
  boss architecture/detail or recolor subjects to suit a background key.
- Arenas use16:9, side-view shallow-depth battle-stage composition, equal-height
  empty standing lanes on the left and right and a clear attack lane. Background
  detail stays behind units; foreground never masks feet, weapons or effects.
  They match the elemental dungeon arena style, not the overhead world map.
- Only creatures need offline key removal. Arenas/map remain opaque full-bleed
  scenery and allow environmental light. Never apply cutout processing to them.
- Review full-resolution sources for key-filled enclosed gaps, complete tips,
  species, palette, lane readability and mobile framing before runtime intake.
  Supplied real alpha is authoritative; do not re-key it.

## Delivery and wiring

Deliver each file using its pack's proposed exact export basename. Put incoming
originals under `Art/source/story/<element>/` (map under `world-map/`), not the
repository root. Preserve every original and replaced runtime export with hashes.
Prompt files already live in the organized Art library; no duplicate root packs.

Creature runtime destinations are `public/assets/enemies/`; arena/map destinations
are `public/assets/backgrounds/`. Future intake must register actual creature art
through the shared catalog/spawn/facing/archive paths and actual scenery through
Story encounter/map presentation, using deployment-base URLs and revision keys.
Do not request proposed files until images exist and are reviewed. Preserve
stable discoveries, rewards, abilities, source species, squad snapshots and saves.

Validate text with `python -m unittest discover -s tools -p test_story_art_prompts.py`
and the existing shared art-prompt suite. Text tests do not certify generated
pixels or mean scenery has been wired.
