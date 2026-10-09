# Last Light - Battle Scenery

## Cutesy grassy field

**Status:** Midjourney prompt ready to generate; no scenery image generated or
integrated yet. Intended for the opening solo turn-based encounter: enemies on
the left, the player's single character on the right.

Use the soft painted highlights, clean contours, and cheerful colors of the
[starter art](../characters/Starter%20Art.md), but render a full environment rather than an
isolated unit on white. Do not bake characters, enemies, UI, or attack effects
into the background.

### Main prompt

```text
wide landscape background for a cutesy 2D turn-based fantasy JRPG battle, an inviting sunlit grassy meadow illustrated to complement tiny chibi anime adventurers, side-view battle-stage composition with a gently elevated camera and shallow depth, broad continuous level grassy ground across the lower half of the image, two open unobstructed standing areas at the same ground height on the left and right, left side reserved for small enemies and right side reserved for one player character, plenty of clear central space for attack animations, short soft mint-green and spring-green grass with sparse tiny cream and yellow wildflowers near the outer edges only, rounded distant hills, a few small fluffy rounded trees far behind the standing areas, pale turquoise sky with soft pillowy clouds, warm gentle morning sunlight, charming storybook fantasy atmosphere, simple rounded environmental shapes, clean precise anime contours, crisp gentle cel shading, smooth painted highlights, harmonious pastel greens and soft jewel-like color accents, lower contrast and less detail behind the combatants so character silhouettes remain readable, calm welcoming beginner area, flat readable arena floor rather than a winding path, full-bleed scenery extending to every canvas edge, environment only --ar 16:9 --niji 6 --s 100 --q 1 --no characters, people, creatures, monsters, weapons, buildings, tall foreground grass, foreground branches, large foreground rocks, cliffs, steep slopes, dramatic perspective, isometric view, overhead view, photorealism, 3d render, gritty texture, dark horror, white border, text, logo, watermark, interface, health bars
```

### Reference and generation notes

- Use the shared illustration renderer without `--sref` or `--sw`.
- Start at `--s 100`; preserve the clear floor before increasing decoration.
- Keep `--niji 6 --q 1` consistent with the existing prompts; do not add `--style`.
- Generate at 16:9. For a narrower battle viewport, keep the playable floor and
  both standing zones visible through responsive framing, not blind center-cropping.
- Unlike character sprites, scenery stays **opaque** and full-bleed. Do not run
  it through white-matte removal or the 960 x 960 unit normalization pipeline.

### Composition review

- [ ] No baked-in characters, enemies, UI, text, or attack effects.
- [ ] Left and right standing zones share the same ground line.
- [ ] Entire combatant silhouettes and weapons remain readable on both sides.
- [ ] Central attack lane and foreground floor remain clear.
- [ ] Trees, flowers, and hills support the scene without becoming focal obstacles.
- [ ] Looks consistent beside Infernis, Tizu, Flora, Goblin, Imp, and Rock Golem.
- [ ] Checked with one player character on the right, not a starting team.
- [ ] Mobile framing preserves both sides of the arena.

When an approved image is supplied, preserve its original under
`Art/source/backgrounds` and create an appropriately sized runtime copy under
`public/assets/backgrounds`. Record its final dimensions and display strategy in
the [art workflow](../../docs/art-workflow.md) during integration.
