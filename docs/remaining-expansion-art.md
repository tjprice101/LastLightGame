# Remaining expansion: artwork still needed

No Moon/Sunshade source PNGs have been delivered or installed. All images
below are prompt-only. Midjourney tokens are **not** a prerequisite to
implementing the approved features; neutral named UI remains until reviewed
art intake. These counts cover the remaining expansion, not replacements for
the already-installed roster, currency, universal actions or Phase1 War art.

**Current redesign (2026-11-05):** counts are unchanged. Sunshade is now
black/white with deep-orange/pearlescent-pink solar energy; its characters,
associated art and activity family follow that direction. Moon Ilyss/Asteriel/
Serapha portraits and all Moon associated art use vividly colored blue-purple
lunar motifs. Other three Moon portraits remain intact. Use the regenerated
packs, not older monochrome/gold-only prompt copies.

## Copy-ready documents

- [Moon: characters, abilities, Masters, statuses and scenes](../Art/characters/Glow%20of%20the%20Moon's%20Light.md)
- [Sunshade: characters, abilities, Masters, statuses and scenes](../Art/characters/The%20Angel-blazened%20Sunshade.md)
- [Both signature activities: enemy forms and Seed→Soul materials](../Art/creatures/Moon%20and%20Sunshade%20Events.md)
- [Approved identity/appearance rows](moon-sunshade-character-design.md)
- [In-game kits and personal Master effects](moon-sunshade-kit-specification.md)
- [Activity, enemy and material-chain specification](moon-sunshade-events.md)

Reproduce packs with:

```text
python tools/build_moon_banner_art.py
python tools/build_sunshade_banner_art.py
python tools/build_seasonal_event_art.py
python -m unittest discover -s tools -p test_seasonal_art.py
```

## Required images

| Category | Moon | Sunshade | Combined | What to deliver |
|---|---:|---:|---:|---|
| Element-Bearer portraits |36|36|72|Common→Omnic for each of twelve six-star bearers;4:3 cutouts |
| Passive/Skill1/Skill2/Last Flare icons |24|24|48|Four character-specific1:1 object-only icons each; costume/equipment/power identity mandatory |
| Personal Master Conduits |18|18|36|Three distinct1:1 luxury mechanical Masters each |
| Native/Master status pictograms |11|10|21|Individual1:1 named symbols; numeric clocks/owners remain HTML |
| Signature activity Devourer forms |6|6|12|Vesperwing and Solcarapace six fixed forms each;4:3 cutouts |
| Seed/Bud/Bloom/Crest/Heart/Soul materials |6|6|12|Moonwake and Dawnforge, six1:1 images each |
| Summoning banner / event splash |1|1|2|One shared16:9 scene each, not separate copies or a reward portrait grid |
| Activity header |1|1|2|One3:1 scene each |
| Battle arena |1|1|2|One16:9 empty-lane scene each |
| **Required subtotal** |**104**|**103**|**207**|All still pending |

### Character delivery groups

Moon: Maerion, Caevren, Vespera, Ilyss, Asteriel, Serapha.
Sunshade: Rhaziel, Oryn, Thessara, Elaris, Veyr, Aureth.
Each group needs its36 portraits,24 ability icons and18 Masters.
Fixed natural features never silently change; Common remains simple and
late forms retain earlier architecture. Titles are in the pack tables.

Moon statuses: Unreturned, Load, Beacon, Signal, Severance, Promise, Shelter,
Flourish, Moonflower, Interval, Ceasefire.
Sunshade statuses: Repair, Terms, Accord, Reserve, Branch, Open Route,
Fault, Aftershock, Lead, Momentum.

## Optional showcase illustrations

| Category | Moon | Sunshade | Combined |
|---|---:|---:|---:|
| Standalone signature-equipment illustration per character |6|6|12|

These are explicitly **optional**, not missing shared Normal Attack/Defense
art and not a prerequisite for displaying kits. They are included in the
copy-ready packs so the owner can generate them later if desired.

## No duplicate image requests

- Normal Attack and Defense remain the delivered shared universal icons.
- Shared Burn/Weaken and existing currency/material UI assets remain shared.
- Event captures and bosses reuse the appropriate authored enemy-form source.
- Same-event captured forms provide infusion fodder; no seventh material,
  specialty chain or separate fodder picture is requested.
- One scene source serves banner and event splash. Reviewed crops/resizes,
  transparency exports, AVIF derivatives and URL revisions are not new source
  images.
- Calendar, mailbox, gifts, markers, Master bulk rewards and ordinary material
  shop use native accessible controls and existing item artwork. No additional
  generation is needed for functional UI.
- No invented event map, separate chest, profile portrait or extra arena.

## Delivery and review

Preserve original source bytes, per-source settings/hashes and previous
runtime generations. Supplied alpha is authoritative. RGB cutouts need
reviewed offline key/background removal; do not globally delete pale
metal/gems or matching painted powers. Scenes remain opaque full-bleed.
Complete designs need15% uninterrupted safety margins on all cutout edges;
padding cannot reconstruct source-clipped tips. Portrait references alone
use exact guide URLs at150; expired URLs need owner renewal. All other
requests are reference-free. Verify actual generated pixels, then shared
deployment-base revisioned resolvers across every surface.

## Total images needed

**207 required images.**

**12 optional signature-equipment showcases.**

**219 images including every optional illustration.**
