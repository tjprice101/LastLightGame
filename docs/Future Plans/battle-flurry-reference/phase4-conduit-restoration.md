# Battle Flurry Phase 4b: Conduit restoration proposal (2026-11-19)

**Status (2026-11-19):**
- **Owner-approved in full (D-493, 2026-11-19):** number sheet, O1-O14 as
  recommended, batches B1-B5.
- **B1 and B2 implemented, unreleased** (B2 spec: [combat.md](../../combat.md#conduit-restoration-b2-legendary-d-493-battle-flurry-phase-4c); Heartcase keeps Health above the normal maximum until damage instead of clamping it)
- B1 (spec: [combat.md](../../combat.md#conduit-restoration-b1-common--rare-d-493-battle-flurry-phase-4c)).
- **B3a implemented, unreleased (2026-11-20):** 29 Omnic rows that need no new system (spec: [combat.md](../../combat.md#conduit-restoration-b3a-omnic-without-new-systems-d-493-battle-flurry-phase-4c)). B3b (next-action tokens: Dawn Witness, Paradox Spindle, Skythread, Stormstep, Thunderbird, Verdant Covenant, Phoenix Temper, Rosefault, Secondbeat, Sootwake, Tempest Return, Covercharge, Triage) and B3c (Atlas Bastion taunt, Phoenix Reactor revive, Accord) remain. G12 belongs to B4 (Throne of Borrowed Tomorrows).
- **Crits return (owner, 2026-11-20, D-493 note):** O1 and C9/C10 are replaced by real critical hits (old base values, enemy crits, Critical Up instead of Exposure). A planned crit step runs before B3b and converts the built O1 rows.
- **Crit step implemented, unreleased (2026-11-20):** real critical hits ([combat.md](../../combat.md#critical-hits-and-critical-up-d-493-crit-step-battle-flurry-phase-4c)). The 18 built O1 rows now carry their pre-Radiant crit stats and triggers verbatim; the "Restore as" cells below that mention "more direct damage" or "enemy with Exposure" for O1 rows are superseded by the pre-Radiant column. C9, C10 and M3 are retired. Remaining O1 rows (B3b, B4, B5) are built with real crits.
- **B3b implemented, unreleased (2026-11-20):** the 13 next-action rows with real crits, Undertide's Convergent Light discount, flare event `cost` ([combat.md](../../combat.md#conduit-restoration-b3b-next-action-bonuses-d-493-battle-flurry-phase-4c)). Owner answers: Shared Tide adapted for Tide (the most-wounded recipient of a skill Shield gains an extra 50% Shield); Tempest Return's bonus kept until used. The combat spec supersedes the "Restore as" cells of the 13 B3b rows and of Shared Tide below.
- **B3c implemented, unreleased (2026-11-20):** shared rescue ledger (C18), Phoenix Reactor revive, Accord, Atlas Bastion taunt ([combat.md](../../combat.md#conduit-restoration-b3c-rescue-limit-revive-accord-taunt-d-493-battle-flurry-phase-4c)). Owner answers: the taunt overrides Calamity boss targeting; the `master-sprout-3` revive waits for B5 (same ledger). All 45 Omnic rows are restored. The G11 pointer below is out of date: the Refusal hook is in `packet()` in `combat-engine.ts`.
- **B4 implemented, unreleased (2026-11-21):** the 14 Calamitic rows and G12, Throne of Borrowed Tomorrows' borrowed skill ([combat.md](../../combat.md#conduit-restoration-b4-calamitic-and-the-borrowed-skill-d-493-battle-flurry-phase-4c)). Owner answers: the turn waits while a holder can pay for its borrowed skill (End Turn gives it up); allies who used Convergent Light that turn are eligible. Cathedral uses real crits (+250 points, +120%). The G12 pointer below is out of date: the hooks are in `applyRadiantCombatAction` and `processRadiantGear`.
- **B5 split (owner, 2026-11-21, Plan mode):** B5a stat packages and plumbing; B5b 37 kit-modifier rows; B5c 39 player-turn trigger and next-action rows; B5d 19 enemy-phase and special rows (`master-sprout-3` revive, `master-myrthen-2` rolls). Row lists: [handoff](../../handoff.md).
- **B5a implemented, unreleased (2026-11-21):** 93 Master stat packages (Radiant-era pairs removed; `master-sprout-2`, `master-disciple-2`, `master-nerithe-3` keep theirs until their clause ships), squad Skill Power/Efficiency auras, Master revive plumbing ([combat.md](../../combat.md#conduit-restoration-b5a-master-stat-packages-d-493-battle-flurry-phase-4c)). The "Restore as" cells of Adapt (O1) Master rows that mention "more direct damage" are superseded by real crit stats and triggers from the pre-Radiant column.
- Next: B5b, B5c, B5d on `battle-flurry-phase3`; then one enemy retune on the final
  Conduit set and a single release with the matching server deploy (owner
  choice, D-493).

Plan: [battle-flurry-overhaul.md](../battle-flurry-overhaul.md) §E and the
Phase 4 round 1 note (D-492). Source of old effects:
[pre-radiant-conduits-d82015ba.md](pre-radiant-conduits-d82015ba.md) (cited as
"catalog §x"). Pattern: [phase3-kit-drafts.md](phase3-kit-drafts.md).

Owner direction (2026-11-19, recorded in D-492): "a lot of the conduits how
they were before the radiant rework could be brought back in their totality
because what they all did before was unique and still fits the current system
that we have now."

So the default for every Conduit is: **restore its pre-Radiant (Phase Zero)
effect in today's terms**, not a new design. A row departs from the old text
only where a removed rule forces it (class **Adapt**).

Unchanged for every row: stable IDs, ownership, ranks (+0..+5), upgrade costs,
Store price, element locks, Omnic max 4, Master slot, Master attunement, art.
Leaders (`leaderDesigns`) are out of scope. Moon/Sunshade banners and events
stay inactive ([moon-sunshade-events.md](../../moon-sunshade-events.md)).

## Shared rules (glossary, written once)

- **Luminosity:** each bearer's personal action resource (old "Elemental
  Gauge"). Capacity 100, 200 from form 4. Normal Attack hit +15, enemy hit
  taken +10 (D-473 N1).
- **Skill 1 / Skill 2 / Convergent Light:** cost 25 / 40 / 100 or 200
  Luminosity. Old "Last Flare" = Convergent Light.
- **Skills** (in restored text): Skill 1, Skill 2 and Convergent Light unless
  a slot is named (C13). **Damaging action** (old "Attack Action"): a damaging
  Normal Attack, skill or Convergent Light; all hits of one action count once.
- **Skill Power** (base 100%): scales skill and Convergent Light damage, Burn,
  heals, Shields and buff/debuff strength. Not Normal Attack, not
  Conduit-generated effects.
- **Skill Duration** (base 0): whole turns added to timed skill effects; total
  at most 6 turns.
- **Skill Efficiency** (base 0%): cuts skill and Convergent Light cost; discount
  capped at 50%; cost floors 1 (skills) and 70 (Convergent Light).
- **Gauge Gain** (base 100%): multiplies every Luminosity gain, rounded once.
- **Categories:** Attack Up, Defense Up, Damage Reduction, Luminosity Gain Up,
  Health Over Time on allies; Weaken, Expose, Burn on enemies. Same category does
  not stack (strongest applies, longer duration kept). Caps: Attack Up +100%,
  Defense Up +100%, Damage Reduction 75%, Luminosity Gain Up +100%, Weaken 50%,
  Expose +80%, Burn none.
- **Shields** last until broken; Shields from skills and Convergent Light stack.
- **Conduit-generated** strikes, heals, Shields and Luminosity use their stated
  values, are not scaled by Skill Power (existing Master-specific scaling
  stays) and cannot trigger other Conduits.
- **Turn** = player turn; **enemy phase** = old "Enemy Turn".

## Mapping rules: old terms to current

| # | Old term or rule | Current treatment |
|---|---|---|
| M1 | Elemental Gauge, "X% Elemental Gauge", "X% of capacity" | Luminosity; X% becomes X Luminosity (C7). |
| M2 | Elemental Gauge Capacity +X% | Extra Luminosity room above the Convergent Light cost (C8, O2). |
| M3 | (Retired by the crit step: real crits) Critical Rate, Critical Damage Multiplier, critical triggers | Radiant has no critical hits. Deterministic conversion (C9, C10, O1). |
| M4 | Direct Attack | Attack. |
| M5 | Separate "Direct Damage" bonus layer | Joins the existing additive damage layer in `cast()` (C11). |
| M6 | Defend / guard triggers | None in the Phase Zero texts. `guard-*` primitives exist only in Radiant-era designs and Leaders; restored designs drop them; Leaders keep the D-473 O1 interim (O3). |
| M7 | Old native resources named in Master texts (Seal, Strike/Shelter/Resolve, Beacon, Moonflower, Ceasefire, Harvest, taunt) | Mapped onto the Phase 3 signatures. Removed ones are Adapt rows (O8). |
| M8 | Last Flare Recovery (skip next turn) and Cooldown | Removed. Clauses that depended on them become "after this bearer uses Convergent Light" or are dropped (O10). |
| M9 | Squads above 3 | Squads are 1-3. Per-member Conduits keep per-member values; their maximum is lower. |
| M10 | Captured units, "only Element-Bearer" | No captures; "squad member" = Element-Bearer. |
| M11 | Phase Zero aggregation (all percent bonuses summed, base multiplied once; role perk in the same pool) | Current: gear and Master amounts summed per stat, ×(1 + sum); role trait multiplies separately (`resolveRadiantStarterStats`). Kept as is. |
| M12 | Bonus Strike | Conduit-generated strike (`packet(..., 'generated')`). |
| M13 | Heals based on max Health, damage or Defense | Kept on the old basis; replaces the N7 Recovery basis for restored effects (C16). |
| M14 | "Per Battle" | Per encounter. |

## Number sheet (approve with B1)

| # | Rule | Draft |
|---|---|---|
| C1 | Stat rescale | Always-on Health, Defense and Attack bonuses (static packages, squad auras that need only the wearer alive, composition conditions fixed for the encounter) ×0.2, rounded to 0.1%. Penalties too (Wardglass −35% to −7%). Why: Vigil Core live +20% = old +100% ×0.2; Hammerbalance live Attack +18% ≈ old +85% ×0.2; `radiant-trio-v1` was calibrated with live gear amounts. |
| C2 | Conditional Attack/Defense | Bonuses tied to a temporary state (Cover, Seed, Foundation, Burn present, Health threshold, stored resource) become Attack Up / Defense Up at the old value (cap +100%, no stacking with the same category). Conditional maximum Health keeps the old value. |
| C3 | Skill Power from gear | Skill Power = 1 + role trait + ascension (that slot) + Conduits + Master + conditional/token bonuses for that cast. Old values verbatim. No cap (old had none); fallback in O4. |
| C4 | Skill Efficiency from gear | Adds to ascension and tokens. Existing `radiantCostRules`: 50% cap, floors 1 and 70. Values verbatim; excess does nothing (old rule). |
| C5 | Skill Duration from gear | Whole turns added to timed effects the bearer's skills apply; total max 6. Never Shields, instant effects or signature resources. Verbatim. |
| C6 | Gauge Gain from gear | Gauge Gain = 1 + gear Gauge Gain + Luminosity Gain Up. Gear part verbatim, uncapped (old); category cap +100% unchanged. Rounded once per gain. |
| C7 | Luminosity grants | Old X% (of capacity) = X Luminosity (old base capacity 100), then Gauge Gain, rounded once, limited by capacity. Flat Moon grants unchanged. |
| C8 | Capacity | "+X% capacity" = capacity × (1 + X), rounded down; summed across gear, at most +100%. Convergent Light cost unchanged; never fills Luminosity. |
| C9 | (Retired by the crit step) Critical stat conversion | Critical Rate +R points = +0.5R% direct damage on Normal Attacks, skills and Convergent Light. Critical Damage Multiplier +M% = +0.25M%. Basis: old base multiplier 1.5× (a crit added 50%); old base rate 10-25% (M weight ≈ 0.15 × 1.5 ≈ 0.25). Next-action crit tokens use the same factors. |
| C10 | (Retired by the crit step) Critical triggers | "First critical X each turn" = first damaging X each turn. Ungated "critical X" = X that damages an enemy with Exposure. "Fails to crit" = against an enemy without Exposure. "Every third critical" = every third damaging action against an enemy with Exposure. "Enemy critical hits" = enemy hits above 20% of the holder's maximum Health. |
| C11 | Direct Damage bonuses | Old separate "Direct Damage" bonuses (Worldbreaker +65%, Causality +125%) and C9 bonuses add into the existing `(1 + flare + cooperation + bonus)` layer. |
| C12 | Rank scaling | ×(1 + 0.1·rank) only on beneficial values at the old scaling positions (catalog §1.2). Fixed: penalties, thresholds, chances, durations, turn counts, caps, per-encounter limits, flat Skill Duration. Exceptions: Stasis chance 10 + 2·rank %; Causality Efficiency 50 + 2·rank %; Nullsong +75% scales, −75% and 50% fixed. Masters have no ranks. |
| C13 | Slot triggers | "Skill 1" = slot 1; "Skill 2" = slot 2; "Skills" = Skill 1, Skill 2 and Convergent Light (old trait checks covered Last Flare, catalog §1.6). Traits from the kit definition: damaging, hits all enemies, heals or grants Shields, applies Weaken/Expose/Burn, support (heals, Shields or buffs allies). |
| C14 | Defense ignore and reduction | Defense ignore and enemy "less Defense" share one total cap of 80% (live pierce cap; old: 75% ignore, 50% reduction). Enemy "less Defense" applies to every ally's attacks on that enemy. Copies of a named aura do not stack. |
| C15 | Shield damage reduction | "Hits remove X% less Shield": combined cap 80% (old). |
| C16 | Generated effect basis | Restored Conduit heals, Shields and strikes use the old basis (% of recipient max Health, % of damage, % of this bearer's current Defense or Attack). |
| C17 | Tokens | One per named Conduit per recipient; refresh, not stack; last through the end of the next turn; spent by the next matching action. |
| C18 | Rescue | One Conduit rescue per ally per encounter, shared by Phoenix Reactor, Accord and `master-sprout-3`. Ozriel's Refusal stays a separate kit passive (O12). |

## Owner questions (each with a recommendation)

- **O1 Critical Rate.** Radiant has no crits (D-473 O4 replaced Critical Up
  with Expose). 37 rows carry crit stats or crit triggers.
  **Recommended:** deterministic conversion C9/C10. Alternative: bring crits
  back with a new RNG stream (large engine and UI change; reverses D-473 O4).
- **O2 Luminosity capacity.** Capacity equals the Convergent Light cost today,
  so "+capacity" has no current meaning. **Recommended:** C8 extra room above
  the cost (faithful: save for Convergent Light and still hold a skill).
  Cheaper alternative: convert +X% capacity into +0.5X% Gauge Gain.
- **O3 Defend-era triggers.** No Phase Zero Conduit or Master uses Defend.
  **Recommended:** restored designs drop every `guard-*` primitive; Leaders keep
  the D-473 O1 interim; no change there.
- **O4 Rescale policy.** **Recommended:** C1 ×0.2 for always-on Health/Defense/
  Attack only; Skill stats, damage bonuses, Defense ignore and timed buffs
  verbatim. 4c re-runs `node tools\run_pressure_study.mjs <out> --retune`; if an
  ordinary band moves more than 5 points from the D-481 results, propose a
  fallback (cap Conduit + Master Skill Power at +200%) before release.
- **O5 D-480 reversal.** Five reworks approved on 2026-11-17 (Starvein
  Conductor, Horizon Heartcase, Duplex Heart, Reserve Torque Crank, Fieldbrace
  Coupler) replaced Radiant-era designs, not pre-Radiant ones.
  **Recommended:** restore the pre-Radiant effects too (owner direction);
  damage-based healing remains on Lifeline Flywheel, Worldroot Sap Cathedral
  and `master-ember-1`. Alternative: keep D-480 for these five.
- **O6 Distinct-design test** (`combat-consolidation.test.ts:247-257`) allows at
  most 2 primitives and rejects equal kind sets. The old catalog has packages of
  3-5 parts and near-duplicates (Siege Cantilever / Worldbreaker Cannonade;
  Aegis Capacitor / Immortal Vessel). **Recommended:** change it to at most 6
  primitives and unique (kind, base amount) lists.
- **O7 Unmatched Masters.** 18 old Masters belong to unreleased Sunshade bearers
  (list under B5). **Recommended:** leave them untouched; restore them when
  Sunshade kits exist and launch is approved. Nothing is deleted.
- **O8 Removed kit mechanics in Masters** (Aurora's Seal, Disciple's
  Strike/Shelter/Resolve, Vespera's Beacon, Asteriel's Moonflower, Serapha's
  Ceasefire, Caldrex's taunt, Orvella's partial Citadel strike).
  **Recommended:** the translations in the B5 rows (Seal = Aurora's Weaken;
  Strike/Resolve = Disciple's Attack Up; Moonflower = Attack Up; Ceasefire =
  Damage Reduction, as in Phase 3 batch 4).
- **O9 Ambiguous old text.** **Recommended:** Choir-Array "Mark" = Quarry,
  Survey, Fate-seared Mark, Incision, Thorn Trap or Nightglass mark placed by
  this bearer; `master-rosetta-1` "two direct hits" counts damaging actions,
  not individual hits; Throne of Borrowed Tomorrows' extra skill pays its normal
  cost; `master-ilvaris-3` adds 1 on top of the Convergent Light's 2 Marks.
- **O10 Recovery-dependent clauses** (Causality Funeral Engine, Paradox
  Spindle, Stillhour Carillon, Horizon Heartcase, Throne of Borrowed
  Tomorrows). **Recommended:** the B-row translations ("after this bearer uses
  Convergent Light", "while Luminosity is below the Convergent Light cost";
  drop "no Recovery").
- **O11 Random effects** (Nullsong Transmission, Stasis Reliquary,
  `master-myrthen-2`). **Recommended:** a new `conduit` combat RNG stream in
  the encounter state, separate from `chargeSeed`, so no other stream shifts.
- **O12 Rescue sharing.** **Recommended:** C18; Refusal stays separate and can
  still save an ally after a Conduit rescue was used.
- **O13 Master attunement.** **Recommended:** keep each Master's current
  attunement (Radiant subtype) and add the restored stat package on top.
- **O14 Current Radiant-era designs.** **Recommended:** replaced wholesale, not
  kept as alternatives. Saved holdings, ranks and loadouts are untouched.

## Fit audit

Class: **Verbatim** = maps onto a live mechanic; **Term swap** = names/units
only; **Adapt** = depended on a removed rule (closest translation, O ref).
Class ignores engine plumbing (see the gap list) and the C1 rescale.
"Current" lists the live primitives (`radiantConduits`, `masterDesigns`).
Restore text is at +0.

### B1: Common + Rare (25)

| ID | Name | Pre-Radiant effect | Current | Class | Restore as |
|---|---|---|---|---|---|
| `vigil-core` | Vigil Core | +100% Health | hp .2 | Verbatim | Maximum Health +20%. |
| `siegebound-drive` | Siegebound Drive | +35% Direct Attack; +5% Skill Eff | normal .15 | Term swap | Attack +7%. Skill Efficiency +5%. |
| `bastion-lock` | Bastion Lock | +35% Defense; +25% Skill Power | defense .2 | Verbatim | Defense +7%. Skill Power +25%. |
| `parallax-relay` | Parallax Relay | +50% Health; +10% Last Flare Direct Damage | normal-expose .08 | Term swap | Maximum Health +10%. Convergent Light deals 10% more damage. |
| `fracture-reservoir` | Fracture Reservoir | +40% Gauge Capacity | start-charge 10 | Adapt (O2) | Luminosity capacity +40% above the Convergent Light cost. |
| `prism-splinter-socket` | Prism Splinter Socket | +7.5% Gauge Gain; +5% Skill Eff | opening .2 | Term swap | Gauge Gain +7.5%. Skill Efficiency +5%. |
| `precision-escapement` | Precision Escapement | +10% Crit Multiplier | first-action .2 | Adapt (O1) | Normal Attacks, skills and Convergent Light deal 2.5% more direct damage. |
| `fieldbrace-coupler` | Fieldbrace Coupler | +25% Crit Rate | shield-break .3 (D-480) | Adapt (O1, O5) | Normal Attacks, skills and Convergent Light deal 12.5% more direct damage. |
| `reserve-torque-crank` | Reserve Torque Crank | +25% Gauge Capacity; +10% Gauge Gain | leech .15 + normal-charge 1 (D-480) | Adapt (O2, O5) | Luminosity capacity +25% above the Convergent Light cost. Gauge Gain +10%. |
| `crosspin-governor` | Crosspin Governor | +40% Skill Power | flare .12 | Verbatim | Skill Power +40%. |
| `aegis-capacitor` | Aegis Capacitor | +75% Health; +75% Defense | absorbed-charge 6 | Verbatim | Maximum Health +15%. Defense +15%. |
| `breach-pendulum` | Breach Pendulum | Enemies begin each Battle with 10% less Defense; copies do not stack | opening .25 + pierce .08 | Term swap | All enemies have 10% less Defense for the encounter (C14). Multiple copies do not stack. |
| `coilfeed-ratchet` | Coilfeed Ratchet | +8% Skill Eff; +8% Skill Power; +8% Crit Rate | normal-charge 3 + guard-charge 3 | Adapt (O1) | Skill Efficiency +8%. Skill Power +8%. Normal Attacks, skills and Convergent Light deal 4% more direct damage. |
| `duplex-heart` | Duplex Heart | Skill restores another ally's Health: heal self 5% max Health, once per cast | skill-leech .1 (D-480) | Verbatim (O5) | Once per skill, when it restores another ally's Health, this bearer heals 5% of their maximum Health. |
| `falcon-sight` | Falcon Sight | +25% Crit Rate; +45% Health | exposed .25 + normal-expose .1 | Adapt (O1) | Maximum Health +9%. Normal Attacks, skills and Convergent Light deal 12.5% more direct damage. |
| `glassroot-gimbal` | Glassroot Gimbal | +5% Skill Power per full 450 max Health | shielded .25 + normal-shield .3 | Verbatim | Skill Power +5% for every full 450 of this bearer's maximum Health (threshold fixed; checked in the 4c study). |
| `hammerbalance-link` | Hammerbalance Link | +85% Direct Attack; +15% Crit Multiplier | attack .18 + wounded .15 | Adapt (O1) | Attack +17%. Normal Attacks, skills and Convergent Light deal 3.75% more direct damage. |
| `lifeline-flywheel` | Lifeline Flywheel | After Attack Action heal self 10% of direct damage dealt to Health and Shields | leech .12 | Verbatim | After each damaging action, this bearer heals 10% of the direct damage it dealt to enemy Health and Shields. |
| `opal-indexer` | Opal Indexer | Debuff Skills +75% Skill Power, +1 turn Skill Duration | normal-weaken .12 + resilience .15 | Verbatim | Skills that apply Weaken, Expose or Burn gain +75% Skill Power and +1 turn Skill Duration. |
| `resonance-crucible` | Resonance Crucible | +75% Defense; +50% Health; +1 turn Skill Duration | normal-splash .2 | Verbatim | Defense +15%. Maximum Health +10%. Skill Duration +1 turn. |
| `sentinel-aperture` | Sentinel Aperture | Skill 1 +99% Skill Power | brace .15 | Verbatim | Skill 1 gains +99% Skill Power. |
| `spearwheel-engine` | Spearwheel Engine | All Skills ignore 10% Defense | pierce .18 | Verbatim | Skills ignore 10% of enemy Defense (C14). |
| `springwell-pump` | Springwell Pump | Heal/Shield Skills +20% Skill Power | healing .3 | Verbatim | Skills that heal or grant Shields gain +20% Skill Power. |
| `twinpulse-bellows` | Twinpulse Bellows | Normal Attack: self and lowest-Gauge other ally +7% capacity each | start-charge 15 + guard-charge 3 | Term swap | Each Normal Attack grants this bearer and the other living ally with the lowest Luminosity percentage 7 Luminosity each. |
| `wardglass-transformer` | Wardglass Transformer | +35% Crit Multiplier; −35% Defense | shielding .3 | Adapt (O1) | Normal Attacks, skills and Convergent Light deal 8.75% more direct damage. Defense −7% (fixed). |

### B2: Legendary (15)

| ID | Name | Pre-Radiant effect | Current | Class | Restore as |
|---|---|---|---|---|---|
| `astral-prism` | Astral Prism | +30% Crit Rate; +25% Crit Mult; +50% Health | first-action .35 + normal-expose .15 | Adapt (O1) | Maximum Health +10%. Normal Attacks, skills and Convergent Light deal 21.25% more direct damage. |
| `citadel-spine` | Citadel Spine | +75% Direct Attack; +7% Gauge Gain; allies below 75% Health +35% Defense while alive; no stack | defense .35 + guard-shield .6 | Term swap | Attack +15%. Gauge Gain +7%. While this bearer lives, other living allies below 75% Health have Defense Up +35%. Multiple copies do not stack. |
| `execution-orrery` | Execution Orrery | Skill 2 +99% Skill Power, +10% Skill Eff | execution .6 | Verbatim | Skill 2 gains +99% Skill Power and +10% Skill Efficiency. |
| `granite-hourglass` | Granite Hourglass | Turn start: Shield = 30% of Health lost to enemy direct damage last enemy turn | hurt-shield .06 + round-shield .5 | Verbatim | At the start of each turn, this bearer gains a Shield equal to 30% of the Health they lost to direct enemy damage in the previous enemy phase. |
| `horizon-heartcase` | Horizon Heartcase | Last Flare +35% Crit Mult, +10% Crit Rate; +20% Health, +10% Defense while blocked by Gauge/Cooldown/Recovery | guard-team-shield .4 + hurt-charge 5 (D-480) | Adapt (O1, O5, O10) | Convergent Light deals 13.75% more damage. While this bearer's Luminosity is below the Convergent Light cost: maximum Health +20% and Defense Up +10%. |
| `immortal-vessel` | Immortal Vessel | +250% Health; +75% Defense | hp .4 + guard-heal .25 | Verbatim | Maximum Health +50%. Defense +15%. |
| `judgment-lens` | Judgment Lens | Damaging Skills +50% Crit Mult; Support Skills +50% Skill Power | flare .35 + exposed .25 | Adapt (O1) | Damaging skills deal 12.5% more direct damage. Skills that heal, Shield or buff allies gain +50% Skill Power. |
| `meridian-inverter` | Meridian Inverter | Ally restored by your healing Skill gains 4% capacity, once per cast | flare-heal .4 + shielding .25 | Term swap | Once per skill, each ally whose Health it restores gains 4 Luminosity. |
| `nullsong-transmission` | Nullsong Transmission | Each Skill: 50% +75% Skill Power, else −75%; one roll per cast | normal .35 + normal-charge 4 | Verbatim (O11) | Each skill rolls once: 50% chance of +75% Skill Power, otherwise −75% Skill Power. |
| `pale-bulwark-diadem` | Pale Bulwark Diadem | Enemy hits consume 50% less Shield | shelter .15 + shielding .3 | Verbatim | Enemy hits remove 50% less Shield from this bearer (C15). Damage left after the Shield breaks hits Health normally. |
| `siege-cantilever` | Siege Cantilever | Global damaging Skills +150% Skill Power | solo .5 | Verbatim | Skills that damage all enemies gain +150% Skill Power. |
| `starvein-conductor` | Starvein Conductor | All squad members different elements: +35% Skill Eff, +10% Gauge Gain; defeated count | skill-leech .15 + burn-power .2 (D-480) | Verbatim (O5) | If every squad member has a different element (defeated members count): Skill Efficiency +35% and Gauge Gain +10%. |
| `stasis-reliquary` | Stasis Reliquary | Shield broken: 10% chance to block the rest; then +25% damage taken next enemy turn, unavailable | brace .25 + guard .12 | Verbatim (O11) | When an enemy hit breaks this bearer's Shield, 10% chance (+2% per rank) to block the rest of that hit. If it blocks, this bearer takes 25% more damage from enemy attacks in the next enemy phase and this cannot trigger then. |
| `verdict-caliper` | Verdict Caliper | Critical Attack Action heals 25% max Health, once per action | normal .3 + solo .25 | Adapt (O1) | Once per action, a damaging action on an enemy with Exposure heals this bearer 25% of their maximum Health. |
| `worldbreaker-drive` | Worldbreaker Drive | Last Flare +99% Skill Power; all Attack Actions +65% Direct Damage | flare .4 + wounded .3 | Verbatim | Convergent Light gains +99% Skill Power. Normal Attacks, skills and Convergent Light deal 65% more direct damage. |

### B3: Omnic (45: 20 Machines masterpieces + 25 kit Omnics)

Element locks unchanged (shown in catalog §2.4).

**Machines masterpieces (20)**

| ID | Name | Pre-Radiant effect | Current | Class | Restore as |
|---|---|---|---|---|---|
| `tectonic-atlas-bastion` | Atlas Bastion | Normal Attack taunts all enemies next enemy turn; each attack aimed at you gives other allies 4% Gauge | normal-reduction .15 + guard-team-shield .4 | Term swap | Each Normal Attack taunts all enemies through the next enemy phase (their single-target attacks aim at this bearer). Each enemy attack aimed at this bearer then grants each other living ally 4 Luminosity. |
| `infernic-cinder-testament` | Cinder Testament | Another ally's Skill on an enemy with your Burn: that Burn +20%, up to +60%; refresh keeps it | burn-power .45 + normal-burn .12 | Verbatim | Each time another ally's skill damages an enemy carrying this bearer's Burn, that Burn deals 20% more damage, up to +60%. Reapplying it keeps the bonus. |
| `luminous-dawn-witness-array` | Dawn Witness Array | Non-crit Attack Action: others +15% Crit next Attack Action; your next +30% Crit Mult and +200% Direct Damage | opening .35 + normal-shield .5 | Adapt (O1) | After a damaging action on an enemy without Exposure: each other living ally's next damaging action deals 7.5% more direct damage; this bearer's next deals 207.5% more. One bonus per recipient; refreshes. |
| `ominous-eclipse-mantle` | Eclipse Mantle | Skills ignore 35% of a Weakened enemy's Defense; +20% Skill Power if another ally Weakened it; +35% Skill Power; +45% Last Flare Direct Damage | weakened .4 + pierce .2 | Verbatim | Skill Power +35%. Convergent Light deals 45% more damage. Skills ignore 35% of a Weakened enemy's Defense (C14) and gain +20% Skill Power against it if another ally applied that Weaken. |
| `tectonic-faultkeeper-loom` | Faultkeeper Loom | Other allies gain Defense = 25% of your effective Defense; +75% Defense; +55% Skill Power | guard-team-shield .6 + defense .25 | Verbatim | Defense +15%. Skill Power +55%. While this bearer lives, other living allies gain Defense equal to 25% of this bearer's current Defense. |
| `atmospheric-griffin-turbine` | Griffin Turbine | Normal Attack: every other ally 10% Gauge; +99% Direct Attack | team-charge 3 + normal .25 | Term swap | Attack +19.8%. Each Normal Attack grants each other living ally 10 Luminosity. |
| `tranquilitic-kirin-cradle` | Kirin Cradle | Normal Attack heals lowest ally 100% of your Defense (cap 50% their max Health); all full: 8% Gauge instead; +65% Defense; +200% Direct Attack | normal-heal .5 + recovery .25 | Term swap | Defense +13%. Attack +40%. Each Normal Attack heals the living ally with the lowest Health percentage for 100% of this bearer's current Defense, up to 50% of that ally's maximum Health; if every ally is at full Health, that ally gains 8 Luminosity instead. |
| `aquatic-leviathan-pump` | Leviathan Pump | A Shield absorbs an enemy attack: recipient 5% Gauge; +45% Defense; +25% Crit Rate | absorbed-charge 8 + hurt-heal .35 | Adapt (O1) | Defense +9%. Normal Attacks, skills and Convergent Light deal 12.5% more direct damage. Whenever any ally's Shield absorbs an enemy attack, its holder gains 5 Luminosity. |
| `ominous-nightglass-archive` | Nightglass Archive | Damaging Skills mark enemies 2 turns; others' Normal Attacks vs marked +50% Crit Mult; squad +200% Direct Attack while alive | normal-expose .18 + cooperation .35 | Adapt (O1) | While this bearer lives, every squad member has Attack +40% (per living wearer). This bearer's damaging skills mark surviving enemies for 2 turns; other allies' Normal Attacks on a marked enemy deal 12.5% more direct damage. |
| `chaotic-ouroboros-core` | Ouroboros Core | +40% Gauge Capacity; after Last Flare all allies Shield 10% own max Health; squad +55% Health | flare-shield .06 + shielded .3 | Adapt (O2) | Luminosity capacity +40% above the Convergent Light cost. After this bearer's Convergent Light, each living ally gains a Shield equal to 10% of their own maximum Health. While this bearer lives, every squad member has maximum Health +11% (per living wearer). |
| `chaotic-paradox-spindle` | Paradox Spindle | While you recover from Last Flare, others +40% Skill Power, +20% Skill Eff; +35% Defense; +20% Skill Eff | normal .3 + flare-team-charge 8 | Adapt (O10) | Defense +7%. Skill Efficiency +20%. After this bearer uses Convergent Light, other living allies gain +40% Skill Power and +20% Skill Efficiency until the end of the next turn. |
| `infernic-phoenix-reactor` | Phoenix Reactor | Once per Battle revive at 35% Health, 0 Gauge; others Shield 15% own max Health; squad +55% Health | break-heal .4 + hurt-shield .08 | Term swap | Once per encounter, when defeated, this bearer revives with 35% of maximum Health and 0 Luminosity; each other living ally then gains a Shield equal to 15% of their own maximum Health. While this bearer lives, every squad member has maximum Health +11% (per living wearer). Shares the rescue limit (C18). |
| `luminous-seraph-mirror` | Seraph Mirror | First critical Attack Action each turn heals every ally 6% own max Health; squad +65% Health | normal-heal .4 + normal-splash .2 | Adapt (O1) | Once per turn, this bearer's first damaging action heals every living ally 6% of their own maximum Health. While this bearer lives, every squad member has maximum Health +13% (per living wearer). |
| `atmospheric-skythread-rudder` | Skythread Rudder | Normal Attack: lowest-Gauge other ally +25% Skill Eff next Skill 1/2; +60% Gauge Capacity; +35% Gauge Gain | normal-charge 5 + next-buff .15 | Adapt (O2) | Luminosity capacity +60% above the Convergent Light cost. Gauge Gain +35%. Each Normal Attack gives the other living ally with the lowest Luminosity percentage +25% Skill Efficiency on their next Skill 1 or Skill 2 (one per ally). |
| `tranquilitic-stillhour-carillon` | Stillhour Carillon | Each turn start in Last Flare Recovery: heal all 8%, 10% Gauge; +120% Health; +30% Gauge Gain | flare-team-charge 10 + round-charge 3 | Adapt (O10) | Maximum Health +24%. Gauge Gain +30%. At the start of the turn after this bearer uses Convergent Light, heal every living ally 8% of their own maximum Health and grant them 10 Luminosity. |
| `voltaic-stormstep-dynamo` | Stormstep Dynamo | Alternating Skill 1/2: +30% Skill Power to the switched Skill, +15% Skill Eff to next other ally's Skill; other action resets; +70% Direct Attack; +25% Skill Eff | cooperation .4 + flare-team-charge 8 | Verbatim | Attack +14%. Skill Efficiency +25%. Using Skill 1 after Skill 2, or Skill 2 after Skill 1, gives that skill +30% Skill Power and the next other ally's skill +15% Skill Efficiency. Any other action resets the sequence. |
| `voltaic-thunderbird-coil` | Thunderbird Coil | Critical Skill: Bonus Strike 40% of first-target Health damage to healthiest other enemy; none left: others +20% Crit next; +95% Direct Attack; +45% Crit Mult | normal-splash .4 + opening .25 | Adapt (O1) | Attack +19%. Normal Attacks, skills and Convergent Light deal 11.25% more direct damage. A skill that damages an enemy with Exposure strikes the other enemy with the highest Health percentage for 40% of the Health damage dealt to its first target; if none remains, each other living ally's next damaging action deals 10% more direct damage. |
| `aquatic-undertide-chronometer` | Undertide Chronometer | +1 turn Skill Duration for your Weaken; others +15% Skill Eff for damaging Skills on your Weakened enemy; +70% Defense; +30% Skill Eff | normal-weaken .2 + guard-charge 6 | Verbatim | Defense +14%. Skill Efficiency +30%. Weaken from this bearer lasts 1 more turn. Other allies gain +15% Skill Efficiency on damaging skills aimed at an enemy carrying this bearer's Weaken. |
| `efflorescent-verdant-covenant` | Verdant Covenant | Effective healing from your Skills: recipients +30% Skill Power next damaging Skill; +95% Health; +25% Gauge Gain | heal-buff .2 + heal-charge 5 | Verbatim | Maximum Health +19%. Gauge Gain +25%. Each ally actually healed by this bearer's skills gains +30% Skill Power on their next damaging skill (one per ally). |
| `efflorescent-worldtree-heart` | Worldtree Heart | Skills turn 60% of overhealing into a Shield (cap 20% max Health, two enemy turns), replacing its last; +140% Health; +35% Skill Power | heal-shield .5 + round-heal .25 | Adapt (Shields last until broken) | Maximum Health +28%. Skill Power +35%. This bearer's skills turn 60% of overhealing into a Shield for the healed ally, up to 20% of that ally's maximum Health. A new Shield from this Conduit replaces the previous one. |

**Kit Omnics (25)**

| ID | Name | Pre-Radiant effect | Current | Class | Restore as |
|---|---|---|---|---|---|
| `clearwater-manifold` | Abyssal Clearwater Parliament | +35% Skill Power per other Oceanic squad member, defeated included | team-charge 3 + heal-team-charge 4 | Verbatim | Skill Power +35% for each other Oceanic squad member, including defeated ones. |
| `tranquilitic-accord-bastion` | Accord Seraph Sanctuary | Your heals/Shields grant Accord: once per ally per Battle survive a fatal direct hit at 1 Health, +25% Skill Eff next Skill; +85% Health; +20% Skill Eff | heal-shield .6 + hurt-heal .3 | Verbatim | Maximum Health +17%. Skill Efficiency +20%. Allies healed or Shielded by this bearer gain Accord: once per encounter it keeps them at 1 Health against a fatal direct enemy hit and gives +25% Skill Efficiency on their next skill. Shares the rescue limit (C18). |
| `aegis-return-spring` | Aegis Covenant Crown | Holders of your Skill Shields +20% Crit, 30% less damage from enemy crits; +90% Defense; +40% Crit Mult | shielding .35 + break-heal .3 | Adapt (O1) | Defense +18%. Normal Attacks, skills and Convergent Light deal 10% more direct damage. Allies holding a Shield from this bearer's skills deal 10% more direct damage and take 30% less damage from enemy hits above 20% of their maximum Health. |
| `flare-focusing-iris` | Ember Coronation Iris | +1 turn Skill Duration for your Burn; others +20% Crit vs your Burn; +80% Skill Power on Burn Skills; +55% Direct Attack | burn-power .35 + flare .3 | Adapt (O1) | Attack +11%. Burn from this bearer lasts 1 more turn. Skills that apply Burn gain +80% Skill Power. Other allies deal 10% more direct damage to enemies carrying this bearer's Burn. |
| `cinder-metering-nozzle` | Eternal Cinder Observatory | Burning enemy dies: remaining Burn hits healthiest other enemy as one Bonus Strike; +225% Direct Attack | normal-burn .15 + normal-splash .25 | Verbatim | Attack +45%. When an enemy carrying Burn is defeated, its remaining Burn damage strikes the other living enemy with the highest Health percentage as one Conduit-generated strike. |
| `firstlight-cam` | Firstlight Concordance | Squad +50% Gauge Gain, +40% Defense; you +35% Health, +45% Skill Power | start-charge 20 + shelter .15 | Verbatim | Maximum Health +7%. Skill Power +45%. While this bearer lives, every squad member has Gauge Gain +50% and Defense +8% (per living wearer). |
| `tension-governor` | Fractured Mercy Governor | Applying Weaken: most injured ally +30% Defense next enemy turn, +6% max Health heal if below 50%; once per Skill; +25% Skill Eff; squad +55% Health | normal-weaken .2 + status-shield .5 | Verbatim | Skill Efficiency +25%. While this bearer lives, every squad member has maximum Health +11% (per living wearer). Once per skill that applies Weaken, the most-wounded living ally gains Defense Up +30% through the next enemy phase and, if below 50% Health, heals 6% of their maximum Health. |
| `ward-stitch-spool` | Leviathan Ward Loom | Shielded allies +30% Skill Power on heal/Shield Skills while you live; +55% Defense; +55% Skill Power | healing .3 + heal-shield .5 | Verbatim | Defense +11%. Skill Power +55%. While this bearer lives, each living ally holding a Shield gains +30% Skill Power on skills that heal or grant Shields. |
| `tidebound-reflector` | Leviathan Mercy Reflector | Your Shields reflect 40% absorbed to attacker, up to 150% of your Direct Attack per enemy turn; +125% Direct Attack | reflect .5 + defense .3 | Term swap | Attack +25%. Shields from this bearer reflect 40% of the damage they absorb to the attacker, up to 150% of this bearer's current Attack per enemy phase across all holders. |
| `emberlife-kiln` | Phoenix Lifeforge | Any enemy burning: squad +150% Direct Attack; ability Burn ticks heal squad 8% own max Health; +55% Skill Power; +40% Gauge Capacity | burn-heal .25 + burn-power .25 | Adapt (O2) | Skill Power +55%. Luminosity capacity +40% above the Convergent Light cost. While any enemy carries Burn, every living squad member has Attack Up +100% (old +150%, held to the cap). Each Burn tick from an Element-Bearer ability that damages Health heals every living squad member 8% of their own maximum Health. |
| `tempered-strike-link` | Phoenix Temper Dominion | Ally's Skill heals you: +40% Direct Attack next Attack Action, then that ally +20% Skill Eff next Skill; +100% Direct Attack; +10% Crit | burning .4 + normal .2 | Adapt (O1) | Attack +20%. Normal Attacks, skills and Convergent Light deal 5% more direct damage. When another ally's skill heals this bearer, this bearer's next damaging action gains +40% Attack; after it resolves, the healer gains +20% Skill Efficiency on their next skill. |
| `infernic-pyre-census` | Pyre Census Requiem | +20% Skill Power per different element among living members; +55% Skill Power; +25% Health | burning .35 + cooperation .3 | Verbatim | Maximum Health +5%. Skill Power +55%, plus +20% for each different element among living squad members. |
| `chaotic-fault-verdict` | Rosefault Precision Sovereign | Shielded: +50% Crit Mult; first crit each turn gives your Shield's provider +20% Skill Power next Skill; +70% Last Flare Direct Damage; +55% Health | shielded .4 + pierce .2 | Adapt (O1) | Maximum Health +11%. Convergent Light deals 70% more damage. While this bearer has a Shield, Normal Attacks, skills and Convergent Light deal 12.5% more direct damage. Once per turn, this bearer's first damaging action gives the provider of its Shield +20% Skill Power on their next skill. |
| `ruinselect-prism` | Ruinselect Fracture Parliament | +55% Skill Power and +20% Defense per defeated member | wounded .45 + leech .12 | Verbatim | Skill Power +55% and Defense +4% for each currently defeated squad member. |
| `secondbeat-rack` | Secondbeat Rupture Throne | After another ally damages an enemy, your next damaging Skill vs it +35% Skill Power, gives that ally 8% Gauge; +35% Health; +15% Crit | weakened .3 + kill-charge 12 | Adapt (O1) | Maximum Health +7%. Normal Attacks, skills and Convergent Light deal 7.5% more direct damage. After another ally damages an enemy, this bearer's next damaging skill on that enemy gains +35% Skill Power and grants that ally 8 Luminosity. |
| `oceanic-shared-tide-pump` | Shared Tide Lifesea Engine | Single-ally Shield Skills also Shield the most injured other ally for 50%; +65% Health; +30% Skill Eff | guard-team-shield .5 + absorbed-charge 6 | Verbatim | Maximum Health +13%. Skill Efficiency +30%. A skill from this bearer that Shields only one ally also gives the most-wounded other living ally a Shield worth 50% of that amount. |
| `pulse-trigger-pawl` | Sky Sovereign Escapement | First critical Skill 1/2 each turn: each other ally 8% Gauge; +40% Crit; +65% Skill Power | normal-charge 4 + exposed .3 | Adapt (O1) | Skill Power +65%. Normal Attacks, skills and Convergent Light deal 20% more direct damage. Once per turn, this bearer's first damaging Skill 1 or Skill 2 grants each other living ally 8 Luminosity. |
| `solace-anchor` | Solace Witness Monolith | Acting before all others gives them +20% Direct Attack this turn; +80% Direct Attack; +35% Crit Mult | round-charge 4 + normal-heal .3 | Adapt (O1) | Attack +16%. Normal Attacks, skills and Convergent Light deal 8.75% more direct damage. When this bearer acts before every other living ally, those allies gain Attack Up +20% for the rest of the turn. |
| `sootwake-crucible` | Sootwake Phoenix Mirror | Your Burn damages an enemy: others' next damaging Skill vs it +30% Skill Power; +75% Skill Power; +25% Crit Mult | burning .3 + next-buff .2 | Adapt (O1) | Skill Power +75%. Normal Attacks, skills and Convergent Light deal 6.25% more direct damage. After this bearer's Burn damages an enemy, each other ally's next damaging skill on that enemy gains +30% Skill Power (one per ally; expires after their next action). |
| `atmospheric-storm-clock` | Tempest Return Chronarch | Every third crit: all allies +25% Skill Eff next Last Flare; +35% Crit; +75% Gauge Capacity | normal-charge 4 + cooperation .3 | Adapt (O1, O2) | Normal Attacks, skills and Convergent Light deal 17.5% more direct damage. Luminosity capacity +75% above the Convergent Light cost. Every third damaging action by this bearer on an enemy with Exposure gives every living ally +25% Skill Efficiency on their next Convergent Light (one stored per ally). |
| `pressurecrest-governor` | Tempest Shelter Sovereign | First critical Skill each turn: lowest ally Shield 15% max Health; +85% Defense; +30% Crit | normal-reduction .18 + first-action .25 | Adapt (O1) | Defense +17%. Normal Attacks, skills and Convergent Light deal 15% more direct damage. Once per turn, this bearer's first damaging skill gives the living ally with the lowest Health percentage a Shield equal to 15% of their maximum Health. |
| `covercharge-drum` | Worldgrove Covercharge Heart | After your Skill: next other ally's Skill +20% Skill Power if yours damaged, +15% Skill Eff if it healed/Shielded; +60% Skill Power; +50% Gauge Capacity | hurt-heal .3 + hurt-charge 8 | Adapt (O2) | Skill Power +60%. Luminosity capacity +50% above the Convergent Light cost. After this bearer uses a skill, the next other ally's skill gains +20% Skill Power if it dealt damage and +15% Skill Efficiency if it healed or granted a Shield. |
| `botanic-graft-covenant` | Worldroot Graft Coronation | Healing Skills +50% Skill Power on allies below 40%; lifted above: +30% Defense next enemy turn; +110% Health; +20% Skill Eff | healing .35 + round-heal .3 | Verbatim | Maximum Health +22%. Skill Efficiency +20%. Healing from this bearer's skills gains +50% Skill Power on allies below 40% Health; an ally it lifts above 40% gains Defense Up +30% through the next enemy phase. |
| `mending-valve` | Worldroot Sap Cathedral | Damaging Skills heal lowest ally 15% of Health removed (cap 10% their max Health); +85% Direct Attack; +40% Skill Power | kill-heal .1 + recovery .25 | Verbatim | Attack +17%. Skill Power +40%. This bearer's damaging skills heal the living ally with the lowest Health percentage for 15% of the enemy Health they removed, up to 10% of that ally's maximum Health per cast. |
| `rootbound-triage-vault` | Worldroot Triage Sanctuary | Turn start: lowest ally +25% Skill Eff, +35% Skill Power for heals/Shields until their next action; +70% Health; +60% Defense | heal-charge 6 + heal-shield .5 | Verbatim | Maximum Health +14%. Defense +12%. At the start of each turn, the living ally with the lowest Health percentage gains +25% Skill Efficiency and +35% Skill Power on healing and Shields until they finish their next action. |

### B4: Calamitic (14)

| ID | Name | Pre-Radiant effect | Current | Class | Restore as |
|---|---|---|---|---|---|
| `calamitic-aegis-engine-of-severed-fate` | Aegis-Engine of Severed Fate | Shield damage −36.67%; +50% Skill Power | break-heal .5 + flare-shield .1 | Verbatim | Skill Power +50%. Enemy hits remove 36.7% less Shield from this bearer (C15). |
| `calamitic-bulwark-of-the-last-horizon` | Bulwark of the Last Horizon | +200% Health; +200% Defense; Shields lose 16.67% fewer points | hurt-shield .12 + guard-team-shield .9 | Verbatim | Maximum Health +40%. Defense +40%. Enemy hits remove 16.7% less Shield from this bearer (C15). |
| `calamitic-cathedral-final-equation` | Cathedral of the Final Equation | Attack Actions +250% Crit Rate, +120% Crit Mult; +65% Skill Eff | exposed .6 + flare-weaken .25 | Adapt (O1) | Skill Efficiency +65% (discount still capped at 50%). Normal Attacks, skills and Convergent Light deal 155% more direct damage. |
| `calamitic-causality-funeral-engine` | Causality Funeral Engine | +50% Skill Eff; Last Flare no Cooldown/Recovery, +125% Direct Damage | kill-charge 20 + execution .6 | Adapt (O10) | Skill Efficiency +50% (+2% per rank; cap 50%, Convergent Light floor 70). Convergent Light deals 125% more damage. |
| `calamitic-choir-array-of-branded-stars` | Choir-Array of Branded Stars | Applying a Mark: squad +33.3% Skill Power (stacks this turn) and 6.67% Gauge; 4 per Battle; +46.67% Health and Defense | leader .3 + team-charge 5 | Adapt; Ambiguous (O9) | Maximum Health +9.3%. Defense +9.3%. Up to 4 times per encounter, when this bearer places a mark (O9), each living squad member gains +33.3% Skill Power until the end of the turn (stacks per trigger) and 6.7 Luminosity, rounded once. |
| `calamitic-heartforge-of-the-sunless-dawn` | Heartforge of the Sunless Dawn | +333.3% Health; +16.67% Skill Power | hurt-heal .6 + hp .5 | Verbatim | Maximum Health +66.7%. Skill Power +16.7%. |
| `calamitic-horizon-cleaving-godpress` | Horizon-Cleaving Godpress | Damaging Skills ignore 55% Defense; +75% Defense | opening .6 + normal .5 | Verbatim | Defense +15%. Damaging skills ignore 55% of enemy Defense (C14). |
| `calamitic-monolith-of-the-unmoved-star` | Monolith of the Unmoved Star | +333.3% Defense; +10% Skill Eff | shelter .25 + guard-shield 1.2 | Verbatim | Defense +66.7%. Skill Efficiency +10%. |
| `calamitic-reliquary-of-unending-mercy` | Reliquary of Unending Mercy | Heal/Shield Skills +83.3% Skill Power, +23.3% Skill Eff | round-team-heal .2 + heal-buff .3 | Verbatim | Skills that heal or grant Shields gain +83.3% Skill Power and +23.3% Skill Efficiency. |
| `calamitic-ruinmark-censer` | Ruinmark Censer | Enemies you Weaken take +10% damage from all sources while Weakened; +50% Defense; +40% Skill Power | normal-expose .3 + burn-power .5 | Verbatim | Defense +10%. Skill Power +40%. Enemies Weakened by this bearer take 10% more damage from all sources while Weakened. |
| `calamitic-throne-borrowed-tomorrows` | Throne of Borrowed Tomorrows | Last Flare: each ally who acted gets one extra Skill 1/2 this turn; once per ally per turn; Recovery allies ineligible; +45% Health and Defense | first-action .6 + round-charge 6 | Adapt; Ambiguous (O9, O10) | Maximum Health +9%. Defense +9%. This bearer's Convergent Light lets each other living ally who already acted this turn use one extra Skill 1 or Skill 2 this turn, paying its normal cost (once per ally per turn). |
| `calamitic-throne-of-the-lone-apostate` | Throne of the Lone Apostate | Only Element-Bearer: +166.67% Defense, +166.67% Health, +83.3% Skill Power | wounded .6 + normal-reduction .25 | Term swap | If this bearer is the only squad member: Defense +33.3%, maximum Health +33.3%, Skill Power +83.3%. |
| `calamitic-world-eater-orrery` | World-Eater's Orrery | +3 turns Skill Duration; Debuffs from your Skills +125% Skill Power | solo .65 + flare .5 | Verbatim | Skill Duration +3 turns. Weaken, Expose and Burn applied by this bearer's skills gain +125% Skill Power. |
| `calamitic-worldbreaker-cannonade` | Worldbreaker Cannonade | Damaging Skills hitting all enemies +166.7% Skill Power | normal-splash .6 + execution .5 | Verbatim | Skills that damage all enemies gain +166.7% Skill Power. |

### B5: Masters (96 live of 114 old)

Mapping is by stable ID: every live Master ID (`master-<bearer>-<1-3>`, 32
released bearers × 3) is the same ID as in catalog §2.6, so all 96 match
one-to-one. Masters keep fixed values (no ranks) and their current attunement
(O13). Skill names are the Phase 3 names (Hymn of Broken Glass is now
Glasschoir Hymn).

**Original 26 bearers (78)**

| ID | Name | Pre-Radiant effect | Current | Class | Restore as |
|---|---|---|---|---|---|
| `master-ember-1` | Helios Pyre Cathedral | Infernis's Burn in enemy turn heals most injured 25% of that damage (cap 12%); squad +60% Health, +20% Defense; +55% Skill Power | burn-power .4 + leech .08 | Verbatim | Skill Power +55%. While Infernis lives, every squad member has maximum Health +12% and Defense +4%. After Infernis's Burn damages enemies in an enemy phase, heal the most-wounded living ally 25% of that Health damage, up to 12% of their maximum Health. |
| `master-ember-2` | Cinderstar Genesis Engine | Last Flare targets one enemy, +125% Direct Damage; +55% Health, +65% Defense, +40% Skill Power | flare .3 + normal-burn .15 | Verbatim | Maximum Health +11%. Defense +13%. Skill Power +40%. Dawnfire hits only the current target and deals 125% more damage. |
| `master-ember-3` | Unbroken Sunforge Throne | Dawnfire: others +40% Skill Power next damaging Skill vs Infernis's Burn; +85% Direct Attack; +35% Gauge Gain | burning .35 + flare-heal .3 | Verbatim | Attack +17%. Gauge Gain +35%. Dawnfire gives each other living ally +40% Skill Power on their next damaging skill against an enemy carrying Infernis's Burn. |
| `master-tide-1` | Abyssal Shelter Observatory | +35% Skill Eff; +45% Skill Power; +80% Defense | break-heal .4 + defense .25 | Verbatim | Skill Efficiency +35%. Skill Power +45%. Defense +16%. |
| `master-tide-2` | Ocean Memory Worldpump | Tidal Shelter +50% Skill Power; Shield holders +25% Skill Eff next Skill; +45% Defense; +25% Gauge Gain | shielding .4 + guard-heal .3 | Verbatim | Defense +9%. Gauge Gain +25%. Tidal Shelter gains +50% Skill Power; each ally holding its Shield gains +25% Skill Efficiency on their next skill while it remains. |
| `master-tide-3` | Undertow Sovereign Harpoon | Tizu Shield holders ignore 25% Defense of his Weakened enemies; +95% Defense; +35% Skill Power | normal-weaken .18 + guard-shield .6 | Verbatim | Defense +19%. Skill Power +35%. Allies holding a Shield from Tizu ignore 25% of the Defense of enemies carrying Tizu's Weaken (C14). |
| `master-sprout-1` | Worldseed Mercy Foundry | Seed matures/harvested: recipient +25% Skill Power next Skill (+15% Skill Eff if Empowered); +65% Skill Power; +50% Gauge Capacity | round-team-heal .12 + healing .25 | Adapt (O2) | Skill Power +65%. Luminosity capacity +50% above the Convergent Light cost. When Flora's Seed heals its holder, that ally gains +25% Skill Power on their next skill; an Empowered Seed also gives +15% Skill Efficiency. |
| `master-sprout-2` | Briar Constellation Loom | Briar Shot plants a Seed on every ally; those Seeds +45% Skill Power | normal-weaken .15 + normal-heal .4 | Verbatim | Briar Shot plants a Seed on every living ally; those Seeds gain +45% Skill Power. |
| `master-sprout-3` | Evergreen Continuance Crucible | Empowered Seed holders +25% Defense; once per Battle Worldseed revives at 35%, 0 Gauge; +99% Health; +65% Gauge Gain | heal-shield .5 + flare-team-charge 6 | Term swap | Maximum Health +19.8%. Gauge Gain +65%. Allies holding an Empowered Seed have Defense Up +25% until it heals them. Once per encounter, Worldseed also revives defeated allies with 35% of maximum Health and 0 Luminosity, without a Seed (C18). |
| `master-atmoso-1` | Sky Without End Turbine | Cyclone release: each ally 3% Gauge per Gust (cap 18%); +50% Skill Power; +60% Gauge Capacity | normal-splash .4 + normal-charge 4 | Adapt (O2) | Skill Power +50%. Luminosity capacity +60% above the Convergent Light cost. When Atmoso's Cyclone releases, each living ally gains 3 Luminosity per Gust (max 5 Gusts). |
| `master-atmoso-2` | Horizon Cyclone Orrery | Cyclone release: each ally Shield = 30% of enemy Health removed; squad +55% Health, +45% Defense | hurt-charge 8 + cooperation .3 | Verbatim | While Atmoso lives, every squad member has maximum Health +11% and Defense +9%. When Atmoso's Cyclone releases, each living ally gains a Shield equal to 30% of the enemy Health it removed. |
| `master-atmoso-3` | Crosswind Imperial Drive | Gust adder +30% Gauge Gain to end of next turn; +45% Skill Power; +45% Direct Attack | first-action .35 + pierce .2 | Term swap | Skill Power +45%. Attack +9%. An ally who adds a Gust to Atmoso's Cyclone gains Luminosity Gain Up +30% until the end of the next turn. |
| `master-aurora-1` | Final Dawn Tribunal | Seal: −25% Defense; enemy consumes Seal with a Skill: lowest ally Shield 15%; squad +75% Health, +65% Defense | normal-expose .18 + weakened .3 | Adapt (O8) | While Aurora lives, every squad member has maximum Health +15% and Defense +13%. Enemies carrying Aurora's Weaken have 25% less Defense (C14). When such an enemy attacks, the living ally with the lowest Health percentage gains a Shield equal to 15% of their maximum Health (once per enemy per enemy phase). |
| `master-aurora-2` | Prismseal Astral Judiciary | Final Dawn Verdict reduction also covers enemy Skills; after each protected enemy turn all allies 8% Gauge; +25% Defense; +65% Skill Power | flare-weaken .2 + shelter .15 | Adapt (O8) | Defense +5%. Skill Power +65%. After each enemy phase in which Final Dawn Verdict's Damage Reduction is active, each living ally gains 8 Luminosity. (Its reduction already covers every enemy attack.) |
| `master-aurora-3` | Merciful Eclipse Regulator | Enemy Skill consumes Seal: heal all 8%, once per enemy per turn; +45% Skill Power; +25% Health | hurt-heal .4 + normal-weaken .15 | Adapt (O8) | Skill Power +45%. Maximum Health +5%. When an enemy carrying Aurora's Weaken attacks, heal every living ally 8% of their own maximum Health (once per enemy per enemy phase). |
| `master-bliss-1` | Thousandfeather Zenith Loom | Quietstorm Flourish always grants Opening and Closing bonuses; +70% Skill Power; +45% Defense | flare-heal .5 + heal-buff .15 | Verbatim | Skill Power +70%. Defense +9%. Quietstorm Flourish always grants both its Opening and Closing bonuses. |
| `master-bliss-2` | Stillplume Planetary Ballet | Warfeather Cut: Opening others +25% Crit next; Closing heals others 6% before Skill Power; +85% Direct Attack; +25% Crit | normal .3 + normal-heal .25 | Adapt (O1) | Attack +17%. Normal Attacks, skills and Convergent Light deal 12.5% more direct damage. Warfeather Cut in Opening: each other living ally's next damaging action deals 12.5% more direct damage. In Closing: also heals every other living ally 6% of their maximum Health (not scaled by Skill Power). |
| `master-bliss-3` | Quiet Heaven Fanforge | Thousandfeather Stillness: others +25% Skill Eff next Skill (+1 turn Skill Duration in Closing); +25% Skill Eff; +35% Gauge Gain | flare-team-charge 10 + next-buff .15 | Verbatim | Skill Efficiency +25%. Gauge Gain +35%. Thousandfeather Stillness gives each other living ally +25% Skill Efficiency on their next skill; cast in Closing, that skill also gains +1 turn Skill Duration. |
| `master-bruno-1` | Living Worldwall Atlas | Redirected Cover damage: protected ally +30% Skill Power next Skill; +40% Defense while Cover; +55% Defense; +45% Skill Power | normal-reduction .15 + defense .3 | Verbatim | Defense +11%. Skill Power +45%. Bruno has Defense Up +40% while his Cover is active. When Bruno takes damage redirected by Cover, the protected ally gains +30% Skill Power on their next skill. |
| `master-bruno-2` | Quarry Planet Gravitas | Last Flare Shield = larger of 375% Defense or 37.5% max Health; Cover allies +25% Gauge Gain; +65% Health; +65% Defense | guard-shield 1 + flare-shield .05 | Verbatim | Maximum Health +13%. Defense +13%. Worldwall Ascendant's Shield on Bruno is the larger of 375% of his current Defense or 37.5% of his maximum Health, before Skill Power. Allies under Bruno's Cover have Gauge Gain +25%. |
| `master-bruno-3` | Worldforge Hammer Dominion | Seismic Hammerfall −25% target Defense through next turn; Cover allies +25% Direct Attack; +60% Direct Attack; +85% Defense | normal-expose .18 + guard-team-shield .4 | Verbatim | Attack +12%. Defense +17%. Seismic Hammerfall gives its target 25% less Defense through the next turn (C14). Allies under Bruno's Cover have Attack Up +25%. |
| `master-disciple-1` | Unbound Mindcrown Synapse | Strike/Shelter/Resolve last +2 turns; +75% Health; +35% Skill Eff | next-buff .25 + cooperation .2 | Adapt (O8) | Maximum Health +15%. Skill Efficiency +35%. Attack Up from Disciple's skills and Convergent Light lasts 2 more turns (total up to 6). |
| `master-disciple-2` | Concord Planet Thoughtforge | Ally consumes Resolve: each other ally 10% Gauge | team-charge 3 + flare-team-charge 8 | Adapt (O8) | Once per action, when an ally holding Attack Up from Disciple uses a skill or Convergent Light, each other living ally gains 10 Luminosity. |
| `master-disciple-3` | Sovereign Will Amplifier | Action consuming Strike/Resolve +30% Crit, +40% Crit Mult; +60% Skill Power; +45% Crit Mult | heal-buff .2 + normal-splash .25 | Adapt (O1, O8) | Skill Power +60%. Normal Attacks, skills and Convergent Light deal 11.25% more direct damage. Allies holding Attack Up from Disciple deal 25% more direct damage. |
| `master-elise-1` | Infinite Thunderwheel Arsenal | −15% Defense per lodged Shuriken; +55% Skill Power; +45% Health; +35% Defense | pierce .3 + normal-charge 3 | Verbatim | Skill Power +55%. Maximum Health +9%. Defense +7%. Enemies holding Elise's Shuriken have 15% less Defense per lodged Shuriken (C14). |
| `master-elise-2` | Twin Star Planetary Ratchet | Each Shuriken lodged by Voltstar Cut: next other ally's damaging Skill vs that enemy +35% Skill Power; +80% Direct Attack; +40% Skill Power | flare .35 + normal-splash .25 | Verbatim | Attack +16%. Skill Power +40%. Each Shuriken Voltstar Cut lodges stores +35% Skill Power for the next other ally's damaging skill on that enemy (one spent per cast; recalling removes unused bonuses). |
| `master-elise-3` | Storm Empress Execution Clock | Recall both: others +40% Crit Mult next (+15% Crit if same enemy); +65% Crit Mult; +40% Gauge Gain | kill-charge 15 + first-action .3 | Adapt (O1) | Normal Attacks, skills and Convergent Light deal 16.25% more direct damage. Gauge Gain +40%. When Elise recalls both Shuriken, each other living ally's next damaging action deals 10% more direct damage (17.5% if both were in the same enemy). |
| `master-razor-1` | Unbroken Midnight Bastion | Unbroken Midnight spends Wounds: heal others 20% of spent (cap 15%); +100% Health; +30% Gauge Gain | reflect .4 + normal-reduction .15 | Verbatim | Maximum Health +20%. Gauge Gain +30%. When Unbroken Midnight spends Wounds, heal each other living ally 20% of the Wounds spent, up to 15% of their maximum Health. |
| `master-razor-2` | Eclipse Planet Watchtower | Eclipse Bastion Shield: others Shield 40% of it (cap 45% own max Health); squad +55% Health, +35% Skill Eff | shielded .4 + flare .25 | Verbatim | While Razor lives, every squad member has maximum Health +11% and Skill Efficiency +35%. When Eclipse Bastion Shields Razor, each other living ally gains a Shield worth 40% of it, up to 45% of their own maximum Health. |
| `master-razor-3` | Nightglass Counterblade Engine | Nightcleave spends Wounds: others +30% Crit next; +55% Skill Power; +35% Skill Eff | normal-weaken .2 + solo .3 | Adapt (O1) | Skill Power +55%. Skill Efficiency +35%. When Nightcleave spends Wounds, each other living ally's next damaging action deals 15% more direct damage. |
| `master-rosetta-1` | Rose Beyond the Sun Orrery | Every 2 direct hits on Quarry: each ally 12% Gauge; new Quarry resets; +35% Skill Eff; +55% Skill Power | status-shield .6 + cooperation .25 | Term swap; Ambiguous (O9) | Skill Efficiency +35%. Skill Power +55%. Every 2 damaging actions that hit Rosetta's Quarry (Health or Shield) grant each living ally 12 Luminosity. A new Quarry resets the count. |
| `master-rosetta-2` | Virtuous Planet Rosegarden | Crimson Skyfall on Quarry heals each ally who hit it 8%; contributors +20% Skill Eff next Skill; +80% Health; +30% Skill Eff | exposed .35 + normal-splash .3 | Verbatim | Maximum Health +16%. Skill Efficiency +30%. Crimson Skyfall on the Quarry heals each ally who hit it this turn 8% of their own maximum Health; each such ally other than Rosetta gains +20% Skill Efficiency on their next skill. |
| `master-rosetta-3` | Golden Thorn Judgment Loom | Golden Thorn Volley: others +35% Skill Power next damaging Skill vs Quarry; +60% Skill Power; +35% Gauge Capacity | normal-expose .2 + next-buff .2 | Adapt (O2) | Skill Power +60%. Luminosity capacity +35% above the Convergent Light cost. Golden Thorn Volley gives each other living ally +35% Skill Power on their next damaging skill on Rosetta's Quarry. |
| `master-thornia-1` | Forbidden Garden Worldlock | Trap triggered: enemy −20% Defense to end of next turn; +75% Skill Power; +20% Defense | reflect .5 + normal-burn .1 | Verbatim | Skill Power +75%. Defense +4%. An enemy that triggers Thornia's Thorn Trap has 20% less Defense until the end of the next turn (C14). |
| `master-thornia-2` | Thousand-Rose Planetary Aegis | First Empowered Trap trigger per enemy per enemy turn: allies it hit Shield 12%; +90% Health; +60% Defense | flare-weaken .2 + guard-shield .6 | Verbatim | Maximum Health +18%. Defense +12%. The first time each enemy triggers an Empowered Thorn Trap in an enemy phase, each ally that enemy hit gains a Shield equal to 12% of their own maximum Health. |
| `master-thornia-3` | Shadow Rose Sovereign Foundry | Trapped enemies −15% damage to her allies; trigger: Thornia +20% Skill Power next Skill; +45% Skill Power; +35% Gauge Gain | guard-team-shield .6 + shelter .12 | Verbatim | Skill Power +45%. Gauge Gain +35%. Enemies carrying Thornia's Thorn Trap deal 15% less direct damage to her allies. When an enemy triggers it, Thornia gains +20% Skill Power on her next skill. |
| `master-crinso-1` | Twin-Rose Singularity Drive | Each Combo spent by Blossoming Cataclysm: others +15% Crit Mult next (cap 60%); +75% Crit Mult; +50% Gauge Capacity | burn-power .3 + execution .4 | Adapt (O1, O2) | Normal Attacks, skills and Convergent Light deal 18.75% more direct damage. Luminosity capacity +50% above the Convergent Light cost. Each Combo Blossoming Cataclysm spends gives each other living ally's next damaging action 3.75% more direct damage, up to 15%. |
| `master-crinso-2` | Duality Planet Flamewheel | Golden Edge right after Crimson Rupture: lowest ally Shield 12%; +55% Defense; +45% Skill Eff | shielded .35 + normal-splash .3 | Verbatim | Defense +11%. Skill Efficiency +45%. Golden Edge used right after Crimson Rupture gives the living ally with the lowest Health percentage a Shield equal to 12% of their maximum Health. |
| `master-crinso-3` | Crimson Beauty Pyre Requiem | Gaining Combo heals lowest ally 8% (all allies at 3+ Combo); +65% Skill Power; +45% Skill Eff | flare .25 + leech .12 | Verbatim | Skill Power +65%. Skill Efficiency +45%. When Crinso gains Combo, heal the living ally with the lowest Health percentage 8% of their maximum Health; at 3 or more Combo, heal every living ally instead. |
| `master-nerithe-1` | Shoreless Meridian Worldchart | Others' damaging Skills ignore 10% Defense per Survey (cap 40%), no spend; +75% Direct Attack; +50% Gauge Capacity | normal-expose .18 + team-charge 3 | Adapt (O2) | Attack +15%. Luminosity capacity +50% above the Convergent Light cost. Other allies' damaging skills ignore 10% of the Surveyed enemy's Defense per Survey, without spending it (C14). |
| `master-nerithe-2` | Folded Ocean Planetarium | Fold the Sea moves Survey: others +40% Skill Power next damaging Skill vs it; +55% Skill Power; +55% Defense | flare-team-charge 8 + normal-reduction .15 | Verbatim | Skill Power +55%. Defense +11%. When Fold the Sea moves Survey to a different enemy, each other living ally gains +40% Skill Power on their next damaging skill on that enemy. |
| `master-nerithe-3` | Abyssal Surveyor Crown | Each Survey spent by Ocean Beyond the Map: each ally 4% Gauge (cap 20%) | flare .3 + kill-charge 12 | Term swap | Each Survey spent by Ocean Beyond the Map grants each living ally 4 Luminosity. |
| `master-orvella-1` | Throne Beneath the World | Citadel strike uses full Foundation, leaves 40%; others +20% Skill Eff next Skill; +110% Health; +40% Gauge Capacity | normal-shield .6 + guard-team-shield .4 | Adapt (O2, O8) | Maximum Health +22%. Luminosity capacity +40% above the Convergent Light cost. Worldweight Citadel's new Foundation also keeps 40% of the spent Foundation's durability, and each other living ally gains +20% Skill Efficiency on their next skill. |
| `master-orvella-2` | Deep Foundation Planetpress | Store 40% of Foundation-absorbed durability; next turn split among injured (cap 12%); squad +55% Health, +35% Skill Power | guard-heal .4 + hurt-heal .3 | Verbatim | While Orvella lives, every squad member has maximum Health +11% and Skill Power +35%. 40% of the damage the Foundation absorbs is stored; at the next turn it heals injured living allies, split equally, up to 12% of each one's maximum Health. |
| `master-orvella-3` | Keystone Sovereign Counterweight | Foundation-protected allies +25% Defense; Keystone Reversal repair +50% Skill Power; +35% Health; +15% Skill Eff | defense .35 + shielded .25 | Verbatim | Maximum Health +7%. Skill Efficiency +15%. While the Foundation has durability, allies have Defense Up +25%. Keystone Reversal's repair gains +50% Skill Power. |
| `master-vaelor-1` | Final Chord Celestial Resonator | Last Chord: others +30% Skill Power next Skill (+60% on Crescendo); +35% Skill Power; +105% Direct Attack | hurt-charge 8 + flare .3 | Verbatim | Skill Power +35%. Attack +21%. Last Chord of the Sky gives each other living ally +30% Skill Power on their next skill (+60% on Crescendo). |
| `master-vaelor-2` | Thunder Choir Planetary Fugue | On Rise, Resonance Cascade's Attack buff to every ally, +20% Gauge Gain same duration; +90% Direct Attack; +30% Skill Eff | cooperation .3 + flare-weaken .18 | Verbatim | Attack +18%. Skill Efficiency +30%. On Rise, Resonance Cascade's Attack Up goes to every living ally, who also gain Luminosity Gain Up +20% for the same duration. |
| `master-vaelor-3` | Broken Sky Imperial Metronome | Tune Normal Attack: others +25% Crit next; Crescendo: +40% Crit Mult; +30% Crit; +45% Gauge Gain | team-charge 4 + next-buff .15 | Adapt (O1) | Normal Attacks, skills and Convergent Light deal 15% more direct damage. Gauge Gain +45%. On Tune, Vaelor's Normal Attack gives each other living ally's next damaging action 12.5% more direct damage; on Crescendo, 10%. |
| `master-caldrex-1` | Banked-Sun Pressure Accumulator | Max Heat 5; +12% Defense per Heat; +60% Health; +50% Defense | defense .35 + burning .25 | Verbatim | Maximum Health +12%. Defense +10%. Maximum Heat becomes 5. Caldrex has Defense Up +12% per stored Heat. |
| `master-caldrex-2` | Counterstroke Recoil Foundry | Taunted enemy damages him: retaliate 90% Direct Attack, can crit; +50% Health; +40% Direct Attack; +25 points Skill Power | reflect .6 + hurt-charge 5 | Adapt (O1, O8) | Maximum Health +10%. Attack +8%. Skill Power +25%. When an enemy's direct attack damages Caldrex's Health or Shield, he strikes that enemy for 90% of his Attack. |
| `master-caldrex-3` | Cinderpulse Triage Converter | Ally ability Burn tick: squad heals 8%, once per enemy turn; +75% Health; +30 points Skill Power | burn-heal .25 + round-team-heal .1 | Verbatim | Maximum Health +15%. Skill Power +30%. Once per enemy phase while Caldrex lives, when Burn from an ally's ability damages an enemy, heal every living squad member 8% of their maximum Health. |
| `master-solenne-1` | Stillpoint Inertial Governor | Held Stillness 20% to 35% per charge; +50% Health; +75% Defense | guard .2 + shelter .15 | Verbatim | Maximum Health +10%. Defense +15%. Each Stillness reduces a hit by 35% instead of 20%. |
| `master-solenne-2` | Quiet-Arc Shelter Projector | After Skill or Last Flare: lowest ally extra Shield 20%; +75% Health; +25 points Skill Power | flare-shield .08 + round-shield .5 | Verbatim | Maximum Health +15%. Skill Power +25%. After Solenne uses a skill, the living ally with the lowest Health percentage gains a Shield equal to 20% of their maximum Health. |
| `master-solenne-3` | Cadence Differential Drive | Hit spends Stillness: squad 7% Gauge, once per enemy turn; Last Reverberation: others 3% per Stillness; +40% Health; +30 points Skill Power; +15 points Skill Eff | absorbed-charge 8 + flare-team-charge 6 | Term swap | Maximum Health +8%. Skill Power +30%. Skill Efficiency +15%. Once per enemy phase, when an enemy hit spends Stillness, each living squad member gains 7 Luminosity. When The Last Reverberation spends Stillness, each other living ally gains 3 Luminosity per Stillness. |
| `master-myrthen-1` | Seasonwheel Harvest Transmission | Harvest 35% to 75%; after Harvest return to Bloom; +60% Direct Attack; +35 points Skill Power | execution .45 + normal .25 | Verbatim | Attack +12%. Skill Power +35%. Harvest's bonus damage becomes 75% instead of 35%; after Harvest is spent, the Season returns to Bloom instead of Sprout. |
| `master-myrthen-2` | Seedtrace Pursuit Distributor | After Skill/Last Flare 10% chance to enter Harvest; All That Ripens 5% chance to cost 15% max Health instead of Gauge; +45% Direct Attack; +25 points Crit | normal-charge 5 + wounded .3 | Adapt (O1, O11) | Attack +9%. Normal Attacks, skills and Convergent Light deal 12.5% more direct damage. After Myrthen uses a skill, 10% chance to enter Harvest. All That Ripens has a 5% chance to cost 15% of her maximum Health instead of Luminosity (she still needs the Luminosity; if the Health cost would defeat her, it costs Luminosity). |
| `master-myrthen-3` | Reaping-Tide Recovery Dynamo | Myrthen's direct defeat: squad heals 6%, 5% Gauge, once per round; +40% Direct Attack; +50% Health; +20 points Skill Power | kill-heal .08 + kill-charge 12 | Term swap | Attack +8%. Maximum Health +10%. Skill Power +20%. Once per round, when Myrthen's action directly defeats an enemy, each living squad member heals 6% of their maximum Health and gains 5 Luminosity. |
| `master-neralis-1` | Amber-Station Return Manifold | Max Current 4; Carry Them Back 6% to 9% per Current; +60% Health; +35% Skill Power | heal-shield .6 + recovery .25 | Verbatim | Maximum Health +12%. Skill Power +35%. Maximum Current becomes 4. Carry Them Back heals 9% instead of 6% per Current spent. |
| `master-neralis-2` | Blackwing Crossing Stabilizer | After Light the Next Station: target Shield 20% max Health ×Skill Power; +50% Health; +60% Defense | guard-team-shield .5 + heal-charge 5 | Verbatim | Maximum Health +10%. Defense +12%. After Light the Next Station, its target gains a Shield equal to 20% of their maximum Health, scaled by Neralis's Skill Power. |
| `master-neralis-3` | Weirheart Recollection Dynamo | Native heal on ally below 50%: that ally 10% Gauge, once per round per ally; +40% Health; +40% Direct Attack; +25% Skill Power | heal-team-charge 4 + hurt-heal .3 | Term swap | Maximum Health +8%. Attack +8%. Skill Power +25%. Once per round per ally, when Neralis's skill heals an ally who was below 50% Health, that ally gains 10 Luminosity (not from the Support role heal or Conduits). |
| `master-varkhel-1` | Faultstar Chain Accumulator | Max Tension 5; +10% Defense per Tension; +70% Health; +50% Defense | hurt-shield .08 + burn-power .3 | Verbatim | Maximum Health +14%. Defense +10%. Maximum Tension becomes 5. Varkhel has Defense Up +10% per stored Tension. |
| `master-varkhel-2` | Scarlet-Hinge Load Distributor | After Set the Warning Chain: others Shield 16% ×Skill Power; +50% Health; +35% Skill Power | reflect .5 + shielded .3 | Verbatim | Maximum Health +10%. Skill Power +35%. After Set the Warning Chain, each other living squad member gains a Shield equal to 16% of their maximum Health, scaled by Varkhel's Skill Power. |
| `master-varkhel-3` | Recoil-Star Compression Turbine | Return the Strain ignore 20% to 35%; 3+ Tension: 15% own Gauge after cost; +50% Health; +45% Direct Attack | guard-team-shield .5 + wounded .3 | Term swap | Maximum Health +10%. Attack +9%. Return the Strain ignores 35% of Defense instead of 20%. When it spends at least 3 Tension, Varkhel gains 15 Luminosity after its cost. |
| `master-seravelle-1` | Ashroad Cadence Transmission | Max Cadence 4; Move as One 30% to 40%; +50% Health; +35% Skill Power | normal-heal .45 + flare-team-charge 6 | Verbatim | Maximum Health +10%. Skill Power +35%. Maximum Cadence becomes 4. Move as One grants Attack Up +40% instead of +30% before Cadence. |
| `master-seravelle-2` | Convoy-Flame Distribution Crown | Allied native Burn tick: others 5% Gauge, once per enemy phase; +45% Direct Attack; +30% Skill Power | heal-buff .2 + round-charge 4 | Term swap | Attack +9%. Skill Power +30%. Once per enemy phase while Seravelle lives, when Burn from an ally's ability damages an enemy, each other living squad member gains 5 Luminosity. |
| `master-seravelle-3` | Braided-Signal Continuance Engine | After The Road Belongs to Everyone: squad Shield 22% ×Skill Power; +60% Health; +40% Defense | heal-team-charge 4 + shelter .12 | Verbatim | Maximum Health +12%. Defense +8%. After The Road Belongs to Everyone, each living squad member gains a Shield equal to 22% of their maximum Health, scaled by Seravelle's Skill Power. |
| `master-velmira-1` | Twin-Edge Sequence Orrery | Max Crosscut 4; first ordinary Skill each encounter +1 Crosscut; +60% Direct Attack; +30% Skill Power | weakened .4 + normal-charge 4 | Verbatim | Attack +12%. Skill Power +30%. Maximum Crosscut becomes 4. Velmira's first Skill 1 or Skill 2 each encounter adds 1 Crosscut after it resolves. |
| `master-velmira-2` | Goldseam Precision Fracturer | Open the Seam +35% vs Weakened; Turn the Other Edge ignore 20% to 35%; +45% Direct Attack; +25% Crit | normal-splash .3 + normal-weaken .18 | Adapt (O1) | Attack +9%. Normal Attacks, skills and Convergent Light deal 12.5% more direct damage. Open the Seam deals 35% more damage to a Weakened enemy. Turn the Other Edge ignores 35% of Defense instead of 20% at 2 or more Crosscut. |
| `master-velmira-3` | Open-Threshold Return Drive | Leave the Doorway spends 3+ Crosscut: 25% own Gauge after cost, heal 18%; Recovery applies; +50% Health; +35% Direct Attack; +20% Skill Power | kill-charge 12 + leech .1 | Term swap | Maximum Health +10%. Attack +7%. Skill Power +20%. When Leave the Doorway Standing spends at least 3 Crosscut, Velmira gains 25 Luminosity after its cost and heals 18% of her maximum Health. |
| `master-ozriel-1` | Refusal Sovereign Heartdrive | Refusal saves a member: also Shield 20%; +75% Health; +65% Defense | hurt-shield .1 + brace .15 | Verbatim | Maximum Health +15%. Defense +13%. When Refusal keeps an ally at 1 Health, that ally also gains a Shield equal to 20% of their maximum Health. |
| `master-ozriel-2` | Absolution Planetary Suppressor | Pane of Absolution also Weakens every other enemy 25% to end of next enemy turn; +55% Defense; +45% Skill Power | flare-weaken .25 + shielding .3 | Verbatim | Defense +11%. Skill Power +45%. Pane of Absolution also Weakens every other living enemy by 25% through the next enemy phase. |
| `master-ozriel-3` | Unfallen Continuum Worldengine | The World Refuses restores Refusal for members who used it; +55% Health; +45% Skill Eff | break-heal .5 + round-charge 5 | Verbatim | Maximum Health +11%. Skill Efficiency +45%. The World Refuses restores Refusal for every living ally who already used it this encounter. |
| `master-ilvaris-1` | Unsung Verse Harmonic Supercharger | Unwritten Verse adds 2 Marks (max 5); +45% Skill Power; +45% Skill Eff | heal-buff .25 + flare-weaken .15 | Verbatim | Skill Power +45%. Skill Efficiency +45%. Unwritten Verse adds 2 Fate-seared Marks instead of 1. |
| `master-ilvaris-2` | Hymnwind Imperial Turbine | Hymn of Broken Glass also gives squad 8% Gauge; +65% Health; +45% Skill Eff | flare-team-charge 10 + round-team-heal .1 | Term swap | Maximum Health +13%. Skill Efficiency +45%. Glasschoir Hymn also grants each living squad member 8 Luminosity. |
| `master-ilvaris-3` | Severed Prophecy Chronodrive | Tomorrow, Unwritten adds 1 Mark to every enemy (max 5); +55% Skill Power; +55% Gauge Gain | normal-expose .18 + heal-charge 5 | Verbatim; Ambiguous (O9) | Skill Power +55%. Gauge Gain +55%. Tomorrow, Unwritten adds 1 more Fate-seared Mark to every living enemy (3 instead of 2). |
| `master-kaelith-1` | Glass Meridian Singularity Harvester | Glass Meridian consuming 3 Incisions ignores 40% Defense; +55% Skill Power; +45% Direct Attack | exposed .4 + pierce .25 | Verbatim | Skill Power +55%. Attack +9%. Glass Meridian ignores 40% of the target's Defense when it consumes 3 Incisions. |
| `master-kaelith-2` | Thousand-Fault Rupture Accelerator | Shatterfall +1 Incision per enemy (max 3); +40% Skill Eff; +30% Crit | normal-expose .2 + kill-charge 12 | Adapt (O1) | Skill Efficiency +40%. Normal Attacks, skills and Convergent Light deal 15% more direct damage. Shatterfall adds 1 extra Incision to every enemy it damages. |
| `master-kaelith-3` | Denied Fate Eclipse Annihilator | Denial of Fate sets every damaged enemy to 3 Incisions; +45% Skill Power; +45% Gauge Gain | execution .4 + normal-weaken .2 | Verbatim | Skill Power +45%. Gauge Gain +45%. Denial of Fate sets every enemy it damages to 3 Incisions. |

**Moon bearers (18; released characters, banner and event still inactive)**

| ID | Name | Pre-Radiant effect | Current | Class | Restore as |
|---|---|---|---|---|---|
| `master-maerion-1` | Unreturned Voyage Worldpump | Unreturned capacity 85% max Health; Shield absorption counts; +75% Health; +25 points Skill Power | absorbed-charge 8 + healing .25 | Verbatim | Maximum Health +15%. Skill Power +25%. Unreturned can store up to 85% of Maerion's maximum Health instead of 45%; damage Shields absorb from direct enemy hits also counts. |
| `master-maerion-2` | Crescent Rib Mercy Foundry | A Place on the Ferry overheal becomes Shield (cap 35%); +50% Health; +35 points Skill Power | heal-shield .6 + flare-heal .35 | Verbatim | Maximum Health +10%. Skill Power +35%. Overhealing from A Place on the Ferry becomes a Shield for its target, up to 35% of that ally's maximum Health. |
| `master-maerion-3` | Ferrywake Remembrance Dynamo | Heal from below 50% to 50%+: 15 Gauge, once per ally per turn; +40% Health; +20 points Skill Eff | heal-charge 6 + normal-heal .25 | Term swap | Maximum Health +8%. Skill Efficiency +20%. Once per ally per turn, when Maerion's skill heals an ally from below 50% to at least 50% Health, that ally gains 15 Luminosity. |
| `master-caevren-1` | Meridian Counterweight Atlas | Max Load 5; +10% Defense per Load; +60% Health; +60% Defense | defense .4 + hurt-charge 6 | Verbatim | Maximum Health +12%. Defense +12%. Maximum Load becomes 5. Caevren has Defense Up +10% per stored Load. |
| `master-caevren-2` | Observatory Loadshare Regulator | Counterweight Covenant Shield and redirection 30% to 55%; +75% Health; +25 points Skill Power | shielding .4 + brace .15 | Verbatim | Maximum Health +15%. Skill Power +25%. Counterweight Covenant's Shield becomes 55% of maximum Health and its Cover redirects 55% instead of 30%. |
| `master-caevren-3` | Falling-Star Recoil Turbine | Direct attack damages him: 100% Direct Attack to attacker, once per enemy phase, can crit; +50% Defense; +40% Direct Attack | reflect .6 + normal-shield .5 | Adapt (O1) | Defense +10%. Attack +8%. Once per enemy phase, after an enemy's direct attack (redirected damage included) damages Caevren's Health or Shield, he strikes that enemy for 100% of his Attack. |
| `master-vespera-1` | Whitefire Procession Transmitter | Max Beacon 4; Keep the Last Beacon Signal 35% to 50%; +50% Health; +30 points Skill Power | next-buff .2 + flare .25 | Adapt (O8) | Maximum Health +10%. Skill Power +30%. Signal from Keep the Last Beacon grants +50% instead of +35%. |
| `master-vespera-2` | Mirror-Pennant Ignition Crown | Burn +30%; ally spends Signal on her Burned enemy: ignore 15% Defense; +40% Direct Attack; +30 points Skill Power | burn-power .4 + pierce .15 | Verbatim | Attack +8%. Skill Power +30%. Burn from Vespera deals 30% more damage. When another ally spends Signal on an enemy carrying Vespera's Burn, that attack ignores 15% of its Defense. |
| `master-vespera-3` | Unextinguished Relay Cathedral | Ally spends Signal: 10 Gauge after, once per turn; +60% Health; +20 points Skill Eff | team-charge 3 + burning .3 | Term swap | Maximum Health +12%. Skill Efficiency +20%. Once per turn, when another ally spends Vespera's Signal, that ally gains 10 Luminosity after the attack resolves. |
| `master-ilyss-1` | Crescent-Link Severance Loom | Max Severance 4; Last Flare 10% to 13% per Severance; +50% Health; +35 points Skill Power | healing .35 + flare-team-charge 6 | Verbatim | Maximum Health +10%. Skill Power +35%. Maximum Severance becomes 4. No Promise of Resurrection heals 13% instead of 10% per Severance spent. |
| `master-ilyss-2` | Unbinding Mercy Worldlock | Removes Burn or Weaken: Shield 15%, once per ally per turn; +75% Health; +20 points Skill Power | heal-shield .6 + resilience .3 | Term swap | Maximum Health +15%. Skill Power +20%. Once per ally per turn, when Ilyss removes Weaken from an ally, that ally gains a Shield equal to 15% of their maximum Health. |
| `master-ilyss-3` | Broken-Link Continuance Engine | Unbind the Living removes a debuff: +25 points Skill Power 2 turns; +40% Health; +20 points Skill Eff | heal-buff .2 + guard-heal .3 | Verbatim | Maximum Health +8%. Skill Efficiency +20%. After Unbind the Living removes Weaken, its target gains +25% Skill Power for 2 turns (refreshes, does not stack). |
| `master-asteriel-1` | Moonflower Seedworld Orrery | Max Promise 4; +5 points Skill Power per Promise; +60% Health; +30 points Skill Power | healing .3 + heal-buff .18 | Verbatim | Maximum Health +12%. Skill Power +30%, plus +5% per stored Promise. Maximum Promise becomes 4. |
| `master-asteriel-2` | Night-Library Germination Vault | Enters Shelter: lowest ally heals 20%, once per turn; +75% Health; +25 points Skill Power | guard-heal .4 + round-shield .5 | Verbatim | Maximum Health +15%. Skill Power +25%. Once per turn, after Asteriel enters Shelter, heal the living ally with the lowest Health percentage 20% of their maximum Health. |
| `master-asteriel-3` | Freely-Given Starseed Distributor | Ally spends Moonflower: 8 Gauge, once per turn; +40% Health; +20 points Skill Eff | heal-team-charge 4 + normal-charge 3 | Adapt (O8) | Maximum Health +8%. Skill Efficiency +20%. Once per turn, when another ally holding Attack Up from Asteriel uses a damaging action, that ally gains 8 Luminosity after it resolves. |
| `master-serapha-1` | Open-Arc Sanctuary Regulator | Max Interval 4; Last Flare +5% heal per Interval; +60% Health; +35 points Skill Power | flare-heal .4 + guard-team-shield .4 | Verbatim | Maximum Health +12%. Skill Power +35%. Maximum Interval becomes 4. Let Them Leave Alive also heals 5% more per Interval spent. |
| `master-serapha-2` | Articulated Mercy Fanforge | Ceasefire reduces a hit: heal holder 12%, once per ally per enemy phase; +50% Health; +40% Defense | shelter .15 + hurt-heal .4 | Adapt (O8) | Maximum Health +10%. Defense +8%. Once per ally per enemy phase, after Damage Reduction from Serapha reduces an enemy direct hit, heal that ally 12% of their maximum Health. |
| `master-serapha-3` | Unstruck Verdict Concordance | Her Weakened enemy attacks: lowest ally 10 Gauge, once per enemy phase; +40% Health; +20 points Skill Eff | normal-weaken .18 + round-charge 4 | Term swap | Maximum Health +8%. Skill Efficiency +20%. Once per enemy phase, when an enemy carrying Serapha's Weaken makes a direct attack, the living ally with the lowest Health percentage gains 10 Luminosity. |

**Old Masters not live (18; open question O7, nothing deleted).** Sunshade
bearers are unreleased (`release-visibility.ts`) and have no Radiant kit:
`master-rhaziel-1..3`, `master-oryn-1..3`, `master-thessara-1..3`,
`master-elaris-1..3`, `master-veyr-1..3`, `master-aureth-1..3`. Their old text
stays in catalog §2.6b for a later batch.

## Engine gap list for 4c

| # | Hook | Where | Size |
|---|---|---|---|
| G1 | Gear Skill Power / Skill Efficiency / Skill Duration / Gauge Gain primitive kinds feeding Skill stats | `combat-engine.ts:298-313` (`radiantLoadoutSkillStats`, `radiantSkillStats`, `gaugeGain`); `combat-gauge.ts:77-90` | Medium |
| G2 | Slot and trait filters (Skill 1, Skill 2, Convergent Light; damaging, all enemies, heal/Shield, debuff, support); split `skillUse` by `action.slot` | `combat-engine.ts:1883` (`skillUse`), `:1666`, `:1517-1600` (`cast`); `radiant-kits.ts` | Medium |
| G3 | All-direct-damage bonus kind (Worldbreaker, C9 conversions) in the additive damage layer, Normal Attack path included | `combat-engine.ts:1564-1568` | Small |
| G4 | Luminosity capacity above the Convergent Light cost (C8); gauge UI | `combat-gauge.ts:44-70` (`personalChargeMaximum`, `validateRadiantGauge`) | Medium |
| G5 | Squad stat auras per living wearer, dynamic stats (Clearwater, Ruinselect, Pyre Census, Glassroot, Lone Apostate, Starvein, Heartcase) with Health clamp on change | `combat-engine.ts:272-286` (`effectiveRadiantStats`); `combat-kits.ts` `resolveRadiantStarterStats` | Medium |
| G6 | Raise primitive limit and per-primitive "fixed" flag for rank exclusions (C12) | `conduit-effects.ts:22-27, 148-153` | Small |
| G7 | Next-action token system (C17) incl. timed ally Skill Power buffs (Paradox Spindle, Choir-Array, `master-ilyss-3`) | new state on bearers (`combat-engine.ts` ~95-125), validation ~611 | Large |
| G8 | Enemy "less Defense" and holder-conditional Defense ignore, shared 80% cap (C14) | `combat-engine.ts:1830` (`gearDefense`) | Medium |
| G9 | Shield damage reduction, combined 80% cap (C15) | `combat-engine.ts:804-861` (`packet`) | Small |
| G10 | Revive once per encounter (Phoenix Reactor, `master-sprout-3`), shared rescue ledger; defeated member returns to gauge | defeat handling; `combat-gauge.ts` `actor()` living flag | Large |
| G11 | Accord fatal-hit save (reuse the Refusal path; built in B3c) | `combat-engine.ts` `packet()` (was 828-837) | Medium |
| G12 | Extra Skill 1/2 after Convergent Light (Throne of Borrowed Tomorrows); action UI | `combat-engine.ts:2089` (`state.acted`) | Large |
| G13 | Taunt-all override of enemy targeting (Atlas Bastion) | `enemy-pressure.ts:68` | Medium |
| G14 | Burn bonus stacking per source and Burn transfer on defeat | `combat-engine.ts:898-913` (`applyCategory` keeps one Burn entry) | Medium |
| G15 | Overheal amount on heal events (Worldtree Heart, `master-maerion-2`) | `combat-engine.ts:867-881` (`heal`) | Small |
| G16 | New triggers: enemy-attack on Weakened/trapped enemies, Burn tick, Cover redirect, signature spend/gain, mark placed | `combat-engine.ts:1855-2045` (`processRadiantGear`) | Medium |
| G17 | Separate `conduit` RNG stream (O11) in encounter state and replay | `combat-engine.ts:915` (`rollCharge`/`chargeSeed` pattern) | Medium |
| G18 | About 70 bespoke Master kit clauses (signature caps, coefficients, target change, Shields after named skills) | `combat-engine.ts:400-410` (`radiantSignatureCaps`, `radiantPassiveValues`), `signatureClauses`; `combat-kits.ts:275-310` (`masterDesigns`, `radiantMasters`) | Large |
| G19 | Nightglass mark state on enemies | enemy state, `combat-engine.ts` ~121 | Small |
| G20 | Distinct-design test rewrite (O6) | `combat-consolidation.test.ts:247-257` | Small |
| G21 | Tooltip text for every new kind; kit and Master text tests | `conduit-effect-text.ts:9-73` | Medium |
| G22 | D-492 contribution attribution for the new kinds | `attribute()` in `cast()`, `battle-conduit-contribution.ts` | Medium |
| G23 | Pressure study re-run against `radiant-trio-v1` (O4) | `tools/run_pressure_study.mjs --retune` | Medium |
| G24 | Authority bundle and `game-operation` deploy (settle replay must match) | `tools/bundle_server_game.mjs` | Small (process) |

## Summary counts

| Batch | Rows | Verbatim | Term swap | Adapt | Ambiguous (also counted in a class) |
|---|---|---|---|---|---|
| B1 Common + Rare | 25 | 12 | 5 | 8 | 0 |
| B2 Legendary | 15 | 9 | 2 | 4 | 0 |
| B3 Omnic | 45 | 18 | 5 | 22 | 0 |
| B4 Calamitic | 14 | 9 | 1 | 4 | 2 |
| B5 Masters (live) | 96 | 57 | 15 | 24 | 2 |
| **Total** | **195** | **105** | **28** | **62** | **4** |

Not counted: 18 unmatched Sunshade Masters (O7).
