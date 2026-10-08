# Passion of Crimson Roses and Roses Under Sunny Skies

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
See [provenance](../Art/character-refresh-intake.json) and
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
[Roses provenance](../Art/roses-art-intake.json); regeneration/review steps are
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
- Captures can fight or sell for their form's material. **Only defeated enemies
  at levels120 or below can be captured.** Existing captured cap120 is unchanged.
- Special banner follows the approved existing10 cost and independent200/500
  highest-star pity. All three EBs share1.1% equally (1.1% /3 each); the first three Roselius
  forms split98.9% with50:30:17 weights.
- Duplicate event EBs award an Omnic Roselius at **Lv.80**, with its final-form
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
every fifth stage has one boss. Form thresholds below deliberately allow
Legendary fodder captures before the capture ceiling; Omnic mission enemies
are never capturable, but banner duplicates provide an explicit final-form copy.

| Form | Stages | Creature | Rarity | Sale |
| --- | --- | --- | --- | --- |
|1 |1-5 |Roselius |Common |1 Seed |
|2 |6-10 |Votive of Golden Thorns, Roselius |Uncommon |2 Bud |
|3 |11-15 |Knight of the Crimson Bloom, Roselius |Rare |3 Bloom |
|4 |16-21 |Seraph of Passion, Roselius |Epic |4 Crest |
|5 |22-28 |Sovereign of the Living Rose, Roselius |Legendary |5 Heart |
|6 |29-35 |The Garden Beyond Eternity, Roselius |Omnic |6 Soul |

Stable creature IDs are `infusion:roses:0` through `infusion:roses:5`.
Stage23 is Lv.119 (last capturable stage); Stage24 is Lv.121. The rule itself
is inclusive120, not a stage-number approximation.

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

No Null-Prismatica and no stage-clear award. Boss/ordinary reward tables match.
Prismatica uses the existing quadratic quantity curve extended to140 only here:
9-18 at80,15-30 at120,18-36 at140. Materials roll independently by rarity.

| Material | Stable ID | Unlock level | Chance at unlock ->140 |
| --- | --- | --- | --- |
|Seed |`rosethorn-common` |80 |100% ->100% |
|Bud |`rosethorn-uncommon` |90 |49% ->98% |
|Bloom |`rosethorn-rare` |100 |45% ->90% |
|Crest |`rosethorn-epic` |110 |40% ->80% |
|Heart |`rosethorn-legendary` |120 |30% ->60% |
|Soul |`rosethorn-omnic` |130 |17.5% ->35% |

Quantity minimum is `1+floor(2*((level-80)/60)^2)`, maximum twice that.
Every successful final drop is3-6. Chance progress uses the shared power1.4
curve from each unlock to140. [infusionLoot](../src/content/infusions.ts)
is authoritative for battles, stage previews and defeated Creature loot.
Capture uses the existing independent20% RNG, gated before acquisition by
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
[Rosetta](../Art/Rosetta%20Art.md) is Phase8:13 blocks retain their format,
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
wilder yet elegant effects/splendor. [Thornia](../Art/Thornia%20Art.md) now
has13 individually revised blocks, compact anatomy/eyes-only renderer,
segmented thorn armor/ornate greatsword,4/8/16 wings and increasingly elaborate
tilted eclipse rings/off-axis thorn fans/ribbons/interwoven open arches.
Same progressive ensemble/margin targets as Rosetta; Omnic retains and expands
Legendary's main wings, airborne sword sweep, royal mantle/collar and sword.
Rosetta's blocks unchanged. Pause for Thornia review; only Crinso pending.
Prior phase status above is historical; no runtime/artwork changes.

**Latest phase D-118/D-119:** owner next requests the same style for Roselius/
materials, then also Crinso. [Roselius/material pack](../Art/Passion%20of%20Crimson%20Roses.md)
now has12 revised cutouts: six compact female Luminous weaponless angels,
6/8/16 late wings and expanded rose court/thorn rings/mantle/crown with
right-facing airborne casting; six distinct face-free collectibles with
layered petals/rings/thorn fans, Soul retaining/expanding Heart's architecture.
Creature ensemble framing follows50/60/72/84/94/96% targets; materials stay
two-thirds square and readable. Scenery's three prompts remain unchanged.
[Crinso](../Art/Crinso%20Art.md) now has13 revised blocks: compact eyes-only
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

Event duplicates have `acquisition:"banner-duplicate"`, Lv.80, capturedStage29,
and that stage's authored skills. Only final Treasury Lv.50 and final Roselius
Lv.80 allow below-stage levels with this provenance; mission captures cannot
forge the exception. Roselius use ordinary stats, `.65+.35*tier/5`, never boss
stats, fixed forms and independent leveling to120. Their levels use Seed rather
than Luminous Seed. Locks, squads and any equipped Conduit protect sales/fodder.

| Evolution | Required level | Prismatica | Materials | Selected Roselius |
| --- | --- | --- | --- | --- |
|1->2 |30 |300 |15 Seed |None |
|2->3 |45 |600 |25 Seed +10 Bud |None |
|3->4 |60 |1,200 |25 Bud +10 Bloom |1 form3+ |
|4->5 |75 |2,400 |25 Bloom +10 Crest +5 Soul |2 form4+ |
|5->6 |90 |4,800 |25 Crest +10 Heart +10 Soul |3 form5+ |

Levels retain existing `10+2*nextLevel` Prismatica and `ceil(nextLevel/30)` Seed;
Evo.5/6 also consume1 Soul per level. Final cap105; no EB cap increases.
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

- [Rosetta](../Art/Rosetta%20Art.md)
- [Thornia](../Art/Thornia%20Art.md)
- [Crinso](../Art/Crinso%20Art.md)
- [Event, creatures, materials and banner](../Art/Passion%20of%20Crimson%20Roses.md)

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
