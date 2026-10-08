# Currency Art - Prismatica and Null-Prismatica

**D-133:** owner renames both currencies and chooses bright/dark faceted prism
counterparts. Both owner-supplied replacements are now installed (D-142).
No balances, prices, income
or save format change. Legacy IDs `fractalis`/`lycalis` and filenames remain.

Follow the [cutout background contract](cutout-background-contract.md) and
[shared renderer](midjourney-character-style-prompt.md): clean anime contours,
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
[Intake provenance](prism-currency-intake.json) records new/source/runtime and
previous-export hashes; historical originals/manifests remain untouched.

Regenerate with `python tools\intake_prism_currency_art.py --apply`; the shared
exporter/review tool selects the new sources without legacy brown cleanup.
Shared currency URLs include byte-derived revisions to avoid stale coin/rose
caches. Validate `python -m unittest discover -s tools -p test_prism_currency_intake.py`
and `python -m unittest discover -s tools -p test_prepare_currencies.py`.

The old source-specific brown/shadow/spill cleanup in
[prepare_currencies.py](../tools/prepare_currencies.py) is for those delivered
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

Legacy art ID: `fractalis`. One bright, solid faceted prism crystal.

```text
square gacha JRPG collectible currency icon, one bright precious prism crystal with a chunky elongated hexagonal body pointed crown and tapered lower tip, broad pearlescent ivory central planes polished silver facet borders and sharply separated cyan rose violet and pale-gold refraction bands, small interlocking crystal facets attached around the lower tip form one cohesive object, substantial geometric volume clean readable silhouette no separate particle cloud, crisp white painted reflection marks non-emissive jewel highlights, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated crystal colors, chibi-inspired collectible proportions readable at small inventory size, complete crystal roughly two thirds of canvas with a generous clear margin on all four sides, nothing touches the frame edges, solid opaque facets and hard edges, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, eyes, character, hands, coin, rose, thorn, multiple crystals, text, letters, numbers, runes, logo, watermark, interface, frame, scenery, photorealism, 3d render, cropping, transparent crystal, background showing through crystal, ground shadow, background gradient, textured background, background vignette, background color spill, glow, light bloom, soft aura, haze, light spill
```

## Null-Prismatica - Premium currency

Legacy art ID: `lycalis`. The same prism construction in obsidian and violet.

```text
square gacha JRPG collectible premium currency icon, one dark precious prism crystal with a chunky elongated hexagonal body pointed crown and tapered lower tip, broad obsidian central planes deep violet amethyst inset facets polished silver borders and sharply separated restrained magenta indigo and icy-ivory refraction bands, small interlocking crystal facets attached around the lower tip form one cohesive object, same geometric construction as its bright counterpart with a severe dark jewel identity, substantial geometric volume clean readable silhouette no separate particle cloud, crisp ivory painted reflection marks preserve facet readability without emission, clean precise anime contours crisp cel shading smooth painted highlights jewel-like saturated obsidian violet and silver colors, chibi-inspired collectible proportions readable at small inventory size, complete crystal roughly two thirds of canvas with a generous clear margin on all four sides, nothing touches the frame edges, solid opaque facets and hard edges, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no face, eyes, character, hands, coin, rose, thorn, multiple crystals, text, letters, numbers, runes, logo, watermark, interface, frame, scenery, photorealism, 3d render, cropping, transparent crystal, background showing through crystal, ground shadow, background gradient, textured background, background vignette, background color spill, glow, light bloom, soft aura, haze, light spill
```
