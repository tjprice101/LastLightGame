# Story world map - Six Beacons

**Status:** generation reference; D-171 owner-delivered World Map.png is
preserved under Art/source/story/world-map and installed as opaque Story scenery. This is the background for the implemented
150-stage Story campaign, not a new activity or an alternate stage layout.
[Campaign rules](../../docs/story-and-training.md) /
[Region creatures and arenas](../creatures/story/README.md).

## One connected world

Six regions follow the canonical order: Infernic **Emberwake March**, Oceanic
**Glasswater Reach**, Atmospheric **Stormspan Heights**, Botanic **Rootstone
Wilds**, Tranquilitic **Stillhalo Vale**, Chaotic **Riftbound Frontier**.
The image contains six landforms and six architectural beacon landmarks, not
150 miniature nodes. Names, stage numbers, paths, current selection, locks and
progress remain accessible HTML controls above the image.

**Proposed export:** `story-world-map.png` at16:9, at least1920x1080.
Preserve the opaque supplied original under `Art/source/story/world-map/`.
After review, export to `public/assets/backgrounds/story-world-map.png`.
D-171 uses these source/runtime destinations; labels and locks remain HTML.

```text
wide illustrated world map background for an original chibi fantasy gacha JRPG, one continuous small continent seen from a gently elevated overhead cartographic angle, six distinct connected regions in a readable broad horseshoe journey from lower left clockwise toward lower right, first a warm rust-red cinder march with cooling charcoal terraces and one squat ember beacon, second a cobalt and turquoise glasswater coast with ivory broken causeways shallow sea shelves and one submerged bell tower rising above the water, third pale blue stormspan heights with floating rounded ridges white cloud bridges and one wind beacon, fourth a moss-green rootstone wilderness with rounded earthen terraces interwoven roots and one buried garden beacon, fifth a pearlescent ivory stillhalo vale with quiet pale gardens sheltered sanctuaries and one vow beacon, sixth an ink-black and plum riftbound frontier with violet fractured plateaus and one split geometric beacon, preserve this exact terrain order and keep all six region centers visually distinct, transitions blend through natural shorelines cloud banks foothills and low valleys rather than six boxed panels, original compact storybook environmental architecture clean precise anime contours crisp cel shading smooth painted highlights harmonious jewel-like terrain colors, consistent miniature landscape scale across all regions, ornate region landmarks and small distant ruins concentrated toward outer terrain edges, broad quiet low-detail interiors leave room for separately overlaid region buttons, no baked-in trails markers lettering or controls, full-bleed illustrated scenery extending to every canvas edge, balanced muted charcoal sea around the continent, warm soft environmental daylight over the first four regions pearlescent afternoon over the fifth and restrained violet dusk over the sixth, readable silhouettes and controlled local contrast, all six important beacon landmarks safely inside the central eighty percent of the canvas so responsive framing does not cut them off, scenery only --ar 16:9 --niji 6 --s 100 --q 1 --no characters, people, creatures, monsters, portraits, weapons, text, letters, lettering, words, numbers, typography, captions, labels, signatures, runes, logo, watermark, interface, buttons, health bars, stage nodes, map pins, dotted routes, arrows, compass rose, legend, card border, panel grid, white border, photorealism, 3d render, gritty texture
```

## Generation and review

- Reference-free scenery: no `--sref` or `--sw`. Preserve the same clean
  anime/cel/painted renderer as the elemental dungeon environments, not a
  parchment map, realistic atlas or UI screenshot.
- Full-bleed opaque scenery; do **not** background-remove it. Natural lighting
  is allowed here; the keyed-cutout no-glow rule does not apply to scenery.
- Midjourney may not obey exact ordering, region count or composition. Review
  all six terrains and the journey order before acceptance; reject incomplete
  layouts rather than claiming the text guarantees a usable map.
- Check desktop and narrow/mobile layouts with the actual six region controls.
  Keep names and locked-state labels legible independently of the image.
  Use a separate responsive layout/contain strategy if all six regions would
  be lost by blind cover cropping; do not hide functional controls to fit art.
- Preserve original bytes and record dimensions/hash at intake. Keep the
  reviewed opaque map; do not key or crop away its regional terrain.
