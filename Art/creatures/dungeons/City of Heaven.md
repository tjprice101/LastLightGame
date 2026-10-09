# City of Heaven - Tranquilitic Art Pack

**Cutout background rule:** [Solid-color contract](../../guides/cutout-background-contract.md). Subject identity, design and elemental colors come first. End the prompt with a short plain solid, unlit background instruction; No glows or glowing visual effects: use opaque solid-color elemental lines, ribbons, rings and shapes with crisp edges; painted highlights are non-emissive. Never recolor the subject to suit the background. Arenas and banners remain scenery.

**Element:** Tranquilitic (Peace). Follow the [generation contract](README.md),
with reference-free enemy prompts under D-155. Eight distinct enemies, not
evolution forms. This elemental dungeon is separate from Soar into the Heavens;
Tranquilitic evolution infusion still belongs to Delve into the Abyss.
Peace emphasizes porcelain, balanced rings, lotus geometry and serene guardians,
not interchangeable light-energy wisps.

## Implemented monster lineup and drops

All eight enemies, six materials, banner and arena are now supplied and wired.
Original PNGs are preserved under `Art/source`; runtime files use canonical
filenames under `public/assets`. Background keying is offline only, with reviewed
pink keys per cutout and a separate orange border-connected key for the Crest.
The Shard uses a narrower key to preserve its red ribbons; the Seed uses a wider
key to remove pale pink glow spill. Existing owner-transparent replacements
are never keyed. Re-export with `python tools\prepare_dungeons.py --elements tranquilitic`.

| # | Monster | Runtime stages | Possible material rarities |
| --- | --- | --- | --- |
| 1 | Hushbud | 1-5 | Common; Uncommon from stage 5 |
| 2 | Bellcap Keeper | 6-9 | Common, Uncommon |
| 3 | Lotusback Tortoise | 10-14 | Common, Uncommon; Rare from stage 13 |
| 4 | Porcelain Crane | 15-18 | Common, Uncommon, Rare |
| 5 | Concord Lion | 19-22 | Common through Rare; Epic from stage 21 |
| 6 | Stillbell Oracle | 23-27 | Common through Epic |
| 7 | Harmonywing Kirin | 28-31 | Common through Epic; Legendary from stage 29 |
| 8 | Sovereign of the Unbroken Accord | 32-35 | Common through Legendary; Omnic at stage 35 |

Skills, in lineup order: Quiet Chime, Bellward Resonance, Lotus Shell Crush,
Porcelain Wingstorm, Concord Fang, Stillbell Mandala, Harmony Hornfall, Unbroken
Accord. Below level 50 each has one skill; at level 50+ ordinary enemies add
Overdrive and bosses add a heavy Last Ruin ultimate. Boss stages are multiples
of five. Names are editable in [the art manifest](../../../src/content/dungeon-art.ts);
damage, timing, growth and chances follow [runtime rules](../../../docs/gameplay-and-elements.md).
Seed is guaranteed; preserved Bloom/Shard/Crest/Heart/Soul level gates are
23/48/73/98/120, now floors5/13/21/29/35. Quantities and chances grow with level;
final odds are100%/98%/90%/80%/60%/35%, stacks80-160/40-80/20-40/12-24/6-12/3-6.
Rolls are independent per enemy, including
bosses. The Creature Glossary reveals this stage-specific table after a defeat.

### 1. Hushbud

```text
full-body chibi gacha JRPG enemy on plain canvas, one Hushbud peace sprite, oversized rounded pale jade head with soft blue eyes-only face, tiny torso and short limbs, plain ivory scarf, small wooden bell wand and one quiet ring, simplest serene creature, 2.5-3 heads tall, body one third of canvas height, complete body wand and effect visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, crown, ornate armor, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 2. Bellcap Keeper

```text
full-body chibi gacha JRPG enemy on plain canvas, one Bellcap Keeper shrine spirit, oversized rounded head with jade eyes-only face, tiny covered torso and short limbs, simple porcelain bell cap, pale blue tunic, ivory sash, small chime staff and two balanced ring shapes, modest peaceful city keeper, 2.5-3 heads tall, body one third of canvas height, complete silhouette equipment and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, crown, elaborate aura, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 3. Lotusback Tortoise

```text
full-body chibi gacha JRPG enemy on plain canvas, one Lotusback Tortoise, oversized rounded cream head with blue eyes-only face, compact body and four short legs, jade shell shaped like layered lotus petals, modest porcelain harness and two separated gentle ring arcs, calm armored guardian, body one third of canvas height, entire silhouette shell and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 4. Porcelain Crane

```text
full-body chibi gacha JRPG enemy on plain canvas, one Porcelain Crane, oversized rounded head with jade eyes-only face without beak, compact ivory-blue feather body and short legs, complete curved porcelain wings, pale jade crest and ornate bell collar, separated balanced blue ribbons, poised city sentinel, body one third of canvas height, entire silhouette wings and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, beak, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 5. Concord Lion

```text
full-body chibi gacha JRPG enemy on plain canvas, one Concord Lion mythological gate guardian, oversized rounded head with turquoise eyes-only face, compact porcelain body and four short legs, layered jade lotus mane, bronze-blue guardian armor, complete curled tail and separated tranquil ring loops, powerful serene champion, body one third of canvas height, entire silhouette mane tail and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 6. Stillbell Oracle

```text
full-body chibi gacha JRPG enemy on plain canvas, one Stillbell Oracle porcelain spirit, oversized rounded head with solid-color blue eyes-only face, tiny torso and short limbs, fully covered jade-ivory layered robes, complete lotus fan mantle, ornate chime staff, floating symmetrical bell crown and separated balanced ring arcs, epic peaceful oracle, 2.5-3 heads tall, body one third of canvas height, entire silhouette staff mantle and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 7. Harmonywing Kirin

```text
full-body chibi gacha JRPG enemy on plain canvas, one Harmonywing Kirin, oversized rounded head with pearl-blue eyes-only face, compact pale jade body and four short hooved legs, complete curved porcelain horn and layered lotus wings, regal bronze-ivory armor, floating bell crown and separated iridescent concentric ribbons, late-dungeon guardian, body one third of canvas height, entire silhouette horn wings and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 8. Sovereign of the Unbroken Accord

```text
full-body chibi gacha JRPG enemy on plain canvas, one Sovereign of the Unbroken Accord, oversized rounded head with jade-white eyes-only face, tiny torso and short limbs, fully covered porcelain-blue royal armor, immense complete lotus-and-bell mantle, ornate harmony staff, triple floating symmetrical crowns and separated prismatic concentric rings, spectacular final peace monarch with calm dignified pose, 2.5-3 heads tall, body one third of canvas height, entire silhouette weapon mantle and effects visible, background-color gaps and generous outer background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, complete silhouette stays inside a clear outer margin, nothing touches the frame edges, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, closeup, cropping, scenery, photorealism, 3d render, gore, text, logo, watermark, multiple characters, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Material drop icons

| Rarity | Item | Stable material ID |
| --- | --- | --- |
| Common | Seed of Tranquilitic | `tranquilitic-common` |
| Uncommon | Bloom of Tranquilitic | `tranquilitic-uncommon` |
| Rare | Shard of Tranquilitic | `tranquilitic-rare` |
| Epic | Crest of Tranquilitic | `tranquilitic-epic` |
| Legendary | Heart of Tranquilitic | `tranquilitic-legendary` |
| Omnic | Soul of Tranquilitic | `tranquilitic-omnic` |

### Common - Seed of Tranquilitic

```text
one collectible Seed of Tranquilitic item icon on plain canvas, tiny rounded porcelain seed with one pale jade ring seam, simplest peace material, cute chunky chibi fantasy object with clear blue-gray outline, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, readable at icon size, jewel-like painted color treatment within the stated palette, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Uncommon - Bloom of Tranquilitic

```text
one collectible Bloom of Tranquilitic item icon on plain canvas, porcelain seed opened into three rounded jade lotus petals, soft blue center and ivory tips, balanced symmetrical shape, cute chunky chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Rare - Shard of Tranquilitic

```text
one collectible Shard of Tranquilitic item icon on plain canvas, chunky bell-shaped jade crystal with porcelain core and soft blue facets, one detached balanced ring arc, cute chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, readable at icon size, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Epic - Crest of Tranquilitic

```text
one collectible Crest of Tranquilitic item icon on plain canvas, thick porcelain lotus medallion enclosing a jade bell prism, pale blue-rose prismatic facets and two separated symmetrical rings, cute chunky chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors, plain solid orange background (#FF6600), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Legendary - Heart of Tranquilitic

```text
one collectible Heart of Tranquilitic item icon on plain canvas, rounded jade-blue heart crystal inside an ornate porcelain lotus cradle, layered pearlescent facets and one separated balanced ring orbit, lavish serene but readable cute chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like painted color treatment within the stated palette, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no anatomical organ, face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Omnic - Soul of Tranquilitic

```text
one collectible Soul of Tranquilitic item icon on plain canvas, impossible floating lotus-bell prism with jade-white core, layered crystalline porcelain petals forming one symmetrical emblem, three separated balanced orbital rings, rich pastel rainbow refraction through dominant jade-ivory-blue facets, most magnificent peace material, cute chunky chibi fantasy object, centered complete silhouette occupying two thirds of canvas, generous background-color margin, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like painted color treatment within the stated palette, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, characters, scenery, cropping, photorealism, 3d render, text, logo, watermark, multiple items, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Dungeon banner splash - 3:1

Suggested export: **1800x600 PNG**, opaque. Runtime asset: `banners/city-of-heaven.png`;
the delivered landscape is retained at its original dimensions.

```text
ultrawide City of Heaven dungeon banner environment only, cutesy chibi fantasy serene porcelain city, rounded ivory rooftops and jade gardens, magnificent blue-porcelain bell gate on right third, symmetrical lotus architecture and soft peaceful daylight, left half calm low-detail blue-gray city wall for externally overlaid title and button, strongest light and detail right, landmark safely inset from edges, full-bleed scenery, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like colors --ar 3:1 --niji 6 --s 100 --q 1 --no characters, monsters, weapons, attack effects, text, logo, watermark, interface, frame, white background, blown-out highlights, photorealism, 3d render, gritty texture
```

## Battle arena background - 16:9

Suggested export: **1920x1080 PNG**, opaque. Runtime asset: `backgrounds/city-of-heaven.png`;
the delivered landscape is retained at its original dimensions.

```text
wide City of Heaven battle arena environment only, cutesy chibi fantasy peaceful porcelain courtyard, broad continuous level muted blue-gray tiled floor across lower half, unobstructed enemy standing zone left and team zone right at same height, clear central attack lane, quiet slate-blue backing behind pale units, distant symmetrical jade lotus arches and ivory bell towers high behind arena, decorative pools only beyond standing zones, calm top and bottom for UI, shallow side-view stage composition, full-bleed scenery, clean anime contours, crisp cel shading, smooth painted highlights, jewel-like painted color treatment within the stated palette --ar 16:9 --niji 6 --s 100 --q 1 --no characters, monsters, weapons, attack effects, text, logo, watermark, interface, foreground water, foreground obstacles, chasms, steep slopes, isometric view, white background, blown-out highlights, photorealism, 3d render, gritty texture
```
