# Universal Normal Attack and Defense icons

The owner replaces the earlier prismatic wing/shield concepts with an
element-neutral **steel sword sweep** and **steel shield**. The supplied
D-157 replacements are reviewed and installed as the shared Normal Attack and
Defense icons. Previously delivered Prismatic Winged Strike/Prismatic Aegis
images are earlier concepts, not the active universal art.
Passive, Skill1/2 and Last Flare remain character-specific.
See [phases and intake](../../docs/conduit-expansion-plan.md).

## Renderer, export and replacement gate

Compact chibi anime/cel collectible icon renderer, precise contours, crisp
cel shading and non-emissive painted metallic highlights. Neither icon has
an elemental affinity. No `--sref` or `--sw`, character, labels or UI frame.
Shared runtime IDs: `universal-normal-attack`, `universal-defense`.
They are shared live URLs. Originals are preserved under
`Art/source/abilities/universal/D-157`, with source/runtime hashes in
`Art/provenance/d157-root-art-intake.json`. The RGB green key is individually
sampled per source; the sword sweep includes one reviewed enclosed-gap seed.
Dark/light sheets and small-size transparent256px/224px-content exports were
reviewed before installation.
Superseded source art remains preserved; the shared resolver now serves the new
icons for every Element-Bearer.
Names, Gauge gains, Defense strength and captured skill availability do not
change with artwork.

## Normal Attack - Steel Sword Sweep

Delivered filename: `Normal Attack - Steel Sword Sweep.png`.
One physical sword, with a hard-edged action arc showing its sweep.

```text
one steel sword sweep normal attack ability icon, a single complete broad silver steel sword with a straight double-edged blade centered ridge sturdy crossguard dark wrapped grip and rounded steel pommel, dynamic diagonal upward-right sword angle, one bold curved opaque white and cool-gray slash arc following the blade's sweeping motion with two short tapered speed strokes, readable physical weapon and clean action sweep rather than crystalline wings or elemental powers, compact chibi anime gacha collectible icon design with clean precise contours crisp cel shading smooth painted highlights and jewel-like polished steel reflections, cool silver steel charcoal grip and restrained white highlights, no character no hands, complete sword tip crossguard grip pommel and every sweep tip fully visible inside the canvas with a continuous clear safety margin on all four sides and corners, central silhouette occupying roughly two thirds of the square, distinct background-color gaps between sword and motion arc, pull back the whole design rather than crop or simplify it, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, motion rendered as opaque solid-color ribbons and shapes with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, feather wings, crystal wings, shield, scenery, horizon, cropping, clipped sword, photorealism, 3d render, gritty texture, text, letters, lettering, words, numbers, typography, captions, labels, signatures, runes, logo, watermark, interface, card border, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Defense - Steel Shield

Delivered filename: `Defense - Steel Shield.png`.
A stable physical shield, clearly distinct from the sweeping attack.

```text
one steel shield defense ability icon, a single broad upright silver steel kite shield with rounded reinforced shoulders centered lower point thick riveted steel rim and one raised circular steel boss, broad brushed silver panels separated by clean dark-gray structural seams, solid substantial protective silhouette with small painted white reflection marks along the upper rim and boss, compact chibi anime gacha collectible icon design with clean precise contours crisp cel shading smooth painted highlights and jewel-like polished steel reflections, cool silver white charcoal and restrained blue-gray metallic shadows, no character no hands no crystal core no wings, complete shield rim rivets boss and lower point fully visible inside the canvas with a continuous clear safety margin on all four sides and corners, stable central silhouette occupying roughly two thirds of the square, pull back the whole design rather than crop or simplify it, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, solid opaque metal and crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no character, face, hands, sword, spear, bow, feather wings, crystal wings, attack slash, scenery, horizon, cropping, clipped shield, photorealism, 3d render, gritty texture, text, letters, lettering, words, numbers, typography, captions, labels, signatures, runes, logo, watermark, interface, card border, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

Validation: `python -m unittest discover -s tools -p test_universal_action_prompts.py`.
Passing prompt tests is not visual acceptance of generated images.
