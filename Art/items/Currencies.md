# Currency Art - Prismatica and Null-Prismatica

**Current prompt direction:** white shimmering coin and cracked black coin with
red/white lightning. The previous bright/dark prism images remain installed
(D-142) until new coin replacements are supplied and individually reviewed.
No balances, prices, income
or save format change. Legacy IDs `fractalis`/`lycalis` and filenames remain.

Follow the [cutout background contract](../guides/cutout-background-contract.md) and
[shared renderer](../guides/midjourney-character-style-prompt.md): clean anime contours,
crisp cel shading, smooth non-emissive painted highlights and jewel-like colors.
Chunky collectible objects, not humanoid anatomy or scenery. Names/headings
stay outside generation prose so the objects do not acquire lettering.
Both item prompts use no `--sref` or `--sw` (D-147).

## Supplied artwork and compatibility

Historical originals remain byte-for-byte at
`Art/source/currencies/Fractalis.png` and
`Art/source/currencies/Lycalis.png`. Previous runtime exports are preserved
under `Art/source/currencies/previous-runtime`. Active runtime filenames remain
`public/assets/currencies/fractalis.png` and `lycalis.png`.
New originals are preserved at `Art/source/currencies/Prismatica.png` and
`Null-Prismatica.png`. Reviewed transparent256px/224px-content replacements
now appear across all currency surfaces. Border-connected source-specific teal
keys and bounded edge cleanup protect cyan/pale facets, dark rims and highlights;
painted sparkles and the dark crystal's intentional shadow are preserved.
[Intake provenance](../provenance/prism-currency-intake.json) records new/source/runtime and
previous-export hashes; historical originals/manifests remain untouched.

Regenerate with `python tools\intake_prism_currency_art.py --apply`; the shared
exporter/review tool selects the new sources without legacy brown cleanup.
Shared currency URLs include byte-derived revisions to avoid stale coin/rose
caches. Validate `python -m unittest discover -s tools -p test_prism_currency_intake.py`
and `python -m unittest discover -s tools -p test_prepare_currencies.py`.

The old source-specific brown/shadow/spill cleanup in
[prepare_currencies.py](../../tools/prepare_currencies.py) is for those delivered
originals only. New prompts use contrasting flat green, not the historical
brown matte. Do not run old cleanup/masks on new keyed artwork without explicit
review and supported key handling. Transparent supplied sources keep their
alpha and only trim/resize/pad. Preserve originals and update provenance only
after replacement intake; do not fabricate new asset paths. The D-142 intake
provides the explicit supported keyed-source handling for these deliveries.

Prismatica remains the main upgrade/purchase/ordinary reward currency.
Null-Prismatica remains the premium summon currency with existing eligible
income sources. Names/designs do not change earning, spending or atomic saves.

## Prismatica - Main currency

Legacy art ID: `fractalis`. One white coin, with shimmer expressed through crisp
painted reflections and opaque white sparkle marks, not generated glow.

```text
square gacha JRPG collectible currency icon, one white precious coin with a thick circular pearlescent-white face polished silver beveled rim and finely ridged edge, slight three-quarter tilt revealing substantial coin thickness, a simple raised geometric diamond without lettering centered on the face, shimmering light conveyed by crisp painted white reflections and three small opaque four-point white sparkle marks close to the rim, cool silver and pale-gray cel shadows preserve the round white silhouette, clean precise anime contours crisp cel shading smooth painted highlights jewel-like polished reflections, chibi-inspired collectible proportions readable at small inventory size, complete coin and every sparkle roughly two thirds of canvas with a generous clear margin on all four sides, nothing touches the frame edges, pull back the whole design rather than crop or simplify it, solid opaque coin and hard-edged painted sparkles, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, eyes, character, hands, rose, thorn, prism crystal, multiple coins, text, letters, numbers, runes, logo, watermark, interface, frame, scenery, photorealism, 3d render, cropping, transparent coin, background showing through coin, ground shadow, background gradient, textured background, background vignette, background color spill, glow, light bloom, soft aura, haze, light spill
```

## Null-Prismatica - Premium currency

Legacy art ID: `lycalis`. A cracked black coin with red and white lightning
emerging from its fractures. Lightning is opaque hard-edged painted geometry;
no soft emission, translucency or background spill.

```text
square gacha JRPG collectible premium currency icon, one cracked black precious coin with a thick circular obsidian-black face dark steel beveled rim and finely ridged edge, slight three-quarter tilt revealing substantial coin thickness, branching deep fractures cut across a simple raised geometric diamond without lettering, three angular red and white lightning bolts emerging directly from the cracks and curling close around the coin in opaque hard-edged zigzags, red crack interiors and crisp white painted reflections against charcoal cel shadows preserve the dark face and broken-metal detail, clean precise anime contours crisp cel shading smooth painted highlights jewel-like obsidian and steel reflections, chibi-inspired collectible proportions readable at small inventory size, complete coin and every lightning tip roughly two thirds of canvas with a generous clear margin on all four sides, nothing touches the frame edges, pull back the whole design rather than crop or simplify it, solid opaque coin and hard-edged lightning no floating fragments, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, eyes, character, hands, rose, thorn, prism crystal, multiple coins, text, letters, numbers, runes, logo, watermark, interface, frame, scenery, photorealism, 3d render, cropping, transparent coin, background showing through coin, ground shadow, background gradient, textured background, background vignette, background color spill, glow, light bloom, soft aura, haze, light spill
```
