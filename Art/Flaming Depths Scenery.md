# Last Light - Flaming Depths Banner and Background

Two copy/paste Midjourney prompts for the dungeon's selection banner and battle
scenery. Match the clean contours, rounded fantasy shapes, crisp cel shading,
smooth painted highlights, and jewel-like colors of
[Flaming Depths enemy art](Flaming%20Depths.md).
Follow the environment composition principles from [Battle Scenery](Battle%20Scenery.md).

**Status:** prompts ready to generate, not generated or integrated assets.
These are environments, not character sprites: use opaque full-bleed artwork
instead of pure-white backgrounds, outer white margins, or square unit exports.

## Shared visual direction

- Cute, inviting volcanic fantasy, not realistic fire, gritty horror, or a
  cinematic photographic painting. Rounded basalt, warm glowing crystals,
  soft ember lighting, copper-and-gold accents, and distant furnace architecture.
- Scarlet, orange, amber and restrained gold highlights against charcoal-purple
  rock. Keep foreground combat surfaces quieter than the supplied enemy effects.
- No baked-in characters, monsters, ability effects, lettering, logos or UI.
  The game will overlay the title, stage information, buttons and combatants.
- Append `--sref <approved_reference_image_url> --sw 200` to each prompt, using
  the same approved illustration reference as the unit art. Replace the placeholder;
  the reference URL is not stored here. Start at 200 for environment composition
  and compare with approved enemies before changing reference strength.
- Retain `--niji 6 --s 100 --q 1`. Do not add a `--style` flag or a second `--no`
  parameter. Ratios differ intentionally by destination.
- Pixel dimensions below are suggested export targets, not Midjourney flags.
  Generate/upscale at the stated ratio; do not stretch an image to fit.

## 1. Dungeon-selection banner - 3:1

**Use:** a wide Flaming Depths entry card in a future dungeon selector.
**Ratio:** `--ar 3:1`. Suggested runtime export: **1800x600**.
**Composition:** title/button breathing room on the left; a furnace gate on the
right. Keep essential imagery away from the outer 8% and corners, allowing
rounded-card clipping. Left-side negative space is painted cavern scenery, not
white emptiness or baked lettering.
Suggested future asset ID: `flaming-depths-banner`.

```text
ultrawide dungeon-selection banner illustration for a cutesy fantasy gacha JRPG, Flaming Depths volcanic cavern environment only, rounded charcoal-purple basalt walls framing a warm inviting underground furnace gateway on the right third, compact ornate copper-and-gold gate embedded in dark rounded rock with a soft amber glow beyond it, small scarlet-orange crystal clusters near the far right edge, a narrow distant molten channel winding behind the gate rather than across the foreground, left half composed of calm low-detail deep plum cavern wall and a broad smooth dark stone ledge with subtle warm reflected light, generous uncluttered left-side space reserved for an externally overlaid dungeon title and button, no actual lettering, strongest focal light and architectural detail on the right, restrained ember specks in the distant upper right only, cute rounded storybook fantasy shapes matching chibi elemental unit artwork, clean precise anime contours, crisp gentle cel shading, smooth painted highlights, jewel-like saturated scarlet orange amber copper and gold accents against charcoal-purple stone, readable calm contrast on the left and bright inviting depth on the right, essential gate silhouette comfortably inset from all edges and corners, full-bleed scenery extending to every canvas edge, landscape composition --ar 3:1 --niji 6 --s 100 --q 1 --no characters, people, creatures, monsters, weapons, attack effects, text, letters, numbers, logo, watermark, interface, buttons, health bars, card border, frame, white border, white background, photorealism, 3d render, gritty texture, horror, smoke obscuring the scene, blown-out highlights
```

### Banner review

- Title and entry button remain readable over the left half without covering the gate.
- Gate remains recognizable at thumbnail size; no tiny detail carries its identity.
- Cropping does not remove the gate or move bright highlights behind title text.
- For narrow mobile cards, retain the 3:1 image ratio rather than center-cropping
  into a square. Any taller mobile treatment needs a separately composed variant.

## 2. Dungeon battle background - 16:9

**Use:** Flaming Depths' future full-viewport combat scene.
**Ratio:** `--ar 16:9`. Suggested runtime export: **1920x1080**.
**Composition:** broad level basalt arena; enemies on the left, player/team on the
right, both at the same ground height. The middle remains clear for animations.
Lava and architecture stay behind the standing zones, never under the units.
This is one proposed shared dungeon background, not fifty different stage images.
Suggested future asset ID: `flaming-depths-arena`.

```text
wide landscape background for a cutesy 2D turn-based fantasy gacha JRPG battle inside the Flaming Depths, a spacious volcanic cavern illustrated to complement tiny chibi anime enemies and adventurers, side-view battle-stage composition with a gently elevated camera and shallow depth, broad continuous flat charcoal-purple basalt arena floor across the lower half of the image, smooth matte stone with only a few subtle rounded seams and warm reflected amber light, two open unobstructed standing zones at the same ground height on the left and right, left zone reserved for enemies and right zone reserved for the player team, wide clear central attack lane, quiet low-contrast dark rock immediately behind both combatant zones so bright fire armor and flame effects remain readable, rounded cavern arches and thick soft-edged basalt columns far in the background, a distant copper-and-gold furnace doorway centered high behind the arena, narrow glowing orange molten channels confined to the far background below distant arches, a few small amber crystals near the distant outer walls only, subtle ember illumination and soft warm overhead light with no harsh glare, charming magical underground atmosphere rather than horror, simple rounded environmental shapes, clean precise anime contours, crisp gentle cel shading, smooth painted highlights, jewel-like scarlet orange amber and gold accents balanced with charcoal and muted plum stone, lower contrast and less detail behind the combatants, level readable arena rather than a winding path or lava platform, full-bleed scenery extending to every canvas edge, environment only --ar 16:9 --niji 6 --s 100 --q 1 --no characters, people, creatures, monsters, weapons, attack effects, text, logo, watermark, interface, health bars, foreground lava, foreground crystals, foreground boulders, foreground pillars, chasms, cliffs, steep slopes, dramatic perspective, isometric view, overhead view, photorealism, 3d render, gritty texture, horror, dense smoke, blown-out highlights, white border, white background
```

### Background review

- Complete enemy and ally silhouettes have clear standing space on the same plane.
- Arena floor remains continuous; no lava, pits or foreground props obstruct movement.
- Bright supplied enemy effects stand out against the quieter dark backdrop.
- Central lane, top report/header area, and bottom ability HUD are not focal hotspots.
- Check all ten enemies, especially the wide winged/aura designs, over the scenery.
- Test desktop and portrait-mobile layouts. Preserve both standing zones through
  deliberate responsive framing; do not assume center-cover cropping will do so.
  If a crop loses necessary zones, use a separately framed portrait variant or
  a layered environment before integration.

## Asset intake

Preserve approved originals under `Art/source/banners` and
`Art/source/backgrounds`. Create separate runtime copies under
`public/assets/banners` and `public/assets/backgrounds`.
Do not run either image through white-matte removal or 960x960 unit normalization.
Record actual dimensions, crop/safe-area strategy and provenance in
[Art workflow](../docs/art-workflow.md) when supplied.
Dungeon gameplay is still deferred; supplying these images does not enable it.
