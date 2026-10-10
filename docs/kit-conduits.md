# Kit-focused Conduits (D-160/D-162)

## Current approved Omnic replacement (D-176)

Owner explicitly chooses replacing these same25 items, not adding25 more.
All become Omnic with new distinct elemental interaction mechanics and fully
reborn art matching the original Machines Omnic presence. Implementation is
complete; historical D-162 rules below remain a record, not the new contract.

Confirmed compatibility/acquisition choices:

- Preserve every stable item/art ID, owned count and account upgrade progress.
- Converted25 move to the existing stage75+ Omnic pool with unchanged1% total.
  Remove their prior Common Store/Rare/Legendary acquisition entries. Banner
  original-five Legendary bonuses remain unchanged. Catalog85 becomes
  **10 Common /15 Rare /15 Legendary /45 Omnic**.
- All25 require matching combat element and count toward four Omnic per fighter.
  Existing equipment normalization retains valid slots in original order and
  unequips only converted items that mismatch element or exceed the total cap;
  never delete ownership/upgrades or silently grandfather invalid equipment.
  Loads remain read-only; first ordinary successful transaction persists migration.
  Current saves must remain strictly validated after migration, not perpetual
  silent repair. Failed/overflow/denied transactions preserve raw saved bytes.
- New rules must differ from the other60 Conduits and each other, use actual
  effects/source provenance, bounded triggers/once gates and independent state.
  No new RNG/rewards/income, resurrection, recovery bypass or free-action loops.
  Kit rules do not scale with account stat upgrades. Character/captured
  capability boundaries and run Settings/Continue snapshots remain.
- Prompts use individually distinct full reborn central devices, monumental
  platinum/ivory armor, six immense elemental fans, coronas/crowns/ribbons and
  dense rear facets with clear readable cores, matching the written Machines
  Omnic renderer/epicness. Keep palette locks, no image references, no glow,
  full outer margins and offline-only future intake. All25 images still pending.

Walletv5 is the durable conversion marker. v1-v4 read without writes, normalize
only incompatible/excess converted slots, preserve final slots/order and all
ownership/upgrades/progress. First successful ordinary transaction writes v5.
Invalid v5 gear is rejected, never repeatedly repaired. This is a compatibility
migration, not a new reward or retroactive charge.

### Implemented replacement rules

All listed stat triples are60%/50%/40%, respectively. A=Attack, H=Health,
D=Defense, E=Elemental Damage, C=Critical Damage multiplier. Every rule has an
independent once-per-round gate, with actual effective triggers and no generated
effect feedback. Banked reserves survive retained snapshots and reset on new
encounters. Cooldown reductions never ready a skill before the next round.

| Stable ID | New Omnic name | Stats | New interaction |
| --- | --- | --- | --- |
| tempered-strike-link | Phoenix Temper Dominion | A/D/H | Own effective Burn banks Temper max3; effective Normal spends for2 Gauge each |
| mending-valve | Worldroot Sap Cathedral | H/E/D | Authored effective healing banks Sap max3; Defense spends for3 Gauge each to most injured ally |
| ward-stitch-spool | Leviathan Ward Loom | D/H/E | Own authored shield absorption refreshes self shield for25% absorbed, capped3% caster HP |
| cinder-metering-nozzle | Eternal Cinder Observatory | E/A/D | Effective Burn application banks one relay; later skill against own Burn extends it one phase, cap3 |
| pulse-trigger-pawl | Sky Sovereign Escapement | A/C/D | Effective critical banks one reserve; Defense shortens longest available own ordinary cooldown by1 |
| firstlight-cam | Firstlight Concordance | A/H/D | Actual authored support to another banks one reserve; effective Normal shortens injured other ally's longest ordinary cooldown by1 |
| secondbeat-rack | Secondbeat Rupture Throne | A/E/D | Actual authored Weaken banks one reserve; later Normal against own Weaken places one personal Fracture after impact, cap2 |
| flare-focusing-iris | Ember Coronation Iris | E/H/A | Actual Infernic Embers spending shields most injured ally4% caster HP each, cap12% |
| clearwater-manifold | Abyssal Clearwater Parliament | H/D/E | Own authored shield absorption grants lowest-Gauge other ally4 Gauge |
| aegis-return-spring | Aegis Covenant Crown | D/H/E | Actual authored shield increase banks one reserve; Defense gives injured other ally8% attack buff through next round |
| emberlife-kiln | Phoenix Lifeforge | H/E/A | Own Burn HP damage heals injured other ally25% damage, cap2% caster HP |
| tension-governor | Fractured Mercy Governor | D/E/H | HP damage against own Weaken shields injured other ally10% damage, cap3% caster HP |
| covercharge-drum | Worldgrove Covercharge Heart | D/H/E | Actual authored healing of another refreshes self shield4% caster HP |
| sootwake-crucible | Sootwake Phoenix Mirror | A/H/D | Normal HP damage against own Burn refreshes self shield10% damage, cap4% caster HP |
| tidebound-reflector | Leviathan Mercy Reflector | H/D/A | Actual authored shield increase refreshes injured ally shield5% caster HP |
| pressurecrest-governor | Tempest Shelter Sovereign | C/A/H | Critical direct HP damage shields injured other ally10% damage, cap3% caster HP |
| rootbound-triage-vault | Worldroot Triage Sanctuary | H/D/E | Actual authored healing of a recipient initially at/below half HP shortens their longest ordinary cooldown by1 |
| solace-anchor | Solace Witness Monolith | D/H/A | Actual authored support to another banks one Witness; Defense gives injured other ally5 Gauge |
| ruinselect-prism | Ruinselect Fracture Parliament | E/A/H | Effective Normal consuming own Fractures gives lowest-Gauge other ally2 Gauge each, cap4 |
| infernic-pyre-census | Pyre Census Requiem | A/E/H | Own Burn killing tick shortens both available ordinary cooldowns by1 |
| oceanic-shared-tide-pump | Shared Tide Lifesea Engine | H/D/E | Own authored shield absorption on another heals that recipient30% absorbed, cap3% caster HP |
| atmospheric-storm-clock | Tempest Return Chronarch | A/C/D | Actual Atmospheric Charge spending returns2 Gauge each, cap6 |
| botanic-graft-covenant | Worldroot Graft Coronation | H/E/D | Actual Botanic Renewal spending shields injured ally3% caster HP each, cap9% |
| tranquilitic-accord-bastion | Accord Seraph Sanctuary | D/H/E | Effective authored support to another grants refresh-only10% next direct-hit protection, no Burn reduction |
| chaotic-fault-verdict | Rosefault Precision Sovereign | E/A/H | Actual Thorn Aegis/Rose Duality spending heals self2% max HP each, cap6%, without native healing triggers |

These replace old kit effects, not stack with them. Generated shields replace
only by a larger offer and clear authored provenance when replacing; generated
healing/support cannot earn native/gear authored-resource loops. Recipient choice
is deterministic, living-only; unavailable skills, full Gauge/HP and weaker
shield offers yield no effective payout. No new RNG, kill rewards or load writes.

Art reproduction: `python tools\build_kit_conduit_art.py`.
Validate `python -m unittest discover -s tools -p test_kit_conduit_art.py`,
`npm test -- --maxWorkers=2`, and `npm run build`.

## Historical D-162 contract (superseded by D-176)

## Elemental family integration boundary (D-173)

The owner approves [shared broad-to-precise effects](character-kit-rework.md#current-consolidation-contract-d-173)
for future Omnic design: Burn/Ward/Bloom/Tempest/Focus/Suppression, plus precise
Rose signatures. Family membership is not a new buff/debuff or universal proc:
inspect the actual precise effect, source, origin and clock. Existing conditionals
against Burning/Weakened enemies retain their exact predicates.

This consolidation does not remove/reprice owned Conduits or merge equipment
charges with native resources. Preserve all authored acquisition/slots/stat/kit
rules below. No new Omnic designs, rewards, restrictions or effects implemented
in this phase. Non-elemental equipment feedback remains accurate live text
without requiring a unique generated status icon.

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
