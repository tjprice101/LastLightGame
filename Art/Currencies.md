# Currency Art - Fractalis and Lycalis

Follow the [cutout background contract](cutout-background-contract.md).
These are standalone currency icons, not scenery or interface mockups.
Use the [original character rendering](midjourney-character-style-prompt.md):
clean anime contours, crisp cel shading, smooth painted highlights and jewel-like
colors, adapted to chunky collectible objects rather than humanoid anatomy.
Keep the silver coin/prismatic residue and glass rose/chromatic thorn identities;
never substitute generic gems or add character faces.
Append `--sref <approved_reference_image_url> --sw 400` to each prompt using
the same approved style reference as the other collectible artwork.

Both designs use a flat brown background to distinguish the matte from their
silver, glass and chromatic facets. Review generated colors before removal;
change only the background swatch if it overlaps painted subject details.
Glass is represented by opaque painted facets and crisp highlights, not
background-visible transparency. Shine is non-emissive, never glow.

## Implemented artwork

Owner originals are preserved in `Art/source/currencies/Fractalis.png` and
`Art/source/currencies/Lycalis.png`. Transparent runtime icons are
`public/assets/currencies/fractalis.png` and `lycalis.png` (256x256).
The delivered backgrounds differed from the requested swatch, so each image
has reviewed custom cleanup in `tools/prepare_currencies.py`. Fractalis cast
shadow and Lycalis muted sparkle spill are removed without recoloring their
painted facets. Currency balances, costs, inventory, First Fracture preview,
enemy drops, results and glossary share these icons. Lycalis is not enemy loot.

## Fractalis - Main currency

Suggested art ID: `fractalis`. One shiny coin with prismatic residue.

```text
square gacha JRPG collectible currency icon on plain canvas, one Fractalis thick polished silver coin tilted slightly in three-quarter view, broad circular face with a simple embossed diamond-shaped fracture emblem without lettering, sturdy beveled rim and clearly visible coin thickness, small deposits of prismatic crystal residue clinging to the lower rim and crossing one shallow crack on the face, angular jewel-colored residue facets with tiny attached crystalline chips rather than a particle cloud, brilliant polished metal shine expressed as crisp opaque white reflection marks and painted silver shading, coin remains the dominant silhouette and residue remains secondary, chunky chibi-inspired object proportions ornate precise anime contours crisp cel shading smooth painted highlights jewel-like chromatic colors, bold recognizable coin silhouette readable at small inventory size, complete coin and attached residue roughly two thirds of the canvas, generous background-color margin on all four sides, plain solid brown background (#6B3E26), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, prismatic residue rendered as opaque solid-color crystal facets with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, eyes, character, hands, coin pile, multiple coins, rose, thorn, text, letters, numbers, logo, watermark, interface, frame, scenery, photorealism, 3d render, cropping, multiple items, ground shadow, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Lycalis - Premium currency

Suggested art ID: `lycalis`. One chromatic thorn protruding from a glass rose.

```text
square gacha JRPG collectible premium currency icon on plain canvas, one Lycalis sculptural glass rose with a single prominent chromatic thorn protruding diagonally upward from the heart of the flower, layered thick crystal-glass petals forming an unmistakable rose silhouette around the thorn's base, pale silver and icy ivory glass facets with restrained jewel-colored refraction bands, long tapered thorn with sharply defined cyan violet magenta and gold chromatic planes, thorn clearly emerges from the rose rather than floating beside it, elegant precious flower-and-thorn collectible not a weapon or a living plant, glass rendered as opaque painted crystal facets with crisp white reflection marks and dark fine contour lines, clean background-color gaps between outer petals, chunky chibi-inspired object proportions ornate precise anime contours crisp cel shading smooth painted highlights jewel-like chromatic colors, bold rose-and-thorn silhouette readable at small inventory size, complete rose and entire thorn roughly two thirds of the canvas, generous background-color margin on all four sides, plain solid brown background (#6B3E26), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, chromatic accents rendered as opaque solid-color facets with crisp hard edges, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, eyes, character, hands, coin, bouquet, multiple roses, multiple thorns, sword, long stem, vase, text, letters, numbers, logo, watermark, interface, frame, scenery, photorealism, 3d render, cropping, multiple items, transparent petals, background showing through glass, ground shadow, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```
