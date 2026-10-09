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

## Complete silhouettes and edge clearance (D-135)

### Machine enemy pilot: explicit outer footprint (D-154)

D-155 update: all enemy prompts are now reference-free. The following
weight100 experiment is historical; retain the framing/palette requirements,
but never reappend enemy reference flags. Character references are unchanged.

Owner reports repeated edge contact in characters/enemies and palette transfer
from enemy references. Owner chose the six Awaken the Machines enemies as the
first revision, not a global prompt rewrite. Their whole artwork now occupies
at most70% of canvas width and height, with at least15% clear margin per side;
the two early forms retain smaller50/60% footprints and larger25/20% margins.
Measure from outermost wing/weapon/ribbon/fragment tips, never just the body.
Explicit pulled-back framing replaces conflicting94/96% fill and2/3% margins.
Keep complete intricate designs and interior density; do not shorten equipment.

Machine enemy style weight is100 instead of400. Authored subject palettes
control color; references guide linework/cel shading/compact proportions only.
This wording and lower weight can reduce palette/composition transfer, not
guarantee it. Do not exclude purple/gold globally: some designs intentionally
contain those colors. Other character/enemy packs retain existing prompts
until pilot outputs are reviewed. No delivered assets are edited.

Review new full-resolution generations for visible clearance at every tip and
correct design-specific colors. Reject clipped sources rather than hiding
clipping with export padding. If colors still drift, test a lower reference
weight or reference-free version for comparison; do not silently change the
approved references or claim the model obeys exact numeric layout constraints.

Every future character evolution and enemy form must keep the **entire artwork**
inside the canvas, not only the body. Base forms receive the same explicit
protection as Legendary and Omnic. Include all weapon tips, hair, feet, wings,
crowns, armor, tails, rings, ribbons, fragments and elemental powers.
Nothing may touch, cross or disappear behind any side or corner of the image.
Leave a continuous, clearly visible solid-background safety margin around the
outermost detail on all four sides, including diagonal tips.

Put a concise complete-silhouette framing clause near the subject description,
then reinforce it once near the end of the design/composition description,
before the short background clause. Do not rely only on negative flags or
the word "full-body." Reuse this wording:

> Complete artwork fully inside the canvas, every weapon wing ornament and
> elemental-effect tip visible, continuous clear solid-background safety margin
> on all four sides and corners, nothing touches or crosses the frame edges.

Fit the **whole ensemble** by pulling back its composition uniformly when
needed, not by cutting off tips, deleting layers, shortening equipment,
simplifying armor or weakening elemental prowess. Keep compact anatomy and
the same renderer, identity, palette, evolution features, rich interior density
and imposing late-form design. An external margin is not a request for sparse
artwork or empty space inside the design.

Complete containment takes precedence over historical near-edge occupancy
targets (including94%/96% and3%/2% late-form margins). Those remain records of
existing prompts, not quotas that future prompts must satisfy at the cost of
clipping. This future-prompt rule does not rewrite existing generation blocks,
resize runtime art or reconstruct already-clipped supplied images.
Scenery banners and arenas remain full-bleed; never add a cutout border to them.

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
- Inspect every side and corner at full resolution, in every evolution:
  the outermost tip has a visible continuous safety margin, with no edge contact
  or cut-off silhouette. Runtime padding alone is not proof of source containment.
- Compare the design itself: added clearance must not remove armor, powers,
  equipment, layered detail or the intended intimidating late-form presence.
  If an output clips the subject, request the same complete design with framing
  pulled back; background removal cannot restore missing tips.

The supplied chalice example shows background variation and green haze. If the
chalice design is otherwise correct, preserve it and edit only the background
with a reviewed subject mask and flat fill. Regenerate only when the subject
itself is wrong. Avoid adding more competing clauses to an already detailed
subject prompt; also inspect whether a reference image carries a shaded backdrop.

## Intake remains separate

Preserve original files. Owner-supplied transparent PNGs under
`Art/source/cutouts` are authoritative and must never receive background removal.
Export them with alpha-only trimming, sizing and padding, as documented in
[the art workflow](../../docs/art-workflow.md).

New opaque keyed images need a separately reviewed mask or key-removal step
before acceptance. The legacy white-matte path is not an arbitrary-color remover.
Never erase matching foreground colors or pale artwork to force compliance.
