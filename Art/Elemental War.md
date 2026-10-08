# Elemental War Art

**Design only (D-145), not implemented or supplied.** [Specification and open approvals](../docs/elemental-war.md).

Three original challengers, each with a15-prompt pack: [Nerithe](Nerithe%20Art.md), [Orvella](Orvella%20Art.md), [Vaelor](Vaelor%20Art.md). Six portraits, six ability/action icons, weapon, activity header and arena per character. This family header makes46 total prompts.

Activity banners are not summon banners or new acquisition pools. Only character/enemy portraits use --sref/--sw (D-147); icons, weapons and scenery do not. Names/titles belong in HTML/headings, never in generated art. Complete-design containment applies to all cutouts, not full-bleed scenery.

### Elemental War family banner

Proposed asset ID: `elemental-war-banner` (not registered).

```text
full-bleed gacha JRPG endgame activity family banner, three vast interlocking domains arranged as a coherent triangular horizon, ivory nautilus observatories and folded turquoise seas on the left, stepped slate foundation citadels and violet geode vaults below, ivory tuning-fork storm towers copper drums and cobalt sky bridges on the right, three tiny distant fully clothed human challengers provide scale without portrait panels, monumental elemental rivalry with clear distinct water earth and electrical architecture, original compact gacha JRPG chibi anime renderer, clean precise anime contours, crisp cel shading, smooth non-emissive painted highlights and jewel-like saturated colors, dramatic environmental lighting and deep layered original fantasy scenery, full-bleed art reaches every edge, no unit reward grid no lettering no interface no cutout matte --ar 3:1 --niji 6 --s 100 --q 1 --no text, letters, words, numbers, runes, logo, watermark, interface, card border, cropping, photorealism, 3d render, gritty texture, realistic anatomy, character portrait grid, text panels, interface framing
```

Regenerate these authored prompt documents with `python tools\build_elemental_war_art.py`; validate with `python -m unittest discover -s tools -p test_elemental_war_art.py`. Generated pack contents are original authored designs, not scraped artwork. Keep supplied sources and matte/facing review separate from prompt generation.
