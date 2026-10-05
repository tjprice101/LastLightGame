# Gameplay, elements and farming framework

**Status:** Adventure and all ten elemental material dungeons are playable.
Material inventory, starter leveling/evolution and first-Fracture reward are
persistent. Soar to Heaven and Delve into the Abyss are playable with specialty
rewards and weapon upgrades (D-050).
Captures and creature consumption remain deferred. See D-032 and the
[upgrade balance](units-and-progression.md#first-pass-philosophy-and-editable-costs).

## Activity organization

Gameplay is a new primary sanctuary tab alongside Home, Character Upgrades and
Events, superseding the earlier exactly-three-screen layout.
It groups **Adventure**, **Elemental material dungeons**, **Evolution infusion**,
**Story**, and **Events**, with category links to each section.
Home retains the compact Adventure shortcut and adds a Gameplay shortcut.
Adventure quit ends the run and returns to Gameplay; each new entry starts at wave 1.
Settings still retains an active run. Story returns to Gameplay.
Events remains a primary tab as well as a Gameplay category, with no active rewards.

## Canonical elements and dungeons

| Element | Affinity | Material dungeon | Infusable enemy source |
| --- | --- | --- | --- |
| Infernic | Fire | Flaming Depths | Soar to Heaven |
| Aquatic | Water | Oceanic Valley | Soar to Heaven |
| Tectonic | Earth | Precipice of the Earth | Soar to Heaven |
| Efflorescent | Nature | Garden of Beauty | Soar to Heaven |
| Voltaic | Electricity | Galvanic Field | Delve into the Abyss |
| Atmospheric | Wind | Sky-bound Rift | Soar to Heaven |
| Luminous | Light | Lustrous River | Delve into the Abyss |
| Ominous | Shadow | Valley of Solitude | Delve into the Abyss |
| Tranquilitic | Peace | City of Heaven | Delve into the Abyss |
| Chaotic | Dark Matter/Energy | Ruins of Chaos | Delve into the Abyss |

Infernis is Infernic, Tizu Aquatic, Flora Efflorescent (formerly described as grass).
Existing starter IDs `ember`, `tide`, `sprout` and combat kits remain unchanged.
Each starter now has a canonical `elementId`; display names include the familiar
affinity. Element registration does not grant additional playable characters,
elemental damage bonuses, resistances, or revised battle balance.

## Material dungeon stages

- Exactly **35 stages** per elemental dungeon and per infusion mode.
- Start at enemy **level 10**.
- Linear growth reaches the same **level 120 endpoint at Stage 35**.
- Formula: `round(10 + (stage-1)*110/34)`.
- Examples: Stage 1 = 10, Stage 2 = 13, Stage 18 = 65, Stage 34 = 117,
  Stage 35 = 120. Invalid/fractional stages throw, never clamp silently.
- Material unlock **enemy levels**, upgrade costs, enemy stat endpoints and
  ability schedules are preserved. Quantities and chances now increase with level.
- First-pass encounters use supplied Infernic/Aquatic/Efflorescent/Tranquilitic/Voltaic enemy order
  and arenas. The other five use all eight named enemies from their existing
  art prompt packs, with neutral enemy shapes and element-accented arenas until
  art is supplied. No other element's artwork is reused. Two enemies per ordinary
  stage; one stronger boss every fifth stage.
  Enemy lineup index is `floor((stage-1) * pack.length / 35)`.
- Stats use the shared accelerating curve below, starting at Lv10 HP55/110
  and Attack8/13 for ordinary/boss; Defense2. HP/Attack initial rate .024
  doubles former .012 growth. Defense initial rate .08 on base2 doubles
  former additive .08. Crit `.05+(level-10)*.002`, bounded at .25.
- Every enemy, including Stage1 enemies, has a periodic elemental strike: multiplier
  `1.2+(stage-1)*.588/34`, every two boss turns or three ordinary turns.
  The final coefficient remains 1.788, matching the former Stage50 endpoint.
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
  to the next stage keeps the character's Shatter Gauge (up to its capacity)
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
There are 60 stable IDs such as `infernic-common` and `aquatic-omnic`.
These are definition records only, not owned material counts or granted items.

The owner specified a **Seed of <canonical element>** starting material and
**Soul of <canonical element>** final material for every dungeon. The
[dungeon art packs](../Art/dungeons/README.md) map these to Common and Omnic,
with proposed Bloom, Shard, Crest and Heart designs for the intermediate slots.
Art grows from a simple seed to an elaborate prismatic collectible while keeping
chunky chibi readability. Runtime inventory/cost/reward names now use
Seed/Bloom/Shard/Crest/Heart/Soul of the element; stable IDs remain unchanged.

Confirmed: later/tougher encounters can drop higher rarities; higher rarities are
less likely than ordinary materials even against high-level enemies. Farming is
intended to take effort without making rare rewards impossible.

First-pass drops per defeated dungeon enemy (including burn kills):

| Material | Unlock enemy level / first floor | Chance at unlock -> Lv120 | Lv120 quantity |
| --- | --- | --- | --- |
| Seed / Common | 10 / 1 | Guaranteed | 3-6 |
| Bloom / Uncommon | 23 / 5 | 25% -> 98% | 3-6 |
| Shard / Rare | 48 / 13 | 12% -> 90% | 3-6 |
| Crest / Epic | 73 / 21 | 6% -> 80% | 3-6 |
| Heart / Legendary | 98 / 29 | 2.5% -> 60% | 3-6 |
| Soul / Omnic | 120 / 35 | 35% at Lv120 | 3-6 |

All prior enemy-level gates remain intact. Soul only unlocks at the endpoint,
so its old 1% starting chance is replaced by the final 35% chance there.
For enemy level L, dungeon starting level S, unlock level U and final minimum Q:
`minimum = 1 + floor((Q-1)*((L-S)/(120-S))^2)`.
Each successful drop independently rolls an inclusive integer from minimum to
twice minimum. Chances interpolate from the unlock chance to the final chance
using `((L-U)/(120-U))^1.4`; the Lv120-only unlock uses its final chance directly.
These curves live in [loot-random.ts](../src/content/loot-random.ts).
Q is 3 for every material: stacks progress from 1-2 to 2-4 to 3-6,
so final quantities are only triple baseline, not the earlier oversized payouts.

These rolls are independent, so multiple rarities may drop together.
Bosses use the same per-enemy table, no hidden multiplier or pity.
Fractalis per enemy scales from 5-10 at Lv1 to 15-30 at Lv120 in every mode:
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

Every transition requires **Fractalis**. The long-term design also requires
**special infusable enemies** from the mapped mode, but the owner explicitly
deferred creature consumption/acquisition for this first pass. "Common only" restricts the elemental
material rarities, not the other currencies/infusion requirement.
Legendary Hearts now supply the final evolution; Omnic Souls have no spending
recipe yet. Exceptional characters with different chains need an
explicit definition override before implementation.

Quantities/costs and Lv.0 start are now defined in
[progression](units-and-progression.md); infusion counts/tiers remain unresolved.
Six-form caps are now 30/45/60/75/90/105; evolution preserves level. Stats follow
an accelerating cubic core-stat curve with separate bounded skill/passive
strength. This supersedes the old reset-to-0 and repeated level-30 caps.
The first account Fracture grants +10 saved Lycalis once.
No later Fracture Lycalis rewards assumed. See [growth rules](units-and-progression.md).

## Two infusion modes

### Shared enemy growth and discovery

`src/content/stat-growth.ts` owns Lv120 endpoints: ordinaryHP200,000,
Attack4,000, Defense1,500; bossHP400,000, Attack6,000, Defense2,250.
For baseB, targetT, initial rateR, stepsS and spanN:
`round(B*(1+S*R)*exp(log(T/(B*(1+N*R)))*(S/N)^2))`.
This preserves opening stats, doubles initial former growth and accelerates to
the approved endpoints. Adventure initial HP/Attack rate.24 (formerly.12),
Defense rate2/baseDefense (formerly additive1); enemy level follows wave, capped120.
Waves continue after120 without further stat growth.

Home's Creature Glossary lists97 authored forms. Entry saves encounters;
unseen entries are black silhouettes, seen entries show color/name, defeated
entries reveal real loot pools and chances. Activity filter and stage selector
show only the creature's stage band. Evolution forms have separate stable IDs.
Legacy saves begin with no recorded discoveries; earlier fights are not inferred.
Mode-associated infusion loot shows each eligible element's rarityChance/5
(at Lv120: Epic17%, Legendary13%, Omnic8%) and explains the shared rarity selection.
Adventure uses an enemy-level selector; staged encounters show their actual floor loot.
This is a drop reference, not capture/pity or a second source of rewards.

- **Soar to Heaven:** Infernic, Aquatic, Tectonic, Efflorescent, Atmospheric.
  New art direction: white Dawnthorn Slime evolving into a severe celestial
  final form, The Dawn Without Mercy, with black/red/gold thorn regalia;
  replaces the old Light-wisp concept.
- **Delve into the Abyss:** Luminous, Voltaic, Ominous, Chaotic, Tranquilitic.
  New art direction: black Wraththorn Slime evolving into a cosmic wrath
  final form, The Night Without End, with white/deep-purple/hot-pink thorns;
  replaces the old royal-wisp concept.
- Each has **35 stages** and starts at enemy **level 80**. New
  [mode art packs](../Art/gamemodes/README.md) author six visual forms per mode
  (base plus five evolutions), now supplied and wired into live encounters.
  Each mode keeps one permanent creature name: Dawnthorn Slime or Wraththorn
  Slime. Later names use "<evolution title>, <permanent slime name>" as the same
  named slime strengthens across stages/levels, not separate species.
- Enemy level is `round(80 + (stage-1)*40/34)`, reaching 120 at Stage35.
  Forms occupy stages1-6/7-12/13-18/19-24/25-30/31-35.
  Two ordinary enemies, one stronger boss every fifth stage.
  Stats use the shared accelerating enemy curve described below, with .036
  starting HP/Attack rate versus elemental dungeons' .024. At Lv120:200,000
  ordinaryHP/400,000 bossHP,4,000/6,000 Attack and1,500/2,250 Defense.
  Crit12%, multiplier1.5. Scarlet Judgment/Cosmic Wrath strikes every3 ordinary
  turns or2 boss turns, coefficient `1.2+(stage-1)*.384/34`.
  The final coefficient remains 1.584.
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
- Both modes may also drop existing Epic/Legendary/Omnic materials, restricted
  to their **five listed elements**, matching their specialty affinity group.
- Per defeat: guaranteed weapon material from Lv80/Stage1, evolution from
  Lv93/Stage12, leveling from Lv100/Stage18. Using the shared quantity curve
  with starting level80, all final specialty stacks are3-6.
  Preserved supplemental unlocks: EpicLv80/Stage1,
  LegendaryLv100/Stage18, OmnicLv115/Stage31. Chances grow from15%/6%/2%
  to85%/65%/40%; successful final stacks are3-6 for each rarity.
  Each successful rarity roll chooses **one** of the mode's five elements uniformly,
  not every element. Final Fractalis is15-30. No capture, guaranteed rare pool or pity.
  Enemy-death stacks vary visually from75-135% size, with randomized scatter and
  independent850-1849ms automatic pickup. Reduced motion keeps a static650ms
  receipt. Cosmetic rolls never alter awarded quantities or persistence.
- Stage1 starts unlocked independently in each mode. Saved clears unlock the
  successor through35; final stage offers replay, never36. Entry/replay
  resets health, Gauge and cooldowns; Continue refreshes health/cooldowns but
  carries Gauge within the current run. Rewards save before presentation and
  remain on defeat/exit; active encounters are not restored after reload.
- Existing elemental recipes remain, plus5 specialty evolution items for4->5,
  10 for5->6 and1 specialty leveling item for every Evo5/6 level.
  Weapon destination rank R costs100R Fractalis and5R matching weapon materials,
  maximum10; Attack is grown Attack times `1+.02*rank`.
  Specialty spending follows affinity, not entry restrictions. All current
  starters use Heaven materials; Abyss helpers already cover its five elements.
  Creature consumption stays deferred.
  Enemy visual evolution does not enable captures, fodder evolution or mid-fight
  transformation mechanics.

## Save migration for the 35-floor rules

`last-light.wallet` now uses version3. Version2 elemental unlocks map by
`1+round((min(oldFloor,45)-1)*34/44)`; infusion unlocks map by
`1+round((oldFloor-1)*34/24)`. This approximately preserves enemy-level progress;
former final floors map to35. Currency, material stacks, character levels/forms,
weapon ranks, first-Fracture flags, discoveries and receipts are retained.
Loading never rewrites the save; the next successful transaction persists
version3, which is not mapped again. Version1 currency migration remains supported.
Upgrade prices and affinity rules are unchanged; no rewards are granted by migration.

## Extension points and implementation gates

- [Definitions and rule helpers](../src/content/activities.ts): add/edit authored
  elements, material IDs, modes and validated recipe/level lookups here.
- [Gameplay presentation](../src/presentation/gameplay.ts): grouped activities,
  real stage selectors/launches and unavailable notices for gated modes.
- [Framework tests](../src/content/activities.test.ts): exact mappings, all 35
  levels, all 60 materials, eligibility and adjacent recipes.
- [Character progression](../src/presentation/hub.ts) uses shared costs and saved progress.
- [Navigation](../src/main.ts) connects Gameplay, Adventure, Story and Events.

Farming/evolution now uses [validated atomic account transactions](../src/game/account.ts)
and [failure/retry tests](../src/game/account.test.ts). Creature inventory,
captures, five remaining elemental art packs and production balance remain future work.
Mode configurations must share existing combat resolution rather than fork it.
Mode encounters/drops live in [infusions](../src/content/infusions.ts), with
[regression tests](../src/content/infusions.test.ts). Keep this first-pass balance editable.
