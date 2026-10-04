# Dungeons and captured enemies

**Status:** confirmed direction, not implemented. The owner chose to implement
Adventure first and prepare documentation/art before making dungeons or captures
playable. No captured units, dungeon rewards, or team slots have been granted.

## Mode boundary

- [Adventure](free-battle.md), formerly Free Battle, is the endless solo field mode.
  Every entry starts at wave 1; defeats grant persistent Fractalis.
- Dungeons are separate activities outside Adventure. The first and only planned
  dungeon for now is **Flaming Depths**.
- Dungeons contain enemy waves with higher enemy levels than Adventure.
  The exact comparison (corresponding wave or another baseline), level offset,
  stat table, wave count, encounter composition, and completion conditions need
  approval. Do not treat the ten art concepts as an approved ten-wave dungeon.
- After every dungeon wave, show an **end-of-wave action report** before advancing.
- Defeated dungeon enemies have a chance to become captured and usable on the team.
  Adventure does not currently grant captures.

## Captured-enemy contract

Captured enemies are a separate ownership category from actual characters:

| Surface | Actual character | Captured enemy |
| --- | --- | --- |
| Actions | Light, Heavy, Ability 1, Ability 2, Last Flare | Normal and Heavy only |
| Progression | Character level, Fracture, weapon, passive and ability upgrades | Character level only |
| Evolution | Confirmed character Fracture rules | Never evolves or Fractures |
| Combat role | Primary companion / future character squad | Weaker, squishier expendable support |
| Ownership today | Saved starter only | Not implemented |

Captured enemies must not appear as evolved starters or receive character upgrade
controls, special skills, or Last Flares. "Normal" corresponds to the basic attack
concept; its multiplier and Heavy rules still need approval. Whether captures have
passives, Shatter Gauge, equipment, or any non-action traits remains open.
Enemy combat levels are not an approved captured-unit progression table.
Being fodder does not establish permanent death, automatic deletion, or sacrifice
mechanics; those require explicit approval.

## End-of-wave report

Confirmed: a report at each dungeon wave boundary. Proposed report fields:

- Dungeon name, wave number, enemy levels, and clear outcome.
- Actions taken, damage dealt/received, healing/shields, and surviving team HP.
- Defeated enemies, currency/item rewards if approved, and capture outcomes.
- Continue and Leave controls, with final-wave completion handled separately.

Keep a complete per-wave ledger separate from the presentation's bounded recent
battle log; otherwise a long wave loses early actions. Snapshot the report before
the next wave resets its ledger. Report field selection, captures-on-defeat timing,
and when the report is acknowledged remain open.

## Decisions needed before implementation

- Entry UI, entry cost (if any), finite/endless waves, completion/defeat/exit policy.
- Exact dungeon enemy levels/stats, enemy mixtures, and higher-level comparison.
- Dungeon Fractalis amounts and other rewards; Adventure's 5-10 is not implicit approval.
- Capture probability, eligible enemies/bosses, automatic roll versus player choice,
  capacity/full-collection behavior, duplicates, and whether a failed run keeps captures.
- Initial captured level, level cap, XP/material costs, HP/DEF/attack growth,
  relative stat reduction, and how an enemy becomes the weaker owned variant.
- Team size/slot limits, assignment UX, whether captured enemies can join Adventure
  (currently solo), defeat/revival rules, and character/captured-unit mixing.
- Capture persistence schema, instance IDs, collection separation, migration/recovery.

Do not invent these values from visual power order.

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
- Test every wave's report, long-wave ledger, final-wave completion, denied capture,
  duplicate/full-capacity behavior, failed-write retries, reload/exit, team validation,
  leveling-only restrictions, and all attempts to evolve/use skills on captures.

## Art handoff

[Flaming Depths](../Art/Flaming%20Depths.md) provides ten distinct enemies in ascending
visual power, using the existing chibi/eyes-only/white-canvas style. Names and stable
asset IDs there are art concepts, not loaded definitions or approved capture odds.
Source and export contracts remain in [Art workflow](art-workflow.md).
