# Summoning and economy

**Status:** currency names/roles and +10 Lycalis first-Fracture reward confirmed;
rates, prices, premium balances, other earning,
spending, and monetization rules remain open.

## Confirmed currencies

- **Fractalis:** main currency.
- **Lycalis:** premium currency.

Fractalis starts at **0** and every defeated Adventure enemy grants a uniformly
selected integer **5-10**, including burn kills. The balance is shown in the menu
and persists separately under `last-light.wallet`:
`{"version":1,"fractalis":0}`. Lycalis balances and spending remain unimplemented.
The wallet validates nonnegative safe integers; unreadable/corrupt values are
reported without overwriting them. Storage failures reject the battle action,
so retries cannot duplicate an already-committed kill reward. Reloading/restarting
creates a fresh battle, not a re-claim of previous dead enemies.
The local prototype has no cross-tab transaction locking or authoritative online
account state; play in one tab. Clearing site data removes the balance.
Premium does not by itself approve real-money purchases.

The confirmed Tier 1 -> Tier 2 **Fracture** grants **+10 Lycalis** and resets
the character to level 0. This is a rule preview, not an active earning mechanism:
Fracture and currency transactions remain unimplemented. When enabled, the tier
transition, level reset, costs, stat changes, and reward must persist atomically,
with no duplicate reward on retry. See [progression](units-and-progression.md).

## Banner contract

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
Currency names/roles, zero-start Fractalis, and 5-10 enemy drops are approved above.
Prices, other drop tables, starting Lycalis, and regeneration rules are not approved.

## Transaction requirements

Summons, upgrades, reward claims, and purchases must commit as all-or-nothing
operations. Each operation validates cost and eligibility against current state.

For retryable operations, use a unique operation ID and persist the result with
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
