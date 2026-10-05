# Solid-color backgrounds for cutout art

Applies to characters, enemies, items, materials, ability icons and standalone
weapons. Arenas and banners remain illustrated scenery. This changes generation
prompts, not supplied images or runtime artwork.

## Priority: the artwork first

1. Preserve the named subject, identity, silhouette, equipment, elemental palette,
   evolution features and established rendering style.
2. Place that complete artwork against one flat solid background.

Begin each prompt with the actual subject and its design. Put the short
background instruction immediately before the Midjourney parameters. Do not
lead with a long background specification, ask the subject to clash with a
color, or remove identity colors to accommodate the background.

Keep each power's identity, color and shape, but render it without glow.
Use opaque solid-color lines, ribbons, rings, flame tongues, wave arcs, leaf
shapes, lightning zigzags and particle marks with crisp hard edges. Halos are
drawn rings with open centers, not soft light around the subject. Power increases
through scale, layering and ornamentation, not emission or blur.

No glowing eyes, cores, gems, weapons, auras or magical visual effects.
Replace luminous or radiant rendering with saturated painted color. Preserve
ordinary cel shading and painted metallic/gem highlights as non-emissive marks.
No translucent effect fringes, additive light, bloom, haze or spill into the
background. Keep the character and equipment dimensional; this is not a ban on
their normal shading. Arena/banner scenery is exempt, as confirmed by the owner.

## Short background instruction

```text
plain solid [BACKGROUND COLOR] background ([BACKGROUND HEX]), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights
```

Example for the Abyss palette:

```text
plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights
```

Use simple color names: green, blue, magenta or orange. The hex specifies the
desired swatch; it does not guarantee pixel-exact output. Avoid describing the
background as luminous, radiant, neon lighting, an aura, atmospheric or a
glowing studio. It is an unlit flat fill, not part of the world's scenery.

Keep one `--no` list. Add these background and no-glow exclusions to the existing
subject-specific exclusions:

```text
background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

Glow is now prohibited on the subject as well as the background. Do not exclude
the background color itself, ordinary painted shading, flowers with "bloom,"
or all halos/rings: those would remove intended design features. Use the precise
exclusion "light bloom," not "bloom." Keep one exclusion list.

## Color selection without redesigning the subject

Choose a background color distinguishable from the completed subject palette.
If the selected color overlaps a weapon, highlight or elemental effect, change
the background choice, never the subject's identity colors.

| Subject palette | Starting background choice |
| --- | --- |
| Abyss black/white/purple/hot pink | Green `#00FF00` |
| Heaven white/black/scarlet/gold | Green `#00FF00` |
| Fire red/orange/amber/copper | Green `#00FF00` |
| Nature green/gold/ivory | Blue `#0000FF` if distinguishable |
| Water blue/cyan/silver | Green `#00FF00` if distinguishable |
| Mixed/prismatic artwork | Review the subject first; choose a distinguishable blue, magenta or orange |

The copy-ready prompts retain their existing swatch choices, including green
for all nine Abyss cutouts. Templates require `[BACKGROUND COLOR]` and
`[BACKGROUND HEX]` to be filled in. Color selection is an export aid, not a
new thematic art direction.

## Reviewing results

Prompts guide Midjourney; they cannot guarantee a perfectly flat background
or eliminate generation errors. Check the actual full-resolution output:

- Identity, equipment, palette, style and intended magical effects are correct.
- The backdrop is one flat color, including internal gaps and halo openings.
- Neither subject nor background has glow, emissive lighting, bloom or haze.
- Powers have opaque solid-color shapes with crisp edges; rings remain open.
- Complete weapons, pale feathers and effect silhouettes remain visible.

The supplied chalice example shows background variation and green haze. If the
chalice design is otherwise correct, preserve it and edit only the background
with a reviewed subject mask and flat fill. Regenerate only when the subject
itself is wrong. Avoid adding more competing clauses to an already detailed
subject prompt; also inspect whether a reference image carries a shaded backdrop.

## Intake remains separate

Preserve original files. Owner-supplied transparent PNGs under
`Art/source/cutouts` are authoritative and must never receive background removal.
Export them with alpha-only trimming, sizing and padding, as documented in
[the art workflow](../docs/art-workflow.md).

New opaque keyed images need a separately reviewed mask or key-removal step
before acceptance. The legacy white-matte path is not an arbitrary-color remover.
Never erase matching foreground colors or pale artwork to force compliance.
