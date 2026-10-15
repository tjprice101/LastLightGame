# Remaining artwork: current generation queue

## Copy-ready packs

| Pack | Images | What to generate |
| --- | ---: | --- |
| [Calamity](creatures/Calamity.md) |1|The Last Scarlet Bloom boss; the other17 images are installed|
| [Native identity symbols](ui/Native%20Identity%20Status%20Icons.md) |27|Small pictograms for the new native states; not replacement ability art|
| **Current queue** |**28**|Original PNGs; filenames and individual prompts are in the packs|

The owner explicitly chooses **three chest images total**, shared by all
activities according to Slayer/Master/Omnipotent tier, and **three arena images
total**, shared by all activities according to EX+1/2/3 tier. Activity names,
levels and reward contents remain separate HTML. This supersedes the earlier
36-chest art request and no-new-arena direction, not the mechanics.

Bosses remain twelve distinct identities, one image per activity reused across
all three levels. Suggested detailed visual designs in the pack are generation
proposals. Eleven delivered bosses are reviewed and installed; only the Rose
boss is still pending.

## Generation priority

1. The Last Scarlet Bloom boss cutout, reused across the three Rose EX tiers.
2. Twenty-seven status symbols over trophy-like crest/pedestal backings:
   complements exact native-state text. The backing is part of the cutout
   emblem, not scenery; use each character's palette, not blanket gold. Existing
   Burn and shield artwork is reused; counts and expiry are never painted text.

## What does not need regeneration

A2026-10-15 catalog/filesystem check found:

- All85 ordinary Conduits and48 Master Conduits have their referenced PNGs.
- Cosmic Grand Master Chest and Astral Reserve artwork already exist.
- All48 current elemental, specialty and Rosethorn material definitions resolve
  to installed PNGs, including the items used in Calamity chest loot.
- Of163 catalog creature identities, only The Last Scarlet Bloom lacks art;
  all162 other identities have installed referenced PNGs after D-318 intake.
- All three shared Calamity tier chest icons and all three arenas are installed.
- Current character portraits, profile portraits and action icons are retained.
  The new kits deliberately reuse the installed character-specific ability
  artwork. Normal Attack and Defense are shared universal images; missing
  historical Nerithe-specific Normal/Defense art is not a live dependency.
- Tiered leveling, Max Level, unequip-all, recipient pickers, error overlays,
  warnings and result panels use accessible HTML/CSS. Do not generate fake UI
  screenshots, embedded labels, numeric readouts or button artwork.
- Existing activity and summon scenery is not replaced by the Calamity queue.
  No additional Calamity banner or menu-background image is currently required.
- Radiant attack VFX are procedural; this request does not require Midjourney
  animation frames, sprite sheets or replacing the existing VFX renderer.

## Older optional generation-only pieces

The [Elemental War family banner](ui/Elemental%20War.md) and standalone
Nerithe/Orvella/Vaelor weapon illustrations have existing prompts but no
installed production slots. They are optional concept/delivery backlog, not
missing artwork in the current28-image production queue. The three actual
War activity banners/arenas and all required ability icons are already installed.
Old prompt-pack statements that25 kit Conduits or48 Masters are still pending
are historical; the intake records and actual exports take precedence.

## Delivery and installation boundary

Generate one image per filename, not a contact sheet. Preserve original
high-resolution PNGs. Use4:3 boss cutouts,1:1 chest/status icons and16:9 arenas.
Cutouts retain their specified flat contrasting key and complete margins;
scenery is opaque/full-bleed. Never manually erase matching pale subject colors.

Creating prompts did not install images. The subsequent D-318 intake archives
the17 delivered originals under `Art/source/calamity`, exports reviewed cutouts
and pixel-intact arenas, and connects their shared byte-revisioned resolvers.
Inventory/results/reveal/loot share tier chest art; each tier shares its arena.
Boss discovery, field and cut-ins share each reviewed boss. Root originals
remain intact. No account, reward or combat-rule changes are part of intake.

Reproduce both prompt packs:
`python tools\build_pending_art.py`.
Validate:
`python -m unittest discover -s tools -p test_pending_art.py -v`.
