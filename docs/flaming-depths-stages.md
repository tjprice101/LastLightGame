# Flaming Depths - 50-stage design

**Superseded level/stat draft:** the new owner-approved elemental framework starts
at level 10, grows linearly to 120 by Stage 45 and stays at 120 through Stage 50.
The old levels 6-55 and their derived stat/milestone numbers below are historical,
not current implementation inputs. Encounter/skill ideas remain unapproved proposals.
Use [Gameplay and elements](gameplay-and-elements.md) and its tested level helper
for current rules; revise HP/DEF/ATK balance before enabling this dungeon.

**Status: proposed balance, not playable.** The owner requested design through
Stage 50 and selected documentation/art first. The 50-stage scope is confirmed;
the numbers, ability schedules, lineups, bosses, and entry/run policies below are
a complete editable proposal, not approval to enable transactions or captures.
See [Dungeons and captures](dungeons-and-captures.md) for the confirmed contracts.

## Structure and intended progression

- One stage is one wave. Stages 1-50 form one finite dungeon run.
- Proposed entry: Home dungeon selector, separate from Adventure, no entry cost
  for the prototype. Every run begins at Stage 1; checkpoint/resume is not proposed.
- Four three-enemy encounters followed by one solo elite milestone per five-stage
  region. Ten regions introduce all ten supplied enemy archetypes in visual-power order.
- Every enemy, including milestone elites, is level `stage + 5`.
  Thus every dungeon enemy exceeds Adventure's enemy level at the corresponding
  wave. This comparison is explicit: not higher than an arbitrarily deep Adventure run.
- Stage 50 ends the dungeon, never generates Stage 51. A wave-end action report
  appears after every clear, including Stage 50, before continuing or completing.
- Proposed carryover: current HP, shields, cooldowns, Shatter Gauge and recovery
  between stages; no free healing or revival at a boundary. Leave/defeat ends the
  run. Upgrade/squad balance must be implemented and playtested before difficulty
  can be called achievable. Current unupgraded solo starters are not expected to
  beat all 50 stages.
- Enemy abilities below belong to hostile dungeon enemies only. Captured versions
  get Normal only after global Heavy removal, never inherit these skills, elite bonuses, or boss flags.

## Base stats and level growth

The table's HP/DEF/ATK values are **at level 6**. Use distinct hostile definitions
and the stable art IDs; do not replace Adventure's Goblin/Imp/Golem stats.

| Key | Enemy | Asset ID | HP at Lv6 | DEF at Lv6 | ATK at Lv6 | Crit |
| --- | --- | --- | --- | --- | --- | --- |
| A | Ashling | `ashling` | 120 | 5 | 24 | 5% |
| K | Coalcap Kobold | `coalcap-kobold` | 135 | 7 | 26 | 8% |
| F | Emberhorn Faun | `emberhorn-faun` | 150 | 8 | 29 | 10% |
| S | Furnace Salamander | `furnace-salamander` | 170 | 10 | 32 | 10% |
| C | Cinderhide Cyclops | `cinderhide-cyclops` | 210 | 13 | 35 | 5% |
| G | Obsidian Gargoyle | `obsidian-gargoyle` | 225 | 16 | 37 | 8% |
| M | Brasshorn Minotaur | `brasshorn-minotaur` | 250 | 18 | 40 | 10% |
| H | Pyrewing Harpy | `pyrewing-harpy` | 230 | 17 | 43 | 12% |
| W | Magma Wyrm Knight | `magma-wyrm-knight` | 285 | 22 | 46 | 10% |
| I | Ifrit of the Last Furnace | `last-furnace-ifrit` | 310 | 24 | 50 | 12% |

For level `L >= 6`, let `d = L - 6`:

- HP = `baseHP + 12*d`.
- DEF = `baseDEF + d`.
- ATK = `baseATK + 2*d`.
- Crit stays at the archetype's base chance.
- A **solo elite milestone**, after level growth: HP `*2`, DEF `+4`,
  ATK `ceil(ATK*1.2)`. It remains one enemy with one action per enemy phase.
- No compounding, random stat rolls, elemental resistance, armor penetration,
  enrage stacking, or hidden level damage multiplier.
- Reuse current damage rounding, flat defense, 1-damage floor, 150% criticals,
  shields-before-HP, heal caps, no revival, and ultimate-only player recovery.

Ability rank `R = 1 + floor((stage - 1)/10)`, capped at 5. Regular stages and
milestones use the same regional rank; levels/elite stats provide milestone pressure.

| Rank | Stages | Skill damage multiplier | Burn/tick | Shield | Heal |
| --- | --- | --- | --- | --- | --- |
| 1 | 1-10 | 1.20 | 4 | 12 | 12 |
| 2 | 11-20 | 1.30 | 6 | 18 | 18 |
| 3 | 21-30 | 1.40 | 8 | 24 | 24 |
| 4 | 31-40 | 1.50 | 10 | 30 | 30 |
| 5 | 41-50 | 1.60 | 12 | 36 | 36 |

General skill rules: rank multiplier = `1.1 + 0.1*R`; burn = `2 + 2*R`;
shield/heal = `6 + 6*R`. Direct skill damage uses that enemy's level-scaled ATK.
All attacks choose one random living ally unless the skill explicitly targets all.
Percent effects below do not scale again with level.

## Hostile ability designs and telegraphs

Use the listed skill **instead of**, never in addition to, the enemy's normal
100% attack. On other phases it attacks normally. Enemy-phase numbering resets
to 1 at each stage. A skill every third phase fires at phases 3, 6, 9, etc.
Show the upcoming skill name/target pattern before the player chooses actions
on that phase; never surprise the player with an unannounced extra attack.
An elite follows the same schedule, not extra actions or reduced cooldowns.

| Key | Ability | Schedule | Exact proposed effect |
| --- | --- | --- | --- |
| A | Ember Flick | Every 3rd enemy phase | Rank-multiplier damage to one ally; if alive, burn for rank burn damage on its next 2 enemy phases |
| K | Coal Pick | Every 3rd | Rank-multiplier damage to one ally; no extra status |
| F | Furnace Feint | Every 3rd | Rank-multiplier damage to one ally with +10 percentage points crit chance, capped at 100% |
| S | Scorching Saber | Every 3rd | Rank-multiplier damage to one ally; if alive, apply the same 2-phase burn as A |
| C | Crucible Slam | Every 4th | `(1.4 + 0.1*R)` damage multiplier to one ally; no stun or action denial |
| G | Obsidian Ward | Every 3rd | No attack; refresh its own shield to at least the rank shield amount, never additive |
| M | Brasshorn Charge | Every 4th | Rank-multiplier damage to one ally; reduce that ally's outgoing direct attack damage by 20% for its next 2 player turns |
| H | Pyre Mending | Every 3rd | No attack; heal every living enemy by rank heal amount, capped at max HP; no revival |
| W | Volcanic Lance | Every 4th | Rank-multiplier damage to one ally, then refresh its own shield to at least the rank shield amount |
| I | Last Furnace Eruption | Every 4th | `(0.6 + 0.1*R)` damage multiplier to each living ally; no burn or recovery lock |

Player burn ticks before hostile actions at each enemy phase and consumes shields
before HP; a lethal tick prevents that ally acting on a later player turn.
New burns start ticking on the next enemy phase, not immediately on application.
Enemy burn still follows existing rules: before its action, a lethal tick cancels it.
Same-source burns refresh duration rather than stack; overlapping burns use the
larger tick and refresh to 2 remaining phases. No indefinite accumulation.
Charge weaken affects direct Normal/skill/Last Flare damage before crit and
defense, not burn/healing/shield. Refresh rather than stack; expire after two
subsequent player turns, whether the ally acts or is recovering.
Shatter incoming-hit gain applies once per direct hit, including Eruption's hit
on each target; burn, wards and heals do not grant gauge.
These ally statuses need implementation and exact expiry tests; they are not
currently supported by the Adventure UI/resolver.

## Every stage

Lineup entries repeat intentionally: `A + A + A` means three separate Ashlings,
not one acting three times. All regular enemies use the listed shared level.
Milestone rows list the elite's **final HP / DEF / ATK after its modifiers**;
crit remains unchanged. Other rows derive exact stats from the tables above.

| Stage | Region | Lv | Lineup | Rank | Milestone final HP / DEF / ATK |
| --- | --- | --- | --- | --- | --- |
| 1 | Soot Threshold | 6 | A + A + A | 1 | - |
| 2 | Soot Threshold | 7 | A + A + A | 1 | - |
| 3 | Soot Threshold | 8 | A + A + A | 1 | - |
| 4 | Soot Threshold | 9 | A + A + A | 1 | - |
| 5 | Soot Threshold | 10 | Elite A | 1 | 336 / 13 / 39 |
| 6 | Coalcap Tunnels | 11 | K + A + A | 1 | - |
| 7 | Coalcap Tunnels | 12 | K + K + A | 1 | - |
| 8 | Coalcap Tunnels | 13 | K + K + K | 1 | - |
| 9 | Coalcap Tunnels | 14 | K + K + K | 1 | - |
| 10 | Coalcap Tunnels | 15 | Elite K | 1 | 486 / 20 / 53 |
| 11 | Emberhorn Crossing | 16 | F + K + A | 2 | - |
| 12 | Emberhorn Crossing | 17 | F + F + K | 2 | - |
| 13 | Emberhorn Crossing | 18 | F + F + F | 2 | - |
| 14 | Emberhorn Crossing | 19 | F + F + F | 2 | - |
| 15 | Emberhorn Crossing | 20 | Elite F | 2 | 636 / 26 / 69 |
| 16 | Salamander Forges | 21 | S + F + K | 2 | - |
| 17 | Salamander Forges | 22 | S + S + F | 2 | - |
| 18 | Salamander Forges | 23 | S + S + S | 2 | - |
| 19 | Salamander Forges | 24 | S + S + S | 2 | - |
| 20 | Salamander Forges | 25 | Elite S | 2 | 796 / 33 / 84 |
| 21 | Cinderhide Works | 26 | C + S + F | 3 | - |
| 22 | Cinderhide Works | 27 | C + C + S | 3 | - |
| 23 | Cinderhide Works | 28 | C + C + C | 3 | - |
| 24 | Cinderhide Works | 29 | C + C + C | 3 | - |
| 25 | Cinderhide Works | 30 | Elite C | 3 | 996 / 41 / 100 |
| 26 | Obsidian Vault | 31 | G + C + S | 3 | - |
| 27 | Obsidian Vault | 32 | G + G + C | 3 | - |
| 28 | Obsidian Vault | 33 | G + G + G | 3 | - |
| 29 | Obsidian Vault | 34 | G + G + G | 3 | - |
| 30 | Obsidian Vault | 35 | Elite G | 3 | 1146 / 49 / 114 |
| 31 | Brasshorn Crucible | 36 | M + G + C | 4 | - |
| 32 | Brasshorn Crucible | 37 | M + M + G | 4 | - |
| 33 | Brasshorn Crucible | 38 | M + M + M | 4 | - |
| 34 | Brasshorn Crucible | 39 | M + M + M | 4 | - |
| 35 | Brasshorn Crucible | 40 | Elite M | 4 | 1316 / 56 / 130 |
| 36 | Pyrewing Sanctum | 41 | H + M + G | 4 | - |
| 37 | Pyrewing Sanctum | 42 | H + H + M | 4 | - |
| 38 | Pyrewing Sanctum | 43 | H + H + H | 4 | - |
| 39 | Pyrewing Sanctum | 44 | H + H + H | 4 | - |
| 40 | Pyrewing Sanctum | 45 | Elite H | 4 | 1396 / 60 / 146 |
| 41 | Wyrm Regent Hall | 46 | W + H + M | 5 | - |
| 42 | Wyrm Regent Hall | 47 | W + W + H | 5 | - |
| 43 | Wyrm Regent Hall | 48 | W + W + W | 5 | - |
| 44 | Wyrm Regent Hall | 49 | W + W + W | 5 | - |
| 45 | Wyrm Regent Hall | 50 | Elite W | 5 | 1626 / 70 / 161 |
| 46 | Last Furnace | 51 | I + W + H | 5 | - |
| 47 | Last Furnace | 52 | I + I + W | 5 | - |
| 48 | Last Furnace | 53 | I + I + I | 5 | - |
| 49 | Last Furnace | 54 | I + I + I | 5 | - |
| 50 | Last Furnace | 55 | Elite I | 5 | 1796 / 77 / 178 |

For example, Stage 1 Ashling = Lv6, 120 HP / 5 DEF / 24 ATK.
Stage 2 Ashling = Lv7, 132 / 6 / 26. Stage 46's Ifrit = Lv51,
850 / 69 / 140; its Wyrm and Harpy allies use their own Lv51 base-derived stats.
Stage 50 Ifrit's rank-5 Eruption multiplier is 1.10 per target, not 1.60.
Milestones have higher per-enemy stats but fewer attacks; aggregate wave HP/attack
is not promised to be strictly increasing. A milestone's difficulty must be
playtested, not inferred from its displayed level.

## Rewards, capture boundary, and wave reports

No dungeon Prismatica amounts, capture odds or completion rewards are approved.
Do not copy Adventure rewards silently or let the stage table grant ownership.
Capture eligibility (especially elites/Ifrit), captured-level conversion,
capacity, duplicate policy, team size and leveling costs remain owner decisions.

Proposed report: stage/region, enemy names/levels and elite marker, action timeline,
per-unit direct and burn damage, healing, shielding, crits, defeats, remaining HP,
and approved rewards/capture outcomes once defined. Separate the full per-stage
ledger from the existing 40-event recent log. Report once after a clear; disabled
Continue until report acknowledgement. Stage 50 uses Complete Dungeon instead
of Continue; Leave is available at every report. Never reroll rewards/captures
on reopening a report. Failed save must not show success or duplicate payouts.

## Implementation handoff and acceptance gates

1. Approve or revise these stats/lineups/schedules; define party progression
   sufficient to test the target difficulty, dungeon rewards and capture rules.
2. Add dungeon mode configuration and enemy skill definitions to the shared
   resolver; keep Adventure scaling/solo-entry/save behavior unchanged.
3. Add separate captured-unit instances, persistence and team validation only
   after their rules are approved. Hostile skills must never leak onto fodder.
4. Implement telegraphs, stage reports, final completion and explicit save errors.
5. Test exactly 50 sequential stages, all ten IDs, distinct repeated spawn IDs,
   stage-relative levels, growth/modifier ordering, rank boundaries 10/11 etc.,
   scheduled actions replacing normal attacks, burn/weakening expiry, shield/heal
   refresh/caps, dead units, final clear, quit/reload and reward/capture retry safety.
6. Playtest full runs with each approved team at normal and reduced motion;
   collect damage/turn/defeat curves before claiming the proposal is balanced.

Art is organized and standardized independently of runtime combat registration.
Dungeon background art has not been supplied; do not silently label the grassy
Adventure field as Flaming Depths.
