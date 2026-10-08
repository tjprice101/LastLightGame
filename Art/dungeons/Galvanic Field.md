# Galvanic Field - Voltaic Art Pack

**Cutout background rule:** [Solid-color contract](../cutout-background-contract.md). Subject identity, design and elemental colors come first. End the prompt with a short plain solid, unlit background instruction; No glows or glowing visual effects: use opaque solid-color elemental lines, ribbons, rings and shapes with crisp edges; painted highlights are non-emissive. Never recolor the subject to suit the background. Arenas and banners remain scenery.

**Element:** Voltaic (Electricity). Follow the [generation contract](README.md),
including the approved style-reference suffix. Eight distinct enemies, not
evolution forms. Lightning emphasizes cobalt, violet, gold and branching arcs.

## Implemented monster lineup and drops

All eight enemies, six Voltaic materials, banner and arena are supplied and wired.
Original PNGs are preserved under `Art/source`; runtime files use canonical
filenames under `public/assets`. Reviewed green/teal keying runs offline only.
The Bloom, Seed and Soul use wider spill cleanup; masks protect painted green
metal highlights on the Seed and pale crystal facets on the Soul.
Re-export with `python tools\prepare_dungeons.py --elements voltaic`.

| # | Monster | Runtime stages | Possible material rarities |
| --- | --- | --- | --- |
| 1 | Sparkpip | 1-5 | Common; Uncommon from stage 5 |
| 2 | Coppercap Gremlin | 6-9 | Common, Uncommon |
| 3 | Coilback Scarab | 10-14 | Common, Uncommon; Rare from stage 13 |
| 4 | Stormhorn Faun | 15-18 | Common, Uncommon, Rare |
| 5 | Thunderclaw Raiju | 19-22 | Common through Rare; Epic from stage 21 |
| 6 | Tempestwing Roc | 23-27 | Common through Epic |
| 7 | Crowncoil Kirin | 28-31 | Common through Epic; Legendary from stage 29 |
| 8 | Sovereign of the Living Storm | 32-35 | Common through Legendary; Omnic at stage 35 |

Skills, in lineup order: Twig Spark, Copper Chime Surge, Coil Discharge,
Stormhorn Arc, Thunderclaw Rend, Tempest Wingstrike, Crowncoil Judgment,
Living Storm. Below level 50 each has one skill; at level 50+ ordinary enemies
add Overdrive and bosses add a heavy Last Ruin ultimate. Boss stages are
multiples of five. Names are editable in [the art manifest](../../src/content/dungeon-art.ts);
damage, timing, growth and chances follow [runtime rules](../../docs/gameplay-and-elements.md).
Seed is guaranteed; preserved Bloom/Shard/Crest/Heart/Soul level gates are
23/48/73/98/120, now floors5/13/21/29/35. Quantities and chances grow with level;
final odds are100%/98%/90%/80%/60%/35%, stacks80-160/40-80/20-40/12-24/6-12/3-6.
Rolls are independent per enemy, including
bosses. The Creature Glossary reveals this stage-specific table after a defeat.

### 1. Sparkpip

```text
full-body chibi gacha JRPG enemy on plain canvas, one Sparkpip lightning sprite, oversized rounded yellow head with blue eyes-only face, tiny torso and short limbs, plain cobalt scarf, small copper twig wand and one spark, simplest electrical creature, 2.5-3 heads tall, body one third of canvas height, complete body wand and spark visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, crown, ornate armor, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871546949782/Unit_ills_full_10013.webp?ex=6ac8636c&is=6ac711ec&hm=ad01070e9a0cdbe9241bb98a758ed8329911ae4bb5b04629c636c13421e2fd73&=&format=webp&width=1123&height=778 --sw 400
```

### 2. Coppercap Gremlin

```text
full-body chibi gacha JRPG enemy on plain canvas, one Coppercap Gremlin, oversized rounded violet head with gold eyes-only face, tiny covered torso and short limbs, dented copper cap, blue overalls, small tuning-fork staff and two separated sparks, modest storm scavenger, 2.5-3 heads tall, body one third of canvas height, complete silhouette equipment and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, crown, elaborate aura, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 --sw 400
```

### 3. Coilback Scarab

```text
full-body chibi gacha JRPG enemy on plain canvas, one Coilback Scarab, oversized rounded cobalt head with amber eyes-only face without mandibles, compact shell body and short legs, copper coil ridges, yellow crystal horn and two short separated electrical arcs, armored field guardian, body one third of canvas height, complete silhouette antennae and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, mandibles, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 --sw 400
```

### 4. Stormhorn Faun

```text
full-body chibi gacha JRPG enemy on plain canvas, one Stormhorn Faun, oversized rounded head with violet eyes-only face, tiny covered torso and short hooved limbs, branching copper horns, cobalt tunic and gold bracers, complete forked lightning spear, two separated violet-gold arcs, confident electrical warrior, 2.5-3 heads tall, body one third of canvas height, entire silhouette weapon horns and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599871962447964/Unit_ills_full_10014.webp?ex=6ac8636c&is=6ac711ec&hm=99afb1dca2bd114e5284f0e9d799d3dc70a10a4335f2f66172a128ce1a12f8f5&=&format=webp&width=1022&height=778 --sw 400
```

### 5. Thunderclaw Raiju

```text
full-body chibi gacha JRPG enemy on plain canvas, one Thunderclaw Raiju mythological storm beast, oversized rounded foxlike head with gold eyes-only face, compact cobalt body and four short legs, complete zigzag tail, copper claw guards, layered violet mane and separated lightning loops, powerful field champion, body one third of canvas height, entire silhouette tail and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599872381624371/Unit_ills_full_10015.webp?ex=6ac8636c&is=6ac711ec&hm=461c4602b0b28386e1373a9e4eaf081bb56cc69163fed126952c4065e45aa3c7&=&format=webp&width=950&height=778 --sw 400
```

### 6. Tempestwing Roc

```text
full-body chibi gacha JRPG enemy on plain canvas, one Tempestwing Roc, oversized rounded head with sapphire eyes-only face without beak, compact cobalt feather body and short taloned legs, huge complete gold-violet wings, copper crest, floating lightning crystals and separated electrical feather arcs, epic thunder guardian, body one third of canvas height, entire silhouette wings and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, beak, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599872771686440/Unit_ills_full_10016.webp?ex=6ac8636c&is=6ac711ec&hm=47e8c081f934e035f43da638a09d14991a90521cbfd7d4794d113c7bdf3891f7&=&format=webp&width=956&height=778 --sw 400
```

### 7. Crowncoil Kirin

```text
full-body chibi gacha JRPG enemy on plain canvas, one Crowncoil Kirin, oversized rounded head with vivid gold eyes-only face, compact cobalt-violet body and four short hooved legs, complete branched crystal horn and flowing thunder tail, ornate copper armor, floating coil crown and separated rainbow lightning ribbons, regal late-dungeon storm guardian, body one third of canvas height, entire silhouette horn tail and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557599872771686440/Unit_ills_full_10016.webp?ex=6ac8636c&is=6ac711ec&hm=47e8c081f934e035f43da638a09d14991a90521cbfd7d4794d113c7bdf3891f7&=&format=webp&width=956&height=778 --sw 400
```

### 8. Sovereign of the Living Storm

```text
full-body chibi gacha JRPG enemy on plain canvas, one Sovereign of the Living Storm, oversized rounded horned head with white-gold eyes-only face, tiny torso and short limbs, fully covered cobalt-gold royal armor, huge complete lightning-feather mantle, ornate thunderbolt halberd, triple copper coil crowns and separated prismatic branching arcs, spectacular final electricity monarch, 2.5-3 heads tall, body one third of canvas height, entire silhouette weapon mantle and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --sref https://media.discordapp.net/attachments/1006667219217952879/1557598570910060564/Unit_ills_full_10017.webp?ex=6ac86236&is=6ac710b6&hm=a25734b8c781314dc6db6923c2449ecf97638d2bfa73032b17862cfa75932654&=&format=webp&width=817&height=778 --sw 400
```

## Material drop icons

| Rarity | Item | Stable material ID |
| --- | --- | --- |
| Common | Seed of Voltaic | `voltaic-common` |
| Uncommon | Bloom of Voltaic | `voltaic-uncommon` |
| Rare | Shard of Voltaic | `voltaic-rare` |
| Epic | Crest of Voltaic | `voltaic-epic` |
| Legendary | Heart of Voltaic | `voltaic-legendary` |
| Omnic | Soul of Voltaic | `voltaic-omnic` |

### Common - Seed of Voltaic

```text
one collectible Seed of Voltaic item icon on plain canvas, tiny rounded copper seed with a single yellow lightning seam, simplest electricity material, cute chunky chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, readable at icon size, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Uncommon - Bloom of Voltaic

```text
one collectible Bloom of Voltaic item icon on plain canvas, copper seed opened into three rounded yellow crystal petals, small cobalt core and modest violet spark tips, cute chunky chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Rare - Shard of Voltaic

```text
one collectible Shard of Voltaic item icon on plain canvas, chunky lightning-bolt crystal with yellow core and cobalt-violet facets, one detached copper spark arc, cute chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, readable at icon size, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Epic - Crest of Voltaic

```text
one collectible Crest of Voltaic item icon on plain canvas, thick copper coil medallion enclosing a gold thunderbolt prism, violet-cyan rainbow edges and two detached electrical arcs, cute chunky chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Legendary - Heart of Voltaic

```text
one collectible Heart of Voltaic item icon on plain canvas, rounded violet-gold heart crystal in an ornate copper coil cradle, bright blue electrical center, layered rainbow facets and one separated lightning orbit, lavish but readable cute chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no anatomical organ, face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Omnic - Soul of Voltaic

```text
one collectible Soul of Voltaic item icon on plain canvas, impossible floating thunderbolt prism with gold-white core, layered crystalline bolt wings forming one emblem, three separated copper orbital coils, rich rainbow refraction through dominant yellow-cobalt-violet facets, most magnificent electricity material, cute chunky chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Dungeon banner splash - 3:1

Suggested export: **1800x600 PNG**, opaque. Runtime asset: `banners/galvanic-field.png`;
the delivered landscape is retained at its original dimensions.

```text
ultrawide Galvanic Field dungeon banner environment only, cutesy chibi fantasy storm plateau, rounded cobalt rocks and distant violet clouds, ornate copper coil gateway with contained golden lightning on right third, small blue crystals far behind, left half calm low-detail indigo stone for externally overlaid title and button, strongest light and detail right, landmark safely inset from edges, full-bleed scenery, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors --ar 3:1 --niji 6 --s 100 --q 1 --no characters, monsters, weapons, attack effects, text, logo, watermark, interface, frame, white background, photorealism, 3d render, gritty texture
```

## Battle arena background - 16:9

Suggested export: **1920x1080 PNG**, opaque. Runtime asset: `backgrounds/galvanic-field.png`;
the delivered landscape is retained at its original dimensions.

```text
wide Galvanic Field battle arena environment only, cutesy chibi fantasy storm courtyard, broad continuous level muted-indigo stone floor across lower half, unobstructed enemy standing zone left and team zone right at same height, clear central attack lane, quiet cobalt backing behind units, copper coil towers and contained yellow lightning only high in distant background, calm top and bottom for UI, shallow side-view stage composition, full-bleed scenery, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like painted color treatment within the stated palette --ar 16:9 --niji 6 --s 100 --q 1 --no characters, monsters, weapons, attack effects, text, logo, watermark, interface, foreground lightning, foreground obstacles, chasms, steep slopes, isometric view, white background, photorealism, 3d render, gritty texture
```
