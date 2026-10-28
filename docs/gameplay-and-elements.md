# Gameplay, elements and farming framework

## Current material rewards and infusion layout (D-425)

[D-426](dungeons-and-captures.md#linear-elemental-dungeon-rewards-d-426)
supersedes the dungeon taper: materials start1-2 per rarity unlock and grow
linearly to Seed8-9/Bloom5-6/Shard4-5/Crest2-3/Heart2/Soul1-2.
Dungeon Prismatica grows linearly5-10->15-30, with no boss multiplier.
Soar/Delve and EX+ remain unchanged.

[D-425](dungeons-and-captures.md#material-reward-rebalance-and15-stage-infusion-d-425)
still owns infusion layout and compatibility: dungeons remain35 stages;
Soar/Delve have15 stages, preserving the
normalized Lv.50-120 curve and giving both used specialties1-2->11-23 each.
Weapon drops stop; currencies, captures, EX+ and owned holdings remain unchanged.
Walletv10 preserves historical unlocks and captured-copy kits read-only.

**Status:**150-stage Story, retained endless Training and all six elemental
material dungeons are playable.
The [D-160 migration](six-element-rework.md#implemented-elemental-migration-contract)
replaces ten types with six, preserves all original enemy families/discoveries,
merges materials/unlocks safely in walletv4 and starts dungeons atLv38.
The [Story/Training split](story-and-training.md) is implemented (D-164).
Story has six20-stage regions Lv1-55, Common/Uncommon materials and atomic
first-clear regional bonuses. Training retains the old endless Adventure.
Material inventory, starter leveling/evolution and first-Fracture reward are
persistent. Soar to Heaven and Delve into the Abyss are playable with specialty
rewards (weapon upgrades are now disabled; legacy bonuses remain).
Captures and protected-safe evolution creature infusion are implemented in
Phases6/7. See [creature infusion](evolution-fodder.md) and the
[upgrade balance](units-and-progression.md#first-pass-philosophy-and-editable-costs).

## Activity organization

Activity entry footers show unlock requirements and the highest owned
Element-Bearer level only while locked. Once the current account meets all
requirements, omit that hint entirely, including the completed Machines
regional-clear condition. Stage selectors and enabled entry actions remain;
shared access validation and Information references are unchanged.

Gameplay is a new primary sanctuary tab alongside Home, Character Upgrades and
Events, superseding the earlier exactly-three-screen layout.
It groups **Story**, **Training**, **Elemental material dungeons**, **Evolution infusion**,
**Currency farms**, **Awaken the Machines**, **Elemental War**, and **Events**, with category links to each section.
The [machine activity](awaken-the-machines.md) has100 stages10-120 (D-139),
per-kill Conduits and stage-growing Broken Mechanical Components for upgrades,
not capture/evolution infusion/material/premium rewards. Omnic drops from75;
other activities' stage counts stay unchanged.
Home's campaign shortcut opens the Story map. Training entry starts at wave1.
Quitting ends the run and restores its contextual entry/map; rewards remain.
Settings still retains an active run. The prologue remains inside Story.
Events remains a primary tab as well as a Gameplay category.
[Passion of Crimson Roses](crimson-roses.md) is its first playable event:
35 stages80-140, Rosethorn materials and50% captures only through enemy Lv.120 (D-377).
Existing mode tables/growth/costs below retain their prior120 caps.

## Canonical elements and dungeons

| Element | Affinity | Material dungeon | Infusable enemy source |
| --- | --- | --- | --- |
| Infernic | Fire | Flaming Depths | Soar to Heaven |
| Oceanic | Water | Oceanic Valley | Soar to Heaven |
| Atmospheric | Wind | Sky-bound Rift | Soar to Heaven |
| Botanic | Nature | Garden of Beauty | Soar to Heaven |
| Tranquilitic | Peace | City of Heaven | Delve into the Abyss |
| Chaotic | Dark Matter/Energy | Ruins of Chaos | Delve into the Abyss |

Infernis is Infernic, Tizu Oceanic, Flora Botanic (formerly described as grass).
Existing starter IDs `ember`, `tide`, `sprout` and combat kits remain unchanged.
Each starter now has a canonical `elementId`; display names include the familiar
affinity. Element registration does not grant additional playable characters,
elemental damage bonuses, resistances, or revised battle balance.

## Material dungeon stages

- Exactly **35 stages** per elemental dungeon; Soar/Delve use15 (D-425).
- Start at enemy **level 38**, the midpoint of Evo2's30-45 range.
- Linear growth reaches the same **level 120 endpoint at Stage 35**.
- Formula: `round(38 + (stage-1)*82/34)`.
- Examples: Stage 1 = 38, Stage 2 = 40, Stage 18 = 79, Stage 34 = 118,
  Stage 35 = 120. Invalid/fractional stages throw, never clamp silently.
- Material unlock **enemy levels**, upgrade costs, enemy stat endpoints and
  ability schedules are preserved. Quantities and chances now increase with level.
- Encounters retain all ten original supplied enemy packs. Atmospheric mixes
  wind/electric families, Botanic nature/earth, Tranquilitic peace/light and
  Chaotic chaos/shadow. Each enemy independently selects a family uniformly
  at its matching tier using a separate continuing encounter RNG stream.
  Arenas/material icons use the surviving canonical pack. Two enemies per ordinary
  stage; one stronger boss every fifth stage.
  Enemy lineup index is `floor((stage-1) * pack.length / 35)`.
- Stats use the complete shared level/rank curve below (D-289), without
  activity-specific opening stats or critical rates. Crit12%, multiplier1.5.
- Every enemy, including Stage1 enemies, has a periodic elemental strike: multiplier
  `1.2+(level-1)*.004`, every two boss turns or three ordinary turns.
  The Lv120 coefficient is1.676, identical across activities.
  This is an editable direct-damage ability, not a new elemental status system.
  BelowLv50 the strike is its only skill. AtLv50+ ordinary enemies gain an
  Overdrive variant at1.25x the first skill's multiplier every5 turns.
  Bosses atLv50+ instead gain Last Ruin, an ultimate every6 turns with multiplier
  `max(2.6, firstSkillMultiplier*1.65)`. Only one attack is executed per turn;
  second skill/ultimate takes precedence when schedules overlap.
  Default strike names are in [dungeon enemy content](../src/content/dungeon-enemies.ts);
  City of Heaven and Galvanic Field override them per enemy in [the art manifest](../src/content/dungeon-art.ts).
  All dungeons use the same schedule and balance, not new status effects.
- Stage1 begins unlocked. Clearing unlocks the next stage permanently;
  all unlocked stages may be replayed. Stage35 ends the dungeon, never Stage36.
  Entry/replay starts full health, zero Gauge and fresh cooldowns. Continuing
  to the next stage keeps the character's Elemental Gauge (up to its capacity)
  while refreshing health and cooldowns. This applies to elemental and infusion
  stages. Quitting, switching modes, retry/replay and reload start a new run;
  Gauge is not saved to the account.
  Defeat/exit retains already-earned rewards; reload resets the active encounter.
  Entry has no stamina or currency cost. Stage-clear reports show full-stage
  damage/healing/shields/attacks, surviving HP and saved reward events before
  manual advance. Captures are not implemented.
  Spending the final available character action automatically resolves one enemy
  phase, including burn rewards. It does not automatically enter the next stage.
- Enemy levels are content metadata, not automatically character levels or a
  hidden damage multiplier. Keep Adventure's independent wave formula unchanged.

### Pending artwork and reward integration

All ten elemental dungeon art packs are now supplied and registered.
Valley of Solitude's Ominous pack completes the intake (D-089): eight enemies,
six materials, banner and arena. Shared wiring reaches battle/cut-ins,
Collections, materials/loot/inventory/costs and activity reward previews.
All35 stages, names/order, Umbral Strike, stats/schedules, rewards and
discovery IDs remain unchanged.
See [intake workflow](art-workflow.md#valley-of-solitude-intake-d-089).
Neutral missing-art fallbacks remain available for future unregistered packs.

Sky-bound Rift's Atmospheric pack is supplied (D-088): eight enemies, six
materials, banner and arena. Shared registration wires battle/cut-ins,
Collections, material loot/inventory/costs and activity reward previews.
All35 stages, enemy order/names, Gale Strike, stats, schedules, drop rules
and discovery IDs remain unchanged.
See [intake workflow](art-workflow.md#sky-bound-rift-intake-d-088).

Ruins of Chaos's Chaotic pack is supplied (D-087): eight enemies, six materials,
banner and arena. Shared registration wires field/cut-ins, Collections, loot,
inventory, costs and activity previews. All35 stages, enemy order/names,
Rift Strike, stats, schedules, drop rules and discovery IDs remain unchanged.
See [intake workflow](art-workflow.md#ruins-of-chaos-intake-d-087).

Precipice of the Earth's Tectonic pack is supplied (D-086): eight enemies, six
materials, banner and arena. Shared art registration reaches all existing
encounter/menu/loot/progression surfaces without changing stages, stats, names,
ability schedules, drop odds or discovery IDs.
See [intake workflow](art-workflow.md#precipice-of-the-earth-intake-d-086).

Lustrous River's Luminous pack is supplied (D-085): eight enemies, six material
cutouts, header and arena. Registry wiring reaches encounters, skill cut-ins,
Collections, activity reward showcases, loot, inventory and progression costs.
Names/order, discovery IDs, stats, schedules, drops and35 stages remain unchanged.
See [export/intake](art-workflow.md#lustrous-river-intake-d-085).

Gameplay is independent of art availability. [Enemy lineups](../src/content/dungeon-enemies.ts)
hold the named roster; [art manifest](../src/content/dungeon-art.ts) registers
supplied packs. Add an element's `slug` and ordered `{name, art}` entries to the
manifest after exporting its approved enemies/banner/background/material PNGs.
An optional `ability` overrides the elemental strike name without changing its
damage or schedule; City of Heaven and Galvanic Field use this for all eight enemies.
The encounter resolver then uses those supplied assets automatically; no save
or reward migration is needed. Until then banners reserve their existing slots,
combat renders neutral shapes without requesting nonexistent PNGs, and material
inventory uses names/counts. Rewards use all 60 `<element>-<rarity>` IDs and
Seed/Bloom/Shard/Crest/Heart/Soul names. Any starter can enter any unlocked dungeon;
no affinity restriction, resistance system or new characters are introduced.

The earlier [Flaming Depths draft](flaming-depths-stages.md) is retained as a
historical encounter/ability proposal. **Its levels 6-55 and derived stats are
superseded**; do not implement them or claim the old numbers are approved.
Adapt its ten-enemy art/region ideas after approving new level/stat balance.
Wave reports and dungeon capture direction remain in
[Dungeons and captures](dungeons-and-captures.md).

## Material identities and drop rules

Every element has six authored material definitions:
**Common, Uncommon, Rare, Epic, Legendary, Omnic**.
There are36 canonical IDs such as `infernic-common` and `oceanic-omnic`.
These are definition records only, not owned material counts or granted items.

The owner specified a **Seed of <canonical element>** starting material and
**Soul of <canonical element>** final material for every dungeon. The
[dungeon art packs](../Art/creatures/dungeons/README.md) map these to Common and Omnic,
with proposed Bloom, Shard, Crest and Heart designs for the intermediate slots.
Art grows from a simple seed to an elaborate prismatic collectible while keeping
chunky chibi readability. Runtime inventory/cost/reward names now use
Seed/Bloom/Shard/Crest/Heart/Soul of the element. Legacy elemental material IDs
are remapped and merged on read without saving; other stable IDs remain unchanged.

Drops are guaranteed and grow by floor bracket; higher rarities appear on later
floors in smaller stacks than ordinary materials.

Drops per defeated dungeon enemy (including burn kills), D-338/D-357/D-425.
Every unlocked rarity is guaranteed; each bracket adds the next rarity.
The table below gives **base ranges before D-425's stage-dependent reduction**.
D-357 rule: an enemy of level X drops what a level X-5
Element-Bearer needs, so Uncommon/Rare/Epic/Legendary/Omnic open at enemy
Lv35/50/65/80/95 (`materialDropLevel` in activities.ts).

| Floors (enemy level) | Seed | Bloom | Shard | Crest | Heart | Soul |
| --- | --- | --- | --- | --- | --- | --- |
| 1-5 (Lv38-48) | 8-10 | 2-3 | - | - | - | - |
| 6-11 (Lv50-62) | 12-15 | 5-6 | 2-3 | - | - | - |
| 12-18 (Lv65-79) | 16-20 | 8-10 | 5-6 | 2-3 | - | - |
| 19-24 (Lv81-93) | 20-25 | 12-15 | 8-10 | 5-6 | 2-3 | - |
| 25-35 (Lv96-120) | 25-30 | 16-20 | 12-15 | 8-10 | 5-6 | 2-3 |

The table above is historical base-bracket provenance, not current quantities.
D-426 uses `p=(stage-unlockStage)/(35-unlockStage)`, minimum
`round(1+(finalMinimum-1)*p)`, maximum`round(2+(finalMaximum-2)*p)`.
Actual Stage35 ranges are8-9/5-6/4-5/2-3/2/1-2, with no final boost.
The unlock table lives in `materialBrackets` in
[dungeons.ts](../src/content/dungeons.ts); it replaces the earlier chance-based
level-gated curve.

All bosses use the same linear stage curve with no extra roll, multiplier or
pity. All resulting integers within a range are possible.
Dungeon Prismatica is stage-linear5-10->15-30 (D-426); the shared level-based
currency curve below still applies to Training and appropriate other modes.
Prismatica per enemy scales from 5-10 at Lv1 to 15-30 at Lv120 in every mode:
`minimum = 5 + floor(10*((L-1)/119)^2)`, maximum = twice minimum.
Adventure remains endless, with loot/stats capped at enemy Lv120.
Enemy-death loot bursts now visually show the exact saved reward stacks with
item icons and beams before automatic collection. Wave completion awards no
additional materials. See [loot presentation](menus-and-inventory.md#enemy-death-loot).
Adventure does not drop elemental materials. Drop randomness is deterministic
and separate from attack randomness. Tune
[dungeon content](../src/content/dungeons.ts); test thresholds in
[dungeon tests](../src/content/dungeons.test.ts).
Pity, alternate drop pools, production pacing and creature acquisition remain open.
Do not conflate material rarity with character evolution or enemy tier.

## Evolution requirements

Current starter lines have **six evolution forms**, Evo.1 through Evo.6 (D-033).
The owner resolved the conflicting Common+Rare example in favor of adjacent
rarities:

| Transition | Own-element materials |
| --- | --- |
| Evo.1 -> Evo.2 | Common |
| Evo.2 -> Evo.3 | Common + Uncommon |
| Evo.3 -> Evo.4 | Uncommon + Rare |
| Evo.4 -> Evo.5 | Rare + Epic |
| Evo.5 -> Evo.6 | Epic + Legendary |

Every transition requires **Prismatica**. Phase7 also requires captured creatures
from the mapped mode for Evo3->4 onward:1/2/3 copies of form3+/4+/5+,
supplementing all existing costs. Earlier transitions consume no creatures.
"Common only" restricts the elemental
material rarities, not the other currencies/infusion requirement.
Legendary Hearts now supply the final evolution; Omnic Souls have no spending
recipe yet. Exceptional characters with different chains need an
explicit definition override before implementation.

Quantities/costs and Lv.0 start are now defined in
[progression](units-and-progression.md); infusion counts/tiers remain unresolved.
Six-form caps are now 30/45/60/75/90/105; evolution preserves level. Stats follow
an additive linear core-stat curve (D-288) with separate bounded skill/passive
strength. This supersedes the old reset-to-0 and repeated level-30 caps.
The first account Fracture grants +10 saved Null-Prismatica once.
No later Fracture Null-Prismatica rewards assumed. See [growth rules](units-and-progression.md).

## Two infusion modes

### Shared enemy growth and discovery

`src/content/stat-growth.ts` owns D-289 Lv120 endpoints: ordinaryHP9,000,
Attack1,200, Defense400; bossHP35,000, Attack3,000, Defense600.
For baseB, targetT, initial rateR and bounded levelL=min(level,120):
`round(B*(1+(L-1)*R)*exp(log(T/(B*(1+119*R)))*max(0,L-25)/95))`.
Shared HP/Attack/Defense rates are.45/.25/.30, with extra exponential
acceleration above25. Ordinary Lv1 openings83/22/4; boss207.5/27.5/(16/3).
All activities use the same full stats and level-based skills for the same rank.
Story has no discount, Training no species overrides, and War no playable-stat
inheritance. Boss rank and enemy count remain intentional differences.
Enemy level follows wave, capped120.
Waves continue after120 without further stat growth.

Home's Creature Glossary lists97 authored forms. Entry saves encounters;
unseen entries are black silhouettes, seen entries show color/name, defeated
entries reveal real loot pools and chances. Activity filter and stage selector
show only the creature's stage band. Evolution forms have separate stable IDs.
Legacy saves begin with no recorded discoveries; earlier fights are not inferred.
Soar/Delve discovery loot lists only each activity's two used specialties
and its existing currencies (D-425). No weapon or elemental-material drops remain.
Crimson Roses lists every unlocked Rosethorn material at100%, using the
original untapered enemy-level brackets, unaffected by D-425.
Adventure uses an enemy-level selector; staged encounters show their actual floor loot.
This is a drop reference, not capture/pity or a second source of rewards.

- **Soar to Heaven:** Infernic, Oceanic, Atmospheric, Botanic.
  New art direction: white Dawnthorn Slime evolving into a severe celestial
  final form, The Dawn Without Mercy, with black/red/gold thorn regalia;
  replaces the old Light-wisp concept.
- **Delve into the Abyss:** Tranquilitic, Chaotic.
  New art direction: black Wraththorn Slime evolving into a cosmic wrath
  final form, The Night Without End, with white/deep-purple/hot-pink thorns;
  replaces the old royal-wisp concept.
- D-425/D-192: each has **15 stages**, starts at enemy **level50** and requires an
  owned Element-Bearer at Lv.50. New
  [mode art packs](../Art/creatures/gamemodes/README.md) author six visual forms per mode
  (base plus five evolutions), now supplied and wired into live encounters.
  Each mode keeps one permanent creature name: Dawnthorn Slime or Wraththorn
  Slime. Later names use "<evolution title>, <permanent slime name>" as the same
  named slime strengthens across stages/levels, not separate species.
- Enemy levels interpolate linearly between stage/level anchors
  **1/50,13/65,19/75,25/85,35/120**, rounding once to whole levels.
  The owner approves this correction so evolution fodder is accessible before
  the Lv.60/75/90 character caps block progression.
  Normalize the original35-stage anchors with `position=1+(stage-1)*34/14`.
  Forms occupy stages1-3/4-5/6-8/9-10/11-13/14-15.
  Two ordinary enemies, one stronger boss every fifth stage.
  Stats use [D-288's hostile curve](combat.md#progressive-build-reliance-d-288).
  At Lv120:9,000 ordinaryHP/35,000 bossHP,1,200/3,000 Attack
  and400/600 Defense. Captured playable stats use a separate linear curve.
  Crit12%, multiplier1.5. Scarlet Judgment/Cosmic Wrath strikes every3 ordinary
  turns or2 boss turns, coefficient `1.2+(level-1)*.004` (D-289).
  The Lv120 coefficient is1.676. Existing captured kits preserve exact
  historical coefficients; only new copies retain the new hostile skills.
  All infusion enemies start aboveLv50 and therefore have two skills: ordinary
  Overdrive every5 turns at1.25x this coefficient, or boss Last Ruin ultimate
  every6 turns at`max(2.6, coefficient*1.65)`. The ultimate replaces the scheduled
  first strike, never adds another hit.
  No elemental resistances/status typing are inferred from art.
- Owner's phrase "Chaos mode" refers here to the named Abyss activity, not an
  invented third mode or the Chaotic elemental material dungeon.
- Each mode has three saved specialty materials for its associated
  elements: weapon upgrades, character evolution, and late-form leveling.
  Owner clarified that the leveling material applies **throughout Evolution5/6**
  (caps90/105), not just character levels above80. Heaven uses blade/crown/chalice
  objects; Abyss uses claw/fracture-orb/hourglass objects.
- D-425: both modes drop only their two used specialties, never weapon or elemental
  materials of any rarity. Affinity groups still route progression recipes,
  not bonus loot. This supersedes the narrower D-372 Crest-only removal.
- Per defeat: guaranteed evolution and leveling specialties from Stage1.
  Minimum=`round(1+10*(stage-1)/14)`, maximum=`round(2+21*(stage-1)/14)`.
  Stage1 gives1-2 each, Stage14 gives10-22 and Stage15 gives11-23, without
  an additional final-boss material boost. Existing weapon holdings remain.
  Current and legacy schedules exclude all elemental
  bonuses. Final Prismatica is75-150. Captures are50% per kill (D-377),
  ordinary enemies and bosses alike; no guaranteed rare pool or pity.
  Enemy-death stacks vary visually from75-135% size, with randomized scatter and
  independent850-1849ms automatic pickup. Reduced motion keeps a static650ms
  receipt. Cosmetic rolls never alter awarded quantities or persistence.
- Stage1 starts unlocked independently in each mode. Saved clears unlock the
  successor through15; final stage offers replay, never16. Entry/replay
  resets health, Gauge and cooldowns; Continue refreshes health/cooldowns but
  carries Gauge within the current run. Rewards save before presentation and
  remain on defeat/exit; active encounters are not restored after reload.
- D-192 keeps existing stage unlock IDs and saved capture levels/skills. Legacy
  metadata-free captures retain the old inferred80-120 levels without writes.
  Existing local/online runs without the new schedule marker keep their former
  80-120 levels and original loot schedule through Continue/Retry. New entries
  use the cap-aligned schedule. Online read resumes its durable active run.
- No infusion Null-Prismatica below enemyLv80. The80-120 probabilities and
  independent RNG stream remain unchanged.
- Existing elemental recipes remain, plus5 specialty evolution items for4->5,
  10 for5->6 and1 specialty leveling item for every Evo5/6 level.
  Weapon destination rank R costs100R Prismatica and5R matching weapon materials,
  maximum10; Attack is grown Attack times `1+.02*rank`.
  Specialty spending follows affinity, not entry restrictions. All current
  opening starters use Heaven materials; Abyss helpers cover its two elements.
  Phase7 consumes captured creatures alongside existing evolution costs; see
  [creature infusion](evolution-fodder.md) for counts/forms/mode/protection rules.
  Captures retain their defeated fixed form/level/skills, never evolve or
  transform mid-fight. See [captured creatures](dungeons-and-captures.md).

## Save migration for the 35-floor rules

`last-light.wallet` now uses version4. Version2 elemental unlocks first map by
`1+round((min(oldFloor,45)-1)*34/44)`; infusion unlocks map by
`1+round((oldFloor-1)*34/24)`. Version2/3 elemental progress then maps the highest
completed enemy level to the newLv38-120 floors; initial/final unlocks remain1/35.
Merged element unlocks use the maximum; legacy material balances sum by rarity,
rejecting overflow before any write. Currency, character levels/forms, weapon
ranks, captures/gear, pity, first-Fracture flags, discoveries and receipts remain.
Loading never rewrites the save; the next successful transaction persists
version4, which is not mapped again. Version1 currency migration remains supported.
Upgrade prices are unchanged; specialty/fodder affinities follow the new4/2 pools.
No rewards are granted by migration. [Exact contract/tests](six-element-rework.md#implemented-elemental-migration-contract).

## Extension points and implementation gates

- [Definitions and rule helpers](../src/content/activities.ts): add/edit authored
  elements, material IDs, modes and validated recipe/level lookups here.
- [Gameplay presentation](../src/presentation/gameplay.ts): grouped activities,
  real stage selectors/launches and unavailable notices for gated modes.
- [Framework tests](../src/content/activities.test.ts): exact mappings, all 35
  levels, all36 materials, eligibility and adjacent recipes.
- [Character progression](../src/presentation/hub.ts) uses shared costs and saved progress.
- [Navigation](../src/main.ts) connects Gameplay, Adventure, Story and Events.

Farming/evolution now uses [validated atomic account transactions](../src/game/account.ts)
and [failure/retry tests](../src/game/account.test.ts). Heaven/Abyss capture
inventory/kits, mixed squads and independent levels/Conduits are implemented.
Protected-safe fodder consumption is implemented; five remaining elemental art
packs and production balance remain future work.
Mode configurations must share existing combat resolution rather than fork it.
Mode encounters/drops live in [infusions](../src/content/infusions.ts), with
[regression tests](../src/content/infusions.test.ts). Keep this first-pass balance editable.
