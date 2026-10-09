# Dungeons and captured enemies

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
  or boss automatically rolls exactly20% capture chance. Defend/burn/AOE kills
  use the same award path; dead enemies cannot roll again.
- Adventure and the six elemental material dungeons do **not** grant captures.
  Crownfall Treasury and Rosethorn Sanctuary grant the same20% captures.
  [Passion of Crimson Roses](crimson-roses.md) also grants20% captures, but only
  for enemies at levels120 or below. Its35 stages run80-140; captures remain
  capped120. Omnic Roselius come from the special banner's Lv.80 duplicate
  conversion, not above-cap mission captures.
- Every activity accepts1-3 distinct owned instances, including all-captured
  squads and captured leaders. Two copies of the same species are allowed.

## Captured-enemy contract

Captured creatures retain their defeated form and hostile skill kit. Only
characters are Element-Bearers; enemies and captured units remain creatures:

| Surface | Actual character | Captured enemy |
| --- | --- | --- |
| Actions | Normal, Ability 1, Ability 2, Last Flare, Defense | Normal, Defense, and the skills/ultimate actually present on the defeated enemy |
| Progression | Character level, Fracture, existing saved upgrade bonuses | Independent levels up to120 and eight ordinary Conduit slots |
| Evolution | Confirmed character Fracture rules | Never evolves or Fractures |
| Combat role | Authored elemental kit | Manually controlled retained kit; no invented passive bonus |
| Ownership today | Saved starter IDs/progress | Separate stable capture UUIDs, level/stage/skills, locks and equipment |

This supersedes the historical Normal-only/weaker-support contract. Captures
never acquire starter-specific upgrades or evolve into another form.
No Heavy action, invented skill, permanent death or automatic deletion.

### Fixed-form growth and ratings

- Start at the defeated enemy's actual level. Keep its ability names, multipliers
  and intervals unchanged when leveling; intervals become manual cooldowns.
- Use the shared **ordinary**, never boss, infusion stat curve at the current
  level. HP/Attack/Defense multiply by `.65 + .35 * tier / 5` for fixed tier0-5.
  Thus a Lv120 initial form has130k HP, final form200k, versus400k hostile bossHP.
  Higher captured forms remain stronger at equal level; boss captures retain
  boss abilities but not boss stat bonuses.
- Conduit buffs apply afterward, using the same shared stat helper as starters.
- Each level costs `10 + 2 * nextLevel` Prismatica and
  `ceil(nextLevel / 30)` Common materials matching the creature's combat element.
  These are editable first-pass numbers in `capturedLevelCost`.
  Roselius instead use Seed of Rosethorn; all older creature costs are unchanged.
- Fixed form1-6 sets acquisition stars1-6 and rarity Common through Omnic.
  Leveling changes neither rating. This approved later-form capture exception
  supersedes reserving every4-6-star unit exclusively for special banners.
- Skills cost the shared25/40/100 Shatter Gauge; Normal/Defense and hit gains
  remain shared. Retained attacks target one enemy. Missing slots explicitly
  say Unavailable. Boss ultimate cooldowns coexist with normal next-turn recovery.

### Atomic rewards

Capture RNG uses a separate seeded stream, preserving combat/material randomness.
Phase8 adds another independent Null-Prismatica stream: the same eligible ordinary/boss
kills roll mutually exclusive0/1/2/3 outcomes, linearly from90/8/1.5/0.5% at80
to75/10/10/5% at120. Premium currency joins the same atomic write and appears
in loot/results; no clear bonus or Adventure/elemental-dungeon Null-Prismatica.
See [economy and active banner](summoning-and-economy.md).
Treasury instead grants currency-only high Prismatica payouts and20% captures,
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
- `src/game/captures.test.ts` covers exact20% boundaries, burn/AOE duplicate
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
