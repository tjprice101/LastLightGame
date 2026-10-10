# Art library

**Current character generation policy (D-159):** all16 lines use individually
locked subject palettes and explicit unwanted-color negatives. Keep exact
portrait references at150; icons/weapons remain reference-free.
[Workflow and validation](../docs/art-workflow.md#character-palette-control-d-159-current-policy).
Installed imagery is unchanged; generated results still require visual review.

The physical filing pass is complete (D-160). Prompt packs now live under
`characters`, `creatures`, `conduits`, `items`, `ui` and `guides`; activity
subpacks remain together under `creatures/dungeons` and `creatures/gamemodes`.
Mixed Starter Art stays with characters; mixed activity/loot/scenery packs stay
with creatures rather than splitting copy-ready packs. Experiments stay separate.
Sources stay under `source`; records/settings now live under `provenance`.
No original, runtime image, recorded source path or recorded hash was rewritten.

## Characters

- Starter lines: [Infernis](characters/Infernis%20Art.md), [Tizu](characters/Tizu%20Art.md),
  [Flora](characters/Flora%20Art.md); [shared starter history](characters/Starter%20Art.md).
- Rose lines: [Rosetta](characters/Rosetta%20Art.md), [Thornia](characters/Thornia%20Art.md),
  [Crinso](characters/Crinso%20Art.md).
- Other lines: [Atmoso](characters/Atmoso%20Art.md), [Aurora](characters/Aurora%20Art.md),
  [Bliss](characters/Bliss%20Art.md), [Bruno](characters/Bruno%20Art.md),
  [Disciple](characters/Disciple%20Art.md), [Elise](characters/Elise%20Art.md),
  [Razor](characters/Razor%20Art.md); [flagship overview](characters/Flagship%20Characters.md).
- Elemental War: [Nerithe](characters/Nerithe%20Art.md), [Orvella](characters/Orvella%20Art.md),
  [Vaelor](characters/Vaelor%20Art.md), [mode scenery](ui/Elemental%20War.md).

## Creatures and activities

- [Story region packs](creatures/story/README.md):30 original creature cutouts
  and six elemental-dungeon-style battle arenas; [world map](ui/Story%20World%20Map.md).
  D-171/D-178 install all30 supplied creatures/six arenas/original map.
  The new World Map.png is excluded from this intake at owner direction.
- [Elemental dungeon packs](creatures/dungeons/README.md).
- [Heaven/Abyss packs](creatures/gamemodes/README.md).
- [Machines](creatures/Awaken%20the%20Machines.md), [Treasury](creatures/Crownfall%20Treasury.md),
  [Sanctuary](creatures/Rosethorn%20Sanctuary.md), [Crimson Roses](creatures/Passion%20of%20Crimson%20Roses.md).
- Historical: [Flaming Depths](creatures/Flaming%20Depths.md).

## Items, actions and scenery

- [Conduits](conduits/Conduits.md), [35 added Conduits](conduits/Conduit%20Expansion.md).
- [25 reborn Omnic kit Conduits](conduits/Kit%20Conduits.md): D-176 converts
  existing25 IDs to unique new Omnic mechanics/full elemental masterpieces;
  individual palette locks, original Machines Omnic epicness; icons still pending.
- [Currencies](items/Currencies.md), [Components](items/Broken%20Mechanical%20Components.md).
- [Universal actions](ui/Universal%20Action%20Icons.md), [Battle statuses](ui/Battle%20Status%20Icons.md):
  D-173 nine-symbol shared elemental-family/Rose checklist, replacing40;
  D-175 all nine delivered, reviewed and installed.
- [Element emblems](ui/Element%20Emblems.md), [Archives](ui/Archives.md),
  [Summoning](ui/Summoning%20Banners.md), [Battle scenery](ui/Battle%20Scenery.md),
  [Flaming Depths scenery](ui/Flaming%20Depths%20Scenery.md).

## Contracts, originals and review

- [Shared renderer/reference guide](guides/midjourney-character-style-prompt.md).
- [Cutout/background contract](guides/cutout-background-contract.md).
- [Source collections](source/) retain supplied originals and prior versions.
- [Provenance and processing records](provenance/) contain `*-intake.json`,
  `*-settings.json` and reviews. Tools resolve their new physical locations through
  [art_library.py](../tools/art_library.py); the records themselves stay byte-identical.
  Never re-key supplied alpha or rewrite recorded source paths/hashes for filing.
- [Workflow](../docs/art-workflow.md) and [handoff](../docs/handoff.md).

## Experiments

- [Enemy style/palette pilot](experiments/Enemy%20Style%20Pilot.md):
  three low-weight reference alternatives, not production pack replacement.
