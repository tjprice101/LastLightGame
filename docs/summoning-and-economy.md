# Summoning and economy

**Status:** local balances, dungeon drops, owned-character upgrades and
unowned-only summoning implemented. Purchases and monetization remain unapproved.

## Implemented companion summon

- One summon costs **10 Lycalis**, confirmed before spending.
- The pool is the existing three playable character definitions, excluding every
  owned ID. With two remaining companions each has 50% odds; with one, 100%.
- Each draw validates current ownership/balance and a random value in `[0,1)`.
  Deduction and new Lv.0/Evo.1/weapon-rank-0 ownership commit in one wallet write.
  Rejected draws or failed storage writes leave the persistent wallet unchanged.
- No duplicates, multi-draw, rarity weighting, pity, automatic equipping or payments.
  An empty pool or insufficient funds disables the button with an explanation.
- The saved reveal confirms acquisition; use Squad to equip the companion.
  Reloading does not repeat the draw. The local UI reveal itself is not a saved
  pending animation or retryable network request.
- **Economy limitation:** First Fracture still grants only 10 Lycalis once per
  account. This funds one additional companion, not both. No second earning
  source, free grant or purchase was added without owner approval.

See [owned roster and squad](units-and-progression.md#implemented-roster-and-squad-behavior)
and [transaction tests](../src/game/squad.test.ts).

## Confirmed currencies

- **Fractalis:** main currency.
- **Lycalis:** premium currency.

Fractalis starts at **0** and every defeated Adventure enemy grants a uniformly
selected integer **5-10** at Lv.1, increasing to **15-30** at Lv.120, including burn kills. The balance is shown in the menu
and persists under `last-light.wallet` version3 with Lycalis, materials and
character progress. Existing version1 balances migrate without losing currency.
Dungeon defeats grant the same level-scaled Fractalis plus the
[material drop table](gameplay-and-elements.md#material-identities-and-drop-rules).
Lycalis starts at zero and pays for the implemented companion summon.
The wallet validates nonnegative safe integers; unreadable/corrupt values are
reported without overwriting them. Storage failures reject the battle action,
so retries cannot duplicate an already-committed kill reward. Reloading/restarting
creates a fresh battle, not a re-claim of previous dead enemies.
The local prototype has no cross-tab transaction locking or authoritative online
account state; play in one tab. Clearing site data removes the balance.
Premium does not by itself approve real-money purchases.

The confirmed Tier 1 -> Tier 2 **Fracture** grants **+10 Lycalis** and preserves
the character's level. It is now an active once-per-account earning mechanism:
transition, preserved level, costs and reward persist atomically with the first
Fracture flag. Later Fractures award no Lycalis in this pass.
See [progression costs](units-and-progression.md#first-pass-philosophy-and-editable-costs)
and [exact save schema](technical-architecture.md#persistence-contract).

## Future banner contract

An approved banner specification must define:

- Stable ID, version, availability, eligible pool, and cost.
- Whether draws are weighted directly by unit or by rarity then unit.
- Exact rates, featured rules, exclusions, and rounding/display rules.
- Single/multiple draw behavior and any guarantees.
- Duplicate results and inventory-capacity behavior.
- Pity, if supported: threshold, trigger, counter scope, reset, and carryover.

Do not advertise pity or guarantees that do not exist. Publish the actual
effective probabilities, including guaranteed slots and changing pity states.

## Proposed probability invariants

- Every outcome references valid content and has a valid nonnegative weight.
- Each selectable pool has positive total weight.
- Probability tables normalize to the specified total using a documented
  numeric representation and tolerance; never silently repair invalid tables.
- Outcomes outside the banner's pool are impossible.
- Multi-draw guarantee logic and pity ordering are specified before coding.

Use deterministic seeded randomness in tests. A monetized online system should
resolve draws on an authoritative server using an appropriate random source;
do not trust a client-supplied result or seed.

## Currency and reward model

Proposed: represent balances as bounded nonnegative integers in defined smallest
units. Define acquisition sources, spending sinks, and caps for each currency.
Earned and purchased currency are not interchangeable unless explicitly approved.
Currency names/roles, zero-start Fractalis, level-scaled enemy drops and 10-Lycalis single summons are approved above.
Starter level/evolution prices and dungeon drop tables now use first-pass tuning
defaults. Other sinks, paid prices and regeneration remain unapproved.

## Transaction requirements

Summons, upgrades, reward claims, and purchases must commit as all-or-nothing
operations. Each operation validates cost and eligibility against current state.

For future retryable network operations, use a unique operation ID and persist the result with
the mutation. Repeating the same ID returns the original result without charging
or rewarding again; reusing it with different parameters must be rejected.
This applies to both local persistence and any eventual authoritative service.

An interrupted operation must recover to either the previous state or the fully
committed result, never a spent balance with missing rewards.

## Player-facing safeguards

Show cost and rules before confirming. Clearly distinguish test currency from
real payments. Payment, age-related, regional, store-policy, and disclosure
requirements require review for the chosen markets before any commercial launch.
This document is not a legal-compliance determination.

## Validation cases

- Invalid pools and malformed rates fail with explicit errors.
- Boundary selections produce the exact expected outcome for controlled random inputs.
- Insufficient funds leave both balances and inventory unchanged.
- Each guarantee and pity threshold has exact before/at/after tests.
- Duplicate requests, reloads, and interruption recovery cannot double-charge or grant.
- Displayed odds/costs match the active version used to resolve the draw.
- Statistical checks supplement, but never replace, deterministic rule tests.

See the [banner authoring checklist](content-guide.md#adding-a-banner).
