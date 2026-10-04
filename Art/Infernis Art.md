# Last Light - Infernis Art

Six copy/paste Midjourney ability-icon prompts for **Infernis**: her passive,
Ability 1, Ability 2, Last Flare, and the two basic attacks.
Names and mechanics match the [implemented combat kit](../src/content/combat.ts).
Use the rendering style from [Starter Art](Starter%20Art.md) and the
[character art guide](midjourney-character-style-prompt.md), adapted to icons.

**Status:** prompts ready for generation, not generated or approved image assets.
These icons are not wired into the game and do not change combat mechanics.

## Shared style and generation instructions

- **Every image is 1:1:** use `--ar 1:1`, not the 4:3 character-art ratio.
- Retain clean precise anime contours, crisp cel shading, smooth painted
  highlights, rounded chibi-inspired shapes, and jewel-like saturated colors.
  Use Infernis's copper, scarlet, amber, orange, and restrained gold palette.
- Use one centered, bold ability symbol on a solid pure-white canvas, with
  white gaps and a clear outer white margin. No scenery, card frame, lettering,
  interface elements, or full character illustration.
- Icon adaptation: let the symbol occupy roughly two thirds of the square.
  Do not apply the character-body one-third-height rule to these symbols.
  Use thick readable shapes and minimal particles so icons remain distinct
  when reduced to small ability buttons.
- For every prompt append `--sref <approved_reference_image_url> --sw 400`,
  replacing the placeholder with the same approved reference used for the
  character artwork. The reference URL is not stored in this workspace.
- Retain `--niji 6 --s 100 --q 1`. Do not add a `--style` flag or a second
  `--no` parameter; merge extra exclusions into the existing list.
- Compare generated results with approved character art. Review all six together
  at small icon size: silhouette, not color alone, must distinguish each action.
- Preserve approved originals separately. These are ability icons, not unit
  portraits: do not run them through the character silhouette-sizing workflow
  without defining a separate icon export contract first.

## 1. Unbroken Ember - Passive

**Mechanic:** +20% outgoing damage at or below 50% health.
**Symbol:** one cracked charcoal ember with a bright, intact inner flame.
Communicates resilience without a heart meter or numerical labels.
Suggested future asset ID: `infernis-unbroken-ember`.

```text
square gacha JRPG passive ability icon on a solid pure-white canvas, one centered rounded charcoal ember stone split by a single clean crack, one vivid amber-orange flame glowing intact within the crack and rising above the stone, small scarlet cloth ribbon curled beneath the ember as a subtle companion color motif, resilient warmth and rekindled strength, cute rounded chibi-inspired symbolic shapes matching elemental character artwork, bold simple silhouette readable at small button size, minimal detail and no scattered particles, complete ember flame and ribbon visible occupying roughly two thirds of the square canvas, visible white gaps between the ribbon stone and flame tips, a clear solid-white breathing margin on all four sides beyond the complete symbol and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated charcoal scarlet amber and orange colors --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, numbers, letters, text, logo, watermark, interface, health bar, card border, frame, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, cropping, multiple icons
```

## 2. Cinder Cleave - Ability 1

**Mechanic:** 160% damage to one enemy; applies burn for two enemy phases.
**Symbol:** one diagonal broad greatsword with a narrow flame trailing its edge.
Keep this a focused strike, distinct from Flame Arc's wide crescent.
Suggested future asset ID: `infernis-cinder-cleave`.

```text
square gacha JRPG fire ability icon on a solid pure-white canvas, one broad simple greatsword angled diagonally from lower left to upper right, clearly visible straight crossguard long two-handed grip and wide blade with complete pommel and tip, warm copper blade highlights and scarlet grip wrapping, one narrow orange-and-amber flame curl closely following a single cutting edge with exactly two small separated cinders beside the tip, focused single-target burning cleave represented by a weapon symbol only, cute rounded chibi-inspired weapon shapes matching elemental character artwork, bold simple silhouette readable at small button size, complete sword and flame visible occupying roughly two thirds of the square canvas, visible white gaps between blade flame and cinders, a clear solid-white breathing margin on all four sides beyond the complete weapon and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated copper scarlet amber and orange colors --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, wide circular aura, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, cropping, multiple swords, multiple icons
```

## 3. Flame Arc - Ability 2

**Mechanic:** 110% damage to every living enemy.
**Symbol:** a broad horizontal crescent of flame, suggesting a sweeping attack.
No extra targets or figures are needed.
Suggested future asset ID: `infernis-flame-arc`.

```text
square gacha JRPG fire ability icon on a solid pure-white canvas, one broad horizontal crescent-shaped sweep of scarlet and orange fire curving upward at both ends, a thick amber core following the smooth sweeping curve and three large rounded flame tips along its outer edge, clear white opening inside the crescent, expansive multi-target sword sweep represented by one elemental symbol only, cute rounded chibi-inspired magic shapes matching elemental character artwork, bold simple silhouette readable at small button size, no fine sparks or busy decoration, complete fire crescent visible occupying roughly two thirds of the square canvas, visible white gaps around every flame tip and within the crescent, a clear solid-white breathing margin on all four sides beyond the complete symbol and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated scarlet orange amber and restrained gold colors --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, sword, phoenix, sun disk, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, cropping, multiple icons
```

## 4. Last Flare: Dawnfire - Ultimate

**Mechanic:** 280% damage to every enemy; Infernis recovers next turn.
**Symbol:** a radiant rising sun with two symmetrical flame wings.
This is an emblem, not a summoned creature or a new gameplay effect.
Suggested future asset ID: `infernis-last-flare-dawnfire`.

```text
square gacha JRPG ultimate fire ability icon on a solid pure-white canvas, one radiant amber rising-sun emblem with a bright pale-gold center, two symmetrical scarlet-and-orange flame wings spreading outward and upward from the sun with three broad rounded feather-shaped flame tips on each side, one short vertical gold flare above the sun, clear white channels separating the wing shapes and sun rays, triumphant dawnfire burst represented by a single compact elemental emblem not a literal creature, cute rounded chibi-inspired magic shapes matching elemental character artwork, strongest and most luminous icon in the set while retaining a bold simple silhouette readable at small button size, complete sun wings and flare visible occupying roughly two thirds of the square canvas, a clear solid-white breathing margin on all four sides beyond the complete emblem and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated scarlet orange amber and luminous gold colors --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, eyes, literal bird, enemies, sword, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, cropping, multiple icons
```

## 5. Light Attack - Basic Action

**Mechanic:** 100% damage to one enemy; +20 Shatter Gauge.
**Symbol:** a plain greatsword with one short pale-gold motion stroke, no fire.
Suggested future asset ID: `infernis-light-attack`.

```text
square gacha JRPG basic attack icon on a solid pure-white canvas, one simple broad training greatsword angled diagonally upward, warm brown wooden blade with smooth copper-colored highlights, clearly visible straight crossguard long two-handed grip complete pommel and tip, one short pale-gold curved motion stroke beside the blade suggesting a quick controlled strike, no elemental flames, cute rounded chibi-inspired weapon shapes matching elemental character artwork, bold simple silhouette readable at small button size, minimal decoration, complete sword and motion stroke visible occupying roughly two thirds of the square canvas, visible white gap between sword and stroke, a clear solid-white breathing margin on all four sides beyond the complete weapon and effect, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated warm brown copper and pale-gold colors --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, fire, elaborate aura, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, cropping, multiple swords, multiple icons
```

## 6. Heavy Attack - Basic Action

**Mechanic:** 180% damage to one enemy; +30 Shatter Gauge; no recovery turn.
**Symbol:** a vertical downward greatsword with a chunky impact burst, no fire.
Suggested future asset ID: `infernis-heavy-attack`.

```text
square gacha JRPG heavy attack icon on a solid pure-white canvas, one broad simple training greatsword pointing vertically downward with its entire long two-handed grip straight crossguard blade and tip visible, warm brown wooden blade with smooth copper-colored highlights, one chunky compact amber impact burst beneath the blade tip with three broad blunt rays separated by white gaps, a forceful downward strike represented by a weapon and impact symbol only, no elemental flames, cute rounded chibi-inspired weapon shapes matching elemental character artwork, bold simple silhouette readable at small button size, heavier composition than a diagonal quick-strike icon without increasing the outer footprint, complete sword and impact burst visible occupying roughly two thirds of the square canvas, visible white gap between blade tip and impact burst, a clear solid-white breathing margin on all four sides beyond the complete weapon and effect, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated warm brown copper and amber colors --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, fire, elaborate aura, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, cropping, multiple swords, multiple icons
```
