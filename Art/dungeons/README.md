# Last Light - Elemental Dungeon Art Packs

**Cutout background rule:** [Solid-color contract](../cutout-background-contract.md). Subject identity, design and elemental colors come first. End the prompt with a short plain solid, unlit background instruction; No glows or glowing visual effects: use opaque solid-color elemental lines, ribbons, rings and shapes with crisp edges; painted highlights are non-emissive. Never recolor the subject to suit the background. Arenas and banners remain scenery.

Each dungeon file contains eight distinct monsters in ascending visual power,
six collectible material prompts, a selection-banner prompt and a battle-arena
background prompt. All prompts are ready to copy; append the style reference
instructions below before submitting them to Midjourney.

| Element | Dungeon pack |
| --- | --- |
| Infernic / Fire | [Flaming Depths](Flaming%20Depths.md) |
| Aquatic / Water | [Oceanic Valley](Oceanic%20Valley.md) |
| Tectonic / Earth | [Precipice of the Earth](Precipice%20of%20the%20Earth.md) |
| Efflorescent / Nature | [Garden of Beauty](Garden%20of%20Beauty.md) |
| Voltaic / Electricity | [Galvanic Field](Galvanic%20Field.md) |
| Atmospheric / Wind | [Sky-bound Rift](Sky-bound%20Rift.md) |
| Luminous / Light | [Lustrous River](Lustrous%20River.md) |
| Ominous / Shadow | [Valley of Solitude](Valley%20of%20Solitude.md) |
| Tranquilitic / Peace | [City of Heaven](City%20of%20Heaven.md) |
| Chaotic / Dark Matter/Energy | [Ruins of Chaos](Ruins%20of%20Chaos.md) |

## Generation contract

- Apply the [Common-to-Omnic tone ladder](../midjourney-character-style-prompt.md#game-wide-rarity-tone-common-to-omnic)
  inside each copy-ready prompt, not just this guide. Compact chibi proportions
  remain constant; higher-tier designs become commanding, formidable, majestic
  and finally transcendent rather than increasingly cute.
- Match the [approved character style](../midjourney-character-style-prompt.md):
  oversized rounded heads, tiny bodies, short limbs, eyes-only faces, precise
  anime outlines, crisp cel shading, smooth highlights and jewel-like colors.
- Monsters use `--ar 4:3`; keep the body roughly one third of canvas height.
  Escalate ornament, silhouette and effects, not body scale. Keep complete
  weapons, tails, wings and a background-color margin visible.
- Items use `--ar 1:1`: one collectible centered on a solid palette-exclusive key color, readable at icon size,
  increasingly faceted and prismatic without becoming a cluttered pile.
  These are objects, not characters; do not add faces.
- Monster portrait blocks already include their mapped reference at `--sw 400`.
  Items and environments use no `--sref` or `--sw`.
- Keep `--niji 6 --s 100 --q 1`; do not add a `--style` flag or a second `--no`.
  Existing exclusions must be extended within the single exclusion list.
- Banners: 3:1, suggested export 1800x600, focal landmark right, calm title area
  left. Arenas: 16:9, suggested export 1920x1080, level standing zones with
  enemies left/team right, clear central lane and calm top/bottom UI space.
  Both are opaque full-bleed environments, not background-color-background sprite art.
- Midjourney does not guarantee PNG transparency or exact export pixels.
  Preserve originals; approve/upscale and export PNG through the art workflow.
  Unit exports remain 960x960 RGBA; item icons can target 256x256 RGBA.
  Never matte-remove banners/arena backgrounds.

## Pending-art rarity escalation pass

The escalation pass originally covered **Precipice of the Earth, Sky-bound Rift,
Lustrous River, Valley of Solitude and Ruins of Chaos**. Precipice, Lustrous,
Chaos, Sky-bound Rift and Valley of Solitude are now supplied and integrated.
All ten elemental packs have runtime art; the original escalation pass remains
a reference for future prompt changes.
Their gameplay, names, encounters and rewards are implemented; this is an art
revision, not a new dungeon implementation or rarity assignment to enemies.
Already supplied dungeon packs are unchanged.

All40 enemy and30 material prompts in those five packs encode escalation:

| Art position | Visual direction |
| --- | --- |
| Enemies1-2 | Simple approachable creature, then distinctive capable scavenger/keeper; restrained equipment. |
| Enemies3-4 | Commanding guardian, then impressive armed sentinel; stronger species-specific silhouettes and disciplined poses. |
| Enemies5-6 | Formidable champion, then magnificent sentinel/oracle; elaborate armor, signature weapons and deployed elemental structures. |
| Enemy7 | Majestic regent/titan; masterful layered equipment and grand bounded elemental formations. |
| Enemy8 | Transcendent elemental masterpiece; fully unfolded signature design, monumental weapon/mantle and nested prismatic formations. |
| Materials Common/Uncommon | Simple seed, then distinctive emerging bloom; limited decoration and clear identity. |
| Materials Rare/Epic | Commanding faceted relic, then formidable crafted crest; structured bevels, frames and elemental blades. |
| Materials Legendary/Omnic | Majestic heart, then supreme elemental soul emblem; articulated cradles, nested structures and prismatic rings. |

Enemy positions are **visual power direction**, not runtime rarity/stars, an
evolution chain, or a guarantee about their drops. Materials retain their actual
Common-through-Omnic labels and Seed/Bloom/Shard/Crest/Heart/Soul identities.
Each element gets different signature geometry: mineral fault terraces, feather
flight fans, solar mirrors, eclipse vanes or impossible polygon lattices.
No blanket crown/wing addition to every species.

Stronger effects must remain bounded, opaque, hard-edged and non-emissive on the
source cutouts. Prismatic facets and painted energy spirals are allowed;
bloom, transparent haze, background spill and realistic anatomy are not.
Keep existing subject palettes and contrasting key colors unchanged.
The ten existing banner/arena prompts retain their scenery lighting, layouts
and quiet UI zones; the rarity ladder does not require noisy environments.

## Materials and progression

The six rarity slots are Common, Uncommon, Rare, Epic, Legendary and Omnic:
**Seed -> Bloom -> Shard -> Crest -> Heart -> Soul of the canonical element**.
For example, Infernic uses Seed of Infernic through Soul of Infernic.
Intermediate names are used by runtime material displays; the owner specified the Seed
and Soul endpoints.
Stable IDs remain `<element-id>-<rarity>`, such as `aquatic-omnic`.

Each pack's monster table suggests where the designs might appear and which
material rarities they might drop. Those suggested bands are art-direction proposals,
not the runtime stage/drop table. All ten dungeons are now playable. Runtime
uses `floor((stage-1)*lineup.length/35)` for the enemy index, two enemies ordinarily
and one boss every fifth stage. The five packs awaiting art use all eight names
listed here, neutral enemy shapes and element-accented arenas.
City of Heaven and Galvanic Field tables use actual runtime bands and per-enemy skills.
Late enemies still drop low-rarity materials; higher rarities are less likely.
See [implemented odds, stats and gates](../../docs/gameplay-and-elements.md).
The confirmed curve is level10 at Stage1, rising linearly to level120 at Stage35.
Material unlock enemy levels are preserved; quantities and chances increase with level.
Missing PNGs do not prevent rewards or stage unlocks. Other packs' suggested bands
are historical art proposals, not current floor allocations.

Monsters are different species, not eight evolutions of one creature. Captured
fodder cannot evolve. These elemental dungeon monsters are separate from the
new [Heaven/Abyss evolving slime lines](../gamemodes/README.md);
City of Heaven is not Soar into the Heavens.

The Flaming Depths art prompt file features eight designs; runtime uses all ten
supplied designs from the existing manifest. Original packs and historical stage
drafts are preserved.

See [art intake](../../docs/art-workflow.md),
[elemental rules](../../docs/gameplay-and-elements.md) and
[captures](../../docs/dungeons-and-captures.md) before runtime integration.
