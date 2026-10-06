# Character instances and protection

## Phase5 foundation

Owner approved separating the ownership/protection foundation from playable
captured kits and mixed squads, which now ship together in Phase6.
Phase6 adds actual captures/playable kits; Phase7 adds protected-safe evolution
fodder. Phase9 adds Treasury captures, banner creature awards and Treasury sales.
Phase10 adds Sanctuary wisps and protected-safe dual-currency sales.

- Captured duplicates are separate records, never merged or counted as a single
  playable copy. Each has a stable `capture:<UUID>` instance ID, a registered
  `creatureId` definition and its own manual lock.
- Storage is uncapped for this local prototype.
- New captured copies start **unlocked**. Character's protection section has
  per-copy Lock/Unlock controls. Existing starter characters also support locks.
- Current squad members are automatically protected regardless of manual lock.
  Manual locks do not prevent playing or equipping characters.
- Mixed squads may contain duplicate species if their instance IDs differ;
  a single instance cannot occupy multiple slots. Maximum remains three.

## Persistence and compatibility

Walletv3 adds optional `capturedCharacters` and `characterLocks` fields.
Legacy starter IDs remain stable instance identifiers in existing character
progress/squad/equipment records. No destructive rekeying or profile rewrite is
needed. Old accounts load without writes and without fabricated captures/locks.
Existing balances, receipts, discoveries, ranks, squads and equipment persist.

`src/game/character-instances.ts` validates identities and creates a new copy
array via `appendCapturedCharacter`. This is a pure composition helper for
Phase6's atomic reward write, not a separate capture-award transaction.
Registered Heaven/Abyss/Treasury/Sanctuary creatures are eligible. Adventure and elemental
dungeons remain ineligible.

`src/game/account.ts` owns:

- `ownedCharacterInstances`: starter instance IDs plus all captured instance IDs.
- `characterProtection`: authoritative manual-lock and current-squad protection.
- `setCharacterLock`: rereads the account and atomically persists one lock change.
- `summonCharacter`: creates first-authored-stage creature copies or a final
  Treasury Omnic copy at Lv50 for a duplicate EB, with cost and pity in one write.
- `creatureSaleOffer`/`sellCurrencyCreature`: exact-copy sale prices by form,
  rejecting manual/squad/Conduit protection and saving currency/removal together.
  Sanctuary grants both currencies; Treasury grants only Fractalis. The
  Treasury-only wrappers remain available for compatibility.

`src/presentation/roster.ts` displays captured-copy management from Character:
portrait, physical stars/rarity badge, level/stats, retained abilities, per-copy
Level/Lock controls, eight Conduit selectors and a Squad link. A copy does not
appear in the starter evolution/upgrade tabs. All-copy/mixed squads and leaders
use the same instance identities through Home, battle and replay/Continue.

## Phase6 metadata and snapshots

Each new saved capture includes `level`, `capturedStage` and `skills` alongside
the Phase5 identity/lock fields. Stage must belong to its registered form;
skills must structurally match the defeated stage's authored hostile kit.
Level may increase from that initial enemy level through120, never decrease.
Exception: only final Treasury banner duplicates have
`acquisition: "banner-duplicate"` with initial Lv50 and Stage22 retained kit.
Validator permits this source/form below the stage's hostile level, but never
below50; ordinary captures and ordinary banner awards retain the usual minimum.
Partial/invalid metadata explicitly rejects the save; no silent reset.

Legacy Phase5 records without all three metadata fields resolve in memory to
the first authored stage of their fixed form. Identity/locks are unchanged.
Loading does not write or grant any copy; leveling writes complete metadata.
This compatibility rule is not the level assigned to new real captures.

`saveAccountRewards` atomically saves captures/materials/Fractalis/discovery and
receipts. `levelCapturedCharacter` rereads ownership, checks expected level/funds,
and atomically updates only that copy. Squad and Conduit ownership validation
include capture IDs. Captures never evolve; skills do not grow with levels.
See [capture rules](dungeons-and-captures.md) for exact stats/costs/actions.
All-mode battle factories freeze equipment/skills/progress per instance;
Continue/replay use those run snapshots, never menu edits.

## Phase7 consumption

Captured units remain **creatures**, not Element-Bearers. Explicit selected
copies supplement existing evolution costs from Evo3->4 onward:1/2/3 copies of
form3+/4+/5+ from the element's Heaven/Abyss mode. Locked, squad-assigned and
any-Conduit-equipped copies are protected. Authoritative account validation
rejects changed ownership/protection, duplicates and invalid selections; one
write commits evolution/costs/removal. Loading late-form saves never charges
retroactively. See [complete rules and tests](evolution-fodder.md).
