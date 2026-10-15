# Story campaign and endless Training (D-160/D-164)

**D-294 final loot:** every regional boss (25/50/75/100/125/150) awards5x its
existing per-kill Prismatica/material quantities on every clear and replay.
Sample base quantity first; material chances remain unchanged. Regional
first-clear Prismatica/Null-Prismatica bonuses remain separate and unchanged.
Training has no endpoint and receives no multiplier.
[Shared contract](free-battle.md#repeatable-final-boss-loot-d-294).

**D-269 narrative:** [Let and Rise's founding canon](world-lore.md) now drives
the shared prologue, six regional introductions and boss conclusions.
Beacons reopen routes while both factions seek their creator's soul.
Stage150 does not recover a soul or declare a victor. All stage identities,
art, difficulty, unlocks and rewards remain unchanged.

**D-275 future story, not implemented:** this campaign is the foundation for
Chapter1, **Search the Six Beacons of Emotion**. Rise's transcription shards
and the future final-boss machine/note/wisp are documentation-only, as are
Nyrasma's125 stages, the75-stage pursuit and Chapters3-7.
[Spoiler roadmap and unresolved details](story-roadmap.md).
The [Music library](../Music/README.md) supplies generation briefs for the
Main Theme, all six regional battle themes and every current battle activity;
seven delivered tracks are now installed (D-280): the menu theme and one
shared theme for each Story region and matching material dungeon. Training
and other undelivered modes stay silent. See the Music index for assignments,
Settings volume/mute and playback validation.

## Full-map framing and terrain anchors (D-261)

World map uses the installed1456x816 artwork's native ratio, contained inside
the available map area without cover-cropping or stretching. Beacons and roads
share that exact canvas, so letterboxing/resizing never shifts terrain anchors.
Infernic sits on the orange western plateau, Oceanic on the northeastern blue
castle/coast, Atmospheric on the northern cloud mountain, Botanic on the southern
green/gold woodland, Tranquilitic on the southwestern ivory mountain and Chaotic
on the southeastern purple rift. Region sidebar numbering matches map beacons.
Compact maps show44px numbered targets rather than overlapping name/status
labels; full accessible names and sidebar progression remain available.
No artwork, stage locks, rewards, save data or navigation rules change.

## Story-first progression and activity access (D-192)

New starter selection opens Story. Online accounts with fewer than25 Story
clears return to Story; an active online run still resumes first. World map
is the initial Story view, with beacon-to-stage navigation and a direct Team
shortcut. Existing stage/region selections remain transient and history-aware.
Short hints explain replaying for materials, leveling/evolving in Team,
checking enemy levels and bringing healing/shields to bosses.

Activity entry uses the **highest-level owned Element-Bearer**, including one
outside the squad. Captured levels never count. Locks remain visible with
requirements and highest owned level; both browser and server reject bypasses.

| Activity | Entry requirement |
| --- | --- |
| Story / Training | Available immediately |
| Awaken the Machines | Lv.10 and Emberwake March cleared |
| Elemental material dungeons | Lv.30 |
| Heaven / Abyss | Lv.50 |
| Treasury / Sanctuary | Lv.60 |
| Crimson Roses | Lv.75 |
| Elemental War | Lv.85 |

Sequential stage locks still apply. No resources, levels or characters are
granted to satisfy these requirements. Existing active runs keep their frozen
team and may Continue/Retry without reapplying new activity entry gates.
See [combat balance](combat.md#enemy-progression-rebalance-d-192) and
[infusion schedule](gameplay-and-elements.md#two-infusion-modes).

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
- D-289 removes the historical D-192 HP/Attack discounts. Story uses the
  exact same full stats, critical rates and level-based skill strength as every
  other activity for equal level and boss/ordinary rank. Stronger opening growth
  and extra acceleration above25 make higher-level enemies harder; no hidden
  player-level penalty. [Current curve and measurements](combat.md#consistent-level-and-rank-difficulty-d-289).
- Every real spawn uses `enemy-skills.ts`: one skill belowLv50, two at50+,
  with ordinary boss ultimate priority. Existing combat rules remain.

## Loot and first-clear economy

Every kill gives the linear Story Prismatica range from `storyFractalisDrop`
(D-225): minimum `5+2*(level-1)`, maximum double, so5-10 at Lv1 and113-226 at
Lv55, a constant step per level and therefore per stage. Crownfall Treasury
pays exactly this line at the same enemy level on entry, then multiplies it up
to20x by Lv120. Kills also give matching-element **Common** materials and
**Uncommon** materials from the first Story enemy onward; no Rare/Epic/Legendary/Omnic material, specialty,
Conduit, component, recruitment or capture is eligible in Story.

Common minimum grows quadratically from1 atLv1 to3 atLv55, maximum twice
minimum. Uncommon uses that quantity range and a linear25% chance atLv1 to80%
atLv55. Both tiers reuse the existing dungeon material IDs/art/recipe meaning.
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
  identities, actual loot gates/ranges, equal-level/rank encounter parity,
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
