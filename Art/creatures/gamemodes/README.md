# Last Light - Heaven and Abyss Art Packs

**Cutout background rule:** [Solid-color contract](../../guides/cutout-background-contract.md). Subject identity, design and elemental colors come first. End the prompt with a short plain solid, unlit background instruction; No glows or glowing visual effects: use opaque solid-color elemental lines, ribbons, rings and shapes with crisp edges; painted highlights are non-emissive. Never recolor the subject to suit the background. Arenas and banners remain scenery.

These are special high-level activity packs, separate from the ten elemental
dungeons. Each has **six total enemy forms: a starter slime plus five successive
evolutions**, three mode-specific material icons, a selection banner and a battle
arena. They follow one continuous creature identity rather than six unrelated
species. **Wraththorn Slime** and **Dawnthorn Slime** are the permanent names.
Later display names follow **"<evolution title>, <permanent slime name>"**, just
like character forms. Titles describe escalating cosmic wrath or celestial
judgment, never a new enemy class/species or a reused character rank ladder.
For example: **"Worldfall Reverie, Wraththorn Slime"** and
**"Crimson Reckoning, Dawnthorn Slime"**.
The same named slime grows stronger across the stage/level progression.

- [Soar to Heaven](Soar%20to%20Heaven.md): white/black/vibrant red, golden thorns;
  majestic, merciless celestial power.
- [Delve into the Abyss](Delve%20into%20the%20Abyss.md): black/white/deep purple,
  bright pink thorns; cosmic destruction and wrath.

**Status:** all22 images supplied, preserved and wired into playable modes with
approved editable first-pass recipes (D-050). The new slime direction supersedes
older angelic/royal-shadow wisp concepts. Runtime uses **Soar to Heaven**
(`heavens`); IDs remain stable. These are not City of Heaven/Ruins of Chaos.

## Shared generation and export contract

Heaven/Abyss are exceptions in **subject complexity and mood**, not rendering.
Keep the original character examples' compact proportions, clean contour weight,
cel shading and painted highlights even on the final ornate forms.
Do not soften Heaven into generic gentle angels or turn Abyss into realistic
horror. Preserve both named slime cores, restricted palettes, thorns, equipment,
wings/halos and evolution titles. Base slimes stay limbless; do not force human
head-to-body anatomy onto their rounded jelly mass. Materials remain objects,
and full-bleed scenery retains its own composition and atmospheric lighting.

- Use the [approved style guide](../../guides/midjourney-character-style-prompt.md):
  rounded chibi proportions, eyes-only faces, precise anime outlines, crisp cel
  shading, smooth painted highlights, jewel-like colors. Epic means denser
  filigree, sharper symbolic thorns, stronger silhouette and controlled energy,
  not photorealism, gore or unreadable detail.
- Preserve each mode's slime core, eye color and thorn gradient through all forms.
  Humanoid later forms stay 2.5-3 heads tall, tiny covered torso/short limbs.
  Threat comes from stance, armor and magic; never turn into a different species.
- Enemy prompts: 4:3, plain solid-color canvas, body roughly one third of canvas
  height, complete equipment/effects and generous margin. Enemies face right.
  Black/white parts are intentional artwork, not removable matte. Keep dark
  outlines around white Heaven bodies to separate them from the background-color canvas.
- Item prompts: 1:1, one centered collectible, roughly two thirds of the canvas,
  distinct silhouette at small size, background-color negative space and margin. No faces.
- Banners: 3:1, right-side landmark, calmer left-side title region, no baked text.
  Arenas: 16:9, level enemy-left/ally-right standing zones, clear combat lane,
  quiet top/bottom UI space. Full-bleed opaque landscapes, never white-matted.
- Every prompt is copy-ready. Enemy portraits, items and environments use no
  `--sref` or `--sw` under D-155.
  Keep one `--no` list, `--niji 6 --s 100 --q 1`; no second exclusion/style flag.
- Preserve original PNGs. Export enemies as 960px RGBA / 864px content / 48px
  padding; items as 256px RGBA / 224px content / 16px padding. Suggested banner
  1800x600 and arena1920x1080; aspect-preserving opaque exports.
  Add approved source/runtime mappings only once real images are supplied.

## Materials, elemental ownership and stage direction

Each mode has **three specialty materials with separate purposes**, not three
rarities of the same item. Heaven shapes are blade / crown / chalice; Abyss
shapes are claw / fracture-orb / hourglass. Their appearances must never be
interchanged. Specialty items are mode-bound, not additional currencies.

| Mode | Elements served by its specialty materials |
| --- | --- |
| Heaven | Infernic, Aquatic, Tectonic, Efflorescent, Atmospheric |
| Abyss | Voltaic, Luminous, Ominous, Tranquilitic, Chaotic |

This retains the existing infusion-source split. Weapon materials improve those
elements' weapons; evolution materials serve those elements' character evolution;
late-leveling materials serve those elements' characters **throughout Evolution
5 and 6** (caps90/105), even if their preserved current level is below80.
This is form-gated, not a "destination level81+" rule, as clarified by the owner.

Both modes can also drop existing elemental **Epic, Legendary or Omnic**
materials from **their five associated elements**, matching the specialty
material affinity split. These are the existing Crest / Heart / Soul identities,
not six new icons or replacements for ordinary dungeon materials.

Live modes: 35 stages, enemyLv80->120. Current form/material bands:

| Stages | Enemy form | Specialty material access | Extra elemental pool |
| --- | --- | --- | --- |
| 1-6 | Base slime | Weapon material | Epic, mode-associated elements |
| 7-12 | Form 2 | Weapon; evolution from12 | Epic, mode-associated elements |
| 13-18 | Form 3 | Weapon + evolution; leveling from18 | Epic; Legendary from18 |
| 19-24 | Form 4 | All three specialty materials | Epic + Legendary, mode-associated elements |
| 25-30 | Form 5 | All three specialty materials | Epic + Legendary, mode-associated elements |
| 31-35 | Form 6 | All three specialty materials | Epic + Legendary + Omnic, mode-associated elements |

Later stages retain earlier pools. Increasing stage difficulty should increase
specialty yield/access and rare-material opportunity, not guarantee top-rarity
drops. Quantities grow quadratically by enemy level; at120 specialty stacks are
weapon80-160, evolution40-80 and leveling24-48. Preserved unlock levels are80/93/100.
Epic/Legendary/Omnic unlock at80/100/115; chances grow15->85%/6->65%/2->40%,
with final stacks12-24/6-12/3-6. Each independent success chooses one element
uniformly from the mode's five elements; every fifth stage is a boss.
Do not infer gameplay elemental typing from a mode's visual palette.

**Spending:** keep elemental costs plus5 evolution items for4->5 and10 for5->6;
one leveling item every Evo5/6 level. Weapon destination rank R costs100R Prismatica
and5R weapon items, rank10 cap, +2% grown Attack per rank. Creature infusion consumption
remains deferred; this visual enemy evolution line does not enable player
captures, fodder evolution or automatic enemy mid-fight transformations.

See [gameplay direction](../../../docs/gameplay-and-elements.md),
[progression](../../../docs/units-and-progression.md) and
[art intake](../../../docs/art-workflow.md).
