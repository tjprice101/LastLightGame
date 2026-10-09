# Intrinsic character kit rework (D-163)

## Owner direction and rollout

The owner clarifies that richer buffs, debuffs and stacks mean **reworking
Element-Bearers' own passives and abilities**, not special per-character
Conduits. The owner selects the full roster in phased batches, starting with
the three starters. Equipment is never a prerequisite for these mechanics.
The separate Conduit additions do not fulfill this request and are retained
without deleting owned copies or changing saves.

Keep one readable signature resource/loop per character, with a short setup,
clear payoff choice and bounded stacks. Preserve identities, authored skill
names, targeting, ordinary Gauge costs, cooldowns and Last Flare recovery.
Numerical coefficients are developer tuning, not owner-specified numbers.

| Batch | Status |
| --- | --- |
| Infernis / Tizu / Flora | Implemented; validation below |
| Remaining roster, including existing Aurora/Bliss pilots | Pending; full-roster scope approved, individual redesigns not yet implemented |

The owner subsequently asks to return to the remaining kits later and continue
the next major phase. This work is paused while the approved Story/Training
rollout proceeds; the implemented starter batch remains in place.

## Starter loops

All resources cap at3 and belong to the character, not their equipment.
Normal Attack and Defense preserve them. Ordinary action validation happens
before cloning/preparing effects, so rejected actions never spend resources.

### Infernis: ignite, bank, detonate

- Keep the low-health damage passive and Cinder Cleave's two-phase Burn.
- Effective damage from her own Burn grants one personal Ember Seal per enemy
  phase. Multiple Burning enemies cannot multiply that phase's resource gain;
  the source must be living.
- Flame Arc spends all seals for8% additive outgoing damage per seal,
  maximum24%, once for the whole AoE.
- Dawnfire instead spends all seals for12% additive outgoing damage per seal,
  maximum36%, once for the whole AoE. It now ignites surviving enemies for
  two phases using0.75 times effective Elemental Damage, with ordinary potency
  scaling and existing Burn rounding/source snapshots.
- Decision: spend early on ordinary AoE or bank for the stronger Last Flare
  payoff/recovery. No free Gauge, new turn or cooldown bypass.

### Tizu: protect, absorb, redirect

- Keep effective Defense and authored team shields. A surviving Tizu-authored
  shield still primes the existing refresh-only Shelter Charge: next direct
  enemy hit deals10% less damage, before absorption. Burn does not consume it.
- Direct enemy damage actually absorbed by her authored shields grants Tizu
  one Tide stack per enemy phase across all recipients. No absorption, no stack.
  The source must be living. Fully consumed shields still count; unrelated
  shield replacement cannot retain Tizu provenance. Periodic Burn grants none.
- Undertow Thrust spends all Tide stacks for5 percentage points extra Weaken
  per stack, maximum15pp. Combined authored/stack/gear Weaken caps at60%;
  retain the existing two-enemy-attack clock.
- Ocean Memory instead spends all Tide stacks to add5% caster effective max
  HP per stack, maximum15%, to its authored team shield. Compute the new offer
  before refresh; it never adds to existing shield totals. Existing gear shield
  potency applies to the combined authored shield offer.
- Decision: turn successful protection into stronger enemy suppression or
  bank it for a larger team shield.

### Flora: nurture, bloom, choose offense or recovery

- Keep passive team healing. Any effective authored Flora healing, including
  passive healing/self-healing, grants one Bloom per round across all recipients.
  Overhealing, another source's healing and dead sources grant none.
  Conduit self-heals are not Flora-authored healing.
- Briar Shot spends all Blooms for10% additive outgoing damage per Bloom,
  maximum30%, retaining its existing critical chance.
- Verdant Renewal retains team healing and grants living allies10% authored
  outgoing attack damage this and the next player turn. This uses ordinary
  bounded potency growth (maximum50%), refreshes instead of stacking, keeps a
  stronger already-active buff and cannot revive.
- Worldseed instead spends all Blooms for15% extra authored healing per Bloom,
  maximum45%, applied once to the entire team-healing operation. Retain
  fractional healing and actual missing-HP caps; no extra damage bonus.
- Spend before healing. Worldseed can earn one new Bloom if no Flora healing
  has already earned one that round, but never one per healed target or a
  second in the same round.
- Decision: spend nurturing on an offensive shot or save for emergency
  recovery; Renewal provides a team-support setup without extra skill slots.

## State, UI and compatibility

- Reuse the existing per-encounter typed kit-state helpers. Internal `pilot`
  naming is retained; these are playable intrinsic kits, not equipment pilots.
  Settings/action snapshots deep-clone them. New encounters and Continue reset
  stacks/phase guards. Staged battles rebuild kits/gear from run snapshots.
- Existing attack buffs use their shared player-round expiry; no second buff
  implementation. Burn/Weaken use their existing actual event snapshots and
  enemy HP-side badges. No extra RNG, reward, account migration or load writes.
- Field readouts show one short intrinsic resource counter, including0/3.
  Detailed Battle reference explains current spending choices. Character
  passive/skill panels show resolved strengths, caps and trigger descriptions;
  existing Battle menu shows active team attack buffs.
- Existing Conduit bonuses remain separate. Personal Ember Seals and Conduit
  Ember Seals have independent state/spenders. Flora's native damage bonus adds
  in the existing outgoing bucket; Graft's equipment factor still multiplies
  afterward. Existing captured kits are not replaced by starter kits.
- No new artwork or missing status-icon URLs; supplied ability art unchanged.

## Validation

- `src/game/starter-kits.test.ts`: no-equipment loops, exact AoE damage/heals,
  ownership, caps, once-per-phase/round gates, actual shield absorption,
  refresh/Weaken bounds, buff expiry, rejected actions and Continue reset.
- `src/game/kit-pilots.test.ts`: prior Aurora/Bliss/Shelter behavior and
  independent equipment/personal resources.
- `src/content/combat.test.ts`: base definitions, fractional growth and
  resolved descriptions.
- `src/game/kit-conduits.test.ts`: gear interaction, including native Bloom/
  Renewal plus Graft Covenant.
- `src/presentation/unit-readout.test.ts`: visible counters, detailed choices,
  defeated-resource hiding and compact field containment.

Run those files together using `npm test -- <paths> --maxWorkers=2`, then
`npm test -- --maxWorkers=2` and `npm run build`. Browser checks must use a
disposable account, never the owner's local storage.
