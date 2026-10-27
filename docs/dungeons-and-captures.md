# Dungeons and captured enemies

## Material reward rebalance and15-stage infusion (D-425)

Elemental Dungeons remain35 stages/Lv.38-120. Every unlocked material rarity
still drops at100%; only quantities change. Apply the retained fraction
`0.9 - 0.6*(stage-1)/34` to each previous range endpoint, including the final
boss's5x base quantity, then round each endpoint and enforce minimum1.
Stage1 gives Seed7-9/Bloom2-3. Stage35 gives Seed38-45/Bloom24-30/
Shard18-23/Crest12-15/Heart8-9/Soul3-5, inclusive integer draws.
The rounding means tiny stacks cannot represent an exact percentage reduction.
Unlocks, encounter levels/stats and all other activities' materials are unchanged.

Soar to Heaven and Delve into the Abyss now have15 stages. Normalize the same
original35-stage level anchors onto15 stages: `position=1+(stage-1)*34/14`;
enemy levels remain50-120, with bosses5/10/15 and all six authored forms.
Both used specialties drop at100% from Stage1: Crown/Chalice in Soar and
Heart/Hourglass in Delve. Their inclusive ranges are
`round(1+10*(stage-1)/14)` through `round(2+21*(stage-1)/14)`:
Stage1=1-2, Stage14=10-22, Stage15=11-23 each.
There is **no extra final-boss material multiplier**. Weapon specialties no
longer drop; existing holdings, stable IDs, sale paths and old weapon bonuses remain.

Prismatica, Null-Prismatica odds/amounts by actual level,50% captures,
EX+ entry/chest tables and other activities are unchanged. Final infusion
Prismatica remains75-150; premium0/5/10/15 retains75/10/10/5% chances.
Walletv10 maps older unlocked stages proportionally, rounding up, once:
v2/v7-v9 use25->15; v3-v6 chain35->25->15. Genuine final-boss receipts
preserve EX+ access; merely unlocking the last stage does not grant a clear.
Existing25-stage copies retain exact source stages/skills/levels/UUIDs/locks/
equipment via validated `infusionLayout:25`; metadata-free historical copies
retain their previous first-stage defaults. Prior35-stage copies retain the
established D-346 normalization before this preservation. Reads never write;
the first successful transaction savesv10, and failures preserve raw holdings.
Old online Soar/Delve runs end safely with all persisted rewards retained;
unrelated runs preserve their frozen historical captured-copy provenance.

The [requested drop-rate export](../Drop%20Rates%20-%20Elemental%20Dungeons,%20Soar%20and%20Delve.txt)
lists the current per-stage quantities. This section supersedes earlier
Soar/Delve stage counts, weapon-drop rules and material multipliers below.

## Rose captures at every level (D-410)

All35 Rose stages, including the Lv.140 final boss, use the existing separate
50% capture chance. Every dropped Roselius joins at Lv.60, retaining its
actual defeated form, source stage and skills. This removes the D-408 source
Lv.120 ceiling; no banner/chest provenance is needed for ordinary late captures.
Other activities' eligibility and the playable60 cap remain unchanged.
Per-kill rewards/copies save atomically and receipts still prevent double grants.

## Guaranteed Calamity Roselius (D-409)

Soar/Delve/Roses Calamity chests award1/2/3 Omnic Roselius at tiers1/2/3,
each a distinct unlocked Lv.60 copy with form6's Stage29 kit. Explicit
`calamity-chest` acquisition allows only this form/stage and exact level;
it does not expand ordinary capture eligibility or reuse banner provenance.
The copies work in existing Team, Archive, equipment, fodder and sale paths,
with their usual locks/squad/equipment protections.
[Atomic opening and retry contract](calamity-mode.md#activity-specific-chest-guarantees-d-409).

## Capture audit and visible eligibility (D-408)

Runtime stage/seed and persistence checks confirm the existing separate50%
capture chance for Heaven, Abyss, Crownfall Treasury, Rosethorn Sanctuary and
Passion of Crimson Roses. Duplicate copies are allowed. D-410 now permits all
Rose source levels, superseding the former120 ceiling. Captured copies
still cap at60 while retaining source form/stage/skills.

Training, Story, elemental dungeons, Machines, Elemental War and Calamity do
not drop playable enemy copies. No capture regression or probability change
was found; exact-form capture rows now appear in eligible enemy loot tables.
The same helper publishes stage previews and gates the existing capture
transaction, without new RNG draws or load/save changes.

**D-425 supersedes D-373's three-material rule:** Soar and Delve award only
their two used specialties, with no elemental-material bonuses or weapon drops.
Previously owned materials and elemental dungeon drops are preserved.
Crimson Roses uses the dungeon guaranteed level/quantity brackets for all
six Rosethorn tiers. Reward generation, validation and discovery tables agree.

**D-305:** all owned captured Elemental-Devourers cap at60. Higher-level
captures join at60, retaining form/stage/skills; existing copies normalize
read-only and persist on the next successful save. Enemy levels, capture
chances/eligibility, rewards and Element-Bearer levels are unchanged.
[Compatibility and active-run rules](character-instances.md#level-60-ceiling-d-305).

**D-294/D-425 final-boss loot:** dungeon35 includes5x base material quantities
before its70% reduction; Heaven/Abyss15 uses11-23 specialties without another
material boost. Both retain Prismatica75-150. Heaven/Abyss premium outcomes
become0/5/10/15 at the unchanged75/10/10/5% chances. Capture chance50%,
one-copy count and captured level/form/kit are unchanged. Earlier bosses use
ordinary stage payouts. [Shared contract](free-battle.md#repeatable-final-boss-loot-d-294).

**D-192:** activity locks use highest-owned Element-Bearer level, not squad leader
or captures. Heaven/Abyss entry starts at50 with cap-aligned floors; new hostile
stats do not increase playable capture stats. Existing explicit capture levels,
kits and UUIDs survive; metadata-free Heaven/Abyss copies keep legacy inferred
levels. [Access](story-and-training.md#story-first-progression-and-activity-access-d-192)
and [balance](combat.md#enemy-progression-rebalance-d-192) supersede old tuning below.

**Status:** Phase6 implemented: Heaven/Abyss capture rewards, retained playable
kits, independent leveling/Conduits and mixed squads. All six elemental material
dungeons also have combat, rewards, stage unlocks and clear reports.
See [Gameplay and elements](gameplay-and-elements.md) for encounter/drop tables
and [Character instances](character-instances.md) for persistence/protection.

## Mode boundary

- [Adventure](free-battle.md), formerly Free Battle, is the endless field mode.
  Every entry starts at wave 1; defeats grant persistent Prismatica.
- Dungeons are separate activities outside Adventure. **Flaming Depths** has supplied
  enemies and an encounter draft; the scope now includes one material dungeon per
  each of six elements in [the Gameplay framework](gameplay-and-elements.md).
  All are35 stages; levels start38 and reach120 at Stage35. All ten original
  enemy families remain available through merged canonical dungeons (D-160).
- Dungeons contain enemy waves with higher enemy levels than Adventure.
  The exact comparison (corresponding wave or another baseline), level offset,
  stat table, wave count, encounter composition, and completion conditions need
  production balancing beyond the current editable first pass. The historical **Stage50** design:
  [the complete stage proposal](flaming-depths-stages.md) supplies all lineups,
  encounters, abilities and milestone ideas. Its old levels/stats are superseded
  by the new elemental framework; balance numbers remain proposals.
  Do not treat the ten art concepts as an approved ten-wave dungeon. First-pass
  runtime content instead uses two ordinary enemies/one fifth-stage boss and
  periodic stronger strikes; the historical draft is not the active stat table.
- After every dungeon wave, show an **end-of-wave action report** before advancing.
- **Soar to Heaven and Delve into the Abyss:** every newly defeated ordinary enemy
  or boss automatically rolls exactly50% capture chance (D-377). Defend/burn/AOE kills
  use the same award path; dead enemies cannot roll again.
- Adventure and the six elemental material dungeons do **not** grant captures.
  Crownfall Treasury and Rosethorn Sanctuary grant the same50% captures.
  [Passion of Crimson Roses](crimson-roses.md) also grants50% captures, but only
  for enemies at levels120 or below. Its35 stages run80-140; captures remain
  capped60. Omnic Roselius come from the special banner's Lv.60 duplicate
  conversion, not above-cap mission captures.
- Every activity accepts1-3 distinct owned instances, including all-captured
  squads and captured leaders. Two copies of the same species are allowed.

## Captured-enemy contract

Captured creatures retain their defeated form and hostile skill kit. Only
characters are Element-Bearers; enemies and captured units remain creatures:

| Surface | Actual character | Captured enemy |
| --- | --- | --- |
| Actions | Normal, Ability 1, Ability 2, Last Flare, Defense | Normal, Defense, and the skills/ultimate actually present on the defeated enemy |
| Progression | Character level, Fracture, existing saved upgrade bonuses | Independent levels up to60 and eight ordinary Conduit slots |
| Evolution | Confirmed character Fracture rules | Never evolves or Fractures |
| Combat role | Authored elemental kit | Manually controlled retained kit; no invented passive bonus |
| Ownership today | Saved starter IDs/progress | Separate stable capture UUIDs, level/stage/skills, locks and equipment |

This supersedes the historical Normal-only/weaker-support contract. Captures
never acquire starter-specific upgrades or evolve into another form.
No Heavy action, invented skill, permanent death or automatic deletion.

### Fixed-form growth and ratings

- Start at the defeated enemy's level capped at60. Keep its ability names, multipliers
  and saved intervals unchanged when leveling. Under D-300, Skill1/Skill2 have
  no manual cooldown; only retained Last Flare uses its enemy interval.
- Use D-288's separate **linear playable**, never hostile/boss, stat curve:
  base220 HP/38 Attack/16 Defense, factor `1+.15*level`, Defense exponent.7.
  HP/Attack/Defense multiply by `.65 + .35 * tier / 5` for fixed tier0-5.
  Thus a Lv60 initial form has1,430 HP, final form2,200, versus35,000 hostile bossHP at120.
  Higher captured forms remain stronger at equal level; boss captures retain
  boss abilities but not boss stat bonuses.
- Conduit buffs apply afterward, using the same shared stat helper as starters.
- Each level costs `10 + 2 * nextLevel` Prismatica and
  `ceil(nextLevel / 30)` Common materials matching the creature's combat element.
  D-303 adds one of each higher rarity cumulatively at destination31 Uncommon,
  46 Rare; the60 cap prevents higher leveling tiers. Roselius use equivalent Rosethorn
  materials, not only Seeds. Captures have no Element-Bearer specialty surcharge.
  Single and Max Level use the [same shared recipe](units-and-progression.md#cumulative-leveling-rarities-d-303).
- Fixed form1-6 sets acquisition stars1-6 and rarity Common through Omnic.
  Leveling changes neither rating. This approved later-form capture exception
  supersedes reserving every4-6-star unit exclusively for special banners.
- Skills cost the shared25/40/100 Elemental Gauge; Normal/Defense and hit gains
  remain shared. Retained attacks target one enemy. Missing slots explicitly
  say Unavailable. Boss ultimate cooldowns coexist with normal next-turn recovery.

### Atomic rewards

Capture RNG uses a separate seeded stream, preserving combat/material randomness.
Phase8 adds another independent Null-Prismatica stream: the same eligible ordinary/boss
kills roll mutually exclusive0/1/2/3 outcomes, linearly from90/8/1.5/0.5% at80
to75/10/10/5% at120. Premium currency joins the same atomic write and appears
only from enemyLv80; new early infusion floors grant none,
in loot/results; no clear bonus or Adventure/elemental-dungeon Null-Prismatica.
See [economy and active banner](summoning-and-economy.md).
Treasury instead grants currency-only high Prismatica payouts and50% captures,
no Null-Prismatica/materials.25-floor completion is mode-specific.
The capture, ordinary rewards, discovery and `runId:enemyId` receipt commit in one
wallet write **before** animation/state advance. Failed writes visibly reject
the action; retries neither lose currency nor duplicate an already saved copy.
Captures persist per kill even if the player quits or later loses the run.

## End-of-wave report

Implemented: stage-clear report with attacks, damage dealt/received,
healing/shields, surviving HP and saved reward events; next-stage control requires
manual advance. Full-stage events are retained separately from the bounded recent
battle log. Captured creatures appear alongside item rewards with the defeated
enemy's supplied portrait. Reports summarize already saved rewards, never award
them again.
Expanded future report fields:

- Dungeon name, wave number, enemy levels, and clear outcome.
- Actions taken, damage dealt/received, healing/shields, and surviving team HP.
- Defeated enemies, currency/item rewards if approved, and capture outcomes.
- Continue and Leave controls, with final-wave completion handled separately.

Keep a complete per-wave ledger separate from the presentation's bounded recent
battle log; otherwise a long wave loses early actions. Snapshot the report before
the next wave resets its ledger. Continue remains manual.

## Decisions needed before implementation

- Production dungeon balance, more complex waves and expanded hostile abilities.
- Alternate reward pools and pity. Elemental dungeon captures are not in scope.
- Phase7 [creature infusion](evolution-fodder.md) is implemented:1/2/3 form3+/4+/5+
  copies from the matching mode alongside existing costs; protected-safe
  explicit selection and one atomic write.
- Phase9 [Crownfall Treasury](crownfall-treasury.md) and Standard activation are
  implemented, including protected-safe sale and Lv50 duplicate reward.
- Phase10 [Rosethorn Sanctuary](rosethorn-sanctuary.md) is implemented:
  Null-Prismatica farming, six divine wisp forms and protected-safe dual-currency sales.
  Copy-ready art prompts exist; actual images remain pending.
- D-233: Heaven/Abyss copies also sell, for a chosen Null-Prismatica or mode-item
  payout (1-6 by form). Player-facing text calls captures Elemental-Devourers.

Do not invent pending decisions from visual power order.

## Implementation and validation requirements

- Add explicit mode configuration to the shared resolver rather than duplicating
  damage, turns, status effects, and reward handling.
- Use distinct owned instance IDs and unit kinds, separate from enemy spawn IDs
  and starter profile IDs. Validate ownership/eligibility at every team entry point.
- Roll captures exactly once for each eligible newly defeated enemy, including
  burn/multi-target kills, using deterministic randomness independent of combat.
- Commit rewards/captures atomically before displaying a successful outcome.
  Storage failure must visibly reject the operation without consuming the action,
  duplicating a capture, or losing currency.
- Keep current version-1 profile/wallet saves readable; do not overwrite corrupt
  collections. Define a retry/migration path before enabling new storage.
- `src/game/captures.test.ts` covers exact50% boundaries, all eligible stages/modes, burn/AOE duplicate
  rewards, failed-write retry/dedup, unchanged loot RNG, invalid rewards/skills,
  fixed-form growth, retained damage/ultimate cooldown/recovery, all destinations,
  captured-only Continue, independent leveling/equipment and captured Home/art.
  Existing instance tests cover uncapped storage, locks and legacy compatibility.

## Art handoff

[Flaming Depths](../Art/creatures/Flaming%20Depths.md) provides ten distinct enemies in ascending
visual power, using the existing chibi/eyes-only/white-canvas style.
All ten supplied originals are now preserved under `Art/source/enemies`, with
standardized transparent exports under `public/assets/enemies`.
They are used in Flaming Depths encounters, but do not establish capture odds.
Source and export contracts remain in [Art workflow](art-workflow.md).
Heaven/Abyss captures reuse the **same** registered enemy portrait/form and
existing [gamemode prompts](../Art/creatures/gamemodes/README.md), including loot/cut-ins.
No duplicate "owned version" art or new style is needed. Higher forms keep the
shared renderer while becoming more epic/majestic, as documented in the prompt
guide; clean cutout sources stay separate from runtime glow.
