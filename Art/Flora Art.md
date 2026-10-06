# Last Light - Flora Art

**Cutout background rule:** [Solid-color contract](cutout-background-contract.md). Subject identity, design and elemental colors come first. End the prompt with a short plain solid, unlit background instruction; No glows or glowing visual effects: use opaque solid-color elemental lines, ribbons, rings and shapes with crisp edges; painted highlights are non-emissive. Never recolor the subject to suit the background. Arenas and banners remain scenery.

Five copy/paste evolution prompts after Flora's beginner form in
[Starter Art](Starter%20Art.md), using the growing leaf-wing and aura themes
from the [character art guide](midjourney-character-style-prompt.md).

**Status:** all five evolved portraits are supplied and integrated as Evo.2-6.
Gameplay now has six forms, with caps 30 / 45 / 60 / 75 / 90 / 105.
Ability icons below are generation-ready prompts only; their art adds no mechanics.

## Identity and shared style

- Female Flora; short moss-green bob, green eyes, recognizable green neckerchief,
  beige underlayers and one bow with two visible limbs and one continuous string.
- Bow grows from leaf-carved wood to an ornate prismatic living relic. Leaf armor
  becomes increasingly detailed celestial regalia; wings/aura grow from a first
  small pair to six angelic leaf-feather wings. Wings dominate the magical
  silhouette while the bow remains a clearly readable secondary physical feature.
- Keep emerald/lime nature identity beneath pearl, gold and chromatic highlights.
  No fire, water weapon, summoned creature or adult-proportioned redesign.
- Compact chibi proportions, 2.5-3 heads tall, eyes-only face, body about one
  third of canvas height; plain solid-color canvas, visible internal gaps and outer margins.
- Every prompt uses `--ar 4:3 --niji 6 --s 100 --q 1` with one `--no`.
  Append `--sref <approved_reference_image_url> --sw 400` using the approved
  chibi reference shared with the starters and other evolution lines.
- Check generated results against supplied Flora art before accepting them;
  reject missing bowstrings, face-covering wings or effects merged into a backdrop.

## Ability icons - Shared style and generation instructions

These six icons match Flora's current kit and
[Infernis's icon style](Infernis%20Art.md#ability-icons---shared-style-and-generation-instructions).
Use rounded chibi-inspired shapes, precise anime contours, crisp cel shading,
smooth painted highlights and bold small-button silhouettes. Keep emerald,
lime, warm wood, beige and restrained gold as the main colors.

- Icons use **1:1**, not the character portraits' 4:3 ratio. One centered complete
  symbol occupies about two thirds of a plain solid-color square. Keep internal background-color
  gaps and outer background-color margins; no full character, scene, lettering or UI frame.
- Append `--sref <approved_reference_image_url> --sw 400` using the approved
  chibi reference. Keep `--niji 6 --s 100 --q 1`, one `--no`, no `--style`.
- Review all six together at small size; silhouette must distinguish the actions.
- Preserve originals under `Art/source/abilities/flora`; use 256px RGBA exports
  with 224px content and 16px padding, not unit-sprite sizing.
- Mechanics below describe Lv.0/Evo.1. Potency scales with progress, not icon art.
  Heavy Attack is retired and has no prompt.

### 1. Root of Hope - Passive

**Mechanic:** while Flora lives, heal living allies for 5% maximum HP at each new turn.
**Symbol:** one sprouting seed with two leaves and visible roots, no full flower.
Suggested asset ID: `flora-root-of-hope`.

```text
square gacha JRPG nature passive ability icon on a plain canvas, one rounded warm-brown seed opened around a fresh emerald sprout with exactly two broad lime leaves and three short curling gold-tipped roots visible below, small green neckerchief ribbon beneath the seed as an Element-Bearer motif, recurring hope and gentle growth represented by one rooted sprout emblem, cute rounded chibi-inspired symbolic shapes matching Flora elemental character artwork, bold simple silhouette readable at small button size, minimal detail no scattered pollen, complete seed leaves roots and ribbon occupying roughly two thirds of the square canvas, background-color gaps between roots leaves and ribbon, clear solid background-color breathing margin on all four sides beyond the complete symbol and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated emerald lime warm brown beige and restrained gold colors, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, flower, wings, bow, heart meter, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 2. Briar Shot - Skill 1

**Mechanic:** 150% single-target damage with +20 percentage points critical chance.
**Symbol:** one diagonal leaf-tipped arrow with a short thorn-vine accent.
Thorns are symbolic: this skill does not apply poison or a damaging status.
Suggested asset ID: `flora-briar-shot`.

```text
square gacha JRPG nature attack ability icon on a plain canvas, one straight warm-wood arrow angled diagonally from lower left to upper right with a single sharp emerald leaf-shaped arrowhead and two lime feather-shaped leaf fletchings, one short thorn-vine curl follows the shaft without covering it and one small gold glint beside the tip, precise critical briar shot represented by one arrow symbol only, cute rounded chibi-inspired weapon shapes matching Flora elemental character artwork, bold simple silhouette readable at small button size, complete arrowhead shaft fletchings and vine occupying roughly two thirds of the square canvas, background-color gaps separating vine thorns arrow and glint, clear solid background-color breathing margin on all four sides beyond the complete weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated emerald lime warm wood and gold colors, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, bow, poison, skull, blood, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple arrows, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 3. Verdant Renewal - Skill 2

**Mechanic:** restores 30 HP to each living ally at base; cannot revive.
**Symbol:** one open pearl-and-green blossom with an opaque solid-color healing droplet.
Suggested asset ID: `flora-verdant-renewal`.

```text
square gacha JRPG nature healing ability icon on a plain canvas, one rounded open blossom with five broad pearl-white petals edged in emerald and a bright lime center, one solid-color pale-gold dew droplet suspended just above the blossom and two simple green leaves beneath, restorative renewal represented by one compact flower emblem not a revival symbol, cute rounded chibi-inspired magic shapes matching Flora elemental character artwork, bold simple silhouette readable at small button size, minimal detail no scattered pollen, complete blossom droplet and leaves occupying roughly two thirds of the square canvas, clear background-color gaps between droplet flower petal tips and lower leaves, clear solid background-color breathing margin on all four sides beyond the complete symbol and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated emerald lime pearl beige and restrained gold colors, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, roots, seed, angel wings, bow, cross, numbers, letters, text, logo, watermark, interface, health bar, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 4. Last Flare: Worldseed - Ultimate

**Mechanic:** 180% damage to all enemies and 55 ally healing at base; recover next turn.
**Symbol:** one vivid worldseed with two sweeping leaf wings and an open floral halo.
The wings are an emblem, not a summon or new mechanic.
Suggested asset ID: `flora-last-flare-worldseed`.

```text
square gacha JRPG ultimate nature ability icon on a plain canvas, one vivid faceted emerald worldseed with a solid-color pearl core, two symmetrical sweeping lime and emerald leaf wings unfurl outward and upward with three broad rounded feather-shaped leaves on each side, one small open gold floral halo above the seed, restrained prismatic petal highlights, immense life burst represented by a single compact elemental emblem not a literal creature or landscape, cute rounded chibi-inspired magic shapes matching Flora elemental character artwork, most elaborate high-power icon in the set with a bold simple silhouette readable at small button size, complete seed leaf wings and halo occupying roughly two thirds of the square canvas, broad background-color channels separating seed from wings and each leaf layer and halo, clear solid background-color breathing margin on all four sides beyond the complete emblem and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated emerald lime pearl gold and restrained chromatic petal colors, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, eyes, enemies, literal creature, full tree, scenery, bow, roots, numbers, letters, text, logo, watermark, interface, card border, frame, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 5. Normal Attack - Basic Action

**Mechanic:** 100% single-target damage; +20 Shatter Gauge.
**Symbol:** one plain wooden bow with a single nocked arrow, no nature aura.
Suggested asset ID: `flora-normal-attack`.

```text
square gacha JRPG basic bow attack icon on a plain canvas, one simple warm-brown wooden bow with two clearly visible curved limbs and one continuous taut beige bowstring, one plain straight arrow nocked across its center with a small silver tip and green fletching, short green grip wrapping, complete bow tips bowstring arrowhead and fletchings visible, straightforward physical shot with no elemental magic, cute rounded chibi-inspired weapon shapes matching Flora elemental character artwork, simplest bold silhouette in the set readable at small button size, complete bow and arrow occupying roughly two thirds of the square canvas, generous background-color opening between bow limbs and string and beside arrow shaft, clear solid background-color breathing margin on all four sides beyond the complete weapon, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated warm wood beige emerald and restrained silver colors, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, magic aura, thorn vines, flowers, wings, extra bowstrings, numbers, letters, text, logo, watermark, interface, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple bows, multiple arrows, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### 6. Defense - Turn Action

**Mechanic:** consumes the action; reduces incoming damage 10% until the next player
turn. Does not heal, revive or grant shield HP.
**Symbol:** one angular leaf-patterned shield with a green neckerchief ribbon.
Suggested asset ID: `flora-defense`.

```text
square gacha JRPG defensive nature turn action icon on a plain canvas, one compact angular wooden kite-shield emblem with a thick emerald border and a single broad lime leaf inlay with one simple gold vein, one short green neckerchief ribbon folded behind the lower edge, braced defense represented by a symbolic shield only not new character equipment, cute rounded chibi-inspired symbolic shapes matching Flora elemental character artwork, bold solid geometric silhouette distinct from rooted sprout flower and winged worldseed, complete shield and ribbon occupying roughly two thirds of the square canvas, visible background-color gaps beside both ribbon tails, clear solid background-color breathing margin on all four sides beyond the complete symbol, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated emerald lime warm wood beige and restrained gold colors, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, enemies, roots, flower, seed, wings, bow, healing, numbers, letters, text, logo, watermark, interface, health bar, card border, frame, scenery, horizon, vignette, gritty texture, photorealism, 3d render, cropping, multiple icons, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Art Stage 2 - Leaflight Warden

**Escalation:** first leaf armor, carved bow, small opaque leaf wings.

```text
full-body gacha JRPG unit illustration on a plain canvas, one tiny female Efflorescent nature-element chibi bow warden, short moss-green bobbed hair green eyes only with no other facial features recognizable green neckerchief beige underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall, modest overlapping green leaf armor small wooden bracers brown boots and simple gold vein trim, one leaf-carved wooden bow slightly taller than her body with two curved limbs and one continuous taut bowstring fully visible, bow held lowered beside her body in a tiptoe balancing pose with both feet visible, first small pair of opaque lime leaf wings unfolds behind her shoulders, one narrow green aura ribbon and three separated floating leaves frame the pose, restrained first evolution with wings smaller than later forms and bow clearly separate from the body, entire character visible from head to feet at roughly one third of canvas height, complete bow visible from upper tip to lower tip with minimal foreshortening, visible background-color gaps between limbs neckerchief bowstring wings and leaves, centered compact decorative composition, a clear solid background-color breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated moss emerald lime beige and warm gold colors, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, photorealism, 3d render, text, logo, watermark, multiple characters, fire, extra weapons, summoned creature, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Art Stage 3 - Bloomcrest Paladin

**Escalation:** ornate vine bow, larger leaf wings, first pearlescent foliage.

```text
full-body gacha JRPG unit illustration on a plain canvas, one tiny female Efflorescent nature-element chibi bloom paladin, short moss-green bobbed hair green eyes only with no other facial features recognizable flowing green neckerchief beige underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall, layered emerald leaf plate armor with gold vein filigree petal shoulder guards carved vine bracers covered greaves and small pearl flower inlays, one ornate living-vine bow one and a half times her body height with gold-edged curved limbs a small emerald bud centerpiece and one continuous taut bowstring, bow held at her side during gentle hovering with both knees bent and both feet visible, one large pair of opaque leaf-veined wings spreads behind her wider than the bow, separated emerald and lime aura ribbons curl around the wing tips with solid-color pollen and pearlescent petals, wings and foliage more elaborate than the previous stage without covering her face or bowstring, entire character visible from head to feet at roughly one third of canvas height, complete bow visible from upper tip to lower tip with minimal foreshortening, visible background-color gaps between wings petals aura limbs neckerchief and bow, centered compact decorative composition, a clear solid background-color breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated emerald lime beige gold and pearl colors, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, photorealism, 3d render, text, logo, watermark, multiple characters, fire, extra weapons, summoned creature, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Art Stage 4 - Prismatic Garden Ascendant

**Escalation:** chromatic armor, four leaf wings, solid-color living bow.

```text
full-body gacha JRPG unit illustration on a plain canvas, one tiny female Efflorescent nature-element chibi garden ascendant, short moss-green bobbed hair green eyes only with no other facial features recognizable streaming green neckerchief beige underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall, ornate emerald pearl-white and gold leaf armor with opal petal inlays engraved vine gauntlets and articulated leaf greaves, one magnificent living-vine bow twice her body height with curling gold-traced leaf limbs pearl blossom fittings emerald core and one continuous solid-color taut bowstring, both hands holding the bow in a relaxed open guard during a banking hover with one knee tucked and both feet visible, four layered opaque leaf wings with feather-shaped tips and iridescent gold veins sweep behind her, separated lime emerald and pale rose aura ribbons follow the flight path with a few prismatic petals, a small open floral halo floats above her green hair, wings dominate the magical silhouette while the fully visible bow remains distinct and readable, entire character visible from head to feet at roughly one third of canvas height, complete bow visible from upper tip to lower tip with minimal foreshortening, visible background-color gaps between each wing layer halo limbs neckerchief bowstring and aura ribbon, centered compact decorative composition, a clear solid background-color breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated emerald lime pearl gold and chromatic rose aqua highlights, plain solid orange background (#FF6600), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, photorealism, 3d render, text, logo, watermark, multiple characters, fire, extra weapons, summoned creature, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Art Stage 5 - Seraph of the Heavenly Bloom

**Escalation:** six unfolding leaf wings, intricate celestial armor, vivid blossom bow.

```text
full-body gacha JRPG unit illustration on a plain canvas, one tiny female Efflorescent nature-element chibi heavenly bloom seraph, short moss-green bobbed hair green eyes only with no other facial features recognizable green neckerchief flowing over beige underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall, intricate emerald pearl-white and gold celestial leaf plate armor with overlapping petal pauldrons chromatic opal mosaics engraved vine motifs ornate fully covered gauntlets and greaves, one grand living-bough bow twice her body height with layered leaf-feather limbs gold filigree pearl blossom clusters emerald gemstone core and one continuous vivid taut bowstring, both hands drawing one solid-color leaf-shaped arrow diagonally upward in a gentle ascending hover with both feet visible, six unfolding angelic wings made of distinct opaque leaf feathers rise in three separated pairs behind her, brilliant lime and emerald aura ribbons with rose aqua violet and pale gold refractions fan around the wings, a double open floral halo and flowing prismatic petal mantle frame the small figure, archery hands arrow bowstring face and neckerchief remain fully readable, entire character visible from head to feet at roughly one third of canvas height, complete bow and arrow visible with minimal foreshortening, visible background-color gaps between all wings halo rings bow limbs arrow and aura ribbons, centered compact decorative composition, a clear solid background-color breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated emerald lime pearl gold and chromatic heavenly colors, plain solid orange background (#FF6600), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, photorealism, 3d render, text, logo, watermark, multiple characters, fire, extra weapons, summoned creature, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Art Stage 6 - Eternal Heavenbloom Sovereign

**Escalation:** fully expanded layered seraphic foliage, supreme celestial armor and bow.

```text
full-body gacha JRPG unit illustration on a plain canvas, one tiny female Efflorescent nature-element chibi eternal heavenbloom sovereign, short moss-green bobbed hair green eyes only with no other facial features recognizable long green neckerchief and beige underlayers, rounded oversized head tiny torso short limbs 2.5 to 3 heads tall, supreme emerald pearl-white and white-gold celestial armor with dense but readable leaf-vein filigree chromatic opal petals crownlike blossom pauldrons carved vine gauntlets articulated greaves and an elegant solid-color foliage vestment, one magnificent living worldbloom bow two and a half times her body height with ornate branching leaf-feather limbs gold lattice details pearl blossoms vivid emerald core and one continuous rainbow-fringed taut bowstring, both hands drawing one solid-color prismatic leaf arrow in a serene floating finishing pose with both feet visible, six fully expanded angelic wings of layered opalescent leaf feathers spread in three majestic pairs with long separated vine streamers, brilliant emerald and lime heavenly nature energy unfurls into large separated rose aqua violet and pale gold petal crescents around the wings, intricate open concentric floral halos hover above her green hair, same recognizable small green-neckerchief archer rather than a different goddess, grand wings dominate the magic while face hands ornate bowstring arrow and armor stay clearly readable, entire character visible from head to feet at roughly one third of canvas height, complete bow and arrow visible with minimal foreshortening, visible background-color gaps between every wing halo ring vine streamer limb weapon and petal crescent, centered compact decorative composition, a clear solid background-color breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated emerald lime pearl gold and rainbow-fringed celestial colors, plain solid orange background (#FF6600), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, photorealism, 3d render, text, logo, watermark, multiple characters, fire, extra weapons, summoned creature, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```
