# Six-element, Story and desktop UI rework

**Art phase update (D-159):** owner explicitly approves the successful Rosetta
palette-control format across all character art. All16 lines now have tailored
subject locks, unwanted-color negatives and preserved portrait URLs at150;
character-specific icons/weapons remain reference-free. This completes the
character prompt text pass, not generated-image review or physical organization.
D-160 subsequently approves the six-element/save/Story/economy/UI baseline below.
[Policy/validation](art-workflow.md#character-palette-control-d-159-current-policy).

## Approved implementation baseline (D-160)

On2026-10-08 the owner explicitly selects **Approve this baseline and implement
in phases**. The choices below are now approved, superseding the earlier
unanswered-proposal status. Approval is not implementation: use the phase table
to identify what is actually complete.

| Phase | Status | Deliverable |
| --- | --- | --- |
| Art filing | Implemented |77 documents/records physically grouped; tool/link updates;1237 source/runtime/provenance files verified byte-identical |
| Character palette prompts | Implemented (D-159) | All16 lines; generated-image acceptance still pending |
| Six-element migration | Implemented | Six canonical types/36 materials; walletv4 migration, merged enemy families, recipes/equipment/Archives |
|25 additional kit Conduits | Implemented (D-162) |5 Common/8 Rare/6 Legendary/6 Omnic; fixed kit effects,85 total;25 icon prompts, imagery pending |
| Intrinsic character abilities | Starter batch implemented (D-163); remaining roster pending | Owner clarifies buffs/debuffs/stacks belong to abilities, not equipment; full-roster phased scope, three-stack starter loops without Conduits |
| Story/dungeon rebalance | Implemented (D-164) |35-floor dungeons Lv38-120; six25-stage Story regions Lv1-55, retained Training and atomic first-clear bosses; campaign art pending |
| Desktop menu overhaul | Contextual pass implemented (D-166) | Actual Back target, secondary-only Menu, Title only in Settings, retained menu DOM and page scrolling; existing animations/reduced motion |

Runtime uses the six-element systems,150-stage Story and retained endless Training.
The25 [kit-focused Conduits](kit-conduits.md) are live with unchanged machine
tier totals/banner eligibility. [Story rules/validation](story-and-training.md).
[Desktop contextual rules](menus-and-inventory.md#contextual-desktop-navigation-d-166)
are implemented; owner defers remaining intrinsic kit batches.

## Implemented elemental migration contract

- Canonical order: Infernic, Oceanic, Atmospheric, Botanic, Tranquilitic, Chaotic.
  Every character, creature, dungeon, material, recipe, Omnic Conduit eligibility,
  label and Archive filter uses these types. No affinity multipliers or kit rewrites.
-36 material IDs use the canonical element and existing rarity suffixes. Emblems
  and material sprites resolve the surviving existing asset filenames; save
  IDs for characters, Conduits, captured UUIDs and discoveries never change.
- Wallet schema4 accepts versions1/2/3 on read without writing. Legacy elemental
  balances sum per canonical rarity with safe-integer overflow rejection.
  Malformed IDs fail explicitly. Version4 rejects retired element keys.
  A successful normal transaction writes the normalized wallet once; storage
  failure leaves the entire previous wallet intact, so retry cannot double-merge.
- v2 dungeon progress first uses the existing50-to35-floor conversion. v2/v3
  progress then maps the highest completed enemy level to the new38-120 curve;
  merged unlocks use the maximum. Initial/final unlocked floors stay1/35.
  Already-v4 floors are never converted again. Infusion progress is unchanged
  except the existing v2 floor conversion.
- All82 original dungeon creature forms remain in the catalog under their
  original `dungeon:<legacy-element>:<tier>` discovery IDs. Related families
  are chosen uniformly per enemy, independently for ordinary pairs and bosses,
  at the corresponding original tier. Shared stats, material routing, stage
  counts and final endpoints remain canonical.
- A separate encounter RNG stream preserves combat/reward/capture streams and
  continues across dungeon stages, unaffected by combat rolls. No extra loot,
  captures, premium income or automatic grants are introduced.
- Heaven now uniformly chooses among four affinities; Abyss among two. Total
  rarity odds are unchanged, including glossary probabilities. Recipes/fodder
  follow these pools, while Rose characters retain their Roselius override.
- Original packs, sources and installed PNG bytes are preserved. Retired
  families no longer have their own dungeon entries. Their enemy art remains
  active in merged encounters; physical removal/archival of unused legacy
  emblem/material/scenery exports is a separate cleanup still pending.

### Validation

Use `npm test -- src/game/element-migration.test.ts --maxWorkers=2` for all legacy
balance mappings, overflow/corruption, read-only loading, atomic retry, protected
state, completed-level unlocks, stable discoveries, RNG and fodder routing.
Run `npm test -- --maxWorkers=2` and `npm run build` for all menu/battle/content
surfaces. In an isolated browser account inspect the six dungeon entries,
canonical labels/emblems/materials and retained family portraits. Never change
the owner's browser storage for validation.

## Confirmed request and approval history

Owner requests art organization, palette/framing improvements without losing
approved grand design/style,25 kit-focused Conduits, desktop-first lively and
consistent menu navigation, and a linear six-region Story map with25 stages
per region. Old merged-element enemy art must be retained and randomized among
related dungeon encounters, with roughly equivalent tier rewards.

**Confirmed D-158 follow-up:** preserve reference-based enemy rendering in a
small low-weight pilot, review generated outcomes before global application.
[Three copy-ready alternatives](../Art/experiments/Enemy%20Style%20Pilot.md).
Production enemy prompts remain reference-free pending outcome review.
Installed pixels and gameplay were unchanged by the pilot. Character prompt
controls are separately implemented under D-159.

The initial questionnaire remained unanswered while the owner refined reference
art. D-160 now approves the consolidated safe baseline below. Preserve its
non-destructive guarantees rather than reverting to permanent source deletion.

## Requested six-element mapping

| Surviving type | Existing types | Emblem |
| --- | --- | --- |
| Infernic | Infernic | Infernic |
| Oceanic | Aquatic | Aquatic |
| Atmospheric | Atmospheric, Voltaic | Atmospheric |
| Botanic | Efflorescent, Tectonic | Efflorescent |
| Tranquilitic | Tranquilitic, Luminous | Tranquilitic |
| Chaotic | Chaotic, Ominous | Chaotic |

This is feasible, but material IDs, infusion pools, enemy loot routing,
characters, captures, Omnic equipment restrictions, Archive filters, elemental
specialty/fodder recipes, account migration and all encounter/UI surfaces must
move together. Retaining old creatures is intentional, not a migration defect.
No new affinity multiplier is requested.

## Approved execution order

1. Art: index and physical prompt/provenance grouping complete, with
   coordinated path/reference updates and generator/intake tests. Preserve original
   bytes/hashes; never key supplied alpha or reprocess runtime images for filing.
2. Reference pilot: Kirin, Leviathan, Phoenix, authored pale/blue/crimson contrast.
   Then individually adjust character palette and complete-ensemble framing
   after reviewed results. No blanket flame/blue exclusion.
3. Six-element transaction/content migration with legacy fixtures and validation.
4.25 new kit/skill Conduits, bounded mechanic definitions and tests before art URLs.
5. Linear150-stage Story; approved dungeon entry-level rebalance ships with migration.
6. Desktop navigation/components/copy/animation migration and browser validation.

## Approved baseline rules

- Physical art groups: `characters`, `creatures`, `conduits`, `items`, `ui`,
  `guides` and `provenance`. Starter mixed pack stays with characters; complete
  activity/loot/scenery packs stay with creatures; Elemental War umbrella with
  UI/scenery. Source paths remain fixed, experiments separate.
- Retired sources archived rather than erased; obsolete active asset removal
  only after complete reference checks. Owner approves preservation/archival,
  superseding the earlier permanent-removal request for originals.
- Balance sums per merged material rarity; overflow rejects migration before
  write. Highest equivalent completed enemy level establishes merged unlocks.
  Preserve copies/gear/progress/receipts; no writes merely from loading.
-35 dungeon floors, Lv38 to120.38 is the approved midpoint for Evo2's30-45 range.
- Heaven affinities: Infernic/Oceanic/Botanic/Atmospheric; Abyss:
  Tranquilitic/Chaotic. Preserve total rarity odds and choose uniformly among
  each new pool; remap recipes/copy eligibility consistently. The four/two
  runtime pools are now implemented.
- Story region order follows the mapping table; global Lv1-55, four ordinary
  identities plus a distinct final boss per region. Common/Uncommon materials
  only, no Rare+ drops.
- Main Adventure entry becomes Story; retain existing endless play as Training.
- Boss reward: first-clear-only1,000 Prismatica/50 Null-Prismatica,
  growth1.15 by region, rounded whole units, atomic with receipt/unlock.
  Repeat kills retain ordinary currency/material rewards, not premium bonus.
  Replay must never repeat the regional premium bonus.
-25-Conduit split5 Common/8 Rare/6 Legendary/6 Omnic; one Omnic per
  new element. Store-only Common, unchanged machine tier totals and no new banner
  eligibility are approved acquisition constraints. Individual kits/balance are
  developer tuning within the approved richer-kit scope, not new income/grants.
- Desktop: consistent hub/navigation/contextual Back, Title only in Settings;
  preserve battle leave, exact critical data, errors and reduced motion.
  Prefer one page scroll; deliberate galleries may need their own bounded region.

## Acceptance

Art tests verify authored prompts/paths, not generated images. Visually review
full-resolution pilot results for style/palette/design/tip containment/key fill.
Every save migration needs legacy/new/corrupt/overflow/failed-write fixtures.
Random encounters must not perturb combat/reward RNG. Story bonus persistence
must survive replay/reload/failure without repeated premium claims. Character
and captured-copy stats/recipes/equipment must agree across all surfaces.
Desktop checks include keyboard/focus/reduced motion, real content density,
scroll ownership and save-before-animation. No automatic grants or deployment.
