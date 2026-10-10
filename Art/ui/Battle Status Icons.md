# Battle status, buff, debuff and stack icon prompts

**Consolidated elemental icon checklist (D-173): 9 reference-free prompts, replacing the 40-icon checklist.** Six broad elemental families and three precise Rose-banner signatures. No icons are installed by this document; D-175 installs all nine owner-delivered images through reviewed offline intake. Live labels, owners, counts and clocks remain readable text beside the icons. [Intrinsic kits](../../docs/character-kit-rework.md) / [Equipment rules](../../docs/conduit-expansion-plan.md).

Generate separate 1:1 cutouts. Proposed filenames below are delivery names, not runtime URLs. Preserve originals under Art/source/abilities/statuses, review pale foreground/enclosed gaps at source resolution, then export transparent 256px icons with 224px content. Names, percentages, source owners, clocks and stack counts stay in HTML, not generated art. One reusable icon per resource: do not generate numbered variants. Never request proposed image URLs before reviewed intake; supplied alpha is authoritative.

## Delivered artwork (D-175)

All nine named owner PNGs are preserved byte-identically under Art/source/abilities/statuses. Reviewed transparent exports use the stable status filenames below in public/assets/abilities/statuses. Source-specific cleanup and hashes live in Art/provenance/status-art-settings.json and status-art-intake.json; reproduce with tools/intake_status_art.py. Shared byte revisions and typed family/Rose resolution cover real enemy badges, native counters and applicable equipment readouts. No new effects, state, clocks, transactions or save fields. [Intake contract](../../docs/art-workflow.md).

## Broad to precise

| Family | Theme | Precise effects sharing this symbol |
| --- | --- | --- |
| Infernic Embers | Infernic | Burn debuff, personal Infernic Embers, equipment Ember Seals |
| Oceanic Protection | Oceanic | Shield, personal Oceanic Protection, direct-hit protective wards |
| Botanic Renewal | Botanic | Healing, personal Botanic Renewal, healing-earned equipment benefits |
| Atmospheric Charge | Atmospheric | Personal Tempest, Tailwind, Alternating Storm and other wind/storm equipment benefits |
| Tranquilitic Focus | Tranquilitic | Precision, Burn Focus, Dawn Focus |
| Chaotic Suppression | Chaotic | Weaken, Fracture Mark, Weaken Pierce |

A family is an interaction/art category, not a universal identical status. Always show the precise effect label, source, count, value and clock alongside shared art. Theme does not change a character's combat element or introduce an equipment restriction. Rose Grace specializes Botanic Renewal, Thorn Aegis specializes Oceanic Protection and Rose Duality specializes Infernic Embers; their unique symbols and native rules remain.

## Removed from generation, not from essential gameplay

Do not generate separate icons for Attack Boost, Defense, Last Flare Recovery, Shatter Gauge, Skill Cooldown, Normal Momentum, Rift Echo, Undertide Reprise or Storm Clock. Keep exact live text, meters, timers and equipment feedback; instant cooldown feedback is not a lingering elemental status. All existing owned Conduit effects remain functional. Bedrock, Concord, Night Resolve, Charted Current, Foundation, Verdict Mark and Shelter Charge are retired native special mechanics. Restorative Charges/Blooms share Botanic Renewal; Gale Cadence/Storm Rhythm/Resonance share Atmospheric Charge, with one common critical-hit trigger.

## Generation checklist

- [Infernic Embers](#infernic-embers) - `status-burn.png`
- [Oceanic Protection](#oceanic-protection) - `status-ward.png`
- [Botanic Renewal](#botanic-renewal) - `status-bloom.png`
- [Atmospheric Charge](#atmospheric-charge) - `status-tempest.png`
- [Tranquilitic Focus](#tranquilitic-focus) - `status-focus.png`
- [Chaotic Suppression](#chaotic-suppression) - `status-suppression.png`
- [Rose Grace](#rose-grace) - `status-rose-grace.png`
- [Thorn Aegis](#thorn-aegis) - `status-thorn-aegis.png`
- [Rose Duality](#rose-duality) - `status-rose-duality.png`

## Infernic Embers

Proposed status ID: `status-burn` (not a runtime URL). Delivery filename: `status-burn.png`.

Infernic family: actual enemy Burn, Infernis personal Infernic Embers and equipment Ember Seals share art, never counts, owners or spending. Burn damage/remaining phases stay explicit.

```text
one compact opaque red-orange flame wrapped around a charcoal ember, a single cohesive readable battle status symbol, compact chibi anime gacha collectible icon renderer with clean precise contours crisp cel shading smooth painted highlights and jewel-like saturated subject colors, strict subject palette lock use only crimson red orange bronze charcoal ivory and steel-gray, remap all material highlights and shadows into these allowed subject colors, the background key is exempt from the subject palette restriction, solid opaque metal stone feather and power shapes with crisp hard edges, complete symbol and every effect tip fully visible with a continuous clear safety margin on all four sides and corners, whole ensemble occupying roughly two thirds of the square, pull back the whole design rather than crop or simplify it, nothing touches the frame edges, no character no hands, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, violet, purple, pink, face, eyes, character, hands, scenery, horizon, cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, interface, frame, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Oceanic Protection

Proposed status ID: `status-ward` (not a runtime URL). Delivery filename: `status-ward.png`.

Oceanic family: authored Shield, direct-hit wards and Tizu personal Oceanic Protection share art, not amounts or clocks. Active shields refresh rather than add.

```text
one silver shield enclosing two nested opaque sapphire tide crests, a single cohesive readable battle status symbol, compact chibi anime gacha collectible icon renderer with clean precise contours crisp cel shading smooth painted highlights and jewel-like saturated subject colors, strict subject palette lock use only sapphire-blue ivory silver and charcoal, remap all material highlights and shadows into these allowed subject colors, the background key is exempt from the subject palette restriction, solid opaque metal stone feather and power shapes with crisp hard edges, complete symbol and every effect tip fully visible with a continuous clear safety margin on all four sides and corners, whole ensemble occupying roughly two thirds of the square, pull back the whole design rather than crop or simplify it, nothing touches the frame edges, no character no hands, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no red, orange, yellow, turquoise, violet, purple, pink, face, eyes, character, hands, scenery, horizon, cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, interface, frame, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Botanic Renewal

Proposed status ID: `status-bloom` (not a runtime URL). Delivery filename: `status-bloom.png`.

Botanic family: authored healing, Flora/Bliss personal Botanic Renewal and healing-earned equipment benefits share art. Triggers and spend choices stay explicit per owner.

```text
one emerald leaf cradle holding an opaque ivory flower bud, a single cohesive readable battle status symbol, compact chibi anime gacha collectible icon renderer with clean precise contours crisp cel shading smooth painted highlights and jewel-like saturated subject colors, strict subject palette lock use only emerald moss-green ivory silver and charcoal, remap all material highlights and shadows into these allowed subject colors, the background key is exempt from the subject palette restriction, solid opaque metal stone feather and power shapes with crisp hard edges, complete symbol and every effect tip fully visible with a continuous clear safety margin on all four sides and corners, whole ensemble occupying roughly two thirds of the square, pull back the whole design rather than crop or simplify it, nothing touches the frame edges, no character no hands, plain solid magenta background (#FF00FF), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no red, orange, yellow, blue, navy, cyan, turquoise, violet, purple, face, eyes, character, hands, scenery, horizon, cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, interface, frame, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Atmospheric Charge

Proposed status ID: `status-tempest` (not a runtime URL). Delivery filename: `status-tempest.png`.

Atmospheric family: Atmoso/Elise/Vaelor personal Atmospheric Charge and wind/storm equipment benefits share art. Personal Atmospheric Charge uses effective critical Normal/ordinary skills; equipment rules stay separate.

```text
one silver wind vane encircled by three opaque pale-yellow lightning forks, a single cohesive readable battle status symbol, compact chibi anime gacha collectible icon renderer with clean precise contours crisp cel shading smooth painted highlights and jewel-like saturated subject colors, strict subject palette lock use only pale yellow white ivory silver and charcoal, remap all material highlights and shadows into these allowed subject colors, the background key is exempt from the subject palette restriction, solid opaque metal stone feather and power shapes with crisp hard edges, complete symbol and every effect tip fully visible with a continuous clear safety margin on all four sides and corners, whole ensemble occupying roughly two thirds of the square, pull back the whole design rather than crop or simplify it, nothing touches the frame edges, no character no hands, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no red, orange, blue, navy, cyan, turquoise, violet, purple, pink, face, eyes, character, hands, scenery, horizon, cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, interface, frame, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Tranquilitic Focus

Proposed status ID: `status-focus` (not a runtime URL). Delivery filename: `status-focus.png`.

Tranquilitic family: critical precision and sight/focus equipment effects share art. Show exact percentage, source and expiry/consumption; no new buff is created.

```text
one ivory sun lens aligned around a platinum sight diamond, a single cohesive readable battle status symbol, compact chibi anime gacha collectible icon renderer with clean precise contours crisp cel shading smooth painted highlights and jewel-like saturated subject colors, strict subject palette lock use only pale yellow white ivory silver and charcoal, remap all material highlights and shadows into these allowed subject colors, the background key is exempt from the subject palette restriction, solid opaque metal stone feather and power shapes with crisp hard edges, complete symbol and every effect tip fully visible with a continuous clear safety margin on all four sides and corners, whole ensemble occupying roughly two thirds of the square, pull back the whole design rather than crop or simplify it, nothing touches the frame edges, no character no hands, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no red, orange, blue, navy, cyan, turquoise, violet, purple, pink, face, eyes, character, hands, scenery, horizon, cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, interface, frame, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Chaotic Suppression

Proposed status ID: `status-suppression` (not a runtime URL). Delivery filename: `status-suppression.png`.

Chaotic family: actual Weaken and equipment Fracture Mark/pierce share art, not mechanics. Preserve exact debuff type, strength, owner, stacks and clock; a shared family never makes all targets Weakened.

```text
one obsidian lens enclosing a cracked silver sword and opaque violet fault line, a single cohesive readable battle status symbol, compact chibi anime gacha collectible icon renderer with clean precise contours crisp cel shading smooth painted highlights and jewel-like saturated subject colors, strict subject palette lock use only amethyst violet black charcoal silver and crimson-red, remap all material highlights and shadows into these allowed subject colors, the background key is exempt from the subject palette restriction, solid opaque metal stone feather and power shapes with crisp hard edges, complete symbol and every effect tip fully visible with a continuous clear safety margin on all four sides and corners, whole ensemble occupying roughly two thirds of the square, pull back the whole design rather than crop or simplify it, nothing touches the frame edges, no character no hands, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, yellow, orange, pink, face, eyes, character, hands, scenery, horizon, cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, interface, frame, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Rose Grace

Proposed status ID: `status-rose-grace` (not a runtime URL). Delivery filename: `status-rose-grace.png`.

Rosetta intrinsic effective authored-healing resource; Skill1 Weaken versus Last Flare damage, maximum three.

```text
three ivory rose buds cradled by one antique-gold longbow crescent, a single cohesive readable battle status symbol, compact chibi anime gacha collectible icon renderer with clean precise contours crisp cel shading smooth painted highlights and jewel-like saturated subject colors, strict subject palette lock use only crimson scarlet antique-gold ivory black and platinum, remap all material highlights and shadows into these allowed subject colors, the background key is exempt from the subject palette restriction, solid opaque metal stone feather and power shapes with crisp hard edges, complete symbol and every effect tip fully visible with a continuous clear safety margin on all four sides and corners, whole ensemble occupying roughly two thirds of the square, pull back the whole design rather than crop or simplify it, nothing touches the frame edges, no character no hands, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, violet, purple, orange, pink, face, eyes, character, hands, scenery, horizon, cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, interface, frame, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Thorn Aegis

Proposed status ID: `status-thorn-aegis` (not a runtime URL). Delivery filename: `status-thorn-aegis.png`.

Thornia intrinsic authored-shield absorption resource; Skill2 Weaken versus Last Flare shield, maximum three.

```text
three black thorn ramparts around one crimson rose shield, a single cohesive readable battle status symbol, compact chibi anime gacha collectible icon renderer with clean precise contours crisp cel shading smooth painted highlights and jewel-like saturated subject colors, strict subject palette lock use only crimson scarlet antique-gold ivory black and platinum, remap all material highlights and shadows into these allowed subject colors, the background key is exempt from the subject palette restriction, solid opaque metal stone feather and power shapes with crisp hard edges, complete symbol and every effect tip fully visible with a continuous clear safety margin on all four sides and corners, whole ensemble occupying roughly two thirds of the square, pull back the whole design rather than crop or simplify it, nothing touches the frame edges, no character no hands, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, violet, purple, orange, pink, face, eyes, character, hands, scenery, horizon, cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, interface, frame, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

## Rose Duality

Proposed status ID: `status-rose-duality` (not a runtime URL). Delivery filename: `status-rose-duality.png`.

Crinso intrinsic own effective Burn resource; Skill1 versus Last Flare damage, maximum three. Not equipment Ember Seals.

```text
two opposed crimson and gold blade petals joined by three rose seal facets, a single cohesive readable battle status symbol, compact chibi anime gacha collectible icon renderer with clean precise contours crisp cel shading smooth painted highlights and jewel-like saturated subject colors, strict subject palette lock use only crimson scarlet antique-gold ivory black and platinum, remap all material highlights and shadows into these allowed subject colors, the background key is exempt from the subject palette restriction, solid opaque metal stone feather and power shapes with crisp hard edges, complete symbol and every effect tip fully visible with a continuous clear safety margin on all four sides and corners, whole ensemble occupying roughly two thirds of the square, pull back the whole design rather than crop or simplify it, nothing touches the frame edges, no character no hands, plain solid green background (#00FF00), flat unlit color edge to edge and through all openings, subject colors unchanged, no glows or glowing visual effects, non-emissive painted highlights --ar 1:1 --niji 6 --s 100 --q 1 --no blue, navy, cyan, turquoise, violet, purple, orange, pink, face, eyes, character, hands, scenery, horizon, cropping, photorealism, 3d render, text, letters, numbers, runes, logo, watermark, interface, frame, background gradient, textured background, background vignette, background color spill, glow, glowing effects, light bloom, soft aura, haze, light spill
```

Reproduce: `python tools\build_status_art.py`. Validate: `python -m unittest discover -s tools -p test_status_art_prompts.py`. Prompt assertions are not generated-image acceptance. Future Omnic designs may target families or precise sourced specializations; this pack adds no future equipment mechanics.
