# Evolution creature infusion (Phase7)

**D-192 progression correction:** highest-owned Element-Bearer Lv.50 opens
Heaven/Abyss. Form3 starts at stage13/Lv.65, form4 at19/Lv.75 and form5 at25/Lv.85.
Evolution/level specialties start at75, so the existing Lv.60/75/90 evolution
caps no longer require entry to a Lv.80+ starting mode. Counts, explicit copy
selection, protection and atomic costs below are unchanged. Rose characters
still use Roselius; develop another owned bearer to unlock their Lv.75 activity.
See [schedule](gameplay-and-elements.md#two-infusion-modes).

D-100's three [rose event EBs](crimson-roses.md) keep the same1/2/3-copy and
form3+/4+/5+ gates but require Roselius, regardless of their Tranquilitic/
Chaotic combat element. Character-aware requirement/cost helpers drive both
menus and transactions. Existing EBs retain their element's Heaven/Abyss mode.
Legendary Roselius are capturable at stages22/23 (Lv.117/119); higher-than120
enemies cannot be captured. Final-form banner duplicates can also qualify. (Phase7)

## Approved and implemented rules

Characters are **Element-Bearers**. Enemies and creatures remain **enemies** and
**creatures**, even when captured and playable. Captured creatures are not
renamed Element-Bearers or companions.

Captured creatures supplement existing material and Prismatica evolution costs:

| Evolution | Captured creatures consumed | Minimum captured form |
| --- | --- | --- |
| 1 -> 2 | 0 | None |
| 2 -> 3 | 0 | None |
| 3 -> 4 | 1 | Form3 |
| 4 -> 5 | 2 | Form4 |
| 5 -> 6 | 3 | Form5 |

Higher forms qualify; captured level and boss/ordinary origin do not change
eligibility. Eligible copies must come from the Element-Bearer's infusion mode:

- **Heaven:** Infernic, Oceanic, Atmospheric and Botanic.
- **Abyss:** Tranquilitic and Chaotic.

D-160 remaps legacy types consistently; former Voltaic characters now use
Heaven specialty materials/fodder. Existing upgrades are not charged again.

Use the element's existing `infusion` mapping, not the captured creature's combat
element. Dawnthorn remains Tranquilitic and Wraththorn remains Chaotic; that
typing does not restrict each creature to evolving only its own element.
All current starters use Heaven fodder. Future currency-farm creatures are not
eligible substitutes for Heaven/Abyss fodder.

## Explicit selection and protection

### Expanded evolution picker (D-309)

The organized Evolution screen gives captured-copy selection its own full-width
section below the stat/resource preview, rather than a64-96px list inside the
payment column. Responsive cards show96px desktop/72px mobile portraits, copy
identity, level/form/rating and complete eligibility/protection reasons.
Eligible copies appear first without changing their saved copy numbers;
unavailable copies remain visible and disabled.

Checkbox selection updates the exact selected/required count, eligible total
and progress meter. Selected cards gain the viewed bearer's accent and explicit
Selected text; excessive selection keeps Evolve disabled and explains why.
Missing eligible copies show the required form/activity and protection guidance.
No copy is auto-selected, and selection itself never consumes or writes data.
The existing permanent-consumption confirmation and atomic revalidation remain.

Lists grow naturally for small collections and retain a bounded tall scroll area
for large holdings. Cards stack on phones; names and protection reasons wrap.
Hover/focus/selection feedback is presentation-only, with transitions disabled
for either reduced-motion setting. This supersedes the compact list dimensions,
not eligibility, resource requirements or irreversible-consumption protections.

Validate `src/presentation/upgrade-reference.test.ts` and
`src/game/evolution-fodder.test.ts`, plus desktop/mobile layout and live selection.

Character / Fracture-Evolution shows each saved copy with portrait, form rating,
level and copy number. Nothing is auto-selected. Select exactly the required
number of distinct instance IDs; too few/many keeps Evolve disabled.
Protected/ineligible rows are disabled with reasons:

- Manually locked.
- In the current saved squad, even if manually unlocked.
- Any ordinary Conduit equipped: unequip **all** first.
- Wrong mode or form below the required minimum.

Conduits remain owned by the account and are never consumed. An empty saved
loadout does not protect a creature; its obsolete map entry is removed when that
copy is consumed. Other creature copies, gear and squad membership are untouched.

Confirmation lists each selected name/copy/level/form, existing resource costs
and a clear **permanent / cannot be undone** warning. Cancel changes nothing.
Unlocking or unequipping alone never consumes a creature.

## Atomic transaction and compatibility

`upgradeCharacter(..., expectedProgress, fodderIds)` rereads storage, checks
current progression, cap, owned copies, distinct count, mode/form, protections
and all funds/materials before writing. Evolution, retained level/weapon bonuses,
existing cost deductions and creature removals commit together in **one** wallet
write. Failed writes preserve the old save; retry can succeed once, and stale
progress/repeated consumption is rejected.

Leveling and early evolutions reject any supplied fodder IDs. Existing late-form
saves remain valid: loading never downgrades, charges or retroactively consumes.
Legacy metadata-free captured copies keep their fixed-form eligibility under
the existing Phase5/6 compatibility accessor; no migration write is required.
Existing First Fracture reward behavior is unchanged.

Creature Glossary encounter/defeat discovery and reward receipts survive
consumption. The Character Archive's captured-form portrait still requires a
currently owned copy: consuming the last copy returns that form to a silhouette.
Active battle teams keep their frozen run snapshots; menu changes affect future
entries, not an already initialized replay/Continue team.

## Extension points and validation

- `src/content/activities.ts`: `evolutionRequirement` owns count, minimum form
  and per-element infusion mapping.
- `src/game/account.ts`: `evolutionFodderOptions` shares eligibility/reasons
  between UI and authoritative transaction; `upgradeCharacter` commits changes.
- `src/presentation/hub.ts`: evolution resources and per-copy selector.
- `src/main.ts`: selection count, exact-copy confirmation and refreshed screens.
- `src/character-screen.css`: bounded responsive copy list.
- `src/game/evolution-fodder.test.ts`: thresholds/all six mappings, atomic costs,
  protected/stale/unknown/duplicate copies, failure/retry and selection markup.

Reuses existing Heaven/Abyss portrait and rating assets. No new art prompt or
invented image path is needed. Phase8 banner and Null-Prismatica odds remain separate.
