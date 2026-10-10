# Story campaign and endless Training (D-160/D-164)

## Approved scope and implemented behavior

The owner approves the six-region linear campaign and later directs work to
this next major phase, deferring the remaining intrinsic character redesign.
Story is playable: **six elemental regions,25 stages each,150 total,
enemy levels1-55**. The previous endless Adventure remains playable as
**Training**, without resetting character/account progress.

Home's main activity shortcut opens the Story world map. Gameplay defaults to
Story and offers Training separately. The existing `#gameplay-adventure` URL
remains the Training-category alias; legacy `adventure:*` creature discoveries,
images and the underlying endless engine remain stable. The opening prologue
is retained as a disclosure inside Story, not removed.

## Linear regions and original creatures

| Order | Element / region | Global stages | Enemy levels | Four ordinary identities | Regional boss | First-clear Prismatica / Null-Prismatica |
| --- | --- | --- | --- | --- | --- | --- |
|1 | Infernic / Emberwake March |1-25 |1-10 | Cinderling, Ashback Boar, Coalcrest Moth, Furnace Jackal | Kilnheart Warden |1,000 /50 |
|2 | Oceanic / Glasswater Reach |26-50 |10-19 | Tideglass Crab, Foamfin Drake, Pearlshell Turtle, Current Ray | Deepbell Leviathan |1,150 /58 |
|3 | Atmospheric / Stormspan Heights |51-75 |19-28 | Cloudhorn Ram, Staticwing Kite, Gusttail Lynx, Thundercoil Serpent | Tempest Crown Roc |1,323 /66 |
|4 | Botanic / Rootstone Wilds |76-100 |28-37 | Mossplate Beetle, Briarback Stag, Loamjaw Mole, Fernmantle Basilisk | Heartwood Colossus |1,521 /76 |
|5 | Tranquilitic / Stillhalo Vale |101-125 |37-46 | Ivoryveil Moth, Dewhalo Hart, Vowcrest Crane, Opalward Lion | Serene Oathkeeper |1,749 /87 |
|6 | Chaotic / Riftbound Frontier |126-150 |46-55 | Riftfang Hound, Splinterhide Lizard, Voidcrest Raven, Faultcoil Wyrm | Fracture Sovereign |2,011 /101 |

These names, short regional introductions/conclusions and first-pass combat
tuning are original developer content within the approved scope, not
owner-authored lore or coefficients. D-171/D-178 owner deliveries install all30
creatures, six regional arenas and the original world map. D-178 adds Emberwake's
five reviewed transparent cutouts and intact arena; the newer root World Map.png
is explicitly excluded from this intake. Images do not introduce captures
or new rarity forms.

**D-168 art generation:** [six region packs](../Art/creatures/story/README.md)
provide all30 exact creature identities and six empty side-view battle arenas
matching the elemental dungeon renderer and standing-lane composition.
[World map prompt](../Art/ui/Story%20World%20Map.md) covers six connected regional
terrains; names, locks and150 stage controls remain accessible HTML, not baked
into generated art. Individual palettes/reference-free enemy cutouts keep
complete silhouettes and unlit solid keys; scenery stays opaque/full-bleed.
These prompts do not register nonexistent files or change rewards/rarity/forms.
Deliver originals under Art/source/story, never the repository root.
Validate `python -m unittest discover -s tools -p test_story_art_prompts.py`;
D-171 installs the actual reviewed31-image delivery; remaining Infernic imagery
stays pending. Prompt files remain the generation reference, not source images.

- Every ordinary stage has two enemies, each uniformly sampled from its
  region's four identities; duplicates are allowed. Stage25 of each region has
  one distinct boss. Other regional stages are not boss stages.
- Global level is `round(1 + (stage-1)*54/149)`. Identity stays stable while
  enemy power grows; no new creature evolution/capture system is implied.
- Use a separate xorshift encounter stream, seeded from the battle seed with
  the established salt and continued across stages. Sampling never consumes
  combat, loot, capture or premium RNG.
- Story uses `stat-growth.ts`'s shared ordinary/boss curves with lower HP bases
  and a Story difficulty envelope:40% resulting HP,50% resulting Defense.
  D-165 sets opening Attack16/24 with half the shared .12 staged Attack curve,
  giving ordinaryLv13 enemies40 Attack instead of4. This keeps Story easier
  than overlapping material dungeons without harmless early hits. This is tuning, not a change
  to dungeon/Training/farm endpoints.
- Every real spawn uses `enemy-skills.ts`: one skill belowLv50, two at50+,
  with ordinary boss ultimate priority. Existing combat rules remain.

## Loot and first-clear economy

Every kill gives the ordinary level-scaled Prismatica range from
`fractalisDrop`, plus matching-element **Common** materials. **Uncommon**
materials unlock at enemyLv23; no Rare/Epic/Legendary/Omnic material, specialty,
Conduit, component, recruitment or capture is eligible in Story.

Common minimum grows quadratically from1 atLv1 to3 atLv55, maximum twice
minimum. Uncommon uses that quantity range and a linear25% chance at23 to80%
at55. Both tiers reuse the existing dungeon material IDs/art/recipe meaning.
These quantity/chance curves are editable developer tuning.

On an account's first successful regional boss clear, the ordinary kill
transaction also adds the table's bonus. Base1,000 Prismatica /50 premium
grows by exact15% compound per region, rounded to whole units independently
from the original base, not repeatedly from rounded prior rewards. Integer
ratio arithmetic avoids floating-point half-rounding errors (e.g.57.5 ->58,
1,322.5 ->1,323). Replaying a boss never repeats this bonus.

No other Story premium income, stage-clear payout, Claim button, reroll,
automatic resource grant or capture has been added. Existing First Fracture
and other activity income remain unchanged.

## Account transactions and run boundaries

- Optional walletv4 `storyCompleted` is the highest sequential cleared global
  stage, integer0-150. Missing legacy state means0 on read, without writing.
  No old Training progress is treated as Story completion.
- Entry is free. Unlock is `min(150, completed+1)`; cleared stages remain
  replayable. A locked stage fails explicitly in both entry UI and reward
  validation. Every new run uses the actual saved1-3-member squad, including
  captured leaders/duplicate-species distinct copies.
- Discovery commits on entry. Kill rewards/discovery/UUID receipt persist
  immediately even before an ordinary encounter is cleared. Completion
  requires every enemy dead and its run receipt saved. The last kill atomically
  saves materials, currencies, discoveries, receipt and next-stage progress.
- A boss's first bonus uses that same write. The save boundary validates exact
  stage, region, enemy count/source/identity/level, ordinary currency range and
  actual permitted material pool; forged rewards/high-tier items are rejected.
  Safe-integer overflow or failed writes leave the whole raw wallet intact.
- Only after successful persistence does the actual boss reward event receive
  its first-clear amount/premium annotation. Existing loot/results then show
  exactly saved totals, including the bonus, without another transaction.
  Failed saves never decorate events or consume eligibility; retry pays once.
- Run IDs prevent repeated kill payouts; persistent completion prevents first
  bonuses on new-run replays. Stage advancement remains manual.
- Continue restores HP/cooldowns/encounter-local resources and retains each
  member's independent Gauge. It crosses regional boundaries and uses the
  frozen roster/progress/gear/upgrades/captured kits, not later menu equipment.
  Stage150 has no Continue. Retry replays the same stage with fresh run ID and
  the existing run snapshots.
- Settings keeps the encounter. Quit returns the contextual entry/map and
  retains all earned rewards. Reload ends the run, preserving account progress.
  Local storage retains its existing single-tab, non-authoritative limitation.

## Delivered artwork (D-171)

Shared `content/story-art.ts` owns only supplied regional IDs and scenery.
`storyCreature` carries art into both catalog and combat spawns, so field sprites,
level50+ skill/ultimate cut-ins and discovery-gated Collections use identical
exports without changing stable IDs/names. Reviewed `unit-facing.ts` metadata
keeps enemies right-facing or preserves genuine front poses. Shared assetUrl
uses Vite's deployment base and byte-derived Story URL revisions everywhere.

Enemy originals are preserved under Art/source/story/<element> and cleaned
only offline using reviewed per-source keys/enclosed-gap settings; supplied real
alpha bypasses key removal. Arenas/map stay opaque full-bleed, not cutouts.
The entire world-map image is rendered at its natural aspect ratio with width100%
and automatic height, never cover-cropped. Region/stage buttons remain accessible
HTML below it, with all six regions, real locks and exact progress preserved.
No baked map label replaces controls, no new region position is guessed.

## Map and accessibility

Six connected region buttons show canonical emblems, names and lock/completion
state. Only one regional25-stage panel is displayed at a time; region previews
are readable while locked but their entry buttons stay disabled. Each stage has
an explicit accessible region/stage/level/boss/cleared/locked label. Current
stage, first-clear-only rewards, prologue and exact completion count remain
visible. Region selection is transient and restored during menu visits.

Desktop layout is neutral charcoal with associated elemental accents, visible
focus and44px+ targets. Hover transitions respect both device and saved reduced
motion. Battle uses existing loading/entrance/action locks, results/cut-ins,
speed controls and Settings, not a second battle UI.

Creature Collections registers all30 stable `story:<element>:<identity|boss>`
IDs. Seen/defeated gating remains; per-stage loot comes from Story's runtime
source of truth and clearly marks boss bonuses as account-first-clear only.
Captured character galleries/pools are unchanged because Story cannot capture.

## Validation

- `src/game/story.test.ts`: all150 stages, exact six reward pairs,30 unique
  identities, actual loot gates/ranges, easier overlapping dungeon encounters,
  separate continuing RNG, mixed/all-captured snapshots, legacy read-only
  behavior, partial clears, atomic first/replay/deduplicated rewards, overflow,
  denied-write retry, forged/locked/rewardless clears, real Burn kills,
  world-map enabled states, Training preservation and final-stage controls.
- Shared content/discovery/economy/UI/result/chrome regressions remain active.
- `npm test -- src\game\story.test.ts src\content\creatures.test.ts src\presentation\battle-results.test.ts src\presentation\sanctuary.test.ts src\presentation\activity-banner.test.ts src\presentation\ui-copy.test.ts --maxWorkers=2`
- `npm test -- --maxWorkers=2`
- Build Last Light task: `npm run build`.

Use disposable browser accounts only for map/kill/Continue/first-clear/replay
checks; never modify the owner's save. Art suites are not required for this
runtime-only phase. Story creature/scenery art delivery, remaining intrinsic
roster redesign and the broader desktop UI overhaul remain separate work.
