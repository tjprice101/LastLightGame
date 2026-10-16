# Remaining artwork: current generation queue

## Copy-ready packs

| Pack | Images | What to generate |
| --- | ---: | --- |
| [Calamity](creatures/Calamity.md) |0|All18 images installed, including The Last Scarlet Bloom|
| [Native identity symbols](ui/Native%20Identity%20Status%20Icons.md) |0|All27 delivered symbols are archived, cleaned and installed (D-323)|
| **Current queue** |**0**|Both requested production packs are installed; prompts remain generation references|

The owner explicitly chooses **three chest images total**, shared by all
activities according to Slayer/Master/Omnipotent tier, and **three arena images
total**, shared by all activities according to EX+1/2/3 tier. Activity names,
levels and reward contents remain separate HTML. This supersedes the earlier
36-chest art request and no-new-arena direction, not the mechanics.

Bosses remain twelve distinct identities, one image per activity reused across
all three levels. Suggested detailed visual designs in the pack are generation
proposals. All twelve delivered bosses are reviewed and installed.

## Native status delivery complete

Twenty-seven status symbols inside ability-icon picture frames now complement
exact native-state text. Original bytes are archived under
`source/abilities/native-statuses`; transparent256px exports preserve the
frames and illustrated inset panels. Existing Burn and shield artwork is reused;
counts and expiry remain HTML. [Reproduction and checks](../docs/art-workflow.md#delivered-native-identity-status-icons-d-323).

## What does not need regeneration

A2026-10-15 catalog/filesystem check found:

- All85 ordinary Conduits and48 Master Conduits have their referenced PNGs.
- Cosmic Grand Master Chest and Astral Reserve artwork already exist.
- All48 current elemental, specialty and Rosethorn material definitions resolve
  to installed PNGs, including the items used in Calamity chest loot.
- All163 catalog creature identities have installed referenced PNGs after
  D-318 intake, including all twelve Calamity bosses.
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
missing artwork in the completed native/Calamity production queue. The three actual
War activity banners/arenas and all required ability icons are already installed.
Old prompt-pack statements that25 kit Conduits or48 Masters are still pending
are historical; the intake records and actual exports take precedence.

## Delivery and installation boundary

Generate one image per filename, not a contact sheet. Preserve original
high-resolution PNGs. Use4:3 boss cutouts,1:1 chest/status icons and16:9 arenas.
Cutouts retain their specified flat contrasting key and complete margins;
scenery is opaque/full-bleed. Never manually erase matching pale subject colors.

Creating prompts did not install images. The subsequent D-318 intake archives
all18 delivered originals under `Art/source/calamity`, exports reviewed cutouts
and pixel-intact arenas, and connects their shared byte-revisioned resolvers.
Updated Heavenfall Seraph/White Pyre Hierophant originals live in its
`replacements` subfolder; initial sources and prior exports remain preserved.
Inventory/results/reveal/loot share tier chest art; each tier shares its arena.
Boss discovery, field and cut-ins share each reviewed boss. Archived originals
remain intact; verified duplicate root copies were removed at the owner's
request. No account, reward or combat-rule changes are part of intake.

Reproduce both prompt packs:
`python tools\build_pending_art.py`.
Validate:
`python -m unittest discover -s tools -p test_pending_art.py -v`.
