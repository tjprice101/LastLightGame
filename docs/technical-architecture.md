# Technical architecture

**Status:** browser opening implemented; broader gameplay boundaries below remain proposed.

## Selected prototype stack

The owner delegated the choice: TypeScript + Phaser 3 + Vite for a cinematic
2D browser prototype, with Vitest tests and GitHub Pages distribution.
TypeScript adds strict content/state contracts; Phaser provides WebGL rendering,
scenes, tweens, sprites, and particle tooling for future attacks.
HTML menus preserve native keyboard/touch/accessibility behavior.

This is not a promise of unlimited animation throughput. GPU fill rate, texture
sizes, particle counts, and simultaneous effects must be profiled on target devices.
Use bounded effects, reusable textures, and pooled combat objects when needed.
Keep game resolution independent of display resolution.
If the owner later requires cinematic 3D or native console deployment, revisit
the engine before production; Phaser is a 2D browser engine, not a 3D engine.

## Current source map

See [opening-flow implementation references](opening-flow.md#where-to-customize).
The opening state machine and persistence are independent of Phaser/DOM rendering.
Starter identity, motion preferences, and hotkeys are persisted in separate keys.
Battle animation speed uses its own `last-light.battle-speed` key (raw `1`, `2`,
or `3`, default1 when absent); it does not alter the existing motion save format.
`presentation/battle-speed.ts` publishes the validated rate through root
data/CSS metadata and a live event. BattleView tracks playback-rate updates and
removes its speed listener on disposal. Speed never enters the pure battle
engine or reward transaction; playback still awaits the same animation
completion boundaries.
[Adventure](free-battle.md) now has a pure combat engine and an independent
event/animation renderer. Battle state is in-memory; reward events are saved
before resolved combat is applied. All ten material dungeons reuse this engine.
Runtime PNGs are static public assets imported through base-aware paths.
There is no backend or authoritative economy.
Character stats and skill/passive potency resolve from saved level/form through
`resolveFighter` without integer stat rounding. Home, Character, Adventure and
material dungeons share this resolver; combat snapshots the fractional kit on
entry. `formatStat` is display-only (up to two decimals), including battle logs,
HUD and reports. Save version2 stores progress, not rounded derived stats;
existing accounts automatically receive corrected growth without migration.
Core growthG=(1+.03*level)^3*1.45^(evolution-1) is separate from bounded
percentage potencyP=1+.003*level+.05*(evolution-1). Shared stat-growth.ts owns
accelerating enemy endpoints; all activities use it.
Creature catalog identities distinguish authored evolution forms. Walletv2
`creatures` is a map from catalogID to `{defeated:boolean}`: presence means seen.
Missing fields default{} in memory without rewriting old saves. Unknown IDs and
malformed flags fail explicitly. Encounter entry persists seen before enabling
combat; reward transactions promote defeat alongside currency/material receipts.
Next waves/stages also persist discoveries before presentation. Glossary displays
live per-stage loot gates; ten-way infusion element selection divides rarity odds
by10 for each specific material. Capture systems remain separate and unavailable.
Battle presentation snapshots pre-action HP/shields and consumes ordered events
at impact; final combat state remains authoritative and rewards commit first.
Damage events include optional `shieldRemaining` for exact shield readouts.
Presentation-only health-bar easing never delays combat state or changes damage,
reward deduplication, stage unlocks or saved progression.
Activity transitions live outside #app so scene rendering cannot discard the
black curtain. A single shared promise serializes entry, gates background input
with inert and waits for destination image decoding (12-second timeout with
explicit errors). BattleSession has transient entrancePending, never saved:
BattleView waits for curtain completion, slides units from viewport-based edges,
then renders ready controls. New waves/stages/replays reset that flag; completed
entrances survive settings view reconstruction. Disposal cancels entrance WAAPI
animations through the same tracked animation set used by attacks.
Battle attack flair is presentation-only and resolves from live combatant
level/evolution. Scheduled enemy strikes emit enhancedAttack for richer effects.
Bounded rings/rays/sparks plus directed trails are removed in finally; particle
CSS starts at impact, WAAPI remains tracked/disposable. Reduced motion bypasses
attack effects without changing resolved mechanics or reward timing.
Retired attack/end-turn hotkeys are ignored on legacy reads; only selection keys
remain in Settings. Gesture input and optional modal Battle menu buttons share
the same command validation/commit path. Space is not a global turn shortcut.
Responsive mirrored staggered formations change only DOM layout, never targeting,
combat order, loot anchors or entrance gating.
BattleSession.stageEvents retains current-encounter events for every activity,
including Adventure, independently of the40-event log. A successful kill reward
commit precedes event accumulation; result aggregation groups materialIDs and
deduplicates kill sources without RNG or storage writes. Next encounter resets
totals. Victory/defeat sheets render after finite death/loot presentation, focus
their heading, and can collapse without losing totals. Dismissal is transient
session state preserved across Settings reconstruction, not a saved run.
Quit uses the existing activity transition with an explicit callback to Gameplay.
Normal turn cues use tracked WAAPI and are removed on completion/disposal.
Enemy combatants carry typed enemySkills and boss identity. Shared enemy-skills.ts
derives1/2-skill kits from actual level, selecting one due skill per enemy turn
without RNG; ultimate/secondary priority on collisions. Attack events carry the
resolved skill action, enhancedAttack and abilityName. Ally events also include
abilityName. Attack cut-ins use live art/identity and run before windup/impact
through tracked WAAPI, with finally/disposal cleanup and reduced-motion bypass.
Enemy skill damage is resolved once via the existing damage/Defense/shield path;
boss ultimates are genuine heavy attacks, not cosmetic labels.

An offline prototype can validate gameplay, but its locally editable balances and
draws cannot be treated as authoritative for purchases or competitive features.

## Proposed logical boundaries

| Boundary | Responsibility |
| --- | --- |
| Content | Load and validate authored definitions and versions |
| Combat | State transitions, formulas, effects, ordered battle events |
| Roster/progression | Owned instances, squads, progression operations |
| Economy | Balances, summon rules, rewards, transaction consistency |
| Persistence | Save versions, atomic writes, migrations, recovery |
| Presentation | Screens, input, animation, audio, accessibility |
| Platform/services | Optional authentication, cloud saves, payments, telemetry |

Names are conceptual, not planned source directories. Prefer a small modular
implementation over premature microservices.

## Dependency direction

Presentation calls gameplay operations and renders results. Gameplay depends on
validated content and explicit state, not screen objects or animation timing.
Platform integrations sit behind narrow boundaries so a prototype can omit them.
Inject controllable time/randomness into tests rather than relying on globals.

## Persistence contract

Starter identity remains unchanged in `last-light.profile` version1.
Economy/progression share **`last-light.wallet` version3**:

```json
{
  "version": 3,
  "fractalis": 0,
  "lycalis": 0,
  "materials": {},
  "characters": { "ember": { "level": 0, "evolution": 1 } },
  "squad": ["ember"],
  "firstFracture": false,
  "dungeonStages": {},
  "infusionStages": {},
  "receipts": [],
  "creatures": {}
}
```

- Materials use the60 registered element/rarity IDs plus six specialty IDs with nonnegative safe-integer
  counts. Characters use stable IDs and `{level,evolution,weaponRank?}`; presence
  establishes ownership. On load, the profile starter gets a default Lv.0/Evo.1
  record only if absent. Existing records/progress survive unchanged.
  Optional legacy `squad` normalizes to the profile starter on read; new squad
  writes require one to three distinct owned IDs, leader first.
- Dungeon and infusion stage values are highest unlocked stage, 1-35;
  absent means Stage1. Captured-creature instances remain unimplemented.
- Version2 elemental unlocks migrate as `1 + round((min(oldStage,45)-1)*34/44)`;
  infusion unlocks as `1 + round((oldStage-1)*34/24)`, without writes on read.
  Missing infusionStages in
  existingv2 saves defaults to an empty map in memory. Weapon rank defaults0,
  validates0-10 and survives level/evolution/reward transactions.
- Version1 `{version:1,fractalis:N}` migrates in memory without changing its
  balance; the next successful transaction writes version3 to the same key.
  No items, Lycalis or levels are retroactively granted.
- [Account validation](../src/game/account.ts) rejects unknown materials,
  invalid progression/stages, malformed receipts and unsafe counts. Corrupt data
  is reported and retained; no automatic reset or success-shaped empty fallback.
- Every upgrade re-reads storage, verifies owned character and expected progress,
  checks cap/costs, and saves resources/progress/first-Fracture reward with one
  `setItem`. A failed write leaves all persistent values unchanged.
- Summons re-read the wallet, exclude owned IDs, validate funds/random range,
  and save ownership plus Lycalis deduction in one write. Squad saving validates
  ordered ownership and commits in one write. No changes to the profile starter.
- Battle sessions clone per-character progress and build all equipped allies.
  Continue/replay use the frozen run team, never the current menu selection.
- Reward receipts combine a per-run UUID and enemy spawn ID. Successful kills
  save Fractalis, materials, receipt and stage unlock together before applying
  combat. Retrying a receipt cannot grant it again; replay uses a new UUID.
- Local storage is synchronous but has **no cross-tab lock**. Play in one tab;
  this is not a production-authoritative transaction service.
- [Tests](../src/game/account.test.ts) cover migration, corruption, all six
  forms, exact totals, ownership, stale progress, failed writes and reward retry.
  Definitions/kit data are resolved from content rather than saved in full.

Six-form expansion accepts existing version2 saves without rewriting on read.
Evo.1-5 retain identical costs/stats; Evo.5 is no longer final. Evo.6 caps at 105.
Art is resolved from starter/form by [character-art](../src/content/character-art.ts);
save IDs and account schema remain unchanged.
The later D-050 specialty expansion adds optional fields to existingv2 saves;
late-form recipes now require mode materials. Existing progress is not reset.

## Online production requirements, if approved

Server authority for account balances, purchases, draws, rewards, and ownership;
authenticated operations; replay protection; concurrency control; audited
transactions; deployment and rollback procedures; privacy/retention rules.
These are requirements to design, not claims of existing services.
Keep credentials out of source and client assets.

## Implementation documentation to add as systems grow

- Exact source map, public APIs, state types, and schemas.
- Setup/build/test commands with supported tool versions.
- Save format examples and migration tests.
- Service contracts and environment-variable names, never secret values.
- Performance targets and measurements on the approved target devices.

See [development workflow](development-guide.md) and [decisions](decisions.md).
