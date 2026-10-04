# Last Light - Flaming Depths

Ten copy/paste Midjourney enemy prompts for the first planned dungeon,
**Flaming Depths**. Match [Starter Art](Starter%20Art.md) and the
[elemental character style guide](midjourney-character-style-prompt.md).

**Status:** prompts retained; the owner has supplied all ten matching enemy images.
Originals are organized under `Art/source/enemies`; transparent standardized copies
are under `public/assets/enemies`. See [asset paths](../docs/art-workflow.md#flaming-depths-enemy-art)
and the [Stage 1-50 design proposal](../docs/flaming-depths-stages.md).
Dungeon gameplay/captures are not implemented. The list runs from weakest-looking
to strongest-looking. These are ten
distinct enemies, not ten evolution forms; captured enemies cannot evolve.
Order is relative visual power, not an approved level, wave, rarity, or stat table.
Dungeon and capture rules are tracked in [Dungeons and captures](../docs/dungeons-and-captures.md).
For the 3:1 dungeon banner and 16:9 combat environment prompts, see
[Flaming Depths Scenery](Flaming%20Depths%20Scenery.md).

## Shared style and generation instructions

- Compact chibi gacha JRPG units: rounded oversized heads, tiny torsos, short limbs,
  approximately 2.5-3 heads tall. Eyes are the only facial features; horns, ears,
  scales, and crests define silhouettes without noses, mouths, or eyebrows.
- Clean precise anime contours, crisp cel shading, smooth painted highlights,
  jewel-like saturated colors. Cute mythological designs, never realistic horror.
- Solid pure-white 4:3 canvas. Complete head-to-feet silhouette, weapons, wings,
  tails, and effects visible. Body approximately one third of canvas height.
  White gaps separate effects; leave a clear white breathing margin on all sides.
- Power increases through silhouette, equipment, and controlled elemental effects,
  NOT through larger body scale or a different rendering style. Later enemies may
  have ornate armor, crowns, wings, and auras; the first entries remain plain.
- For every prompt append `--sref <approved_reference_image_url> --sw 400`,
  replacing the placeholder with the same approved chibi reference used previously.
  That reference URL is not stored in the workspace.
- Retain `--ar 4:3 --niji 6 --s 100 --q 1`. Do not add a `--style` flag or a second
  `--no` parameter. Merge any extra exclusions into the existing exclusion list.
- Text alone cannot guarantee a style match. Compare results beside approved art.
  Keep originals under `Art/source/enemies`; approved runtime copies use the
  standard 960x960 transparent export workflow, not the raw white-canvas image.

## Enemies - ascending visual power

### 1. Ashling - Soot Sprite

**Silhouette:** tiny charcoal sprite, floppy pointed ears, oversized amber eyes,
ragged scarf, a twig club, and one ember. The simplest dungeon inhabitant.
Suggested future asset ID: `ashling`.

```text
full-body gacha JRPG unit illustration on a solid pure-white canvas, one tiny mythological soot sprite enemy called an Ashling, soft charcoal-gray body, rounded oversized head with two floppy pointed ears, amber eyes only with no other facial features, tiny torso and short limbs, 2.5 to 3 heads tall, plain ragged rust-red scarf and simple brown cloth wrap, small round bare feet, one crude twig club held lowered at its side with the complete handle and club head visible, one tiny floating orange ember, shy grounded standing pose, extremely basic low-power enemy design with no armor or ornate accessories, entire character visible from head to feet at roughly one third of canvas height, centered compact decorative composition, visible white gaps between body club and ember, a clear solid-white breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, crown, wings, halo, elaborate aura, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, gore, text, logo, watermark, multiple characters
```

### 2. Coalcap Kobold - Cave Scavenger

**Silhouette:** cinnamon-red kobold, small blunt horns, a coal-black cap, leather
apron, and chipped stone pick. Slightly more equipped, still a common enemy.
Suggested future asset ID: `coalcap-kobold`.

```text
full-body gacha JRPG unit illustration on a solid pure-white canvas, one tiny basic mythological cave kobold enemy, cinnamon-red skin, rounded oversized head with two small blunt horns and large pointed ears, bright copper eyes only with no other facial features, tiny torso and short limbs, 2.5 to 3 heads tall, floppy coal-black cloth cap tucked between the horns, plain brown leather apron over a fully covered tan tunic and trousers, simple wrapped boots, one chipped stone mining pick with a short wooden handle held diagonally beside the body without covering the face, complete pick handle and stone head visible, one small orange ember caught beside the pick, alert grounded standing pose, modest low-power scavenger design with minimal equipment, entire character visible from head to feet at roughly one third of canvas height, centered compact decorative composition, visible white gaps between body pick and ember, a clear solid-white breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, ornate armor, crown, wings, halo, elaborate aura, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, gore, text, logo, watermark, multiple characters
```

### 3. Emberhorn Faun - Furnace Skirmisher

**Silhouette:** russet faun with small curled horns and hooves, a short red cape,
bronze shoulder guard, and ember-tipped javelin. First clear combatant silhouette.
Suggested future asset ID: `emberhorn-faun`.

```text
full-body gacha JRPG unit illustration on a solid pure-white canvas, one tiny mythological fire faun skirmisher enemy, soft russet fur, rounded oversized head with two small curled ram horns and pointed ears, golden eyes only with no other facial features, tiny torso and short limbs, 2.5 to 3 heads tall, fully covered cream tunic with brown belt, short red cape, one simple bronze shoulder guard, small cloven hooves, one straight bronze-tipped javelin slightly taller than the character held upright beside the body with its complete butt shaft and tip visible, a tiny orange flame curling around the spear tip, confident grounded guard pose, modest mid-low-power warrior design with readable restrained equipment, entire character visible from head to hooves at roughly one third of canvas height, centered compact decorative composition, visible white gaps between body javelin cape and flame, a clear solid-white breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, crown, wings, halo, full-frame fire, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, gore, text, logo, watermark, multiple characters
```

### 4. Furnace Salamander - Flameblade Guard

**Silhouette:** upright coral salamander with a visible curled tail, segmented
bracers, black-orange tunic, and flame-shaped saber with a short fire ribbon.
Suggested future asset ID: `furnace-salamander`.

```text
full-body gacha JRPG unit illustration on a solid pure-white canvas, one tiny upright mythological fire salamander guard enemy, smooth coral-red scales, rounded oversized head with a small ember crest, luminous yellow eyes only with no other facial features, tiny torso and short limbs, 2.5 to 3 heads tall, complete short curled tail visible beside the body, fully covered black-and-orange tunic, modest bronze segmented bracers and shin guards, one flame-shaped bronze saber larger than the character held outward beside the body without covering the face, entire saber visible from pommel to tip, one short separate orange fire ribbon following the blade, poised grounded duelist stance, medium-power enemy with more refined equipment than a cave skirmisher, entire character visible from head to feet at roughly one third of canvas height, centered compact decorative composition, visible white gaps between body tail saber and fire ribbon, a clear solid-white breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, gigantic body, full-frame fire, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, gore, text, logo, watermark, multiple characters
```

### 5. Cinderhide Cyclops - Forge Bruiser

**Silhouette:** one luminous eye, basalt-gray skin, iron shoulder plates, red sash,
and a large furnace hammer with molten orange accents. Broader, not taller.
Suggested future asset ID: `cinderhide-cyclops`.

```text
full-body gacha JRPG unit illustration on a solid pure-white canvas, one tiny mythological forge cyclops enemy, basalt-gray skin, rounded oversized head with exactly one large luminous amber eye as its only facial feature, tiny broad torso and short sturdy limbs, 2.5 to 3 heads tall, fully covered dark leather tunic and trousers, angular iron shoulder plates with bronze edges, vivid red waist sash, heavy wrapped boots, one enormous square furnace hammer twice the character height with a fully visible long handle and oversized hammer head, molten-orange decorative channels on the hammer head, both hands holding the handle beside the body without covering the eye, two small separate ember curls around the hammer, sturdy grounded guard pose, strong mid-power armored bruiser design while retaining tiny chibi body scale, entire character visible from head to feet at roughly one third of canvas height, centered compact decorative composition, visible white gaps between body hammer sash and effects, a clear solid-white breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors --ar 4:3 --niji 6 --s 100 --q 1 --no second eye, nose, mouth, eyebrows, facial markings, full-frame fire, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, gore, text, logo, watermark, multiple characters
```

### 6. Obsidian Gargoyle - Vault Sentinel

**Silhouette:** small horned stone sentinel, complete folded wings, gilded stone
armor, hooked halberd, and two separated magma ribbons. First winged design.
Suggested future asset ID: `obsidian-gargoyle`.

```text
full-body gacha JRPG unit illustration on a solid pure-white canvas, one tiny mythological obsidian gargoyle sentinel enemy, smooth dark-purple stone body, rounded oversized head with two swept-back horns, ruby eyes only with no other facial features, tiny torso and short limbs, 2.5 to 3 heads tall, two compact folded stone wings fully visible behind the shoulders with clear gaps from the body, gilded angular stone breastplate and bracers over dark cloth, small claw-shaped stone feet, one ornate hooked halberd twice the character height with complete blade shaft and butt visible, glowing orange gem inset in the halberd head, two separate curling magma-orange magic ribbons framing the figure without hiding its eyes, dignified grounded guard pose, upper-mid-power sentinel with stronger ornamentation and winged silhouette, entire character visible from head to feet at roughly one third of canvas height, centered compact decorative composition, visible white gaps between body wings weapon and magic ribbons, a clear solid-white breathing margin on all four sides beyond the entire character weapon wings and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, full-frame fire, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, gore, text, logo, watermark, multiple characters
```

### 7. Brasshorn Minotaur - Crucible Champion

**Silhouette:** fully armored bull-headed champion, polished brass horns, crimson
mantle, enormous double axe, and three flame arcs. Elite but still compact/cute.
Suggested future asset ID: `brasshorn-minotaur`.

```text
full-body gacha JRPG unit illustration on a solid pure-white canvas, one tiny mythological minotaur crucible champion enemy, warm brown fur, rounded oversized bull-like head with two polished brass-capped curved horns, bright amber eyes only with no other facial features, no protruding muzzle, tiny broad torso and short limbs, 2.5 to 3 heads tall, ornate crimson-and-brass full armor with flame-shaped shoulder plates, flowing crimson mantle, small armored hooves, one enormous symmetrical double-headed axe nearly three times the character height with complete ornate blades haft and pommel visible, both hands holding the axe diagonally beside the figure without hiding the eyes, three separate curling orange-and-scarlet flame arcs around the weapon and mantle, powerful grounded champion pose, elite high-power enemy with richer armor and effects than a winged sentinel while keeping the same tiny body scale, entire character visible from head to hooves at roughly one third of canvas height, centered compact decorative composition, visible white gaps between body horns axe mantle and flame arcs, a clear solid-white breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors --ar 4:3 --niji 6 --s 100 --q 1 --no nose, muzzle, mouth, eyebrows, facial markings, full-frame fire, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, gore, text, logo, watermark, multiple characters
```

### 8. Pyrewing Harpy - Ember Oracle

**Silhouette:** feather-crested fire oracle in a modest armored robe, open scarlet
wings, sun-tipped staff, and feather-shaped magic. More radiant than the champion.
Suggested future asset ID: `pyrewing-harpy`.

```text
full-body gacha JRPG unit illustration on a solid pure-white canvas, one tiny mythological fire harpy oracle enemy, rounded oversized head with a swept scarlet feather crest, radiant gold eyes only with no other facial features, tiny torso and short limbs, 2.5 to 3 heads tall, modest fully covered crimson-and-gold armored robe with a flowing layered skirt, two magnificent scarlet feathered wings spread around the small figure with every feather tip visible, small gold talon boots, one ornate sun-tipped staff nearly three times the character height held beside the body with complete staff and circular crown visible, separate orange and gold feather-shaped magic ribbons framing the wings and staff without obscuring the eyes, light hovering pose with complete feet visible, radiant high-power oracle design more elaborate than a crucible champion, entire character body visible from head to feet at roughly one third of canvas height, centered compact decorative composition, visible white gaps between body wings staff and magic feathers, a clear solid-white breathing margin on all four sides beyond the entire character weapon wings and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors --ar 4:3 --niji 6 --s 100 --q 1 --no beak, nose, mouth, eyebrows, facial markings, revealing clothing, full-frame fire, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, gore, text, logo, watermark, multiple characters
```

### 9. Magma Wyrm Knight - Depths Regent

**Silhouette:** dragon-headed knight, complete long tail and broad wings, ornate
obsidian-gold armor, volcanic lance, and layered molten ribbons. Near-sovereign power.
Suggested future asset ID: `magma-wyrm-knight`.

```text
full-body gacha JRPG unit illustration on a solid pure-white canvas, one tiny upright mythological magma dragon knight enemy, dark-crimson scales, rounded oversized dragon-like head with a swept gold horn crest and no elongated snout, molten-gold eyes only with no other facial features, tiny torso and short limbs, 2.5 to 3 heads tall, richly ornamented obsidian-and-gold full armor with layered flame-shaped pauldrons, flowing scarlet royal cape, two broad dragon wings and one curled segmented tail completely visible around the body, small armored feet, one magnificent volcanic lance three times the character height with a faceted orange crystal blade and complete butt shaft blade and tip visible, lance held at an outward diagonal without covering the eyes, several separate layered molten-orange and deep-scarlet magic ribbons framing the knight wings and lance, regal airborne guard pose with the entire body visible, near-sovereign enemy with more intricate armor weapon and aura than a fire oracle, character body roughly one third of canvas height, centered compact decorative composition, visible white gaps between body wings tail cape lance and ribbons, a clear solid-white breathing margin on all four sides beyond the entire character weapon wings tail and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors --ar 4:3 --niji 6 --s 100 --q 1 --no snout, nose, mouth, eyebrows, facial markings, full-frame fire, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, gore, text, logo, watermark, multiple characters
```

### 10. Ifrit of the Last Furnace - Flame Sovereign

**Silhouette:** tiny crowned ifrit in a vast layered flame vestment, white-gold
eyes, a huge ceremonial greatsword, and floating separated fire rings.
The grandest visual endpoint; boss status and capture eligibility remain unapproved.
Suggested future asset ID: `last-furnace-ifrit`.

```text
full-body gacha JRPG unit illustration on a solid pure-white canvas, one tiny mythological ifrit flame sovereign enemy, warm ruby-red skin, rounded oversized head with two sweeping gold horns and an ornate ember crown, luminous white-gold eyes only with no other facial features, tiny torso and short limbs, 2.5 to 3 heads tall, majestic fully covered crimson obsidian and gold ceremonial armor, immense layered flame-shaped vestment and flowing gold-trimmed mantle surrounding but not hiding the small body, complete armored feet visible, one magnificent ceremonial greatsword three times the character height with an ornate gold hilt and a white-hot ruby crystal blade fully visible from pommel to tip, greatsword held beside the figure without crossing the face, three separate floating orange-and-gold fire rings behind and around the figure with generous white openings, elaborate curling scarlet white-gold and amber fire plumes framing the mantle and sword, regal suspended pose, strongest and most epic enemy in the Flaming Depths series with richer crown armor weapon and controlled aura than the magma dragon regent while retaining identical tiny chibi proportions, character body visible from head to feet at roughly one third of canvas height, centered compact decorative composition, visible white gaps between body crown mantle sword rings and fire plumes, a clear solid-white breathing margin on all four sides beyond the entire character weapon and effects, nothing touches the frame edges, clean precise anime contours, crisp cel shading, smooth painted highlights, jewel-like saturated colors --ar 4:3 --niji 6 --s 100 --q 1 --no nose, mouth, eyebrows, facial markings, additional summoned figures, full-frame fire, closeup, portrait, bust, cropping, scenery, horizon, vignette, gritty texture, background gradient, background shadows, photorealism, 3d render, gore, text, logo, watermark, multiple characters
```
