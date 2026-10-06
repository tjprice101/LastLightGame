# Units and progression

## Conduit terminology and current scope

The owner renamed Artifacts to **Conduits**: mechanisms hidden during an ancient
war, some powered by Elemental Light. Character equipment now uses Conduits,
eight Conduit slots and a separate Master Conduit slot. Older Artifact
wording below is historical. Store purchases and per-character equipment/buffs
are implemented. One owned copy unlocks every character; each name can equip
once per character. Eight ordinary slots active, Master reserved.
See [catalog and transactions](conduits.md).
Duplicate captured-copy storage, locks, independent levels/Conduits and playable
mixed/all-captured squads are implemented in [Phases5/6](character-instances.md).

**Status:** starter leveling and Fracture are executable, persistent transactions.
All ten elemental dungeons and both specialty modes supply resources. Weapon
upgrades are disabled and removed from menus; previously purchased rank bonuses
remain effective and survive saves/growth. Creature infusion and Conduit equipment
are implemented; see [creature infusion](evolution-fodder.md).
See [opening flow](opening-flow.md). All five supplied evolved portraits per
starter now map to Evo.2-6, following the owner's six-form approval (D-033).

## Confirmed progression and equipment structure

The owner confirmed evolution, character levels, and separate
upgrades for the unique passive, ability 1, ability 2, and ultimate.
Ultimate display names must use `Last Flare: <character-specific name>`.
Adventure's initial names, effects, stats, and formulas were delegated for the
prototype and are documented separately. Upgrade costs, materials, and exact
transactions now use an editable first-pass balance below. Stat/skill/passive growth and all six standard level
caps are confirmed below.

### Stars versus evolution rarity

Infernis, Tizu and Flora have a fixed **5-star** summon rating. Each starts at
Common rarity, then advances through Uncommon, Rare, Epic, Legendary and Omnic
at Evo2-6. Star rating does not increase with evolution or imply current summon
odds. Rarity is derived from form, not saved separately.
The shared [rating renderer](../src/presentation/character-rating.ts) serves
selection, Home, Character, roster, Squad, Standard Banner and battle details.
Combat nameplates stay compact; classification appears in Battle menu.
Classification uses physical beveled star shapes and an evolution-number rarity
medallion, including beside Character overview stats. Star tiers progress copper,
silver, gold, violet, luminous white and prismatic rainbow at1-6 stars; higher
tiers have stronger glow. A staggered reflective sweep animates in normal motion;
reduced motion keeps static highlights/glow. Accessible labels announce the star
count and rarity; decorative shapes are hidden from screen readers.

Weapon names/art remain part of character identity. Weapon spending is rejected
even if called directly; existing ranks/material holdings are retained, with
no refund or new spending. Historical weapon price tables are inactive.
See the [active expansion phases](roadmap.md#active-owner-requested-expansion-phases).

### Confirmed level and Fracture rules

- Tier 1 characters level up to **30** before needing to **Fracture** (evolve)
  into Tier 2.
- Six forms have level caps **30 / 45 / 60 / 75 / 90 / 105**. Each evolution adds 15
  to the cap, not 10. Evolving requires reaching the current form's cap.
- Evolution **preserves the current level**. This supersedes the earlier reset
  to level 0 and repeated level-30 cap.
- Core growth is **`G = (1 + .03 * level)^3 * 1.45^(evolution - 1)`**.
  Each evolution multiplies core growth by1.45, preserving level. Levels follow
  an accelerating cubic curve. This supersedes the former additive1%/10% rule.
  At Lv105/Evo6, starters have roughly87,000-119,000 HP before equipment.
- HP, Attack and Elemental Damage scale byG; effective Defense scales byG^0.7.
  Percentage/resource/skill potency uses **`P = 1 + .003*level + .05*(evolution-1)`**
  instead of multiplying large HP growth into critical chances or coefficients.
- The first Fracture on this local account grants **+10 Lycalis**, once.
  Later evolutions grant no Lycalis in this pass.
- Owned starters begin at **Lv.0 / Evo.1**, preserving the existing base combat
  kit. There is no battle XP.
- Leveling consumes Fractalis and Common material of the character's element.
  Creature consumption is temporarily omitted with owner approval, not removed
  from the long-term evolution design. Evo5/6 levels also consume one matching
  specialty leveling item; artifacts remain unimplemented.

### First-pass philosophy and editable costs

Frequent small upgrades make ordinary dungeon rewards useful; evolution is a
larger milestone funded by adjacent material rarities. Rare drops are not required
for ordinary levels. No Lycalis is spent and no materials are granted on migration.
These are implemented tuning defaults, not finalized production grind targets.

Each destination level costs **10 + 2 x destination level Fractalis** and
**ceil(destination level / 30) Seeds** of its element:

| Destination level | Seeds per level |
| --- | --- |
| 1-30 | 1 |
| 31-60 | 2 |
| 61-90 | 3 |
| 91-105 | 4 |

| Evolution | Required level | Fractalis | Own-element materials |
| --- | --- | --- | --- |
| 1 -> 2 | 30 | 300 | 15 Seeds (Common) |
| 2 -> 3 | 45 | 600 | 25 Seeds + 10 Blooms (Uncommon) |
| 3 -> 4 | 60 | 1,200 | 25 Blooms + 10 Shards (Rare) |
| 4 -> 5 | 75 | 2,400 | 25 Shards + 10 Crests (Epic) |
| 5 -> 6 | 90 | 4,800 | 25 Crests + 10 Hearts (Legendary) |

From Lv.0/Evo.1 through Lv.105/Evo.6: **21,480 Fractalis, 280 Seeds,
35 Blooms, 35 Shards, 35 Crests and 10 Hearts**. Omnic Souls remain collectible
but have no spending recipe yet. Only one level is bought per
confirmation; bulk leveling and independent skill purchases remain open.
Also required: 15 matching specialty evolution items (5 for4->5, 10 for5->6)
and30 specialty leveling items for the normal cap-to-cap path through Evo5/6.
The leveling surcharge is form-based even for preserved levels below80.

Weapon ranks0-10 are saved per character. Destination rank R costs100R Fractalis
and5R specialty weapon items. Each rank adds2% of grown Attack (rank10 =20%).
Other stats and skill coefficients are not modified. Full rank progression costs
5,500 Fractalis and275 specialty weapon items. Heaven serves Infernic/Aquatic/
Tectonic/Efflorescent/Atmospheric; Abyss serves the remaining elements.
See [mode drops and specialty rules](gameplay-and-elements.md#two-infusion-modes).

Tune [levelCost/evolutionBalance](../src/content/progression.ts), not UI strings.
[Account transactions](../src/game/account.ts) recheck the saved owned Element-Bearer,
expected level/form/weapon rank, eligibility and balances, then write all mutations together.
Insufficient funds, stale progress and storage failures leave the save unchanged.
The screen displays current/next stats and owned/required resources, asks for
confirmation, and keeps the portrait/rail mounted after tab changes and upgrades.

### Seven stats and skill/passive growth

| Stat | Runtime field | Base prototype behavior |
| --- | --- | --- |
| Shatter Gauge Amount | `shatterCapacity` | Maximum100 timesP; current gauge starts0 |
| Health | `health` | Maximum HP |
| Defense | `defense` | Flat damage reduction; displayed effective defense includes passive |
| Attack Damage | `damage` | Base hit damage before action coefficients |
| Critical Rate | `crit` | Base timesP, capped at75% |
| Critical Damage Multiplier | `critMultiplier` | 1.5x base timesP, capped at3x |
| Elemental Damage | `elementalDamage` | Infernis burn base 8; other starters have no damaging elemental status and use 0 |

All seven retain fractional growth from original base; never round resolved stats
to integers. Effective defense scales the combined base and passive contribution
byG^0.7. Lv.1 Infernis has10.64 defense,41.52 attack and8.74 elemental damage
when formatted for display.
Zero-base stats remain zero (Tizu/Flora have no damaging elemental status yet);
percentage growth does not create a new ability or a nonzero base.
All displays use the shared formatter with up to two decimals; formatting never
changes the numbers used by combat. Saved levels/forms resolve automatically,
so existing accounts need no migration or repurchase.
Percent bonuses are relative. Lv105/Evo6 usesP=1.565: Infernis critical rate is
23.475%, critical multiplier2.3475x and Shatter capacity156.5, not enormous
HP-scale percentages.

Only maximum Shatter capacity grows. Normal +20, incoming-hit +10 and
skill costs 25/40/100 remain fixed.

Skill coefficients, burn coefficient, flat shields/heals, extra critical chance,
weakening strength and passive magnitudes grow. Cooldowns, durations, passive
trigger thresholds and ultimate recovery do not. Flat shield/heal potency retains fractions;
weakening and extra critical chance are capped at50%, passive healing at10%
of recipient maximumHP per trigger, and conditional passive damage at75%.
Flat shields/heals scale byG; coefficients, burn coefficient and percentage
passives scale byP. Passive flat Defense usesG^0.7.
Attack Damage and skill coefficients both scale, intentionally strengthening
skill hits through both factors. Burn uses the grown Elemental Damage stat times
the grown skill coefficient, rounded to an integer. Flora's passive uses grown
healing percentage against the recipient's grown maximum HP.
Combat still rounds direct attack power before subtracting full-precision defense,
burn ticks, Defense-mode damage and percentage-heal outcomes at their established
resolution points. A rounded hit need not rise every level; the underlying stats
and potency do. Flat healing/shields and HP can be fractional.

[Resolved fighter definitions](../src/content/combat.ts) provide numeric potency
and matching descriptions; [combat](../src/game/battle.ts) consumes that resolved
kit rather than fixed starter-specific constants. `createBattle` accepts explicit
progress for integration/testing. Normal Adventure and dungeon entry now resolve the saved starter's progress.
An active run snapshots its kit; Settings and replay preserve that snapshot.
Home, Character, skill/passive descriptions and battle all use the same resolver.

### Elemental evolution-material framework

The current starter lines have six forms (Evo.1-6). Their own elemental dungeon supplies
Common/Uncommon/Rare/Epic/Legendary/Omnic materials. Approved recipes: 1->2 Common,
2->3 Common+Uncommon, 3->4 Uncommon+Rare, 4->5 Rare+Epic, 5->6 Epic+Legendary. Each also requires Fractalis
and, from Evo3->4 onward, explicitly selected captured creatures from the mapped
mode. Existing quantities above remain active; Phase7 supplements them with
1/2/3 copies of form3+/4+/5+ respectively. See [selection/protection rules](evolution-fodder.md).
Omnic uses and exceptional evolution lines remain open.
See [the owning element/material specification](gameplay-and-elements.md) and
[typed requirement definitions](../src/content/activities.ts); Character Upgrades
shows the next recipe, actual owned counts, costs and an eligible action.

The earlier preview-only decision is superseded by this first implementation pass.
See [editable rules](../src/content/progression.ts), the
[save contract](technical-architecture.md#persistence-contract), and
[transaction tests](../src/game/account.test.ts).

Each character has **eight unique artifacts** and **one Master Artifact** equipped
at most: nine character-owned slots, with the Master Artifact above the others.
These live in Character > Artifacts / Equipment, separate from the materials-only
global Inventory. Artifacts buff that character's stats, not all owned characters.
The uniqueness definition, item eligibility, and cross-character sharing rules
still need clarification. See [menu/equipment requirements](menus-and-inventory.md).
Empty equipment previews exist; artifact acquisition, equipping and bonus
calculations are not implemented. Leveling/evolution are implemented separately.

## Separate these identities

| Concept | Meaning |
| --- | --- |
| Unit definition | Authored archetype shared by all copies |
| Owned unit instance | One player's copy with a unique instance ID |
| Evolution form | A form within a character's evolution line |
| Rarity | Acquisition or balance classification; not automatically an evolution stage |
| Level | Preserved across evolution; caps 30/45/60/75/90/105 |

Definitions should use stable IDs rather than display names. An owned instance
references its definition/form and records only mutable player state.

## Existing art concepts

The [prompt guide](../Art/midjourney-character-style-prompt.md) describes six art
stages each for Ember Swordsman, Tide Spearbearer, and Sprout Archer.
Hair, eyes, signature clothing, and weapon type remain recognizable across stages.
Fire, water, or grass can be chosen as the permanent starter. All three have implemented
prototype combat kits in [Adventure](free-battle.md), which uses only the saved starter.
They are listed in the active Standard Banner. Six gameplay forms affect progression/stats, and
all supplied later-form portraits now appear on Home, Character, Squad and in
battle. Selection stays on the beginner art. Character upgrade tabs and successful
evolution keep the portrait DOM node mounted; evolution changes its src/alt only.
The [shared art resolver](../src/content/character-art.ts) owns form titles and
asset IDs. Original PNGs are preserved; exports use the established unit contract.
The supplied art uses the names Infernis, Tizu, and Flora; stable save IDs remain
`ember`, `tide`, and `sprout` so old profiles still load.

## Implemented roster and squad behavior

Character progress records now represent ownership by stable ID (`ember`, `tide`,
`sprout`), not duplicate instances. The original saved starter is normalized to
Lv.0/Evo.1 ownership when absent, without writing during load. Existing progress
is preserved. The Character roster selects each owned Element-Bearer independently;
its tabs, costs, evolution art and upgrade transactions follow that selection.

Squad saves one to three distinct owned IDs in order. First slot is the leader
(no additional stat bonus); remaining slots are optional. Any owned character
can lead and the starter can be removed, but the squad cannot be empty.
Saving does not consume/remove ownership. Summons start unequipped.

Every battle mode snapshots equipped IDs and each member's progress at run entry.
Each living character has one action per turn, separate Gauge/recovery/cooldowns
and its existing tank/healer/attacker kit. Continue retains the roster and each
Gauge; staged encounters reset HP/cooldowns, Adventure carries encounter state.
Replay retains the run's progress snapshot and team, with fresh Gauge.
Squad edits affect the next run; Settings retains the current run.
See [summoning](summoning-and-economy.md) and [tests](../src/game/squad.test.ts).

Heaven/Abyss captures are separate owned instances: retain defeated level/form
and hostile skills, independently level to120, equip eight ordinary Conduits,
use Normal/Defense and manual shared-Gauge retained abilities. Missing skills
are unavailable. No evolution/Fracture or starter upgrade paths. Ordinary stats
gain a permanent fixed-form multiplier, not boss bonuses; later forms have
fixed1-6-star ratings. See [capture rules](dungeons-and-captures.md).

Captured duplicates and manual locks/automatic squad protection are approved.
Phase7 [creature infusion](evolution-fodder.md) consumes1/2/3 form3+/4+/5+
creatures for Evo3->4/4->5/5->6 alongside existing costs, using the element's
mode mapping. Locked/squad/Conduit-equipped copies are protected. Currency-farm
selling is implemented; leader bonuses remain unimplemented.
Standard includes the three5-star EBs and the first three forms of Heaven/Abyss/
Treasury/Sanctuary creatures (15 real outcomes). Draws are active; owned EB
results award the Omnic Treasury crowned slime at Lv50. Treasury copies sell
for Fractalis; Sanctuary copies sell for both Fractalis and Lycalis by fixed-form
rarity, protected when locked/squad-assigned/Conduit-equipped.
See [Sanctuary rules](rosethorn-sanctuary.md).

## Progression decisions

Specify XP thresholds, material costs, and additional unlock conditions.
Preserve the confirmed six caps, accelerating growth, level preservation and first
Fracture +10 Lycalis reward.
Evolution must define source form, destination form, prerequisites, and how
level/XP/skills/equipment transfer. Do not silently reset invested progress.

Duplicates may remain separate instances, contribute to upgrades, convert to
materials, or use another owner-approved rule. No consumption policy is confirmed.

## Proposed operation contract

Preview costs and results -> validate current state -> atomically consume costs
and apply changes -> persist -> display the committed result.

Canceling a preview must change nothing. A failed operation must not remove
materials. Show explicit reasons for unavailable actions.

## Validation cases

- Failed/unaffordable Standard draws never charge or grant; successful draws
  atomically save cost, reward and pity. Existing EBs/progress remain unchanged.
- XP boundary behavior and caps match documented tables.
- Evolution rejects missing prerequisites and invalid form transitions.
- First Fracture requires level 30 in Tier 1, reaches Tier 2 at level 30, and grants
  exactly 10 Lycalis once. Retrying cannot duplicate the reward.
- Successful evolution charges once and preserves the approved carryover fields.
- Locked/assigned-unit restrictions apply to every destructive operation.
- Unknown definition IDs in a save trigger a defined migration/recovery policy.

## Extension points

Use the [content guide](content-guide.md#adding-a-unit) for new definitions.
Add links to roster storage, squad validation, progression tables, and tests
when those surfaces exist.
