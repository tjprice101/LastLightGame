# Passion of Crimson Roses and Roses Under Sunny Skies

**Current banner rule (D-412):** Roses uses one80-pull pity and unchanged
duplicate conversion, with its actual six-star-only roster. Older80/150 or
200/500 statements below are historical. See
[exact current rules](summoning-and-economy.md#single80-pull-pity-d-412).
Current native kits and critical eligibility are in
[native identities](character-identity-redesign.md) and [combat](combat.md).

## Captures at every event level (D-410)

All35 Rose stages, including Lv.121-140 enemies and the final boss, have the
existing separate50% playable-copy chance. Copies join at Lv.60, retaining
the defeated form, source stage and skills. D-410 removes the former source
Lv.120 restriction; it does not raise playable levels or change other loot.
No banner/chest provenance is required for ordinary late-form captures.
Atomic per-kill saving, duplicate UUIDs and receipt deduplication remain.

## Banner material rewards (D-214)

New Roses draws award Seed/Bud/Bloom of Rosethorn instead of Roselius, with
10 Common/6 Uncommon/3 Rare bundles and50:30:17 normalized non-character
weights. Owned Element-Bearers convert to15 Bloom of Rosethorn (Rare), never
Omnic materials or creatures. Three6-star EB odds, cost,80/150 pity and Conduit
bonus remain. Existing Roselius copies/captures/sales/provenance are unchanged.
[Shared exact contract](summoning-and-economy.md#material-banner-rewards-d-214)
supersedes historical banner-copy conversion rules below.

## Native setup/payoff loops (D-172)

D-173 preserves these three Rose signatures while consolidating ordinary native
effects. Rose Grace is precise Bloom, Thorn Aegis precise Ward and Rose Duality
precise Burn. Family membership does not merge owners/counts with general native
or equipment resources. Their three unique symbol prompts remain.

Rosetta's effective authored healing earns Rose Grace, Thornia's actual authored
shield absorption earns Thorn Aegis and Crinso's own effective Burn earns personal
Rose Duality. All cap3; ordinary skills spend for Weaken/damage, Last Flare offers
a stronger damage or shield payoff. Existing low-health damage, healing, shields,
Burn, names, targeting, Gauge costs, cooldowns and recovery remain intact.
[Exact triggers, bounds and snapshot rules](character-kit-rework.md#rose-and-elemental-war-loops-d-172)
own the contract. No equipment prerequisite, art replacement, recruitment/reward
change or persistent account resource. Enemy Roselius kits are unchanged.

## Owner-supplied Evo.1 titles (D-143)

The delivered filenames intentionally establish **Gilded Rose, Rosetta** and
**Burdened by Thorns, Thornia** as their canonical Evo.1 display names.
Shared form naming updates menus, Archives, banner showcases/rates/results,
Squad, battle and accessible portrait labels. Other evolution titles, Crinso's
Rosebound Page title, stable character/art IDs and saves remain unchanged.
Historical intake filenames/byte provenance remain preserved, not renamed.

## Replacement character portraits (D-134)

Rosetta, Thornia and Crinso now use the18 newly supplied portraits with
reviewed offline background removal, enclosed-gap cleanup and updated facing.
Existing shared IDs wire all six forms into menus, Squad, archives, Summon
showcases/results, battle and cut-ins. D-121 icons/materials/creatures/scenery
are unchanged. Both original generations and previous exports remain preserved.
See [provenance](../Art/provenance/character-refresh-intake.json) and
[workflow/validation](art-workflow.md#replacement-character-portraits-d-134).
The D-134 intake itself changed no character titles, acquisition, progression,
economics or saves; D-143 above now adopts the intentional delivered base titles.

## Supplied artwork intake (D-121)

All51 event/rose-character assets are now supplied and registered:18 portraits,
18 ability icons including Defense, six Roselius forms, six Rosethorn materials
and three scenery panels. Shared character/material/creature/ability resolvers
serve them across menus, archives, battle and cut-ins; discovery silhouettes
and ownership gates are unchanged. Event header/arena/summon panel use their
own scenery rather than pending placeholders. Earlier art-pending statements
below describe the pre-intake state.

Originals/hashes and cleanup settings live in
[Roses provenance](../Art/provenance/roses-art-intake.json); regeneration/review steps are
in [art workflow](art-workflow.md#phased-rosterevent-delivery-d-121).
Historical D-121 intake retained authored titles despite different base filenames
and the supplied `Crisno` typo. D-143 adopts only the owner-confirmed Rosetta/
Thornia base titles; stable IDs and historical records remain unchanged.
No gameplay/economy/save changes.

## Confirmed direction (D-100, updated D-113)

Owner requested a crimson/gold rose event and special banner, and explicitly
approved playable implementation alongside Midjourney packs:

- **Rosetta:** female, Luminous, bow,6-star, six evolution forms.
- **Thornia:** female, Ominous, greatsword,6-star, six evolution forms.
- **Crinso:** male, Chaotic, one dual-edged sword,6-star, six evolution forms.
- **Passion of Crimson Roses:**35 stages, enemy levels80-140, six fixed
  female Luminous Roselius angel forms. Bosses every fifth stage.
- Six total materials: Seed, Bud, Bloom, Crest, Heart and Soul of Rosethorn,
  Common through Omnic. These are a new chain, not renamed Sanctuary materials.
- Captures can fight or sell for their form's material. **All event enemy
  levels are capturable.** Owned levels cap at60, retaining source form and skills.
- Special banner follows the approved existing10 cost and independent200/500
  highest-star pity. All three EBs share1.1% equally (1.1% /3 each); the first three Roselius
  forms split98.9% with50:30:17 weights.
- Duplicate event EBs award an Omnic Roselius at **Lv.60** under D-305, with its final-form
  kit, usable in battle or sold for Soul. Standard's Treasury Lv.50 conversion
  and fifteen outcomes remain unchanged.
- First-pass roles approved: Rosetta area damage/debuff, Thornia thorn-armored
  tank, Crinso fast damage dealer. Rose materials replace ordinary elemental/
  specialty costs; retain Prismatica costs, six caps and max-level-only evolution.
  Late evolution consumes selected Roselius with existing1/2/3 and3+/4+/5+ rules.

No event dates were specified. Owner accepted continuous availability until a
schedule is authored. No timers, automatic gifts, paid draws or backend added.

## Implemented encounters and first-pass tuning

Stage level is `round(80 + (stage-1)*60/34)`. Ordinary stages have two enemies;
every fifth stage has one boss. All six forms, including Omnic mission enemies,
can be captured under D-410.

| Form | Stages | Creature | Rarity | Sale |
| --- | --- | --- | --- | --- |
|1 |1-5 |Roselius |Common |1 Seed |
|2 |6-10 |Votive of Golden Thorns, Roselius |Uncommon |2 Bud |
|3 |11-15 |Knight of the Crimson Bloom, Roselius |Rare |3 Bloom |
|4 |16-21 |Seraph of Passion, Roselius |Epic |4 Crest |
|5 |22-28 |Sovereign of the Living Rose, Roselius |Legendary |5 Heart |
|6 |29-35 |The Garden Beyond Eternity, Roselius |Omnic |6 Soul |

Stable creature IDs are `infusion:roses:0` through `infusion:roses:5`.
Stage23 is Lv.119; Stage24 is Lv.121. Both and all later stages are capturable.

Growth uses [stat-growth](../src/content/stat-growth.ts). At/below120 all
existing curves remain identical. The event explicitly opts into a140 maximum:
past120 multiply each anchored120 stat by
`(1 + initialRate*(level-120))^2`, using the existing stat-specific rates.
This is an accelerating quadratic endgame extension, not uncapped exponential
extrapolation. Ordinary/boss HP at120 stays200k/400k; at140 is591,680/1,183,360.
Existing Adventure/dungeon/infusion/currency enemies still cap120.

Primary skill Golden Thorn Benediction grows from120% to185% Attack.
Shared level50+ second-skill schedules apply: ordinary Overdrive every5 turns;
boss Last Ruin every6 replaces a due primary, with the shared heavy multiplier.
First-pass numbers are editable developer tuning, not a production-balance claim.

## Per-kill rewards

No Null-Prismatica and no separate stage-clear award. Earlier boss/ordinary
reward tables match; D-294 multiplies stage35's currency/material quantities
by5 on every clear/replay without altering rare-drop or capture chances.
Prismatica uses the existing quadratic quantity curve extended to140 only here:
9-18 at80,15-30 at120, base18-36 at140; final stage35 pays90-180.
Every unlocked material is guaranteed (D-373), using the same level brackets
and inclusive quantity ranges as elemental dungeons.

| Material | Stable ID | First available enemy level in this activity | Chance |
| --- | --- | --- | --- |
|Seed |`rosethorn-common` |80 |100% |
|Bud |`rosethorn-uncommon` |80 |100% |
|Bloom |`rosethorn-rare` |80 |100% |
|Crest |`rosethorn-epic` |80 |100% |
|Heart |`rosethorn-legendary` |80 |100% |
|Soul |`rosethorn-omnic` |95 |100% |

D-357: unlocks follow the X-5 rule (`max(80, materialDropLevel)`), so every
tier through Heart is available from the first Lv80 stage.

| Enemy level / stages | Seed | Bud | Bloom | Crest | Heart | Soul |
| --- | --- | --- | --- | --- | --- | --- |
|80-94 /1-9 |20-25 |12-15 |8-10 |5-6 |2-3 |- |
|95-140 /10-34 |25-30 |16-20 |12-15 |8-10 |5-6 |2-3 |
|Final boss /35 |125-150 |80-100 |60-75 |40-50 |25-30 |10-15 |

The highest dungeon bracket stays capped above95, including event levels
above120. Earlier bosses use ordinary quantities. The final boss retains
D-294's5x multiplier. [infusionLoot](../src/content/infusions.ts)
is authoritative for battles, stage previews and defeated Creature loot.
Capture uses independent50% RNG (D-377), gated before acquisition by
actual defeated level. No premium RNG is consumed.

`saveAccountRewards` verifies source mode/form/stage/defeat/level and valid
material IDs/quantities including guaranteed Seed, rejects premium/high-level
captures, and commits balances/materials/captures/discovery/receipt/unlocks in
one write. Replay of a committed receipt grants nothing.

## Banner and progression

### Authored first-pass kits

These are unprogressed authored values, not final displayed stats. Shared
fractional growth and bounded potency apply during fighter resolution.
Normal, Defense,25/40/100 Gauge and2/3-turn skill cooldowns remain shared.
Crinso's fast-damage identity does not add a new Speed/initiative stat.

| EB | Base HP / DEF / Attack | Passive | Skill1 | Skill2 | Last Flare |
| --- | --- | --- | --- | --- | --- |
|Rosetta |225 /11 /43 |Virtuous Bloom:2% team healing on new turn |Golden Thorn Volley:170% damage,20% weaken |Crimson Skyfall:120% area damage,15% weaken |Rose Beyond the Sun:300% area damage,30% weaken |
|Thornia |280 /17 /31 |Forbidden Garden:+9 Defense |Gilded Thorn Guard:30 team shield |Shadow Rose Cleave:180% damage,20% weaken |Thousand-Rose Dominion:240% area damage,40 team shield |
|Crinso |205 /9 /41 |Rose Duality:15% low-health damage bonus |Golden Edge:180% damage,+15% critical chance |Crimson Rupture:120% area damage,100% elemental burn |Blossoming Cataclysm:310% area damage,150% elemental burn |

Burn stores the actual caster instance ID through snapshots/enemy phases, so
Crinso works without Infernis in the squad. Existing metadata-free burn fixtures
retain their old Infernis attribution; invalid explicit sources still fail.

### Acquisitions and costs

Stable banner ID `roses`; six real outcomes, separate saved counters from
`standard`. All three characters are6-star and equally eligible for200 pity.
Any natural rose EB resets200; a newly owned rose EB resets both.500 selects
equally among unowned rose EBs (or all three when all owned).500 priority,
equal eligible guarantee odds and all-owned conversion/reset follow the shared
[pity contract](summoning-and-economy.md). Failed/rejected draws do not advance.
New EBs start Lv.0/Evo.1/weapon0 and unequipped; no extra EB copies.
Creature results start at first authored form stage (80/89/98).

D-113 preserves existing IDs/progress/gear/receipts/counters without a migration
or load write. Already-owned Thornia/Crinso display6 stars from content metadata;
no retroactive pity resets, refunds or awards. Subsequent draws use the new pool.
Standard retains its original1% five-star tier;1.1% six-star is Roses-specific.

### Individual art correction (D-113, restored D-114)

Owner withdrew the less-chibi anatomy direction and restored compact
Bliss/Bruno-style proportions throughout, with amplified effects and splendor
through armor, mantle, weapons and multi-winged elemental architecture.
Preserve original anime
contours/cel shading/painted highlights, eyes-only identities, covered designs,
opaque no-glow powers and keyed/padded cutouts. No anatomy exception remains
for rose EBs; no gameplay scale/stat changes. Same2.5-3-head anatomy/body one third
of canvas in every form.
[Rosetta](../Art/characters/Rosetta%20Art.md) is Phase8:13 blocks retain their format,
4/8/16 late wings, retained airborne draw/rose regalia and
expanded bow/cosmic sun-rings. Owner subsequently moved to Thornia under D-117
below. No generated assets or new combat mechanics.

D-115 refines Rosetta's late portraits: chromatic rose-violet/sapphire-blue/
warm opal facets over the retained crimson/gold/ivory core, complete ensemble
coverage refined under D-116 to50/60/72/84/94/96% across six forms, with
25/20/14/8/3/2% per-side key margins. Late wings/mantle/thorn arches/ribbons
spread toward all sides/corners rather than clustering centrally. Body remains one third,
compact anatomy unchanged; effects/wings/bow fill the canvas without cropping
or hiding eyes. No glow/scenery. Final bow/Last Flare share facet accents.

**Current phase D-117:** owner moved to Thornia, requesting progressively
wilder yet elegant effects/splendor. [Thornia](../Art/characters/Thornia%20Art.md) now
has13 individually revised blocks, compact anatomy/eyes-only renderer,
segmented thorn armor/ornate greatsword,4/8/16 wings and increasingly elaborate
tilted eclipse rings/off-axis thorn fans/ribbons/interwoven open arches.
Same progressive ensemble/margin targets as Rosetta; Omnic retains and expands
Legendary's main wings, airborne sword sweep, royal mantle/collar and sword.
Rosetta's blocks unchanged. Pause for Thornia review; only Crinso pending.
Prior phase status above is historical; no runtime/artwork changes.

**Latest phase D-118/D-119:** owner next requests the same style for Roselius/
materials, then also Crinso. [Roselius/material pack](../Art/creatures/Passion%20of%20Crimson%20Roses.md)
now has12 revised cutouts: six compact female Luminous weaponless angels,
6/8/16 late wings and expanded rose court/thorn rings/mantle/crown with
right-facing airborne casting; six distinct face-free collectibles with
layered petals/rings/thorn fans, Soul retaining/expanding Heart's architecture.
Creature ensemble framing follows50/60/72/84/94/96% targets; materials stay
two-thirds square and readable. Scenery's three prompts remain unchanged.
[Crinso](../Art/characters/Crinso%20Art.md) now has13 revised blocks: compact eyes-only
identity,4/8/16 wings, gold-flame/crimson-lightning duality and one connected
double-ended two-edged sword. Weapon hub progresses to fully blossomed/nested
rose, rails/armor/mantle/tilted rings/counter-sweeping ribbons expand through
Omnic; same progressive ensemble spread and retained Legendary architecture.
Pause for these latest packs' review. All requested rose art lines corrected,
not yet generated/intaken; no capture/evolution/drop/sale/kit/economy changes.

D-120 subsequently refines Rosetta Omnic only with dense rear elemental
tapestry: overlapping rose mandalas/thorn lattice/radial petal rays/ribbons/
prism fragments occupy interior space behind character/wings. Retain96%
ensemble span/2% edge margins, compact eyes-only anatomy/renderer/identity and
clear face/bow window/narrow key channels. No glow/scenery or runtime changes.
Other portraits/icons/equipment/packs untouched; pause for her Omnic review.

Event duplicates have `acquisition:"banner-duplicate"`, Lv.60, capturedStage29,
and that stage's authored skills. Only final Treasury Lv.50 and final Roselius
Lv.60 allow below-stage levels with this provenance; mission captures cannot
forge the exception. Roselius use D-288's linear playable stats, `.65+.35*tier/5`, never hostile/boss
stats, fixed forms and a level60 cap. Their levels use Seed rather
than Luminous Seed. Locks, squads and any equipped Conduit protect sales/fodder.

| Evolution | Required level | Prismatica | Materials | Selected Roselius |
| --- | --- | --- | --- | --- |
|1->2 |30 |300 |15 Seed |None |
|2->3 |45 |600 |25 Seed +10 Bud |None |
|3->4 |60 |1,200 |25 Bud +10 Bloom |1 form3+ |
|4->5 |75 |2,400 |25 Bloom +10 Crest |2 form4+ |
|5->6 |90 |4,800 |25 Crest +10 Heart |3 form5+ |

D-374 supersedes D-360: Rosetta, Thornia and Crinso use the ordinary base
rarity recipes with their own Rosethorn materials. No extra Heart/Soul
evolution surcharge or Soul leveling surcharge remains. Prismatica,
fodder requirements and ordinary characters' Heaven/Abyss specialty items
are unchanged. Existing progress is retained without retroactive
charges/refunds or save migration. Shared `characterEvolutionCost`
drives the displayed recipe, confirmation and atomic offline/online deduction.
Regression tests in `crimson-roses.test.ts` and `server-game.test.ts` cover all
three characters, both late transitions, exact deductions, no-Soul evolution
success and missing required rarity rejection without persistence.

Levels retain existing `10+2*nextLevel` Prismatica and `ceil(nextLevel/30)` Seed.
Additional cumulative rarities follow regular leveling: Bud at31, Bloom at46,
Crest at61, Heart at76 and Soul at91, one each per level once unlocked.
There is no form-based surcharge, including preserved low-level late forms.
Final cap105; no EB cap increases.
Max Level, confirmations, previews and transactions share character-aware
costs. Existing EBs retain every recipe, fodder mode and saved progress.
First Fracture still awards10 Null-Prismatica once globally, not per character.
Fodder selections are explicit; stale/protected/duplicate/insufficient
selections fail without removal/spending.

Sales reread the exact UUID, reject lock/squad/Conduit protection, add only the
fixed-form material amount and remove only that copy in one validated write.
No Prismatica/Null-Prismatica sale reward for Roselius. Overflow or storage failure
preserves both materials and copy.

## Presentation and art

Home Events, the standalone Events screen and Gameplay > Events expose the
same mode; event button opens the correct banner through ordinary caller-based
navigation/loading. Stage selection, entry, battle menu/results, manual Continue,
Settings/replay, captured leaders, mixed squads and gear snapshots use shared
systems. Summon disclosures derive actual highest tier, duplicate reward and
present tiers from the chosen registration, not Standard-specific text.
Character Archive contains36 EB evolutions plus30 fixed creatures (66 forms).
Discovery/reveal and protected-copy management remain intact.

**54 generation prompts:**39 character/icon/weapon prompts plus15 Roselius/
material/header/arena/summoning prompts:

- [Rosetta](../Art/characters/Rosetta%20Art.md)
- [Thornia](../Art/characters/Thornia%20Art.md)
- [Crinso](../Art/characters/Crinso%20Art.md)
- [Event, creatures, materials and banner](../Art/creatures/Passion%20of%20Crimson%20Roses.md)

Simple starter-style bases build into full-body crimson/gold/pearl prism armor,
large wings, rose/thorn powers and ornate signature weapons. Rosetta's6-star
finale is more elaborate. Preserve the compact eyes-only renderer, full
silhouettes/margins and non-emissive opaque cutout powers; scenery can use light.
Crinso has one dual-edged weapon, never two independent swords.

No generated PNGs were supplied. Characters use a labeled neutral SVG placeholder;
icons stay text-only; creatures/materials/scenery/banner stay explicitly pending.
Never request nonexistent PNGs or borrow another character/mode's images.
Future intake must register assets/facing and preserve original source bytes.

## Edit points and validation

- Mode/form/drop tuning: [activities](../src/content/activities.ts),
  [infusions](../src/content/infusions.ts), [roses](../src/content/roses.ts).
- Banner: [rose-banner](../src/content/rose-banner.ts) and
  [registrations](../src/content/summon-banners.ts).
- EB identities/forms/kits: [starters](../src/content/starters.ts),
  [character-art](../src/content/character-art.ts), [combat](../src/content/combat.ts).
- Costs: [progression](../src/content/progression.ts); all callers must use
  `characterLevelCost`/`characterEvolutionCost`/`characterEvolutionRequirement`.
- Persistence/sales: [account](../src/game/account.ts) and
  [character-instances](../src/game/character-instances.ts).
- UI: [rose-event](../src/presentation/rose-event.ts) and shared menus.

Run `npx vitest run src\game\crimson-roses.test.ts`, `npm test`, and Build Last
Light (`npm run build`). For the full suite on a contended/shared machine use
`npm test -- --maxWorkers=2`; the500-draw integration case otherwise may exceed
its existing5-second timeout. Do not weaken assertions or change global timeouts.
Run both
`python -m unittest discover -s tools -p test_art_prompts.py` and
`python -m unittest discover -s tools -p test_rose_art_prompts.py`.
Validate all35 floors/direct/burn kills, exact120/121 capture boundary,
final-stage Continue, atomic payouts/sales/overflow/write failures, duplicates/
pity independence, every character's five max-level evolution gates, protected
fodder and Max Level. Max-level original/rose/mixed squads clear the140 final
boss with no Conduits across three deterministic seeds (10-22 rounds in the
initial check); this establishes feasibility, not production difficulty tuning.
Check Events/summon/character/copy/archive/battle on
320/390/768/1280px, long names, safe integers, focus/Back and no missing PNGs.

Remaining: actual image generation/intake/manual review, production balance
playtesting and an optional owner-selected event schedule. No monetization or
unrelated flagship integration is implied.
