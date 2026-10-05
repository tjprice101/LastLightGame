# Last Light - Tizu Art

**Cutout background rule:** [Solid-color contract](cutout-background-contract.md). Subject identity, design and elemental colors come first. End the prompt with a short plain solid, unlit background instruction; No glows or glowing visual effects: use opaque solid-color elemental lines, ribbons, rings and shapes with crisp edges; painted highlights are non-emissive. Never recolor the subject to suit the background. Arenas and banners remain scenery.

Five copy/paste evolution prompts after Tizu's beginner form in
[Starter Art](Starter%20Art.md). These extend the water spear evolution themes
in the [character art guide](midjourney-character-style-prompt.md).

**Status:** all five evolved portraits are supplied and integrated as Evo.2-6.
Gameplay now has six forms, with caps 30 / 45 / 60 / 75 / 90 / 105.
Ability icons below are generation-ready prompts only; their art adds no mechanics.

## Identity and shared style

- Male Tizu; short blue hair, blue eyes, recognizable blue waist sash and white
  underlayers. Keep one spear, not a trident, staff or sword.
- Increasingly ornate sapphire/silver/pearl armor, expanding tidal spearheads,
  then prismatic heavenly water and angelic wave-fin wings. Athletic spear poses
  remain readable; the weapon dominates rather than a summoned sea creature.
- Preserve compact chibi proportions: oversized rounded head, tiny torso, short
  limbs, 2.5-3 heads tall, eyes as the only facial features.
- Body about one third of canvas height; complete weapon, costume, wings and
  separated water ribbons visible inside solid background-color margins. No scene backdrop.
- Every prompt uses `--ar 4:3 --niji 6 --s 100 --q 1` with one `--no`.
  Append `--sref <approved_reference_image_url> --sw 400` using the same approved
  chibi style reference as the base and Infernis line.
- Compare results against supplied Tizu art; reject changed identity, cropped
  spear tips, merged water effects or realistic anatomy.

## Ability icons - Shared style and generation instructions

These six icons match Tizu's current combat kit and
[Infernis's icon style](Infernis%20Art.md#ability-icons---shared-style-and-generation-instructions).
Use one centered symbol, rounded chibi-inspired shapes, precise anime contours,
crisp cel shading, painted highlights, bold small-button silhouettes and a plain solid-color canvas. Keep sapphire, turquoise, silver and pearl as the main colors.

- Icons use **1:1**, not the character portraits' 4:3 ratio. Complete symbol and
  effects occupy about two thirds of the square, with internal background-color gaps and
  outer background-color margins. No full character, scenery, lettering or UI frame.
- Append `--sref <approved_reference_image_url> --sw 400` using the approved
  character reference. Keep `--niji 6 --s 100 --q 1`, one `--no`, no `--style`.
- Review all six at small size; distinguish them by silhouette, not color alone.
- Preserve originals under `Art/source/abilities/tizu`; use 256px RGBA exports
  with 224px content and 16px padding, not unit-sprite sizing.
- Mechanics below describe Lv.0/Evo.1. Potency grows with saved progress; icons
  remain the same across forms. Heavy Attack is retired and has no prompt.

### 1. Stillwater Guard - Passive

**Mechanic:** +8 effective defense at base, already included in displayed defense.
**Symbol:** one pearl nested in a thick silver shell, no water dome.
Suggested asset ID: `tizu-stillwater-guard`.

```text
square gacha JRPG water passive ability icon on a plain canvas, one solid-color round pearl held securely inside a thick open silver clam shell with three broad sapphire ridges, small blue sash ribbon tucked beneath the shell, quiet enduring protection represented by one compact shell emblem, cute rounded chibi-inspired symbolic shapes matching Tizu elemental character artwork, bold simple silhouette readable at small button size, minimal detail no scattered particles, complete shell pearl and ribbon occupying roughly two thirds of the square canvas, visible background-color gaps between shell ridges pearl and ribbon, clear solid background-color breathing margin on all four sides beyond the entire symbol and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated sapphire turquoise silver and pearl colors, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, water dome, numbers, letters, text, logo, watermark, interface, health bar, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 2. Undertow Thrust - Skill 1

**Mechanic:** 150% single-target damage; weakens the target's next two attacks by 25%.
**Symbol:** one diagonal spear with a narrow hooked undertow ribbon.
Suggested asset ID: `tizu-undertow-thrust`.

```text
square gacha JRPG water attack ability icon on a plain canvas, one straight silver spear angled diagonally from lower left to upper right with a single leaf-shaped spearhead a blue-wrapped shaft and complete visible butt and tip, one narrow turquoise water ribbon wraps once around the shaft then hooks backward beneath the tip suggesting an undertow pull, exactly two separated pearl droplets beside the spearhead, focused weakening thrust represented by one weapon symbol only, cute rounded chibi-inspired weapon shapes matching Tizu elemental character artwork, bold simple silhouette readable at small button size, complete spear and water ribbon occupying roughly two thirds of the square canvas, background-color gaps between shaft ribbon tip and droplets, clear solid background-color breathing margin on all four sides beyond the complete weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated sapphire turquoise silver and pearl colors, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, trident, sword, circular ocean vortex, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple spears, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 3. Tidal Shelter - Skill 2

**Mechanic:** gives living allies 25 shield at base; refreshes rather than stacks.
**Symbol:** a smooth protective water dome with one curled wave at its foot.
Suggested asset ID: `tizu-tidal-shelter`.

```text
square gacha JRPG water support ability icon on a plain canvas, one rounded opaque aqua water dome shaped like a protective bell with a thick sapphire outer rim and a clear background-color opening inside, one short turquoise wave curls along its base with a pearl highlight, calm shelter represented by one simple elemental barrier emblem with no occupants, cute rounded chibi-inspired magic shapes matching Tizu elemental character artwork, bold simple silhouette readable at small button size, minimal decoration no scattered particles, complete dome rim and base wave occupying roughly two thirds of the square canvas, background-color gaps within the dome and beneath the wave curl, clear solid background-color breathing margin on all four sides beyond the complete symbol and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated sapphire turquoise silver and pearl colors, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, shell, spear, ocean vortex, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 4. Last Flare: Ocean Memory - Ultimate

**Mechanic:** 220% damage to all enemies and 35 ally shield at base; recover next turn.
**Symbol:** one solid-color pearl encircled by two broad opposing tidal crescents.
The emblem does not add a summon or any new combat effect.
Suggested asset ID: `tizu-last-flare-ocean-memory`.

```text
square gacha JRPG ultimate water ability icon on a plain canvas, one vivid pearl orb at the center of two broad opposing sapphire and turquoise tidal crescents forming an open circular ocean-memory emblem, three rounded wave tips on each crescent and restrained prismatic aqua highlights, one short silver crest above the pearl, immense ocean burst and protective tide represented by a single elemental emblem not a literal sea creature, cute rounded chibi-inspired magic shapes matching Tizu elemental character artwork, most elaborate high-power icon in the set with a bold simple silhouette readable at small button size, complete pearl crescents and crest occupying roughly two thirds of the square canvas, broad background-color channels separating the pearl from both crescents and between wave tips, clear solid background-color breathing margin on all four sides beyond the complete emblem and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated sapphire turquoise pearl silver and restrained chromatic aqua colors, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, eyes, enemies, literal creature, spear, shell, water dome, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 5. Normal Attack - Basic Action

**Mechanic:** 100% single-target damage; +20 Shatter Gauge.
**Symbol:** a plain spear and one short motion stroke, without magical water.
Suggested asset ID: `tizu-normal-attack`.

```text
square gacha JRPG basic spear attack icon on a plain canvas, one plain straight practice spear angled diagonally from lower left to upper right with a silver leaf-shaped tip a simple dark-blue wooden shaft and short blue grip wrapping, complete spear butt and tip clearly visible, one short pale-silver motion stroke beside the tip indicating a straightforward thrust, no elemental magic, cute rounded chibi-inspired weapon shapes matching Tizu elemental character artwork, simplest bold silhouette in the set readable at small button size, complete spear and motion stroke occupying roughly two thirds of the square canvas, background-color gap separating stroke and spear, clear solid background-color breathing margin on all four sides beyond the complete weapon and stroke, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated blue silver and restrained pearl colors, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, water effects, droplets, shell, trident, sword, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple spears, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 6. Defense - Turn Action

**Mechanic:** consumes the action; reduces incoming damage 10% until the next
player turn. This is not Tidal Shelter and does not grant shield HP.
**Symbol:** one angular silver shield with a blue sash behind it.
Suggested asset ID: `tizu-defense`.

```text
square gacha JRPG defensive turn action icon on a plain canvas, one compact angular silver kite-shield emblem with a thick sapphire border and simple blue central stripe, one short blue sash ribbon folded behind its lower edge, steady defensive stance represented by a symbolic shield only not new character equipment, cute rounded chibi-inspired symbolic shapes matching Tizu elemental character artwork, bold solid geometric silhouette distinct from the shell passive and rounded water dome skill, complete shield and ribbon occupying roughly two thirds of the square canvas, visible background-color gaps beside both ribbon tails, clear solid background-color breathing margin on all four sides beyond the complete symbol, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated sapphire silver and pearl colors, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, shell, pearl orb, water dome, spear, healing, numbers, letters, text, logo, watermark, interface, health bar, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Art Stage 2 - Pearlcurrent Guard

**Escalation:** first metal spear, modest shell armor, a small controlled water trail.

```text
full-body gacha JRPG unit illustration on a plain canvas, one tiny male Aquatic water-element chibi spear guard, short blue hair blue eyes only with no other facial features recognizable blue waist sash white underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall, modest sapphire leather and silver shell armor small shoulder guards simple bracers and covered blue boots, one straight silver-tipped spear twice his body height with a blue-wrapped shaft single leaf-shaped spearhead and small pearl fitting, both hands holding the shaft in a grounded side-facing forward guard with one bent knee, a narrow turquoise water ribbon follows the spearhead with two separated droplets, full spear silhouette dominates while armor and magic stay restrained, entire character visible from head to feet at roughly one third of canvas height, complete spear visible from butt to tip with minimal foreshortening, visible background-color gaps between limbs sash spear and water trail, centered compact decorative composition, a clear solid background-color breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated sapphire turquoise silver and pearl colors, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, photorealism, 3d render, text, logo, watermark, multiple characters, trident, extra weapons, summoned creature, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Art Stage 3 - Tidalcrest Paladin

**Escalation:** shell filigree, larger wave blade, first iridescent pearl accents.

```text
full-body gacha JRPG unit illustration on a plain canvas, one tiny male Aquatic water-element chibi tidal paladin, short blue hair blue eyes only with no other facial features recognizable flowing blue waist sash white underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall, layered sapphire and silver plate armor with carved shell pauldrons pearl-set bracers scale-shaped greaves and a short flowing white cape, one enormous straight spear two and a half times his body height with silver shell filigree blue grip and one broad opaque wave-shaped spearhead, both hands thrusting the spear diagonally forward in a deep side-facing lunge with front knee bent rear foot visible, three separated turquoise water ribbons stream beyond the spear tip with pearl droplets, restrained painted opalescent facets on the blade and armor, weapon technique and ornate spear dominate rather than a sea creature, entire character visible from head to feet at roughly one third of canvas height, complete spear visible from butt to tip with minimal foreshortening, visible background-color gaps between limbs cape sash weapon and water ribbons, centered compact decorative composition, a clear solid background-color breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated sapphire turquoise silver pearl and pale aqua colors, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, photorealism, 3d render, text, logo, watermark, multiple characters, trident, extra weapons, summoned creature, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Art Stage 4 - Prismatic Wave Ascendant

**Escalation:** chromatic celestial armor, first angelic wave-fin wings, greater spear motion.

```text
full-body gacha JRPG unit illustration on a plain canvas, one tiny male Aquatic water-element chibi wave ascendant, short blue hair blue eyes only with no other facial features recognizable streaming blue waist sash white underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall, ornate sapphire pearl-white and silver armor with shell filigree opal scale inlays engraved gauntlets and articulated greaves, one colossal straight spear three times his body height with pearl-set silver fins blue grip and one enlarged layered crescent-wave spearhead with chromatic opaque aqua edges, both hands swinging the fully visible spear diagonally across his body in an airborne twisting sweep with one knee tucked and the other foot extended, separated turquoise and sapphire water crescents follow the blade while subtle rose and violet refractions appear along their edges, one pair of angelic wings formed from distinct opaque wave fins unfolds behind his shoulders, a small open pearl halo floats above his hair, spear remains the largest physical feature and action pose stays readable, entire character visible from head to feet at roughly one third of canvas height, complete spear visible from butt to tip with minimal foreshortening, visible background-color gaps between wings halo limbs sash weapon and water crescents, centered compact decorative composition, a clear solid background-color breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated sapphire aqua pearl silver and prismatic accent colors, plain solid orange background (#FF6600), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, photorealism, 3d render, text, logo, watermark, multiple characters, trident, extra weapons, summoned creature, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Art Stage 5 - Seraph of the Celestial Tide

**Escalation:** four tidal wings, rich pearl armor, prismatic heavenly water vortex.

```text
full-body gacha JRPG unit illustration on a plain canvas, one tiny male Aquatic water-element chibi celestial tide seraph, short blue hair blue eyes only with no other facial features recognizable blue waist sash unfurling around white underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall, intricate sapphire pearl-white and silver celestial plate armor with layered shell pauldrons opal mosaics engraved tidal motifs ornate gauntlets articulated greaves and a flowing opaque water mantle, one colossal ceremonial spear three times his body height with a straight silver shaft pearl ornaments fin-shaped fittings and one immense multi-layered wave spearhead, both hands driving the spear diagonally upward during an ascending corkscrew leap with both feet clearly visible, brilliant aqua water streams spiral along the shaft and unfurl past the blade with rose violet and pale gold prismatic fringes, four layered angelic wings made of separated opaque tidal fins frame his silhouette, a double open pearl halo floats above the blue hair, heavenly ocean energy grows larger than the previous stage without hiding spear grip face or athletic pose, entire character visible from head to feet at roughly one third of canvas height, complete spear visible from butt to tip with minimal foreshortening, visible background-color gaps between wing layers halo rings limbs sash shaft and spiraling streams, centered compact decorative composition, a clear solid background-color breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated sapphire turquoise pearl silver and chromatic heavenly colors, plain solid orange background (#FF6600), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, photorealism, 3d render, text, logo, watermark, multiple characters, trident, extra weapons, summoned creature, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Art Stage 6 - Eternal Heavenwater Sovereign

**Escalation:** ultimate celestial armor, six wave wings, supreme prismatic tidal spear.

```text
full-body gacha JRPG unit illustration on a plain canvas, one tiny male Aquatic water-element chibi eternal heavenwater sovereign, short blue hair blue eyes only with no other facial features recognizable long blue waist sash and white underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall, supreme sapphire pearl-white and silver celestial armor with dense but readable shell filigree chromatic opal scales crownlike fin pauldrons carved gauntlets articulated greaves and a flowing pearlescent tidal vestment, one monumental straight spear three and a half times his body height with a pearl-set silver shaft ornate wing-fin fittings and one enormous solid-color layered wave spearhead with a sapphire core and rainbow-refracting edges, both hands driving the spear diagonally downward in a suspended finishing thrust with one leg extended behind and both feet visible, brilliant heavenly water cascades from the spearhead into large separated turquoise sapphire rose violet and pale gold tidal crescents, six angelic wings made of opalescent wave fins frame the small figure in three pairs, intricate open concentric pearl halos hover above his blue hair, same recognizable spear-wielding traveler elevated to a heavenly ocean sovereign without becoming a different character, face hands blue sash armor and straight spear silhouette remain readable, entire character visible from head to feet at roughly one third of canvas height, complete spear visible from butt to tip with minimal foreshortening, visible background-color gaps between every wing halo ring limb weapon and cascading stream, centered compact decorative composition, a clear solid background-color breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated sapphire aqua pearl silver and rainbow-fringed celestial colors, plain solid orange background (#FF6600), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, photorealism, 3d render, text, logo, watermark, multiple characters, trident, extra weapons, summoned creature, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```
