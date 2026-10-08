# Broken Mechanical Components

## Implemented currency and supplied artwork (D-130/D-137)

Owner requests shattered Omnic-tier machinery for the new Awaken the Machines
currency. This document is a copy-ready prompt, not a generated image or an
acquisition-rarity promise. The owner chooses the established prompt/supplied-art
workflow; runtime now uses the reviewed supplied transparent currency image.

The currency upgrades every owned Conduit name account-wide five times. It is
not an evolution material, sellable creature, Conduit copy or banner outcome.
See [Conduit upgrades](../docs/conduit-upgrades.md) for gameplay and validation.

## Icon direction and export contract

Compact face-free shattered **Omnic-tier** mechanism: broken ivory/platinum
wing vanes, splintered opal core, torn interlocking halo segments and severed
micro-gears. Prismatic jewel-like facets retain the final machines' elaborate
identity, not rusty scrap or another existing material. A single coherent pile
reads clearly at small UI sizes, with a few detached shards inside safe margins.
Powers and highlights are opaque/non-emissive; no glows in this cutout.

Art ID: `mechanical-components`.

```text
Broken Mechanical Components, a single compact face-free pile of shattered Omnic-tier machinery from an ancient angelic white machine, magnificent fractured ivory and platinum blade-feather vanes around a splintered opal reactor heart, snapped concentric mechanical halo segments with intricate engraved channels, severed miniature gears and crisp broken edges, richly chromatic crimson sapphire emerald violet and warm opal jewel-like facets embedded in the fractured core, a few detached mechanical shards orbiting closely as solid physical fragments, elegantly chaotic intricate mechanical construction distilled into one readable object, original compact chibi anime item renderer matching Thornia and Crinso's final reviewed art style, clean precise anime contours, crisp cel shading, smooth non-emissive painted highlights, opaque solid-color facet accents with crisp edges, no glows or glowing visual effects, central coherent silhouette occupying two thirds of square canvas with clear margins and nothing touching edges, no face or character or text, subject colors unchanged, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings --ar 1:1 --niji 6 --s 100 --q 1 --no glow, bloom lighting, light bloom, aura haze, translucent effects, scenery, ground plane, background gradient, textured background, text, letters, logo, border, realism, photographic rendering, photorealism, 3d render
```

Use the renderer from the [shared guide](midjourney-character-style-prompt.md)
without `--sref` or `--sw`. Preserve the
[solid-color cutout contract](cutout-background-contract.md).

## Supplied artwork intake (D-137)

The owner-supplied original is preserved byte-for-byte under
`Art/source/currencies/Broken Mechanical Components.png`. Its opaque teal
background uses reviewed source-specific offline keying and bounded edge cleanup,
including enclosed gaps; ivory armor, gears and colored core remain intact.
Dark/light previews were visually inspected before installation.

Transparent256px/224px-content export:
`public/assets/currencies/mechanical-components.png`. The shared currency and
component resolvers serve Inventory, upgrades, machine showcases, discovery-gated
loot, battle pickups and results. No economy/save changes or runtime keying.
Source/runtime hashes and cleanup settings:
[provenance](component-art-intake.json). Root original removed only after verification.
Supplied alpha remains authoritative: trim/resize/pad only.

Regenerate: `python tools\intake_component_art.py --apply`.
Validate: `python -m unittest discover -s tools -p test_component_art_intake.py`.
