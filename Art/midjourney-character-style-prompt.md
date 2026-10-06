# Last Light — Character Art Midjourney Prompt Guide

**Cutout background rule:** [Solid-color contract](cutout-background-contract.md). Subject identity, design and elemental colors come first. End the prompt with a short plain solid, unlit background instruction; No glows or glowing visual effects: use opaque solid-color elemental lines, ribbons, rings and shapes with crisp edges; painted highlights are non-emissive. Never recolor the subject to suit the background. Arenas and banners remain scenery.

For the new female fire greatsword starter, female grass bow starter, male water
spear starter, and three basic enemy prompts, see [Starter Art](Starter%20Art.md).
This guide remains the shared style reference.
For the actual starter identities' five new post-base art stages, see
[Infernis Art](Infernis%20Art.md), [Tizu Art](Tizu%20Art.md), and
[Flora Art](Flora%20Art.md). These preserve female Infernis/female Flora/male
Tizu and extend the examples with ornate chromatic celestial armor and elemental
weapons. The owner has now approved six gameplay forms and supplied all five
post-base portraits for each starter; the named lines are integrated.
For ten dungeon enemies in ascending visual power, see
[Flaming Depths](Flaming%20Depths.md). Those are distinct creatures, not evolutions.
For all ten elemental dungeons, see the [complete dungeon art packs](dungeons/README.md).
Each file combines monsters, Seed-to-Soul materials, banner and arena prompts.
For the ten framed element symbols, see [Element Emblems](Element%20Emblems.md).
For the unified gallery headers, see [Archives](Archives.md).
For Omnic-tier16:9 summoning artpieces, see [Summoning Banners](Summoning%20Banners.md).

Reference target: **compact gacha JRPG unit illustration**, matching the supplied pirate chibi reference, not a cinematic anime battle portrait. Use a rounded oversized head, tiny torso, short limbs, and approximately 2.5–3-head-tall proportions. The character must have **only eyes as facial features**: no nose, mouth, eyebrows, or other facial marks. Render with clean contours, crisp cel shading and smooth painted highlights, not gritty sketching. Use a **plain solid-color background** with no scenery, gradient, texture, or cast-shadow backdrop. Keep the entire character and weapon visible. Aim for the character itself to occupy roughly one third of the canvas height, while its weapon, flowing costume, and separate curling effects extend much farther around it. Leave background-color gaps between effects and a background-color margin around the whole illustration. Character renders use **4:3** (1:1 only if a square card asset is specifically needed).

---

## Shared style lock for every art pack

Rendering is shared; identity is not. Keep each authored name, species, palette,
weapon, clothing motif, material shape and evolution feature before the style
clause. Do not replace distinctive designs with generic angels, demons or gems.
Use clean precise anime contours, crisp cel shading, smooth painted highlights
and jewel-like colors within the subject's own palette. No splotchy ink fills,
photographic materials, gritty textures or cinematic character splash-art framing.

- Characters: oversized rounded heads, tiny torsos, short limbs, eyes-only faces;
  approximately2.5-3 heads tall, small body and complete weapon/effects at4:3.
- Creature anatomy stays species-specific: quadrupeds retain four legs, birds
  retain wings, and base slimes stay rounded and limbless. Apply compact chibi
  proportions, not a human skeleton, to these designs.
- Materials, ability icons and currencies: chunky readable objects at1:1,
  roughly two thirds of the canvas; no humanoid face or body requirements.
- Standalone weapons: retain their readable functional parts and3:2 framing,
  rendered with the same clean illustrated materials rather than ink showcases.
- Heaven/Abyss: stronger silhouette, thorns, armor, wings and halos may become
  elaborate, but the same slime identity, compact proportions and renderer remain.
- Scenery: full-bleed3:1 banners or16:9 arenas, matching linework/color treatment
  with their authored atmospheric lighting. Solid key backgrounds/no-glow cutout
  restrictions do not turn scenery into isolated icons.
  Summoning banners specifically use16:9 full-bleed Omnic-tier artpieces, not
  the3:1 dungeon/archive header format.

Use the same actual approved chibi reference across packs: append
`--sref <approved_reference_image_url> --sw 400` for cutouts or`--sw 200` for
scenery. Replace the placeholder; do not invent a reference URL. Existing
approved artwork must still be compared visually because text cannot guarantee
the generated result. These prompt edits do not repaint supplied runtime assets.

## Game-wide rarity tone: Common to Omnic

**Owner-confirmed direction:** As rarity rises, designs become less cutesy and
more epic, majestic, formidable and awe-inspiring. This applies across the game,
not just Conduits. The rendering style stays the same; compact proportions do
not require babyish designs or cute prompt language at higher rarities.

| Rarity | Design and prompt tone |
| --- | --- |
| Common | Simple, restrained and approachable; modest gear and limited ornamentation. |
| Uncommon | More capable and distinctive; emerging elemental identity and stronger silhouettes. |
| Rare | Impressive, commanding and heroic; developed equipment and elemental motifs. |
| Epic | Formidable, magnificent and battle-ready; dramatic poses and elaborate signature features. |
| Legendary | Majestic, extraordinary and awe-inspiring; masterful equipment and grand elemental structures. |
| Omnic | Supreme, transcendent elemental masterpiece; breathtaking presence and fully realized signature design. |

Progressively reduce words such as "cute", "adorable", "baby", "little",
"playful" and "toy-like" in high-rarity subject descriptions. Favor "formidable",
"majestic", "regal", "magnificent", "transcendent" and "awe-inspiring" where
appropriate to the subject. Escalate design, posture, weapons, machinery,
ornamentation and bounded elemental effects, not merely palette or adjective
count. Keep authored species, recognizable identity, palettes and elemental
themes intact; not every subject needs crowns, wings or the same ornamentation.

Do not interpret epic tone as realistic anatomy, gritty rendering, full-frame
cinematic splash art or a different art style. Preserve clean anime contours,
crisp cel shading, smooth painted highlights, compact species-appropriate
proportions, eyes-only character faces and complete silhouettes with padding.
Cutout backgrounds and non-emissive source-art rules remain in force.
Rarity, not star count alone, controls this tone; the current 5-star starters
still begin in restrained Common forms.

## Core Master Prompt (copy/paste base)

```
full-body gacha JRPG unit illustration on a plain canvas, one small [CHARACTER DESCRIPTION], rounded oversized head, tiny torso and short limbs, 2.5 to 3 heads tall, eyes are the only facial features, entire character visible from head to feet at roughly one third of canvas height, ornate [WEAPON/PROP] much larger than the character with its entire silhouette visible, flowing costume with gold trim, separate curling [ELEMENT COLOR] magic ribbons framing the small figure, background-color gaps between the effects, generous background-color margin around the complete illustration, clean precise contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors, compact decorative composition, plain solid [BACKGROUND COLOR] background ([BACKGROUND HEX]), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, closeup, portrait, bust, cropping, nose, mouth, eyebrows, scenery, horizon, vignette, gritty texture, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

> Swap the bracketed segments per character, including both background placeholders after choosing the subject palette. Keep subject identity and composition first; leave the background instruction last. Avoid adding "cinematic," "battle splash art," aggressive foreshortening, or full-frame flame backdrops: those can compete with the compact background-color-canvas composition.

### Negative-Space Rule for All Character Portraits

Keep a small but unmistakable solid background-color border on all four sides, outside the outermost weapon, costume, and elemental effects, not just around the character's body. Add this wording before the parameters in any character prompt:

```
centered composition, clear empty margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges
```

Later evolutions need not all conceal the character or summon another figure. Fire emphasizes enveloping elemental vestments; water emphasizes readable action poses and increasingly magnificent spear designs; grass emphasizes expanding wings and aura. Any concealment is intentional overlap, not cropping. Keep the eyes and signature clothing recognizable (fire's red scarf, water's blue sash, grass's green neckerchief), the complete weapon readable, and background-color gaps within the effects.

---

## Style Anchor Keywords (always include these)

Keep these priorities in every character prompt. They describe the target; text alone does not guarantee a match to the supplied image:

```
full-body gacha JRPG unit illustration, rounded oversized head, tiny torso, short limbs, eyes-only face, small character with complete head-to-feet silhouette, much larger ornate weapon, flowing costume, separate curling magic ribbons, visible gaps and outer margin, clean precise contours, crisp cel shading, smooth painted highlights, jewel-like colors
```

---

## Elemental Character Evolution Lines

Each line has six stages and keeps the same hair, eyes, signature clothing motif, and weapon type throughout. Stage 1 is intentionally plain: simple clothes, one basic weapon, and almost no effects. Evolution changes the pose and dominant design feature, not the character's body size. Fire grows into an enveloping flame vestment; water develops increasingly dynamic spear techniques and weapon ornamentation; grass develops increasingly elaborate wings and opaque leaf-shaped energy ribbons while its bow stays secondary. Apply the negative-space rule above to every portrait, including the basic forms. Append `--sref <reference_image_url> --sw 400` using the approved chibi style reference to each prompt.

### Fire: Ember Swordsman

#### Stage 1 - Ember Beginner

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short copper hair, amber eyes only, rounded oversized head and short limbs, plain cream tunic, small red scarf, brown boots, one simple wooden sword slightly taller than the character, one tiny orange spark, relaxed standing pose, extremely basic starter design, entire character and weapon visible, character roughly one third of canvas height, generous background-color margins, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, armor, filigree, crown, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 2 - Flame Knight

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short copper hair, amber eyes only, rounded oversized head and short limbs, cream tunic beneath red armor with modest gold trim, longer red scarf, brown boots, ornate flame-shaped sword twice the character's height, two orange fire ribbons framing a light airborne pose, entire character and weapon visible, character roughly one third of canvas height, background-color gaps between effects and generous background-color margins, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 3 - Phoenix Sovereign

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short copper hair, amber eyes only, rounded oversized head and short limbs, regal crimson and gold armor over cream fabric, enormous flowing red scarf and feathered cape, phoenix crown, magnificent gold-trimmed flame sword three times the character's height, vast orange and scarlet phoenix-shaped fire ribbons spreading around the tiny airborne figure, epic third evolution, entire character and weapon visible, character roughly one third of canvas height, background-color gaps between effects, centered composition with a clear solid background-color breathing margin on all four sides beyond the entire figure weapon and effects, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 4 - Inferno Ascendant

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short copper hair and amber eyes only, rounded oversized head and short limbs, same crimson and gold armor with flowing red scarf, immense layered phoenix-flame mantle rising above the figure, enormous ornate flame sword fully visible, orange and scarlet feather-shaped fire plumes becoming part of the costume and partially veiling the lower legs, head torso and scarf still clearly recognizable, elemental design larger and more elaborate than the previous evolution, small character within a centered decorative composition, background-color gaps between fire plumes, clear solid background-color breathing margin on all four sides beyond the entire figure weapon and effects, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 5 - Solar Phoenix Avatar

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short copper hair and amber eyes only, rounded oversized head and short limbs, same red scarf threading through regal crimson and gold armor, gigantic scarlet orange and white-gold phoenix wings formed from ornate curling fire feathers, layered solar halo and flame-petal mantle, enormous ornate flame sword fully visible outside the fire mantle, elemental forms dominate while overlapping and concealing most of the tiny torso and legs, face scarf and one sword-holding hand remain recognizable, more intricate and majestic than the previous evolution, entire figure positioned inside a centered decorative composition, background-color gaps between wings halo and flame ribbons, clear solid background-color breathing margin on all four sides beyond the entire figure weapon and effects, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 6 - Eternal Flame Divinity

```
full-body gacha JRPG unit illustration on plain canvas, the same tiny copper-haired amber-eyed chibi almost enveloped by an immense regal phoenix-shaped elemental vestment, eyes are the only facial features, a small recognizable face and flowing red scarf visible at its heart while nearly all armor torso and limbs are concealed by layered fire, magnificent scarlet orange and white-gold flame feathers, multiple nested sun halos and intricate gold-traced fire ribbons, enormous ceremonial flame sword entirely visible alongside the elemental form, ultimate evolution with the richest ornamentation and largest elemental silhouette in the line, the character remains tiny rather than becoming a giant, all physical and elemental forms contained inside a centered decorative composition, deliberate background-color gaps separating the many flame layers, clear solid background-color breathing margin on all four sides beyond the entire figure weapon and effects, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, rounded oversized head, short limbs, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Water: Tide Spearbearer

#### Stage 1 - Tide Beginner

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short blue hair, blue eyes only, rounded oversized head and short limbs, plain white tunic, small blue sash, simple sandals, one plain wooden spear slightly taller than the character, one small floating water droplet, relaxed standing pose, extremely basic starter design, entire character and weapon visible, character roughly one third of canvas height, generous background-color margins, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, armor, filigree, crown, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 2 - Wave Guardian

```
full-body gacha JRPG unit illustration on plain canvas, tiny blue-haired chibi with blue eyes only, rounded oversized head and short limbs, white tunic beneath light blue armor with silver trim, flowing blue sash, low wide-legged guard stance with both hands on a wave-tipped silver spear twice the character's height, spear held diagonally across the body without covering the face, one narrow turquoise wake following its tip, entire pose and complete spear visible, small character roughly one third of canvas height, clear background-color gaps and solid background-color breathing margins beyond the figure weapon and effects on all four sides, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 3 - Ocean Sovereign

```
full-body gacha JRPG unit illustration on plain canvas, tiny blue-haired chibi with blue eyes only, rounded oversized head and short limbs, sapphire and silver armor over white fabric, blue sash streaming backward, deep side-facing forward lunge with front knee bent and rear leg extended, both hands thrusting an ornate silver spear three times the character's height across the canvas, enlarged opaque wave-shaped spearhead with pearl inlays, turquoise water jet extending from the tip and scattered droplets tracing the thrust, weapon and action dominate rather than a summoned creature, entire figure spear and jet visible with minimal foreshortening, small character roughly one third of canvas height, background-color gaps and clear solid background-color breathing margins on all four sides beyond all effects, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 4 - Abyssal Ascendant

```
full-body gacha JRPG unit illustration on plain canvas, tiny blue-haired blue-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, streamlined sapphire and silver armor and flowing blue sash, airborne twisting sweep with one knee tucked and the other leg extended, both hands swinging an immense silver spear in a broad sideways arc, layered shell filigree and a wide crescent-wave spearhead, a sweeping turquoise water crescent traces the weapon path behind the figure, spear detailing and athletic silhouette more elaborate than the previous stage, complete shaft blade and both feet visible, small character within a centered decorative composition, background-color gaps between water trails and limbs, clear solid background-color breathing margins on all four sides beyond all effects, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 5 - Leviathan Avatar

```
full-body gacha JRPG unit illustration on plain canvas, tiny blue-haired blue-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, regal fitted sapphire and silver armor with flowing blue sash, ascending corkscrew leap with torso turned and legs scissored, both hands driving an enormous spear diagonally upward, magnificent layered tidal spearhead with pearl-set silver fins and opaque aqua edges, spiraling water ribbons follow the shaft and fan outward beyond the blade like a drilling vortex, spear is the largest and most detailed physical element, epic motion without concealing the face hands or leg pose, complete weapon and figure inside a centered composition, deliberate background-color gaps between vortex ribbons, clear solid background-color breathing margins on all four sides beyond all effects, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 6 - Eternal Tide Divinity

```
full-body gacha JRPG unit illustration on plain canvas, same tiny blue-haired blue-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, exquisite sapphire and silver armor with flowing blue sash, dramatic suspended downward finishing thrust in side-three-quarter view, torso leaning forward with one leg extended behind and the other folded, both hands driving a colossal ceremonial tidal spear diagonally downward, fully visible weapon with intricate pearl filigree and an enormous solid-color multi-layered wave spearhead, cascading turquoise and sapphire energy streams unfurl from the blade into a separated fan of tidal crescents, ultimate evolution focused on supreme spear mastery and spectacular weapon motion rather than another creature or concealing mantle, face hands and athletic body silhouette remain readable, tiny character dwarfed by weapon and its attack trail, all elements contained within a centered composition, background-color gaps between cascading streams and clear solid background-color breathing margins on all four sides, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

### Grass: Sprout Archer

#### Stage 1 - Sprout Beginner

```
full-body gacha JRPG unit illustration on plain canvas, tiny chibi with short moss-green hair, green eyes only, rounded oversized head and short limbs, plain beige tunic, small green neckerchief, brown boots, one simple wooden bow slightly taller than the character, one small floating leaf, relaxed standing pose, extremely basic starter design, entire character and weapon visible, character roughly one third of canvas height, generous background-color margins, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, armor, filigree, crown, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 2 - Leaf Warden

```
full-body gacha JRPG unit illustration on plain canvas, tiny moss-green-haired chibi with green eyes only, rounded oversized head and short limbs, beige tunic with modest green leaf armor and green neckerchief, first small pair of opaque leaf wings unfolding from the back, tiptoe balancing pose with one heel raised, simple leaf-carved bow held lowered and fully visible, distinct opaque lime ribbon shapes with a few drifting leaves, wings and aura are the new evolution features while the bow stays modest, entire character visible at roughly one third of canvas height, clear background-color gaps and solid background-color breathing margins on all four sides beyond the figure wings weapon and aura, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 3 - Verdant Sovereign

```
full-body gacha JRPG unit illustration on plain canvas, tiny moss-green-haired chibi with green eyes only, rounded oversized head and short limbs, emerald leaf armor over beige fabric with flowing green neckerchief, two large opaque leaf-veined wings spread wide, gentle hovering pose with knees bent and bow held loosely at one side, modest gold-trimmed vine bow fully visible, open emerald aura ring behind the wings with orbiting leaves and solid-color pollen, wing span exceeds the character and bow together, epic third evolution focused on flight and aura, small character roughly one third of canvas height, background-color gaps between wings and aura, clear solid background-color breathing margins on all four sides beyond all elements, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, jewel-like painted color treatment within the stated palette, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 4 - Wildgrowth Ascendant

```
full-body gacha JRPG unit illustration on plain canvas, tiny moss-green-haired green-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, emerald and gold leaf armor with green neckerchief streaming sideways, four layered leaf wings with gold-traced veins and grass-blade tips, banking sideways flight pose with one knee tucked and torso gently turned, modest living-vine bow held close with its string and limbs fully visible, sweeping lime and emerald aura wake trailing the wings with curled leaves and solid-color pollen dots, wings become more ornate while the aura follows the flight path, small character within a centered decorative composition, background-color gaps between wing layers and aura ribbons, clear solid background-color breathing margins on all four sides beyond all elements, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 5 - Worldbloom Avatar

```
full-body gacha JRPG unit illustration on plain canvas, tiny moss-green-haired green-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, emerald and gold leaf armor and flowing green neckerchief, six enormous solid-color leaf wings unfolding in an asymmetric ascending fan, upward-reaching flight pose with one arm lifted and legs trailing, modest gold-trimmed vine bow held lowered in the other hand with string and limbs fully visible, expanding flowering aura rings and emerald pollen streams trace the wing tips, fine gold veins and tiny blossoms enrich the wings, lower body partly veiled by solid-color leaf wisps while face and gesture stay recognizable, wings and aura dominate instead of weapon growth or a summoned figure, centered composition with background-color gaps between wing fans and rings, clear solid background-color breathing margins on all four sides beyond all elements, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

#### Stage 6 - Eternal Verdure Divinity

```
full-body gacha JRPG unit illustration on plain canvas, same tiny moss-green-haired green-eyed chibi, eyes are the only facial features, rounded oversized head and short limbs, regal emerald and gold leaf armor and green neckerchief, serene floating cross-legged pose with modest living-vine bow resting diagonally across the lap, complete bow string and limbs visible, magnificent multi-tiered leaf wings radiate from the back like an immense botanical mandala, intricate golden veins flowering wing tips and sweeping grass-blade feathers, vast separated emerald and lime aura rings with spiraling solid-color pollen dots and solid-color petals, ultimate evolution focused on spectacular wings and a vast array of solid-color aura rings, small face and neckerchief recognizable while opaque leaf ribbons partially veil the lower body, no separate summoned creature or tree figure, character remains tiny with wings far larger than the body, all elements inside a centered decorative composition, deliberate background-color gaps between wing tiers and aura rings, clear solid background-color breathing margins on all four sides beyond all elements, nothing touches the frame edges, clean anime contours, crisp cel shading, smooth painted highlights, tiny torso, compact 2.5 to 3 heads tall chibi proportions, physical character roughly one third of canvas height beneath its surrounding costume and effects, jewel-like painted color treatment within the stated palette, plain solid blue background (#0000FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --ar 4:3 --niji 6 --s 100 --q 1 --no photorealism, 3d render, nose, mouth, eyebrows, closeup, cropping, scenery, text, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

---

## Parameter Reference & Why

| Parameter | Value | Purpose |
|---|---|---|
| `--ar` | `4:3` | Wider frame gives the oversized costume/weapon/effects room to spread out so the character reads as genuinely small within the composition. Use `1:1` only when a square card/portrait asset is specifically required |
| `--niji 6` | — | Niji model is tuned for anime/illustration linework; far closer to gacha game art than default MJ model. Do not pair with `--style` tokens unless using Midjourney's own in-app niji style picker — typing `--style expressive`/`raw` etc. manually throws a "Style not compatible with niji 6" error. Leave `--style` off entirely for the default niji look |
| `--s` (stylize) | `100` starting point | Start lower while testing character layout or weapon anatomy; raise only after the silhouette and background-color margins are working |
| `--q` | `1` (max for niji 6) | Niji 6 only accepts `0.25`, `0.5`, or `1` — values like `--q 2` are invalid and will error |
| `--seed` | optional | Lock a seed once you find a result with the right line-weight/shading balance, then reuse it across new characters for consistency |
| `--cref` / `--cw` | optional | Use character reference on an approved hero to keep anatomy/proportions consistent across a whole roster |
| `--sref` | same approved chibi reference for all packs | Upload the approved reference first; append its actual URL with `--sw 400` for cutouts or `--sw 200` for scenery. The URL is not stored here; text alone cannot guarantee a match |

### Recommended consistency workflow
1. Upload the supplied pirate chibi reference to Midjourney and append `--sref <reference_image_url> --sw 400` to the character prompt. Use the desired reference, not the rejected dark swordsman results.
2. To also guide composition, place the reference image URL at the beginning of the prompt as an image prompt. This can carry over pirate details; a style reference alone does not lock layout.
3. Generate variants and inspect the actual result: complete head-to-feet figure, eyes-only face, small body compared with weapon and effects, and background-color gaps around the illustration. Numerical proportions in the prompt are targets, not enforced measurements.
4. Once an output matches, note its `--seed` and reuse the approved style reference across the roster. Use `--cref <image_url> --cw 100` only when preserving the same character's identity.

---

## Negative Prompt / Things to Avoid

Character prompts above already include `--no`. Merge additional unwanted traits into that list rather than appending a second `--no` parameter:

```
--no closeup, portrait, bust, cropping, nose, mouth, eyebrows, scenery, horizon, vignette, gritty texture, photorealism, 3d render, watermark, text, logo, multiple characters, off-white background, background gradient, background texture, background shadows, background gradients, background fading, background vignette, background lighting variation, key-color spill on subject
```

---

## Quick Checklist Before Submitting a Prompt

- [ ] `--ar 4:3` included (use `1:1` only for square card assets)
- [ ] `--niji 6` included (no `--style` flag appended after it)
- [ ] Compact chibi proportions specified (approximately 2.5–3 heads tall, rounded oversized head, tiny torso, short limbs)
- [ ] Complete character contained within the frame; fire may conceal the body, water preserves readable action stances, and grass prioritizes wings and aura while retaining recognizable eyes and signature clothing
- [ ] Clear solid background-color breathing margin on all four sides beyond the outermost weapon, costume, and effects; nothing touches the frame edges
- [ ] Weapon/costume/effects much larger than the character, with complete weapon visible and background-color gaps between effects
- [ ] Original rendering anchors included: clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like colors; no inky, gritty or cinematic splash-art rendering
- [ ] Character isolated on a plain solid-color background with no scenery, gradient, texture, or background shadows
- [ ] Eyes are the character's only facial features (no nose, mouth, eyebrows, or other facial marks)
- [ ] Unique color motif chosen for the character's elemental theme (flame=red/orange, void=purple/black, nature=green/gold, etc.) for roster variety
- [ ] Supplied target reference attached with `--sref`; actual output checked before locking the roster style

---

## Floating Gacha Weapon Showcase Prompts (3:2)

These standalone 3:2 images use **the same clean chibi gacha JRPG rendering as the original character examples**, adapted to equipment rather than a humanoid body. One ornate weapon floats unsupported in background-color empty space with crisp anime contours, cel-shaded material planes, smooth non-emissive painted highlights and jewel-like theme colors. Preserve its functional parts: swords have a grip, guard, and blade; firearm-style ranged weapons have a grip, trigger guard, receiver, barrel, and open muzzle. These are anatomy cues, not realistic engineering or a sniper silhouette. Gold, rose-gold, pink, and wood tones remain on their authored panels and ornamentation. Keep a clear background-color margin outside the entire weapon and all effects. This replaces the earlier splotchy ink-showcase direction without changing weapon identity.

> Check each result at thumbnail size: can you trace the complete weapon without mistaking energy for a physical part? Reject results with merged effects, detached ornamental pieces, gritty brush textures or effects crossing the contour. The background is flat and untextured; there is no physical support under the weapon.

For the god-slaying showcases, retain illustrated depth through beveled metal, recessed engravings, cel-shaded facets, non-emissive painted highlights and solid-color energy accents. Do not switch to broken ink fills, photographic materials or realistic proportions. Energy ribbons may sweep around the weapon in depth, but leave the grip, barrel, muzzle and outer silhouette readable. Keep the background-color backdrop and outer margins even at maximum energy.

### Midjourney Techniques for Readable Weapons and background-color Margins

1. **Put anatomy and framing first.** Name the weapon's parts before describing ornamentation or ink. Aim for the complete weapon and effects to occupy the central 70% of the canvas, with roughly 15% background-color padding on each side. These are compositional targets, not guaranteed measurements.
2. **Keep `--s 100`, matching the character and collectible prompts.** Greater power comes from authored ornamentation and silhouette, not a different renderer or higher stylization.
3. **Separate structure from the shared style.** In Discord, place a clear image of the desired weapon silhouette at the beginning of the prompt to guide content and composition. Append `--sref <approved_reference_image_url> --sw 400` using the same approved chibi reference as the characters. Do not use a melee image as the structure reference for a ranged weapon. On the web, assign the uploads to Image Prompt and Style Reference respectively.
4. **Adjust image influence only when an image prompt is present.** Start with `--iw 1`; increase cautiously if the anatomy drifts, since the reference can also carry over colors and details. Image-weight ranges vary by model version. `--iw` does not control `--sref`.
5. **Recover cropped results with the Editor or Zoom Out.** Expand the canvas around a good result and request a plain solid-color background. Inspect the result for newly invented parts. There is no `--margin` or `--zoom` prompt parameter, and `--ar 3:2` alone does not ensure padding.

References: [Image Prompts](https://docs.midjourney.com/hc/en-us/articles/32040250122381-Image-Prompts), [Style Reference](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference), and [Editor](https://docs.midjourney.com/hc/en-us/articles/32764383466893).

### Reusable Theme Template

```
chibi-inspired gacha JRPG equipment illustration, one [WEAPON TYPE] with clearly recognizable [FUNCTIONAL PARTS], floating unsupported in background-color empty space, centered three-quarter view, complete weapon and effects within the central 70 percent of the canvas, broad background-color padding on all four sides, ornate [THEME] motifs attached to one connected body, believable material depth and recessed engravings, crisp cel shading with black-and-white material panels and selective [THEME COLORS], crisp readable silhouette, clean painted material planes and smooth non-emissive highlights on the weapon itself, solid-color [ELEMENT] ribbons spiraling around it with background-color gaps, suspended solid-color spark marks and separate opaque ribbon shapes, crisp painted edge accents and hard-edged color facets, effects subordinate to the weapon silhouette, regal anime fantasy design, jewel-like painted color treatment within the stated palette, clean precise anime contours, plain solid [BACKGROUND COLOR] background ([BACKGROUND HEX]), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --no photorealism, table, pedestal, floor, scenery, photography, 3d render, people, hands, text, logo, cropping, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --ar 3:2 --niji 6 --s 100 --q 1
```

### 1) Wooden Sword

```
chibi-inspired gacha JRPG equipment illustration, one legendary wooden sword with a distinct wooden grip guard and blunt wooden blade, floating unsupported in background-color empty space, gentle diagonal display pose, complete pommel-to-tip silhouette within the central 70 percent of the canvas, broad background-color padding on all four sides, carved leaf motifs and stylized wood grain, warm brown and cream wood tones with crisp black-and-white cel shading, clean precise anime contours and smooth painted highlights within a crisp readable silhouette, fine-line carvings and soft painted edge highlights, sparse opaque gray decorative flecks separated from the sword, regal anime fantasy design matching the original compact chibi character rendering, jewel-like painted color treatment within the stated palette, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --no dense ink clouds, overlapping effects, detached fragments, table, pedestal, floor, scenery, photography, photorealism, 3d render, people, hands, text, logo, cropping, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --ar 3:2 --niji 6 --s 100 --q 1
```

### 2) Rose-Gold God-Slaying Ranged Weapon

```
chibi-inspired gacha JRPG equipment illustration, one original rose-gold god-slaying ranged weapon, elegant cohesive fantasy silhouette with a clearly identifiable barrel and open muzzle, coherent projectile-launching body and readable holding area, ornate anime proportions rather than a standard handgun layout, believable material depth, floating unsupported in background-color empty space, centered three-quarter view showing every functional part, complete weapon and effects within the central 70 percent of the canvas, broad background-color padding on all four sides, one connected readable silhouette, deeply engraved rose-petal filigree and fractured celestial sigils, black and silver-white metal with beveled edges and recessed details, rose-gold ornamental panels and pink enamel with rose-gold and pink outlines, richly dimensional crisp cel shading, clean painted material planes and smooth non-emissive highlights on the weapon itself, painted silver-white facets and solid pink edge accents, solid-color pink energy ribbons spiraling behind and around the weapon with clear background-color gaps, fine rose-gold sparks, drifting opaque spectral petal shapes and separate solid-color ribbons, solid pink painted accents across the metal, effects leave the barrel muzzle holding area and outer contour readable, regal ornamentation with controlled illustrated depth matching the original chibi character rendering, one weapon only, jewel-like painted color treatment within the stated palette, clean precise anime contours, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --no photorealism, dense ink clouds, detached weapon fragments, sword, cutting blade, pistol, revolver, sniper rifle, scope, military styling, table, pedestal, floor, scenery, photography, 3d render, people, hands, text, logo, cropping, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --ar 3:2 --niji 6 --s 100 --q 1
```

### 3) Gold God-Slaying Ranged Companion

Use the approved gold melee image only to guide shared ornamentation, not to replace the common chibi style reference or ranged silhouette. Append the same `--sref <approved_reference_image_url> --sw 400` used for other cutouts. This companion retains its regal gold identity but must read as a projectile-launching artifact rather than another melee weapon.

```
chibi-inspired gacha JRPG equipment illustration, one original royal gold god-slaying ranged weapon, elegant cohesive fantasy silhouette with a clearly identifiable barrel and open muzzle, coherent projectile-launching body and readable holding area, ornate anime proportions rather than a standard handgun layout, believable material depth, floating unsupported in background-color empty space, centered three-quarter view showing every functional part, complete weapon and effects within the central 70 percent of the canvas, broad background-color padding on all four sides, one connected readable silhouette, deeply engraved royal filigree crown motifs and fractured divine seals, black and silver-white metal with beveled edges and recessed details, rich gold ornamental panels and restrained pink jewels, richly dimensional crisp cel shading, clean painted material planes and smooth non-emissive highlights on the weapon itself, painted silver-white facets and solid gold edge accents, solid-color gold energy ribbons spiraling behind and around the weapon with clear background-color gaps, fine golden sparks, drifting opaque celestial mote shapes and separate solid-color ribbons, solid warm-colored painted accents across the metal, effects leave the barrel muzzle holding area and outer contour readable, regal ornamentation with controlled illustrated depth matching the original chibi character rendering, one weapon only, jewel-like painted color treatment within the stated palette, clean precise anime contours, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, elemental powers rendered as opaque solid-color lines ribbons rings and shapes with crisp hard edges, non-emissive painted highlights --no photorealism, dense ink clouds, detached weapon fragments, sword, axe, scythe, spear, bayonet, cutting blade, pistol, revolver, sniper rifle, scope, military styling, table, pedestal, floor, scenery, photography, 3d render, people, hands, text, logo, cropping, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill --ar 3:2 --niji 6 --s 100 --q 1
```
