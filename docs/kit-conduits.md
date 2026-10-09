# Kit-focused Conduits (D-160/D-162)

**Owner clarification (D-163):** the requested dynamic character kits mean
intrinsic abilities/passives, not these equipment modifiers. This catalog is
retained as a separate Conduit feature, without removing ownership. It does
not complete the [full-roster character redesign](character-kit-rework.md).

## Scope and implemented status

Owner approves25 further kit/skill-focused Conduits after the six-element
migration:5 Common,8 Rare,6 Legendary and6 Omnic, one Omnic per canonical
element. All25 are implemented, bringing the catalog to85:
15 Common /23 Rare /21 Legendary /26 Omnic. They are distinct from the earlier
[35 additions](conduit-expansion-plan.md).

Individual identities, numerical coefficients, caps and Common prices below
are developer tuning within that approval, not owner-authored balance numbers.
No new currencies, retroactive grants, kit replacements, missing ability slots,
enemy statuses or save schema are introduced. No Story/UI-overhaul completion
is implied by this phase.

## Acquisition, equipment and upgrades

- Five new Common entries are Store-only, through the existing confirmed
  atomic purchase path; not a new machine Common tier.
- Machine tier totals remain Rare8%, Legendary3.5%, Omnic1% at stage75+.
  Successful tiers choose equally among23/21/26 names respectively; bosses
  use identical odds. Multiple independent tiers may succeed together.
- Only the original five Legendary names remain banner-bonus eligible.
  None of these25 entries joins either banner bonus pool.
- Owning one copy unlocks its name for all characters. Eight ordinary slots,
  no duplicate names and maximum four Omnic remain. Only Omnic requires a
  matching combat element. Other entries have an artistic element theme,
  not an equipment restriction or new elemental multiplier.
- Existing five account-wide upgrades scale only stat buffs/penalties to3.5x.
  Kit percentages, Gauge/proc quantities, trigger rules and caps never upgrade.
  Existing BMC costs/multipliers remain. No copy consumption or free equipping.
- Shared catalog registration makes entries available in Store, Inventory,
  Archives, Character/captured equipment, upgrades, loot/results and atomic
  reward validation. Walletv4 stays unchanged; missing optional ownership means
  no copies, not automatic acquisition.
- Every run snapshots equipment and account upgrades. Menu changes never alter
  an active run. Pending Graft charge and Storm Clock round guard survive cloned
  actions/Settings, but reset at every new encounter/Continue/replay.

## Common / bronze (Store-only)

| Name / ID | Theme | Prismatica | Stat buff | Fixed kit rule |
| --- | --- | --- | --- | --- |
| Tempered Strike Link / `tempered-strike-link` | Infernic |1500 | ATK+3% | Normal Attack outgoing damage+5% |
| Mending Valve / `mending-valve` | Botanic |1400 | HP+3% | Authored active/passive healing+5% |
| Ward Stitch Spool / `ward-stitch-spool` | Oceanic |1400 | DEF+3% | Authored skill shields+5% |
| Cinder Metering Nozzle / `cinder-metering-nozzle` | Infernic |1600 | ED+3% | Authored Burn tick damage+5% |
| Pulse Trigger Pawl / `pulse-trigger-pawl` | Atmospheric |1800 | Gauge capacity+3 | Legal Normal Attack gains1 extra Gauge |

## Rare / silver (machine tier)

| Name / ID | Theme | Stat buffs | Fixed kit rule |
| --- | --- | --- | --- |
| Firstlight Cam / `firstlight-cam` | Tranquilitic | ATK+15%, HP+12% | Damaging Skill1 outgoing damage+8% |
| Secondbeat Rack / `secondbeat-rack` | Chaotic | ATK+15%, DEF+12% | Damaging Skill2 outgoing damage+8% |
| Flare Focusing Iris / `flare-focusing-iris` | Infernic | ED+15%, HP+12% | Damaging Last Flare outgoing damage+8% |
| Clearwater Manifold / `clearwater-manifold` | Oceanic | HP+15%, DEF+12% | Authored healing+8%; actual healing during an activation grants caster2 Gauge once |
| Aegis Return Spring / `aegis-return-spring` | Tranquilitic | DEF+15%, Gauge capacity+15 | Actual shield increase during an activation grants caster2 Gauge once |
| Emberlife Kiln / `emberlife-kiln` | Infernic | ED+15%, ATK+12% | Authored Burn tick damage+10% |
| Tension Governor / `tension-governor` | Chaotic | DEF+15%, ED+12% | Authored Weaken+3 percentage points, maximum60% reduction |
| Covercharge Drum / `covercharge-drum` | Botanic | HP+15%, DEF+12% | Legal Defense grants caster3 Gauge; action still consumed |

## Legendary / platinum-white (machine tier only)

| Name / ID | Theme | Stat buff / penalty | Fixed kit rule |
| --- | --- | --- | --- |
| Sootwake Crucible / `sootwake-crucible` | Infernic | ATK+85%, DEF-10% | Damaging skills+18% outgoing damage against already-Burning targets |
| Tidebound Reflector / `tidebound-reflector` | Oceanic | HP+85%, ATK-10% | Damaging skills+18% outgoing damage while caster has a positive shield |
| Pressurecrest Governor / `pressurecrest-governor` | Atmospheric | CD multiplier+85%, HP-10% | Critical direct hits multiply their critical damage multiplier by1.12 |
| Rootbound Triage Vault / `rootbound-triage-vault` | Botanic | HP+85%, ED-10% | Authored healing+25% when caster is at/below half HP when that team-healing operation begins |
| Solace Anchor / `solace-anchor` | Tranquilitic | DEF+85%, ATK-10% | Defense adds5 percentage points direct-hit reduction; separate wards still multiply |
| Ruinselect Prism / `ruinselect-prism` | Chaotic | ED+85%, DEF-10% | Damaging skills+18% outgoing damage against already-Weakened targets |

## Omnic / elemental masterpieces

| Name / ID | Required element | Stat buffs | Fixed kit rules |
| --- | --- | --- | --- |
| Pyre Census / `infernic-pyre-census` | Infernic | ATK+60%, ED+50%, HP+40% | Burn ticks+20%; Last Flare+6% outgoing damage per living Burning enemy at activation start, capped18% |
| Shared Tide Pump / `oceanic-shared-tide-pump` | Oceanic | HP+60%, DEF+50%, ED+40% | Authored skill shields+15%; each living recipient whose shield actually increases gains3 Gauge once per activation |
| Storm Clock / `atmospheric-storm-clock` | Atmospheric | ATK+60%, CD multiplier+50%, DEF+40% | Critical direct hits multiply critical damage multiplier by1.10; a critically hitting ordinary skill shortens its own cooldown1 turn, once per round, never newly ready before next round |
| Graft Covenant / `botanic-graft-covenant` | Botanic | HP+60%, ED+50%, DEF+40% | Authored healing+15%; actual activation healing of another ally primes15% outgoing damage for next damaging ordinary skill, one refresh-only charge |
| Accord Bastion / `tranquilitic-accord-bastion` | Tranquilitic | DEF+60%, HP+50%, ED+40% | Authored skill shields+10%; Defense grants each living ally a refresh-only shield of3% caster effective max HP |
| Fault Verdict / `chaotic-fault-verdict` | Chaotic | ED+60%, ATK+50%, HP+40% | Authored Weaken+5pp capped60%; ordinary skill hitting already-Weakened enemy grants3 Gauge once; Last Flare ignores15% Defense without mutating stats |

## Timing, stacking and no-op boundaries

- Outgoing rules apply before the existing final combat rounding, independently
  per target. Burning/Weakened predicates inspect status before the current hit
  applies its new status. AoE does not give unaffected targets the conditional
  bonus. Pyre Census instead snapshots its living Burning count once before AoE.
- Distinct new kit damage bonuses add, capped at75%, then multiply the existing
  combat multiplier. Healing/shield/Burn bonuses likewise add and cap at75%.
  Critical-multiplier bonuses add and cap at75%; noncritical hits are unchanged.
  Other existing Conduit/pilot modifiers retain their prior timing and formula.
- Bonuses enhance an authored capability only. No heal/shield/Burn/Weaken
  field means no invented capability. Gauge and proc grants clamp to capacity.
  Missing captured skills remain unavailable. Weaken keeps its existing two
  enemy-attack clock; Burn keeps its two-phase/source snapshot, including
  zero-base behavior. A boost does not add elemental affinity damage.
- Healing clamps to missing HP and never revives. Low-HP healing eligibility
  snapshots once before the team loop, not separately after healing the caster.
  Active and passive healing share this helper. Full-HP/no actual healing means
  no restoration Gauge or Graft charge. Passive healing can be stronger but does
  not prime an activation-only Graft charge or grant activation Gauge.
- Authored skill/pilot shields retain fractional potency and refresh to the
  stronger value, never add. Self Conduit wards and Accord's generated3% ward
  are not skill-potency-scaled. Existing shields with no increase grant no Gauge.
  Recipients are deduplicated; dead allies are skipped.
- All healing/shield Gauge procs inspect actual positive events from the caster,
  once per activation, after base effects and existing Conduits. Grants do not
  recursively trigger procs. Defense also counts as an activation for its
  generated shield; it still spends the action.
- Graft consumes before the damaging ordinary skill resolves; Normal Attack,
  support skills, Defense and Last Flare do not consume it. The same activation
  may prime a fresh charge only through later actual healing of another ally.
  Canceled/rejected actions consume nothing. One charge never stacks.
- Storm Clock requires a critical direct enemy hit from Skill1/2, never Burn,
  Normal Attack or Last Flare. It shortens only, never lengthens a zero/one-turn
  cooldown; once-per-round guard prevents repeated legal activations being
  exploited. Ordinary action spending, Gauge costs and Last Flare recovery stay.
- Solace only adds to direct Defense reduction (combined Defense cap50%).
  Periodic Defense reduction remains the base rule. Existing shield absorption,
  Shelter and Faultkeeper remain in their prior order.
- All new kit rules are deterministic and consume no RNG. Existing combat,
  capture, reward, encounter, component and recruitment streams remain separate.

## Presentation and artwork

Character Overview/individual ability panels and the Battle menu show equipped
kit rules separately from authored base ability descriptions. Equipment and
upgrade descriptions preserve fixed kit text after stat scaling. Pending Graft
charge is visible in the detailed allied reference, not the compact field.
Enhanced Burn/Weaken snapshots use the existing actual-damage/actual-potency
badges beside enemy HP; no new status names/icons are required.

[25 copy-ready icon prompts](../Art/conduits/Kit%20Conduits.md) are generated
from unique runtime identities and six individually regulated palettes.
Use the same reference-free compact anime/cel renderer, bronze/silver/platinum
rarity materials, extravagant Omnic architecture, non-emissive opaque powers,
solid green key through openings and generous complete-ensemble margins.
No originals or installed art changed. All25 use honest neutral artwork-pending
presentation until supplied PNGs are reviewed; no unrelated icons/missing URLs.

## Validation and extension points

- `src/content/kit-conduits.ts`:25 identities, stats, fixed rules and art designs.
- `src/content/conduit-kit.ts`: typed modifier contract.
- `src/game/kit-conduits.ts`: shared deterministic rule/proc resolution.
- `src/game/battle.ts`: actual hit/heal/shield/status/action timing integration.
- `src/game/kit-conduits.test.ts`: exact counts/odds/boundaries, active/passive
  potency, no-op/caps, nonstacking procs, per-target AoE, recovery/cooldowns,
  gear snapshots, captured kits, atomic purchases/upgrades/rewards and retry.
- `src/game/machines.test.ts` and presentation suites cover expanded acquisition/
  pending art/Store/Archives alongside every existing mechanic.

Run `npm test -- src/game/kit-conduits.test.ts src/game/machines.test.ts src/game/conduits.test.ts src/game/conduit-upgrades.test.ts src/presentation/conduit-store.test.ts src/presentation/archives.test.ts src/presentation/machine-art.test.ts src/presentation/unit-readout.test.ts --maxWorkers=2`,
then `npm test -- --maxWorkers=2` and `npm run build`.
Regenerate with `python tools\build_kit_conduit_art.py`; validate with
`python -m unittest discover -s tools -p test_kit_conduit_art.py` plus the existing
Conduit/shared art-policy suites. Browser checks must use a disposable account,
not modify the owner's save.
