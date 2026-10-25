# Calamity Mode (D-308 / D-315)

## Activity-specific chest guarantees (D-409)

Machine's Master Chests now come only from the normal final Awaken the
Machines boss (unchanged50% independent drop) and the **Machines EX+3 chest**
(exactly two). Other Calamity chests no longer award them. Previously owned
Master Chests are preserved. This supersedes the all-EX+3 guarantee in D-315.

Soar to Heaven, Delve into the Abyss and Passion of Crimson Roses chests each
guarantee **1 / 2 / 3 Omnic Roselius copies** at EX+1 / EX+2 / EX+3.
Every copy is a distinct unlocked playable Elemental-Devourer at Lv.60,
with form6's Stage29 retained kit and validated `calamity-chest` provenance.
No auto-equipping or squad changes. These are additional fixed contents;
currencies, tokens, material bundles and RNG draws/order remain unchanged.
All other activities award no copies; Calamity bosses still drop only a
sealed chest. Ordinary Rose capture eligibility remains source Lv.120 or lower.

Existing unopened chests use these contents on opening. Consumption, copy
UUIDs, currency/material rewards and chest RNG save together once. Denied
writes/overflow preserve all state. Online ambiguous retries return the saved
receipt and identical copy UUIDs, without a second grant. Historical cached
receipts without the new copy-count field remain readable as saved outcomes,
not rerolled under today's rules. No load writes or retroactive awards.
Loot previews, tier panels and opening receipts display the exact guarantees
and actual Roselius artwork; client and matching authority deploy together.

## Chest artwork and current name (D-405)

Master choice chests are now **Machine's Master Chests**; older Cosmic Grand
wording below names the same stable item. Calamity victory chests have large
dedicated receipt rows (up to240 by200px) and96px field drops with chest-aware
spacing. Opening receipts enlarge awarded Master chests without showing the
consumed Calamity chest as loot. See [chest presentation](menus-and-inventory.md#chest-presentation-d-405).
All tier contents, rates and saved transactions are unchanged.

## Non-Calamitic endgame benchmark (D-404)

Current difficulty follows the [global benchmark declaration](enemy-benchmark-calibration.md)
and [canonical character report](roster-capability-audit.md), with personal
Masters but **no Calamitic Conduits** in calibration. EX+1/2/3 keep their
145/160/170 levels,1.03/.98/1 multipliers, skills, gates and rewards.
The new shared endurance/burst curve supersedes the D-398 absolute stats.
Exact adjusted Health/Attack/Defense:

| Tier | Level | Health | Attack | Defense |
|---|---:|---:|---:|---:|
| EX+1 |145|791524|11839|2785|
| EX+2 |160|1474668|15772|4195|
| EX+3 |170|2351938|18844|5743|

Every EX+3 boss must have at least two distinct optimized non-Calamitic
team/rotation solutions winning all three calibration seeds. This is not a
promise for every team, nor a claim of optimal human play. Rules11 restarts
historical active encounters with original loadouts and saved rewards retained,
superseding D-398's no-restart policy for this global rules change.

## Calamity tier tuning (D-398)

Owner confirms all12 activities and level170 for every EX+3 encounter, with
simulation-led stat tuning. EX+1 retains level145 with1.03x Health/Attack/
Defense; EX+2 retains level160 with0.98x; EX+3 uses the unmodified level170
boss curve instead of185. Round each adjusted integer stat; leave critical
profile, boss rhythms, playable stats, gear, unlocks and rewards unchanged.
Only Calamity receives these multipliers; the shared hostile curve is intact.
EX+3 remains above EX+2 and EX+1 in every adjusted stat.

Fresh entry and retry use the new definitions, including shared authority.
Current in-progress runs retain their frozen enemy state through Settings/
read; no global rules bump, forced restart, load write or account migration.
Collections, warnings, entry stats and live strength comparisons share the
current definitions. See [measured results](#isolated-stats-and-measured-difficulty).

## Machines chest ownership and component guarantees (D-389)

Applies only to Awaken the Machines Calamity chests, including existing unopened
stacks. Every opening grants one independent inclusive-uniform Broken Mechanical
Components payout: EX+1 3,000-6,000; EX+2 5,000-8,000; EX+3 10,000-12,000.
The existing3/5/7 random bundles and60%100-200 component bonuses remain.
Thus total components can exceed the guaranteed range.

Conduit tier chances remain20% Rare/15% Legendary/5% Omnic per bundle.
Choose uniformly among currently unowned names of that rarity, excluding
names already awarded earlier in this opening. If no names remain, replace
that bundle with an additional independent payout using the same tier range.
Do not reroll into another rarity, grant duplicates or change other activities.
Normal Machines Focus Loot behavior is unchanged.

Opening reads current ownership and saves chest consumption, all rewards,
Focus Loot normalization and the advanced independent chest seed atomically.
Denied writes/overflow preserve the chest, holdings and seed. Cached historical
opening receipts remain valid for idempotent retry, with no retroactive reroll
or component grants. Client and shared authority must deploy together.

## Opened chest loot presentation (D-388)

Every Calamity chest opening reveals its actual saved loot as artwork/name/
quantity cards using the banner result grid. Do not show the consumed
Slayer/Master/Omnipotent chest image on the opening result screen.
Currencies, materials, Conduits, Broken Mechanical Components, Calamitic
Tokens and awarded Cosmic Grand Master Chests use their shared artwork
resolvers; genuinely pending artwork remains a named neutral placeholder.
An awarded Cosmic Grand Master Chest is loot, so its image remains valid.
Do not duplicate the card receipt as a second list below it.

Keep the shared reward dialog's animation, Skip, Continue, Escape,
reduced motion, focus restoration and saved-error behavior. Rendering only
presents the existing saved receipt; no rerolls, writes or claims are added.
Inventory, battle victory receipts, drop art and View Loot retain sealed-chest
art because those surfaces describe the unopened item. Master-choice openings
already show their awarded Master, not a chest, and remain unchanged.
Validate Calamity/reward-screen/Calamitic presentation tests and production
layout at320/390/1280 CSS pixels.

The owner requests implementation with placeholder art and delegates final
boss mechanics, loot weights/quantities and difficulty tuning. Free entry,
no defeat penalty and verifiable-final-clear access are approved. Client/server
implementation is deployed under the2026-10-15 release. D-318 installs the
eighteen delivered images, including the follow-up The Last Scarlet Bloom.

## Current artwork delivery scope (D-317)

Owner now requests the remaining Midjourney art and explicitly chooses three
shared chest images (Slayer/Master/Omnipotent) and three shared arena images
(EX+1/2/3), each reused across all twelve activities. Twelve boss identities
retain one image each across their three levels. This18-image generation scope
supersedes the original36-icon chest plan and previous no-new-arena scope;
new headers/audio remain excluded. Mechanics, chest IDs/names/counts and loot
are unchanged. [Copy-ready prompts](../Art/creatures/Calamity.md) and
[complete missing-art checklist](../Art/Remaining%20Artwork.md).
All twelve bosses, three tier chests and three tier arenas are installed (D-318).
The Last Scarlet Bloom follow-up completes the set. Shared
`src/content/calamity-art.ts` mappings cover catalog/spawns, field/cut-ins,
Play tier cards, Inventory, loot references, drops, results and opening reveals.
Frozen pre-art encounters resolve current artwork without resetting battle or
writing account data. Tier arenas remain pixel-intact opaque scenery; cutouts
use reviewed offline key removal. See [intake workflow](art-workflow.md#calamity-delivery-intake-d-318).

## Difficulty tabs (D-320)

### Compact tier browser (D-327)

D-328 adds larger boss framing and more readable reward rows, shortens the
repeated chest copy and prevents desktop dock labels splitting into individual
letters. While Calamity is selected on narrow Gameplay screens, activity
navigation becomes a compact horizontal chooser rather than a full-height rail;
the currency/utility header and bottom dock retain their actions in compact
44px controls. Normal screens keep their existing composition. Mobile
Calamity art uses a180-240px scene instead of a large square. Exact balances,
rewards, locks, keyboard tabs and native dialogs remain intact. Desktop
panels still fit at1280x720; mobile content scrolls rather than clipping.

The owner rejects the tall, crowded three-column presentation. All twelve
activities and standalone Roses now show EX+1/2/3 as keyboard-accessible tier
tabs, with one boss panel visible at a time. Desktop keeps the boss/arena,
actual stats and signed scaling, fixed chest contents and Enter/View Loot
together. Activity choices become a compact horizontal row while Calamity is
selected; Normal keeps its existing layout and stage controls. Narrow screens
stack without horizontal overflow and retain page scrolling, rather than
clipping rewards or shrinking touch targets.

The boss name and level sit on its scene. Chest names omit the repeated activity
name in the compact preview only; full names remain in loot dialogs and receipts.
Reward names align left, counts right, and token art is22px within the row.
Detailed boss abilities and Calamity rules use existing native Information
dialogs; exact mechanics and weighted loot remain available, not truncated.
D-329: the internal balance target below is never shown to players; the UI
states rules, levels, stats and rewards without recommending team builds.
All buttons retain44px minimum targets. Back restores each selected EX tier
alongside the selected difficulty; Settings retains the current DOM.

Failed boss images show an explicit error and a user-triggered Retry image
button. Retry preserves the canonical path and byte revision, adding only a
cache-busting request parameter; no replacement artwork or automatic retry loop.
No art bytes, combat, unlocks, rewards or account data change.

Investigation on2026-10-16 found all705 deployed PNGs returning200, image/png
and matching local file sizes. All18 Calamity images also matched downloaded
bytes/revisions and decoded in fresh Chrome. The owner's existing-tab failure
was not reproduced; this evidence does not establish its cause or prove it
fixed. Do not claim deleted files or a cache diagnosis without request evidence.

Validation: `npm test -- src/presentation/calamity.test.ts
src/presentation/enemy-strength.test.ts src/content/calamity-art.test.ts
src/presentation/menu-history.test.ts src/presentation/activity-banner.test.ts
--maxWorkers=2` passes89 tests/5 files; `npm run build` passes.
Production-CSS browser checks cover all36 entries at1577x768,1280x720,
1920x1080,390x844 and320x780. Desktop panel bottoms stay within700/696px
at the two smaller desktop sizes; all sizes have no horizontal overflow.
Verify one visible tier, keyboard wrap/Home/End, independent choices, exact
rewards, native dialogs, and an actual blocked-image failure followed by retry.

D-321 aligns tier reward sections and action buttons, lists chest amounts as
name/quantity rows, and omits zero Master-chest rows. View Loot keeps exact
probabilities and quantities without exposing internal weights. Boss descriptions
use plain English and enemy turns instead of developer wording or strategy
claims. Current text resolves across entry cards, warnings, battle references
and Collections. D-327 supersedes its three-column square previews; the scene
still separates the boss from dimmed arena
art; contrast edges also cover field, cut-ins and discovered gallery images.
These are text/style changes, not enemy, loot, unlock or source-art changes.

Each eligible activity has accessible Normal / Calamity tabs. Normal is the
default and retains its existing banner, facts, reward showcase, stage selector
and entry action. Calamity replaces that panel rather than appending below it:
its activity-specific heading, three-tier facts, boss/arena artwork, chest-only
victory drops, fixed chest contents, exact weighted View Loot and EX entry
controls appear together. Normal rewards and controls are hidden in this view.
The standalone Crimson Roses Events page uses the same component.

Tabs support Left/Right wrapping, Home/End, focus and selected-state semantics.
Switching preserves the normal stage selector and DOM without account writes.
Caller-based Back restores each activity's selected difficulty alongside its
normal stage and activity choice; menu Settings retains the existing DOM.
Locked tiers remain visible with their existing requirements, confirmation and
entry validation. Story, Training and Elemental War gain no difficulty tabs.

Validate with `npm test -- src/presentation/calamity.test.ts
src/presentation/activity-banner.test.ts src/presentation/menu-history.test.ts
--maxWorkers=2` and desktop/narrow-browser checks.

## Scope and encounters

Three optional EX challenges for each of twelve activities:

| Activity ID | Activity | Calamity boss |
| --- | --- | --- |
| treasury | Crownfall Treasury | Crown of the Ruined Vault |
| sanctuary | Rosethorn Sanctuary | White Pyre Hierophant |
| heavens | Soar to Heaven | Heavenfall Seraph |
| abyss | Delve into the Abyss | Abyssal Nullmaw |
| machines | Awaken the Machines | Catastrophe Prime |
| roses | Passion of Crimson Roses | The Last Scarlet Bloom |
| infernic | Flaming Depths | Ashcrown Cataclysm |
| oceanic | Oceanic Valley | Leviathan of the White Wake |
| atmospheric | Sky-bound Rift | Riftstorm Harbinger |
| botanic | Garden of Beauty | Pallid Root Sovereign |
| tranquilitic | City of Heaven | Silent Meridian |
| chaotic | Ruins of Chaos | The Scarlet Unmaking |

Exactly36 encounters, twelve boss identities and36 named chest variants sharing
three installed tier images.
Story, endless Training, all three Elemental War activities and unspecified
future events are excluded.

| Stage | One boss level | Guaranteed chest |
| --- | ---: | --- |
| EX+1 |145| EX+Slayer |
| EX+2 |160| EX+Master |
| EX+3 |170| EX+Omnipotent |

The same activity-specific boss appears at all three levels. No ordinary waves,
player cap increase, entry cost, energy or defeat penalty. Normal final victory
permanently unlocks EX+1; EX+1 victory unlocks EX+2; EX+2 unlocks EX+3.
Highest normal *unlocked* stage does not prove its boss was beaten. New actual
final victories record evidence atomically. A historical UUIDv4 run receipt
ending in the exact current normal final-boss ID, paired with final-stage
access for that activity, also qualifies read-only. Partial matches, arbitrary
receipt text, old Machines stage35 and counters alone do not qualify. Players
without verifiable evidence must defeat the normal final stage again.
No load-time writes or retroactive grants.

Calamity is a discriminated activity, never invented normal stage numbers.
Normal stage counts and progress are unchanged. Entry, replay and API access
validate eligibility; retries/replays retain frozen squad, progress, equipment,
upgrades, Masters and captured copies. Settings/resume preserve the encounter.
No auto-advance between EX tiers.

## Chest-only victory

Every victory/replay awards exactly one matching chest, with unlimited replay.
There are no ordinary kill currencies, materials, components, Conduits,
Master-chest rolls, captures or recruitment alongside it. The first clear
unlocks the next EX tier but does not award an extra chest. The normal final
boss5x quantity multiplier affects neither chest counts nor contents.

Chest, tier clear, discovery and deduplicated reward receipt commit atomically.
Results present the saved chest; no second claim or opening occurs on victory.
Open later in Inventory. The stable chest ID is `calamity:<activity>:<tier>`.
Display name: `<Activity name> EX+<Slayer|Master|Omnipotent> Chest`.

| Tier | Prismatica | Null-Prismatica | Independent activity bundles | Cosmic Grand Master Chests | Calamitic Tokens |
| --- | ---: | ---: | ---: | ---: | ---: |
| Slayer |100,000|50|3|0|1|
| Master |250,000|70|5|0|3|
| Omnipotent |500,000|100|7|2|8|

D-324 adds guaranteed tokens without changing existing contents or random
draws. Spend them in the [Calamitic Conduit shop](calamitic-conduits.md);
none of its five creations drop directly. The shop opens after any actual
saved EX clear. Tokens commit with chest opening, not on victory. Existing
unopened chests qualify; opened chests receive no retrospective tokens.

Unlimited guaranteed replay and its repeatable premium/Master income are
intentional. Do not add daily limits, entry costs, diminishing returns or
compensating drop chances. Existing Master chests still select any unowned
Master, including an unowned bearer's; they grant no character or automatic
equipment. If all48 Masters are owned, Master chests remain held, and opening
a Calamity Omnipotent chest must still succeed.

## Exact activity bundle tables

All three EX tiers share their activity's table. Each bundle independently
selects one weighted row and a uniform inclusive integer quantity. Repeated
draws can merge in the receipt. The typed source of truth is
[`src/content/calamity.ts`](../src/content/calamity.ts); normal kill resolvers
are not reused.

| Activity | Exact distribution per independent bundle |
| --- | --- |
| Treasury |70%:25,000-50,000 Prismatica;25%:75,000-100,000;5%:200,000-250,000|
| Sanctuary |70%:5-10 Null-Prismatica;25%:15-25;5%:40-50|
| Heaven |35%:5-10 Crown of the Scarlet Oath;35%:10-20 Chalice of the Undying Dawn;15%:10-20 Epic,10%:6-12 Legendary,5%:3-6 Omnic materials; each elemental tier equally divided among Infernic/Oceanic/Atmospheric/Botanic|
| Abyss |35%:5-10 Heart of the Shattered Void;35%:10-20 Hourglass of Endless Wrath;15%:10-20 Epic,10%:6-12 Legendary,5%:3-6 Omnic materials; each elemental tier equally divided among Tranquilitic/Chaotic|
| Machines |60%:100-200 additional Broken Mechanical Components;20%:one unowned Rare Conduit;15%:one unowned Legendary;5%:one unowned Omnic; exhausted rarities convert to the tier component range above|
| Roses |Seed10%:30-60; Bud15%:20-40; Bloom25%:15-30; Crest25%:10-20; Heart15%:6-12; Soul10%:3-6|
| Each material dungeon |Own-element Common10%:30-60; Uncommon15%:20-40; Rare25%:15-30; Epic25%:10-20; Legendary15%:6-12; Omnic10%:3-6|

No character grants, captured copies, Master unlocks or extra Master chests in
random bundles. Disabled weapon-only materials are excluded. Ordinary Conduit
rewards from Machines chests are unowned-only under D-389, including within
the same opening. No automatic equipment or alteration of saved upgrades.

## Boss skills and counterplay

Skills target one member and retain ordinary critical, Weaken, Defense, shield
and taunt behavior. Ultimate cadence takes priority over primary cadence;
other phases use Normal Attack. Phase numbers start at1. Cadence and numeric
mechanics are exposed before entry and in battle reference.

| Activity | Primary | Ultimate | Distinct behavior / counterplay |
| --- | --- | --- | --- |
| Treasury |Vaultbreaker1.5x every3|Crown Collapse2.4x every6|Defend before phase6; burst between collapses|
| Sanctuary |White Pyre1.3x every2|Reliquary Descent1.9x every5|Refresh barrier to2.5% max HP every3; focus damage to break it|
| Heaven |Scarlet Volley1.25x every2|Heavenfall2.2x every7|Every attack splits total into3 impacts; layer shields|
| Abyss |Nullmaw Hunt1.4x every3|Starless Pursuit2x every5|Targets lowest living HP fraction; heal/protect the weakest member|
| Machines |Prototype Discharge2x every4|Catastrophe Cascade2.7x every8|Charge window uses Normal attacks; save Defense and shielding for discharge|
| Roses |Thorn Requiem1.4x every2|Final Scarlet Bloom2.1x every6|Restores1.5% max HP every4; maintain damage through restoration|
| Infernic |Cinder Torrent1.6x every2|Ashcrown Eruption2.3x every5|Sustained direct pressure; regular Weaken/healing, no new player Burn status|
| Oceanic |White Wake1.55x every3|Leviathan Breach2.2x every6|Refresh barrier to4% max HP every4; save burst for barrier breaks|
| Atmospheric |Riftstorm Talons1.7x every3|Sky Fracture2.3x every7|Every attack splits total into4 impacts; plan mitigation before storms|
| Botanic |Pallid Thorns1.3x every3|Root Cathedral2.1x every8|Restores2.5% max HP every3; sustained damage must exceed restoration|
| Tranquilitic |Meridian Sweep1.6x every4|Silent Convergence2.2x every7|Refresh barrier to2% max HP on even phases; burst through odd-phase openings|
| Chaotic |Fractal Disjunction1.35x every2|Scarlet Unmaking2.1x every5|Targets highest living HP fraction; spread mitigation rather than relying on a wounded tank|

Barriers refresh rather than stack; restoration cannot exceed max HP. Both
occur after a surviving boss's Burn tick and before its attack. HP-target
selection uses stable squad order for ties; active taunts can redirect it.
Multi-impact incoming totals are computed once, split into integer shares with
the remainder on the last impact, and stop if the target falls. Existing
per-impact equipment effects apply.

No instant kills, immunity, revival, lockouts, mandatory enrage, percentage-HP
execution, new consumables or changes to the player's native kit.

## Isolated stats and measured difficulty

D-398 supersedes the former185 EX+3 wall. All hostile modes retain the shared
[curve](combat.md#smooth-exponential-pursuit-and-intentional-walls-d-319);
Calamity alone applies its current tier adjustments after the curve:

| EX | Level | HP | Attack | Defense | Crit |
| --- | ---: | ---: | ---: | ---: | ---: |
|1|145|527,682|14,798|3,095|12%|
|2|160|983,112|22,532|4,794|12%|
|3|170|1,567,959|31,407|6,756|12%|

EX+3 is about59.5% higher Health,39.4% higher Attack and40.9% higher Defense
than the adjusted EX+2. Relative to the previous185 boss, its Health is48.8%
lower, Attack37.3% lower and Defense38.2% lower. These are stat comparisons,
not claims that win probability changes by the same percentage.

Current simulation matrix:8 squads covering all16 Element-Bearers, including
two two-member damage-only controls; all12 activities and3 tiers; seeds
1/1729/104729; natural entry Gauge and real Lv105/Evo6 stats; six gear profiles:
bare, mixed+0, mixed+5, matching Omnic+5 with Masters, that build with
Glassroot/Stasis+5, and Calamitic+5 with Masters. Strong profiles also use a
Last-Flare-first rotation alongside the native-aware pilot. Each variant has
6,912 fights. Prior baseline, proposed tuning and actual implementation were
run separately (20,736 completed fights); every actual result exactly matches
its corresponding proposed-tuning result. No Conduit was nerfed for this task.

| Current build / native pilot | EX1 wins /288 | EX2 wins /288 | EX3 wins /288 |
| --- | ---: | ---: | ---: |
|Unequipped|0|0|0|
|Mixed+0|8|0|0|
|Mixed+5|141|10|0|
|Matching Omnic+5 with Masters|245|87|40|
|Glassroot/Stasis+5 with Masters|273|155|73|
|Calamitic+5 with Masters|209|103|32|

Across all sampled builds/rotations, EX1 wins1,376/2,304; EX2 wins647/2,304;
EX3 wins253/2,304. Timeouts are respectively2/1/8 and are not counted as
defeats. The previous185 EX3 yielded only28/2,304 wins in this same matrix.
Current winning EX3 cases cover all12 bosses and five distinct squad
compositions. Bliss/Razor/Aurora with the legal Glassroot/Stasis/Master build
clears every boss at all three sampled seeds (36/36, native pilot), without
Calamitic equipment. Separate regression tests retain those clears.

These finite seeded pilots demonstrate clearability, not exhaustive balance
or a promise any named team always wins. Full rarity/rank is not automatically
synergy: War-only and two-member damage-only candidates still fail EX3.
No gear entry gate or character/Conduit/stat/cost/reward changes are added.

Reproduce with `node tools\run_calamity_balance.mjs <new-output.jsonl> current`
(or `previous`/`candidate` for the pinned comparison). Existing parent folder
required; exclusive creation protects prior evidence. JSONL rows include
outcome, rounds, survivors, remaining enemy/ally Health, first KO, contributions,
exact squad/build/seed/policy and enemy level. Limits:100 rounds/1,800 decisions.
`tools/calamity-balance.test.ts`, `tools/battle-survey.test.ts`,
`src/game/calamity.test.ts` and authority/presentation tests cover legal gear,
all36 stats/entry/retry paths and measured clears. Simulations never write saves.

## Navigation, warnings and placeholder art

Each eligible activity exposes a separate Calamity section below its normal
stages, without renumbering them. Cards show EX tier, boss, exact level,
single-boss format, guaranteed chest and unmet unlock requirement. View Loot
shows fixed contents and exact bundle odds.

Every entry/replay uses a styled in-game confirmation, adapted to activity/tier:

> Catastrophe Prime - Calamity EX+3, Lv.170. Victory earns one Awaken the
> Machines EX+Omnipotent Chest. No other drops or captures. Entry is free,
> and losing costs nothing.

Include explicit Enter/Cancel, free entry/no defeat penalty and boss counterplay.
Retain focus, keyboard/Escape,44px targets and reduced motion. No browser
alert/confirm/prompt. Results retain manual replay/exit, not automatic advancement.

Inventory groups named tier chests with exact counts, details and explicit
single-chest Open confirmation. Commit the transaction before the existing
skippable reward reveal; reveal never rolls or claims again. Continue/Escape and
focus restoration remain available. No selling, equipping or bulk opening.

Palette: red/white elemental energy against black/white material/body colors;
not a new combat element or global recolor. Named neutral placeholders have no
missing PNG requests or unrelated borrowed artwork. Current delivery requires
twelve boss designs, three shared tier chest icons and three shared tier arenas;
preserve compact anime/cel rendering, full margins and opaque non-glowing
generated cutout powers. Runtime VFX and arena scenery may remain radiant.
New header/audio work is excluded. Boss discovery and Collections use
stable `calamity:<activity>` IDs; none is capturable.

## Persistence and authoritative operation contract

Optional walletv5 fields: `normalFinalClears`, `calamityClears`,
`calamityChests`, `calamitySeed`. Validate activity IDs, tiers, booleans,
safe-integer counts and nonzero uint32 RNG. Old saves read without writes or
loss of unrelated fields; invalid data is rejected rather than overwritten.
Do not infer clears from a highest-unlocked counter or arbitrary receipt text.

`openCalamityChest(id, expectedCount)` rereads holdings and checks stale counts.
It consumes exactly one chest, makes3/5/7 independent draws from its own
persisted stream and validates all merged totals before one save. Denied writes,
overflow or stale holdings preserve chest, currencies, other rewards and RNG.
Normal combat/reward/capture/banner/Master-chest streams are unaffected.

Online entry/replay/open use strict shared schemas, existing request UUID and
revision/idempotency handling, frozen sessions and the same transactions.
Do not weaken Machines-only validation of ordinary direct Master-chest drops:
the EX3 grant is validated through chest opening, not a forged enemy payload.
Never route an unsupported Calamity descriptor to Training.

## Validation and release

Focused suites:

- `src/game/calamity.test.ts`: all36 encounters/chests, weighted row bounds,
  independent3/5/7 draws, no ordinary RNG/rewards, isolated caps, boss
  rhythms/targeting, catalog loot and seeded difficulty targets.
- `src/game/calamity-account.test.ts`: optional-save validation, normal-final
  evidence, sequential locks, receipt retries, forged rewards, discovery,
  atomic opening/stale counts/denied writes/overflow, independent RNG and
  all-Masters-owned handling.
- Calamity presentation/authoritative suites: warnings, access, frozen
  replay/resume, Inventory, exact saved reveal and strict operations.

Before release run targeted and full regression, production build, regenerate
the authoritative engine bundle, server type-check and desktop/mobile browser
checks. Coordinate client/server publication separately; no deployment or
account grants are implied by local implementation.

Local verification: the seven-suite focused command recorded in
[handoff](handoff.md#calamity-mode-implemented-locally-d-315) passed309 tests.
Final full regression passed3,669 of3,670 tests; the remaining inherited
Settings CSS policy failure is unrelated to Calamity. Production TypeScript/
Vite build, authoritative bundle generation and server type-check passed.
Unsaved browser fixtures verified entry/cancellation, neutral boss rendering,
Inventory loot, one atomic EX+3 opening and narrow/desktop saved-reward reveal
containment without modifying real storage. That placeholder-era verification
is historical; [current intake/release verification](handoff.md) supersedes it.
All18 images in the Calamity set are now installed.
